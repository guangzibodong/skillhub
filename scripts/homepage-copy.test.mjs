import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(new URL("../apps/web/app/page.tsx", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("../apps/web/components/site-header-client.tsx", import.meta.url), "utf8");

test("homepage contains launch-readiness copy in English and Chinese", () => {
  [
    "SkillHub is a registry and governance layer",
    "What is a Skill?",
    "Browse Skills",
    "Launch Preview",
    "Project Keys",
    "SkillHub 是面向 AI Agent 的 Skill 注册中心",
    "什么是 Skill？",
    "浏览公开 Skills",
    "先浏览公开 Skills，再在工作台项目设置就绪后接入真实运行调用。",
    "公开预览中",
    "Project Key",
  ].forEach((text) => assert.match(homepageSource, new RegExp(escapeRegExp(text))));

  assert.match(headerSource, /Open workspace/);
});

test("homepage does not regress to confusing launch copy", () => {
  [
    "likeproduction",
    "上线预览",
    "登录入口",
    "探索注册中心",
    "阅读运行文档",
    "揭示 Project Key",
    "适合 agent",
    "先探索公开注册中心",
    "Developer workspace",
  ].forEach((text) => assert.doesNotMatch(homepageSource, new RegExp(escapeRegExp(text))));

  assert.doesNotMatch(headerSource, /Developer workspace/);
  assert.doesNotMatch(homepageSource, /home-heading-mobile/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
