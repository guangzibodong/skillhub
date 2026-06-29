import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type SavedSkillInput = {
  collectionName?: unknown;
  skillSlug?: unknown;
};

type SavedSkillRow = {
  id: string;
  projectSlug: string;
  skillSlug: string;
  displayName: string;
  description: string;
  verificationStatus: SkillSummary["verificationStatus"];
  version: string | null;
  manifest: SkillManifest | null;
  collectionName: string;
  installedStatus: string | null;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  currency: string | null;
  priceStatus: "draft" | "active" | "archived" | null;
  savedAt: string;
};

type ProjectRow = {
  id: string;
  organizationId: string;
  slug: string;
};

type SkillRow = {
  id: string;
  slug: string;
  displayName: string;
};

export async function listProjectSavedSkills(projectSlug: string, organizationId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  const rows = await queryProjectSavedSkills(sql, projectSlug, organizationId ?? null);

  return rows.map(mapSavedSkill);
}

async function queryProjectSavedSkills(sql: Sql, projectSlug: string, organizationId: string | null) {
  return (await sql`
    select
      ss.id::text,
      p.slug as "projectSlug",
      s.slug as "skillSlug",
      s.display_name as "displayName",
      s.description,
      s.verification_status as "verificationStatus",
      latest.version,
      latest.manifest,
      ss.collection_name as "collectionName",
      install.status as "installedStatus",
      price.billing_model as "billingModel",
      price.unit_amount_cents as "unitAmountCents",
      price.currency,
      price.status as "priceStatus",
      ss.created_at as "savedAt"
    from saved_skills ss
    join projects p on p.id = ss.project_id
    join skills s on s.id = ss.skill_id
    left join lateral (
      select version, manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
    left join lateral (
      select status
      from project_skill_installs
      where project_id = p.id
        and skill_id = s.id
      order by updated_at desc
      limit 1
    ) install on true
    left join lateral (
      select billing_model, unit_amount_cents, currency, status
      from skill_prices
      where skill_id = s.id
      order by (status = 'active') desc, created_at desc
      limit 1
    ) price on true
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by ss.collection_name asc, ss.created_at desc
  `) as SavedSkillRow[];
}

export async function saveProjectSkill(projectSlug: string, organizationId: string | null | undefined, input: SavedSkillInput) {
  const skillSlug = normalizeSlug(input.skillSlug, "skillSlug");
  const collectionName = normalizeCollectionName(input.collectionName);
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    const project = await getProject(tx, projectSlug, organizationId);
    const skill = await getSkill(tx, skillSlug);
    const rows = (await tx`
      insert into saved_skills (
        project_id,
        skill_id,
        collection_name
      )
      values (
        ${project.id},
        ${skill.id},
        ${collectionName}
      )
      on conflict (project_id, skill_id, collection_name) do update set
        collection_name = excluded.collection_name
      returning id::text
    `) as Array<{ id: string }>;
    const savedSkillId = rows[0].id;

    await recordSavedSkillAudit(tx, project, "project_saved_skill.saved", savedSkillId, {
      collectionName,
      skillSlug
    });
    await recordSavedSkillNotification(tx, project, "project_saved_skill.saved", "Project saved skill updated", {
      collectionName,
      skillName: skill.displayName,
      skillSlug
    });

    const savedSkill = (await queryProjectSavedSkills(tx, project.slug, project.organizationId))
      .map(mapSavedSkill)
      .find((item) => item.id === savedSkillId);

    if (!savedSkill) {
      throw new Error("Saved skill could not be loaded after saving.");
    }

    return savedSkill;
  });
}

export async function removeProjectSavedSkill(
  projectSlug: string,
  organizationId: string | null | undefined,
  savedSkillId: string
) {
  const normalizedSavedSkillId = normalizeUuidLike(savedSkillId, "savedSkillId");
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    const project = await getProject(tx, projectSlug, organizationId);
    const rows = (await tx`
      delete from saved_skills ss
      using skills s
      where ss.skill_id = s.id
        and ss.id = ${normalizedSavedSkillId}
        and ss.project_id = ${project.id}
      returning
        ss.id::text,
        ss.collection_name as "collectionName",
        s.slug as "skillSlug",
        s.display_name as "displayName"
    `) as Array<{ id: string; collectionName: string; skillSlug: string; displayName: string }>;
    const removed = rows[0];

    if (!removed) {
      throw new Error("Saved skill not found for this project.");
    }

    await recordSavedSkillAudit(tx, project, "project_saved_skill.removed", removed.id, {
      collectionName: removed.collectionName,
      skillSlug: removed.skillSlug
    });
    await recordSavedSkillNotification(tx, project, "project_saved_skill.removed", "Project saved skill removed", {
      collectionName: removed.collectionName,
      skillName: removed.displayName,
      skillSlug: removed.skillSlug
    });

    return removed;
  });
}

function mapSavedSkill(row: SavedSkillRow) {
  return {
    id: row.id,
    projectSlug: row.projectSlug,
    skillSlug: row.skillSlug,
    displayName: row.displayName,
    description: row.description,
    version: row.version,
    verificationStatus: row.verificationStatus,
    permissionLevel: row.manifest ? getPermissionLevel(row.manifest.permissions) : "medium",
    collectionName: row.collectionName,
    installedStatus: row.installedStatus,
    pricing: {
      billingModel: row.billingModel ?? "free",
      currency: row.currency ?? "usd",
      status: row.priceStatus ?? "draft",
      unitAmountCents: row.unitAmountCents ?? 0
    },
    savedAt: row.savedAt
  };
}

async function getProject(sql: Sql, projectSlug: string, organizationId?: string | null): Promise<ProjectRow> {
  const rows = (await sql`
    select id::text, organization_id::text as "organizationId", slug
    from projects
    where slug = ${projectSlug}
      and (${organizationId ?? null}::uuid is null or organization_id = ${organizationId ?? null})
    limit 1
  `) as ProjectRow[];
  const project = rows[0];

  if (!project) {
    throw new Error("Project not found for this organization.");
  }

  return project;
}

async function getSkill(sql: Sql, skillSlug: string): Promise<SkillRow> {
  await searchSkills({ limit: 1 });
  const rows = (await sql`
    select id::text, slug, display_name as "displayName"
    from skills
    where slug = ${skillSlug}
    limit 1
  `) as SkillRow[];
  const skill = rows[0];

  if (!skill) {
    throw new Error("Skill not found.");
  }

  return skill;
}

async function recordSavedSkillAudit(
  sql: Sql,
  project: ProjectRow,
  action: string,
  savedSkillId: string,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
    values (${action}, 'saved_skill', ${savedSkillId}, 'Project saved skill state changed.', ${sql.json({
      organizationId: project.organizationId,
      projectSlug: project.slug,
      ...metadata
    })})
  `;
}

async function recordSavedSkillNotification(
  sql: Sql,
  project: ProjectRow,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${project.organizationId}, ${eventType}, 'in_app', ${subject}, ${sql.json({
      projectSlug: project.slug,
      ...payload
    })}, 'queued')
  `;
}

function normalizeSlug(value: unknown, label: string) {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!slug) {
    throw new Error(`${label} is required.`);
  }

  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug)) {
    throw new Error(`${label} must be a valid slug.`);
  }

  return slug;
}

function normalizeCollectionName(value: unknown) {
  const collection = String(value ?? "default")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return collection ? collection.slice(0, 80) : "default";
}

function normalizeUuidLike(value: unknown, label: string) {
  const id = String(value ?? "").trim();

  if (!id) {
    throw new Error(`${label} is required.`);
  }

  return id;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for saved skill operations.");
  }

  return sql;
}
