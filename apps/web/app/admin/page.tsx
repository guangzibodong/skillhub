import {
  AlertTriangle,
  Banknote,
  Gavel,
  ListChecks,
  LockKeyhole,
  ReceiptText,
  Scale,
  Siren
} from "lucide-react";
import { AdminAuditLogPanel } from "@/components/admin-audit-log-panel";
import { AbuseReportManager } from "@/components/abuse-report-manager";
import { AdminAdjustmentManager } from "@/components/admin-adjustment-manager";
import { AdminCommissionRuleManager } from "@/components/admin-commission-rule-manager";
import { AdminIncidentManager } from "@/components/admin-incident-manager";
import { AdminIdentityDirectory } from "@/components/admin-identity-directory";
import { AdminMarketplaceCurationManager } from "@/components/admin-marketplace-curation-manager";
import { AdminPayoutManager } from "@/components/admin-payout-manager";
import { AdminReviewManager } from "@/components/admin-review-manager";
import { NotificationTemplateManager } from "@/components/notification-template-manager";
import { SkillFeedbackManager } from "@/components/skill-feedback-manager";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";
import {
  formatMoney,
  getAdminAbuseReports,
  getAdminAuditLogs,
  getAdminCommissionRules,
  getAdminDisputes,
  getAdminIdentityDirectory,
  getAdminIncidents,
  getAdminMarketplaceCuration,
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
    riskRows: [],
    owners: {
      finance: "Finance",
      platform: "Platform",
      trust: "Trust"
    },
    riskSignals: {
      abuseActionFollowup: "Follow up trust action",
      abuseActionOpen: "Triage or restrict listing",
      disputeActionDefault: "Resolve dispute evidence",
      disputeLabel: "Dispute",
      feedbackActionMonitor: "Monitor public quality signal",
      feedbackActionPending: "Publish, hide, or reject review",
      feedbackLabel: "Feedback",
      incidentActionOpen: "Move to monitoring or resolve",
      incidentActionRecovery: "Track runtime recovery",
      incidentLabel: "incident",
      refundActionDefault: "Review refund adjustment",
      refundLabel: "Refund",
      abuseCategories: {
        billing: "billing",
        copyright: "copyright",
        malicious: "malicious",
        other: "other",
        privacy: "privacy",
        quality: "quality",
        security: "security",
        spam: "spam"
      },
      disputeStatuses: {
        lost: "lost",
        open: "open",
        warning_needs_response: "needs response",
        won: "won"
      },
      feedbackStatuses: {
        hidden: "hidden",
        pending: "pending",
        published: "published",
        rejected: "rejected"
      },
      refundStatuses: {
        approved: "approved",
        failed: "failed",
        posted: "posted",
        rejected: "rejected",
        requested: "requested"
      },
      severities: {
        critical: "critical",
        high: "high",
        low: "low",
        medium: "medium"
      }
    },
    moneyTitle: "Money ledger controls",
    moneyHeaders: ["Batch", "Gross", "Platform fee", "Publisher share", "State"],
    moneyRows: [],
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
      ["高风险文件系统技能", "codebase-risk-scanner", "要求负责人批准", "信任安全"],
      ["异常提现请求", "$4,800 请求", "暂停并做 KYC 审核", "财务"],
      ["运行错误激增", "browser-research-pro", "限流并通知发布者", "平台"]
    ],
    owners: {
      finance: "财务",
      platform: "平台",
      trust: "信任安全"
    },
    riskSignals: {
      abuseActionFollowup: "跟进信任安全处理",
      abuseActionOpen: "分诊或限制上架",
      disputeActionDefault: "处理争议证据",
      disputeLabel: "争议",
      feedbackActionMonitor: "观察公开质量信号",
      feedbackActionPending: "发布、隐藏或拒绝评价",
      feedbackLabel: "评价",
      incidentActionOpen: "转入监控或解决",
      incidentActionRecovery: "跟踪运行恢复",
      incidentLabel: "事故",
      refundActionDefault: "复核退款调整",
      refundLabel: "退款",
      abuseCategories: {
        billing: "账单",
        copyright: "版权",
        malicious: "恶意",
        other: "其他",
        privacy: "隐私",
        quality: "质量",
        security: "安全",
        spam: "垃圾内容"
      },
      disputeStatuses: {
        lost: "已败诉",
        open: "处理中",
        warning_needs_response: "需要响应",
        won: "已胜诉"
      },
      feedbackStatuses: {
        hidden: "已隐藏",
        pending: "待处理",
        published: "已发布",
        rejected: "已拒绝"
      },
      refundStatuses: {
        approved: "已批准",
        failed: "失败",
        posted: "已入账",
        rejected: "已拒绝",
        requested: "已申请"
      },
      severities: {
        critical: "严重",
        high: "高",
        low: "低",
        medium: "中"
      }
    },
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
    auditLogs,
    marketplaceCuration,
    notificationTemplates,
    identityDirectory,
    payouts,
    commissionRules,
    refunds,
    disputes,
    abuseReports,
    incidents,
    skillFeedback,
    reviews
  ] = await Promise.all([
    getFinanceLedger(),
    getAdminAuditLogs(),
    getAdminMarketplaceCuration(),
    getAdminNotificationTemplates(),
    getAdminIdentityDirectory(),
    getAdminPayouts(),
    getAdminCommissionRules(),
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
      : [];
  const riskRows =
    abuseReports.length + incidents.length + skillFeedback.length + refunds.length + disputes.length > 0
      ? [
          ...incidents.slice(0, 3).map((incident) => [
            `${formatRiskSeverity(incident.severity, ops)} ${ops.riskSignals.incidentLabel}`,
            incident.skillName,
            incident.status === "open" ? ops.riskSignals.incidentActionOpen : incident.summary ?? ops.riskSignals.incidentActionRecovery,
            ops.owners.platform
          ]),
          ...abuseReports.slice(0, 3).map((report) => [
            `${formatRiskSeverity(report.severity, ops)} ${formatAbuseCategory(report.category, ops)}`,
            report.skillName,
            report.status === "open" ? ops.riskSignals.abuseActionOpen : report.decisionReason ?? ops.riskSignals.abuseActionFollowup,
            ops.owners.trust
          ]),
          ...skillFeedback.slice(0, 3).map((feedback) => [
            `${ops.riskSignals.feedbackLabel} ${formatFeedbackStatus(feedback.status, ops)}`,
            feedback.skillName,
            feedback.status === "pending" ? ops.riskSignals.feedbackActionPending : feedback.moderationReason ?? ops.riskSignals.feedbackActionMonitor,
            ops.owners.trust
          ]),
          ...refunds.slice(0, 3).map((refund) => [
            `${ops.riskSignals.refundLabel} ${formatRefundStatus(refund.status, ops)}`,
            refund.skillName ?? refund.transactionId ?? refund.id,
            refund.reason ?? ops.riskSignals.refundActionDefault,
            ops.owners.finance
          ]),
          ...disputes.slice(0, 3).map((dispute) => [
            `${ops.riskSignals.disputeLabel} ${formatDisputeStatus(dispute.status, ops)}`,
            dispute.skillName ?? dispute.transactionId ?? dispute.id,
            dispute.reason ?? ops.riskSignals.disputeActionDefault,
            ops.owners.trust
          ])
        ].slice(0, 5)
      : [];
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

        <AdminAuditLogPanel locale={locale} logs={auditLogs} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <AdminMarketplaceCurationManager
          connectionMessage={marketplaceCuration.message}
          connectionMode={marketplaceCuration.mode}
          curation={marketplaceCuration.curation}
          locale={locale}
        />
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
            {riskRows.length === 0 ? (
              <div className="work-table__empty">{locale === "zh" ? "暂无实时风险信号。" : "No live risk signals recorded yet."}</div>
            ) : null}
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
                <Scale size={18} aria-hidden="true" />
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
            {financeRows.length === 0 ? (
              <div className="money-table__empty">{locale === "zh" ? "暂无已入账资金流水。" : "No posted ledger transactions yet."}</div>
            ) : null}
          </div>
        </article>

        <AdminPayoutManager locale={locale} payouts={payouts} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <AdminCommissionRuleManager locale={locale} rules={commissionRules} />
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

type AdminOpsCopy = (typeof adminOpsCopy)["en"] | (typeof adminOpsCopy)["zh"];

function formatRiskSeverity(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.severities[value as keyof typeof ops.riskSignals.severities] ?? value.replaceAll("_", " ");
}

function formatAbuseCategory(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.abuseCategories[value as keyof typeof ops.riskSignals.abuseCategories] ?? value.replaceAll("_", " ");
}

function formatFeedbackStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.feedbackStatuses[value as keyof typeof ops.riskSignals.feedbackStatuses] ?? value.replaceAll("_", " ");
}

function formatRefundStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.refundStatuses[value as keyof typeof ops.riskSignals.refundStatuses] ?? value.replaceAll("_", " ");
}

function formatDisputeStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.disputeStatuses[value as keyof typeof ops.riskSignals.disputeStatuses] ?? value.replaceAll("_", " ");
}
