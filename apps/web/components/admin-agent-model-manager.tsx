"use client";

import { useActionState } from "react";
import {
  CheckCircle2,
  MessageSquareText,
  Save,
  Settings2,
  XCircle,
} from "lucide-react";
import {
  saveAgentModelAction,
  type AgentModelActionState,
} from "@/lib/agent-prompt-actions";
import type { Locale } from "@/lib/i18n";
import type { AdminAgentModelRecord } from "@/lib/ops-data";

type AdminAgentModelManagerProps = {
  locale: Locale;
  models: AdminAgentModelRecord[];
};

const providers = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "openrouter",
  "custom",
] as const;
const statuses = ["draft", "active", "disabled"] as const;
const initialState: AgentModelActionState = {
  message: "",
  status: "idle",
};

const defaultSystemPrompt =
  "You are a prompt architect for SkillHub. Create useful, reusable prompts from the user input.";

const copy = {
  en: {
    apiKey: "API key",
    apiKeyHelp:
      "Existing keys are masked. Paste the current or replacement key before saving.",
    baseUrl: "Base URL",
    create: "Create model",
    defaultModel: "Default",
    displayName: "Display name",
    empty: "No prompt models configured yet.",
    maxOutputTokens: "Max output",
    model: "Model",
    provider: "Provider",
    save: "Save model",
    saving: "Saving",
    status: "Status",
    systemPrompt: "System prompt",
    temperature: "Temperature",
    title: "Prompt model configuration",
    updated: "Updated",
    statuses: {
      active: "Active",
      disabled: "Disabled",
      draft: "Draft",
    },
  },
  zh: {
    apiKey: "API Key",
    apiKeyHelp: "已有密钥会被隐藏。保存时请粘贴当前密钥或新的替换密钥。",
    baseUrl: "Base URL",
    create: "新增模型",
    defaultModel: "默认",
    displayName: "展示名称",
    empty: "还没有配置提示词模型。",
    maxOutputTokens: "最大输出",
    model: "模型",
    provider: "供应商",
    save: "保存模型",
    saving: "保存中",
    status: "状态",
    systemPrompt: "系统提示词",
    temperature: "温度",
    title: "提示词模型配置",
    updated: "更新时间",
    statuses: {
      active: "启用",
      disabled: "停用",
      draft: "草稿",
    },
  },
} as const;

