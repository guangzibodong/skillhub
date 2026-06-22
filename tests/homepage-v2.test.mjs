import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync("apps/web/app/page.tsx", "utf8");
const stylesheet = readFileSync("apps/web/app/globals.css", "utf8");

test("homepage first screen uses a product infrastructure preview instead of an AI stage", () => {
  assert.match(pageSource, /home-v3-root/);
  assert.match(pageSource, /home-v3-hero/);
  assert.match(pageSource, /home-v3-product-preview/);
  assert.match(pageSource, /home-v3-skill-directory/);
  assert.match(pageSource, /home-v3-skill-detail/);
  assert.match(pageSource, /home-v3-runtime-inline/);
  assert.match(pageSource, /Agent Skill Registry \/ Runtime Control Plane/);
  assert.match(pageSource, /让 Agent 调用可信技能/);
  assert.doesNotMatch(pageSource, /SkillHub 让 Agent/);
  assert.match(pageSource, /Skill directory/);
  assert.match(pageSource, /Browser Research/);
  assert.match(pageSource, /Project Key/);
  assert.match(pageSource, /Policy Gate/);
  assert.match(pageSource, /Audit log/);

  assert.doesNotMatch(pageSource, /home-v2-runtime-canvas/);
  assert.doesNotMatch(pageSource, /home-v2-canvas-orbit/);
  assert.doesNotMatch(pageSource, /home-v2-edge-packet/);
});

test("homepage keeps supported agent signals inside the real product preview", () => {
  assert.match(pageSource, /home-v3-agent-strip/);
  assert.match(pageSource, /codex-color\.svg/);
  assert.match(pageSource, /claudecode-color\.svg/);
  assert.match(pageSource, /geminicli-color\.svg/);
  assert.match(pageSource, /copilot-color\.svg/);
  assert.match(pageSource, /openclaw-color\.svg/);
  assert.match(pageSource, /hermesagent\.svg/);
  assert.match(pageSource, /Skills are callable by agents through MCP or REST/);
});

test("homepage visual system is restrained and product-like", () => {
  assert.match(stylesheet, /\.home-v3-root/);
  assert.match(stylesheet, /\.home-v3-product-preview/);
  assert.match(stylesheet, /\.home-v3-skill-row--active/);
  assert.match(stylesheet, /\.home-v3-manifest/);
  assert.match(stylesheet, /\.home-v3-runtime-inline/);
  assert.match(stylesheet, /@keyframes home-v3-status-refresh/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce[\s\S]*?home-v3-status-refresh/);

  assert.doesNotMatch(stylesheet, /home-v3-orb/);
  assert.doesNotMatch(stylesheet, /home-v3-bokeh/);
});

test("homepage product preview has responsive rules for desktop, tablet, and mobile", () => {
  const baseIndex = stylesheet.indexOf(".home-v3-product-grid {");
  const tabletIndex = stylesheet.indexOf("@media (max-width: 1180px)", baseIndex);
  const mobileIndex = stylesheet.indexOf("@media (max-width: 720px)", baseIndex);

  assert.ok(baseIndex > -1);
  assert.ok(tabletIndex > baseIndex);
  assert.ok(mobileIndex > baseIndex);
  assert.match(stylesheet, /@media \(max-width: 1180px\)[\s\S]*?\.home-v3-hero\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(stylesheet, /@media \(max-width: 720px\)[\s\S]*?\.home-v3-product-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(stylesheet, /@media \(max-width: 720px\)[\s\S]*?\.home-v3-agent-strip\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
});

test("homepage keeps the agent ecosystem and footer intact", () => {
  assert.match(pageSource, /home-v2-agent-section/);
  assert.match(pageSource, /home-v2-footer-agent/);
  assert.match(pageSource, /home-v2-footer-main/);
  assert.match(pageSource, /Agent runtime coverage/);
  assert.match(pageSource, /按项目策略接入主流 Agent/);
  assert.match(stylesheet, /\.home-shell--infrastructure \.home-v2-agent-section/);
  assert.match(stylesheet, /\.home-shell--infrastructure \.home-v2-agent-card/);
  assert.match(stylesheet, /\.home-shell--infrastructure \.home-v2-final-cta/);
  assert.match(stylesheet, /home-v2-footer-logo/);
  assert.match(stylesheet, /home-v2-agent-card--hermes/);
});
