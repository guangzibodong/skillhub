#!/usr/bin/env node

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT_MS = 10000;
const MOJIBAKE_MARKERS = [
  "\uFFFD",
  "\u9359\u621D",
  "\u5BEE\u20AC",
  "\u7039\u2103",
  "\u7490\uFE40",
  "\u9418\u8235",
  "\u93B6\u20AC",
  "\u6D93\u20AC",
];
const VALID_READINESS_STATUSES = new Set([
  "blocker",
  "deferred",
  "ready",
  "warning",
]);

let args;

try {
  args = parseArgs(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  printHelp();
  process.exit(1);
}

if (args.help) {
  printHelp();
  process.exit(0);
}

const config = {
  adminToken:
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_ADMIN_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_ADMIN_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  curationToken:
    process.env.SKILLHUB_P0_ADMIN_CURATION_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_REVIEW_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  financeToken:
    process.env.SKILLHUB_P0_ADMIN_FINANCE_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  reviewToken:
    process.env.SKILLHUB_P0_ADMIN_REVIEW_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  skipApp: args.skipApp,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_ADMIN_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
  trustToken:
    process.env.SKILLHUB_P0_ADMIN_TRUST_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_REVIEW_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
};

const results = [];

console.log("SkillHub P0 admin operations smoke");
console.log(`API: ${config.apiUrl}`);
if (!config.skipApp) {
  console.log(`App: ${config.appUrl}`);
}
console.log("");

if (!config.skipApp) {
  await checkAdminPage(config);
}

await checkAdminProtection(config);

if (!config.adminToken) {
  fail(
    "admin token",
    "set SKILLHUB_P0_ADMIN_TOKEN, SKILLHUB_ADMIN_SMOKE_TOKEN, SKILLHUB_SMOKE_TOKEN, or SKILLHUB_USER_TOKEN",
  );
} else {
  await checkAdminOverview(config);
  await checkLaunchReadiness(config);
  await checkAdminReviews(config);
  await checkAdminFinance(config);
  await checkAdminPayouts(config);
  await checkAdminNotifications(config);
  await checkAdminWebhookDeliveries(config);
  await checkAdminIdentityDirectory(config);
  await checkAdminAuditLogs(config);
  await checkAdminTrustQueues(config);
  await checkAdminMarketplaceQueues(config);
}

printSummary(results);

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
}

