import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type RefundAction = "approve" | "reject" | "post" | "fail";
type RefundStatus = "requested" | "approved" | "posted" | "rejected" | "failed";
type DisputeStatus = "open" | "won" | "lost" | "warning_needs_response";

type RefundInput = {
  transactionId?: string;
  amountCents?: number;
  reason?: string;
  providerReference?: string;
  metadata?: Record<string, unknown>;
};

type RefundDecisionInput = {
  action?: RefundAction;
  reason?: string;
  providerReference?: string;
};

type DisputeInput = {
  transactionId?: string;
  amountCents?: number;
  status?: DisputeStatus;
  reason?: string;
  externalReference?: string;
  dueAt?: string;
  metadata?: Record<string, unknown>;
};

type DisputeDecisionInput = {
  status?: DisputeStatus;
  reason?: string;
  postRefund?: boolean;
};

type AdjustmentListFilter = {
  refundId?: string;
  disputeId?: string;
  publisherOrganizationId?: string | null;
  projectOrganizationId?: string | null;
  projectSlug?: string | null;
};

type SourceTransaction = {
  id: string;
  projectId: string | null;
  skillId: string | null;
  priceId: string | null;
  skillName: string | null;
  publisherOrganizationId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  sourceType: string;
  splitId: string | null;
  commissionRuleId: string | null;
  publisherProfileId: string | null;
  platformFeeCents: number | null;
  publisherShareCents: number | null;
};

type RefundForPosting = {
  id: string;
  transactionId: string;
  amountCents: number;
  currency: string;
  status: RefundStatus;
  reason: string | null;
  providerReference: string | null;
  adjustmentTransactionId: string | null;
};

export async function listAdminRefunds(limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listRefundRows(sql, limit);
}

export async function listPublisherRefunds(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listRefundRows(sql, limit, { publisherOrganizationId: organizationId });
}

export async function listProjectRefunds(projectSlug: string, organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listRefundRows(sql, limit, { projectOrganizationId: organizationId, projectSlug });
}

export async function createRefundRequest(input: RefundInput, actorUserId?: string | null) {
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    const transaction = await getSourceTransaction(tx, requireId(input.transactionId, "transactionId"), true);
    const remainingCents = await getRefundableRemainingCents(tx, transaction.id, transaction.amountCents);
    const amountCents = normalizeAdjustmentAmount(input.amountCents, remainingCents, "refund");

    const rows = (await tx`
      insert into refunds (
        transaction_id,
        amount_cents,
        currency,
        status,
        reason,
        provider_reference,
        metadata,
        updated_at
      )
      values (
        ${transaction.id},
        ${amountCents},
        ${transaction.currency},
        'requested',
        ${input.reason ?? null},
        ${input.providerReference ?? null},
        ${tx.json(input.metadata ?? {})},
        now()
      )
      returning id::text
    `) as Array<{ id: string }>;
    const refundId = rows[0].id;

    await recordFinanceAudit(tx, actorUserId, "refund.requested", "refund", refundId, input.reason, {
      transactionId: transaction.id,
      amountCents,
      currency: transaction.currency,
      remainingCents
    });
    await recordFinanceNotification(tx, transaction.publisherOrganizationId, "billing.refund_requested", "Refund requested", {
      refundId,
      transactionId: transaction.id,
      skillName: transaction.skillName,
      amountCents,
      currency: transaction.currency
    });

    const refundRows = await listRefundRows(tx, 1, { refundId });
    return refundRows[0];
  });
}

