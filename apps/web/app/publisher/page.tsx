import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  CircleDot,
  ClipboardList,
  ListChecks,
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

type ReadinessTask = {
  detail: string;
  id: "session" | "profile" | "publish" | "verified" | "payout";
  status: "blocked" | "current" | "done";
  title: string;
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
    readiness: {
      blocked: "Waiting",
      current: "Next",
      done: "Done",
      progress: "readiness",
      title: "Publisher launch checklist",
      tasks: {
        session: ["Connect workspace session", "Sign in with an organization token so publishing, pricing, payouts, and notifications are scoped."],
        profile: ["Create publisher profile", "Set the public publisher name buyers will see before they install a skill."],
        publish: ["Publish your first skill", "Submit a manifest and move it into review from the publisher skill operations panel."],
        verified: ["Reach verified listing status", "Complete review and activate pricing so buyers can trust and install the skill."],
        payout: ["Prepare payout readiness", "Connect payout details before revenue matures into a withdrawal request."]
      }
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
    readiness: {
      blocked: "等待",
      current: "下一步",
      done: "完成",
      progress: "准备度",
      title: "发布者上线清单",
      tasks: {
        session: ["连接工作区会话", "使用组织 token 登录，让发布、定价、提现和通知都归属到当前组织。"],
        profile: ["创建发布者档案", "设置买家安装技能前会看到的公开发布者名称。"],
        publish: ["发布第一个技能", "提交 manifest，并在发布者技能运营面板里推进审核。"],
        verified: ["获得已验证上架状态", "完成审核并启用价格，让买家可以信任并安装技能。"],
        payout: ["准备提现资料", "在收入成熟并发起提现前，先完成提现账户和资料状态。"]
      }
    },
    title: "运营你的 SkillHub 技能发布业务。"
  }
} as const;

function buildReadinessTasks(
  taskCopy: Record<ReadinessTask["id"], readonly [string, string]>,
  flags: {
    hasActiveVerifiedListing: boolean;
    hasPublishedSkill: boolean;
    hasPayoutReady: boolean;
    hasPublisherProfile: boolean;
    hasWorkspaceSession: boolean;
  }
): ReadinessTask[] {
  const statusFor = (isDone: boolean, canStart: boolean): ReadinessTask["status"] => {
    if (isDone) {
      return "done";
    }

    return canStart ? "current" : "blocked";
  };

  return [
    {
      detail: taskCopy.session[1],
      id: "session",
      status: statusFor(flags.hasWorkspaceSession, true),
      title: taskCopy.session[0]
    },
    {
      detail: taskCopy.profile[1],
      id: "profile",
      status: statusFor(flags.hasPublisherProfile, flags.hasWorkspaceSession),
      title: taskCopy.profile[0]
    },
    {
      detail: taskCopy.publish[1],
      id: "publish",
      status: statusFor(flags.hasPublishedSkill, flags.hasPublisherProfile),
      title: taskCopy.publish[0]
    },
    {
      detail: taskCopy.verified[1],
      id: "verified",
      status: statusFor(flags.hasActiveVerifiedListing, flags.hasPublishedSkill),
      title: taskCopy.verified[0]
    },
    {
      detail: taskCopy.payout[1],
      id: "payout",
      status: statusFor(flags.hasPayoutReady, flags.hasPublisherProfile),
      title: taskCopy.payout[0]
    }
  ];
}

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
  const hasWorkspaceSession = session.source !== "none" && Boolean(session.subject);
  const hasPublisherProfile = Boolean(publisherAccount.publisherProfile);
  const hasPublishedSkill = publisherSkills.length > 0;
  const hasActiveVerifiedListing = publisherSkills.some(
    (skill) => skill.verificationStatus === "verified" && skill.pricing.status === "active"
  );
  const hasPayoutReady =
    publisherAccount.publisherProfile?.payoutStatus === "verified" ||
    payoutSummary.publisherProfile?.payoutStatus === "verified" ||
    publisherAccount.payoutAccounts.some((account) => account.status === "verified" || account.status === "ready") ||
    payoutSummary.payoutAccounts.some((account) => account.status === "verified" || account.status === "ready");
  const readinessTasks = buildReadinessTasks(labels.readiness.tasks, {
    hasActiveVerifiedListing,
    hasPublishedSkill,
    hasPayoutReady,
    hasPublisherProfile,
    hasWorkspaceSession
  });
  const readinessDone = readinessTasks.filter((task) => task.status === "done").length;
  const readinessPercent = Math.round((readinessDone / readinessTasks.length) * 100);
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
          <article className="ops-panel publisher-launch-checklist">
            <div className="publisher-launch-checklist__head">
              <div className="card-kicker">
                <ListChecks size={16} aria-hidden="true" />
                <span>{labels.readiness.title}</span>
              </div>
              <span className="status-chip status-chip--neutral">
                {readinessPercent}% {labels.readiness.progress}
              </span>
            </div>

            <div className="publisher-launch-checklist__bar" aria-hidden="true">
              <span style={{ width: `${readinessPercent}%` }} />
            </div>

            <div className="publisher-launch-checklist__items">
              {readinessTasks.map((task) => {
                const Icon = task.status === "done" ? CheckCircle2 : CircleDot;

                return (
                  <div className={`publisher-launch-task publisher-launch-task--${task.status}`} key={task.id}>
                    <Icon size={17} aria-hidden="true" />
                    <div>
                      <header>
                        <strong>{task.title}</strong>
                        <span>{labels.readiness[task.status]}</span>
                      </header>
                      <p>{task.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

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
