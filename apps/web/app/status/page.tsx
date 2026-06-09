import { Activity, ExternalLink, LifeBuoy, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Status and health",
    title: "Developer Preview status is transparent and scoped.",
    body:
      "Public status checks cover the public web app, API health, and registry discovery. Runtime invocation, project keys, billing, payout, and admin queues remain sign-in or operator gated.",
    api: "API health",
    support: "Support",
    items: [
      ["Public web", "useskillhub.com serves public discovery, docs, marketplace preview, publisher profiles, and login/register."],
      ["API metadata", "api.useskillhub.com exposes public health, skill search, skill inspection, publisher inspection, and safe MCP metadata."],
      ["Gated operations", "Runtime, project handoff, payment, payout, and admin operations are not anonymous public status features."]
    ]
  },
  zh: {
    eyebrow: "状态与健康检查",
    title: "开发者预览版状态透明且有边界。",
    body:
      "公开状态检查覆盖公开网站、API 健康和注册表发现。运行调用、项目 Key、账单、提现和后台队列仍保持登录或运营门控。",
    api: "API 健康",
    support: "支持",
    items: [
      ["公开网站", "useskillhub.com 提供公开发现、文档、市场预览、发布者资料和登录/注册。"],
      ["API 元数据", "api.useskillhub.com 提供公开健康检查、技能搜索、技能查看、发布者查看和安全 MCP 元数据。"],
      ["门控运营", "运行、项目交接、支付、提现和后台运营不是匿名公开状态能力。"]
    ]
  }
} as const;

export default async function StatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="product-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/status" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <Activity size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <div className="hero-actions">
          <a className="primary-button primary-button--large" href={`${apiUrl}/health`}>
            <ExternalLink size={18} aria-hidden="true" />
            <span>{labels.api}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/support", locale)}>
            <LifeBuoy size={18} aria-hidden="true" />
            <span>{labels.support}</span>
          </a>
        </div>
      </section>

      <section className="workflow-grid">
        {labels.items.map(([title, detail]) => (
          <article className="workflow-card lift-card" key={title}>
            <ShieldCheck size={18} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
