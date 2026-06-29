import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccountLoginMethodManager } from "@/components/account-login-method-manager";
import { InlineHelp } from "@/components/inline-help";
import { AccountSidebarSignOut } from "@/components/account-sidebar-sign-out";
import { AccountSessionManager } from "@/components/account-session-manager";
import { AppShell } from "@/components/app-shell";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { PublisherPayoutManager } from "@/components/publisher-payout-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import {
  getAccountSessions,
  getAccountSummary,
  type AccountSessionRecord,
  type AccountSummary,
} from "@/lib/account-data";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import {
  formatMoney,
  getNotificationPreferences,
  getPublisherFinanceLedger,
  getPublisherPayoutSummary,
  type FinanceLedger,
  type FinanceLedgerTransaction,
  type PublisherPayoutSummary,
} from "@/lib/ops-data";
import styles from "./account.module.css";


type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account",
    accountEmpty:
      "Connect a workspace session to see profile, organization, roles, sessions, and notification readiness. Billing and payout readiness appear only when paid marketplace preview permissions apply.",
    activeSessions: "Active sessions",
    activeTokens: "Active tokens",
    admin: "Admin",
    adminBody:
      "Review, finance, launch readiness, trust, delivery, and audit operations.",
    available: "Available",
    billing: "Billing",
    commandIdentity: "Identity",
    commandIdentityBody:
      "Profile, verified email, connected providers, and organization membership.",
    commandOperations: "Operations",
    commandOperationsBody:
      "Unread notifications, session activity, and role-gated readiness. Billing and payout states appear only for paid marketplace preview permissions.",
    commandSecurity: "Security",
    commandSecurityBody:
      "Session fingerprints and revocation controls without exposing raw tokens.",
    commissions: "Commissions",
    commissionsBody:
      "Publisher revenue, platform commission, payable balances, split details, receiving account readiness, and payout requests for the current workspace.",
    commissionsEmpty: "No commission ledger rows yet.",
    commissionsLockedBody:
      "Commission data is available to publisher, owner, and admin roles. Confirm the current workspace role or open the publisher workspace to complete setup.",
    commissionsLockedTitle: "Publisher commission access required.",
    commissionsSourceMix: "Revenue source mix",
    commissionsTableHeaders: ["Skill", "Source", "Gross", "Platform fee", "Publisher share", "Balance", "Posted"],
    commissionsTitle: "Publisher commission center",
    commissionMetrics: {
      available: "Available",
      gross: "Gross revenue",
      pending: "Pending",
      platformFee: "Platform commission",
      publisherShare: "Publisher share",
    },
    commissionSources: {
      adjustment: "Adjustment",
      refund: "Refund",
      subscription: "Subscription",
      unknown: "Ledger",
      usage: "Usage",
    },
    commandSignInBody:
      "Use Google, GitHub, or username/email password to unlock identity, sessions, roles, and notifications. Paid readiness appears only when your role allows it.",
    commandSignInTitle: "Sign in to unlock the account center.",
    commandWorkspace: "Workspace",
    commandWorkspaceBody:
      "Team, project, owned-skill, and active-token readiness for real operations.",
    connectedAccounts: "Connected login methods",
    dashboard: "Dashboard",
    dashboardBody: "General command center for cross-role operating proof.",
    developer: "Developer workspace",
    developerBody:
      "Projects, verified-skill adoption, API keys, login-gated runtime tests, team access, and webhooks.",
    email: "Email",
    empty: "Not connected",
    heroBody:
      "Manage the identity layer behind SkillHub operations: profile, organization role, login methods, token security, notification preferences, and workspace readiness.",
    heroEyebrow: "Personal center",
    heroTitle: "Your SkillHub account command center.",
    invoiceReady: "Invoice ready",
    memberSince: "Member since",
    no: "No",
    notificationPreferences: "Notification preferences",
    organization: "Organization",
    payout: "Paid marketplace",
    profile: "Profile",
    projects: "Projects",
    publisher: "Publisher workspace",
    publisherBody:
      "Upload, review repair, buyer demand, paid-readiness metadata, and prelaunch finance state.",
    publisherStatus: "Publisher",
    reviewAccount: "Review account",
    role: "Role",
    roleRequired: "Role required",
    security: "Session security",
    signIn: "Sign in",
    signInRequired: "Sign-in required",
    skills: "Skills",
    shortcuts: "Role-aware workspaces",
    signedOutGuide: {
      ariaLabel: "Account center access steps",
      eyebrow: "Account access",
      marker: "personal center / session security / workspace readiness",
      actions: [
        {
          body: "Use Google, GitHub, or username/email password to create the current workspace session.",
          href: "/login",
          label: "01",
          title: "Sign in",
        },
        {
          body: "Return here to check identity, connected providers, sessions, roles, and workspace readiness.",
          href: "/account",
          label: "02",
          title: "Review account readiness",
        },
        {
          body: "Continue to developer, publisher, or operator workspaces only after the role state is clear.",
          href: "/dashboard",
          label: "03",
          title: "Choose the right workspace",
        },
      ],
      body: "After sign-in, this page becomes the safe handoff between identity, sessions, roles, workspace readiness, and the role-specific consoles.",
      title: "Start with account access, then choose a workspace.",
    },
    team: "Team",
    unread: "Unread notifications",
    workspace: "Workspace readiness",
    yes: "Yes",
  },
  zh: {
    account: "账号",
    accountEmpty:
      "连接工作区会话后，可查看资料、组织、角色、会话和通知准备度。账单和提现准备度仅在具备付费市场预览权限时显示。",
    activeSessions: "有效会话",
    activeTokens: "有效 token",
    admin: "后台",
    adminBody: "审核、财务、上线就绪、信任、投递和审计运营。",
    available: "可进入",
    billing: "账单",
    commandIdentity: "身份",
    commandIdentityBody: "资料、已验证邮箱、绑定 provider 和组织成员关系。",
    commandOperations: "运营",
    commandOperationsBody:
      "未读通知、会话活动和按角色开放的准备状态。账单和提现仅在付费市场预览权限下显示。",
    commandSecurity: "安全",
    commandSecurityBody: "会话指纹和撤销控制，不暴露原始 token。",
    commissions: "佣金",
    commissionsBody:
      "查看当前工作区的发布者收益、平台佣金、可提现余额、分账明细、收款账户准备度和提现申请。",
    commissionsEmpty: "暂无佣金明细。",
    commissionsLockedBody:
      "佣金数据仅对 publisher、owner 和 admin 角色开放。请先确认当前工作区角色，或进入发布者工作台完成设置。",
    commissionsLockedTitle: "需要发布者佣金权限。",
    commissionsSourceMix: "收益来源结构",
    commissionsTableHeaders: ["技能", "来源", "交易总额", "平台佣金", "发布者分成", "余额", "入账时间"],
    commissionsTitle: "发布者佣金中心",
    commissionMetrics: {
      available: "可提现",
      gross: "累计收入",
      pending: "待结算",
      platformFee: "平台佣金",
      publisherShare: "发布者分成",
    },
    commissionSources: {
      adjustment: "调整",
      refund: "退款",
      subscription: "订阅",
      unknown: "账本",
      usage: "调用",
    },
    commandSignInBody:
      "使用 Google、GitHub，或用户名/邮箱加密码进入后，再查看身份、会话、角色和通知。付费准备状态仅在角色允许时显示。",
    commandSignInTitle: "登录后解锁账号中心。",
    commandWorkspace: "工作区",
    commandWorkspaceBody: "团队、项目、已拥有技能和有效 token 的运营准备度。",
    connectedAccounts: "已连接登录方式",
    dashboard: "综合工作台",
    dashboardBody: "跨角色运营证据和总览入口。",
    developer: "开发者工作台",
    developerBody:
      "项目、已验证技能采用、API Key、登录门控运行测试、团队权限和 Webhook。",
    email: "邮箱",
    empty: "未连接",
    heroBody:
      "管理 SkillHub 运营背后的身份层：个人资料、组织角色、登录方式、token 安全、通知偏好和工作区准备度。",
    heroEyebrow: "个人中心",
    heroTitle: "你的 SkillHub 账号控制中心。",
    invoiceReady: "发票准备",
    memberSince: "加入时间",
    no: "否",
    notificationPreferences: "通知偏好",
    organization: "组织",
    payout: "付费预览",
    profile: "个人资料",
    projects: "项目",
    publisher: "发布者工作台",
    publisherBody: "上传、审核修复、买方需求、付费准备和预发布财务状态。",
    publisherStatus: "发布者",
    reviewAccount: "检查账号",
    role: "角色",
    roleRequired: "需要对应角色",
    security: "会话安全",
    signIn: "去登录",
    signInRequired: "需要先登录",
    skills: "技能",
    shortcuts: "按角色进入工作台",
    signedOutGuide: {
      ariaLabel: "账号中心准入步骤",
      eyebrow: "账号准入",
      marker: "个人中心 / 会话安全 / 工作区准备度",
      actions: [
        {
          body: "使用 Google、GitHub，或用户名/邮箱加密码建立当前工作区会话。",
          href: "/login",
          label: "01",
          title: "登录账号",
        },
        {
          body: "回到这里检查身份、绑定方式、会话、角色和工作区准备度。",
          href: "/account",
          label: "02",
          title: "检查账号状态",
        },
        {
          body: "确认角色后，再进入开发者、发布者或运营工作台。",
          href: "/dashboard",
          label: "03",
          title: "选择正确工作台",
        },
      ],
      body: "登录后，这里会成为身份、会话、角色、工作区准备度和各角色后台之间的安全交接页。",
      title: "先完成账号访问，再选择工作台。",
    },
    team: "团队",
    unread: "未读通知",
    workspace: "工作区准备度",
    yes: "是",
  },
} as const;

