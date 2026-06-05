import { getPermissionLevel, type SkillManifest, type SkillSummary } from "@useskillhub/schema";
import { listPublisherCurationAppealSummariesBySkill, type PublisherCurationAppealSummary } from "./marketplace-curation-appeals.js";
import { CURRENT_PUBLISHER_TERMS_VERSION } from "./publisher-terms.js";
import { getSql, searchSkills } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type RuntimeCheckSummary = {
  checkType: string;
  status: string;
  message: string | null;
  latencyMs: number | null;
  checkedAt: string | null;
  createdAt: string | null;
};

type MarketplacePlacement = "featured" | "standard" | "suppressed";
type MarketplaceImprovementSeverity = "critical" | "positive" | "warning";

type MarketplaceImprovementHint = {
  key: string;
  severity: MarketplaceImprovementSeverity;
};

type CommercialBlocker = "current_terms" | "payout" | "publisher_profile" | "publisher_status" | "review" | "terms";

type PublisherSkillVersionSummary = {
  callCount: number;
  createdAt: string;
  id: string;
  installCount: number;
  manifest: SkillManifest;
  reviewDecidedAt: string | null;
  reviewNotes: string | null;
  reviewRiskLevel: SkillSummary["permissionLevel"] | null;
  reviewStatus: string | null;
  runtimeCheckCount: number;
  runtimeChecks: RuntimeCheckSummary[];
  runtimeFailedCount: number;
  runtimePassedCount: number;
  runtimeWarningCount: number;
  status: "draft" | "submitted" | "verified" | "rejected" | "suspended";
  version: string;
};

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
  runtimeIncompleteCount: number;
  runtimeChecks: RuntimeCheckSummary[] | null;
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
  publisherProfileId: string | null;
  publisherStatus: "pending" | "active" | "restricted" | "suspended" | null;
  publisherPayoutStatus: "not_configured" | "verification_required" | "verified" | "blocked" | null;
  publisherTermsAcceptedAt: string | null;
  publisherTermsVersion: string | null;
  averageRating: number | null;
  publishedFeedbackCount: number;
  pendingFeedbackCount: number;
  qualityScore: string | number | null;
  installSuccessRate: string | number | null;
  incidentCount: number | null;
  openIncidentCount: number;
  marketplacePlacement: MarketplacePlacement | null;
  marketplaceReason: string | null;
  marketplaceEndsAt: string | null;
  marketplaceUpdatedAt: string | null;
  versions: PublisherSkillVersionSummary[] | null;
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
      coalesce(checks.incomplete_count, 0)::int as "runtimeIncompleteCount",
      coalesce(checks.items, '[]'::jsonb) as "runtimeChecks",
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
      pp.id::text as "publisherProfileId",
      pp.status as "publisherStatus",
      pp.payout_status as "publisherPayoutStatus",
      pp.terms_accepted_at::text as "publisherTermsAcceptedAt",
      pp.terms_version as "publisherTermsVersion",
      feedback.average_rating as "averageRating",
      coalesce(feedback.published_count, 0)::int as "publishedFeedbackCount",
      coalesce(feedback.pending_count, 0)::int as "pendingFeedbackCount",
      pqs.score as "qualityScore",
      pqs.install_success_rate as "installSuccessRate",
      pqs.incident_count as "incidentCount",
      coalesce(open_incidents.incident_count, 0)::int as "openIncidentCount",
      active_curation.placement as "marketplacePlacement",
      active_curation.reason as "marketplaceReason",
      active_curation.ends_at::text as "marketplaceEndsAt",
      active_curation.updated_at::text as "marketplaceUpdatedAt",
      coalesce(versions.items, '[]'::jsonb) as "versions"
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
      with latest_checks as (
        select distinct on (check_type)
          check_type,
          status,
          message,
          latency_ms,
          checked_at,
          created_at
        from skill_runtime_checks
        where skill_version_id = latest.id
        order by check_type, created_at desc
      )
      select
        count(*) as total_count,
        count(*) filter (where status = 'passed') as passed_count,
        count(*) filter (where status = 'failed') as failed_count,
        count(*) filter (where status = 'warning') as warning_count,
        count(*) filter (where status in ('queued', 'running')) as incomplete_count,
        jsonb_agg(
          jsonb_build_object(
            'checkType', check_type,
            'status', status,
            'message', message,
            'latencyMs', latency_ms,
            'checkedAt', checked_at,
            'createdAt', created_at
          )
          order by check_type
        ) as items
      from latest_checks
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
    left join lateral (
      select count(*)::int as incident_count
      from skill_incidents
      where skill_id = s.id
        and status in ('open', 'monitoring')
    ) open_incidents on true
    left join lateral (
      select placement, reason, ends_at, updated_at
      from marketplace_curation_rules
      where skill_id = s.id
        and starts_at <= now()
        and (ends_at is null or ends_at > now())
      order by updated_at desc
      limit 1
    ) active_curation on true
    left join lateral (
      select jsonb_agg(
        jsonb_build_object(
          'callCount', version_items.call_count,
          'createdAt', version_items.created_at,
          'id', version_items.id,
          'installCount', version_items.install_count,
          'manifest', version_items.manifest,
          'reviewDecidedAt', version_items.review_decided_at,
          'reviewNotes', version_items.review_notes,
          'reviewRiskLevel', version_items.review_risk_level,
          'reviewStatus', version_items.review_status,
          'runtimeCheckCount', version_items.runtime_check_count,
          'runtimeChecks', version_items.runtime_checks,
          'runtimeFailedCount', version_items.runtime_failed_count,
          'runtimePassedCount', version_items.runtime_passed_count,
          'runtimeWarningCount', version_items.runtime_warning_count,
          'status', version_items.version_status,
          'version', version_items.version
        )
        order by version_items.created_at desc
      ) as items
      from (
        select
          sv.id::text,
          sv.version,
          sv.manifest,
          sv.created_at::text as created_at,
          review.status as review_status,
          review.risk_level as review_risk_level,
          review.notes as review_notes,
          review.decided_at::text as review_decided_at,
          case
            when review.status = 'approved' then 'verified'
            when review.status in ('queued', 'in_review') then 'submitted'
            when review.status = 'rejected' then 'rejected'
            when review.status = 'blocked' then 'suspended'
            else 'draft'
          end as version_status,
          coalesce(checks.total_count, 0)::int as runtime_check_count,
          coalesce(checks.passed_count, 0)::int as runtime_passed_count,
          coalesce(checks.failed_count, 0)::int as runtime_failed_count,
          coalesce(checks.warning_count, 0)::int as runtime_warning_count,
          coalesce(checks.items, '[]'::jsonb) as runtime_checks,
          coalesce(installs.install_count, 0)::int as install_count,
          coalesce(invocations.call_count, 0)::int as call_count
        from skill_versions sv
        left join lateral (
          select status, risk_level, notes, decided_at, created_at
          from skill_reviews
          where skill_version_id = sv.id
          order by created_at desc
          limit 1
        ) review on true
        left join lateral (
          with latest_checks as (
            select distinct on (check_type)
              check_type,
              status,
              message,
              latency_ms,
              checked_at,
              created_at
            from skill_runtime_checks
            where skill_version_id = sv.id
            order by check_type, created_at desc
          )
          select
            count(*) as total_count,
            count(*) filter (where status = 'passed') as passed_count,
            count(*) filter (where status = 'failed') as failed_count,
            count(*) filter (where status = 'warning') as warning_count,
            jsonb_agg(
              jsonb_build_object(
                'checkType', check_type,
                'status', status,
                'message', message,
                'latencyMs', latency_ms,
                'checkedAt', checked_at,
                'createdAt', created_at
              )
              order by check_type
            ) as items
          from latest_checks
        ) checks on true
        left join lateral (
          select count(*) as install_count
          from project_skill_installs
          where skill_version_id = sv.id
            and status = 'installed'
        ) installs on true
        left join lateral (
          select count(*) as call_count
          from skill_invocations
          where skill_version_id = sv.id
        ) invocations on true
        where sv.skill_id = s.id
        order by sv.created_at desc
        limit 8
      ) version_items
    ) versions on true
    where (${scopedOrganizationId}::uuid is null or s.organization_id = ${scopedOrganizationId})
    order by s.updated_at desc
    limit ${safeLimit}
  `) as PublisherSkillRow[];

  const appealBySkillId = await listPublisherCurationAppealSummariesBySkill(scopedOrganizationId);

  return rows.map((row) => mapPublisherSkill(row, appealBySkillId.get(row.id) ?? null));
}

async function fallbackPublisherSkills(limit: number) {
  const skills = await searchSkills({ limit });

  return skills.map((skill, index) => {
    const calls = index === 0 ? 18400 : index === 1 ? 9200 : 0;
    const successCount = Math.floor(calls * 0.96);
    const errorCount = Math.max(calls - successCount, 0);
    const runtimeFailedCount = skill.verificationStatus === "verified" ? 0 : 1;
    const runtimeChecks = runtimeCheckSummaries(runtimeFailedCount);

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
        checkCount: runtimeChecks.length,
        passedCount: runtimeChecks.filter((check) => check.status === "passed").length,
        failedCount: runtimeFailedCount,
        warningCount: runtimeChecks.filter((check) => check.status === "warning").length,
        health: runtimeFailedCount ? "needs_attention" : "healthy",
        checks: runtimeChecks
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
      commercial: {
        blockers: index === 0 ? [] : (["review", "payout", "terms"] as CommercialBlocker[]),
        paidActivationReady: index === 0,
        payoutStatus: index === 0 ? "verified" : "verification_required",
        publisherStatus: "active",
        requiresTermsVersion: CURRENT_PUBLISHER_TERMS_VERSION,
        termsAcceptedAt: index === 0 ? "demo" : null,
        termsVersion: index === 0 ? CURRENT_PUBLISHER_TERMS_VERSION : null
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
      marketplace: {
        placement: index === 0 ? "featured" : "standard",
        reason:
          index === 0
            ? "Verified, healthy runtime, and strong published feedback."
            : "Keep improving runtime checks before featured placement.",
        endsAt: null,
        updatedAt: "demo",
        appeal:
          index === 1
            ? {
                appealReason: "Runtime check evidence was updated and the publisher requested standard placement.",
                createdAt: "demo",
                currentPlacement: "suppressed" as const,
                decidedAt: null,
                id: "demo-curation-appeal-dataset-summarizer",
                operatorReason: null,
                requestType: "suppression_appeal" as const,
                requestedPlacement: "standard" as const,
                skillId: skill.id,
                slaDueAt: "demo",
                status: "open" as const
              }
            : null,
        improvementHints:
          index === 0
            ? [{ key: "maintain_quality", severity: "positive" as const }]
            : [
                { key: "fix_runtime_checks", severity: "critical" as const },
                { key: "collect_feedback", severity: "warning" as const }
              ]
      },
      versions: [
        {
          callCount: calls,
          createdAt: "demo",
          id: `${skill.id}-${skill.version}`,
          installCount: index === 0 ? 46 : 12,
          manifest: fallbackManifestForSummary(skill),
          reviewDecidedAt: skill.verificationStatus === "verified" ? "demo" : null,
          reviewNotes: skill.verificationStatus === "verified" ? "Demo listing approved." : "Needs operator review.",
          reviewRiskLevel: skill.permissionLevel,
          reviewStatus: skill.verificationStatus === "verified" ? "approved" : "queued",
          runtimeCheckCount: runtimeChecks.length,
          runtimeChecks,
          runtimeFailedCount,
          runtimePassedCount: runtimeChecks.filter((check) => check.status === "passed").length,
          runtimeWarningCount: runtimeChecks.filter((check) => check.status === "warning").length,
          status: skill.verificationStatus === "verified" ? ("verified" as const) : ("submitted" as const),
          version: skill.version
        }
      ],
      updatedAt: "demo"
    };
  });
}

export async function listPublisherSkillVersions(
  organizationId: string | null | undefined,
  skillSlug: string,
  limit = 20
): Promise<PublisherSkillVersionSummary[]> {
  const sql = await getSql();

  if (!sql) {
    const fallback = await fallbackPublisherSkills(limit);
    return fallback.find((skill) => skill.slug === skillSlug)?.versions ?? [];
  }

  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    select
      sv.id::text,
      sv.version,
      sv.manifest,
      sv.created_at::text as "createdAt",
      review.status as "reviewStatus",
      review.risk_level as "reviewRiskLevel",
      review.notes as "reviewNotes",
      review.decided_at::text as "reviewDecidedAt",
      coalesce(checks.total_count, 0)::int as "runtimeCheckCount",
      coalesce(checks.passed_count, 0)::int as "runtimePassedCount",
      coalesce(checks.failed_count, 0)::int as "runtimeFailedCount",
      coalesce(checks.warning_count, 0)::int as "runtimeWarningCount",
      coalesce(checks.items, '[]'::jsonb) as "runtimeChecks",
      coalesce(installs.install_count, 0)::int as "installCount",
      coalesce(invocations.call_count, 0)::int as "callCount"
    from skills s
    join skill_versions sv on sv.skill_id = s.id
    left join lateral (
      select status, risk_level, notes, decided_at, created_at
      from skill_reviews
      where skill_version_id = sv.id
      order by created_at desc
      limit 1
    ) review on true
    left join lateral (
      with latest_checks as (
        select distinct on (check_type)
          check_type,
          status,
          message,
          latency_ms,
          checked_at,
          created_at
        from skill_runtime_checks
        where skill_version_id = sv.id
        order by check_type, created_at desc
      )
      select
        count(*) as total_count,
        count(*) filter (where status = 'passed') as passed_count,
        count(*) filter (where status = 'failed') as failed_count,
        count(*) filter (where status = 'warning') as warning_count,
        jsonb_agg(
          jsonb_build_object(
            'checkType', check_type,
            'status', status,
            'message', message,
            'latencyMs', latency_ms,
            'checkedAt', checked_at,
            'createdAt', created_at
          )
          order by check_type
        ) as items
      from latest_checks
    ) checks on true
    left join lateral (
      select count(*) as install_count
      from project_skill_installs
      where skill_version_id = sv.id
        and status = 'installed'
    ) installs on true
    left join lateral (
      select count(*) as call_count
      from skill_invocations
      where skill_version_id = sv.id
    ) invocations on true
    where s.slug = ${skillSlug}
      and (${scopedOrganizationId}::uuid is null or s.organization_id = ${scopedOrganizationId})
    order by sv.created_at desc
    limit ${safeLimit}
  `) as Array<Partial<PublisherSkillVersionSummary>>;

  return normalizeVersionSummaries(rows);
}

