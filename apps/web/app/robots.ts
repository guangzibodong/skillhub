import type { MetadataRoute } from "next";

const siteUrl = "https://useskillhub.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/marketplace",
          "/docs",
          "/publish",
          "/security",
          "/status",
          "/support",
          "/terms",
          "/privacy",
          "/skills/",
        ],
        disallow: ["/admin", "/admin-login", "/account", "/dashboard", "/publisher", "/report"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
