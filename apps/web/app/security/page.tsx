import { ExternalLink, LifeBuoy, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

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
  const labels = copy[locale];

  return (
    <AppShell active="security" locale={locale}>
      {/* Hero */}
      <section className="section">
        <div className="section-inner text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-2">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </p>
          <h1 className="heading-xl mb-6">{labels.title}</h1>
          <p className="body-text max-w-[640px] mx-auto mb-10">{labels.body}</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a className="btn-primary btn-primary--large" href={localizedHref("/support", locale)}>
              <LifeBuoy size={18} aria-hidden="true" />
              <span>{labels.support}</span>
            </a>
            <a className="btn-secondary btn-secondary--large" href={localizedHref("/status", locale)}>
              <ExternalLink size={18} aria-hidden="true" />
              <span>{labels.status}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="section pt-0">
        <div className="section-inner">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {labels.cards.map(([title, detail]) => (
              <article className="card" key={title}>
                <ShieldCheck size={20} className="text-[#0075ff] mb-4" aria-hidden="true" />
                <h2 className="heading-sm mb-3">{title}</h2>
                <p className="body-text-sm">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
