"use client";

import { useActionState, type ReactNode } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Link2,
  Save,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { PublisherAccountSummary } from "@/lib/ops-data";
import {
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

const copy = {
  en: {
    accountStatus: "Account",
    complete: "Update readiness",
    completing: "Updating",
    createdAt: "Created",
    displayName: "Public publisher name",
    latestSession: "Latest onboarding",
    noAccount: "No payout account yet",
    noProfile: "Create publisher profile",
    noSession: "No onboarding session",
    notAvailable: "n/a",
    onboarding: "Create payout onboarding",
    onboardingProvider: "Provider",
    onboardingTitle: "Payout onboarding",
    openOnboarding: "Open handoff link",
    payoutReadiness: "Payout readiness",
    profile: "Publisher profile",
    reason: "Decision note",
    reasonPlaceholder: "Provider check passed, documents pending, or block reason",
    ready: "Ready for payouts",
    requiresSetup: "Needs payout setup",
    saveProfile: "Save profile",
    saving: "Saving",
    status: "Status",
    title: "Publisher account",
    updateTitle: "Readiness decision"
  },
  zh: {
    accountStatus: "收款账户",
    complete: "更新准备状态",
    completing: "更新中",
    createdAt: "创建时间",
    displayName: "公开发布者名称",
    latestSession: "最近入驻会话",
    noAccount: "还没有收款账户",
    noProfile: "创建发布者资料",
    noSession: "还没有入驻会话",
    notAvailable: "暂无",
    onboarding: "创建收款入驻",
    onboardingProvider: "服务商",
    onboardingTitle: "收款入驻",
    openOnboarding: "打开入驻链接",
    payoutReadiness: "提现准备",
    profile: "发布者资料",
    reason: "处理说明",
    reasonPlaceholder: "服务商验证通过、资料待补充或阻断原因",
    ready: "可提现",
    requiresSetup: "需要完成收款设置",
    saveProfile: "保存资料",
    saving: "保存中",
    status: "状态",
    title: "发布者账户",
    updateTitle: "准备状态处理"
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
  const handoffUrl = onboardingState.onboardingUrl ?? latestSession?.onboardingUrl;
  const payoutReady = profile?.payoutStatus === "verified" || payoutAccount?.status === "verified";

  return (
    <article className="ops-panel publisher-account-panel">
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
          icon={<BadgeCheck size={16} aria-hidden="true" />}
          label={labels.payoutReadiness}
          value={profile?.payoutStatus ?? labels.requiresSetup}
        />
        <StatusTile
          icon={<ShieldCheck size={16} aria-hidden="true" />}
          label={labels.accountStatus}
          value={payoutAccount ? `${payoutAccount.provider} / ${payoutAccount.status}` : labels.noAccount}
        />
        <StatusTile
          icon={<Clock3 size={16} aria-hidden="true" />}
          label={labels.latestSession}
          value={latestSession ? `${latestSession.provider} / ${latestSession.status}` : labels.noSession}
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

      <form action={onboardingAction} className="publisher-onboarding-form">
        <strong>{labels.onboardingTitle}</strong>
        <input name="returnUrl" type="hidden" value={returnUrl} />
        <input name="refreshUrl" type="hidden" value={returnUrl} />
        <label>
          <span>{labels.onboardingProvider}</span>
          <input defaultValue={payoutAccount?.provider ?? "manual_deferred"} name="provider" />
        </label>
        <button className="secondary-button" disabled={isOnboardingPending} type="submit">
          <Link2 size={16} aria-hidden="true" />
          <span>{isOnboardingPending ? labels.saving : labels.onboarding}</span>
        </button>
      </form>
      {onboardingState.status !== "idle" ? <ActionMessage state={onboardingState} /> : null}

      {handoffUrl ? (
        <a className="publisher-onboarding-link" href={handoffUrl} rel="noreferrer" target="_blank">
          <ExternalLink size={15} aria-hidden="true" />
          <span>{labels.openOnboarding}</span>
        </a>
      ) : null}

      <form action={readinessAction} className="publisher-readiness-form">
        <strong>{labels.updateTitle}</strong>
        <input name="sessionId" type="hidden" value={completionSessionId} />
        <input name="payoutAccountId" type="hidden" value={completionAccountId} />
        <label>
          <span>{labels.status}</span>
          <select defaultValue={profile?.payoutStatus === "verified" ? "verified" : "verification_required"} name="status">
            <option value="verified">verified</option>
            <option value="verification_required">verification_required</option>
            <option value="blocked">blocked</option>
            <option value="not_configured">not_configured</option>
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
