"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, PauseCircle, RotateCcw, Save, SlidersHorizontal, Trash2, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { ProjectSensitiveActionForm } from "@/components/project-sensitive-action-form";
import { updateProjectSkillInstallStatusAction, type ProjectInstallActionState } from "@/lib/project-install-actions";
import { updateProjectSkillPolicyAction, type ProjectPolicyActionState } from "@/lib/project-policy-actions";
import type { DeveloperProjectSkillRecord } from "@/lib/ops-data";
import { formatCompactNumber, formatMoney, formatPercent } from "@/lib/ops-format";

type ProjectSkillPolicyManagerProps = {
  emptyLabel: string;
  headers: readonly string[];
  locale: Locale;
  noDateLabel: string;
  projectSlug: string;
  skills: DeveloperProjectSkillRecord[];
  titleLabel: string;
};

const copy = {
  en: {
    allowBrowser: "Browser",
    allowNetwork: "Network",
    allowSecretAccess: "Secrets",
    approvalRequired: "Require owner approval",
    approved: "Approved",
    close: "Close",
    edit: "Edit policy",
    filesystemAccess: "Filesystem",
    free: "free",
    improveRuntime: "Improve runtime quality",
    installSuspended: "Install suspended",
    investigateIncident: "Investigate incident",
    maxPermissionLevel: "Max permission",
    monitor: "Monitor",
    monthlyBudgetDollars: "Monthly budget",
    noSensitiveAccess: "no sensitive access",
    ownerReview: "Approve policy",
    rateLimitPerMinute: "Rate / min",
    removed: "Removed",
    remove: "Remove",
    resolveSuspension: "Resolve suspension",
    restore: "Restore",
    reviewUpdate: "Review update",
    save: "Save policy",
    saving: "Saving",
    subscription: "subscription",
    suspended: "Suspended",
    suspend: "Suspend",
    title: "Policy editor",
    unpinned: "unpinned"
  },
  zh: {
    allowBrowser: "浏览器",
    allowNetwork: "网络",
    allowSecretAccess: "密钥",
    approvalRequired: "需要负责人审批",
    approved: "已批准",
    close: "关闭",
    edit: "编辑策略",
    filesystemAccess: "文件系统",
    free: "免费",
    improveRuntime: "优化运行质量",
    installSuspended: "安装已暂停",
    investigateIncident: "排查运行事故",
    maxPermissionLevel: "最高权限",
    monitor: "持续监控",
    monthlyBudgetDollars: "月预算",
    noSensitiveAccess: "无敏感权限",
    ownerReview: "审批策略权限",
    rateLimitPerMinute: "每分钟限制",
    removed: "已移除",
    remove: "移除",
    resolveSuspension: "处理暂停原因",
    restore: "恢复",
    reviewUpdate: "评估版本更新",
    save: "保存策略",
    saving: "保存中",
    subscription: "订阅",
    suspended: "已暂停",
    suspend: "暂停",
    title: "策略编辑",
    unpinned: "未固定"
  }
} as const;

