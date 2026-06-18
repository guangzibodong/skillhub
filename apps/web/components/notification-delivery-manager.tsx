"use client";

import { useActionState } from "react";
import { AlertTriangle, CheckCircle2, MailCheck, RefreshCw, Send, SkipForward, Webhook, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import {
  decideNotificationDeliveryAction,
  processNotificationDeliveriesAction,
  type NotificationDeliveryActionState,
  type NotificationDeliveryProcessActionState
} from "@/lib/notification-delivery-actions";
import type { AdminNotificationDelivery } from "@/lib/ops-data";

type NotificationDeliveryManagerProps = {
  deliveries: AdminNotificationDelivery[];
  locale: Locale;
};

const copy = {
  en: {
    attempts: "Attempts",
    channel: "Channel",
    confirmation: "Confirm real delivery",
    confirmationPlaceholder: "Type DELIVER only for real sends",
    created: "Created",
    delivered: "Delivered",
    empty: "No external email or webhook delivery events are waiting.",
    error: "Error",
    fail: "Fail",
    lastAttempt: "Last attempt",
    markSent: "Mark sent",
    nextAttempt: "Next retry",
    payload: "Payload",
    provider: "Provider",
    providerMessageId: "Provider message id",
    providerPlaceholder: "例如 SpaceMail SMTP",
    reason: "Reason",
    reasonPlaceholder: "Manual provider check, SMTP result, or retry note",
    process: "Process due",
    processMode: "Mode",
    processLimit: "Limit",
    processSummary: "{{fanoutMode}} fanout {{fanout}} (email {{fanoutEmail}}, webhook {{fanoutWebhook}}) / processed {{processed}} / sent {{sent}} / failed {{failed}} / skipped {{skipped}}",
    processWarning:
      "Default to dry run. Deliver can send real email or webhooks; use it only after the preview count, provider, and recipient scope are correct.",
    retry: "Retry",
    saving: "Updating",
    skip: "Skip",
    status: "Status",
    title: "External delivery queue",
    statuses: {
      failed: "Failed",
      queued: "Queued",
      sent: "Sent",
      skipped: "Skipped"
    },
    channels: {
      email: "Email",
      webhook: "Webhook"
    },
    processModes: {
      deliver: "Deliver",
      dry_run: "Dry run"
    },
    fanoutModes: {
      created: "Created",
      preview: "Preview"
    }
  },
  zh: {
    attempts: "\u5c1d\u8bd5\u6b21\u6570",
    channel: "\u6e20\u9053",
    confirmation: "真实投递确认",
    confirmationPlaceholder: "真实投递时输入 DELIVER",
    created: "\u521b\u5efa",
    delivered: "\u5df2\u6295\u9012",
    empty: "\u6682\u65e0\u5f85\u5904\u7406\u7684\u90ae\u4ef6\u6216 webhook \u6295\u9012\u4e8b\u4ef6\u3002",
    error: "\u9519\u8bef",
    fail: "\u6807\u8bb0\u5931\u8d25",
    lastAttempt: "\u4e0a\u6b21\u5c1d\u8bd5",
    markSent: "\u6807\u8bb0\u5df2\u53d1",
    nextAttempt: "\u4e0b\u6b21\u91cd\u8bd5",
    payload: "\u8f7d\u8377",
    provider: "\u670d\u52a1\u5546",
    providerMessageId: "\u670d\u52a1\u5546\u6d88\u606f ID",
    providerPlaceholder: "例如 SpaceMail SMTP",
    reason: "\u539f\u56e0",
    reasonPlaceholder: "\u624b\u52a8\u6838\u5bf9\u7ed3\u679c\u3001SMTP \u7ed3\u679c\u6216\u91cd\u8bd5\u8bf4\u660e",
    process: "\u5904\u7406\u5230\u671f\u961f\u5217",
    processMode: "\u6a21\u5f0f",
    processLimit: "\u6570\u91cf",
    processSummary: "{{fanoutMode}}\u6247\u51fa {{fanout}}\uff08\u90ae\u4ef6 {{fanoutEmail}}\uff0cWebhook {{fanoutWebhook}}\uff09/ \u5df2\u5904\u7406 {{processed}} / \u5df2\u53d1 {{sent}} / \u5931\u8d25 {{failed}} / \u8df3\u8fc7 {{skipped}}",
    processWarning:
      "\u9ed8\u8ba4\u5148\u6f14\u7ec3\u3002\u201c\u6295\u9012\u201d\u53ef\u80fd\u53d1\u9001\u771f\u5b9e\u90ae\u4ef6\u6216 webhook\uff1b\u53ea\u6709\u5728\u9884\u89c8\u6570\u91cf\u3001\u670d\u52a1\u5546\u548c\u6536\u4ef6\u8303\u56f4\u786e\u8ba4\u540e\u624d\u4f7f\u7528\u3002",
    retry: "\u91cd\u8bd5",
    saving: "\u66f4\u65b0\u4e2d",
    skip: "\u8df3\u8fc7",
    status: "\u72b6\u6001",
    title: "\u5916\u90e8\u6295\u9012\u961f\u5217",
    statuses: {
      failed: "\u5931\u8d25",
      queued: "\u6392\u961f\u4e2d",
      sent: "\u5df2\u53d1\u9001",
      skipped: "\u5df2\u8df3\u8fc7"
    },
    channels: {
      email: "\u90ae\u4ef6",
      webhook: "Webhook"
    },
    processModes: {
      deliver: "\u6295\u9012",
      dry_run: "\u6f14\u7ec3"
    },
    fanoutModes: {
      created: "\u5df2\u521b\u5efa",
      preview: "\u9884\u89c8"
    }
  }
} as const;

const initialState: NotificationDeliveryActionState = {
  message: "",
  status: "idle"
};

const initialProcessState: NotificationDeliveryProcessActionState = {
  message: "",
  status: "idle"
};

export function NotificationDeliveryManager({ deliveries, locale }: NotificationDeliveryManagerProps) {
  const labels = copy[locale];
  const [state, formAction, isSaving] = useActionState(decideNotificationDeliveryAction.bind(null, locale), initialState);
  const [processState, processAction, isProcessing] = useActionState(
    processNotificationDeliveriesAction.bind(null, locale),
    initialProcessState
  );

  return (
    <article className="ops-panel notification-delivery-panel">
      <div className="card-kicker">
        <MailCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={processAction} className="notification-delivery-process-form">
        <div className="notification-delivery-warning" role="note">
          <AlertTriangle size={15} aria-hidden="true" />
          <span>{labels.processWarning}</span>
        </div>
        <label>
          <span>{labels.processMode}</span>
          <select defaultValue="dry_run" name="mode">
            <option value="dry_run">{labels.processModes.dry_run}</option>
            <option value="deliver">{labels.processModes.deliver}</option>
          </select>
        </label>
        <label>
          <span>{labels.processLimit}</span>
          <input defaultValue="10" max="50" min="1" name="limit" type="number" />
        </label>
        <label>
          <span>{labels.confirmation}</span>
          <input autoComplete="off" name="confirmation" placeholder={labels.confirmationPlaceholder} />
        </label>
        <button className="secondary-button secondary-button--compact" disabled={isProcessing} type="submit">
          <RefreshCw size={15} aria-hidden="true" />
          <span>{isProcessing ? labels.saving : labels.process}</span>
        </button>
      </form>
      {processState.status !== "idle" ? <ProcessMessage labels={labels} state={processState} /> : null}

      <div className="notification-delivery-list">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => {
            const statusMessage = state.deliveryId === delivery.id ? state : null;
            const Icon = delivery.channel === "email" ? MailCheck : Webhook;
            const isTerminal = delivery.status === "sent" || delivery.status === "skipped";
            const isFailed = delivery.status === "failed";
            const disableSentOrSkip = isSaving || isTerminal || isFailed;
            const disableRetry = isSaving || isTerminal;

            return (
              <section className="notification-delivery-card" key={delivery.id}>
                <header className="notification-delivery-card__head">
                  <div>
                    <strong>{delivery.subject ?? delivery.eventType}</strong>
                    <span>{delivery.eventType}</span>
                  </div>
                  <span className={statusClass(delivery.status)}>{labels.statuses[delivery.status]}</span>
                </header>

                <dl className="notification-delivery-meta">
                  <MetaItem icon={<Icon size={15} aria-hidden="true" />} label={labels.channel} value={labels.channels[delivery.channel]} />
                  <MetaItem label={labels.attempts} value={String(delivery.deliveryAttempts)} />
                  <MetaItem label={labels.provider} value={formatProvider(delivery.deliveryProvider, locale)} />
                  <MetaItem label={labels.created} value={formatDate(delivery.createdAt, locale)} />
                  <MetaItem label={labels.lastAttempt} value={formatDate(delivery.lastAttemptedAt, locale)} />
                  <MetaItem label={labels.nextAttempt} value={formatDate(delivery.nextAttemptAt, locale)} />
                  <MetaItem label={labels.delivered} value={formatDate(delivery.deliveredAt, locale)} />
                  <MetaItem label={labels.error} value={formatOptional(delivery.error, locale)} />
                </dl>

                <div className="notification-delivery-payload">
                  <span>{labels.payload}</span>
                  <code>{payloadSummary(delivery.payloadSummary)}</code>
                </div>

                <form action={formAction} className="notification-delivery-form">
                  <input name="deliveryId" type="hidden" value={delivery.id} />
                  <label>
                    <span>{labels.reason}</span>
                    <input name="reason" placeholder={labels.reasonPlaceholder} required />
                  </label>
                  <label>
                    <span>{labels.provider}</span>
                    <input defaultValue={delivery.deliveryProvider ?? ""} name="provider" placeholder={labels.providerPlaceholder} />
                  </label>
                  <label>
                    <span>{labels.providerMessageId}</span>
                    <input defaultValue={delivery.providerMessageId ?? ""} name="providerMessageId" />
                  </label>
                  <label>
                    <span>{labels.nextAttempt}</span>
                    <input name="nextAttemptAt" type="datetime-local" />
                  </label>

                  <div className="notification-delivery-actions">
                    <button className="secondary-button secondary-button--compact" disabled={disableSentOrSkip} name="action" type="submit" value="mark_sent">
                      <Send size={15} aria-hidden="true" />
                      <span>{isSaving && statusMessage ? labels.saving : labels.markSent}</span>
                    </button>
                    <button className="ghost-button ghost-button--compact" disabled={disableRetry} name="action" type="submit" value="retry">
                      <RefreshCw size={15} aria-hidden="true" />
                      <span>{labels.retry}</span>
                    </button>
                    <button className="ghost-button ghost-button--compact" disabled={isSaving || isTerminal} name="action" type="submit" value="mark_failed">
                      <XCircle size={15} aria-hidden="true" />
                      <span>{labels.fail}</span>
                    </button>
                    <button className="ghost-button ghost-button--compact" disabled={disableSentOrSkip} name="action" type="submit" value="skip">
                      <SkipForward size={15} aria-hidden="true" />
                      <span>{labels.skip}</span>
                    </button>
                  </div>
                </form>

                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
              </section>
            );
          })
        ) : (
          <div className="notification-delivery-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ProcessMessage({
  labels,
  state
}: {
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  state: NotificationDeliveryProcessActionState;
}) {
  const fanoutMode = state.result ? labels.fanoutModes[state.result.fanoutMode ?? "created"] : "";
  const summary = state.result
    ? labels.processSummary
        .replace("{{fanoutMode}}", fanoutMode)
        .replace("{{fanout}}", String(state.result.fanoutCount ?? 0))
        .replace("{{fanoutEmail}}", String(state.result.fanoutEmailCount ?? 0))
        .replace("{{fanoutWebhook}}", String(state.result.fanoutWebhookCount ?? 0))
        .replace("{{processed}}", String(state.result.processedCount))
        .replace("{{sent}}", String(state.result.deliveredCount))
        .replace("{{failed}}", String(state.result.failedCount))
        .replace("{{skipped}}", String(state.result.skippedCount))
    : state.message;

  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.result ? `${state.message} ${summary}` : state.message}</span>
    </div>
  );
}

function ActionMessage({ state }: { state: NotificationDeliveryActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt>
        {icon}
        <span>{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}

function statusClass(status: AdminNotificationDelivery["status"]) {
  if (status === "sent") {
    return "status-chip";
  }

  if (status === "failed") {
    return "status-chip status-chip--danger";
  }

  if (status === "skipped") {
    return "status-chip status-chip--neutral";
  }

  return "status-chip status-chip--warning";
}

function formatProvider(value: string | null | undefined, locale: Locale) {
  if (!value || value === "provider_deferred" || value === "n/a") {
    return locale === "zh" ? "服务商待接入" : "Provider deferred";
  }

  return value;
}

function formatOptional(value: string | null | undefined, locale: Locale) {
  if (!value || value === "n/a") {
    return locale === "zh" ? "暂无" : "n/a";
  }

  return value;
}

function payloadSummary(payload: Record<string, unknown>) {
  const entries = Object.entries(payload).slice(0, 8);

  if (entries.length === 0) {
    return "n/a";
  }

  return entries.map(([key, value]) => `${key}: ${formatPayloadValue(value)}`).join(" / ");
}

function formatPayloadValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null || value === undefined) {
    return "n/a";
  }

  return "object";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "暂无" : "n/a";
  }

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
