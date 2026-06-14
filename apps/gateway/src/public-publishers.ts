import {
  getPermissionLevel,
  type SkillManifest,
  type SkillSummary,
} from "@useskillhub/schema";
import { demoFallback } from "./demo-fallback.js";
import { demoSkills } from "./demo-skills.js";
import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PublisherProfileRow = {
  createdAt: string;
  displayName: string;
  id: string | null;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  payoutStatus:
    | "not_configured"
    | "verification_required"
    | "verified"
    | "blocked";
  publicAuthorName: string | null;
  status: "pending" | "active" | "restricted" | "suspended";
  updatedAt: string;
};

type PublicPublisherSchema = {
  organizations: boolean;
  projectSkillInstalls: boolean;
  publisherProfiles: boolean;
  skillInvocations: boolean;
  skillPrices: boolean;
  skillReviews: boolean;
  skillVersions: boolean;
  skills: boolean;
};

type PublicSupplyRow = {
  firstSkillCreatedAt: string;
  latestSkillUpdatedAt: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
};

type StoredPublisherProfileRow = {
  createdAt: string;
  displayName: string;
  id: string;
  organizationId: string;
  payoutStatus: PublisherProfileRow["payoutStatus"];
  status: PublisherProfileRow["status"];
  updatedAt: string;
};

type PublicAuthorRow = {
  organizationId: string;
  publicAuthorName: string | null;
};

type PublicPublisherSkill = {
  billingModel: "free" | "per_call" | "subscription";
  callCount: number;
  description: string;
  displayName: string;
  installCount: number;
  permissionLevel: SkillSummary["permissionLevel"];
  priceStatus: "draft" | "active" | "archived";
  slug: string;
  successRate: number | null;
  unitAmountCents: number;
  verificationStatus: SkillSummary["verificationStatus"];
  version: string | null;
};

export type PublicPublisherProfile = {
  createdAt: string;
  displayName: string;
  metrics: {
    activePaidSkillCount: number;
    avgSuccessRate: number | null;
    callCount: number;
    installCount: number;
    publicSkillCount: number;
    verifiedSkillCount: number;
  };
  payoutStatus: PublisherProfileRow["payoutStatus"];
  skills: PublicPublisherSkill[];
  slug: string;
  status: PublisherProfileRow["status"];
  trustLevel: "verified" | "active" | "limited" | "blocked";
  updatedAt: string;
};

export async function listPublicPublishers(
  limit = 20,
): Promise<PublicPublisherProfile[]> {
  const sql = await getSql();

  if (!sql) {
    return demoFallback(
      fallbackPublicPublishers().slice(0, normalizeLimit(limit)),
      [],
    );
  }

  const schema = await getPublicPublisherSchema(sql);
  const profiles = await listPublisherProfileRows(
    sql,
    normalizeLimit(limit),
    schema,
  );
  const hydrated = await Promise.all(
    profiles.map((profile) => hydratePublicPublisher(sql, profile, schema)),
  );
  return hydrated.filter((profile) => profile.skills.length > 0);
}

export async function getPublicPublisherProfile(
  slug: string,
): Promise<PublicPublisherProfile | null> {
  const normalizedSlug = canonicalPublisherSlug(slug);
  const sql = await getSql();

  if (!sql) {
    return demoFallback(
      fallbackPublicPublishers().find(
        (profile) => profile.slug === normalizedSlug,
      ) ?? null,
      null,
    );
  }

  const schema = await getPublicPublisherSchema(sql);
  const profiles = await listPublisherProfileRows(sql, 100, schema);
  const profile = profiles.find(
    (item) =>
      canonicalPublisherSlug(item.organizationSlug) === normalizedSlug ||
      canonicalPublisherSlug(item.displayName) === normalizedSlug ||
      canonicalPublisherSlug(item.organizationName) === normalizedSlug ||
      (item.publicAuthorName
        ? canonicalPublisherSlug(item.publicAuthorName) === normalizedSlug
        : false),
  );

  if (!profile) {
    return null;
  }

  const hydrated = await hydratePublicPublisher(sql, profile, schema);
  return hydrated.skills.length > 0 ? hydrated : null;
}

