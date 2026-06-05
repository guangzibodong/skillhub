import {
  Bell,
  Building2,
  Chrome,
  CreditCard,
  Github,
  KeyRound,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  Users,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { getAccountSummary, type AccountSummary, type AuthProviderStatus } from "@/lib/account-data";
import { getWorkspaceSession } from "@/lib/auth-session";
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
    activeTokens: "Active tokens",
    admin: "Admin",
    billing: "Billing",
    connectedAccounts: "Connected login methods",
    created: "Created",
    dashboard: "Dashboard",
    developer: "Developer workspace",
    email: "Email",
    empty: "Not connected",
    heroBody:
      "Manage the identity layer behind SkillHub operations: profile, organization role, login methods, token security, notification preferences, and workspace readiness.",
    heroEyebrow: "Personal center",
    heroTitle: "Your SkillHub account command center.",
    invoiceReady: "Invoice ready",
    lastUsed: "Last used",
    memberSince: "Member since",
    no: "No",
    notificationPreferences: "Notification preferences",
    organization: "Organization",
    payout: "Payout",
    profile: "Profile",
    projects: "Projects",
    publisher: "Publisher workspace",
    publisherStatus: "Publisher",
    role: "Role",
    security: "Session security",
    signIn: "Sign in",
    skills: "Skills",
    scopes: "Scopes",
    team: "Team",
    token: "Token",
    unread: "Unread notifications",
    workspace: "Workspace readiness",
    yes: "Yes"
  },
  zh: {
    account: "账号",
    accountEmpty: "连接工作区会话后，可查看资料、组织、账单、提现和通知准备度。",
    activeTokens: "有效 token",
    admin: "后台",
    billing: "账单",
    connectedAccounts: "已建模登录方式",
    created: "创建时间",
    dashboard: "综合工作台",
    developer: "开发者工作台",
    email: "邮箱",
    empty: "未连接",
    heroBody: "管理 SkillHub 运营背后的身份层：个人资料、组织角色、登录方式、token 安全、通知偏好和工作区准备度。",
    heroEyebrow: "个人中心",
    heroTitle: "你的 SkillHub 账号控制中心。",
    invoiceReady: "发票准备",
    lastUsed: "最后使用",
    memberSince: "加入时间",
    no: "否",
    notificationPreferences: "通知偏好",
    organization: "组织",
    payout: "提现",
    profile: "个人资料",
    projects: "项目",
    publisher: "发布者工作台",
    publisherStatus: "发布者",
    role: "角色",
    security: "会话安全",
    signIn: "去登录",
    skills: "技能",
    scopes: "权限范围",
    team: "团队",
    token: "Token",
    unread: "未读通知",
    workspace: "工作区准备度",
    yes: "是"
  }
} as const;

export default async function AccountPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [account, session, notificationPreferences] = await Promise.all([
    getAccountSummary(),
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
              <span className="status-chip status-chip--success">{account.profile.platformRole}</span>
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
            <div className="account-method-grid">
              {account.loginMethods.map((method) => (
                <LoginMethodCard key={method.provider} locale={locale} method={method} />
              ))}
            </div>
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
              <span>{locale === "zh" ? "工作入口" : "Workspace shortcuts"}</span>
            </div>
            <div className="account-shortcut-grid">
              <Shortcut href="/developer" icon={LayoutDashboard} label={labels.developer} locale={locale} />
              <Shortcut href="/publisher" icon={UploadCloud} label={labels.publisher} locale={locale} />
              <Shortcut href="/dashboard" icon={Building2} label={labels.dashboard} locale={locale} />
              <Shortcut href="/admin" icon={ShieldCheck} label={labels.admin} locale={locale} />
            </div>
          </article>
        </div>

        <aside className="account-side">
          <SessionStatusPanel locale={locale} session={session} />

          <article className="ops-panel account-security-panel">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.security}</span>
            </div>
            <div className="account-meta-grid account-meta-grid--single">
              <MetaItem label={labels.token} value={account.session ? `${account.session.tokenPrefix}...${account.session.tokenLast4}` : labels.empty} />
              <MetaItem label={labels.created} value={formatDate(account.session?.createdAt, locale)} />
              <MetaItem label={labels.lastUsed} value={formatDate(account.session?.lastUsedAt, locale)} />
              <MetaItem label={labels.scopes} value={account.session?.scopes?.length ? account.session.scopes.join(" / ") : statusLabel("default", locale)} />
            </div>
          </article>

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
    </main>
  );
}

function LoginMethodCard({ locale, method }: { locale: Locale; method: AuthProviderStatus }) {
  const Icon = method.provider === "github" ? Github : method.provider === "google" ? Chrome : method.provider === "email" ? Mail : KeyRound;
  const statusLabel = statusText(method.status, locale);

  return (
    <div className={`account-method-card account-method-card--${method.provider}`}>
      <div className="account-method-card__icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <strong>{providerLabel(method, locale)}</strong>
      <span className={`status-chip status-chip--${method.status === "configuration_required" ? "warning" : method.status === "connected" ? "success" : "neutral"}`}>
        {statusLabel}
      </span>
    </div>
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

function Shortcut({ href, icon: Icon, label, locale }: { href: string; icon: LucideIcon; label: string; locale: Locale }) {
  return (
    <a className="secondary-button account-shortcut" href={localizedHref(href, locale)}>
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
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

function statusText(status: AuthProviderStatus["status"], locale: Locale) {
  if (locale === "zh") {
    return {
      active: "可用",
      configuration_required: "待配置",
      connected: "已连接",
      deferred: "待回调"
    }[status];
  }

  return {
    active: "Active",
    configuration_required: "Configuration required",
    connected: "Connected",
    deferred: "Callback pending"
  }[status];
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

function providerLabel(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.label;
  }

  if (provider.provider === "email") {
    return "邮箱注册";
  }

  if (provider.provider === "token") {
    return "用户 token";
  }

  return provider.label;
}
