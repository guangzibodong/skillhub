import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Code2,
  PackageSearch,
  ShieldCheck,
  Store,
  Terminal,
} from "lucide-react";
import type { Metadata } from "next";
import styles from "./marketplace.module.css";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import {
  MarketplaceBrowser,
  type MarketplaceSkillCard,
} from "@/components/marketplace-browser";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
  localizedHrefWithReturnTo,
} from "@/lib/i18n";
import { marketplaceSkills } from "@/lib/marketplace-data";
import {
  getPublicPlatformStats,
  type PublicPlatformStats,
} from "@/lib/public-platform-stats";
import { getPublicMarketplaceSkills } from "@/lib/public-marketplace";
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
  view?: string;
};

const MARKETPLACE_PAGE_SKILL_LIMIT = 720;

const pageCopy = {
  en: {
    eyebrow: "Curated agent skill marketplace",
    title: "Find the right Skill for your Agent workflow.",
    description:
      "Start from the business task, compare output, permissions, review status, and publisher trust, then adopt the Skill into a governed project workspace.",
    primary: "Search the catalog",
    directory: "Publisher directory",
    console: "Developer workspace",
    consoleTitle: "Find the right Skill faster",
    consoleSubtitle:
      "Search by the job to be done, narrow by category and risk, then compare permissions, expected output, publisher, and Skill contract before adoption.",
    proof: [
      "Curated launch catalog",
      "16 business categories",
      "Free basics + Pro",
      "Permission checks",
    ],
    adoptionPath: {
      eyebrow: "Adoption path",
      title: "Confirm boundaries before adoption",
      steps: [
        [
          "Discover Skills",
          "Find candidates by task, team workflow, agent runtime, and tool context.",
        ],
        [
          "Compare contract and permission",
          "Check input, output, runtime, risk level, review state, and publisher details.",
        ],
        [
          "Adopt into a project",
          "After sign-in, install with policy context and keep runtime evidence reviewable.",
        ],
      ],
    },
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
        "Stripe or PayPal checkout is available only when a real provider is configured by admins.",
      ],
      [
        "Support",
        "Changelog, deprecation policy, issue channel, response expectations.",
      ],
    ],
    moneyTitle: "Paid marketplace model",
    moneyRows: [
      ["Checkout providers", "Stripe and PayPal are selected from real admin configuration"],
      [
        "Paid readiness",
        "Signed-in publishers prepare pricing, payout, support, and review evidence before paid activation",
      ],
      [
        "Ledger rule",
        "Captured payments and billable runtime usage post to the finance ledger",
      ],
      [
        "Operator control",
        "Finance evidence remains admin-gated and auditable",
      ],
    ],
    overview: {
      eyebrow: "Architecture preview",
      title:
        "The catalog is tied to buyer, publisher, and operator state without claiming paid launch.",
      body: "These launch signals explain the discovery-to-runtime architecture without inflating production API counts. Public pages may show curated launch examples while verified runtime inventory grows behind the API.",
      metrics: {
        activeSubscriptions: "Active subscriptions",
        paidPreview: "Paid marketplace",
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
    catalogMetric: "Launch catalog",
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
        "Call logs",
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
        "Paid marketplace view",
        "Prelaunch ledger model",
        "Future paid usage reaches ledger review only after paid marketplace launch gates.",
      ],
    ],
  },
  zh: {
    eyebrow: "Agent Skill Marketplace",
    title: "为你的 Agent 工作流找到合适的 Skill。",
    description:
      "从真实业务任务出发，比较每个 Skill 的输出、权限、验证状态和发布者信息，再把它接入项目工作台。",
    primary: "搜索技能目录",
    directory: "发布者目录",
    console: "开发者工作台",
    consoleTitle: "更快找到合适的 Skill",
    consoleSubtitle:
      "先按要完成的任务搜索，再用分类和风险筛选；比较权限、预期产出、发布者和技能合约，确认后再接入项目。",
    proof: ["精选上线目录", "16 个业务分类", "免费基础 + Pro", "权限检查"],
    adoptionPath: {
      eyebrow: "采用路径",
      title: "从发现到接入，先确认边界",
      steps: [
        [
          "发现 Skill",
          "按任务、团队工作流、Agent 运行时和工具上下文找到候选技能。",
        ],
        [
          "比较合约和权限",
          "确认输入输出、运行时、风险等级、验证状态和发布者信息。",
        ],
        [
          "接入项目工作台",
          "登录后安装到项目，配置策略，并保留可复核的调用记录。",
        ],
      ],
    },
    decisionTitle: "找技能和技能 API 的区别",
    decisionRows: [
      ["找技能", "给人选技能、按分类筛选、比套餐、比风险、看发布者信任。"],
      [
        "技能 API",
        "给系统和 API 查 manifest、schema、版本、运行时和检索结果。",
      ],
      ["登录后可做", "把已验证技能加入项目，配置策略、预算并查看调用记录。"],
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
      ["验证", "状态、更新记录、调用记录和问题历史。"],
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
          subtitle: "项目会为了策略、版本变化、预算、Key 和调用记录回到平台。",
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
    catalogMetric: "精选上线目录",
    publisherMetric: "发布者数",
    verifiedPublisherMetric: "已验证发布者",
    reviewMetric: "审核关卡",
    reviewMetricValue: "Schema / 运行时 / 人审",
    moneyMetric: "采用路径",
    moneyMetricValue: "登录后接入",
    publisherDirectoryTitle: "供应方信任也是发现的一部分",
    publisherDirectoryBody:
      "每张市场技能卡都会连接到背后的发布者。公开目录让团队在采用前比较资料状态、已验证上架、公开审核状态、采用证据和调用记录。",
    publisherDirectoryCta: "浏览发布者",
    loopEyebrow: "已验证技能采用路径",
    loopTitle: "看清楚，再接入。",
    loopBody:
      "先在找技能页面比对技能，再进入技能 API 查看合约细节。已验证技能可以在登录后进入项目策略和调用记录；未验证技能只能公开查看。",
    loopSteps: [
      ["检查", "先看技能用途、权限、版本和发布者。", "公共合约"],
      ["采用", "登录团队把已验证技能挂到项目 key 或 MCP server。", "项目关卡"],
      [
        "调用",
        "已验证运行调用携带类型化输入、策略检查和可复核输出。",
        "调用记录",
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
        "调用记录",
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
    "Prepare pricing metadata": "准备价格信息",
    "Resubmit with changes": "修改后重新提交",
    "Review pending": "审核中",
    "Review runtime checks": "审核运行检查",
    "Call logs": "调用记录",
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
    view: firstSearchParam(params, "view"),
    verification:
      firstSearchParam(params, "verification") ??
      firstSearchParam(params, "verificationStatus"),
  };
  const [skills, publishers] = await Promise.all([
    getPublicMarketplaceSkills({
      includeReviewListings: true,
      limit: MARKETPLACE_PAGE_SKILL_LIMIT,
    }),
    getPublicPublishers(),
  ]);
  const rawPublicStats = await getPublicPlatformStats({ publishers });
  const pageSkills = selectMarketplacePageSkills(
    skills,
    MARKETPLACE_PAGE_SKILL_LIMIT,
  );
  const catalogSummary = buildMarketplaceCatalogSummary(pageSkills);
  const publicSkillLinkIndex = mergeSkillLinkIndex(pageSkills);
  const publicStats = reconcileMarketplacePageStats(
    rawPublicStats,
    publicSkillLinkIndex,
  );
  const skillCards = toMarketplaceSkillCards(pageSkills);
  const metrics = [
    [labels.catalogMetric, String(publicStats.publicSkills)],
    [labels.publisherMetric, String(publicStats.publicPublishers)],
    [labels.verifiedPublisherMetric, String(publicStats.verifiedPublishers)],
    [labels.reviewMetric, labels.reviewMetricValue],
    [labels.moneyMetric, labels.moneyMetricValue],
  ];


  return (
    <AppShell active="marketplace" locale={locale}>
      <div className={`marketplace-page ${styles.pageStyles}`}>
        <div className="market-curated-shell">
          <section
            className="market-curated-hero market-hero market-hero--compact"
            aria-labelledby="marketplace-heading"
          >
            <Reveal>
              <div className="market-curated-hero__copy market-hero__copy">
                <div className="eyebrow">
                  <Store size={16} aria-hidden="true" />
                  <span>{labels.eyebrow}</span>
                </div>
                <h1 id="marketplace-heading">
                  {locale === "zh" ? (
                    <>
                      找到适合 Agent
                      <br />
                      工作流的 Skill。
                    </>
                  ) : (
                    labels.title
                  )}
                </h1>
                <p>{labels.description}</p>
                <div
                  className="market-curated-proof"
                  aria-label={labels.eyebrow}
                >
                  {labels.proof.map((item) => (
                    <span key={item}>
                      <BadgeCheck size={14} aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <aside
              className="market-hero-directory-card"
              aria-label={labels.decisionTitle}
            >
              <div>
                <Store size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "目录状态" : "Directory status"}</span>
              </div>
              <dl>
                <div>
                  <dt>{labels.catalogMetric}</dt>
                  <dd>{catalogSummary.total}</dd>
                </div>
                <div>
                  <dt>{locale === "zh" ? "业务分类" : "Categories"}</dt>
                  <dd>{catalogSummary.categories}</dd>
                </div>
                <div>
                  <dt>{locale === "zh" ? "免费入门" : "Free starters"}</dt>
                  <dd>{catalogSummary.free}</dd>
                </div>
              </dl>
              <nav aria-label={labels.decisionTitle}>
                <a href="#catalog">
                  <PackageSearch size={15} aria-hidden="true" />
                  <span>{labels.primary}</span>
                </a>
                <a href={localizedHref("/registry", locale)}>
                  <Terminal size={15} aria-hidden="true" />
                  <span>
                    {locale === "zh" ? "查看 Skill API" : "Open Skill API"}
                  </span>
                </a>
              </nav>
            </aside>
          </section>

          {/* Catalog */}
          <div id="catalog">
            <MarketplaceBrowser
              catalogSummary={catalogSummary}
              catalogTotal={publicStats.publicSkills}
              initialFilters={initialFilters}
              locale={locale}
              publisherProfiles={publishers}
              skills={skillCards}
            />
          </div>
        </div>

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
        <section className="closing-cta marketplace-closing-cta">
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
                  href={localizedHrefWithReturnTo(
                    "/login",
                    locale,
                    "/developer",
                  )}
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
      </div>
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

function reconcileMarketplacePageStats(
  stats: PublicPlatformStats,
  skills: typeof marketplaceSkills,
): PublicPlatformStats {
  const publicSkills = skills.filter((skill) =>
    isVerifiedSkillStatus(skill.verification.en),
  );
  const catalogAuthorCount = new Set(
    publicSkills.map((skill) => skill.author.trim()).filter(Boolean),
  ).size;
  const feedbackSignals = publicSkills.reduce(
    (sum, skill) => sum + (skill.feedbackCount ?? 0),
    0,
  );
  const publicSkillCount = publicSkills.length;

  return {
    ...stats,
    callableSkills: stats.callableSkills,
    feedbackSignals: stats.feedbackSignals,
    publicPublishers: Math.max(stats.publicPublishers, catalogAuthorCount),
    publicSkills: Math.max(stats.publicSkills, publicSkillCount),
    totalSkillRecords: Math.max(stats.totalSkillRecords, publicSkillCount),
    verifiedPublishers: Math.max(stats.verifiedPublishers, catalogAuthorCount),
    verifiedSkills: stats.verifiedSkills,
  };
}

function toMarketplaceSkillCards(
  skills: typeof marketplaceSkills,
): MarketplaceSkillCard[] {
  return skills.map((skill) => ({
    author: skill.author,
    billing: skill.billing,
    category: skill.category,
    categoryKey: skill.categoryKey,
    feedbackCount: skill.feedbackCount,
    installs: skill.installs,
    installsCommand: {
      cli: skill.installsCommand.cli,
    },
    latency: skill.latency,
    lastReviewed: skill.lastReviewed,
    name: skill.name,
    price: skill.price,
    rating: skill.rating,
    risk: skill.risk,
    runtime: skill.runtime,
    slug: skill.slug,
    summary: skill.summary,
    successRate: skill.successRate,
    tags: skill.tags,
    verification: skill.verification,
  }));
}

function buildMarketplaceCatalogSummary(skills: typeof marketplaceSkills) {
  const spotlightCounts: Record<string, number> = {};

  for (const skill of skills) {
    spotlightCounts[skill.categoryKey] =
      (spotlightCounts[skill.categoryKey] ?? 0) + 1;

    if (skill.billing === "free") {
      spotlightCounts.free = (spotlightCounts.free ?? 0) + 1;
    }
  }

  return {
    categories: new Set(skills.map((skill) => skill.categoryKey)).size,
    free: skills.filter((skill) => skill.billing === "free").length,
    pro: skills.filter((skill) => skill.billing !== "free").length,
    spotlightCounts,
    total: skills.length,
  };
}

function selectMarketplacePageSkills(
  skills: typeof marketplaceSkills,
  limit: number,
) {
  if (skills.length <= limit) {
    return skills;
  }

  const buckets = new Map<string, typeof marketplaceSkills>();

  for (const skill of skills) {
    const bucket = buckets.get(skill.categoryKey) ?? [];
    bucket.push(skill);
    buckets.set(skill.categoryKey, bucket);
  }

  const selected: typeof marketplaceSkills = [];
  const seen = new Set<string>();
  const categoryKeys = Array.from(buckets.keys()).sort();

  while (selected.length < limit) {
    let added = false;

    for (const categoryKey of categoryKeys) {
      const bucket = buckets.get(categoryKey);
      const skill = bucket?.shift();

      if (!skill || seen.has(skill.slug)) {
        continue;
      }

      selected.push(skill);
      seen.add(skill.slug);
      added = true;

      if (selected.length >= limit) {
        break;
      }
    }

    if (!added) {
      break;
    }
  }

  return selected;
}
