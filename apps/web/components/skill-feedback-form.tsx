"use client";

import { useActionState } from "react";
import { CheckCircle2, MessageSquareText, Send, Star, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { createSkillFeedbackAction, type SkillFeedbackActionState } from "@/lib/skill-feedback-actions";

type SkillFeedbackFormProps = {
  locale: Locale;
  skillName: string;
  skillSlug: string;
};

const copy = {
  en: {
    body: "Feedback",
    bodyPlaceholder: "What worked, what failed, and what should the publisher improve?",
    projectSlug: "Project slug",
    rating: "Rating",
    submit: "Submit feedback",
    submitting: "Submitting",
    title: "Share usage feedback",
    titleField: "Title",
    titlePlaceholder: "Reliable for daily research agents",
    useCase: "Use case",
    useCasePlaceholder: "Daily market research"
  },
  zh: {
    body: "反馈内容",
    bodyPlaceholder: "哪些地方好用，哪里失败了，发布者应该改进什么？",
    projectSlug: "项目 slug",
    rating: "评分",
    submit: "提交反馈",
    submitting: "提交中",
    title: "分享使用反馈",
    titleField: "标题",
    titlePlaceholder: "适合每日研究型智能体",
    useCase: "使用场景",
    useCasePlaceholder: "每日市场研究"
  }
} as const;

const ratingOptions = [5, 4, 3, 2, 1] as const;

const initialState: SkillFeedbackActionState = {
  message: "",
  status: "idle"
};

export function SkillFeedbackForm({ locale, skillName, skillSlug }: SkillFeedbackFormProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    createSkillFeedbackAction.bind(null, skillSlug, locale),
    initialState
  );

  return (
    <article className="skill-detail-panel skill-feedback-submit-panel">
      <div className="card-kicker">
        <MessageSquareText size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={action} className="skill-report-form skill-feedback-form">
        <label>
          <span>{labels.rating}</span>
          <select defaultValue="5" name="rating">
            {ratingOptions.map((rating) => (
              <option key={rating} value={rating}>
                {rating} / 5
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.useCase}</span>
          <input name="useCase" placeholder={labels.useCasePlaceholder} />
        </label>
        <label>
          <span>{labels.projectSlug}</span>
          <input name="projectSlug" placeholder="research-agent" />
        </label>
        <label className="skill-report-form__wide">
          <span>{labels.titleField}</span>
          <input name="title" placeholder={labels.titlePlaceholder} required />
        </label>
        <label className="skill-report-form__wide">
          <span>{labels.body}</span>
          <textarea
            aria-label={`${labels.body}: ${skillName}`}
            name="body"
            placeholder={labels.bodyPlaceholder}
            required
          />
        </label>
        <button className="secondary-button" disabled={isPending} type="submit">
          {isPending ? <Send size={15} aria-hidden="true" /> : <Star size={15} aria-hidden="true" />}
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function ActionMessage({ state }: { state: SkillFeedbackActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
