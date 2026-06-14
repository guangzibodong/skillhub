import { getPermissionLevel, type SkillManifest, type SkillRuntime, type SkillSummary } from "@useskillhub/schema";
import { getSql, searchSkills } from "./registry.js";
import { buildReviewSlaFields } from "./review-sla.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectInstallInput = {
  actorUserId?: string | null;
  organizationId?: string | null;
  projectSlug: string;
  skillSlug: string;
  version?: string;
};

type ProjectInstallStatus = "installed" | "suspended" | "removed";

type PolicyInput = {
  maxPermissionLevel?: SkillSummary["permissionLevel"];
  allowNetwork?: boolean;
  allowBrowser?: boolean;
  filesystemAccess?: "none" | "read" | "write";
  allowSecretAccess?: boolean;
  monthlyBudgetCents?: number;
  rateLimitPerMinute?: number | null;
  approvalRequired?: boolean;
  reason?: string;
};

type ReviewDecisionInput = {
  status: "approved" | "rejected" | "blocked";
  notes?: string;
};

type RuntimeCheckType = "manifest" | "runtime" | "example" | "security";
type RuntimeCheckStatus = "queued" | "running" | "passed" | "failed" | "warning";

type RuntimeCheckResult = {
  checkType: RuntimeCheckType;
  fixCategory: "example" | "manifest" | "runtime" | "security";
  isBlocking: boolean;
  nextAction: string;
  status: Extract<RuntimeCheckStatus, "passed" | "failed" | "warning">;
  targetField: string | null;
  message: string;
  latencyMs?: number;
};

type RuntimeCheckCreationSummary = {
  blockingCount: number;
  failedCount: number;
  passedCount: number;
  totalCount: number;
  warningCount: number;
};

type SkillRecord = {
  id: string;
  organization_id: string;
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
    id: "demo-update-browser-research",
    skillSlug: "browser-research",
    displayName: "Browser Research",
    eventType: "new_version",
    severity: "info",
    title: "New citation freshness scoring available",
    body: null,
    currentVersion: "0.1.0",
    targetVersion: "0.1.1",
    targetReviewStatus: "approved",
    adoptionState: "ready",
    actionStatus: "open",
    actionNote: null,
    scheduledFor: null,
    resolvedAt: null,
    actionUpdatedAt: null,
    createdAt: "demo"
  },
  {
    id: "demo-update-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    eventType: "security",
    severity: "medium",
    title: "File-retention policy requires review",
    body: null,
    currentVersion: "0.1.0",
    targetVersion: null,
    targetReviewStatus: null,
    adoptionState: "not_version_update",
    actionStatus: "open",
    actionNote: null,
    scheduledFor: null,
    resolvedAt: null,
    actionUpdatedAt: null,
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

  if (skill.verification_status !== "verified") {
    throw new Error("Only verified skills can be installed into developer projects.");
  }

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
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${input.actorUserId ?? null},
      'project_install.installed',
      'project_skill_install',
      ${installRows[0].id},
      'Skill installed into a developer project.',
      ${sql.json({
        approvalState,
        organizationId,
        permissionLevel,
        projectSlug: input.projectSlug,
        skillSlug: skill.slug,
        version: skill.version
      })}
    )
  `;
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (
      ${organizationId},
      'project_install.installed',
      'in_app',
      'Project skill installed',
      ${sql.json({
        approvalState,
        displayName: skill.display_name,
        permissionLevel,
        projectSlug: input.projectSlug,
        skillSlug: skill.slug,
        version: skill.version
      })},
      'queued'
    )
  `;

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

