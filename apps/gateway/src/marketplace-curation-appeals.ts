import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type MarketplacePlacement = "featured" | "standard" | "suppressed";
type CurationAppealStatus = "approved" | "closed" | "open" | "rejected" | "under_review";
type CurationAppealRequestType = "featured_request" | "placement_review" | "suppression_appeal";
type CurationAppealDecisionAction = "approve" | "close" | "reject" | "review";

type CreateCurationAppealInput = {
  appealReason?: unknown;
  evidenceUrl?: unknown;
  requestedPlacement?: unknown;
};

type CurationAppealDecisionInput = {
  action?: unknown;
  boost?: unknown;
  endsAt?: unknown;
  placement?: unknown;
  reason?: unknown;
};

type SkillForAppeal = {
  id: string;
  organizationId: string;
  slug: string;
  displayName: string;
  verificationStatus: string;
  visibility: string;
};

type CurationForAppeal = {
  id: string | null;
  boost: number;
  endsAt: string | null;
  placement: MarketplacePlacement;
  reason: string | null;
};

type AppealForDecision = SkillForAppeal & {
  appealId: string;
  appealStatus: CurationAppealStatus;
  currentPlacement: MarketplacePlacement;
  requestedPlacement: "featured" | "standard";
};

export type MarketplaceCurationAppealRecord = {
  id: string;
  appealReason: string;
  callCount: number;
  createdAt: string;
  createdByDisplayName: string | null;
  createdByEmail: string | null;
  currentCurationReason: string | null;
  currentPlacement: MarketplacePlacement;
  decidedAt: string | null;
  decidedByDisplayName: string | null;
  decidedByEmail: string | null;
  evidenceUrl: string | null;
  feedbackCount: number;
  incidentCount: number;
  installCount: number;
  operatorReason: string | null;
  publisherOrganizationId: string;
  publisherOrganizationName: string;
  requestType: CurationAppealRequestType;
  requestedPlacement: "featured" | "standard";
  skillId: string;
  skillName: string;
  skillSlug: string;
  slaDueAt: string;
  status: CurationAppealStatus;
  successRate: number | null;
  updatedAt: string;
  verificationStatus: string;
  visibility: string;
};

export type PublisherCurationAppealSummary = {
  id: string;
  appealReason: string;
  createdAt: string;
  currentPlacement: MarketplacePlacement;
  decidedAt: string | null;
  operatorReason: string | null;
  requestType: CurationAppealRequestType;
  requestedPlacement: "featured" | "standard";
  skillId: string;
  slaDueAt: string;
  status: CurationAppealStatus;
};

const placements: MarketplacePlacement[] = ["featured", "standard", "suppressed"];
const requestPlacements = ["featured", "standard"] as const;
const decisionActions: CurationAppealDecisionAction[] = ["approve", "close", "reject", "review"];

const fallbackAppeals: MarketplaceCurationAppealRecord[] = [
  {
    id: "demo-curation-appeal-dataset-summarizer",
    appealReason: "Runtime endpoint was fixed and the publisher wants the listing restored to standard discovery.",
    callCount: 9200,
    createdAt: "demo",
    createdByDisplayName: "Skill Author",
    createdByEmail: "publisher@example.com",
    currentCurationReason: "Runtime check failed during the last review window.",
    currentPlacement: "suppressed",
    decidedAt: null,
    decidedByDisplayName: null,
    decidedByEmail: null,
    evidenceUrl: "https://example.com/runtime-checks/dataset-summarizer",
    feedbackCount: 5,
    incidentCount: 0,
    installCount: 12,
    operatorReason: null,
    publisherOrganizationId: "demo-publisher-org",
    publisherOrganizationName: "SkillHub Demo Publisher",
    requestType: "suppression_appeal",
    requestedPlacement: "standard",
    skillId: "demo-skill-dataset-summarizer",
    skillName: "Dataset Summarizer",
    skillSlug: "dataset-summarizer",
    slaDueAt: "demo",
    status: "open",
    successRate: 0.96,
    updatedAt: "demo",
    verificationStatus: "submitted",
    visibility: "public"
  }
];

