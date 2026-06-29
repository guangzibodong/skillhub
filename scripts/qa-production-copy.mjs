import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const allowList = new Set([
  "apps/web/app/page.tsx",
  "apps/web/app/admin/page.tsx",
  "apps/web/app/admin/admin-panel-switcher.tsx",
  "apps/web/components/home/product-preview.tsx",
  "apps/web/components/growth-page.tsx",
  "apps/web/components/not-found-content.tsx",
  "apps/web/components/operating-evidence-chain.tsx",
  "apps/web/components/site-header-client.tsx",
  "apps/web/lib/agent-prompt-actions.ts",
  "apps/web/lib/i18n.ts",
  "apps/web/lib/launch-public-pages.ts",
  "apps/web/lib/notification-delivery-actions.ts",
  "apps/web/lib/product-stage.ts",
  "apps/web/lib/webhook-delivery-actions.ts",
  "scripts/qa-production-copy.mjs",
]);
const patterns = [
  "Launch Preview",
  "manual onboarding",
  "manual_deferred",
  "not generally available",
  "payment capture is prelaunch",
  "provider_deferred",
  "provider-deferred",
  "paid-preview",
  "Paid preview",
  "Paid-preview",
  "paid preview",
  "self-service checkout yet",
];

const files = execFileSync(
  "git",
  [
    "ls-files",
    "apps/web/app",
    "apps/web/components",
    "apps/web/lib",
    "apps/gateway/src",
    "scripts",
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
  console.error("Production copy/state scan failed.");
  console.error(findings.slice(0, 200).join("\n"));
  if (findings.length > 200) {
    console.error(`...and ${findings.length - 200} more`);
  }
  process.exit(1);
}

console.log("Production copy/state scan passed.");
