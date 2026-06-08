"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectUpdateActionState = {
  message: string;
  status: "idle" | "success" | "error";
  updatedUpdateId?: string;
};

const actionCopy = {
  en: {
    invalidStatus: "Update action must be acknowledged, scheduled, adopted, or ignored.",
    missingToken: "Sign in with a SkillHub workspace account before handling project updates.",
    missingUpdate: "Missing update id.",
    saved: "Update action saved.",
    unableSave: "Unable to save update action."
  },
  zh: {
    invalidStatus: "更新处理状态必须是 acknowledged、scheduled、adopted 或 ignored。",
    missingToken: "请先登录 SkillHub 工作区账号，才能处理项目更新。",
    missingUpdate: "缺少更新 ID。",
    saved: "更新处理状态已保存。",
    unableSave: "无法保存更新处理状态。"
  }
} as const;

const updateActionStatuses = ["acknowledged", "scheduled", "adopted", "ignored"] as const;

export async function updateProjectUpdateAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectUpdateActionState,
  formData: FormData
): Promise<ProjectUpdateActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const updateId = String(formData.get("updateId") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const scheduledFor = String(formData.get("scheduledFor") ?? "").trim();

  if (!updateId) {
    return { message: labels.missingUpdate, status: "error" };
  }

  if (!updateActionStatuses.includes(status as (typeof updateActionStatuses)[number])) {
    return { message: labels.invalidStatus, status: "error", updatedUpdateId: updateId };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedUpdateId: updateId };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/update-inbox/${encodeURIComponent(updateId)}/action`,
      {
        body: JSON.stringify({
          note: note || undefined,
          scheduledFor: scheduledFor || undefined,
          status
        }),
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
      updatedUpdateId: updateId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
      updatedUpdateId: updateId
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
