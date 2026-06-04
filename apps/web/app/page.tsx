import {
  Activity,
  Boxes,
  Braces,
  Database,
  KeyRound,
  Network,
  Plus,
  Search,
  ShieldCheck,
  UploadCloud
} from "lucide-react";
import { SkillTable } from "@/components/skill-table";
import { getGatewayStats, getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Registry", icon: Boxes },
  { label: "Gateway", icon: Network },
  { label: "API keys", icon: KeyRound },
  { label: "Schemas", icon: Braces },
  { label: "Audit", icon: Activity }
];

export default async function Home() {
  const [skills, gatewayStats] = await Promise.all([getSkills(), getGatewayStats()]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <strong>SkillHub</strong>
            <small>useskillhub.com</small>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button className={item.label === "Registry" ? "nav__item nav__item--active" : "nav__item"} key={item.label}>
              <item.icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search skills" placeholder="Search skills, tags, runtimes" />
          </div>
          <div className="topbar__actions">
            <button className="icon-button" aria-label="Verify skills">
              <ShieldCheck size={18} />
            </button>
            <button className="primary-button">
              <UploadCloud size={18} aria-hidden="true" />
              <span>Publish</span>
            </button>
          </div>
        </header>

        <div className="content-grid">
          <section className="registry-panel" aria-labelledby="registry-heading">
            <div className="panel-heading">
              <div>
                <h1 id="registry-heading">Agent Skill Registry</h1>
                <p>Universal skills for AI agents</p>
              </div>
              <button className="secondary-button">
                <Plus size={18} aria-hidden="true" />
                <span>New skill</span>
              </button>
            </div>
            <SkillTable skills={skills} />
          </section>

          <aside className="side-panel" aria-label="Gateway status">
            <section className="metric-grid">
              {gatewayStats.map((item) => (
                <div className="metric" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </section>

            <section className="runtime-panel">
              <div className="runtime-panel__icon" aria-hidden="true">
                <Database size={20} />
              </div>
              <h2>Runtime gateway</h2>
              <dl>
                <div>
                  <dt>HTTP API</dt>
                  <dd>api.useskillhub.com</dd>
                </div>
                <div>
                  <dt>MCP endpoint</dt>
                  <dd>/mcp</dd>
                </div>
                <div>
                  <dt>Package store</dt>
                  <dd>Cloudflare R2</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
