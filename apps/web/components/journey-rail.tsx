import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Code2,
  GitBranch,
  KeyRound,
  ListChecks,
  PackageCheck,
  Route,
  ShieldCheck,
  Terminal,
  WalletCards
} from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type JourneyId = "admin" | "developer" | "publisher";
type DeveloperStep = "marketplace" | "skill" | "developer" | "project" | "runtime";
type PublisherStep = "publish" | "publisher" | "review" | "commercial" | "improve";
type AdminStep = "admin" | "readiness" | "review" | "finance" | "delivery";

type JourneyStepId = DeveloperStep | PublisherStep | AdminStep;

type JourneyStep = {
  action: string;
  detail: string;
  href: string;
  id: JourneyStepId;
  label: string;
};
type JourneyCopy = {
  body: string;
  current: string;
  next: string;
  steps: JourneyStep[];
  title: string;
};

const journeyIcons = {
  admin: ShieldCheck,
  developer: Code2,
  publisher: PackageCheck
} as const;

const stepIcons = [Route, BadgeCheck, KeyRound, Terminal, WalletCards] as const;

const copy: Record<Locale, Record<JourneyId, JourneyCopy>> = {
  en: {
    admin: {
      body:
        "The operator path proves SkillHub is governable: readiness, review, trust, money-state controls, delivery, and audit stay in one command center.",
      current: "Current",
      next: "Next",
      steps: [
        {
          action: "Open admin",
          detail: "Start from the operating console.",
          href: "/admin",
          id: "admin",
          label: "Admin console"
        },
        {
          action: "Check readiness",
          detail: "Inspect launch blockers, migrations, templates, and credibility thresholds.",
          href: "/admin#launch-readiness",
          id: "readiness",
          label: "Launch readiness"
        },
        {
          action: "Process reviews",
          detail: "Use SLA, risk, and automated evidence to approve, reject, or block.",
          href: "/admin",
          id: "review",
          label: "Reviews and trust"
        },
        {
          action: "Review finance",
          detail: "Review billing ledger, refunds, disputes, commissions, and payout decisions before paid access changes.",
          href: "/admin",
          id: "finance",
          label: "Finance review model"
        },
        {
          action: "Inspect audit",
          detail: "Recover email/webhook delivery and verify every privileged action.",
          href: "/admin",
          id: "delivery",
          label: "Delivery and audit"
        }
      ],
      title: "Admin governance journey"
    },
    developer: {
      body:
        "The developer path proves SkillHub is more than a directory: public discovery can become authenticated project state, runtime governance, logs, cost, and updates after sign-in and policy checks.",
      current: "Current",
      next: "Next",
      steps: [
        {
          action: "Browse marketplace",
          detail: "Search, filter, and compare trust, runtime, pricing, and publisher signals.",
          href: "/marketplace",
          id: "marketplace",
          label: "Marketplace"
        },
        {
          action: "Inspect a skill",
          detail: "Review manifest, permissions, examples, feedback, incidents, and alternatives.",
          href: "/marketplace#catalog",
          id: "skill",
          label: "Skill detail"
        },
        {
          action: "Open developer",
          detail: "Create projects, manage team, billing, webhooks, and buyer requests.",
          href: "/developer",
          id: "developer",
          label: "Developer workspace"
        },
        {
          action: "Open project",
          detail: "Pin versions, approve policy, create keys, and manage updates.",
          href: "/developer",
          id: "project",
          label: "Project command"
        },
        {
          action: "Run governed test",
          detail: "Use REST or MCP through the same policy, budget, subscription, and log path.",
          href: "/agents",
          id: "runtime",
          label: "Runtime test"
        }
      ],
      title: "Authenticated project path"
    },
    publisher: {
      body:
        "The publisher path proves authors have repeat work: draft packaging, exact-version review, repair, pricing intent, feedback, buyer demand, and commercial readiness.",
      current: "Current",
      next: "Next",
      steps: [
        {
          action: "Start publishing",
          detail: "Paste a manifest, run preflight, save an organization-scoped draft.",
          href: "/publish",
          id: "publish",
          label: "Publish entry"
        },
        {
          action: "Open publisher",
          detail: "Operate owned skills, versions, buyer demand, notifications, and commercial readiness signals.",
          href: "/publisher",
          id: "publisher",
          label: "Publisher workspace"
        },
        {
          action: "Repair review",
          detail: "Use reviewer notes, SLA, automated evidence, target fields, and next actions.",
          href: "/publisher#publisher-skills",
          id: "review",
          label: "Review repair"
        },
        {
          action: "Clear commercial gates",
          detail: "Complete profile, terms, commercial readiness, verified review, and pricing intent.",
          href: "/publisher#publisher-paid-readiness",
          id: "commercial",
          label: "Paid-readiness metadata"
        },
        {
          action: "Improve listing",
          detail: "Respond to feedback, buyer requests, commercial signals, refund/dispute notices, and placement appeals.",
          href: "/publisher",
          id: "improve",
          label: "Improve and retain"
        }
      ],
      title: "Publisher review and readiness journey"
    }
  },
  zh: {
    admin: {
      body:
        "\u540e\u53f0\u8def\u5f84\u8bc1\u660e SkillHub \u662f\u53ef\u8fd0\u8425\u7684\uff1a\u4e0a\u7ebf\u5c31\u7eea\u3001\u5ba1\u6838\u3001\u98ce\u9669\u3001\u8d44\u91d1\u3001\u6295\u9012\u548c\u5ba1\u8ba1\u90fd\u5728\u540c\u4e00\u4e2a\u6307\u6325\u4e2d\u5fc3\u3002",
      current: "\u5f53\u524d",
      next: "\u4e0b\u4e00\u6b65",
      steps: [
        {
          action: "\u6253\u5f00\u540e\u53f0",
          detail: "\u4ece\u8fd0\u8425\u63a7\u5236\u53f0\u5f00\u59cb\u3002",
          href: "/admin",
          id: "admin",
          label: "\u540e\u53f0\u63a7\u5236\u53f0"
        },
        {
          action: "\u68c0\u67e5\u5c31\u7eea\u5ea6",
          detail: "\u68c0\u67e5\u4e0a\u7ebf\u963b\u65ad\u3001\u8fc1\u79fb\u3001\u6a21\u677f\u548c\u53ef\u4fe1\u9608\u503c\u3002",
          href: "/admin#launch-readiness",
          id: "readiness",
          label: "\u4e0a\u7ebf\u5c31\u7eea"
        },
        {
          action: "\u5904\u7406\u5ba1\u6838",
          detail: "\u6839\u636e SLA\u3001\u98ce\u9669\u548c\u81ea\u52a8\u8bc1\u636e\u6279\u51c6\u3001\u62d2\u7edd\u6216\u963b\u65ad\u3002",
          href: "/admin",
          id: "review",
          label: "\u5ba1\u6838\u4e0e\u4fe1\u4efb"
        },
        {
          action: "\u590d\u6838\u8d22\u52a1",
          detail: "\u8fd0\u8425\u8d26\u672c\u3001\u9000\u6b3e\u3001\u4e89\u8bae\u3001\u4f63\u91d1\u548c\u63d0\u73b0\u51b3\u7b56\u3002",
          href: "/admin",
          id: "finance",
          label: "\u8d22\u52a1\u4e0e\u63d0\u73b0"
        },
        {
          action: "\u67e5\u770b\u5ba1\u8ba1",
          detail: "\u6062\u590d\u90ae\u4ef6/webhook \u6295\u9012\uff0c\u6838\u5bf9\u6bcf\u4e2a\u7279\u6743\u52a8\u4f5c\u3002",
          href: "/admin",
          id: "delivery",
          label: "\u6295\u9012\u4e0e\u5ba1\u8ba1"
        }
      ],
      title: "\u540e\u53f0\u6cbb\u7406\u8def\u5f84"
    },
    developer: {
      body:
        "\u5f00\u53d1\u8005\u8def\u5f84\u8bc1\u660e SkillHub \u4e0d\u662f\u9759\u6001\u76ee\u5f55\uff1a\u516c\u5f00\u53d1\u73b0\u53ef\u4ee5\u5728\u767b\u5f55\u548c\u7b56\u7565\u68c0\u67e5\u540e\u53d8\u6210\u9879\u76ee\u72b6\u6001\u3001\u8fd0\u884c\u6cbb\u7406\u3001\u65e5\u5fd7\u3001\u6210\u672c\u548c\u66f4\u65b0\u3002",
      current: "\u5f53\u524d",
      next: "\u4e0b\u4e00\u6b65",
      steps: [
        {
          action: "\u6d4f\u89c8\u5e02\u573a",
          detail: "\u641c\u7d22\u3001\u7b5b\u9009\u5e76\u6bd4\u8f83\u4fe1\u4efb\u3001\u8fd0\u884c\u3001\u4ef7\u683c\u548c\u53d1\u5e03\u8005\u4fe1\u53f7\u3002",
          href: "/marketplace",
          id: "marketplace",
          label: "\u5e02\u573a"
        },
        {
          action: "\u68c0\u67e5\u6280\u80fd",
          detail: "\u67e5\u770b manifest\u3001\u6743\u9650\u3001\u793a\u4f8b\u3001\u53cd\u9988\u3001\u4e8b\u6545\u548c\u66ff\u4ee3\u6280\u80fd\u3002",
          href: "/marketplace#catalog",
          id: "skill",
          label: "\u6280\u80fd\u8be6\u60c5"
        },
        {
          action: "\u6253\u5f00\u5f00\u53d1\u8005",
          detail: "\u521b\u5efa\u9879\u76ee\uff0c\u7ba1\u7406\u56e2\u961f\u3001\u8d26\u5355\u3001webhook \u548c\u4e70\u65b9\u9700\u6c42\u3002",
          href: "/developer",
          id: "developer",
          label: "\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0"
        },
        {
          action: "\u6253\u5f00\u9879\u76ee",
          detail: "\u56fa\u5b9a\u7248\u672c\u3001\u6279\u51c6\u7b56\u7565\u3001\u521b\u5efa Key \u5e76\u5904\u7406\u66f4\u65b0\u3002",
          href: "/developer",
          id: "project",
          label: "\u9879\u76ee\u6307\u6325\u53f0"
        },
        {
          action: "\u8fd0\u884c\u6cbb\u7406\u6d4b\u8bd5",
          detail: "\u901a\u8fc7\u540c\u4e00\u6761\u7b56\u7565\u3001\u9884\u7b97\u3001\u8ba2\u9605\u548c\u65e5\u5fd7\u8def\u5f84\u8c03\u7528 REST \u6216 MCP\u3002",
          href: "/agents",
          id: "runtime",
          label: "\u8fd0\u884c\u6d4b\u8bd5"
        }
      ],
      title: "\u8ba4\u8bc1\u9879\u76ee\u8def\u5f84"
    },
    publisher: {
      body:
        "发布者路径证明作者有持续回来的工作：草稿打包、精确版本审核、修复、商业化准备、反馈和买方需求。",
      current: "\u5f53\u524d",
      next: "\u4e0b\u4e00\u6b65",
      steps: [
        {
          action: "\u5f00\u59cb\u53d1\u5e03",
          detail: "\u7c98\u8d34 manifest\uff0c\u8fd0\u884c\u9884\u68c0\uff0c\u4fdd\u5b58\u7ec4\u7ec7\u8303\u56f4\u8349\u7a3f\u3002",
          href: "/publish",
          id: "publish",
          label: "\u53d1\u5e03\u5165\u53e3"
        },
        {
          action: "\u6253\u5f00\u5de5\u4f5c\u53f0",
          detail: "\u8fd0\u8425\u5df2\u62e5\u6709\u6280\u80fd\u3001\u7248\u672c\u3001\u4e70\u65b9\u9700\u6c42\u3001\u901a\u77e5\u548c\u5546\u4e1a\u5316\u51c6\u5907\u4fe1\u53f7\u3002",
          href: "/publisher",
          id: "publisher",
          label: "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0"
        },
        {
          action: "\u4fee\u590d\u5ba1\u6838",
          detail: "\u6839\u636e\u5ba1\u6838\u5907\u6ce8\u3001SLA\u3001\u81ea\u52a8\u8bc1\u636e\u3001\u76ee\u6807\u5b57\u6bb5\u548c\u4e0b\u4e00\u6b65\u5904\u7406\u3002",
          href: "/publisher#publisher-skills",
          id: "review",
          label: "\u5ba1\u6838\u4fee\u590d"
        },
        {
          action: "\u6e05\u7406\u5546\u4e1a\u5316\u95e8\u69db",
          detail: "完成资料、条款、商业化准备、已验证审核和价格状态。",
          href: "/publisher#publisher-paid-readiness",
          id: "commercial",
          label: "商业化准备"
        },
        {
          action: "\u6539\u8fdb\u4e0a\u67b6",
          detail: "\u54cd\u5e94\u53cd\u9988\u3001\u4e70\u65b9\u9700\u6c42\u3001\u5546\u4e1a\u5316\u4fe1\u53f7\u3001\u9000\u6b3e/\u4e89\u8bae\u901a\u77e5\u548c\u5206\u53d1\u7533\u8bc9\u3002",
          href: "/publisher",
          id: "improve",
          label: "\u6539\u8fdb\u4e0e\u7559\u5b58"
        }
      ],
      title: "\u53d1\u5e03\u8005\u5ba1\u6838\u548c\u51c6\u5907\u8def\u5f84"
    }
  }
};

