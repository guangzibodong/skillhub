import type { SkillSummary } from "@useskillhub/schema";

type StatusPillProps = {
  labels: Record<SkillSummary["verificationStatus"], string>;
  status: SkillSummary["verificationStatus"];
};

export function StatusPill({ labels, status }: StatusPillProps) {
  return <span className={`status-pill status-pill--${status}`}>{labels[status]}</span>;
}
