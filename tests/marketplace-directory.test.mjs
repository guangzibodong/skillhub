import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const browserSource = readFileSync(
  "apps/web/components/marketplace-browser.tsx",
  "utf8",
);
const marketplacePage = readFileSync("apps/web/app/marketplace/page.tsx", "utf8");
const stylesheet = readFileSync(
  "apps/web/app/marketplace/marketplace.module.css",
  "utf8",
);

test("marketplace prioritizes searchable Agent Skill discovery before guides", () => {
  const searchIndex = browserSource.indexOf('className="market-search"');
  const layoutIndex = browserSource.indexOf("market-directory-layout");
  const filterIndex = browserSource.indexOf("market-filter-panel");
  const resultsIndex = browserSource.indexOf("market-card-grid");
  const guideIndex = browserSource.indexOf("market-quality-guide");

  assert.ok(searchIndex > -1, "search box is present");
  assert.ok(layoutIndex > searchIndex, "directory layout follows search");
  assert.ok(filterIndex > layoutIndex, "filters live inside the directory layout");
  assert.ok(resultsIndex > filterIndex, "results follow filters");
  assert.ok(guideIndex > resultsIndex, "selection guide stays after results");

  assert.match(browserSource, /添加到 Agent/);
  assert.match(browserSource, /技能合约/);
  assert.match(browserSource, /data-skill-slug/);
  assert.match(browserSource, /market-decision-grid/);
  assert.match(browserSource, /market-adoption-row/);
  assert.match(browserSource, /market-mobile-filter-bar/);
  assert.match(browserSource, /推荐排序/);
  assert.match(marketplacePage, /为你的 Agent 工作流找到合适的 Skill/);
  assert.match(stylesheet, /\.market-directory-layout/);
  assert.match(stylesheet, /\.market-mobile-filter-bar/);
  assert.match(stylesheet, /\.market-search:focus-within/);
  assert.doesNotMatch(browserSource, /官方认证|官方合作/);
});

test("marketplace exposes full client-side sorting and view controls", () => {
  assert.match(browserSource, /sortOptions = \[/);
  assert.match(browserSource, /"adoption"/);
  assert.match(browserSource, /"success"/);
  assert.match(browserSource, /"lowRisk"/);
  assert.match(browserSource, /"recent"/);
  assert.match(browserSource, /serializeSort\(sort\)/);
  assert.match(browserSource, /sort === "lowRisk" \? "low_risk" : sort/);
  assert.match(browserSource, /viewOptions = \["compact", "comfortable"\]/);
  assert.match(browserSource, /market-card-grid--\$\{view\}/);
  assert.match(stylesheet, /\.market-segmented-control/);
  assert.match(stylesheet, /\.market-card-grid--comfortable/);
});

test("marketplace preserves filters in URL state and fetches a resettable catalog", () => {
  assert.match(browserSource, /name="category"/);
  assert.match(browserSource, /name="permissionLevel"/);
  assert.match(browserSource, /name="runtime"/);
  assert.match(browserSource, /name="verification"/);
  assert.match(browserSource, /name="view"/);
  assert.match(browserSource, /normalizeSort/);
  assert.match(browserSource, /low-risk/);
  assert.match(browserSource, /normalizeView/);
  assert.match(marketplacePage, /includeReviewListings: true/);
  assert.match(marketplacePage, /limit: MARKETPLACE_PAGE_SKILL_LIMIT/);
  assert.doesNotMatch(marketplacePage, /toPublicMarketplaceSearchOptions/);
  assert.doesNotMatch(marketplacePage, /limit: 50/);
});

test("marketplace exposes mobile filter drawer behavior", () => {
  assert.match(browserSource, /isMobileFiltersOpen/);
  assert.match(browserSource, /market-filter-backdrop--open/);
  assert.match(browserSource, /market-filter-panel--open/);
  assert.match(browserSource, /aria-expanded=\{isMobileFiltersOpen\}/);
  assert.match(browserSource, /event\.key === "Escape"/);
  assert.match(stylesheet, /\.market-filter-backdrop--open/);
  assert.match(stylesheet, /\.market-filter-close-button/);
  assert.match(stylesheet, /\.market-filter-panel--open/);
});
