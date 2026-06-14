import type { SkillManifest, SkillSummary } from "@useskillhub/schema";
import { getPublicApiUrl, getServerApiUrl } from "@/lib/api-url";
import {
  getMarketplaceSkill,
  marketplaceSkills,
  type MarketplaceSkill,
} from "@/lib/marketplace-data";
import {
  isVerifiedSkillStatus,
  publicApiInspectCommand,
} from "@/lib/skill-install-state";
import {
  publicSkillDescription,
  publicSkillDisplayName,
  publicSkillTags,
} from "@/lib/public-skill-localization";

type SkillPriceRecord = {
  id: string;
  skillSlug: string;
  billingModel: "free" | "per_call" | "subscription";
  currency: string;
  unitAmountCents: number;
  status: "draft" | "active" | "archived";
  createdAt: string;
};

export type PublicMarketplaceSearchOptions = {
  billingModel?: MarketplaceSkill["billing"];
  category?: MarketplaceSkill["categoryKey"];
  limit?: number;
  permissionLevel?: MarketplaceSkill["risk"];
  query?: string;
  runtimeType?: "http" | "mcp" | "local";
  sort?: "adoption" | "low_risk" | "recommended" | "recent" | "success";
  verificationStatus?: SkillSummary["verificationStatus"];
};

export type MarketplaceSkillSuggestion = {
  reasons: Record<"en" | "zh", string[]>;
  score: number;
  skill: MarketplaceSkill;
};

export async function getPublicMarketplaceSkills(
  options: PublicMarketplaceSearchOptions = {},
): Promise<MarketplaceSkill[]> {
  const serverApiUrl = getServerApiUrl();

  try {
    const searchParams = new URLSearchParams({
      limit: String(options.limit ?? 50),
      sort: options.sort ?? "recommended",
    });

    appendSearchParam(searchParams, "billingModel", options.billingModel);
    appendSearchParam(searchParams, "category", options.category);
    appendSearchParam(searchParams, "permissionLevel", options.permissionLevel);
    appendSearchParam(searchParams, "q", options.query);
    appendSearchParam(searchParams, "runtimeType", options.runtimeType);
    appendSearchParam(
      searchParams,
      "verificationStatus",
      options.verificationStatus,
    );

    const response = await fetch(
      `${serverApiUrl}/v1/skills/search?${searchParams.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Marketplace skill search failed: ${response.status}`);
    }

    const payload = (await response.json()) as { skills: SkillSummary[] };
    const publicSkills = payload.skills.filter(isPublicCatalogSkillSummary);

    return Promise.all(
      publicSkills.map((summary) => hydrateMarketplaceSkill(summary)),
    );
  } catch {
    return marketplaceSkills;
  }
}

export async function getPublicMarketplaceSkill(
  slug: string,
): Promise<MarketplaceSkill | null> {
  if (isAcceptanceQaCatalogRecord(slug)) {
    return null;
  }

  const staticSkill = getMarketplaceSkill(slug);

  try {
    const [manifest, prices, summary] = await Promise.all([
      fetchSkillManifest(slug),
      fetchSkillPrices(slug),
      fetchSkillSummary(slug),
    ]);

    if (!manifest && !staticSkill) {
      return null;
    }

    if (!manifest) {
      return staticSkill ?? null;
    }

    return manifestToMarketplaceSkill(
      manifest,
      summary ?? manifestToSummary(manifest),
      prices,
      staticSkill,
    );
  } catch {
    return staticSkill ?? null;
  }
}

export async function getRelatedMarketplaceSkills(
  slug: string,
  limit = 3,
): Promise<MarketplaceSkillSuggestion[]> {
  const [current, skills] = await Promise.all([
    getPublicMarketplaceSkill(slug),
    getPublicMarketplaceSkills(),
  ]);

  if (!current) {
    return [];
  }

  return skills
    .filter((skill) => skill.slug !== current.slug)
    .map((skill) => scoreRelatedSkill(current, skill))
    .filter((suggestion) => suggestion.score > 0)
    .sort(
      (first, second) =>
        second.score - first.score ||
        first.skill.slug.localeCompare(second.skill.slug),
    )
    .slice(0, limit);
}

