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
import { AppShell } from "@/components/app-shell";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import {
  getAccountSessions,
  getAccountSummary,
  type AccountSessionRecord,
  type AccountSummary
} from "@/lib/account-data";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { getNotificationPreferences } from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account",
    accountEmpty: "Connect a workspace session to see profile, organization, roles, sessions, and notification readiness. Billing and payout readiness appear only when paid marketplace preview permissions apply.",
    activeSessions: "Active sessions",
    activeTokens: "Active tokens",
    admin: "Admin",
    adminBody: "Review, finance, launch readiness, trust, delivery, and audit operations.",
    available: "Available",
    billing: "Billing",
    commandIdentity: "Identity",
    commandIdentityBody: "Profile, verified email, connected providers, and organization membership.",
    commandOperations: "Operations",
    commandOperationsBody: "Unread notifications, session activity, and role-gated readiness. Billing and payout states appear only for paid marketplace preview permissions.",
    commandSecurity: "Security",
    commandSecurityBody: "Session fingerprints and revocation controls without exposing raw tokens.",
    commandSignInBody:
      "Use Google, GitHub, or username/email password to unlock identity, sessions, roles, and notifications. Paid readiness appears only when your role allows it.",
    commandSignInTitle: "Sign in to unlock the account center.",
    commandWorkspace: "Workspace",
    commandWorkspaceBody: "Team, project, owned-skill, and active-token readiness for real operations.",
    connectedAccounts: "Connected login methods",
    dashboard: "Dashboard",
    dashboardBody: "General command center for cross-role operating proof.",
    developer: "Developer workspace",
    developerBody: "Projects, verified-skill adoption, API keys, login-gated runtime tests, team access, and webhooks.",
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
    payout: "Paid preview",
    profile: "Profile",
    projects: "Projects",
    publisher: "Publisher workspace",
    publisherBody: "Upload, review repair, buyer demand, paid-readiness metadata, and prelaunch finance state.",
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
    accountEmpty: "连接工作区会话后，可查看资料、组织、角色、会话和通知准备度。账单和提现准备度仅在具备付费市场预览权限时显示。",
    activeSessions: "有效会话",
    activeTokens: "有效 token",
    admin: "后台",
    adminBody: "审核、财务、上线就绪、信任、投递和审计运营。",
    available: "可进入",
    billing: "账单",
    commandIdentity: "身份",
    commandIdentityBody: "资料、已验证邮箱、绑定 provider 和组织成员关系。",
    commandOperations: "运营",
    commandOperationsBody: "未读通知、会话活动和按角色开放的准备状态。账单和提现仅在付费市场预览权限下显示。",
    commandSecurity: "安全",
    commandSecurityBody: "会话指纹和撤销控制，不暴露原始 token。",
    commandSignInBody:
      "使用 Google、GitHub，或用户名/邮箱加密码进入后，再查看身份、会话、角色和通知。付费准备状态仅在角色允许时显示。",
    commandSignInTitle: "登录后解锁账号中心。",
    commandWorkspace: "工作区",
    commandWorkspaceBody: "团队、项目、已拥有技能和有效 token 的运营准备度。",
    connectedAccounts: "已连接登录方式",
    dashboard: "综合工作台",
    dashboardBody: "跨角色运营证据和总览入口。",
    developer: "开发者工作台",
    developerBody: "项目、已验证技能采用、API Key、登录门控运行测试、团队权限和 Webhook。",
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
    payout: "付费预览",
    profile: "个人资料",
    projects: "项目",
    publisher: "发布者工作台",
    publisherBody: "上传、审核修复、买方需求、付费准备元数据和预发布财务状态。",
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
  const labels = copy[locale];
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
    <AppShell active="account" locale={locale}>
      <section className="section">
        <div className="section-inner flex flex-col gap-4">
          <div className="eyebrow">
            <UserCircle size={16} aria-hidden="true" />
            <span>{labels.heroEyebrow}</span>
          </div>
          <h1 className="heading-xl">{labels.heroTitle}</h1>
          <p className="body-text text-[#999]">{labels.heroBody}</p>
        </div>
        {!signedIn ? (
          <div className="section-inner mt-6">
            <a className="btn-primary btn-primary--large inline-flex items-center gap-2" href={localizedHref("/login", locale)}>
              <KeyRound size={17} aria-hidden="true" />
              <span>{labels.signIn}</span>
            </a>
          </div>
        ) : null}
      </section>

      <AccountCommandStrip account={account} accountSessions={accountSessions} labels={labels} locale={locale} signedIn={signedIn} />

      {!signedIn ? (
        <AccountSignedOutGuide labels={labels} locale={locale} />
      ) : (
        <>
      <ConsoleAccessPanel locale={locale} session={session} variant="compact" />

      <section className="section">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-6">
            <article className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="eyebrow">
                    <UserCircle size={16} aria-hidden="true" />
                    <span>{labels.profile}</span>
                  </div>
                  <h2 className="heading-md">{account.profile.displayName ?? account.profile.email ?? labels.account}</h2>
                  <p className="body-text-sm text-[#999]">{signedIn ? account.profile.email ?? labels.empty : labels.accountEmpty}</p>
                </div>
                <span className={signedIn ? "pill pill--success" : "pill pill--neutral"}>
                  {signedIn ? account.profile.platformRole : labels.signInRequired}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetaItem label={labels.email} value={account.profile.email ?? labels.empty} />
                <MetaItem label={labels.organization} value={organizationLabel(account, labels.empty)} />
                <MetaItem label={labels.role} value={account.membership?.role ?? labels.empty} />
                <MetaItem label={labels.memberSince} value={formatDate(account.membership?.memberSince, locale)} />
              </div>
            </article>

            <article className="card p-6">
              <div className="eyebrow mb-4">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.connectedAccounts}</span>
              </div>
              <AccountLoginMethodManager locale={locale} methods={account.loginMethods} />
            </article>

            <article className="card p-6">
              <div className="eyebrow mb-4">
                <Building2 size={16} aria-hidden="true" />
                <span>{labels.workspace}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {workspaceStats.map(([label, value, Icon]) => (
                  <div className="stat-card" key={label}>
                    <Icon size={16} aria-hidden="true" />
                    <span className="body-text-sm text-[#999]">{label}</span>
                    <strong className="heading-sm text-white">{formatNumber(value, locale)}</strong>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {readiness.map(([label, value, Icon]) => (
                  <div className="stat-card" key={label}>
                    <Icon size={16} aria-hidden="true" />
                    <span className="body-text-sm text-[#999]">{label}</span>
                    <strong className="heading-sm text-white">{String(value)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="card p-6">
              <div className="eyebrow mb-4">
                <LayoutDashboard size={16} aria-hidden="true" />
                <span>{labels.shortcuts}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <aside className="flex flex-col gap-6">
            <SessionStatusPanel locale={locale} session={session} />

            <AccountSessionManager locale={locale} sessions={accountSessions} />

            {signedIn ? (
              <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
            ) : (
              <article className="card p-6">
                <div className="eyebrow mb-4">
                  <Bell size={16} aria-hidden="true" />
                  <span>{labels.notificationPreferences}</span>
                </div>
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <strong className="text-white">{labels.empty}</strong>
                  <span className="body-text-sm text-[#666]">{labels.accountEmpty}</span>
                </div>
              </article>
            )}
          </aside>
        </div>
      </section>
        </>
      )}
    </AppShell>
  );
}

function AccountSignedOutGuide({ labels, locale }: { labels: AccountLabels; locale: Locale }) {
  const guide = labels.signedOutGuide;

  return (
    <section className="section">
      <div className="section-inner">
        <article className="card p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
            <div className="flex flex-col gap-4">
              <div className="eyebrow">
                <KeyRound size={16} aria-hidden="true" />
                <span>{guide.eyebrow}</span>
              </div>
              <h2 className="heading-lg">{guide.title}</h2>
              <p className="body-text text-[#999]">{guide.body}</p>
              <p className="sr-only">{guide.marker}</p>
              <a className="btn-primary inline-flex items-center gap-2 w-fit mt-2" href={localizedHref("/login", locale)}>
                <span>{labels.signIn}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="flex flex-col gap-4" aria-label={guide.ariaLabel}>
              {guide.actions.map((action, index) => {
                const Icon = [LogIn, UserCircle, FolderPlus][index] ?? LayoutDashboard;

                return (
                  <a className="card card--compact flex items-start gap-4 p-4 hover:border-[#7fee64] transition-colors" href={localizedHref(action.href, locale)} key={action.title}>
                    <Icon size={16} aria-hidden="true" className="text-[#7fee64] mt-1 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <span className="body-text-sm text-[#666]">{action.label}</span>
                      <strong className="text-white">{action.title}</strong>
                      <small className="body-text-sm text-[#999]">{action.body}</small>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </article>
      </div>
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
      <section className="section" aria-label={labels.workspace}>
        <div className="section-inner">
          <article className="card p-6 border-[#7fee64]/30">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound size={17} aria-hidden="true" className="text-[#7fee64]" />
              <span className="pill pill--warning">{labels.signInRequired}</span>
            </div>
            <strong className="heading-sm text-white block mb-2">{labels.commandSignInTitle}</strong>
            <small className="body-text-sm text-[#666] block mb-2">{labels.accountEmpty}</small>
            <p className="body-text-sm text-[#999] mb-4">{labels.commandSignInBody}</p>
            <a className="btn-primary inline-flex items-center gap-2" href={localizedHref("/login", locale)}>
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.signIn}</span>
            </a>
          </article>
        </div>
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
    <section className="section" aria-label={labels.workspace}>
      <div className="section-inner grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <article className="card card--compact p-5" key={tile.label}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={17} aria-hidden="true" className="text-[#7fee64]" />
                <span className="body-text-sm text-[#666]">{tile.label}</span>
              </div>
              <strong className="heading-sm text-white block mb-1">{tile.value}</strong>
              <small className="body-text-sm text-[#525252] block mb-2">{tile.status}</small>
              <p className="body-text-sm text-[#999]">{tile.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
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
    <a className="card card--compact flex flex-col gap-3 p-5 hover:border-[#7fee64] transition-colors" href={localizedHref(targetHref, locale)}>
      <div className="flex items-center justify-between">
        <Icon size={17} aria-hidden="true" className="text-[#7fee64]" />
        <span className={state.kind === "available" ? "pill pill--success" : "pill pill--warning"}>
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