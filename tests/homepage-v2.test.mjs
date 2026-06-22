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

  assert.match(stylesheet, /width: min\(2400px, calc\(100% - 44px\)\)/);
  assert.match(stylesheet, /home-v2-edge-atmosphere/);
  assert.match(stylesheet, /home-v2-edge-panel/);
  assert.match(stylesheet, /home-v2-workbench__ambient/);
  assert.match(stylesheet, /@keyframes home-v2-edge-breathe/);
  assert.match(stylesheet, /@media \(min-width: 1800px\)/);
});

test("homepage extends the product atmosphere beyond the central frame", () => {
  assert.match(stylesheet, /\.product-shell\.home-shell\s*\{[^}]*background:[^}]*home-shell-stage-grid/s);
  assert.match(stylesheet, /\.product-shell\.home-shell::before\s*\{[^}]*home-shell-gutter-rail/s);
  assert.match(stylesheet, /\.product-shell\.home-shell::after\s*\{[^}]*radial-gradient\(circle at 50% 18%/s);
  assert.match(stylesheet, /\.product-shell\.home-shell > \.home-frame\s*\{[^}]*z-index:\s*1/s);
  assert.match(stylesheet, /@keyframes home-shell-stage-grid/);
  assert.match(stylesheet, /@keyframes home-shell-gutter-rail/);
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

test("homepage first screen uses a responsive runtime canvas instead of a full dashboard screenshot", () => {
  assert.match(pageSource, /home-v2-runtime-canvas/);
  assert.match(pageSource, /home-v2-canvas-core/);
  assert.match(pageSource, /home-v2-canvas-orbit/);
  assert.match(pageSource, /home-v2-canvas-node/);
  assert.match(pageSource, /home-v2-mobile-runtime-summary/);
  assert.match(pageSource, /Agent Runtime Canvas/);
  assert.match(pageSource, /Policy Gate/);
  assert.match(pageSource, /Runtime Evidence/);

  assert.match(stylesheet, /home-v2-runtime-canvas/);
  assert.match(stylesheet, /home-v2-canvas-core/);
  assert.match(stylesheet, /home-v2-mobile-runtime-summary/);
  assert.match(stylesheet, /@keyframes home-v2-canvas-orbit/);
  assert.match(stylesheet, /@keyframes home-v2-canvas-pulse/);
  assert.match(stylesheet, /@media \(max-width: 1180px\)/);
  assert.match(stylesheet, /@media \(max-width: 1024px\)/);
  assert.match(stylesheet, /@media \(max-width: 640px\)/);
  assert.doesNotMatch(stylesheet, /\\.home-v2-runtime-canvas\\s*\\{[^}]*overflow-x:\\s*auto/s);
});

test("homepage runtime canvas tells a live agent invocation story", () => {
  assert.match(pageSource, /home-v2-canvas-route/);
  assert.match(pageSource, /home-v2-canvas-packet/);
  assert.match(pageSource, /home-v2-canvas-core__signal/);
  assert.match(pageSource, /home-v2-canvas-core__flow-step/);
  assert.match(pageSource, /home-v2-canvas-panel__stream/);
  assert.match(pageSource, /home-v2-canvas-evidence-row--live/);
  assert.match(pageSource, /manifest checked/);
  assert.match(pageSource, /policy allowed/);
  assert.match(pageSource, /audit locked/);

  assert.match(stylesheet, /@keyframes home-v2-canvas-packet-route/);
  assert.match(stylesheet, /@keyframes home-v2-canvas-step-verify/);
  assert.match(stylesheet, /@keyframes home-v2-canvas-evidence-refresh/);
  assert.match(stylesheet, /@keyframes home-v2-canvas-signal-type/);
  assert.match(stylesheet, /\.home-v2-canvas-core__flow-step:nth-child\(3\)/);
  assert.match(stylesheet, /prefers-reduced-motion: reduce[\s\S]*?\.home-v2-canvas-packet/);
});

test("homepage runtime canvas responsive rules override the desktop canvas", () => {
  const baseCanvasIndex = stylesheet.indexOf(".home-v2-runtime-canvas {");
  const tabletCanvasIndex = stylesheet.lastIndexOf("@media (max-width: 1180px) {\n  .home-v2-runtime-canvas");
  const stackedCanvasIndex = stylesheet.lastIndexOf("@media (max-width: 1024px) {\n  .home-v2-runtime-canvas");
  const mobileCanvasIndex = stylesheet.lastIndexOf("@media (max-width: 640px) {\n  .home-frame--v2");

  assert.ok(baseCanvasIndex > -1);
  assert.ok(tabletCanvasIndex > baseCanvasIndex);
  assert.ok(stackedCanvasIndex > baseCanvasIndex);
  assert.ok(mobileCanvasIndex > baseCanvasIndex);
});

test("homepage workbench leads with the animated runtime canvas", () => {
  const canvasIndex = pageSource.indexOf("home-v2-runtime-canvas");
  const liveStripIndex = pageSource.indexOf("home-v2-workbench-live-strip");

  assert.ok(canvasIndex > -1);
  assert.ok(liveStripIndex > -1);
  assert.ok(canvasIndex < liveStripIndex);
});

test("homepage first viewport is tightened across desktop and mobile", () => {
  assert.match(stylesheet, /\.home-v2-hero h1\s*\{[^}]*font-size:\s*clamp\(50px,\s*5\.2vw,\s*82px\)[^}]*word-break:\s*keep-all/s);
  assert.match(stylesheet, /@media \(min-width: 1800px\)\s*\{[\s\S]*?\.home-v2-hero h1\s*\{[^}]*font-size:\s*clamp\(58px,\s*4\.6vw,\s*88px\)/);
  assert.match(stylesheet, /@media \(max-width: 840px\)\s*\{[\s\S]*?\.home-v2-workbench-live-strip\s*\{[^}]*display:\s*none/s);
  assert.match(stylesheet, /@media \(max-width: 840px\)\s*\{[\s\S]*?\.home-v2-mobile-runtime-summary\s*\{[^}]*display:\s*grid/s);
  assert.match(stylesheet, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.home-v2-preview-note p,\s*\n\s*\.home-v2-agent-call-rail\s*\{[^}]*display:\s*none/s);
});
