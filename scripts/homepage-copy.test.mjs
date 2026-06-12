import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(new URL("../apps/web/app/page.tsx", import.meta.url), "utf8");

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
    "公开预览中",
    "Project Key",
  ].forEach((text) => assert.match(homepageSource, new RegExp(escapeRegExp(text))));
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
  ].forEach((text) => assert.doesNotMatch(homepageSource, new RegExp(escapeRegExp(text))));
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
