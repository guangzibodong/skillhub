"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Layers3,
  ExternalLink,
  PackageCheck,
  RadioTower,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Timer,
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
import {
  getSkillInstallState,
  isVerifiedSkillStatus,
} from "@/lib/skill-install-state";

type MarketplaceBrowserProps = {
  initialFilters?: MarketplaceInitialFilters;
  locale: Locale;
  publisherProfiles?: PublicPublisherProfile[];
  skills: MarketplaceSkillCard[];
};

export type MarketplaceSkillCard = Pick<
  MarketplaceSkill,
  | "author"
  | "billing"
  | "category"
  | "categoryKey"
  | "feedbackCount"
  | "installs"
  | "latency"
  | "lastReviewed"
  | "name"
  | "rating"
  | "risk"
  | "runtime"
  | "slug"
  | "summary"
  | "successRate"
  | "tags"
  | "verification"
> & {
  installsCommand: Pick<MarketplaceSkill["installsCommand"], "cli">;
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
    search: "Search SEO/GEO, UI, content, CRM, data, finance, research, API",
    results: "results",
    copy: "Copy inspect",
    copied: "Copied",
    copyFailed: "Copy failed",
    copyFailure: "API inspect command could not be copied",
    copySuccess: "API inspect command copied",
    details: "Details",
    by: "by",
    allPricing: "All pricing",
    free: "Free",
    perCall: "Included in Pro",
    subscription: "Included in Pro",
    success: "success",
    latency: "latency",
    feedback: "feedback",
    reviewOnlyMetric: "Review pending",
    reviewOnlyPrice: "Review required before pricing",
    install: "API inspect",
    installLocked: "Inspection only",
    installLockedBody: "Verified review is required before install and runtime actions unlock.",
    catalog: "Skill catalog",
    filters: "Refine results",
    category: "Use case",
    pricing: "Access plan",
    permissionRisk: "Permission risk",
    runtime: "Runtime",
    verification: "Verification",
    sort: "Sort",
    activeFilters: "Active filters",
    queryFilter: "Search",
    reset: "Reset filters",
    emptyTitle: "No skills match these filters",
    emptyBody:
      "Try a broader use case like SEO/GEO, UI/UX, content, CRM, data, finance, research, automation, API, or security.",
    compare: "Next step",
    detail: "Open details",
    installReady: "Sign in to adopt",
    installLockedLabel: "Review required",
    inspectCommand: "Inspect API contract",
    showMore: "Show more skills",
    showing: "Showing {visible} of {total}",
    publisher: "Publisher",
    signals: "Signals",
    contract: "Contract checks",
    categoryPicks: "Popular starting points",
    categoryPicksBody:
      "Choose by the job your team is trying to finish, then refine by plan, risk, runtime, and review status.",
    catalogSummary: {
      categories: "use-case categories",
      free: "free starter skills",
      pro: "Pro-ready skills",
      total: "public skills",
    },
    spotlight: {
      automation: "Workflow automation",
      data: "Data and spreadsheets",
      ecommerce: "E-commerce operations",
      free: "Free starters",
      marketing: "Ads and growth",
      ops: "Support operations",
      seo: "SEO / GEO visibility",
      ui: "UI/UX polish",
    },
    handoff: {
      submittedBody: "Project install, runtime test, billing, and ledger actions may unlock only after review approval.",
      submittedItems: ["Project install", "Runtime test", "Billing", "Ledger actions"],
      submittedTitle: "After verified approval",
      verifiedBody: "Project install, policy gate, runtime log, and runtime evidence require sign-in and project policy checks.",
      verifiedItems: ["Project install", "Policy gate", "Runtime log", "Runtime evidence"],
      verifiedTitle: "After sign-in"
    },
    recommendation: {
      adoption: "Install evidence",
      feedback: "Moderated feedback",
      highRisk: "Owner approval required",
      lowRisk: "Low-risk permissions",
      mediumRisk: "Reviewed permissions",
      runtimeObserved: "Runtime signal",
      strongRuntime: "Strong runtime success",
      title: "Recommendation reasons",
      verified: "Verified review"
    },
    sortOptions: {
      adoption: "Most installed",
      lowRisk: "Lowest risk",
      recommended: "Recommended",
      recent: "Recently reviewed",
      success: "Best runtime success",
    },
    allRuntime: "All runtimes",
    allRisk: "All risk",
    allVerification: "All verification",
    verificationLabels: {
      review: "In review",
      restricted: "Restricted",
      verified: "Verified",
    },
    risk: {
      low: "low",
      medium: "medium",
      high: "high",
    },
  },
  zh: {
    search: "搜索 SEO/GEO、UI、内容文案、CRM、数据、财务、研究、API",
    results: "个结果",
    copy: "复制查看命令",
    copied: "已复制",
    copyFailed: "复制失败",
    copyFailure: "API 查看命令复制失败",
    copySuccess: "API 查看命令已复制",
    details: "详情",
    by: "来自",
    allPricing: "全部套餐",
    free: "基础免费",
    perCall: "Pro 全量计划内",
    subscription: "Pro 全量计划内",
    success: "成功率",
    latency: "延迟",
    feedback: "反馈",
    reviewOnlyMetric: "审核中",
    reviewOnlyPrice: "审核通过后才显示定价",
    install: "API 查看",
    installLocked: "仅可查看",
    installLockedBody: "需要完成 verified 审核后才会开放安装和运行操作。",
    catalog: "技能目录",
    filters: "筛选结果",
    category: "用途分类",
    pricing: "访问套餐",
    permissionRisk: "权限风险",
    runtime: "运行时",
    verification: "验证状态",
    sort: "排序",
    activeFilters: "当前筛选",
    queryFilter: "搜索",
    reset: "重置筛选",
    emptyTitle: "没有符合条件的技能",
    emptyBody:
      "可以换成 SEO/GEO、UI/UX、内容文案、CRM、数据、财务、研究、自动化、API、安全等更宽的用途分类来找。",
    compare: "下一步",
    detail: "查看详情",
    installReady: "登录后采用",
    installLockedLabel: "需要审核",
    inspectCommand: "查看 API 合约",
    showMore: "加载更多技能",
    showing: "已显示 {visible} / {total}",
    publisher: "发布者",
    signals: "信号",
    contract: "合约检查",
    categoryPicks: "热门入口",
    categoryPicksBody:
      "先按团队要完成的任务找，再用套餐、风险、运行时和验证状态细筛。",
    catalogSummary: {
      categories: "个用途分类",
      free: "个免费入门技能",
      pro: "个 Pro 技能",
      total: "个公开技能",
    },
    spotlight: {
      automation: "流程自动化",
      data: "数据和表格",
      ecommerce: "电商运营",
      free: "免费入门",
      marketing: "广告增长",
      ops: "客服运营",
      seo: "SEO / GEO 可见度",
      ui: "UI/UX 优化",
    },
    handoff: {
      submittedBody: "\u9879\u76ee\u5b89\u88c5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u8ba1\u8d39\u548c\u8d26\u672c\u64cd\u4f5c\u53ea\u4f1a\u5728\u9a8c\u8bc1\u5ba1\u6838\u901a\u8fc7\u540e\u89e3\u9501\u3002",
      submittedItems: ["\u9879\u76ee\u5b89\u88c5", "\u8fd0\u884c\u6d4b\u8bd5", "\u8ba1\u8d39", "\u8d26\u672c\u64cd\u4f5c"],
      submittedTitle: "\u9a8c\u8bc1\u5ba1\u6838\u901a\u8fc7\u540e",
      verifiedBody: "\u9879\u76ee\u5b89\u88c5\u3001\u7b56\u7565\u7f51\u5173\u3001\u8fd0\u884c\u65e5\u5fd7\u548c\u8fd0\u884c\u8bc1\u636e\u90fd\u9700\u8981\u767b\u5f55\u5e76\u901a\u8fc7\u9879\u76ee\u7b56\u7565\u68c0\u67e5\u3002",
      verifiedItems: ["\u9879\u76ee\u5b89\u88c5", "\u7b56\u7565\u7f51\u5173", "\u8fd0\u884c\u65e5\u5fd7", "\u8fd0\u884c\u8bc1\u636e"],
      verifiedTitle: "\u767b\u5f55\u540e"
    },
    recommendation: {
      adoption: "已有安装证据",
      feedback: "已审核反馈",
      highRisk: "需要负责人批准",
      lowRisk: "低风险权限",
      mediumRisk: "权限已纳入审核",
      runtimeObserved: "已有运行信号",
      strongRuntime: "运行成功率强",
      title: "推荐理由",
      verified: "已验证审核"
    },
    sortOptions: {
      adoption: "安装最多",
      lowRisk: "风险最低",
      recommended: "推荐优先",
      recent: "最近审核",
      success: "成功率最高",
    },
    allRuntime: "全部运行时",
    allRisk: "全部风险",
    allVerification: "全部验证状态",
    verificationLabels: {
      review: "审核中",
      restricted: "受限",
      verified: "已验证",
    },
    risk: {
      low: "低风险",
      medium: "中风险",
      high: "高风险",
    },
  },
} as const;

