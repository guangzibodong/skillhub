import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type NotificationRow = {
  id: string;
  eventType: string;
  channel: "email" | "in_app" | "webhook";
  deliveryAttempts?: number;
  deliveryProvider?: string | null;
  organizationId?: string | null;
  subject: string | null;
  error?: string | null;
  lastAttemptedAt?: string | null;
  nextAttemptAt?: string | null;
  payload?: Record<string, unknown>;
  providerMessageId?: string | null;
  status: "queued" | "sent" | "failed" | "skipped";
  createdAt: string;
  deliveredAt: string | null;
};

type NotificationDeliveryAction = "mark_failed" | "mark_sent" | "retry" | "skip";

type NotificationDeliveryActionInput = {
  action?: unknown;
  nextAttemptAt?: unknown;
  provider?: unknown;
  providerMessageId?: unknown;
  reason?: unknown;
};

type NotificationDeliveryProcessInput = {
  limit?: unknown;
  mode?: unknown;
};

type NotificationDeliveryProcessMode = "deliver" | "dry_run";

type ProcessedDeliveryOutcome = {
  action: Exclude<NotificationDeliveryAction, "retry">;
  nextAttemptAt: string | null;
  provider: string;
  providerMessageId: string | null;
  reason: string;
};

type NotificationDeliveryRuntimeEnv = {
  NODE_ENV?: string;
  RESEND_API_KEY?: string;
  SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
  SKILLHUB_EMAIL_FROM?: string;
  SKILLHUB_EMAIL_PROVIDER?: string;
  SKILLHUB_ENV?: string;
};

export type NotificationDeliveryRecord = {
  id: string;
  eventType: string;
  channel: "email" | "webhook";
  deliveryAttempts: number;
  deliveryProvider: string | null;
  deliveredAt: string | null;
  error: string | null;
  lastAttemptedAt: string | null;
  nextAttemptAt: string | null;
  payloadSummary: Record<string, unknown>;
  providerMessageId: string | null;
  status: "queued" | "sent" | "failed" | "skipped";
  subject: string | null;
  createdAt: string;
};

export type NotificationDeliveryProcessItem = {
  id: string;
  channel: "email" | "webhook";
  eventType: string;
  provider: string;
  status: "delivered" | "failed" | "pending" | "skipped" | "would_deliver" | "would_fail" | "would_skip";
  message: string;
  providerMessageId: string | null;
};

export type NotificationDeliveryProcessResult = {
  deliveredCount: number;
  failedCount: number;
  mode: NotificationDeliveryProcessMode;
  pendingCount: number;
  processed: NotificationDeliveryProcessItem[];
  processedCount: number;
  skippedCount: number;
};

type NotificationTopicSummary = {
  topic: string;
  count: number;
  unreadCount: number;
};

type NotificationSummary = {
  failed: number;
  read: number;
  skipped: number;
  topics: NotificationTopicSummary[];
  total: number;
  unread: number;
};

const fallbackUserNotifications: NotificationRow[] = [
  {
    id: "demo-buyer-request-claimed",
    eventType: "buyer_request.claimed",
    channel: "in_app",
    subject: "Your buyer request was claimed",
    payload: {
      title: "Figma change request to Linear issue",
      requestId: "demo-request-figma-linear"
    },
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  },
  {
    id: "demo-skill-update",
    eventType: "skill.update",
    channel: "in_app",
    subject: "New citation freshness scoring available",
    payload: {
      projectSlug: "research-agent",
      skillSlug: "browser-research"
    },
    status: "sent",
    createdAt: "demo",
    deliveredAt: "demo"
  },
  {
    id: "demo-payout-review",
    eventType: "publisher.payout",
    channel: "in_app",
    subject: "Payout request entered review",
    payload: {
      amountCents: 480000,
      currency: "usd"
    },
    status: "queued",
    createdAt: "demo",
    deliveredAt: null
  }
];

