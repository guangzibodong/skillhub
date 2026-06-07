import {
  assertSkillManifest,
  getPermissionLevel,
  type SkillBillingModel,
  type SkillManifest,
  type SkillRuntime,
  type SkillSummary,
} from "@useskillhub/schema";
import { allowDemoFallback, isProductionRuntime } from "./demo-fallback.js";
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
  average_rating: number | null;
  feedback_count: number;
  updated_at: string;
};

type SkillCurationSignal = {
  boost: number;
  placement: "featured" | "standard" | "suppressed";
  skillId?: string;
};

type RankedSkillSummary = SkillSummary & {
  curation?: SkillCurationSignal;
};

type RegistryStats = {
  publishedSkills: number;
  verifiedSkills: number;
  apiCalls: number;
  avgLatencyMs: number | null;
};

type SearchOptions = {
  allowIncompleteSchema?: boolean;
  billingModel?: SkillBillingModel;
  query?: string;
  tags?: string[];
  limit?: number;
  permissionLevel?: SkillSummary["permissionLevel"];
  runtimeType?: SkillRuntime["type"];
  sort?: "adoption" | "low_risk" | "recommended" | "recent" | "success";
  verificationStatus?: SkillSummary["verificationStatus"];
};

type PublishSkillOptions = {
  actorUserId?: string | null;
  source?: "manifest_publish" | "publisher_version_manager";
};

let sqlPromise: Promise<unknown> | undefined;
let seeded = false;

const PUBLIC_REGISTRY_READ_TABLES = [
  "marketplace_curation_rules",
  "project_skill_installs",
  "skill_feedback",
  "skill_invocations",
  "skill_prices",
  "skill_reviews",
  "skill_versions",
  "skills",
];

