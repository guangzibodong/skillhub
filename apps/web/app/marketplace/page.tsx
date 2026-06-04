import {
  ArrowRight,
  BadgeCheck,
  CircleDollarSign,
  Code2,
  HandCoins,
  MousePointerClick,
  Repeat,
  ShieldCheck,
  Store,
  Tag,
  Users,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const railIcons = [Store, Code2, ShieldCheck] as const;
const pricingIcons = [Tag, MousePointerClick, Repeat] as const;

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.marketplacePage;

  return (
    <main className="product-shell">
      <SiteHeader active="marketplace" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/marketplace" />

      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <Store size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href={localizedHref("/dashboard", locale)}>
              <WalletCards size={18} aria-hidden="true" />
              <span>{labels.ctaPrimary}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/docs", locale)}>
              <Code2 size={18} aria-hidden="true" />
              <span>{labels.ctaSecondary}</span>
            </a>
          </div>
        </div>
        <aside className="market-signal-card">
          <div className="market-signal-card__icon" aria-hidden="true">
            <CircleDollarSign size={22} />
          </div>
          <span>{labels.commissionTitle}</span>
          <strong>20 / 80</strong>
          <small>{labels.splitCaption}</small>
        </aside>
      </section>

      <section className="feature-grid">
        {labels.rails.map((item, index) => {
          const Icon = railIcons[index];
          return (
            <article className="feature-card lift-card" key={item.title}>
              <div className="workflow-card__icon" aria-hidden="true">
                <Icon size={18} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="agent-flow-section">
        <div className="section-heading">
          <div className="eyebrow">
            <HandCoins size={16} aria-hidden="true" />
            <span>{labels.moneyTitle}</span>
          </div>
        </div>

        <div className="timeline timeline--six">
          {labels.moneySteps.map((step, index) => (
            <div className="timeline__item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {index < labels.moneySteps.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </section>

      <section className="marketplace-layout">
        <div className="marketplace-panel">
          <div className="card-kicker">
            <BadgeCheck size={16} aria-hidden="true" />
            <span>{labels.pricingTitle}</span>
          </div>
          <div className="pricing-grid">
            {labels.pricing.map((item, index) => {
              const Icon = pricingIcons[index];
              return (
                <article className="pricing-card lift-card" key={item.name}>
                  <Icon size={18} aria-hidden="true" />
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="marketplace-panel marketplace-panel--compact">
          <div className="card-kicker">
            <CircleDollarSign size={16} aria-hidden="true" />
            <span>{labels.commissionTitle}</span>
          </div>
          <div className="commission-list">
            {labels.commissionRows.map(([label, value]) => (
              <div className="commission-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="docs-note docs-note--inline">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{dictionary.common.subtitle}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
