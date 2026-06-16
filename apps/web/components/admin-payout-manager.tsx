"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Banknote, CheckCircle2, Clock3, ReceiptText, RotateCcw, Save, UserRound, WalletCards, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PayoutRecord } from "@/lib/ops-data";
import { formatMoney } from "@/lib/ops-format";
import { decideAdminPayoutAction, type AdminPayoutActionState } from "@/lib/admin-payout-actions";

type AdminPayoutManagerProps = {
  locale: Locale;
  payouts: PayoutRecord[];
};

const copy = {
  en: {
    account: "Receiving account",
    accountHolder: "Account holder",
    action: "Action",
    amount: "Amount",
    approve: "Approve",
    balanceCount: "Reserved balances",
    block: "Block",
    chooseAction: "Choose finance action",
    confirmActions: {
      approve: "Approve this payout for manual transfer? No money is marked paid until a transfer reference is recorded.",
      block: "Block this payout? The publisher must satisfy the retry condition before requesting again.",
      fail: "Mark this payout as failed? Reserved balances may be released according to the backend workflow.",
      mark_paid: "Mark this payout as paid? Confirm the transfer reference is correct before continuing."
    },
    empty: "No payouts require finance review.",
    fail: "Fail",
    markPaid: "Mark paid",
    manualMethod: "Method",
    nextAction: "Next action",
    paid: "Paid",
    reason: "Finance note",
    requested: "Requested",
    retryCondition: "Retry condition",
    retryHint: "Required when blocking. Tell the publisher exactly what unlocks another request.",
    save: "Record decision",
    saving: "Saving",
    status: "Status",
    title: "Manual payout review queue",
    transferReference: "Transfer reference",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    statuses: {
      blocked: "Blocked",
      failed: "Failed",
      paid: "Paid",
      processing: "Processing",
      requested: "Requested",
      review: "In review",
      verified: "Verified"
    },
    nextActions: {
      await_finance_review: "Review account details, risk, and reserved balance items before manual transfer.",
      await_provider_processing: "Manual transfer is approved; mark paid when the transfer reference is available.",
      complete: "No further finance action is available.",
      request_again_after_failure: "Balances were released; publisher can retry after the account or transfer issue is fixed.",
      resolve_blocker_before_retry: "Publisher must resolve the retry condition before a new payout request."
    }
  },
  zh: {
    account: "\u6536\u6b3e\u8d26\u53f7",
    accountHolder: "\u6536\u6b3e\u4eba",
    action: "\u52a8\u4f5c",
    amount: "\u91d1\u989d",
    approve: "\u6279\u51c6",
    balanceCount: "\u9501\u5b9a\u4f59\u989d",
    block: "\u963b\u65ad",
    chooseAction: "\u8bf7\u9009\u62e9\u8d22\u52a1\u52a8\u4f5c",
    confirmActions: {
      approve: "\u786e\u8ba4\u6279\u51c6\u8be5\u63d0\u73b0\u8fdb\u5165\u624b\u5de5\u8f6c\u8d26\uff1f\u6b64\u64cd\u4f5c\u4e0d\u4f1a\u76f4\u63a5\u6807\u8bb0\u5df2\u6253\u6b3e\u3002",
      block: "\u786e\u8ba4\u963b\u65ad\u8be5\u63d0\u73b0\uff1f\u53d1\u5e03\u8005\u9700\u8981\u6ee1\u8db3\u518d\u6b21\u7533\u8bf7\u6761\u4ef6\u540e\u624d\u80fd\u91cd\u8bd5\u3002",
      fail: "\u786e\u8ba4\u6807\u8bb0\u8be5\u63d0\u73b0\u5931\u8d25\uff1f\u540e\u7aef\u6d41\u7a0b\u53ef\u80fd\u4f1a\u91ca\u653e\u9501\u5b9a\u4f59\u989d\u3002",
      mark_paid: "\u786e\u8ba4\u6807\u8bb0\u5df2\u6253\u6b3e\uff1f\u8bf7\u5148\u6838\u5bf9\u8f6c\u8d26\u51ed\u8bc1\u6216\u6d41\u6c34\u53f7\u3002"
    },
    empty: "\u5f53\u524d\u6ca1\u6709\u9700\u8981\u8d22\u52a1\u5ba1\u6838\u7684\u63d0\u73b0\u3002",
    fail: "\u5931\u8d25",
    markPaid: "\u6807\u8bb0\u5df2\u6253\u6b3e",
    manualMethod: "\u6536\u6b3e\u65b9\u5f0f",
    nextAction: "\u4e0b\u4e00\u6b65",
    paid: "\u5df2\u6253\u6b3e",
    reason: "\u8d22\u52a1\u5907\u6ce8",
    requested: "\u7533\u8bf7\u65f6\u95f4",
    retryCondition: "\u518d\u6b21\u7533\u8bf7\u6761\u4ef6",
    retryHint: "\u963b\u65ad\u65f6\u5fc5\u987b\u586b\u5199\u3002\u8981\u660e\u786e\u544a\u8bc9\u53d1\u5e03\u8005\u6ee1\u8db3\u4ec0\u4e48\u6761\u4ef6\u624d\u80fd\u518d\u6b21\u7533\u8bf7\u3002",
    save: "\u8bb0\u5f55\u51b3\u7b56",
    saving: "\u4fdd\u5b58\u4e2d",
    status: "\u72b6\u6001",
    title: "\u624b\u5de5\u6253\u6b3e\u5ba1\u6838\u961f\u5217",
    transferReference: "\u8f6c\u8d26\u51ed\u8bc1/\u6d41\u6c34\u53f7",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    statuses: {
      blocked: "\u5df2\u963b\u65ad",
      failed: "\u5931\u8d25",
      paid: "\u5df2\u6253\u6b3e",
      processing: "\u5904\u7406\u4e2d",
      requested: "\u5df2\u7533\u8bf7",
      review: "\u5ba1\u6838\u4e2d",
      verified: "\u5df2\u9a8c\u8bc1"
    },
    nextActions: {
      await_finance_review: "\u8f6c\u8d26\u524d\u5ba1\u6838\u6536\u6b3e\u8d44\u6599\u3001\u98ce\u9669\u548c\u9501\u5b9a\u4f59\u989d\u660e\u7ec6\u3002",
      await_provider_processing: "\u624b\u5de5\u6253\u6b3e\u5df2\u6279\u51c6\uff1b\u62ff\u5230\u8f6c\u8d26\u51ed\u8bc1\u540e\u6807\u8bb0\u5df2\u6253\u6b3e\u3002",
      complete: "\u65e0\u9700\u7ee7\u7eed\u5904\u7406\u3002",
      request_again_after_failure: "\u4f59\u989d\u5df2\u91ca\u653e\uff1b\u6536\u6b3e\u8d26\u53f7\u6216\u8f6c\u8d26\u95ee\u9898\u4fee\u590d\u540e\u53d1\u5e03\u8005\u53ef\u4ee5\u91cd\u8bd5\u3002",
      resolve_blocker_before_retry: "\u53d1\u5e03\u8005\u5fc5\u987b\u6ee1\u8db3\u518d\u6b21\u7533\u8bf7\u6761\u4ef6\uff0c\u624d\u80fd\u91cd\u65b0\u53d1\u8d77\u63d0\u73b0\u3002"
    }
  }
} as const;

