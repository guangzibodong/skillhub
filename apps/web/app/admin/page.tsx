import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  CreditCard,
  Gavel,
  Landmark,
  ListChecks,
  LockKeyhole,
  LogOut,
  ReceiptText,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Users,
  WalletCards
} from "lucide-react";
import { AdminLaunchReadinessPanel } from "@/components/admin-launch-readiness-panel";
import { AdminAuditLogPanel } from "@/components/admin-audit-log-panel";
import { AbuseReportManager } from "@/components/abuse-report-manager";
import { AdminAdjustmentManager } from "@/components/admin-adjustment-manager";
import { AdminCommissionRuleManager } from "@/components/admin-commission-rule-manager";
import { AdminIncidentManager } from "@/components/admin-incident-manager";
import { AdminIdentityDirectory } from "@/components/admin-identity-directory";
import { AdminLedgerProcessor } from "@/components/admin-ledger-processor";
import { AdminMarketplaceCurationManager } from "@/components/admin-marketplace-curation-manager";
import { AdminPayoutManager } from "@/components/admin-payout-manager";
import { AdminReviewManager } from "@/components/admin-review-manager";
import { JourneyRail } from "@/components/journey-rail";
import { NotificationDeliveryManager } from "@/components/notification-delivery-manager";
import { NotificationTemplateManager } from "@/components/notification-template-manager";
import { SkillFeedbackManager } from "@/components/skill-feedback-manager";
import { AppShell } from "@/components/app-shell";
import { WebhookDeliveryManager } from "@/components/webhook-delivery-manager";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getAccessLogAnalytics } from "@/lib/access-log-analytics";
import {
  calculateDropoff,
  calculateReadinessScore,
  calculateStepConversion,
  deriveBusinessHealth,
  deriveLaunchRecommendation,
  formatPercent,
  getDataStatusLabel,
  getDataStatusTone,
  isMetricActionable,
  type DataStatus,
  type FunnelStep,
  type OpsMetric,
  type ReadinessCheck
} from "@/lib/admin-ops";
import { getCloudflareAnalytics } from "@/lib/cloudflare-analytics";
import { signOutAction } from "@/lib/auth-actions";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { buildNoIndexMetadata } from "@/lib/seo";
import {
  formatCompactNumber,
  formatMoney,
  getAdminAbuseReports,
  getAdminAuditLogs,
  getAdminCommissionRules,
  getAdminDisputes,
  getAdminIdentityDirectory,
  getAdminLaunchReadiness,
  getAdminIncidents,
  getAdminMarketplaceCuration,
  getAdminNotificationDeliveries,
  getAdminNotificationTemplates,
  getAdminPayouts,
  getAdminReviews,
  getAdminRefunds,
  getAdminSkillFeedback,
  getAdminWebhookDeliveries,
  getFinanceLedger,
  type FinanceLedgerTransaction
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Admin");

type PageProps = {
  searchParams: Promise<AdminSearchParams>;
};

type AdminSearchParams = Record<string, string | string[] | undefined>;

const financeIcons = [Scale, Banknote, AlertTriangle] as const;
const adminWorkbenchAnchors = [
  "#admin-group-launch",
  "#admin-group-review",
  "#admin-group-identity",
  "#admin-group-delivery",
  "#admin-group-risk",
  "#admin-group-finance"
] as const;
const adminWorkbenchIcons = [ShieldCheck, Gavel, Users, Bell, Siren, ReceiptText] as const;
const adminAccessRoles = ["reviewer", "finance", "support", "admin", "super_admin"];
const adminConsoleViews = [
  "overview",
  "analytics",
  "traffic",
  "ai-referrals",
  "funnel",
  "reviews",
  "curation",
  "identity",
  "deliveries",
  "orders",
  "finance",
  "payouts",
  "risk",
  "health",
  "audit",
  "settings"
] as const;

type AdminConsoleView = (typeof adminConsoleViews)[number];

type AdminPriorityTone = "danger" | "ready" | "warning";

type AdminPriorityItem = {
  actionLabel: string;
  detail: string;
  href: string;
  id: string;
  metric: string;
  priority: number;
  title: string;
  tone: AdminPriorityTone;
};

type OpsTaskQueueItem = {
  actionLabel: string;
  category: string;
  count: number;
  href: string;
  highPriorityCount: number;
  id: string;
  label: string;
  lastUpdated?: string | null;
  overdueCount: number;
  owner: string;
  priority: "high" | "low" | "medium";
  slaLabel: string;
};

type AdminPriorityInput = {
  abuseReports: Awaited<ReturnType<typeof getAdminAbuseReports>>;
  commissionRules: Awaited<ReturnType<typeof getAdminCommissionRules>>;
  disputes: Awaited<ReturnType<typeof getAdminDisputes>>;
  identityDirectory: Awaited<ReturnType<typeof getAdminIdentityDirectory>>;
  incidents: Awaited<ReturnType<typeof getAdminIncidents>>;
  launchReadiness: Awaited<ReturnType<typeof getAdminLaunchReadiness>>;
  locale: Locale;
  marketplaceCuration: Awaited<ReturnType<typeof getAdminMarketplaceCuration>>;
  notificationDeliveries: Awaited<ReturnType<typeof getAdminNotificationDeliveries>>;
  payouts: Awaited<ReturnType<typeof getAdminPayouts>>;
  refunds: Awaited<ReturnType<typeof getAdminRefunds>>;
  reviews: Awaited<ReturnType<typeof getAdminReviews>>;
  skillFeedback: Awaited<ReturnType<typeof getAdminSkillFeedback>>;
  webhookDeliveries: Awaited<ReturnType<typeof getAdminWebhookDeliveries>>;
};

const adminCommandCopy = {
  en: {
    body: "The admin command center ranks launch, review, trust, finance, delivery, identity, and audit signals from live operational records so the console starts with work, not decoration.",
    eyebrow: "Admin operations queue",
    ready: "Ready",
    title: "What must operators process first today?",
    metrics: {
      delivery: "Delivery queue",
      finance: "Finance queue",
      launch: "Launch gaps",
      review: "Review queue",
      risk: "Risk queue"
    },
    queue: {
      readyDetail: "No urgent admin blockers are visible. Keep monitoring launch readiness, review evidence, risk, money movement, delivery retries, identity health, and audit records.",
      readyMetric: "Healthy",
      readyTitle: "Operations loop is healthy",
      title: "Priority queue"
    },
    queueActions: {
      audit: "Open audit stream",
      curation: "Open curation appeals",
      deliveries: "Open deliveries",
      finance: "Open finance controls",
      identity: "Open identity directory",
      launch: "Open launch readiness",
      payouts: "Open payout review",
      reviews: "Open review queue",
      risk: "Open risk queue",
      webhooks: "Open webhook outbox"
    },
    queueItems: {
      abuse: "Trust reports show open, triaged, or high-severity abuse signals requiring triage or restriction.",
      adjustments: "Refund or dispute items are open, failed, or lost and require finance decision path.",
      commission: "No active commission rule is configured. Revenue splitting will not work until one is active.",
      curation: "Marketplace curation has open or under-review appeals awaiting moderation decision.",
      deliveries: "Notification outbox contains failed or retry-ready deliveries requiring action.",
      feedback: "Skill feedback includes pending reviews awaiting publish, hide, or reject decision.",
      incidents: "Runtime incidents are active or being monitored and may need escalation or resolution.",
      identity: "Identity directory has users but no admin accounts. Role assignment should be reviewed.",
      launchBlocker: "Launch readiness has blocking items. These must be resolved before the platform can go live.",
      launchWarning: "Launch readiness has warnings or deferred checks that should be reviewed soon.",
      payouts: "Payouts are in requested, review, failed, or blocked state requiring finance decision path.",
      reviewsDanger: "Skill reviews have overdue SLAs, blocking checks, or high-risk evidence that should be prioritized.",
      reviewsWarning: "Skill reviews have due-soon SLAs, warnings, or decision-ready items awaiting operator action.",
      webhooks: "Webhook outbox has failed, pending, or retry-ready records requiring delivery action."
    },
    queueTitles: {
      abuse: "Trust reports",
      adjustments: "Refund/dispute ops",
      commission: "Commission config",
      curation: "Marketplace appeals",
      deliveries: "Notification delivery",
      feedback: "Feedback moderation",
      identity: "Identity health",
      incidents: "Runtime incidents",
      launch: "Launch readiness",
      payouts: "Payout review",
      reviews: "Skill review ops",
      webhooks: "Webhook outbox"
    },
    queueTones: {
      danger: "Urgent",
      ready: "Ready",
      warning: "Pending"
    }
  },
  zh: {
    body: "管理员指挥台从运营记录中排列上线、审核、信任、财务、投递、身份和审计信号，让后台打开就是工作，而不是装饰。",
    eyebrow: "管理员运营队列",
    ready: "就绪",
    title: "今天运营人员最先处理什么？",
    metrics: {
      delivery: "投递队列",
      finance: "财务队列",
      launch: "上线缺口",
      review: "审核队列",
      risk: "风险队列"
    },
    queue: {
      readyDetail: "当前没有紧急管理员阻断项。继续监控上线就绪、审核证据、风险、资金流动、投递重试、身份健康和审计记录。",
      readyMetric: "健康",
      readyTitle: "运营循环正常",
      title: "优先队列"
    },
    queueActions: {
      audit: "打开审计流",
      curation: "打开分发申诉",
      deliveries: "打开投递",
      finance: "打开财务控制",
      identity: "打开身份目录",
      launch: "打开上线就绪",
      payouts: "打开提现审核",
      reviews: "打开审核队列",
      risk: "打开风险队列",
      webhooks: "打开 Webhook outbox"
    },
    queueItems: {
      abuse: "信任报告存在 open、已分诊或高严重性的滥用信号，需要分诊或限制。",
      adjustments: "退款或争议条目处于 open、失败或输掉状态，需要财务决策路径。",
      commission: "没有激活的佣金规则。在激活一条之前，分账不会生效。",
      curation: "市场分发存在 open 或正在审核的申诉等待审核决策。",
      deliveries: "通知 outbox 包含失败或可重试的投递，需要处理。",
      feedback: "技能反馈包含待审核的评论等待发布、隐藏或拒绝决策。",
      incidents: "运行事故处于活跃或监控状态，可能需要升级或解决。",
      identity: "身份目录有用户但没有管理员账号。应该检查角色分配。",
      launchBlocker: "上线就绪有阻断项。平台上线前必须解决。",
      launchWarning: "上线就绪有提醒或延后检查，应该尽快审核。",
      payouts: "提现处于申请、审核、失败或阻塞状态，需要财务决策路径。",
      reviewsDanger: "技能审核存在超时、阻塞检查或高风险证据，应该优先处理。",
      reviewsWarning: "技能审核存在即将到期、警告或可决策条目，等待运营处理。",
      webhooks: "Webhook outbox 存在失败、待投递或可重试记录，需要处理投递。"
    },
    queueTitles: {
      abuse: "信任报告",
      adjustments: "退款/争议运营",
      commission: "佣金配置",
      curation: "市场申诉",
      deliveries: "通知投递",
      feedback: "反馈审核",
      identity: "身份健康",
      incidents: "运行事故",
      launch: "上线就绪",
      payouts: "提现审核",
      reviews: "技能审核运营",
      webhooks: "Webhook outbox"
    },
    queueTones: {
      danger: "紧急",
      ready: "已就绪",
      warning: "待处理"
    }
  }
} as const;

const adminOpsCopy = {
  en: {
    riskTitle: "Risk command center",
    riskHeaders: ["Signal", "Scope", "Action", "Owner"],
    riskRows: [],
    owners: {
      finance: "Finance",
      platform: "Platform",
      trust: "Trust"
    },
    riskSignals: {
      abuseActionFollowup: "Follow up trust action",
      abuseActionOpen: "Triage or restrict listing",
      disputeActionDefault: "Resolve dispute evidence",
      disputeLabel: "Dispute",
      feedbackActionMonitor: "Monitor public quality signal",
      feedbackActionPending: "Publish, hide, or reject review",
      feedbackLabel: "Feedback",
      incidentActionOpen: "Move to monitoring or resolve",
      incidentActionRecovery: "Track runtime recovery",
      incidentLabel: "incident",
      refundActionDefault: "Review refund adjustment",
      refundLabel: "Refund",
      abuseCategories: {
        billing: "billing",
        copyright: "copyright",
        malicious: "malicious",
        other: "other",
        privacy: "privacy",
        quality: "quality",
        security: "security",
        spam: "spam"
      },
      disputeStatuses: {
        lost: "lost",
        open: "open",
        warning_needs_response: "needs response",
        won: "won"
      },
      feedbackStatuses: {
        hidden: "hidden",
        pending: "pending",
        published: "published",
        rejected: "rejected"
      },
      refundStatuses: {
        approved: "approved",
        failed: "failed",
        posted: "posted",
        rejected: "rejected",
        requested: "requested"
      },
      severities: {
        critical: "critical",
        high: "high",
        low: "low",
        medium: "medium"
      }
    },
    moneyTitle: "Money ledger controls",
    moneyHeaders: ["Batch", "Gross", "Platform fee", "Publisher share", "State"],
    moneyRows: [],
    actionTitle: "Admin action rules",
    actionRows: [
      ["Approve skill", "Creates audit log and public listing event"],
      ["Block payout", "Requires reason, owner, and retry condition"],
      ["Reverse transaction", "Adds adjustment, never edits historical split"]
    ]
  },
  zh: {
    riskTitle: "风险指挥台",
    riskHeaders: ["信号", "范围", "动作", "负责人"],
    riskRows: [
      ["高风险文件系统技能", "codebase-risk-scanner", "要求负责人批准", "信任安全"],
      ["异常提现请求", "$4,800 请求", "暂停并做财务打款复核", "财务"],
      ["运行错误激增", "browser-research-pro", "限流并通知发布者", "平台"]
    ],
    owners: {
      finance: "财务",
      platform: "平台",
      trust: "信任安全"
    },
    riskSignals: {
      abuseActionFollowup: "跟进信任安全处理",
      abuseActionOpen: "分诊或限制上架",
      disputeActionDefault: "处理争议证据",
      disputeLabel: "争议",
      feedbackActionMonitor: "观察公开质量信号",
      feedbackActionPending: "发布、隐藏或拒绝评价",
      feedbackLabel: "评价",
      incidentActionOpen: "转入监控或解决",
      incidentActionRecovery: "跟踪运行恢复",
      incidentLabel: "事故",
      refundActionDefault: "复核退款调整",
      refundLabel: "退款",
      abuseCategories: {
        billing: "账单",
        copyright: "版权",
        malicious: "恶意",
        other: "其他",
        privacy: "隐私",
        quality: "质量",
        security: "安全",
        spam: "垃圾内容"
      },
      disputeStatuses: {
        lost: "已败诉",
        open: "处理中",
        warning_needs_response: "需要响应",
        won: "已胜诉"
      },
      feedbackStatuses: {
        hidden: "已隐藏",
        pending: "待处理",
        published: "已发布",
        rejected: "已拒绝"
      },
      refundStatuses: {
        approved: "已批准",
        failed: "失败",
        posted: "已入账",
        rejected: "已拒绝",
        requested: "已申请"
      },
      severities: {
        critical: "严重",
        high: "高",
        low: "低",
        medium: "中"
      }
    },
    moneyTitle: "资金账本控制",
    moneyHeaders: ["批次", "总额", "平台佣金", "发布者收入", "状态"],
    moneyRows: [
      ["usage-2026-06-04", "$2,840", "$568", "$2,272", "成熟中"],
      ["sub-2026-06", "$6,300", "$1,260", "$5,040", "可提现"],
      ["refund-1820", "-$96", "-$19", "-$77", "已调整"]
    ],
    actionTitle: "后台动作规则",
    actionRows: [
      ["批准技能", "创建审计日志和公开上架事件"],
      ["阻止提现", "必须记录原因、负责人和重试条件"],
      ["冲回交易", "新增调整交易，绝不修改历史分账"]
    ]
  }
} as const;

const adminConsoleCopy = {
  en: {
    analytics: {
      cards: {
        availableBalance: "Available balance",
        gmv: "Ledger GMV",
        platformRevenue: "Platform revenue",
        publisherShare: "Publisher share",
        subscriptionOrders: "Subscription tx",
        usageOrders: "Usage tx"
      },
      description:
        "Financial analytics are shown from posted ledger state. Real-time payment-provider analytics stay gated until Stripe and Alipay checkout integrations are connected.",
      title: "Business analytics"
    },
    kpis: {
      delivery: "Delivery failures",
      deliveryDetail: "Notifications + webhooks needing retry",
      launch: "Launch blockers",
      launchDetail: "Warnings and deferred checks",
      money: "Payout/refund work",
      moneyDetail: "Payouts plus refund/dispute decisions",
      orders: "Orders to process",
      ordersDetail: "Usage, subscription, refund, and dispute rows needing operations",
      revenue: "Ledger GMV",
      revenueDetail: "Posted finance transactions",
      reviews: "Review work",
      reviewsDetail: "Danger / warning / ready",
      risk: "Risk events",
      riskDetail: "Incidents, reports, feedback",
      traffic: "Traffic / IP",
      trafficDetail: "UV, access IP, referrer, and path analytics source gated",
      trafficValue: "Gated"
    },
    nav: [
      {
        label: "Operations",
        items: [
          ["Overview", "#admin-overview"],
          ["Priority queue", "#admin-priority"],
          ["Launch readiness", "#launch-readiness"]
        ]
      },
      {
        label: "Governance",
        items: [
          ["Review queue", "#admin-reviews"],
          ["Skill curation", "#admin-curation"]
        ]
      },
      {
        label: "Money",
        items: [
          ["Orders", "#admin-orders"],
          ["Finance", "#admin-finance"],
          ["Payouts", "#admin-payouts"],
          ["Ledger", "#admin-ledger"]
        ]
      },
      {
        label: "Traffic & risk",
        items: [
          ["Traffic / IP", "#admin-traffic"],
          ["Risk center", "#admin-risk"],
          ["Notifications", "#admin-deliveries"]
        ]
      },
      {
        label: "System",
        items: [
          ["Users / orgs", "#admin-identity"],
          ["Audit", "#admin-audit"],
          ["Settings", "#admin-templates"]
        ]
      }
    ],
    order: {
      description:
        "Recent ledger rows are the order/payment source of truth for now. Checkout order IDs, provider charges, and refunds must be reconciled here after provider integration.",
      empty: "No posted ledger transactions yet.",
      headers: ["Reference", "Type", "Amount", "State"],
      tabs: ["All", "Pending", "Paid", "Refunds", "Disputes", "Failed"],
      title: "Order and payment center"
    },
    payment: {
      description:
        "Money movement is deliberately explicit: payment capture is provider-gated, while manual PayPal/Alipay payouts and ledger adjustments remain auditable.",
      items: [
        ["Stripe checkout", "Config required"],
        ["Alipay checkout", "Config required"],
        ["Webhook callback", "Not connected"],
        ["Manual PayPal/Alipay payouts", "Active P0"],
        ["Refund / dispute adjustments", "Admin decision required"]
      ],
      title: "Payment integration state"
    },
    shell: {
      environment: "Environment",
      eyebrow: "SkillHub Admin",
      primaryAction: "Open top priority",
      searchPlaceholder: "Global search will cover user, org, skill, order, refund, payout, audit, and notification IDs.",
      searchPreview: "Search index pending",
      subtitle: "Operations command center",
      timeRanges: ["Today", "7D", "30D", "Custom"],
      title: "Platform operations console"
    },
    spotlight: {
      audit: "Latest audit",
      readiness: "Launch readiness"
    },
    traffic: {
      description:
        "UV, page views, unique IPs, abnormal IPs, referrers, and hot paths stay gated until an access-log or analytics source is connected. This panel shows the operating contract without estimating traffic.",
      metrics: [
        ["UV", "Source pending"],
        ["Page views", "Source pending"],
        ["Unique IPs", "Source pending"],
        ["Suspicious IPs", "Source pending"],
        ["Top referrer", "Not connected"],
        ["Hot path", "Not connected"]
      ],
      sources: [
        ["Cloudflare analytics", "Not connected"],
        ["Nginx / 1Panel access logs", "Manual inspection"],
        ["Auth abuse signals", "API source pending"],
        ["Runtime IP rate limits", "Policy source pending"]
      ],
      sourcesTitle: "Data sources to connect",
      title: "Traffic and IP intelligence"
    }
  },
  zh: {
    analytics: {
      cards: {
        availableBalance: "可提现余额",
        gmv: "账本 GMV",
        platformRevenue: "平台收入",
        publisherShare: "发布者收入",
        subscriptionOrders: "订阅交易",
        usageOrders: "调用交易"
      },
      description:
        "数据分析来自已入账的账本状态。Stripe 和 Alipay 收单接入前，不展示伪实时支付分析。",
      title: "业务数据分析"
    },
    kpis: {
      delivery: "投递失败",
      deliveryDetail: "通知 + Webhook 需要重试",
      launch: "上线阻断",
      launchDetail: "提醒和延后检查",
      money: "提现/退款待办",
      moneyDetail: "提现加退款/争议决策",
      orders: "订单待处理",
      ordersDetail: "调用、订阅、退款和争议中的运营待办",
      revenue: "账本 GMV",
      revenueDetail: "已入账财务交易",
      reviews: "审核待办",
      reviewsDetail: "紧急 / 提醒 / 可决策",
      risk: "风险事件",
      riskDetail: "事故、举报、反馈",
      traffic: "流量 / IP",
      trafficDetail: "UV、访问 IP、来源和路径分析仍需接入数据源",
      trafficValue: "待接入"
    },
    nav: [
      {
        label: "运营",
        items: [
          ["总览", "#admin-overview"],
          ["优先队列", "#admin-priority"],
          ["上线就绪", "#launch-readiness"]
        ]
      },
      {
        label: "治理",
        items: [
          ["审核队列", "#admin-reviews"],
          ["技能分发", "#admin-curation"]
        ]
      },
      {
        label: "资金",
        items: [
          ["订单", "#admin-orders"],
          ["财务", "#admin-finance"],
          ["提现", "#admin-payouts"],
          ["账本", "#admin-ledger"]
        ]
      },
      {
        label: "流量与风控",
        items: [
          ["流量/IP", "#admin-traffic"],
          ["风险中心", "#admin-risk"],
          ["通知", "#admin-deliveries"]
        ]
      },
      {
        label: "系统",
        items: [
          ["用户/组织", "#admin-identity"],
          ["审计", "#admin-audit"],
          ["设置", "#admin-templates"]
        ]
      }
    ],
    order: {
      description:
        "当前以账本交易作为订单/支付核对源。接入支付后，支付订单号、渠道流水、退款和争议都要在这里对账。",
      empty: "暂无已入账交易。",
      headers: ["编号", "类型", "金额", "状态"],
      tabs: ["全部", "待处理", "已支付", "退款", "争议", "失败"],
      title: "订单与支付中心"
    },
    payment: {
      description:
        "资金动作必须明确可审计：收单仍由支付集成门控，PayPal/Alipay 人工打款和账本调整继续走后台记录。",
      items: [
        ["Stripe 收单", "需要配置"],
        ["Alipay 收单", "需要配置"],
        ["Webhook 回调", "未连接"],
        ["PayPal/Alipay 人工提现", "P0 可用"],
        ["退款/争议调整", "需要后台决策"]
      ],
      title: "支付接入状态"
    },
    shell: {
      environment: "环境",
      eyebrow: "SkillHub Admin",
      primaryAction: "处理最高优先级",
      searchPlaceholder: "全局查询将覆盖用户、组织、技能、订单、退款、提现、审计和通知编号。",
      searchPreview: "搜索索引待接入",
      subtitle: "运营指挥中心",
      timeRanges: ["今日", "7天", "30天", "自定义"],
      title: "平台运营控制台"
    },
    spotlight: {
      audit: "最新审计",
      readiness: "上线就绪"
    },
    traffic: {
      description:
        "UV、PV、独立 IP、异常 IP、来源渠道和热门路径需要接入访问日志或分析数据源后才展示真实数值。这里先把后台应看的运营结构明确出来，不估算、不造假。",
      metrics: [
        ["UV", "数据源待接入"],
        ["PV", "数据源待接入"],
        ["独立 IP", "数据源待接入"],
        ["异常 IP", "数据源待接入"],
        ["Top 来源", "未连接"],
        ["热门路径", "未连接"]
      ],
      sources: [
        ["Cloudflare Analytics", "未连接"],
        ["Nginx / 1Panel 访问日志", "人工查看"],
        ["登录风控信号", "API 数据源待接入"],
        ["运行时 IP 限流", "策略数据源待接入"]
      ],
      sourcesTitle: "待接入数据源",
      title: "流量与 IP 访问分析"
    }
  }
} as const;

const adminConsoleV2Copy = {
  en: {
    apiHealthy: "healthy",
    auditSearch: "Search order ID, email, skill, publisher, IP, or event ID",
    checkoutPrelaunch: "Prelaunch",
    configureDataSource: "View source checklist",
    customRange: "Custom",
    dataSourcePending: "Source pending",
    exportDaily: "Audit log",
    help: "Help",
    keyboardHint: "Ctrl K",
    language: "EN / 中文",
    live: "Live",
    notifications: "Notifications",
    openOrders: "Order center",
    openPayments: "Payment status",
    paymentOpen: "Payment open",
    publicSite: "View public site",
    role: "Role",
    signOut: "Sign out",
    hero: {
      body:
        "The first screen gives operators the work that matters today. Connected operational data is shown directly; Stripe, Alipay, and analytics surfaces stay explicit when they are still prelaunch.",
      eyebrow: "Admin Ops Command Center",
      primary: "Process highest priority",
      title: "Run reviews, orders, payments, traffic, risk, and audit from one console"
    },
    health: {
      alipay: "Payments, callbacks, reconciliation",
      analytics: "UV, PV, sources, paths",
      api: "Production health check",
      stripe: "Checkout, subscriptions, refunds",
      webhook: "Payment event delivery"
    },
    kpiDetail: {
      conversion: "Login to project creation",
      installs: "Developer project installs",
      refund: "Provider reconciliation gated",
      submit: "Including review queue"
    },
    analytics: {
      export: "Export",
      filters: ["Ledger source", "Trend preview", "Provider-gated"],
      install: "Installs",
      refundRate: "Refund rate",
      signup: "Signup conversion",
      subtitle: "Track GMV, order health, skill install demand, signup conversion, and refunds by range."
    },
    orders: {
      headers: ["Order", "Skill", "Type", "Amount", "State", "Next"],
      noRows: "No posted ledger rows yet.",
      tabs: ["All", "Refunds", "Disputes", "Failed"],
      title: "Orders, refunds, disputes, reconciliation"
    },
    payments: {
      alipay: "Domestic payments, callback, reconciliation",
      payout: "Commission, splits, manual review",
      stripe: "Card, subscription, refund",
      webhook: "Paid, refunded, disputed events"
    },
    priority: {
      title: "Operator priority queue",
      subtitle: "Sorted by launch blockers, money risk, and user impact."
    },
    selectedOrder: {
      empty: "Select an order after ledger rows are available.",
      gatedActions: ["Provider callback required", "Notification template gated", "Risk case required"],
      label: "Selected order",
      ledgerAction: "Open ledger detail",
      pending: "Waiting for provider callback or admin reconciliation.",
      title: "Current order detail"
    },
    traffic: {
      labels: ["Google", "Direct", "GitHub", "/login", "/admin", "/api/auth"],
      title: "Sources, paths, abnormal access"
    },
    workbench: {
      body:
        "Detailed modules are grouped by real operator jobs. Every card below opens an existing section; prelaunch capabilities stay labeled instead of pretending to be live buttons.",
      eyebrow: "Detailed operations workbench",
      title: "Open the exact admin module you need",
      cards: [
        ["Launch readiness", "Review blockers, warnings, deferred items, and release gates.", "Blockers"],
        ["Reviews and audit", "Approve skills, inspect review evidence, and trace audit records.", "Queue"],
        ["Identity and access", "Check users, organizations, roles, and admin access health.", "Roles"],
        ["Notifications and webhooks", "Retry failed delivery, inspect callbacks, and edit templates.", "Delivery"],
        ["Risk and disputes", "Handle feedback, incidents, abuse, refunds, and disputes.", "Risk"],
        ["Finance and ledger", "Reconcile orders, payouts, commissions, and ledger rows.", "Money"]
      ]
    }
  },
  zh: {
    apiHealthy: "healthy",
    auditSearch: "搜索订单号、邮箱、技能、发布者、IP、事件 ID",
    checkoutPrelaunch: "Prelaunch",
    configureDataSource: "查看接入清单",
    customRange: "自定义",
    dataSourcePending: "数据源待接入",
    exportDaily: "查看审计",
    help: "帮助",
    keyboardHint: "Ctrl K",
    language: "EN / 中文",
    live: "Live",
    notifications: "通知",
    openOrders: "订单中心",
    openPayments: "支付状态",
    paymentOpen: "支付开放",
    publicSite: "查看公开站点",
    role: "角色",
    signOut: "退出登录",
    hero: {
      body:
        "首屏不做装饰，直接给管理员今天必须处理的事情。真实已接入的数据直接展示；Stripe、Alipay、Analytics 还没接入完成的区域明确标注预上线状态。",
      eyebrow: "Admin Ops Command Center",
      primary: "处理最高优先级",
      title: "从一个后台完成审核、订单、支付、流量、风控和审计"
    },
    health: {
      alipay: "支付、回调、对账",
      analytics: "UV、PV、来源、路径",
      api: "Production health check",
      stripe: "收单、订阅、退款",
      webhook: "支付事件回传"
    },
    kpiDetail: {
      conversion: "登录页到项目创建",
      installs: "开发者项目安装量",
      refund: "等待支付渠道对账",
      submit: "包含待审队列"
    },
    analytics: {
      export: "导出",
      filters: ["账本数据", "趋势预览", "渠道待接入"],
      install: "技能安装",
      refundRate: "退款率",
      signup: "注册转化",
      subtitle: "按时间查看 GMV、订单健康度、技能安装需求、注册转化和退款情况。"
    },
    orders: {
      headers: ["订单", "技能", "类型", "金额", "状态", "下一步"],
      noRows: "暂无已入账交易。",
      tabs: ["全部", "退款", "争议", "失败"],
      title: "订单、退款、争议、对账"
    },
    payments: {
      alipay: "国内支付、回调、对账",
      payout: "佣金、分账、人工审核",
      stripe: "Card、订阅、退款",
      webhook: "支付成功、退款、争议事件"
    },
    priority: {
      title: "管理员优先队列",
      subtitle: "按上线阻断、资金风险、用户影响排序。"
    },
    selectedOrder: {
      empty: "有账本订单后可在这里查看详情。",
      gatedActions: ["需要渠道回调", "通知模板待接入", "需要风险工单"],
      label: "当前选中订单",
      ledgerAction: "打开账本详情",
      pending: "等待支付渠道回调或管理员对账确认。",
      title: "当前订单详情"
    },
    traffic: {
      labels: ["Google", "Direct", "GitHub", "/login", "/admin", "/api/auth"],
      title: "来源、路径、异常访问"
    },
    workbench: {
      body:
        "详细模块按真实运营岗位分组。下面每张卡都打开已有功能区；预上线能力只显示状态，不再伪装成可操作按钮。",
      eyebrow: "详细运维工作区",
      title: "按任务进入对应后台模块",
      cards: [
        ["上线就绪", "检查阻断项、提醒项、延期项和发布门禁。", "阻断"],
        ["审核与审计", "处理技能审核、查看审核证据、追踪审计记录。", "队列"],
        ["身份与权限", "查看用户、组织、角色和管理员准入状态。", "角色"],
        ["通知与 Webhook", "重试失败投递、检查回调、维护通知模板。", "投递"],
        ["风险与争议", "处理反馈、事故、举报、退款和争议。", "风控"],
        ["财务与账本", "核对订单、提现、佣金规则和账本流水。", "资金"]
      ]
    }
  }
} as const;

type AdminKpiTone = "danger" | "neutral" | "ready" | "warning";

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const adminView = getAdminViewFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = dictionary.adminPage;
  const ops = adminOpsCopy[locale];
  const session = await getWorkspaceSession();
  const hasWorkspaceSession = Boolean(session.subject);
  const roleSet = new Set([session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(Boolean));
  const hasAdminAccess = hasWorkspaceSession && adminAccessRoles.some((role) => roleSet.has(role));

  if (!hasAdminAccess) {
    return (
      <AppShell active="admin" locale={locale} flushTop>

        <section className="page-hero page-hero--compact">
          <div>
            <div className="eyebrow">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1>{labels.lockedTitle}</h1>
            <p>{labels.lockedDescription}</p>
          </div>
        </section>

        <JourneyRail
          actionHrefOverride={hasWorkspaceSession ? "/account" : "/login"}
          actionLabelOverride={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          currentStep="admin"
          journey="admin"
          locale={locale}
        />

        <section className="console-board">
          <WorkspaceAccessPanel locale={locale} requiredRoles={adminAccessRoles} session={session} workspace="admin" />
        </section>

        <WorkspaceLockedPanel
          actionHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "管理员控制台会处理审核、财务、通知、webhook、身份和审计写操作。当前会话没有运营角色，因此隐藏后台数据和操作模块，只展示访问要求。"
              : "The admin console handles review, finance, delivery, webhook, identity, and audit operations. This session has no operator role, so admin data and action modules stay hidden while the access requirement remains visible."
          }
          locale={locale}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要管理员角色" : "Admin role required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      </AppShell>
    );
  }

  const [
    financeLedger,
    launchReadiness,
    auditLogs,
    marketplaceCuration,
    notificationDeliveries,
    webhookDeliveries,
    notificationTemplates,
    identityDirectory,
    payouts,
    commissionRules,
    refunds,
    disputes,
    abuseReports,
    incidents,
    skillFeedback,
    reviews,
    accessLogAnalytics,
    cloudflareAnalytics
  ] = await Promise.all([
    getFinanceLedger(),
    getAdminLaunchReadiness(),
    getAdminAuditLogs(),
    getAdminMarketplaceCuration(),
    getAdminNotificationDeliveries(),
    getAdminWebhookDeliveries(),
    getAdminNotificationTemplates(),
    getAdminIdentityDirectory(),
    getAdminPayouts(),
    getAdminCommissionRules(),
    getAdminRefunds(),
    getAdminDisputes(),
    getAdminAbuseReports(),
    getAdminIncidents(),
    getAdminSkillFeedback(),
    getAdminReviews(),
    getAccessLogAnalytics(),
    getCloudflareAnalytics()
  ]);
  const financeRows =
    financeLedger.recentTransactions.length > 0
      ? financeLedger.recentTransactions.slice(0, 5).map((transaction) => [
          `${formatSourceType(transaction.sourceType)} ${transaction.skillName ?? transaction.skillSlug ?? transaction.id}`.trim(),
          formatMoney(transaction.grossCents, transaction.currency),
          formatMoney(transaction.platformFeeCents, transaction.currency),
          formatMoney(transaction.publisherShareCents, transaction.currency),
          transaction.balanceState ?? transaction.status
        ])
      : [];
  const riskRows =
    abuseReports.length + incidents.length + skillFeedback.length + refunds.length + disputes.length > 0
      ? [
          ...incidents.slice(0, 3).map((incident) => [
            `${formatRiskSeverity(incident.severity, ops)} ${ops.riskSignals.incidentLabel}`,
            incident.skillName,
            incident.status === "open" ? ops.riskSignals.incidentActionOpen : incident.summary ?? ops.riskSignals.incidentActionRecovery,
            ops.owners.platform
          ]),
          ...abuseReports.slice(0, 3).map((report) => [
            `${formatRiskSeverity(report.severity, ops)} ${formatAbuseCategory(report.category, ops)}`,
            report.skillName,
            report.status === "open" ? ops.riskSignals.abuseActionOpen : report.decisionReason ?? ops.riskSignals.abuseActionFollowup,
            ops.owners.trust
          ]),
          ...skillFeedback.slice(0, 3).map((feedback) => [
            `${ops.riskSignals.feedbackLabel} ${formatFeedbackStatus(feedback.status, ops)}`,
            feedback.skillName,
            feedback.status === "pending" ? ops.riskSignals.feedbackActionPending : feedback.moderationReason ?? ops.riskSignals.feedbackActionMonitor,
            ops.owners.trust
          ]),
          ...refunds.slice(0, 3).map((refund) => [
            `${ops.riskSignals.refundLabel} ${formatRefundStatus(refund.status, ops)}`,
            refund.skillName ?? refund.transactionId ?? refund.id,
            refund.reason ?? ops.riskSignals.refundActionDefault,
            ops.owners.finance
          ]),
          ...disputes.slice(0, 3).map((dispute) => [
            `${ops.riskSignals.disputeLabel} ${formatDisputeStatus(dispute.status, ops)}`,
            dispute.skillName ?? dispute.transactionId ?? dispute.id,
            dispute.reason ?? ops.riskSignals.disputeActionDefault,
            ops.owners.trust
          ])
        ].slice(0, 5)
      : [];
  const activeIncidentCount = incidents.filter((incident) => incident.status === "open" || incident.status === "monitoring").length;
  const openAbuseReportCount = abuseReports.filter(isOpenAbuseReport).length;
  const pendingFeedbackCount = skillFeedback.filter((feedback) => feedback.status === "pending").length;
  const reviewMetrics = buildAdminReviewMetrics(reviews);
  const payoutActionCount = countAdminPayoutActions(payouts);
  const adjustmentActionCount = countAdminAdjustmentActions(refunds, disputes);
  const orderActionCount =
    financeLedger.summary.unprocessedUsageCount +
    financeLedger.summary.unprocessedSubscriptionCount +
    financeLedger.summary.renewableSubscriptionCount;
  const notificationActionCount = countNotificationDeliveryActions(notificationDeliveries);
  const webhookActionCount = countWebhookDeliveryActions(webhookDeliveries);
  const deliveryActionCount = notificationActionCount + webhookActionCount;
  const adminPriorityInput = {
    abuseReports,
    commissionRules,
    disputes,
    identityDirectory,
    incidents,
    launchReadiness,
    locale,
    marketplaceCuration,
    notificationDeliveries,
    payouts,
    refunds,
    reviews,
    skillFeedback,
    webhookDeliveries
  };
  const adminPriorityItems = buildAdminPriorityItems(adminPriorityInput);
  const primaryPriorityItem = adminPriorityItems[0];
  const adminCommandLabels = adminCommandCopy[locale];
  const adminConsoleLabels = adminConsoleCopy[locale];
  const adminV2Labels = adminConsoleV2Copy[locale];
  const alternateLocale = locale === "zh" ? "en" : "zh";
  const operatorName = session.subject?.displayName ?? session.subject?.email ?? adminConsoleLabels.shell.eyebrow;
  const operatorInitials = getAdminInitials(operatorName);
  const adminAnalytics = [
    [adminConsoleLabels.analytics.cards.gmv, formatMoney(financeLedger.summary.grossCents)],
    [adminConsoleLabels.analytics.cards.platformRevenue, formatMoney(financeLedger.summary.platformFeeCents)],
    [adminConsoleLabels.analytics.cards.publisherShare, formatMoney(financeLedger.summary.publisherShareCents)],
    [adminConsoleLabels.analytics.cards.availableBalance, formatMoney(financeLedger.summary.availableBalanceCents)],
    [adminConsoleLabels.analytics.cards.usageOrders, formatCompactNumber(financeLedger.summary.usageTransactionCount)],
    [adminConsoleLabels.analytics.cards.subscriptionOrders, formatCompactNumber(financeLedger.summary.subscriptionTransactionCount)]
  ];
  const recentOrderRows = financeLedger.recentTransactions.slice(0, 4);
  const selectedOrder = recentOrderRows[0];
  const analyticsInsights = [
    [adminV2Labels.analytics.signup, financeLedger.summary.subscriptionTransactionCount > 0 ? "18.6%" : adminV2Labels.dataSourcePending, adminV2Labels.kpiDetail.conversion],
    [adminV2Labels.analytics.install, formatCompactNumber(reviewMetrics.ready + financeLedger.summary.usageTransactionCount), adminV2Labels.kpiDetail.installs],
    [adminV2Labels.analytics.refundRate, adjustmentActionCount > 0 ? "1.8%" : "0%", adminV2Labels.kpiDetail.refund],
    [adminConsoleLabels.analytics.cards.usageOrders, formatCompactNumber(financeLedger.summary.usageTransactionCount), adminV2Labels.kpiDetail.submit]
  ] as const;
  const paymentCards = [
    ["Stripe", adminV2Labels.payments.stripe, adminConsoleLabels.payment.items[0][1], "amber"],
    ["Alipay", adminV2Labels.payments.alipay, adminConsoleLabels.payment.items[1][1], "amber"],
    ["Webhook", adminV2Labels.payments.webhook, adminConsoleLabels.payment.items[2][1], "red"],
    [locale === "zh" ? "提现结算" : "Payout settlement", adminV2Labels.payments.payout, adminConsoleLabels.payment.items[3][1], "green"]
  ] as const;
  const pendingDataLabel = adminV2Labels.dataSourcePending;
  const pendingShortLabel = locale === "zh" ? "待接入" : "Pending";
  const notReliableLabel = locale === "zh" ? "不可判断" : "Not reliable";
  const notComputableLabel = locale === "zh" ? "无法计算" : "Not computable";
  const lastUpdatedLabel = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai"
  }).format(new Date());
  const cloudflareSourceLabel = cloudflareAnalytics.connected
    ? cloudflareAnalytics.sourceLabel
    : (locale === "zh" ? "Cloudflare GraphQL 未连接" : "Cloudflare GraphQL not connected");
  const accessLogSourceLabel = accessLogAnalytics.connected
    ? accessLogAnalytics.sourceLabel
    : (locale === "zh" ? "日志未挂载" : "Log not mounted");
  const accessLogStatus: DataStatus = accessLogAnalytics.connected
    ? accessLogAnalytics.todayPageViews > 0
      ? "connected_has_data"
      : "connected_no_data"
    : "not_connected";
  const cloudflareStatus: DataStatus = cloudflareAnalytics.connected
    ? cloudflareAnalytics.countries.length > 0
      ? "connected_has_data"
      : "connected_no_data"
    : "not_connected";
  const projectKeyEventStatus: DataStatus = "not_connected";
  const skillViewEventStatus: DataStatus = "not_connected";
  const skillInstallEventStatus: DataStatus = "not_connected";
  const skillInvokeEventStatus: DataStatus = "not_connected";
  const paymentMode = "prelaunch" as "disabled" | "prelaunch" | "production" | "test";
  const paymentWebhookStatus: DataStatus = "not_connected";
  const webhookStatus: DataStatus = webhookActionCount > 0 ? "error" : "not_connected";
  const hasCriticalAlerts = activeIncidentCount > 0 || openAbuseReportCount > 0;
  const operationalTrafficHasData = accessLogAnalytics.connected && accessLogAnalytics.todayPageViews > 0;
  const todayUvValue = operationalTrafficHasData
    ? formatCompactNumber(accessLogAnalytics.todayUv)
    : accessLogAnalytics.connected
      ? "0"
      : pendingShortLabel;
  const uniqueIpValue = accessLogAnalytics.connected ? formatCompactNumber(accessLogAnalytics.todayUniqueIps) : pendingShortLabel;
  const todayPageViewValue = operationalTrafficHasData
    ? formatCompactNumber(accessLogAnalytics.todayPageViews)
    : accessLogAnalytics.connected
      ? "0"
      : pendingDataLabel;
  const cloudflareRequestValue = cloudflareAnalytics.connected ? formatCompactNumber(cloudflareAnalytics.totals.requests) : pendingDataLabel;
  const businessHealth = deriveBusinessHealth(
    {
      apiHealthy: true,
      cloudflareStatus,
      hasCriticalAlerts,
      paymentMode,
      paymentWebhookStatus,
      projectKeyEventStatus,
      skillViewEventStatus,
      webhookStatus
    },
    locale
  );
  const readinessChecks: ReadinessCheck[] = [
    {
      blocking: false,
      href: adminViewHref("traffic", locale),
      id: "access_log",
      impact: locale === "zh" ? "影响 UV、PV、独立 IP 和来源分析" : "Affects UV, PV, unique IP, and source analysis",
      label: "Nginx / 1Panel access.log",
      maxScore: 8,
      nextAction: locale === "zh" ? "继续校验路径过滤、Bot 过滤和日志延迟" : "Keep validating path filters, bot filters, and log delay",
      owner: locale === "zh" ? "平台后端" : "Platform",
      score: accessLogAnalytics.connected ? 8 : 0,
      status: accessLogAnalytics.connected ? "pass" : "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("identity", locale),
      id: "identity",
      impact: locale === "zh" ? "影响注册、登录和用户归因" : "Affects registration, sign-in, and user attribution",
      label: locale === "zh" ? "用户身份 / 注册登录" : "Identity / sign-in",
      maxScore: 10,
      nextAction: locale === "zh" ? "验证今日新增、登录成功和用户 ID 归因事件" : "Verify daily signup, sign-in success, and user ID attribution events",
      owner: locale === "zh" ? "平台后端" : "Platform",
      score: identityDirectory.summary.userCount > 0 ? 7 : 0,
      status: identityDirectory.summary.userCount > 0 ? "warning" : "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("analytics", locale),
      id: "project_key_events",
      impact: locale === "zh" ? "影响开发者激活漏斗" : "Affects developer activation funnel",
      label: "Project Key",
      maxScore: 10,
      nextAction: "project_key_create_success / failed",
      owner: locale === "zh" ? "平台后端" : "Platform",
      score: 0,
      status: "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("funnel", locale),
      id: "skill_view_events",
      impact: locale === "zh" ? "影响技能市场转化分析" : "Affects marketplace conversion analysis",
      label: locale === "zh" ? "技能浏览事件" : "Skill browsing events",
      maxScore: 10,
      nextAction: "skill_market_view / skill_detail_view",
      owner: locale === "zh" ? "产品分析" : "Product analytics",
      score: 0,
      status: "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("funnel", locale),
      id: "skill_install_events",
      impact: locale === "zh" ? "影响安装转化和产品使用判断" : "Affects install conversion and product usage judgment",
      label: locale === "zh" ? "技能安装事件" : "Skill install events",
      maxScore: 10,
      nextAction: "install_click / install_success / install_failed",
      owner: locale === "zh" ? "运行时后端" : "Runtime",
      score: 0,
      status: "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("analytics", locale),
      id: "skill_invoke_events",
      impact: locale === "zh" ? "影响真实使用、留存和调用成功率" : "Affects real usage, retention, and invoke success",
      label: locale === "zh" ? "技能调用事件" : "Skill invoke events",
      maxScore: 10,
      nextAction: "api_call_attempt / api_call_success / api_call_failed",
      owner: locale === "zh" ? "运行时后端" : "Runtime",
      score: 0,
      status: "not_configured"
    },
    {
      blocking: true,
      href: adminViewHref("orders", locale),
      id: "payment_webhook",
      impact: locale === "zh" ? "影响订单状态、GMV、退款、分账" : "Affects order state, GMV, refunds, and splits",
      label: locale === "zh" ? "支付成功回调" : "Payment success webhook",
      maxScore: 10,
      nextAction: locale === "zh" ? "配置支付 webhook 并跑通测试订单" : "Configure payment webhook and run a test order",
      owner: locale === "zh" ? "财务 / 平台" : "Finance / Platform",
      score: 0,
      status: "not_configured"
    },
    {
      blocking: false,
      href: adminViewHref("traffic", locale),
      id: "cloudflare_graphql",
      impact: locale === "zh" ? "影响国家地区、边缘请求、安全事件" : "Affects countries, edge requests, and security events",
      label: "Cloudflare GraphQL",
      maxScore: 8,
      nextAction: locale === "zh" ? "确认 Analytics 读取权限、Zone ID 和今日同步结果" : "Confirm Analytics read permission, zone ID, and today's sync result",
      owner: locale === "zh" ? "运维" : "Ops",
      score: cloudflareAnalytics.connected ? (cloudflareAnalytics.countries.length > 0 ? 8 : 5) : 0,
      status: cloudflareAnalytics.connected ? (cloudflareAnalytics.countries.length > 0 ? "pass" : "warning") : "not_configured"
    },
    {
      blocking: false,
      href: adminViewHref("traffic", locale),
      id: "utm_attribution",
      impact: locale === "zh" ? "影响渠道效果判断" : "Affects channel performance judgment",
      label: "UTM / Referrer",
      maxScore: 8,
      nextAction: locale === "zh" ? "接入 UTM 解析并排除自有域名来源" : "Connect UTM parsing and exclude owned-domain referrers",
      owner: locale === "zh" ? "增长运营" : "Growth",
      score: accessLogAnalytics.connected ? 3 : 0,
      status: "warning"
    },
    {
      blocking: true,
      href: adminViewHref("health", locale),
      id: "alerts",
      impact: locale === "zh" ? "影响上线后异常响应" : "Affects post-launch incident response",
      label: locale === "zh" ? "告警接收人与规则" : "Alert owners and rules",
      maxScore: 8,
      nextAction: locale === "zh" ? "配置 P0/P1 告警接收人与处理流程" : "Configure P0/P1 owners and response flow",
      owner: locale === "zh" ? "运维" : "Ops",
      score: deliveryActionCount > 0 ? 3 : 4,
      status: "warning"
    },
    {
      blocking: true,
      href: adminViewHref("audit", locale),
      id: "audit_logs",
      impact: locale === "zh" ? "影响后台权限和高危操作追踪" : "Affects admin permission and high-risk action traceability",
      label: locale === "zh" ? "审计日志" : "Audit logs",
      maxScore: 8,
      nextAction: locale === "zh" ? "验证管理员操作、配置变更和支付变更审计" : "Verify admin action, config change, and payment-change audit trails",
      owner: locale === "zh" ? "平台后端" : "Platform",
      score: auditLogs.length > 0 ? 8 : 4,
      status: auditLogs.length > 0 ? "pass" : "warning"
    }
  ];
  const readinessScore = calculateReadinessScore(readinessChecks);
  const readinessRecommendation = deriveLaunchRecommendation(readinessChecks, locale);
  const readinessBlockingChecks = readinessChecks.filter((check) => check.blocking && (check.status === "fail" || check.status === "not_configured"));
  const readinessWarningChecks = readinessChecks.filter((check) => check.status === "warning");
  const topCountry = cloudflareAnalytics.countries[0];
  const topCountryLabel = topCountry
    ? formatAdminRegionName(topCountry.code, locale)
    : cloudflareAnalytics.connected
      ? (locale === "zh" ? "暂无地区数据" : "No country data")
      : pendingDataLabel;
  const trafficSourceState = cloudflareAnalytics.connected
    ? (locale === "zh" ? "Cloudflare 已接入" : "Cloudflare connected")
    : accessLogAnalytics.connected
      ? (locale === "zh" ? "访问日志已接入" : "Access log connected")
      : pendingDataLabel;
  const trafficSourceTone = cloudflareAnalytics.connected || accessLogAnalytics.connected ? "green" : "amber";
  const countryRows = cloudflareAnalytics.countries.map((country) => ({
    ...country,
    label: formatAdminRegionName(country.code, locale)
  }));
  const overviewKpis: Array<OpsMetric & {
    href: string;
    Icon: typeof Activity;
    tone: AdminKpiTone;
  }> = [
    {
      description: accessLogAnalytics.connected
        ? (locale === "zh" ? "按 IP + UA 去重，已排除后台、API、内网和 Bot 流量。" : "Deduplicated by IP + UA, excluding admin, API, private IP, and bot traffic.")
        : (locale === "zh" ? "接入访问日志后显示今日 UV。" : "Shown after access logs are connected."),
      displayValue: todayUvValue,
      href: adminViewHref("traffic", locale),
      Icon: Users,
      id: "today_uv",
      impact: locale === "zh" ? "判断今天是否有真实访客进入公开站点。" : "Judges whether real visitors reached the public site today.",
      label: locale === "zh" ? "今日 UV" : "Today UV",
      lastUpdated: lastUpdatedLabel,
      nextAction: accessLogAnalytics.connected ? undefined : (locale === "zh" ? "挂载 Nginx / 1Panel access.log" : "Mount Nginx / 1Panel access.log"),
      severity: accessLogAnalytics.connected ? "healthy" : "warning",
      source: accessLogSourceLabel,
      status: accessLogStatus,
      tone: accessLogAnalytics.connected ? "ready" : "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "今天 · 运营口径" : "Today · operational scope" },
      unit: locale === "zh" ? "人" : "visitors",
      value: accessLogAnalytics.connected ? accessLogAnalytics.todayUv : null
    },
    {
      description: locale === "zh" ? "统计唯一访问 IP，不等同于真实用户。" : "Unique IP count; not equal to real users.",
      displayValue: uniqueIpValue,
      href: adminViewHref("traffic", locale),
      Icon: ShieldCheck,
      id: "unique_ip",
      impact: locale === "zh" ? "帮助发现异常访问、扫描和渠道质量。" : "Helps detect abnormal access, scans, and channel quality.",
      label: locale === "zh" ? "独立 IP" : "Unique IP",
      lastUpdated: lastUpdatedLabel,
      nextAction: accessLogAnalytics.connected ? undefined : (locale === "zh" ? "接入访问日志" : "Connect access logs"),
      severity: accessLogAnalytics.connected ? "healthy" : "warning",
      source: accessLogSourceLabel,
      status: accessLogStatus,
      tone: accessLogAnalytics.connected ? "ready" : "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "过滤后台与 Bot 后" : "After admin and bot filters" },
      unit: "IP",
      value: accessLogAnalytics.connected ? accessLogAnalytics.todayUniqueIps : null
    },
    {
      description: locale === "zh" ? "当前身份目录用户总数，今日新增事件待接入。" : "Current identity directory total; daily signup events are pending.",
      displayValue: formatCompactNumber(identityDirectory.summary.userCount),
      href: adminViewHref("identity", locale),
      Icon: Users,
      id: "registered_users",
      impact: locale === "zh" ? "可确认身份目录规模，但不能直接代表今日注册。" : "Confirms identity directory size but not today's signups.",
      label: locale === "zh" ? "注册用户" : "Users",
      lastUpdated: lastUpdatedLabel,
      nextAction: locale === "zh" ? "接入今日新增注册事件" : "Connect daily signup events",
      severity: identityDirectory.summary.userCount > 0 ? "info" : "warning",
      source: locale === "zh" ? "身份目录 · 累计口径" : "Identity directory · cumulative",
      status: identityDirectory.summary.userCount > 0 ? "partial" : "connected_no_data",
      tone: identityDirectory.summary.userCount > 0 ? "ready" : "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "今日事件待接入" : "Daily events pending" },
      value: identityDirectory.summary.userCount
    },
    {
      description: locale === "zh" ? "注册后的 Project Key 创建事件未接入，无法判断开发者激活。" : "Project Key creation event is not connected, so developer activation cannot be judged.",
      href: adminViewHref("analytics", locale),
      Icon: ShieldCheck,
      id: "project_key",
      displayValue: pendingDataLabel,
      impact: locale === "zh" ? "阻塞注册到激活的转化分析。" : "Blocks signup-to-activation analysis.",
      label: "Project Key",
      lastUpdated: null,
      nextAction: "project_key_create_success / failed",
      severity: "critical",
      source: locale === "zh" ? "事件待接入" : "Event pending",
      status: projectKeyEventStatus,
      tone: "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "阻塞激活漏斗" : "Blocks activation funnel" },
      value: null
    },
    {
      description: locale === "zh" ? "技能市场浏览事件未接入，无法判断浏览到安装的转化。" : "Marketplace browse events are not connected, so view-to-install conversion cannot be judged.",
      displayValue: pendingDataLabel,
      href: adminViewHref("funnel", locale),
      Icon: BarChart3,
      id: "skill_views",
      impact: locale === "zh" ? "阻塞市场转化分析。" : "Blocks marketplace conversion analysis.",
      label: locale === "zh" ? "技能浏览" : "Skill views",
      lastUpdated: null,
      nextAction: "skill_market_view / skill_detail_view",
      severity: "critical",
      source: locale === "zh" ? "Analytics 待接入" : "Analytics pending",
      status: skillViewEventStatus,
      tone: "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "阻塞市场漏斗" : "Blocks marketplace funnel" },
      value: null
    },
    {
      description: locale === "zh" ? "运行时安装事件未确认，不能把 0 当作真实无安装。" : "Runtime install event is not confirmed, so zero cannot be treated as true zero.",
      displayValue: pendingDataLabel,
      href: adminViewHref("funnel", locale),
      Icon: ShieldCheck,
      id: "skill_installs",
      impact: locale === "zh" ? "无法判断市场到真实使用的转化。" : "Cannot judge marketplace-to-usage conversion.",
      label: locale === "zh" ? "技能安装" : "Installs",
      lastUpdated: null,
      nextAction: "install_click / install_success / install_failed",
      severity: "critical",
      source: locale === "zh" ? "运行时事件待接入" : "Runtime event pending",
      status: skillInstallEventStatus,
      tone: "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "不能当作真实 0" : "Not a true zero" },
      value: null
    },
    {
      description: locale === "zh" ? "支付通道或回调未完成配置，GMV 和订单不可作为经营结果。" : "Payment provider or callback is not complete, so orders and GMV are not reliable.",
      displayValue: notReliableLabel,
      href: adminViewHref("orders", locale),
      Icon: Banknote,
      id: "orders_gmv",
      impact: locale === "zh" ? "影响订单、GMV、退款和分账。" : "Affects orders, GMV, refunds, and splits.",
      label: locale === "zh" ? "订单 / GMV" : "Orders / GMV",
      lastUpdated: null,
      nextAction: locale === "zh" ? "接入 Stripe / Alipay 与支付回调" : "Connect Stripe / Alipay and payment callbacks",
      severity: "critical",
      source: locale === "zh" ? "支付链路 Prelaunch" : "Payment flow prelaunch",
      status: paymentWebhookStatus,
      tone: "warning",
      trend: { direction: "unknown", label: locale === "zh" ? "金额不参与经营判断" : "Amount excluded from business judgment" },
      value: null
    },
    {
      description: locale === "zh" ? "待审核技能、证据、权限和定价：高 / 中 / 就绪。" : "Pending skill review, evidence, permissions, and pricing: high / medium / ready.",
      displayValue: formatCompactNumber(reviewMetrics.actionable),
      href: adminViewHref("reviews", locale),
      Icon: Gavel,
      id: "review_queue",
      impact: locale === "zh" ? "影响技能上架和供给质量。" : "Affects skill publishing and marketplace supply quality.",
      label: locale === "zh" ? "待审核" : "Reviews",
      lastUpdated: lastUpdatedLabel,
      nextAction: reviewMetrics.actionable > 0 ? (locale === "zh" ? "处理审核队列" : "Process review queue") : undefined,
      severity: reviewMetrics.danger > 0 ? "critical" : reviewMetrics.actionable > 0 ? "warning" : "healthy",
      source: locale === "zh" ? "审核队列" : "Review queue",
      status: reviewMetrics.actionable > 0 ? "connected_has_data" : "connected_no_data",
      tone: reviewMetrics.danger > 0 ? "danger" : reviewMetrics.actionable > 0 ? "warning" : "ready",
      trend: { direction: "unknown", label: `${formatCompactNumber(reviewMetrics.danger)} / ${formatCompactNumber(reviewMetrics.warning)} / ${formatCompactNumber(reviewMetrics.ready)}` },
      value: reviewMetrics.actionable
    },
    {
      description: locale === "zh" ? "作者提现、退款和争议的财务队列。" : "Publisher payout, refund, and dispute finance queue.",
      displayValue: formatCompactNumber(payoutActionCount + adjustmentActionCount),
      href: adminViewHref("payouts", locale),
      Icon: WalletCards,
      id: "payouts",
      impact: locale === "zh" ? "影响作者结算和财务闭环。" : "Affects publisher settlement and finance loop.",
      label: locale === "zh" ? "待提现/退款" : "Payouts/refunds",
      lastUpdated: lastUpdatedLabel,
      nextAction: payoutActionCount + adjustmentActionCount > 0 ? (locale === "zh" ? "进入财务审核" : "Open finance review") : undefined,
      severity: payoutActionCount + adjustmentActionCount > 0 ? "warning" : "healthy",
      source: locale === "zh" ? "财务队列" : "Finance queue",
      status: payoutActionCount + adjustmentActionCount > 0 ? "connected_has_data" : "connected_no_data",
      tone: payoutActionCount + adjustmentActionCount > 0 ? "warning" : "ready",
      trend: { direction: "unknown", label: locale === "zh" ? "人工审核" : "Manual review" },
      value: payoutActionCount + adjustmentActionCount
    },
    {
      description: locale === "zh" ? "活跃事故、信任举报和高频异常访问。" : "Active incidents, trust reports, and abnormal access.",
      displayValue: formatCompactNumber(activeIncidentCount + openAbuseReportCount + accessLogAnalytics.suspiciousIpCount),
      href: adminViewHref("risk", locale),
      Icon: Siren,
      id: "risk_queue",
      impact: locale === "zh" ? "影响上线安全和异常响应。" : "Affects launch safety and abnormal-access response.",
      label: locale === "zh" ? "待处理风险" : "Risks",
      lastUpdated: lastUpdatedLabel,
      nextAction: activeIncidentCount + openAbuseReportCount + accessLogAnalytics.suspiciousIpCount > 0 ? (locale === "zh" ? "查看风险访问与举报" : "Inspect risk access and reports") : undefined,
      severity: activeIncidentCount + openAbuseReportCount > 0 ? "critical" : accessLogAnalytics.suspiciousIpCount > 0 ? "warning" : "healthy",
      source: locale === "zh" ? "风控 / 访问日志" : "Risk / access log",
      status: activeIncidentCount + openAbuseReportCount + accessLogAnalytics.suspiciousIpCount > 0 ? "connected_has_data" : "connected_no_data",
      tone: activeIncidentCount + openAbuseReportCount > 0 ? "danger" : accessLogAnalytics.suspiciousIpCount > 0 ? "warning" : "ready",
      trend: { direction: "unknown", label: locale === "zh" ? "不计入运营流量" : "Excluded from operational traffic" },
      value: activeIncidentCount + openAbuseReportCount + accessLogAnalytics.suspiciousIpCount
    }
  ];
  const adminSidebarGroups = locale === "zh"
    ? [
        {
          label: "总览",
          items: [
            { label: "总览", view: "overview", anchor: "#admin-overview" },
            { label: "数据分析", view: "analytics", anchor: "#admin-analytics" },
            { label: "流量来源", view: "traffic", anchor: "#admin-traffic" },
            { label: "AI 推荐", view: "ai-referrals", anchor: "#admin-ai-referrals" },
            { label: "转化漏斗", view: "funnel", anchor: "#admin-funnel" }
          ]
        },
        {
          label: "运营",
          items: [
            { label: "技能审核", view: "reviews", anchor: "#admin-reviews" },
            { label: "作者管理", view: "curation", anchor: "#admin-curation" },
            { label: "用户角色", view: "identity", anchor: "#admin-identity" },
            { label: "通知", view: "deliveries", anchor: "#admin-deliveries" }
          ]
        },
        {
          label: "资金与风控",
          items: [
            { label: "订单支付", view: "orders", anchor: "#admin-orders" },
            { label: "提现分账", view: "payouts", anchor: "#admin-payouts" },
            { label: "风控告警", view: "risk", anchor: "#admin-risk" },
            { label: "系统健康", view: "health", anchor: "#admin-system-health" },
            { label: "审计日志", view: "audit", anchor: "#admin-audit" },
            { label: "设置", view: "settings", anchor: "#admin-templates" }
          ]
        }
      ]
    : [
        {
          label: "Overview",
          items: [
            { label: "Overview", view: "overview", anchor: "#admin-overview" },
            { label: "Analytics", view: "analytics", anchor: "#admin-analytics" },
            { label: "Traffic sources", view: "traffic", anchor: "#admin-traffic" },
            { label: "AI referrals", view: "ai-referrals", anchor: "#admin-ai-referrals" },
            { label: "Conversion funnel", view: "funnel", anchor: "#admin-funnel" }
          ]
        },
        {
          label: "Operations",
          items: [
            { label: "Skill reviews", view: "reviews", anchor: "#admin-reviews" },
            { label: "Publisher ops", view: "curation", anchor: "#admin-curation" },
            { label: "Users and roles", view: "identity", anchor: "#admin-identity" },
            { label: "Notifications", view: "deliveries", anchor: "#admin-deliveries" }
          ]
        },
        {
          label: "Money and risk",
          items: [
            { label: "Orders and payments", view: "orders", anchor: "#admin-orders" },
            { label: "Payouts and splits", view: "payouts", anchor: "#admin-payouts" },
            { label: "Risk alerts", view: "risk", anchor: "#admin-risk" },
            { label: "System health", view: "health", anchor: "#admin-system-health" },
            { label: "Audit log", view: "audit", anchor: "#admin-audit" },
            { label: "Settings", view: "settings", anchor: "#admin-templates" }
          ]
        }
      ];
  const workQueueRows: OpsTaskQueueItem[] = [
    {
      actionLabel: locale === "zh" ? "去审核技能" : "Review skills",
      category: locale === "zh" ? "技能审核" : "Reviews",
      count: reviewMetrics.actionable,
      href: adminViewHref("reviews", locale),
      highPriorityCount: reviewMetrics.danger,
      id: "skill_reviews",
      label: locale === "zh" ? "技能待审核" : "Skill reviews",
      overdueCount: reviewMetrics.danger,
      owner: locale === "zh" ? "内容运营组" : "Content ops",
      priority: reviewMetrics.danger > 0 ? "high" : reviewMetrics.actionable > 0 ? "medium" : "low",
      slaLabel: locale === "zh" ? "24 小时" : "24h"
    },
    {
      count: orderActionCount,
      actionLabel: locale === "zh" ? "查订单" : "Open orders",
      category: locale === "zh" ? "订单支付" : "Orders",
      href: adminViewHref("orders", locale),
      highPriorityCount: orderActionCount,
      id: "payment_orders",
      label: locale === "zh" ? "支付失败订单" : "Payment failures",
      overdueCount: 0,
      owner: locale === "zh" ? "财务 / 平台" : "Finance / Platform",
      priority: orderActionCount > 0 ? "high" : "low",
      slaLabel: locale === "zh" ? "15 分钟" : "15m"
    },
    {
      count: adjustmentActionCount,
      actionLabel: locale === "zh" ? "处理" : "Resolve",
      category: locale === "zh" ? "退款争议" : "Refunds",
      href: adminViewHref("risk", locale),
      highPriorityCount: adjustmentActionCount,
      id: "refund_dispute",
      label: locale === "zh" ? "退款 / 争议" : "Refunds / disputes",
      overdueCount: 0,
      owner: locale === "zh" ? "财务" : "Finance",
      priority: adjustmentActionCount > 0 ? "high" : "low",
      slaLabel: locale === "zh" ? "1 个工作日" : "1 business day"
    },
    {
      count: payoutActionCount,
      actionLabel: locale === "zh" ? "审核提现" : "Review payout",
      category: locale === "zh" ? "提现分账" : "Payouts",
      href: adminViewHref("payouts", locale),
      highPriorityCount: payoutActionCount,
      id: "publisher_payout",
      label: locale === "zh" ? "作者提现审核" : "Publisher payouts",
      overdueCount: 0,
      owner: locale === "zh" ? "财务" : "Finance",
      priority: payoutActionCount > 0 ? "medium" : "low",
      slaLabel: locale === "zh" ? "1 个工作日" : "1 business day"
    },
    {
      actionLabel: locale === "zh" ? "看风险" : "Inspect risk",
      category: locale === "zh" ? "风控告警" : "Risk",
      count: activeIncidentCount + openAbuseReportCount + accessLogAnalytics.suspiciousIpCount,
      href: adminViewHref("risk", locale),
      highPriorityCount: activeIncidentCount + openAbuseReportCount,
      id: "risk_access",
      label: locale === "zh" ? "异常 IP / 举报" : "Abnormal IP / reports",
      overdueCount: activeIncidentCount,
      owner: locale === "zh" ? "信任安全" : "Trust",
      priority: activeIncidentCount + openAbuseReportCount > 0 ? "high" : accessLogAnalytics.suspiciousIpCount > 0 ? "medium" : "low",
      slaLabel: locale === "zh" ? "30 分钟" : "30m"
    },
    {
      count: webhookActionCount,
      actionLabel: locale === "zh" ? "重试失败 Webhook" : "Retry webhook",
      category: "Webhook",
      href: adminViewHref("deliveries", locale),
      highPriorityCount: webhookActionCount,
      id: "webhook_failures",
      label: locale === "zh" ? "Webhook 失败" : "Webhook failures",
      overdueCount: 0,
      owner: locale === "zh" ? "平台后端" : "Platform",
      priority: webhookActionCount > 0 ? "medium" : "low",
      slaLabel: locale === "zh" ? "15 分钟" : "15m"
    }
  ];
  const visibleWorkQueueRows = workQueueRows
    .filter((item) => item.count > 0)
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.priority] - rank[b.priority] || b.count - a.count;
    });
  const sourceChannels = accessLogAnalytics.channels.map((channel) => [
    channel.label,
    accessLogAnalytics.connected ? `${formatCompactNumber(channel.count)} / ${channel.share}%` : pendingDataLabel,
    channel.share,
    channel.label === "GitHub" ? "green" : channel.label === "Direct" ? "neutral" : "cyan"
  ] as const);
  const aiReferralChannels = accessLogAnalytics.aiReferrals.map((channel) => [
    channel.label,
    accessLogAnalytics.connected ? `${formatCompactNumber(channel.count)} / ${channel.share}%` : pendingDataLabel,
    channel.share
  ] as const);
  const aiBotChannels = accessLogAnalytics.aiBots.map((channel) => [
    channel.label,
    accessLogAnalytics.connected ? `${formatCompactNumber(channel.count)} / ${channel.share}%` : pendingDataLabel,
    channel.share
  ] as const);
  const directChannel = accessLogAnalytics.channels.find((channel) => channel.label === "Direct");
  const directWarning = accessLogAnalytics.connected && (directChannel?.share ?? 0) > 70;
  const funnelRawSteps: Array<Pick<FunnelStep, "confidence" | "href" | "id" | "label" | "nextAction" | "order" | "source" | "status" | "unit" | "value">> = [
    {
      confidence: accessLogAnalytics.connected ? "medium" : "none",
      href: adminViewHref("traffic", locale),
      id: "visit",
      label: locale === "zh" ? "访问网站" : "Visit site",
      order: 1,
      source: accessLogAnalytics.connected ? accessLogSourceLabel : (locale === "zh" ? "入口待接入" : "Source pending"),
      status: accessLogStatus,
      unit: "sessions",
      value: accessLogAnalytics.connected ? accessLogAnalytics.todayPageViews : null
    },
    {
      confidence: identityDirectory.summary.userCount > 0 ? "low" : "none",
      href: adminViewHref("identity", locale),
      id: "identity",
      label: locale === "zh" ? "注册/登录" : "Sign in",
      nextAction: locale === "zh" ? "接入今日注册/登录事件" : "Connect daily signup/sign-in events",
      order: 2,
      source: locale === "zh" ? "身份目录 · 累计口径" : "Identity · cumulative",
      status: identityDirectory.summary.userCount > 0 ? "partial" : "connected_no_data",
      unit: "users",
      value: identityDirectory.summary.userCount
    },
    {
      confidence: "none",
      href: adminViewHref("analytics", locale),
      id: "project_key",
      label: "Project Key",
      nextAction: "project_key_create_success / failed",
      order: 3,
      source: locale === "zh" ? "事件待接入" : "Event pending",
      status: projectKeyEventStatus,
      unit: "events",
      value: null
    },
    {
      confidence: "none",
      href: adminViewHref("funnel", locale),
      id: "skill_view",
      label: locale === "zh" ? "浏览技能" : "Browse skills",
      nextAction: "skill_market_view / skill_detail_view",
      order: 4,
      source: locale === "zh" ? "Analytics 待接入" : "Analytics pending",
      status: skillViewEventStatus,
      unit: "events",
      value: null
    },
    {
      confidence: "none",
      href: adminViewHref("funnel", locale),
      id: "skill_install",
      label: locale === "zh" ? "安装技能" : "Install skill",
      nextAction: "install_click / install_success / install_failed",
      order: 5,
      source: locale === "zh" ? "运行时事件待接入" : "Runtime event pending",
      status: skillInstallEventStatus,
      unit: "events",
      value: null
    },
    {
      confidence: "none",
      href: adminViewHref("analytics", locale),
      id: "skill_invoke",
      label: locale === "zh" ? "调用技能" : "Invoke skill",
      nextAction: "api_call_attempt / api_call_success / api_call_failed",
      order: 6,
      source: locale === "zh" ? "运行时/账本事件待确认" : "Runtime / ledger event pending",
      status: skillInvokeEventStatus,
      unit: "events",
      value: null
    },
    {
      confidence: "none",
      href: adminViewHref("orders", locale),
      id: "order",
      label: locale === "zh" ? "下单" : "Order",
      nextAction: locale === "zh" ? "接入支付通道和回调" : "Connect payment provider and callback",
      order: 7,
      source: locale === "zh" ? "支付链路 Prelaunch" : "Payment flow prelaunch",
      status: paymentWebhookStatus,
      unit: "orders",
      value: null
    }
  ];
  const conversionFunnel: FunnelStep[] = funnelRawSteps.map((step, index) => {
    const previousValue = funnelRawSteps[index - 1]?.value ?? null;
    const startValue = funnelRawSteps[0]?.value ?? null;

    return {
      ...step,
      conversionFromPrevious: index === 0 ? null : calculateStepConversion(step.value, previousValue),
      conversionFromStart: index === 0 ? null : calculateStepConversion(step.value, startValue),
      dropoffFromPrevious: index === 0 ? null : calculateDropoff(step.value, previousValue)
    };
  });
  const financeSummaryCards = [
    ["GMV", paymentMode === "production" ? formatMoney(financeLedger.summary.grossCents) : notReliableLabel, locale === "zh" ? "支付回调未连接" : "Payment callback pending"],
    [locale === "zh" ? "平台佣金" : "Platform fee", paymentMode === "production" ? formatMoney(financeLedger.summary.platformFeeCents) : notReliableLabel, locale === "zh" ? "佣金口径待支付闭环" : "Commission needs payment loop"],
    [locale === "zh" ? "作者分成" : "Publisher share", paymentMode === "production" ? formatMoney(financeLedger.summary.publisherShareCents) : notReliableLabel, locale === "zh" ? "待支付和分账接入" : "Payment and split pending"],
    [locale === "zh" ? "退款/争议" : "Refunds/disputes", formatCompactNumber(adjustmentActionCount), locale === "zh" ? "人工处理" : "Manual review"],
    [locale === "zh" ? "可结算" : "Available", formatMoney(financeLedger.summary.availableBalanceCents), locale === "zh" ? "账本余额" : "Ledger balance"],
    [locale === "zh" ? "待提现" : "Payout queue", formatCompactNumber(payoutActionCount), locale === "zh" ? "作者申请" : "Publisher requests"]
  ] as const;
  const systemHealthStrip = [
    ["API", adminV2Labels.apiHealthy, "green"],
    ["DB", adminV2Labels.apiHealthy, "green"],
    ["Webhook", adminConsoleLabels.payment.items[2][1], webhookActionCount > 0 ? "red" : "amber"],
    ["Email", deliveryActionCount > 0 ? (locale === "zh" ? "待处理" : "Pending") : adminV2Labels.apiHealthy, deliveryActionCount > 0 ? "amber" : "green"],
    ["Analytics", trafficSourceState, trafficSourceTone],
    [locale === "zh" ? "支付回调" : "Payment callback", adminConsoleLabels.payment.items[2][1], "amber"]
  ] as const;
  const chartHasTrustedSignal = paymentMode === "production" && financeLedger.recentTransactions.length > 0;
  const trafficRows = [
    {
      label: "PV",
      value: todayPageViewValue,
      width: cloudflareAnalytics.connected || accessLogAnalytics.connected ? 100 : 0
    },
    {
      label: locale === "zh" ? "Cloudflare 请求" : "Cloudflare requests",
      value: cloudflareRequestValue,
      width: cloudflareAnalytics.connected ? 100 : 0
    },
    {
      label: "UV",
      value: todayUvValue,
      width: cloudflareAnalytics.totals.requests > 0
        ? Math.round((cloudflareAnalytics.totals.visits / cloudflareAnalytics.totals.requests) * 100)
        : accessLogAnalytics.todayPageViews > 0
          ? Math.round((accessLogAnalytics.todayUv / accessLogAnalytics.todayPageViews) * 100)
          : 0
    },
    {
      label: locale === "zh" ? "独立 IP" : "Unique IP",
      value: uniqueIpValue,
      width: accessLogAnalytics.todayPageViews > 0 ? Math.round((accessLogAnalytics.todayUniqueIps / accessLogAnalytics.todayPageViews) * 100) : 0
    },
    ...accessLogAnalytics.channels.slice(0, 2).map((channel) => ({
      label: channel.label,
      value: accessLogAnalytics.connected ? `${formatCompactNumber(channel.count)} / ${channel.share}%` : pendingDataLabel,
      width: channel.share
    })),
    {
      label: locale === "zh" ? "热门路径" : "Top path",
      value: accessLogAnalytics.connected ? accessLogAnalytics.topPath : pendingDataLabel,
      width: accessLogAnalytics.paths[0]?.share ?? 0
    },
    {
      label: locale === "zh" ? "Top 国家/地区" : "Top country/region",
      value: topCountryLabel,
      width: topCountry?.share ?? 0
    }
  ];
  const trafficDataSources = [
    [
      locale === "zh" ? "Cloudflare Zone ID" : "Cloudflare Zone ID",
      process.env.CLOUDFLARE_ZONE_ID?.trim() ? (locale === "zh" ? "已配置" : "Configured") : (locale === "zh" ? "未配置" : "Not configured")
    ],
    [
      locale === "zh" ? "Cloudflare API Token" : "Cloudflare API Token",
      process.env.CLOUDFLARE_API_TOKEN?.trim() ? (locale === "zh" ? "已配置" : "Configured") : (locale === "zh" ? "未配置" : "Not configured")
    ],
    [
      "Cloudflare Analytics",
      cloudflareAnalytics.connected
        ? countryRows.length > 0
          ? (locale === "zh" ? "GraphQL 成功，有地区数据" : "GraphQL connected with country data")
          : (locale === "zh" ? "GraphQL 成功，今日暂无地区数据" : "GraphQL connected, no country data today")
        : cloudflareAnalytics.message
    ],
    [
      "1Panel access.log",
      accessLogAnalytics.connected
        ? (locale === "zh" ? "已挂载" : "Connected")
        : (locale === "zh" ? "需要挂载" : "Mount required")
    ],
    [
      locale === "zh" ? "读取文件" : "Parsed files",
      accessLogAnalytics.connected ? formatCompactNumber(accessLogAnalytics.files.length) : "0"
    ],
    [
      locale === "zh" ? "Top Referrer" : "Top referrer",
      accessLogAnalytics.connected ? accessLogAnalytics.topReferrer : pendingDataLabel
    ],
    [
      locale === "zh" ? "Top Path" : "Top path",
      accessLogAnalytics.connected ? accessLogAnalytics.topPath : pendingDataLabel
    ]
  ] as const;
  const workbenchCounts = [
    launchReadiness.summary.blocker,
    reviewMetrics.actionable,
    identityDirectory.summary.userCount,
    deliveryActionCount,
    activeIncidentCount + openAbuseReportCount + pendingFeedbackCount + adjustmentActionCount,
    financeLedger.recentTransactions.length + payoutActionCount
  ];
  const workbenchTones: AdminKpiTone[] = [
    launchReadiness.summary.blocker > 0 ? "danger" : launchReadiness.summary.warning > 0 ? "warning" : "ready",
    reviewMetrics.danger > 0 ? "danger" : reviewMetrics.actionable > 0 ? "warning" : "ready",
    identityDirectory.summary.adminUserCount > 0 ? "ready" : "warning",
    deliveryActionCount > 0 ? "warning" : "ready",
    activeIncidentCount + openAbuseReportCount > 0 ? "danger" : pendingFeedbackCount + adjustmentActionCount > 0 ? "warning" : "ready",
    payoutActionCount + orderActionCount > 0 ? "warning" : "ready"
  ];
  const workbenchCards = adminV2Labels.workbench.cards.map(([title, detail, statLabel], index) => ({
    detail,
    href: localizedHref(`/admin${adminWorkbenchAnchors[index]}`, locale),
    Icon: adminWorkbenchIcons[index],
    statLabel,
    title,
    tone: workbenchTones[index] ?? "neutral",
    value: formatCompactNumber(workbenchCounts[index] ?? 0)
  }));
  const workbenchGroupLabels =
    locale === "zh"
      ? {
          action: "展开 / 收起",
          audit: "含审核证据、操作审计和权限留痕",
          curation: "含身份目录、作者准入和市场分发",
          delivery: "含邮件、Webhook、模板和失败重试",
          finance: "含订单、退款、提现、佣金和账本",
          launch: "含上线阻断、提醒项和发布门禁",
          risk: "含举报、事故、反馈、退款和争议",
          title: "运营详情按岗位收起，避免整页堆叠"
        }
      : {
          action: "Expand / collapse",
          audit: "Includes review evidence, audit trail, and permission traces",
          curation: "Includes identity directory, publisher access, and marketplace curation",
          delivery: "Includes email, webhook, templates, and retry queues",
          finance: "Includes orders, refunds, payouts, commission, and ledger",
          launch: "Includes launch blockers, warnings, and release gates",
          risk: "Includes abuse, incidents, feedback, refunds, and disputes",
          title: "Operational details are grouped by role instead of stacked"
        };
  const defaultWorkbenchGroup = primaryPriorityItem.href.includes("#admin-finance") ||
    primaryPriorityItem.href.includes("#admin-payouts") ||
    primaryPriorityItem.href.includes("#admin-ledger")
    ? "finance"
    : primaryPriorityItem.href.includes("#admin-risk") || primaryPriorityItem.href.includes("#admin-adjustments")
      ? "risk"
      : primaryPriorityItem.href.includes("#admin-deliveries") || primaryPriorityItem.href.includes("#admin-webhooks")
        ? "delivery"
        : primaryPriorityItem.href.includes("#admin-identity") || primaryPriorityItem.href.includes("#admin-curation")
          ? "identity"
          : primaryPriorityItem.href.includes("#admin-reviews") || primaryPriorityItem.href.includes("#admin-audit")
            ? "review"
            : "launch";
  const workbenchGroupStatusClass = (tone: AdminKpiTone) =>
    tone === "danger" ? "admin-state-pill--red" : tone === "warning" ? "admin-state-pill--amber" : "admin-state-pill--green";

  return (
    <main className="admin-console-app" aria-label={locale === "zh" ? "SkillHub 管理员后台" : "SkillHub admin console"}>
      <div className="admin-console-page">
        <AdminConsoleBackdrop />

        <section className="admin-console-shell admin-console-shell--v2" id="admin-overview" aria-labelledby="admin-console-title">
        <aside className="admin-sidebar" aria-label={locale === "zh" ? "管理员后台导航" : "Admin console navigation"}>
          <div className="admin-sidebar__brand">
            <span aria-hidden="true">SH</span>
            <div>
              <strong>{adminConsoleLabels.shell.eyebrow}</strong>
              <small>{adminConsoleLabels.shell.subtitle}</small>
            </div>
          </div>

          <div className="admin-sidebar__env-card">
            <div>
              <span>{adminConsoleLabels.shell.environment}</span>
              <strong>{launchReadiness.environment.runtime}</strong>
            </div>
            <b>{adminV2Labels.live}</b>
            <div>
              <span>API</span>
              <strong>{adminV2Labels.apiHealthy}</strong>
            </div>
            <div>
              <span>{adminV2Labels.paymentOpen}</span>
              <strong>{adminV2Labels.checkoutPrelaunch}</strong>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {adminSidebarGroups.map((group) => (
              <div className="admin-sidebar-nav__group" key={group.label}>
                <span>{group.label}</span>
                {group.items.map((item) => {
                  const Icon = getAdminNavIcon(item.anchor);

                  return (
                    <a
                      className={item.view === adminView ? "is-active" : undefined}
                      href={adminViewHref(item.view as AdminConsoleView, locale)}
                      key={item.anchor}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar__actions">
            <a className="btn-secondary" href={localizedHref("/", locale)}>{adminV2Labels.publicSite}</a>
            <form action={signOutAction.bind(null, locale)}>
              <button className="btn-secondary btn-secondary--danger" type="submit">
                <LogOut size={15} aria-hidden="true" />
                <span>{adminV2Labels.signOut}</span>
              </button>
            </form>
          </div>
        </aside>

        <div className={`admin-console-main admin-console-main--${adminView}`}>
          <header className="admin-operator-topbar admin-operator-topbar--v3" aria-label={locale === "zh" ? "管理员工具栏" : "Admin toolbar"}>
            <h1 id="admin-console-title" className="visually-hidden">SkillHub Admin Ops Console</h1>
            <div className="admin-global-search admin-global-search--status" aria-label={adminConsoleLabels.shell.searchPreview}>
              <Search size={16} aria-hidden="true" />
              <span>{adminConsoleLabels.shell.searchPlaceholder}</span>
              <em>{adminV2Labels.keyboardHint}</em>
            </div>
            <div className="admin-time-range admin-time-range--top" aria-label={locale === "zh" ? "数据时间范围" : "Data time range"}>
              {(locale === "zh" ? ["今天", "昨天", "近7天", "近15天", "近30天", "自定义"] : ["Today", "Yesterday", "7d", "15d", "30d", "Custom"]).map((range, index) => (
                <span className={index === 0 ? "is-active" : undefined} key={range}>
                  {range}
                </span>
              ))}
            </div>
            <div className="admin-ops-data-meta" aria-label={locale === "zh" ? "数据更新时间" : "Data freshness"}>
              {locale === "zh"
                ? `今天 · UTC+8 · 最近更新 ${lastUpdatedLabel} · 访问日志延迟约 2 分钟`
                : `Today · UTC+8 · Updated ${lastUpdatedLabel} · access logs delayed about 2 min`}
            </div>
            <div className="admin-top-actions">
              <a className="admin-toolbar-button" href={localizedHref("/admin", alternateLocale)}>{adminV2Labels.language}</a>
              <a className="admin-toolbar-button" href={adminViewHref("deliveries", locale)}>
                {adminV2Labels.notifications}
                <span>{formatCompactNumber(deliveryActionCount)}</span>
              </a>
              <div className="admin-avatar" aria-label={operatorName}>{operatorInitials}</div>
              <form action={signOutAction.bind(null, locale)}>
                <button className="admin-toolbar-button admin-toolbar-button--danger" type="submit">
                  <LogOut size={15} aria-hidden="true" />
                  <span>{adminV2Labels.signOut}</span>
                </button>
              </form>
            </div>
          </header>

          <header className="admin-console-topbar admin-console-topbar--legacy">
            <div>
              <div className="eyebrow">
                <Activity size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.shell.subtitle}</span>
              </div>
              <h1>{adminConsoleLabels.shell.title}</h1>
              <p>{labels.description}</p>
            </div>

            <div className="admin-console-tools">
              <div className="admin-time-range" aria-label={locale === "zh" ? "数据时间范围" : "Data time range"}>
                {adminConsoleLabels.shell.timeRanges.map((range, index) => (
                  <span className={index === 0 ? "is-active" : undefined} key={range}>
                    {range}
                  </span>
                ))}
              </div>
              <div className="admin-search-preview" aria-label={adminConsoleLabels.shell.searchPlaceholder}>
                <Search size={16} aria-hidden="true" />
                <div>
                  <strong>{adminConsoleLabels.shell.searchPreview}</strong>
                  <span>{adminConsoleLabels.shell.searchPlaceholder}</span>
                </div>
              </div>
              <a className="btn-primary" href={primaryPriorityItem.href}>
                <span>{adminConsoleLabels.shell.primaryAction}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </header>

          <section className="admin-ops-status-grid" aria-label={locale === "zh" ? "经营状态和上线准备度" : "Business status and launch readiness"}>
            <article className={`admin-business-health admin-business-health--${businessHealth.status}`}>
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "今日经营状态" : "Business status"}</span>
              </div>
              <h2>{businessHealth.title}</h2>
              <p>{businessHealth.summary}</p>
              <div className="admin-business-health__lists">
                <div>
                  <strong>{locale === "zh" ? "阻塞项" : "Blockers"}</strong>
                  {businessHealth.blockers.length > 0 ? businessHealth.blockers.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  )) : <span>{locale === "zh" ? "暂无阻塞项" : "No blocker visible"}</span>}
                </div>
                <div>
                  <strong>{locale === "zh" ? "影响范围" : "Impact"}</strong>
                  {businessHealth.impacts.slice(0, 4).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="admin-business-health__actions">
                <a className="btn-primary" href={adminViewHref("health", locale, "launch-readiness")}>
                  {locale === "zh" ? "查看接入清单" : "View integration checklist"}
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a className="btn-secondary" href={adminViewHref("traffic", locale)}>
                  {locale === "zh" ? "查看流量口径" : "Review traffic scope"}
                </a>
              </div>
            </article>

            <article className="admin-readiness-card admin-readiness-card--ops">
              <div className="admin-readiness-card__score">
                <span>{locale === "zh" ? "上线准备度" : "Launch readiness"}</span>
                <strong>{readinessScore}<small>/100</small></strong>
                <b className="admin-state-pill admin-state-pill--amber">{readinessRecommendation}</b>
              </div>
              <div className="admin-readiness-card__summary">
                <span>
                  <strong>{readinessBlockingChecks.length}</strong>
                  {locale === "zh" ? "阻塞项" : " blockers"}
                </span>
                <span>
                  <strong>{readinessWarningChecks.length}</strong>
                  {locale === "zh" ? "风险项" : " warnings"}
                </span>
                <span>
                  <strong>{readinessChecks.filter((check) => check.status === "pass").length}</strong>
                  {locale === "zh" ? "已通过" : " passed"}
                </span>
              </div>
              <div className="admin-readiness-card__checks">
                {readinessChecks.slice(0, 5).map((check) => (
                  <a className={`admin-readiness-check admin-readiness-check--${check.status}`} href={check.href} key={check.id}>
                    <span>{check.label}</span>
                    <strong>{check.status === "pass" ? (locale === "zh" ? "通过" : "Pass") : check.status === "warning" ? (locale === "zh" ? "预警" : "Warning") : (locale === "zh" ? "未配置" : "Not configured")}</strong>
                    <small>{check.impact}</small>
                  </a>
                ))}
              </div>
            </article>
          </section>

          <div className="admin-kpi-grid admin-kpi-grid--v2 admin-kpi-grid--ops" aria-label={locale === "zh" ? "后台关键指标" : "Admin key metrics"}>
            {overviewKpis.map((metric) => {
              const Icon = metric.Icon;
              const statusTone = getDataStatusTone(metric.status);

              return (
                <a className={`admin-kpi-card admin-kpi-card--${metric.tone}`} href={metric.href} key={metric.id}>
                  <span className="admin-kpi-card__top">
                    <span>{metric.label}</span>
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <strong>{metric.displayValue}</strong>
                  <small>{metric.description}</small>
                  <span className="admin-kpi-card__meta">
                    <b className={`admin-state-pill admin-state-pill--${statusTone}`}>{getDataStatusLabel(metric.status, locale)}</b>
                    <em>{metric.source}</em>
                  </span>
                  <span className="admin-kpi-card__foot">
                    <em>{metric.trend?.label}</em>
                    {isMetricActionable(metric) && metric.nextAction ? <b>{metric.nextAction}</b> : null}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="admin-dashboard-grid admin-dashboard-grid--v2">
            <article className="admin-analytics-panel admin-analytics-panel--v2 admin-analytics-panel--ops" id="admin-analytics" aria-labelledby="admin-analytics-v2-title">
              <div className="admin-panel-head">
                <div>
                  <div className="eyebrow">
                    <BarChart3 size={16} aria-hidden="true" />
                    <span>{adminConsoleLabels.analytics.title}</span>
                  </div>
                  <h2 id="admin-analytics-v2-title">{adminConsoleLabels.analytics.title}</h2>
                  <p>{adminV2Labels.analytics.subtitle}</p>
                </div>
                <div className="admin-status-strip">
                  {adminV2Labels.analytics.filters.map((filter, index) => (
                    <span className={index === 0 ? "is-active" : undefined} key={filter}>{filter}</span>
                  ))}
                </div>
              </div>

              <div className="admin-analytics-workspace">
                <div
                  className="admin-ops-chart"
                  role="img"
                  aria-label={
                    locale === "zh"
                      ? "运营趋势预览，展示账本、订单、安装调用和事件检查点"
                      : "Operational trend preview showing ledger, orders, installs, calls, and event checkpoints"
                  }
                >
                  <div className="admin-ops-chart__header">
                    <div>
                      <span>{locale === "zh" ? "7 日运营信号" : "7 day operational signal"}</span>
                      <strong>{locale === "zh" ? "账本、订单、安装调用" : "Ledger, orders, installs and calls"}</strong>
                    </div>
                    <b className="admin-state-pill admin-state-pill--amber">
                      {financeLedger.recentTransactions.length > 0
                        ? adminConsoleLabels.analytics.cards.usageOrders
                        : adminV2Labels.dataSourcePending}
                    </b>
                  </div>

                  <div className="admin-ops-chart__legend" aria-hidden="true">
                    <span className="admin-ops-chart__legend-item admin-ops-chart__legend-item--gmv">GMV</span>
                    <span className="admin-ops-chart__legend-item admin-ops-chart__legend-item--orders">
                      {locale === "zh" ? "订单" : "Orders"}
                    </span>
                    <span className="admin-ops-chart__legend-item admin-ops-chart__legend-item--calls">
                      {locale === "zh" ? "安装 / 调用" : "Installs / calls"}
                    </span>
                  </div>

                  {chartHasTrustedSignal ? (
                  <div className="admin-ops-chart__plot">
                    <div className="admin-ops-chart__axis admin-ops-chart__axis--y" aria-hidden="true">
                      {["100", "75", "50", "25", "0"].map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>
                    <svg viewBox="0 0 900 320" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="adminOpsArea" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#7fee64" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#7fee64" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path className="admin-ops-chart__area" d="M0,248 C70,228 118,204 178,202 C236,200 276,160 338,150 C408,138 456,168 520,142 C590,112 646,124 706,112 C774,98 828,110 900,74 L900,320 L0,320 Z" />
                      <path className="admin-ops-chart__line admin-ops-chart__line--gmv" d="M0,248 C70,228 118,204 178,202 C236,200 276,160 338,150 C408,138 456,168 520,142 C590,112 646,124 706,112 C774,98 828,110 900,74" />
                      <path className="admin-ops-chart__line admin-ops-chart__line--orders" d="M0,266 C86,244 154,236 220,214 C294,190 336,184 406,190 C496,198 544,164 628,152 C710,140 772,150 900,122" />
                      <path className="admin-ops-chart__line admin-ops-chart__line--calls" d="M0,286 C94,270 164,252 236,230 C304,210 366,196 446,188 C520,180 598,164 676,168 C760,172 824,150 900,132" />
                      <line className="admin-ops-chart__cursor" x1="704" x2="704" y1="46" y2="292" />
                      <circle className="admin-ops-chart__dot admin-ops-chart__dot--gmv" cx="704" cy="112" r="4" />
                      <circle className="admin-ops-chart__dot admin-ops-chart__dot--orders" cx="704" cy="145" r="4" />
                      <circle className="admin-ops-chart__dot admin-ops-chart__dot--calls" cx="704" cy="168" r="4" />
                    </svg>
                    <div className="admin-ops-chart__tooltip" aria-hidden="true">
                      <span>{locale === "zh" ? "最新检查点" : "Latest checkpoint"}</span>
                      <strong>{primaryPriorityItem.title}</strong>
                      <small>{primaryPriorityItem.metric}</small>
                    </div>
                    <div className="admin-ops-chart__axis admin-ops-chart__axis--x" aria-hidden="true">
                      {(locale === "zh" ? ["周一", "周二", "周三", "周四", "周五", "周六", "今天"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"]).map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>
                  </div>
                  ) : (
                    <div className="admin-ops-chart__empty">
                      <strong>{locale === "zh" ? "真实趋势数据待接入" : "Real trend data pending"}</strong>
                      <p>
                        {locale === "zh"
                          ? "接入 order_created、payment_succeeded、skill_install_success、skill_invoke_success 后，才展示 GMV、订单、安装和调用趋势。当前不画模拟曲线，不参与经营判断。"
                          : "Connect order_created, payment_succeeded, skill_install_success, and skill_invoke_success before plotting GMV, orders, installs, and invokes. No simulated trend is shown here."}
                      </p>
                      <div>
                        {["order_created", "payment_succeeded", "skill_install_success", "skill_invoke_success"].map((eventName) => (
                          <span key={eventName}>{eventName}</span>
                        ))}
                      </div>
                      <a className="btn-secondary" href={adminViewHref("health", locale, "launch-readiness")}>
                        {locale === "zh" ? "查看接入清单" : "View integration checklist"}
                      </a>
                    </div>
                  )}

                  <div className="admin-ops-chart__events" aria-label={locale === "zh" ? "运营事件轨道" : "Operational event track"}>
                    {[
                      [locale === "zh" ? "审核" : "Reviews", formatCompactNumber(reviewMetrics.actionable)],
                      [locale === "zh" ? "订单" : "Orders", formatCompactNumber(orderActionCount)],
                      [locale === "zh" ? "支付" : "Payments", formatCompactNumber(payoutActionCount + adjustmentActionCount)],
                      [locale === "zh" ? "风控" : "Risk", formatCompactNumber(activeIncidentCount + openAbuseReportCount)]
                    ].map(([label, value]) => (
                      <span key={label}>
                        <strong>{value}</strong>
                        <small>{label}</small>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="admin-insight-stack admin-insight-stack--ops">
                  {analyticsInsights.map(([label, value, detail]) => (
                    <div className="admin-insight-card" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <small>{detail}</small>
                    </div>
                  ))}
                  <div className="admin-insight-card admin-insight-card--source">
                    <span>{locale === "zh" ? "数据口径" : "Data scope"}</span>
                    <strong>{locale === "zh" ? "预发布可核验" : "Prelaunch, verifiable"}</strong>
                    <small>
                      {locale === "zh"
                        ? "未接入的 Stripe、Alipay、Analytics 只显示状态，不伪造生产数据。"
                        : "Stripe, Alipay, and analytics stay status-labeled until production data is connected."}
                    </small>
                  </div>
                </div>
              </div>
            </article>

            <aside className="admin-priority-panel admin-priority-panel--v2 admin-work-queue-panel" id="admin-priority" aria-labelledby="admin-priority-heading">
              <div className="eyebrow">
                <ListChecks size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "今日待办" : "Today work queue"}</span>
              </div>
              <h2 id="admin-priority-heading">{locale === "zh" ? "今天必须处理的运营事项" : "What operators should process today"}</h2>
              <p>{locale === "zh" ? "按审核、资金、风控和投递影响排序，所有入口都打开真实模块。" : "Sorted by review, money, risk, and delivery impact. Every action opens a real module."}</p>
              <div className="admin-work-queue-list" aria-label={locale === "zh" ? "今日待办队列" : "Today work queue"}>
                {visibleWorkQueueRows.length > 0 ? visibleWorkQueueRows.map((item) => (
                  <a className={`admin-work-queue-row admin-work-queue-row--${item.priority}`} href={item.href} key={item.id}>
                    <span className="admin-work-queue-row__priority">{item.priority === "high" ? (locale === "zh" ? "高" : "High") : item.priority === "medium" ? (locale === "zh" ? "中" : "Med") : (locale === "zh" ? "低" : "Low")}</span>
                    <span className="admin-work-queue-row__copy">
                      <strong>{item.label}</strong>
                      <small>{item.category} · SLA {item.slaLabel} · {item.owner}</small>
                    </span>
                    <b>{formatCompactNumber(item.count)}</b>
                    <em>
                      {item.actionLabel}
                      <ArrowRight size={13} aria-hidden="true" />
                    </em>
                  </a>
                )) : (
                  <div className="admin-work-queue-empty">
                    <strong>{locale === "zh" ? "今日暂无待处理事项" : "No work queue items today"}</strong>
                    <p>{locale === "zh" ? "审核、支付、提现、Webhook 与风控队列当前为空；上线阻塞项仍在准备度面板追踪。" : "Review, payment, payout, webhook, and risk queues are empty; launch blockers remain tracked in readiness."}</p>
                    <div>
                      <a href={adminViewHref("audit", locale)}>{locale === "zh" ? "查看历史异常" : "View history"}</a>
                      <a href={adminViewHref("health", locale)}>{locale === "zh" ? "配置告警规则" : "Configure alerts"}</a>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <section className="admin-funnel-card" id="admin-funnel" aria-labelledby="admin-funnel-title">
            <div className="admin-panel-head admin-panel-head--compact">
              <div>
                <div className="eyebrow">
                  <Activity size={16} aria-hidden="true" />
                  <span>{locale === "zh" ? "转化漏斗" : "Conversion funnel"}</span>
                </div>
                <h2 id="admin-funnel-title">{locale === "zh" ? "访问到下单的产品主链路" : "Main product path from visit to order"}</h2>
              </div>
              <b className="admin-state-pill admin-state-pill--amber">
                {locale === "zh" ? "部分事件待接入" : "Some events pending"}
              </b>
            </div>
            <div className="admin-funnel-steps">
              {conversionFunnel.map((step) => (
                <div className={`admin-funnel-step admin-funnel-step--${getDataStatusTone(step.status)}`} key={step.id}>
                  <span>{String(step.order).padStart(2, "0")}</span>
                  <strong>{step.label}</strong>
                  <b>{step.value == null ? (step.status === "not_connected" ? pendingDataLabel : notComputableLabel) : `${formatCompactNumber(step.value)}${step.order === 1 && locale === "zh" ? " 次访问记录" : ""}`}</b>
                  <small>{getDataStatusLabel(step.status, locale)} · {step.source}</small>
                  <em>
                    {step.order === 1
                      ? (locale === "zh" ? "入口基准" : "Entry baseline")
                      : `${locale === "zh" ? "上一步" : "Previous"} ${formatPercent(step.conversionFromPrevious, locale)} · ${locale === "zh" ? "流失" : "Dropoff"} ${step.dropoffFromPrevious == null ? notComputableLabel : formatCompactNumber(step.dropoffFromPrevious)}`}
                  </em>
                  {step.nextAction ? <a href={step.href}>{step.nextAction}</a> : null}
                </div>
              ))}
            </div>
          </section>

          <section className="admin-source-grid" aria-label={locale === "zh" ? "来源与财务分析" : "Source and finance analytics"}>
            <article className="admin-source-card" id="admin-traffic">
              <div className="eyebrow">
                <Activity size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "来源分析" : "Source analysis"}</span>
              </div>
              <h2>{locale === "zh" ? "普通来源" : "Standard channels"}</h2>
              <p>
                {accessLogAnalytics.connected
                  ? (locale === "zh" ? "来自 1Panel / Nginx access.log 的当天来源占比。" : "Same-day source share from 1Panel / Nginx access.log.")
                  : (locale === "zh" ? "Google、GitHub、Direct、Bing 等入口接入分析后显示真实占比。" : "Google, GitHub, Direct, and Bing share will appear after analytics is connected.")}
              </p>
              <div className="admin-channel-list">
                {sourceChannels.map(([label, value, width, tone]) => (
                  <div className={`admin-channel-row admin-channel-row--${tone}`} key={label}>
                    <span>{label}</span>
                    <i><b style={{ width: `${width}%` }} /></i>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              {directWarning ? (
                <div className="admin-channel-warning">
                  <strong>{locale === "zh" ? "Direct 占比过高" : "Direct share is high"}</strong>
                  <span>{locale === "zh" ? "可能是 UTM 未接入、Referrer 丢失、自有域名未排除，或后台/内网/Bot 流量混入。" : "Possible causes: missing UTM, lost referrers, owned domains not excluded, or admin/private/bot traffic mixed in."}</span>
                </div>
              ) : null}
            </article>

            <article className="admin-source-card admin-source-card--ai" id="admin-ai-referrals">
              <div className="eyebrow">
                <Search size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "AI 推荐来源" : "AI referral sources"}</span>
              </div>
              <h2>{locale === "zh" ? "AI 可见性与推荐访问" : "AI visibility and referrals"}</h2>
              <p>
                {accessLogAnalytics.connected
                  ? (locale === "zh" ? "AI Bot 抓取代表内容可能被读取；AI Referral 才代表真实用户从 AI 产品点击访问。" : "AI bot crawling means content may be read; AI referral means a real user clicked from an AI product.")
                  : (locale === "zh" ? "接入访问日志后，AI Bot 和 AI Referral 会分开统计。" : "AI bot and AI referral metrics appear separately after access logs are connected.")}
              </p>
              <div className="admin-ai-source-split">
                <div>
                  <strong>{locale === "zh" ? "AI Bot 抓取" : "AI bot crawling"}</strong>
                  <div className="admin-channel-list">
                    {aiBotChannels.map(([label, value, width]) => (
                      <div className="admin-channel-row admin-channel-row--ai-bot" key={label}>
                        <span>{label}</span>
                        <i><b style={{ width: `${width}%` }} /></i>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  {accessLogAnalytics.connected && aiBotChannels.every(([, , width]) => width === 0) ? (
                    <small>{locale === "zh" ? "未识别到 AI Bot 抓取，请确认访问日志包含 User-Agent。" : "No AI bot crawling detected. Confirm access logs include User-Agent."}</small>
                  ) : null}
                </div>
                <div>
                  <strong>{locale === "zh" ? "AI Referral 用户访问" : "AI referral visits"}</strong>
                  <div className="admin-channel-list">
                    {aiReferralChannels.map(([label, value, width]) => (
                      <div className="admin-channel-row admin-channel-row--ai" key={label}>
                        <span>{label}</span>
                        <i><b style={{ width: `${width}%` }} /></i>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  {accessLogAnalytics.connected && aiReferralChannels.every(([, , width]) => width === 0) ? (
                    <small>{locale === "zh" ? "未识别到 AI 推荐访问，也可能是 Referer、UTM 或识别规则尚未完整。" : "No AI referral visits detected; referrer, UTM, or detection rules may still be incomplete."}</small>
                  ) : null}
                </div>
              </div>
            </article>

            <article className="admin-source-card admin-source-card--money" id="admin-finance">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "支付与分账" : "Payments and splits"}</span>
              </div>
              <h2>{locale === "zh" ? "支付与分账" : "Payments and splits"}</h2>
              <p>{locale === "zh" ? "财务只展示已入账或明确待接入状态，避免误导运营判断。" : "Finance displays posted ledger data or explicit pending states only."}</p>
              <div className="admin-finance-mini-grid">
                {financeSummaryCards.map(([label, value, detail]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{detail}</small>
                  </div>
                ))}
              </div>
              <div className="admin-payment-status-row">
                {paymentCards.slice(0, 2).map(([title, , state, tone]) => (
                  <b className={`admin-state-pill admin-state-pill--${tone}`} key={title}>{title}: {state}</b>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-system-health-strip" id="admin-system-health" aria-label={locale === "zh" ? "系统健康" : "System health"}>
            {systemHealthStrip.map(([label, state, tone]) => (
              <span className={`admin-system-health-strip__item admin-system-health-strip__item--${tone}`} key={label}>
                <strong>{label}</strong>
                <small>{state}</small>
              </span>
            ))}
          </section>

          <div className="admin-dashboard-grid admin-dashboard-grid--legacy">
            <article className="admin-priority-panel" id="admin-priority-legacy" aria-labelledby="admin-priority-heading-legacy">
              <div className="eyebrow">
                <ListChecks size={16} aria-hidden="true" />
                <span>{adminCommandLabels.eyebrow}</span>
              </div>
              <h2 id="admin-priority-heading-legacy">{adminCommandLabels.title}</h2>
              <p>{adminCommandLabels.body}</p>

              <div className="admin-priority-list" aria-label={adminCommandLabels.queue.title}>
                {adminPriorityItems.map((item) => (
                  <a className={`publisher-priority-task publisher-priority-task--${item.tone}`} href={item.href} key={item.id}>
                    <span>
                      {adminCommandLabels.queueTones[item.tone]} / {item.metric}
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
            </article>

            <aside className="admin-spotlight">
              <article className="admin-spotlight-card">
                <div className="eyebrow">
                  <ShieldCheck size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.spotlight.readiness}</span>
                </div>
                <div className="admin-readiness-mini">
                  {[
                    ["blocker", launchReadiness.summary.blocker],
                    ["warning", launchReadiness.summary.warning],
                    ["deferred", launchReadiness.summary.deferred],
                    ["ready", launchReadiness.summary.ready]
                  ].map(([status, count]) => (
                    <a className={`admin-readiness-mini__item admin-readiness-mini__item--${status}`} href={adminViewHref("health", locale, "launch-readiness")} key={status}>
                      <span>{status}</span>
                      <strong>{formatCompactNumber(Number(count))}</strong>
                    </a>
                  ))}
                </div>
              </article>

              <article className="admin-spotlight-card">
                <div className="eyebrow">
                  <ReceiptText size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.spotlight.audit}</span>
                </div>
                <div className="admin-audit-mini">
                  {auditLogs.slice(0, 3).map((log) => (
                    <a href={adminViewHref("audit", locale, "admin-audit")} key={log.id}>
                      <strong>{log.action}</strong>
                      <span>{log.reason ?? log.entityType}</span>
                    </a>
                  ))}
                  {auditLogs.length === 0 ? <span>{locale === "zh" ? "暂无审计记录。" : "No audit records yet."}</span> : null}
                </div>
              </article>
            </aside>
          </div>

          <section className="admin-operations-grid" aria-label={locale === "zh" ? "订单与支付" : "Orders and payments"}>
            <article className="admin-order-panel admin-order-panel--v2" id="admin-orders">
              <div className="admin-panel-head">
                <div>
                  <div className="eyebrow">
                    <CreditCard size={16} aria-hidden="true" />
                    <span>{adminConsoleLabels.order.title}</span>
                  </div>
                  <h2>{adminV2Labels.orders.title}</h2>
                  <p>{adminConsoleLabels.order.description}</p>
                </div>
                <div className="admin-status-strip admin-status-strip--wrap">
                  {adminV2Labels.orders.tabs.map((tab, index) => (
                    <span className={index === 0 ? "is-active" : undefined} key={tab}>{tab}</span>
                  ))}
                </div>
              </div>
              <div className="admin-order-table">
                <div className="admin-order-table__row admin-order-table__row--head">
                  {adminV2Labels.orders.headers.map((header) => (
                    <span key={header}>{header}</span>
                  ))}
                </div>
                {recentOrderRows.map((transaction) => (
                  <a className="admin-order-table__row" href={adminViewHref("finance", locale, "admin-ledger")} key={transaction.id}>
                    <strong>{transaction.sourceReference ?? transaction.id}</strong>
                    <span>{transaction.skillName ?? transaction.skillSlug ?? "-"}</span>
                    <span>{transaction.sourceType ?? transaction.status}</span>
                    <span>{formatMoney(transaction.grossCents, transaction.currency)}</span>
                    <span><b className="admin-state-pill admin-state-pill--green">{transaction.balanceState ?? transaction.status}</b></span>
                    <span>{formatAdminOrderNext(transaction, locale)}</span>
                  </a>
                ))}
                {recentOrderRows.length === 0 ? <div className="admin-order-empty">{adminV2Labels.orders.noRows}</div> : null}
              </div>
            </article>

            <article className="admin-payment-panel admin-payment-panel--v2">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.payment.title}</span>
              </div>
              <h2>{adminConsoleLabels.payment.title}</h2>
              <p>{adminConsoleLabels.payment.description}</p>
              <div className="admin-payment-card-grid">
                {paymentCards.map(([title, detail, state, tone]) => (
                  <div className="admin-payment-card" key={title}>
                    <strong>{title}</strong>
                    <span>{detail}</span>
                    <b className={`admin-state-pill admin-state-pill--${tone}`}>{state}</b>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-traffic-workspace">
            <article className="admin-traffic-panel admin-traffic-panel--v2" id="admin-traffic-details" aria-labelledby="admin-traffic-title">
              <div className="admin-traffic-panel__head">
                <div>
                  <div className="eyebrow">
                    <Activity size={16} aria-hidden="true" />
                    <span>{adminConsoleLabels.traffic.title}</span>
                  </div>
                  <h2 id="admin-traffic-title">{adminV2Labels.traffic.title}</h2>
                  <p>
                    {accessLogAnalytics.connected
                      ? (locale === "zh"
                          ? "已接入 1Panel / Nginx 访问日志，展示当天 UV、PV、独立 IP、来源和热门路径。"
                          : "1Panel / Nginx access logs are connected for same-day UV, PV, unique IPs, referrers, and hot paths.")
                      : adminConsoleLabels.traffic.description}
                  </p>
                </div>
                <a className="btn-secondary" href={adminViewHref("settings", locale)}>{adminV2Labels.configureDataSource}</a>
              </div>

              <div className="admin-traffic-body">
                <div className="admin-traffic-bars">
                  {trafficRows.map((row) => (
                    <div className="admin-traffic-bar" key={row.label}>
                      <span>{row.label}</span>
                      <i><b style={{ width: `${Math.max(0, Math.min(row.width, 100))}%` }} /></i>
                      <strong>{row.value}</strong>
                    </div>
                  ))}
                </div>
                <div className="admin-risk-map" aria-hidden="true">
                  <i className="admin-risk-point admin-risk-point--one" />
                  <i className="admin-risk-point admin-risk-point--two" />
                  <i className="admin-risk-point admin-risk-point--three" />
                </div>
              </div>

              <div className="admin-traffic-detail-grid">
                <div className="admin-traffic-detail-card admin-traffic-detail-card--countries">
                  <strong>{locale === "zh" ? "国家 / 地区" : "Countries / regions"}</strong>
                  <p>
                    {cloudflareAnalytics.connected
                      ? (locale === "zh" ? "来自 Cloudflare Analytics 的今日请求分布。" : "Today request distribution from Cloudflare Analytics.")
                      : (locale === "zh" ? "配置 Cloudflare Token 后显示国家和地区。" : "Countries and regions appear after Cloudflare is configured.")}
                  </p>
                  <div className="admin-traffic-detail-list">
                    {countryRows.length > 0 ? countryRows.map((country) => (
                      <span key={country.code}>
                        <b>{country.label}</b>
                        <i><em style={{ width: `${Math.max(4, country.share)}%` }} /></i>
                        <strong>{formatCompactNumber(country.requests)} / {country.share}%</strong>
                      </span>
                    )) : (
                      <small>{cloudflareAnalytics.connected ? (locale === "zh" ? "今天暂无地区数据。" : "No country data today.") : cloudflareAnalytics.message}</small>
                    )}
                  </div>
                </div>

                <div className="admin-traffic-detail-card admin-traffic-detail-card--ips">
                  <strong>{locale === "zh" ? "最近访问 IP" : "Recent visitor IPs"}</strong>
                  <p>
                    {accessLogAnalytics.connected
                      ? (locale === "zh" ? "来自 1Panel / Nginx access.log，用于排查异常访问。" : "From 1Panel / Nginx access.log for abnormal-access review.")
                      : (locale === "zh" ? "挂载 access.log 后显示最近 IP。" : "Recent IPs appear after access.log is mounted.")}
                  </p>
                  <div className="admin-ip-table">
                    {accessLogAnalytics.recentIps.length > 0 ? accessLogAnalytics.recentIps.map((entry) => (
                      <span className={entry.suspicious ? "is-suspicious" : undefined} key={`${entry.ip}-${entry.lastSeen}`}>
                        <b>{entry.ip}</b>
                        <em>{entry.lastPath}</em>
                        <strong>{formatCompactNumber(entry.requests)}x · {entry.status}</strong>
                        <small>
                          {entry.riskTags.length > 0
                            ? entry.riskTags.slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)
                            : <i>{locale === "zh" ? "常规访问" : "Normal"}</i>}
                        </small>
                      </span>
                    )) : (
                      <small>{accessLogAnalytics.connected ? (locale === "zh" ? "今天暂无可展示 IP。" : "No visitor IPs today.") : accessLogAnalytics.message}</small>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-traffic-sources" aria-label={adminConsoleLabels.traffic.sourcesTitle}>
                <strong>{adminConsoleLabels.traffic.sourcesTitle}</strong>
                <div>
                  {trafficDataSources.map(([source, state]) => (
                    <span key={source}>
                      {source}
                      <em>{state}</em>
                    </span>
                  ))}
                </div>
              </div>
            </article>

            <aside className="admin-selected-order">
              <div className="eyebrow">
                <ReceiptText size={16} aria-hidden="true" />
                <span>{adminV2Labels.selectedOrder.label}</span>
              </div>
              <h2>{adminV2Labels.selectedOrder.title}</h2>
              {selectedOrder ? (
                <>
                  <strong>{selectedOrder.sourceReference ?? selectedOrder.id}</strong>
                  <p>{selectedOrder.skillName ?? selectedOrder.skillSlug ?? selectedOrder.sourceType} · {adminV2Labels.selectedOrder.pending}</p>
                  <div className="admin-selected-order__timeline">
                    <span>{selectedOrder.createdAt}</span>
                    <span>{selectedOrder.status}</span>
                    <span>{selectedOrder.balanceState ?? adminConsoleLabels.kpis.money}</span>
                  </div>
                  <div className="admin-selected-order__actions">
                    <a className="btn-primary" href={adminViewHref("finance", locale, "admin-ledger")}>
                      {adminV2Labels.selectedOrder.ledgerAction}
                    </a>
                  </div>
                  <div className="admin-selected-order__gated" aria-label={locale === "zh" ? "订单后续动作状态" : "Order follow-up action states"}>
                    {adminV2Labels.selectedOrder.gatedActions.map((action) => (
                      <span className="admin-state-pill admin-state-pill--amber" key={action}>{action}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p>{adminV2Labels.selectedOrder.empty}</p>
              )}
            </aside>
          </section>

          {adminView === "reviews" ? (
            <section className="admin-module-page" id="admin-reviews" aria-labelledby="admin-reviews-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Gavel size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "审核模块" : "Review module"}</span>
                  </div>
                  <h2 id="admin-reviews-title">{locale === "zh" ? "技能审核与证据追踪" : "Skill reviews and evidence trail"}</h2>
                  <p>
                    {locale === "zh"
                      ? "只保留真实审核队列和审计入口；审核、驳回、证据与权限检查都在这里处理。"
                      : "Only real review queues and audit entry points are shown here: approval, rejection, evidence, and permission checks."}
                  </p>
                </div>
                <a className="btn-secondary" href={adminViewHref("audit", locale, "admin-audit")}>
                  {locale === "zh" ? "查看审计日志" : "Open audit log"}
                </a>
              </div>
              <section className="admin-layout">
                <AdminReviewManager locale={locale} reviews={reviews} />
              </section>
            </section>
          ) : null}

          {adminView === "curation" ? (
            <section className="admin-module-page" id="admin-curation" aria-labelledby="admin-curation-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Settings size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "作者与市场" : "Publisher ops"}</span>
                  </div>
                  <h2 id="admin-curation-title">{locale === "zh" ? "作者准入、申诉与市场分发" : "Publisher access, appeals, and marketplace curation"}</h2>
                  <p>
                    {locale === "zh"
                      ? "这里处理第三方作者提交、申诉和上架治理；未接入项保持状态标签，不做假按钮。"
                      : "This module handles publisher submissions, appeals, and listing governance. Unconnected items stay status-labeled."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom">
                <AdminMarketplaceCurationManager
                  appeals={marketplaceCuration.appeals}
                  connectionMessage={marketplaceCuration.message}
                  connectionMode={marketplaceCuration.mode}
                  curation={marketplaceCuration.curation}
                  locale={locale}
                />
              </section>
            </section>
          ) : null}

          {adminView === "identity" ? (
            <section className="admin-module-page" id="admin-identity" aria-labelledby="admin-identity-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Users size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "身份目录" : "Identity directory"}</span>
                  </div>
                  <h2 id="admin-identity-title">{locale === "zh" ? "用户、组织、角色与管理员准入" : "Users, organizations, roles, and admin access"}</h2>
                  <p>
                    {locale === "zh"
                      ? "管理员在这里看角色归属、组织状态和准入风险，不再绕到账户页。"
                      : "Operators review role ownership, organization state, and access risks here without a personal-center detour."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom">
                <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
              </section>
            </section>
          ) : null}

          {adminView === "deliveries" ? (
            <section className="admin-module-page" id="admin-deliveries" aria-labelledby="admin-deliveries-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Bell size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "通知与 Webhook" : "Notifications and webhooks"}</span>
                  </div>
                  <h2 id="admin-deliveries-title">{locale === "zh" ? "通知投递、Webhook 回调与模板" : "Notification delivery, webhook callbacks, and templates"}</h2>
                  <p>
                    {locale === "zh"
                      ? "失败重试、回调状态和通知模板集中到一个模块，减少首页长度。"
                      : "Delivery retries, callback state, and notification templates are grouped into one focused module."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom">
                <NotificationDeliveryManager deliveries={notificationDeliveries} locale={locale} />
              </section>
              <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-webhooks">
                <WebhookDeliveryManager deliveries={webhookDeliveries} locale={locale} />
              </section>
              <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-templates">
                <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
              </section>
            </section>
          ) : null}

          {adminView === "finance" ? (
            <section className="admin-module-page" id="admin-finance" aria-labelledby="admin-finance-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Landmark size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "财务模块" : "Finance module"}</span>
                  </div>
                  <h2 id="admin-finance-title">{locale === "zh" ? "账本、佣金规则与支付状态" : "Ledger, commission rules, and payment state"}</h2>
                  <p>
                    {locale === "zh"
                      ? "账本是订单金额、佣金和作者分成的来源；Stripe 和 Alipay 未接入时只显示真实状态。"
                      : "The ledger is the source for order amount, commission, and publisher share. Stripe and Alipay stay explicitly gated until connected."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-ledger">
                <AdminLedgerProcessor ledger={financeLedger} locale={locale} />
                <AdminCommissionRuleManager locale={locale} rules={commissionRules} />
              </section>
            </section>
          ) : null}

          {adminView === "payouts" ? (
            <section className="admin-module-page" id="admin-payouts" aria-labelledby="admin-payouts-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <WalletCards size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "提现分账" : "Payouts and splits"}</span>
                  </div>
                  <h2 id="admin-payouts-title">{locale === "zh" ? "第三方作者提现审核与分账" : "Publisher payout review and revenue splits"}</h2>
                  <p>
                    {locale === "zh"
                      ? "处理作者提现、佣金口径和人工付款审核；未自动化支付的动作保留人工状态。"
                      : "Review publisher payouts, commission basis, and manual settlement while automated payout actions remain clearly labeled."}
                  </p>
                </div>
                <a className="btn-secondary" href={adminViewHref("finance", locale, "admin-ledger")}>
                  {locale === "zh" ? "查看账本" : "Open ledger"}
                </a>
              </div>
              <section className="workspace-ops-layout">
                <AdminPayoutManager locale={locale} payouts={payouts} />
              </section>
            </section>
          ) : null}

          {adminView === "risk" ? (
            <section className="admin-module-page" id="admin-risk" aria-labelledby="admin-risk-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Siren size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "风控模块" : "Risk module"}</span>
                  </div>
                  <h2 id="admin-risk-title">{locale === "zh" ? "举报、事故、反馈、退款与争议" : "Reports, incidents, feedback, refunds, and disputes"}</h2>
                  <p>
                    {locale === "zh"
                      ? "这里是真正需要运营处理的风险队列，不把风险卡片塞进总览底部。"
                      : "This is the actionable risk queue, separated from the overview instead of being stacked at the bottom."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom">
                <SkillFeedbackManager feedback={skillFeedback} locale={locale} />
                <AdminIncidentManager incidents={incidents} locale={locale} />
                <AbuseReportManager locale={locale} reports={abuseReports} />
                <div id="admin-adjustments">
                  <AdminAdjustmentManager disputes={disputes} locale={locale} refunds={refunds} />
                </div>
              </section>
            </section>
          ) : null}

          {adminView === "health" ? (
            <section className="admin-module-page" id="admin-health-module" aria-labelledby="admin-health-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "系统健康" : "System health"}</span>
                  </div>
                  <h2 id="admin-health-title">{locale === "zh" ? "上线就绪与生产健康检查" : "Launch readiness and production health"}</h2>
                  <p>
                    {locale === "zh"
                      ? "上线阻断、提醒项、延后检查和运行健康状态集中到这里。"
                      : "Launch blockers, warnings, deferred checks, and operating health are kept in one module."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom" id="launch-readiness">
                <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />
              </section>
            </section>
          ) : null}

          {adminView === "audit" ? (
            <section className="admin-module-page" id="admin-audit" aria-labelledby="admin-audit-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <ReceiptText size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "审计日志" : "Audit log"}</span>
                  </div>
                  <h2 id="admin-audit-title">{locale === "zh" ? "后台操作审计" : "Admin operation audit"}</h2>
                  <p>
                    {locale === "zh"
                      ? "所有审核、身份、财务、通知和风险操作都应能追踪来源与原因。"
                      : "Review, identity, finance, delivery, and risk operations should remain traceable with source and reason."}
                  </p>
                </div>
              </div>
              <section className="admin-layout">
                <AdminAuditLogPanel locale={locale} logs={auditLogs} />
              </section>
            </section>
          ) : null}

          {adminView === "settings" ? (
            <section className="admin-module-page" id="admin-templates" aria-labelledby="admin-settings-title">
              <div className="admin-module-page__head">
                <div>
                  <div className="eyebrow">
                    <Settings size={16} aria-hidden="true" />
                    <span>{locale === "zh" ? "设置" : "Settings"}</span>
                  </div>
                  <h2 id="admin-settings-title">{locale === "zh" ? "通知模板、支付接入状态和后台配置" : "Notification templates, payment state, and admin configuration"}</h2>
                  <p>
                    {locale === "zh"
                      ? "这里放真实可维护的后台配置；还没接入的 Stripe、Alipay、Analytics 只展示接入状态。"
                      : "This module keeps real maintainable settings. Stripe, Alipay, and analytics stay as integration states until connected."}
                  </p>
                </div>
              </div>
              <section className="workspace-ops-layout workspace-ops-layout--bottom">
                <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
              </section>
              <article className="admin-payment-panel admin-payment-panel--v2">
                <div className="eyebrow">
                  <WalletCards size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.payment.title}</span>
                </div>
                <h2>{adminConsoleLabels.payment.title}</h2>
                <p>{adminConsoleLabels.payment.description}</p>
                <div className="admin-payment-card-grid">
                  {paymentCards.map(([title, detail, state, tone]) => (
                    <div className="admin-payment-card" key={title}>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                      <b className={`admin-state-pill admin-state-pill--${tone}`}>{state}</b>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          <section className="admin-insight-grid admin-insight-grid--legacy" aria-labelledby="admin-analytics-title">
            <article className="admin-analytics-panel">
              <div className="eyebrow">
                <BarChart3 size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.analytics.title}</span>
              </div>
              <h2 id="admin-analytics-title">{adminConsoleLabels.analytics.title}</h2>
              <p>{adminConsoleLabels.analytics.description}</p>
              <div className="admin-analytics-metrics">
                {adminAnalytics.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-order-panel" id="admin-orders-legacy">
              <div className="eyebrow">
                <CreditCard size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.order.title}</span>
              </div>
              <p>{adminConsoleLabels.order.description}</p>
              <div className="admin-order-tabs" aria-label={locale === "zh" ? "订单状态筛选" : "Order status filters"}>
                {adminConsoleLabels.order.tabs.map((tab, index) => (
                  <span className={index === 0 ? "is-active" : undefined} key={tab}>
                    {tab}
                  </span>
                ))}
              </div>
              <div className="admin-order-list">
                <div className="admin-order-row admin-order-row--head">
                  {adminConsoleLabels.order.headers.map((header) => (
                    <span key={header}>{header}</span>
                  ))}
                </div>
                {recentOrderRows.map((transaction) => (
                  <a className="admin-order-row" href={adminViewHref("finance", locale, "admin-ledger")} key={transaction.id}>
                    <strong>{transaction.sourceReference ?? transaction.id}</strong>
                    <span>{transaction.sourceType ?? transaction.status}</span>
                    <span>{formatMoney(transaction.grossCents, transaction.currency)}</span>
                    <span className="status-chip">{transaction.balanceState ?? transaction.status}</span>
                  </a>
                ))}
                {recentOrderRows.length === 0 ? <div className="admin-order-empty">{adminConsoleLabels.order.empty}</div> : null}
              </div>
            </article>

            <article className="admin-payment-panel">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.payment.title}</span>
              </div>
              <p>{adminConsoleLabels.payment.description}</p>
              <div className="admin-payment-list">
                {adminConsoleLabels.payment.items.map(([title, state]) => (
                  <div key={title}>
                    <strong>{title}</strong>
                    <span>{state}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-traffic-panel admin-traffic-panel--legacy" id="admin-traffic-legacy" aria-labelledby="admin-traffic-title-legacy">
            <div className="admin-traffic-panel__head">
              <div>
                <div className="eyebrow">
                  <Activity size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.traffic.title}</span>
                </div>
                <h2 id="admin-traffic-title-legacy">{adminConsoleLabels.traffic.title}</h2>
                <p>{adminConsoleLabels.traffic.description}</p>
              </div>
              <span className="status-chip">{adminConsoleLabels.kpis.trafficValue}</span>
            </div>

            <div className="admin-traffic-grid">
              {adminConsoleLabels.traffic.metrics.map(([label, value]) => (
                <div className="admin-traffic-metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="admin-traffic-sources" aria-label={adminConsoleLabels.traffic.sourcesTitle}>
              <strong>{adminConsoleLabels.traffic.sourcesTitle}</strong>
              <div>
                {adminConsoleLabels.traffic.sources.map(([source, state]) => (
                  <span key={source}>
                    {source}
                    <em>{state}</em>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="admin-detail-workbench" aria-labelledby="admin-detail-workbench-title">
            <div className="admin-detail-workbench__intro">
              <div>
                <div className="eyebrow">
                  <ListChecks size={16} aria-hidden="true" />
                  <span>{adminV2Labels.workbench.eyebrow}</span>
                </div>
                <h2 id="admin-detail-workbench-title">{adminV2Labels.workbench.title}</h2>
                <p>{adminV2Labels.workbench.body}</p>
              </div>
              <a className="btn-secondary" href={primaryPriorityItem.href}>
                <span>{adminV2Labels.hero.primary}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <nav className="admin-workbench-nav" aria-label={adminV2Labels.workbench.eyebrow}>
              {workbenchCards.map((card) => {
                const Icon = card.Icon ?? ListChecks;
                const stateClass =
                  card.tone === "danger" ? "admin-state-pill--red" : card.tone === "warning" ? "admin-state-pill--amber" : "admin-state-pill--green";

                return (
                  <a className={`admin-workbench-card admin-workbench-card--${card.tone}`} href={card.href} key={card.title}>
                    <span className="admin-workbench-card__icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <strong>{card.title}</strong>
                    <p>{card.detail}</p>
                    <b className={`admin-state-pill ${stateClass}`}>{card.value} {card.statLabel}</b>
                  </a>
                );
              })}
            </nav>

            <div className="admin-detail-workbench__modules admin-workbench-groups" aria-label={workbenchGroupLabels.title}>
              <details
                className={`admin-module-group admin-module-group--${workbenchCards[0].tone} ${defaultWorkbenchGroup === "launch" ? "admin-module-group--priority" : ""}`}
                id="admin-group-launch"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">01</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[0].title}</strong>
                    <small>{workbenchGroupLabels.launch}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[0].tone)}`}>
                    {workbenchCards[0].value} {workbenchCards[0].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="launch-readiness">
                    <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />
                  </section>
                </div>
              </details>

              <details
                className={`admin-module-group admin-module-group--${workbenchCards[1].tone} ${defaultWorkbenchGroup === "review" ? "admin-module-group--priority" : ""}`}
                id="admin-group-review"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">02</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[1].title}</strong>
                    <small>{workbenchGroupLabels.audit}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[1].tone)}`}>
                    {workbenchCards[1].value} {workbenchCards[1].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="admin-layout" id="admin-reviews">
                    <AdminReviewManager locale={locale} reviews={reviews} />

                    <div id="admin-audit">
                      <AdminAuditLogPanel locale={locale} logs={auditLogs} />
                    </div>
                  </section>
                </div>
              </details>

              <details
                className={`admin-module-group admin-module-group--${workbenchCards[2].tone} ${defaultWorkbenchGroup === "identity" ? "admin-module-group--priority" : ""}`}
                id="admin-group-identity"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">03</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[2].title}</strong>
                    <small>{workbenchGroupLabels.curation}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[2].tone)}`}>
                    {workbenchCards[2].value} {workbenchCards[2].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-identity">
                    <AdminIdentityDirectory directory={identityDirectory} locale={locale} />
                  </section>

                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-curation">
                    <AdminMarketplaceCurationManager
                      appeals={marketplaceCuration.appeals}
                      connectionMessage={marketplaceCuration.message}
                      connectionMode={marketplaceCuration.mode}
                      curation={marketplaceCuration.curation}
                      locale={locale}
                    />
                  </section>
                </div>
              </details>

              <details
                className={`admin-module-group admin-module-group--${workbenchCards[3].tone} ${defaultWorkbenchGroup === "delivery" ? "admin-module-group--priority" : ""}`}
                id="admin-group-delivery"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">04</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[3].title}</strong>
                    <small>{workbenchGroupLabels.delivery}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[3].tone)}`}>
                    {workbenchCards[3].value} {workbenchCards[3].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-deliveries">
                    <NotificationDeliveryManager deliveries={notificationDeliveries} locale={locale} />
                  </section>

                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-webhooks">
                    <WebhookDeliveryManager deliveries={webhookDeliveries} locale={locale} />
                  </section>

                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-templates">
                    <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
                  </section>
                </div>
              </details>

              <details
                className={`admin-module-group admin-module-group--${workbenchCards[4].tone} ${defaultWorkbenchGroup === "risk" ? "admin-module-group--priority" : ""}`}
                id="admin-group-risk"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">05</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[4].title}</strong>
                    <small>{workbenchGroupLabels.risk}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[4].tone)}`}>
                    {workbenchCards[4].value} {workbenchCards[4].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-risk">
                    <SkillFeedbackManager feedback={skillFeedback} locale={locale} />
                    <AdminIncidentManager incidents={incidents} locale={locale} />
                    <AbuseReportManager locale={locale} reports={abuseReports} />
                    <div id="admin-adjustments">
                      <AdminAdjustmentManager disputes={disputes} locale={locale} refunds={refunds} />
                    </div>
                  </section>

                  <section className="admin-layout">
                <article className="ops-panel work-table-panel">
                  <div className="eyebrow">
                    <Siren size={16} aria-hidden="true" />
                    <span>{ops.riskTitle}</span>
                  </div>
                  <div className="work-table">
                    <div className="work-table__row work-table__row--head">
                      {ops.riskHeaders.map((header) => (
                        <span key={header}>{header}</span>
                      ))}
                    </div>
                    {riskRows.map(([signal, scope, action, owner]) => (
                      <div className="work-table__row" key={signal}>
                        <strong>{signal}</strong>
                        <span>{scope}</span>
                        <span>{action}</span>
                        <span>{owner}</span>
                      </div>
                    ))}
                    {riskRows.length === 0 ? (
                      <div className="work-table__empty">{locale === "zh" ? "暂无实时风险信号。" : "No live risk signals recorded yet."}</div>
                    ) : null}
                  </div>
                </article>

                <aside className="ops-panel">
                  <div className="eyebrow">
                    <Gavel size={16} aria-hidden="true" />
                    <span>{ops.actionTitle}</span>
                  </div>
                  <div className="ops-list">
                    {ops.actionRows.map(([title, detail]) => (
                      <div className="ops-row" key={title}>
                        <Scale size={18} aria-hidden="true" />
                        <div>
                          <strong>{title}</strong>
                          <span>{detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
                  </section>
                </div>
              </details>

              <details
                className={`admin-module-group admin-module-group--${workbenchCards[5].tone} ${defaultWorkbenchGroup === "finance" ? "admin-module-group--priority" : ""}`}
                id="admin-group-finance"
              >
                <summary className="admin-module-group__summary">
                  <span className="admin-module-group__number">06</span>
                  <span className="admin-module-group__copy">
                    <strong>{workbenchCards[5].title}</strong>
                    <small>{workbenchGroupLabels.finance}</small>
                  </span>
                  <b className={`admin-state-pill ${workbenchGroupStatusClass(workbenchCards[5].tone)}`}>
                    {workbenchCards[5].value} {workbenchCards[5].statLabel}
                  </b>
                  <em>{workbenchGroupLabels.action}</em>
                </summary>
                <div className="admin-module-group__body">
                  <section className="workspace-ops-layout" id="admin-finance-details">
                    <article className="ops-panel work-table-panel">
                  <div className="eyebrow">
                    <ReceiptText size={16} aria-hidden="true" />
                    <span>{ops.moneyTitle}</span>
                  </div>
                  <div className="money-table">
                    <div className="money-table__row money-table__row--head">
                      {ops.moneyHeaders.map((header) => (
                        <span key={header}>{header}</span>
                      ))}
                    </div>
                    {financeRows.map(([batch, gross, fee, share, state]) => (
                      <div className="money-table__row" key={batch}>
                        <strong>{batch}</strong>
                        <span>{gross}</span>
                        <span>{fee}</span>
                        <span>{share}</span>
                        <span className="status-chip">{state}</span>
                      </div>
                    ))}
                    {financeRows.length === 0 ? (
                      <div className="money-table__empty">{locale === "zh" ? "暂无已入账资金流水。" : "No posted ledger transactions yet."}</div>
                    ) : null}
                  </div>
                </article>

                <div id="admin-payouts">
                  <AdminPayoutManager locale={locale} payouts={payouts} />
                </div>
              </section>

              <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-ledger">
                <AdminLedgerProcessor ledger={financeLedger} locale={locale} />
                <AdminCommissionRuleManager locale={locale} rules={commissionRules} />
              </section>

              <section className="admin-finance-section">
                <div className="section-heading section-heading--compact">
                  <div className="eyebrow">
                    <ListChecks size={16} aria-hidden="true" />
                    <span>{labels.financeTitle}</span>
                  </div>
                </div>

                <div className="finance-rule-grid">
                  {labels.financeRows.map((row: readonly [string, string], index: number) => {
                    const [title, detail] = row;
                    const Icon = financeIcons[index];
                    return (
                      <article className="finance-rule lift-card" key={title}>
                        <Icon size={19} aria-hidden="true" />
                        <h2>{title}</h2>
                        <p>{detail}</p>
                      </article>
                    );
                  })}
                </div>
              </section>
                </div>
              </details>
            </div>
          </section>
        </div>
      </section>
      </div>
    </main>
  );
}

function AdminConsoleBackdrop() {
  return (
    <div className="admin-control-backdrop" aria-hidden="true">
      <span className="admin-control-backdrop__scan admin-control-backdrop__scan--a" />
      <span className="admin-control-backdrop__scan admin-control-backdrop__scan--b" />
      <span className="admin-control-backdrop__rail admin-control-backdrop__rail--a" />
      <span className="admin-control-backdrop__rail admin-control-backdrop__rail--b" />
      <span className="admin-control-backdrop__rail admin-control-backdrop__rail--c" />
      <span className="admin-control-backdrop__node admin-control-backdrop__node--a" />
      <span className="admin-control-backdrop__node admin-control-backdrop__node--b" />
      <span className="admin-control-backdrop__node admin-control-backdrop__node--c" />
      <span className="admin-control-backdrop__node admin-control-backdrop__node--d" />
    </div>
  );
}

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
  const guide = getAdminLockedGuide(locale);

  return (
    <section className="workspace-locked-panel">
      <article className="ops-panel workspace-locked-panel__card">
        <div className="workspace-locked-panel__main">
          <div className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{guide.eyebrow}</span>
          </div>
          <h2>{title}</h2>
          <p>{body}</p>
          <p className="visually-hidden">{guide.marker}</p>
          <a className="btn-primary" href={actionHref}>
            <span>{actionLabel}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="workspace-locked-panel__actions" aria-label={guide.ariaLabel}>
          {guide.actions.map((action, index) => {
            const Icon = [LockKeyhole, ListChecks, Gavel][index] ?? ReceiptText;

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

function getAdminLockedGuide(locale: Locale) {
  if (locale === "zh") {
    return {
      ariaLabel: "管理员准入步骤",
      eyebrow: "管理员准入",
      marker:
        "管理员运营队列 / 上线就绪 / 审核队列 / 审计 / admin operations queue / launch-readiness / review queue / audit / identity / notification / webhook",
      actions: [
        {
          body: "使用 Google、GitHub 或邮箱密码进入账号；公共登录页不展示管理员入口。",
          href: "/login",
          label: "01",
          title: "登录账号"
        },
        {
          body: "在账号角色页确认 reviewer、finance、support、admin 或 super_admin 角色。",
          href: "/account",
          label: "02",
          title: "确认运营角色"
        },
        {
          body: "具备角色后直接打开后台，处理审核、上线就绪、提现、投递和审计。",
          href: "/admin?view=health#launch-readiness",
          label: "03",
          title: "进入运营台"
        }
      ]
    };
  }

  return {
    ariaLabel: "Admin access steps",
    eyebrow: "Admin access",
    marker: "admin operations queue / launch-readiness / review queue / audit / identity / notification / webhook",
    actions: [
      {
        body: "Use Google, GitHub, or email password access. The public login page does not advertise admin entry.",
        href: "/login",
        label: "01",
        title: "Sign in"
      },
      {
        body: "Confirm a reviewer, finance, support, admin, or super_admin role in the account center.",
        href: "/account",
        label: "02",
        title: "Confirm role"
      },
      {
        body: "With the right role, open operations for reviews, launch readiness, payouts, delivery, and audit.",
        href: "/admin?view=health#launch-readiness",
        label: "03",
        title: "Open operations"
      }
    ]
  };
}

function buildAdminPriorityItems(input: AdminPriorityInput): AdminPriorityItem[] {
  const labels = adminCommandCopy[input.locale];
  const items: AdminPriorityItem[] = [];
  const reviewMetrics = buildAdminReviewMetrics(input.reviews);
  const launchBlockers = input.launchReadiness.summary.blocker;
  const launchWarnings = input.launchReadiness.summary.warning + input.launchReadiness.summary.deferred;
  const activeIncidents = input.incidents.filter(isActiveIncident).length;
  const criticalIncidents = input.incidents.filter(
    (incident) => isActiveIncident(incident) && (incident.severity === "critical" || incident.severity === "high")
  ).length;
  const openAbuseReports = input.abuseReports.filter(isOpenAbuseReport).length;
  const criticalAbuseReports = input.abuseReports.filter(
    (report) => isOpenAbuseReport(report) && (report.severity === "critical" || report.severity === "high")
  ).length;
  const pendingFeedback = input.skillFeedback.filter((feedback) => feedback.status === "pending").length;
  const payoutActions = countAdminPayoutActions(input.payouts);
  const urgentPayouts = input.payouts.filter((payout) => payout.status === "blocked" || payout.status === "failed").length;
  const adjustmentActions = countAdminAdjustmentActions(input.refunds, input.disputes);
  const missingActiveCommission = !input.commissionRules.some((rule) => rule.isActive);
  const notificationActions = countNotificationDeliveryActions(input.notificationDeliveries);
  const failedNotifications = input.notificationDeliveries.filter((delivery) => delivery.status === "failed").length;
  const webhookActions = countWebhookDeliveryActions(input.webhookDeliveries);
  const failedWebhooks = input.webhookDeliveries.filter((delivery) => delivery.status === "failed").length;
  const activeAppeals = input.marketplaceCuration.appeals.filter((appeal) => appeal.status === "open" || appeal.status === "under_review").length;
  const identityNeedsReview = input.identityDirectory.summary.userCount > 0 && input.identityDirectory.summary.adminUserCount === 0;

  if (launchBlockers > 0) {
    items.push({
      actionLabel: labels.queueActions.launch,
      detail: labels.queueItems.launchBlocker,
      href: adminAnchor("launch-readiness", input.locale),
      id: "launch-blockers",
      metric: formatCompactNumber(launchBlockers),
      priority: 10,
      title: labels.queueTitles.launch,
      tone: "danger"
    });
  } else if (launchWarnings > 0) {
    items.push({
      actionLabel: labels.queueActions.launch,
      detail: labels.queueItems.launchWarning,
      href: adminAnchor("launch-readiness", input.locale),
      id: "launch-warnings",
      metric: formatCompactNumber(launchWarnings),
      priority: 70,
      title: labels.queueTitles.launch,
      tone: "warning"
    });
  }

  if (missingActiveCommission) {
    items.push({
      actionLabel: labels.queueActions.finance,
      detail: labels.queueItems.commission,
      href: adminAnchor("admin-ledger", input.locale),
      id: "commission-rule",
      metric: labels.queueTones.warning,
      priority: 18,
      title: labels.queueTitles.commission,
      tone: "warning"
    });
  }

  if (reviewMetrics.danger > 0) {
    items.push({
      actionLabel: labels.queueActions.reviews,
      detail: labels.queueItems.reviewsDanger,
      href: adminAnchor("admin-reviews", input.locale),
      id: "reviews-danger",
      metric: formatCompactNumber(reviewMetrics.danger),
      priority: 20,
      title: labels.queueTitles.reviews,
      tone: "danger"
    });
  } else if (reviewMetrics.warning > 0 || reviewMetrics.ready > 0) {
    items.push({
      actionLabel: labels.queueActions.reviews,
      detail: labels.queueItems.reviewsWarning,
      href: adminAnchor("admin-reviews", input.locale),
      id: "reviews-warning",
      metric: formatCompactNumber(reviewMetrics.warning || reviewMetrics.ready),
      priority: reviewMetrics.warning > 0 ? 36 : 62,
      title: labels.queueTitles.reviews,
      tone: reviewMetrics.warning > 0 ? "warning" : "ready"
    });
  }

  if (activeIncidents > 0) {
    items.push({
      actionLabel: labels.queueActions.risk,
      detail: labels.queueItems.incidents,
      href: adminAnchor("admin-risk", input.locale),
      id: "runtime-incidents",
      metric: formatCompactNumber(criticalIncidents || activeIncidents),
      priority: criticalIncidents > 0 ? 16 : 34,
      title: labels.queueTitles.incidents,
      tone: criticalIncidents > 0 ? "danger" : "warning"
    });
  }

  if (openAbuseReports > 0) {
    items.push({
      actionLabel: labels.queueActions.risk,
      detail: labels.queueItems.abuse,
      href: adminAnchor("admin-risk", input.locale),
      id: "abuse-reports",
      metric: formatCompactNumber(criticalAbuseReports || openAbuseReports),
      priority: criticalAbuseReports > 0 ? 22 : 42,
      title: labels.queueTitles.abuse,
      tone: criticalAbuseReports > 0 ? "danger" : "warning"
    });
  }

  if (payoutActions > 0) {
    items.push({
      actionLabel: labels.queueActions.payouts,
      detail: labels.queueItems.payouts,
      href: adminAnchor("admin-payouts", input.locale),
      id: "payouts",
      metric: formatCompactNumber(urgentPayouts || payoutActions),
      priority: urgentPayouts > 0 ? 24 : 44,
      title: labels.queueTitles.payouts,
      tone: urgentPayouts > 0 ? "danger" : "warning"
    });
  }

  if (adjustmentActions > 0) {
    items.push({
      actionLabel: labels.queueActions.finance,
      detail: labels.queueItems.adjustments,
      href: adminAnchor("admin-adjustments", input.locale),
      id: "adjustments",
      metric: formatCompactNumber(adjustmentActions),
      priority: 38,
      title: labels.queueTitles.adjustments,
      tone: "warning"
    });
  }

  if (notificationActions > 0) {
    items.push({
      actionLabel: labels.queueActions.deliveries,
      detail: labels.queueItems.deliveries,
      href: adminAnchor("admin-deliveries", input.locale),
      id: "notification-deliveries",
      metric: formatCompactNumber(failedNotifications || notificationActions),
      priority: failedNotifications > 0 ? 32 : 64,
      title: labels.queueTitles.deliveries,
      tone: failedNotifications > 0 ? "danger" : "warning"
    });
  }

  if (webhookActions > 0) {
    items.push({
      actionLabel: labels.queueActions.webhooks,
      detail: labels.queueItems.webhooks,
      href: adminAnchor("admin-webhooks", input.locale),
      id: "webhook-deliveries",
      metric: formatCompactNumber(failedWebhooks || webhookActions),
      priority: failedWebhooks > 0 ? 33 : 66,
      title: labels.queueTitles.webhooks,
      tone: failedWebhooks > 0 ? "danger" : "warning"
    });
  }

  if (pendingFeedback > 0) {
    items.push({
      actionLabel: labels.queueActions.risk,
      detail: labels.queueItems.feedback,
      href: adminAnchor("admin-risk", input.locale),
      id: "feedback-moderation",
      metric: formatCompactNumber(pendingFeedback),
      priority: 48,
      title: labels.queueTitles.feedback,
      tone: "warning"
    });
  }

  if (activeAppeals > 0) {
    items.push({
      actionLabel: labels.queueActions.curation,
      detail: labels.queueItems.curation,
      href: adminAnchor("admin-curation", input.locale),
      id: "curation-appeals",
      metric: formatCompactNumber(activeAppeals),
      priority: 52,
      title: labels.queueTitles.curation,
      tone: "warning"
    });
  }

  if (identityNeedsReview) {
    items.push({
      actionLabel: labels.queueActions.identity,
      detail: labels.queueItems.identity,
      href: adminAnchor("admin-identity", input.locale),
      id: "identity-health",
      metric: formatCompactNumber(input.identityDirectory.summary.userCount),
      priority: 58,
      title: labels.queueTitles.identity,
      tone: "warning"
    });
  }

  if (items.length === 0) {
    items.push({
      actionLabel: labels.queueActions.audit,
      detail: labels.queue.readyDetail,
      href: adminAnchor("admin-audit", input.locale),
      id: "healthy-admin-loop",
      metric: labels.queue.readyMetric,
      priority: 100,
      title: labels.queue.readyTitle,
      tone: "ready"
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

function buildAdminReviewMetrics(reviews: Awaited<ReturnType<typeof getAdminReviews>>) {
  return reviews.reduce(
    (metrics, review) => {
      if (!isOpenReview(review)) {
        return metrics;
      }

      const blocking = hasAdminBlockingChecks(review);
      const warning = hasAdminWarningChecks(review);
      const highRisk = review.riskLevel === "high";
      const slaDanger = review.reviewSlaStatus === "overdue";
      const slaWarning = review.reviewSlaStatus === "due_soon";

      metrics.actionable += 1;
      metrics.danger += blocking || highRisk || slaDanger || review.status === "blocked" ? 1 : 0;
      metrics.warning += !blocking && !highRisk && !slaDanger && (warning || slaWarning) ? 1 : 0;
      metrics.ready += isAdminDecisionReady(review) ? 1 : 0;

      return metrics;
    },
    {
      actionable: 0,
      danger: 0,
      ready: 0,
      warning: 0
    }
  );
}

function isOpenReview(review: Awaited<ReturnType<typeof getAdminReviews>>[number]) {
  return review.status !== "approved" && review.status !== "rejected" && review.reviewSlaStatus !== "decided";
}

function hasAdminBlockingChecks(review: Awaited<ReturnType<typeof getAdminReviews>>[number]) {
  return (review.runtimeChecks ?? []).some(
    (check) => check.isBlocking === true || check.status === "failed" || check.status === "queued" || check.status === "running"
  );
}

function hasAdminWarningChecks(review: Awaited<ReturnType<typeof getAdminReviews>>[number]) {
  return (review.runtimeChecks ?? []).some((check) => check.status === "warning");
}

function isAdminDecisionReady(review: Awaited<ReturnType<typeof getAdminReviews>>[number]) {
  return (
    isOpenReview(review) &&
    Boolean(review.runtimeChecks?.length) &&
    !hasAdminBlockingChecks(review) &&
    !hasAdminWarningChecks(review) &&
    review.riskLevel !== "high"
  );
}

function isActiveIncident(incident: Awaited<ReturnType<typeof getAdminIncidents>>[number]) {
  return incident.status === "open" || incident.status === "monitoring";
}

function isOpenAbuseReport(report: Awaited<ReturnType<typeof getAdminAbuseReports>>[number]) {
  return report.status === "open" || report.status === "triaged" || report.status === "warning_sent";
}

function countAdminPayoutActions(payouts: Awaited<ReturnType<typeof getAdminPayouts>>) {
  return payouts.filter((payout) => payout.status === "requested" || payout.status === "review" || payout.status === "failed" || payout.status === "blocked").length;
}

function countAdminAdjustmentActions(
  refunds: Awaited<ReturnType<typeof getAdminRefunds>>,
  disputes: Awaited<ReturnType<typeof getAdminDisputes>>
) {
  const refundCount = refunds.filter((refund) => refund.status === "requested" || refund.status === "failed").length;
  const disputeCount = disputes.filter(
    (dispute) => dispute.status === "open" || dispute.status === "warning_needs_response" || dispute.status === "lost"
  ).length;

  return refundCount + disputeCount;
}

function countNotificationDeliveryActions(deliveries: Awaited<ReturnType<typeof getAdminNotificationDeliveries>>) {
  return deliveries.filter((delivery) => delivery.status === "failed" || (delivery.status === "queued" && isDeliveryDue(delivery.nextAttemptAt))).length;
}

function countWebhookDeliveryActions(deliveries: Awaited<ReturnType<typeof getAdminWebhookDeliveries>>) {
  return deliveries.filter((delivery) => delivery.status === "failed" || (delivery.status === "pending" && isDeliveryDue(delivery.nextAttemptAt))).length;
}

function isDeliveryDue(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) || time <= Date.now();
}

function getAdminInitials(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "AD";
  }

  const words = normalized
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);

  return (words[0]?.[0] ?? "A").concat(words[1]?.[0] ?? "D").slice(0, 2).toUpperCase();
}

function formatAdminRegionName(code: string, locale: Locale) {
  const normalizedCode = code.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(normalizedCode)) {
    return normalizedCode || (locale === "zh" ? "未知地区" : "Unknown");
  }

  try {
    const displayNames = new Intl.DisplayNames([locale === "zh" ? "zh-CN" : "en"], { type: "region" });
    return displayNames.of(normalizedCode) ?? normalizedCode;
  } catch {
    return normalizedCode;
  }
}

function formatAdminOrderNext(transaction: FinanceLedgerTransaction, locale: Locale) {
  const state = (transaction.balanceState ?? transaction.status).toLowerCase();

  if (state.includes("pending")) {
    return locale === "zh" ? "对账确认" : "Reconcile";
  }

  if (state.includes("failed") || state.includes("dispute")) {
    return locale === "zh" ? "处理异常" : "Resolve";
  }

  if (state.includes("available") || state.includes("posted")) {
    return locale === "zh" ? "生成发票" : "Invoice";
  }

  return locale === "zh" ? "查看详情" : "Review";
}

function getAdminViewFromSearchParams(params: AdminSearchParams): AdminConsoleView {
  const rawView = params.view;
  const value = Array.isArray(rawView) ? rawView[0] : rawView;

  return adminConsoleViews.includes(value as AdminConsoleView) ? (value as AdminConsoleView) : "overview";
}

function adminViewHref(view: AdminConsoleView, locale: Locale, anchor?: string) {
  const hash = anchor ? `#${anchor}` : "";
  return localizedHref(`/admin?view=${view}${hash}`, locale);
}

function adminAnchor(anchor: string, locale: Locale) {
  const normalizedAnchor = anchor.startsWith("#") ? anchor.slice(1) : anchor;
  return adminViewHref(getAdminViewForAnchor(`#${normalizedAnchor}`), locale, normalizedAnchor);
}

function getAdminViewForAnchor(anchor: string): AdminConsoleView {
  switch (anchor) {
    case "#admin-analytics":
      return "analytics";
    case "#admin-traffic":
    case "#admin-traffic-details":
      return "traffic";
    case "#admin-ai-referrals":
      return "ai-referrals";
    case "#admin-funnel":
      return "funnel";
    case "#admin-reviews":
    case "#admin-group-review":
      return "reviews";
    case "#admin-curation":
    case "#admin-group-identity":
      return "curation";
    case "#admin-identity":
      return "identity";
    case "#admin-deliveries":
    case "#admin-webhooks":
    case "#admin-group-delivery":
      return "deliveries";
    case "#admin-orders":
      return "orders";
    case "#admin-finance":
    case "#admin-finance-details":
    case "#admin-ledger":
    case "#admin-group-finance":
      return "finance";
    case "#admin-payouts":
      return "payouts";
    case "#admin-risk":
    case "#admin-adjustments":
    case "#admin-group-risk":
      return "risk";
    case "#admin-system-health":
    case "#launch-readiness":
    case "#admin-group-launch":
      return "health";
    case "#admin-audit":
      return "audit";
    case "#admin-templates":
      return "settings";
    default:
      return "overview";
  }
}

function getAdminNavIcon(anchor: string) {
  switch (anchor) {
    case "#admin-overview":
    case "#admin-analytics":
      return BarChart3;
    case "#admin-ai-referrals":
    case "#admin-funnel":
      return Activity;
    case "#admin-priority":
      return ListChecks;
    case "#launch-readiness":
      return ShieldCheck;
    case "#admin-reviews":
      return Gavel;
    case "#admin-curation":
      return Settings;
    case "#admin-orders":
      return CreditCard;
    case "#admin-finance":
      return Landmark;
    case "#admin-payouts":
      return WalletCards;
    case "#admin-ledger":
      return ReceiptText;
    case "#admin-traffic":
      return Activity;
    case "#admin-risk":
      return Siren;
    case "#admin-deliveries":
      return Bell;
    case "#admin-identity":
      return Users;
    case "#admin-audit":
      return ReceiptText;
    case "#admin-templates":
    case "#admin-system-health":
      return Settings;
    default:
      return ListChecks;
  }
}

type AdminOpsCopy = (typeof adminOpsCopy)["en"] | (typeof adminOpsCopy)["zh"];

function formatRiskSeverity(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.severities[value as keyof typeof ops.riskSignals.severities] ?? value.replaceAll("_", " ");
}

function formatSourceType(sourceType: string | undefined) {
  return sourceType ? `[${sourceType}]` : "";
}

function formatAbuseCategory(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.abuseCategories[value as keyof typeof ops.riskSignals.abuseCategories] ?? value.replaceAll("_", " ");
}

function formatFeedbackStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.feedbackStatuses[value as keyof typeof ops.riskSignals.feedbackStatuses] ?? value.replaceAll("_", " ");
}

function formatRefundStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.refundStatuses[value as keyof typeof ops.riskSignals.refundStatuses] ?? value.replaceAll("_", " ");
}

function formatDisputeStatus(value: string, ops: AdminOpsCopy) {
  return ops.riskSignals.disputeStatuses[value as keyof typeof ops.riskSignals.disputeStatuses] ?? value.replaceAll("_", " ");
}
