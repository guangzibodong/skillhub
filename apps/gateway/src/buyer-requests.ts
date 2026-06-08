import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type BuyerRequestStatus = "open" | "claimed" | "submitted" | "matched" | "closed" | "canceled";
type DeveloperDecisionStatus = "matched" | "closed" | "canceled";

type BuyerRequestInput = {
  title?: string;
  description?: string;
  category?: string;
  bountyCents?: number;
  currency?: string;
  dueAt?: string | null;
};

type DeveloperDecisionInput = {
  status?: DeveloperDecisionStatus;
  reason?: string;
};

type BuyerRequestSubmissionInput = {
  deliveryNote?: string;
  evidenceUrl?: string;
  skillSlug?: string;
  version?: string;
};

type BuyerRequestRow = {
  id: string;
  requesterOrganizationId: string | null;
  requesterOrganizationName: string | null;
  title: string;
  description: string;
  category: string;
  bountyCents: number;
  currency: string;
  status: BuyerRequestStatus;
  claimedByPublisherId: string | null;
  claimedByPublisherName: string | null;
  claimedByPublisherOrganizationId: string | null;
  submittedSkillId: string | null;
  submittedSkillSlug: string | null;
  submittedSkillName: string | null;
  submittedSkillVerificationStatus: string | null;
  submittedSkillVersionId: string | null;
  submittedSkillVersion: string | null;
  submittedSkillReviewStatus: string | null;
  deliveryNote: string | null;
  evidenceUrl: string | null;
  submittedAt: string | null;
  decisionNote: string | null;
  decidedAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PublisherProfile = {
  id: string;
  organizationId: string;
  displayName: string;
};

type DeliverySkillVersion = {
  reviewStatus: string | null;
  skillId: string;
  skillName: string;
  skillSlug: string;
  skillVerificationStatus: string;
  version: string;
  versionId: string;
};

const fallbackBuyerRequests = [
  {
    id: "demo-request-figma-linear",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "OpsPilot",
    title: "Figma change request to Linear issue",
    description: "Convert annotated Figma comments into scoped Linear issues with acceptance criteria.",
    category: "workflow",
    bountyCents: 60000,
    currency: "usd",
    status: "open",
    claimedByPublisherId: null,
    claimedByPublisherName: null,
    claimedByPublisherOrganizationId: null,
    submittedSkillId: null,
    submittedSkillSlug: null,
    submittedSkillName: null,
    submittedSkillVerificationStatus: null,
    submittedSkillVersionId: null,
    submittedSkillVersion: null,
    submittedSkillReviewStatus: null,
    deliveryNote: null,
    evidenceUrl: null,
    submittedAt: null,
    decisionNote: null,
    decidedAt: null,
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: true,
    nextAction: "Claim request"
  },
  {
    id: "demo-request-shopify-ops",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "Commerce Desk",
    title: "Shopify product operations skill",
    description: "Normalize product attributes, flag missing SEO fields, and prepare bulk update actions.",
    category: "commerce",
    bountyCents: 90000,
    currency: "usd",
    status: "claimed",
    claimedByPublisherId: "demo-publisher",
    claimedByPublisherName: "SkillHub Publisher",
    claimedByPublisherOrganizationId: "demo-org",
    submittedSkillId: null,
    submittedSkillSlug: null,
    submittedSkillName: null,
    submittedSkillVerificationStatus: null,
    submittedSkillVersionId: null,
    submittedSkillVersion: null,
    submittedSkillReviewStatus: null,
    deliveryNote: null,
    evidenceUrl: null,
    submittedAt: null,
    decisionNote: null,
    decidedAt: null,
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: false,
    nextAction: "Submit build"
  },
  {
    id: "demo-request-slack-incident",
    requesterOrganizationId: "demo-buyer-org",
    requesterOrganizationName: "Reliability AI",
    title: "Slack incident summarizer",
    description: "Summarize incident threads into timeline, owner actions, and customer-impact notes.",
    category: "ops",
    bountyCents: 45000,
    currency: "usd",
    status: "submitted",
    claimedByPublisherId: "demo-publisher",
    claimedByPublisherName: "SkillHub Publisher",
    claimedByPublisherOrganizationId: "demo-org",
    submittedSkillId: "demo-skill-slack-incident",
    submittedSkillSlug: "slack-incident-summarizer",
    submittedSkillName: "Slack Incident Summarizer",
    submittedSkillVerificationStatus: "verified",
    submittedSkillVersionId: "demo-version-slack-incident-010",
    submittedSkillVersion: "0.1.0",
    submittedSkillReviewStatus: "approved",
    deliveryNote: "Submitted a verified skill version with sample incident timeline output and project test evidence.",
    evidenceUrl: "https://useskillhub.com/skills/slack-incident-summarizer",
    submittedAt: "demo",
    decisionNote: null,
    decidedAt: null,
    dueAt: "demo",
    createdAt: "demo",
    updatedAt: "demo",
    canClaim: false,
    nextAction: "Await buyer match"
  }
] as const;

export async function listPublisherBuyerRequests(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackBuyerRequests.slice(0, limit);
  }

  const safeLimit = normalizeLimit(limit);
  const scopedOrganizationId = requireOrganizationId(organizationId, "Publisher buyer request listing");
  const rows = (await sql`
    select
      br.id::text,
      br.organization_id::text as "requesterOrganizationId",
      requester.name as "requesterOrganizationName",
      br.title,
      br.description,
      br.category,
      br.bounty_cents as "bountyCents",
      br.currency,
      br.status,
      claimed.id::text as "claimedByPublisherId",
      claimed.display_name as "claimedByPublisherName",
      claimed.organization_id::text as "claimedByPublisherOrganizationId",
      submitted_skill.id::text as "submittedSkillId",
      submitted_skill.slug as "submittedSkillSlug",
      submitted_skill.display_name as "submittedSkillName",
      submitted_skill.verification_status as "submittedSkillVerificationStatus",
      submitted_version.id::text as "submittedSkillVersionId",
      submitted_version.version as "submittedSkillVersion",
      submitted_review.status as "submittedSkillReviewStatus",
      br.delivery_note as "deliveryNote",
      br.evidence_url as "evidenceUrl",
      br.submitted_at as "submittedAt",
      br.decision_note as "decisionNote",
      br.decided_at as "decidedAt",
      br.due_at as "dueAt",
      br.created_at as "createdAt",
      br.updated_at as "updatedAt"
    from buyer_requests br
    left join organizations requester on requester.id = br.organization_id
    left join publisher_profiles claimed on claimed.id = br.claimed_by_publisher_id
    left join skills submitted_skill on submitted_skill.id = br.submitted_skill_id
    left join skill_versions submitted_version on submitted_version.id = br.submitted_skill_version_id
    left join lateral (
      select status
      from skill_reviews
      where skill_version_id = br.submitted_skill_version_id
      order by created_at desc
      limit 1
    ) submitted_review on true
    where br.status = 'open' or claimed.organization_id = ${scopedOrganizationId}
    order by
      case br.status
        when 'open' then 0
        when 'claimed' then 1
        when 'submitted' then 2
        when 'matched' then 3
        when 'closed' then 4
        else 5
      end,
      br.created_at desc
    limit ${safeLimit}
  `) as BuyerRequestRow[];

  return rows.map((row) => mapBuyerRequest(row, scopedOrganizationId));
}

