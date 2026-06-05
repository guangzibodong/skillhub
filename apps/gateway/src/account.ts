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

export type AuthProviderStatus = {
  connectedAt?: string | null;
  description: string;
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
        : "Self-service email workspace registration is live. Password/OAuth-provider email verification remains a final auth-provider integration.",
      emailVerified: emailIdentity?.emailVerified ?? false,
      label: "Email registration",
      lastLoginAt: emailIdentity?.lastLoginAt ?? null,
      provider: "email",
      providerEmail: emailIdentity?.email ?? null,
      startUrl: "/v1/auth/signup",
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
      type: "oauth"
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
      type: "oauth"
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

async function listAuthIdentities(sql: Sql, userId: string): Promise<AuthIdentityRecord[]> {
  const tableRows = (await sql`
    select to_regclass('public.user_auth_identities') is not null as "exists"
  `) as Array<{ exists: boolean }>;

  if (tableRows[0]?.exists !== true) {
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
