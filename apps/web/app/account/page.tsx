import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FolderPlus,
  KeyRound,
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  Users,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AccountLoginMethodManager } from "@/components/account-login-method-manager";
import { AccountSessionManager } from "@/components/account-session-manager";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import {
  getAccountSessions,
  getAccountSummary,
  type AccountSessionRecord,
  type AccountSummary
} from "@/lib/account-data";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { getNotificationPreferences } from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account",
    accountEmpty: "Connect a workspace session to see profile, organization, billing, payout, and notification readiness.",
    activeSessions: "Active sessions",
    activeTokens: "Active tokens",
    admin: "Admin",
    adminBody: "Review, finance, launch readiness, trust, delivery, and audit operations.",
    available: "Available",
    billing: "Billing",
    commandIdentity: "Identity",
    commandIdentityBody: "Profile, verified email, connected providers, and organization membership.",
    commandOperations: "Operations",
    commandOperationsBody: "Unread notifications, billing readiness, invoice readiness, and payout status.",
    commandSecurity: "Security",
    commandSecurityBody: "Session fingerprints and revocation controls without exposing raw tokens.",
    commandSignInBody:
      "Use Google, GitHub, or username/email password to unlock identity, sessions, roles, notifications, billing, and payout readiness.",
    commandSignInTitle: "Sign in to unlock the account center.",
    commandWorkspace: "Workspace",
    commandWorkspaceBody: "Team, project, owned-skill, and active-token readiness for real operations.",
    connectedAccounts: "Connected login methods",
    dashboard: "Dashboard",
    dashboardBody: "General command center for cross-role operating proof.",
    developer: "Developer workspace",
    developerBody: "Projects, installs, API keys, runtime tests, billing, team, and webhooks.",
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
    payout: "Payout",
    profile: "Profile",
    projects: "Projects",
    publisher: "Publisher workspace",
    publisherBody: "Upload, review repair, pricing blockers, buyer demand, revenue, and payouts.",
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
          title: "Sign in"
        },
        {
          body: "Return here to check identity, connected providers, sessions, roles, and workspace readiness.",
          href: "/account",
          label: "02",
          title: "Review account readiness"
        },
        {
          body: "Continue to developer, publisher, or operator workspaces only after the role state is clear.",
          href: "/dashboard",
          label: "03",
          title: "Choose the right workspace"
        }
      ],
      body:
        "After sign-in, this page becomes the safe handoff between identity, sessions, roles, workspace readiness, and the role-specific consoles.",
      title: "Start with account access, then choose a workspace."
    },
    team: "Team",
    unread: "Unread notifications",
    workspace: "Workspace readiness",
    yes: "Yes"
  },
  zh: {
    account: "账号",
    accountEmpty: "连接工作区会话后，可以查看资料、组织、账单、提现和通知准备度。",
    activeSessions: "有效会话",
    activeTokens: "有效 token",
    admin: "后台",
    adminBody: "审核、财务、上线就绪、信任、投递和审计运营。",
    available: "可进入",
    billing: "账单",
    commandIdentity: "身份",
    commandIdentityBody: "资料、已验证邮箱、绑定 provider 和组织成员关系。",
    commandOperations: "运营",
    commandOperationsBody: "未读通知、账单准备、发票准备和提现状态。",
    commandSecurity: "安全",
    commandSecurityBody: "会话指纹和撤销控制，不暴露原始 token。",
    commandSignInBody:
      "使用 Google、GitHub，或用户名/邮箱加密码进入后，再查看身份、会话、角色、通知、账单和提现准备度。",
    commandSignInTitle: "登录后解锁账号中心。",
    commandWorkspace: "工作区",
    commandWorkspaceBody: "团队、项目、已拥有技能和有效 token 的运营准备度。",
    connectedAccounts: "已连接登录方式",
    dashboard: "综合工作台",
    dashboardBody: "跨角色运营证据和总览入口。",
    developer: "开发者工作台",
    developerBody: "项目、安装、API Key、运行测试、账单、团队和 Webhook。",
    email: "邮箱",
    empty: "未连接",
    heroBody: "管理 SkillHub 运营背后的身份层：个人资料、组织角色、登录方式、token 安全、通知偏好和工作区准备度。",
    heroEyebrow: "个人中心",
    heroTitle: "你的 SkillHub 账号控制中心。",
    invoiceReady: "发票准备",
    memberSince: "加入时间",
    no: "否",
    notificationPreferences: "通知偏好",
    organization: "组织",
    payout: "提现",
    profile: "个人资料",
    projects: "项目",
    publisher: "发布者工作台",
    publisherBody: "上传、审核修复、定价阻断、买方需求、收入和提现。",
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
          title: "登录账号"
        },
        {
          body: "回到这里检查身份、绑定方式、会话、角色和工作区准备度。",
          href: "/account",
          label: "02",
          title: "检查账号状态"
        },
        {
          body: "确认角色后，再进入开发者、发布者或运营工作台。",
          href: "/dashboard",
          label: "03",
          title: "选择正确工作台"
        }
      ],
      body: "登录后，这里会成为身份、会话、角色、工作区准备度和各角色后台之间的安全交接页。",
      title: "先完成账号访问，再选择工作台。"
    },
    team: "团队",
    unread: "未读通知",
    workspace: "工作区准备度",
    yes: "是"
  }
} as const;

