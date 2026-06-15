import { Github } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  apiUrl: string;
  locale: Locale;
  providers: AuthProviderStatus[];
  returnTo?: string;
  surface?: "card" | "embedded";
};

type ProviderId = "github" | "google";

const copy = {
  en: {
    helper: "Use a configured OAuth provider, or continue with email and password below.",
    oauthAction: "Continue with",
    title: "Use another sign-in method",
  },
  zh: {
    helper: "使用已配置的第三方登录，或继续使用下方邮箱和密码。",
    oauthAction: "继续使用",
    title: "使用其他方式登录",
  },
} as const;

const visibleProviders: Array<{ id: ProviderId; label: string }> = [
  { id: "github", label: "GitHub" },
  { id: "google", label: "Google" },
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
  const providerItems = visibleProviders.flatMap((providerConfig) => {
    const provider = providers.find(
      (item) => item.provider === providerConfig.id,
    );
    const action = provider
      ? providerAction(provider, apiUrl, locale, labels, returnTo)
      : null;

    return action?.href ? [{ action, providerConfig }] : [];
  });

  if (providerItems.length === 0) {
    return null;
  }

  return (
    <Wrapper className={className}>
      <div className="card-kicker auth-provider-panel__title">
        <span>{labels.title}</span>
      </div>
      <div className="oauth-provider-stack" aria-label={labels.title}>
        {providerItems.map(({ action, providerConfig }) => {
          const providerName = providerConfig.label;
          const buttonClass = `oauth-provider-button oauth-provider-button--${providerConfig.id}`;

          const content = (
            <>
              <BrandProviderIcon provider={providerConfig.id} />
              <span className="oauth-provider-button__label">
                {providerName}
              </span>
            </>
          );

          return (
            <a
              aria-label={`${labels.oauthAction} ${providerName}`}
              className={buttonClass}
              href={action.href}
              key={providerConfig.id}
            >
              {content}
            </a>
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
    label: providerLabel(provider),
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
