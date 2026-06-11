"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type NavProps = {
  locale: Locale;
};

const navLinks = {
  en: [
    { href: "/registry", label: "Registry" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/docs", label: "Docs" },
    { href: "/publish", label: "Publish" },
  ],
  zh: [
    { href: "/registry", label: "注册表" },
    { href: "/marketplace", label: "市场" },
    { href: "/docs", label: "文档" },
    { href: "/publish", label: "发布" },
  ],
};

export function HomeNav({ locale }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navLinks[locale];
  const langSuffix = locale === "zh" ? "?lang=zh" : "";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-[var(--color-border-default)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={`/${langSuffix}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-sm font-bold text-black">S</span>
          </div>
          <span className="font-semibold text-[var(--color-text-primary)]">SkillHub</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={locale === "zh" ? "/?lang=en" : "/?lang=zh"}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors px-2 py-1 rounded border border-[var(--color-border-default)]"
          >
            {locale === "zh" ? "EN" : "中文"}
          </a>
          <a
            href={`/login${langSuffix}`}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {locale === "zh" ? "登录" : "Sign in"}
          </a>
          <a
            href={`/developer${langSuffix}`}
            className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-black font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {locale === "zh" ? "开发者控制台" : "Console"}
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--color-border-default)] px-4 py-4 space-y-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-2"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-[var(--color-border-default)] flex items-center gap-3">
            <a
              href={`/login${langSuffix}`}
              className="text-sm text-[var(--color-text-secondary)]"
            >
              {locale === "zh" ? "登录" : "Sign in"}
            </a>
            <a
              href={`/developer${langSuffix}`}
              className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-black font-medium"
            >
              {locale === "zh" ? "控制台" : "Console"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
