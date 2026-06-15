"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  MailCheck,
  Send,
  UserPlus,
  XCircle,
} from "lucide-react";
import { signUpAction, type SignupActionState } from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type WorkspaceSignupFormProps = {
  locale: Locale;
  returnTo?: string;
  surface?: "card" | "embedded";
};

const copy = {
  en: {
    code: "Verification code",
    codeHelp: "The code expires in 10 minutes and can be used once.",
    codePlaceholder: "123456",
    createAccount: "Create account",
    createMode: "Register",
    createPrompt: "New to SkillHub?",
    createPromptAction: "Create a workspace",
    developer: "Developer workspace",
    developerHelp: "Build projects, install skills, and create API keys for agents.",
    displayName: "Your name",
    displayNamePlaceholder: "Asha Chen",
    email: "Work email",
    emailLoginMode: "Sign in",
    emailPlaceholder: "you@company.com",
    forgotDisabledTitle:
      "Password reset is not public yet. Contact support for account recovery or use an operator-issued recovery token below.",
    forgotPassword: "Forgot password? Contact support",
    hidePassword: "Hide password",
    helper: "Use email or username with a password, or register a new workspace.",
    identifier: "Email or username",
    identifierPlaceholder: "you@company.com or asha",
    organizationName: "Organization name",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "Workspace slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "Owner workspace",
    ownerHelp:
      "Start with full access across developer, publisher, billing, payout, and team setup.",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    previewCode: "Provider-deferred code preview",
    previewHelp:
      "Visible only when debug code preview is enabled before the email provider is connected.",
    publisher: "Publisher workspace",
    publisherHelp: "Publish skills, submit reviews, price listings, and prepare payouts.",
    remember: "Remember me",
    requestCode: "Send code",
    requestingCode: "Sending",
    role: "Primary workspace path",
    signIn: "Sign in",
    showPassword: "Show password",
    submitting: "Please wait",
    title: "Email or username",
    username: "Username",
    usernamePlaceholder: "asha",
    verify: "Verify and enter",
    verifying: "Verifying",
    workspace: "Open dashboard",
  },
  zh: {
    code: "验证码",
    codeHelp: "验证码 10 分钟内有效，只能使用一次。",
    codePlaceholder: "123456",
    createAccount: "创建账号",
    createMode: "注册",
    createPrompt: "还没有账号？",
    createPromptAction: "创建工作区",
    developer: "开发者工作区",
    developerHelp: "创建项目、安装技能，并为智能体生成 API Key。",
    displayName: "你的姓名",
    displayNamePlaceholder: "陈明",
    email: "工作邮箱",
    emailLoginMode: "登录",
    emailPlaceholder: "you@company.com",
    forgotDisabledTitle:
      "公开密码重置还没有上线。请联系支持恢复账号，或使用管理员提供的恢复令牌。",
    forgotPassword: "忘记密码？联系支持",
    hidePassword: "隐藏密码",
    helper: "使用邮箱或用户名加密码登录，也可以注册新的工作区。",
    identifier: "邮箱或用户名",
    identifierPlaceholder: "you@company.com 或 asha",
    organizationName: "组织名称",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "工作区 slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "负责人工作区",
    ownerHelp: "先获得完整工作区权限，可配置开发者、发布者、账单、提现和团队。",
    password: "密码",
    passwordPlaceholder: "至少 8 位",
    previewCode: "邮件供应商接入前的验证码预览",
    previewHelp: "仅在调试预览开启时显示，正式邮件供应商接入后会关闭。",
    publisher: "发布者工作区",
    publisherHelp: "发布技能、提交审核、设置价格，并准备提现资料。",
    remember: "记住我",
    requestCode: "发送验证码",
    requestingCode: "发送中",
    role: "主要使用路径",
    signIn: "登录",
    showPassword: "显示密码",
    submitting: "处理中",
    title: "邮箱或用户名登录",
    username: "用户名",
    usernamePlaceholder: "asha",
    verify: "验证并进入",
    verifying: "验证中",
    workspace: "打开工作台",
  },
} as const;

const initialState: SignupActionState = {
  message: "",
  status: "idle",
};

