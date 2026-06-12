import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  Code2,
  FileJson,
  History,
  KeyRound,
  ListChecks,
  MessageSquareText,
  PackageCheck,
  PackageSearch,
  RadioTower,
  Route,
  ShieldCheck,
  Star,
  Terminal,
  WalletCards
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { JourneyRail } from "@/components/journey-rail";
import { PublicAccessScope } from "@/components/public-access-scope";
import { SkillInstallCommandPanel } from "@/components/skill-install-command-panel";
import { SkillAbuseReportForm } from "@/components/skill-abuse-report-form";
import { SkillFeedbackForm } from "@/components/skill-feedback-form";
import { SkillProjectActionPanel } from "@/components/skill-project-action-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { localizeText, marketplaceSkills } from "@/lib/marketplace-data";
import { getDeveloperProjects } from "@/lib/ops-data";
import { getPublicPublisherProfile, publisherSlugFromName } from "@/lib/public-publishers";
import { getPublicMarketplaceSkill, getRelatedMarketplaceSkills } from "@/lib/public-marketplace";
import { getPublicSkillActionState, getSkillAvailability, getSkillInstallState } from "@/lib/skill-install-state";
import { getSkillFeedback } from "@/lib/skill-feedback";

export const dynamic = "force-dynamic";

