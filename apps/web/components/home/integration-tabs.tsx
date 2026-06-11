"use client";

import { useState } from "react";

type IntegrationTabsClientProps = {
  tabs: string[];
  configs: Record<string, string>;
  desc: string;
};

export function IntegrationTabsClient({ tabs, configs, desc }: IntegrationTabsClientProps) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div>
      {/* Tab row */}
      <div className="flex flex-wrap gap-1 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`tab ${active === tab ? "tab-active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="card-lg p-0 overflow-hidden">
        <div className="p-6 font-mono text-[13px] leading-[1.75] text-[#e5e7eb] whitespace-pre overflow-x-auto">
          {configs[active] || configs[tabs[0]]}
        </div>
      </div>

      {/* Description */}
      <p className="text-body text-[var(--color-text-secondary)] mt-6 max-w-xl">
        {desc}
      </p>
    </div>
  );
}
