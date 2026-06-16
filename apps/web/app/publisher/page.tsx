import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  CircleDot,
  ClipboardList,
  ListChecks,
  PackageCheck,
  RotateCcw,
  ShieldAlert,
  WalletCards
} from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { JourneyRail } from "@/components/journey-rail";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { PublisherAccountManager } from "@/components/publisher-account-manager";
import { PublisherPayoutManager } from "@/components/publisher-payout-manager";
import { PublisherSkillManager } from "@/components/publisher-skill-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, hrefWithReturnTo, localizedHref, localizedHrefWithReturnTo, type Locale } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  getNotificationPreferences,
  getPublisherAccountSummary,
  getPublisherBuyerRequests,
  getPublisherDisputes,
  getPublisherFinanceLedger,
  getPublisherPayoutSummary,
  getPublisherRefunds,
  getPublisherSkills,
  getUserNotificationInbox,
  type BuyerRequestRecord,
  type PublisherCommercialBlocker,
  type PublisherPayoutSummary,
  type PublisherSkillRecord
} from "@/lib/ops-data";
import { getPublisherPageCopy, type PublisherPageCopy } from "@/lib/publisher-page-copy";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Publisher Workspace");

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ReadinessTask = {
  detail: string;
  id: "session" | "profile" | "terms" | "publish" | "verified" | "payout";
  status: "blocked" | "current" | "done";
  title: string;
};

type PublisherPriorityItem = {
  actionLabel: string;
  detail: string;
  href: string;
  id: string;
  metric: string;
  priority: number;
  title: string;
  tone: "danger" | "ready" | "warning";
};

type CommercialSkillRow = {
  blockers: PublisherCommercialBlocker[];
  billingModel: PublisherSkillRecord["pricing"]["billingModel"];
  displayName: string;
  priceStatus: PublisherSkillRecord["pricing"]["status"];
  ready: boolean;
  reviewStatus: string | null;
  slug: string;
  unitAmountCents: number;
};

const CURRENT_TERMS_VERSION = "2026-06-05-prelaunch-operating-terms";
const publisherAccessRoles = ["publisher", "owner", "admin", "super_admin"];

const publisherCommandCopy = {
  en: {
    body:
      "The publisher workspace should behave like an operating queue: onboarding, review, buyer demand, paid-readiness metadata, paid-preview ledger, and finance-gated payout readiness all point to one next move.",
    completeAction: "Review publisher operations",
    completeDetail:
      "Core publisher readiness is complete. Monitor review evidence, buyer demand, paid-preview ledger state, feedback, finance-gated payout readiness, and marketplace placement.",
    completeTitle: "Keep the supply loop healthy",
    eyebrow: "Publisher operations queue",
    ready: "Ready",
    title: "What should the publisher do next?",
    actions: {
      payout: "Open paid-readiness metadata",
      profile: "Complete publisher account",
      publish: "Publish a skill",
      session: "Sign in",
      terms: "Accept terms",
      verified: "Open skill workbench"
    },
    metrics: {
      demand: "Buyer demand",
      payout: "Paid preview state",
      pricing: "Paid blockers",
      readiness: "Launch readiness",
      review: "Review work"
    },
    queue: {
      blockedMetric: "Blocked",
      nextMetric: "Next",
      readyMetric: "Healthy",
      readyTitle: "Supply loop is healthy",
      readyDetail:
        "No urgent publisher blockers are visible. Keep watching reviews, feedback, buyer demand, paid-preview ledger state, finance-gated payout readiness, and marketplace placement.",
      title: "Priority queue"
    },
    queueActions: {
      account: "Open publisher account",
      demand: "Open demand board",
      distribution: "Review marketplace placement",
      feedback: "Open feedback responses",
      ledger: "Review adjustments",
      monitor: "Review publisher operations",
      payout: "Open paid-readiness metadata",
      pricing: "Open paid readiness",
      review: "Open skill workbench",
      runtime: "Open review evidence"
    },
    queueItems: {
      adjustments: "Refund or dispute needs a publisher response",
      demand: "Buyer request is waiting for a publisher action",
      distribution: "Marketplace placement needs improvement or appeal follow-up",
      feedback: "Published buyer feedback needs a publisher response",
      payoutReady: "Paid-preview payout review is ready",
      payoutBlocked: "Paid-preview payout readiness is blocked",
      pricing: "Paid-preview review is blocked",
      reviewRepair: "Review repair is blocking a skill",
      reviewSla: "Review SLA needs follow-up",
      runtime: "Runtime check needs repair"
    },
    queueTitles: {
      adjustments: "Refund/dispute watch",
      demand: "Buyer demand",
      distribution: "Marketplace distribution",
      feedback: "Feedback responses",
      payout: "Paid-preview payout readiness",
      pricing: "Paid-preview review",
      reviewRepair: "Review repair",
      reviewSla: "Review SLA",
      runtime: "Runtime checks"
    },
    queueTones: {
      danger: "Urgent",
      ready: "Ready",
      warning: "Needs work"
    }
  },
  zh: {
    body:
      "发布者工作台不应该只是看数据，而是把入驻、审核、买方需求、付费准备元数据、预发布账本和收款资料收束到一个下一步。",
    completeAction: "\u67e5\u770b\u53d1\u5e03\u8005\u8fd0\u8425",
    completeDetail:
      "核心发布准备已完成。接下来重点监控审核证据、买方需求、预发布账本、反馈、收款资料和市场位置。",
    completeTitle: "\u4fdd\u6301\u4f9b\u7ed9\u95ed\u73af\u5065\u5eb7",
    eyebrow: "\u53d1\u5e03\u8005\u8fd0\u8425\u961f\u5217",
    ready: "\u5df2\u5c31\u7eea",
    title: "\u53d1\u5e03\u8005\u73b0\u5728\u5e94\u8be5\u5148\u505a\u4ec0\u4e48\uff1f",
    actions: {
      payout: "打开收款资料",
      profile: "\u5b8c\u6210\u53d1\u5e03\u8005\u8d26\u6237",
      publish: "\u53d1\u5e03\u6280\u80fd",
      session: "\u53bb\u767b\u5f55",
      terms: "\u63a5\u53d7\u6761\u6b3e",
      verified: "\u6253\u5f00\u6280\u80fd\u5de5\u4f5c\u53f0"
    },
    metrics: {
      demand: "\u4e70\u65b9\u9700\u6c42",
      payout: "\u4ed8\u8d39\u9884\u89c8\u72b6\u6001",
      pricing: "\u4ed8\u8d39\u963b\u65ad",
      readiness: "\u4e0a\u7ebf\u51c6\u5907",
      review: "\u5ba1\u6838\u5de5\u4f5c"
    },
    queue: {
      blockedMetric: "\u963b\u585e",
      nextMetric: "\u4e0b\u4e00\u6b65",
      readyMetric: "\u5065\u5eb7",
      readyTitle: "\u4f9b\u7ed9\u95ed\u73af\u6b63\u5e38",
      readyDetail:
        "当前没有紧急发布者阻塞。继续监控审核、反馈、买方需求、预发布账本、收款资料和市场位置。",
      title: "\u4f18\u5148\u7ea7\u961f\u5217"
    },
    queueActions: {
      account: "\u6253\u5f00\u53d1\u5e03\u8005\u8d26\u6237",
      demand: "\u6253\u5f00\u9700\u6c42\u677f",
      distribution: "\u67e5\u770b\u5e02\u573a\u4f4d\u7f6e",
      feedback: "\u6253\u5f00\u53cd\u9988\u56de\u590d",
      ledger: "\u67e5\u770b\u8c03\u6574\u8bb0\u5f55",
      monitor: "\u67e5\u770b\u53d1\u5e03\u8005\u8fd0\u8425",
      payout: "打开收款资料",
      pricing: "\u6253\u5f00\u4ed8\u8d39\u9884\u89c8\u590d\u6838",
      review: "\u6253\u5f00\u6280\u80fd\u5de5\u4f5c\u53f0",
      runtime: "\u6253\u5f00\u5ba1\u6838\u8bc1\u636e"
    },
    queueItems: {
      adjustments: "\u9000\u6b3e\u6216\u4e89\u8bae\u9700\u8981\u53d1\u5e03\u8005\u54cd\u5e94",
      demand: "\u4e70\u65b9\u9700\u6c42\u6b63\u5728\u7b49\u5f85\u53d1\u5e03\u8005\u52a8\u4f5c",
      distribution: "\u5e02\u573a\u4f4d\u7f6e\u9700\u8981\u6539\u8fdb\u6216\u8ddf\u8fdb\u7533\u8bc9",
      feedback: "\u5df2\u516c\u5f00\u4e70\u5bb6\u53cd\u9988\u9700\u8981\u53d1\u5e03\u8005\u56de\u590d",
      payoutReady: "\u4ed8\u8d39\u9884\u89c8\u6253\u6b3e\u590d\u6838\u5df2\u5c31\u7eea",
      payoutBlocked: "\u4ed8\u8d39\u9884\u89c8\u6253\u6b3e\u51c6\u5907\u88ab\u963b\u585e",
      pricing: "\u4ed8\u8d39\u9884\u89c8\u590d\u6838\u88ab\u963b\u585e",
      reviewRepair: "\u5ba1\u6838\u4fee\u590d\u6b63\u5728\u963b\u585e\u6280\u80fd",
      reviewSla: "\u5ba1\u6838 SLA \u9700\u8981\u8ddf\u8fdb",
      runtime: "\u8fd0\u884c\u68c0\u67e5\u9700\u8981\u4fee\u590d"
    },
    queueTitles: {
      adjustments: "\u9000\u6b3e/\u4e89\u8bae",
      demand: "\u4e70\u65b9\u9700\u6c42",
      distribution: "\u5e02\u573a\u5206\u53d1",
      feedback: "\u53cd\u9988\u56de\u590d",
      payout: "\u4ed8\u8d39\u9884\u89c8\u6253\u6b3e\u51c6\u5907",
      pricing: "\u4ed8\u8d39\u9884\u89c8\u590d\u6838",
      reviewRepair: "\u5ba1\u6838\u4fee\u590d",
      reviewSla: "\u5ba1\u6838 SLA",
      runtime: "\u8fd0\u884c\u68c0\u67e5"
    },
    queueTones: {
      danger: "\u7d27\u6025",
      ready: "\u5df2\u5c31\u7eea",
      warning: "\u5f85\u5904\u7406"
    }
  }
} as const;

