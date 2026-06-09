import type { Locale } from "@/lib/i18n";

type LocalizedText = Record<Locale, string>;

export type MarketplaceSkill = {
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  author: string;
  category: LocalizedText;
  categoryKey: "research" | "sales" | "support" | "data" | "security" | "ops";
  tags: Record<Locale, string[]>;
  price: LocalizedText;
  billing: "free" | "per_call" | "subscription";
  rating: string;
  feedbackCount?: number;
  installs: string;
  successRate: string;
  latency: string;
  runtime: "HTTP" | "MCP" | "Local";
  verification: LocalizedText;
  risk: "low" | "medium" | "high";
  lastReviewed: string;
  installsCommand: {
    cli: string;
    mcp: string;
    sdk: string;
  };
  permissions: Array<{
    key: string;
    label: LocalizedText;
    value: LocalizedText;
  }>;
  useCases: LocalizedText[];
  securityReport: Array<{
    label: LocalizedText;
    value: LocalizedText;
  }>;
  changelog: Array<{
    version: string;
    note: LocalizedText;
  }>;
  reviews: Array<{
    author: string;
    quote: LocalizedText;
  }>;
  inputExample: string;
  outputExample: string;
};

export type MarketplaceRequest = {
  title: LocalizedText;
  bounty: string;
  due: LocalizedText;
  status: LocalizedText;
};

