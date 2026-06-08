import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

export type AdminAuditLogRecord = {
  id: string;
  action: string;
  actorDisplayName: string | null;
  actorEmail: string | null;
  actorUserId: string | null;
  createdAt: string;
  entityId: string | null;
  entityType: string;
  metadata: Record<string, unknown>;
  reason: string | null;
};

const fallbackAuditLogs: AdminAuditLogRecord[] = [
  {
    id: "demo-audit-review",
    action: "skill.review.decided",
    actorDisplayName: "SkillHub Reviewer",
    actorEmail: "reviewer@useskillhub.com",
    actorUserId: "demo-user-reviewer",
    createdAt: "demo",
    entityId: "demo-review-browser-research",
    entityType: "skill_review",
    metadata: {
      riskLevel: "low",
      skillSlug: "browser-research",
      status: "approved"
    },
    reason: "Approved verified marketplace listing."
  },
  {
    id: "demo-audit-payout",
    action: "payout.decided",
    actorDisplayName: "Finance Operator",
    actorEmail: "finance@useskillhub.com",
    actorUserId: "demo-user-finance",
    createdAt: "demo",
    entityId: "demo-payout-001",
    entityType: "payout",
    metadata: {
      amountCents: 482000,
      currency: "usd",
      status: "processing"
    },
    reason: "Payout approved for manual transfer."
  },
  {
    id: "demo-audit-team",
    action: "organization.member.token_created",
    actorDisplayName: "SkillHub Owner",
    actorEmail: "owner@useskillhub.com",
    actorUserId: "demo-user-owner",
    createdAt: "demo",
    entityId: "demo-user-developer",
    entityType: "organization_member",
    metadata: {
      role: "developer",
      tokenName: "Developer workspace access"
    },
    reason: "Organization team access changed."
  }
];

export async function listAdminAuditLogs(limit = 30) {
  const sql = await getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 30), 1), 100);

  if (!sql) {
    return fallbackAuditLogs.slice(0, safeLimit);
  }

  const rows = (await sql`
    select
      aal.id::text,
      aal.actor_user_id::text as "actorUserId",
      u.email as "actorEmail",
      u.display_name as "actorDisplayName",
      aal.action,
      aal.entity_type as "entityType",
      aal.entity_id::text as "entityId",
      aal.reason,
      aal.metadata,
      aal.created_at as "createdAt"
    from admin_audit_logs aal
    left join users u on u.id = aal.actor_user_id
    order by aal.created_at desc
    limit ${safeLimit}
  `) as AdminAuditLogRecord[];

  return rows.map((row) => ({
    ...row,
    metadata: normalizeMetadata(row.metadata)
  }));
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}
