import { getSql } from "./registry.js";
import type { OrganizationRole } from "./auth.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type TeamMemberInput = {
  displayName?: unknown;
  email?: unknown;
  role?: unknown;
  tokenName?: unknown;
};

type TeamMemberRemovalInput = {
  confirmation?: unknown;
  reason?: unknown;
};

export type OrganizationTeamMember = {
  userId: string;
  email: string;
  displayName: string | null;
  platformRole: string;
  role: OrganizationRole;
  tokenCount: number;
  activeTokenCount: number;
  lastTokenUsedAt: string | null;
  memberSince: string;
};

export type OrganizationTeamAccessToken = {
  id: string;
  name: string;
  tokenPrefix: string;
  tokenLast4: string;
  token: string;
  createdAt: string;
};

const organizationRoles: OrganizationRole[] = ["owner", "admin", "developer", "publisher", "reviewer", "finance"];

export async function listOrganizationTeamMembers(organizationId: string | null | undefined) {
  const sql = await getSql();

  if (!sql || !organizationId) {
    return [];
  }

  return listTeamRows(sql, organizationId);
}

export async function upsertOrganizationTeamMember(
  organizationId: string | null | undefined,
  input: TeamMemberInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const email = normalizeEmail(input.email);
  const displayName = normalizeOptionalText(input.displayName, 140);
  const role = normalizeRole(input.role);

  return sql.begin(async (tx: Sql) => {
    const userRows = (await tx`
      insert into users (email, display_name, platform_role)
      values (${email}, ${displayName ?? email}, 'user')
      on conflict (email) do update set
        display_name = coalesce(${displayName}, users.display_name)
      returning id::text, email, display_name as "displayName"
    `) as Array<{ id: string; email: string; displayName: string | null }>;
    const user = userRows[0];
    const previousRows = (await tx`
      select role
      from organization_members
      where organization_id = ${orgId}
        and user_id = ${user.id}
      limit 1
    `) as Array<{ role: OrganizationRole }>;
    const previousRole = previousRows[0]?.role ?? null;

    if (previousRole === "owner" && role !== "owner") {
      const ownerRows = (await tx`
        select count(*)::int as count
        from organization_members
        where organization_id = ${orgId}
          and role = 'owner'
      `) as Array<{ count: number }>;

      if (Number(ownerRows[0]?.count ?? 0) <= 1) {
        throw new Error("Cannot change the last organization owner to another role.");
      }
    }

    await tx`
      insert into organization_members (organization_id, user_id, role)
      values (${orgId}, ${user.id}, ${role})
      on conflict (organization_id, user_id) do update set role = excluded.role
    `;

    await recordTeamAudit(tx, actorUserId, previousRole ? "organization.member.role_updated" : "organization.member.added", user.id, {
      email,
      previousRole,
      role
    });
    await recordTeamNotification(tx, orgId, previousRole ? "account.team.role_updated" : "account.team.member_added", "Organization team updated", {
      email,
      previousRole,
      role,
      userId: user.id
    });

    return getTeamMember(tx, orgId, user.id);
  });
}

export async function removeOrganizationTeamMember(
  organizationId: string | null | undefined,
  userId: string,
  actorUserId: string | null | undefined,
  input: TeamMemberRemovalInput = {}
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const normalizedUserId = normalizeUuidText(userId, "userId");
  const confirmation = String(input.confirmation ?? "").trim();
  const reason = normalizeOptionalText(input.reason, 500);

  if (confirmation !== "REMOVE" || !reason || reason.length < 8) {
    throw new Error("Removing an organization team member requires confirmation and an audit reason.");
  }

  return sql.begin(async (tx: Sql) => {
    const member = await getTeamMember(tx, orgId, normalizedUserId);
    const ownerRows = (await tx`
      select count(*)::int as count
      from organization_members
      where organization_id = ${orgId}
        and role = 'owner'
    `) as Array<{ count: number }>;

    if (member.role === "owner" && Number(ownerRows[0]?.count ?? 0) <= 1) {
      throw new Error("Cannot remove the last organization owner.");
    }

    await tx`
      delete from organization_members
      where organization_id = ${orgId}
        and user_id = ${normalizedUserId}
    `;

    await tx`
      update user_access_tokens
      set revoked_at = coalesce(revoked_at, now())
      where organization_id = ${orgId}
        and user_id = ${normalizedUserId}
    `;

    await recordTeamAudit(tx, actorUserId, "organization.member.removed", normalizedUserId, {
      email: member.email,
      role: member.role
    }, reason);
    await recordTeamNotification(tx, orgId, "account.team.member_removed", "Organization team member removed", {
      email: member.email,
      role: member.role,
      userId: normalizedUserId
    });

    return {
      member,
      removed: true
    };
  });
}

