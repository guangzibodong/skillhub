import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PublisherStatus = "pending" | "active" | "restricted" | "suspended";
type PayoutStatus = "not_configured" | "verification_required" | "verified" | "blocked";

type PublisherProfileInput = {
  displayName?: string;
  status?: PublisherStatus;
};

type OnboardingInput = {
  provider?: string;
  returnUrl?: string;
  refreshUrl?: string;
};

type CompleteOnboardingInput = {
  sessionId?: string;
  payoutAccountId?: string;
  status?: PayoutStatus;
  reason?: string;
};

type AcceptTermsInput = {
  termsVersion?: unknown;
};

type PublisherProfile = {
  id: string;
  organizationId: string;
  displayName: string;
  status: PublisherStatus;
  payoutStatus: PayoutStatus;
  termsAcceptedAt: string | null;
  termsAcceptedByUserId: string | null;
  termsVersion: string | null;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_PUBLISHER_TERMS_VERSION = "2026-06-05-prelaunch-operating-terms";

const fallbackPublisherAccountSummary = {
  publisherProfile: {
    id: "demo-publisher",
    organizationId: "demo-org",
    displayName: "SkillHub Publisher",
    status: "active",
    payoutStatus: "verification_required",
    termsAcceptedAt: null,
    termsAcceptedByUserId: null,
    termsVersion: null,
    createdAt: "demo",
    updatedAt: "demo"
  },
  payoutAccounts: [
    {
      id: "demo-payout-account",
      provider: "manual_deferred",
      providerAccountId: "manual_deferred_demo",
      status: "verification_required",
      createdAt: "demo",
      updatedAt: "demo"
    }
  ],
  onboardingSessions: [
    {
      id: "demo-onboarding-session",
      payoutAccountId: "demo-payout-account",
      provider: "manual_deferred",
      providerSessionId: "po_demo_session",
      onboardingUrl: "https://app.useskillhub.com/dashboard?payout_onboarding=demo",
      returnUrl: null,
      refreshUrl: null,
      status: "created",
      expiresAt: "demo",
      completedAt: null,
      createdAt: "demo",
      updatedAt: "demo"
    }
  ]
};

export async function getPublisherAccountSummary(organizationId?: string | null, publisherProfileId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    return fallbackPublisherAccountSummary;
  }

  return queryPublisherAccountSummary(sql, organizationId, publisherProfileId);
}

async function queryPublisherAccountSummary(sql: Sql, organizationId?: string | null, publisherProfileId?: string | null) {
  const publisher = await findPublisherProfile(sql, { organizationId, publisherProfileId });

  if (!publisher) {
    return {
      publisherProfile: null,
      payoutAccounts: [],
      onboardingSessions: []
    };
  }

  const [payoutAccounts, onboardingSessions] = await Promise.all([
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
    sql`
      select
        id::text,
        payout_account_id::text as "payoutAccountId",
        provider,
        provider_session_id as "providerSessionId",
        onboarding_url as "onboardingUrl",
        return_url as "returnUrl",
        refresh_url as "refreshUrl",
        status,
        expires_at as "expiresAt",
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      from payout_account_onboarding_sessions
      where publisher_profile_id = ${publisher.id}
      order by created_at desc
      limit 10
    `
  ]);

  return {
    publisherProfile: publisher,
    payoutAccounts,
    onboardingSessions
  };
}

export async function upsertPublisherProfile(organizationId: string | null | undefined, input: PublisherProfileInput) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const displayName = normalizeDisplay(input.displayName, "SkillHub Publisher");
  const status = input.status ? normalizePublisherStatus(input.status) : null;

  const rows = (await sql`
    insert into publisher_profiles (
      organization_id,
      display_name,
      status,
      payout_status,
      updated_at
    )
    values (
      ${scopedOrganizationId},
      ${displayName},
      ${status ?? "active"},
      'not_configured',
      now()
    )
    on conflict (organization_id) do update set
      display_name = excluded.display_name,
      status = coalesce(${status}, publisher_profiles.status),
      updated_at = now()
    returning
      id::text,
      organization_id::text as "organizationId",
      display_name as "displayName",
      status,
      payout_status as "payoutStatus",
      terms_accepted_at as "termsAcceptedAt",
      terms_accepted_by_user_id::text as "termsAcceptedByUserId",
      terms_version as "termsVersion",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `) as PublisherProfile[];

  return rows[0];
}

