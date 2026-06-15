"use client";

import { useActionState, useState, type FormEvent } from "react";
import { CheckCircle2, Gavel, Save, ShieldAlert, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { AbuseReportRecord } from "@/lib/ops-data";
import { decideAbuseReportAction, type AbuseReportActionState } from "@/lib/abuse-report-actions";

type AbuseReportManagerProps = {
  locale: Locale;
  reports: AbuseReportRecord[];
};

const copy = {
  en: {
    action: "Action",
    category: "Category",
    decided: "Decision",
    empty: "No trust reports in the queue.",
    evidence: "Evidence",
    noEvidence: "No evidence URL",
    noProject: "No project",
    notAvailable: "Not available",
    project: "Project",
    reason: "Decision reason",
    reporter: "Reporter",
    save: "Record action",
    saving: "Saving",
    status: "Status",
    title: "Trust and takedown queue",
    visibility: "Listing",
    categories: {
      billing: "Billing",
      copyright: "Copyright",
      malicious: "Malicious",
      other: "Other",
      privacy: "Privacy",
      quality: "Quality",
      security: "Security",
      spam: "Spam"
    },
    severities: {
      critical: "Critical",
      high: "High",
      low: "Low",
      medium: "Medium"
    },
    statuses: {
      dismissed: "Dismissed",
      open: "Open",
      restricted: "Restricted",
      resolved: "Resolved",
      suspended: "Suspended",
      triaged: "Triaged",
      warning_sent: "Warning sent"
    },
    actions: {
      dismiss: "Dismiss",
      resolve: "Resolve",
      restrict: "Restrict listing",
      suspend: "Suspend skill",
      triage: "Triage",
      warn: "Warn publisher"
    },
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    },
    visibilityStatuses: {
      private: "Private",
      public: "Public",
      unlisted: "Unlisted"
    }
  },
  zh: {
    action: "动作",
    category: "分类",
    decided: "处理结果",
    empty: "当前没有信任安全举报。",
    evidence: "证据",
    noEvidence: "无证据链接",
    noProject: "未关联项目",
    notAvailable: "暂无",
    project: "项目",
    reason: "处理原因",
    reporter: "举报人",
    save: "记录处理",
    saving: "保存中",
    status: "状态",
    title: "信任安全与下架队列",
    visibility: "列表状态",
    categories: {
      billing: "计费",
      copyright: "版权",
      malicious: "恶意行为",
      other: "其他",
      privacy: "隐私",
      quality: "质量",
      security: "安全",
      spam: "垃圾内容"
    },
    severities: {
      critical: "严重",
      high: "高",
      low: "低",
      medium: "中"
    },
    statuses: {
      dismissed: "已驳回",
      open: "待处理",
      restricted: "已限制",
      resolved: "已解决",
      suspended: "已暂停",
      triaged: "已分诊",
      warning_sent: "已警告"
    },
    actions: {
      dismiss: "驳回",
      resolve: "解决",
      restrict: "限制列表",
      suspend: "暂停技能",
      triage: "进入分诊",
      warn: "警告发布者"
    },
    verificationStatuses: {
      deprecated: "已废弃",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    },
    visibilityStatuses: {
      private: "私有",
      public: "公开",
      unlisted: "未列出"
    }
  }
} as const;

const initialState: AbuseReportActionState = {
  message: "",
  status: "idle"
};

