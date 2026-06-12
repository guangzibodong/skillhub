"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";

export type NavPage =
  | "home"
  | "marketplace"
  | "registry"
  | "docs"
  | "publish"
  | "agents"
  | "publishers"
  | "developer"
  | "publisher"
  | "dashboard"
  | "admin"
  | "login"
  | "account"
  | "skills"
  | "support"
  | "terms"
  | "security"
  | "status"
  | "report";

type NavProps = {
  active?: NavPage;
  locale: Locale;
};

const navLinks = {
  en: [
    { href: "/marketplace", page: "marketplace" as NavPage, label: "Marketplace" },
    { href: "/registry", page: "registry" as NavPage, label: "Registry" },
    { href: "/docs", page: "docs" as NavPage, label: "Docs" },
    { href: "/publish", page: "publish" as NavPage, label: "Publish" },
  ],
  zh: [
    { href: "/marketplace", page: "marketplace" as NavPage, label: "市场" },
    { href: "/registry", page: "registry" as NavPage, label: "注册表" },
    { href: "/docs", page: "docs" as NavPage, label: "文档" },
    { href: "/publish", page: "publish" as NavPage, label: "发布" },
  ],
};

export function HomeNav({ active, locale }: NavProps) {
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
          ? "bg-[rgba(3,5,3,0.86)] backdrop-blur-[16px] border-b border-[rgba(221,255,220,0.1)]"
          : ""
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
        {/* Left: Logo */}
        <a href={`/${langSuffix}`} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[6px] bg-[#7fee64] border border-[rgba(167,255,140,0.72)] flex items-center justify-center shadow-[0_0_28px_rgba(127,238,100,0.18)]">
            <span className="text-[11px] font-bold text-[#071207]">S</span>
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
              className={`text-[14px] font-medium transition-colors px-3.5 py-2 ${
                active === link.page
                  ? "text-white"
                  : "text-[#999] hover:text-white"
              }`}
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
            className="bg-[#7fee64] hover:bg-[#a7ff8c] text-[#071207] text-[14px] font-semibold px-4 py-2 rounded-[6px] border border-[rgba(167,255,140,0.72)] transition-colors"
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
        <div className="md:hidden bg-[#030503] border-t border-[rgba(221,255,220,0.1)] px-6 py-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={`${link.href}${langSuffix}`}
              className={`block text-[14px] py-2.5 ${
                active === link.page ? "text-white" : "text-[#999] hover:text-white"
              }`}
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
              className="bg-[#7fee64] text-[#071207] text-[14px] font-semibold px-4 py-2 rounded-[6px] border border-[rgba(167,255,140,0.72)]"
            >
              {locale === "zh" ? "开始创建" : "Start creating"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
