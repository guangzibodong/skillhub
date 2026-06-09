import { KeyRound, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import type { WorkspaceSession } from "@/lib/auth-session";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type WorkspaceAccessPanelProps = {
  locale: Locale;
  requiredRoles: string[];
  session: WorkspaceSession;
  workspace: "admin" | "developer" | "publisher";
};

const copy = {
  en: {
    accountAction: "Open account",
    actionRules: "API actions remain role-enforced",
    actionRulesBody:
      "This panel explains access before a user clicks a control. The gateway still enforces organization membership and role checks for every write.",
    currentRoles: "Current roles",
    currentSession: "Current session",
    envFallback: "Server fallback",
    missingRole: "Role required",
    noSession: "Sign-in required",
    noSessionBody:
      "Enter through username/email password, configured Google/GitHub OAuth, or an invite/recovery token before operating this workspace.",
    org: "Organization",
    requiredRoles: "Required roles",
    signInAction: "Sign in",
    token: "Session source",
    workspaceReady: "Workspace ready",
    workspaces: {
      admin: {
        body:
          "Admin operations cover review, launch readiness, identity, trust, incidents, finance, payouts, delivery queues, webhook outbox, and audit.",
        title: "Admin access and governance"
      },
      developer: {
        body:
          "Developer operations cover projects, installs, runtime keys, project policy, governed tests, billing readiness, team access, notifications, and webhooks.",
        title: "Developer workspace access"
      },
      publisher: {
        body:
          "Publisher operations cover manifest drafts, version review, repair loops, pricing blockers, buyer demand, feedback, revenue, payout readiness, and notifications.",
        title: "Publisher workspace access"
      }
    }
  },
  zh: {
    accountAction: "\u6253\u5f00\u8d26\u53f7\u4e2d\u5fc3",
    actionRules: "API \u64cd\u4f5c\u4ecd\u7136\u6309\u89d2\u8272\u6821\u9a8c",
    actionRulesBody:
      "\u8fd9\u4e2a\u9762\u677f\u5148\u89e3\u91ca\u8bbf\u95ee\u72b6\u6001\u3002\u771f\u6b63\u5199\u5165\u6570\u636e\u65f6\uff0c\u7f51\u5173\u4ecd\u4f1a\u6821\u9a8c\u7ec4\u7ec7\u6210\u5458\u8eab\u4efd\u548c\u89d2\u8272\u6743\u9650\u3002",
    currentRoles: "\u5f53\u524d\u89d2\u8272",
    currentSession: "\u5f53\u524d\u4f1a\u8bdd",
    envFallback: "\u670d\u52a1\u7aef\u515c\u5e95",
    missingRole: "\u9700\u8981\u5bf9\u5e94\u89d2\u8272",
    noSession: "\u9700\u8981\u5148\u767b\u5f55",
    noSessionBody:
      "\u8bf7\u5148\u901a\u8fc7\u7528\u6237\u540d/\u90ae\u7bb1\u5bc6\u7801\u3001\u5df2\u914d\u7f6e\u7684 Google/GitHub OAuth\uff0c\u6216\u9080\u8bf7/\u6062\u590d token \u8fdb\u5165\u5de5\u4f5c\u533a\u3002",
    org: "\u7ec4\u7ec7",
    requiredRoles: "\u6240\u9700\u89d2\u8272",
    signInAction: "\u53bb\u767b\u5f55",
    token: "\u4f1a\u8bdd\u6765\u6e90",
    workspaceReady: "\u5de5\u4f5c\u533a\u53ef\u7528",
    workspaces: {
      admin: {
        body:
          "\u7ba1\u7406\u540e\u53f0\u7528\u4e8e\u5ba1\u6838\u3001\u4e0a\u7ebf\u5c31\u7eea\u3001\u8eab\u4efd\u76ee\u5f55\u3001\u4fe1\u4efb\u4e3e\u62a5\u3001\u4e8b\u6545\u3001\u8d22\u52a1\u3001\u63d0\u73b0\u3001\u6295\u9012\u961f\u5217\u3001webhook outbox \u548c\u5ba1\u8ba1\u3002",
        title: "\u7ba1\u7406\u540e\u53f0\u8bbf\u95ee\u548c\u6cbb\u7406"
      },
      developer: {
        body:
          "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u7528\u4e8e\u9879\u76ee\u3001\u5b89\u88c5\u3001\u8fd0\u884c Key\u3001\u9879\u76ee\u7b56\u7565\u3001\u53d7\u6cbb\u7406\u6d4b\u8bd5\u3001\u8d26\u5355\u51c6\u5907\u3001\u56e2\u961f\u3001\u901a\u77e5\u548c webhook\u3002",
        title: "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u8bbf\u95ee"
      },
      publisher: {
        body:
          "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u7528\u4e8e manifest \u8349\u7a3f\u3001\u7248\u672c\u5ba1\u6838\u3001\u4fee\u590d\u95ed\u73af\u3001\u5b9a\u4ef7\u963b\u65ad\u3001\u4e70\u65b9\u9700\u6c42\u3001\u53cd\u9988\u3001\u6536\u5165\u3001\u63d0\u73b0\u51c6\u5907\u548c\u901a\u77e5\u3002",
        title: "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u8bbf\u95ee"
      }
    }
  }
} as const;

export function WorkspaceAccessPanel({ locale, requiredRoles, session, workspace }: WorkspaceAccessPanelProps) {
  const labels = copy[locale];
  const subject = session.subject;
  const roleSet = new Set([subject?.platformRole, ...(subject?.roles ?? [])].filter(Boolean));
  const hasRequiredRole = requiredRoles.some((role) => roleSet.has(role));
  const hasSession = Boolean(subject);
  const state = hasSession && hasRequiredRole ? "ready" : hasSession ? "missing_role" : "no_session";
  const workspaceCopy = labels.workspaces[workspace];

  return (
    <article className={`ops-panel workspace-access-panel workspace-access-panel--${state}`}>
      <div className="workspace-access-panel__main">
        <div className="card-kicker">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.currentSession}</span>
        </div>
        <h2>{workspaceCopy.title}</h2>
        <p>{workspaceCopy.body}</p>
        <div className="workspace-access-panel__status">
          <span className={state === "ready" ? "status-chip" : "status-chip status-chip--warning"}>
            {state === "ready" ? labels.workspaceReady : state === "missing_role" ? labels.missingRole : labels.noSession}
          </span>
          <a className="ghost-button ghost-button--inline" href={localizedHref(hasSession ? "/account" : "/login", locale)}>
            <KeyRound size={15} aria-hidden="true" />
            <span>{hasSession ? labels.accountAction : labels.signInAction}</span>
          </a>
        </div>
      </div>

      <div className="workspace-access-panel__details">
        <div className="workspace-access-meta">
          <UserRoundCheck size={16} aria-hidden="true" />
          <span>{labels.org}</span>
          <strong>{subject?.organizationId ?? (session.source === "environment" ? labels.envFallback : labels.noSession)}</strong>
        </div>
        <div className="workspace-access-meta">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.currentRoles}</span>
          <strong>{subject ? formatRoles([subject.platformRole, ...subject.roles]) : labels.noSession}</strong>
        </div>
        <div className="workspace-access-meta">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.requiredRoles}</span>
          <strong>{requiredRoles.join(" / ")}</strong>
        </div>
        <div className="workspace-access-meta">
          <KeyRound size={16} aria-hidden="true" />
          <span>{labels.token}</span>
          <strong>{session.source}</strong>
        </div>
        <div className="workspace-access-note">
          <strong>{labels.actionRules}</strong>
          <span>{labels.actionRulesBody}</span>
        </div>
      </div>
    </article>
  );
}

function formatRoles(roles: string[]) {
  const uniqueRoles = Array.from(new Set(roles.filter(Boolean)));
  return uniqueRoles.length ? uniqueRoles.join(" / ") : "user";
}
