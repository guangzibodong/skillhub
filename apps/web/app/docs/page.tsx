import {
  ArrowRight,
  BellRing,
  BookOpen,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  FileJson,
  Gauge,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  PackageCheck,
  Route,
  Scale,
  SearchCode,
  ShieldCheck,
  Terminal,
  WalletCards
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
  hero: {
    description: string;
    eyebrow: string;
    primary: string;
    secondary: string;
    tertiary: string;
    title: string;
  };
  journeys: {
    body: string;
    items: Array<{
      action: string;
      evidence: string;
      href: string;
      steps: string[];
      title: string;
      user: string;
    }>;
    title: string;
  };
  manifest: {
    badge: string;
    fields: Array<[string, string]>;
    title: string;
  };
  operator: {
    items: string[];
    notice: string;
    title: string;
  };
  references: {
    body: string;
    items: Array<{
      body: string;
      bullets: string[];
      title: string;
    }>;
    title: string;
  };
  runtime: {
    body: string;
    steps: string[];
    title: string;
  };
  states: {
    body: string;
    items: Array<{
      body: string;
      title: string;
      values: string[];
    }>;
    title: string;
  };
};

const copy: Record<Locale, DocsCopy> = {
  en: {
    api: {
      body:
        "These groups are the public and console API surfaces that make the marketplace operational. Final payment and provider movement stay deferred, but the state machines are already modeled.",
      groups: [
        {
          body: "Public discovery, skill detail, publisher trust, and marketplace recommendation inputs.",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug", "GET /v1/publishers", "GET /v1/publishers/:slug"],
          title: "Marketplace"
        },
        {
          body: "Organization-scoped publishing, version creation, exact-version submission, and pricing readiness.",
          endpoints: ["POST /v1/skills", "POST /v1/publisher/skills/:slug/versions", "POST /v1/publisher/skills/:slug/versions/:version/submit", "POST /v1/prices"],
          title: "Publisher"
        },
        {
          body: "Project install state, saved skills, policy approval, keys, runtime tests, invoices, and updates.",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectId/installed-skills", "POST /v1/projects/:projectId/api-keys", "POST /v1/projects/:projectId/runtime-test"],
          title: "Developer"
        },
        {
          body: "Review, trust, incidents, launch readiness, finance, payouts, notifications, webhook outbox, and audit.",
          endpoints: ["GET /v1/admin/reviews", "GET /v1/admin/launch-readiness", "GET /v1/admin/payouts", "GET /v1/admin/audit-logs"],
          title: "Admin"
        }
      ],
      title: "API map for the operating platform"
    },
    hero: {
      description:
        "Use this page as the product-grade reference for SkillHub's registry, marketplace, runtime gateway, review governance, ledger, payout, notification, and admin operations.",
      eyebrow: "Operating reference",
      primary: "Browse marketplace",
      secondary: "Publish a skill",
      tertiary: "Open admin readiness",
      title: "Docs for the full SkillHub marketplace, not just a manifest format."
    },
    journeys: {
      body:
        "The P0 product is judged by whether these paths connect. A listing must become project state, review state, runtime state, ledger state, notification state, and operator state.",
      items: [
        {
          action: "Start in marketplace",
          evidence: "Listing -> project install -> governed runtime test -> logs and cost follow-up",
          href: "/marketplace",
          steps: ["Search/filter", "Inspect trust", "Install to project", "Run test", "Monitor updates"],
          title: "Discover, install, and test",
          user: "Developer / Agent Builder"
        },
        {
          action: "Start publishing",
          evidence: "Draft -> exact version review -> checks -> pricing blockers -> feedback and payout readiness",
          href: "/publish",
          steps: ["Paste manifest", "Save draft", "Submit version", "Repair checks", "Monetize and improve"],
          title: "Upload, submit, monetize, and improve",
          user: "Publisher / Skill Author"
        },
        {
          action: "Open operations",
          evidence: "Review queue -> trust action -> incident -> finance/payout -> launch readiness and audit",
          href: "/admin",
          steps: ["Prioritize reviews", "Govern risk", "Process money", "Deliver notifications", "Audit launch"],
          title: "Review, govern, and launch",
          user: "Reviewer / Finance / Super Admin"
        }
      ],
      title: "Three P0 journeys that define the product"
    },
    manifest: {
      badge: "Required before review",
      fields: [
        ["Identity", "name, displayName, version, category, tags, changelog, support path"],
        ["Runtime", "http, mcp, or restricted local execution with entrypoint and transport posture"],
        ["Schemas", "inputSchema, outputSchema, examples, required fields, and typed result shape"],
        ["Permissions", "network, browser, filesystem, secrets, sensitive data, destructive or payment workflows"],
        ["Commercial", "pricing model, paid blockers, publisher profile, terms acceptance, payout readiness"],
        ["Trust", "review status, automated checks, incidents, feedback, deprecation, replacement guidance"]
      ],
      title: "Manifest quality bar"
    },
    operator: {
      items: [
        "Run launch readiness before customer demos and public launch.",
        "Keep production demo fallback disabled unless a controlled demo explicitly enables it.",
        "Use email-code access first; Google and GitHub become live only after OAuth credentials and callback URLs are configured.",
        "Resolve active notification-template, migration, runtime-key-salt, commission, and payout-state blockers before paid launch.",
        "Never expose OAuth secrets, email provider keys, service tokens, API salts, webhook secrets, verification codes, user tokens, or passwords."
      ],
      notice:
        "Payment provider capture, connected payout movement, tax/KYC automation, final legal terms, and final email provider operations are intentionally last integrations.",
      title: "Launch and operator guardrails"
    },
    references: {
      body:
        "Each domain exists because it creates a reason for users to return after the first visit: safer runtime use for developers, review and revenue loops for publishers, and governable operations for admins.",
      items: [
        {
          body: "SkillHub packages are versioned contracts. Public discovery should prefer approved versions and never silently replace installed behavior.",
          bullets: ["draft -> submitted -> in_review -> verified/rejected", "Immutable verified and installed versions", "Similar and replacement skill paths"],
          title: "Registry and marketplace"
        },
        {
          body: "Runtime calls go through the same governance path whether an agent uses REST, MCP, SDK, or the console test runner.",
          bullets: ["Project API key", "Install and policy check", "Budget, rate limit, subscription, log, and metering"],
          title: "Runtime gateway"
        },
        {
          body: "Publishers need precise repair loops, not vague rejection notes. Automated checks must carry blocker, field, category, and next action.",
          bullets: ["Manifest/runtime/example/security checks", "Three-business-day review SLA", "Reviewer notes and audit trail"],
          title: "Review and trust"
        },
        {
          body: "Usage does not pay publishers directly. Billable usage and subscription periods first create immutable commercial records.",
          bullets: ["Transactions -> splits -> balances", "Refunds and disputes create adjustments", "Payout review reserves eligible balances"],
          title: "Ledger and payouts"
        },
        {
          body: "In-app notifications, email rows, and webhook outbox rows are separate so user preferences do not suppress organization webhook delivery.",
          bullets: ["Template-rendered delivery", "Retry and provider metadata", "Signed webhook fan-out"],
          title: "Notifications and webhooks"
        },
        {
          body: "Admin operators need secret-safe readiness, identity, review, risk, finance, payout, delivery, webhook, and audit surfaces from one console.",
          bullets: ["Launch credibility thresholds", "Migration and schema visibility", "Reason-required privileged decisions"],
          title: "Admin operations"
        }
      ],
      title: "Reference domains"
    },
    runtime: {
      body:
        "MCP tools/call and REST runtime invocation must reuse the same governance path. Console tests are useful because they prove this path before agents run autonomously.",
      steps: ["Authenticate project key", "Resolve installed skill and pinned version", "Check policy, approval, budget, rate limit, and subscription", "Invoke runtime and record invocation", "Post usage or subscription ledger state when billable"],
      title: "Runtime governance path"
    },
    states: {
      body: "These names must stay consistent across marketplace cards, skill detail, publish preflight, project policy, publisher workspace, admin review, finance, and launch readiness.",
      items: [
        {
          body: "Publishing and review state for a skill version.",
          title: "Skill lifecycle",
          values: ["draft", "submitted", "in_review", "verified", "rejected", "deprecated", "suspended"]
        },
        {
          body: "Automated evidence state for review and repair loops.",
          title: "Runtime checks",
          values: ["queued", "running", "passed", "warning", "failed"]
        },
        {
          body: "Commercial readiness and money movement state.",
          title: "Balances and payouts",
          values: ["pending", "available", "locked", "paid", "failed", "blocked", "reversed"]
        },
        {
          body: "Notification and webhook delivery state before provider integrations are final.",
          title: "Delivery",
          values: ["queued", "pending", "processing", "sent", "skipped", "failed", "retry_ready"]
        }
      ],
      title: "Shared state language"
    }
  },
  zh: {
    api: {
      body:
        "这些分组是公开页面和控制台真正依赖的 API 面。支付和提现提供商的实际划转可以后置，但内部状态机必须先完整建模。",
      groups: [
        {
          body: "公开发现、技能详情、发布者信任和推荐排序输入。",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug", "GET /v1/publishers", "GET /v1/publishers/:slug"],
          title: "市场"
        },
        {
          body: "组织范围内的发布、版本创建、精确版本提交和商业化就绪。",
          endpoints: ["POST /v1/skills", "POST /v1/publisher/skills/:slug/versions", "POST /v1/publisher/skills/:slug/versions/:version/submit", "POST /v1/prices"],
          title: "发布者"
        },
        {
          body: "项目安装状态、收藏技能、策略审批、运行 Key、测试调用、发票和更新。",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectId/installed-skills", "POST /v1/projects/:projectId/api-keys", "POST /v1/projects/:projectId/runtime-test"],
          title: "开发者"
        },
        {
          body: "审核、信任治理、事故、上线就绪、财务、提现、通知、Webhook outbox 和审计。",
          endpoints: ["GET /v1/admin/reviews", "GET /v1/admin/launch-readiness", "GET /v1/admin/payouts", "GET /v1/admin/audit-logs"],
          title: "后台"
        }
      ],
      title: "运营平台 API 地图"
    },
    hero: {
      description:
        "这里是 SkillHub 的产品级参考入口，覆盖注册库、市场、运行网关、审核治理、账本、提现、通知和后台运营。",
      eyebrow: "运营参考",
      primary: "浏览市场",
      secondary: "发布技能",
      tertiary: "打开上线就绪",
      title: "这不是只有 manifest 的文档，而是完整 SkillHub 市场的操作手册。"
    },
    journeys: {
      body:
        "P0 产品是否成立，就看这三条路径能不能接起来：一个 listing 必须能变成项目状态、审核状态、运行状态、账本状态、通知状态和运营状态。",
      items: [
        {
          action: "从市场开始",
          evidence: "Listing -> 项目安装 -> 受治理测试调用 -> 日志和成本回访",
          href: "/marketplace",
          steps: ["搜索筛选", "检查信任", "安装到项目", "运行测试", "监控更新"],
          title: "发现、安装并测试",
          user: "开发者 / Agent Builder"
        },
        {
          action: "开始发布",
          evidence: "草稿 -> 精确版本审核 -> 检查证据 -> 定价阻断 -> 反馈和提现就绪",
          href: "/publish",
          steps: ["粘贴 manifest", "保存草稿", "提交版本", "修复检查", "商业化和改进"],
          title: "上传、提交、变现并改进",
          user: "发布者 / 技能作者"
        },
        {
          action: "进入运营",
          evidence: "审核队列 -> 信任动作 -> 事故 -> 财务/提现 -> 上线就绪和审计",
          href: "/admin",
          steps: ["处理审核优先级", "治理风险", "处理资金", "投递通知", "审计上线"],
          title: "审核、治理并上线运营",
          user: "审核 / 财务 / 超级管理员"
        }
      ],
      title: "定义产品的三条 P0 路径"
    },
    manifest: {
      badge: "审核前必须具备",
      fields: [
        ["身份", "name、displayName、version、category、tags、changelog、support path"],
        ["运行时", "HTTP、MCP 或受限本地执行，并包含入口和传输姿态"],
        ["Schema", "inputSchema、outputSchema、examples、required fields 和类型化结果"],
        ["权限", "network、browser、filesystem、secrets、敏感数据、破坏性或支付流程"],
        ["商业化", "定价模型、付费阻断、发布者资料、条款接受、提现就绪"],
        ["信任", "审核状态、自动检查、事故、反馈、废弃、替代建议"]
      ],
      title: "Manifest 质量门槛"
    },
    operator: {
      items: [
        "客户演示和公开上线前必须运行 launch readiness。",
        "生产环境默认关闭 demo fallback，除非明确启用受控演示。",
        "优先使用邮箱验证码入口；Google 和 GitHub 在 OAuth 凭据与回调 URL 配好后再变成真实登录。",
        "付费上线前先解决通知模板、迁移、runtime key salt、佣金规则和提现状态阻断。",
        "永远不要暴露 OAuth secret、邮件 provider key、service token、API salt、webhook secret、验证码、用户 token 或密码。"
      ],
      notice:
        "支付扣款、真实提现划转、税务/KYC 自动化、最终法律条款和最终邮件投递提供商都属于最后接入项。",
      title: "上线和运营护栏"
    },
    references: {
      body:
        "每个域都必须给用户一个第二次回来的理由：开发者回来管理更安全的运行，发布者回来修复审核和收入，管理员回来治理真实运营。",
      items: [
        {
          body: "SkillHub 技能包是版本化合约。公开发现应优先批准版本，不能悄悄替换已安装行为。",
          bullets: ["draft -> submitted -> in_review -> verified/rejected", "已验证和已安装版本不可变", "相似和替代技能路径"],
          title: "注册库和市场"
        },
        {
          body: "无论 agent 使用 REST、MCP、SDK 还是控制台测试，运行调用都要经过同一条治理路径。",
          bullets: ["项目 API Key", "安装和策略检查", "预算、限流、订阅、日志和计量"],
          title: "运行网关"
        },
        {
          body: "发布者需要精确修复闭环，而不是模糊拒绝理由。自动检查必须带阻断、字段、类别和下一步。",
          bullets: ["Manifest/runtime/example/security 检查", "3 个工作日审核 SLA", "审核备注和审计链路"],
          title: "审核和信任"
        },
        {
          body: "用量不会直接支付给发布者。可计费用量和订阅周期必须先生成不可变商业记录。",
          bullets: ["交易 -> 分成 -> 余额", "退款和争议生成调整记录", "提现审核会预留合格余额"],
          title: "账本和提现"
        },
        {
          body: "站内通知、邮件行和 webhook outbox 要分开，个人偏好不能压制组织级 webhook 投递。",
          bullets: ["模板渲染投递", "重试和 provider 元数据", "签名 webhook fan-out"],
          title: "通知和 Webhook"
        },
        {
          body: "管理员需要在一个控制台看到不泄密的上线就绪、身份、审核、风险、财务、提现、投递、webhook 和审计。",
          bullets: ["上线可信度阈值", "迁移和 schema 可见", "特权决策必须填写原因"],
          title: "后台运营"
        }
      ],
      title: "参考域"
    },
    runtime: {
      body:
        "MCP tools/call 和 REST runtime invoke 必须复用同一条治理路径。控制台测试的意义就是在 agent 自主运行前证明这条路径可用。",
      steps: ["验证项目 Key", "解析已安装技能和固定版本", "检查策略、审批、预算、限流和订阅", "调用运行时并记录 invocation", "可计费时写入用量或订阅账本状态"],
      title: "运行治理路径"
    },
    states: {
      body: "这些名称必须在市场卡片、技能详情、发布预检、项目策略、发布者工作台、后台审核、财务和上线就绪里保持一致。",
      items: [
        {
          body: "技能版本的发布和审核状态。",
          title: "技能生命周期",
          values: ["draft", "submitted", "in_review", "verified", "rejected", "deprecated", "suspended"]
        },
        {
          body: "审核证据和修复闭环中的自动检查状态。",
          title: "运行检查",
          values: ["queued", "running", "passed", "warning", "failed"]
        },
        {
          body: "商业化就绪和资金流转状态。",
          title: "余额和提现",
          values: ["pending", "available", "locked", "paid", "failed", "blocked", "reversed"]
        },
        {
          body: "最终 provider 接入前的通知和 webhook 投递状态。",
          title: "投递",
          values: ["queued", "pending", "processing", "sent", "skipped", "failed", "retry_ready"]
        }
      ],
      title: "共享状态语言"
    }
  }
};

