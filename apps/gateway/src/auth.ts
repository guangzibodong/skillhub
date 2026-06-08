import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

export type OrganizationRole = "owner" | "admin" | "developer" | "publisher" | "reviewer" | "finance";
export type PlatformRole = "user" | "support" | "reviewer" | "finance" | "admin" | "super_admin";
export type AuthRole = OrganizationRole | PlatformRole | "service";

export type AuthSubject = {
  type: "service" | "user";
  userId: string | null;
  email: string | null;
  displayName: string | null;
  platformRole: PlatformRole | "service";
  organizationId: string | null;
  roles: AuthRole[];
  tokenId: string | null;
};

type AuthorizationResult =
  | { ok: true; subject: AuthSubject }
  | { ok: false; error: string; status: 401 | 403 | 503 };

type AuthorizationScope = {
  organizationId?: string;
  projectSlug?: string;
  publisherProfileId?: string;
  requireOrganization?: boolean;
};

type BootstrapTokenInput = {
  email?: string;
  displayName?: string;
  organizationSlug?: string;
  organizationName?: string;
  role?: OrganizationRole;
  platformRole?: PlatformRole;
  tokenName?: string;
  scopes?: string[];
};

type SignupTokenInput = {
  email?: unknown;
  displayName?: unknown;
  organizationSlug?: unknown;
  organizationName?: unknown;
  role?: unknown;
};

type EmailAccessMode = "login" | "signup";

type EmailAccessStartInput = SignupTokenInput & {
  mode?: unknown;
  returnTo?: unknown;
};

type EmailAccessVerifyInput = {
  challengeId?: unknown;
  code?: unknown;
};

export type OAuthProvider = "github" | "google";

type OAuthProviderConfig = {
  authorizationUrl: string;
  callbackBaseUrl: string;
  clientId: string;
  clientSecret: string;
  provider: OAuthProvider;
  scope: string;
  tokenUrl: string;
};

type OAuthProfile = {
  avatarUrl: string | null;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  providerUserId: string;
};

type OAuthRuntimeEnv = {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV?: string;
  SESSION_SECRET?: string;
  SKILLHUB_AUTH_BASE_URL?: string;
  SKILLHUB_AUTH_CALLBACK_BASE_URL?: string;
  SKILLHUB_AUTH_COOKIE_DOMAIN?: string;
  SKILLHUB_GITHUB_CLIENT_ID?: string;
  SKILLHUB_GITHUB_CLIENT_SECRET?: string;
  SKILLHUB_GOOGLE_CLIENT_ID?: string;
  SKILLHUB_GOOGLE_CLIENT_SECRET?: string;
  SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
  SKILLHUB_EMAIL_AUTH_SECRET?: string;
  SKILLHUB_ENV?: string;
  SKILLHUB_OAUTH_STATE_SECRET?: string;
  VERCEL_ENV?: string;
};

const organizationRoles: OrganizationRole[] = ["owner", "admin", "developer", "publisher", "reviewer", "finance"];
const platformRoles: PlatformRole[] = ["user", "support", "reviewer", "finance", "admin", "super_admin"];
const signupRoles: OrganizationRole[] = ["owner", "developer", "publisher"];

export async function authorize(
  authorizationHeader: string | undefined,
  allowedRoles: AuthRole[],
  scope: AuthorizationScope = {}
): Promise<AuthorizationResult> {
  const token = readBearer(authorizationHeader);

  if (!token) {
    return {
      ok: false,
      error: "Missing authorization bearer token.",
      status: 401
    };
  }

  const service = authorizeServiceToken(token);

  if (service) {
    return roleResult(service, allowedRoles);
  }

  const sql = await getSql();

  if (!sql) {
    return {
      ok: false,
      error: "DATABASE_URL is required for user role authorization.",
      status: 503
    };
  }

  const organizationId = await resolveOrganizationId(sql, scope);
  const subject = await findUserSubject(sql, token, organizationId);

  if (!subject) {
    return {
      ok: false,
      error: "Invalid or revoked user token.",
      status: 401
    };
  }

  if (scope.requireOrganization && !subject.organizationId) {
    return {
      ok: false,
      error: "This operation requires an organization-scoped user token.",
      status: 403
    };
  }

  return roleResult(subject, allowedRoles);
}

export async function requireServiceAuthorization(authorizationHeader: string | undefined): Promise<AuthorizationResult> {
  const token = readBearer(authorizationHeader);

  if (!token) {
    return {
      ok: false,
      error: "Missing authorization bearer token.",
      status: 401
    };
  }

  const service = authorizeServiceToken(token);

  if (!service) {
    return {
      ok: false,
      error: "Bootstrap requires the SkillHub service token.",
      status: 403
    };
  }

  return { ok: true, subject: service };
}

