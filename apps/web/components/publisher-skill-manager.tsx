"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileJson,
  GitBranch,
  History,
  Megaphone,
  MessageSquareText,
  PackageCheck,
  Save,
  Send,
  ShieldCheck,
  Star,
  XCircle
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PublisherCommercialBlocker, PublisherSkillRecord, PublisherSkillVersionRecord, ReviewSlaStatus } from "@/lib/ops-data";
import { formatCompactNumber, formatMoney, formatPercent } from "@/lib/ops-format";
import {
  getPublisherFeedbackResponseCopy,
  getPublisherMarketplaceCopy,
  getPublisherSkillCopy,
  type PublisherFeedbackResponseCopy,
  type PublisherSkillCopy
} from "@/lib/publisher-skill-copy";
import {
  requestMarketplaceCurationAppealAction,
  respondToSkillFeedbackAction,
  savePublisherSkillVersionAction,
  setPublisherSkillPriceAction,
  submitPublisherSkillReviewAction,
  type PublisherSkillActionState
} from "@/lib/publisher-skill-actions";

type PublisherSkillManagerProps = {
  locale: Locale;
  skills: PublisherSkillRecord[];
};

const copy = {
  en: {
    billingModel: "Billing model",
    billingModels: {
      free: "Free",
      per_call: "Per call",
      subscription: "Subscription"
    },
    calls: "Calls",
    checks: "Review checks",
    checkLabels: {
      example: "Example",
      manifest: "Manifest",
      runtime: "Runtime",
      security: "Security"
    },
    checkStatusLabels: {
      failed: "Failed",
      passed: "Passed",
      queued: "Queued",
      running: "Running",
      warning: "Warning"
    },
    currency: "Currency",
    empty: "No publisher skills yet. Publish a manifest first, then return here to submit review and set pricing.",
    feedback: "Published / pending",
    installs: "Installs",
    priceStatus: "Price status",
    priceStatuses: {
      active: "Active",
      archived: "Archived",
      draft: "Draft"
    },
    quality: "Quality",
    rating: "Rating",
    reviewStatuses: {
      approved: "Approved",
      blocked: "Blocked",
      in_review: "In review",
      no_review: "No review",
      queued: "Queued",
      rejected: "Rejected"
    },
    savePrice: "Save price",
    saving: "Saving",
    submitReview: "Submit review",
    submitting: "Submitting",
    successRate: "Success",
    title: "Publisher skill operations",
    unitAmount: "Unit amount (cents)",
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    },
    versions: {
      calls: "calls",
      created: "Created",
      draftHelp: "Save a new semantic version or update an unlocked draft. Approved or installed versions are locked.",
      editorLabel: "Editable manifest",
      editorTitle: "Create or update a version",
      history: "Version history",
      installs: "installs",
      locked: "Locked after review or installs",
      reviewNotes: "Review notes",
      save: "Save version",
      saving: "Saving version",
      submit: "Submit this version",
      title: "Version manager",
      versionCount: "versions",
      statuses: {
        draft: "Draft",
        rejected: "Rejected",
        submitted: "Submitted",
        suspended: "Suspended",
        verified: "Verified"
      }
    }
  },
  zh: {
    billingModel: "计费模式",
    billingModels: {
      free: "免费",
      per_call: "按次调用",
      subscription: "订阅"
    },
    calls: "调用",
    checks: "审核检查",
    checkLabels: {
      example: "示例",
      manifest: "清单",
      runtime: "运行",
      security: "安全"
    },
    checkStatusLabels: {
      failed: "失败",
      passed: "通过",
      queued: "排队",
      running: "运行中",
      warning: "警告"
    },
    currency: "币种",
    empty: "还没有发布者技能。先发布一个 manifest，然后回到这里提交审核并设置价格。",
    feedback: "已公开 / 待审",
    installs: "安装",
    priceStatus: "价格状态",
    priceStatuses: {
      active: "启用",
      archived: "归档",
      draft: "草稿"
    },
    quality: "质量",
    rating: "评分",
    reviewStatuses: {
      approved: "已批准",
      blocked: "已阻断",
      in_review: "审核中",
      no_review: "未提交审核",
      queued: "排队中",
      rejected: "已拒绝"
    },
    savePrice: "保存价格",
    saving: "保存中",
    submitReview: "提交审核",
    submitting: "提交中",
    successRate: "成功率",
    title: "发布者技能运营",
    unitAmount: "单价（分）",
    verificationStatuses: {
      deprecated: "已弃用",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    },
    versions: {
      calls: "次调用",
      created: "创建时间",
      draftHelp: "保存新的语义化版本，或更新尚未审核/安装的草稿版本。已审核或已安装版本会被锁定。",
      editorLabel: "可编辑 manifest",
      editorTitle: "创建或更新版本",
      history: "版本历史",
      installs: "次安装",
      locked: "审核或安装后锁定",
      reviewNotes: "审核备注",
      save: "保存版本",
      saving: "保存版本中",
      submit: "提交该版本",
      title: "版本管理",
      versionCount: "个版本",
      statuses: {
        draft: "草稿",
        rejected: "已拒绝",
        submitted: "已提交",
        suspended: "已暂停",
        verified: "已验证"
      }
    }
  }
} as const;