const pricingOptions = [
  { key: "all", label: { en: "All plans", zh: "全部套餐" } },
  { key: "free", label: { en: "Free basics", zh: "基础免费" } },
  { key: "pro", label: { en: "Included in Pro", zh: "Pro 全量计划内" } },
] as const;

const riskOptions = ["all", "low", "medium", "high"] as const;
const runtimeOptions = ["all", "HTTP", "MCP", "Local"] as const;
const verificationOptions = ["all", "verified", "review"] as const;
const sortOptions = [
  "recommended",
  "adoption",
  "success",
  "lowRisk",
  "recent",
] as const;

const INITIAL_VISIBLE_SKILLS = 36;
const LOAD_MORE_SKILLS = 36;

const categorySpotlights = [
  { key: "seo", query: "" },
  { key: "marketing", query: "" },
  { key: "ecommerce", query: "" },
  { key: "ops", query: "" },
  { key: "data", query: "" },
  { key: "ui", query: "" },
  { key: "automation", query: "" },
  { key: "free", query: "" },
] as const;

type CategoryKey = (typeof marketplaceCategories)[number]["key"];
type PricingKey = (typeof pricingOptions)[number]["key"];
type RiskKey = (typeof riskOptions)[number];
type RuntimeKey = (typeof runtimeOptions)[number];
type VerificationKey = (typeof verificationOptions)[number];
type SortKey = (typeof sortOptions)[number];

