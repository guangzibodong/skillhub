#!/usr/bin/env node

import { spawn } from "node:child_process";

const DEFAULT_API_URL = "http://localhost:8787";
const DEFAULT_APP_URL = "http://localhost:3000";
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
  allowProductionWrite:
    args.allowProduction ||
    parseBoolean(process.env.SKILLHUB_P0_REAL_FLOW_ALLOW_PRODUCTION_WRITE),
  apiUrl:
    args.apiUrl ??
    process.env.SKILLHUB_P0_REAL_FLOW_API_URL ??
    process.env.SKILLHUB_SMOKE_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.SKILLHUB_API_URL ??
    DEFAULT_API_URL,
  appUrl:
    args.appUrl ??
    process.env.SKILLHUB_P0_REAL_FLOW_APP_URL ??
    process.env.SKILLHUB_SMOKE_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_APP_URL,
  databaseUrl:
    args.databaseUrl ??
    process.env.SKILLHUB_P0_REAL_FLOW_DATABASE_URL ??
    process.env.DATABASE_URL,
  outputDir:
    args.outputDir ??
    process.env.SKILLHUB_P0_REAL_FLOW_OUTPUT_DIR ??
    "examples/p0-real-flow-qa",
  runId:
    args.runId ??
    process.env.SKILLHUB_P0_REAL_FLOW_RUN_ID ??
    `p0real${Date.now().toString(36).slice(-6)}`,
  skipApp: args.skipApp,
  skipLedger: args.skipLedger,
  skipStatic: args.skipStatic,
  timeoutMs: parsePositiveInteger(
    args.timeoutMs ?? process.env.SKILLHUB_P0_REAL_FLOW_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
  ),
};

const steps = [];

if (!config.skipStatic) {
  steps.push({
    args: ["scripts/qa-fallback-zero.mjs"],
    name: "runtime fallback zero gate",
  });
  steps.push({
    args: ["scripts/qa-production-copy.mjs"],
    name: "production copy/state gate",
  });
}

steps.push({
  args: [
    "scripts/qa-smoke.mjs",
    "--api-url",
    config.apiUrl,
    "--app-url",
    config.appUrl,
    "--timeout-ms",
    String(config.timeoutMs),
    ...(config.skipApp ? ["--skip-app"] : []),
  ],
  name: "public API and app smoke",
});

steps.push({
  args: [
    "scripts/role-flow-qa.mjs",
    "--api-url",
    config.apiUrl,
    "--app-url",
    config.appUrl,
    "--output-dir",
    config.outputDir,
    "--run-id",
    config.runId,
    "--timeout-ms",
    String(config.timeoutMs),
    ...(config.databaseUrl ? ["--database-url", config.databaseUrl] : []),
    ...(config.skipApp ? ["--skip-screenshots"] : []),
    ...(config.allowProductionWrite ? ["--allow-production-write"] : []),
    ...(config.skipLedger ? ["--skip-payout-seed"] : []),
  ],
  name: "real cross-role API flow",
});

console.log("SkillHub P0 real-flow smoke");
console.log(`API: ${config.apiUrl}`);
console.log(`App: ${config.appUrl}`);
console.log(`Run id: ${config.runId}`);
console.log(`Output: ${config.outputDir}`);
console.log(`Steps: ${steps.map((step) => step.name).join(" -> ")}`);
console.log("");

for (const step of steps) {
  const result = await runStep(step);

  if (result !== 0) {
    console.log("");
    console.log(`Real-flow smoke stopped: ${step.name} failed with exit code ${result}`);
    process.exit(result);
  }
}

console.log("");
console.log(`P0 real-flow smoke passed (${steps.length} steps)`);

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
    databaseUrl: undefined,
    help: false,
    outputDir: undefined,
    runId: undefined,
    skipApp: false,
    skipLedger: false,
    skipStatic: false,
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

    if (arg === "--allow-production" || arg === "--allow-production-write") {
      parsed.allowProduction = true;
      continue;
    }

    if (arg === "--skip-app") {
      parsed.skipApp = true;
      continue;
    }

    if (arg === "--skip-ledger" || arg === "--skip-payout-seed") {
      parsed.skipLedger = true;
      continue;
    }

    if (arg === "--skip-static") {
      parsed.skipStatic = true;
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

    if (arg === "--output-dir") {
      parsed.outputDir = nextValue();
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

    if (
      arg === "--runtime-url" ||
      arg === "--slug" ||
      arg === "--version" ||
      arg === "--project-slug" ||
      arg === "--ledger-unit-amount-cents"
    ) {
      nextValue();
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

function parseBoolean(value) {
  return ["1", "true", "yes", "on"].includes(String(value ?? "").trim().toLowerCase());
}

function printHelp() {
  console.log(`Usage: node scripts/qa-p0-real-flow-smoke.mjs [options]

Runs the production-oriented P0 real-flow gate:
  fallback-zero -> production-copy -> public smoke -> cross-role real API flow.

Options:
  --api-url <url>              Gateway API URL. Default: ${DEFAULT_API_URL}
  --app-url <url>              Web app URL. Default: ${DEFAULT_APP_URL}
  --database-url <url>         Optional Postgres URL for local mature-balance seeding.
  --output-dir <dir>           Artifact directory. Default: examples/p0-real-flow-qa
  --run-id <id>                Stable id for generated test data.
  --timeout-ms <ms>            Per-request timeout. Default: ${DEFAULT_TIMEOUT_MS}
  --skip-app                   Skip web screenshot/page checks.
  --skip-ledger                Skip local payout-balance seeding in the role flow.
  --skip-static                Skip fallback-zero and production-copy static gates.
  --allow-production-write     Allow mutating role-flow requests against production.
  -h, --help                   Show this help.

Environment:
  SKILLHUB_SERVICE_TOKEN or SKILLHUB_ADMIN_TOKEN is required by role-flow QA
  so the script can create real role-scoped accounts through the service API.
`);
}
