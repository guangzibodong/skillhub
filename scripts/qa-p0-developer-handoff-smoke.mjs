#!/usr/bin/env node

import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_SKILL_SLUG = "browser-research";
const DEFAULT_SKILL_PAGE_PATH = "/skills/browser-research-pro";
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
    process.env.SKILLHUB_P0_DEVELOPER_ADMIN_TOKEN ??
    process.env.SKILLHUB_DEVELOPER_SMOKE_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_DEVELOPER_TOKEN ??
    process.env.SKILLHUB_DEVELOPER_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  allowProduction:
    args.allowProduction ||
    parseBoolean(process.env.SKILLHUB_P0_DEVELOPER_ALLOW_PRODUCTION) ||
    parseBoolean(process.env.SKILLHUB_DEVELOPER_SMOKE_ALLOW_PRODUCTION),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_DEVELOPER_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_DEVELOPER_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  collectionName:
    args.collection ??
    process.env.SKILLHUB_P0_DEVELOPER_COLLECTION ??
    "p0-evaluation",
  developerToken:
    process.env.SKILLHUB_P0_DEVELOPER_TOKEN ??
    process.env.SKILLHUB_DEVELOPER_SMOKE_TOKEN ??
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN,
  projectSlug:
    args.projectSlug ??
    process.env.SKILLHUB_P0_DEVELOPER_PROJECT_SLUG ??
    `p0-dev-smoke-${Date.now().toString(36)}`,
  skillPagePath:
    args.skillPagePath ??
    process.env.SKILLHUB_P0_DEVELOPER_SKILL_PAGE_PATH ??
    DEFAULT_SKILL_PAGE_PATH,
  skillSlug:
    args.skillSlug ??
    process.env.SKILLHUB_P0_DEVELOPER_SKILL_SLUG ??
    DEFAULT_SKILL_SLUG,
  skipAdmin: args.skipAdmin,
  skipApp: args.skipApp,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_DEVELOPER_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
};

const results = [];

console.log("SkillHub P0 developer handoff smoke");
console.log(`API: ${config.apiUrl}`);
if (!config.skipApp) {
  console.log(`App: ${config.appUrl}`);
}
console.log(`Project slug: ${config.projectSlug}`);
console.log(`Skill slug: ${config.skillSlug}`);
console.log("");

guardProductionWrite(config);

if (!config.developerToken) {
  fail(
    "developer token",
    "set SKILLHUB_P0_DEVELOPER_TOKEN, SKILLHUB_DEVELOPER_SMOKE_TOKEN, SKILLHUB_SMOKE_TOKEN, or SKILLHUB_USER_TOKEN",
  );
  printSummary(results);
  process.exitCode = 1;
} else {
  if (!config.skipApp) {
    await checkAppHandoffPages(config);
  }

  const skill = await checkPublicSkill(config);
  const project = skill ? await createDeveloperProject(config) : null;
  const savedSkill = project ? await saveSkill(config) : null;
  const install = savedSkill ? await installSkill(config) : null;
  const apiKey = install ? await createProjectApiKey(config) : null;
  const runtimeResult = install ? await testProjectRuntime(config) : null;

  if (project && savedSkill && install && apiKey && runtimeResult) {
    await checkProjectDetail(config, { apiKey, runtimeResult });
    await checkDeveloperNotifications(config, {
      apiKey,
      install,
      project,
      runtimeResult,
    });

    if (config.skipAdmin) {
      skip("admin audit handoff", "--skip-admin was set");
    } else if (!config.adminToken) {
      fail(
        "admin token",
        "set SKILLHUB_P0_DEVELOPER_ADMIN_TOKEN or use a token with admin/support access",
      );
    } else {
      await checkAdminAuditLogs(config, { apiKey, install, project });
    }
  }

  printSummary(results);

  if (results.some((result) => result.status === "fail")) {
    process.exitCode = 1;
  }
}

