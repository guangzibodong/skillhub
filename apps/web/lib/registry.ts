import type { SkillSummary } from "@useskillhub/schema";

export type RegistryStats = {
  publicSkills?: number;
  publishedSkills: number;
  submittedSkills?: number;
  totalSkillRecords?: number;
  verifiedSkills: number;
  apiCalls: number;
  avgLatencyMs: number | null;
};

export type GatewayMetric = {
  label: string;
  value: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

export async function getSkills(): Promise<SkillSummary[]> {
  try {
    const response = await fetch(`${apiUrl}/v1/skills/search?limit=50`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Skill search failed: ${response.status}`);
    }

    const payload = (await response.json()) as { skills: SkillSummary[] };
    return payload.skills;
  } catch {
    return [];
  }
}

export async function getGatewayStats(): Promise<GatewayMetric[]> {
  return formatStats(await getRegistryStats());
}

export async function getRegistryStats(): Promise<RegistryStats> {
  try {
    const response = await fetch(`${apiUrl}/v1/stats`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Registry stats failed: ${response.status}`);
    }

    return (await response.json()) as RegistryStats;
  } catch {
    return {
      publishedSkills: 0,
      verifiedSkills: 0,
      apiCalls: 0,
      avgLatencyMs: null
    };
  }
}

function formatStats(stats: RegistryStats): GatewayMetric[] {
  const publicSkills = stats.publicSkills ?? stats.publishedSkills;

  return [
    { label: "Public skills", value: String(publicSkills) },
    { label: "Verified", value: String(stats.verifiedSkills) },
    { label: "API calls", value: String(stats.apiCalls) },
    { label: "Avg latency", value: stats.avgLatencyMs === null ? "--" : `${stats.avgLatencyMs}ms` }
  ];
}
