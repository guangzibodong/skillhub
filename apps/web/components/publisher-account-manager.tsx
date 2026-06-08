"use client";

import { useActionState, type ReactNode } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck,
  Link2,
  Save,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle
} from "lucide-react";
import { localizedHref, type Locale } from "@/lib/i18n";
import type { PublisherAccountSummary } from "@/lib/ops-data";
import {
  acceptPublisherTermsAction,
  completePayoutOnboardingAction,
  createPayoutOnboardingAction,
  updatePublisherProfileAction,
  type PublisherAccountActionState
} from "@/lib/publisher-account-actions";

type PublisherAccountManagerProps = {
  account: PublisherAccountSummary;
  locale: Locale;
  returnUrl: string;
};

const CURRENT_TERMS_VERSION = "2026-06-05-prelaunch-operating-terms";

const copy = {
  en: {
    accountStatus: "Account",
    acceptTerms: "Accept terms",
    acceptedAt: "Accepted at",
    accepting: "Accepting",
    complete: "Update readiness",
    completing: "Updating",
    createdAt: "Created",
    displayName: "Public publisher name",
    latestSession: "Latest payout submission",
    manualAccount: "Receiving account",
    manualAccountHolder: "Account holder",
    manualAccountPlaceholder: "PayPal email or Alipay account",
    manualMethod: "Receiving method",
    manualNotes: "Finance notes",
    manualNotesPlaceholder: "Optional transfer instructions for finance",
    noAccount: "No payout account yet",
    noProfile: "Create publisher profile",
    noSession: "No payout submission",
    notAccepted: "Not accepted",
    notAvailable: "n/a",
    onboarding: "Submit payout details",
    onboardingProvider: "Provider",
    onboardingTitle: "Manual payout account",
    payoutReadiness: "Payout readiness",
    profile: "Publisher profile",
    readTerms: "Read terms",
    reason: "Decision note",
    reasonPlaceholder: "Provider check passed, documents pending, or block reason",
    ready: "Ready for payouts",
    requiresSetup: "Needs payout setup",
    saveProfile: "Save profile",
    saving: "Saving",
    status: "Status",
    termsAccepted: "Accepted",
    termsCurrent: "Current terms accepted",
    termsRequired: "Required before paid publishing",
    termsStatus: "Terms status",
    termsTitle: "Operating terms",
    termsVersion: "Version",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    providers: {
      manual_deferred: "Manual finance transfer"
    },
    statuses: {
      blocked: "Blocked",
      canceled: "Canceled",
      completed: "Completed",
      created: "Created",
      expired: "Expired",
      not_configured: "Not configured",
      opened: "Opened",
      pending: "Pending",
      ready: "Ready",
      verification_required: "Needs verification",
      verified: "Verified"
    },
    title: "Publisher account",
    updateTitle: "Readiness decision"
  },
  zh: {
    accountStatus: "\u6536\u6b3e\u8d26\u6237",
    acceptTerms: "\u63a5\u53d7\u6761\u6b3e",
    acceptedAt: "\u63a5\u53d7\u65f6\u95f4",
    accepting: "\u63d0\u4ea4\u4e2d",
    complete: "\u66f4\u65b0\u51c6\u5907\u72b6\u6001",
    completing: "\u66f4\u65b0\u4e2d",
    createdAt: "\u521b\u5efa\u65f6\u95f4",
    displayName: "\u516c\u5f00\u53d1\u5e03\u8005\u540d\u79f0",
    latestSession: "\u6700\u8fd1\u6536\u6b3e\u63d0\u4ea4",
    manualAccount: "\u6536\u6b3e\u8d26\u53f7",
    manualAccountHolder: "\u6536\u6b3e\u4eba",
    manualAccountPlaceholder: "PayPal \u90ae\u7bb1\u6216 Alipay \u8d26\u53f7",
    manualMethod: "\u6536\u6b3e\u65b9\u5f0f",
    manualNotes: "\u8d22\u52a1\u5907\u6ce8",
    manualNotesPlaceholder: "\u53ef\u9009\uff1a\u7ed9\u8d22\u52a1\u7684\u8f6c\u8d26\u8bf4\u660e",
    noAccount: "\u8fd8\u6ca1\u6709\u6536\u6b3e\u8d26\u6237",
    noProfile: "\u521b\u5efa\u53d1\u5e03\u8005\u8d44\u6599",
    noSession: "\u8fd8\u6ca1\u6709\u6536\u6b3e\u63d0\u4ea4",
    notAccepted: "\u672a\u63a5\u53d7",
    notAvailable: "\u6682\u65e0",
    onboarding: "\u63d0\u4ea4\u6536\u6b3e\u8d44\u6599",
    onboardingProvider: "\u670d\u52a1\u5546",
    onboardingTitle: "\u624b\u5de5\u6253\u6b3e\u6536\u6b3e\u8d26\u6237",
    payoutReadiness: "\u63d0\u73b0\u51c6\u5907",
    profile: "\u53d1\u5e03\u8005\u8d44\u6599",
    readTerms: "\u67e5\u770b\u6761\u6b3e",
    reason: "\u5904\u7406\u8bf4\u660e",
    reasonPlaceholder: "\u670d\u52a1\u5546\u9a8c\u8bc1\u901a\u8fc7\u3001\u8d44\u6599\u5f85\u8865\u5145\u6216\u963b\u65ad\u539f\u56e0",
    ready: "\u53ef\u63d0\u73b0",
    requiresSetup: "\u9700\u8981\u5b8c\u6210\u6536\u6b3e\u8bbe\u7f6e",
    saveProfile: "\u4fdd\u5b58\u8d44\u6599",
    saving: "\u4fdd\u5b58\u4e2d",
    status: "\u72b6\u6001",
    termsAccepted: "\u5df2\u63a5\u53d7",
    termsCurrent: "\u5f53\u524d\u6761\u6b3e\u5df2\u63a5\u53d7",
    termsRequired: "\u4ed8\u8d39\u53d1\u5e03\u524d\u9700\u8981\u5b8c\u6210",
    termsStatus: "\u6761\u6b3e\u72b6\u6001",
    termsTitle: "\u8fd0\u8425\u6761\u6b3e",
    termsVersion: "\u6761\u6b3e\u7248\u672c",
    manualMethods: {
      alipay: "Alipay",
      paypal: "PayPal"
    },
    providers: {
      manual_deferred: "\u8d22\u52a1\u4eba\u5de5\u8f6c\u8d26"
    },
    statuses: {
      blocked: "\u5df2\u963b\u65ad",
      canceled: "\u5df2\u53d6\u6d88",
      completed: "\u5df2\u5b8c\u6210",
      created: "\u5df2\u521b\u5efa",
      expired: "\u5df2\u8fc7\u671f",
      not_configured: "\u672a\u914d\u7f6e",
      opened: "\u5df2\u6253\u5f00",
      pending: "\u5f85\u5904\u7406",
      ready: "\u53ef\u7528",
      verification_required: "\u9700\u8981\u9a8c\u8bc1",
      verified: "\u5df2\u9a8c\u8bc1"
    },
    title: "\u53d1\u5e03\u8005\u8d26\u6237",
    updateTitle: "\u51c6\u5907\u72b6\u6001\u5904\u7406"
  }
} as const;

