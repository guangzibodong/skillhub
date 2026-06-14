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
import { AdminAuditLogPanel } from "@/components/admin-audit-log-panel";
import { AdminIdentityDirectory } from "@/components/admin-identity-directory";
import { AdminLaunchReadinessPanel } from "@/components/admin-launch-readiness-panel";
import { AdminPayoutManager } from "@/components/admin-payout-manager";
import { AdminReviewManager } from "@/components/admin-review-manager";
import { signOutAction } from "@/lib/auth-actions";
import { getWorkspaceSession, type SessionSubject } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, localizedHrefWithReturnTo, type Locale } from "@/lib/i18n";
import {
  getAdminAuditLogs,
  getAdminIdentityDirectory,
  getAdminLaunchReadiness,
  getAdminPayouts,
  getAdminReviews,
} from "@/lib/ops-data";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Operator Console");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ConsoleRow = Record<string, string>;

type BilingualText = {
  en: string;
  zh: string;
};

type NavGroup = {
  label: BilingualText;
  items: {
    badge?: string;
    href: string;
    label: BilingualText;
  }[];
};

type StatusStripItem = {
  detail: BilingualText;
  label: BilingualText;
  state: BilingualText;
  title: BilingualText;
  tone: string;
};

const operatorRoles = new Set(["admin", "finance", "reviewer", "support", "super_admin"]);

const text = (zh: string, en: string): BilingualText => ({ en, zh });

const navGroups = [
  {
    label: text("总览", "OVERVIEW"),
    items: [
      { label: text("运营控制台", "Operator Console"), href: "#operator-overview" },
      { label: text("活动总览", "Activity Overview"), href: "#runtime-logs" },
    ],
  },
  {
    label: text("注册表", "REGISTRY"),
    items: [
      { label: text("技能市场", "Skills"), href: "/marketplace" },
      { label: text("审核队列", "Review Queue"), href: "#review-queue", badge: "18" },
      { label: text("技能合约", "Skill Contracts"), href: "#skill-contract" },
      { label: text("发布者", "Publishers"), href: "#publisher-review" },
    ],
  },
  {
    label: text("访问与运行", "ACCESS & RUNTIME"),
    items: [
      { label: text("项目", "Projects"), href: "/developer" },
      { label: text("项目密钥", "Project Keys"), href: "#project-keys" },
      { label: text("运行日志", "Runtime Logs"), href: "#runtime-logs" },
      { label: text("MCP 端点", "MCP Endpoints"), href: "/mcp" },
      { label: text("REST 端点", "REST Endpoints"), href: "/api" },
    ],
  },
  {
    label: text("治理", "GOVERNANCE"),
    items: [
      { label: text("权限与范围", "Permissions & Scopes"), href: "#permission-risk" },
      { label: text("安全审核", "Security Reviews"), href: "#security-reviews" },
      { label: text("审计追踪", "Audit Trails"), href: "#audit-snapshot" },
    ],
  },
  {
    label: text("市场", "MARKETPLACE"),
    items: [
      { label: text("市场预览", "Marketplace Preview"), href: "#marketplace-prelaunch" },
      { label: text("发布者审核", "Publisher Review"), href: "#publisher-review" },
      { label: text("财务预发布", "Finance Prelaunch"), href: "#finance-prelaunch" },
    ],
  },
  {
    label: text("系统", "SYSTEM"),
    items: [
      { label: text("设置", "Settings"), href: "#operator-settings" },
      { label: text("系统健康", "System Health"), href: "#system-health" },
    ],
  },
] satisfies NavGroup[];

