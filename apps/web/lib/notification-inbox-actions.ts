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
    markedAllRead: "Unread notifications marked read.",
    markedRead: "Notification marked read.",
    missingNotification: "Missing notification id.",
    missingToken: "Sign in with a SkillHub user account before managing your notification inbox.",
    unableMarkAllRead: "Unable to mark notifications read.",
    unableMarkRead: "Unable to mark notification read."
  },
  zh: {
    markedAllRead: "未读通知已标记为已读。",
    markedRead: "通知已标记为已读。",
    missingNotification: "缺少通知 ID。",
    missingToken: "请先登录 SkillHub 用户账号，才能管理通知收件箱。",
    unableMarkAllRead: "无法标记通知。",
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

    revalidateNotificationSurfaces();

    return { message: labels.markedRead, notificationId, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableMarkRead,
      notificationId,
      status: "error"
    };
  }
}

export async function markAllNotificationsReadAction(
  locale: Locale,
  _previousState: NotificationInboxActionState,
  _formData: FormData
): Promise<NotificationInboxActionState> {
  const labels = copy[locale];
  const token = await getUserToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/notifications/read-all`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableMarkAllRead);
    }

    revalidateNotificationSurfaces();

    return { message: labels.markedAllRead, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableMarkAllRead,
      status: "error"
    };
  }
}

function revalidateNotificationSurfaces() {
  revalidatePath("/dashboard");
  revalidatePath("/developer");
  revalidatePath("/publisher");
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
