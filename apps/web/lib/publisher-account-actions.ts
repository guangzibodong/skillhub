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
    missingManualAccount: "Enter the PayPal or Alipay receiving account.",
    missingTarget: "Create a payout account before updating readiness.",
    missingToken: "Sign in with a publisher or owner account before managing publisher settings.",
    onboardingCreated: "Manual payout details submitted for finance verification.",
    onboardingUpdated: "Payout readiness state updated.",
    profileSaved: "Publisher profile saved.",
    unableOnboarding: "Unable to submit manual payout details.",
    unableProfile: "Unable to save publisher profile.",
    unableReadiness: "Unable to update payout readiness."
  },
  zh: {
    missingDisplayName: "\u8bf7\u8f93\u5165\u53d1\u5e03\u8005\u5c55\u793a\u540d\u79f0\u3002",
    missingManualAccount: "\u8bf7\u586b\u5199 PayPal \u6216 Alipay \u6536\u6b3e\u8d26\u53f7\u3002",
    missingTarget: "\u8bf7\u5148\u63d0\u4ea4\u6536\u6b3e\u8d26\u6237\u8d44\u6599\uff0c\u518d\u66f4\u65b0\u6536\u6b3e\u72b6\u6001\u3002",
    missingToken: "请先使用具备发布者或 owner 角色的账号登录，才能管理发布者设置。",
    onboardingCreated: "\u624b\u5de5\u6253\u6b3e\u6536\u6b3e\u8d44\u6599\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u8d22\u52a1\u6838\u9a8c\u3002",
    onboardingUpdated: "\u63d0\u73b0\u51c6\u5907\u72b6\u6001\u5df2\u66f4\u65b0\u3002",
    profileSaved: "\u53d1\u5e03\u8005\u8d44\u6599\u5df2\u4fdd\u5b58\u3002",
    unableOnboarding: "\u65e0\u6cd5\u63d0\u4ea4\u624b\u5de5\u6253\u6b3e\u8d44\u6599\u3002",
    unableProfile: "\u65e0\u6cd5\u4fdd\u5b58\u53d1\u5e03\u8005\u8d44\u6599\u3002",
    unableReadiness: "\u65e0\u6cd5\u66f4\u65b0\u63d0\u73b0\u51c6\u5907\u72b6\u6001\u3002"
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
  const manualAccount = String(formData.get("manualAccount") ?? "").trim();
  const manualAccountHolder = String(formData.get("manualAccountHolder") ?? "").trim();
  const manualMethod = String(formData.get("manualMethod") ?? "paypal").trim() || "paypal";
  const manualNotes = String(formData.get("manualNotes") ?? "").trim();

  if (!manualAccount) {
    return { message: labels.missingManualAccount, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/publisher/payout-account/onboarding`, {
      body: JSON.stringify({
        manualAccount,
        manualAccountHolder: manualAccountHolder || undefined,
        manualMethod,
        manualNotes: manualNotes || undefined,
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
