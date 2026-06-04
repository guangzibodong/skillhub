"use server";

import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n";

export type ProjectInstallActionState = {
  message: string;
  status: "idle" | "success" | "error";
  updatedSkillSlug?: string;
};

const actionCopy = {
  en: {
    invalidSkill: "Missing skill slug.",
    invalidStatus: "Install status must be installed, suspended, or removed.",
    missingToken: "Set SKILLHUB_USER_TOKEN or SKILLHUB_ADMIN_TOKEN before updating installed skills.",
    saved: "Installed skill status updated.",
    unableSave: "Unable to update installed skill."
  },
  zh: {
    invalidSkill: "缺少技能 slug。",
    invalidStatus: "安装状态必须是 installed、suspended 或 removed。",
    missingToken: "请先配置 SKILLHUB_USER_TOKEN 或 SKILLHUB_ADMIN_TOKEN，才能更新已安装技能。",
    saved: "已安装技能状态已更新。",
    unableSave: "无法更新已安装技能。"
  }
} as const;

const installStatuses = ["installed", "suspended", "removed"] as const;

export async function updateProjectSkillInstallStatusAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectInstallActionState,
  formData: FormData
): Promise<ProjectInstallActionState> {
  const labels = actionCopy[locale];
  const token = getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!skillSlug) {
    return { message: labels.invalidSkill, status: "error" };
  }

  if (!installStatuses.includes(status as (typeof installStatuses)[number])) {
    return { message: labels.invalidStatus, status: "error", updatedSkillSlug: skillSlug };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedSkillSlug: skillSlug };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/installed-skills/${encodeURIComponent(skillSlug)}/status`,
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
      updatedSkillSlug: skillSlug
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
      updatedSkillSlug: skillSlug
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}

function getWorkspaceToken() {
  return process.env.SKILLHUB_USER_TOKEN ?? process.env.SKILLHUB_ADMIN_TOKEN;
}