export async function listAdminMarketplaceCurationAppeals(limit = 50, status?: string) {
  const sql = await getSql();

  if (!sql) {
    return fallbackAppeals.slice(0, normalizeLimit(limit, 100));
  }

  try {
    return listAppealRows(sql, {
      limit,
      status: normalizeOptionalStatus(status)
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Marketplace curation appeal data is unavailable: ${error.message}`
        : "Marketplace curation appeal data is unavailable."
    );
  }
}

export async function listPublisherMarketplaceCurationAppeals(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackAppeals.slice(0, normalizeLimit(limit, 100));
  }

  if (!organizationId) {
    return [];
  }

  try {
    return listAppealRows(sql, {
      limit,
      publisherOrganizationId: organizationId
    });
  } catch (error) {
    if (isMissingAppealTable(error)) {
      return [];
    }

    throw error;
  }
}

export async function listPublisherCurationAppealSummariesBySkill(organizationId: string | null | undefined) {
  const sql = await getSql();
  const appealBySkillId = new Map<string, PublisherCurationAppealSummary>();

  if (!sql || !organizationId) {
    return appealBySkillId;
  }

  try {
    const rows = (await sql`
      select distinct on (mca.skill_id)
        mca.id::text,
        mca.skill_id::text as "skillId",
        mca.status,
        mca.request_type as "requestType",
        mca.current_placement as "currentPlacement",
        mca.requested_placement as "requestedPlacement",
        mca.appeal_reason as "appealReason",
        mca.operator_reason as "operatorReason",
        mca.sla_due_at::text as "slaDueAt",
        mca.decided_at::text as "decidedAt",
        mca.created_at::text as "createdAt"
      from marketplace_curation_appeals mca
      where mca.publisher_organization_id = ${organizationId}
      order by
        mca.skill_id,
        case mca.status
          when 'open' then 0
          when 'under_review' then 1
          when 'approved' then 2
          when 'rejected' then 3
          else 4
        end,
        mca.created_at desc
    `) as PublisherCurationAppealSummary[];

    rows.forEach((row) => {
      appealBySkillId.set(row.skillId, row);
    });
  } catch (error) {
    if (!isMissingAppealTable(error)) {
      throw error;
    }
  }

  return appealBySkillId;
}

export async function createPublisherMarketplaceCurationAppeal(
  skillSlug: string,
  input: CreateCurationAppealInput,
  context: {
    actorUserId?: string | null;
    organizationId: string;
  }
) {
  const sql = await requireSql();
  const requestedPlacement = normalizeRequestedPlacement(input.requestedPlacement);
  const appealReason = normalizeText(input.appealReason, "appeal reason", 1800);
  const evidenceUrl = normalizeEvidenceUrl(input.evidenceUrl);

  return sql.begin(async (tx: Sql) => {
    const skill = await getOwnedSkill(tx, skillSlug, context.organizationId);
    const curation = await getActiveCuration(tx, skill.id);
    const currentPlacement = curation.placement;

    if (currentPlacement === "featured" && requestedPlacement === "featured") {
      throw new Error("This skill is already featured.");
    }

    if (currentPlacement === "standard" && requestedPlacement === "standard") {
      throw new Error("This skill is already in standard marketplace distribution.");
    }

    const existingRows = (await tx`
      select id::text
      from marketplace_curation_appeals
      where skill_id = ${skill.id}
        and status in ('open', 'under_review')
      limit 1
    `) as Array<{ id: string }>;

    if (existingRows[0]) {
      throw new Error("This skill already has an open marketplace distribution review request.");
    }

    const requestType = requestTypeFor(currentPlacement, requestedPlacement);
    const rows = (await tx`
      insert into marketplace_curation_appeals (
        skill_id,
        publisher_organization_id,
        curation_rule_id,
        request_type,
        current_placement,
        requested_placement,
        current_curation_reason,
        appeal_reason,
        evidence_url,
        created_by_user_id
      )
      values (
        ${skill.id},
        ${context.organizationId},
        ${curation.id},
        ${requestType},
        ${currentPlacement},
        ${requestedPlacement},
        ${curation.reason},
        ${appealReason},
        ${evidenceUrl},
        ${context.actorUserId ?? null}
      )
      returning id::text
    `) as Array<{ id: string }>;
    const appealId = rows[0].id;

    await recordAppealAudit(tx, context.actorUserId, "marketplace_curation_appeal.created", appealId, appealReason, {
      currentPlacement,
      requestedPlacement,
      requestType,
      skillSlug: skill.slug
    });
    await recordAppealNotification(tx, null, "marketplace.curation.appeal_created", "Marketplace distribution appeal created", {
      appealId,
      currentPlacement,
      requestedPlacement,
      skillName: skill.displayName,
      skillSlug: skill.slug
    });
    await recordAppealNotification(tx, context.organizationId, "marketplace.curation.appeal_created", "Marketplace distribution appeal created", {
      appealId,
      currentPlacement,
      requestedPlacement,
      skillName: skill.displayName,
      skillSlug: skill.slug
    });

    const appeals = await listAppealRows(tx, {
      appealId,
      limit: 1
    });
    return appeals[0];
  });
}

export async function decideMarketplaceCurationAppeal(
  appealId: string,
  input: CurationAppealDecisionInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const action = normalizeDecisionAction(input.action);
  const reason = normalizeText(input.reason, "reason", 1600);
  const status = statusForDecision(action);

  return sql.begin(async (tx: Sql) => {
    const appeal = await getAppealForDecision(tx, appealId);

    if (["approved", "closed", "rejected"].includes(appeal.appealStatus)) {
      throw new Error("This marketplace distribution appeal has already been decided.");
    }

    let curationId: string | null = null;

    if (action === "approve") {
      const curation = await getActiveCuration(tx, appeal.id);
      const placement = normalizeDecisionPlacement(input.placement, appeal.requestedPlacement);
      const boost = normalizeBoost(input.boost, defaultBoostForApproval(placement, curation.boost));
      const endsAt = normalizeEndsAt(input.endsAt);
      const curationReason = `Appeal approved: ${reason}`.slice(0, 600);

      if (placement === "featured" && !canFeatureSkill(appeal)) {
        throw new Error("Only public verified skills can be featured.");
      }

      const curationRows = (await tx`
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
          ${appeal.id},
          ${placement},
          ${boost},
          ${curationReason},
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
        returning id::text
      `) as Array<{ id: string }>;
      curationId = curationRows[0].id;

      await recordAppealAudit(
        tx,
        actorUserId,
        "marketplace_curation.upserted_from_appeal",
        curationId,
        curationReason,
        {
          appealId,
          boost,
          endsAt,
          placement,
          previousPlacement: curation.placement,
          requestedPlacement: appeal.requestedPlacement,
          skillSlug: appeal.slug
        },
        "marketplace_curation_rule"
      );
    }

    await tx`
      update marketplace_curation_appeals
      set
        status = ${status},
        operator_reason = ${reason},
        curation_rule_id = coalesce(${curationId}, curation_rule_id),
        decided_by_user_id = case when ${status} in ('approved', 'rejected', 'closed') then ${actorUserId ?? null} else decided_by_user_id end,
        decided_at = case when ${status} in ('approved', 'rejected', 'closed') then now() else decided_at end,
        updated_at = now()
      where id = ${appealId}
    `;

    await recordAppealAudit(tx, actorUserId, `marketplace_curation_appeal.${action}`, appealId, reason, {
      action,
      curationRuleId: curationId,
      previousStatus: appeal.appealStatus,
      requestedPlacement: appeal.requestedPlacement,
      skillSlug: appeal.slug,
      status
    });
    await recordAppealNotification(tx, appeal.organizationId, `marketplace.curation.appeal_${status}`, "Marketplace distribution appeal updated", {
      action,
      appealId,
      requestedPlacement: appeal.requestedPlacement,
      skillName: appeal.displayName,
      skillSlug: appeal.slug,
      status
    });

    const appeals = await listAppealRows(tx, {
      appealId,
      limit: 1
    });
    return appeals[0];
  });
}

async function listAppealRows(
  sql: Sql,
  options: {
    appealId?: string;
    limit: number;
    publisherOrganizationId?: string;
    status?: CurationAppealStatus;
  }
) {
  const appealId = options.appealId ?? null;
  const publisherOrganizationId = options.publisherOrganizationId ?? null;
  const status = options.status ?? null;

  return (await sql`
    select
      mca.id::text,
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      s.visibility,
      s.verification_status as "verificationStatus",
      o.id::text as "publisherOrganizationId",
      o.name as "publisherOrganizationName",
      mca.status,
      mca.request_type as "requestType",
      mca.current_placement as "currentPlacement",
      mca.requested_placement as "requestedPlacement",
      mca.current_curation_reason as "currentCurationReason",
      mca.appeal_reason as "appealReason",
      mca.evidence_url as "evidenceUrl",
      mca.operator_reason as "operatorReason",
      creator.email as "createdByEmail",
      creator.display_name as "createdByDisplayName",
      decider.email as "decidedByEmail",
      decider.display_name as "decidedByDisplayName",
      mca.sla_due_at::text as "slaDueAt",
      mca.decided_at::text as "decidedAt",
      mca.created_at::text as "createdAt",
      mca.updated_at::text as "updatedAt",
      coalesce(installs.install_count, 0)::int as "installCount",
      coalesce(invocations.call_count, 0)::int as "callCount",
      invocations.success_rate as "successRate",
      coalesce(feedback.feedback_count, 0)::int as "feedbackCount",
      coalesce(incidents.incident_count, 0)::int as "incidentCount"
    from marketplace_curation_appeals mca
    join skills s on s.id = mca.skill_id
    join organizations o on o.id = mca.publisher_organization_id
    left join users creator on creator.id = mca.created_by_user_id
    left join users decider on decider.id = mca.decided_by_user_id
    left join lateral (
      select count(*)::int as install_count
      from project_skill_installs
      where skill_id = s.id and status = 'installed'
    ) installs on true
    left join lateral (
      select
        count(*)::int as call_count,
        (count(*) filter (where status = 'success'))::float / nullif(count(*), 0) as success_rate
      from skill_invocations
      where skill_id = s.id
    ) invocations on true
    left join lateral (
      select count(*)::int as feedback_count
      from skill_feedback
      where skill_id = s.id and status = 'published'
    ) feedback on true
    left join lateral (
      select count(*)::int as incident_count
      from skill_incidents
      where skill_id = s.id and status in ('open', 'monitoring')
    ) incidents on true
    where (${appealId}::uuid is null or mca.id = ${appealId}::uuid)
      and (${publisherOrganizationId}::uuid is null or mca.publisher_organization_id = ${publisherOrganizationId}::uuid)
      and (${status}::text is null or mca.status = ${status})
    order by
      case mca.status
        when 'open' then 0
        when 'under_review' then 1
        when 'approved' then 2
        when 'rejected' then 3
        else 4
      end,
      mca.sla_due_at asc,
      mca.created_at desc
    limit ${normalizeLimit(options.limit, 100)}
  `) as MarketplaceCurationAppealRecord[];
}

async function getOwnedSkill(sql: Sql, slug: string, organizationId: string): Promise<SkillForAppeal> {
  const rows = (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      slug,
      display_name as "displayName",
      verification_status as "verificationStatus",
      visibility
    from skills
    where slug = ${slug}
      and organization_id = ${organizationId}
    limit 1
  `) as SkillForAppeal[];

  if (!rows[0]) {
    throw new Error("Skill not found for this publisher organization.");
  }

  return rows[0];
}

async function getActiveCuration(sql: Sql, skillId: string): Promise<CurationForAppeal> {
  const rows = (await sql`
    select
      id::text,
      placement,
      boost,
      reason,
      ends_at::text as "endsAt"
    from marketplace_curation_rules
    where skill_id = ${skillId}
      and starts_at <= now()
      and (ends_at is null or ends_at > now())
    order by updated_at desc
    limit 1
  `) as CurationForAppeal[];

  return (
    rows[0] ?? {
      boost: 0,
      endsAt: null,
      id: null,
      placement: "standard",
      reason: null
    }
  );
}

async function getAppealForDecision(sql: Sql, appealId: string): Promise<AppealForDecision> {
  const rows = (await sql`
    select
      mca.id::text as "appealId",
      mca.status as "appealStatus",
      mca.current_placement as "currentPlacement",
      mca.requested_placement as "requestedPlacement",
      s.id::text,
      s.organization_id::text as "organizationId",
      s.slug,
      s.display_name as "displayName",
      s.visibility,
      s.verification_status as "verificationStatus"
    from marketplace_curation_appeals mca
    join skills s on s.id = mca.skill_id
    where mca.id = ${appealId}
    limit 1
  `) as AppealForDecision[];

  if (!rows[0]) {
    throw new Error("Marketplace distribution appeal not found.");
  }

  return rows[0];
}

async function recordAppealAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  appealId: string,
  reason: string | null,
  metadata: Record<string, unknown>,
  entityType = "marketplace_curation_appeal"
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, ${entityType}, ${appealId}, ${reason}, ${sql.json(metadata)})
  `;
}

async function recordAppealNotification(
  sql: Sql,
  organizationId: string | null | undefined,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId ?? null}, ${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}

function requestTypeFor(currentPlacement: MarketplacePlacement, requestedPlacement: "featured" | "standard"): CurationAppealRequestType {
  if (currentPlacement === "suppressed") {
    return "suppression_appeal";
  }

  if (requestedPlacement === "featured") {
    return "featured_request";
  }

  return "placement_review";
}

function canFeatureSkill(skill: { verificationStatus: string; visibility: string }) {
  return skill.visibility === "public" && skill.verificationStatus === "verified";
}

function defaultBoostForApproval(placement: MarketplacePlacement, currentBoost: number) {
  if (placement === "featured") {
    return Math.max(currentBoost, 80);
  }

  return Math.max(currentBoost, 0);
}

function normalizeDecisionAction(value: unknown): CurationAppealDecisionAction {
  const action = String(value ?? "").trim();

  if (!decisionActions.includes(action as CurationAppealDecisionAction)) {
    throw new Error("Appeal action must be review, approve, reject, or close.");
  }

  return action as CurationAppealDecisionAction;
}

function normalizeDecisionPlacement(value: unknown, fallback: "featured" | "standard"): "featured" | "standard" {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }

  return normalizeRequestedPlacement(value);
}

function normalizeRequestedPlacement(value: unknown): "featured" | "standard" {
  const placement = String(value ?? "standard").trim();

  if (!requestPlacements.includes(placement as (typeof requestPlacements)[number])) {
    throw new Error("Requested placement must be featured or standard.");
  }

  return placement as "featured" | "standard";
}

function normalizeOptionalStatus(value: string | undefined) {
  const status = value?.trim();
  const statuses: CurationAppealStatus[] = ["approved", "closed", "open", "rejected", "under_review"];
  return statuses.includes(status as CurationAppealStatus) ? (status as CurationAppealStatus) : undefined;
}

function statusForDecision(action: CurationAppealDecisionAction): CurationAppealStatus {
  const statuses: Record<CurationAppealDecisionAction, CurationAppealStatus> = {
    approve: "approved",
    close: "closed",
    reject: "rejected",
    review: "under_review"
  };

  return statuses[action];
}

function normalizeBoost(value: unknown, fallback: number) {
  const numeric = Number(value ?? fallback);
  const normalized = Number.isFinite(numeric) ? Math.trunc(numeric) : fallback;
  return Math.min(Math.max(normalized, -250), 250);
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

function normalizeEvidenceUrl(value: unknown) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new Error("Evidence URL must be a valid URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Evidence URL must use http or https.");
  }

  return raw.slice(0, 600);
}

function normalizeText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function normalizeLimit(value: number, max: number) {
  return Math.max(1, Math.min(Number(value) || 50, max));
}

function isMissingAppealTable(error: unknown) {
  return error instanceof Error && error.message.includes("marketplace_curation_appeals");
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for marketplace curation appeal operations.");
  }

  return sql;
}
