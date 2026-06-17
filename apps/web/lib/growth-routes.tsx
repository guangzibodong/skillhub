import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthDetailPage, GrowthHubPage } from "@/components/growth-page";
import {
  getGrowthContentItem,
  getGrowthHubItems,
  growthHubs,
  type GrowthHubKey,
} from "@/lib/growth-content";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { buildLocalizedMetadata, buildNoIndexMetadata } from "@/lib/seo";

type SearchParams = Record<string, string | string[] | undefined>;

type HubRouteProps = {
  searchParams: Promise<SearchParams>;
};

type DetailRouteProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

export function createGrowthHubMetadata(hubKey: GrowthHubKey) {
  return async function generateMetadata({ searchParams }: HubRouteProps): Promise<Metadata> {
    const locale = getLocaleFromSearchParams(await searchParams);
    const hub = growthHubs[hubKey];

    return buildLocalizedMetadata({
      locale,
      path: hub.path,
      en: hub.seo.en,
      zh: hub.seo.zh,
      type: hubKey === "blog" ? "article" : "website",
    });
  };
}

export function createGrowthDetailMetadata(hubKey: GrowthHubKey) {
  return async function generateMetadata({
    params,
    searchParams,
  }: DetailRouteProps): Promise<Metadata> {
    const [{ slug }, search] = await Promise.all([params, searchParams]);
    const locale = getLocaleFromSearchParams(search);
    const item = getGrowthContentItem(hubKey, slug);

    if (!item) {
      return buildNoIndexMetadata("SkillHub");
    }

    return buildLocalizedMetadata({
      locale,
      path: item.path,
      en: item.seo.en,
      zh: item.seo.zh,
      type: "article",
    });
  };
}

export function createGrowthStaticParams(hubKey: GrowthHubKey) {
  return function generateStaticParams() {
    return getGrowthHubItems(hubKey).map((item) => ({ slug: item.slug }));
  };
}

export function GrowthHubRoute(hubKey: GrowthHubKey) {
  return async function GrowthRoutePage({ searchParams }: HubRouteProps) {
    const locale = getLocaleFromSearchParams(await searchParams);
    const hub = growthHubs[hubKey];
    const items = getGrowthHubItems(hubKey);

    return <GrowthHubPage hub={hub} hubKey={hubKey} items={items} locale={locale} />;
  };
}

export function GrowthDetailRoute(hubKey: GrowthHubKey) {
  return async function GrowthDetailRoutePage({ params, searchParams }: DetailRouteProps) {
    const [{ slug }, search] = await Promise.all([params, searchParams]);
    const locale = getLocaleFromSearchParams(search);
    const item = getGrowthContentItem(hubKey, slug);

    if (!item) {
      notFound();
    }

    const relatedItems = getGrowthHubItems(hubKey)
      .filter((related) => related.slug !== slug)
      .slice(0, 3);

    return <GrowthDetailPage item={item} locale={locale} relatedItems={relatedItems} />;
  };
}
