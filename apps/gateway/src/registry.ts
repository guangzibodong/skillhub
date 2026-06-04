import {
  assertSkillManifest,
  getPermissionLevel,
  type SkillBillingModel,
  type SkillManifest,
  type SkillRuntime,
  type SkillSummary
} from "@useskillhub/schema";
import { demoSkills } from "./demo-skills.js";

type SqlClient = Awaited<ReturnType<typeof getSql>>;

type SkillRow = {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  tags: string[];
  verification_status: SkillSummary["verificationStatus"];
  version: string;
  manifest: SkillManifest;
  billing_model: SkillBillingModel | null;
  install_count: number;
  invocation_count: number;
  success_rate: number | null;
  avg_latency_ms: number | null;
  updated_at: string;
};

type RegistryStats = {
  publishedSkills: number;
  verifiedSkills: number;
  apiCalls: number;
  avgLatencyMs: number | null;
};

type SearchOptions = {
  billingModel?: SkillBillingModel;
  query?: string;
  tags?: string[];
  limit?: number;
  permissionLevel?: SkillSummary["permissionLevel"];
  runtimeType?: SkillRuntime["type"];
  sort?: "adoption" | "low_risk" | "recommended" | "recent" | "success";
  verificationStatus?: SkillSummary["verificationStatus"];
};

let sqlPromise: Promise<unknown> | undefined;
let seeded = false;

export async function searchSkills(options: SearchOptions = {}): Promise<SkillSummary[]> {
  const sql = await getSql();

  if (!sql) {
    return filterSummaries(demoSkills.map(toSummary), options);
  }

  await seedDemoData(sql);

  const rows = (await sql`
    select
      s.id::text,
      s.slug,
      s.display_name,
      s.description,
      s.tags,
      s.verification_status,
      s.updated_at::text,
      latest.version,
      latest.manifest,
      price.billing_model,
      coalesce(installs.install_count, 0)::int as install_count,
      coalesce(invocations.invocation_count, 0)::int as invocation_count,
      invocations.success_rate,
      invocations.avg_latency_ms
    from skills s
    join lateral (
      select version, manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
    left join lateral (
      select billing_model
      from skill_prices
      where skill_id = s.id and status = 'active'
      order by created_at desc
      limit 1
    ) price on true
    left join lateral (
      select count(*)::int as install_count
      from project_skill_installs
      where skill_id = s.id and status = 'installed'
    ) installs on true
    left join lateral (
      select
        count(*)::int as invocation_count,
        (count(*) filter (where status = 'success'))::float / nullif(count(*), 0) as success_rate,
        round(avg(latency_ms))::int as avg_latency_ms
      from skill_invocations
      where skill_id = s.id
    ) invocations on true
    where s.visibility = 'public'
    order by s.updated_at desc
  `) as SkillRow[];

  return filterSummaries(rows.map(rowToSummary), options);
}

export async function listSkillManifests(): Promise<SkillManifest[]> {
  const sql = await getSql();

  if (!sql) {
    return demoSkills;
  }

  await seedDemoData(sql);

  const rows = (await sql`
    select latest.manifest
    from skills s
    join lateral (
      select manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
    where s.visibility = 'public'
    order by s.updated_at desc
  `) as Array<{ manifest: SkillManifest }>;

  return rows.map((row) => row.manifest);
}

export async function getSkillManifest(slug: string): Promise<SkillManifest | undefined> {
  const sql = await getSql();

  if (!sql) {
    return demoSkills.find((skill) => skill.name === slug);
  }

  await seedDemoData(sql);

  const rows = (await sql`
    select sv.manifest
    from skills s
    join skill_versions sv on sv.skill_id = s.id
    where s.slug = ${slug}
    order by sv.created_at desc
    limit 1
  `) as Array<{ manifest: SkillManifest }>;

  return rows[0]?.manifest;
}