export const marketplaceSkills: MarketplaceSkill[] = [
  {
    slug: "browser-research-pro",
    name: {
      en: "Browser Research Pro",
      zh: "浏览器研究专家"
    },
    summary: {
      en: "Runs multi-source web research, extracts citations, and returns a structured brief agents can cite.",
      zh: "执行多来源网页研究，提取引用来源，并返回智能体可以直接引用的结构化简报。"
    },
    author: "SkillHub Labs",
    category: {
      en: "Research",
      zh: "研究"
    },
    categoryKey: "research",
    tags: {
      en: ["citations", "browser", "research"],
      zh: ["引用", "浏览器", "研究"]
    },
    price: {
      en: "$0.018 / call",
      zh: "$0.018 / 次"
    },
    billing: "per_call",
    rating: "4.9",
    feedbackCount: 248,
    installs: "12.8k",
    successRate: "98.2%",
    latency: "1.8s",
    runtime: "HTTP",
    verification: {
      en: "Verified",
      zh: "已验证"
    },
    risk: "medium",
    lastReviewed: "2026-06-04",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/browser-research-pro"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: browser-research-pro"
    },
    permissions: [
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Required for source retrieval", zh: "需要访问公开来源" }
      },
      {
        key: "browser",
        label: { en: "Browser", zh: "浏览器" },
        value: { en: "Sandboxed browsing only", zh: "仅沙箱浏览" }
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "None", zh: "无" }
      }
    ],
    useCases: [
      {
        en: "Competitive research brief with URLs, dates, and quoted source titles.",
        zh: "带 URL、日期和来源标题的竞品研究简报。"
      },
      {
        en: "Agent planner step that validates claims before writing a final answer.",
        zh: "智能体在生成最终答案前，用它校验事实和来源。"
      },
      {
        en: "Weekly market scan for sales, product, and investment teams.",
        zh: "给销售、产品和投资团队使用的每周市场扫描。"
      }
    ],
    securityReport: [
      {
        label: { en: "Runtime test", zh: "运行测试" },
        value: { en: "Passed synthetic citation checks", zh: "通过模拟引用检查" }
      },
      {
        label: { en: "Data retention", zh: "数据保留" },
        value: { en: "Request logs 30 days, no page cache", zh: "请求日志 30 天，不缓存网页正文" }
      },
      {
        label: { en: "Human review", zh: "人工审核" },
        value: { en: "Approved for medium-risk browsing", zh: "已批准中风险浏览权限" }
      }
    ],
    changelog: [
      {
        version: "1.4.2",
        note: { en: "Added source freshness scoring.", zh: "增加来源新鲜度评分。" }
      },
      {
        version: "1.3.0",
        note: { en: "Improved citation extraction for dynamic pages.", zh: "优化动态页面引用提取。" }
      }
    ],
    reviews: [
      {
        author: "OpsPilot",
        quote: {
          en: "The citation format is predictable enough for our agent evaluator.",
          zh: "引用格式足够稳定，可以直接进入我们的智能体评估流程。"
        }
      }
    ],
    inputExample: '{ "query": "latest MCP server registry trends", "depth": "standard" }',
    outputExample: '{ "summary": "...", "sources": [{ "title": "...", "url": "...", "date": "2026-06-04" }] }'
  },
  {
    slug: "crm-enrichment",
    name: {
      en: "CRM Enrichment",
      zh: "CRM 线索增强"
    },
    summary: {
      en: "Enriches accounts with company signals, role hints, and next best action for sales agents.",
      zh: "为销售智能体补全公司信号、角色线索和下一步行动建议。"
    },
    author: "Revenue Tools",
    category: {
      en: "Sales",
      zh: "销售"
    },
    categoryKey: "sales",
    tags: {
      en: ["crm", "sales", "enrichment"],
      zh: ["CRM", "销售", "线索增强"]
    },
    price: {
      en: "$29 / month",
      zh: "$29 / 月"
    },
    billing: "subscription",
    rating: "4.8",
    feedbackCount: 186,
    installs: "8.4k",
    successRate: "96.7%",
    latency: "2.4s",
    runtime: "HTTP",
    verification: {
      en: "Policy review",
      zh: "政策审核中"
    },
    risk: "medium",
    lastReviewed: "2026-06-02",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/crm-enrichment"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: crm-enrichment"
    },
    permissions: [
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Public company sources", zh: "公开公司来源" }
      },
      {
        key: "browser",
        label: { en: "Browser", zh: "浏览器" },
        value: { en: "No browser automation", zh: "无浏览器自动化" }
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "Optional CRM token", zh: "可选 CRM token" }
      }
    ],
    useCases: [
      {
        en: "Fill missing firmographic fields before an outreach agent drafts email.",
        zh: "外呼智能体写邮件前，补齐公司画像字段。"
      },
      {
        en: "Route enterprise accounts to account executives with higher confidence.",
        zh: "更高置信度地把企业客户路由给客户经理。"
      }
    ],
    securityReport: [
      {
        label: { en: "PII policy", zh: "PII 政策" },
        value: { en: "No personal profile scraping", zh: "不抓取个人资料页" }
      },
      {
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "Token vault required before paid launch", zh: "付费上线前必须接入 token vault" }
      }
    ],
    changelog: [
      {
        version: "0.9.1",
        note: { en: "Added region-specific enrichment rules.", zh: "增加区域化线索增强规则。" }
      }
    ],
    reviews: [
      {
        author: "PipelineOps",
        quote: {
          en: "A good fit for sales agents that need structured account context.",
          zh: "很适合需要结构化客户上下文的销售智能体。"
        }
      }
    ],
    inputExample: '{ "domain": "example.com", "region": "US" }',
    outputExample: '{ "company": "...", "signals": ["..."], "nextAction": "..." }'
  },
  {
    slug: "support-triage",
    name: {
      en: "Support Triage",
      zh: "客服工单分诊"
    },
    summary: {
      en: "Classifies support tickets by priority, product area, refund risk, and escalation owner.",
      zh: "按优先级、产品区域、退款风险和升级负责人分类客服工单。"
    },
    author: "SkillHub Labs",
    category: {
      en: "Support",
      zh: "客服"
    },
    categoryKey: "support",
    tags: {
      en: ["support", "routing", "classification"],
      zh: ["客服", "路由", "分类"]
    },
    price: {
      en: "Free",
      zh: "免费"
    },
    billing: "free",
    rating: "4.7",
    feedbackCount: 311,
    installs: "15.2k",
    successRate: "99.1%",
    latency: "620ms",
    runtime: "HTTP",
    verification: {
      en: "Verified",
      zh: "已验证"
    },
    risk: "low",
    lastReviewed: "2026-06-01",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/support-triage"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: support-triage"
    },
    permissions: [
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Not required", zh: "不需要" }
      },
      {
        key: "browser",
        label: { en: "Browser", zh: "浏览器" },
        value: { en: "Not required", zh: "不需要" }
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "None", zh: "无" }
      }
    ],
    useCases: [
      {
        en: "Route urgent billing issues before an agent drafts a response.",
        zh: "在智能体回复前先识别紧急账单问题。"
      },
      {
        en: "Detect refund or cancellation risk in inbound support messages.",
        zh: "识别入站工单里的退款或取消风险。"
      }
    ],
    securityReport: [
      {
        label: { en: "Runtime test", zh: "运行测试" },
        value: { en: "Passed 120 classification fixtures", zh: "通过 120 条分类样例" }
      },
      {
        label: { en: "Permission profile", zh: "权限画像" },
        value: { en: "Low risk, no external access", zh: "低风险，无外部访问" }
      }
    ],
    changelog: [
      {
        version: "1.1.0",
        note: { en: "Added refund-risk output field.", zh: "增加退款风险输出字段。" }
      }
    ],
    reviews: [
      {
        author: "HelpDesk AI",
        quote: {
          en: "Low latency and stable labels made it easy to put in production.",
          zh: "延迟低、标签稳定，很容易放进生产流程。"
        }
      }
    ],
    inputExample: '{ "message": "I was charged twice and need a refund today" }',
    outputExample: '{ "priority": "high", "category": "billing", "refundRisk": true }'
  },
  {
    slug: "dataset-insight",
    name: {
      en: "Dataset Insight",
      zh: "数据集洞察"
    },
    summary: {
      en: "Turns spreadsheet rows into anomalies, segments, metric deltas, and follow-up questions.",
      zh: "把表格行转换为异常点、分群、指标变化和后续追问。"
    },
    author: "Analyst Forge",
    category: {
      en: "Data",
      zh: "数据"
    },
    categoryKey: "data",
    tags: {
      en: ["spreadsheet", "analysis", "anomaly"],
      zh: ["表格", "分析", "异常"]
    },
    price: {
      en: "$0.012 / call",
      zh: "$0.012 / 次"
    },
    billing: "per_call",
    rating: "4.6",
    feedbackCount: 142,
    installs: "6.9k",
    successRate: "97.5%",
    latency: "1.1s",
    runtime: "HTTP",
    verification: {
      en: "Verified",
      zh: "已验证"
    },
    risk: "medium",
    lastReviewed: "2026-05-30",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/dataset-insight"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: dataset-insight"
    },
    permissions: [
      {
        key: "filesystem",
        label: { en: "Filesystem", zh: "文件系统" },
        value: { en: "Read uploaded file only", zh: "仅读取上传文件" }
      },
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Not required", zh: "不需要" }
      }
    ],
    useCases: [
      {
        en: "Summarize weekly sales CSV files before a business agent writes the report.",
        zh: "业务智能体写报告前，先总结每周销售 CSV。"
      },
      {
        en: "Flag outliers and missing data before downstream automations run.",
        zh: "下游自动化运行前先标记异常值和缺失数据。"
      }
    ],
    securityReport: [
      {
        label: { en: "File scope", zh: "文件范围" },
        value: { en: "Read-only uploaded artifact", zh: "只读上传产物" }
      },
      {
        label: { en: "Output schema", zh: "输出 schema" },
        value: { en: "Strict anomaly and summary fields", zh: "严格的异常和摘要字段" }
      }
    ],
    changelog: [
      {
        version: "0.8.4",
        note: { en: "Added metric delta detection.", zh: "增加指标变化检测。" }
      }
    ],
    reviews: [
      {
        author: "FinanceAgent",
        quote: {
          en: "The structured anomaly output reduced manual spreadsheet review.",
          zh: "结构化异常输出减少了人工查表时间。"
        }
      }
    ],
    inputExample: '{ "rows": [{ "region": "NA", "revenue": 4800 }] }',
    outputExample: '{ "summary": "...", "anomalies": ["..."], "questions": ["..."] }'
  },
  {
    slug: "codebase-risk-scanner",
    name: {
      en: "Codebase Risk Scanner",
      zh: "代码库风险扫描"
    },
    summary: {
      en: "Scans a repository snapshot for risky files, exposed secrets patterns, and owner-review hints.",
      zh: "扫描代码库快照，识别风险文件、疑似密钥模式和负责人审核提示。"
    },
    author: "SecureOps Studio",
    category: {
      en: "Security",
      zh: "安全"
    },
    categoryKey: "security",
    tags: {
      en: ["security", "code", "review"],
      zh: ["安全", "代码", "审查"]
    },
    price: {
      en: "$49 / month",
      zh: "$49 / 月"
    },
    billing: "subscription",
    rating: "4.8",
    feedbackCount: 96,
    installs: "5.1k",
    successRate: "95.8%",
    latency: "3.2s",
    runtime: "Local",
    verification: {
      en: "Restricted",
      zh: "受限技能"
    },
    risk: "high",
    lastReviewed: "2026-05-28",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/codebase-risk-scanner"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: codebase-risk-scanner"
    },
    permissions: [
      {
        key: "filesystem",
        label: { en: "Filesystem", zh: "文件系统" },
        value: { en: "Read repository snapshot", zh: "读取代码库快照" }
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "No secret access, pattern checks only", zh: "不读取密钥，仅做模式检查" }
      }
    ],
    useCases: [
      {
        en: "Preflight risky repository changes before an autonomous coding agent commits.",
        zh: "自动编码智能体提交前，对代码库改动做风险预检。"
      },
      {
        en: "Generate owner-review hints for sensitive files.",
        zh: "为敏感文件生成负责人审核提示。"
      }
    ],
    securityReport: [
      {
        label: { en: "Execution", zh: "执行" },
        value: { en: "Local only, no network", zh: "仅本地执行，不访问网络" }
      },
      {
        label: { en: "Risk gate", zh: "风险门槛" },
        value: { en: "Requires project owner approval", zh: "需要项目 owner 批准" }
      }
    ],
    changelog: [
      {
        version: "0.7.0",
        note: { en: "Added repository ownership hints.", zh: "增加代码库负责人提示。" }
      }
    ],
    reviews: [
      {
        author: "PlatformSec",
        quote: {
          en: "High-risk, but exactly the kind of tool that needs explicit registry permissions.",
          zh: "风险较高，但正是需要明确注册表权限控制的工具。"
        }
      }
    ],
    inputExample: '{ "path": ".", "changedFilesOnly": true }',
    outputExample: '{ "risk": "medium", "findings": [{ "file": "...", "reason": "..." }] }'
  },
  {
    slug: "invoice-extraction",
    name: {
      en: "Invoice Extraction",
      zh: "发票字段提取"
    },
    summary: {
      en: "Extracts vendor, tax, line items, due dates, and approval hints from invoices for finance agents.",
      zh: "为财务智能体从发票中提取供应商、税费、行项目、到期日和审批提示。"
    },
    author: "Backoffice AI",
    category: {
      en: "Operations",
      zh: "运营"
    },
    categoryKey: "ops",
    tags: {
      en: ["invoice", "extraction", "finance"],
      zh: ["发票", "提取", "财务"]
    },
    price: {
      en: "$0.021 / call",
      zh: "$0.021 / 次"
    },
    billing: "per_call",
    rating: "4.7",
    feedbackCount: 118,
    installs: "4.8k",
    successRate: "96.1%",
    latency: "1.9s",
    runtime: "HTTP",
    verification: {
      en: "Verified",
      zh: "已验证"
    },
    risk: "medium",
    lastReviewed: "2026-05-26",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/invoice-extraction"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "CLI/SDK preview: invoice-extraction"
    },
    permissions: [
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Fetch signed file URL", zh: "读取签名文件 URL" }
      },
      {
        key: "data",
        label: { en: "Data", zh: "数据" },
        value: { en: "Invoice fields only", zh: "仅处理发票字段" }
      }
    ],
    useCases: [
      {
        en: "Extract payable fields before a finance agent routes approvals.",
        zh: "财务智能体路由审批前提取应付字段。"
      },
      {
        en: "Detect missing purchase order or suspicious amount deltas.",
        zh: "识别缺失采购单或异常金额变化。"
      }
    ],
    securityReport: [
      {
        label: { en: "File access", zh: "文件访问" },
        value: { en: "Signed URL expires after request", zh: "签名 URL 请求后过期" }
      },
      {
        label: { en: "Retention", zh: "保留" },
        value: { en: "Extracted metadata 14 days", zh: "提取元数据保留 14 天" }
      }
    ],
    changelog: [
      {
        version: "1.0.3",
        note: { en: "Added purchase order mismatch output.", zh: "增加采购单不匹配输出。" }
      }
    ],
    reviews: [
      {
        author: "AP Desk",
        quote: {
          en: "The approval hints are more useful than plain OCR output.",
          zh: "审批提示比普通 OCR 输出更有用。"
        }
      }
    ],
    inputExample: '{ "fileUrl": "https://signed.example.com/invoice.pdf" }',
    outputExample: '{ "vendor": "...", "amount": 1280, "dueDate": "2026-06-30" }'
  }
];

