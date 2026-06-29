import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql } from "./registry.js";
import { listProjectInvoices } from "./project-invoices.js";
import { listProjectSavedSkills } from "./project-saved-skills.js";

type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  activeKeyCount: number;
  revokedKeyCount: number;
  installedSkillCount: number;
  approvedSkillCount: number;
  ownerRequiredCount: number;
  suspendedInstallCount: number;
  policyCount: number;
  approvalRequiredCount: number;
  monthlyBudgetCents: number;
  callCount: number;
  successCount: number;
  errorCount: number;
  blockedCount: number;
  avgLatencyMs: number | null;
  billableUsageCount: number;
  grossCents: number;
  currency: string | null;
  activeSubscriptionCount: number;
  updateCount: number;
  latestUpdateAt: string | null;
};

type ProjectInstallDetailRow = {
  skillSlug: string;
  displayName: string;
  description: string;
  version: string | null;
  verificationStatus: SkillSummary["verificationStatus"];
  manifest: SkillManifest | null;
  status: string;
  approvalState: string;
  installedAt: string;
  updatedAt: string;
  maxPermissionLevel: SkillSummary["permissionLevel"] | null;
  allowNetwork: boolean | null;
  allowBrowser: boolean | null;
  filesystemAccess: "none" | "read" | "write" | null;
  allowSecretAccess: boolean | null;
  monthlyBudgetCents: number | null;
  rateLimitPerMinute: number | null;
  approvalRequired: boolean | null;
  approvedAt: string | null;
  callCount: number;
  successCount: number;
  errorCount: number;
  blockedCount: number;
  avgLatencyMs: number | null;
  billableUsageCount: number;
  grossCents: number;
  currency: string | null;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  priceStatus: "draft" | "active" | "archived" | null;
  priceCurrency: string | null;
  updateCount: number;
  latestUpdateAt: string | null;
  openIncidentCount: number;
};

