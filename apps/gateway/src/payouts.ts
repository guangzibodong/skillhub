import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PayoutAction = "approve" | "mark_paid" | "fail" | "block";
type PayoutStatus = "requested" | "review" | "processing" | "paid" | "failed" | "blocked";

type PayoutDecisionInput = {
  action?: PayoutAction;
  reason?: string;
  providerReference?: string;
};

type RequestPayoutInput = {
  publisherProfileId?: string;
  currency?: string;
};

type PublisherProfile = {
  id: string;
  organizationId: string;
  displayName: string;
  status: "pending" | "active" | "restricted" | "suspended";
  payoutStatus: "not_configured" | "verification_required" | "verified" | "blocked";
};

type PayoutAccount = {
  id: string;
  provider: string;
  providerAccountId: string;
  status: "not_configured" | "verification_required" | "verified" | "blocked";
  createdAt: string;
  updatedAt: string;
};

type AvailableBalance = {
  id: string;
  amountCents: number;
  currency: string;
};

const fallbackPayoutSummary = {
  publisherProfile: {
    id: "demo-publisher",
    displayName: "SkillHub Publisher",
    status: "active",
    payoutStatus: "verified"
  },
  balances: {
    pendingCents: 126000,
    availableCents: 482000,
    blockedCents: 0,
    paidCents: 940000,
    currency: "usd",
    minPayoutCents: getMinPayoutCents(),
    reviewThresholdCents: getPayoutReviewThresholdCents()
  },
  payoutAccounts: [
    {
      id: "demo-payout-account",
      provider: "manual_deferred",
      providerAccountId: "manual_deferred_demo",
      status: "verified",
      createdAt: "demo",
      updatedAt: "demo"
    }
  ],
  payouts: [
    {
      id: "demo-payout-review",
      publisherProfileId: "demo-publisher",
      publisherName: "SkillHub Publisher",
      amountCents: 480000,
      currency: "usd",
      status: "review",
      balanceCount: 4,
      provider: "manual_deferred",
      accountStatus: "verified",
      requestedAt: "demo",
      reviewedAt: null,
      paidAt: null,
      reviewReason: "High-value payout queued for manual review.",
      failureReason: null,
      providerReference: null
    }
  ]
};

export async function getPublisherPayoutSummary(publisherProfileId?: string) {
  const sql = await getSql();

  if (!sql) {
    return fallbackPayoutSummary;
  }

  const publisher = await getPublisherProfile(sql, publisherProfileId);

  if (!publisher) {
    return {
      ...fallbackPayoutSummary,
      publisherProfile: null,
      balances: {
        ...fallbackPayoutSummary.balances,
        pendingCents: 0,
        availableCents: 0,
        blockedCents: 0,
        paidCents: 0
      },
      payoutAccounts: [],
      payouts: []
    };
  }

  const [balanceRows, payoutAccounts, payouts] = await Promise.all([
    sql`
      select
        coalesce(sum(amount_cents) filter (where state = 'pending'), 0)::int as "pendingCents",
        coalesce(sum(amount_cents) filter (where state = 'available'), 0)::int as "availableCents",
        coalesce(sum(amount_cents) filter (where state = 'blocked'), 0)::int as "blockedCents",
        coalesce(sum(amount_cents) filter (where state = 'paid'), 0)::int as "paidCents"
      from publisher_balances
      where publisher_profile_id = ${publisher.id}
    `,
    sql`
      select
        id::text,
        provider,
        provider_account_id as "providerAccountId",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      from payout_accounts
      where publisher_profile_id = ${publisher.id}
      order by updated_at desc
    `,
    listPayoutRows(sql, 25, publisher.id)
  ]);

  return {
    publisherProfile: publisher,
    balances: {
      pendingCents: Number(balanceRows[0]?.pendingCents ?? 0),
      availableCents: Number(balanceRows[0]?.availableCents ?? 0),
      blockedCents: Number(balanceRows[0]?.blockedCents ?? 0),
      paidCents: Number(balanceRows[0]?.paidCents ?? 0),
      currency: "usd",
      minPayoutCents: getMinPayoutCents(),
      reviewThresholdCents: getPayoutReviewThresholdCents()
    },
    payoutAccounts,
    payouts
  };
}

export async function listAdminPayouts(limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackPayoutSummary.payouts;
  }

  return listPayoutRows(sql, limit);
}

