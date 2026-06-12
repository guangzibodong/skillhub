import type { MetadataRoute } from "next";
import { indexablePublicPaths } from "@/lib/public-pages";
import { localizedUrl, siteUrl } from "@/lib/seo";

const skillSlugs = [
  "browser-research-pro",
  "crm-enrichment",
  "support-triage",
  "data-pipeline-orchestrator",
  "financial-report-analyzer",
  "code-review-assistant",
];

const publisherSlugs = ["skillhub-labs", "devops-guild", "analyst-forge", "nexusai"];

const extraPublicPaths = [
  ...skillSlugs.map((slug) => `/skills/${slug}`),
  ...publisherSlugs.map((slug) => `/publishers/${slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = Array.from(new Set([...indexablePublicPaths, ...extraPublicPaths]));

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

  if (path.startsWith("/skills/") || path.startsWith("/publishers/")) {
    return 0.74;
  }

  return 0.78;
}