export async function decideRefund(refundId: string, input: RefundDecisionInput, actorUserId?: string | null) {
  const sql = await requireSql();
  const action = input.action;

  if (!action || !["approve", "reject", "post", "fail"].includes(action)) {
    throw new Error("Refund action must be approve, reject, post, or fail.");
  }

  return sql.begin(async (tx: Sql) => {
    const refund = await getRefundForPosting(tx, refundId);

    if (action === "approve") {
      ensureRefundStatus(refund.status, ["requested"], action);
      await tx`
        update refunds
        set
          status = 'approved',
          reason = coalesce(${input.reason ?? null}, reason),
          provider_reference = coalesce(${input.providerReference ?? null}, provider_reference),
          decided_at = now(),
          updated_at = now()
        where id = ${refundId}
      `;
    }

    if (action === "reject") {
      ensureRefundStatus(refund.status, ["requested", "approved"], action);
      await tx`
        update refunds
        set
          status = 'rejected',
          reason = coalesce(${input.reason ?? null}, reason),
          provider_reference = coalesce(${input.providerReference ?? null}, provider_reference),
          decided_at = now(),
          updated_at = now()
        where id = ${refundId}
      `;
    }

    if (action === "fail") {
      ensureRefundStatus(refund.status, ["requested", "approved"], action);
      await tx`
        update refunds
        set
          status = 'failed',
          reason = coalesce(${input.reason ?? null}, reason),
          provider_reference = coalesce(${input.providerReference ?? null}, provider_reference),
          decided_at = now(),
          updated_at = now()
        where id = ${refundId}
      `;
    }

    if (action === "post") {
      ensureRefundStatus(refund.status, ["approved"], action);
      await postRefundAdjustment(tx, refundId, input.reason, input.providerReference);
    }

    await recordFinanceAudit(tx, actorUserId, `refund.${action}`, "refund", refundId, input.reason, {
      previousStatus: refund.status,
      providerReference: input.providerReference ?? null
    });

    const refundRows = await listRefundRows(tx, 1, { refundId });
    return refundRows[0];
  });
}

export async function listAdminDisputes(limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listDisputeRows(sql, limit);
}

export async function listPublisherDisputes(organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listDisputeRows(sql, limit, { publisherOrganizationId: organizationId });
}

export async function listProjectDisputes(projectSlug: string, organizationId: string | null | undefined, limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listDisputeRows(sql, limit, { projectOrganizationId: organizationId, projectSlug });
}

export async function createDispute(input: DisputeInput, actorUserId?: string | null) {
  const sql = await requireSql();

  return sql.begin(async (tx: Sql) => {
    const transaction = await getSourceTransaction(tx, requireId(input.transactionId, "transactionId"), true);
    const amountCents = normalizeAdjustmentAmount(input.amountCents, transaction.amountCents, "dispute");
    const status = input.status ?? "open";

    if (!["open", "warning_needs_response"].includes(status)) {
      throw new Error("New disputes must start as open or warning_needs_response.");
    }

    const rows = (await tx`
      insert into disputes (
        transaction_id,
        amount_cents,
        currency,
        status,
        reason,
        external_reference,
        due_at,
        metadata,
        updated_at
      )
      values (
        ${transaction.id},
        ${amountCents},
        ${transaction.currency},
        ${status},
        ${input.reason ?? null},
        ${input.externalReference ?? null},
        ${input.dueAt ?? null},
        ${tx.json(input.metadata ?? {})},
        now()
      )
      returning id::text
    `) as Array<{ id: string }>;
    const disputeId = rows[0].id;

    await recordFinanceAudit(tx, actorUserId, "dispute.opened", "dispute", disputeId, input.reason, {
      transactionId: transaction.id,
      amountCents,
      currency: transaction.currency,
      status,
      externalReference: input.externalReference ?? null
    });
    await recordFinanceNotification(tx, transaction.publisherOrganizationId, `billing.dispute.${status}`, "Dispute opened", {
      disputeId,
      transactionId: transaction.id,
      skillName: transaction.skillName,
      amountCents,
      currency: transaction.currency,
      status
    });

    const disputeRows = await listDisputeRows(tx, 1, { disputeId });
    return disputeRows[0];
  });
}

