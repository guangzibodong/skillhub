export type SkillFeedbackRecord = {
  id: string;
  skillId: string;
  skillSlug: string;
  skillName: string;
  reviewerEmail: string | null;
  reviewerDisplayName: string | null;
  reviewerOrganizationName: string | null;
  projectSlug: string | null;
  rating: number;
  title: string;
  body: string;
  useCase: string | null;
  status: "pending" | "published" | "hidden" | "rejected";
  moderationReason: string | null;
  moderatedAt: string | null;
  publisherResponseBody: string | null;
  publisherRespondedAt: string | null;
  publisherResponderDisplayName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

const fallbackFeedback = [
  {
    id: "demo-feedback-browser-research-1",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: null,
    reviewerDisplayName: "Research Agent Ops",
    reviewerOrganizationName: "SkillHub Demo Org",
    projectSlug: "research-agent",
    rating: 5,
    title: "Reliable source gathering for daily briefings",
    body: "The manifest is clear, permissions match the browser workflow, and the output shape is stable enough for scheduled research agents.",
    useCase: "Daily market and policy research briefings",
    status: "published",
    moderationReason: "Public demo feedback.",
    moderatedAt: "demo",
    publisherResponseBody:
      "Thanks for the production note. We are keeping output-shape changes behind reviewed versions so pinned projects stay stable.",
    publisherRespondedAt: "demo",
    publisherResponderDisplayName: "SkillHub Labs",
    publishedAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  },
  {
    id: "demo-feedback-browser-research-2",
    skillId: "demo-skill-browser-research",
    skillSlug: "browser-research",
    skillName: "Browser Research",
    reviewerEmail: null,
    reviewerDisplayName: "Automation Lead",
    reviewerOrganizationName: "Builder Studio",
    projectSlug: "content-agent",
    rating: 4,
    title: "Good contract, needs richer citation metadata",
    body: "Works well for first-pass research. We would like source timestamps and confidence fields before using it in compliance-heavy workflows.",
    useCase: "Long-form content research",
    status: "published",
    moderationReason: "Public demo feedback.",
    moderatedAt: "demo",
    publisherResponseBody:
      "Richer citation metadata is planned for the next reviewed release. We will keep the current contract pinned for existing installs.",
    publisherRespondedAt: "demo",
    publisherResponderDisplayName: "SkillHub Labs",
    publishedAt: "demo",
    createdAt: "demo",
    updatedAt: "demo"
  }
] satisfies SkillFeedbackRecord[];

export async function getSkillFeedback(skillSlug: string, limit = 12): Promise<SkillFeedbackPayload> {
  try {
    const response = await fetch(
      `${apiUrl}/v1/skills/${encodeURIComponent(skillSlug)}/feedback?limit=${encodeURIComponent(String(limit))}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(`Skill feedback failed: ${response.status}`);
    }

    return (await response.json()) as SkillFeedbackPayload;
  } catch {
    const feedback = fallbackFeedback.filter((row) => feedbackMatchesSkill(row.skillSlug, skillSlug)).slice(0, limit);

    return {
      feedback,
      summary: summarizeFeedback(feedback)
    };
  }
}

function feedbackMatchesSkill(rowSkillSlug: string, requestedSkillSlug: string) {
  return rowSkillSlug === requestedSkillSlug || (requestedSkillSlug === "browser-research-pro" && rowSkillSlug === "browser-research");
}

function summarizeFeedback(feedback: SkillFeedbackRecord[]): SkillFeedbackSummary {
  const ratingBreakdown = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  } satisfies SkillFeedbackSummary["ratingBreakdown"];
  const published = feedback.filter((row) => row.status === "published");

  published.forEach((row) => {
    ratingBreakdown[row.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });

  const total = published.reduce((sum, row) => sum + row.rating, 0);

  return {
    averageRating: published.length > 0 ? Number((total / published.length).toFixed(1)) : null,
    publishedCount: published.length,
    ratingBreakdown
  };
}
