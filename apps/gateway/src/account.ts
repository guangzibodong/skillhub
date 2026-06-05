import { getSql } from "./registry.js";
import type { AuthSubject } from "./auth.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type AccountProviderEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
  SKILLHUB_AUTH_CALLBACK_BASE_URL?: string;
  SKILLHUB_AUTH_BASE_URL?: string;
  SKILLHUB_GITHUB_CLIENT_ID?: string;
  SKILLHUB_GITHUB_CLIENT_SECRET?: string;
  SKILLHUB_GOOGLE_CLIENT_ID?: string;
  SKILLHUB_GOOGLE_CLIENT_SECRET?: string;
  SKILLHUB_OAUTH_STATE_SECRET?: string;
};

type UserProfile = {
  createdAt: string | null;
  displayName: string | null;
  email: string | null;
  platformRole: string;
  userId: string | null;
};

type OrganizationProfile = {
  createdAt: string;
  id: string;
  name: string;
  slug: string;
};

type MembershipRecord = {
  memberSince: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
};

type TokenSessionRecord = {
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
  scopes: string[];
  tokenId: string;
  tokenLast4: string;
  tokenPrefix: string;
};

export type AccountSessionRecord = TokenSessionRecord & {
  isCurrent: boolean;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  status: "active" | "expired" | "revoked";
};

type AccountSessionRow = TokenSessionRecord & {
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
};

type WorkspaceReadiness = {
  activeTokenCount: number;
  billingProfileComplete: boolean;
  invoiceReady: boolean;
  notificationPreferenceCount: number;
  paymentMethodCount: number;
  payoutStatus: string;
  projectCount: number;
  publisherProfileStatus: string;
  skillCount: number;
  teamMemberCount: number;
  unreadNotifications: number;
};

type AuthIdentityRecord = {
  avatarUrl: string | null;
  connectedAt: string;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  provider: "email" | "github" | "google";
};

type AuthIdentityRow = AuthIdentityRecord & {
  identityId: string;
  providerUserId: string | null;
};

export type DisconnectableAuthProvider = "github" | "google";

export type AccountIdentityDisconnectResult = {
  disconnectedAt: string;
  otherActiveTokenCount: number;
  provider: DisconnectableAuthProvider;
  providerEmail: string;
  remainingOAuthProviders: DisconnectableAuthProvider[];
};

export type AuthProviderStatus = {
  canDisconnect?: boolean;
  connectedAt?: string | null;
  description: string;
  disconnectUrl?: string | null;
  emailVerified?: boolean;
  label: string;
  lastLoginAt?: string | null;
  provider: "email" | "github" | "google" | "token";
  providerEmail?: string | null;
  startUrl: string | null;
  status: "active" | "configuration_required" | "connected" | "deferred";
  type: "email" | "oauth" | "token";
};

export type AccountSummary = {
  loginMethods: AuthProviderStatus[];
  membership: MembershipRecord | null;
  memberships: MembershipRecord[];
  organization: OrganizationProfile | null;
  profile: UserProfile;
  session: TokenSessionRecord | null;
  workspace: WorkspaceReadiness;
};

const emptyReadiness: WorkspaceReadiness = {
  activeTokenCount: 0,
  billingProfileComplete: false,
  invoiceReady: false,
  notificationPreferenceCount: 0,
  paymentMethodCount: 0,
  payoutStatus: "not_configured",
  projectCount: 0,
  publisherProfileStatus: "not_configured",
  skillCount: 0,
  teamMemberCount: 0,
  unreadNotifications: 0
};