const statusStrip = [
  {
    label: text("发现", "DISCOVERY"),
    state: text("已上线", "Live"),
    title: text("公开注册表", "Public Registry"),
    detail: text("可用", "Available"),
    tone: "green",
  },
  {
    label: text("检查", "INSPECTION"),
    state: text("已上线", "Live"),
    title: text("Manifest 检查", "Manifest Inspection"),
    detail: text("可用", "Available"),
    tone: "green",
  },
  {
    label: text("运行时", "RUNTIME"),
    state: text("密钥受控", "Key Gated"),
    title: text("运行调用", "Runtime Invocation"),
    detail: text("需要项目密钥", "Requires Project Key"),
    tone: "mint",
  },
  {
    label: text("市场", "MARKETPLACE"),
    state: text("预发布", "Prelaunch"),
    title: text("付费市场", "Paid Marketplace"),
    detail: text("预发布", "Prelaunch"),
    tone: "muted",
  },
] satisfies StatusStripItem[];

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
  [text("发布者入驻", "Publisher Onboarding"), "Completed"],
  [text("技能质量标准", "Skill Quality Standards"), "Completed"],
  [text("安全与合规", "Security & Compliance"), "In Progress"],
  [text("支付与结算配置", "Payment & Payout Setup"), "Pending"],
  [text("上线就绪复核", "Launch Readiness Review"), "Pending"],
] as const;

const financePreview = [
  [text("总销售额（预览）", "Total Sales Preview"), "$12,458"],
  [text("待结算金额", "Pending Payouts"), "$8,932"],
  [text("可结算金额", "Eligible for Payout"), "$3,526"],
  [text("发布者总数", "Total Publishers"), "156"],
] as const;

const runtimePolicy = [
  [text("网络访问", "Network access"), text("允许访问 api.browsercorp.ai", "Allowed to api.browsercorp.ai")],
  [text("数据处理", "Data handling"), text("不存储凭据", "No credential storage")],
  [text("数据保留", "Data retention"), text("不做持久化存储", "No persistent storage")],
  [text("速率限制", "Rate limit"), text("每分钟 60 次请求", "60 requests / min")],
  [text("超时", "Timeout"), text("30 秒", "30s")],
] as const;

const actionLabels = {
  viewAll: text("查看全部", "View all"),
  viewDetails: text("查看详情", "View details"),
  viewDocumentation: text("查看文档", "View Documentation"),
  viewFullManifest: text("查看完整 Manifest", "View full manifest"),
  viewProjectKeyRequirements: text("查看项目密钥要求", "View project key requirements"),
} as const;

const tableColumns = {
  audit: [
    text("端点", "Endpoint"),
    text("调用量", "Invocations"),
    text("成功率", "Success Rate"),
    text("P50 延迟", "P50 Latency"),
    text("错误率", "Errors"),
  ],
  permissionRisk: [text("权限", "Permission"), text("技能数", "Skills"), text("风险等级", "Risk Level"), text("24h 用量", "Usage 24h")],
  projectKeys: [text("项目", "Project"), text("环境", "Environment"), text("密钥", "Keys"), text("状态", "Status"), text("最近使用", "Last Used")],
  publisherReview: [text("发布者", "Publisher"), text("已提交", "Submitted"), text("已通过", "Approved"), text("已拒绝", "Rejected"), text("状态", "Status")],
  reviewQueue: [text("技能", "Skill"), text("发布者", "Publisher"), text("协议", "Protocol"), text("提交时间", "Submitted"), text("风险", "Risk"), text("Manifest", "Manifest"), text("状态", "Status")],
  runtimeLogs: [text("时间", "Time"), text("方法", "Method"), text("技能", "Skill"), text("项目", "Project"), text("状态", "Status"), text("延迟", "Latency")],
  securityReviews: [text("技能", "Skill"), text("风险等级", "Risk Level"), text("问题数", "Issues"), text("最近扫描", "Last Scan"), text("状态", "Status")],
} as const;

const statusTranslations: Record<string, BilingualText> = {
  Active: text("启用", "Active"),
  Completed: text("已完成", "Completed"),
  Enabled: text("已启用", "Enabled"),
  High: text("高", "High"),
  "In Progress": text("进行中", "In Progress"),
  "In Review": text("复核中", "In Review"),
  Invalid: text("无效", "Invalid"),
  Low: text("低", "Low"),
  Medium: text("中", "Medium"),
  Passed: text("已通过", "Passed"),
  Pending: text("待处理", "Pending"),
  Permissions: text("权限", "Permissions"),
  Review: text("审核", "Review"),
  Revoked: text("已撤销", "Revoked"),
  "Requires Fix": text("需修复", "Requires Fix"),
  Security: text("安全", "Security"),
  "Under Review": text("审核中", "Under Review"),
  Valid: text("有效", "Valid"),
  Verified: text("已认证", "Verified"),
};

