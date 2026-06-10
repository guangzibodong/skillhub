"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, Menu, UploadCloud, X } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { getProductStageCopy } from "@/lib/product-stage";
import { LanguageSwitcher } from "./language-switcher";

export type SiteHeaderDictionary = {
  common: {
    language: string;
    publish: string;
  };
  nav: {
    home: string;
    marketplace: string;
    registry: string;
    agents: string;
    docs: string;
    dashboard: string;
    developer: string;
    publisher: string;
    admin: string;
  };
};

type SiteHeaderClientProps = {
  active:
    | "home"
    | "marketplace"
    | "registry"
    | "publishers"
    | "agents"
    | "docs"
    | "dashboard"
    | "developer"
    | "publisher"
    | "admin"
    | "publish"
    | "account";
  dictionary: SiteHeaderDictionary;
  locale: Locale;
  pathname: string;
  consoleHref?: string;
  consoleLabel?: string;
  subtitle?: string;
};

export function SiteHeaderClient({
  active,
  consoleHref,
  consoleLabel,
  dictionary,
  locale,
  pathname,
  subtitle,
}: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const labels = headerLabels(dictionary, locale);
  const productStage = getProductStageCopy(locale);
  const navItems = [
    { id: "home", label: labels.nav.home, href: "/" },
    { id: "registry", label: labels.nav.registry, href: "/registry" },
    { id: "marketplace", label: labels.nav.marketplace, href: "/marketplace" },
    { id: "docs", label: labels.nav.docs, href: "/docs" },
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
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
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
    <>
      <header className="site-header" ref={headerRef}>
        <a
          className="brand brand--link"
          href={localizedHref("/", locale)}
          aria-label="SkillHub home"
        >
          <div className="brand__mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <strong>SkillHub</strong>
            <small>{subtitle ?? "useskillhub.com"}</small>
          </div>
        </a>

        <nav className="site-nav" aria-label={labels.primaryNavigation}>
          {navItems.map((item) => (
            <a
              className={
                active === item.id
                  ? "site-nav__link site-nav__link--active"
                  : "site-nav__link"
              }
              href={localizedHref(item.href, locale)}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-actions">
          <LanguageSwitcher
            label={labels.language}
            locale={locale}
            pathname={pathname}
          />
          <a
            className="primary-button site-action-publish"
            href={localizedHref("/publish", locale)}
          >
            <UploadCloud size={17} aria-hidden="true" />
            <span>{labels.publish}</span>
          </a>
          <a
            className="ghost-button site-action-secondary"
            href={consoleHref ?? localizedHref("/login", locale)}
          >
            <LogIn size={17} aria-hidden="true" />
            <span>{consoleLabel ?? labels.console}</span>
          </a>
        </div>

        <button
          aria-controls="mobile-site-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? labels.closeNavigation : labels.openNavigation}
          className="site-mobile-menu-button"
          onClick={() => setIsMenuOpen((current) => !current)}
          ref={menuButtonRef}
          type="button"
        >
          <span className="visually-hidden">
            {isMenuOpen ? labels.closeNavigation : labels.openNavigation}
          </span>
          {isMenuOpen ? (
            <X size={18} aria-hidden="true" />
          ) : (
            <Menu size={18} aria-hidden="true" />
          )}
        </button>

        <div
          className={
            isMenuOpen
              ? "site-mobile-panel site-mobile-panel--open"
              : "site-mobile-panel"
          }
          id="mobile-site-menu"
        >
          <nav aria-label={labels.mobileNavigation}>
            {navItems.map((item) => (
              <a
                className={
                  active === item.id
                    ? "site-mobile-panel__link site-mobile-panel__link--active"
                    : "site-mobile-panel__link"
                }
                href={localizedHref(item.href, locale)}
                key={item.id}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="site-mobile-panel__actions">
            <a className="primary-button" href={localizedHref("/publish", locale)}>
              <UploadCloud size={17} aria-hidden="true" />
              <span>{labels.publish}</span>
            </a>
            <a className="ghost-button" href={consoleHref ?? localizedHref("/login", locale)}>
              <LogIn size={17} aria-hidden="true" />
              <span>{consoleLabel ?? labels.console}</span>
            </a>
          </div>
        </div>
      </header>
      <div className="product-stage-banner" role="status">
        <strong>{productStage.label}</strong>
        <span>{productStage.body}</span>
      </div>
    </>
  );
}

function headerLabels(dictionary: SiteHeaderDictionary, locale: Locale) {
  if (locale === "zh") {
    return {
      closeNavigation: "关闭导航",
      console: "登录入口",
      language: "语言",
      mobileNavigation: "移动导航",
      openNavigation: "打开导航",
      primaryNavigation: "主导航",
      publish: "发布",
      nav: {
        home: "首页",
        marketplace: "市场",
        registry: "技能库",
        agents: "智能体",
        docs: "文档",
        dashboard: "工作台",
        developer: "开发者",
        publisher: "发布者",
        admin: "后台",
      },
    };
  }

  return {
    closeNavigation: "Close navigation",
    console: "Sign in",
    language: dictionary.common.language,
    mobileNavigation: "Mobile navigation",
    openNavigation: "Open navigation",
    primaryNavigation: "Primary navigation",
    publish: dictionary.common.publish,
    nav: dictionary.nav,
  };
}
