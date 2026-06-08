#!/usr/bin/env node

import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { validateLaunchReadinessContract } from "./qa-launch-readiness-contract.mjs";
import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const PUBLIC_PUBLISHER_FORBIDDEN_FIELD_NAMES = new Set([
  "adminauditlogs",
  "adminnotes",
  "apikey",
  "api_key",
  "auditlogs",
  "billing",
  "billingemail",
  "billingprofile",
  "boost",
  "credential",
  "credentials",
  "curation",
  "curationreason",
  "curationrule",
  "curationrules",
  "email",
  "internalnotes",
  "membertokens",
  "members",
  "operatornotes",
  "operatorreason",
  "organizationid",
  "organizationmembers",
  "ownerid",
  "password",
  "paymentmethod",
  "paymentmethods",
  "payoutaccount",
  "payoutaccountid",
  "payoutaccounts",
  "payoutonboardingsession",
  "provider",
  "provideraccountid",
  "providercustomerid",
  "providerreference",
  "reason",
  "secret",
  "signingsecret",
  "termsacceptedbyuserid",
  "token",
  "userid",
  "userids",
  "webhooksecret",
]);
const PUBLIC_SKILL_FEEDBACK_FORBIDDEN_FIELD_NAMES = new Set([
  "adminnotes",
  "auditlogs",
  "credential",
  "credentials",
  "internalnotes",
  "moderatedat",
  "moderationreason",
  "operatornotes",
  "organizationid",
  "projectid",
  "projectslug",
  "reason",
  "reviewerdisplayname",
  "revieweremail",
  "reviewerorganizationid",
  "reviewerorganizationname",
  "secret",
  "skillid",
  "token",
  "userid",
  "userids",
]);
const PUBLIC_SKILL_PRICE_FORBIDDEN_FIELD_NAMES = new Set([
  "apikey",
  "api_key",
  "balance",
  "commission",
  "commissionrule",
  "commissionruleid",
  "credential",
  "credentials",
  "customerid",
  "invoiceid",
  "ledger",
  "organizationid",
  "paymentmethod",
  "platformfeebps",
  "platformfeecents",
  "projectid",
  "projectslug",
  "provider",
  "providerpriceid",
  "providerreference",
  "publisherprofileid",
  "publishersharebps",
  "publishersharecents",
  "secret",
  "subscriptionid",
  "token",
  "transaction",
  "transactionid",
  "transactions",
]);
const DEFAULT_APP_PATHS = [
  "/",
  "/?lang=zh",
  "/marketplace",
  "/marketplace?q=browser&category=research&runtime=http&sort=lowRisk",
  "/marketplace?lang=zh",
  "/publishers",
  "/publishers?lang=zh",
  "/registry",
  "/registry?lang=zh",
  "/agents",
  "/agents?lang=zh",
  "/docs",
  "/docs?lang=zh",
  "/publish",
  "/publish?lang=zh",
  "/publisher",
  "/publisher?lang=zh",
  "/developer",
  "/developer?lang=zh",
  "/dashboard",
  "/dashboard?lang=zh",
  "/account",
  "/account?lang=zh",
  "/login",
  "/login?lang=zh",
  "/admin-login",
  "/admin-login?lang=zh",
  "/admin",
  "/admin?lang=zh",
  "/terms",
  "/terms?lang=zh",
];
const DEFAULT_TIMEOUT_MS = 10000;
const PAGE_ASSERTIONS = {
  "/": [
    "/dashboard?lang=en#workspace-command-center",
    "/developer?lang=en",
    "/publisher?lang=en",
    "/admin?lang=en",
    "where the backend lives",
  ],
  "/?lang=zh": [
    "/dashboard?lang=zh#workspace-command-center",
    "/developer?lang=zh",
    "/publisher?lang=zh",
    "/admin?lang=zh",
    "\u667a\u80fd\u4f53\u6280\u80fd\u57fa\u7840\u8bbe\u65bd",
    "\u540e\u53f0\u5165\u53e3",
  ],
  "/marketplace": ["marketplace", "publisher", "runtime"],
  "/marketplace?lang=zh": [
    "\u667a\u80fd\u4f53\u6280\u80fd\u5e02\u573a",
    "\u53d1\u5e03\u8005\u76ee\u5f55",
    "\u5b89\u88c5\u547d\u4ee4",
  ],
  "/publishers": ["public publishers", "publisher trust", "marketplace"],
  "/publishers?lang=zh": [
    "\u53d1\u5e03\u8005\u4fe1\u4efb\u76ee\u5f55",
    "\u516c\u5f00\u53d1\u5e03\u8005",
    "\u4ee3\u8868\u6280\u80fd",
  ],
  "/registry": ["registry protocol", "live registry", "manifest quality bar"],
  "/registry?lang=zh": [
    "\u516c\u5f00\u6280\u80fd\u5e93",
    "\u53d1\u73b0\u7aef\u70b9",
    "\u6280\u80fd\u5e93",
  ],
  "/agents?lang=zh": [
    "\u667a\u80fd\u4f53\u8fd0\u884c\u5c42",
    "\u63a5\u5165\u8def\u5f84",
    "\u751f\u4ea7\u667a\u80fd\u4f53\u4f7f\u7528\u524d",
  ],
  "/docs?lang=zh": [
    "\u8fd0\u8425\u53c2\u8003",
    "\u64cd\u4f5c\u624b\u518c",
    "\u8fd0\u8425\u5e73\u53f0 api \u5730\u56fe",
  ],
  "/login": [
    "Sign in to SkillHub",
    "Account password",
    "Register",
    "Continue with Google or GitHub",
  ],
  "/login?lang=zh": [
    "\u8d26\u53f7\u5165\u53e3",
    "\u8d26\u53f7\u5bc6\u7801",
    "\u6ce8\u518c",
    "Google",
  ],
  "/admin-login": [
    "Sign in to SkillHub",
    "Account password",
    "Register",
  ],
  "/admin-login?lang=zh": [
    "\u767b\u5f55 SkillHub",
    "\u8d26\u53f7\u5bc6\u7801",
    "\u6ce8\u518c",
  ],
  "/dashboard": [
    "workspace-command-center",
    "p0-demo-chain",
    "developer workspace",
    "publisher workspace",
    "platform operations",
  ],
  "/dashboard?lang=zh": [
    "workspace-command-center",
    "p0-demo-chain",
    "\u5de5\u4f5c\u53f0\u603b\u63a7",
    "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0",
    "\u5e73\u53f0\u8fd0\u8425\u540e\u53f0",
  ],
  "/publish": [
    "self-service publisher access",
    "preflight repair queue",
    "reviewer evidence packet",
  ],
  "/publish?lang=zh": [
    "\u53d1\u5e03\u8005\u5de5\u4f5c\u6d41",
    "\u9884\u68c0\u4fee\u590d\u961f\u5217",
    "\u5ba1\u6838\u8bc1\u636e\u5305",
  ],
  "/publisher": [
    "publisher workspace",
    "publisher operations queue",
    "paid marketplace readiness",
    "payout readiness",
  ],
  "/publisher?lang=zh": [
    "\u53d1\u5e03\u8005\u8fd0\u8425\u961f\u5217",
    "\u4f18\u5148\u7ea7\u961f\u5217",
    "\u4ed8\u8d39\u963b\u65ad",
    "\u63d0\u73b0\u51c6\u5907",
  ],
  "/developer": [
    "developer workspace",
    "developer operations queue",
    "team access",
    "webhook",
  ],
  "/developer?lang=zh": [
    "\u5f00\u53d1\u8005\u8fd0\u8425\u961f\u5217",
    "\u4f18\u5148\u7ea7\u961f\u5217",
    "\u56e2\u961f\u6743\u9650",
    "webhook",
  ],
  "/admin": [
    "admin operations queue",
    "launch-readiness",
    "review queue",
    "audit",
  ],
  "/admin?lang=zh": [
    "\u7ba1\u7406\u5458\u8fd0\u8425\u961f\u5217",
    "\u4e0a\u7ebf\u5c31\u7eea",
    "\u5ba1\u6838\u961f\u5217",
    "\u5ba1\u8ba1",
  ],
  "/account?lang=zh": [
    "\u4e2a\u4eba\u4e2d\u5fc3",
    "\u4f1a\u8bdd\u5b89\u5168",
    "\u5de5\u4f5c\u533a\u51c6\u5907\u5ea6",
  ],
  "/terms?lang=zh": [
    "\u8fd0\u8425\u6761\u6b3e",
    "\u5e02\u573a\u89c4\u5219",
    "\u6761\u6b3e\u6458\u8981",
  ],
};
const COMMON_UTF8_AS_GBK_MARKERS = [
  "\u9359\u5D89\uE6ED",
  "\u93BB\u612A\u6C26",
  "\u6924\u572D\u6D30",
  "\u6769\u612F\uE511",
  "\u7039\u590E\uE5CA",
  "\u7487\u5CF0\u539B",
  "\u6D93\u70AC\u59E4",
  "\u9359\u621D\u7AF7",
  "\u93C9\u51AE\u6ABA",
  "\u6DC7\u2032\u6362",
  "\u5BEE\u20AC\u9359",
  "\u7039\u2103\u7273",
  "\u934F\uE100\u7D11",
  "\u752F\u509A\u6E80",
  "\u7481\u3224\u69C4",
];
const MOJIBAKE_MARKERS = [
  "\uFFFD",
  "\u9359\u621D",
  "\u5BEE\u20AC",
  "\u7039\u2103",
  "\u7490\uFE40",
  "\u9418\u8235",
  "\u93B6\u20AC",
  "\u6D93\u20AC",
  "\u934F",
  "\u7487",
  "\u9286",
  "\u9428",
  ...COMMON_UTF8_AS_GBK_MARKERS,
];
const SKILL_DETAIL_ASSERTIONS = {
  en: [
    "developer handoff packet",
    "share usage feedback",
    "report a trust or runtime issue",
  ],
  zh: [
    "\u5f00\u53d1\u8005\u4ea4\u63a5\u5305",
    "\u5206\u4eab\u4f7f\u7528\u53cd\u9988",
    "\u62a5\u544a\u4fe1\u4efb\u6216\u8fd0\u884c\u95ee\u9898",
  ],
};
const SOURCE_MOJIBAKE_SCAN_PATHS = [
  "apps/web/app",
  "apps/web/components",
  "apps/web/lib",
  "docs",
  "scripts",
];
const SOURCE_MOJIBAKE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);
const SOURCE_MOJIBAKE_IGNORED_DIRECTORIES = new Set([
  ".next",
  "coverage",
  "dist",
  "node_modules",
  "output",
]);
const SOURCE_MOJIBAKE_MARKERS = [
  "\uFFFD",
  "\u951F\u65A4\u62F7",
  "\u9359\u621D\u7AF7",
  "\u93BA\u0443\u57D7",
  "\u947D\u590C",
  "\u7039\u2103\u7273",
  "\u9422\u3126\u57DB",
  "\u6D93\u20AC",
  ...COMMON_UTF8_AS_GBK_MARKERS,
];
const PUBLIC_P0_PROD_GATE =
  "pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000";
