import type { SkillSummary } from "@useskillhub/schema";
import { ShieldCheck, Cpu, Tag } from "lucide-react";

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
      className="glow-card group block rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-5 transition-all duration-300 hover:bg-[var(--color-bg-card-hover)] hover:border-[var(--color-border-hover)]"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
          {skill.displayName}
        </h3>
        {isVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <ShieldCheck size={12} />
            {locale === "zh" ? "已验证" : "Verified"}
          </span>
        )}
        {!isVerified && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
            {locale === "zh" ? "审核中" : "In Review"}
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1">
          <Cpu size={12} />
          {skill.runtimeType?.toUpperCase() ?? "HTTP"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Tag size={12} />
          v{skill.version}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
