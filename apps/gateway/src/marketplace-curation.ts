import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type MarketplacePlacement = "featured" | "standard" | "suppressed";

type CurationInput = {
  boost?: unknown;
  endsAt?: unknown;
  placement?: unknown;
  reason?: unknown;
};

export type AdminMarketplaceCurationRecord = {
  id: string | null;
  averageRating: number | null;
  boost: number;
  displayName: string;
  endsAt: string | null;
  feedbackCount: number;
  incidentCount: number;
  installCount: number;
  invocationCount: number;
  pendingFeedbackCount: number;
  placement: MarketplacePlacement;
  reason: string | null;
  skillId: string;
  skillSlug: string;
  successRate: number | null;
  updatedAt: string | null;
  verificationStatus: string;
  visibility: string;
};

const placements: MarketplacePlacement[] = ["featured", "standard", "suppressed"];

const fallbackCuration: AdminMarketplaceCurationRecord[] = [
  {
    id: "demo-curation-browser-research",
    averageRating: 4.8,
    boost: 120,
    displayName: "Browser Research",
    endsAt: null,
    feedbackCount: 24,
    incidentCount: 0,
    installCount: 12840,
    invocationCount: 96200,
    pendingFeedbackCount: 1,
    placement: "featured",
    reason: "Verified, high adoption, and strong published feedback.",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    successRate: 0.982,
    updatedAt: "demo",
    verificationStatus: "verified",
    visibility: "public"
  },
  {
    id: "demo-curation-dataset-summarizer",
    averageRating: 4.6,
    boost: 20,
    displayName: "Dataset Summarizer",
    endsAt: null,
    feedbackCount: 17,
    incidentCount: 1,
    installCount: 6920,
    invocationCount: 41800,
    pendingFeedbackCount: 0,
    placement: "standard",
    reason: "Useful data workflow, keep visible while reviewer checks retention wording.",
    skillId: "demo-skill-dataset-summarizer",
    skillSlug: "dataset-summarizer",
    successRate: 0.975,
    updatedAt: "demo",
    verificationStatus: "submitted",
    visibility: "public"
  },
  {
    id: "demo-curation-manifest-review",
    averageRating: 4.3,
    boost: -60,
    displayName: "Manifest Review",
    endsAt: null,
    feedbackCount: 9,
    incidentCount: 0,
    installCount: 1840,
    invocationCount: 11600,
    pendingFeedbackCount: 2,
    placement: "suppressed",
    reason: "Draft trust state should not outrank verified alternatives yet.",
    skillId: "demo-skill-manifest-review",
    skillSlug: "manifest-review",
    successRate: 0.946,
    updatedAt: "demo",
    verificationStatus: "draft",
    visibility: "public"
  }
];

