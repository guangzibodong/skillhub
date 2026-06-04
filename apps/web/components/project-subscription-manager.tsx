"use client";

import { useActionState } from "react";
import { CheckCircle2, PauseCircle, RotateCcw, XCircle, Zap } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectSubscriptionRecord } from "@/lib/ops-data";
import { formatMoney } from "@/lib/ops-format";
import {
  updateProjectSubscriptionStatusAction,
  type ProjectSubscriptionActionState
} from "@/lib/project-subscription-actions";

type ProjectSubscriptionManagerProps = {
  emptyLabel: string;
  headers: readonly string[];
  locale: Locale;
  noDateLabel: string;
  projectSlug: string;
  subscriptions: DeveloperProjectSubscriptionRecord[];
  titleLabel: string;
};

const copy = {
  en: {
    action: "Action",
    cancel: "Cancel",
    canceledAt: "Canceled",
    canceling: "Canceling",
    noSensitiveAction: "No action",
    pause: "Pause",
    pausedAt: "Paused",
    pausing: "Pausing",
    resume: "Resume",
    resuming: "Resuming"
  },
  zh: {
    action: "操作",
    cancel: "取消",
    canceledAt: "已取消",
    canceling: "取消中",
    noSensitiveAction: "无需操作",
    pause: "暂停",
    pausedAt: "已暂停",
    pausing: "暂停中",
    resume: "恢复",
    resuming: "恢复中"
  }
} as const;

const initialSubscriptionState: ProjectSubscriptionActionState = {
  message: "",
  status: "idle"
};

export function ProjectSubscriptionManager({
  emptyLabel,
  headers,
  locale,
  noDateLabel,
  projectSlug,
  subscriptions,
  titleLabel
}: ProjectSubscriptionManagerProps) {
  const labels = copy[locale];
  const [subscriptionState, subscriptionAction, isSubscriptionPending] = useActionState(
    updateProjectSubscriptionStatusAction.bind(null, projectSlug, locale),
    initialSubscriptionState
  );

  return (
    <section className="ops-panel project-table-panel">
      <div className="card-kicker">
        <Zap size={16} aria-hidden="true" />
        <span>{titleLabel}</span>
      </div>
      <div className="project-table project-table--compact">
        <div className="project-table__row project-table__row--head project-billing-row project-billing-row--actions">
          {headers.map((header) => (
            <span key={header}>{header}</span>
          ))}
          <span>{labels.action}</span>
        </div>
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => {
            const statusMessage = subscriptionState.updatedSubscriptionId === subscription.id ? subscriptionState : null;

            return (
              <div className="subscription-block" key={subscription.id}>
                <div className="project-table__row project-billing-row project-billing-row--actions">
                  <strong>
                    {subscription.displayName}
                    <small>{subscription.skillSlug}</small>
                  </strong>
                  <span>
                    <b className={statusChipClass(subscription.status)}>{subscription.status}</b>
                    <small>{subscriptionLifecycleLabel(subscription, locale)}</small>
                  </span>
                  <span>{subscriptionModelLabel(subscription.billingModel, subscription.unitAmountCents, subscription.currency)}</span>
                  <span>{formatDateValue(subscription.currentPeriodEnd, locale, noDateLabel)}</span>
                  <span className="subscription-actions">
                    {subscription.status === "active" || subscription.status === "trialing" || subscription.status === "past_due" ? (
                      <SubscriptionStatusButton
                        action={subscriptionAction}
                        disabled={isSubscriptionPending}
                        icon="pause"
                        label={isSubscriptionPending ? labels.pausing : labels.pause}
                        status="paused"
                        subscriptionId={subscription.id}
                      />
                    ) : null}
                    {subscription.status === "paused" || subscription.status === "past_due" ? (
                      <SubscriptionStatusButton
                        action={subscriptionAction}
                        disabled={isSubscriptionPending}
                        icon="resume"
                        label={isSubscriptionPending ? labels.resuming : labels.resume}
                        status="active"
                        subscriptionId={subscription.id}
                      />
                    ) : null}
                    {subscription.status !== "canceled" ? (
                      <SubscriptionStatusButton
                        action={subscriptionAction}
                        danger
                        disabled={isSubscriptionPending}
                        icon="cancel"
                        label={isSubscriptionPending ? labels.canceling : labels.cancel}
                        status="canceled"
                        subscriptionId={subscription.id}
                      />
                    ) : (
                      <span>{labels.noSensitiveAction}</span>
                    )}
                  </span>
                </div>

                {statusMessage && statusMessage.status !== "idle" ? (
                  <div className={statusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{statusMessage.message}</span>
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="project-table__row project-table__row--empty">{emptyLabel}</div>
        )}
      </div>
    </section>
  );
}

function SubscriptionStatusButton({
  action,
  danger = false,
  disabled,
  icon,
  label,
  status,
  subscriptionId
}: {
  action: (payload: FormData) => void;
  danger?: boolean;
  disabled: boolean;
  icon: "cancel" | "pause" | "resume";
  label: string;
  status: "active" | "paused" | "canceled";
  subscriptionId: string;
}) {
  const Icon = icon === "cancel" ? XCircle : icon === "pause" ? PauseCircle : RotateCcw;

  return (
    <form action={action} className="subscription-action-form">
      <input name="subscriptionId" type="hidden" value={subscriptionId} />
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

function statusChipClass(status: string) {
  if (["canceled", "failed", "past_due", "paused"].includes(status)) {
    return "status-chip status-chip--danger";
  }

  if (["pending", "trialing"].includes(status)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip";
}

function subscriptionLifecycleLabel(subscription: DeveloperProjectSubscriptionRecord, locale: Locale) {
  if (subscription.canceledAt) {
    return `${copy[locale].canceledAt}: ${formatDateValue(subscription.canceledAt, locale, "n/a")}`;
  }

  if (subscription.pausedAt) {
    return `${copy[locale].pausedAt}: ${formatDateValue(subscription.pausedAt, locale, "n/a")}`;
  }

  return formatDateValue(subscription.updatedAt ?? subscription.createdAt, locale, "n/a");
}

function subscriptionModelLabel(model: "free" | "per_call" | "subscription" | null, cents: number | null, currency: string | null) {
  if (model === "free") {
    return "free";
  }

  if (model === "subscription") {
    return `${formatMoney(cents ?? 0, currency ?? "usd")} / mo`;
  }

  if (model === "per_call") {
    return `${formatMoney(cents ?? 0, currency ?? "usd")} / call`;
  }

  return "unpriced";
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