async function getPublicPublisherSchema(
  sql: Sql,
): Promise<PublicPublisherSchema> {
  const rows = (await sql`
    select
      to_regclass('public.organizations') is not null as organizations,
      to_regclass('public.project_skill_installs') is not null as "projectSkillInstalls",
      to_regclass('public.publisher_profiles') is not null as "publisherProfiles",
      to_regclass('public.skill_invocations') is not null as "skillInvocations",
      to_regclass('public.skill_prices') is not null as "skillPrices",
      to_regclass('public.skill_reviews') is not null as "skillReviews",
      to_regclass('public.skill_versions') is not null as "skillVersions",
      to_regclass('public.skills') is not null as skills
  `) as PublicPublisherSchema[];

  return (
    rows[0] ?? {
      organizations: false,
      projectSkillInstalls: false,
      publisherProfiles: false,
      skillInvocations: false,
      skillPrices: false,
      skillReviews: false,
      skillVersions: false,
      skills: false,
    }
  );
}

async function listPublisherProfileRows(
  sql: Sql,
  limit: number,
  schema: PublicPublisherSchema,
) {
  if (!hasPublicPublisherCoreSchema(schema)) {
    return [];
  }

  const supplyRows = await listPublicSupplyRows(sql);
  const profileRows = schema.publisherProfiles
    ? await listStoredPublisherProfiles(sql)
    : [];
  const authorRows = await listPublicAuthorRows(sql, schema);
  const profileByOrganizationId = new Map(
    profileRows.map((profile) => [profile.organizationId, profile]),
  );
  const authorByOrganizationId = new Map(
    authorRows.map((author) => [
      author.organizationId,
      author.publicAuthorName,
    ]),
  );

  return supplyRows
    .map((supply) => {
      const profile = profileByOrganizationId.get(supply.organizationId);
      const publicAuthorName =
        authorByOrganizationId.get(supply.organizationId) ?? null;

      return {
        createdAt: profile?.createdAt ?? supply.firstSkillCreatedAt,
        displayName:
          cleanDisplayName(profile?.displayName) ??
          cleanDisplayName(publicAuthorName) ??
          supply.organizationName,
        id: profile?.id ?? null,
        organizationId: supply.organizationId,
        organizationName: supply.organizationName,
        organizationSlug: supply.organizationSlug,
        payoutStatus: profile?.payoutStatus ?? "not_configured",
        publicAuthorName,
        status: profile?.status ?? "pending",
        updatedAt: profile?.updatedAt ?? supply.latestSkillUpdatedAt,
      } satisfies PublisherProfileRow;
    })
    .sort(comparePublisherRows)
    .slice(0, limit);
}

function hasPublicPublisherCoreSchema(schema: PublicPublisherSchema) {
  return schema.organizations && schema.skills && schema.skillVersions;
}

async function listPublicSupplyRows(sql: Sql) {
  return (await sql`
      select
        s.organization_id::text as "organizationId",
        o.name as "organizationName",
        o.slug as "organizationSlug",
        min(s.created_at)::text as "firstSkillCreatedAt",
        max(s.updated_at)::text as "latestSkillUpdatedAt"
      from skills s
      join organizations o on o.id = s.organization_id
      where s.visibility = 'public'
        and s.verification_status = 'verified'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
      group by s.organization_id, o.name, o.slug
      order by max(s.updated_at) desc
  `) as PublicSupplyRow[];
}

async function listStoredPublisherProfiles(sql: Sql) {
  return (await sql`
    with public_supply as (
      select distinct organization_id
      from skills
      where visibility = 'public'
        and verification_status = 'verified'
        and lower(coalesce(slug, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(description, '')) not like '%acceptance-%'
        and lower(coalesce(slug, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(description, '')) not like '%qa-%'
        and lower(coalesce(slug, '') || ' ' || coalesce(display_name, '') || ' ' || coalesce(description, '')) not like '%acceptance partner%'
    )
    select
      pp.id::text,
      pp.organization_id::text as "organizationId",
      pp.display_name as "displayName",
      pp.status,
      pp.payout_status as "payoutStatus",
      pp.created_at::text as "createdAt",
      pp.updated_at::text as "updatedAt"
    from publisher_profiles pp
    join public_supply on public_supply.organization_id = pp.organization_id
  `) as StoredPublisherProfileRow[];
}

