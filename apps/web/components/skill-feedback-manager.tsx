"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, MessageSquareText, Save, Star, XCircle } from "lucide-react";
import { SkillButton, SkillInput, SkillSelect, useSkillModal } from "@/components/skill-antd";
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
    noProject: "No project",
    noUseCase: "No use case",
    notAvailable: "Not available",
    project: "Project",
    reason: "Decision reason",
    reviewer: "Reviewer",
    save: "Record decision",
    saving: "Saving",
    status: "Status",
    title: "Skill feedback moderation",
    useCase: "Use case",
    statuses: {
      hidden: "Hidden",
      pending: "Pending",
      published: "Published",
      rejected: "Rejected"
    },
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
    noProject: "未关联项目",
    noUseCase: "未填写使用场景",
    notAvailable: "暂无",
    project: "项目",
    reason: "处理原因",
    reviewer: "反馈人",
    save: "记录处理",
    saving: "保存中",
    status: "状态",
    title: "技能反馈审核",
    useCase: "使用场景",
    statuses: {
      hidden: "已隐藏",
      pending: "待审核",
      published: "已发布",
      rejected: "已拒绝"
    },
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
                  <span className={statusClass(item.status)}>{labels.statuses[item.status]}</span>
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
                    {item.reviewerOrganizationName ?? item.reviewerDisplayName ?? item.reviewerEmail ?? labels.notAvailable}
                  </span>
                  <span>
                    <strong>{labels.project}</strong>
                    {item.projectSlug ?? labels.noProject}
                  </span>
                  <span>
                    <strong>{labels.useCase}</strong>
                    {item.useCase ?? labels.noUseCase}
                  </span>
                  <span>
                    <strong>{labels.status}</strong>
                    {labels.statuses[item.status]}
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

                <FeedbackDecisionForm
                  action={action}
                  isPending={isPending}
                  item={item}
                  labels={labels}
                  locale={locale}
                  statusMessage={statusMessage}
                />

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

type FeedbackAction = "hide" | "publish" | "reject" | "reopen";

function FeedbackDecisionForm({
  action,
  isPending,
  item,
  labels,
  locale,
  statusMessage
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  item: SkillFeedbackRecord;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  statusMessage: SkillFeedbackDecisionActionState | null;
}) {
  const [selectedAction, setSelectedAction] = useState<FeedbackAction | "">("");
  const actionCopy = getFeedbackActionCopy(locale);
  const modal = useSkillModal();
  const isSubmitArmed = useRef(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedAction) {
      event.preventDefault();
      return;
    }

    if (isSubmitArmed.current) {
      isSubmitArmed.current = false;
      return;
    }

    event.preventDefault();
    const form = event.currentTarget;
    modal.confirm({
      title: actionCopy.confirm[selectedAction].replace("{title}", item.title),
      onOk: () => {
        isSubmitArmed.current = true;
        form.requestSubmit();
      }
    });
  }

  return (
    <form action={action} className="skill-feedback-action-form" onSubmit={handleSubmit}>
      <input name="feedbackId" type="hidden" value={item.id} />
      <label>
        <span>{labels.action}</span>
        <SkillSelect
          name="action"
          onChange={(value) => setSelectedAction(value as FeedbackAction | "")}
          options={[
            { label: actionCopy.choose, value: "" },
            ...Object.entries(labels.actions).map(([value, label]) => ({ label, value }))
          ]}
          required
          value={selectedAction}
        />
        <small>{actionCopy.help}</small>
      </label>
      <label>
        <span>{labels.reason}</span>
        <SkillInput defaultValue={item.moderationReason ?? ""} name="reason" required />
      </label>
      <SkillButton className="secondary-button secondary-button--compact" disabled={isPending || !selectedAction} htmlType="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isPending && statusMessage ? labels.saving : labels.save}</span>
      </SkillButton>
    </form>
  );
}

function getFeedbackActionCopy(locale: Locale) {
  if (locale === "zh") {
    return {
      choose: "请选择处理动作",
      confirm: {
        hide: "确认隐藏「{title}」？公开页面将不再展示该反馈。",
        publish: "确认发布「{title}」到公开评价？请先确认没有隐私、攻击或误导内容。",
        reject: "确认拒绝「{title}」？该反馈不会公开。",
        reopen: "确认退回「{title}」到待审状态？"
      },
      help: "发布会进入公开评价区域；请先确认不包含隐私、攻击性内容或误导信息。"
    };
  }

  return {
    choose: "Choose action",
    confirm: {
      hide: "Hide \"{title}\"? It will no longer appear publicly.",
      publish: "Publish \"{title}\" as public feedback? Confirm it contains no private, abusive, or misleading content.",
      reject: "Reject \"{title}\"? It will not be public.",
      reopen: "Reopen \"{title}\" for moderation?"
    },
    help: "Publishing makes this feedback visible on public surfaces. Confirm privacy and content quality first."
  };
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
