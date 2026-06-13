import type { MetadataRoute } from "next";
import { indexablePublicPaths, privateNoIndexPaths } from "@/lib/public-pages";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...indexablePublicPaths, "/skills/", "/publishers/"],
        disallow: [
          ...privateNoIndexPaths,
          "/login/",
          "/admin/",
          "/account/",
          "/publisher/",
          "/developer/",
          "/dashboard/",
          "/api/auth/",
          "/api/admin/",
          "/api/internal/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
