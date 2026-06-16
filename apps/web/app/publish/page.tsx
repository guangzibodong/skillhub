import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  FileJson,
  Gauge,
  HandCoins,
  ListChecks,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { JourneyRail } from "@/components/journey-rail";
import { FlowStepList, StatusChip } from "@/components/operational-status";
import { PublishForm } from "@/components/publish-form";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, hrefWithReturnTo, localizedHref, localizedHrefWithReturnTo } from "@/lib/i18n";
import { getPublishCopy, type PublishPageCopy } from "@/lib/publish-copy";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherRoles = ["publisher", "owner", "admin", "super_admin"];

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
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
  const operationCards = getPublishOperationCards(locale);
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
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
  const journeyActionHref = hasPublisherAccess
    ? "/publisher"
    : session.subject
      ? "/account"
      : hrefWithReturnTo("/login", "/publish", locale);
  const signalIcons = [ClipboardCheck, ShieldCheck, Gauge, HandCoins];
  const stepIcons = [
    FileJson,
    ListChecks,
    ClipboardCheck,
    ShieldCheck,
    Gauge,
    BookOpenCheck,
    HandCoins,
  ];

  return (
    <AppShell active="publish" locale={locale}>
      <section
        className="section py-[96px]"
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
                <a className="btn-primary btn-primary--large" href={accessNotice.actionHref}>
                  <UploadCloud size={18} aria-hidden="true" />
                  <span>
                    {hasPublisherAccess
                      ? (locale === "zh" ? "进入发布者工作台" : "Open publisher workspace")
                      : (locale === "zh" ? "先登录发布技能" : "Sign in to publish")}
                  </span>
                </a>
                <a className="btn-secondary btn-secondary--large" href={localizedHref("/publisher-review", locale)}>
                  <ClipboardCheck size={18} aria-hidden="true" />
                  <span>{locale === "zh" ? "查看审核规则" : "Review requirements"}</span>
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
                      <span className="body-text-sm text-[#999]">{label}</span>
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

      <Reveal delay={100}>
        <JourneyRail
          actionHrefOverride={journeyActionHref}
          actionLabelOverride={accessNotice.actionLabel}
          currentStep="publish"
          journey="publisher"
          locale={locale}
        />
      </Reveal>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="publish-ops-heading">
        <div className="section-inner flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="max-w-[720px]">
              <div className="eyebrow">
                <BadgeCheck size={16} aria-hidden="true" />
                <span>{pageLabels.operatingEyebrow}</span>
              </div>
              <h2 id="publish-ops-heading" className="heading-lg mt-3">
                {pageLabels.operatingTitle}
              </h2>
              <p className="body-text mt-3">{pageLabels.operatingBody}</p>
            </div>
            <a className="btn-secondary" href={localizedHref("/publisher-review", locale)}>
              <span>{pageLabels.reviewRules}</span>
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {operationCards.map((card, index) => {
              const Icon = stepIcons[index + 1] ?? ClipboardCheck;

              return (
                <Reveal delay={index * 70} key={card.title}>
                  <article className="card flex flex-col gap-4 h-full">
                    <div className="w-10 h-10 rounded-[8px] bg-[rgba(127,238,100,0.1)] flex items-center justify-center">
                      <Icon size={20} aria-hidden="true" className="text-[#7fee64]" />
                    </div>
                    <div>
                      <h3 className="heading-sm">{card.title}</h3>
                      <p className="body-text-sm text-[#999] mt-2">{card.body}</p>
                    </div>
                    <ul className="flex flex-col gap-2 mt-auto">
                      {card.items.map((item) => (
                        <li className="flex items-start gap-2 text-sm text-[#999]" key={item}>
                          <ClipboardCheck size={15} aria-hidden="true" className="text-[#7fee64] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section py-[96px]">
        <div className="section-inner">
          <WorkspaceAccessPanel
            locale={locale}
            requiredRoles={publisherRoles}
            returnTo="/publish"
            session={session}
            workspace="publisher"
          />
        </div>
      </section>

      <div className="section-divider" />

      <Reveal delay={200}>
        <PublishForm
          access={accessNotice}
          apiUrl={apiUrl}
          labels={publishCopy.form}
          locale={locale}
        />
      </Reveal>

      <div className="section-divider" />

      <section className="section py-[96px]" aria-labelledby="publish-pipeline-heading">
        <div className="section-inner">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <div className="eyebrow">
                <BookOpenCheck size={16} aria-hidden="true" />
                <span>{pageLabels.pipelineEyebrow}</span>
              </div>
              <h2
                id="publish-pipeline-heading"
                className="heading-lg mt-3"
              >
                {pageLabels.pipelineTitle}
              </h2>
              <p className="body-text mt-3 max-w-[560px]">
                {pageLabels.pipelineBody}
              </p>
            </div>
            <a
              className="btn-secondary"
              href={accessNotice.actionHref}
            >
              <Gauge size={16} aria-hidden="true" />
              <span>{hasPublisherAccess ? pageLabels.publisherWorkspace : accessNotice.actionLabel}</span>
            </a>
          </div>
          <FlowStepList
            ariaLabel={pageLabels.pipelineTitle}
            steps={pageLabels.pipelineSteps.map((step, index) => {
              const Icon = stepIcons[index] ?? ListChecks;

              return {
                body: step.body,
                icon: <Icon size={16} aria-hidden="true" />,
                title: step.title,
              };
            })}
          />
          <div className="mt-6">
            <StatusChip tone="neutral">{pageLabels.badge}</StatusChip>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function getPublishPageShellCopy(locale: "en" | "zh", fallback: PublishPageCopy) {
  if (locale === "zh") {
    return {
      ...fallback,
      badge: "skillhub.json",
      description:
        "把一个 AI 能力整理成可检查、可审核、可维护的 Skill。先通过 manifest 预检保存草稿，再提交精确版本进入审核；付费信息只作为预发布准备，不会直接收款。",
      eyebrow: "发布者入口",
      openWorkspace: "进入发布者工作台",
      operatingBody:
        "发布页的目标不是让作者随便上传文件，而是提前把审核、运行、权限、支持和后续维护说清楚。这样技能上架后，客户、发布者和运营后台看到的是同一套状态。",
      operatingEyebrow: "发布前准备",
      operatingTitle: "一个可上线的技能，需要先回答这三件事。",
      pipelineBody:
        "从 manifest 草稿开始，经过预检、版本提交、自动检查、人工审核和上架维护。任何会影响真实调用的变更都应该走新版本，而不是偷偷改已验证版本。",
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
        {
          body: "定价意图、条款、收款资料和分佣规则是预发布准备，不能代替最终付费市场审核。",
          title: "付费准备",
        },
      ],
    };
  }

  return {
    ...fallback,
    badge: "skillhub.json",
    description:
      "Turn an AI capability into an inspectable, reviewable, and maintainable Skill. Save a draft after manifest preflight, then submit an exact version for review. Paid fields are readiness metadata, not live checkout.",
    eyebrow: "Publisher entry",
    openWorkspace: "Open publisher workspace",
    operatingBody:
      "This page is not a blind upload form. It helps authors make review, runtime, permissions, support, and maintenance explicit so buyers, publishers, and operators read the same state after listing.",
    operatingEyebrow: "Before publishing",
    operatingTitle: "A production-ready skill must answer three questions first.",
    pipelineBody:
      "Start from a manifest draft, then move through preflight, version submission, automated checks, human review, and listing maintenance. Any behavior-changing update should become a new version.",
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
      {
        body: "Pricing intent, terms, payout profile, and commission rules are readiness metadata until paid-marketplace approval is complete.",
        title: "Paid readiness",
      },
    ],
  };
}

function getPublishOperationCards(locale: "en" | "zh") {
  if (locale === "zh") {
    return [
      {
        body: "客户先看说明再决定是否采用，描述不能只写一句口号。",
        items: ["解决什么问题", "适合哪些场景", "输出结果长什么样"],
        title: "这个技能到底帮谁做什么？",
      },
      {
        body: "Agent 调用技能前，团队必须知道它会访问什么资源。",
        items: ["网络、浏览器、文件、密钥", "高风险权限说明", "失败和限流行为"],
        title: "权限和运行边界是否清楚？",
      },
      {
        body: "上架不是结束，发布者需要维护版本、反馈和支持路径。",
        items: ["变更记录", "故障和废弃通知", "客户反馈与发布者回复"],
        title: "上架后谁负责维护？",
      },
    ];
  }

  return [
    {
      body: "Buyers need a clear reason to adopt before they trust the manifest.",
      items: ["What problem it solves", "Which use cases fit", "What output looks like"],
      title: "Who does this skill help?",
    },
    {
      body: "Teams must understand what the agent can access before runtime.",
      items: ["Network, browser, files, secrets", "High-risk permission notes", "Failure and rate-limit behavior"],
      title: "Are permissions and runtime boundaries clear?",
    },
    {
      body: "Listing is not the finish line; publishers own version, feedback, and support follow-through.",
      items: ["Changelog", "Incident and deprecation notices", "Feedback and publisher responses"],
      title: "Who maintains it after listing?",
    },
  ];
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
      actionHref: localizedHref("/publisher", locale),
      actionLabel:
        locale === "zh" ? "打开发布者工作台" : "Open publisher workspace",
      body:
        locale === "zh"
          ? "当前账号已具备发布权限，可以保存草稿并继续提交审核。正式公开上架前仍需要完成版本审核、运行检查、条款确认、定价意图和收款资料准备。"
          : "Your current session can save organization-scoped drafts. Public listing still requires version review and runtime checks; pricing and paid-readiness fields remain prelaunch metadata.",
      canSubmit: true,
      title: locale === "zh" ? "发布权限已就绪" : "Publisher access ready",
    };
  }

  if (!hasSession) {
    return {
      actionHref: localizedHrefWithReturnTo("/login", locale, "/publish"),
      actionLabel: locale === "zh" ? "先登录" : "Sign in",
    body:
      locale === "zh"
        ? "请先通过用户名/邮箱密码、已配置的 Google/GitHub OAuth，或邀请/恢复 token 登录。登录前表单会保持锁定，避免填完 manifest 才失败。"
        : "Enter through username/email password, configured Google/GitHub OAuth, or an invite/recovery token first. The form stays locked so publishers do not fill a manifest only to fail at submit time.",
      canSubmit: false,
      title: locale === "zh" ? "需要先登录" : "Sign-in required",
    };
  }

  return {
    actionHref: localizedHref("/account", locale),
    actionLabel: locale === "zh" ? "查看账号权限" : "Check account access",
    body:
      locale === "zh"
        ? "当前账号已登录，但还没有发布权限。请到账号中心确认所在组织的权限，或让组织负责人开通发布权限后再保存草稿。"
        : "You are signed in, but this account does not have publisher access yet. Check your organization access before saving a draft.",
    canSubmit: false,
    title: locale === "zh" ? "需要发布权限" : "Publisher access required",
  };
}
