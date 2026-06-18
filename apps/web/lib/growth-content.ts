import type { NavPage } from "@/components/home/nav";
import type { Locale } from "@/lib/locale-routing";
import type { LocalizedSeo } from "@/lib/seo";

export type GrowthHubKey = "blog" | "examples" | "integrations" | "solutions" | "use-cases";

export type GrowthContentItem = {
  category: Record<Locale, string>;
  content: {
    en: GrowthContentBody;
    zh: GrowthContentBody;
  };
  featuredSkillSlugs?: string[];
  hub: GrowthHubKey;
  path: string;
  seo: Record<Locale, LocalizedSeo>;
  slug: string;
};

export type GrowthContentBody = {
  checklist: string[];
  intro: string;
  sections: Array<{
    body: string;
    bullets?: string[];
    title: string;
  }>;
  title: string;
};

export type GrowthHub = {
  active?: NavPage;
  eyebrow: Record<Locale, string>;
  intro: Record<Locale, string>;
  path: string;
  seo: Record<Locale, LocalizedSeo>;
  title: Record<Locale, string>;
};

export const growthHubs: Record<GrowthHubKey, GrowthHub> = {
  blog: {
    active: "blog",
    eyebrow: { en: "SkillHub resources", zh: "SkillHub 资源" },
    intro: {
      en: "Practical explainers for teams adopting AI Agent Skills, MCP, governed runtime, SEO/GEO automation, and marketplace operations.",
      zh: "面向团队采用 AI Agent Skill、MCP、运行治理、SEO/GEO 自动化和技能市场运营的实用文章。",
    },
    path: "/blog",
    seo: {
      en: {
        title: "SkillHub Blog - AI Agent Skills, MCP, GEO, and Skill Marketplace Guides",
        description:
          "Read SkillHub guides on AI Agent Skills, MCP, governed skill marketplaces, SEO/GEO automation, and operational workflows.",
      },
      zh: {
        title: "SkillHub 博客 - AI Agent Skill、MCP、GEO 与技能市场指南",
        description:
          "阅读 SkillHub 关于 AI Agent Skill、MCP、技能市场治理、SEO/GEO 自动化和运营工作流的指南。",
      },
    },
    title: { en: "Guides for operating AI Agent Skills", zh: "AI Agent Skill 运营指南" },
  },
  solutions: {
    active: "solutions",
    eyebrow: { en: "Solutions", zh: "解决方案" },
    intro: {
      en: "Role and department pages that explain which SkillHub workflows to start with, what buyers should verify, and how teams move from discovery to governed runtime.",
      zh: "按团队和业务部门说明应该从哪些 SkillHub 工作流开始、买家要检查什么，以及如何从发现技能走到受治理运行。",
    },
    path: "/solutions",
    seo: {
      en: {
        title: "SkillHub Solutions - AI Skills for SEO, E-commerce, Support, Sales, Data, and Security",
        description:
          "Explore SkillHub solution pages for SEO/GEO, e-commerce operations, support automation, sales CRM, data cleanup, UI QA, developer tools, and security review.",
      },
      zh: {
        title: "SkillHub 解决方案 - SEO、电商、客服、销售、数据与安全 AI 技能",
        description:
          "查看 SkillHub 面向 SEO/GEO、电商运营、客服自动化、销售 CRM、数据清洗、UI 质检、开发工具和安全审核的解决方案。",
      },
    },
    title: { en: "Solutions by business workflow", zh: "按业务工作流选择解决方案" },
  },
  "use-cases": {
    active: "use-cases",
    eyebrow: { en: "Use cases", zh: "使用场景" },
    intro: {
      en: "Concrete workflow pages for buyers who know the job they need to improve but do not yet know which Skill to adopt.",
      zh: "给已经知道要改善哪类工作、但还不知道采用哪个 Skill 的客户看的具体场景页。",
    },
    path: "/use-cases",
    seo: {
      en: {
        title: "SkillHub Use Cases - AI Agent Skill Workflows by Job to Be Done",
        description:
          "Browse practical AI Agent Skill use cases for SEO, content, customer support, Shopify, CRM, spreadsheets, UI QA, developer QA, and security.",
      },
      zh: {
        title: "SkillHub 使用场景 - 按任务选择 AI Agent Skill 工作流",
        description:
          "浏览 SEO、内容、客服、Shopify、CRM、表格、UI 质检、开发 QA 和安全场景下的 AI Agent Skill 用法。",
      },
    },
    title: { en: "Use cases by job to be done", zh: "按任务查找使用场景" },
  },
  examples: {
    active: "examples",
    eyebrow: { en: "Examples", zh: "示例" },
    intro: {
      en: "Reference workflows and templates. These are example operating patterns, not claims about real customer deployments.",
      zh: "参考工作流和模板。这些是示例运营模式，不是假客户案例，也不声称是真实客户部署。",
    },
    path: "/examples",
    seo: {
      en: {
        title: "SkillHub Examples - AI Agent Skill Workflow Templates",
        description:
          "Use SkillHub examples for manifest structure, permission review, REST/MCP inspection, runtime evidence, and workflow handoff templates.",
      },
      zh: {
        title: "SkillHub 示例 - AI Agent Skill 工作流模板",
        description:
          "使用 SkillHub 示例了解 manifest 结构、权限审核、REST/MCP 检查、运行证据和工作流交接模板。",
      },
    },
    title: { en: "Example workflows and templates", zh: "示例工作流与模板" },
  },
  integrations: {
    active: "integrations",
    eyebrow: { en: "Integrations", zh: "集成" },
    intro: {
      en: "Integration guidance for REST, MCP, webhooks, project keys, and common business systems that teams connect to SkillHub workflows.",
      zh: "面向 REST、MCP、Webhook、Project Key 以及团队常见业务系统接入 SkillHub 工作流的集成说明。",
    },
    path: "/integrations",
    seo: {
      en: {
        title: "SkillHub Integrations - REST, MCP, Webhooks, Project Keys, and Business Systems",
        description:
          "Plan SkillHub integrations across REST APIs, MCP clients, webhooks, project keys, Sheets, CRM, Shopify, GitHub, Notion, and support tools.",
      },
      zh: {
        title: "SkillHub 集成 - REST、MCP、Webhook、Project Key 与业务系统",
        description:
          "规划 SkillHub 与 REST API、MCP 客户端、Webhook、Project Key、表格、CRM、Shopify、GitHub、Notion 和客服工具的集成。",
      },
    },
    title: { en: "Integration paths for governed Skills", zh: "受治理 Skill 的集成路径" },
  },
};

