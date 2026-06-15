import type { Metadata } from "next";
import type { Locale } from "@/lib/locale-routing";

export const siteUrl = "https://useskillhub.com";
export const siteName = "SkillHub";

export type LocalizedSeo = {
  title: string;
  description: string;
};

export type BuildMetadataInput = {
  locale: Locale;
  path: string;
  en: LocalizedSeo;
  zh: LocalizedSeo;
  noIndex?: boolean;
  type?: "article" | "website";
};

export function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function localizedUrl(path: string, locale: Locale) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const separator = normalized.includes("?") ? "&" : "?";
  return `${siteUrl}${normalized}${separator}lang=${locale}`;
}

export function buildLocalizedMetadata(input: BuildMetadataInput): Metadata {
  const copy = input.locale === "zh" ? input.zh : input.en;
  const canonical = localizedUrl(input.path, input.locale);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        en: localizedUrl(input.path, "en"),
        "zh-CN": localizedUrl(input.path, "zh"),
        "x-default": absoluteUrl(input.path),
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: input.type ?? "website",
      url: canonical,
      siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
    robots: input.noIndex
      ? {
          follow: false,
          index: false,
        }
      : undefined,
  };
}

export function buildNoIndexMetadata(title = "SkillHub"): Metadata {
  return {
    title: title.startsWith(siteName) ? { absolute: title } : title,
    robots: {
      follow: false,
      index: false,
    },
  };
}
