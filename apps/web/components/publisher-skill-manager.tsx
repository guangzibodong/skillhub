"use client";

import { useActionState, type ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Megaphone,
  MessageSquareText,
  PackageCheck,
  Save,
  Send,
  Star,
  XCircle
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PublisherSkillRecord } from "@/lib/ops-data";
import { formatCompactNumber, formatMoney, formatPercent } from "@/lib/ops-format";
import {
  requestMarketplaceCurationAppealAction,
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
    rating: "Rating",
    priceStatus: "Price status",
    quality: "Quality",
    savePrice: "Save price",
    saving: "Saving",
    submitReview: "Submit review",
    submitting: "Submitting",
    successRate: "Success",
    billingModels: {
      free: "Free",
      per_call: "Per call",
      subscription: "Subscription"
    },
    priceStatuses: {
      active: "Active",
      archived: "Archived",
      draft: "Draft"
    },
    reviewStatuses: {
      approved: "Approved",
      blocked: "Blocked",
      in_review: "In review",
      no_review: "No review",
      queued: "Queued",
      rejected: "Rejected"
    },
    verificationStatuses: {
      deprecated: "Deprecated",
      draft: "Draft",
      rejected: "Rejected",
      submitted: "Submitted",
      suspended: "Suspended",
      verified: "Verified"
    },
    title: "Publisher skill operations",
    unitAmount: "Unit amount (cents)"
  },
  zh: {
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
    billingModel: "计费模式",
    calls: "调用",
    currency: "币种",
    empty: "还没有发布者技能。先发布一个 manifest，再回到这里提交审核和设置价格。",
    feedback: "公开 / 待审",
    installs: "安装",
    rating: "评分",
    priceStatus: "价格状态",
    quality: "质量",
    savePrice: "保存价格",
    saving: "保存中",
    submitReview: "提交审核",
    submitting: "提交中",
    successRate: "成功率",
    billingModels: {
      free: "免费",
      per_call: "按次调用",
      subscription: "订阅"
    },
    priceStatuses: {
      active: "启用",
      archived: "归档",
      draft: "草稿"
    },
    reviewStatuses: {
      approved: "已批准",
      blocked: "已阻断",
      in_review: "审核中",
      no_review: "未提交审核",
      queued: "排队中",
      rejected: "已拒绝"
    },
    verificationStatuses: {
      deprecated: "已弃用",
      draft: "草稿",
      rejected: "已拒绝",
      submitted: "已提交",
      suspended: "已暂停",
      verified: "已验证"
    },
    title: "发布者技能运营",
    unitAmount: "单价（分）"
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
    expires: "Expires",
    evidenceUrl: "Evidence URL",
    marketplace: "Marketplace distribution",
    requestReview: "Request review",
    requesting: "Requesting",
    requestedPlacement: "Requested placement",
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
    placementLabels: {
      featured: "Featured",
      standard: "Standard",
      suppressed: "Suppressed"
    },
    reasonPlaceholder: "Summarize fixes, new evidence, buyer demand, or why the listing deserves reconsideration."
  },
  zh: {
    activeAppeal: "\u6700\u65b0\u590d\u5ba1\u7533\u8bf7",
    appealReason: "\u590d\u5ba1\u8bf4\u660e",
    appealStatuses: {
      approved: "\u5df2\u901a\u8fc7",
      closed: "\u5df2\u5173\u95ed",
      open: "\u5df2\u63d0\u4ea4",
      rejected: "\u5df2\u62d2\u7edd",
      under_review: "\u590d\u5ba1\u4e2d"
    },
    expires: "\u5230\u671f",
    evidenceUrl: "\u8bc1\u636e\u94fe\u63a5",
    marketplace: "\u5e02\u573a\u5206\u53d1",
    requestReview: "\u7533\u8bf7\u590d\u5ba1",
    requesting: "\u63d0\u4ea4\u4e2d",
    requestedPlacement: "\u76ee\u6807\u5206\u53d1",
    hintLabels: {
      collect_feedback: "\u83b7\u53d6\u5df2\u53d1\u5e03\u53cd\u9988",
      drive_first_installs: "\u63a8\u52a8\u9996\u6279\u5b89\u88c5",
      eligible_for_distribution: "\u53ef\u4ee5\u83b7\u5f97\u66f4\u5f3a\u5206\u53d1",
      fix_runtime_checks: "\u4fee\u590d\u5931\u8d25\u7684\u5ba1\u6838\u68c0\u67e5",
      maintain_quality: "\u7ee7\u7eed\u4fdd\u6301\u8d28\u91cf\u4fe1\u53f7",
      make_public: "\u5c06\u6280\u80fd\u8bbe\u4e3a\u516c\u5f00",
      moderate_feedback: "\u5904\u7406\u5f85\u5ba1\u53cd\u9988",
      raise_success_rate: "\u63d0\u9ad8\u8fd0\u884c\u6210\u529f\u7387",
      resolve_incidents: "\u89e3\u51b3\u672a\u5173\u95ed\u4e8b\u6545",
      stabilize_runtime: "\u7a33\u5b9a\u8fd0\u884c\u68c0\u67e5",
      submit_review: "\u63d0\u4ea4\u5ba1\u6838"
    },
    placementLabels: {
      featured: "\u7cbe\u9009",
      standard: "\u6807\u51c6",
      suppressed: "\u964d\u6743"
    },
    reasonPlaceholder: "\u8bf4\u660e\u4fee\u590d\u5185\u5bb9\u3001\u65b0\u8bc1\u636e\u3001\u4e70\u65b9\u9700\u6c42\uff0c\u6216\u4e3a\u4ec0\u4e48\u503c\u5f97\u91cd\u65b0\u8bc4\u4f30\u3002"
  }
} as const;

