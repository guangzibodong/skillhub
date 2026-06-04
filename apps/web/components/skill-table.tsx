import { Box, ExternalLink, PackageCheck, ShieldCheck } from "lucide-react";
import type { SkillSummary } from "@useskillhub/schema";
import { StatusPill } from "./status-pill";

type SkillTableProps = {
  skills: SkillSummary[];
  apiUrl?: string;
};

const riskLabels: Record<SkillSummary["permissionLevel"], string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk"
};

export function SkillTable({ apiUrl = "https://api.useskillhub.com", skills }: SkillTableProps) {
  if (skills.length === 0) {
    return (
      <div className="empty-state">
        <Box size={22} aria-hidden="true" />
        <h3>No skills published</h3>
        <p>Publish a SkillHub manifest to populate the registry.</p>
      </div>
    );
  }

  return (
    <div className="skill-table" aria-label="Skill registry">
      <div className="skill-table__head">
        <span>Skill</span>
        <span>Tags</span>
        <span>Trust</span>
        <span>Risk</span>
        <span aria-label="Actions" />
      </div>
      {skills.map((skill) => (
        <article className="skill-row" key={skill.id}>
          <div className="skill-row__main">
            <div className="skill-row__icon" aria-hidden="true">
              <PackageCheck size={18} />
            </div>
            <div className="skill-row__copy">
              <div className="skill-title-line">
                <h3>{skill.displayName}</h3>
                <span>v{skill.version}</span>
              </div>
              <p>{skill.description}</p>
              <code>{skill.slug}</code>
            </div>
          </div>
          <div className="tag-list">
            {skill.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="trust-stack">
            <StatusPill status={skill.verificationStatus} />
            <span>Manifest checked</span>
          </div>
          <div className={`risk risk--${skill.permissionLevel}`}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{riskLabels[skill.permissionLevel]}</span>
          </div>
          <a
            className="icon-button icon-button--quiet"
            href={`${apiUrl}/v1/skills/${skill.slug}`}
            aria-label={`Open ${skill.displayName} manifest`}
          >
            <ExternalLink size={16} />
          </a>
        </article>
      ))}
    </div>
  );
}
