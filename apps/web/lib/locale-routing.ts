export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

type SearchParams = Record<string, string | string[] | undefined> | undefined;

export function resolveLocale(value: unknown): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate !== "string") {
    return "en";
  }

  const normalized = candidate.toLowerCase();
  return normalized === "zh" || normalized === "zh-cn" || normalized === "cn" ? "zh" : "en";
}

export function getLocaleFromSearchParams(searchParams: SearchParams): Locale {
  return resolveLocale(searchParams?.lang);
}

export function localizedHref(path: string, locale: Locale) {
  if (
    path.startsWith("mailto:") ||
    path.startsWith("tel:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("#")
  ) {
    return path;
  }

  const [base, hash] = path.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}lang=${locale}${hash ? `#${hash}` : ""}`;
}

export function hrefWithReturnTo(path: string, returnTo: string, locale: Locale) {
  const returnHref = returnTo.startsWith("/") ? localizedHref(returnTo, locale) : returnTo;
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}returnTo=${encodeURIComponent(returnHref)}`;
}

export function localizedHrefWithReturnTo(path: string, locale: Locale, returnTo: string) {
  return localizedHref(hrefWithReturnTo(path, returnTo, locale), locale);
}
