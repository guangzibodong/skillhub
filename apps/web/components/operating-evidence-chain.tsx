import {
  BadgeCheck,
  Banknote,
  ClipboardCheck,
  Code2,
  History,
  PackageCheck,
  PlugZap,
  ShieldCheck
} from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type EvidenceFocus = "admin" | "developer" | "marketplace" | "platform" | "publisher";

type EvidenceStageId = "publish" | "review" | "install" | "runtime" | "ledger" | "payout";

type EvidenceStat = {
  label: string;
  tone?: "attention" | "good" | "neutral";
  value: string;
};

type OperatingEvidenceChainProps = {
  focus: EvidenceFocus;
  locale: Locale;
  stats?: EvidenceStat[];
};

type EvidenceStage = {
  detail: string;
  href: string;
  id: EvidenceStageId;
  label: string;
  owner: string;
  state: string;
};

const stageIcons = {
  install: Code2,
  ledger: Banknote,
  payout: History,
  publish: PackageCheck,
  review: ClipboardCheck,
  runtime: PlugZap
} as const;

const focusStage: Record<EvidenceFocus, EvidenceStageId> = {
  admin: "review",
  developer: "runtime",
  marketplace: "install",
  platform: "ledger",
  publisher: "publish"
};

const copy: Record<
  Locale,
  {
    dataNote: string;
    fallbackStats: EvidenceStat[];
    focus: Record<EvidenceFocus, { body: string; eyebrow: string; title: string }>;
    source: string;
    stages: EvidenceStage[];
    view: string;
  }
> = {
  en: {
    dataNote: "Live rows stay live: empty production data is shown as empty, not replaced by demo supply.",
    fallbackStats: [
      { label: "Evidence rows", value: "Live" },
      { label: "Governance path", tone: "good", value: "REST + MCP" },
      { label: "Money state", value: "Ledger first" },
      { label: "Audit posture", tone: "good", value: "Reasoned writes" }
    ],
    focus: {
      admin: {
        body:
          "Operators need to prove that review, risk, money, delivery, and audit decisions are traceable before launch pressure arrives.",
        eyebrow: "Admin evidence chain",
        title: "Every operating decision has a reviewable record."
      },
      developer: {
        body:
          "A developer should see how discovery turns into project policy, project keys, governed invocation, cost, updates, and runtime evidence.",
        eyebrow: "Developer evidence chain",
        title: "Public inspection leads into controlled project install state."
      },
      marketplace: {
        body:
          "Discovery is credible only when a public listing connects to publisher trust, install readiness, runtime governance, and ledger-backed operations.",
        eyebrow: "Marketplace evidence chain",
        title: "The catalog points to the operating system behind it."
      },
      platform: {
        body:
          "SkillHub is not a directory: one skill can move from contract, to review, to install, to governed runtime, to ledger, payout, and audit.",
        eyebrow: "Operating evidence chain",
        title: "One visible path from publisher supply to agent use."
      },
      publisher: {
        body:
          "Publishers need a repeatable path from draft package to review repair, paid readiness, buyer demand, revenue state, and payout readiness.",
        eyebrow: "Publisher evidence chain",
        title: "A skill package can become a maintained marketplace product."
      }
    },
    source: "Evidence on this surface",
    stages: [
      {
        detail: "Manifest, version, permissions, runtime, examples, and pricing intent are saved as an organization-scoped draft.",
        href: "/publish",
        id: "publish",
        label: "Publish contract",
        owner: "Publisher",
        state: "Draft -> submitted"
      },
      {
        detail: "Automated manifest, runtime, example, and security checks feed a human review decision with notes and SLA.",
        href: "/admin",
        id: "review",
        label: "Review gate",
        owner: "Trust operator",
        state: "Queued -> decided"
      },
      {
        detail: "Approved supply becomes searchable listing data with install readiness, publisher trust, pricing, feedback, and alternatives.",
        href: "/marketplace",
        id: "install",
        label: "Marketplace install",
        owner: "Developer",
        state: "Inspect -> install"
      },
      {
        detail: "Project keys, policy approval, budget, rate limit, subscription state, REST, and MCP calls share the same gateway path.",
        href: "/developer",
        id: "runtime",
        label: "Runtime governance",
        owner: "Agent builder",
        state: "Invoke -> log"
      },
      {
        detail: "Billable usage and subscription periods post immutable transactions, commission splits, balance rows, refunds, and disputes.",
        href: "/admin",
        id: "ledger",
        label: "Ledger split",
        owner: "Finance admin",
        state: "Usage -> balance"
      },
      {
        detail: "Eligible balances move through reserve, finance review, manual PayPal/Alipay transfer, notification delivery, and audit logs.",
        href: "/publisher",
        id: "payout",
        label: "Payout and audit",
        owner: "Publisher + admin",
        state: "Available -> paid"
      }
    ],
    view: "Open"
  },
  zh: {
    dataNote: "只展示真实状态：生产环境没有数据时显示空状态，不用演示数据替代真实供给。",
    fallbackStats: [
      { label: "证据行", value: "真实状态" },
      { label: "治理路径", tone: "good", value: "REST + MCP" },
      { label: "资金状态", value: "先入账本" },
      { label: "审计姿态", tone: "good", value: "带理由写入" }
    ],
    focus: {
      admin: {
        body: "运营后台要证明审核、风险、资金、投递和审计决策都能追踪，不能等上线压力来了才补记录。",
        eyebrow: "后台证据链",
        title: "每个运营决策都有可复核记录。"
      },
      developer: {
        body: "开发者需要看到，市场发现如何变成项目策略、项目 Key、受治理调用、成本、更新和运行证据。",
        eyebrow: "开发者证据链",
        title: "公开查看之后，项目安装会进入受控项目状态。"
      },
      marketplace: {
        body: "市场可信不只靠列表，而是公开技能能连接发布者信任、安装准备、运行治理和账本运营。",
        eyebrow: "市场证据链",
        title: "目录背后要能看见真实运营系统。"
      },
      platform: {
        body: "SkillHub 不是静态目录：一个技能可以从合约、审核、安装、受治理运行，一直走到账本、提现和审计。",
        eyebrow: "运营证据链",
        title: "从发布者供给到 Agent 使用，一条路径看清楚。"
      },
      publisher: {
        body: "发布者需要一条可重复路径：草稿包、审核修复、付费就绪、买方需求、收入状态和提现准备。",
        eyebrow: "发布者证据链",
        title: "技能包可以变成持续维护的市场产品。"
      }
    },
    source: "当前页面证据",
    stages: [
      {
        detail: "Manifest、版本、权限、运行端点、示例和定价意图会保存为组织级草稿。",
        href: "/publish",
        id: "publish",
        label: "发布合约",
        owner: "发布者",
        state: "草稿 -> 提交"
      },
      {
        detail: "Manifest、runtime、example、security 自动检查会进入人工审核决策，并保留备注和 SLA。",
        href: "/admin",
        id: "review",
        label: "审核闸门",
        owner: "信任运营",
        state: "排队 -> 决策"
      },
      {
        detail: "批准后的供给会进入可搜索列表，带安装准备、发布者信任、价格、反馈和替代方案。",
        href: "/marketplace",
        id: "install",
        label: "市场安装",
        owner: "开发者",
        state: "检查 -> 安装"
      },
      {
        detail: "项目 Key、策略审批、预算、限流、订阅状态、REST 和 MCP 调用共用同一条网关治理路径。",
        href: "/developer",
        id: "runtime",
        label: "运行治理",
        owner: "Agent 构建者",
        state: "调用 -> 日志"
      },
      {
        detail: "可计费用量和订阅周期会生成不可变交易、佣金分成、余额行、退款和争议调整。",
        href: "/admin",
        id: "ledger",
        label: "账本分成",
        owner: "财务后台",
        state: "用量 -> 余额"
      },
      {
        detail: "合格余额会经过预留、财务审核、PayPal/Alipay 人工转账、通知投递和审计日志。",
        href: "/publisher",
        id: "payout",
        label: "提现与审计",
        owner: "发布者 + 后台",
        state: "可用 -> 已打款"
      }
    ],
    view: "打开"
  }
};

