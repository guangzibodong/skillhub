"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type PublisherSkillActionState = {
  feedbackId?: string;
  message: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    invalidBillingModel: "Billing model must be free, per_call, or subscription.",
    invalidManifest: "Manifest JSON is invalid.",
    invalidPriceStatus: "Price status must be draft, active, or archived.",
    missingFeedback: "Missing feedback id.",
    missingManifest: "Paste a SkillHub manifest before saving a version.",
    missingResponse: "Write a publisher response before saving.",
    missingSkill: "Missing skill slug.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing publisher skills.",
    priceSaved: "Skill price saved.",
    responseSaved: "Publisher response saved.",
    reviewSubmitted: "Skill submitted for review.",
    unablePrice: "Unable to save skill price.",
    unableResponse: "Unable to save publisher response.",
    unableReview: "Unable to submit skill for review.",
    unableVersion: "Unable to save skill version.",
    versionSaved: "Skill version saved."
  },
  zh: {
    invalidBillingModel: "计费模式必须是 free、per_call 或 subscription。",
    invalidManifest: "Manifest JSON 无效。",
    invalidPriceStatus: "价格状态必须是 draft、active 或 archived。",
    missingFeedback: "缺少反馈 ID。",
    missingManifest: "请先粘贴 SkillHub manifest 再保存版本。",
    missingResponse: "请先填写发布者回复。",
    missingSkill: "缺少技能 slug。",
    missingToken: "请先使用 SkillHub 用户 token 登录，或配置服务端备用 token，才能管理发布者技能。",
    priceSaved: "技能价格已保存。",
    responseSaved: "发布者回复已保存。",
    reviewSubmitted: "技能已提交审核。",
    unablePrice: "无法保存技能价格。",
    unableResponse: "无法保存发布者回复。",
    unableReview: "无法提交技能审核。",
    unableVersion: "无法保存技能版本。",
    versionSaved: "技能版本已保存。"
  }
} as const;

const appealCopy = {
  en: {
    missingReason: "Explain what changed or why the listing should be reviewed.",
    submitted: "Marketplace distribution review request submitted.",
    unable: "Unable to submit marketplace distribution review."
  },
  zh: {
    missingReason: "说明技能已如何改进，或为什么需要复审分发。",
    submitted: "市场分发复审申请已提交。",
    unable: "无法提交市场分发复审。"
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
  const version = String(formData.get("version") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const endpoint = version
      ? `${getApiUrl()}/v1/publisher/skills/${encodeURIComponent(skillSlug)}/versions/${encodeURIComponent(version)}/submit`
      : `${getApiUrl()}/v1/skills/${encodeURIComponent(skillSlug)}/submit`;
    const response = await fetch(endpoint, {
      body: version ? undefined : JSON.stringify({ version: undefined }),
      headers: {
        Authorization: `Bearer ${token}`,
        ...(version ? {} : { "Content-Type": "application/json" })
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableReview);
    }

    revalidatePublisherSkillPaths(skillSlug);
    revalidatePath("/admin");

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

export async function savePublisherSkillVersionAction(
  locale: Locale,
  _previousState: PublisherSkillActionState,
  formData: FormData
): Promise<PublisherSkillActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const manifestText = String(formData.get("manifest") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!manifestText) {
    return { message: labels.missingManifest, skillSlug, status: "error" };
  }

  let manifest: unknown;

  try {
    manifest = JSON.parse(manifestText);
  } catch {
    return { message: labels.invalidManifest, skillSlug, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/skills/${encodeURIComponent(skillSlug)}/versions`, {
      body: JSON.stringify({ manifest }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableVersion);
    }

    revalidatePublisherSkillPaths(skillSlug);

    return {
      message: labels.versionSaved,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableVersion,
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

    revalidatePublisherSkillPaths(skillSlug);

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

export async function requestMarketplaceCurationAppealAction(
  locale: Locale,
  _previousState: PublisherSkillActionState,
  formData: FormData
): Promise<PublisherSkillActionState> {
  const labels = actionCopy[locale];
  const appealLabels = appealCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const appealReason = String(formData.get("appealReason") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!appealReason) {
    return { message: appealLabels.missingReason, skillSlug, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/skills/${encodeURIComponent(skillSlug)}/marketplace-appeals`, {
      body: JSON.stringify({
        appealReason,
        evidenceUrl: String(formData.get("evidenceUrl") ?? "").trim(),
        requestedPlacement: String(formData.get("requestedPlacement") ?? "standard").trim()
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? appealLabels.unable);
    }

    revalidatePath("/dashboard");
    revalidatePath("/publisher");
    revalidatePath("/admin");

    return {
      message: appealLabels.submitted,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : appealLabels.unable,
      skillSlug,
      status: "error"
    };
  }
}

export async function respondToSkillFeedbackAction(
  locale: Locale,
  _previousState: PublisherSkillActionState,
  formData: FormData
): Promise<PublisherSkillActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const feedbackId = String(formData.get("feedbackId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!skillSlug) {
    return { feedbackId, message: labels.missingSkill, status: "error" };
  }

  if (!feedbackId) {
    return { message: labels.missingFeedback, skillSlug, status: "error" };
  }

  if (!body) {
    return { feedbackId, message: labels.missingResponse, skillSlug, status: "error" };
  }

  if (!token) {
    return { feedbackId, message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/skill-feedback/${encodeURIComponent(feedbackId)}/response`, {
      body: JSON.stringify({ body }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableResponse);
    }

    revalidatePublisherSkillPaths(skillSlug);

    return {
      feedbackId,
      message: labels.responseSaved,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      feedbackId,
      message: error instanceof Error ? error.message : labels.unableResponse,
      skillSlug,
      status: "error"
    };
  }
}

function revalidatePublisherSkillPaths(skillSlug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/publisher");
  revalidatePath("/marketplace");
  revalidatePath("/registry");
  revalidatePath(`/skills/${skillSlug}`);
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