type PublisherCommandCopy = (typeof publisherCommandCopy)[Locale];

const copy = {
  en: {
    adjustmentEmpty: "No recent refund or dispute activity",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentTitle: "Refund and dispute watch",
    disputeReview: "Dispute review",
    description:
      "A focused workspace for skill publishers to move packages through review, record pricing intent for future paid-marketplace review, respond to buyer demand, and prepare paid-marketplace metadata.",
    eyebrow: "Publisher workspace",
    ledgerEmpty: "No posted paid-preview ledger rows yet",
    ledgerHeaders: ["Skill", "Source", "Gross", "Fee", "Net", "Status"],
    ledgerTitle: "Publisher paid-marketplace ledger preview",
    refundReview: "Refund review",
    sourceMixTitle: "Paid-preview source mix",
    sourceShareLabel: "publisher share",
    sourceTransactionLabel: "transactions",
    unknownProject: "unknown-project",
    adjustmentTypes: {
      dispute: "Dispute",
      refund: "Refund"
    },
    disputeStatuses: {
      lost: "Lost",
      open: "Open",
      warning_needs_response: "Needs response",
      won: "Won"
    },
    ledgerStatuses: {
      available: "Available",
      blocked: "Blocked",
      pending: "Pending",
      posted: "Posted",
      released: "Released",
      reserved: "Reserved"
    },
    ledgerSources: {
      adjustment: "Adjustment",
      refund: "Refund",
      subscription: "Subscription",
      unknown: "Ledger",
      usage: "Usage"
    },
    refundStatuses: {
      approved: "Approved",
      failed: "Failed",
      posted: "Posted",
      rejected: "Rejected",
      requested: "Requested"
    },
    metrics: {
      available: "Paid preview balance",
      demand: "Open demand",
      skills: "Owned skills",
      verified: "Verified skills"
    },
    readiness: {
      blocked: "Waiting",
      current: "Next",
      done: "Done",
      progress: "readiness",
      title: "Publisher launch checklist",
      tasks: {
        session: ["Sign in with workspace session", "Sign in through the account entry so publishing, pricing intent, paid-readiness metadata, and notifications stay scoped to the current organization."],
        profile: ["Create publisher profile", "Set the public publisher name buyers will see before they install a skill."],
        terms: ["Accept operating terms", "Record the current refund, dispute, takedown, data, notification, and paid-marketplace readiness policy before paid publishing."],
        publish: ["Publish your first skill", "Submit a manifest and move it into review from the publisher skill operations panel."],
        verified: ["Reach verified listing status", "Complete review and activate pricing so buyers can trust and install the skill."],
        payout: ["Prepare paid-marketplace metadata", "Record receiving details for future finance review before any public paid rollout."]
      }
    },
    title: "Manage skill submissions and review readiness."
  },
  zh: {
    adjustmentEmpty: "暂无退款或争议记录",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentTitle: "退款与争议跟进",
    disputeReview: "争议复核",
    description:
      "给技能发布者使用的独立工作台：推进技能审核，记录未来付费市场复核所需的定价意图，响应买方需求，并准备付费市场元数据。",
    eyebrow: "发布者工作台",
    ledgerEmpty: "暂无已入账的付费预览账本记录",
    ledgerHeaders: ["技能", "来源", "预览总额", "平台费", "发布者份额", "状态"],
    ledgerTitle: "发布者付费市场账本预览",
    refundReview: "退款复核",
    sourceMixTitle: "付费预览来源结构",
    sourceShareLabel: "发布者分成",
    sourceTransactionLabel: "笔交易",
    unknownProject: "未知项目",
    adjustmentTypes: {
      dispute: "争议",
      refund: "退款"
    },
    disputeStatuses: {
      lost: "已败诉",
      open: "处理中",
      warning_needs_response: "需要响应",
      won: "已胜诉"
    },
    ledgerStatuses: {
      available: "付费预览可用",
      blocked: "已锁定",
      pending: "待结算",
      posted: "已入账",
      released: "已释放",
      reserved: "已预留"
    },
    ledgerSources: {
      adjustment: "调整",
      refund: "退款",
      subscription: "订阅",
      unknown: "账本",
      usage: "调用"
    },
    refundStatuses: {
      approved: "已批准",
      failed: "失败",
      posted: "已入账",
      rejected: "已拒绝",
      requested: "已申请"
    },
    metrics: {
      available: "付费预览余额",
      demand: "开放需求",
      skills: "我的技能",
      verified: "已验证技能"
    },
    readiness: {
      blocked: "等待",
      current: "下一步",
      done: "完成",
      progress: "准备度",
      title: "发布者上线清单",
      tasks: {
        session: ["登录工作区会话", "通过账号入口登录，让发布、定价意图、付费准备和通知都归属到当前组织。"],
        profile: ["创建发布者档案", "设置买家安装技能前会看到的公开发布者名称。"],
        terms: ["接受运营条款", "在付费发布前记录当前退款、争议、下架、数据、通知和付费市场准备政策。"],
        publish: ["发布第一个技能", "提交 manifest，并在发布者技能运营面板里推进审核。"],
        verified: ["获得已验证上架状态", "完成审核并启用价格，让买家可以信任并安装技能。"],
        payout: ["准备付费市场元数据", "在公开付费市场上线前，记录后续财务复核需要的收款资料。"]
      }
    },
    title: "管理技能提交和审核准备。"
  }
} as const;

