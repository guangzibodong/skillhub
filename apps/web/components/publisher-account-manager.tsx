"use client";

import styles from "./publisher-account-manager.module.css";
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
  XCircle,
} from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillStatusTag } from "@/components/skill-antd";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import type { PublisherAccountSummary } from "@/lib/ops-data";
import {
  acceptPublisherTermsAction,
  createPayoutOnboardingAction,
  updatePublisherProfileAction,
  type PublisherAccountActionState,
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
    latestSession: "Latest Connect onboarding",
    noAccount: "No payout account yet",
    noProfile: "Create publisher profile",
    noSession: "No payout submission",
    notAccepted: "Not accepted",
    notAvailable: "n/a",
    onboarding: "Submit payout details",
    onboardingTitle: "Stripe Connect payout account",
    pendingFinanceReview: "Submitted for finance review",
    payoutReadiness: "Payout readiness",
    profile: "Publisher profile",
    readTerms: "Read terms",
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
    providers: {
      stripe_connect: "Stripe Connect",
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
      verified: "Verified",
    },
    title: "Publisher account",
    updateTitle: "Finance verification",
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
    noAccount: "\u8fd8\u6ca1\u6709\u6536\u6b3e\u8d26\u6237",
    noProfile: "\u521b\u5efa\u53d1\u5e03\u8005\u8d44\u6599",
    noSession: "\u8fd8\u6ca1\u6709\u6536\u6b3e\u63d0\u4ea4",
    notAccepted: "\u672a\u63a5\u53d7",
    notAvailable: "\u6682\u65e0",
    onboarding: "\u63d0\u4ea4\u6536\u6b3e\u8d44\u6599",
    onboardingTitle: "Stripe Connect \u6536\u6b3e\u8d26\u6237",
    pendingFinanceReview: "\u5df2\u63d0\u4ea4\u8d22\u52a1\u6838\u9a8c",
    payoutReadiness: "\u63d0\u73b0\u51c6\u5907",
    profile: "\u53d1\u5e03\u8005\u8d44\u6599",
    readTerms: "\u67e5\u770b\u6761\u6b3e",
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
    providers: {
      stripe_connect: "Stripe Connect",
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
      verified: "\u5df2\u9a8c\u8bc1",
    },
    title: "\u53d1\u5e03\u8005\u8d26\u6237",
    updateTitle: "\u8d22\u52a1\u6838\u9a8c",
  },
} as const;

const initialActionState: PublisherAccountActionState = {
  message: "",
  status: "idle",
};