export async function searchSkills(
  options: SearchOptions = {},
): Promise<SkillSummary[]> {
  const sql = await getSql();

  if (!sql) {
    if (!allowDemoFallback()) {
      return [];
    }

    return filterSummaries(demoSkills.map(toSummary), options);
  }

  try {
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
        invocations.avg_latency_ms,
        feedback.average_rating,
        coalesce(feedback.feedback_count, 0)::int as feedback_count
      from skills s
      join lateral (
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
      left join lateral (
        select
          round(avg(rating)::numeric, 1)::float as average_rating,
          count(*)::int as feedback_count
        from skill_feedback
        where skill_id = s.id
          and status = 'published'
      ) feedback on true
      where s.visibility = 'public'
        and s.verification_status in ('verified', 'submitted', 'deprecated')
        and s.verification_status not in ('draft', 'rejected', 'suspended')
      order by s.updated_at desc
    `) as SkillRow[];

    const curationBySkillId = await getActiveCurationBySkillId(sql, {
      allowIncompleteSchema: options.allowIncompleteSchema,
    });

    return filterSummaries(
      rows.map((row) => rowToSummary(row, curationBySkillId.get(row.id))),
      options,
    );
  } catch (error) {
    if (options.allowIncompleteSchema && isMissingRegistrySchemaError(error)) {
      return fallbackSkillSummaries(options);
    }

    throw error;
  }
}

export async function listSkillManifests(): Promise<SkillManifest[]> {
  const sql = await getSql();

  if (!sql) {
    return allowDemoFallback() ? demoSkills : [];
  }

  try {
    await seedDemoData(sql);

    const rows = (await sql`
      select latest.manifest
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
        and s.verification_status in ('verified', 'submitted', 'deprecated')
      order by s.updated_at desc
    `) as Array<{ manifest: SkillManifest }>;

    return rows.map((row) => row.manifest);
  } catch (error) {
    if (isMissingRegistrySchemaError(error)) {
      return allowDemoFallback() ? demoSkills : [];
    }

    throw error;
  }
}

export async function getSkillManifest(
  slug: string,
): Promise<SkillManifest | undefined> {
  const sql = await getSql();

  if (!sql) {
    return allowDemoFallback()
      ? demoSkills.find((skill) => skill.name === slug)
      : undefined;
  }

  try {
    await seedDemoData(sql);

    const rows = (await sql`
      select sv.manifest
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
      ) sv on true
      where s.slug = ${slug}
        and s.visibility = 'public'
        and s.verification_status in ('verified', 'submitted', 'deprecated')
      order by sv.created_at desc
      limit 1
    `) as Array<{ manifest: SkillManifest }>;

    return rows[0]?.manifest;
  } catch (error) {
    if (isMissingRegistrySchemaError(error)) {
      return allowDemoFallback()
        ? demoSkills.find((skill) => skill.name === slug)
        : undefined;
    }

    throw error;
  }
}

export async function publishSkill(
  manifest: unknown,
  organizationId?: string | null,
  options: PublishSkillOptions = {},
): Promise<{
  createdNewVersion: boolean;
  id: string;
  slug: string;
  status: string;
  version: string;
  versionId: string;
}> {
  assertSkillManifest(manifest);

  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required to publish skills.");
  }

  await seedDemoData(sql);

  const ownerOrganizationId =
    organizationId ?? (await upsertDefaultOrganization(sql)).id;

  return sql.begin(async (tx: NonNullable<SqlClient>) => {
    const existingRows = (await tx`
      select
        id::text,
        organization_id::text as "organizationId",
        verification_status as "verificationStatus"
      from skills
      where slug = ${manifest.name}
      limit 1
    `) as Array<{
      id: string;
      organizationId: string;
      verificationStatus: string;
    }>;

    const existingSkill = existingRows[0];

    if (existingSkill && existingSkill.organizationId !== ownerOrganizationId) {
      throw new Error("Skill slug is already owned by another organization.");
    }

    const skillRows = (await tx`
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
    const existingVersionRows = (await tx`
      select
        sv.id::text,
        exists (
          select 1
          from skill_reviews sr
          where sr.skill_version_id = sv.id
            and sr.status = 'approved'
        ) as "hasApprovedReview",
        exists (
          select 1
          from project_skill_installs psi
          where psi.skill_version_id = sv.id
            and psi.status <> 'removed'
        ) as "hasInstalls"
      from skill_versions sv
      where sv.skill_id = ${skill.id}
        and sv.version = ${manifest.version}
      limit 1
    `) as Array<{
      hasApprovedReview: boolean;
      hasInstalls: boolean;
      id: string;
    }>;

    const existingVersion = existingVersionRows[0];

    if (existingVersion?.hasApprovedReview || existingVersion?.hasInstalls) {
      throw new Error(
        "This version is locked after approval or installation. Create a new semantic version instead.",
      );
    }

    const versionRows = existingVersion
      ? ((await tx`
          update skill_versions
          set manifest = ${tx.json(manifest)}, created_at = now()
          where id = ${existingVersion.id}
          returning id::text, version
        `) as Array<{ id: string; version: string }>)
      : ((await tx`
          insert into skill_versions (skill_id, version, manifest)
          values (${skill.id}, ${manifest.version}, ${tx.json(manifest)})
          returning id::text, version
        `) as Array<{ id: string; version: string }>);

    const version = versionRows[0];
    const createdNewVersion = !existingVersion;
    const action = createdNewVersion
      ? "skill.version.created"
      : "skill.version.updated";

    if (createdNewVersion && existingSkill) {
      await tx`
        insert into skill_update_events (skill_id, skill_version_id, event_type, severity, title, body)
        values (
          ${skill.id},
          ${version.id},
          'new_version',
          'info',
          ${`${manifest.displayName} ${manifest.version} is ready for publisher review`},
          'Publisher created a new skill version. Installed projects can evaluate the update after review.'
        )
      `;
    }

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${options.actorUserId ?? null},
        ${action},
        'skill_version',
        ${version.id},
        ${createdNewVersion ? "Publisher created a skill version." : "Publisher updated a draft skill version."},
        ${tx.json({
          skillSlug: skill.slug,
          source: options.source ?? "manifest_publish",
          version: version.version,
        })}
      )
    `;

    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${ownerOrganizationId},
        ${action},
        'in_app',
        ${createdNewVersion ? "Skill version created" : "Skill draft version updated"},
        ${tx.json({
          skillSlug: skill.slug,
          displayName: manifest.displayName,
          version: version.version,
        })},
        'queued'
      )
    `;

    return {
      createdNewVersion,
      id: skill.id,
      slug: skill.slug,
      status: skill.verification_status,
      version: version.version,
      versionId: version.id,
    };
  });
}

