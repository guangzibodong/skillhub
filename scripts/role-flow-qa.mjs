#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const require = createRequire(new URL("../apps/gateway/package.json", import.meta.url));

const DEFAULT_API_URL = "http://127.0.0.1:8787";
const DEFAULT_APP_URL = "http://127.0.0.1:3000";
const DEFAULT_OUTPUT_DIR = "examples/role-flow-qa";
const DEFAULT_EMAIL_DOMAIN = "roleflow.local";
const DEFAULT_PASSWORD = "a12345678";
const DEFAULT_TIMEOUT_MS = 30000;

loadDotEnv(resolve(".env"));

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const config = {
  allowProductionWrite: args.allowProductionWrite || parseBoolean(process.env.SKILLHUB_ROLE_FLOW_ALLOW_PRODUCTION_WRITE),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_ROLE_FLOW_API_URL ??
    process.env.SKILLHUB_ACCEPTANCE_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_ROLE_FLOW_APP_URL ??
    process.env.SKILLHUB_ACCEPTANCE_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  databaseUrl: args.databaseUrl ?? process.env.SKILLHUB_ROLE_FLOW_DATABASE_URL ?? process.env.DATABASE_URL,
  emailDomain: args.emailDomain ?? process.env.SKILLHUB_ROLE_FLOW_EMAIL_DOMAIN ?? DEFAULT_EMAIL_DOMAIN,
  outputDir: args.outputDir ?? process.env.SKILLHUB_ROLE_FLOW_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR,
  password: args.password ?? process.env.SKILLHUB_ROLE_FLOW_PASSWORD ?? DEFAULT_PASSWORD,
  runId: normalizeRunId(args.runId ?? process.env.SKILLHUB_ROLE_FLOW_RUN_ID ?? `roleqa${Date.now().toString(36).slice(-6)}`),
  serviceToken: process.env.SKILLHUB_SERVICE_TOKEN ?? process.env.SKILLHUB_ADMIN_TOKEN,
  skipPayoutSeed: args.skipPayoutSeed || parseBoolean(process.env.SKILLHUB_ROLE_FLOW_SKIP_PAYOUT_SEED),
  skipScreenshots: args.skipScreenshots || parseBoolean(process.env.SKILLHUB_ROLE_FLOW_SKIP_SCREENSHOTS),
  timeoutMs: parsePositiveInteger(args.timeoutMs ?? process.env.SKILLHUB_ROLE_FLOW_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)
};

const artifact = {
  accounts: {},
  apiUrl: config.apiUrl,
  appUrl: config.appUrl,
  issues: [],
  results: [],
  runId: config.runId,
  screenshots: [],
  skill: null,
  startedAt: new Date().toISOString()
};

try {
  validateConfig(config);
  guardProductionWrite(config);
  await prepareOutputDir(config.outputDir);

  console.log("SkillHub role-flow QA");
  console.log(`API: ${config.apiUrl}`);
  console.log(`App: ${config.appUrl}`);
  console.log(`Run id: ${config.runId}`);
  console.log(`Output: ${resolve(config.outputDir)}`);
  console.log("");

  const accounts = buildAccounts(config);
  await createAndVerifyAccounts(accounts);

  const flow = await runCrossRoleApiFlow(accounts);
  artifact.skill = flow.skill;

  if (!config.skipScreenshots) {
    await captureScreenshots(accounts, flow);
  } else {
    addResult("all", "screenshots", "skipped", "skip", "Screenshots were skipped by configuration.");
  }

  await writeArtifacts(accounts);

  console.log("Role-flow QA complete.");
  console.log(`Accounts: ${resolve(config.outputDir, "accounts.md")}`);
  console.log(`Report: ${resolve(config.outputDir, "report.md")}`);
  console.log(`TODO: ${resolve(config.outputDir, "TODO.md")}`);
} catch (error) {
  addIssue("fatal", redactSecrets(error instanceof Error ? error.message : String(error)), "all", "P0");
  await writeArtifacts(artifact.accounts).catch(() => {});
  console.error(redactSecrets(error instanceof Error ? error.stack ?? error.message : String(error)));
  process.exit(1);
}

