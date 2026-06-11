import type { Locale } from "@/lib/i18n";
import { Github, Twitter } from "lucide-react";

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
        { href: "/docs", label: "Documentation" },
        { href: "/publish", label: "Publish a Skill" },
      ],
    },
    platform: {
      title: "Platform",
      links: [
        { href: "/status", label: "Status" },
        { href: "/security", label: "Security" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/support", label: "Support" },
      ],
    },
    developers: {
      title: "Developers",
      links: [
        { href: "/docs", label: "API Reference" },
        { href: "/developer", label: "Console" },
        { href: "https://github.com/guangzibodong/skillhub", label: "GitHub" },
        { href: "/docs", label: "SDK" },
      ],
    },
  },
  zh: {
    product: {
      title: "产品",
      links: [
        { href: "/registry", label: "技能注册表" },
        { href: "/marketplace", label: "技能市场" },
        { href: "/docs", label: "文档" },
        { href: "/publish", label: "发布技能" },
      ],
    },
    platform: {
      title: "平台",
      links: [
        { href: "/status", label: "状态" },
        { href: "/security", label: "安全" },
        { href: "/terms", label: "服务条款" },
        { href: "/support", label: "支持" },
      ],
    },
    developers: {
      title: "开发者",
      links: [
        { href: "/docs", label: "API 参考" },
        { href: "/developer", label: "控制台" },
        { href: "https://github.com/guangzibodong/skillhub", label: "GitHub" },
        { href: "/docs", label: "SDK" },
      ],
    },
  },
};

export function HomeFooter({ locale }: FooterProps) {
  const groups = footerLinks[locale];
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  return (
    <footer className="border-t border-[var(--color-border-default)] mt-0">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-indigo)] flex items-center justify-center">
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="font-semibold text-[var(--color-text-primary)] text-[15px] tracking-tight">
                SkillHub
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed mb-6">
              {locale === "zh"
                ? "AI Agent 的统一技能注册中心与安全运行网关。发现、验证、调用 — 一站式解决。"
                : "The unified skill registry and secure runtime gateway for AI agents. Discover, verify, invoke — all in one place."}
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/guangzibodong/skillhub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href="https://twitter.com/useskillhub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-all"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(groups).map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href.startsWith("http") ? link.href : `${link.href}${langSuffix}`}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
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

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-[var(--color-border-default)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} SkillHub.{" "}
            {locale === "zh" ? "保留所有权利。" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-green)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-green)]" />
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {locale === "zh" ? "系统正常运行" : "All systems operational"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
