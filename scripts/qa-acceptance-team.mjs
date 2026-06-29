#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const require = createRequire(new URL("../apps/gateway/package.json", import.meta.url));
const DEFAULT_API_URL = "https://api.useskillhub.com";
const DEFAULT_APP_URL = "https://useskillhub.com";
const DEFAULT_CREDENTIALS_PATH = "/root/skillhub-acceptance-team.json";
const DEFAULT_OUTPUT = "output/acceptance-team-qa-report.json";
const DEFAULT_TIMEOUT_MS = 30000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const PUBLIC_SKILL_SLUG_PLACEHOLDER = "{publicSkillSlug}";
const FALLBACK_PUBLIC_SKILL_SLUGS = [
  "browser-research-pro",
  "crm-enrichment",
  "support-triage",
  "dataset-insight",
  "codebase-risk-scanner",
  "invoice-extraction"
];
let publicSkillSlugPromise;
let qaSqlPromise;

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
        requiredHtml: ["dashboard"],
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
        required: ["发布者", "发布"],
        forbidden: ["需要先登录", "需要发布者角色", "sign-in required", "publisher role required"]
      },
      {
        path: "/publisher?lang=zh",
        required: ["发布者", "付费"],
        forbidden: ["需要先登录", "需要发布者角色", "sign-in required", "publisher role required"]
      },
      {
        path: "/terms?lang=zh",
        required: ["条款", "预览"],
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
        required: ["上线就绪", "审核", "审计"],
        requiredHtml: ["operator-admin-live", "launch-readiness"],
        forbidden: ["需要先登录", "需要管理员角色", "sign-in required", "admin role required"]
      },
      {
        path: "/dashboard?lang=zh",
        requiredHtml: ["dashboard"],
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

const PUBLIC_FLOW_PAGES = [
  "/?lang=zh",
  "/marketplace?lang=zh",
  `/skills/${PUBLIC_SKILL_SLUG_PLACEHOLDER}?lang=zh`,
  "/publishers?lang=zh",
  "/publishers/skillhub?lang=zh",
  "/docs?lang=zh"
];

const ROLE_BOUNDARY_CHECKS = [
  { allowedRole: "admin", deniedRole: "developer", method: "GET", path: "/v1/admin/launch-readiness" },
  { allowedRole: "admin", deniedRole: "publisher", method: "GET", path: "/v1/admin/finance/ledger" },
  { allowedRole: "publisher", deniedRole: "developer", method: "GET", path: "/v1/publisher/payouts" },
  { allowedRole: "developer", deniedRole: "publisher", method: "GET", path: "/v1/developer/projects" }
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
  allowNonLocalDb:
    args.allowNonLocalDb ||
    parseBoolean(process.env.SKILLHUB_ACCEPTANCE_QA_ALLOW_NON_LOCAL_DB),
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
  databaseUrl:
    args.databaseUrl ??
    process.env.SKILLHUB_ACCEPTANCE_QA_DATABASE_URL ??
    process.env.DATABASE_URL ??
    (await loadEnv(resolve(".env"))).DATABASE_URL,
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
  await checkPublicFlow(credentials);

  const sessions = {};
  for (const spec of Object.values(ROLE_SPECS)) {
    sessions[spec.accountKey] = await checkRole(spec, credentials);
  }

  await checkFullRoleFlow(credentials, sessions);

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

  assertReportSecretSafe(report);
  await writeReport(config.output, report);
  printSummary(report);
  await closeQaSql();

  if (shouldFail(report.issueSummary, config.failOn)) {
    process.exitCode = 1;
  }
} catch (error) {
  await closeQaSql().catch(() => {});
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
    return null;
  }

  const token = await resolveFreshToken(account, spec.accountKey);

  if (!token) {
    return null;
  }

  const subject = await checkSubject(spec, token);

  if (!subject) {
    return null;
  }

  await checkProtectedApis(spec, token);
  await checkPages(spec, token);

  return { subject, token };
}

