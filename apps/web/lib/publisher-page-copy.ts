import type { Locale } from "@/lib/i18n";

const publisherPageCopy = {
  en: {
    adjustmentEmpty: "No recent refund or dispute activity",
    adjustmentHeaders: ["Type", "Skill", "Project", "Amount", "Status"],
    adjustmentTitle: "Refund and dispute watch",
    disputeReview: "Dispute review",
    description:
      "A focused workspace for skill publishers to move packages through review, record pricing intent for future paid-marketplace review, respond to buyer demand, and prepare paid-marketplace readiness information.",
    eyebrow: "Publisher workspace",
    lockedDescription:
      "Sign in with a publisher, owner, or admin role before saving drafts, submitting reviews, recording paid-readiness information, and managing buyer or feedback work.",
    lockedTitle: "Enter the publisher workspace after sign-in.",
    ledgerEmpty: "No posted paid-marketplace ledger rows yet",
    ledgerHeaders: ["Skill", "Source", "Gross", "Fee", "Net", "Status"],
    ledgerTitle: "Publisher paid-marketplace ledger preview",
    refundReview: "Refund review",
    sourceMixTitle: "Paid marketplace source mix",
    sourceShareLabel: "publisher share",
    sourceTransactionLabel: "transactions",
    unknownProject: "unknown-project",
    workspaceFlow: {
      account: {
        label: "Account setup flow",
        steps: [
          ["Profile", "Set the public publisher name buyers see.", "Profile"],
          [
            "Terms",
            "Accept the current operating terms before paid publishing.",
            "Terms",
          ],
          [
            "Receiving account",
            "Submit Stripe Connect details for finance review.",
            "Payout",
          ],
          [
            "Finance review",
            "Watch verification state before payouts can move.",
            "Review",
          ],
        ],
      },
      demand: {
        inboxTitle: "View notification inbox",
        label: "Demand response flow",
        preferencesTitle: "Tune notification preferences",
        requestsTitle: "Handle buyer requests",
        steps: [
          [
            "Buyer demand",
            "Review open publisher requests and assign the next response.",
            "Requests",
          ],
          [
            "Notifications",
            "Read workspace alerts tied to buyer or finance activity.",
            "Inbox",
          ],
          [
            "Preferences",
            "Keep routing rules current so demand reaches the right people.",
            "Routing",
          ],
        ],
      },
      payout: {
        label: "Payout flow",
        steps: [
          [
            "Commercial readiness",
            "Clear profile, terms, review, and paid-marketplace blockers.",
            "Ready",
          ],
          [
            "Revenue balance",
            "Check matured, pending, blocked, and paid balances.",
            "Balance",
          ],
          [
            "Payout request",
            "Request finance review when all readiness gates are clear.",
            "Request",
          ],
          [
            "Latest records",
            "Review the newest payout, refund, and dispute outcomes.",
            "Records",
          ],
        ],
      },
      skills: {
        label: "Skill submission flow",
        steps: [
          [
            "Choose skill",
            "Pick the listing with review or launch work first.",
            "Select",
          ],
          [
            "Fix review",
            "Repair checks, version notes, or review blockers.",
            "Repair",
          ],
          [
            "Submit review",
            "Send the exact version back into the review queue.",
            "Submit",
          ],
          [
            "Commercial setup",
            "Confirm paid-marketplace readiness and pricing intent.",
            "Price",
          ],
        ],
      },
      states: {
        blocked: "Blocked",
        current: "Next",
        done: "Done",
        monitor: "Monitor",
        ready: "Ready",
      },
    },
    adjustmentTypes: {
      dispute: "Dispute",
      refund: "Refund",
    },
    commercial: {
      actionLabels: {
        current_terms: "Accept the latest terms version",
        payout: "Complete paid-readiness review",
        publisher_profile: "Create the publisher profile",
        publisher_status: "Reactivate the publisher profile",
        review: "Pass review for this skill",
        terms: "Accept publisher operating terms",
      },
      blocked: "Blocked",
      blockedSkillsTitle: "Paid marketplace blockers",
      description:
        "A single operating view for the review, terms, paid-readiness information, and pricing-intent gates that prepare a listing for future paid-marketplace review.",
      empty:
        "No paid-marketplace blockers are visible for the current publisher scope.",
      metrics: {
        blockedPaid: "Blocked paid-marketplace listings",
        draftPaid: "Draft paid prices",
        payout: "Paid-readiness review",
        readyPaid: "Ready paid-marketplace listings",
      },
      profile: "Publisher profile",
      ready: "Ready",
      rows: {
        price: "Price",
        review: "Review",
        skill: "Skill",
        task: "Next action",
      },
      states: {
        active: "Active",
        approved: "Approved",
        archived: "Archived",
        blocked: "Blocked",
        draft: "Draft",
        free: "Free",
        in_review: "In review",
        notConfigured: "Not configured",
        not_configured: "Not configured",
        pending: "Pending",
        per_call: "Per call",
        queued: "Queued",
        rejected: "Rejected",
        restricted: "Restricted",
        suspended: "Suspended",
        subscription: "Subscription",
        verification_required: "Verification required",
        verified: "Verified",
      },
      terms: "Terms",
      title: "Paid marketplace readiness",
    },
    disputeStatuses: {
      lost: "Lost",
      open: "Open",
      warning_needs_response: "Needs response",
      won: "Won",
    },
    ledgerStatuses: {
      available: "Available",
      blocked: "Blocked",
      pending: "Pending",
      posted: "Posted",
      released: "Released",
      reserved: "Reserved",
    },
    ledgerSources: {
      adjustment: "Adjustment",
      refund: "Refund",
      subscription: "Subscription",
      unknown: "Ledger",
      usage: "Usage",
    },
    refundStatuses: {
      approved: "Approved",
      failed: "Failed",
      posted: "Posted",
      rejected: "Rejected",
      requested: "Requested",
    },
    metrics: {
      available: "Paid marketplace balance",
      demand: "Open demand",
      skills: "Owned skills",
      verified: "Verified skills",
    },
    readiness: {
      blocked: "Waiting",
      current: "Next",
      done: "Done",
      progress: "readiness",
      title: "Publisher launch checklist",
      tasks: {
        session: [
          "Sign in with workspace session",
          "Sign in with an organization session so publishing, pricing intent, paid-readiness information, and notifications are scoped.",
        ],
        profile: [
          "Create publisher profile",
          "Set the public publisher name buyers will see before they install a skill.",
        ],
        terms: [
          "Accept operating terms",
          "Record the current refund, dispute, takedown, data, notification, and paid-marketplace readiness policy before paid publishing.",
        ],
        publish: [
          "Publish your first skill",
          "Submit a manifest and move it into review from the publisher skill operations panel.",
        ],
        verified: [
          "Reach verified listing status",
          "Complete review before buyers can trust and adopt the skill.",
        ],
        payout: [
          "Prepare paid-marketplace readiness information",
          "Record receiving details for future finance review before any public paid rollout.",
        ],
      },
    },
    title: "Manage skill submissions and review readiness.",
  },
  zh: {
    adjustmentEmpty: "暂无近期退款或争议记录",
    adjustmentHeaders: ["类型", "技能", "项目", "金额", "状态"],
    adjustmentTitle: "退款与争议跟进",
    disputeReview: "争议复核",
    description:
      "给技能发布者使用的运营工作台：推进技能审核、记录未来付费市场复核所需的定价意图、响应买方需求，并准备付费市场准备信息。",
    eyebrow: "发布者工作台",
    ledgerEmpty: "暂无已入账的付费预览账本记录",
    ledgerHeaders: ["技能", "来源", "预览总额", "平台费", "发布者份额", "状态"],
    ledgerTitle: "发布者付费市场账本预览",
    refundReview: "退款复核",
    sourceMixTitle: "付费预览来源结构",
    sourceShareLabel: "发布者分成",
    sourceTransactionLabel: "笔交易",
    unknownProject: "未知项目",
    workspaceFlow: {
      account: {
        label: "账号设置流程",
        steps: [
          ["资料", "设置买家会看到的公开发布者名称。", "资料"],
          ["条款", "付费发布前接受当前运营条款。", "条款"],
          ["收款账号", "提交 PayPal 或 Alipay 收款资料给财务复核。", "收款"],
          ["财务审核", "关注验证状态，确认后才能打款。", "审核"],
        ],
      },
      demand: {
        inboxTitle: "查看通知",
        label: "需求响应流程",
        preferencesTitle: "调整通知偏好",
        requestsTitle: "处理买家需求",
        steps: [
          ["买方需求", "查看开放的发布者请求，并确定下一步响应。", "需求"],
          ["通知", "读取和买方或财务动作相关的工作区提醒。", "通知"],
          ["偏好", "保持通知路由正确，让需求到达对应负责人。", "路由"],
        ],
      },
      payout: {
        label: "收款流程",
        steps: [
          ["商业准备", "清理资料、条款、审核和付费预览阻断。", "准备"],
          ["收入余额", "查看已成熟、待成熟、锁定和已打款余额。", "余额"],
          ["提现请求", "所有门禁通过后申请财务复核。", "申请"],
          ["最新记录", "查看最近打款、退款和争议结果。", "记录"],
        ],
      },
      skills: {
        label: "技能提交流程",
        steps: [
          ["选择技能", "先处理有审核或上线工作的技能。", "选择"],
          ["修复审核", "修复检查、版本说明或审核阻断。", "修复"],
          ["提交审核", "把明确版本重新送入审核队列。", "提交"],
          ["商业设置", "确认付费预览准备和定价意图。", "定价"],
        ],
      },
      states: {
        blocked: "阻塞",
        current: "下一步",
        done: "完成",
        monitor: "监控",
        ready: "就绪",
      },
    },
    adjustmentTypes: {
      dispute: "争议",
      refund: "退款",
    },
    commercial: {
      actionLabels: {
        current_terms: "接受最新条款版本",
        payout: "完成付费准备复核",
        publisher_profile: "创建发布者资料",
        publisher_status: "恢复发布者资料",
        review: "让该技能通过审核",
        terms: "接受发布者运营条款",
      },
      blocked: "受阻",
      blockedSkillsTitle: "付费预览阻塞项",
      description:
        "集中查看审核、条款、付费准备和定价意图，为未来付费市场复核做准备。",
      empty: "当前发布者范围内没有可见的付费预览阻塞项。",
      metrics: {
        blockedPaid: "受阻付费预览技能",
        draftPaid: "草稿付费价格",
        payout: "付费准备复核",
        readyPaid: "可复核付费预览技能",
      },
      profile: "发布者资料",
      ready: "已就绪",
      rows: {
        price: "价格",
        review: "审核",
        skill: "技能",
        task: "下一步",
      },
      states: {
        active: "启用",
        approved: "已批准",
        archived: "归档",
        blocked: "受阻",
        draft: "草稿",
        free: "免费",
        in_review: "审核中",
        notConfigured: "未配置",
        not_configured: "未配置",
        pending: "待处理",
        per_call: "按次调用",
        queued: "排队中",
        rejected: "已拒绝",
        restricted: "受限",
        suspended: "已暂停",
        subscription: "订阅",
        verification_required: "需要验证",
        verified: "已验证",
      },
      terms: "条款",
      title: "付费市场就绪",
    },
    disputeStatuses: {
      lost: "已败诉",
      open: "处理中",
      warning_needs_response: "需要响应",
      won: "已胜诉",
    },
    ledgerStatuses: {
      available: "付费预览可用",
      blocked: "已锁定",
      pending: "待结算",
      posted: "已入账",
      released: "已释放",
      reserved: "已预留",
    },
    ledgerSources: {
      adjustment: "调整",
      refund: "退款",
      subscription: "订阅",
      unknown: "账本",
      usage: "调用",
    },
    refundStatuses: {
      approved: "已批准",
      failed: "失败",
      posted: "已入账",
      rejected: "已拒绝",
      requested: "已申请",
    },
    metrics: {
      available: "付费预览余额",
      demand: "开放需求",
      skills: "我的技能",
      verified: "已验证技能",
    },
    lockedDescription:
      "请先登录已开通发布权限的账号，再保存草稿、提交审核、补充付费准备，并处理买家需求或反馈。",
    lockedTitle: "登录后进入发布者工作台。",
    readiness: {
      blocked: "等待",
      current: "下一步",
      done: "完成",
      progress: "准备度",
      title: "发布者上线清单",
      tasks: {
        session: [
          "登录工作区会话",
          "使用组织会话登录，让发布、定价意图、付费准备和通知都归属到当前组织。",
        ],
        profile: [
          "创建发布者资料",
          "设置买家安装技能前会看到的公开发布者名称。",
        ],
        terms: [
          "接受运营条款",
          "在付费发布前记录当前退款、争议、下架、数据、通知和付费市场准备政策。",
        ],
        publish: [
          "发布第一个技能",
          "提交 manifest，并在发布者技能运营面板里推进审核。",
        ],
        verified: [
          "获得已验证上架状态",
          "完成审核后，买家才可以信任并采用技能。",
        ],
        payout: [
          "准备付费市场准备信息",
          "在公开付费市场上线前，记录后续财务复核需要的收款资料。",
        ],
      },
    },
    title: "管理技能提交和审核准备。",
  },
} as const;

export type PublisherPageCopy = (typeof publisherPageCopy)[Locale];

export function getPublisherPageCopy(locale: Locale): PublisherPageCopy {
  return publisherPageCopy[locale];
}
