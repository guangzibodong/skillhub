import {
  BadgeDollarSign,
  BellRing,
  ClipboardCheck,
  DatabaseZap,
  FileWarning,
  Gavel,
  Handshake,
  LockKeyhole,
  RotateCcw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/terms",
    en: {
      title: "SkillHub Operating Terms",
      description:
        "Read SkillHub operating terms for discovery, publisher review, runtime governance, commercial readiness, incidents, data, and support.",
    },
    zh: {
      title: "SkillHub 运营条款",
      description:
        "阅读 SkillHub 关于公开发现、发布者审核、运行治理、商业化准备、事故、数据和支持的运营条款。",
    },
  });
}

const sectionIcons = [
  Handshake,
  ClipboardCheck,
  ShieldCheck,
  BadgeDollarSign,
  RotateCcw,
  DatabaseZap,
  FileWarning,
  BellRing,
  LockKeyhole,
] as const;

const pageCopy = {
  en: {
    eyebrow: "Operating terms",
    title: "SkillHub operating terms.",
    description:
      "These terms explain how SkillHub handles public discovery, publisher review, runtime governance, commercial readiness, incidents, data, notifications, and support.",
    effective: "Current operating policy",
    primary: "Publish a skill",
    secondary: "Read API docs",
    summary: [
      ["Scope", "Registry, marketplace, runtime gateway"],
      ["Commercial", "Billing is enabled only for approved workspaces"],
      ["Trust", "Review, incidents, reports, takedowns"],
      ["Data", "Manifest, runtime, billing, notification records"],
    ],
    sections: [
      {
        title: "Buyer and developer use",
        body: "Developers may discover, save, install, test, and invoke skills only through projects and project-scoped credentials.",
        bullets: [
          "Developers should inspect manifest schemas, permissions, pricing, version, review status, incidents, and published feedback before installation.",
          "Project owners remain responsible for approving high-risk permissions, setting budgets, rotating API keys, and adopting reviewed version updates.",
          "Runtime test calls from the console are treated separately from billable provider execution and must show their billing state clearly.",
        ],
      },
      {
        title: "Publisher responsibilities",
        body: "Publishers must provide accurate skill contracts and maintain public listings as operational products, not one-time uploads.",
        bullets: [
          "Every listing must include display name, description, version, runtime, input/output schemas, permissions, examples, changelog, and support path.",
          "Verified or installed versions are immutable; publishers must create a new semantic version for behavior, schema, permission, pricing, or runtime changes.",
          "Paid publishing requires an active publisher profile, approved pricing, accepted operating terms, and finance-reviewed commercial readiness before public activation.",
        ],
      },
      {
        title: "Review, safety, and takedown",
        body: "SkillHub may review, reject, restrict, suspend, deprecate, or remove listings to protect developers, publishers, and the marketplace.",
        bullets: [
          "Verification requires automated manifest, runtime, example, and security checks plus a reviewer decision.",
          "Abuse reports, critical incidents, undeclared permissions, malicious runtime behavior, privacy issues, or billing abuse can trigger restriction or suspension.",
          "Suppressed distribution is a ranking action, not a takedown; publishers can use the marketplace appeal workflow when quality gaps are fixed.",
        ],
      },
      {
        title: "Pricing, commission, and billing",
        body: "Commercial records are handled through auditable billing, split, balance, refund, and payout state so money movement can be reviewed before action is taken.",
        bullets: [
          "Usage logs do not pay publishers directly; eligible billable usage creates transaction, split, and publisher balance records first.",
          "The default split model is 20% platform fee and 80% publisher share unless a newer active commission rule applies.",
          "Payout readiness, balance maturity, transfer reference, and provider configuration must be reviewed before a publisher payout is marked paid.",
        ],
      },
      {
        title: "Refunds and disputes",
        body: "Refunds and disputes are handled as auditable adjustments instead of editing historical transactions.",
        bullets: [
          "Finance operators can approve, reject, post, fail, warn, win, or lose adjustment records with required reasons.",
          "Posted refunds create negative adjustment transactions, negative splits, and reversed publisher balance entries.",
          "Dispute losses can post refund adjustments automatically, while publishers and project operators can inspect scoped adjustment history.",
        ],
      },
      {
        title: "Data retention and privacy posture",
        body: "SkillHub stores operational records needed for registry trust, runtime governance, billing traceability, and account safety.",
        bullets: [
          "Stored records include manifests, versions, review decisions, runtime checks, installs, policies, invocations, usage, ledger entries, notifications, and audit logs.",
          "Raw user tokens, API keys, email verification codes, OAuth secrets, webhook signing secrets, and provider keys must not be exposed after first reveal or through admin lists.",
          "Publishers must declare data retention notes when skills handle user, business, secret, financial, or sensitive operational data.",
        ],
      },
      {
        title: "Incidents, deprecation, and support",
        body: "Operational failures should create durable signals for developers, publishers, and trust operators.",
        bullets: [
          "Runtime incidents can move through open, monitoring, resolved, and postmortem states with severity and decision reason.",
          "Installed-skill update inboxes should show new versions, deprecations, security notes, and incident recovery states before agents are moved.",
          "Publishers should maintain support paths, changelogs, and replacement guidance when versions are deprecated or skills are suspended.",
        ],
      },
      {
        title: "Notifications and webhooks",
        body: "In-app, email, and webhook notification states must remain reliable, scoped, and redacted.",
        bullets: [
          "Users can manage notification preferences for review, update, runtime, billing, payout, buyer-request, and account-security events.",
          "External email and webhook queues expose attempts, provider metadata, retry scheduling, signed webhook delivery, and redacted payload summaries.",
          "Email and webhook delivery must never expose verification codes, tokens, secrets, or sensitive payload fields through admin views.",
        ],
      },
      {
        title: "Provider integrations",
        body: "Payment, payout, email, OAuth, webhook, and tax/KYC providers are treated as production dependencies and must be configured before the related workflow is offered publicly.",
        bullets: [
          "Public pages must not imply live payment capture, automated payouts, or provider delivery unless the corresponding provider flow is configured.",
          "Provider setup must keep debug previews disabled and must redact tokens, verification codes, and secret payload fields from operator views.",
          "Terms may be updated when provider, region, tax, refund-window, KYC, and minimum-payout decisions change.",
        ],
      },
    ],
    operatorTitle: "Launch operator checklist",
    operatorItems: [
      "Run launch readiness and resolve blockers before public rollout.",
      "Keep demo fallback and legacy direct-token signup disabled in production.",
      "Review active notification templates and external delivery queues.",
      "Create or confirm active commission rules before billable usage posting.",
      "Confirm public signup, refund window, payout threshold, and review SLA before paid access is enabled.",
    ],
    noticeTitle: "Policy status",
    notices: [
      "This page is the current product operating policy for SkillHub public workflows.",
      "Final legal terms can replace or extend this page without changing the underlying review, billing, and audit state machines.",
    ],
  },
  zh: {
    eyebrow: "运营条款",
    title: "SkillHub 运营条款。",
    description:
      "这些条款说明 SkillHub 如何处理公开发现、发布者审核、运行治理、商业化准备、事故、数据、通知和支持流程。",
    effective: "当前运营政策",
    primary: "发布技能",
    secondary: "阅读 API 文档",
    summary: [
      ["范围", "注册表、市场、运行网关"],
      ["商业化", "仅对已审核工作区启用计费"],
      ["信任", "审核、事故、举报、下架"],
      ["数据", "协议、运行、账务、通知记录"],
    ],
    sections: [
      {
        title: "买家和开发者使用",
        body: "开发者只能通过项目和项目级凭据来发现、保存、安装、测试和调用技能。",
        bullets: [
          "安装前应检查 manifest schema、权限、价格、版本、审核状态、事故和公开反馈。",
          "项目负责人负责审批高风险权限、设置预算、轮换 API Key，并采用已审核的版本更新。",
          "控制台测试调用应与可计费执行分开显示，并清楚标明当前计费状态。",
        ],
      },
      {
        title: "发布者责任",
        body: "发布者必须提供准确的技能协议，并把公开上架当成可运营产品，而不是一次性上传。",
        bullets: [
          "每个 listing 必须包含名称、描述、版本、运行时、输入输出 schema、权限、示例、变更记录和支持路径。",
          "已验证或已安装版本不可就地修改；行为、schema、权限、价格或运行时变化都要创建新的语义版本。",
          "付费发布需要发布者资料有效、价格已批准、已接受运营条款，并完成财务复核的商业化准备后才可公开启用。",
        ],
      },
      {
        title: "审核、安全和下架",
        body: "SkillHub 可以审核、拒绝、限制、暂停、废弃或移除 listing，以保护开发者、发布者和市场。",
        bullets: [
          "验证需要自动 manifest、运行时、示例和安全检查，再加 reviewer 决策。",
          "滥用举报、重大事故、未声明权限、恶意运行行为、隐私问题或计费滥用可触发限制或暂停。",
          "压制分发是排名操作而非下架；修复质量问题后发布者可使用市场申诉流程。",
        ],
      },
      {
        title: "定价、佣金和计费",
        body: "商业记录通过可审计的计费、拆分、余额、退款和打款状态处理，资金动作发生前必须能够复核。",
        bullets: [
          "用量日志不会直接向发布者付款；符合条件的可计费用量会先生成交易、拆分和发布者余额记录。",
          "默认拆分模型为平台 20% 费用和发布者 80% 分成，除非新的有效佣金规则适用于后续记账。",
          "发布者打款在标记为已支付前，必须复核打款准备、余额成熟度、转账引用和服务商配置。",
        ],
      },
      {
        title: "退款和争议",
        body: "退款和争议以可审计调整方式处理，而不是修改历史交易。",
        bullets: [
          "财务操作员可批准、拒绝、记账、标记失败、警告、胜诉或败诉调整记录，并附必需原因。",
          "已记账退款会产生负向调整交易、负向拆分和反转的发布者余额条目。",
          "争议败诉可自动发起退款调整，发布者和项目操作员可查看范围内的调整历史。",
        ],
      },
      {
        title: "数据保留和隐私姿态",
        body: "SkillHub 存储注册信任、运行治理、账务可追溯和账号安全所需的运营记录。",
        bullets: [
          "存储记录包括 manifest、版本、审核决策、运行检查、安装、策略、调用、用量、账本、通知和审计日志。",
          "原始用户 token、API Key、邮件验证码、OAuth Secret、Webhook Signing Secret 和服务商密钥首显后不得再暴露，也不得通过管理列表泄露。",
          "技能处理用户、商业、密钥、财务或敏感运营数据时，发布者必须声明数据保留说明。",
        ],
      },
      {
        title: "事故、废弃和支持",
        body: "运行故障应为开发者、发布者和信任操作员创建持久信号。",
        bullets: [
          "运行事故可经过 open、monitoring、resolved 和 postmortem 状态，并带严重级别和决策原因。",
          "已安装技能的更新收件箱应在迁移 agent 前显示新版本、废弃通知、安全说明和事故恢复状态。",
          "版本废弃或技能暂停时，发布者应维护支持路径、变更记录和替代建议。",
        ],
      },
      {
        title: "通知和 Webhook",
        body: "站内、邮件和 webhook 通知状态必须可靠、限定范围并做好脱敏。",
        bullets: [
          "用户可管理 review、update、runtime、billing、payout、buyer-request 和 account-security 的通知偏好。",
          "外部 email 和 webhook 队列展示 attempts、provider metadata、retry schedule、签名 webhook delivery 和脱敏 payload summary。",
          "邮件和 webhook 投递不得通过后台视图暴露验证码、token、secret 或敏感 payload 字段。",
        ],
      },
      {
        title: "服务商集成",
        body: "支付、打款、邮件、OAuth、Webhook 和税务/KYC 服务商都属于生产依赖；相关流程对外开放前必须完成配置。",
        bullets: [
          "公开页面不得暗示支付扣款、自动打款或服务商投递已上线，除非对应服务商流程已经配置完成。",
          "服务商配置必须关闭 debug 预览，并在运营视图中脱敏 token、验证码和 secret payload 字段。",
          "当服务商、地区、税务、退款窗口、KYC 或最低打款门槛决策变化时，条款可同步更新。",
        ],
      },
    ],
    operatorTitle: "上线运营检查",
    operatorItems: [
      "公开上线前运行 launch readiness，并先解决 blocker。",
      "生产环境关闭 demo fallback 和 legacy direct-token signup。",
      "复核已启用通知模板和外部投递队列。",
      "可计费用量记账前，创建或确认生效佣金规则。",
      "付费访问启用前，确认公开注册策略、退款窗口、打款门槛和审核 SLA。",
    ],
    noticeTitle: "条款状态",
    notices: [
      "本页是 SkillHub 公开工作流的当前产品运营政策。",
      "最终法律条款可替换或扩展本页，不影响已建立的审核、计费和审计状态机。",
    ],
  },
} satisfies Record<Locale, {
  description: string;
  effective: string;
  eyebrow: string;
  noticeTitle: string;
  notices: string[];
  operatorItems: string[];
  operatorTitle: string;
  primary: string;
  secondary: string;
  summary: Array<[string, string]>;
  title: string;
  sections: Array<{
    body: string;
    bullets: string[];
    title: string;
  }>;
}>;

