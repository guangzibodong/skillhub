"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { CalendarClock, CheckCircle2, Coins, Play, ReceiptText, Repeat, RotateCcw, WalletCards, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillStatusTag } from "@/components/skill-antd";
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
    confirmation: "Type RUN to execute",
    limit: "Batch limit",
    pendingBalances: "Pending balance",
    processRenewals: "Renew periods",
    processSubscriptions: "Post subscriptions",
    processUsage: "Post usage",
    releaseBalances: "Release balances",
    reason: "Audit reason",
    reasonPlaceholder: "Why is this batch safe to run now?",
    running: "Processing",
    subscriptionsRenewable: "Renewable subscription periods",
    subscriptionsQueued: "Unposted subscription periods",
    summary: "Finance jobs",
    title: "Ledger processing",
    usageQueued: "Unposted usage events"
  },
  zh: {
    availableBalances: "\u53ef\u63d0\u4f59\u989d",
    confirmation: "输入 RUN 确认执行",
    limit: "\u6279\u6b21\u6570\u91cf",
    pendingBalances: "\u5f85\u91ca\u653e\u4f59\u989d",
    processRenewals: "\u7eed\u671f\u8d26\u671f",
    processSubscriptions: "\u8ba2\u9605\u5165\u8d26",
    processUsage: "\u6309\u6b21\u5165\u8d26",
    releaseBalances: "\u91ca\u653e\u4f59\u989d",
    reason: "审计原因",
    reasonPlaceholder: "为什么现在可以执行这次批处理？",
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
        <SkillStatusTag className="status-chip status-chip--neutral" tone="neutral">{labels.summary}</SkillStatusTag>
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
          <SkillInput defaultValue={50} max={500} min={1} name="limit" step={1} type="number" />
        </label>
        <label>
          <span>{labels.reason}</span>
          <SkillInput
            maxLength={600}
            minLength={8}
            name="reason"
            placeholder={labels.reasonPlaceholder}
            required
          />
        </label>
        <label>
          <span>{labels.confirmation}</span>
          <SkillInput
            autoComplete="off"
            name="confirmation"
            pattern="RUN"
            placeholder="RUN"
            required
          />
        </label>
        <div className="admin-ledger-processor__actions">
          <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit" name="operation" value="usage">
            <Play size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "usage" ? labels.running : labels.processUsage}</span>
          </SkillButton>
          <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit" name="operation" value="subscriptions">
            <Repeat size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "subscriptions" ? labels.running : labels.processSubscriptions}</span>
          </SkillButton>
          <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit" name="operation" value="renewals">
            <CalendarClock size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "renewals" ? labels.running : labels.processRenewals}</span>
          </SkillButton>
          <SkillButton className="secondary-button secondary-button--compact" disabled={isPending} htmlType="submit" name="operation" value="release">
            <RotateCcw size={15} aria-hidden="true" />
            <span>{isPending && state.operation === "release" ? labels.running : labels.releaseBalances}</span>
          </SkillButton>
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
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}
