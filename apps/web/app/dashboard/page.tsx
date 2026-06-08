import {
  Activity,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  GitBranch,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  RadioTower,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { ConsoleAccessPanel } from "@/components/console-access-panel";
import { JourneyRailDeck } from "@/components/journey-rail";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { OrganizationBillingManager } from "@/components/organization-billing-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { ProjectCreateForm } from "@/components/project-create-form";
import { PublisherAccountManager } from "@/components/publisher-account-manager";
import { PublisherPayoutManager } from "@/components/publisher-payout-manager";
import { PublisherSkillManager } from "@/components/publisher-skill-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  getAdminLaunchReadiness,
  getDeveloperBuyerRequests,
  getDeveloperProjects,
  getNotificationPreferences,
  getUserNotificationInbox,
  getOrganizationBillingSummary,
  getPublisherAccountSummary,
  getPublisherBuyerRequests,
  getPublisherDisputes,
  getPublisherFinanceLedger,
  getPublisherPayoutSummary,
  getPublisherRefunds,
  getPublisherSkills,
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type DemoChainStatus = "attention" | "ready" | "waiting";

type DemoChainStep = {
  detail: string;
  evidence: string;
  href: string;
  icon: LucideIcon;
  id: string;
  next: string;
  status: DemoChainStatus;
  title: string;
};

const publisherIcons = [PackageCheck, CircleDollarSign, BarChart3] as const;
const buyerIcons = [BriefcaseBusiness, CreditCard, Activity] as const;

const opsCopy = {
  en: {
    pipelineTitle: "Publishing pipeline",
    pipelineHeaders: ["Skill", "Stage", "Signals", "Next step"],
    pipelineRows: [],
    activeKeys: "active",
    calls: "calls",
    revokedKeys: "revoked",
    updates: "updates",
    projectTitle: "Buyer project controls",
    projectHeaders: ["Project", "Budget", "Keys", "Policy"],
    projectRows: [],
    apiTitle: "Runtime operations",
    apiRows: [
      ["Rate limits", "Project-scoped keys with monthly budgets"],
      ["Version pinning", "Agents can pin exact skill versions before execution"],
      ["Webhook events", "Skill review, billing, payout, and runtime incident events"]
    ],
    adjustmentTitle: "Revenue adjustments",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentEmpty: "No recent refund or dispute activity",
    disputeReview: "Dispute review",
    refundReview: "Refund review",
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
    projectPolicyStates: {
      approved: "Approved",
      owner_review: "Owner review",
      suspended: "Suspended"
    },
    refundStatuses: {
      approved: "Approved",
      failed: "Failed",
      posted: "Posted",
      rejected: "Rejected",
      requested: "Requested"
    },
    buyerRequestTitle: "Buyer request board",
    buyerRequestHeaders: ["Request", "Category", "Bounty", "Status", "Next"],
    buyerRequestEmpty: "No open or claimed buyer requests"
  },
  zh: {
    pipelineTitle: "发布流水线",
    pipelineHeaders: ["技能", "阶段", "信号", "下一步"],
    pipelineRows: [
      ["browser-research-pro", "价格批准", "Mira", "确认按次调用上限"],
      ["crm-enrichment", "数据政策", "Nolan", "审核 CRM token 范围"],
      ["codebase-risk-scanner", "受限上线", "Asha", "需要负责人批准"]
    ],
    activeKeys: "活跃",
    calls: "次调用",
    revokedKeys: "已撤销",
    updates: "次更新",
    projectTitle: "购买方项目控制",
    projectHeaders: ["项目", "预算", "Key", "策略"],
    projectRows: [
      ["Research Agent", "$480 / 月", "2 个活跃", "已批准中风险技能"],
      ["Support Agent", "$120 / 月", "1 个轮换中", "仅允许免费技能"],
      ["财务运营", "$900 / 月", "3 个活跃", "$50 以上人工批准"]
    ],
    apiTitle: "运行时运营",
    apiRows: [
      ["速率限制", "项目级 API Key 和月度预算"],
      ["版本固定", "智能体执行前可固定具体技能版本"],
      ["Webhook 事件", "技能审核、计费、提现和运行事故事件"]
    ],
    adjustmentTitle: "收入调整",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentEmpty: "暂无退款或争议记录",
    disputeReview: "争议复核",
    refundReview: "退款复核",
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
      available: "可用",
      blocked: "已锁定",
      pending: "待结算",
      posted: "已入账",
      released: "已释放",
      reserved: "已预留"
    },
    projectPolicyStates: {
      approved: "已批准",
      owner_review: "负责人审核",
      suspended: "已暂停"
    },
    refundStatuses: {
      approved: "已批准",
      failed: "失败",
      posted: "已入账",
      rejected: "已拒绝",
      requested: "已申请"
    },
    buyerRequestTitle: "买方需求池",
    buyerRequestHeaders: ["需求", "分类", "赏金", "状态", "下一步"],
    buyerRequestEmpty: "暂无开放或已认领需求"
  }
} as const;