type AccountLabels = (typeof copy)["en"] | (typeof copy)["zh"];
type AccountSection = "commissions" | "notifications" | "overview" | "security" | "workspace";
type AccountMetricItem = readonly [string, number, LucideIcon];
type AccountReadinessItem = readonly [string, number | string, LucideIcon];


export async function AccountWorkspacePage({
  searchParams,
  section,
}: PageProps & { section: AccountSection }) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const [
    account,
    accountSessions,
    session,
    notificationPreferences,
    publisherFinanceLedger,
    publisherPayoutSummary,
  ] = await Promise.all([
    getAccountSummary(),
    getAccountSessions(),
    getWorkspaceSession(),
    getNotificationPreferences(),
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
  ]);
  const signedIn = Boolean(account.profile.userId);
  const shellSecondaryHref = signedIn
    ? localizedHref("/account", locale)
    : undefined;
  const shellSecondaryLabel = signedIn
    ? locale === "zh"
      ? "个人中心"
      : "Account"
    : undefined;
  const workspaceStats = [
    [labels.team, account.workspace.teamMemberCount, Users],
    [labels.projects, account.workspace.projectCount, LayoutDashboard],
    [labels.skills, account.workspace.skillCount, UploadCloud],
    [labels.activeTokens, account.workspace.activeTokenCount, KeyRound],
  ] as const;
  const readiness = [
    [labels.unread, account.workspace.unreadNotifications, Bell],
    [
      labels.billing,
      account.workspace.billingProfileComplete ? labels.yes : labels.no,
      CreditCard,
    ],
    [
      labels.invoiceReady,
      account.workspace.invoiceReady ? labels.yes : labels.no,
      ShieldCheck,
    ],
    [
      labels.payout,
      statusLabel(account.workspace.payoutStatus, locale),
      Wallet,
    ],
  ] as const;

  return (
    <AppShell
      active="account"
      locale={locale}
      secondaryHref={shellSecondaryHref}
      secondaryLabel={shellSecondaryLabel}
    >
      <div className={"account-shell " + styles.pageStyles}>
        <AccountWorkspaceLayout
          activeSection={section}
          account={account}
          labels={labels}
          locale={locale}
          canSignOut={session.source === "cookie"}
          signedIn={signedIn}
          statusText={signedIn ? account.profile.platformRole : labels.signInRequired}
        >
          {!signedIn ? (
            <AccountSignedOutPanel labels={labels} locale={locale} />
          ) : section === "security" ? (
            <AccountSecurityPanel
              account={account}
              accountSessions={accountSessions}
              labels={labels}
              locale={locale}
              session={session}
            />
          ) : section === "workspace" ? (
            <AccountWorkspacePanel
              labels={labels}
              locale={locale}
              readiness={readiness}
              session={session}
              workspaceStats={workspaceStats}
            />
          ) : section === "notifications" ? (
            <AccountNotificationsPanel
              labels={labels}
              locale={locale}
              notificationPreferences={notificationPreferences}
            />
          ) : section === "commissions" ? (
            <AccountCommissionsPanel
              financeLedger={publisherFinanceLedger}
              labels={labels}
              locale={locale}
              payoutSummary={publisherPayoutSummary}
              session={session}
            />
          ) : (
            <AccountOverviewPanel
              account={account}
              labels={labels}
              locale={locale}
              readiness={readiness}
              session={session}
              workspaceStats={workspaceStats}
            />
          )}
        </AccountWorkspaceLayout>
      </div>
    </AppShell>
  );
}

