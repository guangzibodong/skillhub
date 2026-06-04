import type { SkillSummary } from "@useskillhub/schema";

type StatusPillProps = {
  status: SkillSummary["verificationStatus"];
};

const labels: Record<SkillSummary["verificationStatus"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  verified: "Verified",
  deprecated: "Deprecated",
  rejected: "Rejected"
};

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill status-pill--${status}`}>{labels[status]}</span>;
}
