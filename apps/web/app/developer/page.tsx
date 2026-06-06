import { Activity, BriefcaseBusiness, CreditCard, KeyRound, LockKeyhole, PackageCheck, ReceiptText } from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { JourneyRail } from "@/components/journey-rail";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { OrganizationBillingManager } from "@/components/organization-billing-manager";
import { OrganizationTeamManager } from "@/components/organization-team-manager";
import { OrganizationWebhookManager } from "@/components/organization-webhook-manager";
import { ProjectCreateForm } from "@/components/project-create-form";
import { SessionStatusPanel } from "@/components/session-status-panel";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import {
  formatCompactNumber,
  formatMoney,
  getDeveloperBuyerRequests,
  getDeveloperProjects,
  getNotificationPreferences,
  getOrganizationBillingSummary,
  getOrganizationTeamMembers,
  getOrganizationWebhookEndpoints,
  getUserNotificationInbox,
  type DeveloperProjectRecord
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type DeveloperLocale = "en" | "zh";

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
    nextActions: {
      billing: ["Review billing", "Keep invoice profile and payment method readiness clear before paid runtime grows."],
      createKey: ["Create runtime key", "No active project key exists yet. Create a reveal-once key before handing SkillHub to an agent."],
      createProject: ["Create first project", "Start with one agent project so marketplace decisions become project state."],
      installSkill: ["Install first skill", "Browse the marketplace and install a verified skill before runtime testing."],
      monitor: ["Monitor operations", "Runtime, updates, costs, keys, and notifications are ready for weekly review."],
      ownerReview: ["Approve high-risk policy", "A skill needs owner approval before agents can invoke it under project policy."],
      runtime: ["Inspect runtime quality", "Errors, blocked calls, or low success rate need review before scaling agent traffic."],
      update: ["Review version update", "A publisher update or incident is waiting for an explicit project decision."]
    },
    nextActionsDescription: "These are the project states that make developers come back after the first install.",
    nextActionsTitle: "Operating queue",
    openMarketplace: "Browse marketplace",
    openProject: "Open project",
    projectRow: {
      active: "active",
      approved: "approved",
      calls: "calls",
      installed: "installed",
      ownerReview: "owner review",
      revoked: "revoked",
      suspended: "suspended"
    },
    projectHeaders: ["Project", "Installed", "Keys", "Budget", "Runtime / next step"],
    projectTitle: "Agent project operations",
    title: "Manage the skills your agents use."
  },
  zh: {
    description:
      "给安装和运行技能的团队准备的独立工作台：创建智能体项目、管理 API Key、预算、买家需求、账单和运行治理。",
    emptyProjects: "还没有开发者项目。先创建一个项目，再开始安装、审批和测试技能。",
    eyebrow: "开发者工作台",
    metrics: {
      budget: "月度预算",
      calls: "运行调用",
      installed: "已安装技能",
      projects: "项目"
    },
    nextActions: {
      billing: ["检查账单准备", "在付费运行扩大前，确认发票资料和支付方式状态清楚。"],
      createKey: ["创建运行 Key", "当前项目还没有活跃 Key。先创建一次性展示的 Key，再交给智能体运行。"],
      createProject: ["创建第一个项目", "先建立一个智能体项目，让市场里的选择变成真实项目状态。"],
      installSkill: ["安装第一个技能", "去市场选择一个已验证技能，安装后再进入运行测试。"],
      monitor: ["持续监控运营", "运行、更新、成本、Key 和通知都已进入可复查状态。"],
      ownerReview: ["审批高风险策略", "有技能需要负责人审批后，智能体才可以通过项目策略调用。"],
      runtime: ["检查运行质量", "错误、阻断调用或成功率偏低，需要在扩大调用前处理。"],
      update: ["处理版本更新", "发布者更新或事故通知正在等待项目侧明确决策。"]
    },
    nextActionsDescription: "这些项目状态，就是开发者第一次安装之后还会回来的原因。",
    nextActionsTitle: "运营队列",
    openMarketplace: "浏览市场",
    openProject: "打开项目",
    projectRow: {
      active: "活跃",
      approved: "已批准",
      calls: "次调用",
      installed: "已安装",
      ownerReview: "负责人审批",
      revoked: "已撤销",
      suspended: "已暂停"
    },
    projectHeaders: ["项目", "已安装", "Key", "预算", "运行 / 下一步"],
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
  const [
    developerProjects,
    developerBuyerRequests,
    organizationBilling,
    organizationTeamMembers,
    organizationWebhookEndpoints,
    userNotificationInbox,
    notificationPreferences,
    session
  ] =
    await Promise.all([
      getDeveloperProjects(),
      getDeveloperBuyerRequests(),
      getOrganizationBillingSummary(),
      getOrganizationTeamMembers(),
      getOrganizationWebhookEndpoints(),
      getUserNotificationInbox(),
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
  const projectNextSteps = developerProjects.slice(0, 4).map((project) => ({
    project,
    step: getDeveloperProjectNextStep(project, locale)
  }));

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

      <JourneyRail currentStep="developer" journey="developer" locale={locale} />

      <section className="console-board developer-console-board">
        <SessionStatusPanel locale={locale} session={session} />
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={["developer", "owner", "admin", "super_admin"]}
          session={session}
          workspace="developer"
        />

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
                developerProjects.slice(0, 8).map((project) => {
                  const nextStep = getDeveloperProjectNextStep(project, locale);

                  return (
                    <div className="work-table__row developer-project-row" key={project.slug}>
                      <strong>
                        <a className="table-link" href={localizedHref(`/dashboard/projects/${project.slug}`, locale)}>
                          {project.name}
                        </a>
                      </strong>
                      <span>
                        {project.installs.installedSkillCount} {labels.projectRow.installed} / {project.installs.approvedSkillCount} {labels.projectRow.approved}
                      </span>
                      <span>
                        {project.apiKeys.activeCount} {labels.projectRow.active} / {project.apiKeys.revokedCount} {labels.projectRow.revoked}
                      </span>
                      <span>{formatMoney(project.policy.monthlyBudgetCents, project.usage.currency)}</span>
                      <span>
                        {formatCompactNumber(project.runtime.callCount)} {labels.projectRow.calls} / {projectPolicyStateLabel(project.policy.state, locale)}
                        <small>{nextStep.title}</small>
                      </span>
                    </div>
                  );
                })
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
          <OrganizationTeamManager locale={locale} members={organizationTeamMembers} />

          <OrganizationBillingManager billing={organizationBilling} locale={locale} />

          <OrganizationWebhookManager endpoints={organizationWebhookEndpoints} locale={locale} />

          <NotificationInboxManager
            locale={locale}
            notifications={userNotificationInbox.notifications}
            summary={userNotificationInbox.summary}
          />

          <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />

          <article className="ops-panel runtime-ops-panel">
            <div className="card-kicker">
              <ReceiptText size={16} aria-hidden="true" />
              <span>{labels.nextActionsTitle}</span>
            </div>
            <p className="developer-next-action-intro">{labels.nextActionsDescription}</p>
            <div className="trust-requirement-grid trust-requirement-grid--single">
              {projectNextSteps.length > 0 ? (
                projectNextSteps.map(({ project, step }) => (
                  <div className="trust-requirement developer-next-action" key={project.slug}>
                    <KeyRound size={16} aria-hidden="true" />
                    <strong>{step.title}</strong>
                    <span>{project.name}: {step.detail}</span>
                    <a className="ghost-button ghost-button--inline" href={localizedHref(step.href, locale)}>
                      {step.href === "/marketplace" ? labels.openMarketplace : labels.openProject}
                    </a>
                  </div>
                ))
              ) : (
                <div className="trust-requirement developer-next-action">
                  <PackageCheck size={16} aria-hidden="true" />
                  <strong>{labels.nextActions.createProject[0]}</strong>
                  <span>{labels.nextActions.createProject[1]}</span>
                </div>
              )}
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function getDeveloperProjectNextStep(project: DeveloperProjectRecord, locale: DeveloperLocale) {
  const labels = copy[locale].nextActions;
  const projectHref = `/dashboard/projects/${project.slug}`;

  if (project.apiKeys.activeCount === 0) {
    return { detail: labels.createKey[1], href: projectHref, title: labels.createKey[0] };
  }

  if (project.installs.installedSkillCount === 0) {
    return { detail: labels.installSkill[1], href: "/marketplace", title: labels.installSkill[0] };
  }

  if (project.policy.state === "owner_review" || project.installs.ownerRequiredCount > 0 || project.policy.approvalRequiredCount > 0) {
    return { detail: labels.ownerReview[1], href: projectHref, title: labels.ownerReview[0] };
  }

  if (project.installs.suspendedInstallCount > 0 || project.policy.state === "suspended") {
    return { detail: labels.runtime[1], href: projectHref, title: labels.runtime[0] };
  }

  if (project.updates.count > 0) {
    return { detail: labels.update[1], href: projectHref, title: labels.update[0] };
  }

  if (
    project.runtime.blockedCount > 0 ||
    project.runtime.errorCount > 0 ||
    (project.runtime.successRate !== null && project.runtime.successRate < 0.95)
  ) {
    return { detail: labels.runtime[1], href: projectHref, title: labels.runtime[0] };
  }

  if (project.usage.grossCents > 0 && project.subscriptions.activeCount === 0) {
    return { detail: labels.billing[1], href: projectHref, title: labels.billing[0] };
  }

  return { detail: labels.monitor[1], href: projectHref, title: labels.monitor[0] };
}

function projectPolicyStateLabel(state: DeveloperProjectRecord["policy"]["state"], locale: DeveloperLocale) {
  const labels = copy[locale].projectRow;

  if (state === "owner_review") {
    return labels.ownerReview;
  }

  if (state === "suspended") {
    return labels.suspended;
  }

  return labels.approved;
}
