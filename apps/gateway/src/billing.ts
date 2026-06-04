import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type BillingModel = "free" | "per_call" | "subscription";
type PriceStatus = "draft" | "active" | "archived";

type PriceInput = {
  billingModel?: BillingModel;
  currency?: string;
  unitAmountCents?: number;
  status?: PriceStatus;
};

type UsageEventRow = {
  id: string;
  invocation_id: string | null;
  project_id: string | null;
  skill_id: string;
  price_id: string | null;
  amount_cents: number;
  currency: string;
  organization_id: string;
  skill_name: string;
};

type CommissionRule = {
  id: string;
  platform_fee_bps: number;
  publisher_share_bps: number;
};

type PublisherProfile = {
  id: string;
  organization_id: string;
  display_name: string;
  payout_status: "not_configured" | "verification_required" | "verified" | "blocked";
};

export async function listSkillPrices(slug: string) {
  const sql = await getSql();

  if (!sql) {
    return [
      {
        id: "demo-price",
        skillSlug: slug,
        billingModel: "free",
        currency: "usd",
        unitAmountCents: 0,
        status: "active",
        createdAt: "demo"
      }
    ];
  }

  await seedRegistry();

  return sql`
    select
      sp.id::text,
      s.slug as "skillSlug",
      sp.billing_model as "billingModel",
      sp.currency,
      sp.unit_amount_cents as "unitAmountCents",
      sp.status,
      sp.created_at as "createdAt"
    from skill_prices sp
    join skills s on s.id = sp.skill_id
    where s.slug = ${slug}
    order by sp.created_at desc
  `;
}

export async function setSkillPrice(slug: string, input: PriceInput, organizationId?: string | null) {
  const sql = await requireSql();
  await seedRegistry();

  const billingModel = input.billingModel ?? "free";
  const currency = normalizeCurrency(input.currency);
  const unitAmountCents = normalizeAmount(input.unitAmountCents, billingModel);
  const status = input.status ?? "active";
  const skill = await getSkillBySlug(sql, slug, organizationId);
  const publisher = await ensurePublisherProfile(sql, skill.organization_id);

  if (status === "active" && billingModel !== "free" && publisher.payout_status !== "verified") {
    throw new Error("Paid active pricing requires a verified publisher payout state.");
  }

  if (status === "active") {
    await sql`
      update skill_prices
      set status = 'archived'
      where skill_id = ${skill.id}
        and status = 'active'
    `;
  }

  const rows = (await sql`
    insert into skill_prices (
      skill_id,
      billing_model,
      currency,
      unit_amount_cents,
      status
    )
    values (
      ${skill.id},
      ${billingModel},
      ${currency},
      ${unitAmountCents},
      ${status}
    )
    returning
      id::text,
      billing_model as "billingModel",
      currency,
      unit_amount_cents as "unitAmountCents",
      status,
      created_at as "createdAt"
  `) as Array<Record<string, unknown>>;

  return {
    skillSlug: slug,
    publisherProfileId: publisher.id,
    ...rows[0]
  };
}