export async function publishSkill(
  manifest: unknown,
  organizationId?: string | null
): Promise<{ id: string; slug: string; status: string }> {
  assertSkillManifest(manifest);

  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required to publish skills.");
  }

  await seedDemoData(sql);

  const ownerOrganizationId = organizationId ?? (await upsertDefaultOrganization(sql)).id;
  const existingRows = (await sql`
    select organization_id::text as "organizationId"
    from skills
    where slug = ${manifest.name}
    limit 1
  `) as Array<{ organizationId: string }>;

  if (existingRows[0] && existingRows[0].organizationId !== ownerOrganizationId) {
    throw new Error("Skill slug is already owned by another organization.");
  }

  const skillRows = (await sql`
    insert into skills (
      organization_id,
      slug,
      display_name,
      description,
      tags,
      visibility,
      verification_status,
      updated_at
    )
    values (
      ${ownerOrganizationId},
      ${manifest.name},
      ${manifest.displayName},
      ${manifest.description},
      ${manifest.tags},
      'public',
      'draft',
      now()
    )
    on conflict (slug) do update set
      display_name = excluded.display_name,
      description = excluded.description,
      tags = excluded.tags,
      updated_at = now()
    returning id::text, slug, verification_status
  `) as Array<{ id: string; slug: string; verification_status: string }>;

  const skill = skillRows[0];

  await sql`
    insert into skill_versions (skill_id, version, manifest)
    values (${skill.id}, ${manifest.version}, ${sql.json(manifest)})
    on conflict (skill_id, version) do update set
      manifest = excluded.manifest,
      created_at = now()
  `;

  return {
    id: skill.id,
    slug: skill.slug,
    status: skill.verification_status
  };
}

export async function getRegistryStats(): Promise<RegistryStats> {
  const sql = await getSql();

  if (!sql) {
    return {
      publishedSkills: demoSkills.length,
      verifiedSkills: 1,
      apiCalls: 0,
      avgLatencyMs: null
    };
  }

  await seedDemoData(sql);

  const skillRows = (await sql`
    select
      count(*)::int as published_skills,
      count(*) filter (where verification_status = 'verified')::int as verified_skills
    from skills
    where visibility = 'public'
  `) as Array<{ published_skills: number; verified_skills: number }>;

  const invocationRows = (await sql`
    select
      count(*)::int as api_calls,
      round(avg(latency_ms))::int as avg_latency_ms
    from skill_invocations
  `) as Array<{ api_calls: number; avg_latency_ms: number | null }>;

  return {
    publishedSkills: skillRows[0]?.published_skills ?? 0,
    verifiedSkills: skillRows[0]?.verified_skills ?? 0,
    apiCalls: invocationRows[0]?.api_calls ?? 0,
    avgLatencyMs: invocationRows[0]?.avg_latency_ms ?? null
  };
}

function filterSummaries(skills: SkillSummary[], options: SearchOptions): SkillSummary[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  const tags = (options.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  const limit = options.limit && Number.isFinite(options.limit) ? options.limit : 20;

  const filtered = skills
    .filter((skill) => {
      const normalizedTags = skill.tags.map((tag) => tag.toLowerCase());
      const queryMatch =
        !query ||
        skill.slug.toLowerCase().includes(query) ||
        skill.displayName.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        normalizedTags.some((tag) => tag.includes(query));

      const tagMatch = tags.length === 0 || tags.every((tag) => normalizedTags.includes(tag));
      const permissionMatch = !options.permissionLevel || skill.permissionLevel === options.permissionLevel;
      const runtimeMatch = !options.runtimeType || skill.runtimeType === options.runtimeType;
      const billingMatch = !options.billingModel || (skill.billingModel ?? "free") === options.billingModel;
      const verificationMatch = !options.verificationStatus || skill.verificationStatus === options.verificationStatus;

      return queryMatch && tagMatch && permissionMatch && runtimeMatch && billingMatch && verificationMatch;
    })
    .sort((first, second) => compareSummaries(first, second, options.sort ?? "recommended", query));

  return filtered.slice(0, Math.min(Math.max(limit, 1), 100));
}

function rowToSummary(row: SkillRow): SkillSummary {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    description: row.description,
    tags: row.tags,
    version: row.version,
    verificationStatus: row.verification_status,
    permissionLevel: getPermissionLevel(row.manifest.permissions),
    runtimeType: row.manifest.runtime.type,
    billingModel: row.billing_model ?? "free",
    installCount: row.install_count,
    invocationCount: row.invocation_count,
    successRate: row.success_rate,
    avgLatencyMs: row.avg_latency_ms,
    updatedAt: row.updated_at
  };
}

function toSummary(skill: SkillManifest): SkillSummary {
  const status: SkillSummary["verificationStatus"] =
    skill.name === "browser-research" ? "verified" : skill.name === "dataset-summarizer" ? "submitted" : "draft";

  return {
    id: skill.name,
    slug: skill.name,
    displayName: skill.displayName,
    description: skill.description,
    tags: skill.tags,
    version: skill.version,
    verificationStatus: status,
    permissionLevel: getPermissionLevel(skill.permissions),
    runtimeType: skill.runtime.type,
    billingModel: "free",
    installCount: 0,
    invocationCount: 0,
    successRate: null,
    avgLatencyMs: null,
    updatedAt: "demo"
  };
}

