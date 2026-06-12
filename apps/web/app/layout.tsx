import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./tailwind.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://useskillhub.com"),
  title: {
    default: "SkillHub - AI Agent Skill Registry",
    template: "%s | SkillHub",
  },
  description:
    "SkillHub helps teams discover, inspect, govern, and run reusable AI agent Skills with manifests, Project Keys, REST, MCP, logs, and review workflows.",
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      "zh-CN": "/?lang=zh",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "SkillHub - AI Agent Skill Registry",
    description:
      "Discover, inspect, govern, and run reusable AI agent Skills with manifests, Project Keys, REST, MCP, logs, and review workflows.",
    siteName: "SkillHub",
    type: "website",
    url: "https://useskillhub.com/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillHub - AI Agent Skill Registry",
    description:
      "Discover, inspect, govern, and run reusable AI agent Skills with manifests, Project Keys, REST, MCP, logs, and review workflows.",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  const langMatch = url.match(/[?&]lang=([^&]*)/);
  const langParam = langMatch?.[1]?.toLowerCase() || "";
  const htmlLang =
    langParam === "zh" || langParam === "zh-cn" || langParam === "cn" ? "zh-CN" : "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