export async function processBillableUsage(limit = 50) {
  const sql = await requireSql();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 250);
  const processed: Array<Record<string, unknown>> = [];

  await sql.begin(async (tx: Sql) => {
    const usageEvents = (await tx`
      select
        ue.id::text,
        ue.invocation_id::text,
        ue.project_id::text,
        ue.skill_id::text,
        ue.price_id::text,
        ue.amount_cents,
        ue.currency,
        s.organization_id::text,
        s.display_name as skill_name
      from usage_events ue
      join skills s on s.id = ue.skill_id
      where ue.billable = true
        and ue.amount_cents > 0
        and ue.transaction_id is null
      order by ue.created_at asc
      limit ${safeLimit}
      for update skip locked
    `) as UsageEventRow[];

    for (const event of usageEvents) {
      const publisher = await ensurePublisherProfile(tx, event.organization_id);
      const commissionRule = await getActiveCommissionRule(tx);
      const split = calculateSplit(event.amount_cents, commissionRule);

      const transactionRows = (await tx`
        insert into transactions (
          project_id,
          skill_id,
          price_id,
          source_type,
          amount_cents,
          currency,
          status
        )
        values (
          ${event.project_id},
          ${event.skill_id},
          ${event.price_id},
          'usage',
          ${event.amount_cents},
          ${event.currency},
          'posted'
        )
        returning id::text
      `) as Array<{ id: string }>;
      const transactionId = transactionRows[0].id;

      const splitRows = (await tx`
        insert into transaction_splits (
          transaction_id,
          commission_rule_id,
          publisher_profile_id,
          platform_fee_cents,
          publisher_share_cents,
          processing_fee_cents
        )
        values (
          ${transactionId},
          ${commissionRule.id},
          ${publisher.id},
          ${split.platformFeeCents},
          ${split.publisherShareCents},
          0
        )
        returning id::text
      `) as Array<{ id: string }>;
      const splitId = splitRows[0].id;

      await tx`
        insert into publisher_balances (
          publisher_profile_id,
          transaction_split_id,
          amount_cents,
          currency,
          state,
          available_at
        )
        values (
          ${publisher.id},
          ${splitId},
          ${split.publisherShareCents},
          ${event.currency},
          'pending',
          now() + (${getBalanceDelayDays()}::int * interval '1 day')
        )
      `;

      await tx`
        update usage_events
        set
          transaction_id = ${transactionId},
          processed_at = now()
        where id = ${event.id}
      `;

      await tx`
        insert into notification_events (organization_id, event_type, channel, subject, payload, status)
        values (
          ${event.organization_id},
          'billing.usage_posted',
          'in_app',
          'Billable usage posted to ledger',
          ${tx.json({
            usageEventId: event.id,
            transactionId,
            transactionSplitId: splitId,
            skillName: event.skill_name,
            grossCents: event.amount_cents,
            platformFeeCents: split.platformFeeCents,
            publisherShareCents: split.publisherShareCents
          })},
          'queued'
        )
      `;

      processed.push({
        usageEventId: event.id,
        transactionId,
        transactionSplitId: splitId,
        publisherProfileId: publisher.id,
        grossCents: event.amount_cents,
        platformFeeCents: split.platformFeeCents,
        publisherShareCents: split.publisherShareCents,
        currency: event.currency
      });
    }
  });

  return {
    processedCount: processed.length,
    processed
  };
}

export async function releaseAvailableBalances(limit = 100) {
  const sql = await requireSql();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);

  const rows = (await sql`
    with ready as (
      select id
      from publisher_balances
      where state = 'pending'
        and available_at <= now()
      order by available_at asc
      limit ${safeLimit}
      for update skip locked
    )
    update publisher_balances pb
    set state = 'available'
    from ready
    where pb.id = ready.id
    returning pb.id::text, pb.publisher_profile_id::text as "publisherProfileId", pb.amount_cents as "amountCents", pb.currency
  `) as Array<Record<string, unknown>>;

  return {
    releasedCount: rows.length,
    balances: rows
  };
}

export async function getFinanceLedger() {
  const sql = await getSql();

  if (!sql) {
    return {
      summary: {
        grossCents: 0,
        platformFeeCents: 0,
        publisherShareCents: 0,
        pendingBalanceCents: 0,
        availableBalanceCents: 0,
        unprocessedUsageCount: 0
      },
      recentTransactions: []
    };
  }

  const [summaryRows, recentTransactions, unprocessedRows] = await Promise.all([
    sql`
      select
        coalesce(sum(t.amount_cents), 0)::int as gross_cents,
        coalesce(sum(ts.platform_fee_cents), 0)::int as platform_fee_cents,
        coalesce(sum(ts.publisher_share_cents), 0)::int as publisher_share_cents,
        coalesce(sum(pb.amount_cents) filter (where pb.state = 'pending'), 0)::int as pending_balance_cents,
        coalesce(sum(pb.amount_cents) filter (where pb.state = 'available'), 0)::int as available_balance_cents
      from transactions t
      left join transaction_splits ts on ts.transaction_id = t.id
      left join publisher_balances pb on pb.transaction_split_id = ts.id
      where t.source_type = 'usage'
    `,
    sql`
      select
        t.id::text,
        s.slug as "skillSlug",
        s.display_name as "skillName",
        t.amount_cents as "grossCents",
        t.currency,
        t.status,
        ts.platform_fee_cents as "platformFeeCents",
        ts.publisher_share_cents as "publisherShareCents",
        pb.state as "balanceState",
        pb.available_at as "availableAt",
        t.created_at as "createdAt"
      from transactions t
      left join skills s on s.id = t.skill_id
      left join transaction_splits ts on ts.transaction_id = t.id
      left join publisher_balances pb on pb.transaction_split_id = ts.id
      order by t.created_at desc
      limit 50
    `,
    sql`
      select count(*)::int as count
      from usage_events
      where billable = true
        and amount_cents > 0
        and transaction_id is null
    `
  ]);

  const summary = summaryRows[0] ?? {};

  return {
    summary: {
      grossCents: Number(summary.gross_cents ?? 0),
      platformFeeCents: Number(summary.platform_fee_cents ?? 0),
      publisherShareCents: Number(summary.publisher_share_cents ?? 0),
      pendingBalanceCents: Number(summary.pending_balance_cents ?? 0),
      availableBalanceCents: Number(summary.available_balance_cents ?? 0),
      unprocessedUsageCount: Number(unprocessedRows[0]?.count ?? 0)
    },
    recentTransactions
  };
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for billing operations.");
  }

  return sql;
}

