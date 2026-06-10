import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  Globe2,
  Info,
  KeyRound,
  LogOut,
  MonitorUp,
  ShieldCheck,
  UserCircle,
  UserRound,
  Workflow,
  XCircle,
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
    account: "Account",
    accountCenter: "Account center",
    accountFallback: "SkillHub account",
    authSubtitle: "Choose a method to enter your SkillHub workspace.",
    authTitle: "Sign in",
    body:
      "Create projects, adopt verified skills, manage Project Keys, and invoke skills through governed REST / MCP runtime paths.",
    currentBrowser: "Current browser session",
    environment: "Environment fallback",
    eyebrow: "Developer Preview",
    footerCopyright: "© 2026 SkillHub. All rights reserved.",
    footerPrivacy: "Privacy",
    footerSecurity: "Security",
    footerStatus: "System status",
    footerTerms: "Terms",
    headerWorkspace: "Enter workspace",
    heroBrand: "SkillHub",
    heroSignedInAfter: "",
    heroSignedInBefore: "Welcome back to",
    heroTitleAfter: "workspace",
    heroTitleBefore: "Sign in to your",
    lastSignedIn: "Last signed in",
    noticeBody:
      "public discovery and inspection are live; runtime invocation requires a project key; paid marketplace remains prelaunch.",
    noticeLabel: "Developer Preview",
    noticeLink: "Learn more",
    oauthConnected:
      "OAuth login completed. Your browser session is now connected to the workspace.",
    oauthConnectedTitle: "OAuth connected",
    oauthError: "OAuth login needs attention.",
    oauthErrorFallback:
      "The provider callback could not complete. Check provider configuration and try again.",
    recoveryTitle: "Advanced sign-in: invite or recovery token",
    role: "Role",
    runtimeAria: "SkillHub runtime flow",
    sessionActive: "Browser session connected",
    sessionBody:
      "Your browser session is connected. Continue to your workspace to manage projects, adopted skills, Project Keys, and REST / MCP runtime calls.",
    sessionStatus: "Session status",
    sessionTitle: "Current session",
    signedInEyebrow: "Signed in",
    signOut: "Switch account / Sign out",
    switchAccountBody:
      "Signing out clears this browser session and returns you to the login flow.",
    workspace: "Workspace",
    workspaceAction: "Enter workspace",
    flowNodes: ["Verified Skill", "Project Key", "SkillHub Gateway", "REST / MCP Runtime"],
    metrics: [
      ["Live", "Public discovery"],
      ["Required", "Project Key"],
      ["Governed", "REST / MCP"],
      ["Prelaunch", "Paid marketplace"],
    ],
    signedInValueCards: [
      {
        body: "Manage project access and runtime credentials.",
        title: "Manage projects and keys",
      },
      {
        body: "Review adopted skills and approval state.",
        title: "Review adopted skills",
      },
      {
        body: "Track runtime logs and invocation status.",
        title: "Monitor runtime calls",
      },
      {
        body: "Review profile, roles, sessions, and security.",
        title: "Account and security settings",
      },
    ],
    valueCards: [
      {
        body: "Use trusted capabilities that passed review.",
        title: "Adopt verified skills",
      },
      {
        body: "Create project keys and control runtime access.",
        title: "Manage Project Keys",
      },
      {
        body: "Review schema, permissions, and approval state.",
        title: "Inspect manifests and permissions",
      },
      {
        body: "Track runtime logs and invocation status.",
        title: "Monitor REST / MCP calls",
      },
    ],
  },
  zh: {
    account: "账号",
    accountCenter: "账户中心",
    accountFallback: "SkillHub 账号",
    authSubtitle: "选择一种方式进入 SkillHub 工作区。",
    authTitle: "登录账号",
    body:
      "创建项目、接入已验证技能、管理 Project Key，并通过受治理的 REST / MCP 路径安全调用技能。",
    currentBrowser: "当前浏览器会话",
    environment: "环境变量兜底",
    eyebrow: "开发者预览版",
    footerCopyright: "© 2026 SkillHub. All rights reserved.",
    footerPrivacy: "隐私政策",
    footerSecurity: "安全",
    footerStatus: "系统状态",
    footerTerms: "服务条款",
    headerWorkspace: "进入工作区",
    heroBrand: "SkillHub",
    heroSignedInAfter: "",
    heroSignedInBefore: "欢迎回到",
    heroTitleAfter: "工作区",
    heroTitleBefore: "登录",
    lastSignedIn: "登录时间",
    noticeBody:
      "公开发现与查看已上线；运行调用需要项目 Key；付费市场仍处于预发布阶段。",
    noticeLabel: "开发者预览版",
    noticeLink: "了解详情",
    oauthConnected: "OAuth 登录已完成，浏览器会话已连接到工作区。",
    oauthConnectedTitle: "OAuth 已连接",
    oauthError: "OAuth 登录需要处理",
    oauthErrorFallback: "Provider 回调没有完成，请检查配置后重试。",
    recoveryTitle: "高级登录方式：邀请码 / 恢复令牌",
    role: "角色",
    runtimeAria: "SkillHub 运行调用流程",
    sessionActive: "浏览器会话已连接",
    sessionBody:
      "你的浏览器会话已连接，可以继续进入工作区，管理项目、已接入技能、Project Key 和 REST / MCP 运行调用。",
    sessionStatus: "会话状态",
    sessionTitle: "当前会话",
    signedInEyebrow: "已登录账号",
    signOut: "切换账号 / 退出登录",
    switchAccountBody: "退出后会清除当前浏览器会话，并回到登录流程。",
    workspace: "工作区",
    workspaceAction: "进入工作区",
    flowNodes: ["已验证技能", "项目密钥", "SkillHub Gateway", "REST / MCP Runtime"],
    metrics: [
      ["已上线", "公开发现"],
      ["必需", "项目 Key"],
      ["受治理", "REST / MCP"],
      ["预发布", "付费市场"],
    ],
    signedInValueCards: [
      {
        body: "管理项目访问与运行凭证。",
        title: "管理项目与 Key",
      },
      {
        body: "查看已接入技能和审批状态。",
        title: "查看已接入技能",
      },
      {
        body: "追踪运行日志与调用状态。",
        title: "监控运行调用",
      },
      {
        body: "查看资料、角色、会话与安全设置。",
        title: "账户与安全设置",
      },
    ],
    valueCards: [
      {
        body: "快速采用通过审核的可信能力。",
        title: "接入已验证技能",
      },
      {
        body: "创建项目密钥，控制运行权限。",
        title: "管理 Project Key",
      },
      {
        body: "查看 schema、权限与审核状态。",
        title: "查看 Manifest / 权限",
      },
      {
        body: "追踪运行日志与调用状态。",
        title: "监控 REST / MCP 调用",
      },
    ],
  },
} as const;

