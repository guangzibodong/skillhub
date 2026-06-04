"use client";

import { useActionState } from "react";
import { CheckCircle2, ClipboardCheck, FileText, Save, ShieldAlert, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import type { AdminReviewRecord } from "@/lib/ops-data";
import { decideAdminReviewAction, type AdminReviewActionState } from "@/lib/admin-review-actions";

type AdminReviewManagerProps = {
  locale: Locale;
  reviews: AdminReviewRecord[];
};

const copy = {
  en: {
    approve: "Approve",
    block: "Block",
    created: "Submitted",
    decision: "Decision",
    empty: "No skill reviews need operator action.",
    notes: "Reviewer notes",
    reject: "Reject",
    risk: "Risk",
    save: "Record decision",
    saving: "Saving",
    status: "Status",
    title: "Skill review queue",
    version: "Version",
    viewSkill: "Open listing"
  },
  zh: {
    approve: "批准",
    block: "阻断",
    created: "提交时间",
    decision: "审核决定",
    empty: "当前没有需要处理的技能审核。",
    notes: "审核备注",
    reject: "拒绝",
    risk: "风险",
    save: "记录决定",
    saving: "保存中",
    status: "状态",
    title: "技能审核队列",
    version: "版本",
    viewSkill: "打开列表"
  }
} as const;

const initialState: AdminReviewActionState = {
  message: "",
  status: "idle"
};

export function AdminReviewManager({ locale, reviews }: AdminReviewManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(decideAdminReviewAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel admin-review-manager">
      <div className="admin-review-manager__head">
        <div className="card-kicker">
          <ClipboardCheck size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className="status-chip status-chip--neutral">{reviews.length}</span>
      </div>

      <div className="admin-review-list">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const rowState = state.reviewId === review.id ? state : null;

            return (
              <section className="admin-review-card" key={review.id}>
                <header className="admin-review-card__head">
                  <div>
                    <strong>{review.displayName}</strong>
                    <span>{review.skillSlug}</span>
                  </div>
                  <span className={riskClass(review.riskLevel)}>{review.riskLevel ?? "unknown"}</span>
                </header>

                <div className="admin-review-meta">
                  <span>
                    <strong>{labels.version}</strong>
                    {review.version ?? "draft"}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    <em className={statusClass(review.status)}>{review.status}</em>
                  </span>
                  <span>
                    <strong>{labels.created}</strong>
                    {formatDate(review.createdAt, locale)}
                  </span>
                  <span>
                    <strong>{labels.risk}</strong>
                    {review.riskLevel ?? "unknown"}
                  </span>
                </div>

                {review.notes ? (
                  <div className="admin-review-notes">
                    <FileText size={15} aria-hidden="true" />
                    <span>{review.notes}</span>
                  </div>
                ) : null}

                <form action={action} className="admin-review-action-form">
                  <input name="reviewId" type="hidden" value={review.id} />
                  <input name="skillSlug" type="hidden" value={review.skillSlug} />
                  <label>
                    <span>{labels.decision}</span>
                    <select defaultValue={suggestedDecision(review)} name="status">
                      <option value="approved">{labels.approve}</option>
                      <option value="rejected">{labels.reject}</option>
                      <option value="blocked">{labels.block}</option>
                    </select>
                  </label>
                  <label className="admin-review-action-form__notes">
                    <span>{labels.notes}</span>
                    <textarea defaultValue={review.notes ?? ""} name="notes" required />
                  </label>
                  <div className="admin-review-actions">
                    <a className="ghost-button" href={localizedHref(`/skills/${review.skillSlug}`, locale)}>
                      <ShieldAlert size={15} aria-hidden="true" />
                      <span>{labels.viewSkill}</span>
                    </a>
                    <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                      <Save size={15} aria-hidden="true" />
                      <span>{isPending && rowState ? labels.saving : labels.save}</span>
                    </button>
                  </div>
                </form>

                {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
              </section>
            );
          })
        ) : (
          <div className="admin-review-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ActionMessage({ state }: { state: AdminReviewActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function suggestedDecision(review: AdminReviewRecord) {
  if (review.status === "blocked" || review.riskLevel === "high") {
    return "blocked";
  }

  if (review.status === "queued" || review.status === "in_review") {
    return review.riskLevel === "low" ? "approved" : "rejected";
  }

  return "rejected";
}

function riskClass(risk: AdminReviewRecord["riskLevel"]) {
  if (risk === "high") {
    return "status-chip status-chip--danger";
  }

  if (risk === "medium") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function statusClass(status: AdminReviewRecord["status"]) {
  if (status === "approved") {
    return "status-chip";
  }

  if (status === "blocked" || status === "rejected") {
    return "status-chip status-chip--danger";
  }

  if (status === "queued" || status === "in_review") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value || value === "demo") {
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
