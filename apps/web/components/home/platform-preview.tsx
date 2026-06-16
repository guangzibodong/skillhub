"use client";

import { useState } from "react";
import { Search, ShieldCheck, Globe, Lock, Zap } from "lucide-react";

type Props = {
  locale: "en" | "zh";
};

const tabLabels = {
  en: ["Skill API", "Manifest", "Gateway"],
  zh: ["技能 API", "Manifest", "网关"],
};

export function PlatformPreview({ locale }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = tabLabels[locale];

  return (
    <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden shadow-[0_0_80px_rgba(127,238,100,0.04)]">
      {/* App header bar (like Morphic's "Project / Untitled" bar) */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-[#7fee64] flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">S</span>
          </div>
          <span className="text-[13px] text-[#999]">SkillHub</span>
          <span className="text-[13px] text-[#525252]">/</span>
          <span className="text-[13px] text-white">Skill API</span>
        </div>
        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
            <span className="text-[9px] text-[#999]">U</span>
          </div>
          <span className="text-[12px] text-[#666] bg-[#292929] px-2.5 py-1 rounded-[6px]">Share</span>
        </div>
      </div>

      {/* Tab row (like Morphic's Canvas / Copilot / Compose tabs) */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] px-5">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-all -mb-[1px] ${
              activeTab === i
                ? "text-white border-white"
                : "text-[#666] border-transparent hover:text-[#999]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="min-h-[400px]">
        {activeTab === 0 && <RegistryContent locale={locale} />}
        {activeTab === 1 && <ManifestContent />}
        {activeTab === 2 && <GatewayContent locale={locale} />}
      </div>
    </div>
  );
}

function RegistryContent({ locale }: Props) {
  const skills = [
    { name: "browser-research-pro", ver: "2.1.0", runtime: "HTTP", verified: true, calls: "12.4k", publisher: "SkillHub Labs" },
    { name: "crm-enrichment", ver: "1.8.3", runtime: "HTTP", verified: true, calls: "8.7k", publisher: "Revenue Tools" },
    { name: "support-triage", ver: "1.3.0", runtime: "HTTP", verified: true, calls: "6.2k", publisher: "NexusAI" },
    { name: "code-review-assistant", ver: "3.0.1", runtime: "MCP", verified: true, calls: "15.1k", publisher: "DevOps Guild" },
    { name: "data-pipeline-orchestrator", ver: "1.1.0", runtime: "HTTP", verified: false, calls: "3.4k", publisher: "DevOps Guild" },
    { name: "financial-report-analyzer", ver: "2.0.0", runtime: "MCP", verified: true, calls: "9.8k", publisher: "Analyst Forge" },
  ];

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <Search size={14} className="text-[#525252]" />
        <span className="text-[13px] text-[#525252]">
          {locale === "zh" ? "按能力、运行时或发布者搜索..." : "Search by capability, runtime, or publisher..."}
        </span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_100px_70px_80px_80px_80px] gap-2 px-5 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[#1a1a1a]">
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em]">Skill</span>
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em]">Publisher</span>
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em]">Version</span>
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em]">Runtime</span>
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em]">Status</span>
        <span className="text-[11px] font-medium text-[#525252] uppercase tracking-[0.05em] text-right">Calls</span>
      </div>

      {/* Rows */}
      {skills.map((s) => (
        <div
          key={s.name}
          className="grid grid-cols-[1fr_100px_70px_80px_80px_80px] gap-2 px-5 py-3 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <span className="text-[13px] text-white font-medium truncate">{s.name}</span>
          <span className="text-[11px] text-[#666] self-center truncate">{s.publisher}</span>
          <span className="text-[11px] text-[#666] self-center font-mono">{s.ver}</span>
          <span className="self-center">
            <span className="text-[10px] text-[#999] bg-[#292929] px-2 py-0.5 rounded-[4px] font-mono">{s.runtime}</span>
          </span>
          <span className="self-center">
            {s.verified ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981]">
                <ShieldCheck size={10} /> Verified
              </span>
            ) : (
              <span className="text-[10px] text-[#666]">Pending</span>
            )}
          </span>
          <span className="text-[12px] text-[#999] text-right self-center font-mono">{s.calls}</span>
        </div>
      ))}
    </div>
  );
}

