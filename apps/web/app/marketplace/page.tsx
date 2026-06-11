import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CircleDollarSign,
  ClipboardList,
  Code2,
  Gauge,
  HandCoins,
  History,
  PackageSearch,
  PlugZap,
  ShieldCheck,
  Store,
  Terminal,
  WalletCards
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { JourneyRail } from "@/components/journey-rail";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { PublicAccessScope } from "@/components/public-access-scope";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { localizeText, marketplaceRequests } from "@/lib/marketplace-data";
import { getOverviewMetric, getPlatformOverview } from "@/lib/platform-overview";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import {
  getPublicMarketplaceSkills,
  type PublicMarketplaceSearchOptions
} from "@/lib/public-marketplace";
import { getPublicPublishers } from "@/lib/public-publishers";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
    eyebrow: "Agent skill registry preview",
    title: "Find, inspect, and prepare governed agent skills.",
    description:
      "Developer Preview: search public skills, inspect permissions, and use registry/gateway discovery now. Paid marketplace, payment capture, and payout automation remain prelaunch.",
    primary: "Browse catalog",
    directory: "Publisher directory",
    console: "Sign in for publisher workspace",
    consoleTitle: "Public inspect path",
    consoleSubtitle: "Agents should start from a contract they can inspect before project-gated adoption or runtime use.",
    proof: ["Searchable catalog", "Permission review", "API inspect", "Project-gated runtime"],
    mcpMetadataNote: "MCP metadata only; runtime invocation uses POST /mcp after project auth.",
    requests: "Example skill requests - not live data",
    requestsBody: "These are example demand scenarios for the future paid marketplace. Live buyer requests stay empty until real users submit them.",
    requestBudget: "Sample budget",
    requestState: "Example state",
    requestTag: "Not live",
    publishTitle: "Publisher review path",
    publishSteps: ["Draft manifest", "Runtime checks", "Human review", "Paid-readiness metadata", "Public listing", "Prelaunch ledger model", "Future paid review"],
    trustTitle: "Launch requirements",
    trustItems: [
      ["Manifest", "Typed input/output, runtime, permissions, version, author."],
      ["Security", "Permission classification, runtime checks, secret handling, data retention."],
      ["Money", "Prelaunch commission and ledger model; no general payment capture."],
      ["Support", "Changelog, deprecation policy, issue channel, response expectations."]
    ],
    moneyTitle: "Future paid marketplace model",
    moneyRows: [
      ["Current stage", "Developer Preview catalog; payment capture is prelaunch"],
      ["Paid readiness", "Signed-in publishers can prepare paid-readiness metadata for future finance review"],
      ["Future ledger rule", "Billable usage will post transactions only after paid marketplace launch gates"],
      ["Operator control", "Finance evidence remains admin-gated and prelaunch on public pages"]
    ],
    overview: {
      eyebrow: "Architecture preview",
      title: "The catalog is tied to buyer, publisher, and operator state without claiming paid launch.",
      body:
        "These preview signals come from the platform overview API. They explain the discovery-to-runtime architecture while paid marketplace operations remain prelaunch.",
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
        updateInbox: "Update inbox"
      },
      roles: {
        admin: {
          empty: "No active risk signals.",
          subtitle: "Review, payout, notification, and incident queues are protected inside the admin console.",
          title: "Operator controls"
        },
        developer: {
          empty: "No installed-skill updates.",
          subtitle: "Projects return for policies, version changes, budgets, keys, and runtime evidence.",
          title: "Developers"
        },
        publisher: {
          empty: "No publisher actions.",
          subtitle: "Authors return for review feedback, runtime checks, demand signals, and paid-readiness blockers.",
          title: "Publishers"
        }
      },
      queueLabels: {
        action: "Action",
        event: "Event",
        next: "Next step",
        scope: "Scope",
        severity: "Severity",
        stage: "Stage"
      },
      retentionTitle: "Why teams come back",
      retention: {
        developer: [
          "Approve and update adopted skills per project.",
          "Watch cost, failures, latency, incidents, and budget state.",
          "Compare better verified alternatives as the catalog grows."
        ],
        publisher: [
          "Repair review and runtime issues before losing distribution.",
          "Turn buyer requests and feedback into improved versions.",
          "Prepare paid-readiness metadata and finance-review details before real paid usage launches."
        ]
      }
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
      ["Inspect", "Manifest, permissions, runtime, pricing intent, and publisher profile are visible before adoption.", "Public contract"],
      ["Adopt", "Signed-in teams attach a verified skill to a project key or MCP server with explicit policy context.", "Project gate"],
      ["Invoke", "Verified runtime calls carry typed input, project policy checks, success signals, and reviewable output.", "Runtime evidence"],
      ["Return", "Feedback, incidents, changelog updates, and paid-readiness blockers create the next publisher action.", "Retention loop"]
    ],
    loopMetrics: {
      callable: "Callable skills",
      calls: "Recorded calls",
      feedback: "Feedback signals",
      submitted: "Submitted skills"
    },
    loopLedgerTitle: "What teams can revisit",
    loopLedgerRows: [
      ["Buyer view", "Adoption trail", "Permission profile, pricing intent, and project policy stay inspectable after sign-in."],
      ["Agent view", "Runtime proof", "The agent can validate schema, latency, and success history before repeated calls."],
      ["Publisher view", "Action queue", "Reviews, incidents, usage, and changelog pressure feed the next version."],
      ["Paid preview view", "Prelaunch ledger model", "Future paid usage reaches ledger review only after paid marketplace launch gates."]
    ]
  },
  zh: {
    eyebrow: "智能体技能市场",
    title: "搜索、查看，并准备受治理的智能体技能。",
    description:
      "开发者预览版：现在可以搜索公开技能、查看权限，并使用注册表/网关发现能力。付费市场、支付扣款和自动提现仍处于预发布阶段。",
    primary: "浏览目录",
    directory: "发布者目录",
    console: "登录后进入发布者工作台",
    consoleTitle: "公开查看路径",
    consoleSubtitle: "智能体应先查看可检查的协议，再进入项目门控的采用或运行。",
    proof: ["可搜索目录", "权限审核", "API 查看", "项目门控运行"],
    mcpMetadataNote: "仅 MCP 元数据；运行调用需项目认证后使用 POST /mcp。",
    requests: "示例技能需求 - 非实时数据",
    requestsBody: "这些是未来付费市场的示例需求场景。真实买方需求会在用户提交后才出现，生产数据为空时保持为空。",
    requestBudget: "示例预算",
    requestState: "示例状态",
    requestTag: "非实时",
    publishTitle: "发布者审核路径",
    publishSteps: ["草稿 manifest", "运行测试", "人工审核", "付费准备元数据", "公开上架", "预发布账本模型", "未来付费审核"],
    trustTitle: "上线要求",
    trustItems: [
      ["Manifest", "类型化输入输出、运行时、权限、版本、作者。"],
      ["安全", "权限分类、运行检查、密钥处理、数据保留。"],
      ["资金", "预发布佣金与账本模型；暂不提供通用支付扣款。"],
      ["支持", "更新记录、弃用政策、问题通道、响应预期。"]
    ],
    moneyTitle: "未来付费市场模型",
    moneyRows: [
      ["当前阶段", "开发者预览目录；支付扣款仍处于预发布"],
      ["付费准备", "登录后的发布者可准备付费就绪元数据，供未来财务复核"],
      ["未来账本规则", "可计费使用只会在付费市场上线门槛通过后记账"],
      ["运营控制", "财务凭证保持后台门控，公开页面仅展示预发布状态"]
    ],
    overview: {
      eyebrow: "架构预览",
      title: "目录已连接买家、发布者和运营状态，但不宣称付费市场已上线。",
      body:
        "这些预览信号来自 platform overview API，用来解释从发现到运行的架构；付费市场运营仍处于预发布阶段。",
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
        updateInbox: "更新收件箱"
      },
      roles: {
        admin: {
          empty: "暂无活跃风险信号。",
          subtitle: "审核、财务复核、通知和事故队列用于保护上线准备。",
          title: "平台运营"
        },
        developer: {
          empty: "暂无已采用技能更新。",
          subtitle: "项目会为了策略、版本变化、预算、Key 和运行证据回到平台。",
          title: "开发者"
        },
        publisher: {
          empty: "暂无发布者行动。",
          subtitle: "作者会为了审核反馈、运行检查、需求信号和付费准备阻断项回到平台。",
          title: "发布者"
        }
      },
      queueLabels: {
        action: "动作",
        event: "事件",
        next: "下一步",
        scope: "范围",
        severity: "级别",
        stage: "阶段"
      },
      retentionTitle: "团队为什么会再次回来",
      retention: {
        developer: [
          "按项目批准和更新已采用技能。",
          "观察成本、失败率、延迟、事故和预算状态。",
          "随着目录增长，比较更好的已验证替代方案。"
        ],
        publisher: [
          "在失去分发前修复审核和运行问题。",
          "把买方需求和反馈转成改进版本。",
          "在真实付费使用上线前准备付费门槛和财务复核资料。"
        ]
      }
    },
    catalogMetric: "公开目录预览",
    publisherMetric: "公开发布者",
    verifiedPublisherMetric: "已验证发布者",
    reviewMetric: "审核关卡",
    reviewMetricValue: "Schema / 运行时 / 人审",
    moneyMetric: "付费流程",
    moneyMetricValue: "预发布模型",
    publisherDirectoryTitle: "供应方信任也是发现的一部分",
    publisherDirectoryBody:
      "每张市场技能卡都会连接到背后的发布者。公开目录让团队在采用前比较资料状态、已验证上架、公开审核状态、采用证据和运行证据。",
    publisherDirectoryCta: "浏览发布者",
    loopEyebrow: "已验证技能采用路径",
    loopTitle: "市场在登录后保留一条受控路径。",
    loopBody:
      "有用的技能库不止于复制一条命令。已验证技能可以在登录后进入项目策略和运行证据；已提交但未验证的技能只能公开查看，不能项目采用或测试运行。",
    loopSteps: [
      ["检查", "采用前可以看到 manifest、权限、运行时、定价意图和发布者档案。", "公共合约"],
      ["采用", "登录团队把已验证技能挂到项目 key 或 MCP server，并带上明确策略上下文。", "项目关卡"],
      ["调用", "已验证运行调用携带类型化输入、项目策略检查、成功信号和可复核输出。", "运行证据"],
      ["回访", "反馈、事故、更新记录和付费准备阻断项会形成下一次发布者行动。", "留存闭环"]
    ],
    loopMetrics: {
      callable: "可调用技能",
      calls: "已记录调用",
      feedback: "反馈信号",
      submitted: "已提交技能"
    },
    loopLedgerTitle: "团队可回访的信息",
    loopLedgerRows: [
      ["买家视角", "采用轨迹", "权限画像、定价意图和项目策略在登录后保持可检查。"],
      ["Agent 视角", "运行证据", "Agent 可在重复调用前校验 schema、延迟和成功历史。"],
      ["发布者视角", "行动队列", "评价、事故、用量和更新压力会进入下一版本。"],
      ["付费预览视角", "预发布账本模型", "未来付费用量只会在付费市场上线门槛通过后进入账本审核。"]
    ]
  }
} as const;