const fallbackAdminDeliveryQueue: NotificationDeliveryRecord[] = [
  {
    id: "demo-email-code",
    eventType: "auth.email.code.requested",
    channel: "email",
    deliveryAttempts: 0,
    deliveryProvider: "provider_deferred",
    deliveredAt: null,
    error: null,
    lastAttemptedAt: null,
    nextAttemptAt: null,
    payloadSummary: {
      challengeId: "demo-email-challenge",
      code: "[redacted]",
      email: "builder@example.com",
      mode: "signup"
    },
    providerMessageId: null,
    status: "queued",
    subject: "SkillHub verification code",
    createdAt: "demo"
  },
  {
    id: "demo-webhook-delivery",
    eventType: "runtime.incident.opened",
    channel: "webhook",
    deliveryAttempts: 2,
    deliveryProvider: "webhook_worker",
    deliveredAt: null,
    error: "Endpoint returned 503.",
    lastAttemptedAt: "demo",
    nextAttemptAt: "demo",
    payloadSummary: {
      incidentId: "demo-incident",
      skillSlug: "browser-research"
    },
    providerMessageId: "demo-msg-503",
    status: "failed",
    subject: "Runtime incident opened",
    createdAt: "demo"
  }
];

export async function listUserNotificationInbox(userId: string, organizationId: string | null | undefined, limit = 25) {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    const notifications = fallbackUserNotifications.slice(0, safeLimit);
    return {
      notifications,
      summary: summarizeNotifications(fallbackUserNotifications)
    };
  }

  return {
    notifications: await listUserNotificationsWithSql(sql, userId, organizationId, safeLimit),
    summary: await getUserNotificationSummary(sql, userId, organizationId)
  };
}

export async function listAdminNotifications(limit = 25) {
  const sql = await getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);

  if (!sql) {
    return [
      {
        id: "demo-billing-posted",
        eventType: "billing.usage_posted",
        channel: "in_app",
        subject: "Billable usage posted to ledger",
        status: "queued",
        createdAt: "demo",
        deliveredAt: null
      },
      {
        id: "demo-review-approved",
        eventType: "skill.review.approved",
        channel: "in_app",
        subject: "Skill review approved",
        status: "queued",
        createdAt: "demo",
        deliveredAt: null
      }
    ];
  }

  return sql`
    select
      id::text,
      event_type as "eventType",
      channel,
      subject,
      status,
      created_at as "createdAt",
      delivered_at as "deliveredAt"
    from notification_events
    order by created_at desc
    limit ${safeLimit}
  `;
}

export async function listAdminNotificationDeliveries(
  limit = 25,
  options: { channel?: string | null; status?: string | null } = {}
) {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    return fallbackAdminDeliveryQueue.slice(0, safeLimit);
  }

  const channel = normalizeOptionalDeliveryChannel(options.channel);
  const status = normalizeOptionalDeliveryStatus(options.status);
  const rows = (await sql`
    select
      id::text,
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      error,
      delivery_attempts as "deliveryAttempts",
      last_attempted_at as "lastAttemptedAt",
      next_attempt_at as "nextAttemptAt",
      delivery_provider as "deliveryProvider",
      provider_message_id as "providerMessageId",
      created_at as "createdAt",
      delivered_at as "deliveredAt"
    from notification_events
    where channel in ('email', 'webhook')
      and (${channel}::text is null or channel = ${channel})
      and (${status}::text is null or status = ${status})
    order by
      case status
        when 'failed' then 0
        when 'queued' then 1
        when 'skipped' then 2
        else 3
      end,
      coalesce(next_attempt_at, created_at) asc,
      created_at desc
    limit ${safeLimit}
  `) as NotificationRow[];

  return rows.map(toDeliveryRecord);
}

