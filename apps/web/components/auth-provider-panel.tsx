import { Github, LockKeyhole } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  apiUrl: string;
  locale: Locale;
  providers: AuthProviderStatus[];
  returnTo?: string;
  surface?: "card" | "embedded";
};

type ProviderId = "github" | "google" | "microsoft" | "slack" | "apple" | "discord";

const copy = {
  en: {
    disabledAction: "Not configured",
    helper: "OAuth redirects only appear active when the provider is configured.",
    oauthAction: "Continue with",
    title: "Use another sign-in method",
  },
  zh: {
    disabledAction: "暂未配置",
    helper: "只有已完成配置的第三方登录才会启用跳转。",
    oauthAction: "继续使用",
    title: "使用其他方式登录",
  },
} as const;

const visibleProviders: Array<{ id: ProviderId; label: string }> = [
  { id: "github", label: "GitHub" },
  { id: "google", label: "Google" },
  { id: "microsoft", label: "Microsoft" },
  { id: "slack", label: "Slack" },
  { id: "apple", label: "Apple" },
  { id: "discord", label: "Discord" },
];

export function AuthProviderPanel({
  apiUrl,
  locale,
  providers,
  returnTo,
  surface = "card",
}: AuthProviderPanelProps) {
  const labels = copy[locale];
  const Wrapper = surface === "embedded" ? "section" : "article";
  const className =
    surface === "embedded"
      ? "auth-provider-panel auth-provider-panel--oauth auth-provider-panel--embedded"
      : "ops-panel auth-provider-panel auth-provider-panel--oauth";

  return (
    <Wrapper className={className}>
      <div className="card-kicker auth-provider-panel__title">
        <span>{labels.title}</span>
      </div>
      <div className="oauth-provider-stack" aria-label={labels.title}>
        {visibleProviders.map((providerConfig) => {
          const provider = providers.find(
            (item) => item.provider === providerConfig.id,
          );
          const action = provider
            ? providerAction(provider, apiUrl, locale, labels, returnTo)
            : { href: null, label: `${providerConfig.label} ${labels.disabledAction}` };
          const providerName = providerConfig.label;
          const buttonClass = [
            "oauth-provider-button",
            `oauth-provider-button--${providerConfig.id}`,
            action.href ? "" : "oauth-provider-button--disabled",
          ]
            .filter(Boolean)
            .join(" ");

          if (action.href) {
            return (
              <a
                aria-label={`${labels.oauthAction} ${providerName}`}
                className={buttonClass}
                href={action.href}
                key={providerConfig.id}
              >
                <BrandProviderIcon provider={providerConfig.id} />
                <span className="oauth-provider-button__label">
                  {providerName}
                </span>
              </a>
            );
          }

          return (
            <button
              aria-label={action.label}
              className={buttonClass}
              disabled
              key={providerConfig.id}
              title={labels.disabledAction}
              type="button"
            >
              <BrandProviderIcon provider={providerConfig.id} />
              <span className="oauth-provider-button__label">{providerName}</span>
              <LockKeyhole
                className="oauth-provider-button__lock"
                size={13}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <p className="oauth-provider-note">{labels.helper}</p>
    </Wrapper>
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
      label: `${labels.oauthAction} ${providerLabel(provider)}`,
    };
  }

  return {
    href: null,
    label: `${providerLabel(provider)} ${labels.disabledAction}`,
  };
}

function BrandProviderIcon({ provider }: { provider: ProviderId }) {
  if (provider === "github") {
    return (
      <span className="oauth-provider-button__icon brand-provider-icon brand-provider-icon--github">
        <Github size={19} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`oauth-provider-button__icon brand-provider-icon brand-provider-icon--${provider}`}
      aria-hidden="true"
    >
      {provider === "google" ? <span className="brand-google-mark" /> : null}
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
      {provider === "apple" ? <span className="brand-apple-mark" /> : null}
      {provider === "discord" ? (
        <span className="brand-discord-mark">
          <span />
          <span />
        </span>
      ) : null}
    </span>
  );
}

function providerLabel(provider: AuthProviderStatus) {
  if (provider.provider === "google") {
    return "Google";
  }

  if (provider.provider === "github") {
    return "GitHub";
  }

  return provider.label;
}
