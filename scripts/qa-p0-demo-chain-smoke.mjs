#!/usr/bin/env node

import { findSensitiveLeaks, redactSecrets } from "./qa-sensitive-output.mjs";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_VERSION = "0.1.0";
const CURRENT_PUBLISHER_TERMS_VERSION = "2026-06-05-prelaunch-operating-terms";
const DEFAULT_LEDGER_UNIT_AMOUNT_CENTS = 6250;
const runId = Date.now().toString(36);

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

const sharedToken =
  process.env.SKILLHUB_P0_DEMO_TOKEN ??
  process.env.SKILLHUB_SMOKE_TOKEN ??
  process.env.SKILLHUB_USER_TOKEN;

const config = {
  adminToken:
    process.env.SKILLHUB_P0_DEMO_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    sharedToken,
  allowProduction:
    args.allowProduction ||
    parseBoolean(process.env.SKILLHUB_P0_DEMO_ALLOW_PRODUCTION),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_DEMO_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_DEMO_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  developerToken:
    process.env.SKILLHUB_P0_DEMO_DEVELOPER_TOKEN ??
    process.env.SKILLHUB_P0_DEVELOPER_TOKEN ??
    process.env.SKILLHUB_DEVELOPER_SMOKE_TOKEN ??
    sharedToken,
  financeToken:
    process.env.SKILLHUB_P0_DEMO_FINANCE_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_FINANCE_TOKEN ??
    process.env.SKILLHUB_P0_DEMO_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    sharedToken,
  ledgerUnitAmountCents: parsePositiveInteger(
    args.ledgerUnitAmountCents ??
      process.env.SKILLHUB_P0_DEMO_LEDGER_UNIT_AMOUNT_CENTS,
    DEFAULT_LEDGER_UNIT_AMOUNT_CENTS,
  ),
  projectSlug:
    args.projectSlug ??
    process.env.SKILLHUB_P0_DEMO_PROJECT_SLUG ??
    `p0-demo-project-${runId}`,
  publisherToken:
    process.env.SKILLHUB_P0_DEMO_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_P0_PUBLISH_PUBLISHER_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_PUBLISHER_TOKEN ??
    sharedToken,
  reviewerToken:
    process.env.SKILLHUB_P0_DEMO_REVIEWER_TOKEN ??
    process.env.SKILLHUB_P0_DEMO_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_REVIEW_TOKEN ??
    process.env.SKILLHUB_P0_ADMIN_TOKEN ??
    process.env.SKILLHUB_P0_PUBLISH_ADMIN_TOKEN ??
    process.env.SKILLHUB_PUBLISH_SMOKE_ADMIN_TOKEN ??
    process.env.SKILLHUB_ADMIN_SMOKE_TOKEN ??
    sharedToken,
  runtimeUrl:
    args.runtimeUrl ??
    process.env.SKILLHUB_P0_DEMO_RUNTIME_URL ??
    "https://api.useskillhub.com/demo/p0-demo-chain",
  skipApp: args.skipApp,
  skipLedger: args.skipLedger,
  slug:
    args.slug ??
    process.env.SKILLHUB_P0_DEMO_SKILL_SLUG ??
    `p0-demo-chain-${runId}`,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_DEMO_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
  version:
    args.version ?? process.env.SKILLHUB_P0_DEMO_VERSION ?? DEFAULT_VERSION,
};

const results = [];

console.log("SkillHub P0 demo chain smoke");
console.log(`API: ${config.apiUrl}`);
if (!config.skipApp) {
  console.log(`App: ${config.appUrl}`);
}
console.log(`Skill slug: ${config.slug}`);
console.log(`Version: ${config.version}`);
console.log(`Project slug: ${config.projectSlug}`);
if (!config.skipLedger) {
  console.log(`Paid ledger/payout proof: per_call ${config.ledgerUnitAmountCents} cents`);
}
console.log("");

guardProductionWrite(config);

const missingTokens = [
  ["publisher token", config.publisherToken],
  ["reviewer token", config.reviewerToken],
  ["developer token", config.developerToken],
  ["admin token", config.adminToken],
  ...(!config.skipLedger ? [["finance token", config.financeToken]] : []),
].filter(([, value]) => !value);

if (missingTokens.length > 0) {
  for (const [name] of missingTokens) {
    fail(
      name,
      "set SKILLHUB_P0_DEMO_TOKEN or the role-specific SKILLHUB_P0_DEMO_* token for this smoke",
    );
  }
  printSummary(results);
  process.exitCode = 1;
} else {
  if (!config.skipApp) {
    await checkAppShell(config);
  }

  const manifest = buildManifest(config);
  const draft = await createDraft(config, manifest);
  const review = draft ? await submitVersion(config, draft) : null;
  const decision = review ? await approveReview(config, draft, review) : null;
  const commercialReadiness =
    decision && !config.skipLedger
      ? await preparePublisherCommercialReadiness(config)
      : null;
  const paidPrice =
    decision && !config.skipLedger && commercialReadiness
      ? await setActivePerCallPrice(config)
      : null;
  const published =
    decision && (config.skipLedger || paidPrice)
      ? await checkPublicDiscovery(config, draft)
      : null;

  const project = published ? await createDeveloperProject(config) : null;
  const savedSkill = project ? await saveSkill(config) : null;
  const install = savedSkill ? await installSkill(config) : null;
  const apiKey = install ? await createProjectApiKey(config) : null;
  const consoleRuntime = install ? await testProjectRuntime(config) : null;
  const mcpList = apiKey ? await checkMcpToolList(config, apiKey) : null;
  const mcpCall = mcpList ? await callMcpTool(config, apiKey) : null;

  if (project && savedSkill && install && apiKey && consoleRuntime && mcpCall) {
    const ledgerProof = !config.skipLedger
      ? await checkPaidLedgerProof(config, { mcpCall })
      : null;
    const payoutProof = ledgerProof
      ? await checkPayoutWorkflowProof(config, { ledgerProof })
      : null;

    await checkProjectDetail(config, { apiKey, consoleRuntime, mcpCall });
    await checkNotifications(config, { apiKey, ledgerProof, payoutProof, project });
    await checkAdminAuditLogs(config, { apiKey, install, payoutProof, project, review });
    await checkAdminNotificationQueue(config, { ledgerProof, payoutProof });
  }

  printSummary(results);

  if (results.some((result) => result.status === "fail")) {
    process.exitCode = 1;
  }
}