function AccountWorkspaceLayout({
  account,
  activeSection,
  canSignOut,
  children,
  labels,
  locale,
  signedIn,
  statusText,
}: {
  account: AccountSummary;
  activeSection: AccountSection;
  canSignOut: boolean;
  children: React.ReactNode;
  labels: AccountLabels;
  locale: Locale;
  signedIn: boolean;
  statusText: string;
}) {
  const navItems = getAccountNavItems(labels);
  const activeItem = navItems.find((item) => item.id === activeSection) ?? navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <section className="workspace-admin-shell" aria-labelledby="account-workspace-title">
      <aside className="workspace-admin-sidebar" aria-label={labels.account}>
        <div className="workspace-admin-sidebar__brand">
          <span className="workspace-admin-sidebar__icon" aria-hidden="true">
            <UserCircle size={18} />
          </span>
          <div>
            <strong>{labels.account}</strong>
            <small>{account.profile.email ?? labels.empty}</small>
          </div>
        </div>
        <div className="workspace-admin-sidebar__status">
          <span className={signedIn ? "pill pill--success" : "pill pill--warning"}>
            {statusText}
          </span>
          <small>{organizationLabel(account, labels.empty)}</small>
        </div>
        <nav className="workspace-admin-nav" aria-label={labels.account}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                aria-current={item.id === activeSection ? "page" : undefined}
                className={
                  item.id === activeSection
                    ? "workspace-admin-nav__item workspace-admin-nav__item--active"
                    : "workspace-admin-nav__item"
                }
                href={localizedHref(item.href, locale)}
                key={item.id}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        {canSignOut ? <AccountSidebarSignOut locale={locale} /> : null}
      </aside>

      <main className="workspace-admin-main">
        <header className="workspace-admin-main__header">
          <div>
            <div className="eyebrow">
              <ActiveIcon size={16} aria-hidden="true" />
              <span>{labels.heroEyebrow}</span>
            </div>
            <div className="workspace-admin-title-row">
              <h1 id="account-workspace-title">{activeItem.label}</h1>
              <InlineHelp
                content={activeItem.description}
                label={locale === "zh" ? "查看页面说明" : "View page guidance"}
              />
            </div>
          </div>
        </header>
        <div className="workspace-admin-panel-stack">{children}</div>
      </main>
    </section>
  );
}

