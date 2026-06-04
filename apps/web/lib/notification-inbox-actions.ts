"use server";

import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type NotificationInboxActionState = {
  message: string;
  notificationId?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    markedRead: "Notification marked read.",
    missingNotification: "Missing notification id.",
    missingToken: "Sign in with a SkillHub user token before managing your notification inbox.",
    unableMarkRead: "Unable to mark notification read."
  },
  zh: {
    markedRead: "通知已标记为已读。",
    missingNotification: "缺少通知 ID。",
    missingToken: "请先用 SkillHub 用户 token 登录，才能管理通知收件箱。",
    unableMarkRead: "无法标记通知。"
  }
} as const;

export async function markNotificationReadAction(
  locale: Locale,
  _previousState: NotificationInboxActionState,
  formData: FormData
): Promise<NotificationInboxActionState> {
  const labels = copy[locale];
  const token = await getUserToken();
  const notificationId = String(formData.get("notificationId") ?? "").trim();

  if (!notificationId) {
    return { message: labels.missingNotification, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, notificationId, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/notifications/${encodeURIComponent(notificationId)}/read`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableMarkRead);
    }

    revalidatePath("/dashboard");

    return { message: labels.markedRead, notificationId, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableMarkRead,
      notificationId,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
