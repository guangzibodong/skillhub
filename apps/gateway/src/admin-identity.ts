import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type MembershipRecord = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
};

export type AdminIdentityOrganization = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  projectCount: number;
  skillCount: number;
  publisherProfileCount: number;
  activeTokenCount: number;
  invocationCount: number;
  ledgerCents: number;
  lastTokenUsedAt: string | null;
  createdAt: string;
};

export type AdminIdentityUser = {
  id: string;
  email: string;
  displayName: string | null;
  platformRole: string;
  organizationCount: number;
  memberships: MembershipRecord[];
  tokenCount: number;
  activeTokenCount: number;
  lastTokenUsedAt: string | null;
  createdAt: string;
};

export type AdminIdentityDirectory = {
  organizations: AdminIdentityOrganization[];
  summary: {
    activeTokenCount: number;
    adminUserCount: number;
    organizationCount: number;
    userCount: number;
  };
  users: AdminIdentityUser[];
};

export async function getAdminIdentityDirectory(limit = 12): Promise<AdminIdentityDirectory> {
  const sql = await getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 12), 1), 50);

  if (!sql) {
    return {
      organizations: [],
      summary: emptySummary(),
      users: []
    };
  }

  const [summaryRows, organizationRows, userRows] = await Promise.all([
    getSummary(sql),
    getOrganizations(sql, safeLimit),
    getUsers(sql, safeLimit)
  ]);

  return {
    organizations: organizationRows,
    summary: summaryRows,
    users: userRows.map((user) => ({
      ...user,
      memberships: normalizeMemberships(user.memberships)
    }))
  };
}

async function getSummary(sql: Sql) {
  const rows = (await sql`
    select
      (select count(*)::int from users) as "userCount",
      (select count(*)::int from organizations) as "organizationCount",
      (
        select count(*)::int
        from users
        where platform_role in ('support', 'reviewer', 'finance', 'admin', 'super_admin')
      ) as "adminUserCount",
      (
        select count(*)::int
        from user_access_tokens
        where revoked_at is null
          and (expires_at is null or expires_at > now())
      ) as "activeTokenCount"
  `) as Array<AdminIdentityDirectory["summary"]>;

  return rows[0] ?? emptySummary();
}

function emptySummary() {
  return {
    activeTokenCount: 0,
    adminUserCount: 0,
    organizationCount: 0,
    userCount: 0
  };
}

async function getOrganizations(sql: Sql, limit: number) {
  return (await sql`
    select
      o.id::text,
      o.name,
      o.slug,
      (
        select count(*)::int
        from organization_members om
        where om.organization_id = o.id
      ) as "memberCount",
      (
        select count(*)::int
        from projects p
        where p.organization_id = o.id
      ) as "projectCount",
      (
        select count(*)::int
        from skills s
        where s.organization_id = o.id
      ) as "skillCount",
      (
        select count(*)::int
        from publisher_profiles pp
        where pp.organization_id = o.id
      ) as "publisherProfileCount",
      (
        select count(*)::int
        from user_access_tokens uat
        where uat.organization_id = o.id
          and uat.revoked_at is null
          and (uat.expires_at is null or uat.expires_at > now())
      ) as "activeTokenCount",
      (
        select count(*)::int
        from skill_invocations si
        join projects p on p.id = si.project_id
        where p.organization_id = o.id
      ) as "invocationCount",
      (
        select coalesce(sum(t.amount_cents), 0)::float8
        from transactions t
        join projects p on p.id = t.project_id
        where p.organization_id = o.id
          and t.status = 'posted'
      ) as "ledgerCents",
      (
        select max(uat.last_used_at)
        from user_access_tokens uat
        where uat.organization_id = o.id
      ) as "lastTokenUsedAt",
      o.created_at as "createdAt"
    from organizations o
    order by
      "memberCount" desc,
      "projectCount" desc,
      o.created_at desc
    limit ${limit}
  `) as AdminIdentityOrganization[];
}

async function getUsers(sql: Sql, limit: number) {
  return (await sql`
    select
      u.id::text,
      u.email,
      u.display_name as "displayName",
      u.platform_role as "platformRole",
      (
        select count(*)::int
        from organization_members om
        where om.user_id = u.id
      ) as "organizationCount",
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'organizationId', o.id::text,
              'organizationName', o.name,
              'organizationSlug', o.slug,
              'role', om.role
            )
            order by o.name asc
          )
          from organization_members om
          join organizations o on o.id = om.organization_id
          where om.user_id = u.id
        ),
        '[]'::jsonb
      ) as memberships,
      (
        select count(*)::int
        from user_access_tokens uat
        where uat.user_id = u.id
      ) as "tokenCount",
      (
        select count(*)::int
        from user_access_tokens uat
        where uat.user_id = u.id
          and uat.revoked_at is null
          and (uat.expires_at is null or uat.expires_at > now())
      ) as "activeTokenCount",
      (
        select max(uat.last_used_at)
        from user_access_tokens uat
        where uat.user_id = u.id
      ) as "lastTokenUsedAt",
      u.created_at as "createdAt"
    from users u
    order by
      case u.platform_role
        when 'super_admin' then 0
        when 'admin' then 1
        when 'support' then 2
        when 'finance' then 3
        when 'reviewer' then 4
        else 5
      end,
      "activeTokenCount" desc,
      u.created_at desc
    limit ${limit}
  `) as Array<Omit<AdminIdentityUser, "memberships"> & { memberships: unknown }>;
}

function normalizeMemberships(value: unknown): MembershipRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    return [
      {
        organizationId: String(record.organizationId ?? ""),
        organizationName: String(record.organizationName ?? ""),
        organizationSlug: String(record.organizationSlug ?? ""),
        role: String(record.role ?? "")
      }
    ];
  });
}