function ManifestContent() {
  return (
    <pre className="p-6 font-mono text-[12px] leading-[1.8] text-[#999] overflow-auto max-h-[400px]">
      <code>{`name: browser-research-pro
version: 2.1.0
displayName: Browser Research Pro
publisher: skillhub-labs
runtime: http
description: Deep web research with multi-source extraction

permissions:
  - network:outbound
  - storage:read

pricing:
  model: per-call
  price: $0.012

input:
  type: object
  required: [query]
  properties:
    query:
      type: string
      description: Research topic or question
    depth:
      type: integer
      default: 3
      minimum: 1
      maximum: 10
    format:
      type: string
      enum: [structured, summary, raw]
      default: structured

output:
  type: object
  properties:
    summary:
      type: string
    sources:
      type: array
      items:
        type: object
        properties:
          url: { type: string }
          title: { type: string }
          relevance: { type: number }
    confidence:
      type: number
      minimum: 0
      maximum: 1

trust:
  verification: verified
  security_scan: passed
  human_review: approved
  last_audit: 2026-01-15`}</code>
    </pre>
  );
}

function GatewayContent({ locale }: Props) {
  return (
    <div className="p-6 space-y-5">
      {/* Request */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium text-[#525252] uppercase tracking-[0.05em]">Request</span>
          <span className="text-[10px] text-[#7fee64] bg-[rgba(127,238,100,0.1)] px-2 py-0.5 rounded-[4px]">POST</span>
        </div>
        <div className="bg-[#1a1a1a] rounded-[10px] p-4 font-mono text-[12px] leading-[1.7]">
          <p className="text-[#999]">POST /v1/invoke/browser-research-pro</p>
          <p className="text-[#525252]">Host: api.skillhub.dev</p>
          <p className="text-[#525252]">Authorization: Bearer sk_proj_***</p>
          <p className="text-[#525252]">Content-Type: application/json</p>
          <p className="text-[#525252] mt-2">{`{`}</p>
          <p className="text-[#999] pl-4">{`"query": "AI agent frameworks 2026",`}</p>
          <p className="text-[#999] pl-4">{`"depth": 3,`}</p>
          <p className="text-[#999] pl-4">{`"format": "structured"`}</p>
          <p className="text-[#525252]">{`}`}</p>
        </div>
      </div>

      {/* Response */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium text-[#525252] uppercase tracking-[0.05em]">Response</span>
          <span className="text-[10px] text-[#10b981] bg-[rgba(16,185,129,0.1)] px-2 py-0.5 rounded-[4px]">200 OK</span>
          <span className="text-[10px] text-[#525252]">· 2.1s · 12 sources</span>
        </div>
        <div className="bg-[#1a1a1a] rounded-[10px] p-4 font-mono text-[12px] leading-[1.7]">
          <p className="text-[#525252]">{`{`}</p>
          <p className="text-[#999] pl-4">{`"summary": "Comprehensive overview of ...",`}</p>
          <p className="text-[#999] pl-4">{`"sources": [ { "url": "...", "title": "...", "relevance": 0.95 }, ... ],`}</p>
          <p className="text-[#999] pl-4">{`"confidence": 0.94,`}</p>
          <p className="text-[#999] pl-4">{`"usage": { "cost": "$0.012", "duration_ms": 2100 }`}</p>
          <p className="text-[#525252]">{`}`}</p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-5 pt-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#666]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          Rate limit OK
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#666]">
          <Lock size={10} className="text-[#525252]" />
          Project-scoped
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#666]">
          <Globe size={10} className="text-[#525252]" />
          Region: auto
        </span>
      </div>
    </div>
  );
}
