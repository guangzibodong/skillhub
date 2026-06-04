"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type PublisherSkillActionState = {
  message: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    invalidBillingModel: "Billing model must be free, per_call, or subscription.",
    invalidPriceStatus: "Price status must be draft, active, or archived.",
    missingSkill: "Missing skill slug.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing publisher skills.",
    priceSaved: "Skill price saved.",
    reviewSubmitted: "Skill submitted for review.",
    unablePrice: "Unable to save skill price.",
    unableReview: "Unable to submit skill for review."
  },
  zh: {
    invalidBillingModel: "计费模式必须是 free、per_call 或 subscription。",
    invalidPriceStatus: "价格状态必须是 draft、active 或 archived。",
    missingSkill: "缺少技能 slug。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能管理发布者技能。",
    priceSaved: "技能价格已保存。",
    reviewSubmitted: "技能已提交审核。",
    unablePrice: "无法保存技能价格。",
    unableReview: "无法提交技能审核。"
  }
} as const;

const billingModels = ["free", "per_call", "subscription"] as const;
const priceStatuses = ["draft", "active", "archived"] as const;

export async function submitPublisherSkillReviewAction(
  locale: Locale,
  _previousState: PublisherSkillActionState,
  formData: FormData
): Promise<PublisherSkillActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/skills/${encodeURIComponent(skillSlug)}/submit`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableReview);
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath(`/skills/${skillSlug}`);

    return {
      message: labels.reviewSubmitted,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableReview,
      skillSlug,
      status: "error"
    };
  }
}

export async function setPublisherSkillPriceAction(
  locale: Locale,
  _previousState: PublisherSkillActionState,
  formData: FormData
): Promise<PublisherSkillActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const billingModel = String(formData.get("billingModel") ?? "free");
  const priceStatus = String(formData.get("status") ?? "draft");
  const unitAmountCents = Math.trunc(Number(formData.get("unitAmountCents") ?? "0"));

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!billingModels.includes(billingModel as (typeof billingModels)[number])) {
    return { message: labels.invalidBillingModel, skillSlug, status: "error" };
  }

  if (!priceStatuses.includes(priceStatus as (typeof priceStatuses)[number])) {
    return { message: labels.invalidPriceStatus, skillSlug, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/skills/${encodeURIComponent(skillSlug)}/prices`, {
      body: JSON.stringify({
        billingModel,
        currency: String(formData.get("currency") ?? "usd").trim().toLowerCase() || "usd",
        status: priceStatus,
        unitAmountCents: billingModel === "free" ? 0 : unitAmountCents
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unablePrice);
    }

    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
    revalidatePath(`/skills/${skillSlug}`);

    return {
      message: labels.priceSaved,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unablePrice,
      skillSlug,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