export async function createBootstrapUserToken(input: BootstrapTokenInput) {
  const sql = await requireSql();
  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(sql);
  const email = normalizeEmail(input.email);
  const organizationSlug = normalizeSlug(input.organizationSlug ?? "skillhub-demo");
  const organizationName = normalizeDisplay(input.organizationName, "SkillHub Demo Org");
  const displayName = normalizeDisplay(input.displayName, email);
  const role = normalizeOrganizationRole(input.role ?? "owner");
  const platformRole = normalizePlatformRole(input.platformRole ?? "admin");
  const tokenName = normalizeDisplay(input.tokenName, "SkillHub user token");
  const scopes = Array.isArray(input.scopes) ? input.scopes.map(String).filter(Boolean) : [];
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);

  return sql.begin(async (tx: Sql) => {
    const userRows = (await tx`
      insert into users (email, display_name, platform_role)
      values (${email}, ${displayName}, ${platformRole})
      on conflict (email) do update set
        display_name = coalesce(excluded.display_name, users.display_name),
        platform_role = excluded.platform_role
      returning id::text, email, display_name as "displayName", platform_role as "platformRole"
    `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;
    const user = userRows[0];

    if (authIdentitiesAvailable) {
      await upsertEmailAuthIdentity(tx, {
        displayName,
        email,
        userId: user.id
      });
    }

    const organizationRows = (await tx`
      insert into organizations (name, slug)
      values (${organizationName}, ${organizationSlug})
      on conflict (slug) do update set name = excluded.name
      returning id::text, name, slug
    `) as Array<{ id: string; name: string; slug: string }>;
    const organization = organizationRows[0];

    await tx`
      insert into organization_members (organization_id, user_id, role)
      values (${organization.id}, ${user.id}, ${role})
      on conflict (organization_id, user_id) do update set role = excluded.role
    `;

    const tokenRows = (await tx`
      insert into user_access_tokens (
        user_id,
        organization_id,
        name,
        token_hash,
        token_prefix,
        token_last4,
        scopes
      )
      values (
        ${user.id},
        ${organization.id},
        ${tokenName},
        ${tokenHash},
        'shub_user',
        ${rawToken.slice(-4)},
        ${scopes}
      )
      returning
        id::text,
        name,
        token_prefix as "tokenPrefix",
        token_last4 as "tokenLast4",
        created_at as "createdAt"
    `) as Array<{ id: string; name: string; tokenPrefix: string; tokenLast4: string; createdAt: string }>;

    return {
      user,
      organization,
      membership: {
        role
      },
      accessToken: {
        ...tokenRows[0],
        token: rawToken
      }
    };
  });
}

export async function createSignupUserToken(input: SignupTokenInput) {
  const sql = await requireSql();
  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(sql);
  const email = normalizeEmail(String(input.email ?? ""));
  const displayName = normalizeDisplay(String(input.displayName ?? ""), email);
  const organizationName = normalizeDisplay(String(input.organizationName ?? ""), `${displayName}'s workspace`);
  const organizationSlug = normalizeSignupSlug(String(input.organizationSlug ?? ""), organizationName);
  const role = normalizeSignupRole(input.role);
  const scopes: string[] = [];
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);

  return sql.begin(async (tx: Sql) => {
    const userRows = (await tx`
      insert into users (email, display_name, platform_role)
      values (${email}, ${displayName}, 'user')
      on conflict (email) do update set
        display_name = coalesce(excluded.display_name, users.display_name)
      returning id::text, email, display_name as "displayName", platform_role as "platformRole"
    `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;
    const user = userRows[0];

    if (authIdentitiesAvailable) {
      await upsertEmailAuthIdentity(tx, {
        displayName,
        email,
        userId: user.id
      });
    }

    const existingOrganizationRows = (await tx`
      select id::text
      from organizations
      where slug = ${organizationSlug}
      limit 1
    `) as Array<{ id: string }>;

    if (existingOrganizationRows.length > 0) {
      throw new Error("Workspace slug is already taken.");
    }

    const organizationRows = (await tx`
      insert into organizations (name, slug)
      values (${organizationName}, ${organizationSlug})
      returning id::text, name, slug
    `) as Array<{ id: string; name: string; slug: string }>;
    const organization = organizationRows[0];

    await tx`
      insert into organization_members (organization_id, user_id, role)
      values (${organization.id}, ${user.id}, ${role})
    `;

    const tokenRows = (await tx`
      insert into user_access_tokens (
        user_id,
        organization_id,
        name,
        token_hash,
        token_prefix,
        token_last4,
        scopes
      )
      values (
        ${user.id},
        ${organization.id},
        'SkillHub onboarding session',
        ${tokenHash},
        'shub_user',
        ${rawToken.slice(-4)},
        ${scopes}
      )
      returning
        id::text,
        name,
        token_prefix as "tokenPrefix",
        token_last4 as "tokenLast4",
        created_at as "createdAt"
    `) as Array<{ id: string; name: string; tokenPrefix: string; tokenLast4: string; createdAt: string }>;

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (${user.id}, 'auth.signup.created', 'organization', ${organization.id}, 'Self-service workspace signup.', ${tx.json({
        email,
        organizationSlug,
        role,
        tokenId: tokenRows[0].id
      })})
    `;

    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (${organization.id}, 'auth.signup.created', 'in_app', 'SkillHub workspace created', ${tx.json({
        organizationSlug,
        role,
        userId: user.id
      })}, 'queued')
    `;

    return {
      user,
      organization,
      membership: {
        role
      },
      accessToken: {
        ...tokenRows[0],
        token: rawToken
      }
    };
  });
}

