"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type DocsCodeBlockProps = {
  label?: string;
  locale: Locale;
  value: string;
};

export function DocsCodeBlock({ label, locale, value }: DocsCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copyLabel = locale === "zh" ? "复制" : "Copy";
  const copiedLabel = locale === "zh" ? "已复制" : "Copied";

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="code-block">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.08)] px-4 py-2">
        <span className="text-xs text-[#999]">{label ?? "Code"}</span>
        <button
          className="secondary-button secondary-button--compact"
          onClick={copyCode}
          type="button"
        >
          {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          <span>{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code>{value}</code>
      </pre>
    </div>
  );
}
