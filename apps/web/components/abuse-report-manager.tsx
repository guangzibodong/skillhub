"use client";

import { useActionState } from "react";
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
    project: "Project",
    reason: "Decision reason",
    reporter: "Reporter",
    save: "Record action",
    saving: "Saving",
    status: "Status",
    title: "Trust and takedown queue",
    visibility: "Listing",
    actions: {
      dismiss: "Dismiss",
      resolve: "Resolve",
      restrict: "Restrict listing",
      suspend: "Suspend skill",
      triage: "Triage",
      warn: "Warn publisher"
    }
  },
  zh: {
    action: "动作",
    category: "分类",
    decided: "处理结果",
    empty: "当前没有信任安全举报。",
    evidence: "证据",
    noEvidence: "无证据链接",
    project: "项目",
    reason: "处理原因",
    reporter: "举报人",
    save: "记录处理",
    saving: "保存中",
    status: "状态",
    title: "信任安全与下架队列",
    visibility: "列表状态",
    actions: {
      dismiss: "驳回",
      resolve: "解决",
      restrict: "限制列表",
      suspend: "暂停技能",
      triage: "进入分诊",
      warn: "警告发布者"
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
                  <span className={severityClass(report.severity)}>{report.severity}</span>
                </header>

                <p>{report.description}</p>

                <div className="abuse-report-meta">
                  <span>
                    <strong>{labels.category}</strong>
                    {report.category}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    {report.status}
                  </span>
                  <span>
                    <strong>{labels.visibility}</strong>
                    {report.skillVisibility} / {report.skillVerificationStatus}
                  </span>
                  <span>
                    <strong>{labels.reporter}</strong>
                    {report.reporterOrganizationName ?? report.reporterEmail ?? "unknown"}
                  </span>
                  <span>
                    <strong>{labels.project}</strong>
                    {report.projectSlug ?? "n/a"}
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

                <form action={action} className="abuse-report-action-form">
                  <input name="reportId" type="hidden" value={report.id} />
                  <label>
                    <span>{labels.action}</span>
                    <select defaultValue={suggestedAction(report)} name="action">
                      {Object.entries(labels.actions).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{labels.reason}</span>
                    <input defaultValue={report.decisionReason ?? ""} name="reason" />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isPending && statusMessage ? labels.saving : labels.save}</span>
                  </button>
                </form>

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

function suggestedAction(report: AbuseReportRecord) {
  if (report.status === "open") {
    return report.severity === "critical" || report.severity === "high" ? "restrict" : "triage";
  }

  if (report.status === "triaged") {
    return "warn";
  }

  return "resolve";
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
