import type { Locale } from "@/lib/locale-routing";

export {
  getLocaleFromSearchParams,
  hrefWithReturnTo,
  localizedHref,
  localizedHrefWithReturnTo,
  locales,
  resolveLocale,
} from "@/lib/locale-routing";
export type { Locale } from "@/lib/locale-routing";

export const dictionaries = {
  en: {
    common: {
      admin: "Admin",
      apiHealth: "API health",
      backToRegistry: "Skill API",
      dashboard: "Dashboard",
      gateway: "Gateway",
      github: "GitHub",
      health: "Health",
      language: "Language",
      live: "Live",
      marketplace: "Find Skills",
      mcp: "MCP",
      publish: "Publish",
      publishSkill: "Publish skill",
      subtitle: "Universal skills for AI agents.",
      viewContract: "View contract"
    },
    nav: {
      home: "Home",
      marketplace: "Find Skills",
      solutions: "Solutions",
      registry: "Skill API",
      agents: "Agents",
      docs: "Docs & Guides",
      dashboard: "Dashboard",
      developer: "Developers",
      publisher: "Publishers",
      admin: "Admin"
    },
    home: {
      eyebrow: "Agent skill infrastructure",
      title: "Trusted skills for AI agents.",
      description:
        "Search reusable agent skills, inspect permissions, and prepare verified capabilities for governed REST/MCP runtime use. Developer Preview: public discovery and inspection are live; runtime invocation requires a signed-in project key; paid marketplace features remain prelaunch.",
      publishCta: "Publish a skill",
      gatewayTitle: "Developer Preview gateway",
      registryEyebrow: "Skill API",
      registryTitle: "Agent Skill API Catalog",
      newSkill: "Submit a skill",
      searchPlaceholder: "Search skills, tags, runtimes",
      protocolEyebrow: "Protocol",
      protocolTitle: "A skill contract agents can read before they act.",
      protocolBody:
        "A SkillHub package is not just a prompt. It is a typed, versioned capability with declared runtime, schemas, permissions, pricing, and review state.",
      manifestEyebrow: "skillhub.json",
      manifestTitle: "One manifest for humans, agents, and runtime gateways.",
      manifestBody:
        "The Skill API catalog accepts a compact JSON manifest. The same contract powers search results, trust review, SDK generation, billing, and MCP tool discovery.",
      trustEyebrow: "Trust layer",
      trustTitle: "Designed for agents that need guardrails.",
      status: {
        api: "API",
        mcp: "MCP",
        schema: "Schema",
        store: "Store",
        online: "online"
      },
      workflows: [
        {
          title: "Discover",
          description: "Agents search by task, tags, permission profile, runtime contract, and pricing model."
        },
        {
          title: "Validate",
          description: "Skill manifests declare inputs, outputs, runtime entrypoints, access needs, and version history."
        },
        {
          title: "Execute",
          description: "The gateway exposes HTTP and MCP endpoints so agents can call skills safely and meter usage."
        }
      ],
      manifestBullets: [
        "Typed input and output schemas",
        "HTTP, MCP, or local runtime declarations",
        "Explicit network, browser, filesystem, and secret access",
        "Versioned identity for repeatable agent behavior"
      ],
      trustItems: [
        {
          title: "Permission aware",
          description: "Every package carries its network, browser, filesystem, and secret requirements."
        },
        {
          title: "Versioned packages",
          description: "Skills are registered with immutable versions so agents can pin behavior."
        },
        {
          title: "Operator control",
          description: "Paid publishing preview, review, refunds, and finance review stay behind audited platform controls."
        }
      ]
    },
    metrics: {
      publishedSkills: "Public skills",
      totalSkillRecords: "Total records",
      verified: "Verified",
      callableSkills: "Callable skills",
      apiCalls: "API calls",
      avgLatency: "Avg latency",
      verifiedShare: "Verified share"
    },
    skillTable: {
      aria: "Skill API catalog",
      skill: "Skill",
      tags: "Tags",
      trust: "Trust",
      risk: "Risk",
      actions: "Actions",
      details: "Inspect skill",
      manifestChecked: "Manifest checked",
      openManifest: "Open manifest",
      emptyTitle: "No skills published",
      emptyBody: "Publish a SkillHub manifest to populate the Skill API catalog.",
      riskLabels: {
        low: "Low risk",
        medium: "Medium risk",
        high: "High risk"
      },
      status: {
        draft: "Draft",
        submitted: "Submitted",
        verified: "Verified",
        deprecated: "Deprecated",
        rejected: "Rejected",
        suspended: "Suspended"
      }
    },
    registryPage: {
      eyebrow: "Public Skill API",
      title: "Browse reusable skills for agent workflows.",
      description:
        "Browse public skill contracts, inspect package risk, and open each manifest through the public API. Use Find Skills filters or the public API for search.",
      filtersTitle: "Skill API filters",
      filters: ["Research", "Browser", "Schema", "Low risk"],
      endpointTitle: "Discovery endpoint",
      endpointBody: "Agents and apps can query SkillHub without scraping the interface.",
      packageTitle: "Package signals",
      packageBody: "Every listed skill includes trust status, tags, version, and permission risk."
    },
    marketplacePage: {
      eyebrow: "Find Skills model",
      title: "A skill marketplace built for publishers, developers, and agents.",
      description:
        "SkillHub separates discovery, governed execution, ledger modeling, and prelaunch payout operations so third-party skill authors can publish while buyers keep control of cost and risk.",
      ctaPrimary: "Open dashboard",
      ctaSecondary: "Read docs",
      rails: [
        {
          title: "Publishers",
          description: "Create skill versions, submit reviews, choose pricing, track usage, and receive payouts."
        },
        {
          title: "Developers",
          description: "Create projects, issue API keys, approve paid skills, inspect invoices, and pin versions."
        },
        {
          title: "Platform",
          description: "Review submissions, classify risk, resolve disputes, audit money movement, and protect users."
        }
      ],
      moneyTitle: "Commission and payout flow",
      moneySteps: ["Customer payment", "Usage transaction", "Platform fee", "Publisher balance", "Payout review", "Paid out"],
      pricingTitle: "First pricing models",
      pricing: [
        {
          name: "Free",
          detail: "Public discovery and metered usage without money movement."
        },
        {
          name: "Per call",
          detail: "Every successful billable execution creates a transaction split."
        },
        {
          name: "Subscription",
          detail: "Monthly access to one skill, one publisher bundle, or a curated collection."
        }
      ],
      commissionTitle: "Default split",
      splitCaption: "platform / publisher",
      commissionRows: [
        ["Platform fee", "20%"],
        ["Publisher share", "80%"],
        ["Processing fee", "Recorded separately"],
        ["Refunds", "Reverse fee and share proportionally"]
      ]
    },
    dashboardPage: {
      eyebrow: "Workspace dashboard",
      title: "Run the publisher and developer sides from one console.",
      description:
        "The dashboard is split into publisher operations, buyer projects, paid-preview ledger state, and finance-gated readiness so the platform can grow into real marketplace workflows.",
      publisher: "Publisher backend",
      buyer: "Developer backend",
      earnings: "Paid preview",
      payouts: "Finance review",
      metrics: [
        ["Available balance", "$4,820"],
        ["Pending balance", "$1,260"],
        ["Billable calls", "38.4k"],
        ["Active subscriptions", "126"]
      ],
      publisherCards: [
        ["Skill pipeline", "Submissions, verification state, and runtime fixes"],
        ["Pricing", "Per-call and subscription pricing ready for review"],
        ["Analytics", "Latency, errors, conversion, and top consuming projects"]
      ],
      buyerCards: [
        ["Projects", "Agent projects with scoped API keys and budgets"],
        ["Subscriptions", "Approved paid skills, renewals, cancellations"],
        ["Usage", "Cost, calls, latency, and skill-level breakdowns"]
      ],
      ledgerTitle: "Paid-preview ledger",
      ledgerHeaders: ["Skill", "Gross", "Fee", "Net", "Status"],
      ledgerRows: [
        ["browser-research", "$1,240", "$248", "$992", "available"],
        ["support-triage", "$760", "$152", "$608", "pending"],
        ["schema-auditor", "$420", "$84", "$336", "available"]
      ],
      payoutTitle: "Finance review readiness",
      payoutItems: [
        ["Receiving account", "Submitted"],
        ["Manual transfer model", "PayPal/Alipay finance review"],
        ["Minimum threshold", "$100"],
        ["Next review", "Scheduled finance review"]
      ]
    },
    adminPage: {
      eyebrow: "Platform admin",
      lockedDescription:
        "Sign in with an operations, finance, support, review, or system admin account before opening review, finance, payout, delivery, identity, launch-readiness, and audit operations.",
      lockedTitle: "Enter the platform admin after sign-in.",
      title: "Control review, risk, finance, payouts, and audit trails.",
      description:
        "Admin operations must protect the registry and the money flow. Every approval, rejection, refund, dispute, and payout decision needs a durable record.",
      metrics: [
        ["GMV", "$18.6k"],
        ["Platform revenue", "$3.7k"],
        ["Payouts due", "$5.1k"],
        ["Review queue", "9"]
      ],
      reviewTitle: "Skill review queue",
      reviewRows: [
        ["browser-research-pro", "High", "Runtime test passed", "Manual review"],
        ["crm-enrichment", "Medium", "Needs data policy", "Waiting"],
        ["local-file-agent", "High", "Filesystem access", "Blocked"]
      ],
      financeTitle: "Finance operations",
      financeRows: [
        ["Transaction splits", "Immutable platform fee and publisher share records"],
        ["Payout review", "Manual review above threshold or risk flag"],
        ["Refunds and disputes", "Adjustments instead of editing historical transactions"]
      ],
      auditTitle: "Audit stream",
      auditRows: [
        "Reviewer approved schema-auditor v0.2.1",
        "Finance blocked payout for missing provider verification",
        "System recorded per-call transaction batch"
      ]
    },
    agentsPage: {
      eyebrow: "Agent runtime",
      title: "A common skill layer for every agent stack.",
      description:
        "SkillHub gives agents a predictable path from discovery to validation to execution, whether the runtime is HTTP, MCP, or local.",
      ctaPrimary: "Find skills",
      ctaSecondary: "Open developer console",
      cards: [
        {
          title: "Planner-friendly discovery",
          description: "Expose skill search as an agent tool so planners can find reusable capabilities before writing custom steps."
        },
        {
          title: "Runtime routing",
          description: "Let the gateway route to HTTP services, MCP servers, and local commands through one registry contract."
        },
        {
          title: "Permission context",
          description: "Give agents the risk profile of a skill before they decide whether to call it."
        }
      ],
      timelineTitle: "Agent call flow",
      timeline: ["Search by task", "Read manifest", "Check permissions", "Call runtime", "Return typed output"],
      integrationEyebrow: "Integration paths",
      integrationTitle: "Connect agents through one governed project layer.",
      integrationBody:
        "A project-scoped key lets an agent list installed tools, invoke approved skills, and keep every call tied to policy, budget, subscription, invocation logs, and ledger-ready usage.",
      integrationOptions: [
        {
          title: "MCP clients",
          description: "Expose project-approved SkillHub skills as MCP tools for agent workbenches and assistants.",
          tag: "POST /mcp"
        },
        {
          title: "REST runtimes",
          description: "Call a pinned skill directly from server workflows, schedulers, and custom agent loops.",
          tag: "POST /v1/runtime/invoke"
        },
        {
          title: "SDK and CLI",
          description: "Keep discovery, install, and invocation automation in the same source-controlled workflow.",
          tag: "SDK preview"
        }
      ],
      snippetsTitle: "Runtime connection preview",
      snippets: {
        mcpTitle: "MCP client",
        restTitle: "REST invocation",
        sdkTitle: "SDK discovery"
      },
      governanceEyebrow: "Runtime governance",
      governanceTitle: "What stays enforced at runtime",
      governanceBody:
        "SkillHub is the control plane between agent intent and skill execution. Agents can move fast without losing ownership, review, or cost controls.",
      governanceItems: [
        "Project API keys are scoped and revocable.",
        "Installed skills keep version pins and approval state.",
        "High-risk permissions return to owner review.",
        "Budgets, rate limits, subscriptions, logs, and usage events stay attached to every call."
      ],
      checklistTitle: "Before production agent use",
      checklist: [
        "Create a developer project and runtime key.",
        "Save or adopt candidate skills from the marketplace after sign-in.",
        "Review permissions, budget, and subscription state.",
        "Run a non-billable project test call.",
        "Paste the REST or MCP snippet into the agent runtime."
      ],
      sdkTitle: "Three agent-ready integration shapes",
      sdkBody: "MCP clients and direct REST calls resolve back to the same governed SkillHub registry. CLI and SDK packages are preview until public package releases exist."
    },
    docsPage: {
      eyebrow: "Developer docs",
      title: "Build and publish SkillHub packages.",
      description:
        "The current contract is intentionally small: a JSON manifest, a public discovery API, and a gateway that agents can call.",
      sections: [
        {
          title: "Manifest contract",
          description: "Declare identity, runtime, permissions, input schema, output schema, and pricing state in skillhub.json."
        },
        {
          title: "Search API",
          description: "Use /v1/skills/search to list packages by query, tag, permission, runtime, billing model, verification state, and ranking sort."
        },
        {
          title: "Manifest API",
          description: "Use /v1/skills/:slug to inspect the exact contract before an agent executes a skill."
        }
      ],
      endpointsTitle: "Core endpoints",
      publishNote: "Publishing uses an organization-scoped publisher, owner, or admin user session while discovery remains public."
    },
    publishPage: {
      eyebrow: "Publish workflow",
      title: "Register a skill package.",
      description:
        "Sign in as a publisher, paste a SkillHub manifest, review the contract, and publish it into the live registry behind useskillhub.com.",
      badge: "skillhub.json",
      consoleSubtitle: "publish console"
    },
    publishForm: {
      operatorAccess: "Publisher access",
      adminToken: "Signed-in user session",
      private: "User-scoped token from login",
      validJson: "Valid JSON",
      invalidJson: "Invalid JSON",
      publishSkill: "Publish skill",
      publishing: "Publishing",
      reviewTitle: "Manifest review",
      reviewBody: "Preflight for registry submission.",
      package: "Package",
      slug: "Slug",
      runtime: "Runtime",
      version: "Version",
      tags: "Tags",
      untitledSkill: "Untitled skill",
      missingName: "missing-name",
      unknown: "unknown",
      invalidManifest: "Manifest JSON is invalid.",
      unableToPublish: "Unable to publish skill.",
      publishedPrefix: "Published",
      checks: {
        validJson: {
          label: "Valid JSON",
          ok: "Parser ready",
          fail: "Fix syntax before publishing"
        },
        identity: {
          label: "Package identity",
          detail: "name, displayName, version"
        },
        runtime: {
          label: "Runtime declared",
          fallback: "HTTP, MCP, or local"
        },
        schemas: {
          label: "Schemas attached",
          detail: "inputSchema and outputSchema"
        },
        permissions: {
          label: "Permissions scoped",
          detail: "{filesystem} filesystem, {secrets} secrets"
        }
      }
    }
  },
  zh: {
    common: {
      admin: "管理后台",
      apiHealth: "API 状态",
      backToRegistry: "技能 API",
      dashboard: "工作台",
      gateway: "网关",
      github: "GitHub",
      health: "健康状态",
      language: "语言",
      live: "在线",
      marketplace: "找技能",
      mcp: "MCP",
      publish: "发布",
      publishSkill: "发布技能",
      subtitle: "给 AI 智能体使用的通用技能库。",
      viewContract: "查看协议"
    },
    nav: {
      home: "首页",
      marketplace: "市场",
      solutions: "解决方案",
      registry: "技能 API",
      agents: "智能体",
      docs: "使用文档",
      dashboard: "工作台",
      developer: "开发者",
      publisher: "发布者",
      admin: "后台"
    },
    home: {
      eyebrow: "智能体技能基础设施",
      title: "给 AI Agent 使用的可信技能库。",
      description:
        "搜索可复用技能、查看权限和审核状态，并将已验证能力接入受治理的 REST/MCP 运行路径。开发者预览版：公开发现和查看已上线；运行调用需要登录后的项目 Key；付费市场能力仍处于预发布阶段。",
      publishCta: "发布一个技能",
      gatewayTitle: "开发者预览版网关",
      registryEyebrow: "技能 API",
      registryTitle: "智能体技能 API 清单",
      newSkill: "提交技能",
      searchPlaceholder: "搜索技能、标签、运行时",
      protocolEyebrow: "协议",
      protocolTitle: "智能体执行之前，可以先读懂技能协议。",
      protocolBody:
        "SkillHub 技能包不是一段提示词，而是带运行时、输入输出 schema、权限、价格和审核状态的版本化能力。",
      manifestEyebrow: "skillhub.json",
      manifestTitle: "一份 manifest，同时服务人、智能体和运行网关。",
      manifestBody:
        "技能 API 清单接受简洁的 JSON manifest；它会驱动搜索结果、信任审核、SDK 生成、计费和 MCP 工具发现。",
      trustEyebrow: "信任层",
      trustTitle: "为需要护栏的智能体而设计。",
      status: {
        api: "API",
        mcp: "MCP",
        schema: "Schema",
        store: "存储",
        online: "在线"
      },
      workflows: [
        {
          title: "发现",
          description: "智能体可按任务、标签、权限画像、运行协议和价格模型搜索技能。"
        },
        {
          title: "校验",
          description: "技能 manifest 声明输入、输出、运行入口、访问需求和版本历史。"
        },
        {
          title: "执行",
          description: "网关提供 HTTP 和 MCP 端点，让智能体安全调用技能并记录用量。"
        }
      ],
      manifestBullets: [
        "类型化输入和输出 schema",
        "HTTP、MCP 或本地运行时声明",
        "显式网络、浏览器、文件系统和密钥权限",
        "版本化身份，保证智能体行为可复现"
      ],
      trustItems: [
        {
          title: "权限可见",
          description: "每个技能包都会声明网络、浏览器、文件系统和密钥需求。"
        },
        {
          title: "版本化包",
          description: "技能以不可变版本注册，方便智能体固定行为。"
        },
        {
          title: "运营可控",
          description: "付费发布预览、审核、退款和财务复核都放在带审计的后台控制里。"
        }
      ]
    },
    metrics: {
      publishedSkills: "公开技能",
      totalSkillRecords: "总技能记录",
      verified: "已验证",
      callableSkills: "可调用技能",
      apiCalls: "API 调用",
      avgLatency: "平均延迟",
      verifiedShare: "验证占比"
    },
    skillTable: {
      aria: "技能 API 清单",
      skill: "技能",
      tags: "标签",
      trust: "信任",
      risk: "风险",
      actions: "操作",
      details: "查看技能",
      manifestChecked: "Manifest 已检查",
      openManifest: "打开 manifest",
      emptyTitle: "还没有发布技能",
      emptyBody: "发布一个 SkillHub manifest 后，技能 API 清单会自动显示技能。",
      riskLabels: {
        low: "低风险",
        medium: "中风险",
        high: "高风险"
      },
      status: {
        draft: "草稿",
        submitted: "已提交",
        verified: "已验证",
        deprecated: "已弃用",
        rejected: "已拒绝",
        suspended: "已暂停"
      }
    },
    registryPage: {
      eyebrow: "公开技能 API",
      title: "浏览可复用的智能体技能。",
      description: "浏览公开技能合约，查看技能包风险，并通过公开 API 打开每个 manifest。如需搜索，请使用找技能页面筛选或公开 API。",
      filtersTitle: "技能 API 筛选",
      filters: ["研究", "浏览器", "Schema", "低风险"],
      endpointTitle: "发现端点",
      endpointBody: "智能体和应用可以直接查询 SkillHub，不需要抓取界面内容。",
      packageTitle: "包信号",
      packageBody: "每个技能都包含信任状态、标签、版本和权限风险。"
    },
    marketplacePage: {
      eyebrow: "市场模型",
      title: "给发布者、开发者和智能体使用的找技能入口。",
      description:
        "SkillHub 把发现、执行、计费和提现运营拆开，让第三方技能作者可以发布技能，同时让购买方控制成本和风险。",
      ctaPrimary: "打开工作台",
      ctaSecondary: "阅读文档",
      rails: [
        {
          title: "发布者",
          description: "创建技能版本、提交审核、选择价格、查看用量并获得提现。"
        },
        {
          title: "开发者",
          description: "创建项目、签发 API Key、批准付费技能、查看发票并固定版本。"
        },
        {
          title: "平台",
          description: "审核提交、分类风险、处理争议、审计资金流并保护用户。"
        }
      ],
      moneyTitle: "分佣和提现流程",
      moneySteps: ["客户付款", "用量交易", "平台佣金", "发布者余额", "提现审核", "打款完成"],
      pricingTitle: "第一批价格模型",
      pricing: [
        {
          name: "免费",
          detail: "公开发现和用量记录，但不产生资金流。"
        },
        {
          name: "按次调用",
          detail: "每一次成功的可计费执行都会生成一条分账交易。"
        },
        {
          name: "订阅",
          detail: "按月购买单个技能、发布者合集或平台精选合集。"
        }
      ],
      commissionTitle: "默认分账",
      splitCaption: "平台 / 发布者",
      commissionRows: [
        ["平台佣金", "20%"],
        ["发布者收入", "80%"],
        ["支付通道费", "单独记录"],
        ["退款", "按比例冲回平台佣金和发布者收入"]
      ]
    },
    dashboardPage: {
      eyebrow: "工作台",
      title: "发布者后台和开发者后台放在同一个控制台。",
      description:
        "工作台拆成发布运营、购买方项目、付费预览账本和收款资料准备四块，这样平台以后可以自然接入真实市场流程。",
      publisher: "发布者后台",
      buyer: "开发者后台",
      earnings: "付费预览",
      payouts: "财务复核",
      metrics: [
        ["可提现余额", "$4,820"],
        ["待结算余额", "$1,260"],
        ["可计费调用", "38.4k"],
        ["活跃订阅", "126"]
      ],
      publisherCards: [
        ["技能流程", "3 个待审核，8 个已验证，1 个运行时需修复"],
        ["价格", "按次调用和订阅价格已进入审核流程"],
        ["分析", "延迟、错误、转化率和主要调用项目"]
      ],
      buyerCards: [
        ["项目", "带作用域 API Key 和预算的智能体项目"],
        ["订阅", "已批准付费技能、续费和取消记录"],
        ["用量", "成本、调用、延迟和技能级别拆分"]
      ],
      ledgerTitle: "付费预览账本",
      ledgerHeaders: ["技能", "预览总额", "佣金", "发布者份额", "状态"],
      ledgerRows: [
        ["browser-research", "$1,240", "$248", "$992", "可提现"],
        ["support-triage", "$760", "$152", "$608", "待结算"],
        ["schema-auditor", "$420", "$84", "$336", "可提现"]
      ],
      payoutTitle: "财务复核准备",
      payoutItems: [
        ["\u6536\u6b3e\u8d26\u53f7", "\u5df2\u63d0\u4ea4"],
        ["人工转账模型", "PayPal/Alipay 财务复核"],
        ["最低复核金额", "$100"],
        ["下一次复核", "等待计划审核"]
      ]
    },
    adminPage: {
      eyebrow: "平台管理后台",
      lockedDescription:
        "先使用已开通审核、财务、支持或系统管理权限的运营账号登录，再进入审核、财务、提现、投递、身份、上线就绪和审计操作。",
      lockedTitle: "登录后进入平台管理后台。",
      title: "控制审核、风险、财务、提现和审计链路。",
      description:
        "后台运营必须同时保护技能库和资金流。每一次批准、拒绝、退款、争议和提现决策都要留下持久记录。",
      metrics: [
        ["交易额", "$18.6k"],
        ["平台收入", "$3.7k"],
        ["待提现", "$5.1k"],
        ["审核队列", "9"]
      ],
      reviewTitle: "技能审核队列",
      reviewRows: [
        ["browser-research-pro", "高", "运行测试通过", "人工审核"],
        ["crm-enrichment", "中", "需要数据政策", "等待"],
        ["local-file-agent", "高", "文件系统权限", "已阻止"]
      ],
      financeTitle: "财务运营",
      financeRows: [
        ["交易分账", "不可变的平台佣金和发布者收入记录"],
        ["提现审核", "超过阈值或命中风险时进入人工审核"],
        ["退款和争议", "用调整交易处理，不修改历史交易"]
      ],
      auditTitle: "审计流",
      auditRows: [
        "审核员批准 schema-auditor v0.2.1",
        "财务因支付方验证缺失阻止提现",
        "系统记录按次调用交易批次"
      ]
    },
    agentsPage: {
      eyebrow: "智能体运行层",
      title: "给所有智能体栈共用的一层技能系统。",
      description:
        "无论运行时是 HTTP、MCP 还是本地命令，SkillHub 都给智能体一条从发现、校验到执行的稳定路径。",
      ctaPrimary: "查找技能",
      ctaSecondary: "进入开发者控制台",
      cards: [
        {
          title: "适合规划器发现",
          description: "把技能搜索暴露成智能体工具，让规划器先找到可复用能力，而不是每次重写步骤。"
        },
        {
          title: "运行时路由",
          description: "网关可以把 HTTP 服务、MCP 服务器和本地命令收敛到同一份注册协议。"
        },
        {
          title: "权限上下文",
          description: "智能体在决定调用技能前，可以先看到该技能的风险画像。"
        }
      ],
      timelineTitle: "智能体调用流程",
      timeline: ["按任务搜索", "读取 manifest", "检查权限", "调用运行时", "返回类型化输出"],
      integrationEyebrow: "接入路径",
      integrationTitle: "通过同一个项目治理层连接智能体。",
      integrationBody:
        "项目级 Key 让智能体列出已安装工具、调用已批准技能，并把每次调用都绑定到策略、预算、订阅、调用日志和可计量用量。",
      integrationOptions: [
        {
          title: "MCP 客户端",
          description: "把项目已批准的 SkillHub 技能暴露成 MCP tools，给智能体工作台和助手使用。",
          tag: "POST /mcp"
        },
        {
          title: "REST 运行时",
          description: "从服务端工作流、定时任务和自定义智能体循环直接调用固定版本的技能。",
          tag: "POST /v1/runtime/invoke"
        },
        {
          title: "SDK 和 CLI",
          description: "把发现、安装和调用自动化放进同一套可版本化的工程流程。",
          tag: "SDK \u9884\u89c8"
        }
      ],
      snippetsTitle: "运行连接预览",
      snippets: {
        mcpTitle: "MCP 客户端",
        restTitle: "REST 调用",
        sdkTitle: "SDK 发现"
      },
      governanceEyebrow: "运行时治理",
      governanceTitle: "运行时仍然生效的治理",
      governanceBody:
        "SkillHub 是智能体意图和技能执行之间的控制平面。智能体可以快速接入，但不会绕过所有权、审核和成本控制。",
      governanceItems: [
        "项目 API Key 有范围并可撤销。",
        "已安装技能保留版本固定和审批状态。",
        "高风险权限更新会回到负责人审核。",
        "预算、限流、订阅、日志和用量事件都会绑定到每次调用。"
      ],
      checklistTitle: "生产智能体使用前",
      checklist: [
        "创建开发者项目和运行 Key。",
        "登录后从市场保存或采用候选技能。",
        "检查权限、预算和订阅状态。",
        "运行一次不计费的项目测试调用。",
        "把 REST 或 MCP 片段接入智能体运行时。"
      ],
      sdkTitle: "智能体的三种接入形态",
      sdkBody: "MCP \u5ba2\u6237\u7aef\u548c\u76f4\u63a5 REST \u8c03\u7528\u90fd\u4f1a\u56de\u5230\u540c\u4e00\u4e2a\u53d7\u6cbb\u7406\u7684 SkillHub \u6ce8\u518c\u8868\u3002CLI \u548c SDK \u5305\u5728\u516c\u5f00 package release \u524d\u4fdd\u6301\u9884\u89c8\u72b6\u6001\u3002"
    },
    docsPage: {
      eyebrow: "开发者文档",
      title: "构建并发布 SkillHub 技能包。",
      description:
        "当前协议刻意保持小而清晰：JSON manifest、公开发现 API，以及智能体可以调用的网关。",
      sections: [
        {
          title: "Manifest 协议",
          description: "在 skillhub.json 中声明身份、运行时、权限、输入 schema、输出 schema 和价格状态。"
        },
        {
          title: "搜索 API",
          description: "使用 /v1/skills/search 按查询词、标签、权限、运行时、价格模型、验证状态和排序方式列出技能包。"
        },
        {
          title: "Manifest API",
          description: "使用 /v1/skills/:slug 在智能体执行前检查完整技能协议。"
        }
      ],
      endpointsTitle: "核心端点",
      publishNote: "发布需要组织范围内的发布权限，发现接口保持公开。"
    },
    publishPage: {
      eyebrow: "发布流程",
      title: "注册一个技能包。",
      description: "以发布者身份登录后，粘贴 SkillHub manifest，检查协议，然后发布到 useskillhub.com 后面的实时技能 API。",
      badge: "skillhub.json",
      consoleSubtitle: "发布控制台"
    },
    publishForm: {
      operatorAccess: "发布者访问",
      adminToken: "当前登录用户会话",
      private: "来自登录的用户 token",
      validJson: "JSON 有效",
      invalidJson: "JSON 无效",
      publishSkill: "发布技能",
      publishing: "发布中",
      reviewTitle: "Manifest 预检",
      reviewBody: "提交到技能 API 前的协议检查。",
      package: "包",
      slug: "Slug",
      runtime: "运行时",
      version: "版本",
      tags: "标签",
      untitledSkill: "未命名技能",
      missingName: "缺少名称",
      unknown: "未知",
      invalidManifest: "Manifest JSON 无效。",
      unableToPublish: "无法发布技能。",
      publishedPrefix: "已发布",
      checks: {
        validJson: {
          label: "JSON 有效",
          ok: "解析器已就绪",
          fail: "发布前请修复语法"
        },
        identity: {
          label: "包身份",
          detail: "name、displayName、version"
        },
        runtime: {
          label: "运行时已声明",
          fallback: "HTTP、MCP 或本地运行时"
        },
        schemas: {
          label: "Schema 已附加",
          detail: "inputSchema 和 outputSchema"
        },
        permissions: {
          label: "权限已限定",
          detail: "文件系统 {filesystem}，{secrets} 个密钥"
        }
      }
    }
  }
} as const;

type WidenDictionaryValue<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly unknown[]
        ? number extends T["length"]
          ? WidenDictionaryValue<T[number]>[]
          : { readonly [K in keyof T]: WidenDictionaryValue<T[K]> }
        : T extends object
          ? { readonly [K in keyof T]: WidenDictionaryValue<T[K]> }
          : T;

export type Dictionary = WidenDictionaryValue<(typeof dictionaries)["en"]>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as unknown as Dictionary;
}
