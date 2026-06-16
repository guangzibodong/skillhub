import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  Braces,
  Code2,
  Database,
  FileJson,
  GitBranch,
  KeyRound,
  Network,
  Plus,
  RadioTower,
  SearchCheck,
  ShieldCheck,
  Terminal,
  Workflow
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
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
      api: "Read API docs",
      marketplace: "Compare in marketplace",
      submit: "Submit a skill"
    },
    contractTitle: "What the Skill API records",
    decisionTitle: "Where this page fits",
    decisionHeading: "Know when to use Find Skills, Skill API, or workspace runtime.",
    decisionBody:
      "Use this page when you need the contract behind a Skill: the fields an agent, developer, publisher, and operator can inspect before runtime use.",
    surfaces: [
      ["Find Skills", "Human-facing discovery, category filters, pricing intent, examples, and publisher trust."],
      ["Skill API", "Machine-readable contracts: slug, version, schemas, permissions, runtime, review state, and endpoint links."],
      ["Workspace runtime", "Signed-in project adoption, Project Keys, policy approval, logs, usage, and billing-preview evidence."]
    ],
    evidence: {
      calls: "Skill API calls",
      highRisk: "High-risk contracts",
      mcp: "MCP contracts",
      verified: "Verified contracts"
    },
    heroProof: [
      ["Contract first", "Every skill starts as a versioned manifest before it becomes a public listing."],
      ["Gateway governed", "REST, MCP, SDK, and console tests all resolve the same version and policy state."],
      ["Audit ready", "Review, signed-in adoption, runtime, prelaunch ledger, delivery, and audit records stay connected."]
    ],
    lifecycleTitle: "Contract lifecycle",
    lifecycle: [
      ["Draft", "Publisher saves identity, runtime, permissions, schemas, examples, and pricing intent."],
      ["Review", "Automated manifest/runtime/example/security checks feed a human decision with SLA."],
      ["Approved", "Verified versions become eligible for sign-in gated project adoption and are immutable."],
      ["Runtime", "Signed-in projects pin versions, approve policy, create keys, and invoke through the governed gateway."],
      ["Paid preview", "Paid-marketplace ledger, refund, dispute, and payout state remains prelaunch operating reference material."]
    ],
    manifestTitle: "Manifest quality bar",
    quickstartTitle: "API quickstart",
    quickstartBody:
      "Start with public discovery, inspect one contract, then sign in only when you need to adopt a verified version into a project.",
    quickstartSteps: [
      ["Search contracts", "Use /v1/skills/search to list public Skill API records."],
      ["Inspect manifest", "Open /v1/skills/:slug to review version, schema, permissions, runtime, and trust state."],
      ["Adopt after sign-in", "Create a project, approve policy, generate a Project Key, and invoke through the governed gateway."]
    ],
    audienceTitle: "Who uses the Skill API",
    audience: [
      ["Developers", "Compare contracts and prepare project adoption without guessing what a Skill can access."],
      ["Agent builders", "Let agents inspect stable metadata before choosing tools or MCP capabilities."],
      ["Publishers", "Understand the fields needed before a Skill becomes trusted marketplace supply."],
      ["Operators", "Review version, permissions, runtime evidence, incidents, feedback, and paid-readiness state."]
    ],
    manifestFields: [
      ["Identity", "name, displayName, semantic version, category, tags, support, changelog"],
      ["Runtime", "http, mcp, or restricted local runtime with target, transport, and health posture"],
      ["Schemas", "inputSchema, outputSchema, examples, required fields, typed result shape"],
      ["Permissions", "network, browser, filesystem, secrets, sensitive data, destructive/payment workflows"],
      ["Paid preview", "billing model, paid-preview blockers, publisher terms, finance-reviewed paid readiness"],
      ["Trust", "review status, checks, incidents, feedback, deprecation and replacement path"]
    ],
    notes: [
      "Public Skill API rows are live API results; production-like runtimes do not fill fake supply unless demo fallback is explicitly enabled.",
      "The Skill API explains contracts. Find Skills pages explain discovery, buyer comparison, pricing, and publisher trust.",
      "This page intentionally stays browse-only. Use Find Skills filters or the public API endpoint when you need search."
    ],
    protocolEyebrow: "Skill API protocol",
    protocolTitle: "The Skill API is the contract layer behind Find Skills.",
    protocolBody:
      "SkillHub records the exact skill contract an AI agent can inspect publicly and adopt after sign-in: manifest, version, runtime, permissions, schemas, review state, pricing intent, and governance links.",
    runtimeTitle: "Runtime resolution",
    runtimeSteps: [
      "Agent or developer selects a public skill slug.",
      "Signed-in project adoption pins an approved version and policy.",
      "REST or MCP call authenticates a project key.",
      "Gateway checks approval, budget, rate limit, subscription, and risk.",
      "Invocation, usage, notification, ledger, and audit records preserve the outcome."
    ],
    tableEyebrow: "Live Skill API",
    tableTitle: "Versioned contracts available through the API"
  },
  zh: {
    actions: {
      api: "阅读 API 文档",
      marketplace: "去找技能页对比",
      submit: "提交技能"
    },
    contractTitle: "技能 API 记录什么",
    decisionTitle: "这个页面负责什么",
    decisionHeading: "把“找技能、技能 API、工作台运行”的边界说清楚。",
    decisionBody:
      "当客户、开发者或 AI 需要看清一个 Skill 背后的合约时，就看这个页面：它解释可被检查、可被审核、可被项目采用的字段。",
    surfaces: [
      ["找技能", "给人看的发现页面：分类筛选、价格意图、案例、发布者信任和采用对比。"],
      ["技能 API", "给系统和 AI 看的合约层：slug、版本、schema、权限、运行时、审核状态和端点。"],
      ["登录工作台", "真实采用和运行：项目安装、Project Key、策略审批、日志、用量和账务预览证据。"]
    ],
    evidence: {
      calls: "技能 API 调用",
      highRisk: "高风险合约",
      mcp: "MCP 合约",
      verified: "已验证合约"
    },
    heroProof: [
      ["合约优先", "每个技能先成为带版本的 manifest，再进入公开展示。"],
      ["网关治理", "REST、MCP、SDK 和控制台测试都会解析同一套版本和策略状态。"],
      ["可审计", "审核、登录后采用、运行、预发布账本、投递和审计记录保持连贯。"]
    ],
    lifecycleTitle: "合约生命周期",
    lifecycle: [
      ["草稿", "发布者保存身份、运行时、权限、schema、示例和定价意图。"],
      ["审核", "manifest/runtime/example/security 自动检查进入带 SLA 的人工决策。"],
      ["批准", "已验证版本会进入登录后项目采用路径，并且不可原地修改。"],
      ["运行", "登录后的项目固定版本、审批策略、创建 Key，并通过治理网关调用。"],
      ["付费预览", "付费市场账本、退款、争议和提现状态仍是预发布运营参考。"]
    ],
    manifestTitle: "Manifest 质量门槛",
    quickstartTitle: "API 快速开始",
    quickstartBody:
      "先用公开端点发现 Skill，再检查一个具体合约；只有在需要项目采用和真实运行时，才进入登录后的工作台。",
    quickstartSteps: [
      ["搜索合约", "调用 /v1/skills/search 获取公开 Skill API 记录。"],
      ["检查 manifest", "打开 /v1/skills/:slug，查看版本、schema、权限、运行时和信任状态。"],
      ["登录后采用", "创建项目、审批策略、生成 Project Key，再通过治理网关调用。"]
    ],
    audienceTitle: "谁会使用技能 API",
    audience: [
      ["开发者", "不用猜测 Skill 能访问什么，先对比合约再接入项目。"],
      ["Agent 构建者", "让智能体在选择工具或 MCP 能力前检查稳定元数据。"],
      ["发布者", "明确 Skill 进入可信市场供给前必须补齐哪些字段。"],
      ["运营审核", "查看版本、权限、运行证据、事故、反馈和付费准备状态。"]
    ],
    manifestFields: [
      ["身份", "name、displayName、语义化版本、分类、标签、支持路径、变更记录"],
      ["运行时", "HTTP、MCP 或受限本地运行时，包含目标、传输和健康状态"],
      ["Schema", "inputSchema、outputSchema、示例、必填字段和类型化结果"],
      ["权限", "网络、浏览器、文件系统、密钥、敏感数据、破坏性/支付流程"],
      ["付费预览", "计费模型、付费预览阻断、发布者条款、财务复核元数据"],
      ["信任", "审核状态、检查、事故、反馈、废弃和替代路径"]
    ],
    notes: [
      "公开技能 API 只展示实时 API 结果；生产类环境不会用假供给填充，除非显式启用 demo fallback。",
      "技能 API 解释技能合约；找技能页面负责发现、买方对比、定价和发布者信任。",
      "这里刻意保持浏览型页面；需要搜索或筛选时，请使用找技能筛选或公开 API endpoint。"
    ],
    protocolEyebrow: "技能 API 协议",
    protocolTitle: "技能 API 是找技能页面背后的合约层。",
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
    tableEyebrow: "实时技能 API",
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
  const apiQuickstartSnippet = locale === "zh"
    ? `curl "${apiUrl}/v1/skills/search?limit=20"

curl "${apiUrl}/v1/skills/browser-research"

# 真实运行从登录后开始：
# 创建项目 -> 审批策略 -> 生成 Project Key -> 调用`
    : `curl "${apiUrl}/v1/skills/search?limit=20"

curl "${apiUrl}/v1/skills/browser-research"

# Runtime use starts only after sign-in:
# create project -> approve policy -> generate Project Key -> invoke`;

  return (
    <AppShell active="registry" locale={locale}>
      <section className="section">
        <div className="section-inner hero-glow max-w-[1200px] mx-auto px-6 py-20">
          <Reveal>
            <div>
              <div className="eyebrow">
                <Boxes size={16} aria-hidden="true" />
                <span>{dictionary.registryPage.eyebrow}</span>
              </div>
              <h1 className="heading-xl mt-4">{dictionary.registryPage.title}</h1>
              <p className="body-text mt-4 max-w-[640px]">{dictionary.registryPage.description}</p>
            </div>
            <div className="flex gap-4 mt-8">
              <a className="btn-primary btn-primary--large" href={localizedHref("/publish", locale)}>
                <Plus size={18} aria-hidden="true" />
                <span>{labels.actions.submit}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/marketplace", locale)}>
                <ArrowRight size={18} aria-hidden="true" />
                <span>{labels.actions.marketplace}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider" aria-labelledby="registry-decision-heading">
        <div className="section-inner max-w-[1200px] mx-auto px-6 py-[84px]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
            <div>
              <div className="eyebrow">
                <Workflow size={16} aria-hidden="true" />
                <span>{labels.decisionTitle}</span>
              </div>
              <h2 id="registry-decision-heading" className="heading-lg mt-4">{labels.decisionHeading}</h2>
              <p className="body-text mt-4 max-w-[560px]">{labels.decisionBody}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {labels.surfaces.map(([title, body], index) => {
                const Icon = index === 0 ? SearchCheck : index === 1 ? FileJson : KeyRound;

                return (
                  <article className="card" key={title}>
                    <Icon size={18} aria-hidden="true" className="text-[#7fee64] mb-3" />
                    <strong className="heading-sm">{title}</strong>
                    <span className="body-text-sm mt-2 block">{body}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-divider" aria-labelledby="registry-protocol-heading">
        <div className="section-inner max-w-[1200px] mx-auto px-6 py-[96px]">
          <div className="mb-10">
            <div className="eyebrow">
              <Database size={16} aria-hidden="true" />
              <span>{labels.protocolEyebrow}</span>
            </div>
            <h2 id="registry-protocol-heading" className="heading-lg mt-4">{labels.protocolTitle}</h2>
            <p className="body-text mt-4 max-w-[640px]">{labels.protocolBody}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {labels.heroProof.map(([title, body], index) => {
              const Icon = index === 0 ? FileJson : index === 1 ? Network : ShieldCheck;

              return (
                <article className="card" key={title}>
                  <Icon size={17} aria-hidden="true" className="text-[#7fee64] mb-3" />
                  <strong className="heading-sm">{title}</strong>
                  <span className="body-text-sm mt-2 block">{body}</span>
                </article>
              );
            })}
          </div>
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

      <section className="section section-divider" aria-labelledby="registry-contract-heading">
        <div className="section-inner max-w-[1200px] mx-auto px-6 py-[96px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            <article className="card">
              <div className="eyebrow">
                <Braces size={16} aria-hidden="true" />
                <span>{labels.contractTitle}</span>
              </div>
              <h2 id="registry-contract-heading" className="heading-lg mt-4">{labels.manifestTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {labels.manifestFields.map(([title, body], i) => (
                  <Reveal delay={i * 60} key={title}>
                    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4">
                      <span className="text-[#7fee64] text-sm font-medium">{title}</span>
                      <strong className="block text-white/80 text-sm mt-1 font-normal">{body}</strong>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal>
                <div className="mt-6 space-y-3">
                  {labels.notes.map((note) => (
                    <div className="flex items-start gap-3 text-[#999] text-sm" key={note}>
                      <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-[#10b981]" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </article>

            <aside className="flex flex-col gap-6">
              <div className="card">
                <RadioTower size={20} aria-hidden="true" className="text-[#7fee64] mb-3" />
                <h2 className="heading-sm">{dictionary.registryPage.endpointTitle}</h2>
                <p className="body-text-sm mt-2">{dictionary.registryPage.endpointBody}</p>
                <code className="code-block mt-4 block text-sm">{apiUrl}/v1/skills/search</code>
                <a className="btn-secondary mt-4 inline-flex items-center gap-2" href={localizedHref("/docs", locale)}>
                  <Terminal size={15} aria-hidden="true" />
                  <span>{labels.actions.api}</span>
                </a>
              </div>

              <div className="card">
                <GitBranch size={20} aria-hidden="true" className="text-[#7fee64] mb-3" />
                <h2 className="heading-sm">{labels.lifecycleTitle}</h2>
                <div className="mt-4 space-y-3">
                  {labels.lifecycle.map(([title, body], index) => (
                    <Reveal delay={index * 60} key={title}>
                      <div className="flex items-start gap-3">
                        <span className="text-[#525252] text-xs font-mono mt-0.5">{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <strong className="text-white text-sm">{title}</strong>
                          <small className="block text-[#666] text-xs mt-0.5">{body}</small>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#666]">
                  <span>skillhub.json</span>
                  <span>contract</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-[#999]">
                  <code>{manifestSnippet}</code>
                </pre>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-divider" aria-labelledby="registry-quickstart-heading">
        <div className="section-inner max-w-[1200px] mx-auto px-6 py-[96px]">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
            <article className="card">
              <div className="eyebrow">
                <BookOpenCheck size={16} aria-hidden="true" />
                <span>{labels.quickstartTitle}</span>
              </div>
              <h2 id="registry-quickstart-heading" className="heading-lg mt-4">{labels.quickstartTitle}</h2>
              <p className="body-text mt-4">{labels.quickstartBody}</p>
              <div className="mt-6 space-y-4">
                {labels.quickstartSteps.map(([title, body], index) => (
                  <div className="flex items-start gap-4" key={title}>
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(127,238,100,0.24)] bg-[rgba(127,238,100,0.08)] text-sm font-semibold text-[#7fee64]">
                      {index + 1}
                    </span>
                    <div>
                      <strong className="text-white text-sm">{title}</strong>
                      <p className="body-text-sm mt-1">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <div className="eyebrow">
                <Terminal size={16} aria-hidden="true" />
                <span>{dictionary.registryPage.endpointTitle}</span>
              </div>
              <pre className="code-block mt-5 overflow-x-auto text-sm">
                <code>{apiQuickstartSnippet}</code>
              </pre>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="btn-secondary inline-flex items-center gap-2" href={`${apiUrl}/v1/skills/search?limit=20`}>
                  <Code2 size={15} aria-hidden="true" />
                  <span>{dictionary.registryPage.endpointTitle}</span>
                </a>
                <a className="btn-secondary inline-flex items-center gap-2" href={localizedHref("/docs", locale)}>
                  <BookOpenCheck size={15} aria-hidden="true" />
                  <span>{labels.actions.api}</span>
                </a>
              </div>
            </article>
          </div>

          <div className="mt-8">
            <div className="mb-5">
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.audienceTitle}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {labels.audience.map(([title, body]) => (
                <article className="card" key={title}>
                  <strong className="heading-sm">{title}</strong>
                  <span className="body-text-sm mt-2 block">{body}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-divider" aria-labelledby="registry-page-heading">
        <div className="section-inner max-w-[1200px] mx-auto px-6 py-[96px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="eyebrow">
                <Boxes size={16} aria-hidden="true" />
                <span>{labels.tableEyebrow}</span>
              </div>
              <h2 id="registry-page-heading" className="heading-lg mt-2">{labels.tableTitle}</h2>
            </div>
            <div className="flex gap-3">
              <a className="btn-secondary inline-flex items-center gap-2" href={`${apiUrl}/v1/skills/search?limit=50`}>
                <Code2 size={17} aria-hidden="true" />
                <span>{dictionary.registryPage.endpointTitle}</span>
              </a>
              <a className="btn-secondary inline-flex items-center gap-2" href={localizedHref("/docs", locale)}>
                <Code2 size={17} aria-hidden="true" />
                <span>{dictionary.nav.docs}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {visibleMetrics.map((item) => (
              <div className="stat-card" key={item.label}>
                <span className="body-text-sm">{item.label}</span>
                <strong className="heading-md mt-1 block">{item.value}</strong>
              </div>
            ))}
          </div>

          <SkillTable apiUrl={apiUrl} labels={dictionary.skillTable} locale={locale} skills={skills} />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{locale === "zh" ? "开始构建" : "Start building"}</h2>
            <p className="body-text max-w-[480px] mx-auto mb-8">{locale === "zh" ? "去找技能页面浏览，或发布你自己的技能。" : "Find skills or publish your own skill."}</p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/marketplace", locale)}>
                <span>{locale === "zh" ? "找技能" : "Find Skills"}</span>
                <ArrowRight size={14} aria-hidden="true" />
              </a>
              <a className="btn-secondary" href={localizedHref("/publish", locale)}>
                <span>{locale === "zh" ? "发布技能" : "Publish a skill"}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}
