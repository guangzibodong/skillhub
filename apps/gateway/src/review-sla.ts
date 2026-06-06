const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DUE_SOON_HOURS = 24;
const TERMINAL_REVIEW_STATUSES = new Set(["approved", "rejected", "blocked"]);

export const REVIEW_SLA_BUSINESS_DAYS = 3;

export type ReviewSlaStatus = "decided" | "due_soon" | "not_submitted" | "on_track" | "overdue";

export type ReviewSlaFields = {
  reviewQueueAgeHours: number | null;
  reviewSlaBusinessDays: number;
  reviewSlaDueAt: string | null;
  reviewSlaHoursRemaining: number | null;
  reviewSlaStatus: ReviewSlaStatus;
  reviewSubmittedAt: string | null;
};

export function buildReviewSlaFields(
  submittedAt: Date | string | null | undefined,
  decidedAt: Date | string | null | undefined,
  status: string | null | undefined,
  now = new Date()
): ReviewSlaFields {
  const submittedDate = parseDate(submittedAt);
  const decidedDate = parseDate(decidedAt);
  const reviewSubmittedAt = serializeDate(submittedAt, submittedDate);

  if (!submittedDate) {
    const isDemo = submittedAt === "demo";

    return {
      reviewQueueAgeHours: null,
      reviewSlaBusinessDays: REVIEW_SLA_BUSINESS_DAYS,
      reviewSlaDueAt: isDemo ? "demo" : null,
      reviewSlaHoursRemaining: null,
      reviewSlaStatus: isDemo && isTerminalStatus(status) ? "decided" : isDemo ? "on_track" : "not_submitted",
      reviewSubmittedAt: isDemo ? "demo" : null
    };
  }

  const dueAt = addBusinessDays(submittedDate, REVIEW_SLA_BUSINESS_DAYS);
  const ageHours = Math.max(0, Math.round((now.getTime() - submittedDate.getTime()) / HOUR_MS));
  const hoursRemaining = Math.ceil((dueAt.getTime() - now.getTime()) / HOUR_MS);
  const isDecided = Boolean(decidedDate) || isTerminalStatus(status);

  return {
    reviewQueueAgeHours: isDecided ? null : ageHours,
    reviewSlaBusinessDays: REVIEW_SLA_BUSINESS_DAYS,
    reviewSlaDueAt: dueAt.toISOString(),
    reviewSlaHoursRemaining: isDecided ? null : hoursRemaining,
    reviewSlaStatus: isDecided ? "decided" : hoursRemaining <= 0 ? "overdue" : hoursRemaining <= DUE_SOON_HOURS ? "due_soon" : "on_track",
    reviewSubmittedAt
  };
}

function addBusinessDays(value: Date, days: number) {
  const result = new Date(value.getTime());
  let remaining = days;

  while (remaining > 0) {
    result.setTime(result.getTime() + DAY_MS);

    if (isBusinessDay(result)) {
      remaining -= 1;
    }
  }

  return result;
}

function isBusinessDay(value: Date) {
  const day = value.getUTCDay();
  return day !== 0 && day !== 6;
}

function isTerminalStatus(status: string | null | undefined) {
  return typeof status === "string" && TERMINAL_REVIEW_STATUSES.has(status);
}

function parseDate(value: Date | string | null | undefined) {
  if (!value || value === "demo") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serializeDate(value: Date | string | null | undefined, parsed: Date | null) {
  if (value === "demo") {
    return "demo";
  }

  if (!parsed) {
    return null;
  }

  return parsed.toISOString();
}
