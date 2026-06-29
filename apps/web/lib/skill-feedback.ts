import { getServerApiUrl } from "@/lib/api-url";

export type SkillFeedbackRecord = {
  id: string;
  skillId?: string;
  skillSlug: string;
  skillName: string;
  reviewerEmail?: string | null;
  reviewerDisplayName?: string | null;
  reviewerOrganizationName?: string | null;
  projectSlug?: string | null;
  rating: number;
  title: string;
  body: string;
  useCase: string | null;
  status: "pending" | "published" | "hidden" | "rejected";
  moderationReason?: string | null;
  moderatedAt?: string | null;
  publisherResponseBody: string | null;
  publisherRespondedAt: string | null;
  publisherResponderDisplayName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type SkillFeedbackSummary = {
  averageRating: number | null;
  publishedCount: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type SkillFeedbackPayload = {
  feedback: SkillFeedbackRecord[];
  summary: SkillFeedbackSummary;
};

const apiUrl = getServerApiUrl();

export async function getSkillFeedback(
  skillSlug: string,
  limit = 12,
): Promise<SkillFeedbackPayload> {
  try {
    const response = await fetch(
      `${apiUrl}/v1/skills/${encodeURIComponent(skillSlug)}/feedback?limit=${encodeURIComponent(String(limit))}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Skill feedback failed: ${response.status}`);
    }

    return (await response.json()) as SkillFeedbackPayload;
  } catch {
    const feedback: SkillFeedbackRecord[] = [];

    return {
      feedback,
      summary: summarizeFeedback(feedback),
    };
  }
}

function summarizeFeedback(
  feedback: SkillFeedbackRecord[],
): SkillFeedbackSummary {
  const ratingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  } satisfies SkillFeedbackSummary["ratingBreakdown"];
  const published = feedback.filter((row) => row.status === "published");

  published.forEach((row) => {
    ratingBreakdown[row.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });

  const total = published.reduce((sum, row) => sum + row.rating, 0);

  return {
    averageRating:
      published.length > 0
        ? Number((total / published.length).toFixed(1))
        : null,
    publishedCount: published.length,
    ratingBreakdown,
  };
}
