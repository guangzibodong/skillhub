#!/usr/bin/env node

import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_VERSION = "0.1.0";

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
    process.env.SKILLHUB_P0_PUBLISH_ADMIN_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_P0_PUBLISH_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  allowProduction:
    args.allowProduction ||
    parseBoolean(process.env.SKILLHUB_P0_PUBLISH_ALLOW_PRODUCTION) ||
    parseBoolean(process.env.SKILLHUB_PUBLISH_SMOKE_ALLOW_PRODUCTION),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_PUBLISH_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_PUBLISH_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  publisherToken:
    process.env.SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_P0_PUBLISH_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  skipAdmin: args.skipAdmin,
  skipApp: args.skipApp,
  slug:
    args.slug ??
    process.env.SKILLHUB_P0_PUBLISH_SLUG ??
    `p0-publish-smoke-${Date.now().toString(36)}`,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_PUBLISH_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
  version:
    args.version ?? process.env.SKILLHUB_P0_PUBLISH_VERSION ?? DEFAULT_VERSION,
};

const results = [];

console.log("SkillHub P0 publish handoff smoke");
console.log(`API: ${config.apiUrl}`);
if (!config.skipApp) {
  console.log(`App: ${config.appUrl}`);
}
console.log(`Skill slug: ${config.slug}`);
console.log(`Version: ${config.version}`);
console.log("");

guardProductionWrite(config);

if (!config.publisherToken) {
  fail(
    "publisher token",
    "set SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN, SKILLHUB_P0_PUBLISH_TOKEN, SKILLHUB_SMOKE_TOKEN, or SKILLHUB_USER_TOKEN",
  );
  printSummary(results);
  process.exitCode = 1;
} else {
  const manifest = buildManifest(config);

  if (!config.skipApp) {
    await checkPublishPage(config);
  }

  const draft = await createDraft(config, manifest);
  const review = draft ? await submitVersion(config, draft) : null;

  if (draft && review) {
    await checkPublisherSkills(config, draft, review);
    await checkPublisherNotification(config, draft, review);

    if (config.skipAdmin) {
      skip("admin review/audit handoff", "--skip-admin was set");
    } else if (!config.adminToken) {
      fail(
        "admin token",
        "set SKILLHUB_P0_PUBLISH_ADMIN_TOKEN or use a token with reviewer/admin access",
      );
    } else {
      await checkAdminReviewQueue(config, draft, review);
      await checkAdminAuditLogs(config, draft, review);
      await checkAdminNotificationQueue(config);
    }
  }

  printSummary(results);

  if (results.some((result) => result.status === "fail")) {
    process.exitCode = 1;
  }
}

