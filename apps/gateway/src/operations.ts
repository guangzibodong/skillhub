import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectInstallInput = {
  organizationId?: string | null;
  projectSlug: string;
  skillSlug: string;
  version?: string;
};

type PolicyInput = {
  maxPermissionLevel?: SkillSummary["permissionLevel"];
  allowNetwork?: boolean;
  allowBrowser?: boolean;
  filesystemAccess?: "none" | "read" | "write";
  allowSecretAccess?: boolean;
  monthlyBudgetCents?: number;
  rateLimitPerMinute?: number | null;
  approvalRequired?: boolean;
};

type ReviewDecisionInput = {
  status: "approved" | "rejected" | "blocked";
  notes?: string;
};

type SkillRecord = {
  id: string;
  slug: string;
  display_name: string;
  verification_status: SkillSummary["verificationStatus"];
  version_id: string;
  version: string;
  manifest: SkillManifest;
};

const fallbackInstalls = [
  {
    projectSlug: "research-agent",
    skillSlug: "browser-research",
    displayName: "Browser Research",
    version: "0.1.0",
    status: "installed",
    approvalState: "approved",
    permissionLevel: "medium",
    installedAt: "demo"
  },
  {
    projectSlug: "support-agent",
    skillSlug: "support-triage",
    displayName: "Support Triage",
    version: "0.1.0",
    status: "installed",
    approvalState: "approved",
    permissionLevel: "low",
    installedAt: "demo"
  }
] as const;

const fallbackPolicies = [
  {
    projectSlug: "research-agent",
    skillSlug: "browser-research",
    maxPermissionLevel: "medium",
    allowNetwork: true,
    allowBrowser: true,
    filesystemAccess: "none",
    allowSecretAccess: false,
    monthlyBudgetCents: 48000,
    rateLimitPerMinute: 60,
    approvalRequired: false
  }
] as const;

const fallbackUpdateInbox = [
  {
    skillSlug: "browser-research",
    displayName: "Browser Research",
    eventType: "new_version",
    severity: "info",
    title: "New citation freshness scoring available",
    createdAt: "demo"
  },
  {
    skillSlug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    eventType: "security",
    severity: "medium",
    title: "File-retention policy requires review",
    createdAt: "demo"
  }
] as const;

const fallbackReviewQueue = [
  {
    id: "demo-review-browser-research",
    skillSlug: "browser-research",
    displayName: "Browser Research",
    version: "0.1.0",
    status: "approved",
    riskLevel: "medium",
    notes: "Demo verified listing",
    createdAt: "demo",
    decidedAt: "demo"
  },
  {
    id: "demo-review-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    version: "0.1.0",
    status: "queued",
    riskLevel: "medium",
    notes: "Needs data retention review",
    createdAt: "demo",
    decidedAt: null
  }
] as const;

export async function listProjectInstalls(projectSlug: string, organizationId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    return fallbackInstalls.filter((install) => install.projectSlug === projectSlug);
  }

  await seedRegistry(sql);

  const scopedOrganizationId = organizationId ?? null;

  return sql`
    select
      p.slug as "projectSlug",
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sv.version,
      psi.status,
      psi.approval_state as "approvalState",
      sv.manifest,
      psi.installed_at as "installedAt"
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    left join skill_versions sv on sv.id = psi.skill_version_id
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    order by psi.updated_at desc
  `.then((rows: Array<any>) =>
    rows.map((row) => ({
      ...row,
      permissionLevel: getPermissionLevel(row.manifest.permissions)
    }))
  );
}

export async function installSkill(input: ProjectInstallInput) {
  const sql = await requireSql();
  await seedRegistry(sql);

  const organizationId = await resolveWriteOrganizationId(sql, input.organizationId);
  const project = await upsertProject(sql, organizationId, input.projectSlug);
  const skill = await getSkillRecord(sql, input.skillSlug, input.version);
  const permissionLevel = getPermissionLevel(skill.manifest.permissions);
  const approvalState = permissionLevel === "high" ? "owner_required" : "approved";

  const installRows = (await sql`
    insert into project_skill_installs (
      project_id,
      skill_id,
      skill_version_id,
      status,
      approval_state,
      updated_at
    )
    values (
      ${project.id},
      ${skill.id},
      ${skill.version_id},
      'installed',
      ${approvalState},
      now()
    )
    on conflict (project_id, skill_id) do update set
      skill_version_id = excluded.skill_version_id,
      status = 'installed',
      approval_state = excluded.approval_state,
      updated_at = now()
    returning id::text, status, approval_state as "approvalState", installed_at as "installedAt"
  `) as Array<{ id: string; status: string; approvalState: string; installedAt: string }>;

  await upsertDefaultPolicy(sql, project.id, skill);

  return {
    id: installRows[0].id,
    projectSlug: input.projectSlug,
    skillSlug: skill.slug,
    displayName: skill.display_name,
    version: skill.version,
    status: installRows[0].status,
    approvalState: installRows[0].approvalState,
    permissionLevel,
    installedAt: installRows[0].installedAt
  };
}

