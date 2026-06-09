import {
  ArrowRight,
  Boxes,
  Braces,
  Code2,
  Database,
  FileJson,
  GitBranch,
  Network,
  Plus,
  RadioTower,
  ShieldCheck,
  Terminal
} from "lucide-react";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
import { SiteHeader } from "@/components/site-header";
import { SkillTable } from "@/components/skill-table";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { getPublicPlatformStats } from "@/lib/public-platform-stats";
import { getSkills } from "@/lib/registry";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const registryProtocolCopy = {
  en: {
    actions: {
      api: "Open API docs",
      marketplace: "Compare in marketplace"
    },
    contractTitle: "What the registry records",
    evidence: {
      calls: "Registry calls",
      highRisk: "High-risk contracts",
      mcp: "MCP contracts",
      verified: "Verified contracts"
    },
    heroProof: [
      ["Contract first", "Every skill starts as a versioned manifest before it becomes a marketplace listing."],
      ["Gateway governed", "REST, MCP, SDK, and console tests all resolve the same version and policy state."],
      ["Audit ready", "Review, install, runtime, ledger, payout, delivery, and audit records stay connected."]
    ],
    lifecycleTitle: "Contract lifecycle",
    lifecycle: [
      ["Draft", "Publisher saves identity, runtime, permissions, schemas, examples, and pricing intent."],
      ["Review", "Automated manifest/runtime/example/security checks feed a human decision with SLA."],
      ["Approved", "Verified versions become the default public install target and are immutable."],
      ["Runtime", "Projects pin versions, approve policy, create keys, and invoke through the governed gateway."],
      ["Commercial", "Billable usage posts transactions, commission splits, balances, refunds, disputes, and payout state."]
    ],
    manifestTitle: "Manifest quality bar",
    manifestFields: [
      ["Identity", "name, displayName, semantic version, category, tags, support, changelog"],
      ["Runtime", "http, mcp, or restricted local runtime with target, transport, and health posture"],
      ["Schemas", "inputSchema, outputSchema, examples, required fields, typed result shape"],
      ["Permissions", "network, browser, filesystem, secrets, sensitive data, destructive/payment workflows"],
      ["Commercial", "billing model, paid activation blockers, publisher terms, payout readiness"],
      ["Trust", "review status, checks, incidents, feedback, deprecation and replacement path"]
    ],
    notes: [
      "Public registry rows are live API results; production-like runtimes do not fill fake supply unless demo fallback is explicitly enabled.",
      "The registry explains contracts. Marketplace pages explain discovery, buyer comparison, pricing, and publisher trust.",
      "A search field that does not change state is intentionally avoided here; use marketplace filters or the public API endpoint."
    ],
    protocolEyebrow: "Registry protocol",
    protocolTitle: "The registry is the contract layer behind the marketplace.",
    protocolBody:
      "SkillHub records the exact skill contract an AI agent can install and call: manifest, version, runtime, permissions, schemas, review state, pricing intent, and governance links.",
    runtimeTitle: "Runtime resolution",
    runtimeSteps: [
      "Agent or developer selects a public skill slug.",
      "Project install pins an approved version and policy.",
      "REST or MCP call authenticates a project key.",
      "Gateway checks approval, budget, rate limit, subscription, and risk.",
      "Invocation, usage, notification, ledger, and audit records preserve the outcome."
    ],
    tableEyebrow: "Live registry",
    tableTitle: "Versioned contracts available through the API"
  },
  zh: {
    actions: {
      api: "打开 API 文档",
      marketplace: "去市场对比"
    },
    contractTitle: "注册表记录什么",
    evidence: {
      calls: "注册表调用",
      highRisk: "高风险合约",
      mcp: "MCP 合约",
      verified: "已验证合约"
    },
    heroProof: [
      ["合约优先", "每个技能先成为带版本的 manifest，再进入市场展示。"],
      ["网关治理", "REST、MCP、SDK 和控制台测试都会解析同一套版本和策略状态。"],
      ["可审计", "审核、安装、运行、账本、提现、投递和审计记录保持连贯。"]
    ],
    lifecycleTitle: "合约生命周期",
    lifecycle: [
      ["草稿", "发布者保存身份、运行时、权限、schema、示例和定价意图。"],
      ["审核", "manifest/runtime/example/security 自动检查进入带 SLA 的人工决策。"],
      ["批准", "已验证版本成为默认公开安装目标，并且不可原地修改。"],
      ["运行", "项目固定版本、审批策略、创建 Key，并通过治理网关调用。"],
      ["商业化", "可计费用量写入交易、分成、余额、退款、争议和提现状态。"]
    ],
    manifestTitle: "Manifest 质量门槛",
    manifestFields: [
      ["身份", "name、displayName、语义化版本、分类、标签、支持路径、变更记录"],
      ["运行时", "HTTP、MCP 或受限本地运行时，包含目标、传输和健康状态"],
      ["Schema", "inputSchema、outputSchema、示例、必填字段和类型化结果"],
      ["权限", "网络、浏览器、文件系统、密钥、敏感数据、破坏性/支付流程"],
      ["商业化", "计费模型、付费激活阻断、发布者条款、提现准备度"],
      ["信任", "审核状态、检查、事故、反馈、废弃和替代路径"]
    ],
    notes: [
      "公开注册表只展示实时 API 结果；生产类环境不会用假供给填充，除非显式启用 demo fallback。",
      "注册表解释技能合约；市场页面负责发现、买方对比、定价和发布者信任。",
      "这里刻意不放无状态搜索框；需要筛选请使用市场筛选或公开 API endpoint。"
    ],
    protocolEyebrow: "注册表协议",
    protocolTitle: "注册表是市场背后的技能合约层。",
    protocolBody:
      "SkillHub 记录 AI 智能体可以安装和调用的精确技能合约：manifest、版本、运行时、权限、schema、审核状态、定价意图和治理链路。",
    runtimeTitle: "运行解析路径",
    runtimeSteps: [
      "Agent 或开发者选择公开 skill slug。",
      "项目安装固定已批准版本和策略。",
      "REST 或 MCP 调用验证项目 Key。",
      "网关检查审批、预算、限流、订阅和风险。",
      "调用、用量、通知、账本和审计记录保留结果。"
    ],
    tableEyebrow: "实时注册表",
    tableTitle: "可通过 API 获取的版本化技能合约"
  }
} as const;

