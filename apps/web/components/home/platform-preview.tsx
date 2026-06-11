"use client";

import { useState } from "react";
import { Search, ShieldCheck, Zap, FileJson, Globe, Lock } from "lucide-react";

type Props = {
  locale: "en" | "zh";
};

const tabs = {
  en: ["Registry", "Manifest", "Gateway"],
  zh: ["注册表", "Manifest", "网关"],
};

// Fake registry content
function RegistryView({ locale }: Props) {
  const skills = [
    { name: "browser-research-pro", ver: "2.1.0", runtime: "HTTP", verified: true, calls: "12.4k" },
    { name: "crm-enrichment", ver: "1.8.3", runtime: "HTTP", verified: true, calls: "8.7k" },
    { name: "support-triage", ver: "1.3.0", runtime: "HTTP", verified: true, calls: "6.2k" },
    { name: "code-review-assistant", ver: "3.0.1", runtime: "MCP", verified: true, calls: "15.1k" },
    { name: "data-pipeline-orchestrator", ver: "1.1.0", runtime: "HTTP", verified: false, calls: "3.4k" },
    { name: "financial-report-analyzer", ver: "2.0.0", runtime: "MCP", verified: true, calls: "9.8k" },
  ];

  return (
    <div className="space-y-0">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <Search size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-body-sm text-[var(--color-text-muted)]">
          {locale === "zh" ? "搜索技能..." : "Search skills..."}
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_80px_60px_70px_70px] gap-2 px-4 py-2 border-b border-[var(--color-border)]">
        <span className="text-caption text-[var(--color-text-muted)]">Name</span>
        <span className="text-caption text-[var(--color-text-muted)]">Version</span>
        <span className="text-caption text-[var(--color-text-muted)]">Runtime</span>
        <span className="text-caption text-[var(--color-text-muted)]">Status</span>
        <span className="text-caption text-[var(--color-text-muted)] text-right">Calls</span>
      </div>

      {/* Rows */}
      {skills.map((s) => (
        <div
          key={s.name}
          className="grid grid-cols-[1fr_80px_60px_70px_70px] gap-2 px-4 py-2.5 border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
        >
          <span className="text-body-sm text-[var(--color-text-primary)] truncate">{s.name}</span>
          <span className="text-caption text-[var(--color-text-muted)] self-center">{s.ver}</span>
          <span className="text-caption text-[var(--color-text-muted)] self-center">{s.runtime}</span>
          <span className="self-center">
            {s.verified ? (
              <span className="inline-flex items-center gap-1 text-caption text-[var(--color-verified)]">
                <ShieldCheck size={10} /> Verified
              </span>
            ) : (
              <span className="text-caption text-[var(--color-text-muted)]">Pending</span>
            )}
          </span>
          <span className="text-caption text-[var(--color-text-secondary)] text-right self-center">{s.calls}</span>
        </div>
      ))}
    </div>
  );
}

function ManifestView() {
  const yaml = `name: browser-research-pro
version: 2.1.0
runtime: http
publisher: skillhub-labs

permissions:
  - network:outbound
  - storage:read

input:
  type: object
  properties:
    query:
      type: string
      description: Research topic
    depth:
      type: integer
      default: 3
    format:
      type: string
      enum: [structured, summary, raw]

output:
  type: object
  properties:
    summary: { type: string }
    sources: { type: array }
    confidence: { type: number }

trust:
  verified: true
  security_scan: passed
  human_review: approved`;

  return (
    <div className="p-4 font-mono text-[12px] leading-[1.7] text-[var(--color-text-secondary)] overflow-y-auto max-h-[340px]">
      <pre className="whitespace-pre">{yaml}</pre>
    </div>
  );
}

function GatewayView({ locale }: Props) {
  return (
    <div className="p-4 space-y-4">
      {/* Request */}
      <div>
        <p className="text-caption text-[var(--color-text-muted)] mb-2">REQUEST</p>
        <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] p-3 font-mono text-[12px] leading-[1.7]">
          <span className="text-[var(--color-accent)]">POST</span>{" "}
          <span className="text-[var(--color-text-secondary)]">/v1/invoke/browser-research-pro</span>
          {"\n"}
          <span className="text-[var(--color-text-muted)]">Authorization: Bearer sk_proj_***</span>
          {"\n"}
          <span className="text-[var(--color-text-muted)]">Content-Type: application/json</span>
          {"\n\n"}
          <span className="text-[var(--color-text-secondary)]">{`{"query": "AI frameworks", "depth": 3}`}</span>
        </div>
      </div>

      {/* Response */}
      <div>
        <p className="text-caption text-[var(--color-text-muted)] mb-2">RESPONSE</p>
        <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] p-3 font-mono text-[12px] leading-[1.7]">
          <span className="text-[var(--color-verified)]">200 OK</span>
          <span className="text-[var(--color-text-muted)]"> · 2.1s · 12 sources</span>
          {"\n\n"}
          <span className="text-[var(--color-text-secondary)]">{`{
  "summary": "...",
  "sources": [...],
  "confidence": 0.94,
  "usage": { "cost": "$0.012" }
}`}</span>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4 pt-2">
        <span className="inline-flex items-center gap-1.5 text-caption text-[var(--color-text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-verified)]" />
          {locale === "zh" ? "限流: 正常" : "Rate limit: OK"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-caption text-[var(--color-text-muted)]">
          <Lock size={10} />
          {locale === "zh" ? "项目级隔离" : "Project-scoped"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-caption text-[var(--color-text-muted)]">
          <Globe size={10} />
          {locale === "zh" ? "区域: 自动" : "Region: auto"}
        </span>
      </div>
    </div>
  );
}

export function PlatformPreview({ locale }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const tabLabels = tabs[locale];

  return (
    <div className="platform-preview">
      {/* Top bar */}
      <div className="platform-preview-bar">
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-[var(--color-text-muted)]">
            {locale === "zh" ? "项目" : "Project"}{" "}
            <span className="text-[var(--color-text-subtle)]">/</span>{" "}
            <span className="text-[var(--color-text-primary)]">my-agent</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[var(--color-surface-3)]" />
          <span className="text-caption text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1">
            Share
          </span>
        </div>
      </div>

      {/* Tab row */}
      <div className="platform-preview-tabs">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            className={`tab-pill ${activeTab === i ? "tab-pill-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="platform-preview-content">
        {activeTab === 0 && <RegistryView locale={locale} />}
        {activeTab === 1 && <ManifestView />}
        {activeTab === 2 && <GatewayView locale={locale} />}
      </div>
    </div>
  );
}
