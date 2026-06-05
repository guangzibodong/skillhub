"use client";

import { useActionState } from "react";
import { Banknote, CheckCircle2, Clock3, Send, WalletCards, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/ops-format";
import type { PublisherPayoutSummary } from "@/lib/ops-data";
import { requestPublisherPayoutAction, type PublisherPayoutActionState } from "@/lib/publisher-payout-actions";

type PublisherPayoutManagerProps = {
  locale: Locale;
  summary: PublisherPayoutSummary;
};

const copy = {
  en: {
    account: "Payout account",
    available: "Available",
    blocked: "Blocked",
    cannotRequest: "A verified payout account and balance above the threshold are required before payout.",
    minimum: "Minimum",
    pending: "Pending",
    request: "Request payout",
    requesting: "Requesting",
    status: "Readiness",
    title: "Withdrawal readiness",
    statuses: {
      blocked: "Blocked",
      failed: "Failed",
      not_configured: "Not configured",
      paid: "Paid",
      processing: "Processing",
      requested: "Requested",
      review: "In review",
      verification_required: "Needs verification",
      verified: "Verified"
    }
  },
  zh: {
    account: "提现账户",
    available: "可提现",
    blocked: "锁定中",
    cannotRequest: "需要已验证的收款账户，并且可提现余额达到门槛后才能申请提现。",
    minimum: "最低提现",
    pending: "待结算",
    request: "申请提现",
    requesting: "申请中",
    status: "准备状态",
    title: "提现准备",
    statuses: {
      blocked: "已阻断",
      failed: "失败",
      not_configured: "未配置",
      paid: "已打款",
      processing: "处理中",
      requested: "已申请",
      review: "审核中",
      verification_required: "需要验证",
      verified: "已验证"
    }
  }
} as const;

const initialState: PublisherPayoutActionState = {
  message: "",
  status: "idle"
};

export function PublisherPayoutManager({ locale, summary }: PublisherPayoutManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(requestPublisherPayoutAction.bind(null, locale), initialState);
  const profile = summary.publisherProfile;
  const payoutAccount = summary.payoutAccounts[0];
  const latestPayout = state.payout ?? summary.payouts[0];
  const payoutReady = profile?.payoutStatus === "verified" && payoutAccount?.status === "verified";
  const amountReady = summary.balances.availableCents >= summary.balances.minPayoutCents;
  const canRequest = payoutReady && amountReady;
  const balanceTiles = [
    [labels.available, formatMoney(summary.balances.availableCents, summary.balances.currency)],
    [labels.pending, formatMoney(summary.balances.pendingCents, summary.balances.currency)],
    [labels.blocked, formatMoney(summary.balances.blockedCents, summary.balances.currency)],
    [labels.minimum, formatMoney(summary.balances.minPayoutCents, summary.balances.currency)]
  ];
  const statusRows = [
    [labels.account, formatStatusLabel(payoutAccount?.status ?? "not_configured", labels.statuses)],
    [labels.status, formatStatusLabel(profile?.payoutStatus ?? "not_configured", labels.statuses)],
    [
      labels.request,
      latestPayout
        ? `${formatMoney(latestPayout.amountCents, latestPayout.currency)} / ${formatStatusLabel(latestPayout.status, labels.statuses)}`
        : formatMoney(summary.balances.availableCents, summary.balances.currency)
    ]
  ];

  return (
    <article className="ops-panel payout-panel payout-request-panel">
      <div className="publisher-account-panel__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className={canRequest ? "status-chip" : "status-chip status-chip--warning"}>
          {canRequest ? labels.request : labels.status}
        </span>
      </div>

      <div className="payout-balance-grid">
        {balanceTiles.map(([label, value], index) => {
          const Icon = index === 0 ? Banknote : Clock3;

          return (
            <div className="payout-balance-tile" key={label}>
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>

      <div className="payout-list">
        {statusRows.map(([label, value]) => (
          <div className="payout-row" key={label}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <form action={action} className="publisher-payout-request-form">
        <input name="currency" type="hidden" value={summary.balances.currency} />
        <input name="publisherProfileId" type="hidden" value={profile?.id ?? ""} />
        <button className="primary-button" disabled={isPending || !canRequest} type="submit">
          <Send size={16} aria-hidden="true" />
          <span>{isPending ? labels.requesting : labels.request}</span>
        </button>
      </form>

      {!canRequest ? <p className="payout-request-hint">{labels.cannotRequest}</p> : null}
      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function ActionMessage({ state }: { state: PublisherPayoutActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function formatStatusLabel(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}
