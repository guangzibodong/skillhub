"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BadgeCheck,
  ExternalLink,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import {
  localizeText,
  marketplaceCategories,
  type MarketplaceSkill,
} from "@/lib/marketplace-data";
import {
  publisherSlugFromName,
  type PublicPublisherProfile,
} from "@/lib/public-publishers";
import { isVerifiedSkillStatus } from "@/lib/skill-install-state";

type MarketplaceBrowserProps = {
  initialFilters?: MarketplaceInitialFilters;
  locale: Locale;
  publisherProfiles?: PublicPublisherProfile[];
  skills: MarketplaceSkill[];
};

type MarketplaceInitialFilters = {
  category?: string;
  pricing?: string;
  query?: string;
  risk?: string;
  runtime?: string;
  sort?: string;
  verification?: string;
};

const labels = {
  en: {
    activeFilters: "Active filters",
    allRisk: "All risk",
    allRuntime: "All runtime",
    allStatus: "All status",
    by: "by",
    catalog: "Skill catalog",
    category: "Category",
    details: "View Details",
    emptyBody:
      "Try another keyword or filter. If you are building a missing capability, start the publisher review path.",
    emptyCta: "Publish a Skill",
    emptyTitle: "No skills match these filters",
    filters: "Filters",
    queryFilter: "Search",
    reset: "Reset",
    results: "results",
    risk: "Risk",
    runtime: "Runtime",
    search: "Search skills by name, publisher, use case, or permission",
    status: "Status",
    statusLabels: {
      all: "All status",
      restricted: "Preview",
      submitted: "Submitted",
      verified: "Verified",
    },
    riskLabels: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk",
    },
  },
  zh: {
    activeFilters: "当前筛选",
    allRisk: "全部风险",
    allRuntime: "全部运行时",
    allStatus: "全部状态",
    by: "来自",
    catalog: "技能目录",
    category: "类别",
    details: "查看详情",
    emptyBody: "换一个关键词或筛选条件试试。如果你正在构建缺失能力，可以进入发布审核流程。",
    emptyCta: "发布技能",
    emptyTitle: "没有符合条件的技能",
    filters: "筛选",
    queryFilter: "搜索",
    reset: "重置",
    results: "个结果",
    risk: "风险",
    runtime: "运行时",
    search: "按名称、发布者、场景或权限搜索技能",
    status: "状态",
    statusLabels: {
      all: "全部状态",
      restricted: "预览",
      submitted: "已提交",
      verified: "已验证",
    },
    riskLabels: {
      high: "高风险",
      low: "低风险",
      medium: "中风险",
    },
  },
} as const;

const riskOptions = ["all", "low", "medium", "high"] as const;
const runtimeOptions = ["all", "REST", "MCP", "Local"] as const;
const statusOptions = ["all", "verified", "submitted", "restricted"] as const;

type CategoryKey = (typeof marketplaceCategories)[number]["key"];
type RiskKey = (typeof riskOptions)[number];
type RuntimeKey = (typeof runtimeOptions)[number];
type StatusKey = (typeof statusOptions)[number];

