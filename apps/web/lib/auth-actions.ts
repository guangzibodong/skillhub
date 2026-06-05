"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSessionCookie, fetchSessionSubject, setSessionCookie, type SessionSubject } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type AuthActionState = {
  message: string;
  status: "idle" | "success" | "error";
  subject?: SessionSubject;
};

export type SignupActionState = AuthActionState & {
  challenge?: {
    challengeId: string;
    deliveryPreviewCode?: string | null;
    email: string;
    expiresAt: string;
    mode: "login" | "signup";
    organizationName?: string;
    organizationSlug?: string | null;
  };
  organization?: {
    name: string;
    slug: string;
  };
};

const copy = {
  en: {
    codeRequired: "Enter the 6-digit email verification code.",
    codeSent: "Verification code queued for email delivery.",
    emailRequired: "Enter a valid email address.",
    invalidToken: "Enter a valid SkillHub user access token.",
    organizationRequired: "Enter an organization or workspace name.",
    publicSignupDisabled: "Public email access is disabled for this deployment.",
    signedIn: "Workspace session connected.",
    signedOut: "Workspace session cleared.",
    signedUp: "Email verified. Workspace session connected.",
    slugTaken: "This workspace slug is already taken.",
    unableEmail: "Unable to complete email verification.",
    unableSignIn: "Unable to verify this token."
  },
  zh: {
    codeRequired: "请输入 6 位邮箱验证码。",
    codeSent: "验证码已进入邮件发送队列。",
    emailRequired: "请输入有效的邮箱地址。",
    invalidToken: "请输入有效的 SkillHub 用户访问 token。",
    organizationRequired: "请输入组织或工作区名称。",
    publicSignupDisabled: "当前部署已关闭公开邮箱访问。",
    signedIn: "工作区会话已连接。",
    signedOut: "工作区会话已清除。",
    signedUp: "邮箱已验证，工作区会话已连接。",
    slugTaken: "这个工作区 slug 已被使用。",
    unableEmail: "无法完成邮箱验证。",
    unableSignIn: "无法验证这个 token。"
  }
} as const;

export async function signInAction(
  locale: Locale,
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const labels = copy[locale];
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    return { message: labels.invalidToken, status: "error" };
  }

  const subject = await fetchSessionSubject(token);

  if (!subject || subject.type !== "user") {
    return { message: labels.unableSignIn, status: "error" };
  }

  await setSessionCookie(token);
  revalidateWorkspace();

  return {
    message: labels.signedIn,
    status: "success",
    subject
  };
}

export async function signUpAction(
  locale: Locale,
  previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const intent = String(formData.get("intent") ?? "request").trim();

  if (intent === "verify") {
    return verifyEmailCodeAction(locale, previousState, formData);
  }

  return requestEmailCodeAction(locale, formData);
}

export async function signOutAction(locale: Locale) {
  await clearSessionCookie();
  revalidateWorkspace();
  redirect(locale === "zh" ? "/login?lang=zh" : "/login?lang=en");
}

async function requestEmailCodeAction(locale: Locale, formData: FormData): Promise<SignupActionState> {
  const labels = copy[locale];
  const mode = normalizeEmailMode(formData.get("mode"));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
  const role = String(formData.get("role") ?? "owner").trim();

  if (!email || !email.includes("@")) {
    return { message: labels.emailRequired, status: "error" };
  }

  if (mode === "signup" && !organizationName) {
    return { message: labels.organizationRequired, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/email/request-code`, {
      body: JSON.stringify({
        displayName,
        email,
        mode,
        organizationName,
        organizationSlug,
        returnTo: locale === "zh" ? "/account?lang=zh" : "/account?lang=en",
        role
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = (await response.json().catch(() => ({}))) as {
      challenge?: {
        challengeId?: string;
        deliveryPreviewCode?: string | null;
        email?: string;
        expiresAt?: string;
        mode?: "login" | "signup";
        organizationSlug?: string | null;
      };
      error?: string;
    };
    const challenge = payload.challenge;

    if (!response.ok || !challenge?.challengeId || !challenge.email || !challenge.expiresAt || !challenge.mode) {
      return { message: emailErrorMessage(payload.error, labels), status: "error" };
    }

    return {
      challenge: {
        challengeId: challenge.challengeId,
        deliveryPreviewCode: challenge.deliveryPreviewCode ?? null,
        email: challenge.email,
        expiresAt: challenge.expiresAt,
        mode: challenge.mode,
        organizationName,
        organizationSlug: challenge.organizationSlug ?? organizationSlug
      },
      message: labels.codeSent,
      status: "success"
    };
  } catch {
    return { message: labels.unableEmail, status: "error" };
  }
}

async function verifyEmailCodeAction(
  locale: Locale,
  previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const labels = copy[locale];
  const challengeId = String(formData.get("challengeId") ?? previousState.challenge?.challengeId ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!challengeId || !/^\d{6}$/.test(code.replace(/\D/g, ""))) {
    return {
      ...previousState,
      message: labels.codeRequired,
      status: "error"
    };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/email/verify-code`, {
      body: JSON.stringify({
        challengeId,
        code
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      login?: {
        accessToken?: {
          token?: string;
        };
        organization?: {
          name?: string;
          slug?: string;
        };
      };
    };
    const token = payload.login?.accessToken?.token;

    if (!response.ok || !token) {
      return {
        ...previousState,
        message: emailErrorMessage(payload.error, labels),
        status: "error"
      };
    }

    await setSessionCookie(token);
    const subject = await fetchSessionSubject(token);
    revalidateWorkspace();

    return {
      message: labels.signedUp,
      organization: {
        name: payload.login?.organization?.name ?? previousState.challenge?.organizationName ?? "SkillHub workspace",
        slug: payload.login?.organization?.slug ?? previousState.challenge?.organizationSlug ?? ""
      },
      status: "success",
      subject: subject ?? undefined
    };
  } catch {
    return {
      ...previousState,
      message: labels.unableEmail,
      status: "error"
    };
  }
}

function revalidateWorkspace() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/developer");
  revalidatePath("/publisher");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/publish");
}

function normalizeEmailMode(value: FormDataEntryValue | null): "login" | "signup" {
  return value === "login" ? "login" : "signup";
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}

function emailErrorMessage(error: string | undefined, labels: (typeof copy)[Locale]) {
  const message = error?.toLowerCase() ?? "";

  if (message.includes("slug") && message.includes("taken")) {
    return labels.slugTaken;
  }

  if (message.includes("public") && message.includes("disabled")) {
    return labels.publicSignupDisabled;
  }

  return error || labels.unableEmail;
}
