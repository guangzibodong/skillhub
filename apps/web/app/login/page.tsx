import type { CSSProperties } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircuitBoard,
  Globe2,
  Grid2X2,
  KeyRound,
  LogOut,
  MailCheck,
  Network,
  ShieldCheck,
  UserCircle,
  UserRound,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { AuthProviderPanel } from "@/components/auth-provider-panel";
import { SessionLoginForm } from "@/components/session-login-form";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders } from "@/lib/account-data";
import { signOutAction } from "@/lib/auth-actions";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    account: "Account center",
    accountFallback: "SkillHub account",
    body:
      "Continue development, collaboration, protected tools, skills, and workspace data from one secure entry point.",
    emailCode: "Email and password access",
    emailCollapsedAction: "Use email sign-in",
    emailCollapsedBody: "Open this when you need username, email, password, or a new workspace registration.",
    emailCollapsedTitle: "Email password sign-in",
    environment: "Environment fallback",
    eyebrow: "Developer Preview",
    footerCopyright: "© 2026 SkillHub. All rights reserved.",
    footerPrivacy: "Privacy",
    footerSecurity: "Security",
    footerStatus: "System status",
    footerTerms: "Terms",
    heroSignedInPrefix: "SkillHub",
    heroSignedInSuffix: "workspace is ready",
    heroTitlePrefix: "Sign in to",
    heroTitleSuffix: "workspace",
    methodSubtitle:
      "Use OAuth when possible, or register with username, email, and password below.",
    oauthConnectedTitle: "OAuth connected",
    oauthConnected:
      "OAuth login completed. Your browser session is now connected to the workspace.",
    oauthError: "OAuth login needs attention.",
    oauthErrorFallback:
      "The provider callback could not complete. Check provider configuration and try again.",
    recoveryBody:
      "Use this only when a SkillHub administrator or invite flow gave you a one-time recovery or invitation token.",
    recoveryTitle: "Invite or recovery token (optional)",
    role: "Role",
    secureLogin: "Secure login",
    secureLoginBody: "Layered protection and encrypted transport",
    sessionActive: "Browser session connected",
    sessionBody:
      "Your browser already has an active SkillHub session. Continue by role, review your account, or sign out before switching users.",
    sessionTitle: "Session and account",
    signOut: "Sign out",
    signedInEyebrow: "Signed-in account",
    status: "Status",
    switchAccount: "Switch account or sign in again",
    switchAccountBody:
      "Use the options below only when you need to connect a different Google, GitHub, password, or recovery-token session.",
    title: "Sign in to SkillHub.",
    trustPreview: "Developer Preview",
    trustPreviewBody: "Early-access features stay clearly labeled",
    trustSession: "Session state connected",
    trustSessionBody: "This device keeps the current sign-in state",
    workspace: "Enter workspace",
  },
  zh: {
    account: "账户中心",
    accountFallback: "SkillHub 账户",
    body: "继续你的开发与协作，访问受保护的工具、技能与数据。一切已就绪，开启高效的构建体验。",
    emailCode: "邮箱密码登录",
    emailCollapsedAction: "使用邮箱登录",
    emailCollapsedBody: "需要用户名、邮箱、密码登录，或注册新的工作区时，在这里展开。",
    emailCollapsedTitle: "邮箱密码登录",
    environment: "环境变量兜底",
    eyebrow: "开发者预览版",
    footerCopyright: "© 2026 SkillHub. All rights reserved.",
    footerPrivacy: "隐私政策",
    footerSecurity: "安全",
    footerStatus: "系统状态",
    footerTerms: "服务条款",
    heroSignedInPrefix: "已登录",
    heroSignedInSuffix: "工作区",
    heroTitlePrefix: "登录",
    heroTitleSuffix: "工作区",
    methodSubtitle: "优先使用 OAuth 安全登录；也可以使用用户名、邮箱和密码完成登录或注册。",
    oauthConnectedTitle: "OAuth 已连接",
    oauthConnected: "OAuth 登录已完成，浏览器会话已连接到工作区。",
    oauthError: "OAuth 登录需要处理",
    oauthErrorFallback: "Provider 回调没有完成，请检查配置后重试。",
    recoveryBody:
      "仅当 SkillHub 管理员或邀请流程提供一次性邀请 / 恢复令牌时使用。",
    recoveryTitle: "邀请码 / 恢复令牌（可选）",
    role: "角色",
    secureLogin: "安全登录",
    secureLoginBody: "多重防护与加密传输",
    sessionActive: "浏览器会话已连接",
    sessionBody:
      "当前浏览器已连接 SkillHub 工作区。你可以按角色进入工作区、查看账户中心，或退出后切换用户。",
    sessionTitle: "会话与账户",
    signOut: "退出登录",
    signedInEyebrow: "已登录账号",
    status: "状态",
    switchAccount: "切换账号或重新登录",
    switchAccountBody:
      "只有需要更换 Google、GitHub、账号密码或恢复令牌会话时，才使用下方入口。",
    title: "登录 SkillHub。",
    trustPreview: "Developer Preview",
    trustPreviewBody: "抢先体验最新功能",
    trustSession: "浏览器会话已连接",
    trustSessionBody: "本设备信任登录状态",
    workspace: "进入工作区",
  },
} as const;