async function checkAppShell({ appUrl, timeoutMs }) {
  const pages = [
    [
      "/",
      [
        "/dashboard?lang=en#workspace-command-center",
        "/developer?lang=en",
        "/publisher?lang=en",
        "/admin?lang=en",
        "where the backend lives",
      ],
    ],
    ["/marketplace", ["after install", "project install", "policy gate"]],
    [
      "/publish",
      [
        "self-service publisher access",
        "preflight repair queue",
        "reviewer evidence packet",
      ],
    ],
    [
      "/developer",
      ["developer workspace", "developer operations queue", "webhook", "team access"],
    ],
    [
      "/admin",
      ["admin operations queue", "launch-readiness", "review queue", "audit"],
    ],
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
      const missing = markers.filter((marker) => !html.includes(marker));

      if (!html.includes("<html") && !html.includes("<!doctype html")) {
        fail(name, "expected an HTML document");
        continue;
      }

      if (missing.length > 0) {
        fail(name, `missing P0 shell markers: ${missing.join(", ")}`);
        continue;
      }

      const mojibakeMarkers = findMojibakeMarkers(response.text);

      if (mojibakeMarkers.length > 0) {
        fail(name, `possible mojibake markers: ${mojibakeMarkers.join(", ")}`);
        continue;
      }

      pass(name, `html bytes=${Buffer.byteLength(response.text, "utf8")}`);
    } catch (error) {
      fail(name, redactSecrets(error.message));
    }
  }
}

