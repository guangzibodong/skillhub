import type { NavPage } from "@/components/home/nav";
import { companyInfo, companyLinks } from "@/lib/company-info";
import { launchPublicPages, type LaunchPublicPageKey } from "@/lib/launch-public-pages";
import type { Locale } from "@/lib/locale-routing";
import type { LocalizedSeo } from "@/lib/seo";

export type PublicPageKey =
  | "about"
  | "api"
  | "changelog"
  | "contact"
  | "data-handling"
  | "mcp"
  | "pricing"
  | "publisher-review"
  | "roadmap"
  | "what-is-a-skill"
  | LaunchPublicPageKey;

export type PublicInfoPageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  quickAnswer?: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  sections: Array<{
    title: string;
    body: string;
    bullets?: Array<string | { href: string; label: string }>;
  }>;
  faq?: Array<{ question: string; answer: string }>;
  updated?: string;
};

export type PublicPageDefinition = {
  active?: NavPage;
  indexable: boolean;
  layout?: "cards" | "legal";
  path: string;
  schema: "Article" | "ContactPage" | "WebPage";
  seo: {
    en: LocalizedSeo;
    zh: LocalizedSeo;
  };
  en: PublicInfoPageCopy;
  zh: PublicInfoPageCopy;
};

export const publicPages: Record<PublicPageKey, PublicPageDefinition> = {
  "contact": {
    active: "support",
    indexable: true,
    path: "/contact",
    schema: "ContactPage",
    seo: {
      en: {
        title: "Contact SkillHub - Product, Publisher, Security, and Team Evaluation",
        description:
          "Contact the SkillHub team for product questions, publisher onboarding, security reports, support issues, or team evaluation.",
      },
      zh: {
        title: "联系 SkillHub - 产品、发布者、安全与团队评估",
        description:
          "联系 SkillHub 团队，咨询产品、发布 Skill、安全报告、支持问题或团队评估。",
      },
    },
    en: {
      eyebrow: "Contact",
      title: "Contact SkillHub",
      lead:
        "Reach the SkillHub team for product questions, publisher onboarding, security reports, support issues, or team evaluation.",
      quickAnswer:
        "SkillHub uses clear contact paths. Product and support questions go through support, while sensitive security reports should request a secure disclosure channel before sharing details.",
      primaryCta: { href: "/support", label: "Open support" },
      secondaryCta: { href: companyLinks.supportMailto, label: "Email support" },
      sections: [
        {
          title: "Technical support",
          body: "Use this channel for account, login, Project Key, API/MCP invocation, Skill publishing, and admin workspace issues.",
          bullets: [
            `Email: ${companyInfo.supportEmail}`,
            "Include account email, page URL, error screenshot, request time, and reproduction steps.",
            "Do not include Project Keys, OAuth secrets, passwords, or private customer data.",
          ],
        },
        {
          title: "Business cooperation",
          body: "Use this channel for enterprise evaluation, channel partnerships, publisher cooperation, procurement, media, or ecosystem discussions.",
          bullets: [
            `Email: ${companyInfo.businessEmail}`,
            "Include organization name, cooperation direction, contact person, and expected timeline.",
          ],
        },
        {
          title: "Publisher onboarding",
          body: "Publishers can ask about manifest requirements, review states, pricing readiness, and support expectations before submitting a Skill.",
          bullets: ["Start with the publishing guide.", "Use Publisher Review to understand verification and restricted states."],
        },
        {
          title: "Security reports",
          body: `Security issues should request a secure disclosure channel first through ${companyInfo.supportEmail}. Public support reports must not include exploitable payloads or secrets.`,
        },
        {
          title: "Company address",
          body: companyInfo.address,
        },
      ],
    },
    zh: {
      eyebrow: "联系",
      title: "联系 SkillHub",
      lead: "如需了解产品、发布 Skill、安全报告、支持问题或团队评估，请联系 SkillHub 团队。",
      quickAnswer:
        "SkillHub 使用明确的联系路径。产品与支持问题走支持入口；敏感安全报告应先请求安全披露渠道，再共享细节。",
      primaryCta: { href: "/support", label: "打开支持中心" },
      secondaryCta: { href: companyLinks.supportMailto, label: "邮件联系支持" },
      sections: [
        {
          title: "技术支持",
          body: "账号、登录、Project Key、API/MCP 调用、Skill 发布和后台使用问题，请走技术支持路径。",
          bullets: [
            `邮箱：${companyInfo.supportEmail}`,
            "建议提供账号邮箱、页面 URL、错误截图、请求时间和复现步骤。",
            "不要提交 Project Key、OAuth secret、密码或客户私有数据。",
          ],
        },
        {
          title: "商务合作",
          body: "企业评估、渠道合作、发布者合作、采购咨询、媒体或生态合作，请走商务合作路径。",
          bullets: [
            `邮箱：${companyInfo.businessEmail}`,
            "建议提供公司/组织名称、合作方向、联系人和时间要求。",
          ],
        },
        {
          title: "发布者入驻",
          body: "发布者可以在提交 Skill 前了解 manifest 要求、审核状态、商业化准备和支持责任。",
          bullets: ["先查看发布指南。", "通过发布审核页了解 verified、restricted、rejected 等状态。"],
        },
        {
          title: "安全报告",
          body: `安全问题请先通过 ${companyInfo.supportEmail} 请求安全披露渠道。公开支持报告中不要包含可利用 payload、token 或 secret。`,
        },
        {
          title: "公司地址",
          body: companyInfo.address,
        },
      ],
    },
  },
  "data-handling": {
    active: "security",
    indexable: true,
    path: "/data-handling",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub Data Handling - Logs, Manifests, Secrets, and Runtime Data",
        description:
          "Understand what SkillHub stores, what it does not store, and how Project Keys, secrets, manifests, runtime logs, and audit trails are handled.",
      },
      zh: {
        title: "SkillHub 数据处理 - 日志、manifest、密钥与运行数据",
        description:
          "了解 SkillHub 如何处理 Project Key、密钥、manifest、运行日志与审计轨迹，以及哪些数据不会被公开存储。",
      },
    },
    en: {
      eyebrow: "Trust / Data Handling",
      title: "Data Handling",
      lead:
        "SkillHub is a registry, governance layer, and runtime gateway. This page explains the operational data needed to support those jobs.",
      quickAnswer:
        "SkillHub stores manifests, review state, workspace metadata, install state, runtime logs, audit trails, and billing readiness records when needed. It should not expose OAuth secrets, Project Keys, private keys, or sensitive user data in public pages, manifests, admin lists, or support reports.",
      primaryCta: { href: "/security", label: "Review security model" },
      secondaryCta: { href: "/privacy", label: "Read privacy policy" },
      sections: [
        { title: "What SkillHub stores", body: "Account profiles, workspace membership, Skill manifests, publisher information, review decisions, install state, policy state, notification preferences, runtime logs, and audit records." },
        { title: "What SkillHub does not store publicly", body: "Public pages must not expose Project Keys, OAuth secrets, private keys, raw prompts, private customer data, or unsupported compliance claims." },
        { title: "Project Keys and secrets", body: "Project Keys are used for signed-in runtime calls and should be scoped, revocable, and hidden after first reveal. Secrets are never part of public manifests." },
        { title: "Runtime logs and audit trails", body: "Invocation logs exist to support governance, debugging, rate limits, abuse response, and future billing reconciliation." },
        { title: "Retention", body: "Operational records are retained only as needed for security, auditability, support, and marketplace readiness. Deletion requests route through support." },
      ],
    },
    zh: {
      eyebrow: "信任 / 数据处理",
      title: "数据处理",
      lead: "SkillHub 是 Skill 注册中心、治理层和运行网关。这里说明平台为了完成这些工作需要处理哪些运营数据。",
      quickAnswer:
        "SkillHub 会在需要时存储 manifest、审核状态、工作台元数据、安装状态、运行日志、审计轨迹和计费准备记录。公开页面、manifest、管理列表或支持报告中不应暴露 OAuth secret、Project Key、私钥或敏感用户数据。",
      primaryCta: { href: "/security", label: "查看安全模型" },
      secondaryCta: { href: "/privacy", label: "阅读隐私政策" },
      sections: [
        { title: "SkillHub 会存储什么", body: "账号资料、工作台成员关系、Skill manifest、发布者信息、审核决策、安装状态、策略状态、通知偏好、运行日志和审计记录。" },
        { title: "SkillHub 不会公开存储什么", body: "公开页面不能暴露 Project Key、OAuth secret、私钥、原始提示词、客户私有数据或未经确认的合规声明。" },
        { title: "Project Key 与密钥", body: "Project Key 用于登录后的运行调用，应具备作用域、可撤销，并在首次显示后隐藏。密钥不是公开 manifest 的一部分。" },
        { title: "运行日志与审计轨迹", body: "调用日志用于治理、调试、限流、滥用响应和未来账务核对。" },
        { title: "数据保留", body: "运营记录仅在安全、审计、支持和市场准备所需期间保留。删除请求通过支持入口处理。" },
      ],
    },
  },
  "publisher-review": {
    active: "publish",
    indexable: true,
    path: "/publisher-review",
    schema: "Article",
    seo: {
      en: {
        title: "Publisher Review - SkillHub Skill Verification Workflow",
        description:
          "Learn how SkillHub reviews submitted Skills: manifest validation, permission review, runtime endpoint checks, security scan, human review, and verification states.",
      },
      zh: {
        title: "发布审核 - SkillHub Skill 验证流程",
        description:
          "了解 SkillHub 如何审核发布者提交的 Skill：manifest 校验、权限检查、运行端点审核、安全扫描、人工审核和验证状态。",
      },
    },
    en: {
      eyebrow: "Publisher trust",
      title: "Publisher Review",
      lead: "Marketplace trust depends on a review path that is understandable to publishers and buyers.",
      quickAnswer:
        "Publisher Review is the workflow that moves a Skill from draft to submitted, in review, verified, restricted, or rejected. It covers manifest quality, schema validity, permissions, runtime behavior, security signals, and human operator decisions.",
      primaryCta: { href: "/publish", label: "Publish a Skill" },
      secondaryCta: { href: "/publisher#publisher-skills", label: "Open skill workspace" },
      sections: [
        { title: "Submission requirements", body: "A Skill submission needs identity, version, runtime, input/output schemas, permissions, examples, support path, changelog, and pricing intent when applicable." },
        { title: "Manifest and schema validation", body: "SkillHub checks JSON structure, required fields, semantic versioning, schema shape, examples, and runtime declarations." },
        { title: "Permission review", body: "Network, browser, filesystem, secrets, sensitive data, destructive actions, and payment-related permissions require explicit review." },
        { title: "Runtime endpoint review", body: "Runtime URLs, health checks, sample inputs, response shape, failure modes, and rate-limit behavior must match the manifest." },
        { title: "Verification states", body: "Draft, Submitted, In review, Verified, Restricted, and Rejected states are shown honestly so buyers understand adoption risk." },
        {
          title: "How publishers fix issues",
          body: "Publishers should submit a new version or revise draft metadata rather than mutating verified behavior in place.",
          bullets: [
            "Draft: finish manifest, examples, support path, and permission notes before submitting.",
            "Needs changes: update the draft or submit a new version from the publisher workspace.",
            { href: "/publisher#publisher-skills", label: "Open publisher skill workspace" },
            "Restricted: read the distribution reason, repair trust or runtime gaps, then request a placement review.",
            "Rejected: keep the decision visible, create a corrected version, or contact support when the decision looks wrong.",
          ],
        },
      ],
    },
    zh: {
      eyebrow: "发布者信任",
      title: "发布审核",
      lead: "Skill 市场的信任来自清晰的审核路径，让发布者和购买方都知道状态代表什么。",
      quickAnswer:
        "发布审核是 Skill 从草稿、已提交、审核中，到已验证、受限或已拒绝状态的流程。它覆盖 manifest 质量、schema 有效性、权限、运行行为、安全信号和人工运营决策。",
      primaryCta: { href: "/publish", label: "发布技能" },
      secondaryCta: { href: "/publisher#publisher-skills", label: "打开技能工作台" },
      sections: [
        { title: "提交要求", body: "Skill 提交需要身份、版本、运行时、输入输出 schema、权限、示例、支持路径、变更记录，以及适用时的定价意图。" },
        { title: "Manifest 与 schema 校验", body: "SkillHub 会检查 JSON 结构、必填字段、语义版本、schema 形状、示例和运行声明。" },
        { title: "权限检查", body: "网络、浏览器、文件系统、密钥、敏感数据、破坏性动作和支付相关权限需要明确审核。" },
        { title: "运行端点审核", body: "运行 URL、健康检查、样例输入、响应结构、失败模式和限流行为必须与 manifest 一致。" },
        { title: "验证状态", body: "草稿、已提交、审核中、已验证、受限和已拒绝状态都要真实展示，让购买方理解采用风险。" },
        {
          title: "发布者如何处理问题",
          body: "发布者应提交新版本或修改草稿信息，而不是直接改变已验证版本的行为。",
          bullets: [
            "草稿：先补齐 manifest、示例、支持路径和权限说明，再提交审核。",
            "需修改：回到发布者工作台修改草稿，或提交一个修复后的新版本。",
            { href: "/publisher#publisher-skills", label: "打开发布者技能工作台" },
            "受限：查看市场分发原因，修复信任或运行缺口后再申请复核。",
            "已拒绝：保留审核结论，创建修正版本；如果判断明显有误，再联系支持申诉。",
          ],
        },
      ],
    },
  },
  "what-is-a-skill": {
    active: "docs",
    indexable: true,
    path: "/what-is-a-skill",
    schema: "Article",
    seo: {
      en: {
        title: "What is an AI Agent Skill? - SkillHub Explainer",
        description:
          "A clear definition of AI Agent Skills, manifests, permissions, runtime protocols, Project Keys, and how SkillHub governs reusable agent capabilities.",
      },
      zh: {
        title: "什么是 AI Agent Skill？- SkillHub 解释",
        description:
          "了解 AI Agent Skill、manifest、权限、运行协议、Project Key，以及 SkillHub 如何治理可复用 Agent 能力。",
      },
    },
    en: {
      eyebrow: "Core concept",
      title: "What is an AI Agent Skill?",
      lead:
        "A Skill is not just a prompt, plugin, or directory entry. It is a reusable capability an Agent can inspect before calling.",
      quickAnswer:
        "An AI Agent Skill is a reusable capability that an AI Agent can inspect and call, such as web research, data analysis, code execution, or document Q&A. In SkillHub, a Skill includes a manifest, schema, permissions, runtime protocol, publisher information, and review state so teams can evaluate it before adoption.",
      primaryCta: { href: "/marketplace", label: "Browse Skills" },
      secondaryCta: { href: "/docs", label: "View Docs" },
      sections: [
        { title: "What a Skill contains", body: "A Skill contains a manifest, version, runtime entrypoint, input schema, output schema, permission declaration, publisher metadata, examples, review state, and support path." },
        { title: "Skill vs prompt", body: "A prompt is text guidance. A Skill is a callable, versioned capability with a runtime boundary and governance metadata." },
        { title: "Skill vs plugin or tool", body: "Plugins often depend on one host. SkillHub Skills are designed to be inspected and adopted across Agent runtimes through REST or MCP boundaries." },
        { title: "Skill vs MCP server", body: "An MCP server exposes tools. A SkillHub Skill records the contract, review, publisher, permissions, and adoption state that can map to REST, MCP, or future runtimes." },
        { title: "How Agents call Skills", body: "Agents discover a Skill, inspect manifest and permissions, adopt it into a signed-in project, create a Project Key, and invoke through controlled REST or MCP." },
      ],
      faq: [
        { question: "Is a Skill always paid?", answer: "No. Public discovery and inspection can be free. Paid access is shown only when pricing and workspace eligibility are configured." },
        { question: "Can anonymous users invoke Skills?", answer: "No production runtime invocation should require anonymous users. Runtime paths require a signed-in project and Project Key." },
      ],
    },
    zh: {
      eyebrow: "核心概念",
      title: "什么是 AI Agent Skill？",
      lead: "Skill 不是简单提示词、插件或目录条目。它是 Agent 在调用前可以检查的可复用能力。",
      quickAnswer:
        "AI Agent Skill 是可被 AI Agent 检查和调用的可复用能力，例如网页研究、数据分析、代码执行或文档问答。在 SkillHub 中，Skill 包含 manifest、schema、权限、运行协议、发布者信息和审核状态，方便团队在接入前评估。",
      primaryCta: { href: "/marketplace", label: "浏览 Skills" },
      secondaryCta: { href: "/docs", label: "查看文档" },
      sections: [
        { title: "Skill 包含什么", body: "Skill 包含 manifest、版本、运行入口、输入 schema、输出 schema、权限声明、发布者元数据、示例、审核状态和支持路径。" },
        { title: "Skill 与 prompt 的区别", body: "Prompt 是文本指导。Skill 是可调用、带版本、带运行边界和治理元数据的能力。" },
        { title: "Skill 与 plugin/tool 的区别", body: "插件通常依赖单一宿主。SkillHub Skill 设计为可被不同 Agent 运行时通过 REST 或 MCP 边界检查和采用。" },
        { title: "Skill 与 MCP server 的区别", body: "MCP server 暴露工具。SkillHub Skill 记录合约、审核、发布者、权限和采用状态，可映射到 REST、MCP 或未来运行时。" },
        { title: "Agent 如何调用 Skill", body: "Agent 先发现 Skill，检查 manifest 和权限，将其加入登录后的项目，创建 Project Key，再通过受控 REST 或 MCP 调用。" },
      ],
      faq: [
        { question: "Skill 一定收费吗？", answer: "不是。公开发现和检查可以免费。付费访问只会在价格和工作区资格配置完成后展示。" },
        { question: "匿名用户能调用 Skill 吗？", answer: "生产运行调用不应面向匿名用户。运行路径需要登录后的项目和 Project Key。" },
      ],
    },
  },
  "pricing": {
    active: "marketplace",
    indexable: true,
    path: "/pricing",
    schema: "WebPage",
    seo: {
      en: {
        title: "SkillHub Early Access Pricing - Free Discovery, Developer Access, and Team Evaluation",
        description:
          "Compare SkillHub early access plans for public discovery, developer runtime access, team governance, and publisher onboarding.",
      },
      zh: {
        title: "SkillHub Early Access 价格 - 免费发现、开发者访问与团队评估",
        description:
          "比较 SkillHub 早期访问方案：公开发现、开发者运行访问、团队治理和发布者入驻。",
      },
    },
    en: {
      eyebrow: "Early Access Pricing",
      title: "Pricing for governed AI Agent Skills",
      lead: "Start with free public discovery, then request runtime access, team governance, or publisher onboarding when your workflow is ready.",
      quickAnswer:
        "Public browsing and manifest inspection are free. Runtime access requires a workspace and scoped Project Key. Team governance and publisher onboarding are available through early access review.",
      primaryCta: { href: "/marketplace", label: "Browse Skills" },
      secondaryCta: { href: "/contact", label: "Contact for team evaluation" },
      sections: [
        { title: "Free Discovery", body: "Free. Browse public skills, inspect manifests, compare publishers, and read docs before creating a workspace." },
        { title: "Developer Access", body: "Invite only. Create projects, generate scoped Project Keys, test REST / MCP invocation, and review runtime logs." },
        { title: "Team Evaluation", body: "Contact us. Add approval controls, workspace governance, audit logs, security review support, and higher limits." },
        { title: "Publisher Preview", body: "Invite only. Create a publisher profile, submit skills, track review status, and prepare pricing metadata." },
        { title: "Billing note", body: "Commercial billing is enabled only when a provider flow is explicitly configured for an approved workspace." },
      ],
    },
    zh: {
      eyebrow: "Early Access 价格",
      title: "面向受治理 AI Agent Skills 的价格方案",
      lead: "先免费浏览公开技能；当工作流准备好后，再申请运行访问、团队治理或发布者入驻。",
      quickAnswer:
        "公开浏览和 manifest 检查免费。运行访问需要工作区和有范围的 Project Key。团队治理和发布者入驻通过 Early Access 审核开放。",
      primaryCta: { href: "/marketplace", label: "浏览 Skills" },
      secondaryCta: { href: "/contact", label: "团队评估咨询" },
      sections: [
        { title: "Free Discovery", body: "免费。浏览公开技能、检查 manifest、比较发布者，并在创建工作区前阅读文档。" },
        { title: "Developer Access", body: "邀请制。创建项目、生成有范围的 Project Key、测试 REST / MCP 调用并查看运行日志。" },
        { title: "Team Evaluation", body: "联系我们。获得审批控制、工作区治理、审计日志、安全评审支持和更高额度。" },
        { title: "Publisher Preview", body: "邀请制。创建发布者档案、提交技能、跟踪审核状态并准备定价元数据。" },
        { title: "计费说明", body: "只有当获批工作区明确配置了支付渠道后，生产收银和提现才会启用。" },
      ],
    },
  },
  "api": {
    active: "docs",
    indexable: true,
    path: "/api",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub API - Registry, Manifest, Project Key, and Runtime Calls",
        description:
          "Entry point for SkillHub API concepts: authentication, public registry endpoints, manifest inspection, Project Key runtime calls, errors, rate limits, and logs.",
      },
      zh: {
        title: "SkillHub API - 注册中心、Manifest、Project Key 与运行调用",
        description:
          "SkillHub API 入口：认证、公开 Skill 注册中心端点、manifest 检查、Project Key 运行调用、错误、限流和日志。",
      },
    },
    en: {
      eyebrow: "Developers",
      title: "SkillHub API",
      lead: "The API is the programmatic path from public Skill discovery to signed-in runtime invocation.",
      quickAnswer:
        "SkillHub API exposes public registry and manifest inspection endpoints, while runtime invocation requires project authentication through Project Keys. Governance checks, logs, policies, rate limits, and billing readiness state attach to runtime activity.",
      primaryCta: { href: "/docs", label: "Read full docs" },
      secondaryCta: { href: "/mcp", label: "Compare MCP" },
      sections: [
        { title: "Authentication", body: "Public registry endpoints can be inspected without a Project Key. Runtime and workspace operations require signed-in context and scoped credentials." },
        { title: "Public registry endpoints", body: "Use registry/search endpoints to list public Skills, filter by task, runtime, verification state, and permission profile." },
        { title: "Manifest inspection", body: "Skill detail endpoints expose manifest, schema, permissions, version, publisher, and review state before adoption." },
        { title: "Project Key runtime endpoints", body: "Runtime invocation should authenticate with a Project Key created inside a signed-in project." },
        { title: "Errors and rate limits", body: "API clients should handle validation errors, unauthorized calls, policy blocks, rate limits, missing Project Keys, and workspace eligibility checks." },
        { title: "Example request", body: "POST /v1/runtime/invoke with Authorization: Bearer PROJECT_KEY and a Skill slug plus typed input payload." },
      ],
    },
    zh: {
      eyebrow: "开发者",
      title: "SkillHub API",
      lead: "API 是从公开 Skill 发现到登录后运行调用的程序化路径。",
      quickAnswer:
        "SkillHub API 暴露公开注册中心和 manifest 检查端点；运行调用需要通过 Project Key 完成项目认证。治理检查、日志、策略、限流和计费准备状态会绑定到运行活动。",
      primaryCta: { href: "/docs", label: "阅读完整文档" },
      secondaryCta: { href: "/mcp", label: "对比 MCP" },
      sections: [
        { title: "认证", body: "公开注册中心端点可以不使用 Project Key 检查。运行和工作台操作需要登录上下文和有作用域凭据。" },
        { title: "公开 Skill 注册中心端点", body: "使用注册/搜索端点列出公开 Skills，并按任务、运行时、验证状态和权限画像筛选。" },
        { title: "Manifest 检查", body: "Skill 详情端点在采用前展示 manifest、schema、权限、版本、发布者和审核状态。" },
        { title: "Project Key 运行端点", body: "运行调用应使用登录后项目中创建的 Project Key 认证。" },
        { title: "错误与限流", body: "API 客户端应处理校验错误、未授权调用、策略阻断、限流、缺少 Project Key 和工作区资格检查。" },
        { title: "请求示例", body: "POST /v1/runtime/invoke，使用 Authorization: Bearer PROJECT_KEY，并传入 Skill slug 与类型化输入。" },
      ],
    },
  },
  "mcp": {
    active: "docs",
    indexable: true,
    path: "/mcp",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub MCP - Governed AI Agent Skills over MCP",
        description:
          "Learn what SkillHub exposes over MCP: metadata discovery, runtime invocation boundaries, permission checks, example configuration, and REST vs MCP tradeoffs.",
      },
      zh: {
        title: "SkillHub MCP - 通过 MCP 暴露受治理的 AI Agent Skills",
        description:
          "了解 SkillHub 通过 MCP 暴露什么：元数据发现、运行调用边界、权限检查、配置示例，以及 REST 与 MCP 的区别。",
      },
    },
    en: {
      eyebrow: "Agent integrations",
      title: "SkillHub MCP",
      lead: "MCP gives Agent clients a tool discovery and invocation shape; SkillHub adds registry, review, Project Key, and governance context.",
      quickAnswer:
        "SkillHub MCP can expose project-approved Skills as MCP tools while preserving manifest metadata, permission checks, Project Key boundaries, runtime logs, and workspace limits. REST remains better for direct server-to-server invocation; MCP is better for Agent workbenches and tool discovery.",
      primaryCta: { href: "/docs", label: "Read MCP docs" },
      secondaryCta: { href: "/api", label: "View REST API" },
      sections: [
        { title: "What SkillHub exposes over MCP", body: "Approved Skills can appear as MCP tools with names, descriptions, schemas, permissions, and runtime status." },
        { title: "Metadata discovery", body: "Agents can inspect tool metadata before selecting a Skill, reducing blind prompt-only execution." },
        { title: "Runtime invocation boundary", body: "MCP invocation still resolves through project policy, approval state, rate limits, and runtime governance." },
        { title: "Permission and policy checks", body: "High-risk permissions, billing readiness gates, and restricted states must remain visible before invocation." },
        { title: "REST vs MCP", body: "REST is direct and simple for backends. MCP is stronger when an Agent client needs dynamic tool discovery and structured tool calls." },
      ],
    },
    zh: {
      eyebrow: "Agent 集成",
      title: "SkillHub MCP",
      lead: "MCP 给 Agent 客户端提供工具发现和调用形态；SkillHub 增加注册中心、审核、Project Key 和治理上下文。",
      quickAnswer:
        "SkillHub MCP 可以把项目已批准的 Skills 暴露为 MCP tools，同时保留 manifest 元数据、权限检查、Project Key 边界、运行日志和工作区限制。REST 更适合服务端直接调用；MCP 更适合 Agent 工作台和工具发现。",
      primaryCta: { href: "/docs", label: "阅读 MCP 文档" },
      secondaryCta: { href: "/api", label: "查看 REST API" },
      sections: [
        { title: "SkillHub 通过 MCP 暴露什么", body: "已批准的 Skills 可以作为 MCP tools 展示，包含名称、描述、schema、权限和运行状态。" },
        { title: "元数据发现", body: "Agent 可以在选择 Skill 前检查工具元数据，减少盲目的 prompt-only 执行。" },
        { title: "运行调用边界", body: "MCP 调用仍然通过项目策略、批准状态、限流和运行治理解析。" },
        { title: "权限与策略检查", body: "高风险权限、计费准备门禁和受限状态在调用前必须可见。" },
        { title: "REST 与 MCP 的区别", body: "REST 对后端直接调用更简单。MCP 更适合 Agent 客户端需要动态工具发现和结构化工具调用的场景。" },
      ],
    },
  },
  "changelog": {
    active: "docs",
    indexable: true,
    path: "/changelog",
    schema: "WebPage",
    seo: {
      en: {
        title: "SkillHub Changelog - Product Updates",
        description:
          "Track SkillHub updates across public pages, registry contracts, API/MCP documentation, security posture, and launch readiness.",
      },
      zh: {
        title: "SkillHub 更新日志 - 产品更新",
        description:
          "跟踪 SkillHub 页面、注册中心合约、API/MCP 文档、安全状态和上线准备进展。",
      },
    },
    en: {
      eyebrow: "Product updates",
      title: "Changelog",
      lead: "Product changes are documented without inventing old releases or fake customer traction.",
      quickAnswer:
        "The current changelog starts with public launch readiness work: clearer information architecture, SEO/GEO pages, precise capability labeling, admin operations polish, and route/indexing cleanup.",
      primaryCta: { href: "/roadmap", label: "View roadmap" },
      secondaryCta: { href: "/status", label: "Check status" },
      sections: [
        { title: "Current launch readiness update", body: "Added public trust, contact, pricing, API, MCP, Skill explainer, roadmap, and data-handling surfaces for production evaluation." },
        { title: "Registry and marketplace clarity", body: "Public pages distinguish discovery, manifest inspection, project-gated runtime, and commercial readiness state." },
        { title: "Security and operations", body: "Admin operations, privacy, data handling, review, and support paths are documented as product capabilities." },
      ],
    },
    zh: {
      eyebrow: "产品更新",
      title: "更新日志",
      lead: "产品变化要真实记录，不编造历史版本或客户增长。",
      quickAnswer:
        "当前更新日志从公开上线准备开始：更清晰的信息架构、SEO/GEO 页面、准确的能力标识、管理员运营后台优化，以及路由/索引清理。",
      primaryCta: { href: "/roadmap", label: "查看路线图" },
      secondaryCta: { href: "/status", label: "查看状态" },
      sections: [
        { title: "当前上线准备更新", body: "新增公开信任、联系、价格、API、MCP、Skill 解释、路线图和数据处理页面，方便生产评估。" },
        { title: "注册中心与市场清晰度", body: "公开页面区分发现、manifest 检查、项目门禁运行和商业化准备状态。" },
        { title: "安全与运营", body: "管理员运营、隐私、数据处理、发布审核和支持路径以产品能力方式记录。" },
      ],
    },
  },
  "about": {
    active: "support",
    indexable: true,
    path: "/about",
    schema: "WebPage",
    seo: {
      en: {
        title: "About SkillHub - Registry and Runtime Governance for AI Agent Skills",
        description:
          "Learn what SkillHub is, why it exists, who it serves, and what is available now.",
      },
      zh: {
        title: "关于 SkillHub - AI Agent Skill 注册中心与运行治理层",
        description:
          "了解 SkillHub 是什么、为什么存在、服务谁，以及当前已经开放哪些能力。",
      },
    },
    en: {
      eyebrow: "About",
      title: "About SkillHub",
      lead:
        "SkillHub exists to make reusable AI Agent Skills inspectable, governable, and safer to adopt across teams and runtimes.",
      quickAnswer:
        "SkillHub is a registry, governance layer, and runtime gateway for reusable AI Agent Skills. It helps developers and teams discover Skills, inspect manifests and permissions, evaluate publisher trust, and run approved Skills through controlled REST or MCP interfaces with Project Keys and audit logs.",
      primaryCta: { href: "/marketplace", label: "Browse Skills" },
      secondaryCta: { href: "/contact", label: "Contact the team" },
      sections: [
        { title: "What SkillHub is", body: "A public Skill registry, trust review layer, and runtime governance surface for reusable Agent capabilities." },
        { title: "Why it exists", body: "Agent teams need more than prompts and tool lists. They need inspectable contracts, permission boundaries, version pins, review state, logs, and operational controls." },
        { title: "Who it serves", body: "Developers, Agent builders, publishers, operators, and teams evaluating governed AI capability adoption." },
        { title: "Current availability", body: "Discovery, inspection, docs, review paths, and workspace gates are visible. Commercial provider flows are enabled only for approved configurations." },
      ],
    },
    zh: {
      eyebrow: "关于",
      title: "关于 SkillHub",
      lead: "SkillHub 的目标是让可复用 AI Agent Skills 更可检查、更可治理、更适合团队采用。",
      quickAnswer:
        "SkillHub 是面向可复用 AI Agent Skills 的注册中心、治理层与运行网关。它帮助开发者和团队发现 Skill，检查 manifest 与权限，评估发布者可信度，并通过 Project Key、REST 或 MCP 安全调用已批准的 Skill，同时保留日志和治理控制。",
      primaryCta: { href: "/marketplace", label: "浏览 Skills" },
      secondaryCta: { href: "/contact", label: "联系团队" },
      sections: [
        { title: "SkillHub 是什么", body: "一个公开 Skill 注册中心、信任审核层和运行治理界面，用于可复用 Agent 能力。" },
        { title: "为什么需要它", body: "Agent 团队需要的不只是提示词和工具列表，还需要可检查合约、权限边界、版本固定、审核状态、日志和运营控制。" },
        { title: "服务谁", body: "开发者、Agent 构建者、发布者、运营人员，以及评估受治理 AI 能力采用的团队。" },
        { title: "当前可用状态", body: "发现、检查、文档、审核路径和工作台门禁已可见。商业化渠道流程只会在获批配置中启用。" },
      ],
    },
  },
  "roadmap": {
    active: "docs",
    indexable: true,
    path: "/roadmap",
    schema: "WebPage",
    seo: {
      en: {
        title: "SkillHub Roadmap - Available Now, Early Access, and Planned",
        description:
          "See what SkillHub offers today, what is available through early access, and what is planned next.",
      },
      zh: {
        title: "SkillHub 路线图 - 已开放、Early Access 与计划中",
        description:
          "查看 SkillHub 当前已开放能力、Early Access 能力、下一步计划，以及尚未开放的能力。",
      },
    },
    en: {
      eyebrow: "Roadmap",
      title: "Roadmap",
      lead: "This roadmap clarifies maturity without promising dates that have not been confirmed.",
      quickAnswer:
        "Available now: public discovery, manifest inspection, docs, review surfaces, login/workspace paths, and admin operation models. Early access: runtime governance, Project Key testing, commercial readiness, and marketplace trust loops. Planned next: provider automation, analytics, and public package release paths.",
      primaryCta: { href: "/status", label: "Check status" },
      secondaryCta: { href: "/contact", label: "Discuss evaluation" },
      sections: [
        { title: "Available now", body: "Public site, marketplace browsing, registry inspection, Skill details, docs, security, data handling, support, and role-aware workspaces." },
        { title: "Early access", body: "Runtime invocation governance, Project Keys, commercial readiness modeling, review queues, admin operations, and marketplace trust workflows." },
        { title: "Planned next", body: "Provider automation, stronger analytics, richer publisher trust profiles, and public package release paths." },
        { title: "Later", body: "Tax/KYC automation, advanced compliance reports, public SDK/CLI production releases, and deeper enterprise policy controls." },
      ],
    },
    zh: {
      eyebrow: "路线图",
      title: "路线图",
      lead: "这份路线图说明成熟度，不承诺尚未确认的具体日期。",
      quickAnswer:
        "当前已开放：公开发现、manifest 检查、文档、审核界面、登录/工作台路径和管理员运营模型。Early access：运行治理、Project Key 测试、商业化准备和市场信任闭环。下一步：服务商自动化、分析能力和公开 package release 路径。",
      primaryCta: { href: "/status", label: "查看状态" },
      secondaryCta: { href: "/contact", label: "讨论评估" },
      sections: [
        { title: "已开放", body: "公开站点、市场浏览、注册中心检查、Skill 详情、文档、安全、数据处理、支持和角色感知工作台。" },
        { title: "Early access", body: "运行调用治理、Project Key、商业化准备建模、审核队列、管理员运营和市场信任工作流。" },
        { title: "下一步计划", body: "服务商自动化、更强 analytics、更丰富发布者信任资料，以及公开 package release 路径。" },
        { title: "Later", body: "税务/KYC 自动化、高级合规报告、公开 SDK/CLI 生产 release 和更深入的企业策略控制。" },
      ],
    },
  },
  ...launchPublicPages,
};

export const indexablePublicPaths = [
  "/",
  "/marketplace",
  "/registry",
  "/agents",
  "/docs",
  "/publish",
  "/publisher-review",
  "/publishers",
  "/security",
  "/data-handling",
  "/status",
  "/support",
  "/contact",
  "/terms",
  "/privacy",
  "/pricing",
  "/what-is-a-skill",
  "/project-keys",
  "/quickstart",
  "/examples",
  "/webhooks",
  "/api",
  "/mcp",
  "/changelog",
  "/about",
  "/roadmap",
  "/marketplace-terms",
  "/publisher-agreement",
  "/refund-policy",
  "/acceptable-use",
  "/security-disclosure",
  "/cookie-policy",
  "/subprocessors",
] as const;

export const privateNoIndexPaths = [
  "/account",
  "/admin",
  "/admin-login",
  "/dashboard",
  "/developer",
  "/login",
  "/publisher",
  "/report",
  "/role-landing",
] as const;

export function getPublicPage(key: PublicPageKey, locale: Locale) {
  const page = publicPages[key];
  return {
    ...page,
    copy: page[locale],
  };
}
