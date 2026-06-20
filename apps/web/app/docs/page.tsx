import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileJson,
  KeyRound,
  Network,
  PackageCheck,
  Route,
  SearchCode,
  ShieldCheck,
  Terminal,
  WalletCards,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { PublicAccessScope } from "@/components/public-access-scope";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/docs",
    type: "article",
    en: {
      title: "SkillHub Docs - Quickstart, REST, MCP, and Project Keys",
      description:
        "Start using SkillHub: browse skills, inspect manifests, create projects, use Project Keys, understand REST/MCP runtime boundaries, and publish skills for review.",
    },
    zh: {
      title: "SkillHub 文档 - 快速开始、REST、MCP 与 Project Key",
      description:
        "了解如何使用 SkillHub：浏览技能、检查 manifest、创建项目、使用 Project Key、理解 REST/MCP 运行边界，并发布技能进入审核。",
    },
  });
}

type DocsCopy = {
  api: {
    body: string;
    groups: Array<{
      body: string;
      endpoints: string[];
      title: string;
    }>;
    title: string;
  };
  admin: {
    body: string;
    cards: Array<{
      body: string;
      items: string[];
      title: string;
    }>;
    title: string;
  };
  guardrails: {
    body: string;
    items: string[];
    title: string;
  };
  hero: {
    body: string;
    eyebrow: string;
    primary: string;
    secondary: string;
    tertiary: string;
    title: string;
  };
  paths: Array<{
    action: string;
    body: string;
    href: string;
    steps: string[];
    title: string;
  }>;
  quickstart: {
    body: string;
    cards: Array<[string, string]>;
    codeLabel: string;
    title: string;
  };
  terms: Array<[string, string]>;
};