export async function decideNotificationDelivery(
  notificationId: string,
  input: NotificationDeliveryActionInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const id = normalizeUuid(notificationId);
  const action = normalizeDeliveryAction(input.action);
  const reason = normalizeDeliveryReason(input.reason, action);
  const provider = normalizeProvider(input.provider);
  const providerMessageId = normalizeProviderMessageId(input.providerMessageId, action);
  const nextAttemptAt = normalizeNextAttemptAt(input.nextAttemptAt, action);
  const nextStatus = statusForDeliveryAction(action);

  return sql.begin(async (tx: Sql) => {
    const previousRows = (await tx`
      select
        id::text,
        event_type as "eventType",
        channel,
        subject,
        payload,
        status,
        error,
        delivery_attempts as "deliveryAttempts",
        last_attempted_at as "lastAttemptedAt",
        next_attempt_at as "nextAttemptAt",
        delivery_provider as "deliveryProvider",
        provider_message_id as "providerMessageId",
        created_at as "createdAt",
        delivered_at as "deliveredAt"
      from notification_events
      where id = ${id}
        and channel in ('email', 'webhook')
      for update
    `) as NotificationRow[];
    const previous = previousRows[0];

    if (!previous) {
      throw new Error("External notification delivery event was not found.");
    }

    const rows = (await tx`
      update notification_events
      set
        status = ${nextStatus},
        error = ${action === "mark_failed" || action === "skip" ? reason : null},
        delivery_attempts = delivery_attempts + ${action === "mark_sent" || action === "mark_failed" ? 1 : 0},
        last_attempted_at = ${action === "retry" ? null : sql`now()`},
        next_attempt_at = ${action === "retry" ? nextAttemptAt : null},
        delivered_at = ${action === "mark_sent" ? sql`now()` : null},
        delivery_provider = ${action === "mark_sent" || action === "mark_failed" ? provider : previous.deliveryProvider ?? null},
        provider_message_id = ${action === "mark_sent" || action === "mark_failed" ? providerMessageId : null}
      where id = ${id}
      returning
        id::text,
        event_type as "eventType",
        channel,
        subject,
        payload,
        status,
        error,
        delivery_attempts as "deliveryAttempts",
        last_attempted_at as "lastAttemptedAt",
        next_attempt_at as "nextAttemptAt",
        delivery_provider as "deliveryProvider",
        provider_message_id as "providerMessageId",
        created_at as "createdAt",
        delivered_at as "deliveredAt"
    `) as NotificationRow[];
    const notification = rows[0];

    await syncEmailChallengeDeliveryStatus(tx, notification);

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        ${`notification.delivery.${action}`},
        'notification_event',
        ${notification.id},
        ${reason},
        ${tx.json({
          channel: notification.channel,
          deliveryAttempts: notification.deliveryAttempts ?? 0,
          eventType: notification.eventType,
          nextAttemptAt: notification.nextAttemptAt,
          nextStatus: notification.status,
          previousStatus: previous.status,
          provider: notification.deliveryProvider,
          providerMessageId: notification.providerMessageId
        })}
      )
    `;
    await tx`
      insert into notification_events (event_type, channel, subject, payload, status)
      values (
        'platform.notification_delivery.updated',
        'in_app',
        'Notification delivery updated',
        ${tx.json({
          action,
          channel: notification.channel,
          eventType: notification.eventType,
          notificationId: notification.id,
          status: notification.status
        })},
        'queued'
      )
    `;

    return toDeliveryRecord(notification);
  });
}

export async function processNotificationDeliveries(
  input: NotificationDeliveryProcessInput = {},
  env?: NotificationDeliveryRuntimeEnv,
  actorUserId?: string | null
): Promise<NotificationDeliveryProcessResult> {
  const sql = await requireSql();
  const limit = Math.min(Math.max(Math.trunc(Number(input.limit) || 10), 1), 50);
  const mode = normalizeProcessMode(input.mode);
  const rows = (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      error,
      delivery_attempts as "deliveryAttempts",
      last_attempted_at as "lastAttemptedAt",
      next_attempt_at as "nextAttemptAt",
      delivery_provider as "deliveryProvider",
      provider_message_id as "providerMessageId",
      created_at as "createdAt",
      delivered_at as "deliveredAt"
    from notification_events
    where channel in ('email', 'webhook')
      and status in ('queued', 'failed')
      and (next_attempt_at is null or next_attempt_at <= now())
    order by
      case status when 'failed' then 0 else 1 end,
      coalesce(next_attempt_at, created_at) asc,
      created_at asc
    limit ${limit}
  `) as NotificationRow[];

  const processed: NotificationDeliveryProcessItem[] = [];

  for (const row of rows) {
    const outcome =
      row.channel === "email"
        ? await processEmailDelivery(row, env, mode)
        : await processWebhookDelivery(sql, row, mode);

    if (mode === "deliver") {
      await applyProcessedDeliveryOutcome(sql, row, outcome);
    }

    processed.push({
      id: row.id,
      channel: row.channel as "email" | "webhook",
      eventType: row.eventType,
      provider: outcome.provider,
      status: mode === "dry_run" ? dryRunStatus(outcome.action) : deliveredStatus(outcome.action),
      message: outcome.reason,
      providerMessageId: outcome.providerMessageId
    });
  }

  if (processed.length > 0 && mode === "deliver") {
    await recordDeliveryProcessAudit(sql, actorUserId, processed);
  }

  return summarizeProcessResult(mode, processed);
}

