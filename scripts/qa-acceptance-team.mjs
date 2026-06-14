#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "https://api.useskillhub.com";
const DEFAULT_APP_URL = "https://useskillhub.com";
const DEFAULT_CREDENTIALS_PATH = "/root/skillhub-acceptance-team.json";
const DEFAULT_OUTPUT = "output/acceptance-team-qa-report.json";
const DEFAULT_TIMEOUT_MS = 30000;
const PUBLIC_SKILL_SLUG_PLACEHOLDER = "{publicSkillSlug}";
let publicSkillSlugPromise;

const ROLE_SPECS = {
  developer: {
    accountKey: "developer",
    expectedRoles: ["developer"],
    pages: [
      {
        path: "/account?lang=zh",
        required: ["个人中心", "会话安全", "工作区准备度"]
      },
      {
        path: "/developer?lang=zh",
        required: ["开发者运营队列", "运营队列", "团队权限", "webhook"],
        forbidden: ["需要先登录", "需要开发者角色", "sign-in required", "developer role required"]
      },
      {
        path: "/marketplace?lang=zh",
        required: ["市场", "详情"]
      },
      {
        path: `/skills/${PUBLIC_SKILL_SLUG_PLACEHOLDER}?lang=zh`,
        required: ["用户反馈", "发布者信任"],
        requiredHtml: ["skill-developer-handoff-packet"]
      },
      {
        path: "/dashboard?lang=zh",
        required: ["当前会话"],
        requiredHtml: ["workspace-command-center", "p0-demo-chain"],
        forbidden: ["工作台需要登录后才能打开", "the dashboard opens after sign-in"]
      }
    ],
    protectedApis: [
      "/v1/auth/me",
      "/v1/account",
      "/v1/developer/projects"
    ]
  },
  publisher: {
    accountKey: "publisher",
    expectedRoles: ["publisher"],
    pages: [
      {
        path: "/account?lang=zh",
        required: ["个人中心", "会话安全", "工作区准备度"]
      },
      {
        path: "/publish?lang=zh",
        required: ["发布者工作流", "预检修复队列", "审核证据包"],
        forbidden: ["需要先登录", "需要发布者角色", "sign-in required", "publisher role required"]
      },
      {
        path: "/publisher?lang=zh",
        required: ["发布者运营队列", "运营队列", "付费准备元数据"],
        forbidden: ["需要先登录", "需要发布者角色", "sign-in required", "publisher role required"]
      },
      {
        path: "/terms?lang=zh",
        required: ["运营条款", "开发者预览版"],
        requiredHtml: ["条款摘要"]
      }
    ],
    protectedApis: [
      "/v1/auth/me",
      "/v1/account",
      "/v1/publisher/skills",
      "/v1/publisher/payouts",
      "/v1/publisher/finance/ledger"
    ]
  },
  admin: {
    accountKey: "admin",
    expectedRoles: ["admin", "super_admin", "support", "reviewer", "finance"],
    pages: [
      {
        path: "/account?lang=zh",
        required: ["个人中心", "会话安全", "工作区准备度"]
      },
      {
        path: "/admin?lang=zh",
        required: ["管理员运营队列", "上线就绪", "审核队列", "审计", "notification", "webhook"],
        forbidden: ["需要先登录", "需要管理员角色", "sign-in required", "admin role required"]
      },
      {
        path: "/dashboard?lang=zh",
        required: ["当前会话"],
        requiredHtml: ["workspace-command-center", "p0-demo-chain"],
        forbidden: ["工作台需要登录后才能打开", "the dashboard opens after sign-in"]
      }
    ],
    protectedApis: [
      "/v1/auth/me",
      "/v1/account",
      "/v1/admin/overview",
      "/v1/admin/launch-readiness",
      "/v1/admin/identity-directory",
      "/v1/admin/notifications"
    ]
  }
};

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
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_ACCEPTANCE_QA_API_URL ??
    process.env.SKILLHUB_ACCEPTANCE_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_ACCEPTANCE_QA_APP_URL ??
    process.env.SKILLHUB_ACCEPTANCE_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    DEFAULT_APP_URL,
  credentialsPath:
    args.credentials ??
    process.env.SKILLHUB_ACCEPTANCE_CREDENTIALS ??
    process.env.SKILLHUB_ACCEPTANCE_OUTPUT ??
    DEFAULT_CREDENTIALS_PATH,
  failOn: args.failOn ?? process.env.SKILLHUB_ACCEPTANCE_QA_FAIL_ON ?? "p0",
  output: args.output ?? process.env.SKILLHUB_ACCEPTANCE_QA_OUTPUT ?? DEFAULT_OUTPUT,
  timeoutMs: parsePositiveInteger(args.timeoutMs ?? process.env.SKILLHUB_ACCEPTANCE_QA_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)
};