const PROTECTED_P0_PROD_GATE =
  "pnpm smoke:p0 -- --prod --timeout-ms 30000";
const PRIMARY_PROD_API_URL = "https://api.useskillhub.com";
const PRIMARY_PROD_APP_URL = "https://useskillhub.com";
const PROD_API_HEALTH_GATE = "production API health gate";
const DEFAULT_PROD_APP_ALIAS_URLS = [
  "https://www.useskillhub.com",
  "https://app.useskillhub.com",
];
const PROD_APP_ALIAS_GATE = "production web alias gate";
const PROD_APP_ALIAS_PATHS = ["/", "/login?lang=zh"];
const ONE_PANEL_IMAGE_REBUILD =
  "docker compose -f docker-compose.1panel.yml build --no-cache api web";
const ONE_PANEL_CONTAINER_RECREATE =
  "docker compose -f docker-compose.1panel.yml up -d --force-recreate api web";
const RELEASE_COMMAND_GUARDS = [
  {
    file: "docs/server-update.md",
    forbidden: [
      'SKILLHUB_SMOKE_TOKEN="$ADMIN_TOKEN" pnpm smoke:prod',
      "curl \"https://api.useskillhub.com/v1/admin/marketplace-curation?limit=3\"",
    ],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      ONE_PANEL_IMAGE_REBUILD,
      ONE_PANEL_CONTAINER_RECREATE,
      PROD_API_HEALTH_GATE,
      `NEXT_PUBLIC_APP_URL=${PRIMARY_PROD_APP_URL}`,
      PROD_APP_ALIAS_GATE,
      "SKILLHUB_P0_ADMIN_TOKEN",
      "docker restart skillhub-api skillhub-web",
      "Do not run mutating P0 smokes against production during a routine update.",
    ],
  },
  {
    file: "docs/1panel-deploy.md",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      ONE_PANEL_IMAGE_REBUILD,
      ONE_PANEL_CONTAINER_RECREATE,
      "`useskillhub.com` -> `http://127.0.0.1:3100`",
      "`www.useskillhub.com` -> `http://127.0.0.1:3100`",
      PROD_API_HEALTH_GATE,
      `NEXT_PUBLIC_APP_URL=${PRIMARY_PROD_APP_URL}`,
      PROD_APP_ALIAS_GATE,
      "do not rely on `docker restart`",
      "routine post-deploy public gate",
      "Mutating P0 smokes",
    ],
  },
  {
    file: "docs/qa-smoke.md",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      ONE_PANEL_IMAGE_REBUILD,
      ONE_PANEL_CONTAINER_RECREATE,
      "stale-image failure mode",
      "routine 1Panel updates",
      PROD_API_HEALTH_GATE,
      PROD_APP_ALIAS_GATE,
      "performs no\nwrites and does not require an operator token",
    ],
  },
  {
    file: "scripts/deploy-1panel.sh",
    forbidden: ["docker compose -f docker-compose.1panel.yml up -d --build"],
    required: [
      ONE_PANEL_IMAGE_REBUILD,
      ONE_PANEL_CONTAINER_RECREATE,
      "docker compose -f docker-compose.1panel.yml up -d postgres redis",
    ],
  },
  {
    file: "docs/api.md",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      PRIMARY_PROD_API_URL,
      PRIMARY_PROD_APP_URL,
      "routine 1Panel updates",
      "protected Journey C",
      PROD_API_HEALTH_GATE,
      PROD_APP_ALIAS_GATE,
      "Mutating journey checks are opt-in",
    ],
  },
  {
    file: "scripts/qa-p0-release-suite.mjs",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      PRIMARY_PROD_API_URL,
      PRIMARY_PROD_APP_URL,
      PROD_API_HEALTH_GATE,
      PROD_APP_ALIAS_GATE,
      "Routine 1Panel public gate",
      "Performs no writes and does not require an operator token.",
      "Full protected Journey C gate",
      "Requires an admin/super-admin user token already configured in the shell.",
    ],
  },
];

const smokeContext = {
  publicPublisherSlug: undefined,
  publicSkillSlug: undefined,
  stats: undefined,
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

const appUrl =
  args.appUrl ??
  process.env.SKILLHUB_SMOKE_APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  DEFAULT_APP_URL;
const config = {
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appAliasUrls: parseAppAliasUrls(
    args.appAliasUrls ?? process.env.SKILLHUB_SMOKE_APP_ALIAS_URLS,
    appUrl,
  ),
  appUrl,
  appPaths: parseAppPaths(
    args.appPaths ?? process.env.SKILLHUB_SMOKE_APP_PATHS,
  ),
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_SMOKE_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
  skipApi: args.skipApi,
  skipApp: args.skipApp,
  token:
    process.env.SKILLHUB_SMOKE_TOKEN ??
    process.env.SKILLHUB_USER_TOKEN ??
    process.env.SKILLHUB_ADMIN_TOKEN,
};

const results = [];

console.log("SkillHub smoke check");
if (!config.skipApi) {
  console.log(`API: ${config.apiUrl}`);
}
if (!config.skipApp) {
  console.log(`App: ${config.appUrl}`);
  if (config.appAliasUrls.length > 0) {
    console.log(`App aliases: ${config.appAliasUrls.join(", ")}`);
  }
  console.log(`App paths: ${config.appPaths.join(", ")}`);
}
console.log("");

await checkSourceMojibake();
await checkReleaseCommandGate();

if (!config.skipApi) {
  await checkHealth(config);
  await checkStats(config);
  await checkAuthProviders(config);
  await checkAdminProtection(config);
  await checkWorkspaceProtection(config);
  await checkPublicSkillSearch(config);
  await checkPublicSkillCategorySearch(config);
  await checkPublicSkillDetailApi(config);
  await checkPublicSkillDetailSupportApis(config);
  await checkPublicSkillActionProtection(config);
  await checkAdminActionProtection(config);
  await checkPublicMcpDiscovery(config);
  await checkPublicPublishers(config);
  await checkPublicPublisherProfileApi(config);
  await checkLaunchReadiness(config);
}

if (!config.skipApp) {
  await checkAppPages(config);
  await checkProductionAppAliases(config);
}

printSummary(results);

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
}

async function checkHealth({ apiUrl, timeoutMs }) {
  const name = "GET /health";

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, "/health"), {
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (json?.ok !== true || json?.service !== "skillhub-gateway") {
      fail(name, "expected SkillHub gateway health payload");
      return;
    }

    const leaks = findBoundarySensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive health leak: ${leaks[0]}`);
      return;
    }

    if (isPrimaryProductionApiUrl(apiUrl) && json?.env !== "production") {
      fail(
        name,
        `${PROD_API_HEALTH_GATE}: expected env=production for ${PRIMARY_PROD_API_URL}, got ${json?.env ?? "missing"}`,
      );
      return;
    }

    pass(name, `service=${json.service}, env=${json.env ?? "unknown"}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkStats({ apiUrl, timeoutMs }) {
  const name = "GET /v1/stats";

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, "/v1/stats"), {
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    const requiredNumbers = ["publishedSkills", "verifiedSkills", "apiCalls"];
    const missing = requiredNumbers.filter(
      (key) => !isFiniteNumber(json?.[key]),
    );
    const latencyValid =
      json?.avgLatencyMs === null || isFiniteNumber(json?.avgLatencyMs);

    if (missing.length > 0 || !latencyValid) {
      fail(
        name,
        `unexpected stats payload shape (${[...missing, ...(latencyValid ? [] : ["avgLatencyMs"])].join(", ")})`,
      );
      return;
    }

    smokeContext.stats = json;

    pass(
      name,
      `published=${json.publishedSkills}, verified=${json.verifiedSkills}`,
    );
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkAuthProviders({ apiUrl, timeoutMs }) {
  const name = "GET /v1/auth/providers";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/auth/providers"),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (!Array.isArray(json?.providers)) {
      fail(name, "expected providers array");
      return;
    }

    const providerIds = new Set(
      json.providers.map((provider) => provider?.provider),
    );
    const requiredProviders = ["email", "google", "github", "token"];
    const missing = requiredProviders.filter(
      (provider) => !providerIds.has(provider),
    );

    if (missing.length > 0) {
      fail(name, `missing providers: ${missing.join(", ")}`);
      return;
    }

    const invalid = json.providers.filter(
      (provider) => typeof provider?.status !== "string",
    );

    if (invalid.length > 0) {
      fail(name, "each provider should include a string status");
      return;
    }

    pass(
      name,
      `providers=${json.providers.map((provider) => `${provider.provider}:${provider.status}`).join(", ")}`,
    );
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkAdminProtection({ apiUrl, timeoutMs }) {
  const paths = [
    "/v1/admin/overview",
    "/v1/admin/reviews",
    "/v1/admin/finance/ledger",
    "/v1/admin/payouts",
    "/v1/admin/notifications",
    "/v1/admin/notification-templates",
    "/v1/admin/notification-deliveries",
    "/v1/admin/webhook-deliveries",
    "/v1/admin/identity-directory",
    "/v1/admin/audit-logs",
    "/v1/admin/marketplace-curation",
  ];

  await checkProtectedReadBoundaries({
    apiUrl,
    paths,
    successMessage: "protected by role-aware authorization",
    timeoutMs,
  });
}

async function checkWorkspaceProtection({ apiUrl, timeoutMs }) {
  const paths = [
    "/v1/organization/team",
    "/v1/organization/webhooks",
    "/v1/organization/billing",
    "/v1/developer/projects",
    "/v1/publisher/skills",
    "/v1/publisher/payouts",
    "/v1/publisher/finance/ledger",
    "/v1/publisher/marketplace-appeals",
  ];

  await checkProtectedReadBoundaries({
    apiUrl,
    paths,
    successMessage: "protected by organization-scoped workspace authorization",
    timeoutMs,
  });
}

async function checkProtectedReadBoundaries({
  apiUrl,
  paths,
  successMessage,
  timeoutMs,
}) {
  for (const path of paths) {
    const name = `GET ${path} without token`;

    try {
      const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
        timeoutMs,
      });

      if (![401, 403].includes(status)) {
        fail(name, `expected HTTP 401/403, got ${status}`);
        continue;
      }

      if (typeof json?.error !== "string" || json.error.length === 0) {
        fail(name, "expected a JSON error message");
        continue;
      }

      const leaks = findBoundarySensitiveLeaks(text);

      if (leaks.length > 0) {
        fail(name, `possible sensitive boundary leak: ${leaks[0]}`);
        continue;
      }

      pass(name, successMessage);
    } catch (error) {
      fail(name, redactSecrets(error.message));
    }
  }
}

