#!/usr/bin/env node

const DEFAULT_APP_URL = "https://useskillhub.com";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_PATHS = [
  "/",
  "/?lang=zh",
  "/marketplace?lang=en",
  "/marketplace?lang=zh",
  "/registry?lang=en",
  "/registry?lang=zh",
  "/docs?lang=en",
  "/docs?lang=zh",
  "/skills/browser-research?lang=en",
  "/skills/browser-research?lang=zh",
  "/skills/dataset-summarizer?lang=en",
  "/skills/dataset-summarizer?lang=zh",
  "/login?lang=en",
  "/login?lang=zh",
  "/publish?lang=en",
  "/publish?lang=zh",
  "/developer?lang=en",
  "/developer?lang=zh",
  "/publisher?lang=en",
  "/publisher?lang=zh",
  "/account?lang=en",
  "/account?lang=zh",
  "/terms?lang=en",
  "/terms?lang=zh",
  "/publishers?lang=en",
  "/publishers?lang=zh",
  "/publishers/skillhub?lang=en",
  "/publishers/skillhub?lang=zh",
  "/support?lang=en",
  "/support?lang=zh",
  "/report?lang=en",
  "/report?lang=zh",
  "/security?lang=en",
  "/security?lang=zh",
  "/status?lang=en",
  "/status?lang=zh",
];

