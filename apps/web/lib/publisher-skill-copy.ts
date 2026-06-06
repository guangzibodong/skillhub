import type { Locale } from "@/lib/i18n";

const publisherSkillCopy = {
  en: {
    billingModel: "Billing model",
    billingModels: {
      free: "Free",
      per_call: "Per call",
      subscription: "Subscription"
    },
    calls: "Calls",
    checks: "Review checks",
    checkLabels: {
      example: "Example",
      manifest: "Manifest",
      runtime: "Runtime",
      security: "Security"
    },
    checkStatusLabels: {
      failed: "Failed",
      passed: "Passed",
      queued: "Queued",
      running: "Running",
      warning: "Warning"
    },
    currency: "Currency",
    empty: "No publisher skills yet. Publish a manifest first, then return here to submit review and set pricing.",
    feedback: "Published / pending",
    installs: "Installs",
    nextStep: {
      title: "Next operating step",
      curation: "Request distribution review after quality gaps are fixed.",
      feedback: "Respond to published buyer feedback to improve trust.",
      pricing: "Resolve paid activation blockers before activating paid pricing.",
      review: "Submit an exact version for review.",
      runtime: "Resolve failed checks or document warnings before review can close.",
      verified: "Monitor installs, calls, buyer demand, revenue, and payouts.",
      version: "Create a semantic version from the saved draft."
    },
    reviewRepair: {
      actions: "Repair actions",
      actionLabels: {
        clarify_risk: "Document high-risk permission rationale",
        complete_commercial: "Clear paid activation blockers",
        create_version: "Create a new semantic version",
        fix_checks: "Fix failed checks or document warnings",
        monitor: "Monitor operations",
        resubmit_version: "Submit the fixed version",
        submit_version: "Submit exact version",
        wait_review: "Wait for reviewer decision"
      },
      checkEvidence: "Automated check evidence",
      nextAction: "Next action",
      targetField: "Target",
      checkSummary: {
        failed: "failed",
        open: "open",
        passed: "passed",
        warning: "warning"
      },
      decided: "Decision",
      queueAge: "Queue age",
      latestVersion: "Latest version",
      noNotes: "No reviewer notes yet. The version can still be prepared, submitted, or monitored from this workspace.",
      notes: "Reviewer notes",
      notDecided: "Pending",
      sla: "Review SLA",
      slaStatuses: {
        decided: "Decided",
        due_soon: "Due soon",
        not_submitted: "Not submitted",
        on_track: "On track",
        overdue: "Overdue"
      },
      submitted: "Submitted",
      title: "Review repair loop"
    },
    priceStatus: "Price status",
    priceStatuses: {
      active: "Active",
      archived: "Archived",
      draft: "Draft"
    },
    quality: "Quality",
    rating: "Rating",
    reviewStatuses: {
      approved: "Approved",
      blocked: "Blocked",
      in_review: "In review",
      no_review: "No review",
      queued: "Queued",
      rejected: "Rejected"
    },
    savePrice: "Save price",
    saving: "Saving",
    submitReview: "Submit review",
    submitting: "Submitting",
    successRate: "Success",
    title: "Publisher skill operations",
    unitAmount: "Unit amount (cents)",
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    },
    versions: {
      calls: "calls",
      created: "Created",
      draftHelp: "Save a new semantic version or update an unlocked draft. Approved or installed versions are locked.",
      editorLabel: "Editable manifest",
      editorTitle: "Create or update a version",
      history: "Version history",
      installs: "installs",
      locked: "Locked after review or installs",
      reviewSla: "Review SLA",
      reviewNotes: "Review notes",
      save: "Save version",
      saving: "Saving version",
      submit: "Submit this version",
      title: "Version manager",
      versionCount: "versions",
      statuses: {
        draft: "Draft",
        rejected: "Rejected",
        submitted: "Submitted",
        suspended: "Suspended",
        verified: "Verified"
      }
    }
  },
  zh: {
    billingModel: "计费模式",
    billingModels: {
      free: "免费",
      per_call: "按次调用",
      subscription: "订阅"
    },
    calls: "调用",
    checks: "审核检查",
    checkLabels: {
      example: "示例",
      manifest: "Manifest",
      runtime: "运行时",
      security: "安全"
    },
    checkStatusLabels: {
      failed: "失败",
      passed: "通过",
      queued: "排队",
      running: "运行中",
      warning: "警告"
    },
    currency: "币种",
    empty: "还没有发布者技能。先发布一个 manifest，然后回到这里提交审核并设置价格。",
    feedback: "已公开 / 待审核",
    installs: "安装",
    nextStep: {
      title: "下一步运营动作",
      curation: "质量问题修复后，申请市场分发复审。",
      feedback: "回复已公开买家反馈，提升买家信任。",
      pricing: "先解决付费激活阻塞项，再启用付费价格。",
      review: "提交一个准确的语义版本进入审核。",
      runtime: "\u4fee\u590d\u5931\u8d25\u68c0\u67e5\uff0c\u6216\u8865\u5145\u8b66\u544a\u9879\u8bf4\u660e\u540e\u518d\u5b8c\u6210\u5ba1\u6838\u3002",
      verified: "继续监控安装、调用、买方需求、收入和提现。",
      version: "从已保存草稿创建语义版本。"
    },
    reviewRepair: {
      actions: "\u4fee\u590d\u52a8\u4f5c",
      actionLabels: {
        clarify_risk: "\u8865\u5145\u9ad8\u98ce\u9669\u6743\u9650\u8bf4\u660e",
        complete_commercial: "\u6e05\u7406\u4ed8\u8d39\u6fc0\u6d3b\u963b\u585e",
        create_version: "\u521b\u5efa\u65b0\u7684\u8bed\u4e49\u7248\u672c",
        fix_checks: "\u4fee\u590d\u5931\u8d25\u68c0\u67e5\u6216\u8865\u5145\u8b66\u544a\u8bf4\u660e",
        monitor: "\u6301\u7eed\u76d1\u63a7\u8fd0\u8425",
        resubmit_version: "\u63d0\u4ea4\u4fee\u590d\u540e\u7248\u672c",
        submit_version: "\u63d0\u4ea4\u51c6\u786e\u7248\u672c",
        wait_review: "\u7b49\u5f85\u5ba1\u6838\u51b3\u5b9a"
      },
      checkEvidence: "\u81ea\u52a8\u68c0\u67e5\u8bc1\u636e",
      nextAction: "\u4e0b\u4e00\u6b65",
      targetField: "\u5b57\u6bb5",
      checkSummary: {
        failed: "\u5931\u8d25",
        open: "\u672a\u5b8c\u6210",
        passed: "\u901a\u8fc7",
        warning: "\u8b66\u544a"
      },
      decided: "\u51b3\u5b9a",
      queueAge: "\u6392\u961f\u65f6\u957f",
      latestVersion: "\u6700\u65b0\u7248\u672c",
      noNotes: "\u6682\u65e0\u5ba1\u6838\u5907\u6ce8\u3002\u4f60\u4ecd\u7136\u53ef\u4ee5\u5728\u8fd9\u91cc\u51c6\u5907\u7248\u672c\u3001\u63d0\u4ea4\u5ba1\u6838\u6216\u76d1\u63a7\u8fd0\u8425\u3002",
      notes: "\u5ba1\u6838\u5907\u6ce8",
      notDecided: "\u5f85\u51b3\u5b9a",
      sla: "\u5ba1\u6838 SLA",
      slaStatuses: {
        decided: "\u5df2\u51b3\u5b9a",
        due_soon: "\u5373\u5c06\u5230\u671f",
        not_submitted: "\u672a\u63d0\u4ea4",
        on_track: "\u6b63\u5e38",
        overdue: "\u5df2\u8d85\u671f"
      },
      submitted: "\u63d0\u4ea4\u65f6\u95f4",
      title: "\u5ba1\u6838\u4fee\u590d\u95ed\u73af"
    },
    priceStatus: "价格状态",
    priceStatuses: {
      active: "启用",
      archived: "归档",
      draft: "草稿"
    },
    quality: "质量",
    rating: "评分",
    reviewStatuses: {
      approved: "已批准",
      blocked: "已阻塞",
      in_review: "审核中",
      no_review: "未提交审核",
      queued: "排队中",
      rejected: "已拒绝"
    },
    savePrice: "保存价格",
    saving: "保存中",
    submitReview: "提交审核",
    submitting: "提交中",
    successRate: "成功率",
    title: "发布者技能运营",
    unitAmount: "单价（分）",
    verificationStatuses: {
      deprecated: "已废弃",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    },
    versions: {
      calls: "次调用",
      created: "创建时间",
      draftHelp: "保存新的语义版本，或更新尚未审核/安装的草稿版本。已审核或已安装版本会被锁定。",
      editorLabel: "可编辑 manifest",
      editorTitle: "创建或更新版本",
      history: "版本历史",
      installs: "次安装",
      locked: "审核或安装后锁定",
      reviewSla: "审核 SLA",
      reviewNotes: "审核备注",
      save: "保存版本",
      saving: "保存版本中",
      submit: "提交该版本",
      title: "版本管理",
      versionCount: "个版本",
      statuses: {
        draft: "草稿",
        rejected: "已拒绝",
        submitted: "已提交",
        suspended: "已暂停",
        verified: "已验证"
      }
    }
  }
} as const;

