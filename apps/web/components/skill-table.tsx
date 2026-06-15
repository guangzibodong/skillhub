import { Box, ExternalLink, PackageCheck, ShieldCheck } from "lucide-react";
import type { SkillSummary } from "@useskillhub/schema";
import type { Dictionary } from "@/lib/i18n";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import {
  publicSkillDescription,
  publicSkillDisplayName,
  publicSkillTags,
} from "@/lib/public-skill-localization";
import { StatusPill } from "./status-pill";

type SkillTableProps = {
  skills: SkillSummary[];
  apiUrl?: string;
  labels: Dictionary["skillTable"];
  locale?: Locale;
};

export function SkillTable({ apiUrl = "https://api.useskillhub.com", labels, locale = "en", skills }: SkillTableProps) {
  if (skills.length === 0) {
    return (
      <div className="empty-state">
        <Box size={22} aria-hidden="true" />
        <h3>{labels.emptyTitle}</h3>
        <p>{labels.emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="skill-table" aria-label={labels.aria}>
      <div className="skill-table__head">
        <span>{labels.skill}</span>
        <span>{labels.tags}</span>
        <span>{labels.trust}</span>
        <span>{labels.risk}</span>
        <span aria-label={labels.actions} />
      </div>
      {skills.map((skill) => {
        const displayName = publicSkillDisplayName(skill.slug, skill.displayName)[locale];
        const description = publicSkillDescription(skill.slug, skill.description)[locale];
        const tags = publicSkillTags(skill.slug, skill.tags)[locale];

        return (
          <article className="skill-row" key={skill.id}>
            <div className="skill-row__main">
              <div className="skill-row__icon" aria-hidden="true">
                <PackageCheck size={18} />
              </div>
              <div className="skill-row__copy">
                <div className="skill-title-line">
                  <h3>{displayName}</h3>
                  <span>v{skill.version}</span>
                </div>
                <p>{description}</p>
                <code>{skill.slug}</code>
              </div>
            </div>
            <div className="tag-list">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div className="trust-stack">
              <StatusPill labels={labels.status} status={skill.verificationStatus} />
              <span>{labels.manifestChecked}</span>
            </div>
            <div className={`risk risk--${skill.permissionLevel}`}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.riskLabels[skill.permissionLevel]}</span>
            </div>
            <div className="skill-row__actions">
              <a
                className="secondary-button secondary-button--compact"
                href={localizedHref(`/skills/${skill.slug}`, locale)}
                aria-label={`${labels.details}: ${displayName}`}
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{labels.details}</span>
              </a>
              <a
                className="icon-button icon-button--quiet"
                href={`${apiUrl}/v1/skills/${skill.slug}`}
                aria-label={`${labels.openManifest}: ${displayName}`}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
