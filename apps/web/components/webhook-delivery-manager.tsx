"use client";

import { useActionState, type ReactNode } from "react";
import { CheckCircle2, RefreshCw, ServerCrash, Webhook, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillSelect, SkillStatusTag } from "@/components/skill-antd";
import type { Locale } from "@/lib/i18n";
import {
  processWebhookDeliveriesAction,
  type WebhookDeliveryProcessActionState
} from "@/lib/webhook-delivery-actions";
import type { AdminWebhookDelivery } from "@/lib/ops-data";

type WebhookDeliveryManagerProps = {
  deliveries: AdminWebhookDelivery[];
  locale: Locale;
};

const copy = {
  en: {
    attempts: "Attempts",
    confirmation: "Confirm real delivery",
    confirmationPlaceholder: "Type DELIVER only for real sends",
    delivered: "Delivered",
    empty: "No webhook outbox deliveries are waiting.",
    endpoint: "Endpoint",
    endpointStatus: "Endpoint status",
    event: "Event",
    lastAttempt: "Last attempt",
    nextAttempt: "Next retry",
    organization: "Organization",
    payload: "Payload",
    process: "Send due",
    processLimit: "Limit",
    processMode: "Mode",
    processSummary: "Processed {{processed}} / delivered {{delivered}} / failed {{failed}} / skipped {{skipped}}",
    response: "Response",
    responseStatus: "HTTP",
    saving: "Processing",
    status: "Status",
    title: "Webhook outbox",
    endpointStatuses: {
      active: "Active",
      disabled: "Disabled",
      paused: "Paused"
    },
    processModes: {
      deliver: "Deliver",
      dry_run: "Dry run"
    },
    statuses: {
      delivered: "Delivered",
      failed: "Failed",
      pending: "Pending",
      processing: "Processing",
      skipped: "Skipped"
    }
  },
  zh: {
    attempts: "\u5c1d\u8bd5\u6b21\u6570",
    confirmation: "真实投递确认",
    confirmationPlaceholder: "真实投递时输入 DELIVER",
    delivered: "\u5df2\u6295\u9012",
    empty: "暂无待投递的 Webhook 事件。",
    endpoint: "端点",
    endpointStatus: "端点状态",
    event: "\u4e8b\u4ef6",
    lastAttempt: "\u4e0a\u6b21\u5c1d\u8bd5",
    nextAttempt: "\u4e0b\u6b21\u91cd\u8bd5",
    organization: "\u7ec4\u7ec7",
    payload: "载荷摘要",
    process: "\u6295\u9012\u5230\u671f\u4e8b\u4ef6",
    processLimit: "\u6570\u91cf",
    processMode: "\u6a21\u5f0f",
    processSummary: "\u5df2\u5904\u7406 {{processed}} / \u6210\u529f {{delivered}} / \u5931\u8d25 {{failed}} / \u8df3\u8fc7 {{skipped}}",
    response: "响应摘要",
    responseStatus: "HTTP",
    saving: "\u5904\u7406\u4e2d",
    status: "\u72b6\u6001",
    title: "Webhook 投递箱",
    endpointStatuses: {
      active: "\u542f\u7528",
      disabled: "\u7981\u7528",
      paused: "\u6682\u505c"
    },
    processModes: {
      deliver: "\u6295\u9012",
      dry_run: "\u6f14\u7ec3"
    },
    statuses: {
      delivered: "\u5df2\u6295\u9012",
      failed: "\u5931\u8d25",
      pending: "\u5f85\u6295\u9012",
      processing: "\u5904\u7406\u4e2d",
      skipped: "\u5df2\u8df3\u8fc7"
    }
  }
} as const;

const initialProcessState: WebhookDeliveryProcessActionState = {
  message: "",
  status: "idle"
};