async function checkPublicFlow(credentials) {
  for (const pagePath of PUBLIC_FLOW_PAGES) {
    const publicSkillSlug = pagePath.includes(PUBLIC_SKILL_SLUG_PLACEHOLDER) ? await resolvePublicSkillSlug("public") : null;
    const resolvedPath = publicSkillSlug ? pagePath.replace(PUBLIC_SKILL_SLUG_PLACEHOLDER, publicSkillSlug) : pagePath;

    if (!resolvedPath || resolvedPath.includes(PUBLIC_SKILL_SLUG_PLACEHOLDER)) {
      continue;
    }

    const response = await requestText(joinUrl(config.appUrl, cacheBustedPath(resolvedPath, "public")), {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      },
      method: "GET"
    });

    assertNoLeaks("public", "page", resolvedPath, response.text);
    assertNoCredentialMarkers("public", resolvedPath, response.text, credentials);

    if (response.status !== 200) {
      addIssue({
        category: "public-flow",
        message: `${resolvedPath} returned HTTP ${response.status} for anonymous public access.`,
        role: "public",
        severity: "P0",
        url: joinUrl(config.appUrl, resolvedPath)
      });
      continue;
    }

    const html = decodeHtml(response.text).toLowerCase();
    const adminOnlyMarkers = [
      "operator-admin-live",
      "skillhub_user_token=",
      "admin_audit_logs",
      "shub_user_"
    ].filter((marker) => html.includes(marker));

    if (adminOnlyMarkers.length > 0) {
      addIssue({
        category: "public-flow",
        message: `${resolvedPath} exposes private or admin-only markers: ${adminOnlyMarkers.join(", ")}.`,
        role: "public",
        severity: "P0",
        url: joinUrl(config.appUrl, resolvedPath)
      });
      continue;
    }

    addResult("public", "page", resolvedPath, "pass", `Anonymous public page returned HTTP ${response.status}.`);
  }
}

async function checkFullRoleFlow(credentials, sessions) {
  const adminToken = sessions.admin?.token;
  const developerToken = sessions.developer?.token;
  const publisherPlan = choosePublisherSkill(credentials);

  if (!adminToken || !developerToken || !publisherPlan) {
    addIssue({
      category: "workflow",
      message: "Full role-flow QA requires admin, developer, and publisher acceptance credentials.",
      role: "all",
      severity: "P0"
    });
    return;
  }

  const publisherToken = await resolveFreshToken(credentials.accounts[publisherPlan.accountKey], publisherPlan.accountKey);
  const developer2Token = credentials.accounts.developer2
    ? await resolveFreshToken(credentials.accounts.developer2, "developer2")
    : null;

  if (!publisherToken) {
    return;
  }

  const flowSkill = await createSubmittedPublisherFlowSkill(publisherToken, credentials.runId, publisherPlan.accountKey);
  const skillSlug = flowSkill?.slug ?? publisherPlan.slug;

  await checkRoleBoundaries({
    admin: adminToken,
    developer: developerToken,
    publisher: publisherToken
  });

  const approvedSkill = await ensureSkillApproved(adminToken, skillSlug);
  if (!approvedSkill) {
    return;
  }

  const publisherState = await checkPublisherWorkflow({
    adminToken,
    publisherToken,
    runId: credentials.runId,
    skillSlug
  });

  const developerState = await checkDeveloperWorkflow({
    adminToken,
    developer2Token,
    developerToken,
    runId: credentials.runId,
    skillSlug
  });

  if (publisherState?.publisherProfileId && developerState?.billableInvocation) {
    await checkFinancePayoutWorkflow({
      adminToken,
      publisherProfileId: publisherState.publisherProfileId,
      publisherToken,
      runId: credentials.runId
    });
  }

  await checkAdminWorkflow(adminToken);
}

function choosePublisherSkill(credentials) {
  const preferredKeys = ["publisher2", "publisher", "publisher3"];

  for (const accountKey of preferredKeys) {
    const skill = credentials?.publishedSkills?.[accountKey];

    if (skill?.slug && credentials?.accounts?.[accountKey]) {
      return {
        accountKey,
        slug: skill.slug,
        version: skill.version ?? "1.0.0"
      };
    }
  }

  return null;
}

async function createSubmittedPublisherFlowSkill(publisherToken, runId, accountKey) {
  const manifest = buildFlowSkillManifest(runId, accountKey);
  const publishResponse = await apiRequest("publisher", "POST", "/v1/skills", publisherToken, {
    manifest
  });

  if (!expectStatus("publisher", "workflow", "/v1/skills", publishResponse, [201])) {
    return null;
  }

  const submitResponse = await apiRequest("publisher", "POST", `/v1/skills/${encodeURIComponent(manifest.name)}/submit`, publisherToken, {
    version: manifest.version
  });

  if (!expectStatus("publisher", "workflow", `/v1/skills/${manifest.name}/submit`, submitResponse, [201])) {
    return null;
  }

  addResult("publisher", "workflow", `/v1/skills/${manifest.name}/submit`, "pass", "Fresh publisher flow skill submitted for admin review.");
  return {
    slug: manifest.name,
    version: manifest.version
  };
}

