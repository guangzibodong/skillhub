import {
  AlertTriangle,
  Banknote,
  FileClock,
  Gavel,
  ListChecks,
  LockKeyhole,
  ReceiptText,
  Scale,
  ShieldCheck,
  Siren
} from "lucide-react";
import { AbuseReportManager } from "@/components/abuse-report-manager";
import { AdminAdjustmentManager } from "@/components/admin-adjustment-manager";
import { AdminIncidentManager } from "@/components/admin-incident-manager";
import { AdminPayoutManager } from "@/components/admin-payout-manager";
import { AdminReviewManager } from "@/components/admin-review-manager";
import { NotificationTemplateManager } from "@/components/notification-template-manager";
import { SkillFeedbackManager } from "@/components/skill-feedback-manager";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";
import {
  formatMoney,
  getAdminAbuseReports,
  getAdminDisputes,
  getAdminIncidents,
  getAdminNotifications,
  getAdminNotificationTemplates,
  getAdminPayouts,
  getAdminReviews,
  getAdminRefunds,
  getAdminSkillFeedback,
  getFinanceLedger
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const financeIcons = [Scale, Banknote, AlertTriangle] as const;

const adminOpsCopy = {
  en: {
    riskTitle: "Risk command center",
    riskHeaders: ["Signal", "Scope", "Action", "Owner"],
    riskRows: [
      ["High-risk filesystem skill", "codebase-risk-scanner", "Require owner approval", "Trust"],
      ["Unusual payout request", "$4,800 request", "Hold for KYC review", "Finance"],
      ["Runtime error spike", "browser-research-pro", "Throttle and notify publisher", "Platform"]
    ],
    moneyTitle: "Money ledger controls",
    moneyHeaders: ["Batch", "Gross", "Platform fee", "Publisher share", "State"],
    moneyRows: [
      ["usage-2026-06-04", "$2,840", "$568", "$2,272", "maturing"],
      ["sub-2026-06", "$6,300", "$1,260", "$5,040", "available"],
      ["refund-1820", "-$96", "-$19", "-$77", "adjusted"]
    ],
    actionTitle: "Admin action rules",
    actionRows: [
      ["Approve skill", "Creates audit log and public listing event"],
      ["Block payout", "Requires reason, owner, and retry condition"],
      ["Reverse transaction", "Adds adjustment, never edits historical split"]
    ]
  },
  zh: {
    riskTitle: "风险指挥台",
    riskHeaders: ["信号", "范围", "动作", "负责人"],
    riskRows: [
      ["高风险文件系统技能", "codebase-risk-scanner", "要求 owner 批准", "Trust"],
      ["异常提现请求", "$4,800 请求", "暂停并做 KYC 审核", "Finance"],
      ["运行错误激增", "browser-research-pro", "限流并通知发布者", "Platform"]
    ],
    moneyTitle: "资金账本控制",
    moneyHeaders: ["批次", "总额", "平台佣金", "发布者收入", "状态"],
    moneyRows: [
      ["usage-2026-06-04", "$2,840", "$568", "$2,272", "成熟中"],
      ["sub-2026-06", "$6,300", "$1,260", "$5,040", "可提现"],
      ["refund-1820", "-$96", "-$19", "-$77", "已调整"]
    ],
    actionTitle: "后台动作规则",
    actionRows: [
      ["批准技能", "创建审计日志和公开上架事件"],
      ["阻止提现", "必须记录原因、负责人和重试条件"],
      ["冲回交易", "新增调整交易，绝不修改历史分账"]
    ]
  }
} as const;

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.adminPage;
  const ops = adminOpsCopy[locale];
  const [
    financeLedger,
    notifications,
    notificationTemplates,
    payouts,
    refunds,
    disputes,
    abuseReports,
    incidents,
    skillFeedback,
    reviews
  ] = await Promise.all([
    getFinanceLedger(),
    getAdminNotifications(),
    getAdminNotificationTemplates(),
    getAdminPayouts(),
    getAdminRefunds(),
    getAdminDisputes(),
    getAdminAbuseReports(),
    getAdminIncidents(),
    getAdminSkillFeedback(),
    getAdminReviews()
  ]);
  const financeRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 5).map((transaction) => [
          transaction.skillName ?? transaction.skillSlug ?? transaction.id,
          formatMoney(transaction.grossCents, transaction.currency),
          formatMoney(transaction.platformFeeCents, transaction.currency),
          formatMoney(transaction.publisherShareCents, transaction.currency),
          transaction.balanceState ?? transaction.status
        ])
      : ops.moneyRows;
  const notificationRows =
    notifications.length > 0
      ? notifications.slice(0, 5).map((notification) => [
          notification.subject ?? notification.eventType,
          notification.eventType,
          notification.status
        ])
      : labels.auditRows.map((item) => [item, "system", "queued"]);
  const riskRows =
    abuseReports.length + incidents.length + skillFeedback.length + refunds.length + disputes.length > 0
      ? [
          ...incidents.slice(0, 3).map((incident) => [
            `${incident.severity} incident`,
            incident.skillName,
            incident.status === "open" ? "Move to monitoring or resolve" : incident.summary ?? "Track runtime recovery",
            "Platform"
          ]),
          ...abuseReports.slice(0, 3).map((report) => [
            `${report.severity} ${report.category}`,
            report.skillName,
            report.status === "open" ? "Triage or restrict listing" : report.decisionReason ?? "Follow up trust action",
            "Trust"
          ]),
          ...skillFeedback.slice(0, 3).map((feedback) => [
            `Feedback ${feedback.status}`,
            feedback.skillName,
            feedback.status === "pending" ? "Publish, hide, or reject review" : feedback.moderationReason ?? "Monitor public quality signal",
            "Trust"
          ]),
          ...refunds.slice(0, 3).map((refund) => [
            `Refund ${refund.status}`,
            refund.skillName ?? refund.transactionId ?? refund.id,
            refund.reason ?? "Review refund adjustment",
            "Finance"
          ]),
          ...disputes.slice(0, 3).map((dispute) => [
            `Dispute ${dispute.status}`,
            dispute.skillName ?? dispute.transactionId ?? dispute.id,
            dispute.reason ?? "Resolve dispute evidence",
            "Trust"
          ])
        ].slice(0, 5)
      : ops.riskRows;
  const activeIncidentCount = incidents.filter((incident) => incident.status === "open" || incident.status === "monitoring").length;
  const visibleMetrics = [
    [labels.metrics[0][0], formatMoney(financeLedger.summary.grossCents)],
    [labels.metrics[1][0], formatMoney(financeLedger.summary.platformFeeCents)],
    [labels.metrics[2][0], formatMoney(financeLedger.summary.pendingBalanceCents)],
    [labels.metrics[3][0], String(reviews.length + activeIncidentCount + skillFeedback.filter((feedback) => feedback.status === "pending").length)]
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="admin" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/admin" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
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
      </section>

      <section className="admin-layout">
        <AdminReviewManager locale={locale} reviews={reviews} />

        <aside className="ops-panel admin-audit-panel">
          <div className="card-kicker">
            <FileClock size={16} aria-hidden="true" />
            <span>{labels.auditTitle}</span>
          </div>
          <div className="audit-list">
            {notificationRows.map(([subject, eventType, status]) => (
              <div className="audit-row" key={`${subject}-${eventType}`}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>
                  <strong>{subject}</strong>
                  <small>{eventType} / {status}</small>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <SkillFeedbackManager feedback={skillFeedback} locale={locale} />
        <AdminIncidentManager incidents={incidents} locale={locale} />
        <AbuseReportManager locale={locale} reports={abuseReports} />
        <AdminAdjustmentManager disputes={disputes} locale={locale} refunds={refunds} />
      </section>

      <section className="admin-layout">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <Siren size={16} aria-hidden="true" />
            <span>{ops.riskTitle}</span>
          </div>
          <div className="work-table">
            <div className="work-table__row work-table__row--head">
              {ops.riskHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {riskRows.map(([signal, scope, action, owner]) => (
              <div className="work-table__row" key={signal}>
                <strong>{signal}</strong>
                <span>{scope}</span>
                <span>{action}</span>
                <span>{owner}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel">
          <div className="card-kicker">
            <Gavel size={16} aria-hidden="true" />
            <span>{ops.actionTitle}</span>
          </div>
          <div className="ops-list">
            {ops.actionRows.map(([title, detail]) => (
              <div className="ops-row" key={title}>
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="workspace-ops-layout">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <ReceiptText size={16} aria-hidden="true" />
            <span>{ops.moneyTitle}</span>
          </div>
          <div className="money-table">
            <div className="money-table__row money-table__row--head">
              {ops.moneyHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {financeRows.map(([batch, gross, fee, share, state]) => (
              <div className="money-table__row" key={batch}>
                <strong>{batch}</strong>
                <span>{gross}</span>
                <span>{fee}</span>
                <span>{share}</span>
                <span className="status-chip">{state}</span>
              </div>
            ))}
          </div>
        </article>

        <AdminPayoutManager locale={locale} payouts={payouts} />
      </section>

      <section className="admin-finance-section">
        <div className="section-heading section-heading--compact">
          <div className="eyebrow">
            <ListChecks size={16} aria-hidden="true" />
            <span>{labels.financeTitle}</span>
          </div>
        </div>

        <div className="finance-rule-grid">
          {labels.financeRows.map(([title, detail], index) => {
            const Icon = financeIcons[index];
            return (
              <article className="finance-rule lift-card" key={title}>
                <Icon size={19} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
