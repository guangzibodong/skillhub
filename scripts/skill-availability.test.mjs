import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

import ts from "typescript";

let skillInstallStateModule;

async function loadSkillInstallStateModule() {
  if (skillInstallStateModule) {
    return skillInstallStateModule;
  }

  const source = await readFile("apps/web/lib/skill-install-state.ts", "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: "skill-install-state.ts",
  });
  const module = { exports: {} };

  vm.runInNewContext(
    outputText,
    {
      exports: module.exports,
      module,
      require(specifier) {
        throw new Error(`Unexpected runtime import in skill availability helper: ${specifier}`);
      },
    },
    { filename: "skill-install-state.ts" },
  );

  skillInstallStateModule = module.exports;
  return skillInstallStateModule;
}

test("verified skills are callable after project setup", async () => {
  const { getPublicSkillActionState, getSkillAvailability, getSkillInstallState } =
    await loadSkillInstallStateModule();
  const availability = getSkillAvailability("verified");
  const installState = getSkillInstallState("verified");
  const actionState = getPublicSkillActionState("verified", true);

  assert.equal(availability.kind, "callable");
  assert.equal(availability.canInspect, true);
  assert.equal(availability.canInstall, true);
  assert.equal(availability.canRunTest, true);
  assert.equal(availability.canShowProjectHandoff, true);
  assert.equal(availability.canShowBillingGate, true);
  assert.equal(installState.installable, true);
  assert.equal(actionState.kind, "authenticated_install");
  assert.equal(actionState.canInstallNow, true);
  assert.equal(actionState.canShowInstallSectionTitle, true);
  assert.equal(actionState.sectionTitle.en, "Install");
});

test("anonymous verified skills expose availability instead of install", async () => {
  const { getPublicSkillActionState } = await loadSkillInstallStateModule();
  const actionState = getPublicSkillActionState("verified", false);

  assert.equal(actionState.kind, "verified_gated");
  assert.equal(actionState.canInspectPublicly, true);
  assert.equal(actionState.canInstallNow, false);
  assert.equal(actionState.canShowInstallSectionTitle, false);
  assert.equal(actionState.canShowProjectHandoff, true);
  assert.equal(actionState.canShowRuntimeTest, false);
  assert.equal(actionState.sectionTitle.en, "Availability");
});

test("approved remains a verified alias for legacy rows", async () => {
  const { getSkillAvailability } = await loadSkillInstallStateModule();
  const availability = getSkillAvailability("approved");

  assert.equal(availability.kind, "callable");
  assert.equal(availability.canInstall, true);
  assert.equal(availability.canShowProjectHandoff, true);
});

test("submitted skills stay inspection-only", async () => {
  const { getPublicSkillActionState, getSkillAvailability, getSkillInstallState } =
    await loadSkillInstallStateModule();
  const availability = getSkillAvailability("submitted");
  const installState = getSkillInstallState("submitted");
  const actionState = getPublicSkillActionState("submitted", false);

  assert.equal(availability.kind, "inspection_only");
  assert.equal(availability.canInspect, true);
  assert.equal(availability.canInstall, false);
  assert.equal(availability.canRunTest, false);
  assert.equal(availability.canShowProjectHandoff, false);
  assert.equal(availability.canShowBillingGate, false);
  assert.equal(installState.installable, false);
  assert.equal(actionState.kind, "inspection_only");
  assert.equal(actionState.canInstallNow, false);
  assert.equal(actionState.canShowInstallSectionTitle, false);
  assert.equal(actionState.sectionTitle.en, "Availability");
});

test("missing or unknown statuses default to inspection-only", async () => {
  const { getSkillAvailability } = await loadSkillInstallStateModule();

  assert.equal(getSkillAvailability(undefined).kind, "inspection_only");
  assert.equal(getSkillAvailability("in_review").canInstall, false);
});
