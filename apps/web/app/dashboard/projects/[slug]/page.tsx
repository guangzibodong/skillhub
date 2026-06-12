import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  FolderPlus,
  Gauge,
  KeyRound,
  LockKeyhole,
  LogIn,
  PackageCheck,
  RadioTower,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  ShieldAlert,
  WalletCards
} from "lucide-react";
import { JourneyRail } from "@/components/journey-rail";
import { ProjectAgentConnectionPanel } from "@/components/project-agent-connection-panel";
import { ProjectApiKeyManager } from "@/components/project-api-key-manager";
import { ProjectInvoiceManager } from "@/components/project-invoice-manager";
import { ProjectRuntimeTestPanel } from "@/components/project-runtime-test-panel";
import { ProjectSavedSkillManager } from "@/components/project-saved-skill-manager";
import { ProjectSkillPolicyManager } from "@/components/project-skill-policy-manager";
import { ProjectSubscriptionManager } from "@/components/project-subscription-manager";
import { ProjectUpdateInboxManager } from "@/components/project-update-inbox-manager";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { AppShell } from "@/components/app-shell";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  formatPercent,
  getProjectDisputes,
  getProjectRefunds,
  getDeveloperProjectDetail,
  type DeveloperProjectDetail,
  type DisputeRecord,
  type RefundRecord
} from "@/lib/ops-data";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildNoIndexMetadata("SkillHub Project");

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type ProjectPriorityTone = "danger" | "ready" | "warning";

type ProjectPriorityItem = {
  actionLabel: string;
  detail: string;
  href: string;
  id: string;
  metric: string;
  priority: number;
  title: string;
  tone: ProjectPriorityTone;
};

const developerAccessRoles = ["developer", "owner", "admin", "super_admin"];

const copy = {
  en: {
    active: "Active",
    activeKeys: "Active keys",
    approved: "Approved",
    avgLatency: "Average latency",
    back: "Back to dashboard",
    billingHeaders: ["Skill", "Status", "Model", "Period"],
    billingTitle: "Subscriptions and billing",
    budget: "Monthly policy budget",
    callHeaders: ["Skill", "Status", "Latency", "Error"],
    calls: "Runtime calls",
    callsTitle: "Recent runtime calls",
    description:
      "Control the skills, runtime keys, budgets, version updates, and operational signals this agent project depends on.",
    empty: "No records yet",
    eyebrow: "Developer project",
    health: "Project health",
    installed: "Installed skills",
    invoicesTitle: "Invoices",
    keysTitle: "Runtime API keys",
    noDate: "n/a",
    ownerReview: "Owner review",
    policyState: "Policy state",
    readiness: {
      approved: ["Policy approval", "High-risk installs must be cleared before governed runtime."],
      install: ["Skill installed", "At least one marketplace listing has become project state."],
      key: ["Runtime key ready", "A reveal-once project key exists for REST or MCP clients."],
      runtime: ["Runtime quality watched", "Recent calls are logged with status, latency, and error codes."],
      needsAction: "Needs action",
      ready: "Ready",
      title: "Runtime readiness",
      update: ["Update inbox", "Version updates and incidents need an explicit project decision."]
    },
    revoked: "Revoked",
    savedSkillsTitle: "Saved skills",
    skillHeaders: ["Skill", "Policy", "Runtime", "Cost", "Next action"],
    skillTitle: "Installed skills and policies",
    spend: "Usage cost",
    subscriptions: "Active subscriptions",
    successRate: "Success rate",
    suspended: "Suspended",
    updatesTitle: "Update inbox"
  },
  zh: {
    active: "活跃",
    activeKeys: "活跃 Key",
    approved: "已批准",
    avgLatency: "平均延迟",
    back: "返回工作台",
    billingHeaders: ["技能", "状态", "模式", "周期"],
    billingTitle: "订阅与账单",
    budget: "月度策略预算",
    callHeaders: ["技能", "状态", "延迟", "错误"],
    calls: "运行调用",
    callsTitle: "最近运行调用",
    description: "管理这个智能体项目依赖的技能、运行密钥、预算、版本更新和调用质量信号。",
    empty: "暂无记录",
    eyebrow: "开发者项目",
    health: "项目健康",
    installed: "已安装技能",
    invoicesTitle: "发票",
    keysTitle: "运行 API Key",
    noDate: "暂无",
    ownerReview: "负责人审批",
    policyState: "策略状态",
    readiness: {
      approved: ["策略审批", "高风险安装必须先完成负责人确认，才能进入治理运行。"],
      install: ["已有技能安装", "至少一个市场上架项已经变成项目状态。"],
      key: ["运行 Key 就绪", "已有一次性展示的项目 Key，可供 REST 或 MCP 客户端使用。"],
      runtime: ["运行质量可监控", "最近调用已经记录状态、延迟和错误码。"],
      needsAction: "待处理",
      ready: "已就绪",
      title: "运行准备度",
      update: ["更新队列", "版本更新和事故通知需要明确的项目侧决策。"]
    },
    revoked: "已撤销",
    savedSkillsTitle: "已保存技能",
    skillHeaders: ["技能", "策略", "运行", "成本", "下一步"],
    skillTitle: "已安装技能与策略",
    spend: "使用成本",
    subscriptions: "活跃订阅",
    successRate: "成功率",
    suspended: "已暂停",
    updatesTitle: "更新收件箱"
  }
} as const;

const projectPriorityCopy: Record<
  Locale,
  {
    action: string;
    body: string;
    eyebrow: string;
    metrics: {
      installs: string;
      keys: string;
      policy: string;
      runtime: string;
      updates: string;
    };
    queueLabel: string;
    readyAction: string;
    readyDetail: string;
    readyMetric: string;
    readyTitle: string;
    title: string;
    tones: Record<ProjectPriorityTone, string>;
    actions: {
      adjustments: string;
      billing: string;
      install: string;
      keys: string;
      policy: string;
      runtime: string;
      saved: string;
      suspended: string;
      test: string;
      updates: string;
    };
    items: {
      adjustments: string;
      billing: string;
      install: string;
      keys: string;
      policy: string;
      runtime: string;
      saved: string;
      suspended: string;
      test: string;
      updates: string;
    };
    titles: {
      adjustments: string;
      billing: string;
      install: string;
      keys: string;
      policy: string;
      runtime: string;
      saved: string;
      suspended: string;
      test: string;
      updates: string;
    };
  }
