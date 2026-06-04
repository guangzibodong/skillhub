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
