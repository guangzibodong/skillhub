import { Github, ShieldCheck } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  apiUrl: string;
  locale: Locale;
  providers: AuthProviderStatus[];
  returnTo?: string;
};

const copy = {
  en: {
    disabledAction: "coming soon",
    helper: "Sign in securely with OAuth, no password required.",
    oauthAction: "Continue with",
    title: "Use another sign-in method",
  },
  zh: {
    disabledAction: "待接入",
    helper: "通过 OAuth 安全登录，无需记住密码",
    oauthAction: "继续使用",
    title: "使用其他方式登录",
  },
} as const;

const providerOrder = ["github", "google"] as const;
const plannedProviders = [
  { id: "microsoft", label: "Microsoft" },
  { id: "slack", label: "Slack" },
] as const;

export function AuthProviderPanel({
  apiUrl,
  locale,
  providers,
  returnTo,
}: AuthProviderPanelProps) {
  const labels = copy[locale];
  const providersById = new Map(
    providers.map((provider) => [provider.provider, provider]),
  );
  const orderedProviders = providerOrder.flatMap((provider) => {
    const item = providersById.get(provider);
    return item ? [item] : [];
  });
  const enabledProviders = orderedProviders.flatMap((provider) => {
    const action = providerAction(
      provider,
      apiUrl,
      locale,
      labels,
      returnTo,
    );

    return action.href ? [{ action, provider }] : [];
  });
  const plannedProviderNames = plannedProviders
    .map((provider) => provider.label)
    .join(locale === "zh" ? "、" : ", ");

  return (
    <article className="ops-panel auth-provider-panel auth-provider-panel--oauth">
      <div className="card-kicker">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <div className="oauth-provider-stack">
        {enabledProviders.length > 0 ? (
          enabledProviders.map(({ action, provider }) => {
          const providerName = providerLabel(provider, locale);

          return (
            <a
              aria-label={`${labels.oauthAction} ${providerName}`}
              className={`oauth-provider-button oauth-provider-button--${provider.provider}`}
              href={action.href}
              key={provider.provider}
            >
              <BrandProviderIcon provider={provider.provider} />
              <span className="oauth-provider-button__label">
                {providerName}
              </span>
            </a>
          );
          })
        ) : (
          <p className="oauth-provider-empty">
            {locale === "zh"
              ? "OAuth 暂未配置，请使用下方邮箱密码登录。"
              : "OAuth providers are not configured yet. Use email and password below."}
          </p>
        )}
      </div>
      <p className="oauth-provider-note">{labels.helper}</p>
      <p className="oauth-provider-planned">
        {locale === "zh" ? `即将支持：${plannedProviderNames}` : `Coming later: ${plannedProviderNames}`}
      </p>
    </article>
  );
}

function providerAction(
  provider: AuthProviderStatus,
  apiUrl: string,
  locale: Locale,
  labels: (typeof copy)["en"] | (typeof copy)["zh"],
  returnTo?: string,
) {
  if (
    provider.startUrl &&
    (provider.status === "active" || provider.status === "connected")
  ) {
    const url = new URL(provider.startUrl, apiUrl);
    const fallbackReturnTo =
      locale === "zh" ? "/role-landing?lang=zh" : "/role-landing?lang=en";
    url.searchParams.set("returnTo", returnTo ?? fallbackReturnTo);

    return {
      href: url.toString(),
      label: `${labels.oauthAction} ${providerLabel(provider, locale)}`,
    };
  }

  return {
    href: null,
    label: `${providerLabel(provider, locale)} ${labels.disabledAction}`,
  };
}

function BrandProviderIcon({
  provider,
}: {
  provider: AuthProviderStatus["provider"] | "microsoft" | "slack";
}) {
  if (provider === "github") {
    return (
      <span className="oauth-provider-button__icon brand-provider-icon brand-provider-icon--github">
        <Github size={19} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={`oauth-provider-button__icon brand-provider-icon brand-provider-icon--${provider}`} aria-hidden="true">
      {provider === "google" ? (
        <span className="brand-google-mark" />
      ) : null}
      {provider === "microsoft" ? (
        <span className="brand-microsoft-mark">
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : null}
      {provider === "slack" ? (
        <span className="brand-slack-mark">
          <span />
          <span />
          <span />
          <span />
        </span>
      ) : null}
    </span>
  );
}

function providerLabel(provider: AuthProviderStatus, locale: Locale) {
  if (provider.provider === "google") {
    return "Google";
  }

  if (provider.provider === "github") {
    return "GitHub";
  }

  return locale === "zh" ? "第三方登录" : provider.label;
}
