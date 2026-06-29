"use client";

import type { MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Bell, BookOpen, CircleHelp, LogOut, Search, X } from "lucide-react";

export type AdminSwitcherText = {
  en: string;
  zh: string;
};

export type AdminSwitcherNavGroup = {
  label: AdminSwitcherText;
  items: {
    badge?: string;
    href: string;
    label: AdminSwitcherText;
  }[];
};

export type AdminSwitcherShortcutItem = {
  href: string;
  label: AdminSwitcherText;
};

export type AdminSwitcherPanel = {
  content: ReactNode;
  id: string;
  label: AdminSwitcherText;
};

type AdminPanelSwitcherProps = {
  adminDocsHref: string;
  className: string;
  docsHref: string;
  environmentLabel: AdminSwitcherText;
  homeHref: string;
  navGroups: AdminSwitcherNavGroup[];
  notificationAttentionCount: number;
  operatorInitial: string;
  operatorName: string;
  panels: AdminSwitcherPanel[];
  shortcutItems: AdminSwitcherShortcutItem[];
  showNotifications: boolean;
  signOutAction: (formData: FormData) => void | Promise<void>;
  statusHref: string;
  systemLine: AdminSwitcherText;
  title: AdminSwitcherText;
};

export function AdminPanelSwitcher({
  adminDocsHref,
  className,
  docsHref,
  environmentLabel,
  homeHref,
  navGroups,
  notificationAttentionCount,
  operatorInitial,
  operatorName,
  panels,
  shortcutItems,
  showNotifications,
  signOutAction,
  statusHref,
  systemLine,
  title,
}: AdminPanelSwitcherProps) {
  const fallbackPanelId = panels[0]?.id ?? "";
  const signOutTitleId = useId();
  const signOutDescriptionId = useId();
  const panelIds = useMemo(
    () => new Set(panels.map((panel) => panel.id)),
    [panels],
  );
  const [activePanelId, setActivePanelId] = useState(fallbackPanelId);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [unavailablePanelId, setUnavailablePanelId] = useState<string | null>(
    null,
  );
  const unavailableFallbackPanelId = panelIds.has("launch-readiness")
    ? "launch-readiness"
    : fallbackPanelId;

  const resolvePanelId = useCallback(
    (hash: string) => {
      const panelId = hash.startsWith("#") ? hash.slice(1) : hash;
      return panelIds.has(panelId) ? panelId : null;
    },
    [panelIds],
  );

  const activatePanel = useCallback(
    (panelId: string, mode: "push" | "replace") => {
      if (!panelIds.has(panelId)) {
        return;
      }

      setUnavailablePanelId(null);
      setActivePanelId(panelId);

      const nextUrl = `${window.location.pathname}${window.location.search}#${panelId}`;
      if (mode === "replace") {
        window.history.replaceState(null, "", nextUrl);
        return;
      }

      if (window.location.hash === `#${panelId}`) {
        window.history.replaceState(null, "", nextUrl);
        return;
      }

      window.history.pushState(null, "", nextUrl);
    },
    [panelIds],
  );

  const activateUnavailablePanel = useCallback(
    (panelId: string, mode: "push" | "replace") => {
      if (!unavailableFallbackPanelId) {
        return;
      }

      setUnavailablePanelId(panelId);
      setActivePanelId(unavailableFallbackPanelId);

      const nextUrl = `${window.location.pathname}${window.location.search}#${unavailableFallbackPanelId}`;
      if (mode === "replace") {
        window.history.replaceState(null, "", nextUrl);
        return;
      }

      window.history.pushState(null, "", nextUrl);
    },
    [unavailableFallbackPanelId],
  );

  const activatePanelAnchor = useCallback(
    (panelId: string, anchorId: string) => {
      if (!panelIds.has(panelId)) {
        return;
      }

      setUnavailablePanelId(null);
      setActivePanelId(panelId);

      const nextUrl = `${window.location.pathname}${window.location.search}#${anchorId}`;
      window.history.pushState(null, "", nextUrl);
      window.setTimeout(() => {
        document.getElementById(anchorId)?.scrollIntoView({ block: "start" });
      }, 0);
    },
    [panelIds],
  );

  const syncFromLocation = useCallback(
    (mode: "preserve" | "replace" = "preserve") => {
      const requestedPanelId = panelIdFromHash(window.location.hash);
      const internalAnchorPanelId =
        requestedPanelId &&
        isLaunchReadinessInternalAnchor(requestedPanelId) &&
        panelIds.has("launch-readiness")
          ? "launch-readiness"
          : null;
      const hashPanelId = requestedPanelId
        ? (internalAnchorPanelId ?? resolvePanelId(requestedPanelId))
        : null;
      const nextPanelId =
        hashPanelId ??
        (requestedPanelId ? unavailableFallbackPanelId : fallbackPanelId);

      if (!nextPanelId) {
        return;
      }

      setUnavailablePanelId(
        hashPanelId || internalAnchorPanelId ? null : requestedPanelId,
      );
      setActivePanelId(nextPanelId);

      if (internalAnchorPanelId) {
        if (!requestedPanelId) {
          return;
        }
        const anchorId = requestedPanelId;
        window.setTimeout(() => {
          document.getElementById(anchorId)?.scrollIntoView({ block: "start" });
        }, 0);
        return;
      }

      if (!hashPanelId && mode === "replace") {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}#${nextPanelId}`,
        );
      }
    },
    [fallbackPanelId, panelIds, resolvePanelId, unavailableFallbackPanelId],
  );

  useEffect(() => {
    syncFromLocation("replace");

    const handleHistoryChange = () => syncFromLocation();

    window.addEventListener("hashchange", handleHistoryChange);
    window.addEventListener("popstate", handleHistoryChange);

    return () => {
      window.removeEventListener("hashchange", handleHistoryChange);
      window.removeEventListener("popstate", handleHistoryChange);
    };
  }, [syncFromLocation]);

  useEffect(() => {
    if (!panelIds.has(activePanelId) && fallbackPanelId) {
      setActivePanelId(fallbackPanelId);
    }
  }, [activePanelId, fallbackPanelId, panelIds]);

  useEffect(() => {
    if (!isSignOutDialogOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSignOutDialogOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSignOutDialogOpen]);

  function panelRequestFromHref(href: string) {
    if (href.startsWith("#")) {
      const requestedPanelId = panelIdFromHash(href);
      if (
        requestedPanelId &&
        isLaunchReadinessInternalAnchor(requestedPanelId)
      ) {
        return panelIds.has("launch-readiness")
          ? {
              anchorId: requestedPanelId,
              panelId: "launch-readiness",
              requestedPanelId,
            }
          : null;
      }
      return requestedPanelId
        ? { panelId: resolvePanelId(requestedPanelId), requestedPanelId }
        : null;
    }

    try {
      const targetUrl = new URL(href, window.location.href);
      const samePage =
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname === window.location.pathname;

      const requestedPanelId = panelIdFromHash(targetUrl.hash);
      if (
        samePage &&
        requestedPanelId &&
        isLaunchReadinessInternalAnchor(requestedPanelId)
      ) {
        return panelIds.has("launch-readiness")
          ? {
              anchorId: requestedPanelId,
              panelId: "launch-readiness",
              requestedPanelId,
            }
          : null;
      }
      return samePage && requestedPanelId
        ? { panelId: resolvePanelId(requestedPanelId), requestedPanelId }
        : null;
    } catch {
      return null;
    }
  }

  function handleSwitchableLinkClick(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      !(event.target instanceof Element)
    ) {
      return;
    }

    const anchor = event.target.closest("a");
    const href = anchor?.getAttribute("href");

    if (!anchor || !href || anchor.target || anchor.hasAttribute("download")) {
      return;
    }

    const panelRequest = panelRequestFromHref(href);

    if (!panelRequest) {
      return;
    }

    event.preventDefault();
    if (panelRequest.anchorId && panelRequest.panelId) {
      activatePanelAnchor(panelRequest.panelId, panelRequest.anchorId);
      return;
    }

    if (panelRequest.panelId) {
      activatePanel(panelRequest.panelId, "push");
      return;
    }

    activateUnavailablePanel(panelRequest.requestedPanelId, "push");
  }

  const activePanel =
    panels.find((panel) => panel.id === activePanelId) ?? panels[0] ?? null;

  return (
    <main
      className={`operator-console ${className}`}
      onClickCapture={handleSwitchableLinkClick}
    >
      <aside
        className="operator-sidebar"
        aria-label="运营导航 / Operator navigation"
      >
        <a
          className="operator-brand"
          href={homeHref}
          aria-label="SkillHub home"
        >
          <span className="operator-brand__mark">S</span>
          <span>SkillHub</span>
        </a>

        <nav
          className="operator-nav"
          role="tablist"
          aria-label="后台模块 / Admin panels"
        >
          {navGroups.map((group) => (
            <section className="operator-nav__group" key={group.label.en}>
              <h2>{bilingual(group.label, "operator-nav__group-label")}</h2>
              {group.items.map((item) => {
                const panelId = item.href.startsWith("#")
                  ? resolvePanelId(item.href)
                  : null;
                const isActive = panelId === activePanel?.id;

                return (
                  <a
                    aria-controls={
                      panelId ? `admin-panel-${panelId}` : undefined
                    }
                    aria-selected={panelId ? isActive : undefined}
                    className={
                      isActive
                        ? "operator-nav__item is-active"
                        : "operator-nav__item"
                    }
                    href={item.href}
                    id={panelId ? `admin-tab-${panelId}` : undefined}
                    key={item.label.en}
                    role={panelId ? "tab" : undefined}
                  >
                    <span className="operator-nav__dot" aria-hidden="true" />
                    {bilingual(item.label, "operator-nav__label")}
                    {item.badge ? <b>{item.badge}</b> : null}
                  </a>
                );
              })}
            </section>
          ))}
        </nav>

        <section
          className="operator-docs-card"
          aria-labelledby="operator-docs-title"
        >
          <BookOpen size={16} aria-hidden="true" />
          <h2 id="operator-docs-title">
            {bilingual({ zh: "SkillHub 文档", en: "SkillHub Docs" })}
          </h2>
          <p>
            {bilingual({
              zh: "开发者文档与 API 参考",
              en: "Developer docs and API reference",
            })}
          </p>
          <a href={docsHref}>
            {linkWithArrow({ zh: "查看文档", en: "View Documentation" })}
          </a>
        </section>
        <p className="operator-system-line">
          <span /> {bilingual(systemLine)}
        </p>
      </aside>

      <section className="operator-main" aria-labelledby="operator-title">
        <header className="operator-topbar">
          <h1 id="operator-title">{bilingual(title)}</h1>
          <nav
            className="operator-search"
            aria-label="后台模块快速入口 / Admin module shortcuts"
          >
            <Search size={15} aria-hidden="true" />
            {shortcutItems.map((item) => (
              <a href={item.href} key={item.href}>
                {inlineBilingual(item.label)}
              </a>
            ))}
          </nav>
          <div className="operator-topbar__actions">
            <a className="operator-launch-pill" href={statusHref}>
              {inlineBilingual({ zh: "上线预览", en: "Launch Preview" })}
            </a>
            <span className="operator-env-button" role="status">
              <span /> {inlineBilingual(environmentLabel)}
            </span>
            {showNotifications ? (
              <a
                className="operator-icon-button"
                href="#admin-notifications"
                aria-label="通知投递 / Notifications"
              >
                <Bell size={16} aria-hidden="true" />
                {notificationAttentionCount > 0 ? (
                  <b>{notificationAttentionCount}</b>
                ) : null}
              </a>
            ) : null}
            <a
              className="operator-icon-button"
              href={docsHref}
              aria-label="帮助 / Help"
            >
              <CircleHelp size={16} aria-hidden="true" />
            </a>
            <div
              className="operator-user-menu"
              aria-label="当前运营账号 / Current operator"
            >
              <span>{operatorInitial}</span>
              <strong>{operatorName}</strong>
            </div>
            <button
              className="operator-exit-button"
              onClick={() => setIsSignOutDialogOpen(true)}
              type="button"
            >
              <LogOut size={15} aria-hidden="true" />
              {inlineBilingual({ zh: "退出", en: "Exit" })}
            </button>
          </div>
        </header>

        {isSignOutDialogOpen ? (
          <div className="operator-signout-dialog" role="presentation">
            <button
              aria-label="关闭退出确认 / Close sign out confirmation"
              className="operator-signout-dialog__backdrop"
              onClick={() => setIsSignOutDialogOpen(false)}
              type="button"
            />
            <section
              aria-describedby={signOutDescriptionId}
              aria-labelledby={signOutTitleId}
              aria-modal="true"
              className="operator-signout-dialog__panel"
              role="dialog"
            >
              <button
                aria-label="关闭退出确认 / Close sign out confirmation"
                className="operator-signout-dialog__close"
                onClick={() => setIsSignOutDialogOpen(false)}
                type="button"
              >
                <X size={16} aria-hidden="true" />
              </button>
              <div className="operator-signout-dialog__icon" aria-hidden="true">
                <LogOut size={20} />
              </div>
              <div className="operator-signout-dialog__copy">
                <h2 id={signOutTitleId}>
                  {bilingual({
                    zh: "确认退出 SkillHub？",
                    en: "Sign out of SkillHub?",
                  })}
                </h2>
                <p id={signOutDescriptionId}>
                  {bilingual({
                    zh: "这会清除当前管理员浏览器会话。再次进入后台前，需要重新登录。",
                    en: "This clears the current admin browser session. You will need to sign in again before opening the console.",
                  })}
                </p>
              </div>
              <div className="operator-signout-dialog__actions">
                <button
                  className="secondary-button"
                  onClick={() => setIsSignOutDialogOpen(false)}
                  type="button"
                >
                  {inlineBilingual({ zh: "取消", en: "Cancel" })}
                </button>
                <form action={signOutAction}>
                  <button className="primary-button" type="submit">
                    <LogOut size={15} aria-hidden="true" />
                    <span>
                      {inlineBilingual({ zh: "退出登录", en: "Sign out" })}
                    </span>
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : null}

        <section
          className="operator-status-strip"
          aria-label="上线预览状态 / Launch preview status"
        >
          {statusStrip.map((item) => (
            <article
              className={`operator-status-item operator-status-item--${item.tone}`}
              key={item.label.en}
            >
              <span>{bilingual(item.label)}</span>
              <strong>{bilingual(item.state)}</strong>
              <p title={`${item.detail.zh} / ${item.detail.en}`}>
                {bilingual(item.title)}
              </p>
            </article>
          ))}
        </section>

        <section
          className="operator-admin-live"
          aria-label="管理员待处理事项 / Admin work items"
        >
          <header className="operator-admin-live__head">
            <div>
              <span>
                {bilingual({
                  zh: "管理员待处理事项",
                  en: "Admin work items",
                })}
              </span>
              <h2>{activePanel ? bilingual(activePanel.label) : null}</h2>
            </div>
            <a href={adminDocsHref}>
              {linkWithArrow({ zh: "查看运营文档", en: "View operator docs" })}
            </a>
          </header>

          <div className="operator-panel-workbench">
            {unavailablePanelId ? (
              <div className="operator-panel-notice" role="status">
                {bilingual({
                  zh: `目标模块 ${unavailablePanelId} 当前不可用，已显示可用的后台区域。`,
                  en: `The ${unavailablePanelId} module is unavailable for this session, so an available admin area is shown instead.`,
                })}
              </div>
            ) : null}
            {activePanel ? (
              <section
                aria-labelledby={`admin-tab-${activePanel.id}`}
                className="operator-module-panel"
                id={`admin-panel-${activePanel.id}`}
                role="tabpanel"
              >
                <div className="operator-module-anchor" id={activePanel.id}>
                  {activePanel.content}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function panelIdFromHash(hash: string) {
  if (!hash || hash === "#") {
    return null;
  }

  return hash.startsWith("#") ? hash.slice(1) : hash;
}

function isLaunchReadinessInternalAnchor(value: string) {
  return (
    value.startsWith("readiness-repair-") || value.startsWith("readiness-item-")
  );
}

const statusStrip = [
  {
    label: { zh: "发现", en: "DISCOVERY" },
    state: { zh: "已上线", en: "Live" },
    title: { zh: "公开技能 API", en: "Public Skill API" },
    detail: { zh: "可用", en: "Available" },
    tone: "green",
  },
  {
    label: { zh: "检查", en: "INSPECTION" },
    state: { zh: "已上线", en: "Live" },
    title: { zh: "Manifest 检查", en: "Manifest Inspection" },
    detail: { zh: "可用", en: "Available" },
    tone: "green",
  },
  {
    label: { zh: "运行时", en: "RUNTIME" },
    state: { zh: "密钥受控", en: "Key Gated" },
    title: { zh: "运行调用", en: "Runtime Invocation" },
    detail: { zh: "需要项目密钥", en: "Requires Project Key" },
    tone: "mint",
  },
  {
    label: { zh: "市场", en: "MARKETPLACE" },
    state: { zh: "预发布", en: "Prelaunch" },
    title: { zh: "付费市场", en: "Paid Marketplace" },
    detail: { zh: "预发布", en: "Prelaunch" },
    tone: "muted",
  },
];

function bilingual({ en, zh }: AdminSwitcherText, className = "operator-bi") {
  return (
    <span className={className}>
      <span>{zh}</span>
      <small>{en}</small>
    </span>
  );
}

function inlineBilingual(text: AdminSwitcherText) {
  return bilingual(text, "operator-bi operator-bi--inline");
}

function linkWithArrow(label: AdminSwitcherText) {
  return (
    <>
      {inlineBilingual(label)}
      <span aria-hidden="true"> -&gt;</span>
    </>
  );
}