export async function listUserNotifications(userId: string, organizationId: string | null | undefined, limit = 25) {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    return fallbackUserNotifications.slice(0, safeLimit);
  }

  return listUserNotificationsWithSql(sql, userId, organizationId, safeLimit);
}

export async function markAllUserNotificationsRead(userId: string, organizationId: string | null | undefined) {
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    with updated as (
      update notification_events
      set
        status = 'sent',
        delivered_at = coalesce(delivered_at, now())
      where channel = 'in_app'
        and status = 'queued'
        and (
          user_id = ${userId}
          or (${scopedOrganizationId}::uuid is not null and organization_id = ${scopedOrganizationId})
        )
      returning id
    )
    select count(*)::int as "updatedCount"
    from updated
  `) as Array<{ updatedCount: number }>;

  return {
    summary: await getUserNotificationSummary(sql, userId, organizationId),
    updatedCount: rows[0]?.updatedCount ?? 0
  };
}

async function listUserNotificationsWithSql(sql: Sql, userId: string, organizationId: string | null | undefined, limit: number) {
  const scopedOrganizationId = organizationId ?? null;

  return sql`
    select
      id::text,
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      created_at as "createdAt",
      delivered_at as "deliveredAt"
    from notification_events
    where channel = 'in_app'
      and (
        user_id = ${userId}
        or (${scopedOrganizationId}::uuid is not null and organization_id = ${scopedOrganizationId})
      )
    order by
      case status when 'queued' then 0 else 1 end,
      created_at desc
    limit ${limit}
  `;
}

async function getUserNotificationSummary(
  sql: Sql,
  userId: string,
  organizationId: string | null | undefined
): Promise<NotificationSummary> {
  const scopedOrganizationId = organizationId ?? null;
  const summaryRows = (await sql`
    select
      count(*)::int as total,
      count(*) filter (where status = 'queued')::int as unread,
      count(*) filter (where status = 'sent')::int as read,
      count(*) filter (where status = 'failed')::int as failed,
      count(*) filter (where status = 'skipped')::int as skipped
    from notification_events
    where channel = 'in_app'
      and (
        user_id = ${userId}
        or (${scopedOrganizationId}::uuid is not null and organization_id = ${scopedOrganizationId})
      )
  `) as Array<Omit<NotificationSummary, "topics">>;
  const topicRows = (await sql`
    select
      case
        when event_type like '%buyer_request%' or event_type like '%buyer.request%' then 'buyer'
        when event_type like '%payout%' then 'payout'
        when event_type like '%billing%' or event_type like '%invoice%' or event_type like '%refund%' or event_type like '%dispute%' then 'billing'
        when event_type like '%review%' or event_type like '%feedback%' then 'review'
        when event_type like '%runtime%' or event_type like '%incident%' then 'runtime'
        when event_type like '%trust%' or event_type like '%abuse%' then 'trust'
        when event_type like '%account%' or event_type like '%api_key%' then 'account'
        else 'skill'
      end as topic,
      count(*)::int as count,
      count(*) filter (where status = 'queued')::int as "unreadCount"
    from notification_events
    where channel = 'in_app'
      and (
        user_id = ${userId}
        or (${scopedOrganizationId}::uuid is not null and organization_id = ${scopedOrganizationId})
      )
    group by 1
    order by "unreadCount" desc, count desc, topic asc
  `) as NotificationTopicSummary[];

  return {
    failed: summaryRows[0]?.failed ?? 0,
    read: summaryRows[0]?.read ?? 0,
    skipped: summaryRows[0]?.skipped ?? 0,
    topics: topicRows,
    total: summaryRows[0]?.total ?? 0,
    unread: summaryRows[0]?.unread ?? 0
  };
}

export async function markUserNotificationRead(
  userId: string,
  organizationId: string | null | undefined,
  notificationId: string
) {
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;
  const rows = (await sql`
    update notification_events
    set
      status = 'sent',
      delivered_at = coalesce(delivered_at, now())
    where id = ${notificationId}
      and channel = 'in_app'
      and status in ('queued', 'sent')
      and (
        user_id = ${userId}
        or (${scopedOrganizationId}::uuid is not null and organization_id = ${scopedOrganizationId})
      )
    returning
      id::text,
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      created_at as "createdAt",
      delivered_at as "deliveredAt"
  `) as NotificationRow[];
  const notification = rows[0];

  if (!notification) {
    throw new Error("Notification not found or already closed.");
  }

  return notification;
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(Number(limit) || 25), 1), 100);
}

function normalizeProcessMode(value: unknown): NotificationDeliveryProcessMode {
  const mode = String(value ?? "deliver").trim();

  if (mode === "deliver" || mode === "dry_run") {
    return mode;
  }

  throw new Error("Notification delivery process mode must be deliver or dry_run.");
}

async function processEmailDelivery(
  row: NotificationRow,
  env: NotificationDeliveryRuntimeEnv | undefined,
  mode: NotificationDeliveryProcessMode
): Promise<ProcessedDeliveryOutcome> {
  const provider = normalizeEmailProvider(env);
  const recipient = getPayloadText(row.payload, "email") ?? getPayloadText(row.payload, "to");

  if (!recipient) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: "Email delivery payload is missing a recipient email."
    };
  }

  if (provider === "debug_preview") {
    return {
      action: "mark_sent",
      nextAttemptAt: null,
      provider,
      providerMessageId: `debug_${row.id.slice(0, 8)}`,
      reason: "Debug email delivery mode recorded the event as sent without contacting a provider."
    };
  }

  if (provider !== "resend") {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: "Email provider is not configured. Set SKILLHUB_EMAIL_PROVIDER=resend, RESEND_API_KEY, and SKILLHUB_EMAIL_FROM."
    };
  }

  const apiKey = getRuntimeEnv(env, "RESEND_API_KEY");
  const from = getRuntimeEnv(env, "SKILLHUB_EMAIL_FROM");

  if (!apiKey || !from) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: "Resend delivery requires RESEND_API_KEY and SKILLHUB_EMAIL_FROM."
    };
  }

  if (mode === "dry_run") {
    return {
      action: "mark_sent",
      nextAttemptAt: null,
      provider,
      providerMessageId: "dry_run",
      reason: `Resend is configured and would send email to ${recipient}.`
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      subject: row.subject ?? "SkillHub notification",
      text: renderEmailText(row),
      to: [recipient]
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

  if (!response.ok) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: `Resend returned ${response.status}: ${payload.message ?? "delivery failed"}.`
    };
  }

  return {
    action: "mark_sent",
    nextAttemptAt: null,
    provider,
    providerMessageId: payload.id ?? `resend_${row.id.slice(0, 8)}`,
    reason: "Email delivered through Resend."
  };
}

async function processWebhookDelivery(
  sql: Sql,
  row: NotificationRow,
  mode: NotificationDeliveryProcessMode
): Promise<ProcessedDeliveryOutcome> {
  const organizationId = row.organizationId ?? null;
  const provider = "webhook_outbox";

  if (!organizationId) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: "Webhook delivery requires an organization-scoped notification event."
    };
  }

  const topic = webhookTopicForEventType(row.eventType);
  const endpoints = (await sql`
    select
      id::text,
      url
    from organization_webhook_endpoints
    where organization_id = ${organizationId}
      and status = 'active'
      and (${row.eventType} = any(events) or ${topic} = any(events))
    order by updated_at desc
    limit 20
  `) as Array<{ id: string; url: string }>;

  if (endpoints.length === 0) {
    return {
      action: "skip",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: `No active webhook endpoint is subscribed to ${topic}.`
    };
  }

  if (mode === "dry_run") {
    return {
      action: "mark_sent",
      nextAttemptAt: null,
      provider,
      providerMessageId: "dry_run",
      reason: `Would enqueue ${endpoints.length} webhook outbox delivery event(s) for ${topic}.`
    };
  }

  for (const endpoint of endpoints) {
    await sql`
      insert into webhook_delivery_events (
        organization_id,
        endpoint_id,
        event_type,
        payload,
        status,
        attempt_count,
        next_attempt_at
      )
      values (
        ${organizationId},
        ${endpoint.id},
        ${row.eventType},
        ${sql.json({
          notificationEventId: row.id,
          payload: row.payload ?? {}
        })},
        'pending',
        0,
        now()
      )
    `;
    await sql`
      update organization_webhook_endpoints
      set
        last_delivery_status = 'pending',
        updated_at = now()
      where id = ${endpoint.id}
    `;
  }

  return {
    action: "mark_sent",
    nextAttemptAt: null,
    provider,
    providerMessageId: `outbox_${endpoints.length}`,
    reason: `Queued ${endpoints.length} webhook outbox delivery event(s) for ${topic}.`
  };
}

async function applyProcessedDeliveryOutcome(sql: Sql, row: NotificationRow, outcome: ProcessedDeliveryOutcome) {
  const nextStatus = statusForDeliveryAction(outcome.action);
  const rows = (await sql`
    update notification_events
    set
      status = ${nextStatus},
      error = ${outcome.action === "mark_failed" || outcome.action === "skip" ? outcome.reason : null},
      delivery_attempts = delivery_attempts + 1,
      last_attempted_at = now(),
      next_attempt_at = ${outcome.nextAttemptAt},
      delivered_at = ${outcome.action === "mark_sent" ? sql`now()` : null},
      delivery_provider = ${outcome.provider},
      provider_message_id = ${outcome.providerMessageId}
    where id = ${row.id}
      and channel in ('email', 'webhook')
      and status in ('queued', 'failed')
    returning
      id::text,
      organization_id::text as "organizationId",
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      error,
      delivery_attempts as "deliveryAttempts",
      last_attempted_at as "lastAttemptedAt",
      next_attempt_at as "nextAttemptAt",
      delivery_provider as "deliveryProvider",
      provider_message_id as "providerMessageId",
      created_at as "createdAt",
      delivered_at as "deliveredAt"
  `) as NotificationRow[];

  if (rows[0]) {
    await syncEmailChallengeDeliveryStatus(sql, rows[0]);
  }
}

async function recordDeliveryProcessAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  processed: NotificationDeliveryProcessItem[]
) {
  const summary = summarizeProcessedItems(processed);

  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${actorUserId ?? null},
      'notification.delivery.processed',
      'notification_event',
      null,
      'External notification delivery batch processed.',
      ${sql.json(summary)}
    )
  `;
  await sql`
    insert into notification_events (event_type, channel, subject, payload, status)
    values (
      'platform.notification_delivery.processed',
      'in_app',
      'Notification delivery batch processed',
      ${sql.json(summary)},
      'queued'
    )
  `;
}

