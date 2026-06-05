import {
  Activity,
  Boxes,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  KeyRound,
  Network,
  PackageCheck,
  Plus,
  Radar,
  Search,
  ServerCog,
  ShieldCheck,
  Terminal,
  Zap
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SkillTable } from "@/components/skill-table";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { getGatewayStats, getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const workflowIcons = [Radar, FileJson, Zap] as const;
const trustIcons = [ShieldCheck, PackageCheck, KeyRound] as const;

const manifestSnippet = `{
  "schemaVersion": "0.1",
  "name": "browser-research",
  "runtime": {
    "type": "http",
    "entrypoint": "https://api.useskillhub.com/demo/browser-research"
  },
  "permissions": {
    "network": true,
    "browser": true,
    "filesystem": "none",
    "secrets": []
  }
}`;

function getMetricValue(metrics: Awaited<ReturnType<typeof getGatewayStats>>, label: string, fallback: string) {
  return metrics.find((metric) => metric.label === label)?.value ?? fallback;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [skills, gatewayStats] = await Promise.all([getSkills(), getGatewayStats()]);
  const verifiedSkills = skills.filter((skill) => skill.verificationStatus === "verified").length;
  const publishedFromGateway = toNumber(getMetricValue(gatewayStats, "Published skills", "0"));
  const verifiedFromGateway = toNumber(getMetricValue(gatewayStats, "Verified", "0"));
  const publishedSkills = Math.max(publishedFromGateway, skills.length);
  const verifiedCount = Math.max(verifiedFromGateway, verifiedSkills);
  const visibleMetrics = [
    { label: dictionary.metrics.publishedSkills, value: String(publishedSkills) },
    { label: dictionary.metrics.verified, value: String(verifiedCount) },
    { label: dictionary.metrics.apiCalls, value: getMetricValue(gatewayStats, "API calls", "0") },
    { label: dictionary.metrics.avgLatency, value: getMetricValue(gatewayStats, "Avg latency", "--") }
  ];
  const verifiedShare =
    publishedSkills === 0 ? "0%" : `${Math.round((verifiedCount / Math.max(publishedSkills, 1)) * 100)}%`;
  const statusSignals = [
    { label: dictionary.home.status.api, value: dictionary.home.status.online, icon: Activity },
    { label: dictionary.home.status.mcp, value: "/mcp", icon: Network },
    { label: dictionary.home.status.schema, value: "v0.1", icon: Braces },
    { label: dictionary.home.status.store, value: "Postgres", icon: Database }
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="home" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/" />

      <section className="command-screen reveal-scope" aria-labelledby="home-heading">
        <div className="hero-copy reveal-item">
          <div className="eyebrow">
            <Radar size={16} aria-hidden="true" />
            <span>{dictionary.home.eyebrow}</span>
          </div>
          <h1 id="home-heading">{dictionary.home.title}</h1>
          <p>{dictionary.home.description}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href={localizedHref("/publish", locale)}>
              <Plus size={18} aria-hidden="true" />
              <span>{dictionary.home.publishCta}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref("/docs", locale)}>
              <Code2 size={18} aria-hidden="true" />
              <span>{dictionary.common.viewContract}</span>
            </a>
          </div>
        </div>

        <aside className="gateway-card reveal-item reveal-item--delay" aria-label={dictionary.common.gateway}>
          <div className="card-kicker">
            <ServerCog size={16} aria-hidden="true" />
            <span>{dictionary.common.gateway}</span>
          </div>
          <div className="gateway-card__head">
            <div>
              <h2>{dictionary.home.gatewayTitle}</h2>
              <p>api.useskillhub.com</p>
            </div>
            <span className="live-dot">
              <span />
              {dictionary.common.live}
            </span>
          </div>

          <div className="status-grid">
            {statusSignals.map((item) => (
              <div className="status-tile" key={item.label}>
                <item.icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="terminal-card">
            <div className="terminal-card__bar">
              <span />
              <span />
              <span />
            </div>
            <pre>
              <code>{`GET /v1/skills/search?tag=research
200 OK  ${skills.length} skills

POST /mcp
tools: skillhub.search, skillhub.get`}</code>
            </pre>
          </div>
        </aside>

        <section className="registry-workbench reveal-item reveal-item--late" id="registry" aria-labelledby="registry-heading">
          <div className="workbench-top">
            <div>
              <div className="card-kicker">
                <Boxes size={16} aria-hidden="true" />
                <span>{dictionary.home.registryEyebrow}</span>
              </div>
              <h2 id="registry-heading">{dictionary.home.registryTitle}</h2>
            </div>
            <div className="workbench-actions">
              <div className="search-box">
                <Search size={17} aria-hidden="true" />
                <input aria-label={dictionary.home.searchPlaceholder} placeholder={dictionary.home.searchPlaceholder} />
              </div>
              <a className="secondary-button" href={localizedHref("/publish", locale)}>
                <Plus size={17} aria-hidden="true" />
                <span>{dictionary.home.newSkill}</span>
              </a>
            </div>
          </div>

          <div className="metric-strip">
            {visibleMetrics.map((item) => (
              <div className="metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
            <div className="metric metric--accent">
              <span>{dictionary.metrics.verifiedShare}</span>
              <strong>{verifiedShare}</strong>
            </div>
          </div>

          <SkillTable apiUrl={apiUrl} labels={dictionary.skillTable} skills={skills} />
        </section>
      </section>

      <section className="platform-section" id="protocol" aria-labelledby="protocol-heading">
        <div className="section-heading reveal-item">
          <div className="eyebrow">
            <Terminal size={16} aria-hidden="true" />
            <span>{dictionary.home.protocolEyebrow}</span>
          </div>
          <h2 id="protocol-heading">{dictionary.home.protocolTitle}</h2>
          <p>{dictionary.home.protocolBody}</p>
        </div>

        <div className="workflow-grid">
          {dictionary.home.workflows.map((item, index) => {
            const Icon = workflowIcons[index];
            return (
              <article className="workflow-card lift-card" key={item.title}>
                <div className="workflow-card__icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="contract-section" aria-labelledby="manifest-heading">
        <div className="manifest-copy">
          <div className="card-kicker">
            <FileJson size={16} aria-hidden="true" />
            <span>{dictionary.home.manifestEyebrow}</span>
          </div>
          <h2 id="manifest-heading">{dictionary.home.manifestTitle}</h2>
          <p>{dictionary.home.manifestBody}</p>

          <div className="contract-list">
            {dictionary.home.manifestBullets.map((item) => (
              <div className="contract-list__item" key={item}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="code-panel" aria-label="Example SkillHub manifest">
          <div className="code-panel__bar">
            <span>skillhub.json</span>
            <span>schema v0.1</span>
          </div>
          <pre>
            <code>{manifestSnippet}</code>
          </pre>
        </div>
      </section>

      <section className="trust-section" id="trust" aria-labelledby="trust-heading">
        <div className="section-heading section-heading--compact">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{dictionary.home.trustEyebrow}</span>
          </div>
          <h2 id="trust-heading">{dictionary.home.trustTitle}</h2>
        </div>

        <div className="trust-grid">
          {dictionary.home.trustItems.map((item, index) => {
            const Icon = trustIcons[index];
            return (
              <article className="trust-card lift-card" key={item.title}>
                <Icon size={20} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>SkillHub</strong>
          <span>{dictionary.common.subtitle}</span>
        </div>
        <div className="footer-links">
          <a href={`${apiUrl}/health`}>{dictionary.common.health}</a>
          <a href={`${apiUrl}/mcp`}>{dictionary.common.mcp}</a>
          <a href={localizedHref("/publish", locale)}>{dictionary.common.publish}</a>
          <a href={localizedHref("/terms", locale)}>{locale === "zh" ? "\u6761\u6b3e" : "Terms"}</a>
          <a href="https://github.com/guangzibodong/skillhub">{dictionary.common.github}</a>
        </div>
      </footer>
    </main>
  );
}