export async function getAccountSummary(subject: AuthSubject, env?: AccountProviderEnv): Promise<AccountSummary> {
  if (!subject.userId) {
    throw new Error("Account center requires a user-scoped token.");
  }

  const sql = await getSql();

  if (!sql) {
    return {
      loginMethods: getAuthProviderStatuses(env, {
        emailConnected: Boolean(subject.email),
        tokenConnected: Boolean(subject.tokenId)
      }),
      membership: null,
      memberships: [],
      organization: null,
      profile: {
        createdAt: null,
        displayName: subject.displayName,
        email: subject.email,
        platformRole: subject.platformRole,
        userId: subject.userId
      },
      session: null,
      workspace: emptyReadiness
    };
  }

  const [profile, organization, memberships, session, workspace, authIdentities] = await Promise.all([
    getUserProfile(sql, subject.userId),
    getOrganizationProfile(sql, subject.organizationId),
    listMemberships(sql, subject.userId),
    getTokenSession(sql, subject.tokenId),
    getWorkspaceReadiness(sql, subject.userId, subject.organizationId),
    listAuthIdentities(sql, subject.userId)
  ]);
  const activeMembership =
    memberships.find((membership) => membership.organizationId === subject.organizationId) ?? memberships[0] ?? null;

  return {
    loginMethods: getAuthProviderStatuses(env, {
      authIdentities,
      emailConnected: Boolean(profile.email),
      tokenConnected: Boolean(session)
    }),
    membership: activeMembership,
    memberships,
    organization,
    profile,
    session,
    workspace
  };
}

export async function listAccountSessions(subject: AuthSubject): Promise<AccountSessionRecord[]> {
  if (!subject.userId) {
    throw new Error("Account sessions require a user-scoped token.");
  }

  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for account session management.");
  }

  const rows = (await sql`
    select
      uat.id::text as "tokenId",
      uat.name,
      uat.token_prefix as "tokenPrefix",
      uat.token_last4 as "tokenLast4",
      uat.scopes,
      uat.expires_at as "expiresAt",
      uat.last_used_at as "lastUsedAt",
      uat.revoked_at as "revokedAt",
      uat.created_at as "createdAt",
      uat.organization_id::text as "organizationId",
      o.name as "organizationName",
      o.slug as "organizationSlug"
    from user_access_tokens uat
    left join organizations o on o.id = uat.organization_id
    where uat.user_id = ${subject.userId}
    order by
      case when uat.id::text = ${subject.tokenId ?? ""} then 0 else 1 end,
      case when uat.revoked_at is null and (uat.expires_at is null or uat.expires_at > now()) then 0 else 1 end,
      coalesce(uat.last_used_at, uat.created_at) desc
    limit 100
  `) as AccountSessionRow[];

  return rows.map((row) => toAccountSessionRecord(row, subject.tokenId));
}

