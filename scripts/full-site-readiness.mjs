#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredPublicRoutes = [
  "/about",
  "/api",
  "/changelog",
  "/contact",
  "/data-handling",
  "/mcp",
  "/pricing",
  "/publisher-review",
  "/roadmap",
  "/what-is-a-skill",
];

const privateRoutes = [
  "/account",
  "/admin",
  "/admin-login",
  "/dashboard",
  "/developer",
  "/login",
  "/publisher",
  "/report",
  "/role-landing",
];

const requiredFooterLinks = [
  "/marketplace",
  "/registry",
  "/pricing",
  "/what-is-a-skill",
  "/docs",
  "/api",
  "/mcp",
  "/publish",
  "/publisher-review",
  "/publishers",
  "/security",
  "/data-handling",
  "/privacy",
  "/terms",
  "/about",
  "/contact",
  "/support",
  "/changelog",
];

const file = (path) => readFileSync(join(root, path), "utf8");
const routeFile = (path) => join(root, "apps/web/app", path.slice(1), "page.tsx");

for (const route of requiredPublicRoutes) {
  assert.equal(existsSync(routeFile(route)), true, `${route} page is missing`);
}

assert.equal(existsSync(join(root, "apps/web/app/llms.txt/route.ts")), true, "llms.txt route is missing");
assert.equal(existsSync(join(root, "apps/web/app/error.tsx")), true, "global error page is missing");
assert.equal(existsSync(join(root, "apps/web/app/not-found.tsx")), true, "not-found page is missing");

const publicPages = file("apps/web/lib/public-pages.ts");
for (const route of requiredPublicRoutes) {
  assert.match(publicPages, new RegExp(`path: "${route}"|${escapeRegExp(route)}`), `${route} missing from public page source`);
}

const footer = file("apps/web/components/home/footer.tsx");
for (const href of requiredFooterLinks) {
  assert.match(footer, new RegExp(`href: "${escapeRegExp(href)}"|href="${escapeRegExp(href)}"`), `${href} missing from footer IA`);
}

const sitemap = file("apps/web/app/sitemap.ts");
assert.match(sitemap, /indexablePublicPaths/, "sitemap should use the public route source of truth");
for (const route of requiredPublicRoutes) {
  assert.match(publicPages, new RegExp(escapeRegExp(route)), `${route} missing from public route source of truth`);
}
assert.doesNotMatch(sitemap, /www\.useskillhub\.com/, "sitemap must use canonical apex host");

const robots = file("apps/web/app/robots.ts");
assert.match(robots, /privateNoIndexPaths/, "robots should use the private noindex source of truth");
for (const route of privateRoutes) {
  assert.match(publicPages, new RegExp(escapeRegExp(route)), `${route} missing from private noindex source of truth`);
}

const llms = file("apps/web/app/llms.txt/route.ts");
for (const route of ["/what-is-a-skill", "/data-handling", "/publisher-review", "/pricing", "/roadmap"]) {
  assert.match(llms, new RegExp(escapeRegExp(route)), `${route} missing from llms.txt`);
}

const admin = file("apps/web/app/admin/page.tsx");
assert.doesNotMatch(admin, /open=\{defaultWorkbenchGroup ===/, "admin detailed modules should not be expanded by default");
assert.match(admin, /buildNoIndexMetadata\("SkillHub Admin"\)/, "admin page should be noindex");

const siteHeader = file("apps/web/components/site-header-client.tsx");
assert.doesNotMatch(siteHeader, /\/marketplace#pricing/, "pricing nav should use the real pricing page");

const globals = file("apps/web/app/globals.css");
for (const marker of [".public-info-page", ".home-footer", ".admin-console-shell--v2 .admin-sidebar"]) {
  assert.match(globals, new RegExp(escapeRegExp(marker)), `${marker} styles are missing`);
}

for (const route of ["account", "admin", "login", "dashboard", "developer", "publisher", "report", "role-landing"]) {
  const candidate = join(root, "apps/web/app", route, "page.tsx");
  if (existsSync(candidate)) {
    assert.match(readFileSync(candidate, "utf8"), /buildNoIndexMetadata/, `${route} page should export noindex metadata`);
  }
}

console.log("full-site production readiness static checks passed");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