const initialState: AdminPayoutActionState = {
  message: "",
  status: "idle"
};

export function AdminPayoutManager({ locale, payouts }: AdminPayoutManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(decideAdminPayoutAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel admin-payout-manager">
      <div className="admin-payout-manager__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className="status-chip status-chip--neutral">{payouts.length}</span>
      </div>

      <div className="admin-payout-list">
        {payouts.length > 0 ? (
          payouts.map((payout) => {
            const rowState = state.payoutId === payout.id ? state : null;
            const latest = rowState?.payout ?? payout;
            const note = latest.failureReason ?? latest.reviewReason ?? null;

            return (
              <section className="admin-payout-card" key={payout.id}>
                <header className="admin-payout-card__head">
                  <div>
                    <strong>{latest.publisherName}</strong>
                    <span>{latest.id}</span>
                  </div>
                  <span className={statusClass(latest.status)}>{labels.statuses[latest.status]}</span>
                </header>

                <div className="admin-payout-metrics">
                  <StatusTile icon={<Banknote size={15} aria-hidden="true" />} label={labels.amount} value={formatMoney(latest.amountCents, latest.currency)} />
                  <StatusTile icon={<ReceiptText size={15} aria-hidden="true" />} label={labels.balanceCount} value={String(latest.balanceCount)} />
                  <StatusTile icon={<WalletCards size={15} aria-hidden="true" />} label={labels.manualMethod} value={formatManualMethod(latest.manualMethod, labels.manualMethods)} />
                  <StatusTile icon={<ReceiptText size={15} aria-hidden="true" />} label={labels.account} value={maskManualAccount(latest.manualAccount)} />
                  <StatusTile icon={<UserRound size={15} aria-hidden="true" />} label={labels.accountHolder} value={latest.manualAccountHolder ?? "n/a"} />
                  <StatusTile icon={<Clock3 size={15} aria-hidden="true" />} label={labels.requested} value={formatDate(latest.requestedAt, locale)} />
                </div>

                <div className="admin-payout-next">
                  <RotateCcw size={15} aria-hidden="true" />
                  <div>
                    <strong>{labels.nextAction}</strong>
                    <span>{formatNextAction(latest.nextAction, labels.nextActions)}</span>
                  </div>
                </div>

                {note || latest.retryCondition || latest.providerReference || latest.manualNotes ? (
                  <div className="admin-payout-note">
                    <AlertTriangle size={15} aria-hidden="true" />
                    <span>
                      {[note, latest.retryCondition, latest.providerReference, latest.manualNotes].filter(Boolean).join(" / ")}
                    </span>
                  </div>
                ) : null}

                <PayoutDecisionForm
                  action={action}
                  isPending={isPending}
                  labels={labels}
                  latest={latest}
                  locale={locale}
                  rowState={rowState}
                />

                {isTerminal(latest.status) ? <span className="admin-payout-terminal">{terminalLabel(latest.status, locale)}</span> : null}
                {rowState && rowState.status !== "idle" ? <ActionMessage state={rowState} /> : null}
              </section>
            );
          })
        ) : (
          <div className="admin-payout-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function StatusTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function maskManualAccount(value: string | null | undefined) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return "n/a";
  }

  const emailMatch = /^([^@\s]+)@([^@\s]+)$/.exec(normalized);

  if (emailMatch) {
    const [, localPart, domain] = emailMatch;
    const visibleLocal = localPart.length <= 2 ? localPart[0] ?? "*" : localPart.slice(0, 2);
    const visibleDomain = domain.length <= 3 ? domain[0] ?? "*" : domain.slice(0, 3);
    return `${visibleLocal}***@${visibleDomain}***`;
  }

  if (normalized.length <= 6) {
    return `${normalized.slice(0, 1)}***${normalized.slice(-1)}`;
  }

  return `${normalized.slice(0, 2)}***${normalized.slice(-3)}`;
}

function ActionMessage({ state }: { state: AdminPayoutActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

type PayoutAction = "approve" | "block" | "fail" | "mark_paid";

function PayoutDecisionForm({
  action,
  isPending,
  labels,
  latest,
  locale,
  rowState
}: {
  action: (payload: FormData) => void;
  isPending: boolean;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  latest: PayoutRecord;
  locale: Locale;
  rowState: AdminPayoutActionState | null;
}) {
  const [selectedAction, setSelectedAction] = useState<PayoutAction | "">("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!selectedAction) {
      event.preventDefault();
      return;
    }

    if (!window.confirm(labels.confirmActions[selectedAction])) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} className="admin-payout-action-form admin-payout-action-form--explainable" onSubmit={handleSubmit}>
      <input name="payoutId" type="hidden" value={latest.id} />
      <label>
        <span>{labels.action}</span>
        <select
          name="action"
          onChange={(event) => setSelectedAction(event.target.value as PayoutAction | "")}
          required
          value={selectedAction}
        >
          <option value="">{labels.chooseAction}</option>
          <option value="approve">{labels.approve}</option>
          <option value="mark_paid">{labels.markPaid}</option>
          <option value="fail">{labels.fail}</option>
          <option value="block">{labels.block}</option>
        </select>
      </label>
      <label>
        <span>{labels.reason}</span>
        <input defaultValue={defaultReason(latest, locale)} name="reason" required />
      </label>
      <label>
        <span>{labels.retryCondition}</span>
        <input
          aria-describedby={`retry-${latest.id}`}
          defaultValue={defaultRetryCondition(latest, locale)}
          name="retryCondition"
          required={selectedAction === "block"}
        />
        <small id={`retry-${latest.id}`}>{labels.retryHint}</small>
      </label>
      <label>
        <span>{labels.transferReference}</span>
        <input defaultValue={latest.providerReference ?? ""} name="providerReference" required={selectedAction === "mark_paid"} />
      </label>
      <button className="secondary-button secondary-button--compact" disabled={isPending || isTerminal(latest.status) || !selectedAction} type="submit">
        <Save size={15} aria-hidden="true" />
        <span>{isPending && rowState ? labels.saving : labels.save}</span>
      </button>
    </form>
  );
}

function suggestedAction(payout: PayoutRecord) {
  if (payout.status === "processing") {
    return "mark_paid";
  }

  if (payout.status === "failed") {
    return "fail";
  }

  if (payout.status === "blocked") {
    return "block";
  }

  return "approve";
}

function defaultReason(payout: PayoutRecord, locale: Locale) {
  if (payout.failureReason) {
    return payout.failureReason;
  }

  if (payout.reviewReason) {
    return payout.reviewReason;
  }

  if (payout.status === "processing") {
    return locale === "zh"
      ? "\u624b\u5de5\u6253\u6b3e\u5b8c\u6210\uff0c\u51c6\u5907\u8bb0\u5f55\u8f6c\u8d26\u51ed\u8bc1\u3002"
      : "Manual transfer completed; recording transfer reference.";
  }

  return locale === "zh"
    ? "\u6536\u6b3e\u8d44\u6599\u3001\u4f59\u989d\u548c\u98ce\u9669\u5ba1\u6838\u901a\u8fc7\u3002"
    : "Receiving account, balance, and risk review passed.";
}

function defaultRetryCondition(payout: PayoutRecord, locale: Locale) {
  if (payout.retryCondition) {
    return payout.retryCondition;
  }

  if (payout.status === "failed") {
    return locale === "zh"
      ? "\u6536\u6b3e\u8d26\u53f7\u6216\u8f6c\u8d26\u95ee\u9898\u4fee\u590d\u540e\uff0c\u4f59\u989d\u91ca\u653e\u4e3a\u53ef\u7528\u5373\u53ef\u91cd\u65b0\u7533\u8bf7\u3002"
      : "Retry after the receiving-account or transfer issue is fixed and balances return to available.";
  }

  if (payout.status === "blocked") {
    return locale === "zh"
      ? "\u8865\u9f50\u8d22\u52a1\u8981\u6c42\u7684\u6750\u6599\u6216\u66f4\u65b0\u6536\u6b3e\u8d26\u6237\u540e\uff0c\u518d\u91cd\u65b0\u7533\u8bf7\u63d0\u73b0\u3002"
      : "Provide the required finance evidence or update the receiving account before requesting again.";
  }

  return locale === "zh"
    ? "\u5982\u679c\u9009\u62e9\u963b\u65ad\uff0c\u8bf7\u5199\u6e05\u695a\u518d\u6b21\u7533\u8bf7\u9700\u8981\u6ee1\u8db3\u7684\u6761\u4ef6\u3002"
    : "If blocking, describe the condition required before the publisher can request again.";
}

function statusClass(status: PayoutRecord["status"]) {
  if (status === "paid" || status === "processing") {
    return "status-chip";
  }

  if (status === "failed" || status === "blocked") {
    return "status-chip status-chip--danger";
  }

  if (status === "review" || status === "requested") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function isTerminal(status: PayoutRecord["status"]) {
  return status === "paid" || status === "failed" || status === "blocked";
}

function terminalLabel(status: PayoutRecord["status"], locale: Locale) {
  if (status === "paid") {
    return locale === "zh"
      ? "\u5df2\u5b8c\u6210\u6253\u6b3e\uff0c\u4e0d\u80fd\u518d\u6b21\u5904\u7406\u3002"
      : "Paid out; no further action is available.";
  }

  if (status === "failed") {
    return locale === "zh"
      ? "\u5df2\u5931\u8d25\uff0c\u9501\u5b9a\u4f59\u989d\u5df2\u91ca\u653e\u56de\u53ef\u7528\u72b6\u6001\u3002"
      : "Failed; reserved balances were released.";
  }

  return locale === "zh"
    ? "\u5df2\u963b\u65ad\uff0c\u53d1\u5e03\u8005\u5fc5\u987b\u6ee1\u8db3\u518d\u6b21\u7533\u8bf7\u6761\u4ef6\u3002"
    : "Blocked; publisher must satisfy the retry condition before retrying.";
}

function formatManualMethod(method: string | null | undefined, labels: Record<string, string>) {
  return method ? (labels[method] ?? method.replaceAll("_", " ")) : "n/a";
}

function formatNextAction(action: string | null | undefined, labels: Record<string, string>) {
  if (!action) {
    return labels.await_finance_review;
  }

  return labels[action] ?? action.replaceAll("_", " ");
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value || value === "demo") {
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