export const marketplaceRequests: MarketplaceRequest[] = [
  {
    title: {
      en: "Figma change request to Linear issue",
      zh: "Figma 变更请求转 Linear 任务"
    },
    bounty: "$600",
    due: {
      en: "7 days",
      zh: "7 天"
    },
    status: {
      en: "Open",
      zh: "开放"
    }
  },
  {
    title: {
      en: "Shopify product operations skill",
      zh: "Shopify 商品运营技能"
    },
    bounty: "$900",
    due: {
      en: "12 days",
      zh: "12 天"
    },
    status: {
      en: "Spec review",
      zh: "需求审核"
    }
  },
  {
    title: {
      en: "Slack incident summarizer",
      zh: "Slack 事故总结技能"
    },
    bounty: "$450",
    due: {
      en: "5 days",
      zh: "5 天"
    },
    status: {
      en: "Matched",
      zh: "已匹配"
    }
  }
];

export const marketplaceCategories = [
  { key: "all", label: { en: "All", zh: "全部" } },
  { key: "research", label: { en: "Research", zh: "研究" } },
  { key: "sales", label: { en: "Sales", zh: "销售" } },
  { key: "support", label: { en: "Support", zh: "客服" } },
  { key: "data", label: { en: "Data", zh: "数据" } },
  { key: "security", label: { en: "Security", zh: "安全" } },
  { key: "ops", label: { en: "Operations", zh: "运营" } }
] as const;

export function getMarketplaceSkill(slug: string) {
  return marketplaceSkills.find((skill) => skill.slug === slug);
}

export function localizeText(value: LocalizedText, locale: Locale) {
  return value[locale] ?? value.en;
}
