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
  accessToken?: {
    token: string;
    tokenLast4: string;
    tokenPrefix: string;
  };
  organization?: {
    name: string;
    slug: string;
  };
};

const copy = {
  en: {
    emailRequired: "Enter a valid email address.",
    invalidToken: "Enter a valid SkillHub user access token.",
    organizationRequired: "Enter an organization or workspace name.",
    publicSignupDisabled: "Public workspace signup is disabled for this deployment.",
    signedIn: "Workspace session connected.",
    signedOut: "Workspace session cleared.",
    signedUp: "Workspace created and connected. Copy the token now; it will not be shown again.",
    slugTaken: "This workspace slug is already taken.",
    unableSignIn: "Unable to verify this token.",
    unableSignup: "Unable to create this workspace."
  },
  zh: {
    emailRequired: "请输入有效的邮箱地址。",
    invalidToken: "请输入有效的 SkillHub 用户访问 token。",
    organizationRequired: "请输入组织或工作区名称。",
    publicSignupDisabled: "当前部署已关闭公开创建工作区。",
    signedIn: "工作区会话已连接。",
    signedOut: "工作区会话已清除。",
    signedUp: "工作区已创建并连接。请现在保存 token，之后不会再次显示。",
    slugTaken: "这个工作区 slug 已被使用。",
    unableSignIn: "无法验证这个 token。",
    unableSignup: "无法创建这个工作区。"
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
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/developer");
  revalidatePath("/publisher");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/publish");

  return {
    message: labels.signedIn,
    status: "success",
    subject
  };
}

export async function signUpAction(
  locale: Locale,
  _previousState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const labels = copy[locale];
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
  const role = String(formData.get("role") ?? "owner").trim();

  if (!email || !email.includes("@")) {
    return { message: labels.emailRequired, status: "error" };
  }

  if (!organizationName) {
    return { message: labels.organizationRequired, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/signup`, {
      body: JSON.stringify({
        displayName,
        email,
        organizationName,
        organizationSlug,
        role
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      signup?: {
        accessToken?: {
          token?: string;
          tokenLast4?: string;
          tokenPrefix?: string;
        };
        organization?: {
          name?: string;
          slug?: string;
        };
      };
    };
    const token = payload.signup?.accessToken?.token;

    if (!response.ok || !token) {
      return { message: signupErrorMessage(payload.error, labels), status: "error" };
    }

    await setSessionCookie(token);
    const subject = await fetchSessionSubject(token);
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/developer");
    revalidatePath("/publisher");
    revalidatePath("/admin");
    revalidatePath("/account");
    revalidatePath("/publish");

    return {
      accessToken: {
        token,
        tokenLast4: payload.signup?.accessToken?.tokenLast4 ?? token.slice(-4),
        tokenPrefix: payload.signup?.accessToken?.tokenPrefix ?? "shub_user"
      },
      message: labels.signedUp,
      organization: {
        name: payload.signup?.organization?.name ?? organizationName,
        slug: payload.signup?.organization?.slug ?? organizationSlug
      },
      status: "success",
      subject: subject ?? undefined
    };
  } catch {
    return { message: labels.unableSignup, status: "error" };
  }
}

export async function signOutAction(locale: Locale) {
  await clearSessionCookie();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/developer");
  revalidatePath("/publisher");
  revalidatePath("/admin");
  revalidatePath("/account");
  revalidatePath("/publish");
  redirect(locale === "zh" ? "/login?lang=zh" : "/login?lang=en");
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}

function signupErrorMessage(error: string | undefined, labels: (typeof copy)[Locale]) {
  const message = error?.toLowerCase() ?? "";

  if (message.includes("slug") && message.includes("taken")) {
    return labels.slugTaken;
  }

  if (message.includes("public signup") && message.includes("disabled")) {
    return labels.publicSignupDisabled;
  }

  return error || labels.unableSignup;
}
