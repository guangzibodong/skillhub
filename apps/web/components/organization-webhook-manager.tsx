"use client";

import { useActionState } from "react";
import { CheckCircle2, RotateCw, Save, Webhook, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillCheckbox, SkillInput, SkillSelect, SkillStatusTag } from "@/components/skill-antd";
import type { Locale } from "@/lib/i18n";
import { ProjectSensitiveActionForm } from "@/components/project-sensitive-action-form";
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

const sensitiveCopy = {
  en: {
    cancel: "Cancel",
    confirm: "Confirmation",
    reason: "Reason",
    rotateConfirmPlaceholder: "Type ROTATE",
    rotateDescription:
      "Rotating the signing secret invalidates the current webhook secret. Update the receiver before delivering real events.",
    rotateReasonPlaceholder: "Scheduled rotation, suspected leak, receiver migration, or security cleanup",
    rotateSubmit: "Rotate secret"
  },
  zh: {
    cancel: "\u53d6\u6d88",
    confirm: "\u786e\u8ba4\u77ed\u8bed",
    reason: "\u539f\u56e0",
    rotateConfirmPlaceholder: "\u8f93\u5165 ROTATE",
    rotateDescription:
      "\u8f6e\u6362\u7b7e\u540d\u5bc6\u94a5\u4f1a\u4f7f\u5f53\u524d webhook secret \u5931\u6548\u3002\u6295\u9012\u771f\u5b9e\u4e8b\u4ef6\u524d\uff0c\u8bf7\u5148\u66f4\u65b0\u63a5\u6536\u7aef\u3002",
    rotateReasonPlaceholder: "\u5b9a\u671f\u8f6e\u6362\u3001\u7591\u4f3c\u6cc4\u9732\u3001\u63a5\u6536\u7aef\u8fc1\u79fb\u6216\u5b89\u5168\u6e05\u7406",
    rotateSubmit: "\u8f6e\u6362\u5bc6\u94a5"
  }
} as const;

const initialState: OrganizationWebhookActionState = {
  message: "",
  status: "idle"
};

export function OrganizationWebhookManager({ endpoints, locale }: OrganizationWebhookManagerProps) {
  const labels = copy[locale];
  const sensitiveLabels = sensitiveCopy[locale];
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
          <SkillInput name="url" placeholder="https://example.com/skillhub/webhooks" type="url" />
        </label>
        <label>
          <span>{labels.description}</span>
          <SkillInput name="description" placeholder="Ops automation receiver" />
        </label>
        <label>
          <span>{labels.status}</span>
          <SkillSelect defaultValue="active" name="status" options={statusOptions(labels)} />
        </label>
        <fieldset>
          <legend>{labels.events}</legend>
          {eventOptions.map((event) => (
            <label key={event}>
              <SkillCheckbox defaultChecked={["skill.update", "runtime.incident", "account.security"].includes(event)} name="events" value={event} />
              <span>{event}</span>
            </label>
          ))}
        </fieldset>
        <SkillButton className="secondary-button secondary-button--compact" disabled={isCreating} htmlType="submit">
          <Webhook size={15} aria-hidden="true" />
          <span>{isCreating ? labels.saving : labels.create}</span>
        </SkillButton>
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
                  <SkillStatusTag className={statusClass(endpoint.status)}>{labels.statuses[endpoint.status]}</SkillStatusTag>
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
                    <SkillInput defaultValue={endpoint.url} name="url" type="url" />
                  </label>
                  <label>
                    <span>{labels.description}</span>
                    <SkillInput defaultValue={endpoint.description ?? ""} name="description" />
                  </label>
                  <label>
                    <span>{labels.status}</span>
                    <SkillSelect defaultValue={endpoint.status} name="status" options={statusOptions(labels)} />
                  </label>
                  <fieldset>
                    <legend>{labels.events}</legend>
                    {eventOptions.map((event) => (
                      <label key={event}>
                        <SkillCheckbox defaultChecked={endpoint.events.includes(event)} name="events" value={event} />
                        <span>{event}</span>
                      </label>
                    ))}
                  </fieldset>
                  <SkillButton className="secondary-button secondary-button--compact" disabled={isUpdating} htmlType="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isUpdating && endpointUpdateState ? labels.saving : labels.save}</span>
                  </SkillButton>
                </form>

                <ProjectSensitiveActionForm
                  action={rotateAction}
                  cancelLabel={sensitiveLabels.cancel}
                  confirmLabel={sensitiveLabels.confirm}
                  confirmPlaceholder={sensitiveLabels.rotateConfirmPlaceholder}
                  description={sensitiveLabels.rotateDescription}
                  disabled={isRotating}
                  hiddenFields={{ endpointId: endpoint.id }}
                  icon={RotateCw}
                  label={isRotating && endpointRotateState ? labels.saving : labels.rotate}
                  reasonLabel={sensitiveLabels.reason}
                  reasonPlaceholder={sensitiveLabels.rotateReasonPlaceholder}
                  submitLabel={sensitiveLabels.rotateSubmit}
                  tone="warning"
                />

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
    <SkillAlert
      className="action-message"
      icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      message={
        <span>
          {state.message}
          {state.signingSecret ? (
            <code aria-label={labels.secretHint}>{state.signingSecret}</code>
          ) : null}
        </span>
      }
      type={state.status === "success" ? "success" : "error"}
    />
  );
}

function statusOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return statuses.map((status) => ({ label: labels.statuses[status], value: status }));
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
