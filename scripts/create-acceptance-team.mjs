#!/usr/bin/env node

import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

const DEFAULT_API_URL = "http://127.0.0.1:18787";
const DEFAULT_APP_URL = "https://useskillhub.com";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_OUTPUT = resolve(tmpdir(), "skillhub-acceptance-team.json");
const DEFAULT_EMAIL_DOMAIN = "acceptance.useskillhub.com";

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
  adminPlatformRole: args.adminPlatformRole ?? process.env.SKILLHUB_ACCEPTANCE_ADMIN_PLATFORM_ROLE ?? "admin",
  allowProductionWrite:
    args.allowProductionWrite || parseBoolean(process.env.SKILLHUB_ACCEPTANCE_ALLOW_PRODUCTION_WRITE),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_ACCEPTANCE_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_ACCEPTANCE_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  emailDomain:
    args.emailDomain ??
    process.env.SKILLHUB_ACCEPTANCE_EMAIL_DOMAIN ??
    DEFAULT_EMAIL_DOMAIN,
  output:
    args.output ??
    process.env.SKILLHUB_ACCEPTANCE_OUTPUT ??
    DEFAULT_OUTPUT,
  runId:
    args.runId ??
    process.env.SKILLHUB_ACCEPTANCE_RUN_ID,
  serviceToken:
    process.env.SKILLHUB_SERVICE_TOKEN ??
    process.env.SKILLHUB_ADMIN_TOKEN,
  timeoutMs: parsePositiveInteger(args.timeoutMs ?? process.env.SKILLHUB_ACCEPTANCE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
};

try {
  validateConfig(config);
  guardProductionWrite(config);

  const existing = await readExistingOutput(config.output);
  const runId = normalizeRunId(config.runId ?? existing?.runId ?? `qa${Date.now().toString(36)}`);
  const accounts = buildAccounts({ existing, runId, config });

  console.log("SkillHub acceptance team initializer");
  console.log(`API: ${config.apiUrl}`);
  console.log(`App: ${config.appUrl}`);
  console.log(`Run id: ${runId}`);
  console.log("Creating or verifying eight role accounts: 3 developers, 3 publishers, and 2 admins. Credentials will not be printed.");
  console.log("");

  for (const account of Object.values(accounts)) {
    await ensurePasswordAccount(config, account);
  }

  const bootstraps = {};

  for (const [key, account] of Object.entries(accounts)) {
    if (account.kind === "admin") {
      bootstraps[key] = await promoteAdmin(config, account);
    }
  }

  const verified = {};

  for (const [key, account] of Object.entries(accounts)) {
    verified[key] = await loginAndVerify(config, account, {
      requireAdmin: account.kind === "admin"
    });
  }

  const publishedSkills = {};

  for (const [key, account] of Object.entries(accounts)) {
    if (account.kind === "publisher") {
      publishedSkills[key] = await ensurePublisherSkill(config, account, verified[key]?.token, runId, key);
    }
  }

  const output = buildOutput({
    accounts,
    bootstraps,
    config,
    existing,
    publishedSkills,
    runId,
    verified
  });

  await writePrivateJson(config.output, output);

  console.log("Acceptance team ready.");
  console.log(`Private credentials file: ${resolve(config.output)}`);
  console.log("Accounts prepared: 2 admin operators, 3 developer users, 3 publisher partners.");
  console.log("Publisher skills submitted: 3 acceptance skills are queued for operator review.");
  console.log("No passwords, tokens, OAuth secrets, or service credentials were printed.");
} catch (error) {
  console.error(redactSecrets(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}

async function ensurePasswordAccount(config, account) {
  const response = await requestJson(config, "/v1/auth/password/signup", {
    body: {
      displayName: account.displayName,
      email: account.email,
      organizationName: account.organizationName,
      organizationSlug: account.organizationSlug,
      password: account.password,
      role: account.organizationRole,
      username: account.username
    },
    method: "POST"
  });

  if (response.status === 201) {
    return response.json.login;
  }

  const error = safeError(response);

  if (response.status === 400 && isExistingAccountError(error)) {
    await loginAndVerify(config, account, { requireAdmin: false });
    return null;
  }

  if (response.status === 403) {
    throw new Error(
      `Password signup is disabled for ${account.kind}. Public account registration must work before acceptance-team QA can create real login accounts.`
    );
  }

  throw new Error(`Unable to create ${account.kind} password account: ${error}`);
}

async function promoteAdmin(config, account) {
  const response = await requestJson(config, "/v1/auth/bootstrap-token", {
    body: {
      displayName: account.displayName,
      email: account.email,
      organizationName: account.organizationName,
      organizationSlug: account.organizationSlug,
      platformRole: config.adminPlatformRole,
      role: "owner",
      tokenName: "Acceptance admin operator token"
    },
    headers: {
      Authorization: `Bearer ${config.serviceToken}`
    },
    method: "POST"
  });

  if (response.status !== 201) {
    throw new Error(`Unable to promote admin acceptance account: ${safeError(response)}`);
  }

  const bootstrap = response.json.bootstrap;

  if (!bootstrap?.accessToken?.token || bootstrap.user?.platformRole !== config.adminPlatformRole) {
    throw new Error("Admin bootstrap response did not include the expected operator role or one-time token.");
  }

  return {
    token: bootstrap.accessToken.token,
    tokenLast4: bootstrap.accessToken.tokenLast4,
    tokenName: bootstrap.accessToken.name
  };
}

async function loginAndVerify(config, account, { requireAdmin }) {
  const loginResponse = await requestJson(config, "/v1/auth/password/login", {
    body: {
      identifier: account.username,
      password: account.password
    },
    method: "POST"
  });

  if (loginResponse.status !== 200) {
    throw new Error(`Unable to log in ${account.kind} account with password: ${safeError(loginResponse)}`);
  }

  const token = loginResponse.json?.login?.accessToken?.token;

  if (!token) {
    throw new Error(`${account.kind} password login did not return a one-time user session token.`);
  }

  const meResponse = await requestJson(config, "/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: "GET"
  });

  if (meResponse.status !== 200) {
    throw new Error(`${account.kind} token could not read /v1/auth/me: ${safeError(meResponse)}`);
  }

  const subject = meResponse.json?.subject;
  const roles = new Set([subject?.platformRole, ...(subject?.roles ?? [])].filter(Boolean));

  if (!roles.has(account.expectedRole)) {
    throw new Error(
      `${account.kind} account is missing expected role '${account.expectedRole}'. Current roles: ${Array.from(roles).join(", ")}`
    );
  }

  if (requireAdmin) {
    const readinessResponse = await requestJson(config, "/v1/admin/launch-readiness", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "GET"
    });

    if (readinessResponse.status !== 200) {
      throw new Error(`Admin account cannot read launch readiness: ${safeError(readinessResponse)}`);
    }
  }

  return {
    organization: loginResponse.json?.login?.organization,
    platformRole: subject?.platformRole,
    roles: subject?.roles ?? [],
    token,
    tokenLast4: loginResponse.json?.login?.accessToken?.tokenLast4
  };
}

