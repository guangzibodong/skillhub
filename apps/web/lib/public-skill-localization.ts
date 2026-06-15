import type { Locale } from "@/lib/i18n";

type PublicSkillLocalization = {
  description: Record<Locale, string>;
  displayName: Record<Locale, string>;
  tags: Record<Locale, string[]>;
};

const skillLocalizations: Record<string, PublicSkillLocalization> = {
  "browser-research": {
    description: {
      en: "Research a web topic and return concise findings with source URLs.",
      zh: "调研一个网页主题，并返回带来源链接的简洁结论。",
    },
    displayName: {
      en: "Browser Research",
      zh: "浏览器调研",
    },
    tags: {
      en: ["research", "browser", "citations"],
      zh: ["研究", "浏览器", "引用来源"],
    },
  },
  "dataset-summarizer": {
    description: {
      en: "Convert tabular data into structured notes, anomalies, and next actions.",
      zh: "将表格数据转换为结构化笔记、异常点和下一步行动。",
    },
    displayName: {
      en: "Dataset Summarizer",
      zh: "数据集摘要",
    },
    tags: {
      en: ["data", "analysis", "summary"],
      zh: ["数据", "分析", "摘要"],
    },
  },
  "seo-page-auditor": {
    description: {
      en: "Audit a public page for SEO issues, schema gaps, and indexability blockers.",
      zh: "诊断公开页面的 SEO 问题、结构化数据缺口和收录阻碍。",
    },
    displayName: {
      en: "SEO Page Auditor",
      zh: "SEO 页面诊断",
    },
    tags: {
      en: ["seo", "schema", "search"],
      zh: ["SEO", "结构化数据", "搜索"],
    },
  },
  "ui-ux-reviewer": {
    description: {
      en: "Review screenshots for hierarchy, spacing, mobile layout, and accessibility issues.",
      zh: "评审截图里的视觉层级、间距、移动端排版和可访问性问题。",
    },
    displayName: {
      en: "UI/UX Reviewer",
      zh: "UI/UX 体验评审",
    },
    tags: {
      en: ["ui", "ux", "accessibility"],
      zh: ["UI", "UX", "可访问性"],
    },
  },
  "content-brief-builder": {
    description: {
      en: "Turn audience, keyword, and competitor notes into an article or landing-page brief.",
      zh: "把受众、关键词和竞品笔记转换成文章或落地页内容简报。",
    },
    displayName: {
      en: "Content Brief Builder",
      zh: "内容简报生成",
    },
    tags: {
      en: ["content", "brief", "copywriting"],
      zh: ["内容", "简报", "文案"],
    },
  },
  "api-contract-tester": {
    description: {
      en: "Validate examples and backward-compatibility rules for API or manifest contracts.",
      zh: "校验 API 或 manifest 合约示例和向后兼容规则。",
    },
    displayName: {
      en: "API Contract Tester",
      zh: "API 合约测试",
    },
    tags: {
      en: ["api", "contract", "development"],
      zh: ["API", "合约", "开发"],
    },
  },
};

const tagLabels: Record<string, string> = {
  accessibility: "可访问性",
  analysis: "分析",
  anomaly: "异常",
  api: "API",
  audit: "诊断",
  brief: "简报",
  browser: "浏览器",
  canonical: "canonical",
  citations: "引用来源",
  classification: "分类",
  code: "代码",
  content: "内容",
  contract: "合约",
  copywriting: "文案",
  crm: "CRM",
  data: "数据",
  dev: "开发",
  development: "开发",
  enrichment: "线索增强",
  extraction: "提取",
  finance: "财务",
  frontend: "前端",
  indexability: "收录",
  invoice: "发票",
  openapi: "OpenAPI",
  operations: "运营",
  ops: "运营",
  research: "研究",
  review: "审查",
  routing: "路由",
  sales: "销售",
  schema: "结构化数据",
  sdk: "SDK",
  search: "搜索",
  security: "安全",
  seo: "SEO",
  spreadsheet: "电子表格",
  summary: "摘要",
  support: "支持",
  ui: "UI",
  ux: "UX",
};

export function publicSkillDisplayName(
  slug: string,
  fallback: string,
): Record<Locale, string> {
  return {
    en: skillLocalizations[slug]?.displayName.en ?? fallback,
    zh: skillLocalizations[slug]?.displayName.zh ?? fallback,
  };
}

export function publicSkillDescription(
  slug: string,
  fallback: string,
): Record<Locale, string> {
  return {
    en: skillLocalizations[slug]?.description.en ?? fallback,
    zh: skillLocalizations[slug]?.description.zh ?? fallback,
  };
}

export function publicSkillTags(
  slug: string,
  tags: string[],
): Record<Locale, string[]> {
  return {
    en: tags,
    zh: skillLocalizations[slug]?.tags.zh ?? tags.map((tag) => tagLabels[tag.toLowerCase()] ?? tag),
  };
}
