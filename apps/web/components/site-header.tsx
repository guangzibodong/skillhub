import type { Dictionary, Locale } from "@/lib/i18n";
import { SiteHeaderClient, type SiteHeaderDictionary } from "./site-header-client";

type SiteHeaderProps = {
  active:
    | "home"
    | "marketplace"
    | "solutions"
    | "registry"
    | "publishers"
    | "agents"
    | "docs"
    | "dashboard"
    | "developer"
    | "publisher"
    | "admin"
    | "publish"
    | "account";
  apiUrl?: string;
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
  consoleHref?: string;
  consoleLabel?: string;
  subtitle?: string;
};

export function SiteHeader({
  active,
  consoleHref,
  consoleLabel,
  dictionary,
  locale,
  pathname,
  subtitle,
}: SiteHeaderProps) {
  return (
    <SiteHeaderClient
      active={active}
      dictionary={toSiteHeaderDictionary(dictionary)}
      locale={locale}
      pathname={pathname}
      consoleHref={consoleHref}
      consoleLabel={consoleLabel}
      subtitle={subtitle}
    />
  );
}

function toSiteHeaderDictionary(dictionary: Dictionary): SiteHeaderDictionary {
  return {
    common: {
      language: dictionary.common.language,
      publish: dictionary.common.publish,
    },
    nav: dictionary.nav,
  };
}