export async function listDeveloperBuyerRequests(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackBuyerRequests.slice(0, limit);
  }

  const safeLimit = normalizeLimit(limit);
  const scopedOrganizationId = requireOrganizationId(organizationId, "Developer buyer request listing");
  const rows = (await sql`
    select
      br.id::text,
      br.organization_id::text as "requesterOrganizationId",
      requester.name as "requesterOrganizationName",
      br.title,
      br.description,
      br.category,
      br.bounty_cents as "bountyCents",
      br.currency,
      br.status,
      claimed.id::text as "claimedByPublisherId",
      claimed.display_name as "claimedByPublisherName",
      claimed.organization_id::text as "claimedByPublisherOrganizationId",
      submitted_skill.id::text as "submittedSkillId",
      submitted_skill.slug as "submittedSkillSlug",
      submitted_skill.display_name as "submittedSkillName",
      submitted_skill.verification_status as "submittedSkillVerificationStatus",
      submitted_version.id::text as "submittedSkillVersionId",
      submitted_version.version as "submittedSkillVersion",
      submitted_review.status as "submittedSkillReviewStatus",
      br.delivery_note as "deliveryNote",
      br.evidence_url as "evidenceUrl",
      br.submitted_at as "submittedAt",
      br.decision_note as "decisionNote",
      br.decided_at as "decidedAt",
      br.due_at as "dueAt",
      br.created_at as "createdAt",
      br.updated_at as "updatedAt"
    from buyer_requests br
    left join organizations requester on requester.id = br.organization_id
    left join publisher_profiles claimed on claimed.id = br.claimed_by_publisher_id
    left join skills submitted_skill on submitted_skill.id = br.submitted_skill_id
    left join skill_versions submitted_version on submitted_version.id = br.submitted_skill_version_id
    left join lateral (
      select status
      from skill_reviews
      where skill_version_id = br.submitted_skill_version_id
      order by created_at desc
      limit 1
    ) submitted_review on true
    where br.organization_id = ${scopedOrganizationId}
    order by br.created_at desc
    limit ${safeLimit}
  `) as BuyerRequestRow[];

  return rows.map((row) => mapBuyerRequest(row, scopedOrganizationId));
}