export async function requestEmailAccessCode(input: EmailAccessStartInput, env?: OAuthRuntimeEnv) {
  const sql = await requireSql();

  if (!(await isEmailChallengesTableAvailable(sql))) {
    throw new Error("Email verification challenge storage is not available.");
  }

  const email = normalizeEmail(String(input.email ?? ""));
  const mode = normalizeEmailAccessMode(input.mode);
  const displayName = normalizeDisplay(String(input.displayName ?? ""), email);
  const organizationName =
    mode === "signup" ? normalizeDisplay(String(input.organizationName ?? ""), `${displayName}'s workspace`) : null;
  const organizationSlug = mode === "signup" ? normalizeSignupSlug(String(input.organizationSlug ?? ""), organizationName ?? email) : null;
  const role = mode === "signup" ? normalizeSignupRole(input.role) : null;
  const returnTo = normalizeReturnTo(input.returnTo ?? "/account");
  const code = randomNumericCode();
  const codeHash = await emailCodeHash(email, code, env);
  const exposeCode = shouldExposeEmailDebugCode(env);

  const rows = (await sql`
    insert into email_login_challenges (
      email,
      mode,
      code_hash,
      expires_at,
      display_name,
      organization_name,
      organization_slug,
      role,
      return_to,
      delivery_channel,
      delivery_status,
      metadata
    )
    values (
      ${email},
      ${mode},
      ${codeHash},
      now() + interval '10 minutes',
      ${displayName},
      ${organizationName},
      ${organizationSlug},
      ${role},
      ${returnTo},
      'email',
      'queued',
      ${sql.json({
        source: "email_access_code_request"
      })}
    )
    returning id::text as "challengeId", expires_at as "expiresAt", created_at as "createdAt"
  `) as Array<{ challengeId: string; createdAt: string; expiresAt: string }>;
  const challenge = rows[0];

  await sql`
    insert into notification_events (event_type, channel, subject, payload, status)
    values ('auth.email.code.requested', 'email', 'SkillHub verification code', ${sql.json({
      code,
      challengeId: challenge.challengeId,
      email,
      expiresAt: challenge.expiresAt,
      mode
    })}, 'queued')
  `;

  return {
    challengeId: challenge.challengeId,
    createdAt: challenge.createdAt,
    delivery: {
      channel: "email",
      status: "queued"
    },
    deliveryPreviewCode: exposeCode ? code : null,
    email,
    expiresAt: challenge.expiresAt,
    mode,
    organizationSlug,
    returnTo
  };
}

export async function verifyEmailAccessCode(input: EmailAccessVerifyInput, env?: OAuthRuntimeEnv) {
  const sql = await requireSql();

  if (!(await isEmailChallengesTableAvailable(sql))) {
    throw new Error("Email verification challenge storage is not available.");
  }

  const challengeId = normalizeUuid(String(input.challengeId ?? ""));
  const code = normalizeEmailCode(input.code);

  return sql.begin(async (tx: Sql) => {
    const challengeRows = (await tx`
      select
        id::text as "challengeId",
        email,
        mode,
        code_hash as "codeHash",
        attempts,
        max_attempts as "maxAttempts",
        expires_at as "expiresAt",
        consumed_at as "consumedAt",
        display_name as "displayName",
        organization_name as "organizationName",
        organization_slug as "organizationSlug",
        role,
        return_to as "returnTo"
      from email_login_challenges
      where id = ${challengeId}
      for update
    `) as Array<{
      attempts: number;
      challengeId: string;
      codeHash: string;
      consumedAt: string | null;
      displayName: string | null;
      email: string;
      expiresAt: string;
      maxAttempts: number;
      mode: EmailAccessMode;
      organizationName: string | null;
      organizationSlug: string | null;
      returnTo: string | null;
      role: OrganizationRole | null;
    }>;
    const challenge = challengeRows[0];

    if (!challenge) {
      throw new Error("Email verification challenge was not found.");
    }

    if (challenge.consumedAt) {
      throw new Error("Email verification code has already been used.");
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      throw new Error("Email verification code has expired.");
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new Error("Email verification code has too many failed attempts.");
    }

    const codeHash = await emailCodeHash(challenge.email, code, env);

    if (codeHash !== challenge.codeHash) {
      await tx`
        update email_login_challenges
        set attempts = attempts + 1,
            updated_at = now()
        where id = ${challenge.challengeId}
      `;
      throw new Error("Email verification code is invalid.");
    }

    await tx`
      update email_login_challenges
      set consumed_at = now(),
          updated_at = now()
      where id = ${challenge.challengeId}
    `;

    return challenge.mode === "signup"
      ? completeEmailSignup(tx, challenge)
      : completeEmailLogin(tx, challenge);
  });
}

export function publicSubject(subject: AuthSubject) {
  return {
    type: subject.type,
    userId: subject.userId,
    email: subject.email,
    displayName: subject.displayName,
    platformRole: subject.platformRole,
    organizationId: subject.organizationId,
    roles: subject.roles,
    tokenId: subject.tokenId
  };
}

