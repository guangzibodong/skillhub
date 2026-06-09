import { LifeBuoy, LogIn, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Report trust or runtime issue",
    title: "Public issue reporting is guidance-only until sign-in.",
    body:
      "Skill-specific trust, runtime, feedback, and abuse reports write state through the signed-in flow. Public visitors can use this page to choose the right path without exposing private data.",
    primary: "Sign in to report",
    secondary: "Support",
    steps: [
      ["Discovery issue", "Open the skill detail page and compare public manifest, permissions, review state, and publisher profile before reporting."],
      ["Runtime issue", "Runtime incident reports unlock after verified runtime use through a signed-in project."],
      ["Security issue", "Use the security contact path. Do not include secrets, API keys, passwords, or private user data in public text."]
    ]
  },
  zh: {
    eyebrow: "报告信任或运行问题",
    title: "公开问题报告在登录前仅提供路径说明。",
    body:
      "技能级信任、运行、反馈和滥用报告需要通过登录后的流程写入状态。公开访客可用本页选择正确路径，同时避免暴露私有数据。",
    primary: "登录后报告",
    secondary: "支持",
    steps: [
      ["发现问题", "先打开技能详情页，对比公开 manifest、权限、审核状态和发布者资料。"],
      ["运行问题", "运行事故报告会在已验证技能通过登录项目实际运行后开放。"],
      ["安全问题", "使用安全联系路径。不要在公开文本中包含密钥、API Key、密码或私人用户数据。"]
    ]
  }
} as const;

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="product-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/report" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <ShieldAlert size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <div className="hero-actions">
          <a className="primary-button primary-button--large" href={localizedHref("/login", locale)}>
            <LogIn size={18} aria-hidden="true" />
            <span>{labels.primary}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/support", locale)}>
            <LifeBuoy size={18} aria-hidden="true" />
            <span>{labels.secondary}</span>
          </a>
        </div>
      </section>

      <section className="workflow-grid">
        {labels.steps.map(([title, detail]) => (
          <article className="workflow-card lift-card" key={title}>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