validateConfig(config);

const startedAt = new Date().toISOString();
const results = [];
const issues = [];

console.log("SkillHub acceptance team role QA");
console.log(`API: ${config.apiUrl}`);
console.log(`App: ${config.appUrl}`);
console.log(`Credentials: ${config.credentialsPath}`);
console.log(`Report: ${config.output}`);
console.log("");

try {
  const credentials = await readCredentials(config.credentialsPath);

  for (const spec of Object.values(ROLE_SPECS)) {
    await checkRole(spec, credentials);
  }

  const report = {
    apiUrl: config.apiUrl,
    appUrl: config.appUrl,
    finishedAt: new Date().toISOString(),
    issueSummary: summarizeIssues(issues),
    issues,
    resultSummary: summarizeResults(results),
    results,
    schema: "skillhub.acceptance-team-qa.v1",
    startedAt
  };

  await writeReport(config.output, report);
  printSummary(report);

  if (shouldFail(report.issueSummary, config.failOn)) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(redactSecrets(error instanceof Error ? error.message : String(error)));
  process.exit(1);
}

async function checkRole(spec, credentials) {
  const account = credentials?.accounts?.[spec.accountKey];

  if (!account) {
    addIssue({
      category: "credentials",
      message: `Missing ${spec.accountKey} account in acceptance-team credential file.`,
      role: spec.accountKey,
      severity: "P0"
    });
    return;
  }

  const token = await resolveFreshToken(account, spec.accountKey);

  if (!token) {
    return;
  }

  const subject = await checkSubject(spec, token);

  if (!subject) {
    return;
  }

  await checkProtectedApis(spec, token);
  await checkPages(spec, token);
}

async function resolveFreshToken(account, role) {
  if (account.username && account.password) {
    const response = await requestJson(joinUrl(config.apiUrl, "/v1/auth/password/login"), {
      body: {
        identifier: account.username,
        password: account.password
      },
      method: "POST"
    });

    if (response.status === 200 && response.json?.login?.accessToken?.token) {
      addResult(role, "api", "/v1/auth/password/login", "pass", "Password login returned a fresh session token.");
      return response.json.login.accessToken.token;
    }

    addIssue({
      category: "auth",
      message: `Password login failed for ${role}: ${safeError(response)}`,
      role,
      severity: "P0"
    });
    return null;
  }

  if (account.sessionToken) {
    addResult(role, "credentials", "sessionToken", "pass", "Using existing session token from private credentials file.");
    return account.sessionToken;
  }

  addIssue({
    category: "credentials",
    message: `Missing username/password or sessionToken for ${role}.`,
    role,
    severity: "P0"
  });
  return null;
}

async function checkSubject(spec, token) {
  const response = await requestJson(joinUrl(config.apiUrl, "/v1/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`
    },
    method: "GET"
  });

  if (response.status !== 200 || !response.json?.subject) {
    addIssue({
      category: "auth",
      message: `/v1/auth/me failed for ${spec.accountKey}: ${safeError(response)}`,
      role: spec.accountKey,
      severity: "P0"
    });
    return null;
  }

  assertNoLeaks(spec.accountKey, "api", "/v1/auth/me", response.text);

  const subject = response.json.subject;
  const roleSet = new Set([subject.platformRole, ...(subject.roles ?? [])].filter(Boolean));
  const hasExpectedRole = spec.expectedRoles.some((role) => roleSet.has(role));

  if (!hasExpectedRole) {
    addIssue({
      category: "role",
      message: `${spec.accountKey} account does not have expected role. Actual roles: ${Array.from(roleSet).join(", ") || "none"}.`,
      role: spec.accountKey,
      severity: "P0"
    });
    return subject;
  }

  addResult(spec.accountKey, "api", "/v1/auth/me", "pass", `Roles: ${Array.from(roleSet).join(", ")}`);
  return subject;
}

