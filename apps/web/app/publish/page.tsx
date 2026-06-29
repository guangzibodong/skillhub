import {
  ClipboardCheck,
  FileJson,
  Gauge,
  HandCoins,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { JourneyRail } from "@/components/journey-rail";
import { InlineHelp } from "@/components/inline-help";
import { PublishForm } from "@/components/publish-form";
import { getWorkspaceSession } from "@/lib/auth-session";
import {
  getLocaleFromSearchParams,
  localizedHref,
  localizedHrefWithReturnTo,
} from "@/lib/i18n";
import { getPublishCopy, type PublishPageCopy } from "@/lib/publish-copy";
import { buildLocalizedMetadata } from "@/lib/seo";
import styles from "./publish.module.css";
import { getPublicApiUrl } from "@/lib/api-url";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherRoles = ["publisher", "owner", "admin", "super_admin"];

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/publish",
    type: "website",
    en: {
      title: "Publish an AI Agent Skill - SkillHub",
      description:
        "Submit a SkillHub manifest for review, prepare examples, permissions, support metadata, and paid-catalog readiness for AI Agent Skills.",
    },
    zh: {
      title: "发布 AI Agent Skill - SkillHub",
      description:
        "提交 SkillHub manifest 进入审核，准备示例、权限、支持信息和付费目录就绪资料，让第三方作者发布 AI Agent Skill。",
    },
  });
}

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const publishCopy = getPublishCopy(locale);
  const labels = publishCopy.page;
  const pageLabels = getPublishPageShellCopy(locale, labels);
  const apiUrl =
    getPublicApiUrl();
  const session = await getWorkspaceSession();
  const roleSet = new Set(
    [session.subject?.platformRole, ...(session.subject?.roles ?? [])].filter(
      Boolean,
    ),
  );
  const hasPublisherAccess =
    Boolean(session.subject) &&
    publisherRoles.some((role) => roleSet.has(role));
  const accessNotice = getPublishAccessNotice({
    hasPublisherAccess,
    hasSession: Boolean(session.subject),
    locale,
  });
  const heroPrimaryLabel = hasPublisherAccess
    ? pageLabels.publisherWorkspace
    : accessNotice.actionLabel;
  const signalIcons = [ClipboardCheck, ShieldCheck, Gauge, HandCoins];


  return (
    <AppShell active="publish" locale={locale}>
      <div className={"publish-shell " + styles.pageStyles}>
        <section
          className="section py-[64px]"
          aria-labelledby="publish-heading"
        >
          <Reveal>
            <div className="section-inner flex flex-col lg:flex-row gap-10 items-start">
              <div className="flex-1 hero-glow">
                <div className="eyebrow">
                  <UploadCloud size={16} aria-hidden="true" />
                  <span>{pageLabels.eyebrow}</span>
                </div>
                <h1 id="publish-heading" className="heading-xl mt-4">
                  {pageLabels.title}
                </h1>
                <p className="body-text mt-4 max-w-[600px]">
                  {pageLabels.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    className="btn-primary btn-primary--large"
                    href={accessNotice.actionHref}
                  >
                    <UploadCloud size={18} aria-hidden="true" />
                    <span>{heroPrimaryLabel}</span>
                  </a>
                  <a
                    className="btn-secondary btn-secondary--large"
                    href={localizedHref("/publisher-review", locale)}
                  >
                    <ClipboardCheck size={18} aria-hidden="true" />
                    <span>
                      {locale === "zh" ? "查看审核规则" : "Review requirements"}
                    </span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-4 items-start">
                <div className="pill">
                  <FileJson size={18} aria-hidden="true" />
                  <span>{pageLabels.badge}</span>
                </div>
                <div
                  className="grid grid-cols-2 gap-3"
                  aria-label={pageLabels.signalLabel}
                >
                  {pageLabels.signals.map(([label, value], index) => {
                    const Icon = signalIcons[index] ?? ClipboardCheck;

                    return (
                      <div
                        key={label}
                        className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 flex flex-col gap-1"
                      >
                        <Icon size={16} aria-hidden="true" />
                        <span className="body-text-sm text-[#999]">
                          {label}
                        </span>
                        <strong className="text-white text-sm">{value}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <div className="section-divider" />

        <Reveal delay={70}>
          <JourneyRail
            className="publish-journey-steps"
            currentStep="publish"
            journey="publisher"
            locale={locale}
            variant="steps"
          />
        </Reveal>

        <Reveal delay={90}>
          <PublishForm
            access={accessNotice}
            apiUrl={apiUrl}
            labels={publishCopy.form}
            locale={locale}
          />
        </Reveal>

        <section className="publish-compact-help" aria-label={pageLabels.pipelineTitle}>
          <div className="section-inner publish-compact-help__inner">
            <div className="publish-compact-help__copy">
              <strong>{pageLabels.pipelineTitle}</strong>
              <InlineHelp
                content={pageLabels.pipelineBody}
                label={locale === "zh" ? "查看审核说明" : "View review guidance"}
              />
            </div>
            <div className="publish-compact-help__actions">
              <a className="secondary-button" href={localizedHref("/publisher-review", locale)}>
                <ClipboardCheck size={15} aria-hidden="true" />
                <span>{pageLabels.reviewRules}</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function getPublishAccessNotice({
  hasPublisherAccess,
  hasSession,
  locale,
}: {
  hasPublisherAccess: boolean;
  hasSession: boolean;
  locale: "en" | "zh";
}) {
  if (hasPublisherAccess) {
    return {
      actionHref: localizedHref("/publisher#publisher-skills", locale),
      actionLabel: locale === "zh" ? "发布者工作台" : "Publisher workspace",
      body:
        locale === "zh"
          ? "当前账号可以保存草稿并提交版本审核。"
          : "This account can save drafts and submit versions for review.",
      canSubmit: true,
      title: locale === "zh" ? "发布权限已就绪" : "Publisher access ready",
    };
  }

  if (hasSession) {
    return {
      actionHref: localizedHref("/account", locale),
      actionLabel: locale === "zh" ? "查看账号权限" : "Check account access",
      body:
        locale === "zh"
          ? "当前账号已登录，但还没有发布者权限。"
          : "You are signed in, but this account does not have publisher access yet.",
      canSubmit: false,
      title: locale === "zh" ? "需要发布者权限" : "Publisher access required",
    };
  }

  return {
    actionHref: localizedHrefWithReturnTo("/login", locale, "/publish"),
    actionLabel: locale === "zh" ? "登录后发布" : "Sign in to publish",
    body:
      locale === "zh"
        ? "登录后才能保存草稿、预检 manifest 并提交审核。"
        : "Sign in before saving drafts, running preflight, and submitting for review.",
    canSubmit: false,
    title: locale === "zh" ? "需要先登录" : "Sign-in required",
  };
}

function getPublishPageShellCopy(
  locale: "en" | "zh",
  fallback: PublishPageCopy,
) {
  if (locale === "zh") {
    return {
      ...fallback,
      badge: "skillhub.json",
      description:
        "把一个 AI 能力整理成可检查、可审核、可维护的 Skill。新作者先申请发布权限；通过后再通过 manifest 预检保存草稿、提交精确版本进入审核。付费信息只作为预发布准备，不会直接收款。",
      eyebrow: "发布者入口",
      openWorkspace: "进入发布者工作台",
      operatingBody:
        "发布页的目标不是让作者随便上传文件，而是把入驻、审核、运行、权限、支持和后续维护说清楚。这样技能上架后，客户、发布者和运营后台看到的是同一套状态。",
      operatingEyebrow: "发布前准备",
      operatingTitle: "一个可上线的技能，需要先回答这三件事。",
      pipelineBody:
        "从发布权限申请开始，再进入 manifest 草稿、预检、版本提交、自动检查、人工审核和上架维护。任何会影响真实调用的变更都应该走新版本，而不是偷偷改已验证版本。",
      pipelineEyebrow: "发布者工作流",
      pipelineTitle: "上传只是第一步，可信上架靠完整证据。",
      publisherWorkspace: "发布者工作台",
      reviewRules: "查看审核规则",
      signInToPublish: "登录后发布技能",
      signalLabel: "发布运营状态",
      signals: [
        ["合约", "先写清能力"],
        ["预检", "先修阻塞项"],
        ["审核", "按版本提交"],
        ["维护", "上架后负责"],
      ] as Array<[string, string]>,
      title: "发布一个可以被客户信任的 Skill。",
      pipelineSteps: [
        {
          body: "新作者先说明团队、能力来源、维护负责人、支持邮箱和计划发布的技能类型。运营确认后再开放发布者工作台。",
          title: "申请发布权限",
        },
        {
          body: "准备 skillhub.json：名称、版本、分类、描述、运行入口、权限、输入输出 schema、示例和支持路径都要完整。",
          title: "准备 manifest",
        },
        {
          body: "先在页面内发现 JSON 语法、必填字段、HTTPS 入口、schema 质量和高风险权限问题。",
          title: "执行预检",
        },
        {
          body: "登录后把合约保存为组织下的草稿，避免匿名上传和 token 暴露。",
          title: "保存草稿",
        },
        {
          body: "在发布者工作台选择精确语义版本提交审核，审核只针对该版本生效。",
          title: "提交版本",
        },
        {
          body: "系统生成 manifest、运行入口、示例和安全检查证据，供发布者和审核员共同查看。",
          title: "自动检查",
        },
        {
          body: "审核通过后才进入公开可采用状态；被退回时需要按问题修复并重新提交。",
          title: "人工审核",
        },
      ],
    };
  }

  return {
    ...fallback,
    badge: "skillhub.json",
    description:
      "Turn an AI capability into an inspectable, reviewable, and maintainable Skill. New authors request publisher access first; approved publishers save a draft after manifest preflight, then submit an exact version for review. Paid fields are readiness metadata, not live checkout.",
    eyebrow: "Publisher entry",
    openWorkspace: "Open publisher workspace",
    operatingBody:
      "This page is not a blind upload form. It makes publisher access, review, runtime, permissions, support, and maintenance explicit so buyers, publishers, and operators read the same state after listing.",
    operatingEyebrow: "Before publishing",
    operatingTitle:
      "A production-ready skill must answer three questions first.",
    pipelineBody:
      "Start with publisher access, then move through manifest draft, preflight, version submission, automated checks, human review, and listing maintenance. Any behavior-changing update should become a new version.",
    pipelineEyebrow: "Review pipeline",
    pipelineTitle: "Upload starts the process; evidence earns trust.",
    publisherWorkspace: "Publisher workspace",
    reviewRules: "Review requirements",
    signInToPublish: "Sign in to publish",
    signalLabel: "Publishing operating state",
    signals: [
      ["Contract", "Describe capability"],
      ["Preflight", "Fix blockers first"],
      ["Review", "Submit by version"],
      ["Maintain", "Own the listing"],
    ] as Array<[string, string]>,
    title: "Publish a Skill customers can trust.",
    pipelineSteps: [
      {
        body: "New authors share the team, capability source, maintenance owner, support email, and intended skill category. Operators open the publisher workspace after review.",
        title: "Request publisher access",
      },
      {
        body: "Prepare skillhub.json with identity, version, category, description, runtime entrypoint, permissions, schemas, examples, and support path.",
        title: "Prepare manifest",
      },
      {
        body: "Catch JSON syntax, missing fields, HTTPS endpoint, schema quality, and high-risk permission issues before saving.",
        title: "Run preflight",
      },
      {
        body: "Save the contract as an organization-owned draft through a signed-in session instead of an anonymous upload.",
        title: "Save draft",
      },
      {
        body: "Choose the exact semantic version that should enter review from the publisher workspace.",
        title: "Submit version",
      },
      {
        body: "Manifest, runtime, example, and security checks become shared evidence for publishers and reviewers.",
        title: "Automated checks",
      },
      {
        body: "Only approved versions become publicly adoptable. Returned versions must be repaired and resubmitted.",
        title: "Human review",
      },
    ],
  };
}
