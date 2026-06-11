"use client";

import { useEffect, useState } from "react";

const lines = [
  'curl https://api.useskillhub.com/v1/skills/browser-research-pro \\',
  '  -H "Authorization: Bearer sk_proj_..."',
  '',
  '# Response',
  '{',
  '  "slug": "browser-research-pro",',
  '  "displayName": "Browser Research",',
  '  "version": "1.2.0",',
  '  "verificationStatus": "verified",',
  '  "runtime": { "type": "http", "transport": "rest" },',
  '  "permissions": ["web.search", "web.fetch"]',
  '}',
];

export function CodeAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= lines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5 font-mono text-sm overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--color-border-default)]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[var(--color-text-muted)] text-xs">terminal</span>
      </div>

      {/* Code lines */}
      <div className="space-y-1">
        {lines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="flex">
            {i === 0 && <span className="text-[var(--color-accent)] mr-2">$</span>}
            {i > 0 && i < 2 && <span className="text-[var(--color-text-muted)] mr-2">&nbsp;</span>}
            {i === 3 && <span className="text-[var(--color-text-muted)]">{line}</span>}
            {i !== 3 && (
              <span className={
                line.startsWith('  "') ? "text-[var(--color-text-secondary)]" :
                line.startsWith('{') || line.startsWith('}') ? "text-[var(--color-text-muted)]" :
                "text-[var(--color-text-primary)]"
              }>
                {line}
              </span>
            )}
          </div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block w-2 h-4 bg-[var(--color-accent)] animate-pulse" />
        )}
      </div>
    </div>
  );
}
