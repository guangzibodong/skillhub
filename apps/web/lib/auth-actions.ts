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

const copy = {
  en: {
    invalidToken: "Enter a valid SkillHub user access token.",
    signedIn: "Workspace session connected.",
    signedOut: "Workspace session cleared.",
    unableSignIn: "Unable to verify this token."
  },
  zh: {
    invalidToken: "请输入有效的 SkillHub 用户访问 token。",
    signedIn: "工作区会话已连接。",
    signedOut: "工作区会话已清除。",
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
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/publish");

  return {
    message: labels.signedIn,
    status: "success",
    subject
  };
}

export async function signOutAction(locale: Locale) {
  await clearSessionCookie();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/publish");
  redirect(locale === "zh" ? "/login?lang=zh" : "/login?lang=en");
}