function mapPublisherSkill(row: PublisherSkillRow, appeal: PublisherCurationAppealSummary | null) {
  const permissionLevel = row.manifest?.permissions ? getPermissionLevel(row.manifest.permissions) : "medium";
  const successRate = row.callCount > 0 ? row.successCount / row.callCount : null;
  const runtimeChecks = normalizeRuntimeChecks(row.runtimeChecks);
  const runtimeHealth =
    row.runtimeFailedCount > 0
      ? "needs_attention"
      : row.runtimeWarningCount > 0 || row.runtimeIncompleteCount > 0
        ? "warning"
        : row.runtimeCheckCount > 0
          ? "healthy"
          : "not_checked";
  const incidentCount = Number(row.incidentCount ?? row.openIncidentCount ?? row.runtimeFailedCount);
  const marketplacePlacement = row.marketplacePlacement ?? "standard";
  const commercialBlockers = buildCommercialBlockers(row);

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
      health: runtimeHealth,
      checks: runtimeChecks
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
    commercial: {
      blockers: commercialBlockers,
      paidActivationReady: commercialBlockers.length === 0,
      payoutStatus: row.publisherPayoutStatus,
      publisherStatus: row.publisherStatus,
      requiresTermsVersion: CURRENT_PUBLISHER_TERMS_VERSION,
      termsAcceptedAt: row.publisherTermsAcceptedAt,
      termsVersion: row.publisherTermsVersion
    },
    feedback: {
      averageRating: row.averageRating,
      publishedCount: row.publishedFeedbackCount,
      pendingCount: row.pendingFeedbackCount
    },
    quality: {
      score: row.qualityScore === null ? null : Number(row.qualityScore),
      installSuccessRate: row.installSuccessRate === null ? successRate : Number(row.installSuccessRate),
      incidentCount,
      checklist: buildChecklist({
        hasManifest: Boolean(row.manifest),
        hasReviewSignal: Boolean(row.reviewStatus) || row.verificationStatus === "verified",
        hasRuntimeHealth: runtimeHealth === "healthy",
        hasPricing: Boolean(row.priceId),
        hasUsage: row.callCount > 0
      })
    },
    marketplace: {
      placement: marketplacePlacement,
      reason: row.marketplaceReason,
      endsAt: row.marketplaceEndsAt,
      updatedAt: row.marketplaceUpdatedAt,
      appeal,
      improvementHints: buildMarketplaceHints({
        callCount: row.callCount,
        incidentCount,
        marketplacePlacement,
        pendingFeedbackCount: row.pendingFeedbackCount,
        publishedFeedbackCount: row.publishedFeedbackCount,
        runtimeHealth,
        successRate,
        verificationStatus: row.verificationStatus,
        visibility: row.visibility
      })
    },
    versions: normalizeVersionSummaries(row.versions),
    updatedAt: row.updatedAt
  };
}

