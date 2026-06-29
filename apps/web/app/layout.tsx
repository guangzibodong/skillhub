import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "./tailwind.css";
import "antd/dist/reset.css";
import { SiteMotion } from "@/components/site-motion";
import { SkillAntdProvider } from "@/components/skill-antd-provider";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AntdRegistry>
          <SkillAntdProvider>
            <SiteMotion />
            {children}
          </SkillAntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