function WorkspaceLockedPanel({
  actionHref,
  actionLabel,
  body,
  locale,
  title
}: {
  actionHref: string;
  actionLabel: string;
  body: string;
  locale: Locale;
  title: string;
}) {
  const guide = getPublisherLockedGuide(locale);

  return (
    <section className="workspace-locked-panel">
      <article className="ops-panel workspace-locked-panel__card">
        <div className="workspace-locked-panel__main">
          <div className="card-kicker">
            <ShieldAlert size={16} aria-hidden="true" />
            <span>{guide.eyebrow}</span>
          </div>
          <h2>{title}</h2>
          <p>{body}</p>
          <p className="visually-hidden">{guide.marker}</p>
          <a className="primary-button" href={actionHref}>
            <span>{actionLabel}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="workspace-locked-panel__actions" aria-label={guide.ariaLabel}>
          {guide.actions.map((action, index) => {
            const Icon = [BadgeCheck, ClipboardList, PackageCheck][index] ?? CircleDot;

            return (
              <a className="workspace-locked-panel__action" href={localizedHref(action.href, locale)} key={action.title}>
                <Icon size={16} aria-hidden="true" />
                <span>{action.label}</span>
                <strong>{action.title}</strong>
                <small>{action.body}</small>
              </a>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function getPublisherLockedGuide(locale: Locale) {
  if (locale === "zh") {
    return {
      ariaLabel: "发布者准入步骤",
      eyebrow: "发布者准入",
      marker: "发布者工作台 / 优先级队列 / 付费准备元数据 / 收款资料",
      actions: [
        {
          body: "用 Google、GitHub 或邮箱密码进入账号，建立当前组织会话。",
          href: hrefWithReturnTo("/login", "/publisher", locale),
          label: "01",
          title: "登录账号"
        },
        {
          body: "在账号中心确认这个组织已开通发布权限后，再进入工作台。",
          href: "/account",
          label: "02",
          title: "确认发布权限"
        },
        {
          body: "从发布入口上传 skillhub.json，保存草稿并提交版本审核。",
          href: "/publish",
          label: "03",
          title: "上传第一个技能"
        }
      ]
    };
  }

  return {
    ariaLabel: "Publisher access steps",
    eyebrow: "Publisher access",
    marker: "publisher operations queue / review readiness / paid marketplace preview",
    actions: [
      {
        body: "Use Google, GitHub, or email/password to create the current organization session.",
        href: hrefWithReturnTo("/login", "/publisher", locale),
        label: "01",
        title: "Sign in"
      },
      {
        body: "Confirm publisher, owner, or admin access from the account center before entering the workspace.",
        href: "/account",
        label: "02",
        title: "Confirm publisher role"
      },
      {
        body: "Upload skillhub.json from the publish entry, save a draft, and submit the version for review.",
        href: "/publish",
        label: "03",
        title: "Upload the first skill"
      }
    ]
  };
}

function buildReadinessTasks(
  taskCopy: Record<ReadinessTask["id"], readonly [string, string]>,
  flags: {
    hasActiveVerifiedListing: boolean;
    hasAcceptedCurrentTerms: boolean;
    hasPublishedSkill: boolean;
    hasPayoutReady: boolean;
    hasPublisherProfile: boolean;
    hasWorkspaceSession: boolean;
  }
): ReadinessTask[] {
  const statusFor = (isDone: boolean, canStart: boolean): ReadinessTask["status"] => {
    if (isDone) {
      return "done";
    }

    return canStart ? "current" : "blocked";
  };

  return [
    {
      detail: taskCopy.session[1],
      id: "session",
      status: statusFor(flags.hasWorkspaceSession, true),
      title: taskCopy.session[0]
    },
    {
      detail: taskCopy.profile[1],
      id: "profile",
      status: statusFor(flags.hasPublisherProfile, flags.hasWorkspaceSession),
      title: taskCopy.profile[0]
    },
    {
      detail: taskCopy.terms[1],
      id: "terms",
      status: statusFor(flags.hasAcceptedCurrentTerms, flags.hasPublisherProfile),
      title: taskCopy.terms[0]
    },
    {
      detail: taskCopy.publish[1],
      id: "publish",
      status: statusFor(flags.hasPublishedSkill, flags.hasPublisherProfile && flags.hasAcceptedCurrentTerms),
      title: taskCopy.publish[0]
    },
    {
      detail: taskCopy.verified[1],
      id: "verified",
      status: statusFor(flags.hasActiveVerifiedListing, flags.hasPublishedSkill),
      title: taskCopy.verified[0]
    },
    {
      detail: taskCopy.payout[1],
      id: "payout",
      status: statusFor(flags.hasPayoutReady, flags.hasPublisherProfile),
      title: taskCopy.payout[0]
    }
  ];
}

function buildPublisherPriorityItems({
  activeDemandCount,
  blockedPaidListings,
  commandLabels,
  draftPaidPrices,
  locale,
  payoutSummary,
  readinessTasks,
  skillCount,
  skills,
  adjustmentActionCount
}: {
  activeDemandCount: number;
  blockedPaidListings: number;
  commandLabels: PublisherCommandCopy;
  draftPaidPrices: number;
  locale: Locale;
  payoutSummary: PublisherPayoutSummary;
  readinessTasks: ReadinessTask[];
  skillCount: number;
  skills: PublisherSkillRecord[];
  adjustmentActionCount: number;
}): PublisherPriorityItem[] {
  const items: PublisherPriorityItem[] = [];
  const currentReadinessTask =
    readinessTasks.find((task) => task.status === "current") ??
    readinessTasks.find((task) => task.status === "blocked") ??
    null;

  if (currentReadinessTask) {
    items.push({
      actionLabel: commandLabels.actions[currentReadinessTask.id],
      detail: currentReadinessTask.detail,
      href: getPublisherCommandHref(currentReadinessTask.id, locale),
      id: `readiness-${currentReadinessTask.id}`,
      metric: currentReadinessTask.status === "blocked" ? commandLabels.queue.blockedMetric : commandLabels.queue.nextMetric,
      priority: currentReadinessTask.status === "blocked" ? 10 : 20,
      title: currentReadinessTask.title,
      tone: currentReadinessTask.status === "blocked" ? "danger" : "warning"
    });
  }

  const reviewRepairCount = skills.filter((skill) => {
    const reviewStatus = getPublisherReviewStatus(skill);
    const hasVersion = (skill.versions ?? []).length > 0;

    return (
      reviewStatus === "rejected" ||
      reviewStatus === "blocked" ||
      (hasVersion && skill.verificationStatus !== "verified" && !["queued", "in_review", "approved"].includes(reviewStatus))
    );
  }).length;
  const failedRuntimeCount = skills.filter((skill) =>
    getPublisherRuntimeChecks(skill).some((check) => check.status === "failed" || check.isBlocking === true)
  ).length;
  const warningRuntimeCount = skills.filter((skill) =>
    getPublisherRuntimeChecks(skill).some((check) => check.status === "warning" || check.status === "queued" || check.status === "running")
  ).length;
  const reviewSlaCount = skills.filter((skill) => {
    const slaStatus = skill.versions?.[0]?.reviewSlaStatus ?? skill.review.reviewSlaStatus ?? null;

    return slaStatus === "due_soon" || slaStatus === "overdue";
  }).length;
  const feedbackResponseCount = skills.reduce(
    (count, skill) => count + (skill.recentFeedback ?? []).filter((feedback) => !feedback.publisherResponseBody).length,
    0
  );
  const distributionActionCount = skills.filter((skill) => {
    const activeAppeal = skill.marketplace?.appeal && ["open", "under_review"].includes(skill.marketplace.appeal.status);
    const hasRiskHint = skill.marketplace?.improvementHints.some(
      (hint) => hint.severity === "critical" || hint.severity === "warning"
    );

    return Boolean(skill.marketplace?.placement === "suppressed" || hasRiskHint || activeAppeal);
  }).length;
  const payoutReadiness = payoutSummary.readiness;
  const payoutBlockerCount = payoutReadiness?.blockers.length ?? 0;
  const latestPayout = payoutSummary.payouts[0];
  const payoutNeedsAttention =
    Boolean(payoutReadiness?.canRequest) ||
    payoutBlockerCount > 0 ||
    latestPayout?.status === "failed" ||
    latestPayout?.status === "blocked";

  if (reviewRepairCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.review,
      detail: commandLabels.queueItems.reviewRepair,
      href: localizedHref("/publisher#publisher-skills", locale),
      id: "review-repair",
      metric: formatCompactNumber(reviewRepairCount),
      priority: 30,
      title: commandLabels.queueTitles.reviewRepair,
      tone: "danger"
    });
  }

  if (failedRuntimeCount > 0 || warningRuntimeCount > 0) {
    const hasFailedChecks = failedRuntimeCount > 0;

    items.push({
      actionLabel: commandLabels.queueActions.runtime,
      detail: commandLabels.queueItems.runtime,
      href: localizedHref("/publisher#publisher-skills", locale),
      id: "runtime-checks",
      metric: hasFailedChecks ? formatCompactNumber(failedRuntimeCount) : formatCompactNumber(warningRuntimeCount),
      priority: hasFailedChecks ? 35 : 55,
      title: commandLabels.queueTitles.runtime,
      tone: hasFailedChecks ? "danger" : "warning"
    });
  }

  if (reviewSlaCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.review,
      detail: commandLabels.queueItems.reviewSla,
      href: localizedHref("/publisher#publisher-skills", locale),
      id: "review-sla",
      metric: formatCompactNumber(reviewSlaCount),
      priority: 40,
      title: commandLabels.queueTitles.reviewSla,
      tone: "warning"
    });
  }

  if (blockedPaidListings > 0 || draftPaidPrices > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.pricing,
      detail: commandLabels.queueItems.pricing,
      href: blockedPaidListings > 0
        ? localizedHref("/publisher#publisher-account", locale)
        : localizedHref("/publisher#publisher-skills", locale),
      id: "paid-activation",
      metric: formatCompactNumber(blockedPaidListings || draftPaidPrices),
      priority: blockedPaidListings > 0 ? 45 : 70,
      title: commandLabels.queueTitles.pricing,
      tone: blockedPaidListings > 0 ? "warning" : "ready"
    });
  }

  if (feedbackResponseCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.feedback,
      detail: commandLabels.queueItems.feedback,
      href: localizedHref("/publisher#publisher-skills", locale),
      id: "feedback-response",
      metric: formatCompactNumber(feedbackResponseCount),
      priority: 50,
      title: commandLabels.queueTitles.feedback,
      tone: "warning"
    });
  }

  if (activeDemandCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.demand,
      detail: commandLabels.queueItems.demand,
      href: localizedHref("/publisher#publisher-demand", locale),
      id: "buyer-demand",
      metric: formatCompactNumber(activeDemandCount),
      priority: 60,
      title: commandLabels.queueTitles.demand,
      tone: "warning"
    });
  }

  if (distributionActionCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.distribution,
      detail: commandLabels.queueItems.distribution,
      href: localizedHref("/publisher#publisher-skills", locale),
      id: "distribution",
      metric: formatCompactNumber(distributionActionCount),
      priority: 65,
      title: commandLabels.queueTitles.distribution,
      tone: "warning"
    });
  }

  if (payoutNeedsAttention) {
    items.push({
      actionLabel: commandLabels.queueActions.payout,
      detail: payoutReadiness?.canRequest ? commandLabels.queueItems.payoutReady : commandLabels.queueItems.payoutBlocked,
      href: localizedHref("/publisher#publisher-payout", locale),
      id: "payout",
      metric: payoutReadiness?.canRequest ? commandLabels.queueTones.ready : formatCompactNumber(payoutBlockerCount),
      priority: payoutReadiness?.canRequest ? 75 : 55,
      title: commandLabels.queueTitles.payout,
      tone: payoutReadiness?.canRequest ? "ready" : "warning"
    });
  }

  if (adjustmentActionCount > 0) {
    items.push({
      actionLabel: commandLabels.queueActions.ledger,
      detail: commandLabels.queueItems.adjustments,
      href: localizedHref("/publisher#publisher-adjustments", locale),
      id: "adjustments",
      metric: formatCompactNumber(adjustmentActionCount),
      priority: 58,
      title: commandLabels.queueTitles.adjustments,
      tone: "warning"
    });
  }

  if (items.length === 0) {
    items.push({
      actionLabel: skillCount > 0 ? commandLabels.queueActions.monitor : commandLabels.actions.publish,
      detail: skillCount > 0 ? commandLabels.queue.readyDetail : commandLabels.body,
      href: skillCount > 0 ? localizedHref("/publisher#publisher-skills", locale) : localizedHref("/publish", locale),
      id: "healthy-supply-loop",
      metric: commandLabels.queue.readyMetric,
      priority: 100,
      title: skillCount > 0 ? commandLabels.queue.readyTitle : commandLabels.actions.publish,
      tone: "ready"
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

function getPublisherReviewStatus(skill: PublisherSkillRecord) {
  return skill.versions?.[0]?.reviewStatus ?? skill.review.status ?? skill.verificationStatus;
}

function getPublisherRuntimeChecks(skill: PublisherSkillRecord) {
  return skill.versions?.[0]?.runtimeChecks?.length ? skill.versions[0].runtimeChecks : (skill.runtime.checks ?? []);
}

function countActivePublisherRequests(requests: BuyerRequestRecord[]) {
  return requests.filter((request) => request.status === "open" || request.status === "claimed" || request.status === "submitted").length;
}

function countPublisherAdjustmentActions(
  refunds: Array<{ status: string }>,
  disputes: Array<{ status: string }>
) {
  const refundCount = refunds.filter((refund) => refund.status === "requested" || refund.status === "failed").length;
  const disputeCount = disputes.filter(
    (dispute) => dispute.status === "open" || dispute.status === "warning_needs_response" || dispute.status === "lost"
  ).length;

  return refundCount + disputeCount;
}

function formatLedgerStatus(value: string, labels: PublisherPageCopy) {
  return labels.ledgerStatuses[value as keyof typeof labels.ledgerStatuses] ?? value.replaceAll("_", " ");
}

function formatLedgerSource(value: string | undefined, labels: PublisherPageCopy) {
  if (!value) {
    return labels.ledgerSources.unknown;
  }

  return labels.ledgerSources[value as keyof typeof labels.ledgerSources] ?? value.replaceAll("_", " ");
}

function formatLedgerSourceReference(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.startsWith("subscription:")) {
    const [, subscriptionId = "", ...periodParts] = value.split(":");
    const period = periodParts.join(":");
    const periodDate = period ? period.slice(0, 10) : null;
    const subscriptionTail = subscriptionId.length > 8 ? subscriptionId.slice(0, 8) : subscriptionId;

    return periodDate ? `sub ${subscriptionTail} / ${periodDate}` : `sub ${subscriptionTail}`;
  }

  return value.length > 28 ? `${value.slice(0, 14)}...${value.slice(-8)}` : value;
}

function formatRefundStatus(value: string, labels: PublisherPageCopy) {
  return labels.refundStatuses[value as keyof typeof labels.refundStatuses] ?? value.replaceAll("_", " ");
}

function formatDisputeStatus(value: string, labels: PublisherPageCopy) {
  return labels.disputeStatuses[value as keyof typeof labels.disputeStatuses] ?? value.replaceAll("_", " ");
}

function buildCommercialSkillRows(skills: PublisherSkillRecord[]): CommercialSkillRow[] {
  return skills
    .filter((skill) => skill.pricing.billingModel !== "free" || skill.verificationStatus === "verified")
    .map((skill) => ({
      billingModel: skill.pricing.billingModel,
      blockers: skill.commercial?.blockers ?? [],
      displayName: skill.displayName,
      priceStatus: skill.pricing.status,
      ready: Boolean(skill.commercial?.paidActivationReady && skill.pricing.billingModel !== "free" && skill.pricing.status === "active"),
      reviewStatus: skill.review.status ?? skill.verificationStatus,
      slug: skill.slug,
      unitAmountCents: skill.pricing.unitAmountCents
    }))
    .sort((a, b) => {
      if (a.ready !== b.ready) {
        return a.ready ? 1 : -1;
      }

      return b.blockers.length - a.blockers.length;
    })
    .slice(0, 6);
}

function formatCommercialState(value: string | null | undefined, labels: PublisherPageCopy) {
  if (!value) {
    return labels.commercial.states.notConfigured;
  }

  return labels.commercial.states[value as keyof typeof labels.commercial.states] ?? value.replaceAll("_", " ");
}

function formatCommercialPrice(row: CommercialSkillRow, labels: PublisherPageCopy) {
  if (row.billingModel === "free") {
    return labels.commercial.states.free;
  }

  const model = formatCommercialState(row.billingModel, labels);
  const amount = formatMoney(row.unitAmountCents);
  const status = formatCommercialState(row.priceStatus, labels);

  return `${model} / ${amount} / ${status}`;
}

function formatCommercialAction(blockers: PublisherCommercialBlocker[], labels: PublisherPageCopy) {
  if (blockers.length === 0) {
    return labels.commercial.ready;
  }

  return blockers
    .slice(0, 3)
    .map((blocker) => labels.commercial.actionLabels[blocker] ?? blocker.replaceAll("_", " "))
    .join(" / ");
}

function getPublisherCommandHref(taskId: ReadinessTask["id"], locale: Locale) {
  if (taskId === "session") {
    return localizedHrefWithReturnTo("/login", locale, "/publisher");
  }

  if (taskId === "publish") {
    return localizedHref("/publish", locale);
  }

  if (taskId === "verified") {
    return localizedHref("/publisher#publisher-skills", locale);
  }

  return localizedHref("/publisher#publisher-account", locale);
}

export default async function PublisherPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = getPublisherPageCopy(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useskillhub.com";
  const session = await getWorkspaceSession();
  const hasWorkspaceSession = Boolean(session.subject);
  const roleSet = new Set([session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(Boolean));
  const hasPublisherAccess = hasWorkspaceSession && publisherAccessRoles.some((role) => roleSet.has(role));
  const publisherLoginPath = hrefWithReturnTo("/login", "/publisher", locale);
  const shellSecondaryHref = hasWorkspaceSession ? localizedHref("/account", locale) : undefined;
  const shellSecondaryLabel = hasWorkspaceSession ? (locale === "zh" ? "个人中心" : "Account") : undefined;

  if (!hasPublisherAccess) {
    return (
      <main className="product-shell">
        <SiteHeader
          active="publisher"
          apiUrl={apiUrl}
          consoleHref={shellSecondaryHref}
          consoleLabel={shellSecondaryLabel}
          dictionary={dictionary}
          locale={locale}
          pathname="/publisher"
        />

        <section className="page-hero page-hero--compact">
          <div>
            <div className="eyebrow">
              <BriefcaseBusiness size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1>{labels.lockedTitle}</h1>
            <p>{labels.lockedDescription}</p>
          </div>
        </section>

        <JourneyRail
          actionHrefOverride={hasWorkspaceSession ? "/account" : publisherLoginPath}
          actionLabelOverride={hasWorkspaceSession ? (locale === "zh" ? "查看账号权限" : "Check account access") : (locale === "zh" ? "先登录" : "Sign in")}
          currentStep="publisher"
          journey="publisher"
          locale={locale}
        />

        <section className="console-board publisher-console-board">
          <WorkspaceAccessPanel locale={locale} requiredRoles={publisherAccessRoles} session={session} workspace="publisher" />
        </section>

        <WorkspaceLockedPanel
          actionHref={hasWorkspaceSession ? localizedHref("/account", locale) : localizedHrefWithReturnTo("/login", locale, "/publisher")}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号权限" : "Check account access") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "发布者工作台包含草稿、审核、定价意图、付费准备元数据、收款资料和反馈操作。当前账号还没有发布权限，所以先显示准入步骤，表单和工作区数据保持隐藏。"
              : "Publisher operations include draft, review, pricing, payout, withdrawal, and feedback writes. This session cannot operate them, so publisher data and forms stay hidden."
          }
          locale={locale}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要发布权限" : "Publisher access required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      </main>
    );
  }

  const publisherReturnUrl = `${appUrl.replace(/\/$/, "")}${localizedHref("/publisher", locale)}`;
  const [
    financeLedger,
    payoutSummary,
    publisherAccount,
    publisherSkills,
    publisherBuyerRequests,
    publisherRefunds,
    publisherDisputes,
    userNotificationInbox,
    notificationPreferences
  ] = await Promise.all([
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
    getPublisherAccountSummary(),
    getPublisherSkills(),
    getPublisherBuyerRequests(),
    getPublisherRefunds(),
    getPublisherDisputes(),
    getUserNotificationInbox(),
    getNotificationPreferences()
  ]);
  const verifiedSkillCount = publisherSkills.filter((skill) => skill.verificationStatus === "verified").length;
  const activeDemandCount = countActivePublisherRequests(publisherBuyerRequests);
  const visibleMetrics = [
    [labels.metrics.skills, formatCompactNumber(publisherSkills.length)],
    [labels.metrics.verified, formatCompactNumber(verifiedSkillCount)],
    [labels.metrics.available, formatMoney(financeLedger.summary.availableBalanceCents)],
    [labels.metrics.demand, formatCompactNumber(activeDemandCount)]
  ];
  const hasPublisherProfile = Boolean(publisherAccount.publisherProfile);
  const hasAcceptedCurrentTerms =
    Boolean(publisherAccount.publisherProfile?.termsAcceptedAt) &&
    publisherAccount.publisherProfile?.termsVersion === CURRENT_TERMS_VERSION;
  const hasPublishedSkill = publisherSkills.length > 0;
  const hasActiveVerifiedListing = publisherSkills.some(
    (skill) => skill.verificationStatus === "verified" && skill.pricing.status === "active"
  );
  const hasVerifiedPayoutProfile =
    publisherAccount.publisherProfile?.payoutStatus === "verified" ||
    payoutSummary.publisherProfile?.payoutStatus === "verified";
  const hasVerifiedPayoutAccount =
    publisherAccount.payoutAccounts.some((account) => account.status === "verified") ||
    payoutSummary.payoutAccounts.some((account) => account.status === "verified");
  const hasPayoutReady = hasVerifiedPayoutProfile && hasVerifiedPayoutAccount;
  const commercialSkillRows = buildCommercialSkillRows(publisherSkills);
  const readyPaidListings = publisherSkills.filter(
    (skill) =>
      skill.pricing.billingModel !== "free" &&
      skill.pricing.status === "active" &&
      Boolean(skill.commercial?.paidActivationReady)
  ).length;
  const blockedPaidListings = publisherSkills.filter(
    (skill) =>
      skill.pricing.billingModel !== "free" &&
      skill.pricing.status !== "archived" &&
      !Boolean(skill.commercial?.paidActivationReady)
  ).length;
  const draftPaidPrices = publisherSkills.filter(
    (skill) => skill.pricing.billingModel !== "free" && skill.pricing.status === "draft"
  ).length;
  const profileReady = publisherAccount.publisherProfile?.status === "active";
  const profileStatus = publisherAccount.publisherProfile?.status ?? null;
  const payoutStatus =
    publisherAccount.publisherProfile?.payoutStatus ??
    payoutSummary.publisherProfile?.payoutStatus ??
    publisherAccount.payoutAccounts[0]?.status ??
    payoutSummary.payoutAccounts[0]?.status ??
    null;
  const commercialMetrics = [
    [labels.commercial.metrics.readyPaid, formatCompactNumber(readyPaidListings)],
    [labels.commercial.metrics.blockedPaid, formatCompactNumber(blockedPaidListings)],
    [labels.commercial.metrics.draftPaid, formatCompactNumber(draftPaidPrices)],
    [labels.commercial.metrics.payout, hasPayoutReady ? labels.commercial.ready : formatCommercialState(payoutStatus, labels)]
  ];
  const readinessTasks = buildReadinessTasks(labels.readiness.tasks, {
    hasAcceptedCurrentTerms,
    hasActiveVerifiedListing,
    hasPublishedSkill,
    hasPayoutReady,
    hasPublisherProfile,
    hasWorkspaceSession
  });
  const readinessDone = readinessTasks.filter((task) => task.status === "done").length;
  const readinessPercent = Math.round((readinessDone / readinessTasks.length) * 100);
  const commandLabels = publisherCommandCopy[locale];
  const reviewWorkCount = publisherSkills.filter((skill) => {
    const reviewStatus = skill.review.status ?? skill.verificationStatus;
    return skill.verificationStatus !== "verified" || reviewStatus === "rejected" || reviewStatus === "blocked";
  }).length;
  const adjustmentActionCount = countPublisherAdjustmentActions(publisherRefunds, publisherDisputes);
  const publisherPriorityItems = buildPublisherPriorityItems({
    activeDemandCount,
    adjustmentActionCount,
    blockedPaidListings,
    commandLabels,
    draftPaidPrices,
    locale,
    payoutSummary,
    readinessTasks,
    skillCount: publisherSkills.length,
    skills: publisherSkills
  });
  const primaryPriorityItem = publisherPriorityItems[0];
  const publisherCommandMetrics = [
    [commandLabels.metrics.readiness, `${readinessPercent}%`],
    [commandLabels.metrics.review, formatCompactNumber(reviewWorkCount)],
    [commandLabels.metrics.pricing, formatCompactNumber(blockedPaidListings)],
    [commandLabels.metrics.demand, formatCompactNumber(activeDemandCount)],
    [commandLabels.metrics.payout, hasPayoutReady ? commandLabels.ready : formatCommercialState(payoutStatus, labels)]
  ];
  const usageGrossCents = financeLedger.summary.usageGrossCents ?? 0;
  const usagePublisherShareCents = financeLedger.summary.usagePublisherShareCents ?? 0;
  const usageTransactionCount = financeLedger.summary.usageTransactionCount ?? 0;
  const subscriptionGrossCents = financeLedger.summary.subscriptionGrossCents ?? 0;
  const subscriptionPublisherShareCents = financeLedger.summary.subscriptionPublisherShareCents ?? 0;
  const subscriptionTransactionCount = financeLedger.summary.subscriptionTransactionCount ?? 0;
  const sourceMixGrossCents = usageGrossCents + subscriptionGrossCents;
  const sourceMixRows = [
    {
      count: usageTransactionCount,
      grossCents: usageGrossCents,
      id: "usage",
      label: formatLedgerSource("usage", labels),
      publisherShareCents: usagePublisherShareCents
    },
    {
      count: subscriptionTransactionCount,
      grossCents: subscriptionGrossCents,
      id: "subscription",
      label: formatLedgerSource("subscription", labels),
      publisherShareCents: subscriptionPublisherShareCents
    }
  ].map((source) => ({
    ...source,
    sharePercent: sourceMixGrossCents > 0 ? Math.round((source.grossCents / sourceMixGrossCents) * 100) : 0
  }));
  const ledgerRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 6).map((transaction) => ({
          fee: formatMoney(transaction.platformFeeCents, transaction.currency),
          gross: formatMoney(transaction.grossCents, transaction.currency),
          id: transaction.id,
          net: formatMoney(transaction.publisherShareCents, transaction.currency),
          skill: transaction.skillName ?? transaction.skillSlug ?? transaction.id,
          source: formatLedgerSource(transaction.sourceType, labels),
          sourceReference: formatLedgerSourceReference(transaction.sourceReference),
          status: formatLedgerStatus(transaction.balanceState ?? transaction.status, labels)
        }))
      : [];
  const adjustmentRows = [
    ...publisherRefunds.slice(0, 4).map((refund) => ({
      amount: `-${formatMoney(refund.amountCents, refund.currency)}`,
      id: refund.id,
      project: refund.projectSlug ?? labels.unknownProject,
      reason: refund.reason ?? refund.providerReference ?? labels.refundReview,
      skill: refund.skillName ?? refund.transactionId ?? refund.id,
      status: formatRefundStatus(refund.status, labels),
      type: labels.adjustmentTypes.refund,
      typeKey: "refund"
    })),
    ...publisherDisputes.slice(0, 4).map((dispute) => ({
      amount: formatMoney(dispute.amountCents, dispute.currency),
      id: dispute.id,
      project: dispute.projectSlug ?? labels.unknownProject,
      reason: dispute.reason ?? dispute.externalReference ?? labels.disputeReview,
      skill: dispute.skillName ?? dispute.transactionId ?? dispute.id,
      status: formatDisputeStatus(dispute.status, labels),
      type: labels.adjustmentTypes.dispute,
      typeKey: "dispute"
    }))
  ].slice(0, 6);

  return (
    <main className="product-shell">
      <SiteHeader
        active="publisher"
        apiUrl={apiUrl}
        consoleHref={shellSecondaryHref}
        consoleLabel={shellSecondaryLabel}
        dictionary={dictionary}
        locale={locale}
        pathname="/publisher"
      />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <BriefcaseBusiness size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <JourneyRail currentStep="publisher" journey="publisher" locale={locale} />

      <OperatingEvidenceChain
        focus="publisher"
        locale={locale}
        stats={[
          { label: commandLabels.metrics.readiness, tone: readinessPercent >= 80 ? "good" : "attention", value: `${readinessPercent}%` },
          { label: commandLabels.metrics.review, tone: reviewWorkCount > 0 ? "attention" : "good", value: formatCompactNumber(reviewWorkCount) },
          { label: commandLabels.metrics.pricing, tone: blockedPaidListings > 0 ? "attention" : "good", value: formatCompactNumber(blockedPaidListings) },
          { label: commandLabels.metrics.payout, tone: hasPayoutReady ? "good" : "attention", value: hasPayoutReady ? commandLabels.ready : formatCommercialState(payoutStatus, labels) }
        ]}
      />

      <section className="console-board publisher-console-board">
        <SessionStatusPanel locale={locale} session={session} />
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={publisherAccessRoles}
          session={session}
          workspace="publisher"
        />

        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {visibleMetrics.map(([label, value], index) => {
            const Icon = index === 0 ? PackageCheck : index === 1 ? BadgeCheck : index === 2 ? CircleDollarSign : ClipboardList;

            return (
              <div className="metric publisher-metric" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>
      </section>

      {hasPublisherAccess ? (
        <>
      <section className="publisher-priority-board" aria-labelledby="publisher-priority-heading">
        <article className="publisher-priority-card">
          <div className="publisher-priority-card__main">
            <div className="card-kicker">
              <ClipboardList size={16} aria-hidden="true" />
              <span>{commandLabels.eyebrow}</span>
            </div>
            <h2 id="publisher-priority-heading">{commandLabels.title}</h2>
            <p>{commandLabels.body}</p>

            <div className="publisher-priority-list" aria-label={commandLabels.queue.title}>
              {publisherPriorityItems.map((item) => (
                <a className={`publisher-priority-task publisher-priority-task--${item.tone}`} href={item.href} key={item.id}>
                  <span>
                    {commandLabels.queueTones[item.tone]} / {item.metric}
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <b>
                    {item.actionLabel}
                    <ArrowRight size={14} aria-hidden="true" />
                  </b>
                </a>
              ))}
            </div>

            <a className="primary-button publisher-priority-card__action" href={primaryPriorityItem.href}>
              <span>{primaryPriorityItem.actionLabel}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="publisher-priority-metrics">
            {publisherCommandMetrics.map(([label, value]) => (
              <div className="publisher-priority-metric" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="publisher-command-layout">
        <div className="publisher-command-main">
          <article className="ops-panel publisher-commercial-readiness" id="publisher-paid-readiness">
            <div className="publisher-commercial-readiness__head">
              <div className="card-kicker">
                <ShieldAlert size={16} aria-hidden="true" />
                <span>{labels.commercial.title}</span>
              </div>
              <p>{labels.commercial.description}</p>
            </div>

            <div className="publisher-commercial-readiness__metrics">
              {commercialMetrics.map(([label, value]) => (
                <div className="publisher-commercial-metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="publisher-commercial-gates">
              <div className={profileReady ? "publisher-commercial-gate publisher-commercial-gate--ready" : "publisher-commercial-gate"}>
                <strong>{labels.commercial.profile}</strong>
                <span className={profileReady ? "status-chip" : "status-chip status-chip--warning"}>
                  {formatCommercialState(profileStatus, labels)}
                </span>
              </div>
              <div className={hasAcceptedCurrentTerms ? "publisher-commercial-gate publisher-commercial-gate--ready" : "publisher-commercial-gate"}>
                <strong>{labels.commercial.terms}</strong>
                <span className={hasAcceptedCurrentTerms ? "status-chip" : "status-chip status-chip--warning"}>
                  {hasAcceptedCurrentTerms ? labels.commercial.ready : labels.commercial.blocked}
                </span>
              </div>
              <div className={hasPayoutReady ? "publisher-commercial-gate publisher-commercial-gate--ready" : "publisher-commercial-gate"}>
                <strong>{labels.commercial.metrics.payout}</strong>
                <span className={hasPayoutReady ? "status-chip" : "status-chip status-chip--warning"}>
                  {formatCommercialState(payoutStatus, labels)}
                </span>
              </div>
            </div>

            <div className="publisher-commercial-queue">
              <div className="publisher-commercial-queue__head">
                <strong>{labels.commercial.blockedSkillsTitle}</strong>
                <span className="status-chip status-chip--neutral">{commercialSkillRows.length}</span>
              </div>
              {commercialSkillRows.length > 0 ? (
                <div className="publisher-commercial-table">
                  <div className="publisher-commercial-row publisher-commercial-row--head">
                    <span>{labels.commercial.rows.skill}</span>
                    <span>{labels.commercial.rows.review}</span>
                    <span>{labels.commercial.rows.price}</span>
                    <span>{labels.commercial.rows.task}</span>
                  </div>
                  {commercialSkillRows.map((row) => (
                    <div className="publisher-commercial-row" key={row.slug}>
                      <strong>
                        <span>{row.displayName}</span>
                        <code>{row.slug}</code>
                      </strong>
                      <span className={row.ready ? "status-chip" : "status-chip status-chip--warning"}>
                        {formatCommercialState(row.reviewStatus, labels)}
                      </span>
                      <span>{formatCommercialPrice(row, labels)}</span>
                      <span className={row.ready ? "quality-chip quality-chip--complete" : "quality-chip quality-chip--attention"}>
                        {formatCommercialAction(row.blockers, labels)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="publisher-commercial-empty">{labels.commercial.empty}</div>
              )}
            </div>
          </article>

          <PublisherSkillManager locale={locale} skills={publisherSkills} />

          <div id="publisher-demand">
            <BuyerRequestManager
              developerRequests={[]}
              locale={locale}
              mode="publisher"
              publisherRequests={publisherBuyerRequests}
              publisherSkills={publisherSkills}
            />
          </div>

          <article className="ops-panel finance-panel">
            <div className="card-kicker">
              <WalletCards size={16} aria-hidden="true" />
              <span>{labels.ledgerTitle}</span>
            </div>
            <div className="publisher-revenue-mix">
              <div className="publisher-revenue-mix__head">
                <strong>{labels.sourceMixTitle}</strong>
                <span>{formatMoney(sourceMixGrossCents)}</span>
              </div>
              <div className="publisher-revenue-mix__items">
                {sourceMixRows.map((source) => (
                  <div className="publisher-revenue-mix__item" key={source.id}>
                    <div>
                      <strong>{source.label}</strong>
                      <span>
                        {formatCompactNumber(source.count)} {labels.sourceTransactionLabel}
                      </span>
                    </div>
                    <div className="publisher-revenue-mix__amount">
                      <strong>{formatMoney(source.grossCents)}</strong>
                      <span>
                        {formatMoney(source.publisherShareCents)} {labels.sourceShareLabel}
                      </span>
                    </div>
                    <div className="publisher-revenue-mix__bar" aria-hidden="true">
                      <span style={{ width: `${source.sharePercent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ledger-table">
              <div className="ledger-row ledger-row--head ledger-row--publisher-revenue">
                {labels.ledgerHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {ledgerRows.length > 0 ? (
                ledgerRows.map((transaction) => (
                  <div className="ledger-row ledger-row--publisher-revenue" key={transaction.id}>
                    <strong>{transaction.skill}</strong>
                    <span className="publisher-ledger-source">
                      <span>{transaction.source}</span>
                      {transaction.sourceReference ? <code>{transaction.sourceReference}</code> : null}
                    </span>
                    <span>{transaction.gross}</span>
                    <span>{transaction.fee}</span>
                    <span>{transaction.net}</span>
                    <span className="status-chip">{transaction.status}</span>
                  </div>
                ))
              ) : (
                <div className="ledger-row ledger-row--empty">
                  <strong>{labels.ledgerEmpty}</strong>
                </div>
              )}
            </div>
          </article>

          <article className="ops-panel work-table-panel" id="publisher-adjustments">
            <div className="card-kicker">
              <RotateCcw size={16} aria-hidden="true" />
              <span>{labels.adjustmentTitle}</span>
            </div>
            <div className="work-table work-table--adjustments">
              <div className="work-table__row work-table__row--head adjustment-row">
                {labels.adjustmentHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {adjustmentRows.length > 0 ? (
                adjustmentRows.map((adjustment) => {
                  const Icon = adjustment.typeKey === "refund" ? RotateCcw : ShieldAlert;

                  return (
                    <div className="work-table__row adjustment-row" key={`${adjustment.type}-${adjustment.id}`}>
                      <strong className="adjustment-kind">
                        <Icon size={15} aria-hidden="true" />
                        <span>{adjustment.type}</span>
                      </strong>
                      <span>{adjustment.skill}</span>
                      <span>{adjustment.project}</span>
                      <span>{adjustment.amount}</span>
                      <span className="status-chip" title={adjustment.reason}>
                        {adjustment.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="work-table__row adjustment-row adjustment-row--empty">
                  <strong>{labels.adjustmentEmpty}</strong>
                </div>
              )}
            </div>
          </article>
        </div>

        <aside className="publisher-command-side">
          <article className="ops-panel publisher-launch-checklist">
            <div className="publisher-launch-checklist__head">
              <div className="card-kicker">
                <ListChecks size={16} aria-hidden="true" />
                <span>{labels.readiness.title}</span>
              </div>
              <span className="status-chip status-chip--neutral">
                {readinessPercent}% {labels.readiness.progress}
              </span>
            </div>

            <div className="publisher-launch-checklist__bar" aria-hidden="true">
              <span style={{ width: `${readinessPercent}%` }} />
            </div>

            <div className="publisher-launch-checklist__items">
              {readinessTasks.map((task) => {
                const Icon = task.status === "done" ? CheckCircle2 : CircleDot;

                return (
                  <div className={`publisher-launch-task publisher-launch-task--${task.status}`} key={task.id}>
                    <Icon size={17} aria-hidden="true" />
                    <div>
                      <header>
                        <strong>{task.title}</strong>
                        <span>{labels.readiness[task.status]}</span>
                      </header>
                      <p>{task.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <div id="publisher-account">
            <PublisherAccountManager account={publisherAccount} locale={locale} returnUrl={publisherReturnUrl} />
          </div>

          <div id="publisher-payout">
            <PublisherPayoutManager locale={locale} summary={payoutSummary} />
          </div>

          <NotificationInboxManager
            locale={locale}
            notifications={userNotificationInbox.notifications}
            summary={userNotificationInbox.summary}
          />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
        </aside>
      </section>
        </>
      ) : (
        <WorkspaceLockedPanel
          actionHref={hasWorkspaceSession ? localizedHref("/account", locale) : localizedHrefWithReturnTo("/login", locale, "/publisher")}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号权限" : "Check account access") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "发布者工作台包含草稿、审核、定价意图、付费准备元数据、收款资料和反馈操作。当前账号还没有发布权限，所以先显示准入步骤，表单和工作区数据保持隐藏。"
              : "Publisher operations include draft, review, pricing, payout, withdrawal, and feedback writes. This session cannot operate them, so publisher data and forms stay hidden."
          }
          locale={locale}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要发布权限" : "Publisher access required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      )}
    </main>
  );
}
