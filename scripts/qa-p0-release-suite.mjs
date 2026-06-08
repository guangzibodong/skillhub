#!/usr/bin/env node

import { spawn } from "node:child_process";

const DEFAULT_LOCAL_API_URL = "http://localhost:8787";
const DEFAULT_LOCAL_APP_URL = "http://localhost:3000";
const DEFAULT_PROD_API_URL = "https://api.useskillhub.com";
const DEFAULT_PROD_APP_URL = "https://useskillhub.com";
const DEFAULT_TIMEOUT_MS = 30000;

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
  allowProduction: args.allowProduction,
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_RELEASE_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    (args.prod ? DEFAULT_PROD_API_URL : DEFAULT_LOCAL_API_URL),
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_RELEASE_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    (args.prod ? DEFAULT_PROD_APP_URL : DEFAULT_LOCAL_APP_URL),
  includeDemo: args.includeDemo,
  includeDeveloper: args.includeDeveloper || args.includeMutating,
  includePublish: args.includePublish || args.includeMutating,
  skipAdmin: args.skipAdmin,
  skipApi: args.skipApi,
  skipApp: args.skipApp,
  skipDemoLedger: args.skipDemoLedger,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_RELEASE_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
};

const steps = buildSteps(config);

console.log("SkillHub P0 release smoke suite");
console.log(`API: ${config.apiUrl}`);
console.log(`App: ${config.appUrl}`);
console.log(`Steps: ${steps.map((step) => step.name).join(" -> ")}`);
console.log("");

for (const step of steps) {
  const result = await runStep(step);

  if (result !== 0) {
    console.log("");
    console.log(`Suite stopped: ${step.name} failed with exit code ${result}`);
    process.exitCode = result;
    break;
  }
}

if (!process.exitCode) {
  console.log("");
  console.log(`P0 release suite passed (${steps.length} steps)`);
}

function buildSteps({
  allowProduction,
  apiUrl,
  appUrl,
  includeDemo,
  includeDeveloper,
  includePublish,
  skipAdmin,
  skipApi,
  skipApp,
  skipDemoLedger,
  timeoutMs,
}) {
  const sharedArgs = [
    "--api-url",
    apiUrl,
    "--app-url",
    appUrl,
    "--timeout-ms",
    String(timeoutMs),
  ];
  const steps = [
    {
      args: [
        "scripts/qa-smoke.mjs",
        ...sharedArgs,
        ...(skipApi ? ["--skip-api"] : []),
        ...(skipApp ? ["--skip-app"] : []),
      ],
      name: "public production-safe smoke",
    },
  ];

  if (!skipAdmin) {
    steps.push({
      args: [
        "scripts/qa-p0-admin-operations-smoke.mjs",
        ...sharedArgs,
        ...(skipApp ? ["--skip-app"] : []),
      ],
      name: "Journey C admin operations smoke",
    });
  }

  if (includeDeveloper) {
    steps.push({
      args: [
        "scripts/qa-p0-developer-handoff-smoke.mjs",
        ...sharedArgs,
        ...(skipApp ? ["--skip-app"] : []),
        ...(allowProduction ? ["--allow-production"] : []),
      ],
      name: "Journey A developer handoff smoke",
    });
  }

  if (includePublish) {
    steps.push({
      args: [
        "scripts/qa-p0-publish-handoff-smoke.mjs",
        ...sharedArgs,
        ...(skipApp ? ["--skip-app"] : []),
        ...(allowProduction ? ["--allow-production"] : []),
      ],
      name: "Journey B publish handoff smoke",
    });
  }

  if (includeDemo) {
    steps.push({
      args: [
        "scripts/qa-p0-demo-chain-smoke.mjs",
        ...sharedArgs,
        ...(skipApp ? ["--skip-app"] : []),
        ...(skipDemoLedger ? ["--skip-ledger"] : []),
        ...(allowProduction ? ["--allow-production"] : []),
      ],
      name: "P0 end-to-end demo-chain smoke",
    });
  }

  return steps;
}

function runStep({ args, name }) {
  console.log(`==> ${name}`);
  console.log(`node ${args.join(" ")}`);

  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      env: process.env,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", (error) => {
      console.error(`Failed to start ${name}: ${error.message}`);
      resolve(1);
    });
  });
}

function parseArgs(argv) {
  const parsed = {
    allowProduction: false,
    apiUrl: undefined,
    appUrl: undefined,
    help: false,
    includeDemo: false,
    includeDeveloper: false,
    includeMutating: false,
    includePublish: false,
    prod: false,
    skipAdmin: false,
    skipApi: false,
    skipApp: false,
    skipDemoLedger: false,
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

    if (arg === "--prod") {
      parsed.prod = true;
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

    if (arg === "--skip-admin") {
      parsed.skipAdmin = true;
      continue;
    }

    if (arg === "--include-developer") {
      parsed.includeDeveloper = true;
      continue;
    }

    if (arg === "--include-publish") {
      parsed.includePublish = true;
      continue;
    }

    if (arg === "--include-mutating") {
      parsed.includeMutating = true;
      continue;
    }

    if (arg === "--include-demo") {
      parsed.includeDemo = true;
      continue;
    }

    if (arg === "--skip-demo-ledger") {
      parsed.skipDemoLedger = true;
      continue;
    }

    if (arg === "--allow-production") {
      parsed.allowProduction = true;
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

    if (arg === "--timeout-ms") {
      parsed.timeoutMs = nextValue();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function printHelp() {
  console.log(`Usage: node scripts/qa-p0-release-suite.mjs [options]

Runs the P0 release gate in a safe order. By default it runs the public
production-safe smoke plus the non-mutating Journey C admin operations smoke.
Mutating Journey A, Journey B, and demo-chain checks are opt-in.

Production modes:
  Routine 1Panel public gate:
    pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
    Performs no writes and does not require an operator token.
    The public smoke includes the production web alias gate for www/app.

  Full protected Journey C gate:
    pnpm smoke:p0 -- --prod --timeout-ms 30000
    Requires an admin/super-admin user token already configured in the shell.

Options:
  --prod                 Use https://api.useskillhub.com and https://useskillhub.com.
  --api-url <url>        Gateway API URL. Overrides --prod.
  --app-url <url>        Web app URL. Overrides --prod.
  --timeout-ms <ms>      Request timeout for child smoke scripts. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-api             Pass through to the public smoke only.
  --skip-app             Skip web page checks in child smoke scripts.
  --skip-admin           Skip the non-mutating Journey C admin smoke.
  --include-developer    Include the mutating Journey A developer handoff smoke.
  --include-publish      Include the mutating Journey B publish handoff smoke.
  --include-mutating     Include both Journey A and Journey B mutating smokes.
  --include-demo         Include the mutating full P0 demo-chain smoke.
  --skip-demo-ledger     Pass --skip-ledger to the demo-chain smoke.
  --allow-production     Pass --allow-production to selected mutating smokes.
  -h, --help             Show this help.

Environment:
  SKILLHUB_P0_RELEASE_API_URL and SKILLHUB_P0_RELEASE_APP_URL can set default targets.
  SKILLHUB_P0_RELEASE_TIMEOUT_MS can set the default timeout.
  Child scripts keep their own token variables, redaction, and production-write guards.

Examples:
  pnpm smoke:p0 -- --prod --skip-admin --timeout-ms 30000
  pnpm smoke:p0 -- --prod --timeout-ms 30000
  pnpm smoke:p0 -- --include-mutating
  pnpm smoke:p0 -- --include-demo --skip-demo-ledger
`);
}