async function checkProtectedApis(spec, token) {
  for (const path of spec.protectedApis) {
    if (path === "/v1/auth/me") {
      continue;
    }

    const response = await requestJson(joinUrl(config.apiUrl, path), {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "GET"
    });

    assertNoLeaks(spec.accountKey, "api", path, response.text);

    if (response.status < 200 || response.status >= 300) {
      addIssue({
        category: "api",
        message: `${path} returned HTTP ${response.status}: ${safeError(response)}`,
        role: spec.accountKey,
        severity: "P0"
      });
      continue;
    }

    addResult(spec.accountKey, "api", path, "pass", `HTTP ${response.status}`);

    if (path === "/v1/admin/launch-readiness") {
      inspectLaunchReadiness(response.json);
    }
  }
}

async function checkPages(spec, token) {
  for (const page of spec.pages) {
    const role = spec.accountKey;
    const pagePath = await resolvePagePath(page, role);

    if (!pagePath) {
      continue;
    }

    const response = await requestText(joinUrl(config.appUrl, pagePath), {
      headers: {
        Cookie: `skillhub_user_token=${encodeURIComponent(token)}`
      },
      method: "GET"
    });

    assertNoLeaks(role, "page", pagePath, response.text);

    if (response.status !== 200) {
      addIssue({
        category: "page",
        message: `${pagePath} returned HTTP ${response.status}.`,
        role,
        severity: "P0",
        url: joinUrl(config.appUrl, pagePath)
      });
      continue;
    }

    const plain = decodeHtml(stripTags(response.text));
    const html = decodeHtml(response.text);
    const lower = plain.toLowerCase();
    const lowerHtml = html.toLowerCase();
    const missing = (page.required ?? []).filter((marker) => !plain.includes(marker) && !lower.includes(marker.toLowerCase()));
    const missingHtml = (page.requiredHtml ?? []).filter(
      (marker) => !html.includes(marker) && !lowerHtml.includes(marker.toLowerCase())
    );
    const forbidden = (page.forbidden ?? []).filter((marker) => plain.includes(marker) || lower.includes(marker.toLowerCase()));

    if (missing.length > 0 || missingHtml.length > 0) {
      const missingMarkers = [...missing, ...missingHtml];
      addIssue({
        category: "page-marker",
        message: `${pagePath} is missing expected logged-in role markers: ${missingMarkers.join(", ")}.`,
        role,
        severity: "P0",
        url: joinUrl(config.appUrl, pagePath)
      });
    }

    if (forbidden.length > 0) {
      addIssue({
        category: "locked-state",
        message: `${pagePath} still contains locked-state copy for a valid ${role} session: ${forbidden.join(", ")}.`,
        role,
        severity: "P0",
        url: joinUrl(config.appUrl, pagePath)
      });
    }

    if (missing.length === 0 && missingHtml.length === 0 && forbidden.length === 0) {
      addResult(role, "page", pagePath, "pass", `HTML bytes=${Buffer.byteLength(response.text, "utf8")}`);
    }
  }
}

async function resolvePagePath(page, role) {
  if (!page.path.includes(PUBLIC_SKILL_SLUG_PLACEHOLDER)) {
    return page.path;
  }

  const slug = await resolvePublicSkillSlug(role);

  if (!slug) {
    return null;
  }

  return page.path.replace(PUBLIC_SKILL_SLUG_PLACEHOLDER, slug);
}

async function resolvePublicSkillSlug(role) {
  publicSkillSlugPromise ??= fetchPublicSkillSlug(role);
  return publicSkillSlugPromise;
}

async function fetchPublicSkillSlug(role) {
  const target = "/v1/skills/search?sort=recommended&limit=20";
  const response = await requestJson(joinUrl(config.apiUrl, target), {
    method: "GET"
  });

  if (response.status < 200 || response.status >= 300) {
    addIssue({
      category: "api",
      message: `Unable to resolve a public skill detail page: ${target} returned HTTP ${response.status}.`,
      role,
      severity: "P0",
      url: joinUrl(config.apiUrl, target)
    });
    return null;
  }

  const skills = Array.isArray(response.json?.skills) ? response.json.skills : [];
  const skill =
    skills.find((candidate) => isUsablePublicSkill(candidate, true)) ??
    skills.find((candidate) => isUsablePublicSkill(candidate, false));

  if (!skill) {
    addIssue({
      category: "api",
      message: "No public skill was returned by /v1/skills/search, so the developer detail-page handoff could not be verified.",
      role,
      severity: "P0",
      url: joinUrl(config.apiUrl, target)
    });
    return null;
  }

  addResult(role, "api", target, "pass", `Using ${skill.slug} for public skill detail QA.`);
  return skill.slug;
}