export async function createOAuthAuthorizationUrl(provider: OAuthProvider, env?: OAuthRuntimeEnv, returnTo?: string) {
  const config = getOAuthConfig(provider, env);
  const state = await signOAuthState(
    {
      exp: Date.now() + 10 * 60 * 1000,
      provider,
      returnTo: normalizeReturnTo(returnTo)
    },
    getOAuthStateSecret(env)
  );
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: oauthRedirectUri(config),
    response_type: "code",
    scope: config.scope,
    state
  });

  if (provider === "google") {
    params.set("access_type", "online");
    params.set("prompt", "select_account");
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function completeOAuthLogin(provider: OAuthProvider, input: { code?: unknown; state?: unknown }, env?: OAuthRuntimeEnv) {
  const code = String(input.code ?? "").trim();
  const state = String(input.state ?? "").trim();

  if (!code || !state) {
    throw new Error("OAuth callback is missing code or state.");
  }

  const statePayload = await verifyOAuthState(state, getOAuthStateSecret(env));

  if (statePayload.provider !== provider) {
    throw new Error("OAuth state provider mismatch.");
  }

  const config = getOAuthConfig(provider, env);
  const profile = await fetchOAuthProfile(config, code);
  const sql = await requireSql();
  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(sql);
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);
  const providerName = provider === "google" ? "Google" : "GitHub";

  return sql.begin(async (tx: Sql) => {
    const identityUser = authIdentitiesAvailable ? await findUserByAuthIdentity(tx, provider, profile.providerUserId) : null;
    const user = identityUser ?? (await upsertOAuthUserByEmail(tx, profile));
    const membershipRows = (await tx`
      select
        om.organization_id::text as "organizationId",
        o.name,
        o.slug,
        om.role
      from organization_members om
      join organizations o on o.id = om.organization_id
      where om.user_id = ${user.id}
      order by om.created_at asc
      limit 1
    `) as Array<{ organizationId: string; name: string; role: OrganizationRole; slug: string }>;
    let membership = membershipRows[0];

    if (!membership) {
      const organizationName = `${profile.displayName ?? profile.email.split("@")[0]}'s workspace`;
      const organizationSlug = await uniqueOrganizationSlug(tx, normalizeSlug(organizationName));
      const organizationRows = (await tx`
        insert into organizations (name, slug)
        values (${organizationName}, ${organizationSlug})
        returning id::text as "organizationId", name, slug
      `) as Array<{ organizationId: string; name: string; slug: string }>;
      const organization = organizationRows[0];

      await tx`
        insert into organization_members (organization_id, user_id, role)
        values (${organization.organizationId}, ${user.id}, 'owner')
      `;

      membership = {
        ...organization,
        role: "owner"
      };
    }

    if (authIdentitiesAvailable) {
      await upsertOAuthAuthIdentity(tx, user.id, provider, profile);
    }

    const tokenRows = (await tx`
      insert into user_access_tokens (
        user_id,
        organization_id,
        name,
        token_hash,
        token_prefix,
        token_last4,
        scopes,
        expires_at
      )
      values (
        ${user.id},
        ${membership.organizationId},
        ${`${providerName} OAuth session`},
        ${tokenHash},
        'shub_user',
        ${rawToken.slice(-4)},
        ${[] as string[]},
        now() + interval '14 days'
      )
      returning
        id::text,
        name,
        token_prefix as "tokenPrefix",
        token_last4 as "tokenLast4",
        expires_at as "expiresAt",
        created_at as "createdAt"
    `) as Array<{ createdAt: string; expiresAt: string | null; id: string; name: string; tokenLast4: string; tokenPrefix: string }>;
    const token = tokenRows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (${user.id}, ${`auth.oauth.${provider}.login`}, 'user', ${user.id}, ${`${providerName} OAuth login completed.`}, ${tx.json({
        organizationId: membership.organizationId,
        provider,
        providerUserId: profile.providerUserId,
        tokenId: token.id
      })})
    `;

    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (${membership.organizationId}, ${`auth.oauth.${provider}.login`}, 'in_app', ${`${providerName} login connected`}, ${tx.json({
        provider,
        userId: user.id
      })}, 'queued')
    `;

    return {
      accessToken: {
        ...token,
        token: rawToken
      },
      organization: {
        id: membership.organizationId,
        name: membership.name,
        slug: membership.slug
      },
      returnTo: statePayload.returnTo,
      user
    };
  });
}

