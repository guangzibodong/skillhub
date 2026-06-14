import {
  Bell,
  BookOpen,
  ChevronDown,
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
import { getWorkspaceSession, type SessionSubject } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, localizedHrefWithReturnTo, type Locale } from "@/lib/i18n";
import {
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

const navGroups: NavGroup[] = [
  {
    label: text("总览", "OVERVIEW"),
    items: [
      { label: text("运营控制台", "Operator Console"), href: "#operator-overview" },
      { label: text("上线就绪", "Launch Readiness"), href: "#launch-readiness" },
    ],
  },
  {
    label: text("注册表", "REGISTRY"),
    items: [
      { label: text("技能市场", "Skills"), href: "/marketplace" },
      { label: text("审核队列", "Review Queue"), href: "#launch-readiness" },
      { label: text("市场排序", "Marketplace Curation"), href: "#launch-readiness" },
      { label: text("发布者目录", "Publishers"), href: "/publishers" },
    ],
  },
  {
    label: text("财务", "FINANCE"),
    items: [
      { label: text("账本处理", "Ledger Processing"), href: "#launch-readiness" },
      { label: text("退款与争议", "Refunds & Disputes"), href: "#launch-readiness" },
      { label: text("作者打款", "Payouts"), href: "#launch-readiness" },
      { label: text("佣金规则", "Commission Rules"), href: "#launch-readiness" },
    ],
  },
  {
    label: text("治理", "GOVERNANCE"),
    items: [
      { label: text("信任安全", "Trust & Safety"), href: "#launch-readiness" },
      { label: text("运行事故", "Incidents"), href: "#launch-readiness" },
      { label: text("反馈审核", "Feedback Moderation"), href: "#launch-readiness" },
      { label: text("身份目录", "Identity Directory"), href: "#launch-readiness" },
    ],
  },
  {
    label: text("系统", "SYSTEM"),
    items: [
      { label: text("通知投递", "Notification Delivery"), href: "#launch-readiness" },
      { label: text("Webhook Outbox", "Webhook Outbox"), href: "#launch-readiness" },
      { label: text("通知模板", "Notification Templates"), href: "#launch-readiness" },
      { label: text("系统状态", "System Status"), href: "/status" },
    ],
  },
];

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

  if (!session.subject) {
    return <AdminAccessGate kind="signed-out" locale={locale} />;
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
    getAdminLaunchReadiness(),
    getAdminReviews(),
    getFinanceLedger(),
    getAdminCommissionRules(),
    getAdminRefunds(),
    getAdminDisputes(),
    getAdminPayouts(),
    getAdminIdentityDirectory(),
    getAdminMarketplaceCuration(),
    getAdminAbuseReports(),
    getAdminIncidents(),
    getAdminSkillFeedback(),
    getAdminNotificationDeliveries(),
    getAdminWebhookDeliveries(),
    getAdminNotificationTemplates(),
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
          <a href={localizedHref("/docs", locale)}>{linkWithArrow(text("查看文档", "View Documentation"))}</a>
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
              <h2>{bilingual(text("上线就绪、审核、身份、打款、通知、Webhook 和审计", "Launch readiness, review, identity, payout, notification, webhook, and audit"))}</h2>
            </div>
            <a href={localizedHref("/docs#admin", locale)}>{linkWithArrow(text("查看运营文档", "View operator docs"))}</a>
          </header>

          <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />

          <div className="admin-operations-grid operator-admin-live__grid">
            <div className="operator-admin-live__stack">
              <AdminReviewManager locale={locale} reviews={reviews} />
              <AdminMarketplaceCurationManager
                appeals={marketplaceCuration.appeals}
                connectionMessage={marketplaceCuration.message}
                connectionMode={marketplaceCuration.mode}
                curation={marketplaceCuration.curation}
                locale={locale}
              />
              <AbuseReportManager locale={locale} reports={abuseReports} />
              <SkillFeedbackManager feedback={skillFeedback} locale={locale} />
              <NotificationDeliveryManager deliveries={notificationDeliveries} locale={locale} />
              <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
            </div>
            <div className="operator-admin-live__stack">
              <AdminLedgerProcessor ledger={ledger} locale={locale} />
              <AdminAdjustmentManager disputes={disputes} locale={locale} refunds={refunds} />
              <AdminPayoutManager locale={locale} payouts={payouts} />
              <AdminCommissionRuleManager locale={locale} rules={commissionRules} />
              <AdminIncidentManager incidents={incidents} locale={locale} />
              <WebhookDeliveryManager deliveries={webhookDeliveries} locale={locale} />
              <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
              <AdminAuditLogPanel locale={locale} logs={auditLogs} />
            </div>
          </div>
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
      <p className="visually-hidden">
        {locale === "zh"
          ? "平台管理后台 登录后进入平台管理后台 后台治理路径 需要先登录"
          : "platform admin enter the platform admin after sign-in admin access sign-in required"}
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
  return new Set(
    [subject?.platformRole, ...(subject?.roles ?? [])].filter(
      (role): role is string => Boolean(role),
    ),
  );
}

function hasAnyRole(roles: Set<string>, allowedRoles: Set<string>) {
  return Array.from(allowedRoles).some((role) => roles.has(role));
}