export function WorkspaceSignupForm({
  locale,
  returnTo,
  surface = "card",
}: WorkspaceSignupFormProps) {
  const labels = copy[locale];
  const router = useRouter();
  const passwordId = useId();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [state, action, isPending] = useActionState(
    signUpAction.bind(null, locale),
    initialState,
  );
  const showChallenge = Boolean(state.challenge && !state.subject);
  const showPreviewCode =
    process.env.NEXT_PUBLIC_SKILLHUB_SHOW_EMAIL_CODE_PREVIEW === "true";
  const feedbackId = "password-access-feedback";
  const showFeedback = state.status !== "idle" && !state.subject;
  const rootClass =
    surface === "embedded"
      ? "auth-card auth-card--signup auth-card--embedded"
      : "ops-panel auth-card auth-card--signup";

  useEffect(() => {
    if (state.status === "success") {
      const target =
        state.redirectTo ?? returnTo ?? localizedHref("/role-landing", locale);
      router.replace(target as Parameters<typeof router.replace>[0]);
    }
  }, [locale, returnTo, router, state.redirectTo, state.status]);

  return (
    <section className={rootClass} id="email-registration">
      <div className="card-kicker">
        <MailCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>

      {!showChallenge && !state.subject ? (
        <form
          action={action}
          aria-busy={isPending}
          aria-describedby={showFeedback ? feedbackId : undefined}
          className="auth-form auth-form--stack"
        >
          <input name="intent" type="hidden" value="password" />
          <input name="mode" type="hidden" value={mode} />
          <input
            name="returnTo"
            type="hidden"
            value={returnTo ?? localizedHref("/role-landing", locale)}
          />
          <div className="auth-mode-switch" role="group" aria-label={labels.title}>
            <button
              className={
                mode === "login"
                  ? "auth-mode-switch__item auth-mode-switch__item--active"
                  : "auth-mode-switch__item"
              }
              onClick={() => setMode("login")}
              aria-pressed={mode === "login"}
              type="button"
            >
              <MailCheck size={15} aria-hidden="true" />
              <span>{labels.emailLoginMode}</span>
            </button>
            <button
              className={
                mode === "signup"
                  ? "auth-mode-switch__item auth-mode-switch__item--active"
                  : "auth-mode-switch__item"
              }
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
              type="button"
            >
              <UserPlus size={15} aria-hidden="true" />
              <span>{labels.createMode}</span>
            </button>
          </div>

          <div
            className={
              mode === "login"
                ? "auth-form-grid auth-form-grid--single"
                : "auth-form-grid"
            }
          >
            {mode === "signup" ? (
              <>
                <label>
                  <span>{labels.username}</span>
                  <input
                    autoComplete="username"
                    name="username"
                    placeholder={labels.usernamePlaceholder}
                    required
                  />
                </label>
                <label>
                  <span>{labels.email}</span>
                  <input
                    autoComplete="email"
                    name="email"
                    placeholder={labels.emailPlaceholder}
                    required
                    type="email"
                  />
                </label>
                <PasswordField
                  autoComplete="new-password"
                  className="auth-form-grid__wide"
                  id={`${passwordId}-signup`}
                  labels={labels}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword((current) => !current)}
                />
                <label>
                  <span>{labels.displayName}</span>
                  <input
                    autoComplete="name"
                    name="displayName"
                    placeholder={labels.displayNamePlaceholder}
                  />
                </label>
                <label>
                  <span>{labels.organizationName}</span>
                  <input
                    name="organizationName"
                    placeholder={labels.organizationNamePlaceholder}
                    required
                  />
                </label>
                <label>
                  <span>{labels.organizationSlug}</span>
                  <input
                    name="organizationSlug"
                    placeholder={labels.organizationSlugPlaceholder}
                  />
                </label>
                <label className="auth-form-grid__wide">
                  <span>{labels.role}</span>
                  <select defaultValue="developer" name="role">
                    <option value="developer">{labels.developer}</option>
                    <option value="publisher">{labels.publisher}</option>
                    <option value="owner">{labels.owner}</option>
                  </select>
                </label>
              </>
            ) : (
              <>
                <label>
                  <span>{labels.identifier}</span>
                  <input
                    autoComplete="username"
                    name="identifier"
                    placeholder={labels.identifierPlaceholder}
                    required
                  />
                </label>
                <PasswordField
                  autoComplete="current-password"
                  id={`${passwordId}-login`}
                  labels={labels}
                  showPassword={showPassword}
                  togglePassword={() => setShowPassword((current) => !current)}
                />
              </>
            )}
          </div>

          {mode === "login" ? (
            <div className="auth-form-options">
              <label className="auth-checkbox-row">
                <input defaultChecked name="remember" type="checkbox" />
                <span>{labels.remember}</span>
              </label>
              <a
                className="auth-muted-action"
                href={localizedHref("/support", locale)}
                title={labels.forgotDisabledTitle}
              >
                {labels.forgotPassword}
              </a>
            </div>
          ) : null}

          {mode === "signup" ? (
            <div className="auth-role-hints">
              <span>
                <Building2 size={14} aria-hidden="true" />
                {labels.ownerHelp}
              </span>
              <span>{labels.developerHelp}</span>
              <span>{labels.publisherHelp}</span>
            </div>
          ) : null}

          {showFeedback ? <SignupMessage id={feedbackId} state={state} /> : null}

          <button className="primary-button auth-primary-button" disabled={isPending} type="submit">
            <Send size={16} aria-hidden="true" />
            <span>
              {isPending
                ? labels.submitting
                : mode === "signup"
                  ? labels.createAccount
                  : labels.signIn}
            </span>
          </button>

          {mode === "login" ? (
            <p className="auth-register-prompt">
              <span>{labels.createPrompt}</span>
              <button onClick={() => setMode("signup")} type="button">
                {labels.createPromptAction}
              </button>
            </p>
          ) : null}
        </form>
      ) : null}

      {showChallenge ? (
        <form
          action={action}
          aria-busy={isPending}
          aria-describedby={showFeedback ? feedbackId : undefined}
          className="auth-form auth-form--stack auth-verification-form"
        >
          <input name="intent" type="hidden" value="verify" />
          <input
            name="challengeId"
            type="hidden"
            value={state.challenge?.challengeId}
          />
          <input
            name="returnTo"
            type="hidden"
            value={returnTo ?? localizedHref("/role-landing", locale)}
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
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              name="code"
              pattern="[0-9]{6}"
              placeholder={labels.codePlaceholder}
              required
            />
          </label>
          {showFeedback ? <SignupMessage id={feedbackId} state={state} /> : null}
          <button className="primary-button auth-primary-button" disabled={isPending} type="submit">
            <MailCheck size={16} aria-hidden="true" />
            <span>{isPending ? labels.verifying : labels.verify}</span>
          </button>
        </form>
      ) : null}

      {state.subject ? (
        <div className="auth-subject auth-token-result">
          <strong>
            {state.organization?.name ??
              state.subject.displayName ??
              state.subject.email ??
              "SkillHub"}
            {state.organization?.slug ? ` / ${state.organization.slug}` : ""}
          </strong>
          <span>{state.subject.roles.join(" / ")}</span>
          <a
            className="ghost-button ghost-button--inline"
            href={state.redirectTo ?? returnTo ?? localizedHref("/role-landing", locale)}
          >
            <KeyRound size={15} aria-hidden="true" />
            {labels.workspace}
          </a>
        </div>
      ) : null}
    </section>
  );
}

