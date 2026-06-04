"use server";

import { revalidatePath } from "next/cache";
import { getUserToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type SkillAbuseReportActionState = {
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidCategory: "Report category is invalid.",
    invalidSeverity: "Severity is invalid.",
    missingDescription: "Describe what happened before submitting.",
    missingSkill: "Missing skill slug.",
    missingTitle: "Enter a report title.",
    missingToken: "Sign in with a SkillHub user token before submitting a trust report.",
    saved: "Report submitted to the trust queue.",
    unableSave: "Unable to submit report."
  },
  zh: {
    invalidCategory: "举报分类无效。",
    invalidSeverity: "严重程度无效。",
    missingDescription: "请先描述发生了什么。",
    missingSkill: "缺少技能 slug。",
    missingTitle: "请输入举报标题。",
    missingToken: "请先用 SkillHub 用户 token 登录，才能提交信任安全举报。",
    saved: "举报已提交到信任安全队列。",
    unableSave: "无法提交举报。"
  }
} as const;

const categories = ["malicious", "security", "privacy", "copyright", "spam", "quality", "billing", "other"] as const;
const severities = ["low", "medium", "high", "critical"] as const;

export async function createSkillAbuseReportAction(
  skillSlug: string,
  locale: Locale,
  _previousState: SkillAbuseReportActionState,
  formData: FormData
): Promise<SkillAbuseReportActionState> {
  const labels = copy[locale];
  const token = await getUserToken();
  const normalizedSkillSlug = skillSlug.trim();
  const category = String(formData.get("category") ?? "").trim();
  const severity = String(formData.get("severity") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const evidenceUrl = String(formData.get("evidenceUrl") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim();

  if (!normalizedSkillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!categories.includes(category as (typeof categories)[number])) {
    return { message: labels.invalidCategory, status: "error" };
  }

  if (!severities.includes(severity as (typeof severities)[number])) {
    return { message: labels.invalidSeverity, status: "error" };
  }

  if (!title) {
    return { message: labels.missingTitle, status: "error" };
  }

  if (!description) {
    return { message: labels.missingDescription, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/skills/${encodeURIComponent(normalizedSkillSlug)}/abuse-reports`, {
      body: JSON.stringify({
        category,
        description,
        evidenceUrl: evidenceUrl || undefined,
        projectSlug: projectSlug || undefined,
        severity,
        title
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