const developerInspectionCopy: Record<Locale, JourneyCopy> = {
  en: {
    body:
      "Submitted skills stay inspection-only: developers can review the public contract now, while install, project handoff, runtime test, billing, and ledger actions unlock only after verified approval.",
    current: "Current",
    next: "Next",
    steps: [
      {
        action: "Browse marketplace",
        detail: "Find public listings and compare review state, permissions, runtime type, and publisher signals.",
        href: "/marketplace",
        id: "marketplace",
        label: "Marketplace"
      },
      {
        action: "Inspect contract",
        detail: "Review manifest, schemas, permissions, publisher profile, and submitted review state.",
        href: "/marketplace#catalog",
        id: "skill",
        label: "Inspection detail"
      },
      {
        action: "Review required",
        detail: "A verified review must complete before this listing can be installed or tested.",
        href: "/docs",
        id: "developer",
        label: "Verification review"
      },
      {
        action: "Unlock after approval",
        detail: "Project install and policy handoff become available only for verified listings.",
        href: "/marketplace",
        id: "project",
        label: "Project install locked"
      },
      {
        action: "Unlock after project setup",
        detail: "Runtime invocation still requires a signed-in project key and policy checks after verification.",
        href: "/docs",
        id: "runtime",
        label: "Runtime test locked"
      }
    ],
    title: "Public inspection journey"
  },
  zh: {
    body:
      "\u5df2\u63d0\u4ea4\u6280\u80fd\u4fdd\u6301\u4ec5\u53ef\u67e5\u770b\uff1a\u5f00\u53d1\u8005\u73b0\u5728\u53ef\u4ee5\u68c0\u67e5\u516c\u5f00\u5408\u7ea6\uff0c\u5b89\u88c5\u3001\u9879\u76ee\u4ea4\u63a5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u8ba1\u8d39\u548c\u8d26\u672c\u64cd\u4f5c\u53ea\u4f1a\u5728\u9a8c\u8bc1\u5ba1\u6838\u901a\u8fc7\u540e\u89e3\u9501\u3002",
    current: "\u5f53\u524d",
    next: "\u4e0b\u4e00\u6b65",
    steps: [
      {
        action: "\u6d4f\u89c8\u5e02\u573a",
        detail: "\u67e5\u627e\u516c\u5f00\u5217\u8868\uff0c\u6bd4\u8f83\u5ba1\u6838\u72b6\u6001\u3001\u6743\u9650\u3001\u8fd0\u884c\u7c7b\u578b\u548c\u53d1\u5e03\u8005\u4fe1\u53f7\u3002",
        href: "/marketplace",
        id: "marketplace",
        label: "\u5e02\u573a"
      },
      {
        action: "\u67e5\u770b\u5408\u7ea6",
        detail: "\u68c0\u67e5 manifest\u3001schema\u3001\u6743\u9650\u3001\u53d1\u5e03\u8005\u8d44\u6599\u548c\u5df2\u63d0\u4ea4\u5ba1\u6838\u72b6\u6001\u3002",
        href: "/marketplace#catalog",
        id: "skill",
        label: "\u67e5\u770b\u8be6\u60c5"
      },
      {
        action: "\u9700\u8981\u5ba1\u6838",
        detail: "\u5fc5\u987b\u5b8c\u6210\u9a8c\u8bc1\u5ba1\u6838\u540e\uff0c\u624d\u80fd\u5b89\u88c5\u6216\u6d4b\u8bd5\u8be5\u5217\u8868\u3002",
        href: "/docs",
        id: "developer",
        label: "\u9a8c\u8bc1\u5ba1\u6838"
      },
      {
        action: "\u5ba1\u6838\u540e\u89e3\u9501",
        detail: "\u53ea\u6709\u5df2\u9a8c\u8bc1\u5217\u8868\u624d\u4f1a\u5f00\u653e\u9879\u76ee\u5b89\u88c5\u548c\u7b56\u7565\u4ea4\u63a5\u3002",
        href: "/marketplace",
        id: "project",
        label: "\u9879\u76ee\u5b89\u88c5\u672a\u89e3\u9501"
      },
      {
        action: "\u9879\u76ee\u914d\u7f6e\u540e\u89e3\u9501",
        detail: "\u9a8c\u8bc1\u901a\u8fc7\u540e\uff0c\u8fd0\u884c\u8c03\u7528\u4ecd\u9700\u8981\u767b\u5f55\u540e\u7684\u9879\u76ee Key \u548c\u7b56\u7565\u68c0\u67e5\u3002",
        href: "/docs",
        id: "runtime",
        label: "\u8fd0\u884c\u6d4b\u8bd5\u672a\u89e3\u9501"
      }
    ],
    title: "\u516c\u5f00\u67e5\u770b\u8def\u5f84"
  }
};