export async function updateProjectInstallStatus(
  projectSlug: string,
  skillSlug: string,
  status: ProjectInstallStatus,
  organizationId?: string | null,
  reasonInput?: unknown,
  actorUserId?: string | null
) {
  const sql = await requireSql();
  await seedRegistry(sql);

  if (!["installed", "suspended", "removed"].includes(status)) {
    throw new Error("Install status must be installed, suspended, or removed.");
  }

  const scopedOrganizationId = organizationId ?? null;
  const reason = normalizeProjectActionReason(
    reasonInput,
    `Project skill install marked ${status}.`,
    status === "suspended" || status === "removed"
  );

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      update project_skill_installs psi
      set
        status = ${status},
        updated_at = now()
      from projects p, skills s
      where psi.project_id = p.id
        and psi.skill_id = s.id
        and p.slug = ${projectSlug}
        and s.slug = ${skillSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      returning
        psi.id::text,
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        psi.status,
        psi.approval_state as "approvalState",
        psi.updated_at as "updatedAt"
    `) as Array<{
      id: string;
      projectSlug: string;
      organizationId: string;
      skillSlug: string;
      displayName: string;
      status: ProjectInstallStatus;
      approvalState: string;
      updatedAt: string;
    }>;
    const install = rows[0];

    if (!install) {
      throw new Error("Installed skill not found for this project.");
    }

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        ${`project_install.${status}`},
        'project_skill_install',
        ${install.id},
        ${reason},
        ${tx.json({
          projectSlug,
          skillSlug,
          reason,
          status,
          organizationId: install.organizationId
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${install.organizationId},
        ${`project_install.${status}`},
        'in_app',
        ${`Project skill ${status}`},
        ${tx.json({
          projectSlug,
          skillSlug,
          displayName: install.displayName,
          reason,
          status
        })},
        'queued'
      )
    `;

    return install;
  });
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
  organizationId?: string | null,
  actorUserId?: string | null,
  canApproveOwnerReview = false
) {
  const sql = await requireSql();
  await seedRegistry(sql);

  const writeOrganizationId = await resolveWriteOrganizationId(sql, organizationId);
  const project = await upsertProject(sql, writeOrganizationId, projectSlug);
  const skill = await getSkillRecord(sql, skillSlug);
  const defaults = policyDefaults(skill.manifest);
  const approvalRequired = input.approvalRequired ?? defaults.approvalRequired;
  const reason = String(input.reason ?? "").trim() || "Project skill policy saved and runtime approval state synchronized.";

  if (!approvalRequired && defaults.approvalRequired && !canApproveOwnerReview) {
    throw new Error("Owner or admin role is required to approve high-risk project policy.");
  }

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
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
        approved_by_user_id,
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
        ${approvalRequired},
        ${approvalRequired ? null : actorUserId ?? null},
        ${approvalRequired ? null : tx`now()`},
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
        approved_by_user_id = excluded.approved_by_user_id,
        approved_at = excluded.approved_at,
        updated_at = now()
      returning
        id::text,
        max_permission_level as "maxPermissionLevel",
        allow_network as "allowNetwork",
        allow_browser as "allowBrowser",
        filesystem_access as "filesystemAccess",
        allow_secret_access as "allowSecretAccess",
        monthly_budget_cents as "monthlyBudgetCents",
        rate_limit_per_minute as "rateLimitPerMinute",
        approval_required as "approvalRequired",
        approved_by_user_id::text as "approvedByUserId",
        approved_at as "approvedAt",
        updated_at as "updatedAt"
    `) as Array<Record<string, unknown>>;
    const policy = rows[0];

    const installRows = (await tx`
      update project_skill_installs psi
      set
        approval_state = ${approvalRequired ? "owner_required" : "approved"},
        updated_at = now()
      where psi.project_id = ${project.id}
        and psi.skill_id = ${skill.id}
        and psi.status = 'installed'
      returning psi.id::text, psi.approval_state as "approvalState"
    `) as Array<{ id: string; approvalState: string }>;
    const install = installRows[0] ?? null;

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        'project_policy.updated',
        'project_skill_policy',
        ${String(policy.id)},
        ${reason},
        ${tx.json({
          approvalRequired,
          installApprovalState: install?.approvalState ?? null,
          reason,
          projectSlug,
          skillSlug: skill.slug
        })}
      )
    `;

    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${writeOrganizationId},
        'project.policy.updated',
        'in_app',
        'Project skill policy updated',
        ${tx.json({
          approvalRequired,
          installApprovalState: install?.approvalState ?? null,
          reason,
          projectSlug,
          skillSlug: skill.slug
        })},
        'queued'
      )
    `;

    return {
      projectSlug,
      skillSlug: skill.slug,
      ...policy
    };
  });
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
      sue.id::text,
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sue.event_type as "eventType",
      sue.severity,
      sue.title,
      sue.body,
      current_version.version as "currentVersion",
      target_version.version as "targetVersion",
      target_review.status as "targetReviewStatus",
      case
        when sue.event_type <> 'new_version' then 'not_version_update'
        when psi.status = 'removed' then 'removed_install'
        when sue.skill_version_id is null or target_version.id is null then 'missing_version'
        when target_review.status = 'approved' then 'ready'
        else 'awaiting_review'
      end as "adoptionState",
      sue.created_at as "createdAt",
      coalesce(pua.status, 'open') as "actionStatus",
      pua.note as "actionNote",
      pua.scheduled_for as "scheduledFor",
      pua.resolved_at as "resolvedAt",
      pua.updated_at as "actionUpdatedAt"
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    join skill_update_events sue on sue.skill_id = s.id
    left join skill_versions current_version on current_version.id = psi.skill_version_id
    left join skill_versions target_version on target_version.id = sue.skill_version_id
    left join lateral (
      select status
      from skill_reviews
      where skill_version_id = target_version.id
      order by created_at desc
      limit 1
    ) target_review on true
    left join project_update_actions pua on pua.project_id = p.id and pua.skill_update_event_id = sue.id
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      and coalesce(pua.status, 'open') not in ('adopted', 'ignored')
    order by sue.created_at desc
    limit 50
  `;
}

