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
import { ProjectApiKeyManager } from "@/components/project-api-key-manager";
import { ProjectInvoiceManager } from "@/components/project-invoice-manager";
import { ProjectSavedSkillManager } from "@/components/project-saved-skill-manager";
import { ProjectSkillPolicyManager } from "@/components/project-skill-policy-manager";
import { ProjectSubscriptionManager } from "@/components/project-subscription-manager";
import { ProjectUpdateInboxManager } from "@/components/project-update-inbox-manager";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import {
  type DeveloperProjectSkillRecord,
  formatCompactNumber,
  formatMoney,
  formatPercent,
  getDeveloperProjectDetail
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    back: "Back to dashboard",
    eyebrow: "Developer project",
    description:
      "Control the skills, runtime keys, budgets, version updates, and operational signals this agent project depends on.",
    installed: "Installed skills",
    budget: "Monthly policy budget",
    calls: "Runtime calls",
    spend: "Usage cost",
    activeKeys: "Active keys",
    health: "Project health",
    policyState: "Policy state",
    successRate: "Success rate",
    avgLatency: "Average latency",
    subscriptions: "Active subscriptions",
    skillTitle: "Installed skills and policies",
    skillHeaders: ["Skill", "Policy", "Runtime", "Cost", "Next action"],
    keysTitle: "Runtime API keys",
    keyHeaders: ["Name", "Key", "Last used", "State"],
    updatesTitle: "Update inbox",
    callsTitle: "Recent runtime calls",
    callHeaders: ["Skill", "Status", "Latency", "Error"],
    billingTitle: "Subscriptions and billing",
    billingHeaders: ["Skill", "Status", "Model", "Period"],
    invoicesTitle: "Invoices",
    savedSkillsTitle: "Saved skills",
    empty: "No records yet",
    noDate: "n/a",
    approved: "Approved",
    ownerReview: "Owner review",
    suspended: "Suspended",
    active: "Active",
    revoked: "Revoked"
  },
  zh: {
    back: "返回工作台",
    eyebrow: "开发者项目",
    description: "管理这个智能体项目依赖的技能、运行密钥、预算、版本更新和调用质量信号。",
    installed: "已安装技能",
    budget: "月度策略预算",
    calls: "运行调用",
    spend: "使用成本",
    activeKeys: "活跃 Key",
    health: "项目健康",
    policyState: "策略状态",
    successRate: "成功率",
    avgLatency: "平均延迟",
    subscriptions: "活跃订阅",
    skillTitle: "已安装技能与策略",
    skillHeaders: ["技能", "策略", "运行", "成本", "下一步"],
    keysTitle: "运行 API Key",
    keyHeaders: ["名称", "Key", "最近使用", "状态"],
    updatesTitle: "更新收件箱",
    callsTitle: "最近运行调用",
    callHeaders: ["技能", "状态", "延迟", "错误"],
    billingTitle: "订阅与计费",
    billingHeaders: ["技能", "状态", "模式", "周期"],
    invoicesTitle: "发票",
    savedSkillsTitle: "收藏技能",
    empty: "暂无记录",
    noDate: "暂无",
    approved: "已批准",
    ownerReview: "待负责人审核",
    suspended: "已暂停",
    active: "活跃",
    revoked: "已撤销"
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

function formatVersion(version: string | null) {
  return version ? `v${version}` : "unpinned";
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

function formatCapabilities(skill: DeveloperProjectSkillRecord, locale: Locale) {
  const items = [
    skill.policy.allowNetwork ? "network" : null,
    skill.policy.allowBrowser ? "browser" : null,
    skill.policy.filesystemAccess !== "none" ? `fs:${skill.policy.filesystemAccess}` : null,
    skill.policy.allowSecretAccess ? "secrets" : null
  ].filter(Boolean);

  if (items.length === 0) {
    return locale === "zh" ? "无敏感权限" : "no sensitive access";
  }

  return items.join(" / ");
}

function pricingLabel(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.pricing.billingModel === "free") {
    return locale === "zh" ? "免费" : "free";
  }

  if (skill.pricing.billingModel === "subscription") {
    return locale === "zh" ? "订阅" : "subscription";
  }

  return `${formatMoney(skill.pricing.unitAmountCents, skill.pricing.currency)} / call`;
}

function skillAction(skill: DeveloperProjectSkillRecord, locale: Locale) {
  if (skill.status === "suspended" || skill.policy.state === "suspended") {
    return locale === "zh" ? "处理暂停原因" : "Resolve suspension";
  }

  if (skill.incidents.openCount > 0) {
    return locale === "zh" ? "排查运行事故" : "Investigate incident";
  }

  if (skill.policy.state === "owner_review") {
    return locale === "zh" ? "审核策略权限" : "Approve policy";
  }

  if (skill.updates.count > 0) {
    return locale === "zh" ? "评估版本更新" : "Review update";
  }

  if (skill.runtime.successRate !== null && skill.runtime.successRate < 0.95) {
    return locale === "zh" ? "优化调用质量" : "Improve runtime quality";
  }

  return locale === "zh" ? "持续监控" : "Monitor";
}
