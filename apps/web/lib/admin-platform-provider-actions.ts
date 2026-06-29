"use server";

import { revalidatePath } from "next/cache";
import { getServerApiUrl } from "@/lib/api-url";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type {
  AdminEmailProviderConfig,
  AdminLaunchSettings,
  AdminOAuthProviderConfig,
  AdminPayPalConfig,
  AdminPayoutSettings,
  AdminRuntimeSettings,
  AdminStripeConfig,
  AdminWebhookSettings,
} from "@/lib/ops-data";

export type PlatformProviderActionState = {
  message: string;
  provider?: AdminEmailProviderConfig | AdminOAuthProviderConfig;
  providerKey?: string;
  status: "error" | "idle" | "success";
};

export type PlatformConfigActionState = {
  message: string;
  section?: string;
  status: "error" | "idle" | "success";
};

const copy = {
  en: {
    missingToken: "Sign in with an admin account before changing platform configuration.",
    savedEmail: "Email provider saved.",
    savedLaunch: "Launch thresholds saved.",
    savedOAuth: "OAuth provider saved.",
    savedPayPal: "PayPal configuration saved.",
    savedPayouts: "Payout rules saved.",
    savedRuntime: "Runtime switches saved.",
    savedStripe: "Stripe configuration saved.",
    savedWebhooks: "Webhook delivery settings saved.",
    stripeVerified: "Stripe key verified.",
    paypalVerified: "PayPal credentials verified.",
    testEmailSent: "Test email sent.",
    unableSave: "Unable to save platform configuration.",
    unableTestEmail: "Unable to send test email.",
    unableTestPayPal: "Unable to verify PayPal configuration.",
    unableTestStripe: "Unable to verify Stripe configuration."
  },
  zh: {
    missingToken: "请先使用管理员账号登录后再修改平台配置。",
    savedEmail: "邮件供应商已保存。",
    savedLaunch: "上线门槛已保存。",
    savedOAuth: "OAuth 供应商已保存。",
    savedPayPal: "PayPal 配置已保存。",
    savedPayouts: "财务规则已保存。",
    savedRuntime: "运行开关已保存。",
    savedStripe: "Stripe 配置已保存。",
    savedWebhooks: "Webhook 投递设置已保存。",
    stripeVerified: "Stripe Key 校验通过。",
    paypalVerified: "PayPal 凭据校验通过。",
    testEmailSent: "测试邮件已发送。",
    unableSave: "无法保存平台配置。",
    unableTestEmail: "无法发送测试邮件。",
    unableTestPayPal: "无法校验 PayPal 配置。",
    unableTestStripe: "无法校验 Stripe 配置。"
  }
} as const;

export async function saveOAuthProviderAction(
  locale: Locale,
  _previousState: PlatformProviderActionState,
  formData: FormData,
): Promise<PlatformProviderActionState> {
  const labels = copy[locale];
  const provider = String(formData.get("provider") ?? "").trim();
  const result = await putPlatformConfig<AdminOAuthProviderConfig>(
    `/oauth/${encodeURIComponent(provider)}`,
    {
      callbackBaseUrl: textValue(formData, "callbackBaseUrl"),
      clientId: textValue(formData, "clientId"),
      clientSecret: textValue(formData, "clientSecret"),
      status: textValue(formData, "status") || "active"
    },
    labels.savedOAuth,
    labels.missingToken,
    labels.unableSave,
    "provider",
  );

  return {
    message: result.message,
    provider: result.payload,
    providerKey: provider,
    status: result.status
  };
}

export async function saveEmailProviderAction(
  locale: Locale,
  _previousState: PlatformProviderActionState,
  formData: FormData,
): Promise<PlatformProviderActionState> {
  const labels = copy[locale];
  const provider = textValue(formData, "provider") || "unconfigured";
  const result = await putPlatformConfig<AdminEmailProviderConfig>(
    "/email",
    {
      from: textValue(formData, "from"),
      provider,
      resendApiKey: textValue(formData, "resendApiKey"),
      smtpHost: textValue(formData, "smtpHost"),
      smtpPassword: textValue(formData, "smtpPassword"),
      smtpPort: textValue(formData, "smtpPort") || "465",
      smtpSecure: formData.get("smtpSecure") === "on",
      smtpUser: textValue(formData, "smtpUser"),
      status: textValue(formData, "status") || "active"
    },
    labels.savedEmail,
    labels.missingToken,
    labels.unableSave,
    "provider",
  );

  return {
    message: result.message,
    provider: result.payload,
    providerKey: provider,
    status: result.status
  };
}

export async function sendTestEmailAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return postPlatformConfig(
    "/email/test",
    { to: textValue(formData, "to") },
    copy[locale].testEmailSent,
    copy[locale].missingToken,
    copy[locale].unableTestEmail,
    "email",
  );
}