async function checkAppHandoffPages({ appUrl, skillPagePath, timeoutMs }) {
  const pages = [
    ["/marketplace", ["after install", "project install", "policy gate"]],
    [skillPagePath, ["developer handoff", "runtime key", "governed test"]],
    ["/developer", ["developer operations queue", "team access", "webhook"]],
    ["/dashboard", ["workspace-command-center", "p0-demo-chain"]],
  ];

  for (const [path, markers] of pages) {
    const name = `GET app ${path}`;

    try {
      const response = await requestText(joinUrl(appUrl, path), { timeoutMs });

      if (response.status !== 200) {
        fail(name, `expected HTTP 200, got ${response.status}`);
        continue;
      }

      const html = response.text.toLowerCase();
      const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
        response.text.includes(marker),
      );
      const missing = markers.filter((marker) => !html.includes(marker));

      if (!html.includes("<html") && !html.includes("<!doctype html")) {
        fail(name, "expected an HTML document");
        continue;
      }

      if (mojibakeMarkers.length > 0) {
        fail(
          name,
          `possible mojibake markers in HTML: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
        );
        continue;
      }

      if (missing.length > 0) {
        fail(name, `missing Journey A page markers: ${missing.join(", ")}`);
        continue;
      }

      pass(name, `html bytes=${Buffer.byteLength(response.text, "utf8")}`);
    } catch (error) {
      fail(name, redactSecrets(error.message));
    }
  }
}

async function checkPublicSkill({ apiUrl, skillSlug, timeoutMs }) {
  const name = `GET /v1/skills/${skillSlug}`;

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/${encodeURIComponent(skillSlug)}`),
      { timeoutMs },
    );

    if (!assertNoSensitiveLeaks(name, text)) {
      return null;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const manifest = json?.manifest ?? json;

    if (
      !manifest ||
      manifest.name !== skillSlug ||
      typeof manifest.version !== "string" ||
      !manifest.runtime ||
      !manifest.inputSchema
    ) {
      fail(name, "unexpected skill manifest shape");
      return null;
    }

    pass(
      name,
      `${skillSlug}@${manifest.version} available for developer install`,
    );
    return manifest;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function createDeveloperProject({
  apiUrl,
  developerToken,
  projectSlug,
  timeoutMs,
}) {
  const name = "POST /v1/developer/projects";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/developer/projects"),
      {
        body: JSON.stringify({
          name: `P0 Developer Smoke ${projectSlug}`,
          slug: projectSlug,
        }),
        headers: {
          Authorization: `Bearer ${developerToken}`,
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

    const project = json?.project;

    if (
      !project ||
      project.slug !== projectSlug ||
      typeof project.id !== "string"
    ) {
      fail(name, "unexpected developer project payload shape");
      return null;
    }

    pass(name, `project created: ${project.slug}`);
    return project;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function saveSkill({
  apiUrl,
  collectionName,
  developerToken,
  projectSlug,
  skillSlug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/saved-skills`;
  const name = `POST ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        collectionName,
        skillSlug,
      }),
      headers: {
        Authorization: `Bearer ${developerToken}`,
        "Content-Type": "application/json",
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

    const savedSkill = json?.savedSkill;

    if (
      !savedSkill ||
      savedSkill.skillSlug !== skillSlug ||
      savedSkill.projectSlug !== projectSlug ||
      savedSkill.collectionName !== collectionName
    ) {
      fail(name, "unexpected saved-skill payload shape");
      return null;
    }

    pass(name, `${skillSlug} saved to ${projectSlug}/${collectionName}`);
    return savedSkill;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function installSkill({
  apiUrl,
  developerToken,
  projectSlug,
  skillSlug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/installed-skills`;
  const name = `POST ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({ skillSlug }),
      headers: {
        Authorization: `Bearer ${developerToken}`,
        "Content-Type": "application/json",
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

    const install = json?.install;

    if (
      !install ||
      install.skillSlug !== skillSlug ||
      install.projectSlug !== projectSlug ||
      install.status !== "installed" ||
      !["approved", "owner_required"].includes(String(install.approvalState))
    ) {
      fail(name, "unexpected install payload shape");
      return null;
    }

    pass(
      name,
      `${skillSlug} installed with approval=${install.approvalState}, risk=${install.permissionLevel}`,
    );
    return install;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function createProjectApiKey({
  apiUrl,
  developerToken,
  projectSlug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/api-keys`;
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({ name: "P0 developer smoke key" }),
      headers: {
        Authorization: `Bearer ${developerToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const apiKey = json?.apiKey;

    if (
      !apiKey ||
      typeof apiKey.id !== "string" ||
      typeof apiKey.apiKey !== "string" ||
      !apiKey.apiKey.startsWith("skh_") ||
      apiKey.projectSlug !== projectSlug ||
      typeof apiKey.keyLast4 !== "string"
    ) {
      fail(name, "unexpected reveal-once API-key payload shape");
      return null;
    }

    pass(
      name,
      `project API key created: id=...${apiKey.id.slice(-8)}, last4=${apiKey.keyLast4}`,
    );
    return apiKey;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function testProjectRuntime({
  apiUrl,
  developerToken,
  projectSlug,
  skillSlug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/runtime/test`;
  const name = `POST ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        input: {
          query: "P0 developer handoff smoke",
        },
        skillSlug,
      }),
      headers: {
        Authorization: `Bearer ${developerToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      timeoutMs,
    });

    if (!assertNoSensitiveLeaks(name, text)) {
      return null;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (
      json?.status !== "success" ||
      json?.mode !== "console_test" ||
      json?.skillSlug !== skillSlug ||
      json?.projectSlug !== projectSlug ||
      json?.billable !== false ||
      typeof json?.invocationId !== "string"
    ) {
      fail(name, "unexpected runtime test payload shape");
      return null;
    }

    pass(
      name,
      `non-billable runtime test invocation=...${json.invocationId.slice(-8)}`,
    );
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkProjectDetail(
  { apiUrl, developerToken, projectSlug, skillSlug, timeoutMs },
  { apiKey, runtimeResult },
) {
  const path = `/v1/developer/projects/${encodeURIComponent(projectSlug)}`;
  const name = `GET ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      headers: {
        Authorization: `Bearer ${developerToken}`,
      },
      timeoutMs,
    });

    if (!assertNoSensitiveLeaks(name, text)) {
      return;
    }

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    const detail = json?.project;

    if (!detail || detail.project?.slug !== projectSlug) {
      fail(name, "unexpected project detail shape");
      return;
    }

    const installed = detail.installedSkills?.find(
      (item) => item?.skillSlug === skillSlug,
    );
    const listedKey = detail.apiKeys?.find((item) => item?.id === apiKey.id);
    const invocation = detail.recentInvocations?.find(
      (item) => item?.id === runtimeResult.invocationId,
    );
    const saved = detail.savedSkills?.find(
      (item) => item?.skillSlug === skillSlug,
    );

    if (!installed || !listedKey || !invocation || !saved) {
      fail(
        name,
        `missing project state: ${[
          installed ? null : "install",
          listedKey ? null : "apiKey",
          invocation ? null : "runtimeInvocation",
          saved ? null : "savedSkill",
        ]
          .filter(Boolean)
          .join(", ")}`,
      );
      return;
    }

    if ("apiKey" in listedKey) {
      fail(
        name,
        "listed project key must not expose raw API key after first reveal",
      );
      return;
    }

    pass(
      name,
      `project detail includes save/install/key/runtime for ${skillSlug}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkDeveloperNotifications(
  { apiUrl, developerToken, projectSlug, skillSlug, timeoutMs },
  { apiKey, install, project },
) {
  const name = "GET /v1/notifications";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/notifications?limit=100"),
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
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

    const required = [
      [
        "project.created",
        (item) =>
          item?.payload?.projectSlug === projectSlug ||
          item?.payload?.projectName === project.name,
      ],
      [
        "project_saved_skill.saved",
        (item) =>
          item?.payload?.projectSlug === projectSlug &&
          item?.payload?.skillSlug === skillSlug,
      ],
      [
        "project_install.installed",
        (item) =>
          item?.payload?.projectSlug === projectSlug &&
          item?.payload?.skillSlug === skillSlug,
      ],
      [
        "project_api_key.created",
        (item) =>
          item?.payload?.projectSlug === projectSlug &&
          item?.payload?.keyId === apiKey.id,
      ],
    ];
    const missing = required
      .filter(
        ([eventType, predicate]) =>
          !json.notifications.some(
            (item) => item?.eventType === eventType && predicate(item),
          ),
      )
      .map(([eventType]) => eventType);

    if (missing.length > 0) {
      fail(name, `missing developer notifications: ${missing.join(", ")}`);
      return;
    }

    pass(
      name,
      `developer notifications include project/save/install/key events, install=...${install.id.slice(-8)}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminAuditLogs(
  { adminToken, apiUrl, projectSlug, skillSlug, timeoutMs },
  { apiKey, install, project },
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

    const required = [
      [
        "project.created",
        (item) =>
          item?.entityId === project.id ||
          item?.metadata?.projectSlug === projectSlug,
      ],
      [
        "project_saved_skill.saved",
        (item) =>
          item?.metadata?.projectSlug === projectSlug &&
          item?.metadata?.skillSlug === skillSlug,
      ],
      [
        "project_install.installed",
        (item) =>
          item?.entityId === install.id &&
          item?.metadata?.skillSlug === skillSlug,
      ],
      [
        "project_api_key.created",
        (item) =>
          item?.entityId === apiKey.id &&
          item?.metadata?.keyLast4 === apiKey.keyLast4,
      ],
    ];
    const missing = required
      .filter(
        ([action, predicate]) =>
          !json.auditLogs.some(
            (item) => item?.action === action && predicate(item),
          ),
      )
      .map(([action]) => action);

    if (missing.length > 0) {
      fail(name, `missing admin audit logs: ${missing.join(", ")}`);
      return;
    }

    pass(name, "admin audit records project/save/install/key handoff");
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function requestJson(url, options) {
  const response = await request(url, options);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { error: text.slice(0, 300) };
  }

  return { json, status: response.status, text };
}

async function requestText(url, options) {
  const response = await request(url, options);
  return {
    status: response.status,
    text: await response.text(),
  };
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    return await fetch(url, {
      body: options.body,
      headers: options.headers,
      method: options.method ?? "GET",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function guardProductionWrite({ allowProduction, apiUrl }) {
  if (allowProduction || !isProductionUrl(apiUrl)) {
    return;
  }

  console.error(
    [
      "Refusing to run mutating P0 developer smoke against a production API without explicit approval.",
      "Pass --allow-production or set SKILLHUB_P0_DEVELOPER_ALLOW_PRODUCTION=true for a planned production smoke.",
    ].join("\n"),
  );
  process.exit(2);
}

function isProductionUrl(value) {
  try {
    const url = new URL(value);
    return [
      "api.useskillhub.com",
      "useskillhub.com",
      "app.useskillhub.com",
    ].includes(url.hostname);
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
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

    if (
      [
        "--api-url",
        "--app-url",
        "--collection",
        "--project-slug",
        "--skill-page-path",
        "--skill-slug",
        "--timeout-ms",
      ].includes(arg)
    ) {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value.`);
      }

      parsed[toCamelCase(arg.slice(2))] = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_match, character) =>
    character.toUpperCase(),
  );
}

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").toLowerCase());
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function joinUrl(base, path) {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function safeError(json) {
  return redactSecrets(String(json?.error ?? "no response error body"));
}

function assertNoSensitiveLeaks(name, text) {
  const leaks = findSensitiveLeaks(text);

  if (leaks.length === 0) {
    return true;
  }

  fail(name, `possible sensitive response leak: ${leaks[0]}`);
  return false;
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
  console.error(`FAIL ${name} - ${redactSecrets(message)}`);
}

function skip(name, message) {
  results.push({ message, name, status: "skip" });
  console.log(`SKIP ${name} - ${message}`);
}

function printSummary(items) {
  const counts = items.reduce(
    (accumulator, item) => {
      accumulator[item.status] += 1;
      return accumulator;
    },
    { fail: 0, pass: 0, skip: 0 },
  );

  console.log("");
  console.log(
    `Summary: ${counts.pass} passed, ${counts.skip} skipped, ${counts.fail} failed`,
  );
}

function printHelp() {
  console.log(`Usage: node scripts/qa-p0-developer-handoff-smoke.mjs [options]

Proves Journey A: marketplace discovery can become project state, saved-skill state,
install state, reveal-once project API-key state, non-billable runtime test state,
developer notifications, and admin audit records.

Options:
  --api-url <url>           Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>           Web app URL. Default: ${DEFAULT_APP_URL}
  --project-slug <slug>     Project slug to create. Default: generated p0-dev-smoke-*
  --skill-slug <slug>       Skill slug to save/install/test. Default: ${DEFAULT_SKILL_SLUG}
  --skill-page-path <path>  App skill detail path to smoke. Default: ${DEFAULT_SKILL_PAGE_PATH}
  --collection <name>       Saved-skill collection. Default: p0-evaluation
  --timeout-ms <ms>         Request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-admin              Skip admin audit verification.
  --skip-app                Skip web page handoff checks.
  --allow-production        Permit mutating writes against production API.
  -h, --help                Show this help.

Environment:
  SKILLHUB_P0_DEVELOPER_TOKEN or SKILLHUB_DEVELOPER_SMOKE_TOKEN is required.
  SKILLHUB_P0_DEVELOPER_ADMIN_TOKEN is required unless --skip-admin is set.
`);
}