async function checkAdminPage({ appUrl, timeoutMs }) {
  const name = "GET app /admin";

  try {
    const response = await requestText(joinUrl(appUrl, "/admin"), {
      timeoutMs,
    });

    if (response.status !== 200) {
      fail(name, `expected HTTP 200, got ${response.status}`);
      return;
    }

    const html = response.text.toLowerCase();
    const markers = [
      "admin operations queue",
      "launch-readiness",
      "review queue",
      "audit",
      "identity",
      "notification",
      "webhook",
    ];
    const missing = markers.filter((marker) => !html.includes(marker));
    const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
      response.text.includes(marker),
    );

    if (!html.includes("<html") && !html.includes("<!doctype html")) {
      fail(name, "expected an HTML document");
      return;
    }

    if (mojibakeMarkers.length > 0) {
      fail(
        name,
        `possible mojibake markers in HTML: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
      );
      return;
    }

    if (missing.length > 0) {
      fail(name, `missing Journey C page markers: ${missing.join(", ")}`);
      return;
    }

    pass(name, `html bytes=${Buffer.byteLength(response.text, "utf8")}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminProtection({ apiUrl, timeoutMs }) {
  const paths = [
    "/v1/admin/launch-readiness",
    "/v1/admin/reviews",
    "/v1/admin/finance/ledger",
    "/v1/admin/identity-directory",
    "/v1/admin/audit-logs",
  ];

  for (const path of paths) {
    const name = `GET ${path} without token`;

    try {
      const { status, json } = await requestJson(joinUrl(apiUrl, path), {
        timeoutMs,
      });

      if (![401, 403].includes(status)) {
        fail(name, `expected HTTP 401/403, got ${status}: ${safeError(json)}`);
        continue;
      }

      pass(name, "protected by role-aware authorization");
    } catch (error) {
      fail(name, redactSecrets(error.message));
    }
  }
}

async function checkAdminOverview({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/overview";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/overview"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.metrics)) {
      fail(name, "expected admin metrics array");
      return;
    }

    const labels = new Set(json.metrics.map((metric) => metric?.label));
    const required = [
      "Review queue",
      "Payout review",
      "Queued notifications",
      "Failed runtime checks",
    ];
    const missing = required.filter((label) => !labels.has(label));

    if (missing.length > 0) {
      fail(name, `missing overview metrics: ${missing.join(", ")}`);
      return;
    }

    pass(name, `metrics=${json.metrics.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkLaunchReadiness({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/launch-readiness";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/launch-readiness"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    const readiness = json?.readiness;
    const summary = readiness?.summary;

    if (
      !readiness ||
      typeof readiness !== "object" ||
      !isFiniteNumber(summary?.blocker) ||
      !isFiniteNumber(summary?.warning) ||
      !isFiniteNumber(summary?.ready) ||
      !isFiniteNumber(summary?.deferred) ||
      !VALID_READINESS_STATUSES.has(String(summary?.status)) ||
      !Array.isArray(readiness.sections)
    ) {
      fail(name, "unexpected launch readiness payload shape");
      return;
    }

    const badSections = readiness.sections.filter(
      (section) =>
        typeof section?.key !== "string" ||
        !VALID_READINESS_STATUSES.has(String(section?.status)) ||
        !Array.isArray(section?.items),
    );

    if (badSections.length > 0) {
      fail(name, "readiness sections must include key, status, and items");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive launch-readiness leak: ${leaks[0]}`);
      return;
    }

    pass(
      name,
      `status=${summary.status}, blockers=${summary.blocker}, warnings=${summary.warning}, sections=${readiness.sections.length}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminReviews({ apiUrl, reviewToken, timeoutMs }) {
  const name = "GET /v1/admin/reviews";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/reviews"),
      authorized(reviewToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.reviews)) {
      fail(name, "expected reviews array");
      return;
    }

    const invalid = json.reviews.filter(
      (review) =>
        typeof review?.id !== "string" ||
        typeof review?.skillSlug !== "string" ||
        typeof review?.status !== "string" ||
        !Array.isArray(review?.runtimeChecks ?? []),
    );

    if (invalid.length > 0) {
      fail(name, "review rows must include id, skillSlug, status, and runtimeChecks");
      return;
    }

    const evidenceRows = json.reviews.filter((review) => review?.reviewEvidence);
    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive review leak: ${leaks[0]}`);
      return;
    }

    pass(
      name,
      `reviews=${json.reviews.length}, evidenceRows=${evidenceRows.length}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminFinance({ apiUrl, financeToken, timeoutMs }) {
  await checkFinanceLedger({ apiUrl, financeToken, timeoutMs });
  await checkCommissionRules({ apiUrl, financeToken, timeoutMs });
  await checkAdjustmentQueue({
    apiUrl,
    financeToken,
    key: "refunds",
    path: "/v1/admin/finance/refunds?limit=8",
    timeoutMs,
  });
  await checkAdjustmentQueue({
    apiUrl,
    financeToken,
    key: "disputes",
    path: "/v1/admin/finance/disputes?limit=8",
    timeoutMs,
  });
}

async function checkFinanceLedger({ apiUrl, financeToken, timeoutMs }) {
  const name = "GET /v1/admin/finance/ledger";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/finance/ledger"),
      authorized(financeToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    const summary = json?.summary;

    if (
      !summary ||
      !isFiniteNumber(summary.grossCents) ||
      !isFiniteNumber(summary.platformFeeCents) ||
      !isFiniteNumber(summary.publisherShareCents) ||
      !isFiniteNumber(summary.unprocessedUsageCount) ||
      !Array.isArray(json?.recentTransactions)
    ) {
      fail(name, "expected immutable ledger summary and recentTransactions");
      return;
    }

    pass(
      name,
      `gross=${summary.grossCents}, pending=${summary.pendingBalanceCents}, rows=${json.recentTransactions.length}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkCommissionRules({ apiUrl, financeToken, timeoutMs }) {
  const name = "GET /v1/admin/finance/commission-rules";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/finance/commission-rules?limit=20"),
      authorized(financeToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.rules)) {
      fail(name, "expected rules array");
      return;
    }

    const invalid = json.rules.filter(
      (rule) =>
        typeof rule?.id !== "string" ||
        !isFiniteNumber(rule?.platformFeeBps) ||
        !isFiniteNumber(rule?.publisherShareBps),
    );

    if (invalid.length > 0) {
      fail(name, "commission rules must include bps fields");
      return;
    }

    pass(name, `rules=${json.rules.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdjustmentQueue({ apiUrl, financeToken, key, path, timeoutMs }) {
  const name = `GET ${path}`;

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, path),
      authorized(financeToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.[key])) {
      fail(name, `expected ${key} array`);
      return;
    }

    pass(name, `${key}=${json[key].length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminPayouts({ apiUrl, financeToken, timeoutMs }) {
  const name = "GET /v1/admin/payouts";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/payouts?limit=8"),
      authorized(financeToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.payouts)) {
      fail(name, "expected payouts array");
      return;
    }

    const missingExplainability = json.payouts.filter(
      (payout) => !("nextAction" in payout) || !("retryCondition" in payout),
    );

    if (missingExplainability.length > 0) {
      fail(name, "payout rows must include nextAction and retryCondition fields");
      return;
    }

    pass(name, `payouts=${json.payouts.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminNotifications({ adminToken, apiUrl, timeoutMs }) {
  await checkAdminNotificationQueue({ adminToken, apiUrl, timeoutMs });
  await checkAdminNotificationDeliveries({ adminToken, apiUrl, timeoutMs });
}

async function checkAdminNotificationQueue({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/notifications";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/notifications?limit=12"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.notifications)) {
      fail(name, "expected notifications array");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive notification leak: ${leaks[0]}`);
      return;
    }

    pass(name, `notifications=${json.notifications.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminNotificationDeliveries({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/notification-deliveries";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/notification-deliveries?limit=12"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.deliveries)) {
      fail(name, "expected deliveries array");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive delivery leak: ${leaks[0]}`);
      return;
    }

    pass(name, `deliveries=${json.deliveries.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminWebhookDeliveries({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/webhook-deliveries";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/webhook-deliveries?limit=12"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.deliveries)) {
      fail(name, "expected webhook deliveries array");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive webhook leak: ${leaks[0]}`);
      return;
    }

    pass(name, `webhookDeliveries=${json.deliveries.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminIdentityDirectory({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/identity-directory";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/identity-directory?limit=12"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    const identity = json?.identity;
    const summary = identity?.summary;

    if (
      !identity ||
      !summary ||
      !isFiniteNumber(summary.userCount) ||
      !isFiniteNumber(summary.organizationCount) ||
      !isFiniteNumber(summary.adminUserCount) ||
      !isFiniteNumber(summary.activeTokenCount) ||
      !Array.isArray(identity.users) ||
      !Array.isArray(identity.organizations)
    ) {
      fail(name, "unexpected identity directory payload shape");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive identity leak: ${leaks[0]}`);
      return;
    }

    pass(
      name,
      `users=${summary.userCount}, orgs=${summary.organizationCount}, activeTokens=${summary.activeTokenCount}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminAuditLogs({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/audit-logs";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/audit-logs?limit=20"),
      authorized(adminToken, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.auditLogs)) {
      fail(name, "expected auditLogs array");
      return;
    }

    const invalid = json.auditLogs.filter(
      (item) =>
        typeof item?.action !== "string" ||
        typeof item?.entityType !== "string" ||
        !item?.metadata ||
        typeof item.metadata !== "object",
    );

    if (invalid.length > 0) {
      fail(name, "audit rows must include action, entityType, and metadata object");
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive audit leak: ${leaks[0]}`);
      return;
    }

    pass(name, `auditLogs=${json.auditLogs.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminTrustQueues({ apiUrl, timeoutMs, trustToken }) {
  await checkArrayEndpoint({
    apiUrl,
    key: "reports",
    name: "GET /v1/admin/abuse-reports",
    path: "/v1/admin/abuse-reports?limit=8",
    timeoutMs,
    token: trustToken,
  });
  await checkArrayEndpoint({
    apiUrl,
    key: "incidents",
    name: "GET /v1/admin/incidents",
    path: "/v1/admin/incidents?limit=8",
    timeoutMs,
    token: trustToken,
  });
  await checkArrayEndpoint({
    apiUrl,
    key: "feedback",
    name: "GET /v1/admin/skill-feedback",
    path: "/v1/admin/skill-feedback?limit=8",
    timeoutMs,
    token: trustToken,
  });
}

async function checkAdminMarketplaceQueues({
  apiUrl,
  curationToken,
  timeoutMs,
}) {
  await checkArrayEndpoint({
    apiUrl,
    key: "curation",
    name: "GET /v1/admin/marketplace-curation",
    path: "/v1/admin/marketplace-curation?limit=8",
    timeoutMs,
    token: curationToken,
  });
  await checkArrayEndpoint({
    apiUrl,
    key: "appeals",
    name: "GET /v1/admin/marketplace-curation/appeals",
    path: "/v1/admin/marketplace-curation/appeals?limit=8",
    timeoutMs,
    token: curationToken,
  });
}

async function checkArrayEndpoint({ apiUrl, key, name, path, timeoutMs, token }) {
  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, path),
      authorized(token, timeoutMs),
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.[key])) {
      fail(name, `expected ${key} array`);
      return;
    }

    const leaks = findSensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive payload leak: ${leaks[0]}`);
      return;
    }

    pass(name, `${key}=${json[key].length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function requestJson(url, options) {
  const response = await request(url, options);
  const text = await response.text();
  let json;

  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(
      `expected JSON from ${url}, got non-JSON response with HTTP ${response.status}`,
    );
  }

  return {
    json,
    status: response.status,
    text,
  };
}

async function requestText(url, options) {
  const response = await request(url, options);

  return {
    status: response.status,
    text: await response.text(),
  };
}

async function request(url, { body, headers = {}, method = "GET", timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      body,
      headers: {
        Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        ...headers,
      },
      method,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`request timed out after ${timeoutMs}ms: ${url}`);
    }

    throw new Error(`${describeFetchError(error)}: ${url}`);
  } finally {
    clearTimeout(timeout);
  }
}

function authorized(token, timeoutMs) {
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    timeoutMs,
  };
}

function parseArgs(argv) {
  const parsed = {
    appUrl: undefined,
    apiUrl: undefined,
    help: false,
    skipApp: false,
    timeoutMs: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }

    if (arg === "--") {
      continue;
    }

    if (arg === "--skip-app") {
      parsed.skipApp = true;
      continue;
    }

    const nextValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--api-url") {
      parsed.apiUrl = nextValue();
      continue;
    }

    if (arg === "--app-url") {
      parsed.appUrl = nextValue();
      continue;
    }

    if (arg === "--timeout-ms") {
      parsed.timeoutMs = nextValue();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function joinUrl(base, path) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const parsed = new URL(base);

  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }

  return new URL(normalizedPath, parsed).toString();
}

function describeFetchError(error) {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause
      : undefined;
  const causeCode = cause && "code" in cause ? cause.code : undefined;

  if (!cause) {
    return message;
  }

  return `${message} (${[causeCode, cause.message].filter(Boolean).join(": ")})`;
}

function safeError(json) {
  return redactSecrets(String(json?.error ?? "no response error body"));
}

function redactSecrets(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+/gi, "Bearer <redacted>")
    .replace(/shub_[A-Za-z0-9._~+/-]+/g, "shub_<redacted>")
    .replace(/skh_[A-Za-z0-9._~+/-]+/g, "skh_<redacted>")
    .replace(/whsec_[A-Za-z0-9._~+/-]+/g, "whsec_<redacted>")
    .replace(/sk-[A-Za-z0-9._~+/-]+/g, "sk-<redacted>");
}

function findSensitiveLeaks(text) {
  const leaks = [];
  const rawPatterns = [
    [/Bearer\s+[A-Za-z0-9._~+/-]+/i, "authorization bearer"],
    [/shub_[A-Za-z0-9._~+/-]{8,}/, "user token"],
    [/skh_[A-Za-z0-9._~+/-]{8,}/, "project api key"],
    [/whsec_[A-Za-z0-9._~+/-]{8,}/, "webhook signing secret"],
    [/sk-[A-Za-z0-9._~+/-]{20,}/, "provider key"],
    [/"deliveryPreviewCode"\s*:/i, "email verification preview code"],
    [/"apiKey"\s*:\s*"[^"<\[]/i, "raw apiKey field"],
  ];

  for (const [pattern, label] of rawPatterns) {
    if (pattern.test(text)) {
      leaks.push(label);
    }
  }

  try {
    const parsed = JSON.parse(text);
    inspectSensitiveKeys(parsed, [], leaks);
  } catch {
    // Pattern scans above still protect non-JSON text.
  }

  return leaks;
}

function inspectSensitiveKeys(value, path, leaks) {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectSensitiveKeys(item, [...path, String(index)], leaks),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    const normalizedKey = key.toLowerCase();

    if (
      typeof child === "string" &&
      normalizedKey === "code" &&
      child &&
      !isRedactedValue(child)
    ) {
      leaks.push(`${nextPath.join(".")} contains an unredacted code`);
    }

    if (
      typeof child === "string" &&
      (normalizedKey === "authorization" ||
        normalizedKey === "password" ||
        normalizedKey === "api_key" ||
        normalizedKey === "apikey") &&
      child &&
      !isRedactedValue(child)
    ) {
      leaks.push(`${nextPath.join(".")} contains sensitive value`);
    }

    inspectSensitiveKeys(child, nextPath, leaks);
  }
}

function isRedactedValue(value) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("redacted") ||
    normalized === "configured" ||
    normalized === "missing" ||
    normalized.startsWith("missing ") ||
    normalized.includes("not configured")
  );
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function formatMarkerCodepoints(marker) {
  return [...marker]
    .map(
      (character) =>
        `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    )
    .join("+");
}

