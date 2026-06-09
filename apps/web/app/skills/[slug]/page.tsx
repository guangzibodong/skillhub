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
import { JourneyRail } from "@/components/journey-rail";
import { PublicAccessScope } from "@/components/public-access-scope";
import { SiteHeader } from "@/components/site-header";
import { SkillInstallCommandPanel } from "@/components/skill-install-command-panel";
import { SkillAbuseReportForm } from "@/components/skill-abuse-report-form";
import { SkillFeedbackForm } from "@/components/skill-feedback-form";
import { SkillProjectActionPanel } from "@/components/skill-project-action-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getDictionary, getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
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
    payout: "Publisher payout",
    payoutBody: "Paid usage is converted into immutable transaction splits before a publisher balance can be paid out.",
    permissions: "Permissions",
    pricing: "Pricing",
    publishedFeedback: "Published feedback",
    publisher: "Publisher",
    publisherResponse: "Publisher response",
    publisherTrust: "Publisher trust",
    related: "Alternatives and replacements",
    relatedBody: "Compare similar skills before installing, or keep a safer replacement path ready for deprecated, suspended, or high-risk capabilities.",
    relatedDetails: "Open details",
    relatedReasons: "Why it matches",
    reviews: "Operator notes",
    runtime: "Runtime",
    sdk: "SDK",
    apiInspect: "API inspect",
    security: "Security review",
    success: "Success rate",
    support: "Support and operations",
    supportItems: ["Version pinning supported", "Deprecation notice required", "Runtime incident reporting requires signed-in verified runtime use"],
    trustLevels: {
      active: "active",
      blocked: "blocked",
      limited: "limited",
      verified: "verified"
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
    changelog: "更新记录",
    cli: "CLI",
    cliPreview: "CLI / SDK 预览",
    cliPreviewStatus: "暂未作为公开的一键运行安装命令发布。",
    contract: "运行协议",
    feedback: "用户反馈",
    feedbackBody: "\u5df2\u767b\u5f55\u7528\u6237\u7684\u8bc4\u4f30\u901a\u8fc7\u5ba1\u6838\u540e\u4f1a\u5728\u8fd9\u91cc\u516c\u5f00\u5c55\u793a\u3002\u5df2\u63d0\u4ea4\u4f46\u672a\u9a8c\u8bc1\u7684\u6280\u80fd\u4e0d\u53ef\u5b89\u88c5\u3002",
    feedbackEmpty: "暂时还没有公开反馈。",
    feedbackProject: "项目",
    feedbackUseCase: "使用场景",
    developerPacket: {
      billing: {
        free: "无订阅门槛",
        per_call: "按量计费门槛",
        subscription: "试用或订阅门槛"
      },
      body:
        "\u8fd9\u4e2a\u5df2\u9a8c\u8bc1 listing \u53ea\u4f1a\u5728\u767b\u5f55\u540e\u8fdb\u5165\u9879\u76ee\u72b6\u6001\uff1a\u7248\u672c\u56fa\u5b9a\u3001\u7b56\u7565\u7f51\u5173\u3001\u4e00\u6b21\u53ef\u89c1\u8fd0\u884c Key\u3001\u767b\u5f55\u95e8\u63a7\u7684\u8fd0\u884c\u6d4b\u8bd5\uff0c\u4ee5\u53ca\u9884\u53d1\u5e03\u7684\u8ba1\u8d39\u6216\u8d26\u672c\u8bc1\u636e\u3002",
      keyValue: "一次性展示 Key",
      latest: "最新版本",
      policy: {
        detailHigh: "高风险能力会先停在负责人审批，批准后 agent 才能调用。",
        detailNormal: "项目策略会记录审批、预算和运行限制，再交给 agent 使用。",
        high: "运行前需要负责人批准",
        label: "策略网关",
        normal: "项目策略网关"
      },
      projectMissing: "需要先创建项目",
      projectReady: "已有可用项目",
      rows: {
        contract: ["合约固定", "Schema、权限和运行时保持可检查。"],
        key: ["运行 Key", "由项目命令中心管理。"],
        ledger: ["\u8fd0\u884c\u8bc1\u636e\u6a21\u578b", "\u8fd0\u884c\u8bc1\u636e\u53ef\u4ee5\u8fdb\u5165\u672a\u6765\u53d1\u7968\u3001\u5ba1\u8ba1\u548c\u4ed8\u8d39\u5e02\u573a\u590d\u6838\u3002"],
        project: ["项目状态", "保存或安装都归属到一个组织。"],
        test: ["\u767b\u5f55\u95e8\u63a7\u7684\u8fd0\u884c\u6d4b\u8bd5", "\u63a7\u5236\u53f0\u6d4b\u8bd5\u9700\u8981\u767b\u5f55\uff0c\u5e76\u4f7f\u7528\u4e0e agent \u8c03\u7528\u76f8\u540c\u7684\u7f51\u5173\u8def\u5f84\u3002"]
      },
      title: "\u5df2\u8ba4\u8bc1\u9879\u76ee\u8def\u5f84\u9884\u89c8"
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
    payout: "发布者提现",
    payoutBody: "付费用量必须先转换成不可变分账交易，然后才会进入发布者可提现余额。",
    permissions: "权限",
    pricing: "价格",
    publishedFeedback: "公开反馈",
    publisher: "发布者",
    publisherResponse: "发布者回复",
    publisherTrust: "发布者信任",
    related: "替代和相似技能",
    relatedBody: "安装前先比较同类技能；当技能弃用、暂停或风险过高时，也能保留更安全的替换路径。",
    relatedDetails: "打开详情",
    relatedReasons: "推荐原因",
    reviews: "运营备注",
    runtime: "运行时",
    sdk: "SDK",
    apiInspect: "API 查看",
    security: "安全审核",
    success: "成功率",
    support: "支持和运营",
    supportItems: ["\u652f\u6301\u7248\u672c\u56fa\u5b9a", "\u5e9f\u5f03\u5fc5\u987b\u63d0\u524d\u901a\u77e5", "\u8fd0\u884c\u4e8b\u6545\u4e3e\u62a5\u9700\u8981\u767b\u5f55\u4e14\u4f7f\u7528\u5df2\u9a8c\u8bc1\u8fd0\u884c\u8def\u5f84"],
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
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
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
    <main className="product-shell">
      <SiteHeader active="marketplace" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname={`/skills/${skill.slug}`} />

      <section className="skill-detail-hero">
        <div>
          <a className="breadcrumb-link" href={localizedHref("/marketplace", locale)}>
            {labels.back}
          </a>
          <div className="eyebrow">
            <PackageCheck size={16} aria-hidden="true" />
            <span>{localizeText(skill.category, locale)}</span>
          </div>
          <h1>{localizeText(skill.name, locale)}</h1>
          <p>{localizeText(skill.summary, locale)}</p>
          <div className="hero-actions">
            <a className="primary-button primary-button--large" href="#install">
              <Terminal size={18} aria-hidden="true" />
              <span>{skillActionState.sectionTitle[locale]}</span>
            </a>
            <a className="secondary-button secondary-button--large" href={localizedHref(developerAccessHref, locale)}>
              <DeveloperAccessIcon size={18} aria-hidden="true" />
              <span>{developerAccessLabel}</span>
            </a>
          </div>
        </div>

        <aside className="skill-status-panel">
          <div className="skill-status-panel__top">
            <BadgeCheck size={20} aria-hidden="true" />
            <div>
              <span>{labels.approval}</span>
              <strong>{localizeText(skill.verification, locale)}</strong>
            </div>
          </div>
          <div className="skill-status-grid">
            <div>
              <span>{labels.success}</span>
              <strong>{skill.successRate}</strong>
            </div>
            <div>
              <span>{labels.latency}</span>
              <strong>{skill.latency}</strong>
            </div>
            <div>
              <span>{labels.installs}</span>
              <strong>{skill.installs}</strong>
            </div>
            <div>
              <span>{labels.runtime}</span>
              <strong>{skill.runtime}</strong>
            </div>
          </div>
        </aside>
      </section>

      <PublicAccessScope locale={locale} />

      <JourneyRail
        actionHrefOverride={developerAccessHref}
        actionLabelOverride={developerAccessLabel}
        currentStep="skill"
        developerMode={skillActionState.canShowProjectHandoff ? "install" : "inspection"}
        journey="developer"
        locale={locale}
      />

      <section className="skill-detail-layout">
        <div className="skill-detail-main">
          <article className="skill-detail-panel" id="install">
            <div className="card-kicker">
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

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.useCases}</span>
            </div>
            <div className="use-case-list">
              {skill.useCases.map((item) => (
                <div className="use-case-row" key={localizeText(item, locale)}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{localizeText(item, locale)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <FileJson size={16} aria-hidden="true" />
              <span>{labels.contract}</span>
            </div>
            <div className="schema-grid">
              <div className="code-panel">
                <div className="code-panel__bar">
                  <span>{labels.input}</span>
                  <span>JSON</span>
                </div>
                <pre>
                  <code>{skill.inputExample}</code>
                </pre>
              </div>
              <div className="code-panel">
                <div className="code-panel__bar">
                  <span>{labels.output}</span>
                  <span>JSON</span>
                </div>
                <pre>
                  <code>{skill.outputExample}</code>
                </pre>
              </div>
            </div>
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.security}</span>
            </div>
            <div className="security-grid">
              {skill.securityReport.map((item) => (
                <div className="security-row" key={localizeText(item.label, locale)}>
                  <strong>{localizeText(item.label, locale)}</strong>
                  <span>{localizeText(item.value, locale)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="skill-detail-panel">
            <div className="card-kicker">
              <MessageSquareText size={16} aria-hidden="true" />
              <span>{labels.feedback}</span>
            </div>
            <p className="skill-feedback-intro">{labels.feedbackBody}</p>
            <div className="skill-feedback-summary-grid">
              <div>
                <strong>{feedbackData.summary.averageRating ? `${feedbackData.summary.averageRating}/5` : "n/a"}</strong>
                <span>{labels.averageRating}</span>
              </div>
              <div>
                <strong>{feedbackData.summary.publishedCount}</strong>
                <span>{labels.publishedFeedback}</span>
              </div>
            </div>
            <div className="skill-feedback-list">
              {feedbackData.feedback.length > 0 ? (
                feedbackData.feedback.map((feedback) => (
                  <section className="skill-feedback-row" key={feedback.id}>
                    <header>
                      <div>
                        <strong>{feedback.title}</strong>
                        <span>
                          {feedback.reviewerOrganizationName ?? feedback.reviewerDisplayName ?? labels.anonymousReviewer}
                        </span>
                      </div>
                      <div className="skill-feedback-stars" aria-label={`${feedback.rating} / 5`}>
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
                    <p>{feedback.body}</p>
                    {feedback.publisherResponseBody ? (
                      <div className="skill-feedback-publisher-response">
                        <strong>{labels.publisherResponse}</strong>
                        <p>{feedback.publisherResponseBody}</p>
                        {feedback.publisherRespondedAt ? <small>{formatDate(feedback.publisherRespondedAt, locale)}</small> : null}
                      </div>
                    ) : null}
                    <div className="skill-feedback-meta">
                      <span>
                        <strong>{labels.feedbackUseCase}</strong>
                        {feedback.useCase ?? "n/a"}
                      </span>
                      {feedback.projectSlug ? (
                        <span>
                          <strong>{labels.feedbackProject}</strong>
                          {feedback.projectSlug}
                        </span>
                      ) : null}
                    </div>
                  </section>
                ))
              ) : (
                <p className="skill-feedback-empty">{labels.feedbackEmpty}</p>
              )}
            </div>
          </article>

          <SkillFeedbackForm
            canSubmit={Boolean(session.subject)}
            locale={locale}
            skillName={localizeText(skill.name, locale)}
            skillSlug={skill.slug}
          />

          {relatedSkills.length > 0 ? (
            <article className="skill-detail-panel">
              <div className="card-kicker">
                <PackageSearch size={16} aria-hidden="true" />
                <span>{labels.related}</span>
              </div>
              <p className="related-skill-intro">{labels.relatedBody}</p>
              <div className="related-skill-list">
                {relatedSkills.map((suggestion) => {
                  const relatedInstallState = getSkillInstallState(suggestion.skill.verification.en);

                  return (
                    <section className="related-skill-row" key={suggestion.skill.slug}>
                      <header className="related-skill-row__head">
                        <div>
                          <strong>{localizeText(suggestion.skill.name, locale)}</strong>
                          <span>{localizeText(suggestion.skill.summary, locale)}</span>
                        </div>
                        <span className={`risk-badge risk-badge--${suggestion.skill.risk}`}>{suggestion.skill.risk}</span>
                      </header>

                      <div className="related-skill-meta">
                        <span>{localizeText(suggestion.skill.category, locale)}</span>
                        <span>{suggestion.skill.runtime}</span>
                        <span>{suggestion.skill.price[locale]}</span>
                        <span>{localizeText(suggestion.skill.verification, locale)}</span>
                      </div>

                      <div className="related-skill-reasons" aria-label={labels.relatedReasons}>
                        {suggestion.reasons[locale].map((reason) => (
                          <span key={reason}>
                            <BadgeCheck size={13} aria-hidden="true" />
                            {reason}
                          </span>
                        ))}
                      </div>

                      <div className="related-skill-command">
                        <code>{relatedInstallState.installable ? suggestion.skill.installsCommand.cli : relatedInstallState.reason[locale]}</code>
                        <a className="secondary-button secondary-button--compact" href={localizedHref(`/skills/${suggestion.skill.slug}`, locale)}>
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
        </div>

        <aside className="skill-detail-side">
          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Building2 size={16} aria-hidden="true" />
              <span>{labels.publisher}</span>
            </div>
            <div className="skill-publisher-card">
              <strong>{publisherProfile?.displayName ?? skill.author}</strong>
              <span>{labels.publisherTrust}</span>
              <div className="skill-publisher-card__badges">
                {publisherProfile ? <span className={publisherTrustClass(publisherProfile.trustLevel)}>{labels.trustLevels[publisherProfile.trustLevel]}</span> : null}
                {publisherProfile ? <span className="status-chip status-chip--neutral">{publisherProfile.metrics.verifiedSkillCount} {labels.verifiedSkills}</span> : null}
              </div>
              {publisherProfile ? (
                <a className="ghost-button ghost-button--inline" href={localizedHref(`/publishers/${publisherProfile.slug}`, locale)}>
                  <Building2 size={15} aria-hidden="true" />
                  <span>{labels.viewPublisher}</span>
                </a>
              ) : null}
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <WalletCards size={16} aria-hidden="true" />
              <span>{labels.pricing}</span>
            </div>
            <div className="price-block">
              <strong>{skill.price[locale]}</strong>
              <span>{pricingPreviewBody(skill.billing, skillAvailability.kind, locale)}</span>
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <KeyRound size={16} aria-hidden="true" />
              <span>{labels.permissions}</span>
            </div>
            <div className="permission-list">
              {skill.permissions.map((permission) => (
                <div className="permission-row" key={permission.key}>
                  <strong>{localizeText(permission.label, locale)}</strong>
                  <span>{localizeText(permission.value, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <History size={16} aria-hidden="true" />
              <span>{labels.changelog}</span>
            </div>
            <div className="changelog-list">
              {skill.changelog.map((item) => (
                <div className="changelog-row" key={item.version}>
                  <strong>{item.version}</strong>
                  <span>{localizeText(item.note, locale)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Star size={16} aria-hidden="true" />
              <span>{labels.reviews}</span>
            </div>
            {skill.reviews.map((review) => (
              <blockquote className="operator-note" key={review.author}>
                <p>{localizeText(review.quote, locale)}</p>
                <cite>{review.author}</cite>
              </blockquote>
            ))}
          </section>

          <section className="skill-detail-panel">
            <div className="card-kicker">
              <Code2 size={16} aria-hidden="true" />
              <span>{labels.support}</span>
            </div>
            <div className="support-list">
              {labels.supportItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
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
    <div className="skill-developer-handoff-packet">
      <div className="skill-developer-handoff-packet__head">
        <div>
          <strong>{labels.title}</strong>
          <p>{labels.body}</p>
        </div>
      </div>
      <div className="skill-developer-handoff-grid">
        {rows.map((row) => (
          <div className="skill-developer-handoff-row" key={row.label}>
            <span className="skill-developer-handoff-row__icon">{row.icon}</span>
            <span className={row.tone === "warning" ? "status-chip status-chip--warning" : "status-chip"}>{row.label}</span>
            <strong>{row.value}</strong>
            <small>{row.detail}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillInspectionOnlyNotice({ locale }: { locale: Locale }) {
  return (
    <div className="skill-action-locked">
      <ShieldCheck size={18} aria-hidden="true" />
      <strong>{locale === "zh" ? "仅可查看" : "Inspection only"}</strong>
      <p>
        {locale === "zh"
          ? "该技能已提交但尚未通过验证审核。你可以查看 manifest、schema、权限、发布者和审核状态；安装、项目交接、运行测试、订阅、计费和账本动作只会在 verified 审核通过后开放。"
          : "This skill is submitted but not verified yet. You can inspect its manifest, schemas, permissions, publisher, and review state. Install, project handoff, runtime test, subscription, billing, and ledger actions unlock only after verified approval."}
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
      ? "仅可查看。价格、安装、运行、计费和账本动作只会在 verified 审核通过后开放。"
      : "Inspection only. Pricing, install, runtime, billing, and ledger actions unlock only after verified approval.";
  }

  if (billingModel === "free") {
    return locale === "zh"
      ? "付费市场计费仍处于预发布阶段。免费技能可公开查看；运行调用仍需要登录后的项目 Key。"
      : "Paid marketplace billing is prelaunch. Free skills may be inspected publicly; runtime use still requires a signed-in project key.";
  }

  return locale === "zh"
    ? "付费市场计费仍处于预发布阶段。当前价格用于展示商业意图；真实运行仍需要登录后的项目 Key 和策略检查。"
    : "Paid marketplace billing is prelaunch. The current price describes commercial intent; real runtime use still requires a signed-in project key and policy checks.";
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
    return "status-chip";
  }

  if (trustLevel === "blocked") {
    return "status-chip status-chip--danger";
  }

  if (trustLevel === "limited") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}