const developerAccessRoles = ["developer", "owner", "admin", "super_admin"];

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    anonymousReviewer: "Verified user",
    approval: "Approval state",
    averageRating: "Average rating",
    back: "Back to marketplace",
    changelog: "Changelog",
    cli: "CLI",
    cliPreview: "CLI / SDK preview",
    cliPreviewStatus: "Not published as a public copy-and-run install yet.",
    contract: "Runtime contract",
    feedback: "User feedback",
    feedbackBody: "Published feedback appears after moderated signed-in evaluations. Submitted skills are not installable until verified.",
    feedbackEmpty: "No published feedback yet.",
    feedbackProject: "Project",
    feedbackUseCase: "Use case",
    developerPacket: {
      billing: {
        free: "No subscription gate",
        per_call: "Metered usage gate",
        subscription: "Trial or subscription gate"
      },
      body:
        "This verified listing can become project state only after sign-in, with a version pin, policy gate, reveal-once runtime key, login-gated runtime test, and prelaunch billing or ledger evidence where applicable.",
      keyValue: "Reveal-once key",
      latest: "latest",
      policy: {
        detailHigh: "High-risk capabilities pause at owner approval before an agent can invoke them.",
        detailNormal: "Project policy records approval, budget, and runtime limits before agent use.",
        high: "Owner approval before runtime",
        label: "Policy gate",
        normal: "Project policy gate"
      },
      projectMissing: "Project required",
      projectReady: "Project available",
      rows: {
        contract: ["Contract pin", "Schema, permissions, and runtime stay inspectable."],
        key: ["Runtime key", "Managed from the project command center."],
        ledger: ["Runtime evidence model", "Runtime evidence can feed future invoice, audit, and paid-marketplace review."],
        project: ["Project state", "Saved or installed under one organization."],
        test: ["Login-gated runtime test", "Console tests require sign-in and use the same gateway path as agent calls."]
      },
      title: "Authenticated project path preview"
    },
    input: "Input example",
    install: "Install",
    installs: "Installs",
    lastReviewed: "Last reviewed",
    latency: "Median latency",
    mcp: "MCP",
    mcpEndpoint: "MCP endpoint",
    output: "Output example",
    overview: "Overview",
    payout: "Paid marketplace preview",
    payoutBody: "Paid usage is only modeled as prelaunch ledger state until payment capture and payout automation are enabled.",
    permissions: "Permissions",
    pricing: "Pricing",
    publishedFeedback: "Published feedback",
    publisher: "Publisher",
    publisherResponse: "Publisher response",
    publisherTrust: "Publisher trust",
    previewMetric: "Preview",
    related: "Alternatives and replacements",
    relatedBody: "Compare similar skills before adopting them into a signed-in project, or keep a safer replacement path ready for deprecated, suspended, or high-risk capabilities.",
    relatedDetails: "Open details",
    relatedReasons: "Why it matches",
    reviews: "Operator notes",
    runtime: "Runtime",
    sdk: "SDK",
    apiInspect: "API inspect",
    security: "Security review",
    success: "Success rate",
    support: "Support and operations",
    supportItems: ["Version pinning supported", "Deprecation requires advance notice", "Runtime incident reporting requires sign-in and uses verified runtime path"],
    trustLevels: {
      active: "Active",
      blocked: "Blocked",
      limited: "Limited",
      verified: "Verified"
    },
    useCases: "Use cases",
    verifiedSkills: "verified skills",
    viewPublisher: "Open publisher profile"
  },
  zh: {
    anonymousReviewer: "已验证用户",
    approval: "审核状态",
    averageRating: "平均评分",
    back: "返回市场",
    changelog: "更新日志",
    cli: "CLI",
    cliPreview: "CLI / SDK 预览",
    cliPreviewStatus: "尚未发布为公开的复制即运行安装。",
    contract: "运行时合约",
    feedback: "用户反馈",
    feedbackBody: "已发布的反馈来自经过审核的登录评估。提交的技能在验证通过前不可安装。",
    feedbackEmpty: "暂无已发布反馈。",
    feedbackProject: "项目",
    feedbackUseCase: "使用场景",
    developerPacket: {
      billing: {
        free: "无订阅门槛",
        per_call: "按调用计费门槛",
        subscription: "试用或订阅门槛"
      },
      body:
        "此已验证列表只能在登录后成为项目状态，包含版本固定、策略门槛、一次性运行密钥、需登录的运行测试，以及预发布计费或账本证据（如适用）。",
      keyValue: "一次性密钥",
      latest: "最新",
      policy: {
        detailHigh: "高风险能力在代理调用前暂停，等待所有者审批。",
        detailNormal: "项目策略在代理使用前记录审批、预算和运行限制。",
        high: "运行前需所有者审批",
        label: "策略门槛",
        normal: "项目策略门槛"
      },
      projectMissing: "需要项目",
      projectReady: "项目可用",
      rows: {
        contract: ["合约固定", "Schema、权限和运行时保持可查看。"],
        key: ["运行密钥", "从项目命令中心管理。"],
        ledger: ["运行证据模型", "运行证据可用于未来发票、审计和付费市场审核。"],
        project: ["项目状态", "保存或安装在一个组织下。"],
        test: ["需登录的运行测试", "控制台测试需要登录且使用与代理调用相同的网关路径。"]
      },
      title: "已认证项目路径预览"
    },
    input: "输入示例",
    install: "安装",
    installs: "安装量",
    lastReviewed: "最近审核",
    latency: "中位延迟",
    mcp: "MCP",
    mcpEndpoint: "MCP 端点",
    output: "输出示例",
    overview: "概览",
    payout: "付费市场预览",
    payoutBody: "付费使用仅作为预发布账本状态建模，直到支付捕获和分成自动化启用。",
    permissions: "权限",
    pricing: "定价",
    publishedFeedback: "已发布反馈",
    publisher: "发布者",
    publisherResponse: "发布者回复",
    publisherTrust: "发布者信任",
    previewMetric: "预览",
    related: "替代方案与替换",
    relatedBody: "在将类似技能采用到登录项目前进行比较，或为已弃用、暂停或高风险能力准备更安全的替换路径。",
    relatedDetails: "查看详情",
    relatedReasons: "匹配原因",
    reviews: "运营笔记",
    runtime: "运行时",
    sdk: "SDK",
    apiInspect: "API 查看",
    security: "安全审核",
    success: "成功率",
    support: "支持和运营",
    supportItems: ["支持版本固定", "废弃必须提前通知", "运行事故举报需要登录且使用已验证运行路径"],
    trustLevels: {
      active: "活跃",
      blocked: "已阻断",
      limited: "受限",
      verified: "已验证"
    },
    useCases: "使用场景",
    verifiedSkills: "已验证技能",
    viewPublisher: "打开发布者档案"
  }
} as const;

