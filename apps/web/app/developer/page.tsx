import {
  Activity,
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  ReceiptText
} from "lucide-react";
import { BuyerRequestManager } from "@/components/buyer-request-manager";
import { JourneyRail } from "@/components/journey-rail";
import { NotificationInboxManager } from "@/components/notification-inbox-manager";
import { NotificationPreferenceManager } from "@/components/notification-preference-manager";
import { OrganizationBillingManager } from "@/components/organization-billing-manager";
import { OrganizationTeamManager } from "@/components/organization-team-manager";
import { OrganizationWebhookManager } from "@/components/organization-webhook-manager";
import { OperatingEvidenceChain } from "@/components/operating-evidence-chain";
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
  type BuyerRequestRecord,
  type DeveloperProjectRecord,
  type OrganizationBillingSummary,
  type OrganizationTeamMember,
  type OrganizationWebhookEndpoint,
  type UserNotificationInbox
} from "@/lib/ops-data";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type DeveloperLocale = "en" | "zh";

type DeveloperPriorityTone = "danger" | "ready" | "warning";

type DeveloperPriorityItem = {
  actionLabel: string;
  detail: string;
  href: string;
  id: string;
  metric: string;
  priority: number;
  title: string;
  tone: DeveloperPriorityTone;
};

type DeveloperOperationsSummary = {
  billingActions: number;
  installGaps: number;
  keyGaps: number;
  notificationActions: number;
  projectActions: number;
  runtimeActions: number;
};

const developerAccessRoles = ["developer", "owner", "admin", "super_admin"];

