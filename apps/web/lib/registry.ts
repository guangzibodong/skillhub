import type { SkillSummary } from "@useskillhub/schema";

export const skills: SkillSummary[] = [
  {
    id: "browser-research",
    slug: "browser-research",
    displayName: "Browser Research",
    description: "Research a web topic and return concise findings with source URLs.",
    tags: ["research", "browser", "citations"],
    version: "0.1.0",
    verificationStatus: "verified",
    permissionLevel: "medium"
  },
  {
    id: "manifest-review",
    slug: "manifest-review",
    displayName: "Manifest Review",
    description: "Review a SkillHub manifest for completeness, risk, and publish readiness.",
    tags: ["review", "schema", "trust"],
    version: "0.1.0",
    verificationStatus: "draft",
    permissionLevel: "low"
  },
  {
    id: "dataset-summarizer",
    slug: "dataset-summarizer",
    displayName: "Dataset Summarizer",
    description: "Convert tabular data into structured notes, anomalies, and next actions.",
    tags: ["data", "analysis", "summary"],
    version: "0.1.0",
    verificationStatus: "submitted",
    permissionLevel: "medium"
  },
  {
    id: "support-triage",
    slug: "support-triage",
    displayName: "Support Triage",
    description: "Classify support requests by urgency, product area, and escalation path.",
    tags: ["support", "classification", "ops"],
    version: "0.1.0",
    verificationStatus: "draft",
    permissionLevel: "low"
  }
];

export const gatewayStats = [
  { label: "Published skills", value: "4" },
  { label: "Verified", value: "1" },
  { label: "API calls", value: "0" },
  { label: "Avg latency", value: "--" }
];