async function createAndVerifyAccounts(accounts) {
  for (const account of Object.values(accounts)) {
    await ensurePasswordAccount(account);

    if (account.platformRole !== "user") {
      await promoteAccount(account);
    }

    const verified = await loginAndVerify(account);
    account.sessionToken = verified.token;
    account.subject = verified.subject;
    artifact.accounts[account.key] = publicAccount(account);
    addResult(account.key, "account", "created/verified", "pass", `Verified ${account.platformRole} with roles ${verified.subject.roles.join(", ")}.`);
  }
}

async function runCrossRoleApiFlow(accounts) {
  const publisher = accounts.publisher;
  const reviewer = accounts.reviewer;
  const admin = accounts.admin;
  const developer = accounts.developer;
  const finance = accounts.finance;
  const skillSlug = `role-flow-${config.runId}`.replace(/_/g, "-").slice(0, 60).replace(/-+$/g, "");

  await putPublisherProfile(publisher);
  await acceptPublisherTerms(publisher);

  const blockedManifest = buildSkillManifest({
    description:
      "Role flow blocked review sample. This intentionally starts with an invalid runtime URL so reviewer operations can record a real repair decision.",
    runtimeEntryPoint: "not-a-valid-url",
    slug: skillSlug,
    version: "1.0.0"
  });
  await publishSkill(publisher, blockedManifest, false);
  const firstReview = await submitSkill(publisher, skillSlug, "1.0.0");
  const blockedDecision = await decideReview(reviewer, firstReview.id, "blocked", "Role-flow QA: block invalid runtime evidence so publisher must repair.");

  const fixedManifest = buildSkillManifest({
    description:
      "Role flow approved review sample with concrete schemas, low-risk permissions, and an HTTPS runtime endpoint for developer adoption verification.",
    runtimeEntryPoint: `https://api.useskillhub.com/role-flow/${config.runId}`,
    slug: skillSlug,
    version: "1.0.1"
  });
  await publishSkill(publisher, fixedManifest, true);
  const secondReview = await submitSkill(publisher, skillSlug, "1.0.1");
  const approvedDecision = await decideReview(admin, secondReview.id, "approved", "Role-flow QA: approve repaired HTTPS runtime and concrete schema evidence.");

  await setSkillPrice(publisher, skillSlug);
  await installSkill(developer, skillSlug, "1.0.1");

  const onboarding = await submitPayoutDetails(publisher);
  await completePayoutOnboarding(finance, onboarding);
  if (config.skipPayoutSeed) {
    addResult("finance", "db", "seed mature balance", "skip", "Payout balance seeding was skipped by configuration.");
  } else {
    await seedPublisherBalanceIfPossible(publisher);
  }

  const payout = await requestPayoutIfPossible(publisher);
  let payoutDecision = null;
  if (payout?.id) {
    payoutDecision = await decidePayout(finance, payout.id, "approve", {
      reason: "Role-flow QA finance approved Stripe Connect paid-marketplace payout review."
    });
  }

  return {
    skill: {
      approvedReviewId: secondReview.id,
      blockedDecision,
      blockedReviewId: firstReview.id,
      developerInstall: true,
      displayName: fixedManifest.displayName,
      payout,
      payoutDecision,
      slug: skillSlug,
      version: "1.0.1",
      verificationStatus: approvedDecision.verificationStatus
    }
  };
}

async function captureScreenshots(accounts, flow) {
  let chromium;

  try {
    ({ chromium } = await import("playwright"));
  } catch {
    try {
      ({ chromium } = await import("@playwright/test"));
    } catch {
      addIssue("screenshots", "Playwright is not installed or not resolvable from this workspace.", "all", "P1");
      return;
    }
  }

  const browser = await chromium.launch({ headless: true });

  try {
    await screenshotLogin(browser, accounts.publisher);
    await screenshotRole(browser, accounts.publisher, "/publisher?lang=zh", "publisher-01-workspace");
    await screenshotRole(browser, accounts.publisher, `/skills/${flow.skill.slug}?lang=zh`, "publisher-02-approved-skill-detail");
    await screenshotRole(browser, accounts.publisher, "/publisher#publisher-payouts", "publisher-03-payout-readiness");
    await screenshotRole(browser, accounts.reviewer, "/admin#admin-reviews", "reviewer-01-review-queue");
    await screenshotRole(browser, accounts.admin, "/admin?lang=zh", "admin-01-full-console");
    await screenshotRole(browser, accounts.developer, `/skills/${flow.skill.slug}?lang=zh`, "developer-01-skill-detail");
    await screenshotRole(browser, accounts.developer, "/developer?lang=zh", "developer-02-workspace");
    await screenshotRole(browser, accounts.finance, "/admin#admin-payouts", "finance-01-payout-queue");
    await screenshotRole(browser, accounts.support, "/admin#admin-identity", "support-01-identity-directory");
    await screenshotRole(browser, accounts.super_admin, "/admin#admin-audit", "super-admin-01-audit");
  } finally {
    await browser.close();
  }
}