export function OperatingEvidenceChain({ focus, locale, stats }: OperatingEvidenceChainProps) {
  const labels = copy[locale];
  const focusCopy = labels.focus[focus];
  const visibleStats = stats?.length ? stats : labels.fallbackStats;
  const activeStage = focusStage[focus];

  return (
    <section className={`evidence-chain evidence-chain--${focus}`} aria-labelledby={`${focus}-evidence-chain-heading`}>
      <div className="evidence-chain__head">
        <div>
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{focusCopy.eyebrow}</span>
          </div>
          <h2 id={`${focus}-evidence-chain-heading`}>{focusCopy.title}</h2>
        </div>
        <p>{focusCopy.body}</p>
      </div>

      <div className="evidence-chain__rail" aria-label={focusCopy.eyebrow}>
        {labels.stages.map((stage, index) => {
          const Icon = stageIcons[stage.id];
          const isActive = stage.id === activeStage;
          const isOperatorStage = stage.id === "review" || stage.id === "ledger";
          const shouldHideOperatorHref = focus !== "admin" && isOperatorStage;
          const stageClassName = [
            "evidence-stage",
            isActive ? "evidence-stage--active" : "",
            shouldHideOperatorHref ? "evidence-stage--operator-only" : ""
          ]
            .filter(Boolean)
            .join(" ");
          const stageContent = (
            <>
              <span className="evidence-stage__index">{String(index + 1).padStart(2, "0")}</span>
              <span className="evidence-stage__icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <span className="evidence-stage__copy">
                <strong>{stage.label}</strong>
                <small>{stage.owner}</small>
              </span>
              <span className="evidence-stage__state">{stage.state}</span>
              <span className="evidence-stage__detail">{stage.detail}</span>
            </>
          );

          if (shouldHideOperatorHref) {
            return (
              <span aria-label={`${stage.label}: ${stage.owner}`} className={stageClassName} key={stage.id}>
                {stageContent}
              </span>
            );
          }

          return (
            <a className={stageClassName} href={localizedHref(stage.href, locale)} key={stage.id}>
              {stageContent}
            </a>
          );
        })}
      </div>

      <div className="evidence-chain__bottom">
        <div className="evidence-chain__stats" aria-label={labels.source}>
          {visibleStats.slice(0, 4).map((stat) => (
            <div className={`evidence-stat evidence-stat--${stat.tone ?? "neutral"}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
        <div className="evidence-chain__note">
          <BadgeCheck size={15} aria-hidden="true" />
          <span>{labels.dataNote}</span>
        </div>
      </div>
    </section>
  );
}
