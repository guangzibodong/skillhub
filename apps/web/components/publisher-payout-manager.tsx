"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock3,
  FileCheck2,
  RotateCcw,
  Send,
  WalletCards,
  XCircle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/ops-format";
import type { PublisherPayoutReadinessBlocker, PublisherPayoutSummary, PayoutRecord } from "@/lib/ops-data";
import { requestPublisherPayoutAction, type PublisherPayoutActionState } from "@/lib/publisher-payout-actions";

type PublisherPayoutManagerProps = {
  locale: Locale;
  summary: PublisherPayoutSummary;
};

type Readiness = NonNullable<PublisherPayoutSummary["readiness"]>;

const copy = {
  en: {
    account: "Receiving account",
    accountState: "Account state",
    available: "Paid preview available",
    availableHelp: "Matured paid-preview balance that can be reserved for a finance-reviewed payout request.",
    blocked: "Reserved or blocked",
    blockedHelp: "Balance reserved for paid-preview payout review, manual transfer, or finance block resolution.",
    blockers: "Blocking items",
    canRequest: "Ready for finance review",
    cannotRequest: "Paid-preview payout review is blocked until these items are resolved.",
    expectedReview: "This request will enter manual finance review because it is above the review threshold.",
    expectedRequested: "This paid-preview request can be created and then moves through finance review and manual transfer.",
    failureReason: "Failure reason",
    latestPayout: "Latest paid-preview payout",
    manualMethod: "Method",
    minimum: "Minimum",
    nextAction: "Next action",
    noAccount: "No PayPal or Alipay account submitted",
    noLatest: "No paid-preview payout request yet.",
    paid: "Paid",
    paidHelp: "Balance already marked paid in the ledger.",
    pending: "Pending",
    pendingHelp: "Ledger balance waiting for the risk or maturity window.",
    profileState: "Publisher state",
    request: "Request paid-preview review",
    requesting: "Requesting review",
    retryCondition: "Retry condition",
    reviewThreshold: "Manual review",
    title: "Paid-preview payout readiness",
    transferReference: "Transfer reference",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    statuses: {
      active: "Active",
      blocked: "Blocked",
      failed: "Failed",
      not_configured: "Not configured",
      paid: "Paid",
      pending: "Pending",
      processing: "Processing",
      requested: "Requested",
      restricted: "Restricted",
      review: "In review",
      suspended: "Suspended",
      verification_required: "Needs verification",
      verified: "Verified"
    },
    blockerLabels: {
      amount_below_minimum: "Paid-preview available balance is below the minimum payout amount.",
      no_available_balance: "No paid-preview balance has matured yet.",
      payout_account_missing: "Submit PayPal or Alipay receiving details before requesting money movement.",
      payout_account_not_verified: "Finance has not verified the PayPal or Alipay receiving details yet.",
      publisher_not_active: "Publisher profile must be active.",
      publisher_payout_not_verified: "Paid-preview payout readiness is waiting for finance verification.",
      publisher_profile_missing: "Create the publisher profile first."
    },
    nextActions: {
      activate_publisher_profile: "Ask an operator to activate the publisher profile.",
      await_finance_review: "Wait for finance review or respond if finance asks for evidence.",
      await_provider_processing: "Finance approved the request; wait for manual transfer.",
      complete: "No action needed. The payout is complete.",
      complete_payout_verification: "Wait for finance to verify the submitted receiving details.",
      connect_verified_payout_account: "Submit PayPal or Alipay receiving details for verification.",
      create_publisher_profile: "Create the publisher profile and accept operating terms.",
      earn_or_wait_minimum: "Wait for more paid-preview balance to mature or keep earning until the minimum is reached.",
      request_again_after_failure: "Balances are available again; retry after the account or transfer issue is fixed.",
      request_payout: "Request finance review for all eligible paid-preview balances.",
      resolve_blocker_before_retry: "Resolve the finance blocker, then request payout again.",
      wait_for_balance_maturity: "Wait for pending balances to mature into available balance."
    }
  },
  zh: {
    account: "收款账号",
    accountState: "账户状态",
    available: "付费预览可用",
    availableHelp: "已经成熟、可以被财务复核打款申请锁定的付费预览余额。",
    blocked: "锁定/阻断",
    blockedHelp: "已被付费预览打款复核、人工转账或财务阻断占用的余额。",
    blockers: "阻断项",
    canRequest: "可进入财务复核",
    cannotRequest: "付费预览打款复核被阻断，请先处理下面这些事项。",
    expectedReview: "本次金额超过人工审核阈值，申请后会进入财务审核。",
    expectedRequested: "本次可以创建付费预览打款复核申请，然后进入财务审核和人工转账流程。",
    failureReason: "失败原因",
    latestPayout: "最近付费预览打款",
    manualMethod: "收款方式",
    minimum: "最低提现",
    nextAction: "下一步",
    noAccount: "未提交 PayPal 或 Alipay 收款账号",
    noLatest: "还没有付费预览打款申请。",
    paid: "已打款",
    paidHelp: "已经在账本中标记为打款完成的余额。",
    pending: "待成熟",
    pendingHelp: "账本已产生，但还在风险窗口或成熟期内的余额。",
    profileState: "发布者状态",
    request: "申请付费预览复核",
    requesting: "申请复核中",
    retryCondition: "再次申请条件",
    reviewThreshold: "人工审核",
    title: "付费预览打款准备",
    transferReference: "转账凭证/流水号",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    statuses: {
      active: "正常",
      blocked: "已阻断",
      failed: "失败",
      not_configured: "未配置",
      paid: "已打款",
      pending: "待处理",
      processing: "处理中",
      requested: "已申请",
      restricted: "受限",
      review: "审核中",
      suspended: "已暂停",
      verification_required: "需要验证",
      verified: "已验证"
    },
    blockerLabels: {
      amount_below_minimum: "付费预览可用余额还没有达到最低打款金额。",
      no_available_balance: "暂时没有已经成熟的付费预览余额。",
      payout_account_missing: "需要先提交 PayPal 或 Alipay 收款资料。",
      payout_account_not_verified: "财务还没有核验 PayPal 或 Alipay 收款资料。",
      publisher_not_active: "发布者资料必须处于正常状态。",
      publisher_payout_not_verified: "付费预览打款准备状态正在等待财务核验。",
      publisher_profile_missing: "需要先创建发布者资料。"
    },
    nextActions: {
      activate_publisher_profile: "联系运营激活发布者资料。",
      await_finance_review: "等待财务审核；如果财务要求补充材料，按通知处理。",
      await_provider_processing: "财务已批准，等待人工转账。",
      complete: "无需操作，提现已完成。",
      complete_payout_verification: "等待财务核验已提交的收款资料。",
      connect_verified_payout_account: "提交 PayPal 或 Alipay 收款资料并等待验证。",
      create_publisher_profile: "创建发布者资料并接受运营条款。",
      earn_or_wait_minimum: "继续等待付费预览余额成熟，或让余额达到最低打款金额。",
      request_again_after_failure: "余额已释放，收款账户或转账问题修复后可以重新申请。",
      request_payout: "申请财务复核，系统会锁定所有符合条件的付费预览余额。",
      resolve_blocker_before_retry: "先解决财务阻断原因，再重新申请提现。",
      wait_for_balance_maturity: "等待待成熟余额转为付费预览可用余额。"
    }
  }
} as const;