export async function submitSkillForReview(
  slug: string,
  organizationId?: string | null,
  version?: string,
  actorUserId?: string | null
) {
  const sql = await requireSql();
  await seedRegistry(sql);

  const skill = await getSkillRecord(sql, slug, version, organizationId);
  const riskLevel = getPermissionLevel(skill.manifest.permissions);

  return sql.begin(async (tx: Sql) => {
    const existing = (await tx`
      select id::text, status, created_at as "createdAt"
      from skill_reviews
      where skill_version_id = ${skill.version_id}
        and status in ('queued', 'in_review')
      order by created_at desc
      limit 1
      for update
    `) as Array<{ id: string; status: string; createdAt: string }>;

    await tx`
      update skills
      set verification_status = 'submitted', updated_at = now()
      where id = ${skill.id}
    `;

    const checkSummary = await createRuntimeChecks(tx, skill.version_id, skill.manifest);
    const existingReview = existing[0] ?? null;

    if (existingReview) {
      await recordReviewSubmissionAudit(tx, {
        actorUserId,
        checkSummary,
        existingReview: true,
        reviewId: existingReview.id,
        riskLevel,
        skill
      });
      await recordNotification(
        tx,
        "skill.review.submitted",
        "Skill review submission refreshed",
        {
          checkSummary,
          existingReview: true,
          reviewId: existingReview.id,
          riskLevel,
          skillSlug: skill.slug,
          version: skill.version
        },
        skill.organization_id
      );

      return {
        alreadyOpen: true,
        checkSummary,
        createdAt: existingReview.createdAt,
        id: existingReview.id,
        skillSlug: skill.slug,
        displayName: skill.display_name,
        version: skill.version,
        status: existingReview.status,
        riskLevel
      };
    }

    const reviewRows = (await tx`
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
    const review = reviewRows[0];

    await recordReviewSubmissionAudit(tx, {
      actorUserId,
      checkSummary,
      existingReview: false,
      reviewId: review.id,
      riskLevel: review.riskLevel,
      skill
    });
    await recordNotification(
      tx,
      "skill.review.submitted",
      "Skill submitted for review",
      {
        checkSummary,
        existingReview: false,
        reviewId: review.id,
        riskLevel: review.riskLevel,
        skillSlug: skill.slug,
        version: skill.version
      },
      skill.organization_id
    );

    return {
      alreadyOpen: false,
      checkSummary,
      id: review.id,
      skillSlug: skill.slug,
      displayName: skill.display_name,
      version: skill.version,
      status: review.status,
      riskLevel: review.riskLevel,
      createdAt: review.createdAt
    };
  });
}

export async function listReviewQueue() {
  const sql = await getSql();

  if (!sql) {
    return fallbackReviewQueue.map((review) => ({
      ...review,
      ...buildReviewSlaFields(review.createdAt, review.decidedAt, review.status)
    }));
  }

  await seedRegistry(sql);

  const rows = (await sql`
    select
      sr.id::text,
      s.slug as "skillSlug",
      s.display_name as "displayName",
      o.name as "organizationName",
      o.slug as "organizationSlug",
      pp.display_name as "publisherName",
      pp.status as "publisherStatus",
      pp.payout_status as "payoutStatus",
      sv.version,
      sv.manifest,
      sr.status,
      sr.risk_level as "riskLevel",
      sr.notes,
      sr.created_at as "createdAt",
      sr.decided_at as "decidedAt",
      coalesce(checks.items, '[]'::jsonb) as "runtimeChecks",
      coalesce(checks.passed_count, 0)::int as "runtimePassedCount",
      coalesce(checks.failed_count, 0)::int as "runtimeFailedCount",
      coalesce(checks.warning_count, 0)::int as "runtimeWarningCount"
    from skill_reviews sr
    join skills s on s.id = sr.skill_id
    join organizations o on o.id = s.organization_id
    left join skill_versions sv on sv.id = sr.skill_version_id
    left join publisher_profiles pp on pp.organization_id = s.organization_id
    left join lateral (
      with latest_checks as (
        select distinct on (check_type)
          check_type,
          status,
          message,
          is_blocking,
          fix_category,
          target_field,
          next_action,
          latency_ms,
          checked_at,
          created_at
        from skill_runtime_checks
        where skill_version_id = sv.id
        order by check_type, created_at desc
      )
      select
        jsonb_agg(
          jsonb_build_object(
            'checkType', check_type,
            'status', status,
            'message', message,
            'isBlocking', is_blocking,
            'fixCategory', fix_category,
            'targetField', target_field,
            'nextAction', next_action,
            'latencyMs', latency_ms,
            'checkedAt', checked_at,
            'createdAt', created_at
          )
          order by check_type
        ) as items,
        count(*) filter (where status = 'passed') as passed_count,
        count(*) filter (where status = 'failed') as failed_count,
        count(*) filter (where status = 'warning') as warning_count
      from latest_checks
    ) checks on true
    where sr.status in ('queued', 'in_review', 'blocked')
    order by sr.created_at asc
    limit 100
  `) as Array<{
    createdAt: Date | string | null;
    decidedAt: Date | string | null;
    manifest: SkillManifest | null;
    organizationName: string | null;
    organizationSlug: string | null;
    payoutStatus: string | null;
    publisherName: string | null;
    publisherStatus: string | null;
    status: string | null;
  }>;

  return rows.map(({ manifest, organizationName, organizationSlug, payoutStatus, publisherName, publisherStatus, ...review }) => ({
    ...review,
    reviewEvidence: buildReviewEvidence({
      manifest,
      organizationName,
      organizationSlug,
      payoutStatus,
      publisherName,
      publisherStatus
    }),
    ...buildReviewSlaFields(review.createdAt, review.decidedAt, review.status)
  }));
}

export async function decideReview(reviewId: string, input: ReviewDecisionInput, actorUserId?: string | null) {
  const sql = await requireSql();

  const reviewRows = (await sql`
    select
      sr.id::text,
      sr.skill_id::text as "skillId",
      sr.skill_version_id::text as "skillVersionId",
      sr.status,
      s.organization_id::text as "organizationId",
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sv.version,
      sv.manifest
    from skill_reviews sr
    join skills s on s.id = sr.skill_id
    left join skill_versions sv on sv.id = sr.skill_version_id
    where sr.id = ${reviewId}
    limit 1
  `) as Array<{
    id: string;
    skillId: string;
    skillVersionId: string | null;
    status: string;
    organizationId: string;
    skillSlug: string;
    displayName: string;
    version: string | null;
    manifest: SkillManifest | null;
  }>;

  const review = reviewRows[0];

  if (!review) {
    throw new Error("Review not found.");
  }

  if (!["queued", "in_review", "blocked"].includes(review.status)) {
    throw new Error(`Review is already ${review.status} and cannot be changed.`);
  }

  if (input.status === "approved") {
    await requireApprovalChecks(sql, review.skillVersionId, review.manifest);
  }

  const decidedRows = (await sql`
    update skill_reviews
    set
      status = ${input.status},
      notes = ${input.notes ?? null},
      decided_at = now()
    where id = ${reviewId}
      and status in ('queued', 'in_review', 'blocked')
    returning id::text, status, notes, decided_at as "decidedAt"
  `) as Array<{ id: string; status: string; notes: string | null; decidedAt: string }>;

  if (!decidedRows[0]) {
    throw new Error("Review is no longer pending and cannot be changed.");
  }

  const verificationStatus =
    input.status === "approved"
      ? "verified"
      : input.status === "blocked"
        ? "suspended"
        : (await hasApprovedVersion(sql, review.skillId))
          ? "verified"
          : "rejected";

  await sql`
    update skills
    set verification_status = ${verificationStatus}, updated_at = now()
    where id = ${review.skillId}
  `;

  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${actorUserId ?? null},
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
  await recordNotification(
    sql,
    `skill.review.${input.status}`,
    `Skill review ${input.status}`,
    {
      notes: input.notes ?? null,
      reviewId,
      skillSlug: review.skillSlug,
      version: review.version,
      verificationStatus
    },
    review.organizationId
  );

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

function normalizeProjectActionReason(value: unknown, fallback: string, required: boolean) {
  const reason = String(value ?? "").trim();

  if (required && reason.length < 6) {
    throw new Error("A reason is required before this project operation.");
  }

  return (reason || fallback).slice(0, 600);
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
      s.organization_id::text,
      s.slug,
      s.display_name,
      s.verification_status,
      sv.id::text as version_id,
      sv.version,
      sv.manifest,
      review.status as review_status,
      review.decided_at as review_decided_at,
      review.created_at as review_created_at
    from skills s
    join skill_versions sv on sv.skill_id = s.id
    left join lateral (
      select status, decided_at, created_at
      from skill_reviews
      where skill_version_id = sv.id
      order by created_at desc
      limit 1
    ) review on true
    where s.slug = ${slug}
      and (${version ?? null}::text is null or sv.version = ${version ?? null})
      and (${organizationId ?? null}::uuid is null or s.organization_id = ${organizationId ?? null})
    order by
      case
        when ${version ?? null}::text is not null then 0
        when review.status = 'approved' then 0
        when s.verification_status = 'submitted' and review.status in ('queued', 'in_review') then 1
        else 2
      end,
      coalesce(review.decided_at, review.created_at, sv.created_at) desc,
      sv.created_at desc
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

async function createRuntimeChecks(sql: Sql, skillVersionId: string, manifest: SkillManifest): Promise<RuntimeCheckCreationSummary> {
  const checks = buildRuntimeChecks(manifest);

  for (const check of checks) {
    await sql`
      insert into skill_runtime_checks (
        skill_version_id,
        check_type,
        status,
        latency_ms,
        message,
        is_blocking,
        fix_category,
        target_field,
        next_action,
        checked_at
      )
      values (
        ${skillVersionId},
        ${check.checkType},
        ${check.status},
        ${check.latencyMs ?? null},
        ${check.message},
        ${check.isBlocking},
        ${check.fixCategory},
        ${check.targetField},
        ${check.nextAction},
        now()
      )
    `;
  }

  return summarizeCreatedRuntimeChecks(checks);
}

async function requireApprovalChecks(sql: Sql, skillVersionId: string | null, manifest: SkillManifest | null) {
  if (!skillVersionId || !manifest) {
    throw new Error("Automated review checks require a skill version manifest before approval.");
  }

  let checks = await getLatestRuntimeChecks(sql, skillVersionId);
  const requiredTypes: RuntimeCheckType[] = ["manifest", "runtime", "example", "security"];
  let missingTypes = requiredTypes.filter((type) => !checks.some((check) => check.checkType === type));
  let incomplete = checks.filter((check) => check.status === "queued" || check.status === "running");

  if (checks.length === 0 || missingTypes.length > 0 || incomplete.length > 0) {
    await createRuntimeChecks(sql, skillVersionId, manifest);
    checks = await getLatestRuntimeChecks(sql, skillVersionId);
    missingTypes = requiredTypes.filter((type) => !checks.some((check) => check.checkType === type));
    incomplete = checks.filter((check) => check.status === "queued" || check.status === "running");
  }

  const blockers = checks.filter((check) => check.status === "failed" || check.isBlocking === true);

  if (missingTypes.length > 0 || blockers.length > 0 || incomplete.length > 0) {
    const failedLabels = blockers.map((check) => `${check.checkType}: ${check.nextAction ?? check.message}`);
    const incompleteLabels = incomplete.map((check) => `${check.checkType}: ${check.status}`);
    throw new Error(
      `Automated review checks must pass before approval. ${[
        ...missingTypes.map((type) => `${type}: missing`),
        ...failedLabels,
        ...incompleteLabels
      ].join(" ")}`
    );
  }
}

async function getLatestRuntimeChecks(sql: Sql, skillVersionId: string) {
  const rows = (await sql`
    select distinct on (check_type)
      check_type as "checkType",
      status,
      message,
      is_blocking as "isBlocking",
      next_action as "nextAction"
    from skill_runtime_checks
    where skill_version_id = ${skillVersionId}
    order by check_type, created_at desc
  `) as Array<{
    checkType: RuntimeCheckType;
    isBlocking: boolean | null;
    status: RuntimeCheckStatus;
    message: string;
    nextAction: string | null;
  }>;

  return rows;
}

async function hasApprovedVersion(sql: Sql, skillId: string) {
  const rows = (await sql`
    select exists (
      select 1
      from skill_reviews
      where skill_id = ${skillId}
        and status = 'approved'
    ) as "hasApprovedVersion"
  `) as Array<{ hasApprovedVersion: boolean }>;

  return Boolean(rows[0]?.hasApprovedVersion);
}

function buildRuntimeChecks(manifest: SkillManifest): RuntimeCheckResult[] {
  return [
    buildManifestCheck(manifest),
    buildRuntimeCheck(manifest),
    buildExampleCheck(manifest),
    buildSecurityCheck(manifest)
  ];
}

function buildManifestCheck(manifest: SkillManifest): RuntimeCheckResult {
  const missing = [
    manifest.schemaVersion ? null : "schemaVersion",
    manifest.name ? null : "name",
    manifest.displayName ? null : "displayName",
    manifest.version ? null : "version",
    manifest.description ? null : "description",
    manifest.tags.length > 0 ? null : "tags"
  ].filter(Boolean);

  if (missing.length > 0) {
    return {
      checkType: "manifest",
      fixCategory: "manifest",
      isBlocking: true,
      status: "failed",
      targetField: "manifest.identity",
      message: `Manifest is missing required fields: ${missing.join(", ")}.`,
      nextAction: `Add the missing manifest fields before resubmitting: ${missing.join(", ")}.`
    };
  }

  if (manifest.description.length < 40) {
    return {
      checkType: "manifest",
      fixCategory: "manifest",
      isBlocking: false,
      status: "warning",
      targetField: "description",
      message: "Manifest is valid but the description is short; reviewer should confirm listing clarity.",
      nextAction: "Expand the description so buyers and reviewers can understand the concrete agent use case."
    };
  }

  return {
    checkType: "manifest",
    fixCategory: "manifest",
    isBlocking: false,
    status: "passed",
    targetField: null,
    message: "Manifest contract includes required identity, version, tags, runtime, permissions, and schemas.",
    nextAction: "No manifest repair is needed; keep identity, version, tags, runtime, permissions, and schemas stable for this submission."
  };
}

function buildRuntimeCheck(manifest: SkillManifest): RuntimeCheckResult {
  const startedAt = Date.now();

  if (manifest.runtime.type === "http") {
    const url = parseUrl(manifest.runtime.entrypoint);

    if (!url) {
      return {
        checkType: "runtime",
        fixCategory: "runtime",
        isBlocking: true,
        status: "failed",
        latencyMs: Date.now() - startedAt,
        targetField: "runtime.entrypoint",
        message: "HTTP runtime entrypoint is not a valid URL.",
        nextAction: "Use a reachable absolute HTTPS URL in runtime.entrypoint before resubmitting this version."
      };
    }

    return {
      checkType: "runtime",
      fixCategory: "runtime",
      isBlocking: false,
      status: url.protocol === "https:" ? "passed" : "warning",
      latencyMs: Date.now() - startedAt,
      targetField: "runtime.entrypoint",
      message:
        url.protocol === "https:"
          ? "HTTP runtime entrypoint uses HTTPS and is ready for reachability testing."
          : "HTTP runtime entrypoint is not HTTPS; reviewer should require a secure endpoint before paid launch.",
      nextAction:
        url.protocol === "https:"
          ? "No runtime URL repair is needed; provide reachability evidence if the reviewer asks for production proof."
          : "Move runtime.entrypoint to HTTPS or provide reviewer evidence for why this transport is safe before paid activation."
    };
  }

  if (manifest.runtime.type === "mcp") {
    const url = parseUrl(manifest.runtime.serverUrl);

    if (!url) {
      return {
        checkType: "runtime",
        fixCategory: "runtime",
        isBlocking: true,
        status: "failed",
        latencyMs: Date.now() - startedAt,
        targetField: "runtime.serverUrl",
        message: "MCP server URL is not a valid URL.",
        nextAction: "Use a reachable absolute HTTPS URL in runtime.serverUrl before resubmitting this version."
      };
    }

    return {
      checkType: "runtime",
      fixCategory: "runtime",
      isBlocking: false,
      status: url.protocol === "https:" ? "passed" : "warning",
      latencyMs: Date.now() - startedAt,
      targetField: "runtime.serverUrl",
      message:
        url.protocol === "https:"
          ? "MCP server URL uses HTTPS and is ready for agent discovery."
          : "MCP server URL is not HTTPS; reviewer should require transport hardening.",
      nextAction:
        url.protocol === "https:"
          ? "No MCP URL repair is needed; keep discovery and tools/call evidence available for review."
          : "Move runtime.serverUrl to HTTPS or provide reviewer evidence for transport hardening before approval."
    };
  }

  return {
    checkType: "runtime",
    fixCategory: "runtime",
    isBlocking: !manifest.runtime.command,
    status: manifest.runtime.command ? "warning" : "failed",
    latencyMs: Date.now() - startedAt,
    targetField: "runtime.command",
    message: manifest.runtime.command
      ? "Local runtime command is declared; reviewer must verify packaging, sandboxing, and execution proof manually."
      : "Local runtime is missing a command.",
    nextAction: manifest.runtime.command
      ? "Attach packaging, sandboxing, and execution proof so a reviewer can make the required local-runtime decision."
      : "Declare runtime.command or switch to an external HTTP/MCP runtime before resubmitting this version."
  };
}

function buildExampleCheck(manifest: SkillManifest): RuntimeCheckResult {
  const inputSchema = asRecord(manifest.inputSchema);
  const outputSchema = asRecord(manifest.outputSchema);

  if (inputSchema.type !== "object" || outputSchema.type !== "object") {
    return {
      checkType: "example",
      fixCategory: "example",
      isBlocking: true,
      status: "failed",
      targetField: "inputSchema/outputSchema",
      message: "Input and output schemas must both be object schemas.",
      nextAction: "Change inputSchema and outputSchema to JSON object schemas before resubmitting this version."
    };
  }

  const inputProperties = asRecord(inputSchema.properties);
  const outputProperties = asRecord(outputSchema.properties);

  if (Object.keys(inputProperties).length === 0 || Object.keys(outputProperties).length === 0) {
    return {
      checkType: "example",
      fixCategory: "example",
      isBlocking: false,
      status: "warning",
      targetField: "inputSchema.properties/outputSchema.properties",
      message: "Schemas are objects but one side has no properties; reviewer should require concrete examples.",
      nextAction: "Add concrete input and output properties, plus example payloads, so developers know how agents should call the skill."
    };
  }

  return {
    checkType: "example",
    fixCategory: "example",
    isBlocking: false,
    status: "passed",
    targetField: null,
    message: "Input and output object schemas include concrete fields for example invocation review.",
    nextAction: "No schema repair is needed; keep example input and output aligned with the submitted version."
  };
}

function buildSecurityCheck(manifest: SkillManifest): RuntimeCheckResult {
  const permissionLevel = getPermissionLevel(manifest.permissions);
  const invalidSecrets = manifest.permissions.secrets.filter((secret) => !secret.trim() || secret.trim() === "*");

  if (invalidSecrets.length > 0) {
    return {
      checkType: "security",
      fixCategory: "security",
      isBlocking: true,
      status: "failed",
      targetField: "permissions.secrets",
      message: "Secret permissions must name specific secret handles; wildcard or blank secret access is not allowed.",
      nextAction: "Replace wildcard or blank secret permissions with specific named secret handles before resubmitting."
    };
  }

  if (permissionLevel === "high") {
    return {
      checkType: "security",
      fixCategory: "security",
      isBlocking: false,
      status: "warning",
      targetField: "permissions",
      message: "High-risk permissions require explicit reviewer notes and project owner approval before runtime use.",
      nextAction: "Provide a high-risk permission rationale, data-handling notes, and reviewer evidence for owner approval governance."
    };
  }

  if (manifest.permissions.network && manifest.permissions.browser) {
    return {
      checkType: "security",
      fixCategory: "security",
      isBlocking: false,
      status: "warning",
      targetField: "permissions.network/permissions.browser",
      message: "Network plus browser access requires reviewer confirmation of data policy and allowed domains.",
      nextAction: "Document allowed domains, data retention, and browser/network purpose so the reviewer can accept the warning."
    };
  }

  return {
    checkType: "security",
    fixCategory: "security",
    isBlocking: false,
    status: "passed",
    targetField: null,
    message: "Permission profile is compatible with automated low-risk review gates.",
    nextAction: "No security repair is needed; keep permission declarations narrow for this version."
  };
}

function buildReviewEvidence(input: {
  manifest: SkillManifest | null;
  organizationName: string | null;
  organizationSlug: string | null;
  payoutStatus: string | null;
  publisherName: string | null;
  publisherStatus: string | null;
}) {
  return {
    manifestSummary: input.manifest ? buildManifestSummary(input.manifest) : null,
    publisher: {
      displayName: input.publisherName ?? input.organizationName,
      organizationName: input.organizationName,
      organizationSlug: input.organizationSlug,
      payoutStatus: input.payoutStatus ?? "not_configured",
      status: input.publisherStatus ?? "missing"
    }
  };
}

function buildManifestSummary(manifest: SkillManifest) {
  const permissions = manifest.permissions ?? {
    browser: false,
    filesystem: "none" as const,
    network: false,
    secrets: []
  };
  const tags = Array.isArray(manifest.tags) ? manifest.tags : [];

  return {
    authorName: manifest.author?.name ?? null,
    authorUrl: manifest.author?.url ? safeUrlTarget(manifest.author.url) : null,
    description: truncateText(manifest.description, 220),
    displayName: manifest.displayName,
    inputPropertyCount: countSchemaProperties(manifest.inputSchema),
    inputRequiredCount: countSchemaRequired(manifest.inputSchema),
    inputType: schemaType(manifest.inputSchema),
    name: manifest.name,
    outputPropertyCount: countSchemaProperties(manifest.outputSchema),
    outputRequiredCount: countSchemaRequired(manifest.outputSchema),
    outputType: schemaType(manifest.outputSchema),
    permissionLevel: getPermissionLevel(permissions),
    permissions: {
      browser: Boolean(permissions.browser),
      filesystem: permissions.filesystem,
      network: Boolean(permissions.network),
      secretCount: Array.isArray(permissions.secrets) ? permissions.secrets.length : 0
    },
    runtimeTarget: safeRuntimeTarget(manifest.runtime),
    runtimeType: manifest.runtime?.type ?? null,
    schemaVersion: manifest.schemaVersion,
    tags: tags.slice(0, 8),
    tagsCount: tags.length,
    version: manifest.version
  };
}

function safeRuntimeTarget(runtime: SkillRuntime | undefined) {
  if (!runtime) {
    return null;
  }

  if (runtime.type === "http") {
    return safeUrlTarget(runtime.entrypoint);
  }

  if (runtime.type === "mcp") {
    return safeUrlTarget(runtime.serverUrl);
  }

  return safeLocalCommand(runtime.command);
}

function safeUrlTarget(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const url = parseUrl(value);

  if (!url) {
    return truncateText(redactPotentialSecrets(value), 160);
  }

  url.username = "";
  url.password = "";
  url.search = "";
  url.hash = "";

  return truncateText(url.toString(), 160);
}

function safeLocalCommand(value: string | null | undefined) {
  const command = value?.trim();

  if (!command) {
    return null;
  }

  return truncateText(redactPotentialSecrets(command.split(/\s+/).slice(0, 2).join(" ")), 140);
}

function schemaType(schema: SkillManifest["inputSchema"] | undefined) {
  return typeof schema?.type === "string" ? schema.type : "unknown";
}

function countSchemaProperties(schema: SkillManifest["inputSchema"] | undefined) {
  const properties = schema?.properties;
  return properties && typeof properties === "object" && !Array.isArray(properties) ? Object.keys(properties).length : 0;
}

function countSchemaRequired(schema: SkillManifest["inputSchema"] | undefined) {
  return Array.isArray(schema?.required) ? schema.required.length : 0;
}

function redactPotentialSecrets(value: string) {
  return value.replace(/(password|secret|token|api[_-]?key|key)=([^&\s]+)/gi, "$1=[redacted]");
}

function truncateText(value: string | null | undefined, maxLength: number) {
  if (!value) {
    return null;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
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

async function recordReviewSubmissionAudit(
  sql: Sql,
  input: {
    actorUserId?: string | null;
    checkSummary: RuntimeCheckCreationSummary;
    existingReview: boolean;
    reviewId: string;
    riskLevel: string;
    skill: SkillRecord;
  }
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${input.actorUserId ?? null},
      'skill.review.submitted',
      'skill_review',
      ${input.reviewId},
      ${input.existingReview ? "Publisher refreshed an open skill review submission." : "Publisher submitted a skill version for review."},
      ${sql.json({
        checkSummary: input.checkSummary,
        existingReview: input.existingReview,
        organizationId: input.skill.organization_id,
        riskLevel: input.riskLevel,
        skillSlug: input.skill.slug,
        version: input.skill.version,
        versionId: input.skill.version_id
      })}
    )
  `;
}

async function recordNotification(
  sql: Sql,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>,
  organizationId?: string | null
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId ?? null}, ${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}

function summarizeCreatedRuntimeChecks(checks: RuntimeCheckResult[]): RuntimeCheckCreationSummary {
  return {
    blockingCount: checks.filter((check) => check.isBlocking).length,
    failedCount: checks.filter((check) => check.status === "failed").length,
    passedCount: checks.filter((check) => check.status === "passed").length,
    totalCount: checks.length,
    warningCount: checks.filter((check) => check.status === "warning").length
  };
}