const environmentTranslations: Record<string, BilingualText> = {
  Development: text("开发", "Development"),
  Production: text("生产", "Production"),
  Staging: text("预发", "Staging"),
};

function bilingual({ en, zh }: BilingualText, className = "operator-bi") {
  return (
    <span className={className}>
      <span>{zh}</span>
      <small>{en}</small>
    </span>
  );
}

function inlineBilingual({ en, zh }: BilingualText) {
  return (
    <>
      <span>{zh}</span>
      <small>{en}</small>
    </>
  );
}

function bilingualText({ en, zh }: BilingualText) {
  return `${zh} / ${en}`;
}

function linkWithArrow(label: BilingualText) {
  return (
    <>
      {inlineBilingual(label)}
      <span aria-hidden="true"> -&gt;</span>
    </>
  );
}

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
  const session = await getWorkspaceSession();
  const roleSet = subjectRoleSet(session.subject);
  const hasOperatorAccess = hasAnyRole(roleSet, operatorRoles);

  if (!session.subject) {
    return <AdminAccessGate kind="signed-out" locale={locale} />;
  }

  if (!hasOperatorAccess) {
    return <AdminAccessGate kind="forbidden" locale={locale} subject={session.subject} />;
  }

  const [
    launchReadiness,
    reviews,
    payouts,
    identityDirectory,
    auditLogs,
  ] = await Promise.all([
    getAdminLaunchReadiness(),
    getAdminReviews(),
    getAdminPayouts(),
    getAdminIdentityDirectory(),
    getAdminAuditLogs(),
  ]);
  const operatorName = session.subject.displayName ?? session.subject.email ?? "Admin";
  const operatorInitial = operatorName.slice(0, 1).toUpperCase();

  async function signOut() {
    "use server";
    await signOutAction(locale);
  }

  return (
    <main className="operator-console" id="operator-overview">
      <aside className="operator-sidebar" aria-label="运营导航 / Operator navigation">
        <a className="operator-brand" href={localizedHref("/", locale)} aria-label="SkillHub home">
          <span className="operator-brand__mark">S</span>
          <span>SkillHub</span>
        </a>

        <nav className="operator-nav">
          {navGroups.map((group) => (
            <section className="operator-nav__group" key={group.label.en}>
              <h2>{bilingual(group.label, "operator-nav__group-label")}</h2>
              {group.items.map((item, itemIndex) => (
                <a
                  className={itemIndex === 0 && group.label.en === "OVERVIEW" ? "operator-nav__item is-active" : "operator-nav__item"}
                  href={item.href.startsWith("/") ? localizedHref(item.href, locale) : item.href}
                  key={item.label.en}
                >
                  <span className="operator-nav__dot" aria-hidden="true" />
                  {bilingual(item.label, "operator-nav__label")}
                  {item.badge ? <b>{item.badge}</b> : null}
                </a>
              ))}
            </section>
          ))}
        </nav>

        <section className="operator-docs-card" aria-labelledby="operator-docs-title">
          <BookOpen size={16} aria-hidden="true" />
          <h2 id="operator-docs-title">{bilingual(text("SkillHub 文档", "SkillHub Docs"))}</h2>
          <p>{bilingual(text("开发者文档与 API 参考", "Developer docs and API reference"))}</p>
          <a href={localizedHref("/docs", locale)}>{linkWithArrow(actionLabels.viewDocumentation)}</a>
        </section>
        <p className="operator-system-line"><span /> {bilingual(text("所有系统运行正常", "All systems operational"))}</p>
      </aside>

      <section className="operator-main" aria-labelledby="operator-title">
        <header className="operator-topbar">
          <h1 id="operator-title">{bilingual(text("运营控制台", "Operator Console"))}</h1>
          <label className="operator-search">
            <Search size={15} aria-hidden="true" />
            <span className="visually-hidden">搜索 / Search</span>
            <input placeholder="搜索技能、Manifest、项目、运行日志..." />
            <kbd>Ctrl K</kbd>
          </label>
          <div className="operator-topbar__actions">
            <a className="operator-launch-pill" href={localizedHref("/status", locale)}>{inlineBilingual(text("上线预览", "Launch Preview"))}</a>
            <button className="operator-env-button" type="button">
              <span /> {inlineBilingual(text("生产", "Production"))} <ChevronDown size={14} aria-hidden="true" />
            </button>
            <a className="operator-icon-button" href="#runtime-logs" aria-label="通知 / Notifications">
              <Bell size={16} aria-hidden="true" />
              <b>3</b>
            </a>
            <a className="operator-icon-button" href={localizedHref("/docs", locale)} aria-label="帮助 / Help">
              <CircleHelp size={16} aria-hidden="true" />
            </a>
            <button className="operator-user-menu" type="button">
              <span>{operatorInitial}</span>
              <strong>{operatorName}</strong>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <form action={signOut}>
              <button className="operator-exit-button" type="submit">
                <LogOut size={15} aria-hidden="true" />
                {inlineBilingual(text("退出", "Exit"))}
              </button>
            </form>
          </div>
        </header>

        <section className="operator-status-strip" aria-label="上线预览状态 / Launch preview status">
          {statusStrip.map((item) => (
            <article className={`operator-status-item operator-status-item--${item.tone}`} key={item.label.en}>
              <span>{bilingual(item.label)}</span>
              <strong>{bilingual(item.state)}</strong>
              <p>{bilingual(item.title)}</p>
              <em>{bilingual(item.detail)}</em>
            </article>
          ))}
        </section>

        <section className="operator-admin-live" id="launch-readiness" aria-label="管理员运营队列 / Admin operations queue">
          <header className="operator-admin-live__head">
            <div>
              <span>{bilingual(text("管理员运营队列", "Admin operations queue"))}</span>
              <h2>{bilingual(text("上线就绪、审核、身份、打款和审计", "Launch readiness, review, identity, payout, and audit"))}</h2>
            </div>
            <a href={localizedHref("/docs#admin", locale)}>{linkWithArrow(text("查看运营文档", "View operator docs"))}</a>
          </header>

          <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />

          <div className="admin-operations-grid operator-admin-live__grid">
            <div className="operator-admin-live__stack">
              <AdminReviewManager locale={locale} reviews={reviews} />
              <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
            </div>
            <div className="operator-admin-live__stack">
              <AdminPayoutManager locale={locale} payouts={payouts} />
              <AdminAuditLogPanel locale={locale} logs={auditLogs} />
            </div>
          </div>
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

function AdminAccessGate({
  kind,
  locale,
  subject,
}: {
  kind: "forbidden" | "signed-out";
  locale: Locale;
  subject?: SessionSubject;
}) {
  const isSignedOut = kind === "signed-out";
  const copy =
    locale === "zh"
      ? {
          action: isSignedOut ? "去登录" : "查看账号角色",
          body: isSignedOut
            ? "后台包含审核、财务、打款、身份目录和审计操作。请先使用具备 reviewer、finance、support、admin 或 super_admin 权限的账号登录。"
            : `当前账号 ${subject?.email ?? subject?.displayName ?? ""} 没有运营权限。请切换到运营账号，或让超级管理员授予 reviewer、finance、support、admin 或 super_admin 角色。`,
          eyebrow: "后台准入",
          secondary: "返回首页",
          title: isSignedOut ? "需要先登录运营账号" : "需要运营权限",
        }
      : {
          action: isSignedOut ? "Sign in" : "Check account roles",
          body: isSignedOut
            ? "Admin operations include review, finance, payout, identity directory, and audit actions. Sign in with reviewer, finance, support, admin, or super_admin access first."
            : `The current account ${subject?.email ?? subject?.displayName ?? ""} does not have operator access. Switch accounts or ask a super admin to grant reviewer, finance, support, admin, or super_admin access.`,
          eyebrow: "Admin access",
          secondary: "Back home",
          title: isSignedOut ? "Operator sign-in required" : "Operator role required",
        };
  const actionHref = isSignedOut
    ? localizedHrefWithReturnTo("/login", locale, "/admin")
    : localizedHref("/account", locale);

  return (
    <main className="product-shell admin-access-gate">
      <section className="workspace-locked-panel">
        <article className="ops-panel workspace-locked-panel__card">
          <div className="workspace-locked-panel__main">
            <div className="card-kicker">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <a className="primary-button" href={actionHref}>
              <span>{copy.action}</span>
              <ShieldCheck size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="workspace-locked-panel__actions" aria-label={copy.eyebrow}>
            <a className="workspace-locked-panel__action" href={localizedHref("/", locale)}>
              <span>01</span>
              <strong>{copy.secondary}</strong>
              <small>SkillHub</small>
            </a>
            <a className="workspace-locked-panel__action" href={localizedHref("/docs", locale)}>
              <span>02</span>
              <strong>{locale === "zh" ? "查看文档" : "Read docs"}</strong>
              <small>{locale === "zh" ? "了解运营权限和审核流程" : "Review operator roles and review flows"}</small>
            </a>
            <a className="workspace-locked-panel__action" href={localizedHref("/status", locale)}>
              <span>03</span>
              <strong>{locale === "zh" ? "查看状态" : "View status"}</strong>
              <small>{locale === "zh" ? "确认公开服务状态" : "Confirm public service status"}</small>
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}

function subjectRoleSet(subject: SessionSubject | null | undefined) {
  return new Set([subject?.platformRole, ...(subject?.roles ?? [])].filter((role): role is string => Boolean(role)));
}

function hasAnyRole(roles: Set<string>, allowedRoles: Set<string>) {
  return Array.from(allowedRoles).some((role) => roles.has(role));
}

function ReviewQueue() {
  return (
    <OperatorPanel
      action={<a href="#review-queue">{linkWithArrow(actionLabels.viewAll)}</a>}
      className="operator-panel--queue"
      id="review-queue"
      title={<span>{bilingual(text("审核队列", "Review Queue"))} <b className="operator-count-badge">18</b></span>}
    >
      <ResponsiveTable
        columns={[...tableColumns.reviewQueue]}
        rows={reviewQueue}
        rowKeys={["skill", "publisher", "protocol", "submitted", "risk", "manifest", "statusShort"]}
      />
      <a className="operator-section-link" href="#review-queue">{linkWithArrow(text("进入审核队列", "Go to Review Queue"))}</a>
    </OperatorPanel>
  );
}

function SkillContractInspector({ locale }: { locale: Locale }) {
  return (
    <OperatorPanel
      action={
        <div className="operator-inspector-actions">
          <span>browser-research-pro v1.2.0</span>
          <b>{inlineBilingual(text("Schema 有效", "Schema Valid"))}</b>
        </div>
      }
      className="operator-panel--inspector"
      id="skill-contract"
      title={bilingual(text("技能合约检查器", "Skill Contract Inspector"))}
    >
      <div className="operator-tabs" role="tablist" aria-label="技能合约分区 / Skill contract sections">
        {[
          text("Manifest", "Manifest"),
          text("权限 8", "Permissions 8"),
          text("策略", "Policy"),
          text("版本 4", "Versions 4"),
          text("测试 12", "Tests 12"),
        ].map((tab, index) => (
          <button aria-selected={index === 0} className={index === 0 ? "is-active" : ""} role="tab" type="button" key={tab.en}>
            {inlineBilingual(tab)}
          </button>
        ))}
      </div>
      <CodeBlock code={manifest} language="json" />
      <div className="operator-policy-preview">
        <div>
          <h3>{bilingual(text("运行时策略预览", "Runtime Policy Preview"))}</h3>
          <dl>
            {runtimePolicy.map(([label, value]) => (
              <div key={label.en}>
                <dt>{bilingual(label)}</dt>
                <dd>{bilingual(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <a className="operator-ghost-button" href={localizedHref("/skills/browser-research-pro", locale)}>
          {linkWithArrow(actionLabels.viewFullManifest)}
        </a>
      </div>
    </OperatorPanel>
  );
}

function InvocationGate({ locale }: { locale: Locale }) {
  return (
    <OperatorPanel
      action={<button className="operator-select-button" type="button">{inlineBilingual(text("最近 24h", "Last 24h"))} <ChevronDown size={13} aria-hidden="true" /></button>}
      id="invocation-gate"
      title={bilingual(text("调用闸门", "Invocation Gate"))}
    >
      <section className="operator-gate-callout">
        <LockKeyhole size={18} aria-hidden="true" />
        <div>
          <h3>{bilingual(text("需要项目密钥", "PROJECT KEY REQUIRED"))}</h3>
          <p>{bilingual(text("调用此技能需要有效的项目运行时密钥。", "This skill requires a valid project runtime key to invoke."))}</p>
          <a href={localizedHref("/project-keys", locale)}>{linkWithArrow(actionLabels.viewProjectKeyRequirements)}</a>
        </div>
      </section>
      <div className="operator-policy-row">
        {[
          [text("策略检查", "Policy Check"), text("已通过", "Passed")],
          [text("速率限制", "Rate Limit"), text("60 / 分钟", "60 / min")],
          [text("认证", "Auth"), text("Bearer", "Bearer")],
          [text("日志", "Logging"), text("已启用", "Enabled")],
        ].map(([label, value]) => (
          <div key={label.en}>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{bilingual(label)}</span>
            <strong>{bilingual(value)}</strong>
          </div>
        ))}
      </div>
      <div className="operator-code-head">
        <span>{bilingual(text("示例 API 请求", "Sample API Request"))}</span>
        <b>REST</b>
        <em>curl</em>
      </div>
      <CodeBlock code={sampleApiRequest} language="bash" compact />
      <div className="operator-latest-response">
        <span>{bilingual(text("最新响应", "Latest Response"))}</span>
        <b>200 OK</b>
        <em>1.23s</em>
      </div>
      <section className="operator-audit-snapshot" id="audit-snapshot">
        <h3>{bilingual(text("审计快照", "Audit Snapshot"))}</h3>
        {tableColumns.audit.map((label, index) => {
          const values = ["POST /run", "1,256", "98.7%", "1.23s", "1.3%"];
          return (
          <div key={label.en}>
            <span>{bilingual(label)}</span>
            <strong className={label.en === "Errors" ? "is-danger" : ""}>{values[index]}</strong>
          </div>
          );
        })}
      </section>
    </OperatorPanel>
  );
}

function ProjectKeys() {
  return (
    <OperatorPanel
      action={<a href="#project-keys">{linkWithArrow(actionLabels.viewAll)}</a>}
      id="project-keys"
      title={bilingual(text("项目密钥", "Project Keys"))}
    >
      <ResponsiveTable
        columns={[...tableColumns.projectKeys]}
        rows={projectKeys}
        rowKeys={["project", "environment", "keys", "status", "lastUsed"]}
      />
      <a className="operator-section-link" href="#project-keys">{linkWithArrow(text("进入项目密钥", "Go to Project Keys"))}</a>
    </OperatorPanel>
  );
}

function RuntimeLogs() {
  return (
    <OperatorPanel
      action={
        <span className="operator-live-action"><i /> {bilingual(text("实时", "Live"))} <a href="#runtime-logs">{linkWithArrow(actionLabels.viewAll)}</a></span>
      }
      id="runtime-logs"
      title={bilingual(text("运行日志", "Runtime Logs"))}
    >
      <ResponsiveTable
        columns={[...tableColumns.runtimeLogs]}
        rows={runtimeLogs}
        rowKeys={["time", "method", "skill", "project", "status", "latency"]}
      />
      <a className="operator-section-link" href="#runtime-logs">{linkWithArrow(text("进入运行日志", "Go to Runtime Logs"))}</a>
    </OperatorPanel>
  );
}

function PermissionRisk() {
  return (
    <OperatorPanel
      action={<a href="#permission-risk">{linkWithArrow(actionLabels.viewAll)}</a>}
      id="permission-risk"
      title={bilingual(text("权限风险总览", "Permission Risk Overview"))}
    >
      <ResponsiveTable
        columns={[...tableColumns.permissionRisk]}
        rows={permissionRisk}
        rowKeys={["permission", "skills", "risk", "usage"]}
      />
    </OperatorPanel>
  );
}

function PublisherReview() {
  return (
    <OperatorPanel
      action={<a href="#publisher-review">{linkWithArrow(actionLabels.viewAll)}</a>}
      id="publisher-review"
      title={bilingual(text("发布者审核", "Publisher Review"))}
    >
      <ResponsiveTable
        columns={[...tableColumns.publisherReview]}
        rows={publisherReview}
        rowKeys={["publisher", "submitted", "approved", "rejected", "status"]}
      />
    </OperatorPanel>
  );
}

function SecurityReviews() {
  return (
    <OperatorPanel
      action={<a href="#security-reviews">{linkWithArrow(actionLabels.viewAll)}</a>}
      id="security-reviews"
      title={bilingual(text("安全审核", "Security Reviews"))}
    >
      <ResponsiveTable
        columns={[...tableColumns.securityReviews]}
        rows={securityReviews}
        rowKeys={["skill", "risk", "issues", "scan", "status"]}
      />
    </OperatorPanel>
  );
}

function MarketplacePrelaunch() {
  return (
    <OperatorPanel
      action={<a href="#marketplace-prelaunch">{linkWithArrow(actionLabels.viewDetails)}</a>}
      id="marketplace-prelaunch"
      title={bilingual(text("市场预发布", "Marketplace Prelaunch"))}
    >
      <div className="operator-progress-head">
        <span>{bilingual(text("预发布进度", "Prelaunch Progress"))}</span>
        <strong>72%</strong>
      </div>
      <div className="operator-progress-bar"><span style={{ width: "72%" }} /></div>
      <ul className="operator-checklist">
        {marketplaceChecklist.map(([label, status]) => (
          <li key={label.en}>
            <CheckCircle2 size={14} aria-hidden="true" />
            <span>{bilingual(label)}</span>
            <b className={statusClass(status)}>{bilingual(statusTranslations[status] ?? text(status, status))}</b>
          </li>
        ))}
      </ul>
    </OperatorPanel>
  );
}

function FinancePrelaunch() {
  return (
    <OperatorPanel
      action={<a href="#finance-prelaunch">{linkWithArrow(actionLabels.viewDetails)}</a>}
      id="finance-prelaunch"
      title={bilingual(text("财务预发布", "Finance Prelaunch"))}
    >
      <div className="operator-finance-list">
        {financePreview.map(([label, value]) => (
          <div key={label.en}>
            <span>{bilingual(label)}</span>
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
  columns: BilingualText[];
  rows: ConsoleRow[];
  rowKeys: string[];
}) {
  return (
    <div className="operator-table-wrap">
      <table className="operator-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.en}>{bilingual(column)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKeys.map((key) => row[key]).join("-")}>
              {rowKeys.map((key) => (
                <td key={key} data-label={bilingualText(columns[rowKeys.indexOf(key)])}>
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
    return <span className={`operator-badge ${statusClass(value)}`}>{bilingual(statusTranslations[value] ?? text(value, value))}</span>;
  }

  if (field === "environment") {
    return <span>{bilingual(environmentTranslations[value] ?? text(value, value))}</span>;
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
