"use client";

import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  Gauge,
  KeyRound,
  ListChecks,
  LockKeyhole,
  PackageCheck,
  Send,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import {
  ActionResult,
  PreflightCheckList,
  RiskBadge,
  StatusChip,
} from "@/components/operational-status";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { analyzeManifestPreflight } from "@/lib/manifest-preflight";
import {
  publishSkillAction,
  type PublishSkillActionState,
} from "@/lib/publish-actions";
import type { PublishFormCopy } from "@/lib/publish-copy";
import {
  submitPublisherSkillReviewAction,
  type PublisherSkillActionState,
  type PublisherSkillReviewResult,
} from "@/lib/publisher-skill-actions";

type PublishFormProps = {
  access: PublishFormAccess;
  apiUrl: string;
  labels: PublishFormCopy;
  locale: Locale;
};

type PublishFormAccess = {
  actionHref: string;
  actionLabel: string;
  body: string;
  canSubmit: boolean;
  title: string;
};

const exampleManifest = {
  schemaVersion: "0.1",
  name: "email-brief",
  displayName: "Email Brief",
  version: "0.1.0",
  description:
    "Summarize long email threads into decisions, blockers, and next actions for autonomous agents.",
  author: {
    name: "SkillHub",
  },
  tags: ["email", "summary", "productivity"],
  runtime: {
    type: "http",
    entrypoint: "https://api.useskillhub.com/demo/email-brief",
  },
  permissions: {
    network: false,
    browser: false,
    filesystem: "none",
    secrets: [],
  },
  inputSchema: {
    type: "object",
    required: ["thread"],
    properties: {
      thread: { type: "string" },
    },
  },
  outputSchema: {
    type: "object",
    required: ["summary", "nextActions"],
    properties: {
      summary: { type: "string" },
      nextActions: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  examples: [
    {
      input: {
        thread: "Customer asks whether the contract renewal blocks rollout.",
      },
      output: {
        summary: "Renewal risk needs owner confirmation before rollout.",
        nextActions: ["Confirm renewal date", "Send rollout risk note"],
      },
    },
  ],
  support: {
    email: "support@useskillhub.com",
  },
};

const initialActionState: PublishSkillActionState = {
  message: "",
  status: "idle",
};

const initialReviewState: PublisherSkillActionState = {
  message: "",
  status: "idle",
};

const reviewCopy = {
  en: {
    alreadyOpenBody:
      "An open review already existed for this version, so SkillHub refreshed its automated evidence and publisher notification.",
    alreadyOpenLabel: "Open review refreshed",
    blocking: "Blocking",
    createdVersion: "New draft version",
    failed: "Failed",
    handoffBody:
      "This handoff is now visible in the publisher workspace, admin review queue, notification inbox, and audit stream.",
    handoffTitle: "Review handoff evidence",
    newReviewBody:
      "The version is queued for platform review with fresh automated evidence.",
    newReviewLabel: "New review queued",
    openAccount: "Account and terms",
    openPaid: "Paid-readiness metadata",
    openReview: "Review workbench",
    passed: "Passed",
    reviewId: "Review id",
    reviewErrorTitle: "Version was not submitted",
    reviewSuccessBody:
      "Automated manifest, runtime, example, and security checks were created for reviewer evidence.",
    reviewSuccessTitle: "Version submitted for review",
    risk: "Risk",
    status: "Status",
    submitReview: "Submit this version",
    submittingReview: "Submitting review",
    successBodyWithVersion:
      "Version {version} is saved as organization-owned draft state. You can submit it for review now or continue in the publisher workspace for pricing intent and prelaunch paid-readiness metadata.",
    total: "Total checks",
    updatedVersion: "Draft version updated",
    versionLabel: "Version",
    warnings: "Warnings",
  },
  zh: {
    alreadyOpenBody:
      "该版本已经有打开中的审核记录，SkillHub 已刷新自动检查证据和发布者通知。",
    alreadyOpenLabel: "已刷新打开中的审核",
    blocking: "阻塞",
    createdVersion: "\u65b0\u8349\u7a3f\u7248\u672c",
    failed: "失败",
    handoffBody:
      "这次交接现在会出现在发布者工作台、管理员审核队列、通知收件箱和审计流中。",
    handoffTitle: "审核交接证据",
    newReviewBody: "该版本已带着最新自动检查证据进入平台审核队列。",
    newReviewLabel: "新审核已排队",
    openAccount: "账号和条款",
    openPaid: "付费准备",
    openReview: "审核工作台",
    passed: "通过",
    reviewId: "审核 ID",
    reviewErrorTitle: "\u7248\u672c\u672a\u63d0\u4ea4",
    reviewSuccessBody:
      "\u5df2\u4e3a\u5ba1\u6838\u5458\u521b\u5efa manifest\u3001\u8fd0\u884c\u65f6\u3001\u793a\u4f8b\u548c\u5b89\u5168\u68c0\u67e5\u8bc1\u636e\u3002",
    reviewSuccessTitle: "\u7248\u672c\u5df2\u63d0\u4ea4\u5ba1\u6838",
    risk: "风险",
    status: "状态",
    submitReview: "\u63d0\u4ea4\u8be5\u7248\u672c",
    submittingReview: "\u63d0\u4ea4\u4e2d",
    successBodyWithVersion:
      "\u7248\u672c {version} \u5df2\u4fdd\u5b58\u4e3a\u7ec4\u7ec7\u62e5\u6709\u7684\u8349\u7a3f\u72b6\u6001\u3002\u4f60\u53ef\u4ee5\u73b0\u5728\u63d0\u4ea4\u5ba1\u6838\uff0c\u6216\u8fdb\u5165\u53d1\u5e03\u8005\u5de5\u4f5c\u53f0\u7ee7\u7eed\u5b9a\u4ef7\u548c\u5546\u4e1a\u51c6\u5907\u3002",
    total: "检查总数",
    updatedVersion: "\u8349\u7a3f\u7248\u672c\u5df2\u66f4\u65b0",
    versionLabel: "\u7248\u672c",
    warnings: "警告",
  },
} as const;

export function PublishForm({
  access,
  apiUrl,
  labels,
  locale,
}: PublishFormProps) {
  const reviewLabels = reviewCopy[locale];
  const [state, formAction, isPending] = useActionState(
    publishSkillAction.bind(null, locale),
    initialActionState,
  );
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    submitPublisherSkillReviewAction.bind(null, locale),
    initialReviewState,
  );
  const [manifestText, setManifestText] = useState(
    JSON.stringify(exampleManifest, null, 2),
  );
  const preflight = useMemo(
    () => analyzeManifestPreflight(manifestText, labels),
    [labels, manifestText],
  );
  const canSubmit = access.canSubmit && preflight.canSaveDraft && !isPending;
  const readinessTone =
    preflight.blockerCount > 0
      ? "danger"
      : preflight.warningCount > 0
        ? "warning"
        : "success";
  const attentionChecks = preflight.checks.filter(
    (check) => check.state !== "passed",
  );
  const evidenceRows = [
    [
      labels.evidencePacket.identity,
      `${preflight.slug} @ ${preflight.version}`,
    ],
    [
      labels.evidencePacket.runtime,
      `${preflight.runtime}: ${preflight.runtimeTarget}`,
    ],
    [labels.evidencePacket.schemas, String(preflight.schemaFieldCount)],
    [
      labels.evidencePacket.permissions,
      `${labels.evidencePacket.risk}: ${labels.risk[preflight.permissionRisk]} / ${labels.evidencePacket.secrets}: ${preflight.secretHandleCount}`,
    ],
    [
      labels.evidencePacket.reviewGate,
      `${preflight.blockerCount} ${labels.readiness.blockers} / ${preflight.warningCount} ${labels.readiness.warnings}`,
    ],
    [
      labels.evidencePacket.commercial,
      preflight.checks.find((check) => check.id === "commercial")?.detail ??
        labels.unknown,
    ],
  ];
  const lockedGuide = getLockedPublishGuide(locale);
  const PublishMainContainer: "form" | "div" = access.canSubmit
    ? "form"
    : "div";
  const publishMainProps = access.canSubmit
    ? { action: formAction, className: "publish-main" }
    : { className: "publish-main" };

  return (
    <section className="publish-grid" aria-label="Publish skill">
      <PublishMainContainer {...publishMainProps}>
        <div className="publish-card publish-access-card">
          <div className="publish-card__head">
            <div>
              <div className="card-kicker">
                <KeyRound size={16} aria-hidden="true" />
                <span>{labels.access.session}</span>
              </div>
              <h2>{labels.access.title}</h2>
            </div>
            <StatusChip
              icon={<LockKeyhole size={14} aria-hidden="true" />}
              tone="neutral"
            >
              httpOnly
            </StatusChip>
          </div>
          <p>{labels.access.body}</p>
          <div className="publish-access-grid">
            <div>
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{labels.access.session}</span>
              <strong>{labels.access.sessionDetail}</strong>
            </div>
            <div>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.access.api}</span>
              <code>{apiUrl}</code>
            </div>
          </div>
        </div>

        {!access.canSubmit ? (
          <ActionResult
            actions={
              <a className="secondary-button" href={access.actionHref}>
                <KeyRound size={16} aria-hidden="true" />
                <span>{access.actionLabel}</span>
              </a>
            }
            body={access.body}
            title={access.title}
            tone="warning"
          />
        ) : null}

        {access.canSubmit ? (
          <>
            <label className="manifest-editor">
              <span className="manifest-editor__label">
                <span>
                  <FileJson size={16} aria-hidden="true" />
                  {labels.manifestLabel}
                </span>
                <StatusChip
                  tone={
                    preflight.checks[0]?.state === "passed"
                      ? "success"
                      : "danger"
                  }
                >
                  {preflight.checks[0]?.state === "passed"
                    ? labels.editorHintValid
                    : labels.editorHintInvalid}
                </StatusChip>
              </span>
              <textarea
                aria-invalid={preflight.checks[0]?.state !== "passed"}
                disabled={!access.canSubmit}
                name="manifest"
                onChange={(event) => setManifestText(event.target.value)}
                spellCheck={false}
                value={manifestText}
              />
            </label>

            <div className="publish-actions">
              <button
                className="primary-button primary-button--large"
                disabled={!canSubmit}
                type="submit"
              >
                <Send size={18} aria-hidden="true" />
                <span>
                  {isPending ? labels.action.saving : labels.action.draftButton}
                </span>
              </button>
              <StatusChip tone={canSubmit ? "success" : "danger"}>
                {canSubmit
                  ? labels.action.ready
                  : access.canSubmit
                    ? labels.action.blocked
                    : access.title}
              </StatusChip>
            </div>

            {state.status === "success" && state.skillSlug ? (
              <>
                <input name="skillSlug" type="hidden" value={state.skillSlug} />
                {state.version ? (
                  <input name="version" type="hidden" value={state.version} />
                ) : null}
                <ActionResult
                  actions={
                    <>
                      {state.version ? (
                        <button
                          className="primary-button"
                          disabled={isReviewPending}
                          formAction={reviewAction}
                          type="submit"
                        >
                          <ClipboardCheck size={16} aria-hidden="true" />
                          <span>
                            {isReviewPending
                              ? reviewLabels.submittingReview
                              : reviewLabels.submitReview}
                          </span>
                        </button>
                      ) : null}
                      <a
                        className="secondary-button"
                        href={localizedHref(
                          "/publisher#publisher-skills",
                          locale,
                        )}
                      >
                        <Gauge size={16} aria-hidden="true" />
                        <span>{reviewLabels.openReview}</span>
                      </a>
                      <a
                        className="ghost-button"
                        href={localizedHref(
                          "/publisher#publisher-paid-readiness",
                          locale,
                        )}
                      >
                        <ShieldCheck size={16} aria-hidden="true" />
                        <span>{reviewLabels.openPaid}</span>
                      </a>
                    </>
                  }
                  body={formatSuccessBody(state, labels, reviewLabels)}
                  title={labels.result.successTitle}
                  tone="success"
                />
                <div className="publish-result-meta">
                  <span>
                    {reviewLabels.versionLabel}:{" "}
                    <strong>{state.version ?? labels.unknown}</strong>
                  </span>
                  <span>
                    {state.createdNewVersion
                      ? reviewLabels.createdVersion
                      : reviewLabels.updatedVersion}
                  </span>
                  {state.versionId ? (
                    <code>...{state.versionId.slice(-8)}</code>
                  ) : null}
                </div>
              </>
            ) : null}

            {state.status === "error" ? (
              <ActionResult
                body={state.message}
                title={labels.result.errorTitle}
                tone="danger"
              />
            ) : null}

            {reviewState.status === "success" ? (
              <>
                <ActionResult
                  actions={
                    <>
                      <a
                        className="secondary-button"
                        href={localizedHref(
                          "/publisher#publisher-skills",
                          locale,
                        )}
                      >
                        <ListChecks size={16} aria-hidden="true" />
                        <span>{reviewLabels.openReview}</span>
                      </a>
                      <a
                        className="ghost-button"
                        href={localizedHref(
                          "/publisher#publisher-paid-readiness",
                          locale,
                        )}
                      >
                        <Gauge size={16} aria-hidden="true" />
                        <span>{reviewLabels.openPaid}</span>
                      </a>
                      <a
                        className="ghost-button"
                        href={localizedHref(
                          "/publisher#publisher-account",
                          locale,
                        )}
                      >
                        <ShieldCheck size={16} aria-hidden="true" />
                        <span>{reviewLabels.openAccount}</span>
                      </a>
                    </>
                  }
                  body={formatReviewSuccessBody(
                    reviewState.review,
                    reviewLabels,
                  )}
                  title={reviewLabels.reviewSuccessTitle}
                  tone="success"
                />
                {reviewState.review ? (
                  <ReviewHandoffEvidence
                    labels={reviewLabels}
                    locale={locale}
                    review={reviewState.review}
                  />
                ) : null}
              </>
            ) : null}

            {reviewState.status === "error" ? (
              <ActionResult
                body={reviewState.message}
                title={reviewLabels.reviewErrorTitle}
                tone="danger"
              />
            ) : null}
          </>
        ) : null}
      </PublishMainContainer>

      {access.canSubmit ? (
        <aside className="review-panel" aria-label="Manifest review">
          <div className="review-panel__head">
            <div className="review-panel__icon" aria-hidden="true">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2>{labels.reviewTitle}</h2>
              <p>{labels.reviewBody}</p>
            </div>
          </div>

          <div className={`preflight-score preflight-score--${readinessTone}`}>
            <div>
              <span>{labels.readiness.label}</span>
              <strong>{preflight.readinessLabel}</strong>
            </div>
            <b>{preflight.score}%</b>
          </div>

          <div
            className="preflight-counts"
            aria-label={labels.readiness.countsLabel}
          >
            <div>
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>{labels.readiness.passed}</span>
              <strong>{preflight.passedCount}</strong>
            </div>
            <div>
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{labels.readiness.warnings}</span>
              <strong>{preflight.warningCount}</strong>
            </div>
            <div>
              <XCircle size={15} aria-hidden="true" />
              <span>{labels.readiness.blockers}</span>
              <strong>{preflight.blockerCount}</strong>
            </div>
          </div>

          <dl className="manifest-summary">
            <div>
              <dt>{labels.summary.package}</dt>
              <dd>{preflight.displayName}</dd>
            </div>
            <div>
              <dt>{labels.summary.slug}</dt>
              <dd>{preflight.slug}</dd>
            </div>
            <div>
              <dt>{labels.summary.runtime}</dt>
              <dd>{preflight.runtime}</dd>
            </div>
            <div>
              <dt>{labels.summary.version}</dt>
              <dd>{preflight.version}</dd>
            </div>
            <div>
              <dt>{labels.summary.tags}</dt>
              <dd>{preflight.tagCount}</dd>
            </div>
            <div>
              <dt>{labels.risk.label}</dt>
              <dd>
                <RiskBadge
                  label={labels.risk[preflight.permissionRisk]}
                  level={preflight.permissionRisk}
                />
              </dd>
            </div>
          </dl>

          <PreflightCheckList checks={preflight.checks} />

          <div className="publish-repair-queue">
            <div className="card-kicker">
              <Wrench size={15} aria-hidden="true" />
              <span>{labels.repairQueue.title}</span>
            </div>
            <p>{labels.repairQueue.body}</p>
            <div className="publish-repair-list">
              {attentionChecks.length > 0 ? (
                attentionChecks.map((check) => (
                  <div
                    className={`publish-repair-row publish-repair-row--${check.state}`}
                    key={check.id}
                  >
                    {check.state === "blocked" ? (
                      <XCircle size={15} aria-hidden="true" />
                    ) : (
                      <AlertTriangle size={15} aria-hidden="true" />
                    )}
                    <div>
                      <span>
                        {check.state === "blocked"
                          ? labels.repairQueue.blocker
                          : labels.repairQueue.warning}
                      </span>
                      <strong>{check.label}</strong>
                      <small>{check.repairAction}</small>
                      <code>
                        {labels.repairQueue.target}: {check.target}
                      </code>
                    </div>
                  </div>
                ))
              ) : (
                <div className="publish-repair-empty">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <div>
                    <strong>{labels.repairQueue.emptyTitle}</strong>
                    <span>{labels.repairQueue.emptyBody}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="publish-evidence-packet">
            <div className="card-kicker">
              <PackageCheck size={15} aria-hidden="true" />
              <span>{labels.evidencePacket.title}</span>
            </div>
            <p>{labels.evidencePacket.body}</p>
            <div className="publish-evidence-grid">
              {evidenceRows.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="publish-next-card">
            <div className="card-kicker">
              <Gauge size={15} aria-hidden="true" />
              <span>{labels.nextActionsTitle}</span>
            </div>
            {labels.nextActions.map(([title, detail], index) => (
              <div className="publish-next-row" key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
              </div>
            ))}
          </div>
        </aside>
      ) : (
        <aside
          className="review-panel publish-locked-guide"
          aria-label={lockedGuide.ariaLabel}
        >
          <div className="review-panel__head">
            <div className="review-panel__icon" aria-hidden="true">
              <LockKeyhole size={20} />
            </div>
            <div>
              <h2>{lockedGuide.title}</h2>
              <p>{lockedGuide.body}</p>
            </div>
          </div>

          <div className="publish-locked-guide__steps">
            {lockedGuide.steps.map((step, index) => {
              const Icon = [KeyRound, ShieldCheck, FileJson][index] ?? Gauge;

              return (
                <div className="publish-locked-guide__step" key={step.title}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.body}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <a
            className="primary-button primary-button--large publish-locked-guide__cta"
            href={access.actionHref}
          >
            <KeyRound size={17} aria-hidden="true" />
            <span>{access.actionLabel}</span>
          </a>
          <p className="publish-locked-guide__note">{lockedGuide.note}</p>
        </aside>
      )}
    </section>
  );
}

function getLockedPublishGuide(locale: Locale) {
  if (locale === "zh") {
    return {
      ariaLabel: "发布入口准入说明",
      body: "未登录或缺少发布者角色时，先不要填写 manifest。完成账号和角色确认后，系统会显示预检、草稿保存和版本提交流程。",
      note: "登录前不会收集 manifest、管理员 token、服务 token 或 OAuth 密钥。",
      steps: [
        {
          body: "使用 Google、GitHub、邮箱/密码或邀请恢复入口进入账号。",
          title: "登录账号",
        },
        {
          body: "在个人中心确认组织和 publisher / owner / admin 权限。",
          title: "确认发布权限",
        },
        {
          body: "权限就绪后再粘贴 skillhub.json，保存草稿并提交版本审核。",
          title: "进入预检和审核",
        },
      ],
      title: "先完成账号准入，再开始上传。",
    };
  }

  return {
    ariaLabel: "Publish access guidance",
    body: "Do not paste a manifest until the account and publisher role are ready. After access is confirmed, this page shows preflight, draft save, and version review handoff.",
    note: "Before sign-in, SkillHub does not collect manifests, admin tokens, service tokens, or OAuth secrets.",
    steps: [
      {
        body: "Use Google, GitHub, email/password, or an invite recovery entry.",
        title: "Sign in",
      },
      {
        body: "Confirm your organization and publisher / owner / admin role from the account center.",
        title: "Confirm publisher access",
      },
      {
        body: "Paste skillhub.json, save a draft, and submit the exact version for review.",
        title: "Continue to preflight",
      },
    ],
    title: "Finish account access before uploading.",
  };
}

function ReviewHandoffEvidence({
  labels,
  locale,
  review,
}: {
  labels: (typeof reviewCopy)["en"] | (typeof reviewCopy)["zh"];
  locale: Locale;
  review: PublisherSkillReviewResult;
}) {
  const summary = review.checkSummary;
  const tone =
    summary && (summary.blockingCount > 0 || summary.failedCount > 0)
      ? "danger"
      : summary && summary.warningCount > 0
        ? "warning"
        : "success";
  const reviewLabel = review.alreadyOpen
    ? labels.alreadyOpenLabel
    : labels.newReviewLabel;
  const reviewBody = review.alreadyOpen
    ? labels.alreadyOpenBody
    : labels.newReviewBody;

  return (
    <div className="publish-review-handoff">
      <div className="publish-review-handoff__head">
        <div>
          <div className="card-kicker">
            <BellRing size={15} aria-hidden="true" />
            <span>{labels.handoffTitle}</span>
          </div>
          <p>{reviewBody}</p>
        </div>
        <StatusChip tone={tone}>{reviewLabel}</StatusChip>
      </div>

      <div className="publish-review-handoff__meta">
        <span>
          {labels.status}: <strong>{review.status ?? "queued"}</strong>
        </span>
        <span>
          {labels.risk}: <strong>{review.riskLevel ?? "unknown"}</strong>
        </span>
        {review.id ? (
          <code>
            {labels.reviewId}: ...{review.id.slice(-8)}
          </code>
        ) : null}
      </div>

      {summary ? (
        <div
          className="publish-review-check-grid"
          aria-label={labels.handoffTitle}
        >
          <ReviewCheckMetric label={labels.total} value={summary.totalCount} />
          <ReviewCheckMetric
            label={labels.passed}
            value={summary.passedCount}
          />
          <ReviewCheckMetric
            label={labels.warnings}
            value={summary.warningCount}
          />
          <ReviewCheckMetric
            label={labels.failed}
            value={summary.failedCount}
          />
          <ReviewCheckMetric
            label={labels.blocking}
            value={summary.blockingCount}
          />
        </div>
      ) : null}

      <div className="publish-review-handoff__links">
        <a
          className="secondary-button secondary-button--compact"
          href={localizedHref("/publisher#publisher-skills", locale)}
        >
          <ListChecks size={15} aria-hidden="true" />
          <span>{labels.openReview}</span>
        </a>
        <a
          className="ghost-button"
          href={localizedHref("/publisher#publisher-paid-readiness", locale)}
        >
          <Gauge size={15} aria-hidden="true" />
          <span>{labels.openPaid}</span>
        </a>
        <a
          className="ghost-button"
          href={localizedHref("/publisher#publisher-account", locale)}
        >
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{labels.openAccount}</span>
        </a>
      </div>
    </div>
  );
}

function ReviewCheckMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatSuccessBody(
  state: PublishSkillActionState,
  labels: PublishFormCopy,
  reviewLabels: (typeof reviewCopy)["en"] | (typeof reviewCopy)["zh"],
) {
  if (!state.version) {
    return labels.result.successBody;
  }

  return reviewLabels.successBodyWithVersion.replace(
    "{version}",
    state.version,
  );
}

function formatReviewSuccessBody(
  review: PublisherSkillReviewResult | undefined,
  labels: (typeof reviewCopy)["en"] | (typeof reviewCopy)["zh"],
) {
  if (!review) {
    return labels.reviewSuccessBody;
  }

  return review.alreadyOpen ? labels.alreadyOpenBody : labels.newReviewBody;
}
