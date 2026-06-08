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
    eyebrow: "Agent skill marketplace",
    title: "Find, install, review, and monetize agent skills.",
    description:
      "SkillHub is becoming the operating layer for agent capabilities: searchable skills, explicit permissions, install commands, usage metering, review queues, pricing, and payout operations.",
    primary: "Browse catalog",
    directory: "Publisher directory",
    console: "Publisher workspace",
    consoleTitle: "Live install path",
    consoleSubtitle: "Agents should install from a contract they can inspect.",
    proof: ["Searchable catalog", "Permission review", "Install command", "Billing-ready usage"],
    requests: "Requested skills",
    requestsBody: "Buyers can request missing skills. Publishers can claim specs, submit builds, and earn bounties or recurring revenue.",
    publishTitle: "Publisher operating flow",
    publishSteps: ["Draft manifest", "Runtime test", "Human review", "Pricing approval", "Public listing", "Usage ledger", "Payout review"],
    trustTitle: "Launch requirements",
    trustItems: [
      ["Manifest", "Typed input/output, runtime, permissions, version, author."],
      ["Security", "Permission classification, runtime checks, secret handling, data retention."],
      ["Money", "Versioned commission rule, immutable transaction split, payout audit trail."],
      ["Support", "Changelog, deprecation policy, issue channel, response expectations."]
    ],
    moneyTitle: "Commission and payout model",
    moneyRows: [
      ["Default split", "20% platform / 80% publisher"],
      ["Payout delay", "Funds mature after refund and fraud window"],
      ["Review threshold", "Manual review above configured amount"],
      ["Ledger rule", "Usage logs never pay out directly"]
    ],
    overview: {
      eyebrow: "Operating overview",
      title: "The marketplace already has separate loops for buyers, publishers, and operators.",
      body:
        "These signals come from the platform overview API, so the public marketplace can show the working surfaces behind discovery instead of only presenting a catalog.",
      metrics: {
        activeSubscriptions: "Active subscriptions",
        availableBalance: "Available balance",
        failedChecks: "Failed checks",
        installedSkills: "Installed skills",
        openBuyerRequests: "Buyer requests",
        payoutReview: "Payout review",
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
          subtitle: "Review, money, notification, and incident queues protect the marketplace.",
          title: "Platform operators"
        },
        developer: {
          empty: "No installed-skill updates.",
          subtitle: "Projects return for policies, version changes, budgets, keys, and runtime evidence.",
          title: "Developers"
        },
        publisher: {
          empty: "No publisher actions.",
          subtitle: "Authors return for review feedback, runtime checks, demand, revenue, and payout readiness.",
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
          "Turn buyer requests and feedback into new paid versions.",
          "Track ledger state and payout readiness after usage lands."
        ]
      }
    },
    catalogMetric: "Live catalog",
    publisherMetric: "Public publishers",
    verifiedPublisherMetric: "Verified publishers",
    reviewMetric: "Review gates",
    reviewMetricValue: "Schema + Runtime + Human",
    moneyMetric: "Money flow",
    moneyMetricValue: "Ledger before payout",
    publisherDirectoryTitle: "Supplier trust is part of discovery",
    publisherDirectoryBody:
      "Every marketplace card now links to the supplier behind the skill. The public directory lets teams compare verified listings, payout readiness, runtime evidence, and active paid inventory before installing.",
    publisherDirectoryCta: "Browse publishers",
    loopEyebrow: "Installed skill operations",
    loopTitle: "The marketplace keeps a live path after install.",
    loopBody:
      "A useful skill store is not finished when an agent copies a command. Buyers need runtime evidence and spend controls; publishers need feedback, changelog pressure, and payout-ready usage records.",
    loopSteps: [
      ["Inspect", "Manifest, permissions, runtime, price, and publisher profile are visible before install.", "Public contract"],
      ["Install", "Teams attach the skill to a project key or MCP server with explicit policy context.", "Project gate"],
      ["Invoke", "Runtime calls carry typed input, budget checks, success signals, and reviewable output.", "Usage ledger"],
      ["Return", "Feedback, incidents, changelog updates, and payout review create the next publisher action.", "Retention loop"]
    ],
    loopMetrics: {
      callable: "Callable skills",
      calls: "Recorded calls",
      feedback: "Feedback signals",
      payout: "Payout-ready publishers"
    },
    loopLedgerTitle: "What teams can revisit",
    loopLedgerRows: [
      ["Buyer view", "Install trail", "Command, permission profile, pricing model, and project policy stay inspectable."],
      ["Agent view", "Runtime proof", "The agent can validate schema, latency, and success history before repeated calls."],
      ["Publisher view", "Action queue", "Reviews, incidents, usage, and changelog pressure feed the next version."],
      ["Finance view", "Payout audit", "Paid usage reaches ledger review before publisher payout."]
    ]
  },
  zh: {
    eyebrow: "智能体技能市场",
    title: "搜索、安装、审核并变现智能体技能。",
    description:
      "SkillHub 要成为智能体能力的运营层：可搜索技能、明确权限、安装命令、用量计量、审核队列、价格体系和提现运营。",
    primary: "浏览目录",
    directory: "发布者目录",
    console: "发布者工作台",
    consoleTitle: "实时安装路径",
    consoleSubtitle: "智能体应该从可检查的协议里安装技能。",
    proof: ["可搜索目录", "权限审核", "安装命令", "可计费用量"],
    requests: "技能需求池",
    requestsBody: "购买方可以发布缺失技能需求；发布者可以认领规格、提交构建，并获得赏金或持续收入。",
    publishTitle: "发布者运营流程",
    publishSteps: ["草稿 manifest", "运行测试", "人工审核", "价格批准", "公开上架", "用量账本", "提现审核"],
    trustTitle: "上线要求",
    trustItems: [
      ["Manifest", "类型化输入输出、运行时、权限、版本、作者。"],
      ["安全", "权限分类、运行检查、密钥处理、数据保留。"],
      ["资金", "版本化佣金规则、不可变分账交易、提现审计链路。"],
      ["支持", "更新记录、弃用政策、问题通道、响应预期。"]
    ],
    moneyTitle: "分佣和提现模型",
    moneyRows: [
      ["默认分账", "20% 平台 / 80% 发布者"],
      ["提现延迟", "资金经过退款和风控窗口后成熟"],
      ["审核阈值", "超过配置金额进入人工审核"],
      ["账本规则", "绝不直接从用量日志打款"]
    ],
    overview: {
      eyebrow: "运营总览",
      title: "市场已经拆出了买家、发布者、平台运营三条回访闭环。",
      body:
        "这些信号来自 platform overview API，所以市场页展示的不只是目录，而是目录背后的真实工作台、队列和运营状态。",
      metrics: {
        activeSubscriptions: "活跃订阅",
        availableBalance: "可用余额",
        failedChecks: "失败检查",
        installedSkills: "已安装技能",
        openBuyerRequests: "买方需求",
        payoutReview: "提现审核",
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
          subtitle: "审核、资金、通知和事故队列保护整个市场。",
          title: "平台运营"
        },
        developer: {
          empty: "暂无已安装技能更新。",
          subtitle: "项目会为了策略、版本变化、预算、Key 和运行证据回到平台。",
          title: "开发者"
        },
        publisher: {
          empty: "暂无发布者行动。",
          subtitle: "作者会为了审核反馈、运行检查、需求、收入和提现准备回到平台。",
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
          "把买方需求和反馈转成新的付费版本。",
          "用量入账后持续跟踪账本和提现准备。"
        ]
      }
    },
    catalogMetric: "实时目录",
    publisherMetric: "公开发布者",
    verifiedPublisherMetric: "已验证发布者",
    reviewMetric: "审核关卡",
    reviewMetricValue: "Schema / 运行时 / 人审",
    moneyMetric: "资金流",
    moneyMetricValue: "先入账本再提现",
    publisherDirectoryTitle: "供应方信任也是发现的一部分",
    publisherDirectoryBody:
      "每张市场技能卡现在都会连接到背后的发布者。公开目录让团队在安装前比较已验证上架、提现准备、运行证据和活跃付费技能。",
    publisherDirectoryCta: "浏览发布者",
    loopEyebrow: "已安装技能运营",
    loopTitle: "市场在安装后仍然保留一条实时路径。",
    loopBody:
      "有用的技能市场不止于复制一条命令。买家需要运行证据和预算控制；发布者需要反馈、更新压力和可进入提现审核的用量记录。",
    loopSteps: [
      ["检查", "安装前可以看到 manifest、权限、运行时、价格和发布者档案。", "公共合约"],
      ["安装", "团队把技能挂到项目 key 或 MCP server，并带上明确策略上下文。", "项目关卡"],
      ["调用", "运行时调用携带类型化输入、预算检查、成功信号和可复核输出。", "用量账本"],
      ["回访", "反馈、事故、更新记录和提现审核会形成下一次发布者行动。", "留存闭环"]
    ],
    loopMetrics: {
      callable: "可调用技能",
      calls: "已记录调用",
      feedback: "反馈信号",
      payout: "提现就绪发布者"
    },
    loopLedgerTitle: "团队可回访的信息",
    loopLedgerRows: [
      ["买家视角", "安装轨迹", "命令、权限画像、价格模型和项目策略都保持可检查。"],
      ["Agent 视角", "运行证据", "Agent 可在重复调用前校验 schema、延迟和成功历史。"],
      ["发布者视角", "行动队列", "评价、事故、用量和更新压力会进入下一版本。"],
      ["财务视角", "提现审计", "付费用量先进入账本审核，再进入发布者提现。"]
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
  const verifiedPublisherCount = publishers.filter((publisher) => publisher.trustLevel === "verified").length;
  const payoutReadyPublisherCount = publishers.filter((publisher) => publisher.payoutStatus === "verified").length;
  const totalCallCount = publishers.reduce((sum, publisher) => sum + publisher.metrics.callCount, 0);
  const feedbackCount = skills.reduce((sum, skill) => sum + (skill.feedbackCount ?? 0), 0);
  const metrics = [
    [labels.catalogMetric, String(skills.length)],
    [labels.publisherMetric, String(publishers.length)],
    [labels.verifiedPublisherMetric, String(verifiedPublisherCount)],
    [labels.reviewMetric, labels.reviewMetricValue],
    [labels.moneyMetric, labels.moneyMetricValue]
  ];
  const loopMetrics = [
    [labels.loopMetrics.callable, String(skills.length)],
    [labels.loopMetrics.calls, formatCompactMetric(totalCallCount, locale)],
    [labels.loopMetrics.feedback, formatCompactMetric(feedbackCount, locale)],
    [labels.loopMetrics.payout, `${payoutReadyPublisherCount}/${publishers.length}`]
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
      href: localizedHref("/admin", locale),
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
            <code>{`skillhub search "browser research"
skillhub inspect browser-research
skillhub install browser-research`}</code>
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

      <OperatingEvidenceChain
        focus="marketplace"
        locale={locale}
        stats={[
          { label: labels.catalogMetric, value: String(skills.length) },
          { label: labels.publisherMetric, value: String(publishers.length) },
          { label: labels.loopMetrics.calls, value: formatCompactMetric(totalCallCount, locale) },
          { label: labels.loopMetrics.payout, tone: payoutReadyPublisherCount > 0 ? "good" : "attention", value: `${payoutReadyPublisherCount}/${publishers.length}` }
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

                <a className="ghost-button ghost-button--inline" href={card.href}>
                  <span>{card.title}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
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

      <div id="catalog">
        <MarketplaceBrowser initialFilters={initialFilters} locale={locale} skills={skills} />
      </div>

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