type AccountLabels = (typeof copy)["en"] | (typeof copy)["zh"];

export default async function AccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [account, accountSessions, session, notificationPreferences] = await Promise.all([
    getAccountSummary(),
    getAccountSessions(),
    getWorkspaceSession(),
    getNotificationPreferences()
  ]);
  const signedIn = Boolean(account.profile.userId);
  const workspaceStats = [
    [labels.team, account.workspace.teamMemberCount, Users],
    [labels.projects, account.workspace.projectCount, LayoutDashboard],
    [labels.skills, account.workspace.skillCount, UploadCloud],
    [labels.activeTokens, account.workspace.activeTokenCount, KeyRound]
  ] as const;
  const readiness = [
    [labels.unread, account.workspace.unreadNotifications, Bell],
    [labels.billing, account.workspace.billingProfileComplete ? labels.yes : labels.no, CreditCard],
    [labels.invoiceReady, account.workspace.invoiceReady ? labels.yes : labels.no, ShieldCheck],
    [labels.payout, statusLabel(account.workspace.payoutStatus, locale), Wallet]
  ] as const;

  return (
    <main className="product-shell">
      <SiteHeader active="account" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/account" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <UserCircle size={16} aria-hidden="true" />
            <span>{labels.heroEyebrow}</span>
          </div>
          <h1>{labels.heroTitle}</h1>
          <p>{labels.heroBody}</p>
        </div>
        {!signedIn ? (
          <a className="primary-button primary-button--large" href={localizedHref("/login", locale)}>
            <KeyRound size={17} aria-hidden="true" />
            <span>{labels.signIn}</span>
          </a>
        ) : null}
      </section>

      <AccountCommandStrip account={account} accountSessions={accountSessions} labels={labels} locale={locale} signedIn={signedIn} />

      {!signedIn ? (
        <AccountSignedOutGuide labels={labels} locale={locale} />
      ) : (
        <>
      <ConsoleAccessPanel locale={locale} session={session} variant="compact" />

      <section className="account-layout">
        <div className="account-main">
          <article className="ops-panel account-profile-panel">
            <div className="account-profile-panel__head">
              <div>
                <div className="card-kicker">
                  <UserCircle size={16} aria-hidden="true" />
                  <span>{labels.profile}</span>
                </div>
                <h2>{account.profile.displayName ?? account.profile.email ?? labels.account}</h2>
                <p>{signedIn ? account.profile.email ?? labels.empty : labels.accountEmpty}</p>
              </div>
              <span className={signedIn ? "status-chip status-chip--success" : "status-chip status-chip--neutral"}>
                {signedIn ? account.profile.platformRole : labels.signInRequired}
              </span>
            </div>
            <div className="account-meta-grid">
              <MetaItem label={labels.email} value={account.profile.email ?? labels.empty} />
              <MetaItem label={labels.organization} value={organizationLabel(account, labels.empty)} />
              <MetaItem label={labels.role} value={account.membership?.role ?? labels.empty} />
              <MetaItem label={labels.memberSince} value={formatDate(account.membership?.memberSince, locale)} />
            </div>
          </article>

          <article className="ops-panel account-method-panel">
            <div className="card-kicker">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.connectedAccounts}</span>
            </div>
            <AccountLoginMethodManager locale={locale} methods={account.loginMethods} />
          </article>

          <article className="ops-panel account-workspace-panel">
            <div className="card-kicker">
              <Building2 size={16} aria-hidden="true" />
              <span>{labels.workspace}</span>
            </div>
            <div className="account-stat-grid">
              {workspaceStats.map(([label, value, Icon]) => (
                <div className="account-stat" key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{formatNumber(value, locale)}</strong>
                </div>
              ))}
            </div>
            <div className="account-readiness-grid">
              {readiness.map(([label, value, Icon]) => (
                <div className="account-readiness-item" key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="ops-panel account-shortcut-panel">
            <div className="card-kicker">
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>{labels.shortcuts}</span>
            </div>
            <div className="account-shortcut-grid account-shortcut-grid--cards">
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
        </div>

        <aside className="account-side">
          <SessionStatusPanel locale={locale} session={session} />

          <AccountSessionManager locale={locale} sessions={accountSessions} />

          {signedIn ? (
            <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
          ) : (
            <article className="ops-panel account-security-panel">
              <div className="card-kicker">
                <Bell size={16} aria-hidden="true" />
                <span>{labels.notificationPreferences}</span>
              </div>
              <div className="auth-empty-state">
                <strong>{labels.empty}</strong>
                <span>{labels.accountEmpty}</span>
              </div>
            </article>
          )}
        </aside>
      </section>
        </>
      )}
    </main>
  );
}

function AccountSignedOutGuide({ labels, locale }: { labels: AccountLabels; locale: Locale }) {
  const guide = labels.signedOutGuide;

  return (
    <section className="workspace-locked-panel">
      <article className="ops-panel workspace-locked-panel__card">
        <div className="workspace-locked-panel__main">
          <div className="card-kicker">
            <KeyRound size={16} aria-hidden="true" />
            <span>{guide.eyebrow}</span>
          </div>
          <h2>{guide.title}</h2>
          <p>{guide.body}</p>
          <p className="visually-hidden">{guide.marker}</p>
          <a className="primary-button" href={localizedHref("/login", locale)}>
            <span>{labels.signIn}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="workspace-locked-panel__actions" aria-label={guide.ariaLabel}>
          {guide.actions.map((action, index) => {
            const Icon = [LogIn, UserCircle, FolderPlus][index] ?? LayoutDashboard;

            return (
              <a className="workspace-locked-panel__action" href={localizedHref(action.href, locale)} key={action.title}>
                <Icon size={16} aria-hidden="true" />
                <span>{action.label}</span>
                <strong>{action.title}</strong>
                <small>{action.body}</small>
              </a>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function AccountCommandStrip({
  account,
  accountSessions,
  labels,
  locale,
  signedIn
}: {
  account: AccountSummary;
  accountSessions: AccountSessionRecord[];
  labels: AccountLabels;
  locale: Locale;
  signedIn: boolean;
}) {
  const connectedMethods = account.loginMethods.filter((method) => method.status === "connected").length;
  const configuredMethods = account.loginMethods.filter((method) => method.status === "active" || method.status === "connected").length;
  const activeSessions = accountSessions.filter((session) => session.status === "active").length;
  const workspaceTotal = account.workspace.teamMemberCount + account.workspace.projectCount + account.workspace.skillCount;

  if (!signedIn) {
    return (
      <section className="account-command-strip account-command-strip--signed-out" aria-label={labels.workspace}>
        <article className="account-command-tile account-command-tile--signin">
          <div className="account-command-tile__head">
            <KeyRound size={17} aria-hidden="true" />
            <span>{labels.signInRequired}</span>
          </div>
          <strong>{labels.commandSignInTitle}</strong>
          <small>{labels.accountEmpty}</small>
          <p>{labels.commandSignInBody}</p>
          <a className="primary-button account-command-tile__cta" href={localizedHref("/login", locale)}>
            <KeyRound size={16} aria-hidden="true" />
            <span>{labels.signIn}</span>
          </a>
        </article>
      </section>
    );
  }

  const tiles = [
    {
      body: labels.commandIdentityBody,
      icon: UserCircle,
      label: labels.commandIdentity,
      status: signedIn ? account.profile.platformRole : labels.signInRequired,
      value: account.profile.email ?? labels.empty
    },
    {
      body: labels.commandSecurityBody,
      icon: KeyRound,
      label: labels.commandSecurity,
      status: `${activeSessions} ${labels.activeSessions}`,
      value: signedIn ? `${connectedMethods}/${configuredMethods}` : labels.empty
    },
    {
      body: labels.commandWorkspaceBody,
      icon: Building2,
      label: labels.commandWorkspace,
      status: organizationLabel(account, labels.empty),
      value: formatNumber(workspaceTotal, locale)
    },
    {
      body: labels.commandOperationsBody,
      icon: Bell,
      label: labels.commandOperations,
      status: statusLabel(account.workspace.payoutStatus, locale),
      value: `${formatNumber(account.workspace.unreadNotifications, locale)} ${labels.unread}`
    }
  ] as const;

  return (
    <section className="account-command-strip" aria-label={labels.workspace}>
      {tiles.map((tile) => {
        const Icon = tile.icon;

        return (
          <article className="account-command-tile" key={tile.label}>
            <div className="account-command-tile__head">
              <Icon size={17} aria-hidden="true" />
              <span>{tile.label}</span>
            </div>
            <strong>{tile.value}</strong>
            <small>{tile.status}</small>
            <p>{tile.body}</p>
          </article>
        );
      })}
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
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
  title
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
  const targetHref = state.kind === "blocked" ? "/login" : state.kind === "forbidden" ? "/account" : href;

  return (
    <a className={`account-shortcut-card account-shortcut-card--${state.kind}`} href={localizedHref(targetHref, locale)}>
      <div className="account-shortcut-card__head">
        <Icon size={17} aria-hidden="true" />
        <span className={state.kind === "available" ? "status-chip status-chip--success" : "status-chip status-chip--warning"}>
          {state.label}
        </span>
      </div>
      <strong>{title}</strong>
      <p>{body}</p>
      <span className="account-shortcut-card__action">
        {state.action}
        <ArrowRight size={15} aria-hidden="true" />
      </span>
    </a>
  );
}

function workspaceShortcutState(requiredRoles: string[], session: WorkspaceSession, labels: AccountLabels) {
  if (!session.subject) {
    return {
      action: labels.signIn,
      kind: "blocked" as const,
      label: labels.signInRequired
    };
  }

  if (requiredRoles.length === 0) {
    return {
      action: labels.available,
      kind: "available" as const,
      label: labels.available
    };
  }

  const roleSet = new Set([session.subject.platformRole, ...session.subject.roles].filter(Boolean));
  const hasRole = requiredRoles.some((role) => roleSet.has(role));

  if (!hasRole) {
    return {
      action: labels.reviewAccount,
      kind: "forbidden" as const,
      label: labels.roleRequired
    };
  }

  return {
    action: labels.available,
    kind: "available" as const,
    label: labels.available
  };
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
    dateStyle: "medium"
  }).format(date);
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0
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
    verified: "已验证"
  };

  return labels[value] ?? value.replace(/_/g, " ");
}