async function checkPublishPage({ appUrl, timeoutMs }) {
  const name = "GET app /publish";

  try {
    const response = await requestText(joinUrl(appUrl, "/publish"), {
      timeoutMs,
    });

    if (response.status !== 200) {
      fail(name, `expected HTTP 200, got ${response.status}`);
      return;
    }

    const html = response.text.toLowerCase();

    if (!html.includes("<html") && !html.includes("<!doctype html")) {
      fail(name, "expected an HTML document");
      return;
    }

    pass(name, `html bytes=${Buffer.byteLength(response.text, "utf8")}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function createDraft({ apiUrl, publisherToken, timeoutMs }, manifest) {
  const name = "POST /v1/skills";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/skills"),
      {
        body: JSON.stringify({ manifest }),
        headers: {
          Authorization: `Bearer ${publisherToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return null;
    }

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const required = [
      ["slug", json?.slug],
      ["version", json?.version],
      ["versionId", json?.versionId],
    ].filter(([, value]) => typeof value !== "string" || value.length === 0);

    if (required.length > 0) {
      fail(
        name,
        `missing response fields: ${required.map(([key]) => key).join(", ")}`,
      );
      return null;
    }

    if (json.slug !== manifest.name || json.version !== manifest.version) {
      fail(
        name,
        `response mismatch: slug=${json.slug}, version=${json.version}`,
      );
      return null;
    }

    pass(
      name,
      `draft saved for ${json.slug}@${json.version}, versionId=...${json.versionId.slice(-8)}`,
    );

    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function submitVersion({ apiUrl, publisherToken, timeoutMs }, draft) {
  const path = `/v1/publisher/skills/${encodeURIComponent(draft.slug)}/versions/${encodeURIComponent(draft.version)}/submit`;
  const name = `POST ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      headers: {
        Authorization: `Bearer ${publisherToken}`,
      },
      method: "POST",
      timeoutMs,
    });

    if (!assertNoSensitiveLeaks(name, text)) {
      return null;
    }

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const review = json?.review;
    const summary = review?.checkSummary;

    if (
      !review ||
      typeof review.id !== "string" ||
      review.skillSlug !== draft.slug ||
      review.version !== draft.version ||
      !isFiniteNumber(summary?.totalCount) ||
      !isFiniteNumber(summary?.passedCount) ||
      !isFiniteNumber(summary?.warningCount) ||
      !isFiniteNumber(summary?.failedCount) ||
      !isFiniteNumber(summary?.blockingCount)
    ) {
      fail(name, "unexpected review handoff payload shape");
      return null;
    }

    if (summary.totalCount < 4) {
      fail(
        name,
        `expected at least 4 automated checks, got ${summary.totalCount}`,
      );
      return null;
    }

    pass(
      name,
      `review=...${review.id.slice(-8)}, status=${review.status}, checks=${summary.totalCount}`,
    );

    return review;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublisherSkills(
  { apiUrl, publisherToken, timeoutMs },
  draft,
  review,
) {
  const name = "GET /v1/publisher/skills";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/skills?limit=100"),
      {
        headers: {
          Authorization: `Bearer ${publisherToken}`,
        },
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.skills)) {
      fail(name, "expected skills array");
      return;
    }

    const skill = json.skills.find((item) => item?.slug === draft.slug);
    const version = skill?.versions?.find(
      (item) => item?.version === draft.version,
    );

    if (!skill || !version) {
      fail(
        name,
        `missing ${draft.slug}@${draft.version} in publisher skill list`,
      );
      return;
    }

    if (!["queued", "in_review"].includes(String(version.reviewStatus))) {
      fail(
        name,
        `expected queued/in_review review status, got ${version.reviewStatus}`,
      );
      return;
    }

    if (
      !isFiniteNumber(version.runtimeCheckCount) ||
      version.runtimeCheckCount < review.checkSummary.totalCount
    ) {
      fail(
        name,
        `expected runtime checks to include review checks, got ${version.runtimeCheckCount}`,
      );
      return;
    }

    pass(
      name,
      `${draft.slug}@${draft.version} visible with review=${version.reviewStatus}, checks=${version.runtimeCheckCount}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkPublisherNotification(
  { apiUrl, publisherToken, timeoutMs },
  draft,
  review,
) {
  const name = "GET /v1/notifications";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/notifications?limit=50"),
      {
        headers: {
          Authorization: `Bearer ${publisherToken}`,
        },
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.notifications)) {
      fail(name, "expected notifications array");
      return;
    }

    const notification = json.notifications.find(
      (item) =>
        item?.eventType === "skill.review.submitted" &&
        item?.payload?.skillSlug === draft.slug &&
        item?.payload?.version === draft.version &&
        item?.payload?.reviewId === review.id,
    );

    if (!notification) {
      fail(
        name,
        `missing publisher notification for ${draft.slug}@${draft.version}`,
      );
      return;
    }

    pass(
      name,
      `publisher notification queued for review=...${review.id.slice(-8)}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminReviewQueue(
  { adminToken, apiUrl, timeoutMs },
  draft,
  review,
) {
  const name = "GET /v1/admin/reviews";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/reviews"),
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.reviews)) {
      fail(name, "expected reviews array");
      return;
    }

    const queued = json.reviews.find(
      (item) =>
        item?.id === review.id ||
        (item?.skillSlug === draft.slug && item?.version === draft.version),
    );

    if (!queued) {
      fail(
        name,
        `missing admin review queue row for ${draft.slug}@${draft.version}`,
      );
      return;
    }

    if (
      !Array.isArray(queued.runtimeChecks) ||
      queued.runtimeChecks.length < review.checkSummary.totalCount
    ) {
      fail(
        name,
        `expected review runtime checks, got ${queued.runtimeChecks?.length ?? "none"}`,
      );
      return;
    }

    pass(
      name,
      `admin sees review=...${String(queued.id).slice(-8)}, checks=${queued.runtimeChecks.length}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminAuditLogs(
  { adminToken, apiUrl, timeoutMs },
  draft,
  review,
) {
  const name = "GET /v1/admin/audit-logs";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/audit-logs?limit=100"),
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.auditLogs)) {
      fail(name, "expected auditLogs array");
      return;
    }

    const audit = json.auditLogs.find(
      (item) =>
        item?.action === "skill.review.submitted" &&
        item?.entityId === review.id &&
        item?.metadata?.skillSlug === draft.slug &&
        item?.metadata?.version === draft.version,
    );

    if (!audit) {
      fail(name, `missing audit log for review=...${review.id.slice(-8)}`);
      return;
    }

    pass(
      name,
      `audit recorded ${audit.action} for ${draft.slug}@${draft.version}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminNotificationQueue({ adminToken, apiUrl, timeoutMs }) {
  const name = "GET /v1/admin/notifications";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/notifications?limit=50"),
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        timeoutMs,
      },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.notifications)) {
      fail(name, "expected notifications array");
      return;
    }

    const hasReviewEvent = json.notifications.some(
      (item) => item?.eventType === "skill.review.submitted",
    );

    if (!hasReviewEvent) {
      fail(
        name,
        "missing skill.review.submitted event in admin notification queue",
      );
      return;
    }

    pass(name, "admin notification queue includes skill.review.submitted");
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

function buildManifest({ apiUrl, slug, version }) {
  return {
    schemaVersion: "0.1",
    name: slug,
    displayName: `P0 Publish Smoke ${slug.slice(-6)}`,
    version,
    description:
      "Smoke-test skill used to verify publisher draft, version review submission, admin queue, audit, and notification handoff.",
    author: {
      name: "SkillHub QA",
      url: "https://useskillhub.com",
    },
    tags: ["qa", "p0", "publish"],
    runtime: {
      type: "http",
      entrypoint: joinUrl(apiUrl, "/demo/p0-publish-smoke"),
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: {
          type: "string",
        },
      },
    },
    outputSchema: {
      type: "object",
      required: ["summary"],
      properties: {
        summary: {
          type: "string",
        },
      },
    },
    examples: [
      {
        input: {
          text: "Verify the SkillHub publishing handoff.",
        },
        output: {
          summary: "Publishing handoff verified.",
        },
      },
    ],
    support: {
      email: "support@useskillhub.com",
    },
  };
}

function guardProductionWrite({ allowProduction, apiUrl }) {
  const parsed = new URL(apiUrl);
  const host = parsed.hostname.toLowerCase();
  const isSkillHubProduction =
    host === "api.useskillhub.com" || host === "useskillhub.com";

  if (!isSkillHubProduction || allowProduction) {
    return;
  }

  fail(
    "production write guard",
    "refusing to create smoke-test skills on the production API without --allow-production",
  );
  printSummary(results);
  process.exit(1);
}

function parseArgs(argv) {
  const parsed = {
    allowProduction: false,
    apiUrl: undefined,
    appUrl: undefined,
    help: false,
    skipAdmin: false,
    skipApp: false,
    slug: undefined,
    timeoutMs: undefined,
    version: undefined,
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

    if (arg === "--allow-production") {
      parsed.allowProduction = true;
      continue;
    }

    if (arg === "--skip-admin") {
      parsed.skipAdmin = true;
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

    if (arg === "--slug") {
      parsed.slug = normalizeSlug(nextValue());
      continue;
    }

    if (arg === "--timeout-ms") {
      parsed.timeoutMs = nextValue();
      continue;
    }

    if (arg === "--version") {
      parsed.version = nextValue().trim();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function normalizeSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
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

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function assertNoSensitiveLeaks(name, text) {
  const leaks = findSensitiveLeaks(text);

  if (leaks.length === 0) {
    return true;
  }

  fail(name, `possible sensitive response leak: ${leaks[0]}`);
  return false;
}

function pass(name, message) {
  results.push({ message, name, status: "pass" });
  console.log(`PASS ${name} - ${message}`);
}

function fail(name, message) {
  results.push({ message, name, status: "fail" });
  console.log(`FAIL ${name} - ${message}`);
}

function skip(name, message) {
  results.push({ message, name, status: "skip" });
  console.log(`SKIP ${name} - ${message}`);
}

function printSummary(items) {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { fail: 0, pass: 0, skip: 0 },
  );

  console.log("");
  console.log(
    `Summary: ${counts.pass} passed, ${counts.skip} skipped, ${counts.fail} failed`,
  );
}

function printHelp() {
  console.log(`
Usage: node scripts/qa-p0-publish-handoff-smoke.mjs [options]

This mutating smoke verifies Journey B -> C publish handoff:
  GET /publish
  POST /v1/skills
  POST /v1/publisher/skills/:slug/versions/:version/submit
  GET /v1/publisher/skills
  GET /v1/notifications
  GET /v1/admin/reviews
  GET /v1/admin/audit-logs
  GET /v1/admin/notifications

Options:
  --api-url <url>          API base URL. Default: env or ${DEFAULT_API_URL}
  --app-url <url>          App base URL. Default: env or ${DEFAULT_APP_URL}
  --slug <slug>            Skill slug to create. Default: generated p0-publish-smoke-*
  --version <version>      Semantic version. Default: ${DEFAULT_VERSION}
  --timeout-ms <ms>        Per-request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-app               Skip the /publish page check.
  --skip-admin             Skip admin review, audit, and admin notification checks.
  --allow-production       Allow writes against https://api.useskillhub.com.
  --help                   Show this help.

Tokens:
  Publisher write token:
    SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN, SKILLHUB_P0_PUBLISH_TOKEN,
    SKILLHUB_PUBLISH_SMOKE_TOKEN, SKILLHUB_SMOKE_TOKEN, or SKILLHUB_USER_TOKEN.

  Admin read token:
    SKILLHUB_P0_PUBLISH_ADMIN_TOKEN or SKILLHUB_PUBLISH_SMOKE_ADMIN_TOKEN.
    If omitted, the script tries the publisher token for admin checks.

Do not commit tokens or paste token values into reports. Output redacts authorization-shaped strings.
`);
}