export async function getRegistryStats(): Promise<RegistryStats> {
  const sql = await getSql();

  if (!sql) {
    if (!allowDemoFallback()) {
      return {
        publishedSkills: 0,
        verifiedSkills: 0,
        apiCalls: 0,
        avgLatencyMs: null,
      };
    }

    return {
      publishedSkills: demoSkills.length,
      verifiedSkills: 1,
      apiCalls: 0,
      avgLatencyMs: null,
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
    avgLatencyMs: invocationRows[0]?.avg_latency_ms ?? null,
  };
}

function filterSummaries(
  skills: RankedSkillSummary[],
  options: SearchOptions,
): SkillSummary[] {
  const query = options.query?.trim().toLowerCase() ?? "";
  const tags = (options.tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const limit =
    options.limit && Number.isFinite(options.limit) ? options.limit : 20;

  const filtered = skills
    .filter((skill) => {
      const normalizedTags = skill.tags.map((tag) => tag.toLowerCase());
      const queryMatch =
        !query ||
        skill.slug.toLowerCase().includes(query) ||
        skill.displayName.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        normalizedTags.some((tag) => tag.includes(query));

      const tagMatch =
        tags.length === 0 || tags.every((tag) => normalizedTags.includes(tag));
      const permissionMatch =
        !options.permissionLevel ||
        skill.permissionLevel === options.permissionLevel;
      const runtimeMatch =
        !options.runtimeType || skill.runtimeType === options.runtimeType;
      const billingMatch =
        !options.billingModel ||
        (skill.billingModel ?? "free") === options.billingModel;
      const verificationMatch =
        !options.verificationStatus ||
        skill.verificationStatus === options.verificationStatus;
      const publicStatusMatch = [
        "verified",
        "submitted",
        "deprecated",
      ].includes(skill.verificationStatus);

      return (
        queryMatch &&
        tagMatch &&
        permissionMatch &&
        runtimeMatch &&
        billingMatch &&
        verificationMatch &&
        publicStatusMatch
      );
    })
    .sort((first, second) =>
      compareSummaries(first, second, options.sort ?? "recommended", query),
    );

  return filtered
    .slice(0, Math.min(Math.max(limit, 1), 100))
    .map(stripCuration);
}

function rowToSummary(
  row: SkillRow,
  curation?: SkillCurationSignal,
): RankedSkillSummary {
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
    averageRating: row.average_rating,
    feedbackCount: row.feedback_count,
    curation,
    updatedAt: row.updated_at,
  };
}

function toSummary(skill: SkillManifest): RankedSkillSummary {
  const status: SkillSummary["verificationStatus"] =
    skill.name === "browser-research"
      ? "verified"
      : skill.name === "dataset-summarizer"
        ? "submitted"
        : "draft";
  const signals = demoSkillSignals(skill.name);

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
    installCount: signals.installCount,
    invocationCount: signals.invocationCount,
    successRate: signals.successRate,
    avgLatencyMs: signals.avgLatencyMs,
    averageRating: signals.averageRating,
    feedbackCount: signals.feedbackCount,
    curation: demoCurationSignal(skill.name),
    updatedAt: "demo",
  };
}

