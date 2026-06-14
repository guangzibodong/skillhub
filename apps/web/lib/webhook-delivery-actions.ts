"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { AdminWebhookDeliveryProcessResult } from "@/lib/ops-data";

export type WebhookDeliveryProcessActionState = {
  message: string;
  result?: AdminWebhookDeliveryProcessResult;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    missingToken: "Sign in with an admin or support account before processing webhook deliveries.",
    processSaved: "Webhook processor finished.",
    unableProcess: "Unable to process webhook outbox."
  },
  zh: {
    missingToken: "请先使用具备 admin/support 角色的账号登录，才能处理 Webhook 投递。",
    processSaved: "Webhook \u6295\u9012\u5904\u7406\u5668\u5df2\u5b8c\u6210\u3002",
    unableProcess: "\u65e0\u6cd5\u5904\u7406 Webhook outbox\u3002"
  }
} as const;

export async function processWebhookDeliveriesAction(
  locale: Locale,
  _previousState: WebhookDeliveryProcessActionState,
  formData: FormData
): Promise<WebhookDeliveryProcessActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/webhook-deliveries/process`, {
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

    const result = (await response.json()) as AdminWebhookDeliveryProcessResult;
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
  return getServerApiUrl();
}
