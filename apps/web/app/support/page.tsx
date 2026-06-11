import { ArrowRight, LifeBuoy, ShieldAlert, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Developer Preview support",
    title: "Support paths are open, write flows stay gated.",
    body:
      "For Developer Preview support, use the signed-in report flow when available. If you are not signed in, use the public report and security guidance pages first. Do not include secrets, API keys, passwords, or private user data in public reports.",
    primary: "Report an issue",
    secondary: "Security contact",
    cards: [
      ["Public support", "Use this page to understand which support path fits discovery, account access, publisher review, or runtime governance questions."],
      ["Signed-in reports", "Skill-specific trust and runtime reports write state only after sign-in so the team can protect private context."],
      ["No secrets", "Never paste OAuth secrets, API tokens, passwords, private keys, or customer data into public support text."]
    ]
  },
  zh: {
    eyebrow: "开发者预览版支持",
    title: "支持路径已开放，写入流程保持门控。",
    body:
      "开发者预览版支持请优先使用登录后的举报/反馈流程。未登录时，请先查看公开举报和安全联系页面。不要在公开报告中包含密钥、API Key、密码或私人用户数据。",
    primary: "报告问题",
    secondary: "安全联系",
    cards: [
      ["公开支持", "用本页判断发现、账号访问、发布审核或运行治理问题该走哪条支持路径。"],
      ["登录后报告", "技能级信任和运行报告只有登录后才写入状态，避免泄露私有上下文。"],
      ["不要提交密钥", "不要把 OAuth secret、API token、密码、私钥或客户数据粘贴到公开支持文本中。"]
    ]
  }
} as const;

export default async function SupportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];

  return (
    <AppShell active="support" locale={locale}>
      {/* Hero */}
      <section className="section">
        <div className="section-inner text-center">
          <p className="eyebrow mb-4 flex items-center justify-center gap-2">
            <LifeBuoy size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </p>
          <h1 className="heading-xl mb-6">{labels.title}</h1>
          <p className="body-text max-w-[640px] mx-auto mb-10">{labels.body}</p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a className="btn-primary btn-primary--large" href={localizedHref("/report", locale)}>
              <ShieldAlert size={18} aria-hidden="true" />
              <span>{labels.primary}</span>
            </a>
            <a className="btn-secondary btn-secondary--large" href={localizedHref("/security", locale)}>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{labels.secondary}</span>
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
                <p className="body-text-sm mb-4">{detail}</p>
                <a className="btn-text text-[13px]" href={localizedHref("/status", locale)}>
                  <span>{locale === "zh" ? "查看状态" : "View status"}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
