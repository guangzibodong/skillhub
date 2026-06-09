import {
  Activity,
  ArrowRight,
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
  Repeat2,
  Rocket,
  Search,
  ServerCog,
  ShieldCheck,
  Terminal,
  WalletCards,
  Zap,
} from "lucide-react";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { JourneyRailDeck } from "@/components/journey-rail";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { PublicAccessScope } from "@/components/public-access-scope";
import { SiteHeader } from "@/components/site-header";
import { SkillTable } from "@/components/skill-table";
import { getWorkspaceSession } from "@/lib/auth-session";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
} from "@/lib/i18n";
import {
  formatPublicPlatformLatency,
  formatPublicPlatformShare,
  getPublicPlatformStats,
} from "@/lib/public-platform-stats";
import { getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const workflowIcons = [Radar, FileJson, Zap] as const;
const trustIcons = [ShieldCheck, PackageCheck, KeyRound] as const;
const proofIcons = [
  KeyRound,
  ShieldCheck,
  Gauge,
  WalletCards,
  Activity,
  Terminal,
] as const;
const operatingIcons = [Code2, PackageCheck, ShieldCheck] as const;

const proofCopy = {
  en: {
    action: "View workspace proof",
    commandAction: "Open workspace entry",
    body: "These are not brochure claims. They are the operating surfaces a buyer, publisher, or platform operator can revisit after the first install.",
    eyebrow: "Operating proof",
    items: [
      [
        "Account entry",
        "Email-code login, OAuth readiness, session fingerprints, and connected identity state are modeled before launch.",
      ],
      [
        "Review gate",
        "Submitted versions run automated manifest, runtime, example, and security checks before approval.",
      ],
      [
        "Runtime governance",
        "REST and MCP calls pass through project install, policy, budget, subscription, logging, and metering controls.",
      ],
      [
        "Commercial ledger",
        "Future paid marketplace usage is modeled through transactions, splits, balances, invoice records, refunds, disputes, and manual payout review.",
      ],
      [
        "Notification loop",
        "In-app events fan out to email and organization webhooks with templates, retry state, and admin recovery.",
      ],
      [
        "Smoke checks",
        "Production smoke commands verify stats, auth providers, launch readiness protection, and key app pages.",
      ],
    ],
    title: "A customer can inspect the platform, not just the pitch.",
  },
  zh: {
    action: "\u67e5\u770b\u5de5\u4f5c\u53f0\u8bc1\u636e",
    commandAction: "\u5de5\u4f5c\u53f0\u5165\u53e3",
    body: "\u8fd9\u4e0d\u662f\u5ba3\u4f20\u6587\u6848\u3002\u8fd9\u4e9b\u662f\u4e70\u5bb6\u3001\u53d1\u5e03\u8005\u548c\u5e73\u53f0\u8fd0\u8425\u5728\u9996\u6b21\u5b89\u88c5\u540e\u4ecd\u7136\u4f1a\u56de\u6765\u5904\u7406\u7684\u771f\u5b9e\u754c\u9762\u548c\u72b6\u6001\u3002",
    eyebrow: "\u8fd0\u8425\u8bc1\u636e",
    items: [
      [
        "\u8d26\u53f7\u5165\u53e3",
        "\u90ae\u7bb1\u9a8c\u8bc1\u7801\u767b\u5f55\u3001OAuth \u5c31\u7eea\u5ea6\u3001\u4f1a\u8bdd\u6307\u7eb9\u548c\u8fde\u63a5\u8eab\u4efd\u72b6\u6001\u90fd\u5df2\u5efa\u6a21\u3002",
      ],
      [
        "\u5ba1\u6838\u95f8\u95e8",
        "\u7248\u672c\u63d0\u4ea4\u540e\u4f1a\u7ecf\u8fc7 manifest\u3001runtime\u3001example\u3001security \u81ea\u52a8\u68c0\u67e5\u518d\u8fdb\u5165\u6279\u51c6\u3002",
      ],
      [
        "\u8fd0\u884c\u6cbb\u7406",
        "REST \u548c MCP \u8c03\u7528\u90fd\u7ecf\u8fc7\u9879\u76ee\u5b89\u88c5\u3001\u7b56\u7565\u3001\u9884\u7b97\u3001\u8ba2\u9605\u3001\u65e5\u5fd7\u548c\u8ba1\u91cf\u63a7\u5236\u3002",
      ],
      [
        "\u5546\u4e1a\u8d26\u672c",
        "\u7528\u91cf\u548c\u8ba2\u9605\u4f1a\u8fdb\u5165\u4ea4\u6613\u3001\u5206\u6210\u3001\u4f59\u989d\u3001\u53d1\u7968\u3001\u9000\u6b3e\u3001\u4e89\u8bae\u548c\u63d0\u73b0\u72b6\u6001\u3002",
      ],
      [
        "\u901a\u77e5\u56de\u8def",
        "\u7ad9\u5185\u4e8b\u4ef6\u53ef fan-out \u5230\u90ae\u4ef6\u548c\u7ec4\u7ec7 webhook\uff0c\u5e76\u6709\u6a21\u677f\u3001\u91cd\u8bd5\u548c\u7ba1\u7406\u5458\u6062\u590d\u72b6\u6001\u3002",
      ],
      [
        "\u70df\u6d4b\u95f8\u95e8",
        "\u751f\u4ea7\u70df\u6d4b\u547d\u4ee4\u4f1a\u68c0\u67e5 stats\u3001auth providers\u3001readiness \u4fdd\u62a4\u548c\u5173\u952e\u9875\u9762\u3002",
      ],
    ],
    title:
      "\u5ba2\u6237\u80fd\u770b\u5230\u5e73\u53f0\uff0c\u4e0d\u53ea\u662f\u542c\u5230\u613f\u666f\u3002",
  },
} as const;

const operatingCopy = {
  en: {
    eyebrow: "Registry preview loops",
    title: "One platform for developers, publishers, and operators.",
    body: "The product only feels real when a listing becomes install state, runtime state, review state, and future paid-marketplace state. SkillHub keeps those Developer Preview architecture loops visible from day one.",
    flow: ["Publish", "Review", "Install", "Invoke", "Ledger", "Payout"],
    loops: [
      {
        action: "Open developer console",
        body: "Find a verified skill, install it into a project, create a reveal-once runtime key, run a governed test call, and monitor cost or incidents later.",
        href: "/developer",
        label: "Developer / Agent Builder",
        metric: "Project runtime",
        status: "Install -> test -> monitor",
      },
      {
        action: "Open publisher workspace",
        body: "Upload a manifest, submit an exact version, repair review blockers, activate pricing gates, respond to feedback, and track payout readiness.",
        href: "/publisher",
        label: "Publisher / Skill Author",
        metric: "Supply operations",
        status: "Draft -> review -> improve",
      },
      {
        action: "Operator direct link only",
        body: "Prioritize reviews, govern abuse and incidents, process ledger states, manage notification delivery, and inspect launch readiness without exposing secrets.",
        href: null,
        label: "Platform Operator",
        metric: "Trust and finance",
        status: "Review -> govern -> launch",
      },
    ],
  },
  zh: {
    eyebrow: "\u6ce8\u518c\u8868\u9884\u89c8\u95ed\u73af",
    title:
      "\u5f00\u53d1\u8005\u3001\u53d1\u5e03\u8005\u3001\u8fd0\u8425\u5458\u5171\u7528\u4e00\u4e2a\u5e73\u53f0\u3002",
    body: "\u4e00\u4e2a\u9875\u9762\u50cf\u4e0d\u50cf\u4ea7\u54c1\uff0c\u5173\u952e\u4e0d\u662f\u6587\u6848\uff0c\u800c\u662f\u5217\u8868\u80fd\u4e0d\u80fd\u53d8\u6210\u5b89\u88c5\u72b6\u6001\u3001\u8fd0\u884c\u72b6\u6001\u3001\u5ba1\u6838\u72b6\u6001\u3001\u8d26\u672c\u72b6\u6001\u548c\u9884\u53d1\u5e03\u63d0\u73b0\u6a21\u578b\u72b6\u6001\u3002",
    flow: [
      "\u53d1\u5e03",
      "\u5ba1\u6838",
      "\u5b89\u88c5",
      "\u8c03\u7528",
      "\u8d26\u672c",
      "\u63d0\u73b0",
    ],
    loops: [
      {
        action: "\u6253\u5f00\u5f00\u53d1\u8005\u63a7\u5236\u53f0",
        body: "\u627e\u5230\u5df2\u9a8c\u8bc1\u6280\u80fd\uff0c\u5b89\u88c5\u5230\u9879\u76ee\uff0c\u521b\u5efa\u4e00\u6b21\u53ef\u89c1\u7684\u8fd0\u884c Key\uff0c\u8dd1\u4e00\u6b21\u53d7\u6cbb\u7406\u7684\u6d4b\u8bd5\u8c03\u7528\uff0c\u4e4b\u540e\u56de\u6765\u770b\u6210\u672c\u548c\u4e8b\u6545\u3002",
        href: "/developer",
        label: "\u5f00\u53d1\u8005 / Agent Builder",
        metric: "\u9879\u76ee\u8fd0\u884c",
        status: "\u5b89\u88c5 -> \u6d4b\u8bd5 -> \u76d1\u63a7",
      },
      {
        action: "\u6253\u5f00\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0",
        body: "\u4e0a\u4f20 manifest\uff0c\u63d0\u4ea4\u7cbe\u786e\u7248\u672c\uff0c\u4fee\u590d\u5ba1\u6838\u963b\u65ad\uff0c\u5b8c\u6210\u4ef7\u683c\u95e8\u69db\uff0c\u56de\u590d\u53cd\u9988\uff0c\u8ddf\u8e2a\u63d0\u73b0\u5c31\u7eea\u5ea6\u3002",
        href: "/publisher",
        label: "\u53d1\u5e03\u8005 / \u6280\u80fd\u4f5c\u8005",
        metric: "\u4f9b\u7ed9\u4fa7\u8fd0\u8425",
        status: "\u8349\u7a3f -> \u5ba1\u6838 -> \u6539\u8fdb",
      },
      {
        action: "\u8fd0\u8425\u5458\u4f7f\u7528\u5355\u72ec\u94fe\u63a5",
        body: "\u5904\u7406\u5ba1\u6838\u4f18\u5148\u7ea7\uff0c\u6cbb\u7406\u6ee5\u7528\u548c\u4e8b\u6545\uff0c\u5904\u7406\u8d26\u672c\u72b6\u6001\uff0c\u7ba1\u7406\u901a\u77e5\u6295\u9012\uff0c\u5e76\u7528\u4e0d\u66b4\u9732\u5bc6\u94a5\u7684\u65b9\u5f0f\u68c0\u67e5\u4e0a\u7ebf\u5c31\u7eea\u5ea6\u3002",
        href: null,
        label: "\u5e73\u53f0\u8fd0\u8425",
        metric: "\u4fe1\u4efb\u548c\u8d22\u52a1",
        status: "\u5ba1\u6838 -> \u6cbb\u7406 -> \u4e0a\u7ebf",
      },
    ],
  },
} as const;

const manifestSnippet = `{
  "schemaVersion": "0.1",
  "name": "browser-research",
  "runtime": {
    "type": "http",
    "entrypoint": "https://example.com/skill-runtime"
  },
  "permissions": {
    "network": true,
    "browser": true,
    "filesystem": "none",
    "secrets": []
  }
}`;

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const skills = await getSkills();
  const [publicStats, session] = await Promise.all([
    getPublicPlatformStats({ skills }),
    getWorkspaceSession(),
  ]);
  const visibleMetrics = [
    {
      label: dictionary.metrics.publishedSkills,
      value: String(publicStats.publicSkills),
    },
    {
      label: dictionary.metrics.totalSkillRecords,
      value: String(publicStats.totalSkillRecords),
    },
    { label: dictionary.metrics.verified, value: String(publicStats.verifiedSkills) },
    {
      label: dictionary.metrics.callableSkills,
      value: String(publicStats.callableSkills),
    },
  ];
  const verifiedShare = formatPublicPlatformShare(publicStats.verifiedSkills, publicStats.publicSkills);
  const statusSignals = [
    {
      label: dictionary.home.status.api,
      value: dictionary.home.status.online,
      icon: Activity,
    },
    { label: dictionary.home.status.mcp, value: "/mcp", icon: Network },
    { label: dictionary.home.status.schema, value: "v0.1", icon: Braces },
    { label: dictionary.home.status.store, value: "Postgres", icon: Database },
  ];
  const operating = operatingCopy[locale];
  const proof = proofCopy[locale];

  return (
    <main className="product-shell">
      <SiteHeader
        active="home"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/"
      />

      <section
        className="command-screen reveal-scope"
        aria-labelledby="home-heading"
      >
        <div className="hero-copy reveal-item">
          <div className="eyebrow">
            <Radar size={16} aria-hidden="true" />
            <span>{dictionary.home.eyebrow}</span>
          </div>
          <h1 id="home-heading">{dictionary.home.title}</h1>
          <p>{dictionary.home.description}</p>
          <div className="hero-actions">
            <a
              className="primary-button primary-button--large"
              href={localizedHref("/marketplace", locale)}
            >
              <Search size={18} aria-hidden="true" />
              <span>{dictionary.common.marketplace}</span>
            </a>
            <a
              className="secondary-button secondary-button--large"
              href={localizedHref("/publish", locale)}
            >
              <Plus size={18} aria-hidden="true" />
              <span>{dictionary.home.publishCta}</span>
            </a>
            <a
              className="secondary-button secondary-button--large"
              href={localizedHref("/docs#mcp", locale)}
            >
              <FileJson size={18} aria-hidden="true" />
              <span>
                {locale === "zh" ? "\u5f00\u53d1\u8005\u5feb\u901f\u5f00\u59cb" : "Developer quickstart"}
              </span>
            </a>
          </div>
        </div>

        <aside
          className="gateway-card reveal-item reveal-item--delay"
          aria-label={dictionary.common.gateway}
        >
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
200 OK  ${publicStats.publicSkills} public skills

POST /mcp
tools: skillhub.search, skillhub.get`}</code>
            </pre>
          </div>
        </aside>

        <PublicAccessScope locale={locale} />

        <section
          className="registry-workbench reveal-item reveal-item--late"
          id="registry"
          aria-labelledby="registry-heading"
        >
          <div className="workbench-top">
            <div>
              <div className="card-kicker">
                <Boxes size={16} aria-hidden="true" />
                <span>{dictionary.home.registryEyebrow}</span>
              </div>
              <h2 id="registry-heading">{dictionary.home.registryTitle}</h2>
            </div>
            <div className="workbench-actions">
              <form
                action="/marketplace"
                className="search-box"
                method="get"
                role="search"
              >
                {locale === "zh" ? (
                  <input name="lang" type="hidden" value="zh" />
                ) : null}
                <Search size={17} aria-hidden="true" />
                <input
                  aria-label={dictionary.home.searchPlaceholder}
                  name="q"
                  placeholder={dictionary.home.searchPlaceholder}
                />
                <button
                  aria-label={
                    locale === "zh" ? "搜索市场" : "Search marketplace"
                  }
                  className="search-box__submit"
                  title={locale === "zh" ? "搜索市场" : "Search marketplace"}
                  type="submit"
                >
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </form>
              <a
                className="secondary-button"
                href={localizedHref("/publish", locale)}
              >
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

          <SkillTable
            apiUrl={apiUrl}
            labels={dictionary.skillTable}
            locale={locale}
            skills={skills}
          />
        </section>

        <OperatingEvidenceChain
          focus="platform"
          locale={locale}
          stats={[
            {
              label: dictionary.metrics.publishedSkills,
              value: String(publicStats.publicSkills),
            },
            {
              label: dictionary.metrics.verified,
              tone: "good",
              value: String(publicStats.verifiedSkills),
            },
            {
              label: dictionary.metrics.callableSkills,
              value: String(publicStats.callableSkills),
            },
            {
              label: dictionary.metrics.avgLatency,
              tone: "neutral",
              value: formatPublicPlatformLatency(publicStats.avgLatencyMs),
            },
          ]}
        />

        <ConsoleAccessPanel locale={locale} session={session} />

        <JourneyRailDeck locale={locale} publicSurface />

        <section
          className="operating-console reveal-item reveal-item--late"
          aria-labelledby="operating-heading"
        >
          <div className="operating-console__intro">
            <div className="operating-console__headline">
              <div className="card-kicker">
                <Repeat2 size={16} aria-hidden="true" />
                <span>{operating.eyebrow}</span>
              </div>
              <h2 id="operating-heading">{operating.title}</h2>
            </div>
            <p>{operating.body}</p>
          </div>

          <div className="operating-flow-rail" aria-label={operating.eyebrow}>
            {operating.flow.map((step, index) => (
              <div className="operating-flow-node" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="operating-loop-grid">
            {operating.loops.map((loop, index) => {
              const Icon = operatingIcons[index];

              return (
                <article className="operating-loop-card" key={loop.label}>
                  <div className="operating-loop-card__head">
                    <div
                      className="operating-loop-card__icon"
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong>{loop.label}</strong>
                      <span>{loop.metric}</span>
                    </div>
                  </div>
                  <p>{loop.body}</p>
                  <div className="operating-loop-card__foot">
                    <span className="operating-loop-card__status">
                      {loop.status}
                    </span>
                    {loop.href ? (
                      <a href={localizedHref(loop.href, locale)}>
                        {loop.action}
                        <Rocket size={15} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="operating-loop-card__locked">
                        {loop.action}
                        <ShieldCheck size={15} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      <section
        className="proof-section reveal-scope"
        aria-labelledby="proof-heading"
      >
        <div className="proof-section__copy reveal-item">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{proof.eyebrow}</span>
          </div>
          <h2 id="proof-heading">{proof.title}</h2>
          <p>{proof.body}</p>
          <div className="hero-actions">
            <a
              className="secondary-button secondary-button--large"
              href={localizedHref("/dashboard#dashboard-proof-chain", locale)}
            >
              <Gauge size={18} aria-hidden="true" />
              <span>{proof.action}</span>
            </a>
            <a
              className="ghost-button"
              href={localizedHref("/dashboard#workspace-command-center", locale)}
            >
              <KeyRound size={18} aria-hidden="true" />
              <span>{proof.commandAction}</span>
            </a>
          </div>
        </div>

        <div className="proof-board">
          {proof.items.map(([title, description], index) => {
            const Icon = proofIcons[index];

            return (
              <article
                className="proof-card lift-card reveal-item reveal-item--delay"
                key={title}
              >
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

      <section
        className="platform-section"
        id="protocol"
        aria-labelledby="protocol-heading"
      >
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
            <span>{locale === "zh" ? "示例，非实时端点" : "example, not live endpoint"}</span>
          </div>
          <pre>
            <code>{manifestSnippet}</code>
          </pre>
        </div>
      </section>

      <section
        className="trust-section"
        id="trust"
        aria-labelledby="trust-heading"
      >
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
          <a href={localizedHref("/docs#mcp", locale)}>
            {dictionary.common.mcp}
          </a>
          <a href={localizedHref("/publish", locale)}>
            {dictionary.common.publish}
          </a>
          <a href={localizedHref("/terms", locale)}>
            {locale === "zh" ? "\u6761\u6b3e" : "Terms"}
          </a>
          <a href={localizedHref("/support", locale)}>
            {locale === "zh" ? "\u652f\u6301" : "Support"}
          </a>
          <a href={localizedHref("/report", locale)}>
            {locale === "zh" ? "\u62a5\u544a\u95ee\u9898" : "Report issue"}
          </a>
          <a href={localizedHref("/security", locale)}>
            {locale === "zh" ? "\u5b89\u5168" : "Security"}
          </a>
          <a href={localizedHref("/status", locale)}>
            {locale === "zh" ? "\u72b6\u6001" : "Status"}
          </a>
          <a href="https://github.com/guangzibodong/skillhub">
            {dictionary.common.github}
          </a>
        </div>
      </footer>
    </main>
  );
}