function summarizeProcessResult(
  mode: NotificationDeliveryProcessMode,
  processed: NotificationDeliveryProcessItem[]
): NotificationDeliveryProcessResult {
  const summary = summarizeProcessedItems(processed);

  return {
    deliveredCount: summary.deliveredCount,
    failedCount: summary.failedCount,
    mode,
    pendingCount: summary.pendingCount,
    processed,
    processedCount: processed.length,
    skippedCount: summary.skippedCount
  };
}

function summarizeProcessedItems(processed: NotificationDeliveryProcessItem[]) {
  return {
    deliveredCount: processed.filter((item) => item.status === "delivered" || item.status === "would_deliver").length,
    failedCount: processed.filter((item) => item.status === "failed" || item.status === "would_fail").length,
    pendingCount: processed.filter((item) => item.status === "pending").length,
    processedCount: processed.length,
    skippedCount: processed.filter((item) => item.status === "skipped" || item.status === "would_skip").length
  };
}

function dryRunStatus(action: ProcessedDeliveryOutcome["action"]): NotificationDeliveryProcessItem["status"] {
  if (action === "mark_sent") {
    return "would_deliver";
  }

  if (action === "mark_failed") {
    return "would_fail";
  }

  return "would_skip";
}

function deliveredStatus(action: ProcessedDeliveryOutcome["action"]): NotificationDeliveryProcessItem["status"] {
  if (action === "mark_sent") {
    return "delivered";
  }

  if (action === "mark_failed") {
    return "failed";
  }

  return "skipped";
}