async function hydrateMarketplaceSkill(summary: SkillSummary) {
  const [manifest, prices] = await Promise.all([
    fetchSkillManifest(summary.slug),
    fetchSkillPrices(summary.slug),
  ]);
  return manifestToMarketplaceSkill(
    manifest,
    summary,
    prices,
    getMarketplaceSkill(summary.slug),
  );
}

async function fetchSkillManifest(slug: string) {
  const serverApiUrl = getServerApiUrl();

  try {
    const response = await fetch(
      `${serverApiUrl}/v1/skills/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SkillManifest;
  } catch {
    return null;
  }
}

async function fetchSkillSummary(slug: string) {
  const serverApiUrl = getServerApiUrl();

  try {
    const response = await fetch(
      `${serverApiUrl}/v1/skills/search?q=${encodeURIComponent(slug)}&limit=20`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { skills: SkillSummary[] };
    return (
      payload.skills.find(
        (skill) => skill.slug === slug && isPublicCatalogSkillSummary(skill),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function fetchSkillPrices(slug: string) {
  const serverApiUrl = getServerApiUrl();

  try {
    const response = await fetch(
      `${serverApiUrl}/v1/skills/${encodeURIComponent(slug)}/prices`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { prices: SkillPriceRecord[] };
    return payload.prices;
  } catch {
    return [];
  }
}

function manifestToMarketplaceSkill(
  manifest: SkillManifest | null,
  summary: SkillSummary,
  prices: SkillPriceRecord[],
  staticSkill?: MarketplaceSkill,
): MarketplaceSkill {
  const publicApiUrl = getPublicApiUrl();
  const activePrice =
    prices.find((price) => price.status === "active") ?? prices[0];
  const billing =
    activePrice?.billingModel ??
    summary.billingModel ??
    staticSkill?.billing ??
    "free";
  const runtime = manifest
    ? runtimeLabel(manifest.runtime.type)
    : summary.runtimeType
      ? runtimeLabel(summary.runtimeType)
      : (staticSkill?.runtime ?? "HTTP");
  const categoryKey = inferCategoryKey(summary.tags);
  const category = categoryLabel(categoryKey);
  const author =
    manifest?.author?.name ?? staticSkill?.author ?? "SkillHub Publisher";

  return {
    author,
    billing,
    category,
    categoryKey,
    changelog: staticSkill?.changelog ?? [
      {
        note: {
          en: `${summary.displayName} ${summary.version} is the latest registry version.`,
          zh: `${summary.displayName} ${summary.version} 是当前注册表版本。`,
        },
        version: summary.version,
      },
    ],
    inputExample:
      staticSkill?.inputExample ??
      schemaExample(manifest?.inputSchema, "input"),
    installs: staticSkill?.installs ?? formatCompactCount(summary.installCount),
    installsCommand: {
      cli: publicApiInspectCommand(publicApiUrl, summary.slug),
      mcp: `${publicApiUrl}/mcp`,
      sdk: `CLI/SDK preview: ${summary.slug}`,
    },
    latency: staticSkill?.latency ?? formatLatency(summary.avgLatencyMs),
    name: staticSkill?.name ?? publicSkillDisplayName(summary.slug, summary.displayName),
    outputExample:
      staticSkill?.outputExample ??
      schemaExample(manifest?.outputSchema, "output"),
    permissions: manifest
      ? permissionRows(manifest)
      : (staticSkill?.permissions ??
        permissionRowsFromRisk(summary.permissionLevel)),
    price: formatPrice(activePrice, billing, staticSkill),
    rating: formatRating(summary, staticSkill),
    feedbackCount: summary.feedbackCount ?? staticSkill?.feedbackCount ?? 0,
    reviews: staticSkill?.reviews ?? [
      {
        author: "SkillHub Registry",
        quote: {
          en: `Listed from the live registry with ${summary.verificationStatus} trust status.`,
          zh: `来自实时注册表，当前信任状态为 ${summary.verificationStatus}。`,
        },
      },
    ],
    risk: summary.permissionLevel,
    runtime,
    securityReport: manifest
      ? securityRows(manifest, summary)
      : (staticSkill?.securityReport ?? securityRows(null, summary)),
    slug: summary.slug,
    successRate:
      staticSkill?.successRate ?? formatSuccessRate(summary.successRate),
    summary: staticSkill?.summary ?? publicSkillDescription(summary.slug, summary.description),
    tags: staticSkill?.tags ?? publicSkillTags(summary.slug, summary.tags),
    useCases: staticSkill?.useCases ?? [
      {
        en: `Use ${summary.displayName} as a reusable agent capability instead of rebuilding the same workflow.`,
        zh: `把 ${summary.displayName} 当作可复用智能体能力，而不是重复重写同类流程。`,
      },
    ],
    verification: verificationLabel(summary.verificationStatus),
    lastReviewed: staticSkill?.lastReviewed ?? "live registry",
  };
}

function manifestToSummary(manifest: SkillManifest): SkillSummary {
  return {
    description: manifest.description,
    displayName: manifest.displayName,
    id: manifest.name,
    permissionLevel: permissionLevelFromManifest(manifest),
    slug: manifest.name,
    tags: manifest.tags,
    verificationStatus: "submitted",
    version: manifest.version,
  };
}

function isPublicCatalogSkillSummary(summary: SkillSummary) {
  return !isAcceptanceQaCatalogRecord(
    summary.slug,
    summary.displayName,
    summary.description,
    ...summary.tags,
  );
}

function isAcceptanceQaCatalogRecord(...parts: string[]) {
  const haystack = parts.join(" ").toLowerCase();

  return (
    /acceptance[-_\s]*qa/.test(haystack) ||
    /qa[-_\s]*partner/.test(haystack) ||
    /acceptance[-_\s]*partner/.test(haystack) ||
    /\bqa[-_\s]*20\d{6,}/.test(haystack)
  );
}

function permissionLevelFromManifest(
  manifest: SkillManifest,
): SkillSummary["permissionLevel"] {
  if (
    manifest.permissions.filesystem === "write" ||
    manifest.permissions.secrets.length > 0
  ) {
    return "high";
  }

  if (
    manifest.permissions.browser ||
    manifest.permissions.filesystem === "read" ||
    manifest.permissions.network
  ) {
    return "medium";
  }

  return "low";
}

function inferCategoryKey(tags: string[]): MarketplaceSkill["categoryKey"] {
  const normalized = tags.map((tag) => tag.toLowerCase());

  if (
    normalized.some((tag) => ["research", "browser", "citations"].includes(tag))
  ) {
    return "research";
  }

  if (normalized.some((tag) => ["crm", "sales", "revenue"].includes(tag))) {
    return "sales";
  }

  if (
    normalized.some((tag) =>
      ["support", "ticket", "classification"].includes(tag),
    )
  ) {
    return "support";
  }

  if (normalized.some((tag) => ["data", "analysis", "summary"].includes(tag))) {
    return "data";
  }

  if (
    normalized.some((tag) =>
      ["security", "trust", "review", "schema"].includes(tag),
    )
  ) {
    return "security";
  }

  return "ops";
}

function categoryLabel(categoryKey: MarketplaceSkill["categoryKey"]) {
  const labels = {
    data: { en: "Data", zh: "数据" },
    ops: { en: "Operations", zh: "运营" },
    research: { en: "Research", zh: "研究" },
    sales: { en: "Sales", zh: "销售" },
    security: { en: "Security", zh: "安全" },
    support: { en: "Support", zh: "客服" },
  } satisfies Record<
    MarketplaceSkill["categoryKey"],
    MarketplaceSkill["category"]
  >;

  return labels[categoryKey];
}

function runtimeLabel(
  runtime: SkillManifest["runtime"]["type"],
): MarketplaceSkill["runtime"] {
  if (runtime === "mcp") {
    return "MCP";
  }

  if (runtime === "local") {
    return "Local";
  }

  return "HTTP";
}

function formatPrice(
  price: SkillPriceRecord | undefined,
  billing: MarketplaceSkill["billing"],
  staticSkill?: MarketplaceSkill,
) {
  if (!price) {
    if (staticSkill?.price) {
      return staticSkill.price;
    }

    if (billing === "per_call") {
      return { en: "Per-call pricing", zh: "按次调用价格" };
    }

    if (billing === "subscription") {
      return { en: "Subscription pricing", zh: "订阅价格" };
    }

    return { en: "Free", zh: "免费" };
  }

  if (price.billingModel === "free" || price.unitAmountCents <= 0) {
    return { en: "Free", zh: "免费" };
  }

  const amount = new Intl.NumberFormat("en-US", {
    currency: price.currency.toUpperCase(),
    maximumFractionDigits: 3,
    style: "currency",
  }).format(price.unitAmountCents / 100);
  const suffix =
    billing === "subscription"
      ? { en: " / month", zh: " / 月" }
      : { en: " / call", zh: " / 次" };

  return {
    en: `${amount}${suffix.en}`,
    zh: `${amount}${suffix.zh}`,
  };
}

function verificationLabel(status: SkillSummary["verificationStatus"]) {
  const labels: Record<
    SkillSummary["verificationStatus"],
    MarketplaceSkill["verification"]
  > = {
    deprecated: { en: "Deprecated", zh: "已弃用" },
    draft: { en: "Draft", zh: "草稿" },
    rejected: { en: "Rejected", zh: "已拒绝" },
    submitted: { en: "Submitted", zh: "已提交" },
    suspended: { en: "Suspended", zh: "已暂停" },
    verified: { en: "Verified", zh: "已验证" },
  };

  return labels[status];
}

function permissionRows(
  manifest: SkillManifest,
): MarketplaceSkill["permissions"] {
  return [
    {
      key: "network",
      label: { en: "Network", zh: "网络" },
      value: manifest.permissions.network
        ? { en: "Required by manifest", zh: "Manifest 声明需要" }
        : { en: "Not requested", zh: "未请求" },
    },
    {
      key: "browser",
      label: { en: "Browser", zh: "浏览器" },
      value: manifest.permissions.browser
        ? { en: "Browser runtime access", zh: "需要浏览器运行权限" }
        : { en: "Not requested", zh: "未请求" },
    },
    {
      key: "filesystem",
      label: { en: "Filesystem", zh: "文件系统" },
      value: {
        en: manifest.permissions.filesystem,
        zh: manifest.permissions.filesystem,
      },
    },
    {
      key: "secrets",
      label: { en: "Secrets", zh: "密钥" },
      value:
        manifest.permissions.secrets.length > 0
          ? {
              en: manifest.permissions.secrets.join(", "),
              zh: manifest.permissions.secrets.join(", "),
            }
          : { en: "None", zh: "无" },
    },
  ];
}

function permissionRowsFromRisk(
  permissionLevel: SkillSummary["permissionLevel"],
): MarketplaceSkill["permissions"] {
  return [
    {
      key: "risk",
      label: { en: "Permission risk", zh: "权限风险" },
      value: { en: permissionLevel, zh: permissionLevel },
    },
  ];
}

function securityRows(
  manifest: SkillManifest | null,
  summary: SkillSummary,
): MarketplaceSkill["securityReport"] {
  return [
    {
      label: { en: "Registry status", zh: "注册表状态" },
      value: verificationLabel(summary.verificationStatus),
    },
    {
      label: { en: "Permission profile", zh: "权限画像" },
      value: { en: summary.permissionLevel, zh: summary.permissionLevel },
    },
    {
      label: { en: "Runtime", zh: "运行时" },
      value: {
        en: manifest ? runtimeLabel(manifest.runtime.type) : "Unknown",
        zh: manifest ? runtimeLabel(manifest.runtime.type) : "未知",
      },
    },
  ];
}

function qualitySignal(summary: SkillSummary) {
  if (summary.verificationStatus === "verified") {
    return "verified";
  }

  if (
    summary.verificationStatus === "suspended" ||
    summary.verificationStatus === "rejected"
  ) {
    return "blocked";
  }

  return "review";
}

function formatRating(summary: SkillSummary, staticSkill?: MarketplaceSkill) {
  if (
    typeof summary.averageRating === "number" &&
    Number.isFinite(summary.averageRating)
  ) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(summary.averageRating);
  }

  return staticSkill?.rating ?? qualitySignal(summary);
}

function schemaExample(
  schema: SkillManifest["inputSchema"] | undefined,
  label: string,
) {
  if (!schema) {
    return `{ "${label}": "..." }`;
  }

  return JSON.stringify(schema, null, 2);
}

function appendSearchParam(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value === undefined || value === "") {
    return;
  }

  params.set(key, String(value));
}

function formatCompactCount(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value ?? 0);
}

function formatLatency(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "n/a";
  }

  if (value >= 1000) {
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value / 1000)}s`;
  }

  return `${Math.round(value)}ms`;
}

function formatSuccessRate(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(value);
}

function scoreRelatedSkill(
  current: MarketplaceSkill,
  skill: MarketplaceSkill,
): MarketplaceSkillSuggestion {
  let score = 0;
  let relevanceSignals = 0;
  const reasons: MarketplaceSkillSuggestion["reasons"] = {
    en: [],
    zh: [],
  };

  if (skill.categoryKey === current.categoryKey) {
    score += 5;
    relevanceSignals += 1;
    reasons.en.push(`Same ${skill.category.en.toLowerCase()} category`);
    reasons.zh.push(`同属${skill.category.zh}类别`);
  }

  const sharedTags = sharedLocalizedTags(current, skill);

  if (sharedTags.en.length > 0) {
    score += Math.min(sharedTags.en.length, 3) * 2;
    relevanceSignals += 1;
    reasons.en.push(`Shares ${sharedTags.en.slice(0, 2).join(", ")} signals`);
    reasons.zh.push(`共享${sharedTags.zh.slice(0, 2).join("、")}信号`);
  }

  if (skill.runtime === current.runtime) {
    score += 1;
    reasons.en.push(`Same ${skill.runtime} runtime`);
    reasons.zh.push(`同为 ${skill.runtime} 运行时`);
  }

  if (riskRank(skill.risk) < riskRank(current.risk)) {
    score += 3;
    reasons.en.push("Lower permission risk");
    reasons.zh.push("权限风险更低");
  } else if (skill.risk === current.risk) {
    score += 1;
  }

  if (skill.billing === current.billing) {
    score += 1;
  } else if (skill.billing === "free") {
    score += 2;
    reasons.en.push("Free fallback option");
    reasons.zh.push("可作为免费备选");
  }

  if (isVerifiedSkillStatus(skill.verification.en)) {
    score += 2;
    reasons.en.push("Verified listing");
    reasons.zh.push("已验证上架");
  }

  if (relevanceSignals === 0) {
    score = 0;
  }

  if (score > 0 && reasons.en.length === 0) {
    reasons.en.push("Comparable marketplace capability");
    reasons.zh.push("可比较的市场技能");
  }

  return {
    reasons: {
      en: reasons.en.slice(0, 4),
      zh: reasons.zh.slice(0, 4),
    },
    score,
    skill,
  };
}

function sharedLocalizedTags(
  current: MarketplaceSkill,
  skill: MarketplaceSkill,
) {
  const currentTags = new Set(current.tags.en.map((tag) => tag.toLowerCase()));
  const en: string[] = [];
  const zh: string[] = [];

  skill.tags.en.forEach((tag, index) => {
    if (!currentTags.has(tag.toLowerCase())) {
      return;
    }

    en.push(tag);
    zh.push(skill.tags.zh[index] ?? tag);
  });

  return { en, zh };
}

function riskRank(risk: MarketplaceSkill["risk"]) {
  const ranks = {
    high: 3,
    low: 1,
    medium: 2,
  } satisfies Record<MarketplaceSkill["risk"], number>;

  return ranks[risk];
}
