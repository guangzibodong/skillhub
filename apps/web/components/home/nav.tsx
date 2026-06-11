"use client";

import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-[var(--color-border-default)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={`/${langSuffix}`} className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-indigo)] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="font-semibold text-[var(--color-text-primary)] text-[15px] tracking-tight">
            SkillHub
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={locale === "zh" ? "/?lang=en" : "/?lang=zh"}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors px-2.5 py-1.5 rounded-lg border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)]"
          >
            <Globe size={12} />
            {locale === "zh" ? "EN" : "中文"}
          </a>
          <a
            href={`/login${langSuffix}`}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2"
          >
            {locale === "zh" ? "登录" : "Sign in"}
          </a>
          <a
            href={`/developer${langSuffix}`}
            className="glow-button text-sm px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <span className="relative z-10">
              {locale === "zh" ? "控制台" : "Console"}
            </span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-[var(--color-border-default)] px-6 py-5 space-y-1 animate-fade-in">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] py-2.5 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 mt-3 border-t border-[var(--color-border-default)] flex items-center gap-3">
            <a
              href={`/login${langSuffix}`}
              className="text-sm text-[var(--color-text-secondary)] px-3 py-2"
            >
              {locale === "zh" ? "登录" : "Sign in"}
            </a>
            <a
              href={`/developer${langSuffix}`}
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-indigo)] text-white font-medium"
            >
              {locale === "zh" ? "控制台" : "Console"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