const copy: Record<Locale, DocsCopy> = {
  en: {
    admin: {
      body:
        "Admin pages are for operators who review submitted versions, verify launch readiness, audit sensitive activity, and keep commercial states honest before public adoption.",
      cards: [
        {
          body: "Reviewers approve exact submitted versions, not mutable drafts. Public adoption only begins after review evidence passes.",
          items: ["Version review queue", "Manifest and runtime evidence", "Return reasons for blocked submissions"],
          title: "Review submissions",
        },
        {
          body: "Launch checks confirm that permissions, support paths, pricing intent, and operational ownership are explicit before a skill becomes adoptable.",
          items: ["Launch readiness", "Permission and trust signals", "Publisher support metadata"],
          title: "Confirm readiness",
        },
        {
          body: "Operators inspect audit logs, incident signals, finance readiness, and payout metadata without exposing customer secrets or Project Keys.",
          items: ["Audit log review", "Incident and report triage", "Finance and payout readiness"],
          title: "Operate safely",
        },
      ],
      title: "Admin operations",
    },
    api: {
      body:
        "Use public endpoints for discovery and manifest inspection, including public MCP metadata. Use signed-in workspace paths and Project Keys for installs, runtime calls, policy, logs, and commercial evidence.",
      groups: [
        {
          body: "Search public skills and inspect one skill before adoption.",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug"],
          title: "Public discovery",
        },
        {
          body: "Create project state, install verified skills, generate Project Keys, and run governed runtime calls.",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectSlug/installed-skills", "POST /v1/projects/:projectSlug/api-keys", "POST /v1/runtime/invoke"],
          title: "Developer workspace",
        },
        {
          body: "Save drafts, submit exact versions, read review evidence, and maintain publisher metadata.",
          endpoints: ["POST /v1/skills", "POST /v1/publisher/skills/:slug/versions", "POST /v1/publisher/skills/:slug/versions/:version/submit"],
          title: "Publisher workflow",
        },
        {
          body: "Review versions, manage trust, launch readiness, audit logs, finance records, and payout readiness.",
          endpoints: ["GET /v1/admin/reviews", "GET /v1/admin/launch-readiness", "GET /v1/admin/audit-logs"],
          title: "Operator console",
        },
      ],
      title: "REST and MCP surfaces",
    },
    guardrails: {
      body:
        "These rules keep public pages honest and keep production operations from turning into hidden magic.",
      items: [
        "Public pages can show manifests, permissions, publishers, and review state; they must not expose Project Keys, OAuth secrets, tokens, passwords, or private customer data.",
        "Runtime calls require a signed-in workspace, project policy, a scoped Project Key, and logs.",
        "Submitted skills are inspection-only until verified. Verified skills should be adopted with an explicit version pin.",
        "Paid marketplace checkout, automated payouts, tax/KYC automation, and final compliance claims remain prelaunch unless the operator explicitly enables them.",
      ],
      title: "Operational guardrails",
    },
    hero: {
      body:
        "Start with public discovery, inspect a skill contract, then sign in only when you need project runtime, Project Keys, publishing, or admin operations.",
      eyebrow: "Developer guide",
      primary: "Start with marketplace",
      secondary: "Publish a skill",
      tertiary: "View API map",
      title: "Use SkillHub without guessing what is public and what is gated.",
    },
    paths: [
      {
        action: "Browse skills",
        body: "For users comparing capabilities before adopting anything.",
        href: "/marketplace",
        steps: ["Search by task or category", "Open skill detail", "Review permissions and publisher", "Sign in when ready to adopt"],
        title: "I want to find a skill",
      },
      {
        action: "Enter workspace",
        body: "For developers connecting a verified skill to a real project.",
        href: "/login",
        steps: ["Create or choose a project", "Install a verified skill", "Generate a Project Key", "Run a governed REST/MCP test"],
        title: "I want to run a skill",
      },
      {
        action: "Open publishing guide",
        body: "For authors preparing a skill package for review.",
        href: "/publish",
        steps: ["Prepare skillhub.json", "Run preflight", "Save draft", "Submit an exact version for review"],
        title: "I want to publish a skill",
      },
    ],
    quickstart: {
      body:
        "Follow the full adoption path: discover publicly, inspect the contract, sign in, install into a project, create a Project Key, then call runtime through the governed gateway.",
      cards: [
        ["Public discovery", "Search and inspect skills without credentials. Public MCP metadata only describes available tools and resources; it does not invoke customer runtime."],
        ["Authenticated install", "Sign in, choose a project, and install a verified skill before any governed runtime call is available."],
        ["Project Key runtime", "Create a scoped Project Key after install, then call REST or MCP runtime paths with policy, budget, rate limits, and logs."],
      ],
      codeLabel: "public inspect",
      title: "Launch-ready quickstart",
    },
    terms: [
      ["Skill", "A versioned AI Agent capability with manifest, schema, permissions, runtime, publisher, and review state."],
      ["Manifest", "The skillhub.json contract that tells humans and agents what the skill does and what it can access."],
      ["Find Skills", "The page for human discovery and comparison."],
      ["Skill API", "The underlying machine-readable list of inspectable skill contracts."],
      ["Project", "A signed-in workspace container for installs, keys, policy, logs, and runtime tests."],
      ["Runtime gateway", "The governed path that checks project key, policy, budget, approval, rate limits, and logs."],
    ],
  },
  zh: {
    admin: {
      body:
        "管理后台页面给运营和审核人员使用，用来查看已提交版本、确认上线准备度、审计敏感操作，并在公开采用前把商业状态说清楚。",
      cards: [
        {
          body: "审核员只批准精确提交的版本，不批准可随意变动的草稿。只有审核证据通过后，才允许公开采用。",
          items: ["版本审核队列", "Manifest 与运行证据", "退回原因说明"],
          title: "审核提交",
        },
        {
          body: "上线检查会确认权限、支持路径、定价意图和运营责任人都已经写清楚，再让技能进入可采用状态。",
          items: ["上线准备度", "权限与信任信号", "发布者支持信息"],
          title: "确认准备度",
        },
        {
          body: "运营人员查看审计日志、事故信号、财务准备和结算信息，同时不能暴露客户密钥或 Project Key。",
          items: ["审计日志查看", "事故与工单分流", "财务与结算准备"],
          title: "安全运营",
        },
      ],
      title: "管理后台操作",
    },
    api: {
      body:
        "公开端点用于发现和检查 manifest；登录后的工作台与 Project Key 用于真实运行、安装、策略、日志和商业证据。",
      groups: [
        {
          body: "公开 API 已可用：搜索公开技能，并在采用前检查单个技能。",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug"],
          title: "公开发现",
        },
        {
          body: "MCP 使用 POST；创建项目状态、安装已验证技能、生成密钥，并运行控制台测试。",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectSlug/installed-skills", "POST /v1/projects/:projectSlug/api-keys", "POST /v1/runtime/invoke"],
          title: "开发者工作台",
        },
        {
          body: "保存草稿、提交精确版本、查看审核证据，并维护发布者资料。",
          endpoints: ["POST /v1/skills", "POST /v1/publisher/skills/:slug/versions", "POST /v1/publisher/skills/:slug/versions/:version/submit"],
          title: "发布者流程",
        },
        {
          body: "审核版本、管理信任、上线准备、审计日志、财务记录和提现准备。",
          endpoints: ["GET /v1/admin/reviews", "GET /v1/admin/launch-readiness", "GET /v1/admin/audit-logs"],
          title: "运营后台",
        },
      ],
      title: "REST 与 MCP 能力面",
    },
    guardrails: {
      body:
        "这些规则让公开页面保持诚实，也让生产运营不会变成看不见的黑箱。",
      items: [
        "公开页面可以展示 manifest、权限、发布者和审核状态；不能暴露 Project Key、OAuth 密钥、token、密码或客户私有数据。",
        "真实运行需要登录工作台、项目策略、有作用域的 Project Key 和运行日志。",
        "已提交但未验证的技能只能检查，不能采用。已验证技能也应通过明确版本固定后再接入项目。",
        "付费市场收银、自动分账、税务/KYC 自动化和最终合规声明，除非运营明确启用，否则仍属于预发布范围。",
      ],
      title: "运营边界",
    },
    hero: {
      body:
        "先从公开市场发现技能，检查技能合约；只有在需要项目运行、Project Key、发布或后台运营时才进入登录工作台。",
      eyebrow: "使用文档",
      primary: "从找技能开始",
      secondary: "发布技能",
      tertiary: "查看 API 地图",
      title: "清楚知道哪些能公开看，哪些必须登录后操作。",
    },
    paths: [
      {
        action: "开始找技能",
        body: "适合先比较能力、暂时不采用的用户。",
        href: "/marketplace",
        steps: ["按任务或分类搜索", "打开技能详情", "查看权限和发布者", "准备采用时再登录"],
        title: "我想找一个技能",
      },
      {
        action: "进入工作台",
        body: "适合把已验证技能接入真实项目的开发者。",
        href: "/login",
        steps: ["创建或选择项目", "安装已验证技能", "生成 Project Key", "运行受治理的 REST/MCP 测试"],
        title: "我想运行一个技能",
      },
      {
        action: "打开发布指南",
        body: "适合准备把技能包提交审核的作者。",
        href: "/publish",
        steps: ["准备 skillhub.json", "执行预检", "保存草稿", "提交精确版本审核"],
        title: "我想发布一个技能",
      },
    ],
    quickstart: {
      body:
        "完整采用路径是：先公开发现，检查技能合约；再登录项目，安装技能，创建 Project Key，最后通过受治理网关运行。",
      cards: [
        ["公开发现", "不用登录也可以搜索技能、打开详情、检查 manifest、schema、权限和审核状态。公开 MCP metadata 只说明能力，不代表可匿名运行。"],
        ["登录安装", "登录后选择项目，只有已验证技能安装到项目后，才会开放受治理的运行调用。"],
        ["Project Key 运行", "安装后创建有作用域的 Project Key，再通过 REST 或 MCP 运行路径进入策略、预算、限流和日志。"],
      ],
      codeLabel: "公开检查",
      title: "开发者快速开始",
    },
    terms: [
      ["Skill", "带版本的 AI Agent 能力，包含 manifest、schema、权限、运行时、发布者和审核状态。"],
      ["Manifest", "skillhub.json 合约，告诉人和智能体这个技能做什么、能访问什么。"],
      ["找技能", "给人做发现、比较和决策的页面。"],
      ["技能 API", "底层可检查、可被系统读取的技能合约列表。"],
      ["项目", "登录后的工作台容器，用于安装、密钥、策略、日志和运行测试。"],
      ["运行网关", "检查 Project Key、策略、预算、审批、限流并记录日志的受治理路径。"],
    ],
  },
};