export async function requestPublisherPayout(input: RequestPayoutInput) {
  const sql = await requireSql();
  const currency = normalizeCurrency(input.currency);

  return sql.begin(async (tx: Sql) => {
    const publisher = await getPublisherProfile(tx, input.publisherProfileId, true);

    if (!publisher) {
      throw new Error("Publisher profile not found.");
    }

    if (publisher.status !== "active") {
      throw new Error("Publisher account must be active before payout.");
    }

    if (publisher.payoutStatus !== "verified") {
      throw new Error("Verified payout account state is required before payout.");
    }

    const account = await getVerifiedPayoutAccount(tx, publisher.id);

    if (!account) {
      throw new Error("Verified payout account is required before payout.");
    }

    const balances = await getAvailableBalancesForPayout(tx, publisher.id, currency);
    const amountCents = balances.reduce((total, balance) => total + Number(balance.amountCents), 0);

    if (amountCents < getMinPayoutCents()) {
      throw new Error("Available balance is below the minimum payout threshold.");
    }

    const status: PayoutStatus = amountCents >= getPayoutReviewThresholdCents() ? "review" : "requested";
    const payoutRows = (await tx`
      insert into payouts (
        publisher_profile_id,
        payout_account_id,
        amount_cents,
        currency,
        status,
        review_reason,
        updated_at
      )
      values (
        ${publisher.id},
        ${account.id},
        ${amountCents},
        ${currency},
        ${status},
        ${status === "review" ? "Amount exceeds manual review threshold." : null},
        now()
      )
      returning id::text
    `) as Array<{ id: string }>;
    const payoutId = payoutRows[0].id;

    for (const balance of balances) {
      await tx`
        insert into payout_balance_items (
          payout_id,
          publisher_balance_id,
          amount_cents,
          currency
        )
        values (
          ${payoutId},
          ${balance.id},
          ${balance.amountCents},
          ${balance.currency}
        )
      `;

      await tx`
        update publisher_balances
        set state = 'blocked'
        where id = ${balance.id}
      `;
    }

    await recordPayoutAudit(tx, "payout.requested", payoutId, null, {
      publisherProfileId: publisher.id,
      amountCents,
      currency,
      status,
      balanceCount: balances.length
    });
    await recordPayoutNotification(tx, publisher, `payout.${status}`, `Payout ${status}`, {
      payoutId,
      amountCents,
      currency,
      balanceCount: balances.length
    });

    const rows = await listPayoutRows(tx, 1, publisher.id, payoutId);
    return rows[0];
  });
}

export async function decidePayout(payoutId: string, input: PayoutDecisionInput) {
  const sql = await requireSql();
  const action = input.action;

  if (!action || !["approve", "mark_paid", "fail", "block"].includes(action)) {
    throw new Error("Payout action must be approve, mark_paid, fail, or block.");
  }

  return sql.begin(async (tx: Sql) => {
    const payoutRows = (await tx`
      select
        p.id::text,
        p.status,
        p.amount_cents as "amountCents",
        p.currency,
        pp.id::text as "publisherProfileId",
        pp.organization_id::text as "organizationId",
        pp.display_name as "displayName",
        pp.status as "publisherStatus",
        pp.payout_status as "payoutStatus"
      from payouts p
      join publisher_profiles pp on pp.id = p.publisher_profile_id
      where p.id = ${payoutId}
      limit 1
      for update
    `) as Array<{
      id: string;
      status: PayoutStatus;
      amountCents: number;
      currency: string;
      publisherProfileId: string;
      organizationId: string;
      displayName: string;
      publisherStatus: PublisherProfile["status"];
      payoutStatus: PublisherProfile["payoutStatus"];
    }>;
    const payout = payoutRows[0];

    if (!payout) {
      throw new Error("Payout not found.");
    }

    if (action === "approve") {
      ensurePayoutStatus(payout.status, ["requested", "review"], action);
      await tx`
        update payouts
        set
          status = 'processing',
          review_reason = ${input.reason ?? "Approved for provider payout."},
          reviewed_at = now(),
          updated_at = now()
        where id = ${payoutId}
      `;
    }

    if (action === "mark_paid") {
      ensurePayoutStatus(payout.status, ["requested", "review", "processing"], action);
      await tx`
        update payouts
        set
          status = 'paid',
          provider_reference = ${input.providerReference ?? null},
          paid_at = now(),
          updated_at = now()
        where id = ${payoutId}
      `;
      await updateLinkedBalanceState(tx, payoutId, "paid");
    }

    if (action === "fail") {
      ensurePayoutStatus(payout.status, ["requested", "review", "processing"], action);
      await tx`
        update payouts
        set
          status = 'failed',
          failure_reason = ${input.reason ?? "Provider payout failed."},
          updated_at = now()
        where id = ${payoutId}
      `;
      await updateLinkedBalanceState(tx, payoutId, "available");
    }

    if (action === "block") {
      ensurePayoutStatus(payout.status, ["requested", "review", "processing"], action);
      await tx`
        update payouts
        set
          status = 'blocked',
          review_reason = ${input.reason ?? "Blocked by finance review."},
          reviewed_at = now(),
          updated_at = now()
        where id = ${payoutId}
      `;
      await updateLinkedBalanceState(tx, payoutId, "blocked");
    }

    await recordPayoutAudit(tx, `payout.${action}`, payoutId, input.reason, {
      publisherProfileId: payout.publisherProfileId,
      previousStatus: payout.status,
      providerReference: input.providerReference ?? null
    });
    await recordPayoutNotification(
      tx,
      {
        id: payout.publisherProfileId,
        organizationId: payout.organizationId,
        displayName: payout.displayName,
        status: payout.publisherStatus,
        payoutStatus: payout.payoutStatus
      },
      `payout.${action}`,
      `Payout ${action}`,
      {
        payoutId,
        amountCents: payout.amountCents,
        currency: payout.currency,
        reason: input.reason ?? null,
        providerReference: input.providerReference ?? null
      }
    );

    const rows = await listPayoutRows(tx, 1, payout.publisherProfileId, payoutId);
    return rows[0];
  });
}

