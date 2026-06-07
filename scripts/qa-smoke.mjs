#!/usr/bin/env node

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_APP_PATHS = [
  "/",
  "/?lang=zh",
  "/marketplace",
  "/skills/browser-research-pro",
  "/publishers",
  "/agents",
  "/docs",
  "/publish",
  "/publisher",
  "/developer",
  "/dashboard",
  "/account",
  "/login",
  "/admin",
  "/terms",
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
  ],
  "/login": [
    "after login",
    "no shared backend password",
    "/developer?lang=en",
    "/publisher?lang=en",
    "/admin?lang=en",
  ],
  "/dashboard": [
    "workspace-command-center",
    "p0-demo-chain",
    "developer workspace",
    "publisher workspace",
    "platform operations",
  ],
  "/publish": [
    "self-service publisher access",
    "preflight repair queue",
    "reviewer evidence packet",
  ],
  "/publisher": [
    "publisher workspace",
    "publisher operations queue",
    "paid marketplace readiness",
    "payout readiness",
  ],
  "/developer": [
    "developer workspace",
    "developer operations queue",
    "team access",
    "webhook",
  ],
  "/admin": [
    "admin operations queue",
    "launch-readiness",
    "review queue",
    "audit",
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

if (!config.skipApi) {
  await checkStats(config);
  await checkAuthProviders(config);
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
    const hasSummary =
      isFiniteNumber(summary?.blocker) &&
      isFiniteNumber(summary?.warning) &&
      isFiniteNumber(summary?.ready) &&
      isFiniteNumber(summary?.deferred);

    if (
      !readiness ||
      typeof readiness !== "object" ||
      !hasSummary ||
      !Array.isArray(readiness.sections)
    ) {
      fail(name, "unexpected readiness payload shape");
      return;
    }

    pass(
      name,
      `blockers=${summary.blocker}, warnings=${summary.warning}, sections=${readiness.sections.length}`,
    );
  } catch (error) {
    fail(
      name,
      `${error.message}${headers ? " (authorization header was redacted)" : ""}`,
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

      const expectedContent = PAGE_ASSERTIONS[path] ?? [];
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
