"use client";

import { useState, useEffect } from "react";

const codeLines = [
  { text: 'import { SkillHub } from "@useskillhub/sdk";', color: "muted" },
  { text: "", color: "white" },
  { text: "const hub = new SkillHub({", color: "white" },
  { text: '  apiKey: process.env.SKILLHUB_KEY', color: "white" },
  { text: "});", color: "white" },
  { text: "", color: "white" },
  { text: "const result = await hub.invoke({", color: "white" },
  { text: '  skill: "browser-research-pro",', color: "accent" },
  { text: "  input: {", color: "white" },
  { text: '    query: "AI agent frameworks 2026",', color: "white" },
  { text: "    depth: 3,", color: "white" },
  { text: "  }", color: "white" },
  { text: "});", color: "white" },
  { text: "", color: "white" },
  { text: "// ✓ 12 sources · 2.1s · verified", color: "verified" },
];

const colorMap: Record<string, string> = {
  white: "text-[#e5e7eb]",
  muted: "text-[#525252]",
  accent: "text-[var(--color-accent)]",
  verified: "text-[var(--color-verified)]",
};

export function CodeAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);
  const totalLines = codeLines.length;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisibleLines(totalLines);
      return;
    }

    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count >= totalLines) {
        setVisibleLines(totalLines);
        clearInterval(timer);
      } else {
        setVisibleLines(count);
      }
    }, 120);

    return () => clearInterval(timer);
  }, [totalLines]);

  return (
    <div className="card-lg overflow-hidden">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" />
        </div>
        <span className="ml-auto text-caption text-[var(--color-text-muted)] font-mono">
          agent.ts
        </span>
      </div>

      {/* Code */}
      <div className="p-5 font-mono text-[13px] leading-[1.75]">
        {codeLines.slice(0, visibleLines).map((line, i) => (
          <div key={i}>
            <span className={colorMap[line.color]}>{line.text}</span>
          </div>
        ))}
        {visibleLines < totalLines && (
          <span className="inline-block w-[6px] h-[16px] bg-[var(--color-text-muted)] animate-pulse mt-0.5" />
        )}
      </div>
    </div>
  );
}