function buildCommercialBlockers(row: PublisherSkillRow): CommercialBlocker[] {
  const blockers: CommercialBlocker[] = [];

  if (!row.publisherProfileId) {
    blockers.push("publisher_profile");
  }

  if (row.publisherProfileId && row.publisherStatus !== "active") {
    blockers.push("publisher_status");
  }

  if (row.publisherPayoutStatus !== "verified") {
    blockers.push("payout");
  }

  if (!row.publisherTermsAcceptedAt) {
    blockers.push("terms");
  } else if (row.publisherTermsVersion !== CURRENT_PUBLISHER_TERMS_VERSION) {
    blockers.push("current_terms");
  }

  if (row.verificationStatus !== "verified") {
    blockers.push("review");
  }

  return blockers;
}

function normalizeVersionSummaries(value: Array<Partial<PublisherSkillVersionSummary>> | null): PublisherSkillVersionSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((version) => {
    const reviewStatus = typeof version.reviewStatus === "string" ? version.reviewStatus : null;

    return {
      callCount: Number(version.callCount ?? 0),
      createdAt: String(version.createdAt ?? "demo"),
      id: String(version.id ?? version.version ?? "version"),
      installCount: Number(version.installCount ?? 0),
      manifest: isSkillManifestLike(version.manifest) ? version.manifest : fallbackManifestForVersion(String(version.version ?? "0.1.0")),
      reviewDecidedAt: version.reviewDecidedAt ?? null,
      reviewNotes: version.reviewNotes ?? null,
      reviewRiskLevel: version.reviewRiskLevel ?? null,
      reviewStatus,
      runtimeCheckCount: Number(version.runtimeCheckCount ?? 0),
      runtimeChecks: normalizeRuntimeChecks(version.runtimeChecks ?? null),
      runtimeFailedCount: Number(version.runtimeFailedCount ?? 0),
      runtimePassedCount: Number(version.runtimePassedCount ?? 0),
      runtimeWarningCount: Number(version.runtimeWarningCount ?? 0),
      status: deriveVersionStatus(reviewStatus),
      version: String(version.version ?? "0.1.0")
    };
  });
}

