import { ArrowRight, BrainCircuit, Code2, Network, Route, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const cardIcons = [BrainCircuit, Route, ShieldCheck] as const;

const sdkSnippet = `import { SkillHub } from "@useskillhub/sdk";

const skillhub = new SkillHub({
  baseUrl: "https://api.useskillhub.com"
});

const skills = await skillhub.search({
  query: "research with citations",
  permissionLevel: "medium"
});`;

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="product-shell">
      <SiteHeader active="agents" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/agents" />

      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <BrainCircuit size={16} aria-hidden="true" />
            <span>{dictionary.agentsPage.eyebrow}</span>
          </div>
          <h1>{dictionary.agentsPage.title}</h1>
          <p>{dictionary.agentsPage.description}</p>
        </div>
        <a className="primary-button primary-button--large" href={localizedHref("/registry", locale)}>
          <Network size={18} aria-hidden="true" />
          <span>{dictionary.nav.registry}</span>
        </a>
      </section>

      <section className="feature-grid">
        {dictionary.agentsPage.cards.map((item, index) => {
          const Icon = cardIcons[index];
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
            <Sparkles size={16} aria-hidden="true" />
            <span>{dictionary.agentsPage.timelineTitle}</span>
          </div>
        </div>

        <div className="timeline">
          {dictionary.agentsPage.timeline.map((step, index) => (
            <div className="timeline__item" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {index < dictionary.agentsPage.timeline.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </section>

      <section className="contract-section contract-section--dark" aria-labelledby="sdk-heading">
        <div className="manifest-copy">
          <div className="card-kicker">
            <Code2 size={16} aria-hidden="true" />
            <span>SDK</span>
          </div>
          <h2 id="sdk-heading">{dictionary.agentsPage.sdkTitle}</h2>
          <p>{dictionary.agentsPage.sdkBody}</p>
        </div>

        <div className="code-panel" aria-label="SkillHub SDK example">
          <div className="code-panel__bar">
            <span>agent.ts</span>
            <span>@useskillhub/sdk</span>
          </div>
          <pre>
            <code>{sdkSnippet}</code>
          </pre>
        </div>
      </section>
    </main>
  );
}
