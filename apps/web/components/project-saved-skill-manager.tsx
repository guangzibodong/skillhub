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
    remove: "Remove",
    saving: "Saving",
    skillSlug: "Skill slug",
    subscription: "subscription"
  },
  zh: {
    add: "保存技能",
    collection: "集合",
    defaultCollection: "default",
    free: "免费",
    remove: "移除",
    saving: "保存中",
    skillSlug: "技能 slug",
    subscription: "订阅"
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
                  <span className={statusChipClass(savedSkill.verificationStatus)}>{savedSkill.verificationStatus}</span>
                  <span className="status-chip status-chip--neutral">{savedSkill.permissionLevel}</span>
                  {savedSkill.installedStatus ? <span className="status-chip">{savedSkill.installedStatus}</span> : null}
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

  return `${formatMoney(savedSkill.pricing.unitAmountCents, savedSkill.pricing.currency)} / call`;
}

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format(cents / 100);
}
