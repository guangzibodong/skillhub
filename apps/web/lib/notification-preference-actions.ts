"use server";

import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type NotificationPreferenceActionState = {
  eventType?: string;
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    missingEventType: "Missing notification topic.",
    missingToken:
      "Sign in with a SkillHub user token before managing notification preferences.",
    saved: "Notification preference saved.",
    unableSave: "Unable to save notification preference.",
  },
  zh: {
    missingEventType: "缺少通知主题。",
    missingToken: "请先用 SkillHub 用户 token 登录，才能管理通知偏好。",
    saved: "通知偏好已保存。",
    unableSave: "无法保存通知偏好。",
  },
} as const;

export async function updateNotificationPreferenceAction(
  locale: Locale,
  _previousState: NotificationPreferenceActionState,
  formData: FormData,
): Promise<NotificationPreferenceActionState> {
  const labels = copy[locale];
  const token = await getUserToken();
  const eventType = String(formData.get("eventType") ?? "").trim();

  if (!eventType) {
    return { message: labels.missingEventType, status: "error" };
  }

  if (!token) {
    return { eventType, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/notifications/preferences`,
      {
        body: JSON.stringify({
          emailEnabled: formData.get("emailEnabled") === "on",
          eventType,
          inAppEnabled: formData.get("inAppEnabled") === "on",
          webhookEnabled: formData.get("webhookEnabled") === "on",
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(payload.error ?? labels.unableSave);
    }

    revalidatePath("/dashboard");

    return { eventType, message: labels.saved, status: "success" };
  } catch (error) {
    return {
      eventType,
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
