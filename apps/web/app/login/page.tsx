import { KeyRound } from "lucide-react";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    body: "Create an organization-scoped account or connect an existing user token. Projects, publishing, billing, team, and notification operations run as the active member.",
    eyebrow: "Access control",
    title: "Create or sign in to SkillHub."
  },
  zh: {
    body: "创建一个组织级账号，或连接已有用户 token。进入工作区后，项目、发布、账单、团队和通知都会按当前成员权限执行。",
    eyebrow: "访问控制",
    title: "创建或登录 SkillHub"
  }
} as const;

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const session = await getWorkspaceSession();

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
      </section>

      <section className="auth-layout auth-layout--signup">
        <WorkspaceSignupForm locale={locale} />
        <div className="auth-side-stack">
          <SessionLoginForm locale={locale} />
          <SessionStatusPanel locale={locale} session={session} />
        </div>
      </section>
    </main>
  );
}
