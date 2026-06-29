import type { Dictionary, Locale } from "@/lib/i18n";
import { SiteHeaderClient, type SiteHeaderActive, type SiteHeaderDictionary } from "./site-header-client";

type SiteHeaderProps = {
  active?: SiteHeaderActive;
  apiUrl?: string;
  dictionary: Dictionary;
  locale: Locale;
  pathname?: string;
  consoleHref?: string;
  consoleLabel?: string;
  showStageBanner?: boolean;
  subtitle?: string;
};

export function SiteHeader({
  active,
  consoleHref,
  consoleLabel,
  dictionary,
  locale,
  pathname,
  showStageBanner,
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
      showStageBanner={showStageBanner}
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
