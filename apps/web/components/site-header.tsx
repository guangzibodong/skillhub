"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, LayoutDashboard, Menu, UploadCloud, X } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

type SiteHeaderProps = {
  active: "home" | "marketplace" | "registry" | "agents" | "docs" | "dashboard" | "developer" | "publisher" | "admin" | "publish" | "account";
  apiUrl?: string;
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
  subtitle?: string;
};

export function SiteHeader({ active, apiUrl = "https://api.useskillhub.com", dictionary, locale, pathname, subtitle }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const consoleLabel = locale === "zh" ? "\u540e\u53f0\u5165\u53e3" : "Console";
  const navItems = [
    { id: "home", label: dictionary.nav.home, href: "/" },
    { id: "marketplace", label: dictionary.nav.marketplace, href: "/marketplace" },
    { id: "registry", label: dictionary.nav.registry, href: "/registry" },
    { id: "agents", label: dictionary.nav.agents, href: "/agents" },
    { id: "docs", label: dictionary.nav.docs, href: "/docs" },
    { id: "dashboard", label: dictionary.nav.dashboard, href: "/dashboard" },
    { id: "developer", label: dictionary.nav.developer, href: "/developer" },
    { id: "publisher", label: dictionary.nav.publisher, href: "/publisher" },
    { id: "admin", label: dictionary.nav.admin, href: "/admin" }
  ] as const;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header" ref={headerRef}>
      <a className="brand brand--link" href={localizedHref("/", locale)} aria-label="SkillHub home">
        <div className="brand__mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>SkillHub</strong>
          <small>{subtitle ?? "useskillhub.com"}</small>
        </div>
      </a>

      <nav className="site-nav" aria-label={locale === "zh" ? "主导航" : "Primary navigation"}>
        {navItems.map((item) => (
          <a
            className={active === item.id ? "site-nav__link site-nav__link--active" : "site-nav__link"}
            href={localizedHref(item.href, locale)}
            key={item.id}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="site-actions">
        <LanguageSwitcher label={dictionary.common.language} locale={locale} pathname={pathname} />
        <a className="ghost-button site-action-secondary" href={localizedHref("/account", locale)}>
          <LayoutDashboard size={17} aria-hidden="true" />
          <span>{consoleLabel}</span>
        </a>
        <a className="ghost-button site-action-secondary" href={`${apiUrl}/health`}>
          <Gauge size={17} aria-hidden="true" />
          <span>{dictionary.common.apiHealth}</span>
        </a>
        <a className="primary-button site-action-publish" href={localizedHref("/publish", locale)}>
          <UploadCloud size={17} aria-hidden="true" />
          <span>{dictionary.common.publish}</span>
        </a>
      </div>

      <button
        aria-controls="mobile-site-menu"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? (locale === "zh" ? "关闭导航" : "Close navigation") : locale === "zh" ? "打开导航" : "Open navigation"}
        className="site-mobile-menu-button"
        onClick={() => setIsMenuOpen((current) => !current)}
        ref={menuButtonRef}
        type="button"
      >
        {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
      </button>

      <div className={isMenuOpen ? "site-mobile-panel site-mobile-panel--open" : "site-mobile-panel"} id="mobile-site-menu">
        <nav aria-label={locale === "zh" ? "移动导航" : "Mobile navigation"}>
          {navItems.map((item) => (
            <a
              className={active === item.id ? "site-mobile-panel__link site-mobile-panel__link--active" : "site-mobile-panel__link"}
              href={localizedHref(item.href, locale)}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="site-mobile-panel__actions">
          <a className="ghost-button" href={localizedHref("/account", locale)}>
            <LayoutDashboard size={17} aria-hidden="true" />
            <span>{consoleLabel}</span>
          </a>
          <a className="ghost-button" href={`${apiUrl}/health`}>
            <Gauge size={17} aria-hidden="true" />
            <span>{dictionary.common.apiHealth}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
