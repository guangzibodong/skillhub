import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sourcePath = "scripts/qa-acceptance-team.mjs";

test("acceptance team QA preserves actionable launch readiness details", async () => {
  const source = await readFile(sourcePath, "utf8");

  assert.match(source, /function collectReadinessDetails\(/);
  assert.match(source, /details:\s*blockerDetails/);
  assert.match(source, /details:\s*attentionDetails/);
  assert.match(source, /\.\.\.\(details && details\.length > 0 \? \{ details \} : \{\}\)/);
  assert.match(source, /\$\{detail\.sectionKey\}\/\$\{detail\.itemKey\}/);
  assert.match(source, /detail\.action/);
  assert.match(source, /detail\.detail/);
});

test("skill detail hero metrics use localized preview fallback", async () => {
  const source = await readFile("apps/web/app/skills/[slug]/page.tsx", "utf8");

  assert.match(source, /previewMetric:\s*"Preview"/);
  assert.match(source, /previewMetric:\s*"\u9884\u89c8\u4e2d"/);
  assert.match(source, /formatMetricValue\(skill\.successRate,\s*locale\)/);
  assert.match(source, /formatMetricValue\(skill\.latency,\s*locale\)/);
  assert.doesNotMatch(source, /<strong>\{skill\.successRate\}<\/strong>/);
  assert.doesNotMatch(source, /<strong>\{skill\.latency\}<\/strong>/);
});

test("workspace locked heroes use access-first copy", async () => {
  const adminPage = await readFile("apps/web/app/admin/page.tsx", "utf8");
  const developerPage = await readFile("apps/web/app/developer/page.tsx", "utf8");
  const i18n = await readFile("apps/web/lib/i18n.ts", "utf8");
  const publisherPage = await readFile("apps/web/app/publisher/page.tsx", "utf8");
  const publisherCopy = await readFile("apps/web/lib/publisher-page-copy.ts", "utf8");

  assert.match(developerPage, /lockedTitle:\s*"Enter the developer workspace after sign-in\."/);
  assert.match(developerPage, /lockedTitle:\s*"登录后进入开发者工作台。"/);
  assert.match(developerPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(developerPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(publisherCopy, /lockedTitle:\s*"Enter the publisher workspace after sign-in\."/);
  assert.match(publisherCopy, /lockedTitle:\s*"登录后进入发布者工作台。"/);
  assert.match(publisherPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(publisherPage, /<p>\{labels\.lockedDescription\}<\/p>/);

  assert.match(i18n, /lockedTitle:\s*"Enter the platform admin after sign-in\."/);
  assert.match(i18n, /lockedTitle:\s*"登录后进入平台管理后台。"/);
  assert.match(adminPage, /<h1>\{labels\.lockedTitle\}<\/h1>/);
  assert.match(adminPage, /<p>\{labels\.lockedDescription\}<\/p>/);
});