export function JourneyRail({
  actionHrefOverride,
  actionLabelOverride,
  className,
  currentStep,
  developerMode = "install",
  journey,
  locale,
  publicSurface = false
}: {
  actionHrefOverride?: string;
  actionLabelOverride?: string;
  className?: string;
  currentStep: JourneyStepId;
  developerMode?: "inspection" | "install";
  journey: JourneyId;
  locale: Locale;
  publicSurface?: boolean;
}) {
  const labels =
    journey === "developer" && developerMode === "inspection"
      ? developerInspectionCopy[locale]
      : copy[locale][journey];
  const currentIndex = Math.max(
    labels.steps.findIndex((step) => step.id === currentStep),
    0
  );
  const current = labels.steps[currentIndex] ?? labels.steps[0];
  const next = labels.steps[currentIndex + 1] ?? current;
  const JourneyIcon = journeyIcons[journey];
  const hideOperatorAction = publicSurface && journey === "admin";
  const actionHref = actionHrefOverride ?? next.href;
  const actionLabel = actionLabelOverride ?? next.action;
  const operatorOnlyLabel =
    locale === "zh" ? "\u8fd0\u8425\u5458\u4f7f\u7528\u5355\u72ec\u94fe\u63a5" : "Operator direct link only";

  return (
    <section className={["journey-rail", `journey-rail--${journey}`, className].filter(Boolean).join(" ")} aria-label={labels.title}>
      <div className="journey-rail__copy">
        <div className="card-kicker">
          <JourneyIcon size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <p>{labels.body}</p>
        <div className="journey-rail__state">
          <span>
            {labels.current}
            <strong>{current.label}</strong>
          </span>
          <span>
            {labels.next}
            <strong>{next.label}</strong>
          </span>
        </div>
      </div>

      <ol className="journey-rail__steps">
        {labels.steps.map((step, index) => {
          const Icon = stepIcons[index] ?? ListChecks;
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";

          return (
            <li className={`journey-rail-step journey-rail-step--${state}`} key={step.id}>
              <span className="journey-rail-step__icon" aria-hidden="true">
                {state === "done" ? <ClipboardCheck size={15} /> : <Icon size={15} />}
              </span>
              <div>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </div>
            </li>
          );
        })}
      </ol>

      {hideOperatorAction ? (
        <span className="journey-rail__action journey-rail__action--locked">
          <span>{operatorOnlyLabel}</span>
          <ShieldCheck size={15} aria-hidden="true" />
        </span>
      ) : (
        <a className="journey-rail__action" href={localizedHref(actionHref, locale)}>
          <span>{actionLabel}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      )}
    </section>
  );
}