const loopStepIcons = [PackageSearch, PlugZap, Gauge, History] as const;
const overviewRoleIcons = [PlugZap, HandCoins, ShieldCheck] as const;

function formatCompactMetric(value: number, locale: keyof typeof pageCopy) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 1,
    notation: "compact"
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
    "owner approval required": "需要负责人批准"
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
    pricing: firstSearchParam(params, "pricing") ?? firstSearchParam(params, "billingModel"),
    query: firstSearchParam(params, "q") ?? firstSearchParam(params, "query"),
    risk: firstSearchParam(params, "permissionLevel") ?? firstSearchParam(params, "risk"),
    runtime: firstSearchParam(params, "runtime"),
    sort: firstSearchParam(params, "sort"),
    verification: firstSearchParam(params, "verification") ?? firstSearchParam(params, "verificationStatus")
  };
  const marketplaceSearchOptions = toPublicMarketplaceSearchOptions(initialFilters);
  const [skills, publishers, overview] = await Promise.all([
    getPublicMarketplaceSkills(marketplaceSearchOptions),
    getPublicPublishers(),
    getPlatformOverview()
  ]);
  const publicStats = await getPublicPlatformStats({ publishers });
  const metrics = [
    [labels.catalogMetric, String(publicStats.publicSkills)],
    [labels.publisherMetric, String(publicStats.publicPublishers)],
    [labels.verifiedPublisherMetric, String(publicStats.verifiedPublishers)],
    [labels.reviewMetric, labels.reviewMetricValue],
    [labels.moneyMetric, labels.moneyMetricValue]
  ];
  const loopMetrics = [
    [labels.loopMetrics.callable, String(publicStats.callableSkills)],
    [labels.loopMetrics.calls, formatCompactMetric(publicStats.recordedCalls, locale)],
    [labels.loopMetrics.feedback, formatCompactMetric(publicStats.feedbackSignals, locale)],
    [labels.loopMetrics.submitted, String(publicStats.submittedSkills)]
  ];
  const overviewCards = [
    {
      empty: labels.overview.roles.developer.empty,
      href: localizedHref("/developer", locale),
      metrics: [
        [labels.overview.metrics.projects, getOverviewMetric(overview.developer.metrics, "Projects", "0")],
        [labels.overview.metrics.installedSkills, getOverviewMetric(overview.developer.metrics, "Installed skills", "0")],
        [labels.overview.metrics.updateInbox, getOverviewMetric(overview.developer.metrics, "Update inbox", "0")]
      ],
      rows: overview.developer.updateInbox.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.event}: ${formatQueueValue(row.event, locale)}`,
        meta: `${labels.overview.queueLabels.severity}: ${formatQueueValue(row.severity, locale)}`,
        title: row.skill
      })),
      subtitle: labels.overview.roles.developer.subtitle,
      title: labels.overview.roles.developer.title
    },
    {
      empty: labels.overview.roles.publisher.empty,
      href: localizedHref("/publisher", locale),
      metrics: [
        [labels.overview.metrics.submittedVersions, getOverviewMetric(overview.publisher.metrics, "Submitted versions", "0")],
        [labels.overview.metrics.failedChecks, getOverviewMetric(overview.publisher.metrics, "Runtime checks failed", "0")],
        [labels.overview.metrics.paidPreview, locale === "zh" ? "预发布" : "Prelaunch"]
      ],
      rows: overview.publisher.reviewPipeline.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.stage}: ${formatQueueValue(row.stage, locale)}`,
        meta: `${labels.overview.queueLabels.next}: ${formatQueueValue(row.nextStep, locale)}`,
        title: row.skill
      })),
      subtitle: labels.overview.roles.publisher.subtitle,
      title: labels.overview.roles.publisher.title
    },
    {
      empty: labels.overview.roles.admin.empty,
      metrics: [
        [labels.overview.metrics.reviewQueue, locale === "zh" ? "后台门控" : "Admin gated"],
        [labels.overview.metrics.payoutGovernance, locale === "zh" ? "预发布" : "Prelaunch"],
        [labels.overview.metrics.notificationGovernance, locale === "zh" ? "后台门控" : "Admin gated"]
      ],
      rows: overview.admin.riskQueue.slice(0, 3).map((row) => ({
        detail: `${labels.overview.queueLabels.scope}: ${formatQueueValue(row.scope, locale)}`,
        meta: `${labels.overview.queueLabels.action}: ${formatQueueValue(row.action, locale)}`,
        title: formatQueueValue(row.signal, locale)
      })),
      subtitle: labels.overview.roles.admin.subtitle,
      title: labels.overview.roles.admin.title
    }
  ];

  return (
    <AppShell active="marketplace" locale={locale}>
      {/* Hero */}
      <section className="section" aria-labelledby="marketplace-heading">
        <div className="section-inner text-center flex flex-col items-center gap-6 py-20">
          <div className="eyebrow">
            <Store size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="marketplace-heading" className="heading-xl max-w-[800px]">{labels.title}</h1>
          <p className="body-text text-[#999] max-w-[640px]">{labels.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <a className="btn-primary--large" href="#catalog">
              <PackageSearch size={18} aria-hidden="true" />
              <span>{labels.primary}</span>
            </a>
            <a className="btn-secondary--large" href={localizedHref("/publishers", locale)}>
              <Building2 size={18} aria-hidden="true" />
              <span>{labels.directory}</span>
            </a>
            <a className="btn-text" href={localizedHref("/login", locale)}>
              <WalletCards size={17} aria-hidden="true" />
              <span>{labels.console}</span>
            </a>
          </div>
        </div>

        {/* Install console aside */}
        <aside className="section-inner max-w-[720px] mx-auto">
          <div className="card p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Terminal size={16} aria-hidden="true" />
              <span>{labels.consoleTitle}</span>
            </div>
            <p className="body-text-sm text-[#999]">{labels.consoleSubtitle}</p>
            <pre className="code-block">
              <code>{`curl "https://api.useskillhub.com/v1/skills/search?tag=research"
curl "https://api.useskillhub.com/v1/skills/browser-research"
# ${labels.mcpMetadataNote}
curl "https://api.useskillhub.com/mcp"`}</code>
            </pre>
            <div className="flex flex-wrap gap-3">
              {labels.proof.map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-[#10b981]">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <PublicAccessScope locale={locale} />

      {/* Metrics strip */}
      <section className="section" aria-label="Marketplace operating metrics">
        <div className="section-inner flex flex-wrap gap-4 py-6">
          {metrics.map(([label, value]) => (
            <div key={label} className="stat-card flex-1 min-w-[160px]">
              <span className="text-xs text-[#999]">{label}</span>
              <strong className="text-white text-lg font-semibold">{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <div id="catalog">
        <MarketplaceBrowser initialFilters={initialFilters} locale={locale} skills={skills} />
      </div>

      <JourneyRail currentStep="marketplace" journey="developer" locale={locale} />

      <OperatingEvidenceChain
        focus="marketplace"
        locale={locale}
        stats={[
          { label: labels.catalogMetric, value: String(publicStats.publicSkills) },
          { label: labels.publisherMetric, value: String(publicStats.publicPublishers) },
          { label: labels.loopMetrics.calls, value: formatCompactMetric(publicStats.recordedCalls, locale) },
          { label: labels.loopMetrics.submitted, tone: publicStats.submittedSkills > 0 ? "attention" : "neutral", value: String(publicStats.submittedSkills) }
        ]}
      />

      {/* Overview section */}
      <section className="section py-16" aria-labelledby="market-overview-heading">
        <div className="section-inner flex flex-col gap-10">
          <div className="flex flex-col gap-4 max-w-[800px]">
            <div className="eyebrow">
              <Gauge size={16} aria-hidden="true" />
              <span>{labels.overview.eyebrow}</span>
            </div>
            <h2 id="market-overview-heading" className="heading-lg">{labels.overview.title}</h2>
            <p className="body-text text-[#999]">{labels.overview.body}</p>
          </div>

          {/* Overview grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overviewCards.map((card, index) => {
              const Icon = overviewRoleIcons[index];

              return (
                <article key={card.title} className="card p-6 flex flex-col gap-5">
                  <header className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.06)]">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="heading-sm">{card.title}</h3>
                      <p className="body-text-sm text-[#666]">{card.subtitle}</p>
                    </div>
                  </header>

                  <div className="flex flex-wrap gap-4">
                    {card.metrics.map(([label, value]) => (
                      <div key={label} className="flex flex-col gap-1">
                        <span className="text-xs text-[#666]">{label}</span>
                        <strong className="text-sm text-white font-medium">{value}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    {card.rows.length > 0 ? (
                      card.rows.map((row) => (
                        <div key={`${card.title}-${row.title}-${row.detail}`} className="flex flex-col gap-0.5 py-2 border-t border-[rgba(255,255,255,0.06)]">
                          <strong className="text-sm text-white">{row.title}</strong>
                          <span className="text-xs text-[#666]">{row.detail}</span>
                          <small className="text-xs text-[#525252]">{row.meta}</small>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#525252] py-2">{card.empty}</div>
                    )}
                  </div>

                  {card.href ? (
                    <a className="btn-text mt-auto" href={card.href}>
                      <span>{card.title}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-[#525252] mt-auto">
                      <ShieldCheck size={14} aria-hidden="true" />
                      <span>{locale === "zh" ? "运营专用" : "Operator only"}</span>
                    </span>
                  )}
                </article>
              );
            })}
          </div>

          {/* Retention card */}
          <div className="card p-6 flex flex-col gap-4" aria-label={labels.overview.retentionTitle}>
            <strong className="heading-sm">{labels.overview.retentionTitle}</strong>
            <div className="flex flex-wrap gap-3">
              {[...labels.overview.retention.developer, ...labels.overview.retention.publisher].map((reason) => (
                <span key={reason} className="flex items-center gap-1.5 text-xs text-[#999]">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Publisher directory callout */}
      <section className="section py-10" aria-label={labels.publisherDirectoryTitle}>
        <div className="section-inner card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="eyebrow">
              <Building2 size={16} aria-hidden="true" />
              <span>{labels.publisherDirectoryTitle}</span>
            </div>
            <p className="body-text-sm text-[#999] max-w-[560px]">{labels.publisherDirectoryBody}</p>
          </div>
          <a className="btn-secondary flex items-center gap-2 whitespace-nowrap" href={localizedHref("/publishers", locale)}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{labels.publisherDirectoryCta}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Operating loop section */}
      <section className="section py-16" aria-labelledby="market-loop-heading">
        <div className="section-inner flex flex-col lg:flex-row gap-10">
          <div className="flex flex-col gap-6 flex-1">
            <div className="eyebrow">
              <Activity size={16} aria-hidden="true" />
              <span>{labels.loopEyebrow}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex flex-col gap-2 max-w-[560px]">
                <h2 id="market-loop-heading" className="heading-lg">{labels.loopTitle}</h2>
                <p className="body-text text-[#999]">{labels.loopBody}</p>
              </div>
              <span className="pill pill--success flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                {labels.reviewMetricValue}
              </span>
            </div>

            {/* Loop metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label={labels.loopEyebrow}>
              {loopMetrics.map(([label, value]) => (
                <div key={label} className="stat-card">
                  <span className="text-xs text-[#666]">{label}</span>
                  <strong className="text-white text-lg font-semibold">{value}</strong>
                </div>
              ))}
            </div>

            {/* Loop steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labels.loopSteps.map(([title, detail, meta], index) => {
                const Icon = loopStepIcons[index];

                return (
                  <article key={title} className="card--compact p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.06)]">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <small className="text-xs text-[#525252]">{meta}</small>
                    </div>
                    <strong className="text-sm text-white">{title}</strong>
                    <p className="body-text-sm text-[#666]">{detail}</p>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Loop ledger aside */}
          <aside className="card p-6 flex flex-col gap-5 lg:w-[360px]" aria-label={labels.loopLedgerTitle}>
            <div className="flex items-center justify-between">
              <div className="eyebrow">
                <CircleDollarSign size={16} aria-hidden="true" />
                <span>{labels.loopLedgerTitle}</span>
              </div>
              <span className="text-xs text-[#525252]">{labels.moneyMetricValue}</span>
            </div>
            <div className="flex flex-col gap-3">
              {labels.loopLedgerRows.map(([phase, signal, detail]) => (
                <div key={phase} className="flex flex-col gap-1 py-2 border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-xs text-[#525252]">{phase}</span>
                  <strong className="text-sm text-white">{signal}</strong>
                  <p className="body-text-sm text-[#666]">{detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Operations layout: Requests + Publish steps */}
      <section className="section py-10">
        <div className="section-inner grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="card p-6 flex flex-col gap-4">
            <div className="eyebrow">
              <ClipboardList size={16} aria-hidden="true" />
              <span>{labels.requests}</span>
            </div>
            <p className="body-text-sm text-[#666]">{labels.requestsBody}</p>
            <div className="flex flex-col gap-3">
              {marketplaceRequests.map((request) => (
                <div key={localizeText(request.title, locale)} className="flex items-center justify-between py-2 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="flex flex-col gap-0.5">
                    <strong className="text-sm text-white flex items-center gap-2">
                      {localizeText(request.title, locale)}
                      {request.state === "example" ? (
                        <span className="pill pill--neutral text-[10px]">{labels.requestTag}</span>
                      ) : null}
                    </strong>
                    <span className="text-xs text-[#525252]">
                      {request.state === "example"
                        ? `${labels.requestState}: ${localizeText(request.status, locale)}`
                        : localizeText(request.status, locale)}
                      {" | "}
                      {localizeText(request.due, locale)}
                    </span>
                  </div>
                  <b className="flex flex-col items-end text-sm text-white">
                    <small className="text-[10px] text-[#525252] font-normal">{labels.requestBudget}</small>
                    {request.bounty}
                  </b>
                </div>
              ))}
            </div>
          </article>

          <article className="card p-6 flex flex-col gap-4">
            <div className="eyebrow">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.publishTitle}</span>
            </div>
            <div className="flex flex-col gap-2">
              {labels.publishSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm text-white">
                  <span className="text-xs text-[#525252] font-mono">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="font-medium">{step}</strong>
                  {index < labels.publishSteps.length - 1 && <ArrowRight size={14} aria-hidden="true" className="text-[#525252]" />}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Trust + Money bottom row */}
      <section className="section py-10">
        <div className="section-inner grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="card p-6 flex flex-col gap-4">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.trustTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labels.trustItems.map(([title, detail]) => (
                <div key={title} className="flex flex-col gap-1">
                  <strong className="text-sm text-white">{title}</strong>
                  <span className="text-xs text-[#666]">{detail}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="card p-6 flex flex-col gap-4">
            <div className="eyebrow">
              <HandCoins size={16} aria-hidden="true" />
              <span>{labels.moneyTitle}</span>
            </div>
            <div className="flex flex-col gap-2">
              {labels.moneyRows.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5 py-2 border-t border-[rgba(255,255,255,0.06)]">
                  <span className="text-xs text-[#525252]">{label}</span>
                  <strong className="text-sm text-white">{value}</strong>
                </div>
              ))}
            </div>
            <a className="btn-text" href={localizedHref("/docs", locale)}>
              <Code2 size={16} aria-hidden="true" />
              <span>{dictionary.nav.docs}</span>
            </a>
          </aside>
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
    verificationStatus: parseMarketplaceVerification(filters.verification)
  };
}

function parseMarketplaceQuery(value: string | undefined) {
  const query = String(value ?? "").trim().slice(0, 120);
  return query.length > 0 ? query : undefined;
}

function parseMarketplaceCategory(
  value: string | undefined,
): PublicMarketplaceSearchOptions["category"] {
  if (
    value === "data" ||
    value === "ops" ||
    value === "research" ||
    value === "sales" ||
    value === "security" ||
    value === "support"
  ) {
    return value;
  }

  return undefined;
}

function parseMarketplaceBilling(
  value: string | undefined,
): PublicMarketplaceSearchOptions["billingModel"] {
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
  const normalized = String(value ?? "").trim().toLowerCase();

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
  if (value === "adoption" || value === "recommended" || value === "recent" || value === "success") {
    return value;
  }

  if (value === "lowRisk" || value === "low-risk" || value === "low_risk") {
    return "low_risk";
  }

  return undefined;
}
