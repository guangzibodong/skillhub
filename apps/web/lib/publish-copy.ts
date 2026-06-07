import type { Locale } from "@/lib/i18n";

type WidenCopy<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly [infer First, infer Second]
        ? readonly [WidenCopy<First>, WidenCopy<Second>]
        : T extends readonly (infer Item)[]
          ? readonly WidenCopy<Item>[]
          : T extends object
            ? { [Key in keyof T]: WidenCopy<T[Key]> }
            : T;

export type PublishCopy = WidenCopy<(typeof publishCopy)["en"]>;
export type PublishPageCopy = PublishCopy["page"];
export type PublishFormCopy = PublishCopy["form"];

const publishCopy = {
  en: {
    page: {
      badge: "skillhub.json",
      consoleSubtitle: "publish console",
      description:
        "Package a capability into a governed SkillHub contract. Save the draft first, then continue through version review, runtime evidence, pricing, and payout readiness.",
      eyebrow: "Publisher workflow",
      pipelineBody:
        "A marketplace listing is only trusted after the contract becomes draft state, version state, review state, runtime-check state, and commercial-readiness state.",
      pipelineEyebrow: "Operating pipeline",
      pipelineTitle: "Upload is the first control point, not the finish line.",
      publisherWorkspace: "Publisher workspace",
      signalLabel: "Publishing operating signals",
      signals: [
        ["Draft", "Org-scoped"],
        ["Review", "Automated gates"],
        ["Runtime", "Policy evidence"],
        ["Paid", "Terms and payout"]
      ],
      title: "Register a skill package.",
      pipelineSteps: [
        {
          body: "Start from a skillhub.json contract with identity, runtime, permissions, schemas, examples, and support paths.",
          title: "Paste manifest"
        },
        {
          body: "Catch malformed JSON, missing contract fields, insecure endpoints, sparse schemas, and high-risk permissions.",
          title: "Run preflight"
        },
        {
          body: "Create or update the organization-scoped draft through the signed-in SkillHub user session.",
          title: "Save draft"
        },
        {
          body: "Choose the exact semantic version that should enter human review from the publisher workspace.",
          title: "Submit version"
        },
        {
          body: "Manifest, runtime, example, and security checks become reviewer and publisher evidence.",
          title: "Automated checks"
        },
        {
          body: "Verified listings require approved review records and acceptable automated check results.",
          title: "Reviewer decision"
        },
        {
          body: "Paid activation waits for verified review, active terms, pricing, commission, and payout readiness.",
          title: "Commercial readiness"
        }
      ]
    },
    form: {
      access: {
        api: "Registry API",
        body: "Publishing uses the httpOnly user session created by login. No raw admin, service, OAuth, webhook, or user token is collected in this form.",
        session: "Signed-in user session",
        sessionDetail: "Publisher, owner, admin, or super admin role required",
        title: "Self-service publisher access"
      },
      action: {
        draftButton: "Save draft",
        saving: "Saving draft",
        blocked: "Fix blockers before saving this draft",
        ready: "Draft can be saved; formal review continues in /publisher"
      },
      checks: {
        commercial: {
          action: "Continue through terms, payout readiness, pricing, and commission gates after the draft is saved.",
          detail: "Paid activation later requires verified review, accepted terms, active pricing, commission rule, and payout readiness.",
          label: "Commercial readiness"
        },
        identity: {
          action: "Add every package identity field reviewers need before a version can be trusted.",
          detail: "Requires schemaVersion 0.1, valid slug, semver version, display name, description, and tags.",
          label: "Package identity",
          ok: "schemaVersion, slug, version, description, and tags are reviewable.",
          short: "Identity is valid, but the marketplace description is short for review."
        },
        permissions: {
          action: "Declare least-privilege access, remove wildcard secrets, and expect owner approval for high-risk scope.",
          detail: "{filesystem} filesystem, {secrets} secret handles.",
          highRisk: "High-risk permission declared; reviewer notes and owner approval will be required.",
          invalidSecrets: "Secret handles must be explicit; blank or wildcard secret access is not allowed.",
          label: "Permissions scoped",
          missing: "Declare network, browser, filesystem, and secrets permissions."
        },
        runtime: {
          action: "Use a hardened HTTPS HTTP/MCP endpoint or prepare local-runtime evidence for human review.",
          fallback: "Requires HTTP entrypoint, MCP serverUrl, or local command.",
          insecure: "Runtime URL is valid but not HTTPS; transport hardening should happen before review.",
          label: "Runtime declared",
          local: "Local runtime requires human sandboxing, packaging, and execution-evidence review.",
          ok: "{runtime} runtime uses a valid HTTPS endpoint."
        },
        schemas: {
          action: "Attach object input/output schemas with concrete fields so agents know what to send and expect.",
          detail: "inputSchema and outputSchema must both be object schemas.",
          empty: "Schemas are objects, but fields are sparse; add concrete properties before review.",
          label: "Schemas attached",
          ok: "Input and output object schemas include concrete fields."
        },
        validJson: {
          action: "Fix syntax first; SkillHub cannot create registry state from an unparseable contract.",
          fail: "Fix JSON syntax before saving.",
          label: "Valid JSON",
          ok: "Parser ready."
        }
      },
      editorHintInvalid: "Invalid JSON",
      editorHintValid: "Valid JSON",
      evidencePacket: {
        body: "This is the secret-safe packet a publisher can reason about before submitting the exact version for platform review.",
        commercial: "Commercial gate",
        identity: "Identity",
        permissions: "Permissions",
        risk: "Risk",
        reviewGate: "Review gate",
        runtime: "Runtime",
        schemas: "Schema fields",
        secrets: "Secret handles",
        title: "Reviewer evidence packet"
      },
      manifestLabel: "skillhub.json",
      nextActionsTitle: "Next operating steps",
      nextActions: [
        ["Draft", "Save the contract as organization-owned registry state."],
        ["Version", "Create or submit an exact semantic version from /publisher."],
        ["Review", "Resolve automated check warnings before approval."],
        ["Pricing", "Activate paid pricing only after review, terms, and payout readiness."]
      ],
      readiness: {
        blocked: "Blocked",
        blockers: "Blockers",
        countsLabel: "Preflight check counts",
        label: "Preflight readiness",
        passed: "Passed",
        ready: "Ready for draft save",
        warning: "Needs review attention",
        warnings: "Warnings"
      },
      repairQueue: {
        blocker: "Blocker",
        body: "Resolve blockers before saving. Warnings can be saved as draft, but they become reviewer evidence and may require notes.",
        emptyBody: "Only commercial readiness remains after draft save; continue in the publisher workspace for terms, pricing, payout, and review.",
        emptyTitle: "No manifest blockers",
        target: "Target",
        title: "Preflight repair queue",
        warning: "Warning"
      },
      result: {
        detail: "View public detail",
        errorTitle: "Draft was not saved",
        publisher: "Open publisher workspace",
        successBody:
          "Continue in the publisher workspace to submit a reviewed version, set pricing, and complete commercial readiness.",
        successTitle: "Draft saved to the registry"
      },
      reviewBody: "Client preflight is advisory evidence for the publisher. It is not a verified review decision.",
      reviewTitle: "Manifest preflight",
      risk: {
        high: "High",
        label: "Risk",
        low: "Low",
        medium: "Medium"
      },
      summary: {
        package: "Package",
        runtime: "Runtime",
        slug: "Slug",
        tags: "Tags",
        version: "Version"
      },
      unknown: "unknown",
      untitledSkill: "Untitled skill"
    },
    action: {
      invalidManifest: "Manifest JSON is invalid.",
      missingManifest: "Paste a SkillHub manifest before saving a draft.",
      missingToken: "Sign in with a publisher, owner, or admin user session before publishing a skill.",
      publishedPrefix: "Draft saved",
      publishedSuffix: "It is ready for version submission and publisher operations.",
      unableToPublish: "Unable to save skill draft."
    }
  },
  zh: {
    page: {
      badge: "skillhub.json",
      consoleSubtitle: "发布控制台",
      description:
        "把一个 AI 能力打包成可治理的 SkillHub 协议。先保存草稿，再进入版本审核、运行证据、定价和提现准备。",
      eyebrow: "发布者工作流",
      pipelineBody:
        "一个市场上架项只有进入草稿状态、版本状态、审核状态、运行检查状态和商业准备状态后，才算可信供应。",
      pipelineEyebrow: "运营流水线",
      pipelineTitle: "上传只是第一个控制点，不是结束。",
      publisherWorkspace: "发布者工作台",
      signalLabel: "发布运营信号",
      signals: [
        ["草稿", "组织隔离"],
        ["审核", "自动闸口"],
        ["运行", "策略证据"],
        ["付费", "条款和提现"]
      ],
      title: "注册一个技能包。",
      pipelineSteps: [
        {
          body: "从包含身份、运行时、权限、schema、示例和支持路径的 skillhub.json 开始。",
          title: "粘贴 manifest"
        },
        {
          body: "提前发现 JSON、必填协议字段、端点安全、schema 质量和高风险权限问题。",
          title: "执行预检"
        },
        {
          body: "通过当前登录的 SkillHub 用户会话，把草稿创建或更新到组织下面。",
          title: "保存草稿"
        },
        {
          body: "在发布者工作台选择准确的语义版本，进入人工审核。",
          title: "提交版本"
        },
        {
          body: "Manifest、运行时、示例和安全检查会成为审核员和发布者共同看到的证据。",
          title: "自动检查"
        },
        {
          body: "Verified 上架需要审核记录通过，并且自动检查结果可接受。",
          title: "审核决策"
        },
        {
          body: "付费激活需要审核、条款、定价、分佣规则和提现状态全部就绪。",
          title: "商业准备"
        }
      ]
    },
    form: {
      access: {
        api: "注册表 API",
        body: "发布动作使用登录后创建的 httpOnly 用户会话。本表单不会收集原始管理员 token、服务 token、OAuth 密钥、Webhook 密钥或用户 token。",
        session: "当前登录用户会话",
        sessionDetail: "需要发布者、owner、admin 或 super admin 权限",
        title: "发布者自助访问"
      },
      action: {
        blocked: "先修复阻塞项，再保存草稿",
        draftButton: "保存草稿",
        ready: "可以保存草稿；正式审核在 /publisher 继续",
        saving: "保存草稿中"
      },
      checks: {
        commercial: {
          action: "草稿保存后继续完成条款、提现准备、定价和分佣规则闸口。",
          detail: "后续付费激活需要审核通过、接受条款、启用价格、分佣规则和提现状态就绪。",
          label: "商业准备"
        },
        identity: {
          action: "补齐审核员判断可信版本所需的所有包身份字段。",
          detail: "需要 schemaVersion 0.1、合法 slug、语义版本、显示名称、描述和标签。",
          label: "包身份",
          ok: "schemaVersion、slug、版本、描述和标签都可进入审核。",
          short: "身份字段有效，但上架描述偏短，审核时可能要求补充。"
        },
        permissions: {
          action: "声明最小权限，移除通配符密钥；高风险范围需要 owner 审批。",
          detail: "文件系统 {filesystem}，{secrets} 个密钥句柄。",
          highRisk: "已声明高风险权限；后续需要审核员备注和项目 owner 批准。",
          invalidSecrets: "密钥句柄必须明确；不允许空值或通配符密钥权限。",
          label: "权限已限定",
          missing: "需要声明 network、browser、filesystem 和 secrets 权限。"
        },
        runtime: {
          action: "使用加固后的 HTTPS HTTP/MCP 端点，或准备本地运行时的人工审核证据。",
          fallback: "需要 HTTP entrypoint、MCP serverUrl 或本地 command。",
          insecure: "运行时 URL 有效但不是 HTTPS；审核前应完成传输加固。",
          label: "运行时已声明",
          local: "本地运行时需要人工审核沙箱、打包和执行证据。",
          ok: "{runtime} 运行时使用了有效 HTTPS 端点。"
        },
        schemas: {
          action: "补充带具体字段的输入/输出 object schema，让智能体知道发送什么、接收什么。",
          detail: "inputSchema 和 outputSchema 必须都是 object schema。",
          empty: "Schema 是 object，但字段偏少；审核前建议补充具体 properties。",
          label: "Schema 已附加",
          ok: "输入和输出 object schema 已包含具体字段。"
        },
        validJson: {
          action: "先修复语法；SkillHub 不能从无法解析的合约创建注册表状态。",
          fail: "保存前请修复 JSON 语法。",
          label: "JSON 有效",
          ok: "解析器已就绪。"
        }
      },
      editorHintInvalid: "JSON 无效",
      editorHintValid: "JSON 有效",
      evidencePacket: {
        body: "这是发布者在提交准确版本给平台审核前，可以先检查的安全证据包。",
        commercial: "商业闸口",
        identity: "身份",
        permissions: "权限",
        risk: "风险",
        reviewGate: "审核闸口",
        runtime: "运行时",
        schemas: "Schema 字段",
        secrets: "密钥句柄",
        title: "审核证据包"
      },
      manifestLabel: "skillhub.json",
      nextActionsTitle: "下一步运营动作",
      nextActions: [
        ["草稿", "把协议保存成组织拥有的注册表状态。"],
        ["版本", "在 /publisher 创建或提交指定语义版本。"],
        ["审核", "审批前处理自动检查警告。"],
        ["定价", "审核、条款和提现就绪后再激活付费价格。"]
      ],
      readiness: {
        blocked: "已阻塞",
        blockers: "阻塞",
        countsLabel: "预检数量",
        label: "预检就绪度",
        passed: "通过",
        ready: "可保存草稿",
        warning: "需要审核关注",
        warnings: "警告"
      },
      repairQueue: {
        blocker: "阻塞",
        body: "保存前必须先处理阻塞项。警告可以进入草稿，但会成为审核证据，可能需要备注。",
        emptyBody: "草稿保存后只剩商业准备；继续到发布者工作台处理条款、定价、提现和审核。",
        emptyTitle: "没有 manifest 阻塞项",
        target: "目标字段",
        title: "预检修复队列",
        warning: "警告"
      },
      result: {
        detail: "查看公开详情",
        errorTitle: "草稿未保存",
        publisher: "打开发布者工作台",
        successBody: "继续进入发布者工作台，提交审核版本、设置定价并完成商业准备。",
        successTitle: "草稿已保存到注册表"
      },
      reviewBody: "客户端预检只是给发布者看的建议性证据，不等于平台已验证审核。",
      reviewTitle: "Manifest 预检",
      risk: {
        high: "高",
        label: "风险",
        low: "低",
        medium: "中"
      },
      summary: {
        package: "包",
        runtime: "运行时",
        slug: "Slug",
        tags: "标签",
        version: "版本"
      },
      unknown: "未知",
      untitledSkill: "未命名技能"
    },
    action: {
      invalidManifest: "Manifest JSON 无效。",
      missingManifest: "请先粘贴 SkillHub manifest，再保存草稿。",
      missingToken: "请先使用发布者、owner 或 admin 用户会话登录，再发布技能。",
      publishedPrefix: "草稿已保存",
      publishedSuffix: "现在可以进入版本提交和发布者运营流程。",
      unableToPublish: "无法保存技能草稿。"
    }
  }
} as const;