> = {
  en: {
    action: "Open first action",
    body:
      "This queue turns the project detail into a daily command center: runtime keys, installed skills, owner approvals, version updates, runtime proof, billing ledger state, and saved follow-ups stay ordered before the deeper panels.",
    eyebrow: "Project operations queue",
    metrics: {
      installs: "Installed",
      keys: "Active keys",
      policy: "Policy gates",
      runtime: "Runtime issues",
      updates: "Open updates"
    },
    queueLabel: "Project priority queue",
    readyAction: "Run another governed test",
    readyDetail:
      "Key, install, policy, update, runtime, and billing signals are healthy. Keep using console tests and runtime logs before expanding agent traffic.",
    readyMetric: "Healthy",
    readyTitle: "Project runtime loop is healthy",
    title: "What should this project handle before agents scale?",
    tones: {
      danger: "Urgent",
      ready: "Ready",
      warning: "Needs work"
    },
    actions: {
      adjustments: "Open refund history",
      billing: "Open subscriptions",
      install: "Browse marketplace",
      keys: "Open keys",
      policy: "Open policy",
      runtime: "Inspect calls",
      saved: "Open saved skills",
      suspended: "Open policy",
      test: "Run runtime test",
      updates: "Open update inbox"
    },
    items: {
      adjustments:
        "Refunds or disputes tied to this project need visibility before the buyer, publisher, and finance story can be trusted.",
      billing:
        "A subscription period, renewal, or invoice row needs ledger proof before paid runtime can be explained cleanly.",
      install:
        "No installed skill exists yet, so this project cannot prove that marketplace discovery became governed project state.",
      keys:
        "No active reveal-once project key exists for REST or MCP clients, so agents cannot connect safely yet.",
      policy:
        "High-risk installs or project policy still need owner approval before the gateway allows normal runtime.",
      runtime:
        "Blocked calls, runtime errors, open incidents, or low success rate should be reviewed before increasing agent traffic.",
      saved:
        "Saved skills are waiting to be installed or cleared, which is useful follow-up after discovery.",
      suspended:
        "Suspended install or policy state is blocking normal governed invocation and needs an explicit recovery decision.",
      test:
        "The project has installed skills and an active key, but no runtime log yet. Run a governed console test to create proof.",
      updates:
        "Version updates or incident notices are waiting for adoption, scheduling, acknowledgement, or ignore decisions."
    },
    titles: {
      adjustments: "Refund and dispute impact",
      billing: "Billing ledger proof",
      install: "Skill installation",
      keys: "Runtime key",
      policy: "Owner approval",
      runtime: "Runtime quality",
      saved: "Saved follow-up",
      suspended: "Suspended runtime",
      test: "Runtime proof",
      updates: "Update decision"
    }
  },
  zh: {
    action: "\u6253\u5f00\u7b2c\u4e00\u4e2a\u52a8\u4f5c",
    body:
      "\u8fd9\u4e2a\u961f\u5217\u628a\u9879\u76ee\u8be6\u60c5\u9875\u53d8\u6210\u6bcf\u5929\u53ef\u7528\u7684\u6307\u6325\u53f0\uff1a\u8fd0\u884c Key\u3001\u5df2\u5b89\u88c5\u6280\u80fd\u3001\u8d1f\u8d23\u4eba\u5ba1\u6279\u3001\u7248\u672c\u66f4\u65b0\u3001\u8fd0\u884c\u8bc1\u636e\u3001\u8d26\u672c\u72b6\u6001\u548c\u5df2\u4fdd\u5b58\u540e\u7eed\u5de5\u4f5c\u90fd\u4f1a\u5728\u6df1\u5c42\u9762\u677f\u524d\u5148\u6392\u597d\u4f18\u5148\u7ea7\u3002",
    eyebrow: "\u9879\u76ee\u8fd0\u8425\u961f\u5217",
    metrics: {
      installs: "\u5df2\u5b89\u88c5",
      keys: "\u6d3b\u8dc3 Key",
      policy: "\u7b56\u7565\u95e8\u69db",
      runtime: "\u8fd0\u884c\u95ee\u9898",
      updates: "\u5f85\u5904\u7406\u66f4\u65b0"
    },
    queueLabel: "\u9879\u76ee\u4f18\u5148\u7ea7\u961f\u5217",
    readyAction: "\u518d\u8fd0\u884c\u4e00\u6b21\u6cbb\u7406\u6d4b\u8bd5",
    readyDetail:
      "Key\u3001\u5b89\u88c5\u3001\u7b56\u7565\u3001\u66f4\u65b0\u3001\u8fd0\u884c\u548c\u8d26\u5355\u4fe1\u53f7\u90fd\u5904\u4e8e\u5065\u5eb7\u72b6\u6001\u3002\u6269\u5927 Agent \u6d41\u91cf\u524d\uff0c\u7ee7\u7eed\u7528\u63a7\u5236\u53f0\u6d4b\u8bd5\u548c\u8fd0\u884c\u65e5\u5fd7\u505a\u590d\u67e5\u3002",
    readyMetric: "\u5065\u5eb7",
    readyTitle: "\u9879\u76ee\u8fd0\u884c\u95ed\u73af\u5065\u5eb7",
    title: "\u8fd9\u4e2a\u9879\u76ee\u5728 Agent \u6269\u5927\u524d\u8981\u5148\u5904\u7406\u4ec0\u4e48\uff1f",
    tones: {
      danger: "\u7d27\u6025",
      ready: "\u5df2\u5c31\u7eea",
      warning: "\u5f85\u5904\u7406"
    },
    actions: {
      adjustments: "\u6253\u5f00\u9000\u6b3e\u5386\u53f2",
      billing: "\u6253\u5f00\u8ba2\u9605",
      install: "\u6d4f\u89c8\u5e02\u573a",
      keys: "\u6253\u5f00 Key",
      policy: "\u6253\u5f00\u7b56\u7565",
      runtime: "\u68c0\u67e5\u8c03\u7528",
      saved: "\u6253\u5f00\u5df2\u4fdd\u5b58\u6280\u80fd",
      suspended: "\u6253\u5f00\u7b56\u7565",
      test: "\u8fd0\u884c\u6d4b\u8bd5",
      updates: "\u6253\u5f00\u66f4\u65b0\u961f\u5217"
    },
    items: {
      adjustments:
        "\u4e0e\u8fd9\u4e2a\u9879\u76ee\u76f8\u5173\u7684\u9000\u6b3e\u6216\u4e89\u8bae\u9700\u8981\u53ef\u89c1\uff0c\u4e70\u65b9\u3001\u53d1\u5e03\u8005\u548c\u8d22\u52a1\u7684\u94fe\u8def\u624d\u80fd\u88ab\u4fe1\u4efb\u3002",
      billing:
        "\u8ba2\u9605\u5468\u671f\u3001\u7eed\u8ba2\u6216\u53d1\u7968\u884c\u9700\u8981\u8d26\u672c\u8bc1\u636e\uff0c\u624d\u80fd\u628a\u4ed8\u8d39\u8fd0\u884c\u8bf4\u6e05\u695a\u3002",
      install:
        "\u9879\u76ee\u8fd8\u6ca1\u6709\u5b89\u88c5\u6280\u80fd\uff0c\u65e0\u6cd5\u8bc1\u660e\u5e02\u573a\u53d1\u73b0\u5df2\u7ecf\u53d8\u6210\u53d7\u6cbb\u7406\u7684\u9879\u76ee\u72b6\u6001\u3002",
      keys:
        "\u8fd8\u6ca1\u6709\u6d3b\u8dc3\u7684\u4e00\u6b21\u6027\u5c55\u793a\u9879\u76ee Key\uff0cREST \u6216 MCP \u5ba2\u6237\u7aef\u6682\u65f6\u4e0d\u80fd\u5b89\u5168\u63a5\u5165\u3002",
      policy:
        "\u9ad8\u98ce\u9669\u5b89\u88c5\u6216\u9879\u76ee\u7b56\u7565\u8fd8\u5728\u7b49\u8d1f\u8d23\u4eba\u6279\u51c6\uff0c\u7f51\u5173\u624d\u80fd\u653e\u884c\u6b63\u5e38\u8fd0\u884c\u3002",
      runtime:
        "\u963b\u65ad\u8c03\u7528\u3001\u8fd0\u884c\u9519\u8bef\u3001\u672a\u7ed3\u4e8b\u6545\u6216\u6210\u529f\u7387\u504f\u4f4e\uff0c\u90fd\u5e94\u8be5\u5728\u6269\u5927 Agent \u6d41\u91cf\u524d\u590d\u67e5\u3002",
      saved:
        "\u5df2\u4fdd\u5b58\u6280\u80fd\u6b63\u5728\u7b49\u5f85\u5b89\u88c5\u6216\u6e05\u7406\uff0c\u8fd9\u662f\u5e02\u573a\u53d1\u73b0\u4e4b\u540e\u5f88\u6709\u7528\u7684\u540e\u7eed\u5de5\u4f5c\u3002",
      suspended:
        "\u5b89\u88c5\u6216\u7b56\u7565\u5df2\u6682\u505c\uff0c\u6b63\u5728\u963b\u65ad\u6b63\u5e38\u6cbb\u7406\u8c03\u7528\uff0c\u9700\u8981\u660e\u786e\u6062\u590d\u51b3\u7b56\u3002",
      test:
        "\u9879\u76ee\u5df2\u6709\u5b89\u88c5\u6280\u80fd\u548c\u6d3b\u8dc3 Key\uff0c\u4f46\u8fd8\u6ca1\u6709\u8fd0\u884c\u65e5\u5fd7\u3002\u5148\u8dd1\u4e00\u6b21\u6cbb\u7406\u6d4b\u8bd5\u6765\u4ea7\u751f\u8bc1\u636e\u3002",
      updates:
        "\u7248\u672c\u66f4\u65b0\u6216\u4e8b\u6545\u901a\u77e5\u6b63\u5728\u7b49\u5f85\u91c7\u7528\u3001\u6392\u671f\u3001\u786e\u8ba4\u6216\u5ffd\u7565\u51b3\u7b56\u3002"
    },
    titles: {
      adjustments: "\u9000\u6b3e\u4e0e\u4e89\u8bae\u5f71\u54cd",
      billing: "\u8d26\u672c\u8bc1\u636e",
      install: "\u6280\u80fd\u5b89\u88c5",
      keys: "\u8fd0\u884c Key",
      policy: "\u8d1f\u8d23\u4eba\u5ba1\u6279",
      runtime: "\u8fd0\u884c\u8d28\u91cf",
      saved: "\u4fdd\u5b58\u540e\u7eed",
      suspended: "\u8fd0\u884c\u6682\u505c",
      test: "\u8fd0\u884c\u8bc1\u636e",
      updates: "\u66f4\u65b0\u51b3\u7b56"
    }
  }
};

