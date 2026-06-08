"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, LogIn, XCircle } from "lucide-react";
import { signInAction, type AuthActionState } from "@/lib/auth-actions";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";

type SessionLoginFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    helper:
      "Use a token created by an invite or the team console. SkillHub stores it in an httpOnly browser cookie for this app.",
    label: "User access token",
    placeholder: "shub_user_...",
    submit: "Connect workspace",
    submitting: "Verifying",
    title: "Token fallback",
    workspace: "Open dashboard"
  },
  zh: {
    helper:
      "使用邀请或团队控制台生成的用户 token。SkillHub 会把它写入本站 httpOnly 浏览器 cookie，原始 token 不会在页面里展示。",
    label: "用户访问 token",
    placeholder: "shub_user_...",
    submit: "连接工作区",
    submitting: "验证中",
    title: "Token 兜底登录",
    workspace: "打开工作台"
  }
} as const;

const initialState: AuthActionState = {
  message: "",
  status: "idle"
};

export function SessionLoginForm({ locale }: SessionLoginFormProps) {
  const labels = copy[locale];
  const router = useRouter();
  const [state, action, isPending] = useActionState(signInAction.bind(null, locale), initialState);
  const feedbackId = "token-fallback-feedback";
  const showFeedback = state.status !== "idle";

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <article className="ops-panel auth-card auth-card--token-fallback" id="token-fallback">
      <div className="card-kicker">
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>
      <form
        action={action}
        aria-busy={isPending}
        aria-describedby={showFeedback ? feedbackId : undefined}
        className="auth-form"
      >
        <label>
          <span>{labels.label}</span>
          <input autoComplete="off" name="token" placeholder={labels.placeholder} required type="password" />
        </label>
        <button className="secondary-button" disabled={isPending} type="submit">
          <LogIn size={16} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>
      {showFeedback ? <AuthMessage id={feedbackId} state={state} /> : null}
      {state.subject ? (
        <div className="auth-subject">
          <strong>{state.subject.displayName ?? state.subject.email ?? "SkillHub user"}</strong>
          <span>{state.subject.roles.join(" / ")}</span>
          <a className="ghost-button ghost-button--inline" href={localizedHref("/dashboard", locale)}>
            {labels.workspace}
          </a>
        </div>
      ) : null}
    </article>
  );
}

function AuthMessage({ id, state }: { id: string; state: AuthActionState }) {
  return (
    <div
      aria-atomic="true"
      aria-live={state.status === "success" ? "polite" : "assertive"}
      className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}
      id={id}
      role={state.status === "success" ? "status" : "alert"}
    >
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