function buildFlowSkillManifest(runId, accountKey) {
  const unique = Date.now().toString(36);
  const slug = normalizeQaSlug(`acceptance-flow-${runId ?? "local"}-${accountKey}-${unique}`).slice(0, 60).replace(/-+$/g, "");

  return {
    schemaVersion: "0.1",
    name: slug,
    displayName: "Acceptance Full Flow Skill",
    version: "1.0.0",
    description: "A local acceptance QA skill used to verify publisher review, developer install, runtime metering, and payout closure.",
    author: {
      name: "SkillHub Acceptance Publisher",
      url: "https://www.useskillhub.com"
    },
    tags: ["acceptance", "full-flow", "qa"],
    runtime: {
      type: "http",
      entrypoint: `https://api.useskillhub.com/acceptance/full-flow/${slug}`
    },
    permissions: {
      browser: false,
      filesystem: "none",
      network: true,
      secrets: []
    },
    inputSchema: {
      type: "object",
      required: ["task"],
      properties: {
        task: {
          minLength: 3,
          type: "string"
        }
      }
    },
    outputSchema: {
      type: "object",
      required: ["summary"],
      properties: {
        summary: {
          type: "string"
        }
      }
    }
  };
}

async function ensureSkillApproved(adminToken, skillSlug) {
  const detailResponse = await apiRequest("admin", "GET", `/v1/skills/${encodeURIComponent(skillSlug)}`, adminToken);
  const detailStatus =
    detailResponse.json?.skill?.verificationStatus ??
    detailResponse.json?.verificationStatus ??
    detailResponse.json?.metadata?.verificationStatus;

  if (detailResponse.status === 200 && detailStatus === "verified") {
    addResult("admin", "workflow", `/v1/skills/${skillSlug}`, "pass", "Publisher skill is already verified.");
    return { skillSlug, verificationStatus: "verified" };
  }

  const queueResponse = await apiRequest("admin", "GET", "/v1/admin/reviews", adminToken);
  if (!expectStatus("admin", "workflow", "/v1/admin/reviews", queueResponse, [200])) {
    return null;
  }

  const review = (queueResponse.json?.reviews ?? []).find((item) => item?.skillSlug === skillSlug);
  if (!review?.id) {
    if (detailResponse.status === 200) {
      addResult("admin", "workflow", `/v1/skills/${skillSlug}`, "pass", "Skill has no queued review; continuing with current registry state.");
      return { skillSlug, verificationStatus: detailStatus ?? "unknown" };
    }

    addIssue({
      category: "workflow",
      message: `No queued review was found for ${skillSlug}, and the skill is not verified.`,
      role: "admin",
      severity: "P0"
    });
    return null;
  }

  assertRuntimeChecks("admin", skillSlug, review.runtimeChecks);
  const decisionResponse = await apiRequest(
    "admin",
    "POST",
    `/v1/admin/reviews/${encodeURIComponent(review.id)}/decision`,
    adminToken,
    {
      notes: "Acceptance QA approval after runtime and manifest checks.",
      status: "approved"
    }
  );

  if (!expectStatus("admin", "workflow", `/v1/admin/reviews/${review.id}/decision`, decisionResponse, [200])) {
    return null;
  }

  addResult("admin", "workflow", `/v1/admin/reviews/${review.id}/decision`, "pass", `${skillSlug} approved by admin QA.`);
  return { reviewId: review.id, skillSlug, verificationStatus: "verified" };
}

async function checkPublisherWorkflow({ adminToken, publisherToken, runId, skillSlug }) {
  const profileResponse = await apiRequest("publisher", "PUT", "/v1/publisher/profile", publisherToken, {
    displayName: `Acceptance Publisher ${runId ?? "local"}`,
    status: "active"
  });
  if (!expectStatus("publisher", "workflow", "/v1/publisher/profile", profileResponse, [200])) {
    return null;
  }

  const termsResponse = await apiRequest("publisher", "POST", "/v1/publisher/terms/accept", publisherToken, {});
  if (!expectStatus("publisher", "workflow", "/v1/publisher/terms/accept", termsResponse, [200])) {
    return null;
  }

  const onboardingResponse = await apiRequest("publisher", "POST", "/v1/publisher/connect/onboarding", publisherToken, {});
  if (!expectStatus("publisher", "workflow", "/v1/publisher/connect/onboarding", onboardingResponse, [201])) {
    return null;
  }

  const publisherProfileId = onboardingResponse.json?.connect?.publisherProfileId;
  const payoutAccountId = onboardingResponse.json?.connect?.accountId ?? null;
  const connectStatusResponse = await apiRequest("publisher", "GET", "/v1/publisher/connect/status", publisherToken);
  if (!expectStatus("publisher", "workflow", "/v1/publisher/connect/status", connectStatusResponse, [200])) {
    return null;
  }

  const priceResponse = await apiRequest("publisher", "POST", `/v1/skills/${encodeURIComponent(skillSlug)}/prices`, publisherToken, {
    billingModel: "per_call",
    currency: "usd",
    status: "draft",
    unitAmountCents: 10000
  });
  if (!expectStatus("publisher", "workflow", `/v1/skills/${skillSlug}/prices`, priceResponse, [201])) {
    return null;
  }

  const payoutSummaryResponse = await apiRequest("publisher", "GET", "/v1/publisher/payouts", publisherToken);
  expectStatus("publisher", "workflow", "/v1/publisher/payouts", payoutSummaryResponse, [200]);
  addResult("publisher", "workflow", `/v1/skills/${skillSlug}/prices`, "pass", "Verified terms and saved paid price draft; active paid pricing requires verified Stripe Connect payouts.");

  return {
    payoutAccountId,
    publisherProfileId
  };
}

