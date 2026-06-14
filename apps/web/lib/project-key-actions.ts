"use server";

import { getServerApiUrl } from "@/lib/api-url";
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
    missingToken: "Sign in with a SkillHub workspace account before managing project keys.",
    revoked: "Runtime key revoked.",
    unableCreate: "Unable to create runtime key.",
    unableRevoke: "Unable to revoke runtime key."
  },
  zh: {
    created: "运行 Key 已创建。现在复制保存，SkillHub 不会再次显示原始密钥。",
    missingKey: "缺少 API Key ID。",
    missingName: "请输入 Key 名称。",
    missingToken: "请先登录 SkillHub 工作区账号，才能管理项目 Key。",
    revoked: "运行 Key 已撤销。",
    unableCreate: "无法创建运行 Key。",
    unableRevoke: "无法撤销运行 Key。"
  }
} as const;

const sensitiveActionCopy = {
  en: {
    invalidRevokeConfirmation: "Type REVOKE or the key last 4 characters before revoking this runtime key.",
    missingRevokeReason: "A revocation reason is required before this runtime key can be revoked."
  },
  zh: {
    invalidRevokeConfirmation: "\u64a4\u9500\u8fd0\u884c Key \u524d\uff0c\u8bf7\u8f93\u5165 REVOKE \u6216 Key \u540e 4 \u4f4d\u3002",
    missingRevokeReason: "\u64a4\u9500\u8fd0\u884c Key \u524d\u5fc5\u987b\u586b\u5199\u539f\u56e0\u3002"
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
  const sensitiveLabels = sensitiveActionCopy[locale];
  const keyId = String(formData.get("keyId") ?? "").trim();
  const keyLast4 = String(formData.get("keyLast4") ?? "").trim();
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const token = await getWorkspaceToken();

  if (!keyId) {
    return { message: labels.missingKey, status: "error" };
  }

  if (reason.length < 6) {
    return { message: sensitiveLabels.missingRevokeReason, status: "error" };
  }

  if (!isValidRevokeConfirmation(confirmation, keyLast4)) {
    return { message: sensitiveLabels.invalidRevokeConfirmation, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/api-keys/${encodeURIComponent(keyId)}/revoke`,
      {
        body: JSON.stringify({ reason }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
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
  return getServerApiUrl();
}

function isValidRevokeConfirmation(confirmation: string, keyLast4: string) {
  if (confirmation.toUpperCase() === "REVOKE") {
    return true;
  }

  return Boolean(keyLast4) && confirmation.toLowerCase() === keyLast4.toLowerCase();
}
