import type { Metadata } from "next";
import type { SkillSummary } from "@useskillhub/schema";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  FileJson,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  Search,
  ServerCog,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { companyInfo, companyLinks } from "@/lib/company-info";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
} from "@/lib/i18n";
import { PublicEventLink } from "@/components/public-event-link";
import { ParticleField } from "@/components/home/particle-field";
import { getSkills } from "@/lib/registry";
import {
  getPromotedSkillPackages,
  promotedSkillPackageIntro,
} from "@/lib/promoted-skill-packages";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub - AI Agent Skill 注册中心与运行治理层"
    : "SkillHub - Registry and Runtime Governance for AI Agent Skills";
  const description = isZh
    ? "浏览可复用 AI Agent Skill，检查 manifest 与权限，并通过 Project Key、API 或 MCP 安全调用已批准的 Skill。"
    : "Discover reusable AI agent Skills, inspect manifests and permissions, and run approved Skills through controlled APIs or MCP with Project Keys, logs, and governance.";
  const url = `https://useskillhub.com/?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/?lang=en",
        "zh-CN": "https://useskillhub.com/?lang=zh",
        "x-default": "https://useskillhub.com/",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "SkillHub",
    },
  };
}

const proofIcons = [ShieldCheck, LockKeyhole, CheckCircle2] as const;
const capabilityIcons = [Search, FileJson, Zap, ShoppingCart] as const;
const trustModuleIcons = [ShieldCheck, ServerCog, PackageCheck] as const;
const howIcons = [Search, FileJson, KeyRound, Zap, BarChart3] as const;
const skillIcons = [Boxes, BarChart3, Terminal, FileJson] as const;
const packageIcons = [Search, ShoppingCart, BarChart3] as const;

type FooterAgentItem = {
  name: string;
  body: string;
  logo: string;
  logoKey: "codex" | "claude" | "gemini" | "copilot" | "openclaw" | "hermes";
};

const fallbackFeaturedSkills: SkillSummary[] = [
  {
    id: "browser-research",
    slug: "browser-research",
    displayName: "Browser Research",
    description: "Search the web and extract structured insights with source links.",
    tags: ["research", "browser", "citations"],
    version: "1.4.2",
    verificationStatus: "verified",
    permissionLevel: "medium",
    runtimeType: "http",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "dataset-summarizer",
    slug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    description: "Turn spreadsheet rows into anomalies, segments, metric deltas, and follow-up questions.",
    tags: ["data", "analysis", "summary"],
    version: "0.8.4",
    verificationStatus: "verified",
    permissionLevel: "medium",
    runtimeType: "http",
    updatedAt: "2026-06-01T00:00:00.000Z",
  },
];

const homeLandingCopy = {
  en: {
    banner: {
      label: "Build agents with trusted skills",
      body: "Discover reusable agent skills, inspect their contracts, and connect them through governed REST or MCP runtime paths.",
      action: "Explore live status",
    },
    eyebrow: "Agent infrastructure / skill runtime",
    title: "Run agent skills like production infrastructure.",
    mobileTitle: "Production-grade skill infrastructure for AI agents.",
    description:
      "SkillHub is a registry and governance layer for reusable AI agent skills. Browse skills, inspect permissions and manifests, then run approved skills through controlled APIs or MCP.",
    previewNote:
      "SkillHub is in Launch Preview: discovery and inspection are live today; runtime execution is available behind signed-in Project Keys.",
    whatIsSkillTitle: "What is a Skill?",
    whatIsSkillBody:
      "A Skill is a reusable capability an AI agent can call, such as web research, data analysis, code execution, or document Q&A.",
    primaryCta: "Browse Skills",
    quickstartCta: "View Docs",
    publishCta: "Publish a Skill",
    evidence: [
      ["Contract-first registry", "Manifest, schema, and version checks"],
      ["Project Keys", "Policy gates before invocation"],
      ["Operational proof", "Status, latency, logs, and audit trails"],
    ],
    control: {
      title: "SkillHub runtime plane",
      marketplace: "Marketplace",
      skillName: "Browser Research",
      verified: "Verified",
      publisher: "SkillHub Labs",
      runtime: "REST / MCP",
      scopes: "3 scopes",
      manifest: "Manifest",
      schema: "Schema",
      permissions: "Permissions",
      policy: "Runtime policy preview",
      keyRequired: "Requires Project Key",
      request: "Sample API request",
      response: "Sample response",
      audit: "Example audit snapshot",
      status: "Sample 200 OK",
      latency: "1.23s",
      viewSkill: "View skill",
      schemaValid: "Schema valid",
      allSystems: "Preview sample - gated by Project Key",
    },
    capabilities: [
      {
        title: "Skill API catalog",
        badge: "Available",
        body: "Search public Skills and inspect safe contract metadata.",
        tone: "live",
      },
      {
        title: "Manifest inspection",
        badge: "Available",
        body: "Inspect schema, permissions, runtime target, and version state.",
        tone: "live",
      },
      {
        title: "Runtime invocation",
        badge: "Requires Project Key",
        body: "Run REST / MCP calls only after workspace setup and policy checks.",
        tone: "key",
      },
      {
        title: "Paid marketplace",
        badge: "Preview",
        body: "Paid listings, billing, refunds, and payouts stay visibly gated.",
        tone: "preview",
      },
    ],
    audience: [
      [
        "For builders",
        "Browse reusable Skills and inspect manifests before adding them to your agent.",
      ],
      [
        "For publishers",
        "Submit Skills with clear manifests, permissions, and review status.",
      ],
      [
        "For teams",
        "Govern Project Keys, logs, limits, and runtime usage.",
      ],
    ],
    accessMap: {
      eyebrow: "Launch access",
      title: "What is usable today",
      body: "Use the public catalog for discovery, sign in before runtime work, and keep operator-only workflows behind direct links.",
      action: "Read operating reference",
      items: [
        [
          "What works without login",
          "Marketplace browsing, skill detail inspection, publisher pages, docs, public status, and support links.",
        ],
        [
          "What requires login",
          "Project setup, saved skills, Project Keys, runtime invocation, invoices, publisher drafting, and account settings.",
        ],
        [
          "Operator direct link only",
          "Admin operations stay out of public navigation and open only for approved operator roles.",
        ],
      ],
    },
    trustTitle: "Review permissions, policies, and publisher checks before every agent call",
    trustModules: [
      {
        title: "Permission review",
        body: "See declared capabilities and risk level before a skill enters your project.",
        status: "Scopes visible",
        rows: ["web.search", "web.fetch", "data.store"],
      },
      {
        title: "Runtime governance",
        body: "Project keys, policies, logs, and limits keep runtime usage accountable.",
        status: "Policy checked",
        rows: ["Project Key required", "Rate limit: 60 / min", "Allowed: web.search, web.fetch"],
      },
      {
        title: "Publisher review",
        body: "Submission review separates ready skills from preview or blocked listings.",
        status: "Review queue",
        rows: ["Static analysis", "Permission review", "Security scan"],
      },
    ],
    featuredTitle: "Featured skills",
    featuredAction: "View all skills",
    inspect: "Inspect",
    submitted: "Submitted",
    verified: "Verified",
    runtime: "Runtime",
    permissions: "Permissions",
    howTitle: "How it works",
    howSteps: [
      ["Discover", "Find the right Skill for your Agent."],
      ["Inspect", "Review manifests, permissions, and runtime details."],
      ["Prepare Project Key", "Create a workspace project and generate a Project Key."],
      ["Invoke", "Call the skill via REST API or MCP with your key."],
      ["Monitor", "Track usage, logs, and performance."],
    ],
    finalTitle: "Start from a real skill contract",
    finalBody: "Explore the public registry first, then connect runtime only after project setup is ready.",
    readDocs: "Read Docs",
    footerBody: "Agent skill registry, governance layer, and runtime gateway for real builder workflows.",
    footerAgentTitle: "Connect reusable Skills to agent workflows",
    footerAgentBadge: "Agent-ready skills",
    footerAgentBody:
      "SkillHub keeps reusable Skills discoverable, reviewable, and callable through governed runtime paths, so teams can reduce repeated prompt setup, tool wiring, and handoff work across agent environments.",
    footerAgentEcosystem: [
      {
        name: "Codex",
        body: "Reuse Skill contracts for repo analysis, code fixes, release checks, and developer handoffs.",
        logo: "/brand/agents/codex-color.svg",
        logoKey: "codex",
      },
      {
        name: "Claude Code / MCP",
        body: "Expose approved Skills through MCP while keeping schemas, scopes, and project controls visible.",
        logo: "/brand/agents/claudecode-color.svg",
        logoKey: "claude",
      },
      {
        name: "Gemini CLI",
        body: "Turn research, data, SEO, and operations steps into repeatable workflows for CLI-driven agents.",
        logo: "/brand/agents/geminicli-color.svg",
        logoKey: "gemini",
      },
      {
        name: "GitHub Copilot",
        body: "Give engineering teams reusable checks and workflow context before issues, pull requests, and releases.",
        logo: "/brand/agents/copilot-color.svg",
        logoKey: "copilot",
      },
      {
        name: "OpenClaw",
        body: "Route open agent orchestration through reviewed Skill manifests instead of one-off tool setup.",
        logo: "/brand/agents/openclaw-color.svg",
        logoKey: "openclaw",
      },
      {
        name: "Hermes Agent",
        body: "Capture repeatable agent operations as governed templates teams can inspect and run again.",
        logo: "/brand/agents/hermesagent.svg",
        logoKey: "hermes",
      },
    ] satisfies FooterAgentItem[],
    footerGroups: [
      {
        title: "Product",
        links: [
          ["Browse Skills", "/marketplace"],
          ["Solutions", "/solutions"],
          ["Use cases", "/use-cases"],
          ["What is a Skill?", "/what-is-a-skill"],
        ],
      },
      {
        title: "Developers",
        links: [
          ["Docs", "/docs"],
          ["Integrations", "/integrations"],
          ["MCP", "/mcp"],
          ["Project Keys", "/project-keys"],
        ],
      },
      {
        title: "Resources",
        links: [
          ["Blog", "/blog"],
          ["Examples", "/examples"],
          ["Status", "/status"],
        ],
      },
      {
        title: "Publishers",
        links: [
          ["Publish Skill", "/publish"],
          ["Publisher Directory", "/publishers"],
        ],
      },
      {
        title: "Trust",
        links: [
          ["Security", "/security"],
          ["Privacy Policy", "/privacy"],
          ["Terms", "/terms"],
        ],
      },
    ],
    systemStatus: "Public web/API health OK",
    viewStatus: "View status",
  },
  zh: {
    banner: {
      label: "让 Agent 安全调用可信技能",
      body: "在 SkillHub 发现可复用技能，查看契约、权限和发布者信息，再通过受治理的 REST / MCP 路径接入运行。",
      action: "查看运行状态",
    },
    eyebrow: "Agent 基础设施 / Skill 运行时",
    title: "把 Agent Skills 作为生产基础设施运行。",
    mobileTitle: "面向 AI Agent 的生产级 Skill 基础设施。",
    description:
      "SkillHub 帮团队把可复用 Skill 收进统一目录，先检查来源、权限和 manifest，再通过受控 API 或 MCP 接入真实 Agent 工作流。",
    previewNote:
      "当前为公开预览：你可以直接浏览和检查 Skill；真实运行调用需登录后使用 Project Key。",
    whatIsSkillTitle: "什么是 Skill？",
    whatIsSkillBody:
      "Skill 是可被 Agent 调用的可复用能力组件，例如网页研究、数据分析、代码执行或文档问答。",
    primaryCta: "浏览公开技能",
    quickstartCta: "查看调用文档",
    publishCta: "发布技能",
    evidence: [
      ["契约优先注册", "manifest、Schema 与版本检查"],
      ["Project Key", "调用前先经过策略闸门"],
      ["运营证据", "状态、延迟、日志和审计轨迹"],
    ],
    control: {
      title: "SkillHub 运行平面",
      marketplace: "市场",
      skillName: "Browser Research",
      verified: "已验证",
      publisher: "SkillHub Labs",
      runtime: "REST / MCP",
      scopes: "3 个权限",
      manifest: "Manifest",
      schema: "Schema",
      permissions: "权限",
      policy: "运行策略预览",
      keyRequired: "需要 Project Key",
      request: "示例 API 请求",
      response: "示例响应",
      audit: "示例审计快照",
      status: "示例 200 OK",
      latency: "1.23 秒",
      viewSkill: "查看技能",
      schemaValid: "Schema 有效",
      allSystems: "示例预览，需 Project Key 才能真实调用",
    },
    capabilities: [
      {
        title: "公开 Skill 注册中心",
        badge: "可用",
        body: "搜索公开 Skill，查看来源、权限、版本和发布状态。",
        tone: "live",
      },
      {
        title: "Manifest 检查",
        badge: "可用",
        body: "在接入前确认 schema、权限范围、运行目标和版本状态。",
        tone: "live",
      },
      {
        title: "运行调用",
        badge: "需要 Project Key",
        body: "完成项目设置和策略检查后，再通过 REST / MCP 接入真实调用。",
        tone: "key",
      },
      {
        title: "付费市场",
        badge: "预览",
        body: "付费上架、账单、退款和分账能力仍处于可见预览。",
        tone: "preview",
      },
    ],
    audience: [
      [
        "面向开发者",
        "浏览可复用 Skill，在接入前确认 manifest、权限和运行方式。",
      ],
      [
        "面向发布者",
        "提交带有 manifest、权限说明、示例和支持路径的 Skill。",
      ],
      [
        "面向团队",
        "统一管理 Project Key、日志、限流和运行调用证据。",
      ],
    ],
    accessMap: {
      eyebrow: "上线访问说明",
      title: "谁可以浏览，谁可以调用",
      body: "访客可以浏览公开 Skill；开发者登录后管理项目、Project Key 和运行调用；运营后台仅向授权角色开放。",
      action: "阅读运营参考",
      items: [
        [
          "免登录可用",
          "公开技能、技能详情、发布者主页、使用文档、运行状态和支持入口可以直接查看。",
        ],
        [
          "登录后可用",
          "项目配置、已保存技能、Project Key、运行调用、账单、发布草稿和账号设置需要登录后使用。",
        ],
        [
          "运营员使用单独链接",
          "管理后台不会出现在普通用户导航里，只向通过角色校验的运营账号开放。",
        ],
      ],
    },
    trustTitle: "调用前先确认权限、策略与审核状态",
    trustModules: [
      {
        title: "权限检查",
        body: "在 Skill 进入项目之前，先看清声明能力、数据范围和风险等级。",
        status: "权限可见",
        rows: ["web.search", "web.fetch", "data.store"],
      },
      {
        title: "运行治理",
        body: "Project Key、策略、日志和限流一起约束每次真实运行。",
        status: "策略已检查",
        rows: ["需要 Project Key", "限流：60 / 分钟", "允许：web.search, web.fetch"],
      },
      {
        title: "发布审核",
        body: "发布审核把可上线 Skill、预览 Skill 和阻塞项清楚区分。",
        status: "审核队列",
        rows: ["静态分析", "权限复核", "安全扫描"],
      },
    ],
    featuredTitle: "精选技能",
    featuredAction: "查看全部",
    inspect: "查看",
    submitted: "已提交",
    verified: "已验证",
    runtime: "运行时",
    permissions: "权限",
    howTitle: "如何使用",
    howSteps: [
      ["发现", "找到适合当前 Agent 工作流的 Skill。"],
      ["检查", "确认 manifest、权限范围和运行方式。"],
      ["准备 Project Key", "登录开发者工作台，创建项目并获取 Project Key。"],
      ["调用", "通过 REST API 或 MCP 接入真实调用。"],
      ["监控", "追踪用量、日志、延迟和调用结果。"],
    ],
    finalTitle: "从一个真实 Skill 契约开始",
    finalBody: "先浏览公开 Skill，再在工作台完成项目设置，接入可治理的真实调用。",
    readDocs: "阅读文档",
    footerBody: "面向真实构建流程的 Agent 技能注册中心、治理层和运行网关。",
    footerAgentTitle: "接入主流 Agent 执行环境",
    footerAgentBadge: "Agent-ready skills",
    footerAgentBody:
      "SkillHub 把可复用 Skill 统一放进可发现、可审核、可调用的运行路径里，帮助团队减少重复提示词配置、工具接线和跨 Agent 交接成本。",
    footerAgentEcosystem: [
      {
        name: "Codex",
        body: "复用 Skill 契约处理仓库分析、代码修复、发布检查和研发交接。",
        logo: "/brand/agents/codex-color.svg",
        logoKey: "codex",
      },
      {
        name: "Claude Code / MCP",
        body: "通过 MCP 暴露已批准 Skill，同时保留 schema、权限范围和项目控制。",
        logo: "/brand/agents/claudecode-color.svg",
        logoKey: "claude",
      },
      {
        name: "Gemini CLI",
        body: "把研究、数据、SEO 和运营步骤沉淀成 CLI Agent 可复跑流程。",
        logo: "/brand/agents/geminicli-color.svg",
        logoKey: "gemini",
      },
      {
        name: "GitHub Copilot",
        body: "为 issue、Pull Request 和发布前检查提供可复用的流程上下文。",
        logo: "/brand/agents/copilot-color.svg",
        logoKey: "copilot",
      },
      {
        name: "OpenClaw",
        body: "让开放 Agent 编排先经过已审核的 Skill manifest，减少一次性工具配置。",
        logo: "/brand/agents/openclaw-color.svg",
        logoKey: "openclaw",
      },
      {
        name: "Hermes Agent",
        body: "把常用 Agent 操作沉淀为可检查、可治理、可重复运行的团队模板。",
        logo: "/brand/agents/hermesagent.svg",
        logoKey: "hermes",
      },
    ] satisfies FooterAgentItem[],
    footerGroups: [
      {
        title: "产品",
        links: [
          ["浏览技能", "/marketplace"],
          ["解决方案", "/solutions"],
          ["使用场景", "/use-cases"],
          ["什么是 Skill", "/what-is-a-skill"],
        ],
      },
      {
        title: "开发者",
        links: [
          ["文档", "/docs"],
          ["集成方式", "/integrations"],
          ["MCP", "/mcp"],
          ["Project Key", "/project-keys"],
        ],
      },
      {
        title: "资源",
        links: [
          ["博客指南", "/blog"],
          ["示例模板", "/examples"],
          ["状态", "/status"],
        ],
      },
      {
        title: "发布者",
        links: [
          ["发布 Skill", "/publish"],
          ["发布者目录", "/publishers"],
        ],
      },
      {
        title: "信任",
        links: [
          ["安全", "/security"],
          ["隐私政策", "/privacy"],
          ["服务条款", "/terms"],
        ],
      },
    ],
    systemStatus: "公共 Web/API 健康正常",
    viewStatus: "查看状态",
  },
} as const;

const homeSkillZhCopy: Record<string, { description: string; tags: string[] }> = {
  "browser-research": {
    description: "研究网页主题，并返回包含来源链接的简明结论。",
    tags: ["研究", "浏览器", "引用"],
  },
  "browser-research-pro": {
    description: "研究网页主题，并返回包含来源链接的简明结论。",
    tags: ["研究", "浏览器", "引用"],
  },
  "crm-enrichment": {
    description: "补全 CRM 线索资料，并保留可审计的数据来源。",
    tags: ["销售", "CRM", "线索"],
  },
  "support-triage": {
    description: "将客服请求分类、提取优先级，并给出下一步处理建议。",
    tags: ["客服", "分类", "工单"],
  },
  "dataset-insight": {
    description: "分析数据集结构、异常和摘要，输出可复核的洞察。",
    tags: ["数据", "分析", "摘要"],
  },
  "dataset-summarizer": {
    description: "汇总大型数据集并生成关键洞察。",
    tags: ["数据", "分析", "摘要"],
  },
  "code-runner": {
    description: "在隔离环境中安全执行代码并返回结果。",
    tags: ["开发", "代码", "执行"],
  },
  "codebase-risk-scanner": {
    description: "扫描代码快照中的风险文件、敏感模式和负责人复核线索。",
    tags: ["安全", "代码", "审核"],
  },
  "invoice-extraction": {
    description: "从发票文件中提取结构化字段，并保留审批提示。",
    tags: ["财务", "发票", "OCR"],
  },
  "doc-qa": {
    description: "基于文档和知识源回答问题。",
    tags: ["文档", "问答"],
  },
};

const homeTagZhLabels: Record<string, string> = {
  analysis: "分析",
  browser: "浏览器",
  citations: "引用",
  code: "代码",
  data: "数据",
  dev: "开发",
  docs: "文档",
  execute: "执行",
  qa: "问答",
  research: "研究",
  summary: "摘要",
};

const routableSkillSlugs = new Set(["browser-research", "dataset-summarizer"]);

function statusLabel(status: SkillSummary["verificationStatus"], locale: "en" | "zh") {
  if (status === "verified") {
    return homeLandingCopy[locale].verified;
  }

  if (status === "submitted") {
    return homeLandingCopy[locale].submitted;
  }

  return locale === "zh" ? "预览" : "Preview";
}

function riskLabel(level: SkillSummary["permissionLevel"], locale: "en" | "zh") {
  const labels = {
    en: { low: "1 scope", medium: "3 scopes", high: "4 scopes" },
    zh: { low: "1 个权限", medium: "3 个权限", high: "4 个权限" },
  };

  return labels[locale][level];
}

function trustEvidenceLabel(index: number, locale: "en" | "zh") {
  const labels = {
    en: ["Low", "OK", "Passed"],
    zh: ["低", "正常", "通过"],
  };

  return labels[locale][index] ?? labels[locale][labels[locale].length - 1];
}

function homeSkillDescription(skill: SkillSummary, locale: "en" | "zh") {
  if (locale === "en") {
    return skill.description;
  }

  return homeSkillZhCopy[skill.slug]?.description ?? skill.description;
}

function homeSkillTags(skill: SkillSummary, locale: "en" | "zh") {
  if (locale === "en") {
    return skill.tags;
  }

  return (
    homeSkillZhCopy[skill.slug]?.tags ??
    skill.tags.map((tag) => homeTagZhLabels[tag.toLowerCase()] ?? tag)
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const skills = await getSkills();
  const landing = homeLandingCopy[locale];
  const packageIntro = promotedSkillPackageIntro[locale];
  const promotedPackages = getPromotedSkillPackages(locale);
  const seenSkillKeys = new Set<string>();
  const featuredSkills = [...skills, ...fallbackFeaturedSkills]
    .filter((skill) => routableSkillSlugs.has(skill.slug))
    .filter((skill) => {
      const skillKey = `${skill.slug}:${skill.displayName.toLowerCase()}`;
      const displayKey = `display:${skill.displayName.toLowerCase()}`;

      if (seenSkillKeys.has(skillKey) || seenSkillKeys.has(displayKey)) {
        return false;
      }

      seenSkillKeys.add(skillKey);
      seenSkillKeys.add(displayKey);
      return true;
    })
    .slice(0, 4);
  const leadSkill = featuredSkills[0] ?? fallbackFeaturedSkills[0];
  const leadRuntime = leadSkill.runtimeType
    ? leadSkill.runtimeType.toUpperCase()
    : landing.control.runtime;

  return (
    <main className={`product-shell home-shell home-shell--${locale}`}>
      <section className="home-frame home-frame--v2" aria-labelledby="home-v2-heading">
        <SiteHeader
          active="home"
          apiUrl={apiUrl}
          dictionary={dictionary}
          locale={locale}
          pathname="/"
        />

        <section className="home-v2-root" aria-labelledby="home-heading">
          <section className="home-v2-hero">
            <div className="home-v2-motion-field" aria-hidden="true">
              <span className="home-v2-ambient-rail home-v2-ambient-rail--left">
                <span />
                <span />
                <span />
              </span>
              <span className="home-v2-ambient-rail home-v2-ambient-rail--right">
                <span />
                <span />
                <span />
              </span>
              <span className="home-v2-floating-chip home-v2-floating-chip--schema">schema locked</span>
              <span className="home-v2-floating-chip home-v2-floating-chip--policy">policy checked</span>
              <span className="home-v2-floating-chip home-v2-floating-chip--mcp">mcp route</span>
              <span className="home-v2-floating-chip home-v2-floating-chip--project">project key</span>
            </div>
            <div className="home-v2-hero__head">
              <div className="home-v2-hero__copy">
                <span className="home-v2-eyebrow">Registry · Runtime · Governance</span>
                <h1 id="home-v2-heading">
                  {locale === "zh"
                    ? "SkillHub：Agent Skill 的注册与运行层。"
                    : "SkillHub: the registry and runtime layer for Agent Skills."}
                </h1>
                <p>
                  {locale === "zh"
                    ? "发现可复用 Skill，检查 manifest、schema、权限和发布者，再通过 Project Key、REST API 或 MCP 接入真实 Agent 工作流。"
                    : "Discover reusable Skills, inspect manifests, schemas, permissions, and publishers, then connect them to real agent workflows through Project Keys, REST APIs, or MCP."}
                </p>
                <div className="hero-actions home-v2-actions">
                  <PublicEventLink
                    className="primary-button primary-button--large"
                    eventName="browse_skills_cta_click"
                    eventProperties={{ surface: "home_v2_hero" }}
                    href={localizedHref("/marketplace", locale)}
                  >
                    <Search size={18} aria-hidden="true" />
                    {locale === "zh" ? "进入 Marketplace" : "Open Marketplace"}
                  </PublicEventLink>
                  <PublicEventLink
                    className="secondary-button secondary-button--large"
                    eventName="docs_cta_click"
                    eventProperties={{ surface: "home_v2_hero" }}
                    href={localizedHref("/docs#api", locale)}
                  >
                    <Terminal size={18} aria-hidden="true" />
                    {locale === "zh" ? "查看运行文档" : "View runtime docs"}
                  </PublicEventLink>
                </div>
              </div>
              <aside className="home-v2-preview-note" role="status">
                <span>{locale === "zh" ? "公开预览" : "Launch Preview"}</span>
                <strong>
                  {locale === "zh"
                    ? "公开目录可浏览；真实运行需要登录后的 Project Key。"
                    : "The public catalog is browsable; real runtime calls require a signed-in Project Key."}
                </strong>
                <p>
                  {locale === "zh"
                    ? "访客可以查看目录和 Skill 详情；开发者登录后管理项目、Project Key、运行调用和审计记录。"
                    : "Visitors can inspect catalog details; signed-in developers manage projects, Project Keys, runtime calls, and audit evidence."}
                </p>
              </aside>
            </div>

            <section className="home-v2-workbench" aria-label={locale === "zh" ? "SkillHub 工作台预览" : "SkillHub workbench preview"}>
              <span className="home-v2-workbench__scan" aria-hidden="true" />
              <span className="home-v2-flow-line home-v2-flow-line--catalog" aria-hidden="true" />
              <span className="home-v2-flow-line home-v2-flow-line--runtime" aria-hidden="true" />
              <div className="home-v2-workbench__top">
                <div className="home-v2-crumbs">
                  <strong>SkillHub Workbench</strong>
                  <span>/</span>
                  <span>Marketplace</span>
                  <span>/</span>
                  <span>{leadSkill.slug}</span>
                </div>
                <span className="home-v2-workbench__status">Manifest verified · runtime gated</span>
              </div>

              <div className="home-v2-workbench__grid">
                <aside className="home-v2-pane home-v2-pane--side">
                  <div className="home-v2-pane__title">
                    <span>Find a Skill</span>
                    <small>Public catalog</small>
                  </div>
                  <div className="home-v2-search-panel">
                    <div className="home-v2-search-box">
                      <Search size={15} aria-hidden="true" />
                      <span>research / data / code review</span>
                    </div>
                    <div className="home-v2-tag-row">
                      <span className="home-v2-tag home-v2-tag--green">Verified</span>
                      <span className="home-v2-tag home-v2-tag--cyan">MCP</span>
                      <span className="home-v2-tag">REST</span>
                      <span className="home-v2-tag home-v2-tag--amber">Preview</span>
                    </div>
                  </div>
                  <div className="home-v2-skill-list">
                    <article className="home-v2-skill-row home-v2-skill-row--active">
                      <span className="home-v2-skill-icon" aria-hidden="true">B</span>
                      <div>
                        <strong>{leadSkill.displayName}</strong>
                        <small>SkillHub Labs · web.search · citations</small>
                        <span className="home-v2-tag home-v2-tag--green">{landing.verified}</span>
                        <span className="home-v2-tag home-v2-tag--cyan">REST / MCP</span>
                      </div>
                    </article>
                    {[
                      ["D", "dataset-summarizer", "Data workflow · sheet.read · report.write", "Reviewed", "HTTP"],
                      ["R", "repo-review-assistant", "Developer workflow · repo.read · release", "Preview", "MCP"],
                      ["S", "support-triage", "Operations workflow · ticket.read", "Public", "Medium risk"],
                    ].map(([initial, title, meta, state, runtime]) => (
                      <article className="home-v2-skill-row" key={title}>
                        <span className="home-v2-skill-icon" aria-hidden="true">{initial}</span>
                        <div>
                          <strong>{title}</strong>
                          <small>{meta}</small>
                          <span className={state === "Preview" ? "home-v2-tag home-v2-tag--amber" : "home-v2-tag"}>
                            {state}
                          </span>
                          <span className={runtime === "MCP" ? "home-v2-tag home-v2-tag--cyan" : "home-v2-tag"}>
                            {runtime}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </aside>

                <section className="home-v2-pane home-v2-pane--contract">
                  <div className="home-v2-pane__title">
                    <span>Skill Contract</span>
                    <small>Visible before adoption</small>
                  </div>
                  <div className="home-v2-contract-head">
                    <h2>{leadSkill.displayName}</h2>
                    <p>
                      {locale === "zh"
                        ? "面向 Agent 的网页研究 Skill。接入前先看清输入输出、权限范围、运行方式、发布者和审核状态。"
                        : "A web research Skill for agents. Inspect inputs, outputs, permissions, runtime protocols, publisher, and review status before adoption."}
                    </p>
                    <div className="home-v2-paper-actions">
                      <PublicEventLink
                        className="home-v2-paper-button home-v2-paper-button--primary"
                        eventName="browse_skills_cta_click"
                        eventProperties={{ surface: "home_v2_workbench" }}
                        href={homeSkillHref(leadSkill, locale)}
                      >
                        {locale === "zh" ? "加入项目" : "Add to project"}
                      </PublicEventLink>
                      <PublicEventLink
                        className="home-v2-paper-button"
                        eventName="skill_card_click"
                        eventProperties={{ surface: "home_v2_workbench", skill: leadSkill.slug }}
                        href={homeSkillHref(leadSkill, locale)}
                      >
                        {locale === "zh" ? "查看详情" : "View details"}
                      </PublicEventLink>
                      <span className="home-v2-paper-button">{locale === "zh" ? "复制 API 路径" : "Copy API path"}</span>
                    </div>
                  </div>
                  <div className="home-v2-contract-matrix">
                    <div>
                      <span>Publisher</span>
                      <strong>SkillHub Labs</strong>
                    </div>
                    <div>
                      <span>Runtime</span>
                      <strong>{leadRuntime}</strong>
                    </div>
                    <div>
                      <span>Permissions</span>
                      <strong>3 scopes</strong>
                    </div>
                    <div>
                      <span>Access</span>
                      <strong>Project Key</strong>
                    </div>
                  </div>
                  <div className="home-v2-manifest">
                    <div className="home-v2-code" aria-label={locale === "zh" ? "Manifest 示例" : "Manifest sample"}>
                      <span><em>1</em>{"{"}</span>
                      <span className="home-v2-code__key"><em>2</em>{`"name": "${leadSkill.slug}",`}</span>
                      <span><em>3</em>{`"version": "${leadSkill.version}",`}</span>
                      <span className="home-v2-code__key"><em>4</em>{`"runtime": ["rest", "mcp"],`}</span>
                      <span><em>5</em>{`"input_schema": ["query", "depth", "sources_required"],`}</span>
                      <span><em>6</em>{`"permissions": ["web.search", "web.fetch", "data.store"],`}</span>
                      <span className="home-v2-code__key"><em>7</em>{`"review_status": "verified"`}</span>
                      <span><em>8</em>{"}"}</span>
                    </div>
                    <aside className="home-v2-review-card">
                      <h3>Pre-adoption review</h3>
                      {(locale === "zh"
                        ? [
                            "Schema 能被 Agent 和调用方稳定解析",
                            "权限边界在详情页提前展示",
                            "真实运行绑定项目与 Project Key",
                            "调用结果进入日志和审计轨迹",
                          ]
                        : [
                            "Schema is stable for agents and callers",
                            "Permission boundaries are visible before adoption",
                            "Runtime calls are bound to projects and Project Keys",
                            "Results enter logs and audit trails",
                          ]
                      ).map((item) => (
                        <span className="home-v2-check" key={item}>{item}</span>
                      ))}
                    </aside>
                  </div>
                </section>

                <aside className="home-v2-pane home-v2-pane--runtime">
                  <div className="home-v2-pane__title">
                    <span>Runtime Route</span>
                    <small>Policy checked</small>
                  </div>
                  <div className="home-v2-runtime-route">
                    <article>
                      <i className="home-v2-runtime-pulse" aria-hidden="true" />
                      <span>REST</span>
                      <code>POST /v1/runtime/invoke</code>
                      <strong>Authorization: Bearer sk_proj_***</strong>
                    </article>
                    <article>
                      <i className="home-v2-runtime-pulse" aria-hidden="true" />
                      <span>MCP</span>
                      <code>@useskillhub/mcp-server</code>
                      <strong>Expose approved Skills as callable tools.</strong>
                    </article>
                    <article>
                      <span>Audit trace</span>
                      {[
                        { label: "manifest v1.4.2 locked", value: "ok", warn: false },
                        { label: "requires Project Key", value: "gate", warn: true },
                        { label: "policy allows web.search", value: "ok", warn: false },
                        { label: "response schema matched", value: "200", warn: false },
                      ].map((item) => (
                        <div className={item.warn ? "home-v2-trace home-v2-trace--warn" : "home-v2-trace"} key={item.label}>
                          <strong>{item.label}</strong>
                          <small>{item.value}</small>
                        </div>
                      ))}
                    </article>
                  </div>
                </aside>
              </div>
            </section>
          </section>

          <section className="home-v2-section">
            <div className="home-v2-section__head">
              <div>
                <span>{locale === "zh" ? "面向真实使用路径" : "Built for real adoption paths"}</span>
                <h2>
                  {locale === "zh"
                    ? "开发者、团队和发布者共用一条 Skill 采用流程。"
                    : "Developers, teams, and publishers share one Skill adoption flow."}
                </h2>
              </div>
              <p>
                {locale === "zh"
                  ? "从发现、审查到项目接入，每个角色都能清楚看到下一步。"
                  : "From discovery and inspection to project adoption, every role gets a clear next step."}
              </p>
            </div>
            <div className="home-v2-role-grid">
              {(locale === "zh"
                ? [
                    ["Agent 开发者", "BUILD", "从 Marketplace 找到可复用 Skill，确认契约后接入自己的 Agent 或工作流。", ["检查输入输出 schema", "确认 REST / MCP 调用方式", "用 Project Key 开始真实运行"]],
                    ["团队管理员", "GOVERN", "把权限、调用、日志和审计放进统一项目边界，减少不可追踪的一次性工具接入。", ["项目级 Key 与策略控制", "调用日志和版本记录", "公开访问和登录工作台分层"]],
                    ["Skill 发布者", "PUBLISH", "用清晰 manifest、权限说明和审核状态，让自己的 Skill 更容易被团队采用。", ["提交 Skill 契约与示例", "展示发布者和审核信息", "为未来付费市场准备分发路径"]],
                  ]
                : [
                    ["Agent builders", "BUILD", "Find reusable Skills in the Marketplace, inspect the contract, and connect them to agent workflows.", ["Inspect input and output schemas", "Confirm REST / MCP runtime paths", "Run with Project Keys"]],
                    ["Team admins", "GOVERN", "Put permissions, runtime usage, logs, and audits inside a project boundary.", ["Project Keys and policy controls", "Invocation logs and version records", "Public and signed-in workflow separation"]],
                    ["Skill publishers", "PUBLISH", "Publish Skills with clear manifests, permission notes, and review status.", ["Submit contracts and examples", "Show publisher and review metadata", "Prepare for marketplace distribution"]],
                  ]
              ).map(([title, badge, body, items]) => (
                <article className="home-v2-role-card" key={title as string}>
                  <div>
                    <h3>{title as string}</h3>
                    <span>{badge as string}</span>
                  </div>
                  <p>{body as string}</p>
                  <ul>
                    {(items as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="home-v2-section">
            <div className="home-v2-section__head">
              <div>
                <span>{locale === "zh" ? "运行边界" : "Runtime boundary"}</span>
                <h2>
                  {locale === "zh"
                    ? "公开发现、登录运行、项目治理分层清楚。"
                    : "Public discovery, signed-in runtime, and project governance stay clearly separated."}
                </h2>
              </div>
              <p>
                {locale === "zh"
                  ? "公开目录服务发现和审查；真实调用进入登录后的项目、权限、日志和审计体系。"
                  : "The public catalog supports discovery and inspection; real invocations move through signed-in projects, permissions, logs, and audits."}
              </p>
            </div>
            <div className="home-v2-ops-grid">
              <article className="home-v2-ops-panel">
                <div className="home-v2-ops-panel__head">
                  <strong>{locale === "zh" ? "今天可用" : "Available today"}</strong>
                  <span className="home-v2-tag home-v2-tag--green">Public</span>
                </div>
                {(locale === "zh"
                  ? [
                      ["Marketplace 浏览", "无需登录", "可搜索和筛选"],
                      ["Skill 详情检查", "无需登录", "manifest / 权限"],
                      ["Project Key", "需要登录", "项目绑定"],
                      ["Runtime Invoke", "需要登录", "REST / MCP"],
                    ]
                  : [
                      ["Marketplace browsing", "No login", "Search and filter"],
                      ["Skill detail inspection", "No login", "manifest / permissions"],
                      ["Project Key", "Sign-in required", "Project scoped"],
                      ["Runtime Invoke", "Sign-in required", "REST / MCP"],
                    ]
                ).map(([label, access, detail]) => (
                  <div className="home-v2-ops-row" key={label}>
                    <strong>{label}</strong>
                    <span>{access}</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </article>
              <div className="home-v2-primitive-grid">
                {(locale === "zh"
                  ? [
                      ["01", "Public Skill Catalog", "让用户和 AI 都能按任务、分类、运行方式和审核状态找到 Skill。"],
                      ["02", "Manifest Contract", "统一展示名称、版本、输入输出、权限、发布者和运行协议。"],
                      ["03", "Permission Boundary", "在采用前说明 Skill 声明的能力范围和可能接触的数据类型。"],
                      ["04", "Runtime Evidence", "记录调用路径、版本、策略结果和响应状态，便于团队回看。"],
                    ]
                  : [
                      ["01", "Public Skill Catalog", "Let users and AI find Skills by task, category, runtime, and review state."],
                      ["02", "Manifest Contract", "Show name, version, inputs, outputs, permissions, publisher, and runtime protocol."],
                      ["03", "Permission Boundary", "Explain declared capabilities and data access before adoption."],
                      ["04", "Runtime Evidence", "Record routes, versions, policy results, and response state for review."],
                    ]
                ).map(([num, title, body]) => (
                  <article className="home-v2-primitive-card" key={num}>
                    <span>{num}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="home-v2-agent-section">
            <div className="home-v2-agent-copy">
              <span>Agent ecosystem</span>
              <h2>
                {locale === "zh"
                  ? "连接主流 Agent 环境，但 Skill 契约归 SkillHub 管。"
                  : "Connect leading agent environments while Skill contracts stay governed in SkillHub."}
              </h2>
              <p>
                {locale === "zh"
                  ? "Codex、Claude Code、Gemini CLI、GitHub Copilot、OpenClaw 和 Hermes Agent 可以通过 REST 或 MCP 使用经过审查的 Skill。"
                  : "Codex, Claude Code, Gemini CLI, GitHub Copilot, OpenClaw, and Hermes Agent can use reviewed Skills through REST or MCP."}
              </p>
            </div>
            <div className="home-v2-agent-grid">
              {landing.footerAgentEcosystem.map((agent) => (
                <article className={`home-v2-agent-card home-v2-agent-card--${agent.logoKey}`} key={agent.name}>
                  <span className="home-v2-agent-logo" aria-hidden="true">
                    <img src={agent.logo} alt="" />
                  </span>
                  <div>
                    <strong>{agent.name}</strong>
                    <p>{agent.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="home-v2-final-cta">
            <div>
              <h2>{landing.finalTitle}</h2>
              <p>{landing.finalBody}</p>
            </div>
            <div className="hero-actions">
              <PublicEventLink className="primary-button primary-button--large" href={localizedHref("/marketplace", locale)} eventName="browse_skills_cta_click" eventProperties={{ surface: "home_v2_final_cta" }}>
                {landing.primaryCta}
                <ArrowRight size={16} aria-hidden="true" />
              </PublicEventLink>
              <PublicEventLink className="secondary-button secondary-button--large" href={localizedHref("/docs", locale)} eventName="docs_cta_click" eventProperties={{ surface: "home_v2_final_cta" }}>
                <FileJson size={17} aria-hidden="true" />
                {landing.readDocs}
              </PublicEventLink>
            </div>
          </section>

          <footer className="home-v2-footer">
            <section className="home-v2-footer-agent" aria-label={locale === "zh" ? "页脚 Agent 生态接入" : "Footer agent ecosystem"}>
              <div className="home-v2-footer-agent__intro">
                <span className="home-v2-tag home-v2-tag--green">{landing.footerAgentBadge}</span>
                <h2>{landing.footerAgentTitle}</h2>
                <p>{landing.footerAgentBody}</p>
              </div>
              <div className="home-v2-footer-logo-grid">
                {landing.footerAgentEcosystem.map((agent) => (
                  <article className={`home-v2-footer-logo home-v2-footer-logo--${agent.logoKey}`} key={agent.name}>
                    <img src={agent.logo} alt="" />
                    <span>{agent.name}</span>
                  </article>
                ))}
              </div>
            </section>
            <section className="home-v2-footer-main">
              <div className="home-v2-footer-brand">
                <div className="home-v2-footer-brand__head">
                  <span aria-hidden="true">S</span>
                  <strong>SkillHub</strong>
                </div>
                <p>{landing.footerBody}</p>
                <div className="home-v2-footer-contact">
                  <div>
                    <span>{locale === "zh" ? "技术支持" : "Support"}</span>
                    <a href={companyLinks.supportMailto}>{companyInfo.supportEmail}</a>
                  </div>
                  <div>
                    <span>{locale === "zh" ? "商务合作" : "Business"}</span>
                    <a href={companyLinks.businessMailto}>{companyInfo.businessEmail}</a>
                  </div>
                  <div>
                    <span>{locale === "zh" ? "公司地址" : "Address"}</span>
                    <span>{companyInfo.address}</span>
                  </div>
                </div>
                <PublicEventLink className="home-v2-status-pill" href={localizedHref("/status", locale)} eventName="footer_link_click" eventProperties={{ target: "status" }}>
                  {landing.systemStatus} · {landing.viewStatus}
                </PublicEventLink>
              </div>
              <nav className="home-v2-footer-nav" aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}>
                {landing.footerGroups.map((group) => (
                  <section className="home-v2-footer-group" key={group.title}>
                    <h2>{group.title}</h2>
                    {group.links.map(([label, href], index) => (
                      <PublicEventLink
                        className={index === 0 ? "home-v2-footer-link--featured" : undefined}
                        href={localizedHref(href, locale)}
                        eventName="footer_link_click"
                        eventProperties={{ target: href }}
                        key={`${group.title}-${label}`}
                      >
                        {label}
                      </PublicEventLink>
                    ))}
                  </section>
                ))}
              </nav>
            </section>
            <div className="home-v2-footer-bottom">
              <span>© 2026 SkillHub. All rights reserved.</span>
              <span className="home-v2-footer-signature" aria-label="Registry Runtime Governance">
                <span>Registry</span>
                <span>Runtime</span>
                <span>Governance</span>
              </span>
            </div>
          </footer>
        </section>

        <div className="home-preview-banner" role="status">
          <div className="home-preview-banner__inner">
            <span className="home-preview-banner__dot" aria-hidden="true" />
            <strong>{landing.banner.label}</strong>
            <p>{landing.banner.body}</p>
            <PublicEventLink href={localizedHref("/status", locale)} eventName="view_status_click" eventProperties={{ surface: "hero_banner" }}>
              {landing.banner.action}
              <ArrowRight size={14} aria-hidden="true" />
            </PublicEventLink>
          </div>
        </div>

        <section className="home-hero-grid reveal-scope">
          <div className="home-tech-field" aria-hidden="true">
            <ParticleField />
            <span className="home-tech-field__scan home-tech-field__scan--a" />
            <span className="home-tech-field__scan home-tech-field__scan--b" />
            <span className="home-tech-field__orbit home-tech-field__orbit--a" />
            <span className="home-tech-field__orbit home-tech-field__orbit--b" />
            <span className="home-tech-field__node home-tech-field__node--a" />
            <span className="home-tech-field__node home-tech-field__node--b" />
            <span className="home-tech-field__node home-tech-field__node--c" />
            <span className="home-tech-field__data home-tech-field__data--a" />
            <span className="home-tech-field__data home-tech-field__data--b" />
            <span className="home-tech-field__data home-tech-field__data--c" />
          </div>
          <div className="hero-copy home-hero-copy reveal-item">
            <div className="eyebrow">
              <span>{landing.eyebrow}</span>
            </div>
            <h1 id="home-heading" aria-label={landing.title}>
              {locale === "en" ? (
                <>
                  Run agent skills like{" "}
                  <span>production infrastructure.</span>
                </>
              ) : (
                <>
                  把 Agent Skills
                  <br />
                  作为<span>生产基础设施</span>
                  <br />
                  运行。
                </>
              )}
            </h1>
            <p>{landing.description}</p>
            <p className="home-preview-note">{landing.previewNote}</p>
            <div className="hero-actions">
              <PublicEventLink
                className="primary-button primary-button--large"
                eventName="browse_skills_cta_click"
                eventProperties={{ surface: "hero" }}
                href={localizedHref("/marketplace", locale)}
              >
                <Search size={18} aria-hidden="true" />
                <span>{landing.primaryCta}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </PublicEventLink>
              <PublicEventLink
                className="secondary-button secondary-button--large"
                eventName="docs_cta_click"
                eventProperties={{ surface: "hero" }}
                href={localizedHref("/docs#api", locale)}
              >
                <Terminal size={18} aria-hidden="true" />
                <span>{landing.quickstartCta}</span>
              </PublicEventLink>
              <PublicEventLink
                className="ghost-button ghost-button--large"
                eventName="publish_skill_cta_click"
                eventProperties={{ surface: "hero" }}
                href={localizedHref("/publish", locale)}
              >
                <span>{landing.publishCta}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </PublicEventLink>
            </div>

            <div className="home-evidence-row" aria-label={landing.eyebrow}>
              {landing.evidence.map(([label, detail], index) => {
                const Icon = proofIcons[index];

                return (
                  <div className="home-evidence-pill" key={label}>
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                    <small>{detail}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="control-plane reveal-item reveal-item--delay" aria-label={landing.control.title}>
            <div className="control-runtime-map" aria-hidden="true">
              <span className="control-runtime-map__node control-runtime-map__node--registry" />
              <span className="control-runtime-map__node control-runtime-map__node--policy" />
              <span className="control-runtime-map__node control-runtime-map__node--runtime" />
              <span className="control-runtime-map__rail control-runtime-map__rail--a" />
              <span className="control-runtime-map__rail control-runtime-map__rail--b" />
              <span className="control-runtime-map__pulse control-runtime-map__pulse--a" />
              <span className="control-runtime-map__pulse control-runtime-map__pulse--b" />
            </div>
            <div className="control-mobile-tabs" aria-hidden="true">
              <span className="control-mobile-tabs__item control-mobile-tabs__item--active">
                Skill
              </span>
              <span className="control-mobile-tabs__item">{landing.control.manifest}</span>
              <span className="control-mobile-tabs__item">{landing.control.policy}</span>
            </div>

            <article className="control-pane control-pane--market">
              <div className="control-pane__label">
                <span>{landing.control.marketplace}</span>
              </div>
              <div className="control-skill-card">
                <div className="control-skill-card__icon" aria-hidden="true">
                  <Boxes size={22} />
                </div>
                <div>
                  <strong>{leadSkill.displayName}</strong>
                  <span>
                    by {landing.control.publisher}
                    <CheckCircle2 size={12} aria-hidden="true" />
                  </span>
                </div>
                <span className="control-badge control-badge--verified">
                  {landing.control.verified}
                </span>
              </div>
              <p className="control-skill-description">
                {homeSkillDescription(leadSkill, locale)}
              </p>
              <div className="control-tag-row">
                {homeSkillTags(leadSkill, locale).slice(0, 2).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <dl className="control-meta-list">
                <div>
                  <dt>{landing.control.runtime}</dt>
                  <dd>{leadRuntime}</dd>
                </div>
                <div>
                  <dt>{landing.control.permissions}</dt>
                  <dd>{riskLabel(leadSkill.permissionLevel, locale)}</dd>
                </div>
              </dl>
              <PublicEventLink className="control-pane__button" eventName="skill_card_click" eventProperties={{ surface: "hero_mockup", skill: leadSkill.slug }} href={homeSkillHref(leadSkill, locale)}>
                {landing.control.viewSkill}
              </PublicEventLink>
            </article>

            <div className="control-flow-line" aria-hidden="true" />

            <article className="control-pane control-pane--manifest">
              <div className="control-tabs" aria-label={landing.control.manifest}>
                <span className="control-tabs__item control-tabs__item--active">
                  {landing.control.manifest}
                </span>
                <span className="control-tabs__item">{landing.control.schema}</span>
                <span className="control-tabs__item">{landing.control.permissions}</span>
              </div>
              <div className="control-code" aria-label={locale === "zh" ? "示例 manifest JSON" : "Example manifest JSON"}>
                <span className="control-code__line">
                  <em>1</em> {"{"}
                </span>
                <span className="control-code__line control-code__line--active">
                  <em>2</em> {'"name": "browser-research",'}
                </span>
                <span className="control-code__line">
                  <em>3</em> {'"version": "1.2.0",'}
                </span>
                <span className="control-code__line control-code__line--active control-code__line--delay">
                  <em>4</em> {'"permissions": ["web.search", "web.fetch", "data.store"],'}
                </span>
                <span className="control-code__line">
                  <em>5</em> {'"runtime": {"protocols": ["rest", "mcp"]}'}
                </span>
                <span className="control-code__line">
                  <em>6</em> {"}"}
                </span>
              </div>
              <div className="control-pane__foot">
                <span className="home-preview-banner__dot" aria-hidden="true" />
                <span>{landing.control.schemaValid}</span>
                <code>v1.2.0</code>
              </div>
            </article>

            <div className="control-flow-line control-flow-line--late" aria-hidden="true" />

            <article className="control-pane control-pane--runtime">
              <div className="control-pane__label">
                <span>{landing.control.policy}</span>
                <span className="control-badge control-badge--key">
                  {landing.control.keyRequired}
                </span>
              </div>
              <div className="runtime-console" aria-label={locale === "zh" ? "示例 API 请求" : "Sample API request"}>
                <span>{landing.control.request}</span>
                <code>POST /v1/runtime/invoke</code>
                <pre>{`{
  "query": "latest AI agent framework comparison",
  "max_results": 5
}`}</pre>
              </div>
              <div className="runtime-console runtime-console--success" aria-label={locale === "zh" ? "示例 API 响应" : "Sample API response"}>
                <span>{landing.control.response}</span>
                <strong>{landing.control.status}</strong>
                <code>{landing.control.latency}</code>
              </div>
              <div className="runtime-audit">
                <span>{landing.control.audit}</span>
                <strong>/v1/runtime/invoke</strong>
                <strong>200</strong>
              </div>
              <div className="control-pane__foot">
                <span className="home-preview-banner__dot" aria-hidden="true" />
                <span>{landing.control.allSystems}</span>
              </div>
            </article>
          </aside>

          <section className="home-capability-strip reveal-item reveal-item--late" aria-label={landing.banner.label}>
            {landing.capabilities.map((item, index) => {
              const Icon = capabilityIcons[index];

              return (
                <article className="home-capability" key={item.title}>
                  <Icon size={22} aria-hidden="true" />
                  <div>
                    <div className="home-capability__head">
                      <strong>{item.title}</strong>
                      <span className={`state-badge state-badge--${item.tone}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p>{item.body}</p>
                  </div>
                </article>
              );
            })}
          </section>
        </section>

        <section className="home-section home-clarity-section" aria-labelledby="home-skill-definition-heading">
          <article className="home-definition-callout lift-card">
            <div>
              <span>{landing.banner.label}</span>
              <h2 id="home-skill-definition-heading">{landing.whatIsSkillTitle}</h2>
            </div>
            <p>{landing.whatIsSkillBody}</p>
          </article>
          <div className="home-audience-grid" aria-label={locale === "zh" ? "用户路径" : "Audience routes"}>
            {landing.audience.map(([title, body]) => (
              <article className="home-audience-card" key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <article className="home-access-map lift-card" aria-labelledby="home-access-map-heading">
            <div className="home-access-map__head">
              <div>
                <span>{landing.accessMap.eyebrow}</span>
                <h2 id="home-access-map-heading">{landing.accessMap.title}</h2>
              </div>
              <PublicEventLink
                className="secondary-button secondary-button--compact"
                eventName="docs_cta_click"
                eventProperties={{ surface: "access_map" }}
                href={localizedHref("/docs#operating-reference", locale)}
              >
                <FileJson size={15} aria-hidden="true" />
                {landing.accessMap.action}
              </PublicEventLink>
            </div>
            <p>{landing.accessMap.body}</p>
            <div className="home-access-map__grid">
              {landing.accessMap.items.map(([title, body]) => (
                <div className="home-access-map__item" key={title}>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="home-section home-package-section" aria-labelledby="home-package-heading">
          <div className="home-section__head home-package-section__head">
            <div>
              <span className="home-package-section__eyebrow">{packageIntro.eyebrow}</span>
              <h2 id="home-package-heading">{packageIntro.title}</h2>
              <p>{packageIntro.body}</p>
            </div>
          </div>

          <div className="home-package-grid">
            {promotedPackages.map((item, index) => {
              const Icon = packageIcons[index] ?? Boxes;

              return (
                <article className="home-package-card lift-card" key={item.key}>
                  <div className="home-package-card__top">
                    <div className="home-package-card__icon" aria-hidden="true">
                      <Icon size={22} />
                    </div>
                    <div>
                      <span>{item.eyebrow}</span>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                  <p>{item.body}</p>
                  <div className="home-package-card__fit">{item.fit}</div>
                  <div className="home-package-card__list">
                    <strong>{locale === "zh" ? "交付结果" : "Outcomes"}</strong>
                    {item.outcomes.map((outcome) => (
                      <span key={outcome}>
                        <CheckCircle2 size={14} aria-hidden="true" />
                        {outcome}
                      </span>
                    ))}
                  </div>
                  <div className="home-package-card__skills" aria-label={locale === "zh" ? "推荐技能" : "Recommended skills"}>
                    {item.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <p className="home-package-card__path">{item.path}</p>
                  <div className="home-package-card__actions">
                    <PublicEventLink
                      className="secondary-button"
                      href={localizedHref(item.marketplaceHref, locale)}
                      eventName="browse_skills_cta_click"
                      eventProperties={{ surface: "home_package", track: item.key }}
                    >
                      {item.ctaPrimary}
                      <ArrowRight size={15} aria-hidden="true" />
                    </PublicEventLink>
                    <PublicEventLink
                      className="ghost-button"
                      href={localizedHref(item.contactHref, locale)}
                      eventName="contact_cta_click"
                      eventProperties={{ surface: "home_package", track: item.key }}
                    >
                      {item.ctaSecondary}
                    </PublicEventLink>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-section home-trust-section" aria-labelledby="home-trust-heading">
          <h2 id="home-trust-heading">{landing.trustTitle}</h2>
          <div className="home-trust-modules">
            {landing.trustModules.map((item, index) => {
              const Icon = trustModuleIcons[index];

              return (
                <article className="home-trust-module lift-card" key={item.title}>
                  <div className="home-trust-module__head">
                    <Icon size={20} aria-hidden="true" />
                    <span>{item.status}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <div className="home-trust-module__rows">
                    {item.rows.map((row, rowIndex) => (
                      <span key={row}>
                        {row}
                        <strong>{trustEvidenceLabel(rowIndex, locale)}</strong>
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-section home-featured-section" aria-labelledby="home-featured-heading">
          <div className="home-section__head">
            <h2 id="home-featured-heading">{landing.featuredTitle}</h2>
            <PublicEventLink href={localizedHref("/marketplace", locale)} eventName="browse_skills_cta_click" eventProperties={{ surface: "featured_header" }}>
              {landing.featuredAction}
              <ArrowRight size={15} aria-hidden="true" />
            </PublicEventLink>
          </div>

          <div className="home-featured-grid">
            {featuredSkills.map((skill, index) => {
              const Icon = skillIcons[index] ?? Boxes;
              const status = statusLabel(skill.verificationStatus, locale);
              const isVerified = skill.verificationStatus === "verified";

              return (
                <article className="home-skill-card lift-card" key={skill.id}>
                  <div className="home-skill-card__head">
                    <div className={`home-skill-card__icon home-skill-card__icon--${index + 1}`} aria-hidden="true">
                      <Icon size={23} />
                    </div>
                    <div>
                      <h3>{skill.displayName}</h3>
                      <span className={isVerified ? "control-badge control-badge--verified" : "state-badge state-badge--preview"}>
                        {status}
                      </span>
                    </div>
                  </div>
                  <p>{homeSkillDescription(skill, locale)}</p>
                  <div className="control-tag-row">
                    {homeSkillTags(skill, locale).slice(0, 2).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <dl className="home-skill-card__meta">
                    <div>
                      <dt>{landing.runtime}</dt>
                      <dd>{skill.runtimeType ? skill.runtimeType.toUpperCase() : "REST / MCP"}</dd>
                    </div>
                    <div>
                      <dt>{landing.permissions}</dt>
                      <dd>{riskLabel(skill.permissionLevel, locale)}</dd>
                    </div>
                  </dl>
                  <PublicEventLink className="secondary-button" href={homeSkillHref(skill, locale)} eventName="skill_card_click" eventProperties={{ surface: "featured", skill: skill.slug }}>
                    {landing.inspect}
                  </PublicEventLink>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-section home-how-section" aria-labelledby="home-how-heading">
          <h2 id="home-how-heading">{landing.howTitle}</h2>
          <div className="home-how-rail">
            {landing.howSteps.map(([title, body], index) => {
              const Icon = howIcons[index];

              return (
                <article className="home-how-step" key={title}>
                  <div className="home-how-step__icon" aria-hidden="true">
                    <Icon size={22} />
                  </div>
                  <span>{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-final-cta">
          <div>
            <h2>{landing.finalTitle}</h2>
            <p>{landing.finalBody}</p>
          </div>
          <div className="hero-actions">
            <PublicEventLink className="primary-button primary-button--large" href={localizedHref("/marketplace", locale)} eventName="browse_skills_cta_click" eventProperties={{ surface: "final_cta" }}>
              {landing.primaryCta}
              <ArrowRight size={16} aria-hidden="true" />
            </PublicEventLink>
            <PublicEventLink className="secondary-button secondary-button--large" href={localizedHref("/docs", locale)} eventName="docs_cta_click" eventProperties={{ surface: "final_cta" }}>
              <FileJson size={17} aria-hidden="true" />
              {landing.readDocs}
            </PublicEventLink>
          </div>
        </section>

        <footer className="site-footer home-footer">
          <section className="home-footer__agent-panel" aria-label={locale === "zh" ? "页脚 Agent 生态接入" : "Footer agent ecosystem"}>
            <div className="home-footer__agent-intro">
              <span className="home-footer__agent-badge">{landing.footerAgentBadge}</span>
              <h2>{landing.footerAgentTitle}</h2>
              <p>{landing.footerAgentBody}</p>
            </div>
            <div className="home-footer__agent-grid">
              {landing.footerAgentEcosystem.map((agent) => (
                <article className="home-footer__agent-card" key={agent.name}>
                  <span className={`home-footer__agent-logo home-footer__agent-logo--${agent.logoKey}`} aria-hidden="true">
                    <img src={agent.logo} alt="" />
                  </span>
                  <div>
                    <strong>{agent.name}</strong>
                    <p>{agent.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <div className="home-footer__main">
            <div className="home-footer__brand">
              <div className="home-footer__brand-head">
                <span className="home-footer__brand-mark" aria-hidden="true">S</span>
                <strong>SkillHub</strong>
              </div>
              <p>{landing.footerBody}</p>
              <div className="home-footer__contact-list">
                <div className="home-footer__contact-row">
                  <span>{locale === "zh" ? "技术支持" : "Support"}</span>
                  <a href={companyLinks.supportMailto}>{companyInfo.supportEmail}</a>
                </div>
                <div className="home-footer__contact-row">
                  <span>{locale === "zh" ? "商务合作" : "Business"}</span>
                  <a href={companyLinks.businessMailto}>{companyInfo.businessEmail}</a>
                </div>
                <div className="home-footer__contact-row">
                  <span>{locale === "zh" ? "公司地址" : "Address"}</span>
                  <span>{companyInfo.address}</span>
                </div>
              </div>
              <PublicEventLink className="home-footer__status-pill" href={localizedHref("/status", locale)} eventName="footer_link_click" eventProperties={{ target: "status" }}>
                <span aria-hidden="true" />
                {landing.systemStatus} · {landing.viewStatus}
              </PublicEventLink>
            </div>
            <div className="home-footer__link-panel">
              <nav className="home-footer__nav" aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}>
                {landing.footerGroups.map((group) => (
                  <section className="home-footer__group" key={group.title}>
                    <h2>{group.title}</h2>
                    {group.links.map(([label, href], index) => (
                      <PublicEventLink
                        className={index === 0 ? "home-footer__link--featured" : undefined}
                        href={localizedHref(href, locale)}
                        eventName="footer_link_click"
                        eventProperties={{ target: href }}
                        key={`${group.title}-${label}`}
                      >
                        {label}
                      </PublicEventLink>
                    ))}
                  </section>
                ))}
              </nav>
            </div>
            <div className="home-footer__bottom">
              <span className="home-footer__copyright">© 2026 SkillHub. All rights reserved.</span>
              <span className="home-footer__signature" aria-label="Registry Runtime Governance">
                <span>Registry</span>
                <span>Runtime</span>
                <span>Governance</span>
              </span>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}

function homeSkillHref(skill: SkillSummary, locale: "en" | "zh") {
  if (routableSkillSlugs.has(skill.slug)) {
    return localizedHref(`/skills/${skill.slug}`, locale);
  }

  return localizedHref("/marketplace", locale);
}