function pass(name, message) {
  results.push({ message, name, status: "pass" });
  console.log(`PASS ${name} - ${message}`);
}

function fail(name, message) {
  results.push({ message, name, status: "fail" });
  console.log(`FAIL ${name} - ${redactSecrets(message)}`);
}

function printSummary(items) {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { fail: 0, pass: 0 },
  );

  console.log("");
  console.log(`Summary: ${counts.pass} passed, ${counts.fail} failed`);
}

function printHelp() {
  console.log(`Usage: node scripts/qa-p0-admin-operations-smoke.mjs [options]

Non-mutating Journey C smoke for admin review, trust, finance, notification,
webhook, identity, launch-readiness, and audit operations.

Options:
  --api-url <url>       Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>       Web app URL. Default: ${DEFAULT_APP_URL}
  --timeout-ms <ms>     Request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-app            Skip the /admin page marker check.
  -h, --help            Show this help.

Environment:
  SKILLHUB_P0_ADMIN_TOKEN or SKILLHUB_ADMIN_SMOKE_TOKEN should be an admin/super_admin token for the full smoke.
  SKILLHUB_P0_ADMIN_REVIEW_TOKEN can override review/trust checks.
  SKILLHUB_P0_ADMIN_FINANCE_TOKEN can override finance/payout checks.
  SKILLHUB_P0_ADMIN_CURATION_TOKEN can override curation checks.

The smoke performs no writes and redacts authorization-shaped strings in output.
`);
}
