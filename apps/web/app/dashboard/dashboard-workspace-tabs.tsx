"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Tabs } from "antd";
import type { Locale } from "@/lib/i18n";

export type DashboardWorkspaceTabId =
  | "overview"
  | "developer"
  | "publisher"
  | "finance"
  | "notifications";

type DashboardWorkspaceTabsProps = {
  developer: ReactNode;
  finance: ReactNode;
  locale: Locale;
  notifications: ReactNode;
  overview: ReactNode;
  publisher: ReactNode;
};

const tabIds: DashboardWorkspaceTabId[] = [
  "overview",
  "developer",
  "publisher",
  "finance",
  "notifications",
];

const copy = {
  en: {
    developer: "Developer",
    finance: "Finance",
    notifications: "Notifications",
    overview: "Overview",
    publisher: "Publisher",
  },
  zh: {
    developer: "开发者",
    finance: "财务",
    notifications: "通知",
    overview: "总览",
    publisher: "发布者",
  },
} as const;

function readHashTab(): DashboardWorkspaceTabId {
  if (typeof window === "undefined") {
    return "overview";
  }

  const hash = window.location.hash.replace(/^#/, "");

  return tabIds.includes(hash as DashboardWorkspaceTabId)
    ? (hash as DashboardWorkspaceTabId)
    : "overview";
}

export function DashboardWorkspaceTabs({
  developer,
  finance,
  locale,
  notifications,
  overview,
  publisher,
}: DashboardWorkspaceTabsProps) {
  const [activeTab, setActiveTab] =
    useState<DashboardWorkspaceTabId>("overview");
  const labels = copy[locale];
  const panels: Record<DashboardWorkspaceTabId, ReactNode> = {
    developer,
    finance,
    notifications,
    overview,
    publisher,
  };

  useEffect(() => {
    const syncFromHash = () => setActiveTab(readHashTab());

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  function selectTab(tab: DashboardWorkspaceTabId) {
    setActiveTab(tab);

    const nextUrl = `${window.location.pathname}${window.location.search}#${tab}`;
    window.history.pushState(null, "", nextUrl);
  }

  return (
    <section className="dashboard-workspace-tabs" aria-label="Dashboard workspace">
      <Tabs
        activeKey={activeTab}
        className="dashboard-workspace-tabs__antd"
        items={tabIds.map((tab) => ({
          children: <div className="dashboard-workspace-tabs__panel">{panels[tab]}</div>,
          key: tab,
          label: labels[tab],
        }))}
        onChange={(key) => selectTab(key as DashboardWorkspaceTabId)}
      />
    </section>
  );
}
