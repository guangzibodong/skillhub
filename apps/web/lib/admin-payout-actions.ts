"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { PayoutRecord } from "@/lib/ops-data";

export type AdminPayoutActionState = {
  message: string;
  payout?: PayoutRecord;
  payoutId?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidAction: "Payout action must be approve, mark_paid, fail, or block.",
    missingPayout: "Missing payout id.",
    missingReason: "A finance review reason is required.",
    missingRetryCondition: "A retry condition is required when blocking a payout.",
    missingToken: "Sign in with a finance or admin account before deciding payouts.",
    missingTransferReference: "Transfer reference is required when marking a payout paid.",
    saved: "Payout decision recorded.",
    unableSave: "Unable to update payout."
  },
  zh: {
    invalidAction: "\u63d0\u73b0\u52a8\u4f5c\u5fc5\u987b\u662f approve\u3001mark_paid\u3001fail \u6216 block\u3002",
    missingPayout: "\u7f3a\u5c11\u63d0\u73b0 ID\u3002",
    missingReason: "\u5fc5\u987b\u586b\u5199\u8d22\u52a1\u5ba1\u6838\u539f\u56e0\u3002",
    missingRetryCondition: "\u963b\u65ad\u63d0\u73b0\u65f6\u5fc5\u987b\u586b\u5199\u518d\u6b21\u7533\u8bf7\u6761\u4ef6\u3002",
    missingToken: "请先使用具备财务或管理员权限的账号登录，才能处理提现。",
    missingTransferReference: "\u6807\u8bb0\u5df2\u6253\u6b3e\u65f6\u5fc5\u987b\u586b\u5199\u8f6c\u8d26\u51ed\u8bc1\u6216\u6d41\u6c34\u53f7\u3002",
    saved: "\u63d0\u73b0\u51b3\u7b56\u5df2\u8bb0\u5f55\u3002",
    unableSave: "\u65e0\u6cd5\u66f4\u65b0\u63d0\u73b0\u3002"
  }
} as const;

const actions = ["approve", "mark_paid", "fail", "block"] as const;

export async function decideAdminPayoutAction(
  locale: Locale,
  _previousState: AdminPayoutActionState,
  formData: FormData
): Promise<AdminPayoutActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const payoutId = String(formData.get("payoutId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const providerReference = String(formData.get("providerReference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const retryCondition = String(formData.get("retryCondition") ?? "").trim();

  if (!payoutId) {
    return { message: labels.missingPayout, status: "error" };
  }

  if (!actions.includes(action as (typeof actions)[number])) {
    return { message: labels.invalidAction, payoutId, status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, payoutId, status: "error" };
  }

  if (action === "mark_paid" && !providerReference) {
    return { message: labels.missingTransferReference, payoutId, status: "error" };
  }

  if (action === "block" && !retryCondition) {
    return { message: labels.missingRetryCondition, payoutId, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, payoutId, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision`, {
      body: JSON.stringify({
        action,
        providerReference: providerReference || undefined,
        reason,
        retryCondition: retryCondition || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    const payload = (await response.json()) as { payout: PayoutRecord };

    revalidatePath("/admin");
    revalidatePath("/publisher");
    revalidatePath("/dashboard");

    return { message: labels.saved, payout: payload.payout, payoutId, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      payoutId,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
