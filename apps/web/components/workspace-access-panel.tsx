import { KeyRound, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import type { WorkspaceSession } from "@/lib/auth-session";
import {
  localizedHref,
  localizedHrefWithReturnTo,
  type Locale,
} from "@/lib/locale-routing";

type WorkspaceAccessPanelProps = {
  locale: Locale;
  requiredRoles: string[];
  returnTo?: string;
  session: WorkspaceSession;
  workspace: "admin" | "developer" | "publisher";
};

const copy = {
  en: {
    accountAction: "Open account",
    actionRules: "Protected actions are checked again",
    actionRulesBody:
      "This panel explains whether the workspace can be opened. Save, submit, review, payout, and test actions still confirm access again before anything changes.",
    currentRoles: "Current roles",
    currentSession: "Current session",
    envFallback: "Server fallback",
    invalidSession: "Session invalid",
    invalidSessionBody: "Sign in again so SkillHub can refresh the workspace session.",
    missingRole: "Access required",
    noSession: "Sign-in required",
    noSessionBody:
      "Enter through username/email password, configured Google/GitHub OAuth, or an invite/recovery token before operating this workspace.",
    org: "Organization",
    requiredRoles: "Access needed",
    signInAction: "Sign in",
    token: "Session source",
    unavailableSession: "Session service unavailable",
    unavailableSessionBody: "The backend API cannot verify this session right now. Check the gateway or retry after the service is available.",
    workspaceReady: "Workspace ready",
    workspaces: {
      admin: {
        body:
          "Admin operations cover review, launch readiness, identity, trust, incidents, finance, payouts, delivery queues, webhook outbox, and audit.",
        title: "Admin access and governance"
      },
      developer: {
        body:
          "Developer operations cover projects, verified-skill adoption, runtime keys, project policy, login-gated tests, commercial readiness where applicable, team access, notifications, and webhooks.",
        title: "Developer workspace access"
      },
      publisher: {
        body:
          "Publisher operations cover manifest drafts, version review, repair loops, pricing intent, buyer demand, feedback, commercial readiness, and notifications.",
        title: "Publisher workspace access"
      }
    }
  },
  zh: {
    accountAction: "\u6253\u5f00\u8d26\u53f7\u4e2d\u5fc3",
    actionRules: "\u5173\u952e\u64cd\u4f5c\u4f1a\u518d\u6b21\u786e\u8ba4\u6743\u9650",
    actionRulesBody:
      "\u8fd9\u4e2a\u9762\u677f\u5148\u544a\u8bc9\u4f60\u80fd\u5426\u8fdb\u5165\u5de5\u4f5c\u533a\u3002\u4fdd\u5b58\u3001\u63d0\u4ea4\u3001\u5ba1\u6838\u3001\u6253\u6b3e\u548c\u8fd0\u884c\u6d4b\u8bd5\u5728\u771f\u6b63\u751f\u6548\u524d\u8fd8\u4f1a\u518d\u6b21\u786e\u8ba4\u6743\u9650\u3002",
    currentRoles: "\u5f53\u524d\u6743\u9650",
    currentSession: "\u5f53\u524d\u4f1a\u8bdd",
    envFallback: "\u670d\u52a1\u7aef\u515c\u5e95",
    invalidSession: "会话已失效",
    invalidSessionBody: "请重新登录，让 SkillHub 刷新当前工作区会话。",
    missingRole: "\u9700\u8981\u5f00\u901a\u6743\u9650",
    noSession: "\u9700\u8981\u5148\u767b\u5f55",
    noSessionBody:
      "\u8bf7\u5148\u901a\u8fc7\u7528\u6237\u540d/\u90ae\u7bb1\u5bc6\u7801\u3001\u5df2\u914d\u7f6e\u7684 Google/GitHub OAuth\uff0c\u6216\u9080\u8bf7/\u6062\u590d token \u8fdb\u5165\u5de5\u4f5c\u533a\u3002",
    org: "\u7ec4\u7ec7",
    requiredRoles: "\u51c6\u5165\u8981\u6c42",
    signInAction: "\u53bb\u767b\u5f55",
    token: "\u4f1a\u8bdd\u6765\u6e90",
    unavailableSession: "后台会话服务不可用",
    unavailableSessionBody: "后台 API 暂时无法校验当前会话。请确认 gateway 服务可用，或稍后刷新重试。",
    workspaceReady: "\u5de5\u4f5c\u533a\u53ef\u7528",
    workspaces: {
      admin: {
        body:
          "管理后台用于审核、上线就绪、身份目录、信任举报、事故、财务、提现、投递队列、Webhook 投递箱和审计。",
        title: "\u7ba1\u7406\u540e\u53f0\u8bbf\u95ee\u548c\u6cbb\u7406"
      },
      developer: {
        body:
          "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u7528\u4e8e\u9879\u76ee\u3001\u5b89\u88c5\u3001\u8fd0\u884c Key\u3001\u9879\u76ee\u7b56\u7565\u3001\u53d7\u6cbb\u7406\u6d4b\u8bd5\u3001\u5546\u4e1a\u5316\u51c6\u5907\u3001\u56e2\u961f\u3001\u901a\u77e5\u548c webhook\u3002",
        title: "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0\u8bbf\u95ee"
      },
      publisher: {
        body:
          "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u7528\u4e8e manifest \u8349\u7a3f\u3001\u7248\u672c\u5ba1\u6838\u3001\u4fee\u590d\u95ed\u73af\u3001\u5b9a\u4ef7\u963b\u65ad\u3001\u4e70\u65b9\u9700\u6c42\u3001\u53cd\u9988\u3001\u6536\u5165\u3001\u5546\u4e1a\u5316\u51c6\u5907\u548c\u901a\u77e5\u3002",
        title: "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u8bbf\u95ee"
      }
    }
  }
} as const;

export function WorkspaceAccessPanel({ locale, requiredRoles, returnTo, session, workspace }: WorkspaceAccessPanelProps) {
  const labels = copy[locale];
  const subject = session.subject;
  const roleSet = new Set([subject?.platformRole, ...(subject?.roles ?? [])].filter(Boolean));
  const hasRequiredRole = requiredRoles.some((role) => roleSet.has(role));
  const hasSession = Boolean(subject);
  const state =
    session.status === "unavailable"
      ? "unavailable"
      : session.status === "invalid"
        ? "invalid"
        : hasSession && hasRequiredRole
          ? "ready"
          : hasSession
            ? "missing_role"
            : "no_session";
  const workspaceCopy = labels.workspaces[workspace];
  const accessHref = hasSession
    ? localizedHref("/account", locale)
    : localizedHrefWithReturnTo("/login", locale, returnTo ?? `/${workspace}`);

  return (
    <article className={`ops-panel workspace-access-panel workspace-access-panel--${state}`}>
      <div className="workspace-access-panel__main">
        <div className="card-kicker">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.currentSession}</span>
        </div>
        <h2>{workspaceCopy.title}</h2>
        <p>{formatAccessBody(state, workspaceCopy.body, labels)}</p>
        <div className="workspace-access-panel__status">
          <span className={state === "ready" ? "status-chip" : "status-chip status-chip--warning"}>
            {formatAccessStateLabel(state, labels)}
          </span>
          <a className="ghost-button ghost-button--inline" href={accessHref}>
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
          <strong>{subject ? formatRoles([subject.platformRole, ...subject.roles], locale) : labels.noSession}</strong>
        </div>
        <div className="workspace-access-meta">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.requiredRoles}</span>
          <strong>{formatRequiredAccess(workspace, locale)}</strong>
        </div>
        <div className="workspace-access-meta">
          <KeyRound size={16} aria-hidden="true" />
          <span>{labels.token}</span>
          <strong>{formatSessionSource(session, locale)}</strong>
        </div>
        <div className="workspace-access-note">
          <strong>{labels.actionRules}</strong>
          <span>{labels.actionRulesBody}</span>
        </div>
      </div>
    </article>
  );
}