async function checkProtectedWriteBoundaries({
  apiUrl,
  endpoints,
  successMessage,
  timeoutMs,
}) {
  for (const endpoint of endpoints) {
    try {
      const { status, json, text } = await requestJson(
        joinUrl(apiUrl, endpoint.path),
        {
          body: JSON.stringify(endpoint.body),
          headers: { "Content-Type": "application/json" },
          method: endpoint.method ?? "POST",
          timeoutMs,
        },
      );

      if (![401, 403].includes(status)) {
        fail(endpoint.name, `expected HTTP 401/403, got ${status}`);
        continue;
      }

      if (typeof json?.error !== "string" || json.error.length === 0) {
        fail(endpoint.name, "expected a JSON error message");
        continue;
      }

      const leaks = findBoundarySensitiveLeaks(text);

      if (leaks.length > 0) {
        fail(endpoint.name, `possible sensitive boundary leak: ${leaks[0]}`);
        continue;
      }

      pass(endpoint.name, successMessage);
    } catch (error) {
      fail(endpoint.name, redactSecrets(error.message));
    }
  }
}

async function checkPublicSkillSearch({ apiUrl, timeoutMs }) {
  const name = "GET /v1/skills/search";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/skills/search?limit=5"),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (!Array.isArray(json?.skills)) {
      fail(name, "expected skills array");
      return;
    }

    if (
      (smokeContext.stats?.publishedSkills ?? 0) > 0 &&
      json.skills.length === 0
    ) {
      fail(
        name,
        "stats reports published skills but public search returned none; run registry migrations or inspect public listing filters",
      );
      return;
    }

    const invalidSkill = json.skills.find((skill) => {
      const successRateValid =
        skill?.successRate === null ||
        (isFiniteNumber(skill?.successRate) &&
          skill.successRate >= 0 &&
          skill.successRate <= 1);
      const avgLatencyValid =
        skill?.avgLatencyMs === null ||
        (isFiniteNumber(skill?.avgLatencyMs) && skill.avgLatencyMs >= 0);
      const averageRatingValid =
        skill?.averageRating === null ||
        (isFiniteNumber(skill?.averageRating) &&
          skill.averageRating >= 0 &&
          skill.averageRating <= 5);

      return (
        typeof skill?.slug !== "string" ||
        typeof skill?.displayName !== "string" ||
        typeof skill?.description !== "string" ||
        !Array.isArray(skill?.tags) ||
        typeof skill?.version !== "string" ||
        !["draft", "submitted", "verified", "deprecated", "rejected", "suspended"].includes(
          skill?.verificationStatus,
        ) ||
        !["low", "medium", "high"].includes(skill?.permissionLevel) ||
        !["http", "mcp", "local"].includes(skill?.runtimeType) ||
        !["free", "per_call", "subscription"].includes(skill?.billingModel) ||
        !isFiniteNumber(skill?.installCount) ||
        !isFiniteNumber(skill?.invocationCount) ||
        !successRateValid ||
        !avgLatencyValid ||
        !averageRatingValid ||
        !isFiniteNumber(skill?.feedbackCount)
      );
    });

    if (invalidSkill) {
      fail(
        name,
        "skill rows should include public marketplace operating signals: identity, version, verification, permission risk, runtime, billing, install/call counts, success, latency, rating, and feedback",
      );
      return;
    }

    const leakedCurationField = json.skills.find(
      (skill) =>
        Object.hasOwn(skill, "curation") ||
        Object.hasOwn(skill, "boost") ||
        Object.hasOwn(skill, "reason") ||
        Object.hasOwn(skill, "operatorReason"),
    );

    if (leakedCurationField) {
      fail(
        name,
        "public search rows must not expose internal curation fields",
      );
      return;
    }

    smokeContext.publicSkillSlug = json.skills[0]?.slug;

    pass(name, `skills=${json.skills.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicSkillCategorySearch({ apiUrl, timeoutMs }) {
  const category = "research";
  const name = `GET /v1/skills/search?category=${category}`;

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/search?category=${category}&limit=20`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (!Array.isArray(json?.skills)) {
      fail(name, "expected skills array");
      return;
    }

    if (json.skills.length === 0) {
      skip(
        name,
        "no research-category public skills returned; base public search reports whether empty supply is expected",
      );
      return;
    }

    const mismatch = json.skills.find(
      (skill) => inferPublicSkillCategory(skill?.tags) !== category,
    );

    if (mismatch) {
      fail(
        name,
        `category filter returned ${mismatch.slug ?? "an unknown skill"} outside ${category}`,
      );
      return;
    }

    pass(name, `skills=${json.skills.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicPublishers({ apiUrl, timeoutMs }) {
  const name = "GET /v1/publishers";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/publishers?limit=5"),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (!Array.isArray(json?.publishers)) {
      fail(name, "expected publishers array");
      return;
    }

    if (
      ((smokeContext.stats?.publishedSkills ?? 0) > 0 ||
        smokeContext.publicSkillSlug) &&
      json.publishers.length === 0
    ) {
      fail(
        name,
        "public skills exist but publisher directory returned none; inspect publisher profile derivation and public skill ownership",
      );
      return;
    }

    const invalidPublisher = json.publishers.find(
      (publisher) =>
        typeof publisher?.slug !== "string" ||
        typeof publisher?.displayName !== "string" ||
        typeof publisher?.trustLevel !== "string" ||
        !Array.isArray(publisher?.skills) ||
        !isFiniteNumber(publisher?.metrics?.publicSkillCount),
    );

    if (invalidPublisher) {
      fail(
        name,
        "publisher rows should include slug, displayName, trustLevel, metrics, and public skills",
      );
      return;
    }

    if (!assertNoPublicPublisherSensitiveBoundary(name, json, text)) {
      return;
    }

    smokeContext.publicPublisherSlug = json.publishers[0]?.slug;

    pass(name, `publishers=${json.publishers.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicSkillDetailApi({ apiUrl, timeoutMs }) {
  const slug = smokeContext.publicSkillSlug;
  const name = "GET /v1/skills/:slug";

  if (!slug) {
    skip(
      name,
      "no public skill returned by /v1/skills/search; API smoke reports whether that is expected",
    );
    return;
  }

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/${encodeURIComponent(slug)}`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200 for ${slug}, got ${status}`);
      return;
    }

    const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
      text.includes(marker),
    );

    if (mojibakeMarkers.length > 0) {
      fail(
        name,
        `possible mojibake markers in manifest: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
      );
      return;
    }

    const requiredFields = [
      ["name", typeof json?.name === "string"],
      ["displayName", typeof json?.displayName === "string"],
      ["version", typeof json?.version === "string"],
      ["description", typeof json?.description === "string"],
      ["tags", Array.isArray(json?.tags)],
      ["runtime.type", typeof json?.runtime?.type === "string"],
      [
        "permissions.filesystem",
        typeof json?.permissions?.filesystem === "string",
      ],
      ["permissions.secrets", Array.isArray(json?.permissions?.secrets)],
      ["inputSchema", isObjectRecord(json?.inputSchema)],
      ["outputSchema", isObjectRecord(json?.outputSchema)],
    ];
    const missing = requiredFields
      .filter(([, isValid]) => !isValid)
      .map(([field]) => field);

    if (missing.length > 0) {
      fail(
        name,
        `manifest is missing required public fields: ${missing.join(", ")}`,
      );
      return;
    }

    if (json.name !== slug) {
      fail(
        name,
        `manifest name ${json.name} did not match search slug ${slug}`,
      );
      return;
    }

    if (!assertNoPublicSkillManifestSensitiveBoundary(name, json, text)) {
      return;
    }

    pass(name, `${json.name}@${json.version}, runtime=${json.runtime.type}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicSkillDetailSupportApis({ apiUrl, timeoutMs }) {
  const slug = smokeContext.publicSkillSlug;

  if (!slug) {
    skip(
      "GET /v1/skills/:slug/feedback",
      "no public skill returned by /v1/skills/search; API smoke reports whether that is expected",
    );
    skip(
      "GET /v1/skills/:slug/prices",
      "no public skill returned by /v1/skills/search; API smoke reports whether that is expected",
    );
    return;
  }

  await checkPublicSkillFeedbackApi({ apiUrl, slug, timeoutMs });
  await checkPublicSkillPricesApi({ apiUrl, slug, timeoutMs });
}

async function checkPublicSkillFeedbackApi({ apiUrl, slug, timeoutMs }) {
  const name = "GET /v1/skills/:slug/feedback";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/${encodeURIComponent(slug)}/feedback?limit=12`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200 for ${slug}, got ${status}`);
      return;
    }

    const ratingBreakdown = json?.summary?.ratingBreakdown;
    const invalidSummary =
      !isObjectRecord(json?.summary) ||
      !Array.isArray(json?.feedback) ||
      !isNullableFiniteNumber(json.summary.averageRating) ||
      !isFiniteNumber(json.summary.publishedCount) ||
      !isObjectRecord(ratingBreakdown) ||
      !["1", "2", "3", "4", "5"].every((key) =>
        isFiniteNumber(ratingBreakdown[key]),
      );

    if (invalidSummary) {
      fail(name, "expected feedback array plus rating summary contract");
      return;
    }

    const invalidFeedback = json.feedback.find(
      (item) =>
        typeof item?.id !== "string" ||
        typeof item?.skillSlug !== "string" ||
        typeof item?.title !== "string" ||
        typeof item?.body !== "string" ||
        !isFiniteNumber(item?.rating) ||
        item.rating < 1 ||
        item.rating > 5 ||
        (item?.status !== undefined && item.status !== "published"),
    );

    if (invalidFeedback) {
      fail(
        name,
        "feedback rows should be public published records with id, skillSlug, title, body, and rating",
      );
      return;
    }

    if (!assertNoPublicSkillFeedbackSensitiveBoundary(name, json, text)) {
      return;
    }

    pass(
      name,
      `feedback=${json.feedback.length}, published=${json.summary.publishedCount}`,
    );
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicSkillPricesApi({ apiUrl, slug, timeoutMs }) {
  const name = "GET /v1/skills/:slug/prices";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/${encodeURIComponent(slug)}/prices`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200 for ${slug}, got ${status}`);
      return;
    }

    if (!Array.isArray(json?.prices)) {
      fail(name, "expected prices array");
      return;
    }

    const invalidPrice = json.prices.find(
      (price) =>
        typeof price?.id !== "string" ||
        typeof price?.skillSlug !== "string" ||
        !["free", "per_call", "subscription"].includes(price?.billingModel) ||
        typeof price?.currency !== "string" ||
        !isFiniteNumber(price?.unitAmountCents) ||
        price?.status !== "active",
    );

    if (invalidPrice) {
      fail(
        name,
        "public price rows should include id, skillSlug, billing model, currency, amount, and active status",
      );
      return;
    }

    if (!assertNoPublicSkillPriceSensitiveBoundary(name, json, text)) {
      return;
    }

    pass(name, `prices=${json.prices.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicSkillActionProtection({ apiUrl, timeoutMs }) {
  const skillSlug = smokeContext.publicSkillSlug ?? "public-action-boundary";
  const projectSlug = "public-action-boundary";
  const endpoints = [
    {
      body: {
        manifest: {
          description: "Unauthorized publish boundary smoke.",
          displayName: "Unauthorized Publish Boundary",
          inputSchema: { type: "object" },
          name: skillSlug,
          outputSchema: { type: "object" },
          permissions: { browser: false, filesystem: "none", network: false },
          runtime: { entrypoint: "https://example.com/runtime", type: "http" },
          schemaVersion: "0.1",
          tags: ["ops"],
          version: "0.1.0",
        },
      },
      name: "POST /v1/skills without token",
      path: "/v1/skills",
    },
    {
      body: {
        body: "Routine public smoke should not be able to submit this feedback.",
        rating: 5,
        title: "Unauthorized feedback boundary",
        useCase: "Public gate authorization check",
      },
      name: "POST /v1/skills/:slug/feedback without token",
      path: `/v1/skills/${encodeURIComponent(skillSlug)}/feedback`,
    },
    {
      body: {
        category: "security",
        description:
          "Routine public smoke should not be able to submit this trust report.",
        severity: "medium",
        title: "Unauthorized trust report boundary",
      },
      name: "POST /v1/skills/:slug/abuse-reports without token",
      path: `/v1/skills/${encodeURIComponent(skillSlug)}/abuse-reports`,
    },
    {
      body: {
        skillSlug,
        status: "trialing",
      },
      name: "POST /v1/projects/:projectSlug/subscriptions without token",
      path: `/v1/projects/${projectSlug}/subscriptions`,
    },
    {
      body: {
        email: "unauthorized-smoke@example.com",
        role: "developer",
      },
      name: "POST /v1/organization/team/members without token",
      path: "/v1/organization/team/members",
    },
    {
      body: {
        name: "Unauthorized member token boundary",
      },
      name: "POST /v1/organization/team/members/:userId/tokens without token",
      path: "/v1/organization/team/members/public-user-boundary/tokens",
    },
    {
      body: {
        events: ["skill.review.approved"],
        url: "https://example.com/skillhub-webhook-boundary",
      },
      name: "POST /v1/organization/webhooks without token",
      path: "/v1/organization/webhooks",
    },
    {
      body: {
        status: "paused",
      },
      method: "PUT",
      name: "PUT /v1/organization/webhooks/:endpointId without token",
      path: "/v1/organization/webhooks/public-webhook-boundary",
    },
    {
      body: {},
      name: "POST /v1/organization/webhooks/:endpointId/rotate-secret without token",
      path: "/v1/organization/webhooks/public-webhook-boundary/rotate-secret",
    },
    {
      body: {
        billingEmail: "unauthorized-smoke@example.com",
      },
      method: "PUT",
      name: "PUT /v1/organization/billing/profile without token",
      path: "/v1/organization/billing/profile",
    },
    {
      body: {
        name: "Unauthorized boundary project",
        slug: projectSlug,
      },
      name: "POST /v1/developer/projects without token",
      path: "/v1/developer/projects",
    },
    {
      body: {
        description: "Unauthorized buyer request boundary.",
        title: "Unauthorized buyer request",
      },
      name: "POST /v1/developer/buyer-requests without token",
      path: "/v1/developer/buyer-requests",
    },
    {
      body: {
        skillSlug,
      },
      name: "POST /v1/projects/:projectSlug/saved-skills without token",
      path: `/v1/projects/${projectSlug}/saved-skills`,
    },
    {
      body: {
        skillSlug,
      },
      name: "POST /v1/projects/:projectSlug/installed-skills without token",
      path: `/v1/projects/${projectSlug}/installed-skills`,
    },
    {
      body: {
        maxCallsPerDay: 10,
        status: "enabled",
      },
      method: "PUT",
      name: "PUT /v1/projects/:projectSlug/policies/:skillSlug without token",
      path: `/v1/projects/${projectSlug}/policies/${encodeURIComponent(skillSlug)}`,
    },
    {
      body: {
        name: "Unauthorized runtime key boundary",
      },
      name: "POST /v1/projects/:projectSlug/api-keys without token",
      path: `/v1/projects/${projectSlug}/api-keys`,
    },
    {
      body: {
        input: {},
        skillSlug,
      },
      name: "POST /v1/projects/:projectSlug/runtime/test without token",
      path: `/v1/projects/${projectSlug}/runtime/test`,
    },
    {
      body: {
        input: {},
        skillSlug,
      },
      name: "POST /v1/runtime/invoke without project key",
      path: "/v1/runtime/invoke",
    },
    {
      body: {
        currency: "USD",
        billingModel: "free",
        status: "active",
        unitAmountCents: 0,
      },
      name: "POST /v1/skills/:slug/prices without token",
      path: `/v1/skills/${encodeURIComponent(skillSlug)}/prices`,
    },
    {
      body: {
        manifest: {
          description: "Unauthorized version boundary smoke.",
          displayName: "Unauthorized Version Boundary",
          inputSchema: { type: "object" },
          name: skillSlug,
          outputSchema: { type: "object" },
          permissions: { browser: false, filesystem: "none", network: false },
          runtime: { entrypoint: "https://example.com/runtime", type: "http" },
          schemaVersion: "0.1",
          tags: ["ops"],
          version: "0.1.1",
        },
      },
      name: "POST /v1/publisher/skills/:skillSlug/versions without token",
      path: `/v1/publisher/skills/${encodeURIComponent(skillSlug)}/versions`,
    },
    {
      body: {},
      name: "POST /v1/publisher/skills/:skillSlug/versions/:version/submit without token",
      path: `/v1/publisher/skills/${encodeURIComponent(skillSlug)}/versions/0.1.1/submit`,
    },
    {
      body: {
        appealReason: "Unauthorized marketplace appeal boundary.",
        evidenceUrl: "https://example.com/skillhub-appeal-boundary",
        requestedPlacement: "standard",
      },
      name: "POST /v1/publisher/skills/:skillSlug/marketplace-appeals without token",
      path: `/v1/publisher/skills/${encodeURIComponent(skillSlug)}/marketplace-appeals`,
    },
    {
      body: {
        body: "Unauthorized publisher feedback response boundary.",
      },
      name: "POST /v1/publisher/skill-feedback/:feedbackId/response without token",
      path: "/v1/publisher/skill-feedback/public-feedback-boundary/response",
    },
    {
      body: {
        displayName: "Unauthorized Publisher Boundary",
      },
      method: "PUT",
      name: "PUT /v1/publisher/profile without token",
      path: "/v1/publisher/profile",
    },
    {
      body: {
        termsVersion: "2026-06-05-prelaunch-operating-terms",
      },
      name: "POST /v1/publisher/terms/accept without token",
      path: "/v1/publisher/terms/accept",
    },
    {
      body: {
        manualAccount: "publisher-paypal@example.com",
        manualAccountHolder: "SkillHub Smoke Publisher",
        manualMethod: "paypal",
        manualNotes: "Routine no-token boundary probe for manual payout setup.",
        provider: "manual_deferred",
        refreshUrl: "https://example.com/refresh",
        returnUrl: "https://example.com/return",
      },
      name: "POST /v1/publisher/payout-account/onboarding without token",
      path: "/v1/publisher/payout-account/onboarding",
    },
    {
      body: {
        reason: "Routine no-token boundary probe for finance payout verification.",
        sessionId: "public-payout-session-boundary",
        status: "verified",
      },
      name: "POST /v1/publisher/payout-account/onboarding/complete without token",
      path: "/v1/publisher/payout-account/onboarding/complete",
    },
    {
      body: {
        currency: "USD",
      },
      name: "POST /v1/publisher/payouts without token",
      path: "/v1/publisher/payouts",
    },
  ];

  await checkProtectedWriteBoundaries({
    apiUrl,
    endpoints,
    successMessage: "protected by user/project/workspace authorization",
    timeoutMs,
  });
}

async function checkAdminActionProtection({ apiUrl, timeoutMs }) {
  const skillSlug = smokeContext.publicSkillSlug ?? "admin-action-boundary";
  const endpoints = [
    {
      body: {
        notes: "Unauthorized admin review boundary.",
        status: "rejected",
      },
      name: "POST /v1/admin/reviews/:reviewId/decision without token",
      path: "/v1/admin/reviews/public-review-boundary/decision",
    },
    {
      body: {
        name: "Unauthorized commission boundary",
        platformFeeBps: 2000,
        publisherShareBps: 8000,
        reason: "Routine public smoke should not be able to create commission rules.",
      },
      name: "POST /v1/admin/finance/commission-rules without token",
      path: "/v1/admin/finance/commission-rules",
    },
    {
      body: {
        limit: 1,
      },
      name: "POST /v1/admin/finance/process-usage without token",
      path: "/v1/admin/finance/process-usage",
    },
    {
      body: {
        limit: 1,
      },
      name: "POST /v1/admin/finance/process-subscriptions without token",
      path: "/v1/admin/finance/process-subscriptions",
    },
    {
      body: {
        limit: 1,
      },
      name: "POST /v1/admin/finance/renew-subscriptions without token",
      path: "/v1/admin/finance/renew-subscriptions",
    },
    {
      body: {
        limit: 1,
      },
      name: "POST /v1/admin/finance/release-balances without token",
      path: "/v1/admin/finance/release-balances",
    },
    {
      body: {
        amountCents: 100,
        reason: "Unauthorized refund boundary.",
        transactionId: "public-transaction-boundary",
      },
      name: "POST /v1/admin/finance/refunds without token",
      path: "/v1/admin/finance/refunds",
    },
    {
      body: {
        action: "reject",
        reason: "Unauthorized refund decision boundary.",
      },
      name: "POST /v1/admin/finance/refunds/:refundId/decision without token",
      path: "/v1/admin/finance/refunds/public-refund-boundary/decision",
    },
    {
      body: {
        amountCents: 100,
        reason: "Unauthorized dispute boundary.",
        status: "open",
        transactionId: "public-transaction-boundary",
      },
      name: "POST /v1/admin/finance/disputes without token",
      path: "/v1/admin/finance/disputes",
    },
    {
      body: {
        reason: "Unauthorized dispute decision boundary.",
        status: "open",
      },
      name: "POST /v1/admin/finance/disputes/:disputeId/decision without token",
      path: "/v1/admin/finance/disputes/public-dispute-boundary/decision",
    },
    {
      body: {
        action: "block",
        reason: "Unauthorized payout decision boundary.",
        retryCondition: "Provide a valid finance operator token.",
      },
      name: "POST /v1/admin/payouts/:payoutId/decision without token",
      path: "/v1/admin/payouts/public-payout-boundary/decision",
    },
    {
      body: {
        action: "skip",
        reason: "Unauthorized notification delivery boundary.",
      },
      name: "POST /v1/admin/notification-deliveries/:notificationId/decision without token",
      path: "/v1/admin/notification-deliveries/public-notification-boundary/decision",
    },
    {
      body: {
        limit: 1,
        mode: "dry_run",
      },
      name: "POST /v1/admin/notification-deliveries/process without token",
      path: "/v1/admin/notification-deliveries/process",
    },
    {
      body: {
        limit: 1,
        mode: "dry_run",
      },
      name: "POST /v1/admin/webhook-deliveries/process without token",
      path: "/v1/admin/webhook-deliveries/process",
    },
    {
      body: {
        body: "Unauthorized notification template boundary.",
        channel: "in_app",
        eventType: "platform.notification_delivery.updated",
        locale: "en",
        status: "draft",
        subject: "Unauthorized notification template boundary",
      },
      name: "POST /v1/admin/notification-templates without token",
      path: "/v1/admin/notification-templates",
    },
    {
      body: {
        boost: 0,
        placement: "standard",
        reason: "Unauthorized marketplace curation boundary.",
      },
      method: "PUT",
      name: "PUT /v1/admin/marketplace-curation/:skillSlug without token",
      path: `/v1/admin/marketplace-curation/${encodeURIComponent(skillSlug)}`,
    },
    {
      body: {
        action: "reject",
        reason: "Unauthorized marketplace curation appeal boundary.",
      },
      name: "POST /v1/admin/marketplace-curation/appeals/:appealId/decision without token",
      path: "/v1/admin/marketplace-curation/appeals/public-appeal-boundary/decision",
    },
    {
      body: {
        severity: "medium",
        skillSlug,
        summary: "Routine public smoke should not be able to open an incident.",
        title: "Unauthorized incident boundary",
      },
      name: "POST /v1/admin/incidents without token",
      path: "/v1/admin/incidents",
    },
    {
      body: {
        reason: "Unauthorized incident decision boundary.",
        status: "monitoring",
      },
      name: "POST /v1/admin/incidents/:incidentId/decision without token",
      path: "/v1/admin/incidents/public-incident-boundary/decision",
    },
    {
      body: {
        action: "dismiss",
        reason: "Unauthorized abuse report decision boundary.",
      },
      name: "POST /v1/admin/abuse-reports/:reportId/decision without token",
      path: "/v1/admin/abuse-reports/public-report-boundary/decision",
    },
    {
      body: {
        action: "reject",
        reason: "Unauthorized feedback moderation boundary.",
      },
      name: "POST /v1/admin/skill-feedback/:feedbackId/decision without token",
      path: "/v1/admin/skill-feedback/public-feedback-boundary/decision",
    },
  ];

  await checkProtectedWriteBoundaries({
    apiUrl,
    endpoints,
    successMessage: "protected by admin/operator authorization",
    timeoutMs,
  });
}

async function checkPublicMcpDiscovery({ apiUrl, timeoutMs }) {
  await checkPublicMcpToolList({ apiUrl, timeoutMs });
  const publicResource = await checkPublicMcpResourceList({ apiUrl, timeoutMs });
  if (publicResource) {
    await checkPublicMcpResourceRead({ apiUrl, resource: publicResource, timeoutMs });
  }
  await checkPublicMcpToolCallBoundary({ apiUrl, timeoutMs });
}

async function checkPublicMcpToolList({ apiUrl, timeoutMs }) {
  const name = "POST /mcp tools/list public discovery";

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "public-tools-list-smoke",
        method: "tools/list",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (json?.jsonrpc !== "2.0" || json?.id !== "public-tools-list-smoke") {
      fail(name, "expected a JSON-RPC 2.0 response with the request id");
      return;
    }

    if (json?.error) {
      fail(name, `unexpected JSON-RPC error: ${safeJsonRpcError(json.error)}`);
      return;
    }

    const tools = json?.result?.tools;

    if (!Array.isArray(tools)) {
      fail(name, "expected result.tools array");
      return;
    }

    if (smokeContext.publicSkillSlug) {
      const publicSkillTool = tools.find(
        (tool) => tool?.name === smokeContext.publicSkillSlug,
      );

      if (!publicSkillTool) {
        fail(
          name,
          `public search returned ${smokeContext.publicSkillSlug} but MCP tools/list did not expose it`,
        );
        return;
      }
    }

    const invalidTool = tools.find(
      (tool) =>
        typeof tool?.name !== "string" ||
        typeof tool?.title !== "string" ||
        typeof tool?.description !== "string" ||
        !isObjectRecord(tool?.inputSchema) ||
        !isObjectRecord(tool?.outputSchema) ||
        !isObjectRecord(tool?.annotations) ||
        !Array.isArray(tool.annotations.tags) ||
        typeof tool.annotations.version !== "string" ||
        !["http", "mcp", "local"].includes(tool.annotations.runtimeType) ||
        !["low", "medium", "high"].includes(tool.annotations.permissionLevel),
    );

    if (invalidTool) {
      fail(
        name,
        "public MCP tools should include marketplace-safe identity, schema, version, runtime, tags, and permission annotations",
      );
      return;
    }

    const internalField = tools.find(findPublicMcpInternalField);

    if (internalField) {
      fail(
        name,
        "public MCP tools/list must not expose project install, approval, curation, or operator fields",
      );
      return;
    }

    const leaks = findBoundarySensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive MCP discovery leak: ${leaks[0]}`);
      return;
    }

    pass(name, `tools=${tools.length}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkPublicMcpToolCallBoundary({ apiUrl, timeoutMs }) {
  const skillSlug = smokeContext.publicSkillSlug ?? "public-action-boundary";
  const name = "POST /mcp tools/call without project key";

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "public-tools-call-boundary-smoke",
        method: "tools/call",
        params: {
          name: skillSlug,
          arguments: {
            query: "Routine public smoke should not execute this MCP call.",
          },
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200 JSON-RPC boundary response, got ${status}`);
      return;
    }

    if (json?.jsonrpc !== "2.0" || json?.id !== "public-tools-call-boundary-smoke") {
      fail(name, "expected a JSON-RPC 2.0 response with the request id");
      return;
    }

    const result = json?.result;
    const structured = result?.structuredContent;

    if (
      !result ||
      result.isError !== true ||
      !Array.isArray(result.content) ||
      structured?.code !== "missing_api_key" ||
      typeof structured?.error !== "string"
    ) {
      fail(
        name,
        "expected an MCP isError result with missing_api_key and no runtime execution",
      );
      return;
    }

    if (
      structured.invocationId ||
      structured.status === "success" ||
      structured.billable === true ||
      structured.output
    ) {
      fail(
        name,
        "unauthenticated MCP tools/call must not return invocation, billable, or output state",
      );
      return;
    }

    const leaks = findBoundarySensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive MCP boundary leak: ${leaks[0]}`);
      return;
    }

    pass(name, "blocked before project runtime governance");
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkPublicMcpResourceList({ apiUrl, timeoutMs }) {
  const name = "POST /mcp resources/list public discovery";

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "public-resources-list-smoke",
        method: "resources/list",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return null;
    }

    if (json?.jsonrpc !== "2.0" || json?.id !== "public-resources-list-smoke") {
      fail(name, "expected a JSON-RPC 2.0 response with the request id");
      return null;
    }

    if (json?.error) {
      fail(name, `unexpected JSON-RPC error: ${safeJsonRpcError(json.error)}`);
      return null;
    }

    const resources = json?.result?.resources;

    if (!Array.isArray(resources)) {
      fail(name, "expected result.resources array");
      return null;
    }

    const invalidResource = resources.find(
      (resource) =>
        typeof resource?.uri !== "string" ||
        !resource.uri.startsWith("skillhub://skills/") ||
        typeof resource?.name !== "string" ||
        typeof resource?.description !== "string" ||
        resource?.mimeType !== "application/json",
    );

    if (invalidResource) {
      fail(
        name,
        "public MCP resources should include skillhub URI, name, description, and JSON mime type",
      );
      return null;
    }

    const internalField = resources.find(findPublicMcpInternalField);

    if (internalField) {
      fail(name, "public MCP resources/list must not expose project or operator fields");
      return null;
    }

    const leaks = findBoundarySensitiveLeaks(text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive MCP resource-list leak: ${leaks[0]}`);
      return null;
    }

    if (!smokeContext.publicSkillSlug) {
      pass(name, `resources=${resources.length}`);
      return resources[0] ?? null;
    }

    const publicSkillResource = resources.find(
      (resource) =>
        resource?.uri === `skillhub://skills/${smokeContext.publicSkillSlug}`,
    );

    if (!publicSkillResource) {
      fail(
        name,
        `public search returned ${smokeContext.publicSkillSlug} but MCP resources/list did not expose it`,
      );
      return null;
    }

    pass(name, `resources=${resources.length}`);
    return publicSkillResource;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublicMcpResourceRead({ apiUrl, resource, timeoutMs }) {
  const name = "POST /mcp resources/read public contract";

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "public-resources-read-smoke",
        method: "resources/read",
        params: {
          uri: resource.uri,
        },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    if (json?.jsonrpc !== "2.0" || json?.id !== "public-resources-read-smoke") {
      fail(name, "expected a JSON-RPC 2.0 response with the request id");
      return;
    }

    if (json?.error) {
      fail(name, `unexpected JSON-RPC error: ${safeJsonRpcError(json.error)}`);
      return;
    }

    const contents = json?.result?.contents;

    if (!Array.isArray(contents)) {
      fail(name, "expected result.contents array");
      return;
    }

    const content = contents.find((item) => item?.uri === resource.uri);

    if (
      !content ||
      content.mimeType !== "application/json" ||
      typeof content.text !== "string"
    ) {
      fail(name, "expected matching JSON resource content");
      return;
    }

    const publicContract = parseJsonText(content.text);

    if (!isPublicMcpResourceContract(publicContract, resource.uri)) {
      fail(
        name,
        "public MCP resource content should include safe manifest identity, runtime, permissions, and schemas",
      );
      return;
    }

    if (findPublicMcpInternalField(publicContract)) {
      fail(name, "public MCP resources/read must not expose project or operator fields");
      return;
    }

    if (hasUnsafeMcpPublicResourceFields(publicContract)) {
      fail(
        name,
        "public MCP resources/read must not expose secret handles, embedded URL credentials, or local command details",
      );
      return;
    }

    const leaks = findBoundarySensitiveLeaks(`${text}\n${content.text}`);

    if (leaks.length > 0) {
      fail(name, `possible sensitive MCP resource-read leak: ${leaks[0]}`);
      return;
    }

    pass(
      name,
      `${publicContract.name}@${publicContract.version}, runtime=${publicContract.runtime.type}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkPublicPublisherProfileApi({ apiUrl, timeoutMs }) {
  const slug = smokeContext.publicPublisherSlug;
  const name = "GET /v1/publishers/:slug";

  if (!slug) {
    skip(
      name,
      "no public publisher returned by /v1/publishers; API smoke reports whether that is expected",
    );
    return;
  }

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, `/v1/publishers/${encodeURIComponent(slug)}`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200 for ${slug}, got ${status}`);
      return;
    }

    const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
      text.includes(marker),
    );

    if (mojibakeMarkers.length > 0) {
      fail(
        name,
        `possible mojibake markers in publisher profile: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
      );
      return;
    }

    const publisher = json?.publisher;
    const metrics = publisher?.metrics;
    const requiredFields = [
      ["publisher.slug", typeof publisher?.slug === "string"],
      ["publisher.displayName", typeof publisher?.displayName === "string"],
      ["publisher.trustLevel", typeof publisher?.trustLevel === "string"],
      ["publisher.payoutStatus", typeof publisher?.payoutStatus === "string"],
      ["publisher.skills", Array.isArray(publisher?.skills)],
      [
        "publisher.metrics.publicSkillCount",
        isFiniteNumber(metrics?.publicSkillCount),
      ],
      [
        "publisher.metrics.verifiedSkillCount",
        isFiniteNumber(metrics?.verifiedSkillCount),
      ],
      ["publisher.metrics.installCount", isFiniteNumber(metrics?.installCount)],
      ["publisher.metrics.callCount", isFiniteNumber(metrics?.callCount)],
    ];
    const missing = requiredFields
      .filter(([, isValid]) => !isValid)
      .map(([field]) => field);

    if (missing.length > 0) {
      fail(
        name,
        `publisher profile is missing required public fields: ${missing.join(", ")}`,
      );
      return;
    }

    if (publisher.slug !== slug) {
      fail(
        name,
        `publisher slug ${publisher.slug} did not match directory slug ${slug}`,
      );
      return;
    }

    if (publisher.skills.length === 0) {
      fail(name, "publisher profile should include at least one public skill");
      return;
    }

    if (!assertNoPublicPublisherSensitiveBoundary(name, json, text)) {
      return;
    }

    pass(
      name,
      `${publisher.slug}, skills=${publisher.skills.length}, trust=${publisher.trustLevel}`,
    );
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkLaunchReadiness({ apiUrl, timeoutMs, token }) {
  const name = "GET /v1/admin/launch-readiness";
  const headers = token ? { Authorization: "Bearer <redacted>" } : undefined;

  try {
    const response = await requestJson(
      joinUrl(apiUrl, "/v1/admin/launch-readiness"),
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        timeoutMs,
      },
    );

    if (!token) {
      if (response.status === 401 || response.status === 403) {
        skip(
          name,
          "protected as expected; set SKILLHUB_SMOKE_TOKEN or SKILLHUB_USER_TOKEN for the readiness body check",
        );
        return;
      }

      fail(
        name,
        `expected protected response without a token, got HTTP ${response.status}`,
      );
      return;
    }

    if (response.status !== 200) {
      fail(name, `expected HTTP 200 with token, got ${response.status}`);
      return;
    }

    const readiness = response.json?.readiness;
    const summary = readiness?.summary;
    const contract = validateLaunchReadinessContract(readiness);

    if (contract.errors.length > 0) {
      fail(name, `launch readiness contract drift: ${contract.errors[0]}`);
      return;
    }

    const leaks = findSensitiveLeaks(response.text);

    if (leaks.length > 0) {
      fail(name, `possible sensitive launch-readiness leak: ${leaks[0]}`);
      return;
    }

    pass(
      name,
      `status=${summary.status}, blockers=${summary.blocker}, warnings=${summary.warning}, sections=${contract.sectionCount}, items=${contract.itemCount}`,
    );
  } catch (error) {
    fail(
      name,
      `${redactSecrets(error.message)}${headers ? " (authorization header was redacted)" : ""}`,
    );
  }
}

async function checkAppPages({ appUrl, appPaths, timeoutMs }) {
  for (const path of appPaths) {
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

      if (mojibakeMarkers.length > 0) {
        fail(
          name,
          `possible mojibake markers in HTML: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
        );
        continue;
      }

      if (!html.includes("<html") && !html.includes("<!doctype html")) {
        fail(name, "expected an HTML document");
        continue;
      }

      const expectedContent =
        PAGE_ASSERTIONS[path] ??
        (isZhAppPath(path) ? [] : PAGE_ASSERTIONS[basePathFromAppPath(path)]) ??
        [];
      const missingContent = expectedContent.filter(
        (token) => !html.includes(token.toLowerCase()),
      );

      if (missingContent.length > 0) {
        fail(name, `missing P0 page markers: ${missingContent.join(", ")}`);
        continue;
      }

      pass(name, `html bytes=${Buffer.byteLength(response.text, "utf8")}`);
    } catch (error) {
      fail(name, error.message);
    }
  }

  await checkPublicSkillDetailPage({ appUrl, timeoutMs });
  await checkPublicPublisherProfilePage({ appUrl, timeoutMs });
}