function normalizeEmailProvider(env: NotificationDeliveryRuntimeEnv | undefined) {
  const configuredProvider = getRuntimeEnv(env, "SKILLHUB_EMAIL_PROVIDER")
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_");

  if (configuredProvider) {
    return configuredProvider;
  }

  if (!isProductionLike(env) && isTruthy(getRuntimeEnv(env, "SKILLHUB_EMAIL_AUTH_DEBUG_CODES"))) {
    return "debug_preview";
  }

  return "provider_deferred";
}

function renderEmailText(row: NotificationRow) {
  if (row.eventType === "auth.email.code.requested") {
    const code = getPayloadText(row.payload, "code") ?? "------";
    const mode = getPayloadText(row.payload, "mode") ?? "login";
    const expiresAt = getPayloadText(row.payload, "expiresAt") ?? "soon";

    return [
      `Your SkillHub ${mode} verification code is ${code}.`,
      "",
      `This code expires at ${expiresAt}.`,
      "If you did not request this code, you can ignore this message."
    ].join("\n");
  }

  return [
    row.subject ?? "SkillHub notification",
    "",
    "Event payload:",
    JSON.stringify(summarizePayload(row.payload), null, 2)
  ].join("\n");
}

function webhookTopicForEventType(eventType: string) {
  if (eventType.includes("buyer_request") || eventType.includes("buyer.request")) {
    return "buyer.request";
  }

  if (eventType.includes("payout")) {
    return "publisher.payout";
  }

  if (eventType.includes("billing") || eventType.includes("invoice") || eventType.includes("refund") || eventType.includes("dispute")) {
    return "finance.billing";
  }

  if (eventType.includes("review") || eventType.includes("feedback")) {
    return "skill.review";
  }

  if (eventType.includes("runtime") || eventType.includes("incident")) {
    return "runtime.incident";
  }

  if (eventType.includes("account") || eventType.includes("api_key")) {
    return "account.security";
  }

  return "skill.update";
}

