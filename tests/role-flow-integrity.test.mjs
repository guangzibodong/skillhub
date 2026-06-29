import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const audit = readFileSync("docs/role-flow-audit.md", "utf8");
const migration = readFileSync(
  "supabase/migrations/035_integrity_guards.sql",
  "utf8",
);
const indexSource = readFileSync("apps/gateway/src/index.ts", "utf8");

test("role-flow audit maps all launch roles to live surfaces", () => {
  for (const role of ["Public user", "Developer", "Publisher", "Admin"]) {
    assert.match(audit, new RegExp(`\\| ${role} \\|`));
  }

  for (const route of [
    "/marketplace",
    "/dashboard/projects/[slug]",
    "/publisher",
    "/admin",
  ]) {
    assert.ok(audit.includes(route), route + " is covered");
  }

  for (const table of [
    "projects",
    "project_skill_installs",
    "api_keys",
    "skill_reviews",
    "payouts",
    "admin_audit_logs",
  ]) {
    assert.match(audit, new RegExp(`\\b${table}\\b`));
  }

  assert.match(audit, /Demo Fallback Policy/);
  assert.match(audit, /Live: data is read from the database/);
  assert.match(audit, /Unavailable: the dependency is missing or down/);
});

test("integrity migration is additive and protects critical write state", () => {
  assert.match(migration, /Rollback-safe design/);
  assert.match(migration, /not valid/gi);
  assert.doesNotMatch(migration, /\bdrop\s+table\b/i);
  assert.doesNotMatch(migration, /\bdelete\s+from\b/i);
  assert.doesNotMatch(migration, /\btruncate\b/i);

  for (const constraint of [
    "api_keys_active_material_check",
    "skill_reviews_decision_timestamp_check",
    "project_skill_policies_limits_check",
    "usage_events_amount_quantity_check",
    "payouts_positive_amount_check",
    "admin_audit_logs_metadata_object_check",
    "notification_events_payload_object_check",
  ]) {
    assert.match(migration, new RegExp(constraint));
  }
});

test("role endpoints keep organization or platform authorization gates", () => {
  const protectedFragments = [
    'app.post("/v1/developer/projects"',
    'app.post("/v1/projects/:projectSlug/installed-skills"',
    'app.post("/v1/projects/:projectSlug/api-keys"',
    'app.post("/v1/projects/:projectSlug/runtime/test"',
    'app.post("/v1/skills/:slug/submit"',
    'app.post("/v1/admin/reviews/:reviewId/decision"',
    'app.post("/v1/admin/payouts/:payoutId/decision"',
  ];

  for (const fragment of protectedFragments) {
    const start = indexSource.indexOf(fragment);
    assert.notEqual(start, -1, `${fragment} route is present`);
    const routeBlock = indexSource.slice(start, start + 1800);
    assert.match(routeBlock, /authorize\(/, `${fragment} calls authorize`);
  }

  for (const fragment of protectedFragments.slice(0, 5)) {
    const start = indexSource.indexOf(fragment);
    const routeBlock = indexSource.slice(start, start + 1800);
    assert.match(
      routeBlock,
      /requireOrganization:\s*true/,
      `${fragment} requires organization scope`,
    );
  }
});

test("critical write modules record audit logs without raw secret metadata", () => {
  const modules = [
    "apps/gateway/src/developer-projects.ts",
    "apps/gateway/src/operations.ts",
    "apps/gateway/src/runtime.ts",
    "apps/gateway/src/publisher.ts",
    "apps/gateway/src/payouts.ts",
  ];

  for (const file of modules) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /admin_audit_logs/, `${file} records audit logs`);
    assert.match(source, /notification_events/, `${file} records notifications`);
  }

  const runtime = readFileSync("apps/gateway/src/runtime.ts", "utf8");
  const auditSection = runtime.slice(
    runtime.indexOf("'project_api_key.created'"),
    runtime.indexOf("return keyRows;"),
  );

  assert.match(auditSection, /keyLast4/);
  assert.doesNotMatch(auditSection, /rawKey/);
  assert.doesNotMatch(auditSection, /apiKey:\s*rawKey/);
});