export function AbuseReportManager({ locale, reports }: AbuseReportManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(decideAbuseReportAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel abuse-report-panel">
      <div className="card-kicker">
        <ShieldAlert size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="abuse-report-list">
        {reports.length > 0 ? (
          reports.map((report) => {
            const statusMessage = state.reportId === report.id ? state : null;

            return (
              <section className="abuse-report-card" key={report.id}>
                <header className="abuse-report-card__head">
                  <div>
                    <strong>{report.title}</strong>
                    <span>
                      {report.skillName} / {report.skillSlug}
                    </span>
                  </div>
                  <span className={severityClass(report.severity)}>{labels.severities[report.severity]}</span>
                </header>

                <p>{report.description}</p>

                <div className="abuse-report-meta">
                  <span>
                    <strong>{labels.category}</strong>
                    {labels.categories[report.category]}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    {labels.statuses[report.status]}
                  </span>
                  <span>
                    <strong>{labels.visibility}</strong>
                    {formatVisibilityStatus(report.skillVisibility, labels)} / {formatVerificationStatus(report.skillVerificationStatus, labels)}
                  </span>
                  <span>
                    <strong>{labels.reporter}</strong>
                    {report.reporterOrganizationName ?? report.reporterEmail ?? labels.notAvailable}
                  </span>
                  <span>
                    <strong>{labels.project}</strong>
                    {report.projectSlug ?? labels.noProject}
                  </span>
                  <span>
                    <strong>{labels.evidence}</strong>
                    {report.evidenceUrl ? (
                      <a href={report.evidenceUrl} rel="noreferrer" target="_blank">
                        {report.evidenceUrl}
                      </a>
                    ) : (
                      labels.noEvidence
                    )}
                  </span>
                </div>

                {report.decisionReason ? (
                  <div className="abuse-report-decision">
                    <Gavel size={15} aria-hidden="true" />
                    <span>
                      <strong>{labels.decided}</strong>
                      {report.decisionReason}
                    </span>
                  </div>
                ) : null}

                <AbuseDecisionForm
                  action={action}
                  isPending={isPending}
                  labels={labels}
                  locale={locale}
                  report={report}
                  statusMessage={statusMessage}
                />

                {statusMessage && statusMessage.status !== "idle" ? (
                  <div className={statusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{statusMessage.message}</span>
                  </div>
                ) : null}
              </section>
            );
          })
        ) : (
          <div className="project-table__row project-table__row--empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

type AbuseAction = "dismiss" | "resolve" | "restrict" | "suspend" | "triage" | "warn";

function AbuseDecisionForm({
  action,
  isPending,
  labels,
  locale,
  report,
  statusMessage
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  report: AbuseReportRecord;
  statusMessage: AbuseReportActionState | null;
}) {
  const [selectedAction, setSelectedAction] = useState<AbuseAction | "">("");
  const actionCopy = getAbuseActionCopy(locale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedAction) {
      event.preventDefault();
      return;
    }

    const message = actionCopy.confirm[selectedAction];
    if (message && !window.confirm(message.replace("{skill}", report.skillName))) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className="abuse-report-action-form" onSubmit={handleSubmit}>
      <input name="reportId" type="hidden" value={report.id} />
      <label>
        <span>{labels.action}</span>
        <select
          name="action"
          onChange={(event) => setSelectedAction(event.target.value as AbuseAction | "")}
          required
          value={selectedAction}
        >
          <option value="">{actionCopy.choose}</option>
          {Object.entries(labels.actions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <small>{actionCopy.help}</small>
      </label>
      <label>
        <span>{labels.reason}</span>
        <input defaultValue={report.decisionReason ?? ""} name="reason" required />
      </label>
      <button className="secondary-button secondary-button--compact" disabled={isPending || !selectedAction} type="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isPending && statusMessage ? labels.saving : labels.save}</span>
      </button>
    </form>
  );
}

function getAbuseActionCopy(locale: Locale) {
  if (locale === "zh") {
    return {
      choose: "请选择处置动作",
      confirm: {
        dismiss: "确认驳回这条举报？请确保原因写清楚。",
        resolve: "确认将 {skill} 的举报标记为已解决？",
        restrict: "确认限制 {skill} 的公开可见性？这会影响市场曝光。",
        suspend: "确认暂停 {skill}？这会影响公开可见性和运行权限。",
        triage: "确认只进入分诊，不改变公开可见性或运行权限？",
        warn: "确认向发布者发送警告？"
      },
      help: "限制列表或暂停技能会影响公开可见性/运行权限；普通高危举报建议先分诊并补充证据。"
    };
  }

  return {
    choose: "Choose action",
    confirm: {
      dismiss: "Dismiss this report? Make sure the reason is clear.",
      resolve: "Mark the report for {skill} as resolved?",
      restrict: "Restrict public listing visibility for {skill}? This affects marketplace exposure.",
      suspend: "Suspend {skill}? This affects public visibility and runtime availability.",
      triage: "Triage only without changing visibility or runtime availability?",
      warn: "Send a warning to the publisher?"
    },
    help: "Restricting or suspending affects public visibility/runtime access. Triage first when evidence is incomplete."
  };
}

type AbuseLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function formatVerificationStatus(value: string, labels: AbuseLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.verificationStatuses[normalized as keyof typeof labels.verificationStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function formatVisibilityStatus(value: string, labels: AbuseLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.visibilityStatuses[normalized as keyof typeof labels.visibilityStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function humanizeEnum(value: string, fallback: string) {
  const normalized = value.replaceAll("_", " ").trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : fallback;
}

function severityClass(severity: AbuseReportRecord["severity"]) {
  if (severity === "critical" || severity === "high") {
    return "status-chip status-chip--danger";
  }

  if (severity === "medium") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}
