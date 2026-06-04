"use server";

import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type SkillFeedbackActionState = {
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidRating: "Choose a rating from 1 to 5.",
    missingBody: "Describe what happened when your agent used this skill.",
    missingSkill: "Missing skill slug.",
    missingTitle: "Enter a short feedback title.",
    missingToken: "Sign in with a SkillHub user token before submitting feedback.",
    saved: "Feedback submitted for moderation.",
    unableSave: "Unable to submit feedback."
  },
  zh: {
    invalidRating: "请选择 1 到 5 星评分。",
    missingBody: "请描述你的智能体使用这个技能后的真实情况。",
    missingSkill: "缺少技能 slug。",
    missingTitle: "请输入一句简短的反馈标题。",
    missingToken: "请先使用 SkillHub 用户 token 登录，然后再提交反馈。",
    saved: "反馈已提交，等待运营审核后公开展示。",
    unableSave: "无法提交反馈。"
  }
} as const;

export async function createSkillFeedbackAction(
  skillSlug: string,
  locale: Locale,
  _previousState: SkillFeedbackActionState,
  formData: FormData
): Promise<SkillFeedbackActionState> {
  const labels = copy[locale];
  const token = await getUserToken();
  const normalizedSkillSlug = skillSlug.trim();
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const useCase = String(formData.get("useCase") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim();

  if (!normalizedSkillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { message: labels.invalidRating, status: "error" };
  }

  if (!title) {
    return { message: labels.missingTitle, status: "error" };
  }

  if (!body) {
    return { message: labels.missingBody, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/skills/${encodeURIComponent(normalizedSkillSlug)}/feedback`, {
      body: JSON.stringify({
        body,
        projectSlug: projectSlug || undefined,
        rating,
        title,
        useCase: useCase || undefined
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

    revalidatePath(`/skills/${normalizedSkillSlug}`);

    return { message: labels.saved, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
