"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type SkillFeedbackDecisionActionState = {
  feedbackId?: string;
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidAction: "Action must be publish, hide, reject, or reopen.",
    missingFeedback: "Missing feedback id.",
    missingReason: "Decision reason is required.",
    missingToken: "Sign in with a platform admin token or configure SKILLHUB_ADMIN_TOKEN before handling feedback.",
    saved: "Feedback decision recorded.",
    unableSave: "Unable to update feedback."
  },
  zh: {
    invalidAction: "处理动作必须是 publish、hide、reject 或 reopen。",
    missingFeedback: "缺少反馈 ID。",
    missingReason: "必须填写处理原因。",
    missingToken: "请先使用平台管理员 token 登录，或配置 SKILLHUB_ADMIN_TOKEN 后再处理反馈。",
    saved: "反馈处理已记录。",
    unableSave: "无法更新反馈。"
  }
} as const;

const allowedActions = ["publish", "hide", "reject", "reopen"] as const;

export async function decideSkillFeedbackAction(
  locale: Locale,
  _previousState: SkillFeedbackDecisionActionState,
  formData: FormData
): Promise<SkillFeedbackDecisionActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const feedbackId = String(formData.get("feedbackId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!feedbackId) {
    return { message: labels.missingFeedback, status: "error" };
  }

  if (!allowedActions.includes(action as (typeof allowedActions)[number])) {
    return { feedbackId, message: labels.invalidAction, status: "error" };
  }

  if (!reason) {
    return { feedbackId, message: labels.missingReason, status: "error" };
  }

  if (!token) {
    return { feedbackId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/skill-feedback/${encodeURIComponent(feedbackId)}/decision`, {
      body: JSON.stringify({
        action,
        reason
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

    revalidatePath("/admin");

    return { feedbackId, message: labels.saved, status: "success" };
  } catch (error) {
    return {
      feedbackId,
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
