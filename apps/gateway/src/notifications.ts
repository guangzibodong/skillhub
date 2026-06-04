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
    limit ${safeLimit}
  `;
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

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for notification operations.");
  }

  return sql;
}