export function PublisherAccountManager({
  account,
  locale,
  returnUrl,
}: PublisherAccountManagerProps) {
  const labels = copy[locale];
  const [profileState, profileAction, isProfilePending] = useActionState(
    updatePublisherProfileAction.bind(null, locale),
    initialActionState,
  );
  const [termsState, termsAction, isTermsPending] = useActionState(
    acceptPublisherTermsAction.bind(null, locale),
    initialActionState,
  );
  const [onboardingState, onboardingAction, isOnboardingPending] =
    useActionState(
      createPayoutOnboardingAction.bind(null, locale),
      initialActionState,
    );
  const profile = account.publisherProfile;
  const payoutAccount = account.payoutAccounts[0];
  const openSession =
    account.onboardingSessions.find(
      (session) => session.status === "created" || session.status === "opened",
    ) ?? null;
  const latestSession = openSession ?? account.onboardingSessions[0];
  const payoutReady =
    profile?.payoutStatus === "verified" &&
    payoutAccount?.status === "verified";
  const acceptedCurrentTerms =
    Boolean(profile?.termsAcceptedAt) &&
    profile?.termsVersion === CURRENT_TERMS_VERSION;
  const termsStatus = acceptedCurrentTerms
    ? labels.termsCurrent
    : profile?.termsAcceptedAt
      ? labels.termsAccepted
      : labels.notAccepted;

  return (
    <article
      className={`${styles.root} ops-panel publisher-account-panel`}
      id="publisher-account"
    >
      <div className="publisher-account-panel__head">
        <div className="card-kicker">
          <WalletCards size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <SkillStatusTag
          className={
            payoutReady ? "status-chip" : "status-chip status-chip--warning"
          }
        >
          {payoutReady ? labels.ready : labels.requiresSetup}
        </SkillStatusTag>
      </div>

      <div className="publisher-account-summary">
        <div className="publisher-account-status-grid">
          <StatusTile
            icon={<UserRound size={16} aria-hidden="true" />}
            label={labels.profile}
            value={profile?.displayName ?? labels.noProfile}
          />
          <StatusTile
            icon={<FileCheck size={16} aria-hidden="true" />}
            label={labels.termsStatus}
            value={termsStatus}
          />
          <StatusTile
            icon={<BadgeCheck size={16} aria-hidden="true" />}
            label={labels.payoutReadiness}
            value={
              profile?.payoutStatus
                ? formatStatusLabel(profile.payoutStatus, labels.statuses)
                : labels.requiresSetup
            }
          />
          <StatusTile
            icon={<ShieldCheck size={16} aria-hidden="true" />}
            label={labels.accountStatus}
            value={
              payoutAccount
                ? `${formatProviderLabel(payoutAccount.provider, labels.providers)} / ${payoutAccount.providerAccountId ?? payoutAccount.stripeAccountId ?? labels.noAccount}`
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
      </div>

      <div className="publisher-account-flow">
        <section className="publisher-account-flow-step publisher-account-flow-step--profile">
          <header className="publisher-account-flow-step__head">
            <span className="publisher-account-flow-step__index">01</span>
            <strong>{labels.profile}</strong>
            <SkillStatusTag
              className={
                profile ? "status-chip" : "status-chip status-chip--warning"
              }
            >
              {profile
                ? formatStatusLabel(profile.status, labels.statuses)
                : labels.noProfile}
            </SkillStatusTag>
          </header>
          <form action={profileAction} className="publisher-profile-form">
            <strong>{labels.profile}</strong>
            <label>
              <span>{labels.displayName}</span>
              <SkillInput
                defaultValue={profile?.displayName ?? ""}
                name="displayName"
                required
              />
            </label>
            <SkillButton
              className="primary-button"
              disabled={isProfilePending}
              htmlType="submit"
            >
              <Save size={16} aria-hidden="true" />
              <span>
                {isProfilePending ? labels.saving : labels.saveProfile}
              </span>
            </SkillButton>
          </form>
          {profileState.status !== "idle" ? (
            <ActionMessage state={profileState} />
          ) : null}
        </section>

        <section className="publisher-account-flow-step publisher-account-flow-step--terms publisher-terms-card">
          <div className="publisher-terms-card__head">
            <span className="publisher-account-flow-step__index">02</span>
            <strong>{labels.termsTitle}</strong>
            <SkillStatusTag
              className={
                acceptedCurrentTerms
                  ? "status-chip"
                  : "status-chip status-chip--warning"
              }
            >
              {acceptedCurrentTerms
                ? labels.termsAccepted
                : labels.termsRequired}
            </SkillStatusTag>
          </div>
          <div className="publisher-terms-meta">
            <span>
              <strong>{labels.termsVersion}</strong>
              {profile?.termsVersion ?? CURRENT_TERMS_VERSION}
            </span>
            <span>
              <strong>{labels.acceptedAt}</strong>
              {formatDate(
                profile?.termsAcceptedAt,
                labels.notAvailable,
                locale,
              )}
            </span>
          </div>
          <div className="publisher-terms-card__actions">
            <a
              className="secondary-button secondary-button--compact"
              href={localizedHref("/terms", locale)}
            >
              <ExternalLink size={15} aria-hidden="true" />
              <span>{labels.readTerms}</span>
            </a>
            <form action={termsAction}>
              <input
                name="termsVersion"
                type="hidden"
                value={CURRENT_TERMS_VERSION}
              />
              <SkillButton
                className="primary-button"
                disabled={isTermsPending || acceptedCurrentTerms}
                htmlType="submit"
              >
                <FileCheck size={16} aria-hidden="true" />
                <span>
                  {isTermsPending ? labels.accepting : labels.acceptTerms}
                </span>
              </SkillButton>
            </form>
          </div>
        </section>
        {termsState.status !== "idle" ? (
          <ActionMessage state={termsState} />
        ) : null}

        <section className="publisher-account-flow-step publisher-account-flow-step--onboarding">
          <header className="publisher-account-flow-step__head">
            <span className="publisher-account-flow-step__index">03</span>
            <strong>{labels.onboardingTitle}</strong>
            <SkillStatusTag
              className={
                payoutAccount
                  ? "status-chip"
                  : "status-chip status-chip--warning"
              }
            >
              {payoutAccount
                ? formatStatusLabel(payoutAccount.status, labels.statuses)
                : labels.noAccount}
            </SkillStatusTag>
          </header>
          <form action={onboardingAction} className="publisher-onboarding-form">
            <strong>{labels.onboardingTitle}</strong>
            <input name="returnUrl" type="hidden" value={returnUrl} />
            <input name="refreshUrl" type="hidden" value={returnUrl} />
            <SkillButton
              className="secondary-button"
              disabled={isOnboardingPending}
              htmlType="submit"
            >
              <Link2 size={16} aria-hidden="true" />
              <span>
                {isOnboardingPending ? labels.saving : labels.onboarding}
              </span>
            </SkillButton>
          </form>
          {onboardingState.status !== "idle" ? (
            <ActionMessage state={onboardingState} />
          ) : null}
        </section>

        <section className="publisher-account-flow-step publisher-account-flow-step--readiness publisher-readiness-form">
          <header className="publisher-account-flow-step__head">
            <span className="publisher-account-flow-step__index">04</span>
            <strong>{labels.updateTitle}</strong>
            <SkillStatusTag
              className={
                payoutReady ? "status-chip" : "status-chip status-chip--warning"
              }
            >
              {payoutReady ? labels.ready : labels.requiresSetup}
            </SkillStatusTag>
          </header>
          <div className="publisher-readiness-form__status">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              {payoutReady
                ? labels.ready
                : payoutAccount
                  ? labels.pendingFinanceReview
                  : labels.requiresSetup}
            </span>
          </div>
        </section>
      </div>

      <div className="publisher-account-foot">
        <span>{labels.createdAt}</span>
        <strong>
          {formatDate(
            profile?.createdAt ??
              payoutAccount?.createdAt ??
              latestSession?.createdAt,
            labels.notAvailable,
            locale,
          )}
        </strong>
      </div>
    </article>
  );
}

function StatusTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
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

function formatStatusLabel(status: string, labels: Record<string, string>) {
  return labels[status] ?? status.replaceAll("_", " ");
}

function ActionMessage({ state }: { state: PublisherAccountActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}

function formatDate(
  value: string | null | undefined,
  fallback: string,
  locale: Locale,
) {
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
    year: "numeric",
  }).format(date);
}
