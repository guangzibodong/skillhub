import { companyInfo, companyLinks } from "@/lib/company-info";
import type { PublicPageDefinition } from "@/lib/public-pages";

export type LaunchPublicPageKey =
  | "acceptable-use"
  | "cookie-policy"
  | "examples"
  | "marketplace-terms"
  | "project-keys"
  | "publisher-agreement"
  | "quickstart"
  | "refund-policy"
  | "security-disclosure"
  | "subprocessors"
  | "webhooks";

const supportLine = `Technical support: ${companyInfo.supportEmail}`;
const businessLine = `Business cooperation: ${companyInfo.businessEmail}`;
const addressLine = `Address: ${companyInfo.address}`;
const supportLineZh = `技术支持：${companyInfo.supportEmail}`;
const businessLineZh = `商务合作：${companyInfo.businessEmail}`;
const addressLineZh = `公司地址：${companyInfo.address}`;

export const launchPublicPages: Record<LaunchPublicPageKey, PublicPageDefinition> = {
  "project-keys": {
    active: "docs",
    indexable: true,
    path: "/project-keys",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub Project Keys - Scoped Runtime Access for Agent Skills",
        description:
          "Learn how Project Keys control SkillHub REST and MCP runtime calls, including creation, rotation, revocation, permissions, rate limits, logs, and audit trails.",
      },
      zh: {
        title: "SkillHub Project Key - Agent Skill 运行调用的项目级凭据",
        description:
          "了解 SkillHub Project Key 如何控制 REST 与 MCP 运行调用，包括创建、轮换、撤销、权限、限流、日志和审计。",
      },
    },
    en: {
      eyebrow: "Developer operations",
      title: "Project Keys",
      lead:
        "Project Keys are scoped credentials for runtime calls. They connect a signed-in project to approved Skills without exposing user secrets publicly.",
      quickAnswer:
        "Public Skill discovery does not require a Project Key. Runtime invocation does. Create keys inside a workspace project, scope them to approved Skills, rotate them regularly, and revoke them immediately when access changes.",
      primaryCta: { href: "/login?returnTo=%2Fdeveloper", label: "Sign in for workspace" },
      secondaryCta: { href: "/quickstart", label: "Read quickstart" },
      sections: [
        { title: "What a Project Key does", body: "It authenticates runtime calls from your project to SkillHub REST or MCP boundaries, while preserving policy checks, limits, and logs." },
        { title: "Why runtime calls require it", body: "SkillHub separates public inspection from execution. Project Keys prove project ownership and let operators audit who invoked what." },
        { title: "Create a key in 3 steps", body: "Open the developer workspace, create or select a project, then issue a scoped key for the approved Skill set you plan to call." },
        { title: "REST example", body: "Send Authorization: Bearer PROJECT_KEY to the runtime invoke endpoint with a Skill slug and typed input payload. Keep keys server-side." },
        { title: "MCP config example", body: "Use the SkillHub MCP endpoint with a project-scoped key so Agent workbenches can list and call approved tools." },
        { title: "Rotate, revoke, audit", body: "Rotate keys when owners change, revoke keys when a project is retired, and use logs to investigate runtime or billing-preview questions." },
      ],
      faq: [
        { question: "Can anonymous users invoke Skills?", answer: "No. Production runtime calls require a signed-in project and Project Key." },
        { question: "Should Project Keys appear in browser code?", answer: "No. Keep Project Keys server-side or inside trusted MCP configuration." },
      ],
    },
    zh: {
      eyebrow: "开发者运营",
      title: "Project Key",
      lead: "Project Key 是运行调用使用的项目级凭据。它把登录后的项目与已批准 Skill 连接起来，不把用户密钥公开暴露。",
      quickAnswer:
        "公开浏览 Skill 不需要 Project Key；真实运行调用需要。请在工作区项目中创建 Key，限制到已批准的 Skill，并在权限变化时轮换或撤销。",
      primaryCta: { href: "/login?returnTo=%2Fdeveloper", label: "登录后进入工作区" },
      secondaryCta: { href: "/quickstart", label: "阅读快速开始" },
      sections: [
        { title: "Project Key 做什么", body: "它认证从项目到 SkillHub REST 或 MCP 边界的运行调用，同时保留策略检查、限流和日志。" },
        { title: "为什么运行调用需要它", body: "SkillHub 把公开检查和真实执行分开。Project Key 证明项目归属，并让运营人员能审计谁调用了什么。" },
        { title: "三步创建 Key", body: "打开开发者工作区，创建或选择项目，然后为计划调用的已批准 Skill 集合创建有作用域的 Key。" },
        { title: "REST 示例", body: "使用 Authorization: Bearer PROJECT_KEY 调用运行端点，传入 Skill slug 和类型化输入。Key 应保留在服务端。" },
        { title: "MCP 配置示例", body: "使用 SkillHub MCP 端点和项目级 Key，让 Agent 工作台可以列出并调用已批准工具。" },
        { title: "轮换、撤销和审计", body: "负责人变化时轮换 Key，项目废弃时撤销 Key，并通过日志排查运行或账务预览问题。" },
      ],
      faq: [
        { question: "匿名用户能调用 Skill 吗？", answer: "不能。生产运行调用需要登录后的项目和 Project Key。" },
        { question: "Project Key 可以放在浏览器代码里吗？", answer: "不可以。Project Key 应保留在服务端或可信 MCP 配置中。" },
      ],
    },
  },
  "quickstart": {
    active: "docs",
    indexable: true,
    path: "/quickstart",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub Quickstart - Discover, Inspect, and Call Your First Skill",
        description:
          "A practical SkillHub quickstart for browsing public Skills, inspecting manifests, creating a Project Key, testing REST calls, configuring MCP, and reading logs.",
      },
      zh: {
        title: "SkillHub 快速开始 - 发现、检查并调用第一个 Skill",
        description:
          "SkillHub 快速开始：浏览公开 Skill、检查 manifest、创建 Project Key、测试 REST 调用、配置 MCP 并查看日志。",
      },
    },
    en: {
      eyebrow: "5-minute setup",
      title: "Quickstart",
      lead:
        "Move from public discovery to a controlled runtime call without guessing which pieces are live and which are still preview.",
      quickAnswer:
        "Start by browsing a public Skill, inspect the manifest, create a project and Project Key, test a REST request, then configure MCP for Agent workbench use.",
      primaryCta: { href: "/marketplace", label: "Browse Skills" },
      secondaryCta: { href: "/project-keys", label: "Project Keys" },
      sections: [
        { title: "1. Browse public Skills", body: "Use Marketplace or Registry to find a Skill by category, runtime, verification state, permissions, or publisher." },
        { title: "2. Inspect the manifest", body: "Open the manifest before installation. Check schema, runtime, permissions, version, examples, and review state." },
        { title: "3. Create a Project Key", body: "Sign in, create a project, and issue a scoped key for approved runtime calls." },
        { title: "4. Call the REST API", body: "Invoke the Skill through the runtime endpoint with Authorization: Bearer PROJECT_KEY and a typed input payload." },
        { title: "5. Configure MCP", body: "Add SkillHub MCP to your Agent workbench so approved Skills appear as callable tools." },
        { title: "6. Review logs", body: "Check runtime logs, policy blocks, rate limits, and preview billing signals after test calls." },
      ],
    },
    zh: {
      eyebrow: "5 分钟跑通",
      title: "快速开始",
      lead: "从公开发现到受控运行调用，清楚知道哪些能力已开放，哪些仍处于预览。",
      quickAnswer:
        "先浏览公开 Skill，检查 manifest，创建项目和 Project Key，测试 REST 请求，再为 Agent 工作台配置 MCP。",
      primaryCta: { href: "/marketplace", label: "浏览 Skills" },
      secondaryCta: { href: "/project-keys", label: "Project Key" },
      sections: [
        { title: "1. 浏览公开 Skill", body: "在 Marketplace 或 Registry 中按类别、运行时、验证状态、权限或发布者查找 Skill。" },
        { title: "2. 检查 manifest", body: "安装前打开 manifest，检查 schema、运行时、权限、版本、示例和审核状态。" },
        { title: "3. 创建 Project Key", body: "登录后创建项目，并为已批准运行调用生成有作用域的 Key。" },
        { title: "4. 调用 REST API", body: "使用 Authorization: Bearer PROJECT_KEY 和类型化输入调用运行端点。" },
        { title: "5. 配置 MCP", body: "把 SkillHub MCP 加入 Agent 工作台，使已批准 Skill 以工具形式出现。" },
        { title: "6. 查看日志", body: "测试调用后检查运行日志、策略阻断、限流和账务预览信号。" },
      ],
    },
  },
  "examples": {
    active: "docs",
    indexable: true,
    path: "/examples",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub Examples - Agent Skill Templates for Real Workflows",
        description:
          "Explore SkillHub example workflows for browser research, docs Q&A, code review, dataset summarization, support triage, CRM enrichment, finance, and data pipelines.",
      },
      zh: {
        title: "SkillHub 示例 - 面向真实工作流的 Agent Skill 模板",
        description:
          "查看 SkillHub 示例：网页研究、文档问答、代码审核、数据集摘要、客服分流、CRM 补全、财务分析和数据管道。",
      },
    },
    en: {
      eyebrow: "Templates",
      title: "Examples",
      lead: "Use these workflow patterns to understand how Skills should declare purpose, permissions, runtime shape, and safe output behavior.",
      quickAnswer:
        "Examples are reference patterns, not fake customer deployments. Treat them as templates for manifests, permission review, REST/MCP calls, output samples, and safety notes.",
      primaryCta: { href: "/marketplace", label: "Browse public Skills" },
      secondaryCta: { href: "/publish", label: "Publish a Skill" },
      sections: [
        { title: "Browser Research Agent", body: "For analysts and operators who need sourced web research. Uses web search/fetch permissions, returns citations, and should avoid secret collection." },
        { title: "Docs Q&A Agent", body: "For product and support teams answering from documentation. Uses document retrieval, clear source excerpts, and conservative fallback language." },
        { title: "Code Review Agent", body: "For engineering teams reviewing diffs. Uses repository metadata and should avoid destructive actions unless explicitly approved." },
        { title: "Dataset Summarizer", body: "For data teams summarizing tabular or uploaded datasets. Declares storage and retention behavior before processing." },
        { title: "Support Triage Agent", body: "For support queues. Classifies urgency, extracts next steps, and keeps customer-sensitive fields scoped." },
        { title: "CRM Enrichment Agent", body: "For sales operations. Enriches leads with declared web sources and data retention notes." },
        { title: "Financial Report Analyzer", body: "For finance reviews. Requires careful permission and retention declarations before handling financial documents." },
        { title: "Data Pipeline Orchestrator", body: "For operations teams coordinating scheduled workflows. Should expose dry-run mode, idempotency, and audit logs." },
      ],
    },
    zh: {
      eyebrow: "模板",
      title: "示例",
      lead: "这些工作流模式用于理解 Skill 应如何声明用途、权限、运行形态和安全输出行为。",
      quickAnswer:
        "示例是参考模板，不是假客户案例。请把它们当作 manifest、权限审核、REST/MCP 调用、输出样例和安全注意事项的模板。",
      primaryCta: { href: "/marketplace", label: "浏览公开 Skills" },
      secondaryCta: { href: "/publish", label: "发布 Skill" },
      sections: [
        { title: "Browser Research Agent", body: "面向需要带来源网页研究的分析师和运营人员。使用 web search/fetch 权限，返回引用，并避免收集密钥。" },
        { title: "Docs Q&A Agent", body: "面向从文档回答问题的产品和支持团队。使用文档检索、明确来源片段和保守 fallback。" },
        { title: "Code Review Agent", body: "面向工程团队审查 diff。使用仓库元数据，除非明确批准，否则避免破坏性动作。" },
        { title: "Dataset Summarizer", body: "面向数据团队摘要表格或上传数据。处理前声明存储与保留行为。" },
        { title: "Support Triage Agent", body: "面向客服队列。分类紧急度、提取下一步，并把客户敏感字段限制在作用域内。" },
        { title: "CRM Enrichment Agent", body: "面向销售运营。用声明过的网页来源补全线索，并说明数据保留。" },
        { title: "Financial Report Analyzer", body: "面向财务审阅。处理财务文档前需要谨慎声明权限与保留策略。" },
        { title: "Data Pipeline Orchestrator", body: "面向运营团队协调定时工作流。应暴露 dry-run、幂等性和审计日志。" },
      ],
    },
  },
  "webhooks": {
    active: "docs",
    indexable: true,
    path: "/webhooks",
    schema: "Article",
    seo: {
      en: {
        title: "SkillHub Webhooks - Events, Signing Secrets, Retries, and Failure Handling",
        description:
          "Understand SkillHub webhook events, signing secrets, retry policy, failure handling, example payloads, local testing, and security best practices.",
      },
      zh: {
        title: "SkillHub Webhooks - 事件、签名密钥、重试与失败处理",
        description:
          "了解 SkillHub webhook 事件、签名密钥、重试策略、失败处理、示例 payload、本地测试和安全最佳实践。",
      },
    },
    en: {
      eyebrow: "Preview integration",
      title: "Webhooks",
      lead: "Webhooks turn review, runtime, billing-preview, and payout-preview activity into auditable external events.",
      quickAnswer:
        "Webhook delivery is preview-gated. Store signing secrets safely, verify signatures, handle retries idempotently, and never log sensitive payload fields.",
      primaryCta: { href: "/login?returnTo=%2Fdeveloper", label: "Sign in for workspace" },
      secondaryCta: { href: "/security", label: "Security model" },
      sections: [
        { title: "Supported events", body: "skill.review.submitted, skill.review.approved, skill.review.rejected, skill.invocation.started, skill.invocation.succeeded, skill.invocation.failed, project_key.created, project_key.revoked, billing.order.created, billing.payment.succeeded, billing.payment.failed, publisher.payout.created, and publisher.payout.failed." },
        { title: "Signing secrets", body: "Each endpoint should have a signing secret. Verify signatures before processing and rotate secrets when ownership changes." },
        { title: "Retry policy", body: "Treat delivery as at-least-once. Return 2xx only after durable processing. Use event IDs for idempotency." },
        { title: "Failure handling", body: "Failed deliveries should surface in workspace logs with retry count, next attempt, and redacted payload summary." },
        { title: "Example payload", body: "Payloads include event id, type, created timestamp, workspace/project identifiers, redacted data, and a links object for follow-up." },
        { title: "Security best practices", body: "Reject unsigned requests, enforce timestamp tolerance, avoid raw secret logs, and test with local tunnel tooling before production." },
      ],
    },
    zh: {
      eyebrow: "预览集成",
      title: "Webhooks",
      lead: "Webhook 把审核、运行、账务预览和提现预览活动转成可审计的外部事件。",
      quickAnswer:
        "Webhook 投递仍受预览门禁约束。请安全保存签名密钥、校验签名、幂等处理重试，并避免记录敏感 payload 字段。",
      primaryCta: { href: "/login?returnTo=%2Fdeveloper", label: "登录后进入工作区" },
      secondaryCta: { href: "/security", label: "安全模型" },
      sections: [
        { title: "支持事件", body: "skill.review.submitted、skill.review.approved、skill.review.rejected、skill.invocation.started、skill.invocation.succeeded、skill.invocation.failed、project_key.created、project_key.revoked、billing.order.created、billing.payment.succeeded、billing.payment.failed、publisher.payout.created、publisher.payout.failed。" },
        { title: "签名密钥", body: "每个端点都应有 signing secret。处理前校验签名，所有权变化时轮换密钥。" },
        { title: "重试策略", body: "按 at-least-once 投递处理。只有完成持久处理后才返回 2xx。使用 event id 做幂等。" },
        { title: "失败处理", body: "失败投递应在工作区日志中显示重试次数、下次尝试时间和脱敏 payload 摘要。" },
        { title: "示例 payload", body: "Payload 包含 event id、type、创建时间、workspace/project 标识、脱敏数据和后续处理 links。" },
        { title: "安全最佳实践", body: "拒绝未签名请求，执行时间戳容忍度，避免原始密钥日志，并在生产前用本地 tunnel 工具测试。" },
      ],
    },
  },
  "marketplace-terms": legalPage({
    path: "/marketplace-terms",
    titleEn: "Marketplace Terms",
    titleZh: "市场条款",
    descriptionEn:
      "Marketplace terms for SkillHub public discovery, preview runtime use, paid listing readiness, billing-preview records, refunds, disputes, and support routes.",
    descriptionZh:
      "SkillHub 市场条款，覆盖公开发现、预览运行、付费上架准备、账务预览记录、退款、争议和支持路径。",
    leadEn:
      "These terms explain the current marketplace operating state during Launch Preview. Paid marketplace capture remains gated until provider flows are explicitly enabled.",
    leadZh:
      "这些条款说明公开预览阶段的市场运营状态。付费市场扣款在支付渠道明确启用前保持门禁。",
    sectionsEn: [
      ["Public discovery", "Users may browse public Skills, inspect manifests, compare permissions, and read review status before adopting a Skill."],
      ["Runtime use", "Runtime invocation requires a signed-in project and Project Key. Anonymous production invocation is not allowed."],
      ["Paid marketplace preview", "Paid listings, orders, refunds, disputes, commissions, and payouts are modeled as preview/prelaunch states until providers are live."],
      ["Refunds and disputes", "Refund and dispute records should be auditable adjustments, not silent edits to historical transactions."],
    ],
    sectionsZh: [
      ["公开发现", "用户可以浏览公开 Skill、检查 manifest、比较权限，并在采用前阅读审核状态。"],
      ["运行使用", "运行调用需要登录后的项目和 Project Key。不允许匿名生产调用。"],
      ["付费市场预览", "付费 listing、订单、退款、争议、佣金和提现在渠道上线前保持预览/预发布状态。"],
      ["退款与争议", "退款和争议记录应是可审计调整，而不是静默修改历史交易。"],
    ],
  }),
  "publisher-agreement": legalPage({
    path: "/publisher-agreement",
    titleEn: "Publisher Agreement",
    titleZh: "发布者协议",
    descriptionEn:
      "Publisher agreement covering Skill manifests, review workflow, versioning, permissions, support obligations, paid-readiness metadata, and payout-preview status.",
    descriptionZh:
      "发布者协议，覆盖 Skill manifest、审核流程、版本、权限、支持责任、付费准备元数据和提现预览状态。",
    leadEn:
      "Publishers are responsible for accurate Skill contracts, safe runtime behavior, support paths, and versioned updates.",
    leadZh:
      "发布者需对准确的 Skill 契约、安全运行行为、支持路径和版本化更新负责。",
    sectionsEn: [
      ["Listing requirements", "Each Skill needs a manifest, version, runtime entrypoint, input/output schemas, permissions, examples, support path, and changelog."],
      ["Review and changes", "Verified versions should not mutate behavior in place. Submit new versions for schema, runtime, permission, pricing, or behavior changes."],
      ["Paid readiness", "Paid metadata can be prepared during preview, but production paid activation requires provider, finance, refund, and payout gates."],
      ["Support obligations", "Publishers should maintain support paths and communicate incidents, deprecations, and breaking changes."],
    ],
    sectionsZh: [
      ["上架要求", "每个 Skill 需要 manifest、版本、运行入口、输入/输出 schema、权限、示例、支持路径和更新记录。"],
      ["审核与变更", "已验证版本不应就地改变行为。schema、运行时、权限、价格或行为变化应提交新版本。"],
      ["付费准备", "预览阶段可准备付费元数据，但生产付费激活需要支付、财务、退款和提现门禁。"],
      ["支持责任", "发布者应维护支持路径，并说明事故、废弃和破坏性变更。"],
    ],
  }),
  "refund-policy": legalPage({
    path: "/refund-policy",
    titleEn: "Refund Policy",
    titleZh: "退款政策",
    descriptionEn:
      "SkillHub refund policy for Launch Preview, paid marketplace prelaunch status, future refunds, disputes, and support escalation.",
    descriptionZh:
      "SkillHub 退款政策，说明公开预览、付费市场预发布、未来退款、争议和支持升级路径。",
    leadEn:
      "During Launch Preview, public pages must not imply live payment capture unless a provider flow is explicitly configured.",
    leadZh:
      "公开预览阶段，除非支付渠道明确配置，公开页面不应暗示真实扣款已经上线。",
    sectionsEn: [
      ["Preview status", "Public discovery and documentation are available. General paid capture, automated refunds, and automated payouts remain prelaunch."],
      ["Future refunds", "When paid capture is enabled, refund eligibility, windows, dispute handling, and provider timelines will be documented before launch."],
      ["Dispute records", "Refunds and disputes should create adjustment records that preserve the original transaction trail."],
      ["How to ask", `For billing-preview questions, contact ${companyInfo.supportEmail} and include account email, URL, order reference if available, and reproduction steps.`],
    ],
    sectionsZh: [
      ["预览状态", "公开发现和文档已开放。通用付费扣款、自动退款和自动提现仍是预发布状态。"],
      ["未来退款", "付费扣款启用时，会在上线前说明退款条件、窗口、争议处理和渠道时效。"],
      ["争议记录", "退款和争议应创建调整记录，保留原始交易轨迹。"],
      ["如何咨询", `账务预览问题请联系 ${companyInfo.supportEmail}，并提供账号邮箱、页面 URL、可用订单引用和复现步骤。`],
    ],
  }),
  "acceptable-use": legalPage({
    path: "/acceptable-use",
    titleEn: "Acceptable Use Policy",
    titleZh: "可接受使用政策",
    descriptionEn:
      "SkillHub acceptable use policy for Skills, publishers, runtime invocation, marketplace trust, abuse reporting, and restricted behavior.",
    descriptionZh:
      "SkillHub 可接受使用政策，覆盖 Skill、发布者、运行调用、市场信任、滥用举报和受限行为。",
    leadEn:
      "SkillHub is built for inspectable, governed Agent capabilities. Abuse, undeclared permissions, and unsafe automation are not allowed.",
    leadZh:
      "SkillHub 面向可检查、可治理的 Agent 能力。滥用、未声明权限和不安全自动化不被允许。",
    sectionsEn: [
      ["Allowed use", "Build, publish, inspect, and run Skills for legitimate developer, research, support, data, automation, and operational workflows."],
      ["Restricted behavior", "No credential theft, malware, spam, unauthorized scraping, evasion, destructive actions, or hidden payment behavior."],
      ["Publisher accuracy", "Permissions, data retention, runtime behavior, examples, and support paths must be accurately declared."],
      ["Abuse response", "SkillHub may restrict, suspend, remove, or suppress distribution when trust or safety risks appear."],
    ],
    sectionsZh: [
      ["允许使用", "为合法的开发、研究、支持、数据、自动化和运营流程构建、发布、检查和运行 Skill。"],
      ["受限行为", "禁止凭据窃取、恶意软件、垃圾信息、未授权抓取、规避、破坏性动作或隐藏支付行为。"],
      ["发布者准确性", "权限、数据保留、运行行为、示例和支持路径必须准确声明。"],
      ["滥用响应", "出现信任或安全风险时，SkillHub 可限制、暂停、移除或压制分发。"],
    ],
  }),
  "security-disclosure": legalPage({
    path: "/security-disclosure",
    titleEn: "Security Disclosure",
    titleZh: "安全披露",
    descriptionEn:
      "SkillHub responsible security disclosure process, report template, safe testing boundaries, response expectations, and secure contact route.",
    descriptionZh:
      "SkillHub 负责任安全披露流程、报告模板、安全测试边界、响应预期和安全联系方式。",
    leadEn:
      "Request a secure disclosure channel before sharing exploit details, secrets, customer data, or proof-of-concept payloads.",
    leadZh:
      "在共享利用细节、密钥、客户数据或 PoC payload 前，请先请求安全披露渠道。",
    sectionsEn: [
      ["How to report", `Contact ${companyInfo.supportEmail} with a summary, affected area, impact, and a request for secure disclosure routing.`],
      ["What to include", "Affected URL or Skill ID, steps to reproduce without real secrets, expected and actual behavior, impact, evidence, and suggested fix."],
      ["What not to include", "Do not send passwords, private keys, OAuth secrets, Project Keys, customer data, or destructive proof-of-concept payloads through public channels."],
      ["Response process", "SkillHub aims to acknowledge reports, triage severity, mitigate critical issues, and publish guidance when appropriate."],
    ],
    sectionsZh: [
      ["如何报告", `请联系 ${companyInfo.supportEmail}，提供摘要、受影响范围、影响，并请求安全披露渠道。`],
      ["应包含什么", "受影响 URL 或 Skill ID、不含真实密钥的复现步骤、预期与实际结果、影响、证据和修复建议。"],
      ["不要包含什么", "不要通过公开渠道发送密码、私钥、OAuth secret、Project Key、客户数据或破坏性 PoC payload。"],
      ["响应流程", "SkillHub 会确认收到、分类严重程度、缓解关键问题，并在适当时发布说明。"],
    ],
  }),
  "cookie-policy": legalPage({
    path: "/cookie-policy",
    titleEn: "Cookie Policy",
    titleZh: "Cookie 政策",
    descriptionEn:
      "SkillHub cookie policy explaining essential session cookies, language preferences, security cookies, analytics readiness, and contact routes.",
    descriptionZh:
      "SkillHub Cookie 政策，说明必要会话 Cookie、语言偏好、安全 Cookie、分析接入准备和联系方式。",
    leadEn:
      "SkillHub uses only the cookies and local state needed for authentication, language preference, security, and operational readiness.",
    leadZh:
      "SkillHub 只使用认证、语言偏好、安全和运营准备所需的 Cookie 与本地状态。",
    sectionsEn: [
      ["Essential cookies", "Authentication and session cookies keep signed-in workspace, admin, developer, and publisher paths scoped to the right account."],
      ["Preferences", "Language choice and UI state may be stored to keep the bilingual experience consistent."],
      ["Analytics readiness", "Analytics data must be configured through approved providers and should not expose secrets or private user content."],
      ["Choices", "You can clear cookies in your browser. Some workspace features may require signing in again."],
    ],
    sectionsZh: [
      ["必要 Cookie", "认证和会话 Cookie 用于确保登录后的工作区、管理员、开发者和发布者路径归属正确账号。"],
      ["偏好", "语言选择和 UI 状态可能会被保存，以保持中英文体验一致。"],
      ["分析接入准备", "Analytics 数据必须通过批准渠道配置，不应暴露密钥或私有用户内容。"],
      ["选择", "你可以在浏览器中清除 Cookie。部分工作区功能可能需要重新登录。"],
    ],
  }),
  "subprocessors": legalPage({
    path: "/subprocessors",
    titleEn: "Subprocessors",
    titleZh: "子处理方",
    descriptionEn:
      "SkillHub subprocessors and provider categories for hosting, DNS/security, email delivery, analytics readiness, payments preview, and support operations.",
    descriptionZh:
      "SkillHub 子处理方和服务类别，包括托管、DNS/安全、邮件投递、分析准备、支付预览和支持运营。",
    leadEn:
      "This page lists provider categories used or planned for SkillHub operations without inventing compliance claims or customer commitments.",
    leadZh:
      "本页列出 SkillHub 运营使用或计划使用的服务类别，不编造合规声明或客户承诺。",
    sectionsEn: [
      ["Hosting and infrastructure", "SkillHub may use cloud hosting, database, cache, and deployment providers to operate public pages and workspaces."],
      ["DNS, security, and analytics", "Cloudflare-style DNS, security, and analytics data may support traffic health, country/region visibility, and abuse investigation."],
      ["Email and notifications", "Email providers may deliver account, review, runtime, billing-preview, payout-preview, and security notifications after configuration."],
      ["Payments preview", "Stripe, Alipay, PayPal, or other payment providers are treated as prelaunch until production payment capture and payout workflows are explicitly enabled."],
    ],
    sectionsZh: [
      ["托管与基础设施", "SkillHub 可使用云托管、数据库、缓存和部署服务来运营公开页面和工作区。"],
      ["DNS、安全与分析", "Cloudflare 类 DNS、安全和分析数据可用于流量健康、国家/地区可见性和滥用调查。"],
      ["邮件与通知", "配置完成后，邮件服务可发送账号、审核、运行、账务预览、提现预览和安全通知。"],
      ["支付预览", "Stripe、Alipay、PayPal 或其他支付服务在生产扣款和提现流程明确启用前都视为预发布。"],
    ],
  }),
};