const pathIcons = [SearchCode, Code2, FileJson] as const;
const actionGuideIcons = [PackageCheck, WalletCards, ClipboardCheck] as const;
const quickstartSnippet = `# Search public skills
curl "https://api.useskillhub.com/v1/skills/search?tag=research"

# Inspect a public skill manifest
curl "https://api.useskillhub.com/v1/skills/browser-research"

# Read public MCP metadata; this is not runtime invocation
curl "https://api.useskillhub.com/mcp"

# Sign in, create or choose a project, then install the verified skill
curl -X POST "https://api.useskillhub.com/v1/projects/$PROJECT_SLUG/installed-skills" \\
  -H "Authorization: Bearer $SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"skillSlug":"browser-research","version":"1.4.2"}'

# Create a scoped Project Key for runtime
curl -X POST "https://api.useskillhub.com/v1/projects/$PROJECT_SLUG/api-keys" \\
  -H "Authorization: Bearer $SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"local-dev"}'

# Call governed runtime with the Project Key
curl -X POST "https://api.useskillhub.com/v1/runtime/invoke" \\
  -H "Authorization: Bearer $PROJECT_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skill":"browser-research","input":{"query":"market map"}}'`;

function getInstallGuides(locale: Locale) {
  if (locale === "zh") {
    return {
      body:
        "安装不是复制一行命令就结束。客户要先选技能，开发者要把技能放进项目，作者要提交审核，运营要确认质量和风险。",
      eyebrow: "安装与运营路径",
      title: "按角色看下一步怎么做。",
      tracks: [
        {
          action: "去找技能",
          href: "/marketplace",
          steps: ["按 SEO/GEO、UI、内容、CRM、数据、运营、API、安全分类筛选", "打开技能详情，检查权限、输入输出、运行时和发布者", "登录后在项目中安装已验证技能", "生成 Project Key，通过 REST 或 MCP 调用"],
          title: "客户 / 开发者如何安装",
        },
        {
          action: "发布技能",
          href: "/publish",
          steps: ["准备 skillhub.json，写清 manifest、schema、权限和运行入口", "先跑预检，修复阻塞项", "提交精确版本进入审核", "上线后维护反馈、事故、版本和支持路径"],
          title: "第三方作者如何发布",
        },
        {
          action: "查看审核规则",
          href: "/publisher-review",
          steps: ["先理解上线就绪和审核队列的判断口径", "检查技能分类、价格套餐、权限风险和发布者信任", "处理反馈、举报、事故、通知和 Webhook 投递前确认职责边界", "财务只展示 Pro 套餐、退款争议、作者分成和预发布准备状态"],
          title: "运营管理员如何审核",
        },
      ],
    };
  }

  return {
    body:
      "Installation is not just copying a command. Buyers choose a skill, developers attach it to a project, publishers submit for review, and operators confirm quality and risk.",
    eyebrow: "Install and operate",
    title: "Next steps by role.",
    tracks: [
      {
        action: "Open marketplace",
        href: "/marketplace",
        steps: ["Filter by SEO/GEO, UI, content, CRM, data, support, API, or security", "Open detail and inspect permissions, schema, runtime, and publisher", "Sign in and install a verified skill into a project", "Generate a Project Key and call through REST or MCP"],
        title: "Buyer / developer install path",
      },
      {
        action: "Publish skill",
        href: "/publish",
        steps: ["Prepare skillhub.json with manifest, schema, permissions, and runtime", "Run preflight and repair blockers", "Submit an exact version for review", "Maintain feedback, incidents, versions, and support after listing"],
        title: "Third-party publisher path",
      },
      {
        action: "Review requirements",
        href: "/publisher-review",
        steps: ["Understand launch readiness and review queue criteria first", "Check category, plan, permission risk, and publisher trust", "Confirm responsibility boundaries before handling feedback, reports, incidents, notifications, and webhook delivery", "Treat Pro plans, refunds, disputes, publisher share, and finance readiness as prelaunch operating states"],
        title: "Operator review path",
      },
    ],
  };
}

