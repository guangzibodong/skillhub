import registryStyles from "@/components/registry-v2.module.css";
import {
  ArrowRight,
  Boxes,
  Code2,
  ExternalLink,
  PackageCheck,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import type { SkillSummary } from "@useskillhub/schema";
import { AppShell } from "@/components/app-shell";
import {
  getLocaleFromSearchParams,
  localizedHref,
  type Locale,
} from "@/lib/i18n";
import {
  publicSkillDescription,
  publicSkillDisplayName,
  publicSkillTags,
} from "@/lib/public-skill-localization";
import { getSkills } from "@/lib/registry";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getPublicApiUrl } from "@/lib/api-url";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type RegistryCopy = (typeof registryCopy)[Locale];

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);

  return buildLocalizedMetadata({
    locale,
    path: "/registry",
    en: {
      title: "SkillHub Skill API - Public Contracts and Discovery",
      description:
        "Inspect public SkillHub skill contracts, manifests, schemas, permissions, runtime type, review status, and API discovery endpoints.",
    },
    zh: {
      title: "SkillHub 技能 API - 公开合约与发现端点",
      description:
        "查看 SkillHub 公开技能合约、manifest、schema、权限、运行时类型、审核状态和 API 发现端点。",
    },
  });
}

const registryCopy = {
  en: {
    actions: {
      api: "Open public API",
      docs: "Read API docs",
      marketplace: "Compare in Marketplace",
      submit: "Submit Skill",
    },
    heroEyebrow: "Public Skill API · Contract Registry",
    heroTitle: ["Let agents read contracts,", "then run safely."],
    heroBody:
      "Registry is not another search page. It records each Skill version, manifest, schema, permission, runtime, and review state so developers, publishers, and AI agents can inspect contract boundaries before invocation.",
    heroProof: [
      [
        "Contract first",
        "Versioned contracts come before public display and project adoption.",
      ],
      [
        "Machine-readable",
        "Agents can inspect slug, schema, runtime, permissions, and status.",
      ],
      [
        "Runtime gated",
        "Real calls require Project Keys, policy approval, and audit evidence.",
      ],
    ],
    console: {
      title: "support-triage · v0.1.0",
      status: "verified contract",
      body: "Classifies support tickets by priority, topic, and recommended response. Public contract inspection is available; runtime requires project adoption.",
      endpoint: "https://api.useskillhub.com/v1/skills/support-triage",
      input: [
        "Input schema",
        "ticketText: string",
        "Customer message or support ticket body.",
      ],
      output: [
        "Output schema",
        "priority · category · reply",
        "Structured output for the next agent step.",
      ],
      permissions: [
        "Permissions",
        "network: false",
        "No browser, filesystem, or secrets.",
      ],
      runtime: [
        "Runtime",
        "HTTP endpoint",
        "Resolved through the governed gateway after project adoption.",
      ],
      signals:
        "Public Skills, verified contracts, MCP contracts, and call records come from the live registry.",
      runtimeBoundary:
        "Public pages only inspect contracts. Project adoption, Project Keys, budgets, limits, and logs live in the signed-in workspace.",
      marketplaceBoundary:
        "Search, filters, pricing intent, examples, and publisher comparison belong to Marketplace; Registry keeps the API contract view.",
      signalTitle: "Registry signals",
      runtimeTitle: "Runtime boundary",
      marketplaceTitle: "Marketplace boundary",
      consoleLabel: "Registry contract console",
      topPath: "skillhub://registry/contracts/support-triage",
      liveApi: "live API",
      get: "GET",
      meterManifest: "manifest",
      meterSchema: "schema",
      meterRisk: "risk",
      ok: "ok",
      low: "low",
    },
    fit: {
      eyebrow: "Where Registry Fits",
      title:
        "Separate finding Skills, reading contracts, and running projects.",
      body: "Visitors should not see a duplicate marketplace here. This page explains SkillHub's protocol layer: what is public, what is reviewed, and what requires signed-in project runtime.",
      cards: [
        [
          "Marketplace",
          "Human discovery: categories, search, pricing intent, publisher trust, examples, and adoption comparison.",
          ["search", "pricing", "publisher"],
        ],
        [
          "Skill API",
          "Agent and system contract layer: slug, version, schema, runtime, permissions, review state, and endpoints.",
          ["manifest", "schema", "permissions"],
        ],
        [
          "Workspace runtime",
          "Real adoption and execution: project install, version pinning, Project Key, policy approval, logs, and usage.",
          ["project key", "policy", "logs"],
        ],
      ],
    },
    lifecycle: {
      eyebrow: "Contract Lifecycle",
      title: "Every step from publisher contract to agent call has state.",
      body: "Registry turns Skills into inspectable operating records, not marketing cards. Agents can call them only after the project path pins a version and applies policy.",
      steps: [
        [
          "Draft",
          "Publisher saves manifest, schema, permissions, runtime, examples, and support details.",
        ],
        [
          "Review",
          "Automated checks and human review evaluate version, risk, examples, and runtime boundaries.",
        ],
        [
          "Verified",
          "Approved versions become public contracts for developers and agents to inspect.",
        ],
        [
          "Adopt",
          "Signed-in projects pin the version, approve policy, and create a Project Key.",
        ],
        [
          "Invoke",
          "REST or MCP calls pass through the gateway and leave invocation, usage, and audit records.",
        ],
      ],
    },
    manifest: {
      eyebrow: "Manifest Quality Bar",
      title: "Every Skill contract must answer six questions.",
      body: "This makes clear why a Skill can be read by agents, reviewed by teams, and adopted by projects.",
      fields: [
        [
          "Identity",
          "Who is it?",
          "name, displayName, semantic version, category, tags, support, and changelog.",
        ],
        [
          "Runtime",
          "Where does it run?",
          "HTTP, MCP, or restricted local runtime, including target, transport, and health posture.",
        ],
        [
          "Schema",
          "What are inputs and outputs?",
          "inputSchema, outputSchema, required fields, examples, and typed result shape.",
        ],
        [
          "Permission",
          "What can it access?",
          "Network, browser, filesystem, secrets, sensitive data, and write/payment workflow boundaries.",
        ],
        [
          "Trust",
          "Has it been reviewed?",
          "Review status, checks, incidents, feedback, deprecation, and replacement path.",
        ],
        [
          "Commercial",
          "Can it enter paid marketplace?",
          "Billing model, price intent, publisher terms, and finance-reviewed readiness.",
        ],
      ],
      policies: [
        [
          "Public pages do not fake supply",
          "Production-like environments show live API results. Missing core registry tables render an empty state, not fake Skills.",
        ],
        [
          "High-risk actions require project policy",
          "CRM write-back, publishing, payment, file writes, and sensitive data handling need Project Keys, policy, and approval boundaries.",
        ],
        [
          "Agent-readable is not automatically runnable",
          "Agents can inspect public contracts; runtime still goes through install, version pinning, budgets, limits, and logs.",
        ],
      ],
    },
    quickstart: {
      eyebrow: "API Quickstart",
      title: "Inspect contracts first, then run inside a project.",
      body: "Public API endpoints are for discovery and inspection. Real runtime starts only after a team adopts a Skill into a project, pins a version, and creates a Project Key.",
      tags: [
        "public discovery",
        "manifest inspection",
        "project-gated runtime",
      ],
      comment: "Runtime starts after sign-in:",
      flow: "create project -> approve policy -> generate Project Key -> REST / MCP call",
      terminal: "terminal",
      endpoints: "public endpoints",
    },
    rows: {
      eyebrow: "Live Skill API Rows",
      title: "Versioned Skill contracts returned by the public API.",
      body: "The rows stay connected to live registry data while the page keeps search and comparison in Marketplace or API parameters.",
      emptyTitle: "No public Skill contracts yet",
      emptyBody:
        "The public registry returned no Skills. Production-like deployments should show an empty state rather than fake supply.",
      columns: ["Skill contract", "Runtime", "Review", "Risk", "Action"],
      manifest: "manifest",
      openManifest: "Open manifest",
      aria: "Live Skill API contract rows",
    },
    closing: {
      title:
        "Make Skills trusted contracts before they become runtime capabilities.",
      body: "Registry explains capability boundaries; Marketplace supports discovery and comparison; Workspace controls project adoption and call permissions and logs.",
    },
    metrics: {
      publicSkills: "Public Skills",
      totalSkillRecords: "Total records",
      verifiedSkills: "Verified",
      callableSkills: "Callable",
    },
    riskLabels: { high: "High", low: "Low", medium: "Medium" },
    statusLabels: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified",
    },
  },
  zh: {
    actions: {
      api: "打开公开 API",
      docs: "阅读 API 文档",
      marketplace: "去 Marketplace 对比",
      submit: "提交 Skill",
    },
    heroEyebrow: "Public Skill API · Contract Registry",
    heroTitle: ["让 Agent 先读合约，", "再安全运行。"],
    heroBody:
      "Registry 不是另一个搜索页。它记录每个 Skill 的版本、manifest、schema、权限、运行时和审核状态，让开发者、发布者和 AI Agent 在调用前先检查能力边界。",
    heroProof: [
      ["合约优先", "先有版本化合约，再进入公开展示和项目采用。"],
      ["机器可读", "Agent 可以读取 slug、schema、runtime、权限和状态。"],
      ["运行受控", "真实调用需要 Project Key、策略审批和审计记录。"],
    ],
    console: {
      title: "support-triage · v0.1.0",
      status: "已验证合约",
      body: "将客服消息分类为优先级、主题和建议回复。公开页面可检查合约，真实运行需要项目接入。",
      endpoint: "https://api.useskillhub.com/v1/skills/support-triage",
      input: [
        "Input schema",
        "ticketText: string",
        "客户消息或工单正文，作为分类与回复建议的输入。",
      ],
      output: [
        "Output schema",
        "priority · category · reply",
        "输出结构化结果，方便 Agent 决定下一步动作。",
      ],
      permissions: [
        "Permissions",
        "network: false",
        "无浏览器、无文件系统、无 secret，风险边界可审查。",
      ],
      runtime: [
        "Runtime",
        "HTTP endpoint",
        "项目采用后通过治理网关解析版本和策略。",
      ],
      signals:
        "公开 Skill、已验证合约、MCP 合约和调用记录来自 live registry，不用假数据填充。",
      runtimeBoundary:
        "公开页面只负责检查合约。项目采用、Project Key、预算、限流和调用日志在登录后的工作台完成。",
      marketplaceBoundary:
        "搜索、筛选、价格意图、示例和发布者对比属于 Marketplace；这里保留 API 合约视角。",
      signalTitle: "Registry 信号",
      runtimeTitle: "运行边界",
      marketplaceTitle: "市场边界",
      consoleLabel: "Registry 合约控制台",
      topPath: "skillhub://registry/contracts/support-triage",
      liveApi: "live API",
      get: "GET",
      meterManifest: "manifest",
      meterSchema: "schema",
      meterRisk: "risk",
      ok: "ok",
      low: "low",
    },
    fit: {
      eyebrow: "Registry 的位置",
      title: "把“找技能、读合约、接入运行”的边界讲清楚。",
      body: "用户来到 Registry 时，不应该再看到一个重复的筛选市场。这里解释 SkillHub 的协议层：哪些字段公开可读，哪些状态来自审核，哪些动作必须进入项目工作台。",
      cards: [
        [
          "Marketplace",
          "给人看的发现入口：分类、搜索、价格意图、发布者信任、示例和采用对比。",
          ["search", "pricing", "publisher"],
        ],
        [
          "Skill API",
          "给 Agent 和系统看的合约层：slug、version、schema、runtime、权限、审核状态和 endpoint。",
          ["manifest", "schema", "permissions"],
        ],
        [
          "Workspace runtime",
          "真实采用和运行：项目安装、版本固定、Project Key、策略审批、调用日志和用量记录。",
          ["project key", "policy", "logs"],
        ],
      ],
    },
    lifecycle: {
      eyebrow: "合约生命周期",
      title: "从发布合约到 Agent 调用，每一步都有状态。",
      body: "Registry 的价值不是展示更多卡片，而是让 Skill 从草稿、审核、批准、项目采用到运行调用都有可检查状态。这样 Agent 能调用，团队也能审查。",
      steps: [
        [
          "Draft",
          "发布者保存 manifest、schema、权限、运行时、示例和支持信息。",
        ],
        ["Review", "自动检查和人工审核确认版本、风险、示例和运行边界。"],
        ["Verified", "已验证版本进入公开合约层，可供开发者和 Agent 检查。"],
        ["Adopt", "登录后的项目固定版本，审批策略并生成 Project Key。"],
        ["Invoke", "REST 或 MCP 调用经过网关，保留调用、用量和审计记录。"],
      ],
    },
    manifest: {
      eyebrow: "Manifest 质量线",
      title: "每个 Skill 合约必须回答六个问题。",
      body: "这让页面真正解释 SkillHub 的规则：一个 Skill 为什么可以被 Agent 读取、被团队审查、被项目采用。",
      fields: [
        [
          "Identity",
          "它是谁？",
          "name、displayName、语义化版本、分类、标签、支持和变更记录。",
        ],
        [
          "Runtime",
          "在哪里运行？",
          "HTTP、MCP 或受限本地运行时，以及目标、传输和健康状态。",
        ],
        [
          "Schema",
          "输入输出是什么？",
          "inputSchema、outputSchema、必填字段、示例和类型化结果。",
        ],
        [
          "Permission",
          "能访问什么？",
          "网络、浏览器、文件系统、secret、敏感数据和写回动作边界。",
        ],
        [
          "Trust",
          "是否被审查？",
          "审核状态、检查结果、事件、反馈、弃用和替代路径。",
        ],
        [
          "Commercial",
          "能否进入付费预览？",
          "计费模型、价格意图、发布者条款和财务准备状态。",
        ],
      ],
      policies: [
        [
          "公开页面不会伪造供给",
          "生产类环境只展示 live API 结果。缺少核心 registry 表时显示空状态，而不是填充假 Skill。",
        ],
        [
          "高风险动作必须进入项目策略",
          "写回 CRM、发布内容、支付、文件写入和敏感数据处理，需要 Project Key、策略和人工审批边界。",
        ],
        [
          "Agent 可读不等于自动运行",
          "Agent 可以检查公开合约；真实调用仍经过安装、版本固定、预算、限流和日志。",
        ],
      ],
    },
    quickstart: {
      eyebrow: "API Quickstart",
      title: "先查合约，再进项目运行。",
      body: "公开 API 用于发现和检查，不需要登录。只有当团队要把 Skill 接入项目、固定版本、生成 Key 并运行时，才进入工作台。",
      tags: [
        "public discovery",
        "manifest inspection",
        "project-gated runtime",
      ],
      comment: "真实运行从登录后开始：",
      flow: "创建项目 -> 审批策略 -> 生成 Project Key -> REST / MCP 调用",
      terminal: "terminal",
      endpoints: "public endpoints",
    },
    rows: {
      eyebrow: "Live Skill API Rows",
      title: "公开 API 返回的版本化 Skill 合约。",
      body: "这里保留实时 registry 数据，但视觉上更像 API 输出而不是普通内容列表。搜索和筛选仍交给 Marketplace 或 API 参数。",
      emptyTitle: "暂无公开 Skill 合约",
      emptyBody:
        "公开 registry 当前没有返回 Skill。生产类部署应显示空状态，而不是用假数据填充。",
      columns: ["Skill contract", "Runtime", "Review", "Risk", "Action"],
      manifest: "manifest",
      openManifest: "打开 manifest",
      aria: "实时 Skill API 合约行",
    },
    closing: {
      title: "让 Skill 先成为可信合约，再成为可运行能力。",
      body: "Registry 负责把能力边界讲清楚；Marketplace 负责发现和比较；Workspace 负责项目采用与调用权限与记录。",
    },
    metrics: {
      publicSkills: "公开 Skill",
      totalSkillRecords: "总记录",
      verifiedSkills: "已验证",
      callableSkills: "可调用",
    },
    riskLabels: { high: "高", low: "低", medium: "中" },
    statusLabels: {
      deprecated: "已弃用",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证",
    },
  },
} as const;

