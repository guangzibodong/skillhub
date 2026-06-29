import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type IncidentSeverity = "low" | "medium" | "high" | "critical";
type IncidentStatus = "open" | "monitoring" | "resolved" | "postmortem";

type IncidentInput = {
  reason?: unknown;
  severity?: unknown;
  skillSlug?: unknown;
  status?: unknown;
  summary?: unknown;
  title?: unknown;
};

type IncidentSkill = {
  id: string;
  organizationId: string | null;
  slug: string;
  displayName: string;
  latestVersionId: string | null;
};

type IncidentRecord = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  skillVersionId: string | null;
  status: IncidentStatus;
  severity: IncidentSeverity;
  title: string;
  summary: string | null;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const severities: IncidentSeverity[] = ["low", "medium", "high", "critical"];
const statuses: IncidentStatus[] = ["open", "monitoring", "resolved", "postmortem"];

export async function listAdminIncidents(limit = 50) {
  const sql = await getSql();

  if (!sql) {
    return [];
  }

  return listIncidentRows(sql, normalizeLimit(limit));
}

export async function createAdminIncident(input: IncidentInput, actorUserId: string | null | undefined) {
  const sql = await requireSql();
  const skillSlug = normalizeText(input.skillSlug, "skillSlug", 120);
  const severity = normalizeSeverity(input.severity);
  const title = normalizeText(input.title, "title", 160);
  const summary = normalizeOptionalText(input.summary, 2000);

  return sql.begin(async (tx: Sql) => {
    const skill = await getIncidentSkill(tx, skillSlug);
    const rows = (await tx`
      insert into skill_incidents (
        skill_id,
        skill_version_id,
        status,
        severity,
        title,
        summary
      )
      values (
        ${skill.id},
        ${skill.latestVersionId},
        'open',
        ${severity},
        ${title},
        ${summary}
      )
      returning id::text
    `) as Array<{ id: string }>;
    const incidentId = rows[0].id;

    await recordIncidentUpdate(tx, skill, "incident", severity, title, summary ?? "Runtime incident opened.");
    await recordIncidentAudit(tx, actorUserId, "incident.created", "skill_incident", incidentId, summary ?? title, {
      severity,
      skillSlug
    });
    await recordIncidentNotification(tx, skill.organizationId, "runtime.incident.opened", "Runtime incident opened", {
      incidentId,
      severity,
      skillName: skill.displayName,
      skillSlug,
      title
    });

    const incidents = await listIncidentRows(tx, 1, incidentId);
    return incidents[0];
  });
}

export async function decideAdminIncident(
  incidentId: string,
  input: IncidentInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const status = normalizeStatus(input.status);
  const reason = normalizeText(input.reason, "reason", 1600);
  const severity = input.severity === undefined || input.severity === null || input.severity === "" ? null : normalizeSeverity(input.severity);

  return sql.begin(async (tx: Sql) => {
    const incident = await getIncidentForDecision(tx, incidentId);
    const nextSeverity = severity ?? incident.severity;

    await tx`
      update skill_incidents
      set
        status = ${status},
        severity = ${nextSeverity},
        summary = case when ${reason}::text = '' then summary else ${reason} end,
        resolved_at = case
          when ${status} in ('resolved', 'postmortem') then coalesce(resolved_at, now())
          else null
        end,
        updated_at = now()
      where id = ${incidentId}
    `;

    await recordIncidentUpdate(
      tx,
      incident,
      status === "resolved" || status === "postmortem" ? "resolved" : "incident",
      nextSeverity,
      `${incident.displayName} incident ${status}`,
      reason
    );
    await recordIncidentAudit(tx, actorUserId, `incident.${status}`, "skill_incident", incidentId, reason, {
      previousStatus: incident.status,
      severity: nextSeverity,
      skillSlug: incident.slug,
      status
    });
    await recordIncidentNotification(tx, incident.organizationId, `runtime.incident.${status}`, "Runtime incident updated", {
      incidentId,
      reason,
      severity: nextSeverity,
      skillName: incident.displayName,
      skillSlug: incident.slug,
      status
    });

    const incidents = await listIncidentRows(tx, 1, incidentId);
    return incidents[0];
  });
}

async function listIncidentRows(sql: Sql, limit: number, incidentId?: string) {
  return (await sql`
    select
      si.id::text,
      s.id::text as "skillId",
      s.slug as "skillSlug",
      s.display_name as "skillName",
      si.skill_version_id::text as "skillVersionId",
      si.status,
      si.severity,
      si.title,
      si.summary,
      si.started_at as "startedAt",
      si.resolved_at as "resolvedAt",
      si.created_at as "createdAt",
      si.updated_at as "updatedAt"
    from skill_incidents si
    join skills s on s.id = si.skill_id
    where (${incidentId ?? null}::uuid is null or si.id = ${incidentId ?? null}::uuid)
    order by
      case si.status
        when 'open' then 0
        when 'monitoring' then 1
        when 'resolved' then 2
        else 3
      end,
      case si.severity
        when 'critical' then 0
        when 'high' then 1
        when 'medium' then 2
        else 3
      end,
      si.updated_at desc
    limit ${limit}
  `) as IncidentRecord[];
}

async function getIncidentSkill(sql: Sql, slug: string): Promise<IncidentSkill> {
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
  `) as IncidentSkill[];

  if (!rows[0]) {
    throw new Error("Skill not found.");
  }

  return rows[0];
}

async function getIncidentForDecision(sql: Sql, incidentId: string): Promise<IncidentSkill & { severity: IncidentSeverity; status: IncidentStatus }> {
  const rows = (await sql`
    select
      s.id::text,
      s.organization_id::text as "organizationId",
      s.slug,
      s.display_name as "displayName",
      si.skill_version_id::text as "latestVersionId",
      si.severity,
      si.status
    from skill_incidents si
    join skills s on s.id = si.skill_id
    where si.id = ${incidentId}
    limit 1
  `) as Array<IncidentSkill & { severity: IncidentSeverity; status: IncidentStatus }>;

  if (!rows[0]) {
    throw new Error("Incident not found.");
  }

  return rows[0];
}

async function recordIncidentUpdate(
  sql: Sql,
  skill: IncidentSkill,
  eventType: "incident" | "resolved",
  severity: IncidentSeverity,
  title: string,
  body: string
) {
  await sql`
    insert into skill_update_events (skill_id, skill_version_id, event_type, severity, title, body)
    values (${skill.id}, ${skill.latestVersionId}, ${eventType}, ${severity}, ${title}, ${body})
  `;
}

async function recordIncidentAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityType: string,
  entityId: string,
  reason: string,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, ${entityType}, ${entityId}, ${reason}, ${sql.json(metadata)})
  `;
}

async function recordIncidentNotification(
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

function normalizeSeverity(value: unknown): IncidentSeverity {
  const severity = String(value ?? "medium").trim();
  return severities.includes(severity as IncidentSeverity) ? (severity as IncidentSeverity) : "medium";
}

function normalizeStatus(value: unknown): IncidentStatus {
  const status = String(value ?? "").trim();

  if (!statuses.includes(status as IncidentStatus)) {
    throw new Error("Incident status must be open, monitoring, resolved, or postmortem.");
  }

  return status as IncidentStatus;
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

function normalizeLimit(limit: number) {
  return Math.min(Math.max(Math.trunc(Number(limit) || 50), 1), 100);
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for runtime incident operations.");
  }

  return sql;
}