function getCategoryGuides(locale: Locale) {
  if (locale === "zh") {
    return {
      body:
        "客户不是来背技术名词的，他们通常只知道自己遇到的问题。先按业务场景选分类，再用搜索词缩小范围。",
      eyebrow: "怎么选技能",
      title: "按业务问题进入，不按工具名硬找。",
      tracks: [
        {
          examples: ["AI 搜索可见度", "技术 SEO", "内容缺口", "内链规划"],
          href: "/marketplace?category=seo",
          title: "SEO / GEO 增长",
          when: "网站想提升 Google、AI Overview、ChatGPT/Perplexity 等答案引擎里的可见度。",
        },
        {
          examples: ["商品标题", "Listing 质检", "评论痛点", "退货原因"],
          href: "/marketplace?category=ecommerce",
          title: "电商 / 零售",
          when: "店铺要批量优化商品页、平台 Listing、评价、Feed、库存和客服动作。",
        },
        {
          examples: ["落地页文案", "博客大纲", "社媒日历", "品牌 FAQ"],
          href: "/marketplace?category=content",
          title: "内容 / 文案",
          when: "团队要持续生产可审核的内容资产，而不是一次性让 AI 写一篇文章。",
        },
        {
          examples: ["工单分流", "知识库回答", "SOP", "客户之声"],
          href: "/marketplace?category=ops",
          title: "运营 / 客服",
          when: "客服、运营和客户成功团队要把重复问题变成标准流程和可追踪动作。",
        },
        {
          examples: ["表格清洗", "KPI 解释", "SQL 说明", "周报生成"],
          href: "/marketplace?category=data",
          title: "数据 / 表格",
          when: "Excel、CSV、BI 指标和导入数据需要清洗、解释、映射和自动化报告。",
        },
        {
          examples: ["冷邮件", "CRM 更新", "商机总结", "续费风险"],
          href: "/marketplace?category=sales",
          title: "销售 / CRM",
          when: "销售要调研客户、个性化触达、跟进商机、整理会议记录和续费风险。",
        },
        {
          examples: ["响应式审查", "表单体验", "信任区块", "信息架构"],
          href: "/marketplace?category=ui",
          title: "UI/UX",
          when: "页面能打开但不好用、排版松散、按钮不清楚、移动端体验不稳定。",
        },
        {
          examples: ["API 合约", "Webhook", "CI 失败", "提示注入"],
          href: "/marketplace?category=dev",
          title: "开发 / 安全",
          when: "开发者要检查接口、自动化、代码变更、发布风险和智能体安全边界。",
        },
      ],
    };
  }

  return {
    body:
      "Buyers usually know the problem before they know the tool name. Start from the business workflow, then narrow with search, plan, runtime, and risk filters.",
    eyebrow: "How to choose",
    title: "Enter by business job, not by tool jargon.",
    tracks: [
      {
        examples: ["AI search visibility", "technical SEO", "content gaps", "internal links"],
        href: "/marketplace?category=seo",
        title: "SEO / GEO growth",
        when: "Use when a site needs better visibility in Google, AI Overviews, ChatGPT, Perplexity, and answer engines.",
      },
      {
        examples: ["product titles", "listing QA", "review mining", "return reasons"],
        href: "/marketplace?category=ecommerce",
        title: "E-commerce / retail",
        when: "Use when a store needs repeatable product page, listing, review, feed, inventory, or support workflows.",
      },
      {
        examples: ["landing copy", "blog outlines", "social calendars", "brand FAQ"],
        href: "/marketplace?category=content",
        title: "Content / copy",
        when: "Use when teams need reviewable content assets, not one-off AI drafts.",
      },
      {
        examples: ["ticket triage", "knowledge answers", "SOPs", "voice of customer"],
        href: "/marketplace?category=ops",
        title: "Operations / support",
        when: "Use when support, ops, and success teams need repeated questions turned into standard workflows.",
      },
      {
        examples: ["sheet cleanup", "KPI explanation", "SQL notes", "weekly reports"],
        href: "/marketplace?category=data",
        title: "Data / sheets",
        when: "Use when spreadsheets, CSVs, BI metrics, and imports need cleanup, mapping, explanation, or reporting.",
      },
      {
        examples: ["cold email", "CRM updates", "deal summary", "renewal risk"],
        href: "/marketplace?category=sales",
        title: "Sales / CRM",
        when: "Use when sales teams need account research, outreach, meeting notes, pipeline hygiene, or renewal playbooks.",
      },
      {
        examples: ["responsive QA", "form UX", "trust section", "information architecture"],
        href: "/marketplace?category=ui",
        title: "UI/UX",
        when: "Use when a page works technically but feels unclear, loose, hard to scan, or weak on mobile.",
      },
      {
        examples: ["API contracts", "webhooks", "CI failures", "prompt injection"],
        href: "/marketplace?category=dev",
        title: "Development / security",
        when: "Use when developers need API, automation, code-change, release, or agent-safety checks.",
      },
    ],
  };
}

