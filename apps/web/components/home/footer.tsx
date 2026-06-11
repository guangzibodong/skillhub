import type { Locale } from "@/lib/i18n";

type FooterProps = {
  locale: Locale;
};

const footerLinks = {
  en: {
    product: {
      title: "Product",
      links: [
        { href: "/marketplace", label: "Marketplace" },
        { href: "/registry", label: "Registry" },
        { href: "/agents", label: "Agent Integrations" },
        { href: "/publish", label: "Publish a Skill" },
        { href: "/docs", label: "Documentation" },
      ],
    },
    platform: {
      title: "Platform",
      links: [
        { href: "/status", label: "Status" },
        { href: "/security", label: "Security" },
        { href: "/support", label: "Support" },
        { href: "/terms", label: "Terms of Use" },
      ],
    },
  },
  zh: {
    product: {
      title: "产品",
      links: [
        { href: "/marketplace", label: "技能市场" },
        { href: "/registry", label: "注册表" },
        { href: "/agents", label: "Agent 集成" },
        { href: "/publish", label: "发布技能" },
        { href: "/docs", label: "文档" },
      ],
    },
    platform: {
      title: "平台",
      links: [
        { href: "/status", label: "状态" },
        { href: "/security", label: "安全" },
        { href: "/support", label: "支持" },
        { href: "/terms", label: "使用条款" },
      ],
    },
  },
};

export function HomeFooter({ locale }: FooterProps) {
  const groups = footerLinks[locale];
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">S</span>
              </div>
              <span className="text-body-sm text-[var(--color-text-primary)]">
                SkillHub
              </span>
            </div>
            <p className="text-body text-[var(--color-text-secondary)] max-w-xs">
              {locale === "zh"
                ? "AI Agent 的统一技能注册中心与安全运行网关。"
                : "The universal skill registry and runtime gateway for AI agents."}
            </p>
          </div>

          {/* Link columns */}
          {Object.values(groups).map((group) => (
            <div key={group.title}>
              <h4 className="text-body-sm text-[var(--color-text-primary)] mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={`${link.href}${langSuffix}`}
                      className="text-body-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
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
        <div className="mt-14 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-caption text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} SkillHub.{" "}
            {locale === "zh" ? "保留所有权利。" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-verified)]" />
              <span className="text-caption text-[var(--color-text-muted)]">
                {locale === "zh" ? "系统正常" : "All systems operational"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