function normalizeRuntimeChecks(value: RuntimeCheckSummary[] | null): RuntimeCheckSummary[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((check) => ({
    checkType: String(check.checkType ?? "unknown"),
    status: String(check.status ?? "queued"),
    message: check.message ?? null,
    latencyMs: typeof check.latencyMs === "number" ? check.latencyMs : null,
    checkedAt: check.checkedAt ?? null,
    createdAt: check.createdAt ?? null
  }));
}

function deriveVersionStatus(reviewStatus: string | null): PublisherSkillVersionSummary["status"] {
  if (reviewStatus === "approved") {
    return "verified";
  }

  if (reviewStatus === "queued" || reviewStatus === "in_review") {
    return "submitted";
  }

  if (reviewStatus === "rejected") {
    return "rejected";
  }

  if (reviewStatus === "blocked") {
    return "suspended";
  }

  return "draft";
}

function isSkillManifestLike(value: unknown): value is SkillManifest {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "name" in value && "version" in value);
}

function fallbackManifestForSummary(skill: SkillSummary): SkillManifest {
  return {
    schemaVersion: "0.1",
    name: skill.slug,
    displayName: skill.displayName,
    version: skill.version,
    description: skill.description,
    tags: skill.tags,
    runtime:
      skill.runtimeType === "mcp"
        ? { type: "mcp", serverUrl: "https://api.useskillhub.com/demo/mcp" }
        : skill.runtimeType === "local"
          ? { type: "local", command: "skillhub-demo" }
          : { type: "http", entrypoint: "https://api.useskillhub.com/demo/runtime" },
    permissions: {
      browser: skill.permissionLevel === "medium",
      filesystem: skill.permissionLevel === "high" ? "write" : "none",
      network: skill.permissionLevel !== "low",
      secrets: []
    },
    inputSchema: {
      properties: {},
      type: "object"
    },
    outputSchema: {
      properties: {},
      type: "object"
    }
  };
}

