import { getSql } from "./registry.js";

type Sql = NonNullable<Awaited<ReturnType<typeof getSql>>>;

type WebhookDeliveryStatus = "delivered" | "failed" | "pending" | "processing" | "skipped";
type WebhookDeliveryProcessMode = "deliver" | "dry_run";

type WebhookDeliveryProcessInput = {
  limit?: unknown;
  mode?: unknown;
};

type WebhookDeliveryRuntimeEnv = {
  SKILLHUB_ENV?: string;
  SKILLHUB_WEBHOOK_MAX_ATTEMPTS?: string;
  SKILLHUB_WEBHOOK_TIMEOUT_MS?: string;
};

type WebhookDeliveryRow = {
  id: string;
  organizationId: string;
  endpointId: string | null;
  endpointDescription: string | null;
  endpointFailureCount: number | null;
  endpointStatus: "active" | "disabled" | "paused" | null;
  endpointUrl: string | null;
  eventType: string;
  organizationName: string | null;
  payload: Record<string, unknown>;
  responseBody: string | null;
  responseStatus: number | null;
  signingSecretHash: string | null;
  status: WebhookDeliveryStatus;
  attemptCount: number;
  nextAttemptAt: string | null;
  lastAttemptedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type WebhookDeliveryOutcome = {
  message: string;
  nextAttemptAt: string | null;
  responseBody: string | null;
  responseStatus: number | null;
  status: Exclude<WebhookDeliveryStatus, "pending" | "processing">;
};

export type AdminWebhookDeliveryRecord = {
  id: string;
  organizationId: string;
  organizationName: string | null;
  endpointId: string | null;
  endpointUrl: string | null;
  endpointStatus: "active" | "disabled" | "paused" | null;
  eventType: string;
  payloadSummary: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attemptCount: number;
  nextAttemptAt: string | null;
  lastAttemptedAt: string | null;
  deliveredAt: string | null;
  responseStatus: number | null;
  responseBody: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminWebhookDeliveryProcessItem = {
  id: string;
  endpointUrl: string | null;
  eventType: string;
  message: string;
  responseStatus: number | null;
  status: "delivered" | "failed" | "skipped" | "would_deliver" | "would_fail" | "would_skip";
};

export type AdminWebhookDeliveryProcessResult = {
  deliveredCount: number;
  failedCount: number;
  mode: WebhookDeliveryProcessMode;
  processed: AdminWebhookDeliveryProcessItem[];
  processedCount: number;
  skippedCount: number;
};

const fallbackWebhookDeliveries: AdminWebhookDeliveryRecord[] = [
  {
    id: "demo-webhook-outbox-incident",
    organizationId: "demo-org",
    organizationName: "Demo Builder Lab",
    endpointId: "demo-webhook-ops",
    endpointUrl: "https://example.com/skillhub/webhooks",
    endpointStatus: "active",
    eventType: "runtime.incident.opened",
    payloadSummary: {
      notificationEventId: "demo-notification",
      payload: "[object]"
    },
    status: "failed",
    attemptCount: 2,
    nextAttemptAt: "demo",
    lastAttemptedAt: "demo",
    deliveredAt: null,
    responseStatus: 503,
    responseBody: "Endpoint returned 503.",
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-webhook-outbox-review",
    organizationId: "demo-org",
    organizationName: "Demo Builder Lab",
    endpointId: "demo-webhook-ops",
    endpointUrl: "https://example.com/skillhub/webhooks",
    endpointStatus: "active",
    eventType: "skill.review.approved",
    payloadSummary: {
      notificationEventId: "demo-review-notification",
      payload: "[object]"
    },
    status: "pending",
    attemptCount: 0,
    nextAttemptAt: "demo",
    lastAttemptedAt: null,
    deliveredAt: null,
    responseStatus: null,
    responseBody: null,
    createdAt: "demo",
    updatedAt: "demo"
  }
];

export async function listAdminWebhookDeliveries(
  limit = 25,
  options: { status?: string | null } = {}
): Promise<AdminWebhookDeliveryRecord[]> {
  const sql = await getSql();
  const safeLimit = normalizeLimit(limit);

  if (!sql) {
    return fallbackWebhookDeliveries.slice(0, safeLimit);
  }

  const status = normalizeOptionalStatus(options.status);
  const rows = await selectWebhookDeliveries(sql, safeLimit, status);
  return rows.map(toWebhookDeliveryRecord);
}

export async function processWebhookDeliveries(
  input: WebhookDeliveryProcessInput = {},
  env?: WebhookDeliveryRuntimeEnv,
  actorUserId?: string | null
): Promise<AdminWebhookDeliveryProcessResult> {
  const sql = await requireSql();
  const limit = normalizeLimit(Number(input.limit) || 10, 50);
  const mode = normalizeProcessMode(input.mode);
  const maxAttempts = normalizeMaxAttempts(env);
  const rows =
    mode === "deliver"
      ? await claimDueWebhookDeliveries(sql, limit, maxAttempts)
      : await selectDueWebhookDeliveries(sql, limit, maxAttempts);
  const processed: AdminWebhookDeliveryProcessItem[] = [];

  for (const row of rows) {
    const outcome = await prepareWebhookDeliveryOutcome(row, env, mode);

    if (mode === "deliver") {
      await applyWebhookDeliveryOutcome(sql, row, outcome);
    }

    processed.push({
      id: row.id,
      endpointUrl: row.endpointUrl,
      eventType: row.eventType,
      message: outcome.message,
      responseStatus: outcome.responseStatus,
      status: mode === "dry_run" ? dryRunStatus(outcome.status) : outcome.status
    });
  }

  if (mode === "deliver" && processed.length > 0) {
    await recordWebhookDeliveryProcessAudit(sql, actorUserId, processed);
  }

  return summarizeWebhookProcess(mode, processed);
}

async function selectWebhookDeliveries(sql: Sql, limit: number, status: WebhookDeliveryStatus | null) {
  return (await sql`
    select
      w.id::text,
      w.organization_id::text as "organizationId",
      w.endpoint_id::text as "endpointId",
      w.event_type as "eventType",
      w.payload,
      w.status,
      w.attempt_count as "attemptCount",
      w.next_attempt_at as "nextAttemptAt",
      w.last_attempted_at as "lastAttemptedAt",
      w.delivered_at as "deliveredAt",
      w.response_status as "responseStatus",
      w.response_body as "responseBody",
      w.created_at as "createdAt",
      w.updated_at as "updatedAt",
      e.url as "endpointUrl",
      e.description as "endpointDescription",
      e.status as "endpointStatus",
      e.signing_secret_hash as "signingSecretHash",
      e.failure_count as "endpointFailureCount",
      o.name as "organizationName"
    from webhook_delivery_events w
    left join organization_webhook_endpoints e on e.id = w.endpoint_id
    left join organizations o on o.id = w.organization_id
    where (${status}::text is null or w.status = ${status})
    order by
      case w.status
        when 'failed' then 0
        when 'processing' then 1
        when 'pending' then 2
        when 'skipped' then 3
        else 4
      end,
      coalesce(w.next_attempt_at, w.updated_at, w.created_at) asc,
      w.created_at desc
    limit ${limit}
  `) as WebhookDeliveryRow[];
}

async function selectDueWebhookDeliveries(sql: Sql, limit: number, maxAttempts: number) {
  const staleProcessingCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  return (await sql`
    select
      w.id::text,
      w.organization_id::text as "organizationId",
      w.endpoint_id::text as "endpointId",
      w.event_type as "eventType",
      w.payload,
      w.status,
      w.attempt_count as "attemptCount",
      w.next_attempt_at as "nextAttemptAt",
      w.last_attempted_at as "lastAttemptedAt",
      w.delivered_at as "deliveredAt",
      w.response_status as "responseStatus",
      w.response_body as "responseBody",
      w.created_at as "createdAt",
      w.updated_at as "updatedAt",
      e.url as "endpointUrl",
      e.description as "endpointDescription",
      e.status as "endpointStatus",
      e.signing_secret_hash as "signingSecretHash",
      e.failure_count as "endpointFailureCount",
      o.name as "organizationName"
    from webhook_delivery_events w
    left join organization_webhook_endpoints e on e.id = w.endpoint_id
    left join organizations o on o.id = w.organization_id
    where (
      w.status in ('pending', 'failed')
      and w.attempt_count < ${maxAttempts}
      and (w.next_attempt_at is null or w.next_attempt_at <= now())
    ) or (
      w.status = 'processing'
      and w.attempt_count < ${maxAttempts}
      and w.updated_at <= ${staleProcessingCutoff}
    )
    order by
      case w.status when 'failed' then 0 when 'processing' then 1 else 2 end,
      coalesce(w.next_attempt_at, w.updated_at, w.created_at) asc,
      w.created_at asc
    limit ${limit}
  `) as WebhookDeliveryRow[];
}

async function claimDueWebhookDeliveries(sql: Sql, limit: number, maxAttempts: number) {
  const staleProcessingCutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  return (await sql`
    with due as (
      select w.id
      from webhook_delivery_events w
      where (
        w.status in ('pending', 'failed')
        and w.attempt_count < ${maxAttempts}
        and (w.next_attempt_at is null or w.next_attempt_at <= now())
      ) or (
        w.status = 'processing'
        and w.attempt_count < ${maxAttempts}
        and w.updated_at <= ${staleProcessingCutoff}
      )
      order by
        case w.status when 'failed' then 0 when 'processing' then 1 else 2 end,
        coalesce(w.next_attempt_at, w.updated_at, w.created_at) asc,
        w.created_at asc
      limit ${limit}
      for update skip locked
    ),
    claimed as (
      update webhook_delivery_events w
      set
        status = 'processing',
        attempt_count = w.attempt_count + 1,
        last_attempted_at = now(),
        next_attempt_at = null,
        response_status = null,
        response_body = null,
        updated_at = now()
      from due
      where w.id = due.id
      returning
        w.id,
        w.organization_id,
        w.endpoint_id,
        w.event_type,
        w.payload,
        w.status,
        w.attempt_count,
        w.next_attempt_at,
        w.last_attempted_at,
        w.delivered_at,
        w.response_status,
        w.response_body,
        w.created_at,
        w.updated_at
    )
    select
      c.id::text,
      c.organization_id::text as "organizationId",
      c.endpoint_id::text as "endpointId",
      c.event_type as "eventType",
      c.payload,
      c.status,
      c.attempt_count as "attemptCount",
      c.next_attempt_at as "nextAttemptAt",
      c.last_attempted_at as "lastAttemptedAt",
      c.delivered_at as "deliveredAt",
      c.response_status as "responseStatus",
      c.response_body as "responseBody",
      c.created_at as "createdAt",
      c.updated_at as "updatedAt",
      e.url as "endpointUrl",
      e.description as "endpointDescription",
      e.status as "endpointStatus",
      e.signing_secret_hash as "signingSecretHash",
      e.failure_count as "endpointFailureCount",
      o.name as "organizationName"
    from claimed c
    left join organization_webhook_endpoints e on e.id = c.endpoint_id
    left join organizations o on o.id = c.organization_id
  `) as WebhookDeliveryRow[];
}

async function prepareWebhookDeliveryOutcome(
  row: WebhookDeliveryRow,
  env: WebhookDeliveryRuntimeEnv | undefined,
  mode: WebhookDeliveryProcessMode
): Promise<WebhookDeliveryOutcome> {
  if (!row.endpointId || !row.endpointUrl) {
    return {
      message: "Webhook endpoint is missing or was deleted before delivery.",
      nextAttemptAt: null,
      responseBody: "Webhook endpoint is missing or was deleted before delivery.",
      responseStatus: null,
      status: "skipped"
    };
  }

  if (row.endpointStatus !== "active") {
    return {
      message: `Webhook endpoint is ${row.endpointStatus ?? "unavailable"} and was skipped.`,
      nextAttemptAt: null,
      responseBody: `Webhook endpoint is ${row.endpointStatus ?? "unavailable"} and was skipped.`,
      responseStatus: null,
      status: "skipped"
    };
  }

  if (!row.signingSecretHash) {
    return {
      message: "Webhook endpoint is missing signing material.",
      nextAttemptAt: computeNextAttemptAt(row.attemptCount, env),
      responseBody: "Webhook endpoint is missing signing material.",
      responseStatus: null,
      status: "failed"
    };
  }

  if (mode === "dry_run") {
    return {
      message: "Webhook endpoint is active and would receive a signed HTTP POST.",
      nextAttemptAt: null,
      responseBody: null,
      responseStatus: null,
      status: "delivered"
    };
  }

  return deliverWebhook(row, env);
}

async function deliverWebhook(row: WebhookDeliveryRow, env: WebhookDeliveryRuntimeEnv | undefined): Promise<WebhookDeliveryOutcome> {
  const body = JSON.stringify({
    createdAt: row.createdAt,
    deliveryId: row.id,
    eventType: row.eventType,
    organizationId: row.organizationId,
    payload: row.payload
  });
  const signature = await createWebhookSignature(row, body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), normalizeTimeoutMs(env));

  try {
    const response = await fetch(row.endpointUrl ?? "", {
      body,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SkillHub-Webhook/1.0",
        "X-SkillHub-Delivery": row.id,
        "X-SkillHub-Event": row.eventType,
        "X-SkillHub-Signature": signature.signature,
        "X-SkillHub-Signature-Version": signature.version,
        "X-SkillHub-Timestamp": signature.timestamp
      },
      method: "POST",
      signal: controller.signal
    });
    const responseBody = await readResponseBody(response);

    if (response.ok) {
      return {
        message: `Webhook delivered with HTTP ${response.status}.`,
        nextAttemptAt: null,
        responseBody,
        responseStatus: response.status,
        status: "delivered"
      };
    }

    return {
      message: `Webhook endpoint returned HTTP ${response.status}.`,
      nextAttemptAt: computeNextAttemptAt(row.attemptCount, env),
      responseBody,
      responseStatus: response.status,
      status: "failed"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook fetch failed.";

    return {
      message: `Webhook delivery failed: ${message}`,
      nextAttemptAt: computeNextAttemptAt(row.attemptCount, env),
      responseBody: message.slice(0, 2000),
      responseStatus: null,
      status: "failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function applyWebhookDeliveryOutcome(sql: Sql, row: WebhookDeliveryRow, outcome: WebhookDeliveryOutcome) {
  await sql`
    update webhook_delivery_events
    set
      status = ${outcome.status},
      next_attempt_at = ${outcome.nextAttemptAt},
      delivered_at = ${outcome.status === "delivered" ? sql`now()` : null},
      response_status = ${outcome.responseStatus},
      response_body = ${outcome.responseBody},
      updated_at = now()
    where id = ${row.id}
      and status = 'processing'
  `;

  if (!row.endpointId) {
    return;
  }

  if (outcome.status === "delivered") {
    await sql`
      update organization_webhook_endpoints
      set
        last_delivery_status = 'delivered',
        last_delivered_at = now(),
        failure_count = 0,
        updated_at = now()
      where id = ${row.endpointId}
    `;
    return;
  }

  if (outcome.status === "failed") {
    await sql`
      update organization_webhook_endpoints
      set
        last_delivery_status = 'failed',
        failure_count = failure_count + 1,
        updated_at = now()
      where id = ${row.endpointId}
    `;
    return;
  }

  await sql`
    update organization_webhook_endpoints
    set
      last_delivery_status = 'skipped',
      updated_at = now()
    where id = ${row.endpointId}
  `;
}

async function recordWebhookDeliveryProcessAudit(
  sql: Sql,
  actorUserId: string | null | undefined,
  processed: AdminWebhookDeliveryProcessItem[]
) {
  const summary = summarizeWebhookItems(processed);

  await sql`
    insert into admin_audit_logs (actor_user_id, action, entity_type, entity_id, reason, metadata)
    values (
      ${actorUserId ?? null},
      'webhook.delivery.processed',
      'webhook_delivery_event',
      null,
      'Webhook outbox delivery batch processed.',
      ${sql.json(summary)}
    )
  `;
  await sql`
    insert into notification_events (event_type, channel, subject, payload, status)
    values (
      'platform.webhook_delivery.processed',
      'in_app',
      'Webhook delivery batch processed',
      ${sql.json(summary)},
      'queued'
    )
  `;
}

async function createWebhookSignature(row: WebhookDeliveryRow, body: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const version = "v0-hashed-secret";
  const signingPayload = `${timestamp}.${row.id}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(row.signingSecretHash ?? ""),
    {
      hash: "SHA-256",
      name: "HMAC"
    },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingPayload));

  return {
    signature: `v0=${bytesToHex(new Uint8Array(signatureBytes))}`,
    timestamp,
    version
  };
}

async function readResponseBody(response: Response) {
  const text = await response.text().catch(() => "");
  return (text || response.statusText || "No response body.").slice(0, 2000);
}

function computeNextAttemptAt(attemptCount: number, env: WebhookDeliveryRuntimeEnv | undefined) {
  if (attemptCount >= normalizeMaxAttempts(env)) {
    return null;
  }

  const delaySeconds = [60, 300, 1800, 7200, 21600, 86400][Math.min(Math.max(attemptCount - 1, 0), 5)];
  return new Date(Date.now() + delaySeconds * 1000).toISOString();
}

function normalizeMaxAttempts(env: WebhookDeliveryRuntimeEnv | undefined) {
  return Math.min(Math.max(Math.trunc(Number(getRuntimeEnv(env, "SKILLHUB_WEBHOOK_MAX_ATTEMPTS")) || 8), 1), 20);
}

function normalizeTimeoutMs(env: WebhookDeliveryRuntimeEnv | undefined) {
  return Math.min(Math.max(Math.trunc(Number(getRuntimeEnv(env, "SKILLHUB_WEBHOOK_TIMEOUT_MS")) || 8000), 1000), 30000);
}

function getRuntimeEnv(env: WebhookDeliveryRuntimeEnv | undefined, key: keyof WebhookDeliveryRuntimeEnv) {
  return env?.[key] ?? getProcessEnv(String(key));
}

function getProcessEnv(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}

function summarizeWebhookProcess(
  mode: WebhookDeliveryProcessMode,
  processed: AdminWebhookDeliveryProcessItem[]
): AdminWebhookDeliveryProcessResult {
  const summary = summarizeWebhookItems(processed);

  return {
    deliveredCount: summary.deliveredCount,
    failedCount: summary.failedCount,
    mode,
    processed,
    processedCount: processed.length,
    skippedCount: summary.skippedCount
  };
}

function summarizeWebhookItems(processed: AdminWebhookDeliveryProcessItem[]) {
  return {
    deliveredCount: processed.filter((item) => item.status === "delivered" || item.status === "would_deliver").length,
    failedCount: processed.filter((item) => item.status === "failed" || item.status === "would_fail").length,
    processedCount: processed.length,
    skippedCount: processed.filter((item) => item.status === "skipped" || item.status === "would_skip").length
  };
}

function dryRunStatus(status: WebhookDeliveryOutcome["status"]): AdminWebhookDeliveryProcessItem["status"] {
  if (status === "delivered") {
    return "would_deliver";
  }

  if (status === "failed") {
    return "would_fail";
  }

  return "would_skip";
}

function normalizeProcessMode(value: unknown): WebhookDeliveryProcessMode {
  const mode = String(value ?? "deliver").trim();

  if (mode === "deliver" || mode === "dry_run") {
    return mode;
  }

  throw new Error("Webhook delivery process mode must be deliver or dry_run.");
}

function normalizeOptionalStatus(value: string | null | undefined): WebhookDeliveryStatus | null {
  const status = String(value ?? "").trim();

  if (!status) {
    return null;
  }

  if (status === "delivered" || status === "failed" || status === "pending" || status === "processing" || status === "skipped") {
    return status;
  }

  throw new Error("Webhook delivery status must be pending, processing, delivered, failed, or skipped.");
}

function normalizeLimit(limit: number, max = 100) {
  return Math.min(Math.max(Math.trunc(Number(limit) || 25), 1), max);
}

function toWebhookDeliveryRecord(row: WebhookDeliveryRow): AdminWebhookDeliveryRecord {
  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationName: row.organizationName ?? null,
    endpointId: row.endpointId,
    endpointUrl: row.endpointUrl,
    endpointStatus: row.endpointStatus,
    eventType: row.eventType,
    payloadSummary: summarizePayload(row.payload),
    status: row.status,
    attemptCount: row.attemptCount,
    nextAttemptAt: row.nextAttemptAt,
    lastAttemptedAt: row.lastAttemptedAt,
    deliveredAt: row.deliveredAt,
    responseStatus: row.responseStatus,
    responseBody: row.responseBody ? row.responseBody.slice(0, 400) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function summarizePayload(payload: Record<string, unknown> | undefined) {
  const summary: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload ?? {}).slice(0, 8)) {
    if (isSensitivePayloadKey(key)) {
      summary[key] = "[redacted]";
    } else if (typeof value === "string") {
      summary[key] = value.length > 140 ? `${value.slice(0, 137)}...` : value;
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      summary[key] = value;
    } else if (Array.isArray(value)) {
      summary[key] = `[${value.length} items]`;
    } else if (typeof value === "object") {
      summary[key] = "[object]";
    }
  }

  return summary;
}

function isSensitivePayloadKey(key: string) {
  const normalized = key.toLowerCase();
  return normalized.includes("code") || normalized.includes("token") || normalized.includes("secret");
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function requireSql(): Promise<Sql> {
  const sql = await getSql();

  if (!sql) {
    throw new Error("DATABASE_URL is required for webhook delivery operations.");
  }

  return sql;
}
