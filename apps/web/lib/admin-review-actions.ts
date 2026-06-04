"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type AdminReviewActionState = {
  message: string;
  reviewId?: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidDecision: "Decision must be approved, rejected, or blocked.",
    missingNotes: "Reviewer notes are required.",
    missingReview: "Missing review id.",
    missingToken: "Sign in with a reviewer/admin token or configure SKILLHUB_ADMIN_TOKEN before deciding skill reviews.",
    saved: "Review decision recorded.",
    unableSave: "Unable to record review decision."
  },
  zh: {
    invalidDecision: "审核决定必须是 approved、rejected 或 blocked。",
    missingNotes: "必须填写审核备注。",
    missingReview: "缺少审核 ID。",
    missingToken: "请先用审核员或管理员 token 登录，或配置 SKILLHUB_ADMIN_TOKEN，才能处理技能审核。",
    saved: "审核决定已记录。",
    unableSave: "无法记录审核决定。"
  }
} as const;

const decisions = ["approved", "rejected", "blocked"] as const;

export async function decideAdminReviewAction(
  locale: Locale,
  _previousState: AdminReviewActionState,
  formData: FormData
): Promise<AdminReviewActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const reviewId = String(formData.get("reviewId") ?? "").trim();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!reviewId) {
    return { message: labels.missingReview, status: "error" };
  }

  if (!decisions.includes(status as (typeof decisions)[number])) {
    return { message: labels.invalidDecision, reviewId, skillSlug, status: "error" };
  }

  if (!notes) {
    return { message: labels.missingNotes, reviewId, skillSlug, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, reviewId, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/reviews/${encodeURIComponent(reviewId)}/decision`, {
      body: JSON.stringify({
        notes,
        status
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
    revalidatePath("/publisher");
    revalidatePath("/marketplace");
    if (skillSlug) {
      revalidatePath(`/skills/${skillSlug}`);
    }

    return { message: labels.saved, reviewId, skillSlug, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      reviewId,
      skillSlug,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
