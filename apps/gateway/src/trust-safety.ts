import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type AbuseReportCategory = "malicious" | "security" | "privacy" | "copyright" | "spam" | "quality" | "billing" | "other";
type AbuseReportSeverity = "low" | "medium" | "high" | "critical";
type AbuseReportStatus = "open" | "triaged" | "dismissed" | "warning_sent" | "restricted" | "suspended" | "resolved";
type TakedownAction = "triage" | "dismiss" | "warn" | "restrict" | "suspend" | "resolve";

type CreateAbuseReportInput = {
  category?: unknown;
  description?: unknown;
  evidenceUrl?: unknown;
  projectSlug?: unknown;
  severity?: unknown;
  title?: unknown;
};

type CreateAbuseReportContext = {
  organizationId?: string | null;
  skillSlug: string;
  userId?: string | null;
};

type AbuseReportDecisionInput = {
  action?: unknown;
  reason?: unknown;
};

type SkillForReport = {
  id: string;
  organizationId: string | null;
  slug: string;
  displayName: string;
  visibility: string;
  verificationStatus: string;
  latestVersionId: string | null;
};

type AbuseReportForDecision = SkillForReport & {
  reportId: string;
  reportSeverity: AbuseReportSeverity;
  reportStatus: AbuseReportStatus;
};

type AbuseReportRow = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  skillVisibility: string;
  skillVerificationStatus: string;
  category: AbuseReportCategory;
  severity: AbuseReportSeverity;
  status: AbuseReportStatus;
  title: string;
  description: string;
  evidenceUrl: string | null;
  reporterEmail: string | null;
  reporterOrganizationName: string | null;
  projectSlug: string | null;
  decisionReason: string | null;
  decidedAt: string | null;
  latestAction: TakedownAction | null;
  latestActionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const categories: AbuseReportCategory[] = ["malicious", "security", "privacy", "copyright", "spam", "quality", "billing", "other"];
const severities: AbuseReportSeverity[] = ["low", "medium", "high", "critical"];
const actions: TakedownAction[] = ["triage", "dismiss", "warn", "restrict", "suspend", "resolve"];

const fallbackAbuseReports = [
  {
    id: "demo-abuse-security",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research-pro",
    skillName: "Browser Research Pro",
    skillVisibility: "public",
    skillVerificationStatus: "verified",
    category: "security",
    severity: "high",
    status: "open",
    title: "Unexpected outbound domain during runtime",
    description: "A project operator reported calls to an undeclared analytics endpoint during citation extraction.",
    evidenceUrl: "https://example.com/evidence/runtime-domain-log",
    reporterEmail: "security@example.com",
    reporterOrganizationName: "Research Agent",
    projectSlug: "research-agent",
    decisionReason: null,
    decidedAt: null,
    latestAction: null,
    latestActionAt: null,
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-abuse-quality",
    skillId: "demo-skill-support-triage",
    skillSlug: "support-triage",
    skillName: "Support Triage",
    skillVisibility: "public",
    skillVerificationStatus: "verified",
    category: "quality",
    severity: "medium",
    status: "triaged",
    title: "Repeated low-confidence classifications",
    description: "Three projects reported misrouted tickets after the last model prompt update.",
    evidenceUrl: null,
    reporterEmail: "ops@example.com",
    reporterOrganizationName: "Support Agent",
    projectSlug: "support-agent",
    decisionReason: "Publisher asked to submit a runtime fix and examples.",
    decidedAt: "demo",
    latestAction: "triage",
    latestActionAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  }
] satisfies AbuseReportRow[];

export async function listAdminAbuseReports(limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return fallbackAbuseReports;
  }

  return listAbuseReportRows(sql, limit);
}

