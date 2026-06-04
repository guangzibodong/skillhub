import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileClock,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  RadioTower,
  RotateCcw,
  ShieldAlert,
  WalletCards
} from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { OrganizationBillingManager } from "@/components/organization-billing-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  formatPercent,
  getDeveloperBuyerRequests,
  getDeveloperProjects,
  getNotificationPreferences,
  getOrganizationBillingSummary,
  getPublisherAccountSummary,
  getPublisherBuyerRequests,
  getPublisherDisputes,
  getPublisherFinanceLedger,
  getPublisherPayoutSummary,
  getPublisherRefunds,
  getPublisherSkills
} from "@/lib/ops-data";
import { getOverviewMetric, getPlatformOverview } from "@/lib/platform-overview";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherIcons = [PackageCheck, CircleDollarSign, BarChart3] as const;
const buyerIcons = [BriefcaseBusiness, CreditCard, Activity] as const;

const opsCopy = {
  en: {
    pipelineTitle: "Publishing pipeline",
    pipelineHeaders: ["Skill", "Stage", "Signals", "Next step"],
    pipelineRows: [
      ["browser-research-pro", "Pricing approval", "Mira", "Confirm per-call cap"],
      ["crm-enrichment", "Data policy", "Nolan", "Review CRM token scope"],
      ["codebase-risk-scanner", "Restricted launch", "Asha", "Owner approval required"]
    ],
    projectTitle: "Buyer project controls",
    projectHeaders: ["Project", "Budget", "Keys", "Policy"],
    projectRows: [
      ["Research Agent", "$480 / mo", "2 active", "Medium risk approved"],
      ["Support Agent", "$120 / mo", "1 rotating", "Free skills only"],
      ["Finance Ops", "$900 / mo", "3 active", "Manual approval above $50"]
    ],
    apiTitle: "Runtime operations",
    apiRows: [
      ["Rate limits", "Project-scoped keys with monthly budgets"],
      ["Version pinning", "Agents can pin exact skill versions before execution"],
      ["Webhook events", "Skill review, billing, payout, and runtime incident events"]
    ],
    adjustmentTitle: "Revenue adjustments",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentEmpty: "No recent refund or dispute activity",
    buyerRequestTitle: "Buyer request board",
    buyerRequestHeaders: ["Request", "Category", "Bounty", "Status", "Next"],
    buyerRequestEmpty: "No open or claimed buyer requests"
  },
  zh: {
    pipelineTitle: "发布流水线",
    pipelineHeaders: ["技能", "阶段", "信号", "下一步"],
    pipelineRows: [
      ["browser-research-pro", "价格批准", "Mira", "确认按次调用上限"],
      ["crm-enrichment", "数据政策", "Nolan", "审核 CRM token 范围"],
      ["codebase-risk-scanner", "受限上线", "Asha", "需要 owner 批准"]
    ],
    projectTitle: "购买方项目控制",
    projectHeaders: ["项目", "预算", "Key", "策略"],
    projectRows: [
      ["Research Agent", "$480 / 月", "2 个活跃", "已批准中风险技能"],
      ["Support Agent", "$120 / 月", "1 个轮换中", "仅允许免费技能"],
      ["Finance Ops", "$900 / 月", "3 个活跃", "$50 以上人工批准"]
    ],
    apiTitle: "运行时运营",
    apiRows: [
      ["速率限制", "项目级 API Key 和月度预算"],
      ["版本固定", "智能体执行前可固定具体技能版本"],
      ["Webhook 事件", "技能审核、计费、提现和运行事故事件"]
    ],
    adjustmentTitle: "收入调整",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentEmpty: "暂无退款或争议记录",
    buyerRequestTitle: "买方需求池",
    buyerRequestHeaders: ["需求", "分类", "赏金", "状态", "下一步"],
    buyerRequestEmpty: "暂无开放或已认领需求"
  }
} as const;

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.dashboardPage;
  const ops = opsCopy[locale];
  const [
    overview,
    financeLedger,
    payoutSummary,
    publisherAccount,
    publisherSkills,
    publisherBuyerRequests,
    developerBuyerRequests,
    developerProjects,
    publisherRefunds,
    publisherDisputes,
    organizationBilling,
    notificationPreferences
  ] = await Promise.all([
    getPlatformOverview(),
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
    getPublisherAccountSummary(),
    getPublisherSkills(),
    getPublisherBuyerRequests(),
    getDeveloperBuyerRequests(),
    getDeveloperProjects(),
    getPublisherRefunds(),
    getPublisherDisputes(),
    getOrganizationBillingSummary(),
    getNotificationPreferences()
  ]);
  const ledgerRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 5).map((transaction) => [
          transaction.skillName ?? transaction.skillSlug ?? transaction.id,
          formatMoney(transaction.grossCents, transaction.currency),
          formatMoney(transaction.platformFeeCents, transaction.currency),
          formatMoney(transaction.publisherShareCents, transaction.currency),
          transaction.balanceState ?? transaction.status
        ])
      : labels.ledgerRows;
  const visibleMetrics = [
    [labels.metrics[0][0], formatMoney(financeLedger.summary.availableBalanceCents)],
    [labels.metrics[1][0], formatMoney(financeLedger.summary.pendingBalanceCents)],
    [labels.metrics[2][0], getOverviewMetric(overview.platform.metrics, "API calls", labels.metrics[2][1])],
    [labels.metrics[3][0], getOverviewMetric(overview.developer.metrics, "Active subscriptions", labels.metrics[3][1])]
  ];
  const payoutAccount = publisherAccount.payoutAccounts[0] ?? payoutSummary.payoutAccounts[0];
  const latestOnboarding = publisherAccount.onboardingSessions[0];
  const latestPayout = payoutSummary.payouts[0];
  const payoutItems = [
    [labels.payoutItems[0][0], payoutAccount?.status ?? "not configured"],
    [labels.payoutItems[1][0], publisherAccount.publisherProfile?.payoutStatus ?? payoutSummary.publisherProfile?.payoutStatus ?? "not configured"],
    [labels.payoutItems[2][0], formatMoney(payoutSummary.balances.minPayoutCents, payoutSummary.balances.currency)],
    [
      labels.payoutItems[3][0],
      latestOnboarding
        ? `${latestOnboarding.provider} / ${latestOnboarding.status}`
        : latestPayout
        ? `${formatMoney(latestPayout.amountCents, latestPayout.currency)} / ${latestPayout.status}`
        : `${formatMoney(payoutSummary.balances.availableCents, payoutSummary.balances.currency)} available`
    ]
  ];
  const publisherPipelineRows =
    publisherSkills.length > 0
      ? publisherSkills.slice(0, 6).map((skill) => [
          skill.displayName,
          `${skill.verificationStatus} / ${skill.review.status ?? "no review"}`,
          `${skill.analytics.installCount} installs / ${formatPercent(skill.analytics.successRate)}`,
          getPublisherNextStep(skill.runtime.health, skill.pricing.status, skill.analytics.callCount, locale)
        ])
      : ops.pipelineRows;
  const developerProjectRows =
    developerProjects.length > 0
      ? developerProjects.slice(0, 6).map((project) => ({
          budget: `${formatMoney(project.policy.monthlyBudgetCents, project.usage.currency)} / ${formatCompactNumber(project.runtime.callCount)} calls`,
          keys: `${project.apiKeys.activeCount} active / ${project.apiKeys.revokedCount} revoked`,
          name: project.name,
          policy: `${project.policy.state} / ${project.updates.count} updates`,
          slug: project.slug
        }))
      : ops.projectRows.map(([name, budget, keys, policy]) => ({
          budget,
          keys,
          name,
          policy,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        }));
  const adjustmentRows = [
    ...publisherRefunds.slice(0, 4).map((refund) => ({
      amount: `-${formatMoney(refund.amountCents, refund.currency)}`,
      id: refund.id,
      project: refund.projectSlug ?? "unknown-project",
      reason: refund.reason ?? refund.providerReference ?? "Refund review",
      skill: refund.skillName ?? refund.transactionId ?? refund.id,
      status: refund.status,
      type: "Refund"
    })),
    ...publisherDisputes.slice(0, 4).map((dispute) => ({
      amount: formatMoney(dispute.amountCents, dispute.currency),
      id: dispute.id,
      project: dispute.projectSlug ?? "unknown-project",
      reason: dispute.reason ?? dispute.externalReference ?? "Dispute review",
      skill: dispute.skillName ?? dispute.transactionId ?? dispute.id,
      status: dispute.status,
      type: "Dispute"
    }))
  ].slice(0, 6);

  return (
    <main className="product-shell">
      <SiteHeader active="dashboard" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/dashboard" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <WalletCards size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="console-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {visibleMetrics.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="console-grid">
          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <PackageCheck size={16} aria-hidden="true" />
              <span>{labels.publisher}</span>
            </div>
            <div className="ops-list">
              {labels.publisherCards.map(([title, detail], index) => {
                const Icon = publisherIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.buyer}</span>
            </div>
            <div className="ops-list">
              {labels.buyerCards.map(([title, detail], index) => {
                const Icon = buyerIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="workspace-ops-layout">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <FileClock size={16} aria-hidden="true" />
            <span>{ops.pipelineTitle}</span>
          </div>
          <div className="work-table">
            <div className="work-table__row work-table__row--head">
              {ops.pipelineHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {publisherPipelineRows.map(([skill, stage, reviewer, next]) => (
              <div className="work-table__row" key={skill}>
                <strong>{skill}</strong>
                <span>{stage}</span>
                <span>{reviewer}</span>
                <span>{next}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{ops.projectTitle}</span>
          </div>
          <div className="work-table">
            <div className="work-table__row work-table__row--head">
              {ops.projectHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {developerProjectRows.map((project) => (
              <div className="work-table__row" key={project.slug}>
                <strong>
                  <a className="table-link" href={localizedHref(`/dashboard/projects/${project.slug}`, locale)}>
                    {project.name}
                  </a>
                </strong>
                <span>{project.budget}</span>
                <span>{project.keys}</span>
                <span>{project.policy}</span>
              </div>
            ))}
          </div>
        </article>

        <BuyerRequestManager
          developerRequests={developerBuyerRequests}
          locale={locale}
          publisherRequests={publisherBuyerRequests}
        />
      </section>

      <section className="finance-layout">
        <article className="ops-panel finance-panel">
          <div className="card-kicker">
            <CircleDollarSign size={16} aria-hidden="true" />
            <span>{labels.ledgerTitle}</span>
          </div>
          <div className="ledger-table">
            <div className="ledger-row ledger-row--head">
              {labels.ledgerHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {ledgerRows.map(([skill, gross, fee, net, status]) => (
              <div className="ledger-row" key={skill}>
                <strong>{skill}</strong>
                <span>{gross}</span>
                <span>{fee}</span>
                <span>{net}</span>
                <span className="status-chip">{status}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="finance-side">
          <article className="ops-panel payout-panel">
            <div className="card-kicker">
              <WalletCards size={16} aria-hidden="true" />
              <span>{labels.payoutTitle}</span>
            </div>
            <div className="payout-list">
              {payoutItems.map(([label, value]) => (
                <div className="payout-row" key={label}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <OrganizationBillingManager billing={organizationBilling} locale={locale} />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
        </aside>
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom workspace-ops-layout--adjustments">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <RotateCcw size={16} aria-hidden="true" />
            <span>{ops.adjustmentTitle}</span>
          </div>
          <div className="work-table work-table--adjustments">
            <div className="work-table__row work-table__row--head adjustment-row">
              {ops.adjustmentHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {adjustmentRows.length > 0 ? (
              adjustmentRows.map((adjustment) => {
                const Icon = adjustment.type === "Refund" ? RotateCcw : ShieldAlert;

                return (
                  <div className="work-table__row adjustment-row" key={`${adjustment.type}-${adjustment.id}`}>
                    <strong className="adjustment-kind">
                      <Icon size={15} aria-hidden="true" />
                      <span>{adjustment.type}</span>
                    </strong>
                    <span>{adjustment.skill}</span>
                    <span>{adjustment.project}</span>
                    <span>{adjustment.amount}</span>
                    <span className="status-chip" title={adjustment.reason}>
                      {adjustment.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="work-table__row adjustment-row adjustment-row--empty">
                <strong>{ops.adjustmentEmpty}</strong>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <article className="ops-panel runtime-ops-panel">
          <div className="card-kicker">
            <RadioTower size={16} aria-hidden="true" />
            <span>{ops.apiTitle}</span>
          </div>
          <div className="trust-requirement-grid">
            {ops.apiRows.map(([title, detail]) => (
              <div className="trust-requirement" key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function getPublisherNextStep(
  runtimeHealth: "healthy" | "warning" | "needs_attention" | "not_checked",
  priceStatus: "draft" | "active" | "archived",
  callCount: number,
  locale: "en" | "zh"
) {
  if (runtimeHealth === "needs_attention") {
    return locale === "zh" ? "修复运行检查" : "Fix runtime checks";
  }

  if (runtimeHealth === "not_checked" || runtimeHealth === "warning") {
    return locale === "zh" ? "完成运行验证" : "Complete runtime verification";
  }

  if (priceStatus !== "active") {
    return locale === "zh" ? "确认定价" : "Confirm pricing";
  }

  if (callCount === 0) {
    return locale === "zh" ? "提升列表质量" : "Improve listing quality";
  }

  return locale === "zh" ? "监控用量和反馈" : "Monitor usage and feedback";
}
