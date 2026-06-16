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
      "/support?lang=en",
      "/report?lang=en",
      "/security?lang=en",
      "/status?lang=en",
      "secrets, API keys, passwords, or private user data",
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
      "Project adoption readiness",
      "Project use, execution, subscription, billing, and financial operations stay unavailable",
    ],
  },
  {
    file: "scripts/qa-smoke.mjs",
    required: [
      "PUBLIC_APP_PATHS_WITH_ANONYMOUS_NAV",
      "validateAnonymousTopNav",
      "validatePublicLaunchPageState",
      "login page exposes internal token fallback wording",
      "submitted skill page is missing inspection-only markers",
      "anonymous top nav exposes old or protected links",
    ],
  },
  {
    file: "scripts/qa-public-anonymous.mjs",
    required: [
      "DEFAULT_PATHS",
      "/docs?lang=en",
      "/registry?lang=zh",
      "checkPublicCommands",
      "checkPrimaryCtas",
      "checkSkillCards",
      "login page missing normal auth path markers",
      "validateSubmittedSkillSafety",
      "submitted skill page exposes unavailable action markers",
    ],
  },
  {
    file: "apps/web/components/session-login-form.tsx",
    required: [
      "Invite or recovery token only",
      "Invite/recovery token",
      "Most users should use OAuth or email/password",
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
