import { open, stat } from "node:fs/promises";

type AccessLogChannel = {
  label: string;
  count: number;
  share: number;
};

export type AccessLogAnalytics = {
  aiReferrals: AccessLogChannel[];
  channels: AccessLogChannel[];
  connected: boolean;
  files: string[];
  message: string;
  paths: AccessLogChannel[];
  sourceLabel: string;
  suspiciousIpCount: number;
  todayPageViews: number;
  todayUniqueIps: number;
  todayUv: number;
  topPath: string;
  topReferrer: string;
};

type ParsedAccessLine = {
  ip: string;
  method: string;
  path: string;
  referrer: string;
  status: number;
  userAgent: string;
  ymd: string;
};

const DEFAULT_LOG_PATHS = [
  "/var/log/skillhub/useskillhub/access.log",
  "/var/log/skillhub/www.useskillhub/access.log",
  "/var/log/skillhub/access.log"
];
const DEFAULT_MAX_BYTES = 16 * 1024 * 1024;
const STATIC_PATH_PATTERN = /\.(?:avif|css|gif|ico|jpeg|jpg|js|map|png|svg|txt|webmanifest|woff2?)$/i;

export async function getAccessLogAnalytics(now = new Date()): Promise<AccessLogAnalytics> {
  const logPaths = getConfiguredLogPaths();
  const maxBytes = getMaxBytes();
  const todayKey = getDateKey(now);
  const parsedLines: ParsedAccessLine[] = [];
  const connectedFiles: string[] = [];

  for (const logPath of logPaths) {
    const text = await readFileTail(logPath, maxBytes);

    if (!text) {
      continue;
    }

    connectedFiles.push(logPath);

    for (const rawLine of text.split(/\r?\n/)) {
      const parsed = parseAccessLine(rawLine);

      if (parsed?.ymd === todayKey && isPublicPageRequest(parsed)) {
        parsedLines.push(parsed);
      }
    }
  }

  if (connectedFiles.length === 0) {
    return {
      aiReferrals: buildEmptyChannels(["ChatGPT", "Perplexity", "Claude", "Gemini", "Copilot"]),
      channels: buildEmptyChannels(["Google", "GitHub", "Direct", "Bing"]),
      connected: false,
      files: [],
      message: "Access log not mounted",
      paths: buildEmptyChannels(["/"]),
      sourceLabel: "Access log pending",
      suspiciousIpCount: 0,
      todayPageViews: 0,
      todayUniqueIps: 0,
      todayUv: 0,
      topPath: "Not connected",
      topReferrer: "Not connected"
    };
  }

  const uniqueVisitors = new Set<string>();
  const uniqueIps = new Set<string>();
  const suspiciousIps = new Set<string>();
  const channelCounts = new Map<string, number>();
  const aiCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();

  for (const line of parsedLines) {
    uniqueIps.add(line.ip);
    uniqueVisitors.add(`${line.ip}|${line.userAgent || "unknown"}`);
    increment(pathCounts, normalizePath(line.path));

    const referrer = normalizeReferrer(line.referrer);

    if (referrer !== "Direct") {
      increment(referrerCounts, referrer);
    }

    increment(channelCounts, classifyChannel(line.referrer));

    const aiSource = classifyAiReferral(line.referrer);

    if (aiSource) {
      increment(aiCounts, aiSource);
    }

    if (line.status >= 400 || isSensitiveProbePath(line.path)) {
      suspiciousIps.add(line.ip);
    }
  }

  return {
    aiReferrals: buildChannels(["ChatGPT", "Perplexity", "Claude", "Gemini", "Copilot"], aiCounts),
    channels: buildChannels(["Google", "GitHub", "Direct", "Bing"], channelCounts),
    connected: true,
    files: connectedFiles,
    message: parsedLines.length > 0 ? "Access log connected" : "Access log mounted; no public page hits today",
    paths: buildTopChannels(pathCounts, parsedLines.length, 6),
    sourceLabel: "Nginx / 1Panel access.log",
    suspiciousIpCount: suspiciousIps.size,
    todayPageViews: parsedLines.length,
    todayUniqueIps: uniqueIps.size,
    todayUv: uniqueVisitors.size,
    topPath: getTopEntry(pathCounts) ?? "No page view today",
    topReferrer: getTopEntry(referrerCounts) ?? "Direct"
  };
}

