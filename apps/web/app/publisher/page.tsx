import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  RotateCcw,
  ShieldAlert,
  WalletCards
} from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { PublisherAccountManager } from "@/components/publisher-account-manager";
import { PublisherPayoutManager } from "@/components/publisher-payout-manager";
import { PublisherSkillManager } from "@/components/publisher-skill-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  getNotificationPreferences,
  getUserNotificationInbox,
  getPublisherAccountSummary,
  getPublisherBuyerRequests,
  getPublisherDisputes,
  getPublisherFinanceLedger,
  getPublisherPayoutSummary,
  getPublisherRefunds,
  getPublisherSkills
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    adjustmentEmpty: "No recent refund or dispute activity",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentTitle: "Refund and dispute watch",
    description:
      "A focused workspace for skill publishers to move packages through review, price verified listings, respond to buyer demand, and prepare revenue for payout.",
    eyebrow: "Publisher workspace",
    ledgerHeaders: ["Skill", "Gross", "Fee", "Net", "Status"],
    ledgerEmpty: "No posted publisher revenue yet",
    ledgerTitle: "Publisher revenue ledger",
    metrics: {
      available: "Available balance",
      demand: "Open demand",
      skills: "Owned skills",
      verified: "Verified skills"
    },
    title: "Operate your SkillHub publishing business."
  },
  zh: {
    adjustmentEmpty: "暂无退款或争议记录",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentTitle: "退款与争议跟进",
    description:
      "给技能发布者使用的独立工作台：推进技能审核、设置已验证技能价格、响应买方需求，并把收入准备到可提现状态。",
    eyebrow: "发布者工作台",
    ledgerHeaders: ["技能", "总收入", "佣金", "净收入", "状态"],
    ledgerEmpty: "暂无已入账的发布者收入",
    ledgerTitle: "发布者收入账本",
    metrics: {
      available: "可提现余额",
      demand: "开放需求",
      skills: "我的技能",
      verified: "已验证技能"
    },
    title: "运营你的 SkillHub 技能发布业务。"
  }
} as const;

export default async function PublisherPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.useskillhub.com";
  const publisherReturnUrl = `${appUrl.replace(/\/$/, "")}${localizedHref("/publisher", locale)}`;
  const [
    financeLedger,
    payoutSummary,
    publisherAccount,
    publisherSkills,
    publisherBuyerRequests,
    publisherRefunds,
    publisherDisputes,
    userNotificationInbox,
    notificationPreferences,
    session
  ] = await Promise.all([
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
    getPublisherAccountSummary(),
    getPublisherSkills(),
    getPublisherBuyerRequests(),
    getPublisherRefunds(),
    getPublisherDisputes(),
    getUserNotificationInbox(),
    getNotificationPreferences(),
    getWorkspaceSession()
  ]);
  const verifiedSkillCount = publisherSkills.filter((skill) => skill.verificationStatus === "verified").length;
  const activeDemandCount = publisherBuyerRequests.filter(
    (request) => request.status === "open" || request.status === "claimed" || request.status === "submitted"
  ).length;
  const visibleMetrics = [
    [labels.metrics.skills, formatCompactNumber(publisherSkills.length)],
    [labels.metrics.verified, formatCompactNumber(verifiedSkillCount)],
    [labels.metrics.available, formatMoney(financeLedger.summary.availableBalanceCents)],
    [labels.metrics.demand, formatCompactNumber(activeDemandCount)]
  ];
  const ledgerRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 6).map((transaction) => [
          transaction.skillName ?? transaction.skillSlug ?? transaction.id,
          formatMoney(transaction.grossCents, transaction.currency),
          formatMoney(transaction.platformFeeCents, transaction.currency),
          formatMoney(transaction.publisherShareCents, transaction.currency),
          transaction.balanceState ?? transaction.status
        ])
      : [];
  const adjustmentRows = [
    ...publisherRefunds.slice(0, 4).map((refund) => ({
      amount: `-${formatMoney(refund.amountCents, refund.currency)}`,
      id: refund.id,
      project: refund.projectSlug ?? "unknown-project",
      reason: refund.reason ?? refund.providerReference ?? "Refund review",
      skill: refund.skillName ?? refund.transactionId ?? refund.id,
      status: refund.status,
      type: locale === "zh" ? "退款" : "Refund"
    })),
    ...publisherDisputes.slice(0, 4).map((dispute) => ({
      amount: formatMoney(dispute.amountCents, dispute.currency),
      id: dispute.id,
      project: dispute.projectSlug ?? "unknown-project",
      reason: dispute.reason ?? dispute.externalReference ?? "Dispute review",
      skill: dispute.skillName ?? dispute.transactionId ?? dispute.id,
      status: dispute.status,
      type: locale === "zh" ? "争议" : "Dispute"
    }))
  ].slice(0, 6);

  return (
    <main className="product-shell">
      <SiteHeader active="publisher" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/publisher" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <BriefcaseBusiness size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="console-board publisher-console-board">
        <SessionStatusPanel locale={locale} session={session} />

        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {visibleMetrics.map(([label, value], index) => {
            const Icon = index === 0 ? PackageCheck : index === 1 ? BadgeCheck : index === 2 ? CircleDollarSign : ClipboardList;

            return (
              <div className="metric publisher-metric" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="publisher-command-layout">
        <div className="publisher-command-main">
          <PublisherSkillManager locale={locale} skills={publisherSkills} />

          <BuyerRequestManager
            developerRequests={[]}
            locale={locale}
            mode="publisher"
            publisherRequests={publisherBuyerRequests}
          />

          <article className="ops-panel finance-panel">
            <div className="card-kicker">
              <WalletCards size={16} aria-hidden="true" />
              <span>{labels.ledgerTitle}</span>
            </div>
            <div className="ledger-table">
              <div className="ledger-row ledger-row--head">
                {labels.ledgerHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {ledgerRows.length > 0 ? (
                ledgerRows.map(([skill, gross, fee, net, status]) => (
                  <div className="ledger-row" key={skill}>
                    <strong>{skill}</strong>
                    <span>{gross}</span>
                    <span>{fee}</span>
                    <span>{net}</span>
                    <span className="status-chip">{status}</span>
                  </div>
                ))
              ) : (
                <div className="ledger-row ledger-row--empty">
                  <strong>{labels.ledgerEmpty}</strong>
                </div>
              )}
            </div>
          </article>

          <article className="ops-panel work-table-panel">
            <div className="card-kicker">
              <RotateCcw size={16} aria-hidden="true" />
              <span>{labels.adjustmentTitle}</span>
            </div>
            <div className="work-table work-table--adjustments">
              <div className="work-table__row work-table__row--head adjustment-row">
                {labels.adjustmentHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {adjustmentRows.length > 0 ? (
                adjustmentRows.map((adjustment) => {
                  const Icon = adjustment.type === "Refund" || adjustment.type === "退款" ? RotateCcw : ShieldAlert;

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
                  <strong>{labels.adjustmentEmpty}</strong>
                </div>
              )}
            </div>
          </article>
        </div>

        <aside className="publisher-command-side">
          <PublisherAccountManager account={publisherAccount} locale={locale} returnUrl={publisherReturnUrl} />

          <PublisherPayoutManager locale={locale} summary={payoutSummary} />

          <NotificationInboxManager
            locale={locale}
            notifications={userNotificationInbox.notifications}
            summary={userNotificationInbox.summary}
          />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
        </aside>
      </section>
    </main>
  );
}
