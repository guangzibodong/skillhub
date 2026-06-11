"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type NavProps = {
  locale: Locale;
};

const navLinks = {
  en: [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/registry", label: "Registry" },
    { href: "/docs", label: "Docs" },
    { href: "/publish", label: "Publish" },
  ],
  zh: [
    { href: "/marketplace", label: "市场" },
    { href: "/registry", label: "注册表" },
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
        scrolled ? "nav-glass border-b border-[var(--color-border)]" : ""
      }`}
    >
      <nav className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={`/${langSuffix}`} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="text-body-sm text-[var(--color-text-primary)]">
            SkillHub
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="text-body-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={locale === "zh" ? "/?lang=en" : "/?lang=zh"}
            className="text-label text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors px-2 py-1"
          >
            {locale === "zh" ? "EN" : "中文"}
          </a>
          <a
            href={`/login${langSuffix}`}
            className="text-body-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2"
          >
            {locale === "zh" ? "登录" : "Log in"}
          </a>
          <a
            href={`/developer${langSuffix}`}
            className="btn-primary"
          >
            {locale === "zh" ? "开始创建" : "Start building"}
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
        <div className="md:hidden bg-[var(--color-surface-0)] border-t border-[var(--color-border)] px-6 py-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="block text-body-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-2.5"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-[var(--color-border)] flex items-center gap-3">
            <a
              href={`/login${langSuffix}`}
              className="text-body-sm text-[var(--color-text-secondary)]"
            >
              {locale === "zh" ? "登录" : "Log in"}
            </a>
            <a href={`/developer${langSuffix}`} className="btn-primary">
              {locale === "zh" ? "开始创建" : "Start building"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
