import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  LockKeyhole,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Operator Console");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ConsoleRow = Record<string, string>;

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      ["Operator Console", "#operator-overview"],
      ["Activity Overview", "#runtime-logs"],
    ],
  },
  {
    label: "REGISTRY",
    items: [
      ["Skills", "/marketplace"],
      ["Review Queue", "#review-queue"],
      ["Skill Contracts", "#skill-contract"],
      ["Publishers", "#publisher-review"],
    ],
  },
  {
    label: "ACCESS & RUNTIME",
    items: [
      ["Projects", "/developer"],
      ["Project Keys", "#project-keys"],
      ["Runtime Logs", "#runtime-logs"],
      ["MCP Endpoints", "/mcp"],
      ["REST Endpoints", "/api"],
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      ["Permissions & Scopes", "#permission-risk"],
      ["Security Reviews", "#security-reviews"],
      ["Audit Trails", "#audit-snapshot"],
    ],
  },
  {
    label: "MARKETPLACE",
    items: [
      ["Marketplace Preview", "#marketplace-prelaunch"],
      ["Publisher Review", "#publisher-review"],
      ["Finance (Prelaunch)", "#finance-prelaunch"],
    ],
  },
  {
    label: "SYSTEM",
    items: [
      ["Settings", "#operator-settings"],
      ["System Health", "#system-health"],
    ],
  },
] as const;

const statusStrip = [
  {
    label: "DISCOVERY",
    state: "Live",
    title: "Public Registry",
    detail: "Available",
    tone: "green",
  },
  {
    label: "INSPECTION",
    state: "Live",
    title: "Manifest Inspection",
    detail: "Available",
    tone: "green",
  },
  {
    label: "RUNTIME",
    state: "Key Gated",
    title: "Runtime Invocation",
    detail: "Requires Project Key",
    tone: "mint",
  },
  {
    label: "MARKETPLACE",
    state: "Prelaunch",
    title: "Paid Marketplace",
    detail: "Prelaunch",
    tone: "muted",
  },
] as const;

const reviewQueue = [
  {
    skill: "Web Search Pro",
    publisher: "SearchCorp",
    protocol: "REST",
    submitted: "2h ago",
    risk: "Medium",
    manifest: "Valid",
    status: "Pending Review",
    statusShort: "Review",
  },
  {
    skill: "Code Executor",
    publisher: "DevTools Inc.",
    protocol: "MCP",
    submitted: "4h ago",
    risk: "High",
    manifest: "Valid",
    status: "Pending Security",
    statusShort: "Security",
  },
  {
    skill: "Data Extractor",
    publisher: "DataFlow",
    protocol: "REST",
    submitted: "6h ago",
    risk: "Medium",
    manifest: "Valid",
    status: "Pending Review",
    statusShort: "Review",
  },
  {
    skill: "Image Generator",
    publisher: "ModelHub",
    protocol: "MCP",
    submitted: "8h ago",
    risk: "High",
    manifest: "Invalid",
    status: "Pending Permissions",
    statusShort: "Permissions",
  },
  {
    skill: "Email Verifier",
    publisher: "VerifyPro",
    protocol: "REST",
    submitted: "12h ago",
    risk: "Low",
    manifest: "Valid",
    status: "Pending Review",
    statusShort: "Review",
  },
] satisfies ConsoleRow[];

const projectKeys = [
  { project: "Agent Studio", environment: "Production", keys: "3", status: "Active", lastUsed: "2m ago" },
  { project: "Research Assistant", environment: "Production", keys: "2", status: "Active", lastUsed: "15m ago" },
  { project: "Data Pipeline", environment: "Staging", keys: "1", status: "Active", lastUsed: "1h ago" },
  { project: "Internal Tools", environment: "Production", keys: "4", status: "Active", lastUsed: "2h ago" },
  { project: "Beta Playground", environment: "Development", keys: "1", status: "Revoked", lastUsed: "-" },
] satisfies ConsoleRow[];

const runtimeLogs = [
  { time: "15:21:33", method: "POST", skill: "Web Search Pro", project: "Agent Studio", status: "200", latency: "1.23s" },
  { time: "15:21:28", method: "GET", skill: "Code Executor", project: "Internal Tools", status: "200", latency: "512ms" },
  { time: "15:21:18", method: "POST", skill: "Data Extractor", project: "Data Pipeline", status: "200", latency: "1.08s" },
  { time: "15:21:07", method: "POST", skill: "Image Generator", project: "Beta Playground", status: "200", latency: "2.34s" },
  { time: "15:20:59", method: "POST", skill: "Web Search Pro", project: "Research Assistant", status: "429", latency: "-" },
] satisfies ConsoleRow[];

