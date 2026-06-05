import { getSql, searchSkills } from "./registry.js";
import { CURRENT_PUBLISHER_TERMS_VERSION } from "./publisher-terms.js";

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

export type CommissionRuleRecord = {
  id: string;
  name: string;
  platformFeeBps: number;
  publisherShareBps: number;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  isActive: boolean;
};

type PublisherProfile = {
  id: string;
  organization_id: string;
  display_name: string;
  status: "pending" | "active" | "restricted" | "suspended";
  payout_status: "not_configured" | "verification_required" | "verified" | "blocked";
  terms_accepted_at: string | null;
  terms_version: string | null;
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
  const requiresPaidActivation = status === "active" && billingModel !== "free";
  const publisher = requiresPaidActivation
    ? await findPublisherProfile(sql, skill.organization_id)
    : await ensurePublisherProfile(sql, skill.organization_id);

  if (requiresPaidActivation) {
    assertPaidActivationReady(skill, publisher);
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
    publisherProfileId: publisher?.id ?? null,
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

export async function listCommissionRules(limit = 30): Promise<CommissionRuleRecord[]> {
  const sql = await getSql();

  if (!sql) {
    return [demoCommissionRule()];
  }

  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  return (await sql`
    select
      id::text,
      name,
      platform_fee_bps as "platformFeeBps",
      publisher_share_bps as "publisherShareBps",
      starts_at::text as "startsAt",
      ends_at::text as "endsAt",
      created_at::text as "createdAt",
      (starts_at <= now() and (ends_at is null or ends_at > now())) as "isActive"
    from commission_rules
    order by starts_at desc, created_at desc
    limit ${safeLimit}
  `) as CommissionRuleRecord[];
}

export async function createCommissionRule(
  input: Record<string, unknown>,
  actorUserId?: string | null
): Promise<CommissionRuleRecord> {
  const sql = await requireSql();
  const name = normalizeRequiredText(readInput(input, "name"), "name", 120);
  const platformFeeBps = normalizeBasisPoints(readInput(input, "platformFeeBps", "platform_fee_bps"), "platformFeeBps");
  const publisherShareInput = readInput(input, "publisherShareBps", "publisher_share_bps");
  const publisherShareBps =
    isBlankValue(publisherShareInput) ? 10000 - platformFeeBps : normalizeBasisPoints(publisherShareInput, "publisherShareBps");
  const startsAt = normalizeTimestamp(readInput(input, "startsAt", "starts_at"), new Date(), "startsAt");
  const endsAt = normalizeOptionalTimestamp(readInput(input, "endsAt", "ends_at"), "endsAt");
  const reason = normalizeOptionalText(readInput(input, "reason"), 600) ?? `Commission rule scheduled: ${name}`;

  if (platformFeeBps + publisherShareBps !== 10000) {
    throw new Error("platformFeeBps and publisherShareBps must total 10000.");
  }

  if (endsAt && endsAt.getTime() <= startsAt.getTime()) {
    throw new Error("endsAt must be later than startsAt.");
  }

  const startsAtIso = startsAt.toISOString();
  const endsAtIso = endsAt?.toISOString() ?? null;

  return sql.begin(async (tx: Sql) => {
    const duplicateStarts = (await tx`
      select id::text
      from commission_rules
      where starts_at = ${startsAtIso}::timestamptz
      limit 1
    `) as Array<{ id: string }>;

    if (duplicateStarts[0]) {
      throw new Error("A commission rule already starts at this timestamp.");
    }

    const nextRows = (await tx`
      select starts_at::text as "startsAt"
      from commission_rules
      where starts_at > ${startsAtIso}::timestamptz
      order by starts_at asc
      limit 1
      for update
    `) as Array<{ startsAt: string }>;
    const nextStartsAt = nextRows[0]?.startsAt ?? null;

    if (endsAt && nextStartsAt && new Date(nextStartsAt).getTime() < endsAt.getTime()) {
      throw new Error("endsAt overlaps a later scheduled commission rule.");
    }

    const previousRows = (await tx`
      select
        id::text,
        name,
        platform_fee_bps as "platformFeeBps",
        publisher_share_bps as "publisherShareBps",
        starts_at::text as "startsAt",
        ends_at::text as "endsAt",
        created_at::text as "createdAt",
        (starts_at <= now() and (ends_at is null or ends_at > now())) as "isActive"
      from commission_rules
      where starts_at <= ${startsAtIso}::timestamptz
        and (ends_at is null or ends_at > ${startsAtIso}::timestamptz)
      order by starts_at desc
      limit 1
      for update
    `) as CommissionRuleRecord[];

    await tx`
      update commission_rules
      set ends_at = ${startsAtIso}::timestamptz
      where starts_at < ${startsAtIso}::timestamptz
        and (ends_at is null or ends_at > ${startsAtIso}::timestamptz)
    `;

    const rows = (await tx`
      insert into commission_rules (
        name,
        platform_fee_bps,
        publisher_share_bps,
        starts_at,
        ends_at
      )
      values (
        ${name},
        ${platformFeeBps},
        ${publisherShareBps},
        ${startsAtIso}::timestamptz,
        ${endsAtIso ?? nextStartsAt}
      )
      returning
        id::text,
        name,
        platform_fee_bps as "platformFeeBps",
        publisher_share_bps as "publisherShareBps",
        starts_at::text as "startsAt",
        ends_at::text as "endsAt",
        created_at::text as "createdAt",
        (starts_at <= now() and (ends_at is null or ends_at > now())) as "isActive"
    `) as CommissionRuleRecord[];
    const rule = rows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        'finance.commission_rule.created',
        'commission_rule',
        ${rule.id},
        ${reason},
        ${tx.json({
          next: rule,
          previous: previousRows[0] ?? null
        })}
      )
    `;

    await tx`
      insert into notification_events (event_type, channel, subject, payload, status)
      values (
        'finance.commission_rule.created',
        'in_app',
        'Commission rule scheduled',
        ${tx.json({
          name: rule.name,
          platformFeeBps: rule.platformFeeBps,
          publisherShareBps: rule.publisherShareBps,
          startsAt: rule.startsAt,
          endsAt: rule.endsAt
        })},
        'queued'
      )
    `;

    return rule;
  });
}

export async function getFinanceLedger() {
  const sql = await getSql();

  if (!sql) {
    return emptyLedger();
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

export async function getPublisherFinanceLedger(
  organizationId?: string | null,
  publisherProfileId?: string | null
) {
  const sql = await getSql();

  if (!sql) {
    return emptyLedger();
  }

  const scopedOrganizationId = organizationId ?? null;
  const scopedPublisherProfileId = publisherProfileId ?? null;

  const [summaryRows, recentTransactions, unprocessedRows] = await Promise.all([
    sql`
      select
        coalesce(sum(t.amount_cents), 0)::int as gross_cents,
        coalesce(sum(ts.platform_fee_cents), 0)::int as platform_fee_cents,
        coalesce(sum(ts.publisher_share_cents), 0)::int as publisher_share_cents,
        coalesce(sum(pb.amount_cents) filter (where pb.state = 'pending'), 0)::int as pending_balance_cents,
        coalesce(sum(pb.amount_cents) filter (where pb.state = 'available'), 0)::int as available_balance_cents
      from transaction_splits ts
      join transactions t on t.id = ts.transaction_id
      left join publisher_balances pb on pb.transaction_split_id = ts.id
      join publisher_profiles pp on pp.id = coalesce(ts.publisher_profile_id, pb.publisher_profile_id)
      where (${scopedOrganizationId}::uuid is null or pp.organization_id = ${scopedOrganizationId})
        and (${scopedPublisherProfileId}::uuid is null or pp.id = ${scopedPublisherProfileId})
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
      from transaction_splits ts
      join transactions t on t.id = ts.transaction_id
      left join skills s on s.id = t.skill_id
      left join publisher_balances pb on pb.transaction_split_id = ts.id
      join publisher_profiles pp on pp.id = coalesce(ts.publisher_profile_id, pb.publisher_profile_id)
      where (${scopedOrganizationId}::uuid is null or pp.organization_id = ${scopedOrganizationId})
        and (${scopedPublisherProfileId}::uuid is null or pp.id = ${scopedPublisherProfileId})
      order by t.created_at desc
      limit 50
    `,
    sql`
      select count(*)::int as count
      from usage_events ue
      join skills s on s.id = ue.skill_id
      left join publisher_profiles pp on pp.organization_id = s.organization_id
      where ue.billable = true
        and ue.amount_cents > 0
        and ue.transaction_id is null
        and (${scopedOrganizationId}::uuid is null or s.organization_id = ${scopedOrganizationId})
        and (${scopedPublisherProfileId}::uuid is null or pp.id = ${scopedPublisherProfileId})
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
    select id::text, organization_id::text, verification_status
    from skills
    where slug = ${slug}
      and (${organizationId ?? null}::uuid is null or organization_id = ${organizationId ?? null})
    limit 1
  `) as Array<{ id: string; organization_id: string; verification_status: string }>;

  if (!rows[0]) {
    throw new Error(organizationId ? "Skill not found for this organization." : "Skill not found.");
  }

  return rows[0];
}

async function findPublisherProfile(sql: Sql, organizationId: string): Promise<PublisherProfile | null> {
  const rows = (await sql`
    select
      id::text,
      organization_id::text,
      display_name,
      status,
      payout_status,
      terms_accepted_at::text,
      terms_version
    from publisher_profiles
    where organization_id = ${organizationId}
    order by created_at asc
    limit 1
  `) as PublisherProfile[];

  return rows[0] ?? null;
}

async function ensurePublisherProfile(sql: Sql, organizationId: string): Promise<PublisherProfile> {
  const existing = await findPublisherProfile(sql, organizationId);

  if (existing) {
    return existing;
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
      'not_configured'
    )
    on conflict (organization_id) do update set
      display_name = excluded.display_name,
      updated_at = now()
    returning
      id::text,
      organization_id::text,
      display_name,
      status,
      payout_status,
      terms_accepted_at::text,
      terms_version
  `) as PublisherProfile[];

  return publisherRows[0];
}

function assertPaidActivationReady(
  skill: { verification_status: string },
  publisher: PublisherProfile | null
) {
  if (!publisher) {
    throw new Error("Paid active pricing requires an existing publisher profile.");
  }

  if (publisher.status !== "active") {
    throw new Error("Paid active pricing requires an active publisher profile.");
  }

  if (publisher.payout_status !== "verified") {
    throw new Error("Paid active pricing requires verified payout readiness.");
  }

  if (!publisher.terms_accepted_at || publisher.terms_version !== CURRENT_PUBLISHER_TERMS_VERSION) {
    throw new Error("Paid active pricing requires accepting the current publisher operating terms.");
  }

  if (skill.verification_status !== "verified") {
    throw new Error("Paid active pricing requires a verified skill review.");
  }
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

  const futureRows = (await sql`
    select starts_at::text as "startsAt"
    from commission_rules
    where starts_at > now()
    order by starts_at asc
    limit 1
  `) as Array<{ startsAt: string }>;

  const rows = (await sql`
    insert into commission_rules (
      name,
      platform_fee_bps,
      publisher_share_bps,
      ends_at
    )
    values (
      'Default 20/80 split',
      2000,
      8000,
      ${futureRows[0]?.startsAt ?? null}
    )
    returning id::text, platform_fee_bps, publisher_share_bps
  `) as CommissionRule[];

  return rows[0];
}

function demoCommissionRule(): CommissionRuleRecord {
  return {
    id: "demo-commission-default",
    name: "Default 20/80 split",
    platformFeeBps: 2000,
    publisherShareBps: 8000,
    startsAt: "demo",
    endsAt: null,
    createdAt: "demo",
    isActive: true
  };
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

function readInput(input: Record<string, unknown>, key: string, fallbackKey?: string) {
  return input[key] ?? (fallbackKey ? input[fallbackKey] : undefined);
}

function normalizeRequiredText(value: unknown, fieldName: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${fieldName} is required.`);
  }

  if (text.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }

  return text;
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}

function normalizeBasisPoints(value: unknown, fieldName: string) {
  if (isBlankValue(value)) {
    throw new Error(`${fieldName} is required.`);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    throw new Error(`${fieldName} must be an integer between 0 and 10000.`);
  }

  return parsed;
}

function normalizeTimestamp(value: unknown, fallback: Date, fieldName: string) {
  if (isBlankValue(value)) {
    return fallback;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO timestamp.`);
  }

  return date;
}

function normalizeOptionalTimestamp(value: unknown, fieldName: string) {
  if (isBlankValue(value)) {
    return null;
  }

  return normalizeTimestamp(value, new Date(), fieldName);
}

function isBlankValue(value: unknown) {
  return value === null || value === undefined || String(value).trim() === "";
}

function getBalanceDelayDays() {
  const raw = getProcessEnv("SKILLHUB_BALANCE_DELAY_DAYS");
  const parsed = Number(raw ?? "14");
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 14;
}

function emptyLedger() {
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

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
