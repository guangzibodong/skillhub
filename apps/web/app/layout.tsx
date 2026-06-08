import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillHub",
  description: "Universal skills for AI agents."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var p=new URLSearchParams(location.search);var l=(p.get("lang")||"").toLowerCase();document.documentElement.lang=(l==="zh"||l==="zh-cn"||l==="cn")?"zh-CN":"en";}catch(e){}'
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
