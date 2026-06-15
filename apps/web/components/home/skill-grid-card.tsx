import type { SkillSummary } from "@useskillhub/schema";
import { Zap, Globe, ShieldCheck, FileJson, Activity, Database } from "lucide-react";

type Props = {
  skill: SkillSummary;
  locale: "en" | "zh";
};

const iconMap: Record<string, React.ReactNode> = {
  "browser-research-pro": <Globe size={24} className="text-[#7fee64]" />,
  "crm-enrichment": <Database size={24} className="text-[#7fee64]" />,
  "support-triage": <Activity size={24} className="text-[#7fee64]" />,
  "code-review-assistant": <FileJson size={24} className="text-[#7fee64]" />,
  "data-pipeline-orchestrator": <Zap size={24} className="text-[#7fee64]" />,
  "financial-report-analyzer": <ShieldCheck size={24} className="text-[#7fee64]" />,
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
  const icon = iconMap[skill.slug] || <Zap size={24} className="text-[#7fee64]" />;
  const desc = locale === "zh" ? zhDesc[skill.slug] || skill.description : skill.description;
  const isVerified = skill.verificationStatus === "verified";

  return (
    <a
      href={`/skills/${skill.slug}`}
      className="flex-shrink-0 w-[264px] bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[12px] overflow-hidden hover:border-[rgba(255,255,255,0.15)] transition-all group block"
    >
      {/* Image area (like Morphic's workflow thumbnail) */}
      <div className="aspect-[16/10] bg-[#292929] flex flex-col items-center justify-center gap-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-14 h-14 rounded-[12px] bg-[#333] flex items-center justify-center group-hover:bg-[#3a3a3a] transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#666] bg-[#212121] px-2 py-0.5 rounded-[4px]">
            {(skill.runtimeType || "HTTP").toUpperCase()}
          </span>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#10b981]">
              <ShieldCheck size={9} />
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-[14px] font-medium text-white mb-1 truncate group-hover:text-[#7fee64] transition-colors">
          {skill.displayName}
        </h3>
        <p className="text-[12px] text-[#666] leading-[1.5] line-clamp-2 mb-2.5">
          {desc}
        </p>
        <span className="text-[12px] text-[#7fee64] font-medium">
          {locale === "zh" ? "调用技能 →" : "Run skill →"}
        </span>
      </div>
    </a>
  );
}
