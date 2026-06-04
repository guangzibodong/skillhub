#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertSkillManifest } from "@useskillhub/schema";
import { SkillHubClient } from "@useskillhub/sdk";

type Command = "validate" | "publish" | "search" | "help";

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

    const client = new SkillHubClient({
      apiKey: process.env.SKILLHUB_API_KEY,
      baseUrl: process.env.SKILLHUB_API_URL
    });

    const result = await client.publishSkill(manifest);
    console.log(`Published ${result.slug} (${result.id}).`);
    return;
  }

  if (command === "search") {
    const query = args.join(" ");
    const client = new SkillHubClient({
      apiKey: process.env.SKILLHUB_API_KEY,
      baseUrl: process.env.SKILLHUB_API_URL
    });

    const skills = await client.searchSkills({ query });
    for (const skill of skills) {
      console.log(`${skill.slug}\t${skill.displayName}\t${skill.verificationStatus}`);
    }
    return;
  }

  printHelp();
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

Environment:
  SKILLHUB_API_KEY
  SKILLHUB_API_URL
`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