function isUsablePublicSkill(candidate, requireReviewedStatus) {
  if (!candidate || typeof candidate.slug !== "string" || candidate.slug.trim() === "") {
    return false;
  }

  if (!requireReviewedStatus) {
    return true;
  }

  return ["deprecated", "submitted", "verified"].includes(candidate.verificationStatus);
}

function inspectLaunchReadiness(json) {
  const readiness = json?.readiness ?? json;
  const summary = readiness?.summary;

  if (!summary) {
    return;
  }

  const blocker = Number(summary.blocker ?? 0);
  const warning = Number(summary.warning ?? 0);
  const deferred = Number(summary.deferred ?? 0);
  const blockerDetails = collectReadinessDetails(readiness, ["blocker"]);
  const attentionDetails = collectReadinessDetails(readiness, ["warning", "deferred"]);

  if (blocker > 0) {
    addIssue({
      category: "launch-readiness",
      details: blockerDetails,
      message: `Admin launch readiness still reports ${blocker} blocker(s). Public or paid launch should not be treated as fully ready until operators resolve or explicitly gate them.`,
      role: "admin",
      severity: "P1",
      url: joinUrl(config.appUrl, "/admin#launch-readiness")
    });
  }

  if (warning + deferred > 0) {
    addIssue({
      category: "launch-readiness",
      details: attentionDetails,
      message: `Admin launch readiness reports ${warning} warning(s) and ${deferred} deferred item(s). Keep them visible in the launch checklist.`,
      role: "admin",
      severity: "P2",
      url: joinUrl(config.appUrl, "/admin#launch-readiness")
    });
  }
}

function collectReadinessDetails(readiness, statuses) {
  if (!Array.isArray(readiness?.sections)) {
    return [];
  }

  const wanted = new Set(statuses);
  return readiness.sections.flatMap((section) => {
    if (!Array.isArray(section?.items)) {
      return [];
    }

    return section.items
      .filter((item) => wanted.has(item?.status))
      .map((item) => ({
        action: redactSecrets(String(item.action ?? "")),
        detail: redactSecrets(String(item.detail ?? "")),
        itemKey: String(item.key ?? ""),
        label: redactSecrets(String(item.label ?? "")),
        sectionKey: String(section.key ?? ""),
        sectionTitle: redactSecrets(String(section.title ?? "")),
        status: String(item.status ?? "")
      }));
  });
}

async function requestJson(url, options) {
  const response = await request(url, options);
  let json = null;

  try {
    json = response.text ? JSON.parse(response.text) : null;
  } catch {
    json = null;
  }

  return {
    ...response,
    json
  };
}

