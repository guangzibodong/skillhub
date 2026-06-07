#!/usr/bin/env node

import path from "node:path";
import { readdir, readFile } from "node:fs/promises";

import { validateLaunchReadinessContract } from "./qa-launch-readiness-contract.mjs";
import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
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
    "after login",
    "no shared backend password",
    "/developer?lang=en",
    "/publisher?lang=en",
    "/admin?lang=en",
  ],
  "/login?lang=zh": [
    "\u8d26\u53f7\u5165\u53e3",
    "\u6ca1\u6709\u5171\u4eab\u540e\u53f0\u5bc6\u7801",
    "\u767b\u5f55\u540e\u53bb\u54ea\u91cc",
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
];
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
];
const PUBLIC_P0_PROD_GATE =
  "pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000";
const PROTECTED_P0_PROD_GATE =
  "pnpm smoke:p0 -- --prod --timeout-ms 30000";
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
      "SKILLHUB_P0_ADMIN_TOKEN",
      "Do not run mutating P0 smokes against production during a routine update.",
    ],
  },
  {
    file: "docs/1panel-deploy.md",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
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
      "routine 1Panel updates",
      "performs no\nwrites and does not require an operator token",
    ],
  },
  {
    file: "docs/api.md",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
      "routine 1Panel updates",
      "protected Journey C",
      "Mutating journey checks are opt-in",
    ],
  },
  {
    file: "scripts/qa-p0-release-suite.mjs",
    forbidden: [],
    required: [
      PUBLIC_P0_PROD_GATE,
      PROTECTED_P0_PROD_GATE,
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

const config = {
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
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
  console.log(`App paths: ${config.appPaths.join(", ")}`);
}
console.log("");

await checkSourceMojibake();
await checkReleaseCommandGate();

if (!config.skipApi) {
  await checkStats(config);
  await checkAuthProviders(config);
  await checkAdminProtection(config);
  await checkPublicSkillSearch(config);
  await checkPublicSkillCategorySearch(config);
  await checkPublicSkillDetailApi(config);
  await checkPublicPublishers(config);
  await checkPublicPublisherProfileApi(config);
  await checkLaunchReadiness(config);
}

if (!config.skipApp) {
  await checkAppPages(config);
}

printSummary(results);

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
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
    "/v1/admin/reviews",
    "/v1/admin/finance/ledger",
    "/v1/admin/payouts",
    "/v1/admin/notifications",
    "/v1/admin/notification-deliveries",
    "/v1/admin/webhook-deliveries",
    "/v1/admin/identity-directory",
    "/v1/admin/audit-logs",
    "/v1/admin/marketplace-curation",
  ];

  for (const path of paths) {
    const name = `GET ${path} without token`;

    try {
      const { status } = await requestJson(joinUrl(apiUrl, path), {
        timeoutMs,
      });

      if (![401, 403].includes(status)) {
        fail(name, `expected HTTP 401/403, got ${status}`);
        continue;
      }

      pass(name, "protected by role-aware authorization");
    } catch (error) {
      fail(name, redactSecrets(error.message));
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
    const { status, json } = await requestJson(
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

    pass(name, `${json.name}@${json.version}, runtime=${json.runtime.type}`);
  } catch (error) {
    fail(name, error.message);
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

async function requestJson(url, { headers, timeoutMs }) {
  const response = await request(url, { headers, timeoutMs });
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

async function requestText(url, { headers, timeoutMs }) {
  const response = await request(url, { headers, timeoutMs });

  return {
    status: response.status,
    text: await response.text(),
  };
}

async function request(url, { headers = {}, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
        ...headers,
      },
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

function toDisplayPath(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll(path.sep, "/");
}

function parseArgs(argv) {
  const parsed = {
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

function isObjectRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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