const permissionRisk = [
  { permission: "web.search", skills: "23", risk: "Medium", usage: "1,256" },
  { permission: "web.fetch", skills: "18", risk: "Medium", usage: "842" },
  { permission: "code.execute", skills: "15", risk: "High", usage: "532" },
  { permission: "data.store", skills: "12", risk: "Low", usage: "298" },
  { permission: "browser.automation", skills: "9", risk: "High", usage: "173" },
] satisfies ConsoleRow[];

const publisherReview = [
  { publisher: "SearchCorp", submitted: "3", approved: "3", rejected: "0", status: "Verified" },
  { publisher: "DataFlow", submitted: "2", approved: "2", rejected: "0", status: "Verified" },
  { publisher: "ModelHub", submitted: "4", approved: "3", rejected: "1", status: "Under Review" },
  { publisher: "DevTools Inc.", submitted: "3", approved: "3", rejected: "0", status: "Verified" },
] satisfies ConsoleRow[];

const securityReviews = [
  { skill: "Code Executor", risk: "High", issues: "2", scan: "1h ago", status: "Requires Fix" },
  { skill: "Image Generator", risk: "High", issues: "1", scan: "2h ago", status: "Requires Fix" },
  { skill: "Web Search Pro", risk: "Medium", issues: "0", scan: "2h ago", status: "Passed" },
  { skill: "Data Extractor", risk: "Medium", issues: "1", scan: "3h ago", status: "In Review" },
  { skill: "Email Verifier", risk: "Low", issues: "0", scan: "12h ago", status: "Passed" },
] satisfies ConsoleRow[];

const marketplaceChecklist = [
  ["Publisher Onboarding", "Completed"],
  ["Skill Quality Standards", "Completed"],
  ["Security & Compliance", "In Progress"],
  ["Payment & Payout Setup", "Pending"],
  ["Launch Readiness Review", "Pending"],
] as const;

const financePreview = [
  ["Total Sales (Preview)", "$12,458"],
  ["Pending Payouts", "$8,932"],
  ["Eligible for Payout", "$3,526"],
  ["Total Publishers", "156"],
] as const;

const runtimePolicy = [
  ["Network access", "Allowed to api.browsercorp.ai"],
  ["Data handling", "No credential storage"],
  ["Data retention", "No persistent storage"],
  ["Rate limit", "60 requests / min"],
  ["Timeout", "30s"],
] as const;

const manifest = `{
  "name": "browser-research-pro",
  "version": "1.2.0",
  "description": "Advanced web research with real-time results, content extraction, and source attribution.",
  "runtime": {
    "type": "rest",
    "base_url": "https://api.browsercorp.ai/v1",
    "auth": {
      "type": "bearer"
    }
  },
  "permissions": [
    {
      "id": "web.search",
      "description": "Perform web searches and retrieve results",
      "risk": "medium",
      "required": true
    },
    {
      "id": "web.fetch",
      "description": "Fetch and extract content from web pages",
      "risk": "medium",
      "required": true
    },
    {
      "id": "data.store",
      "description": "Store extracted data for session context",
      "risk": "low",
      "required": false
    }
  ],
  "limits": {
    "rate_limit": "60/min",
    "timeout": "30s"
  },
  "input_schema": {
    "$ref": "./schemas/input"
  },
  "output_schema": {
    "$ref": "./schemas/output"
  },
  "auditable": true
}`;

const sampleApiRequest = `curl -X POST "https://api.browsercorp.ai/v1/run" \\
  -H "Authorization: Bearer $SKILLHUB_RUNTIME_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "best AI agent frameworks",
    "limit": 5,
    "include_content": true
  }'`;