export async function revokeAccountSession(subject: AuthSubject, tokenId: string): Promise<AccountSessionRecord> {
  if (!subject.userId) {
    throw new Error("Account sessions require a user-scoped token.");
  }

  const normalizedTokenId = tokenId.trim();

  if (!normalizedTokenId) {
    throw new Error("Session id is required.");
  }

  if (normalizedTokenId === subject.tokenId) {
    throw new Error("The current session cannot be revoked from this list. Use sign out to end it.");
  }

  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for account session management.");
  }

  return sql.begin(async (tx: Sql) => {
    const targetRows = (await tx`
      select
        uat.id::text as "tokenId",
        uat.name,
        uat.token_prefix as "tokenPrefix",
        uat.token_last4 as "tokenLast4",
        uat.scopes,
        uat.expires_at as "expiresAt",
        uat.last_used_at as "lastUsedAt",
        uat.revoked_at as "revokedAt",
        uat.created_at as "createdAt",
        uat.organization_id::text as "organizationId",
        o.name as "organizationName",
        o.slug as "organizationSlug"
      from user_access_tokens uat
      left join organizations o on o.id = uat.organization_id
      where uat.id::text = ${normalizedTokenId}
        and uat.user_id = ${subject.userId}
      limit 1
    `) as AccountSessionRow[];
    const target = targetRows[0];

    if (!target) {
      throw new Error("Account session was not found.");
    }

    if (target.revokedAt) {
      return toAccountSessionRecord(target, subject.tokenId);
    }

    const revokedRows = (await tx`
      update user_access_tokens
      set revoked_at = now()
      where id::text = ${normalizedTokenId}
        and user_id = ${subject.userId}
      returning
        id::text as "tokenId",
        name,
        token_prefix as "tokenPrefix",
        token_last4 as "tokenLast4",
        scopes,
        expires_at as "expiresAt",
        last_used_at as "lastUsedAt",
        revoked_at as "revokedAt",
        created_at as "createdAt",
        organization_id::text as "organizationId",
        null::text as "organizationName",
        null::text as "organizationSlug"
    `) as AccountSessionRow[];
    const session = {
      ...toAccountSessionRecord({
        ...revokedRows[0],
        organizationName: target.organizationName,
        organizationSlug: target.organizationSlug
      }, subject.tokenId)
    };

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (${subject.userId}, 'auth.session.revoked', 'user_access_token', ${session.tokenId}, 'User revoked an account session.', ${tx.json({
        isCurrent: session.isCurrent,
        organizationId: session.organizationId,
        tokenLast4: session.tokenLast4,
        tokenPrefix: session.tokenPrefix
      })})
    `;

    await tx`
      insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
      values (${subject.userId}, ${session.organizationId ?? subject.organizationId}, 'account.security.session_revoked', 'in_app', 'Account session revoked', ${tx.json({
        tokenId: session.tokenId,
        tokenLast4: session.tokenLast4,
        tokenPrefix: session.tokenPrefix
      })}, 'queued')
    `;

    return session;
  });
}

export async function disconnectAccountAuthIdentity(
  subject: AuthSubject,
  provider: DisconnectableAuthProvider
): Promise<AccountIdentityDisconnectResult> {
  if (!subject.userId) {
    throw new Error("Account identity disconnect requires a user-scoped token.");
  }

  const userId = subject.userId;
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for account identity management.");
  }

  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(sql);

  if (!authIdentitiesAvailable) {
    throw new Error("Connected login identity storage is not available.");
  }

  return sql.begin(async (tx: Sql) => {
    const identities = await listAuthIdentitiesWithIds(tx, userId);
    const target = identities.find((identity) => identity.provider === provider);

    if (!target) {
      throw new Error("Connected login identity was not found.");
    }

    const remainingOAuthProviders = identities
      .filter((identity): identity is AuthIdentityRow & { provider: DisconnectableAuthProvider } =>
        (identity.provider === "google" || identity.provider === "github") && identity.provider !== provider
      )
      .map((identity) => identity.provider);
    const tokenRows = (await tx`
      select
        count(*) filter (where id::text != ${subject.tokenId ?? ""})::int as "otherActiveTokenCount"
      from user_access_tokens
      where user_id = ${userId}
        and revoked_at is null
        and (expires_at is null or expires_at > now())
    `) as Array<{ otherActiveTokenCount: number }>;
    const otherActiveTokenCount = tokenRows[0]?.otherActiveTokenCount ?? 0;

    if (remainingOAuthProviders.length === 0 && otherActiveTokenCount < 1) {
      throw new Error("Connect another provider or create a separate active user token before disconnecting this login method.");
    }

    const deletedRows = (await tx`
      delete from user_auth_identities
      where id = ${target.identityId}
        and user_id = ${userId}
        and provider = ${provider}
      returning now() as "disconnectedAt"
    `) as Array<{ disconnectedAt: string }>;

    if (!deletedRows[0]) {
      throw new Error("Connected login identity was not found.");
    }

    const disconnectedAt = deletedRows[0].disconnectedAt;

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (${userId}, 'auth.identity.disconnected', 'user_auth_identity', ${target.identityId}, 'User disconnected an OAuth login identity.', ${tx.json({
        otherActiveTokenCount,
        provider,
        providerEmail: target.email,
        remainingOAuthProviders
      })})
    `;

    await tx`
      insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
      values (${userId}, ${subject.organizationId}, 'account.security.identity_disconnected', 'in_app', 'Login method disconnected', ${tx.json({
        provider,
        providerEmail: target.email,
        remainingOAuthProviders
      })}, 'queued')
    `;

    return {
      disconnectedAt,
      otherActiveTokenCount,
      provider,
      providerEmail: target.email,
      remainingOAuthProviders
    };
  });
}

