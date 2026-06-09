import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UploadCloud,
  UserCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WorkspaceSession } from "@/lib/auth-session";
import { localizedHref, type Locale } from "@/lib/i18n";

type ConsoleAccessPanelProps = {
  locale: Locale;
  session: WorkspaceSession;
  variant?: "full" | "compact";
};

type ConsoleAccessCard = {
  description: string;
  href: string;
  icon: LucideIcon;
  path: string;
  requiredRoles: string[];
  role: string;
  title: string;
};

const copy = {
  en: {
    actionAccount: "Open account",
    actionOpen: "Open console",
    actionReview: "Review account",
    actionSignIn: "Sign in first",
    available: "Available for this session",
    blocked: "Sign-in required",
    body:
      "SkillHub's backend is split by job: account access, developer runtime operations, publisher supply operations, and platform governance.",
    compactBody: "Choose the right workspace before operating projects, publishing, money states, or admin queues.",
    connected: "Workspace connected",
    eyebrow: "Console access",
    forbidden: "Role required",
    noSharedPassword: "No shared password",
    noSharedPasswordBody:
      "Production access uses username/email password, configured Google/GitHub OAuth, or invite/recovery tokens. Raw tokens and passwords are never published as page copy.",
    oauthRule: "OAuth readiness is visible",
    oauthRuleBody:
      "If Google or GitHub is not configured, the login page shows callback URLs and missing environment names instead of fake buttons.",
    sessionLabel: "Current session",
    title: "Where the backend lives.",
    tokenRule: "Token fallback is limited",
    tokenRuleBody:
      "User tokens remain for bootstrap, invitations, and recovery. Product users should enter through login and account center.",
    cards: {
      account: {
        description: "Sign in, verify email access, inspect connected identities, session fingerprints, roles, and workspace readiness.",
        path: "/login -> /account",
        role: "All users",
        title: "Login and account center"
      },
      admin: {
        description: "Operate review queues, launch readiness, identity directory, trust reports, incidents, ledger, payouts, and delivery outbox.",
        path: "/admin",
        role: "Reviewer / finance / admin",
        title: "Admin operations"
      },
      developer: {
        description: "Create projects, manage installed skills, runtime keys, policies, tests, buyer requests, billing, team, and webhooks.",
        path: "/developer",
        role: "Developer / owner",
        title: "Developer workspace"
      },
      publisher: {
        description: "Upload skills, manage review repair, pricing blockers, buyer demand, feedback, revenue, payout readiness, and notifications.",
        path: "/publisher",
        role: "Publisher / owner",
        title: "Publisher workspace"
      }
    }
  },
  zh: {
    actionAccount: "\u6253\u5f00\u8d26\u53f7\u4e2d\u5fc3",
    actionOpen: "\u6253\u5f00\u540e\u53f0",
    actionReview: "\u68c0\u67e5\u8d26\u53f7",
    actionSignIn: "\u5148\u53bb\u767b\u5f55",
    available: "\u5f53\u524d\u4f1a\u8bdd\u53ef\u8fdb\u5165",
    blocked: "\u9700\u8981\u5148\u767b\u5f55",
    body:
      "SkillHub \u7684\u540e\u53f0\u4e0d\u662f\u5355\u4e2a\u9690\u85cf\u9875\uff0c\u800c\u662f\u6309\u4efb\u52a1\u5206\u6210\u8d26\u53f7\u3001\u5f00\u53d1\u8005\u3001\u53d1\u5e03\u8005\u548c\u5e73\u53f0\u8fd0\u8425\u56db\u4e2a\u5165\u53e3\u3002",
    compactBody:
      "\u64cd\u4f5c\u9879\u76ee\u3001\u53d1\u5e03\u6280\u80fd\u3001\u5904\u7406\u8d26\u672c\u6216\u5ba1\u6838\u961f\u5217\u524d\uff0c\u5148\u8fdb\u5165\u6b63\u786e\u7684\u5de5\u4f5c\u533a\u3002",
    connected: "\u5df2\u8fde\u63a5\u5de5\u4f5c\u533a",
    eyebrow: "\u540e\u53f0\u5165\u53e3",
    forbidden: "\u9700\u8981\u5bf9\u5e94\u89d2\u8272",
    noSharedPassword: "\u6ca1\u6709\u516c\u5171\u5bc6\u7801",
    noSharedPasswordBody:
      "\u6b63\u5f0f\u8bbf\u95ee\u4f7f\u7528\u7528\u6237\u540d/\u90ae\u7bb1\u5bc6\u7801\u3001\u5df2\u914d\u7f6e\u7684 Google/GitHub OAuth\uff0c\u6216\u9080\u8bf7/\u6062\u590d token\u3002\u539f\u59cb token \u548c\u5bc6\u7801\u4e0d\u4f1a\u5199\u5728\u9875\u9762\u91cc\u3002",
    oauthRule: "OAuth \u72b6\u6001\u53ef\u89c1",
    oauthRuleBody:
      "Google \u6216 GitHub \u672a\u914d\u7f6e\u65f6\uff0c\u767b\u5f55\u9875\u4f1a\u663e\u793a\u56de\u8c03\u5730\u5740\u548c\u7f3a\u5931\u73af\u5883\u53d8\u91cf\uff0c\u4e0d\u4f1a\u505a\u6210\u5047\u6309\u94ae\u3002",
    sessionLabel: "\u5f53\u524d\u4f1a\u8bdd",
    title: "\u540e\u53f0\u5165\u53e3\u5728\u8fd9\u91cc\u3002",
    tokenRule: "Token \u53ea\u662f\u515c\u5e95",
    tokenRuleBody:
      "\u7528\u6237 token \u53ea\u7528\u4e8e\u521d\u59cb\u542f\u52a8\u3001\u56e2\u961f\u9080\u8bf7\u548c\u8fd0\u8425\u6062\u590d\u3002\u6b63\u5e38\u4ea7\u54c1\u7528\u6237\u5e94\u4ece\u767b\u5f55\u548c\u8d26\u53f7\u4e2d\u5fc3\u8fdb\u5165\u3002",
    cards: {
      account: {
        description:
          "\u767b\u5f55\u3001\u9a8c\u8bc1\u90ae\u7bb1\u3001\u67e5\u770b\u7ed1\u5b9a\u8eab\u4efd\u3001\u4f1a\u8bdd\u6307\u7eb9\u3001\u89d2\u8272\u548c\u5de5\u4f5c\u533a\u51c6\u5907\u5ea6\u3002",
        path: "/login -> /account",
        role: "\u6240\u6709\u7528\u6237",
        title: "\u767b\u5f55\u548c\u8d26\u53f7\u4e2d\u5fc3"
      },
      admin: {
        description:
          "\u5904\u7406\u5ba1\u6838\u961f\u5217\u3001\u4e0a\u7ebf\u5c31\u7eea\u5ea6\u3001\u8eab\u4efd\u76ee\u5f55\u3001\u4fe1\u4efb\u4e3e\u62a5\u3001\u4e8b\u6545\u3001\u8d26\u672c\u3001\u63d0\u73b0\u548c\u6295\u9012\u961f\u5217\u3002",
        path: "/admin",
        role: "\u5ba1\u6838 / \u8d22\u52a1 / \u7ba1\u7406\u5458",
        title: "\u5e73\u53f0\u8fd0\u8425\u540e\u53f0"
      },
      developer: {
        description:
          "\u521b\u5efa\u9879\u76ee\u3001\u7ba1\u7406\u5df2\u5b89\u88c5\u6280\u80fd\u3001\u8fd0\u884c Key\u3001\u7b56\u7565\u3001\u6d4b\u8bd5\u3001\u4e70\u65b9\u9700\u6c42\u3001\u8d26\u5355\u3001\u56e2\u961f\u548c webhook\u3002",
        path: "/developer",
        role: "\u5f00\u53d1\u8005 / \u8d1f\u8d23\u4eba",
        title: "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0"
      },
      publisher: {
        description:
          "\u4e0a\u4f20\u6280\u80fd\u3001\u4fee\u590d\u5ba1\u6838\u95ee\u9898\u3001\u5904\u7406\u5b9a\u4ef7\u963b\u65ad\u3001\u4e70\u65b9\u9700\u6c42\u3001\u53cd\u9988\u3001\u6536\u5165\u3001\u63d0\u73b0\u51c6\u5907\u548c\u901a\u77e5\u3002",
        path: "/publisher",
        role: "\u53d1\u5e03\u8005 / \u8d1f\u8d23\u4eba",
        title: "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0"
      }
    }
  }
} as const;

