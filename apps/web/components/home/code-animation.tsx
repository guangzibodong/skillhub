"use client";

import { useState, useEffect, useRef } from "react";

const codeLines = [
  { text: "import { SkillHub } from '@useskillhub/sdk';", color: "muted" },
  { text: "", color: "white" },
  { text: "const hub = new SkillHub({", color: "white" },
  { text: "  apiKey: process.env.SKILLHUB_KEY,", color: "purple" },
  { text: "});", color: "white" },
  { text: "", color: "white" },
  { text: "const result = await hub.invoke({", color: "white" },
  { text: '  skill: "browser-research-pro",', color: "cyan" },
  { text: "  input: {", color: "white" },
  { text: '    query: "AI agent frameworks 2026",', color: "green" },
  { text: "    depth: 3,", color: "purple" },
  { text: '    format: "structured"', color: "purple" },
  { text: "  }", color: "white" },
  { text: "});", color: "white" },
  { text: "", color: "white" },
  { text: "console.log(result.summary);", color: "white" },
  { text: "// ✓ 12 sources · 2.1s · verified", color: "green" },
];

const colorMap: Record<string, string> = {
  white: "text-[#e2e8f0]",
  purple: "text-[#a78bfa]",
  cyan: "text-[#67e8f9]",
  green: "text-[#6ee7b7]",
  muted: "text-[#4a5568]",
};

export function CodeAnimation() {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const totalChars = codeLines.reduce((sum, line) => sum + line.text.length + 1, 0);

  useEffect(() => {
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
    }, 25);

    return () => clearInterval(timer);
  }, [totalChars]);

  const getVisibleContent = () => {
    let remaining = visibleChars;
    const result: Array<{ text: string; color: string }> = [];

    for (const line of codeLines) {
      const lineLength = line.text.length + 1;
      if (remaining <= 0) break;

      if (remaining >= lineLength) {
        result.push({ text: line.text, color: line.color });
        remaining -= lineLength;
      } else {
        result.push({ text: line.text.slice(0, remaining), color: line.color });
        remaining = 0;
      }
    }
    return result;
  };

  const content = getVisibleContent();

  return (
    <div className="relative glass-card rounded-2xl overflow-hidden">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
            agent.ts
          </span>
        </div>
        <div className="w-[54px]" /> {/* Balance spacing */}
      </div>

      {/* Code content */}
      <div className="p-6 font-mono text-[13px] leading-[1.8] min-h-[380px]">
        {content.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none text-[var(--color-text-muted)] w-7 text-right mr-5 text-[11px] leading-[1.8] opacity-50">
              {i + 1}
            </span>
            <span className={colorMap[line.color]}>
              {line.text}
            </span>
          </div>
        ))}
        {!isComplete && (
          <div className="flex">
            <span className="select-none w-7 mr-5" />
            <span className="inline-block w-[2px] h-[18px] bg-[var(--color-accent-purple)] animate-pulse rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
