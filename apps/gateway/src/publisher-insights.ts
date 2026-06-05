import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PublisherSkillRow = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  verificationStatus: SkillSummary["verificationStatus"];
  updatedAt: string;
  versionId: string | null;
  version: string | null;
  manifest: SkillManifest | null;
  reviewStatus: string | null;
  reviewRiskLevel: SkillSummary["permissionLevel"] | null;
  reviewNotes: string | null;
  reviewDecidedAt: string | null;
  runtimeCheckCount: number;
  runtimePassedCount: number;
  runtimeFailedCount: number;
  runtimeWarningCount: number;
  installCount: number;
  callCount: number;
  successCount: number;
  errorCount: number;
  blockedCount: number;
  avgLatencyMs: number | null;
  billableUsageCount: number;
  grossCents: number;
  currency: string | null;
  priceId: string | null;
  billingModel: "free" | "per_call" | "subscription" | null;
  unitAmountCents: number | null;
  priceStatus: "draft" | "active" | "archived" | null;
  averageRating: number | null;
  publishedFeedbackCount: number;
  pendingFeedbackCount: number;
  qualityScore: string | number | null;
  installSuccessRate: string | number | null;
  incidentCount: number | null;
};

export async function listPublisherSkills(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackPublisherSkills(limit);
  }

  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    select
      s.id::text,
      s.slug,
      s.display_name as "displayName",
      s.description,
      s.visibility,
      s.verification_status as "verificationStatus",
      s.updated_at as "updatedAt",
      latest.id::text as "versionId",
      latest.version,
      latest.manifest,
      review.status as "reviewStatus",
      review.risk_level as "reviewRiskLevel",
      review.notes as "reviewNotes",
      review.decided_at as "reviewDecidedAt",
      coalesce(checks.total_count, 0)::int as "runtimeCheckCount",
      coalesce(checks.passed_count, 0)::int as "runtimePassedCount",
      coalesce(checks.failed_count, 0)::int as "runtimeFailedCount",
      coalesce(checks.warning_count, 0)::int as "runtimeWarningCount",
      coalesce(installs.install_count, 0)::int as "installCount",
      coalesce(invocations.call_count, 0)::int as "callCount",
      coalesce(invocations.success_count, 0)::int as "successCount",
      coalesce(invocations.error_count, 0)::int as "errorCount",
      coalesce(invocations.blocked_count, 0)::int as "blockedCount",
      invocations.avg_latency_ms as "avgLatencyMs",
      coalesce(usage_stats.billable_count, 0)::int as "billableUsageCount",
      coalesce(usage_stats.gross_cents, 0)::int as "grossCents",
      usage_stats.currency,
      price.id::text as "priceId",
      price.billing_model as "billingModel",
      price.unit_amount_cents as "unitAmountCents",
      price.status as "priceStatus",
      feedback.average_rating as "averageRating",
      coalesce(feedback.published_count, 0)::int as "publishedFeedbackCount",
      coalesce(feedback.pending_count, 0)::int as "pendingFeedbackCount",
      pqs.score as "qualityScore",
      pqs.install_success_rate as "installSuccessRate",
      pqs.incident_count as "incidentCount"
    from skills s
    left join lateral (
      select id, version, manifest
      from skill_versions
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) latest on true
    left join lateral (
      select status, risk_level, notes, decided_at
      from skill_reviews
      where skill_id = s.id
      order by created_at desc
      limit 1
    ) review on true
    left join lateral (
      select
        count(*) as total_count,
        count(*) filter (where status = 'passed') as passed_count,
        count(*) filter (where status = 'failed') as failed_count,
        count(*) filter (where status = 'warning') as warning_count
      from skill_runtime_checks
      where skill_version_id = latest.id
    ) checks on true
    left join lateral (
      select count(*) as install_count
      from project_skill_installs
      where skill_id = s.id
        and status = 'installed'
    ) installs on true
    left join lateral (
      select
        count(*) as call_count,
        count(*) filter (where status = 'success') as success_count,
        count(*) filter (where status = 'error') as error_count,
        count(*) filter (where status = 'blocked') as blocked_count,
        round(avg(latency_ms))::int as avg_latency_ms
      from skill_invocations
      where skill_id = s.id
    ) invocations on true
    left join lateral (
      select
        count(*) filter (where billable = true) as billable_count,
        coalesce(sum(amount_cents) filter (where billable = true), 0)::int as gross_cents,
        max(currency) as currency
      from usage_events
      where skill_id = s.id
    ) usage_stats on true
    left join lateral (
      select id, billing_model, unit_amount_cents, status
      from skill_prices
      where skill_id = s.id
      order by case when status = 'active' then 0 else 1 end, created_at desc
      limit 1
    ) price on true
    left join lateral (
      select
        round((avg(rating) filter (where status = 'published'))::numeric, 1)::float as average_rating,
        count(*) filter (where status = 'published')::int as published_count,
        count(*) filter (where status = 'pending')::int as pending_count
      from skill_feedback
      where skill_id = s.id
    ) feedback on true
    left join publisher_profiles pp on pp.organization_id = s.organization_id
    left join publisher_quality_scores pqs on pqs.publisher_profile_id = pp.id
    where (${scopedOrganizationId}::uuid is null or s.organization_id = ${scopedOrganizationId})
    order by s.updated_at desc
    limit ${safeLimit}
  `) as PublisherSkillRow[];

  return rows.map(mapPublisherSkill);
}

async function fallbackPublisherSkills(limit: number) {
  const skills = await searchSkills({ limit });

  return skills.map((skill, index) => {
    const calls = index === 0 ? 18400 : index === 1 ? 9200 : 0;
    const successCount = Math.floor(calls * 0.96);
    const errorCount = Math.max(calls - successCount, 0);
    const runtimeFailedCount = skill.verificationStatus === "verified" ? 0 : 1;

    return {
      id: skill.id,
      slug: skill.slug,
      displayName: skill.displayName,
      description: skill.description,
      version: skill.version,
      visibility: "public",
      verificationStatus: skill.verificationStatus,
      permissionLevel: skill.permissionLevel,
      review: {
        status: skill.verificationStatus === "verified" ? "approved" : "queued",
        riskLevel: skill.permissionLevel,
        notes: skill.verificationStatus === "verified" ? "Demo listing approved." : "Needs operator review.",
        decidedAt: skill.verificationStatus === "verified" ? "demo" : null
      },
      runtime: {
        checkCount: 4,
        passedCount: runtimeFailedCount ? 2 : 4,
        failedCount: runtimeFailedCount,
        warningCount: 0,
        health: runtimeFailedCount ? "needs_attention" : "healthy"
      },
      analytics: {
        installCount: index === 0 ? 46 : 12,
        callCount: calls,
        successCount,
        errorCount,
        blockedCount: 0,
        successRate: calls > 0 ? successCount / calls : null,
        avgLatencyMs: calls > 0 ? 1280 + index * 140 : null,
        billableUsageCount: index === 0 ? 12400 : 0,
        grossCents: index === 0 ? 248000 : 0,
        currency: "usd"
      },
      pricing: {
        billingModel: index === 0 ? "per_call" : "free",
        unitAmountCents: index === 0 ? 2 : 0,
        status: "active"
      },
      feedback: {
        averageRating: index === 0 ? 4.7 : null,
        publishedCount: index === 0 ? 18 : 0,
        pendingCount: index === 0 ? 2 : 0
      },
      quality: {
        score: index === 0 ? 86 : 64,
        installSuccessRate: calls > 0 ? 0.96 : null,
        incidentCount: runtimeFailedCount,
        checklist: buildChecklist({
          hasManifest: true,
          hasReviewSignal: skill.verificationStatus !== "draft",
          hasRuntimeHealth: !runtimeFailedCount,
          hasPricing: true,
          hasUsage: calls > 0
        })
      },
      updatedAt: "demo"
    };
  });
}

function mapPublisherSkill(row: PublisherSkillRow) {
  const permissionLevel = row.manifest?.permissions ? getPermissionLevel(row.manifest.permissions) : "medium";
  const successRate = row.callCount > 0 ? row.successCount / row.callCount : null;
  const runtimeHealth =
    row.runtimeFailedCount > 0 ? "needs_attention" : row.runtimeWarningCount > 0 ? "warning" : row.runtimeCheckCount > 0 ? "healthy" : "not_checked";

  return {
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    description: row.description,
    version: row.version,
    visibility: row.visibility,
    verificationStatus: row.verificationStatus,
    permissionLevel,
    review: {
      status: row.reviewStatus,
      riskLevel: row.reviewRiskLevel,
      notes: row.reviewNotes,
      decidedAt: row.reviewDecidedAt
    },
    runtime: {
      checkCount: row.runtimeCheckCount,
      passedCount: row.runtimePassedCount,
      failedCount: row.runtimeFailedCount,
      warningCount: row.runtimeWarningCount,
      health: runtimeHealth
    },
    analytics: {
      installCount: row.installCount,
      callCount: row.callCount,
      successCount: row.successCount,
      errorCount: row.errorCount,
      blockedCount: row.blockedCount,
      successRate,
      avgLatencyMs: row.avgLatencyMs,
      billableUsageCount: row.billableUsageCount,
      grossCents: row.grossCents,
      currency: row.currency ?? "usd"
    },
    pricing: {
      billingModel: row.billingModel ?? "free",
      unitAmountCents: row.unitAmountCents ?? 0,
      status: row.priceStatus ?? "draft"
    },
    feedback: {
      averageRating: row.averageRating,
      publishedCount: row.publishedFeedbackCount,
      pendingCount: row.pendingFeedbackCount
    },
    quality: {
      score: row.qualityScore === null ? null : Number(row.qualityScore),
      installSuccessRate: row.installSuccessRate === null ? successRate : Number(row.installSuccessRate),
      incidentCount: Number(row.incidentCount ?? row.runtimeFailedCount),
      checklist: buildChecklist({
        hasManifest: Boolean(row.manifest),
        hasReviewSignal: Boolean(row.reviewStatus) || row.verificationStatus === "verified",
        hasRuntimeHealth: runtimeHealth === "healthy",
        hasPricing: Boolean(row.priceId),
        hasUsage: row.callCount > 0
      })
    },
    updatedAt: row.updatedAt
  };
}

function buildChecklist(input: {
  hasManifest: boolean;
  hasReviewSignal: boolean;
  hasRuntimeHealth: boolean;
  hasPricing: boolean;
  hasUsage: boolean;
}) {
  return [
    {
      key: "manifest",
      label: "Manifest",
      status: input.hasManifest ? "complete" : "missing"
    },
    {
      key: "review",
      label: "Review signal",
      status: input.hasReviewSignal ? "complete" : "missing"
    },
    {
      key: "runtime",
      label: "Runtime health",
      status: input.hasRuntimeHealth ? "complete" : "needs_attention"
    },
    {
      key: "pricing",
      label: "Pricing",
      status: input.hasPricing ? "complete" : "missing"
    },
    {
      key: "usage",
      label: "Usage signal",
      status: input.hasUsage ? "complete" : "waiting"
    }
  ];
}