const dashboardCommandCopy = {
  en: {
    actionOpen: "Open",
    body:
      "Use this page as the backend map: session state, role access, P0 journeys, and live operating signals are visible here while detailed work stays in the dedicated consoles.",
    eyebrow: "Workspace command center",
    evidence: {
      launch: "Launch blockers / warnings",
      ledger: "Ledger rows",
      projects: "Agent projects",
      verified: "Verified owned skills"
    },
    proof: {
      journeys: "P0 journeys",
      paidBlockers: "Paid blockers",
      runtimeCalls: "Runtime calls"
    },
    roleRequired: "Role required",
    signInRequired: "Sign-in required",
    title: "Choose the right operating lane before touching production state.",
    cards: {
      account: {
        description: "Review login, connected identities, session fingerprints, notification preferences, and workspace readiness.",
        metric: "Unread notifications",
        nextSignedIn: "Review account center",
        nextSignedOut: "Enter by email, OAuth, or invite token",
        role: "All users",
        title: "Account and access"
      },
      admin: {
        description: "Operate launch readiness, review, trust, incidents, identity, ledger, payouts, delivery, and audit.",
        metric: "Readiness issues",
        nextClear: "Open admin operations",
        nextIssues: "Clear launch blockers first",
        role: "Reviewer / finance / admin",
        title: "Platform operations"
      },
      developer: {
        description: "Manage agent projects, installed skills, runtime keys, policy approvals, governed tests, billing, team, and webhooks.",
        metric: "Projects",
        nextEmpty: "Create the first agent project",
        nextReady: "Open developer workspace",
        role: "Developer / owner",
        title: "Developer workspace"
      },
      publisher: {
        description: "Operate skill drafts, exact-version review repair, pricing blockers, buyer demand, feedback, revenue, and payout readiness.",
        metric: "Owned skills",
        nextEmpty: "Start the publish flow",
        nextReady: "Open publisher workspace",
        role: "Publisher / owner",
        title: "Publisher workspace"
      }
    },
    status: {
      available: "Available",
      needsWork: "Needs attention",
      ready: "Ready"
    }
  },
  zh: {
    actionOpen: "打开",
    body:
      "这个页面是后台总入口：当前会话、角色入口、三条 P0 路径和实时运营信号都在这里可见；具体操作继续进入对应的开发者、发布者或管理员工作区。",
    eyebrow: "工作台总控",
    evidence: {
      launch: "上线阻断 / 警告",
      ledger: "账本行",
      projects: "Agent 项目",
      verified: "已验证自有技能"
    },
    proof: {
      journeys: "P0 路径",
      paidBlockers: "付费阻断",
      runtimeCalls: "运行调用"
    },
    roleRequired: "需要对应角色",
    signInRequired: "需要先登录",
    title: "先选正确工作区，再处理真实运营状态。",
    cards: {
      account: {
        description: "检查登录、绑定身份、会话指纹、通知偏好和工作区准备度。",
        metric: "未读通知",
        nextSignedIn: "检查账号中心",
        nextSignedOut: "用邮箱、OAuth 或邀请 token 进入",
        role: "所有用户",
        title: "账号与访问"
      },
      admin: {
        description: "运营上线就绪、审核、信任、事故、身份、账本、提现、投递和审计。",
        metric: "就绪度问题",
        nextClear: "打开运营后台",
        nextIssues: "先清理上线阻断",
        role: "审核 / 财务 / 管理员",
        title: "平台运营后台"
      },
      developer: {
        description: "管理 Agent 项目、已安装技能、运行 Key、策略审批、治理测试、账单、团队和 webhook。",
        metric: "项目数",
        nextEmpty: "创建第一个 Agent 项目",
        nextReady: "打开开发者工作台",
        role: "开发者 / 负责人",
        title: "开发者工作台"
      },
      publisher: {
        description: "运营技能草稿、精确版本审核修复、定价阻断、买方需求、反馈、收入和提现准备。",
        metric: "自有技能",
        nextEmpty: "开始发布流程",
        nextReady: "打开发布者工作台",
        role: "发布者 / 负责人",
        title: "发布者工作台"
      }
    },
    status: {
      available: "可进入",
      needsWork: "需要处理",
      ready: "就绪"
    }
  }
} as const;

