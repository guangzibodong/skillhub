"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, KeyRound, MailCheck, Send, UserPlus, XCircle } from "lucide-react";
import { signUpAction, type SignupActionState } from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/i18n";

type WorkspaceSignupFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    code: "Verification code",
    codeHelp: "The code expires in 10 minutes and can be used once.",
    codePlaceholder: "123456",
    createMode: "Create workspace",
    developer: "Developer workspace",
    developerHelp: "Build projects, install skills, and create API keys for agents.",
    displayName: "Your name",
    displayNamePlaceholder: "Asha Chen",
    email: "Work email",
    emailLoginMode: "Email login",
    emailPlaceholder: "you@company.com",
    helper:
      "Use email verification for normal workspace access. SkillHub queues the email delivery event now; token fallback stays available for team invites and operators.",
    organizationName: "Organization name",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "Workspace slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "Owner workspace",
    ownerHelp: "Start with full access across developer, publisher, billing, payout, and team setup.",
    previewCode: "Provider-deferred code preview",
    previewHelp: "Visible only when debug code preview is enabled before the email provider is connected.",
    publisher: "Publisher workspace",
    publisherHelp: "Publish skills, submit reviews, price listings, and prepare payouts.",
    requestCode: "Send code",
    requestingCode: "Sending",
    role: "Primary workspace path",
    title: "Email access",
    verify: "Verify and enter",
    verifying: "Verifying",
    workspace: "Open dashboard"
  },
  zh: {
    code: "验证码",
    codeHelp: "验证码 10 分钟内有效，只能使用一次。",
    codePlaceholder: "123456",
    createMode: "创建工作区",
    developer: "开发者工作区",
    developerHelp: "创建项目、安装技能，并为智能体生成 API Key。",
    displayName: "你的姓名",
    displayNamePlaceholder: "陈明",
    email: "工作邮箱",
    emailLoginMode: "邮箱登录",
    emailPlaceholder: "you@company.com",
    helper: "普通用户用邮箱验证码进入工作区。现在先记录邮件发送事件；团队邀请和运营仍保留 token 兜底。",
    organizationName: "组织名称",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "工作区 slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "所有者工作区",
    ownerHelp: "先获得完整工作区权限，可配置开发者、发布者、账单、提现和团队。",
    previewCode: "邮件供应商接入前的验证码预览",
    previewHelp: "仅在调试预览开启时显示，正式邮件供应商接入后会关闭。",
    publisher: "发布者工作区",
    publisherHelp: "发布技能、提交审核、设置价格，并准备提现资料。",
    requestCode: "发送验证码",
    requestingCode: "发送中",
    role: "主要使用路径",
    title: "邮箱访问",
    verify: "验证并进入",
    verifying: "验证中",
    workspace: "打开工作台"
  }
} as const;

const initialState: SignupActionState = {
  message: "",
  status: "idle"
};

export function WorkspaceSignupForm({ locale }: WorkspaceSignupFormProps) {
  const labels = copy[locale];
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [state, action, isPending] = useActionState(signUpAction.bind(null, locale), initialState);
  const showChallenge = Boolean(state.challenge && !state.subject);

  useEffect(() => {
    if (state.status === "success" && state.subject) {
      router.refresh();
    }
  }, [router, state.status, state.subject]);

  return (
    <article className="ops-panel auth-card auth-card--signup" id="email-registration">
      <div className="card-kicker">
        <UserPlus size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>

      {!showChallenge && !state.subject ? (
        <form action={action} className="auth-form auth-form--stack">
          <input name="intent" type="hidden" value="request" />
          <input name="mode" type="hidden" value={mode} />
          <div className="auth-mode-switch" role="group" aria-label={labels.title}>
            <button
              className={mode === "signup" ? "auth-mode-switch__item auth-mode-switch__item--active" : "auth-mode-switch__item"}
              onClick={() => setMode("signup")}
              type="button"
            >
              <UserPlus size={15} aria-hidden="true" />
              <span>{labels.createMode}</span>
            </button>
            <button
              className={mode === "login" ? "auth-mode-switch__item auth-mode-switch__item--active" : "auth-mode-switch__item"}
              onClick={() => setMode("login")}
              type="button"
            >
              <MailCheck size={15} aria-hidden="true" />
              <span>{labels.emailLoginMode}</span>
            </button>
          </div>
          <div className="auth-form-grid">
            <label>
              <span>{labels.email}</span>
              <input autoComplete="email" name="email" placeholder={labels.emailPlaceholder} required type="email" />
            </label>
            <label>
              <span>{labels.displayName}</span>
              <input autoComplete="name" name="displayName" placeholder={labels.displayNamePlaceholder} />
            </label>
            {mode === "signup" ? (
              <>
                <label>
                  <span>{labels.organizationName}</span>
                  <input name="organizationName" placeholder={labels.organizationNamePlaceholder} required />
                </label>
                <label>
                  <span>{labels.organizationSlug}</span>
                  <input name="organizationSlug" placeholder={labels.organizationSlugPlaceholder} />
                </label>
                <label className="auth-form-grid__wide">
                  <span>{labels.role}</span>
                  <select defaultValue="owner" name="role">
                    <option value="owner">{labels.owner}</option>
                    <option value="developer">{labels.developer}</option>
                    <option value="publisher">{labels.publisher}</option>
                  </select>
                </label>
              </>
            ) : null}
          </div>
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
          <button className="primary-button" disabled={isPending} type="submit">
            <Send size={16} aria-hidden="true" />
            <span>{isPending ? labels.requestingCode : labels.requestCode}</span>
          </button>
        </form>
      ) : null}

      {showChallenge ? (
        <form action={action} className="auth-form auth-form--stack auth-verification-form">
          <input name="intent" type="hidden" value="verify" />
          <input name="challengeId" type="hidden" value={state.challenge?.challengeId} />
          <div className="auth-verification-panel">
            <strong>{state.challenge?.email}</strong>
            <span>{labels.codeHelp}</span>
            {state.challenge?.deliveryPreviewCode ? (
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
          <button className="primary-button" disabled={isPending} type="submit">
            <MailCheck size={16} aria-hidden="true" />
            <span>{isPending ? labels.verifying : labels.verify}</span>
          </button>
        </form>
      ) : null}

      {state.status !== "idle" ? <SignupMessage state={state} /> : null}

      {state.subject ? (
        <div className="auth-subject auth-token-result">
          <strong>
            {state.organization?.name ?? state.subject.displayName ?? state.subject.email ?? "SkillHub"}
            {state.organization?.slug ? ` / ${state.organization.slug}` : ""}
          </strong>
          <span>{state.subject.roles.join(" / ")}</span>
          <a className="ghost-button ghost-button--inline" href={localizedHref("/dashboard", locale)}>
            <KeyRound size={15} aria-hidden="true" />
            {labels.workspace}
          </a>
        </div>
      ) : null}
    </article>
  );
}

function SignupMessage({ state }: { state: SignupActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
