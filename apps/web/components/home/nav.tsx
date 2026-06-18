"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/i18n";

export type NavPage =
  | "home"
  | "marketplace"
  | "solutions"
  | "use-cases"
  | "examples"
  | "integrations"
  | "blog"
  | "registry"
  | "docs"
  | "quickstart"
  | "mcp"
  | "pricing"
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
  secondaryHref?: string;
  secondaryLabel?: string;
};

const navLinks = {
  en: [
    { href: "/marketplace", page: "marketplace" as NavPage, label: "Find Skills" },
    { href: "/solutions", page: "solutions" as NavPage, label: "Solutions" },
    { href: "/registry", page: "registry" as NavPage, label: "Skill API" },
    { href: "/docs", page: "docs" as NavPage, label: "Docs & Guides" },
    { href: "/publish", page: "publish" as NavPage, label: "Publish Skill" },
    { href: "/pricing", page: "pricing" as NavPage, label: "Plans" },
  ],
  zh: [
    { href: "/marketplace", page: "marketplace" as NavPage, label: "找技能" },
    { href: "/solutions", page: "solutions" as NavPage, label: "解决方案" },
    { href: "/registry", page: "registry" as NavPage, label: "技能 API" },
    { href: "/docs", page: "docs" as NavPage, label: "使用文档" },
    { href: "/publish", page: "publish" as NavPage, label: "发布技能" },
    { href: "/pricing", page: "pricing" as NavPage, label: "价格方案" },
  ],
};

export function HomeNav({ active, locale, secondaryHref, secondaryLabel }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const links = navLinks[locale];
  const alternateLocale = locale === "zh" ? "en" : "zh";
  const alternateLocaleLabel = locale === "zh" ? "EN" : "中文";
  const alternateLocaleHref = localizedHrefWithCurrentSearch(
    pathname,
    alternateLocale,
    searchParams,
  );
  const loginHref = loginHrefWithCurrentReturnTo(pathname, locale, searchParams);
  const actionHref = secondaryHref ?? loginHref;
  const actionLabel = secondaryLabel ?? (locale === "zh" ? "登录" : "Log in");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] isolate transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-[rgba(3,5,3,0.88)] backdrop-blur-[16px] border-b border-[rgba(221,255,220,0.1)]"
          : ""
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <a href={localizedHref("/", locale)} className="flex items-center gap-2.5" aria-label="SkillHub home">
          <div className="w-7 h-7 rounded-[6px] bg-[#7fee64] border border-[rgba(167,255,140,0.72)] flex items-center justify-center shadow-[0_0_28px_rgba(127,238,100,0.18)]">
            <span className="text-[11px] font-bold text-[#071207]">S</span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-[0]">
            SkillHub
          </span>
        </a>

        <div className="hidden xl:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={localizedHref(link.href, locale)}
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

        <div className="hidden xl:flex items-center gap-4">
          <a
            href={alternateLocaleHref}
            className="text-[12px] text-[#a9b3a3] hover:text-white transition-colors"
          >
            {alternateLocaleLabel}
          </a>
          <a
            href={actionHref}
            className="text-[14px] font-medium text-[#a9b3a3] hover:text-white transition-colors"
          >
            {actionLabel}
          </a>
          <a
            href={localizedHref("/marketplace", locale)}
            className="bg-[#7fee64] hover:bg-[#a7ff8c] text-[#071207] text-[14px] font-semibold px-4 py-2 rounded-[6px] border border-[rgba(167,255,140,0.72)] transition-colors"
          >
            {locale === "zh" ? "找技能" : "Find Skills"}
          </a>
        </div>

        <button
          aria-controls="home-mobile-menu"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? (locale === "zh" ? "关闭导航" : "Close menu") : (locale === "zh" ? "打开导航" : "Open menu")}
          className="relative z-[101] xl:hidden p-2 text-[#dce8d8]"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="xl:hidden bg-[#030503] border-t border-[rgba(221,255,220,0.1)] px-6 py-4 space-y-1"
          id="home-mobile-menu"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={localizedHref(link.href, locale)}
              onClick={() => setMobileOpen(false)}
              className={`block text-[14px] py-2.5 ${
                active === link.page ? "text-white" : "text-[#a9b3a3] hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-3 gap-3">
            <a href={alternateLocaleHref} className="text-[14px] text-[#dce8d8] px-3 py-2 rounded-[6px] border border-[rgba(221,255,220,0.1)] text-center">
              {alternateLocaleLabel}
            </a>
            <a href={actionHref} className="text-[14px] text-[#dce8d8] px-3 py-2 rounded-[6px] border border-[rgba(221,255,220,0.1)] text-center">
              {actionLabel}
            </a>
            <a
              href={localizedHref("/marketplace", locale)}
              className="bg-[#7fee64] text-[#071207] text-[14px] font-semibold px-3 py-2 rounded-[6px] border border-[rgba(167,255,140,0.72)] text-center"
            >
              {locale === "zh" ? "找技能" : "Find Skills"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function loginHrefWithCurrentReturnTo(
  pathname: string,
  locale: Locale,
  searchParams: Pick<URLSearchParams, "forEach">,
) {
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    return localizedHref("/login", locale);
  }

  const returnParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key !== "returnTo") {
      returnParams.append(key, value);
    }
  });

  returnParams.set("lang", locale);

  const returnQuery = returnParams.toString();
  const returnTo = `${pathname}${returnQuery ? `?${returnQuery}` : ""}`;
  const loginParams = new URLSearchParams({
    lang: locale,
    returnTo,
  });

  return `/login?${loginParams.toString()}`;
}

function localizedHrefWithCurrentSearch(
  pathname: string,
  locale: Locale,
  searchParams: Pick<URLSearchParams, "forEach">,
) {
  const nextParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key !== "lang") {
      nextParams.append(key, value);
    }
  });

  nextParams.set("lang", locale);
  const query = nextParams.toString();

  return `${pathname}${query ? `?${query}` : ""}`;
}