async function listPublicAuthorRows(sql: Sql, schema: PublicPublisherSchema) {
  if (schema.skillReviews) {
    return (await sql`
      select distinct on (s.organization_id)
        s.organization_id::text as "organizationId",
        nullif(trim(latest.manifest -> 'author' ->> 'name'), '') as "publicAuthorName"
      from skills s
      join lateral (
        select sv.manifest
        from skill_versions sv
        left join lateral (
          select status, decided_at, created_at
          from skill_reviews
          where skill_version_id = sv.id
          order by created_at desc
          limit 1
        ) review on true
        where sv.skill_id = s.id
        order by
          case
            when review.status = 'approved' then 0
            when s.verification_status = 'submitted' and review.status in ('queued', 'in_review') then 1
            else 2
          end,
          coalesce(review.decided_at, review.created_at, sv.created_at) desc,
          sv.created_at desc
        limit 1
      ) latest on true
      where s.visibility = 'public'
        and s.verification_status = 'verified'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
        and nullif(trim(latest.manifest -> 'author' ->> 'name'), '') is not null
      order by
        s.organization_id,
        case s.verification_status when 'verified' then 0 when 'submitted' then 1 else 2 end,
        s.updated_at desc
    `) as PublicAuthorRow[];
  }

  return (await sql`
    select distinct on (s.organization_id)
      s.organization_id::text as "organizationId",
      nullif(trim(latest.manifest -> 'author' ->> 'name'), '') as "publicAuthorName"
    from skills s
    join lateral (
      select sv.manifest
      from skill_versions sv
      where sv.skill_id = s.id
      order by sv.created_at desc
      limit 1
    ) latest on true
    where s.visibility = 'public'
      and s.verification_status = 'verified'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
      and nullif(trim(latest.manifest -> 'author' ->> 'name'), '') is not null
    order by
      s.organization_id,
      case s.verification_status when 'verified' then 0 when 'submitted' then 1 else 2 end,
      s.updated_at desc
  `) as PublicAuthorRow[];
}

async function hydratePublicPublisher(
  sql: Sql,
  profile: PublisherProfileRow,
  schema: PublicPublisherSchema,
): Promise<PublicPublisherProfile> {
  const rows = await listPublicPublisherSkillRows(sql, profile, schema);
  const installCounts = schema.projectSkillInstalls
    ? await listSkillInstallCounts(sql, profile)
    : new Map<string, number>();
  const invocationMetrics = schema.skillInvocations
    ? await listSkillInvocationMetrics(sql, profile)
    : new Map<string, { callCount: number; successCount: number }>();
  const prices = schema.skillPrices
    ? await listSkillPricesForPublisher(sql, profile)
    : new Map<
        string,
        {
          billingModel: "free" | "per_call" | "subscription" | null;
          priceStatus: "draft" | "active" | "archived" | null;
          unitAmountCents: number | null;
        }
      >();
  const skills = rows.map((row) => {
    const invocation = invocationMetrics.get(row.slug);
    const price = prices.get(row.slug);

    return {
      billingModel: price?.billingModel ?? "free",
      callCount: invocation?.callCount ?? 0,
      description: row.description,
      displayName: row.displayName,
      installCount: installCounts.get(row.slug) ?? 0,
      permissionLevel: row.manifest?.permissions
        ? getPermissionLevel(row.manifest.permissions)
        : "medium",
      priceStatus: price?.priceStatus ?? "draft",
      slug: row.slug,
      successRate:
        invocation && invocation.callCount > 0
          ? invocation.successCount / invocation.callCount
          : null,
      unitAmountCents: price?.unitAmountCents ?? 0,
      verificationStatus: row.verificationStatus,
      version: row.version,
    };
  });

  return {
    createdAt: profile.createdAt,
    displayName: profile.displayName,
    metrics: publisherMetrics(skills),
    payoutStatus: profile.payoutStatus,
    skills,
    slug: canonicalPublisherSlug(profile.organizationSlug),
    status: profile.status,
    trustLevel: trustLevel(profile),
    updatedAt: profile.updatedAt,
  };
}