export async function saveStripeConfigAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminStripeConfig>(
      "/stripe",
      {
        cancelUrl: textValue(formData, "cancelUrl"),
        connectClientId: textValue(formData, "connectClientId"),
        refreshUrl: textValue(formData, "refreshUrl"),
        returnUrl: textValue(formData, "returnUrl"),
        secretKey: textValue(formData, "secretKey"),
        status: textValue(formData, "status") || "active",
        successUrl: textValue(formData, "successUrl"),
        webhookSecret: textValue(formData, "webhookSecret")
      },
      copy[locale].savedStripe,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "stripe",
    ),
    "stripe",
  );
}

export async function testStripeConfigAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
): Promise<PlatformConfigActionState> {
  return postPlatformConfig(
    "/stripe/test",
    {},
    copy[locale].stripeVerified,
    copy[locale].missingToken,
    copy[locale].unableTestStripe,
    "stripe",
  );
}

export async function savePayPalConfigAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminPayPalConfig>(
      "/paypal",
      {
        cancelUrl: textValue(formData, "cancelUrl"),
        clientId: textValue(formData, "clientId"),
        clientSecret: textValue(formData, "clientSecret"),
        environment: textValue(formData, "environment") || "sandbox",
        returnUrl: textValue(formData, "returnUrl"),
        status: textValue(formData, "status") || "active",
        webhookId: textValue(formData, "webhookId")
      },
      copy[locale].savedPayPal,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "paypal",
    ),
    "paypal",
  );
}

export async function testPayPalConfigAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
): Promise<PlatformConfigActionState> {
  return postPlatformConfig(
    "/paypal/test",
    {},
    copy[locale].paypalVerified,
    copy[locale].missingToken,
    copy[locale].unableTestPayPal,
    "paypal",
  );
}

export async function saveWebhookSettingsAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminWebhookSettings>(
      "/webhooks",
      {
        maxAttempts: numberValue(formData, "maxAttempts"),
        timeoutMs: numberValue(formData, "timeoutMs")
      },
      copy[locale].savedWebhooks,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "webhooks",
    ),
    "webhooks",
  );
}

export async function savePayoutSettingsAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminPayoutSettings>(
      "/payouts",
      {
        minPayoutCents: numberValue(formData, "minPayoutCents"),
        payoutReviewThresholdCents: numberValue(formData, "payoutReviewThresholdCents")
      },
      copy[locale].savedPayouts,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "payouts",
    ),
    "payouts",
  );
}

export async function saveLaunchSettingsAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminLaunchSettings>(
      "/launch",
      {
        activeProjects: numberValue(formData, "activeProjects"),
        activePublishers: numberValue(formData, "activePublishers"),
        publishedFeedback: numberValue(formData, "publishedFeedback"),
        successfulInvocations: numberValue(formData, "successfulInvocations"),
        verifiedSkills: numberValue(formData, "verifiedSkills")
      },
      copy[locale].savedLaunch,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "launch",
    ),
    "launch",
  );
}

export async function saveRuntimeSettingsAction(
  locale: Locale,
  _previousState: PlatformConfigActionState,
  formData: FormData,
): Promise<PlatformConfigActionState> {
  return sectionResult(
    await putPlatformConfig<AdminRuntimeSettings>(
      "/runtime",
      {
        disablePublicSignup: formData.get("disablePublicSignup") === "on"
      },
      copy[locale].savedRuntime,
      copy[locale].missingToken,
      copy[locale].unableSave,
      "runtime",
    ),
    "runtime",
  );
}

async function putPlatformConfig<T>(
  path: string,
  body: Record<string, unknown>,
  successMessage: string,
  missingTokenMessage: string,
  fallbackError: string,
  payloadKey: string,
) {
  return requestPlatformConfig<T>("PUT", path, body, successMessage, missingTokenMessage, fallbackError, payloadKey);
}

async function postPlatformConfig(
  path: string,
  body: Record<string, unknown>,
  successMessage: string,
  missingTokenMessage: string,
  fallbackError: string,
  section: string,
): Promise<PlatformConfigActionState> {
  const result = await requestPlatformConfig<unknown>("POST", path, body, successMessage, missingTokenMessage, fallbackError);
  return {
    message: result.message,
    section,
    status: result.status
  };
}

async function requestPlatformConfig<T>(
  method: "POST" | "PUT",
  path: string,
  body: Record<string, unknown>,
  successMessage: string,
  missingTokenMessage: string,
  fallbackError: string,
  payloadKey?: string,
): Promise<{ message: string; payload?: T; status: "error" | "success" }> {
  const token = await getAdminOperatorToken();

  if (!token) {
    return { message: missingTokenMessage, status: "error" };
  }

  try {
    const response = await fetch(`${getServerApiUrl()}/v1/admin/platform-config${path}`, {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown> & { error?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? fallbackError);
    }

    revalidatePath("/admin");
    revalidatePath("/login");
    revalidatePath("/account/security");

    return {
      message: successMessage,
      payload: payloadKey ? (payload[payloadKey] as T | undefined) : undefined,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : fallbackError,
      status: "error"
    };
  }
}

function sectionResult(
  result: { message: string; status: "error" | "success" },
  section: string,
): PlatformConfigActionState {
  return {
    message: result.message,
    section,
    status: result.status
  };
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  return Number(textValue(formData, key));
}
