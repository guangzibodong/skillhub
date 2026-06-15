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
import type { Metadata } from "next";
import { PublicAccessScope } from "@/components/public-access-scope";
import { Reveal } from "@/components/home/reveal";
import { AppShell } from "@/components/app-shell";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const isZh = locale === "zh";
  const title = isZh
    ? "SkillHub Docs - REST / MCP 调用与治理文档"
    : "SkillHub Docs - REST, MCP, and Governance";
  const description = isZh
    ? "了解 SkillHub 的 Skill manifest、REST / MCP 调用路径、Project Key、权限治理、发布审核与公开预览状态。"
    : "Learn SkillHub manifests, REST and MCP invocation paths, Project Keys, permission governance, publisher review, and current Launch Preview boundaries.";
  const url = `https://useskillhub.com/docs?lang=${locale}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: "https://useskillhub.com/docs?lang=en",
        "zh-CN": "https://useskillhub.com/docs?lang=zh",
        "x-default": "https://useskillhub.com/docs",
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "SkillHub",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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
        "These groups are the public and sign-in gated API surfaces that make the Developer Preview operational. Final payment capture and automated payouts stay deferred; paid-marketplace money movement remains an operating reference, not an anonymous public action.",
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
      title: "API map for Developer Preview surfaces"
    },
    hero: {
      description:
        "Discover and inspect public agent skills in five minutes. Runtime invocation requires a signed-in project key.",
      eyebrow: "Developer quickstart",
      primary: "Browse marketplace",
      secondary: "Publish a skill",
      tertiary: "MCP setup",
      title: "SkillHub Developer Quickstart"
    },
    journeys: {
      body:
        "The P0 product is judged by whether these paths connect, but anonymous visitors should start with public discovery, inspection, MCP setup, and clear sign-in gates.",
      items: [
        {
          action: "Start in marketplace",
          evidence: "Listing -> public inspection -> sign-in -> project install -> governed runtime test -> logs and cost follow-up",
          href: "/marketplace",
          steps: ["Search/filter", "Inspect trust", "Sign in", "Add to project", "Run gated test"],
          title: "Discover, inspect, then sign in to test",
          user: "Developer / Agent Builder"
        },
        {
          action: "Start publishing",
          evidence: "Draft -> exact version review -> checks -> paid-readiness metadata -> feedback and future paid-marketplace readiness",
          href: "/publish",
          steps: ["Paste manifest", "Save draft", "Submit version", "Repair checks", "Prepare paid metadata"],
          title: "Upload, submit, prepare paid-readiness metadata, and improve",
          user: "Publisher / Skill Author"
        },
        {
          action: "Read operating reference",
          evidence: "Review queue -> trust action -> incident -> prelaunch paid-marketplace state -> launch readiness and audit",
          href: "/docs#operating-reference",
          steps: ["Triage review priority", "Govern risk", "Review prelaunch paid-state", "Deliver notifications", "Audit launch"],
          title: "Review, govern, and launch operations",
          user: "Review / Finance / Superadmin"
        }
      ],
      title: "Three P0 journey operating references"
    },
    manifest: {
      badge: "Required before review",
      fields: [
        ["Identity", "name, displayName, version, category, tags, changelog, support path"],
        ["Runtime", "HTTP, MCP, or sandboxed local execution with entrypoint and transport posture"],
        ["Schema", "inputSchema, outputSchema, examples, required fields, and typed results"],
        ["Permissions", "network, browser, filesystem, secrets, sensitive data, destructive, or payment flows"],
        ["Paid preview", "pricing intent, paid blocker, publisher profile, terms acceptance, finance review metadata"],
        ["Trust", "review status, automated checks, incidents, feedback, deprecation, replacement advisory"]
      ],
      title: "Manifest quality gate"
    },
    operator: {
      items: [
        "Launch readiness must run before any customer demo or public go-live.",
        "Demo fallback is off in production by default unless controlled demo is explicitly enabled.",
        "Prefer username/password entry first; Google and GitHub become real login after OAuth credentials and callback URLs are configured.",
        "Resolve notification templates, migrations, runtime key salt, commission rules, and payout state blockers before paid go-live.",
        "Never expose OAuth secrets, email provider keys, service tokens, API salt, webhook secrets, verification codes, user tokens, or passwords."
      ],
      notice:
        "Payment capture, payout provider automation, tax/KYC automation, final legal terms, and final email delivery provider are last-mile items; paid-marketplace money movement is currently a prelaunch operating reference only.",
      title: "Launch and operating guardrails"
    },
    references: {
      body:
        "Each domain must give the user a reason to come back: developers return to manage safer runtime, publishers return to fix reviews, address buyer demand, and prepare paid metadata, admins return to govern real operations.",
      items: [
        {
          body: "SkillHub skills are versioned contracts. Public discovery should prioritize approved versions and never silently replace installed behavior.",
          bullets: ["draft -> submitted -> in_review -> verified/rejected", "Verified and installed versions are immutable", "Similar and alternative skill paths"],
          title: "Registry and marketplace"
        },
        {
          body: "Whether the agent uses REST, MCP, SDK, or the console test, runtime invocation follows the same governance path.",
          bullets: ["Project API key", "Install and policy checks", "Budget, rate-limit, subscription, logs, and metering"],
          title: "Runtime gateway"
        },
        {
          body: "Publishers need a precise repair loop, not vague rejection reasons. Automated checks must carry blocker, field, category, and next step.",
          bullets: ["Manifest/runtime/example/security checks", "3-business-day review SLA", "Review notes and audit trail"],
          title: "Review and trust"
        },
        {
          body: "In developer preview, usage does not directly pay publishers. Billable usage and subscription cycles only generate immutable commercial records after paid-marketplace launch gates pass.",
          bullets: ["Transaction -> split -> balance", "Refunds and disputes generate adjustment records", "Future payout reviews will reserve qualifying balances"],
          title: "Future paid-marketplace ledger model"
        },
        {
          body: "In-app notifications, email rows, and webhook outbox must stay separate; personal preferences must not suppress org-level webhook delivery.",
          bullets: ["Template-rendered delivery", "Retry and provider metadata", "Signed webhook fan-out"],
          title: "Notifications and webhooks"
        },
        {
          body: "Admins need one console view of non-leaking launch readiness, identity, review, risk, finance, payouts, delivery, webhooks, and audit.",
          bullets: ["Launch confidence threshold", "Migration and schema visibility", "Privileged decisions require reason field"],
          title: "Operating reference"
        }
      ],
      title: "Reference domains"
    },
    runtime: {
      body:
        "MCP tools/call and REST runtime invoke must reuse the same governance path. The console test exists to prove this path works before an agent runs autonomously.",
      steps: ["Validate project key", "Resolve installed skill and pinned version", "Check policy, approval, budget, rate-limit, and subscription", "Invoke runtime and log invocation", "When billable, write usage or subscription ledger state"],
      title: "Runtime governance path"
    },
    states: {
      body: "These names must stay consistent across marketplace cards, skill detail, publish prechecks, project policy, publisher workbench, admin review, finance, and launch readiness.",
      items: [
        {
          body: "Skill version publication and review status.",
          title: "Skill lifecycle",
          values: ["draft", "submitted", "in_review", "verified", "rejected", "deprecated", "suspended"]
        },
        {
          body: "Automated evidence state for review and repair loops.",
          title: "Runtime checks",
          values: ["queued", "running", "passed", "warning", "failed"]
        },
        {
          body: "Prelaunch paid-marketplace readiness and money-state model.",
          title: "Paid-preview balances",
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
        "这些分组是公开页面和登录后控制台依赖的开发者预览版 API 面。支付扣款和自动提现保持后置；付费市场资金流转仅作为运营参考，不是匿名公开动作。",
      groups: [
        {
          body: "公开发现、技能详情、发布者信任和推荐排序输入。",
          endpoints: ["GET /v1/skills/search", "GET /v1/skills/:slug", "GET /v1/publishers", "GET /v1/publishers/:slug"],
          title: "市场"
        },
        {
          body: "组织范围内的发布、版本创建、精确版本提交和付费准备。",
          endpoints: ["POST /v1/skills", "POST /v1/publisher/skills/:slug/versions", "POST /v1/publisher/skills/:slug/versions/:version/submit", "POST /v1/prices"],
          title: "发布者"
        },
        {
          body: "项目安装状态、收藏技能、策略审批、运行 Key、测试调用、发票和更新。",
          endpoints: ["GET /v1/developer/projects", "POST /v1/projects/:projectId/installed-skills", "POST /v1/projects/:projectId/api-keys", "POST /v1/projects/:projectId/runtime-test"],
          title: "开发者"
        },
        {
          body: "审核、信任治理、事故、上线就绪、财务、提现、通知、Webhook 投递箱和审计。",
          endpoints: ["GET /v1/admin/reviews", "GET /v1/admin/launch-readiness", "GET /v1/admin/payouts", "GET /v1/admin/audit-logs"],
          title: "后台"
        }
      ],
      title: "开发者预览版 API 地图"
    },
    hero: {
      description:
        "五分钟内发现并查看公开 agent 技能。运行调用需要已登录的项目 Key。",
      eyebrow: "开发者快速开始",
      primary: "浏览市场",
      secondary: "发布技能",
      tertiary: "MCP 设置",
      title: "SkillHub 开发者快速开始"
    },
    journeys: {
      body:
        "P0 产品是否成立，要看这些路径能不能接起来，但匿名访客应先从公开发现、查看、MCP 设置和清晰登录门控开始。",
      items: [
        {
          action: "从市场开始",
          evidence: "Listing -> 公开查看 -> 登录 -> 项目采用 -> 受治理测试调用 -> 日志和成本回访",
          href: "/marketplace",
          steps: ["搜索筛选", "检查信任", "登录", "加入项目", "门控测试"],
          title: "发现、查看，然后登录测试",
          user: "开发者 / Agent Builder"
        },
        {
          action: "开始发布",
          evidence: "草稿 -> 精确版本审核 -> 检查证据 -> 付费准备 -> 反馈和未来付费市场准备",
          href: "/publish",
          steps: ["粘贴 manifest", "保存草稿", "提交版本", "修复检查", "准备付费元数据"],
          title: "上传、提交、补充付费准备并持续改进",
          user: "发布者 / 技能作者"
        },
        {
          action: "阅读运营参考",
          evidence: "审核队列 -> 信任动作 -> 事故 -> 预发布付费市场状态 -> 上线就绪和审计",
          href: "/docs#operating-reference",
          steps: ["处理审核优先级", "治理风险", "复核预发布付费状态", "投递通知", "审计上线"],
          title: "审核、治理并上线运营",
          user: "审核 / 财务 / 超级管理员"
        }
      ],
      title: "三条 P0 路径的运营参考"
    },
    manifest: {
      badge: "审核前必须具备",
      fields: [
        ["身份", "name、displayName、version、category、tags、changelog、support path"],
        ["运行时", "HTTP、MCP 或受限本地执行，并包含入口和传输姿态"],
        ["Schema", "inputSchema、outputSchema、examples、required fields 和类型化结果"],
        ["权限", "network、browser、filesystem、secrets、敏感数据、破坏性或支付流程"],
        ["付费预览", "定价意图、付费阻断、发布者资料、条款接受、财务复核元数据"],
        ["信任", "审核状态、自动检查、事故、反馈、废弃、替代建议"]
      ],
      title: "Manifest 质量门槛"
    },
    operator: {
      items: [
        "客户演示和公开上线前必须运行 launch readiness。",
        "生产环境默认关闭 demo fallback，除非明确启用受控演示。",
        "优先使用用户名/邮箱密码入口；Google 和 GitHub 在 OAuth 凭据与回调 URL 配好后再变成真实登录。",
        "付费上线前先解决通知模板、迁移、runtime key salt、佣金规则和提现状态阻断。",
        "永远不要暴露 OAuth secret、邮件 provider key、service token、API salt、webhook secret、验证码、用户 token 或密码。"
      ],
      notice:
        "支付扣款、提现提供商自动化、税务/KYC 自动化、最终法律条款和最终邮件投递提供商都属于最后接入项；付费市场资金流转目前仅作为预发布运营参考。",
      title: "上线和运营护栏"
    },
    references: {
      body:
        "每个域都必须给用户一个第二次回来的理由：开发者回来管理更安全的运行，发布者回来修复审核、处理买方需求并准备付费元数据，管理员回来治理真实运营。",
      items: [
        {
          body: "SkillHub 技能包是版本化合约。公开发现应优先批准版本，不能悄悄替换已安装行为。",
          bullets: ["草稿 -> 已提交 -> 审核中 -> 已验证/已拒绝", "已验证和已安装版本不可变", "相似和替代技能路径"],
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
          body: "开发者预览版里，用量不会直接支付给发布者。可计费用量和订阅周期只会在付费市场上线门槛通过后生成不可变商业记录。",
          bullets: ["交易 -> 分成 -> 余额", "退款和争议生成调整记录", "未来提现审核会预留合格余额"],
          title: "未来付费市场账本模型"
        },
        {
          body: "站内通知、邮件行和 webhook outbox 要分开，个人偏好不能压制组织级 webhook 投递。",
          bullets: ["模板渲染投递", "重试和 provider 元数据", "签名 webhook fan-out"],
          title: "通知和 Webhook"
        },
        {
          body: "管理员需要在一个控制台看到不泄密的上线就绪、身份、审核、风险、财务、提现、投递、webhook 和审计。",
          bullets: ["上线可信度阈值", "迁移和 schema 可见", "特权决策必须填写原因"],
          title: "运营参考"
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
          values: ["草稿", "已提交", "审核中", "已验证", "已拒绝", "已弃用", "已暂停"]
        },
        {
          body: "审核证据和修复闭环中的自动检查状态。",
          title: "运行检查",
          values: ["排队中", "运行中", "已通过", "预警", "失败"]
        },
        {
          body: "预发布付费市场准备度和资金状态模型。",
          title: "付费预览余额",
          values: ["待处理", "可用", "锁定", "已支付", "失败", "已阻断", "已冲正"]
        },
        {
          body: "最终 provider 接入前的通知和 webhook 投递状态。",
          title: "投递",
          values: ["排队中", "待处理", "处理中", "已发送", "已跳过", "失败", "可重试"]
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

const quickstartCopy = {
  en: {
    apiBadge: "Live public API",
    body:
      "Discovery and inspection work without login. Runtime invocation requires a signed-in project key and policy checks.",
    cliBadge: "CLI / SDK preview",
    cliBody:
      "CLI and SDK packages are present in the monorepo but are not presented as public copy-and-run installs yet.",
    mcpBadge: "MCP over POST",
    mcpBody:
      "Use POST /mcp for MCP clients. Browser GET /mcp returns a public service description.",
    steps: [
      "Search public skills",
      "Inspect one public manifest",
      "Confirm whether install/runtime is unlocked",
    ],
    title: "5-minute developer quickstart",
  },
  zh: {
    apiBadge: "公开 API 已可用",
    body:
      "发现和查看不需要登录。运行调用需要已登录项目 Key，并通过策略检查。",
    cliBadge: "CLI / SDK 预览",
    cliBody:
      "CLI 和 SDK 包已在 monorepo 中，但目前不作为公开的一键运行安装命令展示。",
    mcpBadge: "MCP 使用 POST",
    mcpBody:
      "MCP 客户端使用 POST /mcp。浏览器访问 GET /mcp 会返回公开服务说明。",
    steps: [
      "搜索公开技能",
      "查看一个公开 manifest",
      "确认安装/运行是否已解锁",
    ],
    title: "5 分钟开发者快速开始",
  },
} as const;

function quickstartSnippet(locale: Locale) {
  if (locale === "zh") {
    return `# 1. 搜索公开技能
