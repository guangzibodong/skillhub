"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type AccountIdentityActionState = {
  message: string;
  provider?: "github" | "google";
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    disconnected: "Login method disconnected.",
    invalidProvider: "Only Google and GitHub login methods can be disconnected here.",
    missingToken: "Sign in with a SkillHub user session before managing login methods.",
    unableDisconnect: "Unable to disconnect this login method."
  },
  zh: {
    disconnected: "登录方式已解绑。",
    invalidProvider: "这里只能解绑 Google 和 GitHub 登录方式。",
    missingToken: "请先登录 SkillHub 用户会话，才能管理登录方式。",
    unableDisconnect: "无法解绑这个登录方式。"
  }
} as const;

export async function disconnectAccountIdentityAction(
  locale: Locale,
  _previousState: AccountIdentityActionState,
  formData: FormData
): Promise<AccountIdentityActionState> {
  const labels = copy[locale];
  const provider = String(formData.get("provider") ?? "").trim();
  const token = await getUserToken();

  if (provider !== "google" && provider !== "github") {
    return { message: labels.invalidProvider, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, provider, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/account/identities/${provider}/disconnect`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableDisconnect);
    }

    revalidatePath("/account");

    return {
      message: labels.disconnected,
      provider,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableDisconnect,
      provider,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
