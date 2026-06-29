#!/usr/bin/env node

import { spawn } from "node:child_process";

console.warn(
  "This legacy P0 smoke entrypoint is deprecated. Running qa-p0-real-flow-smoke.mjs instead.",
);

const child = spawn(
  process.execPath,
  ["scripts/qa-p0-real-flow-smoke.mjs", ...process.argv.slice(2)],
  {
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);

child.on("close", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`Failed to start real-flow smoke: ${error.message}`);
  process.exit(1);
});
