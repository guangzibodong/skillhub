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
};

const tagLabels: Record<string, string> = {
  analysis: "分析",
  anomaly: "异常",
  browser: "浏览器",
  citations: "引用来源",
  classification: "分类",
  code: "代码",
  crm: "CRM",
  data: "数据",
  enrichment: "线索增强",
  extraction: "提取",
  finance: "财务",
  invoice: "发票",
  ops: "运营",
  research: "研究",
  review: "审查",
  routing: "路由",
  sales: "销售",
  security: "安全",
  spreadsheet: "电子表格",
  summary: "摘要",
  support: "支持",
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
