import type { SkillSummary } from "@useskillhub/schema";
import { ShieldCheck, Zap } from "lucide-react";

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
      className="card group block transition-all"
    >
      {/* Top: icon area */}
      <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--color-surface-3)] flex items-center justify-center">
            <Zap size={16} className="text-[var(--color-text-secondary)]" />
          </div>
          {isVerified && (
            <span className="inline-flex items-center gap-1 text-label text-[var(--color-verified)]">
              <ShieldCheck size={12} />
              {locale === "zh" ? "已验证" : "Verified"}
            </span>
          )}
        </div>
        <h3 className="text-body-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
          {skill.displayName}
        </h3>
      </div>

      {/* Description */}
      <p className="text-body-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3 px-1">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 px-1">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="pill text-caption"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