const initialActionState: PublisherAccountActionState = {
  message: "",
  status: "idle"
};

export function PublisherAccountManager({ account, locale, returnUrl }: PublisherAccountManagerProps) {
  const labels = copy[locale];
  const [profileState, profileAction, isProfilePending] = useActionState(
    updatePublisherProfileAction.bind(null, locale),
    initialActionState
  );
  const [termsState, termsAction, isTermsPending] = useActionState(
    acceptPublisherTermsAction.bind(null, locale),
    initialActionState
  );
  const [onboardingState, onboardingAction, isOnboardingPending] = useActionState(
    createPayoutOnboardingAction.bind(null, locale),
    initialActionState
  );
  const [readinessState, readinessAction, isReadinessPending] = useActionState(
    completePayoutOnboardingAction.bind(null, locale),
    initialActionState
  );
  const profile = account.publisherProfile;
  const payoutAccount = account.payoutAccounts[0];
  const openSession =
    account.onboardingSessions.find((session) => session.status === "created" || session.status === "opened") ?? null;
  const latestSession = openSession ?? account.onboardingSessions[0];
  const completionSessionId = openSession?.id ?? "";
  const completionAccountId = payoutAccount?.id ?? "";
  const canUpdateReadiness = Boolean(completionSessionId || completionAccountId);
  const payoutReady = profile?.payoutStatus === "verified" || payoutAccount?.status === "verified";
  const acceptedCurrentTerms =
    Boolean(profile?.termsAcceptedAt) && profile?.termsVersion === CURRENT_TERMS_VERSION;
  const termsStatus = acceptedCurrentTerms
    ? labels.termsCurrent
    : profile?.termsAcceptedAt
      ? labels.termsAccepted
      : labels.notAccepted;

  return (
    <article className="ops-panel publisher-account-panel" id="publisher-account">
      <div className="publisher-account-panel__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <span className={payoutReady ? "status-chip" : "status-chip status-chip--warning"}>
          {payoutReady ? labels.ready : labels.requiresSetup}
        </span>
      </div>

      <div className="publisher-account-status-grid">
        <StatusTile icon={<UserRound size={16} aria-hidden="true" />} label={labels.profile} value={profile?.displayName ?? labels.noProfile} />
        <StatusTile
          icon={<FileCheck size={16} aria-hidden="true" />}
          label={labels.termsStatus}
          value={termsStatus}
        />
        <StatusTile
          icon={<BadgeCheck size={16} aria-hidden="true" />}
          label={labels.payoutReadiness}
          value={profile?.payoutStatus ? formatStatusLabel(profile.payoutStatus, labels.statuses) : labels.requiresSetup}
        />
        <StatusTile
          icon={<ShieldCheck size={16} aria-hidden="true" />}
          label={labels.accountStatus}
          value={
            payoutAccount
              ? `${formatManualMethodLabel(payoutAccount.manualMethod, labels.manualMethods)} / ${payoutAccount.manualAccount ?? labels.noAccount}`
              : labels.noAccount
          }
        />
        <StatusTile
          icon={<Clock3 size={16} aria-hidden="true" />}
          label={labels.latestSession}
          value={
            latestSession
              ? `${formatProviderLabel(latestSession.provider, labels.providers)} / ${formatStatusLabel(latestSession.status, labels.statuses)}`
              : labels.noSession
          }
        />
      </div>

      <form action={profileAction} className="publisher-profile-form">
        <strong>{labels.profile}</strong>
        <label>
          <span>{labels.displayName}</span>
          <input defaultValue={profile?.displayName ?? ""} name="displayName" required />
        </label>
        <button className="primary-button" disabled={isProfilePending} type="submit">
          <Save size={16} aria-hidden="true" />
          <span>{isProfilePending ? labels.saving : labels.saveProfile}</span>
        </button>
      </form>
      {profileState.status !== "idle" ? <ActionMessage state={profileState} /> : null}

      <section className="publisher-terms-card">
        <div className="publisher-terms-card__head">
          <strong>{labels.termsTitle}</strong>
          <span className={acceptedCurrentTerms ? "status-chip" : "status-chip status-chip--warning"}>
            {acceptedCurrentTerms ? labels.termsAccepted : labels.termsRequired}
          </span>
        </div>
        <div className="publisher-terms-meta">
          <span>
            <strong>{labels.termsVersion}</strong>
            {profile?.termsVersion ?? CURRENT_TERMS_VERSION}
          </span>
          <span>
            <strong>{labels.acceptedAt}</strong>
            {formatDate(profile?.termsAcceptedAt, labels.notAvailable, locale)}
          </span>
        </div>
        <div className="publisher-terms-card__actions">
          <a className="secondary-button secondary-button--compact" href={localizedHref("/terms", locale)}>
            <ExternalLink size={15} aria-hidden="true" />
            <span>{labels.readTerms}</span>
          </a>
          <form action={termsAction}>
            <input name="termsVersion" type="hidden" value={CURRENT_TERMS_VERSION} />
            <button className="primary-button" disabled={isTermsPending || acceptedCurrentTerms} type="submit">
              <FileCheck size={16} aria-hidden="true" />
              <span>{isTermsPending ? labels.accepting : labels.acceptTerms}</span>
            </button>
          </form>
        </div>
      </section>
      {termsState.status !== "idle" ? <ActionMessage state={termsState} /> : null}

      <form action={onboardingAction} className="publisher-onboarding-form">
        <strong>{labels.onboardingTitle}</strong>
        <input name="returnUrl" type="hidden" value={returnUrl} />
        <input name="refreshUrl" type="hidden" value={returnUrl} />
        <label>
          <span>{labels.manualMethod}</span>
          <select defaultValue={payoutAccount?.manualMethod ?? "paypal"} name="manualMethod">
            <option value="paypal">{labels.manualMethods.paypal}</option>
            <option value="alipay">{labels.manualMethods.alipay}</option>
          </select>
        </label>
        <label>
          <span>{labels.manualAccount}</span>
          <input
            defaultValue={payoutAccount?.manualAccount ?? ""}
            name="manualAccount"
            placeholder={labels.manualAccountPlaceholder}
            required
          />
        </label>
        <label>
          <span>{labels.manualAccountHolder}</span>
          <input defaultValue={payoutAccount?.manualAccountHolder ?? ""} name="manualAccountHolder" />
        </label>
        <label>
          <span>{labels.manualNotes}</span>
          <textarea defaultValue={payoutAccount?.manualNotes ?? ""} name="manualNotes" placeholder={labels.manualNotesPlaceholder} rows={3} />
        </label>
        <label>
          <span>{labels.onboardingProvider}</span>
          <select defaultValue={payoutAccount?.provider ?? "manual_deferred"} name="provider">
            <option value="manual_deferred">{labels.providers.manual_deferred}</option>
          </select>
        </label>
        <button className="secondary-button" disabled={isOnboardingPending} type="submit">
          <Link2 size={16} aria-hidden="true" />
          <span>{isOnboardingPending ? labels.saving : labels.onboarding}</span>
        </button>
      </form>
      {onboardingState.status !== "idle" ? <ActionMessage state={onboardingState} /> : null}

      <form action={readinessAction} className="publisher-readiness-form">
        <strong>{labels.updateTitle}</strong>
        <input name="sessionId" type="hidden" value={completionSessionId} />
        <input name="payoutAccountId" type="hidden" value={completionAccountId} />
        <label>
          <span>{labels.status}</span>
          <select defaultValue={profile?.payoutStatus === "verified" ? "verified" : "verification_required"} name="status">
            <option value="verified">{labels.statuses.verified}</option>
            <option value="verification_required">{labels.statuses.verification_required}</option>
            <option value="blocked">{labels.statuses.blocked}</option>
            <option value="not_configured">{labels.statuses.not_configured}</option>
          </select>
        </label>
        <label>
          <span>{labels.reason}</span>
          <input name="reason" placeholder={labels.reasonPlaceholder} />
        </label>
        <button className="secondary-button" disabled={isReadinessPending || !canUpdateReadiness} type="submit">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{isReadinessPending ? labels.completing : labels.complete}</span>
        </button>
      </form>
      {readinessState.status !== "idle" ? <ActionMessage state={readinessState} /> : null}

      <div className="publisher-account-foot">
        <span>{labels.createdAt}</span>
        <strong>{formatDate(profile?.createdAt ?? payoutAccount?.createdAt ?? latestSession?.createdAt, labels.notAvailable, locale)}</strong>
      </div>
    </article>
  );
}

function StatusTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="publisher-account-status-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatProviderLabel(provider: string, labels: Record<string, string>) {
  return labels[provider] ?? provider.replaceAll("_", " ");
}

function formatManualMethodLabel(method: string | null | undefined, labels: Record<string, string>) {
  return method ? (labels[method] ?? method.replaceAll("_", " ")) : labels.paypal;
}

function formatStatusLabel(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function ActionMessage({ state }: { state: PublisherAccountActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}

function formatDate(value: string | null | undefined, fallback: string, locale: Locale) {
  if (!value || value === "demo") {
    return fallback;
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