export async function createOrganizationTeamMemberToken(
  organizationId: string | null | undefined,
  userId: string,
  input: TeamMemberInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const normalizedUserId = normalizeUuidText(userId, "userId");
  const tokenName = normalizeOptionalText(input.tokenName, 120) ?? "SkillHub team access";
  const rawToken = `shub_user_${randomToken(32)}`;
  const tokenHash = await sha256Hex(rawToken);

  return sql.begin(async (tx: Sql) => {
    const member = await getTeamMember(tx, orgId, normalizedUserId);
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
        ${normalizedUserId},
        ${orgId},
        ${tokenName},
        ${tokenHash},
        'shub_user',
        ${rawToken.slice(-4)},
        ${[]}
      )
      returning
        id::text,
        name,
        token_prefix as "tokenPrefix",
        token_last4 as "tokenLast4",
        created_at as "createdAt"
    `) as Array<Omit<OrganizationTeamAccessToken, "token">>;

    await recordTeamAudit(tx, actorUserId, "organization.member.token_created", normalizedUserId, {
      email: member.email,
      role: member.role,
      tokenName
    });
    await recordTeamNotification(tx, orgId, "account.team.token_created", "Organization team token created", {
      email: member.email,
      role: member.role,
      tokenId: tokenRows[0].id,
      tokenName,
      userId: normalizedUserId
    });

    return {
      accessToken: {
        ...tokenRows[0],
        token: rawToken
      },
      member: await getTeamMember(tx, orgId, normalizedUserId)
    };
  });
}

async function listTeamRows(sql: Sql, organizationId: string) {
  return (await sql`
    select
      u.id::text as "userId",
      u.email,
      u.display_name as "displayName",
      u.platform_role as "platformRole",
      om.role,
      count(uat.id)::int as "tokenCount",
      count(uat.id) filter (where uat.revoked_at is null and (uat.expires_at is null or uat.expires_at > now()))::int as "activeTokenCount",
      max(uat.last_used_at) as "lastTokenUsedAt",
      om.created_at as "memberSince"
    from organization_members om
    join users u on u.id = om.user_id
    left join user_access_tokens uat on uat.user_id = u.id and uat.organization_id = om.organization_id
    where om.organization_id = ${organizationId}
    group by u.id, u.email, u.display_name, u.platform_role, om.role, om.created_at
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
  `) as OrganizationTeamMember[];
}

async function getTeamMember(sql: Sql, organizationId: string, userId: string) {
  const rows = (await sql`
    select
      u.id::text as "userId",
      u.email,
      u.display_name as "displayName",
      u.platform_role as "platformRole",
      om.role,
      count(uat.id)::int as "tokenCount",
      count(uat.id) filter (where uat.revoked_at is null and (uat.expires_at is null or uat.expires_at > now()))::int as "activeTokenCount",
      max(uat.last_used_at) as "lastTokenUsedAt",
      om.created_at as "memberSince"
    from organization_members om
    join users u on u.id = om.user_id
    left join user_access_tokens uat on uat.user_id = u.id and uat.organization_id = om.organization_id
    where om.organization_id = ${organizationId}
      and om.user_id = ${userId}
    group by u.id, u.email, u.display_name, u.platform_role, om.role, om.created_at
    limit 1
  `) as OrganizationTeamMember[];

  if (!rows[0]) {
    throw new Error("Organization team member not found.");
  }

  return rows[0];
}

async function recordTeamAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityId: string,
  metadata: Record<string, unknown>,
  reason = "Organization team access changed."
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, 'organization_member', ${entityId}, ${reason}, ${sql.json(metadata)})
  `;
}

async function recordTeamNotification(
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

function normalizeEmail(value: unknown) {
  const email = String(value ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    throw new Error("A valid member email is required.");
  }

  return email.slice(0, 240);
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeRole(value: unknown): OrganizationRole {
  const role = String(value ?? "developer").trim();

  if (!organizationRoles.includes(role as OrganizationRole)) {
    throw new Error("Invalid organization role.");
  }

  return role as OrganizationRole;
}

function normalizeUuidText(value: unknown, label: string) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text;
}

function requireOrganizationId(organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error("Organization scope is required.");
  }

  return organizationId;
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

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for organization team operations.");
  }

  return sql;
}
