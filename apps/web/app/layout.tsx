import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "SkillHub",
  description: "Universal skills for AI agents."
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
