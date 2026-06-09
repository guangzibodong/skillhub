import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  KeyRound,
  Network,
  PlugZap,
  RadioTower,
  Route,
  ShieldCheck,
  Sparkles,
  Terminal,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { PUBLIC_PACKAGE_STATUS, publicRestSearchCommand } from "@/lib/public-package-status";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const cardIcons = [BrainCircuit, Route, ShieldCheck] as const;
const optionIcons = [PlugZap, RadioTower, Terminal] as const;
const governanceIcons = [KeyRound, ShieldCheck, Route, WalletCards] as const;

function snippets(apiUrl: string, labels: ReturnType<typeof getDictionary>["agentsPage"]["snippets"]) {
  const normalizedApiUrl = apiUrl.replace(/\/$/, "");

  return [
    {
      body: `{
  "mcpServers": {
    "skillhub": {
      "url": "${normalizedApiUrl}/mcp",
      "headers": {
        "Authorization": "Bearer \${SKILLHUB_PROJECT_API_KEY}"
      }
    }
  }
}`,
      file: "mcp.json",
      title: labels.mcpTitle
    },
    {
      body: `curl -X POST "${normalizedApiUrl}/v1/runtime/invoke" \\
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skillSlug":"browser-research","input":{"query":"market map with citations"}}'`,
      file: "runtime.sh",
      title: labels.restTitle
    },
    {
      body: PUBLIC_PACKAGE_STATUS.sdkPublished
        ? `# SDK package: ${PUBLIC_PACKAGE_STATUS.sdkPackageName}`
        : `SDK preview

The TypeScript SDK exists in the monorepo but is not published as a public package yet.
Use the public REST API for discovery and inspection:

${publicRestSearchCommand(normalizedApiUrl)}`,
      file: "agent.ts",
      title: labels.sdkTitle
    }
  ];
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const runtimeSnippets = snippets(apiUrl, dictionary.agentsPage.snippets);

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
        <div className="page-hero__actions">
          <a className="primary-button primary-button--large" href={localizedHref("/marketplace", locale)}>
            <Network size={18} aria-hidden="true" />
            <span>{dictionary.agentsPage.ctaPrimary}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/developer", locale)}>
            <Terminal size={18} aria-hidden="true" />
            <span>{dictionary.agentsPage.ctaSecondary}</span>
          </a>
        </div>
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

      <section className="agent-integration-layout" aria-labelledby="agent-integration-heading">
        <div className="agent-integration-copy">
          <div className="section-heading">
            <div className="eyebrow">
              <PlugZap size={16} aria-hidden="true" />
              <span>{dictionary.agentsPage.integrationEyebrow}</span>
            </div>
            <h2 id="agent-integration-heading">{dictionary.agentsPage.integrationTitle}</h2>
            <p>{dictionary.agentsPage.integrationBody}</p>
          </div>

          <div className="agent-integration-option-grid">
            {dictionary.agentsPage.integrationOptions.map((option, index) => {
              const Icon = optionIcons[index];

              return (
                <article className="agent-integration-option" key={option.title}>
                  <div>
                    <Icon size={17} aria-hidden="true" />
                    <strong>{option.title}</strong>
                  </div>
                  <p>{option.description}</p>
                  <code>{option.tag}</code>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="agent-runtime-map" aria-label={dictionary.agentsPage.integrationTitle}>
          {dictionary.agentsPage.timeline.map((step, index) => (
            <div className="agent-runtime-node" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {index < dictionary.agentsPage.timeline.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : null}
            </div>
          ))}
        </aside>
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

      <section className="agent-snippet-section" aria-labelledby="agent-snippets-heading">
        <div className="section-heading">
          <div className="eyebrow">
            <Code2 size={16} aria-hidden="true" />
            <span>{dictionary.agentsPage.snippetsTitle}</span>
          </div>
          <h2 id="agent-snippets-heading">{dictionary.agentsPage.sdkTitle}</h2>
          <p>{dictionary.agentsPage.sdkBody}</p>
        </div>

        <div className="agent-snippet-grid">
          {runtimeSnippets.map((snippet) => (
            <div className="code-panel agent-runtime-snippet" aria-label={snippet.title} key={snippet.title}>
              <div className="code-panel__bar">
                <span>{snippet.file}</span>
                <span>{snippet.title}</span>
              </div>
              <pre>
                <code>{snippet.body}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="contract-section contract-section--dark" aria-labelledby="agent-governance-heading">
        <div className="manifest-copy">
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{dictionary.agentsPage.governanceEyebrow}</span>
          </div>
          <h2 id="agent-governance-heading">{dictionary.agentsPage.governanceTitle}</h2>
          <p>{dictionary.agentsPage.governanceBody}</p>
          <div className="agent-governance-list">
            {dictionary.agentsPage.governanceItems.map((item, index) => {
              const Icon = governanceIcons[index];

              return (
                <div className="agent-governance-item" key={item}>
                  <Icon size={15} aria-hidden="true" />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="agent-production-checklist" aria-label={dictionary.agentsPage.checklistTitle}>
          <div className="card-kicker">
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{dictionary.agentsPage.checklistTitle}</span>
          </div>
          <div className="agent-checklist">
            {dictionary.agentsPage.checklist.map((item, index) => (
              <div className="agent-checklist__item" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
