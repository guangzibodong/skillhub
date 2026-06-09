import { getPublicPublishers, type PublicPublisherProfile } from "@/lib/public-publishers";
import { getRegistryStats, getSkills, type RegistryStats } from "@/lib/registry";
import type { SkillSummary } from "@useskillhub/schema";

export type PublicPlatformStats = {
  avgLatencyMs: number | null;
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

export async function getPublicPlatformStats(input: PublicPlatformStatsInput = {}): Promise<PublicPlatformStats> {
  const [skills, publishers, registryStats] = await Promise.all([
    input.skills ? Promise.resolve(input.skills) : getSkills(),
    input.publishers ? Promise.resolve(input.publishers) : getPublicPublishers(),
    input.registryStats ? Promise.resolve(input.registryStats) : getRegistryStats()
  ]);

  const statsAvailable = registryStats.publicSkills !== undefined;
  const publicSkills = statsAvailable ? registryStats.publicSkills ?? 0 : skills.length;
  const verifiedSkills = statsAvailable
    ? registryStats.verifiedSkills
    : skills.filter((skill) => skill.verificationStatus === "verified").length;
  const submittedSkills = statsAvailable
    ? registryStats.submittedSkills ?? 0
    : skills.filter((skill) => skill.verificationStatus === "submitted").length;
  const skillCallCount = skills.reduce((sum, skill) => sum + (skill.invocationCount ?? 0), 0);
  const publisherCallCount = publishers.reduce((sum, publisher) => sum + publisher.metrics.callCount, 0);
  const registryCallCount = registryStats.apiCalls ?? 0;
  const totalSkillRecords = Math.max(registryStats.totalSkillRecords ?? publicSkills, publicSkills);

  return {
    avgLatencyMs: registryStats.avgLatencyMs,
    feedbackSignals: skills.reduce((sum, skill) => sum + (skill.feedbackCount ?? 0), 0),
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

export function formatPublicPlatformLatency(value: number | null) {
  return value === null ? "--" : `${value}ms`;
}

export function formatPublicPlatformShare(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return "0%";
  }

  return `${Math.round((numerator / denominator) * 100)}%`;
}