export function WebhookDeliveryManager({ deliveries, locale }: WebhookDeliveryManagerProps) {
  const labels = copy[locale];
  const [processState, processAction, isProcessing] = useActionState(
    processWebhookDeliveriesAction.bind(null, locale),
    initialProcessState
  );

  return (
    <article className="ops-panel notification-delivery-panel webhook-delivery-panel">
      <div className="card-kicker">
        <Webhook size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={processAction} className="notification-delivery-process-form">
        <label>
          <span>{labels.processMode}</span>
          <SkillSelect defaultValue="dry_run" name="mode" options={processModeOptions(labels)} />
        </label>
        <label>
          <span>{labels.processLimit}</span>
          <SkillInput defaultValue="10" max="50" min="1" name="limit" type="number" />
        </label>
        <label>
          <span>{labels.confirmation}</span>
          <SkillInput autoComplete="off" name="confirmation" placeholder={labels.confirmationPlaceholder} />
        </label>
        <SkillButton className="secondary-button secondary-button--compact" disabled={isProcessing} htmlType="submit">
          <RefreshCw size={15} aria-hidden="true" />
          <span>{isProcessing ? labels.saving : labels.process}</span>
        </SkillButton>
      </form>
      {processState.status !== "idle" ? <ProcessMessage labels={labels} state={processState} /> : null}

      <div className="notification-delivery-list">
        {deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <section className="notification-delivery-card" key={delivery.id}>
              <header className="notification-delivery-card__head">
                <div>
                  <strong>{delivery.endpointUrl ?? delivery.endpointId ?? delivery.id}</strong>
                  <span>{delivery.eventType}</span>
                </div>
                <SkillStatusTag className={statusClass(delivery.status)}>{labels.statuses[delivery.status]}</SkillStatusTag>
              </header>

              <dl className="notification-delivery-meta">
                <MetaItem icon={<Webhook size={15} aria-hidden="true" />} label={labels.event} value={delivery.eventType} />
                <MetaItem label={labels.organization} value={delivery.organizationName ?? delivery.organizationId} />
                <MetaItem label={labels.endpointStatus} value={formatEndpointStatus(delivery.endpointStatus, labels)} />
                <MetaItem label={labels.attempts} value={String(delivery.attemptCount)} />
                <MetaItem label={labels.responseStatus} value={formatOptional(delivery.responseStatus ? String(delivery.responseStatus) : null, locale)} />
                <MetaItem label={labels.lastAttempt} value={formatDate(delivery.lastAttemptedAt, locale)} />
                <MetaItem label={labels.nextAttempt} value={formatDate(delivery.nextAttemptAt, locale)} />
                <MetaItem label={labels.delivered} value={formatDate(delivery.deliveredAt, locale)} />
              </dl>

              <div className="notification-delivery-payload">
                <span>{labels.payload}</span>
                <code>{payloadSummary(delivery.payloadSummary)}</code>
              </div>

              <div className="notification-delivery-payload">
                <span>{labels.response}</span>
                <code>{formatOptional(delivery.responseBody, locale)}</code>
              </div>
            </section>
          ))
        ) : (
          <div className="notification-delivery-empty">
            <ServerCrash size={15} aria-hidden="true" />
            <span>{labels.empty}</span>
          </div>
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
  state: WebhookDeliveryProcessActionState;
}) {
  const summary = state.result
    ? labels.processSummary
        .replace("{{processed}}", String(state.result.processedCount))
        .replace("{{delivered}}", String(state.result.deliveredCount))
        .replace("{{failed}}", String(state.result.failedCount))
        .replace("{{skipped}}", String(state.result.skippedCount))
    : state.message;

  return (
    <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.result ? `${state.message} ${summary}` : state.message} type={state.status === "success" ? "success" : "error"} />
  );
}

function processModeOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return [
    { label: labels.processModes.dry_run, value: "dry_run" },
    { label: labels.processModes.deliver, value: "deliver" }
  ];
}

function MetaItem({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
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

function statusClass(status: AdminWebhookDelivery["status"]) {
  if (status === "delivered") {
    return "status-chip";
  }

  if (status === "failed") {
    return "status-chip status-chip--danger";
  }

  if (status === "pending" || status === "processing") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatEndpointStatus(status: AdminWebhookDelivery["endpointStatus"], labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  if (!status) {
    return labels === copy.zh ? "暂无" : "n/a";
  }

  return labels.endpointStatuses[status];
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
    return "n/a";
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
