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
  "shopify-product-copy": {
    description: {
      en: "Generate SEO-ready product titles, bullets, descriptions, and trust notes from approved product facts.",
      zh: "根据已确认的商品信息生成适合 SEO 的标题、卖点、描述和信任说明。",
    },
    displayName: { en: "Shopify Product Copy", zh: "Shopify 商品文案" },
    tags: {
      en: ["ecommerce", "shopify", "product", "copywriting", "seo"],
      zh: ["电商", "Shopify", "商品", "文案", "SEO"],
    },
  },
  "product-review-miner": {
    description: {
      en: "Analyze product reviews to extract objections, feature requests, sentiment themes, and copy angles.",
      zh: "分析商品评论，提取顾虑、功能需求、情绪主题和文案角度。",
    },
    displayName: { en: "Product Review Miner", zh: "商品评论洞察" },
    tags: {
      en: ["ecommerce", "reviews", "analysis", "product"],
      zh: ["电商", "评论", "分析", "商品"],
    },
  },
  "inventory-reorder-planner": {
    description: {
      en: "Turn SKU sales velocity, stock levels, and lead times into reorder priorities and shortage warnings.",
      zh: "根据 SKU 销速、库存和交期生成补货优先级与缺货预警。",
    },
    displayName: { en: "Inventory Reorder Planner", zh: "库存补货规划" },
    tags: {
      en: ["ecommerce", "inventory", "operations", "forecasting"],
      zh: ["电商", "库存", "运营", "预测"],
    },
  },
  "pricing-experiment-advisor": {
    description: {
      en: "Recommend pricing tests, guardrails, and expected tradeoffs from margin, conversion, and competitor signals.",
      zh: "根据毛利、转化和竞品信号推荐定价实验、保护规则和预期影响。",
    },
    displayName: { en: "Pricing Experiment Advisor", zh: "定价实验顾问" },
    tags: {
      en: ["ecommerce", "pricing", "analysis", "conversion"],
      zh: ["电商", "定价", "分析", "转化"],
    },
  },
  "ad-creative-brief": {
    description: {
      en: "Create channel-specific ad creative briefs with audience, offer, proof, hooks, and compliance notes.",
      zh: "按渠道生成广告创意简报，包含受众、卖点、证明、钩子和合规提醒。",
    },
    displayName: { en: "Ad Creative Brief", zh: "广告创意简报" },
    tags: {
      en: ["marketing", "ads", "creative", "brief"],
      zh: ["营销", "广告", "创意", "简报"],
    },
  },
  "campaign-performance-insights": {
    description: {
      en: "Summarize campaign performance, explain metric movement, and propose next tests for marketers.",
      zh: "总结投放表现，解释指标变化，并为营销团队提出下一轮测试。",
    },
    displayName: { en: "Campaign Performance Insights", zh: "投放效果洞察" },
    tags: {
      en: ["marketing", "campaign", "analytics", "analysis"],
      zh: ["营销", "活动", "数据分析", "洞察"],
    },
  },
  "social-content-calendar": {
    description: {
      en: "Build a social publishing calendar from campaign goals, audience segments, and approved brand topics.",
      zh: "根据活动目标、受众和品牌主题生成社媒发布日历。",
    },
    displayName: { en: "Social Content Calendar", zh: "社媒内容日历" },
    tags: {
      en: ["marketing", "social", "content", "calendar"],
      zh: ["营销", "社媒", "内容", "日历"],
    },
  },
  "utm-taxonomy-validator": {
    description: {
      en: "Check campaign URLs for UTM naming consistency, missing fields, duplicate sources, and reporting safety.",
      zh: "检查活动链接的 UTM 命名一致性、缺失字段、重复来源和报表安全性。",
    },
    displayName: { en: "UTM Taxonomy Validator", zh: "UTM 命名校验" },
    tags: {
      en: ["marketing", "analytics", "automation", "campaign"],
      zh: ["营销", "数据分析", "自动化", "活动"],
    },
  },
  "resume-screening-helper": {
    description: {
      en: "Compare resumes against role requirements and return evidence-based screening notes for human review.",
      zh: "按岗位要求对比简历，输出有证据的初筛记录供人工复核。",
    },
    displayName: { en: "Resume Screening Helper", zh: "简历初筛助手" },
    tags: {
      en: ["hr", "recruiting", "resume", "classification"],
      zh: ["HR", "招聘", "简历", "分类"],
    },
  },
  "interview-question-builder": {
    description: {
      en: "Create structured interview questions, rubrics, and follow-ups from role competencies.",
      zh: "根据岗位能力模型生成结构化面试题、评分标准和追问。",
    },
    displayName: { en: "Interview Question Builder", zh: "面试题生成器" },
    tags: {
      en: ["hr", "interview", "recruiting", "rubric"],
      zh: ["HR", "面试", "招聘", "评分表"],
    },
  },
  "employee-policy-answer": {
    description: {
      en: "Answer employee policy questions from approved handbook passages with citations and escalation notes.",
      zh: "基于已审核员工手册回答制度问题，并给出引用和升级建议。",
    },
    displayName: { en: "Employee Policy Answer", zh: "员工制度问答" },
    tags: {
      en: ["hr", "policy", "knowledge-base", "support"],
      zh: ["HR", "制度", "知识库", "支持"],
    },
  },
  "onboarding-plan-builder": {
    description: {
      en: "Build a 30-60-90 day onboarding plan from role, tools, policies, and manager priorities.",
      zh: "根据岗位、工具、制度和主管重点生成 30/60/90 天入职计划。",
    },
    displayName: { en: "Onboarding Plan Builder", zh: "入职计划生成器" },
    tags: {
      en: ["hr", "onboarding", "training", "operations"],
      zh: ["HR", "入职", "培训", "运营"],
    },
  },
  "contract-clause-extractor": {
    description: {
      en: "Extract renewal, termination, payment, data, and liability clauses from contracts for legal review.",
      zh: "从合同中提取续约、终止、付款、数据和责任条款，供法务复核。",
    },
    displayName: { en: "Contract Clause Extractor", zh: "合同条款提取" },
    tags: {
      en: ["legal", "contract", "compliance", "extraction"],
      zh: ["法务", "合同", "合规", "提取"],
    },
  },
  "privacy-policy-checker": {
    description: {
      en: "Check product data flows against privacy-policy promises and highlight missing disclosures.",
      zh: "将产品数据流与隐私政策承诺对照，标出缺失披露。",
    },
    displayName: { en: "Privacy Policy Checker", zh: "隐私政策检查" },
    tags: {
      en: ["legal", "privacy", "compliance", "security"],
      zh: ["法务", "隐私", "合规", "安全"],
    },
  },
  "vendor-risk-questionnaire": {
    description: {
      en: "Generate vendor security and compliance questionnaires from integration scope and data handling needs.",
      zh: "根据集成范围和数据处理需求生成供应商安全合规问卷。",
    },
    displayName: { en: "Vendor Risk Questionnaire", zh: "供应商风控问卷" },
    tags: {
      en: ["legal", "vendor-risk", "security", "compliance"],
      zh: ["法务", "供应商风控", "安全", "合规"],
    },
  },
  "terms-change-summarizer": {
    description: {
      en: "Compare two versions of legal terms and summarize meaningful customer, billing, or data changes.",
      zh: "对比两版条款，总结客户、计费或数据相关的重要变化。",
    },
    displayName: { en: "Terms Change Summarizer", zh: "条款变更摘要" },
    tags: {
      en: ["legal", "terms", "review", "summary"],
      zh: ["法务", "条款", "审查", "摘要"],
    },
  },
  "training-quiz-builder": {
    description: {
      en: "Create quiz questions, answer keys, and remediation notes from training material.",
      zh: "从培训材料生成测验题、答案和补学建议。",
    },
    displayName: { en: "Training Quiz Builder", zh: "培训测验生成器" },
    tags: {
      en: ["education", "training", "quiz", "content"],
      zh: ["教育", "培训", "测验", "内容"],
    },
  },
  "lesson-plan-adapter": {
    description: {
      en: "Adapt lesson plans by audience level, time limit, learning objective, and accessibility needs.",
      zh: "按受众水平、时间、学习目标和可访问性需求改写课程计划。",
    },
    displayName: { en: "Lesson Plan Adapter", zh: "课程计划改写" },
    tags: {
      en: ["education", "lesson", "training", "accessibility"],
      zh: ["教育", "课程", "培训", "可访问性"],
    },
  },
  "course-outline-generator": {
    description: {
      en: "Turn a target skill and learner profile into a course outline with modules and practice tasks.",
      zh: "根据学习目标和学员画像生成课程大纲、模块和练习任务。",
    },
    displayName: { en: "Course Outline Generator", zh: "课程大纲生成器" },
    tags: {
      en: ["education", "course", "training", "content"],
      zh: ["教育", "课程", "培训", "内容"],
    },
  },
  "rubric-feedback-assistant": {
    description: {
      en: "Apply a rubric to learner work and produce evidence-based feedback with improvement steps.",
      zh: "按评分表评估学员作品，生成有证据的反馈和改进步骤。",
    },
    displayName: { en: "Rubric Feedback Assistant", zh: "评分反馈助手" },
    tags: {
      en: ["education", "rubric", "feedback", "review"],
      zh: ["教育", "评分表", "反馈", "审查"],
    },
  },
  "churn-risk-summarizer": {
    description: {
      en: "Summarize customer usage, tickets, sentiment, and renewal signals into churn risk and save actions.",
      zh: "汇总客户使用、工单、情绪和续约信号，判断流失风险并给出挽留动作。",
    },
    displayName: { en: "Churn Risk Summarizer", zh: "客户流失风险摘要" },
    tags: {
      en: ["sales", "customer-success", "revenue", "analysis"],
      zh: ["销售", "客户成功", "收入", "分析"],
    },
  },
  "customer-health-brief": {
    description: {
      en: "Create account health briefs for customer success meetings from usage, tickets, goals, and stakeholders.",
      zh: "根据使用情况、工单、目标和联系人生成客户成功会议简报。",
    },
    displayName: { en: "Customer Health Brief", zh: "客户健康度简报" },
    tags: {
      en: ["sales", "customer-success", "crm", "summary"],
      zh: ["销售", "客户成功", "CRM", "摘要"],
    },
  },
  "meeting-action-extractor": {
    description: {
      en: "Extract owners, deadlines, decisions, risks, and follow-up messages from meeting notes.",
      zh: "从会议记录中提取负责人、截止时间、决策、风险和跟进消息。",
    },
    displayName: { en: "Meeting Action Extractor", zh: "会议行动项提取" },
    tags: {
      en: ["operations", "meeting", "automation", "summary"],
      zh: ["运营", "会议", "自动化", "摘要"],
    },
  },
  "incident-summary-writer": {
    description: {
      en: "Convert incident timeline notes into customer-safe summaries, internal learnings, and follow-up tasks.",
      zh: "将事故时间线转换为客户可见摘要、内部复盘和后续任务。",
    },
    displayName: { en: "Incident Summary Writer", zh: "事故摘要撰写" },
    tags: {
      en: ["operations", "incident", "support", "summary"],
      zh: ["运营", "事故", "客服", "摘要"],
    },
  },
  "dashboard-anomaly-explainer": {
    description: {
      en: "Explain metric spikes or drops using dashboard rows, segment changes, and recent business events.",
      zh: "根据看板数据、分组变化和近期业务事件解释指标异常。",
    },
    displayName: { en: "Dashboard Anomaly Explainer", zh: "看板异常解释" },
    tags: {
      en: ["data", "dashboard", "anomaly", "analysis"],
      zh: ["数据", "看板", "异常", "分析"],
    },
  },
  "sql-question-translator": {
    description: {
      en: "Translate a plain-English analytics question into safe SQL draft, assumptions, and validation checks.",
      zh: "把自然语言数据问题转成安全 SQL 草稿、假设和校验项。",
    },
    displayName: { en: "SQL Question Translator", zh: "SQL 问题转换器" },
    tags: {
      en: ["data", "sql", "analysis", "dev"],
      zh: ["数据", "SQL", "分析", "开发"],
    },
  },
  "release-note-generator": {
    description: {
      en: "Turn commits, tickets, and product notes into user-facing release notes and internal QA reminders.",
      zh: "将提交、工单和产品说明转成用户更新日志和内部 QA 提醒。",
    },
    displayName: { en: "Release Note Generator", zh: "更新日志生成器" },
    tags: {
      en: ["dev", "release", "content", "summary"],
      zh: ["开发", "发布", "内容", "摘要"],
    },
  },
  "log-error-clusterer": {
    description: {
      en: "Cluster application logs into likely root causes, affected surfaces, and investigation priorities.",
      zh: "把应用日志聚类为可能根因、影响范围和排查优先级。",
    },
    displayName: { en: "Log Error Clusterer", zh: "日志错误聚类" },
    tags: {
      en: ["dev", "logs", "incident", "analysis"],
      zh: ["开发", "日志", "事故", "分析"],
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
    zh:
      skillLocalizations[slug]?.tags.zh ??
      tags.map((tag) => tagLabels[tag.toLowerCase()] ?? tag),
  };
}