type LoginCopy = {
  [Key in keyof (typeof copy)["en"]]: string;
};

const neuralNodes = [
  ["12%", "28%", "5px", "0s"],
  ["22%", "18%", "7px", "-1.4s"],
  ["36%", "29%", "5px", "-0.4s"],
  ["50%", "17%", "6px", "-2.1s"],
  ["64%", "28%", "5px", "-0.8s"],
  ["78%", "19%", "7px", "-2.7s"],
  ["90%", "34%", "5px", "-1.9s"],
  ["16%", "50%", "6px", "-2.8s"],
  ["30%", "55%", "5px", "-1s"],
  ["44%", "44%", "8px", "-2.5s"],
  ["58%", "57%", "5px", "-1.7s"],
  ["72%", "47%", "6px", "-3.1s"],
  ["86%", "62%", "5px", "-0.9s"],
  ["12%", "76%", "6px", "-2.2s"],
  ["27%", "69%", "5px", "-0.7s"],
  ["42%", "80%", "7px", "-3.4s"],
  ["55%", "70%", "5px", "-1.2s"],
  ["70%", "82%", "6px", "-2.9s"],
  ["84%", "74%", "5px", "-1.6s"],
] as const;

const neuralLinks = [
  ["12%", "28%", "148px", "-24deg", "0s"],
  ["22%", "18%", "162px", "24deg", "-1.5s"],
  ["36%", "29%", "142px", "-28deg", "-0.6s"],
  ["50%", "17%", "156px", "24deg", "-2.3s"],
  ["64%", "28%", "138px", "-24deg", "-1.1s"],
  ["16%", "50%", "144px", "12deg", "-1s"],
  ["30%", "55%", "134px", "-22deg", "-2.7s"],
  ["44%", "44%", "146px", "28deg", "-1.8s"],
  ["58%", "57%", "128px", "-20deg", "-3.1s"],
  ["72%", "47%", "118px", "28deg", "-2s"],
  ["12%", "76%", "150px", "-18deg", "-2.1s"],
  ["27%", "69%", "142px", "18deg", "-0.9s"],
  ["42%", "80%", "130px", "-24deg", "-3.4s"],
  ["55%", "70%", "144px", "24deg", "-1.2s"],
  ["70%", "82%", "110px", "-22deg", "-2.6s"],
] as const;

type NeuralNodeStyle = CSSProperties & {
  "--node-delay": string;
  "--node-size": string;
  "--node-x": string;
  "--node-y": string;
};