export function oauthSuccessRedirectUrl(returnTo: string | null | undefined, env?: OAuthRuntimeEnv) {
  const appUrl = getConfiguredValue(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL") ?? "https://useskillhub.com";
  const url = new URL(normalizeReturnTo(returnTo), appUrl);
  url.searchParams.set("oauth", "connected");
  return url.toString();
}

export function oauthErrorRedirectUrl(message: string, env?: OAuthRuntimeEnv) {
  const appUrl = getConfiguredValue(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL") ?? "https://useskillhub.com";
  const url = new URL("/login", appUrl);
  url.searchParams.set("oauth", "error");
  url.searchParams.set("message", message.slice(0, 160));
  return url.toString();
}

export function sessionCookieHeader(token: string, env?: OAuthRuntimeEnv) {
  const parts = [
    `skillhub_user_token=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 14}`
  ];
  const domain = getConfiguredValue(env?.SKILLHUB_AUTH_COOKIE_DOMAIN, "SKILLHUB_AUTH_COOKIE_DOMAIN") ?? inferredCookieDomain(env);

  if (domain) {
    parts.push(`Domain=${domain}`);
  }

  if ((getConfiguredValue(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL") ?? "").startsWith("https://")) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

async function completeEmailSignup(
  tx: Sql,
  challenge: {
    challengeId: string;
    displayName: string | null;
    email: string;
    organizationName: string | null;
    organizationSlug: string | null;
    returnTo: string | null;
    role: OrganizationRole | null;
  }
) {
  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(tx);
  const displayName = challenge.displayName ?? challenge.email;
  const organizationName = challenge.organizationName ?? `${displayName}'s workspace`;
  const organizationSlug = challenge.organizationSlug ?? normalizeSignupSlug("", organizationName);
  const role = challenge.role ?? "owner";
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);

  const existingOrganizationRows = (await tx`
    select id::text
    from organizations
    where slug = ${organizationSlug}
    limit 1
  `) as Array<{ id: string }>;

  if (existingOrganizationRows.length > 0) {
    throw new Error("Workspace slug is already taken.");
  }

  const userRows = (await tx`
    insert into users (email, display_name, platform_role)
    values (${challenge.email}, ${displayName}, 'user')
    on conflict (email) do update set
      display_name = coalesce(users.display_name, excluded.display_name)
    returning id::text, email, display_name as "displayName", platform_role as "platformRole"
  `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;
  const user = userRows[0];
  const organizationRows = (await tx`
    insert into organizations (name, slug)
    values (${organizationName}, ${organizationSlug})
    returning id::text, name, slug
  `) as Array<{ id: string; name: string; slug: string }>;
  const organization = organizationRows[0];

  await tx`
    insert into organization_members (organization_id, user_id, role)
    values (${organization.id}, ${user.id}, ${role})
    on conflict (organization_id, user_id) do update set role = excluded.role
  `;

  if (authIdentitiesAvailable) {
    await upsertEmailAuthIdentity(tx, {
      displayName,
      email: challenge.email,
      emailVerified: true,
      source: "email_code_signup",
      userId: user.id
    });
  }

  const tokenRows = (await tx`
    insert into user_access_tokens (
      user_id,
      organization_id,
      name,
      token_hash,
      token_prefix,
      token_last4,
      scopes,
      expires_at
    )
    values (
      ${user.id},
      ${organization.id},
      'Email verification session',
      ${tokenHash},
      'shub_user',
      ${rawToken.slice(-4)},
      ${[] as string[]},
      now() + interval '14 days'
    )
    returning
      id::text,
      name,
      token_prefix as "tokenPrefix",
      token_last4 as "tokenLast4",
      expires_at as "expiresAt",
      created_at as "createdAt"
  `) as Array<{ createdAt: string; expiresAt: string | null; id: string; name: string; tokenLast4: string; tokenPrefix: string }>;
  const token = tokenRows[0];

  await tx`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${user.id}, 'auth.email.signup.verified', 'organization', ${organization.id}, 'Email verification completed for workspace signup.', ${tx.json({
      challengeId: challenge.challengeId,
      email: challenge.email,
      organizationSlug,
      role,
      tokenId: token.id
    })})
  `;

  await tx`
    insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
    values (${user.id}, ${organization.id}, 'auth.email.signup.verified', 'in_app', 'Email workspace signup verified', ${tx.json({
      challengeId: challenge.challengeId,
      organizationSlug,
      role
    })}, 'queued')
  `;

  return {
    accessToken: {
      ...token,
      token: rawToken
    },
    organization,
    returnTo: normalizeReturnTo(challenge.returnTo),
    user
  };
}

async function completeEmailLogin(
  tx: Sql,
  challenge: {
    challengeId: string;
    displayName: string | null;
    email: string;
    returnTo: string | null;
  }
) {
  const authIdentitiesAvailable = await isAuthIdentitiesTableAvailable(tx);
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);
  const userRows = (await tx`
    select id::text, email, display_name as "displayName", platform_role as "platformRole"
    from users
    where email = ${challenge.email}
    limit 1
  `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;
  const user = userRows[0];

  if (!user) {
    throw new Error("No SkillHub workspace was found for this verified email.");
  }

  const membershipRows = (await tx`
    select
      om.organization_id::text as "organizationId",
      o.name,
      o.slug,
      om.role
    from organization_members om
    join organizations o on o.id = om.organization_id
    where om.user_id = ${user.id}
    order by om.created_at asc
    limit 1
  `) as Array<{ organizationId: string; name: string; role: OrganizationRole; slug: string }>;
  const membership = membershipRows[0];

  if (!membership) {
    throw new Error("No SkillHub workspace was found for this verified email.");
  }

  if (authIdentitiesAvailable) {
    await upsertEmailAuthIdentity(tx, {
      displayName: challenge.displayName ?? user.displayName,
      email: challenge.email,
      emailVerified: true,
      source: "email_code_login",
      userId: user.id
    });
  }

  const tokenRows = (await tx`
    insert into user_access_tokens (
      user_id,
      organization_id,
      name,
      token_hash,
      token_prefix,
      token_last4,
      scopes,
      expires_at
    )
    values (
      ${user.id},
      ${membership.organizationId},
      'Email verification session',
      ${tokenHash},
      'shub_user',
      ${rawToken.slice(-4)},
      ${[] as string[]},
      now() + interval '14 days'
    )
    returning
      id::text,
      name,
      token_prefix as "tokenPrefix",
      token_last4 as "tokenLast4",
      expires_at as "expiresAt",
      created_at as "createdAt"
  `) as Array<{ createdAt: string; expiresAt: string | null; id: string; name: string; tokenLast4: string; tokenPrefix: string }>;
  const token = tokenRows[0];

  await tx`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${user.id}, 'auth.email.login.verified', 'user', ${user.id}, 'Email verification completed for login.', ${tx.json({
      challengeId: challenge.challengeId,
      organizationId: membership.organizationId,
      tokenId: token.id
    })})
  `;

  await tx`
    insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
    values (${user.id}, ${membership.organizationId}, 'auth.email.login.verified', 'in_app', 'Email login verified', ${tx.json({
      challengeId: challenge.challengeId,
      organizationSlug: membership.slug
    })}, 'queued')
  `;

  return {
    accessToken: {
      ...token,
      token: rawToken
    },
    organization: {
      id: membership.organizationId,
      name: membership.name,
      slug: membership.slug
    },
    returnTo: normalizeReturnTo(challenge.returnTo),
    user
  };
}

function roleResult(subject: AuthSubject, allowedRoles: AuthRole[]): AuthorizationResult {
  const allowed = new Set<AuthRole>(allowedRoles);

  if (subject.platformRole === "super_admin" || subject.roles.includes("super_admin") || subject.roles.some((role) => allowed.has(role))) {
    return { ok: true, subject };
  }

  return {
    ok: false,
    error: `Requires one of these roles: ${allowedRoles.join(", ")}.`,
    status: 403
  };
}

function authorizeServiceToken(token: string): AuthSubject | undefined {
  const configuredToken = getProcessEnv("SKILLHUB_ADMIN_TOKEN");

  if (!configuredToken || token !== configuredToken) {
    return undefined;
  }

  return {
    type: "service",
    userId: null,
    email: null,
    displayName: "SkillHub service token",
    platformRole: "service",
    organizationId: null,
    roles: ["service", "super_admin", "admin", "finance", "reviewer", "publisher", "developer", "owner"],
    tokenId: null
  };
}

async function findUserSubject(sql: Sql, rawToken: string, organizationId?: string): Promise<AuthSubject | undefined> {
  const tokenHash = await sha256Hex(rawToken);
  const tokenRows = (await sql`
    select
      uat.id::text as "tokenId",
      uat.organization_id::text as "tokenOrganizationId",
      u.id::text as "userId",
      u.email,
      u.display_name as "displayName",
      u.platform_role as "platformRole"
    from user_access_tokens uat
    join users u on u.id = uat.user_id
    where uat.token_hash = ${tokenHash}
      and uat.revoked_at is null
      and (uat.expires_at is null or uat.expires_at > now())
    limit 1
  `) as Array<{
    tokenId: string;
    tokenOrganizationId: string | null;
    userId: string;
    email: string;
    displayName: string | null;
    platformRole: PlatformRole;
  }>;
  const token = tokenRows[0];

  if (!token) {
    return undefined;
  }

  const effectiveOrganizationId = organizationId ?? token.tokenOrganizationId ?? undefined;
  const membershipRows = effectiveOrganizationId
    ? ((await sql`
        select role
        from organization_members
        where user_id = ${token.userId}
          and organization_id = ${effectiveOrganizationId}
      `) as Array<{ role: OrganizationRole }>)
    : ((await sql`
        select role
        from organization_members
        where user_id = ${token.userId}
      `) as Array<{ role: OrganizationRole }>);
  const roles = Array.from(new Set<AuthRole>([token.platformRole, ...membershipRows.map((row) => row.role)]));

  await sql`
    update user_access_tokens
    set last_used_at = now()
    where id = ${token.tokenId}
  `;

  return {
    type: "user",
    userId: token.userId,
    email: token.email,
    displayName: token.displayName,
    platformRole: token.platformRole,
    organizationId: effectiveOrganizationId ?? null,
    roles,
    tokenId: token.tokenId
  };
}

async function resolveOrganizationId(sql: Sql, scope: AuthorizationScope) {
  if (scope.organizationId) {
    return scope.organizationId;
  }

  if (scope.projectSlug) {
    const rows = (await sql`
      select organization_id::text as "organizationId"
      from projects
      where slug = ${scope.projectSlug}
      limit 1
    `) as Array<{ organizationId: string }>;

    return rows[0]?.organizationId;
  }

  if (scope.publisherProfileId) {
    const rows = (await sql`
      select organization_id::text as "organizationId"
      from publisher_profiles
      where id = ${scope.publisherProfileId}
      limit 1
    `) as Array<{ organizationId: string }>;

    return rows[0]?.organizationId;
  }

  return undefined;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for identity operations.");
  }

  return sql;
}

async function isAuthIdentitiesTableAvailable(sql: Sql) {
  const rows = (await sql`
    select to_regclass('public.user_auth_identities') is not null as "exists"
  `) as Array<{ exists: boolean }>;

  return rows[0]?.exists === true;
}

async function isEmailChallengesTableAvailable(sql: Sql) {
  const rows = (await sql`
    select to_regclass('public.email_login_challenges') is not null as "exists"
  `) as Array<{ exists: boolean }>;

  return rows[0]?.exists === true;
}

function readBearer(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

function randomNumericCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 1_000_000).padStart(6, "0");
}

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function emailCodeHash(email: string, code: string, env?: OAuthRuntimeEnv) {
  return hmacSha256Hex(`${email}:${code}`, getEmailAuthSecret(env));
}

function getEmailAuthSecret(env?: OAuthRuntimeEnv) {
  const secret =
    getConfiguredValue(env?.SKILLHUB_EMAIL_AUTH_SECRET, "SKILLHUB_EMAIL_AUTH_SECRET") ??
    getConfiguredValue(env?.SKILLHUB_OAUTH_STATE_SECRET, "SKILLHUB_OAUTH_STATE_SECRET") ??
    getConfiguredValue(env?.SESSION_SECRET, "SESSION_SECRET") ??
    getProcessEnv("SKILLHUB_ADMIN_TOKEN");

  if (!secret) {
    throw new Error("Email verification secret is not configured.");
  }

  return secret;
}

function normalizeEmail(email?: string) {
  const value = email?.trim().toLowerCase();

  if (!value || !value.includes("@")) {
    throw new Error("A valid email is required.");
  }

  return value;
}

function normalizeEmailAccessMode(value: unknown): EmailAccessMode {
  const mode = String(value ?? "signup").trim();

  if (mode !== "login" && mode !== "signup") {
    throw new Error("Email access mode must be login or signup.");
  }

  return mode;
}

function normalizeEmailCode(value: unknown) {
  const code = String(value ?? "").replace(/\D/g, "");

  if (!/^\d{6}$/.test(code)) {
    throw new Error("Email verification code must be 6 digits.");
  }

  return code;
}

function normalizeUuid(value: string) {
  const normalized = value.trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    throw new Error("Email verification challenge id is invalid.");
  }

  return normalized;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "skillhub-demo";
}

function normalizeDisplay(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function normalizeSignupSlug(value: string, fallback: string) {
  const slug = (value.trim() || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `workspace-${randomToken(4)}`;
}

function normalizeOrganizationRole(role: OrganizationRole) {
  if (!organizationRoles.includes(role)) {
    throw new Error("Invalid organization role.");
  }

  return role;
}

function normalizePlatformRole(role: PlatformRole) {
  if (!platformRoles.includes(role)) {
    throw new Error("Invalid platform role.");
  }

  return role;
}

function normalizeSignupRole(value: unknown): OrganizationRole {
  const role = String(value ?? "owner").trim();

  if (!signupRoles.includes(role as OrganizationRole)) {
    throw new Error("Signup role must be owner, developer, or publisher.");
  }

  return role as OrganizationRole;
}

async function findUserByAuthIdentity(tx: Sql, provider: OAuthProvider, providerUserId: string) {
  const rows = (await tx`
    select
      u.id::text,
      u.email,
      u.display_name as "displayName",
      u.platform_role as "platformRole"
    from user_auth_identities identity
    join users u on u.id = identity.user_id
    where identity.provider = ${provider}
      and identity.provider_user_id = ${providerUserId}
    limit 1
  `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;

  if (!rows[0]) {
    return null;
  }

  return rows[0];
}

async function upsertOAuthUserByEmail(tx: Sql, profile: OAuthProfile) {
  const userRows = (await tx`
    insert into users (email, display_name, platform_role)
    values (${profile.email}, ${profile.displayName ?? profile.email}, 'user')
    on conflict (email) do update set
      display_name = coalesce(users.display_name, excluded.display_name)
    returning id::text, email, display_name as "displayName", platform_role as "platformRole"
  `) as Array<{ id: string; email: string; displayName: string | null; platformRole: PlatformRole }>;

  return userRows[0];
}

async function upsertEmailAuthIdentity(
  tx: Sql,
  input: { displayName: string | null; email: string; emailVerified?: boolean; source?: string; userId: string }
) {
  const emailVerified = input.emailVerified ?? false;

  await tx`
    insert into user_auth_identities (
      user_id,
      provider,
      provider_user_id,
      email,
      email_verified,
      display_name,
      metadata,
      last_login_at
    )
    values (
      ${input.userId},
      'email',
      ${input.email},
      ${input.email},
      ${emailVerified},
      ${input.displayName},
      ${tx.json({ source: input.source ?? "skillhub_email_signup" })},
      now()
    )
    on conflict (user_id, provider) do update set
      provider_user_id = excluded.provider_user_id,
      email = excluded.email,
      email_verified = user_auth_identities.email_verified or excluded.email_verified,
      display_name = coalesce(excluded.display_name, user_auth_identities.display_name),
      metadata = user_auth_identities.metadata || excluded.metadata,
      last_login_at = now(),
      updated_at = now()
  `;
}

async function upsertOAuthAuthIdentity(tx: Sql, userId: string, provider: OAuthProvider, profile: OAuthProfile) {
  await tx`
    insert into user_auth_identities (
      user_id,
      provider,
      provider_user_id,
      email,
      email_verified,
      display_name,
      avatar_url,
      metadata,
      last_login_at
    )
    values (
      ${userId},
      ${provider},
      ${profile.providerUserId},
      ${profile.email},
      ${profile.emailVerified},
      ${profile.displayName},
      ${profile.avatarUrl},
      ${tx.json({
        providerUserId: profile.providerUserId,
        source: "oauth_callback"
      })},
      now()
    )
    on conflict (user_id, provider) do update set
      provider_user_id = excluded.provider_user_id,
      email = excluded.email,
      email_verified = excluded.email_verified,
      display_name = coalesce(excluded.display_name, user_auth_identities.display_name),
      avatar_url = coalesce(excluded.avatar_url, user_auth_identities.avatar_url),
      metadata = user_auth_identities.metadata || excluded.metadata,
      last_login_at = now(),
      updated_at = now()
  `;
}

function getOAuthConfig(provider: OAuthProvider, env?: OAuthRuntimeEnv): OAuthProviderConfig {
  const callbackBaseUrl = getConfiguredValue(
    env?.SKILLHUB_AUTH_CALLBACK_BASE_URL ?? env?.SKILLHUB_AUTH_BASE_URL,
    "SKILLHUB_AUTH_CALLBACK_BASE_URL",
    "SKILLHUB_AUTH_BASE_URL"
  );
  const googleClientId = getConfiguredValue(env?.SKILLHUB_GOOGLE_CLIENT_ID ?? env?.GOOGLE_CLIENT_ID, "SKILLHUB_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID");
  const googleClientSecret = getConfiguredValue(
    env?.SKILLHUB_GOOGLE_CLIENT_SECRET ?? env?.GOOGLE_CLIENT_SECRET,
    "SKILLHUB_GOOGLE_CLIENT_SECRET",
    "GOOGLE_CLIENT_SECRET"
  );
  const githubClientId = getConfiguredValue(env?.SKILLHUB_GITHUB_CLIENT_ID ?? env?.GITHUB_CLIENT_ID, "SKILLHUB_GITHUB_CLIENT_ID", "GITHUB_CLIENT_ID");
  const githubClientSecret = getConfiguredValue(
    env?.SKILLHUB_GITHUB_CLIENT_SECRET ?? env?.GITHUB_CLIENT_SECRET,
    "SKILLHUB_GITHUB_CLIENT_SECRET",
    "GITHUB_CLIENT_SECRET"
  );

  if (!callbackBaseUrl) {
    throw new Error("OAuth callback base URL is not configured.");
  }

  if (provider === "google") {
    if (!googleClientId || !googleClientSecret) {
      throw new Error("Google OAuth client id or secret is not configured.");
    }

    return {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      callbackBaseUrl,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      provider,
      scope: "openid email profile",
      tokenUrl: "https://oauth2.googleapis.com/token"
    };
  }

  if (!githubClientId || !githubClientSecret) {
    throw new Error("GitHub OAuth client id or secret is not configured.");
  }

  return {
    authorizationUrl: "https://github.com/login/oauth/authorize",
    callbackBaseUrl,
    clientId: githubClientId,
    clientSecret: githubClientSecret,
    provider,
    scope: "read:user user:email",
    tokenUrl: "https://github.com/login/oauth/access_token"
  };
}

function oauthRedirectUri(config: OAuthProviderConfig) {
  return `${config.callbackBaseUrl.replace(/\/+$/, "")}/v1/auth/oauth/${config.provider}/callback`;
}

async function fetchOAuthProfile(config: OAuthProviderConfig, code: string): Promise<OAuthProfile> {
  const tokenResponse = await fetch(config.tokenUrl, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: oauthRedirectUri(config)
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });
  const tokenPayload = (await tokenResponse.json().catch(() => ({}))) as { access_token?: string; error?: string; error_description?: string };
  const accessToken = tokenPayload.access_token;

  if (!tokenResponse.ok || !accessToken) {
    throw new Error(tokenPayload.error_description ?? tokenPayload.error ?? "OAuth token exchange failed.");
  }

  return config.provider === "google" ? fetchGoogleProfile(accessToken) : fetchGitHubProfile(accessToken);
}

async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const profile = (await response.json().catch(() => ({}))) as {
    email?: string;
    id?: string;
    name?: string;
    picture?: string;
    verified_email?: boolean;
  };

  if (!response.ok || !profile.email || !profile.id) {
    throw new Error("Unable to read Google OAuth profile.");
  }

  const emailVerified = profile.verified_email === true;

  if (!emailVerified) {
    throw new Error("Google email must be verified before signing in.");
  }

  return {
    avatarUrl: profile.picture ?? null,
    displayName: profile.name ?? null,
    email: normalizeEmail(profile.email),
    emailVerified,
    providerUserId: profile.id
  };
}

async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile> {
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "SkillHub OAuth"
    }
  });
  const user = (await userResponse.json().catch(() => ({}))) as {
    avatar_url?: string | null;
    email?: string | null;
    id?: number;
    login?: string;
    name?: string | null;
  };

  if (!userResponse.ok || !user.id) {
    throw new Error("Unable to read GitHub OAuth profile.");
  }

  const email = await fetchPrimaryGitHubEmail(accessToken);

  if (!email) {
    throw new Error("GitHub account must expose a verified primary email before signing in.");
  }

  return {
    avatarUrl: user.avatar_url ?? null,
    displayName: user.name ?? user.login ?? null,
    email: normalizeEmail(email),
    emailVerified: true,
    providerUserId: String(user.id)
  };
}

async function fetchPrimaryGitHubEmail(accessToken: string) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "SkillHub OAuth"
    }
  });
  const emails = (await response.json().catch(() => [])) as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
  const primary = emails.find((email) => email.primary && email.verified) ?? emails.find((email) => email.verified);
  return primary?.email ?? null;
}

