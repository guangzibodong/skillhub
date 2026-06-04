import {
  AlertTriangle,
  Banknote,
  ClipboardCheck,
  FileClock,
  ListChecks,
  LockKeyhole,
  Scale,
  ShieldCheck
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const financeIcons = [Scale, Banknote, AlertTriangle] as const;

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.adminPage;

  return (
    <main className="product-shell">
      <SiteHeader active="admin" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/admin" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
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
      </section>

      <section className="admin-layout">
        <article className="ops-panel admin-review-panel">
          <div className="card-kicker">
            <ClipboardCheck size={16} aria-hidden="true" />
            <span>{labels.reviewTitle}</span>
          </div>
          <div className="review-queue">
            {labels.reviewRows.map(([name, risk, signal, state]) => (
              <div className="review-queue__row" key={name}>
                <div>
                  <strong>{name}</strong>
                  <span>{signal}</span>
                </div>
                <span className="risk-badge">{risk}</span>
                <span className="status-chip">{state}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="ops-panel admin-audit-panel">
          <div className="card-kicker">
            <FileClock size={16} aria-hidden="true" />
            <span>{labels.auditTitle}</span>
          </div>
          <div className="audit-list">
            {labels.auditRows.map((item) => (
              <div className="audit-row" key={item}>
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="admin-finance-section">
        <div className="section-heading section-heading--compact">
          <div className="eyebrow">
            <ListChecks size={16} aria-hidden="true" />
            <span>{labels.financeTitle}</span>
          </div>
        </div>

        <div className="finance-rule-grid">
          {labels.financeRows.map(([title, detail], index) => {
            const Icon = financeIcons[index];
            return (
              <article className="finance-rule lift-card" key={title}>
                <Icon size={19} aria-hidden="true" />
                <h2>{title}</h2>
                <p>{detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