function AccountOverviewPanel({
  account,
  labels,
  locale,
  readiness,
  session,
  workspaceStats,
}: {
  account: AccountSummary;
  labels: AccountLabels;
  locale: Locale;
  readiness: readonly AccountReadinessItem[];
  session: WorkspaceSession;
  workspaceStats: readonly AccountMetricItem[];
}) {
  return (
    <>
      <article className="ops-panel account-profile-panel">
        <div className="account-profile-panel__head">
          <div>
            <div className="eyebrow">
              <UserCircle size={16} aria-hidden="true" />
              <span>{labels.profile}</span>
            </div>
            <h2>{account.profile.displayName ?? account.profile.email ?? labels.account}</h2>
            <p>{account.profile.email ?? labels.empty}</p>
          </div>
          <span className="pill pill--success">{account.profile.platformRole}</span>
        </div>
        <div className="account-meta-grid">
          <MetaItem label={labels.email} value={account.profile.email ?? labels.empty} />
          <MetaItem label={labels.organization} value={organizationLabel(account, labels.empty)} />
          <MetaItem label={labels.role} value={account.membership?.role ?? labels.empty} />
          <MetaItem label={labels.memberSince} value={formatDate(account.membership?.memberSince, locale)} />
        </div>
      </article>
      <AccountWorkspaceSummary labels={labels} locale={locale} readiness={readiness} workspaceStats={workspaceStats} />
      <AccountWorkspaceShortcuts labels={labels} locale={locale} session={session} />
    </>
  );
}

