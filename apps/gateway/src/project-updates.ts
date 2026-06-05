import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectUpdateActionStatus = "acknowledged" | "scheduled" | "adopted" | "ignored";

type ProjectUpdateActionInput = {
  note?: unknown;
  scheduledFor?: unknown;
  status?: unknown;
};

type ProjectUpdateEventRow = {
  currentInstallStatus: string;
  currentVersion: string | null;
  currentVersionId: string | null;
  id: string;
  projectId: string;
  projectSlug: string;
  organizationId: string;
  targetManifest: SkillManifest | null;
  targetReviewStatus: string | null;
  targetVersion: string | null;
  targetVersionId: string | null;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
};

type ProjectUpdateActionRow = {
  id: string;
  projectSlug: string;
  updateId: string;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
  status: ProjectUpdateActionStatus;
  note: string | null;
  scheduledFor: string | null;
  decidedBy: string | null;
  adoptedVersion: string | null;
  adoptionApprovalState: string | null;
  resolvedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const projectUpdateActionStatuses: ProjectUpdateActionStatus[] = ["acknowledged", "scheduled", "adopted", "ignored"];

export async function upsertProjectUpdateAction(
  projectSlug: string,
  updateId: string,
  input: ProjectUpdateActionInput,
  organizationId?: string | null,
  userId?: string | null
) {
  const status = normalizeProjectUpdateActionStatus(input.status);
  const note = normalizeNote(input.note);
  const scheduledFor = normalizeScheduledFor(input.scheduledFor, status);
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;

  return sql.begin(async (tx: Sql) => {
    const updateRows = (await tx`
      select
        sue.id::text,
        p.id::text as "projectId",
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        psi.status as "currentInstallStatus",
        psi.skill_version_id::text as "currentVersionId",
        current_version.version as "currentVersion",
        sue.skill_version_id::text as "targetVersionId",
        target_version.version as "targetVersion",
        target_version.manifest as "targetManifest",
        target_review.status as "targetReviewStatus",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        sue.event_type as "eventType",
        sue.severity,
        sue.title
      from skill_update_events sue
      join skills s on s.id = sue.skill_id
      join project_skill_installs psi on psi.skill_id = s.id
      join projects p on p.id = psi.project_id
      left join skill_versions current_version on current_version.id = psi.skill_version_id
      left join skill_versions target_version on target_version.id = sue.skill_version_id
      left join lateral (
        select status
        from skill_reviews
        where skill_version_id = target_version.id
        order by created_at desc
        limit 1
      ) target_review on true
      where sue.id = ${updateId}
        and p.slug = ${projectSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      limit 1
      for update of sue, psi
    `) as ProjectUpdateEventRow[];
    const update = updateRows[0];

    if (!update) {
      throw new Error("Update event not found for this project.");
    }

    const adoption = await adoptProjectVersionIfReady(tx, update, status);

    const actionRows = (await tx`
      insert into project_update_actions (
        project_id,
        skill_update_event_id,
        status,
        note,
        scheduled_for,
        decided_by,
        resolved_at,
        updated_at
      )
      values (
        ${update.projectId},
        ${update.id},
        ${status},
        ${note},
        ${scheduledFor},
        ${userId ?? null},
        ${isResolvedStatus(status) ? sql`now()` : null},
        now()
      )
      on conflict (project_id, skill_update_event_id) do update set
        status = excluded.status,
        note = excluded.note,
        scheduled_for = excluded.scheduled_for,
        decided_by = excluded.decided_by,
        resolved_at = case
          when excluded.status in ('adopted', 'ignored') then coalesce(project_update_actions.resolved_at, now())
          else null
        end,
        updated_at = now()
      returning
        id::text,
        status,
        note,
        scheduled_for as "scheduledFor",
        decided_by::text as "decidedBy",
        resolved_at as "resolvedAt",
        updated_at as "updatedAt",
        created_at as "createdAt"
    `) as Array<{
      id: string;
      status: ProjectUpdateActionStatus;
      note: string | null;
      scheduledFor: string | null;
      decidedBy: string | null;
      resolvedAt: string | null;
      updatedAt: string;
      createdAt: string;
    }>;
    const action = actionRows[0];

    await tx`
      insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
      values (
        ${`project_update.${status}`},
        'skill_update_event',
        ${update.id},
        ${`Project update marked ${status}.`},
        ${tx.json({
          projectSlug,
          skillSlug: update.skillSlug,
          updateId: update.id,
          status,
          scheduledFor,
          adoptedVersion: adoption.adoptedVersion,
          previousVersion: adoption.previousVersion,
          approvalState: adoption.approvalState,
          organizationId: update.organizationId
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${update.organizationId},
        ${`project_update.${status}`},
        'in_app',
        ${`Project update ${status}`},
        ${tx.json({
          projectSlug,
          skillSlug: update.skillSlug,
          displayName: update.displayName,
          updateId: update.id,
          status,
          scheduledFor,
          adoptedVersion: adoption.adoptedVersion,
          approvalState: adoption.approvalState
        })},
        'queued'
      )
    `;

    return {
      ...action,
      projectSlug: update.projectSlug,
      updateId: update.id,
      skillSlug: update.skillSlug,
      displayName: update.displayName,
      eventType: update.eventType,
      severity: update.severity,
      title: update.title,
      adoptedVersion: adoption.adoptedVersion,
      adoptionApprovalState: adoption.approvalState
    } satisfies ProjectUpdateActionRow;
  });
}

async function adoptProjectVersionIfReady(tx: Sql, update: ProjectUpdateEventRow, status: ProjectUpdateActionStatus) {
  if (status !== "adopted" || update.eventType !== "new_version") {
    return {
      adoptedVersion: null,
      approvalState: null,
      previousVersion: null
    };
  }

  if (!update.targetVersionId || !update.targetManifest || !update.targetVersion) {
    throw new Error("This update does not point to an installable skill version.");
  }

  if (update.currentInstallStatus === "removed") {
    throw new Error("Removed skills must be reinstalled before adopting updates.");
  }

  if (update.targetReviewStatus !== "approved") {
    throw new Error("Only approved skill versions can be adopted by a project.");
  }

  const defaults = policyDefaults(update.targetManifest);
  const approvalState = defaults.approvalRequired ? "owner_required" : "approved";

  await tx`
    update project_skill_installs psi
    set
      skill_version_id = ${update.targetVersionId},
      approval_state = ${approvalState},
      updated_at = now()
    from skills s
    where psi.project_id = ${update.projectId}
      and psi.skill_id = s.id
      and s.slug = ${update.skillSlug}
  `;

  await tx`
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
    select
      ${update.projectId},
      s.id,
      ${defaults.maxPermissionLevel},
      ${defaults.allowNetwork},
      ${defaults.allowBrowser},
      ${defaults.filesystemAccess},
      ${defaults.allowSecretAccess},
      ${defaults.monthlyBudgetCents},
      ${defaults.rateLimitPerMinute},
      ${defaults.approvalRequired},
      ${defaults.approvalRequired ? null : tx`now()`},
      now()
    from skills s
    where s.slug = ${update.skillSlug}
    limit 1
    on conflict (project_id, skill_id) do update set
      updated_at = now()
  `;

  return {
    adoptedVersion: update.targetVersion,
    approvalState,
    previousVersion: update.currentVersion
  };
}

function policyDefaults(manifest: SkillManifest) {
  const permissionLevel = getPermissionLevel(manifest.permissions) satisfies SkillSummary["permissionLevel"];

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

function normalizeProjectUpdateActionStatus(value: unknown): ProjectUpdateActionStatus {
  const status = String(value ?? "");

  if (!projectUpdateActionStatuses.includes(status as ProjectUpdateActionStatus)) {
    throw new Error("Update action status must be acknowledged, scheduled, adopted, or ignored.");
  }

  return status as ProjectUpdateActionStatus;
}

function normalizeNote(value: unknown) {
  const note = String(value ?? "").trim();
  return note.length > 0 ? note.slice(0, 1000) : null;
}

function normalizeScheduledFor(value: unknown, status: ProjectUpdateActionStatus) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  if (status !== "scheduled") {
    return null;
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("scheduledFor must be a valid date.");
  }

  return date.toISOString();
}

function isResolvedStatus(status: ProjectUpdateActionStatus) {
  return status === "adopted" || status === "ignored";
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for project update actions.");
  }

  return sql;
}