function getMarketplaceActionGuide(locale: Locale) {
  if (locale === "zh") {
    return {
      body:
        "客户看完分类后，下一步应该很明确：先用免费基础验证，真实业务进 Pro，市场没有的流程提交需求。不要让用户在市场、价格、联系页之间来回猜。",
      cards: [
        {
          action: "查看免费技能",
          body:
            "免费基础技能用于低风险试用和理解平台，适合基础 SEO、基础运营、表格清理和简单检查。",
          href: "/marketplace?pricing=free",
          steps: ["筛选免费基础", "打开详情看权限", "用低风险流程验证输出"],
          title: "先用免费基础验证",
        },
        {
          action: "申请 Pro",
          body:
            "长期、高级或批量工作流进入 Pro。月付 128 美金，季付 9 折，年付 8 折，当前通过人工入驻开通。",
          href: "/contact?intent=pro",
          steps: ["写清付款周期", "列出前 3 个技能", "确认工作区和管理员"],
          title: "真实业务进入 Pro",
        },
        {
          action: "提交技能需求",
          body:
            "如果目录里没有合适技能，把业务流程、工具、输入输出、频率和权限需求发给运营。",
          href: "/contact?intent=request-skill",
          steps: ["描述业务问题", "给出输入输出示例", "说明免费或 Pro 期望"],
          title: "缺失技能直接提交",
        },
      ],
      eyebrow: "市场下一步",
      title: "找不到或拿不准时，按这三条路走。",
    };
  }

  return {
    body:
      "After category discovery, the next action should be obvious: start with free basics, move real work into Pro, or request the missing workflow. Buyers should not have to guess between marketplace, pricing, and contact pages.",
    cards: [
      {
        action: "View free skills",
        body:
          "Free basics are for low-risk evaluation and understanding the platform, such as basic SEO, operations, sheet cleanup, and simple checks.",
        href: "/marketplace?pricing=free",
        steps: ["Filter free basics", "Open details and permissions", "Validate output with a low-risk workflow"],
        title: "Validate with free basics",
      },
      {
        action: "Request Pro",
        body:
          "Recurring, advanced, or batch workflows belong in Pro. Monthly is $128, quarterly is 10% off, annual is 20% off, and onboarding is manual during Launch Preview.",
        href: "/contact?intent=pro",
        steps: ["Choose billing cycle", "List the first 3 skills", "Confirm workspace owner and admin"],
        title: "Move real work into Pro",
      },
      {
        action: "Request a skill",
        body:
          "If the catalog does not have the right skill, send the workflow, tools, input/output, frequency, and permission needs to operations.",
        href: "/contact?intent=request-skill",
        steps: ["Describe the business problem", "Add input/output examples", "State free or Pro expectation"],
        title: "Submit missing skill demand",
      },
    ],
    eyebrow: "Marketplace next step",
    title: "If you cannot find the right skill, use these three paths.",
  };
}

function getPricingDocs(locale: Locale) {
  if (locale === "zh") {
    return {
      body:
        "公开页面要把钱说清楚，但不能假装付费市场已经全部上线。当前站点以 Pro 全量计划和免费基础技能做购买理解，真实收银、分账和发票仍按运营配置逐步开启。",
      rows: [
        ["免费基础技能", "适合试用和低风险基础任务，例如基础 SEO 检查、FAQ、表格清理、发布检查清单。"],
        ["Pro 月付", "128 美金 / 月，可使用 Pro 全量技能，适合持续运营和团队试用。"],
        ["Pro 季付", "按月价 9 折，适合已经明确要持续使用一个季度的团队。"],
        ["Pro 年付", "按月价 8 折，适合稳定业务团队和代理商。"],
        ["付费预览", "页面可展示定价意图、账本模型、退款争议和作者分成准备，但真实资金流转需运营确认。"],
      ],
      title: "免费、Pro 和付费预览怎么理解。",
    };
  }

  return {
    body:
      "Public pages should make commercial intent clear without pretending the full paid marketplace is already live. The site explains Pro access and free starter skills while checkout, ledgers, payouts, and invoices remain operator-gated.",
    rows: [
      ["Free basics", "For trials and low-risk starter tasks such as basic SEO checks, FAQ, sheet cleanup, and release checklists."],
      ["Pro monthly", "$128 / month for all Pro skills; best for recurring operations and team trials."],
      ["Pro quarterly", "10% off the monthly rate; best when a team already expects to operate for a quarter."],
      ["Pro annual", "20% off the monthly rate; best for stable teams and agencies."],
      ["Paid preview", "Pages may show pricing intent, ledger model, refund/dispute, and publisher-share readiness, but real money movement remains operator-gated."],
    ],
    title: "Free, Pro, and paid-preview boundaries.",
  };
}

