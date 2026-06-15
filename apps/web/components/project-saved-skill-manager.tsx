"use client";

import { useActionState } from "react";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectSavedSkillRecord } from "@/lib/ops-data";
import {
  removeProjectSavedSkillAction,
  saveProjectSavedSkillAction,
  type ProjectSavedSkillActionState
} from "@/lib/project-saved-skill-actions";

type ProjectSavedSkillManagerProps = {
  emptyLabel: string;
  locale: Locale;
  projectSlug: string;
  savedSkills: DeveloperProjectSavedSkillRecord[];
  titleLabel: string;
};

const copy = {
  en: {
    add: "Save skill",
    collection: "Collection",
    defaultCollection: "default",
    free: "free",
    notAvailable: "Not available",
    perCall: "call",
    remove: "Remove",
    saving: "Saving",
    skillSlug: "Skill slug",
    subscription: "subscription",
    installedStatuses: {
      approved: "Approved",
      installed: "Installed",
      pending: "Pending",
      rejected: "Rejected",
      saved: "Saved"
    },
    permissionLevels: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk"
    },
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    }
  },
  zh: {
    add: "保存技能",
    collection: "集合",
    defaultCollection: "default",
    free: "免费",
    notAvailable: "暂无",
    perCall: "次",
    remove: "移除",
    saving: "保存中",
    skillSlug: "技能 slug",
    subscription: "订阅",
    installedStatuses: {
      approved: "已批准",
      installed: "已安装",
      pending: "待处理",
      rejected: "已拒绝",
      saved: "已保存"
    },
    permissionLevels: {
      high: "高风险",
      low: "低风险",
      medium: "中风险"
    },
    verificationStatuses: {
      deprecated: "已废弃",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    }
  }
} as const;

const initialSavedSkillState: ProjectSavedSkillActionState = {
  message: "",
  status: "idle"
};

export function ProjectSavedSkillManager({
  emptyLabel,
  locale,
  projectSlug,
  savedSkills,
  titleLabel
}: ProjectSavedSkillManagerProps) {
  const labels = copy[locale];
  const [saveState, saveAction, isSavePending] = useActionState(
    saveProjectSavedSkillAction.bind(null, locale, projectSlug),
    initialSavedSkillState
  );
  const [removeState, removeAction, isRemovePending] = useActionState(
    removeProjectSavedSkillAction.bind(null, locale, projectSlug),
    initialSavedSkillState
  );

  return (
    <article className="ops-panel project-saved-skill-panel">
      <div className="card-kicker">
        <Bookmark size={16} aria-hidden="true" />
        <span>{titleLabel}</span>
      </div>

      <form action={saveAction} className="project-saved-skill-form">
        <label>
          <span>{labels.skillSlug}</span>
          <input name="skillSlug" placeholder="browser-research" required />
        </label>
        <label>
          <span>{labels.collection}</span>
          <input defaultValue={labels.defaultCollection} name="collectionName" />
        </label>
        <button className="secondary-button" disabled={isSavePending} type="submit">
          <Plus size={15} aria-hidden="true" />
          <span>{isSavePending ? labels.saving : labels.add}</span>
        </button>
      </form>

      {saveState.status !== "idle" ? <ActionMessage state={saveState} /> : null}

      <div className="project-saved-skill-list">
        {savedSkills.length > 0 ? (
          savedSkills.map((savedSkill) => {
            const statusMessage = removeState.savedSkillId === savedSkill.id ? removeState : null;

            return (
              <div className="project-saved-skill-card" key={savedSkill.id}>
                <div>
                  <strong>{savedSkill.displayName}</strong>
                  <span>
                    {savedSkill.skillSlug} / {savedSkill.collectionName}
                  </span>
                </div>
                <div className="project-saved-skill-card__meta">
                  <span className={statusChipClass(savedSkill.verificationStatus)}>{formatVerificationStatus(savedSkill.verificationStatus, labels)}</span>
                  <span className="status-chip status-chip--neutral">{formatPermissionLevel(savedSkill.permissionLevel, labels)}</span>
                  {savedSkill.installedStatus ? <span className="status-chip">{formatInstalledStatus(savedSkill.installedStatus, labels)}</span> : null}
                </div>
                <small>{pricingLabel(savedSkill, locale)}</small>
                <form action={removeAction}>
                  <input name="savedSkillId" type="hidden" value={savedSkill.id} />
                  <button className="ghost-button ghost-button--danger" disabled={isRemovePending} type="submit">
                    <Trash2 size={15} aria-hidden="true" />
                    <span>{labels.remove}</span>
                  </button>
                </form>
                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
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

function ActionMessage({ state }: { state: ProjectSavedSkillActionState }) {
  return <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>{state.message}</div>;
}

function statusChipClass(status: string) {
  if (["rejected", "suspended"].includes(status)) {
    return "status-chip status-chip--danger";
  }

  if (["draft", "submitted"].includes(status)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip";
}

function pricingLabel(savedSkill: DeveloperProjectSavedSkillRecord, locale: Locale) {
  const labels = copy[locale];

  if (savedSkill.pricing.billingModel === "free") {
    return labels.free;
  }

  if (savedSkill.pricing.billingModel === "subscription") {
    return labels.subscription;
  }

  return `${formatMoney(savedSkill.pricing.unitAmountCents, savedSkill.pricing.currency)} / ${labels.perCall}`;
}

type SavedSkillLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function formatVerificationStatus(value: string, labels: SavedSkillLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.verificationStatuses[normalized as keyof typeof labels.verificationStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function formatPermissionLevel(value: string, labels: SavedSkillLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.permissionLevels[normalized as keyof typeof labels.permissionLevels] ?? humanizeEnum(value, labels.notAvailable);
}

function formatInstalledStatus(value: string, labels: SavedSkillLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.installedStatuses[normalized as keyof typeof labels.installedStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function humanizeEnum(value: string, fallback: string) {
  const normalized = value.replaceAll("_", " ").trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : fallback;
}

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format(cents / 100);
}