function getRuntimeEnv(env: NotificationDeliveryRuntimeEnv | undefined, key: keyof NotificationDeliveryRuntimeEnv) {
  return env?.[key] ?? getProcessEnv(String(key));
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}

function isProductionLike(env: NotificationDeliveryRuntimeEnv | undefined) {
  return getRuntimeEnv(env, "SKILLHUB_ENV") === "production" || getRuntimeEnv(env, "NODE_ENV") === "production";
}

function isTruthy(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function normalizeOptionalDeliveryChannel(value: string | null | undefined) {
  const channel = String(value ?? "").trim();

  if (!channel) {
    return null;
  }

  if (channel !== "email" && channel !== "webhook") {
    throw new Error("Delivery channel must be email or webhook.");
  }

  return channel;
}

function normalizeOptionalDeliveryStatus(value: string | null | undefined) {
  const status = String(value ?? "").trim();

  if (!status) {
    return null;
  }

  if (status !== "queued" && status !== "sent" && status !== "failed" && status !== "skipped") {
    throw new Error("Delivery status must be queued, sent, failed, or skipped.");
  }

  return status;
}

function normalizeDeliveryAction(value: unknown): NotificationDeliveryAction {
  const action = String(value ?? "").trim();

  if (action === "mark_failed" || action === "mark_sent" || action === "retry" || action === "skip") {
    return action;
  }

  throw new Error("Delivery action must be mark_sent, mark_failed, retry, or skip.");
}

function normalizeDeliveryReason(value: unknown, action: NotificationDeliveryAction) {
  const reason = String(value ?? "").trim();

  if (reason.length < 3) {
    throw new Error(`A reason is required before ${action.replace("_", " ")}.`);
  }

  return reason.slice(0, 500);
}

function normalizeProvider(value: unknown) {
  const provider = String(value ?? "provider_deferred")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_");

  return (provider || "provider_deferred").slice(0, 80);
}

function normalizeProviderMessageId(value: unknown, action: NotificationDeliveryAction) {
  const messageId = String(value ?? "").trim();

  if (messageId) {
    return messageId.slice(0, 160);
  }

  return action === "mark_sent" ? `manual_${Date.now().toString(36)}` : null;
}

function normalizeNextAttemptAt(value: unknown, action: NotificationDeliveryAction) {
  if (action !== "retry") {
    return null;
  }

  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return new Date().toISOString();
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("nextAttemptAt must be a valid ISO timestamp.");
  }

  return date.toISOString();
}

function normalizeUuid(value: string) {
  const id = value.trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Notification id must be a valid UUID.");
  }

  return id;
}

function statusForDeliveryAction(action: NotificationDeliveryAction): NotificationRow["status"] {
  if (action === "mark_sent") {
    return "sent";
  }

  if (action === "mark_failed") {
    return "failed";
  }

  if (action === "skip") {
    return "skipped";
  }

  return "queued";
}

