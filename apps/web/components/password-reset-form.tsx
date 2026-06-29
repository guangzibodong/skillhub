"use client";

import { useActionState, useState } from "react";
import { Input } from "antd";
import Password from "antd/es/input/Password";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
  Send,
} from "lucide-react";
import { SkillAlert, SkillButton } from "@/components/skill-antd";
import {
  passwordResetAction,
  type PasswordResetActionState,
} from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type PasswordResetFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    backToLogin: "Back to sign in",
    code: "Verification code",
    codeHelp: "The code expires in 10 minutes and can be used once.",
    codePlaceholder: "123456",
    confirmPassword: "Confirm new password",
    confirmPasswordPlaceholder: "Re-enter new password",
    email: "Account email",
    emailPlaceholder: "you@company.com",
    helper:
      "Enter the email connected to your password login. If the account exists, SkillHub will queue a reset code.",
    hidePassword: "Hide password",
    newPassword: "New password",
    passwordPlaceholder: "At least 8 characters",
    previewCode: "Provider-deferred code preview",
    previewHelp:
      "Visible only when debug code preview is enabled before the email provider is connected.",
    requestButton: "Send reset code",
    requesting: "Sending",
    resetButton: "Reset password",
    resetting: "Resetting",
    showPassword: "Show password",
    successAction: "Sign in",
    title: "Reset password",
  },
  zh: {
    backToLogin: "返回登录",
    code: "验证码",
    codeHelp: "验证码 10 分钟内有效，只能使用一次。",
    codePlaceholder: "123456",
    confirmPassword: "确认新密码",
    confirmPasswordPlaceholder: "再次输入新密码",
    email: "账号邮箱",
    emailPlaceholder: "you@company.com",
    helper:
      "输入开通过密码登录的邮箱。如果账号存在，SkillHub 会把重置验证码加入发送队列。",
    hidePassword: "隐藏密码",
    newPassword: "新密码",
    passwordPlaceholder: "至少 8 位",
    previewCode: "邮件供应商接入前的验证码预览",
    previewHelp: "仅在调试预览开启时显示，正式邮件供应商接入后会关闭。",
    requestButton: "发送重置验证码",
    requesting: "发送中",
    resetButton: "重置密码",
    resetting: "重置中",
    showPassword: "显示密码",
    successAction: "去登录",
    title: "重置密码",
  },
} as const;

const initialState: PasswordResetActionState = {
  message: "",
  status: "idle",
};

export function PasswordResetForm({ locale }: PasswordResetFormProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    passwordResetAction.bind(null, locale),
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const showPreviewCode =
    process.env.NEXT_PUBLIC_SKILLHUB_SHOW_EMAIL_CODE_PREVIEW === "true";
  const feedbackId = "password-reset-feedback";
  const hasChallenge = Boolean(state.challenge && !state.completed);
  const showFeedback = state.status !== "idle";
  const passwordType = showPassword ? "text" : "password";
  const passwordActionLabel = showPassword
    ? labels.hidePassword
    : labels.showPassword;

  return (
    <section className="auth-card auth-card--password-reset">
      <div className="card-kicker">
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>

      {state.completed ? (
        <div className="auth-subject auth-token-result">
          <strong>{state.message}</strong>
          <a
            className="ghost-button ghost-button--inline"
            href={localizedHref("/login", locale)}
          >
            <MailCheck size={15} aria-hidden="true" />
            {labels.successAction}
          </a>
        </div>
      ) : hasChallenge ? (
        <form
          action={action}
          aria-busy={isPending}
          aria-describedby={showFeedback ? feedbackId : undefined}
          className="auth-form auth-form--stack"
        >
          <input name="intent" type="hidden" value="confirm" />
          <input
            name="challengeId"
            type="hidden"
            value={state.challenge?.challengeId}
          />
          <div className="auth-verification-panel">
            <strong>{state.challenge?.email}</strong>
            <span>{labels.codeHelp}</span>
            {showPreviewCode && state.challenge?.deliveryPreviewCode ? (
              <code title={labels.previewHelp}>
                {labels.previewCode}: {state.challenge.deliveryPreviewCode}
              </code>
            ) : null}
          </div>
          <label>
            <span>{labels.code}</span>
            <Input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              name="code"
              pattern="[0-9]{6}"
              placeholder={labels.codePlaceholder}
              required
            />
          </label>
          <div className="auth-password-field">
            <label htmlFor="password-reset-new-password">
              <span>{labels.newPassword}</span>
            </label>
            <Password
              autoComplete="new-password"
              id="password-reset-new-password"
              name="password"
              placeholder={labels.passwordPlaceholder}
              required
              type={passwordType}
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: () => setShowPassword((current) => !current),
              }}
              iconRender={(visible) =>
                visible ? <EyeOff size={16} aria-label={passwordActionLabel} /> : <Eye size={16} aria-label={passwordActionLabel} />
              }
            />
          </div>
          <label>
            <span>{labels.confirmPassword}</span>
            <Password
              autoComplete="new-password"
              name="confirmPassword"
              placeholder={labels.confirmPasswordPlaceholder}
              required
              type={passwordType}
              visibilityToggle={false}
            />
          </label>
          {showFeedback ? <PasswordResetMessage id={feedbackId} state={state} /> : null}
          <SkillButton
            className="primary-button auth-primary-button"
            disabled={isPending}
            htmlType="submit"
          >
            <Send size={16} aria-hidden="true" />
            <span>{isPending ? labels.resetting : labels.resetButton}</span>
          </SkillButton>
        </form>
      ) : (
        <form
          action={action}
          aria-busy={isPending}
          aria-describedby={showFeedback ? feedbackId : undefined}
          className="auth-form auth-form--stack"
        >
          <input name="intent" type="hidden" value="request" />
          <label>
            <span>{labels.email}</span>
            <Input
              autoComplete="email"
              name="email"
              placeholder={labels.emailPlaceholder}
              required
              type="email"
            />
          </label>
          {showFeedback ? <PasswordResetMessage id={feedbackId} state={state} /> : null}
          <SkillButton
            className="primary-button auth-primary-button"
            disabled={isPending}
            htmlType="submit"
          >
            <Send size={16} aria-hidden="true" />
            <span>{isPending ? labels.requesting : labels.requestButton}</span>
          </SkillButton>
        </form>
      )}

      <a className="auth-muted-action" href={localizedHref("/login", locale)}>
        <ArrowLeft size={15} aria-hidden="true" />
        <span>{labels.backToLogin}</span>
      </a>
    </section>
  );
}

function PasswordResetMessage({
  id,
  state,
}: {
  id: string;
  state: PasswordResetActionState;
}) {
  return (
    <SkillAlert
      aria-atomic="true"
      aria-live={state.status === "success" ? "polite" : "assertive"}
      className={
        state.status === "success"
          ? "action-message action-message--success auth-form__feedback"
          : "action-message action-message--error auth-form__feedback"
      }
      description={state.message}
      id={id}
      role={state.status === "success" ? "status" : "alert"}
      type={state.status === "success" ? "success" : "error"}
    />
  );
}
