"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { getAdminOperatorToken, getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { AdminAgentModelRecord } from "@/lib/ops-data";
import { revalidatePath } from "next/cache";

export type PromptAssistantActionState = {
  generationId?: string | null;
  message: string;
  modelName?: string;
  prompt?: string;
  status: "error" | "idle" | "success";
};

export type AgentModelActionState = {
  message: string;
  model?: AdminAgentModelRecord;
  modelId?: string;
  status: "error" | "idle" | "success";
};

const copy = {
  en: {
    generated: "Prompt suggestions generated.",
    missingApiKey: "API key is required.",
    missingContent: "Enter content before generating prompts.",
    missingDisplayName: "Display name is required.",
    missingModel: "Model name is required.",
    missingToken: "Sign in before generating prompt suggestions.",
    missingAdminToken: "Sign in with an admin or support account before managing prompt models.",
    saved: "Prompt model saved.",
    promptEndpointUnavailable:
      "The prompt model API is not loaded on the current gateway. Update or restart the gateway, then try again.",
    unableGenerate: "Unable to generate prompt suggestions.",
    unableSave: "Unable to save prompt model."
  },
  zh: {
    generated: "已生成提示词建议。",
    missingApiKey: "请填写 API Key。",
    missingContent: "请先输入内容。",
    missingDisplayName: "请填写展示名称。",
    missingModel: "请填写模型名称。",
    missingToken: "请先登录后再生成提示词建议。",
    missingAdminToken: "请先使用管理员或支持账号登录后再配置提示词模型。",
    saved: "提示词模型已保存。",
    promptEndpointUnavailable: "当前网关尚未加载提示词模型接口，请更新或重启网关后再试。",
    unableGenerate: "无法生成提示词建议。",
    unableSave: "无法保存提示词模型。"
  }
} as const;

export async function generatePromptAssistantAction(
  locale: Locale,
  _previousState: PromptAssistantActionState,
  formData: FormData,
): Promise<PromptAssistantActionState> {
  const labels = copy[locale];
  const token = await getUserToken();
  const content = String(formData.get("content") ?? "").trim();
  const modelConfigId = String(formData.get("modelConfigId") ?? "").trim();
  const useCase = String(formData.get("useCase") ?? "").trim();
  const language = String(formData.get("language") ?? (locale === "zh" ? "Chinese" : "English")).trim();

  if (!content) {
    return { message: labels.missingContent, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const body = JSON.stringify({
      content,
      language,
      modelConfigId: modelConfigId || undefined,
      useCase: useCase || undefined
    });
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    let response = await fetch(`${getApiUrl()}/v1/prompts/generate`, {
      body,
      headers,
      method: "POST"
    });

    if (response.status === 404) {
      response = await fetch(`${getApiUrl()}/v1/agents/prompts`, {
        body,
        headers,
        method: "POST"
      });
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableGenerate);
    }

    const payload = (await response.json()) as {
      result: {
        generationId: string | null;
        model: { displayName: string };
        prompt: string;
      };
    };

    return {
      generationId: payload.result.generationId,
      message: labels.generated,
      modelName: payload.result.model.displayName,
      prompt: payload.result.prompt,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableGenerate,
      status: "error"
    };
  }
}

export async function saveAgentModelAction(
  locale: Locale,
  _previousState: AgentModelActionState,
  formData: FormData,
): Promise<AgentModelActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  const modelId = String(formData.get("id") ?? "").trim();

  if (!displayName) {
    return { message: labels.missingDisplayName, modelId, status: "error" };
  }

  if (!model) {
    return { message: labels.missingModel, modelId, status: "error" };
  }

  if (!apiKey) {
    return { message: labels.missingApiKey, modelId, status: "error" };
  }

  if (!token) {
    return { message: labels.missingAdminToken, modelId, status: "error" };
  }

  try {
    const body = JSON.stringify({
      apiKey,
      baseUrl: String(formData.get("baseUrl") ?? "").trim() || undefined,
      displayName,
      id: modelId || undefined,
      isDefault: formData.get("isDefault") === "on",
      maxOutputTokens: Number(formData.get("maxOutputTokens") ?? 900),
      model,
      provider: String(formData.get("provider") ?? "openai").trim(),
      status: String(formData.get("status") ?? "draft").trim(),
      systemPrompt: String(formData.get("systemPrompt") ?? "").trim(),
      temperature: Number(formData.get("temperature") ?? 0.7)
    });
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    let response = await fetch(`${getApiUrl()}/v1/admin/prompt-models`, {
      body,
      headers,
      method: "POST"
    });

    if (response.status === 404) {
      response = await fetch(`${getApiUrl()}/v1/admin/agent-models`, {
        body,
        headers,
        method: "POST"
      });
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      const message = response.status === 404 ? labels.promptEndpointUnavailable : payload.error ?? labels.unableSave;
      throw new Error(message);
    }

    const payload = (await response.json()) as { model: AdminAgentModelRecord };
    revalidatePath("/admin");
    revalidatePath("/prompts");

    return {
      message: labels.saved,
      model: payload.model,
      modelId: payload.model.id,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      modelId,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
