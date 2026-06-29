"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquarePlus,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Target,
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
  catalogSummary?: MarketplaceCatalogSummary;
  catalogTotal?: number;
  initialFilters?: MarketplaceInitialFilters;
  locale: Locale;
  publisherProfiles?: PublicPublisherProfile[];
  skills: MarketplaceSkillCard[];
};

type MarketplaceCatalogSummary = {
  categories: number;
  free: number;
  pro: number;
  spotlightCounts: Record<string, number>;
  total: number;
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
  | "price"
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
  view?: string;
};

const labels = {
  en: {
    search: "Search tasks, tools, publishers, or skill names",
    results: "results in this view",
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
    install: "Skill contract",
    installLocked: "Inspection only",
    installLockedBody:
      "Verified review is required before install and runtime actions unlock.",
    catalog: "Agent Skill marketplace",
    filters: "Refine results",
    category: "Use case",
    pricing: "Access plan",
    permissionRisk: "Permission risk",
    runtime: "Runtime",
    verification: "Verification",
    view: "View",
    compactView: "Compact",
    comfortableView: "Comfortable",
    sort: "Sort",
    closeFilters: "Close filters",
    activeFilters: "Active filters",
    queryFilter: "Search",
    reset: "Reset filters",
    emptyTitle: "No skills match these filters",
    emptyBody:
      "Try a broader use case like SEO/GEO, UI/UX, content, CRM, data, finance, research, automation, API, or security.",
    emptyRequest: "Request this skill",
    emptySuggestionTitle: "Try these nearby paths",
    compare: "Next step",
    detail: "Open details",
    installReady: "Add to Agent",
    installLockedLabel: "Review required",
    inspectCommand: "Skill contract",
    showMore: "Show more skills",
    showing: "Showing {visible} of {total}",
    publisher: "Publisher",
    signals: "Signals",
    contract: "Skill contract",
    allSkills: "All Agent Skills",
    categoryPicks: "Browse by workflow",
    categoryPicksBody:
      "Choose a common workflow first, then refine by plan, permission risk, runtime, and review status.",
    selectionGuide: {
      body: "A good marketplace choice should be easy for a buyer to understand and safe for an agent to inspect. Use these signals before adopting a skill into a project.",
      items: [
        {
          body: "Match the skill to a repeated workflow, not a vague department name.",
          title: "Workflow fit",
        },
        {
          body: "Free basics are for lightweight evaluation; recurring or advanced work belongs in Pro.",
          title: "Plan fit",
        },
        {
          body: "Prefer verified skills with clear publisher, feedback, runtime, and review evidence.",
          title: "Trust signal",
        },
        {
          body: "Read permissions, runtime type, and detail page examples before connecting a project key.",
          title: "Runtime risk",
        },
      ],
      kicker: "Selection rules",
      title: "Choose Agent Skills by fit, trust, and runtime risk.",
    },
    operatingGuide: {
      body: "SkillHub is opening with a curated launch catalog across the workflows teams ask for most. Start from a repeated workflow, try free basics when available, then move recurring work into Pro through onboarding.",
      demoCta: "Talk to Pro",
      filterCta: "View this track",
      kicker: "Buyer tracks",
      plan: "Suggested path",
      recommended: "Recommended skills",
      requestCta: "Request a skill",
      title: "Choose the workflow your team wants to improve first",
      tracks: {
        builder: {
          body: "Validate API contracts, webhook payloads, release checklists, prompt-injection risk, and codebase changes before agents ship work.",
          eyebrow: "Developers / security",
          outcomes: [
            "Check API and webhook contracts",
            "Reduce release risk",
            "Gate unsafe agent actions",
          ],
          plan: "Use free release checks first, then Pro for governed build and security QA.",
          title: "Developer and security QA",
        },
        data: {
          body: "Clean sheets, explain metrics, generate reports, and keep data handoffs understandable for operators.",
          eyebrow: "Data teams",
          outcomes: [
            "Clean messy spreadsheets",
            "Generate report narratives",
            "Standardize import handoffs",
          ],
          plan: "Free sheet cleanup first, then Pro automation for recurring reporting.",
          title: "Data and spreadsheet automation",
        },
        ecommerce: {
          body: "Improve product titles, listing quality, Shopify PDPs, review mining, and launch checklists before traffic lands.",
          eyebrow: "Shopify / marketplaces",
          outcomes: [
            "Fix product-page basics",
            "Find review pain points",
            "Prepare listings for launch",
          ],
          plan: "Free listing checks for basics, Pro for batch SKU operations.",
          title: "E-commerce product operations",
        },
        growth: {
          body: "Diagnose SEO/GEO visibility, turn findings into briefs, and build a repair list that content and dev teams can execute.",
          eyebrow: "SEO / GEO growth",
          outcomes: [
            "Audit AI-search visibility",
            "Create content briefs",
            "Prioritize page fixes",
          ],
          plan: "Free diagnosis first, then Pro for all growth skills.",
          title: "Search and content growth",
        },
        revenue: {
          body: "Research accounts, personalize outbound, clean CRM data, summarize calls, and turn sales activity into the next best action.",
          eyebrow: "Sales / CRM",
          outcomes: [
            "Personalize outreach",
            "Enrich CRM records",
            "Summarize deal next steps",
          ],
          plan: "Use free scripts and objection helpers first, then Pro for recurring CRM workflows.",
          title: "Sales and customer growth",
        },
        support: {
          body: "Route tickets, answer from approved knowledge, summarize escalations, and turn support patterns into product and content fixes.",
          eyebrow: "Support / operations",
          outcomes: [
            "Triage tickets",
            "Draft grounded replies",
            "Find knowledge-base gaps",
          ],
          plan: "Free onboarding and SOP helpers first, then Pro for helpdesk and operations automation.",
          title: "Support and operations",
        },
      },
    },
    catalogSummary: {
      categories: "use-case categories",
      free: "free starter skills",
      pro: "Pro / paid-marketplace skills",
      total: "total indexed skills",
    },
    spotlight: {
      automation: "Workflow automation",
      content: "Content operations",
      data: "Data and spreadsheets",
      dev: "Developer tools",
      ecommerce: "E-commerce operations",
      finance: "Finance ops",
      free: "Free starters",
      marketing: "Ads and growth",
      ops: "Support operations",
      research: "Research and browser",
      sales: "Sales and CRM",
      seo: "SEO / GEO visibility",
      security: "Security and risk",
      ui: "UI/UX polish",
    },
    handoff: {
      submittedBody:
        "Project install, runtime test, billing, and ledger actions may unlock only after review approval.",
      submittedItems: [
        "Project install",
        "Runtime test",
        "Billing",
        "Ledger actions",
      ],
      submittedTitle: "After verified approval",
      verifiedBody:
        "Project install, policy gate, runtime log, and runtime evidence require sign-in and project policy checks.",
      verifiedItems: [
        "Project install",
        "Policy gate",
        "Runtime log",
        "Runtime evidence",
      ],
      verifiedTitle: "After sign-in",
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
      verified: "Verified review",
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
    search: "搜索任务、工具、发布者或 Skill 名称",
    results: "个可浏览结果",
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
    install: "技能合约",
    installLocked: "仅可查看",
    installLockedBody: "需要完成 verified 审核后才会开放安装和运行操作。",
    catalog: "Agent Skill Marketplace",
    filters: "筛选结果",
    category: "用途分类",
    pricing: "访问套餐",
    permissionRisk: "权限风险",
    runtime: "运行时",
    verification: "验证状态",
    view: "视图",
    compactView: "紧凑",
    comfortableView: "舒适",
    sort: "排序",
    closeFilters: "关闭筛选",
    activeFilters: "当前筛选",
    queryFilter: "搜索",
    reset: "重置筛选",
    emptyTitle: "没有符合条件的技能",
    emptyBody:
      "可以换成 SEO/GEO、UI/UX、内容文案、CRM、数据、财务、研究、自动化、API、安全等更宽的用途分类来找。",
    emptyRequest: "提交这个技能需求",
    emptySuggestionTitle: "可以先试这些方向",
    compare: "下一步",
    detail: "查看详情",
    installReady: "添加到 Agent",
    installLockedLabel: "需要审核",
    inspectCommand: "技能合约",
    showMore: "加载更多技能",
    showing: "已显示 {visible} / {total}",
    publisher: "发布者",
    signals: "信号",
    contract: "技能合约",
    allSkills: "全部技能",
    categoryPicks: "按工作流浏览",
    categoryPicksBody:
      "先选常见工作流，再用套餐、权限风险、运行时和验证状态细筛。",
    selectionGuide: {
      body: "一个可采用的技能，既要让客户看得懂，也要让 Agent 能检查边界。采用前先看这几个信号，别只看名字。",
      items: [
        {
          body: "先确认它对应一个会重复发生的业务流程，而不是宽泛部门名。",
          title: "场景匹配",
        },
        {
          body: "免费基础用于轻量验证；长期、高级或批量流程应进入 Pro。",
          title: "套餐匹配",
        },
        {
          body: "优先选择已验证、有发布者、反馈、运行时和审核证据的技能。",
          title: "信任信号",
        },
        {
          body: "接入项目 Key 前，先看权限、运行时类型和详情页示例。",
          title: "运行风险",
        },
      ],
      kicker: "选择标准",
      title: "按场景、信任和运行风险选择 Agent Skill。",
    },
    operatingGuide: {
      body: "SkillHub 先用精选上线目录覆盖团队最常问的工作流。最快的用法不是按技术名词乱找，而是先选一个重复发生的业务流程，有免费基础技能就先验证，再通过入驻把长期任务放进 Pro。",
      demoCta: "咨询 Pro",
      filterCta: "查看这类技能",
      kicker: "买家场景",
      plan: "建议路径",
      recommended: "推荐技能",
      requestCta: "提交技能需求",
      title: "先选团队最想改善的工作流",
      tracks: {
        builder: {
          body: "在智能体交付代码和自动化前，先检查 API 合约、Webhook 载荷、发布清单、提示注入风险和代码变更风险。",
          eyebrow: "开发 / 安全",
          outcomes: [
            "检查 API 和 Webhook 合约",
            "降低发布风险",
            "拦截不安全智能体动作",
          ],
          plan: "先用免费发布检查起步，构建和安全 QA 进入 Pro。",
          title: "开发与安全质检",
        },
        data: {
          body: "清洗表格、解释指标、生成周报，把数据交接变成运营同事也能看懂的流程。",
          eyebrow: "数据 / 报表团队",
          outcomes: ["清洗混乱表格", "生成报表解读", "规范导入交接"],
          plan: "免费表格清理先试用，周期性报表自动化进 Pro。",
          title: "数据与表格自动化",
        },
        ecommerce: {
          body: "优化商品标题、Listing 质量、Shopify 商品页、评论痛点和上架检查，让流量进来前页面先站稳。",
          eyebrow: "Shopify / 平台店铺",
          outcomes: ["修复商品页基础", "挖掘评论痛点", "准备上架检查"],
          plan: "免费 Listing 检查做基础，批量 SKU 运营进入 Pro。",
          title: "电商商品运营",
        },
        growth: {
          body: "诊断 SEO/GEO 可见度，把问题变成内容简报、页面修复清单和开发可执行任务。",
          eyebrow: "SEO / GEO 增长",
          outcomes: [
            "诊断 AI 搜索可见度",
            "生成内容简报",
            "排序页面修复优先级",
          ],
          plan: "免费诊断先起步，完整增长技能进入 Pro 全量计划。",
          title: "搜索与内容增长",
        },
        revenue: {
          body: "调研客户、个性化外联、清理 CRM、总结销售电话，把销售动作转成清楚的下一步。",
          eyebrow: "销售 / CRM",
          outcomes: ["个性化触达", "补全 CRM 记录", "总结商机下一步"],
          plan: "先用免费脚本和异议处理工具，周期性 CRM 流程进入 Pro。",
          title: "销售与客户增长",
        },
        support: {
          body: "分流工单、基于知识库回答、总结升级问题，并把客服高频问题变成产品和内容修复任务。",
          eyebrow: "客服 / 运营",
          outcomes: ["分流工单", "起草有依据的回复", "发现知识库缺口"],
          plan: "先用免费 onboarding 和 SOP 辅助，客服与运营自动化进入 Pro。",
          title: "客服与运营",
        },
      },
    },
    catalogSummary: {
      categories: "个用途分类",
      free: "个免费入门技能",
      pro: "个 Pro / 付费预览技能",
      total: "个全站目录技能",
    },
    spotlight: {
      automation: "流程自动化",
      content: "内容运营",
      data: "数据和表格",
      dev: "开发工具",
      ecommerce: "电商运营",
      finance: "财务运营",
      free: "免费入门",
      marketing: "广告增长",
      ops: "客服运营",
      research: "研究和浏览器",
      sales: "销售 / CRM",
      seo: "SEO / GEO 可见度",
      security: "安全风控",
      ui: "UI/UX 优化",
    },
    handoff: {
      submittedBody:
        "\u9879\u76ee\u5b89\u88c5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u8ba1\u8d39\u548c\u8d26\u672c\u64cd\u4f5c\u53ea\u4f1a\u5728\u9a8c\u8bc1\u5ba1\u6838\u901a\u8fc7\u540e\u89e3\u9501\u3002",
      submittedItems: [
        "\u9879\u76ee\u5b89\u88c5",
        "\u8fd0\u884c\u6d4b\u8bd5",
        "\u8ba1\u8d39",
        "\u8d26\u672c\u64cd\u4f5c",
      ],
      submittedTitle: "\u9a8c\u8bc1\u5ba1\u6838\u901a\u8fc7\u540e",
      verifiedBody:
        "\u9879\u76ee\u5b89\u88c5\u3001\u7b56\u7565\u7f51\u5173\u3001\u8fd0\u884c\u65e5\u5fd7\u548c\u8fd0\u884c\u8bc1\u636e\u90fd\u9700\u8981\u767b\u5f55\u5e76\u901a\u8fc7\u9879\u76ee\u7b56\u7565\u68c0\u67e5\u3002",
      verifiedItems: [
        "\u9879\u76ee\u5b89\u88c5",
        "\u7b56\u7565\u7f51\u5173",
        "\u8fd0\u884c\u65e5\u5fd7",
        "\u8fd0\u884c\u8bc1\u636e",
      ],
      verifiedTitle: "\u767b\u5f55\u540e",
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
      verified: "已验证审核",
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
  {
    key: "per_call",
    label: { en: "Paid marketplace / per call", zh: "付费市场 / 按次" },
  },
  {
    key: "subscription",
    label: { en: "Paid marketplace / subscription", zh: "付费市场 / 订阅" },
  },
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
const viewOptions = ["compact", "comfortable"] as const;

const INITIAL_VISIBLE_SKILLS = 36;
const LOAD_MORE_SKILLS = 36;

const categorySpotlights = [
  { key: "seo", query: "" },
  { key: "marketing", query: "" },
  { key: "ecommerce", query: "" },
  { key: "ops", query: "" },
  { key: "data", query: "" },
  { key: "sales", query: "" },
  { key: "ui", query: "" },
  { key: "dev", query: "" },
  { key: "security", query: "" },
  { key: "research", query: "" },
  { key: "content", query: "" },
  { key: "finance", query: "" },
  { key: "automation", query: "" },
  { key: "free", query: "" },
] as const;


type CategoryKey = (typeof marketplaceCategories)[number]["key"];
type PricingKey = (typeof pricingOptions)[number]["key"];
type RiskKey = (typeof riskOptions)[number];
type RuntimeKey = (typeof runtimeOptions)[number];
type VerificationKey = (typeof verificationOptions)[number];
type SortKey = (typeof sortOptions)[number];
type ViewMode = (typeof viewOptions)[number];

const launchTracks = [
  {
    category: "dev",
    key: "builder",
    pricing: "all",
    query: "",
    skillSlugs: [
      "api-contract-tester",
      "webhook-payload-validator",
      "prompt-injection-guard",
    ],
  },
  {
    category: "seo",
    key: "growth",
    pricing: "all",
    query: "",
    skillSlugs: [
      "geo-answer-auditor",
      "seo-page-auditor",
      "content-brief-builder",
    ],
  },
  {
    category: "ecommerce",
    key: "ecommerce",
    pricing: "all",
    query: "",
    skillSlugs: [
      "product-title-optimizer",
      "shopify-pdp-auditor",
      "listing-qa-checklist",
    ],
  },
  {
    category: "data",
    key: "data",
    pricing: "all",
    query: "",
    skillSlugs: [
      "spreadsheet-cleaner",
      "csv-cleaner",
      "data-dictionary-builder",
    ],
  },
  {
    category: "sales",
    key: "revenue",
    pricing: "all",
    query: "",
    skillSlugs: [
      "crm-enrichment",
      "cold-email-personalizer",
      "meeting-notes-to-crm",
    ],
  },
  {
    category: "ops",
    key: "support",
    pricing: "all",
    query: "",
    skillSlugs: [
      "support-triage",
      "knowledge-base-answer",
      "knowledge-base-gap-finder",
    ],
  },
] as const satisfies readonly {
  category: CategoryKey;
  key: keyof (typeof labels)["en"]["operatingGuide"]["tracks"];
  pricing: PricingKey;
  query: string;
  skillSlugs: readonly string[];
}[];

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
  catalogSummary: providedCatalogSummary,
  catalogTotal,
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
  const [view, setView] = useState<ViewMode>(normalizedInitialFilters.view);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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
    () =>
      providedCatalogSummary ?? {
        categories: new Set(skills.map((skill) => skill.categoryKey)).size,
        free: skills.filter((skill) => skill.billing === "free").length,
        pro: skills.filter((skill) => skill.billing !== "free").length,
        spotlightCounts: buildSpotlightCounts(skills),
        total: catalogTotal ?? skills.length,
      },
    [catalogTotal, providedCatalogSummary, skills],
  );
  const spotlightCards = useMemo(
    () =>
      categorySpotlights.map((spotlight) => {
        return {
          ...spotlight,
          count: catalogSummary.spotlightCounts[spotlight.key] ?? 0,
        };
      }),
    [catalogSummary],
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "all" ||
    pricing !== "all" ||
    risk !== "all" ||
    runtime !== "all" ||
    verification !== "all" ||
    sort !== "recommended" ||
    view !== "compact";
  const activeFilterPills = useMemo(() => {
    const pills: string[] = [];
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      pills.push(`${dictionary.queryFilter}: ${trimmedQuery}`);
    }

    if (category !== "all") {
      const categoryLabel = marketplaceCategories.find(
        (item) => item.key === category,
      )?.label;
      pills.push(
        `${dictionary.category}: ${categoryLabel ? localizeText(categoryLabel, locale) : category}`,
      );
    }

    if (pricing !== "all") {
      const pricingLabel = pricingOptions.find(
        (item) => item.key === pricing,
      )?.label;
      pills.push(
        `${dictionary.pricing}: ${pricingLabel ? localizeText(pricingLabel, locale) : pricing}`,
      );
    }

    if (risk !== "all") {
      pills.push(`${dictionary.permissionRisk}: ${dictionary.risk[risk]}`);
    }

    if (runtime !== "all") {
      pills.push(`${dictionary.runtime}: ${runtime}`);
    }

    if (verification !== "all") {
      pills.push(
        `${dictionary.verification}: ${dictionary.verificationLabels[verification]}`,
      );
    }

    if (sort !== "recommended") {
      pills.push(`${dictionary.sort}: ${dictionary.sortOptions[sort]}`);
    }

    if (view !== "compact") {
      pills.push(`${dictionary.view}: ${dictionary.comfortableView}`);
    }

    return pills;
  }, [
    category,
    dictionary,
    locale,
    pricing,
    query,
    risk,
    runtime,
    sort,
    verification,
    view,
  ]);

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
      params.set("sort", serializeSort(sort));
    }

    if (view !== "compact") {
      params.set("view", view);
    }

    const nextPath = `/marketplace${params.toString() ? `?${params}` : ""}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (currentPath !== nextPath) {
      window.history.replaceState(null, "", nextPath);
    }
  }, [
    category,
    locale,
    pricing,
    query,
    risk,
    runtime,
    sort,
    verification,
    view,
  ]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_SKILLS);
  }, [category, pricing, query, risk, runtime, sort, verification]);

  useEffect(() => {
    if (!isMobileFiltersOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileFiltersOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileFiltersOpen]);

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
          (pricing === "pro"
            ? skill.billing !== "free"
            : skill.billing === pricing);
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
      .sort((first, second) =>
        compareSkills(first, second, sort, normalizedQuery, locale, skillOrder),
      );
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
    () =>
      sort === "recommended" && !query.trim()
        ? diversifyRecommendedSkills(filteredSkills, visibleCount)
        : filteredSkills.slice(0, visibleCount),
    [filteredSkills, query, sort, visibleCount],
  );
  const hasMoreSkills = visibleCount < filteredSkills.length;
  const operatingTracks = useMemo(() => {
    const skillMap = new Map(skills.map((skill) => [skill.slug, skill]));

    return launchTracks.map((track) => ({
      ...track,
      count: skills.filter((skill) => skill.categoryKey === track.category)
        .length,
      recommendedSkills: track.skillSlugs.flatMap((slug) => {
        const skill = skillMap.get(slug);
        return skill ? [skill] : [];
      }),
    }));
  }, [skills]);
  const featuredSkills = useMemo(
    () => filteredSkills.slice(0, 3),
    [filteredSkills],
  );
  const emptySuggestions = useMemo(
    () => buildEmptySuggestions(skills, query, locale),
    [locale, query, skills],
  );
  const emptyRequestHref = localizedHref(
    `/contact?intent=request-skill${
      query.trim() ? `&q=${encodeURIComponent(query.trim())}` : ""
    }`,
    locale,
  );

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
    setView("compact");
    setVisibleCount(INITIAL_VISIBLE_SKILLS);
  }

  function applySpotlight(spotlight: (typeof categorySpotlights)[number]) {
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

  function applyLaunchTrack(track: (typeof launchTracks)[number]) {
    setRisk("all");
    setRuntime("all");
    setVerification("all");
    setSort("recommended");
    setCategory(track.category);
    setPricing(track.pricing);
    setQuery(track.query);
  }

  return (
    <>
      <section
        className="market-directory-section"
        aria-label={dictionary.catalog}
      >
        <div className="market-browser__top">
          <form
            action="/marketplace"
            className="market-search-form"
            method="get"
            role="search"
          >
            {locale === "zh" ? (
              <input name="lang" type="hidden" value="zh" />
            ) : null}
            {category !== "all" ? (
              <input name="category" type="hidden" value={category} />
            ) : null}
            {pricing !== "all" ? (
              <input name="pricing" type="hidden" value={pricing} />
            ) : null}
            {risk !== "all" ? (
              <input name="permissionLevel" type="hidden" value={risk} />
            ) : null}
            {runtime !== "all" ? (
              <input
                name="runtime"
                type="hidden"
                value={runtime.toLowerCase()}
              />
            ) : null}
            {verification !== "all" ? (
              <input
                name="verification"
                type="hidden"
                value={verification}
              />
            ) : null}
            {sort !== "recommended" ? (
              <input name="sort" type="hidden" value={serializeSort(sort)} />
            ) : null}
            {view !== "compact" ? (
              <input name="view" type="hidden" value={view} />
            ) : null}
            <label className="market-search">
              <Search size={17} aria-hidden="true" />
              <input
                aria-label={dictionary.search}
                name="q"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dictionary.search}
              />
            </label>
            <button className="market-search-button" type="submit">
              {locale === "zh" ? "搜索" : "Search"}
            </button>
          </form>
        </div>

        <div className="market-directory-layout">
          <button
            aria-label={dictionary.closeFilters}
            className={
              isMobileFiltersOpen
                ? "market-filter-backdrop market-filter-backdrop--open"
                : "market-filter-backdrop"
            }
            onClick={() => setIsMobileFiltersOpen(false)}
            type="button"
          />
          <aside
            className={
              isMobileFiltersOpen
                ? "market-filter-panel market-filter-panel--open"
                : "market-filter-panel"
            }
            id="market-filter-panel"
            aria-label={dictionary.filters}
          >
            <div className="market-filter-panel__head">
              <span>
                <SlidersHorizontal size={15} aria-hidden="true" />
                {dictionary.filters}
              </span>
              <button
                className="market-filter-reset-link"
                onClick={resetFilters}
                type="button"
              >
                {dictionary.reset}
              </button>
              <button
                className="market-filter-close-button"
                onClick={() => setIsMobileFiltersOpen(false)}
                type="button"
              >
                {dictionary.closeFilters}
              </button>
            </div>

            <FilterGroup label={dictionary.category}>
              {marketplaceCategories.map((item) => (
                <button
                  aria-pressed={category === item.key}
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
              {pricingOptions.slice(0, 3).map((item) => (
                <button
                  aria-pressed={pricing === item.key}
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

            <FilterGroup label={dictionary.verification}>
              {verificationOptions.map((item) => (
                <button
                  aria-pressed={verification === item}
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

            <FilterGroup label={dictionary.permissionRisk}>
              {riskOptions.map((item) => (
                <button
                  aria-pressed={risk === item}
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

            <details className="market-filter-advanced">
              <summary>
                {locale === "zh" ? "高级：运行环境" : "Advanced: runtime"}
              </summary>
              <FilterGroup label={dictionary.runtime}>
                {runtimeOptions.map((item) => (
                  <button
                    aria-pressed={runtime === item}
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
            </details>
          </aside>

          <div className="market-results-panel" id="market-results">
            <div className="market-mobile-filter-bar">
              <span>
                {hasActiveFilters
                  ? activeFilterPills.slice(0, 2).join(" · ")
                  : `${dictionary.catalog}: ${filteredSkills.length}`}
              </span>
              <button
                aria-controls="market-filter-panel"
                aria-expanded={isMobileFiltersOpen}
                onClick={() => setIsMobileFiltersOpen(true)}
                type="button"
              >
                {dictionary.filters}
              </button>
            </div>

            <div className="market-results-toolbar">
              <div>
                <h2>
                  {category === "all"
                    ? dictionary.allSkills
                    : marketplaceCategories.find(
                          (item) => item.key === category,
                        )
                      ? localizeText(
                          marketplaceCategories.find(
                            (item) => item.key === category,
                          )!.label,
                          locale,
                        )
                      : dictionary.categoryPicks}{" "}
                  · {filteredSkills.length} {dictionary.results}
                </h2>
              </div>
              <div className="market-toolbar-actions">
                <div className="market-segmented-control">
                  <span>{dictionary.sort}</span>
                  <div>
                    {sortOptions.map((option) => (
                      <button
                        aria-pressed={sort === option}
                        className={
                          sort === option
                            ? "filter-button filter-button--active"
                            : "filter-button"
                        }
                        key={option}
                        onClick={() => setSort(option)}
                        type="button"
                      >
                        {dictionary.sortOptions[option]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="market-active-filters"
              aria-label={dictionary.activeFilters}
            >
              <span>
                {hasActiveFilters
                  ? dictionary.activeFilters
                  : locale === "zh"
                    ? "推荐排序"
                    : "Recommended ranking"}
              </span>
              <div>
                {(hasActiveFilters
                  ? activeFilterPills
                  : [
                      locale === "zh"
                        ? "排序优先：已验证"
                        : "Priority: verified",
                      locale === "zh"
                        ? "排序优先：低权限风险"
                        : "Priority: low risk",
                      locale === "zh"
                        ? "排序优先：合约完整"
                        : "Priority: complete contract",
                    ]
                ).map((pill) => (
                  <strong key={pill}>{pill}</strong>
                ))}
              </div>
              {hasActiveFilters ? (
                <button
                  className="filter-reset-button"
                  onClick={resetFilters}
                  type="button"
                >
                  <RotateCcw size={14} aria-hidden="true" />
                  {dictionary.reset}
                </button>
              ) : null}
            </div>

            {filteredSkills.length > 0 ? (
              <div className={`market-card-grid market-card-grid--${view}`}>
                {visibleSkills.map((skill) => {
                  const installState = getSkillInstallState(
                    skill.verification.en,
                  );
                  const isSkillInstallable = installState.installable;
                  const isVerified = verificationKey(skill) === "verified";
                  const publisherSlug = publisherSlugFromName(skill.author);
                  const hasPublisherProfile =
                    publicPublisherSlugs.has(publisherSlug);
                  const skillProfile = buildSkillProfile(skill, locale);
                  const adoptionPacket = buildAdoptionPacket(skill, locale);
                  const contractHref = localizedHref(
                    `/skills/${skill.slug}#install`,
                    locale,
                  );
                  const adoptHref = localizedHref(
                    `/login?returnTo=${encodeURIComponent(localizedHref(`/skills/${skill.slug}#install`, locale))}`,
                    locale,
                  );

                  return (
                    <article
                      className="market-skill-card lift-card"
                      data-category={skill.categoryKey}
                      data-contract-url={`/skills/${skill.slug}#install`}
                      data-publisher={publisherSlug}
                      data-risk={skill.risk}
                      data-runtime={skill.runtime}
                      data-skill-slug={skill.slug}
                      data-verification={verificationKey(skill)}
                      key={skill.slug}
                    >
                      <div className="market-skill-card__container">
                        <div
                          className="market-skill-logo market-skill-card__icon"
                          aria-hidden="true"
                        >
                          <span>
                            {localizeText(skill.name, locale).slice(0, 1)}
                          </span>
                        </div>
                        <div className="market-skill-card__body">
                          <div className="market-skill-card__title">
                            <h2>
                              <a
                                href={localizedHref(
                                  `/skills/${skill.slug}`,
                                  locale,
                                )}
                              >
                                {localizeText(skill.name, locale)}
                              </a>
                            </h2>
                            <div className="market-skill-card__badges">
                              <span
                                className={`risk-badge risk-badge--${skill.risk}`}
                              >
                                {dictionary.risk[skill.risk]}
                              </span>
                              <span className="market-verify-badge">
                                {localizeText(skill.verification, locale)}
                              </span>
                            </div>
                          </div>

                          <p>{localizeText(skill.summary, locale)}</p>

                          <div className="market-decision-grid">
                            {skillProfile.map((item) => (
                              <span key={item.label}>
                                <small>{item.label}</small>
                                <strong>{item.value}</strong>
                              </span>
                            ))}
                          </div>

                          <div className="market-skill-card__meta">
                            <span>{localizeText(skill.category, locale)}</span>
                            <span>
                              {dictionary.runtime}: {skill.runtime}
                            </span>
                            {hasPublisherProfile ? (
                              <a
                                href={localizedHref(
                                  `/publishers/${publisherSlug}`,
                                  locale,
                                )}
                              >
                                {dictionary.publisher}: {skill.author}
                              </a>
                            ) : (
                              <span>
                                {dictionary.publisher}: {skill.author}
                              </span>
                            )}
                            <span>
                              <Star size={14} aria-hidden="true" />
                              {formatFeedbackSignal(
                                skill,
                                dictionary.feedback,
                                locale,
                              )}
                            </span>
                            {isVerified ? (
                              <span>
                                <BadgeCheck size={14} aria-hidden="true" />
                                {formatMarketplaceMetric(
                                  skill.successRate,
                                  locale,
                                )}{" "}
                                {dictionary.success}
                              </span>
                            ) : (
                              <span>{dictionary.reviewOnlyMetric}</span>
                            )}
                          </div>

                          <div
                            className="market-skill-score"
                            aria-label={dictionary.signals}
                          >
                            <span>
                              <strong>
                                {(skill.feedbackCount ?? 0) > 0
                                  ? skill.rating
                                  : "—"}
                              </strong>
                              <small>
                                {(skill.feedbackCount ?? 0) > 0
                                  ? `${skill.feedbackCount} ${dictionary.feedback}`
                                  : dictionary.reviewOnlyMetric}
                              </small>
                            </span>
                            <span>
                              <strong>
                                {isVerified
                                  ? formatMarketplaceMetric(
                                      skill.successRate,
                                      locale,
                                    )
                                  : "—"}
                              </strong>
                              <small>{dictionary.success}</small>
                            </span>
                            <span>
                              <strong>
                                {formatMarketplaceMetric(skill.latency, locale)}
                              </strong>
                              <small>{dictionary.latency}</small>
                            </span>
                          </div>

                          <div className="market-adoption-row">
                            {adoptionPacket.map((item) => (
                              <span key={item}>{item}</span>
                            ))}
                          </div>

                          <div
                            className="market-contract-preview"
                            aria-label={`${dictionary.contract}: ${localizeText(skill.name, locale)}`}
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
                                copyStatus.kind === "error"
                                  ? "assertive"
                                  : "polite"
                              }
                              className={`market-copy-status market-copy-status--${copyStatus.kind}`}
                              role={
                                copyStatus.kind === "error" ? "alert" : "status"
                              }
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
                      </div>
                      <div className="market-skill-card__actions">
                        <a
                          className={
                            isSkillInstallable
                              ? "market-primary-link"
                              : "market-secondary-link"
                          }
                          href={
                            isSkillInstallable
                              ? adoptHref
                              : localizedHref(`/skills/${skill.slug}`, locale)
                          }
                        >
                          <PackageCheck size={15} aria-hidden="true" />
                          <span>
                            {isSkillInstallable
                              ? dictionary.installReady
                              : dictionary.installLockedLabel}
                          </span>
                        </a>
                        <a
                          className="market-secondary-link"
                          href={contractHref}
                        >
                          <ShieldCheck size={15} aria-hidden="true" />
                          <span>{dictionary.contract}</span>
                        </a>
                        <a
                          className="market-tertiary-link"
                          href={localizedHref(`/skills/${skill.slug}`, locale)}
                        >
                          <span>{dictionary.detail}</span>
                          <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        {!isSkillInstallable ? (
                          <small>{installState.reason[locale]}</small>
                        ) : null}
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
                      Math.min(
                        current + LOAD_MORE_SKILLS,
                        filteredSkills.length,
                      ),
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
                <h3>
                  {isEmptyCatalog ? emptyCatalog.title : dictionary.emptyTitle}
                </h3>
                <p>
                  {isEmptyCatalog ? emptyCatalog.body : dictionary.emptyBody}
                </p>
                {!isEmptyCatalog ? (
                  <div className="market-empty-state__actions">
                    <a
                      className="secondary-button secondary-button--compact"
                      href={emptyRequestHref}
                    >
                      <MessageSquarePlus size={15} aria-hidden="true" />
                      <span>{dictionary.emptyRequest}</span>
                    </a>
                  </div>
                ) : null}
                {!isEmptyCatalog && emptySuggestions.length > 0 ? (
                  <div className="market-empty-suggestions">
                    <strong>{dictionary.emptySuggestionTitle}</strong>
                    <div>
                      {emptySuggestions.map((suggestion) => (
                        <button
                          className="filter-button"
                          key={suggestion.key}
                          onClick={() => {
                            setCategory(suggestion.key);
                            setPricing("all");
                            setRisk("all");
                            setRuntime("all");
                            setVerification("all");
                            setSort("recommended");
                            setQuery("");
                          }}
                          type="button"
                        >
                          {suggestion.label}
                          <span>{suggestion.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
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

            <div className="market-publisher-callout market-directory-publisher-callout">
              <div>
                <strong>
                  {locale === "zh"
                    ? "发布者可以被企业和 Agent 工作流发现"
                    : "Publishers can be discovered by teams and agent workflows"}
                </strong>
                <span>
                  {locale === "zh"
                    ? "提交后进入 manifest 扫描、权限分级、样例运行和人工复核；通过后获得验证徽章、合约托管、安装分析和付费分发准备。"
                    : "Submit for manifest scanning, permission classification, sample runs, and human review; verified listings get contract hosting, adoption analytics, and paid distribution readiness."}
                </span>
              </div>
              <a
                className="market-secondary-link"
                href={localizedHref("/publish", locale)}
              >
                {locale === "zh" ? "了解发布流程" : "Learn publishing"}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="market-browser market-browser--compact-guides">
        <details className="market-workflow-section">
          <summary className="market-workflow-section__head">
            <span>
              <Target size={15} aria-hidden="true" />
              {dictionary.operatingGuide.kicker}
            </span>
            <strong>{dictionary.operatingGuide.title}</strong>
          </summary>
          <div className="market-workflow-grid">
            {operatingTracks.map((track) => {
              const trackCopy = dictionary.operatingGuide.tracks[track.key];
              const isActive =
                category === track.category && pricing === track.pricing;

              return (
                <button
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? "market-workflow-card market-workflow-card--active"
                      : "market-workflow-card"
                  }
                  key={track.key}
                  onClick={() => applyLaunchTrack(track)}
                  type="button"
                >
                  <span>{trackCopy.eyebrow}</span>
                  <div className="market-workflow-card__body">
                    <strong>{trackCopy.title}</strong>
                    <small>{trackCopy.outcomes.join(" · ")}</small>
                  </div>
                  <small className="market-workflow-card__meta">
                    {track.count} {dictionary.results}
                  </small>
                </button>
              );
            })}
          </div>
        </details>

        <details
          className="market-quality-guide"
          aria-label={dictionary.selectionGuide.title}
        >
          <summary className="market-quality-guide__head">
            <span>
              <ShieldCheck size={15} aria-hidden="true" />
              {dictionary.selectionGuide.kicker}
            </span>
            <strong>{dictionary.selectionGuide.title}</strong>
          </summary>
          <ul className="market-compact-guide-list">
            {dictionary.selectionGuide.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}

function buildSkillProfile(skill: MarketplaceSkillCard, locale: Locale) {
  return [
    {
      label: locale === "zh" ? "适合" : "Best for",
      value: audienceForCategory(skill.categoryKey, locale),
    },
    {
      label: locale === "zh" ? "输入" : "Input",
      value: inputForCategory(skill.categoryKey, locale),
    },
    {
      label: locale === "zh" ? "输出" : "Output",
      value: outputForCategory(skill.categoryKey, locale),
    },
    {
      label: locale === "zh" ? "权限" : "Permissions",
      value: permissionSummary(skill, locale),
    },
  ];
}

function buildAdoptionPacket(skill: MarketplaceSkillCard, locale: Locale) {
  const price = formatPublicPrice(skill, locale);
  const review = skill.lastReviewed.trim()
    ? locale === "zh"
      ? `最近审核：${skill.lastReviewed}`
      : `Reviewed: ${skill.lastReviewed}`
    : locale === "zh"
      ? "最近审核：待补充"
      : "Reviewed: pending";

  return [
    review,
    locale === "zh"
      ? "合约：manifest / schema / runtime"
      : "Contract: manifest / schema / runtime",
    locale === "zh"
      ? `运行环境：${skill.runtime}`
      : `Runtime: ${skill.runtime}`,
    locale === "zh" ? `价格：${price}` : `Plan: ${price}`,
  ];
}

function audienceForCategory(categoryKey: CategoryKey, locale: Locale) {
  const zh: Record<CategoryKey, string> = {
    all: "团队通用",
    automation: "运营、自动化团队",
    content: "内容、品牌团队",
    data: "数据、运营团队",
    dev: "开发、安全团队",
    ecommerce: "电商、商品运营",
    education: "培训、课程团队",
    finance: "财务、运营团队",
    hr: "招聘、人事团队",
    legal: "法务、合规团队",
    marketing: "投放、增长团队",
    ops: "客服、运营团队",
    research: "研究、分析团队",
    sales: "销售、CRM 团队",
    security: "安全、风控团队",
    seo: "增长、内容、SEO 团队",
    ui: "产品、设计团队",
  };
  const en: Record<CategoryKey, string> = {
    all: "General teams",
    automation: "Ops and automation teams",
    content: "Content and brand teams",
    data: "Data and operations teams",
    dev: "Developer and security teams",
    ecommerce: "E-commerce operators",
    education: "Training and course teams",
    finance: "Finance and operations teams",
    hr: "People and recruiting teams",
    legal: "Legal and compliance teams",
    marketing: "Marketing and growth teams",
    ops: "Support and operations teams",
    research: "Research and analysis teams",
    sales: "Sales and CRM teams",
    security: "Security and risk teams",
    seo: "Growth, content, and SEO teams",
    ui: "Product and design teams",
  };

  return locale === "zh" ? zh[categoryKey] : en[categoryKey];
}

function inputForCategory(categoryKey: CategoryKey, locale: Locale) {
  const zh: Record<CategoryKey, string> = {
    all: "任务说明、上下文",
    automation: "流程、触发器、工具",
    content: "关键词、素材、受众",
    data: "表格、字段、样例",
    dev: "接口、代码、变更说明",
    ecommerce: "商品、Listing、评论",
    education: "课程、目标、材料",
    finance: "账单、交易、规则",
    hr: "职位、简历、候选人",
    legal: "合同、条款、政策",
    marketing: "广告、受众、预算",
    ops: "工单、知识库、SOP",
    research: "问题、网页、来源",
    sales: "客户、CRM、通话记录",
    security: "资产、权限、风险信号",
    seo: "URL、关键词、品牌名",
    ui: "页面、截图、Figma",
  };
  const en: Record<CategoryKey, string> = {
    all: "Task and context",
    automation: "Workflow, trigger, tools",
    content: "Keywords, assets, audience",
    data: "Sheets, fields, samples",
    dev: "APIs, code, changes",
    ecommerce: "Products, listings, reviews",
    education: "Course, goals, material",
    finance: "Invoices, transactions, rules",
    hr: "Roles, resumes, candidates",
    legal: "Contracts, clauses, policies",
    marketing: "Ads, audience, budget",
    ops: "Tickets, knowledge, SOPs",
    research: "Question, pages, sources",
    sales: "Accounts, CRM, call notes",
    security: "Assets, permissions, signals",
    seo: "URLs, keywords, brand name",
    ui: "Pages, screenshots, Figma",
  };

  return locale === "zh" ? zh[categoryKey] : en[categoryKey];
}

function outputForCategory(categoryKey: CategoryKey, locale: Locale) {
  const zh: Record<CategoryKey, string> = {
    all: "结构化结果、下一步",
    automation: "流程建议、自动化步骤",
    content: "Brief、草稿、修订建议",
    data: "清洗结果、报告、字段说明",
    dev: "检查结果、修复清单",
    ecommerce: "优化建议、上架清单",
    education: "课程结构、练习、反馈",
    finance: "对账结果、异常清单",
    hr: "筛选摘要、面试建议",
    legal: "风险提示、修订建议",
    marketing: "投放建议、素材方向",
    ops: "回复草稿、分流建议",
    research: "摘要、引用、洞察",
    sales: "触达文案、下一步",
    security: "风险等级、处置建议",
    seo: "评分、修复清单、简报",
    ui: "问题清单、改版建议",
  };
  const en: Record<CategoryKey, string> = {
    all: "Structured result and next step",
    automation: "Workflow advice and steps",
    content: "Brief, draft, edits",
    data: "Cleaned data, reports, schema",
    dev: "Check result and fix list",
    ecommerce: "Optimization and launch checklist",
    education: "Course structure and feedback",
    finance: "Reconciliation and exceptions",
    hr: "Screening summary and interview notes",
    legal: "Risk notes and revision advice",
    marketing: "Campaign advice and creative direction",
    ops: "Reply drafts and routing",
    research: "Summary, citations, insights",
    sales: "Outreach copy and next steps",
    security: "Risk level and remediation",
    seo: "Score, fix list, brief",
    ui: "Issues and design recommendations",
  };

  return locale === "zh" ? zh[categoryKey] : en[categoryKey];
}

function permissionSummary(skill: MarketplaceSkillCard, locale: Locale) {
  if (skill.risk === "low") {
    return locale === "zh"
      ? "低权限，不写入账号"
      : "Low risk, no account write";
  }

  if (skill.risk === "medium") {
    return locale === "zh"
      ? "需复核浏览器/文件权限"
      : "Review browser/file access";
  }

  return locale === "zh" ? "高风险，需负责人批准" : "High risk, owner approval";
}

function normalizeInitialFilters(filters: MarketplaceInitialFilters = {}) {
  return {
    category: normalizeCategory(filters.category),
    pricing: normalizePricing(filters.pricing),
    query: String(filters.query ?? "")
      .trim()
      .slice(0, 120),
    risk: normalizeOption(filters.risk, riskOptions, "all"),
    runtime: normalizeRuntime(filters.runtime),
    sort: normalizeSort(filters.sort),
    verification: normalizeOption(
      filters.verification,
      verificationOptions,
      "all",
    ),
    view: normalizeView(filters.view),
  };
}

function buildSpotlightCounts(skills: MarketplaceSkillCard[]) {
  return skills.reduce<Record<string, number>>((counts, skill) => {
    counts[skill.categoryKey] = (counts[skill.categoryKey] ?? 0) + 1;

    if (skill.billing === "free") {
      counts.free = (counts.free ?? 0) + 1;
    }

    return counts;
  }, {});
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
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

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
  if (value === "lowRisk" || value === "low-risk" || value === "low_risk") {
    return "lowRisk";
  }

  return normalizeOption(value, sortOptions, "recommended");
}

function normalizeView(value: string | undefined): ViewMode {
  return normalizeOption(value, viewOptions, "compact");
}

function serializeSort(sort: SortKey) {
  return sort === "lowRisk" ? "low_risk" : sort;
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
    localizeText(skill.price, locale),
    localizeText(skill.verification, locale),
    skill.verification.en,
    ...skill.tags[locale],
    ...skill.tags.en,
    ...searchAliasesForSkill(skill, locale),
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
  skillOrder: Map<string, number>,
) {
  if (sort === "recommended") {
    return (
      recommendedScore(second, query, locale) -
        recommendedScore(first, query, locale) ||
      getSkillOrder(first, skillOrder) - getSkillOrder(second, skillOrder)
    );
  }

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

  if (skill.billing === "per_call") {
    return locale === "zh"
      ? `${localizeText(skill.price, locale)}，付费市场 / 按次`
      : `${localizeText(skill.price, locale)}, paid marketplace / per call`;
  }

  if (skill.billing === "subscription") {
    return locale === "zh"
      ? `${localizeText(skill.price, locale)}，付费市场 / 订阅`
      : `${localizeText(skill.price, locale)}, paid marketplace / subscription`;
  }

  return locale === "zh" ? "Pro 全量计划内" : "Included in Pro";
}

function diversifyRecommendedSkills(
  skills: MarketplaceSkillCard[],
  visibleCount: number,
) {
  const categories = new Map<CategoryKey, MarketplaceSkillCard[]>();

  for (const skill of skills) {
    const queue = categories.get(skill.categoryKey) ?? [];
    queue.push(skill);
    categories.set(skill.categoryKey, queue);
  }

  const rankedCategories = Array.from(categories.entries())
    .map(([categoryKey, queue]) => ({
      categoryKey,
      score: recommendedScore(queue[0] ?? skills[0], "", "en"),
    }))
    .sort((first, second) => second.score - first.score)
    .map(({ categoryKey }) => categoryKey);

  const result: MarketplaceSkillCard[] = [];

  while (result.length < visibleCount) {
    let advanced = false;

    for (const categoryKey of rankedCategories) {
      const queue = categories.get(categoryKey);
      const next = queue?.shift();

      if (next) {
        result.push(next);
        advanced = true;

        if (result.length >= visibleCount) {
          break;
        }
      }
    }

    if (!advanced) {
      break;
    }
  }

  if (result.length < visibleCount) {
    const used = new Set(result.map((skill) => skill.slug));
    result.push(
      ...skills
        .filter((skill) => !used.has(skill.slug))
        .slice(0, visibleCount - result.length),
    );
  }

  return result;
}

function buildEmptySuggestions(
  skills: MarketplaceSkillCard[],
  query: string,
  locale: Locale,
) {
  const preferredCategories = categoriesForQuery(query.trim().toLowerCase());
  const counts = new Map<CategoryKey, number>();

  for (const skill of skills) {
    counts.set(skill.categoryKey, (counts.get(skill.categoryKey) ?? 0) + 1);
  }

  return preferredCategories
    .map((categoryKey) => {
      const category = marketplaceCategories.find(
        (item) => item.key === categoryKey,
      );
      return {
        count: counts.get(categoryKey) ?? 0,
        key: categoryKey,
        label: category ? localizeText(category.label, locale) : categoryKey,
      };
    })
    .filter((item) => item.count > 0)
    .slice(0, 4);
}

function categoriesForQuery(query: string): CategoryKey[] {
  const mapping: Array<[CategoryKey, string[]]> = [
    ["data", ["excel", "spreadsheet", "csv", "sheet", "表格", "飞书表格"]],
    ["ecommerce", ["shopify", "amazon", "listing", "sku", "商品", "电商"]],
    ["sales", ["salesforce", "hubspot", "crm", "lead", "销售", "客户"]],
    [
      "ops",
      ["slack", "zendesk", "ticket", "support", "客服", "工单", "钉钉", "飞书"],
    ],
    ["dev", ["github", "jira", "linear", "api", "webhook", "代码", "发布"]],
    ["seo", ["seo", "geo", "google", "semrush", "ahrefs", "搜索", "曝光"]],
    ["ui", ["figma", "ui", "ux", "design", "设计", "页面"]],
    ["security", ["security", "risk", "合规", "安全", "漏洞"]],
    ["finance", ["stripe", "invoice", "billing", "账单", "财务"]],
    ["content", ["content", "blog", "copy", "文案", "内容"]],
    ["research", ["research", "browser", "reddit", "调研", "研究"]],
    ["automation", ["zapier", "make", "workflow", "自动化", "流程"]],
  ];

  const matched = mapping
    .filter(([, tokens]) => tokens.some((token) => query.includes(token)))
    .map(([categoryKey]) => categoryKey);

  return matched.length > 0 ? matched : ["seo", "data", "ops", "dev"];
}

function searchAliasesForSkill(skill: MarketplaceSkillCard, locale: Locale) {
  const categoryAliases: Record<CategoryKey, string[]> = {
    all: [],
    automation: ["zapier", "make", "workflow", "流程自动化", "自动化"],
    content: ["blog", "copywriting", "copy", "内容", "文案"],
    data: ["excel", "spreadsheet", "csv", "sheet", "表格", "数据清洗"],
    dev: [
      "github",
      "jira",
      "linear",
      "api",
      "webhook",
      "release",
      "代码",
      "发布",
    ],
    ecommerce: ["shopify", "amazon", "listing", "sku", "商品", "电商"],
    education: ["course", "training", "课程", "培训"],
    finance: ["stripe", "invoice", "billing", "reconciliation", "账单", "财务"],
    hr: ["recruiting", "resume", "ats", "招聘", "简历"],
    legal: ["contract", "compliance", "policy", "合同", "合规"],
    marketing: ["ads", "campaign", "google ads", "meta ads", "广告", "投放"],
    ops: [
      "slack",
      "zendesk",
      "ticket",
      "support",
      "飞书",
      "钉钉",
      "客服",
      "工单",
    ],
    research: ["browser", "reddit", "news", "citations", "研究", "调研"],
    sales: ["salesforce", "hubspot", "crm", "lead", "outbound", "销售", "线索"],
    security: ["security", "risk", "prompt injection", "安全", "风控"],
    seo: ["seo", "geo", "google", "semrush", "ahrefs", "搜索", "AI 搜索"],
    ui: ["figma", "ui", "ux", "design", "accessibility", "设计", "可用性"],
  };

  const specific: string[] = [];
  const name = localizeText(skill.name, locale).toLowerCase();

  if (name.includes("crm")) {
    specific.push("salesforce", "hubspot", "客户管理");
  }

  if (name.includes("spreadsheet") || name.includes("表格")) {
    specific.push("excel", "google sheets", "飞书表格");
  }

  if (name.includes("ticket") || name.includes("工单")) {
    specific.push("zendesk", "intercom", "slack");
  }

  return [...(categoryAliases[skill.categoryKey] ?? []), ...specific];
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