export async function listProjectPolicies(projectSlug: string, organizationId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    return fallbackPolicies.filter((policy) => policy.projectSlug === projectSlug);
  }

  await seedRegistry(sql);

  const scopedOrganizationId = organizationId ?? null;

  return sql`
    select
      p.slug as "projectSlug",
      s.slug as "skillSlug",
      psp.max_permission_level as "maxPermissionLevel",
      psp.allow_network as "allowNetwork",
      psp.allow_browser as "allowBrowser",
      psp.filesystem_access as "filesystemAccess",
      psp.allow_secret_access as "allowSecretAccess",
      psp.monthly_budget_cents as "monthlyBudgetCents",
      psp.rate_limit_per_minute as "rateLimitPerMinute",
      psp.approval_required as "approvalRequired",
      psp.approved_at as "approvedAt",
      psp.updated_at as "updatedAt"
    from project_skill_policies psp
    join projects p on p.id = psp.project_id
    join skills s on s.id = psp.skill_id
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    order by psp.updated_at desc
  `;
}

export async function upsertProjectPolicy(
  projectSlug: string,
  skillSlug: string,
  input: PolicyInput,
  organizationId?: string | null
) {
  const sql = await requireSql();
  await seedRegistry(sql);

  const writeOrganizationId = await resolveWriteOrganizationId(sql, organizationId);
  const project = await upsertProject(sql, writeOrganizationId, projectSlug);
  const skill = await getSkillRecord(sql, skillSlug);
  const defaults = policyDefaults(skill.manifest);

  const rows = (await sql`
    insert into project_skill_policies (
      project_id,
      skill_id,
      max_permission_level,
      allow_network,
      allow_browser,
      filesystem_access,
      allow_secret_access,
      monthly_budget_cents,
      rate_limit_per_minute,
      approval_required,
      approved_at,
      updated_at
    )
    values (
      ${project.id},
      ${skill.id},
      ${input.maxPermissionLevel ?? defaults.maxPermissionLevel},
      ${input.allowNetwork ?? defaults.allowNetwork},
      ${input.allowBrowser ?? defaults.allowBrowser},
      ${input.filesystemAccess ?? defaults.filesystemAccess},
      ${input.allowSecretAccess ?? defaults.allowSecretAccess},
      ${input.monthlyBudgetCents ?? defaults.monthlyBudgetCents},
      ${input.rateLimitPerMinute ?? defaults.rateLimitPerMinute},
      ${input.approvalRequired ?? defaults.approvalRequired},
      ${input.approvalRequired === false ? sql`now()` : null},
      now()
    )
    on conflict (project_id, skill_id) do update set
      max_permission_level = excluded.max_permission_level,
      allow_network = excluded.allow_network,
      allow_browser = excluded.allow_browser,
      filesystem_access = excluded.filesystem_access,
      allow_secret_access = excluded.allow_secret_access,
      monthly_budget_cents = excluded.monthly_budget_cents,
      rate_limit_per_minute = excluded.rate_limit_per_minute,
      approval_required = excluded.approval_required,
      approved_at = excluded.approved_at,
      updated_at = now()
    returning
      max_permission_level as "maxPermissionLevel",
      allow_network as "allowNetwork",
      allow_browser as "allowBrowser",
      filesystem_access as "filesystemAccess",
      allow_secret_access as "allowSecretAccess",
      monthly_budget_cents as "monthlyBudgetCents",
      rate_limit_per_minute as "rateLimitPerMinute",
      approval_required as "approvalRequired",
      approved_at as "approvedAt",
      updated_at as "updatedAt"
  `) as Array<Record<string, unknown>>;

  return {
    projectSlug,
    skillSlug: skill.slug,
    ...rows[0]
  };
}

export async function listProjectUpdateInbox(projectSlug: string, organizationId?: string | null) {
  const sql = await getSql();

  if (!sql) {
    return fallbackUpdateInbox;
  }

  await seedRegistry(sql);

  const scopedOrganizationId = organizationId ?? null;

  return sql`
    select
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sue.event_type as "eventType",
      sue.severity,
      sue.title,
      sue.body,
      sue.created_at as "createdAt"
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    join skill_update_events sue on sue.skill_id = s.id
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    order by sue.created_at desc
    limit 50
  `;
}

