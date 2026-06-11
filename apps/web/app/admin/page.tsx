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
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { NotificationDeliveryManager } from "@/components/notification-delivery-manager";
import { NotificationTemplateManager } from "@/components/notification-template-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SkillFeedbackManager } from "@/components/skill-feedback-manager";
import { SiteHeader } from "@/components/site-header";
import { WebhookDeliveryManager } from "@/components/webhook-delivery-manager";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
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
  getFinanceLedger
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const financeIcons = [Scale, Banknote, AlertTriangle] as const;
const adminAccessRoles = ["reviewer", "finance", "support", "admin", "super_admin"];

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
    body:
      "The admin command center ranks launch, review, trust, finance, delivery, identity, and audit signals from live operational records so the console starts with work, not decoration.",
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
      readyDetail:
        "No urgent admin blockers are visible. Keep monitoring launch readiness, review evidence, risk, money movement, delivery retries, identity health, and audit records.",
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
      abuse: "Trust reports need triage, restriction, suspension, or resolution before listings keep moving.",
      adjustments: "Refunds or disputes need finance/trust decisions without rewriting historical ledger splits.",
      commission: "No active commission rule is visible, so paid marketplace ledger posting needs operator setup.",
      curation: "Marketplace curation appeals need a reviewer decision, reason, and publisher-visible outcome.",
      deliveries: "External notification delivery has failed, skipped, or queued rows that need retry or provider action.",
      feedback: "Buyer feedback is waiting for moderation before it can become a public trust signal.",
      identity: "Identity directory has users but no admin user signal; inspect access before launch operations.",
      incidents: "Runtime incidents need severity handling, recovery state, and publisher/developer notifications.",
      launchBlocker: "Public launch has blocker checks that must be cleared before customer-facing rollout.",
      launchWarning: "Launch readiness has warnings or deferred work that should be tracked before demos.",
      payouts: "Payouts are requested, in review, failed, or blocked and need a finance decision path.",
      reviewsDanger: "Skill reviews have overdue, blocking, or high-risk evidence that should be processed first.",
      reviewsWarning: "Skill reviews have due-soon, warning, or decision-ready rows waiting for operators.",
      webhooks: "Webhook outbox rows are failed, pending, or retry-ready and need delivery processing."
    },
    queueTitles: {
      abuse: "Trust reports",
      adjustments: "Refund/dispute operations",
      commission: "Commission setup",
      curation: "Curation appeals",
      deliveries: "Notification delivery",
      feedback: "Feedback moderation",
      identity: "Identity health",
      incidents: "Runtime incidents",
      launch: "Launch readiness",
      payouts: "Payout review",
      reviews: "Skill review operations",
      webhooks: "Webhook outbox"
    },
    queueTones: {
      danger: "Urgent",
      ready: "Ready",
      warning: "Needs work"
    }
  },
  zh: {
    body:
      "管理员控制台要先告诉运营今天处理什么：上线、审核、信任、财务、通知、身份和审计都从真实运营记录里汇总，而不是只展示装饰性指标。",
    eyebrow: "管理员运营队列",
    ready: "已就绪",
    title: "运营今天必须先处理什么？",
    metrics: {
      delivery: "投递队列",
      finance: "财务队列",
      launch: "上线缺口",
      review: "审核队列",
      risk: "风险队列"
    },
    queue: {
      readyDetail:
        "当前没有紧急后台阻塞。继续监控上线就绪、审核证据、风险、资金流、投递重试、身份健康和审计记录。",
      readyMetric: "健康",
      readyTitle: "运营闭环正常",
      title: "优先级队列"
    },
    queueActions: {
      audit: "打开审计流",
      curation: "打开市场申诉",
      deliveries: "打开通知投递",
      finance: "打开财务控制",
      identity: "打开身份目录",
      launch: "打开上线检查",
      payouts: "打开提现审核",
      reviews: "打开审核队列",
      risk: "打开风险队列",
      webhooks: "打开 Webhook outbox"
    },
    queueItems: {
      abuse: "信任报告需要分诊、限制、暂停或关闭，避免问题列表继续流转。",
      adjustments: "退款或争议需要财务/信任决策，并且不能改写历史分账。",
      commission: "当前没有可见的有效佣金规则，付费市场账本入账需要运营配置。",
      curation: "市场分发申诉需要审核决定、原因和发布者可见的结果。",
      deliveries: "外部通知投递存在失败、跳过或排队记录，需要重试或处理服务商配置。",
      feedback: "买家反馈正在等待审核，审核后才能成为公开信任信号。",
      identity: "身份目录已有用户但没有管理员信号，上线运营前需要检查访问权限。",
      incidents: "运行事故需要处理严重级别、恢复状态，以及发布者/开发者通知。",
      launchBlocker: "公开上线存在阻断项，必须先清掉再做客户可见发布。",
      launchWarning: "上线就绪存在提醒或延后项，客户演示前需要持续跟踪。",
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

type AdminKpiTone = "danger" | "neutral" | "ready" | "warning";

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
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
      <main className="product-shell">
        <SiteHeader active="admin" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/admin" />

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
      </main>
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
    reviews
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
    getAdminReviews()
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
  const adminKpis: Array<{
    detail: string;
    href: string;
    label: string;
    tone: AdminKpiTone;
    value: string;
  }> = [
    {
      detail: adminConsoleLabels.kpis.revenueDetail,
      href: localizedHref("/admin#admin-finance", locale),
      label: adminConsoleLabels.kpis.revenue,
      tone: "neutral",
      value: formatMoney(financeLedger.summary.grossCents)
    },
    {
      detail: `${formatCompactNumber(reviewMetrics.danger)} / ${formatCompactNumber(reviewMetrics.warning)} / ${formatCompactNumber(reviewMetrics.ready)} ${adminConsoleLabels.kpis.reviewsDetail}`,
      href: localizedHref("/admin#admin-reviews", locale),
      label: adminConsoleLabels.kpis.reviews,
      tone: reviewMetrics.danger > 0 ? "danger" : reviewMetrics.warning > 0 ? "warning" : reviewMetrics.actionable > 0 ? "ready" : "neutral",
      value: formatCompactNumber(reviewMetrics.actionable)
    },
    {
      detail: adminConsoleLabels.kpis.ordersDetail,
      href: localizedHref("/admin#admin-orders", locale),
      label: adminConsoleLabels.kpis.orders,
      tone: orderActionCount > 0 ? "warning" : "ready",
      value: formatCompactNumber(orderActionCount)
    },
    {
      detail: adminConsoleLabels.kpis.moneyDetail,
      href: localizedHref("/admin#admin-payouts", locale),
      label: adminConsoleLabels.kpis.money,
      tone: payoutActionCount + adjustmentActionCount > 0 ? "warning" : "ready",
      value: formatCompactNumber(payoutActionCount + adjustmentActionCount)
    },
    {
      detail: adminConsoleLabels.kpis.riskDetail,
      href: localizedHref("/admin#admin-risk", locale),
      label: adminConsoleLabels.kpis.risk,
      tone: activeIncidentCount + openAbuseReportCount > 0 ? "danger" : pendingFeedbackCount + deliveryActionCount > 0 ? "warning" : "ready",
      value: formatCompactNumber(activeIncidentCount + openAbuseReportCount + pendingFeedbackCount + deliveryActionCount)
    },
    {
      detail: adminConsoleLabels.kpis.trafficDetail,
      href: localizedHref("/admin#admin-traffic", locale),
      label: adminConsoleLabels.kpis.traffic,
      tone: "warning",
      value: adminConsoleLabels.kpis.trafficValue
    }
  ];
  const adminAnalytics = [
    [adminConsoleLabels.analytics.cards.gmv, formatMoney(financeLedger.summary.grossCents)],
    [adminConsoleLabels.analytics.cards.platformRevenue, formatMoney(financeLedger.summary.platformFeeCents)],
    [adminConsoleLabels.analytics.cards.publisherShare, formatMoney(financeLedger.summary.publisherShareCents)],
    [adminConsoleLabels.analytics.cards.availableBalance, formatMoney(financeLedger.summary.availableBalanceCents)],
    [adminConsoleLabels.analytics.cards.usageOrders, formatCompactNumber(financeLedger.summary.usageTransactionCount)],
    [adminConsoleLabels.analytics.cards.subscriptionOrders, formatCompactNumber(financeLedger.summary.subscriptionTransactionCount)]
  ];
  const recentOrderRows = financeLedger.recentTransactions.slice(0, 4);

  return (
    <main className="product-shell admin-console-page">
      <SiteHeader active="admin" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/admin" />

      <section className="admin-console-shell" id="admin-overview" aria-labelledby="admin-console-title">
        <aside className="admin-sidebar" aria-label={locale === "zh" ? "管理员后台导航" : "Admin console navigation"}>
          <div className="admin-sidebar__brand">
            <span aria-hidden="true">SH</span>
            <div>
              <strong>{adminConsoleLabels.shell.eyebrow}</strong>
              <small>{adminConsoleLabels.shell.subtitle}</small>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {adminConsoleLabels.nav.map((group) => (
              <div className="admin-sidebar-nav__group" key={group.label}>
                <span>{group.label}</span>
                {group.items.map(([label, anchor]) => {
                  const Icon = getAdminNavIcon(anchor);

                  return (
                    <a href={localizedHref(`/admin${anchor}`, locale)} key={anchor}>
                      <Icon size={15} aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="admin-sidebar__status">
            <span>{adminConsoleLabels.shell.environment}</span>
            <strong>{launchReadiness.environment.runtime}</strong>
            <small>{launchReadiness.environment.isProductionLike ? "production-like" : "non-production"}</small>
          </div>
        </aside>

        <div className="admin-console-main">
          <header className="admin-console-topbar">
            <div>
              <div className="card-kicker">
                <Activity size={16} aria-hidden="true" />
                <span>{adminConsoleLabels.shell.subtitle}</span>
              </div>
              <h1 id="admin-console-title">{adminConsoleLabels.shell.title}</h1>
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
              <a className="primary-button" href={primaryPriorityItem.href}>
                <span>{adminConsoleLabels.shell.primaryAction}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
          </header>

          <div className="admin-kpi-grid" aria-label={locale === "zh" ? "后台关键指标" : "Admin key metrics"}>
            {adminKpis.map((metric) => (
              <a className={`admin-kpi-card admin-kpi-card--${metric.tone}`} href={metric.href} key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </a>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <article className="admin-priority-panel" id="admin-priority" aria-labelledby="admin-priority-heading">
              <div className="card-kicker">
                <ListChecks size={16} aria-hidden="true" />
                <span>{adminCommandLabels.eyebrow}</span>
              </div>
              <h2 id="admin-priority-heading">{adminCommandLabels.title}</h2>
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
                <div className="card-kicker">
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
                    <a className={`admin-readiness-mini__item admin-readiness-mini__item--${status}`} href={localizedHref("/admin#launch-readiness", locale)} key={status}>
                      <span>{status}</span>
                      <strong>{formatCompactNumber(Number(count))}</strong>
                    </a>
                  ))}
                </div>
              </article>

              <article className="admin-spotlight-card">
                <div className="card-kicker">
                  <ReceiptText size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.spotlight.audit}</span>
                </div>
                <div className="admin-audit-mini">
                  {auditLogs.slice(0, 3).map((log) => (
                    <a href={localizedHref("/admin#admin-audit", locale)} key={log.id}>
                      <strong>{log.action}</strong>
                      <span>{log.reason ?? log.entityType}</span>
                    </a>
                  ))}
                  {auditLogs.length === 0 ? <span>{locale === "zh" ? "暂无审计记录。" : "No audit records yet."}</span> : null}
                </div>
              </article>
            </aside>
          </div>

          <section className="admin-insight-grid" aria-labelledby="admin-analytics-title">
            <article className="admin-analytics-panel">
              <div className="card-kicker">
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

            <article className="admin-order-panel" id="admin-orders">
              <div className="card-kicker">
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
                  <a className="admin-order-row" href={localizedHref("/admin#admin-ledger", locale)} key={transaction.id}>
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
              <div className="card-kicker">
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

          <section className="admin-traffic-panel" id="admin-traffic" aria-labelledby="admin-traffic-title">
            <div className="admin-traffic-panel__head">
              <div>
                <div className="card-kicker">
                  <Activity size={16} aria-hidden="true" />
                  <span>{adminConsoleLabels.traffic.title}</span>
                </div>
                <h2 id="admin-traffic-title">{adminConsoleLabels.traffic.title}</h2>
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

          <section className="console-board admin-access-strip">
            <SessionStatusPanel locale={locale} session={session} />
            <WorkspaceAccessPanel
              locale={locale}
              requiredRoles={adminAccessRoles}
              session={session}
              workspace="admin"
            />
          </section>
        </div>
      </section>

      <section className="admin-evidence-section">
        <OperatingEvidenceChain
          focus="admin"
          locale={locale}
          stats={[
            { label: labels.metrics[0][0], value: formatMoney(financeLedger.summary.grossCents) },
            { label: labels.metrics[2][0], tone: financeLedger.summary.pendingBalanceCents > 0 ? "attention" : "neutral", value: formatMoney(financeLedger.summary.pendingBalanceCents) },
            { label: labels.metrics[3][0], tone: reviewMetrics.actionable > 0 ? "attention" : "good", value: String(reviewMetrics.actionable + activeIncidentCount + pendingFeedbackCount) },
            { label: ops.moneyTitle, value: String(financeLedger.recentTransactions.length) }
          ]}
        />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom" id="launch-readiness">
        <AdminLaunchReadinessPanel locale={locale} readiness={launchReadiness} />
      </section>

      <section className="admin-layout" id="admin-reviews">
        <AdminReviewManager locale={locale} reviews={reviews} />

        <div id="admin-audit">
          <AdminAuditLogPanel locale={locale} logs={auditLogs} />
        </div>
      </section>

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

      <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-deliveries">
        <NotificationDeliveryManager deliveries={notificationDeliveries} locale={locale} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-webhooks">
        <WebhookDeliveryManager deliveries={webhookDeliveries} locale={locale} />
      </section>

      <section className="workspace-ops-layout workspace-ops-layout--bottom" id="admin-templates">
        <NotificationTemplateManager locale={locale} templates={notificationTemplates} />
      </section>

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
          <div className="card-kicker">
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
          <div className="card-kicker">
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

      <section className="workspace-ops-layout" id="admin-finance">
        <article className="ops-panel work-table-panel">
          <div className="card-kicker">
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
    </main>
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
          <div className="card-kicker">
            <LockKeyhole size={16} aria-hidden="true" />
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
          body: "在个人中心确认 reviewer、finance、support、admin 或 super_admin 角色。",
          href: "/account",
          label: "02",
          title: "确认运营角色"
        },
        {
          body: "具备角色后直接打开后台，处理审核、上线就绪、提现、投递和审计。",
          href: "/admin#launch-readiness",
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
        href: "/admin#launch-readiness",
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

function adminAnchor(anchor: string, locale: Locale) {
  return localizedHref(`/admin#${anchor}`, locale);
}

function getAdminNavIcon(anchor: string) {
  switch (anchor) {
    case "#admin-overview":
      return BarChart3;
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