export function generateStaticParams() {
  return marketplaceSkills.map((skill) => ({ slug: skill.slug }));
}

export default async function SkillDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const [skill, projects, relatedSkills, feedbackData, session] = await Promise.all([
    getPublicMarketplaceSkill(slug),
    getDeveloperProjects(),
    getRelatedMarketplaceSkills(slug),
    getSkillFeedback(slug),
    getWorkspaceSession()
  ]);
  const labels = copy[locale];
  const hasWorkspaceSession = Boolean(session.subject);
  const roleSet = new Set([session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(Boolean));
  const hasDeveloperAccess = hasWorkspaceSession && developerAccessRoles.some((role) => roleSet.has(role));
  const developerProjects = hasDeveloperAccess ? projects : [];

  if (!skill) {
    notFound();
  }

  const publisherProfile = await getPublicPublisherProfile(publisherSlugFromName(skill.author));
  const latestVersion = skill.changelog[0]?.version;
  const skillAvailability = getSkillAvailability(skill.verification.en);
  const skillActionState = getPublicSkillActionState(skill.verification.en, hasDeveloperAccess);
  const installState = getSkillInstallState(skill.verification.en);
  const isSkillInstallable = skillActionState.canInstallNow;
  const developerAccessHref = skillActionState.canShowProjectHandoff
    ? hasDeveloperAccess
      ? "/developer"
      : hasWorkspaceSession
        ? "/account"
        : "/login"
    : "/marketplace";
  const developerAccessLabel = skillActionState.canShowProjectHandoff
    ? hasDeveloperAccess
      ? locale === "zh"
        ? "开发者工作台"
        : "Developer workspace"
      : hasWorkspaceSession
        ? locale === "zh"
          ? "检查账号角色"
          : "Check account roles"
        : locale === "zh"
          ? "登录后继续"
          : "Sign in to continue"
    : locale === "zh"
      ? "返回市场"
      : "Compare in marketplace";
  const DeveloperAccessIcon = skillActionState.canShowProjectHandoff && hasDeveloperAccess ? WalletCards : KeyRound;

  const publicInspectRows = [
    {
      label: labels.apiInspect,
      value: skill.installsCommand.cli
    }
  ];
  const installRows = [
    ...publicInspectRows,
    {
      label: labels.mcpEndpoint,
      value: skill.installsCommand.mcp
    },
    {
      copyable: false,
      label: labels.cliPreview,
      status: labels.cliPreviewStatus,
      value: skill.installsCommand.sdk
    }
  ];
  const availableCommandRows = skillActionState.canShowProjectHandoff ? installRows : publicInspectRows;

  return (
    <AppShell active="skills" locale={locale}>
      <Reveal>
      <section className="section pt-16 pb-12">
        <div className="section-inner">
          <a className="btn-text text-[#999] hover:text-white text-sm mb-4 inline-block" href={localizedHref("/marketplace", locale)}>
            {labels.back}
          </a>
          <div className="eyebrow">
            <PackageCheck size={16} aria-hidden="true" />
            <span>{localizeText(skill.category, locale)}</span>
          </div>
          <h1 className="heading-xl mt-2">{localizeText(skill.name, locale)}</h1>
          <p className="body-text text-[#999] mt-3 max-w-[720px]">{localizeText(skill.summary, locale)}</p>
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <a className="btn-primary btn-primary--large" href="#install">
              <Terminal size={18} aria-hidden="true" />
              <span>{skillActionState.sectionTitle[locale]}</span>
            </a>
            <a className="btn-secondary btn-secondary--large" href={localizedHref(developerAccessHref, locale)}>
              <DeveloperAccessIcon size={18} aria-hidden="true" />
              <span>{developerAccessLabel}</span>
            </a>
          </div>
        </div>

        <aside className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 mt-8 max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <BadgeCheck size={20} aria-hidden="true" className="text-[#10b981]" />
            <div>
              <span className="body-text-sm text-[#999]">{labels.approval}</span>
              <strong className="block text-white">{localizeText(skill.verification, locale)}</strong>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-card">
              <span className="text-[#999] text-xs">{labels.success}</span>
              <strong className="text-white">{formatMetricValue(skill.successRate, locale)}</strong>
            </div>
            <div className="stat-card">
              <span className="text-[#999] text-xs">{labels.latency}</span>
              <strong className="text-white">{formatMetricValue(skill.latency, locale)}</strong>
            </div>
            <div className="stat-card">
              <span className="text-[#999] text-xs">{labels.installs}</span>
              <strong className="text-white">{skill.installs}</strong>
            </div>
            <div className="stat-card">
              <span className="text-[#999] text-xs">{labels.runtime}</span>
              <strong className="text-white">{skill.runtime}</strong>
            </div>
          </div>
        </aside>
      </section>
      </Reveal>

      <div className="section-divider" />

      <PublicAccessScope locale={locale} />

      <JourneyRail
        actionHrefOverride={developerAccessHref}
        actionLabelOverride={developerAccessLabel}
        currentStep="skill"
        developerMode={skillActionState.canShowProjectHandoff ? "install" : "inspection"}
        journey="developer"
        locale={locale}
      />

      <div className="section-divider" />

      <section className="section py-[96px]">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="flex flex-col gap-8">
            <Reveal>
            <article className="card" id="install">
              <div className="eyebrow">
                <Terminal size={16} aria-hidden="true" />
                <span>{skillActionState.sectionTitle[locale]}</span>
              </div>
              <SkillInstallCommandPanel
                availabilityMessage={skillActionState.summary[locale]}
                billingModel={skill.billing}
                commands={availableCommandRows}
                installable={isSkillInstallable}
                installLockedReason={skillAvailability.reason[locale]}
                lastReviewed={skill.lastReviewed}
                latestVersion={latestVersion}
                locale={locale}
                projectCount={developerProjects.length}
                readinessTitle={skillActionState.readinessTitle[locale]}
                risk={skill.risk}
                runtime={skill.runtime}
                showCommands={skillActionState.canInspectPublicly}
                verificationLabel={localizeText(skill.verification, locale)}
                verificationLabelEn={skill.verification.en}
              />
              {skillActionState.canShowProjectHandoff ? (
                <>
                  <DeveloperHandoffPacket
                    billingModel={skill.billing}
                    latestVersion={latestVersion}
                    locale={locale}
                    projectCount={developerProjects.length}
                    risk={skill.risk}
                    runtime={skill.runtime}
                  />
                  <SkillProjectActionPanel
                    billingModel={skill.billing}
                    canOperate={hasDeveloperAccess && isSkillInstallable}
                    dashboardHref={localizedHref("/developer", locale)}
                    inputExample={skill.inputExample}
                    latestVersion={latestVersion}
                    locale={locale}
                    lockedBody={
                      locale === "zh"
                        ? "保存、安装、订阅和测试会写入组织项目状态，需要开发者、所有者或管理员角色。你仍然可以复制 API 查看命令并检查权限、运行时、价格和审核信号。"
                        : "Saving, installing, subscribing, and testing write project state, so they require a developer, owner, or admin role. You can still copy API inspect commands and review permissions, runtime, pricing, and review signals."
                    }
                    lockedCtaHref={localizedHref(hasWorkspaceSession ? "/account" : "/login", locale)}
                    lockedCtaLabel={
                      hasWorkspaceSession
                        ? locale === "zh"
                          ? "查看账号角色"
                          : "Check account roles"
                        : locale === "zh"
                          ? "先登录"
                          : "Sign in"
                    }
                    lockedTitle={
                      hasWorkspaceSession
                        ? locale === "zh"
                          ? "需要开发者角色"
                          : "Developer role required"
                        : locale === "zh"
                          ? "需要先登录"
                          : "Sign-in required"
                    }
                    projects={developerProjects}
                    showHandoff={skillActionState.canShowProjectHandoff}
                    skillName={localizeText(skill.name, locale)}
                    skillSlug={skill.slug}
                  />
                </>
              ) : (
                <SkillInspectionOnlyNotice locale={locale} />
              )}
            </article>
            </Reveal>

            <Reveal delay={100}>
            <article className="card">
              <div className="eyebrow">
                <BookOpenCheck size={16} aria-hidden="true" />
                <span>{labels.useCases}</span>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {skill.useCases.map((item) => (
                  <div className="flex items-start gap-2 text-[#999]" key={localizeText(item, locale)}>
                    <CheckCircle2 size={16} aria-hidden="true" className="text-[#10b981] mt-0.5 shrink-0" />
                    <span className="body-text-sm">{localizeText(item, locale)}</span>
                  </div>
                ))}
              </div>
            </article>
            </Reveal>

            <Reveal delay={200}>
            <article className="card">
              <div className="eyebrow">
                <FileJson size={16} aria-hidden="true" />
                <span>{labels.contract}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="code-block">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-xs text-[#999]">{labels.input}</span>
                    <span className="text-xs text-[#525252]">JSON</span>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code>{skill.inputExample}</code>
                  </pre>
                </div>
                <div className="code-block">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-xs text-[#999]">{labels.output}</span>
                    <span className="text-xs text-[#525252]">JSON</span>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code>{skill.outputExample}</code>
                  </pre>
                </div>
              </div>
            </article>
            </Reveal>

            <Reveal delay={300}>
            <article className="card">
              <div className="eyebrow">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.security}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {skill.securityReport.map((item) => (
                  <div className="flex flex-col gap-1" key={localizeText(item.label, locale)}>
                    <strong className="text-sm text-white">{localizeText(item.label, locale)}</strong>
                    <span className="text-sm text-[#999]">{localizeText(item.value, locale)}</span>
                  </div>
                ))}
              </div>
            </article>
            </Reveal>

            <Reveal delay={400}>
            <article className="card">
              <div className="eyebrow">
                <MessageSquareText size={16} aria-hidden="true" />
                <span>{labels.feedback}</span>
              </div>
              <p className="body-text-sm text-[#999] mt-3">{labels.feedbackBody}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="stat-card">
                  <strong className="text-white text-lg">{feedbackData.summary.averageRating ? `${feedbackData.summary.averageRating}/5` : "n/a"}</strong>
                  <span className="text-[#999] text-xs">{labels.averageRating}</span>
                </div>
                <div className="stat-card">
                  <strong className="text-white text-lg">{feedbackData.summary.publishedCount}</strong>
                  <span className="text-[#999] text-xs">{labels.publishedFeedback}</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-6">
                {feedbackData.feedback.length > 0 ? (
                  feedbackData.feedback.map((feedback) => (
                    <section className="bg-black border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4" key={feedback.id}>
                      <header className="flex items-start justify-between gap-4">
                        <div>
                          <strong className="text-white text-sm">{feedback.title}</strong>
                          <span className="block text-[#666] text-xs mt-0.5">
                            {feedback.reviewerOrganizationName ?? feedback.reviewerDisplayName ?? labels.anonymousReviewer}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-[#7fee64]" aria-label={`${feedback.rating} / 5`}>
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star
                              key={index}
                              size={15}
                              aria-hidden="true"
                              fill={index < feedback.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                      </header>
                      <p className="body-text-sm text-[#999] mt-3">{feedback.body}</p>
                      {feedback.publisherResponseBody ? (
                        <div className="mt-3 pl-3 border-l-2 border-[rgba(255,255,255,0.08)]">
                          <strong className="text-xs text-[#666]">{labels.publisherResponse}</strong>
                          <p className="body-text-sm text-[#999] mt-1">{feedback.publisherResponseBody}</p>
                          {feedback.publisherRespondedAt ? <small className="text-xs text-[#525252] mt-1 block">{formatDate(feedback.publisherRespondedAt, locale)}</small> : null}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#666]">
                        <span>
                          <strong className="text-[#999]">{labels.feedbackUseCase}</strong>{" "}
                          {feedback.useCase ?? "n/a"}
                        </span>
                        {feedback.projectSlug ? (
                          <span>
                            <strong className="text-[#999]">{labels.feedbackProject}</strong>{" "}
                            {feedback.projectSlug}
                          </span>
                        ) : null}
                      </div>
                    </section>
                  ))
                ) : (
                  <p className="body-text-sm text-[#525252]">{labels.feedbackEmpty}</p>
                )}
              </div>
            </article>
            </Reveal>

            <Reveal delay={500}>
            <SkillFeedbackForm
              canSubmit={Boolean(session.subject)}
              locale={locale}
              skillName={localizeText(skill.name, locale)}
              skillSlug={skill.slug}
            />
            </Reveal>

            <Reveal delay={600}>
            {relatedSkills.length > 0 ? (
              <article className="card">
                <div className="eyebrow">
                  <PackageSearch size={16} aria-hidden="true" />
                  <span>{labels.related}</span>
                </div>
                <p className="body-text-sm text-[#999] mt-3">{labels.relatedBody}</p>
                <div className="flex flex-col gap-4 mt-4">
                  {relatedSkills.map((suggestion) => {
                    const relatedInstallState = getSkillInstallState(suggestion.skill.verification.en);

                    return (
                      <section className="bg-black border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4" key={suggestion.skill.slug}>
                        <header className="flex items-start justify-between gap-3">
                          <div>
                            <strong className="text-white text-sm">{localizeText(suggestion.skill.name, locale)}</strong>
                            <span className="block text-[#666] text-xs mt-0.5">{localizeText(suggestion.skill.summary, locale)}</span>
                          </div>
                          <span className={`pill ${suggestion.skill.risk === "high" ? "pill--danger" : suggestion.skill.risk === "medium" ? "pill--warning" : "pill--success"}`}>{suggestion.skill.risk}</span>
                        </header>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="pill pill--neutral">{localizeText(suggestion.skill.category, locale)}</span>
                          <span className="pill pill--neutral">{suggestion.skill.runtime}</span>
                          <span className="pill pill--neutral">{suggestion.skill.price[locale]}</span>
                          <span className="pill pill--neutral">{localizeText(suggestion.skill.verification, locale)}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3" aria-label={labels.relatedReasons}>
                          {suggestion.reasons[locale].map((reason) => (
                            <span className="flex items-center gap-1 text-xs text-[#10b981]" key={reason}>
                              <BadgeCheck size={13} aria-hidden="true" />
                              {reason}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.08)]">
                          <code className="text-xs text-[#999] truncate">{relatedInstallState.installable ? suggestion.skill.installsCommand.cli : relatedInstallState.reason[locale]}</code>
                          <a className="btn-secondary shrink-0 text-xs" href={localizedHref(`/skills/${suggestion.skill.slug}`, locale)}>
                            <ShieldCheck size={15} aria-hidden="true" />
                            <span>{labels.relatedDetails}</span>
                          </a>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </article>
            ) : null}

            <SkillAbuseReportForm
              canSubmit={Boolean(session.subject)}
              locale={locale}
              skillName={localizeText(skill.name, locale)}
              skillSlug={skill.slug}
            />
            </Reveal>
          </div>

          <Reveal delay={100}>
          <aside className="flex flex-col gap-6">
            <section className="card">
              <div className="eyebrow">
                <Building2 size={16} aria-hidden="true" />
                <span>{labels.publisher}</span>
              </div>
              <div className="mt-4">
                <strong className="text-white block">{publisherProfile?.displayName ?? skill.author}</strong>
                <span className="text-xs text-[#666] block mt-1">{labels.publisherTrust}</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {publisherProfile ? <span className={`pill ${publisherProfile.trustLevel === "verified" ? "pill--success" : publisherProfile.trustLevel === "blocked" ? "pill--danger" : publisherProfile.trustLevel === "limited" ? "pill--warning" : "pill--neutral"}`}>{labels.trustLevels[publisherProfile.trustLevel]}</span> : null}
                  {publisherProfile ? <span className="pill pill--neutral">{publisherProfile.metrics.verifiedSkillCount} {labels.verifiedSkills}</span> : null}
                </div>
                {publisherProfile ? (
                  <a className="btn-text text-sm mt-3 inline-flex items-center gap-1.5" href={localizedHref(`/publishers/${publisherProfile.slug}`, locale)}>
                    <Building2 size={15} aria-hidden="true" />
                    <span>{labels.viewPublisher}</span>
                  </a>
                ) : null}
              </div>
            </section>

            <section className="card">
              <div className="eyebrow">
                <WalletCards size={16} aria-hidden="true" />
                <span>{labels.pricing}</span>
              </div>
              <div className="mt-4">
                <strong className="text-white text-lg block">{skill.price[locale]}</strong>
                <span className="text-sm text-[#999] block mt-1">{pricingPreviewBody(skill.billing, skillAvailability.kind, locale)}</span>
              </div>
            </section>

            <section className="card">
              <div className="eyebrow">
                <KeyRound size={16} aria-hidden="true" />
                <span>{labels.permissions}</span>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {skill.permissions.map((permission) => (
                  <div className="flex flex-col gap-0.5" key={permission.key}>
                    <strong className="text-sm text-white">{localizeText(permission.label, locale)}</strong>
                    <span className="text-xs text-[#999]">{localizeText(permission.value, locale)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="eyebrow">
                <History size={16} aria-hidden="true" />
                <span>{labels.changelog}</span>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {skill.changelog.map((item) => (
                  <div className="flex flex-col gap-0.5" key={item.version}>
                    <strong className="text-sm text-white">{item.version}</strong>
                    <span className="text-xs text-[#999]">{localizeText(item.note, locale)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="eyebrow">
                <Star size={16} aria-hidden="true" />
                <span>{labels.reviews}</span>
              </div>
              {skill.reviews.map((review) => (
                <blockquote className="mt-4 pl-3 border-l-2 border-[rgba(255,255,255,0.08)]" key={review.author}>
                  <p className="body-text-sm text-[#999] italic">{localizeText(review.quote, locale)}</p>
                  <cite className="block text-xs text-[#525252] mt-1 not-italic">{review.author}</cite>
                </blockquote>
              ))}
            </section>

            <section className="card">
              <div className="eyebrow">
                <Code2 size={16} aria-hidden="true" />
                <span>{labels.support}</span>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {labels.supportItems.map((item) => (
                  <span className="body-text-sm text-[#999]" key={item}>{item}</span>
                ))}
              </div>
            </section>
          </aside>
          </Reveal>
        </div>
      </section>
    </AppShell>
  );
}

function DeveloperHandoffPacket({
  billingModel,
  latestVersion,
  locale,
  projectCount,
  risk,
  runtime
}: {
  billingModel: "free" | "per_call" | "subscription";
  latestVersion?: string;
  locale: "en" | "zh";
  projectCount: number;
  risk: "high" | "low" | "medium";
  runtime: "HTTP" | "Local" | "MCP";
}) {
  const labels = copy[locale].developerPacket;
  const rows = [
    {
      detail: labels.rows.contract[1],
      icon: <PackageCheck size={15} aria-hidden="true" />,
      label: labels.rows.contract[0],
      value: `${latestVersion ?? labels.latest} / ${runtime}`
    },
    {
      detail: labels.rows.project[1],
      icon: <Route size={15} aria-hidden="true" />,
      label: labels.rows.project[0],
      tone: projectCount > 0 ? "ready" : "warning",
      value: projectCount > 0 ? `${projectCount} · ${labels.projectReady}` : labels.projectMissing
    },
    {
      detail: risk === "high" ? labels.policy.detailHigh : labels.policy.detailNormal,
      icon: <ShieldCheck size={15} aria-hidden="true" />,
      label: labels.policy.label,
      tone: risk === "high" ? "warning" : "ready",
      value: risk === "high" ? labels.policy.high : labels.policy.normal
    },
    {
      detail: labels.rows.key[1],
      icon: <KeyRound size={15} aria-hidden="true" />,
      label: labels.rows.key[0],
      value: labels.keyValue
    },
    {
      detail: labels.rows.test[1],
      icon: <RadioTower size={15} aria-hidden="true" />,
      label: labels.rows.test[0],
      value: labels.billing[billingModel]
    },
    {
      detail: labels.rows.ledger[1],
      icon: <ListChecks size={15} aria-hidden="true" />,
      label: labels.rows.ledger[0],
      value: billingModel
    }
  ];

  return (
    <div className="mt-6 border border-[rgba(255,255,255,0.08)] rounded-[12px] overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
        <strong className="text-white text-sm block">{labels.title}</strong>
        <p className="body-text-sm text-[#999] mt-1">{labels.body}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[rgba(255,255,255,0.08)]">
        {rows.map((row) => (
          <div className="bg-[#212121] p-4 flex flex-col gap-1" key={row.label}>
            <span className="text-[#7fee64]">{row.icon}</span>
            <span className={`pill ${row.tone === "warning" ? "pill--warning" : "pill--success"} w-fit`}>{row.label}</span>
            <strong className="text-white text-sm">{row.value}</strong>
            <small className="text-xs text-[#525252]">{row.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillInspectionOnlyNotice({ locale }: { locale: Locale }) {
  return (
    <div className="mt-4 p-4 border border-[rgba(255,255,255,0.08)] rounded-[12px] flex flex-col gap-2">
      <ShieldCheck size={18} aria-hidden="true" className="text-[#999]" />
      <strong className="text-white text-sm">{locale === "zh" ? "仅可查看" : "Inspection only"}</strong>
      <p className="body-text-sm text-[#999]">
        {locale === "zh"
          ? "该技能已提交但尚未通过验证审核。你可以查看 manifest、schema、权限、发布者和审核状态；项目采用、运行测试、订阅、计费和账本动作只会在 verified 审核通过后开放。"
          : "This skill is submitted but not verified yet. You can inspect its manifest, schemas, permissions, publisher, and review state. Project adoption, runtime test, subscription, billing, and ledger actions unlock only after verified approval."}
      </p>
    </div>
  );
}

function pricingPreviewBody(
  billingModel: "free" | "per_call" | "subscription",
  availabilityKind: "callable" | "inspection_only",
  locale: Locale,
) {
  if (availabilityKind === "inspection_only") {
    return locale === "zh"
      ? "仅可查看。价格、项目采用、运行、计费和账本动作只会在 verified 审核通过后开放。"
      : "Inspection only. Pricing, project adoption, runtime, billing, and ledger actions unlock only after verified approval.";
  }

  if (billingModel === "free") {
    return locale === "zh"
      ? "付费市场计费仍处于预发布阶段。免费技能可公开查看；运行调用仍需要登录后的项目 Key。"
      : "Paid marketplace billing is prelaunch. Free skills may be inspected publicly; runtime use still requires a signed-in project key.";
  }

  return locale === "zh"
      ? "付费市场计费仍处于预发布阶段。当前价格用于展示付费市场意图；真实运行仍需要登录后的项目 Key 和策略检查。"
    : "Paid marketplace billing is prelaunch. The current price describes paid-marketplace intent; real runtime use still requires a signed-in project key and policy checks.";
}

function formatMetricValue(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

  if (value === "preview") {
    return copy[locale].previewMetric;
  }

  return value;
}

function formatDate(value: string, locale: "en" | "zh") {
  if (value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function publisherTrustClass(trustLevel: "verified" | "active" | "limited" | "blocked") {
  if (trustLevel === "verified") {
    return "pill pill--success";
  }

  if (trustLevel === "blocked") {
    return "pill pill--danger";
  }

  if (trustLevel === "limited") {
    return "pill pill--warning";
  }

  return "pill pill--neutral";
}