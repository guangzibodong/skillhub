import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BookOpenCheck,
  CheckCircle2,
  Code2,
  FileJson,
  History,
  KeyRound,
  PackageCheck,
  PackageSearch,
  ShieldCheck,
  Star,
  Terminal,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SkillAbuseReportForm } from "@/components/skill-abuse-report-form";
import { SkillProjectActionPanel } from "@/components/skill-project-action-panel";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { localizeText, marketplaceSkills } from "@/lib/marketplace-data";
import { getDeveloperProjects } from "@/lib/ops-data";
import { getPublicMarketplaceSkill, getRelatedMarketplaceSkills } from "@/lib/public-marketplace";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    back: "Back to marketplace",
    install: "Install",
    overview: "Overview",
    security: "Security review",
    pricing: "Pricing",
    contract: "Runtime contract",
    useCases: "Production use cases",
    changelog: "Changelog",
    reviews: "Operator notes",
    permissions: "Permissions",
    related: "Alternatives and replacements",
    relatedBody: "Compare similar skills before installing, or keep a safer replacement path ready for deprecated, suspended, or high-risk capabilities.",
    relatedReasons: "Why it matches",
    relatedDetails: "Open details",
    lastReviewed: "Last reviewed",
    success: "Success rate",
    latency: "Median latency",
    installs: "Installs",
    runtime: "Runtime",
    approval: "Approval state",
    cli: "CLI",
    mcp: "MCP",
    sdk: "SDK",
    input: "Input example",
    output: "Output example",
    payout: "Publisher payout",
    payoutBody: "Paid usage is converted into immutable transaction splits before a publisher balance can be paid out.",
    support: "Support and operations",
    supportItems: ["Version pinning supported", "Deprecation notice required", "Runtime incidents enter review queue"]
  },
  zh: {
    back: "返回市场",
    install: "安装",
    overview: "概览",
    security: "安全审核",
    pricing: "价格",
    contract: "运行协议",
    useCases: "生产使用场景",
    changelog: "更新记录",
    reviews: "运营备注",
    permissions: "权限",
    related: "替代和相似技能",
    relatedBody: "安装前先比较同类技能；当技能弃用、暂停或风险过高时，也能保留更安全的替换路径。",
    relatedReasons: "推荐原因",
    relatedDetails: "打开详情",
    lastReviewed: "最近审核",
    success: "成功率",
    latency: "中位延迟",
    installs: "安装量",
    runtime: "运行时",
    approval: "审核状态",
    cli: "CLI",
    mcp: "MCP",
    sdk: "SDK",
    input: "输入示例",
    output: "输出示例",
    payout: "发布者提现",
    payoutBody: "付费用量必须先转换成不可变分账交易，之后才能进入发布者可提现余额。",
    support: "支持和运营",
    supportItems: ["支持版本固定", "弃用必须提前通知", "运行事故进入审核队列"]
  }
} as const;

export function generateStaticParams() {
  return marketplaceSkills.map((skill) => ({ slug: skill.slug }));
}

