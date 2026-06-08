import { Chrome, Github, LockKeyhole, ShieldCheck } from "lucide-react";
import type { AuthProviderStatus } from "@/lib/account-data";
import type { Locale } from "@/lib/i18n";

type AuthProviderPanelProps = {
  apiUrl: string;
  locale: Locale;
  providers: AuthProviderStatus[];
};

const copy = {
  en: {
    disabledAction: "setup required",
    helper: "Fastest for teams already using Google or GitHub. If a provider is unavailable, use email below.",
    oauthAction: "Continue with",
    title: "Continue with Google or GitHub"
  },
  zh: {
    disabledAction: "待配置",
    helper: "团队已使用 Google 或 GitHub 时，这是最快入口。若暂不可用，可先使用下方邮箱登录。",
    oauthAction: "继续使用",
    title: "使用 Google 或 GitHub 继续"
  }
} as const;

const providerOrder = ["google", "github"] as const;

export function AuthProviderPanel({ apiUrl, locale, providers }: AuthProviderPanelProps) {
  const labels = copy[locale];
  const providersById = new Map(providers.map((provider) => [provider.provider, provider]));
  const orderedProviders = providerOrder.flatMap((provider) => {
    const item = providersById.get(provider);
    return item ? [item] : [];
  });

  return (
    <article className="ops-panel auth-provider-panel auth-provider-panel--oauth">
      <div className="card-kicker">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <div className="oauth-provider-stack">
        {orderedProviders.map((provider) => {
          const Icon = providerIcon(provider.provider);
          const action = providerAction(provider, apiUrl, locale, labels);

          return action.href ? (
            <a className={`oauth-provider-button oauth-provider-button--${provider.provider}`} href={action.href} key={provider.provider}>
              <span className="oauth-provider-button__icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>{action.label}</span>
            </a>
          ) : (
            <button
              className={`oauth-provider-button oauth-provider-button--${provider.provider} oauth-provider-button--disabled`}
              disabled
              key={provider.provider}
              type="button"
            >
              <span className="oauth-provider-button__icon">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>{action.label}</span>
              <LockKeyhole size={15} aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <p className="oauth-provider-note">{labels.helper}</p>
    </article>
  );
}

function providerAction(
  provider: AuthProviderStatus,
  apiUrl: string,
  locale: Locale,
  labels: (typeof copy)["en"] | (typeof copy)["zh"]
) {
  if (provider.startUrl && (provider.status === "active" || provider.status === "connected")) {
    const url = new URL(provider.startUrl, apiUrl);
    url.searchParams.set("returnTo", locale === "zh" ? "/account?lang=zh" : "/account?lang=en");

    return {
      href: url.toString(),
      label: `${labels.oauthAction} ${providerLabel(provider, locale)}`
    };
  }

  return {
    href: null,
    label: `${providerLabel(provider, locale)} ${labels.disabledAction}`
  };
}

function providerIcon(provider: AuthProviderStatus["provider"]) {
  return provider === "github" ? Github : Chrome;
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
