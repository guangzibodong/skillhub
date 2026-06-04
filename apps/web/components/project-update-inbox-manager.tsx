"use client";

import { useActionState } from "react";
import { Bell, CalendarClock, CheckCircle2, Eye, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectUpdateRecord } from "@/lib/ops-data";
import { updateProjectUpdateAction, type ProjectUpdateActionState } from "@/lib/project-update-actions";

type ProjectUpdateInboxManagerProps = {
  emptyLabel: string;
  locale: Locale;
  noDateLabel: string;
  projectSlug: string;
  titleLabel: string;
  updates: DeveloperProjectUpdateRecord[];
};

const copy = {
  en: {
    acknowledge: "Acknowledge",
    acknowledged: "Acknowledged",
    adopted: "Adopted",
    ignore: "Ignore",
    ignored: "Ignored",
    note: "Decision note",
    open: "Open",
    scheduled: "Scheduled",
    scheduledFor: "Scheduled for",
    schedule: "Schedule",
    saving: "Saving",
    markAdopted: "Adopted"
  },
  zh: {
    acknowledge: "确认",
    acknowledged: "已确认",
    adopted: "已采用",
    ignore: "忽略",
    ignored: "已忽略",
    note: "处理备注",
    open: "待处理",
    scheduled: "已安排",
    scheduledFor: "计划时间",
    schedule: "安排",
    saving: "保存中",
    markAdopted: "已采用"
  }
} as const;

const initialUpdateActionState: ProjectUpdateActionState = {
  message: "",
  status: "idle"
};

export function ProjectUpdateInboxManager({
  emptyLabel,
  locale,
  noDateLabel,
  projectSlug,
  titleLabel,
  updates
}: ProjectUpdateInboxManagerProps) {
  const labels = copy[locale];
  const [updateState, updateAction, isUpdatePending] = useActionState(
    updateProjectUpdateAction.bind(null, projectSlug, locale),
    initialUpdateActionState
  );

  return (
    <section className="ops-panel project-table-panel">
      <div className="card-kicker">
        <Bell size={16} aria-hidden="true" />
        <span>{titleLabel}</span>
      </div>
      <div className="project-update-list">
        {updates.length > 0 ? (
          updates.map((update) => {
            const statusMessage = updateState.updatedUpdateId === update.id ? updateState : null;

            return (
              <article className="project-update-card" key={update.id}>
                <header className="project-update-card__head">
                  <strong>
                    {update.displayName}
                    <small>{update.skillSlug}</small>
                  </strong>
                  <span className={severityClass(update.severity)}>{update.severity}</span>
                </header>
                <div className="project-update-card__body">
                  <span className={actionStatusClass(update.actionStatus)}>{actionStatusLabel(update.actionStatus, locale)}</span>
                  <p>{update.title}</p>
                  {update.body ? <small>{update.body}</small> : null}
                  <small>
                    {formatDateValue(update.createdAt, locale, noDateLabel)}
                    {update.scheduledFor ? ` / ${labels.scheduledFor}: ${formatDateValue(update.scheduledFor, locale, noDateLabel)}` : ""}
                  </small>
                </div>

                <form action={updateAction} className="project-update-action-form">
                  <input name="updateId" type="hidden" value={update.id} />
                  <label>
                    <span>{labels.note}</span>
                    <input defaultValue={update.actionNote ?? ""} name="note" />
                  </label>
                  <label>
                    <span>{labels.scheduledFor}</span>
                    <input defaultValue={toDateTimeLocal(update.scheduledFor)} name="scheduledFor" type="datetime-local" />
                  </label>
                  <div className="project-update-action-buttons">
                    <ActionButton disabled={isUpdatePending} icon="acknowledge" label={labels.acknowledge} status="acknowledged" />
                    <ActionButton disabled={isUpdatePending} icon="schedule" label={labels.schedule} status="scheduled" />
                    <ActionButton disabled={isUpdatePending} icon="adopted" label={labels.markAdopted} status="adopted" />
                    <ActionButton danger disabled={isUpdatePending} icon="ignore" label={labels.ignore} status="ignored" />
                  </div>
                </form>

                {statusMessage && statusMessage.status !== "idle" ? (
                  <div className={statusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{isUpdatePending ? labels.saving : statusMessage.message}</span>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="project-table__row project-table__row--empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
}

function ActionButton({
  danger = false,
  disabled,
  icon,
  label,
  status
}: {
  danger?: boolean;
  disabled: boolean;
  icon: "acknowledge" | "adopted" | "ignore" | "schedule";
  label: string;
  status: "acknowledged" | "scheduled" | "adopted" | "ignored";
}) {
  const Icon = icon === "schedule" ? CalendarClock : icon === "adopted" ? CheckCircle2 : icon === "ignore" ? XCircle : Eye;

  return (
    <button
      className={danger ? "secondary-button secondary-button--compact secondary-button--danger" : "secondary-button secondary-button--compact"}
      disabled={disabled}
      name="status"
      type="submit"
      value={status}
    >
      <Icon size={15} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function severityClass(severity: string) {
  if (["high", "critical"].includes(severity)) {
    return "status-chip status-chip--danger";
  }

  if (["medium", "warning"].includes(severity)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function actionStatusClass(status: string) {
  if (status === "ignored") {
    return "status-chip status-chip--danger";
  }

  if (status === "scheduled" || status === "acknowledged") {
    return "status-chip status-chip--warning";
  }

  if (status === "adopted") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function actionStatusLabel(status: string, locale: Locale) {
  const labels = copy[locale];

  if (status === "acknowledged") {
    return labels.acknowledged;
  }

  if (status === "scheduled") {
    return labels.scheduled;
  }

  if (status === "adopted") {
    return labels.adopted;
  }

  if (status === "ignored") {
    return labels.ignored;
  }

  return labels.open;
}

function formatDateValue(value: string | null | undefined, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value === "demo") {
    return "demo";
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

function toDateTimeLocal(value: string | null | undefined) {
  if (!value || value === "demo") {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