type NeuralLinkStyle = CSSProperties & {
  "--link-delay": string;
  "--link-length": string;
  "--link-rotate": string;
  "--link-x": string;
  "--link-y": string;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const returnTo = getSafeReturnTo(params.returnTo, locale);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [providers, session] = await Promise.all([
    getAuthProviders(),
    getWorkspaceSession(),
  ]);
  const notice = oauthNotice(params, labels);
  const isSignedIn = Boolean(session.subject);

  return (
    <main className="product-shell login-product-shell">
      <SiteHeader
        active="dashboard"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/login"
      />

      <section
        className={
          isSignedIn
            ? "login-workspace login-workspace--signed-in"
            : "login-workspace"
        }
      >
        <LoginWorkspaceHero isSignedIn={isSignedIn} labels={labels} />

        <div className="login-panel-stack">
          {notice ? (
            <section
              className={`auth-callback-notice auth-callback-notice--${notice.kind}`}
              aria-atomic="true"
              aria-live={notice.kind === "error" ? "assertive" : "polite"}
              role={notice.kind === "error" ? "alert" : "status"}
            >
              {notice.kind === "success" ? (
                <CheckCircle2 size={18} aria-hidden="true" />
              ) : (
                <XCircle size={18} aria-hidden="true" />
              )}
              <div>
                <strong>{notice.title}</strong>
                <span>{notice.message}</span>
              </div>
            </section>
          ) : null}

          {isSignedIn ? (
            <>
              <LoginSessionCard
                labels={labels}
                locale={locale}
                returnTo={returnTo}
                session={session}
              />

              <AuthProviderPanel
                apiUrl={apiUrl}
                locale={locale}
                providers={providers}
                returnTo={returnTo}
              />

              <LoginEmailCard
                isSignedIn
                labels={labels}
                locale={locale}
                returnTo={returnTo}
              />

              <LoginRecoveryBlock
                labels={labels}
                locale={locale}
                returnTo={returnTo}
              />
            </>
          ) : (
            <>
              <AuthProviderPanel
                apiUrl={apiUrl}
                locale={locale}
                providers={providers}
                returnTo={returnTo}
              />

              <LoginEmailCard
                isSignedIn={false}
                labels={labels}
                locale={locale}
                returnTo={returnTo}
              />

              <LoginRecoveryBlock
                labels={labels}
                locale={locale}
                returnTo={returnTo}
              />

              <div className="login-secondary-links">
                <a
                  className="login-account-link"
                  href={localizedHref("/account", locale)}
                >
                  <UserCircle size={17} aria-hidden="true" />
                  <span>{labels.account}</span>
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      <LoginFooter labels={labels} locale={locale} />
    </main>
  );
}

function LoginWorkspaceHero({
  isSignedIn,
  labels,
}: {
  isSignedIn: boolean;
  labels: LoginCopy;
}) {
  const trustItems = [
    {
      body: labels.secureLoginBody,
      icon: ShieldCheck,
      title: labels.secureLogin,
    },
    {
      body: labels.trustSessionBody,
      icon: Network,
      title: labels.trustSession,
    },
    {
      body: labels.trustPreviewBody,
      icon: Zap,
      title: labels.trustPreview,
    },
  ];

  return (
    <div className="login-workspace-hero">
      <div className="login-workspace-hero__content">
        <div className="eyebrow login-workspace-hero__eyebrow">
          <BadgeCheck size={16} aria-hidden="true" />
          <span>{isSignedIn ? labels.signedInEyebrow : labels.eyebrow}</span>
        </div>
        <h1 id="login-title">
          {isSignedIn ? labels.heroSignedInPrefix : labels.heroTitlePrefix}{" "}
          <span className="login-title-brand">SkillHub</span>{" "}
          <span className="login-title-tail">
            {isSignedIn ? labels.heroSignedInSuffix : labels.heroTitleSuffix}
          </span>
        </h1>
        <p>{isSignedIn ? labels.sessionBody : labels.body}</p>

        <div className="login-hero-trust">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="login-hero-trust__item" key={item.title}>
                <Icon size={24} aria-hidden="true" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="login-neural-field" aria-hidden="true">
        <div className="login-neural-field__mesh" />
        {neuralLinks.map(([x, y, length, rotate, delay], index) => (
          <span
            className="login-neural-link"
            key={`link-${index}`}
            style={
              {
                "--link-delay": delay,
                "--link-length": length,
                "--link-rotate": rotate,
                "--link-x": x,
                "--link-y": y,
              } as NeuralLinkStyle
            }
          />
        ))}
        {neuralNodes.map(([x, y, size, delay], index) => (
          <span
            className="login-neural-node"
            key={`node-${index}`}
            style={
              {
                "--node-delay": delay,
                "--node-size": size,
                "--node-x": x,
                "--node-y": y,
              } as NeuralNodeStyle
            }
          />
        ))}
        <span className="login-neural-scan login-neural-scan--a" />
        <span className="login-neural-scan login-neural-scan--b" />
      </div>

      <div className="login-workspace-hero__scene" aria-hidden="true">
        <div className="login-scene-network">
          <span className="login-scene-dot login-scene-dot--a" />
          <span className="login-scene-dot login-scene-dot--b" />
          <span className="login-scene-dot login-scene-dot--c" />
          <span className="login-scene-dot login-scene-dot--d" />
          <span className="login-scene-dot login-scene-dot--e" />
          <span className="login-scene-line login-scene-line--a" />
          <span className="login-scene-line login-scene-line--b" />
          <span className="login-scene-line login-scene-line--c" />
        </div>
        <div className="login-platform-beam" />
        <div className="login-platform-mark">
          <Grid2X2 size={58} />
        </div>
        <div className="login-platform-ring login-platform-ring--outer" />
        <div className="login-platform-ring login-platform-ring--inner" />
        <div className="login-platform-ring login-platform-ring--pulse" />
        <CircuitBoard className="login-platform-circuit" size={104} />
      </div>
    </div>
  );
}

function LoginSessionCard({
  labels,
  locale,
  returnTo,
  session,
}: {
  labels: LoginCopy;
  locale: Locale;
  returnTo: string;
  session: WorkspaceSession;
}) {
  const subject = session.subject;

  if (!subject) {
    return null;
  }

  const accountName =
    session.source === "cookie"
      ? subject.displayName ?? subject.email ?? labels.accountFallback
      : labels.environment;

  return (
    <article className="ops-panel login-session-card">
      <div className="login-session-card__head">
        <div className="card-kicker">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.sessionTitle}</span>
        </div>
        <form action={signOutAction.bind(null, locale)}>
          <button className="ghost-button ghost-button--inline" type="submit">
            <LogOut size={15} aria-hidden="true" />
            <span>{labels.signOut}</span>
          </button>
        </form>
      </div>

      <div className="login-session-grid">
        <div>
          <span>{labels.account}</span>
          <strong>{accountName}</strong>
          <small>{roleLabel(subject.roles, locale)}</small>
        </div>
        <div>
          <span>{labels.role}</span>
          <strong>{roleLabel(subject.roles, locale)}</strong>
          <UserRound size={19} aria-hidden="true" />
        </div>
        <div>
          <span>{labels.status}</span>
          <strong>{labels.sessionActive}</strong>
          <ShieldCheck size={19} aria-hidden="true" />
        </div>
      </div>

      <div className="login-session-actions">
        <a className="primary-button" href={returnTo}>
          <UserCircle size={17} aria-hidden="true" />
          <span>{labels.workspace}</span>
        </a>
        <a
          className="secondary-button"
          href={localizedHref("/account", locale)}
        >
          <UserRound size={17} aria-hidden="true" />
          <span>{labels.account}</span>
        </a>
      </div>
    </article>
  );
}

function LoginEmailCard({
  isSignedIn,
  labels,
  locale,
  returnTo,
}: {
  isSignedIn: boolean;
  labels: LoginCopy;
  locale: Locale;
  returnTo: string;
}) {
  if (isSignedIn) {
    return (
      <details className="login-email-details login-method-card">
        <summary>
          <span>
            <MailCheck size={18} aria-hidden="true" />
            <strong>{labels.emailCollapsedTitle}</strong>
            <small>{labels.emailCollapsedBody}</small>
          </span>
          <span className="login-method-card__action">
            {labels.emailCollapsedAction}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </summary>
        <div className="login-email-details__body">
          <WorkspaceSignupForm locale={locale} returnTo={returnTo} />
        </div>
      </details>
    );
  }

  return <WorkspaceSignupForm locale={locale} returnTo={returnTo} />;
}

function LoginRecoveryBlock({
  labels,
  locale,
  returnTo,
}: {
  labels: LoginCopy;
  locale: Locale;
  returnTo: string;
}) {
  return (
    <details className="login-recovery-details login-recovery-details--workspace">
      <summary>
        <KeyRound size={17} aria-hidden="true" />
        <span>{labels.recoveryTitle}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </summary>
      <p>{labels.recoveryBody}</p>
      <SessionLoginForm locale={locale} returnTo={returnTo} />
    </details>
  );
}

function LoginFooter({ labels, locale }: { labels: LoginCopy; locale: Locale }) {
  const links = [
    { href: localizedHref("/terms", locale), label: labels.footerPrivacy },
    { href: localizedHref("/terms", locale), label: labels.footerTerms },
    { href: localizedHref("/security", locale), label: labels.footerSecurity },
    { href: localizedHref("/status", locale), label: labels.footerStatus },
  ];

  return (
    <footer className="login-footer">
      <span>{labels.footerCopyright}</span>
      <nav aria-label="Login footer">
        {links.map((link) => (
          <a href={link.href} key={link.label}>
            {link.label === labels.footerStatus ? (
              <Globe2 size={14} aria-hidden="true" />
            ) : null}
            <span>{link.label}</span>
          </a>
        ))}
      </nav>
    </footer>
  );
}

function getSafeReturnTo(value: string | string[] | undefined, locale: Locale) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (
    candidate &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("://")
  ) {
    return candidate;
  }

  return localizedHref("/role-landing", locale);
}

