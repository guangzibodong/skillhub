"use client";

import { useActionState, type ReactNode } from "react";
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
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
    title: "Publisher skill operations",
    unitAmount: "Unit amount (cents)"
  },
  zh: {
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
    title: "发布者技能运营",
    unitAmount: "单价（分）"
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
  const isInReview = skill.review.status === "queued" || skill.review.status === "in_review";
  const reviewMessageVisible = reviewState.skillSlug === skill.slug && reviewState.status !== "idle";
  const priceMessageVisible = priceState.skillSlug === skill.slug && priceState.status !== "idle";

  return (
    <div className="publisher-skill-card">
      <div className="publisher-skill-card__top">
        <div>
          <strong>{skill.displayName}</strong>
          <span>
            {skill.slug} / {skill.version ?? "draft"}
          </span>
        </div>
        <span className={statusClass(skill.verificationStatus)}>{skill.verificationStatus}</span>
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

      <form action={reviewAction} className="publisher-skill-review-form">
        <input name="skillSlug" type="hidden" value={skill.slug} />
        <button className="secondary-button" disabled={isReviewPending || isInReview} type="submit">
          <Send size={16} aria-hidden="true" />
          <span>{isReviewPending ? labels.submitting : labels.submitReview}</span>
        </button>
        <span className="publisher-skill-review-state">
          <ClipboardCheck size={15} aria-hidden="true" />
          {skill.review.status ?? "no_review"}
        </span>
      </form>

      {reviewMessageVisible ? <ActionMessage state={reviewState} /> : null}

      <form action={priceAction} className="publisher-skill-price-form">
        <input name="skillSlug" type="hidden" value={skill.slug} />
        <label>
          <span>{labels.billingModel}</span>
          <select defaultValue={skill.pricing.billingModel} name="billingModel">
            <option value="free">free</option>
            <option value="per_call">per_call</option>
            <option value="subscription">subscription</option>
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
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
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

function qualityClass(status: PublisherSkillRecord["quality"]["checklist"][number]["status"]) {
  if (status === "complete") {
    return "quality-chip quality-chip--complete";
  }

  if (status === "needs_attention" || status === "missing") {
    return "quality-chip quality-chip--attention";
  }

  return "quality-chip";
}
