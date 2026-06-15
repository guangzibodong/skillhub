import type { Metadata } from "next";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Reset password - SkillHub",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Account recovery",
    title: "Reset access with your work email",
    body:
      "Send a verification code to the email on your SkillHub account. After verification, you can continue to account security and update your credentials.",
    back: "Back to sign in",
    points: ["Email verification", "HTTP-only session", "Account security"],
  },
  zh: {
    eyebrow: "账号恢复",
    title: "使用工作邮箱重置访问",
    body:
      "向 SkillHub 账号邮箱发送验证码。验证完成后，你可以进入账号安全页面并更新凭证。",
    back: "返回登录",
    points: ["邮箱验证", "HTTP-only 会话", "账号安全"],
  },
} as const;

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="login" locale={locale}>
      <section className="section py-20" aria-labelledby="forgot-password-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
          <div className="hero-glow flex flex-col gap-6">
            <div className="eyebrow">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <div className="flex flex-col gap-4 max-w-[680px]">
              <h1 id="forgot-password-heading" className="heading-xl">{labels.title}</h1>
              <p className="body-text text-[#999]">{labels.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {labels.points.map((point, index) => {
                const Icon = index === 0 ? MailCheck : ShieldCheck;

                return (
                  <span key={point} className="flex items-center gap-1.5 text-xs text-[#10b981]">
                    <Icon size={14} aria-hidden="true" />
                    {point}
                  </span>
                );
              })}
            </div>
            <a className="btn-text w-fit" href={localizedHref("/login", locale)}>{labels.back}</a>
          </div>

          <PasswordResetRequestForm locale={locale} />
        </div>
      </section>
    </AppShell>
  );
}
