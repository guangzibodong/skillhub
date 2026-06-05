import { Chrome, Github, KeyRound, Mail, ShieldCheck } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  locale: Locale;
  providers: AuthProviderStatus[];
};

const copy = {
  en: {
    active: "Active",
    configuration_required: "Configuration required",
    connected: "Connected",
    deferred: "Provider callback pending",
    emailAction: "Create with email",
    helper:
      "SkillHub will support the three account paths real teams expect: email signup, Google OAuth, and GitHub OAuth. Email workspace creation is live now; OAuth is ready for final provider credentials and callback wiring.",
    providerAction: "Coming soon",
    title: "Sign-in methods",
    tokenAction: "Use token fallback"
  },
  zh: {
    active: "可用",
    configuration_required: "待配置",
    connected: "已连接",
    deferred: "等待回调接入",
    emailAction: "用邮箱注册",
    helper:
      "SkillHub 需要支持真实团队常用的三种账号入口：邮箱注册、Google 登录、GitHub 登录。现在邮箱工作区创建已经可用，OAuth 已经预留到最终 provider 凭证和回调接入阶段。",
    providerAction: "即将接入",
    title: "登录方式",
    tokenAction: "使用 token 兜底"
  }
} as const;

const providerOrder = ["google", "github", "email", "token"] as const;

export function AuthProviderPanel({ locale, providers }: AuthProviderPanelProps) {
  const labels = copy[locale];
  const providersById = new Map(providers.map((provider) => [provider.provider, provider]));
  const orderedProviders = providerOrder.flatMap((provider) => {
    const item = providersById.get(provider);
    return item ? [item] : [];
  });

  return (
    <article className="ops-panel auth-provider-panel">
      <div className="card-kicker">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <p>{labels.helper}</p>
      <div className="auth-provider-grid">
        {orderedProviders.map((provider) => {
          const Icon = provider.provider === "github" ? Github : provider.provider === "google" ? Chrome : provider.provider === "email" ? Mail : KeyRound;
          const statusLabel = labels[provider.status];
          const actionHref = provider.provider === "email" ? "#email-registration" : provider.provider === "token" ? "#token-fallback" : null;
          const actionLabel =
            provider.provider === "email" ? labels.emailAction : provider.provider === "token" ? labels.tokenAction : labels.providerAction;

          return (
            <div className={`auth-provider-card auth-provider-card--${provider.provider}`} key={provider.provider}>
              <div className="auth-provider-card__head">
                <span className="auth-provider-card__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={`status-chip status-chip--${provider.status === "configuration_required" ? "warning" : provider.status === "connected" ? "success" : "neutral"}`}>
                  {statusLabel}
                </span>
              </div>
              <strong>{providerLabel(provider, locale)}</strong>
              <p>{localizedDescription(provider, locale)}</p>
              {actionHref ? (
                <a className="secondary-button secondary-button--compact" href={actionHref}>
                  {actionLabel}
                </a>
              ) : (
                <button className="secondary-button secondary-button--compact" disabled type="button">
                  {actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function localizedDescription(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.description;
  }

  if (provider.provider === "email") {
    return "邮箱自助注册已经接入，可创建组织、成员身份和浏览器会话。";
  }

  if (provider.provider === "google") {
    return "Google OAuth 入口已经建模，等待配置 client、secret 和回调后启用。";
  }

  if (provider.provider === "github") {
    return "GitHub OAuth 入口已经建模，适合开发者团队登录和后续身份绑定。";
  }

  return "团队邀请和运营兜底继续使用一次性用户 token，会存入 httpOnly cookie。";
}

function providerLabel(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.label;
  }

  if (provider.provider === "email") {
    return "邮箱注册";
  }

  if (provider.provider === "token") {
    return "用户 token";
  }

  return provider.label;
}
