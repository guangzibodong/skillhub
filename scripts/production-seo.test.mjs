import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("public launch SEO routes exist", () => {
  [
    "apps/web/app/robots.ts",
    "apps/web/app/sitemap.ts",
    "apps/web/app/privacy/page.tsx",
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

  assert.match(robots, /https:\/\/useskillhub\.com/);
  assert.match(sitemap, /https:\/\/useskillhub\.com/);
  assert.match(sitemap, /\/privacy/);
});
