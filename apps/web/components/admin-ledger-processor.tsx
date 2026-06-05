"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { CalendarClock, CheckCircle2, Coins, Play, ReceiptText, Repeat, RotateCcw, WalletCards, XCircle } from "lucide-react";
import { processAdminLedgerAction, type AdminLedgerActionState } from "@/lib/admin-ledger-actions";
import type { Locale } from "@/lib/i18n";
import type { FinanceLedger } from "@/lib/ops-data";
import { formatMoney } from "@/lib/ops-format";

type AdminLedgerProcessorProps = {
  ledger: FinanceLedger;
  locale: Locale;
};

const copy = {
  en: {
    availableBalances: "Available balance",
    limit: "Batch limit",
    pendingBalances: "Pending balance",
    processRenewals: "Renew periods",
    processSubscriptions: "Post subscriptions",
    processUsage: "Post usage",
    releaseBalances: "Release balances",
    running: "Processing",
    subscriptionsRenewable: "Renewable subscription periods",
    subscriptionsQueued: "Unposted subscription periods",
    summary: "Finance jobs",
    title: "Ledger processing",
    usageQueued: "Unposted usage events"
  },
  zh: {
    availableBalances: "\u53ef\u63d0\u4f59\u989d",
    limit: "\u6279\u6b21\u6570\u91cf",
    pendingBalances: "\u5f85\u91ca\u653e\u4f59\u989d",
    processRenewals: "\u7eed\u671f\u8d26\u671f",
    processSubscriptions: "\u8ba2\u9605\u5165\u8d26",
    processUsage: "\u6309\u6b21\u5165\u8d26",
    releaseBalances: "\u91ca\u653e\u4f59\u989d",
    running: "\u5904\u7406\u4e2d",
    subscriptionsRenewable: "\u53ef\u7eed\u671f\u8ba2\u9605\u5468\u671f",
    subscriptionsQueued: "\u672a\u5165\u8d26\u8ba2\u9605\u5468\u671f",
    summary: "\u8d22\u52a1\u4efb\u52a1",
    title: "\u8d26\u672c\u5904\u7406",
    usageQueued: "\u672a\u5165\u8d26\u8c03\u7528"
  }
} as const;

const initialState: AdminLedgerActionState = {
  message: "",
  status: "idle"
};

export function AdminLedgerProcessor({ ledger, locale }: AdminLedgerProcessorProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(processAdminLedgerAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel admin-ledger-processor">
      <div className="admin-ledger-processor__head">
        <div className="card-kicker">
          <ReceiptText size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className="status-chip status-chip--neutral">{labels.summary}</span>
      </div>

      <div className="admin-ledger-processor__metrics">
        <LedgerTile icon={<Play size={16} aria-hidden="true" />} label={labels.usageQueued} value={String(ledger.summary.unprocessedUsageCount)} />
        <LedgerTile
          icon={<Repeat size={16} aria-hidden="true" />}
          label={labels.subscriptionsQueued}
          value={String(ledger.summary.unprocessedSubscriptionCount)}
        />
        <LedgerTile
          icon={<CalendarClock size={16} aria-hidden="true" />}
          label={labels.subscriptionsRenewable}
          value={String(ledger.summary.renewableSubscriptionCount)}
        />
        <LedgerTile icon={<Coins size={16} aria-hidden="true" />} label={labels.pendingBalances} value={formatMoney(ledger.summary.pendingBalanceCents)} />
        <LedgerTile
          icon={<WalletCards size={16} aria-hidden="true" />}
          label={labels.availableBalances}
          value={formatMoney(ledger.summary.availableBalanceCents)}
        />
      </div>

      <form action={action} className="admin-ledger-processor__form">
        <label>
          <span>{labels.limit}</span>
          <input defaultValue={50} max={500} min={1} name="limit" step={1} type="number" />
        </label>
        <div className="admin-ledger-processor__actions">
          <button className="secondary-button secondary-button--compact" disabled={isPending} name="operation" type="submit" value="usage">
            <Play size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "usage" ? labels.running : labels.processUsage}</span>
          </button>
          <button className="secondary-button secondary-button--compact" disabled={isPending} name="operation" type="submit" value="subscriptions">
            <Repeat size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "subscriptions" ? labels.running : labels.processSubscriptions}</span>
          </button>
          <button className="secondary-button secondary-button--compact" disabled={isPending} name="operation" type="submit" value="renewals">
            <CalendarClock size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "renewals" ? labels.running : labels.processRenewals}</span>
          </button>
          <button className="secondary-button secondary-button--compact" disabled={isPending} name="operation" type="submit" value="release">
            <RotateCcw size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "release" ? labels.running : labels.releaseBalances}</span>
          </button>
        </div>
      </form>

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function LedgerTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionMessage({ state }: { state: AdminLedgerActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
