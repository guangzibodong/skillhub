"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { PayoutRecord } from "@/lib/ops-data";

export type PublisherPayoutActionState = {
  message: string;
  payout?: PayoutRecord;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    missingToken: "Sign in with a SkillHub user token before requesting payouts.",
    requested: "Payout request created. Available balances are now reserved for finance review.",
    unableRequest: "Unable to request payout."
  },
  zh: {
    missingToken: "请先使用 SkillHub 用户 token 登录，才能申请提现。",
    requested: "提现申请已创建，可用余额已锁定并进入财务流程。",
    unableRequest: "无法申请提现。"
  }
} as const;

export async function requestPublisherPayoutAction(
  locale: Locale,
  _previousState: PublisherPayoutActionState,
  formData: FormData
): Promise<PublisherPayoutActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/payouts`, {
      body: JSON.stringify({
        currency: String(formData.get("currency") ?? "usd").trim().toLowerCase() || "usd",
        publisherProfileId: String(formData.get("publisherProfileId") ?? "").trim() || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRequest);
    }

    const payload = (await response.json()) as { payout: PayoutRecord };

    revalidatePath("/dashboard");
    revalidatePath("/publisher");

    return {
      message: labels.requested,
      payout: payload.payout,
      status: "success"
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableRequest, status: "error" };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