export function AdminAgentModelManager({
  locale,
  models,
}: AdminAgentModelManagerProps) {
  const labels = copy[locale];
  const [createState, createAction, isCreating] = useActionState(
    saveAgentModelAction.bind(null, locale),
    initialState,
  );
  const [saveState, saveAction, isSaving] = useActionState(
    saveAgentModelAction.bind(null, locale),
    initialState,
  );

  return (
    <article className="ops-panel agent-model-panel">
      <div className="card-kicker">
        <MessageSquareText size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={createAction} className="agent-model-form">
        <ModelFields labels={labels} locale={locale} />
        <button
          className="secondary-button secondary-button--compact"
          disabled={isCreating}
          type="submit"
        >
          <Settings2 size={15} aria-hidden="true" />
          <span>{isCreating ? labels.saving : labels.create}</span>
        </button>
      </form>
      {createState.status !== "idle" ? (
        <ActionMessage state={createState} />
      ) : null}

      <div className="agent-model-list">
        {models.length > 0 ? (
          models.map((model) => {
            const statusMessage =
              saveState.modelId === model.id ? saveState : null;

            return (
              <section className="agent-model-card" key={model.id}>
                <header className="agent-model-card__head">
                  <div>
                    <strong>{model.displayName}</strong>
                    <span>
                      {model.provider} / {model.model} / key ...
                      {model.apiKeyLast4 || "****"} / {labels.updated}:{" "}
                      {formatDate(model.updatedAt, locale)}
                    </span>
                  </div>
                  <div className="agent-model-card__chips">
                    {model.isDefault ? (
                      <span className="status-chip">{labels.defaultModel}</span>
                    ) : null}
                    <span className={statusClass(model.status)}>
                      {labels.statuses[model.status]}
                    </span>
                  </div>
                </header>

                <form
                  action={saveAction}
                  className="agent-model-form agent-model-form--edit"
                >
                  <input name="id" type="hidden" value={model.id} />
                  <ModelFields labels={labels} locale={locale} model={model} />
                  <button
                    className="secondary-button secondary-button--compact"
                    disabled={isSaving}
                    type="submit"
                  >
                    <Save size={15} aria-hidden="true" />
                    <span>
                      {isSaving && statusMessage ? labels.saving : labels.save}
                    </span>
                  </button>
                </form>
                {statusMessage && statusMessage.status !== "idle" ? (
                  <ActionMessage state={statusMessage} />
                ) : null}
              </section>
            );
          })
        ) : (
          <div className="agent-model-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ModelFields({
  labels,
  locale,
  model,
}: {
  labels: (typeof copy)["en" | "zh"];
  locale: Locale;
  model?: AdminAgentModelRecord;
}) {
  return (
    <>
      <label>
        <span>{labels.displayName}</span>
        <input
          defaultValue={model?.displayName ?? ""}
          name="displayName"
          placeholder={locale === "zh" ? "内容提示词助手" : "Prompt Architect"}
          required
        />
      </label>
      <label>
        <span>{labels.provider}</span>
        <select defaultValue={model?.provider ?? "openai"} name="provider">
          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{labels.model}</span>
        <input
          defaultValue={model?.model ?? ""}
          name="model"
          placeholder="gpt-4o-mini"
          required
        />
      </label>
      <label>
        <span>{labels.status}</span>
        <select defaultValue={model?.status ?? "draft"} name="status">
          {statuses.map((status) => (
            <option key={status} value={status}>
              {labels.statuses[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{labels.apiKey}</span>
        <input
          name="apiKey"
          placeholder={model ? `...${model.apiKeyLast4 || "****"}` : "sk-..."}
          required
          type="password"
        />
        <small>{labels.apiKeyHelp}</small>
      </label>
      <label>
        <span>{labels.baseUrl}</span>
        <input
          defaultValue={model?.baseUrl ?? ""}
          name="baseUrl"
          placeholder="https://api.openai.com/v1"
        />
      </label>
      <label>
        <span>{labels.temperature}</span>
        <input
          defaultValue={model?.temperature ?? 0.7}
          max="2"
          min="0"
          name="temperature"
          step="0.1"
          type="number"
        />
      </label>
      <label>
        <span>{labels.maxOutputTokens}</span>
        <input
          defaultValue={model?.maxOutputTokens ?? 900}
          max="8192"
          min="128"
          name="maxOutputTokens"
          step="1"
          type="number"
        />
      </label>
      <label className="agent-model-form__check">
        <input
          defaultChecked={model?.isDefault ?? false}
          name="isDefault"
          type="checkbox"
        />
        <span>{labels.defaultModel}</span>
      </label>
      <label className="agent-model-form__wide">
        <span>{labels.systemPrompt}</span>
        <textarea
          defaultValue={model?.systemPrompt ?? defaultSystemPrompt}
          name="systemPrompt"
          required
          rows={4}
        />
      </label>
    </>
  );
}

function ActionMessage({ state }: { state: AgentModelActionState }) {
  return (
    <div
      className={
        state.status === "success"
          ? "action-message action-message--success"
          : "action-message action-message--error"
      }
    >
      {state.status === "success" ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <XCircle size={16} aria-hidden="true" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

function statusClass(status: AdminAgentModelRecord["status"]) {
  if (status === "active") {
    return "status-chip";
  }

  if (status === "draft") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string, locale: Locale) {
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
    year: "numeric",
  }).format(date);
}