const sensitiveCopy = {
  en: {
    cancel: "Cancel",
    confirm: "Confirmation",
    policyConfirmPlaceholder: "Type POLICY",
    policyDescription:
      "Policy changes can expand runtime permissions, budget, and owner-approval behavior for this project. Record why the change is safe before saving.",
    policyReasonPlaceholder: "Owner approval, budget review, runtime incident response, or security exception",
    reason: "Reason",
    removeConfirmPlaceholder: "Type REMOVE",
    removeDescription: "Removing an installed skill blocks runtime calls and keeps the install only for audit and possible restoration.",
    removeReasonPlaceholder: "Skill retired, no longer used by this project, or replacement installed",
    suspendConfirmPlaceholder: "Type SUSPEND",
    suspendDescription: "Suspending an installed skill keeps it visible but immediately blocks runtime calls for this project.",
    suspendReasonPlaceholder: "Incident triage, permission review, budget protection, or owner request"
  },
  zh: {
    cancel: "\u53d6\u6d88",
    confirm: "\u786e\u8ba4\u77ed\u8bed",
    policyConfirmPlaceholder: "\u8f93\u5165 POLICY",
    policyDescription:
      "\u9879\u76ee\u7b56\u7565\u53d8\u66f4\u53ef\u80fd\u6269\u5927\u8fd0\u884c\u6743\u9650\u3001\u9884\u7b97\u548c\u8d1f\u8d23\u4eba\u5ba1\u6279\u884c\u4e3a\u3002\u4fdd\u5b58\u524d\u8bf7\u8bb0\u5f55\u4e3a\u4ec0\u4e48\u8fd9\u6b21\u53d8\u66f4\u662f\u5b89\u5168\u7684\u3002",
    policyReasonPlaceholder: "\u8d1f\u8d23\u4eba\u5ba1\u6279\u3001\u9884\u7b97\u590d\u6838\u3001\u8fd0\u884c\u4e8b\u6545\u5904\u7406\u6216\u5b89\u5168\u4f8b\u5916",
    reason: "\u539f\u56e0",
    removeConfirmPlaceholder: "\u8f93\u5165 REMOVE",
    removeDescription: "\u79fb\u9664\u5df2\u5b89\u88c5\u6280\u80fd\u4f1a\u963b\u65ad\u8fd0\u884c\u8c03\u7528\uff0c\u4ec5\u4fdd\u7559\u5ba1\u8ba1\u548c\u6062\u590d\u72b6\u6001\u3002",
    removeReasonPlaceholder: "\u6280\u80fd\u4e0b\u7ebf\u3001\u9879\u76ee\u4e0d\u518d\u4f7f\u7528\uff0c\u6216\u5df2\u5b89\u88c5\u66ff\u4ee3\u65b9\u6848",
    suspendConfirmPlaceholder: "\u8f93\u5165 SUSPEND",
    suspendDescription: "\u6682\u505c\u5df2\u5b89\u88c5\u6280\u80fd\u4f1a\u4fdd\u7559\u53ef\u89c1\u72b6\u6001\uff0c\u4f46\u7acb\u5373\u963b\u65ad\u8be5\u9879\u76ee\u7684\u8fd0\u884c\u8c03\u7528\u3002",
    suspendReasonPlaceholder: "\u4e8b\u6545\u6392\u67e5\u3001\u6743\u9650\u590d\u6838\u3001\u9884\u7b97\u4fdd\u62a4\u6216\u8d1f\u8d23\u4eba\u8981\u6c42"
  }
} as const;

const initialPolicyState: ProjectPolicyActionState = {
  message: "",
  status: "idle"
};

const initialInstallState: ProjectInstallActionState = {
  message: "",
  status: "idle"
};

