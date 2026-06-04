import { Activity, BriefcaseBusiness, CreditCard, KeyRound, LockKeyhole, PackageCheck, ReceiptText } from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { OrganizationBillingManager } from "@/components/organization-billing-manager";
import { ProjectCreateForm } from "@/components/project-create-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  getDeveloperBuyerRequests,
  getDeveloperProjects,
  getNotificationPreferences,
  getOrganizationBillingSummary,
  getUserNotifications
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    description:
      "A focused workspace for teams that install and run skills inside agent projects: create projects, watch keys and budgets, open buyer requests, and keep billing ready.",
    emptyProjects: "No developer projects yet. Create a project to start installing and approving skills.",
    eyebrow: "Developer workspace",
    metrics: {
      budget: "Monthly budget",
      calls: "Runtime calls",
      installed: "Installed skills",
      projects: "Projects"
    },
    projectHeaders: ["Project", "Installed", "Keys", "Budget", "Runtime"],
    projectTitle: "Agent project operations",
    title: "Manage the skills your agents use."
  },
  zh: {
    description:
      "给下载和使用技能的团队准备的独立工作台：创建智能体项目、查看 API Key 和预算、发布买方需求，并保持账单资料可用。",
    emptyProjects: "还没有开发者项目。先创建一个项目，再开始安装和审批技能。",
    eyebrow: "开发者工作台",
    metrics: {
      budget: "月度预算",
      calls: "运行调用",
      installed: "已安装技能",
      projects: "项目"
    },
    projectHeaders: ["项目", "已安装", "Key", "预算", "运行"],
    projectTitle: "智能体项目运营",
    title: "管理你的智能体正在使用的技能。"
  }
} as const;

export default async function DeveloperPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const labels = copy[locale];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const [developerProjects, developerBuyerRequests, organizationBilling, userNotifications, notificationPreferences, session] =
    await Promise.all([
      getDeveloperProjects(),
      getDeveloperBuyerRequests(),
      getOrganizationBillingSummary(),
      getUserNotifications(),
      getNotificationPreferences(),
      getWorkspaceSession()
    ]);
  const currency = developerProjects[0]?.usage.currency ?? "usd";
  const totalInstalled = developerProjects.reduce((sum, project) => sum + project.installs.installedSkillCount, 0);
  const totalCalls = developerProjects.reduce((sum, project) => sum + project.runtime.callCount, 0);
  const totalBudget = developerProjects.reduce((sum, project) => sum + project.policy.monthlyBudgetCents, 0);
  const visibleMetrics = [
    [labels.metrics.projects, formatCompactNumber(developerProjects.length)],
    [labels.metrics.installed, formatCompactNumber(totalInstalled)],
    [labels.metrics.calls, formatCompactNumber(totalCalls)],
    [labels.metrics.budget, formatMoney(totalBudget, currency)]
  ];

  return (
    <main className="product-shell">
      <SiteHeader active="developer" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/developer" />

      <section className="page-hero page-hero--compact">
        <div>
          <div className="eyebrow">
            <BriefcaseBusiness size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
      </section>

      <section className="console-board developer-console-board">
        <SessionStatusPanel locale={locale} session={session} />

        <div className="metric-strip metric-strip--four metric-strip--standalone">
          {visibleMetrics.map(([label, value], index) => {
            const Icon = index === 0 ? BriefcaseBusiness : index === 1 ? PackageCheck : index === 2 ? Activity : CreditCard;

            return (
              <div className="metric developer-metric" key={label}>
                <Icon size={16} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="developer-command-layout">
        <div className="developer-command-main">
          <article className="ops-panel work-table-panel">
            <div className="card-kicker">
              <LockKeyhole size={16} aria-hidden="true" />
              <span>{labels.projectTitle}</span>
            </div>
            <ProjectCreateForm locale={locale} />
            <div className="work-table developer-project-table">
              <div className="work-table__row work-table__row--head developer-project-row">
                {labels.projectHeaders.map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>
              {developerProjects.length > 0 ? (
                developerProjects.slice(0, 8).map((project) => (
                  <div className="work-table__row developer-project-row" key={project.slug}>
                    <strong>
                      <a className="table-link" href={localizedHref(`/dashboard/projects/${project.slug}`, locale)}>
                        {project.name}
                      </a>
                    </strong>
                    <span>
                      {project.installs.installedSkillCount} installed / {project.installs.approvedSkillCount} approved
                    </span>
                    <span>
                      {project.apiKeys.activeCount} active / {project.apiKeys.revokedCount} revoked
                    </span>
                    <span>{formatMoney(project.policy.monthlyBudgetCents, project.usage.currency)}</span>
                    <span>
                      {formatCompactNumber(project.runtime.callCount)} calls / {project.policy.state}
                    </span>
                  </div>
                ))
              ) : (
                <div className="work-table__row developer-project-row developer-project-row--empty">
                  <strong>{labels.emptyProjects}</strong>
                </div>
              )}
            </div>
          </article>

          <BuyerRequestManager
            developerRequests={developerBuyerRequests}
            locale={locale}
            mode="developer"
            publisherRequests={[]}
          />
        </div>

        <aside className="developer-command-side">
          <OrganizationBillingManager billing={organizationBilling} locale={locale} />

          <NotificationInboxManager locale={locale} notifications={userNotifications} />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />

          <article className="ops-panel runtime-ops-panel">
            <div className="card-kicker">
              <ReceiptText size={16} aria-hidden="true" />
              <span>{locale === "zh" ? "下一步" : "Next actions"}</span>
            </div>
            <div className="trust-requirement-grid trust-requirement-grid--single">
              <div className="trust-requirement">
                <KeyRound size={16} aria-hidden="true" />
                <strong>{locale === "zh" ? "轮换项目 API Key" : "Rotate project API keys"}</strong>
                <span>{locale === "zh" ? "进入项目详情页创建新 key，并撤销旧 key。" : "Open a project detail page to create a replacement key and revoke stale keys."}</span>
              </div>
              <div className="trust-requirement">
                <PackageCheck size={16} aria-hidden="true" />
                <strong>{locale === "zh" ? "审批高风险技能" : "Approve high-risk skills"}</strong>
                <span>{locale === "zh" ? "项目策略页会展示权限、预算、速率限制和 owner 审批状态。" : "Project policies expose permissions, budgets, rate limits, and owner approval state."}</span>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}