export async function decideDispute(disputeId: string, input: DisputeDecisionInput, actorUserId?: string | null) {
  const sql = await requireSql();
  const status = input.status;

  if (!status || !["open", "won", "lost", "warning_needs_response"].includes(status)) {
    throw new Error("Dispute status must be open, won, lost, or warning_needs_response.");
  }

  return sql.begin(async (tx: Sql) => {
    const disputeRows = (await tx`
      select
        d.id::text,
        d.transaction_id::text as "transactionId",
        d.amount_cents as "amountCents",
        d.currency,
        d.status,
        d.reason,
        d.external_reference as "externalReference",
        s.display_name as "skillName",
        s.organization_id::text as "publisherOrganizationId"
      from disputes d
      join transactions t on t.id = d.transaction_id
      left join skills s on s.id = t.skill_id
      where d.id = ${disputeId}
      limit 1
      for update of d
    `) as Array<{
      id: string;
      transactionId: string;
      amountCents: number;
      currency: string;
      status: DisputeStatus;
      reason: string | null;
      externalReference: string | null;
      skillName: string | null;
      publisherOrganizationId: string | null;
    }>;
    const dispute = disputeRows[0];

    if (!dispute) {
      throw new Error("Dispute not found.");
    }

    await tx`
      update disputes
      set
        status = ${status},
        reason = coalesce(${input.reason ?? null}, reason),
        resolved_at = ${status === "won" || status === "lost" ? tx`now()` : null},
        updated_at = now()
      where id = ${disputeId}
    `;

    let refundId: string | null = null;

    if (status === "lost" && input.postRefund === true) {
      refundId = await postDisputeLossRefund(tx, dispute, input.reason);
    }

    await recordFinanceAudit(tx, actorUserId, `dispute.${status}`, "dispute", disputeId, input.reason, {
      previousStatus: dispute.status,
      refundId
    });
    await recordFinanceNotification(tx, dispute.publisherOrganizationId, `billing.dispute.${status}`, `Dispute ${status}`, {
      disputeId,
      transactionId: dispute.transactionId,
      skillName: dispute.skillName,
      amountCents: dispute.amountCents,
      currency: dispute.currency,
      refundId
    });

    const rows = await listDisputeRows(tx, 1, { disputeId });
    return {
      ...rows[0],
      refundId
    };
  });
}

async function postDisputeLossRefund(
  tx: Sql,
  dispute: {
    id: string;
    transactionId: string;
    amountCents: number;
    currency: string;
    reason: string | null;
  },
  reason?: string
) {
  const existingRows = (await tx`
    select id::text
    from refunds
    where metadata->>'disputeId' = ${dispute.id}
      and status in ('requested', 'approved', 'posted')
    order by created_at desc
    limit 1
  `) as Array<{ id: string }>;

  if (existingRows[0]) {
    return existingRows[0].id;
  }

  const rows = (await tx`
    insert into refunds (
      transaction_id,
      amount_cents,
      currency,
      status,
      reason,
      metadata,
      updated_at
    )
    values (
      ${dispute.transactionId},
      ${dispute.amountCents},
      ${dispute.currency},
      'requested',
      ${reason ?? dispute.reason ?? "Dispute lost; refund adjustment required."},
      ${tx.json({ disputeId: dispute.id })},
      now()
    )
    returning id::text
  `) as Array<{ id: string }>;
  const refundId = rows[0].id;

  return refundId;
}

async function postRefundAdjustment(
  tx: Sql,
  refundId: string,
  reason: string | null | undefined,
  providerReference: string | null | undefined
) {
  const refund = await getRefundForPosting(tx, refundId);

  if (refund.adjustmentTransactionId) {
    return refund.adjustmentTransactionId;
  }

  const source = await getSourceTransaction(tx, refund.transactionId, true);
  const remainingCents = await getRefundableRemainingCents(tx, source.id, source.amountCents, refundId);

  if (refund.amountCents > remainingCents) {
    throw new Error("Refund amount exceeds remaining refundable transaction amount.");
  }

  const transactionRows = (await tx`
    insert into transactions (
      project_id,
      skill_id,
      price_id,
      source_type,
      amount_cents,
      currency,
      status
    )
    values (
      ${source.projectId},
      ${source.skillId},
      ${source.priceId},
      'refund',
      ${-refund.amountCents},
      ${refund.currency},
      'posted'
    )
    returning id::text
  `) as Array<{ id: string }>;
  const adjustmentTransactionId = transactionRows[0].id;
  let transactionSplitId: string | null = null;

  if (source.publisherProfileId) {
    const split = calculateRefundSplit(refund.amountCents, source);
    const splitRows = (await tx`
      insert into transaction_splits (
        transaction_id,
        commission_rule_id,
        publisher_profile_id,
        platform_fee_cents,
        publisher_share_cents,
        processing_fee_cents
      )
      values (
        ${adjustmentTransactionId},
        ${source.commissionRuleId},
        ${source.publisherProfileId},
        ${split.platformFeeCents},
        ${split.publisherShareCents},
        0
      )
      returning id::text
    `) as Array<{ id: string }>;
    transactionSplitId = splitRows[0].id;

    await tx`
      insert into publisher_balances (
        publisher_profile_id,
        transaction_split_id,
        amount_cents,
        currency,
        state,
        available_at
      )
      values (
        ${source.publisherProfileId},
        ${transactionSplitId},
        ${split.publisherShareCents},
        ${refund.currency},
        'reversed',
        now()
      )
    `;
  }

  await tx`
    update refunds
    set
      status = 'posted',
      adjustment_transaction_id = ${adjustmentTransactionId},
      reason = coalesce(${reason ?? null}, reason),
      provider_reference = coalesce(${providerReference ?? null}, provider_reference),
      decided_at = coalesce(decided_at, now()),
      posted_at = now(),
      updated_at = now()
    where id = ${refundId}
  `;

  await recordFinanceNotification(tx, source.publisherOrganizationId, "billing.refund_posted", "Refund posted", {
    refundId,
    transactionId: source.id,
    adjustmentTransactionId,
    transactionSplitId,
    skillName: source.skillName,
    amountCents: refund.amountCents,
    currency: refund.currency
  });

  return adjustmentTransactionId;
}

