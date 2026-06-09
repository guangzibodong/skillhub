import { LayoutDashboard, LogIn, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";
import type { WorkspaceSession } from "@/lib/auth-session";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type SessionStatusPanelProps = {
  locale: Locale;
  session: WorkspaceSession;
};

const copy = {
  en: {
    account: "Account center",
    accountFallback: "SkillHub account",
    dashboard: "Open dashboard",
    environment: "Environment fallback",
    invalidSessionTitle: "Session needs attention",
    noSession: "No workspace session",
    noSessionBody: "Connect a user session so project, publisher, billing, payout, team, and notification operations are scoped to the active member.",
    role: "Role",
    signIn: "Sign in",
    signOut: "Sign out",
    status: "Status",
    signedInTitle: "You are signed in",
    signedOutTitle: "Sign in required",
    sessionReady: "Browser session active",
    unknown: "Verified user session required"
  },
  zh: {
    account: "个人中心",
    accountFallback: "SkillHub 账号",
    dashboard: "进入工作台",
    environment: "环境变量兜底",
    invalidSessionTitle: "会话需要处理",
    noSession: "未连接工作区会话",
    noSessionBody: "连接用户会话后，项目、发布、账单、提现、团队和通知操作都会按当前成员权限执行。",
    role: "角色",
    signIn: "去登录",
    signOut: "退出登录",
    status: "状态",
    signedInTitle: "你已登录",
    signedOutTitle: "需要先登录",
    sessionReady: "浏览器会话已连接",
    unknown: "需要已验证的用户会话"
  }
} as const;

export function SessionStatusPanel({ locale, session }: SessionStatusPanelProps) {
  const labels = copy[locale];
  const subject = session.subject;
  const statusTitle = subject
    ? labels.signedInTitle
    : session.source === "none"
      ? labels.signedOutTitle
      : labels.invalidSessionTitle;

  return (
    <article className={`ops-panel auth-status-panel auth-status-panel--${subject ? "signed-in" : "signed-out"}`}>
      <div className="auth-status-panel__head">
        <div className="card-kicker">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{statusTitle}</span>
        </div>
        {subject ? (
          session.source === "cookie" ? (
            <form action={signOutAction.bind(null, locale)}>
              <button className="ghost-button ghost-button--inline" type="submit">
                <LogOut size={15} aria-hidden="true" />
                <span>{labels.signOut}</span>
              </button>
            </form>
          ) : (
            <a className="ghost-button ghost-button--inline" href={localizedHref("/account", locale)}>
              <UserCircle size={15} aria-hidden="true" />
              <span>{labels.account}</span>
            </a>
          )
        ) : null}
      </div>
      {subject ? (
        <>
          <div className="auth-status-grid">
            <div>
              <span>{labels.account}</span>
              <strong>{session.source === "cookie" ? subject.displayName ?? subject.email ?? labels.accountFallback : labels.environment}</strong>
            </div>
            <div>
              <span>{labels.role}</span>
              <strong>{roleLabel(subject.roles, locale)}</strong>
            </div>
            <div>
              <span>{labels.status}</span>
              <strong>{labels.sessionReady}</strong>
            </div>
          </div>
          <div className="auth-status-actions">
            <a className="primary-button" href={localizedHref("/account", locale)}>
              <UserCircle size={16} aria-hidden="true" />
              <span>{labels.account}</span>
            </a>
            <a className="secondary-button" href={localizedHref("/dashboard", locale)}>
              <LayoutDashboard size={16} aria-hidden="true" />
              <span>{labels.dashboard}</span>
            </a>
          </div>
        </>
      ) : (
        <div className="auth-empty-state">
          <strong>{session.source === "none" ? labels.noSession : labels.unknown}</strong>
          <span>{labels.noSessionBody}</span>
          <a className="primary-button auth-empty-state__action" href={localizedHref("/login", locale)}>
            <LogIn size={16} aria-hidden="true" />
            <span>{labels.signIn}</span>
          </a>
        </div>
      )}
    </article>
  );
}

function roleLabel(roles: string[], locale: Locale) {
  const visibleRoles = roles.slice(0, 4);

  if (locale !== "zh") {
    return visibleRoles.join(" / ") || "user";
  }

  const labels: Record<string, string> = {
    admin: "管理员",
    developer: "开发者",
    owner: "负责人",
    publisher: "发布者",
    super_admin: "超级管理员",
    user: "用户"
  };

  return visibleRoles.map((role) => labels[role] ?? role).join(" / ") || labels.user;
}
