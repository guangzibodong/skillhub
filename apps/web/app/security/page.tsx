import { ExternalLink, LifeBuoy, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Security contact",
    title: "Report security issues without exposing secrets.",
    body:
      "Use the public support path to request a secure disclosure channel during Developer Preview. Do not put OAuth secrets, API tokens, passwords, private keys, webhook secrets, customer data, or exploit payloads into public reports.",
    support: "Support",
    status: "Status",
    cards: [
      ["What to include", "Affected public URL, skill slug, impact summary, reproduction outline, and safe contact method."],
      ["What not to include", "Secrets, API keys, raw tokens, passwords, private user data, or credentials of any kind."],
      ["Current state", "Security reporting is public guidance first; signed-in or direct secure handling is required for sensitive evidence."]
    ]
  },
  zh: {
    eyebrow: "安全联系",
    title: "报告安全问题时不要暴露密钥。",
    body:
      "开发者预览版期间，请通过公开支持路径请求安全披露渠道。不要把 OAuth secret、API token、密码、私钥、webhook secret、客户数据或利用载荷写入公开报告。",
    support: "支持",
    status: "状态",
    cards: [
      ["应该包含", "受影响公开 URL、技能 slug、影响摘要、复现轮廓和安全联系方法。"],
      ["不要包含", "任何密钥、API Key、原始 token、密码、私人用户数据或凭证。"],
      ["当前状态", "安全报告先提供公开路径说明；敏感证据需要登录后或通过安全渠道处理。"]
    ]
  }
} as const;

export default async function SecurityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="product-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/security" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <div className="hero-actions">
          <a className="primary-button primary-button--large" href={localizedHref("/support", locale)}>
            <LifeBuoy size={18} aria-hidden="true" />
            <span>{labels.support}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/status", locale)}>
            <ExternalLink size={18} aria-hidden="true" />
            <span>{labels.status}</span>
          </a>
        </div>
      </section>

      <section className="trust-grid">
        {labels.cards.map(([title, detail]) => (
          <article className="trust-card lift-card" key={title}>
            <ShieldCheck size={20} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