const marketplaceCopy = {
  en: {
    activeAppeal: "Latest review request",
    appealReason: "Review note",
    appealStatuses: {
      approved: "Approved",
      closed: "Closed",
      open: "Open",
      rejected: "Rejected",
      under_review: "Under review"
    },
    evidenceUrl: "Evidence URL",
    expires: "Expires",
    hintLabels: {
      collect_feedback: "Collect published feedback",
      drive_first_installs: "Drive first installs",
      eligible_for_distribution: "Eligible for stronger distribution",
      fix_runtime_checks: "Fix failed review checks",
      maintain_quality: "Maintain quality signals",
      make_public: "Make listing public",
      moderate_feedback: "Clear pending feedback",
      raise_success_rate: "Raise runtime success rate",
      resolve_incidents: "Resolve open incidents",
      stabilize_runtime: "Stabilize runtime checks",
      submit_review: "Submit for review"
    },
    marketplace: "Marketplace distribution",
    placementLabels: {
      featured: "Featured",
      standard: "Standard",
      suppressed: "Suppressed"
    },
    reasonPlaceholder: "Summarize fixes, new evidence, buyer demand, or why the listing deserves reconsideration.",
    requestReview: "Request review",
    requestedPlacement: "Requested placement",
    requesting: "Requesting"
  },
  zh: {
    activeAppeal: "最新复审申请",
    appealReason: "复审说明",
    appealStatuses: {
      approved: "已通过",
      closed: "已关闭",
      open: "已提交",
      rejected: "已拒绝",
      under_review: "复审中"
    },
    evidenceUrl: "证据链接",
    expires: "到期",
    hintLabels: {
      collect_feedback: "获取已公开反馈",
      drive_first_installs: "推动首批安装",
      eligible_for_distribution: "可获得更强分发",
      fix_runtime_checks: "修复失败的审核检查",
      maintain_quality: "继续保持质量信号",
      make_public: "将技能设为公开",
      moderate_feedback: "处理待审核反馈",
      raise_success_rate: "提高运行成功率",
      resolve_incidents: "解决未关闭事故",
      stabilize_runtime: "稳定运行检查",
      submit_review: "提交审核"
    },
    marketplace: "市场分发",
    placementLabels: {
      featured: "精选",
      standard: "标准",
      suppressed: "降权"
    },
    reasonPlaceholder: "说明修复内容、新证据、买方需求，或为什么值得重新评估。",
    requestReview: "申请复审",
    requestedPlacement: "目标分发",
    requesting: "提交中"
  }
} as const;

