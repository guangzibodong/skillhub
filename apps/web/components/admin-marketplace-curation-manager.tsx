"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ListFilter, Save, Star, XCircle } from "lucide-react";
import { SkillButton, SkillInput, SkillSelect, useSkillModal } from "@/components/skill-antd";
import type { Locale } from "@/lib/i18n";
import {
  decideMarketplaceCurationAppealAction,
  saveMarketplaceCurationAction,
  type MarketplaceCurationAppealActionState,
  type MarketplaceCurationActionState
} from "@/lib/admin-marketplace-curation-actions";
import type { AdminMarketplaceCurationAppealRecord, AdminMarketplaceCurationRecord } from "@/lib/ops-data";

type AdminMarketplaceCurationManagerProps = {
  appeals: AdminMarketplaceCurationAppealRecord[];
  connectionMessage?: string;
  connectionMode: "live" | "missing_token" | "unavailable";
  curation: AdminMarketplaceCurationRecord[];
  locale: Locale;
};

const copy = {
  en: {
    boost: "Exposure weight (-250 to 250)",
    appealActions: {
      approve: "Approve",
      close: "Close",
      reject: "Reject",
      review: "Start review"
    },
    appealReason: "Decision reason",
    appealTitle: "Publisher distribution appeals",
    appealEmpty: "No marketplace distribution appeals waiting for review.",
    chooseAppealAction: "Choose action",
    confirmAppealAction: "Confirm marketplace appeal decision?",
    confirmRanking: "Confirm marketplace ranking change?",
    appealStatuses: {
      approved: "Approved",
      closed: "Closed",
      open: "Open",
      rejected: "Rejected",
      under_review: "Under review"
    },
    calls: "Calls",
    empty: "No marketplace skills available for ranking control.",
    missingToken: "Sign in with an admin or support account to inspect marketplace ranking controls.",
    unavailable: "Marketplace ranking controls are unavailable. Confirm the API is reachable and the latest database migration has run.",
    endsAt: "Ends at",
    feedback: "Feedback",
    installs: "Installs",
    incidents: "Incidents",
    notAvailable: "Not available",
    placement: "Placement",
    quality: "Quality signals",
    reason: "Reason",
    save: "Save ranking",
    saving: "Saving",
    success: "Success",
    targetPlacement: "Target",
    title: "Marketplace ranking controls",
    updated: "Updated",
    verification: "Verification",
    visibility: "Visibility",
    placements: {
      featured: "Featured",
      standard: "Standard",
      suppressed: "Suppressed"
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
    boost: "\u66dd\u5149\u6743\u91cd\uff08-250 \u5230 250\uff09",
    appealActions: {
      approve: "\u901a\u8fc7",
      close: "\u5173\u95ed",
      reject: "\u62d2\u7edd",
      review: "\u5f00\u59cb\u590d\u5ba1"
    },
    appealReason: "\u5904\u7406\u539f\u56e0",
    appealTitle: "\u53d1\u5e03\u8005\u5206\u53d1\u7533\u8bc9",
    appealEmpty: "\u6682\u65e0\u5f85\u590d\u5ba1\u7684\u5e02\u573a\u5206\u53d1\u7533\u8bc9\u3002",
    chooseAppealAction: "\u9009\u62e9\u5904\u7406\u52a8\u4f5c",
    confirmAppealAction: "\u786e\u8ba4\u63d0\u4ea4\u8fd9\u4e2a\u5e02\u573a\u7533\u8bc9\u5904\u7406\u7ed3\u679c\uff1f",
    confirmRanking: "\u786e\u8ba4\u4fdd\u5b58\u8fd9\u6b21\u5e02\u573a\u6392\u540d\u53d8\u66f4\uff1f",
    appealStatuses: {
      approved: "\u5df2\u901a\u8fc7",
      closed: "\u5df2\u5173\u95ed",
      open: "\u5df2\u63d0\u4ea4",
      rejected: "\u5df2\u62d2\u7edd",
      under_review: "\u590d\u5ba1\u4e2d"
    },
    calls: "\u8c03\u7528",
    empty: "\u8fd8\u6ca1\u6709\u53ef\u7ba1\u7406\u7684\u5e02\u573a\u6280\u80fd\u3002",
    missingToken: "请先使用具备 admin/support 角色的账号登录，才能查看市场排名控制。",
    unavailable: "\u5e02\u573a\u6392\u540d\u63a7\u5236\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u786e\u8ba4 API \u53ef\u8fde\u63a5\u4e14\u6700\u65b0\u6570\u636e\u5e93\u8fc1\u79fb\u5df2\u6267\u884c\u3002",
    endsAt: "\u622a\u6b62\u65f6\u95f4",
    feedback: "\u53cd\u9988",
    installs: "\u5b89\u88c5",
    incidents: "\u4e8b\u6545",
    notAvailable: "\u6682\u65e0",
    placement: "\u5c55\u793a\u7b56\u7565",
    quality: "\u8d28\u91cf\u4fe1\u53f7",
    reason: "\u539f\u56e0",
    save: "\u4fdd\u5b58\u6392\u540d",
    saving: "\u4fdd\u5b58\u4e2d",
    success: "\u6210\u529f\u7387",
    targetPlacement: "\u76ee\u6807",
    title: "\u5e02\u573a\u6392\u540d\u63a7\u5236",
    updated: "\u66f4\u65b0",
    verification: "\u5ba1\u6838\u72b6\u6001",
    visibility: "\u53ef\u89c1\u6027",
    placements: {
      featured: "\u7cbe\u9009",
      standard: "\u6807\u51c6",
      suppressed: "\u964d\u6743"
    },
    verificationStatuses: {
      deprecated: "\u5df2\u5e9f\u5f03",
      draft: "\u8349\u7a3f",
      rejected: "\u5df2\u62d2\u7edd",
      submitted: "\u5df2\u63d0\u4ea4",
      suspended: "\u5df2\u6682\u505c",
      verified: "\u5df2\u9a8c\u8bc1"
    },
    visibilityStatuses: {
      private: "\u79c1\u6709",
      public: "\u516c\u5f00",
      unlisted: "\u672a\u5217\u51fa"
    }
  }
} as const;

const placements = ["featured", "standard", "suppressed"] as const;
const initialState: MarketplaceCurationActionState = {
  message: "",
  status: "idle"
};
const initialAppealState: MarketplaceCurationAppealActionState = {
  message: "",
  status: "idle"
};

export function AdminMarketplaceCurationManager({
  appeals,
  connectionMessage,
  connectionMode,
  curation,
  locale
}: AdminMarketplaceCurationManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(saveMarketplaceCurationAction.bind(null, locale), initialState);
  const [appealState, appealAction, isAppealPending] = useActionState(
    decideMarketplaceCurationAppealAction.bind(null, locale),
    initialAppealState
  );
  const sourceMessage =
    connectionMode === "missing_token"
      ? labels.missingToken
      : connectionMode === "unavailable"
        ? connectionMessage ?? labels.unavailable
        : null;

  return (
    <article className="ops-panel marketplace-curation-panel">
      <div className="card-kicker">
        <ListFilter size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      {sourceMessage ? <div className="marketplace-curation-empty marketplace-curation-empty--notice">{sourceMessage}</div> : null}

      <div className="marketplace-curation-appeals" aria-label={labels.appealTitle}>
        <strong>{labels.appealTitle}</strong>
        {appeals.length > 0 ? (
          <div className="marketplace-curation-appeal-list">
            {appeals.map((appeal) => {
              const statusMessage = appealState.appealId === appeal.id ? appealState : null;

              return (
                <section className="marketplace-curation-appeal-card" key={appeal.id}>
                  <header className="marketplace-curation-card__head">
                    <div>
                      <strong>{appeal.skillName}</strong>
                      <span>
                        {appeal.skillSlug} / {appeal.publisherOrganizationName} / SLA {formatDate(appeal.slaDueAt, locale)}
                      </span>
                    </div>
                    <span className={appealStatusClass(appeal.status)}>{formatAppealStatus(appeal.status, labels.appealStatuses)}</span>
                  </header>

                  <div className="marketplace-curation-appeal-body">
                    <p>{appeal.appealReason}</p>
                    {appeal.currentCurationReason ? <small>{appeal.currentCurationReason}</small> : null}
                    {appeal.evidenceUrl ? (
                      <a href={appeal.evidenceUrl} rel="noreferrer" target="_blank">
                        {appeal.evidenceUrl}
                      </a>
                    ) : null}
                  </div>

                  <div className="marketplace-curation-signals" aria-label={labels.quality}>
                    <Signal label={labels.placement} value={`${labels.placements[appeal.currentPlacement]} -> ${labels.placements[appeal.requestedPlacement]}`} />
                    <Signal label={labels.installs} value={formatCompact(appeal.installCount)} />
                    <Signal label={labels.calls} value={formatCompact(appeal.callCount)} />
                    <Signal label={labels.success} value={formatPercent(appeal.successRate)} />
                    <Signal label={labels.feedback} value={String(appeal.feedbackCount)} />
                  </div>

                  <AppealDecisionForm
                    action={appealAction}
                    appeal={appeal}
                    isPending={isAppealPending}
                    isSaving={Boolean(isAppealPending && statusMessage)}
                    labels={labels}
                  />

                  {statusMessage && statusMessage.status !== "idle" ? <AppealActionMessage state={statusMessage} /> : null}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="marketplace-curation-empty">{labels.appealEmpty}</div>
        )}
      </div>

      <div className="marketplace-curation-list">
        {curation.length > 0 ? (
          curation.map((item) => {
            const statusMessage = state.skillSlug === item.skillSlug ? state : null;

            return (
              <section className="marketplace-curation-card" key={item.skillId}>
                <header className="marketplace-curation-card__head">
                  <div>
                    <strong>{item.displayName}</strong>
                    <span>
                        {item.skillSlug} / {formatVerificationStatus(item.verificationStatus, labels)} / {formatVisibilityStatus(item.visibility, labels)}
                    </span>
                  </div>
                  <span className={placementClass(item.placement)}>
                    {item.placement === "featured" ? <Star size={13} aria-hidden="true" /> : null}
                    {labels.placements[item.placement]}
                  </span>
                </header>

                <div className="marketplace-curation-signals" aria-label={labels.quality}>
                  <Signal label={labels.installs} value={formatCompact(item.installCount)} />
                  <Signal label={labels.calls} value={formatCompact(item.invocationCount)} />
                  <Signal label={labels.success} value={formatPercent(item.successRate)} />
                  <Signal label={labels.feedback} value={formatFeedback(item, labels)} />
                  <Signal label={labels.incidents} value={String(item.incidentCount)} />
                </div>

                <RankingControlForm
                  action={action}
                  isPending={isPending}
                  isSaving={Boolean(isPending && statusMessage)}
                  item={item}
                  labels={labels}
                />

                {item.updatedAt ? (
                  <small className="marketplace-curation-updated">
                    {labels.updated}: {formatDate(item.updatedAt, locale)}
                  </small>
                ) : null}
                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
              </section>
            );
          })
        ) : connectionMode === "live" ? (
          <div className="marketplace-curation-empty">{labels.empty}</div>
        ) : null}
      </div>
    </article>
  );
}

type CurationLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function AppealDecisionForm({
  action,
  appeal,
  isPending,
  isSaving,
  labels
}: {
  action: (payload: FormData) => void;
  appeal: AdminMarketplaceCurationAppealRecord;
  isPending: boolean;
  isSaving: boolean;
  labels: CurationLabels;
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const modal = useSkillModal();
  const isSubmitArmed = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedAction) {
      event.preventDefault();
      return;
    }

    if (isSubmitArmed.current) {
      isSubmitArmed.current = false;
      return;
    }

    event.preventDefault();
    const form = event.currentTarget;
    modal.confirm({
      title: labels.confirmAppealAction,
      onOk: () => {
        isSubmitArmed.current = true;
        form.requestSubmit();
      }
    });
  }

  return (
    <form action={action} className="marketplace-curation-form marketplace-curation-form--appeal" onSubmit={handleSubmit}>
      <input name="appealId" type="hidden" value={appeal.id} />
      <label>
        <span>{labels.targetPlacement}</span>
        <SkillSelect
          defaultValue={appeal.requestedPlacement}
          name="placement"
          options={[
            { label: labels.placements.standard, value: "standard" },
            { label: labels.placements.featured, value: "featured" }
          ]}
        />
      </label>
      <label>
        <span>{labels.boost}</span>
        <SkillInput defaultValue={appeal.requestedPlacement === "featured" ? 100 : 0} max={250} min={-250} name="boost" step={1} type="number" />
      </label>
      <label>
        <span>{labels.endsAt}</span>
        <SkillInput name="endsAt" type="datetime-local" />
      </label>
      <label className="marketplace-curation-form__wide">
        <span>{labels.appealReason}</span>
        <SkillInput name="reason" required />
      </label>
      <label>
        <span>{labels.placement}</span>
        <SkillSelect
          name="action"
          onChange={(value) => setSelectedAction(String(value))}
          options={[
            { label: labels.chooseAppealAction, value: "" },
            ...(["review", "approve", "reject", "close"] as const).map((item) => ({
              label: labels.appealActions[item],
              value: item
            }))
          ]}
          required
          value={selectedAction}
        />
      </label>
      <SkillButton className="secondary-button secondary-button--compact" disabled={isPending || !selectedAction} htmlType="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isSaving ? labels.saving : labels.save}</span>
      </SkillButton>
    </form>
  );
}

function RankingControlForm({
  action,
  isPending,
  isSaving,
  item,
  labels
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  isSaving: boolean;
  item: AdminMarketplaceCurationRecord;
  labels: CurationLabels;
}) {
  const modal = useSkillModal();
  const isSubmitArmed = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isSubmitArmed.current) {
      isSubmitArmed.current = false;
      return;
    }

    event.preventDefault();
    const form = event.currentTarget;
    modal.confirm({
      title: labels.confirmRanking,
      onOk: () => {
        isSubmitArmed.current = true;
        form.requestSubmit();
      }
    });
  }

  return (
    <form action={action} className="marketplace-curation-form" onSubmit={handleSubmit}>
      <input name="skillSlug" type="hidden" value={item.skillSlug} />
      <label>
        <span>{labels.placement}</span>
        <SkillSelect
          defaultValue={item.placement}
          name="placement"
          options={placements.map((placement) => ({ label: labels.placements[placement], value: placement }))}
        />
      </label>
      <label>
        <span>{labels.boost}</span>
        <SkillInput defaultValue={item.boost} max={250} min={-250} name="boost" step={1} type="number" />
      </label>
      <label>
        <span>{labels.endsAt}</span>
        <SkillInput defaultValue={toDateTimeLocal(item.endsAt)} name="endsAt" type="datetime-local" />
      </label>
      <label className="marketplace-curation-form__wide">
        <span>{labels.reason}</span>
        <SkillInput defaultValue={item.reason ?? ""} name="reason" required />
      </label>
      <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isSaving ? labels.saving : labels.save}</span>
      </SkillButton>
    </form>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <strong>{value}</strong>
      <small>{label}</small>
    </span>
  );
}

function ActionMessage({ state }: { state: MarketplaceCurationActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function AppealActionMessage({ state }: { state: MarketplaceCurationAppealActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function placementClass(placement: AdminMarketplaceCurationRecord["placement"]) {
  if (placement === "featured") {
    return "status-chip";
  }

  if (placement === "suppressed") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function appealStatusClass(status: AdminMarketplaceCurationAppealRecord["status"]) {
  if (status === "approved") {
    return "status-chip";
  }

  if (status === "rejected" || status === "closed") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--warning";
}

function formatAppealStatus(status: AdminMarketplaceCurationAppealRecord["status"], labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function formatFeedback(item: AdminMarketplaceCurationRecord, labels: CurationLabels) {
  const rating = item.averageRating === null ? labels.notAvailable : item.averageRating.toFixed(1);
  return `${rating} / ${item.feedbackCount}+${item.pendingFeedbackCount}`;
}

function formatVerificationStatus(value: string, labels: CurationLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.verificationStatuses[normalized as keyof typeof labels.verificationStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function formatVisibilityStatus(value: string, labels: CurationLabels) {
  const normalized = value.trim().toLowerCase();
  return labels.visibilityStatuses[normalized as keyof typeof labels.visibilityStatuses] ?? humanizeEnum(value, labels.notAvailable);
}

function humanizeEnum(value: string, fallback: string) {
  const normalized = value.replaceAll("_", " ").trim();
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : fallback;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact"
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    style: "percent"
  }).format(value);
}

function toDateTimeLocal(value: string | null) {
  if (!value || value === "demo") {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function formatDate(value: string, locale: Locale) {
  if (value === "demo") {
    return locale === "zh" ? "\u6f14\u793a\u65f6\u95f4" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
