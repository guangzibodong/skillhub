"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SkillSummary } from "@useskillhub/schema";
import { Search } from "lucide-react";

type Locale = "en" | "zh";

type AgentItem = {
  name: string;
  logo: string;
  logoKey: "codex" | "claude" | "gemini" | "copilot" | "openclaw" | "hermes";
};

type PreviewSkill = {
  initial: string;
  title: string;
  slug: string;
  version: string;
  meta: string;
  search: string;
  description: Record<Locale, string>;
  permissions: string[];
  checks: [string, string][];
  runtime: [string, string, string][];
  audit: [string, string][];
};

type HomeProductPreviewProps = {
  locale: Locale;
  leadSkill: SkillSummary;
  agents: AgentItem[];
  verifiedLabel: string;
};

const tabs = ["Manifest", "Schema", "Permissions", "Examples"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildPreviewSkills(leadSkill: SkillSummary): PreviewSkill[] {
  return [
    {
      initial: leadSkill.displayName
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "BR",
      title: leadSkill.displayName,
      slug: leadSkill.slug,
      version: leadSkill.version,
      meta: "web.search · citations",
      search: "browser.search / source citations",
      description: {
        en: "A web research Skill for agents. Inspect inputs, outputs, permissions, runtime protocols, publisher, and review state before adoption.",
        zh: "面向 Agent 的网页研究 Skill。接入前先看清输入输出、权限范围、运行方式、发布者和审核状态。",
      },
      permissions: ["web.search", "web.fetch"],
      checks: [
        ["Manifest", "schema checked"],
        ["Policy", "web.fetch allowed"],
        ["Publisher", "SkillHub Labs"],
      ],
      runtime: [
        ["Project Key", "required", "sk_live_project_************"],
        ["Policy Gate", "allowed", "Audit trace locked"],
        ["Live invoke", "p95 1.2s", "meter"],
      ],
      audit: [
        ["10:42", "Codex requested browser-research"],
        ["10:42", "Manifest and policy passed"],
        ["10:43", "Structured result returned"],
      ],
    },
    {
      initial: "CR",
      title: "Codebase Risk Scanner",
      slug: "codebase-risk-scanner",
      version: "1.2.0",
      meta: "repo · policy · audit",
      search: "repo.audit / dependency policy",
      description: {
        en: "Scan repositories for risky changes, dependency drift, and policy gaps before an agent opens a pull request.",
        zh: "在 Agent 提交 PR 之前扫描仓库风险、依赖漂移和策略缺口。",
      },
      permissions: ["repo.read", "code.scan", "audit.write"],
      checks: [
        ["Schema", "inputs locked"],
        ["Policy", "repo.read scoped"],
        ["Output", "risk report typed"],
      ],
      runtime: [
        ["Project Key", "required", "sk_repo_project_************"],
        ["Policy Gate", "scoped", "Branch rules checked"],
        ["Live invoke", "p95 2.4s", "meter"],
      ],
      audit: [
        ["11:08", "Claude requested repo scan"],
        ["11:09", "Dependency policy passed"],
        ["11:10", "Risk summary returned"],
      ],
    },
    {
      initial: "IE",
      title: "Invoice Extraction",
      slug: "invoice-extraction",
      version: "0.9.7",
      meta: "finance · schema",
      search: "invoice.schema / finance ops",
      description: {
        en: "Extract invoice fields into typed JSON while preserving source confidence, validation notes, and operator review status.",
        zh: "把发票字段提取为类型化 JSON，同时保留置信度、校验备注和人工复核状态。",
      },
      permissions: ["file.read", "document.parse"],
      checks: [
        ["Manifest", "PII flagged"],
        ["Policy", "file.read gated"],
        ["Review", "operator required"],
      ],
      runtime: [
        ["Project Key", "required", "sk_fin_project_************"],
        ["Policy Gate", "review", "PII policy active"],
        ["Live invoke", "p95 1.8s", "meter"],
      ],
      audit: [
        ["12:16", "Gemini parsed invoice batch"],
        ["12:17", "Schema validation complete"],
        ["12:18", "Review queue updated"],
      ],
    },
    {
      initial: "DS",
      title: "Dataset Summarizer",
      slug: "dataset-summarizer",
      version: "0.8.4",
      meta: "data · analysis",
      search: "dataset.summary / anomaly checks",
      description: {
        en: "Turn spreadsheet rows into anomalies, segments, metric deltas, and follow-up questions for analysts and agents.",
        zh: "把表格数据整理成异常点、分组、指标变化和后续分析问题，供分析师与 Agent 继续处理。",
      },
      permissions: ["data.read", "analysis.run"],
      checks: [
        ["Schema", "columns mapped"],
        ["Policy", "data.read allowed"],
        ["Runtime", "sandboxed"],
      ],
      runtime: [
        ["Project Key", "required", "sk_data_project_************"],
        ["Policy Gate", "allowed", "No export scope"],
        ["Live invoke", "p95 1.5s", "meter"],
      ],
      audit: [
        ["13:24", "Copilot requested summary"],
        ["13:24", "Column mapping locked"],
        ["13:25", "Anomaly table returned"],
      ],
    },
  ];
}

function buildManifestLines(skill: PreviewSkill) {
  return [
    "{",
    `  \"name\": \"${skill.slug}\",`,
    `  \"version\": \"${skill.version}\",`,
    `  \"runtime\": [\"rest\", \"mcp\"],`,
    `  \"permissions\": [${skill.permissions.map((permission) => `\"${permission}\"`).join(", ")}],`,
    `  \"requiresProjectKey\": true`,
    "}",
  ];
}

export function HomeProductPreview({ locale, leadSkill, agents, verifiedLabel }: HomeProductPreviewProps) {
  const skills = useMemo(() => buildPreviewSkills(leadSkill), [leadSkill]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeSkill = skills[activeIndex];
  const manifestLines = useMemo(() => buildManifestLines(activeSkill), [activeSkill]);
  const activeTab = tabs[activeIndex % tabs.length];
  const hoverFrameRef = useRef<number | null>(null);
  const pendingHoverIndexRef = useRef<number | null>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((index) => (index + 1) % skills.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [reducedMotion, skills.length]);

  useEffect(() => {
    return () => {
      if (hoverFrameRef.current !== null) window.cancelAnimationFrame(hoverFrameRef.current);
    };
  }, []);

  const clearPendingHover = () => {
    pendingHoverIndexRef.current = null;
    if (hoverFrameRef.current === null) return;
    window.cancelAnimationFrame(hoverFrameRef.current);
    hoverFrameRef.current = null;
  };

  const activateSkill = (index: number) => {
    setActiveIndex((current) => (current === index ? current : index));
  };

  const scheduleHoverSkill = (index: number) => {
    if (index === activeIndex) return;
    pendingHoverIndexRef.current = index;
    if (hoverFrameRef.current !== null) return;

    hoverFrameRef.current = window.requestAnimationFrame(() => {
      const nextIndex = pendingHoverIndexRef.current;
      hoverFrameRef.current = null;
      pendingHoverIndexRef.current = null;
      if (nextIndex !== null) activateSkill(nextIndex);
    });
  };

  const codeLines = manifestLines;

  return (
    <section className="home-v3-product-preview home-v3-product-preview--wide" aria-label={locale === "zh" ? "SkillHub 产品预览" : "SkillHub product preview"}>
      <div className="home-v3-product-head">
        <div className="home-v3-crumbs">
          <strong>SkillHub</strong>
          <span>/</span>
          <span>Marketplace</span>
          <span>/</span>
          <span>{activeSkill.slug}</span>
        </div>
        <span className="home-v3-status-pill">runtime gated</span>
      </div>
      <div className="home-v3-product-grid">
        <aside
          className="home-v3-skill-directory"
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
            clearPendingHover();
          }}
        >
          <div className="home-v3-panel-title">
            <span>Skill directory</span>
            <small>{248 + activeIndex * 7}</small>
          </div>
          <div className="home-v3-search-box home-v3-search-box--live">
            <Search size={14} aria-hidden="true" />
            <span>{activeSkill.search}</span>
          </div>
          <div className="home-v3-skill-list home-v3-skill-list--animated">
            {skills.map((skill, index) => {
              const isActive = index === activeIndex;

              return (
                <article
                  className={isActive ? "home-v3-skill-row home-v3-skill-row--active" : "home-v3-skill-row"}
                  key={skill.slug}
                  onMouseEnter={() => scheduleHoverSkill(index)}
                >
                  <span className="home-v3-skill-icon" aria-hidden="true">{skill.initial}</span>
                  <div>
                    <strong>{skill.title}</strong>
                    <small>{skill.meta}</small>
                  </div>
                </article>
              );
            })}
          </div>
        </aside>

        <section className="home-v3-skill-detail">
          <div className="home-v3-agent-strip" aria-label={locale === "zh" ? "支持的 Agent 环境" : "Supported agent environments"}>
            {agents.map((agent) => (
              <span className={`home-v3-agent-badge home-v3-agent-badge--${agent.logoKey}`} key={agent.name}>
                <img src={agent.logo} alt="" aria-hidden="true" />
                <strong>{agent.name}</strong>
              </span>
            ))}
          </div>

          <article className="home-v3-detail-card">
            <header>
              <div>
                <h2>{activeSkill.title}</h2>
                <p>{activeSkill.description[locale]}</p>
              </div>
              <span className="home-v3-verified">{verifiedLabel}</span>
            </header>
            <div className="home-v3-tabs" aria-hidden="true">
              {tabs.map((item) => (
                <span className={item === activeTab ? "home-v3-tab home-v3-tab--active" : "home-v3-tab"} key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="home-v3-manifest">
              <div className="home-v3-code" aria-label={locale === "zh" ? "Manifest 示例" : "Manifest sample"}>
                {codeLines.map((line, index) => (
                  <span key={index}>{line || "\u00a0"}</span>
                ))}
              </div>
              <div className="home-v3-check-grid">
                {activeSkill.checks.map(([label, value]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="home-v3-runtime-inline home-v3-runtime-inline--static">
              {activeSkill.runtime.map(([label, value, detail]) => (
                <div key={label}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                  {detail === "meter" ? <span className="home-v3-meter"><i /></span> : label === "Project Key" ? <code>{detail}</code> : <span>{detail}</span>}
                </div>
              ))}
            </div>
            <div className="home-v3-audit-log" aria-label="Audit log">
              {activeSkill.audit.map(([time, event], index) => (
                <span key={index}>
                  <time>{time}</time>
                  <strong>{event}</strong>
                </span>
              ))}
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}
