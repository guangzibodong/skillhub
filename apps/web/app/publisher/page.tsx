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
import { PublisherAccountManager } from "@/components/publisher-account-manager";
import { PublisherPayoutManager } from "@/components/publisher-payout-manager";
import { PublisherSkillManager } from "@/components/publisher-skill-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
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
  type PublisherCommercialBlocker,
  type PublisherSkillRecord
} from "@/lib/ops-data";
import { getPublisherPageCopy, type PublisherPageCopy } from "@/lib/publisher-page-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ReadinessTask = {
  detail: string;
  id: "session" | "profile" | "terms" | "publish" | "verified" | "payout";
  status: "blocked" | "current" | "done";
  title: string;
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

const publisherCommandCopy = {
  en: {
    body:
      "The publisher workspace should behave like an operating queue: onboarding, review, paid readiness, buyer demand, ledger, and payout all point to one next move.",
    completeAction: "Review publisher operations",
    completeDetail:
      "Core publisher readiness is complete. Monitor review evidence, buyer demand, revenue, feedback, payout state, and marketplace placement.",
    completeTitle: "Keep the supply loop healthy",
    eyebrow: "Publisher operations queue",
    ready: "Ready",
    title: "What should the publisher do next?",
    actions: {
      payout: "Open payout readiness",
      profile: "Complete publisher account",
      publish: "Publish a skill",
      session: "Sign in",
      terms: "Accept terms",
      verified: "Open skill workbench"
    },
    metrics: {
      demand: "Buyer demand",
      payout: "Payout state",
      pricing: "Paid blockers",
      readiness: "Launch readiness",
      review: "Review work"
    }
  },
  zh: {
    body:
      "\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u4e0d\u5e94\u8be5\u53ea\u662f\u770b\u6570\u636e\uff0c\u800c\u662f\u628a\u5165\u9a7b\u3001\u5ba1\u6838\u3001\u4ed8\u8d39\u5c31\u7eea\u3001\u4e70\u65b9\u9700\u6c42\u3001\u8d26\u672c\u548c\u63d0\u73b0\u90fd\u6536\u675f\u5230\u4e00\u4e2a\u4e0b\u4e00\u6b65\u3002",
    completeAction: "\u67e5\u770b\u53d1\u5e03\u8005\u8fd0\u8425",
    completeDetail:
      "\u6838\u5fc3\u53d1\u5e03\u51c6\u5907\u5df2\u5b8c\u6210\u3002\u63a5\u4e0b\u6765\u91cd\u70b9\u76d1\u63a7\u5ba1\u6838\u8bc1\u636e\u3001\u4e70\u65b9\u9700\u6c42\u3001\u6536\u5165\u3001\u53cd\u9988\u3001\u63d0\u73b0\u548c\u5e02\u573a\u4f4d\u7f6e\u3002",
    completeTitle: "\u4fdd\u6301\u4f9b\u7ed9\u95ed\u73af\u5065\u5eb7",
    eyebrow: "\u53d1\u5e03\u8005\u8fd0\u8425\u961f\u5217",
    ready: "\u5df2\u5c31\u7eea",
    title: "\u53d1\u5e03\u8005\u73b0\u5728\u5e94\u8be5\u5148\u505a\u4ec0\u4e48\uff1f",
    actions: {
      payout: "\u6253\u5f00\u63d0\u73b0\u51c6\u5907",
      profile: "\u5b8c\u6210\u53d1\u5e03\u8005\u8d26\u6237",
      publish: "\u53d1\u5e03\u6280\u80fd",
      session: "\u53bb\u767b\u5f55",
      terms: "\u63a5\u53d7\u6761\u6b3e",
      verified: "\u6253\u5f00\u6280\u80fd\u5de5\u4f5c\u53f0"
    },
    metrics: {
      demand: "\u4e70\u65b9\u9700\u6c42",
      payout: "\u63d0\u73b0\u72b6\u6001",
      pricing: "\u4ed8\u8d39\u963b\u65ad",
      readiness: "\u4e0a\u7ebf\u51c6\u5907",
      review: "\u5ba1\u6838\u5de5\u4f5c"
    }
  }
} as const;

