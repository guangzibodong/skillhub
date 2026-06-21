import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const pageSource = readFileSync("apps/web/app/page.tsx", "utf8");
const stylesheet = readFileSync("apps/web/app/globals.css", "utf8");
const packageSource = readFileSync("apps/web/lib/promoted-skill-packages.ts", "utf8");

test("homepage footer presents the agent ecosystem with production-safe copy", () => {
  const requiredNames = [
    "Codex",
    "Claude Code / MCP",
    "Gemini CLI",
    "GitHub Copilot",
    "OpenClaw",
    "Hermes Agent",
  ];

  for (const name of requiredNames) {
    assert.match(pageSource, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(pageSource, /footerAgentEcosystem/);
  assert.match(pageSource, /Agent-ready skills/);
  assert.match(pageSource, /接入主流 Agent 执行环境/);
  assert.match(stylesheet, /home-footer__agent-panel/);
  assert.match(stylesheet, /home-footer__agent-grid/);
  assert.match(stylesheet, /home-footer__main/);
  assert.match(stylesheet, /home-footer__contact-row/);
  assert.match(stylesheet, /home-footer__status-pill/);
  assert.match(stylesheet, /home-footer__bottom/);
  assert.match(pageSource, /谁可以浏览，谁可以调用/);
  assert.match(pageSource, /home-footer__agent-logo--\$\{agent\.logoKey\}/);
  assert.match(stylesheet, /home-footer__agent-logo--hermes/);
  assert.match(stylesheet, /--agent-logo-bg/);
  assert.match(packageSource, /先选择要交付的结果，再接入对应 Skill/);
  assert.doesNotMatch(packageSource, /直接丢给客户一堆技能/);
  assert.match(pageSource, /Registry/);
  assert.match(pageSource, /Runtime/);
  assert.match(pageSource, /Governance/);

  const unsafeClaims = ["官方合作", "官方认证", "certified partner", "official partner"];
  for (const claim of unsafeClaims) {
    assert.doesNotMatch(pageSource, new RegExp(claim, "i"));
  }
});
