import type { Locale } from "@/lib/i18n";

type LocalizedText = Record<Locale, string>;

export type MarketplaceSkill = {
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  author: string;
  category: LocalizedText;
  categoryKey: "research" | "data" | "code" | "docs" | "support";
  tags: Record<Locale, string[]>;
  price: LocalizedText;
  billing: "free" | "per_call" | "subscription";
  rating: string;
  feedbackCount?: number;
  installs: string;
  successRate: string;
  latency: string;
  runtime: "REST" | "MCP" | "Local";
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
  state: "example" | "live";
  status: LocalizedText;
};

export const marketplaceSkills: MarketplaceSkill[] = [
  {
    slug: "browser-research",
    name: {
      en: "Browser Research",
      zh: "浏览器研究",
    },
    summary: {
      en: "Search the web, collect source links, and return a structured research brief your agent can cite.",
      zh: "搜索网页、收集来源链接，并返回可被智能体引用的结构化研究简报。",
    },
    author: "SkillHub Official",
    category: {
      en: "Research",
      zh: "研究",
    },
    categoryKey: "research",
    tags: {
      en: ["research", "browser", "citations"],
      zh: ["研究", "浏览器", "引用"],
    },
    price: {
      en: "Free discovery",
      zh: "免费查看",
    },
    billing: "free",
    rating: "sample",
    feedbackCount: 0,
    installs: "Sample data",
    successRate: "Sample data",
    latency: "Sample data",
    runtime: "REST",
    verification: {
      en: "Verified",
      zh: "已验证",
    },
    risk: "medium",
    lastReviewed: "2026-06-14",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/browser-research"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "Example SDK configuration: browser-research",
    },
    permissions: [
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Required for public source retrieval", zh: "需要访问公开来源" },
      },
      {
        key: "browser",
        label: { en: "Browser", zh: "浏览器" },
        value: { en: "Sandboxed browsing only", zh: "仅沙箱浏览" },
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "None", zh: "无" },
      },
    ],
    useCases: [
      {
        en: "Prepare a cited research brief before an agent writes a final answer.",
        zh: "在智能体生成最终答案前，先准备带引用来源的研究简报。",
      },
      {
        en: "Validate claims, source freshness, and public references for market or product research.",
        zh: "为市场或产品研究校验事实、来源新鲜度和公开引用。",
      },
    ],
    securityReport: [
      {
        label: { en: "Review status", zh: "审核状态" },
        value: { en: "Verified listing", zh: "已验证上架" },
      },
      {
        label: { en: "Data handling", zh: "数据处理" },
        value: { en: "Request logs only; no page-content cache in the public listing.", zh: "仅记录请求日志；公开列表不缓存网页正文。" },
      },
      {
        label: { en: "Runtime control", zh: "运行控制" },
        value: { en: "Project Key required for invocation.", zh: "调用需要 Project Key。" },
      },
    ],
    changelog: [
      {
        version: "1.0.0",
        note: { en: "Initial verified public listing with manifest, permissions, and examples.", zh: "初始已验证公开上架，包含 manifest、权限和示例。" },
      },
    ],
    reviews: [
      {
        author: "SkillHub Review",
        quote: {
          en: "Verified for public inspection with medium-risk browser permissions.",
          zh: "已通过公开查看审核，浏览器权限为中风险。",
        },
      },
    ],
    inputExample: JSON.stringify(
      {
        query: "Find recent references about AI agent skill security",
        depth: "standard",
      },
      null,
      2,
    ),
    outputExample: JSON.stringify(
      {
        summary: "Recent references emphasize manifest inspection, scoped credentials, and runtime audit logs.",
        sources: [
          {
            title: "Agent skill security checklist",
            url: "https://example.com/agent-skill-security",
            date: "2026-06-10",
          },
        ],
        next_actions: [
          "Inspect requested browser permissions",
          "Run only with a scoped Project Key",
        ],
      },
      null,
      2,
    ),
  },
  {
    slug: "dataset-summarizer",
    name: {
      en: "Dataset Summarizer",
      zh: "数据集摘要",
    },
    summary: {
      en: "Turn spreadsheet rows into summaries, anomalies, and next actions for analysis agents.",
      zh: "把表格行转成摘要、异常点和下一步行动，供数据分析智能体使用。",
    },
    author: "SkillHub Labs",
    category: {
      en: "Data",
      zh: "数据",
    },
    categoryKey: "data",
    tags: {
      en: ["data", "analysis", "spreadsheet"],
      zh: ["数据", "分析", "表格"],
    },
    price: {
      en: "Inspection only",
      zh: "仅可查看",
    },
    billing: "free",
    rating: "review",
    feedbackCount: 0,
    installs: "0",
    successRate: "n/a",
    latency: "n/a",
    runtime: "REST",
    verification: {
      en: "Submitted",
      zh: "已提交",
    },
    risk: "medium",
    lastReviewed: "2026-06-14",
    installsCommand: {
      cli: 'curl "https://api.useskillhub.com/v1/skills/dataset-summarizer"',
      mcp: "https://api.useskillhub.com/mcp",
      sdk: "Example SDK configuration: dataset-summarizer",
    },
    permissions: [
      {
        key: "data",
        label: { en: "Uploaded data", zh: "上传数据" },
        value: { en: "Reads request rows only", zh: "仅读取请求中的数据行" },
      },
      {
        key: "network",
        label: { en: "Network", zh: "网络" },
        value: { en: "Not requested", zh: "未请求" },
      },
      {
        key: "secrets",
        label: { en: "Secrets", zh: "密钥" },
        value: { en: "None", zh: "无" },
      },
    ],
    useCases: [
      {
        en: "Summarize weekly sales rows before a business agent writes a report.",
        zh: "业务智能体写报告前，先总结每周销售数据。",
      },
      {
        en: "Flag anomalies and recommended follow-up questions before downstream automations run.",
        zh: "下游自动化运行前，先标记异常点和建议追问。",
      },
    ],
    securityReport: [
      {
        label: { en: "Review status", zh: "审核状态" },
        value: { en: "Submitted; not callable until verification completes.", zh: "已提交；验证完成前不可调用。" },
      },
      {
        label: { en: "Data handling", zh: "数据处理" },
        value: { en: "Input rows are scoped to a single request.", zh: "输入行仅限单次请求范围。" },
      },
      {
        label: { en: "Runtime control", zh: "运行控制" },
        value: { en: "Inspection only until review approval.", zh: "审核通过前仅可查看。" },
      },
    ],
    changelog: [
      {
        version: "0.1.0",
        note: { en: "Submitted for review with example input and output.", zh: "已提交审核，包含输入输出示例。" },
      },
    ],
    reviews: [
      {
        author: "SkillHub Review",
        quote: {
          en: "Pending verification. Public page is available for contract inspection only.",
          zh: "等待验证。公开页面仅用于合约检查。",
        },
      },
    ],
    inputExample: JSON.stringify(
      {
        rows: [
          { country: "US", sales: 1200, refunds: 32 },
          { country: "UK", sales: 860, refunds: 18 },
        ],
      },
      null,
      2,
    ),
    outputExample: JSON.stringify(
      {
        summary: "US has the highest sales volume, while refund rates remain stable.",
        anomalies: [
          "UK refund rate is 20% higher than the dataset average.",
        ],
        next_actions: [
          "Review UK refund reasons",
          "Compare sales performance by channel",
        ],
      },
      null,
      2,
    ),
  },
];

export const marketplaceRequests: MarketplaceRequest[] = [
  {
    title: {
      en: "Docs Q&A skill for private knowledge bases",
      zh: "面向私有知识库的文档问答 Skill",
    },
    bounty: "$600",
    due: {
      en: "Example request",
      zh: "示例需求",
    },
    state: "example",
    status: {
      en: "Open for publisher interest",
      zh: "开放发布者意向",
    },
  },
];

export const marketplaceCategories = [
  { key: "all", label: { en: "All", zh: "全部" } },
  { key: "research", label: { en: "Research", zh: "研究" } },
  { key: "data", label: { en: "Data", zh: "数据" } },
  { key: "code", label: { en: "Code", zh: "代码" } },
  { key: "docs", label: { en: "Docs", zh: "文档" } },
  { key: "support", label: { en: "Support", zh: "客服" } },
] as const;

export function getMarketplaceSkill(slug: string) {
  return marketplaceSkills.find((skill) => skill.slug === slug);
}

export function localizeText(value: LocalizedText, locale: Locale) {
  return value[locale] ?? value.en;
}
