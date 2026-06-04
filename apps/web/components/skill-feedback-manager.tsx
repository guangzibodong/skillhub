"use client";

import { useActionState } from "react";
import { CheckCircle2, MessageSquareText, Save, Star, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { SkillFeedbackRecord } from "@/lib/skill-feedback";
import {
  decideSkillFeedbackAction,
  type SkillFeedbackDecisionActionState
} from "@/lib/skill-feedback-admin-actions";

type SkillFeedbackManagerProps = {
  feedback: SkillFeedbackRecord[];
  locale: Locale;
};

const copy = {
  en: {
    action: "Action",
    decided: "Decision",
    empty: "No skill feedback needs moderation.",
    project: "Project",
    reason: "Decision reason",
    reviewer: "Reviewer",
    save: "Record decision",
    saving: "Saving",
    status: "Status",
    title: "Skill feedback moderation",
    useCase: "Use case",
    actions: {
      hide: "Hide",
      publish: "Publish",
      reject: "Reject",
      reopen: "Reopen"
    }
  },
  zh: {
    action: "动作",
    decided: "处理结果",
    empty: "当前没有需要审核的技能反馈。",
    project: "项目",
    reason: "处理原因",
    reviewer: "反馈人",
    save: "记录处理",
    saving: "保存中",
    status: "状态",
    title: "技能反馈审核",
    useCase: "使用场景",
    actions: {
      hide: "隐藏",
      publish: "发布",
      reject: "拒绝",
      reopen: "退回待审"
    }
  }
} as const;

const initialState: SkillFeedbackDecisionActionState = {
  message: "",
  status: "idle"
};

export function SkillFeedbackManager({ feedback, locale }: SkillFeedbackManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(decideSkillFeedbackAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel skill-feedback-review-panel">
      <div className="card-kicker">
        <MessageSquareText size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="skill-feedback-review-list">
        {feedback.length > 0 ? (
          feedback.map((item) => {
            const statusMessage = state.feedbackId === item.id ? state : null;

            return (
              <section className="skill-feedback-review-card" key={item.id}>
                <header className="skill-feedback-review-card__head">
                  <div>
                    <strong>{item.title}</strong>
                    <span>
                      {item.skillName} / {item.skillSlug}
                    </span>
                  </div>
                  <span className={statusClass(item.status)}>{item.status}</span>
                </header>

                <div className="skill-feedback-rating" aria-label={`${item.rating} / 5`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={15}
                      aria-hidden="true"
                      fill={index < item.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p>{item.body}</p>

                <div className="skill-feedback-review-meta">
                  <span>
                    <strong>{labels.reviewer}</strong>
                    {item.reviewerOrganizationName ?? item.reviewerDisplayName ?? item.reviewerEmail ?? "unknown"}
                  </span>
                  <span>
                    <strong>{labels.project}</strong>
                    {item.projectSlug ?? "n/a"}
                  </span>
                  <span>
                    <strong>{labels.useCase}</strong>
                    {item.useCase ?? "n/a"}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    {item.status}
                  </span>
                </div>

                {item.moderationReason ? (
                  <div className="skill-feedback-decision">
                    <CheckCircle2 size={15} aria-hidden="true" />
                    <span>
                      <strong>{labels.decided}</strong>
                      {item.moderationReason}
                    </span>
                  </div>
                ) : null}

                <form action={action} className="skill-feedback-action-form">
                  <input name="feedbackId" type="hidden" value={item.id} />
                  <label>
                    <span>{labels.action}</span>
                    <select defaultValue={suggestedAction(item)} name="action">
                      {Object.entries(labels.actions).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{labels.reason}</span>
                    <input defaultValue={item.moderationReason ?? ""} name="reason" />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isPending && statusMessage ? labels.saving : labels.save}</span>
                  </button>
                </form>

                {statusMessage && statusMessage.status !== "idle" ? (
                  <div className={statusMessage.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
                    {statusMessage.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                    <span>{statusMessage.message}</span>
                  </div>
                ) : null}
              </section>
            );
          })
        ) : (
          <div className="project-table__row project-table__row--empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function suggestedAction(feedback: SkillFeedbackRecord) {
  if (feedback.status === "pending") {
    return "publish";
  }

  if (feedback.status === "published") {
    return "hide";
  }

  return "reopen";
}

function statusClass(status: SkillFeedbackRecord["status"]) {
  if (status === "published") {
    return "status-chip";
  }

  if (status === "pending") {
    return "status-chip status-chip--warning";
  }

  if (status === "hidden") {
    return "status-chip status-chip--neutral";
  }

  return "status-chip status-chip--danger";
}