async function listRefundRows(sql: Sql, limit = 50, filter: AdjustmentListFilter = {}) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const refundId = filter.refundId ?? null;
  const publisherOrganizationId = filter.publisherOrganizationId ?? null;
  const projectOrganizationId = filter.projectOrganizationId ?? null;
  const projectSlug = filter.projectSlug ?? null;

  return sql`
    select
      r.id::text,
      r.transaction_id::text as "transactionId",
      r.adjustment_transaction_id::text as "adjustmentTransactionId",
      s.display_name as "skillName",
      p.slug as "projectSlug",
      r.amount_cents as "amountCents",
      r.currency,
      r.status,
      r.reason,
      r.provider_reference as "providerReference",
      r.created_at as "createdAt",
      r.requested_at as "requestedAt",
      r.decided_at as "decidedAt",
      r.posted_at as "postedAt"
    from refunds r
    left join transactions t on t.id = r.transaction_id
    left join skills s on s.id = t.skill_id
    left join projects p on p.id = t.project_id
    where (${refundId}::uuid is null or r.id = ${refundId})
      and (${publisherOrganizationId}::uuid is null or s.organization_id = ${publisherOrganizationId})
      and (${projectOrganizationId}::uuid is null or p.organization_id = ${projectOrganizationId})
      and (${projectSlug}::text is null or p.slug = ${projectSlug})
    order by r.created_at desc
    limit ${safeLimit}
  `;
}

async function listDisputeRows(sql: Sql, limit = 50, filter: AdjustmentListFilter = {}) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const disputeId = filter.disputeId ?? null;
  const publisherOrganizationId = filter.publisherOrganizationId ?? null;
  const projectOrganizationId = filter.projectOrganizationId ?? null;
  const projectSlug = filter.projectSlug ?? null;

  return sql`
    select
      d.id::text,
      d.transaction_id::text as "transactionId",
      s.display_name as "skillName",
      p.slug as "projectSlug",
      d.amount_cents as "amountCents",
      d.currency,
      d.status,
      d.reason,
      d.external_reference as "externalReference",
      d.due_at as "dueAt",
      d.resolved_at as "resolvedAt",
      d.created_at as "createdAt",
      d.updated_at as "updatedAt"
    from disputes d
    left join transactions t on t.id = d.transaction_id
    left join skills s on s.id = t.skill_id
    left join projects p on p.id = t.project_id
    where (${disputeId}::uuid is null or d.id = ${disputeId})
      and (${publisherOrganizationId}::uuid is null or s.organization_id = ${publisherOrganizationId})
      and (${projectOrganizationId}::uuid is null or p.organization_id = ${projectOrganizationId})
      and (${projectSlug}::text is null or p.slug = ${projectSlug})
    order by d.created_at desc
    limit ${safeLimit}
  `;
}

