import { Gauge, UploadCloud } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

type SiteHeaderProps = {
  active: "home" | "registry" | "agents" | "docs" | "publish";
  apiUrl?: string;
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
  subtitle?: string;
};

export function SiteHeader({ active, apiUrl = "https://api.useskillhub.com", dictionary, locale, pathname, subtitle }: SiteHeaderProps) {
  const navItems = [
    { id: "home", label: dictionary.nav.home, href: "/" },
    { id: "registry", label: dictionary.nav.registry, href: "/registry" },
    { id: "agents", label: dictionary.nav.agents, href: "/agents" },
    { id: "docs", label: dictionary.nav.docs, href: "/docs" }
  ] as const;

  return (
    <header className="site-header">
      <a className="brand brand--link" href={localizedHref("/", locale)} aria-label="SkillHub home">
        <div className="brand__mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>SkillHub</strong>
          <small>{subtitle ?? "useskillhub.com"}</small>
        </div>
      </a>

      <nav className="site-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className={active === item.id ? "site-nav__link site-nav__link--active" : "site-nav__link"}
            href={localizedHref(item.href, locale)}
            key={item.id}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-actions">
        <LanguageSwitcher label={dictionary.common.language} locale={locale} pathname={pathname} />
        <a className="ghost-button" href={`${apiUrl}/health`}>
          <Gauge size={17} aria-hidden="true" />
          <span>{dictionary.common.apiHealth}</span>
        </a>
        <a className="primary-button" href={localizedHref("/publish", locale)}>
          <UploadCloud size={17} aria-hidden="true" />
          <span>{dictionary.common.publish}</span>
        </a>
      </div>
    </header>
  );
}