async function seedRegistry() {
  await searchSkills({ limit: 1 });
}

async function getSkillBySlug(sql: Sql, slug: string, organizationId?: string | null) {
  const rows = (await sql`
    select id::text, organization_id::text
    from skills
    where slug = ${slug}
      and (${organizationId ?? null}::uuid is null or organization_id = ${organizationId ?? null})
    limit 1
  `) as Array<{ id: string; organization_id: string }>;

  if (!rows[0]) {
    throw new Error(organizationId ? "Skill not found for this organization." : "Skill not found.");
  }

  return rows[0];
}

async function ensurePublisherProfile(sql: Sql, organizationId: string): Promise<PublisherProfile> {
  const existing = (await sql`
    select id::text, organization_id::text, display_name, payout_status
    from publisher_profiles
    where organization_id = ${organizationId}
    limit 1
  `) as PublisherProfile[];

  if (existing[0]) {
    return existing[0];
  }

  const organizationRows = (await sql`
    select name
    from organizations
    where id = ${organizationId}
    limit 1
  `) as Array<{ name: string }>;
  const displayName = organizationRows[0]?.name ?? "SkillHub Publisher";
  const publisherRows = (await sql`
    insert into publisher_profiles (
      organization_id,
      display_name,
      status,
      payout_status
    )
    values (
      ${organizationId},
      ${displayName},
      'active',
      'verified'
    )
    on conflict (organization_id) do update set
      display_name = excluded.display_name,
      updated_at = now()
    returning id::text, organization_id::text, display_name, payout_status
  `) as PublisherProfile[];

  const publisher = publisherRows[0];

  await sql`
    insert into payout_accounts (
      publisher_profile_id,
      provider,
      provider_account_id,
      status
    )
    values (
      ${publisher.id},
      'manual_deferred',
      ${`manual_deferred_${publisher.id}`},
      'verified'
    )
    on conflict (provider, provider_account_id) do update set
      status = excluded.status,
      updated_at = now()
  `;

  return publisher;
}

async function getActiveCommissionRule(sql: Sql): Promise<CommissionRule> {
  const existing = (await sql`
    select id::text, platform_fee_bps, publisher_share_bps
    from commission_rules
    where starts_at <= now()
      and (ends_at is null or ends_at > now())
    order by starts_at desc
    limit 1
  `) as CommissionRule[];

  if (existing[0]) {
    return existing[0];
  }

  const rows = (await sql`
    insert into commission_rules (
      name,
      platform_fee_bps,
      publisher_share_bps
    )
    values (
      'Default 20/80 split',
      2000,
      8000
    )
    returning id::text, platform_fee_bps, publisher_share_bps
  `) as CommissionRule[];

  return rows[0];
}

function calculateSplit(amountCents: number, commissionRule: CommissionRule) {
  const platformFeeCents = Math.floor((amountCents * commissionRule.platform_fee_bps) / 10000);
  const publisherShareCents = Math.max(amountCents - platformFeeCents, 0);

  return {
    platformFeeCents,
    publisherShareCents
  };
}

function normalizeCurrency(currency = "usd") {
  return currency.trim().toLowerCase() || "usd";
}

function normalizeAmount(amount: number | undefined, billingModel: BillingModel) {
  if (billingModel === "free") {
    return 0;
  }

  const value = Math.trunc(Number(amount ?? 0));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Paid pricing requires a positive unitAmountCents.");
  }

  return value;
}

function getBalanceDelayDays() {
  const raw = getProcessEnv("SKILLHUB_BALANCE_DELAY_DAYS");
  const parsed = Number(raw ?? "14");
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 14;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
