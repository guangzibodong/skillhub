"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { DisputeRecord, RefundRecord } from "@/lib/ops-data";

export type AdminAdjustmentActionState = {
  dispute?: DisputeRecord;
  message: string;
  recordId?: string;
  recordType?: "dispute" | "refund";
  refund?: RefundRecord;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidDisputeStatus: "Dispute status must be open, warning_needs_response, won, or lost.",
    invalidRefundAction: "Refund action must be approve, reject, post, or fail.",
    missingDispute: "Missing dispute id.",
    missingReason: "A finance decision reason is required.",
    missingRefund: "Missing refund id.",
    missingToken: "Sign in with a finance or admin account before handling refunds and disputes.",
    savedDispute: "Dispute decision recorded.",
    savedRefund: "Refund decision recorded.",
    unableDispute: "Unable to update dispute.",
    unableRefund: "Unable to update refund."
  },
  zh: {
    invalidDisputeStatus: "争议状态必须是 open、warning_needs_response、won 或 lost。",
    invalidRefundAction: "退款动作必须是 approve、reject、post 或 fail。",
    missingDispute: "缺少争议 ID。",
    missingReason: "必须填写财务处理原因。",
    missingRefund: "缺少退款 ID。",
    missingToken: "请先使用具备财务或管理员权限的账号登录，才能处理退款和争议。",
    savedDispute: "争议决策已记录。",
    savedRefund: "退款决策已记录。",
    unableDispute: "无法更新争议。",
    unableRefund: "无法更新退款。"
  }
} as const;

const refundActions = ["approve", "reject", "post", "fail"] as const;
const disputeStatuses = ["open", "warning_needs_response", "won", "lost"] as const;

export async function decideAdminRefundAction(
  locale: Locale,
  _previousState: AdminAdjustmentActionState,
  formData: FormData
): Promise<AdminAdjustmentActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const refundId = String(formData.get("refundId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const providerReference = String(formData.get("providerReference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!refundId) {
    return { message: labels.missingRefund, recordType: "refund", status: "error" };
  }

  if (!refundActions.includes(action as (typeof refundActions)[number])) {
    return { message: labels.invalidRefundAction, recordId: refundId, recordType: "refund", status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, recordId: refundId, recordType: "refund", status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, recordId: refundId, recordType: "refund", status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/finance/refunds/${encodeURIComponent(refundId)}/decision`, {
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
      throw new Error(payload.error ?? labels.unableRefund);
    }

    const payload = (await response.json()) as { refund: RefundRecord };
    revalidateFinancePaths();

    return { message: labels.savedRefund, recordId: refundId, recordType: "refund", refund: payload.refund, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableRefund,
      recordId: refundId,
      recordType: "refund",
      status: "error"
    };
  }
}

export async function decideAdminDisputeAction(
  locale: Locale,
  _previousState: AdminAdjustmentActionState,
  formData: FormData
): Promise<AdminAdjustmentActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const disputeId = String(formData.get("disputeId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const postRefund = formData.get("postRefund") === "on";

  if (!disputeId) {
    return { message: labels.missingDispute, recordType: "dispute", status: "error" };
  }

  if (!disputeStatuses.includes(status as (typeof disputeStatuses)[number])) {
    return { message: labels.invalidDisputeStatus, recordId: disputeId, recordType: "dispute", status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, recordId: disputeId, recordType: "dispute", status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, recordId: disputeId, recordType: "dispute", status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/finance/disputes/${encodeURIComponent(disputeId)}/decision`, {
      body: JSON.stringify({
        postRefund,
        reason,
        status
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableDispute);
    }

    const payload = (await response.json()) as { dispute: DisputeRecord };
    revalidateFinancePaths();

    return { dispute: payload.dispute, message: labels.savedDispute, recordId: disputeId, recordType: "dispute", status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableDispute,
      recordId: disputeId,
      recordType: "dispute",
      status: "error"
    };
  }
}

function revalidateFinancePaths() {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/publisher");
  revalidatePath("/developer");
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
