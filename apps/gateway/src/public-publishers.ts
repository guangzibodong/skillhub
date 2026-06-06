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
  id: string;
  organizationName: string;
  organizationSlug: string;
  payoutStatus:
    | "not_configured"
    | "verification_required"
    | "verified"
    | "blocked";
  status: "pending" | "active" | "restricted" | "suspended";
  updatedAt: string;
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

  const profiles = await listPublisherProfileRows(sql, normalizeLimit(limit));
  const hydrated = await Promise.all(
    profiles.map((profile) => hydratePublicPublisher(sql, profile)),
  );
  return hydrated.filter((profile) => profile.skills.length > 0);
}

export async function getPublicPublisherProfile(
  slug: string,
): Promise<PublicPublisherProfile | null> {
  const normalizedSlug = normalizeSlug(slug);
  const sql = await getSql();

  if (!sql) {
    return demoFallback(
      fallbackPublicPublishers().find(
        (profile) => profile.slug === normalizedSlug,
      ) ?? null,
      null,
    );
  }

  const profiles = await listPublisherProfileRows(sql, 100);
  const profile = profiles.find(
    (item) =>
      item.organizationSlug === normalizedSlug ||
      normalizeSlug(item.displayName) === normalizedSlug,
  );

  if (!profile) {
    return null;
  }

  const hydrated = await hydratePublicPublisher(sql, profile);
  return hydrated.skills.length > 0 ? hydrated : null;
}

async function listPublisherProfileRows(sql: Sql, limit: number) {
  return (await sql`
    select
      pp.id::text,
      pp.display_name as "displayName",
      pp.status,
      pp.payout_status as "payoutStatus",
      pp.created_at as "createdAt",
      pp.updated_at as "updatedAt",
      o.name as "organizationName",
      o.slug as "organizationSlug"
    from publisher_profiles pp
    join organizations o on o.id = pp.organization_id
    where exists (
      select 1
      from skills s
      where s.organization_id = pp.organization_id
        and s.visibility = 'public'
    )
    order by
      case pp.status when 'active' then 0 when 'pending' then 1 when 'restricted' then 2 else 3 end,
      pp.updated_at desc
    limit ${limit}
  `) as PublisherProfileRow[];
}

async function hydratePublicPublisher(
  sql: Sql,
  profile: PublisherProfileRow,
): Promise<PublicPublisherProfile> {
  const rows = (await sql`
    select
      s.slug,
      s.display_name as "displayName",
      s.description,
      s.verification_status as "verificationStatus",
      latest.version,
      latest.manifest,
      coalesce(installs.install_count, 0)::int as "installCount",
      coalesce(invocations.call_count, 0)::int as "callCount",
      coalesce(invocations.success_count, 0)::int as "successCount",
      price.billing_model as "billingModel",
      price.unit_amount_cents as "unitAmountCents",
      price.status as "priceStatus"
    from skills s
    join organizations o on o.id = s.organization_id
    left join lateral (
      select version, manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
    left join lateral (
      select count(*) as install_count
      from project_skill_installs
      where skill_id = s.id
        and status = 'installed'
    ) installs on true
    left join lateral (
      select
        count(*) as call_count,
        count(*) filter (where status = 'success') as success_count
      from skill_invocations
      where skill_id = s.id
    ) invocations on true
    left join lateral (
      select billing_model, unit_amount_cents, status
      from skill_prices
      where skill_id = s.id
      order by case when status = 'active' then 0 else 1 end, created_at desc
      limit 1
    ) price on true
    where o.slug = ${profile.organizationSlug}
      and s.visibility = 'public'
    order by
      case s.verification_status when 'verified' then 0 when 'submitted' then 1 when 'draft' then 2 else 3 end,
      s.updated_at desc
    limit 12
  `) as Array<{
    billingModel: "free" | "per_call" | "subscription" | null;
    callCount: number;
    description: string;
    displayName: string;
    installCount: number;
    manifest: SkillManifest | null;
    priceStatus: "draft" | "active" | "archived" | null;
    slug: string;
    successCount: number;
    unitAmountCents: number | null;
    verificationStatus: SkillSummary["verificationStatus"];
    version: string | null;
  }>;
  const skills = rows.map((row) => ({
    billingModel: row.billingModel ?? "free",
    callCount: row.callCount,
    description: row.description,
    displayName: row.displayName,
    installCount: row.installCount,
    permissionLevel: row.manifest?.permissions
      ? getPermissionLevel(row.manifest.permissions)
      : "medium",
    priceStatus: row.priceStatus ?? "draft",
    slug: row.slug,
    successRate: row.callCount > 0 ? row.successCount / row.callCount : null,
    unitAmountCents: row.unitAmountCents ?? 0,
    verificationStatus: row.verificationStatus,
    version: row.version,
  }));

  return {
    createdAt: profile.createdAt,
    displayName: profile.displayName,
    metrics: publisherMetrics(skills),
    payoutStatus: profile.payoutStatus,
    skills,
    slug: profile.organizationSlug,
    status: profile.status,
    trustLevel: trustLevel(profile),
    updatedAt: profile.updatedAt,
  };
}

function fallbackPublicPublishers(): PublicPublisherProfile[] {
  const groups = new Map<string, SkillManifest[]>();

  demoSkills.forEach((skill) => {
    const publisher = skill.author?.name?.trim() || "SkillHub Publisher";
    const slug = normalizeSlug(publisher);
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

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(limit) || 20, 1), 50);
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
