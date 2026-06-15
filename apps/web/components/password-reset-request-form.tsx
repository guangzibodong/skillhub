"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MailCheck, Send, XCircle } from "lucide-react";
import { signUpAction, type SignupActionState } from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type Props = {
  locale: Locale;
};

const copy = {
  en: {
    code: "Verification code",
    codeHelp: "Enter the 6-digit code sent to your email.",
    email: "Work email",
    emailPlaceholder: "you@company.com",
    request: "Send reset code",
    requesting: "Sending",
    submit: "Verify and continue",
    submitting: "Verifying",
  },
  zh: {
    code: "验证码",
    codeHelp: "输入发送到邮箱的 6 位验证码。",
    email: "工作邮箱",
    emailPlaceholder: "you@company.com",
    request: "发送重置验证码",
    requesting: "发送中",
    submit: "验证并继续",
    submitting: "验证中",
  },
} as const;

const initialState: SignupActionState = {
  message: "",
  status: "idle",
};

export function PasswordResetRequestForm({ locale }: Props) {
  const labels = copy[locale];
  const router = useRouter();
  const [state, action, isPending] = useActionState(
    signUpAction.bind(null, locale),
    initialState,
  );
  const showChallenge = Boolean(state.challenge && !state.subject);
  const showFeedback = state.status !== "idle" && !state.subject;

  useEffect(() => {
    if (state.status === "success") {
      router.replace(
        (state.redirectTo ?? localizedHref("/account", locale)) as Parameters<
          typeof router.replace
        >[0],
      );
    }
  }, [locale, router, state.redirectTo, state.status]);

  return (
    <section className="auth-card auth-card--signup auth-card--embedded">
      <div className="card-kicker">
        <MailCheck size={16} aria-hidden="true" />
        <span>{locale === "zh" ? "邮箱重置" : "Email reset"}</span>
      </div>

      <form action={action} aria-busy={isPending} className="auth-form auth-form--stack">
        <input name="mode" type="hidden" value="login" />
        <input name="returnTo" type="hidden" value={localizedHref("/account", locale)} />
        {showChallenge ? (
          <>
            <input name="intent" type="hidden" value="verify" />
            <input name="challengeId" type="hidden" value={state.challenge?.challengeId ?? ""} />
            <label>
              <span>{labels.code}</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                name="code"
                pattern="[0-9]{6}"
                placeholder="123456"
                required
              />
            </label>
            <p>{labels.codeHelp}</p>
            <button className="primary-button" disabled={isPending} type="submit">
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{isPending ? labels.submitting : labels.submit}</span>
            </button>
          </>
        ) : (
          <>
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
            <button className="primary-button" disabled={isPending} type="submit">
              <Send size={16} aria-hidden="true" />
              <span>{isPending ? labels.requesting : labels.request}</span>
            </button>
          </>
        )}
      </form>

      {showFeedback ? (
        <div
          aria-live={state.status === "error" ? "assertive" : "polite"}
          className={
            state.status === "error"
              ? "action-message action-message--error"
              : "action-message action-message--success"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.status === "error" ? (
            <XCircle size={16} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={16} aria-hidden="true" />
          )}
          <span>{state.message}</span>
        </div>
      ) : null}
    </section>
  );
}