function AccountSecurityPanel({
  account,
  accountSessions,
  labels,
  locale,
  session,
}: {
  account: AccountSummary;
  accountSessions: AccountSessionRecord[];
  labels: AccountLabels;
  locale: Locale;
  session: WorkspaceSession;
}) {
  return (
    <>
      <SessionStatusPanel locale={locale} session={session} />
      <AccountSessionManager locale={locale} sessions={accountSessions} />
      <article className="ops-panel account-method-panel">
        <div className="eyebrow">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.connectedAccounts}</span>
        </div>
        <AccountLoginMethodManager locale={locale} methods={account.loginMethods} />
      </article>
    </>
  );
}

function AccountWorkspacePanel({
  labels,
  locale,
  readiness,
  session,
  workspaceStats,
}: {
  labels: AccountLabels;
  locale: Locale;
  readiness: readonly AccountReadinessItem[];
  session: WorkspaceSession;
  workspaceStats: readonly AccountMetricItem[];
}) {
  return (
    <>
      <ConsoleAccessPanel locale={locale} session={session} variant="compact" />
      <AccountWorkspaceSummary labels={labels} locale={locale} readiness={readiness} workspaceStats={workspaceStats} />
      <AccountWorkspaceShortcuts labels={labels} locale={locale} session={session} />
    </>
  );
}

function AccountNotificationsPanel({
  labels,
  locale,
  notificationPreferences,
}: {
  labels: AccountLabels;
  locale: Locale;
  notificationPreferences: Awaited<ReturnType<typeof getNotificationPreferences>>;
}) {
  return (
    <>
      <article className="ops-panel account-notification-intro">
        <div className="eyebrow">
          <Bell size={16} aria-hidden="true" />
          <span>{labels.notificationPreferences}</span>
        </div>
        <h2>{labels.commandOperations}</h2>
        <p>{labels.commandOperationsBody}</p>
      </article>
      <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
    </>
  );
}

