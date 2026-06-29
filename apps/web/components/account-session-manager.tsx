"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, LogOut, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillStatusTag } from "@/components/skill-antd";
import {
  revokeAccountSessionAction,
  type AccountSessionActionState
} from "@/lib/account-session-actions";
import type { AccountSessionRecord } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AccountSessionManagerProps = {
  locale: Locale;
  sessions: AccountSessionRecord[];
};

const copy = {
  en: {
    active: "Active",
    activeCount: "active",
    created: "Created",
    current: "Current",
    currentHint: "Use sign out to end the current browser session.",
    empty: "No account sessions found.",
    expired: "Expired",
    expiredHint: "This session is already expired.",
    lastUsed: "Last used",
    neverUsed: "Never used",
    organization: "Workspace",
    revoke: "Revoke",
    revoked: "Revoked",
    revokedHint: "This session has already been revoked.",
    scopes: "Scopes",
    signingOut: "Revoking",
    title: "Session security",
    token: "Token fingerprint"
  },
  zh: {
    active: "有效",
    activeCount: "有效会话",
    created: "创建",
    current: "当前",
    currentHint: "当前浏览器会话请使用退出登录结束。",
    empty: "还没有账号会话。",
    expired: "已过期",
    expiredHint: "这个会话已经过期。",
    lastUsed: "最近使用",
    neverUsed: "未使用",
    organization: "工作区",
    revoke: "撤销",
    revoked: "已撤销",
    revokedHint: "这个会话已经撤销。",
    scopes: "权限",
    signingOut: "撤销中",
    title: "会话安全",
    token: "Token 指纹"
  }
} as const;

const initialState: AccountSessionActionState = {
  message: "",
  status: "idle"
};

export function AccountSessionManager({ locale, sessions }: AccountSessionManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    revokeAccountSessionAction.bind(null, locale),
    initialState
  );
  const activeCount = sessions.filter((session) => session.status === "active").length;

  return (
    <article className="ops-panel account-security-panel account-session-panel">
      <div className="account-session-panel__head">
        <div className="card-kicker">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{labels.title}</span>
        </div>
        <SkillStatusTag className="status-chip status-chip--neutral" tone="neutral">
          {activeCount} / {sessions.length} {labels.activeCount}
        </SkillStatusTag>
      </div>

      {sessions.length === 0 ? (
        <div className="auth-empty-state">
          <strong>{labels.empty}</strong>
        </div>
      ) : (
        <div className="account-session-list">
          {sessions.map((session) => {
            const canRevoke = session.status === "active" && !session.isCurrent;
            const statusMessage = state.tokenId === session.tokenId ? state : null;

            return (
              <div
                className={`account-session-card${session.isCurrent ? " account-session-card--current" : ""}${session.status === "revoked" ? " account-session-card--revoked" : ""}`}
                key={session.tokenId}
              >
                <div className="account-session-card__head">
                  <div>
                    <strong>{session.name}</strong>
                    <span>{workspaceLabel(session, labels.organization)}</span>
                  </div>
                  <SkillStatusTag className={sessionStatusClass(session)}>{session.isCurrent ? labels.current : statusText(session, locale)}</SkillStatusTag>
                </div>

                <div className="account-session-token">
                  <KeyRound size={15} aria-hidden="true" />
                  <span>{labels.token}</span>
                  <code>{session.tokenPrefix}...{session.tokenLast4}</code>
                </div>

                <div className="account-session-meta">
                  <div>
                    <span>{labels.created}</span>
                    <strong>{formatDateTime(session.createdAt, locale)}</strong>
                  </div>
                  <div>
                    <span>{labels.lastUsed}</span>
                    <strong>{session.lastUsedAt ? formatDateTime(session.lastUsedAt, locale) : labels.neverUsed}</strong>
                  </div>
                  <div>
                    <span>{labels.scopes}</span>
                    <strong>{session.scopes.length ? session.scopes.join(" / ") : "default"}</strong>
                  </div>
                </div>

                {canRevoke ? (
                  <form action={action} className="account-session-action">
                    <input name="tokenId" type="hidden" value={session.tokenId} />
                    <SkillButton className="ghost-button ghost-button--danger ghost-button--inline" disabled={isPending} htmlType="submit">
                      <Trash2 size={15} aria-hidden="true" />
                      <span>{isPending && statusMessage ? labels.signingOut : labels.revoke}</span>
                    </SkillButton>
                  </form>
                ) : (
                  <div className="account-session-hint">
                    <LogOut size={14} aria-hidden="true" />
                    <span>{sessionHint(session, locale)}</span>
                  </div>
                )}

                {statusMessage && statusMessage.status !== "idle" ? <ActionMessage state={statusMessage} /> : null}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function ActionMessage({ state }: { state: AccountSessionActionState }) {
  return <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />;
}

function sessionStatusClass(session: AccountSessionRecord) {
  if (session.isCurrent) {
    return "status-chip status-chip--success";
  }

  if (session.status === "revoked") {
    return "status-chip status-chip--danger";
  }

  if (session.status === "expired") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function statusText(session: AccountSessionRecord, locale: Locale) {
  const labels = copy[locale];

  if (session.status === "revoked") {
    return labels.revoked;
  }

  if (session.status === "expired") {
    return labels.expired;
  }

  return labels.active;
}

function sessionHint(session: AccountSessionRecord, locale: Locale) {
  const labels = copy[locale];

  if (session.isCurrent) {
    return labels.currentHint;
  }

  if (session.status === "revoked") {
    return labels.revokedHint;
  }

  return labels.expiredHint;
}

function workspaceLabel(session: AccountSessionRecord, fallback: string) {
  if (session.organizationName || session.organizationSlug) {
    return [session.organizationName, session.organizationSlug].filter(Boolean).join(" / ");
  }

  return fallback;
}

function formatDateTime(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "暂无" : "n/a";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