export async function createBuyerRequest(organizationId: string | null | undefined, input: BuyerRequestInput) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId, "Buyer request creation");
  const title = normalizeRequiredText(input.title, "Buyer request title");
  const description = normalizeRequiredText(input.description, "Buyer request description");
  const category = normalizeRequiredText(input.category, "Buyer request category");
  const bountyCents = normalizeBounty(input.bountyCents);
  const currency = normalizeCurrency(input.currency);
  const dueAt = normalizeDueAt(input.dueAt);

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      insert into buyer_requests (
        organization_id,
        title,
        description,
        category,
        bounty_cents,
        currency,
        due_at,
        updated_at
      )
      values (
        ${scopedOrganizationId},
        ${title},
        ${description},
        ${category},
        ${bountyCents},
        ${currency},
        ${dueAt},
        now()
      )
      returning
        id::text,
        organization_id::text as "requesterOrganizationId",
        title,
        description,
        category,
        bounty_cents as "bountyCents",
        currency,
        status,
        null::text as "claimedByPublisherId",
        null::text as "claimedByPublisherName",
        null::text as "claimedByPublisherOrganizationId",
        null::text as "submittedSkillId",
        null::text as "submittedSkillSlug",
        null::text as "submittedSkillName",
        null::text as "submittedSkillVerificationStatus",
        null::text as "submittedSkillVersionId",
        null::text as "submittedSkillVersion",
        null::text as "submittedSkillReviewStatus",
        null::text as "deliveryNote",
        null::text as "evidenceUrl",
        null::text as "submittedAt",
        null::text as "decisionNote",
        null::text as "decidedAt",
        due_at as "dueAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as BuyerRequestRow[];
    const request = rows[0];

    await recordAudit(tx, "buyer_request.created", "buyer_request", request.id, null, {
      organizationId: scopedOrganizationId,
      bountyCents,
      currency,
      category
    });
    await recordNotification(tx, scopedOrganizationId, "buyer_request.created", "Buyer request opened", {
      requestId: request.id,
      title,
      category,
      bountyCents,
      currency
    });

    return mapBuyerRequest({ ...request, requesterOrganizationName: null }, scopedOrganizationId);
  });
}

export async function claimBuyerRequest(organizationId: string | null | undefined, requestId: string) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId, "Buyer request claiming");

  return sql.begin(async (tx: Sql) => {
    const publisher = await ensurePublisherProfile(tx, scopedOrganizationId);
    const rows = (await tx`
      update buyer_requests
      set
        claimed_by_publisher_id = ${publisher.id},
        status = 'claimed',
        updated_at = now()
      where id = ${requestId}
        and status = 'open'
        and claimed_by_publisher_id is null
      returning id::text, organization_id::text as "requesterOrganizationId", title
    `) as Array<{ id: string; requesterOrganizationId: string | null; title: string }>;
    const request = rows[0];

    if (!request) {
      throw new Error("Buyer request is not open or has already been claimed.");
    }

    await recordAudit(tx, "buyer_request.claimed", "buyer_request", request.id, null, {
      publisherProfileId: publisher.id,
      publisherOrganizationId: scopedOrganizationId
    });
    await recordNotification(tx, scopedOrganizationId, "buyer_request.claimed", "Buyer request claimed", {
      requestId: request.id,
      title: request.title,
      publisherProfileId: publisher.id
    });

    if (request.requesterOrganizationId) {
      await recordNotification(tx, request.requesterOrganizationId, "buyer_request.claimed", "Your buyer request was claimed", {
        requestId: request.id,
        title: request.title,
        publisherProfileId: publisher.id,
        publisherName: publisher.displayName
      });
    }

    return getBuyerRequestById(tx, request.id, scopedOrganizationId);
  });
}

