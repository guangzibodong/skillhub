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
import { JourneyRail } from "@/components/journey-rail";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { SiteHeader } from "@/components/site-header";
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
    console: "Publisher workspace",
    consoleTitle: "Public inspect path",
    consoleSubtitle: "Agents should start from a contract they can inspect before project-gated install or runtime use.",
    proof: ["Searchable catalog", "Permission review", "API inspect", "Project-gated runtime"],
    requests: "Example skill requests - not live data",
    requestsBody: "These are example demand scenarios for the future paid marketplace. Live buyer requests stay empty until real users submit them.",
    publishTitle: "Publisher operating flow",
    publishSteps: ["Draft manifest", "Runtime checks", "Human review", "Pricing blockers", "Public listing", "Future ledger model", "Manual payout review"],
    trustTitle: "Launch requirements",
    trustItems: [
      ["Manifest", "Typed input/output, runtime, permissions, version, author."],
      ["Security", "Permission classification, runtime checks, secret handling, data retention."],
      ["Money", "Versioned commission rule, immutable transaction split, payout audit trail."],
      ["Support", "Changelog, deprecation policy, issue channel, response expectations."]
    ],
    moneyTitle: "Future paid marketplace model",
    moneyRows: [
      ["Current stage", "Developer Preview catalog; payment capture is prelaunch"],
      ["Manual payout path", "Publishers leave PayPal/Alipay details for finance review"],
      ["Future ledger rule", "Billable usage will post transactions before balance review"],
      ["Operator control", "Finance records manual transfer evidence before marking paid"]
    ],
    overview: {
      eyebrow: "Architecture preview",
      title: "The catalog is tied to buyer, publisher, and operator state without claiming paid launch.",
      body:
        "These preview signals come from the platform overview API. They explain the discovery-to-runtime architecture while paid marketplace operations remain prelaunch.",
      metrics: {
        activeSubscriptions: "Active subscriptions",
        availableBalance: "Available balance",
        failedChecks: "Failed checks",
        installedSkills: "Installed skills",
        openBuyerRequests: "Buyer requests",
        payoutReview: "Manual payout review",
        projects: "Projects",
        queuedNotifications: "Queued notifications",
        reviewQueue: "Review queue",
        savedSkills: "Saved skills",
        submittedVersions: "Submitted versions",
        updateInbox: "Update inbox"
      },
      roles: {
        admin: {
          empty: "No active risk signals.",
          subtitle: "Review, manual payout, notification, and incident queues protect launch readiness.",
          title: "Platform operators"
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
          "Approve and update installed skills per project.",
          "Watch cost, failures, latency, incidents, and budget state.",
          "Compare better verified alternatives as the catalog grows."
        ],
        publisher: [
          "Repair review and runtime issues before losing distribution.",
          "Turn buyer requests and feedback into improved versions.",
          "Prepare paid-readiness and manual payout details before real paid usage launches."
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
      "Every marketplace card links to the supplier behind the skill. The public directory lets teams compare profile state, verified listings, public review status, install evidence, and runtime evidence before installing.",
    publisherDirectoryCta: "Browse publishers",
    loopEyebrow: "Installed skill operations",
    loopTitle: "The marketplace keeps a live path after install.",
    loopBody:
      "A useful skill registry is not finished when an agent copies a command. Verified skills can move into project policy and runtime evidence; submitted skills stay inspection-only until review passes.",
    loopSteps: [
      ["Inspect", "Manifest, permissions, runtime, price, and publisher profile are visible before install.", "Public contract"],
      ["Install", "Teams attach the skill to a project key or MCP server with explicit policy context.", "Project gate"],
      ["Invoke", "Verified runtime calls carry typed input, project policy checks, success signals, and reviewable output.", "Runtime evidence"],
      ["Return", "Feedback, incidents, changelog updates, and paid-readiness blockers create the next publisher action.", "Retention loop"]
    ],
    loopMetrics: {
      callable: "Callable skills",
      calls: "Recorded calls",
      feedback: "Feedback signals",
      payout: "Paid-readiness publishers"
    },
    loopLedgerTitle: "What teams can revisit",
    loopLedgerRows: [
      ["Buyer view", "Install trail", "Command, permission profile, pricing model, and project policy stay inspectable."],
      ["Agent view", "Runtime proof", "The agent can validate schema, latency, and success history before repeated calls."],
      ["Publisher view", "Action queue", "Reviews, incidents, usage, and changelog pressure feed the next version."],
      ["Finance view", "Manual payout audit", "Future paid usage reaches ledger review before finance records manual transfer evidence."]
    ]
  },
  zh: {
    eyebrow: "智能体技能市场",
    title: "搜索、查看，并准备受治理的智能体技能。",
    description:
      "开发者预览版：现在可以搜索公开技能、查看权限，并使用注册表/网关发现能力。付费市场、支付扣款和自动提现仍处于预发布阶段。",
    primary: "浏览目录",
    directory: "发布者目录",
    console: "发布者工作台",
    consoleTitle: "公开查看路径",
    consoleSubtitle: "智能体应先查看可检查的协议，再进入项目门控的安装或运行。",
    proof: ["可搜索目录", "权限审核", "API 查看", "项目门控运行"],
    requests: "示例技能需求 - 非实时数据",
    requestsBody: "这些是未来付费市场的示例需求场景。真实买方需求会在用户提交后才出现，生产数据为空时保持为空。",
    publishTitle: "发布者运营流程",
    publishSteps: ["草稿 manifest", "运行测试", "人工审核", "价格批准", "公开上架", "用量账本", "提现审核"],
    trustTitle: "上线要求",
    trustItems: [
      ["Manifest", "类型化输入输出、运行时、权限、版本、作者。"],
      ["安全", "权限分类、运行检查、密钥处理、数据保留。"],
      ["资金", "版本化佣金规则、不可变分账交易、提现审计链路。"],
      ["支持", "更新记录、弃用政策、问题通道、响应预期。"]
    ],
    moneyTitle: "未来付费市场模型",
    moneyRows: [
      ["当前阶段", "开发者预览目录；支付扣款仍处于预发布"],
      ["人工打款路径", "发布者留下 PayPal/Alipay 信息，财务人工复核"],
      ["未来账本规则", "可计费使用会先形成交易，再进入余额复核"],
      ["运营控制", "财务记录人工转账凭证后才标记已支付"]
    ],
    overview: {
      eyebrow: "架构预览",
      title: "目录已连接买家、发布者和运营状态，但不宣称付费市场已上线。",
      body:
        "这些预览信号来自 platform overview API，用来解释从发现到运行的架构；付费市场运营仍处于预发布阶段。",
      metrics: {
        activeSubscriptions: "活跃订阅",
        availableBalance: "可用余额",
        failedChecks: "失败检查",
        installedSkills: "已安装技能",
        openBuyerRequests: "买方需求",
        payoutReview: "人工提现审核",
        projects: "项目",
        queuedNotifications: "排队通知",
        reviewQueue: "审核队列",
        savedSkills: "收藏技能",
        submittedVersions: "提交版本",
        updateInbox: "更新收件箱"
      },
      roles: {
        admin: {
          empty: "暂无活跃风险信号。",
          subtitle: "审核、人工打款、通知和事故队列用于保护上线准备。",
          title: "平台运营"
        },
        developer: {
          empty: "暂无已安装技能更新。",
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
          "按项目批准和更新已安装技能。",
          "观察成本、失败率、延迟、事故和预算状态。",
          "随着目录增长，比较更好的已验证替代方案。"
        ],
        publisher: [
          "在失去分发前修复审核和运行问题。",
          "把买方需求和反馈转成改进版本。",
          "在真实付费使用上线前准备付费门槛和人工打款信息。"
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
      "每张市场技能卡都会连接到背后的发布者。公开目录让团队在安装前比较资料状态、已验证上架、公开审核状态、安装证据和运行证据。",
    publisherDirectoryCta: "浏览发布者",
    loopEyebrow: "已安装技能运营",
    loopTitle: "市场在安装后仍然保留一条实时路径。",
    loopBody:
      "有用的技能库不止于复制一条命令。已验证技能可以进入项目策略和运行证据；已提交但未验证的技能只能公开查看，不能安装或测试运行。",
    loopSteps: [
      ["检查", "安装前可以看到 manifest、权限、运行时、价格和发布者档案。", "公共合约"],
      ["安装", "团队把技能挂到项目 key 或 MCP server，并带上明确策略上下文。", "项目关卡"],
      ["调用", "已验证运行调用携带类型化输入、项目策略检查、成功信号和可复核输出。", "运行证据"],
      ["回访", "反馈、事故、更新记录和付费准备阻断项会形成下一次发布者行动。", "留存闭环"]
    ],
    loopMetrics: {
      callable: "可调用技能",
      calls: "已记录调用",
      feedback: "反馈信号",
      payout: "付费准备发布者"
    },
    loopLedgerTitle: "团队可回访的信息",
    loopLedgerRows: [
      ["买家视角", "安装轨迹", "命令、权限画像、价格模型和项目策略都保持可检查。"],
      ["Agent 视角", "运行证据", "Agent 可在重复调用前校验 schema、延迟和成功历史。"],
      ["发布者视角", "行动队列", "评价、事故、用量和更新压力会进入下一版本。"],
      ["财务视角", "人工提现审计", "未来付费用量先进入账本审核，再由财务记录人工转账凭证。"]
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
    "Hold for finance transfer review": "暂停并做财务打款复核",
    "Improve listing quality": "提升上架质量",
    "Medium risk approved": "中风险已批准",
    "Owner approval required": "需要负责人批准",
    "Pricing approval": "价格批准",
    "Require owner approval": "要求负责人批准",
    "Restricted launch": "受限上线",
    "Review CRM token scope": "审核 CRM token 范围",
    "Runtime error spike": "运行错误激增",
    "Submit for review": "提交审核",
    "Throttle and notify publisher": "限流并通知发布者",
    "Unusual payout request": "异常提现请求",
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
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
    [labels.loopMetrics.payout, `${publicStats.payoutReadyPublishers}/${publicStats.publicPublishers}`]
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
        [labels.overview.metrics.availableBalance, getOverviewMetric(overview.publisher.metrics, "Available balance", "$0")]
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
        [labels.overview.metrics.reviewQueue, getOverviewMetric(overview.admin.metrics, "Review queue", "0")],
        [labels.overview.metrics.payoutReview, getOverviewMetric(overview.admin.metrics, "Payout review", "0")],
        [labels.overview.metrics.queuedNotifications, getOverviewMetric(overview.admin.metrics, "Queued notifications", "0")]
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
    <main className="product-shell">
      <SiteHeader active="marketplace" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/marketplace" />

      <section className="market-hero" aria-labelledby="marketplace-heading">
        <div className="market-hero__copy">
          <div className="eyebrow">
            <Store size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="marketplace-heading">{labels.title}</h1>
          <p>{labels.description}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href="#catalog">
              <PackageSearch size={18} aria-hidden="true" />
              <span>{labels.primary}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/publishers", locale)}>
              <Building2 size={18} aria-hidden="true" />
              <span>{labels.directory}</span>
            </a>
            <a className="ghost-button" href={localizedHref("/publisher", locale)}>
              <WalletCards size={17} aria-hidden="true" />
              <span>{labels.console}</span>
            </a>
          </div>
        </div>

        <aside className="install-console">
          <div className="install-console__bar">
            <Terminal size={16} aria-hidden="true" />
            <span>{labels.consoleTitle}</span>
          </div>
          <p>{labels.consoleSubtitle}</p>
          <pre>
            <code>{`curl "https://api.useskillhub.com/v1/skills/search?tag=research"
curl "https://api.useskillhub.com/v1/skills/browser-research"
curl "https://api.useskillhub.com/mcp"`}</code>
          </pre>
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

      <JourneyRail currentStep="marketplace" journey="developer" locale={locale} />

      <section className="marketplace-ops-strip" aria-label="Marketplace operating metrics">
        {metrics.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div id="catalog">
        <MarketplaceBrowser initialFilters={initialFilters} locale={locale} skills={skills} />
      </div>

      <OperatingEvidenceChain
        focus="marketplace"
        locale={locale}
        stats={[
          { label: labels.catalogMetric, value: String(publicStats.publicSkills) },
          { label: labels.publisherMetric, value: String(publicStats.publicPublishers) },
          { label: labels.loopMetrics.calls, value: formatCompactMetric(publicStats.recordedCalls, locale) },
          { label: labels.loopMetrics.payout, tone: publicStats.payoutReadyPublishers > 0 ? "good" : "attention", value: `${publicStats.payoutReadyPublishers}/${publicStats.publicPublishers}` }
        ]}
      />

      <section className="market-overview-section" aria-labelledby="market-overview-heading">
        <div className="market-overview-head">
          <div>
            <div className="card-kicker">
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
              <article className="market-overview-card" key={card.title}>
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
                      <div className="market-overview-row" key={`${card.title}-${row.title}-${row.detail}`}>
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
                  <a className="ghost-button ghost-button--inline" href={card.href}>
                    <span>{card.title}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="market-overview-card__operator-only">
                    <ShieldCheck size={14} aria-hidden="true" />
                    <span>{locale === "zh" ? "\u8fd0\u8425\u4e13\u7528" : "Operator only"}</span>
                  </span>
                )}
              </article>
            );
          })}
        </div>

        <div className="market-retention-card" aria-label={labels.overview.retentionTitle}>
          <strong>{labels.overview.retentionTitle}</strong>
          <div>
            {[...labels.overview.retention.developer, ...labels.overview.retention.publisher].map((reason) => (
              <span key={reason}>
                <BadgeCheck size={14} aria-hidden="true" />
                {reason}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="market-publisher-callout" aria-label={labels.publisherDirectoryTitle}>
        <div>
          <div className="card-kicker">
            <Building2 size={16} aria-hidden="true" />
            <span>{labels.publisherDirectoryTitle}</span>
          </div>
          <p>{labels.publisherDirectoryBody}</p>
        </div>
        <a className="secondary-button secondary-button--compact" href={localizedHref("/publishers", locale)}>
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{labels.publisherDirectoryCta}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </section>

      <section className="market-operating-loop" aria-labelledby="market-loop-heading">
        <div className="market-loop-copy">
          <div className="card-kicker">
            <Activity size={16} aria-hidden="true" />
            <span>{labels.loopEyebrow}</span>
          </div>
          <div className="market-loop-copy__head">
            <div>
              <h2 id="market-loop-heading">{labels.loopTitle}</h2>
              <p>{labels.loopBody}</p>
            </div>
            <span className="market-loop-live">
              <span />
              {labels.reviewMetricValue}
            </span>
          </div>

          <div className="market-loop-metric-grid" aria-label={labels.loopEyebrow}>
            {loopMetrics.map(([label, value]) => (
              <div className="market-loop-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="market-loop-steps">
            {labels.loopSteps.map(([title, detail, meta], index) => {
              const Icon = loopStepIcons[index];

              return (
                <article className="market-loop-step" key={title}>
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

        <aside className="market-loop-ledger" aria-label={labels.loopLedgerTitle}>
          <div className="market-loop-ledger__head">
            <div className="card-kicker">
              <CircleDollarSign size={16} aria-hidden="true" />
              <span>{labels.loopLedgerTitle}</span>
            </div>
            <span>{labels.moneyMetricValue}</span>
          </div>
          <div className="market-loop-log">
            {labels.loopLedgerRows.map(([phase, signal, detail]) => (
              <div className="market-loop-log-row" key={phase}>
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

      <section className="market-operations-layout">
        <article className="market-ops-panel">
          <div className="card-kicker">
            <ClipboardList size={16} aria-hidden="true" />
            <span>{labels.requests}</span>
          </div>
          <p>{labels.requestsBody}</p>
          <div className="request-board">
            {marketplaceRequests.map((request) => (
              <div className="request-row" key={localizeText(request.title, locale)}>
                <div>
                  <strong>{localizeText(request.title, locale)}</strong>
                  <span>
                    {localizeText(request.status, locale)} | {localizeText(request.due, locale)}
                  </span>
                </div>
                <b>{request.bounty}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="market-ops-panel">
          <div className="card-kicker">
            <BookOpenCheck size={16} aria-hidden="true" />
            <span>{labels.publishTitle}</span>
          </div>
          <div className="publish-flow-list">
            {labels.publishSteps.map((step, index) => (
              <div className="publish-flow-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
                {index < labels.publishSteps.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="market-operations-layout market-operations-layout--bottom">
        <article className="market-ops-panel">
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.trustTitle}</span>
          </div>
          <div className="trust-requirement-grid">
            {labels.trustItems.map(([title, detail]) => (
              <div className="trust-requirement" key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="market-ops-panel">
          <div className="card-kicker">
            <HandCoins size={16} aria-hidden="true" />
            <span>{labels.moneyTitle}</span>
          </div>
          <div className="commission-list">
            {labels.moneyRows.map(([label, value]) => (
              <div className="commission-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <a className="ghost-button ghost-button--inline" href={localizedHref("/docs", locale)}>
            <Code2 size={16} aria-hidden="true" />
            <span>{dictionary.nav.docs}</span>
          </a>
        </aside>
      </section>
    </main>
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