export default async function TermsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = pageCopy[locale];

  return (
    <AppShell active="terms" locale={locale}>
      <section className="py-[96px] pt-32">
        <div className="section-inner">
          <Reveal>
            <div className="max-w-[720px]">
              <div className="eyebrow">
                <Scale size={16} aria-hidden="true" />
                <span>{labels.eyebrow}</span>
              </div>
              <h1 className="heading-xl mt-4">{labels.title}</h1>
              <p className="body-text mt-4 text-[#999]">{labels.description}</p>
              <span className="inline-block mt-4 text-sm text-[#10b981] font-medium">{labels.effective}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <a className="btn-primary" href={localizedHref("/publish", locale)}>
                <ClipboardCheck size={18} aria-hidden="true" />
                <span>{labels.primary}</span>
              </a>
              <a className="btn-secondary" href={localizedHref("/docs", locale)}>
                <Gavel size={18} aria-hidden="true" />
                <span>{labels.secondary}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-[96px] section-divider" aria-label={locale === "zh" ? "条款摘要" : "Terms summary"}>
        <div className="section-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {labels.summary.map(([label, value], i) => (
              <Reveal key={label} delay={i * 60}>
                <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6">
                  <span className="block text-sm text-[#666] mb-1">{label}</span>
                  <strong className="text-white text-sm">{value}</strong>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[96px] section-divider">
        <div className="section-inner">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 flex flex-col gap-6">
              {labels.sections.map((section, index) => {
                const Icon = sectionIcons[index];

                return (
                  <Reveal key={section.title} delay={index * 60}>
                    <article
                      id={`policy-${index + 1}`}
                      className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 transition-transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-3">
                        <Icon size={16} aria-hidden="true" />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <h2 className="heading-md mb-2">{section.title}</h2>
                      <p className="body-text-sm text-[#999] mb-4">{section.body}</p>
                      <ul className="list-disc list-inside space-y-2">
                        {section.bullets.map((item) => (
                          <li key={item} className="body-text-sm text-[#999]">{item}</li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <aside className="lg:w-[340px] shrink-0">
              <Reveal delay={100}>
                <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 sticky top-24">
                  <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-4">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>{labels.operatorTitle}</span>
                  </div>
                  <div className="space-y-3 mb-6">
                    {labels.operatorItems.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <LockKeyhole size={15} className="shrink-0 mt-0.5 text-[#525252]" aria-hidden="true" />
                        <span className="body-text-sm text-[#999]">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[rgba(255,255,255,0.08)] pt-4">
                    <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-3">
                      <FileWarning size={16} aria-hidden="true" />
                      <span>{labels.noticeTitle}</span>
                    </div>
                    {labels.notices.map((item) => (
                      <p key={item} className="body-text-sm text-[#999] mb-2 last:mb-0">{item}</p>
                    ))}
                  </div>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
