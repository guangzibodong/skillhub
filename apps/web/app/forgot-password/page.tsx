import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { PasswordResetForm } from "@/components/password-reset-form";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";
import styles from "../login/login.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);

  return buildLocalizedMetadata({
    locale,
    path: "/forgot-password",
    noIndex: true,
    en: {
      title: "Reset SkillHub Password",
      description: "Request a SkillHub password reset code and set a new password.",
    },
    zh: {
      title: "重置 SkillHub 密码",
      description: "获取 SkillHub 密码重置验证码，并设置新密码。",
    },
  });
}

const copy = {
  en: {
    body:
      "Use your account email to receive a verification code, then set a new password for username or email sign-in.",
    eyebrow: "Account recovery",
    title: "Reset your SkillHub password",
  },
  zh: {
    body:
      "使用账号邮箱接收验证码，然后为用户名或邮箱登录设置新密码。",
    eyebrow: "账号恢复",
    title: "重置 SkillHub 密码",
  },
} as const;

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];

  return (
    <AppShell active="login" locale={locale} flushTop>
      <div
        className={`login-page-shell login-page-shell--${locale} ${styles.pageStyles}`}
      >
        <section className="forgot-password-stage" aria-labelledby="forgot-password-title">
          <div className="forgot-password-stage__copy">
            <span>{labels.eyebrow}</span>
            <h1 id="forgot-password-title">{labels.title}</h1>
            <p>{labels.body}</p>
          </div>
          <PasswordResetForm locale={locale} />
        </section>
      </div>
    </AppShell>
  );
}
