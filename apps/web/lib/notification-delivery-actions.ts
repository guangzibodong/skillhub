"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { AdminNotificationDelivery, AdminNotificationDeliveryProcessResult } from "@/lib/ops-data";

export type NotificationDeliveryActionState = {
  delivery?: AdminNotificationDelivery;
  deliveryId?: string;
  message: string;
  status: "idle" | "success" | "error";
};

export type NotificationDeliveryProcessActionState = {
  message: string;
  result?: AdminNotificationDeliveryProcessResult;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    missingAction: "Choose a delivery action.",
    missingReason: "A delivery reason is required.",
    missingToken: "Sign in with an admin or support account before managing delivery events.",
    processSaved: "Delivery processor finished.",
    saved: "Delivery event updated.",
    unableProcess: "Unable to process delivery queue.",
    unableSave: "Unable to update delivery event."
  },
  zh: {
    missingAction: "\u8bf7\u9009\u62e9\u6295\u9012\u64cd\u4f5c\u3002",
    missingReason: "\u9700\u8981\u586b\u5199\u6295\u9012\u5904\u7406\u539f\u56e0\u3002",
    missingToken: "请先使用具备 admin/support 角色的账号登录，才能管理投递事件。",
    processSaved: "\u6295\u9012\u5904\u7406\u5668\u5df2\u5b8c\u6210\u3002",
    saved: "\u6295\u9012\u4e8b\u4ef6\u5df2\u66f4\u65b0\u3002",
    unableProcess: "\u65e0\u6cd5\u5904\u7406\u6295\u9012\u961f\u5217\u3002",
    unableSave: "\u65e0\u6cd5\u66f4\u65b0\u6295\u9012\u4e8b\u4ef6\u3002"
  }
} as const;

const actions = ["mark_sent", "mark_failed", "retry", "skip"] as const;

export async function decideNotificationDeliveryAction(
  locale: Locale,
  _previousState: NotificationDeliveryActionState,
  formData: FormData
): Promise<NotificationDeliveryActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const deliveryId = String(formData.get("deliveryId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!deliveryId) {
    return { deliveryId, message: labels.unableSave, status: "error" };
  }

  if (!actions.includes(action as (typeof actions)[number])) {
    return { deliveryId, message: labels.missingAction, status: "error" };
  }

  if (!reason) {
    return { deliveryId, message: labels.missingReason, status: "error" };
  }

  if (!token) {
    return { deliveryId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/notification-deliveries/${encodeURIComponent(deliveryId)}/decision`, {
      body: JSON.stringify({
        action,
        nextAttemptAt: String(formData.get("nextAttemptAt") ?? "").trim() || undefined,
        provider: String(formData.get("provider") ?? "").trim() || undefined,
        providerMessageId: String(formData.get("providerMessageId") ?? "").trim() || undefined,
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

    const payload = (await response.json()) as { delivery: AdminNotificationDelivery };
    revalidatePath("/admin");

    return {
      delivery: payload.delivery,
      deliveryId,
      message: labels.saved,
      status: "success"
    };
  } catch (error) {
    return {
      deliveryId,
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error"
    };
  }
}

export async function processNotificationDeliveriesAction(
  locale: Locale,
  _previousState: NotificationDeliveryProcessActionState,
  formData: FormData
): Promise<NotificationDeliveryProcessActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/notification-deliveries/process`, {
      body: JSON.stringify({
        limit: Number(formData.get("limit") ?? "10"),
        mode: String(formData.get("mode") ?? "deliver").trim()
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableProcess);
    }

    const result = (await response.json()) as AdminNotificationDeliveryProcessResult;
    revalidatePath("/admin");

    return {
      message: labels.processSaved,
      result,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableProcess,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