function PasswordField({
  autoComplete,
  className,
  id,
  labels,
  showPassword,
  togglePassword,
}: {
  autoComplete: "current-password" | "new-password";
  className?: string;
  id: string;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  showPassword: boolean;
  togglePassword: () => void;
}) {
  const actionLabel = showPassword ? labels.hidePassword : labels.showPassword;

  return (
    <div className={className ? `auth-password-field ${className}` : "auth-password-field"}>
      <label htmlFor={id}>
        <span>{labels.password}</span>
      </label>
      <div className="auth-password-control">
        <input
          autoComplete={autoComplete}
          id={id}
          name="password"
          placeholder={labels.passwordPlaceholder}
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={actionLabel}
          className="auth-password-toggle"
          onClick={togglePassword}
          title={actionLabel}
          type="button"
        >
          {showPassword ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

function SignupMessage({ id, state }: { id: string; state: SignupActionState }) {
  return (
    <div
      aria-atomic="true"
      aria-live={state.status === "success" ? "polite" : "assertive"}
      className={
        state.status === "success"
          ? "action-message action-message--success auth-form__feedback"
          : "action-message action-message--error auth-form__feedback"
      }
      id={id}
      role={state.status === "success" ? "status" : "alert"}
    >
      {state.status === "success" ? (
        <CheckCircle2 size={16} aria-hidden="true" />
      ) : (
        <XCircle size={16} aria-hidden="true" />
      )}
      <span>{state.message}</span>
    </div>
  );
}
