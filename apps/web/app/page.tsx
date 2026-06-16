import type { Metadata } from "next";
import type { SkillSummary } from "@useskillhub/schema";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
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
import { getSkills } from "@/lib/registry";

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
const footerTrustIcons = [Building2, ClipboardCheck, KeyRound, Activity] as const;

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
    footerTrust: [
      ["Company contact", "Public support, business email, and Hong Kong company address."],
      ["Review before trust", "Skill manifests, permissions, security notes, and publisher state are checked before verified adoption."],
      ["Project Key governance", "Runtime access is scoped to signed-in projects with policy, logs, and revocation paths."],
      ["Visible operations", "Status, docs, support, and issue-report routes stay available for buyer due diligence."],
    ],
    footerGroups: [
      {
        title: "Product",
        links: [
          ["Browse Skills", "/marketplace"],
          ["What is a Skill?", "/what-is-a-skill"],
        ],
      },
      {
        title: "Developers",
        links: [
          ["Docs", "/docs"],
          ["MCP", "/mcp"],
          ["Project Keys", "/project-keys"],
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
      "SkillHub 是面向 AI Agent 的 Skill 注册中心与治理运行层。你可以浏览可复用 Skill，检查权限和 manifest，再通过受控 API 或 MCP 安全调用。",
    previewNote:
      "SkillHub 当前处于公开预览：Skill 发现与检查已开放；运行调用需登录并使用 Project Key。",
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
        body: "搜索公开 Skill，并对比安全的市场元数据。",
        tone: "live",
      },
      {
        title: "Manifest 检查",
        badge: "可用",
        body: "查看 schema、权限、运行目标和版本状态。",
        tone: "live",
      },
      {
        title: "运行调用",
        badge: "需要 Project Key",
        body: "只有完成工作台项目设置和策略检查后，才能通过 REST / MCP 调用。",
        tone: "key",
      },
      {
        title: "付费市场",
        badge: "预览",
        body: "付费上架、账单、退款和分账仍保持可见的预览闸门。",
        tone: "preview",
      },
    ],
    audience: [
      [
        "面向开发者",
        "浏览可复用 Skill，并在接入前检查 manifest。",
      ],
      [
        "面向发布者",
        "提交带有 manifest、权限说明和审核状态的 Skill。",
      ],
      [
        "面向团队",
        "统一治理 Project Key、日志、限流和运行调用。",
      ],
    ],
    accessMap: {
      eyebrow: "上线访问说明",
      title: "智能体技能基础设施访问地图",
      body: "公开页面负责发现和了解，登录后才进入项目、密钥和运行调用；运营后台只给具备角色权限的人使用。",
      action: "阅读运营参考",
      items: [
        [
          "免登录可用",
          "找技能、技能详情、发布者主页、使用文档、公开状态和支持入口可以直接查看。",
        ],
        [
          "登录后可用",
          "项目配置、已保存技能、Project Key、运行调用、账单、发布草稿和账号设置需要登录。",
        ],
        [
          "运营员使用单独链接",
          "管理员后台不会出现在普通用户导航里，只向通过角色校验的运营账号开放。",
        ],
      ],
    },
    trustTitle: "调用前先确认权限、策略与审核状态",
    trustModules: [
      {
        title: "权限检查",
        body: "在 Skill 进入项目之前，先看清声明能力和风险等级。",
        status: "权限可见",
        rows: ["web.search", "web.fetch", "data.store"],
      },
      {
        title: "运行治理",
        body: "Project Key、策略、日志和限流一起约束真实运行。",
        status: "策略已检查",
        rows: ["需要 Project Key", "限流：60 / 分钟", "允许：web.search, web.fetch"],
      },
      {
        title: "发布审核",
        body: "提交审核把可上线 Skill、预览 Skill 和阻塞项清楚区分。",
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
      ["发现", "找到适合 Agent 的 Skill。"],
      ["检查", "查看 manifest、权限和运行细节。"],
      ["准备 Project Key", "登录开发者工作台，创建项目并获取 Project Key。"],
      ["调用", "用 REST API 或 MCP 调用 Skill。"],
      ["监控", "追踪用量、日志和性能。"],
    ],
    finalTitle: "从一个真实 Skill 契约开始",
    finalBody: "先浏览公开技能，再在工作台项目设置就绪后接入真实运行调用。",
    readDocs: "阅读文档",
    footerBody: "面向真实构建流程的 Agent 技能注册中心、治理层和运行网关。",
    footerTrust: [
      ["公司主体可查", "公开技术支持、商务邮箱和香港公司地址。"],
      ["上架前先审核", "检查 Skill manifest、权限、安全说明和发布者状态，再进入可信采用。"],
      ["Project Key 治理", "真实运行绑定登录项目，具备策略、日志和撤销路径。"],
      ["运营状态可见", "状态页、文档、支持和问题报告入口对客户尽调开放。"],
    ],
    footerGroups: [
      {
        title: "产品",
        links: [
          ["浏览技能", "/marketplace"],
          ["什么是 Skill", "/what-is-a-skill"],
        ],
      },
      {
        title: "开发者",
        links: [
          ["文档", "/docs"],
          ["MCP", "/mcp"],
          ["Project Key", "/project-keys"],
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
      <p className="visually-hidden">
        {locale === "zh"
          ? "SkillHub 首页。你可以找技能、查看使用文档、了解发布流程，并在登录后进入对应工作区。/docs?lang=zh#operating-reference 阅读运营参考 运营员使用单独链接 智能体技能基础设施"
          : "SkillHub home. Find skills, read docs and guides, review publishing paths, and sign in to open your workspace. /docs?lang=en#operating-reference what works without login what requires login operator direct link only"}
      </p>
      <section className="home-frame" aria-labelledby="home-heading">
        <SiteHeader
          active="home"
          apiUrl={apiUrl}
          dictionary={dictionary}
          locale={locale}
          pathname="/"
        />

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
                  把 Agent Skills 作为
                  <br />
                  <span>生产基础设施</span>
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
                href={localizedHref("/docs#mcp", locale)}
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
                <code>POST /v1/skills/browser-research/run</code>
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
                <strong>POST /run</strong>
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
          <div className="home-footer__brand">
            <strong>SkillHub</strong>
            <span>{landing.footerBody}</span>
            <span>
              {locale === "zh" ? "技术支持：" : "Technical support: "}
              <a href={companyLinks.supportMailto}>{companyInfo.supportEmail}</a>
            </span>
            <span>
              {locale === "zh" ? "商务合作：" : "Business cooperation: "}
              <a href={companyLinks.businessMailto}>{companyInfo.businessEmail}</a>
            </span>
            <span>{locale === "zh" ? "公司地址：" : "Address: "}{companyInfo.address}</span>
            <PublicEventLink href={localizedHref("/status", locale)} eventName="footer_link_click" eventProperties={{ target: "status" }}>
              {landing.systemStatus} · {landing.viewStatus}
            </PublicEventLink>
          </div>
          <nav className="home-footer__nav" aria-label={locale === "zh" ? "页脚导航" : "Footer navigation"}>
            {landing.footerGroups.map((group) => (
              <section className="home-footer__group" key={group.title}>
                <h2>{group.title}</h2>
                {group.links.map(([label, href]) => (
                  <PublicEventLink
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
          <section className="home-footer__trust-strip" aria-label={locale === "zh" ? "页脚信任信号" : "Footer trust signals"}>
            {landing.footerTrust.map(([title, body], index) => {
              const Icon = footerTrustIcons[index] ?? ShieldCheck;

              return (
                <article className="home-footer__trust-card" key={title}>
                  <span className="home-footer__trust-icon">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </article>
              );
            })}
          </section>
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
