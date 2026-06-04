export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

type SearchParams = Record<string, string | string[] | undefined> | undefined;

export function resolveLocale(value: unknown): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== "string") {
    return "en";
  }

  const normalized = candidate.toLowerCase();
  return normalized === "zh" || normalized === "zh-cn" || normalized === "cn" ? "zh" : "en";
}

export function getLocaleFromSearchParams(searchParams: SearchParams): Locale {
  return resolveLocale(searchParams?.lang);
}

export function localizedHref(path: string, locale: Locale) {
  const [base, hash] = path.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}lang=${locale}${hash ? `#${hash}` : ""}`;
}

export const dictionaries = {
  en: {
    common: {
      admin: "Admin",
      apiHealth: "API health",
      backToRegistry: "Registry",
      dashboard: "Dashboard",
      gateway: "Gateway",
      github: "GitHub",
      health: "Health",
      language: "Language",
      live: "Live",
      marketplace: "Marketplace",
      mcp: "MCP",
      publish: "Publish",
      publishSkill: "Publish skill",
      subtitle: "Universal skills for AI agents.",
      viewContract: "View contract"
    },
    nav: {
      home: "Home",
      marketplace: "Marketplace",
      registry: "Registry",
      agents: "Agents",
      docs: "Docs",
      dashboard: "Dashboard",
      developer: "Developers",
      publisher: "Publishers",
      admin: "Admin"
    },
    home: {
      eyebrow: "Agent skill infrastructure",
      title: "Universal skills agents can discover, trust, and run.",
      description:
        "SkillHub is the registry, marketplace, and gateway layer for reusable AI-agent capabilities: one manifest format, searchable packages, permission profiles, billing-ready usage, and agent-ready APIs.",
      publishCta: "Publish a skill",
      gatewayTitle: "Production edge",
      registryEyebrow: "Registry",
      registryTitle: "Agent Skill Registry",
      newSkill: "New skill",
      searchPlaceholder: "Search skills, tags, runtimes",
      protocolEyebrow: "Protocol",
      protocolTitle: "A skill contract agents can read before they act.",
      protocolBody:
        "A SkillHub package is not just a prompt. It is a typed, versioned capability with declared runtime, schemas, permissions, pricing, and review state.",
      manifestEyebrow: "skillhub.json",
      manifestTitle: "One manifest for humans, agents, and runtime gateways.",
      manifestBody:
        "The registry accepts a compact JSON manifest. The same contract powers search results, trust review, SDK generation, billing, and MCP tool discovery.",
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
          description: "Paid publishing, review, refunds, and payouts stay behind audited platform controls."
        }
      ]
    },
    metrics: {
      publishedSkills: "Published skills",
      verified: "Verified",
      apiCalls: "API calls",
      avgLatency: "Avg latency",
      verifiedShare: "Verified share"
    },
    skillTable: {
      aria: "Skill registry",
      skill: "Skill",
      tags: "Tags",
      trust: "Trust",
      risk: "Risk",
      actions: "Actions",
      manifestChecked: "Manifest checked",
      openManifest: "Open manifest",
      emptyTitle: "No skills published",
      emptyBody: "Publish a SkillHub manifest to populate the registry.",
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
      eyebrow: "Public registry",
      title: "Browse reusable skills for agent workflows.",
      description:
        "Search the live registry, inspect package risk, and open each manifest through the public API.",
      filtersTitle: "Registry filters",
      filters: ["Research", "Browser", "Schema", "Low risk"],
      endpointTitle: "Discovery endpoint",
      endpointBody: "Agents and apps can query SkillHub without scraping the interface.",
      packageTitle: "Package signals",
      packageBody: "Every listed skill includes trust status, tags, version, and permission risk."
    },
    marketplacePage: {
      eyebrow: "Marketplace model",
      title: "A skill marketplace built for publishers, developers, and agents.",
      description:
        "SkillHub separates discovery, execution, billing, and payout operations so third-party skill authors can publish while buyers keep control of cost and risk.",
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
        "The dashboard is split into publisher operations, buyer projects, earnings, and payout readiness so the platform can grow into real marketplace workflows.",
      publisher: "Publisher backend",
      buyer: "Developer backend",
      earnings: "Earnings",
      payouts: "Payouts",
      metrics: [
        ["Available balance", "$4,820"],
        ["Pending balance", "$1,260"],
        ["Billable calls", "38.4k"],
        ["Active subscriptions", "126"]
      ],
      publisherCards: [
        ["Skill pipeline", "3 submitted, 8 verified, 1 needs runtime fix"],
        ["Pricing", "Per-call and subscription pricing ready for review"],
        ["Analytics", "Latency, errors, conversion, and top consuming projects"]
      ],
      buyerCards: [
        ["Projects", "Agent projects with scoped API keys and budgets"],
        ["Subscriptions", "Approved paid skills, renewals, cancellations"],
        ["Usage", "Cost, calls, latency, and skill-level breakdowns"]
      ],
      ledgerTitle: "Revenue ledger",
      ledgerHeaders: ["Skill", "Gross", "Fee", "Net", "Status"],
      ledgerRows: [
        ["browser-research", "$1,240", "$248", "$992", "available"],
        ["support-triage", "$760", "$152", "$608", "pending"],
        ["schema-auditor", "$420", "$84", "$336", "available"]
      ],
      payoutTitle: "Withdrawal readiness",
      payoutItems: [
        ["Payout account", "Connected"],
        ["KYC status", "Verified"],
        ["Minimum threshold", "$100"],
        ["Next payout", "Scheduled review"]
      ]
    },
    adminPage: {
      eyebrow: "Platform admin",
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
      sdkTitle: "SDK-shaped integration",
      sdkBody: "The product surface is ready for SDK, CLI, and MCP clients to share the same registry source."
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
      publishNote: "Publishing is protected by an admin token while discovery remains public."
    },
    publishPage: {
      eyebrow: "Publish workflow",
      title: "Register a skill package.",
      description:
        "Paste a SkillHub manifest, review the contract, and publish it into the live registry behind useskillhub.com.",
      badge: "skillhub.json",
      consoleSubtitle: "publish console"
    },
    publishForm: {
      operatorAccess: "Operator access",
      adminToken: "Admin token",
      private: "Private",
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
      backToRegistry: "技能库",
      dashboard: "工作台",
      gateway: "网关",
      github: "GitHub",
      health: "健康状态",
      language: "语言",
      live: "在线",
      marketplace: "市场",
      mcp: "MCP",
      publish: "发布",
      publishSkill: "发布技能",
      subtitle: "给 AI 智能体使用的通用技能库。",
      viewContract: "查看协议"
    },
    nav: {
      home: "首页",
      marketplace: "市场",
      registry: "技能库",
      agents: "智能体",
      docs: "文档",
      dashboard: "工作台",
      developer: "开发者",
      publisher: "发布者",
      admin: "后台"
    },
    home: {
      eyebrow: "智能体技能基础设施",
      title: "让智能体发现、信任并运行通用技能。",
      description:
        "SkillHub 是给 AI 智能体使用的技能注册表、市场和运行网关：统一 manifest 格式、可搜索技能包、权限画像、可计费用量，以及面向智能体的 API。",
      publishCta: "发布一个技能",
      gatewayTitle: "生产网关",
      registryEyebrow: "技能库",
      registryTitle: "智能体技能注册表",
      newSkill: "新建技能",
      searchPlaceholder: "搜索技能、标签、运行时",
      protocolEyebrow: "协议",
      protocolTitle: "智能体执行之前，可以先读懂技能协议。",
      protocolBody:
        "SkillHub 技能包不是一段提示词，而是带运行时、输入输出 schema、权限、价格和审核状态的版本化能力。",
      manifestEyebrow: "skillhub.json",
      manifestTitle: "一份 manifest，同时服务人、智能体和运行网关。",
      manifestBody:
        "注册表接受简洁的 JSON manifest；它会驱动搜索结果、信任审核、SDK 生成、计费和 MCP 工具发现。",
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
          description: "付费发布、审核、退款和提现都放在带审计的后台控制里。"
        }
      ]
    },
    metrics: {
      publishedSkills: "已发布技能",
      verified: "已验证",
      apiCalls: "API 调用",
      avgLatency: "平均延迟",
      verifiedShare: "验证占比"
    },
    skillTable: {
      aria: "技能注册表",
      skill: "技能",
      tags: "标签",
      trust: "信任",
      risk: "风险",
      actions: "操作",
      manifestChecked: "Manifest 已检查",
      openManifest: "打开 manifest",
      emptyTitle: "还没有发布技能",
      emptyBody: "发布一个 SkillHub manifest 后，注册表会自动显示技能。",
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
      eyebrow: "公开技能库",
      title: "浏览可复用的智能体技能。",
      description: "搜索实时注册表，查看技能包风险，并通过公开 API 打开每个 manifest。",
      filtersTitle: "注册表筛选",
      filters: ["研究", "浏览器", "Schema", "低风险"],
      endpointTitle: "发现端点",
      endpointBody: "智能体和应用可以直接查询 SkillHub，不需要抓取界面内容。",
      packageTitle: "包信号",
      packageBody: "每个技能都包含信任状态、标签、版本和权限风险。"
    },
    marketplacePage: {
      eyebrow: "市场模型",
      title: "给发布者、开发者和智能体使用的技能市场。",
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
        "工作台拆成发布运营、购买方项目、收益和提现准备四块，这样平台以后可以自然接入真实市场流程。",
      publisher: "发布者后台",
      buyer: "开发者后台",
      earnings: "收益",
      payouts: "提现",
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
      ledgerTitle: "收益账本",
      ledgerHeaders: ["技能", "总收入", "佣金", "净收入", "状态"],
      ledgerRows: [
        ["browser-research", "$1,240", "$248", "$992", "可提现"],
        ["support-triage", "$760", "$152", "$608", "待结算"],
        ["schema-auditor", "$420", "$84", "$336", "可提现"]
      ],
      payoutTitle: "提现准备",
      payoutItems: [
        ["提现账户", "已连接"],
        ["KYC 状态", "已验证"],
        ["最低提现金额", "$100"],
        ["下一笔提现", "等待计划审核"]
      ]
    },
    adminPage: {
      eyebrow: "平台管理后台",
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
      sdkTitle: "面向 SDK 的集成形态",
      sdkBody: "产品界面已经为 SDK、CLI 和 MCP 客户端共享同一个注册表来源做好准备。"
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
      publishNote: "发布接口由管理员 token 保护，发现接口保持公开。"
    },
    publishPage: {
      eyebrow: "发布流程",
      title: "注册一个技能包。",
      description: "粘贴 SkillHub manifest，检查协议，然后发布到 useskillhub.com 后面的实时注册表。",
      badge: "skillhub.json",
      consoleSubtitle: "发布控制台"
    },
    publishForm: {
      operatorAccess: "运营权限",
      adminToken: "管理员 token",
      private: "私密",
      validJson: "JSON 有效",
      invalidJson: "JSON 无效",
      publishSkill: "发布技能",
      publishing: "发布中",
      reviewTitle: "Manifest 预检",
      reviewBody: "提交注册表前的协议检查。",
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

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
