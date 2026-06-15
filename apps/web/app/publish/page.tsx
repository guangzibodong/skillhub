import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  Gauge,
  ListChecks,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { PublishForm } from "@/components/publish-form";
import { getWorkspaceSession } from "@/lib/auth-session";
import {
  getLocaleFromSearchParams,
  localizedHref,
  localizedHrefWithReturnTo,
  type Locale,
} from "@/lib/i18n";
import { getPublishCopy } from "@/lib/publish-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return {
    title: locale === "zh" ? "发布 AI Agent Skill" : "Publish an AI Agent Skill",
    description:
      locale === "zh"
        ? "提交 skillhub.json、运行预检、保存草稿，并把精确版本送入 SkillHub 审核。"
        : "Submit skillhub.json, run preflight, save a draft, and send the exact version into SkillHub review.",
  };
}

const publisherRoles = ["publisher", "owner", "admin", "super_admin"];

const copy = {
  en: {
    eyebrow: "Publish",
    title: "Publish your AI Agent Skill to a governed marketplace",
    body:
      "Submit versioned skills with manifests, examples, permissions, and review status so teams can inspect, approve, and run them safely.",
    primary: "Start Publishing",
    secondary: "Review requirements",
    whyTitle: "Why publish on SkillHub",
    why: [
      ["Inspectable contracts", "Teams can review manifests, schemas, permissions, and examples before adoption."],
      ["Governed runtime path", "Approved skills connect to scoped Project Keys, policies, logs, and REST / MCP invocation."],
      ["Publisher trust", "Version history, review status, support paths, and pricing readiness live with the listing."],
    ],
    howTitle: "How publishing works",
    steps: [
      ["Create publisher profile", "Set public identity, support path, and organization ownership."],
      ["Upload manifest", "Submit name, version, runtime, schema, permissions, and examples."],
      ["Add examples and permissions", "Make input, output, and risk clear for buyers and reviewers."],
      ["Submit for review", "Run automated checks and human review before public trust status changes."],
      ["Go live in the registry", "Verified skills become discoverable with a stable detail page."],
    ],
    manifestTitle: "Manifest example",
    reviewTitle: "Review process",
    workspaceTitle: "Publisher workspace",
    workspaceRows: [
      ["Skill", "browser-research"],
      ["Version", "1.0.0"],
      ["Status", "Submitted"],
      ["Next action", "Review permissions"],
    ],
    formTitle: "Publisher submission",
  },
  zh: {
    eyebrow: "发布",
    title: "把你的 AI Agent Skill 发布到治理型市场",
    body:
      "提交带版本的技能，包含 manifest、示例、权限和审核状态，让团队可以检查、批准并安全运行。",
    primary: "开始发布",
    secondary: "查看审核要求",
    whyTitle: "为什么发布到 SkillHub",
    why: [
      ["可检查的合约", "团队采用前可以查看 manifest、schema、权限和示例。"],
      ["受治理的运行路径", "已批准技能可接入有范围的 Project Key、策略、日志和 REST / MCP 调用。"],
      ["发布者信任", "版本历史、审核状态、支持入口和商业化准备信息跟随列表展示。"],
    ],
    howTitle: "发布流程",
    steps: [
      ["创建发布者档案", "设置公开身份、支持入口和组织归属。"],
      ["上传 manifest", "提交名称、版本、运行时、schema、权限和示例。"],
      ["补充示例和权限", "让买方和审核人员看清输入、输出和风险。"],
      ["提交审核", "通过自动检查和人工审核后，公开信任状态才会变化。"],
      ["进入公开注册表", "已验证技能获得稳定详情页并可被发现。"],
    ],
    manifestTitle: "Manifest 示例",
    reviewTitle: "审核流程",
    workspaceTitle: "发布者工作区预览",
    workspaceRows: [
      ["技能", "browser-research"],
      ["版本", "1.0.0"],
      ["状态", "已提交"],
      ["下一步", "复核权限"],
    ],
    formTitle: "发布者提交",
  },
} as const;

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const publishCopy = getPublishCopy(locale);
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

  return (
    <AppShell active="publish" locale={locale}>
      <section className="section pt-10 pb-14 md:pt-16 md:pb-20" aria-labelledby="publish-heading">
        <div className="section-inner hero-glow grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-center">
          <Reveal>
            <div className="flex flex-col gap-6">
              <div className="eyebrow">
                <UploadCloud size={16} aria-hidden="true" />
                <span>{labels.eyebrow}</span>
              </div>
              <div className="flex flex-col gap-4 max-w-[760px]">
                <h1 id="publish-heading" className="heading-xl">{labels.title}</h1>
                <p className="body-text text-[#999]">{labels.body}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a className="btn-primary--large" href={accessNotice.actionHref}>
                  <UploadCloud size={18} aria-hidden="true" />
                  <span>{labels.primary}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a className="btn-secondary--large" href={localizedHref("/publisher-review", locale)}>
                  <ClipboardCheck size={18} aria-hidden="true" />
                  <span>{labels.secondary}</span>
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <WorkspacePreview locale={locale} labels={labels} />
          </Reveal>
        </div>
      </section>

      <section className="section py-12" aria-labelledby="publish-why-heading">
        <div className="section-inner flex flex-col gap-6">
          <h2 id="publish-why-heading" className="heading-lg">{labels.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {labels.why.map(([title, body]) => (
              <article className="card p-6 flex flex-col gap-3" key={title}>
                <ShieldCheck size={20} aria-hidden="true" className="text-[#7fee64]" />
                <h3 className="heading-sm">{title}</h3>
                <p className="body-text-sm text-[#999]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-12" aria-labelledby="publish-how-heading">
        <div className="section-inner flex flex-col gap-6">
          <h2 id="publish-how-heading" className="heading-lg">{labels.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {labels.steps.map(([title, body], index) => (
              <article className="card--compact p-4 flex flex-col gap-3" key={title}>
                <span className="text-xs text-[#525252]">{String(index + 1).padStart(2, "0")}</span>
                <strong className="text-sm text-white">{title}</strong>
                <p className="body-text-sm text-[#777]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="section-inner grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="card p-6">
            <div className="eyebrow">
              <FileJson size={16} aria-hidden="true" />
              <span>{labels.manifestTitle}</span>
            </div>
            <div className="code-block mt-4">
              <pre className="p-4 text-sm overflow-x-auto">
                <code>{`{
  "name": "browser-research",
  "version": "1.0.0",
  "runtime": { "type": "http" },
  "permissions": {
    "network": true,
    "browser": true,
    "secrets": []
  },
  "examples": ["research brief with citations"]
}`}</code>
              </pre>
            </div>
          </article>

          <article className="card p-6">
            <div className="eyebrow">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.reviewTitle}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {labels.steps.slice(1, 4).map(([title, body]) => (
                <div className="flex items-start gap-3" key={title}>
                  <CheckCircle2 size={16} aria-hidden="true" className="text-[#7fee64] mt-0.5" />
                  <div>
                    <strong className="block text-sm text-white">{title}</strong>
                    <span className="text-sm text-[#999]">{body}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section py-12" aria-labelledby="publish-form-heading">
        <div className="section-inner flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="eyebrow">
              <Gauge size={16} aria-hidden="true" />
              <span>{labels.formTitle}</span>
            </div>
            <h2 id="publish-form-heading" className="heading-lg">{labels.formTitle}</h2>
          </div>
          <PublishForm
            access={accessNotice}
            apiUrl={apiUrl}
            labels={publishCopy.form}
            locale={locale}
          />
        </div>
      </section>
    </AppShell>
  );
}

function WorkspacePreview({
  labels,
}: {
  locale: Locale;
  labels: (typeof copy)[Locale];
}) {
  return (
    <aside className="card p-6 flex flex-col gap-4">
      <div className="eyebrow">
        <ListChecks size={16} aria-hidden="true" />
        <span>{labels.workspaceTitle}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {labels.workspaceRows.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span className="text-xs text-[#777]">{label}</span>
            <strong className="text-sm text-white">{value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}

function getPublishAccessNotice({
  hasPublisherAccess,
  hasSession,
  locale,
}: {
  hasPublisherAccess: boolean;
  hasSession: boolean;
  locale: Locale;
}) {
  if (hasPublisherAccess) {
    return {
      actionHref: localizedHref("/publisher", locale),
      actionLabel:
        locale === "zh" ? "打开发布者工作台" : "Open publisher workspace",
      body:
        locale === "zh"
          ? "当前账号已具备发布权限，可以保存草稿并提交审核。"
          : "Your current session can save drafts and submit versions for review.",
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
          ? "请先登录或创建工作区，然后保存草稿并提交审核。"
          : "Sign in or create a workspace before saving drafts and submitting for review.",
      canSubmit: false,
      title: locale === "zh" ? "需要先登录" : "Sign-in required",
    };
  }

  return {
    actionHref: localizedHref("/account", locale),
    actionLabel: locale === "zh" ? "查看账号权限" : "Check account access",
    body:
      locale === "zh"
        ? "当前账号还没有发布权限。请在账号中心确认组织角色。"
        : "This account does not have publisher access yet. Check organization roles in account settings.",
    canSubmit: false,
    title: locale === "zh" ? "需要发布权限" : "Publisher access required",
  };
}
