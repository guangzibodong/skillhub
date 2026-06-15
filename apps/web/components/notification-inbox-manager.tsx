"use client";

import { useActionState } from "react";
import { BellRing, CheckCircle2, Circle, ExternalLink, MailCheck, XCircle } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationInboxActionState
} from "@/lib/notification-inbox-actions";
import type { UserNotificationRecord, UserNotificationSummary } from "@/lib/ops-data";

type NotificationInboxManagerProps = {
  locale: Locale;
  notifications: UserNotificationRecord[];
  summary?: UserNotificationSummary;
};

const copy = {
  en: {
    empty: "No in-app notifications yet.",
    markAllRead: "Mark all read",
    markRead: "Mark read",
    read: "Read",
    title: "Notification inbox",
    topics: "Topics",
    total: "Total",
    unread: "Unread",
    view: "Open"
  },
  zh: {
    empty: "暂无站内通知。",
    markAllRead: "全部已读",
    markRead: "标记已读",
    read: "已读",
    title: "通知收件箱",
    topics: "主题",
    total: "总数",
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

export function NotificationInboxManager({ locale, notifications, summary }: NotificationInboxManagerProps) {
  const labels = copy[locale];
  const inboxSummary = summary ?? summarizeNotifications(notifications);
  const [state, action, isPending] = useActionState(markNotificationReadAction.bind(null, locale), initialState);
  const [allState, markAllAction, isMarkAllPending] = useActionState(markAllNotificationsReadAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel notification-inbox-panel">
      <div className="notification-inbox-panel__head">
        <div className="card-kicker">
          <BellRing size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <form action={markAllAction}>
          <button className="secondary-button secondary-button--compact" disabled={inboxSummary.unread === 0 || isMarkAllPending} type="submit">
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>{labels.markAllRead}</span>
          </button>
        </form>
      </div>

      <div className="notification-inbox-summary" aria-label={labels.title}>
        <span>
          <strong>{inboxSummary.unread}</strong>
          {labels.unread}
        </span>
        <span>
          <strong>{inboxSummary.total}</strong>
          {labels.total}
        </span>
        {inboxSummary.topics.length > 0 ? (
          <span className="notification-inbox-summary__topics">
            <strong>{labels.topics}</strong>
            {inboxSummary.topics.slice(0, 3).map((topic) => `${topicLabel(topic.topic, locale)} ${topic.unreadCount}/${topic.count}`).join(" · ")}
          </span>
        ) : null}
      </div>

      {allState.status !== "idle" ? <ActionMessage state={allState} /> : null}

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

function topicLabel(value: string, locale: Locale) {
  const topic = value in topicCopy.en ? (value as keyof (typeof topicCopy)["en"]) : topicFromEvent(value);
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

  if (eventType.includes("review") || eventType.includes("feedback")) {
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
    return values.slice(0, 3).join(locale === "zh" ? "、" : " / ");
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

function summarizeNotifications(notifications: UserNotificationRecord[]): UserNotificationSummary {
  const topics = new Map<string, UserNotificationSummary["topics"][number]>();
  const summary: UserNotificationSummary = {
    failed: 0,
    read: 0,
    skipped: 0,
    topics: [],
    total: notifications.length,
    unread: 0
  };

  for (const notification of notifications) {
    if (notification.status === "queued") {
      summary.unread += 1;
    } else if (notification.status === "sent") {
      summary.read += 1;
    } else if (notification.status === "failed") {
      summary.failed += 1;
    } else if (notification.status === "skipped") {
      summary.skipped += 1;
    }

    const topic = topicFromEvent(notification.eventType);
    const current = topics.get(topic) ?? {
      count: 0,
      topic,
      unreadCount: 0
    };
    current.count += 1;
    current.unreadCount += notification.status === "queued" ? 1 : 0;
    topics.set(topic, current);
  }

  summary.topics = Array.from(topics.values()).sort(
    (first, second) => second.unreadCount - first.unreadCount || second.count - first.count || first.topic.localeCompare(second.topic)
  );

  return summary;
}
