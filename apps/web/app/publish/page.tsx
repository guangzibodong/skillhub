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
import { AppShell } from "@/components/app-shell";
import { JourneyRail } from "@/components/journey-rail";
import { FlowStepList, StatusChip } from "@/components/operational-status";
import { PublishForm } from "@/components/publish-form";
import { WorkspaceAccessPanel } from "@/components/workspace-access-panel";
import { getWorkspaceSession } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import { getPublishCopy } from "@/lib/publish-copy";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const publisherRoles = ["publisher", "owner", "admin", "super_admin"];

export default async function PublishPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
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
    <AppShell active="publish" locale={locale}>
      <section
        className="section pt-16 pb-12"
        aria-labelledby="publish-heading"
      >
        <div className="section-inner flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1">
            <div className="eyebrow">
              <UploadCloud size={16} aria-hidden="true" />
              <span>{labels.eyebrow}</span>
            </div>
            <h1 id="publish-heading" className="heading-xl mt-4">
              {labels.title}
            </h1>
            <p className="body-text mt-4 max-w-[600px]">
              {labels.description}
            </p>
          </div>
          <div className="flex flex-col gap-4 items-start">
            <div className="pill">
              <FileJson size={18} aria-hidden="true" />
              <span>{labels.badge}</span>
            </div>
            <div
              className="grid grid-cols-2 gap-3"
              aria-label={labels.signalLabel}
            >
              {labels.signals.map(([label, value], index) => {
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
      </section>

      <JourneyRail
        actionHrefOverride={journeyActionHref}
        actionLabelOverride={accessNotice.actionLabel}
        currentStep="publish"
        journey="publisher"
        locale={locale}
      />

      <section className="section py-8">
        <div className="section-inner">
          <WorkspaceAccessPanel
            locale={locale}
            requiredRoles={publisherRoles}
            session={session}
            workspace="publisher"
          />
        </div>
      </section>

      <PublishForm
        access={accessNotice}
        apiUrl={apiUrl}
        labels={publishCopy.form}
        locale={locale}
      />

      <section className="section py-16" aria-labelledby="publish-pipeline-heading">
        <div className="section-inner">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <div className="eyebrow">
                <BookOpenCheck size={16} aria-hidden="true" />
                <span>{labels.pipelineEyebrow}</span>
              </div>
              <h2
                id="publish-pipeline-heading"
                className="heading-lg mt-3"
              >
                {labels.pipelineTitle}
              </h2>
              <p className="body-text mt-3 max-w-[560px]">
                {labels.pipelineBody}
              </p>
            </div>
            <a
              className="btn-secondary"
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
          <div className="mt-6">
            <StatusChip tone="neutral">{labels.badge}</StatusChip>
          </div>
        </div>
      </section>
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
      actionHref: localizedHref("/publisher", locale),
      actionLabel:
        locale === "zh" ? "打开发布者工作台" : "Open publisher workspace",
      body:
        locale === "zh"
          ? "当前会话拥有发布权限，可以保存组织范围内的草稿。正式上架仍需要版本审核、运行检查、条款、定价和收款准备。"
          : "Your current session can save organization-scoped drafts. Public listing still requires version review and runtime checks; pricing and paid-readiness fields remain prelaunch metadata.",
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