async function checkDeveloperWorkflow({ adminToken, developer2Token, developerToken, runId, skillSlug }) {
  const slug = normalizeQaSlug(`qa-flow-${runId ?? Date.now().toString(36)}`);
  const otherSlug = normalizeQaSlug(`qa-other-${runId ?? Date.now().toString(36)}`);
  const project = await ensureProject(developerToken, "developer", slug, "Acceptance Flow Project");
  if (!project) {
    return null;
  }

  if (developer2Token) {
    const peerProject = await ensureProject(developer2Token, "developer2", slug, "Acceptance Peer Flow Project");
    const peerOther = await ensureProject(developer2Token, "developer2", otherSlug, "Acceptance Cross Org Project");

    if (peerProject?.id && project.id && peerProject.id !== project.id) {
      addResult("developer", "workflow", "/v1/developer/projects", "pass", "Same project slug resolves to distinct projects in different organizations.");
    }

    if (peerOther) {
      const crossResponse = await apiRequest("developer", "GET", `/v1/developer/projects/${encodeURIComponent(otherSlug)}`, developerToken);
      expectStatus("developer", "authorization", `/v1/developer/projects/${otherSlug}`, crossResponse, [404]);
    }
  }

  const installResponse = await apiRequest("developer", "POST", `/v1/projects/${encodeURIComponent(slug)}/installed-skills`, developerToken, {
    skillSlug
  });
  if (installResponse.status === 201) {
    addResult("developer", "workflow", `/v1/projects/${slug}/installed-skills`, "pass", "Project skill install was created.");
  } else if (installResponse.status === 400 && /already|exists|installed/i.test(safeError(installResponse))) {
    addResult("developer", "workflow", `/v1/projects/${slug}/installed-skills`, "pass", "Reusing existing project skill install.");
  } else {
    addIssue({
      category: "workflow",
      message: `/v1/projects/${slug}/installed-skills returned HTTP ${installResponse.status}: ${safeError(installResponse)}`,
      role: "developer",
      severity: "P0",
      url: joinUrl(config.apiUrl, `/v1/projects/${slug}/installed-skills`)
    });
    return null;
  }

  const installListResponse = await apiRequest("developer", "GET", `/v1/projects/${encodeURIComponent(slug)}/installed-skills`, developerToken);
  if (expectStatus("developer", "workflow", `/v1/projects/${slug}/installed-skills`, installListResponse, [200])) {
    const installed = (installListResponse.json?.installedSkills ?? []).some((item) => item?.skillSlug === skillSlug);

    if (!installed) {
      addIssue({
        category: "workflow",
        message: `${skillSlug} does not appear in the project installed-skill list after install.`,
        role: "developer",
        severity: "P0"
      });
      return null;
    }
  }

  const saveResponse = await apiRequest("developer", "POST", `/v1/projects/${encodeURIComponent(slug)}/saved-skills`, developerToken, {
    collectionName: "acceptance",
    skillSlug
  });
  if (saveResponse.status === 201) {
    addResult("developer", "workflow", `/v1/projects/${slug}/saved-skills`, "pass", "Project saved skill was created.");
  } else if (saveResponse.status === 400 && /already|exists/i.test(safeError(saveResponse))) {
    addResult("developer", "workflow", `/v1/projects/${slug}/saved-skills`, "pass", "Reusing existing saved skill.");
  } else {
    addIssue({
      category: "workflow",
      message: `/v1/projects/${slug}/saved-skills returned HTTP ${saveResponse.status}: ${safeError(saveResponse)}`,
      role: "developer",
      severity: "P0",
      url: joinUrl(config.apiUrl, `/v1/projects/${slug}/saved-skills`)
    });
    return null;
  }

  const policyResponse = await apiRequest("developer", "PUT", `/v1/projects/${encodeURIComponent(slug)}/policies/${encodeURIComponent(skillSlug)}`, developerToken, {
    allowBrowser: true,
    allowNetwork: true,
    allowSecretAccess: false,
    approvalRequired: false,
    filesystemAccess: "none",
    maxPermissionLevel: "high",
    monthlyBudgetCents: 500000,
    rateLimitPerMinute: 100,
    reason: "Acceptance QA policy for verified paid skill invocation."
  });
  if (!expectStatus("developer", "workflow", `/v1/projects/${slug}/policies/${skillSlug}`, policyResponse, [200])) {
    return null;
  }

  const keyCreateResponse = await apiRequest("developer", "POST", `/v1/projects/${encodeURIComponent(slug)}/api-keys`, developerToken, {
    name: "Acceptance reveal-once key"
  });
  if (!expectStatus("developer", "workflow", `/v1/projects/${slug}/api-keys`, keyCreateResponse, [201])) {
    return null;
  }

  const rawApiKey = keyCreateResponse.json?.apiKey?.apiKey;
  const keyId = keyCreateResponse.json?.apiKey?.id;
  if (typeof rawApiKey !== "string" || !rawApiKey.startsWith("skh_")) {
    addIssue({
      category: "api-key",
      message: "API key creation did not return the one-time raw key value.",
      role: "developer",
      severity: "P0"
    });
    return null;
  }
  addResult("developer", "api-key", `/v1/projects/${slug}/api-keys`, "pass", "API key raw value appeared in the creation response only.");

  const keyListResponse = await apiRequest("developer", "GET", `/v1/projects/${encodeURIComponent(slug)}/api-keys`, developerToken);
  if (expectStatus("developer", "api-key", `/v1/projects/${slug}/api-keys`, keyListResponse, [200])) {
    const listText = keyListResponse.text;
    if (listText.includes(rawApiKey) || /"apiKey"\s*:/.test(listText)) {
      addIssue({
        category: "api-key",
        message: "API key list response exposed the raw reveal-once key.",
        role: "developer",
        severity: "P0"
      });
    } else {
      addResult("developer", "api-key", `/v1/projects/${slug}/api-keys`, "pass", "API key list omits raw secret after creation.");
    }
  }

  const runtimeTestResponse = await apiRequest("developer", "POST", `/v1/projects/${encodeURIComponent(slug)}/runtime/test`, developerToken, {
    input: { task: "Run acceptance console invocation." },
    skillSlug
  });
  if (!expectStatus("developer", "workflow", `/v1/projects/${slug}/runtime/test`, runtimeTestResponse, [200])) {
    return null;
  }

  const runtimeInvokeResponse = await apiRequest("developer", "POST", "/v1/runtime/invoke", rawApiKey, {
    input: { task: "Run acceptance billable invocation." },
    skillSlug
  });
  const billableInvocation = expectStatus("developer", "workflow", "/v1/runtime/invoke", runtimeInvokeResponse, [200]);

  const notificationsResponse = await apiRequest("developer", "GET", "/v1/notifications", developerToken);
  expectStatus("developer", "workflow", "/v1/notifications", notificationsResponse, [200]);

  await checkAuditContains(adminToken, ["project.created", "project_api_key.created", "project_policy.updated"]);

  return {
    apiKeyId: keyId,
    billableInvocation,
    projectSlug: slug
  };
}

