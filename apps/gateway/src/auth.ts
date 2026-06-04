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

const organizationRoles: OrganizationRole[] = ["owner", "admin", "developer", "publisher", "reviewer", "finance"];
const platformRoles: PlatformRole[] = ["user", "support", "reviewer", "finance", "admin", "super_admin"];

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

function readBearer(header?: string): string | undefined {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
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

function normalizeEmail(email?: string) {
  const value = email?.trim().toLowerCase();

  if (!value || !value.includes("@")) {
    throw new Error("A valid email is required.");
  }

  return value;
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

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}
