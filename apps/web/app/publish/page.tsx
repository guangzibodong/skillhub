import {
  BookOpenCheck,
  ClipboardCheck,
  FileJson,
  Gauge,
  HandCoins,
  ListChecks,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { JourneyRail } from "@/components/journey-rail";
import { FlowStepList, StatusChip } from "@/components/operational-status";
import { PublishForm } from "@/components/publish-form";
import { SiteHeader } from "@/components/site-header";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import {
  getDictionary,
  getLocaleFromSearchParams,
  localizedHref,
} from "@/lib/i18n";
import { getPublishCopy } from "@/lib/publish-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherRoles = ["publisher", "owner", "admin", "super_admin"];

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const publishCopy = getPublishCopy(locale);
  const labels = publishCopy.page;
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
      : "/login";
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
    <main className="publish-shell">
      <SiteHeader
        active="publish"
        apiUrl={apiUrl}
        dictionary={dictionary}
        locale={locale}
        pathname="/publish"
        subtitle={labels.consoleSubtitle}
      />

      <section className="publish-hero" aria-labelledby="publish-heading">
        <div>
          <div className="eyebrow">
            <UploadCloud size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1 id="publish-heading">{labels.title}</h1>
          <p>{labels.description}</p>
        </div>
        <div className="publish-hero__side">
          <div className="publish-hero__badge">
            <FileJson size={18} aria-hidden="true" />
            <span>{labels.badge}</span>
          </div>
          <div
            className="publish-hero__signals"
            aria-label={labels.signalLabel}
          >
            {labels.signals.map(([label, value], index) => {
              const Icon = signalIcons[index] ?? ClipboardCheck;

              return (
                <div key={label}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <JourneyRail
        actionHrefOverride={journeyActionHref}
        actionLabelOverride={accessNotice.actionLabel}
        currentStep="publish"
        journey="publisher"
        locale={locale}
      />

      <section className="publish-access-board">
        <WorkspaceAccessPanel
          locale={locale}
          requiredRoles={publisherRoles}
          session={session}
          workspace="publisher"
        />
      </section>

      <PublishForm
        access={accessNotice}
        apiUrl={apiUrl}
        labels={publishCopy.form}
        locale={locale}
      />

      <section
        className="publish-pipeline"
        aria-labelledby="publish-pipeline-heading"
      >
        <div className="publish-pipeline__head">
          <div>
            <div className="card-kicker">
              <BookOpenCheck size={16} aria-hidden="true" />
              <span>{labels.pipelineEyebrow}</span>
            </div>
            <h2 id="publish-pipeline-heading">{labels.pipelineTitle}</h2>
            <p>{labels.pipelineBody}</p>
          </div>
          <a
            className="secondary-button"
            href={localizedHref("/publisher", locale)}
          >
            <Gauge size={16} aria-hidden="true" />
            <span>{labels.publisherWorkspace}</span>
          </a>
        </div>
        <FlowStepList
          ariaLabel={labels.pipelineTitle}
          steps={labels.pipelineSteps.map((step, index) => {
            const Icon = stepIcons[index] ?? ListChecks;

            return {
              body: step.body,
              icon: <Icon size={16} aria-hidden="true" />,
              title: step.title,
            };
          })}
        />
        <StatusChip tone="neutral">{labels.badge}</StatusChip>
      </section>
    </main>
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
      actionHref: localizedHref("/publisher", locale),
      actionLabel:
        locale === "zh" ? "打开发布者工作台" : "Open publisher workspace",
      body:
        locale === "zh"
          ? "当前会话拥有发布权限，可以保存组织范围内的草稿。正式上架仍需要版本审核、运行检查、条款、定价和收款准备。"
          : "Your current session can save organization-scoped drafts. Public listing still requires version review, runtime checks, terms, pricing, and payout readiness.",
      canSubmit: true,
      title: locale === "zh" ? "发布权限已就绪" : "Publisher access ready",
    };
  }

  if (!hasSession) {
    return {
      actionHref: localizedHref("/login", locale),
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
    actionLabel: locale === "zh" ? "查看账号角色" : "Check account roles",
    body:
      locale === "zh"
        ? "当前会话已登录，但缺少 publisher、owner、admin 或 super_admin 角色。请到账号中心确认组织角色后再保存草稿。"
        : "You are signed in, but this workspace requires publisher, owner, admin, or super_admin access. Check your organization role before saving a draft.",
    canSubmit: false,
    title: locale === "zh" ? "需要发布者角色" : "Publisher role required",
  };
}