export function ProjectSkillPolicyManager({
  emptyLabel,
  headers,
  locale,
  noDateLabel,
  projectSlug,
  skills,
  titleLabel
}: ProjectSkillPolicyManagerProps) {
  const labels = copy[locale];
  const sensitiveLabels = sensitiveCopy[locale];
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [policyState, policyAction, isPolicyPending] = useActionState(
    updateProjectSkillPolicyAction.bind(null, projectSlug, locale),
    initialPolicyState
  );
  const [installState, installAction, isInstallPending] = useActionState(
    updateProjectSkillInstallStatusAction.bind(null, projectSlug, locale),
    initialInstallState
  );

  return (
    <article className="ops-panel project-table-panel">
      <div className="card-kicker">
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>{titleLabel}</span>
      </div>
      <div className="project-table">
        <div className="project-table__row project-table__row--head project-skill-row project-skill-row--actions">
          {headers.map((header) => (
            <span key={header}>{header}</span>
          ))}
          <span>{labels.edit}</span>
        </div>
        {skills.length > 0 ? (
          skills.map((skill) => {
            const isEditing = editingSlug === skill.skillSlug;
            const statusMessage = policyState.updatedSkillSlug === skill.skillSlug ? policyState : null;
            const installStatusMessage = installState.updatedSkillSlug === skill.skillSlug ? installState : null;

            return (
              <div className="policy-skill-block" key={skill.skillSlug}>
                <div className="project-table__row project-skill-row project-skill-row--actions">
                  <strong>
                    {skill.displayName}
                    <small>
                      {skill.skillSlug} / {formatVersion(skill.version, locale)}
                    </small>
                  </strong>
                  <span>
                    <b className={statusChipClass(skill.status === "installed" ? skill.policy.state : skill.status)}>
                      {installStateLabel(skill, locale)}
                    </b>
                    <small>{formatCapabilities(skill, locale)}</small>
                  </span>
                  <span>
                    {formatCompactNumber(skill.runtime.callCount)} / {formatPercent(skill.runtime.successRate)}
                    <small>{formatLatency(skill.runtime.avgLatencyMs, noDateLabel)}</small>
                  </span>
                  <span>
                    {formatMoney(skill.usage.grossCents, skill.usage.currency)}
                    <small>{pricingLabel(skill, locale)}</small>
                  </span>
                  <span>{skillAction(skill, locale)}</span>
                  <span className="skill-status-actions">
                    <button
                      className="secondary-button secondary-button--compact"
                      onClick={() => setEditingSlug(isEditing ? null : skill.skillSlug)}
                      type="button"
                    >
                      {isEditing ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                      <span>{isEditing ? labels.close : labels.edit}</span>
                    </button>
                    {skill.status === "installed" ? (
                      <>
                        <InstallStatusButton
                          action={installAction}
                          disabled={isInstallPending}
                          icon="suspend"
                          label={labels.suspend}
                          sensitiveLabels={sensitiveLabels}
                          skillSlug={skill.skillSlug}
                          status="suspended"
                        />
                        <InstallStatusButton
                          action={installAction}
                          danger
                          disabled={isInstallPending}
                          icon="remove"
                          label={labels.remove}
                          sensitiveLabels={sensitiveLabels}
                          skillSlug={skill.skillSlug}
                          status="removed"
                        />
                      </>
                    ) : (
                      <InstallStatusButton
                        action={installAction}
                        disabled={isInstallPending}
                        icon="restore"
                        label={labels.restore}
                        skillSlug={skill.skillSlug}
                        status="installed"
                      />
                    )}
                  </span>
                </div>

                {installStatusMessage && installStatusMessage.status !== "idle" ? (
                  <div className={installStatusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {installStatusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{installStatusMessage.message}</span>
                  </div>
                ) : null}

                {statusMessage && statusMessage.status !== "idle" ? (
                  <div className={statusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{statusMessage.message}</span>
                  </div>
                ) : null}

                {isEditing ? (
                  <form action={policyAction} className="policy-editor">
                    <input name="skillSlug" type="hidden" value={skill.skillSlug} />
                    <label>
                      <span>{labels.maxPermissionLevel}</span>
                      <select defaultValue={skill.policy.maxPermissionLevel} name="maxPermissionLevel">
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </label>
                    <label>
                      <span>{labels.filesystemAccess}</span>
                      <select defaultValue={skill.policy.filesystemAccess} name="filesystemAccess">
                        <option value="none">none</option>
                        <option value="read">read</option>
                        <option value="write">write</option>
                      </select>
                    </label>
                    <label>
                      <span>{labels.monthlyBudgetDollars}</span>
                      <input
                        defaultValue={(skill.policy.monthlyBudgetCents / 100).toFixed(0)}
                        min="0"
                        name="monthlyBudgetDollars"
                        step="1"
                        type="number"
                      />
                    </label>
                    <label>
                      <span>{labels.rateLimitPerMinute}</span>
                      <input
                        defaultValue={skill.policy.rateLimitPerMinute ?? ""}
                        min="1"
                        name="rateLimitPerMinute"
                        step="1"
                        type="number"
                      />
                    </label>
                    <label className="policy-checkbox">
                      <input defaultChecked={skill.policy.allowNetwork} name="allowNetwork" type="checkbox" />
                      <span>{labels.allowNetwork}</span>
                    </label>
                    <label className="policy-checkbox">
                      <input defaultChecked={skill.policy.allowBrowser} name="allowBrowser" type="checkbox" />
                      <span>{labels.allowBrowser}</span>
                    </label>
                    <label className="policy-checkbox">
                      <input defaultChecked={skill.policy.allowSecretAccess} name="allowSecretAccess" type="checkbox" />
                      <span>{labels.allowSecretAccess}</span>
                    </label>
                    <label className="policy-checkbox">
                      <input defaultChecked={skill.policy.approvalRequired} name="approvalRequired" type="checkbox" />
                      <span>{labels.approvalRequired}</span>
                    </label>
                    <div className="policy-sensitive-review">
                      <p>{sensitiveLabels.policyDescription}</p>
                      <label>
                        <span>{sensitiveLabels.confirm}</span>
                        <input autoComplete="off" name="confirmation" placeholder={sensitiveLabels.policyConfirmPlaceholder} required />
                      </label>
                      <label>
                        <span>{sensitiveLabels.reason}</span>
                        <textarea name="reason" placeholder={sensitiveLabels.policyReasonPlaceholder} required rows={2} />
                      </label>
                    </div>
                    <button className="primary-button policy-editor__save" disabled={isPolicyPending} type="submit">
                      <Save size={16} aria-hidden="true" />
                      <span>{isPolicyPending ? labels.saving : labels.save}</span>
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="project-table__row project-table__row--empty">{emptyLabel}</div>
        )}
      </div>
    </article>
  );
}

function InstallStatusButton({
  action,
  danger = false,
  disabled,
  icon,
  label,
  sensitiveLabels,
  skillSlug,
  status
}: {
  action: (payload: FormData) => void;
  danger?: boolean;
  disabled: boolean;
  icon: "remove" | "restore" | "suspend";
  label: string;
  sensitiveLabels?: (typeof sensitiveCopy)["en"] | (typeof sensitiveCopy)["zh"];
  skillSlug: string;
  status: "installed" | "suspended" | "removed";
}) {
  const Icon = icon === "remove" ? Trash2 : icon === "restore" ? RotateCcw : PauseCircle;

  if (sensitiveLabels && status !== "installed") {
    const isRemove = status === "removed";

    return (
      <ProjectSensitiveActionForm
        action={action}
        cancelLabel={sensitiveLabels.cancel}
        confirmLabel={sensitiveLabels.confirm}
        confirmPlaceholder={isRemove ? sensitiveLabels.removeConfirmPlaceholder : sensitiveLabels.suspendConfirmPlaceholder}
        description={isRemove ? sensitiveLabels.removeDescription : sensitiveLabels.suspendDescription}
        disabled={disabled}
        hiddenFields={{
          skillSlug,
          status
        }}
        icon={Icon}
        label={label}
        reasonLabel={sensitiveLabels.reason}
        reasonPlaceholder={isRemove ? sensitiveLabels.removeReasonPlaceholder : sensitiveLabels.suspendReasonPlaceholder}
        submitLabel={label}
        tone={isRemove ? "danger" : "warning"}
      />
    );
  }

  return (
    <form action={action} className="skill-status-action-form">
      <input name="skillSlug" type="hidden" value={skillSlug} />
      <input name="status" type="hidden" value={status} />
      <button
        className={danger ? "secondary-button secondary-button--compact secondary-button--danger" : "secondary-button secondary-button--compact"}
        disabled={disabled}
        type="submit"
      >
        <Icon size={15} aria-hidden="true" />
        <span>{label}</span>
      </button>
    </form>
  );
}

function installStateLabel(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.status === "suspended") {
    return copy[locale].installSuspended;
  }

  if (skill.status === "removed") {
    return copy[locale].removed;
  }

  return policyStateLabel(skill.policy.state, locale);
}

function policyStateLabel(state: "approved" | "owner_review" | "suspended", locale: Locale) {
  if (state === "suspended") {
    return copy[locale].suspended;
  }

  if (state === "owner_review") {
    return copy[locale].ownerReview;
  }

  return copy[locale].approved;
}

function statusChipClass(status: string) {
  if (["error", "failed", "suspended", "revoked", "rejected", "blocked"].includes(status)) {
    return "status-chip status-chip--danger";
  }

  if (["owner_review", "warning_needs_response", "pending", "trialing", "submitted"].includes(status)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip";
}

function formatVersion(version: string | null, locale: Locale) {
  return version ? `v${version}` : copy[locale].unpinned;
}

function formatLatency(ms: number | null | undefined, fallback: string) {
  if (ms === null || ms === undefined) {
    return fallback;
  }

  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(ms)} ms`;
}

function formatCapabilities(skill: DeveloperProjectSkillRecord, locale: Locale) {
  const items = [
    skill.policy.allowNetwork ? "network" : null,
    skill.policy.allowBrowser ? "browser" : null,
    skill.policy.filesystemAccess !== "none" ? `fs:${skill.policy.filesystemAccess}` : null,
    skill.policy.allowSecretAccess ? "secrets" : null
  ].filter(Boolean);

  if (items.length === 0) {
    return copy[locale].noSensitiveAccess;
  }

  return items.join(" / ");
}

function pricingLabel(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.pricing.billingModel === "free") {
    return copy[locale].free;
  }

  if (skill.pricing.billingModel === "subscription") {
    return copy[locale].subscription;
  }

  return `${formatMoney(skill.pricing.unitAmountCents, skill.pricing.currency)} / call`;
}

function skillAction(skill: DeveloperProjectSkillRecord, locale: Locale) {
  const labels = copy[locale];

  if (skill.status === "suspended" || skill.policy.state === "suspended") {
    return labels.resolveSuspension;
  }

  if (skill.incidents.openCount > 0) {
    return labels.investigateIncident;
  }

  if (skill.policy.state === "owner_review") {
    return labels.ownerReview;
  }

  if (skill.updates.count > 0) {
    return labels.reviewUpdate;
  }

  if (skill.runtime.successRate !== null && skill.runtime.successRate < 0.95) {
    return labels.improveRuntime;
  }

  return labels.monitor;
}
