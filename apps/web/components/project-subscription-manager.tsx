"use client";

import { useActionState } from "react";
import { CheckCircle2, PauseCircle, RotateCcw, XCircle, Zap } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { ProjectSensitiveActionForm } from "@/components/project-sensitive-action-form";
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

type SubscriptionLedgerState = DeveloperProjectSubscriptionRecord["ledgerState"];

const copy = {
  en: {
    action: "Action",
    cancel: "Cancel",
    canceledAt: "Canceled",
    canceling: "Canceling",
    currentPeriod: "Current period",
    gross: "Gross",
    invoiceLines: "Invoice lines",
    ledger: "Ledger",
    ledgerStates: {
      awaiting_post: "Needs posting",
      not_billable: "Not billable",
      not_postable: "Not postable",
      posted: "Posted",
      renewal_due: "Renewal due",
      trial_access: "Trial access"
    },
    noSensitiveAction: "No action",
    pause: "Pause",
    pausedAt: "Paused",
    pausing: "Pausing",
    postedAt: "Posted",
    resume: "Resume",
    resuming: "Resuming",
    transaction: "Transaction",
    unavailable: "n/a"
  },
  zh: {
    action: "操作",
    cancel: "取消",
    canceledAt: "已取消",
    canceling: "取消中",
    currentPeriod: "当前周期",
    gross: "总额",
    invoiceLines: "发票行",
    ledger: "账本",
    ledgerStates: {
      awaiting_post: "待入账",
      not_billable: "不计费",
      not_postable: "不可入账",
      posted: "已入账",
      renewal_due: "可续期",
      trial_access: "试用访问"
    },
    noSensitiveAction: "无需操作",
    pause: "暂停",
    pausedAt: "已暂停",
    pausing: "暂停中",
    postedAt: "入账时间",
    resume: "恢复",
    resuming: "恢复中",
    transaction: "交易",
    unavailable: "暂无"
  }
} as const;

