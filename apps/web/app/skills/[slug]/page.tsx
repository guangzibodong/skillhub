import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
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
import { getLocaleFromSearchParams, hrefWithReturnTo, localizedHref, localizedHrefWithReturnTo, type Locale } from "@/lib/i18n";
import { localizeText, type MarketplaceSkill } from "@/lib/marketplace-data";
import { getDeveloperProjects } from "@/lib/ops-data";
import { getPublicPublisherProfile, publisherSlugFromName } from "@/lib/public-publishers";
import { getPublicMarketplaceSkill, getRelatedMarketplaceSkills } from "@/lib/public-marketplace";
import { getPublicSkillActionState, getSkillAvailability, getSkillInstallState } from "@/lib/skill-install-state";
import { getSkillFeedback } from "@/lib/skill-feedback";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const developerAccessRoles = ["developer", "owner", "admin", "super_admin"];

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const locale = getLocaleFromSearchParams(search);
  const skill = await getPublicMarketplaceSkill(slug);

  if (!skill) {
    return buildLocalizedMetadata({
      locale,
      path: `/skills/${slug}`,
      noIndex: true,
      en: {
        title: "Skill not found - SkillHub",
        description: "This SkillHub skill listing is not currently available."
      },
      zh: {
        title: "技能不存在 - SkillHub",
        description: "当前 SkillHub 技能详情暂不可用。"
      }
    });
  }

  const name = localizeText(skill.name, locale);
  const summary = localizeText(skill.summary, locale);

  return buildLocalizedMetadata({
    locale,
    path: `/skills/${skill.slug}`,
    en: {
      title: `${skill.name.en} - SkillHub Skill`,
      description: skill.summary.en
    },
    zh: {
      title: `${name} - SkillHub 技能`,
      description: summary
    },
    type: "article"
  });
}

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
        per_call: "Pro access gate",
        subscription: "Included in Pro"
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
    metricUnavailable: "Unlocks after verified approval",
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
        per_call: "Pro 访问门槛",
        subscription: "高级 Pro 访问门槛"
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
    metricUnavailable: "验证通过后开放",
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
    previewMetric: "预览中",
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
  const showProductionMetrics = skillActionState.canShowProjectHandoff;
  const skillReturnTo = `/skills/${skill.slug}`;
  const skillLoginHref = localizedHrefWithReturnTo("/login", locale, skillReturnTo);
  const developerAccessHref = skillActionState.canShowProjectHandoff
    ? hasDeveloperAccess
      ? "/developer"
      : hasWorkspaceSession
        ? "/account"
        : hrefWithReturnTo("/login", skillReturnTo, locale)
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
  const decisionCards = getSkillDecisionCards({
    billingModel: skill.billing,
    developerAccessHref,
    developerAccessLabel,
    hasDeveloperAccess,
    hasWorkspaceSession,
    locale,
    projectCount: developerProjects.length,
    risk: skill.risk,
    skillActionState,
    skillAvailability,
  });
  const adoptionProfile = getSkillAdoptionProfile({
    developerAccessHref,
    developerAccessLabel,
    locale,
    skill,
    skillActionState,
    skillAvailability,
  });

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

        <aside className="skill-detail-status-card bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] mt-8">
          <div className="flex items-center gap-3 mb-4">
            <BadgeCheck size={20} aria-hidden="true" className="text-[#10b981]" />
            <div>
              <span className="body-text-sm text-[#999]">{labels.approval}</span>
              <strong className="block text-white">{localizeText(skill.verification, locale)}</strong>
            </div>
          </div>
          {showProductionMetrics ? (
            <div className="skill-detail-status-card__grid grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          ) : (
            <div className="skill-detail-status-card__grid grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="stat-card">
                <span className="text-[#999] text-xs">{labels.runtime}</span>
                <strong className="text-white">{skill.runtime}</strong>
              </div>
              <div className="stat-card">
                <span className="text-[#999] text-xs">{labels.previewMetric}</span>
                <strong className="text-white">{labels.metricUnavailable}</strong>
              </div>
            </div>
          )}
        </aside>

        <div className="section-inner grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {decisionCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="card flex flex-col gap-3 h-full" key={card.title}>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-[8px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center">
                    <Icon size={18} aria-hidden="true" className="text-[#7fee64]" />
                  </div>
                  <span className={`pill ${card.tone}`}>{card.badge}</span>
                </div>
                <div>
                  <span className="text-xs text-[#666]">{card.title}</span>
                  <strong className="block text-white text-base mt-1">{card.value}</strong>
                </div>
                <p className="body-text-sm text-[#999]">{card.body}</p>
                {card.href ? (
                  <a className="btn-secondary inline-flex items-center justify-center gap-2 mt-auto" href={card.href}>
                    <span>{card.action}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="section-inner mt-5">
          <section className="skill-adoption-panel" aria-labelledby="skill-adoption-title">
            <div className="skill-adoption-panel__head">
              <div>
                <span className="skill-adoption-panel__eyebrow">
                  <BookOpenCheck size={15} aria-hidden="true" />
                  {adoptionProfile.kicker}
                </span>
                <h2 id="skill-adoption-title">{adoptionProfile.title}</h2>
                <p>{adoptionProfile.body}</p>
              </div>
              <a className="btn-secondary skill-adoption-panel__action" href={adoptionProfile.actionHref}>
                <span>{adoptionProfile.actionLabel}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>

            <div className="skill-adoption-grid">
              {adoptionProfile.items.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="skill-adoption-item" key={item.label}>
                    <span className="skill-adoption-item__icon">
                      <Icon size={17} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.body}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
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
                    lockedCtaHref={hasWorkspaceSession ? localizedHref("/account", locale) : localizedHrefWithReturnTo("/login", locale, skillReturnTo)}
                    lockedCtaLabel={
                      hasWorkspaceSession
                        ? locale === "zh"
                          ? "查看账号权限"
                          : "Check account access"
                        : locale === "zh"
                          ? "先登录"
                          : "Sign in"
                    }
                    lockedTitle={
                      hasWorkspaceSession
                        ? locale === "zh"
                          ? "需要开发权限"
                          : "Developer access required"
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
                  <strong className="text-white text-lg">{formatFeedbackRating(feedbackData.summary.averageRating, locale)}</strong>
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
                          {feedback.useCase ?? formatMissingValue(locale)}
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
              loginHref={skillLoginHref}
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
                          <span className={`pill ${suggestion.skill.risk === "high" ? "pill--danger" : suggestion.skill.risk === "medium" ? "pill--warning" : "pill--success"}`}>{formatRiskLabel(suggestion.skill.risk, locale)}</span>
                        </header>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="pill pill--neutral">{localizeText(suggestion.skill.category, locale)}</span>
                          <span className="pill pill--neutral">{suggestion.skill.runtime}</span>
                          <span className="pill pill--neutral">{formatPublicSkillPrice(suggestion.skill.billing, locale)}</span>
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
              loginHref={skillLoginHref}
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
                <strong className="text-white text-lg block">{showProductionMetrics ? formatPublicSkillPrice(skill.billing, locale) : labels.metricUnavailable}</strong>
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
    <div
      className="mt-6 border border-[rgba(255,255,255,0.08)] rounded-[12px] overflow-hidden"
      data-testid="skill-developer-handoff-packet"
    >
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

function getSkillAdoptionProfile({
  developerAccessHref,
  developerAccessLabel,
  locale,
  skill,
  skillActionState,
  skillAvailability,
}: {
  developerAccessHref: string;
  developerAccessLabel: string;
  locale: Locale;
  skill: MarketplaceSkill;
  skillActionState: ReturnType<typeof getPublicSkillActionState>;
  skillAvailability: ReturnType<typeof getSkillAvailability>;
}) {
  const firstUseCase = skill.useCases[0] ? localizeText(skill.useCases[0], locale) : "";
  const isInspectionOnly = skillAvailability.kind === "inspection_only";
  const labels = {
    en: {
      accessPlan: "Access plan",
      bestFor: "Best for",
      expectedOutput: "Expected output",
      preparation: "Prepare before use",
      publicInspection: "Public inspection",
      title: "Adoption decision",
      verifiedRuntime: "Verified runtime path",
    },
    zh: {
      accessPlan: "可用套餐",
      bestFor: "适合对象",
      expectedOutput: "产出结果",
      preparation: "使用前准备",
      publicInspection: "公开检查",
      title: "采用决策",
      verifiedRuntime: "已验证运行路径",
    },
  } satisfies Record<Locale, Record<string, string>>;

  return {
    actionHref: skillActionState.canShowProjectHandoff ? localizedHref(developerAccessHref, locale) : "#install",
    actionLabel: skillActionState.canShowProjectHandoff
      ? developerAccessLabel
      : locale === "zh"
        ? "查看公开说明"
        : "Inspect public details",
    body: isInspectionOnly
      ? locale === "zh"
        ? "这个技能目前只适合做公开评估和替代方案比较，暂时不要接入真实项目。"
        : "Use this listing for public evaluation and replacement comparison only until verification is complete."
      : locale === "zh"
        ? "先判断业务场景、套餐边界和接入准备，再进入项目安装或运行测试。"
        : "Check the business fit, plan boundary, and setup requirements before installing or testing in a project.",
    items: [
      {
        body: pricingPreviewBody(skill.billing, skillAvailability.kind, locale),
        icon: WalletCards,
        label: labels[locale].accessPlan,
        value: isInspectionOnly ? skillAvailability.label[locale] : formatBillingModelLabel(skill.billing, locale),
      },
      {
        body: getCategoryBuyerFitBody(skill.categoryKey, locale),
        icon: MessageSquareText,
        label: labels[locale].bestFor,
        value: getCategoryBuyerFitTitle(skill.categoryKey, locale),
      },
      {
        body: firstUseCase || getCategoryOutcomeBody(skill.categoryKey, locale),
        icon: FileJson,
        label: labels[locale].expectedOutput,
        value: getCategoryOutcomeTitle(skill.categoryKey, locale),
      },
      {
        body: getSkillPreparationBody(skill, locale, skillAvailability.kind),
        icon: ListChecks,
        label: labels[locale].preparation,
        value: getSkillPreparationTitle(skill, locale, skillAvailability.kind),
      },
    ],
    kicker: isInspectionOnly ? labels[locale].publicInspection : labels[locale].verifiedRuntime,
    title: labels[locale].title,
  };
}

function getCategoryBuyerFitTitle(
  categoryKey: MarketplaceSkill["categoryKey"],
  locale: Locale,
) {
  const labels = {
    en: {
      automation: "Ops teams automating repeat work",
      content: "Content, growth, and product marketing",
      data: "Data operators and spreadsheet owners",
      dev: "API, platform, and engineering teams",
      ecommerce: "E-commerce and marketplace operators",
      education: "Training, enablement, and course teams",
      finance: "Finance and back-office operators",
      hr: "Recruiting and people teams",
      legal: "Legal, compliance, and policy teams",
      marketing: "Performance marketing teams",
      ops: "Support and operations teams",
      research: "Research and analyst teams",
      sales: "Sales and CRM operators",
      security: "Security and risk teams",
      seo: "SEO, GEO, and content operators",
      ui: "Product, design, and frontend teams",
    },
    zh: {
      automation: "流程自动化和运营团队",
      content: "内容、增长和产品营销团队",
      data: "数据运营和表格负责人",
      dev: "API、平台和工程团队",
      ecommerce: "电商和平台运营团队",
      education: "培训、课程和内部赋能团队",
      finance: "财务和后台运营团队",
      hr: "招聘和人力团队",
      legal: "法务、合规和政策团队",
      marketing: "投放和增长营销团队",
      ops: "客服和业务运营团队",
      research: "调研和分析团队",
      sales: "销售和 CRM 运营团队",
      security: "安全、风控和审核团队",
      seo: "SEO、GEO 和内容运营团队",
      ui: "产品、设计和前端团队",
    },
  } satisfies Record<Locale, Record<MarketplaceSkill["categoryKey"], string>>;

  return labels[locale][categoryKey];
}

function getCategoryBuyerFitBody(
  categoryKey: MarketplaceSkill["categoryKey"],
  locale: Locale,
) {
  const labels = {
    en: {
      automation: "Best when the same judgment or routing step repeats across many tasks.",
      content: "Use when draft quality, positioning, tone, and conversion clarity matter.",
      data: "Use when messy operational data needs a repeatable cleanup or audit path.",
      dev: "Use before agents touch APIs, manifests, webhooks, contracts, or releases.",
      ecommerce: "Use for catalog, listing, pricing, inventory, and promotion workflows.",
      education: "Use to turn materials into structured learning or enablement assets.",
      finance: "Use when back-office teams need extracted, checked, or routed financial data.",
      hr: "Use where recruiting or people workflows need consistent screening and summaries.",
      legal: "Use for review support, policy checks, and structured compliance summaries.",
      marketing: "Use when campaigns need repeatable checks, briefs, and performance actions.",
      ops: "Use when support queues, knowledge bases, and internal operations need faster triage.",
      research: "Use when evidence gathering, source review, or browser research must stay structured.",
      sales: "Use when pipeline records, outreach, and account notes need sharper next actions.",
      security: "Use when agent actions must be gated, reviewed, or risk-scored before execution.",
      seo: "Use when pages need search intent, citation readiness, and crawlability checks.",
      ui: "Use before release to catch hierarchy, layout, accessibility, and mobile issues.",
    },
    zh: {
      automation: "适合把重复判断、分派、整理步骤变成稳定流程。",
      content: "适合提升草稿质量、定位表达、语气和转化清晰度。",
      data: "适合把混乱运营数据变成可复用的清洗和检查流程。",
      dev: "适合在智能体触碰 API、manifest、Webhook、合约或发布前检查。",
      ecommerce: "适合商品、Listing、价格、库存和促销运营场景。",
      education: "适合把资料整理成结构化课程、培训或内部赋能内容。",
      finance: "适合财务和后台团队提取、核对、分派财务数据。",
      hr: "适合招聘和人力流程中的筛选、总结和一致性判断。",
      legal: "适合法务审核支持、政策检查和合规摘要整理。",
      marketing: "适合广告投放、营销简报、素材检查和效果动作生成。",
      ops: "适合客服队列、知识库回答和内部运营分派提效。",
      research: "适合证据搜集、来源核验和浏览器调研要结构化输出的场景。",
      sales: "适合销售线索、CRM 记录、外联和客户下一步动作整理。",
      security: "适合智能体执行前的风险评分、拦截和审核。",
      seo: "适合检查搜索意图、AI 答案可见性、引用准备和收录问题。",
      ui: "适合上线前检查层级、排版、可访问性和移动端问题。",
    },
  } satisfies Record<Locale, Record<MarketplaceSkill["categoryKey"], string>>;

  return labels[locale][categoryKey];
}

function getCategoryOutcomeTitle(
  categoryKey: MarketplaceSkill["categoryKey"],
  locale: Locale,
) {
  const labels = {
    en: {
      automation: "Workflow decision or routed task",
      content: "Publishable brief, copy, or rewrite",
      data: "Cleaned records and repair plan",
      dev: "Contract check and release notes",
      ecommerce: "Listing, catalog, or promotion actions",
      education: "Structured lesson or enablement asset",
      finance: "Extracted fields and approval hints",
      hr: "Screening summary and next step",
      legal: "Review summary and risk notes",
      marketing: "Campaign brief and optimization actions",
      ops: "Triage result and support answer",
      research: "Evidence summary and source list",
      sales: "Account summary and next action",
      security: "Allow, review, or block decision",
      seo: "Prioritized SEO/GEO repair list",
      ui: "Prioritized UX repair notes",
    },
    zh: {
      automation: "流程判断或分派结果",
      content: "可发布简报、文案或改写稿",
      data: "清洗结果和修复计划",
      dev: "合约检查和发布建议",
      ecommerce: "Listing、商品或促销动作",
      education: "结构化课程或培训材料",
      finance: "字段提取和审批提示",
      hr: "筛选摘要和下一步建议",
      legal: "审核摘要和风险提示",
      marketing: "营销简报和优化动作",
      ops: "分派结果和客服回答",
      research: "证据摘要和来源列表",
      sales: "客户摘要和下一步动作",
      security: "允许、复核或阻断决策",
      seo: "有优先级的 SEO/GEO 修复清单",
      ui: "有优先级的体验修复建议",
    },
  } satisfies Record<Locale, Record<MarketplaceSkill["categoryKey"], string>>;

  return labels[locale][categoryKey];
}

function getCategoryOutcomeBody(
  categoryKey: MarketplaceSkill["categoryKey"],
  locale: Locale,
) {
  return locale === "zh"
    ? `${getCategoryOutcomeTitle(categoryKey, locale)}，并保留输入、权限和运行边界，方便运营或开发团队复核。`
    : `${getCategoryOutcomeTitle(categoryKey, locale)}, with input, permission, and runtime boundaries kept reviewable for operators or developers.`;
}

function getSkillPreparationTitle(
  skill: MarketplaceSkill,
  locale: Locale,
  availabilityKind: ReturnType<typeof getSkillAvailability>["kind"],
) {
  if (availabilityKind === "inspection_only") {
    return locale === "zh" ? "等待验证后再接入" : "Wait for verification";
  }

  if (skill.risk === "high") {
    return locale === "zh" ? "先准备审批和权限" : "Prepare approval and policy";
  }

  if (skill.runtime === "Local") {
    return locale === "zh" ? "准备本地文件或项目上下文" : "Prepare local files or project context";
  }

  if (skill.runtime === "MCP") {
    return locale === "zh" ? "准备 MCP 连接和项目 Key" : "Prepare MCP connection and project key";
  }

  return locale === "zh" ? "准备输入和项目 Key" : "Prepare input and project key";
}

function getSkillPreparationBody(
  skill: MarketplaceSkill,
  locale: Locale,
  availabilityKind: ReturnType<typeof getSkillAvailability>["kind"],
) {
  if (availabilityKind === "inspection_only") {
    return locale === "zh"
      ? "先查看 schema、权限、发布者和审核状态；验证通过前不要接入生产流程。"
      : "Inspect schema, permissions, publisher, and review state first; do not connect it to production before approval.";
  }

  const permissionSummary = skill.permissions
    .slice(0, 2)
    .map((permission) => localizeText(permission.label, locale))
    .join(locale === "zh" ? "、" : ", ");

  if (skill.risk === "high") {
    return locale === "zh"
      ? `高风险技能需要负责人审批、项目策略和预算边界；重点确认${permissionSummary || "权限范围"}。`
      : `High-risk skills require owner approval, project policy, and budget limits; review ${permissionSummary || "permissions"} first.`;
  }

  if (skill.billing === "free") {
    return locale === "zh"
      ? `准备示例输入和项目 Key；基础免费，但运行仍会经过${permissionSummary || "权限"}检查。`
      : `Prepare sample input and a project key; the skill is free basics, but runtime still checks ${permissionSummary || "permissions"}.`;
  }

  return locale === "zh"
    ? `确认 Pro 计划、项目 Key 和${permissionSummary || "权限范围"}，再进入运行测试。`
    : `Confirm Pro access, project key, and ${permissionSummary || "permission scope"} before runtime testing.`;
}

function getSkillDecisionCards({
  billingModel,
  developerAccessHref,
  developerAccessLabel,
  hasDeveloperAccess,
  hasWorkspaceSession,
  locale,
  projectCount,
  risk,
  skillActionState,
  skillAvailability,
}: {
  billingModel: "free" | "per_call" | "subscription";
  developerAccessHref: string;
  developerAccessLabel: string;
  hasDeveloperAccess: boolean;
  hasWorkspaceSession: boolean;
  locale: Locale;
  projectCount: number;
  risk: "high" | "low" | "medium";
  skillActionState: ReturnType<typeof getPublicSkillActionState>;
  skillAvailability: ReturnType<typeof getSkillAvailability>;
}) {
  const availabilityTone =
    skillActionState.kind === "authenticated_install"
      ? "pill--success"
      : skillActionState.kind === "verified_gated"
        ? "pill--warning"
        : "pill--neutral";
  const nextStepBody = getSkillNextStepBody({
    hasDeveloperAccess,
    hasWorkspaceSession,
    locale,
    projectCount,
    skillActionState,
  });

  return [
    {
      action: locale === "zh" ? "查看运行说明" : "View runtime details",
      badge: skillAvailability.label[locale],
      body: skillActionState.summary[locale],
      href: "#install",
      icon: ShieldCheck,
      title: locale === "zh" ? "当前可用性" : "Current availability",
      tone: availabilityTone,
      value: skillActionState.sectionTitle[locale],
    },
    {
      action: developerAccessLabel,
      badge: hasDeveloperAccess
        ? locale === "zh"
          ? "已具备权限"
          : "Access ready"
        : locale === "zh"
          ? "需要确认"
          : "Needs access",
      body: nextStepBody,
      href: localizedHref(developerAccessHref, locale),
      icon: KeyRound,
      title: locale === "zh" ? "建议下一步" : "Recommended next step",
      tone: hasDeveloperAccess ? "pill--success" : "pill--warning",
      value: developerAccessLabel,
    },
    {
      action: "",
      badge: locale === "zh" ? "受治理" : "Governed",
      body: pricingPreviewBody(billingModel, skillAvailability.kind, locale),
      href: "",
      icon: WalletCards,
      title: locale === "zh" ? "风险与计费边界" : "Risk and billing boundary",
      tone: risk === "high" ? "pill--danger" : risk === "medium" ? "pill--warning" : "pill--success",
      value: `${formatRiskLabel(risk, locale)} / ${formatBillingModelLabel(billingModel, locale)}`,
    },
  ];
}

function getSkillNextStepBody({
  hasDeveloperAccess,
  hasWorkspaceSession,
  locale,
  projectCount,
  skillActionState,
}: {
  hasDeveloperAccess: boolean;
  hasWorkspaceSession: boolean;
  locale: Locale;
  projectCount: number;
  skillActionState: ReturnType<typeof getPublicSkillActionState>;
}) {
  if (skillActionState.kind === "inspection_only") {
    return locale === "zh"
      ? "先检查 manifest、权限、发布者和审核状态。该技能通过验证前，不要把它接入真实项目。"
      : "Inspect manifest, permissions, publisher, and review state first. Do not adopt it into a real project before verified approval.";
  }

  if (hasDeveloperAccess) {
    return locale === "zh"
      ? `当前账号可以进入开发者工作台。可用项目数：${projectCount}；采用前仍需确认项目策略、版本固定和 Project Key。`
      : `This account can open the developer workspace. Available projects: ${projectCount}; confirm policy, version pinning, and Project Key before adoption.`;
  }

  if (hasWorkspaceSession) {
    return locale === "zh"
      ? "当前账号已登录，但需要确认 developer、owner 或 admin 权限后才能安装和运行测试。"
      : "You are signed in, but developer, owner, or admin access is required before install and runtime testing.";
  }

  return locale === "zh"
    ? "该技能已验证，可公开检查；要保存、安装或运行测试，需要先登录并进入项目。"
    : "This verified skill can be inspected publicly; saving, installing, or runtime testing requires sign-in and a project.";
}

function formatBillingModelLabel(
  billingModel: "free" | "per_call" | "subscription",
  locale: Locale,
) {
  const labels = {
    en: {
      free: "Free basics",
      per_call: "Included in Pro",
      subscription: "Included in Pro",
    },
    zh: {
      free: "基础免费",
      per_call: "Pro 全量计划内",
      subscription: "Pro 全量计划内",
    },
  } satisfies Record<Locale, Record<"free" | "per_call" | "subscription", string>>;

  return labels[locale][billingModel];
}

function formatPublicSkillPrice(
  billingModel: "free" | "per_call" | "subscription",
  locale: Locale,
) {
  if (billingModel === "free") {
    return locale === "zh" ? "基础免费" : "Free basics";
  }

  return locale === "zh" ? "Pro 全量计划内" : "Included in Pro";
}

function SkillInspectionOnlyNotice({ locale }: { locale: Locale }) {
  return (
    <div className="mt-4 p-4 border border-[rgba(255,255,255,0.08)] rounded-[12px] flex flex-col gap-2">
      <ShieldCheck size={18} aria-hidden="true" className="text-[#999]" />
      <strong className="text-white text-sm">{locale === "zh" ? "仅可查看" : "Inspection only"}</strong>
      <p className="body-text-sm text-[#999]">
        {locale === "zh"
          ? "该技能已提交但尚未通过验证审核。你可以查看 manifest、schema、权限、发布者和审核状态；项目接入、执行、订阅、计费和财务操作会在验证审核通过后才开放。"
          : "This skill is submitted but not verified yet. You can inspect its manifest, schemas, permissions, publisher, and review state. Project use, execution, subscription, billing, and financial operations stay unavailable until verified approval."}
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
      ? "仅可查看。价格、项目接入、执行、计费和财务操作会在验证审核通过后才开放。"
      : "Inspection only. Pricing, project use, execution, billing, and financial operations stay unavailable until verified approval.";
  }

  if (billingModel === "free") {
    return locale === "zh"
      ? "基础免费技能可公开查看；真实运行仍需要登录后的项目 Key 和项目策略检查。"
      : "Free basic skills may be inspected publicly; runtime use still requires a signed-in project key and project policy checks.";
  }

  return locale === "zh"
    ? "该技能包含在 Pro 全量计划中；真实运行仍需要登录后的项目 Key、项目策略和权限检查。"
    : "This skill is included in Pro access; runtime use still requires a signed-in project key, project policy, and permission checks.";
}

function formatMetricValue(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return formatMissingValue(locale);
  }

  if (value === "preview") {
    return copy[locale].previewMetric;
  }

  if (
    value.toLowerCase() === "n/a" ||
    value.toLowerCase() === "unknown" ||
    value.toLowerCase() === "review"
  ) {
    return formatMissingValue(locale);
  }

  return value;
}

function formatFeedbackRating(
  value: number | null | undefined,
  locale: Locale,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}/5`
    : locale === "zh"
      ? "暂无评分"
      : "No rating yet";
}

function formatMissingValue(locale: Locale) {
  return locale === "zh" ? "暂无数据" : "n/a";
}

function formatRiskLabel(risk: "high" | "low" | "medium", locale: Locale) {
  const labels = {
    en: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk",
    },
    zh: {
      high: "高风险",
      low: "低风险",
      medium: "中风险",
    },
  } satisfies Record<Locale, Record<"high" | "low" | "medium", string>>;

  return labels[locale][risk];
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