export const growthContentItems: GrowthContentItem[] = [
  makeItem("blog", "what-is-ai-agent-skill", "Concept", "概念", [
    "What an AI Agent Skill is",
    "什么是 AI Agent Skill",
    "An AI Agent Skill is a reusable capability with a manifest, input/output schema, permission profile, runtime entrypoint, publisher metadata, and review state. Treat it like infrastructure, not a prompt snippet.",
    "AI Agent Skill 是带有 manifest、输入输出 schema、权限画像、运行入口、发布者信息和审核状态的可复用能力。它更像基础设施，不是简单提示词片段。",
  ]),
  makeItem("blog", "mcp-vs-skillhub", "Architecture", "架构", [
    "MCP and SkillHub are complementary",
    "MCP 和 SkillHub 如何配合",
    "MCP helps agents discover and call tools. SkillHub adds marketplace discovery, publisher trust, permission review, project policy, runtime evidence, and commercial readiness around those tools.",
    "MCP 帮助智能体发现和调用工具；SkillHub 在工具外层补上市场发现、发布者信任、权限审核、项目策略、运行证据和商业化准备。",
  ]),
  makeItem("blog", "geo-automation-skills", "GEO", "GEO", [
    "How to use Skills for SEO and GEO workflows",
    "如何用 Skill 做 SEO 和 GEO 工作流",
    "SEO and GEO teams should start with visibility diagnosis, content briefs, entity clarity, citation readiness, and technical repair queues before automating publishing.",
    "SEO 和 GEO 团队应先从可见度诊断、内容简报、实体清晰度、引用准备度和技术修复队列开始，再考虑自动发布。",
  ]),
  makeItem("blog", "governed-skill-marketplace", "Operations", "运营", [
    "What makes a Skill marketplace trustworthy",
    "什么样的技能市场值得信任",
    "A trustworthy marketplace exposes manifest contracts, permissions, publisher profile, review state, support path, version history, runtime boundaries, and clear paid-access rules.",
    "可信技能市场需要公开合约、权限、发布者档案、审核状态、支持路径、版本历史、运行边界和清晰的付费权限规则。",
  ]),
  makeItem("solutions", "seo-geo", "SEO / GEO", "SEO / GEO", [
    "SEO and GEO growth solution",
    "SEO 与 GEO 增长解决方案",
    "Use SkillHub to diagnose answer-engine visibility, build content briefs, identify citation gaps, repair technical SEO, and turn search findings into governed execution.",
    "用 SkillHub 诊断答案引擎可见度、生成内容简报、发现引用缺口、修复技术 SEO，并把搜索发现转成受治理执行。",
  ]),
  makeItem("solutions", "ecommerce", "E-commerce", "电商", [
    "E-commerce operations solution",
    "电商运营解决方案",
    "Improve product pages, listing quality, review mining, pricing checks, Shopify handoffs, and launch QA before traffic lands on the page.",
    "在流量进入页面前，优化商品页、Listing 质量、评论挖掘、价格检查、Shopify 交接和上线 QA。",
  ]),
  makeItem("solutions", "support", "Support", "客服", [
    "Support and knowledge-base automation",
    "客服与知识库自动化",
    "Route tickets, draft grounded replies, detect knowledge gaps, summarize escalations, and keep human approval around sensitive customer outcomes.",
    "分流工单、起草有依据的回复、发现知识缺口、总结升级问题，并在敏感客户结果上保留人工审核。",
  ]),
  makeItem("solutions", "sales-crm", "Sales / CRM", "销售 / CRM", [
    "Sales and CRM workflow solution",
    "销售与 CRM 工作流解决方案",
    "Use Skills for account research, CRM cleanup, outbound personalization, call summaries, objection handling, and next-step recommendations.",
    "用 Skill 做客户研究、CRM 清洗、外联个性化、通话总结、异议处理和下一步建议。",
  ]),
  makeItem("solutions", "content-ops", "Content operations", "内容运营", [
    "Content operations solution",
    "内容运营解决方案",
    "Plan topics, build briefs, draft channel-specific content, review brand consistency, and keep approval handoffs clear before publishing.",
    "规划选题、生成内容简报、起草不同渠道内容、检查品牌一致性，并在发布前保留清晰的审批交接。",
  ]),
  makeItem("solutions", "data-automation", "Data automation", "数据自动化", [
    "Data and spreadsheet automation solution",
    "数据与表格自动化解决方案",
    "Clean messy spreadsheets, normalize imports, explain metrics, detect anomalies, and turn reports into repeatable operator workflows.",
    "清理混乱表格、规范导入字段、解释指标变化、发现异常，并把报表工作变成可重复的运营流程。",
  ]),
  makeItem("solutions", "ui-ux-qa", "UI / UX QA", "UI / UX 质检", [
    "UI and UX quality solution",
    "UI 与体验质检解决方案",
    "Check responsive layouts, copy hierarchy, empty states, tap targets, and conversion friction before public pages or product screens ship.",
    "在公开页面或产品界面上线前，检查响应式排版、文案层级、空状态、点击区域和转化阻力。",
  ]),
  makeItem("solutions", "developer-security", "Developer / security", "开发 / 安全", [
    "Developer and security review solution",
    "开发与安全审查解决方案",
    "Review API contracts, release notes, permission scope, generated-code risk, and runtime evidence before automation reaches production.",
    "在自动化进入生产前，检查 API 合约、发布说明、权限范围、生成代码风险和运行证据。",
  ]),
  makeItem("use-cases", "spreadsheet-cleanup", "Data", "数据", [
    "Clean messy spreadsheets before automation",
    "自动化前先清理混乱表格",
    "Turn messy CSVs, exports, imports, and reporting sheets into normalized fields, quality checks, and readable handoff notes.",
    "把混乱 CSV、导出表、导入表和报表整理成规范字段、质量检查和可读交接说明。",
  ]),
  makeItem("use-cases", "ui-layout-qa", "UI / UX", "UI / UX", [
    "Run UI layout QA before release",
    "发布前做 UI 排版质检",
    "Catch overflow, weak hierarchy, clipped text, mobile tap-target problems, and empty-state confusion before a public page ships.",
    "在公开页面发布前发现溢出、层级弱、文字裁切、移动端点击区域和空状态问题。",
  ]),
  makeItem("use-cases", "developer-release-qa", "Developer", "开发", [
    "Gate agent-generated changes before release",
    "发布前检查智能体生成的变更",
    "Use Skills to inspect API contracts, webhook payloads, release notes, prompt-injection risk, and code handoff completeness.",
    "用 Skill 检查 API 合约、Webhook 载荷、发布说明、提示注入风险和代码交接完整度。",
  ]),
  makeItem("use-cases", "customer-support-reply", "Support", "客服", [
    "Draft support replies from approved knowledge",
    "基于已审核知识起草客服回复",
    "Ground support drafts in approved articles, flag missing information, suggest escalation, and keep final messages reviewable.",
    "基于已审核文章起草客服回复，标记缺失信息，建议升级，并让最终消息可复核。",
  ]),
  makeItem("examples", "manifest-review-template", "Template", "模板", [
    "Manifest review template",
    "Manifest 审核模板",
    "Use this template to check display name, description, version, runtime, input schema, output schema, permission notes, examples, support path, and changelog.",
    "用这个模板检查名称、描述、版本、运行时、输入 schema、输出 schema、权限说明、示例、支持路径和更新记录。",
  ]),
  makeItem("examples", "seo-brief-workflow", "Workflow", "工作流", [
    "SEO content brief workflow",
    "SEO 内容简报工作流",
    "This example shows how a team can move from keyword intent to page outline, citation gaps, FAQ, internal links, and implementation notes.",
    "这个示例展示团队如何从关键词意图走到页面大纲、引用缺口、FAQ、内链和执行说明。",
  ]),
  makeItem("examples", "publisher-launch-checklist", "Publisher", "发布者", [
    "Publisher launch checklist",
    "发布者上线检查清单",
    "A publisher can use this checklist before submitting a Skill for review: schema, runtime evidence, pricing intent, support path, and changelog must be clear.",
    "发布者提交审核前可用这份清单检查：schema、运行证据、定价意图、支持路径和更新记录必须清楚。",
  ]),
  makeItem("integrations", "rest-api", "REST", "REST", [
    "REST API integration path",
    "REST API 集成路径",
    "Use public REST endpoints for discovery and inspection. Runtime calls require signed-in project keys, policy checks, and auditable execution records.",
    "公开 REST 端点用于发现和检查；运行调用需要登录后的 Project Key、策略检查和可审计执行记录。",
  ]),
  makeItem("integrations", "mcp", "MCP", "MCP", [
    "MCP integration path",
    "MCP 集成路径",
    "Public MCP metadata describes available tools and resources. Real invocation should stay behind authenticated project context and runtime policy.",
    "公开 MCP 元数据描述可用工具和资源；真实调用应保留在已认证项目上下文和运行策略之后。",
  ]),
  makeItem("integrations", "webhooks", "Webhooks", "Webhook", [
    "Webhook and event integration",
    "Webhook 与事件集成",
    "Use webhooks for review state, runtime outcomes, alerts, and future paid-readiness events. Keep retry, signature, and replay handling explicit.",
    "Webhook 可用于审核状态、运行结果、告警和未来付费准备事件。需要明确重试、签名和重放处理。",
  ]),
  makeItem("integrations", "business-systems", "Business systems", "业务系统", [
    "Connect SkillHub to business systems",
    "把 SkillHub 接入业务系统",
    "Plan connectors for Sheets, CRM, Shopify, GitHub, Notion, support tools, and internal systems around least privilege and human approval.",
    "围绕最小权限和人工审批，规划表格、CRM、Shopify、GitHub、Notion、客服工具和内部系统连接器。",
  ]),
];