async function ensurePublisherSkill(config, account, token, runId, key) {
  if (!token) {
    throw new Error(`Unable to publish acceptance skill for ${key}: missing publisher session token.`);
  }

  const manifest = buildPublisherSkillManifest(account, runId, key);
  const headers = {
    Authorization: `Bearer ${token}`
  };

  const publishResponse = await requestJson(config, "/v1/skills", {
    body: {
      manifest
    },
    headers,
    method: "POST"
  });

  if (publishResponse.status !== 201) {
    throw new Error(`Unable to publish acceptance skill for ${key}: ${safeError(publishResponse)}`);
  }

  const submitResponse = await requestJson(config, `/v1/skills/${encodeURIComponent(manifest.name)}/submit`, {
    body: {
      version: manifest.version
    },
    headers,
    method: "POST"
  });

  if (submitResponse.status !== 201) {
    throw new Error(`Unable to submit acceptance skill for ${key}: ${safeError(submitResponse)}`);
  }

  return {
    detailUrl: joinUrl(config.appUrl, `/skills/${manifest.name}?lang=zh`),
    displayName: manifest.displayName,
    reviewStatus: submitResponse.json?.review?.status ?? null,
    slug: manifest.name,
    status: publishResponse.json?.status ?? null,
    version: manifest.version
  };
}