async function signOAuthState(payload: { exp: number; provider: OAuthProvider; returnTo: string }, secret: string) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256Hex(`${body}`, secret);
  return `${body}.${signature}`;
}

async function verifyOAuthState(state: string, secret: string) {
  const [body, signature] = state.split(".");

  if (!body || !signature || (await hmacSha256Hex(body, secret)) !== signature) {
    throw new Error("OAuth state is invalid.");
  }

  const payload = JSON.parse(base64UrlDecode(body)) as { exp?: number; provider?: OAuthProvider; returnTo?: string };

  if (payload.provider !== "google" && payload.provider !== "github") {
    throw new Error("OAuth state provider is invalid.");
  }

  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error("OAuth state has expired.");
  }

  return {
    provider: payload.provider,
    returnTo: normalizeReturnTo(payload.returnTo)
  };
}

async function hmacSha256Hex(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const bytes = new Uint8Array(signature);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(base64);
}

function getOAuthStateSecret(env?: OAuthRuntimeEnv) {
  const secret =
    getConfiguredValue(env?.SKILLHUB_OAUTH_STATE_SECRET, "SKILLHUB_OAUTH_STATE_SECRET") ??
    getConfiguredValue(env?.SESSION_SECRET, "SESSION_SECRET") ??
    getProcessEnv("SKILLHUB_ADMIN_TOKEN");

  if (!secret) {
    throw new Error("OAuth state secret is not configured.");
  }

  return secret;
}