export default async function AdminPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);

  async function signOut() {
    "use server";
    await signOutAction(locale);
  }

  return (
    <main className="operator-console" id="operator-overview">
      <aside className="operator-sidebar" aria-label="Operator navigation">
        <a className="operator-brand" href={localizedHref("/", locale)} aria-label="SkillHub home">
          <span className="operator-brand__mark">S</span>
          <span>SkillHub</span>
        </a>

        <nav className="operator-nav">
          {navGroups.map((group) => (
            <section className="operator-nav__group" key={group.label}>
              <h2>{group.label}</h2>
              {group.items.map(([label, href], itemIndex) => (
                <a
                  className={itemIndex === 0 && group.label === "OVERVIEW" ? "operator-nav__item is-active" : "operator-nav__item"}
                  href={href.startsWith("/") ? localizedHref(href, locale) : href}
                  key={label}
                >
                  <span className="operator-nav__dot" aria-hidden="true" />
                  {label}
                  {label === "Review Queue" ? <b>18</b> : null}
                </a>
              ))}
            </section>
          ))}
        </nav>

        <section className="operator-docs-card" aria-labelledby="operator-docs-title">
          <BookOpen size={16} aria-hidden="true" />
          <h2 id="operator-docs-title">SkillHub Docs</h2>
          <p>Developer docs and API reference</p>
          <a href={localizedHref("/docs", locale)}>View Documentation <span aria-hidden="true">→</span></a>
        </section>
        <p className="operator-system-line"><span /> All systems operational</p>
      </aside>

      <section className="operator-main" aria-labelledby="operator-title">
        <header className="operator-topbar">
          <h1 id="operator-title">Operator Console</h1>
          <label className="operator-search">
            <Search size={15} aria-hidden="true" />
            <span className="visually-hidden">Search</span>
            <input placeholder="Search skills, manifests, projects, runtime logs..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className="operator-topbar__actions">
            <a className="operator-launch-pill" href={localizedHref("/status", locale)}>Launch Preview</a>
            <button className="operator-env-button" type="button">
              <span /> Production <ChevronDown size={14} aria-hidden="true" />
            </button>
            <a className="operator-icon-button" href="#runtime-logs" aria-label="Notifications">
              <Bell size={16} aria-hidden="true" />
              <b>3</b>
            </a>
            <a className="operator-icon-button" href={localizedHref("/docs", locale)} aria-label="Help">
              <CircleHelp size={16} aria-hidden="true" />
            </a>
            <button className="operator-user-menu" type="button">
              <span>A</span>
              <strong>Admin</strong>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <form action={signOut}>
              <button className="operator-exit-button" type="submit">
                <LogOut size={15} aria-hidden="true" />
                Exit
              </button>
            </form>
          </div>
        </header>

        <section className="operator-status-strip" aria-label="Launch preview status">
          {statusStrip.map((item) => (
            <article className={`operator-status-item operator-status-item--${item.tone}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.state}</strong>
              <p>{item.title}</p>
              <em>{item.detail}</em>
            </article>
          ))}
        </section>

        <section className="operator-core-grid">
          <ReviewQueue />
          <SkillContractInspector locale={locale} />
          <InvocationGate locale={locale} />
        </section>

        <section className="operator-secondary-grid">
          <ProjectKeys />
          <RuntimeLogs />
          <PermissionRisk />
        </section>

        <section className="operator-tertiary-grid">
          <PublisherReview />
          <SecurityReviews />
          <MarketplacePrelaunch />
          <FinancePrelaunch />
        </section>
      </section>
    </main>
  );
}

function ReviewQueue() {
  return (
    <OperatorPanel
      action={<a href="#review-queue">View all <span aria-hidden="true">→</span></a>}
      className="operator-panel--queue"
      id="review-queue"
      title={<span>Review Queue <b className="operator-count-badge">18</b></span>}
    >
      <ResponsiveTable
        columns={["Skill", "Publisher", "Protocol", "Submitted", "Risk", "Manifest", "Status"]}
        rows={reviewQueue}
        rowKeys={["skill", "publisher", "protocol", "submitted", "risk", "manifest", "statusShort"]}
      />
      <a className="operator-section-link" href="#review-queue">Go to Review Queue <span aria-hidden="true">→</span></a>
    </OperatorPanel>
  );
}

function SkillContractInspector({ locale }: { locale: Locale }) {
  return (
    <OperatorPanel
      action={
        <div className="operator-inspector-actions">
          <span>browser-research-pro v1.2.0</span>
          <b>Schema Valid</b>
        </div>
      }
      className="operator-panel--inspector"
      id="skill-contract"
      title="Skill Contract Inspector"
    >
      <div className="operator-tabs" role="tablist" aria-label="Skill contract sections">
        {["Manifest", "Permissions 8", "Policy", "Versions 4", "Tests 12"].map((tab, index) => (
          <button aria-selected={index === 0} className={index === 0 ? "is-active" : ""} role="tab" type="button" key={tab}>
            {tab}
          </button>
        ))}
      </div>
      <CodeBlock code={manifest} language="json" />
      <div className="operator-policy-preview">
        <div>
          <h3>Runtime Policy Preview</h3>
          <dl>
            {runtimePolicy.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <a className="operator-ghost-button" href={localizedHref("/skills/browser-research-pro", locale)}>
          View full manifest <span aria-hidden="true">→</span>
        </a>
      </div>
    </OperatorPanel>
  );
}

function InvocationGate({ locale }: { locale: Locale }) {
  return (
    <OperatorPanel
      action={<button className="operator-select-button" type="button">Last 24h <ChevronDown size={13} aria-hidden="true" /></button>}
      id="invocation-gate"
      title="Invocation Gate"
    >
      <section className="operator-gate-callout">
        <LockKeyhole size={18} aria-hidden="true" />
        <div>
          <h3>PROJECT KEY REQUIRED</h3>
          <p>This skill requires a valid project runtime key to invoke.</p>
          <a href={localizedHref("/project-keys", locale)}>View project key requirements <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <div className="operator-policy-row">
        {[
          ["Policy Check", "Passed"],
          ["Rate Limit", "60 / min"],
          ["Auth", "Bearer"],
          ["Logging", "Enabled"],
        ].map(([label, value]) => (
          <div key={label}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="operator-code-head">
        <span>Sample API Request</span>
        <b>REST</b>
        <em>curl</em>
      </div>
      <CodeBlock code={sampleApiRequest} language="bash" compact />
      <div className="operator-latest-response">
        <span>Latest Response</span>
        <b>200 OK</b>
        <em>1.23s</em>
      </div>
      <section className="operator-audit-snapshot" id="audit-snapshot">
        <h3>Audit Snapshot</h3>
        {[
          ["Endpoint", "POST /run"],
          ["Invocations", "1,256"],
          ["Success Rate", "98.7%"],
          ["P50 Latency", "1.23s"],
          ["Errors", "1.3%"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong className={label === "Errors" ? "is-danger" : ""}>{value}</strong>
          </div>
        ))}
      </section>
    </OperatorPanel>
  );
}

function ProjectKeys() {
  return (
    <OperatorPanel
      action={<a href="#project-keys">View all <span aria-hidden="true">→</span></a>}
      id="project-keys"
      title="Project Keys"
    >
      <ResponsiveTable
        columns={["Project", "Environment", "Keys", "Status", "Last Used"]}
        rows={projectKeys}
        rowKeys={["project", "environment", "keys", "status", "lastUsed"]}
      />
      <a className="operator-section-link" href="#project-keys">Go to Project Keys <span aria-hidden="true">→</span></a>
    </OperatorPanel>
  );
}

function RuntimeLogs() {
  return (
    <OperatorPanel
      action={
        <span className="operator-live-action"><i /> Live <a href="#runtime-logs">View all <span aria-hidden="true">→</span></a></span>
      }
      id="runtime-logs"
      title="Runtime Logs"
    >
      <ResponsiveTable
        columns={["Time", "Method", "Skill", "Project", "Status", "Latency"]}
        rows={runtimeLogs}
        rowKeys={["time", "method", "skill", "project", "status", "latency"]}
      />
      <a className="operator-section-link" href="#runtime-logs">Go to Runtime Logs <span aria-hidden="true">→</span></a>
    </OperatorPanel>
  );
}

function PermissionRisk() {
  return (
    <OperatorPanel
      action={<a href="#permission-risk">View all <span aria-hidden="true">→</span></a>}
      id="permission-risk"
      title="Permission Risk Overview"
    >
      <ResponsiveTable
        columns={["Permission", "Skills", "Risk Level", "Usage (24h)"]}
        rows={permissionRisk}
        rowKeys={["permission", "skills", "risk", "usage"]}
      />
    </OperatorPanel>
  );
}

function PublisherReview() {
  return (
    <OperatorPanel
      action={<a href="#publisher-review">View all <span aria-hidden="true">→</span></a>}
      id="publisher-review"
      title="Publisher Review"
    >
      <ResponsiveTable
        columns={["Publisher", "Submitted", "Approved", "Rejected", "Status"]}
        rows={publisherReview}
        rowKeys={["publisher", "submitted", "approved", "rejected", "status"]}
      />
    </OperatorPanel>
  );
}

function SecurityReviews() {
  return (
    <OperatorPanel
      action={<a href="#security-reviews">View all <span aria-hidden="true">→</span></a>}
      id="security-reviews"
      title="Security Reviews"
    >
      <ResponsiveTable
        columns={["Skill", "Risk Level", "Issues", "Last Scan", "Status"]}
        rows={securityReviews}
        rowKeys={["skill", "risk", "issues", "scan", "status"]}
      />
    </OperatorPanel>
  );
}

function MarketplacePrelaunch() {
  return (
    <OperatorPanel
      action={<a href="#marketplace-prelaunch">View details <span aria-hidden="true">→</span></a>}
      id="marketplace-prelaunch"
      title="Marketplace Prelaunch"
    >
      <div className="operator-progress-head">
        <span>Prelaunch Progress</span>
        <strong>72%</strong>
      </div>
      <div className="operator-progress-bar"><span style={{ width: "72%" }} /></div>
      <ul className="operator-checklist">
        {marketplaceChecklist.map(([label, status]) => (
          <li key={label}>
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>{label}</span>
            <b className={statusClass(status)}>{status}</b>
          </li>
        ))}
      </ul>
    </OperatorPanel>
  );
}

function FinancePrelaunch() {
  return (
    <OperatorPanel
      action={<a href="#finance-prelaunch">View details <span aria-hidden="true">→</span></a>}
      id="finance-prelaunch"
      title="Finance (Prelaunch)"
    >
      <div className="operator-finance-list">
        {financePreview.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </OperatorPanel>
  );
}

function OperatorPanel({
  action,
  children,
  className = "",
  id,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id: string;
  title: ReactNode;
}) {
  return (
    <article className={`operator-panel ${className}`} id={id}>
      <header className="operator-panel__head">
        <h2>{title}</h2>
        {action ? <div className="operator-panel__action">{action}</div> : null}
      </header>
      {children}
    </article>
  );
}

function ResponsiveTable({
  columns,
  rows,
  rowKeys,
}: {
  columns: string[];
  rows: ConsoleRow[];
  rowKeys: string[];
}) {
  return (
    <div className="operator-table-wrap">
      <table className="operator-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKeys.map((key) => row[key]).join("-")}>
              {rowKeys.map((key) => (
                <td key={key} data-label={columns[rowKeys.indexOf(key)]}>
                  <TableValue field={key} value={row[key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableValue({ field, value }: { field: string; value: string }) {
  if (["risk", "manifest", "status"].includes(field)) {
    return <span className={`operator-badge ${statusClass(value)}`}>{value}</span>;
  }

  return <span>{value}</span>;
}

function CodeBlock({ code, compact = false, language }: { code: string; compact?: boolean; language: string }) {
  return (
    <pre className={`operator-code ${compact ? "operator-code--compact" : ""}`} aria-label={`${language} code sample`}>
      <code>
        {code.split("\n").map((line, index) => (
          <span className="operator-code__line" key={`${language}-${index}-${line.slice(0, 12)}`}>
            <span className="operator-code__number">{String(index + 1).padStart(2, "0")}</span>
            <span className={lineClass(line)}>{line}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}

function lineClass(line: string) {
  if (line.includes('"')) {
    return "operator-code__syntax operator-code__syntax--string";
  }

  if (line.trim().startsWith("curl") || line.trim().startsWith("-H") || line.trim().startsWith("-d")) {
    return "operator-code__syntax operator-code__syntax--command";
  }

  return "operator-code__syntax";
}

function statusClass(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("high") || normalized.includes("invalid") || normalized.includes("revoked") || normalized.includes("fix")) {
    return "is-danger";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("pending") ||
    normalized.includes("review") ||
    normalized.includes("progress")
  ) {
    return "is-warning";
  }

  if (
    normalized.includes("low") ||
    normalized.includes("valid") ||
    normalized.includes("active") ||
    normalized.includes("verified") ||
    normalized.includes("passed") ||
    normalized.includes("completed")
  ) {
    return "is-success";
  }

  return "is-muted";
}
