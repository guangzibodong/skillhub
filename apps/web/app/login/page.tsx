import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  Github,
  KeyRound,
  MailCheck,
  Route,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AuthProviderPanel } from "@/components/auth-provider-panel";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders, type AuthProviderStatus } from "@/lib/account-data";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account center",
    active: "active",
    adminShortcut: "Admin login",
    adminShortcutBody:
      "Platform operators use this same login page first, then open /admin with reviewer, finance, support, admin, or super_admin access.",
    body:
      "Enter with email code, Google, GitHub, or a limited token fallback. After access, SkillHub routes each user into role-aware developer, publisher, and admin workspaces.",
    connected: "Connected",
    configurationRequired: "Configuration required",
    emailCode: "Email code",
    emailCodeBody: "Required for public launch. Users verify first; sessions are issued only after code verification.",
    eyebrow: "Account access",
    github: "GitHub OAuth",
    google: "Google OAuth",
    missing: "missing",
    notConnected: "Not connected",
    oauthBody: "Provider buttons become live redirects only when callback, client id, secret, and state secret are configured.",
    oauthConnectedTitle: "OAuth connected",
    oauthConnected: "OAuth login completed. Your browser session is now connected to the workspace.",
    oauthError: "OAuth login needs attention.",
    oauthErrorFallback: "The provider callback could not complete. Check provider configuration and try again.",
    ready: "ready",
    routesTitle: "After login",
    session: "Current session",
    sessionBody: "Browser sessions are scoped to one user and organization; raw tokens stay hidden after first reveal.",
    title: "Sign in, register, and enter the operating platform.",
    tokenFallback: "Token fallback",
    tokenFallbackBody: "Reserved for bootstrap, invitations, and recovery. Normal users should use email or configured OAuth.",
    workspaceHint: "No shared backend password",
    routes: [
      {
        body: "Profile, connected identities, session fingerprints, roles, and workspace readiness.",
        href: "/account",
        icon: UserCircle,
        label: "Account",
        role: "all users"
      },
      {
        body: "Projects, installs, API keys, policies, runtime tests, billing, team, and webhooks.",
        href: "/developer",
        icon: Route,
        label: "Developer",
        role: "developer / owner"
      },
      {
        body: "Upload, review repair, pricing blockers, buyer demand, feedback, revenue, and payout readiness.",
        href: "/publisher",
        icon: UploadCloud,
        label: "Publisher",
        role: "publisher / owner"
      },
      {
        body: "Launch readiness, review queues, trust reports, incidents, ledger, payouts, delivery, and audit.",
        href: "/admin",
        icon: ShieldCheck,
        label: "Admin",
        role: "reviewer / finance / admin"
      }
    ]
  },
  zh: {
    account: "个人中心",
    active: "可用",
    adminShortcut: "管理员登录",
    adminShortcutBody: "平台运营先从本页登录，再用审核、财务、客服、管理员或超级管理员角色进入 /admin。",
    body: "通过邮箱验证码、Google、GitHub 或受限 token 兜底进入。登录后，SkillHub 会按角色把用户带到开发者、发布者和平台运营工作台。",
    connected: "已连接",
    configurationRequired: "待配置",
    emailCode: "邮箱验证码",
    emailCodeBody: "公开上线必须可用。用户先验证邮箱，验证码通过后才会签发会话。",
    eyebrow: "账号入口",
    github: "GitHub OAuth",
    google: "Google OAuth",
    missing: "缺少",
    notConnected: "未连接",
    oauthBody: "只有 callback、client id、secret 和 state secret 配齐后，Provider 按钮才会变成真实跳转。",
    oauthConnectedTitle: "OAuth 已连接",
    oauthConnected: "OAuth 登录已完成，浏览器会话已连接到工作区。",
    oauthError: "OAuth 登录需要处理",
    oauthErrorFallback: "Provider 回调没有完成，请检查配置后重试。",
    ready: "就绪",
    routesTitle: "登录后去哪里",
    session: "当前会话",
    sessionBody: "浏览器会话绑定到一个用户和组织；原始 token 只首次展示，之后保持隐藏。",
    title: "登录、注册，并进入真正的运营平台。",
    tokenFallback: "Token 兜底",
    tokenFallbackBody: "仅用于初始化、团队邀请和运营恢复。正常用户应使用邮箱或已配置的 OAuth。",
    workspaceHint: "没有共享后台密码",
    routes: [
      {
        body: "资料、绑定身份、会话指纹、角色和工作区准备度。",
        href: "/account",
        icon: UserCircle,
        label: "账号",
        role: "所有用户"
      },
      {
        body: "项目、安装、API Key、策略、运行测试、账单、团队和 Webhook。",
        href: "/developer",
        icon: Route,
        label: "开发者",
        role: "开发者 / 负责人"
      },
      {
        body: "上传、审核修复、定价阻断、买方需求、反馈、收入和提现准备。",
        href: "/publisher",
        icon: UploadCloud,
        label: "发布者",
        role: "发布者 / 负责人"
      },
      {
        body: "上线就绪、审核队列、信任举报、事故、账本、提现、投递和审计。",
        href: "/admin",
        icon: ShieldCheck,
        label: "后台",
        role: "审核 / 财务 / 管理员"
      }
    ]
  }
} as const;

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [providers, session] = await Promise.all([getAuthProviders(), getWorkspaceSession()]);
  const notice = oauthNotice(params, labels);

  return (
    <main className="product-shell">
      <SiteHeader active="dashboard" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/login" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <KeyRound size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
        </div>
        <div className="page-hero__actions">
          <a className="primary-button primary-button--large" href={localizedHref("/admin", locale)}>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>{labels.adminShortcut}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/account", locale)}>
            <UserCircle size={17} aria-hidden="true" />
            <span>{labels.account}</span>
          </a>
        </div>
      </section>

      {notice ? (
        <section className={`auth-callback-notice auth-callback-notice--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
          {notice.kind === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
          <div>
            <strong>{notice.title}</strong>
            <span>{notice.message}</span>
          </div>
        </section>
      ) : null}

      <LoginEntryBrief locale={locale} providers={providers} session={session} />

      <ConsoleAccessPanel locale={locale} session={session} variant="compact" />

      <section className="auth-layout auth-layout--signup">
        <div className="auth-main-stack">
          <AuthProviderPanel apiUrl={apiUrl} locale={locale} providers={providers} />
          <WorkspaceSignupForm locale={locale} />
        </div>
        <div className="auth-side-stack">
          <SessionLoginForm locale={locale} />
          <SessionStatusPanel locale={locale} session={session} />
        </div>
      </section>
    </main>
  );
}

function LoginEntryBrief({ locale, providers, session }: { locale: Locale; providers: AuthProviderStatus[]; session: WorkspaceSession }) {
  const labels = copy[locale];
  const providerById = new Map(providers.map((provider) => [provider.provider, provider]));
  const emailProvider = providerById.get("email");
  const googleProvider = providerById.get("google");
  const githubProvider = providerById.get("github");
  const tokenProvider = providerById.get("token");
  const oauthProviders = [googleProvider, githubProvider].filter(Boolean) as AuthProviderStatus[];
  const activeOauthCount = oauthProviders.filter((provider) => provider.status === "active" || provider.status === "connected").length;
  const missingOauthCount = oauthProviders.reduce((count, provider) => count + (provider.missingConfiguration?.length ?? 0), 0);

  const tiles: LoginReadinessTileProps[] = [
    {
      body: labels.emailCodeBody,
      icon: MailCheck,
      state: emailProvider?.status === "active" || emailProvider?.status === "connected" ? "ready" : "warning",
      title: labels.emailCode,
      value: statusText(emailProvider?.status, locale)
    },
    {
      body: labels.oauthBody,
      icon: Chrome,
      state: activeOauthCount === oauthProviders.length && oauthProviders.length > 0 ? "ready" : "warning",
      title: `${labels.google} / ${labels.github}`,
      value: missingOauthCount ? `${missingOauthCount} ${labels.missing}` : `${activeOauthCount}/2 ${labels.ready}`
    },
    {
      body: labels.tokenFallbackBody,
      icon: KeyRound,
      state: tokenProvider?.status === "active" ? "ready" : "neutral",
      title: labels.tokenFallback,
      value: statusText(tokenProvider?.status, locale)
    },
    {
      body: labels.sessionBody,
      icon: ShieldCheck,
      state: session.subject ? "ready" : "neutral",
      title: labels.session,
      value: session.subject ? labels.connected : labels.notConnected
    }
  ];

  return (
    <section className="login-entry-brief" aria-label={labels.workspaceHint}>
      <div className="login-readiness-grid">
        {tiles.map((tile) => (
          <LoginReadinessTile key={tile.title} {...tile} />
        ))}
      </div>
      <article className="login-route-board" id="admin-entry">
        <div className="login-route-board__head">
          <div className="card-kicker">
            <Route size={16} aria-hidden="true" />
            <span>{labels.routesTitle}</span>
          </div>
          <span className="status-chip status-chip--neutral">{labels.workspaceHint}</span>
        </div>
        <div className="login-route-list">
          {labels.routes.map((route) => (
            <LoginRouteCard key={route.href} locale={locale} route={route} />
          ))}
        </div>
        <p className="login-route-board__note">{labels.adminShortcutBody}</p>
      </article>
    </section>
  );
}

type LoginReadinessTileProps = {
  body: string;
  icon: LucideIcon;
  state: "neutral" | "ready" | "warning";
  title: string;
  value: string;
};

function LoginReadinessTile({ body, icon: Icon, state, title, value }: LoginReadinessTileProps) {
  return (
    <article className={`login-readiness-tile login-readiness-tile--${state}`}>
      <div className="login-readiness-tile__head">
        <Icon size={17} aria-hidden="true" />
        <span>{value}</span>
      </div>
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  );
}

function LoginRouteCard({
  locale,
  route
}: {
  locale: Locale;
  route: {
    body: string;
    href: string;
    icon: LucideIcon;
    label: string;
    role: string;
  };
}) {
  const Icon = route.icon;

  return (
    <a className="login-route-card" href={localizedHref(route.href, locale)}>
      <Icon size={17} aria-hidden="true" />
      <span>
        <strong>{route.label}</strong>
        <small>{route.role}</small>
      </span>
      <p>{route.body}</p>
      <ArrowRight size={15} aria-hidden="true" />
    </a>
  );
}

function statusText(status: AuthProviderStatus["status"] | undefined, locale: Locale) {
  if (locale === "zh") {
    return {
      active: "可用",
      configuration_required: "待配置",
      connected: "已连接",
      deferred: "待回调"
    }[status ?? "deferred"];
  }

  return {
    active: "Active",
    configuration_required: "Configuration required",
    connected: "Connected",
    deferred: "Callback pending"
  }[status ?? "deferred"];
}

function oauthNotice(params: Record<string, string | string[] | undefined>, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  const status = firstParam(params.oauth);

  if (status === "connected") {
    return {
      kind: "success" as const,
      message: labels.oauthConnected,
      title: labels.oauthConnectedTitle
    };
  }

  if (status === "error") {
    return {
      kind: "error" as const,
      message: safeOAuthErrorMessage(params, labels),
      title: labels.oauthError
    };
  }

  return null;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeOAuthErrorMessage(params: Record<string, string | string[] | undefined>, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  if (process.env.NEXT_PUBLIC_SKILLHUB_SHOW_OAUTH_DEBUG_ERROR === "true") {
    return firstParam(params.message)?.slice(0, 160) || labels.oauthErrorFallback;
  }

  return labels.oauthErrorFallback;
}