type LoginCopy = (typeof copy)[keyof typeof copy];

const valueIcons = [Box, KeyRound, FileText, MonitorUp] as const;
const flowIcons = [Box, KeyRound, ShieldCheck, Code2] as const;

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
        consoleHref={isSignedIn ? returnTo : localizedHref("/login", locale)}
        consoleLabel={isSignedIn ? labels.headerWorkspace : undefined}
        dictionary={dictionary}
        locale={locale}
        pathname="/login"
      />
      <LoginPreviewNotice labels={labels} locale={locale} />

      <section
        className={
          isSignedIn
            ? "login-workspace login-workspace--signed-in"
            : "login-workspace"
        }
      >
        <LoginWorkspaceHero isSignedIn={isSignedIn} labels={labels} />

        <div className="login-panel-stack">
          {isSignedIn ? (
            <div className="login-signed-in-stack">
              {notice ? <LoginNotice notice={notice} /> : null}
              <LoginSessionCard
                labels={labels}
                locale={locale}
                returnTo={returnTo}
                session={session}
              />
            </div>
          ) : (
            <LoginAuthCard
              apiUrl={apiUrl}
              labels={labels}
              locale={locale}
              notice={notice}
              providers={providers}
              returnTo={returnTo}
            />
          )}
        </div>
      </section>

      <LoginFooter labels={labels} locale={locale} />
    </main>
  );
}

