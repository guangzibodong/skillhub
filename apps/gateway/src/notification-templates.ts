import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type NotificationTemplateInput = {
  body?: unknown;
  channel?: unknown;
  locale?: unknown;
  status?: unknown;
  subject?: unknown;
  templateKey?: unknown;
};

type TemplateChannel = "email" | "in_app" | "webhook";
type TemplateStatus = "active" | "archived" | "draft";

export type NotificationTemplateRecord = {
  id: string;
  templateKey: string;
  channel: TemplateChannel;
  locale: string;
  subject: string;
  body: string;
  status: TemplateStatus;
  updatedAt: string;
};

const channels: TemplateChannel[] = ["email", "in_app", "webhook"];
const statuses: TemplateStatus[] = ["draft", "active", "archived"];

export async function listNotificationTemplates(limit = 50) {
  const sql = await getSql();
  const safeLimit = Math.min(Math.max(Math.trunc(Number(limit) || 50), 1), 100);

  if (!sql) {
    return [];
  }

  return (await sql`
    select
      id::text,
      template_key as "templateKey",
      channel,
      locale,
      subject,
      body,
      status,
      updated_at as "updatedAt"
    from notification_templates
    order by
      case status
        when 'active' then 0
        when 'draft' then 1
        else 2
      end,
      template_key asc,
      channel asc,
      locale asc
    limit ${safeLimit}
  `) as NotificationTemplateRecord[];
}

export async function upsertNotificationTemplate(input: NotificationTemplateInput, actorUserId: string | null | undefined) {
  const sql = await requireSql();
  const templateKey = normalizeTemplateKey(input.templateKey);
  const channel = normalizeChannel(input.channel);
  const locale = normalizeLocale(input.locale);
  const subject = normalizeRequiredText(input.subject, "subject", 240);
  const body = normalizeRequiredText(input.body, "body", 8000);
  const status = normalizeStatus(input.status);

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      insert into notification_templates (
        template_key,
        channel,
        locale,
        subject,
        body,
        status,
        updated_at
      )
      values (
        ${templateKey},
        ${channel},
        ${locale},
        ${subject},
        ${body},
        ${status},
        now()
      )
      on conflict (template_key, channel, locale) do update set
        subject = excluded.subject,
        body = excluded.body,
        status = excluded.status,
        updated_at = now()
      returning
        id::text,
        template_key as "templateKey",
        channel,
        locale,
        subject,
        body,
        status,
        updated_at as "updatedAt"
    `) as NotificationTemplateRecord[];
    const template = rows[0];

    await tx`
      insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values (
        ${actorUserId ?? null},
        'notification_template.upserted',
        'notification_template',
        ${template.id},
        'Notification template changed.',
        ${tx.json({
          channel,
          locale,
          status,
          templateKey
        })}
      )
    `;
    await tx`
      insert into notification_events (event_type, channel, subject, payload, status)
      values (
        'platform.notification_template.updated',
        'in_app',
        'Notification template updated',
        ${tx.json({
          channel,
          locale,
          status,
          templateId: template.id,
          templateKey
        })},
        'queued'
      )
    `;

    return template;
  });
}

function normalizeTemplateKey(value: unknown) {
  const key = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, ".");

  if (!key) {
    throw new Error("templateKey is required.");
  }

  return key.slice(0, 160);
}

function normalizeChannel(value: unknown): TemplateChannel {
  const channel = String(value ?? "in_app").trim();

  if (!channels.includes(channel as TemplateChannel)) {
    throw new Error("Template channel must be email, in_app, or webhook.");
  }

  return channel as TemplateChannel;
}

function normalizeLocale(value: unknown) {
  const locale = String(value ?? "en").trim().toLowerCase() || "en";
  return locale.slice(0, 12);
}

function normalizeStatus(value: unknown): TemplateStatus {
  const status = String(value ?? "draft").trim();

  if (!statuses.includes(status as TemplateStatus)) {
    throw new Error("Template status must be draft, active, or archived.");
  }

  return status as TemplateStatus;
}

function normalizeRequiredText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for notification template operations.");
  }

  return sql;
}
