"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectSubscriptionActionState = {
  message: string;
  status: "idle" | "success" | "error";
  updatedSubscriptionId?: string;
};

const actionCopy = {
  en: {
    invalidStatus: "Subscription status must be active, paused, or canceled.",
    missingSubscription: "Missing subscription id.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing subscriptions.",
    saved: "Subscription status updated.",
    unableSave: "Unable to update subscription status."
  },
  zh: {
    invalidStatus: "订阅状态必须是 active、paused 或 canceled。",
    missingSubscription: "缺少订阅 ID。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能管理订阅。",
    saved: "订阅状态已更新。",
    unableSave: "无法更新订阅状态。"
  }
} as const;

const subscriptionStatuses = ["active", "paused", "canceled"] as const;

export async function updateProjectSubscriptionStatusAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectSubscriptionActionState,
  formData: FormData
): Promise<ProjectSubscriptionActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!subscriptionId) {
    return { message: labels.missingSubscription, status: "error" };
  }

  if (!subscriptionStatuses.includes(status as (typeof subscriptionStatuses)[number])) {
    return { message: labels.invalidStatus, status: "error", updatedSubscriptionId: subscriptionId };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedSubscriptionId: subscriptionId };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/subscriptions/${encodeURIComponent(subscriptionId)}/status`,
      {
        body: JSON.stringify({ status }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "PUT"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return {
      message: labels.saved,
      status: "success",
      updatedSubscriptionId: subscriptionId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
      updatedSubscriptionId: subscriptionId
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
