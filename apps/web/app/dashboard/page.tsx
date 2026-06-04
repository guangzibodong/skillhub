import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  KeyRound,
  PackageCheck,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherIcons = [PackageCheck, CircleDollarSign, BarChart3] as const;
const buyerIcons = [BriefcaseBusiness, CreditCard, Activity] as const;

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.dashboardPage;

  return (
    <main className="product-shell">
      <SiteHeader active="dashboard" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/dashboard" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <WalletCards size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="console-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {labels.metrics.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="console-grid">
          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <PackageCheck size={16} aria-hidden="true" />
              <span>{labels.publisher}</span>
            </div>
            <div className="ops-list">
              {labels.publisherCards.map(([title, detail], index) => {
                const Icon = publisherIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.buyer}</span>
            </div>
            <div className="ops-list">
              {labels.buyerCards.map(([title, detail], index) => {
                const Icon = buyerIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="finance-layout">
        <article className="ops-panel finance-panel">
          <div className="card-kicker">
            <CircleDollarSign size={16} aria-hidden="true" />
            <span>{labels.ledgerTitle}</span>
          </div>
          <div className="ledger-table">
            <div className="ledger-row ledger-row--head">
              {labels.ledgerHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {labels.ledgerRows.map(([skill, gross, fee, net, status]) => (
              <div className="ledger-row" key={skill}>
                <strong>{skill}</strong>
                <span>{gross}</span>
                <span>{fee}</span>
                <span>{net}</span>
                <span className="status-chip">{status}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel payout-panel">
          <div className="card-kicker">
            <WalletCards size={16} aria-hidden="true" />
            <span>{labels.payoutTitle}</span>
          </div>
          <div className="payout-list">
            {labels.payoutItems.map(([label, value]) => (
              <div className="payout-row" key={label}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