curl "https://api.useskillhub.com/v1/skills/search?tag=research"

# 2. 查看公开 manifest
curl "https://api.useskillhub.com/v1/skills/browser-research"

# 3. 读取 MCP 服务元数据
curl "https://api.useskillhub.com/mcp"`;
  }

  return `# 1. Search public skills
curl "https://api.useskillhub.com/v1/skills/search?tag=research"

# 2. Inspect a public manifest
curl "https://api.useskillhub.com/v1/skills/browser-research"

# 3. Read MCP service metadata
curl "https://api.useskillhub.com/mcp"`;
}

function quickstartCodeLabel(locale: Locale) {
  return locale === "zh" ? "无需登录查看" : "no login inspect";
}

const journeyIcons = [Code2, PackageCheck, ShieldCheck] as const;
const referenceIcons = [SearchCode, Route, ClipboardCheck, WalletCards, BellRing, Gauge] as const;
const stateIcons = [GitBranch, CheckCircle2, WalletCards, BellRing] as const;

export default async function DocsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const quickstart = quickstartCopy[locale];

  return (
    <AppShell active="docs" locale={locale}>
      {/* Hero */}
      <section className="section pt-32 pb-16">
        <div className="section-inner hero-glow text-center flex flex-col items-center gap-6">
          <Reveal>
            <div className="eyebrow">
              <BookOpen size={16} aria-hidden="true" />
              <span>{labels.hero.eyebrow}</span>
            </div>
            <h1 className="heading-xl">{labels.hero.title}</h1>
            <p className="body-text max-w-[640px] text-[#999]">{labels.hero.description}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <a className="btn-primary btn-primary--large" href={localizedHref("/marketplace", locale)}>
                <SearchCode size={18} aria-hidden="true" />
                <span>{labels.hero.primary}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/publish", locale)}>
                <FileJson size={18} aria-hidden="true" />
                <span>{labels.hero.secondary}</span>
              </a>
              <a className="btn-secondary btn-secondary--large" href={localizedHref("/docs#mcp", locale)}>
                <Gauge size={18} aria-hidden="true" />
                <span>{labels.hero.tertiary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <PublicAccessScope locale={locale} />

      <div className="section-divider" />

      {/* Quickstart */}
      <section className="py-[96px] section" id="mcp" aria-labelledby="docs-quickstart-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <div className="eyebrow">
              <Terminal size={16} aria-hidden="true" />
              <span>{quickstart.apiBadge}</span>
            </div>
            <h2 id="docs-quickstart-heading" className="heading-lg">{quickstart.title}</h2>
            <p className="body-text text-[#999]">{quickstart.body}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="code-block">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#666]">
                <span>quickstart.sh</span>
                <span>{quickstartCodeLabel(locale)}</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{quickstartSnippet(locale)}</code>
              </pre>
            </div>
            <div className="flex flex-col gap-4">
              {quickstart.steps.map((step, index) => (
                <div className="flex items-center gap-3" key={step}>
                  <span className="text-xs font-mono text-[#525252]">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="text-sm text-white">{step}</strong>
                </div>
              ))}
              <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 mt-2 flex flex-col gap-1">
                <strong className="text-xs text-[#7fee64]">{quickstart.mcpBadge}</strong>
                <span className="body-text-sm text-[#999]">{quickstart.mcpBody}</span>
              </div>
              <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 flex flex-col gap-1">
                <strong className="text-xs text-[#7fee64]">{quickstart.cliBadge}</strong>
                <span className="body-text-sm text-[#999]">{quickstart.cliBody}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Journeys */}
      <section className="py-[96px] section" aria-labelledby="docs-journeys-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <div className="eyebrow">
              <Route size={16} aria-hidden="true" />
              <span>P0</span>
            </div>
            <h2 id="docs-journeys-heading" className="heading-lg">{labels.journeys.title}</h2>
            <p className="body-text text-[#999]">{labels.journeys.body}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {labels.journeys.items.map((journey, index) => {
              const Icon = journeyIcons[index] ?? Code2;

              return (
                <Reveal delay={index * 60} key={journey.title}>
                  <article className="card flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[rgba(127,238,100,0.1)] flex items-center justify-center shrink-0" aria-hidden="true">
                        <Icon size={18} className="text-[#7fee64]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#666]">{journey.user}</span>
                        <h3 className="heading-sm">{journey.title}</h3>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {journey.steps.map((step, stepIndex) => (
                        <div className="flex items-center gap-3" key={step}>
                          <span className="text-xs font-mono text-[#525252]">{String(stepIndex + 1).padStart(2, "0")}</span>
                          <strong className="text-sm text-white">{step}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="body-text-sm text-[#666] mt-auto">{journey.evidence}</p>
                    <a className="btn-secondary inline-flex items-center gap-2 w-fit text-sm" href={localizedHref(journey.href, locale)}>
                      <span>{journey.action}</span>
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

      {/* References */}
      <section className="py-[96px] section" id="operating-reference" aria-labelledby="docs-reference-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <div className="eyebrow">
              <Database size={16} aria-hidden="true" />
              <span>{labels.references.title}</span>
            </div>
            <h2 id="docs-reference-heading" className="heading-lg">{labels.references.title}</h2>
            <p className="body-text text-[#999]">{labels.references.body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labels.references.items.map((item, index) => {
              const Icon = referenceIcons[index] ?? BookOpen;

              return (
                <Reveal key={item.title}>
                  <article className="card flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Icon size={18} aria-hidden="true" className="text-[#7fee64]" />
                      <h3 className="heading-sm">{item.title}</h3>
                    </div>
                    <p className="body-text-sm text-[#999]">{item.body}</p>
                    <ul className="flex flex-col gap-1 mt-auto">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="text-sm text-[#666] pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1 before:h-1 before:rounded-full before:bg-[#525252]">{bullet}</li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Manifest and Runtime */}
      <section className="py-[96px] section">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="flex flex-col gap-6">
            <article className="card flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="eyebrow">
                  <FileJson size={16} aria-hidden="true" />
                  <span>{labels.manifest.badge}</span>
                </div>
                <h2 className="heading-lg">{labels.manifest.title}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {labels.manifest.fields.map(([label, value]) => (
                  <Reveal key={label}>
                    <div className="flex flex-col gap-1 p-3 rounded-[8px] bg-[rgba(255,255,255,0.03)]">
                      <span className="text-xs text-[#666] uppercase tracking-wide">{label}</span>
                      <strong className="text-sm text-white font-normal">{value}</strong>
                    </div>
                  </Reveal>
                ))}
              </div>
            </article>

            <div className="code-block" aria-label="SkillHub manifest example">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#666]">
                <span>skillhub.json</span>
                <span>schema v0.1</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{manifestSnippet}</code>
              </pre>
            </div>
          </div>

          <aside className="card flex flex-col gap-4" aria-label={labels.runtime.title}>
            <div className="eyebrow">
              <Network size={16} aria-hidden="true" />
              <span>{labels.runtime.title}</span>
            </div>
            <p className="body-text-sm text-[#999]">{labels.runtime.body}</p>
            <div className="flex flex-col gap-3">
              {labels.runtime.steps.map((step, index) => (
                <div className="flex items-center gap-3" key={step}>
                  <span className="text-xs font-mono text-[#525252]">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="text-sm text-white">{step}</strong>
                </div>
              ))}
            </div>
            <div className="code-block mt-auto" aria-label="Runtime invocation example">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] text-xs text-[#666]">
                <span>runtime.sh</span>
                <span>governed invoke</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{runtimeSnippet}</code>
              </pre>
            </div>
          </aside>
        </div>
      </section>

      <div className="section-divider" />

      {/* API */}
      <section className="py-[96px] section" id="api" aria-labelledby="docs-api-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <div className="eyebrow">
              <Terminal size={16} aria-hidden="true" />
              <span>API</span>
            </div>
            <h2 id="docs-api-heading" className="heading-lg">{labels.api.title}</h2>
            <p className="body-text text-[#999]">{labels.api.body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labels.api.groups.map((group, i) => (
              <Reveal delay={i * 60} key={group.title}>
                <article className="card flex flex-col gap-3">
                  <h3 className="heading-sm">{group.title}</h3>
                  <p className="body-text-sm text-[#999]">{group.body}</p>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    {group.endpoints.map((endpoint) => (
                      <code key={endpoint} className="text-xs font-mono text-[#7fee64] bg-[rgba(127,238,100,0.08)] rounded px-2 py-1 w-fit">{endpoint}</code>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* States */}
      <section className="py-[96px] section" aria-labelledby="docs-state-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col gap-3 max-w-[720px]">
            <div className="eyebrow">
              <Braces size={16} aria-hidden="true" />
              <span>{labels.states.title}</span>
            </div>
            <h2 id="docs-state-heading" className="heading-lg">{labels.states.title}</h2>
            <p className="body-text text-[#999]">{labels.states.body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labels.states.items.map((state, index) => {
              const Icon = stateIcons[index] ?? Braces;

              return (
                <article className="card flex flex-col gap-3" key={state.title}>
                  <div className="flex items-center gap-2">
                    <Icon size={17} aria-hidden="true" className="text-[#7fee64]" />
                    <h3 className="heading-sm">{state.title}</h3>
                  </div>
                  <p className="body-text-sm text-[#999]">{state.body}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {state.values.map((value) => (
                      <code key={value} className="pill">{value}</code>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Operator */}
      <section className="py-[96px] section" id="admin" aria-labelledby="docs-operator-heading">
        <div className="section-inner">
          <div className="card flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col gap-4 flex-1">
              <div className="eyebrow">
                <LockKeyhole size={16} aria-hidden="true" />
                <span>{labels.operator.title}</span>
              </div>
              <h2 id="docs-operator-heading" className="heading-lg">{labels.operator.title}</h2>
              <p className="body-text text-[#999]">{labels.operator.notice}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <a className="btn-secondary inline-flex items-center gap-2" href={localizedHref("/terms", locale)}>
                  <Scale size={16} aria-hidden="true" />
                  <span>{locale === "zh" ? "运营条款" : "Operating terms"}</span>
                </a>
                <a className="btn-secondary inline-flex items-center gap-2" href={localizedHref("/agents", locale)}>
                  <KeyRound size={16} aria-hidden="true" />
                  <span>{locale === "zh" ? "Agent 接入" : "Agent integration"}</span>
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {labels.operator.items.map((item) => (
                <div className="flex items-start gap-3" key={item}>
                  <ShieldCheck size={16} aria-hidden="true" className="text-[#10b981] shrink-0 mt-0.5" />
                  <span className="body-text-sm text-[#999]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="closing-cta">
        <div className="section-inner">
          <Reveal>
            <h2 className="heading-lg mb-4">{locale === "zh" ? "准备好开始了吗？" : "Ready to get started?"}</h2>
            <p className="body-text max-w-[480px] mx-auto mb-8">{locale === "zh" ? "在注册表中浏览可用技能或发布你自己的技能。" : "Browse available skills in the registry or publish your own."}</p>
            <div className="flex items-center justify-center gap-3">
              <a className="btn-primary" href={localizedHref("/registry", locale)}>
                <span>{locale === "zh" ? "浏览注册表" : "Browse registry"}</span>
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
