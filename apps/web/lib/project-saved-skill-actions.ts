"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectSavedSkillActionState = {
  message: string;
  savedSkillId?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    missingSavedSkill: "Missing saved skill id.",
    missingSkill: "Enter a skill slug before saving.",
    missingToken: "Sign in with a SkillHub workspace account before managing saved skills.",
    removed: "Saved skill removed.",
    saved: "Skill saved to this project.",
    unableRemove: "Unable to remove saved skill.",
    unableSave: "Unable to save skill."
  },
  zh: {
    missingSavedSkill: "缺少收藏记录 ID。",
    missingSkill: "请输入技能 slug 后再保存。",
    missingToken: "请先登录 SkillHub 工作区账号，才能管理收藏技能。",
    removed: "收藏技能已移除。",
    saved: "技能已保存到这个项目。",
    unableRemove: "无法移除收藏技能。",
    unableSave: "无法保存技能。"
  }
} as const;

export async function saveProjectSavedSkillAction(
  locale: Locale,
  projectSlug: string,
  _previousState: ProjectSavedSkillActionState,
  formData: FormData
): Promise<ProjectSavedSkillActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/saved-skills`, {
      body: JSON.stringify({
        collectionName: String(formData.get("collectionName") ?? "default").trim() || "default",
        skillSlug
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

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return { message: labels.saved, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableSave, status: "error" };
  }
}

export async function removeProjectSavedSkillAction(
  locale: Locale,
  projectSlug: string,
  _previousState: ProjectSavedSkillActionState,
  formData: FormData
): Promise<ProjectSavedSkillActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const savedSkillId = String(formData.get("savedSkillId") ?? "").trim();

  if (!savedSkillId) {
    return { message: labels.missingSavedSkill, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", savedSkillId };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/saved-skills/${encodeURIComponent(savedSkillId)}/remove`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: "POST"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRemove);
    }

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return { message: labels.removed, savedSkillId, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableRemove, savedSkillId, status: "error" };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