const projectAdjustmentCopy = {
  en: {
    body:
      "Read-only project history for finance adjustments. Finance operators still create and decide refunds or disputes from admin workflows, while developers can inspect the project impact here.",
    dispute: "Dispute",
    disputeStatuses: {
      lost: "Lost",
      open: "Open",
      warning_needs_response: "Needs response",
      won: "Won"
    },
    empty: "No refund or dispute records are tied to this project.",
    reference: "Reference",
    refund: "Refund",
    refundStatuses: {
      approved: "Approved",
      failed: "Failed",
      posted: "Posted",
      rejected: "Rejected",
      requested: "Requested"
    },
    title: "Refund and dispute impact"
  },
  zh: {
    body:
      "\u8fd9\u91cc\u662f\u9879\u76ee\u7ea7\u53ea\u8bfb\u8d22\u52a1\u8c03\u6574\u5386\u53f2\u3002\u9000\u6b3e\u6216\u4e89\u8bae\u4ecd\u7531\u8d22\u52a1\u5728\u7ba1\u7406\u540e\u53f0\u521b\u5efa\u548c\u51b3\u7b56\uff0c\u5f00\u53d1\u8005\u53ef\u4ee5\u5728\u8fd9\u91cc\u68c0\u67e5\u5b83\u5bf9\u672c\u9879\u76ee\u7684\u5f71\u54cd\u3002",
    dispute: "\u4e89\u8bae",
    disputeStatuses: {
      lost: "\u5df2\u8d25\u8bc9",
      open: "\u5904\u7406\u4e2d",
      warning_needs_response: "\u9700\u56de\u5e94",
      won: "\u5df2\u80dc\u8bc9"
    },
    empty: "\u8fd9\u4e2a\u9879\u76ee\u6682\u65e0\u9000\u6b3e\u6216\u4e89\u8bae\u8bb0\u5f55\u3002",
    reference: "\u53c2\u8003",
    refund: "\u9000\u6b3e",
    refundStatuses: {
      approved: "\u5df2\u6279\u51c6",
      failed: "\u5931\u8d25",
      posted: "\u5df2\u5165\u8d26",
      rejected: "\u5df2\u62d2\u7edd",
      requested: "\u5df2\u7533\u8bf7"
    },
    title: "\u9000\u6b3e\u4e0e\u4e89\u8bae\u5f71\u54cd"
  }
} as const;

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = copy[locale];
  const session = await getWorkspaceSession();
  const hasWorkspaceSession = Boolean(session.subject);
  const roleSet = new Set([session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(Boolean));
  const hasProjectAccess = hasWorkspaceSession && developerAccessRoles.some((role) => roleSet.has(role));

  if (!hasProjectAccess) {
    return (
      <AppShell active="dashboard" locale={locale}>
        <section className="section">
          <div className="section-inner">
            <a className="inline-flex items-center gap-1 text-sm text-[#999] mb-4" href={localizedHref("/dashboard", locale)}>
              <ArrowLeft size={15} aria-hidden="true" />
              <span>{labels.back}</span>
            </a>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1>{slug}</h1>
            <p>{labels.description}</p>
          </div>
        </section>

        <JourneyRail currentStep="project" journey="developer" locale={locale} />

        <section className="max-w-[1200px] mx-auto px-6 py-8">
          <WorkspaceAccessPanel
            locale={locale}
            requiredRoles={developerAccessRoles}
            session={session}
            workspace="developer"
          />
        </section>

        <WorkspaceLockedPanel
          actionHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "项目详情包含策略审批、API Key、运行测试、订阅和发票操作。当前会话无法读取这个项目，所以操作面板保持隐藏；请先登录或确认开发者角色。"
              : "Project detail includes policy approval, API keys, runtime tests, subscriptions, and invoice operations. This session cannot read this project yet, so action panels stay hidden until access is confirmed."
          }
          locale={locale}
          projectSlug={slug}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要开发者角色" : "Developer role required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      </AppShell>
    );
  }

  const [detail, projectRefunds, projectDisputes] = await Promise.all([
    getDeveloperProjectDetail(slug),
    getProjectRefunds(slug),
    getProjectDisputes(slug)
  ]);

  if (!detail) {
    notFound();
  }

  const { project } = detail;
  const metrics = [
    [labels.installed, `${project.installs.installedSkillCount}`, PackageCheck],
    [labels.budget, formatMoney(project.policy.monthlyBudgetCents, project.usage.currency), WalletCards],
    [labels.calls, formatCompactNumber(project.runtime.callCount), RadioTower],
    [labels.spend, formatMoney(project.usage.grossCents, project.usage.currency), CreditCard],
    [labels.activeKeys, `${project.apiKeys.activeCount}`, KeyRound]
  ] as const;
  const healthItems = [
    [labels.policyState, policyStateLabel(project.policy.state, locale), ShieldCheck],
    [labels.successRate, formatPercent(project.runtime.successRate), Gauge],
    [labels.avgLatency, formatLatency(project.runtime.avgLatencyMs, labels.noDate), Clock3],
    [labels.subscriptions, `${project.subscriptions.activeCount}`, CheckCircle2]
  ] as const;
  const readinessItems = getReadinessItems(detail, locale);
  const projectPriorityLabels = projectPriorityCopy[locale];
  const projectPriorityItems = buildProjectPriorityItems(detail, locale, projectRefunds, projectDisputes);
  const primaryProjectPriorityItem = projectPriorityItems[0];
  const projectPriorityMetrics = [
    [projectPriorityLabels.metrics.keys, formatCompactNumber(project.apiKeys.activeCount), KeyRound],
    [projectPriorityLabels.metrics.installs, formatCompactNumber(project.installs.installedSkillCount), PackageCheck],
    [projectPriorityLabels.metrics.policy, formatCompactNumber(countProjectPolicyGates(detail)), ShieldCheck],
    [projectPriorityLabels.metrics.updates, formatCompactNumber(countOpenProjectUpdates(detail)), Clock3],
    [projectPriorityLabels.metrics.runtime, formatCompactNumber(countRuntimeQualityIssues(detail)), RadioTower]
  ] as const;

  return (
    <AppShell active="dashboard" locale={locale}>
      <section className="section">
        <div className="section-inner">
          <a className="inline-flex items-center gap-1 text-sm text-[#999] mb-4" href={localizedHref("/dashboard", locale)}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span>{labels.back}</span>
          </a>
          <div className="eyebrow mb-4 flex items-center gap-2">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{project.name}</h1>
          <p>{labels.description}</p>
        </div>

        <aside className="card mt-6 max-w-[1200px] mx-auto px-6">
          <div className="eyebrow mb-4 flex items-center gap-2">
            <Activity size={16} aria-hidden="true" />
            <span>{labels.health}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthItems.map(([label, value, Icon]) => (
              <div className="flex items-center gap-2" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span className="text-xs text-[#999]">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-4" aria-label={labels.readiness.title}>
            <strong>{labels.readiness.title}</strong>
            {readinessItems.map((item) => (
              <div className="flex items-center gap-2 mt-2" key={item.label}>
                <span className={item.ready ? "pill" : "pill pill--warning"}>
                  {item.ready ? labels.readiness.ready : labels.readiness.needsAction}
                </span>
                <div>
                  <b>{item.label}</b>
                  <small className="block text-xs text-[#999]">{item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <JourneyRail currentStep="project" journey="developer" locale={locale} />

      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <SessionStatusPanel locale={locale} session={session} />
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={developerAccessRoles}
          session={session}
          workspace="developer"
        />
        <div className="flex items-center gap-6 flex-wrap mt-4">
          {metrics.map(([label, value, Icon]) => (
            <div className="flex items-center gap-2" key={label}>
              <Icon size={17} aria-hidden="true" />
              <span className="text-xs text-[#999]">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {hasProjectAccess ? (
        <>
      <section className="max-w-[1200px] mx-auto px-6 py-8" aria-labelledby="project-priority-heading">
        <article className="card">
          <div>
            <div className="eyebrow mb-4 flex items-center gap-2">
              <ClipboardList size={16} aria-hidden="true" />
              <span>{projectPriorityLabels.eyebrow}</span>
            </div>
            <h2 id="project-priority-heading">{projectPriorityLabels.title}</h2>
            <p>{projectPriorityLabels.body}</p>

            <div className="flex flex-col gap-3 mt-4" aria-label={projectPriorityLabels.queueLabel}>
              {projectPriorityItems.map((item) => (
                <a className="card card--compact" href={item.href} key={item.id}>
                  <span className="text-xs text-[#999]">
                    {projectPriorityLabels.tones[item.tone]} / {item.metric}
                  </span>
                  <strong className="block mt-1">{item.title}</strong>
                  <p className="text-sm text-[#999] mt-1">{item.detail}</p>
                  <b className="flex items-center gap-1 mt-2 text-sm">
                    {item.actionLabel}
                    <ArrowRight size={14} aria-hidden="true" />
                  </b>
                </a>
              ))}
            </div>

            <a className="btn-primary mt-4 inline-flex items-center gap-2" href={primaryProjectPriorityItem.href}>
              <span>{projectPriorityLabels.action}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="flex items-center gap-6 flex-wrap mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)]">
            {projectPriorityMetrics.map(([label, value, Icon]) => (
              <div className="flex items-center gap-2" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span className="text-xs text-[#999]">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div>
            <div id="project-policies">
              <ProjectSkillPolicyManager
                emptyLabel={labels.empty}
                headers={labels.skillHeaders}
                locale={locale}
                noDateLabel={labels.noDate}
                projectSlug={project.slug}
                skills={detail.installedSkills}
                titleLabel={labels.skillTitle}
              />
            </div>

            <div id="project-runtime-test" className="mt-5">
              <ProjectRuntimeTestPanel locale={locale} projectSlug={project.slug} skills={detail.installedSkills} />
            </div>

            <article className="card mt-5" id="project-runtime-calls">
              <div className="eyebrow mb-4 flex items-center gap-2">
                <RadioTower size={16} aria-hidden="true" />
                <span>{labels.callsTitle}</span>
              </div>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-[#999] py-2 border-b border-[rgba(255,255,255,0.08)]">
                  {labels.callHeaders.map((header) => (
                    <span key={header}>{header}</span>
                  ))}
                </div>
                {detail.recentInvocations.length > 0 ? (
                  detail.recentInvocations.map((call) => (
                    <div className="grid grid-cols-4 gap-2 py-2 border-b border-[rgba(255,255,255,0.08)]" key={call.id}>
                      <strong>
                        {call.displayName ?? call.skillSlug ?? "unknown"}
                        <small className="block text-xs text-[#666]">{formatDateValue(call.createdAt, locale, labels.noDate)}</small>
                      </strong>
                      <span className={statusChipClass(call.status)}>{call.status}</span>
                      <span>{formatLatency(call.latencyMs, labels.noDate)}</span>
                      <span>{call.errorCode ?? labels.noDate}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-sm text-[#999]">{labels.empty}</div>
                )}
              </div>
            </article>
          </div>

          <aside className="flex flex-col gap-5">
          <div id="project-agent-connection">
            <ProjectAgentConnectionPanel
              activeKeyCount={project.apiKeys.activeCount}
              apiUrl={apiUrl}
              locale={locale}
              projectSlug={project.slug}
              sampleSkillSlug={getAgentSampleSkillSlug(detail)}
            />
          </div>

          <div id="project-api-keys">
            <ProjectApiKeyManager
              activeLabel={labels.active}
              emptyLabel={labels.empty}
              keys={detail.apiKeys}
              locale={locale}
              noDateLabel={labels.noDate}
              projectSlug={project.slug}
              revokedLabel={labels.revoked}
              titleLabel={labels.keysTitle}
            />
          </div>

          <div id="project-update-inbox">
            <ProjectUpdateInboxManager
              emptyLabel={labels.empty}
              locale={locale}
              noDateLabel={labels.noDate}
              projectSlug={project.slug}
              titleLabel={labels.updatesTitle}
              updates={detail.updateInbox}
            />
          </div>

          <div id="project-saved-skills">
            <ProjectSavedSkillManager
              emptyLabel={labels.empty}
              locale={locale}
              projectSlug={project.slug}
              savedSkills={detail.savedSkills}
              titleLabel={labels.savedSkillsTitle}
            />
          </div>

          <div id="project-subscriptions">
            <ProjectSubscriptionManager
              emptyLabel={labels.empty}
              headers={labels.billingHeaders}
              locale={locale}
              noDateLabel={labels.noDate}
              projectSlug={project.slug}
              subscriptions={detail.subscriptions}
              titleLabel={labels.billingTitle}
            />
          </div>

          <div id="project-invoices">
            <ProjectInvoiceManager
              emptyLabel={labels.empty}
              invoices={detail.invoices}
              locale={locale}
              noDateLabel={labels.noDate}
              projectSlug={project.slug}
              titleLabel={labels.invoicesTitle}
            />
          </div>

          <div id="project-adjustments">
            <ProjectAdjustmentHistory
              disputes={projectDisputes}
              locale={locale}
              noDateLabel={labels.noDate}
              refunds={projectRefunds}
            />
          </div>
        </aside>
        </div>
      </section>
        </>
      ) : (
        <WorkspaceLockedPanel
          actionHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "项目详情包含策略审批、API Key、运行测试、订阅和发票操作。当前会话缺少开发者权限，因此操作面板已隐藏，但项目运营队列的治理边界仍然可见。"
              : "Project detail includes policy approval, API keys, runtime tests, subscriptions, and invoice operations. This session cannot operate them, but the locked state still shows the project governance boundary."
          }
          locale={locale}
          projectSlug={project.slug}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要开发者角色" : "Developer role required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      )}
    </AppShell>
  );
}

function WorkspaceLockedPanel({
  actionHref,
  actionLabel,
  body,
  locale,
  projectSlug,
  title
}: {
  actionHref: string;
  actionLabel: string;
  body: string;
  locale: Locale;
  projectSlug: string;
  title: string;
}) {
  const guide = getProjectLockedGuide(locale, projectSlug);

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-8">
      <article className="card">
        <div>
          <div className="eyebrow mb-4 flex items-center gap-2">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{guide.eyebrow}</span>
          </div>
          <h2>{title}</h2>
          <p>{body}</p>
          <p className="visually-hidden">{guide.marker}</p>
          <a className="btn-primary mt-4 inline-flex items-center gap-2" href={actionHref}>
            <span>{actionLabel}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="flex flex-col gap-3 mt-6" aria-label={guide.ariaLabel}>
          {guide.actions.map((action, index) => {
            const Icon = [LogIn, FolderPlus, SearchCheck][index] ?? ClipboardList;

            return (
              <a className="card card--compact" href={localizedHref(action.href, locale)} key={action.title}>
                <Icon size={16} aria-hidden="true" />
                <span className="text-xs text-[#999]">{action.label}</span>
                <strong className="block mt-1">{action.title}</strong>
                <small className="block text-sm text-[#999] mt-1">{action.body}</small>
              </a>
            );
          })}
        </div>
      </article>
    </section>
  );
}

function getProjectLockedGuide(locale: Locale, projectSlug: string) {
  if (locale === "zh") {
    return {
      ariaLabel: "项目详情准入步骤",
      eyebrow: "项目准入",
      marker: "项目运营队列 / 策略审批 / API Key / 运行测试",
      actions: [
        {
          body: "用 Google、GitHub 或邮箱密码进入拥有该项目的工作区。",
          href: "/login",
          label: "01",
          title: "登录账号"
        },
        {
          body: "在个人中心确认 developer、owner 或 admin 角色后再打开项目。",
          href: "/account",
          label: "02",
          title: "确认开发权限"
        },
        {
          body: `回到 ${projectSlug} 后创建 Key、检查策略，并运行受治理测试。`,
          href: "/developer",
          label: "03",
          title: "回到项目运营"
        }
      ]
    };
  }

  return {
    ariaLabel: "Project detail access steps",
    eyebrow: "Project access",
    marker: "project operations queue / policy approval / API keys / runtime tests",
    actions: [
      {
        body: "Use Google, GitHub, or email/password to enter the workspace that owns this project.",
        href: "/login",
        label: "01",
        title: "Sign in"
      },
      {
        body: "Confirm developer, owner, or admin access from the account center before opening project operations.",
        href: "/account",
        label: "02",
        title: "Confirm developer role"
      },
      {
        body: `Return to ${projectSlug} to create keys, inspect policy, and run the governed test path.`,
        href: "/developer",
        label: "03",
        title: "Return to project operations"
      }
    ]
  };
}

function ProjectAdjustmentHistory({
  disputes,
  locale,
  noDateLabel,
  refunds
}: {
  disputes: DisputeRecord[];
  locale: Locale;
  noDateLabel: string;
  refunds: RefundRecord[];
}) {
  const labels = projectAdjustmentCopy[locale];
  const rows = buildProjectAdjustmentRows(refunds, disputes, locale, noDateLabel);

  return (
    <article className="card">
      <div className="eyebrow mb-4 flex items-center gap-2">
        <RotateCcw size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.body}</p>

      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1">
          <RotateCcw size={14} aria-hidden="true" />
          <b>{refunds.length}</b>
          {labels.refund}
        </span>
        <span className="flex items-center gap-1">
          <ShieldAlert size={14} aria-hidden="true" />
          <b>{disputes.length}</b>
          {labels.dispute}
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {rows.length > 0 ? (
          rows.map((row) => {
            const Icon = row.typeKey === "refund" ? RotateCcw : ShieldAlert;

            return (
              <section className="card card--compact" key={row.id}>
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={15} aria-hidden="true" />
                    <span>{row.type}</span>
                    <strong>{row.skill}</strong>
                  </div>
                  <span className={statusChipClass(row.rawStatus)}>{row.status}</span>
                </header>
                <div className="flex items-center gap-3 text-sm text-[#999] mt-1">
                  <span>{row.amount}</span>
                  <span>{row.date}</span>
                </div>
                <p className="text-sm mt-1">{row.reason}</p>
                <small className="text-xs text-[#666]">
                  {labels.reference}: {row.reference}
                </small>
              </section>
            );
          })
        ) : (
          <div className="py-3 text-sm text-[#999]">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function getAgentSampleSkillSlug(detail: DeveloperProjectDetail) {
  return (
    detail.installedSkills.find((skill) => skill.status === "installed" && skill.verificationStatus === "verified")?.skillSlug ??
    detail.installedSkills.find((skill) => skill.status === "installed")?.skillSlug ??
    detail.installedSkills[0]?.skillSlug ??
    null
  );
}

function getReadinessItems(detail: DeveloperProjectDetail, locale: Locale) {
  const labels = copy[locale].readiness;
  const { project } = detail;
  const runtimeReady =
    project.runtime.callCount > 0 &&
    project.runtime.blockedCount === 0 &&
    (project.runtime.successRate === null || project.runtime.successRate >= 0.95);

  return [
    {
      detail: labels.key[1],
      label: labels.key[0],
      ready: project.apiKeys.activeCount > 0
    },
    {
      detail: labels.install[1],
      label: labels.install[0],
      ready: project.installs.installedSkillCount > 0
    },
    {
      detail: labels.approved[1],
      label: labels.approved[0],
      ready: project.policy.state === "approved" && project.installs.ownerRequiredCount === 0
    },
    {
      detail: labels.update[1],
      label: labels.update[0],
      ready: detail.updateInbox.length === 0 && project.updates.count === 0
    },
    {
      detail: labels.runtime[1],
      label: labels.runtime[0],
      ready: runtimeReady
    }
  ];
}

function buildProjectPriorityItems(
  detail: DeveloperProjectDetail,
  locale: Locale,
  refunds: RefundRecord[],
  disputes: DisputeRecord[]
): ProjectPriorityItem[] {
  const labels = projectPriorityCopy[locale];
  const items: ProjectPriorityItem[] = [];
  const { project } = detail;
  const policyGateCount = countProjectPolicyGates(detail);
  const suspendedCount = countSuspendedProjectSignals(detail);
  const updateCount = countOpenProjectUpdates(detail);
  const runtimeIssueCount = countRuntimeQualityIssues(detail);
  const billingActionCount = countProjectBillingActions(detail);
  const adjustmentActionCount = countProjectAdjustmentActions(refunds, disputes);
  const savedFollowUpCount = detail.savedSkills.filter((skill) => !skill.installedStatus || skill.installedStatus !== "installed").length;
  const needsRuntimeProof =
    project.apiKeys.activeCount > 0 &&
    project.installs.installedSkillCount > 0 &&
    project.runtime.callCount === 0 &&
    detail.recentInvocations.length === 0;

  if (project.apiKeys.activeCount === 0) {
    items.push({
      actionLabel: labels.actions.keys,
      detail: labels.items.keys,
      href: projectAnchor(project.slug, "project-api-keys", locale),
      id: "runtime-key",
      metric: "0",
      priority: 10,
      title: labels.titles.keys,
      tone: "warning"
    });
  }

  if (project.installs.installedSkillCount === 0) {
    items.push({
      actionLabel: labels.actions.install,
      detail: labels.items.install,
      href: localizedHref("/marketplace", locale),
      id: "skill-installation",
      metric: "0",
      priority: 15,
      title: labels.titles.install,
      tone: "warning"
    });
  }

  if (policyGateCount > 0) {
    items.push({
      actionLabel: labels.actions.policy,
      detail: labels.items.policy,
      href: projectAnchor(project.slug, "project-policies", locale),
      id: "owner-approval",
      metric: formatCompactNumber(policyGateCount),
      priority: 20,
      title: labels.titles.policy,
      tone: "danger"
    });
  }

  if (suspendedCount > 0) {
    items.push({
      actionLabel: labels.actions.suspended,
      detail: labels.items.suspended,
      href: projectAnchor(project.slug, "project-policies", locale),
      id: "suspended-runtime",
      metric: formatCompactNumber(suspendedCount),
      priority: 22,
      title: labels.titles.suspended,
      tone: "danger"
    });
  }

  if (updateCount > 0) {
    items.push({
      actionLabel: labels.actions.updates,
      detail: labels.items.updates,
      href: projectAnchor(project.slug, "project-update-inbox", locale),
      id: "update-decisions",
      metric: formatCompactNumber(updateCount),
      priority: 30,
      title: labels.titles.updates,
      tone: "warning"
    });
  }

  if (runtimeIssueCount > 0) {
    const hasRuntimeDanger =
      project.runtime.blockedCount > 0 ||
      project.runtime.errorCount > 0 ||
      detail.installedSkills.some((skill) => skill.runtime.blockedCount > 0 || skill.runtime.errorCount > 0 || skill.incidents.openCount > 0);

    items.push({
      actionLabel: labels.actions.runtime,
      detail: labels.items.runtime,
      href: projectAnchor(project.slug, "project-runtime-calls", locale),
      id: "runtime-quality",
      metric: formatCompactNumber(runtimeIssueCount),
      priority: hasRuntimeDanger ? 28 : 40,
      title: labels.titles.runtime,
      tone: hasRuntimeDanger ? "danger" : "warning"
    });
  }

  if (needsRuntimeProof) {
    items.push({
      actionLabel: labels.actions.test,
      detail: labels.items.test,
      href: projectAnchor(project.slug, "project-runtime-test", locale),
      id: "runtime-proof",
      metric: labels.readyMetric,
      priority: 42,
      title: labels.titles.test,
      tone: "warning"
    });
  }

  if (billingActionCount > 0) {
    items.push({
      actionLabel: labels.actions.billing,
      detail: labels.items.billing,
      href: projectAnchor(project.slug, "project-subscriptions", locale),
      id: "billing-ledger-proof",
      metric: formatCompactNumber(billingActionCount),
      priority: 50,
      title: labels.titles.billing,
      tone: "warning"
    });
  }

  if (adjustmentActionCount > 0) {
    items.push({
      actionLabel: labels.actions.adjustments,
      detail: labels.items.adjustments,
      href: projectAnchor(project.slug, "project-adjustments", locale),
      id: "refund-dispute-impact",
      metric: formatCompactNumber(adjustmentActionCount),
      priority: hasDangerousProjectAdjustment(refunds, disputes) ? 46 : 54,
      title: labels.titles.adjustments,
      tone: hasDangerousProjectAdjustment(refunds, disputes) ? "danger" : "warning"
    });
  }

  if (savedFollowUpCount > 0) {
    items.push({
      actionLabel: labels.actions.saved,
      detail: labels.items.saved,
      href: projectAnchor(project.slug, "project-saved-skills", locale),
      id: "saved-follow-up",
      metric: formatCompactNumber(savedFollowUpCount),
      priority: 70,
      title: labels.titles.saved,
      tone: "ready"
    });
  }

  if (items.length === 0) {
    items.push({
      actionLabel: labels.readyAction,
      detail: labels.readyDetail,
      href: projectAnchor(project.slug, "project-runtime-test", locale),
      id: "healthy-project-loop",
      metric: labels.readyMetric,
      priority: 100,
      title: labels.readyTitle,
      tone: "ready"
    });
  }

  return items.sort((first, second) => first.priority - second.priority).slice(0, 4);
}

function countProjectPolicyGates(detail: DeveloperProjectDetail) {
  const { project } = detail;
  const skillGates = detail.installedSkills.filter(
    (skill) =>
      skill.approvalState === "owner_required" ||
      skill.approvalState === "owner_review" ||
      skill.policy.approvalRequired ||
      skill.policy.state === "owner_review"
  ).length;
  const projectGate = project.policy.state === "owner_review" || project.policy.approvalRequiredCount > 0 || project.installs.ownerRequiredCount > 0;

  return skillGates + (projectGate ? 1 : 0);
}

function countSuspendedProjectSignals(detail: DeveloperProjectDetail) {
  const projectSuspended = detail.project.policy.state === "suspended" || detail.project.installs.suspendedInstallCount > 0 ? 1 : 0;
  const skillSuspended = detail.installedSkills.filter(
    (skill) => skill.status === "suspended" || skill.verificationStatus === "suspended" || skill.policy.state === "suspended"
  ).length;

  return projectSuspended + skillSuspended;
}

function countOpenProjectUpdates(detail: DeveloperProjectDetail) {
  const openRows = detail.updateInbox.filter(
    (update) => !update.resolvedAt && update.actionStatus !== "adopted" && update.actionStatus !== "ignored"
  ).length;

  return Math.max(openRows, detail.project.updates.count);
}

function countRuntimeQualityIssues(detail: DeveloperProjectDetail) {
  const project = detail.project;
  const projectIssues =
    (project.runtime.blockedCount > 0 ? 1 : 0) +
    (project.runtime.errorCount > 0 ? 1 : 0) +
    (project.runtime.successRate !== null && project.runtime.successRate < 0.95 ? 1 : 0);
  const skillIssues = detail.installedSkills.filter(
    (skill) =>
      skill.runtime.blockedCount > 0 ||
      skill.runtime.errorCount > 0 ||
      skill.incidents.openCount > 0 ||
      (skill.runtime.successRate !== null && skill.runtime.successRate < 0.95)
  ).length;

  return projectIssues + skillIssues;
}

function countProjectBillingActions(detail: DeveloperProjectDetail) {
  const subscriptionActions = detail.subscriptions.filter(
    (subscription) =>
      subscription.ledgerState === "awaiting_post" ||
      subscription.ledgerState === "not_postable" ||
      subscription.ledgerState === "renewal_due" ||
      subscription.renewalReady ||
      ["past_due", "paused"].includes(subscription.status)
  ).length;
  const invoiceActions = detail.invoices.filter(
    (invoice) => !["paid", "void", "canceled", "cancelled"].includes(invoice.status)
  ).length;

  return subscriptionActions + invoiceActions;
}

function countProjectAdjustmentActions(refunds: RefundRecord[], disputes: DisputeRecord[]) {
  const refundActions = refunds.filter((refund) => ["approved", "failed", "requested"].includes(refund.status)).length;
  const disputeActions = disputes.filter((dispute) => ["lost", "open", "warning_needs_response"].includes(dispute.status)).length;

  return refundActions + disputeActions;
}

function hasDangerousProjectAdjustment(refunds: RefundRecord[], disputes: DisputeRecord[]) {
  return (
    refunds.some((refund) => refund.status === "failed" || refund.status === "requested") ||
    disputes.some((dispute) => dispute.status === "lost" || dispute.status === "open" || dispute.status === "warning_needs_response")
  );
}

function buildProjectAdjustmentRows(refunds: RefundRecord[], disputes: DisputeRecord[], locale: Locale, fallback: string) {
  const labels = projectAdjustmentCopy[locale];
  const rows = [
    ...refunds.map((refund) => ({
      amount: `-${formatMoney(refund.amountCents, refund.currency)}`,
      createdAt: refund.requestedAt ?? refund.createdAt,
      date: formatDateValue(refund.requestedAt ?? refund.createdAt, locale, fallback),
      id: `refund-${refund.id}`,
      rawStatus: refund.status,
      reason: refund.reason ?? refund.providerReference ?? fallback,
      reference: refund.adjustmentTransactionId ?? refund.transactionId ?? refund.providerReference ?? fallback,
      skill: refund.skillName ?? refund.transactionId ?? fallback,
      status: labels.refundStatuses[refund.status],
      type: labels.refund,
      typeKey: "refund" as const
    })),
    ...disputes.map((dispute) => ({
      amount: formatMoney(dispute.amountCents, dispute.currency),
      createdAt: dispute.createdAt,
      date: formatDateValue(dispute.createdAt, locale, fallback),
      id: `dispute-${dispute.id}`,
      rawStatus: dispute.status,
      reason: dispute.reason ?? dispute.externalReference ?? fallback,
      reference: dispute.externalReference ?? dispute.transactionId ?? fallback,
      skill: dispute.skillName ?? dispute.transactionId ?? fallback,
      status: labels.disputeStatuses[dispute.status],
      type: labels.dispute,
      typeKey: "dispute" as const
    }))
  ];

  return rows.sort((first, second) => adjustmentSortValue(second.createdAt) - adjustmentSortValue(first.createdAt));
}

function adjustmentSortValue(value: string | null | undefined) {
  if (!value || value === "demo") {
    return 0;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function projectAnchor(projectSlug: string, anchor: string, locale: Locale) {
  return localizedHref(`/dashboard/projects/${projectSlug}#${anchor}`, locale);
}

function policyStateLabel(state: "approved" | "owner_review" | "suspended", locale: Locale) {
  if (state === "suspended") {
    return copy[locale].suspended;
  }

  if (state === "owner_review") {
    return copy[locale].ownerReview;
  }

  return copy[locale].approved;
}

function statusChipClass(status: string) {
  if (["error", "failed", "suspended", "revoked", "rejected", "blocked"].includes(status)) {
    return "pill pill--danger";
  }

  if (["owner_review", "warning_needs_response", "pending", "trialing", "submitted"].includes(status)) {
    return "pill pill--warning";
  }

  return "pill";
}

function formatLatency(ms: number | null | undefined, fallback: string) {
  if (ms === null || ms === undefined) {
    return fallback;
  }

  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(ms)} ms`;
}

function formatDateValue(value: string | null | undefined, locale: Locale, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value === "demo") {
    return "demo";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
}
