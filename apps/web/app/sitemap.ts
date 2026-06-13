import type { MetadataRoute } from "next";
import { indexablePublicPaths } from "@/lib/public-pages";
import { localizedUrl, siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = Array.from(new Set(indexablePublicPaths));

  return paths.flatMap((path) =>
    (["en", "zh"] as const).map((locale) => ({
      url: localizedUrl(path, locale),
      lastModified: new Date(),
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: getPriority(path),
      alternates: {
        languages: {
          en: localizedUrl(path, "en"),
          "zh-CN": localizedUrl(path, "zh"),
          "x-default": `${siteUrl}${path}`,
        },
      },
    })),
  );
}

function getPriority(path: string): number {
  if (path === "/") {
    return 1;
  }

  if (path === "/marketplace" || path === "/docs" || path === "/what-is-a-skill") {
    return 0.9;
  }

  return 0.78;
}
