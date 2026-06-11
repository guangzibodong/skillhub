import type { SkillSummary } from "@useskillhub/schema";
import { Zap, Globe, ShieldCheck, FileJson, Activity, Database } from "lucide-react";

type Props = {
  skill: SkillSummary;
  locale: "en" | "zh";
};

const iconMap: Record<string, React.ReactNode> = {
  "browser-research-pro": <Globe size={20} className="text-[var(--color-accent)]" />,
  "crm-enrichment": <Database size={20} className="text-[var(--color-accent)]" />,
  "support-triage": <Activity size={20} className="text-[var(--color-accent)]" />,
  "code-review-assistant": <FileJson size={20} className="text-[var(--color-accent)]" />,
  "data-pipeline-orchestrator": <Zap size={20} className="text-[var(--color-accent)]" />,
  "financial-report-analyzer": <ShieldCheck size={20} className="text-[var(--color-accent)]" />,
};

const zhDesc: Record<string, string> = {
  "browser-research-pro": "深度网络研究 — 多源抓取、结构化摘要",
  "crm-enrichment": "自动补全 CRM 数据 — 社交、公司、职位",
  "support-triage": "AI 工单分类 — 优先级识别、团队分配",
  "code-review-assistant": "智能代码审查 — 安全、性能、最佳实践",
  "data-pipeline-orchestrator": "数据管道编排 — ETL 调度、依赖管理",
  "financial-report-analyzer": "财报分析 — 指标提取、趋势检测",
};

export function SkillGridCard({ skill, locale }: Props) {
  const icon = iconMap[skill.slug] || <Zap size={20} className="text-[var(--color-accent)]" />;
  const desc = locale === "zh" ? zhDesc[skill.slug] || skill.description : skill.description;
  const isVerified = skill.verificationStatus === "verified";

  return (
    <a
      href={`/skills/${skill.slug}`}
      className="skill-grid-card flex-shrink-0 w-[264px]"
    >
      {/* Visual area (replaces image) */}
      <div className="skill-grid-card-image">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-3)] flex items-center justify-center">
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption text-[var(--color-text-muted)]">
              {(skill.runtimeType || "HTTP").toUpperCase()}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-caption text-[var(--color-verified)]">
                <ShieldCheck size={10} />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Text body */}
      <div className="skill-grid-card-body">
        <h3 className="text-body-sm text-[var(--color-text-primary)] mb-1 truncate">
          {skill.displayName}
        </h3>
        <p className="text-caption text-[var(--color-text-muted)] line-clamp-2">
          {desc}
        </p>
        <p className="text-caption text-[var(--color-accent)] mt-2">
          {locale === "zh" ? "调用技能 →" : "Run skill →"}
        </p>
      </div>
    </a>
  );
}
