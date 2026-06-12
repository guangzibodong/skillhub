"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, LogIn, XCircle } from "lucide-react";
import { signInAction, type AuthActionState } from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type SessionLoginFormProps = {
  locale: Locale;
  returnTo?: string;
  surface?: "card" | "embedded";
};

const copy = {
  en: {
    helper:
      "Use this only when a SkillHub administrator or invite flow gave you a one-time token. Most users should use OAuth or email/password.",
    label: "Invite/recovery token",
    placeholder: "Paste invite or recovery token",
    submit: "Continue with token",
    submitting: "Verifying",
    title: "Invite or recovery token only",
    workspace: "Open dashboard",
  },
  zh: {
    helper:
      "仅当 SkillHub 管理员或邀请流程提供一次性令牌时使用。大多数用户应使用第三方登录或邮箱密码登录。",
    label: "邀请或恢复令牌",
    placeholder: "粘贴邀请或恢复令牌",
    submit: "使用令牌继续",
    submitting: "验证中",
    title: "邀请或恢复令牌",
    workspace: "打开工作台",
  },
} as const;

const initialState: AuthActionState = {
  message: "",
  status: "idle",
};

export function SessionLoginForm({
  locale,
  returnTo,
  surface = "card",
}: SessionLoginFormProps) {
  const labels = copy[locale];
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    signInAction.bind(null, locale),
    initialState,
  );
  const feedbackId = "token-fallback-feedback";
  const showFeedback = state.status !== "idle";
  const rootClass =
    surface === "embedded"
      ? "auth-card auth-card--token-fallback auth-card--embedded-token"
      : "ops-panel auth-card auth-card--token-fallback";

  useEffect(() => {
    if (state.status === "success") {
      const target =
        state.redirectTo ?? returnTo ?? localizedHref("/role-landing", locale);
      router.replace(target as Parameters<typeof router.replace>[0]);
    }
  }, [locale, returnTo, router, state.redirectTo, state.status]);

  return (
    <section className={rootClass} id="token-fallback">
      <div className="card-kicker">
        <KeyRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>
      <form
        action={action}
        aria-busy={isPending}
        aria-describedby={showFeedback ? feedbackId : undefined}
        className="auth-form auth-form--stack"
      >
        <input
          name="returnTo"
          type="hidden"
          value={returnTo ?? localizedHref("/role-landing", locale)}
        />
        <label>
          <span>{labels.label}</span>
          <input
            autoComplete="off"
            name="token"
            placeholder={labels.placeholder}
            required
            type="password"
          />
        </label>
        <button className="secondary-button" disabled={isPending} type="submit">
          <LogIn size={16} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>
      {showFeedback ? <AuthMessage id={feedbackId} state={state} /> : null}
      {state.subject ? (
        <div className="auth-subject">
          <strong>
            {state.subject.displayName ?? state.subject.email ?? "SkillHub user"}
          </strong>
          <span>{state.subject.roles.join(" / ")}</span>
          <a
            className="ghost-button ghost-button--inline"
            href={state.redirectTo ?? returnTo ?? localizedHref("/role-landing", locale)}
          >
            {labels.workspace}
          </a>
        </div>
      ) : null}
    </section>
  );
}

function AuthMessage({ id, state }: { id: string; state: AuthActionState }) {
  return (
    <div
      aria-atomic="true"
      aria-live={state.status === "success" ? "polite" : "assertive"}
      className={
        state.status === "success"
          ? "action-message action-message--success"
          : "action-message action-message--error"
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