function AccountCommissionsPanel({
  financeLedger,
  labels,
  locale,
  payoutSummary,
  session,
}: {
  financeLedger: FinanceLedger;
  labels: AccountLabels;
  locale: Locale;
  payoutSummary: PublisherPayoutSummary;
  session: WorkspaceSession;
}) {
  const hasPublisherAccess = hasAnyRole(session, ["publisher", "owner", "admin", "super_admin"]);

  if (!hasPublisherAccess) {
    return (
      <article className="ops-panel account-commission-locked">
        <div className="eyebrow">
          <CircleDollarSign size={16} aria-hidden="true" />
          <span>{labels.commissions}</span>
        </div>
        <h2>{labels.commissionsLockedTitle}</h2>
        <p>{labels.commissionsLockedBody}</p>
        <div className="account-commission-locked__actions">
          <a className="btn-primary inline-flex items-center gap-2 w-fit" href={localizedHref("/account", locale)}>
            <UserCircle size={16} aria-hidden="true" />
            <span>{labels.reviewAccount}</span>
          </a>
          <a className="secondary-button secondary-button--compact" href={localizedHref("/publisher", locale)}>
            <UploadCloud size={15} aria-hidden="true" />
            <span>{labels.publisher}</span>
          </a>
        </div>
      </article>
    );
  }

  const summary = financeLedger.summary;
  const metricTiles = [
    [labels.commissionMetrics.gross, summary.grossCents, CircleDollarSign],
    [labels.commissionMetrics.platformFee, summary.platformFeeCents, CreditCard],
    [labels.commissionMetrics.publisherShare, summary.publisherShareCents, Wallet],
    [labels.commissionMetrics.available, payoutSummary.balances.availableCents, Wallet],
    [labels.commissionMetrics.pending, payoutSummary.balances.pendingCents, Bell],
  ] as const;
  const sourceRows = buildCommissionSourceRows(financeLedger, labels);

  return (
    <>
      <article className="ops-panel account-commission-panel">
        <div className="account-commission-panel__head">
          <div>
            <div className="eyebrow">
              <CircleDollarSign size={16} aria-hidden="true" />
              <span>{labels.commissionsTitle}</span>
            </div>
            <p>{labels.commissionsBody}</p>
          </div>
          <span className={payoutSummary.readiness?.canRequest ? "status-chip" : "status-chip status-chip--warning"}>
            {statusLabel(payoutSummary.publisherProfile?.payoutStatus ?? "not_configured", locale)}
          </span>
        </div>

        <div className="account-commission-metrics">
          {metricTiles.map(([label, value, Icon]) => (
            <div className="stat-card" key={label}>
              <Icon size={16} aria-hidden="true" />
              <span className="body-text-sm text-[#999]">{label}</span>
              <strong className="heading-sm text-white">
                {formatMoney(value, payoutSummary.balances.currency)}
              </strong>
            </div>
          ))}
        </div>

        <section className="account-commission-source-mix" aria-label={labels.commissionsSourceMix}>
          <header>
            <strong>{labels.commissionsSourceMix}</strong>
            <span>{formatMoney(summary.grossCents, payoutSummary.balances.currency)}</span>
          </header>
          <div className="account-commission-source-mix__items">
            {sourceRows.length > 0 ? (
              sourceRows.map((source) => (
                <div className="account-commission-source" key={source.id}>
                  <div>
                    <strong>{source.label}</strong>
                    <span>{formatNumber(source.count, locale)}</span>
                  </div>
                  <div>
                    <strong>{formatMoney(source.grossCents, payoutSummary.balances.currency)}</strong>
                    <span>{formatMoney(source.publisherShareCents, payoutSummary.balances.currency)}</span>
                  </div>
                  <span style={{ width: `${source.sharePercent}%` }} aria-hidden="true" />
                </div>
              ))
            ) : (
              <div className="account-commission-source account-commission-source--empty">
                <strong>{labels.commissionsEmpty}</strong>
              </div>
            )}
          </div>
        </section>

        <div className="account-commission-table">
          <div className="account-commission-row account-commission-row--head">
            {labels.commissionsTableHeaders.map((header) => (
              <span key={header}>{header}</span>
            ))}
          </div>
          {financeLedger.recentTransactions.length > 0 ? (
            financeLedger.recentTransactions.map((transaction) => (
              <CommissionTransactionRow
                key={transaction.id}
                labels={labels}
                locale={locale}
                transaction={transaction}
              />
            ))
          ) : (
            <div className="account-commission-row account-commission-row--empty">
              <strong>{labels.commissionsEmpty}</strong>
            </div>
          )}
        </div>
      </article>

      <PublisherPayoutManager locale={locale} summary={payoutSummary} />
    </>
  );
}

function CommissionTransactionRow({
  labels,
  locale,
  transaction,
}: {
  labels: AccountLabels;
  locale: Locale;
  transaction: FinanceLedgerTransaction;
}) {
  return (
    <div className="account-commission-row">
      <strong>{transaction.skillName ?? transaction.skillSlug ?? labels.empty}</strong>
      <span className="account-commission-source-label">
        <span>{sourceLabel(transaction.sourceType, labels)}</span>
        {transaction.sourceReference ? <code>{transaction.sourceReference}</code> : null}
      </span>
      <span>{formatMoney(transaction.grossCents, transaction.currency)}</span>
      <span>{formatMoney(transaction.platformFeeCents, transaction.currency)}</span>
      <span>{formatMoney(transaction.publisherShareCents, transaction.currency)}</span>
      <span className="status-chip">{statusLabel(transaction.balanceState ?? transaction.status, locale)}</span>
      <span>{formatDate(transaction.createdAt, locale)}</span>
    </div>
  );
}