async function checkProductionAppAliases({
  appAliasUrls,
  appUrl,
  timeoutMs,
}) {
  if (!appAliasUrls || appAliasUrls.length === 0) {
    return;
  }

  const allowedHosts = new Set([
    hostnameForUrl(appUrl),
    ...appAliasUrls.map(hostnameForUrl),
  ]);

  for (const aliasUrl of appAliasUrls) {
    for (const path of PROD_APP_ALIAS_PATHS) {
      const name = `GET ${PROD_APP_ALIAS_GATE} ${aliasUrl}${path}`;

      try {
        const response = await requestText(joinUrl(aliasUrl, path), {
          timeoutMs,
        });

        if (response.status !== 200) {
          fail(name, `expected HTTP 200, got ${response.status}`);
          continue;
        }

        const finalHost = hostnameForUrl(response.url);

        if (!allowedHosts.has(finalHost)) {
          fail(
            name,
            `alias resolved outside expected SkillHub hosts: ${finalHost}`,
          );
          continue;
        }

        const html = response.text.toLowerCase();
        const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
          response.text.includes(marker),
        );

        if (mojibakeMarkers.length > 0) {
          fail(
            name,
            `possible mojibake markers in alias HTML: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
          );
          continue;
        }

        if (!html.includes("<html") && !html.includes("<!doctype html")) {
          fail(name, "expected an HTML document");
          continue;
        }

        const expectedContent =
          PAGE_ASSERTIONS[path] ??
          (isZhAppPath(path) ? [] : PAGE_ASSERTIONS[basePathFromAppPath(path)]) ??
          [];
        const missingContent = expectedContent.filter(
          (token) => !html.includes(token.toLowerCase()),
        );

        if (missingContent.length > 0) {
          fail(
            name,
            `alias page missing P0 markers: ${missingContent.join(", ")}`,
          );
          continue;
        }

        pass(
          name,
          `finalHost=${finalHost}, html bytes=${Buffer.byteLength(response.text, "utf8")}`,
        );
      } catch (error) {
        fail(name, error.message);
      }
    }
  }
}

async function checkPublicSkillDetailPage({ appUrl, timeoutMs }) {
  const slug = smokeContext.publicSkillSlug;
  const name = "GET app public skill detail";

  if (!slug) {
    skip(
      name,
      "no public skill returned by /v1/skills/search; API smoke reports whether that is expected",
    );
    return;
  }

  const paths = [
    `/skills/${encodeURIComponent(slug)}`,
    `/skills/${encodeURIComponent(slug)}?lang=zh`,
  ];

  for (const path of paths) {
    try {
      const response = await requestText(joinUrl(appUrl, path), { timeoutMs });

      if (response.status !== 200) {
        fail(name, `expected HTTP 200 for ${path}, got ${response.status}`);
        continue;
      }

      const html = response.text.toLowerCase();
      const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
        response.text.includes(marker),
      );

      if (mojibakeMarkers.length > 0) {
        fail(
          name,
          `possible mojibake markers in ${path}: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
        );
        continue;
      }

      if (!html.includes(slug.toLowerCase())) {
        fail(name, `expected skill detail HTML to include slug ${slug}`);
        continue;
      }

      const expectedMarkers = isZhAppPath(path)
        ? SKILL_DETAIL_ASSERTIONS.zh
        : SKILL_DETAIL_ASSERTIONS.en;
      const missingMarkers = expectedMarkers.filter(
        (token) => !html.includes(token.toLowerCase()),
      );

      if (missingMarkers.length > 0) {
        fail(
          name,
          `missing skill detail P0 controls in ${path}: ${missingMarkers.join(", ")}`,
        );
        continue;
      }

      pass(
        name,
        `${path} html bytes=${Buffer.byteLength(response.text, "utf8")}`,
      );
    } catch (error) {
      fail(name, error.message);
    }
  }
}