function compareSummaries(
  first: SkillSummary,
  second: SkillSummary,
  sort: NonNullable<SearchOptions["sort"]>,
  query: string
) {
  if (sort === "adoption") {
    return (second.installCount ?? 0) - (first.installCount ?? 0) || first.slug.localeCompare(second.slug);
  }

  if (sort === "success") {
    return (second.successRate ?? 0) - (first.successRate ?? 0) || recommendedScore(second, query) - recommendedScore(first, query);
  }

  if (sort === "low_risk") {
    return permissionRank(first.permissionLevel) - permissionRank(second.permissionLevel) || recommendedScore(second, query) - recommendedScore(first, query);
  }

  if (sort === "recent") {
    return parseDate(second.updatedAt) - parseDate(first.updatedAt) || recommendedScore(second, query) - recommendedScore(first, query);
  }

  return recommendedScore(second, query) - recommendedScore(first, query) || first.slug.localeCompare(second.slug);
}

function recommendedScore(skill: SkillSummary, query: string) {
  let score = 0;
  const normalizedName = skill.displayName.toLowerCase();
  const normalizedTags = skill.tags.join(" ").toLowerCase();

  if (query) {
    if (normalizedName === query || skill.slug.toLowerCase() === query) {
      score += 120;
    } else if (normalizedName.includes(query) || skill.slug.toLowerCase().includes(query)) {
      score += 70;
    }

    if (normalizedTags.includes(query)) {
      score += 35;
    }
  }

  if (skill.verificationStatus === "verified") {
    score += 100;
  } else if (skill.verificationStatus === "submitted" || skill.verificationStatus === "deprecated") {
    score += 35;
  } else if (skill.verificationStatus === "rejected" || skill.verificationStatus === "suspended") {
    score -= 100;
  }

  score += (4 - permissionRank(skill.permissionLevel)) * 15;
  score += Math.min(skill.installCount ?? 0, 100_000) / 2500;
  score += Math.min(skill.invocationCount ?? 0, 250_000) / 10_000;
  score += (skill.successRate ?? 0) * 40;
  score += Math.min(parseDate(skill.updatedAt) / 1_000_000_000_000, 2);

  return score;
}

function permissionRank(permissionLevel: SkillSummary["permissionLevel"]) {
  const ranks = {
    high: 3,
    low: 1,
    medium: 2
  } satisfies Record<SkillSummary["permissionLevel"], number>;

  return ranks[permissionLevel];
}

function parseDate(value: string | undefined) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? time : 0;
}

async function seedDemoData(sql: SqlClient): Promise<void> {
  if (seeded) {
    return;
  }

  const organization = await upsertDefaultOrganization(sql);

  for (const manifest of demoSkills) {
    const status = toSummary(manifest).verificationStatus;
    const skillRows = (await sql`
      insert into skills (
        organization_id,
        slug,
        display_name,
        description,
        tags,
        visibility,
        verification_status,
        updated_at
      )
      values (
        ${organization.id},
        ${manifest.name},
        ${manifest.displayName},
        ${manifest.description},
        ${manifest.tags},
        'public',
        ${status},
        now()
      )
      on conflict (slug) do update set
        display_name = excluded.display_name,
        description = excluded.description,
        tags = excluded.tags,
        updated_at = now()
      returning id::text
    `) as Array<{ id: string }>;

    await sql`
      insert into skill_versions (skill_id, version, manifest)
      values (${skillRows[0].id}, ${manifest.version}, ${sql.json(manifest)})
      on conflict (skill_id, version) do update set
        manifest = excluded.manifest
    `;
  }

  seeded = true;
}

async function upsertDefaultOrganization(sql: SqlClient): Promise<{ id: string }> {
  const rows = (await sql`
    insert into organizations (name, slug)
    values ('SkillHub', 'skillhub')
    on conflict (slug) do update set name = excluded.name
    returning id::text
  `) as Array<{ id: string }>;

  return rows[0];
}

export async function getSql(): Promise<any | undefined> {
  const databaseUrl = typeof process === "undefined" ? undefined : process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  if (!sqlPromise) {
    sqlPromise = import("postgres").then(({ default: postgres }) =>
      postgres(databaseUrl, {
        connect_timeout: 10,
        idle_timeout: 30,
        max: 5
      })
    );
  }

  return sqlPromise;
}