const initialState: PublisherSkillActionState = {
  message: "",
  status: "idle"
};

export function PublisherSkillManager({ locale, skills }: PublisherSkillManagerProps) {
  const labels = copy[locale];

  return (
    <article className="ops-panel publisher-skill-panel">
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
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  skill: PublisherSkillRecord;
}) {
  const [reviewState, reviewAction, isReviewPending] = useActionState(
    submitPublisherSkillReviewAction.bind(null, locale),
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
  const marketplaceLabels = marketplaceCopy[locale];
  const isInReview = skill.review.status === "queued" || skill.review.status === "in_review";
  const activeAppeal =
    skill.marketplace?.appeal && ["open", "under_review"].includes(skill.marketplace.appeal.status)
      ? skill.marketplace.appeal
      : null;
  const reviewMessageVisible = reviewState.skillSlug === skill.slug && reviewState.status !== "idle";
  const priceMessageVisible = priceState.skillSlug === skill.slug && priceState.status !== "idle";
  const appealMessageVisible = appealState.skillSlug === skill.slug && appealState.status !== "idle";

  return (
    <div className="publisher-skill-card">
      <div className="publisher-skill-card__top">
        <div>
          <strong>{skill.displayName}</strong>
          <span>
            {skill.slug} / {skill.version ?? labels.verificationStatuses.draft}
          </span>
        </div>
        <span className={statusClass(skill.verificationStatus)}>{formatVerificationStatus(skill.verificationStatus, labels.verificationStatuses)}</span>
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
              <small>
                SLA: {formatDate(skill.marketplace.appeal.slaDueAt, locale)}
              </small>
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

      <form action={priceAction} className="publisher-skill-price-form">
        <input name="skillSlug" type="hidden" value={skill.slug} />
        <label>
          <span>{labels.billingModel}</span>
          <select defaultValue={skill.pricing.billingModel} name="billingModel">
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
          <select defaultValue={skill.pricing.status} name="status">
            <option value="draft">{labels.priceStatuses.draft}</option>
            <option value="active">{labels.priceStatuses.active}</option>
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

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
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

function formatVerificationStatus(status: string, labels: Record<string, string>) {
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

function formatCheckType(checkType: string, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return labels.checkLabels[checkType as keyof typeof labels.checkLabels] ?? checkType;
}

function formatCheckStatus(status: string, labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
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

function formatDate(value: string, locale: Locale) {
  if (value === "demo") {
    return locale === "zh" ? "\u6f14\u793a\u65f6\u95f4" : "Demo time";
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
