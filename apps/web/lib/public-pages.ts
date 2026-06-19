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
        title: "Contact SkillHub - Pro Onboarding, Custom Skills, Publisher, and Support",
        description:
          "Contact SkillHub for Pro onboarding, custom Skill requests, publisher onboarding, technical support, security reports, or business cooperation.",
      },
      zh: {
        title: "联系 SkillHub - Pro 开通、定制技能、作者入驻与支持",
        description:
          "联系 SkillHub，处理 Pro 开通、定制 Skill 需求、发布者入驻、技术支持、安全报告和商务合作。",
      },
    },
    en: {
      eyebrow: "Contact",
      title: "Choose the right SkillHub contact path",
      lead:
        "Tell us what you want to do first: open Pro, request a custom Skill, publish as an author, fix a technical issue, report a security concern, or discuss cooperation.",
      quickAnswer:
        `For Pro onboarding, custom Skills, and business cooperation, email ${companyInfo.businessEmail}. For account, login, Project Key, API/MCP, or publishing problems, email ${companyInfo.supportEmail}. Do not send secrets, tokens, OAuth credentials, or private customer data in the first message.`,
      primaryCta: { href: companyLinks.businessMailto, label: "Email business team" },
      secondaryCta: { href: companyLinks.supportMailto, label: "Email support" },
      sections: [
        {
          title: "Pro onboarding and team evaluation",
          body: "Use this path when your team wants to evaluate Pro, choose a billing cycle, or start with one of the promoted workflow packages.",
          bullets: [
            `Email: ${companyInfo.businessEmail}`,
            "Include company name, team size, target workflow, preferred billing cycle, and target launch date.",
            { href: "/pricing", label: "Compare monthly, quarterly, and annual plans" },
          ],
        },
        {
          title: "Request a custom Skill",
          body: "Use this path when the marketplace does not yet cover the workflow you need, or when you want a private internal Skill specification.",
          bullets: [
            `Email: ${companyInfo.businessEmail}`,
            "Include the job to be done, input files or systems, expected output, risk level, and whether the Skill should be public or private.",
            "Share examples only after sensitive fields have been removed.",
          ],
        },
        {
          title: "Publisher onboarding",
          body: "Use this path when a third-party author wants to publish, maintain, or commercialize Skills inside the SkillHub catalog.",
          bullets: [
            `Email: ${companyInfo.supportEmail}`,
            { href: "/publish", label: "Read the publishing guide" },
            { href: "/publisher-review", label: "Understand review states and verification" },
          ],
        },
        {
          title: "Technical support",
          body: "Use this channel for account, login, Project Key, API/MCP invocation, Skill publishing, and workspace issues.",
          bullets: [
            `Email: ${companyInfo.supportEmail}`,
            "Include account email, page URL, error screenshot, request time, and reproduction steps.",
            "Do not include Project Keys, OAuth secrets, passwords, or private customer data.",
          ],
        },
        {
          title: "Security reports",
          body: `Security issues should request a secure disclosure channel first through ${companyInfo.supportEmail}. Public support reports must not include exploitable payloads or secrets.`,
        },
        {
          title: "Business cooperation",
          body: "Use this channel for enterprise evaluation, channel partnerships, procurement, media, ecosystem partnerships, or agency cooperation.",
          bullets: [
            `Email: ${companyInfo.businessEmail}`,
            "Include organization name, cooperation direction, contact person, and expected timeline.",
          ],
        },
        {
          title: "Company address",
          body: companyInfo.address,
        },
      ],
      faq: [
        {
          question: "Which email should I use?",
          answer: `Use ${companyInfo.businessEmail} for Pro, custom Skills, partnerships, procurement, and agency cooperation. Use ${companyInfo.supportEmail} for login, account, Project Key, API/MCP, publisher, and technical issues.`,
        },
        {
          question: "What should I include in the first message?",
          answer: "Include your goal, organization name, account email when relevant, page URL, screenshots, reproduction steps, desired timeline, and the first workflow package you want to evaluate.",
        },
        {
          question: "Can I paste tokens or secrets?",
          answer: "No. Do not send Project Keys, OAuth secrets, passwords, private keys, exploitable payloads, or customer private data in an initial email.",
        },
      ],
    },
    zh: {
      eyebrow: "联系",
      title: "选择正确的 SkillHub 联系路径",
      lead: "先说明你要完成什么：开通 Pro、定制 Skill、作为作者发布、修复技术问题、报告安全问题，还是讨论商务合作。",
      quickAnswer:
        `Pro 开通、定制 Skill 和商务合作请发 ${companyInfo.businessEmail}。账号、登录、Project Key、API/MCP、发布问题请发 ${companyInfo.supportEmail}。第一封邮件不要发送 secret、token、OAuth 凭据或客户隐私数据。`,
      primaryCta: { href: companyLinks.businessMailto, label: "联系商务团队" },
      secondaryCta: { href: companyLinks.supportMailto, label: "邮件联系支持" },
      sections: [
        {
          title: "Pro 开通与团队评估",
          body: "团队想评估 Pro、选择月付/季付/年付，或先从某一组主推技能包开始，请走这条路径。",
          bullets: [
            `邮箱：${companyInfo.businessEmail}`,
            "建议提供公司名称、团队规模、目标工作流、希望的付款周期和上线时间。",
            { href: "/pricing", label: "查看月付、季付和年付价格" },
          ],
        },
        {
          title: "定制 Skill 需求",
          body: "如果市场里暂时没有覆盖你的流程，或者你需要内部私有 Skill 规范，请走这条路径。",
          bullets: [
            `邮箱：${companyInfo.businessEmail}`,
            "建议说明要完成的任务、输入文件或系统、期望输出、风险等级，以及 Skill 是公开还是私有。",
            "示例数据请先移除敏感字段后再发送。",
          ],
        },
        {
          title: "发布者入驻",
          body: "第三方作者想把 Skill 发布、维护或商业化到 SkillHub 目录里，请走这条路径。",
          bullets: [
            `邮箱：${companyInfo.supportEmail}`,
            { href: "/publish", label: "查看发布指南" },
            { href: "/publisher-review", label: "了解审核状态与验证规则" },
          ],
        },
        {
          title: "技术支持",
          body: "账号、登录、Project Key、API/MCP 调用、Skill 发布和工作台使用问题，请走技术支持路径。",
          bullets: [
            `邮箱：${companyInfo.supportEmail}`,
            "建议提供账号邮箱、页面 URL、错误截图、请求时间和复现步骤。",
            "不要提交 Project Key、OAuth secret、密码或客户私有数据。",
          ],
        },
        {
          title: "安全报告",
          body: `安全问题请先通过 ${companyInfo.supportEmail} 请求安全披露渠道。公开支持报告中不要包含可利用 payload、token 或 secret。`,
        },
        {
          title: "商务合作",
          body: "企业评估、渠道合作、采购咨询、媒体、生态伙伴或服务商合作，请走商务合作路径。",
          bullets: [
            `邮箱：${companyInfo.businessEmail}`,
            "建议提供公司/组织名称、合作方向、联系人和时间要求。",
          ],
        },
        {
          title: "公司地址",
          body: companyInfo.address,
        },
      ],
      faq: [
        {
          question: "应该发哪个邮箱？",
          answer: `Pro、定制 Skill、渠道合作、采购和服务商合作发 ${companyInfo.businessEmail}。登录、账号、Project Key、API/MCP、发布和技术问题发 ${companyInfo.supportEmail}。`,
        },
        {
          question: "第一封邮件要写什么？",
          answer: "写清楚目标、公司/组织名称、相关账号邮箱、页面 URL、截图、复现步骤、希望上线时间，以及你想先评估哪一组技能包。",
        },
        {
          question: "能不能直接发 token 或 secret？",
          answer: "不能。第一封邮件不要发送 Project Key、OAuth secret、密码、私钥、可利用 payload 或客户隐私数据。",
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
          "Understand what SkillHub stores, what it does not store, and how Project Keys, secrets, manifests, runtime logs, and audit trails are handled during Launch Preview.",
      },
      zh: {
        title: "SkillHub 数据处理 - 日志、manifest、密钥与运行数据",
        description:
          "了解 SkillHub 在公开预览阶段如何处理 Project Key、密钥、manifest、运行日志与审计轨迹，以及哪些数据不会被存储。",
      },
    },
    en: {
      eyebrow: "Trust / Data Handling",
      title: "Data Handling",
      lead:
        "SkillHub is a registry, governance layer, and runtime gateway. This page explains the operational data needed to support those jobs.",
      quickAnswer:
        "SkillHub stores manifests, review state, workspace metadata, install state, runtime logs, audit trails, and billing-preview records when needed. It should not expose OAuth secrets, Project Keys, private keys, or sensitive user data in public pages, manifests, admin lists, or support reports.",
      primaryCta: { href: "/security", label: "Review security model" },
      secondaryCta: { href: "/privacy", label: "Read privacy policy" },
      sections: [
        { title: "What SkillHub stores", body: "Account profiles, workspace membership, Skill manifests, publisher information, review decisions, install state, policy state, notification preferences, runtime logs, and audit records." },
        { title: "What SkillHub does not store publicly", body: "Public pages must not expose Project Keys, OAuth secrets, private keys, raw prompts, private customer data, or unsupported compliance claims." },
        { title: "Project Keys and secrets", body: "Project Keys are used for signed-in runtime calls and should be scoped, revocable, and hidden after first reveal. Secrets are never part of public manifests." },
        { title: "Runtime logs and audit trails", body: "Invocation logs exist to support governance, debugging, rate limits, abuse response, and future billing reconciliation." },
        { title: "Launch Preview retention", body: "Preview records are retained only as needed for security, auditability, support, and marketplace readiness. Deletion requests route through support." },
      ],
    },
    zh: {
      eyebrow: "信任 / 数据处理",
      title: "数据处理",
      lead: "SkillHub 是 Skill 注册中心、治理层和运行网关。这里说明平台为了完成这些工作需要处理哪些运营数据。",
      quickAnswer:
        "SkillHub 会在需要时存储 manifest、审核状态、工作台元数据、安装状态、运行日志、审计轨迹和付费预览记录。公开页面、manifest、管理列表或支持报告中不应暴露 OAuth secret、Project Key、私钥或敏感用户数据。",
      primaryCta: { href: "/security", label: "查看安全模型" },
      secondaryCta: { href: "/privacy", label: "阅读隐私政策" },
      sections: [
        { title: "SkillHub 会存储什么", body: "账号资料、工作台成员关系、Skill manifest、发布者信息、审核决策、安装状态、策略状态、通知偏好、运行日志和审计记录。" },
        { title: "SkillHub 不会公开存储什么", body: "公开页面不能暴露 Project Key、OAuth secret、私钥、原始提示词、客户私有数据或未经确认的合规声明。" },
        { title: "Project Key 与密钥", body: "Project Key 用于登录后的运行调用，应具备作用域、可撤销，并在首次显示后隐藏。密钥不是公开 manifest 的一部分。" },
        { title: "运行日志与审计轨迹", body: "调用日志用于治理、调试、限流、滥用响应和未来账务核对。" },
        { title: "公开预览阶段的数据保留", body: "预览阶段记录仅在安全、审计、支持和市场准备所需期间保留。删除请求通过支持入口处理。" },
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
      lead: "Publisher Review is an operating queue, not a badge factory. Each state tells publishers what is blocked, who acts next, and whether buyers can safely adopt the Skill.",
      quickAnswer:
        "Publisher Review moves a Skill through draft, submitted, in review, needs changes, verified, restricted, rejected, or paid-preview states. Operators check manifest quality, schemas, permissions, runtime behavior, support paths, security signals, and pricing intent before a listing can be treated as production-ready.",
      primaryCta: { href: "/publish", label: "Publish a Skill" },
      secondaryCta: { href: "/publisher#publisher-skills", label: "Open skill workspace" },
      sections: [
        { title: "Submission gate", body: "A submission must include publisher identity, version, runtime, input/output schemas, permission notes, examples, support path, changelog, and pricing intent when the Skill is paid-preview." },
        { title: "Operator checks", body: "SkillHub reviews JSON structure, required manifest fields, semantic versioning, schema shape, permission scope, runtime declarations, sample responses, support ownership, and marketplace placement." },
        { title: "Runtime readiness", body: "Runtime URLs, health checks, sample inputs, response shape, failure modes, timeout behavior, and rate-limit behavior must match the manifest before a Skill is marked verified." },
        {
          title: "Review states and next actions",
          body: "Review states are written as operational handoffs so publishers and buyers can tell what happens next.",
          bullets: [
            "Draft: publisher completes manifest, examples, support path, and permission notes.",
            "Submitted: SkillHub queues automated validation and operator review.",
            "In review: operators check trust, runtime, policy, and marketplace fit.",
            "Needs changes: publisher fixes the listed issue and resubmits the draft or a new version.",
            "Verified: buyers may evaluate the Skill with the current manifest, permissions, and runtime contract.",
            "Restricted or rejected: distribution is blocked until the reason is resolved or appealed.",
          ],
        },
        { title: "Prelaunch paid boundaries", body: "Paid-preview listings may show price intent or active price records, but checkout, automated refunds, commissions, taxes, and payouts remain prelaunch until provider flows are explicitly enabled." },
        {
          title: "Change control",
          body: "Publishers should submit a new version or revise draft metadata rather than mutating verified behavior in place.",
          bullets: [
            { href: "/publisher#publisher-skills", label: "Open publisher skill workspace" },
            "Runtime or permission changes require a new review before the verified label should carry forward.",
            "Pricing changes remain preview-only unless checkout and provider billing are live for that listing.",
            "Restricted or rejected decisions should stay visible so operators can audit the resolution path.",
          ],
        },
      ],
    },
    zh: {
      eyebrow: "发布者信任",
      title: "发布审核",
      lead: "发布审核是运营队列，不只是发放徽章。每个状态都应说明卡点、下一步负责人，以及购买方是否可以安全采用该 Skill。",
      quickAnswer:
        "发布审核会让 Skill 经过草稿、已提交、审核中、需修改、已验证、受限、已拒绝或付费预览等状态。运营人员会检查 manifest 质量、schema、权限、运行行为、支持路径、安全信号和定价意图，再判断 listing 是否可被视为生产就绪。",
      primaryCta: { href: "/publish", label: "发布技能" },
      secondaryCta: { href: "/publisher#publisher-skills", label: "打开技能工作台" },
      sections: [
        { title: "提交门槛", body: "提交内容必须包含发布者身份、版本、运行时、输入输出 schema、权限说明、示例、支持路径、变更记录；如果是付费预览 Skill，还要包含定价意图。" },
        { title: "运营检查", body: "SkillHub 会检查 JSON 结构、必填 manifest 字段、语义版本、schema 形状、权限范围、运行声明、样例响应、支持负责人和市场展示位置。" },
        { title: "运行就绪", body: "运行 URL、健康检查、样例输入、响应结构、失败模式、超时行为和限流行为必须与 manifest 一致，之后才能标记为已验证。" },
        {
          title: "审核状态与下一步",
          body: "审核状态应写成运营交接，让发布者和购买方都能判断下一步发生什么。",
          bullets: [
            "草稿：发布者补齐 manifest、示例、支持路径和权限说明。",
            "已提交：SkillHub 排队执行自动校验和运营审核。",
            "审核中：运营人员检查信任、运行、策略和市场适配度。",
            "需修改：发布者修复列出的问题，并重新提交草稿或新版本。",
            "已验证：购买方可以基于当前 manifest、权限和运行合约进行评估。",
            "受限或已拒绝：分发被阻断，直到原因被解决或申诉完成。",
          ],
        },
        { title: "预发布付费边界", body: "付费预览 listing 可以展示价格意图或 active price 记录，但收银、自动退款、佣金、税务和提现在支付渠道明确启用前仍属于预发布能力。" },
        {
          title: "变更控制",
          body: "发布者应提交新版本或修改草稿信息，而不是直接改变已验证版本的行为。",
          bullets: [
            { href: "/publisher#publisher-skills", label: "打开发布者技能工作台" },
            "运行或权限变化需要重新审核，已验证标签才应继续有效。",
            "定价变更在 checkout 和渠道计费对该 listing 生效前仍是预览信息。",
            "受限或已拒绝决策应保持可见，方便运营人员审计解决路径。",
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
        { question: "Is a Skill always paid?", answer: "No. Public discovery and inspection can be free. Paid marketplace flows remain preview/prelaunch unless explicitly enabled." },
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
        { question: "Skill 一定收费吗？", answer: "不是。公开发现和检查可以免费。付费市场流程在明确启用前仍是预览/预发布状态。" },
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
        title: "SkillHub Pricing Preview - Free Discovery and Prelaunch Paid Marketplace",
        description:
          "Understand what is free today, what requires a workspace or Project Key, and why paid marketplace billing remains preview/prelaunch.",
      },
      zh: {
        title: "SkillHub 价格预览 - 免费发现与付费市场预发布",
        description:
          "了解当前免费开放能力、哪些能力需要工作台或 Project Key，以及付费市场计费为何仍处于预览/预发布状态。",
      },
    },
    en: {
      eyebrow: "Pricing",
      title: "Pricing Preview",
      lead: "SkillHub separates free discovery, project-gated runtime, and paid marketplace preview so buyers can see what is available before any billing flow is live.",
      quickAnswer:
        "During Launch Preview, public browsing, registry inspection, docs, security pages, and publisher guidance are available without checkout. Runtime invocation requires a workspace and Project Key. Paid listings may show price intent or active price records, but checkout, automated payouts, refunds, and provider billing remain prelaunch unless explicitly enabled.",
      primaryCta: { href: "/marketplace", label: "Browse Skills" },
      secondaryCta: { href: "/contact", label: "Contact for team evaluation" },
      sections: [
        { title: "Free today", body: "Browse public Skills, inspect manifests, read docs, review security/data handling pages, and evaluate publisher information without entering a payment flow." },
        { title: "Requires a workspace", body: "Saving Skills, creating projects, setting policies, and managing Project Keys require sign-in." },
        { title: "Requires a Project Key", body: "Runtime invocation through REST or MCP requires a signed-in project and scoped Project Key." },
        { title: "Paid-preview listings", body: "A paid-preview Skill can show per-call or subscription pricing for evaluation, but that display is not a production charge by itself." },
        { title: "Prelaunch payment boundary", body: "Checkout, subscriptions, refunds, disputes, commissions, taxes, and payouts are modeled as prelaunch operating flows until provider integrations are enabled for the listing." },
        { title: "No surprise billing", body: "Preview pages should not imply production billing unless the underlying provider flow is live, configured, and named in the buyer path." },
      ],
    },
    zh: {
      eyebrow: "价格",
      title: "价格预览",
      lead: "SkillHub 将免费发现、项目门控运行和付费市场预览分开说明，让购买方在任何计费流程上线前先看清可用边界。",
      quickAnswer:
        "公开预览阶段，公开浏览、注册中心检查、文档、安全页面和发布者指南无需 checkout 即可访问。运行调用需要工作台和 Project Key。付费 listing 可以展示价格意图或 active price 记录，但收银、自动提现、退款和渠道计费在明确启用前仍是预发布能力。",
      primaryCta: { href: "/marketplace", label: "浏览 Skills" },
      secondaryCta: { href: "/contact", label: "团队评估咨询" },
      sections: [
        { title: "当前免费开放的能力", body: "无需进入支付流程，即可浏览公开 Skills、检查 manifest、阅读文档、查看安全/数据处理页面和评估发布者信息。" },
        { title: "需要工作台的能力", body: "保存 Skills、创建项目、设置策略和管理 Project Key 需要登录。" },
        { title: "需要 Project Key 的能力", body: "通过 REST 或 MCP 运行调用需要登录后的项目和有作用域的 Project Key。" },
        { title: "付费预览 listing", body: "付费预览 Skill 可以展示按次或订阅价格，供评估使用；价格展示本身并不代表已经产生生产扣费。" },
        { title: "预发布支付边界", body: "收银、订阅、退款、争议、佣金、税务和提现在支付渠道针对该 listing 启用前，仍是预发布运营流程。" },
        { title: "预览期间不会产生意外账单", body: "除非底层支付渠道真实可用、已经配置，并在购买路径中明确命名，否则页面不应暗示生产计费已经上线。" },
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
        "SkillHub API exposes public registry and manifest inspection endpoints, while runtime invocation requires project authentication through Project Keys. Governance checks, logs, policies, rate limits, and preview billing state attach to runtime activity.",
      primaryCta: { href: "/docs", label: "Read full docs" },
      secondaryCta: { href: "/mcp", label: "Compare MCP" },
      sections: [
        { title: "Authentication", body: "Public Skill API endpoints can be inspected without a Project Key. Runtime and workspace operations require signed-in context and scoped credentials." },
        { title: "Public Skill API endpoints", body: "Use skill search endpoints to list public Skills, filter by task, runtime, verification state, and permission profile." },
        { title: "Manifest inspection", body: "Skill detail endpoints expose manifest, schema, permissions, version, publisher, and review state before adoption." },
        { title: "Project Key runtime endpoints", body: "Runtime invocation should authenticate with a Project Key created inside a signed-in project." },
        { title: "Errors and rate limits", body: "API clients should handle validation errors, unauthorized calls, policy blocks, rate limits, missing Project Keys, and prelaunch payment gates." },
        { title: "Example request", body: "POST /v1/runtime/invoke with Authorization: Bearer PROJECT_KEY and a Skill slug plus typed input payload." },
        {
          title: "Which path should developers use first?",
          body: "Start with public discovery when you are evaluating Skills, then move to project runtime only after the team has chosen a workflow and reviewed permissions.",
          bullets: [
            "Discovery: browse categories, compare publishers, and inspect manifest metadata without a key.",
            "Adoption: sign in, create a project, and save the Skill only when the team plans to reuse it.",
            "Runtime: call REST only from a trusted server or approved automation environment with a scoped Project Key.",
          ],
        },
        {
          title: "Request and response contract",
          body: "A production client should treat each Skill as a typed contract: validate input before sending, handle structured output, and store invocation IDs for audit follow-up.",
          bullets: [
            "Send the Skill slug, version preference when needed, and a typed payload that matches the manifest schema.",
            "Expect policy blocks, validation errors, rate limits, and unavailable runtime states as normal client branches.",
            "Record request time, project id, Skill slug, response status, and returned invocation id without logging secrets.",
          ],
        },
        {
          title: "Operational checklist before production",
          body: "Before running the API in a customer-facing workflow, check ownership, key scope, retry behavior, logs, and manual fallback.",
          bullets: [
            "Keep Project Keys server-side and rotate them when owners or environments change.",
            "Use idempotency or job identifiers for workflows that can be retried.",
            "Keep a human review step for high-risk permissions, customer data, billing, or external writes.",
          ],
        },
      ],
    },
    zh: {
      eyebrow: "开发者",
      title: "SkillHub API",
      lead: "API 是从公开 Skill 发现到登录后运行调用的程序化路径。",
      quickAnswer:
        "SkillHub API 暴露公开注册中心和 manifest 检查端点；运行调用需要通过 Project Key 完成项目认证。治理检查、日志、策略、限流和预览账务状态会绑定到运行活动。",
      primaryCta: { href: "/docs", label: "阅读完整文档" },
      secondaryCta: { href: "/mcp", label: "对比 MCP" },
      sections: [
        { title: "认证", body: "公开注册中心端点可以不使用 Project Key 检查。运行和工作台操作需要登录上下文和有作用域凭据。" },
        { title: "公开 Skill 注册中心端点", body: "使用注册/搜索端点列出公开 Skills，并按任务、运行时、验证状态和权限画像筛选。" },
        { title: "Manifest 检查", body: "Skill 详情端点在采用前展示 manifest、schema、权限、版本、发布者和审核状态。" },
        { title: "Project Key 运行端点", body: "运行调用应使用登录后项目中创建的 Project Key 认证。" },
        { title: "错误与限流", body: "API 客户端应处理校验错误、未授权调用、策略阻断、限流、缺少 Project Key 和预发布支付门禁。" },
        { title: "请求示例", body: "POST /v1/runtime/invoke，使用 Authorization: Bearer PROJECT_KEY，并传入 Skill slug 与类型化输入。" },
        {
          title: "开发者应该先用哪条路径？",
          body: "评估 Skill 时先走公开发现；团队确认要复用某个工作流并检查权限后，再进入项目运行。",
          bullets: [
            "发现：免密浏览分类、对比发布者，并检查 manifest 元数据。",
            "采用：登录后创建项目，只有团队计划长期复用时才保存 Skill。",
            "运行：只在可信服务端或已批准自动化环境中，用有作用域的 Project Key 调用 REST。",
          ],
        },
        {
          title: "请求与响应契约",
          body: "生产客户端应把每个 Skill 当成类型化合约：发送前校验输入，处理结构化输出，并保存 invocation id 便于审计追踪。",
          bullets: [
            "发送 Skill slug、必要时指定版本偏好，并提交符合 manifest schema 的类型化 payload。",
            "策略阻断、校验错误、限流和运行时不可用都应作为正常分支处理。",
            "记录请求时间、项目、Skill slug、响应状态和 invocation id，但不要记录 secret。",
          ],
        },
        {
          title: "生产前运营检查清单",
          body: "把 API 接入客户可见流程前，要确认负责人、Key 作用域、重试行为、日志和人工兜底。",
          bullets: [
            "Project Key 保留在服务端；负责人或环境变化时要轮换。",
            "可重试工作流应使用幂等键或任务 id。",
            "涉及高风险权限、客户数据、账务或外部写入时，保留人工复核。",
          ],
        },
      ],
    },
  },
  "mcp": {
    active: "mcp",
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
        "SkillHub MCP can expose project-approved Skills as MCP tools while preserving manifest metadata, permission checks, Project Key boundaries, runtime logs, and preview limitations. REST remains better for direct server-to-server invocation; MCP is better for Agent workbenches and tool discovery.",
      primaryCta: { href: "/docs", label: "Read MCP docs" },
      secondaryCta: { href: "/api", label: "View REST API" },
      sections: [
        { title: "What SkillHub exposes over MCP", body: "Approved Skills can appear as MCP tools with names, descriptions, schemas, permissions, and runtime status." },
        { title: "Metadata discovery", body: "Agents can inspect tool metadata before selecting a Skill, reducing blind prompt-only execution." },
        { title: "Runtime invocation boundary", body: "MCP invocation still resolves through project policy, approval state, rate limits, and runtime governance." },
        { title: "Permission and policy checks", body: "High-risk permissions, billing preview gates, and restricted states must remain visible before invocation." },
        { title: "REST vs MCP", body: "REST is direct and simple for backends. MCP is stronger when an Agent client needs dynamic tool discovery and structured tool calls." },
        {
          title: "When MCP is the right choice",
          body: "Use MCP when an Agent workbench needs to list approved Skills, understand schemas, and call tools dynamically during a task.",
          bullets: [
            "Good fit: internal agent workbenches, coding copilots, research agents, support copilots, and operator consoles.",
            "Use REST instead when the caller is a predictable backend job or a fixed product workflow.",
            "Do not expose private credentials or unreviewed Skills through MCP metadata.",
          ],
        },
        {
          title: "Configuration shape",
          body: "A typical MCP setup points the Agent client at a SkillHub endpoint and passes a project-scoped credential from a trusted configuration store.",
          bullets: [
            "Keep Project Keys outside public browser bundles and prompt text.",
            "Scope the key to the project and approved Skills needed by the Agent.",
            "Name tools clearly so the Agent can choose by business task, not vague internal labels.",
          ],
        },
        {
          title: "Runtime evidence",
          body: "MCP calls should remain auditable. Operators need to see which Agent called which Skill, which policy allowed it, and what result or failure was returned.",
          bullets: [
            "Track tool name, project, caller, timestamp, policy decision, and invocation id.",
            "Surface policy blocks and permission warnings to the human operator.",
            "Keep sensitive payload fields redacted in logs and support reports.",
          ],
        },
      ],
    },
    zh: {
      eyebrow: "Agent 集成",
      title: "SkillHub MCP",
      lead: "MCP 给 Agent 客户端提供工具发现和调用形态；SkillHub 增加注册中心、审核、Project Key 和治理上下文。",
      quickAnswer:
        "SkillHub MCP 可以把项目已批准的 Skills 暴露为 MCP tools，同时保留 manifest 元数据、权限检查、Project Key 边界、运行日志和预览限制。REST 更适合服务端直接调用；MCP 更适合 Agent 工作台和工具发现。",
      primaryCta: { href: "/docs", label: "阅读 MCP 文档" },
      secondaryCta: { href: "/api", label: "查看 REST API" },
      sections: [
        { title: "SkillHub 通过 MCP 暴露什么", body: "已批准的 Skills 可以作为 MCP tools 展示，包含名称、描述、schema、权限和运行状态。" },
        { title: "元数据发现", body: "Agent 可以在选择 Skill 前检查工具元数据，减少盲目的 prompt-only 执行。" },
        { title: "运行调用边界", body: "MCP 调用仍然通过项目策略、批准状态、限流和运行治理解析。" },
        { title: "权限与策略检查", body: "高风险权限、账务预览门禁和受限状态在调用前必须可见。" },
        { title: "REST 与 MCP 的区别", body: "REST 对后端直接调用更简单。MCP 更适合 Agent 客户端需要动态工具发现和结构化工具调用的场景。" },
        {
          title: "什么时候应该用 MCP",
          body: "当 Agent 工作台需要列出已批准 Skills、理解 schema，并在任务执行过程中动态调用工具时，MCP 更合适。",
          bullets: [
            "适合：内部 Agent 工作台、代码助手、研究 Agent、客服助手和运营控制台。",
            "如果调用方是固定后端任务或固定产品流程，优先使用 REST。",
            "不要通过 MCP 元数据暴露私有凭据或未审核 Skill。",
          ],
        },
        {
          title: "配置形态",
          body: "典型 MCP 配置会把 Agent 客户端指向 SkillHub 端点，并从可信配置存储中传入项目级凭据。",
          bullets: [
            "Project Key 不应放在公开浏览器包或提示词文本里。",
            "Key 应限制在项目和该 Agent 需要的已批准 Skills 范围内。",
            "工具命名要清楚，让 Agent 按业务任务选择，而不是按模糊内部代号选择。",
          ],
        },
        {
          title: "运行证据",
          body: "MCP 调用也要可审计。运营人员需要知道哪个 Agent 调用了哪个 Skill、哪条策略允许调用，以及返回了什么结果或失败。",
          bullets: [
            "记录工具名、项目、调用方、时间、策略决策和 invocation id。",
            "把策略阻断和权限警告展示给人工操作员。",
            "日志和支持报告中要脱敏敏感 payload 字段。",
          ],
        },
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
        title: "SkillHub Changelog - Launch Preview Updates",
        description:
          "Track SkillHub Launch Preview updates across public pages, registry contracts, API/MCP documentation, security posture, and production readiness.",
      },
      zh: {
        title: "SkillHub 更新日志 - 公开预览进展",
        description:
          "跟踪 SkillHub 公开预览阶段的页面、注册中心合约、API/MCP 文档、安全状态和上线准备进展。",
      },
    },
    en: {
      eyebrow: "Product updates",
      title: "Changelog",
      lead: "Launch Preview changes are documented without inventing old releases or fake customer traction.",
      quickAnswer:
        "The current changelog starts with public launch readiness work: clearer information architecture, SEO/GEO pages, honest preview labeling, admin operations polish, and route/indexing cleanup.",
      primaryCta: { href: "/roadmap", label: "View roadmap" },
      secondaryCta: { href: "/status", label: "Check status" },
      sections: [
        { title: "Current launch readiness update", body: "Added public trust, contact, pricing, API, MCP, Skill explainer, roadmap, and data-handling surfaces for production evaluation." },
        { title: "Registry and marketplace clarity", body: "Public pages distinguish discovery, manifest inspection, project-gated runtime, and paid marketplace preview state." },
        { title: "Security and operations", body: "Admin operations, privacy, data handling, review, and support paths are documented as Launch Preview capabilities." },
      ],
    },
    zh: {
      eyebrow: "产品更新",
      title: "更新日志",
      lead: "公开预览阶段的变化要真实记录，不编造历史版本或客户增长。",
      quickAnswer:
        "当前更新日志从公开上线准备开始：更清晰的信息架构、SEO/GEO 页面、真实的预览标识、管理员运营后台优化，以及路由/索引清理。",
      primaryCta: { href: "/roadmap", label: "查看路线图" },
      secondaryCta: { href: "/status", label: "查看状态" },
      sections: [
        { title: "当前上线准备更新", body: "新增公开信任、联系、价格、API、MCP、Skill 解释、路线图和数据处理页面，方便生产评估。" },
        { title: "注册中心与市场清晰度", body: "公开页面区分发现、manifest 检查、项目门禁运行和付费市场预览状态。" },
        { title: "安全与运营", body: "管理员运营、隐私、数据处理、发布审核和支持路径以公开预览能力方式记录。" },
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
          "Learn what SkillHub is, why it exists, who it serves, and what is available during Launch Preview.",
      },
      zh: {
        title: "关于 SkillHub - AI Agent Skill 注册中心与运行治理层",
        description:
          "了解 SkillHub 是什么、为什么存在、服务谁，以及公开预览阶段已经开放哪些能力。",
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
        { title: "Current Launch Preview status", body: "Discovery, inspection, docs, review paths, and workspace gates are visible. Paid marketplace provider flows remain preview/prelaunch unless explicitly configured." },
        {
          title: "What buyers can do first",
          body: "A buyer can browse the marketplace, compare categories, inspect Skill details, evaluate publisher trust, and start with free or low-risk workflows before requesting Pro onboarding.",
          bullets: [
            { href: "/solutions", label: "Choose a solution by business workflow" },
            { href: "/marketplace", label: "Browse the Skill marketplace" },
            { href: "/pricing", label: "Review free and Pro paths" },
          ],
        },
        {
          title: "What publishers can do first",
          body: "A third-party author can prepare a Skill manifest, examples, permission notes, support path, and paid-readiness metadata before submitting for review.",
          bullets: [
            { href: "/publish", label: "Read the publishing guide" },
            { href: "/publisher-review", label: "Understand review states" },
            { href: "/publishers", label: "Browse public publisher profiles" },
          ],
        },
        {
          title: "What operators control",
          body: "Operators need clear review queues, abuse handling, incident notes, notification templates, billing-preview records, and launch-readiness evidence so the marketplace can be run responsibly.",
        },
        {
          title: "What SkillHub is not",
          body: "SkillHub is not a place to paste secrets, bypass review, run anonymous production calls, or claim final compliance certifications that have not been issued.",
        },
        {
          title: "How to evaluate SkillHub",
          body: "Start with one concrete workflow, inspect the relevant Skills, test with sample data, then decide whether the team needs Pro, custom Skills, or publisher onboarding.",
          bullets: [
            "Pick one workflow such as SEO/GEO, e-commerce, data cleanup, support, sales, UI QA, or developer/security review.",
            "Check manifest, permissions, examples, publisher, review status, and support path before adoption.",
            `Contact ${companyInfo.businessEmail} for Pro onboarding or custom workflow evaluation.`,
          ],
        },
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
        { title: "当前公开预览状态", body: "发现、检查、文档、审核路径和工作台门禁已可见。付费市场渠道流程在明确配置前仍是预览/预发布。" },
        {
          title: "购买方可以先做什么",
          body: "购买方可以先浏览市场、对比分类、检查 Skill 详情、评估发布者可信度，并从免费或低风险工作流开始，再决定是否开通 Pro。",
          bullets: [
            { href: "/solutions", label: "按业务工作流选择解决方案" },
            { href: "/marketplace", label: "浏览技能市场" },
            { href: "/pricing", label: "查看免费与 Pro 路径" },
          ],
        },
        {
          title: "发布者可以先做什么",
          body: "第三方作者可以准备 Skill manifest、示例、权限说明、支持路径和付费准备资料，然后提交审核。",
          bullets: [
            { href: "/publish", label: "阅读发布指南" },
            { href: "/publisher-review", label: "了解审核状态" },
            { href: "/publishers", label: "浏览公开发布者档案" },
          ],
        },
        {
          title: "运营人员要控制什么",
          body: "运营人员需要清晰的审核队列、滥用处理、事故备注、通知模板、账务预览记录和上线准备证据，才能负责任地运营技能市场。",
        },
        {
          title: "SkillHub 不是什么",
          body: "SkillHub 不是粘贴 secret、绕过审核、匿名运行生产调用，或声明尚未取得最终合规认证的地方。",
        },
        {
          title: "如何评估 SkillHub",
          body: "先选一个具体工作流，检查相关 Skills，用样例数据测试，然后决定团队是否需要 Pro、定制 Skill 或发布者入驻。",
          bullets: [
            "选择一个工作流：SEO/GEO、电商、数据清洗、客服、销售、UI 质检或开发/安全审核。",
            "采用前检查 manifest、权限、示例、发布者、审核状态和支持路径。",
            `Pro 开通或定制工作流评估请联系 ${companyInfo.businessEmail}。`,
          ],
        },
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
        title: "SkillHub Roadmap - Available Now, Preview, and Planned",
        description:
          "See what SkillHub offers today, what remains in Launch Preview, what is planned next, and what is not yet available.",
      },
      zh: {
        title: "SkillHub 路线图 - 已开放、预览中与计划中",
        description:
          "查看 SkillHub 当前已开放能力、仍处于公开预览的能力、下一步计划，以及尚未开放的能力。",
      },
    },
    en: {
      eyebrow: "Launch Preview",
      title: "Roadmap",
      lead: "This roadmap clarifies maturity without promising dates that have not been confirmed.",
      quickAnswer:
        "Available now: public discovery, manifest inspection, docs, review surfaces, login/workspace paths, and admin operation models. In preview: runtime governance, Project Key testing, billing ledger, publisher payout workflow, and marketplace trust loops. Not yet generally available: production payment capture, automated payouts, public SDK/CLI release, and final compliance certifications.",
      primaryCta: { href: "/status", label: "Check status" },
      secondaryCta: { href: "/contact", label: "Discuss evaluation" },
      sections: [
        { title: "Available now", body: "Public site, marketplace browsing, registry inspection, Skill details, docs, security, data handling, support, and role-aware workspaces." },
        { title: "In preview", body: "Runtime invocation governance, Project Keys, billing ledger modeling, review queues, admin operations, publisher payout workflow, and paid marketplace readiness." },
        { title: "Planned next", body: "Provider-connected checkout, payout automation, stronger analytics, richer publisher trust profiles, and public package release paths." },
        { title: "Not yet available", body: "No general payment capture, automated payouts, tax/KYC automation, SOC 2/ISO claims, or public SDK/CLI production release unless explicitly announced." },
      ],
    },
    zh: {
      eyebrow: "公开预览",
      title: "路线图",
      lead: "这份路线图说明成熟度，不承诺尚未确认的具体日期。",
      quickAnswer:
        "当前已开放：公开发现、manifest 检查、文档、审核界面、登录/工作台路径和管理员运营模型。预览中：运行治理、Project Key 测试、账本、发布者提现流程和市场信任闭环。尚未通用开放：生产支付扣款、自动提现、公开 SDK/CLI release 和最终合规认证。",
      primaryCta: { href: "/status", label: "查看状态" },
      secondaryCta: { href: "/contact", label: "讨论评估" },
      sections: [
        { title: "已开放", body: "公开站点、市场浏览、注册中心检查、Skill 详情、文档、安全、数据处理、支持和角色感知工作台。" },
        { title: "预览中", body: "运行调用治理、Project Key、账本建模、审核队列、管理员运营、发布者提现工作流和付费市场准备。" },
        { title: "下一步计划", body: "支付渠道收银、提现自动化、更强 analytics、更丰富发布者信任资料，以及公开 package release 路径。" },
        { title: "尚未开放", body: "除非明确公告，否则不提供通用支付扣款、自动提现、税务/KYC 自动化、SOC 2/ISO 声明或公开 SDK/CLI 生产 release。" },
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