const sensitiveCopy = {
  en: {
    cancel: "Cancel",
    cancelConfirmPlaceholder: "Type CANCEL",
    cancelDescription: "Canceling closes this project subscription and cannot be restored from the project console.",
    cancelReasonPlaceholder: "Project retired, replacement selected, budget owner request, or duplicate subscription",
    confirm: "Confirmation",
    pauseConfirmPlaceholder: "Type PAUSE",
    pauseDescription: "Pausing blocks subscription-priced runtime access while keeping the subscription available for restoration.",
    pauseReasonPlaceholder: "Budget review, owner approval needed, incident triage, or temporary usage freeze",
    reason: "Reason"
  },
  zh: {
    cancel: "\u53d6\u6d88",
    cancelConfirmPlaceholder: "\u8f93\u5165 CANCEL",
    cancelDescription: "\u53d6\u6d88\u540e\u8be5\u9879\u76ee\u8ba2\u9605\u4f1a\u5173\u95ed\uff0c\u4e14\u4e0d\u80fd\u5728\u9879\u76ee\u63a7\u5236\u53f0\u76f4\u63a5\u6062\u590d\u3002",
    cancelReasonPlaceholder: "\u9879\u76ee\u4e0b\u7ebf\u3001\u5df2\u9009\u66ff\u4ee3\u65b9\u6848\u3001\u9884\u7b97\u8d1f\u8d23\u4eba\u8981\u6c42\u6216\u91cd\u590d\u8ba2\u9605",
    confirm: "\u786e\u8ba4\u77ed\u8bed",
    pauseConfirmPlaceholder: "\u8f93\u5165 PAUSE",
    pauseDescription: "\u6682\u505c\u4f1a\u963b\u65ad\u8ba2\u9605\u578b\u6280\u80fd\u7684\u8fd0\u884c\u8bbf\u95ee\uff0c\u540c\u65f6\u4fdd\u7559\u540e\u7eed\u6062\u590d\u8ba2\u9605\u7684\u72b6\u6001\u3002",
    pauseReasonPlaceholder: "\u9884\u7b97\u590d\u6838\u3001\u9700\u8d1f\u8d23\u4eba\u6279\u51c6\u3001\u4e8b\u6545\u6392\u67e5\u6216\u4e34\u65f6\u51bb\u7ed3\u4f7f\u7528",
    reason: "\u539f\u56e0"
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
  const sensitiveLabels = sensitiveCopy[locale];
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
                        sensitiveLabels={sensitiveLabels}
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
                        sensitiveLabels={sensitiveLabels}
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

                <SubscriptionLedgerSummary
                  labels={labels}
                  locale={locale}
                  noDateLabel={noDateLabel}
                  subscription={subscription}
                />
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

function SubscriptionLedgerSummary({
  labels,
  locale,
  noDateLabel,
  subscription
}: {
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  noDateLabel: string;
  subscription: DeveloperProjectSubscriptionRecord;
}) {
  const ledgerState = subscription.ledgerState ?? fallbackLedgerState(subscription);
  const transactionLabel = subscription.ledgerTransactionId
    ? `...${subscription.ledgerTransactionId.slice(-8)}`
    : labels.unavailable;
  const grossCents = subscription.ledgerGrossCents ?? (ledgerState === "posted" || ledgerState === "renewal_due" ? subscription.unitAmountCents : null);
  const grossCurrency = subscription.ledgerCurrency ?? subscription.currency ?? "usd";

  return (
    <div className="subscription-ledger-grid">
      <div>
        <span>{labels.currentPeriod}</span>
        <strong>
          {formatDateValue(subscription.currentPeriodStart, locale, noDateLabel)}
          {" - "}
          {formatDateValue(subscription.currentPeriodEnd, locale, noDateLabel)}
        </strong>
      </div>
      <div>
        <span>{labels.ledger}</span>
        <strong>
          <b className={ledgerChipClass(ledgerState)}>
            {formatLedgerState(ledgerState, labels.ledgerStates)}
          </b>
        </strong>
        {subscription.ledgerPostedAt ? (
          <small>
            {labels.postedAt}: {formatDateValue(subscription.ledgerPostedAt, locale, noDateLabel)}
          </small>
        ) : null}
      </div>
      <div>
        <span>{labels.gross}</span>
        <strong>{grossCents === null ? labels.unavailable : formatMoney(grossCents, grossCurrency)}</strong>
        {subscription.renewalReady ? <small>{formatLedgerState("renewal_due", labels.ledgerStates)}</small> : null}
      </div>
      <div title={subscription.ledgerSourceReference ?? undefined}>
        <span>{labels.transaction}</span>
        <strong>{transactionLabel}</strong>
        <small>
          {labels.invoiceLines}: {subscription.ledgerInvoiceCount ?? 0}
        </small>
      </div>
    </div>
  );
}

function SubscriptionStatusButton({
  action,
  danger = false,
  disabled,
  icon,
  label,
  sensitiveLabels,
  status,
  subscriptionId
}: {
  action: (payload: FormData) => void;
  danger?: boolean;
  disabled: boolean;
  icon: "cancel" | "pause" | "resume";
  label: string;
  sensitiveLabels?: (typeof sensitiveCopy)["en"] | (typeof sensitiveCopy)["zh"];
  status: "active" | "paused" | "canceled";
  subscriptionId: string;
}) {
  const Icon = icon === "cancel" ? XCircle : icon === "pause" ? PauseCircle : RotateCcw;

  if (sensitiveLabels && status !== "active") {
    const isCancel = status === "canceled";

    return (
      <ProjectSensitiveActionForm
        action={action}
        cancelLabel={sensitiveLabels.cancel}
        confirmLabel={sensitiveLabels.confirm}
        confirmPlaceholder={isCancel ? sensitiveLabels.cancelConfirmPlaceholder : sensitiveLabels.pauseConfirmPlaceholder}
        description={isCancel ? sensitiveLabels.cancelDescription : sensitiveLabels.pauseDescription}
        disabled={disabled}
        hiddenFields={{
          status,
          subscriptionId
        }}
        icon={Icon}
        label={label}
        reasonLabel={sensitiveLabels.reason}
        reasonPlaceholder={isCancel ? sensitiveLabels.cancelReasonPlaceholder : sensitiveLabels.pauseReasonPlaceholder}
        submitLabel={label}
        tone={isCancel ? "danger" : "warning"}
      />
    );
  }

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

function fallbackLedgerState(subscription: DeveloperProjectSubscriptionRecord): SubscriptionLedgerState {
  if (subscription.status === "trialing") {
    return "trial_access";
  }

  if (subscription.billingModel !== "subscription" || !subscription.unitAmountCents) {
    return "not_billable";
  }

  if (subscription.status === "active") {
    if (subscription.renewalReady) {
      return "renewal_due";
    }

    return subscription.ledgerTransactionId ? "posted" : "awaiting_post";
  }

  return "not_postable";
}

function ledgerChipClass(state: SubscriptionLedgerState) {
  if (state === "posted") {
    return "status-chip";
  }

  if (state === "awaiting_post" || state === "renewal_due" || state === "trial_access") {
    return "status-chip status-chip--warning";
  }

  if (state === "not_postable") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--neutral";
}

function formatLedgerState(state: SubscriptionLedgerState, labels: Record<string, string>) {
  return labels[state] ?? state.replaceAll("_", " ");
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