export const growthPaths = [
  ...Object.values(growthHubs).map((hub) => hub.path),
  ...growthContentItems.map((item) => item.path),
];

export function getGrowthHubItems(hub: GrowthHubKey) {
  return growthContentItems.filter((item) => item.hub === hub);
}

export function getGrowthContentItem(hub: GrowthHubKey, slug: string) {
  return growthContentItems.find((item) => item.hub === hub && item.slug === slug) ?? null;
}

function makeItem(
  hub: GrowthHubKey,
  slug: string,
  categoryEn: string,
  categoryZh: string,
  copy: [string, string, string, string],
): GrowthContentItem {
  const [titleEn, titleZh, introEn, introZh] = copy;
  const path = `/${hub}/${slug}`;
  return {
    category: { en: categoryEn, zh: categoryZh },
    content: {
      en: buildBody(titleEn, introEn, false),
      zh: buildBody(titleZh, introZh, true),
    },
    hub,
    path,
    seo: {
      en: {
        title: titleEn,
        description: introEn,
      },
      zh: {
        title: titleZh,
        description: introZh,
      },
    },
    slug,
  };
}

function buildBody(title: string, intro: string, isZh: boolean): GrowthContentBody {
  return {
    checklist: isZh
      ? ["先确认业务目标", "检查权限和数据范围", "从免费或低风险 Skill 开始", "登录后再进入项目运行", "保留人工复核和运行证据"]
      : ["Confirm the business goal", "Inspect permissions and data scope", "Start with free or low-risk Skills", "Sign in only when adopting into a project", "Keep human review and runtime evidence"],
    intro,
    sections: isZh
      ? [
          {
            title: "这个页面解决什么问题",
            body: "它帮助团队把一个模糊的 AI 自动化想法拆成可以搜索、比较、审核和落地的 Skill 工作流。",
            bullets: ["明确要改善的工作流", "选择合适的 Skill 分类", "区分公开检查和登录后运行"],
          },
          {
            title: "采用前要检查什么",
            body: "不要只看名称。要检查 manifest、输入输出、权限、发布者、审核状态、支持路径和版本历史。",
            bullets: ["低风险任务可以先用免费基础技能", "涉及客户数据或内部系统时必须走项目策略", "未验证技能只能检查，不能作为生产运行能力"],
          },
          {
            title: "下一步怎么做",
            body: "先在技能市场筛选，再进入详情页查看权限和示例。确定要长期使用时，登录工作台，把技能接入项目。",
            bullets: ["浏览技能市场", "查看 Docs 和安装路径", "需要定制时联系 SkillHub"],
          },
        ]
      : [
          {
            title: "What this page helps with",
            body: "It turns a broad AI automation idea into a searchable, comparable, reviewable Skill workflow.",
            bullets: ["Clarify the job to be done", "Choose the right Skill category", "Separate public inspection from authenticated runtime"],
          },
          {
            title: "What to inspect before adoption",
            body: "Do not evaluate a Skill by name only. Inspect its manifest, input/output schema, permissions, publisher, review state, support path, and version history.",
            bullets: ["Start with free basics for low-risk work", "Use project policy for customer data or internal systems", "Submitted Skills remain inspection-only until verified"],
          },
          {
            title: "Recommended next step",
            body: "Start in the marketplace, open the Skill detail page, compare permissions and examples, then sign in only when the Skill should become project state.",
            bullets: ["Browse the marketplace", "Read docs and install path", "Contact SkillHub for custom workflows"],
          },
        ],
    title,
  };
}
