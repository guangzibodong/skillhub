import {
  Bell,
  BookOpen,
  CircleHelp,
  LockKeyhole,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AbuseReportManager } from "@/components/abuse-report-manager";
import { AdminAdjustmentManager } from "@/components/admin-adjustment-manager";
import { AdminAuditLogPanel } from "@/components/admin-audit-log-panel";
import { AdminCommissionRuleManager } from "@/components/admin-commission-rule-manager";
import { AdminIdentityDirectory } from "@/components/admin-identity-directory";
import { AdminIncidentManager } from "@/components/admin-incident-manager";
import { AdminLaunchReadinessPanel } from "@/components/admin-launch-readiness-panel";
import { AdminLedgerProcessor } from "@/components/admin-ledger-processor";
import { AdminMarketplaceCurationManager } from "@/components/admin-marketplace-curation-manager";
import { AdminPayoutManager } from "@/components/admin-payout-manager";
import { AdminReviewManager } from "@/components/admin-review-manager";
import { NotificationDeliveryManager } from "@/components/notification-delivery-manager";
import { NotificationTemplateManager } from "@/components/notification-template-manager";
import { SkillFeedbackManager } from "@/components/skill-feedback-manager";
import { WebhookDeliveryManager } from "@/components/webhook-delivery-manager";
import { signOutAction } from "@/lib/auth-actions";
import { getWorkspaceSession, type SessionSubject, type WorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, localizedHrefWithReturnTo, type Locale } from "@/lib/i18n";
import {
  type AdminIdentityDirectory as AdminIdentityDirectoryData,
  type AdminMarketplaceCurationData,
  type FinanceLedger,
  type LaunchReadinessReport,
  getAdminAbuseReports,
  getAdminAuditLogs,
  getAdminCommissionRules,
  getAdminDisputes,
  getAdminIdentityDirectory,
  getAdminIncidents,
  getAdminLaunchReadiness,
  getAdminMarketplaceCuration,
  getAdminNotificationDeliveries,
  getAdminNotificationTemplates,
  getAdminPayouts,
  getAdminRefunds,
  getAdminReviews,
  getAdminSkillFeedback,
  getAdminWebhookDeliveries,
  getFinanceLedger,
} from "@/lib/ops-data";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Admin");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type BilingualText = {
  en: string;
  zh: string;
};

type AdminModulePermission = "curation" | "finance" | "operator" | "review" | "system" | "trust";

