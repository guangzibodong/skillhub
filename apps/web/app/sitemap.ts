import type { MetadataRoute } from "next";

const siteUrl = "https://useskillhub.com";
const publicPaths = [
  "/",
  "/marketplace",
  "/docs",
  "/publish",
  "/security",
  "/status",
  "/support",
  "/terms",
  "/privacy",
  "/skills/browser-research",
  "/skills/dataset-summarizer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.flatMap((path) =>
    ["en", "zh"].map((lang) => ({
      url: `${siteUrl}${path}?lang=${lang}`,
      lastModified: new Date(),
      changeFrequency: path === "/" ? "daily" : "weekly",
      priority: path === "/" ? 1 : path.startsWith("/skills/") ? 0.7 : 0.8,
      alternates: {
        languages: {
          en: `${siteUrl}${path}?lang=en`,
          "zh-CN": `${siteUrl}${path}?lang=zh`,
          "x-default": `${siteUrl}${path}`,
        },
      },
    })),
  );
}