async function screenshotLogin(browser, account) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  await page.goto(joinUrl(config.appUrl, "/login?lang=zh"), { waitUntil: "networkidle", timeout: config.timeoutMs });
  await page.screenshot({ fullPage: true, path: screenshotPath("login-01-password-entry") });
  artifact.screenshots.push("screenshots/login-01-password-entry.png");
  await context.close();
}

async function screenshotRole(browser, account, path, name) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  await context.addCookies([
    {
      domain: new URL(config.appUrl).hostname,
      httpOnly: true,
      name: "skillhub_user_token",
      path: "/",
      sameSite: "Lax",
      value: account.sessionToken
    }
  ]);
  const page = await context.newPage();
  const target = joinUrl(config.appUrl, path);
  const result = { status: null, url: target };

  try {
    const response = await page.goto(target, { waitUntil: "networkidle", timeout: config.timeoutMs });
    result.status = response?.status() ?? null;
    await delay(500);
    const bodyText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    if (!bodyText.trim()) {
      addIssue("screenshots", `Page body was empty after navigation to ${path}.`, account.key, "P1");
    }
    const file = screenshotPath(name);
    await page.screenshot({ fullPage: true, path: file });
    artifact.screenshots.push(`screenshots/${name}.png`);
    addResult(account.key, "screenshot", path, "pass", `Captured ${name}.png with HTTP ${result.status ?? "unknown"}.`);
  } catch (error) {
    addIssue("screenshots", `Unable to capture ${path}: ${error instanceof Error ? error.message : String(error)}`, account.key, "P1");
  } finally {
    await context.close();
  }
}

async function ensurePasswordAccount(account) {
  const response = await requestJson("/v1/auth/password/signup", {
    body: {
      displayName: account.displayName,
      email: account.email,
      organizationName: account.organizationName,
      organizationSlug: account.organizationSlug,
      password: config.password,
      role: account.signupRole,
      username: account.username
    },
    method: "POST"
  });

  if (response.status === 201) {
    return;
  }

  const error = safeError(response);
  if (response.status === 400 && isExistingAccountError(error)) {
    await login(account);
    return;
  }

  throw new Error(`Unable to create ${account.key} password account: ${error}`);
}

async function promoteAccount(account) {
  const response = await requestJson("/v1/auth/bootstrap-token", {
    body: {
      displayName: account.displayName,
      email: account.email,
      organizationName: account.organizationName,
      organizationSlug: account.organizationSlug,
      platformRole: account.platformRole,
      role: account.organizationRole,
      tokenName: `Role-flow QA ${account.key} token`
    },
    headers: {
      Authorization: `Bearer ${config.serviceToken}`
    },
    method: "POST"
  });

  if (response.status !== 201) {
    throw new Error(`Unable to promote ${account.key}: ${safeError(response)}`);
  }
}

async function loginAndVerify(account) {
  const loginPayload = await login(account);
  const token = loginPayload.login?.accessToken?.token;

  if (!token) {
    throw new Error(`Password login did not return a token for ${account.key}.`);
  }

  const me = await requestJson("/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (me.status !== 200 || !me.json?.subject) {
    throw new Error(`Unable to verify ${account.key}: ${safeError(me)}`);
  }

  return { subject: me.json.subject, token };
}

async function login(account) {
  const response = await requestJson("/v1/auth/password/login", {
    body: {
      identifier: account.username,
      password: config.password
    },
    method: "POST"
  });

  if (response.status !== 200) {
    throw new Error(`Unable to log in ${account.key}: ${safeError(response)}`);
  }

  return response.json;
}