const developerCommandCopy = {
  en: {
    body:
      "The developer workspace should behave like an operating queue: project setup, runtime keys, installs, approvals, updates, billing, notifications, team access, and webhooks all point to one next move.",
    completeAction: "Review project operations",
    completeDetail:
      "Core developer controls are healthy. Keep watching runtime quality, version updates, invoices, notification topics, team access, and webhook delivery before scaling agent traffic.",
    completeTitle: "Developer runtime loop is healthy",
    eyebrow: "Developer operations queue",
    title: "What should the agent team handle next?",
    metrics: {
      inbox: "Unread inbox",
      installs: "Install gaps",
      keys: "Key gaps",
      projects: "Projects",
      runtime: "Runtime watch"
    },
    queue: {
      readyMetric: "Healthy",
      title: "Priority queue"
    },
    queueActions: {
      approvals: "Open policy review",
      billing: "Open billing",
      createProject: "Create project",
      demand: "Open buyer requests",
      installs: "Browse marketplace",
      keys: "Open project keys",
      monitor: "Review project operations",
      notifications: "Open inbox",
      runtime: "Inspect runtime logs",
      suspended: "Open runtime policy",
      team: "Invite team",
      updates: "Open update inbox",
      webhooks: "Configure webhooks"
    },
    queueItems: {
      approvals: "High-risk install or policy approval is waiting for an owner decision before runtime.",
      billing: "Invoice profile or payment-method readiness is incomplete for paid runtime growth.",
      createProject: "No agent project exists yet, so marketplace choices cannot become governed project state.",
      demand: "A buyer request is still open, claimed, or submitted and needs a developer decision.",
      installs: "A project exists without installed skills, so runtime testing cannot prove the marketplace loop.",
      keys: "A project has no active reveal-once runtime key for REST or MCP agent clients.",
      notifications: "Unread operating notifications need review before project teams miss updates or incidents.",
      runtime: "Blocked calls, runtime errors, or low success rate should be reviewed before scaling agent traffic.",
      suspended: "A project has suspended policy or installs that block normal governed invocation.",
      team: "Only one active member is visible; add role-scoped teammates before sensitive operations expand.",
      updates: "Version updates or incident notices are waiting for explicit project adoption, ignore, or schedule decisions.",
      webhooks: "Webhook endpoints are missing, paused, disabled, or failing while project operations are active."
    },
    queueTitles: {
      approvals: "Owner approval",
      billing: "Billing readiness",
      createProject: "Project setup",
      demand: "Buyer requests",
      installs: "Skill installation",
      keys: "Runtime keys",
      notifications: "Notification inbox",
      runtime: "Runtime quality",
      suspended: "Suspended runtime",
      team: "Team access",
      updates: "Update inbox",
      webhooks: "Webhook delivery"
    },
    queueTones: {
      danger: "Urgent",
      ready: "Ready",
      warning: "Needs work"
    }
  },
  zh: {
    body:
      "开发者工作台不应该只是看项目列表，而是把项目创建、运行 Key、安装、审批、更新、账单、通知、团队和 webhook 都收束成一个下一步。",
    completeAction: "查看项目运营",
    completeDetail:
      "核心开发者控制已经健康。接下来持续复查运行质量、版本更新、发票、通知主题、团队权限和 webhook 投递，再扩大智能体调用。",
    completeTitle: "开发者运行闭环正常",
    eyebrow: "开发者运营队列",
    title: "智能体团队现在应该先处理什么？",
    metrics: {
      inbox: "未读通知",
      installs: "安装缺口",
      keys: "Key 缺口",
      projects: "项目",
      runtime: "运行关注"
    },
    queue: {
      readyMetric: "健康",
      title: "优先级队列"
    },
    queueActions: {
      approvals: "打开策略审批",
      billing: "打开账单",
      createProject: "创建项目",
      demand: "打开需求板",
      installs: "浏览市场",
      keys: "打开项目 Key",
      monitor: "查看项目运营",
      notifications: "打开通知",
      runtime: "检查运行日志",
      suspended: "打开运行策略",
      team: "邀请团队",
      updates: "打开更新收件箱",
      webhooks: "配置 webhook"
    },
    queueItems: {
      approvals: "高风险安装或策略审批正在等待负责人决策，完成后才能进入运行。",
      billing: "发票资料或支付方式准备不完整，会影响付费运行扩大。",
      createProject: "还没有智能体项目，市场里的选择还不能变成受治理的项目状态。",
      demand: "买家需求仍处于开放、认领或已提交状态，需要开发者侧做决策。",
      installs: "项目还没有安装技能，无法用运行测试证明市场闭环。",
      keys: "项目没有活跃的一次性展示运行 Key，REST 或 MCP 智能体客户端还不能接入。",
      notifications: "有未读运营通知需要处理，避免团队错过更新或事故。",
      runtime: "阻断调用、运行错误或成功率偏低，需要在扩大智能体流量前复查。",
      suspended: "项目策略或安装已暂停，会阻断正常的受治理调用。",
      team: "当前只看到一个活跃成员，敏感操作扩大前应先加入有角色边界的队友。",
      updates: "版本更新或事故通知正在等待项目侧明确采用、忽略或排期。",
      webhooks: "项目运营已活跃，但 webhook 端点缺失、暂停、禁用或投递失败。"
    },
    queueTitles: {
      approvals: "负责人审批",
      billing: "账单准备",
      createProject: "项目创建",
      demand: "买家需求",
      installs: "技能安装",
      keys: "运行 Key",
      notifications: "通知收件箱",
      runtime: "运行质量",
      suspended: "运行暂停",
      team: "团队权限",
      updates: "更新收件箱",
      webhooks: "Webhook 投递"
    },
    queueTones: {
      danger: "紧急",
      ready: "已就绪",
      warning: "待处理"
    }
  }
} as const;

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
  const session = await getWorkspaceSession();
  const hasWorkspaceSession = Boolean(session.subject);
  const roleSet = new Set([session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(Boolean));
  const hasDeveloperAccess = hasWorkspaceSession && developerAccessRoles.some((role) => roleSet.has(role));

  if (!hasDeveloperAccess) {
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
          <WorkspaceAccessPanel locale={locale} requiredRoles={developerAccessRoles} session={session} workspace="developer" />
        </section>

        <WorkspaceLockedPanel
          actionHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "开发者工作台会创建项目、Key、团队成员、账单资料、webhook 和通知偏好。当前会话缺少开发者权限，因此写操作和工作区数据保持隐藏。"
              : "The developer workspace creates projects, keys, team access, billing profiles, webhooks, and notification preferences. This session cannot operate them, so workspace data and write controls stay hidden."
          }
          signals={locale === "zh" ? ["开发者运营队列", "优先级队列", "团队权限", "webhook"] : ["developer operations queue", "team access", "webhook", "runtime governance"]}
          title={hasWorkspaceSession ? (locale === "zh" ? "需要开发者角色" : "Developer role required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      </main>
    );
  }

  const [
    developerProjects,
    developerBuyerRequests,
    organizationBilling,
    organizationTeamMembers,
    organizationWebhookEndpoints,
    userNotificationInbox,
    notificationPreferences
  ] =
    await Promise.all([
      getDeveloperProjects(),
      getDeveloperBuyerRequests(),
      getOrganizationBillingSummary(),
      getOrganizationTeamMembers(),
      getOrganizationWebhookEndpoints(),
      getUserNotificationInbox(),
      getNotificationPreferences()
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
  const developerPriorityInput = {
    billing: organizationBilling,
    buyerRequests: developerBuyerRequests,
    inbox: userNotificationInbox,
    locale,
    projects: developerProjects,
    teamMembers: organizationTeamMembers,
    webhookEndpoints: organizationWebhookEndpoints
  };
  const developerPrioritySummary = buildDeveloperOperationsSummary(developerPriorityInput);
  const developerPriorityItems = buildDeveloperPriorityItems(developerPriorityInput);
  const primaryDeveloperPriorityItem = developerPriorityItems[0];
  const developerCommandLabels = developerCommandCopy[locale];
  const developerCommandMetrics = [
    [developerCommandLabels.metrics.projects, formatCompactNumber(developerProjects.length)],
    [developerCommandLabels.metrics.keys, formatCompactNumber(developerPrioritySummary.keyGaps)],
    [developerCommandLabels.metrics.installs, formatCompactNumber(developerPrioritySummary.installGaps)],
    [developerCommandLabels.metrics.runtime, formatCompactNumber(developerPrioritySummary.runtimeActions)],
    [developerCommandLabels.metrics.inbox, formatCompactNumber(developerPrioritySummary.notificationActions)]
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

      <JourneyRail currentStep="developer" journey="developer" locale={locale} />

      <OperatingEvidenceChain
        focus="developer"
        locale={locale}
        stats={[
          { label: labels.metrics.projects, value: formatCompactNumber(developerProjects.length) },
          { label: labels.metrics.installed, tone: totalInstalled > 0 ? "good" : "attention", value: formatCompactNumber(totalInstalled) },
          { label: labels.metrics.calls, value: formatCompactNumber(totalCalls) },
          { label: labels.metrics.budget, value: formatMoney(totalBudget, currency) }
        ]}
      />

      <section className="console-board developer-console-board">
        <SessionStatusPanel locale={locale} session={session} />
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={developerAccessRoles}
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

      {hasDeveloperAccess ? (
        <>
      <section className="publisher-priority-board developer-priority-board" aria-labelledby="developer-priority-heading">
        <article className="publisher-priority-card developer-priority-card">
          <div className="publisher-priority-card__main">
            <div className="card-kicker">
              <ClipboardList size={16} aria-hidden="true" />
              <span>{developerCommandLabels.eyebrow}</span>
            </div>
            <h2 id="developer-priority-heading">{developerCommandLabels.title}</h2>
            <p>{developerCommandLabels.body}</p>

            <div className="publisher-priority-list developer-priority-list" aria-label={developerCommandLabels.queue.title}>
              {developerPriorityItems.map((item) => (
                <a className={`publisher-priority-task publisher-priority-task--${item.tone}`} href={item.href} key={item.id}>
                  <span>
                    {developerCommandLabels.queueTones[item.tone]} / {item.metric}
                  </span>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <b>
                    {item.actionLabel}
                    <ArrowRight size={14} aria-hidden="true" />
                  </b>
                </a>
              ))}
            </div>

            <a className="primary-button publisher-priority-card__action" href={primaryDeveloperPriorityItem.href}>
              <span>{primaryDeveloperPriorityItem.actionLabel}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="publisher-priority-metrics developer-priority-metrics">
            {developerCommandMetrics.map(([label, value], index) => {
              const Icon = index === 0 ? BriefcaseBusiness : index === 1 ? KeyRound : index === 2 ? PackageCheck : index === 3 ? Activity : BellRing;

              return (
                <div className="publisher-priority-metric developer-priority-metric" key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="developer-command-layout">
        <div className="developer-command-main">
          <article className="ops-panel work-table-panel" id="developer-projects">
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

          <div id="developer-demand">
            <BuyerRequestManager
              developerRequests={developerBuyerRequests}
              locale={locale}
              mode="developer"
              publisherRequests={[]}
            />
          </div>
        </div>

        <aside className="developer-command-side">
          <div id="developer-team">
            <OrganizationTeamManager locale={locale} members={organizationTeamMembers} />
          </div>

          <div id="developer-billing">
            <OrganizationBillingManager billing={organizationBilling} locale={locale} />
          </div>

          <div id="developer-webhooks">
            <OrganizationWebhookManager endpoints={organizationWebhookEndpoints} locale={locale} />
          </div>

          <div id="developer-notifications">
            <NotificationInboxManager
              locale={locale}
              notifications={userNotificationInbox.notifications}
              summary={userNotificationInbox.summary}
            />
          </div>

          <div id="developer-preferences">
            <NotificationPreferenceManager locale={locale} preferences={notificationPreferences} />
          </div>

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
        </>
      ) : (
        <WorkspaceLockedPanel
          actionHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
          actionLabel={hasWorkspaceSession ? (locale === "zh" ? "查看账号角色" : "Check account roles") : (locale === "zh" ? "先登录" : "Sign in")}
          body={
            locale === "zh"
              ? "开发者工作台会创建项目、Key、团队成员、账单资料、webhook 和通知偏好。当前会话缺少开发者权限，因此写操作已隐藏，但你仍然可以看到这里会承载的运营队列。"
              : "The developer workspace creates projects, keys, team access, billing profiles, webhooks, and notification preferences. This session cannot operate them, but the locked state still shows what the workspace governs."
          }
          signals={
            locale === "zh"
              ? ["开发者运营队列", "优先级队列", "团队权限", "webhook"]
              : ["developer operations queue", "team access", "webhook"]
          }
          title={hasWorkspaceSession ? (locale === "zh" ? "需要开发者角色" : "Developer role required") : (locale === "zh" ? "需要先登录" : "Sign-in required")}
        />
      )}
    </main>
  );
}

function WorkspaceLockedPanel({
  actionHref,
  actionLabel,
  body,
  signals,
  title
}: {
  actionHref: string;
  actionLabel: string;
  body: string;
  signals: string[];
  title: string;
}) {
  return (
    <section className="workspace-locked-panel">
      <article className="ops-panel">
        <div className="card-kicker">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>{title}</span>
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="workspace-locked-panel__signals" aria-label={title}>
          {signals.map((signal) => (
            <span className="status-chip status-chip--neutral" key={signal}>
              {signal}
            </span>
          ))}
        </div>
        <a className="primary-button" href={actionHref}>
          <span>{actionLabel}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </article>
    </section>
  );
}

function buildDeveloperOperationsSummary(input: {
  billing: OrganizationBillingSummary;
  buyerRequests: BuyerRequestRecord[];
  inbox: UserNotificationInbox;
  projects: DeveloperProjectRecord[];
  teamMembers: OrganizationTeamMember[];
  webhookEndpoints: OrganizationWebhookEndpoint[];
}): DeveloperOperationsSummary {
  const runtimeActions = input.projects.filter(hasRuntimeQualityIssue).length;
  const projectActions =
    input.projects.filter((project) => project.apiKeys.activeCount === 0).length +
    input.projects.filter((project) => project.installs.installedSkillCount === 0).length +
    input.projects.filter(hasApprovalGap).length +
    input.projects.filter(hasSuspendedRuntime).length +
    input.projects.reduce((sum, project) => sum + project.updates.count, 0);

  return {
    billingActions: hasBillingReadinessGap(input.billing, input.projects) ? 1 : 0,
    installGaps: input.projects.filter((project) => project.installs.installedSkillCount === 0).length,
    keyGaps: input.projects.filter((project) => project.apiKeys.activeCount === 0).length,
    notificationActions: input.inbox.summary.unread,
    projectActions,
    runtimeActions
  };
}

function buildDeveloperPriorityItems(input: {
  billing: OrganizationBillingSummary;
  buyerRequests: BuyerRequestRecord[];
  inbox: UserNotificationInbox;
  locale: DeveloperLocale;
  projects: DeveloperProjectRecord[];
  teamMembers: OrganizationTeamMember[];
  webhookEndpoints: OrganizationWebhookEndpoint[];
}): DeveloperPriorityItem[] {
  const labels = developerCommandCopy[input.locale];
  const items: DeveloperPriorityItem[] = [];
  const firstProject = input.projects[0] ?? null;
  const firstProjectHref = firstProject ? projectHref(firstProject, input.locale) : developerAnchor("developer-projects", input.locale);
  const keyGapProject = input.projects.find((project) => project.apiKeys.activeCount === 0);
  const installGapProject = input.projects.find((project) => project.installs.installedSkillCount === 0);
  const approvalGapProject = input.projects.find(hasApprovalGap);
  const suspendedProject = input.projects.find(hasSuspendedRuntime);
  const updateProject = input.projects.find((project) => project.updates.count > 0);
  const runtimeProject = input.projects.find(hasRuntimeQualityIssue);
  const keyGaps = input.projects.filter((project) => project.apiKeys.activeCount === 0).length;
  const installGaps = input.projects.filter((project) => project.installs.installedSkillCount === 0).length;
  const approvalGaps = input.projects.filter(hasApprovalGap).length;
  const suspendedGaps = input.projects.filter(hasSuspendedRuntime).length;
  const updateCount = input.projects.reduce((sum, project) => sum + project.updates.count, 0);
  const runtimeGaps = input.projects.filter(hasRuntimeQualityIssue).length;
  const runtimeDangerCount = input.projects.filter(
    (project) => project.runtime.blockedCount > 0 || project.runtime.errorCount > 0 || project.policy.state === "suspended"
  ).length;
  const billingGap = hasBillingReadinessGap(input.billing, input.projects);
  const unreadCount = input.inbox.summary.unread;
  const webhookGapCount = countWebhookSetupActions(input.webhookEndpoints, input.projects);
  const failedWebhookCount = input.webhookEndpoints.filter(
    (endpoint) => endpoint.status === "disabled" || endpoint.lastDeliveryStatus === "failed" || endpoint.failureCount > 0
  ).length;
  const teamGap = input.projects.length > 0 && input.teamMembers.length <= 1;
  const demandCount = input.buyerRequests.filter(isActiveDeveloperBuyerRequest).length;

  if (input.projects.length === 0) {
    items.push({
      actionLabel: labels.queueActions.createProject,
      detail: labels.queueItems.createProject,
      href: developerAnchor("developer-projects", input.locale),
      id: "create-project",
      metric: labels.queueTones.warning,
      priority: 10,
      title: labels.queueTitles.createProject,
      tone: "warning"
    });
  }

  if (keyGaps > 0 && keyGapProject) {
    items.push({
      actionLabel: labels.queueActions.keys,
      detail: labels.queueItems.keys,
      href: projectHref(keyGapProject, input.locale),
      id: "runtime-keys",
      metric: formatCompactNumber(keyGaps),
      priority: 20,
      title: labels.queueTitles.keys,
      tone: "warning"
    });
  }

  if (installGaps > 0 && installGapProject) {
    items.push({
      actionLabel: labels.queueActions.installs,
      detail: labels.queueItems.installs,
      href: localizedHref("/marketplace", input.locale),
      id: "skill-installation",
      metric: formatCompactNumber(installGaps),
      priority: 25,
      title: labels.queueTitles.installs,
      tone: "warning"
    });
  }

  if (approvalGaps > 0 && approvalGapProject) {
    items.push({
      actionLabel: labels.queueActions.approvals,
      detail: labels.queueItems.approvals,
      href: projectHref(approvalGapProject, input.locale),
      id: "owner-approval",
      metric: formatCompactNumber(approvalGaps),
      priority: 30,
      title: labels.queueTitles.approvals,
      tone: "danger"
    });
  }

  if (suspendedGaps > 0 && suspendedProject) {
    items.push({
      actionLabel: labels.queueActions.suspended,
      detail: labels.queueItems.suspended,
      href: projectHref(suspendedProject, input.locale),
      id: "suspended-runtime",
      metric: formatCompactNumber(suspendedGaps),
      priority: 32,
      title: labels.queueTitles.suspended,
      tone: "danger"
    });
  }

  if (updateCount > 0 && updateProject) {
    items.push({
      actionLabel: labels.queueActions.updates,
      detail: labels.queueItems.updates,
      href: projectHref(updateProject, input.locale),
      id: "update-inbox",
      metric: formatCompactNumber(updateCount),
      priority: 40,
      title: labels.queueTitles.updates,
      tone: "warning"
    });
  }

  if (runtimeGaps > 0 && runtimeProject) {
    items.push({
      actionLabel: labels.queueActions.runtime,
      detail: labels.queueItems.runtime,
      href: projectHref(runtimeProject, input.locale),
      id: "runtime-quality",
      metric: formatCompactNumber(runtimeDangerCount || runtimeGaps),
      priority: runtimeDangerCount > 0 ? 35 : 50,
      title: labels.queueTitles.runtime,
      tone: runtimeDangerCount > 0 ? "danger" : "warning"
    });
  }

  if (billingGap) {
    items.push({
      actionLabel: labels.queueActions.billing,
      detail: labels.queueItems.billing,
      href: developerAnchor("developer-billing", input.locale),
      id: "billing-readiness",
      metric: formatCompactNumber(1),
      priority: hasPaidRuntimeSignal(input.projects) ? 42 : 72,
      title: labels.queueTitles.billing,
      tone: "warning"
    });
  }

  if (demandCount > 0) {
    items.push({
      actionLabel: labels.queueActions.demand,
      detail: labels.queueItems.demand,
      href: developerAnchor("developer-demand", input.locale),
      id: "buyer-requests",
      metric: formatCompactNumber(demandCount),
      priority: 48,
      title: labels.queueTitles.demand,
      tone: "warning"
    });
  }

  if (unreadCount > 0) {
    items.push({
      actionLabel: labels.queueActions.notifications,
      detail: labels.queueItems.notifications,
      href: developerAnchor("developer-notifications", input.locale),
      id: "notifications",
      metric: formatCompactNumber(unreadCount),
      priority: 55,
      title: labels.queueTitles.notifications,
      tone: "warning"
    });
  }

  if (webhookGapCount > 0) {
    items.push({
      actionLabel: labels.queueActions.webhooks,
      detail: labels.queueItems.webhooks,
      href: developerAnchor("developer-webhooks", input.locale),
      id: "webhooks",
      metric: formatCompactNumber(failedWebhookCount || webhookGapCount),
      priority: failedWebhookCount > 0 ? 52 : 78,
      title: labels.queueTitles.webhooks,
      tone: failedWebhookCount > 0 ? "danger" : "warning"
    });
  }

  if (teamGap) {
    items.push({
      actionLabel: labels.queueActions.team,
      detail: labels.queueItems.team,
      href: developerAnchor("developer-team", input.locale),
      id: "team-access",
      metric: formatCompactNumber(input.teamMembers.length),
      priority: 80,
      title: labels.queueTitles.team,
      tone: "ready"
    });
  }

  if (items.length === 0) {
    items.push({
      actionLabel: labels.queueActions.monitor,
      detail: input.projects.length > 0 ? labels.completeDetail : labels.queueItems.createProject,
      href: input.projects.length > 0 ? firstProjectHref : localizedHref("/marketplace", input.locale),
      id: "healthy-developer-loop",
      metric: labels.queue.readyMetric,
      priority: 100,
      title: input.projects.length > 0 ? labels.completeTitle : labels.queueTitles.createProject,
      tone: "ready"
    });
  }

  return items.sort((a, b) => a.priority - b.priority).slice(0, 6);
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

function hasApprovalGap(project: DeveloperProjectRecord) {
  return project.policy.state === "owner_review" || project.installs.ownerRequiredCount > 0 || project.policy.approvalRequiredCount > 0;
}

function hasSuspendedRuntime(project: DeveloperProjectRecord) {
  return project.installs.suspendedInstallCount > 0 || project.policy.state === "suspended";
}

function hasRuntimeQualityIssue(project: DeveloperProjectRecord) {
  return (
    project.runtime.blockedCount > 0 ||
    project.runtime.errorCount > 0 ||
    (project.runtime.successRate !== null && project.runtime.successRate < 0.95)
  );
}

function hasPaidRuntimeSignal(projects: DeveloperProjectRecord[]) {
  return projects.some(
    (project) => project.usage.grossCents > 0 || project.usage.billableUsageCount > 0 || project.subscriptions.activeCount > 0
  );
}

function hasBillingReadinessGap(billing: OrganizationBillingSummary, projects: DeveloperProjectRecord[]) {
  const paymentStatus = billing.summary.defaultPaymentMethodStatus;
  const paymentNeedsSetup = ["disabled", "failed", "not_configured", "pending", "requires_action"].includes(paymentStatus);
  const profileNeedsSetup = !billing.summary.profileComplete || !billing.summary.invoiceReady;

  return profileNeedsSetup || (hasPaidRuntimeSignal(projects) && paymentNeedsSetup);
}

function countWebhookSetupActions(endpoints: OrganizationWebhookEndpoint[], projects: DeveloperProjectRecord[]) {
  const activeProjectSignal = projects.some(
    (project) => project.installs.installedSkillCount > 0 || project.runtime.callCount > 0 || project.updates.count > 0
  );
  const unhealthyEndpointCount = endpoints.filter(
    (endpoint) =>
      endpoint.status !== "active" ||
      endpoint.lastDeliveryStatus === "failed" ||
      endpoint.failureCount > 0 ||
      endpoint.events.length === 0
  ).length;

  if (unhealthyEndpointCount > 0) {
    return unhealthyEndpointCount;
  }

  return activeProjectSignal && endpoints.length === 0 ? 1 : 0;
}

function isActiveDeveloperBuyerRequest(request: BuyerRequestRecord) {
  return request.status === "open" || request.status === "claimed" || request.status === "submitted";
}

function developerAnchor(anchor: string, locale: DeveloperLocale) {
  return localizedHref(`/developer#${anchor}`, locale);
}

function projectHref(project: DeveloperProjectRecord, locale: DeveloperLocale) {
  return localizedHref(`/dashboard/projects/${project.slug}`, locale);
}
