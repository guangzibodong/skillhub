"use client";

import { useActionState } from "react";
import { CheckCircle2, RadioTower, Save, Siren, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillSelect, SkillStatusTag } from "@/components/skill-antd";
import type { Locale } from "@/lib/i18n";
import {
  createAdminIncidentAction,
  decideAdminIncidentAction,
  type AdminIncidentActionState
} from "@/lib/admin-incident-actions";
import type { AdminIncidentRecord } from "@/lib/ops-data";

type AdminIncidentManagerProps = {
  incidents: AdminIncidentRecord[];
  locale: Locale;
};

const copy = {
  en: {
    create: "Open incident",
    empty: "No runtime incidents in the queue.",
    incident: "Incident",
    reason: "Decision reason",
    save: "Update incident",
    saving: "Saving",
    resolved: "Resolved",
    severity: "Severity",
    skillSlug: "Skill slug",
    skillSlugPlaceholder: "skill-slug",
    status: "Status",
    summary: "Summary",
    summaryPlaceholder: "What changed, who is affected, and what operators should watch.",
    title: "Runtime incident queue",
    newTitle: "New incident title",
    newTitlePlaceholder: "Incident title",
    notAvailable: "n/a",
    severityLabels: {
      critical: "Critical",
      high: "High",
      low: "Low",
      medium: "Medium"
    },
    statuses: {
      monitoring: "Monitoring",
      open: "Open",
      postmortem: "Postmortem",
      resolved: "Resolved"
    }
  },
  zh: {
    create: "创建事故",
    empty: "当前没有运行事故。",
    incident: "事故",
    reason: "处理原因",
    save: "更新事故",
    saving: "保存中",
    resolved: "解决时间",
    severity: "严重级别",
    skillSlug: "技能 slug",
    skillSlugPlaceholder: "skill-slug",
    status: "状态",
    summary: "摘要",
    summaryPlaceholder: "说明变更内容、影响范围，以及运营需要持续观察的信号。",
    title: "运行事故队列",
    newTitle: "新事故标题",
    newTitlePlaceholder: "事故标题",
    notAvailable: "暂无",
    severityLabels: {
      critical: "严重",
      high: "高",
      low: "低",
      medium: "中"
    },
    statuses: {
      monitoring: "监控中",
      open: "打开",
      postmortem: "复盘",
      resolved: "已解决"
    }
  }
} as const;

const severities = ["low", "medium", "high", "critical"] as const;
const statuses = ["open", "monitoring", "resolved", "postmortem"] as const;

const initialState: AdminIncidentActionState = {
  message: "",
  status: "idle"
};

export function AdminIncidentManager({ incidents, locale }: AdminIncidentManagerProps) {
  const labels = copy[locale];
  const [createState, createAction, isCreatePending] = useActionState(createAdminIncidentAction.bind(null, locale), initialState);
  const [decisionState, decideAction, isDecisionPending] = useActionState(decideAdminIncidentAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel incident-manager-panel">
      <div className="card-kicker">
        <Siren size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={createAction} className="incident-create-form">
        <label>
          <span>{labels.skillSlug}</span>
          <SkillInput name="skillSlug" placeholder={labels.skillSlugPlaceholder} />
        </label>
        <label>
          <span>{labels.newTitle}</span>
          <SkillInput name="title" placeholder={labels.newTitlePlaceholder} required />
        </label>
        <label>
          <span>{labels.severity}</span>
          <SkillSelect defaultValue="medium" name="severity" options={severityOptions(labels)} required />
        </label>
        <label className="incident-create-form__summary">
          <span>{labels.summary}</span>
          <SkillInput name="summary" placeholder={labels.summaryPlaceholder} required />
        </label>
        <SkillButton className="secondary-button secondary-button--compact" disabled={isCreatePending} htmlType="submit">
          <RadioTower size={15} aria-hidden="true" />
          <span>{isCreatePending ? labels.saving : labels.create}</span>
        </SkillButton>
      </form>
      {createState.status !== "idle" ? <ActionMessage state={createState} /> : null}

      <div className="incident-list">
        {incidents.length > 0 ? (
          incidents.map((incident) => {
            const statusMessage = decisionState.incidentId === incident.id ? decisionState : null;

            return (
              <section className="incident-card" key={incident.id}>
                <header className="incident-card__head">
                  <div>
                    <strong>{incident.title}</strong>
                    <span>
                      {incident.skillName} / {incident.skillSlug}
                    </span>
                  </div>
                  <SkillStatusTag className={severityClass(incident.severity)}>{labels.severityLabels[incident.severity]}</SkillStatusTag>
                </header>

                <p>{incident.summary ?? labels.empty}</p>

                <div className="incident-meta">
                  <span>
                    <strong>{labels.status}</strong>
                    {labels.statuses[incident.status]}
                  </span>
                  <span>
                    <strong>{labels.incident}</strong>
                    {formatDate(incident.startedAt, locale)}
                  </span>
                  <span>
                    <strong>{labels.resolved}</strong>
                    {incident.resolvedAt ? formatDate(incident.resolvedAt, locale) : labels.notAvailable}
                  </span>
                </div>

                <form action={decideAction} className="incident-action-form">
                  <input name="incidentId" type="hidden" value={incident.id} />
                  <label>
                    <span>{labels.status}</span>
                    <SkillSelect defaultValue={suggestedStatus(incident)} name="status" options={statusOptions(labels)} required />
                  </label>
                  <label>
                    <span>{labels.severity}</span>
                    <SkillSelect defaultValue={incident.severity} name="severity" options={severityOptions(labels)} required />
                  </label>
                  <label>
                    <span>{labels.reason}</span>
                    <SkillInput defaultValue={incident.summary ?? ""} name="reason" required />
                  </label>
                  <SkillButton className="secondary-button secondary-button--compact" disabled={isDecisionPending} htmlType="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isDecisionPending && statusMessage ? labels.saving : labels.save}</span>
                  </SkillButton>
                </form>

                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
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

function ActionMessage({ state }: { state: AdminIncidentActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}

function severityOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return severities.map((severity) => ({ label: labels.severityLabels[severity], value: severity }));
}

function statusOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return statuses.map((status) => ({ label: labels.statuses[status], value: status }));
}

function suggestedStatus(incident: AdminIncidentRecord) {
  if (incident.status === "open") {
    return "monitoring";
  }

  if (incident.status === "monitoring") {
    return "resolved";
  }

  return incident.status;
}

function severityClass(severity: AdminIncidentRecord["severity"]) {
  if (severity === "critical" || severity === "high") {
    return "status-chip status-chip--danger";
  }

  if (severity === "medium") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

  if (value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
}
