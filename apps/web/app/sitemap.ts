import type { MetadataRoute } from "next";
import { growthPaths } from "@/lib/growth-content";
import { marketplaceSkills } from "@/lib/marketplace-data";
import { indexablePublicPaths } from "@/lib/public-pages";
import { localizedUrl, siteUrl } from "@/lib/seo";
import { isVerifiedSkillStatus } from "@/lib/skill-install-state";

const SITEMAP_SKILL_LIMIT = 240;

export default function sitemap(): MetadataRoute.Sitemap {
  const skillPaths = marketplaceSkills
    .slice(0, SITEMAP_SKILL_LIMIT)
    .filter((skill) => isVerifiedSkillStatus(skill.verification.en))
    .map((skill) => `/skills/${skill.slug}`);
  const paths = Array.from(new Set([...indexablePublicPaths, ...growthPaths, ...skillPaths]));

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

  if (
    path === "/marketplace" ||
    path === "/docs" ||
    path === "/solutions" ||
    path === "/use-cases" ||
    path === "/what-is-a-skill"
  ) {
    return 0.9;
  }

  if (
    path === "/blog" ||
    path === "/examples" ||
    path === "/integrations" ||
    path.startsWith("/solutions/") ||
    path.startsWith("/use-cases/")
  ) {
    return 0.84;
  }

  if (path.startsWith("/skills/")) {
    return 0.68;
  }

  return 0.78;
}
