import { Box, ShieldCheck } from "lucide-react";
import type { SkillSummary } from "@useskillhub/schema";
import { StatusPill } from "./status-pill";

type SkillTableProps = {
  skills: SkillSummary[];
};

export function SkillTable({ skills }: SkillTableProps) {
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
        <span>Status</span>
        <span>Risk</span>
      </div>
      {skills.map((skill) => (
        <article className="skill-row" key={skill.id}>
          <div className="skill-row__main">
            <div className="skill-row__icon" aria-hidden="true">
              <Box size={18} />
            </div>
            <div>
              <h3>{skill.displayName}</h3>
              <p>{skill.description}</p>
            </div>
          </div>
          <div className="tag-list">
            {skill.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <StatusPill status={skill.verificationStatus} />
          <div className="risk">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{skill.permissionLevel}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
