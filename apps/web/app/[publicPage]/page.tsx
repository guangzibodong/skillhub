import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicInfoPage } from "@/components/public-info-page";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import {
  getPublicPage,
  publicPages,
  type PublicPageKey,
} from "@/lib/public-pages";
import { buildLocalizedMetadata, buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ publicPage: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const key = resolvePublicPageKey((await params).publicPage);

  if (!key) {
    return buildNoIndexMetadata("SkillHub");
  }

  const locale = getLocaleFromSearchParams(await searchParams);
  const page = getPublicPage(key, locale);

  return buildLocalizedMetadata({
    locale,
    path: page.path,
    en: page.seo.en,
    zh: page.seo.zh,
    type: page.schema === "Article" ? "article" : "website",
  });
}

export default async function PublicPage({ params, searchParams }: PageProps) {
  const key = resolvePublicPageKey((await params).publicPage);

  if (!key) {
    notFound();
  }

  const locale = getLocaleFromSearchParams(await searchParams);
  const page = getPublicPage(key, locale);

  return <PublicInfoPage locale={locale} page={page} />;
}

function resolvePublicPageKey(segment: string): PublicPageKey | null {
  return segment in publicPages ? (segment as PublicPageKey) : null;
}

