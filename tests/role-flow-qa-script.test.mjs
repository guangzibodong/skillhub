import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const qaSource = readFileSync("scripts/qa-acceptance-team.mjs", "utf8");
const accountSource = readFileSync("scripts/create-acceptance-team.mjs", "utf8");
const readinessSource = readFileSync("apps/gateway/src/launch-readiness.ts", "utf8");
const integrityMigration = readFileSync("supabase/migrations/035_integrity_guards.sql", "utf8");

test("acceptance credential output is private and intentionally separated from the secret-safe report", () => {
  assert.match(accountSource, /schema:\s*"skillhub\.acceptance-team\.v1"/);
  assert.match(accountSource, /warning:\s*"Private QA credentials/);
  assert.match(accountSource, /mode:\s*0o600/);
  assert.match(accountSource, /chmod\(absolutePath,\s*0o600\)/);
  assert.match(accountSource, /No passwords, tokens, OAuth secrets, or service credentials were printed/);

  assert.match(qaSource, /schema:\s*"skillhub\.acceptance-team-qa\.v1"/);
  assert.match(qaSource, /function assertReportSecretSafe\(/);
  assert.match(qaSource, /findSensitiveLeaks\(JSON\.stringify\(report\)\)/);
  assert.doesNotMatch(qaSource, /results\.push\(\{[^}]*password/s);
  assert.doesNotMatch(qaSource, /results\.push\(\{[^}]*sessionToken/s);
});

test("role-flow QA script covers public, developer, publisher, and admin live workflows", () => {
  for (const marker of [
    "checkPublicFlow",
    "checkDeveloperWorkflow",
    "checkPublisherWorkflow",
    "checkAdminWorkflow",
    "checkFinancePayoutWorkflow"
  ]) {
    assert.match(qaSource, new RegExp(`function ${marker}|async function ${marker}`));
  }

  for (const endpoint of [
    "/v1/developer/projects",
    "/v1/projects/${encodeURIComponent(slug)}/installed-skills",
    "/v1/projects/${encodeURIComponent(slug)}/saved-skills",
    "/v1/projects/${encodeURIComponent(slug)}/policies/${encodeURIComponent(skillSlug)}",
    "/v1/projects/${encodeURIComponent(slug)}/api-keys",
    "/v1/projects/${encodeURIComponent(slug)}/runtime/test",
    "/v1/runtime/invoke",
    "/v1/skills/${encodeURIComponent(skillSlug)}/prices",
    "/v1/publisher/payout-account/onboarding",
    "/v1/publisher/payouts",
    "/v1/admin/reviews",
    "/v1/admin/finance/process-usage",
    "/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision",
    "/v1/admin/audit-logs",
    "/v1/admin/launch-readiness"
  ]) {
    assert.ok(qaSource.includes(endpoint), `${endpoint} is exercised`);
  }
});

test("role-flow QA script preserves cross-org negatives, reveal-once keys, audit checks, and role boundaries", () => {
  assert.match(qaSource, /Same project slug resolves to distinct projects in different organizations/);
  assert.match(qaSource, /expectStatus\("developer",\s*"authorization",\s*`\/v1\/developer\/projects\/\$\{otherSlug\}`,\s*crossResponse,\s*\[404\]\)/);
  assert.match(qaSource, /rawApiKey/);
  assert.match(qaSource, /API key raw value appeared in the creation response only/);
  assert.match(qaSource, /API key list omits raw secret after creation/);
  assert.match(qaSource, /checkAuditContains/);
  assert.match(qaSource, /project_api_key\.created/);
  assert.match(qaSource, /payout\.mark_paid/);
  assert.match(qaSource, /ROLE_BOUNDARY_CHECKS/);
  assert.match(qaSource, /developer.*admin\/launch-readiness/s);
  assert.match(qaSource, /publisher.*developer\/projects/s);
});

test("launch-readiness QA asserts demo fallback, migration history, and credibility thresholds", () => {
  for (const key of [
    "demo_fallback",
    "schema_migrations",
    "verified_skills_threshold",
    "active_publishers_threshold",
    "active_projects_threshold",
    "successful_invocations_threshold",
    "published_feedback_threshold"
  ]) {
    assert.match(qaSource, new RegExp(key));
    assert.match(readinessSource, new RegExp(key));
  }

  assert.match(integrityMigration, /035_integrity_guards|Rollback-safe design/);
});
