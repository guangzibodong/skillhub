"use client";

import { useActionState } from "react";
import { CheckCircle2, Chrome, Github, KeyRound, Mail, Unlink, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillStatusTag } from "@/components/skill-antd";
import type { AuthProviderStatus } from "@/lib/account-data";
import {
  disconnectAccountIdentityAction,
  type AccountIdentityActionState
} from "@/lib/account-identity-actions";
import type { Locale } from "@/lib/i18n";

type AccountLoginMethodManagerProps = {
  locale: Locale;
  methods: AuthProviderStatus[];
};

const copy = {
  en: {
    connectedAt: "Connected",
    disconnect: "Disconnect",
    disconnecting: "Disconnecting",
    email: "Email",
    lastLogin: "Last login",
    verifiedEmail: "Verified email"
  },
  zh: {
    connectedAt: "连接时间",
    disconnect: "解绑",
    disconnecting: "解绑中",
    email: "邮箱",
    lastLogin: "最近登录",
    verifiedEmail: "已验证邮箱"
  }
} as const;

const initialState: AccountIdentityActionState = {
  message: "",
  status: "idle"
};

export function AccountLoginMethodManager({ locale, methods }: AccountLoginMethodManagerProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    disconnectAccountIdentityAction.bind(null, locale),
    initialState
  );

  return (
    <div className="account-method-grid">
      {methods.map((method) => {
        const statusMessage = state.provider === method.provider ? state : null;

        return (
          <LoginMethodCard
            action={action}
            isPending={isPending}
            key={method.provider}
            labels={labels}
            locale={locale}
            method={method}
            state={statusMessage}
          />
        );
      })}
    </div>
  );
}

function LoginMethodCard({
  action,
  isPending,
  labels,
  locale,
  method,
  state
}: {
  action: (formData: FormData) => void;
  isPending: boolean;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  method: AuthProviderStatus;
  state: AccountIdentityActionState | null;
}) {
  const Icon = method.provider === "github" ? Github : method.provider === "google" ? Chrome : method.provider === "email" ? Mail : KeyRound;
  const emailLine = method.providerEmail
    ? `${method.emailVerified ? labels.verifiedEmail : labels.email}: ${method.providerEmail}`
    : localizedMethodDescription(method, locale);
  const canDisconnect = method.canDisconnect && method.type === "oauth" && (method.provider === "google" || method.provider === "github");

  return (
    <div className={`account-method-card account-method-card--${method.provider}`}>
      <div className="account-method-card__icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <strong>{providerLabel(method, locale)}</strong>
      <SkillStatusTag className={statusClass(method.status)}>{statusText(method.status, locale)}</SkillStatusTag>
      <p>{emailLine}</p>
      {method.connectedAt ? <small>{`${labels.connectedAt}: ${formatDate(method.connectedAt, locale)}`}</small> : null}
      {method.lastLoginAt ? <small>{`${labels.lastLogin}: ${formatDate(method.lastLoginAt, locale)}`}</small> : null}

      {canDisconnect ? (
        <form action={action} className="account-method-disconnect-form">
          <input name="provider" type="hidden" value={method.provider} />
          <SkillButton className="ghost-button ghost-button--danger ghost-button--inline" disabled={isPending} htmlType="submit">
            <Unlink size={14} aria-hidden="true" />
            <span>{isPending && state ? labels.disconnecting : labels.disconnect}</span>
          </SkillButton>
        </form>
      ) : null}

      {state && state.status !== "idle" ? <ActionMessage state={state} /> : null}
    </div>
  );
}

function ActionMessage({ state }: { state: AccountIdentityActionState }) {
  return (
    <SkillAlert className="action-message" icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />} message={state.message} type={state.status === "success" ? "success" : "error"} />
  );
}

function localizedMethodDescription(method: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return method.description;
  }

  if (method.provider === "email") {
    return "邮箱验证码可用于创建工作区或登录已有工作区。";
  }

  if (method.provider === "google") {
    return method.status === "active" ? "Google OAuth 已可用于登录。" : "配置 Google 凭证和回调后启用。";
  }

  if (method.provider === "github") {
    return method.status === "active" ? "GitHub OAuth 已可用于登录。" : "配置 GitHub 凭证和回调后启用。";
  }

  return "团队邀请和运营兜底使用用户 token。";
}

function statusClass(status: AuthProviderStatus["status"]) {
  if (status === "connected") {
    return "status-chip status-chip--success";
  }

  if (status === "configuration_required") {
    return "status-chip status-chip--warning";
  }

  if (status === "active") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function statusText(status: AuthProviderStatus["status"], locale: Locale) {
  if (locale === "zh") {
    return {
      active: "可用",
      configuration_required: "待配置",
      connected: "已连接",
      deferred: "待回调"
    }[status];
  }

  return {
    active: "Active",
    configuration_required: "Configuration required",
    connected: "Connected",
    deferred: "Callback pending"
  }[status];
}

function providerLabel(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.provider === "email" ? "Email / password" : provider.label;
  }

  if (provider.provider === "email") {
    return "邮箱 / 密码";
  }

  if (provider.provider === "token") {
    return "用户 token";
  }

  return provider.label;
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "zh" ? "暂无" : "n/a";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    dateStyle: "medium"
  }).format(date);
}