function getTroubleshooting(locale: Locale) {
  if (locale === "zh") {
    return {
      body:
        "客户最容易卡在登录、权限、Project Key、运行调用和审核状态。排查时先判断它属于公开页面、登录工作台、发布者流程还是运营后台。",
      items: [
        {
          cause: "技能还未验证，或当前用户还没有项目权限。",
          fix: "先打开技能详情确认验证状态；登录后进入开发者工作台，把已验证技能安装到项目。",
          problem: "按钮显示“仅可查看”或无法安装",
        },
        {
          cause: "没有在项目里生成 Project Key，或者使用了登录 token 代替运行 key。",
          fix: "在项目中创建有 runtime:invoke 作用域的 Project Key，再用它调用 REST/MCP 运行端点。",
          problem: "API 调用 401 / 403",
        },
        {
          cause: "公开 MCP metadata 只说明工具和资源，不代表匿名运行权限。",
          fix: "匿名只能检查 metadata；真实调用必须走登录项目、Project Key、策略和日志。",
          problem: "MCP 看得到但跑不起来",
        },
        {
          cause: "提交的是草稿，或者运行测试、权限、支持路径、价格意图缺少审核证据。",
          fix: "发布者需要提交精确版本，补齐 manifest、示例、权限、运行证据和支持信息。",
          problem: "发布技能一直在审核中",
        },
        {
          cause: "服务器还在旧构建或 PM2 重启的不是域名访问的进程。",
          fix: "确认 git hash、清理 .next、重新 build，并检查 3000 端口和反向代理是否指向同一个服务。",
          problem: "代码已更新但线上没变化",
        },
      ],
      title: "常见卡点怎么排查。",
    };
  }

  return {
    body:
      "Most confusion comes from auth, project access, Project Keys, runtime calls, and review state. First decide whether the problem belongs to public pages, the signed-in workspace, publisher review, or admin operations.",
    items: [
      {
        cause: "The skill is not verified yet, or the current user does not have project access.",
        fix: "Open the skill detail to confirm verification state; sign in and install a verified skill into a project.",
        problem: "The button says inspection only or install is locked",
      },
      {
        cause: "No Project Key exists for the project, or a login token is being used as a runtime key.",
        fix: "Create a Project Key with runtime:invoke scope, then use it for REST/MCP runtime endpoints.",
        problem: "API returns 401 / 403",
      },
      {
        cause: "Public MCP metadata describes tools and resources, but does not grant anonymous runtime access.",
        fix: "Use anonymous metadata only for inspection; runtime requires project auth, policy, key, and logs.",
        problem: "MCP is visible but cannot run",
      },
      {
        cause: "The submission is still a draft, or runtime, permission, support, pricing, or example evidence is missing.",
        fix: "Submit an exact version with manifest, examples, permissions, runtime evidence, and support metadata.",
        problem: "A published skill stays in review",
      },
      {
        cause: "The server is still serving an old build, or PM2 restarted a different process from the one behind the domain.",
        fix: "Check git hash, clear .next, rebuild, and confirm port 3000 and the reverse proxy point to the same process.",
        problem: "Code changed but production did not",
      },
    ],
    title: "Troubleshooting common blockers.",
  };
}

