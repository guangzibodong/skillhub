import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type FeedbackStatus = "pending" | "published" | "hidden" | "rejected";
type FeedbackDecisionAction = "hide" | "publish" | "reject" | "reopen";

type CreateSkillFeedbackInput = {
  body?: unknown;
  projectSlug?: unknown;
  rating?: unknown;
  title?: unknown;
  useCase?: unknown;
};

type CreateSkillFeedbackContext = {
  organizationId?: string | null;
  skillSlug: string;
  userId?: string | null;
};

type SkillFeedbackDecisionInput = {
  action?: unknown;
  reason?: unknown;
};

type PublisherFeedbackResponseInput = {
  body?: unknown;
};

type PublisherFeedbackResponseContext = {
  organizationId?: string | null;
  userId?: string | null;
};

type SkillForFeedback = {
  id: string;
  organizationId: string | null;
  slug: string;
  displayName: string;
  latestVersionId: string | null;
};

export type SkillFeedbackRow = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  reviewerEmail: string | null;
  reviewerDisplayName: string | null;
  reviewerOrganizationName: string | null;
  projectSlug: string | null;
  rating: number;
  title: string;
  body: string;
  useCase: string | null;
  status: FeedbackStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  publisherResponseBody: string | null;
  publisherRespondedAt: string | null;
  publisherResponderDisplayName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillFeedbackSummary = {
  averageRating: number | null;
  publishedCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

const statuses: FeedbackStatus[] = ["pending", "published", "hidden", "rejected"];
const decisionActions: FeedbackDecisionAction[] = ["hide", "publish", "reject", "reopen"];

const fallbackFeedback = [
  {
    id: "demo-feedback-browser-research-1",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: null,
    reviewerDisplayName: "Research Agent Ops",
    reviewerOrganizationName: "SkillHub Demo Org",
    projectSlug: "research-agent",
    rating: 5,
    title: "Reliable source gathering for daily briefings",
    body: "The manifest is clear, permissions match the browser workflow, and the output shape is stable enough for scheduled research agents.",
    useCase: "Daily market and policy research briefings",
    status: "published",
    moderationReason: "Public demo feedback.",
    moderatedAt: "demo",
    publisherResponseBody:
      "Thanks for the citation request. We are adding source timestamps and confidence fields to the next reviewed version.",
    publisherRespondedAt: "demo",
    publisherResponderDisplayName: "SkillHub Labs",
    publishedAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-feedback-browser-research-2",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: null,
    reviewerDisplayName: "Automation Lead",
    reviewerOrganizationName: "Builder Studio",
    projectSlug: "content-agent",
    rating: 4,
    title: "Good contract, needs richer citation metadata",
    body: "Works well for first-pass research. We would like source timestamps and confidence fields before using it in compliance-heavy workflows.",
    useCase: "Long-form content research",
    status: "published",
    moderationReason: "Public demo feedback.",
    moderatedAt: "demo",
    publisherResponseBody:
      "This is on our roadmap for regulated workflows. The next manifest revision will expose richer source metadata.",
    publisherRespondedAt: "demo",
    publisherResponderDisplayName: "SkillHub Labs",
    publishedAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-feedback-manifest-review-1",
    skillId: "demo-skill-manifest-review",
    skillSlug: "manifest-review",
    skillName: "Manifest Review",
    reviewerEmail: null,
    reviewerDisplayName: "Platform Reviewer",
    reviewerOrganizationName: "SkillHub Demo Org",
    projectSlug: "publisher-workbench",
    rating: 5,
    title: "Useful before submitting a new skill",
    body: "It catches missing examples and permission mismatches before the skill enters the formal review queue.",
    useCase: "Publisher preflight checks",
    status: "published",
    moderationReason: "Public demo feedback.",
    moderatedAt: "demo",
    publisherResponseBody: null,
    publisherRespondedAt: null,
    publisherResponderDisplayName: null,
    publishedAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-feedback-pending",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: "ops@example.com",
    reviewerDisplayName: "Ops Reviewer",
    reviewerOrganizationName: "Research Agent",
    projectSlug: "research-agent",
    rating: 3,
    title: "Needs review before publishing",
    body: "Pending queue example for admin moderation.",
    useCase: "Admin queue demo",
    status: "pending",
    moderationReason: null,
    moderatedAt: null,
    publisherResponseBody: null,
    publisherRespondedAt: null,
    publisherResponderDisplayName: null,
    publishedAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  }
] satisfies SkillFeedbackRow[];

export async function listPublicSkillFeedback(skillSlug: string, limit = 12) {
  const sql = await getSql();

  if (!sql) {
    const feedback = fallbackFeedback
      .filter((row) => row.skillSlug === skillSlug && row.status === "published")
      .slice(0, normalizeLimit(limit, 24));

    return {
      feedback,
      summary: summarizeFeedback(feedback)
    };
  }

  const feedback = await listFeedbackRows(sql, {
    limit,
    skillSlug,
    status: "published"
  });

  return {
    feedback,
    summary: await getFeedbackSummary(sql, skillSlug)
  };
}

export async function listAdminSkillFeedback(status?: string, limit = 50) {
  const normalizedStatus = normalizeOptionalStatus(status);
  const sql = await getSql();

  if (!sql) {
    return fallbackFeedback
      .filter((row) => !normalizedStatus || row.status === normalizedStatus)
      .slice(0, normalizeLimit(limit, 100));
  }

  return listFeedbackRows(sql, {
    limit,
    status: normalizedStatus
  });
}

export async function createSkillFeedback(input: CreateSkillFeedbackInput, context: CreateSkillFeedbackContext) {
  const sql = await requireSql();
  const rating = normalizeRating(input.rating);
  const title = normalizeText(input.title, "title", 140);
  const body = normalizeText(input.body, "body", 1800);
  const useCase = normalizeOptionalText(input.useCase, 180);

  return sql.begin(async (tx: Sql) => {
    const skill = await getSkillForSlug(tx, context.skillSlug);
    const projectId = context.organizationId
      ? await getProjectId(tx, normalizeOptionalText(input.projectSlug, 120), context.organizationId)
      : null;
    const rows = (await tx`
      insert into skill_feedback (
        skill_id,
        skill_version_id,
        reviewer_user_id,
        reviewer_organization_id,
        project_id,
        rating,
        title,
        body,
        use_case,
        status
      )
      values (
        ${skill.id},
        ${skill.latestVersionId},
        ${context.userId ?? null},
        ${context.organizationId ?? null},
        ${projectId},
        ${rating},
        ${title},
        ${body},
        ${useCase},
        'pending'
      )
      returning id::text
    `) as Array<{ id: string }>;
    const feedbackId = rows[0].id;

    await recordFeedbackAudit(tx, context.userId, "skill_feedback.created", feedbackId, "Feedback submitted.", {
      rating,
      skillSlug: skill.slug,
      reviewerOrganizationId: context.organizationId ?? null
    });
    await recordFeedbackNotification(tx, skill.organizationId, "skill.feedback.created", "Skill feedback submitted", {
      feedbackId,
      rating,
      skillName: skill.displayName,
      skillSlug: skill.slug
    });

    const feedback = await listFeedbackRows(tx, {
      feedbackId,
      limit: 1
    });
    return feedback[0];
  });
}

export async function decideSkillFeedback(
  feedbackId: string,
  input: SkillFeedbackDecisionInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const action = normalizeDecisionAction(input.action);
  const reason = normalizeText(input.reason, "reason", 1200);
  const status = statusForAction(action);

  return sql.begin(async (tx: Sql) => {
    const feedback = await getFeedbackForDecision(tx, feedbackId);

    await tx`
      update skill_feedback
      set
        status = ${status},
        moderation_reason = ${reason},
        moderated_by_user_id = ${actorUserId ?? null},
        moderated_at = now(),
        published_at = case when ${status} = 'published' then coalesce(published_at, now()) else null end,
        updated_at = now()
      where id = ${feedbackId}
    `;

    await recordFeedbackAudit(tx, actorUserId, `skill_feedback.${action}`, feedbackId, reason, {
      action,
      previousStatus: feedback.status,
      skillSlug: feedback.skillSlug,
      status
    });
    await recordFeedbackNotification(tx, feedback.publisherOrganizationId, `skill.feedback.${status}`, "Skill feedback decision recorded", {
      action,
      feedbackId,
      rating: feedback.rating,
      skillName: feedback.skillName,
      skillSlug: feedback.skillSlug,
      status
    });

    const feedbackRows = await listFeedbackRows(tx, {
      feedbackId,
      limit: 1
    });
    return feedbackRows[0];
  });
}

export async function respondToSkillFeedback(
  feedbackId: string,
  input: PublisherFeedbackResponseInput,
  context: PublisherFeedbackResponseContext
) {
  const sql = await requireSql();
  const body = normalizeText(input.body, "publisher response", 1800);

  return sql.begin(async (tx: Sql) => {
    const feedback = await getFeedbackForPublisherResponse(tx, feedbackId);

    if (!context.organizationId || feedback.publisherOrganizationId !== context.organizationId) {
      throw new Error("Publisher feedback responses require the owning publisher organization.");
    }

    if (feedback.status !== "published") {
      throw new Error("Only published feedback can receive a publisher response.");
    }

    await tx`
      update skill_feedback
      set
        publisher_response_body = ${body},
        publisher_responded_by_user_id = ${context.userId ?? null},
        publisher_responded_at = now(),
        updated_at = now()
      where id = ${feedbackId}
    `;

    await recordFeedbackAudit(tx, context.userId, "skill_feedback.publisher_response", feedbackId, "Publisher responded to feedback.", {
      previousResponsePresent: Boolean(feedback.publisherResponseBody),
      rating: feedback.rating,
      skillSlug: feedback.skillSlug
    });
    await recordFeedbackNotification(tx, feedback.reviewerOrganizationId, "skill.feedback.publisher_response", "Publisher responded to feedback", {
      feedbackId,
      rating: feedback.rating,
      responsePreview: body.slice(0, 220),
      skillName: feedback.skillName,
      skillSlug: feedback.skillSlug
    });

    const feedbackRows = await listFeedbackRows(tx, {
      feedbackId,
      limit: 1
    });
    return feedbackRows[0];
  });
}

async function listFeedbackRows(
  sql: Sql,
  options: {
    feedbackId?: string;
    limit: number;
    skillSlug?: string;
    status?: FeedbackStatus;
  }
) {
  const feedbackId = options.feedbackId ?? null;
  const skillSlug = options.skillSlug ?? null;
  const status = options.status ?? null;

  return (await sql`
    select
      sf.id::text,
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      u.email as "reviewerEmail",
      u.display_name as "reviewerDisplayName",
      o.name as "reviewerOrganizationName",
      p.slug as "projectSlug",
      sf.rating,
      sf.title,
      sf.body,
      sf.use_case as "useCase",
      sf.status,
      sf.moderation_reason as "moderationReason",
      sf.moderated_at as "moderatedAt",
      sf.publisher_response_body as "publisherResponseBody",
      sf.publisher_responded_at as "publisherRespondedAt",
      responder.display_name as "publisherResponderDisplayName",
      sf.published_at as "publishedAt",
      sf.created_at as "createdAt",
      sf.updated_at as "updatedAt"
    from skill_feedback sf
    join skills s on s.id = sf.skill_id
    left join users u on u.id = sf.reviewer_user_id
    left join users responder on responder.id = sf.publisher_responded_by_user_id
    left join organizations o on o.id = sf.reviewer_organization_id
    left join projects p on p.id = sf.project_id
    where (${feedbackId}::uuid is null or sf.id = ${feedbackId}::uuid)
      and (${skillSlug}::text is null or s.slug = ${skillSlug})
      and (${status}::text is null or sf.status = ${status})
    order by
      case sf.status
        when 'pending' then 0
        when 'published' then 1
        when 'hidden' then 2
        else 3
      end,
      sf.created_at desc
    limit ${normalizeLimit(options.limit, 100)}
  `) as SkillFeedbackRow[];
}

async function getFeedbackSummary(sql: Sql, skillSlug: string): Promise<SkillFeedbackSummary> {
  const rows = (await sql`
    select
      round(avg(sf.rating)::numeric, 1)::float as "averageRating",
      count(*)::int as "publishedCount",
      count(*) filter (where sf.rating = 1)::int as "rating1",
      count(*) filter (where sf.rating = 2)::int as "rating2",
      count(*) filter (where sf.rating = 3)::int as "rating3",
      count(*) filter (where sf.rating = 4)::int as "rating4",
      count(*) filter (where sf.rating = 5)::int as "rating5"
    from skill_feedback sf
    join skills s on s.id = sf.skill_id
    where s.slug = ${skillSlug}
      and sf.status = 'published'
  `) as Array<{
    averageRating: number | null;
    publishedCount: number;
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
  }>;
  const summary = rows[0];

  return {
    averageRating: summary?.averageRating ?? null,
    publishedCount: summary?.publishedCount ?? 0,
    ratingBreakdown: {
      1: summary?.rating1 ?? 0,
      2: summary?.rating2 ?? 0,
      3: summary?.rating3 ?? 0,
      4: summary?.rating4 ?? 0,
      5: summary?.rating5 ?? 0
    }
  };
}

async function getSkillForSlug(sql: Sql, slug: string): Promise<SkillForFeedback> {
  const rows = (await sql`
    select
      s.id::text,
      s.organization_id::text as "organizationId",
      s.slug,
      s.display_name as "displayName",
      latest_version.id::text as "latestVersionId"
    from skills s
    left join lateral (
      select id
      from skill_versions sv
      where sv.skill_id = s.id
      order by sv.created_at desc
      limit 1
    ) latest_version on true
    where s.slug = ${slug}
    limit 1
  `) as SkillForFeedback[];

  if (!rows[0]) {
    throw new Error("Skill not found.");
  }

  return rows[0];
}

async function getProjectId(sql: Sql, projectSlug: string | null, organizationId: string) {
  if (!projectSlug) {
    return null;
  }

  const rows = (await sql`
    select id::text
    from projects
    where slug = ${projectSlug}
      and organization_id = ${organizationId}
    limit 1
  `) as Array<{ id: string }>;

  if (!rows[0]) {
    throw new Error("Project not found for this organization.");
  }

  return rows[0].id;
}

async function getFeedbackForDecision(sql: Sql, feedbackId: string) {
  const rows = (await sql`
    select
      sf.id::text,
      sf.rating,
      sf.status,
      s.slug as "skillSlug",
      s.display_name as "skillName",
      s.organization_id::text as "publisherOrganizationId"
    from skill_feedback sf
    join skills s on s.id = sf.skill_id
    where sf.id = ${feedbackId}
    limit 1
  `) as Array<{
    id: string;
    publisherOrganizationId: string | null;
    rating: number;
    skillName: string;
    skillSlug: string;
    status: FeedbackStatus;
  }>;

  if (!rows[0]) {
    throw new Error("Skill feedback not found.");
  }

  return rows[0];
}

async function getFeedbackForPublisherResponse(sql: Sql, feedbackId: string) {
  const rows = (await sql`
    select
      sf.id::text,
      sf.rating,
      sf.status,
      sf.publisher_response_body as "publisherResponseBody",
      sf.reviewer_organization_id::text as "reviewerOrganizationId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      s.organization_id::text as "publisherOrganizationId"
    from skill_feedback sf
    join skills s on s.id = sf.skill_id
    where sf.id = ${feedbackId}
    limit 1
  `) as Array<{
    id: string;
    publisherOrganizationId: string | null;
    publisherResponseBody: string | null;
    rating: number;
    reviewerOrganizationId: string | null;
    skillName: string;
    skillSlug: string;
    status: FeedbackStatus;
  }>;

  if (!rows[0]) {
    throw new Error("Skill feedback not found.");
  }

  return rows[0];
}

async function recordFeedbackAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  feedbackId: string,
  reason: string | null,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, 'skill_feedback', ${feedbackId}, ${reason}, ${sql.json(metadata)})
  `;
}

async function recordFeedbackNotification(
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

function summarizeFeedback(feedback: SkillFeedbackRow[]): SkillFeedbackSummary {
  const ratingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  } satisfies SkillFeedbackSummary["ratingBreakdown"];
  const published = feedback.filter((row) => row.status === "published");

  published.forEach((row) => {
    ratingBreakdown[row.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });

  const total = published.reduce((sum, row) => sum + row.rating, 0);

  return {
    averageRating: published.length > 0 ? Number((total / published.length).toFixed(1)) : null,
    publishedCount: published.length,
    ratingBreakdown
  };
}

function normalizeDecisionAction(value: unknown): FeedbackDecisionAction {
  const action = String(value ?? "").trim();

  if (!decisionActions.includes(action as FeedbackDecisionAction)) {
    throw new Error("Feedback action must be publish, hide, reject, or reopen.");
  }

  return action as FeedbackDecisionAction;
}

function statusForAction(action: FeedbackDecisionAction): FeedbackStatus {
  const statuses: Record<FeedbackDecisionAction, FeedbackStatus> = {
    hide: "hidden",
    publish: "published",
    reject: "rejected",
    reopen: "pending"
  };

  return statuses[action];
}

function normalizeOptionalStatus(value: string | undefined) {
  const status = value?.trim();
  return statuses.includes(status as FeedbackStatus) ? (status as FeedbackStatus) : undefined;
}

function normalizeRating(value: unknown) {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  return rating;
}

function normalizeText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeLimit(value: number, max: number) {
  return Math.max(1, Math.min(Number(value) || 50, max));
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for skill feedback operations.");
  }

  return sql;
}
