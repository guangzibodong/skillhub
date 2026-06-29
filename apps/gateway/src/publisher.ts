import { getSql } from "./registry.js";
import { CURRENT_PUBLISHER_TERMS_VERSION } from "./publisher-terms.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PublisherStatus = "pending" | "active" | "restricted" | "suspended";
type PayoutStatus = "not_configured" | "verification_required" | "verified" | "blocked";

type PublisherProfileInput = {
  displayName?: string;
  status?: PublisherStatus;
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

export async function getPublisherAccountSummary(organizationId?: string | null, publisherProfileId?: string | null) {
  const sql = await getSql();

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
        manual_account as "manualAccount",
        manual_account_holder as "manualAccountHolder",
        manual_method as "manualMethod",
        manual_notes as "manualNotes",
        provider,
        provider_account_id as "providerAccountId",
        stripe_account_id as "stripeAccountId",
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

function normalizePublisherStatus(status: PublisherStatus) {
  if (!["pending", "active", "restricted", "suspended"].includes(status)) {
    throw new Error("Invalid publisher status.");
  }

  return status;
}

function normalizeTermsVersion(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || CURRENT_PUBLISHER_TERMS_VERSION;
}
