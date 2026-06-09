import {
  CheckCircle2,
  KeyRound,
  MailCheck,
  ShieldCheck,
  UserCircle,
  XCircle,
} from "lucide-react";
import { AuthProviderPanel } from "@/components/auth-provider-panel";
import { SessionLoginForm } from "@/components/session-login-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders } from "@/lib/account-data";
import { getWorkspaceSession } from "@/lib/auth-session";
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
    body: "Use Google, GitHub, or your SkillHub username/email and password. New teams can create a workspace from the register tab.",
    emailCode: "Account password",
    eyebrow: "Account access",
    oauthConnectedTitle: "OAuth connected",
    oauthConnected:
      "OAuth login completed. Your browser session is now connected to the workspace.",
    oauthError: "OAuth login needs attention.",
    oauthErrorFallback:
      "The provider callback could not complete. Check provider configuration and try again.",
    pathAccountBody:
      "Confirm identity, connected providers, session safety, and workspace readiness.",
    pathAccountTitle: "Review account center",
    pathHeading: "After sign-in",
    pathLoginBody:
      "Use configured Google/GitHub, or username/email plus password.",
    pathLoginTitle: "Choose an access method",
    pathRoleBody:
      "Developer, publisher, and operator workspaces appear by role; unavailable actions stay role-gated.",
    pathRoleTitle: "Continue by role",
    signedInBody:
      "Your browser is already connected to a SkillHub workspace. Continue to the account center or dashboard, or switch accounts below.",
    signedInEyebrow: "Signed-in account",
    signedInTitle: "You are already signed in.",
    switchAccount: "Use another account",
    switchAccountBody:
      "Open this only when you need to connect a different Google, GitHub, password, or recovery-token session.",
    title: "Sign in to SkillHub.",
    tokenFallback: "Invite or recovery token only",
    tokenFallbackBody:
      "Use this only when a SkillHub administrator or invite flow gave you a one-time token. Normal users should use Google, GitHub, or email/password.",
  },
  zh: {
    account: "个人中心",
    body: "使用 Google、GitHub，或 SkillHub 用户名/邮箱和密码登录。新团队可在注册页签创建工作区。",
    emailCode: "账号密码",
    eyebrow: "账号入口",
    oauthConnectedTitle: "OAuth 已连接",
    oauthConnected: "OAuth 登录已完成，浏览器会话已连接到工作区。",
    oauthError: "OAuth 登录需要处理",
    oauthErrorFallback: "Provider 回调没有完成，请检查配置后重试。",
    pathAccountBody: "确认身份、已连接登录方式、会话安全和工作区准备度。",
    pathAccountTitle: "检查账号中心",
    pathHeading: "登录后的路径",
    pathLoginBody: "使用已配置的 Google/GitHub，或用户名/邮箱加密码。",
    pathLoginTitle: "选择登录方式",
    pathRoleBody:
      "开发者、发布者和运营工作区会按角色出现；无权限动作保持受保护。",
    pathRoleTitle: "按角色继续",
    signedInBody:
      "当前浏览器已经连接 SkillHub 工作区。继续进入个人中心或工作台；需要换号时再展开下方入口。",
    signedInEyebrow: "已登录账号",
    signedInTitle: "你已登录 SkillHub。",
    switchAccount: "切换账号或重新登录",
    switchAccountBody:
      "只有需要换 Google、GitHub、账号密码或恢复 token 时才打开这里。",
    title: "登录 SkillHub。",
    tokenFallback: "仅限邀请或恢复 Token",
    tokenFallbackBody:
      "仅当 SkillHub 管理员或邀请流程提供一次性 Token 时使用。正常用户应使用 Google、GitHub 或邮箱密码。",
  },
} as const;

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [providers, session] = await Promise.all([
    getAuthProviders(),
    getWorkspaceSession(),
  ]);
  const notice = oauthNotice(params, labels);
  const isSignedIn = Boolean(session.subject);

  return (
    <main className="product-shell">
      <SiteHeader
        active="dashboard"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/login"
      />

      <section
        className={
          isSignedIn ? "login-screen login-screen--signed-in" : "login-screen"
        }
      >
        <div className="login-screen__copy">
          <div className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{isSignedIn ? labels.signedInEyebrow : labels.eyebrow}</span>
          </div>
          <h1>{isSignedIn ? labels.signedInTitle : labels.title}</h1>
          <p>{isSignedIn ? labels.signedInBody : labels.body}</p>
          {!isSignedIn ? <LoginPathPreview labels={labels} /> : null}
        </div>

        <div className="login-auth-stack">
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
              <SessionStatusPanel locale={locale} session={session} />

              <details className="login-switch-account-details">
                <summary>
                  <UserCircle size={15} aria-hidden="true" />
                  <span>{labels.switchAccount}</span>
                </summary>
                <p>{labels.switchAccountBody}</p>
                <AuthProviderPanel
                  apiUrl={apiUrl}
                  locale={locale}
                  providers={providers}
                />

                <div className="login-divider">
                  <MailCheck size={15} aria-hidden="true" />
                  <span>{labels.emailCode}</span>
                </div>

                <WorkspaceSignupForm locale={locale} />

                <details className="login-recovery-details">
                  <summary>
                    <KeyRound size={15} aria-hidden="true" />
                    <span>{labels.tokenFallback}</span>
                  </summary>
                  <p>{labels.tokenFallbackBody}</p>
                  <SessionLoginForm locale={locale} />
                </details>
              </details>
            </>
          ) : (
            <>
              <AuthProviderPanel
                apiUrl={apiUrl}
                locale={locale}
                providers={providers}
              />

              <div className="login-divider">
                <MailCheck size={15} aria-hidden="true" />
                <span>{labels.emailCode}</span>
              </div>

              <WorkspaceSignupForm locale={locale} />

              <details className="login-recovery-details">
                <summary>
                  <KeyRound size={15} aria-hidden="true" />
                  <span>{labels.tokenFallback}</span>
                </summary>
                <p>{labels.tokenFallbackBody}</p>
                <SessionLoginForm locale={locale} />
              </details>

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
    </main>
  );
}

function LoginPathPreview({
  labels,
}: {
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
}) {
  const steps = [
    {
      body: labels.pathLoginBody,
      icon: MailCheck,
      title: labels.pathLoginTitle,
    },
    {
      body: labels.pathAccountBody,
      icon: UserCircle,
      title: labels.pathAccountTitle,
    },
    {
      body: labels.pathRoleBody,
      icon: ShieldCheck,
      title: labels.pathRoleTitle,
    },
  ];

  return (
    <div className="login-path-preview" aria-label={labels.pathHeading}>
      <span className="login-path-preview__eyebrow">{labels.pathHeading}</span>
      <div className="login-path-preview__list">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div className="login-path-preview__item" key={step.title}>
              <Icon size={16} aria-hidden="true" />
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function oauthNotice(
  params: Record<string, string | string[] | undefined>,
  labels: (typeof copy)["en"] | (typeof copy)["zh"],
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

function safeOAuthErrorMessage(
  params: Record<string, string | string[] | undefined>,
  labels: (typeof copy)["en"] | (typeof copy)["zh"],
) {
  if (process.env.NEXT_PUBLIC_SKILLHUB_SHOW_OAUTH_DEBUG_ERROR === "true") {
    return (
      firstParam(params.message)?.slice(0, 160) || labels.oauthErrorFallback
    );
  }

  return labels.oauthErrorFallback;
}
