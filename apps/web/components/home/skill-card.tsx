import type { SkillSummary } from "@useskillhub/schema";
import { ShieldCheck, Cpu, Tag, TrendingUp } from "lucide-react";

type SkillCardProps = {
  skill: SkillSummary;
  locale: "en" | "zh";
  zhDescription?: string;
  zhTags?: string[];
};

export function SkillCard({ skill, locale, zhDescription, zhTags }: SkillCardProps) {
  const description = locale === "zh" && zhDescription ? zhDescription : skill.description;
  const tags = locale === "zh" && zhTags ? zhTags : skill.tags;
  const isVerified = skill.verificationStatus === "verified";

  return (
    <a
      href={`/skills/${skill.slug}`}
      className="glow-card group block rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-6 transition-all duration-400"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-glow-purple)] to-[var(--color-glow-cyan)] flex items-center justify-center border border-[var(--color-border-default)]">
            <Cpu size={18} className="text-[var(--color-accent-purple)]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-purple)] transition-colors">
              {skill.displayName}
            </h3>
            <span className="text-xs text-[var(--color-text-muted)] font-mono">
              v{skill.version}
            </span>
          </div>
        </div>
        {isVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-[rgba(16,185,129,0.1)] text-[var(--color-accent-green)] border border-[rgba(16,185,129,0.2)]">
            <ShieldCheck size={11} />
            {locale === "zh" ? "已验证" : "Verified"}
          </span>
        )}
        {!isVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {locale === "zh" ? "审核中" : "In Review"}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-4">
        {skill.invocationCount != null && (
          <span className="inline-flex items-center gap-1">
            <TrendingUp size={11} />
            {skill.invocationCount.toLocaleString()} {locale === "zh" ? "次调用" : "calls"}
          </span>
        )}
        {skill.avgLatencyMs != null && (
          <span className="inline-flex items-center gap-1">
            ⚡ {skill.avgLatencyMs}ms
          </span>
        )}
        {skill.successRate != null && (
          <span className="inline-flex items-center gap-1">
            ✓ {(skill.successRate * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-[11px] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
