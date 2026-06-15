import { ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import type { PublicPageDefinition } from "@/lib/public-pages";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { siteName, localizedUrl } from "@/lib/seo";

type Props = {
  locale: Locale;
  page: PublicPageDefinition;
};

export function PublicInfoPage({ locale, page }: Props) {
  const copy = page[locale];
  const jsonLd = buildJsonLd(page, locale);
  const isLegal = page.layout === "legal";

  return (
    <AppShell active={page.active} locale={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={`public-info-page ${isLegal ? "public-info-page--legal" : ""}`}>
        <section className="public-info-hero">
          <div className="public-info-hero__copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            {copy.updated ? <span className="public-info-updated">{copy.updated}</span> : null}
            <p>{copy.lead}</p>
            <div className="public-info-actions">
              {copy.primaryCta ? (
                <a
                  className="btn-primary btn-primary--large"
                  href={formatHref(copy.primaryCta.href, locale)}
                >
                  <span>{copy.primaryCta.label}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              ) : null}
              {copy.secondaryCta ? (
                <a
                  className="btn-secondary btn-secondary--large"
                  href={formatHref(copy.secondaryCta.href, locale)}
                >
                  <span>{copy.secondaryCta.label}</span>
                </a>
              ) : null}
            </div>
          </div>

          {copy.quickAnswer ? (
            <aside className="public-info-answer">
              <div className="eyebrow">
                <ShieldCheck size={15} aria-hidden="true" />
                <span>{locale === "zh" ? "快速回答" : "Quick answer"}</span>
              </div>
              <p>{copy.quickAnswer}</p>
            </aside>
          ) : null}
        </section>

        {isLegal ? (
          <section className="public-info-legal" aria-label={locale === "zh" ? "政策正文" : "Policy content"}>
            <aside className="public-info-toc" aria-label={locale === "zh" ? "本页目录" : "On this page"}>
              <strong>{locale === "zh" ? "本页内容" : "On this page"}</strong>
              {copy.sections.map((section, index) => (
                <a href={`#section-${index + 1}`} key={section.title}>
                  {section.title}
                </a>
              ))}
            </aside>
            <article className="public-info-legal__article">
              {copy.sections.map((section, index) => (
                <section id={`section-${index + 1}`} key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={formatBulletKey(bullet)}>
                          <PublicInfoBullet bullet={bullet} locale={locale} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </article>
          </section>
        ) : (
          <section className="public-info-grid" aria-label={locale === "zh" ? "页面内容" : "Page content"}>
            {copy.sections.map((section, index) => (
              <article className="public-info-card" key={section.title}>
                <div className="public-info-card__icon" aria-hidden="true">
                  {index % 3 === 0 ? <Info size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={formatBulletKey(bullet)}>
                        <PublicInfoBullet bullet={bullet} locale={locale} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </section>
        )}

        {copy.faq ? (
          <section className="public-info-faq" aria-labelledby="public-info-faq-title">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 id="public-info-faq-title">{locale === "zh" ? "常见问题" : "Common questions"}</h2>
            </div>
            <div className="public-info-faq__items">
              {copy.faq.map((item) => (
                <article key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}

function formatHref(href: string, locale: Locale) {
  return href.startsWith("mailto:") ? href : localizedHref(href, locale);
}

function formatBulletKey(bullet: string | { href: string; label: string }) {
  return typeof bullet === "string" ? bullet : `${bullet.href}:${bullet.label}`;
}

function PublicInfoBullet({
  bullet,
  locale,
}: {
  bullet: string | { href: string; label: string };
  locale: Locale;
}) {
  if (typeof bullet === "string") {
    return <>{bullet}</>;
  }

  return <a href={formatHref(bullet.href, locale)}>{bullet.label}</a>;
}

function buildJsonLd(page: PublicPageDefinition, locale: Locale) {
  const copy = page[locale];

  if (page.schema === "ContactPage") {
    return {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: copy.title,
      description: copy.lead,
      url: localizedUrl(page.path, locale),
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: "https://useskillhub.com",
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": page.schema,
    name: copy.title,
    headline: copy.title,
    description: copy.quickAnswer ?? copy.lead,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    url: localizedUrl(page.path, locale),
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: "https://useskillhub.com",
    },
    mainEntity:
      copy.faq && copy.faq.length > 0
        ? copy.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          }))
        : undefined,
  };
}
