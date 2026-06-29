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
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SkillAlert, SkillButton, SkillStatusTag } from "@/components/skill-antd";
import { localizedHref, type Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/ops-format";
import type {
  PublisherPayoutReadinessBlocker,
  PublisherPayoutSummary,
  PayoutRecord,
} from "@/lib/ops-data";
import {
  requestPublisherPayoutAction,
  type PublisherPayoutActionState,
} from "@/lib/publisher-payout-actions";

type PublisherPayoutManagerProps = {
  locale: Locale;
  summary: PublisherPayoutSummary;
};

type Readiness = NonNullable<PublisherPayoutSummary["readiness"]>;

const copy = {
  en: {
    account: "Receiving account",
    accountState: "Account state",
    available: "Paid marketplace available",
    availableHelp: "Matured paid-marketplace balance that can be reserved for a finance-reviewed payout request.",
    blocked: "Reserved or blocked",
    blockedHelp: "Balance reserved for paid-marketplace payout review, Stripe payout, or finance block resolution.",
    blockers: "Blocking items",
    canRequest: "Ready for finance review",
    cannotRequest: "Paid marketplace payout review is blocked until these items are resolved.",
    expectedReview: "This request will enter finance review before Stripe payout processing because it is above the review threshold.",
    expectedRequested: "This paid-marketplace request can be created and then moves through finance review and Stripe payout processing.",
    failureReason: "Failure reason",
    fixBlocker: "Fix",
    latestPayout: "Latest paid-marketplace payout",
    manualMethod: "Provider",
    minimum: "Minimum",
    nextAction: "Next action",
    noAccount: "No verified Stripe Connect account",
    noLatest: "No paid-marketplace payout request yet.",
    paid: "Paid",
    paidHelp: "Balance already marked paid in the ledger.",
    pending: "Pending",
    pendingHelp: "Ledger balance waiting for the risk or maturity window.",
    profileState: "Publisher state",
    request: "Request paid-marketplace review",
    requesting: "Requesting review",
    retryCondition: "Retry condition",
    reviewThreshold: "Finance review threshold",
    title: "Paid marketplace payout readiness",
    transferReference: "Stripe payout reference",
    manualMethods: {
      stripe_connect: "Stripe Connect",
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
      verified: "Verified",
    },
    blockerLabels: {
      amount_below_minimum: "Paid marketplace available balance is below the minimum payout amount.",
      no_available_balance: "No paid-marketplace balance has matured yet.",
      payout_account_missing: "Complete Stripe Connect receiving details before requesting money movement.",
      payout_account_not_verified: "Stripe Connect receiving details are not verified yet.",
      publisher_not_active: "Publisher profile must be active.",
      publisher_payout_not_verified: "Paid marketplace payout readiness is waiting for verification.",
      publisher_profile_missing: "Create the publisher profile first.",
    },
    nextActions: {
      activate_publisher_profile: "Ask an operator to activate the publisher profile.",
      await_finance_review: "Wait for finance review or respond if finance asks for evidence.",
      await_provider_processing: "Finance approved the request; wait for Stripe payout processing.",
      complete: "No action needed. The payout is complete.",
      complete_payout_verification: "Complete Stripe Connect verification.",
      connect_verified_payout_account: "Complete Stripe Connect receiving details for verification.",
      create_publisher_profile: "Create the publisher profile and accept operating terms.",
      earn_or_wait_minimum: "Wait for more paid-marketplace balance to mature or keep earning until the minimum is reached.",
      request_again_after_failure: "Balances are available again; retry after the Connect account or payout issue is fixed.",
      request_payout: "Request finance review for all eligible paid-marketplace balances.",
      resolve_blocker_before_retry: "Resolve the finance blocker, then request payout again.",
      wait_for_balance_maturity: "Wait for pending balances to mature into available balance.",
    },
  },
  zh: {
    account: "????",
    accountState: "????",
    available: "?????",
    availableHelp: "???????????????????",
    blocked: "?????",
    blockedHelp: "???????Stripe ?????????????",
    blockers: "???",
    canRequest: "???????",
    cannotRequest: "??????????????????????",
    expectedReview: "??????????????????????? Stripe ?????",
    expectedRequested: "???????????? Stripe ?????",
    failureReason: "????",
    fixBlocker: "??",
    latestPayout: "??????",
    manualMethod: "???",
    minimum: "????",
    nextAction: "???",
    noAccount: "??? Stripe Connect ????",
    noLatest: "???????",
    paid: "???",
    paidHelp: "????????????????",
    pending: "???",
    pendingHelp: "??????????????????????",
    profileState: "?????",
    request: "??????",
    requesting: "???",
    retryCondition: "??????",
    reviewThreshold: "??????",
    title: "????????",
    transferReference: "Stripe ????",
    manualMethods: {
      stripe_connect: "Stripe Connect",
    },
    statuses: {
      active: "??",
      blocked: "???",
      failed: "??",
      not_configured: "???",
      paid: "???",
      pending: "???",
      processing: "???",
      requested: "???",
      restricted: "??",
      review: "???",
      suspended: "???",
      verification_required: "????",
      verified: "???",
    },
    blockerLabels: {
      amount_below_minimum: "??????????????",
      no_available_balance: "????????????",
      payout_account_missing: "????? Stripe Connect ?????",
      payout_account_not_verified: "Stripe Connect ???????????",
      publisher_not_active: "??????????????",
      publisher_payout_not_verified: "?????????????",
      publisher_profile_missing: "???????????",
    },
    nextActions: {
      activate_publisher_profile: "????????????",
      await_finance_review: "????????????????",
      await_provider_processing: "???????? Stripe ?????",
      complete: "?????????????",
      complete_payout_verification: "?? Stripe Connect ???",
      connect_verified_payout_account: "?? Stripe Connect ??????????",
      create_publisher_profile: "???????????????",
      earn_or_wait_minimum: "???????????????????????????",
      request_again_after_failure: "???????? Connect ??????????????",
      request_payout: "?????????????????????????",
      resolve_blocker_before_retry: "??????????????????",
      wait_for_balance_maturity: "???????????????",
    },
  },
} as const;

type PayoutCopy = (typeof copy)["en"] | (typeof copy)["zh"];

const initialState: PublisherPayoutActionState = {
  message: "",
  status: "idle",
};

export function PublisherPayoutManager({
  locale,
  summary,
}: PublisherPayoutManagerProps) {
  const labels = locale === "zh" ? copy.en : copy[locale];
  const [state, action, isPending] = useActionState(
    requestPublisherPayoutAction.bind(null, locale),
    initialState,
  );
  const profile = summary.publisherProfile;
  const payoutAccount = summary.payoutAccounts[0];
  const latestPayout = state.payout ?? summary.payouts[0];
  const readiness = summary.readiness ?? deriveReadiness(summary);
  const canRequest = readiness.canRequest;
  const expectedCopy =
    readiness.expectedStatus === "review"
      ? labels.expectedReview
      : labels.expectedRequested;
  const balanceTiles: Array<[string, string, string, LucideIcon]> = [
    [
      labels.available,
      formatMoney(summary.balances.availableCents, summary.balances.currency),
      labels.availableHelp,
      Banknote,
    ],
    [
      labels.pending,
      formatMoney(summary.balances.pendingCents, summary.balances.currency),
      labels.pendingHelp,
      Clock3,
    ],
    [
      labels.blocked,
      formatMoney(summary.balances.blockedCents, summary.balances.currency),
      labels.blockedHelp,
      AlertTriangle,
    ],
    [
      labels.paid,
      formatMoney(summary.balances.paidCents, summary.balances.currency),
      labels.paidHelp,
      CheckCircle2,
    ],
  ];

  return (
    <article className="ops-panel payout-panel payout-request-panel publisher-payout-flow">
      <div className="publisher-account-panel__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <SkillStatusTag
          className={
            canRequest ? "status-chip" : "status-chip status-chip--warning"
          }
        >
          {canRequest ? labels.canRequest : labels.blockers}
        </SkillStatusTag>
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
          value={formatStatusLabel(
            payoutAccount?.status ?? "not_configured",
            labels.statuses,
          )}
        />
        <StatusRow
          icon={<FileCheck2 size={16} aria-hidden="true" />}
          label={labels.profileState}
          value={formatStatusLabel(
            profile?.status ?? profile?.payoutStatus ?? "not_configured",
            labels.statuses,
          )}
        />
        <StatusRow
          icon={<WalletCards size={16} aria-hidden="true" />}
          label={labels.manualMethod}
          value={formatProviderLabel(
            payoutAccount?.provider,
            labels.manualMethods,
          )}
        />
        <StatusRow
          icon={<FileCheck2 size={16} aria-hidden="true" />}
          label={labels.account}
          value={maskConnectAccount(
            payoutAccount?.stripeAccountId ?? payoutAccount?.providerAccountId,
            labels.noAccount,
          )}
        />
        <StatusRow
          icon={<Banknote size={16} aria-hidden="true" />}
          label={labels.minimum}
          value={formatMoney(
            summary.balances.minPayoutCents,
            summary.balances.currency,
          )}
        />
        <StatusRow
          icon={<AlertTriangle size={16} aria-hidden="true" />}
          label={labels.reviewThreshold}
          value={formatMoney(
            summary.balances.reviewThresholdCents,
            summary.balances.currency,
          )}
        />
      </div>

      <div
        className={
          canRequest
            ? "payout-next-panel payout-next-panel--ready"
            : "payout-next-panel"
        }
      >
        {canRequest ? (
          <CheckCircle2 size={17} aria-hidden="true" />
        ) : (
          <AlertTriangle size={17} aria-hidden="true" />
        )}
        <div>
          <strong>{labels.nextAction}</strong>
          <span>
            {readiness.nextAction
              ? formatNextAction(readiness.nextAction, labels.nextActions)
              : expectedCopy}
          </span>
          {canRequest ? <small>{expectedCopy}</small> : null}
        </div>
      </div>

      {!canRequest ? (
        <div className="payout-blocker-list" aria-label={labels.blockers}>
          <strong>{labels.cannotRequest}</strong>
          {readiness.blockers.map((blocker) => (
            <div className="payout-blocker-item" key={blocker}>
              <span>{formatBlocker(blocker, labels.blockerLabels)}</span>
              <a
                className="payout-blocker-action"
                href={localizedHref(payoutBlockerHref(blocker), locale)}
              >
                {labels.fixBlocker}
              </a>
            </div>
          ))}
        </div>
      ) : null}

      <LatestPayout
        labels={labels}
        latestPayout={latestPayout}
        locale={locale}
      />

      <form action={action} className="publisher-payout-request-form">
        <input
          name="currency"
          type="hidden"
          value={summary.balances.currency}
        />
        <input
          name="publisherProfileId"
          type="hidden"
          value={profile?.id ?? ""}
        />
        <SkillButton
          className="primary-button"
          disabled={isPending || !canRequest}
          htmlType="submit"
        >
          <Send size={16} aria-hidden="true" />
          <span>{isPending ? labels.requesting : labels.request}</span>
        </SkillButton>
      </form>

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </article>
  );
}

function LatestPayout({
  labels,
  latestPayout,
  locale,
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
        <SkillStatusTag className={statusClass(latestPayout.status)}>
          {formatStatusLabel(latestPayout.status, labels.statuses)}
        </SkillStatusTag>
      </header>
      <div className="payout-latest-metrics">
        <StatusRow
          icon={<Banknote size={16} aria-hidden="true" />}
          label={labels.available}
          value={formatMoney(latestPayout.amountCents, latestPayout.currency)}
        />
        <StatusRow
          icon={<Clock3 size={16} aria-hidden="true" />}
          label={labels.pending}
          value={formatDate(latestPayout.requestedAt, locale)}
        />
        <StatusRow
          icon={<RotateCcw size={16} aria-hidden="true" />}
          label={labels.nextAction}
          value={formatNextAction(latestPayout.nextAction, labels.nextActions)}
        />
      </div>
      {note ? (
        <p>
          <strong>
            {latestPayout.failureReason
              ? labels.failureReason
              : labels.nextAction}
          </strong>
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

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="payout-status-row">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ActionMessage({ state }: { state: PublisherPayoutActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
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
  } else if (
    summary.balances.availableCents < summary.balances.minPayoutCents
  ) {
    blockers.push("amount_below_minimum");
  }

  return {
    blockers,
    canRequest: blockers.length === 0,
    expectedStatus:
      blockers.length === 0 &&
      summary.balances.availableCents >= summary.balances.reviewThresholdCents
        ? "review"
        : blockers.length === 0
          ? "requested"
          : null,
    nextAction: nextReadinessAction(blockers),
  };
}

function nextReadinessAction(
  blockers: PublisherPayoutReadinessBlocker[],
): Readiness["nextAction"] {
  if (blockers.includes("publisher_profile_missing")) {
    return "create_publisher_profile";
  }

  if (blockers.includes("publisher_not_active")) {
    return "activate_publisher_profile";
  }

  if (
    blockers.includes("publisher_payout_not_verified") ||
    blockers.includes("payout_account_not_verified")
  ) {
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

function payoutBlockerHref(blocker: PublisherPayoutReadinessBlocker) {
  if (
    blocker === "publisher_profile_missing" ||
    blocker === "publisher_not_active" ||
    blocker === "publisher_payout_not_verified" ||
    blocker === "payout_account_missing" ||
    blocker === "payout_account_not_verified"
  ) {
    return "/publisher#publisher-account";
  }

  if (
    blocker === "no_available_balance" ||
    blocker === "amount_below_minimum"
  ) {
    return "/publisher#publisher-skills";
  }

  return "/publisher#publisher-paid-readiness";
}

function formatBlocker(
  blocker: PublisherPayoutReadinessBlocker,
  labels: Record<string, string>,
) {
  return labels[blocker] ?? blocker.replaceAll("_", " ");
}

function formatProviderLabel(
  method: string | null | undefined,
  labels: Record<string, string>,
) {
  return method
    ? (labels[method] ?? method.replaceAll("_", " "))
    : "n/a";
}

function maskConnectAccount(value: string | null | undefined, fallback: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.includes("@")) {
    const [name, domain] = normalized.split("@");
    const maskedName =
      name.length <= 2 ? `${name[0] ?? "*"}*` : `${name.slice(0, 2)}***`;
    return `${maskedName}@${domain}`;
  }

  if (normalized.length <= 6) {
    return `${normalized.slice(0, 2)}***`;
  }

  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
}

function formatNextAction(
  action: string | null | undefined,
  labels: Record<string, string>,
) {
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
  if (!value) {
    return "n/a";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