async function checkFinancePayoutWorkflow({ adminToken, publisherProfileId, publisherToken, runId }) {
  const processResponse = await apiRequest("admin", "POST", "/v1/admin/finance/process-usage", adminToken, {
    confirmation: "RUN",
    limit: 20,
    reason: "Acceptance QA posts billable usage."
  });
  if (!expectStatus("admin", "workflow", "/v1/admin/finance/process-usage", processResponse, [200])) {
    return;
  }

  await makePublisherBalancesImmediatelyAvailable(publisherProfileId);

  const releaseResponse = await apiRequest("admin", "POST", "/v1/admin/finance/release-balances", adminToken, {
    confirmation: "RUN",
    limit: 20,
    reason: "Acceptance QA releases available balances."
  });
  expectStatus("admin", "workflow", "/v1/admin/finance/release-balances", releaseResponse, [200]);

  const ledgerResponse = await apiRequest("publisher", "GET", "/v1/publisher/finance/ledger", publisherToken);
  expectStatus("publisher", "workflow", "/v1/publisher/finance/ledger", ledgerResponse, [200]);

  const payoutResponse = await apiRequest("publisher", "POST", "/v1/publisher/payouts", publisherToken, {
    currency: "usd",
    publisherProfileId
  });
  if (!expectStatus("publisher", "workflow", "/v1/publisher/payouts", payoutResponse, [201])) {
    return;
  }

  const payoutId = payoutResponse.json?.payout?.id;
  const approveResponse = await apiRequest("admin", "POST", `/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision`, adminToken, {
    action: "approve",
    reason: "Acceptance QA approves payout."
  });
  if (!expectStatus("admin", "workflow", `/v1/admin/payouts/${payoutId}/decision`, approveResponse, [200])) {
    return;
  }

  const paidResponse = await apiRequest("admin", "POST", `/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision`, adminToken, {
    action: "mark_paid",
    providerReference: `acceptance-${normalizeQaSlug(runId ?? "local")}`,
    reason: "Acceptance QA marks payout paid."
  });
  expectStatus("admin", "workflow", `/v1/admin/payouts/${payoutId}/decision`, paidResponse, [200]);
  await checkAuditContains(adminToken, ["payout.requested", "payout.approve", "payout.mark_paid"]);
}

