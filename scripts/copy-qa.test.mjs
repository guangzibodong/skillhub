import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();
const scanRoots = ["apps/web/app", "apps/web/components", "apps/web/lib"];
const extensions = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx"]);
const ignoredSuffixes = [".bak"];

const bannedPhrases = [
  "同一台主机",
  "宿主",
  "运营队列",
  "控制点",
  "证据包",
  "治理边界",
  "预发布元数据",
  "预发布付费元数据",
  "运行证据",
  "运行治理",
  "runtime governance",
  "runtime plane",
  "control plane",
  "handoff packet",
  "evidence packet",
  "control point",
  "operations queue",
  "Operating queue"
];

test("web user-facing copy avoids internal launch phrases", async () => {
  const matches = [];

  for (const scanRoot of scanRoots) {
    const files = await listFiles(join(root, scanRoot));

    for (const file of files) {
      if (!shouldScan(file)) {
        continue;
      }

      const text = await readFile(file, "utf8");
      const lines = text.split(/\r?\n/);

      lines.forEach((line, index) => {
        for (const phrase of bannedPhrases) {
          if (line.includes(phrase)) {
            matches.push(`${relative(root, file)}:${index + 1}: ${phrase}`);
          }
        }
      });
    }
  }

  assert.deepEqual(matches, []);
});

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function shouldScan(file) {
  if (ignoredSuffixes.some((suffix) => file.endsWith(suffix))) {
    return false;
  }

  for (const extension of extensions) {
    if (file.endsWith(extension)) {
      return true;
    }
  }

  return false;
}
