"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type AccountSessionActionState = {
  message: string;
  status: "idle" | "success" | "error";
  tokenId?: string;
};

const copy = {
  en: {
    missingSession: "Missing account session id.",
    missingToken: "Sign in with a SkillHub user session before managing account security.",
    revoked: "Account session revoked.",
    unableRevoke: "Unable to revoke this account session."
  },
  zh: {
    missingSession: "缺少账号会话 ID。",
    missingToken: "请先登录 SkillHub 用户会话，才能管理账号安全。",
    revoked: "账号会话已撤销。",
    unableRevoke: "无法撤销这个账号会话。"
  }
} as const;

export async function revokeAccountSessionAction(
  locale: Locale,
  _previousState: AccountSessionActionState,
  formData: FormData
): Promise<AccountSessionActionState> {
  const labels = copy[locale];
  const tokenId = String(formData.get("tokenId") ?? "").trim();
  const token = await getUserToken();

  if (!tokenId) {
    return { message: labels.missingSession, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", tokenId };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/account/sessions/${encodeURIComponent(tokenId)}/revoke`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRevoke);
    }

    revalidatePath("/account");

    return {
      message: labels.revoked,
      status: "success",
      tokenId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableRevoke,
      status: "error",
      tokenId
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