async function checkPublicPublisherProfilePage({ appUrl, timeoutMs }) {
  const slug = smokeContext.publicPublisherSlug;
  const name = "GET app public publisher profile";

  if (!slug) {
    skip(
      name,
      "no public publisher returned by /v1/publishers; API smoke reports whether that is expected",
    );
    return;
  }

  const paths = [
    `/publishers/${encodeURIComponent(slug)}`,
    `/publishers/${encodeURIComponent(slug)}?lang=zh`,
  ];

  for (const path of paths) {
    try {
      const response = await requestText(joinUrl(appUrl, path), { timeoutMs });

      if (response.status !== 200) {
        fail(name, `expected HTTP 200 for ${path}, got ${response.status}`);
        continue;
      }

      const html = response.text.toLowerCase();
      const mojibakeMarkers = MOJIBAKE_MARKERS.filter((marker) =>
        response.text.includes(marker),
      );

      if (mojibakeMarkers.length > 0) {
        fail(
          name,
          `possible mojibake markers in ${path}: ${mojibakeMarkers.map(formatMarkerCodepoints).join(", ")}`,
        );
        continue;
      }

      if (!html.includes("publisher") && !html.includes("\u53D1\u5E03\u8005")) {
        fail(name, `expected publisher profile HTML markers for ${path}`);
        continue;
      }

      pass(
        name,
        `${path} html bytes=${Buffer.byteLength(response.text, "utf8")}`,
      );
    } catch (error) {
      fail(name, error.message);
    }
  }
}

