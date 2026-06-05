"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type PublisherAccountActionState = {
  message: string;
  onboardingUrl?: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    missingDisplayName: "Enter a publisher display name.",
    missingTarget: "Create an onboarding session or payout account before updating readiness.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before managing publisher settings.",
    onboardingCreated: "Payout onboarding session created.",
    onboardingUpdated: "Payout readiness state updated.",
    profileSaved: "Publisher profile saved.",
    unableOnboarding: "Unable to create payout onboarding.",
    unableProfile: "Unable to save publisher profile.",
    unableReadiness: "Unable to update payout readiness."
  },
  zh: {
    missingDisplayName: "请输入发布者展示名称。",
    missingTarget: "请先创建入驻会话或收款账户，再更新收款状态。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能管理发布者设置。",
    onboardingCreated: "收款入驻会话已创建。",
    onboardingUpdated: "收款准备状态已更新。",
    profileSaved: "发布者资料已保存。",
    unableOnboarding: "无法创建收款入驻会话。",
    unableProfile: "无法保存发布者资料。",
    unableReadiness: "无法更新收款准备状态。"
  }
} as const;

export async function updatePublisherProfileAction(
  locale: Locale,
  _previousState: PublisherAccountActionState,
  formData: FormData
): Promise<PublisherAccountActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!displayName) {
    return { message: labels.missingDisplayName, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/profile`, {
      body: JSON.stringify({ displayName }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableProfile);
    }

    revalidatePublisherPaths();

    return { message: labels.profileSaved, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableProfile, status: "error" };
  }
}

export async function acceptPublisherTermsAction(
  locale: Locale,
  _previousState: PublisherAccountActionState,
  formData: FormData
): Promise<PublisherAccountActionState> {
  const token = await getWorkspaceToken();
  const labels = actionCopy[locale];
  const acceptedTerms =
    locale === "zh" ? "\u53d1\u5e03\u8005\u8fd0\u8425\u6761\u6b3e\u5df2\u63a5\u53d7\u3002" : "Publisher operating terms accepted.";
  const unableAcceptTerms =
    locale === "zh" ? "\u65e0\u6cd5\u63a5\u53d7\u53d1\u5e03\u8005\u8fd0\u8425\u6761\u6b3e\u3002" : "Unable to accept publisher operating terms.";

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/terms/accept`, {
      body: JSON.stringify({
        termsVersion: String(formData.get("termsVersion") ?? "").trim() || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? unableAcceptTerms);
    }

    revalidatePublisherPaths();

    return { message: acceptedTerms, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : unableAcceptTerms, status: "error" };
  }
}

export async function createPayoutOnboardingAction(
  locale: Locale,
  _previousState: PublisherAccountActionState,
  formData: FormData
): Promise<PublisherAccountActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/payout-account/onboarding`, {
      body: JSON.stringify({
        provider: String(formData.get("provider") ?? "manual_deferred").trim() || "manual_deferred",
        refreshUrl: String(formData.get("refreshUrl") ?? "").trim() || undefined,
        returnUrl: String(formData.get("returnUrl") ?? "").trim() || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableOnboarding);
    }

    const payload = (await response.json()) as {
      onboarding?: {
        onboardingSession?: {
          onboardingUrl?: string;
        };
      };
    };

    revalidatePublisherPaths();

    return {
      message: labels.onboardingCreated,
      onboardingUrl: payload.onboarding?.onboardingSession?.onboardingUrl,
      status: "success"
    };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableOnboarding, status: "error" };
  }
}

export async function completePayoutOnboardingAction(
  locale: Locale,
  _previousState: PublisherAccountActionState,
  formData: FormData
): Promise<PublisherAccountActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const sessionId = String(formData.get("sessionId") ?? "").trim();
  const payoutAccountId = String(formData.get("payoutAccountId") ?? "").trim();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  if (!sessionId && !payoutAccountId) {
    return { message: labels.missingTarget, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/payout-account/onboarding/complete`, {
      body: JSON.stringify({
        payoutAccountId: sessionId ? undefined : payoutAccountId,
        reason: String(formData.get("reason") ?? "").trim() || undefined,
        sessionId: sessionId || undefined,
        status: String(formData.get("status") ?? "verified").trim() || "verified"
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableReadiness);
    }

    revalidatePublisherPaths();

    return { message: labels.onboardingUpdated, status: "success" };
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.unableReadiness, status: "error" };
  }
}

function revalidatePublisherPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/publisher");
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