const marketplaceCopy = {
  en: {
    activeAppeal: "Latest review request",
    appealReason: "Review note",
    appealStatuses: {
      approved: "Approved",
      closed: "Closed",
      open: "Open",
      rejected: "Rejected",
      under_review: "Under review"
    },
    evidenceUrl: "Evidence URL",
    expires: "Expires",
    hintLabels: {
      collect_feedback: "Collect published feedback",
      drive_first_installs: "Drive first installs",
      eligible_for_distribution: "Eligible for stronger distribution",
      fix_runtime_checks: "Fix failed review checks",
      maintain_quality: "Maintain quality signals",
      make_public: "Make listing public",
      moderate_feedback: "Clear pending feedback",
      raise_success_rate: "Raise runtime success rate",
      resolve_incidents: "Resolve open incidents",
      stabilize_runtime: "Stabilize runtime checks",
      submit_review: "Submit for review"
    },
    marketplace: "Marketplace distribution",
    placementLabels: {
      featured: "Featured",
      standard: "Standard",
      suppressed: "Suppressed"
    },
    reasonPlaceholder: "Summarize fixes, new evidence, buyer demand, or why the listing deserves reconsideration.",
    requestReview: "Request review",
    requestedPlacement: "Requested placement",
    requesting: "Requesting"
  },
  zh: {
    activeAppeal: "最新复审申请",
    appealReason: "复审说明",
    appealStatuses: {
      approved: "已通过",
      closed: "已关闭",
      open: "已提交",
      rejected: "已拒绝",
      under_review: "复审中"
    },
    evidenceUrl: "证据链接",
    expires: "到期",
    hintLabels: {
      collect_feedback: "获取已发布反馈",
      drive_first_installs: "推动首批安装",
      eligible_for_distribution: "可以获得更强分发",
      fix_runtime_checks: "修复失败的审核检查",
      maintain_quality: "继续保持质量信号",
      make_public: "将技能设为公开",
      moderate_feedback: "处理待审反馈",
      raise_success_rate: "提高运行成功率",
      resolve_incidents: "解决未关闭事故",
      stabilize_runtime: "稳定运行检查",
      submit_review: "提交审核"
    },
    marketplace: "市场分发",
    placementLabels: {
      featured: "精选",
      standard: "标准",
      suppressed: "降权"
    },
    reasonPlaceholder: "说明修复内容、新证据、买方需求，或为什么值得重新评估。",
    requestReview: "申请复审",
    requestedPlacement: "目标分发",
    requesting: "提交中"
  }
} as const;

const commercialCopy = {
  en: {
    blocked: "Blocked",
    blockerLabels: {
      current_terms: "Accept current terms",
      payout: "Verify paid-readiness metadata",
      publisher_profile: "Create publisher profile",
      publisher_status: "Reactivate publisher profile",
      review: "Pass skill review",
      terms: "Accept operating terms"
    },
    help: "Required before a per-call or subscription price can enter paid-marketplace preview review.",
    ready: "Ready",
    title: "Paid-preview gate"
  },
  zh: {
    blocked: "\u672a\u5c31\u7eea",
    blockerLabels: {
      current_terms: "\u63a5\u53d7\u5f53\u524d\u6761\u6b3e",
      payout: "\u5b8c\u6210\u4ed8\u8d39\u51c6\u5907\u590d\u6838",
      publisher_profile: "\u521b\u5efa\u53d1\u5e03\u8005\u8d44\u6599",
      publisher_status: "\u6062\u590d\u53d1\u5e03\u8005\u8d44\u6599",
      review: "\u901a\u8fc7\u6280\u80fd\u5ba1\u6838",
      terms: "\u63a5\u53d7\u8fd0\u8425\u6761\u6b3e"
    },
    help: "\u6309\u6b21\u8c03\u7528\u6216\u8ba2\u9605\u4ef7\u683c\u8fdb\u5165\u4ed8\u8d39\u5e02\u573a\u9884\u89c8\u590d\u6838\u524d\u5fc5\u987b\u5b8c\u6210\u3002",
    ready: "\u5df2\u5c31\u7eea",
    title: "\u4ed8\u8d39\u9884\u89c8\u95e8\u7981"
  }
} as const;

const feedbackResponseCopy = {
  en: {
    buyer: "Buyer",
    empty: "No published buyer feedback is ready for a publisher response yet.",
    project: "Project",
    publisherResponse: "Publisher response",
    recentFeedback: "Recent buyer feedback",
    responsePlaceholder: "Respond with the fix, roadmap note, support guidance, or contract clarification buyers should see.",
    responded: "Responded",
    saveResponse: "Save response",
    savingResponse: "Saving",
    useCase: "Use case"
  },
  zh: {
    buyer: "买方",
    empty: "暂时没有可回复的公开买家反馈。",
    project: "项目",
    publisherResponse: "发布者回复",
    recentFeedback: "最近买家反馈",
    responsePlaceholder: "说明修复进展、路线图、支持建议，或买家需要看到的协议澄清。",
    responded: "已回复",
    saveResponse: "保存回复",
    savingResponse: "保存中",
    useCase: "使用场景"
  }
} as const;

const initialState: PublisherSkillActionState = {
  message: "",
  status: "idle"
};

type PublisherRuntimeCheck = NonNullable<PublisherSkillRecord["runtime"]["checks"]>[number];
type ReviewRepairActionKey = keyof PublisherSkillCopy["reviewRepair"]["actionLabels"];
type ReviewRepairTone = "danger" | "neutral" | "ready" | "warning";

type ReviewRepairPlan = {
  actionKeys: ReviewRepairActionKey[];
  decidedAt: string | null;
  failedChecks: PublisherRuntimeCheck[];
  latestVersion?: PublisherSkillVersionRecord;
  notes: string | null;
  openChecks: PublisherRuntimeCheck[];
  openVersionWorkbench: boolean;
  passedChecks: PublisherRuntimeCheck[];
  queueAgeHours: number | null;
  slaDueAt: string | null;
  slaHoursRemaining: number | null;
  slaStatus: ReviewSlaStatus | string | null;
  status: string | null;
  submittedAt: string | null;
  tone: ReviewRepairTone;
  warningChecks: PublisherRuntimeCheck[];
};