async function checkSourceMojibake() {
  const name = "source mojibake guard";

  try {
    const files = [];

    for (const scanPath of SOURCE_MOJIBAKE_SCAN_PATHS) {
      await collectSourceTextFiles(scanPath, files);
    }

    if (files.length === 0) {
      fail(name, "no source files were found for mojibake scanning");
      return;
    }

    const hits = [];

    for (const file of files) {
      const text = await readFile(file, "utf8");
      const markers = SOURCE_MOJIBAKE_MARKERS.filter((marker) =>
        text.includes(marker),
      );

      if (markers.length > 0) {
        hits.push(
          `${toDisplayPath(file)} (${markers.map(formatMarkerCodepoints).join(", ")})`,
        );
      }
    }

    if (hits.length > 0) {
      fail(
        name,
        `possible mojibake markers in source: ${hits.slice(0, 5).join("; ")}`,
      );
      return;
    }

    pass(name, `files=${files.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function collectSourceTextFiles(scanPath, files) {
  const entries = await readdir(scanPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(scanPath, entry.name);

    if (entry.isDirectory()) {
      if (!SOURCE_MOJIBAKE_IGNORED_DIRECTORIES.has(entry.name)) {
        await collectSourceTextFiles(fullPath, files);
      }
      continue;
    }

    if (
      entry.isFile() &&
      SOURCE_MOJIBAKE_EXTENSIONS.has(path.extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }
}

async function checkReleaseCommandGate() {
  const name = "release command P0 gate guard";

  try {
    const failures = [];

    for (const guard of RELEASE_COMMAND_GUARDS) {
      const text = await readFile(guard.file, "utf8");

      for (const required of guard.required) {
        if (!text.includes(required)) {
          failures.push(`${guard.file} missing ${JSON.stringify(required)}`);
        }
      }

      for (const forbidden of guard.forbidden) {
        if (text.includes(forbidden)) {
          failures.push(`${guard.file} still contains ${JSON.stringify(forbidden)}`);
        }
      }
    }

    if (failures.length > 0) {
      fail(name, failures.slice(0, 5).join("; "));
      return;
    }

    pass(name, `guardedFiles=${RELEASE_COMMAND_GUARDS.length}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function requestJson(url, { body, headers, method, timeoutMs }) {
  const response = await request(url, { body, headers, method, timeoutMs });
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

async function requestText(url, { body, headers, method, timeoutMs }) {
  const response = await request(url, { body, headers, method, timeoutMs });

  return {
    status: response.status,
    text: await response.text(),
    url: response.url,
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

function joinUrl(base, path) {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const parsed = new URL(base);

  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }

  return new URL(normalizedPath, parsed).toString();
}

function basePathFromAppPath(path) {
  return path.split("?")[0];
}

function isZhAppPath(path) {
  return path.includes("lang=zh");
}

function hostnameForUrl(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function toDisplayPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/");
}

function parseArgs(argv) {
  const parsed = {
    appAliasUrls: undefined,
    appPaths: undefined,
    appUrl: undefined,
    apiUrl: undefined,
    help: false,
    skipApi: false,
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

    if (arg === "--skip-api") {
      parsed.skipApi = true;
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

    if (arg === "--app-paths") {
      parsed.appPaths = nextValue();
      continue;
    }

    if (arg === "--app-alias-urls") {
      parsed.appAliasUrls = nextValue();
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

function parseAppPaths(value) {
  if (!value) {
    return DEFAULT_APP_PATHS;
  }

  const paths = value
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path) => (path.startsWith("/") ? path : `/${path}`));

  return paths.length > 0 ? paths : DEFAULT_APP_PATHS;
}

function parseAppAliasUrls(value, appUrl) {
  if (value) {
    const normalized = value.trim().toLowerCase();

    if (["0", "false", "none", "off", "skip"].includes(normalized)) {
      return [];
    }

    return value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return isPrimaryProductionAppUrl(appUrl) ? DEFAULT_PROD_APP_ALIAS_URLS : [];
}

function isPrimaryProductionApiUrl(value) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.toLowerCase() === new URL(PRIMARY_PROD_API_URL).hostname
    );
  } catch {
    return false;
  }
}

function isPrimaryProductionAppUrl(value) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.toLowerCase() === new URL(PRIMARY_PROD_APP_URL).hostname
    );
  } catch {
    return false;
  }
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableFiniteNumber(value) {
  return value === null || isFiniteNumber(value);
}

function isObjectRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function findBoundarySensitiveLeaks(text) {
  return findSensitiveLeaks(
    text
      .replace(/Bearer\s+token/gi, "Bearer <missing token>")
      .replace(
        /"code"\s*:\s*"[a-z]+(?:_[a-z0-9]+)+"/gi,
        '"code":"[redacted-public-error-code]"',
      ),
  );
}

function assertNoPublicPublisherSensitiveBoundary(name, payload, text) {
  const leaks = findBoundarySensitiveLeaks(text);

  if (leaks.length > 0) {
    fail(name, `possible sensitive public publisher leak: ${leaks[0]}`);
    return false;
  }

  const forbiddenPath = findPublicPublisherForbiddenField(payload);

  if (forbiddenPath) {
    fail(
      name,
      `public publisher payload must not expose private publisher/operator fields: ${forbiddenPath}`,
    );
    return false;
  }

  return true;
}

function assertNoPublicSkillFeedbackSensitiveBoundary(name, payload, text) {
  const leaks = findBoundarySensitiveLeaks(text);

  if (leaks.length > 0) {
    fail(name, `possible sensitive public feedback leak: ${leaks[0]}`);
    return false;
  }

  const forbiddenPath = findForbiddenPublicField(
    payload,
    PUBLIC_SKILL_FEEDBACK_FORBIDDEN_FIELD_NAMES,
  );

  if (forbiddenPath) {
    fail(
      name,
      `public feedback payload must not expose reviewer, project, moderation, operator, or credential fields: ${forbiddenPath}`,
    );
    return false;
  }

  return true;
}

function assertNoPublicSkillPriceSensitiveBoundary(name, payload, text) {
  const leaks = findBoundarySensitiveLeaks(text);

  if (leaks.length > 0) {
    fail(name, `possible sensitive public price leak: ${leaks[0]}`);
    return false;
  }

  const forbiddenPath = findForbiddenPublicField(
    payload,
    PUBLIC_SKILL_PRICE_FORBIDDEN_FIELD_NAMES,
  );

  if (forbiddenPath) {
    fail(
      name,
      `public price payload must not expose provider, project, ledger, commission, payout, or credential fields: ${forbiddenPath}`,
    );
    return false;
  }

  return true;
}

function findForbiddenPublicField(value, forbiddenNames, path = []) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const childPath = findForbiddenPublicField(value[index], forbiddenNames, [
        ...path,
        String(index),
      ]);

      if (childPath) {
        return childPath;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    if (
      typeof value === "string" &&
      hasEmbeddedCredentialsInPublicPublisherString(value)
    ) {
      return `${path.join(".") || "value"} contains embedded URL credentials`;
    }

    return null;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    const normalizedKey = key.toLowerCase();

    if (forbiddenNames.has(normalizedKey)) {
      return nextPath.join(".");
    }

    const childPath = findForbiddenPublicField(
      child,
      forbiddenNames,
      nextPath,
    );

    if (childPath) {
      return childPath;
    }
  }

  return null;
}

function findPublicPublisherForbiddenField(value, path = []) {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const childPath = findPublicPublisherForbiddenField(value[index], [
        ...path,
        String(index),
      ]);

      if (childPath) {
        return childPath;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    if (
      typeof value === "string" &&
      hasEmbeddedCredentialsInPublicPublisherString(value)
    ) {
      return `${path.join(".") || "value"} contains embedded URL credentials`;
    }

    return null;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPath = [...path, key];
    const normalizedKey = key.toLowerCase();

    if (PUBLIC_PUBLISHER_FORBIDDEN_FIELD_NAMES.has(normalizedKey)) {
      return nextPath.join(".");
    }

    const childPath = findPublicPublisherForbiddenField(child, nextPath);

    if (childPath) {
      return childPath;
    }
  }

  return null;
}

function hasEmbeddedCredentialsInPublicPublisherString(value) {
  const text = String(value ?? "").trim();

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    return false;
  }

  return hasEmbeddedUrlCredentials(text);
}

function findPublicMcpInternalField(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const toolForbiddenFields = new Set([
    "boost",
    "curation",
    "operatorNotes",
    "operatorReason",
    "projectSlug",
  ]);
  const annotationForbiddenFields = new Set([
    "approvalState",
    "boost",
    "callable",
    "curation",
    "installStatus",
    "maxPermissionLevel",
    "operatorNotes",
    "operatorReason",
    "projectSlug",
  ]);

  const toolHasInternalField = Object.keys(value).some((key) =>
    toolForbiddenFields.has(key),
  );

  if (toolHasInternalField) {
    return true;
  }

  const annotations = value.annotations;

  return (
    annotations !== null &&
    typeof annotations === "object" &&
    !Array.isArray(annotations) &&
    Object.keys(annotations).some((key) => annotationForbiddenFields.has(key))
  );
}

function parseJsonText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isPublicMcpResourceContract(value, uri) {
  if (!isObjectRecord(value)) {
    return false;
  }

  const slug = String(uri).replace("skillhub://skills/", "");
  const runtime = value.runtime;
  const permissions = value.permissions;
  const runtimeShapeValid =
    isObjectRecord(runtime) &&
    (runtime.type === "http"
      ? typeof runtime.entrypoint === "string"
      : runtime.type === "mcp"
        ? typeof runtime.serverUrl === "string"
        : runtime.type === "local" && typeof runtime.command === "string");

  return (
    value.schemaVersion === "0.1" &&
    value.name === slug &&
    typeof value.displayName === "string" &&
    typeof value.version === "string" &&
    typeof value.description === "string" &&
    Array.isArray(value.tags) &&
    runtimeShapeValid &&
    ["low", "medium", "high"].includes(value.permissionLevel) &&
    isObjectRecord(permissions) &&
    typeof permissions.network === "boolean" &&
    typeof permissions.browser === "boolean" &&
    ["none", "read", "write"].includes(permissions.filesystem) &&
    isFiniteNumber(permissions.secretCount) &&
    !Object.hasOwn(permissions, "secrets") &&
    isObjectRecord(value.inputSchema) &&
    isObjectRecord(value.outputSchema)
  );
}

function hasUnsafeMcpPublicResourceFields(value) {
  if (!isObjectRecord(value)) {
    return true;
  }

  const runtime = value.runtime;
  const permissions = value.permissions;

  if (isObjectRecord(permissions) && Object.hasOwn(permissions, "secrets")) {
    return true;
  }

  if (!isObjectRecord(runtime)) {
    return true;
  }

  if (runtime.type === "http") {
    return hasEmbeddedUrlCredentials(runtime.entrypoint);
  }

  if (runtime.type === "mcp") {
    return hasEmbeddedUrlCredentials(runtime.serverUrl);
  }

  return (
    runtime.type === "local" &&
    (runtime.command !== "[restricted local runtime]" ||
      (Array.isArray(runtime.args) &&
        runtime.args.some((arg) => !String(arg).includes("redacted"))))
  );
}

function assertNoPublicSkillManifestSensitiveBoundary(name, payload, text) {
  const leaks = findBoundarySensitiveLeaks(text);

  if (leaks.length > 0) {
    fail(name, `possible sensitive public skill manifest leak: ${leaks[0]}`);
    return false;
  }

  if (findPublicSkillManifestInternalField(payload)) {
    fail(
      name,
      "public skill manifest must not expose project, operator, curation, invocation, billing, payout, or audit fields",
    );
    return false;
  }

  if (hasUnsafePublicSkillManifestFields(payload)) {
    fail(
      name,
      "public skill manifest must sanitize runtime targets, local command details, author URLs, and secret handles",
    );
    return false;
  }

  return true;
}

function findPublicSkillManifestInternalField(value) {
  if (!isObjectRecord(value)) {
    return false;
  }

  const forbiddenTopLevelFields = new Set([
    "auditLogs",
    "billing",
    "billingState",
    "boost",
    "curation",
    "invocation",
    "invocations",
    "operatorNotes",
    "operatorReason",
    "payout",
    "payoutState",
    "project",
    "projectSlug",
    "reviewEvidence",
    "usage",
    "usageEvents",
  ]);

  return Object.keys(value).some((key) => forbiddenTopLevelFields.has(key));
}

function hasUnsafePublicSkillManifestFields(value) {
  if (!isObjectRecord(value)) {
    return true;
  }

  const runtime = value.runtime;
  const permissions = value.permissions;
  const author = value.author;

  if (!isObjectRecord(runtime) || !isObjectRecord(permissions)) {
    return true;
  }

  if (!["http", "mcp", "local"].includes(runtime.type)) {
    return true;
  }

  if (
    isObjectRecord(author) &&
    typeof author.url === "string" &&
    hasEmbeddedUrlCredentials(author.url)
  ) {
    return true;
  }

  if (runtime.type === "http" && hasEmbeddedUrlCredentials(runtime.entrypoint)) {
    return true;
  }

  if (runtime.type === "mcp" && hasEmbeddedUrlCredentials(runtime.serverUrl)) {
    return true;
  }

  if (
    runtime.type === "local" &&
    (runtime.command !== "[restricted local runtime]" ||
      (Array.isArray(runtime.args) &&
        runtime.args.some((arg) => !String(arg).includes("redacted"))))
  ) {
    return true;
  }

  return (
    Array.isArray(permissions.secrets) &&
    permissions.secrets.some((secret) => !isPublicSecretHandlePlaceholder(secret))
  );
}

function isPublicSecretHandlePlaceholder(value) {
  return /^\[\d+ secret handles? required\]$/.test(String(value));
}

function hasEmbeddedUrlCredentials(value) {
  if (value === "[invalid runtime URL]") {
    return false;
  }

  try {
    const url = new URL(String(value ?? ""));
    return Boolean(url.username || url.password);
  } catch {
    return true;
  }
}

function safeJsonRpcError(error) {
  if (!error || typeof error !== "object") {
    return redactSecrets(String(error));
  }

  return redactSecrets(
    `${error.code ?? "unknown"} ${error.message ?? "unknown error"}`,
  );
}

function inferPublicSkillCategory(tags) {
  const normalized = Array.isArray(tags)
    ? tags.map((tag) => String(tag).toLowerCase())
    : [];

  if (
    normalized.some((tag) => ["research", "browser", "citations"].includes(tag))
  ) {
    return "research";
  }

  if (normalized.some((tag) => ["crm", "sales", "revenue"].includes(tag))) {
    return "sales";
  }

  if (
    normalized.some((tag) =>
      ["support", "ticket", "classification"].includes(tag),
    )
  ) {
    return "support";
  }

  if (normalized.some((tag) => ["data", "analysis", "summary"].includes(tag))) {
    return "data";
  }

  if (
    normalized.some((tag) =>
      ["security", "trust", "review", "schema"].includes(tag),
    )
  ) {
    return "security";
  }

  return "ops";
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
Usage: node scripts/qa-smoke.mjs [options]

Options:
  --api-url <url>      API base URL. Default: env or ${DEFAULT_API_URL}
  --app-url <url>      App base URL. Default: env or ${DEFAULT_APP_URL}
  --app-alias-urls <urls>
                       Comma-separated production web aliases to verify when
                       using the main app URL. Use "none" to disable.
                       Default for ${PRIMARY_PROD_APP_URL}: ${DEFAULT_PROD_APP_ALIAS_URLS.join(",")}
  --app-paths <paths>  Comma-separated app paths. Default: ${DEFAULT_APP_PATHS.join(",")}
  --timeout-ms <ms>    Per-request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-api           Skip API checks.
  --skip-app           Skip app page checks.
  --help               Show this help.

Admin readiness:
  Set SKILLHUB_SMOKE_TOKEN or SKILLHUB_USER_TOKEN with a support/admin/super_admin token
  to validate the /v1/admin/launch-readiness response body. Without a token, this smoke
  check verifies that the endpoint is protected.
`);
}
