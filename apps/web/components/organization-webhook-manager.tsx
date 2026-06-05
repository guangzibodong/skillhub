"use client";

import { useActionState } from "react";
import { CheckCircle2, RotateCw, Save, Webhook, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import {
  createOrganizationWebhookAction,
  rotateOrganizationWebhookSecretAction,
  updateOrganizationWebhookAction,
  type OrganizationWebhookActionState
} from "@/lib/organization-webhook-actions";
import type { OrganizationWebhookEndpoint } from "@/lib/ops-data";

type OrganizationWebhookManagerProps = {
  endpoints: OrganizationWebhookEndpoint[];
  locale: Locale;
};

const copy = {
  en: {
    create: "Create endpoint",
    description: "Description",
    empty: "No webhook endpoints configured.",
    events: "Events",
    failureCount: "Failures",
    lastDelivery: "Last delivery",
    rotate: "Rotate secret",
    save: "Update endpoint",
    saving: "Saving",
    secret: "Signing secret",
    secretHint: "Secret",
    status: "Status",
    title: "Webhook endpoints",
    url: "Endpoint URL",
    statuses: {
      active: "Active",
      disabled: "Disabled",
      paused: "Paused"
    }
  },
  zh: {
    create: "创建 endpoint",
    description: "说明",
    empty: "还没有配置 Webhook endpoint。",
    events: "事件",
    failureCount: "失败次数",
    lastDelivery: "最近投递",
    rotate: "轮换密钥",
    save: "更新 endpoint",
    saving: "保存中",
    secret: "签名密钥",
    secretHint: "密钥",
    status: "状态",
    title: "Webhook endpoints",
    url: "Endpoint URL",
    statuses: {
      active: "启用",
      disabled: "停用",
      paused: "暂停"
    }
  }
} as const;

const eventOptions = [
  "skill.review",
  "skill.update",
  "runtime.incident",
  "finance.billing",
  "publisher.payout",
  "buyer.request",
  "account.security"
] as const;

const statuses = ["active", "paused", "disabled"] as const;

const initialState: OrganizationWebhookActionState = {
  message: "",
  status: "idle"
};

export function OrganizationWebhookManager({ endpoints, locale }: OrganizationWebhookManagerProps) {
  const labels = copy[locale];
  const [createState, createAction, isCreating] = useActionState(createOrganizationWebhookAction.bind(null, locale), initialState);
  const [updateState, updateAction, isUpdating] = useActionState(updateOrganizationWebhookAction.bind(null, locale), initialState);
  const [rotateState, rotateAction, isRotating] = useActionState(rotateOrganizationWebhookSecretAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel organization-webhook-panel">
      <div className="card-kicker">
        <Webhook size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={createAction} className="organization-webhook-form">
        <label>
          <span>{labels.url}</span>
          <input name="url" placeholder="https://example.com/skillhub/webhooks" type="url" />
        </label>
        <label>
          <span>{labels.description}</span>
          <input name="description" placeholder="Ops automation receiver" />
        </label>
        <label>
          <span>{labels.status}</span>
          <select defaultValue="active" name="status">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {labels.statuses[status]}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>{labels.events}</legend>
          {eventOptions.map((event) => (
            <label key={event}>
              <input defaultChecked={["skill.update", "runtime.incident", "account.security"].includes(event)} name="events" type="checkbox" value={event} />
              <span>{event}</span>
            </label>
          ))}
        </fieldset>
        <button className="secondary-button secondary-button--compact" disabled={isCreating} type="submit">
          <Webhook size={15} aria-hidden="true" />
          <span>{isCreating ? labels.saving : labels.create}</span>
        </button>
      </form>
      {createState.status !== "idle" ? <ActionMessage labels={labels} state={createState} /> : null}

      <div className="organization-webhook-list">
        {endpoints.length > 0 ? (
          endpoints.map((endpoint) => {
            const endpointUpdateState = updateState.endpointId === endpoint.id ? updateState : null;
            const endpointRotateState = rotateState.endpointId === endpoint.id ? rotateState : null;

            return (
              <section className="organization-webhook-card" key={endpoint.id}>
                <header className="organization-webhook-card__head">
                  <div>
                    <strong>{endpoint.description ?? endpoint.url}</strong>
                    <span>{endpoint.url}</span>
                  </div>
                  <span className={statusClass(endpoint.status)}>{labels.statuses[endpoint.status]}</span>
                </header>

                <div className="organization-webhook-meta">
                  <span>
                    <strong>{labels.secret}</strong>
                    {endpoint.signingSecretPrefix}...{endpoint.signingSecretLast4}
                  </span>
                  <span>
                    <strong>{labels.lastDelivery}</strong>
                    {endpoint.lastDeliveryStatus ?? "n/a"} / {formatDate(endpoint.lastDeliveredAt, locale)}
                  </span>
                  <span>
                    <strong>{labels.failureCount}</strong>
                    {endpoint.failureCount}
                  </span>
                </div>

                <form action={updateAction} className="organization-webhook-update-form">
                  <input name="endpointId" type="hidden" value={endpoint.id} />
                  <label className="organization-webhook-update-form__wide">
                    <span>{labels.url}</span>
                    <input defaultValue={endpoint.url} name="url" type="url" />
                  </label>
                  <label>
                    <span>{labels.description}</span>
                    <input defaultValue={endpoint.description ?? ""} name="description" />
                  </label>
                  <label>
                    <span>{labels.status}</span>
                    <select defaultValue={endpoint.status} name="status">
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {labels.statuses[status]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <fieldset>
                    <legend>{labels.events}</legend>
                    {eventOptions.map((event) => (
                      <label key={event}>
                        <input defaultChecked={endpoint.events.includes(event)} name="events" type="checkbox" value={event} />
                        <span>{event}</span>
                      </label>
                    ))}
                  </fieldset>
                  <button className="secondary-button secondary-button--compact" disabled={isUpdating} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isUpdating && endpointUpdateState ? labels.saving : labels.save}</span>
                  </button>
                </form>

                <form action={rotateAction} className="organization-webhook-rotate-form">
                  <input name="endpointId" type="hidden" value={endpoint.id} />
                  <button className="secondary-button secondary-button--compact" disabled={isRotating} type="submit">
                    <RotateCw size={15} aria-hidden="true" />
                    <span>{isRotating && endpointRotateState ? labels.saving : labels.rotate}</span>
                  </button>
                </form>

                {endpointUpdateState && endpointUpdateState.status !== "idle" ? <ActionMessage labels={labels} state={endpointUpdateState} /> : null}
                {endpointRotateState && endpointRotateState.status !== "idle" ? <ActionMessage labels={labels} state={endpointRotateState} /> : null}
              </section>
            );
          })
        ) : (
          <div className="organization-webhook-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ActionMessage({
  labels,
  state
}: {
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  state: OrganizationWebhookActionState;
}) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>
        {state.message}
        {state.signingSecret ? (
          <code aria-label={labels.secretHint}>{state.signingSecret}</code>
        ) : null}
      </span>
    </div>
  );
}

function statusClass(status: OrganizationWebhookEndpoint["status"]) {
  if (status === "active") {
    return "status-chip";
  }

  if (status === "paused") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

  if (value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