export async function submitBuyerRequestBuild(
  organizationId: string | null | undefined,
  requestId: string,
  input: BuyerRequestSubmissionInput
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId, "Buyer request submission");
  const skillSlug = normalizeSlug(input.skillSlug, "Delivery skill slug");
  const version = normalizeRequiredText(input.version, "Delivery skill version");
  const deliveryNote = normalizeRequiredText(input.deliveryNote, "Delivery note");
  const evidenceUrl = normalizeUrl(input.evidenceUrl, "Evidence URL");

  return sql.begin(async (tx: Sql) => {
    const delivery = await ensureOwnedDeliveryVersion(tx, scopedOrganizationId, skillSlug, version);
    const rows = (await tx`
      update buyer_requests br
      set
        status = 'submitted',
        submitted_skill_id = ${delivery.skillId},
        submitted_skill_version_id = ${delivery.versionId},
        delivery_note = ${deliveryNote},
        evidence_url = ${evidenceUrl},
        submitted_at = now(),
        updated_at = now()
      from publisher_profiles pp
      where br.id = ${requestId}
        and br.claimed_by_publisher_id = pp.id
        and pp.organization_id = ${scopedOrganizationId}
        and br.status = 'claimed'
      returning br.id::text, br.organization_id::text as "requesterOrganizationId", br.title
    `) as Array<{ id: string; requesterOrganizationId: string | null; title: string }>;
    const request = rows[0];

    if (!request) {
      throw new Error("Buyer request must be claimed by this publisher before submission.");
    }

    await recordAudit(tx, "buyer_request.submitted", "buyer_request", request.id, null, {
      deliveryNote,
      evidenceUrl,
      publisherOrganizationId: scopedOrganizationId,
      reviewStatus: delivery.reviewStatus,
      skillId: delivery.skillId,
      skillSlug: delivery.skillSlug,
      skillVersionId: delivery.versionId,
      version: delivery.version
    });
    await recordNotification(tx, scopedOrganizationId, "buyer_request.submitted", "Buyer request build submitted", {
      requestId: request.id,
      title: request.title,
      deliveryNote,
      evidenceUrl,
      reviewStatus: delivery.reviewStatus,
      skillSlug: delivery.skillSlug,
      skillVersion: delivery.version
    });

    if (request.requesterOrganizationId) {
      await recordNotification(tx, request.requesterOrganizationId, "buyer_request.submitted", "Buyer request build submitted", {
        requestId: request.id,
        title: request.title,
        deliveryNote,
        evidenceUrl,
        publisherSkillName: delivery.skillName,
        reviewStatus: delivery.reviewStatus,
        skillSlug: delivery.skillSlug,
        skillVersion: delivery.version
      });
    }

    return getBuyerRequestById(tx, request.id, scopedOrganizationId);
  });
}

export async function decideBuyerRequest(
  organizationId: string | null | undefined,
  requestId: string,
  input: DeveloperDecisionInput
) {
  const sql = await requireSql();
  const scopedOrganizationId = requireOrganizationId(organizationId, "Buyer request decision");
  const status = normalizeDeveloperDecision(input.status);

  return sql.begin(async (tx: Sql) => {
    const existingRows = (await tx`
      select
        id::text,
        status,
        title,
        claimed_by_publisher_id::text as "claimedByPublisherId"
      from buyer_requests
      where id = ${requestId}
        and organization_id = ${scopedOrganizationId}
      limit 1
      for update
    `) as Array<{ id: string; status: BuyerRequestStatus; title: string; claimedByPublisherId: string | null }>;
    const existing = existingRows[0];

    if (!existing) {
      throw new Error("Buyer request not found for this organization.");
    }

    ensureDeveloperDecisionAllowed(existing.status, status);

    await tx`
      update buyer_requests
      set
        status = ${status},
        decision_note = ${input.reason?.trim() || null},
        decided_at = now(),
        updated_at = now()
      where id = ${requestId}
    `;
    await recordAudit(tx, `buyer_request.${status}`, "buyer_request", requestId, input.reason, {
      previousStatus: existing.status,
      claimedByPublisherId: existing.claimedByPublisherId
    });
    await recordNotification(tx, scopedOrganizationId, `buyer_request.${status}`, `Buyer request ${status}`, {
      requestId,
      title: existing.title,
      previousStatus: existing.status,
      status,
      reason: input.reason ?? null
    });

    if (existing.claimedByPublisherId) {
      const publisherRows = (await tx`
        select organization_id::text as "organizationId"
        from publisher_profiles
        where id = ${existing.claimedByPublisherId}
        limit 1
      `) as Array<{ organizationId: string }>;
      const publisherOrganizationId = publisherRows[0]?.organizationId;

      if (publisherOrganizationId) {
        await recordNotification(tx, publisherOrganizationId, `buyer_request.${status}`, `Buyer request ${status}`, {
          requestId,
          title: existing.title,
          status,
          reason: input.reason ?? null
        });
      }
    }

    return getBuyerRequestById(tx, requestId, scopedOrganizationId);
  });
}

