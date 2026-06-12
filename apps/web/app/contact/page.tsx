import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public-info-page";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { getPublicPage } from "@/lib/public-pages";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const page = getPublicPage("contact", locale);
  return buildLocalizedMetadata({ locale, path: page.path, en: page.seo.en, zh: page.seo.zh, type: "website" });
}

export default async function ContactPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const page = getPublicPage("contact", locale);
  return <PublicInfoPage locale={locale} page={page} />;
}
