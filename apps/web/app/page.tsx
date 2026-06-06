import {
  Activity,
  Boxes,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  Gauge,
  KeyRound,
  Network,
  PackageCheck,
  Plus,
  Radar,
  Search,
  ServerCog,
  ShieldCheck,
  Terminal,
  WalletCards,
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
const proofIcons = [KeyRound, ShieldCheck, Gauge, WalletCards, Activity, Terminal] as const;

const proofCopy = {
  en: {
    action: "Open launch readiness",
    body:
      "These are not brochure claims. They are the operating surfaces a buyer, publisher, or platform operator can revisit after the first install.",
    eyebrow: "Operating proof",
    items: [
      ["Account entry", "Email-code login, OAuth readiness, session fingerprints, and connected identity state are modeled before launch."],
      ["Review gate", "Submitted versions run automated manifest, runtime, example, and security checks before approval."],
      ["Runtime governance", "REST and MCP calls pass through project install, policy, budget, subscription, logging, and metering controls."],
      ["Commercial ledger", "Usage and subscriptions post into transactions, splits, balances, invoice records, refunds, disputes, and payouts."],
      ["Notification loop", "In-app events fan out to email and organization webhooks with templates, retry state, and admin recovery."],
      ["Smoke checks", "Production smoke commands verify stats, auth providers, launch readiness protection, and key app pages."]
    ],
    title: "A customer can inspect the platform, not just the pitch."
  },
  zh: {
    action: "\u67e5\u770b\u4e0a\u7ebf\u5c31\u7eea\u5ea6",
    body:
      "\u8fd9\u4e0d\u662f\u5ba3\u4f20\u6587\u6848\u3002\u8fd9\u4e9b\u662f\u4e70\u5bb6\u3001\u53d1\u5e03\u8005\u548c\u5e73\u53f0\u8fd0\u8425\u5728\u9996\u6b21\u5b89\u88c5\u540e\u4ecd\u7136\u4f1a\u56de\u6765\u5904\u7406\u7684\u771f\u5b9e\u754c\u9762\u548c\u72b6\u6001\u3002",
    eyebrow: "\u8fd0\u8425\u8bc1\u636e",
    items: [
      ["\u8d26\u53f7\u5165\u53e3", "\u90ae\u7bb1\u9a8c\u8bc1\u7801\u767b\u5f55\u3001OAuth \u5c31\u7eea\u5ea6\u3001\u4f1a\u8bdd\u6307\u7eb9\u548c\u8fde\u63a5\u8eab\u4efd\u72b6\u6001\u90fd\u5df2\u5efa\u6a21\u3002"],
      ["\u5ba1\u6838\u95f8\u95e8", "\u7248\u672c\u63d0\u4ea4\u540e\u4f1a\u7ecf\u8fc7 manifest\u3001runtime\u3001example\u3001security \u81ea\u52a8\u68c0\u67e5\u518d\u8fdb\u5165\u6279\u51c6\u3002"],
      ["\u8fd0\u884c\u6cbb\u7406", "REST \u548c MCP \u8c03\u7528\u90fd\u7ecf\u8fc7\u9879\u76ee\u5b89\u88c5\u3001\u7b56\u7565\u3001\u9884\u7b97\u3001\u8ba2\u9605\u3001\u65e5\u5fd7\u548c\u8ba1\u91cf\u63a7\u5236\u3002"],
      ["\u5546\u4e1a\u8d26\u672c", "\u7528\u91cf\u548c\u8ba2\u9605\u4f1a\u8fdb\u5165\u4ea4\u6613\u3001\u5206\u6210\u3001\u4f59\u989d\u3001\u53d1\u7968\u3001\u9000\u6b3e\u3001\u4e89\u8bae\u548c\u63d0\u73b0\u72b6\u6001\u3002"],
      ["\u901a\u77e5\u56de\u8def", "\u7ad9\u5185\u4e8b\u4ef6\u53ef fan-out \u5230\u90ae\u4ef6\u548c\u7ec4\u7ec7 webhook\uff0c\u5e76\u6709\u6a21\u677f\u3001\u91cd\u8bd5\u548c\u7ba1\u7406\u5458\u6062\u590d\u72b6\u6001\u3002"],
      ["\u70df\u6d4b\u95f8\u95e8", "\u751f\u4ea7\u70df\u6d4b\u547d\u4ee4\u4f1a\u68c0\u67e5 stats\u3001auth providers\u3001readiness \u4fdd\u62a4\u548c\u5173\u952e\u9875\u9762\u3002"]
    ],
    title: "\u5ba2\u6237\u80fd\u770b\u5230\u5e73\u53f0\uff0c\u4e0d\u53ea\u662f\u542c\u5230\u613f\u666f\u3002"
  }
} as const;

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
  const proof = proofCopy[locale];

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

      <section className="proof-section reveal-scope" aria-labelledby="proof-heading">
        <div className="proof-section__copy reveal-item">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{proof.eyebrow}</span>
          </div>
          <h2 id="proof-heading">{proof.title}</h2>
          <p>{proof.body}</p>
          <a className="secondary-button secondary-button--large" href={localizedHref("/admin#launch-readiness", locale)}>
            <Gauge size={18} aria-hidden="true" />
            <span>{proof.action}</span>
          </a>
        </div>

        <div className="proof-board">
          {proof.items.map(([title, description], index) => {
            const Icon = proofIcons[index];

            return (
              <article className="proof-card lift-card reveal-item reveal-item--delay" key={title}>
                <div>
                  <Icon size={18} aria-hidden="true" />
                  <strong>{title}</strong>
                </div>
                <p>{description}</p>
              </article>
            );
          })}
        </div>
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