async function checkAdminWorkflow(adminToken) {
  const endpoints = [
    "/v1/admin/overview",
    "/v1/admin/finance/ledger",
    "/v1/admin/notifications",
    "/v1/admin/notification-deliveries",
    "/v1/admin/webhook-deliveries",
    "/v1/admin/audit-logs",
    "/v1/admin/identity-directory",
    "/v1/admin/launch-readiness"
  ];

  for (const path of endpoints) {
    const response = await apiRequest("admin", "GET", path, adminToken);
    if (expectStatus("admin", "workflow", path, response, [200]) && path === "/v1/admin/launch-readiness") {
      inspectLaunchReadiness(response.json);
      inspectLaunchReadinessEvidence(response.json);
    }
  }
}

async function checkRoleBoundaries(tokens) {
  for (const check of ROLE_BOUNDARY_CHECKS) {
    const token = tokens[check.deniedRole];
    if (!token) {
      continue;
    }

    const response = await apiRequest(check.deniedRole, check.method, check.path, token);
    if (response.status === 401 || response.status === 403) {
      addResult(check.deniedRole, "authorization", check.path, "pass", `${check.deniedRole} cannot access ${check.allowedRole} endpoint.`);
      continue;
    }

    addIssue({
      category: "authorization",
      message: `${check.deniedRole} unexpectedly accessed ${check.path} with HTTP ${response.status}.`,
      role: check.deniedRole,
      severity: "P0",
      url: joinUrl(config.apiUrl, check.path)
    });
  }
}

async function ensureProject(token, role, slug, name) {
  const createResponse = await apiRequest(role, "POST", "/v1/developer/projects", token, {
    name,
    slug
  });

  if (createResponse.status === 201) {
    addResult(role, "workflow", "/v1/developer/projects", "pass", `Created project ${slug}.`);
    return createResponse.json?.project;
  }

  if (createResponse.status === 400 && /already exists/i.test(safeError(createResponse))) {
    const detailResponse = await apiRequest(role, "GET", `/v1/developer/projects/${encodeURIComponent(slug)}`, token);
    if (expectStatus(role, "workflow", `/v1/developer/projects/${slug}`, detailResponse, [200])) {
      addResult(role, "workflow", `/v1/developer/projects/${slug}`, "pass", `Reusing existing project ${slug}.`);
      return detailResponse.json?.project;
    }
  }

  addIssue({
    category: "workflow",
    message: `Unable to create or reuse project ${slug}: ${safeError(createResponse)}`,
    role,
    severity: "P0",
    url: joinUrl(config.apiUrl, "/v1/developer/projects")
  });
  return null;
}

async function checkAuditContains(adminToken, actions) {
  const response = await apiRequest("admin", "GET", "/v1/admin/audit-logs?limit=100", adminToken);
  if (!expectStatus("admin", "audit", "/v1/admin/audit-logs", response, [200])) {
    return false;
  }

  const logs = response.json?.logs ?? response.json?.auditLogs ?? [];
  const logActions = new Set(logs.map((log) => log?.action).filter(Boolean));
  const missing = actions.filter((action) => !logActions.has(action));

  if (missing.length > 0) {
    addIssue({
      category: "audit",
      message: `Admin audit log is missing expected action(s): ${missing.join(", ")}.`,
      role: "admin",
      severity: "P1",
      url: joinUrl(config.apiUrl, "/v1/admin/audit-logs")
    });
    return false;
  }

  addResult("admin", "audit", "/v1/admin/audit-logs", "pass", `Found audit actions: ${actions.join(", ")}.`);
  return true;
}

