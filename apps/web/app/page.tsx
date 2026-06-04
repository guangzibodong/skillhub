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
  UploadCloud,
  Zap
} from "lucide-react";
import Link from "next/link";
import { SkillTable } from "@/components/skill-table";
import { getGatewayStats, getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Registry", href: "#registry" },
  { label: "Protocol", href: "#protocol" },
  { label: "Trust", href: "#trust" }
];

const statusSignals = [
  { label: "API", value: "online", icon: Activity },
  { label: "MCP", value: "/mcp", icon: Network },
  { label: "Schema", value: "v0.1", icon: Braces },
  { label: "Store", value: "Postgres", icon: Database }
];

const workflowCards = [
  {
    title: "Discover",
    description: "Agents search by task, tags, permission profile, and runtime contract.",
    icon: Radar
  },
  {
    title: "Validate",
    description: "Skill manifests declare inputs, outputs, runtime entrypoints, and access needs.",
    icon: FileJson
  },
  {
    title: "Execute",
    description: "The gateway exposes HTTP and MCP endpoints so agents can call skills safely.",
    icon: Zap
  }
];

const trustItems = [
  {
    title: "Permission aware",
    description: "Every package carries its network, browser, filesystem, and secret requirements.",
    icon: ShieldCheck
  },
  {
    title: "Versioned packages",
    description: "Skills are registered with immutable versions so agents can pin behavior.",
    icon: PackageCheck
  },
  {
    title: "Operator control",
    description: "Publishing is gated behind admin tokens while public discovery remains open.",
    icon: KeyRound
  }
];

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

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [skills, gatewayStats] = await Promise.all([getSkills(), getGatewayStats()]);
  const verifiedSkills = skills.filter((skill) => skill.verificationStatus === "verified").length;
  const publishedFromGateway = toNumber(getMetricValue(gatewayStats, "Published skills", "0"));
  const verifiedFromGateway = toNumber(getMetricValue(gatewayStats, "Verified", "0"));
  const publishedSkills = Math.max(publishedFromGateway, skills.length);
  const verifiedCount = Math.max(verifiedFromGateway, verifiedSkills);
  const visibleMetrics = [
    { label: "Published skills", value: String(publishedSkills) },
    { label: "Verified", value: String(verifiedCount) },
    { label: "API calls", value: getMetricValue(gatewayStats, "API calls", "0") },
    { label: "Avg latency", value: getMetricValue(gatewayStats, "Avg latency", "--") }
  ];
  const verifiedShare =
    publishedSkills === 0 ? "0%" : `${Math.round((verifiedCount / Math.max(publishedSkills, 1)) * 100)}%`;

  return (
    <main className="product-shell">
      <header className="site-header">
        <Link className="brand brand--link" href="/" aria-label="SkillHub home">
          <div className="brand__mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <strong>SkillHub</strong>
            <small>useskillhub.com</small>
          </div>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
          <Link href="/publish">Publish</Link>
        </nav>

        <div className="site-actions">
          <a className="ghost-button" href="https://api.useskillhub.com/health">
            <Gauge size={17} aria-hidden="true" />
            <span>API health</span>
          </a>
          <Link className="primary-button" href="/publish">
            <UploadCloud size={17} aria-hidden="true" />
            <span>Publish</span>
          </Link>
        </div>
      </header>

      <section className="command-screen" aria-labelledby="home-heading">
        <div className="hero-copy">
          <div className="eyebrow">
            <Radar size={16} aria-hidden="true" />
            <span>Agent skill infrastructure</span>
          </div>
          <h1 id="home-heading">Universal skills agents can discover, trust, and run.</h1>
          <p>
            SkillHub is the registry and gateway layer for reusable AI-agent capabilities: one manifest format,
            searchable packages, permission profiles, and agent-ready APIs.
          </p>
          <div className="hero-actions">
            <Link className="primary-button primary-button--large" href="/publish">
              <Plus size={18} aria-hidden="true" />
              <span>Publish a skill</span>
            </Link>
            <a className="secondary-button secondary-button--large" href="#protocol">
              <Code2 size={18} aria-hidden="true" />
              <span>View contract</span>
            </a>
          </div>
        </div>

        <aside className="gateway-card" aria-label="Live gateway">
          <div className="card-kicker">
            <ServerCog size={16} aria-hidden="true" />
            <span>Gateway</span>
          </div>
          <div className="gateway-card__head">
            <div>
              <h2>Production edge</h2>
              <p>api.useskillhub.com</p>
            </div>
            <span className="live-dot">
              <span />
              Live
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

        <section className="registry-workbench" id="registry" aria-labelledby="registry-heading">
          <div className="workbench-top">
            <div>
              <div className="card-kicker">
                <Boxes size={16} aria-hidden="true" />
                <span>Registry</span>
              </div>
              <h2 id="registry-heading">Agent Skill Registry</h2>
            </div>
            <div className="workbench-actions">
              <div className="search-box">
                <Search size={17} aria-hidden="true" />
                <input aria-label="Search skills" placeholder="Search skills, tags, runtimes" />
              </div>
              <Link className="secondary-button" href="/publish">
                <Plus size={17} aria-hidden="true" />
                <span>New skill</span>
              </Link>
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
              <span>Verified share</span>
              <strong>{verifiedShare}</strong>
            </div>
          </div>

          <SkillTable apiUrl={apiUrl} skills={skills} />
        </section>
      </section>

      <section className="platform-section" id="protocol" aria-labelledby="protocol-heading">
        <div className="section-heading">
          <div className="eyebrow">
            <Terminal size={16} aria-hidden="true" />
            <span>Protocol</span>
          </div>
          <h2 id="protocol-heading">A skill contract agents can read before they act.</h2>
          <p>
            A SkillHub package is not just a prompt. It is a typed, versioned capability with declared runtime,
            schemas, and permissions.
          </p>
        </div>

        <div className="workflow-grid">
          {workflowCards.map((item) => (
            <article className="workflow-card" key={item.title}>
              <div className="workflow-card__icon" aria-hidden="true">
                <item.icon size={18} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contract-section" aria-labelledby="manifest-heading">
        <div className="manifest-copy">
          <div className="card-kicker">
            <FileJson size={16} aria-hidden="true" />
            <span>skillhub.json</span>
          </div>
          <h2 id="manifest-heading">One manifest for humans, agents, and runtime gateways.</h2>
          <p>
            The registry accepts a compact JSON manifest. The same contract powers search results, trust review,
            SDK generation, and MCP tool discovery.
          </p>

          <div className="contract-list">
            {[
              "Typed input and output schemas",
              "HTTP, MCP, or local runtime declarations",
              "Explicit network, browser, filesystem, and secret access",
              "Versioned identity for repeatable agent behavior"
            ].map((item) => (
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
            <span>Trust layer</span>
          </div>
          <h2 id="trust-heading">Designed for agents that need guardrails.</h2>
        </div>

        <div className="trust-grid">
          {trustItems.map((item) => (
            <article className="trust-card" key={item.title}>
              <item.icon size={20} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <div>
          <strong>SkillHub</strong>
          <span>Universal skills for AI agents.</span>
        </div>
        <div className="footer-links">
          <a href="https://api.useskillhub.com/health">Health</a>
          <a href="https://api.useskillhub.com/mcp">MCP</a>
          <Link href="/publish">Publish</Link>
          <a href="https://github.com/guangzibodong/skillhub">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