function fallbackManifestForVersion(version: string): SkillManifest {
  return {
    ...fallbackManifestForSummary({
      description: "Draft SkillHub skill version.",
      displayName: "Draft skill",
      id: "draft-skill",
      permissionLevel: "low",
      slug: "draft-skill",
      tags: ["draft"],
      verificationStatus: "draft",
      version
    }),
    version
  };
}

function runtimeCheckSummaries(failedCount: number): RuntimeCheckSummary[] {
  const hasFailure = failedCount > 0;

  return [
    {
      checkType: "manifest",
      status: "passed",
      message: "Manifest contract includes required fields.",
      latencyMs: null,
      checkedAt: "demo",
      createdAt: "demo"
    },
    {
      checkType: "runtime",
      status: hasFailure ? "failed" : "passed",
      message: hasFailure ? "Runtime declaration needs a reachable secure endpoint." : "Runtime declaration is ready for review.",
      latencyMs: hasFailure ? null : 120,
      checkedAt: "demo",
      createdAt: "demo"
    },
    {
      checkType: "example",
      status: hasFailure ? "warning" : "passed",
      message: hasFailure ? "Example schemas should include concrete fields before approval." : "Example schemas are ready for invocation review.",
      latencyMs: null,
      checkedAt: "demo",
      createdAt: "demo"
    },
    {
      checkType: "security",
      status: "passed",
      message: "Permission profile is compatible with review gates.",
      latencyMs: null,
      checkedAt: "demo",
      createdAt: "demo"
    }
  ];
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

function buildMarketplaceHints(input: {
  callCount: number;
  incidentCount: number;
  marketplacePlacement: MarketplacePlacement;
  pendingFeedbackCount: number;
  publishedFeedbackCount: number;
  runtimeHealth: "healthy" | "warning" | "needs_attention" | "not_checked";
  successRate: number | null;
  verificationStatus: string;
  visibility: string;
}): MarketplaceImprovementHint[] {
  const hints: MarketplaceImprovementHint[] = [];

  if (input.marketplacePlacement === "featured") {
    hints.push({ key: "maintain_quality", severity: "positive" });
  }

  if (input.visibility !== "public") {
    hints.push({ key: "make_public", severity: "warning" });
  }

  if (!["submitted", "verified"].includes(input.verificationStatus)) {
    hints.push({ key: "submit_review", severity: "warning" });
  }

  if (input.runtimeHealth === "needs_attention") {
    hints.push({ key: "fix_runtime_checks", severity: "critical" });
  } else if (input.runtimeHealth === "warning" || input.runtimeHealth === "not_checked") {
    hints.push({ key: "stabilize_runtime", severity: "warning" });
  }

  if (input.incidentCount > 0) {
    hints.push({ key: "resolve_incidents", severity: "critical" });
  }

  if (input.successRate !== null && input.successRate < 0.95) {
    hints.push({ key: "raise_success_rate", severity: "warning" });
  }

  if (input.pendingFeedbackCount > 0) {
    hints.push({ key: "moderate_feedback", severity: "warning" });
  }

  if (input.publishedFeedbackCount === 0) {
    hints.push({ key: "collect_feedback", severity: "warning" });
  }

  if (input.callCount === 0) {
    hints.push({ key: "drive_first_installs", severity: "warning" });
  }

  if (hints.length === 0) {
    hints.push({ key: "eligible_for_distribution", severity: "positive" });
  }

  return hints.slice(0, 5);
}
