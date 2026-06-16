import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CircleDollarSign,
  Code2,
  Gauge,
  HandCoins,
  History,
  PackageSearch,
  PlugZap,
  ShieldCheck,
  Store,
  Terminal,
  WalletCards,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { JourneyRail } from "@/components/journey-rail";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { PublicAccessScope } from "@/components/public-access-scope";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
  localizedHrefWithReturnTo,
} from "@/lib/i18n";
import { marketplaceSkills } from "@/lib/marketplace-data";
import {
  getOverviewMetric,
  getPlatformOverview,
} from "@/lib/platform-overview";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import {
  getPublicMarketplaceSkills,
  type PublicMarketplaceSearchOptions,
} from "@/lib/public-marketplace";
import { getPublicPublishers } from "@/lib/public-publishers";
import { isVerifiedSkillStatus } from "@/lib/skill-install-state";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub Marketplace - 浏览可治理的 Agent Skills"
    : "SkillHub Marketplace - Governed AI Agent Skills";
  const description = isZh
    ? "浏览公开 Skill 目录，检查 manifest、权限、发布者与预览状态；运行调用需登录工作台并使用 Project Key。"
    : "Browse public Skills, inspect manifests, permissions, publisher trust, and preview status. Runtime use requires a signed-in workspace and Project Key.";
  const url = `https://useskillhub.com/marketplace?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/marketplace?lang=en",
        "zh-CN": "https://useskillhub.com/marketplace?lang=zh",
        "x-default": "https://useskillhub.com/marketplace",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "SkillHub",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

type SearchParamRecord = Record<string, string | string[] | undefined>;

type MarketplaceInitialFilterState = {
  category?: string;
  pricing?: string;
  query?: string;
  risk?: string;
  runtime?: string;
  sort?: string;
  verification?: string;
};

const pageCopy = {
  en: {
    eyebrow: "Agent skill marketplace",
    title: "Find AI Agent Skills by job, category, risk, and plan.",
    description:
      "Browse skills across SEO/GEO, UI/UX, content, CRM, data, finance, research, support, automation, API, and security. Find Skills is for human comparison; the Skill API keeps the inspectable manifest, schema, runtime, and version contract behind each listing.",
    primary: "Browse skills",
    directory: "Publisher directory",
    console: "Developer workspace",
    consoleTitle: "How to read this page",
    consoleSubtitle:
      "Start with the marketplace card, open the detail page for manifest evidence, then sign in only when a verified skill should become project state.",
    proof: [
      "Use case",
      "Permission risk",
      "Publisher trust",
      "Runtime evidence",
    ],
    decisionTitle: "Find Skills vs Skill API",
    decisionRows: [
      [
        "Find Skills",
        "A human-facing surface for discovery, category filtering, plan comparison, and publisher trust.",
      ],
      [
        "Skill API",
        "The machine-readable contract layer for manifest, schema, versions, runtime metadata, and API inspection.",
      ],
      [
        "After sign-in",
        "Verified skills can be attached to projects with policy, budget, and runtime evidence.",
      ],
      [
        "Public limit",
        "Public pages do not invoke production runtimes or execute operator actions.",
      ],
    ],
    mcpMetadataNote:
      "MCP metadata only; runtime invocation uses POST /mcp after project auth.",
    publishTitle: "Publisher review path",
    publishSteps: [
      "Draft manifest",
      "Runtime checks",
      "Human review",
      "Paid-readiness metadata",
      "Public listing",
      "Prelaunch ledger model",
      "Future paid review",
    ],
    trustTitle: "Launch requirements",
    trustItems: [
      [
        "Manifest",
        "Typed input/output, runtime, permissions, version, author.",
      ],
      [
        "Security",
        "Permission classification, runtime checks, secret handling, data retention.",
      ],
      [
        "Money",
        "Prelaunch commission and ledger model; no general payment capture.",
      ],
      [
        "Support",
        "Changelog, deprecation policy, issue channel, response expectations.",
      ],
    ],
    moneyTitle: "Future paid marketplace model",
    moneyRows: [
      [
        "Current stage",
        "Developer Preview catalog; payment capture is prelaunch",
      ],
      [
        "Paid readiness",
        "Signed-in publishers can prepare paid-readiness metadata for future finance review",
      ],
      [
        "Future ledger rule",
        "Billable usage will post transactions only after paid marketplace launch gates",
      ],
      [
        "Operator control",
        "Finance evidence remains admin-gated and prelaunch on public pages",
      ],
    ],
    overview: {
      eyebrow: "Architecture preview",
      title:
        "The catalog is tied to buyer, publisher, and operator state without claiming paid launch.",
      body: "These preview signals come from the platform overview API. They explain the discovery-to-runtime architecture while paid marketplace operations remain prelaunch.",
      metrics: {
        activeSubscriptions: "Active subscriptions",
        paidPreview: "Paid preview",
        failedChecks: "Failed checks",
        installedSkills: "Adopted skills",
        openBuyerRequests: "Buyer requests",
        payoutGovernance: "Finance review governance",
        projects: "Projects",
        notificationGovernance: "Notification governance",
        reviewQueue: "Review queue",
        savedSkills: "Saved skills",
        submittedVersions: "Submitted versions",
        updateInbox: "Update inbox",
      },
      roles: {
        admin: {
          empty: "No active risk signals.",
          subtitle:
            "Review, payout, notification, and incident queues are protected inside the admin console.",
          title: "Operator controls",
        },
        developer: {
          empty: "No installed-skill updates.",
          subtitle:
            "Projects return for policies, version changes, budgets, keys, and runtime evidence.",
          title: "Developers",
        },
        publisher: {
          empty: "No publisher actions.",
          subtitle:
            "Authors return for review feedback, runtime checks, demand signals, and paid-readiness blockers.",
          title: "Publishers",
        },
      },
      queueLabels: {
        action: "Action",
        event: "Event",
        next: "Next step",
        scope: "Scope",
        severity: "Severity",
        stage: "Stage",
      },
      retentionTitle: "Why teams come back",
      retention: {
        developer: [
          "Approve and update adopted skills per project.",
          "Watch cost, failures, latency, incidents, and budget state.",
          "Compare better verified alternatives as the catalog grows.",
        ],
        publisher: [
          "Repair review and runtime issues before losing distribution.",
          "Turn buyer requests and feedback into improved versions.",
          "Prepare paid-readiness metadata and finance-review details before real paid usage launches.",
        ],
      },
    },
    catalogMetric: "Public catalog preview",
    publisherMetric: "Public publishers",
    verifiedPublisherMetric: "Verified publishers",
    reviewMetric: "Review gates",
    reviewMetricValue: "Schema + Runtime + Human",
    moneyMetric: "Paid workflow",
    moneyMetricValue: "Prelaunch model",
    publisherDirectoryTitle: "Supplier trust is part of discovery",
    publisherDirectoryBody:
      "Every marketplace card links to the supplier behind the skill. The public directory lets teams compare profile state, verified listings, public review status, adoption evidence, and runtime evidence before adopting.",
    publisherDirectoryCta: "Browse publishers",
    loopEyebrow: "Verified skill adoption path",
    loopTitle: "The marketplace keeps a gated path after sign-in.",
    loopBody:
      "A useful skill registry is not finished when an agent copies a command. Verified skills can move into project policy and runtime evidence; submitted skills stay inspection-only until review passes.",
    loopSteps: [
      [
        "Inspect",
        "Manifest, permissions, runtime, pricing intent, and publisher profile are visible before adoption.",
        "Public contract",
      ],
      [
        "Adopt",
        "Signed-in teams attach a verified skill to a project key or MCP server with explicit policy context.",
        "Project gate",
      ],
      [
        "Invoke",
        "Verified runtime calls carry typed input, project policy checks, success signals, and reviewable output.",
        "Runtime evidence",
      ],
      [
        "Return",
        "Feedback, incidents, changelog updates, and paid-readiness blockers create the next publisher action.",
        "Retention loop",
      ],
    ],
    loopMetrics: {
      callable: "Callable skills",
      calls: "Recorded calls",
      feedback: "Feedback signals",
      submitted: "Submitted skills",
    },
    loopLedgerTitle: "What teams can revisit",
    loopLedgerRows: [
      [
        "Buyer view",
        "Adoption trail",
        "Permission profile, pricing intent, and project policy stay inspectable after sign-in.",
      ],
      [
        "Agent view",
        "Runtime proof",
        "The agent can validate schema, latency, and success history before repeated calls.",
      ],
      [
        "Publisher view",
        "Action queue",
        "Reviews, incidents, usage, and changelog pressure feed the next version.",
      ],
      [
        "Paid preview view",
        "Prelaunch ledger model",
        "Future paid usage reaches ledger review only after paid marketplace launch gates.",
      ],
    ],
  },
  zh: {
    eyebrow: "智能体找技能",
    title: "按任务和分类找到合适的 AI Agent 技能。",
    description:
      "找技能页面按 SEO/GEO、UI/UX、内容文案、CRM、数据、财务后台、研究浏览器、客服运营、自动化流程、API、安全合规来组织。这里负责让客户找技能、比套餐、看风险；技能 API 负责保存可检查的 manifest、schema、运行时和版本契约。",
    primary: "开始找技能",
    directory: "发布者目录",
    console: "开发者工作台",
    consoleTitle: "这个页面怎么用",
    consoleSubtitle:
      "先看市场卡片判断是否值得采用，再进详情页检查 manifest 和权限；只有确认要接入项目时，才需要登录进入工作台。",
    proof: ["用途清楚", "权限清楚", "发布者清楚", "证据清楚"],
    decisionTitle: "找技能和技能 API 的区别",
    decisionRows: [
      ["找技能", "给人选技能、按分类筛选、比套餐、比风险、看发布者信任。"],
      [
        "技能 API",
        "给系统和 API 查 manifest、schema、版本、运行时和检索结果。",
      ],
      ["登录后可做", "把已验证技能加入项目，配置策略、预算并查看运行证据。"],
      ["公开页不做", "不直接调用生产运行时，也不执行后台运营操作。"],
    ],
    mcpMetadataNote:
      "MCP 这里只展示能力元数据；真正调用要登录后通过项目 Key 进行。",
    publishTitle: "发布者怎么上架",
    publishSteps: [
      "准备 manifest",
      "跑运行测试",
      "人工审核",
      "补全定价",
      "公开上架",
      "维护版本",
      "处理反馈",
    ],
    trustTitle: "采用前要看清什么",
    trustItems: [
      ["契约", "输入输出、运行时、版本和作者。"],
      ["权限", "网络、浏览器、文件、密钥和高风险能力。"],
      ["验证", "状态、更新记录、运行证据和问题历史。"],
      ["发布者", "资料完整度、支持路径和响应速度。"],
    ],
    moneyTitle: "找技能和技能 API 的区别",
    moneyRows: [
      ["找技能", "给人选技能、看卡片、看发布者、看是否适合采用"],
      ["技能 API", "给系统和 API 查技能契约、版本和检索结果"],
      ["登录后可做什么", "把已验证技能加入项目，保存策略并看运行结果"],
      [
        "公开页不能做什么",
        "不在这里直接调用生产运行时，也不在这里执行后台操作",
      ],
    ],
    overview: {
      eyebrow: "一眼看懂",
      title: "先找技能，再看技能 API。",
      body: "找技能是给人看和挑的页面，技能 API 是给开发者、Agent 和系统读取的底层合约清单。两者不是重复按钮，而是两层不同的入口。",
      metrics: {
        activeSubscriptions: "活跃订阅",
        paidPreview: "付费预览",
        failedChecks: "失败检查",
        installedSkills: "已采用技能",
        openBuyerRequests: "买方需求",
        payoutGovernance: "财务复核治理",
        projects: "项目",
        notificationGovernance: "通知治理",
        reviewQueue: "审核队列",
        savedSkills: "收藏技能",
        submittedVersions: "提交版本",
        updateInbox: "更新收件箱",
      },
      roles: {
        admin: {
          empty: "暂无活跃风险信号。",
          subtitle: "审核、财务复核、通知和事故队列用于保护上线准备。",
          title: "平台运营",
        },
        developer: {
          empty: "暂无已采用技能更新。",
          subtitle: "项目会为了策略、版本变化、预算、Key 和运行证据回到平台。",
          title: "开发者",
        },
        publisher: {
          empty: "暂无发布者行动。",
          subtitle:
            "作者会为了审核反馈、运行检查、需求信号和付费准备阻断项回到平台。",
          title: "发布者",
        },
      },
      queueLabels: {
        action: "动作",
        event: "事件",
        next: "下一步",
        scope: "范围",
        severity: "级别",
        stage: "阶段",
      },
      retentionTitle: "团队为什么会再次回来",
      retention: {
        developer: [
          "按项目批准和更新已采用技能。",
          "观察成本、失败率、延迟、事故和预算状态。",
          "随着目录增长，比较更好的已验证替代方案。",
        ],
        publisher: [
          "在失去分发前修复审核和运行问题。",
          "把买方需求和反馈转成改进版本。",
          "在真实付费使用上线前准备付费门槛和财务复核资料。",
        ],
      },
    },
    catalogMetric: "公开技能数",
    publisherMetric: "发布者数",
    verifiedPublisherMetric: "已验证发布者",
    reviewMetric: "审核关卡",
    reviewMetricValue: "Schema / 运行时 / 人审",
    moneyMetric: "采用路径",
    moneyMetricValue: "登录后接入",
    publisherDirectoryTitle: "供应方信任也是发现的一部分",
    publisherDirectoryBody:
      "每张市场技能卡都会连接到背后的发布者。公开目录让团队在采用前比较资料状态、已验证上架、公开审核状态、采用证据和运行证据。",
    publisherDirectoryCta: "浏览发布者",
    loopEyebrow: "已验证技能采用路径",
    loopTitle: "看清楚，再接入。",
    loopBody:
      "先在找技能页面比对技能，再进入技能 API 查看合约细节。已验证技能可以在登录后进入项目策略和运行证据；未验证技能只能公开查看。",
    loopSteps: [
      ["检查", "先看技能用途、权限、版本和发布者。", "公共合约"],
      ["采用", "登录团队把已验证技能挂到项目 key 或 MCP server。", "项目关卡"],
      [
        "调用",
        "已验证运行调用携带类型化输入、策略检查和可复核输出。",
        "运行证据",
      ],
      ["回访", "反馈、事故和更新记录会形成下一次发布者行动。", "留存闭环"],
    ],
    loopMetrics: {
      callable: "可调用技能",
      calls: "已记录调用",
      feedback: "反馈信号",
      submitted: "已提交技能",
    },
    loopLedgerTitle: "团队可回访的信息",
    loopLedgerRows: [
      ["买家视角", "采用轨迹", "权限画像和项目策略在登录后保持可检查。"],
      [
        "Agent 视角",
        "运行证据",
        "Agent 可在重复调用前校验 schema、延迟和成功历史。",
      ],
      ["发布者视角", "行动队列", "评价、事故和更新压力会进入下一版本。"],
      [
        "技能 API 视角",
        "底层清单",
        "用于检索契约、版本和可调用能力，而不是直接下单。",
      ],
    ],
  },
} as const;

const loopStepIcons = [PackageSearch, PlugZap, Gauge, History] as const;
const overviewRoleIcons = [PlugZap, HandCoins, ShieldCheck] as const;

function formatCompactMetric(value: number, locale: keyof typeof pageCopy) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function formatQueueValue(value: string, locale: keyof typeof pageCopy) {
  const normalized = value.replaceAll("_", " ");
  const zhLabels: Record<string, string> = {
    "Complete runtime verification": "完成运行验证",
    "Confirm per-call cap": "确认按次调用上限",
    "Confirm pricing": "确认价格",
    "Data policy": "数据政策",
    "Fix runtime checks": "修复运行检查",
    "High-risk filesystem skill": "高风险文件系统技能",
    "Hold for finance transfer review": "暂停并做财务转账复核",
    "Improve listing quality": "提升上架质量",
    "Medium risk approved": "中风险已批准",
    "Network access flagged": "网络访问已标记",
    "New payout threshold": "新提现门槛",
    "Pending buyer approval": "待买方批准",
    "Pending publisher update": "待发布者更新",
    "Prepare pricing metadata": "准备价格元数据",
    "Resubmit with changes": "修改后重新提交",
    "Review pending": "审核中",
    "Review runtime checks": "审核运行检查",
    "Runtime evidence": "运行证据",
    "Submit for review": "提交审核",
    approved: "已批准",
    critical: "严重",
    draft: "草稿",
    global: "全局",
    high: "高",
    info: "信息",
    medium: "中",
    "new version": "新版本",
    "data policy update": "数据政策更新",
    "owner approval required": "需要负责人批准",
  };

  if (locale === "zh") {
    return zhLabels[normalized] ?? zhLabels[value] ?? normalized;
  }

  return normalized;
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = pageCopy[locale];
  const initialFilters: MarketplaceInitialFilterState = {
    category: firstSearchParam(params, "category"),
    pricing:
      firstSearchParam(params, "pricing") ??
      firstSearchParam(params, "billingModel"),
    query: firstSearchParam(params, "q") ?? firstSearchParam(params, "query"),
    risk:
      firstSearchParam(params, "permissionLevel") ??
      firstSearchParam(params, "risk"),
    runtime: firstSearchParam(params, "runtime"),
    sort: firstSearchParam(params, "sort"),
    verification:
      firstSearchParam(params, "verification") ??
      firstSearchParam(params, "verificationStatus"),
  };
  const marketplaceSearchOptions =
    toPublicMarketplaceSearchOptions(initialFilters);
  const [skills, publishers, overview] = await Promise.all([
    getPublicMarketplaceSkills(marketplaceSearchOptions),
    getPublicPublishers(),
    getPlatformOverview(),
  ]);
  const publicStats = await getPublicPlatformStats({ publishers });
  const publicSkillLinkIndex = mergeSkillLinkIndex(skills);
  const metrics = [
    [labels.catalogMetric, String(publicStats.publicSkills)],
    [labels.publisherMetric, String(publicStats.publicPublishers)],
    [labels.verifiedPublisherMetric, String(publicStats.verifiedPublishers)],
    [labels.reviewMetric, labels.reviewMetricValue],
    [labels.moneyMetric, labels.moneyMetricValue],
  ];
  const loopMetrics = [
    [labels.loopMetrics.callable, String(publicStats.callableSkills)],
    [
      labels.loopMetrics.calls,
      formatCompactMetric(publicStats.recordedCalls, locale),
    ],
    [
      labels.loopMetrics.feedback,
      formatCompactMetric(publicStats.feedbackSignals, locale),
    ],
    [labels.loopMetrics.submitted, String(publicStats.submittedSkills)],
  ];
  const overviewCards = [
    {
      empty: labels.overview.roles.developer.empty,
      href: localizedHrefWithReturnTo("/login", locale, "/developer"),
      metrics: [
        [
          labels.overview.metrics.projects,
          getOverviewMetric(overview.developer.metrics, "Projects", "0"),
        ],
        [
          labels.overview.metrics.installedSkills,
          getOverviewMetric(
            overview.developer.metrics,
            "Installed skills",
            "0",
          ),
        ],
        [
          labels.overview.metrics.updateInbox,
          getOverviewMetric(overview.developer.metrics, "Update inbox", "0"),
        ],
      ],
      rows: overview.developer.updateInbox.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.event}: ${formatQueueValue(row.event, locale)}`,
        meta: `${labels.overview.queueLabels.severity}: ${formatQueueValue(row.severity, locale)}`,
        title: row.skill,
      })),
      subtitle: labels.overview.roles.developer.subtitle,
      title: labels.overview.roles.developer.title,
    },
    {
      empty: labels.overview.roles.publisher.empty,
      href: localizedHref("/publisher", locale),
      metrics: [
        [
          labels.overview.metrics.submittedVersions,
          getOverviewMetric(
            overview.publisher.metrics,
            "Submitted versions",
            "0",
          ),
        ],
        [
          labels.overview.metrics.failedChecks,
          getOverviewMetric(
            overview.publisher.metrics,
            "Runtime checks failed",
            "0",
          ),
        ],
        [
          labels.overview.metrics.paidPreview,
          locale === "zh" ? "预发布" : "Prelaunch",
        ],
      ],
      rows: overview.publisher.reviewPipeline.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.stage}: ${formatQueueValue(row.stage, locale)}`,
        meta: `${labels.overview.queueLabels.next}: ${formatQueueValue(row.nextStep, locale)}`,
        title: row.skill,
      })),
      subtitle: labels.overview.roles.publisher.subtitle,
      title: labels.overview.roles.publisher.title,
    },
    {
      empty: labels.overview.roles.admin.empty,
      metrics: [
        [
          labels.overview.metrics.reviewQueue,
          locale === "zh" ? "后台门控" : "Admin gated",
        ],
        [
          labels.overview.metrics.payoutGovernance,
          locale === "zh" ? "预发布" : "Prelaunch",
        ],
        [
          labels.overview.metrics.notificationGovernance,
          locale === "zh" ? "后台门控" : "Admin gated",
        ],
      ],
      rows: overview.admin.riskQueue.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.scope}: ${formatQueueValue(row.scope, locale)}`,
        meta: `${labels.overview.queueLabels.action}: ${formatQueueValue(row.action, locale)}`,
        title: formatQueueValue(row.signal, locale),
      })),
      subtitle: labels.overview.roles.admin.subtitle,
      title: labels.overview.roles.admin.title,
    },
  ];

  return (
    <AppShell active="marketplace" locale={locale}>
      <section className="market-hero" aria-labelledby="marketplace-heading">
        <Reveal>
          <div className="market-hero__copy">
            <div className="eyebrow">
              <Store size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1 id="marketplace-heading">{labels.title}</h1>
            <p>{labels.description}</p>
            <div className="market-hero__actions">
              <a className="btn-primary--large" href="#catalog">
                <PackageSearch size={18} aria-hidden="true" />
                <span>{labels.primary}</span>
              </a>
              <a
                className="btn-secondary--large"
                href={localizedHref("/publishers", locale)}
              >
                <Building2 size={18} aria-hidden="true" />
                <span>{labels.directory}</span>
              </a>
              <a
                className="btn-text"
                href={localizedHrefWithReturnTo("/login", locale, "/developer")}
              >
                <WalletCards size={17} aria-hidden="true" />
                <span>{labels.console}</span>
              </a>
            </div>
          </div>
        </Reveal>
        <aside className="market-hero-panel" aria-label={labels.consoleTitle}>
          <div className="market-hero-panel__head">
            <span>
              <Terminal size={16} aria-hidden="true" />
              {labels.consoleTitle}
            </span>
            <strong>{labels.reviewMetricValue}</strong>
          </div>
          <p>{labels.consoleSubtitle}</p>
          <div className="market-decision-list">
            {labels.decisionRows.map(([label, value]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div className="proof-grid">
            {labels.proof.map((item) => (
              <span key={item}>
                <BadgeCheck size={14} aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <div className="section-divider" />

      <PublicAccessScope locale={locale} />

      <div className="section-divider" />

      <section
        className="marketplace-ops-strip"
        aria-label="Marketplace operating metrics"
      >
        {metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div className="section-divider" />

      {/* Catalog */}
      <div id="catalog">
        <nav
          aria-label={
            locale === "zh" ? "公开技能详情链接" : "Public skill detail links"
          }
          className="visually-hidden"
        >
          {publicSkillLinkIndex.map((skill) => (
            <a href={localizedHref(`/skills/${skill.slug}`, locale)} key={skill.slug}>
              {skill.name[locale]}
            </a>
          ))}
        </nav>
        <MarketplaceBrowser
          initialFilters={initialFilters}
          locale={locale}
          publisherProfiles={publishers}
          skills={skills}
        />
      </div>

      <div className="section-divider" />

      <JourneyRail
        currentStep="marketplace"
        journey="developer"
        locale={locale}
      />

      <div className="section-divider" />

      <OperatingEvidenceChain
        focus="marketplace"
        locale={locale}
        stats={[
          {
            label: labels.catalogMetric,
            value: String(publicStats.publicSkills),
          },
          {
            label: labels.publisherMetric,
            value: String(publicStats.publicPublishers),
          },
          {
            label: labels.loopMetrics.calls,
            value: formatCompactMetric(publicStats.recordedCalls, locale),
          },
          {
            label: labels.loopMetrics.submitted,
            tone: publicStats.submittedSkills > 0 ? "attention" : "neutral",
            value: String(publicStats.submittedSkills),
          },
        ]}
      />

      <div className="section-divider" />

      <section
        className="market-overview-section"
        aria-labelledby="market-overview-heading"
      >
        <div className="market-overview-head">
          <div>
            <div className="eyebrow">
              <Gauge size={16} aria-hidden="true" />
              <span>{labels.overview.eyebrow}</span>
            </div>
            <h2 id="market-overview-heading">{labels.overview.title}</h2>
          </div>
          <p>{labels.overview.body}</p>
        </div>

        <div className="market-overview-grid">
          {overviewCards.map((card, index) => {
            const Icon = overviewRoleIcons[index];

            return (
              <Reveal key={card.title} delay={index * 120}>
                <article className="market-overview-card">
                  <header>
                    <span className="market-overview-card__icon">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.subtitle}</p>
                    </div>
                  </header>

                  <div className="market-overview-metrics">
                    {card.metrics.map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="market-overview-queue">
                    {card.rows.length > 0 ? (
                      card.rows.map((row) => (
                        <div
                          key={`${card.title}-${row.title}-${row.detail}`}
                          className="market-overview-row"
                        >
                          <strong>{row.title}</strong>
                          <span>{row.detail}</span>
                          <small>{row.meta}</small>
                        </div>
                      ))
                    ) : (
                      <div className="market-overview-empty">{card.empty}</div>
                    )}
                  </div>

                  {card.href ? (
                    <a className="ghost-button" href={card.href}>
                      <span>{card.title}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="market-overview-card__operator-only">
                      <ShieldCheck size={14} aria-hidden="true" />
                      <span>
                        {locale === "zh" ? "运营专用" : "Operator only"}
                      </span>
                    </span>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>

        <div
          className="market-retention-card"
          aria-label={labels.overview.retentionTitle}
        >
          <strong>{labels.overview.retentionTitle}</strong>
          <div>
            {[
              ...labels.overview.retention.developer,
              ...labels.overview.retention.publisher,
            ].map((reason) => (
              <span key={reason}>
                <BadgeCheck size={14} aria-hidden="true" />
                {reason}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section
        className="market-publisher-callout"
        aria-label={labels.publisherDirectoryTitle}
      >
        <div>
          <div className="eyebrow">
            <Building2 size={16} aria-hidden="true" />
            <span>{labels.publisherDirectoryTitle}</span>
          </div>
          <p>{labels.publisherDirectoryBody}</p>
        </div>
        <a
          className="secondary-button"
          href={localizedHref("/publishers", locale)}
        >
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{labels.publisherDirectoryCta}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </section>

      <div className="section-divider" />

      <section
        className="market-operating-loop"
        aria-labelledby="market-loop-heading"
      >
        <div className="market-loop-copy">
          <div className="eyebrow">
            <Activity size={16} aria-hidden="true" />
            <span>{labels.loopEyebrow}</span>
          </div>
          <div className="market-loop-copy__head">
            <div>
              <h2 id="market-loop-heading">{labels.loopTitle}</h2>
              <p>{labels.loopBody}</p>
            </div>
            <span className="market-loop-live">{labels.reviewMetricValue}</span>
          </div>

          <div
            className="market-loop-metric-grid"
            aria-label={labels.loopEyebrow}
          >
            {loopMetrics.map(([label, value]) => (
              <div key={label} className="market-loop-metric">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="market-loop-steps">
            {labels.loopSteps.map(([title, detail, meta], index) => {
              const Icon = loopStepIcons[index];

              return (
                <article key={title} className="market-loop-step">
                  <div className="market-loop-step__top">
                    <span className="market-loop-step__icon">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <small>{meta}</small>
                  </div>
                  <strong>{title}</strong>
                  <p>{detail}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside
          className="market-loop-ledger"
          aria-label={labels.loopLedgerTitle}
        >
          <div className="market-loop-ledger__head">
            <div className="eyebrow">
              <CircleDollarSign size={16} aria-hidden="true" />
              <span>{labels.loopLedgerTitle}</span>
            </div>
            <span>{labels.moneyMetricValue}</span>
          </div>
          <div className="market-loop-log">
            {labels.loopLedgerRows.map(([phase, signal, detail]) => (
              <div key={phase} className="market-loop-log-row">
                <span>{phase}</span>
                <div>
                  <strong>{signal}</strong>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <div className="section-divider" />

      <section className="market-operations-layout market-operations-layout--bottom">
        <article className="market-ops-panel">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.trustTitle}</span>
          </div>
          <div className="trust-requirement-grid">
            {labels.trustItems.map(([title, detail]) => (
              <div key={title} className="trust-requirement">
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="market-ops-panel">
          <div className="eyebrow">
            <BookOpenCheck size={16} aria-hidden="true" />
            <span>{labels.publishTitle}</span>
          </div>
          <div className="publish-flow-list">
            {labels.publishSteps.map((step, index) => (
              <div key={step} className="publish-flow-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
          <a
            className="ghost-button ghost-button--inline"
            href={localizedHref("/docs", locale)}
          >
            <Code2 size={16} aria-hidden="true" />
            <span>{dictionary.nav.docs}</span>
          </a>
        </aside>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">
              {locale === "zh"
                ? "找到合适的技能了吗？"
                : "Found the right skill?"}
            </h2>
            <p className="body-text max-w-[480px] mx-auto mb-8">
              {locale === "zh"
                ? "注册开发者账号开始集成，或浏览发布者目录。"
                : "Sign up for a developer account to start integrating, or browse the publisher directory."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                className="btn-primary"
                href={localizedHrefWithReturnTo("/login", locale, "/developer")}
              >
                <span>
                  {locale === "zh" ? "开发者工作台" : "Developer workspace"}
                </span>
              </a>
              <a
                className="btn-secondary"
                href={localizedHref("/publishers", locale)}
              >
                <span>
                  {locale === "zh" ? "发布者目录" : "Publisher directory"}
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}

function firstSearchParam(params: SearchParamRecord, key: string) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function mergeSkillLinkIndex(skills: typeof marketplaceSkills) {
  const merged = new Map<string, (typeof marketplaceSkills)[number]>();

  for (const skill of marketplaceSkills) {
    if (isVerifiedSkillStatus(skill.verification.en)) {
      merged.set(skill.slug, skill);
    }
  }

  for (const skill of skills) {
    merged.set(skill.slug, skill);
  }

  return Array.from(merged.values());
}

function toPublicMarketplaceSearchOptions(
  filters: MarketplaceInitialFilterState,
): PublicMarketplaceSearchOptions {
  return {
    billingModel: parseMarketplaceBilling(filters.pricing),
    category: parseMarketplaceCategory(filters.category),
    limit: 50,
    permissionLevel: parseMarketplaceRisk(filters.risk),
    query: parseMarketplaceQuery(filters.query),
    runtimeType: parseMarketplaceRuntime(filters.runtime),
    sort: parseMarketplaceSort(filters.sort),
    verificationStatus: parseMarketplaceVerification(filters.verification),
  };
}

function parseMarketplaceQuery(value: string | undefined) {
  const query = String(value ?? "")
    .trim()
    .slice(0, 120);
  return query.length > 0 ? query : undefined;
}

function parseMarketplaceCategory(
  value: string | undefined,
): PublicMarketplaceSearchOptions["category"] {
  const normalized = value === "support" ? "ops" : value;

  if (
    normalized === "automation" ||
    normalized === "content" ||
    normalized === "data" ||
    normalized === "dev" ||
    normalized === "ecommerce" ||
    normalized === "education" ||
    normalized === "finance" ||
    normalized === "hr" ||
    normalized === "legal" ||
    normalized === "marketing" ||
    normalized === "ops" ||
    normalized === "research" ||
    normalized === "sales" ||
    normalized === "security" ||
    normalized === "seo" ||
    normalized === "ui"
  ) {
    return normalized;
  }

  return undefined;
}

function parseMarketplaceBilling(
  value: string | undefined,
): PublicMarketplaceSearchOptions["billingModel"] {
  if (value === "pro") {
    return "pro";
  }

  if (value === "free" || value === "per_call" || value === "subscription") {
    return value;
  }

  return undefined;
}

function parseMarketplaceRisk(
  value: string | undefined,
): PublicMarketplaceSearchOptions["permissionLevel"] {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

function parseMarketplaceRuntime(
  value: string | undefined,
): PublicMarketplaceSearchOptions["runtimeType"] {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "http" || normalized === "mcp" || normalized === "local") {
    return normalized;
  }

  return undefined;
}

function parseMarketplaceVerification(
  value: string | undefined,
): PublicMarketplaceSearchOptions["verificationStatus"] {
  if (value === "verified" || value === "submitted" || value === "deprecated") {
    return value;
  }

  if (value === "review") {
    return "submitted";
  }

  return undefined;
}

function parseMarketplaceSort(
  value: string | undefined,
): PublicMarketplaceSearchOptions["sort"] {
  if (
    value === "adoption" ||
    value === "recommended" ||
    value === "recent" ||
    value === "success"
  ) {
    return value;
  }

  if (value === "lowRisk" || value === "low-risk" || value === "low_risk") {
    return "low_risk";
  }

  return undefined;
}
