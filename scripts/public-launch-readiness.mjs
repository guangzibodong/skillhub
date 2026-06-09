#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const checks = [
  {
    file: "docs/public-launch-readiness.md",
    required: [
      "Developer Preview public launch",
      "Public skills: 2",
      "Verified skills: 1",
      "Submitted skills: 1",
      "Callable skills: 1",
      "Paid marketplace operations: prelaunch",
      "Public copy-and-run CLI package: prelaunch",
      "Public copy-and-run SDK package: prelaunch",
    ],
  },
  {
    file: "apps/web/lib/skill-install-state.ts",
    required: [
      "getPublicSkillActionState",
      "verified_gated",
      "inspection_only",
      "authenticated_install",
      "Availability",
    ],
  },
  {
    file: "scripts/qa-smoke.mjs",
    required: [
      "PUBLIC_APP_PATHS_WITH_ANONYMOUS_NAV",
      "validateAnonymousTopNav",
      "submitted skill page is missing inspection-only markers",
      "anonymous top nav exposes old or protected links",
    ],
  },
];

let failed = false;

for (const check of checks) {
  const text = await readFile(check.file, "utf8");
  const missing = check.required.filter((marker) => !text.includes(marker));

  if (missing.length > 0) {
    failed = true;
    console.error(`${check.file} missing: ${missing.join(", ")}`);
  } else {
    console.log(`${check.file}: ok`);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("public launch readiness static checks passed");
}