export function ConsoleAccessPanel({ locale, session, variant = "full" }: ConsoleAccessPanelProps) {
  const labels = copy[locale];
  const cards: ConsoleAccessCard[] = [
    {
      ...labels.cards.account,
      href: session.subject ? "/account" : "/login",
      icon: UserCircle,
      requiredRoles: []
    },
    {
      ...labels.cards.developer,
      href: "/developer",
      icon: BriefcaseBusiness,
      requiredRoles: ["developer", "owner", "admin", "super_admin"]
    },
    {
      ...labels.cards.publisher,
      href: "/publisher",
      icon: UploadCloud,
      requiredRoles: ["publisher", "owner", "admin", "super_admin"]
    },
    {
      ...labels.cards.admin,
      href: "/admin",
      icon: ShieldCheck,
      requiredRoles: ["reviewer", "finance", "support", "admin", "super_admin"]
    }
  ];
  const sessionState = session.subject ? labels.connected : labels.blocked;

  return (
    <section className={`console-access-panel console-access-panel--${variant}`} aria-labelledby="console-access-heading">
      <div className="console-access-copy">
        <div className="eyebrow">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{labels.eyebrow}</span>
        </div>
        <h2 id="console-access-heading">{labels.title}</h2>
        <p>{variant === "compact" ? labels.compactBody : labels.body}</p>
        <div className="console-access-session">
          <KeyRound size={16} aria-hidden="true" />
          <span>{labels.sessionLabel}</span>
          <strong>{sessionState}</strong>
        </div>
        <div className="console-access-rules">
          <AccessRule icon={BadgeCheck} title={labels.noSharedPassword} body={labels.noSharedPasswordBody} />
          <AccessRule icon={ShieldCheck} title={labels.oauthRule} body={labels.oauthRuleBody} />
          <AccessRule icon={KeyRound} title={labels.tokenRule} body={labels.tokenRuleBody} />
        </div>
      </div>

      <div className="console-access-card-grid">
        {cards.map((card) => {
          const state = getCardState(card, session, labels);
          const actionHref = getActionHref(card, state.kind);
          const Icon = card.icon;

          return (
            <article className={`console-access-card console-access-card--${state.kind}`} key={card.href}>
              <div className="console-access-card__head">
                <span className="console-access-card__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={state.kind === "available" ? "status-chip" : "status-chip status-chip--warning"}>
                  {state.label}
                </span>
              </div>
              <div className="console-access-card__body">
                <strong>{card.title}</strong>
                <span>{card.role}</span>
                <code>{card.path}</code>
                <p>{card.description}</p>
              </div>
              <a className="secondary-button secondary-button--compact" href={localizedHref(actionHref, locale)}>
                {state.action}
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AccessRule({ body, icon: Icon, title }: { body: string; icon: LucideIcon; title: string }) {
  return (
    <div className="console-access-rule">
      <Icon size={16} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <span>{body}</span>
      </div>
    </div>
  );
}

function getCardState(
  card: ConsoleAccessCard,
  session: WorkspaceSession,
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (!session.subject) {
    return {
      action: labels.actionSignIn,
      kind: "blocked" as const,
      label: labels.blocked
    };
  }

  if (card.requiredRoles.length === 0) {
    return {
      action: labels.actionAccount,
      kind: "available" as const,
      label: labels.connected
    };
  }

  const roleSet = new Set([session.subject.platformRole, ...session.subject.roles].filter(Boolean));
  const hasRole = card.requiredRoles.some((role) => roleSet.has(role));

  if (!hasRole) {
    return {
      action: labels.actionReview,
      kind: "forbidden" as const,
      label: labels.forbidden
    };
  }

  return {
    action: labels.actionOpen,
    kind: "available" as const,
    label: labels.available
  };
}

function getActionHref(card: ConsoleAccessCard, state: "available" | "blocked" | "forbidden") {
  if (state === "blocked") {
    return "/login";
  }

  if (state === "forbidden") {
    return "/account";
  }

  return card.href;
}
