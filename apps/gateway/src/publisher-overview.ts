import type { PlatformOverview } from "./platform-overview.js";
import { getPublisherFinanceLedger } from "./billing.js";
import { listPublisherBuyerRequests } from "./buyer-requests.js";
import { listPublisherSkills } from "./publisher-insights.js";

type PublisherOverview = PlatformOverview["publisher"];
type PublisherSkill = Awaited<ReturnType<typeof listPublisherSkills>>[number];

export async function getPublisherOverview(organizationId: string | null | undefined): Promise<PublisherOverview> {
  const [skills, buyerRequests, ledger] = await Promise.all([
    listPublisherSkills(organizationId, 8),
    listPublisherBuyerRequests(organizationId, 8),
    getPublisherFinanceLedger(organizationId)
  ]);

  const submittedVersions = skills.filter((skill) =>
    ["draft", "submitted"].includes(skill.verificationStatus) || ["queued", "in_review"].includes(skill.review.status ?? "")
  ).length;
  const failedRuntimeChecks = skills.reduce((sum, skill) => sum + skill.runtime.failedCount, 0);
  const openBuyerRequests = buyerRequests.filter((request) => request.status === "open").length;

  return {
    metrics: [
      { label: "Submitted versions", value: submittedVersions },
      { label: "Runtime checks failed", value: failedRuntimeChecks },
      { label: "Open buyer requests", value: openBuyerRequests },
      { label: "Available balance", value: formatMoney(ledger.summary.availableBalanceCents) },
      { label: "Pending balance", value: formatMoney(ledger.summary.pendingBalanceCents) }
    ],
    reviewPipeline: skills.slice(0, 5).map((skill) => ({
      skill: skill.displayName,
      stage: formatSkillStage(skill),
      nextStep: getPublisherNextStep(skill)
    })),
    buyerRequests: buyerRequests.slice(0, 5).map((request) => ({
      title: request.title,
      bounty: formatMoney(request.bountyCents, request.currency),
      status: request.status
    }))
  };
}

function formatSkillStage(skill: PublisherSkill) {
  const reviewStatus = skill.review.status ? ` / ${skill.review.status}` : "";
  return `${skill.verificationStatus}${reviewStatus}`;
}

function getPublisherNextStep(skill: PublisherSkill) {
  if (skill.runtime.health === "needs_attention") {
    return "Fix runtime checks";
  }

  if (skill.runtime.health === "not_checked" || skill.runtime.health === "warning") {
    return "Complete runtime verification";
  }

  if (skill.pricing.status !== "active") {
    return "Confirm pricing";
  }

  if (!skill.review.status && skill.verificationStatus !== "verified") {
    return "Submit for review";
  }

  if (skill.analytics.callCount === 0) {
    return "Improve listing quality";
  }

  return "Monitor usage and feedback";
}

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
    style: "currency"
  }).format(cents / 100);
}