export async function createAbuseReport(input: CreateAbuseReportInput, context: CreateAbuseReportContext) {
  const sql = await requireSql();
  const title = normalizeText(input.title, "title", 140);
  const description = normalizeText(input.description, "description", 2200);
  const category = normalizeCategory(input.category);
  const severity = normalizeSeverity(input.severity);
  const evidenceUrl = normalizeOptionalText(input.evidenceUrl, 600);

  return sql.begin(async (tx: Sql) => {
    const skill = await getSkillForSlug(tx, context.skillSlug);
    const projectId = context.organizationId
      ? await getProjectId(tx, normalizeOptionalText(input.projectSlug, 120), context.organizationId)
      : null;
    const rows = (await tx`
      insert into skill_abuse_reports (
        skill_id,
        skill_version_id,
        reporter_user_id,
        reporter_organization_id,
        project_id,
        category,
        severity,
        title,
        description,
        evidence_url
      )
      values (
        ${skill.id},
        ${skill.latestVersionId},
        ${context.userId ?? null},
        ${context.organizationId ?? null},
        ${projectId},
        ${category},
        ${severity},
        ${title},
        ${description},
        ${evidenceUrl}
      )
      returning id::text
    `) as Array<{ id: string }>;
    const reportId = rows[0].id;

    await recordTrustAudit(tx, context.userId, "abuse_report.created", "skill_abuse_report", reportId, description, {
      category,
      severity,
      skillSlug: skill.slug,
      reporterOrganizationId: context.organizationId ?? null
    });
    await recordTrustNotification(tx, skill.organizationId, "trust.abuse_report.created", "Skill abuse report created", {
      category,
      reportId,
      severity,
      skillName: skill.displayName,
      skillSlug: skill.slug
    });

    const reports = await listAbuseReportRows(tx, 1, reportId);
    return reports[0];
  });
}

export async function decideAbuseReport(reportId: string, input: AbuseReportDecisionInput, actorUserId: string | null | undefined) {
  const sql = await requireSql();
  const action = normalizeAction(input.action);
  const reason = normalizeText(input.reason, "reason", 1600);
  const status = statusForAction(action);

  return sql.begin(async (tx: Sql) => {
    const report = await getReportForDecision(tx, reportId);
    const nextVisibility = action === "restrict" || action === "suspend" ? "unlisted" : report.visibility;
    const nextVerificationStatus = action === "suspend" ? "suspended" : report.verificationStatus;

    await tx`
      update skill_abuse_reports
      set
        status = ${status},
        decision_reason = ${reason},
        decided_by_user_id = ${actorUserId ?? null},
        decided_at = now(),
        updated_at = now()
      where id = ${reportId}
    `;

    if (nextVisibility !== report.visibility || nextVerificationStatus !== report.verificationStatus) {
      await tx`
        update skills
        set
          visibility = ${nextVisibility},
          verification_status = ${nextVerificationStatus},
          updated_at = now()
        where id = ${report.id}
      `;
    }

    await tx`
      insert into skill_takedown_actions (
        abuse_report_id,
        skill_id,
        action,
        previous_visibility,
        previous_verification_status,
        new_visibility,
        new_verification_status,
        reason,
        actor_user_id,
        metadata
      )
      values (
        ${reportId},
        ${report.id},
        ${action},
        ${report.visibility},
        ${report.verificationStatus},
        ${nextVisibility},
        ${nextVerificationStatus},
        ${reason},
        ${actorUserId ?? null},
        ${tx.json({
          previousStatus: report.reportStatus,
          status
        })}
      )
    `;

    await maybeRecordSkillUpdate(tx, report, action, reason);
    await recordTrustAudit(tx, actorUserId, `abuse_report.${action}`, "skill_abuse_report", reportId, reason, {
      action,
      newVerificationStatus: nextVerificationStatus,
      newVisibility: nextVisibility,
      skillSlug: report.slug
    });
    await recordTrustNotification(tx, report.organizationId, `trust.abuse_report.${status}`, "Skill abuse report decision recorded", {
      action,
      reportId,
      severity: report.reportSeverity,
      skillName: report.displayName,
      skillSlug: report.slug,
      status
    });

    const reports = await listAbuseReportRows(tx, 1, reportId);
    return reports[0];
  });
}

