import { BookOpen, Braces, FileJson, LockKeyhole, Scale, SearchCode, Terminal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sectionIcons = [FileJson, SearchCode, Braces] as const;

const manifestSnippet = `{
  "schemaVersion": "0.1",
  "name": "support-triage",
  "displayName": "Support Triage",
  "version": "0.1.0",
  "runtime": {
    "type": "http",
    "entrypoint": "https://api.example.com/skill"
  },
  "permissions": {
    "network": false,
    "browser": false,
    "filesystem": "none",
    "secrets": []
  }
}`;

const endpoints = [
  "GET /health",
  "GET /v1/stats",
  "GET /v1/skills/search",
  "GET /v1/skills/:slug",
  "POST /v1/skills",
  "POST /mcp"
];

export default async function DocsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

  return (
    <main className="product-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/docs" />

      <section className="page-hero">
        <div>
          <div className="eyebrow">
            <BookOpen size={16} aria-hidden="true" />
            <span>{dictionary.docsPage.eyebrow}</span>
          </div>
          <h1>{dictionary.docsPage.title}</h1>
          <p>{dictionary.docsPage.description}</p>
        </div>
        <a className="primary-button primary-button--large" href={localizedHref("/publish", locale)}>
          <Terminal size={18} aria-hidden="true" />
          <span>{dictionary.common.publishSkill}</span>
        </a>
      </section>

      <section className="feature-grid">
        {dictionary.docsPage.sections.map((item, index) => {
          const Icon = sectionIcons[index];
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

      <section className="docs-layout">
        <div className="code-panel" aria-label="SkillHub manifest example">
          <div className="code-panel__bar">
            <span>skillhub.json</span>
            <span>schema v0.1</span>
          </div>
          <pre>
            <code>{manifestSnippet}</code>
          </pre>
        </div>

        <aside className="info-panel docs-endpoints lift-card">
          <div className="card-kicker">
            <SearchCode size={16} aria-hidden="true" />
            <span>{dictionary.docsPage.endpointsTitle}</span>
          </div>
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <code key={endpoint}>{endpoint}</code>
            ))}
          </div>
          <div className="docs-note">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{dictionary.docsPage.publishNote}</span>
          </div>
          <a className="secondary-button secondary-button--compact docs-terms-link" href={localizedHref("/terms", locale)}>
            <Scale size={15} aria-hidden="true" />
            <span>{locale === "zh" ? "\u8fd0\u8425\u6761\u6b3e" : "Operating terms"}</span>
          </a>
        </aside>
      </section>
    </main>
  );
}