export function getAuthProviderStatuses(
  env?: AccountProviderEnv,
  options: { authIdentities?: AuthIdentityRecord[]; emailConnected?: boolean; tokenConnected?: boolean } = {}
): AuthProviderStatus[] {
  const googleConfigured = hasConfiguredValue(env?.SKILLHUB_GOOGLE_CLIENT_ID ?? env?.GOOGLE_CLIENT_ID ?? getProcessEnv("SKILLHUB_GOOGLE_CLIENT_ID") ?? getProcessEnv("GOOGLE_CLIENT_ID"));
  const googleSecretConfigured = hasConfiguredValue(
    env?.SKILLHUB_GOOGLE_CLIENT_SECRET ?? env?.GOOGLE_CLIENT_SECRET ?? getProcessEnv("SKILLHUB_GOOGLE_CLIENT_SECRET") ?? getProcessEnv("GOOGLE_CLIENT_SECRET")
  );
  const githubConfigured = hasConfiguredValue(env?.SKILLHUB_GITHUB_CLIENT_ID ?? env?.GITHUB_CLIENT_ID ?? getProcessEnv("SKILLHUB_GITHUB_CLIENT_ID") ?? getProcessEnv("GITHUB_CLIENT_ID"));
  const githubSecretConfigured = hasConfiguredValue(
    env?.SKILLHUB_GITHUB_CLIENT_SECRET ?? env?.GITHUB_CLIENT_SECRET ?? getProcessEnv("SKILLHUB_GITHUB_CLIENT_SECRET") ?? getProcessEnv("GITHUB_CLIENT_SECRET")
  );
  const callbackConfigured = hasConfiguredValue(
    env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL ?? getProcessEnv("SKILLHUB_AUTH_CALLBACK_BASE_URL") ?? getProcessEnv("SKILLHUB_AUTH_BASE_URL")
  );
  const stateSecretConfigured = hasConfiguredValue(
    env?.SKILLHUB_OAUTH_STATE_SECRET ?? env?.SESSION_SECRET ?? getProcessEnv("SKILLHUB_OAUTH_STATE_SECRET") ?? getProcessEnv("SESSION_SECRET")
  );
  const googleReady = googleConfigured && googleSecretConfigured && callbackConfigured && stateSecretConfigured;
  const githubReady = githubConfigured && githubSecretConfigured && callbackConfigured && stateSecretConfigured;
  const identities = new Map((options.authIdentities ?? []).map((identity) => [identity.provider, identity]));
  const emailIdentity = identities.get("email");
  const googleIdentity = identities.get("google");
  const githubIdentity = identities.get("github");

  return [
    {
      connectedAt: emailIdentity?.connectedAt ?? null,
      description: emailIdentity
        ? `Email workspace identity is connected for ${emailIdentity.email}.`
        : "Email verification code access is live for workspace signup and existing-user login. Provider delivery can be connected without changing the account model.",
      emailVerified: emailIdentity?.emailVerified ?? false,
      label: "Email code",
      lastLoginAt: emailIdentity?.lastLoginAt ?? null,
      provider: "email",
      providerEmail: emailIdentity?.email ?? null,
      startUrl: "/v1/auth/email/request-code",
      status: emailIdentity || options.emailConnected ? "connected" : "active",
      type: "email"
    },
    {
      connectedAt: googleIdentity?.connectedAt ?? null,
      description: googleIdentity
        ? `Google is connected with verified email ${googleIdentity.email}.`
        : googleReady
          ? "Google OAuth is configured and ready to start a provider login redirect."
          : "Configure Google client id, client secret, callback base URL, and OAuth state secret before enabling the live redirect.",
      emailVerified: googleIdentity?.emailVerified ?? false,
      label: "Google",
      lastLoginAt: googleIdentity?.lastLoginAt ?? null,
      provider: "google",
      providerEmail: googleIdentity?.email ?? null,
      startUrl: googleReady ? "/v1/auth/oauth/google/start" : null,
      status: googleIdentity ? "connected" : googleReady ? "active" : "configuration_required",
      type: "oauth",
      canDisconnect: Boolean(googleIdentity),
      disconnectUrl: googleIdentity ? "/v1/account/identities/google/disconnect" : null
    },
    {
      connectedAt: githubIdentity?.connectedAt ?? null,
      description: githubIdentity
        ? `GitHub is connected with verified email ${githubIdentity.email}.`
        : githubReady
          ? "GitHub OAuth is configured and ready to start a provider login redirect."
          : "Configure GitHub client id, client secret, callback base URL, and OAuth state secret before enabling the live redirect.",
      emailVerified: githubIdentity?.emailVerified ?? false,
      label: "GitHub",
      lastLoginAt: githubIdentity?.lastLoginAt ?? null,
      provider: "github",
      providerEmail: githubIdentity?.email ?? null,
      startUrl: githubReady ? "/v1/auth/oauth/github/start" : null,
      status: githubIdentity ? "connected" : githubReady ? "active" : "configuration_required",
      type: "oauth",
      canDisconnect: Boolean(githubIdentity),
      disconnectUrl: githubIdentity ? "/v1/account/identities/github/disconnect" : null
    },
    {
      connectedAt: null,
      description: "User access tokens remain the operator and team-invite fallback until OAuth/passwordless sessions are connected.",
      emailVerified: false,
      label: "User token",
      lastLoginAt: null,
      provider: "token",
      providerEmail: null,
      startUrl: null,
      status: options.tokenConnected ? "connected" : "active",
      type: "token"
    }
  ];
}

