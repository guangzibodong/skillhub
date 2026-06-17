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
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectId/installed-skills", "POST /v1/projects/:projectId/api-keys", "POST /v1/runtime/invoke"],
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
          body: "搜索公开技能，并在采用前检查单个技能。",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug"],
          title: "公开发现",
        },
        {
          body: "创建项目状态、安装已验证技能、生成密钥，并运行控制台测试。",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectId/installed-skills", "POST /v1/projects/:projectId/api-keys"],
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
        "这些公开调用用于确认技能 API 结构。真实运行调用故意不做匿名开放。",
      cards: [
        ["公开 API 已可用", "可以匿名搜索技能、打开详情、检查 manifest、schema、权限和审核状态。"],
        ["MCP 使用 POST", "MCP 工具发现和资源读取通过 POST 请求进入同一个受治理网关。"],
        ["Project Key", "运行凭证：登录后在项目中创建，有作用域，真实调用必须使用。"],
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
const quickstartSnippet = `# Search public skills
curl "https://api.useskillhub.com/v1/skills/search?tag=research"

# Inspect a public skill manifest
curl "https://api.useskillhub.com/v1/skills/browser-research"

# Read public MCP metadata; this is not runtime invocation
curl "https://api.useskillhub.com/mcp"

# Sign in, create or choose a project, then install the verified skill
curl -X POST "https://api.useskillhub.com/v1/projects/$PROJECT_ID/installed-skills" \\
  -H "Authorization: Bearer $SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"slug":"browser-research","version":"1.4.2"}'

# Create a scoped Project Key for runtime
curl -X POST "https://api.useskillhub.com/v1/projects/$PROJECT_ID/api-keys" \\
  -H "Authorization: Bearer $SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"local-dev","scopes":["runtime:invoke"]}'

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

export default async function DocsPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];
  const installGuide = getInstallGuides(locale);

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

      <PublicAccessScope locale={locale} />

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
