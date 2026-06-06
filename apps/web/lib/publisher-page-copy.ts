import type { Locale } from "@/lib/i18n";

const publisherPageCopy = {
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
        session: [
          "Connect workspace session",
          "Sign in with an organization session so publishing, pricing, payouts, and notifications are scoped."
        ],
        profile: ["Create publisher profile", "Set the public publisher name buyers will see before they install a skill."],
        terms: [
          "Accept operating terms",
          "Record the current refund, dispute, takedown, data, notification, and payout policy before paid publishing."
        ],
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
        session: ["连接工作区会话", "使用组织会话登录，让发布、定价、提现和通知都归属到当前组织。"],
        profile: ["创建发布者资料", "设置买家安装技能前会看到的公开发布者名称。"],
        terms: ["接受运营条款", "在付费发布前记录当前退款、争议、下架、数据、通知和提现政策。"],
        publish: ["发布第一个技能", "提交 manifest，并在发布者技能运营面板里推进审核。"],
        verified: ["获得已验证上架状态", "完成审核并启用价格，让买家可以信任并安装技能。"],
        payout: ["准备提现资料", "在收入成熟并发起提现前，先完成提现账户和资料状态。"]
      }
    },
    title: "运营你的 SkillHub 技能发布业务。"
  }
} as const;

export type PublisherPageCopy = (typeof publisherPageCopy)[Locale];

export function getPublisherPageCopy(locale: Locale): PublisherPageCopy {
  return publisherPageCopy[locale];
}