export function MarketplaceBrowser({
  initialFilters,
  locale,
  publisherProfiles = [],
  skills,
}: MarketplaceBrowserProps) {
  const normalizedInitialFilters = useMemo(
    () => normalizeInitialFilters(initialFilters),
    [initialFilters],
  );
  const [query, setQuery] = useState(normalizedInitialFilters.query);
  const [category, setCategory] = useState<CategoryKey>(
    normalizedInitialFilters.category,
  );
  const [risk, setRisk] = useState<RiskKey>(normalizedInitialFilters.risk);
  const [runtime, setRuntime] = useState<RuntimeKey>(
    normalizedInitialFilters.runtime,
  );
  const [status, setStatus] = useState<StatusKey>(
    normalizedInitialFilters.status,
  );
  const dictionary = labels[locale];
  const publicPublisherSlugs = useMemo(
    () => new Set(publisherProfiles.map((publisher) => publisher.slug)),
    [publisherProfiles],
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    risk !== "all" ||
    runtime !== "all" ||
    status !== "all";

  const activeFilterPills = useMemo(() => {
    const pills: string[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      pills.push(`${dictionary.queryFilter}: ${trimmedQuery}`);
    }

    if (category !== "all") {
      const categoryLabel = marketplaceCategories.find((item) => item.key === category)?.label;
      pills.push(`${dictionary.category}: ${categoryLabel ? localizeText(categoryLabel, locale) : category}`);
    }

    if (risk !== "all") {
      pills.push(`${dictionary.risk}: ${dictionary.riskLabels[risk]}`);
    }

    if (runtime !== "all") {
      pills.push(`${dictionary.runtime}: ${runtime}`);
    }

    if (status !== "all") {
      pills.push(`${dictionary.status}: ${dictionary.statusLabels[status]}`);
    }

    return pills;
  }, [category, dictionary, locale, query, risk, runtime, status]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();

    if (locale === "zh") {
      params.set("lang", "zh");
    }

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }

    if (category !== "all") {
      params.set("category", category);
    }

    if (risk !== "all") {
      params.set("permissionLevel", risk);
    }

    if (runtime !== "all") {
      params.set("runtime", runtime === "REST" ? "rest" : runtime.toLowerCase());
    }

    if (status !== "all") {
      params.set("verification", status);
    }

    const nextPath = `/marketplace${params.toString() ? `?${params}` : ""}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== nextPath) {
      window.history.replaceState(null, "", nextPath);
    }
  }, [category, locale, query, risk, runtime, status]);

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return skills
      .filter((skill) => {
        const text = searchableText(skill, locale);
        const queryMatch =
          normalizedQuery.length === 0 || text.includes(normalizedQuery);
        const categoryMatch =
          category === "all" || skill.categoryKey === category;
        const riskMatch = risk === "all" || skill.risk === risk;
        const runtimeMatch = runtime === "all" || skill.runtime === runtime;
        const statusMatch = status === "all" || statusKey(skill) === status;

        return queryMatch && categoryMatch && riskMatch && runtimeMatch && statusMatch;
      })
      .sort(compareSkills);
  }, [category, locale, query, risk, runtime, skills, status]);

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setRisk("all");
    setRuntime("all");
    setStatus("all");
  }

  return (
    <section
      className="market-browser"
      aria-labelledby="market-browser-heading"
    >
      <div className="market-browser__top">
        <div>
          <div className="card-kicker">
            <Search size={16} aria-hidden="true" />
            <span id="market-browser-heading">{dictionary.catalog}</span>
          </div>
          <strong>
            {filteredSkills.length} {dictionary.results}
          </strong>
        </div>
        <label className="market-search">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label={dictionary.search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.search}
          />
        </label>
      </div>

      {hasActiveFilters ? (
        <div className="market-active-filters" aria-label={dictionary.activeFilters}>
          <span>{dictionary.activeFilters}</span>
          <div>
            {activeFilterPills.map((pill) => (
              <strong key={pill}>{pill}</strong>
            ))}
          </div>
          <button
            className="filter-reset-button"
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw size={14} aria-hidden="true" />
            {dictionary.reset}
          </button>
        </div>
      ) : null}

      <div className="market-filter-panel" aria-label={dictionary.filters}>
        <div className="market-filter-panel__head">
          <span>
            <SlidersHorizontal size={15} aria-hidden="true" />
            {dictionary.filters}
          </span>
        </div>

        <FilterGroup label={dictionary.category}>
          {marketplaceCategories.map((item) => (
            <button
              className={
                category === item.key
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item.key}
              onClick={() => setCategory(item.key)}
              type="button"
            >
              {localizeText(item.label, locale)}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label={dictionary.runtime}>
          {runtimeOptions.map((item) => (
            <button
              className={
                runtime === item
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item}
              onClick={() => setRuntime(item)}
              type="button"
            >
              {item === "all" ? dictionary.allRuntime : item}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label={dictionary.risk}>
          {riskOptions.map((item) => (
            <button
              className={
                risk === item
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item}
              onClick={() => setRisk(item)}
              type="button"
            >
              {item === "all" ? dictionary.allRisk : dictionary.riskLabels[item]}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label={dictionary.status}>
          {statusOptions.map((item) => (
            <button
              className={
                status === item
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item}
              onClick={() => setStatus(item)}
              type="button"
            >
              {dictionary.statusLabels[item]}
            </button>
          ))}
        </FilterGroup>
      </div>

      {filteredSkills.length > 0 ? (
        <div className="market-card-grid">
          {filteredSkills.map((skill) => {
            const publisherSlug = publisherSlugFromName(skill.author);
            const hasPublisherProfile = publicPublisherSlugs.has(publisherSlug);
            const skillStatus = statusKey(skill);

            return (
              <article className="market-skill-card lift-card" key={skill.slug}>
                <div className="market-skill-card__head">
                  <div className="market-skill-card__icon" aria-hidden="true">
                    <Zap size={18} />
                  </div>
                  <div>
                    <span>{localizeText(skill.category, locale)}</span>
                    <h2>{localizeText(skill.name, locale)}</h2>
                    {hasPublisherProfile ? (
                      <a
                        className="market-skill-card__publisher"
                        href={localizedHref(`/publishers/${publisherSlug}`, locale)}
                      >
                        {dictionary.by} {skill.author}
                      </a>
                    ) : (
                      <span className="market-skill-card__publisher market-skill-card__publisher--text">
                        {dictionary.by} {skill.author}
                      </span>
                    )}
                  </div>
                  <span className={`risk-badge risk-badge--${skill.risk}`}>
                    {dictionary.riskLabels[skill.risk]}
                  </span>
                </div>

                <p>{localizeText(skill.summary, locale)}</p>

                <div className="market-skill-card__meta market-skill-card__meta--compact">
                  <span>
                    <BadgeCheck size={14} aria-hidden="true" />
                    {dictionary.statusLabels[skillStatus]}
                  </span>
                  <span>
                    <ShieldCheck size={14} aria-hidden="true" />
                    {skill.runtime}
                  </span>
                  <span>
                    <ShieldCheck size={14} aria-hidden="true" />
                    {dictionary.riskLabels[skill.risk]}
                  </span>
                </div>

                <div className="tag-list">
                  {skill.tags[locale].slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="market-skill-card__foot">
                  <div>
                    <span>{localizeText(skill.verification, locale)}</span>
                    <strong>{skill.author}</strong>
                  </div>
                  <a
                    className="secondary-button"
                    href={localizedHref(`/skills/${skill.slug}`, locale)}
                  >
                    <span>{dictionary.details}</span>
                    <ExternalLink size={15} aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="market-empty-state">
          <Search size={26} aria-hidden="true" />
          <h3>{dictionary.emptyTitle}</h3>
          <p>{dictionary.emptyBody}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                className="secondary-button secondary-button--compact"
                onClick={resetFilters}
                type="button"
              >
                <RotateCcw size={15} aria-hidden="true" />
                <span>{dictionary.reset}</span>
              </button>
            ) : null}
            <a
              className="primary-button"
              href={localizedHref("/publish", locale)}
            >
              {dictionary.emptyCta}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

function normalizeInitialFilters(filters: MarketplaceInitialFilters = {}) {
  return {
    category: normalizeOption(
      filters.category,
      marketplaceCategories.map((item) => item.key),
      "all",
    ),
    query: String(filters.query ?? "").trim().slice(0, 120),
    risk: normalizeOption(filters.risk, riskOptions, "all"),
    runtime: normalizeRuntime(filters.runtime),
    status: normalizeStatus(filters.verification),
  };
}

function normalizeOption<T extends string>(
  value: string | undefined,
  options: readonly T[],
  fallback: T,
): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

function normalizeRuntime(value: string | undefined): RuntimeKey {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "http" || normalized === "rest") {
    return "REST";
  }

  if (normalized === "mcp") {
    return "MCP";
  }

  if (normalized === "local") {
    return "Local";
  }

  return "all";
}

function normalizeStatus(value: string | undefined): StatusKey {
  if (value === "review") {
    return "submitted";
  }

  return normalizeOption(value, statusOptions, "all");
}

function FilterGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="market-filter-group">
      <span>{label}</span>
      <div className="market-filter-row">{children}</div>
    </div>
  );
}

function searchableText(skill: MarketplaceSkill, locale: Locale) {
  return [
    localizeText(skill.name, locale),
    localizeText(skill.summary, locale),
    localizeText(skill.category, locale),
    skill.author,
    skill.runtime,
    skill.risk,
    localizeText(skill.verification, locale),
    skill.verification.en,
    ...skill.tags[locale],
    ...skill.tags.en,
  ]
    .join(" ")
    .toLowerCase();
}

function statusKey(skill: MarketplaceSkill): Exclude<StatusKey, "all"> {
  const normalized = skill.verification.en.toLowerCase();

  if (isVerifiedSkillStatus(normalized)) {
    return "verified";
  }

  if (
    normalized.includes("restricted") ||
    normalized.includes("suspended") ||
    normalized.includes("rejected")
  ) {
    return "restricted";
  }

  return "submitted";
}

function compareSkills(first: MarketplaceSkill, second: MarketplaceSkill) {
  const statusDelta =
    statusRank(statusKey(first)) - statusRank(statusKey(second));

  if (statusDelta !== 0) {
    return statusDelta;
  }

  const riskDelta = riskRank(first.risk) - riskRank(second.risk);

  if (riskDelta !== 0) {
    return riskDelta;
  }

  return first.slug.localeCompare(second.slug);
}

function statusRank(status: Exclude<StatusKey, "all">) {
  const ranks = {
    verified: 1,
    submitted: 2,
    restricted: 3,
  } satisfies Record<Exclude<StatusKey, "all">, number>;

  return ranks[status];
}

function riskRank(risk: MarketplaceSkill["risk"]) {
  const ranks = {
    low: 1,
    medium: 2,
    high: 3,
  } satisfies Record<MarketplaceSkill["risk"], number>;

  return ranks[risk];
}
