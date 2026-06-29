"use client";

import { useActionState } from "react";
import { Bell, CalendarClock, CheckCircle2, Eye, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillStatusTag } from "@/components/skill-antd";
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
    adoptVersion: "Adopt version",
    adopted: "Adopted",
    adoptionReady: "Ready to adopt",
    awaitingReview: "Awaiting review",
    currentVersion: "Current",
    ignore: "Ignore",
    ignored: "Ignored",
    markHandled: "Mark handled",
    missingVersion: "Missing target version",
    note: "Decision note",
    notVersionUpdate: "Operational update",
    open: "Open",
    removedInstall: "Removed install",
    scheduled: "Scheduled",
    scheduledFor: "Scheduled for",
    schedule: "Schedule",
    saving: "Saving",
    targetReview: "Review",
    targetVersion: "Target"
  },
  zh: {
    acknowledge: "确认",
    acknowledged: "已确认",
    adoptVersion: "采用版本",
    adopted: "已采用",
    adoptionReady: "可采用",
    awaitingReview: "等待审核",
    currentVersion: "当前",
    ignore: "忽略",
    ignored: "已忽略",
    markHandled: "标记已处理",
    missingVersion: "缺少目标版本",
    note: "处理备注",
    notVersionUpdate: "运营更新",
    open: "待处理",
    removedInstall: "安装已移除",
    scheduled: "已安排",
    scheduledFor: "计划时间",
    schedule: "安排",
    saving: "保存中",
    targetReview: "审核",
    targetVersion: "目标"
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
            const isVersionUpdate = update.eventType === "new_version";
            const canAdopt = !isVersionUpdate || update.adoptionState === "ready";
            const adoptLabel = isVersionUpdate ? labels.adoptVersion : labels.markHandled;

            return (
              <article className="project-update-card" key={update.id}>
                <header className="project-update-card__head">
                  <strong>
                    {update.displayName}
                    <small>{update.skillSlug}</small>
                  </strong>
                  <SkillStatusTag className={severityClass(update.severity)}>{update.severity}</SkillStatusTag>
                </header>
                <div className="project-update-card__body">
                  <SkillStatusTag className={actionStatusClass(update.actionStatus)}>{actionStatusLabel(update.actionStatus, locale)}</SkillStatusTag>
                  <p>{update.title}</p>
                  {update.body ? <small>{update.body}</small> : null}
                  <div className="project-update-version-line">
                    <span>
                      {labels.currentVersion}: {update.currentVersion ?? "-"}
                    </span>
                    <span>
                      {labels.targetVersion}: {update.targetVersion ?? "-"}
                    </span>
                    <span>
                      {labels.targetReview}: {update.targetReviewStatus ?? adoptionStatusLabel(update.adoptionState, labels)}
                    </span>
                  </div>
                  <small>
                    {formatDateValue(update.createdAt, locale, noDateLabel)}
                    {update.scheduledFor ? ` / ${labels.scheduledFor}: ${formatDateValue(update.scheduledFor, locale, noDateLabel)}` : ""}
                  </small>
                </div>

                <form action={updateAction} className="project-update-action-form">
                  <input name="updateId" type="hidden" value={update.id} />
                  <label>
                    <span>{labels.note}</span>
                    <SkillInput defaultValue={update.actionNote ?? ""} name="note" />
                  </label>
                  <label>
                    <span>{labels.scheduledFor}</span>
                    <SkillInput defaultValue={toDateTimeLocal(update.scheduledFor)} name="scheduledFor" type="datetime-local" />
                  </label>
                  <div className="project-update-action-buttons">
                    <ActionButton disabled={isUpdatePending} icon="acknowledge" label={labels.acknowledge} status="acknowledged" />
                    <ActionButton disabled={isUpdatePending} icon="schedule" label={labels.schedule} status="scheduled" />
                    <ActionButton disabled={isUpdatePending || !canAdopt} icon="adopted" label={adoptLabel} status="adopted" />
                    <ActionButton danger disabled={isUpdatePending} icon="ignore" label={labels.ignore} status="ignored" />
                  </div>
                  {isVersionUpdate && !canAdopt ? (
                    <small className="project-update-action-hint">{adoptionStatusLabel(update.adoptionState, labels)}</small>
                  ) : null}
                </form>

                {statusMessage && statusMessage.status !== "idle" ? (
                  <SkillAlert className="action-message" icon={statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={isUpdatePending ? labels.saving : statusMessage.message} type={statusMessage.status === "success" ? "success" : "error"} />
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
    <SkillButton
      className={danger ? "secondary-button secondary-button--compact secondary-button--danger" : "secondary-button secondary-button--compact"}
      disabled={disabled}
      htmlType="submit"
      name="status"
      value={status}
    >
      <Icon size={15} aria-hidden="true" />
      <span>{label}</span>
    </SkillButton>
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

function adoptionStatusLabel(status: string, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  if (status === "ready") {
    return labels.adoptionReady;
  }

  if (status === "awaiting_review") {
    return labels.awaitingReview;
  }

  if (status === "missing_version") {
    return labels.missingVersion;
  }

  if (status === "removed_install") {
    return labels.removedInstall;
  }

  return labels.notVersionUpdate;
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
