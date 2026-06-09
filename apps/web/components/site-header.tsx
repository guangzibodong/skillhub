import type { Dictionary, Locale } from "@/lib/i18n";
import { SiteHeaderClient, type SiteHeaderDictionary } from "./site-header-client";

type SiteHeaderProps = {
  active:
    | "home"
    | "marketplace"
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
  subtitle?: string;
};

export function SiteHeader({
  active,
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
