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
