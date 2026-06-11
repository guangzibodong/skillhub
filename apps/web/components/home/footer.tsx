import type { Locale } from "@/lib/i18n";

type FooterProps = {
  locale: Locale;
};

const footerLinks = {
  en: {
    product: {
      title: "Product",
      links: [
        { href: "/registry", label: "Registry" },
        { href: "/marketplace", label: "Marketplace" },
        { href: "/docs", label: "Docs" },
        { href: "/publish", label: "Publish" },
      ],
    },
    platform: {
      title: "Platform",
      links: [
        { href: "/status", label: "Status" },
        { href: "/security", label: "Security" },
        { href: "/terms", label: "Terms" },
        { href: "/support", label: "Support" },
      ],
    },
  },
  zh: {
    product: {
      title: "产品",
      links: [
        { href: "/registry", label: "注册表" },
        { href: "/marketplace", label: "市场" },
        { href: "/docs", label: "文档" },
        { href: "/publish", label: "发布" },
      ],
    },
    platform: {
      title: "平台",
      links: [
        { href: "/status", label: "状态" },
        { href: "/security", label: "安全" },
        { href: "/terms", label: "条款" },
        { href: "/support", label: "支持" },
      ],
    },
  },
};

export function HomeFooter({ locale }: FooterProps) {
  const groups = footerLinks[locale];
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  return (
    <footer className="border-t border-[var(--color-border-default)] mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
                <span className="text-xs font-bold text-black">S</span>
              </div>
              <span className="font-semibold text-[var(--color-text-primary)] text-sm">SkillHub</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              {locale === "zh"
                ? "AI Agent 的技能注册中心与运行网关。"
                : "The skill registry and runtime gateway for AI agents."}
            </p>
          </div>

          {/* Links */}
          {Object.values(groups).map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={`${link.href}${langSuffix}`}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border-default)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} SkillHub.{" "}
            {locale === "zh" ? "保留所有权利。" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-text-muted)]">
              {locale === "zh" ? "系统正常" : "All systems operational"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