function formatAccessBody(
  state: "invalid" | "missing_role" | "no_session" | "ready" | "unavailable",
  fallback: string,
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (state === "unavailable") {
    return labels.unavailableSessionBody;
  }

  if (state === "invalid") {
    return labels.invalidSessionBody;
  }

  return fallback;
}

function formatAccessStateLabel(
  state: "invalid" | "missing_role" | "no_session" | "ready" | "unavailable",
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (state === "ready") {
    return labels.workspaceReady;
  }

  if (state === "missing_role") {
    return labels.missingRole;
  }

  if (state === "invalid") {
    return labels.invalidSession;
  }

  if (state === "unavailable") {
    return labels.unavailableSession;
  }

  return labels.noSession;
}

function formatRoles(roles: string[], locale: Locale) {
  const uniqueRoles = Array.from(new Set(roles.filter(Boolean)));
  if (uniqueRoles.length === 0) {
    return locale === "zh" ? "\u666e\u901a\u7528\u6237" : "User";
  }

  return uniqueRoles.map((role) => formatRole(role, locale)).join(" / ");
}

function formatRole(role: string, locale: Locale) {
  if (locale === "zh") {
    const zhRoles: Record<string, string> = {
      admin: "\u7ba1\u7406\u5458",
      developer: "\u5f00\u53d1\u8005",
      finance: "\u8d22\u52a1\u8fd0\u8425",
      owner: "\u7ec4\u7ec7\u8d1f\u8d23\u4eba",
      publisher: "\u53d1\u5e03\u8005",
      reviewer: "\u5ba1\u6838\u8fd0\u8425",
      super_admin: "\u7cfb\u7edf\u7ba1\u7406\u5458",
      support: "\u652f\u6301\u8fd0\u8425",
      user: "\u666e\u901a\u7528\u6237",
    };
    return zhRoles[role] ?? role.replaceAll("_", " ");
  }

  const enRoles: Record<string, string> = {
    admin: "Admin",
    developer: "Developer",
    finance: "Finance operator",
    owner: "Organization owner",
    publisher: "Publisher",
    reviewer: "Review operator",
    super_admin: "System admin",
    support: "Support operator",
    user: "User",
  };
  return enRoles[role] ?? role.replaceAll("_", " ");
}