export function JourneyRailDeck({
  locale,
  publicSurface = false
}: {
  locale: Locale;
  publicSurface?: boolean;
}) {
  return (
    <section className="journey-rail-deck" aria-label={locale === "zh" ? "\u4e09\u6761 P0 \u4ea7\u54c1\u8def\u5f84" : "Three P0 product journeys"}>
      <div className="journey-rail-deck__head">
        <div className="card-kicker">
          <GitBranch size={16} aria-hidden="true" />
          <span>{locale === "zh" ? "P0 \u8def\u5f84\u56fe" : "P0 journey map"}</span>
        </div>
        <p>
          {locale === "zh"
            ? "\u4e09\u4e2a\u89d2\u8272\u5171\u7528\u4e00\u6761\u8fd0\u8425\u94fe\u8def\uff1a\u6280\u80fd\u4e0a\u67b6\u3001\u5ba1\u6838\u3001\u5b89\u88c5\u3001\u8fd0\u884c\u3001\u8bb0\u8d26\u3001\u63d0\u73b0\u548c\u5ba1\u8ba1\u3002"
            : "The three roles share one operating chain: publish, review, signed-in adoption, run, billing ledger, and audit."}
        </p>
      </div>
      <div className="journey-rail-deck__grid">
        <JourneyRail currentStep="marketplace" journey="developer" locale={locale} publicSurface={publicSurface} />
        <JourneyRail currentStep="publish" journey="publisher" locale={locale} publicSurface={publicSurface} />
        <JourneyRail currentStep="admin" journey="admin" locale={locale} publicSurface={publicSurface} />
      </div>
    </section>
  );
}