const manifestSnippet = `{
  "schemaVersion": "0.1",
  "name": "support-triage",
  "displayName": "Support Triage",
  "version": "0.1.0",
  "runtime": {
    "type": "http",
    "entrypoint": "https://api.example.com/skill"
  },
  "permissions": {
    "network": false,
    "browser": false,
    "filesystem": "none",
    "secrets": []
  },
  "inputSchema": { "type": "object" },
  "outputSchema": { "type": "object" }
}`;

const runtimeSnippet = `curl -X POST "$SKILLHUB_API_URL/v1/runtime/invoke" \\
  -H "Authorization: Bearer $SKILLHUB_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skillSlug": "support-triage",
    "input": { "ticket": "Customer cannot connect OAuth" }
  }'`;

const journeyIcons = [Code2, PackageCheck, ShieldCheck] as const;
const referenceIcons = [SearchCode, Route, ClipboardCheck, WalletCards, BellRing, Gauge] as const;
const stateIcons = [GitBranch, CheckCircle2, WalletCards, BellRing] as const;

export default async function DocsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = copy[locale];

  return (
    <main className="product-shell docs-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/docs" />

      <section className="page-hero docs-hero">
        <div>
          <div className="eyebrow">
            <BookOpen size={16} aria-hidden="true" />
            <span>{labels.hero.eyebrow}</span>
          </div>
          <h1>{labels.hero.title}</h1>
          <p>{labels.hero.description}</p>
        </div>
        <div className="page-hero__actions">
          <a className="primary-button primary-button--large" href={localizedHref("/marketplace", locale)}>
            <SearchCode size={18} aria-hidden="true" />
            <span>{labels.hero.primary}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/publish", locale)}>
            <FileJson size={18} aria-hidden="true" />
            <span>{labels.hero.secondary}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/admin#launch-readiness", locale)}>
            <Gauge size={18} aria-hidden="true" />
            <span>{labels.hero.tertiary}</span>
          </a>
        </div>
      </section>

      <section className="docs-journey-board" aria-labelledby="docs-journeys-heading">
        <div className="docs-section-head">
          <div>
            <div className="card-kicker">
              <Route size={16} aria-hidden="true" />
              <span>P0</span>
            </div>
            <h2 id="docs-journeys-heading">{labels.journeys.title}</h2>
          </div>
          <p>{labels.journeys.body}</p>
        </div>

        <div className="docs-journey-grid">
          {labels.journeys.items.map((journey, index) => {
            const Icon = journeyIcons[index] ?? Code2;

            return (
              <article className="docs-journey-card lift-card" key={journey.title}>
                <div className="docs-journey-card__head">
                  <div className="workflow-card__icon" aria-hidden="true">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span>{journey.user}</span>
                    <h3>{journey.title}</h3>
                  </div>
                </div>
                <div className="docs-journey-steps">
                  {journey.steps.map((step, stepIndex) => (
                    <div className="docs-journey-step" key={step}>
                      <span>{String(stepIndex + 1).padStart(2, "0")}</span>
                      <strong>{step}</strong>
                    </div>
                  ))}
                </div>
                <p>{journey.evidence}</p>
                <a className="secondary-button secondary-button--compact" href={localizedHref(journey.href, locale)}>
                  <span>{journey.action}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="docs-reference-section" aria-labelledby="docs-reference-heading">
        <div className="docs-section-head">
          <div>
            <div className="card-kicker">
              <Database size={16} aria-hidden="true" />
              <span>{labels.references.title}</span>
            </div>
            <h2 id="docs-reference-heading">{labels.references.title}</h2>
          </div>
          <p>{labels.references.body}</p>
        </div>

        <div className="docs-reference-grid">
          {labels.references.items.map((item, index) => {
            const Icon = referenceIcons[index] ?? BookOpen;

            return (
              <article className="docs-reference-card lift-card" key={item.title}>
                <div className="docs-reference-card__head">
                  <Icon size={18} aria-hidden="true" />
                  <h3>{item.title}</h3>
                </div>
                <p>{item.body}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="docs-layout docs-layout--deep">
        <div className="docs-contract-stack">
          <article className="docs-manifest-panel">
            <div className="docs-section-head docs-section-head--compact">
              <div>
                <div className="card-kicker">
                  <FileJson size={16} aria-hidden="true" />
                  <span>{labels.manifest.badge}</span>
                </div>
                <h2>{labels.manifest.title}</h2>
              </div>
            </div>
            <div className="docs-manifest-grid">
              {labels.manifest.fields.map(([label, value]) => (
                <div className="docs-manifest-field" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <div className="code-panel" aria-label="SkillHub manifest example">
            <div className="code-panel__bar">
              <span>skillhub.json</span>
              <span>schema v0.1</span>
            </div>
            <pre>
              <code>{manifestSnippet}</code>
            </pre>
          </div>
        </div>

        <aside className="docs-runtime-panel lift-card" aria-label={labels.runtime.title}>
          <div className="card-kicker">
            <Network size={16} aria-hidden="true" />
            <span>{labels.runtime.title}</span>
          </div>
          <p>{labels.runtime.body}</p>
          <div className="docs-runtime-steps">
            {labels.runtime.steps.map((step, index) => (
              <div className="docs-runtime-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
          <div className="code-panel docs-runtime-code" aria-label="Runtime invocation example">
            <div className="code-panel__bar">
              <span>runtime.sh</span>
              <span>governed invoke</span>
            </div>
            <pre>
              <code>{runtimeSnippet}</code>
            </pre>
          </div>
        </aside>
      </section>

      <section className="docs-api-section" aria-labelledby="docs-api-heading">
        <div className="docs-section-head">
          <div>
            <div className="card-kicker">
              <Terminal size={16} aria-hidden="true" />
              <span>API</span>
            </div>
            <h2 id="docs-api-heading">{labels.api.title}</h2>
          </div>
          <p>{labels.api.body}</p>
        </div>

        <div className="docs-api-grid">
          {labels.api.groups.map((group) => (
            <article className="docs-api-card lift-card" key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.body}</p>
              <div className="endpoint-list">
                {group.endpoints.map((endpoint) => (
                  <code key={endpoint}>{endpoint}</code>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="docs-state-section" aria-labelledby="docs-state-heading">
        <div className="docs-section-head">
          <div>
            <div className="card-kicker">
              <Braces size={16} aria-hidden="true" />
              <span>{labels.states.title}</span>
            </div>
            <h2 id="docs-state-heading">{labels.states.title}</h2>
          </div>
          <p>{labels.states.body}</p>
        </div>

        <div className="docs-state-grid">
          {labels.states.items.map((state, index) => {
            const Icon = stateIcons[index] ?? Braces;

            return (
              <article className="docs-state-card lift-card" key={state.title}>
                <div className="docs-state-card__head">
                  <Icon size={17} aria-hidden="true" />
                  <h3>{state.title}</h3>
                </div>
                <p>{state.body}</p>
                <div className="docs-state-values">
                  {state.values.map((value) => (
                    <code key={value}>{value}</code>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="docs-operator-panel" aria-labelledby="docs-operator-heading">
        <div>
          <div className="card-kicker">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{labels.operator.title}</span>
          </div>
          <h2 id="docs-operator-heading">{labels.operator.title}</h2>
          <p>{labels.operator.notice}</p>
          <div className="docs-operator-actions">
            <a className="secondary-button" href={localizedHref("/terms", locale)}>
              <Scale size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "运营条款" : "Operating terms"}</span>
            </a>
            <a className="secondary-button" href={localizedHref("/agents", locale)}>
              <KeyRound size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "Agent 接入" : "Agent integration"}</span>
            </a>
          </div>
        </div>
        <div className="docs-operator-list">
          {labels.operator.items.map((item) => (
            <div className="docs-operator-item" key={item}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
