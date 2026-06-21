import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const browserSource = readFileSync(
  "apps/web/components/marketplace-browser.tsx",
  "utf8",
);
const marketplacePage = readFileSync("apps/web/app/marketplace/page.tsx", "utf8");
const stylesheet = readFileSync("apps/web/app/globals.css", "utf8");

test("marketplace prioritizes searchable Agent Skill discovery before guides", () => {
  const searchIndex = browserSource.indexOf('className="market-search"');
  const layoutIndex = browserSource.indexOf('className="market-directory-layout"');
  const filterIndex = browserSource.indexOf('className="market-filter-panel"');
  const resultsIndex = browserSource.indexOf('className="market-card-grid"');
  const guideIndex = browserSource.indexOf('className="market-quality-guide"');

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

test("marketplace uses the curated agent marketplace layout", () => {
  assert.match(marketplacePage, /market-curated-shell/);
  assert.match(marketplacePage, /market-adoption-path/);
  assert.match(browserSource, /market-workflow-section/);
  assert.match(browserSource, /market-workflow-grid/);
  assert.match(browserSource, /market-featured-strip/);
  assert.match(browserSource, /market-skill-score/);
  assert.match(browserSource, /market-skill-logo/);
  assert.match(stylesheet, /\.market-curated-shell/);
  assert.match(stylesheet, /\.market-workflow-card/);
  assert.match(stylesheet, /\.market-skill-score/);
});

test("marketplace exposes mobile-first search and compact workflow browsing", () => {
  assert.match(marketplacePage, /market-hero-search-form/);
  assert.match(marketplacePage, /name="q"/);
  assert.match(browserSource, /market-workflow-card__body/);
  assert.match(browserSource, /market-workflow-card__meta/);
  assert.match(stylesheet, /\.market-hero-search-form/);
  assert.match(stylesheet, /\.market-workflow-card__body/);
  assert.match(stylesheet, /-webkit-line-clamp: 2/);
});
