"use server";

import { getServerApiUrl } from "@/lib/api-url";
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
    missingToken: "Sign in with a SkillHub workspace account before managing subscriptions.",
    saved: "Subscription status updated.",
    unableSave: "Unable to update subscription status."
  },
  zh: {
    invalidStatus: "订阅状态必须是 active、paused 或 canceled。",
    missingSubscription: "缺少订阅 ID。",
    missingToken: "请先登录 SkillHub 工作区账号，才能管理订阅。",
    saved: "订阅状态已更新。",
    unableSave: "无法更新订阅状态。"
  }
} as const;

const sensitiveActionCopy = {
  en: {
    invalidCancelConfirmation: "Type CANCEL before canceling this project subscription.",
    invalidPauseConfirmation: "Type PAUSE before pausing this project subscription.",
    missingReason: "A reason is required before pausing or canceling a project subscription."
  },
  zh: {
    invalidCancelConfirmation: "\u53d6\u6d88\u9879\u76ee\u8ba2\u9605\u524d\uff0c\u8bf7\u8f93\u5165 CANCEL\u3002",
    invalidPauseConfirmation: "\u6682\u505c\u9879\u76ee\u8ba2\u9605\u524d\uff0c\u8bf7\u8f93\u5165 PAUSE\u3002",
    missingReason: "\u6682\u505c\u6216\u53d6\u6d88\u9879\u76ee\u8ba2\u9605\u524d\u5fc5\u987b\u586b\u5199\u539f\u56e0\u3002"
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
  const sensitiveLabels = sensitiveActionCopy[locale];
  const token = await getWorkspaceToken();
  const subscriptionId = String(formData.get("subscriptionId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!subscriptionId) {
    return { message: labels.missingSubscription, status: "error" };
  }

  if (!subscriptionStatuses.includes(status as (typeof subscriptionStatuses)[number])) {
    return { message: labels.invalidStatus, status: "error", updatedSubscriptionId: subscriptionId };
  }

  if (status === "paused" || status === "canceled") {
    const expectedConfirmation = status === "paused" ? "PAUSE" : "CANCEL";

    if (reason.length < 6) {
      return { message: sensitiveLabels.missingReason, status: "error", updatedSubscriptionId: subscriptionId };
    }

    if (confirmation.toUpperCase() !== expectedConfirmation) {
      return {
        message: status === "paused" ? sensitiveLabels.invalidPauseConfirmation : sensitiveLabels.invalidCancelConfirmation,
        status: "error",
        updatedSubscriptionId: subscriptionId
      };
    }
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedSubscriptionId: subscriptionId };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/subscriptions/${encodeURIComponent(subscriptionId)}/status`,
      {
        body: JSON.stringify({ reason, status }),
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
  return getServerApiUrl();
}