export async function submitSkillForReview(slug: string, organizationId?: string | null) {
  const sql = await requireSql();
  await seedRegistry(sql);

  const skill = await getSkillRecord(sql, slug, undefined, organizationId);
  const riskLevel = getPermissionLevel(skill.manifest.permissions);
  const existing = (await sql`
    select id::text, status
    from skill_reviews
    where skill_version_id = ${skill.version_id}
      and status in ('queued', 'in_review')
    order by created_at desc
    limit 1
  `) as Array<{ id: string; status: string }>;

  await sql`
    update skills
    set verification_status = 'submitted', updated_at = now()
    where id = ${skill.id}
  `;

  if (existing[0]) {
    return {
      id: existing[0].id,
      skillSlug: skill.slug,
      displayName: skill.display_name,
      version: skill.version,
      status: existing[0].status,
      riskLevel
    };
  }

  const reviewRows = (await sql`
    insert into skill_reviews (
      skill_id,
      skill_version_id,
      status,
      risk_level,
      notes
    )
    values (
      ${skill.id},
      ${skill.version_id},
      'queued',
      ${riskLevel},
      'Submitted through SkillHub review workflow.'
    )
    returning id::text, status, risk_level as "riskLevel", created_at as "createdAt"
  `) as Array<{ id: string; status: string; riskLevel: string; createdAt: string }>;

  await createRuntimeChecks(sql, skill.version_id);
  await recordNotification(sql, "skill.review.submitted", "Skill submitted for review", {
    skillSlug: skill.slug,
    version: skill.version,
    riskLevel
  });

  return {
    id: reviewRows[0].id,
    skillSlug: skill.slug,
    displayName: skill.display_name,
    version: skill.version,
    status: reviewRows[0].status,
    riskLevel: reviewRows[0].riskLevel,
    createdAt: reviewRows[0].createdAt
  };
}

export async function listReviewQueue() {
  const sql = await getSql();

  if (!sql) {
    return fallbackReviewQueue;
  }

  await seedRegistry(sql);

  return sql`
    select
      sr.id::text,
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sv.version,
      sr.status,
      sr.risk_level as "riskLevel",
      sr.notes,
      sr.created_at as "createdAt",
      sr.decided_at as "decidedAt"
    from skill_reviews sr
    join skills s on s.id = sr.skill_id
    left join skill_versions sv on sv.id = sr.skill_version_id
    where sr.status in ('queued', 'in_review', 'blocked')
    order by sr.created_at asc
    limit 100
  `;
}

export async function decideReview(reviewId: string, input: ReviewDecisionInput) {
  const sql = await requireSql();

  const reviewRows = (await sql`
    select
      sr.id::text,
      sr.skill_id::text as "skillId",
      sr.skill_version_id::text as "skillVersionId",
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sv.version
    from skill_reviews sr
    join skills s on s.id = sr.skill_id
    left join skill_versions sv on sv.id = sr.skill_version_id
    where sr.id = ${reviewId}
    limit 1
  `) as Array<{
    id: string;
    skillId: string;
    skillVersionId: string | null;
    skillSlug: string;
    displayName: string;
    version: string | null;
  }>;

  const review = reviewRows[0];

  if (!review) {
    throw new Error("Review not found.");
  }

  const verificationStatus =
    input.status === "approved" ? "verified" : input.status === "blocked" ? "suspended" : "rejected";

  const decidedRows = (await sql`
    update skill_reviews
    set
      status = ${input.status},
      notes = ${input.notes ?? null},
      decided_at = now()
    where id = ${reviewId}
    returning id::text, status, notes, decided_at as "decidedAt"
  `) as Array<{ id: string; status: string; notes: string | null; decidedAt: string }>;

  await sql`
    update skills
    set verification_status = ${verificationStatus}, updated_at = now()
    where id = ${review.skillId}
  `;

  await sql`
    insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
    values (
      ${`review.${input.status}`},
      'skill_review',
      ${reviewId},
      ${input.notes ?? null},
      ${sql.json({
        skillSlug: review.skillSlug,
        version: review.version,
        verificationStatus
      })}
    )
  `;

  await recordSkillUpdate(sql, review.skillId, review.skillVersionId, input.status, review.displayName, input.notes);
  await recordNotification(sql, `skill.review.${input.status}`, `Skill review ${input.status}`, {
    skillSlug: review.skillSlug,
    version: review.version,
    verificationStatus
  });

  return {
    id: decidedRows[0].id,
    skillSlug: review.skillSlug,
    displayName: review.displayName,
    version: review.version,
    status: decidedRows[0].status,
    verificationStatus,
    notes: decidedRows[0].notes,
    decidedAt: decidedRows[0].decidedAt
  };
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for this operation.");
  }

  return sql;
}

async function seedRegistry(sql: Sql) {
  await searchSkills({ limit: 1 });

  if (!sql) {
    return;
  }
}

async function upsertDefaultOrganization(sql: Sql): Promise<{ id: string }> {
  const rows = (await sql`
    insert into organizations (name, slug)
    values ('SkillHub Demo Org', 'skillhub-demo')
    on conflict (slug) do update set name = excluded.name
    returning id::text
  `) as Array<{ id: string }>;

  return rows[0];
}

