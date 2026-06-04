import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  pathname: string;
  label: string;
};

export function LanguageSwitcher({ label, locale, pathname }: LanguageSwitcherProps) {
  return (
    <div className="language-switcher" aria-label={label}>
      <a
        className={locale === "en" ? "language-switcher__item language-switcher__item--active" : "language-switcher__item"}
        href={localizedHref(pathname, "en")}
      >
        EN
      </a>
      <a
        className={locale === "zh" ? "language-switcher__item language-switcher__item--active" : "language-switcher__item"}
        href={localizedHref(pathname, "zh")}
      >
        中文
      </a>
    </div>
  );
}