const feedbackResponseCopy = {
  en: {
    buyer: "Buyer",
    empty: "No published buyer feedback is ready for a publisher response yet.",
    project: "Project",
    publisherResponse: "Publisher response",
    recentFeedback: "Recent buyer feedback",
    responsePlaceholder: "Respond with the fix, roadmap note, support guidance, or contract clarification buyers should see.",
    responded: "Responded",
    saveResponse: "Save response",
    savingResponse: "Saving",
    useCase: "Use case"
  },
  zh: {
    buyer: "买方",
    empty: "暂时没有可回复的公开买家反馈。",
    project: "项目",
    publisherResponse: "发布者回复",
    recentFeedback: "最近买家反馈",
    responsePlaceholder: "说明修复进展、路线图、支持建议，或买家需要看到的协议澄清。",
    responded: "已回复",
    saveResponse: "保存回复",
    savingResponse: "保存中",
    useCase: "使用场景"
  }
} as const;

export type PublisherSkillCopy = (typeof publisherSkillCopy)[Locale];
export type PublisherMarketplaceCopy = (typeof marketplaceCopy)[Locale];
export type PublisherFeedbackResponseCopy = (typeof feedbackResponseCopy)[Locale];

export function getPublisherSkillCopy(locale: Locale): PublisherSkillCopy {
  return publisherSkillCopy[locale];
}

export function getPublisherMarketplaceCopy(locale: Locale): PublisherMarketplaceCopy {
  return marketplaceCopy[locale];
}

export function getPublisherFeedbackResponseCopy(locale: Locale): PublisherFeedbackResponseCopy {
  return feedbackResponseCopy[locale];
}