async function syncEmailChallengeDeliveryStatus(sql: Sql, notification: NotificationRow) {
  if (notification.eventType !== "auth.email.code.requested") {
    return;
  }

  const challengeId = getPayloadText(notification.payload, "challengeId");

  if (!challengeId || !isUuid(challengeId)) {
    return;
  }

  await sql`
    update email_login_challenges
    set
      delivery_status = ${notification.status},
      updated_at = now(),
      metadata = metadata || ${sql.json({
        deliveryAttempts: notification.deliveryAttempts ?? 0,
        deliveryNotificationId: notification.id,
        deliveryProvider: notification.deliveryProvider,
        lastDeliveryStatus: notification.status
      })}::jsonb
    where id = ${challengeId}
  `;
}

function toDeliveryRecord(row: NotificationRow): NotificationDeliveryRecord {
  if (row.channel !== "email" && row.channel !== "webhook") {
    throw new Error("Only email and webhook notification events can be listed as delivery records.");
  }

  return {
    id: row.id,
    eventType: row.eventType,
    channel: row.channel,
    deliveryAttempts: row.deliveryAttempts ?? 0,
    deliveryProvider: row.deliveryProvider ?? null,
    deliveredAt: row.deliveredAt,
    error: row.error ?? null,
    lastAttemptedAt: row.lastAttemptedAt ?? null,
    nextAttemptAt: row.nextAttemptAt ?? null,
    payloadSummary: summarizePayload(row.payload),
    providerMessageId: row.providerMessageId ?? null,
    status: row.status,
    subject: row.subject,
    createdAt: row.createdAt
  };
}

function summarizePayload(payload: Record<string, unknown> | undefined) {
  const summary: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload ?? {})) {
    if (isSensitivePayloadKey(key)) {
      summary[key] = "[redacted]";
    } else if (typeof value === "string") {
      summary[key] = value.length > 140 ? `${value.slice(0, 137)}...` : value;
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      summary[key] = value;
    } else if (Array.isArray(value)) {
      summary[key] = `[${value.length} items]`;
    } else if (typeof value === "object") {
      summary[key] = "[object]";
    }
  }

  return summary;
}

function isSensitivePayloadKey(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes("code") || normalized.includes("token") || normalized.includes("secret");
}

function getPayloadText(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "string" ? value : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function summarizeNotifications(notifications: NotificationRow[]): NotificationSummary {
  const topics = new Map<string, NotificationTopicSummary>();
  const summary: NotificationSummary = {
    failed: 0,
    read: 0,
    skipped: 0,
    topics: [],
    total: notifications.length,
    unread: 0
  };

  for (const notification of notifications) {
    if (notification.status === "queued") {
      summary.unread += 1;
    } else if (notification.status === "sent") {
      summary.read += 1;
    } else if (notification.status === "failed") {
      summary.failed += 1;
    } else if (notification.status === "skipped") {
      summary.skipped += 1;
    }

    const topic = topicFromEventType(notification.eventType);
    const current = topics.get(topic) ?? {
      count: 0,
      topic,
      unreadCount: 0
    };
    current.count += 1;
    current.unreadCount += notification.status === "queued" ? 1 : 0;
    topics.set(topic, current);
  }

  summary.topics = Array.from(topics.values()).sort(
    (first, second) => second.unreadCount - first.unreadCount || second.count - first.count || first.topic.localeCompare(second.topic)
  );

  return summary;
}

function topicFromEventType(eventType: string) {
  if (eventType.includes("buyer_request") || eventType.includes("buyer.request")) {
    return "buyer";
  }

  if (eventType.includes("payout")) {
    return "payout";
  }

  if (eventType.includes("billing") || eventType.includes("invoice") || eventType.includes("refund") || eventType.includes("dispute")) {
    return "billing";
  }

  if (eventType.includes("review") || eventType.includes("feedback")) {
    return "review";
  }

  if (eventType.includes("runtime") || eventType.includes("incident")) {
    return "runtime";
  }

  if (eventType.includes("trust") || eventType.includes("abuse")) {
    return "trust";
  }

  if (eventType.includes("account") || eventType.includes("api_key")) {
    return "account";
  }

  return "skill";
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for notification operations.");
  }

  return sql;
}
