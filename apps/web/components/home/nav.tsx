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
        scrolled
          ? "bg-[rgba(0,0,0,0.85)] backdrop-blur-[16px] border-b border-[rgba(255,255,255,0.08)]"
          : ""
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
        {/* Left: Logo */}
        <a href={`/${langSuffix}`} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-[#0075ff] flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">S</span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-[-0.02em]">
            SkillHub
          </span>
        </a>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="text-[14px] font-medium text-[#999] hover:text-white transition-colors px-3.5 py-2"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={locale === "zh" ? "/?lang=en" : "/?lang=zh"}
            className="text-[12px] text-[#525252] hover:text-[#999] transition-colors"
          >
            {locale === "zh" ? "EN" : "中文"}
          </a>
          <a
            href={`/login${langSuffix}`}
            className="text-[14px] font-medium text-[#999] hover:text-white transition-colors"
          >
            {locale === "zh" ? "登录" : "Log in"}
          </a>
          <a
            href={`/developer${langSuffix}`}
            className="bg-[#0075ff] hover:bg-[#0066e0] text-white text-[14px] font-medium px-4 py-2 rounded-[7px] transition-colors"
          >
            {locale === "zh" ? "开始创建" : "Start creating"}
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#999]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black border-t border-[rgba(255,255,255,0.08)] px-6 py-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className="block text-[14px] text-[#999] hover:text-white py-2.5"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-3">
            <a href={`/login${langSuffix}`} className="text-[14px] text-[#999]">
              {locale === "zh" ? "登录" : "Log in"}
            </a>
            <a
              href={`/developer${langSuffix}`}
              className="bg-[#0075ff] text-white text-[14px] font-medium px-4 py-2 rounded-[7px]"
            >
              {locale === "zh" ? "开始创建" : "Start creating"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