async function listAbuseReportRows(sql: Sql, limit: number, reportId?: string) {
  return (await sql`
    select
      sar.id::text,
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      s.visibility as "skillVisibility",
      s.verification_status as "skillVerificationStatus",
      sar.category,
      sar.severity,
      sar.status,
      sar.title,
      sar.description,
      sar.evidence_url as "evidenceUrl",
      u.email as "reporterEmail",
      o.name as "reporterOrganizationName",
      p.slug as "projectSlug",
      sar.decision_reason as "decisionReason",
      sar.decided_at as "decidedAt",
      latest_action.action as "latestAction",
      latest_action.created_at as "latestActionAt",
      sar.created_at as "createdAt",
      sar.updated_at as "updatedAt"
    from skill_abuse_reports sar
    join skills s on s.id = sar.skill_id
    left join users u on u.id = sar.reporter_user_id
    left join organizations o on o.id = sar.reporter_organization_id
    left join projects p on p.id = sar.project_id
    left join lateral (
      select action, created_at
      from skill_takedown_actions sta
      where sta.abuse_report_id = sar.id
      order by created_at desc
      limit 1
    ) latest_action on true
    where (${reportId ?? null}::uuid is null or sar.id = ${reportId ?? null}::uuid)
    order by
      case sar.status
        when 'open' then 0
        when 'triaged' then 1
        when 'warning_sent' then 2
        when 'restricted' then 3
        when 'suspended' then 4
        else 5
      end,
      case sar.severity
        when 'critical' then 0
        when 'high' then 1
        when 'medium' then 2
        else 3
      end,
      sar.created_at desc
    limit ${Math.max(1, Math.min(Number(limit) || 50, 100))}
  `) as AbuseReportRow[];
}

async function getSkillForSlug(sql: Sql, slug: string): Promise<SkillForReport> {
  const rows = (await sql`
    select
      s.id::text,
      s.organization_id::text as "organizationId",
      s.slug,
      s.display_name as "displayName",
      s.visibility,
      s.verification_status as "verificationStatus",
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
  `) as SkillForReport[];

  if (!rows[0]) {
    throw new Error("Skill not found.");
  }

  return rows[0];
}

async function getReportForDecision(sql: Sql, reportId: string): Promise<AbuseReportForDecision> {
  const rows = (await sql`
    select
      sar.id::text as "reportId",
      sar.severity as "reportSeverity",
      sar.status as "reportStatus",
      s.id::text,
      s.organization_id::text as "organizationId",
      s.slug,
      s.display_name as "displayName",
      s.visibility,
      s.verification_status as "verificationStatus",
      latest_version.id::text as "latestVersionId"
    from skill_abuse_reports sar
    join skills s on s.id = sar.skill_id
    left join lateral (
      select id
      from skill_versions sv
      where sv.skill_id = s.id
      order by sv.created_at desc
      limit 1
    ) latest_version on true
    where sar.id = ${reportId}
    limit 1
  `) as AbuseReportForDecision[];

  if (!rows[0]) {
    throw new Error("Abuse report not found.");
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

async function maybeRecordSkillUpdate(sql: Sql, report: AbuseReportForDecision, action: TakedownAction, reason: string) {
  if (!["warn", "restrict", "suspend", "resolve"].includes(action)) {
    return;
  }

  const eventType = action === "resolve" ? "resolved" : action === "warn" ? "security" : "suspended";
  const severity = action === "suspend" ? "critical" : action === "restrict" ? "high" : "medium";

  await sql`
    insert into skill_update_events (skill_id, skill_version_id, event_type, severity, title, body)
    values (
      ${report.id},
      ${report.latestVersionId},
      ${eventType},
      ${severity},
      ${`${report.displayName} trust action: ${action}`},
      ${reason}
    )
  `;
}

async function recordTrustAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityType: string,
  entityId: string,
  reason: string | null,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, ${entityType}, ${entityId}, ${reason}, ${sql.json(metadata)})
  `;
}

async function recordTrustNotification(
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

function normalizeAction(value: unknown): TakedownAction {
  const action = String(value ?? "").trim();

  if (!actions.includes(action as TakedownAction)) {
    throw new Error("Abuse report action must be triage, dismiss, warn, restrict, suspend, or resolve.");
  }

  return action as TakedownAction;
}

function statusForAction(action: TakedownAction): AbuseReportStatus {
  const statuses: Record<TakedownAction, AbuseReportStatus> = {
    dismiss: "dismissed",
    resolve: "resolved",
    restrict: "restricted",
    suspend: "suspended",
    triage: "triaged",
    warn: "warning_sent"
  };

  return statuses[action];
}

function normalizeCategory(value: unknown): AbuseReportCategory {
  const category = String(value ?? "other").trim();
  return categories.includes(category as AbuseReportCategory) ? (category as AbuseReportCategory) : "other";
}

function normalizeSeverity(value: unknown): AbuseReportSeverity {
  const severity = String(value ?? "medium").trim();
  return severities.includes(severity as AbuseReportSeverity) ? (severity as AbuseReportSeverity) : "medium";
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

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for trust and safety operations.");
  }

  return sql;
}