function LoginPreviewNotice({
  labels,
  locale,
}: {
  labels: LoginCopy;
  locale: Locale;
}) {
  return (
    <div className="login-preview-bar" role="status">
      <div className="login-preview-bar__inner">
        <Info size={15} aria-hidden="true" />
        <p>
          <strong>{labels.noticeLabel}: </strong>
          <span>{labels.noticeBody}</span>
        </p>
        <a href={localizedHref("/status", locale)}>
          <span>{labels.noticeLink}</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function LoginWorkspaceHero({
  isSignedIn,
  labels,
}: {
  isSignedIn: boolean;
  labels: LoginCopy;
}) {
  const valueCards = isSignedIn ? labels.signedInValueCards : labels.valueCards;

  return (
    <div className="login-workspace-hero">
      <div className="login-workspace-hero__content">
        <div className="eyebrow login-workspace-hero__eyebrow">
          <BadgeCheck size={16} aria-hidden="true" />
          <span>{isSignedIn ? labels.signedInEyebrow : labels.eyebrow}</span>
        </div>
        <h1 id="login-title">
          <span>{isSignedIn ? labels.heroSignedInBefore : labels.heroTitleBefore}</span>{" "}
          <span className="login-title-brand">{labels.heroBrand}</span>{" "}
          <span className="login-title-tail">
            {isSignedIn ? labels.heroSignedInAfter : labels.heroTitleAfter}
          </span>
        </h1>
        <p>{isSignedIn ? labels.sessionBody : labels.body}</p>

        <div className="login-value-grid">
          {valueCards.map((item, index) => {
            const Icon = valueIcons[index] ?? ShieldCheck;

            return (
              <ValueCard
                body={item.body}
                icon={Icon}
                key={item.title}
                title={item.title}
              />
            );
          })}
        </div>
      </div>

      <RuntimeFlowVisual labels={labels} />

      <div className="login-metric-strip" aria-label="SkillHub preview state">
        {labels.metrics.map(([value, label]) => (
          <div className="login-metric" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValueCard({
  body,
  icon: Icon,
  title,
}: {
  body: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="login-value-card">
      <Icon size={22} aria-hidden="true" />
      <strong>{title}</strong>
      <span>{body}</span>
    </article>
  );
}

function RuntimeFlowVisual({ labels }: { labels: LoginCopy }) {
  return (
    <div className="login-runtime-flow" aria-label={labels.runtimeAria}>
      <div className="login-runtime-flow__grid" aria-hidden="true" />
      <div className="login-runtime-flow__line" aria-hidden="true" />
      <span className="login-runtime-particle login-runtime-particle--a" />
      <span className="login-runtime-particle login-runtime-particle--b" />
      <span className="login-runtime-particle login-runtime-particle--c" />
      <span className="login-runtime-particle login-runtime-particle--d" />
      {labels.flowNodes.map((label, index) => {
        const Icon = flowIcons[index] ?? ShieldCheck;
        const isGateway = index === 2;

        return (
          <div
            className={
              isGateway
                ? "login-runtime-node login-runtime-node--gateway"
                : "login-runtime-node"
            }
            key={label}
          >
            <Icon size={isGateway ? 30 : 24} aria-hidden="true" />
            <strong>{label}</strong>
          </div>
        );
      })}
    </div>
  );
}

function LoginAuthCard({
  apiUrl,
  labels,
  locale,
  notice,
  providers,
  returnTo,
}: {
  apiUrl: string;
  labels: LoginCopy;
  locale: Locale;
  notice: ReturnType<typeof oauthNotice>;
  providers: Awaited<ReturnType<typeof getAuthProviders>>;
  returnTo: string;
}) {
  return (
    <section className="ops-panel login-auth-card" aria-labelledby="login-card-title">
      {notice ? <LoginNotice notice={notice} /> : null}
      <div className="login-auth-card__head">
        <h2 id="login-card-title">{labels.authTitle}</h2>
        <p>{labels.authSubtitle}</p>
      </div>
      <AuthProviderPanel
        apiUrl={apiUrl}
        locale={locale}
        providers={providers}
        returnTo={returnTo}
        surface="embedded"
      />
      <div className="login-divider" role="separator">
        <span>{locale === "zh" ? "或" : "or"}</span>
      </div>
      <LoginEmailCard labels={labels} locale={locale} returnTo={returnTo} />
      <LoginRecoveryBlock labels={labels} locale={locale} returnTo={returnTo} />
    </section>
  );
}

function LoginNotice({
  notice,
}: {
  notice: NonNullable<ReturnType<typeof oauthNotice>>;
}) {
  return (
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
  const workspaceName =
    subject.organizationId ?? (locale === "zh" ? "已连接工作区" : "Connected workspace");
  const fields = [
    {
      icon: UserRound,
      label: labels.account,
      value: accountName,
      meta: subject.email ?? roleLabel(subject.roles, locale),
    },
    {
      icon: Workflow,
      label: labels.role,
      value: roleLabel(subject.roles, locale),
      meta: subject.platformRole,
    },
    {
      icon: UserCircle,
      label: labels.workspace,
      value: workspaceName,
      meta: session.source,
    },
    {
      icon: ShieldCheck,
      label: labels.sessionStatus,
      value: labels.sessionActive,
      meta: labels.currentBrowser,
    },
    {
      icon: KeyRound,
      label: labels.lastSignedIn,
      value: labels.currentBrowser,
      meta: "HTTP-only cookie",
    },
  ];

  return (
    <article className="ops-panel login-session-card">
      <div className="login-session-card__head">
        <div className="card-kicker">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.sessionTitle}</span>
        </div>
        <span className="status-chip status-chip--success">
          {labels.sessionActive}
        </span>
      </div>

      <div className="login-session-grid">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <div key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
              <small>{field.meta}</small>
              <Icon size={19} aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <div className="login-session-actions">
        <a className="primary-button auth-primary-button" href={returnTo}>
          <UserCircle size={17} aria-hidden="true" />
          <span>{labels.workspaceAction}</span>
        </a>
        <a
          className="secondary-button"
          href={localizedHref("/account", locale)}
        >
          <UserRound size={17} aria-hidden="true" />
          <span>{labels.accountCenter}</span>
        </a>
        <form action={signOutAction.bind(null, locale)}>
          <button
            className="ghost-button ghost-button--inline login-switch-account-button"
            type="submit"
          >
            <LogOut size={15} aria-hidden="true" />
            <span>{labels.signOut}</span>
          </button>
        </form>
      </div>
      <p className="login-session-card__note">{labels.switchAccountBody}</p>
    </article>
  );
}

function LoginEmailCard({
  locale,
  returnTo,
}: {
  labels: LoginCopy;
  locale: Locale;
  returnTo: string;
}) {
  return (
    <WorkspaceSignupForm
      locale={locale}
      returnTo={returnTo}
      surface="embedded"
    />
  );
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
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <SessionLoginForm
        locale={locale}
        returnTo={returnTo}
        surface="embedded"
      />
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
