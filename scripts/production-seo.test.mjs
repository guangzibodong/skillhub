import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("public launch SEO routes exist", () => {
  [
    "apps/web/app/robots.ts",
    "apps/web/app/sitemap.ts",
    "apps/web/app/privacy/page.tsx",
    "apps/web/app/about/page.tsx",
    "apps/web/app/api/page.tsx",
    "apps/web/app/changelog/page.tsx",
    "apps/web/app/contact/page.tsx",
    "apps/web/app/data-handling/page.tsx",
    "apps/web/app/mcp/page.tsx",
    "apps/web/app/pricing/page.tsx",
    "apps/web/app/publisher-review/page.tsx",
    "apps/web/app/roadmap/page.tsx",
    "apps/web/app/what-is-a-skill/page.tsx",
    "apps/web/app/llms.txt/route.ts",
    "apps/web/app/error.tsx",
  ].forEach((path) => assert.equal(existsSync(new URL(path, root)), true, `${path} should exist`));
});

test("homepage metadata uses canonical host and x-default hreflang", () => {
  const homepage = readFileSync(new URL("apps/web/app/page.tsx", root), "utf8");

  assert.match(homepage, /https:\/\/useskillhub\.com\/\?lang=en/);
  assert.match(homepage, /https:\/\/useskillhub\.com\/\?lang=zh/);
  assert.match(homepage, /"x-default": "https:\/\/useskillhub\.com\/"/);
  assert.doesNotMatch(homepage, /https:\/\/www\.useskillhub\.com/);
});

test("robots and sitemap use canonical host", () => {
  const robots = readFileSync(new URL("apps/web/app/robots.ts", root), "utf8");
  const sitemap = readFileSync(new URL("apps/web/app/sitemap.ts", root), "utf8");

  assert.match(robots, /siteUrl/);
  assert.match(sitemap, /siteUrl/);
  assert.match(sitemap, /indexablePublicPaths/);
  assert.match(robots, /privateNoIndexPaths/);
  assert.doesNotMatch(robots, /www\.useskillhub\.com/);
  assert.doesNotMatch(sitemap, /www\.useskillhub\.com/);
});

test("public and private route sources include launch-ready IA", () => {
  const publicPages = readFileSync(new URL("apps/web/lib/public-pages.ts", root), "utf8");

  [
    "/privacy",
    "/what-is-a-skill",
    "/data-handling",
    "/publisher-review",
    "/pricing",
    "/api",
    "/mcp",
    "/contact",
    "/about",
    "/roadmap",
    "/admin",
    "/login",
    "/developer",
  ].forEach((path) => assert.match(publicPages, new RegExp(path.replaceAll("/", "\\/"))));
});

test("public information architecture has crawlable internal links", () => {
  const footer = readFileSync(new URL("apps/web/components/home/footer.tsx", root), "utf8");

  [
    "/pricing",
    "/what-is-a-skill",
    "/api",
    "/mcp",
    "/publisher-review",
    "/data-handling",
    "/about",
    "/contact",
    "/changelog",
  ].forEach((path) => assert.match(footer, new RegExp(path.replaceAll("/", "\\/"))));
});