function demoSkillSignals(
  slug: string,
): Pick<
  SkillSummary,
  | "installCount"
  | "invocationCount"
  | "successRate"
  | "avgLatencyMs"
  | "averageRating"
  | "feedbackCount"
> {
  if (slug === "browser-research") {
    return {
      installCount: 12840,
      invocationCount: 96200,
      successRate: 0.982,
      avgLatencyMs: 1800,
      averageRating: 4.8,
      feedbackCount: 24,
    };
  }

  if (slug === "dataset-summarizer") {
    return {
      installCount: 6920,
      invocationCount: 41800,
      successRate: 0.975,
      avgLatencyMs: 1100,
      averageRating: 4.6,
      feedbackCount: 17,
    };
  }

  if (slug === "support-triage") {
    return {
      installCount: 15200,
      invocationCount: 120400,
      successRate: 0.991,
      avgLatencyMs: 620,
      averageRating: 4.7,
      feedbackCount: 311,
    };
  }

  if (slug === "manifest-review") {
    return {
      installCount: 1840,
      invocationCount: 11600,
      successRate: 0.946,
      avgLatencyMs: 760,
      averageRating: 4.3,
      feedbackCount: 9,
    };
  }

  return {
    installCount: 0,
    invocationCount: 0,
    successRate: null,
    avgLatencyMs: null,
    averageRating: null,
    feedbackCount: 0,
  };
}

function compareSummaries(
  first: RankedSkillSummary,
  second: RankedSkillSummary,
  sort: NonNullable<SearchOptions["sort"]>,
  query: string,
) {
  const suppressionOrder =
    curationSuppressionRank(first) - curationSuppressionRank(second);

  if (suppressionOrder !== 0) {
    return suppressionOrder;
  }

  if (sort === "adoption") {
    return (
      (second.installCount ?? 0) - (first.installCount ?? 0) ||
      first.slug.localeCompare(second.slug)
    );
  }

  if (sort === "success") {
    return (
      (second.successRate ?? 0) - (first.successRate ?? 0) ||
      recommendedScore(second, query) - recommendedScore(first, query)
    );
  }

  if (sort === "low_risk") {
    return (
      permissionRank(first.permissionLevel) -
        permissionRank(second.permissionLevel) ||
      recommendedScore(second, query) - recommendedScore(first, query)
    );
  }

  if (sort === "recent") {
    return (
      parseDate(second.updatedAt) - parseDate(first.updatedAt) ||
      recommendedScore(second, query) - recommendedScore(first, query)
    );
  }

  return (
    recommendedScore(second, query) - recommendedScore(first, query) ||
    first.slug.localeCompare(second.slug)
  );
}

function recommendedScore(skill: RankedSkillSummary, query: string) {
  let score = 0;
  const normalizedName = skill.displayName.toLowerCase();
  const normalizedTags = skill.tags.join(" ").toLowerCase();

  if (query) {
    if (normalizedName === query || skill.slug.toLowerCase() === query) {
      score += 120;
    } else if (
      normalizedName.includes(query) ||
      skill.slug.toLowerCase().includes(query)
    ) {
      score += 70;
    }

    if (normalizedTags.includes(query)) {
      score += 35;
    }
  }

  if (skill.verificationStatus === "verified") {
    score += 100;
  } else if (
    skill.verificationStatus === "submitted" ||
    skill.verificationStatus === "deprecated"
  ) {
    score += 35;
  } else if (
    skill.verificationStatus === "rejected" ||
    skill.verificationStatus === "suspended"
  ) {
    score -= 100;
  }

  score += (4 - permissionRank(skill.permissionLevel)) * 15;
  score += Math.min(skill.installCount ?? 0, 100_000) / 2500;
  score += Math.min(skill.invocationCount ?? 0, 250_000) / 10_000;
  score += (skill.successRate ?? 0) * 40;
  score += (skill.averageRating ?? 0) * 8;
  score += Math.min(skill.feedbackCount ?? 0, 50) * 0.8;
  score += Math.min(parseDate(skill.updatedAt) / 1_000_000_000_000, 2);

  if (skill.curation?.placement === "featured") {
    score += 80;
  } else if (skill.curation?.placement === "suppressed") {
    score -= 160;
  }

  score += skill.curation?.boost ?? 0;

  return score;
}

