import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { DocsPageClient } from "@/components/docs-page-client";
import { getLocaleFromSearchParams, type Locale } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getPublicApiUrl } from "@/lib/api-url";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/docs",
    type: "article",
    en: {
      title: "SkillHub Docs - Skill API, REST, MCP, and Project Keys",
      description:
        "Use SkillHub docs to discover agent skills, inspect contracts, install verified skills into projects, create Project Keys, call REST/MCP runtime, and publish skills for review.",
    },
    zh: {
      title: "SkillHub 使用文档 - 技能 API、REST、MCP 与 Project Key",
      description:
        "通过 SkillHub 使用文档了解如何发现智能体技能、检查合约、安装已验证技能、创建 Project Key、调用 REST/MCP 运行时，并提交技能进入审核。",
    },
  });
}

const docsCopy = {
  en: {
    actions: {
      api: "Open Skill API",
      docs: "Read quickstart",
      marketplace: "Find Skills",
      publish: "Publish a Skill",
      workspace: "Enter workspace",
    },
    heroEyebrow: "SkillHub Docs · Agent Skill API",
    heroTitle: ["Read the Skill contract,", "then let agents run."],
    heroBody:
      "This page explains the production path for SkillHub: discover public Skills, inspect the Skill API contract, install a verified version into a project, create a scoped Project Key, then invoke REST or MCP through the governed runtime gateway.",
    heroProof: [
      [
        "Public first",
        "Marketplace and Skill API can be inspected before sign-in.",
      ],
      [
        "Project gated",
        "Runtime starts only after project install, version pin, and Project Key.",
      ],
      [
        "Agent ready",
        "Contracts expose schema, runtime, permissions, review state, and MCP metadata.",
      ],
    ],
    console: {
      consoleLabel: "SkillHub documentation console",
      topPath: "skillhub://docs/adopt/browser-research",
      live: "docs path",
      status: "launch preview",
      title: "browser-research · adoption path",
      body: "A Skill is useful only when an agent can read what it does, what it needs, and where runtime is allowed. The docs keep discovery, install, and invocation separated.",
      get: "GET",
      endpoint: "/v1/skills/browser-research",
      manifest: [
        "Contract",
        "skillhub.json",
        "Identity, version, schemas, permissions, runtime, support, and review state.",
      ],
      install: [
        "Install",
        "project version pin",
        "The workspace installs a verified version before any runtime call is available.",
      ],
      key: [
        "Project Key",
        "runtime:invoke",
        "Scoped key used by an agent, server workflow, or MCP client.",
      ],
      runtime: [
        "Runtime",
        "REST / MCP gateway",
        "Policy, budget, rate limit, approval, and logs stay attached to every call.",
      ],
      signalTitle: "Docs map",
      signalBody:
        "Use Marketplace for human discovery, Registry for machine-readable contracts, Workspace for runtime, and Publish for submitted versions.",
      boundaryTitle: "Runtime boundary",
      boundaryBody:
        "Public MCP metadata describes available tools. It does not grant anonymous execution. Real calls require project context and a Project Key.",
      commercialTitle: "Commercial boundary",
      commercialBody:
        "Free and Pro access can be explained publicly. Checkout, payout, tax/KYC, refund, and ledger operations remain operator-gated during Launch Preview.",
      meterManifest: "contract",
      meterInstall: "install",
      meterRuntime: "runtime",
      ok: "ready",
      gated: "gated",
    },
    map: {
      eyebrow: "Docs Map",
      title: "Start from the job, then go to the right surface.",
      body: "SkillHub has four surfaces because each one answers a different question: what exists, what is the contract, where can it run, and how does a publisher ship a verified version.",
      cards: [
        {
          action: "Browse Skills",
          body: "For operators, marketers, founders, and AI agents comparing reusable capabilities before adoption.",
          href: "/marketplace",
          items: [
            "Search by task",
            "Compare publisher and risk",
            "Open public detail",
          ],
          title: "Find Skills",
        },
        {
          action: "Inspect contracts",
          body: "For developers and agents reading schemas, permission boundaries, runtime type, and review state.",
          href: "/registry",
          items: ["Read manifest", "Check endpoint", "Confirm review status"],
          title: "Skill API",
        },
        {
          action: "Enter workspace",
          body: "For teams installing verified Skills, creating Project Keys, and running governed calls.",
          href: "/login",
          items: ["Choose project", "Pin version", "Invoke REST or MCP"],
          title: "Workspace runtime",
        },
        {
          action: "Submit package",
          body: "For authors packaging skillhub.json, submitting exact versions, and responding to review evidence.",
          href: "/publish",
          items: ["Prepare manifest", "Run preflight", "Submit version"],
          title: "Publisher flow",
        },
      ],
    },
    adoption: {
      eyebrow: "Adoption Flow",
      title: "The safe path from public discovery to agent runtime.",
      body: "The docs should make the order obvious. Do not start with a runtime token. Start by choosing the right Skill and understanding the contract.",
      steps: [
        [
          "Discover",
          "Search Marketplace or query the public Skill API by task, tag, category, runtime, or risk profile.",
        ],
        [
          "Inspect",
          "Read the manifest, input/output schema, permissions, examples, publisher, review state, and public MCP metadata.",
        ],
        [
          "Install",
          "Sign in, choose a project, install a verified Skill, and pin the version that your agent will use.",
        ],
        [
          "Invoke",
          "Create a scoped Project Key, then call REST or MCP through policy, budget, rate limit, and audit logging.",
        ],
      ],
    },
    api: {
      eyebrow: "REST / MCP Boundary",
      title:
        "Public inspection and real invocation are intentionally separate.",
      body: "Agents may read contracts without credentials. Anything that can spend budget, touch customer data, write to tools, or run production workflow belongs behind project policy.",
      groups: [
        {
          body: "Search public Skills and inspect a single public contract before adoption.",
          endpoints: [
            "GET /v1/skills/search",
            "GET /v1/skills/:slug",
            "GET /mcp",
          ],
          title: "Public discovery",
        },
        {
          body: "Create project state, install verified Skills, create scoped keys, and call the governed runtime gateway.",
          endpoints: [
            "GET /v1/developer/projects",
            "POST /v1/projects/:projectSlug/installed-skills",
            "POST /v1/projects/:projectSlug/api-keys",
            "POST /v1/runtime/invoke",
          ],
          title: "Developer workspace",
        },
        {
          body: "Save drafts, submit exact versions, and provide evidence for review before public adoption.",
          endpoints: [
            "POST /v1/skills",
            "POST /v1/publisher/skills/:slug/versions",
            "POST /v1/publisher/skills/:slug/versions/:version/submit",
          ],
          title: "Publisher workflow",
        },
        {
          body: "Review submissions, audit sensitive operations, confirm launch readiness, and keep paid-marketplace states honest.",
          endpoints: [
            "GET /v1/admin/reviews",
            "GET /v1/admin/launch-readiness",
            "GET /v1/admin/audit-logs",
          ],
          title: "Operator console",
        },
      ],
    },
    quickstart: {
      body: "These commands show the mental model: public inspection first, authenticated project install second, Project Key runtime last.",
      comment: "Runtime starts after project install:",
      endpoints: "public + gated",
      eyebrow: "Quickstart",
      flow: "create project -> install verified version -> create Project Key -> REST / MCP invoke",
      tags: ["public contract", "project install", "Project Key", "REST/MCP"],
      terminal: "quickstart.sh",
      title: "Copy the path, not just a token.",
    },
    vocabulary: {
      eyebrow: "Shared Vocabulary",
      title: "Use these words consistently across the product.",
      body: "The docs page is also the source of truth for how SkillHub explains itself to users, developers, publishers, and AI agents.",
      terms: [
        [
          "Skill",
          "A versioned AI Agent capability with manifest, schema, permissions, runtime, publisher, and review state.",
        ],
        [
          "Skill API",
          "The machine-readable registry of public Skill contracts.",
        ],
        [
          "Manifest",
          "The skillhub.json contract that explains what a Skill does, what it can access, and how it returns output.",
        ],
        [
          "Project",
          "A signed-in workspace container for installs, version pins, policy, keys, logs, and runtime tests.",
        ],
        [
          "Project Key",
          "A scoped runtime credential for an installed Skill inside one project.",
        ],
        [
          "Runtime gateway",
          "The governed REST/MCP path that enforces policy, budget, rate limits, approval, and audit logs.",
        ],
      ],
    },
    troubleshooting: {
      eyebrow: "Troubleshooting",
      title: "Most issues come from crossing the wrong boundary.",
      body: "Before debugging code, decide whether the issue belongs to public discovery, signed-in workspace, publisher review, or production deployment.",
      items: [
        [
          "401 / 403 on runtime",
          "Use a Project Key with runtime scope. A login session token is not the same as a runtime key.",
        ],
        [
          "MCP is visible but cannot run",
          "Public MCP metadata is inspection only. Invocation requires a project install and scoped Project Key.",
        ],
        [
          "Install is locked",
          "Confirm the Skill is verified and the current user has access to the target project.",
        ],
        [
          "Skill remains in review",
          "Submit an exact version and include manifest, examples, permissions, runtime evidence, support path, and commercial intent.",
        ],
        [
          "Production still shows old UI",
          "Confirm the server pulled the latest git hash, rebuilt the web app, and restarted the process behind the domain.",
        ],
      ],
    },
    guardrails: {
      eyebrow: "Operational Guardrails",
      title: "What the docs must never blur.",
      body: "SkillHub should feel powerful because boundaries are clear. Public pages can educate and prove the contract; private operations stay private.",
      items: [
        "Public pages may show manifests, schemas, permissions, publishers, review state, and public MCP metadata.",
        "Public pages must not expose Project Keys, OAuth secrets, access tokens, passwords, or private customer data.",
        "Submitted but unverified Skills are inspection-only until review evidence passes.",
        "High-risk write actions, payments, file access, sensitive data, and production workflow require explicit project policy.",
        "Paid checkout, automated payouts, tax/KYC automation, invoices, and final compliance claims stay operator-gated until enabled.",
      ],
    },
    closing: {
      body: "Use Marketplace to choose a Skill, Skill API to inspect the contract, Workspace to install and invoke, and Publish to submit new verified capabilities.",
      title: "Make every agent action start from a readable contract.",
    },
  },
  zh: {
    actions: {
      api: "打开技能 API",
      docs: "看快速开始",
      marketplace: "找技能",
      publish: "发布技能",
      workspace: "进入工作台",
    },
    heroEyebrow: "SkillHub Docs · 智能体技能 API",
    heroTitle: ["先读懂 Skill 合约，", "再安全交给 Agent 运行。"],
    heroBody:
      "这里解释 SkillHub 的生产路径：先公开发现 Skill，检查技能 API 合约，再把已验证版本安装到项目，创建有作用域的 Project Key，最后通过受治理的 REST 或 MCP 网关运行。",
    heroProof: [
      ["先公开检查", "Marketplace 和技能 API 在登录前就可以查看。"],
      ["项目内运行", "真实运行必须经过项目安装、版本固定和 Project Key。"],
      [
        "Agent 可读",
        "合约公开 schema、runtime、权限、审核状态和 MCP metadata。",
      ],
    ],
    console: {
      consoleLabel: "SkillHub 文档控制台",
      topPath: "skillhub://docs/adopt/browser-research",
      live: "docs path",
      status: "Launch Preview",
      title: "browser-research · 接入路径",
      body: "一个 Skill 真正有用，前提是 Agent 能读懂它做什么、需要什么权限、在哪里允许运行。文档要把发现、安装、调用分开说清楚。",
      get: "GET",
      endpoint: "/v1/skills/browser-research",
      manifest: [
        "Contract",
        "skillhub.json",
        "身份、版本、schema、权限、运行时、支持路径和审核状态。",
      ],
      install: [
        "Install",
        "项目版本固定",
        "工作台先安装已验证版本，之后才允许真实运行。",
      ],
      key: [
        "Project Key",
        "runtime:invoke",
        "给 Agent、服务端流程或 MCP 客户端使用的作用域 Key。",
      ],
      runtime: [
        "Runtime",
        "REST / MCP 网关",
        "策略、预算、限流、审批和日志都会绑定到每次调用。",
      ],
      signalTitle: "文档地图",
      signalBody:
        "Marketplace 负责给人找技能，Registry 负责机器可读合约，Workspace 负责运行，Publish 负责提交审核版本。",
      boundaryTitle: "运行边界",
      boundaryBody:
        "公开 MCP metadata 只描述可用工具，不代表匿名执行权限。真实调用必须有项目上下文和 Project Key。",
      commercialTitle: "商业边界",
      commercialBody:
        "免费与 Pro 可以公开解释。收银、分账、税务/KYC、退款和账本操作在 Launch Preview 阶段仍由运营控制。",
      meterManifest: "contract",
      meterInstall: "install",
      meterRuntime: "runtime",
      ok: "ready",
      gated: "gated",
    },
    map: {
      eyebrow: "文档地图",
      title: "先看你要完成的动作，再进入对应页面。",
      body: "SkillHub 分成四个使用面，因为每个页面回答的问题不同：有什么技能、合约是什么、在哪里运行、发布者如何提交已验证版本。",
      cards: [
        {
          action: "浏览技能",
          body: "给运营、市场、创业者和 AI Agent 比较可复用能力，在采用前先判断是否合适。",
          href: "/marketplace",
          items: ["按任务搜索", "比较发布者和风险", "打开公开详情"],
          title: "找技能",
        },
        {
          action: "检查合约",
          body: "给开发者和 Agent 读取 schema、权限边界、运行时类型和审核状态。",
          href: "/registry",
          items: ["读取 manifest", "检查 endpoint", "确认审核状态"],
          title: "技能 API",
        },
        {
          action: "进入工作台",
          body: "给团队安装已验证 Skill、创建 Project Key，并运行受治理调用。",
          href: "/login",
          items: ["选择项目", "固定版本", "调用 REST 或 MCP"],
          title: "工作台运行",
        },
        {
          action: "提交技能包",
          body: "给作者准备 skillhub.json、提交精确版本，并根据审核证据修正。",
          href: "/publish",
          items: ["准备 manifest", "执行预检", "提交版本"],
          title: "发布者流程",
        },
      ],
    },
    adoption: {
      eyebrow: "接入流程",
      title: "从公开发现到 Agent 运行，顺序必须清楚。",
      body: "文档页最重要的是让用户知道下一步是什么。不要一上来找 token，先选对 Skill，再读懂合约。",
      steps: [
        [
          "Discover",
          "在 Marketplace 搜索，或通过公开技能 API 按任务、标签、分类、运行时和风险画像查询。",
        ],
        [
          "Inspect",
          "读取 manifest、输入输出 schema、权限、示例、发布者、审核状态和公开 MCP metadata。",
        ],
        [
          "Install",
          "登录后选择项目，安装已验证 Skill，并固定 Agent 要使用的版本。",
        ],
        [
          "Invoke",
          "创建有作用域的 Project Key，通过策略、预算、限流和审计日志调用 REST 或 MCP。",
        ],
      ],
    },
    api: {
      eyebrow: "REST / MCP 边界",
      title: "公开检查和真实调用必须分开。",
      body: "Agent 可以无登录读取合约；凡是会消耗预算、接触客户数据、写入工具或运行生产流程的动作，都必须进入项目策略。",
      groups: [
        {
          body: "搜索公开 Skill，并在采用前检查单个公开合约。",
          endpoints: [
            "GET /v1/skills/search",
            "GET /v1/skills/:slug",
            "GET /mcp",
          ],
          title: "公开发现",
        },
        {
          body: "创建项目状态、安装已验证 Skill、创建作用域 Key，并调用受治理运行网关。",
          endpoints: [
            "GET /v1/developer/projects",
            "POST /v1/projects/:projectSlug/installed-skills",
            "POST /v1/projects/:projectSlug/api-keys",
            "POST /v1/runtime/invoke",
          ],
          title: "开发者工作台",
        },
        {
          body: "保存草稿、提交精确版本，并提供审核证据后再进入公开采用。",
          endpoints: [
            "POST /v1/skills",
            "POST /v1/publisher/skills/:slug/versions",
            "POST /v1/publisher/skills/:slug/versions/:version/submit",
          ],
          title: "发布者流程",
        },
        {
          body: "审核提交、审计敏感操作、确认上线准备，并让付费预览状态保持诚实。",
          endpoints: [
            "GET /v1/admin/reviews",
            "GET /v1/admin/launch-readiness",
            "GET /v1/admin/audit-logs",
          ],
          title: "运营后台",
        },
      ],
    },
    quickstart: {
      body: "这些命令展示的是接入思路：先公开检查，再登录项目安装，最后用 Project Key 运行。",
      comment: "真实运行从项目安装后开始：",
      endpoints: "public + gated",
      eyebrow: "快速开始",
      flow: "创建项目 -> 安装已验证版本 -> 创建 Project Key -> REST / MCP 调用",
      tags: ["公开合约", "项目安装", "Project Key", "REST/MCP"],
      terminal: "quickstart.sh",
      title: "复制的是接入路径，不只是一段 token。",
    },
    vocabulary: {
      eyebrow: "统一口径",
      title: "这些词在全站必须含义一致。",
      body: "使用文档也是 SkillHub 对用户、开发者、发布者和 AI Agent 解释自己的标准口径。",
      terms: [
        [
          "Skill",
          "带版本的 AI Agent 能力，包含 manifest、schema、权限、运行时、发布者和审核状态。",
        ],
        ["技能 API", "公开 Skill 合约的机器可读 registry。"],
        [
          "Manifest",
          "skillhub.json 合约，说明 Skill 做什么、能访问什么、如何返回结果。",
        ],
        [
          "项目",
          "登录后的工作台容器，用于安装、版本固定、策略、密钥、日志和运行测试。",
        ],
        ["Project Key", "一个项目内针对已安装 Skill 的作用域运行凭证。"],
        ["运行网关", "执行策略、预算、限流、审批和审计日志的 REST/MCP 路径。"],
      ],
    },
    troubleshooting: {
      eyebrow: "排查手册",
      title: "大多数问题都来自跨错了边界。",
      body: "排查代码前，先判断问题属于公开发现、登录工作台、发布审核，还是生产部署。",
      items: [
        [
          "运行调用 401 / 403",
          "使用带 runtime 作用域的 Project Key。登录 session token 不等于运行 key。",
        ],
        [
          "MCP 看得到但跑不起来",
          "公开 MCP metadata 只用于检查。真实调用需要项目安装和作用域 Project Key。",
        ],
        ["安装按钮被锁住", "先确认 Skill 已验证，并且当前用户有目标项目权限。"],
        [
          "技能一直在审核中",
          "提交精确版本，并补齐 manifest、示例、权限、调用记录、支持路径和商业意图。",
        ],
        [
          "线上还是旧页面",
          "确认服务器拉到了最新 git hash，重新构建 web app，并重启域名背后的进程。",
        ],
      ],
    },
    guardrails: {
      eyebrow: "运营边界",
      title: "文档不能模糊这些事。",
      body: "SkillHub 的高级感不是把东西说玄，而是边界清楚。公开页面负责教育和证明合约，私有操作必须保持私有。",
      items: [
        "公开页面可以展示 manifest、schema、权限、发布者、审核状态和公开 MCP metadata。",
        "公开页面不能暴露 Project Key、OAuth secret、access token、密码或客户私有数据。",
        "已提交但未验证的 Skill 只能检查，审核证据通过后才能采用。",
        "高风险写入、支付、文件访问、敏感数据和生产流程必须进入明确项目策略。",
        "付费收银、自动分账、税务/KYC、发票和最终合规声明，在启用前都保持运营门控。",
      ],
    },
    closing: {
      body: "用 Marketplace 选择 Skill，用技能 API 检查合约，用工作台安装和调用，用发布流程提交新的可信能力。",
      title: "让每一次 Agent 动作，都从可读合约开始。",
    },
  },
} as const;

export type DocsCopy = (typeof docsCopy)[Locale];

export default async function DocsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const apiUrl =
    getPublicApiUrl();
  const copy = docsCopy[locale];

  return (
    <AppShell active="docs" locale={locale}>
      <DocsPageClient apiUrl={apiUrl} copy={copy} locale={locale} />
    </AppShell>
  );
}