function normalizeReturnTo(value: unknown) {
  const raw = String(value ?? "/account").trim();

  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/account";
  }

  return raw.slice(0, 200);
}

async function uniqueOrganizationSlug(sql: Sql, baseSlug: string) {
  const base = baseSlug || `workspace-${randomToken(4)}`;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${randomToken(2)}`;
    const rows = (await sql`
      select id::text
      from organizations
      where slug = ${candidate}
      limit 1
    `) as Array<{ id: string }>;

    if (rows.length === 0) {
      return candidate;
    }
  }

  return `${base}-${randomToken(4)}`;
}

function inferredCookieDomain(env?: OAuthRuntimeEnv) {
  const appUrl = getConfiguredValue(env?.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");

  if (!appUrl) {
    return null;
  }

  try {
    const hostname = new URL(appUrl).hostname;
    return hostname.endsWith("useskillhub.com") ? ".useskillhub.com" : null;
  } catch {
    return null;
  }
}

function shouldExposeEmailDebugCode(env?: OAuthRuntimeEnv) {
  if (isAuthProductionLike(env)) {
    return false;
  }

  const configured = getConfiguredValue(env?.SKILLHUB_EMAIL_AUTH_DEBUG_CODES, "SKILLHUB_EMAIL_AUTH_DEBUG_CODES")?.toLowerCase();

  if (configured) {
    return configured === "1" || configured === "true" || configured === "yes";
  }

  return false;
}

function isAuthProductionLike(env?: OAuthRuntimeEnv) {
  return [
    env?.SKILLHUB_ENV,
    env?.NODE_ENV,
    env?.VERCEL_ENV,
    getProcessEnv("SKILLHUB_ENV"),
    getProcessEnv("NODE_ENV"),
    getProcessEnv("VERCEL_ENV")
  ].some((value) => value?.trim().toLowerCase() === "production");
}

function getConfiguredValue(value: string | undefined, ...keys: string[]) {
  const direct = value?.trim();

  if (direct) {
    return direct;
  }

  for (const key of keys) {
    const fallback = getProcessEnv(key)?.trim();

    if (fallback) {
      return fallback;
    }
  }

  return undefined;
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
