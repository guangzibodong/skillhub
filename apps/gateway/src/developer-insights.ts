import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql } from "./registry.js";

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
  createdAt: string;
};

export async function listDeveloperProjects(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackDeveloperProjects(limit);
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
    ) subscriptions on true
    left join lateral (
      select
        count(*) as update_count,
        max(sue.created_at) as latest_update_at
      from project_skill_installs psi
      join skill_update_events sue on sue.skill_id = psi.skill_id
      where psi.project_id = p.id
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
    return fallbackDeveloperProjectDetail(projectSlug);
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
    ) subscriptions on true
    left join lateral (
      select
        count(*) as update_count,
        max(sue.created_at) as latest_update_at
      from project_skill_installs psi
      join skill_update_events sue on sue.skill_id = psi.skill_id
      where psi.project_id = p.id
    ) updates on true
    where p.slug = ${projectSlug}
      and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
    limit 1
  `) as ProjectRow[];
  const project = projectRows[0];

  if (!project) {
    return null;
  }

  const [installedSkills, apiKeys, updateInbox, recentInvocations, subscriptions] = await Promise.all([
    listProjectSkillDetails(project.slug, scopedOrganizationId),
    listProjectApiKeyDetails(project.slug, scopedOrganizationId),
    listProjectUpdateDetails(project.slug, scopedOrganizationId),
    listRecentProjectInvocations(project.slug, scopedOrganizationId),
    listProjectSubscriptions(project.slug, scopedOrganizationId)
  ]);

  return {
    project: mapDeveloperProject(project),
    installedSkills,
    apiKeys,
    updateInbox,
    recentInvocations,
    subscriptions
  };
}

function fallbackDeveloperProjects(limit: number) {
  return [
    {
      id: "demo-project-research",
      slug: "research-agent",
      name: "Research Agent",
      apiKeys: {
        activeCount: 2,
        revokedCount: 1
      },
      installs: {
        installedSkillCount: 8,
        approvedSkillCount: 7,
        ownerRequiredCount: 1,
        suspendedInstallCount: 0
      },
      policy: {
        policyCount: 8,
        approvalRequiredCount: 1,
        monthlyBudgetCents: 48000,
        state: "owner_review"
      },
      runtime: {
        callCount: 18400,
        successCount: 17664,
        errorCount: 642,
        blockedCount: 94,
        successRate: 0.96,
        avgLatencyMs: 1280
      },
      usage: {
        billableUsageCount: 12400,
        grossCents: 248000,
        currency: "usd"
      },
      subscriptions: {
        activeCount: 3
      },
      updates: {
        count: 2,
        latestAt: "demo"
      },
      createdAt: "demo"
    },
    {
      id: "demo-project-support",
      slug: "support-agent",
      name: "Support Agent",
      apiKeys: {
        activeCount: 1,
        revokedCount: 0
      },
      installs: {
        installedSkillCount: 5,
        approvedSkillCount: 5,
        ownerRequiredCount: 0,
        suspendedInstallCount: 0
      },
      policy: {
        policyCount: 5,
        approvalRequiredCount: 0,
        monthlyBudgetCents: 12000,
        state: "approved"
      },
      runtime: {
        callCount: 9200,
        successCount: 8832,
        errorCount: 318,
        blockedCount: 50,
        successRate: 0.96,
        avgLatencyMs: 940
      },
      usage: {
        billableUsageCount: 0,
        grossCents: 0,
        currency: "usd"
      },
      subscriptions: {
        activeCount: 1
      },
      updates: {
        count: 1,
        latestAt: "demo"
      },
      createdAt: "demo"
    }
  ].slice(0, Math.min(Math.max(Math.trunc(limit), 1), 100));
}

function fallbackDeveloperProjectDetail(projectSlug: string) {
  const project = fallbackDeveloperProjects(100).find((item) => item.slug === projectSlug);

  if (!project) {
    return null;
  }

  const isResearch = project.slug === "research-agent";

  return {
    project,
    installedSkills: [
      {
        skillSlug: "browser-research",
        displayName: "Browser Research",
        description: "Research a web topic and return concise findings with source URLs.",
        version: "0.1.0",
        verificationStatus: "verified",
        status: "installed",
        approvalState: "approved",
        permissionLevel: "medium",
        installedAt: "demo",
        updatedAt: "demo",
        policy: {
          maxPermissionLevel: "medium",
          allowNetwork: true,
          allowBrowser: true,
          filesystemAccess: "none",
          allowSecretAccess: false,
          monthlyBudgetCents: isResearch ? 48000 : 12000,
          rateLimitPerMinute: 60,
          approvalRequired: false,
          approvedAt: "demo",
          state: "approved"
        },
        runtime: {
          callCount: isResearch ? 18400 : 9200,
          successCount: isResearch ? 17664 : 8832,
          errorCount: isResearch ? 642 : 318,
          blockedCount: isResearch ? 94 : 50,
          successRate: 0.96,
          avgLatencyMs: isResearch ? 1280 : 940
        },
        usage: {
          billableUsageCount: isResearch ? 12400 : 0,
          grossCents: isResearch ? 248000 : 0,
          currency: "usd"
        },
        pricing: {
          billingModel: isResearch ? "per_call" : "free",
          unitAmountCents: isResearch ? 2 : 0,
          currency: "usd",
          status: "active"
        },
        updates: {
          count: isResearch ? 2 : 1,
          latestAt: "demo"
        },
        incidents: {
          openCount: 0
        }
      },
      {
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        description: "Summarize structured datasets with typed output.",
        version: "0.1.0",
        verificationStatus: "submitted",
        status: "installed",
        approvalState: isResearch ? "owner_required" : "approved",
        permissionLevel: "medium",
        installedAt: "demo",
        updatedAt: "demo",
        policy: {
          maxPermissionLevel: "medium",
          allowNetwork: false,
          allowBrowser: false,
          filesystemAccess: "read",
          allowSecretAccess: false,
          monthlyBudgetCents: isResearch ? 0 : 8000,
          rateLimitPerMinute: 30,
          approvalRequired: isResearch,
          approvedAt: isResearch ? null : "demo",
          state: isResearch ? "owner_review" : "approved"
        },
        runtime: {
          callCount: 9200,
          successCount: 8832,
          errorCount: 318,
          blockedCount: 50,
          successRate: 0.96,
          avgLatencyMs: 1420
        },
        usage: {
          billableUsageCount: 0,
          grossCents: 0,
          currency: "usd"
        },
        pricing: {
          billingModel: "free",
          unitAmountCents: 0,
          currency: "usd",
          status: "active"
        },
        updates: {
          count: 1,
          latestAt: "demo"
        },
        incidents: {
          openCount: isResearch ? 1 : 0
        }
      }
    ],
    apiKeys: [
      {
        id: "demo-key-primary",
        projectSlug: project.slug,
        name: "Production runtime",
        keyPrefix: "skh",
        keyLast4: "demo",
        lastUsedAt: "demo",
        createdAt: "demo",
        revokedAt: null
      },
      {
        id: "demo-key-rotation",
        projectSlug: project.slug,
        name: "Rotation candidate",
        keyPrefix: "skh",
        keyLast4: "next",
        lastUsedAt: null,
        createdAt: "demo",
        revokedAt: null
      }
    ],
    updateInbox: [
      {
        id: "demo-update-browser-research",
        skillSlug: "browser-research",
        displayName: "Browser Research",
        eventType: "new_version",
        severity: "info",
        title: "New citation freshness scoring available",
        body: "Version 0.1.1 adds fresher source ranking for research agents.",
        createdAt: "demo"
      },
      {
        id: "demo-update-dataset-summarizer",
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        eventType: "security",
        severity: "medium",
        title: "File-retention policy requires review",
        body: "Project owner approval is required before broad file reads are enabled.",
        createdAt: "demo"
      }
    ],
    recentInvocations: [
      {
        id: "demo-invocation-success",
        skillSlug: "browser-research",
        displayName: "Browser Research",
        version: "0.1.0",
        status: "success",
        latencyMs: 1184,
        errorCode: null,
        createdAt: "demo"
      },
      {
        id: "demo-invocation-blocked",
        skillSlug: "dataset-summarizer",
        displayName: "Dataset Summarizer",
        version: "0.1.0",
        status: "blocked",
        latencyMs: 42,
        errorCode: "policy_approval_required",
        createdAt: "demo"
      }
    ],
    subscriptions: [
      {
        id: "demo-subscription-browser-research",
        skillSlug: "browser-research",
        displayName: "Browser Research",
        status: isResearch ? "active" : "trialing",
        billingModel: isResearch ? "per_call" : "free",
        unitAmountCents: isResearch ? 2 : 0,
        currency: "usd",
        currentPeriodStart: "demo",
        currentPeriodEnd: "demo",
        createdAt: "demo"
      }
    ]
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
    return fallbackDeveloperProjectDetail(projectSlug)?.installedSkills ?? [];
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
        max(created_at) as latest_update_at
      from skill_update_events
      where skill_id = s.id
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
    return fallbackDeveloperProjectDetail(projectSlug)?.apiKeys ?? [];
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
    return fallbackDeveloperProjectDetail(projectSlug)?.updateInbox ?? [];
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
      sue.created_at as "createdAt"
    from project_skill_installs psi
    join projects p on p.id = psi.project_id
    join skills s on s.id = psi.skill_id
    join skill_update_events sue on sue.skill_id = s.id
    where p.slug = ${projectSlug}
      and (${organizationId}::uuid is null or p.organization_id = ${organizationId})
    order by sue.created_at desc
    limit 50
  `) as ProjectUpdateRow[];
}

async function listRecentProjectInvocations(projectSlug: string, organizationId: string | null) {
  const sql = await getSql();

  if (!sql) {
    return fallbackDeveloperProjectDetail(projectSlug)?.recentInvocations ?? [];
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
    return fallbackDeveloperProjectDetail(projectSlug)?.subscriptions ?? [];
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
      sub.created_at as "createdAt"
    from subscriptions sub
    join projects p on p.id = sub.project_id
    join skills s on s.id = sub.skill_id
    left join skill_prices sp on sp.id = sub.price_id
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