const manifestSnippet = `{
  "name": "support-triage",
  "version": "0.1.0",
  "runtime": { "type": "http" },
  "permissions": {
    "network": false,
    "browser": false,
    "filesystem": "none",
    "secrets": []
  }
}`;

export default async function RegistryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const apiUrl =
    getPublicApiUrl();
  const copy = registryCopy[locale];
  const skills = await getSkills();
  const registryMetrics = getRegistryMetrics(skills);

  const visibleMetrics = [
    {
      label: copy.metrics.publicSkills,
      value: String(registryMetrics.publicSkills),
    },
    {
      label: copy.metrics.totalSkillRecords,
      value: String(registryMetrics.totalSkillRecords),
    },
    {
      label: copy.metrics.verifiedSkills,
      value: String(registryMetrics.verifiedSkills),
    },
    {
      label: copy.metrics.callableSkills,
      value: String(registryMetrics.callableSkills),
    },
  ];

  return (
    <AppShell active="registry" locale={locale}>
      <main className={`registry-v2 ${registryStyles.registryStyles}`}>
        <section className="registry-v2-hero">
          <div className="registry-v2-shell registry-v2-hero__grid">
            <div className="registry-v2-hero__copy">
              <span className="registry-v2-eyebrow">
                <span aria-hidden="true" />
                {copy.heroEyebrow}
              </span>
              <h1>
                {copy.heroTitle.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p>{copy.heroBody}</p>
              <div className="registry-v2-actions">
                <a
                  className="registry-v2-button registry-v2-button--primary"
                  href={`${apiUrl}/v1/skills/search?limit=20`}
                >
                  <Code2 size={16} aria-hidden="true" />
                  <span>{copy.actions.api}</span>
                </a>
                <a
                  className="registry-v2-button"
                  href={localizedHref("/marketplace", locale)}
                >
                  <ArrowRight size={16} aria-hidden="true" />
                  <span>{copy.actions.marketplace}</span>
                </a>
                <a
                  className="registry-v2-button registry-v2-button--quiet"
                  href={localizedHref("/publish", locale)}
                >
                  <Plus size={16} aria-hidden="true" />
                  <span>{copy.actions.submit}</span>
                </a>
              </div>
              <div className="registry-v2-proof">
                {copy.heroProof.map(([title, body]) => (
                  <article className="registry-v2-proof-card" key={title}>
                    <strong>{title}</strong>
                    <span>{body}</span>
                  </article>
                ))}
              </div>
            </div>

            <RegistryConsole apiUrl={apiUrl} copy={copy} />
          </div>
        </section>

        <section className="registry-v2-section">
          <div className="registry-v2-shell">
            <SectionHeading
              body={copy.manifest.body}
              eyebrow={copy.manifest.eyebrow}
              title={copy.manifest.title}
            />
            <div className="registry-v2-manifest-layout">
              <div className="registry-v2-field-grid">
                {copy.manifest.fields.map(([eyebrow, title, body]) => (
                  <article className="registry-v2-field" key={eyebrow}>
                    <small>{eyebrow}</small>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </article>
                ))}
              </div>
              <aside className="registry-v2-policy-stack">
                {copy.manifest.policies.map(([title, body]) => (
                  <article className="registry-v2-policy" key={title}>
                    <ShieldCheck size={16} aria-hidden="true" />
                    <div>
                      <strong>{title}</strong>
                      <p>{body}</p>
                    </div>
                  </article>
                ))}
              </aside>
            </div>
          </div>
        </section>

        <section className="registry-v2-section">
          <div className="registry-v2-shell registry-v2-quickstart">
            <article className="registry-v2-card registry-v2-quickstart__copy">
              <span className="registry-v2-eyebrow">
                <span aria-hidden="true" />
                {copy.quickstart.eyebrow}
              </span>
              <h2>{copy.quickstart.title}</h2>
              <p>{copy.quickstart.body}</p>
              <div className="registry-v2-tags">
                {copy.quickstart.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
            <article className="registry-v2-terminal">
              <div className="registry-v2-terminal__head">
                <span>{copy.quickstart.terminal}</span>
                <span>{copy.quickstart.endpoints}</span>
              </div>
              <pre>
                <code>{`curl "${apiUrl}/v1/skills/search?limit=20"\n\ncurl "${apiUrl}/v1/skills/browser-research"\n\n# ${copy.quickstart.comment}\n# ${copy.quickstart.flow}`}</code>
              </pre>
            </article>
          </div>
        </section>

        <section className="registry-v2-section">
          <div className="registry-v2-shell">
            <SectionHeading
              body={copy.rows.body}
              eyebrow={copy.rows.eyebrow}
              title={copy.rows.title}
            />
            <div className="registry-v2-metrics" aria-label={copy.rows.eyebrow}>
              {visibleMetrics.map((metric) => (
                <div className="registry-v2-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
            <RegistryRows
              apiUrl={apiUrl}
              copy={copy}
              locale={locale}
              skills={skills}
            />
          </div>
        </section>

      </main>
    </AppShell>
  );
}

function getRegistryMetrics(skills: SkillSummary[]) {
  const publicSkills = skills.filter(
    (skill) =>
      skill.verificationStatus === "verified" ||
      skill.verificationStatus === "submitted" ||
      skill.verificationStatus === "deprecated",
  );
  const verifiedSkills = publicSkills.filter(
    (skill) => skill.verificationStatus === "verified",
  );

  return {
    callableSkills: verifiedSkills.length,
    publicSkills: publicSkills.length,
    totalSkillRecords: skills.length,
    verifiedSkills: verifiedSkills.length,
  };
}

function SectionHeading({
  body,
  eyebrow,
  title,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="registry-v2-section-heading">
      <div>
        <span className="registry-v2-eyebrow">
          <span aria-hidden="true" />
          {eyebrow}
        </span>
        <h2>{title}</h2>
      </div>
      <p>{body}</p>
    </div>
  );
}

function RegistryConsole({
  apiUrl,
  copy,
}: {
  apiUrl: string;
  copy: RegistryCopy;
}) {
  const endpoint = copy.console.endpoint.replace(
    "https://api.useskillhub.com",
    apiUrl,
  );

  return (
    <aside
      className="registry-v2-console"
      aria-label={copy.console.consoleLabel}
    >
      <div className="registry-v2-console__top">
        <span className="registry-v2-window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>{copy.console.topPath}</span>
        <span>{copy.console.liveApi}</span>
      </div>
      <div className="registry-v2-console__body">
        <div className="registry-v2-contract-main">
          <div className="registry-v2-contract-head">
            <div>
              <h2>{copy.console.title}</h2>
              <p>{copy.console.body}</p>
            </div>
            <span className="registry-v2-status-pill">
              <span aria-hidden="true" />
              {copy.console.status}
            </span>
          </div>
          <div className="registry-v2-api-line">
            <strong>{copy.console.get}</strong>
            <span>{endpoint}</span>
          </div>
          <div className="registry-v2-schema-grid">
            {[
              copy.console.input,
              copy.console.output,
              copy.console.permissions,
              copy.console.runtime,
            ].map(([eyebrow, title, body]) => (
              <article className="registry-v2-schema-box" key={eyebrow}>
                <small>{eyebrow}</small>
                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
          <div className="registry-v2-code-preview">
            <pre>
              <code>{manifestSnippet}</code>
            </pre>
          </div>
        </div>
        <div className="registry-v2-contract-side">
          <div className="registry-v2-side-block">
            <h3>{copy.console.signalTitle}</h3>
            <p>{copy.console.signals}</p>
            <div className="registry-v2-meter" aria-hidden="true">
              <MeterRow
                label={copy.console.meterManifest}
                value={copy.console.ok}
                width="92%"
              />
              <MeterRow
                label={copy.console.meterSchema}
                value={copy.console.ok}
                width="86%"
              />
              <MeterRow
                label={copy.console.meterRisk}
                tone="warning"
                value={copy.console.low}
                width="34%"
              />
            </div>
          </div>
          <div className="registry-v2-side-block">
            <h3>{copy.console.runtimeTitle}</h3>
            <p>{copy.console.runtimeBoundary}</p>
          </div>
          <div className="registry-v2-side-block">
            <h3>{copy.console.marketplaceTitle}</h3>
            <p>{copy.console.marketplaceBoundary}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MeterRow({
  label,
  tone,
  value,
  width,
}: {
  label: string;
  tone?: "warning";
  value: string;
  width: string;
}) {
  return (
    <div className="registry-v2-meter-row">
      <span>{label}</span>
      <div>
        <span
          className={
            tone === "warning"
              ? "registry-v2-meter-row__bar registry-v2-meter-row__bar--warning"
              : "registry-v2-meter-row__bar"
          }
          style={{ width }}
        />
      </div>
      <span>{value}</span>
    </div>
  );
}

function RegistryRows({
  apiUrl,
  copy,
  locale,
  skills,
}: {
  apiUrl: string;
  copy: RegistryCopy;
  locale: Locale;
  skills: SkillSummary[];
}) {
  if (skills.length === 0) {
    return (
      <div className="registry-v2-empty">
        <Boxes size={22} aria-hidden="true" />
        <h3>{copy.rows.emptyTitle}</h3>
        <p>{copy.rows.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="registry-v2-rows-panel" aria-label={copy.rows.aria}>
      <div className="registry-v2-row-head">
        {copy.rows.columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      {skills.slice(0, 8).map((skill) => {
        const displayName = publicSkillDisplayName(
          skill.slug,
          skill.displayName,
        )[locale];
        const description = publicSkillDescription(
          skill.slug,
          skill.description,
        )[locale];
        const tags = publicSkillTags(skill.slug, skill.tags)[locale];
        const runtime = skill.runtimeType
          ? skill.runtimeType.toUpperCase()
          : "HTTP";
        const review = copy.statusLabels[skill.verificationStatus];
        const risk = copy.riskLabels[skill.permissionLevel];

        return (
          <article className="registry-v2-skill-row" key={skill.id}>
            <div className="registry-v2-skill-title">
              <span className="registry-v2-skill-icon" aria-hidden="true">
                <PackageCheck size={15} />
              </span>
              <div>
                <strong>
                  {displayName} · v{skill.version}
                </strong>
                <p>{description}</p>
                <div className="registry-v2-row-tags">
                  {tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <span data-label={copy.rows.columns[1]}>{runtime}</span>
            <span data-label={copy.rows.columns[2]}>
              <span
                className={`registry-v2-state registry-v2-state--${skill.verificationStatus}`}
              >
                {review}
              </span>
            </span>
            <span data-label={copy.rows.columns[3]}>{risk}</span>
            <span data-label={copy.rows.columns[4]}>
              <a
                href={`${apiUrl}/v1/skills/${skill.slug}`}
                aria-label={`${copy.rows.openManifest}: ${displayName}`}
              >
                <span>{copy.rows.manifest}</span>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </span>
          </article>
        );
      })}
    </div>
  );
}