const dashboardDemoChainCopy = {
  en: {
    action: "Open",
    allClear: "The visible demo chain has proof at every required stage. Keep clearing attention states in the dedicated workspaces before a customer walkthrough.",
    body:
      "This is the customer-demo proof path. It derives each stage from existing workspace, registry, review, runtime, ledger, payout, notification, and readiness state instead of inventing a fake task list.",
    bottleneck: "Next bottleneck",
    eyebrow: "P0 operating proof",
    summary: {
      attention: "attention",
      ready: "ready",
      waiting: "waiting"
    },
    status: {
      attention: "Needs attention",
      ready: "Proof visible",
      waiting: "Waiting for data"
    },
    title: "Can we prove the full marketplace loop in one walkthrough?",
    steps: {
      publish: {
        detail: "Publisher supply starts as organization-scoped draft or owned skill state.",
        next: "Start from publish",
        title: "Publisher upload"
      },
      checks: {
        detail: "Exact versions carry review SLA and automated manifest/runtime/example/security evidence.",
        next: "Repair or submit versions",
        title: "Version submit and checks"
      },
      review: {
        detail: "Human review turns acceptable contracts into trusted marketplace supply.",
        next: "Open review operations",
        title: "Admin review gate"
      },
      listing: {
        detail: "Public listings connect verified supply to discovery, pricing, feedback, and publisher trust.",
        next: "Inspect marketplace",
        title: "Marketplace listing"
      },
      install: {
        detail: "Developers move catalog decisions into organization projects and pinned install state.",
        next: "Open developer projects",
        title: "Developer install"
      },
      runtime: {
        detail: "Project keys, policy, budget, subscription gates, REST, MCP, and console tests share one runtime path.",
        next: "Open runtime command",
        title: "Policy, key, and runtime test"
      },
      money: {
        detail: "Billable usage and subscriptions should produce immutable transactions, splits, balances, and payout readiness.",
        next: "Review ledger and payout",
        title: "Ledger and payout"
      },
      readiness: {
        detail: "Notifications, launch readiness, and admin audit surfaces prove operating decisions are recoverable.",
        next: "Open admin readiness",
        title: "Notification, readiness, audit"
      }
    }
  },
  zh: {
    action: "\u6253\u5f00",
    allClear:
      "\u5f53\u524d\u6f14\u793a\u94fe\u8def\u6bcf\u4e2a\u9636\u6bb5\u90fd\u6709\u53ef\u89c1\u8bc1\u636e\u3002\u5ba2\u6237\u6f14\u793a\u524d\uff0c\u7ee7\u7eed\u5728\u5bf9\u5e94\u5de5\u4f5c\u53f0\u6e05\u7406\u9700\u5173\u6ce8\u72b6\u6001\u3002",
    body:
      "\u8fd9\u662f\u7ed9\u5ba2\u6237\u770b\u7684\u95ed\u73af\u8bc1\u660e\u8def\u5f84\u3002\u6bcf\u4e2a\u9636\u6bb5\u90fd\u4ece\u73b0\u6709\u5de5\u4f5c\u53f0\u3001\u6ce8\u518c\u8868\u3001\u5ba1\u6838\u3001\u8fd0\u884c\u3001\u8d26\u672c\u3001\u63d0\u73b0\u3001\u901a\u77e5\u548c\u4e0a\u7ebf\u5c31\u7eea\u72b6\u6001\u63a8\u5bfc\uff0c\u4e0d\u9020\u5047\u4efb\u52a1\u5217\u8868\u3002",
    bottleneck: "\u4e0b\u4e00\u4e2a\u74f6\u9888",
    eyebrow: "P0 \u8fd0\u8425\u8bc1\u660e",
    summary: {
      attention: "\u9700\u5173\u6ce8",
      ready: "\u6709\u8bc1\u636e",
      waiting: "\u7b49\u6570\u636e"
    },
    status: {
      attention: "\u9700\u8981\u5904\u7406",
      ready: "\u8bc1\u636e\u53ef\u89c1",
      waiting: "\u7b49\u5f85\u6570\u636e"
    },
    title: "\u6211\u4eec\u80fd\u5426\u7528\u4e00\u6b21\u6f14\u793a\u8bc1\u660e\u5b8c\u6574\u5e02\u573a\u95ed\u73af\uff1f",
    steps: {
      publish: {
        detail: "\u53d1\u5e03\u8005\u4f9b\u7ed9\u4ece\u7ec4\u7ec7\u8303\u56f4\u8349\u7a3f\u6216\u81ea\u6709\u6280\u80fd\u72b6\u6001\u5f00\u59cb\u3002",
        next: "\u4ece\u53d1\u5e03\u5165\u53e3\u5f00\u59cb",
        title: "\u53d1\u5e03\u8005\u4e0a\u4f20"
      },
      checks: {
        detail: "\u7cbe\u786e\u7248\u672c\u5e26\u6709\u5ba1\u6838 SLA \u548c manifest/runtime/example/security \u81ea\u52a8\u68c0\u67e5\u8bc1\u636e\u3002",
        next: "\u4fee\u590d\u6216\u63d0\u4ea4\u7248\u672c",
        title: "\u7248\u672c\u63d0\u4ea4\u4e0e\u68c0\u67e5"
      },
      review: {
        detail: "\u4eba\u5de5\u5ba1\u6838\u628a\u5408\u683c\u5408\u7ea6\u53d8\u6210\u53ef\u4fe1\u5e02\u573a\u4f9b\u7ed9\u3002",
        next: "\u6253\u5f00\u5ba1\u6838\u8fd0\u8425",
        title: "\u540e\u53f0\u5ba1\u6838\u95f8\u95e8"
      },
      listing: {
        detail: "\u516c\u5f00\u4e0a\u67b6\u628a\u5df2\u5ba1\u6838\u4f9b\u7ed9\u8fde\u5230\u53d1\u73b0\u3001\u4ef7\u683c\u3001\u53cd\u9988\u548c\u53d1\u5e03\u8005\u4fe1\u4efb\u3002",
        next: "\u68c0\u67e5\u5e02\u573a",
        title: "\u5e02\u573a\u4e0a\u67b6"
      },
      install: {
        detail: "\u5f00\u53d1\u8005\u628a\u76ee\u5f55\u51b3\u7b56\u53d8\u6210\u7ec4\u7ec7\u9879\u76ee\u548c\u56fa\u5b9a\u7248\u672c\u5b89\u88c5\u72b6\u6001\u3002",
        next: "\u6253\u5f00\u5f00\u53d1\u8005\u9879\u76ee",
        title: "\u5f00\u53d1\u8005\u5b89\u88c5"
      },
      runtime: {
        detail: "\u9879\u76ee Key\u3001\u7b56\u7565\u3001\u9884\u7b97\u3001\u8ba2\u9605\u95e8\u69db\u3001REST\u3001MCP \u548c\u63a7\u5236\u53f0\u6d4b\u8bd5\u5171\u7528\u540c\u4e00\u8fd0\u884c\u8def\u5f84\u3002",
        next: "\u6253\u5f00\u8fd0\u884c\u6307\u6325\u53f0",
        title: "\u7b56\u7565\u3001Key \u4e0e\u8fd0\u884c\u6d4b\u8bd5"
      },
      money: {
        detail: "\u53ef\u8ba1\u8d39\u7528\u91cf\u548c\u8ba2\u9605\u5e94\u4ea7\u751f\u4e0d\u53ef\u53d8\u4ea4\u6613\u3001\u5206\u8d26\u3001\u4f59\u989d\u548c\u63d0\u73b0\u5c31\u7eea\u3002",
        next: "\u590d\u6838\u8d26\u672c\u548c\u63d0\u73b0",
        title: "\u8d26\u672c\u4e0e\u63d0\u73b0"
      },
      readiness: {
        detail: "\u901a\u77e5\u3001\u4e0a\u7ebf\u5c31\u7eea\u548c\u540e\u53f0\u5ba1\u8ba1\u8868\u660e\u8fd0\u8425\u51b3\u7b56\u53ef\u6062\u590d\u3001\u53ef\u8ffd\u6eaf\u3002",
        next: "\u6253\u5f00\u540e\u53f0\u5c31\u7eea\u5ea6",
        title: "\u901a\u77e5\u3001\u5c31\u7eea\u3001\u5ba1\u8ba1"
      }
    }
  }
} as const;

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useskillhub.com";
  const dashboardReturnUrl = `${appUrl.replace(/\/$/, "")}${localizedHref("/dashboard", locale)}`;
  const labels = dictionary.dashboardPage;
  const commandLabels = dashboardCommandCopy[locale];
  const demoChainLabels = dashboardDemoChainCopy[locale];
  const ops = opsCopy[locale];
  const [
    financeLedger,
    payoutSummary,
    publisherAccount,
    publisherSkills,
    publisherBuyerRequests,
    developerBuyerRequests,
    developerProjects,
    publisherRefunds,
    publisherDisputes,
    organizationBilling,
    userNotificationInbox,
    notificationPreferences,
    launchReadiness,
    session
  ] = await Promise.all([
    getPublisherFinanceLedger(),
    getPublisherPayoutSummary(),
    getPublisherAccountSummary(),
    getPublisherSkills(),
    getPublisherBuyerRequests(),
    getDeveloperBuyerRequests(),
    getDeveloperProjects(),
    getPublisherRefunds(),
    getPublisherDisputes(),
    getOrganizationBillingSummary(),
    getUserNotificationInbox(),
    getNotificationPreferences(),
    getAdminLaunchReadiness(),
    getWorkspaceSession()
  ]);
  const ledgerRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 5).map((transaction) => [
          transaction.skillName ?? transaction.skillSlug ?? transaction.id,
          formatMoney(transaction.grossCents, transaction.currency),
          formatMoney(transaction.platformFeeCents, transaction.currency),
          formatMoney(transaction.publisherShareCents, transaction.currency),
          formatLedgerStatus(transaction.balanceState ?? transaction.status, ops)
        ])
      : [];
  const totalInstalledSkills = developerProjects.reduce((sum, project) => sum + project.installs.installedSkillCount, 0);
  const totalRuntimeCalls = developerProjects.reduce((sum, project) => sum + project.runtime.callCount, 0);
  const totalBillableCalls = developerProjects.reduce((sum, project) => sum + project.usage.billableUsageCount, 0);
  const totalActiveSubscriptions = developerProjects.reduce((sum, project) => sum + project.subscriptions.activeCount, 0);
  const verifiedPublisherSkills = publisherSkills.filter((skill) => skill.verificationStatus === "verified").length;
  const publisherReviewWork = publisherSkills.filter(
    (skill) =>
      skill.verificationStatus === "draft" ||
      skill.verificationStatus === "submitted" ||
      skill.verificationStatus === "rejected" ||
      skill.runtime.failedCount > 0 ||
      skill.runtime.warningCount > 0
  ).length;
  const paidBlockerCount = publisherSkills.reduce((sum, skill) => sum + (skill.commercial?.blockers.length ?? 0), 0);
  const launchIssueCount = launchReadiness.summary.blocker + launchReadiness.summary.warning;
  const submittedVersionCount = publisherSkills.filter(
    (skill) =>
      skill.verificationStatus === "submitted" ||
      skill.verificationStatus === "verified" ||
      skill.review.status === "queued" ||
      skill.review.status === "in_review" ||
      skill.review.status === "approved"
  ).length;
  const automatedCheckCount = publisherSkills.reduce((sum, skill) => sum + skill.runtime.checkCount, 0);
  const automatedCheckProblemCount = publisherSkills.reduce(
    (sum, skill) => sum + skill.runtime.failedCount + skill.runtime.warningCount,
    0
  );
  const publicListingCount = publisherSkills.filter(
    (skill) =>
      skill.visibility === "public" &&
      (skill.verificationStatus === "submitted" ||
        skill.verificationStatus === "verified" ||
        skill.verificationStatus === "deprecated")
  ).length;
  const activeProjectKeyCount = developerProjects.reduce((sum, project) => sum + project.apiKeys.activeCount, 0);
  const ownerApprovalCount = developerProjects.reduce(
    (sum, project) => sum + project.installs.ownerRequiredCount + project.policy.approvalRequiredCount,
    0
  );
  const runtimeIssueCount = developerProjects.reduce(
    (sum, project) => sum + project.runtime.errorCount + project.runtime.blockedCount,
    0
  );
  const runtimeSuccessCount = developerProjects.reduce((sum, project) => sum + project.runtime.successCount, 0);
  const payoutBlockerCount = payoutSummary.readiness?.blockers.length ?? 0;
  const activePayoutWork = payoutSummary.payouts.filter((payout) => payout.status !== "paid").length;
  const notificationIssueCount = userNotificationInbox.summary.failed + userNotificationInbox.summary.skipped;
  const primaryProject = developerProjects.find((project) => project.installs.installedSkillCount > 0) ?? developerProjects[0];
  const projectRuntimeHref = primaryProject ? `/dashboard/projects/${primaryProject.slug}` : "/developer";
  const visibleMetrics = [
    [labels.metrics[0][0], formatMoney(financeLedger.summary.availableBalanceCents)],
    [labels.metrics[1][0], formatMoney(financeLedger.summary.pendingBalanceCents)],
    [labels.metrics[2][0], formatCompactNumber(totalBillableCalls)],
    [labels.metrics[3][0], formatCompactNumber(totalActiveSubscriptions)]
  ];
  const developerProjectRows =
    developerProjects.length > 0
      ? developerProjects.slice(0, 6).map((project) => ({
          budget: `${formatMoney(project.policy.monthlyBudgetCents, project.usage.currency)} / ${formatCompactNumber(project.runtime.callCount)} ${ops.calls}`,
          keys: `${project.apiKeys.activeCount} ${ops.activeKeys} / ${project.apiKeys.revokedCount} ${ops.revokedKeys}`,
          name: project.name,
          policy: `${formatProjectPolicyState(project.policy.state, ops)} / ${project.updates.count} ${ops.updates}`,
          slug: project.slug
        }))
      : [];
  const adjustmentRows = [
    ...publisherRefunds.slice(0, 4).map((refund) => ({
      amount: `-${formatMoney(refund.amountCents, refund.currency)}`,
      id: refund.id,
      project: refund.projectSlug ?? ops.unknownProject,
      reason: refund.reason ?? refund.providerReference ?? ops.refundReview,
      skill: refund.skillName ?? refund.transactionId ?? refund.id,
      status: formatRefundStatus(refund.status, ops),
      type: ops.adjustmentTypes.refund,
      typeKey: "refund"
    })),
    ...publisherDisputes.slice(0, 4).map((dispute) => ({
      amount: formatMoney(dispute.amountCents, dispute.currency),
      id: dispute.id,
      project: dispute.projectSlug ?? ops.unknownProject,
      reason: dispute.reason ?? dispute.externalReference ?? ops.disputeReview,
      skill: dispute.skillName ?? dispute.transactionId ?? dispute.id,
      status: formatDisputeStatus(dispute.status, ops),
      type: ops.adjustmentTypes.dispute,
      typeKey: "dispute"
    }))
  ].slice(0, 6);
  const dashboardCommandCards = [
    {
      description: commandLabels.cards.account.description,
      href: session.subject ? "/account" : "/login",
      icon: UserCircle,
      key: "account",
      metricLabel: commandLabels.cards.account.metric,
      metricValue: formatCompactNumber(userNotificationInbox.summary.unread),
      nextAction: session.subject ? commandLabels.cards.account.nextSignedIn : commandLabels.cards.account.nextSignedOut,
      requiredRoles: [] as string[],
      role: commandLabels.cards.account.role,
      signal: session.subject
        ? session.subject.displayName ?? session.subject.email ?? commandLabels.status.available
        : commandLabels.signInRequired,
      title: commandLabels.cards.account.title
    },
    {
      description: commandLabels.cards.developer.description,
      href: "/developer",
      icon: BriefcaseBusiness,
      key: "developer",
      metricLabel: commandLabels.cards.developer.metric,
      metricValue: formatCompactNumber(developerProjects.length),
      nextAction: developerProjects.length > 0 ? commandLabels.cards.developer.nextReady : commandLabels.cards.developer.nextEmpty,
      requiredRoles: ["developer", "owner", "admin", "super_admin"],
      role: commandLabels.cards.developer.role,
      signal:
        locale === "zh"
          ? `${formatCompactNumber(totalInstalledSkills)} 已安装 / ${formatCompactNumber(totalRuntimeCalls)} 调用`
          : `${formatCompactNumber(totalInstalledSkills)} installed / ${formatCompactNumber(totalRuntimeCalls)} calls`,
      title: commandLabels.cards.developer.title
    },
    {
      description: commandLabels.cards.publisher.description,
      href: "/publisher",
      icon: UploadCloud,
      key: "publisher",
      metricLabel: commandLabels.cards.publisher.metric,
      metricValue: formatCompactNumber(publisherSkills.length),
      nextAction: publisherSkills.length > 0 ? commandLabels.cards.publisher.nextReady : commandLabels.cards.publisher.nextEmpty,
      requiredRoles: ["publisher", "owner", "admin", "super_admin"],
      role: commandLabels.cards.publisher.role,
      signal:
        locale === "zh"
          ? `${formatCompactNumber(verifiedPublisherSkills)} 已验证 / ${formatCompactNumber(publisherReviewWork)} 待处理`
          : `${formatCompactNumber(verifiedPublisherSkills)} verified / ${formatCompactNumber(publisherReviewWork)} review`,
      title: commandLabels.cards.publisher.title
    },
    {
      description: commandLabels.cards.admin.description,
      href: "/admin",
      icon: ShieldCheck,
      key: "admin",
      metricLabel: commandLabels.cards.admin.metric,
      metricValue: formatCompactNumber(launchIssueCount),
      nextAction: launchIssueCount > 0 ? commandLabels.cards.admin.nextIssues : commandLabels.cards.admin.nextClear,
      requiredRoles: ["reviewer", "finance", "support", "admin", "super_admin"],
      role: commandLabels.cards.admin.role,
      signal:
        locale === "zh"
          ? `${launchReadiness.summary.blocker} 阻断 / ${launchReadiness.summary.warning} 警告`
          : `${launchReadiness.summary.blocker} blockers / ${launchReadiness.summary.warning} warnings`,
      title: commandLabels.cards.admin.title
    }
  ];
  const demoChainSteps: DemoChainStep[] = [
    {
      detail: demoChainLabels.steps.publish.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(publisherSkills.length)} 个自有技能 / ${formatCompactNumber(publisherReviewWork)} 个待处理`
          : `${formatCompactNumber(publisherSkills.length)} owned skills / ${formatCompactNumber(publisherReviewWork)} pending`,
      href: "/publish",
      icon: UploadCloud,
      id: "publish",
      next: demoChainLabels.steps.publish.next,
      status: publisherSkills.length > 0 ? "ready" : "waiting",
      title: demoChainLabels.steps.publish.title
    },
    {
      detail: demoChainLabels.steps.checks.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(submittedVersionCount)} 个已提交/已验证版本 / ${formatCompactNumber(automatedCheckProblemCount)} 个检查问题`
          : `${formatCompactNumber(submittedVersionCount)} submitted or verified / ${formatCompactNumber(automatedCheckProblemCount)} check issues`,
      href: "/publisher#publisher-skills",
      icon: ClipboardCheck,
      id: "checks",
      next: demoChainLabels.steps.checks.next,
      status: automatedCheckProblemCount > 0 ? "attention" : submittedVersionCount > 0 && automatedCheckCount > 0 ? "ready" : "waiting",
      title: demoChainLabels.steps.checks.title
    },
    {
      detail: demoChainLabels.steps.review.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(verifiedPublisherSkills)} 个已验证 / ${formatCompactNumber(publisherReviewWork)} 个需跟进`
          : `${formatCompactNumber(verifiedPublisherSkills)} verified / ${formatCompactNumber(publisherReviewWork)} need follow-up`,
      href: "/admin#admin-reviews",
      icon: ShieldCheck,
      id: "review",
      next: demoChainLabels.steps.review.next,
      status: verifiedPublisherSkills > 0 ? "ready" : publisherReviewWork > 0 ? "attention" : "waiting",
      title: demoChainLabels.steps.review.title
    },
    {
      detail: demoChainLabels.steps.listing.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(publicListingCount)} 个可公开发现列表`
          : `${formatCompactNumber(publicListingCount)} publicly discoverable listings`,
      href: "/marketplace",
      icon: BadgeCheck,
      id: "listing",
      next: demoChainLabels.steps.listing.next,
      status: publicListingCount > 0 ? "ready" : verifiedPublisherSkills > 0 ? "attention" : "waiting",
      title: demoChainLabels.steps.listing.title
    },
    {
      detail: demoChainLabels.steps.install.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(developerProjects.length)} 个项目 / ${formatCompactNumber(totalInstalledSkills)} 个安装`
          : `${formatCompactNumber(developerProjects.length)} projects / ${formatCompactNumber(totalInstalledSkills)} installs`,
      href: "/developer",
      icon: BriefcaseBusiness,
      id: "install",
      next: demoChainLabels.steps.install.next,
      status: totalInstalledSkills > 0 ? "ready" : developerProjects.length > 0 ? "attention" : "waiting",
      title: demoChainLabels.steps.install.title
    },
    {
      detail: demoChainLabels.steps.runtime.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(activeProjectKeyCount)} 个活动 Key / ${formatCompactNumber(runtimeSuccessCount)} 次成功 / ${formatCompactNumber(ownerApprovalCount + runtimeIssueCount)} 个需处理`
          : `${formatCompactNumber(activeProjectKeyCount)} active keys / ${formatCompactNumber(runtimeSuccessCount)} success / ${formatCompactNumber(ownerApprovalCount + runtimeIssueCount)} attention`,
      href: projectRuntimeHref,
      icon: RadioTower,
      id: "runtime",
      next: demoChainLabels.steps.runtime.next,
      status:
        ownerApprovalCount + runtimeIssueCount > 0
          ? "attention"
          : activeProjectKeyCount > 0 && totalRuntimeCalls > 0
            ? "ready"
            : "waiting",
      title: demoChainLabels.steps.runtime.title
    },
    {
      detail: demoChainLabels.steps.money.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(financeLedger.recentTransactions.length)} 条账本 / ${formatCompactNumber(activePayoutWork)} 个提现动作 / ${formatCompactNumber(payoutBlockerCount)} 个阻断`
          : `${formatCompactNumber(financeLedger.recentTransactions.length)} ledger rows / ${formatCompactNumber(activePayoutWork)} payout actions / ${formatCompactNumber(payoutBlockerCount)} blockers`,
      href: "/publisher#publisher-payouts",
      icon: CircleDollarSign,
      id: "money",
      next: demoChainLabels.steps.money.next,
      status: payoutBlockerCount > 0 ? "attention" : financeLedger.recentTransactions.length > 0 ? "ready" : "waiting",
      title: demoChainLabels.steps.money.title
    },
    {
      detail: demoChainLabels.steps.readiness.detail,
      evidence:
        locale === "zh"
          ? `${formatCompactNumber(userNotificationInbox.summary.total)} 条通知 / ${launchReadiness.summary.blocker} 阻断 / ${launchReadiness.summary.warning} 警告`
          : `${formatCompactNumber(userNotificationInbox.summary.total)} notifications / ${launchReadiness.summary.blocker} blockers / ${launchReadiness.summary.warning} warnings`,
      href: "/admin#launch-readiness",
      icon: Activity,
      id: "readiness",
      next: demoChainLabels.steps.readiness.next,
      status:
        launchIssueCount > 0 || notificationIssueCount > 0
          ? "attention"
          : userNotificationInbox.summary.total > 0 || launchReadiness.summary.ready > 0
            ? "ready"
            : "waiting",
      title: demoChainLabels.steps.readiness.title
    }
  ];
  const demoChainSummary = demoChainSteps.reduce(
    (summary, step) => {
      summary[step.status] += 1;
      return summary;
    },
    { attention: 0, ready: 0, waiting: 0 } as Record<DemoChainStatus, number>
  );
  const demoChainBottleneck = demoChainSteps.find((step) => step.status !== "ready") ?? null;

  return (
    <main className="product-shell">
      <SiteHeader active="dashboard" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/dashboard" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <WalletCards size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="dashboard-command-center" id="workspace-command-center">
        <div className="dashboard-command-center__intro">
          <div>
            <div className="eyebrow">
              <GitBranch size={16} aria-hidden="true" />
              <span>{commandLabels.eyebrow}</span>
            </div>
            <h2>{commandLabels.title}</h2>
            <p>{commandLabels.body}</p>
          </div>
          <div className="dashboard-command-center__proof" aria-label={commandLabels.eyebrow}>
            <div>
              <BadgeCheck size={16} aria-hidden="true" />
              <span>{commandLabels.proof.journeys}</span>
              <strong>3</strong>
            </div>
            <div>
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{commandLabels.proof.paidBlockers}</span>
              <strong>{formatCompactNumber(paidBlockerCount)}</strong>
            </div>
            <div>
              <Activity size={16} aria-hidden="true" />
              <span>{commandLabels.proof.runtimeCalls}</span>
              <strong>{formatCompactNumber(totalRuntimeCalls)}</strong>
            </div>
          </div>
        </div>

        <SessionStatusPanel locale={locale} session={session} />
        <ConsoleAccessPanel locale={locale} session={session} variant="compact" />
        <JourneyRailDeck locale={locale} />
        <OperatingEvidenceChain
          focus="platform"
          locale={locale}
          stats={[
            { label: commandLabels.evidence.projects, value: formatCompactNumber(developerProjects.length) },
            {
              label: commandLabels.evidence.verified,
              tone: verifiedPublisherSkills > 0 ? "good" : "attention",
              value: formatCompactNumber(verifiedPublisherSkills)
            },
            { label: commandLabels.evidence.ledger, value: formatCompactNumber(financeLedger.recentTransactions.length) },
            {
              label: commandLabels.evidence.launch,
              tone: launchReadiness.summary.blocker > 0 ? "attention" : "good",
              value: `${launchReadiness.summary.blocker}/${launchReadiness.summary.warning}`
            }
          ]}
        />

        <div className="dashboard-command-grid">
          {dashboardCommandCards.map((card) => {
            const Icon = card.icon;
            const access = getDashboardCommandState(card.requiredRoles, session, commandLabels);
            const href = getDashboardCommandHref(card.href, access.kind);
            const needsAttention =
              (card.key === "admin" && launchIssueCount > 0) ||
              (card.key === "publisher" && (publisherReviewWork > 0 || paidBlockerCount > 0));

            return (
              <article
                className={[
                  "dashboard-command-card",
                  `dashboard-command-card--${access.kind}`,
                  needsAttention ? "dashboard-command-card--attention" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={card.key}
              >
                <div className="dashboard-command-card__head">
                  <span className="dashboard-command-card__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className={access.kind === "available" ? "status-chip" : "status-chip status-chip--warning"}>
                    {needsAttention && access.kind === "available" ? commandLabels.status.needsWork : access.label}
                  </span>
                </div>
                <div className="dashboard-command-card__body">
                  <span>{card.role}</span>
                  <strong>{card.title}</strong>
                  <p>{card.description}</p>
                </div>
                <div className="dashboard-command-card__metric">
                  <span>{card.metricLabel}</span>
                  <strong>{card.metricValue}</strong>
                  <small>{card.signal}</small>
                </div>
                <a className="secondary-button secondary-button--compact" href={localizedHref(href, locale)}>
                  {commandLabels.actionOpen}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <div className="dashboard-command-card__next">{card.nextAction}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="p0-demo-chain" id="p0-demo-chain">
        <div className="p0-demo-chain__head">
          <div>
            <div className="eyebrow">
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{demoChainLabels.eyebrow}</span>
            </div>
            <h2>{demoChainLabels.title}</h2>
            <p>{demoChainLabels.body}</p>
          </div>
          <div className="p0-demo-chain__summary" aria-label={demoChainLabels.eyebrow}>
            <div className="p0-demo-chain__summary-card p0-demo-chain__summary-card--ready">
              <span>{demoChainLabels.summary.ready}</span>
              <strong>{demoChainSummary.ready}/8</strong>
            </div>
            <div className="p0-demo-chain__summary-card p0-demo-chain__summary-card--attention">
              <span>{demoChainLabels.summary.attention}</span>
              <strong>{demoChainSummary.attention}</strong>
            </div>
            <div className="p0-demo-chain__summary-card">
              <span>{demoChainLabels.summary.waiting}</span>
              <strong>{demoChainSummary.waiting}</strong>
            </div>
          </div>
        </div>

        <ol className="p0-demo-chain__steps">
          {demoChainSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <li className={`p0-demo-step p0-demo-step--${step.status}`} key={step.id}>
                <a href={localizedHref(step.href, locale)}>
                  <span className="p0-demo-step__index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="p0-demo-step__icon" aria-hidden="true">
                    <Icon size={17} />
                  </span>
                  <span className="status-chip">{demoChainLabels.status[step.status]}</span>
                  <strong>{step.title}</strong>
                  <small>{step.detail}</small>
                  <em>{step.evidence}</em>
                  <span className="p0-demo-step__action">
                    {demoChainLabels.action}
                    <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <div className="p0-demo-chain__bottleneck">
          <span>{demoChainLabels.bottleneck}</span>
          <strong>{demoChainBottleneck ? demoChainBottleneck.title : demoChainLabels.allClear}</strong>
          {demoChainBottleneck ? <small>{demoChainBottleneck.next}</small> : null}
        </div>
      </section>

      <section className="console-board">
        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {visibleMetrics.map(([label, value]) => (
            <div className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="console-grid">
          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <PackageCheck size={16} aria-hidden="true" />
              <span>{labels.publisher}</span>
            </div>
            <div className="ops-list">
              {labels.publisherCards.map(([title, detail], index) => {
                const Icon = publisherIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="ops-panel lift-card">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.buyer}</span>
            </div>
            <div className="ops-list">
              {labels.buyerCards.map(([title, detail], index) => {
                const Icon = buyerIcons[index];
                return (
                  <div className="ops-row" key={title}>
                    <Icon size={18} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="workspace-ops-layout">
        <PublisherSkillManager locale={locale} skills={publisherSkills} />

        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{ops.projectTitle}</span>
          </div>
          <ProjectCreateForm locale={locale} />
          <div className="work-table">
            <div className="work-table__row work-table__row--head">
              {ops.projectHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {developerProjectRows.map((project) => (
              <div className="work-table__row" key={project.slug}>
                <strong>
                  <a className="table-link" href={localizedHref(`/dashboard/projects/${project.slug}`, locale)}>
                    {project.name}
                  </a>
                </strong>
                <span>{project.budget}</span>
                <span>{project.keys}</span>
                <span>{project.policy}</span>
              </div>
            ))}
            {developerProjectRows.length === 0 ? (
              <div className="work-table__empty">{locale === "zh" ? "暂无开发者项目。" : "No developer projects yet."}</div>
            ) : null}
          </div>
        </article>

        <BuyerRequestManager
          developerRequests={developerBuyerRequests}
          locale={locale}
          publisherRequests={publisherBuyerRequests}
          publisherSkills={publisherSkills}
        />
      </section>

      <section className="finance-layout">
        <article className="ops-panel finance-panel">
          <div className="card-kicker">
            <CircleDollarSign size={16} aria-hidden="true" />
            <span>{labels.ledgerTitle}</span>
          </div>
          <div className="ledger-table">
            <div className="ledger-row ledger-row--head">
              {labels.ledgerHeaders.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {ledgerRows.length > 0 ? (
              ledgerRows.map(([skill, gross, fee, net, status]) => (
                <div className="ledger-row" key={skill}>
                  <strong>{skill}</strong>
                  <span>{gross}</span>
                  <span>{fee}</span>
                  <span>{net}</span>
                  <span className="status-chip">{status}</span>
                </div>
              ))
            ) : (
              <div className="ledger-row ledger-row--empty">
                <strong>{locale === "zh" ? "暂无已入账发布者收入。" : "No posted publisher revenue yet"}</strong>
              </div>
            )}
          </div>
        </article>

        <aside className="finance-side">
          <PublisherAccountManager account={publisherAccount} locale={locale} returnUrl={dashboardReturnUrl} />

          <PublisherPayoutManager locale={locale} summary={payoutSummary} />

          <OrganizationBillingManager billing={organizationBilling} locale={locale} />

          <NotificationInboxManager
            locale={locale}
            notifications={userNotificationInbox.notifications}
            summary={userNotificationInbox.summary}
          />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
        </aside>
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom workspace-ops-layout--adjustments">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
            <RotateCcw size={16} aria-hidden="true" />
            <span>{ops.adjustmentTitle}</span>
          </div>
          <div className="work-table work-table--adjustments">
            <div className="work-table__row work-table__row--head adjustment-row">
              {ops.adjustmentHeaders.map((header) => (
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
                <strong>{ops.adjustmentEmpty}</strong>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom">
        <article className="ops-panel runtime-ops-panel">
          <div className="card-kicker">
            <RadioTower size={16} aria-hidden="true" />
            <span>{ops.apiTitle}</span>
          </div>
          <div className="trust-requirement-grid">
            {ops.apiRows.map(([title, detail]) => (
              <div className="trust-requirement" key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

type DashboardOpsCopy = (typeof opsCopy)["en"] | (typeof opsCopy)["zh"];
type DashboardCommandCopy = (typeof dashboardCommandCopy)["en"] | (typeof dashboardCommandCopy)["zh"];

function getDashboardCommandState(requiredRoles: string[], session: WorkspaceSession, labels: DashboardCommandCopy) {
  if (!session.subject) {
    return {
      kind: "blocked" as const,
      label: labels.signInRequired
    };
  }

  if (requiredRoles.length === 0) {
    return {
      kind: "available" as const,
      label: labels.status.ready
    };
  }

  const roleSet = new Set([session.subject.platformRole, ...session.subject.roles].filter(Boolean));
  const hasRole = requiredRoles.some((role) => roleSet.has(role));

  if (!hasRole) {
    return {
      kind: "forbidden" as const,
      label: labels.roleRequired
    };
  }

  return {
    kind: "available" as const,
    label: labels.status.available
  };
}

function getDashboardCommandHref(href: string, state: "available" | "blocked" | "forbidden") {
  if (state === "blocked") {
    return "/login";
  }

  if (state === "forbidden") {
    return "/account";
  }

  return href;
}

function formatLedgerStatus(value: string, ops: DashboardOpsCopy) {
  return ops.ledgerStatuses[value as keyof typeof ops.ledgerStatuses] ?? value.replaceAll("_", " ");
}

function formatProjectPolicyState(value: string, ops: DashboardOpsCopy) {
  return ops.projectPolicyStates[value as keyof typeof ops.projectPolicyStates] ?? value.replaceAll("_", " ");
}

function formatRefundStatus(value: string, ops: DashboardOpsCopy) {
  return ops.refundStatuses[value as keyof typeof ops.refundStatuses] ?? value.replaceAll("_", " ");
}

function formatDisputeStatus(value: string, ops: DashboardOpsCopy) {
  return ops.disputeStatuses[value as keyof typeof ops.disputeStatuses] ?? value.replaceAll("_", " ");
}