function getConfiguredLogPaths() {
  return (process.env.SKILLHUB_ACCESS_LOG_PATHS ?? DEFAULT_LOG_PATHS.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMaxBytes() {
  const value = Number(process.env.SKILLHUB_ACCESS_LOG_MAX_BYTES);
  return Number.isFinite(value) && value > 0 ? Math.min(value, 64 * 1024 * 1024) : DEFAULT_MAX_BYTES;
}

async function readFileTail(path: string, maxBytes: number) {
  try {
    const fileStat = await stat(path);

    if (!fileStat.isFile() || fileStat.size === 0) {
      return "";
    }

    const start = Math.max(0, fileStat.size - maxBytes);
    const length = fileStat.size - start;
    const buffer = Buffer.alloc(length);
    const file = await open(path, "r");

    try {
      await file.read(buffer, 0, length, start);
    } finally {
      await file.close();
    }

    return buffer.toString("utf8");
  } catch {
    return "";
  }
}

function parseAccessLine(line: string): ParsedAccessLine | null {
  if (!line.trim()) {
    return null;
  }

  const dateMatch = line.match(/\[(\d{2})\/([A-Za-z]{3})\/(\d{4}):/);
  const requestParts = Array.from(line.matchAll(/"([^"]*)"/g)).map((match) => match[1]);
  const request = requestParts[0] ?? "";
  const requestMatch = request.match(/^([A-Z]+)\s+(\S+)\s+HTTP\/\d(?:\.\d)?$/);
  const statusMatch = line.match(/"\s+(\d{3})\s+/);
  const ip = extractClientIp(line);

  if (!dateMatch || !requestMatch || !statusMatch || !ip) {
    return null;
  }

  return {
    ip,
    method: requestMatch[1],
    path: requestMatch[2],
    referrer: requestParts[1] ?? "-",
    status: Number(statusMatch[1]),
    userAgent: requestParts[2] ?? "",
    ymd: `${dateMatch[3]}-${String(monthToNumber(dateMatch[2])).padStart(2, "0")}-${dateMatch[1]}`
  };
}

function extractClientIp(line: string) {
  const forwardedMatch = line.match(/(?:CF-Connecting-IP|X-Forwarded-For)[:=]\s*"?([0-9a-fA-F:.]+)/i);

  if (forwardedMatch?.[1]) {
    return forwardedMatch[1];
  }

  const firstToken = line.match(/^(\S+)/)?.[1];

  return firstToken && firstToken !== "-" ? firstToken : null;
}

function isPublicPageRequest(line: ParsedAccessLine) {
  if (!["GET", "HEAD"].includes(line.method) || line.status >= 500) {
    return false;
  }

  const path = line.path.split("?")[0] ?? "/";

  return (
    !path.startsWith("/_next/") &&
    !path.startsWith("/api/") &&
    !path.startsWith("/icon") &&
    !path.startsWith("/favicon") &&
    path !== "/robots.txt" &&
    path !== "/sitemap.xml" &&
    !STATIC_PATH_PATTERN.test(path)
  );
}

function classifyChannel(referrer: string) {
  const value = referrer.toLowerCase();

  if (!value || value === "-") {
    return "Direct";
  }

  if (value.includes("google.")) {
    return "Google";
  }

  if (value.includes("github.")) {
    return "GitHub";
  }

  if (value.includes("bing.")) {
    return "Bing";
  }

  return "Other";
}

function classifyAiReferral(referrer: string) {
  const value = referrer.toLowerCase();

  if (value.includes("chatgpt") || value.includes("openai.")) {
    return "ChatGPT";
  }

  if (value.includes("perplexity.")) {
    return "Perplexity";
  }

  if (value.includes("claude.") || value.includes("anthropic.")) {
    return "Claude";
  }

  if (value.includes("gemini.") || value.includes("bard.google.")) {
    return "Gemini";
  }

  if (value.includes("copilot.") || value.includes("bing.com/chat")) {
    return "Copilot";
  }

  return null;
}

function normalizePath(path: string) {
  const cleanPath = path.split("?")[0] || "/";
  return cleanPath.length > 48 ? `${cleanPath.slice(0, 45)}...` : cleanPath;
}

function normalizeReferrer(referrer: string) {
  if (!referrer || referrer === "-") {
    return "Direct";
  }

  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function isSensitiveProbePath(path: string) {
  const value = path.toLowerCase();
  return value.includes("/wp-") || value.includes("/.env") || value.includes("/phpmyadmin") || value.includes("/admin");
}

function buildChannels(labels: string[], counts: Map<string, number>): AccessLogChannel[] {
  const total = labels.reduce((sum, label) => sum + (counts.get(label) ?? 0), 0);

  return labels.map((label) => {
    const count = counts.get(label) ?? 0;
    return {
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });
}

function buildEmptyChannels(labels: string[]): AccessLogChannel[] {
  return labels.map((label) => ({ label, count: 0, share: 0 }));
}

function buildTopChannels(counts: Map<string, number>, total: number, limit: number): AccessLogChannel[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0
    }));
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function getTopEntry(map: Map<string, number>) {
  let winner: string | null = null;
  let winnerCount = 0;

  for (const [key, count] of map) {
    if (count > winnerCount) {
      winner = key;
      winnerCount = count;
    }
  }

  return winner;
}

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: process.env.SKILLHUB_ANALYTICS_TIME_ZONE ?? "Asia/Shanghai",
    year: "numeric"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? String(date.getFullYear());
  const month = parts.find((part) => part.type === "month")?.value ?? String(date.getMonth() + 1).padStart(2, "0");
  const day = parts.find((part) => part.type === "day")?.value ?? String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function monthToNumber(month: string) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month) + 1;
}