function assertRuntimeChecks(role, skillSlug, runtimeChecks) {
  if (!Array.isArray(runtimeChecks) || runtimeChecks.length === 0) {
    addIssue({
      category: "runtime-checks",
      message: `${skillSlug} review does not include runtime check evidence.`,
      role,
      severity: "P1"
    });
    return;
  }

  const blockingFailures = runtimeChecks.filter((check) => check?.isBlocking && check?.status === "failed");
  if (blockingFailures.length > 0) {
    addIssue({
      category: "runtime-checks",
      message: `${skillSlug} has blocking runtime check failures before approval.`,
      role,
      severity: "P0"
    });
    return;
  }

  addResult(role, "runtime-checks", skillSlug, "pass", `${runtimeChecks.length} runtime check(s) are present.`);
}

function inspectLaunchReadinessEvidence(json) {
  const readiness = json?.readiness ?? json;
  const details = collectReadinessDetails(readiness, ["ready", "warning", "deferred", "blocker"]);
  const evidenceText = JSON.stringify(details).toLowerCase();

  for (const key of [
    "demo_fallback",
    "schema_migrations",
    "verified_skills_threshold",
    "active_publishers_threshold",
    "active_projects_threshold",
    "successful_invocations_threshold",
    "published_feedback_threshold"
  ]) {
    if (!evidenceText.includes(key)) {
      addIssue({
        category: "launch-readiness",
        message: `Launch readiness response is missing ${key} evidence.`,
        role: "admin",
        severity: "P1",
        url: joinUrl(config.apiUrl, "/v1/admin/launch-readiness")
      });
    }
  }
}

async function apiRequest(role, method, path, token, body) {
  const response = await requestJson(joinUrl(config.apiUrl, path), {
    body,
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {},
    method
  });

  if (!(method === "POST" && /\/api-keys$/.test(path))) {
    assertNoLeaks(role, "api", path, response.text);
  }
  return response;
}

function expectStatus(role, category, target, response, expectedStatuses) {
  if (expectedStatuses.includes(response.status)) {
    addResult(role, category, target, "pass", `HTTP ${response.status}`);
    return true;
  }

  addIssue({
    category,
    message: `${target} returned HTTP ${response.status}: ${safeError(response)}`,
    role,
    severity: "P0",
    url: joinUrl(config.apiUrl, target)
  });
  return false;
}

async function makePublisherBalancesImmediatelyAvailable(publisherProfileId) {
  if (!publisherProfileId) {
    return false;
  }

  const sql = await getQaSql();
  if (!sql) {
    addIssue({
      category: "finance-fixture",
      message: "DATABASE_URL is unavailable, so QA could not shorten local payout balance availability for the payout closeout.",
      role: "admin",
      severity: "P1"
    });
    return false;
  }

  try {
    const rows = await sql`
      update publisher_balances
      set available_at = now()
      where publisher_profile_id = ${publisherProfileId}
        and state = 'pending'
      returning id::text
    `;
    addResult("admin", "finance-fixture", "publisher_balances", "pass", `Marked ${rows.length} pending balance row(s) available for local payout QA.`);
    return rows.length > 0;
  } catch (error) {
    addIssue({
      category: "finance-fixture",
      message: `Unable to prepare local payout balances: ${error instanceof Error ? error.message : String(error)}`,
      role: "admin",
      severity: "P1"
    });
    return false;
  }
}

async function getQaSql() {
  if (!config.databaseUrl) {
    return null;
  }

  if (!config.allowNonLocalDb && !isLocalDatabase(config.databaseUrl)) {
    return null;
  }

  qaSqlPromise ??= Promise.resolve().then(() => {
    const postgres = require("postgres");
    return postgres(config.databaseUrl, { max: 1 });
  });

  return qaSqlPromise;
}

async function closeQaSql() {
  if (!qaSqlPromise) {
    return;
  }

  const sql = await qaSqlPromise;
  await sql.end();
  qaSqlPromise = null;
}

function isLocalDatabase(databaseUrl) {
  try {
    const hostname = new URL(databaseUrl).hostname;
    return LOCAL_HOSTS.has(hostname) || isPrivateNetworkHost(hostname);
  } catch {
    return false;
  }
}

function isPrivateNetworkHost(hostname) {
  return (
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    /^192\.168\./.test(hostname)
  );
}

function assertNoCredentialMarkers(role, target, text, credentials) {
  const lower = text.toLowerCase();
  const markers = credentialLeakMarkers(credentials);
  const leaked = markers.filter((marker) => marker.value && lower.includes(marker.value.toLowerCase()));

  if (leaked.length > 0) {
    addIssue({
      category: "secret-safety",
      message: `${target} exposes acceptance credential marker(s): ${leaked.map((marker) => marker.label).join(", ")}.`,
      role,
      severity: "P0",
      url: joinUrl(config.appUrl, target)
    });
  }
}