export async function listAdminMarketplaceCuration(limit = 30) {
  const sql = await getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 30), 1), 100);

  if (!sql) {
    return fallbackCuration.slice(0, safeLimit);
  }

  try {
    return (await sql`
      select
        mcr.id::text,
        s.id::text as "skillId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        s.visibility,
        s.verification_status as "verificationStatus",
        coalesce(mcr.placement, 'standard') as placement,
        coalesce(mcr.boost, 0)::int as boost,
        mcr.reason,
        mcr.ends_at::text as "endsAt",
        mcr.updated_at::text as "updatedAt",
        coalesce(installs.install_count, 0)::int as "installCount",
        coalesce(invocations.invocation_count, 0)::int as "invocationCount",
        invocations.success_rate as "successRate",
        feedback.average_rating as "averageRating",
        coalesce(feedback.feedback_count, 0)::int as "feedbackCount",
        coalesce(pending_feedback.pending_count, 0)::int as "pendingFeedbackCount",
        coalesce(incidents.incident_count, 0)::int as "incidentCount"
      from skills s
      left join marketplace_curation_rules mcr on mcr.skill_id = s.id
      left join lateral (
        select count(*)::int as install_count
        from project_skill_installs
        where skill_id = s.id and status = 'installed'
      ) installs on true
      left join lateral (
        select
          count(*)::int as invocation_count,
          (count(*) filter (where status = 'success'))::float / nullif(count(*), 0) as success_rate
        from skill_invocations
        where skill_id = s.id
      ) invocations on true
      left join lateral (
        select
          round(avg(rating)::numeric, 1)::float as average_rating,
          count(*)::int as feedback_count
        from skill_feedback
        where skill_id = s.id and status = 'published'
      ) feedback on true
      left join lateral (
        select count(*)::int as pending_count
        from skill_feedback
        where skill_id = s.id and status = 'pending'
      ) pending_feedback on true
      left join lateral (
        select count(*)::int as incident_count
        from skill_incidents
        where skill_id = s.id and status in ('open', 'monitoring')
      ) incidents on true
      where s.visibility in ('public', 'unlisted')
      order by
        case coalesce(mcr.placement, 'standard')
          when 'featured' then 0
          when 'suppressed' then 2
          else 1
        end,
        coalesce(mcr.boost, 0) desc,
        case s.verification_status
          when 'verified' then 0
          when 'submitted' then 1
          when 'deprecated' then 2
          else 3
        end,
        s.updated_at desc
      limit ${safeLimit}
    `) as AdminMarketplaceCurationRecord[];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Marketplace curation data is unavailable: ${error.message}`
        : "Marketplace curation data is unavailable."
    );
  }
}

export async function upsertMarketplaceCuration(skillSlug: string, input: CurationInput, actorUserId: string | null | undefined) {
  const sql = await requireSql();
  const placement = normalizePlacement(input.placement);
  const boost = normalizeBoost(input.boost);
  const reason = normalizeReason(input.reason);
  const endsAt = normalizeEndsAt(input.endsAt);

  return sql.begin(async (tx: Sql) => {
    const skillRows = (await tx`
      select
        id::text,
        slug,
        display_name as "displayName",
        verification_status as "verificationStatus",
        visibility
      from skills
      where slug = ${skillSlug}
      limit 1
    `) as Array<{ id: string; slug: string; displayName: string; verificationStatus: string; visibility: string }>;
    const skill = skillRows[0];

    if (!skill) {
      throw new Error("Skill not found.");
    }

    if (placement === "featured" && !canFeatureSkill(skill)) {
      throw new Error("Only public skills with submitted or verified review status can be featured.");
    }

    const existingRows = (await tx`
      select
        id::text,
        placement,
        boost,
        reason,
        starts_at::text as "startsAt",
        ends_at::text as "endsAt",
        updated_at::text as "updatedAt"
      from marketplace_curation_rules
      where skill_id = ${skill.id}
      limit 1
    `) as Array<{
      id: string;
      boost: number;
      endsAt: string | null;
      placement: MarketplacePlacement;
      reason: string;
      startsAt: string;
      updatedAt: string;
    }>;
    const previous = existingRows[0] ?? null;

    const rows = (await tx`
      insert into marketplace_curation_rules (
        skill_id,
        placement,
        boost,
        reason,
        starts_at,
        ends_at,
        created_by_user_id,
        updated_by_user_id,
        updated_at
      )
      values (
        ${skill.id},
        ${placement},
        ${boost},
        ${reason},
        now(),
        ${endsAt},
        ${actorUserId ?? null},
        ${actorUserId ?? null},
        now()
      )
      on conflict (skill_id) do update set
        placement = excluded.placement,
        boost = excluded.boost,
        reason = excluded.reason,
        ends_at = excluded.ends_at,
        updated_by_user_id = excluded.updated_by_user_id,
        updated_at = now()
      returning
        id::text,
        skill_id::text as "skillId",
        placement,
        boost,
        reason,
        ends_at::text as "endsAt",
        updated_at::text as "updatedAt"
    `) as Array<{
      id: string;
      skillId: string;
      placement: MarketplacePlacement;
      boost: number;
      reason: string;
      endsAt: string | null;
      updatedAt: string;
    }>;
    const curation = rows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        'marketplace_curation.upserted',
        'marketplace_curation_rule',
        ${curation.id},
        ${reason},
        ${tx.json({
          next: {
            boost,
            endsAt,
            placement,
            reason
          },
          previous,
          skillSlug: skill.slug,
          visibility: skill.visibility,
          verificationStatus: skill.verificationStatus
        })}
      )
    `;
    await tx`
      insert into notification_events (event_type, channel, subject, payload, status)
      values (
        'marketplace.curation.updated',
        'in_app',
        'Marketplace curation updated',
        ${tx.json({
          boost,
          displayName: skill.displayName,
          endsAt,
          placement,
          skillSlug: skill.slug
        })},
        'queued'
      )
    `;

    return {
      ...curation,
      displayName: skill.displayName,
      skillSlug: skill.slug,
      visibility: skill.visibility,
      verificationStatus: skill.verificationStatus
    };
  });
}

function canFeatureSkill(skill: { verificationStatus: string; visibility: string }) {
  return skill.visibility === "public" && ["submitted", "verified"].includes(skill.verificationStatus);
}

function normalizePlacement(value: unknown): MarketplacePlacement {
  const placement = String(value ?? "standard").trim();

  if (!placements.includes(placement as MarketplacePlacement)) {
    throw new Error("Placement must be featured, standard, or suppressed.");
  }

  return placement as MarketplacePlacement;
}

function normalizeBoost(value: unknown) {
  const numeric = Number(value ?? 0);
  const normalized = Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
  return Math.min(Math.max(normalized, -250), 250);
}

function normalizeReason(value: unknown) {
  const reason = String(value ?? "").trim();

  if (!reason) {
    throw new Error("Curation reason is required.");
  }

  return reason.slice(0, 600);
}

function normalizeEndsAt(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Curation end date is invalid.");
  }

  if (date.getTime() <= Date.now()) {
    throw new Error("Curation end date must be in the future.");
  }

  return date.toISOString();
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for marketplace curation operations.");
  }

  return sql;
}