type PayoutCopy = (typeof copy)["en"] | (typeof copy)["zh"];

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
  const readiness = summary.readiness ?? deriveReadiness(summary);
  const canRequest = readiness.canRequest;
  const expectedCopy = readiness.expectedStatus === "review" ? labels.expectedReview : labels.expectedRequested;
  const balanceTiles: Array<[string, string, string, LucideIcon]> = [
    [labels.available, formatMoney(summary.balances.availableCents, summary.balances.currency), labels.availableHelp, Banknote],
    [labels.pending, formatMoney(summary.balances.pendingCents, summary.balances.currency), labels.pendingHelp, Clock3],
    [labels.blocked, formatMoney(summary.balances.blockedCents, summary.balances.currency), labels.blockedHelp, AlertTriangle],
    [labels.paid, formatMoney(summary.balances.paidCents, summary.balances.currency), labels.paidHelp, CheckCircle2]
  ];

  return (
    <article className="ops-panel payout-panel payout-request-panel">
      <div className="publisher-account-panel__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className={canRequest ? "status-chip" : "status-chip status-chip--warning"}>
          {canRequest ? labels.canRequest : labels.blockers}
        </span>
      </div>

      <div className="payout-balance-grid payout-balance-grid--dense">
        {balanceTiles.map(([label, value, help, Icon]) => (
          <div className="payout-balance-tile" key={label}>
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{help}</small>
          </div>
        ))}
      </div>

      <div className="payout-readiness-grid">
        <StatusRow
          icon={<WalletCards size={16} aria-hidden="true" />}
          label={labels.accountState}
          value={formatStatusLabel(payoutAccount?.status ?? "not_configured", labels.statuses)}
        />
        <StatusRow
          icon={<FileCheck2 size={16} aria-hidden="true" />}
          label={labels.profileState}
          value={formatStatusLabel(profile?.status ?? profile?.payoutStatus ?? "not_configured", labels.statuses)}
        />
        <StatusRow
          icon={<WalletCards size={16} aria-hidden="true" />}
          label={labels.manualMethod}
          value={formatManualMethodLabel(payoutAccount?.manualMethod, labels.manualMethods)}
        />
        <StatusRow
          icon={<FileCheck2 size={16} aria-hidden="true" />}
          label={labels.account}
          value={maskManualAccount(payoutAccount?.manualAccount, labels.noAccount)}
        />
        <StatusRow icon={<Banknote size={16} aria-hidden="true" />} label={labels.minimum} value={formatMoney(summary.balances.minPayoutCents, summary.balances.currency)} />
        <StatusRow
          icon={<AlertTriangle size={16} aria-hidden="true" />}
          label={labels.reviewThreshold}
          value={formatMoney(summary.balances.reviewThresholdCents, summary.balances.currency)}
        />
      </div>

      <div className={canRequest ? "payout-next-panel payout-next-panel--ready" : "payout-next-panel"}>
        {canRequest ? <CheckCircle2 size={17} aria-hidden="true" /> : <AlertTriangle size={17} aria-hidden="true" />}
        <div>
          <strong>{labels.nextAction}</strong>
          <span>{readiness.nextAction ? formatNextAction(readiness.nextAction, labels.nextActions) : expectedCopy}</span>
          {canRequest ? <small>{expectedCopy}</small> : null}
        </div>
      </div>

      {!canRequest ? (
        <div className="payout-blocker-list" aria-label={labels.blockers}>
          <strong>{labels.cannotRequest}</strong>
          {readiness.blockers.map((blocker) => (
            <span key={blocker}>{formatBlocker(blocker, labels.blockerLabels)}</span>
          ))}
        </div>
      ) : null}

      <LatestPayout labels={labels} latestPayout={latestPayout} locale={locale} />

      <form action={action} className="publisher-payout-request-form">
        <input name="currency" type="hidden" value={summary.balances.currency} />
        <input name="publisherProfileId" type="hidden" value={profile?.id ?? ""} />
        <button className="primary-button" disabled={isPending || !canRequest} type="submit">
          <Send size={16} aria-hidden="true" />
          <span>{isPending ? labels.requesting : labels.request}</span>
        </button>
      </form>

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function LatestPayout({
  labels,
  latestPayout,
  locale
}: {
  labels: PayoutCopy;
  latestPayout: PayoutRecord | undefined;
  locale: Locale;
}) {
  if (!latestPayout) {
    return <div className="payout-latest-empty">{labels.noLatest}</div>;
  }

  const note = latestPayout.failureReason ?? latestPayout.reviewReason;

  return (
    <section className="payout-latest-card">
      <header>
        <strong>{labels.latestPayout}</strong>
        <span className={statusClass(latestPayout.status)}>{formatStatusLabel(latestPayout.status, labels.statuses)}</span>
      </header>
      <div className="payout-latest-metrics">
        <StatusRow icon={<Banknote size={16} aria-hidden="true" />} label={labels.available} value={formatMoney(latestPayout.amountCents, latestPayout.currency)} />
        <StatusRow icon={<Clock3 size={16} aria-hidden="true" />} label={labels.pending} value={formatDate(latestPayout.requestedAt, locale)} />
        <StatusRow
          icon={<RotateCcw size={16} aria-hidden="true" />}
          label={labels.nextAction}
          value={formatNextAction(latestPayout.nextAction, labels.nextActions)}
        />
      </div>
      {note ? (
        <p>
          <strong>{latestPayout.failureReason ? labels.failureReason : labels.nextAction}</strong>
          <span>{note}</span>
        </p>
      ) : null}
      {latestPayout.retryCondition ? (
        <p>
          <strong>{labels.retryCondition}</strong>
          <span>{latestPayout.retryCondition}</span>
        </p>
      ) : null}
      {latestPayout.providerReference ? (
        <p>
          <strong>{labels.transferReference}</strong>
          <span>{latestPayout.providerReference}</span>
        </p>
      ) : null}
    </section>
  );
}

function StatusRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="payout-status-row">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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

function deriveReadiness(summary: PublisherPayoutSummary): Readiness {
  const profile = summary.publisherProfile;
  const payoutAccount = summary.payoutAccounts[0];
  const blockers: PublisherPayoutReadinessBlocker[] = [];

  if (!profile) {
    blockers.push("publisher_profile_missing");
  } else {
    if (profile.status !== "active") {
      blockers.push("publisher_not_active");
    }

    if (profile.payoutStatus !== "verified") {
      blockers.push("publisher_payout_not_verified");
    }
  }

  if (!payoutAccount) {
    blockers.push("payout_account_missing");
  } else if (payoutAccount.status !== "verified") {
    blockers.push("payout_account_not_verified");
  }

  if (summary.balances.availableCents <= 0) {
    blockers.push("no_available_balance");
  } else if (summary.balances.availableCents < summary.balances.minPayoutCents) {
    blockers.push("amount_below_minimum");
  }

  return {
    blockers,
    canRequest: blockers.length === 0,
    expectedStatus: blockers.length === 0 && summary.balances.availableCents >= summary.balances.reviewThresholdCents ? "review" : blockers.length === 0 ? "requested" : null,
    nextAction: nextReadinessAction(blockers)
  };
}

function nextReadinessAction(blockers: PublisherPayoutReadinessBlocker[]): Readiness["nextAction"] {
  if (blockers.includes("publisher_profile_missing")) {
    return "create_publisher_profile";
  }

  if (blockers.includes("publisher_not_active")) {
    return "activate_publisher_profile";
  }

  if (blockers.includes("publisher_payout_not_verified") || blockers.includes("payout_account_not_verified")) {
    return "complete_payout_verification";
  }

  if (blockers.includes("payout_account_missing")) {
    return "connect_verified_payout_account";
  }

  if (blockers.includes("no_available_balance")) {
    return "wait_for_balance_maturity";
  }

  if (blockers.includes("amount_below_minimum")) {
    return "earn_or_wait_minimum";
  }

  return "request_payout";
}

function formatBlocker(blocker: PublisherPayoutReadinessBlocker, labels: Record<string, string>) {
  return labels[blocker] ?? blocker.replaceAll("_", " ");
}

function formatManualMethodLabel(method: string | null | undefined, labels: Record<string, string>) {
  return method ? (labels[method] ?? method.replaceAll("_", " ")) : labels.paypal;
}

function maskManualAccount(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.includes("@")) {
    const [name, domain] = normalized.split("@");
    const maskedName = name.length <= 2 ? `${name[0] ?? "*"}*` : `${name.slice(0, 2)}***`;
    return `${maskedName}@${domain}`;
  }

  if (normalized.length <= 6) {
    return `${normalized.slice(0, 2)}***`;
  }

  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
}

function formatNextAction(action: string | null | undefined, labels: Record<string, string>) {
  if (!action) {
    return labels.await_finance_review;
  }

  return labels[action] ?? action.replaceAll("_", " ");
}

function formatStatusLabel(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function statusClass(status: PayoutRecord["status"]) {
  if (status === "paid" || status === "processing") {
    return "status-chip";
  }

  if (status === "failed" || status === "blocked") {
    return "status-chip status-chip--danger";
  }

  return "status-chip status-chip--warning";
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