const emptyCatalogCopy = {
  en: {
    body: "New public listings are being prepared. Check back soon, or publish a skill to start the review path.",
    title: "No public skills are listed yet",
  },
  zh: {
    body: "新的公开技能正在准备中。你可以稍后再来查看，或先发布一个技能进入审核流程。",
    title: "暂时还没有公开技能",
  },
} as const;

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
  const [pricing, setPricing] = useState<PricingKey>(
    normalizedInitialFilters.pricing,
  );
  const [risk, setRisk] = useState<RiskKey>(normalizedInitialFilters.risk);
  const [runtime, setRuntime] = useState<RuntimeKey>(
    normalizedInitialFilters.runtime,
  );
  const [verification, setVerification] = useState<VerificationKey>(
    normalizedInitialFilters.verification,
  );
  const [sort, setSort] = useState<SortKey>(normalizedInitialFilters.sort);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_SKILLS);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copyFailedSlug, setCopyFailedSlug] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{
    kind: "error" | "success";
    message: string;
    slug: string;
  } | null>(null);
  const dictionary = labels[locale];
  const emptyCatalog = emptyCatalogCopy[locale];
  const isEmptyCatalog = skills.length === 0;
  const publicPublisherSlugs = useMemo(
    () => new Set(publisherProfiles.map((publisher) => publisher.slug)),
    [publisherProfiles],
  );
  const catalogSummary = useMemo(
    () => ({
      categories: new Set(skills.map((skill) => skill.categoryKey)).size,
      free: skills.filter((skill) => skill.billing === "free").length,
      pro: skills.filter((skill) => skill.billing !== "free").length,
      total: skills.length,
    }),
    [skills],
  );
  const spotlightCards = useMemo(
    () =>
      categorySpotlights.map((spotlight) => {
        if (spotlight.key === "free") {
          return {
            ...spotlight,
            count: skills.filter((skill) => skill.billing === "free").length,
          };
        }

        return {
          ...spotlight,
          count: skills.filter((skill) => skill.categoryKey === spotlight.key)
            .length,
        };
      }),
    [skills],
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    pricing !== "all" ||
    risk !== "all" ||
    runtime !== "all" ||
    verification !== "all" ||
    sort !== "recommended";
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

    if (pricing !== "all") {
      const pricingLabel = pricingOptions.find((item) => item.key === pricing)?.label;
      pills.push(`${dictionary.pricing}: ${pricingLabel ? localizeText(pricingLabel, locale) : pricing}`);
    }

    if (risk !== "all") {
      pills.push(`${dictionary.permissionRisk}: ${dictionary.risk[risk]}`);
    }

    if (runtime !== "all") {
      pills.push(`${dictionary.runtime}: ${runtime}`);
    }

    if (verification !== "all") {
      pills.push(`${dictionary.verification}: ${dictionary.verificationLabels[verification]}`);
    }

    if (sort !== "recommended") {
      pills.push(`${dictionary.sort}: ${dictionary.sortOptions[sort]}`);
    }

    return pills;
  }, [category, dictionary, locale, pricing, query, risk, runtime, sort, verification]);

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

    if (pricing !== "all") {
      params.set("pricing", pricing);
    }

    if (risk !== "all") {
      params.set("permissionLevel", risk);
    }

    if (runtime !== "all") {
      params.set("runtime", runtime.toLowerCase());
    }

    if (verification !== "all") {
      params.set("verification", verification);
    }

    if (sort !== "recommended") {
      params.set("sort", sort);
    }

    const nextPath = `/marketplace${params.toString() ? `?${params}` : ""}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== nextPath) {
      window.history.replaceState(null, "", nextPath);
    }
  }, [category, locale, pricing, query, risk, runtime, sort, verification]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_SKILLS);
  }, [category, pricing, query, risk, runtime, sort, verification]);

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const skillOrder = new Map(
      skills.map((skill, index) => [skill.slug, index]),
    );

    return skills
      .filter((skill) => {
        const text = searchableText(skill, locale);
        const queryMatch =
          normalizedQuery.length === 0 || text.includes(normalizedQuery);
        const categoryMatch =
          category === "all" || skill.categoryKey === category;
        const pricingMatch =
          pricing === "all" ||
          (pricing === "pro" ? skill.billing !== "free" : skill.billing === pricing);
        const riskMatch = risk === "all" || skill.risk === risk;
        const runtimeMatch = runtime === "all" || skill.runtime === runtime;
        const verificationMatch =
          verification === "all" || verificationKey(skill) === verification;

        return (
          queryMatch &&
          categoryMatch &&
          pricingMatch &&
          riskMatch &&
          runtimeMatch &&
          verificationMatch
        );
      })
      .sort((first, second) => {
        if (sort === "recommended") {
          return (
            getSkillOrder(first, skillOrder) - getSkillOrder(second, skillOrder)
          );
        }

        return compareSkills(first, second, sort, normalizedQuery, locale);
      });
  }, [
    category,
    locale,
    pricing,
    query,
    risk,
    runtime,
    skills,
    sort,
    verification,
  ]);

  const visibleSkills = useMemo(
    () => filteredSkills.slice(0, visibleCount),
    [filteredSkills, visibleCount],
  );
  const hasMoreSkills = visibleCount < filteredSkills.length;

  function copyInstall(skill: MarketplaceSkillCard) {
    void navigator.clipboard
      .writeText(skill.installsCommand.cli)
      .then(() => {
        setCopyFailedSlug(null);
        setCopiedSlug(skill.slug);
        setCopyStatus({
          kind: "success",
          message: dictionary.copySuccess,
          slug: skill.slug,
        });
        window.setTimeout(() => {
          setCopiedSlug(null);
          setCopyStatus((current) =>
            current?.slug === skill.slug ? null : current,
          );
        }, 1800);
      })
      .catch(() => {
        setCopiedSlug(null);
        setCopyFailedSlug(skill.slug);
        setCopyStatus({
          kind: "error",
          message: dictionary.copyFailure,
          slug: skill.slug,
        });
        window.setTimeout(() => {
          setCopyFailedSlug(null);
          setCopyStatus((current) =>
            current?.slug === skill.slug ? null : current,
          );
        }, 2200);
      });
  }

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setPricing("all");
    setRisk("all");
    setRuntime("all");
    setVerification("all");
    setSort("recommended");
    setVisibleCount(INITIAL_VISIBLE_SKILLS);
  }

  function applySpotlight(
    spotlight: (typeof categorySpotlights)[number],
  ) {
    setRisk("all");
    setRuntime("all");
    setVerification("all");
    setSort("recommended");

    if (spotlight.key === "free") {
      setCategory("all");
      setPricing("free");
      setQuery("");
      return;
    }

    setCategory(spotlight.key);
    setPricing("all");
    setQuery(spotlight.query);
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

      <div className="market-catalog-summary" aria-label={dictionary.catalog}>
        <div>
          <strong>{catalogSummary.total}</strong>
          <span>{dictionary.catalogSummary.total}</span>
        </div>
        <div>
          <strong>{catalogSummary.free}</strong>
          <span>{dictionary.catalogSummary.free}</span>
        </div>
        <div>
          <strong>{catalogSummary.pro}</strong>
          <span>{dictionary.catalogSummary.pro}</span>
        </div>
        <div>
          <strong>{catalogSummary.categories}</strong>
          <span>{dictionary.catalogSummary.categories}</span>
        </div>
      </div>

      <div className="market-spotlight-panel">
        <div className="market-spotlight-panel__copy">
          <span>
            <Layers3 size={15} aria-hidden="true" />
            {dictionary.categoryPicks}
          </span>
          <p>{dictionary.categoryPicksBody}</p>
        </div>
        <div className="market-spotlight-grid">
          {spotlightCards.map((spotlight) => (
            <button
              className={
                (spotlight.key === "free" && pricing === "free") ||
                (spotlight.key !== "free" && category === spotlight.key)
                  ? "market-spotlight-card market-spotlight-card--active"
                  : "market-spotlight-card"
              }
              key={spotlight.key}
              onClick={() => applySpotlight(spotlight)}
              type="button"
            >
              <strong>{dictionary.spotlight[spotlight.key]}</strong>
              <span>
                {spotlight.count} {dictionary.results}
              </span>
            </button>
          ))}
        </div>
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

        <FilterGroup label={dictionary.pricing}>
          {pricingOptions.map((item) => (
            <button
              className={
                pricing === item.key
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item.key}
              onClick={() => setPricing(item.key)}
              type="button"
            >
              {localizeText(item.label, locale)}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label={dictionary.permissionRisk}>
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
              {item === "all" ? dictionary.allRisk : dictionary.risk[item]}
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

        <FilterGroup label={dictionary.verification}>
          {verificationOptions.map((item) => (
            <button
              className={
                verification === item
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item}
              onClick={() => setVerification(item)}
              type="button"
            >
              {item === "all"
                ? dictionary.allVerification
                : dictionary.verificationLabels[item]}
            </button>
          ))}
        </FilterGroup>

        <FilterGroup label={dictionary.sort}>
          {sortOptions.map((item) => (
            <button
              className={
                sort === item
                  ? "filter-button filter-button--active"
                  : "filter-button"
              }
              key={item}
              onClick={() => setSort(item)}
              type="button"
            >
              {dictionary.sortOptions[item]}
            </button>
          ))}
        </FilterGroup>
      </div>

      {filteredSkills.length > 0 ? (
        <div className="market-card-grid">
          {visibleSkills.map((skill) => {
            const installState = getSkillInstallState(skill.verification.en);
            const isSkillInstallable = installState.installable;
            const isVerified = verificationKey(skill) === "verified";
            const adoptHref = localizedHref(
              `/login?returnTo=${encodeURIComponent(localizedHref(`/skills/${skill.slug}#install`, locale))}`,
              locale,
            );
            const handoffTitle = isVerified ? dictionary.handoff.verifiedTitle : dictionary.handoff.submittedTitle;
            const handoffBody = isVerified ? dictionary.handoff.verifiedBody : dictionary.handoff.submittedBody;
            const handoffItems = isVerified ? dictionary.handoff.verifiedItems : dictionary.handoff.submittedItems;
            const publisherSlug = publisherSlugFromName(skill.author);
            const hasPublisherProfile = publicPublisherSlugs.has(publisherSlug);

            return (
            <article className="market-skill-card lift-card" key={skill.slug}>
              <div className="market-skill-card__head">
                <div className="market-skill-card__icon" aria-hidden="true">
                  <Zap size={18} />
                </div>
                <div className="market-skill-card__title">
                  <span>{localizeText(skill.category, locale)} / {skill.runtime}</span>
                  <h2>
                    <a href={localizedHref(`/skills/${skill.slug}`, locale)}>
                      {localizeText(skill.name, locale)}
                    </a>
                  </h2>
                  {hasPublisherProfile ? (
                    <a
                      className="market-skill-card__publisher"
                      href={localizedHref(
                        `/publishers/${publisherSlug}`,
                        locale,
                      )}
                    >
                      {dictionary.by} {skill.author}
                    </a>
                  ) : (
                    <span className="market-skill-card__publisher market-skill-card__publisher--text">
                      {dictionary.by} {skill.author}
                    </span>
                  )}
                </div>
                <div className="market-skill-card__badges">
                  <span className={`risk-badge risk-badge--${skill.risk}`}>
                    {dictionary.risk[skill.risk]}
                  </span>
                  <span className="market-verify-badge">
                    {localizeText(skill.verification, locale)}
                  </span>
                </div>
              </div>

              <p>{localizeText(skill.summary, locale)}</p>

              {isVerified ? (
                <div className="market-skill-card__meta">
                  <span>
                    <Star size={14} aria-hidden="true" />
                    {formatFeedbackSignal(skill, dictionary.feedback, locale)}
                  </span>
                  <span>
                    <BadgeCheck size={14} aria-hidden="true" />
                    {formatMarketplaceMetric(skill.successRate, locale)} {dictionary.success}
                  </span>
                  <span>
                    <Timer size={14} aria-hidden="true" />
                    {formatMarketplaceMetric(skill.latency, locale)} {dictionary.latency}
                  </span>
                </div>
              ) : (
                <div className="market-skill-card__meta market-skill-card__meta--review">
                  <span>
                    <ShieldCheck size={14} aria-hidden="true" />
                    {dictionary.reviewOnlyMetric}
                  </span>
                  <span>
                    <Timer size={14} aria-hidden="true" />
                    {dictionary.installLockedLabel}
                  </span>
                </div>
              )}

              <div
                className="market-recommendation-reasons"
                aria-label={dictionary.recommendation.title}
              >
                <span className="market-recommendation-reasons__title">
                  <ShieldCheck size={14} aria-hidden="true" />
                  {dictionary.signals}
                </span>
                <div>
                  {buildRecommendationReasons(skill, dictionary).map((reason) => (
                    <span key={reason}>
                      <BadgeCheck size={13} aria-hidden="true" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="market-contract-grid" aria-label={dictionary.contract}>
                <span>
                  <small>{dictionary.runtime}</small>
                  <strong>{skill.runtime}</strong>
                </span>
                <span>
                  <small>{dictionary.pricing}</small>
                  <strong>{isVerified ? formatPublicPrice(skill, locale) : dictionary.reviewOnlyPrice}</strong>
                </span>
                <span>
                  <small>{dictionary.publisher}</small>
                  <strong>{skill.author}</strong>
                </span>
              </div>

              <div className="tag-list">
                {skill.tags[locale].slice(0, 4).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              {isSkillInstallable ? (
                <div className="market-install-action">
                  <div className="market-adopt-strip">
                    <a className="btn-primary" href={adoptHref}>
                      <PackageCheck size={16} aria-hidden="true" />
                      <span>{dictionary.installReady}</span>
                    </a>
                    <span>{dictionary.inspectCommand}</span>
                  </div>
                  <div
                    className="install-strip"
                    aria-label={`${dictionary.install}: ${localizeText(skill.name, locale)}`}
                  >
                    <code>{skill.installsCommand.cli}</code>
                    <button
                      aria-label={`${dictionary.copy}: ${localizeText(skill.name, locale)}`}
                      onClick={() => copyInstall(skill)}
                      type="button"
                    >
                      <Copy size={15} aria-hidden="true" />
                      {copiedSlug === skill.slug
                        ? dictionary.copied
                        : copyFailedSlug === skill.slug
                          ? dictionary.copyFailed
                          : dictionary.copy}
                    </button>
                  </div>
                  {copyStatus?.slug === skill.slug ? (
                    <div
                      aria-live={
                        copyStatus.kind === "error" ? "assertive" : "polite"
                      }
                      className={`market-copy-status market-copy-status--${copyStatus.kind}`}
                      role={copyStatus.kind === "error" ? "alert" : "status"}
                    >
                      {copyStatus.kind === "error" ? (
                        <AlertCircle size={14} aria-hidden="true" />
                      ) : (
                        <CheckCircle2 size={14} aria-hidden="true" />
                      )}
                      <span>{copyStatus.message}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  className="install-strip install-strip--locked"
                  aria-label={`${dictionary.installLocked}: ${localizeText(skill.name, locale)}`}
                >
                  <ShieldCheck size={15} aria-hidden="true" />
                  <span>
                    <strong>{dictionary.installLocked}</strong>
                    {installState.reason[locale]}
                  </span>
                </div>
              )}

              <div className="market-install-handoff" aria-label={handoffTitle}>
                <strong>
                  <Route size={14} aria-hidden="true" />
                  {handoffTitle}
                </strong>
                <small>{handoffBody}</small>
                <div>
                  {handoffItems.map((item, index) => (
                    <span key={item}>
                      {index === 0 ? (
                        <PackageCheck size={13} aria-hidden="true" />
                      ) : index === 2 ? (
                        <RadioTower size={13} aria-hidden="true" />
                      ) : null}
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="market-skill-card__foot">
                <div>
                  <span>{dictionary.compare}</span>
                  <strong>{isVerified ? dictionary.installReady : dictionary.installLocked}</strong>
                </div>
                <a
                  className="secondary-button"
                  href={localizedHref(`/skills/${skill.slug}`, locale)}
                >
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{dictionary.detail}</span>
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              </div>
            </article>
            );
          })}
        </div>
      ) : null}

      {filteredSkills.length > 0 && hasMoreSkills ? (
        <div className="market-load-more">
          <p>
            {dictionary.showing
              .replace("{visible}", String(visibleSkills.length))
              .replace("{total}", String(filteredSkills.length))}
          </p>
          <button
            className="secondary-button secondary-button--compact"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + LOAD_MORE_SKILLS, filteredSkills.length),
              )
            }
            type="button"
          >
            <span>{dictionary.showMore}</span>
          </button>
        </div>
      ) : null}

      {filteredSkills.length === 0 ? (
        <div className="market-empty-state">
          <Search size={26} aria-hidden="true" />
          <h3>{isEmptyCatalog ? emptyCatalog.title : dictionary.emptyTitle}</h3>
          <p>{isEmptyCatalog ? emptyCatalog.body : dictionary.emptyBody}</p>
          {!isEmptyCatalog && (
            <button
              className="secondary-button secondary-button--compact"
              onClick={resetFilters}
              type="button"
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>{dictionary.reset}</span>
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function normalizeInitialFilters(filters: MarketplaceInitialFilters = {}) {
  return {
    category: normalizeCategory(filters.category),
    pricing: normalizePricing(filters.pricing),
    query: String(filters.query ?? "").trim().slice(0, 120),
    risk: normalizeOption(filters.risk, riskOptions, "all"),
    runtime: normalizeRuntime(filters.runtime),
    sort: normalizeSort(filters.sort),
    verification: normalizeOption(filters.verification, verificationOptions, "all"),
  };
}

function normalizePricing(value: string | undefined): PricingKey {
  const normalized = String(value ?? "").trim();
  const legacyMap: Record<string, PricingKey> = {
    per_call: "pro",
    subscription: "pro",
  };

  return normalizeOption(
    legacyMap[normalized] ?? normalized,
    pricingOptions.map((item) => item.key),
    "all",
  );
}

function normalizeCategory(value: string | undefined): CategoryKey {
  const legacyMap: Record<string, CategoryKey> = {
    support: "ops",
  };
  const normalized = String(value ?? "").trim();

  return normalizeOption(
    legacyMap[normalized] ?? normalized,
    marketplaceCategories.map((item) => item.key),
    "all",
  );
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

  if (normalized === "http") {
    return "HTTP";
  }

  if (normalized === "mcp") {
    return "MCP";
  }

  if (normalized === "local") {
    return "Local";
  }

  return normalizeOption(value, runtimeOptions, "all");
}

function normalizeSort(value: string | undefined): SortKey {
  if (value === "low_risk") {
    return "lowRisk";
  }

  return normalizeOption(value, sortOptions, "recommended");
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

function searchableText(skill: MarketplaceSkillCard, locale: Locale) {
  return [
    localizeText(skill.name, locale),
    localizeText(skill.summary, locale),
    localizeText(skill.category, locale),
    skill.author,
    skill.runtime,
    skill.billing,
    skill.risk,
    localizeText(skill.verification, locale),
    skill.verification.en,
    ...skill.tags[locale],
    ...skill.tags.en,
  ]
    .join(" ")
    .toLowerCase();
}

function verificationKey(
  skill: MarketplaceSkillCard,
): "verified" | "review" | "restricted" {
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

  return "review";
}

function getSkillOrder(
  skill: MarketplaceSkillCard,
  skillOrder: Map<string, number>,
) {
  return skillOrder.get(skill.slug) ?? Number.MAX_SAFE_INTEGER;
}

function compareSkills(
  first: MarketplaceSkillCard,
  second: MarketplaceSkillCard,
  sort: (typeof sortOptions)[number],
  query: string,
  locale: Locale,
) {
  if (sort === "adoption") {
    return (
      parseCompactNumber(second.installs) -
        parseCompactNumber(first.installs) ||
      first.slug.localeCompare(second.slug)
    );
  }

  if (sort === "success") {
    return (
      parsePercent(second.successRate) - parsePercent(first.successRate) ||
      recommendedScore(second, query, locale) -
        recommendedScore(first, query, locale)
    );
  }

  if (sort === "lowRisk") {
    return (
      riskRank(first.risk) - riskRank(second.risk) ||
      recommendedScore(second, query, locale) -
        recommendedScore(first, query, locale)
    );
  }

  if (sort === "recent") {
    return (
      parseDate(second.lastReviewed) - parseDate(first.lastReviewed) ||
      recommendedScore(second, query, locale) -
        recommendedScore(first, query, locale)
    );
  }

  return (
    recommendedScore(second, query, locale) -
      recommendedScore(first, query, locale) ||
    first.slug.localeCompare(second.slug)
  );
}

function recommendedScore(
  skill: MarketplaceSkillCard,
  query: string,
  locale: Locale,
) {
  let score = 0;

  if (query) {
    const name = localizeText(skill.name, locale).toLowerCase();
    const tags = skill.tags[locale].join(" ").toLowerCase();

    if (name === query) {
      score += 120;
    } else if (name.includes(query)) {
      score += 70;
    }

    if (tags.includes(query)) {
      score += 35;
    }
  }

  if (verificationKey(skill) === "verified") {
    score += 95;
  } else if (verificationKey(skill) === "review") {
    score += 35;
  }

  score += (4 - riskRank(skill.risk)) * 15;
  score += parsePercent(skill.successRate) * 35;
  score += Math.min(parseCompactNumber(skill.installs) / 1000, 35);
  score += Number.isFinite(Number(skill.rating)) ? Number(skill.rating) * 5 : 0;
  score += Math.min(skill.feedbackCount ?? 0, 50) * 0.8;
  score += Math.min(parseDate(skill.lastReviewed) / 1_000_000_000_000, 2);

  return score;
}

function formatFeedbackSignal(
  skill: MarketplaceSkillCard,
  feedbackLabel: string,
  locale: Locale,
) {
  const count = skill.feedbackCount ?? 0;

  if (count > 0) {
    return `${skill.rating} / ${count} ${feedbackLabel}`;
  }

  if (/^\d+(\.\d+)?$/.test(skill.rating.trim())) {
    return skill.rating;
  }

  return locale === "zh" ? "暂无反馈" : "No feedback yet";
}

function formatMarketplaceMetric(value: string, locale: Locale) {
  const normalized = value.trim().toLowerCase();

  if (
    !normalized ||
    normalized === "n/a" ||
    normalized === "review" ||
    normalized === "verified" ||
    normalized === "blocked" ||
    normalized === "unknown"
  ) {
    return locale === "zh" ? "暂无数据" : "Not enough data";
  }

  return value;
}

function formatPublicPrice(skill: MarketplaceSkillCard, locale: Locale) {
  if (skill.billing === "free") {
    return locale === "zh" ? "基础免费" : "Free basics";
  }

  return locale === "zh"
    ? "Pro 全量计划内"
    : "Included in Pro";
}

function buildRecommendationReasons(
  skill: MarketplaceSkillCard,
  dictionary: (typeof labels)[Locale],
) {
  const reasons: string[] = [];

  if (verificationKey(skill) === "verified") {
    reasons.push(dictionary.recommendation.verified);
  }

  if (skill.risk === "low") {
    reasons.push(dictionary.recommendation.lowRisk);
  } else if (skill.risk === "medium") {
    reasons.push(dictionary.recommendation.mediumRisk);
  } else {
    reasons.push(dictionary.recommendation.highRisk);
  }

  const success = parsePercent(skill.successRate);

  if (success >= 0.98) {
    reasons.push(dictionary.recommendation.strongRuntime);
  } else if (success > 0) {
    reasons.push(dictionary.recommendation.runtimeObserved);
  }

  if ((skill.feedbackCount ?? 0) > 0) {
    reasons.push(dictionary.recommendation.feedback);
  }

  if (parseCompactNumber(skill.installs) > 0) {
    reasons.push(dictionary.recommendation.adoption);
  }

  return reasons.slice(0, 4);
}

function parsePercent(value: string) {
  const parsed = Number(value.replace("%", ""));
  return Number.isFinite(parsed) ? parsed / 100 : 0;
}

function parseCompactNumber(value: string) {
  const normalized = value.trim().toLowerCase();
  const multiplier = normalized.endsWith("k")
    ? 1000
    : normalized.endsWith("m")
      ? 1_000_000
      : 1;
  const parsed = Number(normalized.replace(/[km]$/, ""));
  return Number.isFinite(parsed) ? parsed * multiplier : 0;
}

function parseDate(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

function riskRank(risk: MarketplaceSkillCard["risk"]) {
  const ranks = {
    high: 3,
    low: 1,
    medium: 2,
  } satisfies Record<MarketplaceSkillCard["risk"], number>;

  return ranks[risk];
}