function AccountWorkspaceSummary({
  labels,
  locale,
  readiness,
  workspaceStats,
}: {
  labels: AccountLabels;
  locale: Locale;
  readiness: readonly AccountReadinessItem[];
  workspaceStats: readonly AccountMetricItem[];
}) {
  return (
    <article className="ops-panel account-workspace-panel">
      <div className="eyebrow">
        <Building2 size={16} aria-hidden="true" />
        <span>{labels.workspace}</span>
      </div>
      <div className="account-admin-grid">
        {workspaceStats.map(([label, value, Icon]) => (
          <div className="stat-card" key={label}>
            <Icon size={16} aria-hidden="true" />
            <span className="body-text-sm text-[#999]">{label}</span>
            <strong className="heading-sm text-white">{formatNumber(value, locale)}</strong>
          </div>
        ))}
      </div>
      <div className="account-admin-grid">
        {readiness.map(([label, value, Icon]) => (
          <div className="stat-card" key={label}>
            <Icon size={16} aria-hidden="true" />
            <span className="body-text-sm text-[#999]">{label}</span>
            <strong className="heading-sm text-white">{typeof value === "number" ? formatNumber(value, locale) : value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function AccountWorkspaceShortcuts({
  labels,
  locale,
  session,
}: {
  labels: AccountLabels;
  locale: Locale;
  session: WorkspaceSession;
}) {
  return (
    <article className="ops-panel account-shortcut-panel">
      <div className="eyebrow">
        <LayoutDashboard size={16} aria-hidden="true" />
        <span>{labels.shortcuts}</span>
      </div>
      <div className="account-shortcut-grid--cards">
        <WorkspaceShortcutCard
          body={labels.developerBody}
          href="/developer"
          icon={BriefcaseBusiness}
          labels={labels}
          locale={locale}
          requiredRoles={["developer", "owner", "admin", "super_admin"]}
          session={session}
          title={labels.developer}
        />
        <WorkspaceShortcutCard
          body={labels.publisherBody}
          href="/publisher"
          icon={UploadCloud}
          labels={labels}
          locale={locale}
          requiredRoles={["publisher", "owner", "admin", "super_admin"]}
          session={session}
          title={labels.publisher}
        />
        <WorkspaceShortcutCard
          body={labels.dashboardBody}
          href="/dashboard"
          icon={Building2}
          labels={labels}
          locale={locale}
          requiredRoles={[]}
          session={session}
          title={labels.dashboard}
        />
        <WorkspaceShortcutCard
          body={labels.adminBody}
          href="/admin"
          icon={ShieldCheck}
          labels={labels}
          locale={locale}
          requiredRoles={["reviewer", "finance", "support", "admin", "super_admin"]}
          session={session}
          title={labels.admin}
        />
      </div>
    </article>
  );
}

function AccountSignedOutPanel({ labels, locale }: { labels: AccountLabels; locale: Locale }) {
  return (
    <article className="ops-panel account-signed-out-panel">
      <div className="eyebrow">
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.signInRequired}</span>
      </div>
      <h2>{labels.commandSignInTitle}</h2>
      <p>{labels.commandSignInBody}</p>
      <a className="btn-primary inline-flex items-center gap-2 w-fit" href={localizedHref("/login", locale)}>
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.signIn}</span>
      </a>
    </article>
  );
}

function getAccountNavItems(labels: AccountLabels) {
  return [
    {
      description: labels.heroBody,
      href: "/account",
      icon: LayoutDashboard,
      id: "overview" as const,
      label: labels.dashboard,
    },
    {
      description: labels.commandSecurityBody,
      href: "/account/security",
      icon: ShieldCheck,
      id: "security" as const,
      label: labels.security,
    },
    {
      description: labels.commandWorkspaceBody,
      href: "/account/workspace",
      icon: Building2,
      id: "workspace" as const,
      label: labels.workspace,
    },
    {
      description: labels.commissionsBody,
      href: "/account/commissions",
      icon: CircleDollarSign,
      id: "commissions" as const,
      label: labels.commissions,
    },
    {
      description: labels.commandOperationsBody,
      href: "/account/notifications",
      icon: Bell,
      id: "notifications" as const,
      label: labels.notificationPreferences,
    },
  ];
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="body-text-sm text-[#666]">{label}</span>
      <strong className="text-white text-sm">{value}</strong>
    </div>
  );
}

function WorkspaceShortcutCard({
  body,
  href,
  icon: Icon,
  labels,
  locale,
  requiredRoles,
  session,
  title,
}: {
  body: string;
  href: string;
  icon: LucideIcon;
  labels: AccountLabels;
  locale: Locale;
  requiredRoles: string[];
  session: WorkspaceSession;
  title: string;
}) {
  const state = workspaceShortcutState(requiredRoles, session, labels);
  const targetHref =
    state.kind === "blocked"
      ? "/login"
      : state.kind === "forbidden"
        ? "/account"
        : href;

  return (
    <a
      className="card card--compact flex flex-col gap-3 p-5 hover:border-[#7fee64] transition-colors"
      href={localizedHref(targetHref, locale)}
    >
      <div className="flex items-center justify-between">
        <Icon size={17} aria-hidden="true" className="text-[#7fee64]" />
        <span
          className={
            state.kind === "available"
              ? "pill pill--success"
              : "pill pill--warning"
          }
        >
          {state.label}
        </span>
      </div>
      <strong className="text-white">{title}</strong>
      <p className="body-text-sm text-[#999]">{body}</p>
      <span className="inline-flex items-center gap-1 text-[#7fee64] text-sm mt-auto">
        {state.action}
        <ArrowRight size={15} aria-hidden="true" />
      </span>
    </a>
  );
}

function workspaceShortcutState(
  requiredRoles: string[],
  session: WorkspaceSession,
  labels: AccountLabels,
) {
  if (!session.subject) {
    return {
      action: labels.signIn,
      kind: "blocked" as const,
      label: labels.signInRequired,
    };
  }

  if (requiredRoles.length === 0) {
    return {
      action: labels.available,
      kind: "available" as const,
      label: labels.available,
    };
  }

  const roleSet = new Set(
    [session.subject.platformRole, ...session.subject.roles].filter(Boolean),
  );
  const hasRole = requiredRoles.some((role) => roleSet.has(role));

  if (!hasRole) {
    return {
      action: labels.reviewAccount,
      kind: "forbidden" as const,
      label: labels.roleRequired,
    };
  }

  return {
    action: labels.available,
    kind: "available" as const,
    label: labels.available,
  };
}

function hasAnyRole(session: WorkspaceSession, roles: string[]) {
  if (!session.subject) {
    return false;
  }

  const roleSet = new Set(
    [session.subject.platformRole, ...session.subject.roles].filter(Boolean),
  );

  return roles.some((role) => roleSet.has(role));
}

function buildCommissionSourceRows(financeLedger: FinanceLedger, labels: AccountLabels) {
  const summary = financeLedger.summary;
  const totalGross = Math.max(summary.grossCents, 1);
  const rows = [
    {
      count: summary.usageTransactionCount,
      grossCents: summary.usageGrossCents,
      id: "usage",
      label: labels.commissionSources.usage,
      publisherShareCents: summary.usagePublisherShareCents,
    },
    {
      count: summary.subscriptionTransactionCount,
      grossCents: summary.subscriptionGrossCents,
      id: "subscription",
      label: labels.commissionSources.subscription,
      publisherShareCents: summary.subscriptionPublisherShareCents,
    },
  ];

  return rows
    .filter((row) => row.grossCents > 0 || row.count > 0)
    .map((row) => ({
      ...row,
      sharePercent: Math.min(100, Math.max(2, Math.round((row.grossCents / totalGross) * 100))),
    }));
}

function sourceLabel(sourceType: FinanceLedgerTransaction["sourceType"], labels: AccountLabels) {
  if (!sourceType) {
    return labels.commissionSources.unknown;
  }

  return labels.commissionSources[sourceType] ?? labels.commissionSources.unknown;
}

function organizationLabel(account: AccountSummary, emptyLabel: string) {
  if (account.organization) {
    return `${account.organization.name} / ${account.organization.slug}`;
  }

  if (account.membership) {
    return `${account.membership.organizationName} / ${account.membership.organizationSlug}`;
  }

  return emptyLabel;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "暂无" : "n/a";
  }

  if (value === "demo") {
    return locale === "zh" ? "演示数据" : "demo";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
  }).format(date);
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(value: string, locale: Locale) {
  if (locale !== "zh") {
    return value.replace(/_/g, " ");
  }

  const labels: Record<string, string> = {
    active: "可用",
    blocked: "已阻止",
    default: "默认",
    not_configured: "未配置",
    pending: "待处理",
    ready: "已就绪",
    restricted: "受限",
    suspended: "已暂停",
    verification_required: "需要验证",
    verified: "已验证",
  };

  return labels[value] ?? value.replace(/_/g, " ");
}
