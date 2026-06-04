import {
  assertSkillManifest,
  getPermissionLevel,
  type SkillManifest,
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
};

type RegistryStats = {
  publishedSkills: number;
  verifiedSkills: number;
  apiCalls: number;
  avgLatencyMs: number | null;
};

type SearchOptions = {
  query?: string;
  tags?: string[];
  limit?: number;
  permissionLevel?: SkillSummary["permissionLevel"];
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
      latest.version,
      latest.manifest
    from skills s
    join lateral (
      select version, manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
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

export async function publishSkill(manifest: unknown): Promise<{ id: string; slug: string; status: string }> {
  assertSkillManifest(manifest);

  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required to publish skills.");
  }

  await seedDemoData(sql);

  const organization = await upsertDefaultOrganization(sql);
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
  const tags = options.tags ?? [];
  const limit = options.limit && Number.isFinite(options.limit) ? options.limit : 20;

  return skills
    .filter((skill) => {
      const queryMatch =
        !query ||
        skill.slug.includes(query) ||
        skill.displayName.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.tags.some((tag) => tag.includes(query));

      const tagMatch = tags.length === 0 || tags.every((tag) => skill.tags.includes(tag));
      const permissionMatch = !options.permissionLevel || skill.permissionLevel === options.permissionLevel;

      return queryMatch && tagMatch && permissionMatch;
    })
    .slice(0, limit);
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
    permissionLevel: getPermissionLevel(row.manifest.permissions)
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
    permissionLevel: getPermissionLevel(skill.permissions)
  };
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