const normalizedZhPublishCopy: PublishCopy = {
  page: {
    badge: "skillhub.json",
    consoleSubtitle: "发布控制台",
    description:
      "把一个 AI 能力打包成可治理的 SkillHub 合约。先保存草稿，再进入版本审核、运行证据、定价和提现准备。",
    eyebrow: "发布者工作流",
    pipelineBody:
      "一个市场上架项只有进入草稿状态、版本状态、审核状态、运行检查状态和商业准备状态后，才算可被信任的供应。",
    pipelineEyebrow: "运营流水线",
    pipelineTitle: "上传只是第一个控制点，不是终点。",
    publisherWorkspace: "发布者工作台",
    signalLabel: "发布运营信号",
    signals: [
      ["草稿", "组织隔离"],
      ["审核", "自动闸口"],
      ["运行", "策略证据"],
      ["付费", "条款和提现"]
    ],
    title: "注册一个技能包。",
    pipelineSteps: [
      {
        body: "从包含身份、运行时、权限、schema、示例和支持路径的 skillhub.json 开始。",
        title: "粘贴 manifest"
      },
      {
        body: "提前发现 JSON、必填合约字段、端点安全、schema 质量和高风险权限问题。",
        title: "执行预检"
      },
      {
        body: "通过当前登录的 SkillHub 用户会话，把草稿创建或更新到组织下。",
        title: "保存草稿"
      },
      {
        body: "在发布者工作台选择准确的语义版本，进入人工审核。",
        title: "提交版本"
      },
      {
        body: "Manifest、运行时、示例和安全检查会成为审核员和发布者共同看到的证据。",
        title: "自动检查"
      },
      {
        body: "Verified 上架需要审核记录通过，并且自动检查结果可接受。",
        title: "审核决策"
      },
      {
        body: "付费激活需要审核、条款、定价、分佣规则和提现状态全部就绪。",
        title: "商业准备"
      }
    ]
  },
  form: {
    access: {
      api: "注册表 API",
      body: "发布动作使用登录后创建的 httpOnly 用户会话。本表单不会收集原始管理员 token、服务 token、OAuth 密钥、Webhook 密钥或用户 token。",
      session: "当前登录用户会话",
      sessionDetail: "需要发布者、owner、admin 或 super admin 权限",
      title: "发布者自助访问"
    },
    action: {
      blocked: "先修复阻塞项，再保存草稿",
      draftButton: "保存草稿",
      ready: "可以保存草稿；正式审核在 /publisher 继续",
      saving: "正在保存草稿"
    },
    checks: {
      commercial: {
        action: "草稿保存后继续完成条款、提现准备、定价和分佣规则闸口。",
        detail: "后续付费激活需要审核通过、接受条款、启用价格、分佣规则和提现状态就绪。",
        label: "商业准备"
      },
      identity: {
        action: "补齐审核员判断可信版本所需的所有包身份字段。",
        detail: "需要 schemaVersion 0.1、合法 slug、语义版本、显示名称、描述和标签。",
        label: "包身份",
        ok: "schemaVersion、slug、版本、描述和标签都可进入审核。",
        short: "身份字段有效，但上架描述偏短，审核时可能要求补充。"
      },
      permissions: {
        action: "声明最小权限，移除通配符密钥；高风险范围需要 owner 审批。",
        detail: "文件系统 {filesystem}，{secrets} 个密钥句柄。",
        highRisk: "已声明高风险权限；后续需要审核员备注和项目 owner 批准。",
        invalidSecrets: "密钥句柄必须明确；不允许空值或通配符密钥权限。",
        label: "权限已限定",
        missing: "需要声明 network、browser、filesystem 和 secrets 权限。"
      },
      runtime: {
        action: "使用加固后的 HTTPS HTTP/MCP 端点，或准备本地运行时的人工审核证据。",
        fallback: "需要 HTTP entrypoint、MCP serverUrl 或本地 command。",
        insecure: "运行时 URL 有效但不是 HTTPS；审核前应完成传输加固。",
        label: "运行时已声明",
        local: "本地运行时需要人工审核沙箱、打包和执行证据。",
        ok: "{runtime} 运行时使用有效 HTTPS 端点。"
      },
      schemas: {
        action: "补充带具体字段的输入/输出 object schema，让智能体知道发送什么、接收什么。",
        detail: "inputSchema 和 outputSchema 必须都是 object schema。",
        empty: "Schema 是 object，但字段偏少；审核前建议补充具体 properties。",
        label: "Schema 已附加",
        ok: "输入和输出 object schema 已包含具体字段。"
      },
      validJson: {
        action: "先修复语法；SkillHub 不能从无法解析的合约创建注册表状态。",
        fail: "保存前请修复 JSON 语法。",
        label: "JSON 有效",
        ok: "解析器已就绪。"
      }
    },
    editorHintInvalid: "JSON 无效",
    editorHintValid: "JSON 有效",
    evidencePacket: {
      body: "这是发布者在把准确版本提交给平台审核前，可以先检查的安全证据包。",
      commercial: "商业闸口",
      identity: "身份",
      permissions: "权限",
      risk: "风险",
      reviewGate: "审核闸口",
      runtime: "运行时",
      schemas: "Schema 字段",
      secrets: "密钥句柄",
      title: "审核证据包"
    },
    manifestLabel: "skillhub.json",
    nextActionsTitle: "下一步运营动作",
    nextActions: [
      ["草稿", "把合约保存成组织拥有的注册表状态。"],
      ["版本", "在 /publisher 创建或提交指定语义版本。"],
      ["审核", "审批前处理自动检查警告。"],
      ["定价", "审核、条款和提现就绪后再激活付费价格。"]
    ],
    readiness: {
      blocked: "已阻塞",
      blockers: "阻塞",
      countsLabel: "预检数量",
      label: "预检就绪度",
      passed: "通过",
      ready: "可保存草稿",
      warning: "需要审核关注",
      warnings: "警告"
    },
    repairQueue: {
      blocker: "阻塞",
      body: "保存前必须先处理阻塞项。警告可以进入草稿，但会成为审核证据，可能需要备注。",
      emptyBody: "草稿保存后只剩商业准备；继续到发布者工作台处理条款、定价、提现和审核。",
      emptyTitle: "没有 manifest 阻塞项",
      target: "目标字段",
      title: "预检修复队列",
      warning: "警告"
    },
    result: {
      detail: "查看公开详情",
      errorTitle: "草稿未保存",
      publisher: "打开发布者工作台",
      successBody: "继续进入发布者工作台，提交审核版本、设置定价并完成商业准备。",
      successTitle: "草稿已保存到注册表"
    },
    reviewBody: "客户端预检只是给发布者看的建议性证据，不等于平台已验证审核。",
    reviewTitle: "Manifest 预检",
    risk: {
      high: "高",
      label: "风险",
      low: "低",
      medium: "中"
    },
    summary: {
      package: "包",
      runtime: "运行时",
      slug: "Slug",
      tags: "标签",
      version: "版本"
    },
    unknown: "未知",
    untitledSkill: "未命名技能"
  },
  action: {
    invalidManifest: "Manifest JSON 无效。",
    missingManifest: "请先粘贴 SkillHub manifest，再保存草稿。",
    missingToken: "请先使用发布者、owner 或 admin 用户会话登录，再发布技能。",
    publishedPrefix: "草稿已保存",
    publishedSuffix: "现在可以进入版本提交和发布者运营流程。",
    unableToPublish: "无法保存技能草稿。"
  }
};

export function getPublishCopy(locale: Locale): PublishCopy {
  return locale === "zh" ? normalizedZhPublishCopy : publishCopy.en;
}