async function resolveWriteOrganizationId(sql: Sql, organizationId?: string | null) {
  if (organizationId) {
    return organizationId;
  }

  const organization = await upsertDefaultOrganization(sql);
  return organization.id;
}

async function upsertProject(sql: Sql, organizationId: string, projectSlug: string): Promise<{ id: string; slug: string }> {
  const name = projectSlug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");

  const rows = (await sql`
    insert into projects (organization_id, name, slug)
    values (${organizationId}, ${name || projectSlug}, ${projectSlug})
    on conflict (organization_id, slug) do update set name = excluded.name
    returning id::text, slug
  `) as Array<{ id: string; slug: string }>;

  return rows[0];
}

async function getSkillRecord(
  sql: Sql,
  slug: string,
  version?: string,
  organizationId?: string | null
): Promise<SkillRecord> {
  const rows = (await sql`
    select
      s.id::text,
      s.slug,
      s.display_name,
      s.verification_status,
      sv.id::text as version_id,
      sv.version,
      sv.manifest
    from skills s
    join skill_versions sv on sv.skill_id = s.id
    where s.slug = ${slug}
      and (${version ?? null}::text is null or sv.version = ${version ?? null})
      and (${organizationId ?? null}::uuid is null or s.organization_id = ${organizationId ?? null})
    order by sv.created_at desc
    limit 1
  `) as SkillRecord[];

  if (!rows[0]) {
    throw new Error(organizationId ? "Skill or version not found for this organization." : "Skill or version not found.");
  }

  return rows[0];
}

async function upsertDefaultPolicy(sql: Sql, projectId: string, skill: SkillRecord) {
  const defaults = policyDefaults(skill.manifest);

  await sql`
    insert into project_skill_policies (
      project_id,
      skill_id,
      max_permission_level,
      allow_network,
      allow_browser,
      filesystem_access,
      allow_secret_access,
      monthly_budget_cents,
      rate_limit_per_minute,
      approval_required,
      approved_at,
      updated_at
    )
    values (
      ${projectId},
      ${skill.id},
      ${defaults.maxPermissionLevel},
      ${defaults.allowNetwork},
      ${defaults.allowBrowser},
      ${defaults.filesystemAccess},
      ${defaults.allowSecretAccess},
      ${defaults.monthlyBudgetCents},
      ${defaults.rateLimitPerMinute},
      ${defaults.approvalRequired},
      ${defaults.approvalRequired ? null : sql`now()`},
      now()
    )
    on conflict (project_id, skill_id) do update set
      updated_at = now()
  `;
}

function policyDefaults(manifest: SkillManifest) {
  const permissionLevel = getPermissionLevel(manifest.permissions);

  return {
    maxPermissionLevel: permissionLevel,
    allowNetwork: manifest.permissions.network,
    allowBrowser: manifest.permissions.browser,
    filesystemAccess: manifest.permissions.filesystem,
    allowSecretAccess: manifest.permissions.secrets.length > 0,
    monthlyBudgetCents: permissionLevel === "high" ? 0 : 10000,
    rateLimitPerMinute: permissionLevel === "high" ? 10 : 60,
    approvalRequired: permissionLevel === "high"
  };
}

async function createRuntimeChecks(sql: Sql, skillVersionId: string) {
  const checks = [
    ["manifest", "passed", "Manifest schema accepted."],
    ["runtime", "queued", "Runtime reachability check queued."],
    ["example", "queued", "Example invocation check queued."],
    ["security", "queued", "Permission and data policy review queued."]
  ] as const;

  for (const [checkType, status, message] of checks) {
    await sql`
      insert into skill_runtime_checks (skill_version_id, check_type, status, message, checked_at)
      values (
        ${skillVersionId},
        ${checkType},
        ${status},
        ${message},
        ${status === "passed" ? sql`now()` : null}
      )
    `;
  }
}

async function recordSkillUpdate(
  sql: Sql,
  skillId: string,
  skillVersionId: string | null,
  decision: ReviewDecisionInput["status"],
  displayName: string,
  notes?: string
) {
  const eventType = decision === "approved" ? "new_version" : decision === "blocked" ? "suspended" : "deprecated";
  const severity = decision === "approved" ? "info" : decision === "blocked" ? "high" : "medium";

  await sql`
    insert into skill_update_events (skill_id, skill_version_id, event_type, severity, title, body)
    values (
      ${skillId},
      ${skillVersionId},
      ${eventType},
      ${severity},
      ${`${displayName} review ${decision}`},
      ${notes ?? null}
    )
  `;
}

async function recordNotification(sql: Sql, eventType: string, subject: string, payload: Record<string, unknown>) {
  await sql`
    insert into notification_events (event_type, channel, subject, payload, status)
    values (${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}