async function putPublisherProfile(account) {
  await expectOk("publisher profile", "/v1/publisher/profile", {
    body: {
      displayName: "Role Flow Publisher Studio",
      status: "active"
    },
    headers: authHeaders(account),
    method: "PUT"
  });
  addResult("publisher", "api", "publisher profile", "pass", "Publisher profile created or updated.");
}

async function acceptPublisherTerms(account) {
  await expectOk("publisher terms", "/v1/publisher/terms/accept", {
    body: {
      termsVersion: "role-flow-qa"
    },
    headers: authHeaders(account),
    method: "POST"
  });
  addResult("publisher", "api", "publisher terms", "pass", "Publisher terms accepted.");
}

async function publishSkill(account, manifest, asVersion) {
  const path = asVersion
    ? `/v1/publisher/skills/${encodeURIComponent(manifest.name)}/versions`
    : "/v1/skills";
  const response = await requestJson(path, {
    body: { manifest },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(`Unable to publish ${manifest.name} ${manifest.version}: ${safeError(response)}`);
  }

  addResult("publisher", "api", `publish ${manifest.version}`, "pass", `Published ${manifest.name} ${manifest.version}.`);
  return response.json;
}

async function submitSkill(account, skillSlug, version) {
  const response = await requestJson(`/v1/publisher/skills/${encodeURIComponent(skillSlug)}/versions/${encodeURIComponent(version)}/submit`, {
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201) {
    throw new Error(`Unable to submit ${skillSlug} ${version}: ${safeError(response)}`);
  }

  addResult("publisher", "api", `submit review ${version}`, "pass", `Submitted ${skillSlug} ${version} for review.`);
  return response.json.review;
}

async function decideReview(account, reviewId, status, notes) {
  const response = await requestJson(`/v1/admin/reviews/${encodeURIComponent(reviewId)}/decision`, {
    body: { notes, status },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 200) {
    throw new Error(`Unable to record review ${status}: ${safeError(response)}`);
  }

  addResult(account.key, "api", `review ${status}`, "pass", `Review ${reviewId} recorded as ${status}.`);
  return response.json.review;
}

async function setSkillPrice(account, skillSlug) {
  const response = await requestJson(`/v1/skills/${encodeURIComponent(skillSlug)}/prices`, {
    body: {
      billingModel: "per_call",
      currency: "usd",
      status: "draft",
      unitAmountCents: 99
    },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201) {
    addIssue("publisher", `Unable to save skill price: ${safeError(response)}`, "publisher", "P2");
    return null;
  }

  addResult("publisher", "api", "set price", "pass", "Saved paid-marketplace price draft.");
  return response.json.price;
}

async function installSkill(account, skillSlug, version) {
  const response = await requestJson("/v1/projects/role-flow-project/installed-skills", {
    body: { skillSlug, version },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201) {
    addIssue("developer", `Unable to install approved skill into developer project: ${safeError(response)}`, "developer", "P1");
    return null;
  }

  addResult("developer", "api", "install skill", "pass", `Installed ${skillSlug} ${version} into role-flow-project.`);
  return response.json.install;
}

async function submitPayoutDetails(account) {
  const response = await requestJson("/v1/publisher/connect/onboarding", {
    body: {},
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201) {
    addIssue("finance", `Unable to submit payout details: ${safeError(response)}`, "publisher", "P1");
    return null;
  }

  addResult("publisher", "api", "payout onboarding", "pass", "Started Stripe Connect onboarding.");
  return response.json.connect;
}

async function completePayoutOnboarding(account, onboarding) {
  if (!onboarding?.accountId) {
    addIssue("finance", "Stripe Connect onboarding did not return an account id.", "finance", "P1");
    return null;
  }

  const response = await requestJson("/v1/publisher/connect/status", {
    headers: authHeaders(account),
  });

  if (response.status !== 200) {
    addIssue("finance", `Unable to read Stripe Connect status: ${safeError(response)}`, "finance", "P1");
    return null;
  }

  addResult("finance", "api", "verify payout account", "pass", "Read Stripe Connect payout account status.");
  return response.json.connect;
}

async function seedPublisherBalanceIfPossible(account) {
  if (!config.databaseUrl) {
    addIssue("finance", "No DATABASE_URL is configured, so the script cannot seed a mature paid-marketplace balance for payout testing.", "finance", "P2");
    return;
  }

  let postgres;
  try {
    postgres = require("postgres");
  } catch {
    addIssue("finance", "The postgres package is unavailable, so mature balance seeding was skipped.", "finance", "P2");
    return;
  }

  const summary = await requestJson("/v1/publisher/payouts", {
    headers: authHeaders(account)
  });
  const publisherProfileId = summary.json?.publisherProfile?.id;

  if (!publisherProfileId) {
    addIssue("finance", "Publisher profile was not available, so mature balance seeding was skipped.", "finance", "P2");
    return;
  }

  const sql = postgres(config.databaseUrl, { max: 1 });
  try {
    await sql`
      insert into publisher_balances (publisher_profile_id, amount_cents, currency, state, available_at)
      values (${publisherProfileId}, 150000, 'usd', 'available', now())
    `;
    addResult("finance", "db", "seed mature balance", "pass", "Seeded mature paid-marketplace balance for payout review.");
  } catch (error) {
    addIssue("finance", `Unable to seed mature balance: ${error instanceof Error ? error.message : String(error)}`, "finance", "P2");
  } finally {
    await sql.end({ timeout: 1 });
  }
}

async function requestPayoutIfPossible(account) {
  const response = await requestJson("/v1/publisher/payouts", {
    body: {
      currency: "usd"
    },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 201) {
    addIssue("finance", `Unable to request paid-marketplace payout: ${safeError(response)}`, "publisher", "P2");
    return null;
  }

  addResult("publisher", "api", "request payout", "pass", "Requested paid-marketplace payout review.");
  return response.json.payout;
}

async function decidePayout(account, payoutId, action, input) {
  const response = await requestJson(`/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision`, {
    body: {
      action,
      ...input
    },
    headers: authHeaders(account),
    method: "POST"
  });

  if (response.status !== 200) {
    addIssue("finance", `Unable to decide payout ${action}: ${safeError(response)}`, "finance", "P1");
    return null;
  }

  addResult("finance", "api", `payout ${action}`, "pass", `Finance recorded payout ${action}.`);
  return response.json.payout;
}

async function expectOk(label, path, options) {
  const response = await requestJson(path, options);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Unable to complete ${label}: ${safeError(response)}`);
  }
  return response.json;
}

async function requestJson(path, options = {}) {
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

    return { json, status: response.status, text };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${config.timeoutMs}ms: ${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function writeArtifacts(accounts) {
  await prepareOutputDir(config.outputDir);
  await writeFile(resolve(config.outputDir, "accounts.md"), buildAccountsMarkdown(accounts), "utf8");
  await writeFile(resolve(config.outputDir, "report.md"), buildReportMarkdown(), "utf8");
  await writeFile(resolve(config.outputDir, "TODO.md"), buildTodoMarkdown(), "utf8");
  await writeFile(resolve(config.outputDir, "run.json"), `${JSON.stringify(redactedArtifact(), null, 2)}\n`, "utf8");
}

function buildAccountsMarkdown(accounts) {
  const rows = Object.values(accounts).map((account) => {
    const publicRow = account.username ? account : artifact.accounts[account.key] ?? account;
    return `| ${publicRow.key} | ${publicRow.username} | ${publicRow.email} | ${publicRow.platformRole ?? publicRow.expectedPlatformRole} | ${publicRow.organizationRole ?? publicRow.expectedOrganizationRole} |`;
  });

  return `# SkillHub Role Flow QA Accounts

Run id: \`${config.runId}\`

Shared password: \`${config.password}\`

| Role | Username | Email | Platform role | Organization role |
| --- | --- | --- | --- | --- |
${rows.join("\n")}
`;
}

function buildReportMarkdown() {
  const resultRows = artifact.results.map((result) => (
    `| ${result.role} | ${result.area} | ${result.step} | ${result.status} | ${result.detail} |`
  ));
  const screenshotRows = artifact.screenshots.map((path) => `- [${path}](${path})`);

  return `# SkillHub Role Flow QA Report

Run id: \`${config.runId}\`

API: \`${config.apiUrl}\`

App: \`${config.appUrl}\`

Skill: ${artifact.skill ? `\`${artifact.skill.slug}@${artifact.skill.version}\` (${artifact.skill.verificationStatus ?? "unknown"})` : "not created"}

## Results

| Role | Area | Step | Status | Detail |
| --- | --- | --- | --- | --- |
${resultRows.join("\n") || "| all | none | none | skipped | No results recorded. |"}

## Screenshots

${screenshotRows.join("\n") || "- No screenshots captured."}
`;
}

function buildTodoMarkdown() {
  if (artifact.issues.length === 0) {
    return `# SkillHub Role Flow QA TODO

No role-flow blockers were recorded in this run.
`;
  }

  const rows = artifact.issues.map((issue) => (
    `| ${issue.severity} | ${issue.role} | ${issue.category} | ${issue.message} |`
  ));

  return `# SkillHub Role Flow QA TODO

| Severity | Role | Category | Observed issue / follow-up |
| --- | --- | --- | --- |
${rows.join("\n")}
`;
}

function redactedArtifact() {
  return {
    ...artifact,
    accounts: Object.fromEntries(Object.entries(artifact.accounts).map(([key, account]) => [key, publicAccount(account)]))
  };
}

function publicAccount(account) {
  return {
    displayName: account.displayName,
    email: account.email,
    expectedOrganizationRole: account.organizationRole,
    expectedPlatformRole: account.platformRole,
    key: account.key,
    organizationName: account.organizationName,
    organizationSlug: account.organizationSlug,
    platformRole: account.subject?.platformRole ?? account.platformRole,
    roles: account.subject?.roles ?? [],
    username: account.username
  };
}

function buildAccounts(config) {
  const domain = normalizeEmailDomain(config.emailDomain);
  const roleSpecs = [
    ["developer", "user", "developer", "developer", "Role Flow Developer", "Role Flow Developer Lab"],
    ["publisher", "user", "publisher", "publisher", "Role Flow Publisher", "Role Flow Publisher Studio"],
    ["reviewer", "reviewer", "reviewer", "owner", "Role Flow Reviewer", "Role Flow Review Ops"],
    ["finance", "finance", "finance", "owner", "Role Flow Finance", "Role Flow Finance Ops"],
    ["support", "support", "admin", "owner", "Role Flow Support", "Role Flow Support Ops"],
    ["admin", "admin", "owner", "owner", "Role Flow Admin", "Role Flow Admin Ops"],
    ["super_admin", "super_admin", "owner", "owner", "Role Flow Super Admin", "Role Flow Super Admin Ops"]
  ];

  return Object.fromEntries(
    roleSpecs.map(([key, platformRole, organizationRole, signupRole, displayName, organizationName]) => {
      const normalizedKey = key.replace(/_/g, "-");
      return [
        key,
        {
          displayName,
          email: `${normalizedKey}-${config.runId}@${domain}`,
          key,
          organizationName,
          organizationRole,
          organizationSlug: `${normalizedKey}-${config.runId}`,
          platformRole,
          signupRole,
          username: `roleqa_${key}_${config.runId}`.replace(/[^a-z0-9_-]/g, "_").slice(0, 32)
        }
      ];
    })
  );
}

function buildSkillManifest({ description, runtimeEntryPoint, slug, version }) {
  return {
    schemaVersion: "0.1",
    name: slug,
    displayName: "Role Flow QA Skill",
    version,
    description,
    author: {
      name: "Role Flow Publisher Studio",
      url: "https://www.useskillhub.com"
    },
    tags: ["role-flow", "qa", "workflow"],
    runtime: {
      type: "http",
      entrypoint: runtimeEntryPoint
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

function addResult(role, area, step, status, detail) {
  artifact.results.push({ area, detail, role, status, step });
}

function addIssue(category, message, role, severity) {
  artifact.issues.push({ category, message: sanitizeMarkdown(redactSecrets(message)), role, severity });
}

function authHeaders(account) {
  return {
    Authorization: `Bearer ${account.sessionToken}`
  };
}

function screenshotPath(name) {
  return resolve(config.outputDir, "screenshots", `${name}.png`);
}

async function prepareOutputDir(outputDir) {
  await mkdir(resolve(outputDir, "screenshots"), { recursive: true });
}

function validateConfig(config) {
  normalizeUrl(config.apiUrl, "API URL");
  normalizeUrl(config.appUrl, "app URL");

  if (!config.serviceToken) {
    throw new Error("Set SKILLHUB_SERVICE_TOKEN or SKILLHUB_ADMIN_TOKEN before creating role-flow operator accounts.");
  }

  if (config.password !== DEFAULT_PASSWORD) {
    throw new Error("This QA task requires every role account password to be a12345678.");
  }
}

function guardProductionWrite(config) {
  if (!isProductionTarget(config.apiUrl)) {
    return;
  }

  if (config.allowProductionWrite) {
    return;
  }

  throw new Error("This target looks production-like. Re-run with --allow-production-write only after confirming production account creation is intended.");
}

function isProductionTarget(value) {
  const hostname = new URL(value).hostname;
  return /(^|\.)useskillhub\.com$/i.test(hostname);
}

function joinUrl(baseUrl, path) {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function safeError(response) {
  const value = response.json?.error ?? response.json?.message ?? response.text ?? `HTTP ${response.status}`;
  return redactSecrets(String(value).slice(0, 500));
}

function isExistingAccountError(error) {
  const normalized = String(error).toLowerCase();
  return normalized.includes("already registered") || normalized.includes("username is already taken") || normalized.includes("workspace slug is already taken");
}

function redactSecrets(value) {
  return String(value)
    .replace(/shub_user_[a-z0-9_-]+/gi, "[redacted-user-token]")
    .replace(/bearer\s+[a-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/(password|token|secret|api[_-]?key)(["':=\s]+)[^"',\s}]+/gi, "$1$2[redacted]");
}

function sanitizeMarkdown(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
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
    throw new Error("Role-flow run id must be 3-16 chars using lowercase letters, numbers, underscores, or hyphens.");
  }

  return normalized;
}

function normalizeEmailDomain(value) {
  const domain = String(value ?? "").trim().toLowerCase();

  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    throw new Error("Role-flow email domain must look like example.com.");
  }

  return domain;
}

function normalizeUrl(value, label) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : fallback;
}

function parseBoolean(value) {
  return String(value ?? "").trim().toLowerCase() === "true";
}

function loadDotEnv(path) {
  let text;

  try {
    text = require("node:fs").readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
  }
}

function parseArgs(argv) {
  const parsed = {
    allowProductionWrite: false,
    apiUrl: undefined,
    appUrl: undefined,
    databaseUrl: undefined,
    emailDomain: undefined,
    help: false,
    outputDir: undefined,
    password: undefined,
    runId: undefined,
    skipPayoutSeed: false,
    skipScreenshots: false,
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

    if (arg === "--skip-screenshots") {
      parsed.skipScreenshots = true;
      continue;
    }

    if (arg === "--skip-payout-seed") {
      parsed.skipPayoutSeed = true;
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
    if (arg === "--database-url") {
      parsed.databaseUrl = nextValue();
      continue;
    }
    if (arg === "--email-domain") {
      parsed.emailDomain = nextValue();
      continue;
    }
    if (arg === "--output-dir") {
      parsed.outputDir = nextValue();
      continue;
    }
    if (arg === "--password") {
      parsed.password = nextValue();
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
  console.log(`Usage: node scripts/role-flow-qa.mjs [options]

Creates one account per SkillHub role, runs publisher -> review -> developer -> finance role flows,
and writes screenshots plus local documentation into ${DEFAULT_OUTPUT_DIR}.

Options:
  --api-url <url>              Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>              Web app URL. Default: ${DEFAULT_APP_URL}
  --database-url <url>         Optional Postgres URL for seeding payout balance.
  --output-dir <path>          Artifact directory. Default: ${DEFAULT_OUTPUT_DIR}
  --run-id <id>                Stable suffix for generated usernames and slugs.
  --email-domain <domain>      Email domain for generated accounts. Default: ${DEFAULT_EMAIL_DOMAIN}
  --timeout-ms <ms>            Request/browser timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-screenshots           Run API role flow without Playwright screenshots.
  --skip-payout-seed           Skip local mature-balance seeding for payout request proof.
  --allow-production-write     Required for useskillhub.com targets.
  -h, --help                   Show this help.
`);
}

