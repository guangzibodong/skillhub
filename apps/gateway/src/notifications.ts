import { getSql } from "./registry.js";

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