async function getBuyerRequestById(sql: Sql, requestId: string, organizationId?: string | null) {
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    select
      br.id::text,
      br.organization_id::text as "requesterOrganizationId",
      requester.name as "requesterOrganizationName",
      br.title,
      br.description,
      br.category,
      br.bounty_cents as "bountyCents",
      br.currency,
      br.status,
      claimed.id::text as "claimedByPublisherId",
      claimed.display_name as "claimedByPublisherName",
      claimed.organization_id::text as "claimedByPublisherOrganizationId",
      submitted_skill.id::text as "submittedSkillId",
      submitted_skill.slug as "submittedSkillSlug",
      submitted_skill.display_name as "submittedSkillName",
      submitted_skill.verification_status as "submittedSkillVerificationStatus",
      submitted_version.id::text as "submittedSkillVersionId",
      submitted_version.version as "submittedSkillVersion",
      submitted_review.status as "submittedSkillReviewStatus",
      br.delivery_note as "deliveryNote",
      br.evidence_url as "evidenceUrl",
      br.submitted_at as "submittedAt",
      br.decision_note as "decisionNote",
      br.decided_at as "decidedAt",
      br.due_at as "dueAt",
      br.created_at as "createdAt",
      br.updated_at as "updatedAt"
    from buyer_requests br
    left join organizations requester on requester.id = br.organization_id
    left join publisher_profiles claimed on claimed.id = br.claimed_by_publisher_id
    left join skills submitted_skill on submitted_skill.id = br.submitted_skill_id
    left join skill_versions submitted_version on submitted_version.id = br.submitted_skill_version_id
    left join lateral (
      select status
      from skill_reviews
      where skill_version_id = br.submitted_skill_version_id
      order by created_at desc
      limit 1
    ) submitted_review on true
    where br.id = ${requestId}
    limit 1
  `) as BuyerRequestRow[];

  if (!rows[0]) {
    throw new Error("Buyer request not found.");
  }

  return mapBuyerRequest(rows[0], scopedOrganizationId);
}

async function ensurePublisherProfile(sql: Sql, organizationId: string): Promise<PublisherProfile> {
  const existing = (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      display_name as "displayName"
    from publisher_profiles
    where organization_id = ${organizationId}
    limit 1
  `) as PublisherProfile[];

  if (existing[0]) {
    return existing[0];
  }

  const organizationRows = (await sql`
    select name
    from organizations
    where id = ${organizationId}
    limit 1
  `) as Array<{ name: string }>;
  const displayName = organizationRows[0]?.name ?? "SkillHub Publisher";
  const rows = (await sql`
    insert into publisher_profiles (
      organization_id,
      display_name,
      status,
      payout_status,
      updated_at
    )
    values (
      ${organizationId},
      ${displayName},
      'active',
      'not_configured',
      now()
    )
    returning
      id::text,
      organization_id::text as "organizationId",
      display_name as "displayName"
  `) as PublisherProfile[];

  return rows[0];
}

async function ensureOwnedDeliveryVersion(
  sql: Sql,
  organizationId: string,
  skillSlug: string,
  version: string
): Promise<DeliverySkillVersion> {
  const rows = (await sql`
    select
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      s.verification_status as "skillVerificationStatus",
      sv.id::text as "versionId",
      sv.version,
      review.status as "reviewStatus"
    from skills s
    join skill_versions sv on sv.skill_id = s.id
    left join lateral (
      select status
      from skill_reviews
      where skill_version_id = sv.id
      order by created_at desc
      limit 1
    ) review on true
    where s.organization_id = ${organizationId}
      and s.slug = ${skillSlug}
      and sv.version = ${version}
    limit 1
  `) as DeliverySkillVersion[];
  const delivery = rows[0];

  if (!delivery) {
    throw new Error("Delivery skill version must exist and belong to this publisher organization.");
  }

  if (delivery.skillVerificationStatus === "suspended" || delivery.skillVerificationStatus === "rejected") {
    throw new Error("Suspended or rejected skills cannot be submitted as buyer request delivery.");
  }

  if (!delivery.reviewStatus) {
    throw new Error("Submit this skill version for platform review before sending it to a buyer request.");
  }

  if (delivery.reviewStatus === "rejected" || delivery.reviewStatus === "blocked") {
    throw new Error("Rejected or blocked skill versions cannot be submitted as buyer request delivery.");
  }

  return delivery;
}