const copy = {
  en: {
    adjustmentEmpty: "No recent refund or dispute activity",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentTitle: "Refund and dispute watch",
    disputeReview: "Dispute review",
    description:
      "A focused workspace for skill publishers to move packages through review, price verified listings, respond to buyer demand, and prepare revenue for payout.",
    eyebrow: "Publisher workspace",
    ledgerEmpty: "No posted publisher revenue yet",
    ledgerHeaders: ["Skill", "Source", "Gross", "Fee", "Net", "Status"],
    ledgerTitle: "Publisher revenue ledger",
    refundReview: "Refund review",
    sourceMixTitle: "Revenue source mix",
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
      available: "Available balance",
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
        session: ["Connect workspace session", "Sign in with an organization token so publishing, pricing, payouts, and notifications are scoped."],
        profile: ["Create publisher profile", "Set the public publisher name buyers will see before they install a skill."],
        terms: ["Accept operating terms", "Record the current refund, dispute, takedown, data, notification, and payout policy before paid publishing."],
        publish: ["Publish your first skill", "Submit a manifest and move it into review from the publisher skill operations panel."],
        verified: ["Reach verified listing status", "Complete review and activate pricing so buyers can trust and install the skill."],
        payout: ["Prepare payout readiness", "Connect payout details before revenue matures into a withdrawal request."]
      }
    },
    title: "Operate your SkillHub publishing business."
  },
  zh: {
    adjustmentEmpty: "暂无退款或争议记录",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentTitle: "退款与争议跟进",
    disputeReview: "争议复核",
    description:
      "给技能发布者使用的独立工作台：推进技能审核，设置已验证技能价格，响应买方需求，并把收入准备到可提现状态。",
    eyebrow: "发布者工作台",
    ledgerEmpty: "暂无已入账的发布者收入",
    ledgerHeaders: ["技能", "来源", "总收入", "平台费", "净收入", "状态"],
    ledgerTitle: "发布者收入账本",
    refundReview: "退款复核",
    sourceMixTitle: "收入来源结构",
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
      available: "可提现",
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
      available: "可提现余额",
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
        session: ["连接工作区会话", "使用组织 token 登录，让发布、定价、提现和通知都归属到当前组织。"],
        profile: ["创建发布者档案", "设置买家安装技能前会看到的公开发布者名称。"],
        terms: ["接受运营条款", "在付费发布前记录当前退款、争议、下架、数据、通知和提现政策。"],
        publish: ["发布第一个技能", "提交 manifest，并在发布者技能运营面板里推进审核。"],
        verified: ["获得已验证上架状态", "完成审核并启用价格，让买家可以信任并安装技能。"],
        payout: ["准备提现资料", "在收入成熟并发起提现前，先完成提现账户和资料状态。"]
      }
    },
    title: "运营你的 SkillHub 技能发布业务。"
  }
} as const;

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
    return localizedHref("/login", locale);
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.useskillhub.com";
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
    notificationPreferences,
    session
  ] = await Promise.all([
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
    getPublisherAccountSummary(),
    getPublisherSkills(),
    getPublisherBuyerRequests(),
    getPublisherRefunds(),
    getPublisherDisputes(),
    getUserNotificationInbox(),
    getNotificationPreferences(),
    getWorkspaceSession()
  ]);
  const verifiedSkillCount = publisherSkills.filter((skill) => skill.verificationStatus === "verified").length;
  const activeDemandCount = publisherBuyerRequests.filter(
    (request) => request.status === "open" || request.status === "claimed" || request.status === "submitted"
  ).length;
  const visibleMetrics = [
    [labels.metrics.skills, formatCompactNumber(publisherSkills.length)],
    [labels.metrics.verified, formatCompactNumber(verifiedSkillCount)],
    [labels.metrics.available, formatMoney(financeLedger.summary.availableBalanceCents)],
    [labels.metrics.demand, formatCompactNumber(activeDemandCount)]
  ];
  const hasWorkspaceSession = session.source !== "none" && Boolean(session.subject);
  const hasPublisherProfile = Boolean(publisherAccount.publisherProfile);
  const hasAcceptedCurrentTerms =
    Boolean(publisherAccount.publisherProfile?.termsAcceptedAt) &&
    publisherAccount.publisherProfile?.termsVersion === CURRENT_TERMS_VERSION;
  const hasPublishedSkill = publisherSkills.length > 0;
  const hasActiveVerifiedListing = publisherSkills.some(
    (skill) => skill.verificationStatus === "verified" && skill.pricing.status === "active"
  );
  const hasPayoutReady =
    publisherAccount.publisherProfile?.payoutStatus === "verified" ||
    payoutSummary.publisherProfile?.payoutStatus === "verified" ||
    publisherAccount.payoutAccounts.some((account) => account.status === "verified" || account.status === "ready") ||
    payoutSummary.payoutAccounts.some((account) => account.status === "verified" || account.status === "ready");
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
  const currentReadinessTask =
    readinessTasks.find((task) => task.status === "current") ??
    readinessTasks.find((task) => task.status === "blocked") ??
    null;
  const priorityTask = currentReadinessTask ?? {
    detail: commandLabels.completeDetail,
    id: "verified" as const,
    status: "done" as const,
    title: commandLabels.completeTitle
  };
  const reviewWorkCount = publisherSkills.filter((skill) => {
    const reviewStatus = skill.review.status ?? skill.verificationStatus;
    return skill.verificationStatus !== "verified" || reviewStatus === "rejected" || reviewStatus === "blocked";
  }).length;
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
      <SiteHeader active="publisher" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/publisher" />

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

      <section className="console-board publisher-console-board">
        <SessionStatusPanel locale={locale} session={session} />
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={["publisher", "owner", "admin", "super_admin"]}
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

      <section className="publisher-priority-board" aria-labelledby="publisher-priority-heading">
        <article className="publisher-priority-card">
          <div className="publisher-priority-card__main">
            <div className="card-kicker">
              <ClipboardList size={16} aria-hidden="true" />
              <span>{commandLabels.eyebrow}</span>
            </div>
            <h2 id="publisher-priority-heading">{commandLabels.title}</h2>
            <p>{commandLabels.body}</p>

            <div className={`publisher-priority-task publisher-priority-task--${priorityTask.status}`}>
              <span>{currentReadinessTask ? labels.readiness[priorityTask.status] : commandLabels.ready}</span>
              <strong>{priorityTask.title}</strong>
              <p>{priorityTask.detail}</p>
            </div>

            <a
              className="primary-button publisher-priority-card__action"
              href={currentReadinessTask ? getPublisherCommandHref(currentReadinessTask.id, locale) : localizedHref("/publisher#publisher-skills", locale)}
            >
              <span>{currentReadinessTask ? commandLabels.actions[currentReadinessTask.id] : commandLabels.completeAction}</span>
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

          <BuyerRequestManager
            developerRequests={[]}
            locale={locale}
            mode="publisher"
            publisherRequests={publisherBuyerRequests}
            publisherSkills={publisherSkills}
          />

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

          <article className="ops-panel work-table-panel">
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

          <PublisherAccountManager account={publisherAccount} locale={locale} returnUrl={publisherReturnUrl} />

          <PublisherPayoutManager locale={locale} summary={payoutSummary} />

          <NotificationInboxManager
            locale={locale}
            notifications={userNotificationInbox.notifications}
            summary={userNotificationInbox.summary}
          />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
        </aside>
      </section>
    </main>
  );
}
