import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/locale-routing";

type LanguageSwitcherProps = {
  locale: Locale;
  pathname: string;
  label: string;
};

export function LanguageSwitcher({ label, locale, pathname }: LanguageSwitcherProps) {
  const searchParams = useSearchParams();

  return (
    <div className="language-switcher" aria-label={label}>
      <a
        aria-current={locale === "en" ? "true" : undefined}
        aria-label="Switch language to English"
        className={locale === "en" ? "language-switcher__item language-switcher__item--active" : "language-switcher__item"}
        href={localizedHrefWithCurrentSearch(pathname, "en", searchParams)}
      >
        EN
      </a>
      <a
        aria-current={locale === "zh" ? "true" : undefined}
        aria-label="切换语言为中文"
        className={locale === "zh" ? "language-switcher__item language-switcher__item--active" : "language-switcher__item"}
        href={localizedHrefWithCurrentSearch(pathname, "zh", searchParams)}
      >
        中文
      </a>
    </div>
  );
}

function localizedHrefWithCurrentSearch(pathname: string, locale: Locale, searchParams: Pick<URLSearchParams, "forEach">) {
  const [base, hash] = pathname.split("#");
  const nextParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key !== "lang") {
      nextParams.append(key, value);
    }
  });

  nextParams.set("lang", locale);
  const query = nextParams.toString();

  return `${base}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}
