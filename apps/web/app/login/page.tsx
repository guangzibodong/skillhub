import { KeyRound } from "lucide-react";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    body: "Connect a user-scoped SkillHub token so the web console reads and writes as the active organization member instead of relying only on server environment tokens.",
    eyebrow: "Access control",
    title: "Sign in to your SkillHub workspace."
  },
  zh: {
    body: "连接一个用户级 SkillHub token，让网页控制台按当前组织成员身份读写，而不只是依赖服务器环境变量 token。",
    eyebrow: "访问控制",
    title: "登录你的 SkillHub 工作区"
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

      <section className="auth-layout">
        <SessionLoginForm locale={locale} />
        <SessionStatusPanel locale={locale} session={session} />
      </section>
    </main>
  );
}
