"use server";

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
    missingProviderReference: "Provider reference is required when marking a payout paid.",
    missingReason: "A finance review reason is required.",
    missingToken: "Sign in with a finance/admin token or configure SKILLHUB_ADMIN_TOKEN before deciding payouts.",
    saved: "Payout decision recorded.",
    unableSave: "Unable to update payout."
  },
  zh: {
    invalidAction: "提现动作必须是 approve、mark_paid、fail 或 block。",
    missingPayout: "缺少提现 ID。",
    missingProviderReference: "标记已打款时必须填写服务商付款参考。",
    missingReason: "必须填写财务审核原因。",
    missingToken: "请先用财务或管理员 token 登录，或配置 SKILLHUB_ADMIN_TOKEN，才能处理提现。",
    saved: "提现决策已记录。",
    unableSave: "无法更新提现。"
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
    return { message: labels.missingProviderReference, payoutId, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, payoutId, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/payouts/${encodeURIComponent(payoutId)}/decision`, {
      body: JSON.stringify({
        action,
        providerReference: providerReference || undefined,
        reason
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
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
