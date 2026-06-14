import { getPublicPublishers, type PublicPublisherProfile } from "@/lib/public-publishers";
import { getRegistryStats, getSkills, type RegistryStats } from "@/lib/registry";
import { isVerifiedSkillStatus } from "@/lib/skill-install-state";
import type { SkillSummary } from "@useskillhub/schema";

export type PublicPlatformStats = {
  avgLatencyMs: number | null;
  callableSkills: number;
  feedbackSignals: number;
  hiddenOrPrelaunchSkillRecords: number;
  installEvidence: number;
  publicPublishers: number;
  publicSkills: number;
  recordedCalls: number;
  submittedSkills: number;
  totalSkillRecords: number;
  verifiedPublishers: number;
  verifiedSkills: number;
  payoutReadyPublishers: number;
};

type PublicPlatformStatsInput = {
  publishers?: PublicPublisherProfile[];
  registryStats?: RegistryStats;
  skills?: SkillSummary[];
};

export function derivePublicPlatformStats(skills: SkillSummary[]): Pick<
  PublicPlatformStats,
  "callableSkills" | "feedbackSignals" | "publicSkills" | "recordedCalls" | "submittedSkills" | "verifiedSkills"
> {
  const submittedSkills = skills.filter((skill) => skill.verificationStatus === "submitted" && !isQaSkillSummary(skill));
  const publicSkills = skills.filter(isPublicSkillSummary);
  const verifiedSkills = publicSkills.filter((skill) => isVerifiedSkillStatus(skill.verificationStatus));

  return {
    callableSkills: verifiedSkills.filter(isCallableSkillSummary).length,
    feedbackSignals: publicSkills.reduce((sum, skill) => sum + (skill.feedbackCount ?? 0), 0),
    publicSkills: publicSkills.length,
    recordedCalls: publicSkills.reduce((sum, skill) => sum + (skill.invocationCount ?? 0), 0),
    submittedSkills: submittedSkills.length,
    verifiedSkills: verifiedSkills.length,
  };
}

export async function getPublicPlatformStats(input: PublicPlatformStatsInput = {}): Promise<PublicPlatformStats> {
  const [skills, publishers, registryStats] = await Promise.all([
    input.skills ? Promise.resolve(input.skills) : getSkills(),
    input.publishers ? Promise.resolve(input.publishers) : getPublicPublishers(),
    input.registryStats ? Promise.resolve(input.registryStats) : getRegistryStats()
  ]);

  const derived = derivePublicPlatformStats(skills);
  const statsAvailable = registryStats.publicSkills !== undefined;
  const publicSkills = statsAvailable ? registryStats.publicSkills ?? 0 : derived.publicSkills;
  const verifiedSkills = statsAvailable
    ? registryStats.verifiedSkills
    : derived.verifiedSkills;
  const submittedSkills = statsAvailable
    ? registryStats.submittedSkills ?? 0
    : derived.submittedSkills;
  const callableSkills = registryStats.callableSkills ?? (statsAvailable ? verifiedSkills : derived.callableSkills);
  const skillCallCount = derived.recordedCalls;
  const publisherCallCount = publishers.reduce((sum, publisher) => sum + publisher.metrics.callCount, 0);
  const registryCallCount = registryStats.apiCalls ?? 0;
  const totalSkillRecords = Math.max(registryStats.totalSkillRecords ?? publicSkills, publicSkills);

  return {
    avgLatencyMs: registryStats.avgLatencyMs,
    callableSkills,
    feedbackSignals: derived.feedbackSignals,
    hiddenOrPrelaunchSkillRecords: Math.max(totalSkillRecords - publicSkills, 0),
    installEvidence: publishers.reduce((sum, publisher) => sum + publisher.metrics.installCount, 0),
    publicPublishers: publishers.length,
    publicSkills,
    recordedCalls: Math.max(skillCallCount, publisherCallCount, registryCallCount),
    submittedSkills,
    totalSkillRecords,
    verifiedPublishers: publishers.filter((publisher) => publisher.trustLevel === "verified").length,
    verifiedSkills,
    payoutReadyPublishers: publishers.filter((publisher) => publisher.payoutStatus === "verified").length
  };
}

export function isPublicSkillSummary(skill: SkillSummary) {
  return isVerifiedSkillStatus(skill.verificationStatus) && !isQaSkillSummary(skill);
}

export function isCallableSkillSummary(skill: SkillSummary) {
  return isPublicSkillSummary(skill) && isVerifiedSkillStatus(skill.verificationStatus);
}

function isQaSkillSummary(skill: SkillSummary) {
  const haystack = [skill.slug, skill.displayName, skill.description].join(" ").toLowerCase();
  return haystack.includes("acceptance-") || haystack.includes("qa-") || haystack.includes("acceptance partner");
}

export function formatPublicPlatformLatency(value: number | null) {
  return value === null ? "--" : `${value}ms`;
}

export function formatPublicPlatformShare(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "0%";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}
