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
    codeUsed: "This verification code has already been used. Request a new code.",
    emailAlreadyRegistered: "This email is already registered. Sign in instead.",
    emailRequired: "Enter a valid email address.",
    invalidCredentials: "Email/username or password is incorrect.",
    invalidToken: "Enter a valid SkillHub user access token.",
    organizationRequired: "Enter an organization or workspace name.",
    passwordRequired: "Enter a password with at least 8 characters.",
    publicSignupDisabled: "Public email access is disabled for this deployment.",
    signedIn: "Workspace session connected.",
    signedOut: "Workspace session cleared.",
    signedUp: "Workspace session connected.",
    slugTaken: "This workspace slug is already taken.",
    tooManyAttempts: "Too many failed attempts. Please wait, then try again.",
    usernameTaken: "This username is already taken.",
    usernameRequired: "Enter a username using letters, numbers, underscores, or hyphens.",
    unableEmail: "Unable to complete email verification.",
    unablePasswordAuth: "Unable to complete password login.",
    unableSignIn: "Unable to verify this token."
  },
  zh: {
    codeRequired: "请输入 6 位邮箱验证码。",
    codeSent: "验证码已进入邮件发送队列。",
    codeUsed: "这个验证码已经用过，请重新获取验证码。",
    emailAlreadyRegistered: "这个邮箱已经注册，请直接登录。",
    emailRequired: "请输入有效的邮箱地址。",
    invalidCredentials: "邮箱/用户名或密码不正确。",
    invalidToken: "请输入有效的 SkillHub 用户访问 token。",
    organizationRequired: "请输入组织或工作区名称。",
    passwordRequired: "请输入至少 8 位密码。",
    publicSignupDisabled: "当前部署已关闭公开邮箱访问。",
    signedIn: "工作区会话已连接。",
    signedOut: "工作区会话已清除。",
    signedUp: "工作区会话已连接。",
    slugTaken: "这个工作区 slug 已被使用。",
    tooManyAttempts: "失败次数过多，请稍后再试。",
    usernameTaken: "这个用户名已被使用。",
    usernameRequired: "请输入用户名，可使用字母、数字、下划线或连字符。",
    unableEmail: "无法完成邮箱验证。",
    unablePasswordAuth: "无法完成密码登录。",
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

  if (intent === "password") {
    return passwordAuthAction(locale, formData);
  }

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

async function passwordAuthAction(locale: Locale, formData: FormData): Promise<SignupActionState> {
  const labels = copy[locale];
  const mode = normalizeEmailMode(formData.get("mode"));
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const identifier = String(formData.get("identifier") ?? (email || username)).trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
  const role = String(formData.get("role") ?? "owner").trim();

  if (mode === "signup" && !/^[a-z0-9][a-z0-9_-]{2,31}$/.test(username)) {
    return { message: labels.usernameRequired, status: "error" };
  }

  if (mode === "signup" && (!email || !email.includes("@"))) {
    return { message: labels.emailRequired, status: "error" };
  }

  if (mode === "login" && !identifier) {
    return { message: labels.emailRequired, status: "error" };
  }

  if (password.length < 8) {
    return { message: labels.passwordRequired, status: "error" };
  }

  if (mode === "signup" && !organizationName) {
    return { message: labels.organizationRequired, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/password/${mode === "signup" ? "signup" : "login"}`, {
      body: JSON.stringify(
        mode === "signup"
          ? {
              displayName,
              email,
              organizationName,
              organizationSlug,
              password,
              role,
              username
            }
          : {
              identifier,
              password
            }
      ),
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
      return { message: passwordErrorMessage(payload.error, labels), status: "error" };
    }

    await setSessionCookie(token);
    const subject = await fetchSessionSubject(token);
    revalidateWorkspace();

    return {
      message: mode === "signup" ? labels.signedUp : labels.signedIn,
      organization: {
        name: payload.login?.organization?.name ?? (organizationName || "SkillHub workspace"),
        slug: payload.login?.organization?.slug ?? organizationSlug
      },
      status: "success",
      subject: subject ?? undefined
    };
  } catch {
    return { message: labels.unablePasswordAuth, status: "error" };
  }
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
  return sharedAuthErrorMessage(error, labels) ?? labels.unableEmail;
}

function passwordErrorMessage(error: string | undefined, labels: (typeof copy)[Locale]) {
  const message = error?.toLowerCase() ?? "";

  if (message.includes("email/username or password") || message.includes("password is incorrect")) {
    return labels.invalidCredentials;
  }

  return sharedAuthErrorMessage(error, labels) ?? labels.unablePasswordAuth;
}

function sharedAuthErrorMessage(error: string | undefined, labels: (typeof copy)[Locale]) {
  const message = error?.toLowerCase() ?? "";

  if (message.includes("slug") && message.includes("taken")) {
    return labels.slugTaken;
  }

  if (message.includes("email") && message.includes("already registered")) {
    return labels.emailAlreadyRegistered;
  }

  if (message.includes("username") && message.includes("taken")) {
    return labels.usernameTaken;
  }

  if (message.includes("public") && message.includes("disabled")) {
    return labels.publicSignupDisabled;
  }

  if (message.includes("too many failed attempts")) {
    return labels.tooManyAttempts;
  }

  if (message.includes("already been used")) {
    return labels.codeUsed;
  }

  return null;
}