type ProjectApiKeyRow = {
  id: string;
  projectSlug: string;
  name: string;
  keyPrefix: string;
  keyLast4: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

type ProjectUpdateRow = {
  id: string;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
  body: string | null;
  currentVersion: string | null;
  targetVersion: string | null;
  targetReviewStatus: string | null;
  adoptionState: string;
  actionStatus: string;
  actionNote: string | null;
  scheduledFor: string | null;
  resolvedAt: string | null;
  actionUpdatedAt: string | null;
  createdAt: string;
};

type ProjectInvocationRow = {
  id: string;
  skillSlug: string | null;
  displayName: string | null;
  version: string | null;
  status: "success" | "error" | "blocked";
  latencyMs: number | null;
  errorCode: string | null;
  createdAt: string;
};

type ProjectSubscriptionRow = {
  id: string;
  skillSlug: string;
  displayName: string;
  status: string;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  ledgerState: "awaiting_post" | "not_billable" | "not_postable" | "posted" | "renewal_due" | "trial_access";
  ledgerTransactionId: string | null;
  ledgerSourceReference: string | null;
  ledgerGrossCents: number | null;
  ledgerCurrency: string | null;
  ledgerStatus: string | null;
  ledgerPostedAt: string | null;
  ledgerInvoiceCount: number;
  renewalReady: boolean;
  pausedAt: string | null;
  canceledAt: string | null;
  updatedAt: string | null;
  createdAt: string;
};

export async function listDeveloperProjects(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    select
      p.id::text,
      p.slug,
      p.name,
      p.created_at as "createdAt",
      coalesce(keys.active_count, 0)::int as "activeKeyCount",
      coalesce(keys.revoked_count, 0)::int as "revokedKeyCount",
      coalesce(installs.installed_count, 0)::int as "installedSkillCount",
      coalesce(installs.approved_count, 0)::int as "approvedSkillCount",
      coalesce(installs.owner_required_count, 0)::int as "ownerRequiredCount",
      coalesce(installs.suspended_count, 0)::int as "suspendedInstallCount",
      coalesce(policies.policy_count, 0)::int as "policyCount",
      coalesce(policies.approval_required_count, 0)::int as "approvalRequiredCount",
      coalesce(policies.monthly_budget_cents, 0)::int as "monthlyBudgetCents",
      coalesce(invocations.call_count, 0)::int as "callCount",
      coalesce(invocations.success_count, 0)::int as "successCount",
      coalesce(invocations.error_count, 0)::int as "errorCount",
      coalesce(invocations.blocked_count, 0)::int as "blockedCount",
      invocations.avg_latency_ms as "avgLatencyMs",
      coalesce(usage_stats.billable_count, 0)::int as "billableUsageCount",
      coalesce(usage_stats.gross_cents, 0)::int as "grossCents",
      usage_stats.currency,
      coalesce(subscriptions.active_count, 0)::int as "activeSubscriptionCount",
      coalesce(updates.update_count, 0)::int as "updateCount",
      updates.latest_update_at as "latestUpdateAt"
    from projects p
    left join lateral (
      select
        count(*) filter (where revoked_at is null) as active_count,
        count(*) filter (where revoked_at is not null) as revoked_count
      from api_keys
      where project_id = p.id
    ) keys on true
    left join lateral (
      select
        count(*) filter (where status = 'installed') as installed_count,
        count(*) filter (where approval_state = 'approved') as approved_count,
        count(*) filter (where approval_state = 'owner_required') as owner_required_count,
        count(*) filter (where status = 'suspended') as suspended_count
      from project_skill_installs
      where project_id = p.id
    ) installs on true
    left join lateral (
      select
        count(*) as policy_count,
        count(*) filter (where approval_required = true and approved_at is null) as approval_required_count,
        coalesce(sum(monthly_budget_cents), 0)::int as monthly_budget_cents
      from project_skill_policies
      where project_id = p.id
    ) policies on true
    left join lateral (
      select
        count(*) as call_count,
        count(*) filter (where status = 'success') as success_count,
        count(*) filter (where status = 'error') as error_count,
        count(*) filter (where status = 'blocked') as blocked_count,
        round(avg(latency_ms))::int as avg_latency_ms
      from skill_invocations
      where project_id = p.id
    ) invocations on true
    left join lateral (
      select
        count(*) filter (where billable = true) as billable_count,
        coalesce(sum(amount_cents) filter (where billable = true), 0)::int as gross_cents,
        max(currency) as currency
      from usage_events
      where project_id = p.id
    ) usage_stats on true
    left join lateral (
      select count(*) as active_count
      from subscriptions
      where project_id = p.id
        and status in ('trialing', 'active')
        and (current_period_end is null or current_period_end > now())
    ) subscriptions on true
    left join lateral (
      select
        count(*) as update_count,
        max(sue.created_at) as latest_update_at
      from project_skill_installs psi
      join skill_update_events sue on sue.skill_id = psi.skill_id
      left join project_update_actions pua on pua.project_id = p.id and pua.skill_update_event_id = sue.id
      where psi.project_id = p.id
        and coalesce(pua.status, 'open') not in ('adopted', 'ignored')
    ) updates on true
    where (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    order by p.created_at desc
    limit ${safeLimit}
  `) as ProjectRow[];

  return rows.map(mapDeveloperProject);
}

export async function getDeveloperProjectDetail(projectSlug: string, organizationId: string | null | undefined) {
  const sql = await getSql();

  if (!sql) {
    return null;
  }

  const scopedOrganizationId = organizationId ?? null;
  const projectRows = (await sql`
    select
      p.id::text,
      p.slug,
      p.name,
      p.created_at as "createdAt",
      coalesce(keys.active_count, 0)::int as "activeKeyCount",
      coalesce(keys.revoked_count, 0)::int as "revokedKeyCount",
      coalesce(installs.installed_count, 0)::int as "installedSkillCount",
      coalesce(installs.approved_count, 0)::int as "approvedSkillCount",
      coalesce(installs.owner_required_count, 0)::int as "ownerRequiredCount",
      coalesce(installs.suspended_count, 0)::int as "suspendedInstallCount",
      coalesce(policies.policy_count, 0)::int as "policyCount",
      coalesce(policies.approval_required_count, 0)::int as "approvalRequiredCount",
      coalesce(policies.monthly_budget_cents, 0)::int as "monthlyBudgetCents",
      coalesce(invocations.call_count, 0)::int as "callCount",
      coalesce(invocations.success_count, 0)::int as "successCount",
      coalesce(invocations.error_count, 0)::int as "errorCount",
      coalesce(invocations.blocked_count, 0)::int as "blockedCount",
      invocations.avg_latency_ms as "avgLatencyMs",
      coalesce(usage_stats.billable_count, 0)::int as "billableUsageCount",
      coalesce(usage_stats.gross_cents, 0)::int as "grossCents",
      usage_stats.currency,
      coalesce(subscriptions.active_count, 0)::int as "activeSubscriptionCount",
      coalesce(updates.update_count, 0)::int as "updateCount",
      updates.latest_update_at as "latestUpdateAt"
    from projects p
    left join lateral (
      select
        count(*) filter (where revoked_at is null) as active_count,
        count(*) filter (where revoked_at is not null) as revoked_count
      from api_keys
      where project_id = p.id
    ) keys on true
    left join lateral (
      select
        count(*) filter (where status = 'installed') as installed_count,
        count(*) filter (where approval_state = 'approved') as approved_count,
        count(*) filter (where approval_state = 'owner_required') as owner_required_count,
        count(*) filter (where status = 'suspended') as suspended_count
      from project_skill_installs
      where project_id = p.id
    ) installs on true
    left join lateral (
      select
        count(*) as policy_count,
        count(*) filter (where approval_required = true and approved_at is null) as approval_required_count,
        coalesce(sum(monthly_budget_cents), 0)::int as monthly_budget_cents
      from project_skill_policies
      where project_id = p.id
    ) policies on true
    left join lateral (
      select
        count(*) as call_count,
        count(*) filter (where status = 'success') as success_count,
        count(*) filter (where status = 'error') as error_count,
        count(*) filter (where status = 'blocked') as blocked_count,
        round(avg(latency_ms))::int as avg_latency_ms
      from skill_invocations
      where project_id = p.id
    ) invocations on true
    left join lateral (
      select
        count(*) filter (where billable = true) as billable_count,
        coalesce(sum(amount_cents) filter (where billable = true), 0)::int as gross_cents,
        max(currency) as currency
      from usage_events
      where project_id = p.id
    ) usage_stats on true
    left join lateral (
      select count(*) as active_count
      from subscriptions
      where project_id = p.id
        and status in ('trialing', 'active')
        and (current_period_end is null or current_period_end > now())
    ) subscriptions on true
    left join lateral (
      select
        count(*) as update_count,
        max(sue.created_at) as latest_update_at
      from project_skill_installs psi
      join skill_update_events sue on sue.skill_id = psi.skill_id
      left join project_update_actions pua on pua.project_id = p.id and pua.skill_update_event_id = sue.id
      where psi.project_id = p.id
        and coalesce(pua.status, 'open') not in ('adopted', 'ignored')
    ) updates on true
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    limit 1
  `) as ProjectRow[];
  const project = projectRows[0];

  if (!project) {
    return null;
  }

  const [installedSkills, apiKeys, updateInbox, recentInvocations, subscriptions, invoices, savedSkills] = await Promise.all([
    listProjectSkillDetails(project.slug, scopedOrganizationId),
    listProjectApiKeyDetails(project.slug, scopedOrganizationId),
    listProjectUpdateDetails(project.slug, scopedOrganizationId),
    listRecentProjectInvocations(project.slug, scopedOrganizationId),
    listProjectSubscriptions(project.slug, scopedOrganizationId),
    listProjectInvoices(project.slug, scopedOrganizationId),
    listProjectSavedSkills(project.slug, scopedOrganizationId)
  ]);

  return {
    project: mapDeveloperProject(project),
    installedSkills,
    apiKeys,
    updateInbox,
    recentInvocations,
    subscriptions,
    invoices,
    savedSkills
  };
}

function mapDeveloperProject(row: ProjectRow) {
  const successRate = row.callCount > 0 ? row.successCount / row.callCount : null;
  const policyState =
    row.suspendedInstallCount > 0
      ? "suspended"
      : row.ownerRequiredCount > 0 || row.approvalRequiredCount > 0
      ? "owner_review"
      : "approved";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    apiKeys: {
      activeCount: row.activeKeyCount,
      revokedCount: row.revokedKeyCount
    },
    installs: {
      installedSkillCount: row.installedSkillCount,
      approvedSkillCount: row.approvedSkillCount,
      ownerRequiredCount: row.ownerRequiredCount,
      suspendedInstallCount: row.suspendedInstallCount
    },
    policy: {
      policyCount: row.policyCount,
      approvalRequiredCount: row.approvalRequiredCount,
      monthlyBudgetCents: row.monthlyBudgetCents,
      state: policyState
    },
    runtime: {
      callCount: row.callCount,
      successCount: row.successCount,
      errorCount: row.errorCount,
      blockedCount: row.blockedCount,
      successRate,
      avgLatencyMs: row.avgLatencyMs
    },
    usage: {
      billableUsageCount: row.billableUsageCount,
      grossCents: row.grossCents,
      currency: row.currency ?? "usd"
    },
    subscriptions: {
      activeCount: row.activeSubscriptionCount
    },
    updates: {
      count: row.updateCount,
      latestAt: row.latestUpdateAt
    },
    createdAt: row.createdAt
  };
}

async function listProjectSkillDetails(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  const rows = (await sql`
    select
      s.slug as "skillSlug",
      s.display_name as "displayName",
      s.description,
      sv.version,
      s.verification_status as "verificationStatus",
      sv.manifest,
      psi.status,
      psi.approval_state as "approvalState",
      psi.installed_at as "installedAt",
      psi.updated_at as "updatedAt",
      psp.max_permission_level as "maxPermissionLevel",
      psp.allow_network as "allowNetwork",
      psp.allow_browser as "allowBrowser",
      psp.filesystem_access as "filesystemAccess",
      psp.allow_secret_access as "allowSecretAccess",
      psp.monthly_budget_cents as "monthlyBudgetCents",
      psp.rate_limit_per_minute as "rateLimitPerMinute",
      psp.approval_required as "approvalRequired",
      psp.approved_at as "approvedAt",
      coalesce(invocations.call_count, 0)::int as "callCount",
      coalesce(invocations.success_count, 0)::int as "successCount",
      coalesce(invocations.error_count, 0)::int as "errorCount",
      coalesce(invocations.blocked_count, 0)::int as "blockedCount",
      invocations.avg_latency_ms as "avgLatencyMs",
      coalesce(usage_stats.billable_count, 0)::int as "billableUsageCount",
      coalesce(usage_stats.gross_cents, 0)::int as "grossCents",
      usage_stats.currency,
      price.billing_model as "billingModel",
      price.unit_amount_cents as "unitAmountCents",
      price.status as "priceStatus",
      price.currency as "priceCurrency",
      coalesce(updates.update_count, 0)::int as "updateCount",
      updates.latest_update_at as "latestUpdateAt",
      coalesce(incidents.open_count, 0)::int as "openIncidentCount"
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    left join skill_versions sv on sv.id = psi.skill_version_id
    left join project_skill_policies psp on psp.project_id = p.id and psp.skill_id = s.id
    left join lateral (
      select
        count(*) as call_count,
        count(*) filter (where status = 'success') as success_count,
        count(*) filter (where status = 'error') as error_count,
        count(*) filter (where status = 'blocked') as blocked_count,
        round(avg(latency_ms))::int as avg_latency_ms
      from skill_invocations
      where project_id = p.id
        and skill_id = s.id
    ) invocations on true
    left join lateral (
      select
        count(*) filter (where billable = true) as billable_count,
        coalesce(sum(amount_cents) filter (where billable = true), 0)::int as gross_cents,
        max(currency) as currency
      from usage_events
      where project_id = p.id
        and skill_id = s.id
    ) usage_stats on true
    left join lateral (
      select billing_model, unit_amount_cents, currency, status
      from skill_prices
      where skill_id = s.id
      order by (status = 'active') desc, created_at desc
      limit 1
    ) price on true
    left join lateral (
      select
        count(*) as update_count,
        max(sue.created_at) as latest_update_at
      from skill_update_events sue
      left join project_update_actions pua on pua.project_id = p.id and pua.skill_update_event_id = sue.id
      where sue.skill_id = s.id
        and coalesce(pua.status, 'open') not in ('adopted', 'ignored')
    ) updates on true
    left join lateral (
      select count(*) as open_count
      from skill_incidents
      where skill_id = s.id
        and status in ('open', 'monitoring')
    ) incidents on true
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by psi.updated_at desc
  `) as ProjectInstallDetailRow[];

  return rows.map((row) => {
    const permissionLevel = getManifestPermissionLevel(row.manifest);
    const successRate = row.callCount > 0 ? row.successCount / row.callCount : null;
    const policyState =
      row.status === "suspended"
        ? "suspended"
        : row.approvalState === "owner_required" || (row.approvalRequired === true && !row.approvedAt)
        ? "owner_review"
        : "approved";

    return {
      skillSlug: row.skillSlug,
      displayName: row.displayName,
      description: row.description,
      version: row.version,
      verificationStatus: row.verificationStatus,
      status: row.status,
      approvalState: row.approvalState,
      permissionLevel,
      installedAt: row.installedAt,
      updatedAt: row.updatedAt,
      policy: {
        maxPermissionLevel: row.maxPermissionLevel ?? permissionLevel,
        allowNetwork: row.allowNetwork ?? Boolean(row.manifest?.permissions.network),
        allowBrowser: row.allowBrowser ?? Boolean(row.manifest?.permissions.browser),
        filesystemAccess: row.filesystemAccess ?? row.manifest?.permissions.filesystem ?? "none",
        allowSecretAccess: row.allowSecretAccess ?? Boolean(row.manifest?.permissions.secrets.length),
        monthlyBudgetCents: row.monthlyBudgetCents ?? 0,
        rateLimitPerMinute: row.rateLimitPerMinute,
        approvalRequired: row.approvalRequired ?? permissionLevel === "high",
        approvedAt: row.approvedAt,
        state: policyState
      },
      runtime: {
        callCount: row.callCount,
        successCount: row.successCount,
        errorCount: row.errorCount,
        blockedCount: row.blockedCount,
        successRate,
        avgLatencyMs: row.avgLatencyMs
      },
      usage: {
        billableUsageCount: row.billableUsageCount,
        grossCents: row.grossCents,
        currency: row.currency ?? "usd"
      },
      pricing: {
        billingModel: row.billingModel ?? "free",
        unitAmountCents: row.unitAmountCents ?? 0,
        currency: row.priceCurrency ?? row.currency ?? "usd",
        status: row.priceStatus ?? "draft"
      },
      updates: {
        count: row.updateCount,
        latestAt: row.latestUpdateAt
      },
      incidents: {
        openCount: row.openIncidentCount
      }
    };
  });
}

async function listProjectApiKeyDetails(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return (await sql`
    select
      ak.id::text,
      p.slug as "projectSlug",
      ak.name,
      ak.key_prefix as "keyPrefix",
      ak.key_last4 as "keyLast4",
      ak.last_used_at as "lastUsedAt",
      ak.created_at as "createdAt",
      ak.revoked_at as "revokedAt"
    from api_keys ak
    join projects p on p.id = ak.project_id
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by ak.created_at desc
    limit 20
  `) as ProjectApiKeyRow[];
}

async function listProjectUpdateDetails(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return (await sql`
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
      coalesce(pua.status, 'open') as "actionStatus",
      pua.note as "actionNote",
      pua.scheduled_for as "scheduledFor",
      pua.resolved_at as "resolvedAt",
      pua.updated_at as "actionUpdatedAt",
      sue.created_at as "createdAt"
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
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
      and coalesce(pua.status, 'open') not in ('adopted', 'ignored')
    order by sue.created_at desc
    limit 50
  `) as ProjectUpdateRow[];
}

async function listRecentProjectInvocations(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return (await sql`
    select
      si.id::text,
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sv.version,
      si.status,
      si.latency_ms as "latencyMs",
      si.error_code as "errorCode",
      si.created_at as "createdAt"
    from skill_invocations si
    join projects p on p.id = si.project_id
    left join skills s on s.id = si.skill_id
    left join skill_versions sv on sv.id = si.skill_version_id
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by si.created_at desc
    limit 25
  `) as ProjectInvocationRow[];
}

async function listProjectSubscriptions(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return (await sql`
    select
      sub.id::text,
      s.slug as "skillSlug",
      s.display_name as "displayName",
      sub.status,
      sp.billing_model as "billingModel",
      sp.unit_amount_cents as "unitAmountCents",
      sp.currency,
      sub.current_period_start as "currentPeriodStart",
      sub.current_period_end as "currentPeriodEnd",
      case
        when sub.status = 'trialing' then 'trial_access'
        when coalesce(sp.billing_model, 'free') <> 'subscription' or coalesce(sp.unit_amount_cents, 0) <= 0 then 'not_billable'
        when ledger.transaction_id is not null
          and ledger.status = 'posted'
          and coalesce(ledger.amount_cents, 0) > 0
          and sub.status = 'active'
          and sub.current_period_end <= now()
          then 'renewal_due'
        when ledger.transaction_id is not null then 'posted'
        when sub.status = 'active'
          and sub.current_period_start is not null
          and sub.current_period_end is not null
          and sub.current_period_end > sub.current_period_start
          then 'awaiting_post'
        else 'not_postable'
      end as "ledgerState",
      ledger.transaction_id as "ledgerTransactionId",
      ledger.source_reference as "ledgerSourceReference",
      ledger.amount_cents as "ledgerGrossCents",
      ledger.currency as "ledgerCurrency",
      ledger.status as "ledgerStatus",
      ledger.created_at as "ledgerPostedAt",
      coalesce(ledger.invoice_count, 0)::int as "ledgerInvoiceCount",
      (
        sub.status = 'active'
        and sub.current_period_end is not null
        and sub.current_period_end <= now()
        and ledger.transaction_id is not null
        and ledger.status = 'posted'
        and coalesce(ledger.amount_cents, 0) > 0
      ) as "renewalReady",
      sub.paused_at as "pausedAt",
      sub.canceled_at as "canceledAt",
      sub.updated_at as "updatedAt",
      sub.created_at as "createdAt"
    from subscriptions sub
    join projects p on p.id = sub.project_id
    join skills s on s.id = sub.skill_id
    left join skill_prices sp on sp.id = sub.price_id
    left join lateral (
      select
        t.id::text as transaction_id,
        t.source_reference,
        t.amount_cents,
        t.currency,
        t.status,
        t.created_at,
        coalesce(invoice_stats.invoice_count, 0)::int as invoice_count
      from transactions t
      left join lateral (
        select count(*)::int as invoice_count
        from project_invoice_line_items pili
        join project_invoices pi on pi.id = pili.invoice_id
        where pili.transaction_id = t.id
          and pi.project_id = p.id
      ) invoice_stats on true
      where t.source_type = 'subscription'
        and t.source_reference = concat(
          'subscription:',
          sub.id::text,
          ':',
          to_char(date_trunc('milliseconds', sub.current_period_start at time zone 'UTC'), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
        )
      order by t.created_at desc
      limit 1
    ) ledger on true
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by sub.created_at desc
    limit 20
  `) as ProjectSubscriptionRow[];
}

function getManifestPermissionLevel(manifest: SkillManifest | null) {
  if (!manifest) {
    return "low";
  }

  return getPermissionLevel(manifest.permissions);
}