export default async function SkillDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [skill, projects, relatedSkills] = await Promise.all([getPublicMarketplaceSkill(slug), getDeveloperProjects(), getRelatedMarketplaceSkills(slug)]);
  const labels = copy[locale];

  if (!skill) {
    notFound();
  }

  const latestVersion = skill.changelog[0]?.version;

  const installRows = [
    [labels.cli, skill.installsCommand.cli],
    [labels.mcp, skill.installsCommand.mcp],
    [labels.sdk, skill.installsCommand.sdk]
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="marketplace" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname={`/skills/${skill.slug}`} />

      <section className="skill-detail-hero">
        <div>
          <a className="breadcrumb-link" href={localizedHref("/marketplace", locale)}>
            {labels.back}
          </a>
          <div className="eyebrow">
            <PackageCheck size={16} aria-hidden="true" />
            <span>{localizeText(skill.category, locale)}</span>
          </div>
          <h1>{localizeText(skill.name, locale)}</h1>
          <p>{localizeText(skill.summary, locale)}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href="#install">
              <Terminal size={18} aria-hidden="true" />
              <span>{labels.install}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/dashboard", locale)}>
              <WalletCards size={18} aria-hidden="true" />
              <span>{dictionary.nav.dashboard}</span>
            </a>
          </div>
        </div>

        <aside className="skill-status-panel">
          <div className="skill-status-panel__top">
            <BadgeCheck size={20} aria-hidden="true" />
            <div>
              <span>{labels.approval}</span>
              <strong>{localizeText(skill.verification, locale)}</strong>
            </div>
          </div>
          <div className="skill-status-grid">
            <div>
              <span>{labels.success}</span>
              <strong>{skill.successRate}</strong>
            </div>
            <div>
              <span>{labels.latency}</span>
              <strong>{skill.latency}</strong>
            </div>
            <div>
              <span>{labels.installs}</span>
              <strong>{skill.installs}</strong>
            </div>
            <div>
              <span>{labels.runtime}</span>
              <strong>{skill.runtime}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="skill-detail-layout">
        <div className="skill-detail-main">
          <article className="skill-detail-panel" id="install">
            <div className="card-kicker">
              <Terminal size={16} aria-hidden="true" />
              <span>{labels.install}</span>
            </div>
            <div className="install-command-list">
              {installRows.map(([label, value]) => (
                <div className="install-command-row" key={label}>
                  <span>{label}</span>
                  <code>{value}</code>
                </div>
              ))}
            </div>
            <SkillProjectActionPanel
              dashboardHref={localizedHref("/dashboard", locale)}
              latestVersion={latestVersion}
              locale={locale}
              projects={projects}
              skillName={localizeText(skill.name, locale)}
              skillSlug={skill.slug}
            />
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.useCases}</span>
            </div>
            <div className="use-case-list">
              {skill.useCases.map((item) => (
                <div className="use-case-row" key={localizeText(item, locale)}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{localizeText(item, locale)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <FileJson size={16} aria-hidden="true" />
              <span>{labels.contract}</span>
            </div>
            <div className="schema-grid">
              <div className="code-panel">
                <div className="code-panel__bar">
                  <span>{labels.input}</span>
                  <span>JSON</span>
                </div>
                <pre>
                  <code>{skill.inputExample}</code>
                </pre>
              </div>
              <div className="code-panel">
                <div className="code-panel__bar">
                  <span>{labels.output}</span>
                  <span>JSON</span>
                </div>
                <pre>
                  <code>{skill.outputExample}</code>
                </pre>
              </div>
            </div>
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.security}</span>
            </div>
            <div className="security-grid">
              {skill.securityReport.map((item) => (
                <div className="security-row" key={localizeText(item.label, locale)}>
                  <strong>{localizeText(item.label, locale)}</strong>
                  <span>{localizeText(item.value, locale)}</span>
                </div>
              ))}
            </div>
          </article>

          {relatedSkills.length > 0 ? (
            <article className="skill-detail-panel">
              <div className="card-kicker">
                <PackageSearch size={16} aria-hidden="true" />
                <span>{labels.related}</span>
              </div>
              <p className="related-skill-intro">{labels.relatedBody}</p>
              <div className="related-skill-list">
                {relatedSkills.map((suggestion) => (
                  <section className="related-skill-row" key={suggestion.skill.slug}>
                    <header className="related-skill-row__head">
                      <div>
                        <strong>{localizeText(suggestion.skill.name, locale)}</strong>
                        <span>{localizeText(suggestion.skill.summary, locale)}</span>
                      </div>
                      <span className={`risk-badge risk-badge--${suggestion.skill.risk}`}>{suggestion.skill.risk}</span>
                    </header>

                    <div className="related-skill-meta">
                      <span>{localizeText(suggestion.skill.category, locale)}</span>
                      <span>{suggestion.skill.runtime}</span>
                      <span>{suggestion.skill.price[locale]}</span>
                      <span>{localizeText(suggestion.skill.verification, locale)}</span>
                    </div>

                    <div className="related-skill-reasons" aria-label={labels.relatedReasons}>
                      {suggestion.reasons[locale].map((reason) => (
                        <span key={reason}>
                          <BadgeCheck size={13} aria-hidden="true" />
                          {reason}
                        </span>
                      ))}
                    </div>

                    <div className="related-skill-command">
                      <code>{suggestion.skill.installsCommand.cli}</code>
                      <a className="secondary-button secondary-button--compact" href={localizedHref(`/skills/${suggestion.skill.slug}`, locale)}>
                        <ShieldCheck size={15} aria-hidden="true" />
                        <span>{labels.relatedDetails}</span>
                      </a>
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ) : null}

          <SkillAbuseReportForm
            locale={locale}
            skillName={localizeText(skill.name, locale)}
            skillSlug={skill.slug}
          />
        </div>

        <aside className="skill-detail-side">
          <section className="skill-detail-panel">
            <div className="card-kicker">
              <CircleDollarSignIcon />
              <span>{labels.pricing}</span>
            </div>
            <div className="price-block">
              <strong>{skill.price[locale]}</strong>
              <span>{labels.payoutBody}</span>
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.permissions}</span>
            </div>
            <div className="permission-list">
              {skill.permissions.map((permission) => (
                <div className="permission-row" key={permission.key}>
                  <strong>{localizeText(permission.label, locale)}</strong>
                  <span>{localizeText(permission.value, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <History size={16} aria-hidden="true" />
              <span>{labels.changelog}</span>
            </div>
            <div className="changelog-list">
              {skill.changelog.map((item) => (
                <div className="changelog-row" key={item.version}>
                  <strong>{item.version}</strong>
                  <span>{localizeText(item.note, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Star size={16} aria-hidden="true" />
              <span>{labels.reviews}</span>
            </div>
            {skill.reviews.map((review) => (
              <blockquote className="operator-note" key={review.author}>
                <p>{localizeText(review.quote, locale)}</p>
                <cite>{review.author}</cite>
              </blockquote>
            ))}
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Code2 size={16} aria-hidden="true" />
              <span>{labels.support}</span>
            </div>
            <div className="support-list">
              {labels.supportItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function CircleDollarSignIcon() {
  return <WalletCards size={16} aria-hidden="true" />;
}
