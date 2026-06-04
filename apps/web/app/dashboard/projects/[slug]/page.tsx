import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  Gauge,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
  Zap
} from "lucide-react";
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
    updateHeaders: ["Skill", "Severity", "Event", "Date"],
    callsTitle: "Recent runtime calls",
    callHeaders: ["Skill", "Status", "Latency", "Error"],
    billingTitle: "Subscriptions and billing",
    billingHeaders: ["Skill", "Status", "Model", "Period"],
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
    updateHeaders: ["技能", "级别", "事件", "日期"],
    callsTitle: "最近运行调用",
    callHeaders: ["技能", "状态", "延迟", "错误"],
    billingTitle: "订阅与计费",
    billingHeaders: ["技能", "状态", "模式", "周期"],
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
          <article className="ops-panel project-table-panel">
            <div className="card-kicker">
              <PackageCheck size={16} aria-hidden="true" />
              <span>{labels.skillTitle}</span>
            </div>
            <div className="project-table">
              <div className="project-table__row project-table__row--head project-skill-row">
                {labels.skillHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {detail.installedSkills.length > 0 ? (
                detail.installedSkills.map((skill) => (
                  <div className="project-table__row project-skill-row" key={skill.skillSlug}>
                    <strong>
                      {skill.displayName}
                      <small>
                        {skill.skillSlug} / {formatVersion(skill.version)}
                      </small>
                    </strong>
                    <span>
                      <b className={statusChipClass(skill.policy.state)}>{policyStateLabel(skill.policy.state, locale)}</b>
                      <small>{formatCapabilities(skill, locale)}</small>
                    </span>
                    <span>
                      {formatCompactNumber(skill.runtime.callCount)} / {formatPercent(skill.runtime.successRate)}
                      <small>{formatLatency(skill.runtime.avgLatencyMs, labels.noDate)}</small>
                    </span>
                    <span>
                      {formatMoney(skill.usage.grossCents, skill.usage.currency)}
                      <small>{pricingLabel(skill, locale)}</small>
                    </span>
                    <span>{skillAction(skill, locale)}</span>
                  </div>
                ))
              ) : (
                <div className="project-table__row project-table__row--empty">{labels.empty}</div>
              )}
            </div>
          </article>

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
          <section className="ops-panel project-table-panel">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.keysTitle}</span>
            </div>
            <div className="project-table project-table--compact">
              <div className="project-table__row project-table__row--head project-key-row">
                {labels.keyHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {detail.apiKeys.length > 0 ? (
                detail.apiKeys.map((key) => (
                  <div className="project-table__row project-key-row" key={key.id}>
                    <strong>{key.name}</strong>
                    <code>{key.keyPrefix}...{key.keyLast4}</code>
                    <span>{formatDateValue(key.lastUsedAt, locale, labels.noDate)}</span>
                    <span className={key.revokedAt ? "status-chip status-chip--danger" : "status-chip"}>
                      {key.revokedAt ? labels.revoked : labels.active}
                    </span>
                  </div>
                ))
              ) : (
                <div className="project-table__row project-table__row--empty">{labels.empty}</div>
              )}
            </div>
          </section>

          <section className="ops-panel project-table-panel">
            <div className="card-kicker">
              <Bell size={16} aria-hidden="true" />
              <span>{labels.updatesTitle}</span>
            </div>
            <div className="project-table project-table--compact">
              <div className="project-table__row project-table__row--head project-update-row">
                {labels.updateHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {detail.updateInbox.length > 0 ? (
                detail.updateInbox.map((update) => (
                  <div className="project-table__row project-update-row" key={update.id}>
                    <strong>
                      {update.displayName}
                      <small>{update.skillSlug}</small>
                    </strong>
                    <span className={severityClass(update.severity)}>{update.severity}</span>
                    <span>{update.title}</span>
                    <span>{formatDateValue(update.createdAt, locale, labels.noDate)}</span>
                  </div>
                ))
              ) : (
                <div className="project-table__row project-table__row--empty">{labels.empty}</div>
              )}
            </div>
          </section>

          <section className="ops-panel project-table-panel">
            <div className="card-kicker">
              <Zap size={16} aria-hidden="true" />
              <span>{labels.billingTitle}</span>
            </div>
            <div className="project-table project-table--compact">
              <div className="project-table__row project-table__row--head project-billing-row">
                {labels.billingHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {detail.subscriptions.length > 0 ? (
                detail.subscriptions.map((subscription) => (
                  <div className="project-table__row project-billing-row" key={subscription.id}>
                    <strong>{subscription.displayName}</strong>
                    <span className={statusChipClass(subscription.status)}>{subscription.status}</span>
                    <span>{subscriptionModelLabel(subscription.billingModel, subscription.unitAmountCents, subscription.currency)}</span>
                    <span>{formatDateValue(subscription.currentPeriodEnd, locale, labels.noDate)}</span>
                  </div>
                ))
              ) : (
                <div className="project-table__row project-table__row--empty">{labels.empty}</div>
              )}
            </div>
          </section>
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

function severityClass(severity: string) {
  if (["high", "critical"].includes(severity)) {
    return "status-chip status-chip--danger";
  }

  if (["medium", "warning"].includes(severity)) {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
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

function subscriptionModelLabel(model: "free" | "per_call" | "subscription" | null, cents: number | null, currency: string | null) {
  if (model === "per_call") {
    return `${formatMoney(cents ?? 0, currency ?? "usd")} / call`;
  }

  return model ?? "free";
}