function oauthNotice(
  params: Record<string, string | string[] | undefined>,
  labels: LoginCopy,
) {
  const status = firstParam(params.oauth);

  if (status === "connected") {
    return {
      kind: "success" as const,
      message: labels.oauthConnected,
      title: labels.oauthConnectedTitle,
    };
  }

  if (status === "error") {
    return {
      kind: "error" as const,
      message: safeOAuthErrorMessage(params, labels),
      title: labels.oauthError,
    };
  }

  return null;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function roleLabel(roles: string[], locale: Locale) {
  const visibleRoles = roles.slice(0, 4);

  if (locale !== "zh") {
    return visibleRoles.join(" / ") || "user";
  }

  const labels: Record<string, string> = {
    admin: "管理员",
    developer: "开发者",
    finance: "财务",
    owner: "负责人",
    publisher: "发布者",
    reviewer: "审核员",
    super_admin: "超级管理员",
    support: "客服",
    user: "用户",
  };

  return visibleRoles.map((role) => labels[role] ?? role).join(" / ") || labels.user;
}

function safeOAuthErrorMessage(
  params: Record<string, string | string[] | undefined>,
  labels: LoginCopy,
) {
  if (process.env.NEXT_PUBLIC_SKILLHUB_SHOW_OAUTH_DEBUG_ERROR === "true") {
    return (
      firstParam(params.message)?.slice(0, 160) || labels.oauthErrorFallback
    );
  }

  return labels.oauthErrorFallback;
}