async function getUserProfile(sql: Sql, userId: string): Promise<UserProfile> {
  const rows = (await sql`
    select
      id::text as "userId",
      email,
      display_name as "displayName",
      platform_role as "platformRole",
      created_at as "createdAt"
    from users
    where id = ${userId}
    limit 1
  `) as UserProfile[];

  if (!rows[0]) {
    throw new Error("Account user was not found.");
  }

  return rows[0];
}

async function getOrganizationProfile(sql: Sql, organizationId: string | null | undefined): Promise<OrganizationProfile | null> {
  if (!organizationId) {
    return null;
  }

  const rows = (await sql`
    select
      id::text,
      name,
      slug,
      created_at as "createdAt"
    from organizations
    where id = ${organizationId}
    limit 1
  `) as OrganizationProfile[];

  return rows[0] ?? null;
}

async function listMemberships(sql: Sql, userId: string): Promise<MembershipRecord[]> {
  return (await sql`
    select
      o.id::text as "organizationId",
      o.name as "organizationName",
      o.slug as "organizationSlug",
      om.role,
      om.created_at as "memberSince"
    from organization_members om
    join organizations o on o.id = om.organization_id
    where om.user_id = ${userId}
    order by
      case om.role
        when 'owner' then 0
        when 'admin' then 1
        when 'developer' then 2
        when 'publisher' then 3
        when 'finance' then 4
        else 5
      end,
      om.created_at asc
  `) as MembershipRecord[];
}

async function getTokenSession(sql: Sql, tokenId: string | null | undefined): Promise<TokenSessionRecord | null> {
  if (!tokenId) {
    return null;
  }

  const rows = (await sql`
    select
      id::text as "tokenId",
      name,
      token_prefix as "tokenPrefix",
      token_last4 as "tokenLast4",
      scopes,
      expires_at as "expiresAt",
      last_used_at as "lastUsedAt",
      revoked_at as "revokedAt",
      created_at as "createdAt"
    from user_access_tokens
    where id = ${tokenId}
    limit 1
  `) as TokenSessionRecord[];

  return rows[0] ?? null;
}

function toAccountSessionRecord(row: AccountSessionRow, currentTokenId: string | null | undefined): AccountSessionRecord {
  return {
    ...row,
    isCurrent: row.tokenId === currentTokenId,
    scopes: row.scopes ?? [],
    status: accountSessionStatus(row)
  };
}

