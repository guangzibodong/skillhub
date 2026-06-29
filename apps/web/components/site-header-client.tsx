"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { getProductStageCopy } from "@/lib/product-stage";
import { trackPublicEvent } from "@/lib/public-analytics";
import { LanguageSwitcher } from "./language-switcher";

export type SiteHeaderDictionary = {
  common: {
    language: string;
    publish: string;
  };
  nav: {
    exploreSkills?: string;
    home: string;
    marketplace: string;
    solutions?: string;
    registry: string;
    agents: string;
    docs: string;
    publish?: string;
    security?: string;
    pricing?: string;
    dashboard: string;
    developer: string;
    publisher: string;
    admin: string;
  };
};

export type SiteHeaderActive =
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
  | "publishers"
  | "agents"
  | "prompts"
  | "dashboard"
  | "developer"
  | "publisher"
  | "admin"
  | "login"
  | "account"
  | "skills"
  | "support"
  | "terms"
  | "security"
  | "status"
  | "report";

type SiteHeaderClientProps = {
  active?: SiteHeaderActive;
  dictionary: SiteHeaderDictionary;
  locale: Locale;
  pathname?: string;
  consoleHref?: string;
  consoleLabel?: string;
  showStageBanner?: boolean;
  subtitle?: string;
};

export function SiteHeaderClient({
  active,
  consoleHref,
  consoleLabel,
  dictionary,
  locale,
  pathname,
  showStageBanner = true,
  subtitle,
}: SiteHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const currentPathname = usePathname() ?? pathname ?? "/";
  const labels = headerLabels(dictionary, locale);
  const productStage = getProductStageCopy(locale);
  const navItems = [
    { id: "marketplace", label: labels.nav.exploreSkills, href: "/marketplace" },
    { id: "solutions", label: labels.nav.solutions, href: "/solutions" },
    { id: "registry", label: labels.nav.registry, href: "/registry" },
    { id: "docs", label: labels.nav.docs, href: "/docs" },
    { id: "publish", label: labels.nav.publish, href: "/publish" },
    { id: "pricing", label: labels.nav.pricing, href: "/pricing" },
    { id: "prompts", label: locale === "zh" ? "提示词" : "Prompts", href: "/prompts" }
  ] as const;
  const consoleActionHref = consoleHref ?? localizedHref("/login", locale);
  const consoleActionAnalytics = getHeaderCtaAnalytics(consoleActionHref);

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
          aria-current={active === "home" ? "page" : undefined}
          className="brand brand--link"
          href={localizedHref("/", locale)}
          aria-label="SkillHub home"
          onClick={() => trackPublicEvent("home_nav_click", { target: "home" })}
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
              aria-current={active === item.id ? "page" : undefined}
              className={
                active === item.id
                  ? "site-nav__link site-nav__link--active"
                  : "site-nav__link"
              }
              href={localizedHref(item.href, locale)}
              key={item.id}
              onClick={() => trackPublicEvent("home_nav_click", { target: item.id })}
            >
              {item.label}
              {item.id === "pricing" ? (
                <span className="site-nav__badge">{labels.preview}</span>
              ) : null}
            </a>
          ))}
        </nav>

        <div className="site-actions">
          <LanguageSwitcher
            label={labels.language}
            locale={locale}
            pathname={currentPathname}
          />
          <a
            className="secondary-button site-action-secondary"
            href={consoleActionHref}
            onClick={() => trackPublicEvent(consoleActionAnalytics.eventName, { target: consoleActionAnalytics.target })}
          >
            <LogIn size={17} aria-hidden="true" />
            <span>{consoleLabel ?? labels.console}</span>
          </a>
          <a
            className="primary-button site-action-publish"
            href={localizedHref("/dashboard", locale)}
            onClick={() => trackPublicEvent("open_workspace_click", { target: "dashboard" })}
          >
            <LayoutDashboard size={17} aria-hidden="true" />
            <span>{labels.getProjectKey}</span>
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
                aria-current={active === item.id ? "page" : undefined}
                className={
                  active === item.id
                    ? "site-mobile-panel__link site-mobile-panel__link--active"
                    : "site-mobile-panel__link"
                }
                href={localizedHref(item.href, locale)}
                key={item.id}
                onClick={() => trackPublicEvent("home_nav_click", { target: item.id, surface: "mobile" })}
              >
                {item.label}
                {item.id === "pricing" ? (
                  <span className="site-nav__badge">{labels.preview}</span>
                ) : null}
              </a>
            ))}
          </nav>
          <div className="site-mobile-panel__actions">
            <a
              className="ghost-button"
              href={consoleActionHref}
              onClick={() => trackPublicEvent(consoleActionAnalytics.eventName, { target: consoleActionAnalytics.target, surface: "mobile" })}
            >
              <LogIn size={17} aria-hidden="true" />
              <span>{consoleLabel ?? labels.console}</span>
            </a>
            <a
              className="primary-button"
              href={localizedHref("/dashboard", locale)}
              onClick={() => trackPublicEvent("open_workspace_click", { target: "dashboard", surface: "mobile" })}
            >
              <LayoutDashboard size={17} aria-hidden="true" />
              <span>{labels.getProjectKey}</span>
            </a>
          </div>
        </div>
      </header>
      {showStageBanner ? (
        <div className="product-stage-banner" role="status">
          <strong>{productStage.label}</strong>
          <span>{productStage.body}</span>
        </div>
      ) : null}
    </>
  );
}

function getHeaderCtaAnalytics(href: string) {
  const target = getHeaderCtaTarget(href);

  return {
    eventName: target === "login" ? "sign_in_click" : "header_cta_click",
    target,
  };
}

function getHeaderCtaTarget(href: string) {
  try {
    const url = new URL(href, "https://useskillhub.local");
    return url.pathname.split("/").filter(Boolean)[0] ?? "home";
  } catch {
    return "unknown";
  }
}

function headerLabels(dictionary: SiteHeaderDictionary, locale: Locale) {
  if (locale === "zh") {
    return {
      closeNavigation: "关闭导航",
      console: "登录",
      getProjectKey: "打开工作台",
      language: "语言",
      mobileNavigation: "移动导航",
      openNavigation: "打开导航",
      preview: "预览",
      primaryNavigation: "主导航",
      publish: "发布技能",
      nav: {
        exploreSkills: "找技能",
        home: "首页",
        marketplace: "找技能",
        solutions: "解决方案",
        registry: "技能 API",
        agents: "智能体",
        docs: "使用文档",
        publish: "发布技能",
        security: "安全合规",
        pricing: "价格方案",
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
    getProjectKey: "Open workspace",
    language: dictionary.common.language,
    mobileNavigation: "Mobile navigation",
    openNavigation: "Open navigation",
    preview: "Preview",
    primaryNavigation: "Primary navigation",
    publish: dictionary.common.publish,
    nav: {
      ...dictionary.nav,
      exploreSkills: "Find Skills",
      solutions: "Solutions",
      publish: "Publish Skill",
      pricing: "Plans",
    },
  };
}
