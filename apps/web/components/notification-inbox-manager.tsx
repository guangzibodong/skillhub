"use client";

import { useActionState } from "react";
import { BellRing, CheckCircle2, Circle, ExternalLink, MailCheck, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import { markNotificationReadAction, type NotificationInboxActionState } from "@/lib/notification-inbox-actions";
import type { UserNotificationRecord } from "@/lib/ops-data";

type NotificationInboxManagerProps = {
  locale: Locale;
  notifications: UserNotificationRecord[];
};

const copy = {
  en: {
    empty: "No in-app notifications yet.",
    markRead: "Mark read",
    read: "Read",
    title: "Notification inbox",
    unread: "Unread",
    view: "Open"
  },
  zh: {
    empty: "暂无站内通知。",
    markRead: "标记已读",
    read: "已读",
    title: "通知收件箱",
    unread: "未读",
    view: "打开"
  }
} as const;

const topicCopy = {
  en: {
    account: "Account",
    billing: "Billing",
    buyer: "Buyer request",
    payout: "Payout",
    review: "Review",
    runtime: "Runtime",
    skill: "Skill update",
    trust: "Trust"
  },
  zh: {
    account: "账户",
    billing: "账单",
    buyer: "买家需求",
    payout: "提现",
    review: "审核",
    runtime: "运行",
    skill: "技能更新",
    trust: "信任安全"
  }
} as const;

const initialState: NotificationInboxActionState = {
  message: "",
  status: "idle"
};

export function NotificationInboxManager({ locale, notifications }: NotificationInboxManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(markNotificationReadAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel notification-inbox-panel">
      <div className="card-kicker">
        <BellRing size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="notification-inbox-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const unread = notification.status === "queued";
            const statusMessage = state.notificationId === notification.id ? state : null;
            const targetHref = getNotificationHref(notification, locale);

            return (
              <section className={unread ? "notification-inbox-card notification-inbox-card--unread" : "notification-inbox-card"} key={notification.id}>
                <div className="notification-inbox-card__head">
                  <span className={unread ? "status-chip status-chip--warning" : "status-chip status-chip--neutral"}>
                    {unread ? <Circle size={10} aria-hidden="true" /> : <MailCheck size={13} aria-hidden="true" />}
                    {unread ? labels.unread : labels.read}
                  </span>
                  <span>{topicLabel(notification.eventType, locale)}</span>
                </div>
                <strong>{notification.subject ?? notification.eventType}</strong>
                <p>{notificationSummary(notification, locale)}</p>
                <div className="notification-inbox-card__foot">
                  <small>{formatDate(notification.createdAt, locale)}</small>
                  {targetHref ? (
                    <a className="ghost-button ghost-button--inline" href={targetHref}>
                      <ExternalLink size={14} aria-hidden="true" />
                      <span>{labels.view}</span>
                    </a>
                  ) : null}
                  {unread ? (
                    <form action={action}>
                      <input name="notificationId" type="hidden" value={notification.id} />
                      <button className="secondary-button secondary-button--compact" disabled={isPending} type="submit">
                        <CheckCircle2 size={15} aria-hidden="true" />
                        <span>{labels.markRead}</span>
                      </button>
                    </form>
                  ) : null}
                </div>
                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
              </section>
            );
          })
        ) : (
          <div className="notification-inbox-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ActionMessage({ state }: { state: NotificationInboxActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function topicLabel(eventType: string, locale: Locale) {
  const topic = topicFromEvent(eventType);
  return topicCopy[locale][topic];
}

function topicFromEvent(eventType: string): keyof (typeof topicCopy)["en"] {
  if (eventType.includes("buyer_request") || eventType.includes("buyer.request")) {
    return "buyer";
  }

  if (eventType.includes("payout")) {
    return "payout";
  }

  if (eventType.includes("billing") || eventType.includes("invoice") || eventType.includes("refund") || eventType.includes("dispute")) {
    return "billing";
  }

  if (eventType.includes("review")) {
    return "review";
  }

  if (eventType.includes("runtime") || eventType.includes("incident")) {
    return "runtime";
  }

  if (eventType.includes("trust") || eventType.includes("abuse")) {
    return "trust";
  }

  if (eventType.includes("account") || eventType.includes("api_key")) {
    return "account";
  }

  return "skill";
}

function notificationSummary(notification: UserNotificationRecord, locale: Locale) {
  const payload = notification.payload ?? {};
  const values = [
    textValue(payload.title),
    textValue(payload.skillSlug),
    textValue(payload.projectSlug),
    textValue(payload.currency) && typeof payload.amountCents === "number" ? formatMoney(payload.amountCents, String(payload.currency)) : null,
    textValue(payload.status),
    textValue(payload.reason)
  ].filter(Boolean);

  if (values.length > 0) {
    return values.slice(0, 3).join(" / ");
  }

  return locale === "zh" ? "查看这条运营事件的最新状态。" : "Review the latest state for this operating event.";
}

function getNotificationHref(notification: UserNotificationRecord, locale: Locale) {
  const payload = notification.payload ?? {};
  const projectSlug = textValue(payload.projectSlug);
  const skillSlug = textValue(payload.skillSlug);

  if (projectSlug) {
    return localizedHref(`/dashboard/projects/${projectSlug}`, locale);
  }

  if (skillSlug) {
    return localizedHref(`/skills/${skillSlug}`, locale);
  }

  if (topicFromEvent(notification.eventType) === "trust") {
    return localizedHref("/admin", locale);
  }

  return localizedHref("/dashboard", locale);
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function formatDate(value: string, locale: Locale) {
  if (value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
}

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format(cents / 100);
}
