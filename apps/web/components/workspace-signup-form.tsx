"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, KeyRound, UserPlus, XCircle } from "lucide-react";
import { signUpAction, type SignupActionState } from "@/lib/auth-actions";
import { localizedHref, type Locale } from "@/lib/i18n";

type WorkspaceSignupFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    developer: "Developer workspace",
    developerHelp: "Build projects, install skills, and create API keys for agents.",
    displayName: "Your name",
    displayNamePlaceholder: "Asha Chen",
    email: "Work email",
    emailPlaceholder: "you@company.com",
    helper:
      "Create an organization-scoped user session for your first workspace. The first member can operate the workspace and invite teammates later.",
    organizationName: "Organization name",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "Workspace slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "Owner workspace",
    ownerHelp: "Start with full access across developer, publisher, billing, payout, and team setup.",
    publisher: "Publisher workspace",
    publisherHelp: "Publish skills, submit reviews, price listings, and prepare payouts.",
    role: "Primary workspace path",
    submit: "Create workspace",
    submitting: "Creating",
    title: "Email registration",
    token: "One-time user token",
    tokenHelp: "This token is already stored in this browser session. Save it if you need to connect another device.",
    workspace: "Open dashboard"
  },
  zh: {
    developer: "开发者工作区",
    developerHelp: "创建项目、安装技能，并为智能体生成 API Key。",
    displayName: "你的姓名",
    displayNamePlaceholder: "陈明",
    email: "工作邮箱",
    emailPlaceholder: "you@company.com",
    helper: "创建一个组织级用户会话，作为你的第一个 SkillHub 工作区。首个成员之后可以继续邀请团队。",
    organizationName: "组织名称",
    organizationNamePlaceholder: "Acme Agent Lab",
    organizationSlug: "工作区 slug",
    organizationSlugPlaceholder: "acme-agent-lab",
    owner: "所有者工作区",
    ownerHelp: "先获得完整工作区权限，可配置开发者、发布者、账单、提现和团队。",
    publisher: "发布者工作区",
    publisherHelp: "发布技能、提交审核、设置价格，并准备提现资料。",
    role: "主要使用路径",
    submit: "创建工作区",
    submitting: "创建中",
    title: "邮箱注册",
    token: "一次性用户 token",
    tokenHelp: "这个 token 已经写入当前浏览器会话。需要在其他设备连接时，请现在保存。",
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
  const [state, action, isPending] = useActionState(signUpAction.bind(null, locale), initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <article className="ops-panel auth-card auth-card--signup" id="email-registration">
      <div className="card-kicker">
        <UserPlus size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>
      <form action={action} className="auth-form auth-form--stack">
        <div className="auth-form-grid">
          <label>
            <span>{labels.email}</span>
            <input autoComplete="email" name="email" placeholder={labels.emailPlaceholder} required type="email" />
          </label>
          <label>
            <span>{labels.displayName}</span>
            <input autoComplete="name" name="displayName" placeholder={labels.displayNamePlaceholder} />
          </label>
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
        </div>
        <div className="auth-role-hints">
          <span>
            <Building2 size={14} aria-hidden="true" />
            {labels.ownerHelp}
          </span>
          <span>{labels.developerHelp}</span>
          <span>{labels.publisherHelp}</span>
        </div>
        <button className="primary-button" disabled={isPending} type="submit">
          <UserPlus size={16} aria-hidden="true" />
          <span>{isPending ? labels.submitting : labels.submit}</span>
        </button>
      </form>
      {state.status !== "idle" ? <SignupMessage state={state} /> : null}
      {state.accessToken ? (
        <div className="auth-subject auth-token-result">
          <strong>
            {state.organization?.name ?? labels.organizationName}
            {state.organization?.slug ? ` / ${state.organization.slug}` : ""}
          </strong>
          <span>{labels.tokenHelp}</span>
          <label>
            <span>{labels.token}</span>
            <input onFocus={(event) => event.currentTarget.select()} readOnly value={state.accessToken.token} />
          </label>
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