export function PublisherSkillManager({ locale, skills }: PublisherSkillManagerProps) {
  const labels = getPublisherSkillCopy(locale);

  return (
    <article className="ops-panel publisher-skill-panel" id="publisher-skills">
      <div className="publisher-skill-panel__head">
        <div className="card-kicker">
          <PackageCheck size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className="status-chip status-chip--neutral">{skills.length}</span>
      </div>

      {skills.length > 0 ? (
        <div className="publisher-skill-list">
          {skills.slice(0, 8).map((skill) => (
            <PublisherSkillCard key={skill.id} labels={labels} locale={locale} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="publisher-skill-empty">{labels.empty}</div>
      )}
    </article>
  );
}

function PublisherSkillCard({
  labels,
  locale,
  skill
}: {
  labels: PublisherSkillCopy;
  locale: Locale;
  skill: PublisherSkillRecord;
}) {
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    submitPublisherSkillReviewAction.bind(null, locale),
    initialState
  );
  const [versionState, versionAction, isVersionPending] = useActionState(
    savePublisherSkillVersionAction.bind(null, locale),
    initialState
  );
  const [priceState, priceAction, isPricePending] = useActionState(
    setPublisherSkillPriceAction.bind(null, locale),
    initialState
  );
  const [appealState, appealAction, isAppealPending] = useActionState(
    requestMarketplaceCurationAppealAction.bind(null, locale),
    initialState
  );
  const [feedbackResponseState, feedbackResponseAction, isFeedbackResponsePending] = useActionState(
    respondToSkillFeedbackAction.bind(null, locale),
    initialState
  );
  const marketplaceLabels = getPublisherMarketplaceCopy(locale);
  const commercialLabels = commercialCopy[locale];
  const feedbackLabels = getPublisherFeedbackResponseCopy(locale);
  const versions = skill.versions ?? [];
  const latestVersion = versions[0];
  const [selectedBillingModel, setSelectedBillingModel] = useState(skill.pricing.billingModel);
  const [selectedPriceStatus, setSelectedPriceStatus] = useState(skill.pricing.status);
  const isInReview = skill.review.status === "queued" || skill.review.status === "in_review";
  const activeAppeal =
    skill.marketplace?.appeal && ["open", "under_review"].includes(skill.marketplace.appeal.status)
      ? skill.marketplace.appeal
      : null;
  const reviewMessageVisible = reviewState.skillSlug === skill.slug && reviewState.status !== "idle";
  const versionMessageVisible = versionState.skillSlug === skill.slug && versionState.status !== "idle";
  const priceMessageVisible = priceState.skillSlug === skill.slug && priceState.status !== "idle";
  const appealMessageVisible = appealState.skillSlug === skill.slug && appealState.status !== "idle";
  const feedbackResponseMessageVisible =
    feedbackResponseState.skillSlug === skill.slug && feedbackResponseState.status !== "idle";
  const nextOperatingStep = getNextOperatingStep(skill, labels);
  const reviewRepairPlan = buildReviewRepairPlan(skill);
  const commercialActivationBlocked = Boolean(skill.commercial && !skill.commercial.paidActivationReady);
  const paidPricingBlocked = commercialActivationBlocked && selectedBillingModel !== "free";
  const pricePreview =
    selectedBillingModel === "free"
      ? labels.pricingGate.freePreview
      : `${formatMoney(skill.pricing.unitAmountCents, skill.analytics.currency)} / ${labels.billingModels[selectedBillingModel]}`;

  useEffect(() => {
    if (paidPricingBlocked && selectedPriceStatus === "active") {
      setSelectedPriceStatus("draft");
    }
  }, [paidPricingBlocked, selectedPriceStatus]);

  return (
    <div className="publisher-skill-card">
      <div className="publisher-skill-card__top">
        <div>
          <strong>{skill.displayName}</strong>
          <span>
            {skill.slug} / {skill.version ?? labels.verificationStatuses.draft}
          </span>
        </div>
        <span className={statusClass(skill.verificationStatus)}>
          {formatVerificationStatus(skill.verificationStatus, labels.verificationStatuses)}
        </span>
      </div>

      <div className="publisher-skill-metrics">
        <Metric icon={<PackageCheck size={15} aria-hidden="true" />} label={labels.installs} value={formatCompactNumber(skill.analytics.installCount)} />
        <Metric icon={<BarChart3 size={15} aria-hidden="true" />} label={labels.calls} value={formatCompactNumber(skill.analytics.callCount)} />
        <Metric icon={<CheckCircle2 size={15} aria-hidden="true" />} label={labels.successRate} value={formatPercent(skill.analytics.successRate)} />
        <Metric icon={<Star size={15} aria-hidden="true" />} label={labels.rating} value={formatRating(skill.feedback?.averageRating)} />
        <Metric icon={<MessageSquareText size={15} aria-hidden="true" />} label={labels.feedback} value={formatFeedbackCounts(skill.feedback)} />
        <Metric icon={<CircleDollarSign size={15} aria-hidden="true" />} label={labels.unitAmount} value={formatMoney(skill.pricing.unitAmountCents, skill.analytics.currency)} />
      </div>

      <div className="publisher-skill-quality">
        <strong>{labels.quality}</strong>
        <div>
          {skill.quality.checklist.slice(0, 4).map((item) => (
            <span className={qualityClass(item.status)} key={item.key}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="publisher-skill-next-step">
        <strong>
          <ClipboardCheck size={15} aria-hidden="true" />
          {labels.nextStep.title}
        </strong>
        <span>{nextOperatingStep}</span>
      </div>

      <ReviewRepairPanel labels={labels} locale={locale} plan={reviewRepairPlan} />

      <details className="publisher-skill-version-workbench" open={reviewRepairPlan.openVersionWorkbench}>
        <summary>
          <span>
            <History size={15} aria-hidden="true" />
            {labels.versions.title}
          </span>
          <strong>
            {versions.length} {labels.versions.versionCount}
          </strong>
        </summary>

        <div className="publisher-skill-version-layout">
          <div className="publisher-skill-version-history" aria-label={labels.versions.history}>
            {versions.length > 0 ? (
              versions.map((version) => (
                <VersionRow
                  key={version.id}
                  isPending={isReviewPending}
                  labels={labels}
                  locale={locale}
                  reviewAction={reviewAction}
                  skillSlug={skill.slug}
                  version={version}
                />
              ))
            ) : (
              <div className="publisher-skill-version-empty">{labels.versions.draftHelp}</div>
            )}
          </div>

          <form action={versionAction} className="publisher-skill-version-form">
            <input name="skillSlug" type="hidden" value={skill.slug} />
            <div className="publisher-skill-version-form__head">
              <strong>
                <FileJson size={15} aria-hidden="true" />
                {labels.versions.editorTitle}
              </strong>
              <span>{labels.versions.draftHelp}</span>
            </div>
            <label>
              <span>{labels.versions.editorLabel}</span>
              <textarea defaultValue={buildEditableManifest(skill, latestVersion)} name="manifest" rows={10} spellCheck={false} />
            </label>
            <button className="secondary-button" disabled={isVersionPending} type="submit">
              <Save size={16} aria-hidden="true" />
              <span>{isVersionPending ? labels.versions.saving : labels.versions.save}</span>
            </button>
          </form>
        </div>
        {versionMessageVisible ? <ActionMessage state={versionState} /> : null}
      </details>

      {skill.marketplace ? (
        <div className="publisher-skill-marketplace">
          <div className="publisher-skill-marketplace__head">
            <strong>
              <Megaphone size={15} aria-hidden="true" />
              {marketplaceLabels.marketplace}
            </strong>
            <span className={marketplaceClass(skill.marketplace.placement)}>
              {formatPlacement(skill.marketplace.placement, marketplaceLabels.placementLabels)}
            </span>
          </div>
          {skill.marketplace.reason ? <p>{skill.marketplace.reason}</p> : null}
          <div className="publisher-skill-hints">
            {skill.marketplace.improvementHints.map((hint) => (
              <span className={hintClass(hint.severity)} key={`${skill.id}-${hint.key}`}>
                {formatHintLabel(hint.key, marketplaceLabels.hintLabels)}
              </span>
            ))}
          </div>
          {skill.marketplace.endsAt ? (
            <small className="publisher-skill-marketplace__date">
              {marketplaceLabels.expires}: {formatDate(skill.marketplace.endsAt, locale)}
            </small>
          ) : null}
          {skill.marketplace.appeal ? (
            <div className="publisher-skill-appeal-status">
              <strong>{marketplaceLabels.activeAppeal}</strong>
              <span className={appealStatusClass(skill.marketplace.appeal.status)}>
                {formatAppealStatus(skill.marketplace.appeal.status, marketplaceLabels.appealStatuses)}
              </span>
              <small>
                {formatPlacement(skill.marketplace.appeal.currentPlacement, marketplaceLabels.placementLabels)}
                {" -> "}
                {formatPlacement(skill.marketplace.appeal.requestedPlacement, marketplaceLabels.placementLabels)}
              </small>
              {skill.marketplace.appeal.operatorReason ? <p>{skill.marketplace.appeal.operatorReason}</p> : null}
              <small>SLA: {formatDate(skill.marketplace.appeal.slaDueAt, locale)}</small>
            </div>
          ) : null}
          <form action={appealAction} className="publisher-skill-appeal-form">
            <input name="skillSlug" type="hidden" value={skill.slug} />
            <label>
              <span>{marketplaceLabels.requestedPlacement}</span>
              <select defaultValue={skill.marketplace.placement === "suppressed" ? "standard" : "featured"} disabled={Boolean(activeAppeal)} name="requestedPlacement">
                <option value="standard">{marketplaceLabels.placementLabels.standard}</option>
                <option value="featured">{marketplaceLabels.placementLabels.featured}</option>
              </select>
            </label>
            <label className="publisher-skill-appeal-form__wide">
              <span>{marketplaceLabels.appealReason}</span>
              <textarea
                disabled={Boolean(activeAppeal)}
                name="appealReason"
                placeholder={marketplaceLabels.reasonPlaceholder}
                required
                rows={2}
              />
            </label>
            <label>
              <span>{marketplaceLabels.evidenceUrl}</span>
              <input disabled={Boolean(activeAppeal)} name="evidenceUrl" placeholder="https://" type="url" />
            </label>
            <button className="secondary-button secondary-button--compact" disabled={Boolean(activeAppeal) || isAppealPending} type="submit">
              <Send size={15} aria-hidden="true" />
              <span>{isAppealPending ? marketplaceLabels.requesting : marketplaceLabels.requestReview}</span>
            </button>
          </form>
          {appealMessageVisible ? <ActionMessage state={appealState} /> : null}
        </div>
      ) : null}

      <PublisherFeedbackResponsePanel
        action={feedbackResponseAction}
        isPending={isFeedbackResponsePending}
        labels={feedbackLabels}
        locale={locale}
        messageState={feedbackResponseMessageVisible ? feedbackResponseState : null}
        skill={skill}
      />

      {skill.runtime.checks?.length ? (
        <div className="publisher-skill-checks" aria-label={labels.checks}>
          <strong>{labels.checks}</strong>
          <div className="publisher-skill-check-list">
            {skill.runtime.checks.map((check) => (
              <div className="publisher-skill-check" key={`${skill.id}-${check.checkType}`}>
                <span className={checkStatusClass(check.status)}>{formatCheckStatus(check.status, labels)}</span>
                <strong>{formatCheckType(check.checkType, labels)}</strong>
                <small>{check.message ?? check.status}</small>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form action={reviewAction} className="publisher-skill-review-form">
        <input name="skillSlug" type="hidden" value={skill.slug} />
        {skill.version ? <input name="version" type="hidden" value={skill.version} /> : null}
        <button className="secondary-button" disabled={isReviewPending || isInReview} type="submit">
          <Send size={16} aria-hidden="true" />
          <span>{isReviewPending ? labels.submitting : labels.submitReview}</span>
        </button>
        <span className="publisher-skill-review-state">
          <ClipboardCheck size={15} aria-hidden="true" />
          {formatReviewStatus(skill.review.status, labels.reviewStatuses)}
        </span>
      </form>

      {reviewMessageVisible ? <ActionMessage state={reviewState} /> : null}

      {skill.commercial ? (
        <CommercialReadinessPanel commercial={skill.commercial} labels={commercialLabels} />
      ) : null}

      <div className={paidPricingBlocked ? "publisher-skill-price-gate publisher-skill-price-gate--blocked" : "publisher-skill-price-gate"}>
        <div>
          <strong>{labels.pricingGate.title}</strong>
          <span className={paidPricingBlocked ? "status-chip status-chip--warning" : "status-chip"}>
            {paidPricingBlocked ? commercialLabels.blocked : labels.pricingGate.ready}
          </span>
        </div>
        <p>{paidPricingBlocked ? labels.pricingGate.activeBlocked : labels.pricingGate.draftSafe}</p>
        <code>
          {labels.pricingGate.preview}: {pricePreview}
        </code>
      </div>

      <form action={priceAction} className="publisher-skill-price-form">
        <input name="skillSlug" type="hidden" value={skill.slug} />
        <label>
          <span>{labels.billingModel}</span>
          <select
            name="billingModel"
            onChange={(event) => setSelectedBillingModel(event.target.value as PublisherSkillRecord["pricing"]["billingModel"])}
            value={selectedBillingModel}
          >
            <option value="free">{labels.billingModels.free}</option>
            <option value="per_call">{labels.billingModels.per_call}</option>
            <option value="subscription">{labels.billingModels.subscription}</option>
          </select>
        </label>
        <label>
          <span>{labels.unitAmount}</span>
          <input defaultValue={skill.pricing.unitAmountCents} min="0" name="unitAmountCents" step="1" type="number" />
        </label>
        <label>
          <span>{labels.currency}</span>
          <input defaultValue={skill.analytics.currency} maxLength={8} name="currency" />
        </label>
        <label>
          <span>{labels.priceStatus}</span>
          <select
            name="status"
            onChange={(event) => setSelectedPriceStatus(event.target.value as PublisherSkillRecord["pricing"]["status"])}
            value={selectedPriceStatus}
          >
            <option value="draft">{labels.priceStatuses.draft}</option>
            <option disabled={paidPricingBlocked} value="active">{labels.priceStatuses.active}</option>
            <option value="archived">{labels.priceStatuses.archived}</option>
          </select>
        </label>
        <button className="primary-button" disabled={isPricePending} type="submit">
          <Save size={16} aria-hidden="true" />
          <span>{isPricePending ? labels.saving : labels.savePrice}</span>
        </button>
      </form>

      {priceMessageVisible ? <ActionMessage state={priceState} /> : null}
    </div>
  );
}

function ReviewRepairPanel({
  labels,
  locale,
  plan
}: {
  labels: PublisherSkillCopy;
  locale: Locale;
  plan: ReviewRepairPlan;
}) {
  const repairLabels = labels.reviewRepair;
  const priorityChecks = [...plan.failedChecks, ...plan.warningChecks, ...plan.openChecks].slice(0, 4);

  return (
    <section className={reviewRepairClass(plan.tone)} aria-label={repairLabels.title}>
      <div className="publisher-skill-review-repair__head">
        <strong>
          <ClipboardCheck size={15} aria-hidden="true" />
          {repairLabels.title}
        </strong>
        <span className={reviewStatusClass(plan.status)}>{formatReviewStatus(plan.status, labels.reviewStatuses)}</span>
      </div>

      <div className="publisher-skill-review-repair__meta">
        <span>
          <strong>{repairLabels.latestVersion}</strong>
          {plan.latestVersion ? `v${plan.latestVersion.version}` : "n/a"}
        </span>
        <span>
          <strong>{repairLabels.submitted}</strong>
          {formatDate(plan.submittedAt, locale)}
        </span>
        <span>
          <strong>{repairLabels.decided}</strong>
          {plan.decidedAt ? formatDate(plan.decidedAt, locale) : repairLabels.notDecided}
        </span>
        <span>
          <strong>{repairLabels.queueAge}</strong>
          {formatQueueAge(plan.queueAgeHours, locale)}
        </span>
        <span>
          <strong>{repairLabels.sla}</strong>
          <em className={reviewSlaClass(plan.slaStatus)}>
            {formatReviewSlaStatus(plan.slaStatus, labels)}
            {plan.slaDueAt ? ` / ${formatDate(plan.slaDueAt, locale)}` : ""}
          </em>
        </span>
      </div>

      <div className="publisher-skill-review-repair__notes">
        <strong>{repairLabels.notes}</strong>
        <p>{plan.notes ?? repairLabels.noNotes}</p>
      </div>

      <div className="publisher-skill-review-repair__evidence" aria-label={repairLabels.checkEvidence}>
        <span className={plan.failedChecks.length > 0 ? "quality-chip quality-chip--critical" : "quality-chip"}>
          {plan.failedChecks.length} {repairLabels.checkSummary.failed}
        </span>
        <span className={plan.warningChecks.length > 0 ? "quality-chip quality-chip--attention" : "quality-chip"}>
          {plan.warningChecks.length} {repairLabels.checkSummary.warning}
        </span>
        <span className={plan.openChecks.length > 0 ? "quality-chip quality-chip--attention" : "quality-chip"}>
          {plan.openChecks.length} {repairLabels.checkSummary.open}
        </span>
        <span className={plan.passedChecks.length > 0 ? "quality-chip quality-chip--complete" : "quality-chip"}>
          {plan.passedChecks.length} {repairLabels.checkSummary.passed}
        </span>
      </div>

      {priorityChecks.length > 0 ? (
        <div className="publisher-skill-review-repair__checks">
          {priorityChecks.map((check) => (
            <div className="publisher-skill-review-repair__check" key={`${check.checkType}-${check.status}-${check.createdAt ?? check.checkedAt ?? "check"}`}>
              <span className={checkStatusClass(check.status)}>{formatCheckStatus(check.status, labels)}</span>
              <strong>{formatCheckType(check.checkType, labels)}</strong>
              <small>{check.message ?? check.status}</small>
              {check.nextAction ? (
                <small>
                  <b>{repairLabels.nextAction}</b>
                  {check.nextAction}
                </small>
              ) : null}
              {check.targetField ? (
                <small>
                  <b>{repairLabels.targetField}</b>
                  <code>{check.targetField}</code>
                </small>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="publisher-skill-review-repair__actions">
        <strong>{repairLabels.actions}</strong>
        <div>
          {plan.actionKeys.map((actionKey) => (
            <span className={reviewRepairActionClass(actionKey)} key={actionKey}>
              {formatReviewRepairAction(actionKey, labels)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildReviewRepairPlan(skill: PublisherSkillRecord): ReviewRepairPlan {
  const latestVersion = skill.versions?.[0];
  const checks = latestVersion?.runtimeChecks?.length ? latestVersion.runtimeChecks : (skill.runtime.checks ?? []);
  const failedChecks = checks.filter((check) => check.status === "failed");
  const warningChecks = checks.filter((check) => check.status === "warning");
  const openChecks = checks.filter((check) => check.status === "queued" || check.status === "running");
  const passedChecks = checks.filter((check) => check.status === "passed");
  const blockingChecks = checks.filter((check) => check.isBlocking === true);
  const status = latestVersion?.reviewStatus ?? skill.review.status;
  const notes = latestVersion?.reviewNotes ?? skill.review.notes;
  const decidedAt = latestVersion?.reviewDecidedAt ?? skill.review.decidedAt;
  const submittedAt = latestVersion?.reviewSubmittedAt ?? skill.review.reviewSubmittedAt ?? null;
  const queueAgeHours = latestVersion?.reviewQueueAgeHours ?? skill.review.reviewQueueAgeHours ?? null;
  const slaDueAt = latestVersion?.reviewSlaDueAt ?? skill.review.reviewSlaDueAt ?? null;
  const slaHoursRemaining = latestVersion?.reviewSlaHoursRemaining ?? skill.review.reviewSlaHoursRemaining ?? null;
  const slaStatus = latestVersion?.reviewSlaStatus ?? skill.review.reviewSlaStatus ?? null;
  const actionKeys: ReviewRepairActionKey[] = [];

  if (!latestVersion) {
    pushReviewRepairAction(actionKeys, "create_version");
  }

  if (failedChecks.length > 0 || warningChecks.length > 0 || blockingChecks.length > 0) {
    pushReviewRepairAction(actionKeys, "fix_checks");
  }

  if (skill.permissionLevel === "high" && !notes) {
    pushReviewRepairAction(actionKeys, "clarify_risk");
  }

  if (status === "rejected" || status === "blocked") {
    pushReviewRepairAction(actionKeys, "create_version");
    pushReviewRepairAction(actionKeys, "resubmit_version");
  } else if (status === "queued" || status === "in_review") {
    pushReviewRepairAction(actionKeys, "wait_review");
  } else if (status === "approved") {
    pushReviewRepairAction(actionKeys, skill.commercial && !skill.commercial.paidActivationReady ? "complete_commercial" : "monitor");
  } else {
    pushReviewRepairAction(actionKeys, "submit_version");
  }

  if (actionKeys.length === 0) {
    pushReviewRepairAction(actionKeys, "monitor");
  }

  const tone: ReviewRepairTone =
    status === "rejected" || status === "blocked" || failedChecks.length > 0 || blockingChecks.length > 0
      ? "danger"
      : status === "approved" && failedChecks.length === 0 && warningChecks.length === 0 && openChecks.length === 0
        ? "ready"
        : status === "queued" || status === "in_review" || warningChecks.length > 0 || openChecks.length > 0
          ? "warning"
          : "neutral";

  return {
    actionKeys,
    decidedAt,
    failedChecks,
    latestVersion,
    notes,
    openChecks,
    openVersionWorkbench: actionKeys.some((actionKey) =>
      ["clarify_risk", "create_version", "fix_checks", "resubmit_version", "submit_version"].includes(actionKey)
    ),
    passedChecks,
    queueAgeHours,
    slaDueAt,
    slaHoursRemaining,
    slaStatus,
    status,
    submittedAt,
    tone,
    warningChecks
  };
}

function pushReviewRepairAction(actions: ReviewRepairActionKey[], action: ReviewRepairActionKey) {
  if (!actions.includes(action)) {
    actions.push(action);
  }
}

function getNextOperatingStep(skill: PublisherSkillRecord, labels: PublisherSkillCopy) {
  const checks = skill.runtime.checks ?? [];
  const hasBlockingCheck = checks.some((check) => check.status === "failed" || check.status === "warning");
  const hasOpenCheck = checks.some((check) => check.status === "queued" || check.status === "running");
  const hasUnansweredFeedback = (skill.recentFeedback ?? []).some((feedback) => !feedback.publisherResponseBody);
  const hasDistributionGap = Boolean(
    skill.marketplace?.placement === "suppressed" ||
      skill.marketplace?.improvementHints.some((hint) => hint.severity === "critical" || hint.severity === "warning")
  );

  if ((skill.versions ?? []).length === 0) {
    return labels.nextStep.version;
  }

  if (skill.review.status === "queued" || skill.review.status === "in_review") {
    return hasOpenCheck ? labels.nextStep.runtime : labels.nextStep.review;
  }

  if (hasBlockingCheck) {
    return labels.nextStep.runtime;
  }

  if (skill.verificationStatus !== "verified") {
    return labels.nextStep.review;
  }

  if (skill.commercial && !skill.commercial.paidActivationReady) {
    return labels.nextStep.pricing;
  }

  if (hasUnansweredFeedback) {
    return labels.nextStep.feedback;
  }

  if (hasDistributionGap) {
    return labels.nextStep.curation;
  }

  return labels.nextStep.verified;
}

function CommercialReadinessPanel({
  commercial,
  labels
}: {
  commercial: NonNullable<PublisherSkillRecord["commercial"]>;
  labels: (typeof commercialCopy)["en"] | (typeof commercialCopy)["zh"];
}) {
  const blockers = commercial.blockers.length > 0 ? commercial.blockers : [];

  return (
    <div className={commercial.paidActivationReady ? "publisher-skill-commercial publisher-skill-commercial--ready" : "publisher-skill-commercial"}>
      <div className="publisher-skill-commercial__head">
        <strong>
          <ShieldCheck size={15} aria-hidden="true" />
          {labels.title}
        </strong>
        <span className={commercial.paidActivationReady ? "status-chip" : "status-chip status-chip--warning"}>
          {commercial.paidActivationReady ? labels.ready : labels.blocked}
        </span>
      </div>
      <p>{labels.help}</p>
      <div className="publisher-skill-hints">
        {blockers.length > 0 ? (
          blockers.map((blocker) => (
            <span className="quality-chip quality-chip--attention" key={blocker}>
              {formatCommercialBlocker(blocker, labels.blockerLabels)}
            </span>
          ))
        ) : (
          <span className="quality-chip quality-chip--complete">{labels.ready}</span>
        )}
      </div>
    </div>
  );
}

function PublisherFeedbackResponsePanel({
  action,
  isPending,
  labels,
  locale,
  messageState,
  skill
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  labels: PublisherFeedbackResponseCopy;
  locale: Locale;
  messageState: PublisherSkillActionState | null;
  skill: PublisherSkillRecord;
}) {
  const feedbackRows = skill.recentFeedback ?? [];

  return (
    <div className="publisher-skill-feedback">
      <div className="publisher-skill-feedback__head">
        <strong>
          <MessageSquareText size={15} aria-hidden="true" />
          {labels.recentFeedback}
        </strong>
        <span className="status-chip status-chip--neutral">{feedbackRows.length}</span>
      </div>

      {feedbackRows.length > 0 ? (
        <div className="publisher-skill-feedback-list">
          {feedbackRows.map((feedback) => {
            const rowMessage = messageState?.feedbackId === feedback.id ? messageState : null;

            return (
              <section className="publisher-skill-feedback-card" key={feedback.id}>
                <header>
                  <div>
                    <strong>{feedback.title}</strong>
                    <span>
                      {feedback.reviewerOrganizationName ?? feedback.reviewerDisplayName ?? feedback.reviewerEmail ?? labels.buyer}
                    </span>
                  </div>
                  <div className="skill-feedback-rating" aria-label={`${feedback.rating} / 5`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={14}
                        aria-hidden="true"
                        fill={index < feedback.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </header>
                <p>{feedback.body}</p>
                <div className="publisher-skill-feedback-meta">
                  <span>
                    <strong>{labels.project}</strong>
                    {feedback.projectSlug ?? "n/a"}
                  </span>
                  <span>
                    <strong>{labels.useCase}</strong>
                    {feedback.useCase ?? "n/a"}
                  </span>
                </div>
                {feedback.publisherResponseBody ? (
                  <div className="publisher-skill-feedback-response">
                    <strong>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      {labels.responded}
                    </strong>
                    <p>{feedback.publisherResponseBody}</p>
                    {feedback.publisherRespondedAt ? <small>{formatDate(feedback.publisherRespondedAt, locale)}</small> : null}
                  </div>
                ) : null}
                <form action={action} className="publisher-skill-feedback-form">
                  <input name="feedbackId" type="hidden" value={feedback.id} />
                  <input name="skillSlug" type="hidden" value={skill.slug} />
                  <label>
                    <span>{labels.publisherResponse}</span>
                    <textarea
                      defaultValue={feedback.publisherResponseBody ?? ""}
                      name="body"
                      placeholder={labels.responsePlaceholder}
                      rows={3}
                    />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isPending && rowMessage ? labels.savingResponse : labels.saveResponse}</span>
                  </button>
                </form>
                {rowMessage ? <ActionMessage state={rowMessage} /> : null}
              </section>
            );
          })}
        </div>
      ) : (
        <p>{labels.empty}</p>
      )}
    </div>
  );
}

function VersionRow({
  isPending,
  labels,
  locale,
  reviewAction,
  skillSlug,
  version
}: {
  isPending: boolean;
  labels: PublisherSkillCopy;
  locale: Locale;
  reviewAction: (payload: FormData) => void;
  skillSlug: string;
  version: PublisherSkillVersionRecord;
}) {
  const isLocked = version.status === "verified" || version.installCount > 0;
  const isReviewOpen = version.reviewStatus === "queued" || version.reviewStatus === "in_review";

  return (
    <div className="publisher-skill-version-row">
      <div className="publisher-skill-version-row__main">
        <span className={versionStatusClass(version.status)}>
          <GitBranch size={13} aria-hidden="true" />
          {formatVersionStatus(version.status, labels.versions.statuses)}
        </span>
        <strong>v{version.version}</strong>
        <small>
          {labels.versions.created}: {formatDate(version.createdAt, locale)}
        </small>
        <small>
          {labels.versions.reviewSla}:{" "}
          <em className={reviewSlaClass(version.reviewSlaStatus)}>
            {formatReviewSlaStatus(version.reviewSlaStatus, labels)}
            {version.reviewSlaDueAt ? ` / ${formatDate(version.reviewSlaDueAt, locale)}` : ""}
          </em>
        </small>
      </div>
      <div className="publisher-skill-version-row__signals">
        <span>{formatCompactNumber(version.installCount)} {labels.versions.installs}</span>
        <span>{formatCompactNumber(version.callCount)} {labels.versions.calls}</span>
        {isLocked ? <span>{labels.versions.locked}</span> : null}
      </div>
      {version.reviewNotes ? (
        <p>
          <strong>{labels.versions.reviewNotes}: </strong>
          {version.reviewNotes}
        </p>
      ) : null}
      <form action={reviewAction} className="publisher-skill-version-submit">
        <input name="skillSlug" type="hidden" value={skillSlug} />
        <input name="version" type="hidden" value={version.version} />
        <button className="ghost-button ghost-button--inline" disabled={isPending || isReviewOpen || version.status === "verified"} type="submit">
          <Send size={14} aria-hidden="true" />
          <span>{labels.versions.submit}</span>
        </button>
      </form>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildEditableManifest(skill: PublisherSkillRecord, latestVersion?: PublisherSkillVersionRecord) {
  const manifest = latestVersion?.manifest ?? {};
  const currentVersion = typeof manifest.version === "string" ? manifest.version : (skill.version ?? "0.1.0");

  return JSON.stringify(
    {
      schemaVersion: "0.1",
      ...manifest,
      name: skill.slug,
      displayName: skill.displayName,
      version: bumpPatchVersion(currentVersion),
      description: typeof manifest.description === "string" ? manifest.description : skill.description,
      tags: Array.isArray(manifest.tags) && manifest.tags.length > 0 ? manifest.tags : ["agent", "workflow"],
      runtime:
        manifest.runtime && typeof manifest.runtime === "object"
          ? manifest.runtime
          : {
              type: "http",
              entrypoint: "https://api.useskillhub.com/runtime/replace-me"
            },
      permissions:
        manifest.permissions && typeof manifest.permissions === "object"
          ? manifest.permissions
          : {
              browser: false,
              filesystem: "none",
              network: false,
              secrets: []
            },
      inputSchema:
        manifest.inputSchema && typeof manifest.inputSchema === "object"
          ? manifest.inputSchema
          : {
              type: "object",
              properties: {}
            },
      outputSchema:
        manifest.outputSchema && typeof manifest.outputSchema === "object"
          ? manifest.outputSchema
          : {
              type: "object",
              properties: {}
            }
    },
    null,
    2
  );
}

function bumpPatchVersion(version: string) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);

  if (!match) {
    return "0.1.0";
  }

  return `${match[1]}.${match[2]}.${Number(match[3]) + 1}${match[4] ?? ""}`;
}

function formatRating(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "n/a";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  }).format(value)}/5`;
}

function formatFeedbackCounts(feedback: PublisherSkillRecord["feedback"]) {
  if (!feedback) {
    return "0 / 0";
  }

  return `${formatCompactNumber(feedback.publishedCount)} / ${formatCompactNumber(feedback.pendingCount)}`;
}

function formatReviewStatus(status: string | null, labels: Record<string, string>) {
  return labels[status ?? "no_review"] ?? (status ?? "no_review").replaceAll("_", " ");
}

function formatReviewSlaStatus(status: ReviewSlaStatus | string | null | undefined, labels: PublisherSkillCopy) {
  if (!status) {
    return labels.reviewRepair.slaStatuses.not_submitted;
  }

  return labels.reviewRepair.slaStatuses[status as keyof typeof labels.reviewRepair.slaStatuses] ?? status.replaceAll("_", " ");
}

function formatQueueAge(value: number | null | undefined, locale: Locale) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return locale === "zh" ? "未开始" : "Not started";
  }

  if (value < 24) {
    return locale === "zh" ? `${value} 小时` : `${value}h`;
  }

  const days = Math.floor(value / 24);
  const hours = value % 24;

  if (locale === "zh") {
    return hours > 0 ? `${days} 天 ${hours} 小时` : `${days} 天`;
  }

  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

function formatVerificationStatus(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function formatVersionStatus(status: PublisherSkillVersionRecord["status"], labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function formatPlacement(placement: NonNullable<PublisherSkillRecord["marketplace"]>["placement"], labels: Record<string, string>) {
  return labels[placement] ?? placement.replaceAll("_", " ");
}

function formatAppealStatus(status: NonNullable<NonNullable<PublisherSkillRecord["marketplace"]>["appeal"]>["status"], labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function formatHintLabel(key: string, labels: Record<string, string>) {
  return labels[key] ?? key.replaceAll("_", " ");
}

function formatCommercialBlocker(blocker: PublisherCommercialBlocker, labels: Record<string, string>) {
  return labels[blocker] ?? blocker.replaceAll("_", " ");
}

function formatReviewRepairAction(action: ReviewRepairActionKey, labels: PublisherSkillCopy) {
  return labels.reviewRepair.actionLabels[action] ?? action.replaceAll("_", " ");
}

function formatCheckType(checkType: string, labels: PublisherSkillCopy) {
  return labels.checkLabels[checkType as keyof typeof labels.checkLabels] ?? checkType;
}

function formatCheckStatus(status: string, labels: PublisherSkillCopy) {
  return labels.checkStatusLabels[status as keyof typeof labels.checkStatusLabels] ?? status;
}

function ActionMessage({ state }: { state: PublisherSkillActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function statusClass(status: PublisherSkillRecord["verificationStatus"]) {
  if (status === "verified") {
    return "status-chip";
  }

  if (status === "submitted" || status === "draft") {
    return "status-chip status-chip--warning";
  }

  if (status === "rejected" || status === "suspended") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--neutral";
}

function versionStatusClass(status: PublisherSkillVersionRecord["status"]) {
  if (status === "verified") {
    return "status-chip";
  }

  if (status === "submitted" || status === "draft") {
    return "status-chip status-chip--warning";
  }

  if (status === "rejected" || status === "suspended") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--neutral";
}

function marketplaceClass(placement: NonNullable<PublisherSkillRecord["marketplace"]>["placement"]) {
  if (placement === "featured") {
    return "status-chip";
  }

  if (placement === "suppressed") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function appealStatusClass(status: NonNullable<NonNullable<PublisherSkillRecord["marketplace"]>["appeal"]>["status"]) {
  if (status === "approved") {
    return "status-chip";
  }

  if (status === "rejected" || status === "closed") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--warning";
}

function qualityClass(status: PublisherSkillRecord["quality"]["checklist"][number]["status"]) {
  if (status === "complete") {
    return "quality-chip quality-chip--complete";
  }

  if (status === "needs_attention" || status === "missing") {
    return "quality-chip quality-chip--attention";
  }

  return "quality-chip";
}

function hintClass(severity: NonNullable<PublisherSkillRecord["marketplace"]>["improvementHints"][number]["severity"]) {
  if (severity === "positive") {
    return "quality-chip quality-chip--complete";
  }

  if (severity === "critical") {
    return "quality-chip quality-chip--critical";
  }

  return "quality-chip quality-chip--attention";
}

function reviewRepairClass(tone: ReviewRepairTone) {
  return tone === "ready"
    ? "publisher-skill-review-repair publisher-skill-review-repair--ready"
    : tone === "danger"
      ? "publisher-skill-review-repair publisher-skill-review-repair--danger"
      : tone === "warning"
        ? "publisher-skill-review-repair publisher-skill-review-repair--warning"
        : "publisher-skill-review-repair";
}

function reviewRepairActionClass(action: ReviewRepairActionKey) {
  if (action === "monitor") {
    return "quality-chip quality-chip--complete";
  }

  if (action === "fix_checks" || action === "resubmit_version" || action === "clarify_risk") {
    return "quality-chip quality-chip--critical";
  }

  return "quality-chip quality-chip--attention";
}

function reviewStatusClass(status: string | null) {
  if (status === "approved") {
    return "status-chip";
  }

  if (status === "rejected" || status === "blocked") {
    return "status-chip status-chip--danger";
  }

  if (status === "queued" || status === "in_review") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function reviewSlaClass(status: ReviewSlaStatus | string | null | undefined) {
  if (status === "overdue") {
    return "status-chip status-chip--danger";
  }

  if (status === "due_soon") {
    return "status-chip status-chip--warning";
  }

  if (status === "on_track" || status === "decided") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function checkStatusClass(status: string) {
  if (status === "passed") {
    return "status-chip";
  }

  if (status === "failed") {
    return "status-chip status-chip--danger";
  }

  if (status === "warning" || status === "queued" || status === "running") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "未开始" : "Not started";
  }

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