async function getRefundForPosting(sql: Sql, refundId: string): Promise<RefundForPosting> {
  const rows = (await sql`
    select
      id::text,
      transaction_id::text as "transactionId",
      amount_cents as "amountCents",
      currency,
      status,
      reason,
      provider_reference as "providerReference",
      adjustment_transaction_id::text as "adjustmentTransactionId"
    from refunds
    where id = ${refundId}
    limit 1
    for update
  `) as RefundForPosting[];
  const refund = rows[0];

  if (!refund) {
    throw new Error("Refund not found.");
  }

  if (!refund.transactionId) {
    throw new Error("Refund is not linked to a transaction.");
  }

  return refund;
}

async function getSourceTransaction(sql: Sql, transactionId: string, forUpdate = false): Promise<SourceTransaction> {
  const lock = forUpdate ? sql`for update of t` : sql``;
  const rows = (await sql`
    select
      t.id::text,
      t.project_id::text as "projectId",
      t.skill_id::text as "skillId",
      t.price_id::text as "priceId",
      s.display_name as "skillName",
      s.organization_id::text as "publisherOrganizationId",
      t.amount_cents as "amountCents",
      t.currency,
      t.status,
      t.source_type as "sourceType",
      ts.id::text as "splitId",
      ts.commission_rule_id::text as "commissionRuleId",
      ts.publisher_profile_id::text as "publisherProfileId",
      ts.platform_fee_cents as "platformFeeCents",
      ts.publisher_share_cents as "publisherShareCents"
    from transactions t
    left join skills s on s.id = t.skill_id
    left join transaction_splits ts on ts.transaction_id = t.id
    where t.id = ${transactionId}
    limit 1
    ${lock}
  `) as SourceTransaction[];
  const transaction = rows[0];

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  if (transaction.amountCents <= 0 || !["usage", "subscription"].includes(transaction.sourceType)) {
    throw new Error("Only positive usage or subscription transactions can be refunded or disputed.");
  }

  return transaction;
}

async function getRefundableRemainingCents(sql: Sql, transactionId: string, transactionAmountCents: number, exceptRefundId?: string) {
  const rows = (await sql`
    select coalesce(sum(amount_cents), 0)::int as "reservedCents"
    from refunds
    where transaction_id = ${transactionId}
      and status in ('requested', 'approved', 'posted')
      and (${exceptRefundId ?? null}::uuid is null or id <> ${exceptRefundId ?? null})
  `) as Array<{ reservedCents: number }>;
  const reservedCents = Number(rows[0]?.reservedCents ?? 0);

  return Math.max(transactionAmountCents - reservedCents, 0);
}

async function recordFinanceAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityType: "refund" | "dispute",
  entityId: string,
  reason: string | null | undefined,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, ${entityType}, ${entityId}, ${reason ?? null}, ${sql.json(metadata)})
  `;
}

async function recordFinanceNotification(
  sql: Sql,
  organizationId: string | null,
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
    throw new Error("DATABASE_URL is required for refund and dispute operations.");
  }

  return sql;
}

function calculateRefundSplit(refundAmountCents: number, source: SourceTransaction) {
  const originalPlatformFeeCents = Math.abs(Number(source.platformFeeCents ?? 0));
  const platformFeeCents =
    source.amountCents > 0 ? -Math.min(Math.floor((refundAmountCents * originalPlatformFeeCents) / source.amountCents), refundAmountCents) : 0;
  const publisherShareCents = -(refundAmountCents - Math.abs(platformFeeCents));

  return {
    platformFeeCents,
    publisherShareCents
  };
}

function normalizeAdjustmentAmount(amount: number | undefined, maxAmountCents: number, label: string) {
  const value = amount === undefined ? maxAmountCents : Math.trunc(Number(amount));

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} amountCents must be positive.`);
  }

  if (value > maxAmountCents) {
    throw new Error(`${label} amountCents exceeds the available transaction amount.`);
  }

  return value;
}

function requireId(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function ensureRefundStatus(status: RefundStatus, allowed: RefundStatus[], action: RefundAction) {
  if (!allowed.includes(status)) {
    throw new Error(`Cannot ${action} refund while status is ${status}.`);
  }
}
