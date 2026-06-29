import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("apps/web/app/publisher/page.tsx", "utf8");
const tabs = readFileSync(
  "apps/web/components/publisher-workspace-tabs.tsx",
  "utf8",
);
const publisherCss = readFileSync(
  "apps/web/app/publisher/publisher.module.css",
  "utf8",
);
const skillManager = readFileSync(
  "apps/web/components/publisher-skill-manager.tsx",
  "utf8",
);
const accountManager = readFileSync(
  "apps/web/components/publisher-account-manager.tsx",
  "utf8",
);
const payoutManager = readFileSync(
  "apps/web/components/publisher-payout-manager.tsx",
  "utf8",
);

test("publisher workspace keeps four tabs and hash mappings", () => {
  for (const id of ["skills", "account", "payout", "demand"]) {
    assert.match(tabs, new RegExp('id: "' + id + '"'));
  }

  for (const hash of [
    "publisher-skills",
    "publisher-account",
    "publisher-payout",
    "publisher-paid-readiness",
    "publisher-demand",
    "publisher-adjustments",
  ]) {
    assert.match(tabs, new RegExp('"' + hash + '"'));
  }
});

test("each authenticated publisher tab renders the workflow guide", () => {
  const workflowUsages = page.match(/<PublisherTabWorkflow/g) ?? [];

  assert.equal(workflowUsages.length, 4);
  assert.match(page, /className="publisher-tab-workflow"/);
});

test("publisher tab panels expose flow-specific class hooks", () => {
  assert.match(skillManager, /publisher-skill-action-flow/);
  assert.match(accountManager, /publisher-account-flow/);
  assert.match(payoutManager, /publisher-payout-flow/);
  assert.match(page, /publisher-demand-flow/);
});

test("workflow strip scrolls internally on mobile without fixed page overflow", () => {
  assert.match(
    publisherCss,
    /\.publisher-tab-workflow\)[^{]*\{[^}]*overflow-x: auto;/s,
  );
  assert.match(publisherCss, /grid-auto-columns: minmax\(240px, 82vw\);/);
  assert.match(
    publisherCss,
    /\.publisher-tab-workflow__step\)[^{]*\{[^}]*min-width: 0;/s,
  );
  const workflowBlock =
    publisherCss.match(/\.publisher-tab-workflow\)[^{]*\{[^}]*\}/s)?.[0] ?? "";
  assert.doesNotMatch(workflowBlock, /width:\s*\d+px/);
});