async function listPayoutRows(sql: Sql, limit = 50, publisherProfileId?: string, payoutId?: string) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);

  return sql`
    select
      p.id::text,
      pp.id::text as "publisherProfileId",
      pp.display_name as "publisherName",
      p.amount_cents as "amountCents",
      p.currency,
      p.status,
      count(pbi.id)::int as "balanceCount",
      pa.provider,
      pa.status as "accountStatus",
      p.requested_at as "requestedAt",
      p.reviewed_at as "reviewedAt",
      p.paid_at as "paidAt",
      p.review_reason as "reviewReason",
      p.failure_reason as "failureReason",
      p.provider_reference as "providerReference"
    from payouts p
    join publisher_profiles pp on pp.id = p.publisher_profile_id
    left join payout_accounts pa on pa.id = p.payout_account_id
    left join payout_balance_items pbi on pbi.payout_id = p.id
    where (${publisherProfileId ?? null}::uuid is null or pp.id = ${publisherProfileId ?? null})
      and (${payoutId ?? null}::uuid is null or p.id = ${payoutId ?? null})
    group by p.id, pp.id, pp.display_name, pa.id, pa.provider, pa.status
    order by p.requested_at desc
    limit ${safeLimit}
  `;
}

async function getPublisherProfile(
  sql: Sql,
  publisherProfileId?: string,
  forUpdate = false
): Promise<PublisherProfile | null> {
  const lock = forUpdate ? sql`for update` : sql``;
  const rows = publisherProfileId
    ? ((await sql`
        select
          id::text,
          organization_id::text as "organizationId",
          display_name as "displayName",
          status,
          payout_status as "payoutStatus"
        from publisher_profiles
        where id = ${publisherProfileId}
        limit 1
        ${lock}
      `) as PublisherProfile[])
    : ((await sql`
        select
          id::text,
          organization_id::text as "organizationId",
          display_name as "displayName",
          status,
          payout_status as "payoutStatus"
        from publisher_profiles
        order by created_at asc
        limit 1
        ${lock}
      `) as PublisherProfile[]);

  return rows[0] ?? null;
}

async function getVerifiedPayoutAccount(sql: Sql, publisherProfileId: string): Promise<PayoutAccount | null> {
  const rows = (await sql`
    select
      id::text,
      provider,
      provider_account_id as "providerAccountId",
      status,
      created_at as "createdAt",
      updated_at as "updatedAt"
    from payout_accounts
    where publisher_profile_id = ${publisherProfileId}
      and status = 'verified'
    order by updated_at desc
    limit 1
    for update
  `) as PayoutAccount[];

  return rows[0] ?? null;
}

async function getAvailableBalancesForPayout(sql: Sql, publisherProfileId: string, currency: string) {
  return (await sql`
    select
      id::text,
      amount_cents as "amountCents",
      currency
    from publisher_balances
    where publisher_profile_id = ${publisherProfileId}
      and currency = ${currency}
      and state = 'available'
    order by created_at asc
    for update skip locked
  `) as AvailableBalance[];
}

async function updateLinkedBalanceState(sql: Sql, payoutId: string, state: "available" | "blocked" | "paid") {
  await sql`
    update publisher_balances pb
    set state = ${state}
    from payout_balance_items pbi
    where pbi.publisher_balance_id = pb.id
      and pbi.payout_id = ${payoutId}
  `;
}

async function recordPayoutAudit(
  sql: Sql,
  action: string,
  payoutId: string,
  reason: string | null | undefined,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
    values (${action}, 'payout', ${payoutId}, ${reason ?? null}, ${sql.json(metadata)})
  `;
}

async function recordPayoutNotification(
  sql: Sql,
  publisher: PublisherProfile,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (
      ${publisher.organizationId},
      ${eventType},
      'in_app',
      ${subject},
      ${sql.json({
        publisherProfileId: publisher.id,
        publisherName: publisher.displayName,
        ...payload
      })},
      'queued'
    )
  `;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for payout operations.");
  }

  return sql;
}

function ensurePayoutStatus(status: PayoutStatus, allowed: PayoutStatus[], action: PayoutAction) {
  if (!allowed.includes(status)) {
    throw new Error(`Cannot ${action} payout while status is ${status}.`);
  }
}

function normalizeCurrency(currency = "usd") {
  return currency.trim().toLowerCase() || "usd";
}

function getMinPayoutCents() {
  return getEnvInt("SKILLHUB_MIN_PAYOUT_CENTS", 1000);
}

function getPayoutReviewThresholdCents() {
  return getEnvInt("SKILLHUB_PAYOUT_REVIEW_THRESHOLD_CENTS", 50000);
}

function getEnvInt(key: string, fallback: number) {
  const parsed = Number(getProcessEnv(key) ?? String(fallback));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : fallback;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
