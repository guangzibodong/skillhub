import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export function HomeFooter({ locale }: Props) {
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  const col1 = locale === "zh"
    ? [
        { href: "/marketplace", label: "技能市场" },
        { href: "/registry", label: "注册表" },
        { href: "/publish", label: "发布技能" },
        { href: "/docs", label: "文档" },
        { href: "/agents", label: "Agent 集成" },
      ]
    : [
        { href: "/marketplace", label: "Marketplace" },
        { href: "/registry", label: "Registry" },
        { href: "/publish", label: "Publish" },
        { href: "/docs", label: "Docs" },
        { href: "/agents", label: "Agents" },
      ];

  const col2 = locale === "zh"
    ? [
        { href: "/support", label: "帮助中心" },
        { href: "mailto:support@skillhub.dev", label: "联系我们" },
        { href: "/terms", label: "使用条款" },
        { href: "/security", label: "隐私政策" },
      ]
    : [
        { href: "/support", label: "Help Center" },
        { href: "mailto:support@skillhub.dev", label: "Contact us" },
        { href: "/terms", label: "Terms of Use" },
        { href: "/security", label: "Privacy Policy" },
      ];

  return (
    <footer className="border-t border-[rgba(255,255,255,0.08)]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Col 1: links */}
          <div>
            {col1.map((link) => (
              <a
                key={link.href}
                href={`${link.href}${langSuffix}`}
                className="block text-[14px] text-[#666] hover:text-[#999] transition-colors py-1.5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Col 2: support/legal */}
          <div>
            {col2.map((link) => (
              <a
                key={link.href}
                href={link.href.startsWith("mailto") ? link.href : `${link.href}${langSuffix}`}
                className="block text-[14px] text-[#666] hover:text-[#999] transition-colors py-1.5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Spacer for alignment */}
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#525252]">
            © {new Date().getFullYear()} SkillHub, Inc.{" "}
            {locale === "zh" ? "保留所有权利" : "All rights reserved"}
          </p>

          <div className="flex items-center gap-4">
            {/* Language */}
            <a
              href={locale === "zh" ? "/?lang=en" : "/?lang=zh"}
              className="text-[12px] text-[#525252] hover:text-[#999] transition-colors"
            >
              {locale === "zh" ? "EN" : "中文"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
