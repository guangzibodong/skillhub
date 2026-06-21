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
  const categoryIndex = browserSource.indexOf('className="market-spotlight-panel"');
  const filterIndex = browserSource.indexOf('className="market-filter-panel"');
  const resultsIndex = browserSource.indexOf('className="market-card-grid"');
  const guideIndex = browserSource.indexOf('className="market-quality-guide"');

  assert.ok(searchIndex > -1, "search box is present");
  assert.ok(categoryIndex > searchIndex, "category entry points follow search");
  assert.ok(filterIndex > categoryIndex, "filters follow categories");
  assert.ok(resultsIndex > filterIndex, "results follow filters");
  assert.ok(guideIndex > resultsIndex, "selection guide stays after results");

  assert.match(browserSource, /搜索任务、Agent、工具、分类或技能名/);
  assert.match(browserSource, /按 Agent 工作流浏览/);
  assert.match(marketplacePage, /按任务、分类和运行风险找到 Agent Skill/);
  assert.match(stylesheet, /\.market-search:focus-within/);
  assert.doesNotMatch(browserSource, /官方认证|官方合作/);
});
