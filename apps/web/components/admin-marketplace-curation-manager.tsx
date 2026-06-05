"use client";

import { useActionState } from "react";
import { CheckCircle2, ListFilter, Save, Star, XCircle } from "lucide-react";
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
    appealStatuses: {
      approved: "Approved",
      closed: "Closed",
      open: "Open",
      rejected: "Rejected",
      under_review: "Under review"
    },
    calls: "Calls",
    empty: "No marketplace skills available for ranking control.",
    missingToken: "Sign in with an admin/support token to inspect marketplace ranking controls.",
    unavailable: "Marketplace ranking controls are unavailable. Confirm the API is reachable and the latest database migration has run.",
    endsAt: "Ends at",
    feedback: "Feedback",
    installs: "Installs",
    incidents: "Incidents",
    placement: "Placement",
    quality: "Quality signals",
    reason: "Reason",
    save: "Save ranking",
    saving: "Saving",
    success: "Success",
    targetPlacement: "Target",
    title: "Marketplace ranking controls",
    updated: "Updated",
    placements: {
      featured: "Featured",
      standard: "Standard",
      suppressed: "Suppressed"
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
    appealStatuses: {
      approved: "\u5df2\u901a\u8fc7",
      closed: "\u5df2\u5173\u95ed",
      open: "\u5df2\u63d0\u4ea4",
      rejected: "\u5df2\u62d2\u7edd",
      under_review: "\u590d\u5ba1\u4e2d"
    },
    calls: "\u8c03\u7528",
    empty: "\u8fd8\u6ca1\u6709\u53ef\u7ba1\u7406\u7684\u5e02\u573a\u6280\u80fd\u3002",
    missingToken: "\u8bf7\u5148\u7528 admin/support token \u767b\u5f55\uff0c\u624d\u80fd\u67e5\u770b\u5e02\u573a\u6392\u540d\u63a7\u5236\u3002",
    unavailable: "\u5e02\u573a\u6392\u540d\u63a7\u5236\u6682\u4e0d\u53ef\u7528\uff0c\u8bf7\u786e\u8ba4 API \u53ef\u8fde\u63a5\u4e14\u6700\u65b0\u6570\u636e\u5e93\u8fc1\u79fb\u5df2\u6267\u884c\u3002",
    endsAt: "\u622a\u6b62\u65f6\u95f4",
    feedback: "\u53cd\u9988",
    installs: "\u5b89\u88c5",
    incidents: "\u4e8b\u6545",
    placement: "\u5c55\u793a\u7b56\u7565",
    quality: "\u8d28\u91cf\u4fe1\u53f7",
    reason: "\u539f\u56e0",
    save: "\u4fdd\u5b58\u6392\u540d",
    saving: "\u4fdd\u5b58\u4e2d",
    success: "\u6210\u529f\u7387",
    targetPlacement: "\u76ee\u6807",
    title: "\u5e02\u573a\u6392\u540d\u63a7\u5236",
    updated: "\u66f4\u65b0",
    placements: {
      featured: "\u7cbe\u9009",
      standard: "\u6807\u51c6",
      suppressed: "\u964d\u6743"
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

                  <form action={appealAction} className="marketplace-curation-form marketplace-curation-form--appeal">
                    <input name="appealId" type="hidden" value={appeal.id} />
                    <label>
                      <span>{labels.targetPlacement}</span>
                      <select defaultValue={appeal.requestedPlacement} name="placement">
                        <option value="standard">{labels.placements.standard}</option>
                        <option value="featured">{labels.placements.featured}</option>
                      </select>
                    </label>
                    <label>
                      <span>{labels.boost}</span>
                      <input defaultValue={appeal.requestedPlacement === "featured" ? 100 : 0} max={250} min={-250} name="boost" step={1} type="number" />
                    </label>
                    <label>
                      <span>{labels.endsAt}</span>
                      <input name="endsAt" type="datetime-local" />
                    </label>
                    <label className="marketplace-curation-form__wide">
                      <span>{labels.appealReason}</span>
                      <input name="reason" required />
                    </label>
                    <label>
                      <span>{labels.placement}</span>
                      <select defaultValue="review" name="action">
                        {(["review", "approve", "reject", "close"] as const).map((item) => (
                          <option key={item} value={item}>
                            {labels.appealActions[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="secondary-button secondary-button--compact" disabled={isAppealPending} type="submit">
                      <Save size={15} aria-hidden="true" />
                      <span>{isAppealPending && statusMessage ? labels.saving : labels.save}</span>
                    </button>
                  </form>

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
                      {item.skillSlug} / {item.verificationStatus} / {item.visibility}
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
                  <Signal label={labels.feedback} value={formatFeedback(item)} />
                  <Signal label={labels.incidents} value={String(item.incidentCount)} />
                </div>

                <form action={action} className="marketplace-curation-form">
                  <input name="skillSlug" type="hidden" value={item.skillSlug} />
                  <label>
                    <span>{labels.placement}</span>
                    <select defaultValue={item.placement} name="placement">
                      {placements.map((placement) => (
                        <option key={placement} value={placement}>
                          {labels.placements[placement]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{labels.boost}</span>
                    <input defaultValue={item.boost} max={250} min={-250} name="boost" step={1} type="number" />
                  </label>
                  <label>
                    <span>{labels.endsAt}</span>
                    <input defaultValue={toDateTimeLocal(item.endsAt)} name="endsAt" type="datetime-local" />
                  </label>
                  <label className="marketplace-curation-form__wide">
                    <span>{labels.reason}</span>
                    <input defaultValue={item.reason ?? ""} name="reason" required />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isPending && statusMessage ? labels.saving : labels.save}</span>
                  </button>
                </form>

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

function formatFeedback(item: AdminMarketplaceCurationRecord) {
  const rating = item.averageRating === null ? "n/a" : item.averageRating.toFixed(1);
  return `${rating} / ${item.feedbackCount}+${item.pendingFeedbackCount}`;
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