function mapBuyerRequest(row: BuyerRequestRow, activePublisherOrganizationId?: string | null) {
  const canClaim = row.status === "open" && !row.claimedByPublisherId;
  const isClaimedByActivePublisher =
    Boolean(activePublisherOrganizationId) && row.claimedByPublisherOrganizationId === activePublisherOrganizationId;

  return {
    ...row,
    canClaim,
    nextAction: getNextAction(row.status, canClaim, isClaimedByActivePublisher)
  };
}

function getNextAction(status: BuyerRequestStatus, canClaim: boolean, isClaimedByActivePublisher: boolean) {
  if (canClaim) {
    return "Claim request";
  }

  if (status === "claimed" && isClaimedByActivePublisher) {
    return "Submit build";
  }

  if (status === "submitted" && isClaimedByActivePublisher) {
    return "Await buyer match";
  }

  if (status === "matched") {
    return "Convert to skill listing";
  }

  if (status === "closed") {
    return "Closed";
  }

  if (status === "canceled") {
    return "Canceled";
  }

  return "Watch request";
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(Number(limit) || 50), 1), 100);
}

function normalizeRequiredText(value: string | undefined, label: string) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function normalizeSlug(value: string | undefined, label: string) {
  const normalized = normalizeRequiredText(value, label).toLowerCase();

  if (!/^[a-z0-9](?:[a-z0-9-]{0,80}[a-z0-9])?$/.test(normalized)) {
    throw new Error(`${label} must be a valid skill slug.`);
  }

  return normalized;
}

function normalizeUrl(value: string | undefined, label: string) {
  const normalized = normalizeRequiredText(value, label);

  try {
    const url = new URL(normalized);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported");
    }

    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid http or https URL.`);
  }
}

function normalizeBounty(value: number | undefined) {
  const normalized = Math.trunc(Number(value ?? 0));

  if (!Number.isFinite(normalized) || normalized < 0) {
    throw new Error("Buyer request bounty must be zero or greater.");
  }

  return normalized;
}

function normalizeCurrency(value = "usd") {
  return value.trim().toLowerCase() || "usd";
}

function normalizeDueAt(value: string | null | undefined) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Buyer request dueAt must be a valid date.");
  }

  return parsed.toISOString();
}

function normalizeDeveloperDecision(status: DeveloperDecisionInput["status"]) {
  if (!status || !["matched", "closed", "canceled"].includes(status)) {
    throw new Error("Buyer request decision status must be matched, closed, or canceled.");
  }

  return status;
}

function ensureDeveloperDecisionAllowed(currentStatus: BuyerRequestStatus, nextStatus: DeveloperDecisionStatus) {
  if (nextStatus === "matched" && currentStatus !== "submitted") {
    throw new Error("Buyer request must be submitted before it can be matched.");
  }

  if (nextStatus === "closed" && !["matched", "submitted", "claimed", "open"].includes(currentStatus)) {
    throw new Error(`Cannot close a buyer request while status is ${currentStatus}.`);
  }

  if (nextStatus === "canceled" && !["open", "claimed", "submitted"].includes(currentStatus)) {
    throw new Error(`Cannot cancel a buyer request while status is ${currentStatus}.`);
  }
}

async function recordAudit(
  sql: Sql,
  action: string,
  entityType: string,
  entityId: string,
  reason: string | null | undefined,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
    values (${action}, ${entityType}, ${entityId}, ${reason ?? null}, ${sql.json(metadata)})
  `;
}

async function recordNotification(
  sql: Sql,
  organizationId: string,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId}, ${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for buyer request operations.");
  }

  return sql;
}

function requireOrganizationId(organizationId: string | null | undefined, operation: string) {
  if (!organizationId) {
    throw new Error(`${operation} requires an organization-scoped user token.`);
  }

  return organizationId;
}