async function requestText(url, options) {
  return request(url, options);
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {})
      },
      method: options.method ?? "GET",
      redirect: "follow",
      signal: controller.signal
    });

    return {
      status: response.status,
      text: await response.text(),
      url: response.url
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${config.timeoutMs}ms: ${url}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readCredentials(path) {
  try {
    const text = await readFile(path, "utf8");
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Unable to read acceptance-team credentials file at ${path}: ${error.message}`);
  }
}

async function writeReport(path, report) {
  const absolutePath = resolve(path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function assertNoLeaks(role, type, target, text) {
  const leaks = findSensitiveLeaks(text);

  if (leaks.length > 0) {
    addIssue({
      category: "secret-safety",
      message: `${type} ${target} may expose sensitive output: ${leaks.join(", ")}.`,
      role,
      severity: "P0",
      url: type === "page" ? joinUrl(config.appUrl, target) : joinUrl(config.apiUrl, target)
    });
    return false;
  }

  return true;
}

function addResult(role, type, target, status, detail) {
  results.push({
    detail,
    role,
    status,
    target,
    type
  });
}

function addIssue(issue) {
  const details = Array.isArray(issue.details) ? issue.details.map(sanitizeIssueDetail) : undefined;
  issues.push({
    category: issue.category,
    ...(details && details.length > 0 ? { details } : {}),
    message: redactSecrets(issue.message),
    role: issue.role,
    severity: issue.severity,
    url: issue.url
  });
  addResult(issue.role, issue.category, issue.url ?? "n/a", "fail", issue.message);
}

function sanitizeIssueDetail(detail) {
  return Object.fromEntries(
    Object.entries(detail)
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
      .map(([key, value]) => [key, redactSecrets(String(value))])
  );
}

function summarizeIssues(rows) {
  return rows.reduce(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] += 1;
      return summary;
    },
    { P0: 0, P1: 0, P2: 0, total: 0 }
  );
}

function summarizeResults(rows) {
  return rows.reduce(
    (summary, result) => {
      summary.total += 1;
      summary[result.status] = (summary[result.status] ?? 0) + 1;
      return summary;
    },
    { fail: 0, pass: 0, total: 0 }
  );
}

function printSummary(report) {
  console.log("");
  console.log(
    `Summary: ${report.resultSummary.pass} passed, ${report.issueSummary.total} issues (${report.issueSummary.P0} P0, ${report.issueSummary.P1} P1, ${report.issueSummary.P2} P2)`
  );

  if (report.issues.length > 0) {
    for (const issue of report.issues) {
      console.log(`${issue.severity} ${issue.role} ${issue.category}: ${issue.message}${issue.url ? ` (${issue.url})` : ""}`);
      for (const detail of issue.details ?? []) {
        console.log(
          `  - ${detail.status} ${detail.sectionKey}/${detail.itemKey}: ${detail.label}${detail.action ? ` | action: ${detail.action}` : ""}${detail.detail ? ` | detail: ${detail.detail}` : ""}`
        );
      }
    }
  }

  console.log(`Report written: ${resolve(config.output)}`);
}

function shouldFail(summary, failOn) {
  if (failOn === "none") {
    return false;
  }

  if (failOn === "p1") {
    return summary.P0 > 0 || summary.P1 > 0;
  }

  if (failOn === "p2" || failOn === "all") {
    return summary.total > 0;
  }

  return summary.P0 > 0;
}

function safeError(response) {
  const message = response.json?.error ?? response.json?.message ?? response.text ?? `HTTP ${response.status}`;
  return redactSecrets(String(message).slice(0, 500));
}

function joinUrl(baseUrl, path) {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function validateConfig(value) {
  for (const [key, url] of Object.entries({ apiUrl: value.apiUrl, appUrl: value.appUrl })) {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid ${key}: ${url}`);
    }
  }

  if (!["p0", "p1", "p2", "all", "none"].includes(value.failOn)) {
    throw new Error("--fail-on must be p0, p1, p2, all, or none.");
  }
}

function parseArgs(argv) {
  const parsed = {
    apiUrl: undefined,
    appUrl: undefined,
    credentials: undefined,
    failOn: undefined,
    help: false,
    output: undefined,
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

    if (arg === "--credentials") {
      parsed.credentials = nextValue();
      continue;
    }

    if (arg === "--fail-on") {
      parsed.failOn = nextValue();
      continue;
    }

    if (arg === "--output") {
      parsed.output = nextValue();
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
  console.log(`Usage: node scripts/qa-acceptance-team.mjs [options]

Runs role-based acceptance QA using the private acceptance-team credential file.
The script logs in as developer, publisher, and admin/operator, fetches role
workspace pages with the real SkillHub session cookie, checks protected APIs,
collects issues, and writes a secret-safe report.

Options:
  --api-url <url>         Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>         Web app URL. Default: ${DEFAULT_APP_URL}
  --credentials <path>    Private acceptance-team JSON. Default: ${DEFAULT_CREDENTIALS_PATH}
  --output <path>         Secret-safe report path. Default: ${DEFAULT_OUTPUT}
  --fail-on <level>       p0, p1, p2, all, or none. Default: p0
  --timeout-ms <ms>       Request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  -h, --help              Show this help.

Production example:
  pnpm qa:acceptance-team -- --credentials /root/skillhub-acceptance-team.json --output /root/skillhub-acceptance-qa-report.json --fail-on p0
`);
}
