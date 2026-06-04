import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type PreferenceInput = {
  emailEnabled?: unknown;
  eventType?: unknown;
  inAppEnabled?: unknown;
  webhookEnabled?: unknown;
};

type PreferenceRow = {
  id: string;
  eventType: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  webhookEnabled: boolean;
  updatedAt: string;
};

const preferenceTopics = [
  {
    category: "trust",
    description:
      "Review decisions, rejection notes, and verification state changes.",
    eventType: "skill.review",
    label: "Skill review",
  },
  {
    category: "operations",
    description:
      "New versions, deprecations, security notices, and project update inbox events.",
    eventType: "skill.update",
    label: "Skill updates",
  },
  {
    category: "runtime",
    description:
      "Runtime incidents, blocked calls, and quality signals that need operator attention.",
    eventType: "runtime.incident",
    label: "Runtime incidents",
  },
  {
    category: "finance",
    description:
      "Invoice generation, billing profile changes, usage posting, refunds, and disputes.",
    eventType: "finance.billing",
    label: "Billing and disputes",
  },
  {
    category: "publisher",
    description:
      "Payout account onboarding, payout review decisions, blocked payouts, and balance milestones.",
    eventType: "publisher.payout",
    label: "Payouts",
  },
  {
    category: "marketplace",
    description:
      "Buyer request claims, submissions, matches, cancellations, and demand updates.",
    eventType: "buyer.request",
    label: "Buyer requests",
  },
  {
    category: "account",
    description:
      "API keys, organization billing readiness, and sensitive account operations.",
    eventType: "account.security",
    label: "Account and security",
  },
] as const;

export async function listNotificationPreferences(
  userId: string | null | undefined,
) {
  const scopedUserId = requireUserId(userId);
  const sql = await getSql();

  if (!sql) {
    return fallbackPreferences();
  }

  const rows = (await sql`
    select
      id::text,
      event_type as "eventType",
      email_enabled as "emailEnabled",
      in_app_enabled as "inAppEnabled",
      webhook_enabled as "webhookEnabled",
      updated_at as "updatedAt"
    from notification_preferences
    where user_id = ${scopedUserId}
  `) as PreferenceRow[];
  const rowsByType = new Map(rows.map((row) => [row.eventType, row]));

  return preferenceTopics.map((topic) =>
    toPreference(topic, rowsByType.get(topic.eventType)),
  );
}

export async function upsertNotificationPreference(
  userId: string | null | undefined,
  input: PreferenceInput,
) {
  const scopedUserId = requireUserId(userId);
  const eventType = normalizeEventType(input.eventType);
  const sql = await requireSql();
  const topic = getTopic(eventType);
  const emailEnabled = normalizeBoolean(input.emailEnabled, true);
  const inAppEnabled = normalizeBoolean(input.inAppEnabled, true);
  const webhookEnabled = normalizeBoolean(input.webhookEnabled, false);

  const rows = (await sql`
    insert into notification_preferences (
      user_id,
      event_type,
      email_enabled,
      in_app_enabled,
      webhook_enabled,
      updated_at
    )
    values (
      ${scopedUserId},
      ${eventType},
      ${emailEnabled},
      ${inAppEnabled},
      ${webhookEnabled},
      now()
    )
    on conflict (user_id, event_type) do update set
      email_enabled = excluded.email_enabled,
      in_app_enabled = excluded.in_app_enabled,
      webhook_enabled = excluded.webhook_enabled,
      updated_at = now()
    returning
      id::text,
      event_type as "eventType",
      email_enabled as "emailEnabled",
      in_app_enabled as "inAppEnabled",
      webhook_enabled as "webhookEnabled",
      updated_at as "updatedAt"
  `) as PreferenceRow[];
  const preference = toPreference(topic, rows[0]);

  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${scopedUserId},
      'notification_preference.updated',
      'notification_preference',
      ${rows[0].id},
      'User notification preference changed.',
      ${sql.json({
        emailEnabled,
        eventType,
        inAppEnabled,
        webhookEnabled,
      })}
    )
  `;

  return preference;
}

function fallbackPreferences() {
  return preferenceTopics.map((topic) => toPreference(topic));
}

function toPreference(
  topic: (typeof preferenceTopics)[number],
  row?: PreferenceRow,
) {
  return {
    category: topic.category,
    description: topic.description,
    emailEnabled: row?.emailEnabled ?? true,
    eventType: topic.eventType,
    inAppEnabled: row?.inAppEnabled ?? true,
    label: topic.label,
    updatedAt: row?.updatedAt ?? null,
    webhookEnabled: row?.webhookEnabled ?? false,
  };
}

function getTopic(eventType: string) {
  const topic = preferenceTopics.find((item) => item.eventType === eventType);

  if (!topic) {
    throw new Error("notification preference eventType is invalid.");
  }

  return topic;
}

function normalizeEventType(value: unknown) {
  const eventType = String(value ?? "").trim();

  if (!eventType) {
    throw new Error("eventType is required.");
  }

  getTopic(eventType);
  return eventType;
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return value === true || value === "true" || value === "on" || value === "1";
}

function requireUserId(userId: string | null | undefined) {
  if (!userId) {
    throw new Error("Notification preferences require a user-scoped token.");
  }

  return userId;
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error(
      "DATABASE_URL is required for notification preference writes.",
    );
  }

  return sql;
}
