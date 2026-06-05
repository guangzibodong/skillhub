"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { Banknote, CheckCircle2, Clock3, ReceiptText, Save, WalletCards, XCircle } from "lucide-react";
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
    account: "Account",
    action: "Action",
    amount: "Amount",
    approve: "Approve",
    balanceCount: "Balances",
    block: "Block",
    empty: "No payouts require finance review.",
    fail: "Fail",
    markPaid: "Mark paid",
    paid: "Paid",
    providerReference: "Provider reference",
    reason: "Finance note",
    requested: "Requested",
    save: "Record decision",
    saving: "Saving",
    status: "Status",
    title: "Payout review queue",
    statuses: {
      blocked: "Blocked",
      failed: "Failed",
      paid: "Paid",
      processing: "Processing",
      requested: "Requested",
      review: "In review",
      verified: "Verified"
    }
  },
  zh: {
    account: "账户",
    action: "动作",
    amount: "金额",
    approve: "批准",
    balanceCount: "余额项",
    block: "阻断",
    empty: "当前没有需要财务审核的提现。",
    fail: "失败",
    markPaid: "标记已打款",
    paid: "打款",
    providerReference: "服务商参考",
    reason: "财务备注",
    requested: "申请时间",
    save: "记录决策",
    saving: "保存中",
    status: "状态",
    title: "提现审核队列",
    statuses: {
      blocked: "已阻断",
      failed: "失败",
      paid: "已打款",
      processing: "处理中",
      requested: "已申请",
      review: "审核中",
      verified: "已验证"
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
                  <StatusTile
                    icon={<WalletCards size={15} aria-hidden="true" />}
                    label={labels.account}
                    value={`${latest.provider ?? "n/a"} / ${formatStatusLabel(latest.accountStatus ?? "n/a", labels.statuses)}`}
                  />
                  <StatusTile icon={<Clock3 size={15} aria-hidden="true" />} label={labels.requested} value={formatDate(latest.requestedAt, locale)} />
                </div>

                {note || latest.providerReference ? (
                  <div className="admin-payout-note">
                    <ReceiptText size={15} aria-hidden="true" />
                    <span>
                      {note}
                      {latest.providerReference ? ` / ${latest.providerReference}` : ""}
                    </span>
                  </div>
                ) : null}

                <form action={action} className="admin-payout-action-form">
                  <input name="payoutId" type="hidden" value={latest.id} />
                  <label>
                    <span>{labels.action}</span>
                    <select defaultValue={suggestedAction(latest)} name="action">
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
                    <span>{labels.providerReference}</span>
                    <input defaultValue={latest.providerReference ?? ""} name="providerReference" />
                  </label>
                  <button className="secondary-button secondary-button--compact" disabled={isPending || isTerminal(latest.status)} type="submit">
                    <Save size={15} aria-hidden="true" />
                    <span>{isPending && rowState ? labels.saving : labels.save}</span>
                  </button>
                </form>

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

function ActionMessage({ state }: { state: AdminPayoutActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
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
    return locale === "zh" ? "服务商打款完成，准备记录付款参考。" : "Provider payout completed; recording payment reference.";
  }

  return locale === "zh" ? "KYC、余额和风险审核通过。" : "KYC, balance, and risk review passed.";
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
    return locale === "zh" ? "已完成打款，不能再次处理。" : "Paid out; no further action is available.";
  }

  if (status === "failed") {
    return locale === "zh" ? "已失败，余额已释放回可用状态。" : "Failed; reserved balances were released.";
  }

  return locale === "zh" ? "已阻断，需后续财务复核。" : "Blocked pending follow-up finance review.";
}

function formatStatusLabel(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
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
