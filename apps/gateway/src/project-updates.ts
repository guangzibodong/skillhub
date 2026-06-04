import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type ProjectUpdateActionStatus = "acknowledged" | "scheduled" | "adopted" | "ignored";

type ProjectUpdateActionInput = {
  note?: unknown;
  scheduledFor?: unknown;
  status?: unknown;
};

type ProjectUpdateEventRow = {
  id: string;
  projectId: string;
  projectSlug: string;
  organizationId: string;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
};

type ProjectUpdateActionRow = {
  id: string;
  projectSlug: string;
  updateId: string;
  skillSlug: string;
  displayName: string;
  eventType: string;
  severity: string;
  title: string;
  status: ProjectUpdateActionStatus;
  note: string | null;
  scheduledFor: string | null;
  decidedBy: string | null;
  resolvedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

const projectUpdateActionStatuses: ProjectUpdateActionStatus[] = ["acknowledged", "scheduled", "adopted", "ignored"];

export async function upsertProjectUpdateAction(
  projectSlug: string,
  updateId: string,
  input: ProjectUpdateActionInput,
  organizationId?: string | null,
  userId?: string | null
) {
  const status = normalizeProjectUpdateActionStatus(input.status);
  const note = normalizeNote(input.note);
  const scheduledFor = normalizeScheduledFor(input.scheduledFor, status);
  const sql = await requireSql();
  const scopedOrganizationId = organizationId ?? null;

  return sql.begin(async (tx: Sql) => {
    const updateRows = (await tx`
      select
        sue.id::text,
        p.id::text as "projectId",
        p.slug as "projectSlug",
        p.organization_id::text as "organizationId",
        s.slug as "skillSlug",
        s.display_name as "displayName",
        sue.event_type as "eventType",
        sue.severity,
        sue.title
      from skill_update_events sue
      join skills s on s.id = sue.skill_id
      join project_skill_installs psi on psi.skill_id = s.id
      join projects p on p.id = psi.project_id
      where sue.id = ${updateId}
        and p.slug = ${projectSlug}
        and (${scopedOrganizationId}::uuid is null or p.organization_id = ${scopedOrganizationId})
      limit 1
      for update
    `) as ProjectUpdateEventRow[];
    const update = updateRows[0];

    if (!update) {
      throw new Error("Update event not found for this project.");
    }

    const actionRows = (await tx`
      insert into project_update_actions (
        project_id,
        skill_update_event_id,
        status,
        note,
        scheduled_for,
        decided_by,
        resolved_at,
        updated_at
      )
      values (
        ${update.projectId},
        ${update.id},
        ${status},
        ${note},
        ${scheduledFor},
        ${userId ?? null},
        ${isResolvedStatus(status) ? sql`now()` : null},
        now()
      )
      on conflict (project_id, skill_update_event_id) do update set
        status = excluded.status,
        note = excluded.note,
        scheduled_for = excluded.scheduled_for,
        decided_by = excluded.decided_by,
        resolved_at = case
          when excluded.status in ('adopted', 'ignored') then coalesce(project_update_actions.resolved_at, now())
          else null
        end,
        updated_at = now()
      returning
        id::text,
        status,
        note,
        scheduled_for as "scheduledFor",
        decided_by::text as "decidedBy",
        resolved_at as "resolvedAt",
        updated_at as "updatedAt",
        created_at as "createdAt"
    `) as Array<{
      id: string;
      status: ProjectUpdateActionStatus;
      note: string | null;
      scheduledFor: string | null;
      decidedBy: string | null;
      resolvedAt: string | null;
      updatedAt: string;
      createdAt: string;
    }>;
    const action = actionRows[0];

    await tx`
      insert into admin_audit_logs (action, entity_type, entity_id, reason, metadata)
      values (
        ${`project_update.${status}`},
        'skill_update_event',
        ${update.id},
        ${`Project update marked ${status}.`},
        ${tx.json({
          projectSlug,
          skillSlug: update.skillSlug,
          updateId: update.id,
          status,
          scheduledFor,
          organizationId: update.organizationId
        })}
      )
    `;
    await tx`
      insert into notification_events (organization_id, event_type, channel, subject, payload, status)
      values (
        ${update.organizationId},
        ${`project_update.${status}`},
        'in_app',
        ${`Project update ${status}`},
        ${tx.json({
          projectSlug,
          skillSlug: update.skillSlug,
          displayName: update.displayName,
          updateId: update.id,
          status,
          scheduledFor
        })},
        'queued'
      )
    `;

    return {
      ...action,
      projectSlug: update.projectSlug,
      updateId: update.id,
      skillSlug: update.skillSlug,
      displayName: update.displayName,
      eventType: update.eventType,
      severity: update.severity,
      title: update.title
    } satisfies ProjectUpdateActionRow;
  });
}

function normalizeProjectUpdateActionStatus(value: unknown): ProjectUpdateActionStatus {
  const status = String(value ?? "");

  if (!projectUpdateActionStatuses.includes(status as ProjectUpdateActionStatus)) {
    throw new Error("Update action status must be acknowledged, scheduled, adopted, or ignored.");
  }

  return status as ProjectUpdateActionStatus;
}

function normalizeNote(value: unknown) {
  const note = String(value ?? "").trim();
  return note.length > 0 ? note.slice(0, 1000) : null;
}

function normalizeScheduledFor(value: unknown, status: ProjectUpdateActionStatus) {
  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return null;
  }

  if (status !== "scheduled") {
    return null;
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("scheduledFor must be a valid date.");
  }

  return date.toISOString();
}

function isResolvedStatus(status: ProjectUpdateActionStatus) {
  return status === "adopted" || status === "ignored";
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for project update actions.");
  }

  return sql;
}
