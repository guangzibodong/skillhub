import { ArrowRight, BookOpenCheck, CheckCircle2, Layers3, PlugZap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { GrowthContentItem, GrowthHub, GrowthHubKey } from "@/lib/growth-content";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { localizedUrl, siteName } from "@/lib/seo";

type GrowthHubPageProps = {
  hub: GrowthHub;
  hubKey: GrowthHubKey;
  items: GrowthContentItem[];
  locale: Locale;
};

type GrowthDetailPageProps = {
  item: GrowthContentItem;
  locale: Locale;
  relatedItems: GrowthContentItem[];
};

export function GrowthHubPage({ hub, hubKey, items, locale }: GrowthHubPageProps) {
  const itemNoun = locale === "zh" ? "内容" : "resources";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.title[locale],
    description: hub.intro[locale],
    url: localizedUrl(hub.path, locale),
    publisher: { "@type": "Organization", name: siteName, url: "https://useskillhub.com" },
  };

  return (
    <AppShell active={hub.active} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="growth-page">
        <section className="growth-hero" aria-labelledby={`${hubKey}-heading`}>
          <div>
            <p className="eyebrow">{hub.eyebrow[locale]}</p>
            <h1 id={`${hubKey}-heading`}>{hub.title[locale]}</h1>
            <p>{hub.intro[locale]}</p>
            <div className="growth-actions">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "浏览技能市场" : "Browse marketplace"}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/docs", locale)}>
                <span>{locale === "zh" ? "阅读文档" : "Read docs"}</span>
              </a>
            </div>
          </div>
          <aside className="growth-hero-panel" aria-label={locale === "zh" ? "页面摘要" : "Page summary"}>
            <span><Layers3 size={16} aria-hidden="true" /> {items.length} {itemNoun}</span>
            <strong>{locale === "zh" ? "从业务问题开始，而不是从工具名开始。" : "Start from the business problem, not the tool name."}</strong>
            <p>{locale === "zh" ? "每个页面都会连接到技能市场、文档、发布路径和联系入口。" : "Every page connects discovery, docs, publishing paths, and contact routes."}</p>
          </aside>
        </section>

        <section className="growth-card-grid" aria-label={hub.title[locale]}>
          {items.map((item) => (
            <article className="growth-card lift-card" key={item.path}>
              <span>{item.category[locale]}</span>
              <h2>
                <a href={localizedHref(item.path, locale)}>{item.content[locale].title}</a>
              </h2>
              <p>{item.content[locale].intro}</p>
              <a className="growth-card__link" href={localizedHref(item.path, locale)}>
                {locale === "zh" ? "查看详情" : "Open guide"}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

export function GrowthDetailPage({ item, locale, relatedItems }: GrowthDetailPageProps) {
  const copy = item.content[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: copy.title,
    description: copy.intro,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    url: localizedUrl(item.path, locale),
    publisher: { "@type": "Organization", name: siteName, url: "https://useskillhub.com" },
  };

  return (
    <AppShell active={item.hub} locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="growth-page growth-article">
        <section className="growth-hero growth-hero--article">
          <div>
            <p className="eyebrow">{item.category[locale]}</p>
            <h1>{copy.title}</h1>
            <p>{copy.intro}</p>
            <div className="growth-actions">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "去找相关技能" : "Find related Skills"}</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/contact", locale)}>
                <span>{locale === "zh" ? "咨询定制工作流" : "Request custom workflow"}</span>
              </a>
            </div>
          </div>
          <aside className="growth-hero-panel">
            <span><BookOpenCheck size={16} aria-hidden="true" /> {locale === "zh" ? "采用检查清单" : "Adoption checklist"}</span>
            <ul>
              {copy.checklist.map((item) => (
                <li key={item}><CheckCircle2 size={14} aria-hidden="true" /> {item}</li>
              ))}
            </ul>
          </aside>
        </section>

        <div className="growth-article-layout">
          <div className="growth-article-body">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
          <aside className="growth-side-panel">
            <span><PlugZap size={15} aria-hidden="true" /> {locale === "zh" ? "下一步" : "Next steps"}</span>
            <a href={localizedHref("/marketplace", locale)}>{locale === "zh" ? "按分类筛选技能" : "Filter Skills by category"}</a>
            <a href={localizedHref("/docs", locale)}>{locale === "zh" ? "查看安装路径" : "Read install path"}</a>
            <a href={localizedHref("/publish", locale)}>{locale === "zh" ? "发布自己的技能" : "Publish a Skill"}</a>
          </aside>
        </div>

        {relatedItems.length > 0 ? (
          <section className="growth-related" aria-labelledby="growth-related-heading">
            <p className="eyebrow">{locale === "zh" ? "继续阅读" : "Keep reading"}</p>
            <h2 id="growth-related-heading">{locale === "zh" ? "相关页面" : "Related pages"}</h2>
            <div className="growth-card-grid growth-card-grid--compact">
              {relatedItems.map((related) => (
                <article className="growth-card lift-card" key={related.path}>
                  <span>{related.category[locale]}</span>
                  <h3><a href={localizedHref(related.path, locale)}>{related.content[locale].title}</a></h3>
                  <p>{related.content[locale].intro}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </AppShell>
  );
}
