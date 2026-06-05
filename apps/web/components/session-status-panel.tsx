import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";
import { publicTokenLabel, type WorkspaceSession } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";

type SessionStatusPanelProps = {
  locale: Locale;
  session: WorkspaceSession;
};

const copy = {
  en: {
    cta: "Sign in",
    environment: "Environment fallback",
    noSession: "No workspace session",
    noSessionBody: "Connect a user session so project, publisher, billing, payout, team, and notification operations are scoped to the active member.",
    role: "Role",
    signOut: "Sign out",
    title: "Workspace session",
    token: "Token",
    unknown: "Verified user session required"
  },
  zh: {
    cta: "去登录",
    environment: "环境变量兜底",
    noSession: "未连接工作区会话",
    noSessionBody: "连接用户会话后，项目、发布、账单、提现、团队和通知操作都会按当前成员权限执行。",
    role: "角色",
    signOut: "退出登录",
    title: "工作区会话",
    token: "Token",
    unknown: "需要已验证的用户会话"
  }
} as const;

export function SessionStatusPanel({ locale, session }: SessionStatusPanelProps) {
  const labels = copy[locale];
  const subject = session.subject;

  return (
    <article className="ops-panel auth-status-panel">
      <div className="auth-status-panel__head">
        <div className="card-kicker">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        {session.source === "cookie" ? (
          <form action={signOutAction.bind(null, locale)}>
            <button className="ghost-button ghost-button--inline" type="submit">
              <LogOut size={15} aria-hidden="true" />
              <span>{labels.signOut}</span>
            </button>
          </form>
        ) : (
          <a className="ghost-button ghost-button--inline" href={localizedHref("/login", locale)}>
            <KeyRound size={15} aria-hidden="true" />
            <span>{labels.cta}</span>
          </a>
        )}
      </div>
      {subject ? (
        <div className="auth-status-grid">
          <div>
            <span>{session.source === "cookie" ? subject.displayName ?? subject.email ?? labels.title : labels.environment}</span>
            <strong>{subject.organizationId ?? subject.type}</strong>
          </div>
          <div>
            <span>{labels.role}</span>
            <strong>{subject.roles.slice(0, 4).join(" / ")}</strong>
          </div>
          <div>
            <span>{labels.token}</span>
            <strong>{publicTokenLabel(session.token)}</strong>
          </div>
        </div>
      ) : (
        <div className="auth-empty-state">
          <strong>{session.source === "none" ? labels.noSession : labels.unknown}</strong>
          <span>{labels.noSessionBody}</span>
        </div>
      )}
    </article>
  );
}
