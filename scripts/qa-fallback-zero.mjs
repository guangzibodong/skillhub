import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const allowList = new Set([
  "apps/gateway/src/demo-skills.ts",
  "apps/gateway/src/demo-fallback.ts",
  "apps/web/lib/demo-fallback.ts",
  "apps/web/page.legacy.bak",
  "scripts/qa-fallback-zero.mjs",
]);
const patterns = [
  "allowDemoFallback",
  "demoFallback(",
  "provider_deferred",
  "manual_deferred",
  "paid-preview",
  "Paid preview",
  "Paid-preview",
  "provider-deferred",
  "fallbackPublicModels",
  "fallbackPublisherAccountSummary",
  "fallbackOverview",
  "fallbackPublicPublishers",
  "fallbackSkillSummaries",
  "fallbackDeveloperProjects",
  "fallbackPublisherSkills",
  "demoSkills",
];

const files = execFileSync(
  "git",
  [
    "ls-files",
    "apps/gateway/src",
    "apps/web/app",
    "apps/web/components",
    "apps/web/lib",
  ],
  {
    cwd: root,
    encoding: "utf8",
  },
)
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => !allowList.has(file));

const findings = [];

for (const file of files) {
  const source = readFileSync(join(root, file), "utf8");
  const lines = source.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    for (const pattern of patterns) {
      if (line.includes(pattern)) {
        findings.push(`${file}:${index + 1}: ${pattern}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Runtime fallback/demo production gate failed.");
  console.error(findings.slice(0, 200).join("\n"));
  if (findings.length > 200) {
    console.error(`...and ${findings.length - 200} more`);
  }
  process.exit(1);
}

console.log("Runtime fallback/demo production gate passed.");