type LegalPageInput = {
  descriptionEn: string;
  descriptionZh: string;
  leadEn: string;
  leadZh: string;
  path: string;
  sectionsEn: Array<[string, string]>;
  sectionsZh: Array<[string, string]>;
  titleEn: string;
  titleZh: string;
};

function legalPage(input: LegalPageInput): PublicPageDefinition {
  return {
    active: "terms",
    indexable: true,
    layout: "legal",
    path: input.path,
    schema: "Article",
    seo: {
      en: { title: `SkillHub ${input.titleEn}`, description: input.descriptionEn },
      zh: { title: `SkillHub ${input.titleZh}`, description: input.descriptionZh },
    },
    en: {
      eyebrow: "Legal / Trust",
      title: input.titleEn,
      lead: input.leadEn,
      updated: "Updated: 2026-06-13",
      quickAnswer: `${supportLine}. ${businessLine}. ${addressLine}.`,
      primaryCta: { href: companyLinks.supportMailto, label: "Technical support" },
      secondaryCta: { href: "/contact", label: "Contact paths" },
      sections: [
        ...input.sectionsEn.map(([title, body]) => ({ title, body })),
        {
          title: "Company contact",
          body: "Use these official contact paths for legal, support, business, privacy, or security routing.",
          bullets: [supportLine, businessLine, addressLine],
        },
        {
          title: "Related policies",
          body: "Review the adjacent trust pages before relying on payment, publisher, privacy, or security workflows.",
          bullets: [
            "Marketplace Terms",
            "Publisher Agreement",
            "Refund Policy",
            "Acceptable Use",
            "Security Disclosure",
            "Privacy Policy",
            "Terms",
          ],
        },
      ],
    },
    zh: {
      eyebrow: "法律 / 信任",
      title: input.titleZh,
      lead: input.leadZh,
      updated: "更新日期：2026-06-13",
      quickAnswer: `${supportLineZh}。${businessLineZh}。${addressLineZh}。`,
      primaryCta: { href: companyLinks.supportMailto, label: "技术支持" },
      secondaryCta: { href: "/contact", label: "联系路径" },
      sections: [
        ...input.sectionsZh.map(([title, body]) => ({ title, body })),
        {
          title: "公司联系方式",
          body: "法律、支持、商务、隐私或安全路由请使用以下官方联系路径。",
          bullets: [supportLineZh, businessLineZh, addressLineZh],
        },
        {
          title: "相关政策",
          body: "在依赖支付、发布者、隐私或安全流程前，请阅读相邻信任页面。",
          bullets: [
            "市场条款",
            "发布者协议",
            "退款政策",
            "可接受使用",
            "安全披露",
            "隐私政策",
            "服务条款",
          ],
        },
      ],
    },
  };
}