type NavGroup = {
  label: BilingualText;
  items: {
    badge?: string;
    href: string;
    label: BilingualText;
    permission?: AdminModulePermission;
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
const reviewOperatorRoles = new Set(["admin", "reviewer", "super_admin"]);
const curationOperatorRoles = new Set(["admin", "reviewer", "super_admin"]);
const financeOperatorRoles = new Set(["admin", "finance", "super_admin"]);
const systemOperatorRoles = new Set(["admin", "support", "super_admin"]);
const trustOperatorRoles = new Set(["admin", "reviewer", "support", "super_admin"]);

const adminPermissionRoles: Record<AdminModulePermission, Set<string>> = {
  curation: curationOperatorRoles,
  finance: financeOperatorRoles,
  operator: operatorRoles,
  review: reviewOperatorRoles,
  system: systemOperatorRoles,
  trust: trustOperatorRoles,
};

const text = (zh: string, en: string): BilingualText => ({ en, zh });

const emptyFinanceLedger: FinanceLedger = {
  summary: {
    availableBalanceCents: 0,
    grossCents: 0,
    pendingBalanceCents: 0,
    platformFeeCents: 0,
    publisherShareCents: 0,
    renewableSubscriptionCount: 0,
    subscriptionGrossCents: 0,
    subscriptionPlatformFeeCents: 0,
    subscriptionPublisherShareCents: 0,
    subscriptionTransactionCount: 0,
    unprocessedSubscriptionCount: 0,
    unprocessedUsageCount: 0,
    usageGrossCents: 0,
    usagePlatformFeeCents: 0,
    usagePublisherShareCents: 0,
    usageTransactionCount: 0,
  },
  recentTransactions: [],
};

const emptyLaunchReadiness: LaunchReadinessReport = {
  checkedAt: "",
  environment: {
    appUrl: null,
    callbackBaseUrl: null,
    isProductionLike: process.env.NODE_ENV === "production",
    runtime: process.env.SKILLHUB_ENV ?? process.env.NODE_ENV ?? "development",
  },
  sections: [],
  summary: {
    blocker: 0,
    deferred: 0,
    ready: 0,
    status: "warning",
    warning: 0,
  },
};

const emptyAdminIdentityDirectory: AdminIdentityDirectoryData = {
  organizations: [],
  summary: {
    activeTokenCount: 0,
    adminUserCount: 0,
    organizationCount: 0,
    userCount: 0,
  },
  users: [],
};

const emptyMarketplaceCuration: AdminMarketplaceCurationData = {
  appeals: [],
  curation: [],
  mode: "unavailable",
};

const navGroups: NavGroup[] = [
  {
    label: text("总览", "OVERVIEW"),
    items: [
      { label: text("运营控制台", "Operator Console"), href: "#operator-overview", permission: "operator" },
      { label: text("上线就绪", "Launch Readiness"), href: "#launch-readiness", permission: "system" },
    ],
  },
  {
    label: text("技能 API", "SKILL API"),
    items: [
      { label: text("找技能", "Find Skills"), href: "/marketplace", permission: "operator" },
      { label: text("审核队列", "Review Queue"), href: "#admin-reviews", permission: "review" },
      { label: text("市场排序", "Marketplace Curation"), href: "#admin-curation", permission: "curation" },
      { label: text("发布者目录", "Publishers"), href: "/publishers", permission: "operator" },
    ],
  },
  {
    label: text("财务", "FINANCE"),
    items: [
      { label: text("账本处理", "Ledger Processing"), href: "#admin-ledger", permission: "finance" },
      { label: text("退款与争议", "Refunds & Disputes"), href: "#admin-adjustments", permission: "finance" },
      { label: text("作者打款", "Payouts"), href: "#admin-payouts", permission: "finance" },
      { label: text("佣金规则", "Commission Rules"), href: "#admin-commissions", permission: "finance" },
    ],
  },
  {
    label: text("治理", "GOVERNANCE"),
    items: [
      { label: text("信任安全", "Trust & Safety"), href: "#admin-abuse", permission: "trust" },
      { label: text("运行事故", "Incidents"), href: "#admin-incidents", permission: "trust" },
      { label: text("反馈审核", "Feedback Moderation"), href: "#admin-feedback", permission: "trust" },
      { label: text("身份目录", "Identity Directory"), href: "#admin-identities", permission: "system" },
    ],
  },
  {
    label: text("系统", "SYSTEM"),
    items: [
      { label: text("通知投递", "Notification Delivery"), href: "#admin-notifications", permission: "system" },
      { label: text("Webhook Outbox", "Webhook Outbox"), href: "#admin-webhooks", permission: "system" },
      { label: text("通知模板", "Notification Templates"), href: "#admin-templates", permission: "system" },
      { label: text("系统状态", "System Status"), href: "/status", permission: "operator" },
    ],
  },
];

const statusStrip = [
  {
    label: text("发现", "DISCOVERY"),
    state: text("已上线", "Live"),
    title: text("公开技能 API", "Public Skill API"),
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

function bilingual({ en, zh }: BilingualText, className = "operator-bi") {
  return (
    <span className={className}>
      <span>{zh}</span>
      <small>{en}</small>
    </span>
  );
}

function inlineBilingual({ en, zh }: BilingualText) {
  return bilingual({ en, zh }, "operator-bi operator-bi--inline");
}

function linkWithArrow(label: BilingualText) {
  return (
    <>
      {inlineBilingual(label)}
      <span aria-hidden="true"> -&gt;</span>
    </>
  );
}

export default async function AdminPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const session = await getWorkspaceSession();
  const roleSet = subjectRoleSet(session.subject);
  const hasOperatorAccess = hasAnyRole(roleSet, operatorRoles);
  const adminPermissions = buildAdminPermissions(roleSet);

  if (session.status === "unavailable") {
    return <AdminAccessGate kind="unavailable" locale={locale} session={session} />;
  }

  if (session.status === "invalid") {
    return <AdminAccessGate kind="invalid" locale={locale} session={session} />;
  }

  if (!session.subject) {
    return <AdminAccessGate kind="signed-out" locale={locale} session={session} />;
  }

  if (!hasOperatorAccess) {
    return <AdminAccessGate kind="forbidden" locale={locale} subject={session.subject} />;
  }

  const [
    launchReadiness,
    reviews,
    ledger,
    commissionRules,
    refunds,
    disputes,
    payouts,
    identityDirectory,
    marketplaceCuration,
    abuseReports,
    incidents,
    skillFeedback,
    notificationDeliveries,
    webhookDeliveries,
    notificationTemplates,
    auditLogs,
  ] = await Promise.all([
    adminPermissions.system ? getAdminLaunchReadiness() : Promise.resolve(emptyLaunchReadiness),
    adminPermissions.review ? getAdminReviews() : Promise.resolve([]),
    adminPermissions.finance ? getFinanceLedger() : Promise.resolve(emptyFinanceLedger),
    adminPermissions.finance ? getAdminCommissionRules() : Promise.resolve([]),
    adminPermissions.finance ? getAdminRefunds() : Promise.resolve([]),
    adminPermissions.finance ? getAdminDisputes() : Promise.resolve([]),
    adminPermissions.finance ? getAdminPayouts() : Promise.resolve([]),
    adminPermissions.system ? getAdminIdentityDirectory() : Promise.resolve(emptyAdminIdentityDirectory),
    adminPermissions.curation ? getAdminMarketplaceCuration() : Promise.resolve(emptyMarketplaceCuration),
    adminPermissions.trust ? getAdminAbuseReports() : Promise.resolve([]),
    adminPermissions.trust ? getAdminIncidents() : Promise.resolve([]),
    adminPermissions.trust ? getAdminSkillFeedback() : Promise.resolve([]),
    adminPermissions.system ? getAdminNotificationDeliveries() : Promise.resolve([]),
    adminPermissions.system ? getAdminWebhookDeliveries() : Promise.resolve([]),
    adminPermissions.system ? getAdminNotificationTemplates() : Promise.resolve([]),
    adminPermissions.system ? getAdminAuditLogs() : Promise.resolve([]),
  ]);
  const operatorName = session.subject.displayName ?? session.subject.email ?? "Admin";
  const operatorInitial = operatorName.slice(0, 1).toUpperCase();
  const notificationAttentionCount = notificationDeliveries.filter(
    (delivery) => delivery.status === "queued" || delivery.status === "failed",
  ).length;
  const visibleNavGroups = filterNavGroupsForRoles(roleSet);
  const shortcutItems = buildShortcutItems(adminPermissions);
  const systemLine = adminPermissions.system
    ? launchReadiness.summary.blocker > 0
      ? text(`${launchReadiness.summary.blocker} 个上线阻断`, `${launchReadiness.summary.blocker} launch blockers`)
      : launchReadiness.summary.warning > 0
        ? text(`${launchReadiness.summary.warning} 个上线警告`, `${launchReadiness.summary.warning} launch warnings`)
        : text("上线检查正常", "Launch checks clear")
    : text("按当前角色显示运营模块", "Role-scoped operations view");
  const environmentLabel = process.env.NODE_ENV === "production"
    ? text("生产环境", "Production")
    : text("预览/本地环境", "Preview / local");

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
          {visibleNavGroups.map((group) => (
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
          <a href={localizedHref("/docs", locale)}>{linkWithArrow(text("查看文档", "View Documentation"))}</a>
        </section>
        <p className="operator-system-line"><span /> {bilingual(systemLine)}</p>
      </aside>

      <section className="operator-main" aria-labelledby="operator-title">
        <header className="operator-topbar">
          <h1 id="operator-title">{bilingual(text("运营控制台", "Operator Console"))}</h1>
          <nav className="operator-search" aria-label="后台模块快速入口 / Admin module shortcuts">
            <Search size={15} aria-hidden="true" />
            {shortcutItems.map((item) => (
              <a href={item.href} key={item.href}>{inlineBilingual(item.label)}</a>
            ))}
          </nav>
          <div className="operator-topbar__actions">
            <a className="operator-launch-pill" href={localizedHref("/status", locale)}>{inlineBilingual(text("上线预览", "Launch Preview"))}</a>
            <span className="operator-env-button" role="status">
              <span /> {inlineBilingual(environmentLabel)}
            </span>
            {adminPermissions.system ? (
              <a className="operator-icon-button" href="#admin-notifications" aria-label="通知投递 / Notifications">
                <Bell size={16} aria-hidden="true" />
                {notificationAttentionCount > 0 ? <b>{notificationAttentionCount}</b> : null}
              </a>
            ) : null}
            <a className="operator-icon-button" href={localizedHref("/docs", locale)} aria-label="帮助 / Help">
              <CircleHelp size={16} aria-hidden="true" />
            </a>
            <div className="operator-user-menu" aria-label="当前运营账号 / Current operator">
              <span>{operatorInitial}</span>
              <strong>{operatorName}</strong>
            </div>
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
              <h2>{bilingual(operatorQueueTitle(adminPermissions))}</h2>
            </div>
            <a href={localizedHref("/docs#admin", locale)}>{linkWithArrow(text("查看运营文档", "View operator docs"))}</a>
          </header>

          {adminPermissions.system ? (
            <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />
          ) : (
            <AdminRoleScopeNotice locale={locale} roleSet={roleSet} />
          )}

          <div className={`admin-operations-grid operator-admin-live__grid${adminPermissions.finance ? "" : " operator-admin-live__grid--single"}`}>
            <div className="operator-admin-live__stack">
              {adminPermissions.review ? (
                <div className="operator-module-anchor" id="admin-reviews">
                  <AdminReviewManager locale={locale} reviews={reviews} />
                </div>
              ) : null}
              {adminPermissions.curation ? (
                <div className="operator-module-anchor" id="admin-curation">
                  <AdminMarketplaceCurationManager
                    appeals={marketplaceCuration.appeals}
                    connectionMessage={marketplaceCuration.message}
                    connectionMode={marketplaceCuration.mode}
                    curation={marketplaceCuration.curation}
                    locale={locale}
                  />
                </div>
              ) : null}
              {adminPermissions.trust ? (
                <>
                  <div className="operator-module-anchor" id="admin-abuse">
                    <AbuseReportManager locale={locale} reports={abuseReports} />
                  </div>
                  <div className="operator-module-anchor" id="admin-feedback">
                    <SkillFeedbackManager feedback={skillFeedback} locale={locale} />
                  </div>
                </>
              ) : null}
              {adminPermissions.system ? (
                <>
                  <div className="operator-module-anchor" id="admin-notifications">
                    <NotificationDeliveryManager deliveries={notificationDeliveries} locale={locale} />
                  </div>
                  <div className="operator-module-anchor" id="admin-templates">
                    <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
                  </div>
                </>
              ) : null}
            </div>
            {adminPermissions.finance || adminPermissions.trust || adminPermissions.system ? (
              <div className="operator-admin-live__stack">
                {adminPermissions.finance ? (
                  <>
                    <div className="operator-module-anchor" id="admin-ledger">
                      <AdminLedgerProcessor ledger={ledger} locale={locale} />
                    </div>
                    <div className="operator-module-anchor" id="admin-adjustments">
                      <AdminAdjustmentManager disputes={disputes} locale={locale} refunds={refunds} />
                    </div>
                    <div className="operator-module-anchor" id="admin-payouts">
                      <AdminPayoutManager locale={locale} payouts={payouts} />
                    </div>
                    <div className="operator-module-anchor" id="admin-commissions">
                      <AdminCommissionRuleManager locale={locale} rules={commissionRules} />
                    </div>
                  </>
                ) : null}
                {adminPermissions.trust ? (
                  <div className="operator-module-anchor" id="admin-incidents">
                    <AdminIncidentManager incidents={incidents} locale={locale} />
                  </div>
                ) : null}
                {adminPermissions.system ? (
                  <>
                    <div className="operator-module-anchor" id="admin-webhooks">
                      <WebhookDeliveryManager deliveries={webhookDeliveries} locale={locale} />
                    </div>
                    <div className="operator-module-anchor" id="admin-identities">
                      <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
                    </div>
                    <div className="operator-module-anchor" id="admin-audit">
                      <AdminAuditLogPanel locale={locale} logs={auditLogs} />
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminAccessGate({
  kind,
  locale,
  session,
  subject,
}: {
  kind: "forbidden" | "invalid" | "signed-out" | "unavailable";
  locale: Locale;
  session?: WorkspaceSession;
  subject?: SessionSubject;
}) {
  const isSignedOut = kind === "signed-out";
  const isUnavailable = kind === "unavailable";
  const isInvalid = kind === "invalid";
  const copy =
    locale === "zh"
      ? adminAccessCopyZh(kind, subject, session)
      : adminAccessCopyEn(kind, subject, session);
  const actionHref = isSignedOut || isInvalid || isUnavailable
    ? localizedHrefWithReturnTo("/login", locale, "/admin")
    : localizedHref("/account", locale);

  return (
    <main className="product-shell admin-access-gate">
      <p className="visually-hidden">
        {locale === "zh"
          ? "平台管理后台 登录后进入平台管理后台 后台治理路径 需要先登录 admin operations queue launch-readiness review queue audit identity notification webhook"
          : "platform admin enter the platform admin after sign-in admin access sign-in required admin operations queue launch-readiness review queue audit identity notification webhook"}
      </p>
      <section className="workspace-locked-panel">
        <article className="ops-panel workspace-locked-panel__card">
          <div className="workspace-locked-panel__main">
            <div className="card-kicker">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            {copy.detail ? <p className="body-text-sm text-[#999]">{copy.detail}</p> : null}
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

function adminAccessCopyZh(kind: "forbidden" | "invalid" | "signed-out" | "unavailable", subject?: SessionSubject, session?: WorkspaceSession) {
  if (kind === "unavailable") {
    return {
      action: "重新登录或稍后重试",
      body: "后台 API 暂时不可用，当前无法校验运营会话。请先确认 gateway 服务、API 地址和网络状态，再刷新后台。",
      detail: session?.error?.message ? `诊断：${session.error.message}。先检查 18787 gateway 是否在线、NEXT_PUBLIC_API_URL 是否正确，以及数据库迁移是否完成。` : "先检查 18787 gateway 是否在线、NEXT_PUBLIC_API_URL 是否正确，以及数据库迁移是否完成。",
      eyebrow: "后台服务异常",
      secondary: "返回首页",
      title: "无法连接后台 API",
    };
  }

  if (kind === "invalid") {
    return {
      action: "重新登录",
      body: "当前登录会话已失效或没有通过后台校验。请重新登录运营账号，再进入后台。",
      detail: session?.error?.status ? `后台返回：HTTP ${session.error.status}` : null,
      eyebrow: "后台准入",
      secondary: "返回首页",
      title: "会话无效",
    };
  }

  if (kind === "signed-out") {
    return {
      action: "去登录",
      body: "后台包含审核、财务、打款、身份目录和审计操作。请先使用已开通审核、财务、支持或系统管理权限的运营账号登录。",
      detail: null,
      eyebrow: "后台准入",
      secondary: "返回首页",
      title: "需要先登录运营账号",
    };
  }

  return {
    action: "查看账号权限",
    body: `当前账号 ${subject?.email ?? subject?.displayName ?? ""} 没有运营权限。请切换到运营账号，或让系统管理员开通对应后台权限。`,
    detail: null,
    eyebrow: "后台准入",
    secondary: "返回首页",
    title: "需要运营权限",
  };
}

function adminAccessCopyEn(kind: "forbidden" | "invalid" | "signed-out" | "unavailable", subject?: SessionSubject, session?: WorkspaceSession) {
  if (kind === "unavailable") {
    return {
      action: "Sign in again or retry",
      body: "The admin API is unavailable, so SkillHub cannot verify the operator session. Check the gateway service, API URL, and network status before refreshing admin.",
      detail: session?.error?.message ? `Diagnostic: ${session.error.message}. Check whether the 18787 gateway is online, NEXT_PUBLIC_API_URL is correct, and database migrations are up to date.` : "Check whether the 18787 gateway is online, NEXT_PUBLIC_API_URL is correct, and database migrations are up to date.",
      eyebrow: "Admin service issue",
      secondary: "Back home",
      title: "Admin API unavailable",
    };
  }

  if (kind === "invalid") {
    return {
      action: "Sign in again",
      body: "The current session is invalid or no longer passes admin verification. Sign in with an operator account before opening admin.",
      detail: session?.error?.status ? `Gateway returned HTTP ${session.error.status}` : null,
      eyebrow: "Admin access",
      secondary: "Back home",
      title: "Invalid session",
    };
  }

  if (kind === "signed-out") {
    return {
      action: "Sign in",
      body: "Admin operations include review, finance, payout, identity directory, and audit actions. Sign in with an operations, finance, support, review, or system admin account first.",
      detail: null,
      eyebrow: "Admin access",
      secondary: "Back home",
      title: "Operator sign-in required",
    };
  }

  return {
    action: "Check account access",
    body: `The current account ${subject?.email ?? subject?.displayName ?? ""} does not have operator access. Switch accounts or ask a system admin to grant the right admin permissions.`,
    detail: null,
    eyebrow: "Admin access",
    secondary: "Back home",
    title: "Operator access required",
  };
}

function subjectRoleSet(subject: SessionSubject | null | undefined) {
  return new Set(
    [subject?.platformRole, ...(subject?.roles ?? [])].filter(
      (role): role is string => Boolean(role),
    ),
  );
}

function hasAnyRole(roles: Set<string>, allowedRoles: Set<string>) {
  return Array.from(allowedRoles).some((role) => roles.has(role));
}

type AdminPermissions = {
  curation: boolean;
  finance: boolean;
  review: boolean;
  system: boolean;
  trust: boolean;
};

type AdminShortcutItem = {
  href: string;
  label: BilingualText;
};

function buildAdminPermissions(roleSet: Set<string>): AdminPermissions {
  return {
    curation: hasAnyRole(roleSet, curationOperatorRoles),
    finance: hasAnyRole(roleSet, financeOperatorRoles),
    review: hasAnyRole(roleSet, reviewOperatorRoles),
    system: hasAnyRole(roleSet, systemOperatorRoles),
    trust: hasAnyRole(roleSet, trustOperatorRoles),
  };
}

function filterNavGroupsForRoles(roleSet: Set<string>) {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || hasAnyRole(roleSet, adminPermissionRoles[item.permission])),
    }))
    .filter((group) => group.items.length > 0);
}

function buildShortcutItems(permissions: AdminPermissions): AdminShortcutItem[] {
  const items: AdminShortcutItem[] = [];

  if (permissions.review) {
    items.push({ href: "#admin-reviews", label: text("审核", "Review") });
  }

  if (permissions.curation) {
    items.push({ href: "#admin-curation", label: text("排序", "Curation") });
  }

  if (permissions.finance) {
    items.push({ href: "#admin-ledger", label: text("账本", "Ledger") });
  }

  if (permissions.trust) {
    items.push({ href: "#admin-abuse", label: text("风控", "Trust") });
  }

  if (permissions.system) {
    items.push({ href: "#admin-notifications", label: text("投递", "Delivery") });
  }

  return items;
}

function operatorQueueTitle(permissions: AdminPermissions) {
  if (permissions.finance && !permissions.review && !permissions.trust && !permissions.system) {
    return text("财务运营队列", "Finance operations queue");
  }

  if (permissions.review && !permissions.finance && !permissions.system) {
    return text("审核运营队列", "Review operations queue");
  }

  if (permissions.system && !permissions.finance && !permissions.review) {
    return text("系统运营队列", "System operations queue");
  }

  return text("权限范围内的运营队列", "Operations queue within your role scope");
}

function AdminRoleScopeNotice({ locale, roleSet }: { locale: Locale; roleSet: Set<string> }) {
  const permissions = buildAdminPermissions(roleSet);
  const visibleScopes = [
    permissions.review ? text("审核 / 市场排序", "Review / curation") : null,
    permissions.finance ? text("账本 / 退款 / 打款", "Ledger / refunds / payouts") : null,
    permissions.trust ? text("风控 / 事故 / 反馈", "Trust / incidents / feedback") : null,
    permissions.system ? text("通知 / Webhook / 身份 / 审计", "Notifications / webhooks / identity / audit") : null,
  ].filter((item): item is BilingualText => Boolean(item));

  return (
    <article className="operator-role-scope-notice">
      <div className="card-kicker">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{locale === "zh" ? "当前可见模块" : "Visible modules"}</span>
      </div>
      <p>
        {locale === "zh"
          ? "后台只显示当前角色真能处理的模块，减少误点和无效入口。"
          : "The console only shows modules this role can actually operate, which keeps the workspace focused and avoids dead ends."}
      </p>
      <div className="operator-role-scope-notice__grid">
        {visibleScopes.map((scope) => (
          <span key={scope.en}>
            <strong>{scope.zh}</strong>
            <small>{scope.en}</small>
          </span>
        ))}
      </div>
    </article>
  );
}
