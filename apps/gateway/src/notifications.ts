import { getSql } from "./registry.js";
import {
  resolveEmailProviderConfig,
  type PlatformConfigEnv,
} from "./platform-config.js";

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
  userId?: string | null;
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
  confirmation?: unknown;
  limit?: unknown;
  mode?: unknown;
};

type PlatformTestEmailInput = {
  to?: unknown;
};

type NotificationDeliveryProcessMode = "deliver" | "dry_run";

type ProcessedDeliveryOutcome = {
  action: Exclude<NotificationDeliveryAction, "retry">;
  nextAttemptAt: string | null;
  provider: string;
  providerMessageId: string | null;
  reason: string;
};

type NotificationFanoutSummary = {
  createdCount: number;
  emailCount: number;
  sourceCount: number;
  webhookCount: number;
};

type NotificationDeliveryRuntimeEnv = PlatformConfigEnv & {
  NODE_ENV?: string;
  RESEND_API_KEY?: string;
  SKILLHUB_EMAIL_AUTH_DEBUG_CODES?: string;
  SKILLHUB_EMAIL_FROM?: string;
  SKILLHUB_EMAIL_PROVIDER?: string;
  SKILLHUB_SMTP_HOST?: string;
  SKILLHUB_SMTP_PASSWORD?: string;
  SKILLHUB_SMTP_PORT?: string;
  SKILLHUB_SMTP_SECURE?: string;
  SKILLHUB_SMTP_USER?: string;
  SKILLHUB_ENV?: string;
  VERCEL_ENV?: string;
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
  fanoutCount: number;
  fanoutEmailCount: number;
  fanoutMode: "created" | "preview";
  fanoutSourceCount: number;
  fanoutWebhookCount: number;
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

export async function listUserNotificationInbox(userId: string, organizationId: string | null | undefined, limit = 25) {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    return {
      notifications: [],
      summary: summarizeNotifications([])
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
    return [];
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
    return [];
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
    ensureDeliveryTransition(previous.status, action);

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
        provider_message_id = ${action === "mark_sent" || action === "mark_failed" ? providerMessageId : null},
        payload = case
          when ${action === "mark_sent"} and event_type = 'auth.email.code.requested'
            then coalesce(payload, '{}'::jsonb) - 'code'
          else payload
        end
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
  requireDeliverConfirmation(mode, input.confirmation);
  const fanout =
    mode === "deliver"
      ? await fanOutExternalNotificationEvents(sql, limit)
      : await previewExternalNotificationFanout(sql, limit);
  const rows = (await sql`
    select
      id::text,
      user_id::text as "userId",
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
        ? await processEmailDelivery(sql, row, env, mode)
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

  if ((processed.length > 0 || fanout.createdCount > 0) && mode === "deliver") {
    await recordDeliveryProcessAudit(sql, actorUserId, processed, fanout);
  }

  return summarizeProcessResult(mode, processed, fanout);
}

export async function sendPlatformTestEmail(
  input: PlatformTestEmailInput,
  env?: NotificationDeliveryRuntimeEnv,
  actorUserId?: string | null
) {
  const sql = await requireSql();
  const to = normalizeEmailAddress(String(input.to ?? ""));
  const row: NotificationRow = {
    id: `test-${Date.now()}`,
    channel: "email",
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    eventType: "platform.email.test",
    payload: {
      email: to,
      to
    },
    status: "queued",
    subject: "SkillHub test email"
  };
  const emailConfig = await resolveEmailProviderConfig(env, { includeSecrets: false });

  if (emailConfig.status !== "active" || emailConfig.provider === "unconfigured") {
    throw new Error("Email provider is not configured in admin platform settings.");
  }

  const outcome = await processEmailDelivery(sql, row, env, "deliver");

  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${actorUserId ?? null},
      'platform_config.email.test',
      'platform_provider_config',
      'email',
      ${outcome.action === "mark_sent" ? "Platform email test sent." : "Platform email test failed."},
      ${sql.json({
        provider: outcome.provider,
        providerMessageId: outcome.providerMessageId,
        status: outcome.action === "mark_sent" ? "sent" : "failed"
      })}
    )
  `;

  if (outcome.action !== "mark_sent") {
    throw new Error(outcome.reason);
  }

  return {
    provider: outcome.provider,
    providerMessageId: outcome.providerMessageId,
    status: "sent"
  };
}

export async function listUserNotifications(userId: string, organizationId: string | null | undefined, limit = 25) {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    return [];
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

async function fanOutExternalNotificationEvents(sql: Sql, limit: number): Promise<NotificationFanoutSummary> {
  const sources = await selectFanoutSources(sql, limit);
  const summary: NotificationFanoutSummary = {
    createdCount: 0,
    emailCount: 0,
    sourceCount: sources.length,
    webhookCount: 0
  };

  for (const source of sources) {
    const emailCount = await fanOutEmailNotifications(sql, source);
    const webhookCount = await fanOutWebhookNotification(sql, source);

    summary.emailCount += emailCount;
    summary.webhookCount += webhookCount;
    summary.createdCount += emailCount + webhookCount;

    if (summary.createdCount >= limit) {
      break;
    }
  }

  return summary;
}

async function previewExternalNotificationFanout(sql: Sql, limit: number): Promise<NotificationFanoutSummary> {
  const sources = await selectFanoutSources(sql, limit);
  const summary: NotificationFanoutSummary = {
    createdCount: 0,
    emailCount: 0,
    sourceCount: sources.length,
    webhookCount: 0
  };

  for (const source of sources) {
    const emailCount = await previewEmailFanoutCount(sql, source);
    const webhookCount = await previewWebhookFanoutCount(sql, source);

    summary.emailCount += emailCount;
    summary.webhookCount += webhookCount;
    summary.createdCount += emailCount + webhookCount;

    if (summary.createdCount >= limit) {
      break;
    }
  }

  return summary;
}

async function selectFanoutSources(sql: Sql, limit: number) {
  return (await sql`
    select
      id::text,
      user_id::text as "userId",
      organization_id::text as "organizationId",
      event_type as "eventType",
      channel,
      subject,
      payload,
      status,
      created_at as "createdAt",
      delivered_at as "deliveredAt"
    from notification_events
    where channel = 'in_app'
      and status = 'queued'
      and event_type not like 'platform.notification_delivery.%'
      and event_type not like 'platform.webhook_delivery.%'
    order by created_at asc
    limit ${Math.min(Math.max(limit * 5, limit), 250)}
  `) as NotificationRow[];
}

async function fanOutEmailNotifications(sql: Sql, source: NotificationRow) {
  const topic = notificationPreferenceTopicForEventType(source.eventType);
  const targets = await selectEmailFanoutTargets(sql, source, topic);
  let createdCount = 0;

  for (const target of targets) {
    const existingRows = (await sql`
      select id::text
      from notification_events
      where channel = 'email'
        and user_id = ${target.userId}
        and payload ->> 'fanoutSourceNotificationId' = ${source.id}
      limit 1
    `) as Array<{ id: string }>;

    if (existingRows[0]) {
      continue;
    }

    await sql`
      insert into notification_events (user_id, organization_id, event_type, channel, subject, payload, status)
      values (
        ${target.userId},
        ${target.organizationId},
        ${source.eventType},
        'email',
        ${source.subject},
        ${sql.json({
          ...(source.payload ?? {}),
          email: target.email,
          fanoutSourceNotificationId: source.id,
          fanoutTopic: topic,
          locale: getPayloadText(source.payload, "locale") ?? target.locale,
          to: target.email
        })},
        'queued'
      )
    `;
    createdCount += 1;
  }

  return createdCount;
}

async function previewEmailFanoutCount(sql: Sql, source: NotificationRow) {
  const topic = notificationPreferenceTopicForEventType(source.eventType);
  const targets = await selectEmailFanoutTargets(sql, source, topic);
  let pendingCount = 0;

  for (const target of targets) {
    const existingRows = (await sql`
      select id::text
      from notification_events
      where channel = 'email'
        and user_id = ${target.userId}
        and payload ->> 'fanoutSourceNotificationId' = ${source.id}
      limit 1
    `) as Array<{ id: string }>;

    if (!existingRows[0]) {
      pendingCount += 1;
    }
  }

  return pendingCount;
}

async function fanOutWebhookNotification(sql: Sql, source: NotificationRow) {
  const organizationId = source.organizationId ?? null;

  if (!organizationId) {
    return 0;
  }

  const topic = webhookTopicForEventType(source.eventType);
  const endpointRows = (await sql`
    select count(*)::int as count
    from organization_webhook_endpoints
    where organization_id = ${organizationId}
      and status = 'active'
      and (${source.eventType} = any(events) or ${topic} = any(events))
  `) as Array<{ count: number }>;

  if ((endpointRows[0]?.count ?? 0) === 0) {
    return 0;
  }

  const existingRows = (await sql`
    select id::text
    from notification_events
    where channel = 'webhook'
      and organization_id = ${organizationId}
      and payload ->> 'fanoutSourceNotificationId' = ${source.id}
    limit 1
  `) as Array<{ id: string }>;

  if (existingRows[0]) {
    return 0;
  }

  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (
      ${organizationId},
      ${source.eventType},
      'webhook',
      ${source.subject},
      ${sql.json({
        ...(source.payload ?? {}),
        fanoutSourceNotificationId: source.id,
        fanoutTopic: topic
      })},
      'queued'
    )
  `;

  return 1;
}

async function previewWebhookFanoutCount(sql: Sql, source: NotificationRow) {
  const organizationId = source.organizationId ?? null;

  if (!organizationId) {
    return 0;
  }

  const topic = webhookTopicForEventType(source.eventType);
  const endpointRows = (await sql`
    select count(*)::int as count
    from organization_webhook_endpoints
    where organization_id = ${organizationId}
      and status = 'active'
      and (${source.eventType} = any(events) or ${topic} = any(events))
  `) as Array<{ count: number }>;

  if ((endpointRows[0]?.count ?? 0) === 0) {
    return 0;
  }

  const existingRows = (await sql`
    select id::text
    from notification_events
    where channel = 'webhook'
      and organization_id = ${organizationId}
      and payload ->> 'fanoutSourceNotificationId' = ${source.id}
    limit 1
  `) as Array<{ id: string }>;

  return existingRows[0] ? 0 : 1;
}

async function selectEmailFanoutTargets(sql: Sql, source: NotificationRow, topic: string) {
  const organizationId = source.organizationId ?? null;

  if (source.userId) {
    return (await sql`
      select
        u.id::text as "userId",
        u.email,
        coalesce(${organizationId}::uuid, om.organization_id)::text as "organizationId",
        'en' as locale
      from users u
      left join organization_members om on om.user_id = u.id
      left join notification_preferences np on np.user_id = u.id and np.event_type = ${topic}
      where u.id = ${source.userId}
        and coalesce(np.email_enabled, true) = true
        and nullif(u.email, '') is not null
      order by om.created_at asc nulls last
      limit 1
    `) as Array<{ email: string; locale: string; organizationId: string | null; userId: string }>;
  }

  if (!organizationId) {
    return [];
  }

  return (await sql`
    select distinct on (u.id)
      u.id::text as "userId",
      u.email,
      om.organization_id::text as "organizationId",
      'en' as locale
    from organization_members om
    join users u on u.id = om.user_id
    left join notification_preferences np on np.user_id = u.id and np.event_type = ${topic}
    where om.organization_id = ${organizationId}
      and coalesce(np.email_enabled, true) = true
      and nullif(u.email, '') is not null
    order by u.id, om.created_at asc
    limit 50
  `) as Array<{ email: string; locale: string; organizationId: string | null; userId: string }>;
}

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(Number(limit) || 25), 1), 100);
}

function normalizeEmailAddress(value: string) {
  const email = value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    throw new Error("A valid recipient email address is required.");
  }

  return email;
}

function normalizeProcessMode(value: unknown): NotificationDeliveryProcessMode {
  const mode = String(value ?? "dry_run").trim();

  if (mode === "deliver" || mode === "dry_run") {
    return mode;
  }

  throw new Error("Notification delivery process mode must be deliver or dry_run.");
}

function requireDeliverConfirmation(mode: NotificationDeliveryProcessMode, confirmation: unknown) {
  if (mode !== "deliver") {
    return;
  }

  if (String(confirmation ?? "").trim() !== "DELIVER") {
    throw new Error("Type DELIVER to confirm real notification delivery processing.");
  }
}

async function processEmailDelivery(
  sql: Sql,
  row: NotificationRow,
  env: NotificationDeliveryRuntimeEnv | undefined,
  mode: NotificationDeliveryProcessMode
): Promise<ProcessedDeliveryOutcome> {
  const emailConfig = await resolveEmailProviderConfig(env, { includeSecrets: true });
  const provider = emailConfig.provider === "unconfigured" ? normalizeEmailProvider(env) : emailConfig.provider;
  const recipient = getPayloadText(row.payload, "email") ?? getPayloadText(row.payload, "to");
  const renderedTemplate = await resolveRenderedNotificationTemplate(sql, row, "email");

  if (!recipient) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: "Email delivery payload is missing a recipient email."
    };
  }

  if (provider === "debug_preview" && isProductionLike(env)) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason:
        "Debug email delivery is disabled in production. Configure SKILLHUB_EMAIL_PROVIDER=smtp with SMTP credentials, or use SKILLHUB_EMAIL_PROVIDER=resend."
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

  if (provider === "smtp") {
    return processSmtpEmailDelivery(row, env, mode, recipient, renderedTemplate, emailConfig);
  }

  if (provider !== "resend") {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason:
        "Email provider is not configured. Set SKILLHUB_EMAIL_PROVIDER=smtp with SMTP credentials, or use SKILLHUB_EMAIL_PROVIDER=resend."
    };
  }

  const apiKey = emailConfig.resendApiKey ?? getRuntimeEnv(env, "RESEND_API_KEY");
  const from = emailConfig.from ?? getRuntimeEnv(env, "SKILLHUB_EMAIL_FROM");

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
      subject: renderedTemplate?.subject ?? row.subject ?? "SkillHub notification",
      text: renderedTemplate?.body ?? renderEmailText(row),
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

async function processSmtpEmailDelivery(
  row: NotificationRow,
  env: NotificationDeliveryRuntimeEnv | undefined,
  mode: NotificationDeliveryProcessMode,
  recipient: string,
  renderedTemplate: Awaited<ReturnType<typeof resolveRenderedNotificationTemplate>>,
  emailConfig: Awaited<ReturnType<typeof resolveEmailProviderConfig>>
): Promise<ProcessedDeliveryOutcome> {
  const provider = "smtp";
  const host = emailConfig.smtpHost ?? getRuntimeEnv(env, "SKILLHUB_SMTP_HOST");
  const port = normalizeSmtpPort(emailConfig.smtpPort ?? getRuntimeEnv(env, "SKILLHUB_SMTP_PORT"));
  const secure = normalizeSmtpSecure(emailConfig.smtpSecure ?? getRuntimeEnv(env, "SKILLHUB_SMTP_SECURE"), port);
  const username = emailConfig.smtpUser ?? getRuntimeEnv(env, "SKILLHUB_SMTP_USER");
  const password = emailConfig.smtpPassword ?? getRuntimeEnv(env, "SKILLHUB_SMTP_PASSWORD");
  const from = emailConfig.from ?? getRuntimeEnv(env, "SKILLHUB_EMAIL_FROM");

  if (!host || !username || !password || !from) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason:
        "SMTP delivery requires SKILLHUB_SMTP_HOST, SKILLHUB_SMTP_USER, SKILLHUB_SMTP_PASSWORD, and SKILLHUB_EMAIL_FROM."
    };
  }

  if (mode === "dry_run") {
    return {
      action: "mark_sent",
      nextAttemptAt: null,
      provider,
      providerMessageId: "dry_run",
      reason: `SMTP is configured for ${host}:${port} and would send email to ${recipient}.`
    };
  }

  try {
    const providerMessageId = await sendSmtpEmail({
      from,
      host,
      password,
      port,
      secure,
      subject: renderedTemplate?.subject ?? row.subject ?? "SkillHub notification",
      text: renderedTemplate?.body ?? renderEmailText(row),
      to: recipient,
      username
    });

    return {
      action: "mark_sent",
      nextAttemptAt: null,
      provider,
      providerMessageId,
      reason: "Email delivered through SMTP."
    };
  } catch (error) {
    return {
      action: "mark_failed",
      nextAttemptAt: null,
      provider,
      providerMessageId: null,
      reason: `SMTP delivery failed: ${error instanceof Error ? error.message : String(error)}.`
    };
  }
}

async function processWebhookDelivery(
  sql: Sql,
  row: NotificationRow,
  mode: NotificationDeliveryProcessMode
): Promise<ProcessedDeliveryOutcome> {
  const organizationId = row.organizationId ?? null;
  const provider = "webhook_outbox";
  const renderedTemplate = await resolveRenderedNotificationTemplate(sql, row, "webhook");

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
          payload: row.payload ?? {},
          renderedPayload: renderedTemplate ? parseRenderedWebhookBody(renderedTemplate.body) : row.payload ?? {},
          templateId: renderedTemplate?.templateId ?? null,
          templateLocale: renderedTemplate?.locale ?? null,
          templateSubject: renderedTemplate?.subject ?? row.subject ?? null
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
      provider_message_id = ${outcome.providerMessageId},
      payload = case
        when ${outcome.action === "mark_sent"} and event_type = 'auth.email.code.requested'
          then coalesce(payload, '{}'::jsonb) - 'code'
        else payload
      end
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
  processed: NotificationDeliveryProcessItem[],
  fanout: NotificationFanoutSummary
) {
  const summary = {
    ...summarizeProcessedItems(processed),
    fanoutCount: fanout.createdCount,
    fanoutEmailCount: fanout.emailCount,
    fanoutSourceCount: fanout.sourceCount,
    fanoutWebhookCount: fanout.webhookCount
  };

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
  processed: NotificationDeliveryProcessItem[],
  fanout: NotificationFanoutSummary
): NotificationDeliveryProcessResult {
  const summary = summarizeProcessedItems(processed);

  return {
    deliveredCount: summary.deliveredCount,
    failedCount: summary.failedCount,
    fanoutCount: fanout.createdCount,
    fanoutEmailCount: fanout.emailCount,
    fanoutMode: mode === "deliver" ? "created" : "preview",
    fanoutSourceCount: fanout.sourceCount,
    fanoutWebhookCount: fanout.webhookCount,
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

  return "unconfigured";
}

type SmtpSocket = import("node:net").Socket | import("node:tls").TLSSocket;

type SmtpEmailInput = {
  from: string;
  host: string;
  password: string;
  port: number;
  secure: boolean;
  subject: string;
  text: string;
  to: string;
  username: string;
};

async function sendSmtpEmail(input: SmtpEmailInput) {
  const [net, tls] = await Promise.all([import("node:net"), import("node:tls")]);
  const socket: SmtpSocket = input.secure
    ? tls.connect({
        host: input.host,
        port: input.port,
        servername: input.host
      })
    : net.connect({
        host: input.host,
        port: input.port
      });
  const fromAddress = parseEmailAddress(input.from, "SKILLHUB_EMAIL_FROM");
  const toAddress = parseEmailAddress(input.to, "recipient");
  const messageId = smtpMessageId(input.host);

  socket.setEncoding("utf8");
  socket.setTimeout(15000, () => {
    socket.destroy(new Error("SMTP connection timed out."));
  });

  try {
    await waitForSmtpSocket(socket, input.secure ? "secureConnect" : "connect");
    expectSmtpResponse(await readSmtpResponse(socket), [220]);
    await sendSmtpCommand(socket, `EHLO ${smtpClientName()}`, [250]);
    await sendSmtpCommand(socket, `AUTH PLAIN ${smtpPlainAuth(input.username, input.password)}`, [235]);
    await sendSmtpCommand(socket, `MAIL FROM:<${fromAddress}>`, [250]);
    await sendSmtpCommand(socket, `RCPT TO:<${toAddress}>`, [250, 251]);
    await sendSmtpCommand(socket, "DATA", [354]);
    socket.write(`${buildSmtpMessage(input, messageId)}\r\n.\r\n`);
    expectSmtpResponse(await readSmtpResponse(socket), [250]);
    socket.write("QUIT\r\n");
    return messageId;
  } finally {
    socket.end();
    socket.destroy();
  }
}

function normalizeSmtpPort(value: string | undefined) {
  const port = Number(value ?? "465");
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 465;
}

function normalizeSmtpSecure(value: string | undefined, port: number) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return port === 465;
  }

  return ["1", "ssl", "tls", "true", "yes"].includes(normalized);
}

function waitForSmtpSocket(socket: SmtpSocket, event: "connect" | "secureConnect") {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP connection timed out."));
    }, 15000);
    const cleanup = () => {
      clearTimeout(timer);
      socket.off(event, onReady);
      socket.off("error", onError);
    };
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    socket.once(event, onReady);
    socket.once("error", onError);
  });
}

async function sendSmtpCommand(socket: SmtpSocket, command: string, expectedCodes: number[]) {
  socket.write(`${command}\r\n`);
  expectSmtpResponse(await readSmtpResponse(socket), expectedCodes);
}

function readSmtpResponse(socket: SmtpSocket) {
  return new Promise<{ code: number; text: string }>((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("SMTP server response timed out."));
    }, 15000);
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("end", onEnd);
    };
    const onData = (chunk: string | Buffer) => {
      buffer += chunk.toString();
      const match = buffer.match(/(?:^|\r?\n)(\d{3}) [^\r\n]*(?:\r?\n|$)/);

      if (match) {
        cleanup();
        resolve({
          code: Number(match[1]),
          text: buffer.trim()
        });
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onEnd = () => {
      cleanup();
      reject(new Error("SMTP server closed the connection."));
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("end", onEnd);
  });
}

function expectSmtpResponse(response: { code: number; text: string }, expectedCodes: number[]) {
  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP returned ${response.code}: ${response.text}`);
  }
}

function buildSmtpMessage(input: SmtpEmailInput, messageId: string) {
  const headers = [
    `From: ${sanitizeHeader(input.from)}`,
    `To: ${sanitizeHeader(input.to)}`,
    `Subject: ${encodeMimeHeader(input.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${messageId}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit"
  ];
  const body = dotStuff(input.text.replace(/\r?\n/g, "\r\n"));

  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}

function parseEmailAddress(value: string, label: string) {
  const trimmed = value.trim();
  const bracketMatch = trimmed.match(/<([^<>\s]+@[^<>\s]+)>/);
  const directMatch = trimmed.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const address = bracketMatch?.[1] ?? directMatch?.[0];

  if (!address) {
    throw new Error(`${label} must contain a valid email address.`);
  }

  return address;
}

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeMimeHeader(value: string) {
  const clean = sanitizeHeader(value);

  if (/^[\x20-\x7E]*$/.test(clean)) {
    return clean;
  }

  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function dotStuff(value: string) {
  return value
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

function smtpPlainAuth(username: string, password: string) {
  return Buffer.from(`\u0000${username}\u0000${password}`, "utf8").toString("base64");
}

function smtpClientName() {
  return "useskillhub.com";
}

function smtpMessageId(host: string) {
  const safeHost = host.replace(/[^a-zA-Z0-9.-]+/g, "") || "useskillhub.com";
  const nonce = Math.random().toString(36).slice(2, 10);
  return `skillhub.${Date.now()}.${nonce}@${safeHost}`;
}

async function resolveRenderedNotificationTemplate(
  sql: Sql,
  row: NotificationRow,
  channel: "email" | "webhook"
): Promise<{ body: string; locale: string; subject: string; templateId: string } | null> {
  const localeCandidates = notificationLocaleCandidates(row.payload);

  for (const locale of localeCandidates) {
    const rows = (await sql`
      select
        id::text,
        locale,
        subject,
        body
      from notification_templates
      where template_key = ${row.eventType}
        and channel = ${channel}
        and locale = ${locale}
        and status = 'active'
      limit 1
    `) as Array<{ body: string; id: string; locale: string; subject: string }>;
    const template = rows[0];

    if (template) {
      return {
        body: renderTemplateText(template.body, row.payload),
        locale: template.locale,
        subject: renderTemplateText(template.subject, row.payload),
        templateId: template.id
      };
    }
  }

  return null;
}

function notificationLocaleCandidates(payload: Record<string, unknown> | undefined) {
  const rawLocale = (getPayloadText(payload, "locale") ?? getPayloadText(payload, "preferredLocale") ?? "en")
    .trim()
    .toLowerCase()
    .replace("_", "-");
  const candidates = [rawLocale];
  const language = rawLocale.split("-")[0];

  if (language && language !== rawLocale) {
    candidates.push(language);
  }

  candidates.push("en");
  return Array.from(new Set(candidates.filter(Boolean)));
}

function renderTemplateText(template: string, payload: Record<string, unknown> | undefined) {
  return template.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_match, key: string) => {
    const value = getPayloadPathText(payload, key);
    return value ?? "";
  });
}

function getPayloadPathText(payload: Record<string, unknown> | undefined, path: string) {
  let current: unknown = payload;

  for (const part of path.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === "string") {
    return current;
  }

  if (typeof current === "number" || typeof current === "boolean") {
    return String(current);
  }

  return null;
}

function parseRenderedWebhookBody(body: string) {
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {
      body
    };
  }
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

function notificationPreferenceTopicForEventType(eventType: string) {
  if (eventType.includes("buyer_request") || eventType.includes("buyer.request")) {
    return "buyer.request";
  }

  if (eventType.includes("payout")) {
    return "publisher.payout";
  }

  if (eventType.includes("billing") || eventType.includes("invoice") || eventType.includes("refund") || eventType.includes("dispute")) {
    return "finance.billing";
  }

  if (eventType.includes("runtime") || eventType.includes("incident")) {
    return "runtime.incident";
  }

  if (eventType.includes("account") || eventType.includes("api_key") || eventType.includes("auth.")) {
    return "account.security";
  }

  if (eventType.includes("review") || eventType.includes("feedback")) {
    return "skill.review";
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
  return [getRuntimeEnv(env, "SKILLHUB_ENV"), getRuntimeEnv(env, "NODE_ENV"), getRuntimeEnv(env, "VERCEL_ENV")].some(
    (value) => value?.trim().toLowerCase() === "production"
  );
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
  const provider = String(value ?? "unconfigured")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_");

  return (provider || "unconfigured").slice(0, 80);
}

function normalizeProviderMessageId(value: unknown, action: NotificationDeliveryAction) {
  const messageId = String(value ?? "").trim();

  if (messageId) {
    return messageId.slice(0, 160);
  }

  if (action === "mark_sent") {
    throw new Error("A real provider message id is required before marking delivery as sent.");
  }

  return null;
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

function ensureDeliveryTransition(status: NotificationRow["status"], action: NotificationDeliveryAction) {
  if (status === "sent" || status === "skipped") {
    throw new Error(`Cannot ${action.replace("_", " ")} delivery while status is ${status}.`);
  }

  if (status === "failed" && action !== "retry" && action !== "mark_failed") {
    throw new Error("Failed deliveries must be retried before they can be marked sent or skipped.");
  }
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