const args = parseArgs(process.argv.slice(2));
const appUrl = args.appUrl ?? process.env.SKILLHUB_PUBLIC_QA_APP_URL ?? DEFAULT_APP_URL;
const timeoutMs = Number(args.timeoutMs ?? process.env.SKILLHUB_PUBLIC_QA_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
const paths = args.paths ? args.paths.split(",").map(normalizePath).filter(Boolean) : DEFAULT_PATHS;
const results = [];
const fetchedPages = new Map();

console.log("SkillHub anonymous public QA");
console.log(`App: ${appUrl}`);
console.log(`Paths: ${paths.join(", ")}`);
console.log("");

for (const path of paths) {
  await checkPage(path);
}

await checkPublicCommands();
await checkPrimaryCtas();
await checkSkillCards();

printSummary(results);

if (results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
}

async function checkPage(path) {
  const name = `anonymous page ${path}`;

  try {
    const { status, text, url } = await fetchText(resolveUrl(path), timeoutMs);

    if (status !== 200) {
      fail(name, `expected HTTP 200, got ${status}`);
      return;
    }

    fetchedPages.set(path, { text, url });

    const plain = decodeHtml(stripTags(text)).toLowerCase();
    const stateFailure = validatePageState(path, plain, text);

    if (stateFailure) {
      fail(name, stateFailure);
      return;
    }

    pass(name, `html bytes=${Buffer.byteLength(text, "utf8")}`);
  } catch (error) {
    fail(name, error.message);
  }
}

async function checkPublicCommands() {
  const commands = new Map();

  for (const [path, page] of fetchedPages) {
    for (const url of extractCurlUrls(page.text)) {
      commands.set(url, path);
    }
  }

  if (commands.size === 0) {
    fail("public curl commands", "no public curl commands found");
    return;
  }

  for (const [url, path] of commands) {
    const name = `public command ${url}`;

    try {
      const { status, text } = await fetchText(url, timeoutMs, {
        Accept: "application/json,text/plain,*/*",
      });

      if (status < 200 || status >= 400) {
        fail(name, `command from ${path} returned HTTP ${status}`);
        continue;
      }

      if (url.endsWith("/mcp")) {
        const payload = parseJson(text);

        if (payload?.ok !== true || payload?.stage !== "developer_preview") {
          fail(name, "GET /mcp did not return safe Developer Preview metadata");
          continue;
        }
      }

      pass(name, `from ${path}, status=${status}`);
    } catch (error) {
      fail(name, error.message);
    }
  }
}

async function checkPrimaryCtas() {
  const ctas = new Map();

  for (const [path, page] of fetchedPages) {
    for (const cta of extractButtonLinks(page.text)) {
      const url = resolveHref(cta.href, page.url);

      if (!url || shouldSkipCta(url)) {
        continue;
      }

      ctas.set(`${path} ${cta.label} ${url}`, { label: cta.label, path, url });
    }
  }

  for (const cta of ctas.values()) {
    const name = `primary CTA ${cta.path} -> ${cta.label}`;

    try {
      const { status } = await fetchText(stripHash(cta.url), timeoutMs);

      if (status < 200 || status >= 400) {
        fail(name, `target ${cta.url} returned HTTP ${status}`);
        continue;
      }

      pass(name, `${status} ${cta.url}`);
    } catch (error) {
      fail(name, error.message);
    }
  }
}

async function checkSkillCards() {
  const marketplacePages = [...fetchedPages.entries()].filter(([path]) =>
    path.startsWith("/marketplace"),
  );
  const skillLinks = new Set();

  for (const [, page] of marketplacePages) {
    for (const href of extractHrefs(page.text)) {
      const url = resolveHref(href, page.url);

      if (url && new URL(url).pathname.startsWith("/skills/")) {
        const leak = findPublicTestDataLeak(new URL(url).pathname.toLowerCase());

        if (leak) {
          fail(
            "marketplace skill cards",
            `public marketplace links to acceptance/QA test data: ${leak}`,
          );
          return;
        }

        skillLinks.add(url);
      }
    }
  }

  if (skillLinks.size === 0) {
    fail("marketplace skill cards", "no skill card links found on marketplace");
    return;
  }

  for (const url of skillLinks) {
    const name = `skill card ${new URL(url).pathname}`;

    try {
      const { status, text } = await fetchText(url, timeoutMs);

      if (status !== 200) {
        fail(name, `expected HTTP 200, got ${status}`);
        continue;
      }

      const plain = decodeHtml(stripTags(text)).toLowerCase();

      if (new URL(url).pathname.includes("dataset-summarizer")) {
        const forbidden = [
          "install to project",
          "test invocation",
          "open developer workspace",
          "usage ledger",
        ].filter((token) => plain.includes(token));

        const hasInspectionOnly =
          plain.includes("inspection only") || plain.includes("\u4ec5\u53ef\u67e5\u770b");

        if (!hasInspectionOnly || forbidden.length > 0) {
          fail(name, `submitted skill is not inspection-only safe: ${forbidden.join(", ")}`);
          continue;
        }
      }

      pass(name, `status=${status}`);
    } catch (error) {
      fail(name, error.message);
    }
  }
}

function validatePageState(path, plain, html) {
  const publicTestDataLeak = findPublicTestDataLeak(plain);

  if (publicTestDataLeak) {
    return `public page exposes acceptance/QA test data: ${publicTestDataLeak}`;
  }

  if (path === "/" || path.startsWith("/?")) {
    const forbidden = [
      "view workspace proof",
      "new skill",
      "commercial ledger",
      "\u67e5\u770b\u5de5\u4f5c\u53f0\u8bc1\u636e",
      "\u65b0\u5efa\u6280\u80fd",
      "\u5546\u4e1a\u8d26\u672c",
    ].filter((token) => plain.includes(token));

    if (forbidden.length > 0) {
      return `home page exposes stale anonymous CTA wording: ${forbidden.join(", ")}`;
    }
  }

  if (path.startsWith("/docs")) {
    const forbidden = [
      "mcp status",
      "discover, install, and test",
      "upload, submit, monetize",
      "process money",
      "ledger and payouts",
      "open operations",
      "api map for the operating platform",
      "commercial readiness and money movement state",
      "\u8fdb\u5165\u8fd0\u8425",
      "\u5904\u7406\u8d44\u91d1",
      "\u8d26\u672c\u548c\u63d0\u73b0",
      "\u5546\u4e1a\u5316\u5c31\u7eea\u548c\u8d44\u91d1\u6d41\u8f6c\u72b6\u6001",
      "mcp \u72b6\u6001",
    ].filter((token) => plain.includes(token));

    if (forbidden.length > 0) {
      return `docs page exposes stale public launch wording: ${forbidden.join(", ")}`;
    }
  }

  if (path.startsWith("/registry")) {
    const forbidden = [
      "new skill",
      "open api docs",
      "default public install target",
      "can install and call",
      "project install pins",
      "commercial",
      "\u65b0\u5efa\u6280\u80fd",
      "\u6253\u5f00 api \u6587\u6863",
      "\u9ed8\u8ba4\u516c\u5f00\u5b89\u88c5\u76ee\u6807",
      "\u5546\u4e1a\u5316",
    ].filter((token) => plain.includes(token));

    if (forbidden.length > 0) {
      return `registry page exposes stale public launch wording: ${forbidden.join(", ")}`;
    }
  }

  if (plain.includes("user access token") || plain.includes("token fallback")) {
    return "public page exposes internal token fallback wording";
  }

  if (/\bskillhub\s+install\b/i.test(plain) || /@useskillhub\/sdk/i.test(plain)) {
    return "public page exposes copy-ready unpublished CLI/SDK command";
  }

  if (path.startsWith("/login")) {
    const required = [
      ["google"],
      ["github"],
      ["register", "\u6ce8\u518c"],
    ];
    const missing = required
      .filter((tokens) => !tokens.some((token) => plain.includes(token)))
      .map((tokens) => tokens[0]);

    if (missing.length > 0) {
      return `login page missing normal auth path markers: ${missing.join(", ")}`;
    }
  }

  if (path.startsWith("/marketplace")) {
    if (
      html.includes('curl "https://api.useskillhub.com/mcp"') &&
      !plain.includes("mcp metadata only") &&
      !plain.includes("\u4ec5 mcp \u5143\u6570\u636e")
    ) {
      return "marketplace exposes curl /mcp without metadata-only framing";
    }

    const forbidden = [
      "paypal/alipay payout details",
      "manual payout",
      "payout governance",
      "artificial payout",
      "paypal/alipay \u63d0\u73b0\u8d44\u6599",
      "\u4eba\u5de5\u6253\u6b3e",
      "\u63d0\u73b0\u6cbb\u7406",
    ].filter((token) => plain.includes(token));

    if (forbidden.length > 0) {
      return `marketplace exposes paid-readiness details too early: ${forbidden.join(", ")}`;
    }
  }

  if (path.includes("/skills/browser-research")) {
    if (!plain.includes("sign in") && !plain.includes("\u767b\u5f55")) {
      return "verified skill page does not frame project/runtime path as sign-in gated";
    }
  }

  if (path.includes("/skills/dataset-summarizer")) {
    const forbidden = [
      "publisher payout",
      "install to project",
      "test invocation",
      "open developer workspace",
      "usage ledger",
      "runtime can be tested",
      "\u53d1\u5e03\u8005\u63d0\u73b0",
    ].filter((token) => plain.includes(token));

    if (!plain.includes("inspection only") && !plain.includes("\u4ec5\u53ef\u67e5\u770b")) {
      return "submitted skill page missing inspection-only marker";
    }

    if (forbidden.length > 0) {
      return `submitted skill page exposes unavailable action markers: ${forbidden.join(", ")}`;
    }
  }

  if (path.startsWith("/terms")) {
    if (!plain.includes("developer preview") && !plain.includes("\u5f00\u53d1\u8005\u9884\u89c8")) {
      return "terms page is not framed as Developer Preview";
    }
  }

  if (path.startsWith("/security") || path.startsWith("/support") || path.startsWith("/report")) {
    if (!plain.includes("api keys") && !plain.includes("api key")) {
      return "support/security/report path does not warn against sending API keys";
    }
  }

  return "";
}

function extractCurlUrls(html) {
  return [...decodeHtml(html).matchAll(/curl\s+"([^"]+)"/g)].map((match) => match[1]);
}

function extractButtonLinks(html) {
  const links = [];
  const anchorPattern = /<a\b([^>]*\bclass="[^"]*(?:primary-button|secondary-button)[^"]*"[^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorPattern)) {
    const href = match[1].match(/\bhref="([^"]+)"/i)?.[1];

    if (!href) {
      continue;
    }

    links.push({
      href,
      label: decodeHtml(stripTags(match[2])).replace(/\s+/g, " ").trim() || href,
    });
  }

  return links;
}

function extractHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);
}

function resolveUrl(path) {
  return new URL(path, appUrl).toString();
}

function resolveHref(href, base) {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }

  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function shouldSkipCta(url) {
  const parsed = new URL(url);
  const appHost = new URL(appUrl).hostname;

  return parsed.hostname !== appHost && !parsed.hostname.endsWith("useskillhub.com");
}

function stripHash(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

function normalizePath(path) {
  return path.startsWith("/") ? path : `/${path}`;
}

async function fetchText(url, timeoutMs, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        ...headers,
      },
      signal: controller.signal,
    });

    return {
      status: response.status,
      text: await response.text(),
      url: response.url,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, " ");
}

function findPublicTestDataLeak(text) {
  const markers = [
    "acceptance-qa-",
    "acceptance qa",
    "qa-partner",
    "qa partner",
    "acceptance partner",
  ];

  return markers.find((marker) => text.includes(marker)) ?? "";
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    const nextValue = () => {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      index += 1;
      return value;
    };

    if (arg === "--app-url") {
      parsed.appUrl = nextValue();
      continue;
    }

    if (arg === "--paths") {
      parsed.paths = nextValue();
      continue;
    }

    if (arg === "--timeout-ms") {
      parsed.timeoutMs = nextValue();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return parsed;
}

function pass(name, message) {
  results.push({ message, name, status: "pass" });
  console.log(`PASS ${name} - ${message}`);
}

function fail(name, message) {
  results.push({ message, name, status: "fail" });
  console.log(`FAIL ${name} - ${message}`);
}

function printSummary(items) {
  const counts = items.reduce(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    { fail: 0, pass: 0 },
  );

  console.log("");
  console.log(`Summary: ${counts.pass} passed, ${counts.fail} failed`);
}