function accountSessionStatus(session: Pick<TokenSessionRecord, "expiresAt" | "revokedAt">): AccountSessionRecord["status"] {
  if (session.revokedAt) {
    return "revoked";
  }

  if (session.expiresAt) {
    const expiry = new Date(session.expiresAt);

    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() <= Date.now()) {
      return "expired";
    }
  }

  return "active";
}

async function listAuthIdentities(sql: Sql, userId: string): Promise<AuthIdentityRecord[]> {
  if (!(await isAuthIdentitiesTableAvailable(sql))) {
    return [];
  }

  return (await sql`
    select
      provider,
      email,
      email_verified as "emailVerified",
      display_name as "displayName",
      avatar_url as "avatarUrl",
      connected_at as "connectedAt",
      last_login_at as "lastLoginAt"
    from user_auth_identities
    where user_id = ${userId}
    order by connected_at asc
  `) as AuthIdentityRecord[];
}

async function listAuthIdentitiesWithIds(sql: Sql, userId: string): Promise<AuthIdentityRow[]> {
  return (await sql`
    select
      id::text as "identityId",
      provider,
      provider_user_id as "providerUserId",
      email,
      email_verified as "emailVerified",
      display_name as "displayName",
      avatar_url as "avatarUrl",
      connected_at as "connectedAt",
      last_login_at as "lastLoginAt"
    from user_auth_identities
    where user_id = ${userId}
    order by connected_at asc
  `) as AuthIdentityRow[];
}

async function isAuthIdentitiesTableAvailable(sql: Sql) {
  const tableRows = (await sql`
    select to_regclass('public.user_auth_identities') is not null as "exists"
  `) as Array<{ exists: boolean }>;

  return tableRows[0]?.exists === true;
}

async function getWorkspaceReadiness(
  sql: Sql,
  userId: string,
  organizationId: string | null | undefined
): Promise<WorkspaceReadiness> {
  if (!organizationId) {
    const preferenceRows = (await sql`
      select count(*)::int as "notificationPreferenceCount"
      from notification_preferences
      where user_id = ${userId}
    `) as Array<{ notificationPreferenceCount: number }>;

    return {
      ...emptyReadiness,
      notificationPreferenceCount: preferenceRows[0]?.notificationPreferenceCount ?? 0
    };
  }

  const rows = (await sql`
    select
      (select count(*)::int from organization_members where organization_id = ${organizationId}) as "teamMemberCount",
      (
        select count(*)::int
        from user_access_tokens
        where organization_id = ${organizationId}
          and revoked_at is null
          and (expires_at is null or expires_at > now())
      ) as "activeTokenCount",
      (select count(*)::int from projects where organization_id = ${organizationId}) as "projectCount",
      (select count(*)::int from skills where organization_id = ${organizationId}) as "skillCount",
      coalesce((select status from publisher_profiles where organization_id = ${organizationId} limit 1), 'not_configured') as "publisherProfileStatus",
      coalesce((select payout_status from publisher_profiles where organization_id = ${organizationId} limit 1), 'not_configured') as "payoutStatus",
      exists(
        select 1
        from organization_billing_profiles
        where organization_id = ${organizationId}
          and billing_name is not null
          and billing_email is not null
      ) as "billingProfileComplete",
      (
        select count(*)::int
        from organization_payment_methods
        where organization_id = ${organizationId}
      ) as "paymentMethodCount",
      exists(
        select 1
        from organization_payment_methods
        where organization_id = ${organizationId}
          and is_default = true
          and status in ('ready', 'pending')
      ) as "invoiceReady",
      (
        select count(*)::int
        from notification_events
        where organization_id = ${organizationId}
          and channel = 'in_app'
          and status = 'queued'
      ) as "unreadNotifications",
      (
        select count(*)::int
        from notification_preferences
        where user_id = ${userId}
      ) as "notificationPreferenceCount"
  `) as WorkspaceReadiness[];

  return rows[0] ?? emptyReadiness;
}

function hasConfiguredValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