async function getActiveCurationBySkillId(
  sql: NonNullable<SqlClient>,
  options: Pick<SearchOptions, "allowIncompleteSchema"> = {},
) {
  try {
    const rows = (await sql`
      select
        mcr.skill_id::text as "skillId",
        placement,
        boost
      from marketplace_curation_rules mcr
      join skills s on s.id = mcr.skill_id
      where mcr.starts_at <= now()
        and (mcr.ends_at is null or mcr.ends_at > now())
        and s.visibility = 'public'
        and s.verification_status in ('verified', 'submitted', 'deprecated')
    `) as SkillCurationSignal[];

    return new Map(rows.map((row) => [row.skillId, row]));
  } catch (error) {
    if (options.allowIncompleteSchema && isMissingRegistrySchemaError(error)) {
      return new Map<string, SkillCurationSignal>();
    }

    if (isProductionRuntime()) {
      throw new Error(
        error instanceof Error
          ? `Marketplace curation migration is unavailable: ${error.message}`
          : "Marketplace curation migration is unavailable.",
      );
    }

    return new Map<string, SkillCurationSignal>();
  }
}

function fallbackSkillSummaries(options: SearchOptions): SkillSummary[] {
  return allowDemoFallback()
    ? filterSummaries(demoSkills.map(toSummary), options)
    : [];
}

function isMissingRegistrySchemaError(error: unknown) {
  const text = errorDetails(error).toLowerCase();
  const code = errorCode(error);

  if (code !== "42P01" && !text.includes("relation")) {
    return false;
  }

  return PUBLIC_REGISTRY_READ_TABLES.some((table) => text.includes(table));
}

function errorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return "";
}

function errorDetails(error: unknown) {
  const parts: string[] = [];

  if (error instanceof Error) {
    parts.push(error.message);
  } else if (error !== undefined && error !== null) {
    parts.push(String(error));
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    for (const key of ["code", "detail", "hint", "schema_name", "table_name"]) {
      const value = record[key];

      if (value !== undefined && value !== null) {
        parts.push(String(value));
      }
    }
  }

  return parts.join(" ");
}

function demoCurationSignal(slug: string): SkillCurationSignal | undefined {
  if (slug === "browser-research") {
    return {
      boost: 120,
      placement: "featured",
    };
  }

  if (slug === "manifest-review") {
    return {
      boost: -60,
      placement: "suppressed",
    };
  }

  return undefined;
}

function stripCuration(skill: RankedSkillSummary): SkillSummary {
  const { curation: _curation, ...summary } = skill;
  return summary;
}

function curationSuppressionRank(skill: RankedSkillSummary) {
  return skill.curation?.placement === "suppressed" ? 1 : 0;
}

function permissionRank(permissionLevel: SkillSummary["permissionLevel"]) {
  const ranks = {
    high: 3,
    low: 1,
    medium: 2,
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

  if (!allowDemoFallback()) {
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

async function upsertDefaultOrganization(
  sql: SqlClient,
): Promise<{ id: string }> {
  const rows = (await sql`
    insert into organizations (name, slug)
    values ('SkillHub', 'skillhub')
    on conflict (slug) do update set name = excluded.name
    returning id::text
  `) as Array<{ id: string }>;

  return rows[0];
}

export async function getSql(): Promise<any | undefined> {
  const databaseUrl =
    typeof process === "undefined" ? undefined : process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  if (!sqlPromise) {
    sqlPromise = import("postgres").then(({ default: postgres }) =>
      postgres(databaseUrl, {
        connect_timeout: 10,
        idle_timeout: 30,
        max: 5,
      }),
    );
  }

  return sqlPromise;
}
