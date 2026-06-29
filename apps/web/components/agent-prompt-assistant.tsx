"use client";

import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Loader2,
  MessageSquareText,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  generatePromptAssistantAction,
  type PromptAssistantActionState,
} from "@/lib/agent-prompt-actions";
import type { Locale } from "@/lib/i18n";
import type { PublicAgentModelRecord } from "@/lib/ops-data";

type AgentPromptAssistantProps = {
  locale: Locale;
  models: PublicAgentModelRecord[];
};

const initialState: PromptAssistantActionState = {
  message: "",
  status: "idle",
};

const copy = {
  en: {
    content: "Input content",
    contentPlaceholder:
      "Paste a rough task, product idea, customer request, or workflow notes.",
    copied: "Copied",
    copy: "Copy",
    empty:
      "No active model is available yet. Ask an admin to configure a model in the operator console.",
    generate: "Generate prompts",
    generating: "Generating",
    language: "Output language",
    model: "Model",
    result: "Prompt suggestions",
    signInHint: "Sign in is required before generation so usage can be audited.",
    title: "AI prompt assistant",
    useCase: "Use case",
    useCasePlaceholder: "Marketing plan, coding assistant, customer support..."
  },
  zh: {
    content: "输入内容",
    contentPlaceholder: "粘贴粗略任务、产品想法、客户需求或工作流笔记。",
    copied: "已复制",
    copy: "复制",
    empty: "暂时没有可用模型。请先让管理员在后台配置并启用模型。",
    generate: "生成提示词",
    generating: "生成中",
    language: "输出语言",
    model: "模型",
    result: "提示词建议",
    signInHint: "生成需要先登录，便于记录调用和审计。",
    title: "AI 提示词助手",
    useCase: "使用场景",
    useCasePlaceholder: "营销方案、代码助手、客服回复..."
  }
} as const;

export function AgentPromptAssistant({ locale, models }: AgentPromptAssistantProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    generatePromptAssistantAction.bind(null, locale),
    initialState,
  );
  const [copied, setCopied] = useState(false);
  const defaultModelId = models.find((model) => model.isDefault)?.id ?? models[0]?.id ?? "";

  async function copyPrompt() {
    if (!state.prompt) {
      return;
    }

    await navigator.clipboard.writeText(state.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="agent-assistant" aria-labelledby="agent-assistant-title">
      <div className="agent-assistant__main">
        <div className="eyebrow">
          <Sparkles size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <h1 id="agent-assistant-title" className="heading-xl">
          {locale === "zh" ? "把想法变成可直接使用的 AI 提示词" : "Turn rough input into usable AI prompts"}
        </h1>
        <p className="body-text text-[#999]">
          {locale === "zh"
            ? "输入你的目标、素材或限制条件，选择后台配置好的模型，让系统返回适合复制到 AI 工具中的提示词。"
            : "Add goals, source material, or constraints, choose a configured model, and get prompt options ready for your AI tool."}
        </p>
        <p className="agent-assistant__hint">{labels.signInHint}</p>
      </div>

      <form action={action} className="agent-assistant__form">
        <div className="agent-assistant__controls">
          <label>
            <span>{labels.model}</span>
            <select defaultValue={defaultModelId} disabled={models.length === 0} name="modelConfigId">
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.displayName} / {model.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{labels.language}</span>
            <select defaultValue={locale === "zh" ? "Chinese" : "English"} name="language">
              <option value="Chinese">中文</option>
              <option value="English">English</option>
              <option value="Bilingual Chinese and English">中英双语</option>
            </select>
          </label>
        </div>

        <label>
          <span>{labels.useCase}</span>
          <input name="useCase" placeholder={labels.useCasePlaceholder} />
        </label>

        <label>
          <span>{labels.content}</span>
          <textarea name="content" placeholder={labels.contentPlaceholder} required rows={9} />
        </label>

        <button className="btn-primary btn-primary--large" disabled={isPending || models.length === 0} type="submit">
          {isPending ? <Loader2 className="agent-assistant__spin" size={18} aria-hidden="true" /> : <MessageSquareText size={18} aria-hidden="true" />}
          <span>{isPending ? labels.generating : labels.generate}</span>
        </button>

        {models.length === 0 ? <div className="agent-assistant__message agent-assistant__message--error">{labels.empty}</div> : null}
        {state.status !== "idle" ? <ActionMessage state={state} /> : null}
      </form>

      {state.prompt ? (
        <article className="agent-assistant__result">
          <header>
            <div>
              <span>{labels.result}</span>
              <strong>{state.modelName}</strong>
            </div>
            <button className="btn-secondary" onClick={copyPrompt} type="button">
              <Clipboard size={15} aria-hidden="true" />
              <span>{copied ? labels.copied : labels.copy}</span>
            </button>
          </header>
          <pre>
            <code>{state.prompt}</code>
          </pre>
        </article>
      ) : null}
    </section>
  );
}

function ActionMessage({ state }: { state: PromptAssistantActionState }) {
  return (
    <div className={state.status === "success" ? "agent-assistant__message agent-assistant__message--success" : "agent-assistant__message agent-assistant__message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
