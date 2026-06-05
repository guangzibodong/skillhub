import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type NotificationRow = {
  id: string;
  eventType: string;
  channel: "email" | "in_app" | "webhook";
  subject: string | null;
  payload?: Record<string, unknown>;
  status: "queued" | "sent" | "failed" | "skipped";
  createdAt: string;
  deliveredAt: string | null;
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
