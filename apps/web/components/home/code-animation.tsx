"use client";

import { useState, useEffect, useRef } from "react";

const codeLines = [
  { text: "const skill = await skillhub.invoke({", color: "white" },
  { text: '  name: "browser-research-pro",', color: "purple" },
  { text: '  version: "1.2.0",', color: "cyan" },
  { text: "  input: {", color: "white" },
  { text: '    query: "Latest AI agent frameworks 2026",', color: "green" },
  { text: "    depth: 3,", color: "cyan" },
  { text: "    format: \"structured\"", color: "cyan" },
  { text: "  }", color: "white" },
  { text: "});", color: "white" },
  { text: "", color: "white" },
  { text: "// Response", color: "muted" },
  { text: "// ✓ 12 sources analyzed in 2.3s", color: "green" },
  { text: "// ✓ Verification: passed", color: "green" },
  { text: "// ✓ Permission scope: web.search, web.fetch", color: "green" },
];

const colorMap: Record<string, string> = {
  white: "text-[var(--color-text-primary)]",
  purple: "text-[var(--color-accent-purple)]",
  cyan: "text-[var(--color-accent-cyan)]",
  green: "text-[var(--color-accent-green)]",
  muted: "text-[var(--color-text-muted)]",
};

export function CodeAnimation() {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalChars = codeLines.reduce((sum, line) => sum + line.text.length + 1, 0);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisibleChars(totalChars);
      setIsComplete(true);
      return;
    }

    let charCount = 0;
    const timer = setInterval(() => {
      charCount += 2;
      if (charCount >= totalChars) {
        setVisibleChars(totalChars);
        setIsComplete(true);
        clearInterval(timer);
      } else {
        setVisibleChars(charCount);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [totalChars]);

  // Build visible text from character count
  const getVisibleContent = () => {
    let remaining = visibleChars;
    const result: Array<{ text: string; color: string; full: boolean }> = [];

    for (const line of codeLines) {
      const lineLength = line.text.length + 1; // +1 for newline
      if (remaining <= 0) break;

      if (remaining >= lineLength) {
        result.push({ text: line.text, color: line.color, full: true });
        remaining -= lineLength;
      } else {
        result.push({ text: line.text.slice(0, remaining), color: line.color, full: false });
        remaining = 0;
      }
    }
    return result;
  };

  const content = getVisibleContent();

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card-solid)] overflow-hidden"
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-auto text-[11px] font-mono text-[var(--color-text-muted)]">
          skillhub-demo.ts
        </span>
      </div>

      {/* Code content */}
      <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[320px]">
        {content.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none text-[var(--color-text-muted)] w-8 text-right mr-4 text-[11px] leading-relaxed">
              {i + 1}
            </span>
            <span className={colorMap[line.color]}>
              {line.text}
            </span>
          </div>
        ))}
        {!isComplete && (
          <div className="flex">
            <span className="select-none text-[var(--color-text-muted)] w-8 text-right mr-4 text-[11px]" />
            <span className="inline-block w-[2px] h-[18px] bg-[var(--color-accent-purple)] animate-pulse" />
          </div>
        )}
      </div>

      {/* Glow overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--color-bg-card-solid)] to-transparent pointer-events-none" />
    </div>
  );
}
