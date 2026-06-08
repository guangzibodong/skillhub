import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  MailCheck,
  Route,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  XCircle
} from "lucide-react";
import { AuthProviderPanel } from "@/components/auth-provider-panel";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders } from "@/lib/account-data";
import { getWorkspaceSession } from "@/lib/auth-session";
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
      "Use your work email to sign in or create a workspace. Google and GitHub appear when configured; team tokens are only for invitations or recovery.",
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
    title: "Sign in to SkillHub.",
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
    body: "使用工作邮箱登录或创建工作区。Google 和 GitHub 配置完成后可用；团队 token 只用于邀请或恢复。",
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
    title: "登录 SkillHub。",
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

      <section className="login-screen">
        <div className="login-screen__copy">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.body}</p>
          <div className="login-screen__links">
            <a className="ghost-button ghost-button--inline" href={localizedHref("/admin", locale)}>
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{labels.adminShortcut}</span>
            </a>
          </div>
          <p className="login-screen__admin-note">{labels.adminShortcutBody}</p>
        </div>

        <div className="login-auth-stack">
          {notice ? (
            <section className={`auth-callback-notice auth-callback-notice--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
              {notice.kind === "success" ? <CheckCircle2 size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
              <div>
                <strong>{notice.title}</strong>
                <span>{notice.message}</span>
              </div>
            </section>
          ) : null}

          <AuthProviderPanel apiUrl={apiUrl} locale={locale} providers={providers} />

          <div className="login-divider">
            <MailCheck size={15} aria-hidden="true" />
            <span>{labels.emailCode}</span>
          </div>

          <WorkspaceSignupForm locale={locale} />

          {session.subject ? <SessionStatusPanel locale={locale} session={session} /> : null}

          <details className="login-recovery-details">
            <summary>
              <KeyRound size={15} aria-hidden="true" />
              <span>{labels.tokenFallback}</span>
            </summary>
            <p>{labels.tokenFallbackBody}</p>
            <SessionLoginForm locale={locale} />
          </details>

          <div className="login-secondary-links">
            <a className="login-account-link" href={localizedHref("/account", locale)}>
              <UserCircle size={17} aria-hidden="true" />
              <span>{labels.account}</span>
            </a>
            <a className="login-account-link" href={localizedHref("/admin", locale)}>
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{labels.adminShortcut}</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
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