export async function acceptPublisherTerms(
  organizationId: string | null | undefined,
  input: AcceptTermsInput,
  actorUserId?: string | null
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const termsVersion = normalizeTermsVersion(input.termsVersion);

  return sql.begin(async (tx: Sql) => {
    const publisher = await ensurePublisherProfile(tx, scopedOrganizationId);
    const rows = (await tx`
      update publisher_profiles
      set
        terms_accepted_at = now(),
        terms_version = ${termsVersion},
        terms_accepted_by_user_id = ${actorUserId ?? null},
        updated_at = now()
      where id = ${publisher.id}
      returning
        id::text,
        organization_id::text as "organizationId",
        display_name as "displayName",
        status,
        payout_status as "payoutStatus",
        terms_accepted_at as "termsAcceptedAt",
        terms_accepted_by_user_id::text as "termsAcceptedByUserId",
        terms_version as "termsVersion",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as PublisherProfile[];
    const acceptedProfile = rows[0];

    await recordPublisherAudit(
      tx,
      "publisher.terms.accepted",
      "publisher_profile",
      acceptedProfile.id,
      "Publisher accepted SkillHub operating terms.",
      {
        actorUserId: actorUserId ?? null,
        organizationId: scopedOrganizationId,
        termsAcceptedAt: acceptedProfile.termsAcceptedAt,
        termsVersion
      },
      actorUserId
    );
    await recordPublisherNotification(
      tx,
      scopedOrganizationId,
      "publisher.terms.accepted",
      "Publisher operating terms accepted",
      {
        actorUserId: actorUserId ?? null,
        publisherProfileId: acceptedProfile.id,
        termsAcceptedAt: acceptedProfile.termsAcceptedAt,
        termsVersion
      }
    );

    return acceptedProfile;
  });
}

export async function createPayoutAccountOnboarding(organizationId: string | null | undefined, input: OnboardingInput) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const provider = normalizeProvider(input.provider);
  const returnUrl = input.returnUrl?.trim() || null;
  const refreshUrl = input.refreshUrl?.trim() || null;

  return sql.begin(async (tx: Sql) => {
    const publisher = await ensurePublisherProfile(tx, scopedOrganizationId);
    const providerAccountId = `${provider}_${publisher.id}`;
    const accountRows = (await tx`
      insert into payout_accounts (
        publisher_profile_id,
        provider,
        provider_account_id,
        status,
        updated_at
      )
      values (
        ${publisher.id},
        ${provider},
        ${providerAccountId},
        'verification_required',
        now()
      )
      on conflict (provider, provider_account_id) do update set
        status = case
          when payout_accounts.status = 'verified' then payout_accounts.status
          else 'verification_required'
        end,
        updated_at = now()
      returning
        id::text,
        provider,
        provider_account_id as "providerAccountId",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as Array<{
      id: string;
      provider: string;
      providerAccountId: string;
      status: PayoutStatus;
      createdAt: string;
      updatedAt: string;
    }>;
    const account = accountRows[0];
    const providerSessionId = `po_${randomToken(16)}`;
    const onboardingUrl =
      getProcessEnv("SKILLHUB_PAYOUT_ONBOARDING_URL") ??
      `https://app.useskillhub.com/dashboard?payout_onboarding=${providerSessionId}`;
    const sessionRows = (await tx`
      insert into payout_account_onboarding_sessions (
        publisher_profile_id,
        payout_account_id,
        provider,
        provider_session_id,
        onboarding_url,
        return_url,
        refresh_url,
        status,
        expires_at,
        updated_at
      )
      values (
        ${publisher.id},
        ${account.id},
        ${provider},
        ${providerSessionId},
        ${onboardingUrl},
        ${returnUrl},
        ${refreshUrl},
        'created',
        now() + interval '7 days',
        now()
      )
      returning
        id::text,
        payout_account_id::text as "payoutAccountId",
        provider,
        provider_session_id as "providerSessionId",
        onboarding_url as "onboardingUrl",
        return_url as "returnUrl",
        refresh_url as "refreshUrl",
        status,
        expires_at as "expiresAt",
        completed_at as "completedAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as Array<Record<string, unknown>>;

    await tx`
      update publisher_profiles
      set
        payout_status = case
          when payout_status = 'verified' then payout_status
          else 'verification_required'
        end,
        updated_at = now()
      where id = ${publisher.id}
    `;
    await recordPublisherAudit(tx, "payout_account.onboarding_created", "payout_account", account.id, null, {
      publisherProfileId: publisher.id,
      provider,
      providerSessionId
    });
    await recordPublisherNotification(
      tx,
      publisher.organizationId,
      "payout_account.onboarding_created",
      "Payout account onboarding created",
      {
        publisherProfileId: publisher.id,
        payoutAccountId: account.id,
        provider,
        providerSessionId
      }
    );

    return {
      publisherProfileId: publisher.id,
      payoutAccount: account,
      onboardingSession: sessionRows[0]
    };
  });
}

export async function completePayoutAccountOnboarding(
  organizationId: string | null | undefined,
  input: CompleteOnboardingInput
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId);
  const status = normalizePayoutStatus(input.status ?? "verified");

  return sql.begin(async (tx: Sql) => {
    const target = await getOnboardingTarget(tx, scopedOrganizationId, input);

    if (!target) {
      throw new Error("Payout account onboarding target not found.");
    }

    await tx`
      update payout_accounts
      set
        status = ${status},
        updated_at = now()
      where id = ${target.payoutAccountId}
    `;
    await tx`
      update publisher_profiles
      set
        payout_status = ${status},
        updated_at = now()
      where id = ${target.publisherProfileId}
    `;

    if (target.sessionId) {
      await tx`
        update payout_account_onboarding_sessions
        set
          status = ${status === "blocked" ? "canceled" : "completed"},
          completed_at = now(),
          updated_at = now()
        where id = ${target.sessionId}
      `;
    }

    await recordPublisherAudit(tx, "payout_account.onboarding_completed", "payout_account", target.payoutAccountId, input.reason, {
      publisherProfileId: target.publisherProfileId,
      status,
      sessionId: target.sessionId
    });
    await recordPublisherNotification(
      tx,
      scopedOrganizationId,
      `payout_account.${status}`,
      `Payout account ${status}`,
      {
        publisherProfileId: target.publisherProfileId,
        payoutAccountId: target.payoutAccountId,
        status,
        reason: input.reason ?? null
      }
    );

    return queryPublisherAccountSummary(tx, scopedOrganizationId, target.publisherProfileId);
  });
}

async function findPublisherProfile(
  sql: Sql,
  input: { organizationId?: string | null; publisherProfileId?: string | null }
): Promise<PublisherProfile | null> {
  const rows = input.publisherProfileId
    ? ((await sql`
        select
          id::text,
          organization_id::text as "organizationId",
          display_name as "displayName",
          status,
          payout_status as "payoutStatus",
          terms_accepted_at as "termsAcceptedAt",
          terms_accepted_by_user_id::text as "termsAcceptedByUserId",
          terms_version as "termsVersion",
          created_at as "createdAt",
          updated_at as "updatedAt"
        from publisher_profiles
        where id = ${input.publisherProfileId}
          and (${input.organizationId ?? null}::uuid is null or organization_id = ${input.organizationId ?? null})
        limit 1
      `) as PublisherProfile[])
    : input.organizationId
      ? ((await sql`
          select
            id::text,
            organization_id::text as "organizationId",
            display_name as "displayName",
            status,
            payout_status as "payoutStatus",
            terms_accepted_at as "termsAcceptedAt",
            terms_accepted_by_user_id::text as "termsAcceptedByUserId",
            terms_version as "termsVersion",
            created_at as "createdAt",
            updated_at as "updatedAt"
          from publisher_profiles
          where organization_id = ${input.organizationId}
          order by created_at asc
          limit 1
        `) as PublisherProfile[])
      : ((await sql`
          select
            id::text,
            organization_id::text as "organizationId",
            display_name as "displayName",
            status,
            payout_status as "payoutStatus",
            terms_accepted_at as "termsAcceptedAt",
            terms_accepted_by_user_id::text as "termsAcceptedByUserId",
            terms_version as "termsVersion",
            created_at as "createdAt",
            updated_at as "updatedAt"
          from publisher_profiles
          order by created_at asc
          limit 1
        `) as PublisherProfile[]);

  return rows[0] ?? null;
}

async function ensurePublisherProfile(sql: Sql, organizationId: string): Promise<PublisherProfile> {
  const existing = await findPublisherProfile(sql, { organizationId });

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

  const rows = (await sql`
    insert into publisher_profiles (
      organization_id,
      display_name,
      status,
      payout_status,
      updated_at
    )
    values (
      ${organizationId},
      ${displayName},
      'active',
      'not_configured',
      now()
    )
    returning
      id::text,
      organization_id::text as "organizationId",
      display_name as "displayName",
      status,
      payout_status as "payoutStatus",
      terms_accepted_at as "termsAcceptedAt",
      terms_accepted_by_user_id::text as "termsAcceptedByUserId",
      terms_version as "termsVersion",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `) as PublisherProfile[];

  return rows[0];
}

async function getOnboardingTarget(sql: Sql, organizationId: string, input: CompleteOnboardingInput) {
  if (input.sessionId) {
    const rows = (await sql`
      select
        po.id::text as "sessionId",
        po.publisher_profile_id::text as "publisherProfileId",
        po.payout_account_id::text as "payoutAccountId"
      from payout_account_onboarding_sessions po
      join publisher_profiles pp on pp.id = po.publisher_profile_id
      where po.id = ${input.sessionId}
        and pp.organization_id = ${organizationId}
      limit 1
      for update of po
    `) as Array<{ sessionId: string; publisherProfileId: string; payoutAccountId: string }>;

    return rows[0] ?? null;
  }

  if (input.payoutAccountId) {
    const rows = (await sql`
      select
        null::text as "sessionId",
        pp.id::text as "publisherProfileId",
        pa.id::text as "payoutAccountId"
      from payout_accounts pa
      join publisher_profiles pp on pp.id = pa.publisher_profile_id
      where pa.id = ${input.payoutAccountId}
        and pp.organization_id = ${organizationId}
      limit 1
      for update of pa
    `) as Array<{ sessionId: string | null; publisherProfileId: string; payoutAccountId: string }>;

    return rows[0] ?? null;
  }

  throw new Error("sessionId or payoutAccountId is required.");
}

async function recordPublisherAudit(
  sql: Sql,
  action: string,
  entityType: string,
  entityId: string,
  reason: string | null | undefined,
  metadata: Record<string, unknown>,
  actorUserId?: string | null
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, ${entityType}, ${entityId}, ${reason ?? null}, ${sql.json(metadata)})
  `;
}

async function recordPublisherNotification(
  sql: Sql,
  organizationId: string,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId}, ${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for publisher account operations.");
  }

  return sql;
}

function requireOrganizationId(organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error("Publisher account operations require an organization-scoped user token.");
  }

  return organizationId;
}

function normalizeDisplay(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function normalizeProvider(provider?: string) {
  return provider?.trim().toLowerCase() || "manual_deferred";
}

function normalizePublisherStatus(status: PublisherStatus) {
  if (!["pending", "active", "restricted", "suspended"].includes(status)) {
    throw new Error("Invalid publisher status.");
  }

  return status;
}

function normalizePayoutStatus(status: PayoutStatus) {
  if (!["not_configured", "verification_required", "verified", "blocked"].includes(status)) {
    throw new Error("Invalid payout status.");
  }

  return status;
}

function normalizeTermsVersion(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || DEFAULT_PUBLISHER_TERMS_VERSION;
}

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
