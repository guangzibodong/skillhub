import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const publishPage = readFileSync("apps/web/app/publish/page.tsx", "utf8");
const publishForm = readFileSync("apps/web/components/publish-form.tsx", "utf8");
const stylesheet = readFileSync("apps/web/app/publish/publish.module.css", "utf8");

test("publish page keeps locked-state access as a single hero CTA", () => {
  const accessHrefUses = publishPage.match(/accessNotice\.actionHref/g) ?? [];

  assert.equal(accessHrefUses.length, 1);
  assert.match(publishPage, /href=\{accessNotice\.actionHref\}/);
  assert.match(publishPage, /heroPrimaryLabel/);
  assert.doesNotMatch(publishPage, /publish-compact-help__[\s\S]*?href=\{accessNotice\.actionHref\}/);
});

test("publish form explains locked access without repeating action buttons", () => {
  assert.match(publishForm, /!access\.canSubmit \? \(/);
  assert.match(publishForm, /The hero CTA already gives the next step/);
  assert.doesNotMatch(publishForm, /access\.actionHref/);
  assert.doesNotMatch(publishForm, /publish-locked-guide__cta/);
  assert.doesNotMatch(stylesheet, /publish-locked-guide__cta/);
});

test("publish journey steps use a segmented workflow strip", () => {
  assert.match(publishPage, /className="publish-journey-steps"/);
  assert.match(publishPage, /variant="steps"/);
  assert.match(stylesheet, /\.publish-journey-steps\) \{[\s\S]*?overflow-x:\s*auto;/);
  assert.match(stylesheet, /\.publish-journey-steps\) \{[\s\S]*?rgba\(15, 20, 14, 0\.92\)/);
  assert.match(stylesheet, /grid-template-columns:\s*repeat\(5, minmax\(158px, 1fr\)\)/);
  assert.match(stylesheet, /gap:\s*2px/);
  assert.match(stylesheet, /clip-path:\s*polygon\(0 0, calc\(100% - 13px\) 0, 100% 50%/);
  assert.match(stylesheet, /\.publish-journey-steps \.journey-rail-step--done\) \{[\s\S]*?background:\s*linear-gradient\(90deg, rgba\(155, 226, 141, 0\.92\), rgba\(124, 199, 216, 0\.72\)\)/);
  assert.match(stylesheet, /\.publish-journey-steps \.journey-rail-step--current\) \{[\s\S]*?background:\s*linear-gradient\(90deg, var\(--signal\), var\(--cyan\)\)/);
  assert.match(stylesheet, /\.publish-journey-steps \.journey-rail-step--upcoming\) \{[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.075\)/);
  assert.match(stylesheet, /@media \(max-width: 760px\)[\s\S]*?min-width:\s*760px/);
  assert.doesNotMatch(stylesheet, /\.publish-journey-steps \.journey-rail__steps::before/);
  assert.doesNotMatch(stylesheet, /\.publish-journey-steps \.journey-rail-step__icon\) \{[^}]*border-radius:\s*999px/);
  assert.doesNotMatch(stylesheet, /box-shadow:\s*0 0 0 5px/);
});
