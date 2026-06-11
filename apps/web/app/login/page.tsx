import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Box,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
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
import { AppShell } from "@/components/app-shell";
import { SessionLoginForm } from "@/components/session-login-form";
import { WorkspaceSignupForm } from "@/components/workspace-signup-form";
import { getAuthProviders } from "@/lib/account-data";
import { signOutAction } from "@/lib/auth-actions";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import { roleCanOpenRequestedPath, roleLandingPath } from "@/lib/role-landing";

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
      "Your browser session is connected — continue to your workspace to manage projects, adopted skills, Project Keys, and REST / MCP runtime calls.",
    sessionStatus: "Session status",
    sessionTitle: "Current session",
    signedInEyebrow: "Signed-in account",
    signOut: "Switch account / sign out",
    switchAccountBody:
      "Signing out clears the current browser session and returns to the sign-in flow.",
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

  if (session.subject) {
    const landingPath = resolveSignedInLandingPath(session.subject, returnTo, locale);

    redirect(landingPath as Parameters<typeof redirect>[0]);
  }

  return (
    <AppShell active="login" locale={locale}>
      <LoginPreviewNotice labels={labels} locale={locale} />

      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 items-center min-h-[calc(100vh-160px)]">
          <LoginWorkspaceHero isSignedIn={isSignedIn} labels={labels} />

          <div className="flex flex-col gap-6">
            {isSignedIn ? (
              <div className="flex flex-col gap-4">
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
        </div>
      </section>
    </AppShell>
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
    <div
      className="bg-[#1a1a1a] border-b border-[rgba(255,255,255,0.06)] py-3"
      role="status"
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center gap-3 text-[13px] text-[#999]">
        <Info size={15} aria-hidden="true" className="text-[#0075ff] shrink-0" />
        <p className="flex-1">
          <strong className="text-white">{labels.noticeLabel}: </strong>
          <span>{labels.noticeBody}</span>
        </p>
        <a
          href={localizedHref("/status", locale)}
          className="flex items-center gap-1 text-[#0075ff] hover:text-[#0066e0] whitespace-nowrap"
        >
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wider text-[#0075ff]">
          <BadgeCheck size={16} aria-hidden="true" />
          <span>{isSignedIn ? labels.signedInEyebrow : labels.eyebrow}</span>
        </div>
        <h1 id="login-title" className="text-[36px] lg:text-[48px] font-bold leading-[1.1] text-white">
          <span>{isSignedIn ? labels.heroSignedInBefore : labels.heroTitleBefore}</span>{" "}
          <span className="text-[#0075ff]">{labels.heroBrand}</span>{" "}
          <span className="text-[#999]">
            {isSignedIn ? labels.heroSignedInAfter : labels.heroTitleAfter}
          </span>
        </h1>
        <p className="text-[16px] leading-relaxed text-[#999] max-w-[520px]">
          {isSignedIn ? labels.sessionBody : labels.body}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      <RuntimeFlowVisual labels={labels} />

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        aria-label="SkillHub preview state"
      >
        {labels.metrics.map(([value, label]) => (
          <div className="flex flex-col gap-1" key={label}>
            <strong className="text-[14px] font-semibold text-white">{value}</strong>
            <span className="text-[12px] text-[#666]">{label}</span>
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
    <article className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 flex flex-col gap-2">
      <Icon size={22} aria-hidden="true" className="text-[#0075ff]" />
      <strong className="text-[14px] font-medium text-white">{title}</strong>
      <span className="text-[13px] text-[#666] leading-relaxed">{body}</span>
    </article>
  );
}

function RuntimeFlowVisual({ labels }: { labels: LoginCopy }) {
  return (
    <div
      className="relative bg-[#1a1a1a] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-6 flex items-center justify-between gap-4 overflow-hidden"
      aria-label={labels.runtimeAria}
    >
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.5)_50%,transparent_51%)] bg-[length:20px_20px]" aria-hidden="true" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-[rgba(255,255,255,0.08)]" aria-hidden="true" />
      {labels.flowNodes.map((label, index) => {
        const Icon = flowIcons[index] ?? ShieldCheck;
        const isGateway = index === 2;

        return (
          <div
            className={`relative z-10 flex flex-col items-center gap-2 ${
              isGateway ? "text-[#0075ff]" : "text-[#666]"
            }`}
            key={label}
          >
            <Icon size={isGateway ? 30 : 24} aria-hidden="true" />
            <strong className="text-[11px] font-medium text-center whitespace-nowrap">
              {label}
            </strong>
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
    <section
      className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 flex flex-col gap-6"
      aria-labelledby="login-card-title"
    >
      {notice ? <LoginNotice notice={notice} /> : null}
      <div className="flex flex-col gap-2">
        <h2 id="login-card-title" className="text-[22px] font-semibold text-white">
          {labels.authTitle}
        </h2>
        <p className="text-[14px] text-[#999]">{labels.authSubtitle}</p>
      </div>
      <AuthProviderPanel
        apiUrl={apiUrl}
        locale={locale}
        providers={providers}
        returnTo={returnTo}
        surface="embedded"
      />
      <div className="flex items-center gap-3" role="separator">
        <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        <span className="text-[13px] text-[#525252]">
          {locale === "zh" ? "或" : "or"}
        </span>
        <span className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
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
      className={`flex items-start gap-3 rounded-[10px] p-4 text-[13px] ${
        notice.kind === "success"
          ? "bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] text-[#10b981]"
          : "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#ef4444]"
      }`}
      aria-atomic="true"
      aria-live={notice.kind === "error" ? "assertive" : "polite"}
      role={notice.kind === "error" ? "alert" : "status"}
    >
      {notice.kind === "success" ? (
        <CheckCircle2 size={18} aria-hidden="true" className="shrink-0 mt-0.5" />
      ) : (
        <XCircle size={18} aria-hidden="true" className="shrink-0 mt-0.5" />
      )}
      <div className="flex flex-col gap-1">
        <strong className="font-medium">{notice.title}</strong>
        <span className="text-[#999]">{notice.message}</span>
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
    <article className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px] text-[#999]">
          <ShieldCheck size={16} aria-hidden="true" className="text-[#0075ff]" />
          <span>{labels.sessionTitle}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(16,185,129,0.1)] text-[12px] font-medium text-[#10b981]">
          {labels.sessionActive}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <div
              key={field.label}
              className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0"
            >
              <Icon size={19} aria-hidden="true" className="text-[#525252] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] text-[#666] block">{field.label}</span>
                <strong className="text-[14px] font-medium text-white block truncate">
                  {field.value}
                </strong>
              </div>
              <small className="text-[11px] text-[#525252] shrink-0">{field.meta}</small>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <a
          className="bg-[#0075ff] hover:bg-[#0066e0] text-white text-[14px] font-medium px-4 py-2 rounded-[7px] inline-flex items-center justify-center gap-2 transition-colors"
          href={returnTo}
        >
          <UserCircle size={17} aria-hidden="true" />
          <span>{labels.workspaceAction}</span>
        </a>
        <a
          className="bg-transparent border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)] text-white text-[14px] font-medium px-4 py-2 rounded-[7px] inline-flex items-center justify-center gap-2 transition-colors"
          href={localizedHref("/account", locale)}
        >
          <UserRound size={17} aria-hidden="true" />
          <span>{labels.accountCenter}</span>
        </a>
        <form action={signOutAction.bind(null, locale)}>
          <button
            className="w-full text-[#666] hover:text-white text-[13px] font-medium px-4 py-2 inline-flex items-center justify-center gap-2 transition-colors"
            type="submit"
          >
            <LogOut size={15} aria-hidden="true" />
            <span>{labels.signOut}</span>
          </button>
        </form>
      </div>
      <p className="text-[12px] text-[#525252] text-center">{labels.switchAccountBody}</p>
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
    <details className="group border border-[rgba(255,255,255,0.06)] rounded-[10px] overflow-hidden">
      <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-[13px] text-[#666] hover:text-[#999] transition-colors">
        <KeyRound size={17} aria-hidden="true" />
        <span className="flex-1">{labels.recoveryTitle}</span>
        <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">
        <SessionLoginForm
          locale={locale}
          returnTo={returnTo}
          surface="embedded"
        />
      </div>
    </details>
  );
}

function getSafeReturnTo(value: string | string[] | undefined, locale: Locale) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (
    candidate &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//") &&
    !candidate.includes("://") &&
    !isLoginRoute(candidate)
  ) {
    return candidate;
  }

  return localizedHref("/role-landing", locale);
}

function resolveSignedInLandingPath(
  subject: WorkspaceSession["subject"],
  returnTo: string,
  locale: Locale,
) {
  if (!subject) {
    return localizedHref("/login", locale);
  }

  if (returnTo && roleCanOpenRequestedPath(subject, returnTo)) {
    return returnTo;
  }

  return roleLandingPath(subject, locale);
}

function isLoginRoute(path: string) {
  return path === "/login" || path.startsWith("/login?");
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