function formatRequiredAccess(workspace: WorkspaceAccessPanelProps["workspace"], locale: Locale) {
  const requiredAccess = {
    en: {
      admin: "Operations, finance, support, review, or system admin access",
      developer: "Developer, organization owner, or admin access",
      publisher: "Publisher, organization owner, or admin access",
    },
    zh: {
      admin: "\u8fd0\u8425\u3001\u8d22\u52a1\u3001\u652f\u6301\u3001\u5ba1\u6838\u6216\u7cfb\u7edf\u7ba1\u7406\u6743\u9650",
      developer: "\u5f00\u53d1\u8005\u3001\u7ec4\u7ec7\u8d1f\u8d23\u4eba\u6216\u7ba1\u7406\u5458\u6743\u9650",
      publisher: "\u53d1\u5e03\u8005\u3001\u7ec4\u7ec7\u8d1f\u8d23\u4eba\u6216\u7ba1\u7406\u5458\u6743\u9650",
    },
  } as const;

  return requiredAccess[locale][workspace];
}

function formatSessionSource(session: WorkspaceSession, locale: Locale) {
  if (session.status === "unavailable") {
    return locale === "zh" ? "后台会话服务不可用" : "Session service unavailable";
  }

  if (session.status === "invalid") {
    return locale === "zh" ? "会话已失效" : "Invalid session";
  }

  if (locale === "zh") {
    const zhSources: Record<WorkspaceSession["source"], string> = {
      cookie: "\u5df2\u767b\u5f55\u8d26\u53f7",
      environment: "\u670d\u52a1\u7aef\u8fd0\u8425\u4f1a\u8bdd",
      none: "\u672a\u767b\u5f55",
    };
    return zhSources[session.source];
  }

  const enSources: Record<WorkspaceSession["source"], string> = {
    cookie: "Signed-in account",
    environment: "Server operator session",
    none: "Not signed in",
  };
  return enSources[session.source];
}
