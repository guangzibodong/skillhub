import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type WebhookEndpointInput = {
  description?: unknown;
  events?: unknown;
  status?: unknown;
  url?: unknown;
};

type WebhookStatus = "active" | "disabled" | "paused";
type DeliveryStatus = "delivered" | "failed" | "pending" | "skipped";

export type OrganizationWebhookEndpoint = {
  id: string;
  organizationId: string;
  url: string;
  description: string | null;
  events: string[];
  status: WebhookStatus;
  signingSecretPrefix: string;
  signingSecretLast4: string;
  lastDeliveryStatus: DeliveryStatus | null;
  lastDeliveredAt: string | null;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationWebhookSecret = {
  signingSecret: string;
};

const webhookStatuses: WebhookStatus[] = ["active", "paused", "disabled"];
const defaultEvents = [
  "skill.review",
  "skill.update",
  "runtime.incident",
  "finance.billing",
  "publisher.payout",
  "buyer.request",
  "account.security"
];

export async function listOrganizationWebhookEndpoints(organizationId: string | null | undefined) {
  const sql = await getSql();

  if (!sql || !organizationId) {
    return [];
  }

  return listEndpointRows(sql, organizationId);
}

export async function createOrganizationWebhookEndpoint(
  organizationId: string | null | undefined,
  input: WebhookEndpointInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const url = normalizeUrl(input.url);
  const events = normalizeEvents(input.events);
  const status = normalizeStatus(input.status, "active");
  const description = normalizeNullableText(input.description, 240);
  const signingSecret = `whsec_${randomToken(32)}`;
  const signingSecretHash = await sha256Hex(signingSecret);

  return sql.begin(async (tx: Sql) => {
    const rows = (await tx`
      insert into organization_webhook_endpoints (
        organization_id,
        url,
        description,
        events,
        status,
        signing_secret_hash,
        signing_secret_prefix,
        signing_secret_last4
      )
      values (
        ${orgId},
        ${url},
        ${description},
        ${events},
        ${status},
        ${signingSecretHash},
        'whsec',
        ${signingSecret.slice(-4)}
      )
      returning
        id::text,
        organization_id::text as "organizationId",
        url,
        description,
        events,
        status,
        signing_secret_prefix as "signingSecretPrefix",
        signing_secret_last4 as "signingSecretLast4",
        last_delivery_status as "lastDeliveryStatus",
        last_delivered_at as "lastDeliveredAt",
        failure_count as "failureCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as OrganizationWebhookEndpoint[];
    const endpoint = rows[0];

    await recordWebhookAudit(tx, actorUserId, "organization.webhook.created", endpoint.id, {
      events,
      status,
      url
    });
    await recordWebhookNotification(tx, orgId, "account.webhook.created", "Organization webhook endpoint created", {
      endpointId: endpoint.id,
      events,
      status,
      url
    });

    return {
      endpoint,
      signingSecret
    };
  });
}

export async function updateOrganizationWebhookEndpoint(
  organizationId: string | null | undefined,
  endpointId: string,
  input: WebhookEndpointInput,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const normalizedEndpointId = normalizeRequiredText(endpointId, "endpointId", 80);
  const url = input.url === undefined ? null : normalizeUrl(input.url);
  const events = input.events === undefined ? null : normalizeEvents(input.events);
  const status = input.status === undefined ? null : normalizeStatus(input.status, "active");
  const description = input.description === undefined ? undefined : normalizeNullableText(input.description, 240);

  return sql.begin(async (tx: Sql) => {
    await getEndpointForOrganization(tx, orgId, normalizedEndpointId);

    const rows = (await tx`
      update organization_webhook_endpoints
      set
        url = coalesce(${url}, url),
        description = case when ${description === undefined} then description else ${description ?? null} end,
        events = coalesce(${events}, events),
        status = coalesce(${status}, status),
        updated_at = now()
      where organization_id = ${orgId}
        and id = ${normalizedEndpointId}
      returning
        id::text,
        organization_id::text as "organizationId",
        url,
        description,
        events,
        status,
        signing_secret_prefix as "signingSecretPrefix",
        signing_secret_last4 as "signingSecretLast4",
        last_delivery_status as "lastDeliveryStatus",
        last_delivered_at as "lastDeliveredAt",
        failure_count as "failureCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as OrganizationWebhookEndpoint[];
    const endpoint = rows[0];

    await recordWebhookAudit(tx, actorUserId, "organization.webhook.updated", endpoint.id, {
      events: endpoint.events,
      status: endpoint.status,
      url: endpoint.url
    });
    await recordWebhookNotification(tx, orgId, "account.webhook.updated", "Organization webhook endpoint updated", {
      endpointId: endpoint.id,
      events: endpoint.events,
      status: endpoint.status,
      url: endpoint.url
    });

    return endpoint;
  });
}

export async function rotateOrganizationWebhookSecret(
  organizationId: string | null | undefined,
  endpointId: string,
  actorUserId: string | null | undefined
) {
  const sql = await requireSql();
  const orgId = requireOrganizationId(organizationId);
  const normalizedEndpointId = normalizeRequiredText(endpointId, "endpointId", 80);
  const signingSecret = `whsec_${randomToken(32)}`;
  const signingSecretHash = await sha256Hex(signingSecret);

  return sql.begin(async (tx: Sql) => {
    await getEndpointForOrganization(tx, orgId, normalizedEndpointId);

    const rows = (await tx`
      update organization_webhook_endpoints
      set
        signing_secret_hash = ${signingSecretHash},
        signing_secret_prefix = 'whsec',
        signing_secret_last4 = ${signingSecret.slice(-4)},
        updated_at = now()
      where organization_id = ${orgId}
        and id = ${normalizedEndpointId}
      returning
        id::text,
        organization_id::text as "organizationId",
        url,
        description,
        events,
        status,
        signing_secret_prefix as "signingSecretPrefix",
        signing_secret_last4 as "signingSecretLast4",
        last_delivery_status as "lastDeliveryStatus",
        last_delivered_at as "lastDeliveredAt",
        failure_count as "failureCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `) as OrganizationWebhookEndpoint[];
    const endpoint = rows[0];

    await recordWebhookAudit(tx, actorUserId, "organization.webhook.secret_rotated", endpoint.id, {
      url: endpoint.url
    });
    await recordWebhookNotification(tx, orgId, "account.webhook.secret_rotated", "Organization webhook signing secret rotated", {
      endpointId: endpoint.id,
      url: endpoint.url
    });

    return {
      endpoint,
      signingSecret
    };
  });
}

async function listEndpointRows(sql: Sql, organizationId: string) {
  return (await sql`
    select
      id::text,
      organization_id::text as "organizationId",
      url,
      description,
      events,
      status,
      signing_secret_prefix as "signingSecretPrefix",
      signing_secret_last4 as "signingSecretLast4",
      last_delivery_status as "lastDeliveryStatus",
      last_delivered_at as "lastDeliveredAt",
      failure_count as "failureCount",
      created_at as "createdAt",
      updated_at as "updatedAt"
    from organization_webhook_endpoints
    where organization_id = ${organizationId}
    order by
      case status
        when 'active' then 0
        when 'paused' then 1
        else 2
      end,
      updated_at desc
  `) as OrganizationWebhookEndpoint[];
}

async function getEndpointForOrganization(sql: Sql, organizationId: string, endpointId: string) {
  const rows = (await sql`
    select id::text
    from organization_webhook_endpoints
    where organization_id = ${organizationId}
      and id = ${endpointId}
    limit 1
  `) as Array<{ id: string }>;

  if (!rows[0]) {
    throw new Error("Organization webhook endpoint not found.");
  }

  return rows[0];
}

async function recordWebhookAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  action: string,
  entityId: string,
  metadata: Record<string, unknown>
) {
  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (${actorUserId ?? null}, ${action}, 'organization_webhook_endpoint', ${entityId}, 'Organization webhook endpoint changed.', ${sql.json(metadata)})
  `;
}

async function recordWebhookNotification(
  sql: Sql,
  organizationId: string,
  eventType: string,
  subject: string,
  payload: Record<string, unknown>
) {
  await sql`
    insert into notification_events (organization_id, event_type, channel, subject, payload, status)
    values (${organizationId}, ${eventType}, 'in_app', ${subject}, ${sql.json(payload)}, 'queued')
  `;
}

function normalizeUrl(value: unknown) {
  const url = normalizeRequiredText(value, "url", 500);

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      throw new Error("Webhook endpoint URL must use https.");
    }

    return parsed.toString();
  } catch (error) {
    if (error instanceof Error && error.message === "Webhook endpoint URL must use https.") {
      throw error;
    }

    throw new Error("A valid webhook endpoint URL is required.");
  }
}

function normalizeEvents(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(",");
  const events = raw.map((event) => String(event).trim()).filter(Boolean);

  if (events.length === 0) {
    return defaultEvents;
  }

  return Array.from(new Set(events)).slice(0, 20);
}

function normalizeStatus(value: unknown, fallback: WebhookStatus): WebhookStatus {
  const status = String(value ?? fallback).trim();

  if (!webhookStatuses.includes(status as WebhookStatus)) {
    throw new Error("Webhook status must be active, paused, or disabled.");
  }

  return status as WebhookStatus;
}

function normalizeNullableText(value: unknown, maxLength: number) {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, maxLength) : null;
}

function normalizeRequiredText(value: unknown, label: string, maxLength: number) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(`${label} is required.`);
  }

  return text.slice(0, maxLength);
}

function requireOrganizationId(organizationId: string | null | undefined) {
  if (!organizationId) {
    throw new Error("Organization scope is required.");
  }

  return organizationId;
}

function randomToken(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for organization webhook operations.");
  }

  return sql;
}