async function listPublicPublisherSkillRows(
  sql: Sql,
  profile: PublisherProfileRow,
  schema: PublicPublisherSchema,
) {
  if (schema.skillReviews) {
    return (await sql`
      select
        s.slug,
        s.display_name as "displayName",
        s.description,
        s.verification_status as "verificationStatus",
        latest.version,
        latest.manifest
      from skills s
      join organizations o on o.id = s.organization_id
      left join lateral (
        select sv.version, sv.manifest
        from skill_versions sv
        left join lateral (
          select status, decided_at, created_at
          from skill_reviews
          where skill_version_id = sv.id
          order by created_at desc
          limit 1
        ) review on true
        where sv.skill_id = s.id
        order by
          case
            when review.status = 'approved' then 0
            when s.verification_status = 'submitted' and review.status in ('queued', 'in_review') then 1
            else 2
          end,
          coalesce(review.decided_at, review.created_at, sv.created_at) desc,
          sv.created_at desc
        limit 1
      ) latest on true
      where o.slug = ${profile.organizationSlug}
        and s.visibility = 'public'
        and s.verification_status = 'verified'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
        and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
      order by
        case s.verification_status when 'verified' then 0 when 'submitted' then 1 when 'draft' then 2 else 3 end,
        s.updated_at desc
      limit 12
    `) as Array<{
      description: string;
      displayName: string;
      manifest: SkillManifest | null;
      slug: string;
      verificationStatus: SkillSummary["verificationStatus"];
      version: string | null;
    }>;
  }

  return (await sql`
    select
      s.slug,
      s.display_name as "displayName",
      s.description,
      s.verification_status as "verificationStatus",
      latest.version,
      latest.manifest
    from skills s
    join organizations o on o.id = s.organization_id
    left join lateral (
      select sv.version, sv.manifest
      from skill_versions sv
      where sv.skill_id = s.id
      order by sv.created_at desc
      limit 1
    ) latest on true
    where o.slug = ${profile.organizationSlug}
      and s.visibility = 'public'
      and s.verification_status = 'verified'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
    order by
      case s.verification_status when 'verified' then 0 when 'submitted' then 1 when 'draft' then 2 else 3 end,
      s.updated_at desc
    limit 12
  `) as Array<{
    description: string;
    displayName: string;
    manifest: SkillManifest | null;
    slug: string;
    verificationStatus: SkillSummary["verificationStatus"];
    version: string | null;
  }>;
}

async function listSkillInstallCounts(sql: Sql, profile: PublisherProfileRow) {
  const rows = (await sql`
    select s.slug, count(*)::int as "installCount"
    from skills s
    join organizations o on o.id = s.organization_id
    join project_skill_installs psi on psi.skill_id = s.id
    where o.slug = ${profile.organizationSlug}
      and s.visibility = 'public'
      and s.verification_status = 'verified'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
      and psi.status = 'installed'
    group by s.slug
  `) as Array<{ installCount: number; slug: string }>;

  return new Map(rows.map((row) => [row.slug, row.installCount]));
}

async function listSkillInvocationMetrics(
  sql: Sql,
  profile: PublisherProfileRow,
) {
  const rows = (await sql`
    select
      s.slug,
      count(*)::int as "callCount",
      count(*) filter (where si.status = 'success')::int as "successCount"
    from skills s
    join organizations o on o.id = s.organization_id
    join skill_invocations si on si.skill_id = s.id
    where o.slug = ${profile.organizationSlug}
      and s.visibility = 'public'
      and s.verification_status = 'verified'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
    group by s.slug
  `) as Array<{ callCount: number; slug: string; successCount: number }>;

  return new Map(
    rows.map((row) => [
      row.slug,
      { callCount: row.callCount, successCount: row.successCount },
    ]),
  );
}

async function listSkillPricesForPublisher(
  sql: Sql,
  profile: PublisherProfileRow,
) {
  const rows = (await sql`
    select distinct on (s.slug)
      s.slug,
      sp.billing_model as "billingModel",
      sp.unit_amount_cents as "unitAmountCents",
      sp.status as "priceStatus"
    from skills s
    join organizations o on o.id = s.organization_id
    join skill_prices sp on sp.skill_id = s.id
    where o.slug = ${profile.organizationSlug}
      and s.visibility = 'public'
      and s.verification_status = 'verified'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%qa-%'
      and lower(coalesce(s.slug, '') || ' ' || coalesce(s.display_name, '') || ' ' || coalesce(s.description, '')) not like '%acceptance partner%'
    order by s.slug, case when sp.status = 'active' then 0 else 1 end, sp.created_at desc
  `) as Array<{
    billingModel: "free" | "per_call" | "subscription" | null;
    priceStatus: "draft" | "active" | "archived" | null;
    slug: string;
    unitAmountCents: number | null;
  }>;

  return new Map(rows.map((row) => [row.slug, row]));
}

