"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { localizedHref, type Locale } from "@/lib/locale-routing";

type PublisherWorkspaceTabId = "skills" | "account" | "payout" | "demand";

type PublisherWorkspaceTabsProps = {
  accountPanel: ReactNode;
  demandPanel: ReactNode;
  locale: Locale;
  payoutPanel: ReactNode;
  skillsPanel: ReactNode;
};

const hashToTab: Record<string, PublisherWorkspaceTabId> = {
  "publisher-account": "account",
  "publisher-adjustments": "payout",
  "publisher-demand": "demand",
  "publisher-paid-readiness": "payout",
  "publisher-payout": "payout",
  "publisher-skills": "skills",
};

const tabCopy = {
  en: {
    label: "Publisher workspace sections",
    tabs: {
      skills: "Next / skills",
      account: "Account profile",
      payout: "Payout and paid readiness",
      demand: "Demand and notifications",
    },
  },
  zh: {
    label: "发布者工作台分区",
    tabs: {
      skills: "下一步/技能",
      account: "账号资料",
      payout: "收款与商业准备",
      demand: "需求与通知",
    },
  },
} as const;

const tabs: Array<{ hash: string; id: PublisherWorkspaceTabId }> = [
  { id: "skills", hash: "publisher-skills" },
  { id: "account", hash: "publisher-account" },
  { id: "payout", hash: "publisher-payout" },
  { id: "demand", hash: "publisher-demand" },
];

export function PublisherWorkspaceTabs({
  accountPanel,
  demandPanel,
  locale,
  payoutPanel,
  skillsPanel,
}: PublisherWorkspaceTabsProps) {
  const labels = tabCopy[locale];
  const [activeTab, setActiveTab] = useState<PublisherWorkspaceTabId>("skills");
  const panels = useMemo(
    () => ({
      account: accountPanel,
      demand: demandPanel,
      payout: payoutPanel,
      skills: skillsPanel,
    }),
    [accountPanel, demandPanel, payoutPanel, skillsPanel],
  );

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(getTabFromHash(window.location.hash));
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  const handleTabClick = (
    event: MouseEvent<HTMLAnchorElement>,
    tab: { hash: string; id: PublisherWorkspaceTabId },
  ) => {
    event.preventDefault();
    setActiveTab(tab.id);
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${tab.hash}`);
  };

  return (
    <section className="publisher-workspace-tabs" aria-label={labels.label}>
      <nav className="publisher-tab-list" aria-label={labels.label} role="tablist">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <a
              aria-controls={`publisher-tab-panel-${tab.id}`}
              aria-selected={active}
              className={active ? "publisher-tab publisher-tab--active" : "publisher-tab"}
              href={localizedHref(`/publisher#${tab.hash}`, locale)}
              id={`publisher-tab-${tab.id}`}
              key={tab.id}
              onClick={(event) => handleTabClick(event, tab)}
              role="tab"
            >
              {labels.tabs[tab.id]}
            </a>
          );
        })}
      </nav>

      {tabs.map((tab) => (
        <div
          aria-labelledby={`publisher-tab-${tab.id}`}
          className="publisher-tab-panel"
          hidden={tab.id !== activeTab}
          id={`publisher-tab-panel-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          {panels[tab.id]}
        </div>
      ))}
    </section>
  );
}

function getTabFromHash(hash: string): PublisherWorkspaceTabId {
  const normalized = hash.replace(/^#/, "").split("?")[0];

  return hashToTab[normalized] ?? "skills";
}