export default async function DocsPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];
  const installGuide = getInstallGuides(locale);
  const categoryGuide = getCategoryGuides(locale);
  const marketplaceActionGuide = getMarketplaceActionGuide(locale);
  const pricingDocs = getPricingDocs(locale);
  const troubleshooting = getTroubleshooting(locale);

  return (
    <AppShell active="docs" locale={locale}>
      <section className="section pt-32 pb-16" aria-labelledby="docs-heading">
        <div className="section-inner hero-glow">
          <Reveal>
            <div className="max-w-[780px]">
              <div className="eyebrow">
                <BookOpen size={16} aria-hidden="true" />
                <span>{labels.hero.eyebrow}</span>
              </div>
              <h1 id="docs-heading" className="heading-xl mt-4">{labels.hero.title}</h1>
              <p className="body-text text-[#999] mt-4 max-w-[700px]">{labels.hero.body}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                  <SearchCode size={18} aria-hidden="true" />
                  <span>{labels.hero.primary}</span>
                </a>
                <a className="btn-secondary btn-secondary--large" href={localizedHref("/publish", locale)}>
                  <FileJson size={18} aria-hidden="true" />
                  <span>{labels.hero.secondary}</span>
                </a>
                <a className="btn-secondary btn-secondary--large" href="#api">
                  <Terminal size={18} aria-hidden="true" />
                  <span>{labels.hero.tertiary}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div id="operating-reference">
        <PublicAccessScope locale={locale} />
      </div>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-path-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[720px]">
            <div className="eyebrow">
              <Route size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "按角色开始" : "Start by role"}</span>
            </div>
            <h2 id="docs-path-heading" className="heading-lg mt-3">
              {locale === "zh" ? "先选择你现在要完成的动作。" : "Choose the job you are trying to finish."}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {labels.paths.map((path, index) => {
              const Icon = pathIcons[index] ?? Route;

              return (
                <Reveal delay={index * 70} key={path.title}>
                  <article className="card flex flex-col gap-4 h-full">
                    <div className="w-10 h-10 rounded-[8px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center">
                      <Icon size={20} aria-hidden="true" className="text-[#7fee64]" />
                    </div>
                    <div>
                      <h3 className="heading-sm">{path.title}</h3>
                      <p className="body-text-sm text-[#999] mt-2">{path.body}</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      {path.steps.map((step, stepIndex) => (
                        <div className="flex items-start gap-3" key={step}>
                          <span className="text-xs font-mono text-[#525252] mt-0.5">{String(stepIndex + 1).padStart(2, "0")}</span>
                          <strong className="text-sm text-white font-medium">{step}</strong>
                        </div>
                      ))}
                    </div>
                    <a className="btn-secondary inline-flex items-center gap-2 justify-center" href={localizedHref(path.href, locale)}>
                      <span>{path.action}</span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-category-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[780px]">
            <div className="eyebrow">
              <SearchCode size={16} aria-hidden="true" />
              <span>{categoryGuide.eyebrow}</span>
            </div>
            <h2 id="docs-category-heading" className="heading-lg mt-3">
              {categoryGuide.title}
            </h2>
            <p className="body-text text-[#999] mt-3">{categoryGuide.body}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {categoryGuide.tracks.map((track) => (
              <article className="card flex flex-col gap-4 h-full" key={track.title}>
                <div>
                  <h3 className="heading-sm">{track.title}</h3>
                  <p className="body-text-sm text-[#999] mt-2">{track.when}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {track.examples.map((example) => (
                    <span
                      className="text-xs text-[#bdbdbd] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded px-2 py-1"
                      key={example}
                    >
                      {example}
                    </span>
                  ))}
                </div>
                <a
                  className="btn-secondary inline-flex items-center gap-2 justify-center mt-auto"
                  href={localizedHref(track.href, locale)}
                >
                  <span>{locale === "zh" ? "查看这类技能" : "View this category"}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-action-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[780px]">
            <div className="eyebrow">
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{marketplaceActionGuide.eyebrow}</span>
            </div>
            <h2 id="docs-action-heading" className="heading-lg mt-3">
              {marketplaceActionGuide.title}
            </h2>
            <p className="body-text text-[#999] mt-3">{marketplaceActionGuide.body}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {marketplaceActionGuide.cards.map((card, index) => {
              const Icon = actionGuideIcons[index] ?? ClipboardCheck;

              return (
                <article className="card flex flex-col gap-4 h-full" key={card.title}>
                  <div className="w-10 h-10 rounded-[8px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center">
                    <Icon size={20} aria-hidden="true" className="text-[#7fee64]" />
                  </div>
                  <div>
                    <h3 className="heading-sm">{card.title}</h3>
                    <p className="body-text-sm text-[#999] mt-2">{card.body}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-auto">
                    {card.steps.map((step) => (
                      <div className="flex items-start gap-2 text-sm text-[#999]" key={step}>
                        <CheckCircle2 size={15} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <a className="btn-secondary inline-flex items-center gap-2 justify-center" href={localizedHref(card.href, locale)}>
                    <span>{card.action}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" id="quickstart" aria-labelledby="docs-quickstart-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <div className="flex flex-col gap-5">
            <div>
              <div className="eyebrow">
                <Terminal size={16} aria-hidden="true" />
                <span>{labels.quickstart.codeLabel}</span>
              </div>
              <h2 id="docs-quickstart-heading" className="heading-lg mt-3">{labels.quickstart.title}</h2>
              <p className="body-text text-[#999] mt-3">{labels.quickstart.body}</p>
            </div>
            <div className="code-block">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#666]">
                <span>quickstart.sh</span>
                <span>{labels.quickstart.codeLabel}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{quickstartSnippet}</code>
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {labels.quickstart.cards.map(([title, body]) => (
              <article className="card flex items-start gap-4" key={title}>
                <PackageCheck size={20} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-1" />
                <div>
                  <h3 className="heading-sm">{title}</h3>
                  <p className="body-text-sm text-[#999] mt-1">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-pricing-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-8">
          <div>
            <div className="eyebrow">
              <WalletCards size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "价格和权限边界" : "Pricing and access"}</span>
            </div>
            <h2 id="docs-pricing-heading" className="heading-lg mt-3">
              {pricingDocs.title}
            </h2>
            <p className="body-text text-[#999] mt-3">{pricingDocs.body}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pricingDocs.rows.map(([label, value]) => (
              <article className="card grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-start" key={label}>
                <strong className="heading-sm">{label}</strong>
                <p className="body-text-sm text-[#999]">{value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-install-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[760px]">
            <div className="eyebrow">
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{installGuide.eyebrow}</span>
            </div>
            <h2 id="docs-install-heading" className="heading-lg mt-3">
              {installGuide.title}
            </h2>
            <p className="body-text text-[#999] mt-3">{installGuide.body}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {installGuide.tracks.map((track, index) => (
              <Reveal delay={index * 70} key={track.title}>
                <article className="card flex flex-col gap-4 h-full">
                  <h3 className="heading-sm">{track.title}</h3>
                  <div className="flex flex-col gap-3">
                    {track.steps.map((step, stepIndex) => (
                      <div className="flex items-start gap-3" key={step}>
                        <span className="text-xs font-mono text-[#525252] mt-0.5">
                          {String(stepIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="body-text-sm text-[#999]">{step}</span>
                      </div>
                    ))}
                  </div>
                  <a className="btn-secondary inline-flex items-center gap-2 justify-center mt-auto" href={localizedHref(track.href, locale)}>
                    <span>{track.action}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-terms-heading">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <div>
            <div className="eyebrow">
              <Braces size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "统一口径" : "Shared vocabulary"}</span>
            </div>
            <h2 id="docs-terms-heading" className="heading-lg mt-3">
              {locale === "zh" ? "这些词全站必须含义一致。" : "These words must mean the same thing everywhere."}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labels.terms.map(([term, definition]) => (
              <article className="card" key={term}>
                <h3 className="heading-sm">{term}</h3>
                <p className="body-text-sm text-[#999] mt-2">{definition}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" id="api" aria-labelledby="docs-api-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[740px]">
            <div className="eyebrow">
              <Network size={16} aria-hidden="true" />
              <span>REST / MCP</span>
            </div>
            <h2 id="docs-api-heading" className="heading-lg mt-3">{labels.api.title}</h2>
            <p className="body-text text-[#999] mt-3">{labels.api.body}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {labels.api.groups.map((group) => (
              <article className="card flex flex-col gap-3" key={group.title}>
                <h3 className="heading-sm">{group.title}</h3>
                <p className="body-text-sm text-[#999]">{group.body}</p>
                <div className="flex flex-col gap-1.5 mt-auto">
                  {group.endpoints.map((endpoint) => (
                    <code key={endpoint} className="text-xs font-mono text-[#7fee64] bg-[rgba(127,238,100,0.08)] rounded px-2 py-1 w-fit">
                      {endpoint}
                    </code>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" id="admin" aria-labelledby="docs-admin-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[740px]">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "运营后台" : "Admin operations"}</span>
            </div>
            <h2 id="docs-admin-heading" className="heading-lg mt-3">{labels.admin.title}</h2>
            <p className="body-text text-[#999] mt-3">{labels.admin.body}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {labels.admin.cards.map((card) => (
              <article className="card flex flex-col gap-4 h-full" key={card.title}>
                <div className="w-10 h-10 rounded-[8px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center">
                  <ClipboardCheck size={20} aria-hidden="true" className="text-[#7fee64]" />
                </div>
                <div>
                  <h3 className="heading-sm">{card.title}</h3>
                  <p className="body-text-sm text-[#999] mt-2">{card.body}</p>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  {card.items.map((item) => (
                    <div className="flex items-start gap-2 text-sm text-[#999]" key={item}>
                      <CheckCircle2 size={15} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-troubleshooting-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="max-w-[800px]">
            <div className="eyebrow">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "排查手册" : "Troubleshooting"}</span>
            </div>
            <h2 id="docs-troubleshooting-heading" className="heading-lg mt-3">
              {troubleshooting.title}
            </h2>
            <p className="body-text text-[#999] mt-3">{troubleshooting.body}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {troubleshooting.items.map((item) => (
              <article className="card flex flex-col gap-4" key={item.problem}>
                <div>
                  <span className="text-xs uppercase tracking-[0.12em] text-[#7fee64]">
                    {locale === "zh" ? "问题" : "Problem"}
                  </span>
                  <h3 className="heading-sm mt-2">{item.problem}</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <strong className="text-sm text-white">
                      {locale === "zh" ? "常见原因" : "Common cause"}
                    </strong>
                    <p className="body-text-sm text-[#999] mt-1">{item.cause}</p>
                  </div>
                  <div>
                    <strong className="text-sm text-white">
                      {locale === "zh" ? "处理方式" : "How to fix"}
                    </strong>
                    <p className="body-text-sm text-[#999] mt-1">{item.fix}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="docs-guardrails-heading">
        <div className="section-inner">
          <article className="card grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8">
            <div>
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.guardrails.title}</span>
              </div>
              <h2 id="docs-guardrails-heading" className="heading-lg mt-3">{labels.guardrails.title}</h2>
              <p className="body-text text-[#999] mt-3">{labels.guardrails.body}</p>
            </div>
            <div className="flex flex-col gap-3">
              {labels.guardrails.items.map((item) => (
                <div className="flex items-start gap-3" key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                  <span className="body-text-sm text-[#999]">{item}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">
              {locale === "zh" ? "下一步按你的角色进入。" : "Next step: enter by role."}
            </h2>
            <p className="body-text max-w-[560px] mx-auto mb-8">
              {locale === "zh"
                ? "找技能去市场，真实运行去登录工作台，发布技能走发布者流程。"
                : "Use the marketplace for discovery, the workspace for runtime, and the publisher flow for submissions."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "开始找技能" : "Find skills"}</span>
              </a>
              <a className="btn-secondary" href={localizedHref("/login", locale)}>
                <KeyRound size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "进入工作台" : "Enter workspace"}</span>
              </a>
              <a className="btn-secondary" href={localizedHref("/pricing", locale)}>
                <WalletCards size={16} aria-hidden="true" />
                <span>{locale === "zh" ? "查看价格边界" : "View pricing boundary"}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
