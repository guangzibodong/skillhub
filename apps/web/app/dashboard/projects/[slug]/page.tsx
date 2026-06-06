import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gauge,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  RadioTower,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { ProjectAgentConnectionPanel } from "@/components/project-agent-connection-panel";
import { ProjectApiKeyManager } from "@/components/project-api-key-manager";
import { ProjectInvoiceManager } from "@/components/project-invoice-manager";
import { ProjectSavedSkillManager } from "@/components/project-saved-skill-manager";
import { ProjectSkillPolicyManager } from "@/components/project-skill-policy-manager";
import { ProjectSubscriptionManager } from "@/components/project-subscription-manager";
import { ProjectUpdateInboxManager } from "@/components/project-update-inbox-manager";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  formatPercent,
  getDeveloperProjectDetail,
  type DeveloperProjectDetail
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const detail = await getDeveloperProjectDetail(slug);

  if (!detail) {
    notFound();
  }

  const labels = copy[locale];
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

  return (
    <main className="product-shell">
      <SiteHeader
        active="dashboard"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname={`/dashboard/projects/${project.slug}`}
      />

      <section className="project-detail-hero">
        <div>
          <a className="breadcrumb-link" href={localizedHref("/dashboard", locale)}>
            <ArrowLeft size={15} aria-hidden="true" />
            <span>{labels.back}</span>
          </a>
          <div className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{project.name}</h1>
          <p>{labels.description}</p>
        </div>

        <aside className="ops-panel project-health-panel">
          <div className="card-kicker">
            <Activity size={16} aria-hidden="true" />
            <span>{labels.health}</span>
          </div>
          <div className="project-health-grid">
            {healthItems.map(([label, value, Icon]) => (
              <div className="project-health-item" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="project-readiness-list" aria-label={labels.readiness.title}>
            <strong>{labels.readiness.title}</strong>
            {readinessItems.map((item) => (
              <div className="project-readiness-item" key={item.label}>
                <span className={item.ready ? "status-chip" : "status-chip status-chip--warning"}>
                  {item.ready ? labels.readiness.ready : labels.readiness.needsAction}
                </span>
                <div>
                  <b>{item.label}</b>
                  <small>{item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="console-board">
        <div className="metric-strip project-metric-strip metric-strip--standalone">
          {metrics.map(([label, value, Icon]) => (
            <div className="metric project-metric" key={label}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="project-detail-layout">
        <div className="project-detail-main">
          <ProjectSkillPolicyManager
            emptyLabel={labels.empty}
            headers={labels.skillHeaders}
            locale={locale}
            noDateLabel={labels.noDate}
            projectSlug={project.slug}
            skills={detail.installedSkills}
            titleLabel={labels.skillTitle}
          />

          <article className="ops-panel project-table-panel">
            <div className="card-kicker">
              <RadioTower size={16} aria-hidden="true" />
              <span>{labels.callsTitle}</span>
            </div>
            <div className="project-table">
              <div className="project-table__row project-table__row--head project-call-row">
                {labels.callHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {detail.recentInvocations.length > 0 ? (
                detail.recentInvocations.map((call) => (
                  <div className="project-table__row project-call-row" key={call.id}>
                    <strong>
                      {call.displayName ?? call.skillSlug ?? "unknown"}
                      <small>{formatDateValue(call.createdAt, locale, labels.noDate)}</small>
                    </strong>
                    <span className={statusChipClass(call.status)}>{call.status}</span>
                    <span>{formatLatency(call.latencyMs, labels.noDate)}</span>
                    <span>{call.errorCode ?? labels.noDate}</span>
                  </div>
                ))
              ) : (
                <div className="project-table__row project-table__row--empty">{labels.empty}</div>
              )}
            </div>
          </article>
        </div>

        <aside className="project-detail-side">
          <ProjectAgentConnectionPanel
            activeKeyCount={project.apiKeys.activeCount}
            apiUrl={apiUrl}
            locale={locale}
            projectSlug={project.slug}
          />

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

          <ProjectUpdateInboxManager
            emptyLabel={labels.empty}
            locale={locale}
            noDateLabel={labels.noDate}
            projectSlug={project.slug}
            titleLabel={labels.updatesTitle}
            updates={detail.updateInbox}
          />

          <ProjectSavedSkillManager
            emptyLabel={labels.empty}
            locale={locale}
            projectSlug={project.slug}
            savedSkills={detail.savedSkills}
            titleLabel={labels.savedSkillsTitle}
          />

          <ProjectSubscriptionManager
            emptyLabel={labels.empty}
            headers={labels.billingHeaders}
            locale={locale}
            noDateLabel={labels.noDate}
            projectSlug={project.slug}
            subscriptions={detail.subscriptions}
            titleLabel={labels.billingTitle}
          />

          <ProjectInvoiceManager
            emptyLabel={labels.empty}
            invoices={detail.invoices}
            locale={locale}
            noDateLabel={labels.noDate}
            projectSlug={project.slug}
            titleLabel={labels.invoicesTitle}
          />
        </aside>
      </section>
    </main>
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
    return "status-chip status-chip--danger";
  }

  if (["owner_review", "warning_needs_response", "pending", "trialing", "submitted"].includes(status)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip";
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
