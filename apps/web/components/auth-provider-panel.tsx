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

type ProviderId = "github" | "google";

const copy = {
  en: {
    disabledAction: "Not configured",
    empty: "Google and GitHub stay locked until their provider credentials and callback URLs are active. Use email or username/password below.",
    helper: "OAuth redirects only appear active when the provider is configured.",
    oauthAction: "Continue with",
    title: "Use another sign-in method",
  },
  zh: {
    disabledAction: "暂未配置",
    empty: "Google 和 GitHub 在凭证与回调地址配置完成前会保持锁定。现在可以使用下方邮箱或用户名密码登录。",
    helper: "第三方登录只有在完成配置后才会变成真实跳转。",
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
  const providerItems = visibleProviders.map((providerConfig) => {
    const provider = providers.find(
      (item) => item.provider === providerConfig.id,
    );
    const action = provider
      ? providerAction(provider, apiUrl, locale, labels, returnTo)
      : { href: null, label: `${providerConfig.label} ${labels.disabledAction}` };

    return { action, providerConfig };
  });
  return (
    <Wrapper className={className}>
      <div className="card-kicker auth-provider-panel__title">
        <span>{labels.title}</span>
      </div>
      <div className="oauth-provider-stack" aria-label={labels.title}>
        {providerItems.map(({ action, providerConfig }) => {
          const providerName = providerConfig.label;
          const buttonClass = [
            "oauth-provider-button",
            `oauth-provider-button--${providerConfig.id}`,
            action.href ? "" : "oauth-provider-button--disabled",
          ]
            .filter(Boolean)
            .join(" ");

          const content = (
            <>
              <BrandProviderIcon provider={providerConfig.id} />
              <span className="oauth-provider-button__label">
                {providerName}
              </span>
              {!action.href ? (
                <span className="oauth-provider-button__lock">
                  <LockKeyhole size={14} aria-hidden="true" />
                  <span>{labels.disabledAction}</span>
                </span>
              ) : null}
            </>
          );

          return action.href ? (
            <a
              aria-label={`${labels.oauthAction} ${providerName}`}
              className={buttonClass}
              href={action.href}
              key={providerConfig.id}
            >
              {content}
            </a>
          ) : (
            <button
              aria-label={`${providerName} ${labels.disabledAction}`}
              className={buttonClass}
              disabled
              key={providerConfig.id}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </div>
      <p className="oauth-provider-note">{labels.helper}</p>
      {providerItems.every((item) => !item.action.href) ? (
        <p className="oauth-provider-note oauth-provider-note--muted">
          {labels.empty}
        </p>
      ) : null}
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
