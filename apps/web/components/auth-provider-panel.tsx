import { Chrome, Github, KeyRound, Mail, ShieldCheck } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  apiUrl: string;
  locale: Locale;
  providers: AuthProviderStatus[];
};

const copy = {
  en: {
    active: "Active",
    callback: "Callback",
    callbackMissing: "Set callback base URL",
    configuration_required: "Configuration required",
    connected: "Connected",
    deferred: "Provider callback pending",
    emailAction: "Use email code",
    helper:
      "SkillHub supports the account paths real teams expect: email code access, Google login, GitHub login, and token fallback for operators or invitations.",
    missing: "Missing",
    oauthAction: "Continue",
    providerAction: "Configure provider",
    title: "Sign-in methods",
    tokenAction: "Use token fallback"
  },
  zh: {
    active: "可用",
    callback: "回调地址",
    callbackMissing: "先配置回调域名",
    configuration_required: "待配置",
    connected: "已连接",
    deferred: "等待回调接入",
    emailAction: "使用邮箱验证码",
    helper: "SkillHub 支持真实团队需要的账号入口：邮箱验证码、Google 登录、GitHub 登录，以及运营和邀请场景的 token 兜底。",
    missing: "缺少",
    oauthAction: "继续登录",
    providerAction: "配置 provider",
    title: "登录方式",
    tokenAction: "使用 token 兜底"
  }
} as const;

const providerOrder = ["google", "github", "email", "token"] as const;

export function AuthProviderPanel({ apiUrl, locale, providers }: AuthProviderPanelProps) {
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
          const Icon = providerIcon(provider.provider);
          const action = providerAction(provider, apiUrl, locale, labels);

          return (
            <div className={`auth-provider-card auth-provider-card--${provider.provider}`} key={provider.provider}>
              <div className="auth-provider-card__head">
                <span className="auth-provider-card__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={statusClass(provider.status)}>{labels[provider.status]}</span>
              </div>
              <strong>{providerLabel(provider, locale)}</strong>
              <p>{localizedDescription(provider, locale)}</p>
              <ProviderSetupMeta labels={labels} provider={provider} />
              {action.href ? (
                <a className="secondary-button secondary-button--compact" href={action.href}>
                  {action.label}
                </a>
              ) : (
                <button className="secondary-button secondary-button--compact" disabled type="button">
                  {action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

function ProviderSetupMeta({
  labels,
  provider
}: {
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  provider: AuthProviderStatus;
}) {
  if (provider.type !== "oauth") {
    return null;
  }

  const missing = provider.missingConfiguration ?? [];

  return (
    <div className="auth-provider-card__setup">
      <span>{provider.callbackUrl ? labels.callback : labels.callbackMissing}</span>
      {provider.callbackUrl ? <code>{provider.callbackUrl}</code> : null}
      {missing.length ? (
        <div className="auth-provider-card__missing" aria-label={labels.missing}>
          {missing.map((item) => (
            <code key={item}>{item}</code>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function providerAction(
  provider: AuthProviderStatus,
  apiUrl: string,
  locale: Locale,
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (provider.provider === "email") {
    return {
      href: "#email-registration",
      label: labels.emailAction
    };
  }

  if (provider.provider === "token") {
    return {
      href: "#token-fallback",
      label: labels.tokenAction
    };
  }

  if (provider.startUrl && provider.status === "active") {
    const url = new URL(provider.startUrl, apiUrl);
    url.searchParams.set("returnTo", locale === "zh" ? "/account?lang=zh" : "/account?lang=en");

    return {
      href: url.toString(),
      label: labels.oauthAction
    };
  }

  return {
    href: null,
    label: labels.providerAction
  };
}

function providerIcon(provider: AuthProviderStatus["provider"]) {
  if (provider === "github") {
    return Github;
  }

  if (provider === "google") {
    return Chrome;
  }

  if (provider === "email") {
    return Mail;
  }

  return KeyRound;
}

function statusClass(status: AuthProviderStatus["status"]) {
  if (status === "configuration_required") {
    return "status-chip status-chip--warning";
  }

  if (status === "connected" || status === "active") {
    return "status-chip";
  }

  return "status-chip status-chip--neutral";
}

function localizedDescription(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.description;
  }

  if (provider.provider === "email") {
    return "邮箱验证码可用于创建工作区或登录已有工作区；邮件服务接入前会先记录发送事件。";
  }

  if (provider.provider === "google") {
    return provider.status === "active"
      ? "Google OAuth 已配置，可以跳转到 Google 完成登录并回到 SkillHub。"
      : "配置 Google client id、secret、OAuth state secret 和 API 回调地址后即可启用。";
  }

  if (provider.provider === "github") {
    return provider.status === "active"
      ? "GitHub OAuth 已配置，适合开发者团队登录并进入工作区。"
      : "配置 GitHub client id、secret、OAuth state secret 和 API 回调地址后即可启用。";
  }

  return "团队邀请和运营兜底继续使用一次性用户 token，并写入 httpOnly cookie。";
}

function providerLabel(provider: AuthProviderStatus, locale: Locale) {
  if (locale !== "zh") {
    return provider.provider === "email" ? "Email code" : provider.label;
  }

  if (provider.provider === "email") {
    return "邮箱验证码";
  }

  if (provider.provider === "token") {
    return "用户 token";
  }

  return provider.label;
}
