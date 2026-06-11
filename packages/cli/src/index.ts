#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertSkillManifest } from "@useskillhub/schema";
import { SkillHubClient } from "@useskillhub/sdk";

type Command = "validate" | "publish" | "search" | "run" | "help";

const [, , rawCommand = "help", ...args] = process.argv;
const command = rawCommand as Command;

async function main() {
  if (command === "validate") {
    const manifest = await readManifest(args[0]);
    assertSkillManifest(manifest);
    console.log("Manifest is valid.");
    return;
  }

  if (command === "publish") {
    const manifest = await readManifest(args[0]);
    assertSkillManifest(manifest);

    const client = requireClient();
    const result = await client.publishSkill(manifest);
    console.log(`Published ${result.slug} (${result.id}).`);
    return;
  }

  if (command === "search") {
    const query = args.join(" ");
    const client = requireClient();
    const skills = await client.searchSkills({ query });
    for (const skill of skills) {
      console.log(`${skill.slug}\t${skill.displayName}\t${skill.verificationStatus}`);
    }
    return;
  }

  if (command === "run") {
    const [skillSlug, rawInput = "{}"] = args;

    if (!skillSlug) {
      throw new Error("Usage: skillhub run <skill> [json-input]");
    }

    const client = requireClient();
    const result = await client.run(skillSlug, JSON.parse(rawInput));
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printHelp();
}

function requireClient(): SkillHubClient {
  const apiKey = process.env.SKILLHUB_API_KEY;
  if (!apiKey) {
    console.error("Error: SKILLHUB_API_KEY environment variable is not set.");
    console.error("Set it with: export SKILLHUB_API_KEY=sk_proj_...");
    process.exit(1);
  }
  return new SkillHubClient({
    apiKey,
    baseUrl: process.env.SKILLHUB_API_URL
  });
}

async function readManifest(path = "skillhub.json") {
  const fullPath = resolve(process.cwd(), path);
  const content = await readFile(fullPath, "utf8");
  return JSON.parse(content) as unknown;
}

function printHelp() {
  console.log(`SkillHub CLI

Usage:
  skillhub validate [manifest]
  skillhub publish [manifest]
  skillhub search <query>
  skillhub run <skill> [json-input]

Environment:
  SKILLHUB_API_KEY
  SKILLHUB_API_URL
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
