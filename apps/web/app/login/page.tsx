import { KeyRound, UserCircle } from "lucide-react";
import { AuthProviderPanel } from "@/components/auth-provider-panel";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders } from "@/lib/account-data";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account center",
    body: "Create a real organization workspace, continue with Google or GitHub when configured, or connect a team token. Projects, publishing, billing, payout, and notifications run as the active member.",
    eyebrow: "Account access",
    title: "Sign in, register, and enter your SkillHub workspace."
  },
  zh: {
    account: "个人中心",
    body: "创建真实组织工作区，在配置后使用 Google 或 GitHub 登录，或者连接团队 token。项目、发布、账单、提现和通知都会按当前成员身份执行。",
    eyebrow: "账号入口",
    title: "登录、注册并进入你的 SkillHub 工作区。"
  }
} as const;

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [providers, session] = await Promise.all([getAuthProviders(), getWorkspaceSession()]);

  return (
    <main className="product-shell">
      <SiteHeader active="dashboard" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/login" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <KeyRound size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <a className="secondary-button secondary-button--large" href={localizedHref("/account", locale)}>
          <UserCircle size={17} aria-hidden="true" />
          <span>{labels.account}</span>
        </a>
      </section>

      <section className="auth-layout auth-layout--signup">
        <div className="auth-main-stack">
          <AuthProviderPanel apiUrl={apiUrl} locale={locale} providers={providers} />
          <WorkspaceSignupForm locale={locale} />
        </div>
        <div className="auth-side-stack">
          <SessionLoginForm locale={locale} />
          <SessionStatusPanel locale={locale} session={session} />
        </div>
      </section>
    </main>
  );
}
