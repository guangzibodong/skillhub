"use client";

import { useActionState } from "react";
import { Bell, CheckCircle2, Save, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { NotificationPreferenceRecord } from "@/lib/ops-data";
import {
  updateNotificationPreferenceAction,
  type NotificationPreferenceActionState,
} from "@/lib/notification-preference-actions";

type NotificationPreferenceManagerProps = {
  locale: Locale;
  preferences: NotificationPreferenceRecord[];
};

const copy = {
  en: {
    email: "Email",
    inApp: "In-app",
    save: "Save",
    saving: "Saving",
    title: "Notification preferences",
    webhook: "Webhook",
  },
  zh: {
    email: "邮件",
    inApp: "站内",
    save: "保存",
    saving: "保存中",
    title: "通知偏好",
    webhook: "Webhook",
  },
} as const;

const topicCopy = {
  en: {
    "skill.review": {
      description:
        "Review decisions, rejection notes, and verification state changes.",
      label: "Skill review",
    },
    "skill.update": {
      description:
        "New versions, deprecations, security notices, and project update inbox events.",
      label: "Skill updates",
    },
    "runtime.incident": {
      description:
        "Runtime incidents, blocked calls, and quality signals that need operator attention.",
      label: "Runtime incidents",
    },
    "finance.billing": {
      description:
        "Invoice generation, billing profile changes, usage posting, refunds, and disputes.",
      label: "Billing and disputes",
    },
    "publisher.payout": {
      description:
        "Payout account onboarding, payout review decisions, blocked payouts, and balance milestones.",
      label: "Payouts",
    },
    "buyer.request": {
      description:
        "Buyer request claims, submissions, matches, cancellations, and demand updates.",
      label: "Buyer requests",
    },
    "account.security": {
      description:
        "API keys, organization billing readiness, and sensitive account operations.",
      label: "Account and security",
    },
  },
  zh: {
    "skill.review": {
      description: "审核结果、拒绝原因和验证状态变化。",
      label: "技能审核",
    },
    "skill.update": {
      description: "新版本、弃用、安全提醒和项目更新收件箱事件。",
      label: "技能更新",
    },
    "runtime.incident": {
      description: "运行事故、被拦截调用和需要处理的质量信号。",
      label: "运行事故",
    },
    "finance.billing": {
      description: "发票生成、账单资料变化、用量入账、退款和争议。",
      label: "账单和争议",
    },
    "publisher.payout": {
      description: "提现账户接入、提现审核结果、被阻止提现和余额里程碑。",
      label: "提现",
    },
    "buyer.request": {
      description: "买方需求认领、提交、匹配、取消和需求更新。",
      label: "买方需求",
    },
    "account.security": {
      description: "API Key、组织账单准备状态和敏感账户操作。",
      label: "账户和安全",
    },
  },
} as const;

const initialPreferenceState: NotificationPreferenceActionState = {
  message: "",
  status: "idle",
};

export function NotificationPreferenceManager({
  locale,
  preferences,
}: NotificationPreferenceManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    updateNotificationPreferenceAction.bind(null, locale),
    initialPreferenceState,
  );

  return (
    <article className="ops-panel notification-preference-panel">
      <div className="card-kicker">
        <Bell size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="notification-preference-list">
        {preferences.map((preference) => {
          const statusMessage =
            state.eventType === preference.eventType ? state : null;
          const localizedTopic = getTopicCopy(locale, preference);

          return (
            <form
              action={action}
              className="notification-preference-row"
              key={preference.eventType}
            >
              <input
                name="eventType"
                type="hidden"
                value={preference.eventType}
              />
              <div className="notification-preference-row__copy">
                <strong>{localizedTopic.label}</strong>
                <span>{localizedTopic.description}</span>
              </div>
              <label>
                <input
                  defaultChecked={preference.inAppEnabled}
                  name="inAppEnabled"
                  type="checkbox"
                />
                <span>{labels.inApp}</span>
              </label>
              <label>
                <input
                  defaultChecked={preference.emailEnabled}
                  name="emailEnabled"
                  type="checkbox"
                />
                <span>{labels.email}</span>
              </label>
              <label>
                <input
                  defaultChecked={preference.webhookEnabled}
                  name="webhookEnabled"
                  type="checkbox"
                />
                <span>{labels.webhook}</span>
              </label>
              <button
                className="secondary-button secondary-button--compact"
                disabled={isPending}
                type="submit"
              >
                <Save size={15} aria-hidden="true" />
                <span>
                  {isPending && statusMessage ? labels.saving : labels.save}
                </span>
              </button>
              {statusMessage && statusMessage.status !== "idle" ? (
                <ActionMessage state={statusMessage} />
              ) : null}
            </form>
          );
        })}
      </div>
    </article>
  );
}

function ActionMessage({
  state,
}: {
  state: NotificationPreferenceActionState;
}) {
  return (
    <div
      className={
        state.status === "success"
          ? "action-message action-message--success"
          : "action-message action-message--error"
      }
    >
      {state.status === "success" ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <XCircle size={16} aria-hidden="true" />
      )}
      <span>{state.message}</span>
    </div>
  );
}

function getTopicCopy(
  locale: Locale,
  preference: NotificationPreferenceRecord,
) {
  return (
    topicCopy[locale][
      preference.eventType as keyof (typeof topicCopy)[typeof locale]
    ] ?? preference
  );
}
