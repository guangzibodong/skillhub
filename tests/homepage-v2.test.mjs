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
  assert.match(pageSource, /Skill 只能被 Agent 调用；真实运行必须绑定登录后的 Project Key。/);
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
  assert.match(pageSource, /home-v2-workbench__scan/);
  assert.match(pageSource, /home-v2-flow-line/);
  assert.match(pageSource, /home-v2-runtime-pulse/);

  assert.match(stylesheet, /@keyframes home-v2-rail-flow/);
  assert.match(stylesheet, /@keyframes home-v2-workbench-scan/);
  assert.match(stylesheet, /@keyframes home-v2-flow-sweep/);
  assert.match(stylesheet, /@keyframes home-v2-audit-pulse/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce/);
});

test("homepage wide gutters are designed product atmosphere instead of floating decoration", () => {
  assert.match(pageSource, /home-v2-edge-atmosphere/);
  assert.match(pageSource, /home-v2-edge-panel/);
  assert.match(pageSource, /home-v2-edge-thread/);
  assert.match(pageSource, /home-v2-workbench__ambient/);
  assert.doesNotMatch(pageSource, /home-v2-floating-chip/);

  assert.match(stylesheet, /width: min\(2160px, calc\(100% - 56px\)\)/);
  assert.match(stylesheet, /home-v2-edge-atmosphere/);
  assert.match(stylesheet, /home-v2-edge-panel/);
  assert.match(stylesheet, /home-v2-workbench__ambient/);
  assert.match(stylesheet, /@keyframes home-v2-edge-breathe/);
  assert.match(stylesheet, /@media \(min-width: 1800px\)/);
});

test("homepage explains skills are for agent runtimes and shows supported agents", () => {
  assert.match(pageSource, /home-v2-agent-support/);
  assert.match(pageSource, /home-v2-agent-badge/);
  assert.match(pageSource, /home-v2-agent-call-rail/);
  assert.match(pageSource, /home-v2-agent-call-node/);
  assert.match(pageSource, /Skills are callable by agents through MCP or REST/);
  assert.match(pageSource, /codex-color\.svg/);
  assert.match(pageSource, /claudecode-color\.svg/);
  assert.match(pageSource, /geminicli-color\.svg/);
  assert.match(pageSource, /copilot-color\.svg/);
  assert.match(pageSource, /openclaw-color\.svg/);
  assert.match(pageSource, /hermesagent\.svg/);

  assert.match(stylesheet, /home-v2-agent-support/);
  assert.match(stylesheet, /home-v2-agent-badge/);
  assert.match(stylesheet, /home-v2-agent-call-rail/);
  assert.match(stylesheet, /@keyframes home-v2-runtime-sweep/);
  assert.match(stylesheet, /@keyframes home-v2-workspace-flow/);
  assert.match(stylesheet, /@keyframes home-v2-code-scan/);
});

test("homepage hero has live invocation rails instead of static screenshot framing", () => {
  assert.match(pageSource, /home-v2-runtime-rails/);
  assert.match(pageSource, /home-v2-edge-packet/);
  assert.match(pageSource, /home-v2-invocation-timeline/);
  assert.match(pageSource, /home-v2-invocation-step/);
  assert.match(pageSource, /home-v2-workbench-live-strip/);
  assert.match(pageSource, /home-v2-runtime-meter/);
  assert.match(pageSource, /Agent request/);
  assert.match(pageSource, /Policy gate/);
  assert.match(pageSource, /Audit locked/);

  assert.match(stylesheet, /home-v2-runtime-rails/);
  assert.match(stylesheet, /home-v2-edge-packet/);
  assert.match(stylesheet, /home-v2-invocation-timeline/);
  assert.match(stylesheet, /home-v2-workbench-live-strip/);
  assert.match(stylesheet, /home-v2-runtime-meter/);
  assert.match(stylesheet, /@keyframes home-v2-edge-packet-flow/);
  assert.match(stylesheet, /@keyframes home-v2-timeline-step/);
  assert.match(stylesheet, /@keyframes home-v2-panel-shift/);
});
