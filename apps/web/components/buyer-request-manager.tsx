"use client";

import { useActionState } from "react";
import { CheckCircle2, ClipboardList, Gavel, Handshake, Plus, Send, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { BuyerRequestRecord } from "@/lib/ops-data";
import {
  createBuyerRequestAction,
  decideDeveloperBuyerRequestAction,
  updatePublisherBuyerRequestAction,
  type BuyerRequestActionState
} from "@/lib/buyer-request-actions";

type BuyerRequestManagerProps = {
  developerRequests: BuyerRequestRecord[];
  locale: Locale;
  mode?: "developer" | "exchange" | "publisher";
  publisherRequests: BuyerRequestRecord[];
};

const copy = {
  en: {
    bounty: "Bounty",
    category: "Category",
    claim: "Claim",
    claimedBy: "Claimed by",
    close: "Close",
    create: "Create request",
    creating: "Creating",
    currency: "Currency",
    decideReason: "Decision note",
    description: "Outcome",
    developerOnlyTitle: "Developer request board",
    dueAt: "Due date",
    emptyDeveloper: "No buyer requests opened by this workspace.",
    emptyPublisher: "No open or assigned buyer requests.",
    match: "Mark matched",
    mine: "My buyer requests",
    noOwner: "Unclaimed",
    publisher: "Demand board",
    publisherOnlyTitle: "Publisher demand board",
    status: "Status",
    submit: "Submit build",
    title: "Buyer request exchange",
    titleField: "Request title",
    cancel: "Cancel"
  },
  zh: {
    bounty: "悬赏",
    category: "分类",
    claim: "认领",
    claimedBy: "认领方",
    close: "关闭",
    create: "创建需求",
    creating: "创建中",
    currency: "币种",
    decideReason: "处理备注",
    description: "交付结果",
    developerOnlyTitle: "开发者需求板",
    dueAt: "截止日期",
    emptyDeveloper: "当前工作区还没有发布买家需求。",
    emptyPublisher: "暂无开放或已分配的买家需求。",
    match: "标记匹配",
    mine: "我的买家需求",
    noOwner: "未认领",
    publisher: "需求池",
    publisherOnlyTitle: "发布者需求池",
    status: "状态",
    submit: "提交构建",
    title: "买家需求交易台",
    titleField: "需求标题",
    cancel: "取消"
  }
} as const;

const statusCopy = {
  en: {
    canceled: "Canceled",
    claimed: "Claimed",
    closed: "Closed",
    matched: "Matched",
    open: "Open",
    submitted: "Submitted"
  },
  zh: {
    canceled: "已取消",
    claimed: "已认领",
    closed: "已关闭",
    matched: "已匹配",
    open: "开放中",
    submitted: "已提交"
  }
} as const;

const initialState: BuyerRequestActionState = {
  message: "",
  status: "idle"
};

export function BuyerRequestManager({ developerRequests, locale, mode = "exchange", publisherRequests }: BuyerRequestManagerProps) {
  const labels = copy[locale];
  const isDeveloperOnly = mode === "developer";
  const isPublisherOnly = mode === "publisher";
  const title = isPublisherOnly ? labels.publisherOnlyTitle : isDeveloperOnly ? labels.developerOnlyTitle : labels.title;
  const [createState, createAction, isCreating] = useActionState(
    createBuyerRequestAction.bind(null, locale),
    initialState
  );
  const [publisherState, publisherAction, isPublisherPending] = useActionState(
    updatePublisherBuyerRequestAction.bind(null, locale),
    initialState
  );
  const [developerState, developerAction, isDeveloperPending] = useActionState(
    decideDeveloperBuyerRequestAction.bind(null, locale),
    initialState
  );

  return (
    <article className="ops-panel buyer-request-manager">
      <div className="buyer-request-manager__head">
        <div className="card-kicker">
          <ClipboardList size={16} aria-hidden="true" />
          <span>{title}</span>
        </div>
      </div>

      {!isPublisherOnly ? (
        <form action={createAction} className="buyer-request-composer">
          <label className="buyer-request-composer__wide">
            <span>{labels.titleField}</span>
            <input name="title" placeholder="Figma comments to Linear issues" required />
          </label>
          <label>
            <span>{labels.category}</span>
            <input defaultValue="workflow" name="category" />
          </label>
          <label>
            <span>{labels.bounty}</span>
            <input defaultValue="600" min="0" name="bounty" step="1" type="number" />
          </label>
          <label>
            <span>{labels.currency}</span>
            <select defaultValue="usd" name="currency">
              <option value="usd">USD</option>
              <option value="cny">CNY</option>
            </select>
          </label>
          <label>
            <span>{labels.dueAt}</span>
            <input name="dueAt" type="date" />
          </label>
          <label className="buyer-request-composer__wide">
            <span>{labels.description}</span>
            <textarea name="description" placeholder="Convert annotated design feedback into scoped engineering tasks." required />
          </label>
          <button className="secondary-button" disabled={isCreating} type="submit">
            <Plus size={15} aria-hidden="true" />
            <span>{isCreating ? labels.creating : labels.create}</span>
          </button>
        </form>
      ) : null}

      {!isPublisherOnly && createState.status !== "idle" ? <ActionMessage state={createState} /> : null}

      <div className={isPublisherOnly || isDeveloperOnly ? "buyer-request-board buyer-request-board--single" : "buyer-request-board"}>
        {!isDeveloperOnly ? (
        <section className="buyer-request-board__section">
          <header>
            <strong>{labels.publisher}</strong>
            <span>{publisherRequests.length}</span>
          </header>
          <div className="buyer-request-list">
            {publisherRequests.length > 0 ? (
              publisherRequests.map((request) => {
                const rowState = publisherState.requestId === request.id ? publisherState : null;
                const action = getPublisherAction(request);

                return (
                  <div className="buyer-request-item" key={request.id}>
                    <div className="buyer-request-item__main">
                      <strong>{request.title}</strong>
                      <span>{request.description}</span>
                    </div>
                    <div className="buyer-request-item__meta">
                      <span>{request.category}</span>
                      <span>{formatMoney(request.bountyCents, request.currency)}</span>
                      <span className={statusChipClass(request.status)}>{statusCopy[locale][request.status]}</span>
                    </div>
                    <div className="buyer-request-item__owner">
                      <span>{labels.claimedBy}</span>
                      <strong>{request.claimedByPublisherName ?? labels.noOwner}</strong>
                    </div>
                    {action ? (
                      <form action={publisherAction} className="buyer-request-row-action">
                        <input name="requestId" type="hidden" value={request.id} />
                        <button
                          className="secondary-button secondary-button--compact"
                          disabled={isPublisherPending}
                          name="action"
                          type="submit"
                          value={action}
                        >
                          {action === "claim" ? <Handshake size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                          <span>{action === "claim" ? labels.claim : labels.submit}</span>
                        </button>
                      </form>
                    ) : (
                      <span className="status-chip status-chip--neutral">{localizeNextAction(request.nextAction, locale)}</span>
                    )}
                    {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
                  </div>
                );
              })
            ) : (
              <div className="buyer-request-empty">{labels.emptyPublisher}</div>
            )}
          </div>
        </section>
        ) : null}

        {!isPublisherOnly ? (
        <section className="buyer-request-board__section">
          <header>
            <strong>{labels.mine}</strong>
            <span>{developerRequests.length}</span>
          </header>
          <div className="buyer-request-list">
            {developerRequests.length > 0 ? (
              developerRequests.map((request) => {
                const rowState = developerState.requestId === request.id ? developerState : null;
                const decisions = getDeveloperDecisions(request.status);

                return (
                  <div className="buyer-request-item" key={request.id}>
                    <div className="buyer-request-item__main">
                      <strong>{request.title}</strong>
                      <span>{request.description}</span>
                    </div>
                    <div className="buyer-request-item__meta">
                      <span>{formatDueDate(request.dueAt, locale)}</span>
                      <span>{formatMoney(request.bountyCents, request.currency)}</span>
                      <span className={statusChipClass(request.status)}>{statusCopy[locale][request.status]}</span>
                    </div>
                    <div className="buyer-request-item__owner">
                      <span>{labels.claimedBy}</span>
                      <strong>{request.claimedByPublisherName ?? labels.noOwner}</strong>
                    </div>
                    {decisions.length > 0 ? (
                      <form action={developerAction} className="buyer-request-decision-form">
                        <input name="requestId" type="hidden" value={request.id} />
                        <input name="reason" placeholder={labels.decideReason} />
                        <div>
                          {decisions.map((decision) => (
                            <button
                              className={decision === "canceled" ? "ghost-button ghost-button--danger" : "secondary-button secondary-button--compact"}
                              disabled={isDeveloperPending}
                              key={decision}
                              name="decision"
                              type="submit"
                              value={decision}
                            >
                              {decision === "matched" ? <Gavel size={15} aria-hidden="true" /> : <XCircle size={15} aria-hidden="true" />}
                              <span>{decisionLabel(decision, labels)}</span>
                            </button>
                          ))}
                        </div>
                      </form>
                    ) : (
                      <span className="status-chip status-chip--neutral">{localizeNextAction(request.nextAction, locale)}</span>
                    )}
                    {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
                  </div>
                );
              })
            ) : (
              <div className="buyer-request-empty">{labels.emptyDeveloper}</div>
            )}
          </div>
        </section>
        ) : null}
      </div>
    </article>
  );
}

function ActionMessage({ state }: { state: BuyerRequestActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function getPublisherAction(request: BuyerRequestRecord) {
  if (request.canClaim) {
    return "claim";
  }

  if (request.nextAction === "Submit build") {
    return "submit";
  }

  return null;
}

function getDeveloperDecisions(status: BuyerRequestRecord["status"]) {
  if (status === "submitted") {
    return ["matched", "closed", "canceled"] as const;
  }

  if (status === "matched") {
    return ["closed"] as const;
  }

  if (status === "open" || status === "claimed") {
    return ["canceled", "closed"] as const;
  }

  return [];
}

function decisionLabel(decision: "matched" | "closed" | "canceled", labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  if (decision === "matched") {
    return labels.match;
  }

  if (decision === "closed") {
    return labels.close;
  }

  return labels.cancel;
}

function statusChipClass(status: BuyerRequestRecord["status"]) {
  if (status === "canceled" || status === "closed") {
    return "status-chip status-chip--danger";
  }

  if (status === "claimed" || status === "submitted") {
    return "status-chip status-chip--warning";
  }

  if (status === "matched") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function localizeNextAction(action: string, locale: Locale) {
  if (locale === "en") {
    return action;
  }

  const zhActions: Record<string, string> = {
    "Await buyer match": "等待买方匹配",
    Canceled: "已取消",
    "Claim request": "认领需求",
    Closed: "已关闭",
    "Convert to skill listing": "转为技能上架",
    "Submit build": "提交构建",
    "Watch request": "关注需求"
  };

  return zhActions[action] ?? action;
}

function formatDueDate(value: string | null, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "无截止日期" : "No due date";
  }

  if (value === "demo") {
    return locale === "zh" ? "演示日期" : "Demo date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
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
