"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, LogIn, XCircle } from "lucide-react";
import { signInAction, type AuthActionState } from "@/lib/auth-actions";
import type { Locale } from "@/lib/i18n";

type SessionLoginFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    helper: "Use a token from signup, an invite, or the team console. It is stored in an httpOnly browser cookie for this app.",
    label: "User access token",
    placeholder: "shub_user_...",
    submit: "Connect workspace",
    submitting: "Verifying",
    title: "Already have a token?",
    workspace: "Open dashboard"
  },
  zh: {
    helper: "使用注册、邀请或团队控制台生成的用户 token。它会保存在本站的 httpOnly 浏览器 cookie 中。",
    label: "用户访问 token",
    placeholder: "shub_user_...",
    submit: "连接工作区",
    submitting: "验证中",
    title: "已有 token？",
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

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <article className="ops-panel auth-card">
      <div className="card-kicker">
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>
      <form action={action} className="auth-form">
        <label>
          <span>{labels.label}</span>
          <input autoComplete="off" name="token" placeholder={labels.placeholder} required type="password" />
        </label>
        <button className="primary-button" disabled={isPending} type="submit">
          <LogIn size={16} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>
      {state.status !== "idle" ? <AuthMessage state={state} /> : null}
      {state.subject ? (
        <div className="auth-subject">
          <strong>{state.subject.displayName ?? state.subject.email ?? "SkillHub user"}</strong>
          <span>{state.subject.roles.join(" / ")}</span>
          <a className="ghost-button ghost-button--inline" href={locale === "zh" ? "/dashboard?lang=zh" : "/dashboard?lang=en"}>
            {labels.workspace}
          </a>
        </div>
      ) : null}
    </article>
  );
}

function AuthMessage({ state }: { state: AuthActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
    </div>
  );
}
