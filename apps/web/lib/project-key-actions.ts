"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectKeyActionState = {
  apiKey?: {
    id: string;
    name: string;
    keyPrefix: string;
    keyLast4: string;
    apiKey: string;
  };
  message: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    created: "Runtime key created. Copy it now; SkillHub will not show the raw secret again.",
    missingKey: "Missing API key id.",
    missingName: "Key name is required.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing project keys.",
    revoked: "Runtime key revoked.",
    unableCreate: "Unable to create runtime key.",
    unableRevoke: "Unable to revoke runtime key."
  },
  zh: {
    created: "运行 Key 已创建。现在复制保存，SkillHub 不会再次显示原始密钥。",
    missingKey: "缺少 API Key ID。",
    missingName: "请输入 Key 名称。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能管理项目 Key。",
    revoked: "运行 Key 已撤销。",
    unableCreate: "无法创建运行 Key。",
    unableRevoke: "无法撤销运行 Key。"
  }
} as const;

export async function createProjectApiKeyAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectKeyActionState,
  formData: FormData
): Promise<ProjectKeyActionState> {
  const labels = actionCopy[locale];
  const name = String(formData.get("name") ?? "").trim();
  const token = await getWorkspaceToken();

  if (!name) {
    return { message: labels.missingName, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/api-keys`, {
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableCreate);
    }

    const payload = (await response.json()) as {
      apiKey: {
        id: string;
        name: string;
        keyPrefix: string;
        keyLast4: string;
        apiKey: string;
      };
    };

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return {
      apiKey: payload.apiKey,
      message: labels.created,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableCreate,
      status: "error"
    };
  }
}

export async function revokeProjectApiKeyAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectKeyActionState,
  formData: FormData
): Promise<ProjectKeyActionState> {
  const labels = actionCopy[locale];
  const keyId = String(formData.get("keyId") ?? "").trim();
  const token = await getWorkspaceToken();

  if (!keyId) {
    return { message: labels.missingKey, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/api-keys/${encodeURIComponent(keyId)}/revoke`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRevoke);
    }

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return {
      message: labels.revoked,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableRevoke,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
