"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, PauseCircle, RotateCcw, Save, SlidersHorizontal, Trash2, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
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
    close: "Close",
    edit: "Edit policy",
    filesystemAccess: "Filesystem",
    maxPermissionLevel: "Max permission",
    monthlyBudgetDollars: "Monthly budget",
    noSensitiveAccess: "no sensitive access",
    rateLimitPerMinute: "Rate / min",
    remove: "Remove",
    restore: "Restore",
    save: "Save policy",
    saving: "Saving",
    suspend: "Suspend",
    title: "Policy editor"
  },
  zh: {
    allowBrowser: "浏览器",
    allowNetwork: "网络",
    allowSecretAccess: "密钥",
    approvalRequired: "需要负责人审批",
    close: "关闭",
    edit: "编辑策略",
    filesystemAccess: "文件系统",
    maxPermissionLevel: "最高权限",
    monthlyBudgetDollars: "月预算",
    noSensitiveAccess: "无敏感权限",
    rateLimitPerMinute: "每分钟限制",
    remove: "移除",
    restore: "恢复",
    save: "保存策略",
    saving: "保存中",
    suspend: "暂停",
    title: "策略编辑"
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
        <PackageShieldIcon />
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
                      {skill.skillSlug} / {formatVersion(skill.version)}
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
                          skillSlug={skill.skillSlug}
                          status="suspended"
                        />
                        <InstallStatusButton
                          action={installAction}
                          danger
                          disabled={isInstallPending}
                          icon="remove"
                          label={labels.remove}
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
  skillSlug,
  status
}: {
  action: (payload: FormData) => void;
  danger?: boolean;
  disabled: boolean;
  icon: "remove" | "restore" | "suspend";
  label: string;
  skillSlug: string;
  status: "installed" | "suspended" | "removed";
}) {
  const Icon = icon === "remove" ? Trash2 : icon === "restore" ? RotateCcw : PauseCircle;

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

function PackageShieldIcon() {
  return <SlidersHorizontal size={16} aria-hidden="true" />;
}

function installStateLabel(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.status === "suspended") {
    return locale === "zh" ? "安装已暂停" : "Install suspended";
  }

  if (skill.status === "removed") {
    return locale === "zh" ? "已移除" : "Removed";
  }

  return policyStateLabel(skill.policy.state, locale);
}

function policyStateLabel(state: "approved" | "owner_review" | "suspended", locale: Locale) {
  if (state === "suspended") {
    return locale === "zh" ? "已暂停" : "Suspended";
  }

  if (state === "owner_review") {
    return locale === "zh" ? "待负责人审核" : "Owner review";
  }

  return locale === "zh" ? "已批准" : "Approved";
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

function formatVersion(version: string | null) {
  return version ? `v${version}` : "unpinned";
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
    return locale === "zh" ? "免费" : "free";
  }

  if (skill.pricing.billingModel === "subscription") {
    return locale === "zh" ? "订阅" : "subscription";
  }

  return `${formatMoney(skill.pricing.unitAmountCents, skill.pricing.currency)} / call`;
}

function skillAction(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.status === "suspended" || skill.policy.state === "suspended") {
    return locale === "zh" ? "处理暂停原因" : "Resolve suspension";
  }

  if (skill.incidents.openCount > 0) {
    return locale === "zh" ? "排查运行事故" : "Investigate incident";
  }

  if (skill.policy.state === "owner_review") {
    return locale === "zh" ? "审核策略权限" : "Approve policy";
  }

  if (skill.updates.count > 0) {
    return locale === "zh" ? "评估版本更新" : "Review update";
  }

  if (skill.runtime.successRate !== null && skill.runtime.successRate < 0.95) {
    return locale === "zh" ? "优化调用质量" : "Improve runtime quality";
  }

  return locale === "zh" ? "持续监控" : "Monitor";
}