async function createDraft({ apiUrl, publisherToken, timeoutMs }, manifest) {
  const name = "POST /v1/skills";

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, "/v1/skills"), {
      body: JSON.stringify({ manifest }),
      headers: authorizedHeaders(publisherToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (
      json?.slug !== manifest.name ||
      json?.version !== manifest.version ||
      typeof json?.versionId !== "string"
    ) {
      fail(name, "unexpected draft payload shape");
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
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      headers: authorizedHeaders(publisherToken),
      method: "POST",
      timeoutMs,
    });

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
      !isFiniteNumber(summary?.blockingCount)
    ) {
      fail(name, "unexpected review submission payload shape");
      return null;
    }

    if (summary.totalCount < 4 || summary.blockingCount > 0) {
      fail(
        name,
        `expected at least 4 non-blocking checks, got total=${summary.totalCount}, blocking=${summary.blockingCount}`,
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

async function approveReview({ apiUrl, reviewerToken, timeoutMs }, draft, review) {
  const path = `/v1/admin/reviews/${encodeURIComponent(review.id)}/decision`;
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        status: "approved",
        notes:
          "P0 demo-chain smoke approved a low-risk generated skill after automated checks passed.",
      }),
      headers: authorizedHeaders(reviewerToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const decision = json?.review;

    if (
      !decision ||
      decision.id !== review.id ||
      decision.skillSlug !== draft.slug ||
      decision.version !== draft.version ||
      decision.status !== "approved" ||
      decision.verificationStatus !== "verified"
    ) {
      fail(name, "unexpected review approval payload shape");
      return null;
    }

    pass(
      name,
      `${draft.slug}@${draft.version} approved and verification=${decision.verificationStatus}`,
    );
    return decision;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublicDiscovery({ apiUrl, skipLedger, slug, timeoutMs, version }) {
  const searchPath = `/v1/skills/search?${new URLSearchParams({
    limit: "20",
    q: slug,
    sort: "recent",
    verificationStatus: "verified",
  })}`;
  const searchName = `GET ${searchPath}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, searchPath), {
      timeoutMs,
    });

    if (status !== 200) {
      fail(searchName, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (!Array.isArray(json?.skills)) {
      fail(searchName, "expected skills array");
      return null;
    }

    const skill = json.skills.find((item) => item?.slug === slug);

    if (!skill || skill.verificationStatus !== "verified") {
      fail(searchName, `missing verified public search row for ${slug}`);
      return null;
    }

    if (!skipLedger && skill.billingModel !== "per_call") {
      fail(searchName, `expected paid per-call discovery row, got pricing=${skill.billingModel}`);
      return null;
    }

    pass(
      searchName,
      `verified marketplace row found, runtime=${skill.runtimeType}, pricing=${skill.billingModel}`,
    );
  } catch (error) {
    fail(searchName, redactSecrets(error.message));
    return null;
  }

  const manifestName = `GET /v1/skills/${slug}`;

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, `/v1/skills/${encodeURIComponent(slug)}`),
      { timeoutMs },
    );

    if (status !== 200) {
      fail(manifestName, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const manifest = json?.manifest ?? json;

    if (manifest?.name !== slug || manifest?.version !== version) {
      fail(manifestName, "unexpected public manifest payload shape");
      return null;
    }

    pass(manifestName, `${slug}@${version} is public after review approval`);
    return manifest;
  } catch (error) {
    fail(manifestName, redactSecrets(error.message));
    return null;
  }
}

async function preparePublisherCommercialReadiness({
  apiUrl,
  publisherToken,
  slug,
  timeoutMs,
}) {
  const profileName = "PUT /v1/publisher/profile";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/profile"),
      {
        body: JSON.stringify({
          displayName: `P0 Demo Chain Publisher ${slug.slice(-6)}`,
          status: "active",
        }),
        headers: authorizedHeaders(publisherToken),
        method: "PUT",
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(profileName, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (json?.publisherProfile?.status !== "active") {
      fail(profileName, "publisher profile did not become active");
      return null;
    }

    pass(profileName, `publisher profile active for ${slug}`);
  } catch (error) {
    fail(profileName, redactSecrets(error.message));
    return null;
  }

  const termsName = "POST /v1/publisher/terms/accept";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/terms/accept"),
      {
        body: JSON.stringify({
          termsVersion: CURRENT_PUBLISHER_TERMS_VERSION,
        }),
        headers: authorizedHeaders(publisherToken),
        method: "POST",
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(termsName, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (
      json?.publisherProfile?.termsVersion !== CURRENT_PUBLISHER_TERMS_VERSION ||
      !json?.publisherProfile?.termsAcceptedAt
    ) {
      fail(termsName, "publisher terms acceptance did not persist");
      return null;
    }

    pass(termsName, `terms accepted: ${CURRENT_PUBLISHER_TERMS_VERSION}`);
  } catch (error) {
    fail(termsName, redactSecrets(error.message));
    return null;
  }

  const onboardingName = "POST /v1/publisher/payout-account/onboarding";
  let onboarding;

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/payout-account/onboarding"),
      {
        body: JSON.stringify({
          provider: "manual_deferred",
        }),
        headers: authorizedHeaders(publisherToken),
        method: "POST",
        timeoutMs,
      },
    );

    if (status !== 201) {
      fail(onboardingName, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    onboarding = json?.onboarding;

    if (!onboarding?.onboardingSession?.id || !onboarding?.payoutAccount?.id) {
      fail(onboardingName, "unexpected payout onboarding payload shape");
      return null;
    }

    const session = onboarding.onboardingSession;
    const account = onboarding.payoutAccount;

    if (account.provider !== "manual_deferred" || session.provider !== "manual_deferred") {
      fail(onboardingName, "payout onboarding used an unexpected provider");
      return null;
    }

    if (!String(session.providerSessionId ?? "").startsWith("po_")) {
      fail(onboardingName, "payout onboarding provider session id is missing or malformed");
      return null;
    }

    const handoffUrlError = validateProviderHandoffUrl(session.onboardingUrl);

    if (handoffUrlError) {
      fail(onboardingName, `payout onboarding URL ${handoffUrlError}`);
      return null;
    }

    if (session.returnUrl != null || session.refreshUrl != null) {
      fail(onboardingName, "default payout onboarding unexpectedly persisted return or refresh URLs");
      return null;
    }

    pass(
      onboardingName,
      `provider-deferred onboarding created: account=...${account.id.slice(-8)} provider/url verified`,
    );
  } catch (error) {
    fail(onboardingName, redactSecrets(error.message));
    return null;
  }

  const completeName = "POST /v1/publisher/payout-account/onboarding/complete";

  try {
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/payout-account/onboarding/complete"),
      {
        body: JSON.stringify({
          reason:
            "P0 demo-chain smoke verified provider-deferred payout readiness before active paid pricing.",
          sessionId: onboarding.onboardingSession.id,
          status: "verified",
        }),
        headers: authorizedHeaders(publisherToken),
        method: "POST",
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(completeName, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (json?.publisher?.publisherProfile?.payoutStatus !== "verified") {
      fail(completeName, "publisher payout readiness did not become verified");
      return null;
    }

    pass(completeName, "publisher payout readiness verified");
    return json.publisher;
  } catch (error) {
    fail(completeName, redactSecrets(error.message));
    return null;
  }
}

async function setActivePerCallPrice({
  apiUrl,
  ledgerUnitAmountCents,
  publisherToken,
  slug,
  timeoutMs,
}) {
  const path = `/v1/skills/${encodeURIComponent(slug)}/prices`;
  const name = `POST ${path} per-call price`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        billingModel: "per_call",
        currency: "usd",
        status: "active",
        unitAmountCents: ledgerUnitAmountCents,
      }),
      headers: authorizedHeaders(publisherToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const price = json?.price;

    if (
      !price ||
      price.billingModel !== "per_call" ||
      price.status !== "active" ||
      price.unitAmountCents !== ledgerUnitAmountCents
    ) {
      fail(name, "unexpected active per-call price payload shape");
      return null;
    }

    pass(
      name,
      `active per-call price ${price.unitAmountCents} ${price.currency}`,
    );
    return price;
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
    const { status, json } = await requestJson(
      joinUrl(apiUrl, "/v1/developer/projects"),
      {
        body: JSON.stringify({
          name: `P0 Demo Chain ${projectSlug}`,
          slug: projectSlug,
        }),
        headers: authorizedHeaders(developerToken),
        method: "POST",
        timeoutMs,
      },
    );

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
  developerToken,
  projectSlug,
  slug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/saved-skills`;
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        collectionName: "p0-demo-chain",
        skillSlug: slug,
      }),
      headers: authorizedHeaders(developerToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const savedSkill = json?.savedSkill;

    if (
      !savedSkill ||
      savedSkill.skillSlug !== slug ||
      savedSkill.projectSlug !== projectSlug
    ) {
      fail(name, "unexpected saved-skill payload shape");
      return null;
    }

    pass(name, `${slug} saved to ${projectSlug}`);
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
  slug,
  timeoutMs,
  version,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/installed-skills`;
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        skillSlug: slug,
        version,
      }),
      headers: authorizedHeaders(developerToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const install = json?.install;

    if (
      !install ||
      install.skillSlug !== slug ||
      install.projectSlug !== projectSlug ||
      install.version !== version ||
      install.status !== "installed" ||
      install.approvalState !== "approved"
    ) {
      fail(name, "unexpected install payload shape");
      return null;
    }

    pass(
      name,
      `${slug}@${version} installed with approval=${install.approvalState}`,
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
      body: JSON.stringify({ name: "P0 demo chain project key" }),
      headers: authorizedHeaders(developerToken),
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
  slug,
  timeoutMs,
}) {
  const path = `/v1/projects/${encodeURIComponent(projectSlug)}/runtime/test`;
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        input: {
          prompt: "Run the P0 demo chain through console governance.",
        },
        skillSlug: slug,
      }),
      headers: authorizedHeaders(developerToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (
      json?.status !== "success" ||
      json?.mode !== "console_test" ||
      json?.skillSlug !== slug ||
      json?.projectSlug !== projectSlug ||
      json?.billable !== false ||
      typeof json?.invocationId !== "string"
    ) {
      fail(name, "unexpected console runtime payload shape");
      return null;
    }

    pass(
      name,
      `console runtime invocation=...${json.invocationId.slice(-8)}, billable=${json.billable}`,
    );
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkMcpToolList({ apiUrl, slug, timeoutMs }, apiKey) {
  const name = "POST /mcp tools/list";

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "p0-demo-tools-list",
        method: "tools/list",
      }),
      headers: authorizedHeaders(apiKey.apiKey),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const tools = json?.result?.tools;
    const tool = Array.isArray(tools)
      ? tools.find((item) => item?.name === slug)
      : null;

    if (!tool || tool?.annotations?.callable !== true) {
      fail(name, `missing callable MCP tool for ${slug}`);
      return null;
    }

    pass(name, `${slug} listed as callable MCP project tool`);
    return tool;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function callMcpTool(
  { apiUrl, ledgerUnitAmountCents, projectSlug, skipLedger, slug, timeoutMs },
  apiKey,
) {
  const name = "POST /mcp tools/call";

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, "/mcp"), {
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "p0-demo-tools-call",
        method: "tools/call",
        params: {
          name: slug,
          arguments: {
            prompt: "Run the P0 demo chain through MCP governance.",
          },
        },
      }),
      headers: authorizedHeaders(apiKey.apiKey),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const structured = json?.result?.structuredContent;

    if (
      json?.error ||
      json?.result?.isError === true ||
      structured?.status !== "success" ||
      structured?.mode !== "agent_runtime" ||
      structured?.projectSlug !== projectSlug ||
      structured?.skillSlug !== slug ||
      typeof structured?.invocationId !== "string"
    ) {
      fail(name, "unexpected MCP call payload shape");
      return null;
    }

    if (
      !skipLedger &&
      (structured.billable !== true ||
        structured.amountCents !== ledgerUnitAmountCents)
    ) {
      fail(
        name,
        `expected billable per-call invocation amount=${ledgerUnitAmountCents}, got billable=${structured.billable}, amount=${structured.amountCents}`,
      );
      return null;
    }

    pass(
      name,
      `MCP runtime invocation=...${structured.invocationId.slice(-8)}, billable=${structured.billable}`,
    );
    return structured;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPaidLedgerProof(config, { mcpCall }) {
  const usageProcess = await processBillableUsage(config);
  const adminTransaction = await checkAdminFinanceLedger(config, usageProcess);
  const publisherTransaction = await checkPublisherFinanceLedger(config, adminTransaction);

  if (!adminTransaction || !publisherTransaction) {
    return null;
  }

  if (adminTransaction.id !== publisherTransaction.id) {
    fail(
      "paid ledger proof transaction match",
      "admin and publisher ledgers did not expose the same posted transaction",
    );
    return null;
  }

  pass(
    "paid ledger proof transaction match",
    `transaction=...${adminTransaction.id.slice(-8)} from invocation=...${mcpCall.invocationId.slice(-8)}`,
  );

  return {
    transaction: adminTransaction,
    usageProcess,
  };
}

async function checkPayoutWorkflowProof(config, { ledgerProof }) {
  const release = await releasePublisherBalances(config);
  const payoutSummary = await checkPublisherPayoutReadiness(config, {
    ledgerProof,
    release,
  });
  const requested = payoutSummary
    ? await requestPublisherPayout(config, { ledgerProof, payoutSummary })
    : null;
  const approved = requested ? await approvePublisherPayout(config, requested) : null;
  const paid = approved ? await markPublisherPayoutPaid(config, approved) : null;
  const publisherPaidSummary = paid
    ? await checkPublisherPaidPayoutSummary(config, paid)
    : null;
  const adminPaidQueue = paid ? await checkAdminPayoutQueue(config, paid) : null;

  if (!paid || !publisherPaidSummary || !adminPaidQueue) {
    return null;
  }

  return {
    adminPaidQueue,
    approved,
    paid,
    publisherPaidSummary,
    release,
    requested,
  };
}

async function releasePublisherBalances({ apiUrl, financeToken, timeoutMs }) {
  const path = "/v1/admin/finance/release-balances";
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({ limit: 100 }),
      headers: authorizedHeaders(financeToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (!isFiniteNumber(json?.releasedCount) || !Array.isArray(json?.balances)) {
      fail(name, "unexpected balance release payload shape");
      return null;
    }

    pass(name, `released ${json.releasedCount} matured publisher balance row(s)`);
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublisherPayoutReadiness(
  { apiUrl, publisherToken, timeoutMs },
  { ledgerProof, release },
) {
  const name = "GET /v1/publisher/payouts request readiness";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/payouts"),
      {
        headers: authorizedHeaders(publisherToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const balances = json?.balances;
    const readiness = json?.readiness;
    const availableCents = Number(balances?.availableCents ?? 0);
    const minPayoutCents = Number(balances?.minPayoutCents ?? 0);

    if (
      !json?.publisherProfile ||
      json.publisherProfile.status !== "active" ||
      json.publisherProfile.payoutStatus !== "verified" ||
      !Array.isArray(json?.payoutAccounts) ||
      !json.payoutAccounts.some((account) => account?.status === "verified") ||
      !readiness ||
      !Array.isArray(readiness.blockers)
    ) {
      fail(name, "publisher payout profile/readiness payload is not verified");
      return null;
    }

    if (!readiness.canRequest || availableCents < minPayoutCents) {
      fail(
        name,
        `payout is not requestable: available=${availableCents}, min=${minPayoutCents}, blockers=${readiness.blockers.join(
          ", ",
        ) || "none"}, released=${release?.releasedCount ?? 0}, transactionShare=${
          ledgerProof.transaction.publisherShareCents
        }`,
      );
      return null;
    }

    if (!assertNoSensitiveLeaks(name, text, "payout summary")) {
      return null;
    }

    pass(
      name,
      `available=${availableCents}, min=${minPayoutCents}, next=${readiness.nextAction}`,
    );
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function requestPublisherPayout(
  { apiUrl, publisherToken, timeoutMs },
  { ledgerProof, payoutSummary },
) {
  const path = "/v1/publisher/payouts";
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({ currency: "usd" }),
      headers: authorizedHeaders(publisherToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 201) {
      fail(name, `expected HTTP 201, got ${status}: ${safeError(json)}`);
      return null;
    }

    const payout = json?.payout;
    const minPayoutCents = Number(payoutSummary?.balances?.minPayoutCents ?? 0);

    if (
      !payout ||
      typeof payout.id !== "string" ||
      !["requested", "review"].includes(payout.status) ||
      payout.nextAction !== "await_finance_review" ||
      !isFiniteNumber(payout.amountCents) ||
      payout.amountCents < minPayoutCents ||
      payout.amountCents < ledgerProof.transaction.publisherShareCents ||
      !isFiniteNumber(payout.balanceCount) ||
      payout.balanceCount < 1
    ) {
      fail(name, "unexpected payout request payload shape");
      return null;
    }

    pass(
      name,
      `payout=...${payout.id.slice(-8)}, status=${payout.status}, amount=${payout.amountCents}`,
    );
    return payout;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function approvePublisherPayout({ apiUrl, financeToken, timeoutMs }, payout) {
  const path = `/v1/admin/payouts/${encodeURIComponent(payout.id)}/decision`;
  const name = `POST ${path} approve`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        action: "approve",
        reason: "P0 demo-chain smoke approved provider-deferred payout request.",
      }),
      headers: authorizedHeaders(financeToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const approved = json?.payout;

    if (
      !approved ||
      approved.id !== payout.id ||
      approved.status !== "processing" ||
      approved.nextAction !== "await_provider_processing"
    ) {
      fail(name, "unexpected payout approval payload shape");
      return null;
    }

    pass(name, `payout=...${approved.id.slice(-8)} moved to processing`);
    return approved;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function markPublisherPayoutPaid({ apiUrl, financeToken, timeoutMs }, payout) {
  const path = `/v1/admin/payouts/${encodeURIComponent(payout.id)}/decision`;
  const name = `POST ${path} mark_paid`;
  const providerReference = `p0-demo-payout-${runId}-${payout.id.slice(-8)}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({
        action: "mark_paid",
        providerReference,
        reason: "P0 demo-chain smoke recorded provider-deferred payout completion.",
      }),
      headers: authorizedHeaders(financeToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const paid = json?.payout;

    if (
      !paid ||
      paid.id !== payout.id ||
      paid.status !== "paid" ||
      paid.nextAction !== "complete" ||
      paid.providerReference !== providerReference
    ) {
      fail(name, "unexpected paid payout payload shape");
      return null;
    }

    pass(name, `payout=...${paid.id.slice(-8)} marked paid with provider reference`);
    return paid;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublisherPaidPayoutSummary(
  { apiUrl, publisherToken, timeoutMs },
  paidPayout,
) {
  const name = "GET /v1/publisher/payouts paid proof";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/payouts"),
      {
        headers: authorizedHeaders(publisherToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const payout = json?.payouts?.find((item) => item?.id === paidPayout.id);

    if (
      !payout ||
      payout.status !== "paid" ||
      payout.providerReference !== paidPayout.providerReference ||
      Number(json?.balances?.paidCents ?? 0) < paidPayout.amountCents
    ) {
      fail(name, "publisher payout summary did not expose the paid payout");
      return null;
    }

    if (!assertNoSensitiveLeaks(name, text, "paid payout")) {
      return null;
    }

    pass(name, `publisher sees paid payout=...${payout.id.slice(-8)}`);
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkAdminPayoutQueue({ apiUrl, financeToken, timeoutMs }, paidPayout) {
  const name = "GET /v1/admin/payouts paid queue proof";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/payouts?limit=100"),
      {
        headers: authorizedHeaders(financeToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const payout = json?.payouts?.find((item) => item?.id === paidPayout.id);

    if (
      !payout ||
      payout.status !== "paid" ||
      payout.nextAction !== "complete" ||
      payout.providerReference !== paidPayout.providerReference
    ) {
      fail(name, "admin payout queue did not expose the paid payout");
      return null;
    }

    if (!assertNoSensitiveLeaks(name, text, "admin payout")) {
      return null;
    }

    pass(name, `admin queue sees paid payout=...${payout.id.slice(-8)}`);
    return payout;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function processBillableUsage({ apiUrl, financeToken, timeoutMs }) {
  const path = "/v1/admin/finance/process-usage";
  const name = `POST ${path}`;

  try {
    const { status, json } = await requestJson(joinUrl(apiUrl, path), {
      body: JSON.stringify({ limit: 25 }),
      headers: authorizedHeaders(financeToken),
      method: "POST",
      timeoutMs,
    });

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    if (!isFiniteNumber(json?.processedCount) || !Array.isArray(json?.processed)) {
      fail(name, "unexpected billable usage processing payload shape");
      return null;
    }

    if (json.processedCount < 1) {
      pass(name, "no queued usage processed; checking ledger for an already-posted transaction");
      return json;
    }

    pass(name, `processed ${json.processedCount} billable usage event(s)`);
    return json;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkAdminFinanceLedger(
  { apiUrl, financeToken, ledgerUnitAmountCents, slug, timeoutMs },
  usageProcess,
) {
  const name = "GET /v1/admin/finance/ledger paid usage row";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/finance/ledger"),
      {
        headers: authorizedHeaders(financeToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const transaction = findLedgerTransaction(json, slug, ledgerUnitAmountCents);

    if (!transaction) {
      fail(name, `missing posted usage transaction for ${slug}`);
      return null;
    }

    const splitOk =
      isFiniteNumber(transaction.platformFeeCents) &&
      isFiniteNumber(transaction.publisherShareCents) &&
      transaction.platformFeeCents + transaction.publisherShareCents ===
        transaction.grossCents;

    if (!splitOk) {
      fail(name, "transaction split does not add back to gross amount");
      return null;
    }

    if (!["pending", "available"].includes(String(transaction.balanceState))) {
      fail(name, `expected pending/available publisher balance, got ${transaction.balanceState}`);
      return null;
    }

    if (!assertNoSensitiveLeaks(name, text, "finance")) {
      return null;
    }

    const processedHint = usageProcess?.processedCount ?? 0;

    pass(
      name,
      `usage transaction=...${transaction.id.slice(-8)}, gross=${transaction.grossCents}, processed=${processedHint}`,
    );
    return transaction;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

async function checkPublisherFinanceLedger(
  { apiUrl, ledgerUnitAmountCents, publisherToken, slug, timeoutMs },
  adminTransaction,
) {
  const name = "GET /v1/publisher/finance/ledger paid usage row";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/publisher/finance/ledger"),
      {
        headers: authorizedHeaders(publisherToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return null;
    }

    const transaction = findLedgerTransaction(json, slug, ledgerUnitAmountCents);

    if (!transaction) {
      fail(name, `missing publisher ledger row for ${slug}`);
      return null;
    }

    if (adminTransaction && transaction.id !== adminTransaction.id) {
      fail(name, "publisher ledger row does not match the admin ledger transaction");
      return null;
    }

    if (!assertNoSensitiveLeaks(name, text, "publisher ledger")) {
      return null;
    }

    pass(
      name,
      `publisher sees transaction=...${transaction.id.slice(-8)}, share=${transaction.publisherShareCents}`,
    );
    return transaction;
  } catch (error) {
    fail(name, redactSecrets(error.message));
    return null;
  }
}

function findLedgerTransaction(json, slug, amountCents) {
  if (!Array.isArray(json?.recentTransactions)) {
    return null;
  }

  return (
    json.recentTransactions.find(
      (item) =>
        item?.sourceType === "usage" &&
        item?.skillSlug === slug &&
        item?.grossCents === amountCents &&
        item?.status === "posted",
    ) ?? null
  );
}

async function checkProjectDetail(
  { apiUrl, developerToken, projectSlug, slug, timeoutMs },
  { apiKey, consoleRuntime, mcpCall },
) {
  const path = `/v1/developer/projects/${encodeURIComponent(projectSlug)}`;
  const name = `GET ${path}`;

  try {
    const { status, json, text } = await requestJson(joinUrl(apiUrl, path), {
      headers: authorizedHeaders(developerToken),
      timeoutMs,
    });

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
      (item) => item?.skillSlug === slug,
    );
    const listedKey = detail.apiKeys?.find((item) => item?.id === apiKey.id);
    const saved = detail.savedSkills?.find((item) => item?.skillSlug === slug);
    const invocationIds = new Set([
      consoleRuntime.invocationId,
      mcpCall.invocationId,
    ]);
    const seenInvocations = detail.recentInvocations?.filter((item) =>
      invocationIds.has(item?.id),
    );

    if (!installed || !listedKey || !saved || seenInvocations?.length < 2) {
      fail(
        name,
        `missing project state: ${[
          installed ? null : "install",
          listedKey ? null : "apiKey",
          saved ? null : "savedSkill",
          seenInvocations?.length >= 2 ? null : "runtimeInvocations",
        ]
          .filter(Boolean)
          .join(", ")}`,
      );
      return;
    }

    if ("apiKey" in listedKey) {
      fail(name, "listed project key must not expose raw API key after reveal");
      return;
    }

    if (!assertNoSensitiveLeaks(name, text, "project detail")) {
      return;
    }

    pass(
      name,
      `project detail includes saved/install/key plus console and MCP runtime logs for ${slug}`,
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkNotifications(
  { apiUrl, developerToken, publisherToken, projectSlug, slug, timeoutMs, version },
  { apiKey, ledgerProof, payoutProof, project },
) {
  await checkPublisherNotifications({
    apiUrl,
    ledgerProof,
    payoutProof,
    publisherToken,
    slug,
    timeoutMs,
    version,
  });
  await checkDeveloperNotifications({
    apiKey,
    apiUrl,
    developerToken,
    project,
    projectSlug,
    slug,
    timeoutMs,
  });
}

async function checkPublisherNotifications({
  apiUrl,
  ledgerProof,
  payoutProof,
  publisherToken,
  slug,
  timeoutMs,
  version,
}) {
  const name = "GET /v1/notifications publisher review events";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/notifications?limit=100"),
      {
        headers: authorizedHeaders(publisherToken),
        timeoutMs,
      },
    );

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
        "skill.review.submitted",
        (item) =>
          item?.payload?.skillSlug === slug &&
          item?.payload?.version === version,
      ],
      [
        "skill.review.approved",
        (item) =>
          item?.payload?.skillSlug === slug &&
          item?.payload?.version === version,
      ],
      ...(ledgerProof
        ? [
            [
              "billing.usage_posted",
              (item) =>
                item?.payload?.transactionId === ledgerProof.transaction.id,
            ],
          ]
        : []),
      ...(payoutProof
        ? [
            [
              `payout.${payoutProof.requested.status}`,
              (item) => item?.payload?.payoutId === payoutProof.requested.id,
            ],
            [
              "payout.approve",
              (item) => item?.payload?.payoutId === payoutProof.paid.id,
            ],
            [
              "payout.mark_paid",
              (item) => item?.payload?.payoutId === payoutProof.paid.id,
            ],
          ]
        : []),
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
      fail(name, `missing publisher notifications: ${missing.join(", ")}`);
      return;
    }

    if (!assertNoSensitiveLeaks(name, text, "publisher notifications")) {
      return;
    }

    pass(name, `publisher review notifications visible for ${slug}@${version}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkDeveloperNotifications({
  apiKey,
  apiUrl,
  developerToken,
  project,
  projectSlug,
  slug,
  timeoutMs,
}) {
  const name = "GET /v1/notifications developer project events";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/notifications?limit=100"),
      {
        headers: authorizedHeaders(developerToken),
        timeoutMs,
      },
    );

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
          item?.payload?.skillSlug === slug,
      ],
      [
        "project_install.installed",
        (item) =>
          item?.payload?.projectSlug === projectSlug &&
          item?.payload?.skillSlug === slug,
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

    if (!assertNoSensitiveLeaks(name, text, "developer notifications")) {
      return;
    }

    pass(name, `developer project notifications visible for ${projectSlug}`);
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminAuditLogs(
  { adminToken, apiUrl, projectSlug, slug, timeoutMs, version },
  { apiKey, install, payoutProof, project, review },
) {
  const name = "GET /v1/admin/audit-logs";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/audit-logs?limit=100"),
      {
        headers: authorizedHeaders(adminToken),
        timeoutMs,
      },
    );

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
        "skill.version.created",
        (item) =>
          item?.metadata?.skillSlug === slug &&
          item?.metadata?.version === version,
      ],
      [
        "skill.review.submitted",
        (item) =>
          item?.entityId === review.id &&
          item?.metadata?.skillSlug === slug &&
          item?.metadata?.version === version,
      ],
      [
        "review.approved",
        (item) =>
          item?.entityId === review.id &&
          item?.metadata?.skillSlug === slug &&
          item?.metadata?.verificationStatus === "verified",
      ],
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
          item?.metadata?.skillSlug === slug,
      ],
      [
        "project_install.installed",
        (item) =>
          item?.entityId === install.id &&
          item?.metadata?.projectSlug === projectSlug &&
          item?.metadata?.skillSlug === slug,
      ],
      [
        "project_api_key.created",
        (item) =>
          item?.entityId === apiKey.id &&
          item?.metadata?.keyLast4 === apiKey.keyLast4,
      ],
      ...(payoutProof
        ? [
            [
              "payout.requested",
              (item) =>
                item?.entityId === payoutProof.requested.id &&
                item?.metadata?.balanceCount === payoutProof.requested.balanceCount,
            ],
            [
              "payout.approve",
              (item) =>
                item?.entityId === payoutProof.paid.id &&
                item?.metadata?.previousStatus === payoutProof.requested.status,
            ],
            [
              "payout.mark_paid",
              (item) =>
                item?.entityId === payoutProof.paid.id &&
                item?.metadata?.providerReference === payoutProof.paid.providerReference,
            ],
          ]
        : []),
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

    if (!assertNoSensitiveLeaks(name, text, "audit")) {
      return;
    }

    pass(
      name,
      "audit records publish, review, install, key, and project handoff",
    );
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

async function checkAdminNotificationQueue(
  { adminToken, apiUrl, timeoutMs },
  { ledgerProof, payoutProof } = {},
) {
  const name = "GET /v1/admin/notifications";

  try {
    const { status, json, text } = await requestJson(
      joinUrl(apiUrl, "/v1/admin/notifications?limit=100"),
      {
        headers: authorizedHeaders(adminToken),
        timeoutMs,
      },
    );

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}: ${safeError(json)}`);
      return;
    }

    if (!Array.isArray(json?.notifications)) {
      fail(name, "expected notifications array");
      return;
    }

    const required = [
      "skill.review.submitted",
      "skill.review.approved",
      ...(ledgerProof ? ["billing.usage_posted"] : []),
      ...(payoutProof
        ? [
            `payout.${payoutProof.requested.status}`,
            "payout.approve",
            "payout.mark_paid",
          ]
        : []),
    ];
    const missing = required.filter(
      (eventType) =>
        !json.notifications.some((item) => item?.eventType === eventType),
    );

    if (missing.length > 0) {
      fail(name, `missing admin notification event types: ${missing.join(", ")}`);
      return;
    }

    if (!assertNoSensitiveLeaks(name, text, "notification")) {
      return;
    }

    pass(name, "admin notification queue includes review handoff events");
  } catch (error) {
    fail(name, redactSecrets(error.message));
  }
}

function buildManifest({ runtimeUrl, slug, version }) {
  return {
    schemaVersion: "0.1",
    name: slug,
    displayName: `P0 Demo Chain ${slug.slice(-6)}`,
    version,
    description:
      "Generated low-risk skill used to prove the complete SkillHub P0 demo chain from publisher submission to developer runtime invocation.",
    author: {
      name: "SkillHub QA",
      url: "https://useskillhub.com",
    },
    tags: ["qa", "p0", "demo-chain"],
    runtime: {
      type: "http",
      entrypoint: runtimeUrl,
    },
    permissions: {
      network: false,
      browser: false,
      filesystem: "none",
      secrets: [],
    },
    inputSchema: {
      type: "object",
      required: ["prompt"],
      properties: {
        prompt: {
          type: "string",
        },
      },
    },
    outputSchema: {
      type: "object",
      required: ["message"],
      properties: {
        message: {
          type: "string",
        },
      },
    },
    examples: [
      {
        input: {
          prompt: "Verify the SkillHub P0 demo chain.",
        },
        output: {
          message: "P0 demo chain verified.",
        },
      },
    ],
    support: {
      email: "support@useskillhub.com",
    },
  };
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

function authorizedHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function guardProductionWrite({ allowProduction, apiUrl }) {
  if (allowProduction || !isProductionUrl(apiUrl)) {
    return;
  }

  fail(
    "production write guard",
    "refusing to run mutating P0 demo-chain smoke against production API without --allow-production",
  );
  printSummary(results);
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

function validateProviderHandoffUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "is missing";
  }

  try {
    const url = new URL(value);
    const localhost =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]";

    if (url.username || url.password) {
      return "includes embedded credentials";
    }

    if (url.protocol !== "https:" && !(url.protocol === "http:" && localhost)) {
      return "must use https except for local development URLs";
    }

    return "";
  } catch {
    return "is not a valid URL";
  }
}

function parseArgs(argv) {
  const parsed = {
    allowProduction: false,
    apiUrl: undefined,
    appUrl: undefined,
    help: false,
    ledgerUnitAmountCents: undefined,
    projectSlug: undefined,
    runtimeUrl: undefined,
    skipApp: false,
    skipLedger: false,
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

    if (arg === "--skip-app") {
      parsed.skipApp = true;
      continue;
    }

    if (arg === "--skip-ledger") {
      parsed.skipLedger = true;
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

    if (arg === "--project-slug") {
      parsed.projectSlug = normalizeSlug(nextValue());
      continue;
    }

    if (arg === "--runtime-url") {
      parsed.runtimeUrl = nextValue().trim();
      continue;
    }

    if (arg === "--ledger-unit-amount-cents") {
      parsed.ledgerUnitAmountCents = nextValue();
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

function assertNoSensitiveLeaks(name, text, label) {
  const leaks = findSensitiveLeaks(text);

  if (leaks.length > 0) {
    fail(name, `possible sensitive ${label} leak: ${leaks[0]}`);
    return false;
  }

  return true;
}

function findMojibakeMarkers(text) {
  const markers = [
    "\uFFFD",
    "\u9359\u621D",
    "\u5BEE\u20AC",
    "\u7039\u2103",
    "\u7490\uFE40",
    "\u9418\u8235",
    "\u93B6\u20AC",
    "\u6D93\u20AC",
  ];

  return markers
    .filter((marker) => text.includes(marker))
    .map(formatMarkerCodepoints);
}

function formatMarkerCodepoints(marker) {
  return [...marker]
    .map(
      (character) =>
        `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
    )
    .join("+");
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
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
  console.log(`Usage: node scripts/qa-p0-demo-chain-smoke.mjs [options]

Mutating end-to-end P0 demo smoke:
  publisher draft -> exact-version review -> admin approval -> public discovery
  -> developer project save/install -> reveal-once key -> console runtime test
  -> MCP tools/list and tools/call -> paid ledger posting -> payout request
  -> finance approve/mark paid -> notifications and admin audit proof.

Options:
  --api-url <url>          Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>          Web app URL. Default: ${DEFAULT_APP_URL}
  --slug <slug>            Skill slug to create. Default: generated p0-demo-chain-*
  --version <version>      Semantic version. Default: ${DEFAULT_VERSION}
  --project-slug <slug>    Developer project slug. Default: generated p0-demo-project-*
  --runtime-url <url>      Manifest HTTP runtime URL. Default: HTTPS demo URL
  --ledger-unit-amount-cents <n>
                           Active per-call price used for paid ledger proof.
                           Default: ${DEFAULT_LEDGER_UNIT_AMOUNT_CENTS}
  --timeout-ms <ms>        Per-request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-app               Skip public/app shell marker checks.
  --skip-ledger            Skip paid price, billable invocation, ledger, balance, and payout proof.
  --allow-production       Allow writes against https://api.useskillhub.com.
  -h, --help               Show this help.

Tokens:
  Set SKILLHUB_P0_DEMO_TOKEN for a single org-scoped admin or super-admin token,
  or use split role tokens:
    SKILLHUB_P0_DEMO_PUBLISHER_TOKEN
    SKILLHUB_P0_DEMO_REVIEWER_TOKEN
    SKILLHUB_P0_DEMO_DEVELOPER_TOKEN
    SKILLHUB_P0_DEMO_FINANCE_TOKEN
    SKILLHUB_P0_DEMO_ADMIN_TOKEN

Production writes are blocked unless --allow-production or
SKILLHUB_P0_DEMO_ALLOW_PRODUCTION=true is set. Do not commit tokens or paste token
values into reports; this script redacts authorization-shaped strings in output.
`);
}