const manifestSnippet = `{
  "schemaVersion": "0.1",
  "name": "support-triage",
  "displayName": "Support Triage",
  "version": "0.1.0",
  "runtime": { "type": "http" },
  "permissions": {
    "network": false,
    "browser": false,
    "filesystem": "none",
    "secrets": []
  },
  "inputSchema": { "type": "object" },
  "outputSchema": { "type": "object" }
}`;

export default async function RegistryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = registryProtocolCopy[locale];
  const skills = await getSkills();
  const publicStats = await getPublicPlatformStats({ skills });
  const highRiskSkills = skills.filter((skill) => skill.permissionLevel === "high").length;
  const mcpSkills = skills.filter((skill) => skill.runtimeType === "mcp").length;
  const visibleMetrics = [
    { label: dictionary.metrics.publishedSkills, value: String(publicStats.publicSkills) },
    { label: dictionary.metrics.totalSkillRecords, value: String(publicStats.totalSkillRecords) },
    { label: dictionary.metrics.verified, value: String(publicStats.verifiedSkills) },
    { label: dictionary.metrics.callableSkills, value: String(publicStats.callableSkills) }
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="registry" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/registry" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <Boxes size={16} aria-hidden="true" />
            <span>{dictionary.registryPage.eyebrow}</span>
          </div>
          <h1>{dictionary.registryPage.title}</h1>
          <p>{dictionary.registryPage.description}</p>
        </div>
        <div className="page-hero__actions">
          <a className="primary-button primary-button--large" href={localizedHref("/publish", locale)}>
            <Plus size={18} aria-hidden="true" />
            <span>{dictionary.home.newSkill}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/marketplace", locale)}>
            <ArrowRight size={18} aria-hidden="true" />
            <span>{labels.actions.marketplace}</span>
          </a>
        </div>
      </section>

      <section className="registry-protocol-board" aria-labelledby="registry-protocol-heading">
        <div className="registry-protocol-copy">
          <div className="card-kicker">
            <Database size={16} aria-hidden="true" />
            <span>{labels.protocolEyebrow}</span>
          </div>
          <h2 id="registry-protocol-heading">{labels.protocolTitle}</h2>
          <p>{labels.protocolBody}</p>
        </div>
        <div className="registry-proof-grid">
          {labels.heroProof.map(([title, body], index) => {
            const Icon = index === 0 ? FileJson : index === 1 ? Network : ShieldCheck;

            return (
              <article className="registry-proof-card" key={title}>
                <Icon size={17} aria-hidden="true" />
                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            );
          })}
        </div>
      </section>

      <OperatingEvidenceChain
        focus="platform"
        locale={locale}
        stats={[
          { label: labels.evidence.verified, tone: publicStats.verifiedSkills > 0 ? "good" : "attention", value: String(publicStats.verifiedSkills) },
          { label: labels.evidence.highRisk, tone: highRiskSkills > 0 ? "attention" : "neutral", value: String(highRiskSkills) },
          { label: labels.evidence.mcp, value: String(mcpSkills) },
          { label: labels.evidence.calls, value: String(publicStats.recordedCalls) }
        ]}
      />

      <section className="registry-contract-section" aria-labelledby="registry-contract-heading">
        <article className="registry-contract-panel">
          <div className="card-kicker">
            <Braces size={16} aria-hidden="true" />
            <span>{labels.contractTitle}</span>
          </div>
          <h2 id="registry-contract-heading">{labels.manifestTitle}</h2>
          <div className="registry-manifest-grid">
            {labels.manifestFields.map(([title, body]) => (
              <div className="registry-manifest-field" key={title}>
                <span>{title}</span>
                <strong>{body}</strong>
              </div>
            ))}
          </div>
          <div className="registry-note-list">
            {labels.notes.map((note) => (
              <div className="registry-note" key={note}>
                <ShieldCheck size={15} aria-hidden="true" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="registry-runtime-panel">
          <div className="info-panel lift-card">
            <RadioTower size={20} aria-hidden="true" />
            <h2>{dictionary.registryPage.endpointTitle}</h2>
            <p>{dictionary.registryPage.endpointBody}</p>
            <code>{apiUrl}/v1/skills/search</code>
            <a className="secondary-button secondary-button--compact" href={localizedHref("/docs", locale)}>
              <Terminal size={15} aria-hidden="true" />
              <span>{labels.actions.api}</span>
            </a>
          </div>

          <div className="info-panel lift-card">
            <GitBranch size={20} aria-hidden="true" />
            <h2>{labels.lifecycleTitle}</h2>
            <div className="registry-lifecycle-list">
              {labels.lifecycle.map(([title, body], index) => (
                <div className="registry-lifecycle-step" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <small>{body}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="code-panel registry-manifest-snippet">
            <div className="code-panel__bar">
              <span>skillhub.json</span>
              <span>contract</span>
            </div>
            <pre>
              <code>{manifestSnippet}</code>
            </pre>
          </div>
        </aside>
      </section>

      <section className="registry-layout">
        <section className="registry-workbench registry-workbench--page" aria-labelledby="registry-page-heading">
          <div className="workbench-top">
            <div>
              <div className="card-kicker">
                <Boxes size={16} aria-hidden="true" />
                <span>{labels.tableEyebrow}</span>
              </div>
              <h2 id="registry-page-heading">{labels.tableTitle}</h2>
            </div>
            <div className="workbench-actions">
              <a className="secondary-button" href={`${apiUrl}/v1/skills/search?limit=50`}>
                <Code2 size={17} aria-hidden="true" />
                <span>{dictionary.registryPage.endpointTitle}</span>
              </a>
              <a className="secondary-button" href={localizedHref("/docs", locale)}>
                <Code2 size={17} aria-hidden="true" />
                <span>{dictionary.nav.docs}</span>
              </a>
            </div>
          </div>

          <div className="metric-strip metric-strip--four">
            {visibleMetrics.map((item) => (
              <div className="metric" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

          <SkillTable apiUrl={apiUrl} labels={dictionary.skillTable} locale={locale} skills={skills} />
        </section>
      </section>
    </main>
  );
}
