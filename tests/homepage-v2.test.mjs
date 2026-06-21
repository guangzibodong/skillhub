import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync("apps/web/app/page.tsx", "utf8");
const stylesheet = readFileSync("apps/web/app/globals.css", "utf8");

test("homepage uses the approved agent registry workbench design", () => {
  assert.match(pageSource, /home-v2-hero/);
  assert.match(pageSource, /home-v2-workbench/);
  assert.match(pageSource, /home-v2-runtime-route/);
  assert.match(pageSource, /home-v2-agent-section/);
  assert.match(pageSource, /home-v2-footer-agent/);

  assert.match(pageSource, /SkillHub：Agent Skill 的注册与运行层。/);
  assert.match(pageSource, /公开目录可浏览；真实运行需要登录后的 Project Key。/);
  assert.match(pageSource, /开发者、团队和发布者共用一条 Skill 采用流程。/);
  assert.match(pageSource, /公开发现、登录运行、项目治理分层清楚。/);
  assert.match(pageSource, /Manifest verified · runtime gated/);
  assert.match(pageSource, /Pre-adoption review/);
  assert.match(pageSource, /Audit trace/);

  assert.match(stylesheet, /home-v2-workbench/);
  assert.match(stylesheet, /background: var\(--home-v2-paper\)/);
  assert.match(stylesheet, /home-v2-footer-logo/);
  assert.match(stylesheet, /home-v2-footer-main/);
  assert.match(stylesheet, /home-v2-agent-card--hermes/);
  assert.match(stylesheet, /@media \(max-width: 840px\)/);
});

test("homepage workbench has restrained infrastructure motion", () => {
  assert.match(pageSource, /home-v2-motion-field/);
  assert.match(pageSource, /home-v2-ambient-rail/);
  assert.match(pageSource, /home-v2-floating-chip/);
  assert.match(pageSource, /home-v2-workbench__scan/);
  assert.match(pageSource, /home-v2-flow-line/);
  assert.match(pageSource, /home-v2-runtime-pulse/);

  assert.match(stylesheet, /@keyframes home-v2-rail-flow/);
  assert.match(stylesheet, /@keyframes home-v2-chip-drift/);
  assert.match(stylesheet, /@keyframes home-v2-workbench-scan/);
  assert.match(stylesheet, /@keyframes home-v2-flow-sweep/);
  assert.match(stylesheet, /@keyframes home-v2-audit-pulse/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce/);
});