function credentialLeakMarkers(credentials) {
  const accounts = Object.entries(credentials?.accounts ?? {});
  const markers = [
    { label: "runId", value: credentials?.runId }
  ];

  for (const [key, account] of accounts) {
    markers.push(
      { label: `${key}.email`, value: account?.email },
      { label: `${key}.username`, value: account?.username },
      { label: `${key}.organizationSlug`, value: account?.organizationSlug },
      { label: `${key}.sessionToken`, value: account?.sessionToken },
      { label: `${key}.bootstrapToken`, value: account?.bootstrapToken },
      { label: `${key}.password`, value: account?.password }
    );
  }

  return markers.filter((marker) => typeof marker.value === "string" && marker.value.length >= 6);
}

function normalizeQaSlug(value) {
  return String(value ?? "qa-flow")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
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

    const requestPath = cacheBustedPath(pagePath, role);
    const response = await requestText(joinUrl(config.appUrl, requestPath), {
      headers: {
        "Cache-Control": "no-cache",
        Cookie: `skillhub_user_token=${encodeURIComponent(token)}`,
        Pragma: "no-cache"
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
        url: joinUrl(config.appUrl, requestPath)
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
        url: joinUrl(config.appUrl, requestPath)
      });
    }

    const hasLoggedInMarkers = missing.length === 0 && missingHtml.length === 0;

    if (forbidden.length > 0 && !hasLoggedInMarkers) {
      addIssue({
        category: "locked-state",
        message: `${pagePath} still contains locked-state copy for a valid ${role} session: ${forbidden.join(", ")}.`,
        role,
        severity: "P0",
        url: joinUrl(config.appUrl, requestPath)
      });
    }

    if (hasLoggedInMarkers) {
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

function cacheBustedPath(path, role) {
  const url = new URL(path, "https://acceptance.local");
  url.searchParams.set("qa", `${startedAt}-${role}`.replace(/[^a-zA-Z0-9_-]/g, ""));
  return `${url.pathname}${url.search}`;
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
  const candidates = [
    ...skills.filter((candidate) => isUsablePublicSkill(candidate, true)),
    ...skills.filter((candidate) => isUsablePublicSkill(candidate, false)),
    ...FALLBACK_PUBLIC_SKILL_SLUGS.map((slug) => ({ slug, verificationStatus: "static" }))
  ];
  const skill = await firstReachablePublicSkill(candidates);

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

async function firstReachablePublicSkill(candidates) {
  const seen = new Set();

  for (const candidate of candidates) {
    if (!candidate?.slug || seen.has(candidate.slug)) {
      continue;
    }

    seen.add(candidate.slug);
    const path = cacheBustedPath(`/skills/${candidate.slug}?lang=zh`, "public-skill");
    const response = await requestText(joinUrl(config.appUrl, path), {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      },
      method: "GET"
    });

    if (response.status === 200) {
      return candidate;
    }
  }

  return null;
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
  const leaks = findSensitiveLeaks(text).filter((leak) => !(type === "page" && leak === "provider key"));

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

function assertReportSecretSafe(report) {
  const leaks = findSensitiveLeaks(JSON.stringify(report));

  if (leaks.length > 0) {
    throw new Error(`Acceptance QA report contains sensitive output: ${leaks.join(", ")}`);
  }
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

function parseBoolean(value) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

async function loadEnv(path) {
  try {
    const content = await readFile(path, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const [key, ...rest] = line.split("=");
          return [key, rest.join("=")];
        })
    );
  } catch {
    return {};
  }
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
    allowNonLocalDb: false,
    apiUrl: undefined,
    appUrl: undefined,
    credentials: undefined,
    databaseUrl: undefined,
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

    if (arg === "--allow-non-local-db") {
      parsed.allowNonLocalDb = true;
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

    if (arg === "--database-url") {
      parsed.databaseUrl = nextValue();
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
  --database-url <url>    Optional local DB URL for payout-balance QA fixture.
  --output <path>         Secret-safe report path. Default: ${DEFAULT_OUTPUT}
  --fail-on <level>       p0, p1, p2, all, or none. Default: p0
  --timeout-ms <ms>       Request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --allow-non-local-db    Permit the payout-balance QA fixture on a non-local DB.
  -h, --help              Show this help.

Production example:
  pnpm qa:acceptance-team -- --credentials /root/skillhub-acceptance-team.json --output /root/skillhub-acceptance-qa-report.json --fail-on p0
`);
}