function buildPublisherSkillManifest(account, runId, key) {
  const index = key.replace(/^publisher/, "") || "1";
  const slug = `acceptance-${runId}-${key}`.replace(/_/g, "-").slice(0, 60).replace(/-+$/g, "");

  return {
    schemaVersion: "0.1",
    name: slug,
    displayName: `Acceptance Partner ${index} Workflow Skill`,
    version: "1.0.0",
    description:
      `Acceptance test skill published by ${account.organizationName} for role QA, marketplace review, and developer handoff verification.`,
    author: {
      name: account.organizationName,
      url: "https://www.useskillhub.com"
    },
    tags: ["acceptance", "ops", index === "1" ? "research" : index === "2" ? "data" : "support"],
    runtime: {
      type: "http",
      entrypoint: `https://api.useskillhub.com/acceptance/${runId}/${key}`
    },
    permissions: {
      browser: index === "1",
      filesystem: "none",
      network: true,
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: {
          type: "string",
          minLength: 3
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["summary"],
      properties: {
        summary: {
          type: "string"
        },
        confidence: {
          maximum: 1,
          minimum: 0,
          type: "number"
        }
      }
    }
  };
}

function buildOutput({ accounts, bootstraps, config, existing, publishedSkills, runId, verified }) {
  const createdAt = new Date().toISOString();
  const outputAccounts = Object.fromEntries(
    Object.entries(accounts).map(([key, account]) => [
      key,
      outputAccount(account, verified[key], {
        ...(bootstraps[key]
          ? {
              bootstrapToken: bootstraps[key].token,
              bootstrapTokenLast4: bootstraps[key].tokenLast4,
              bootstrapTokenName: bootstraps[key].tokenName
            }
          : {}),
        workspaceUrl: workspaceUrlForAccount(config.appUrl, account)
      })
    ])
  );

  return {
    schema: "skillhub.acceptance-team.v1",
    warning: "Private QA credentials. Do not commit, screenshot, paste, or share this file.",
    createdAt: existing?.createdAt ?? createdAt,
    updatedAt: createdAt,
    apiUrl: config.apiUrl,
    appUrl: config.appUrl,
    runId,
    publishedSkills,
    accounts: outputAccounts,
    cohorts: {
      admins: Object.keys(accounts).filter((key) => accounts[key].kind === "admin"),
      developers: Object.keys(accounts).filter((key) => accounts[key].kind === "developer"),
      publishers: Object.keys(accounts).filter((key) => accounts[key].kind === "publisher")
    },
    walkthrough: [
      {
        role: "developer",
        startUrl: joinUrl(config.appUrl, "/login?lang=zh"),
        inspect: [
          "/marketplace?lang=zh",
          "/marketplace?lang=zh#open-a-public-skill",
          "/developer?lang=zh",
          "/dashboard?lang=zh"
        ],
        acceptance: "Marketplace discovery should lead to project state, install/readiness, policy/key/runtime proof, and clear blocked states."
      },
      {
        role: "publisher_partner",
        startUrl: joinUrl(config.appUrl, "/login?lang=zh"),
        inspect: ["/publish?lang=zh", "/publisher?lang=zh", "/account?lang=zh", "/terms?lang=zh"],
        acceptance:
          "Publisher should understand manifest preflight, review submission, paid-readiness blockers, manual PayPal/Alipay payout readiness, and next repair actions."
      },
      {
        role: "admin_operator",
        startUrl: joinUrl(config.appUrl, "/admin-login?lang=zh"),
        inspect: ["/admin?lang=zh", "/admin#launch-readiness", "/dashboard?lang=zh", "/account?lang=zh"],
        acceptance:
          "Admin should see launch readiness, review/trust/finance/payout/notification/audit queues, and role-protected operations without public admin exposure."
      }
    ]
  };
}

function outputAccount(account, verified, extra) {
  return {
    displayName: account.displayName,
    email: account.email,
    expectedRole: account.expectedRole,
    kind: account.kind,
    organizationName: account.organizationName,
    organizationRole: account.organizationRole,
    organizationSlug: account.organizationSlug,
    password: account.password,
    sessionToken: verified.token,
    sessionTokenLast4: verified.tokenLast4,
    username: account.username,
    verifiedPlatformRole: verified.platformRole,
    verifiedRoles: verified.roles,
    ...extra
  };
}

function workspaceUrlForAccount(appUrl, account) {
  if (account.kind === "admin") {
    return joinUrl(appUrl, "/admin?lang=zh");
  }

  if (account.kind === "publisher") {
    return joinUrl(appUrl, "/publisher?lang=zh");
  }

  return joinUrl(appUrl, "/developer?lang=zh");
}

function buildAccounts({ existing, runId, config }) {
  const suffix = runId.replace(/[^a-z0-9_-]/g, "").slice(0, 16);
  const domain = normalizeEmailDomain(config.emailDomain);
  const specs = [
    ["admin", "admin", "SkillHub Acceptance Admin", "SkillHub Acceptance Admin Ops"],
    ["admin2", "admin", "SkillHub Acceptance Admin 2", "SkillHub Acceptance Admin Ops 2"],
    ["developer", "developer", "SkillHub Acceptance Developer", "SkillHub Acceptance Developer Lab"],
    ["developer2", "developer", "SkillHub Acceptance Developer 2", "SkillHub Acceptance Developer Lab 2"],
    ["developer3", "developer", "SkillHub Acceptance Developer 3", "SkillHub Acceptance Developer Lab 3"],
    ["publisher", "publisher", "SkillHub Acceptance Partner", "SkillHub Acceptance Partner Studio"],
    ["publisher2", "publisher", "SkillHub Acceptance Partner 2", "SkillHub Acceptance Partner Studio 2"],
    ["publisher3", "publisher", "SkillHub Acceptance Partner 3", "SkillHub Acceptance Partner Studio 3"]
  ];

  return Object.fromEntries(
    specs.map(([key, kind, displayName, organizationName]) => {
      const indexSuffix = key.replace(/^(admin|developer|publisher)/, "") || "1";
      const normalizedIndex = indexSuffix === "1" ? "" : indexSuffix;
      const usernamePrefix =
        kind === "admin"
          ? `qa_admin${normalizedIndex}`
          : kind === "developer"
            ? `qa_dev${normalizedIndex}`
            : `qa_partner${normalizedIndex}`;
      const slugPrefix =
        kind === "admin"
          ? `qa-admin${normalizedIndex}`
          : kind === "developer"
            ? `qa-dev${normalizedIndex}`
            : `qa-partner${normalizedIndex}`;

      return [
        key,
        buildAccount({
          defaults: {
            displayName,
            email: `${slugPrefix}-${suffix}@${domain}`,
            expectedRole: kind === "admin" ? config.adminPlatformRole : kind,
            kind,
            organizationName,
            organizationRole: kind === "admin" ? "owner" : kind,
            organizationSlug: `${slugPrefix}-${suffix}`,
            username: `${usernamePrefix}_${suffix}`
          },
          existing: existing?.accounts?.[key]
        })
      ];
    })
  );
}

function buildAccount({ defaults, existing }) {
  return {
    ...defaults,
    displayName: existing?.displayName ?? defaults.displayName,
    email: existing?.email ?? defaults.email,
    organizationName: existing?.organizationName ?? defaults.organizationName,
    organizationRole: existing?.organizationRole ?? defaults.organizationRole,
    organizationSlug: existing?.organizationSlug ?? defaults.organizationSlug,
    password: existing?.password ?? generatePassword(),
    username: existing?.username ?? defaults.username
  };
}

async function requestJson(config, path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(joinUrl(config.apiUrl, path), {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {})
      },
      method: options.method ?? "GET",
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    return {
      json,
      status: response.status,
      text
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${config.timeoutMs}ms: ${path}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readExistingOutput(outputPath) {
  try {
    const text = await readFile(outputPath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw new Error(`Unable to read existing acceptance-team output: ${error.message}`);
  }
}

async function writePrivateJson(outputPath, payload) {
  const absolutePath = resolve(outputPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(payload, null, 2)}\n`, {
    flag: "w",
    mode: 0o600
  });

  try {
    await chmod(absolutePath, 0o600);
  } catch {
    // Windows file permissions are best-effort from Node chmod.
  }
}

function validateConfig(config) {
  if (!config.serviceToken) {
    throw new Error("Set SKILLHUB_SERVICE_TOKEN or SKILLHUB_ADMIN_TOKEN in the server shell before creating the admin acceptance account.");
  }

  if (!["admin", "super_admin"].includes(config.adminPlatformRole)) {
    throw new Error("--admin-platform-role must be admin or super_admin.");
  }

  normalizeUrl(config.apiUrl, "API URL");
  normalizeUrl(config.appUrl, "app URL");
}

function guardProductionWrite(config) {
  if (!isProductionTarget(config.apiUrl)) {
    return;
  }

  if (config.allowProductionWrite) {
    return;
  }

  throw new Error(
    "This target looks production-like. Re-run with --allow-production-write after confirming you want to create real acceptance accounts."
  );
}

function isProductionTarget(value) {
  return /(^|\.)useskillhub\.com/i.test(new URL(value).hostname);
}

function normalizeUrl(value, label) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function safeError(response) {
  const value = response.json?.error ?? response.json?.message ?? response.text ?? `HTTP ${response.status}`;
  return redactSecrets(String(value).slice(0, 500));
}

function isExistingAccountError(error) {
  const normalized = String(error).toLowerCase();

  return (
    normalized.includes("already registered") ||
    normalized.includes("username is already taken") ||
    normalized.includes("workspace slug is already taken")
  );
}

function joinUrl(baseUrl, path) {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  return url.toString();
}

function generatePassword() {
  return `ShubQA-${randomBytes(18).toString("base64url")}`;
}

function normalizeRunId(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16);

  if (!/^[a-z0-9][a-z0-9_-]{2,15}$/.test(normalized)) {
    throw new Error("Acceptance run id must be 3-16 chars using lowercase letters, numbers, underscores, or hyphens.");
  }

  return normalized;
}

function normalizeEmailDomain(value) {
  const domain = String(value ?? "").trim().toLowerCase();

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    throw new Error("Acceptance email domain must look like example.com.");
  }

  return domain;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function parseBoolean(value) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function redactSecrets(value) {
  return String(value)
    .replace(/shub_user_[a-z0-9_-]+/gi, "[redacted-user-token]")
    .replace(/bearer\s+[a-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/(password|token|secret|api[_-]?key)(["':=\s]+)[^"',\s}]+/gi, "$1$2[redacted]");
}

function parseArgs(argv) {
  const parsed = {
    adminPlatformRole: undefined,
    allowProductionWrite: false,
    apiUrl: undefined,
    appUrl: undefined,
    emailDomain: undefined,
    help: false,
    output: undefined,
    runId: undefined,
    timeoutMs: undefined
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

    if (arg === "--allow-production-write") {
      parsed.allowProductionWrite = true;
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

    if (arg === "--admin-platform-role") {
      parsed.adminPlatformRole = nextValue();
      continue;
    }

    if (arg === "--api-url") {
      parsed.apiUrl = nextValue();
      continue;
    }

    if (arg === "--app-url") {
      parsed.appUrl = nextValue();
      continue;
    }

    if (arg === "--email-domain") {
      parsed.emailDomain = nextValue();
      continue;
    }

    if (arg === "--output") {
      parsed.output = nextValue();
      continue;
    }

    if (arg === "--run-id") {
      parsed.runId = nextValue();
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

function printHelp() {
  console.log(`Usage: node scripts/create-acceptance-team.mjs [options]

Creates or verifies eight real SkillHub acceptance accounts:
  - 2 admin/operator accounts promoted with the server service token
  - 3 developer user accounts using normal password signup/login
  - 3 publisher partner accounts using normal password signup/login
  - 3 publisher-owned acceptance skills submitted to the operator review queue

Credentials are written only to a private local JSON file and are never printed.

Options:
  --api-url <url>              Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>              Web app URL for walkthrough links. Default: ${DEFAULT_APP_URL}
  --output <path>              Private credential output file. Default: ${DEFAULT_OUTPUT}
  --run-id <id>                Stable suffix for usernames/emails/org slugs.
  --email-domain <domain>      Email domain for generated QA accounts. Default: ${DEFAULT_EMAIL_DOMAIN}
  --admin-platform-role <role> admin or super_admin. Default: admin
  --timeout-ms <ms>            Request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --allow-production-write     Required for useskillhub.com targets.
  -h, --help                   Show this help.

Environment:
  SKILLHUB_SERVICE_TOKEN or SKILLHUB_ADMIN_TOKEN is required for admin promotion.
  SKILLHUB_ACCEPTANCE_API_URL, SKILLHUB_ACCEPTANCE_APP_URL, SKILLHUB_ACCEPTANCE_OUTPUT,
  SKILLHUB_ACCEPTANCE_RUN_ID, SKILLHUB_ACCEPTANCE_EMAIL_DOMAIN, and
  SKILLHUB_ACCEPTANCE_ALLOW_PRODUCTION_WRITE can set defaults.

Production example:
  pnpm acceptance:team -- --api-url http://127.0.0.1:18787 --app-url https://useskillhub.com --output /root/skillhub-acceptance-team.json --allow-production-write
`);
}