function fallbackPublicPublishers(): PublicPublisherProfile[] {
  const groups = new Map<string, SkillManifest[]>();

  demoSkills.forEach((skill) => {
    const publisher = skill.author?.name?.trim() || "SkillHub Publisher";
    const slug = canonicalPublisherSlug(publisher);
    groups.set(slug, [...(groups.get(slug) ?? []), skill]);
  });

  return Array.from(groups.entries()).map(([slug, skills]) => {
    const publicSkills: PublicPublisherSkill[] = skills.map((skill, index) => ({
      billingModel: index === 0 ? "per_call" : "free",
      callCount: index === 0 ? 12800 : 0,
      description: skill.description,
      displayName: skill.displayName,
      installCount: index === 0 ? 46 : 12,
      permissionLevel: getPermissionLevel(skill.permissions),
      priceStatus: "active" as const,
      slug: skill.name,
      successRate: index === 0 ? 0.97 : null,
      unitAmountCents: index === 0 ? 2 : 0,
      verificationStatus:
        index === 0 ? ("verified" as const) : ("submitted" as const),
      version: skill.version,
    }));

    return {
      createdAt: "demo",
      displayName: skills[0]?.author?.name ?? "SkillHub Publisher",
      metrics: publisherMetrics(publicSkills),
      payoutStatus: "verified",
      skills: publicSkills,
      slug,
      status: "active",
      trustLevel: "verified",
      updatedAt: "demo",
    };
  });
}

function publisherMetrics(skills: PublicPublisherSkill[]) {
  const callCount = skills.reduce((sum, skill) => sum + skill.callCount, 0);
  const successSamples = skills.filter((skill) => skill.successRate !== null);

  return {
    activePaidSkillCount: skills.filter(
      (skill) =>
        skill.priceStatus === "active" && skill.billingModel !== "free",
    ).length,
    avgSuccessRate:
      successSamples.length > 0
        ? successSamples.reduce(
            (sum, skill) => sum + (skill.successRate ?? 0),
            0,
          ) / successSamples.length
        : null,
    callCount,
    installCount: skills.reduce((sum, skill) => sum + skill.installCount, 0),
    publicSkillCount: skills.length,
    verifiedSkillCount: skills.filter(
      (skill) => skill.verificationStatus === "verified",
    ).length,
  };
}

function trustLevel(
  profile: PublisherProfileRow,
): PublicPublisherProfile["trustLevel"] {
  if (profile.status === "suspended" || profile.payoutStatus === "blocked") {
    return "blocked";
  }

  if (profile.status === "restricted") {
    return "limited";
  }

  if (profile.status === "active" && profile.payoutStatus === "verified") {
    return "verified";
  }

  return "active";
}

function cleanDisplayName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function comparePublisherRows(
  first: PublisherProfileRow,
  second: PublisherProfileRow,
) {
  return (
    publisherStatusRank(first.status) - publisherStatusRank(second.status) ||
    Date.parse(second.updatedAt) - Date.parse(first.updatedAt) ||
    first.organizationSlug.localeCompare(second.organizationSlug)
  );
}

function publisherStatusRank(status: PublisherProfileRow["status"]) {
  if (status === "active") {
    return 0;
  }

  if (status === "pending") {
    return 1;
  }

  if (status === "restricted") {
    return 2;
  }

  return 3;
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(limit) || 20, 1), 50);
}

const publisherSlugAliases: Record<string, string> = {
  "skillhub-publisher": "skillhub",
};

const publisherDisplayNameSlugs: Record<string, string> = {
  "skillhub publisher": "skillhub",
};

function canonicalPublisherSlug(value: string) {
  const normalizedName = value.trim().toLowerCase();
  const displayNameSlug = publisherDisplayNameSlugs[normalizedName];

  if (displayNameSlug) {
    return displayNameSlug;
  }

  const slug = normalizeSlug(value);
  return publisherSlugAliases[slug] ?? slug;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
