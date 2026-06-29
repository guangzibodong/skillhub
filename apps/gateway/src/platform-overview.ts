import { getRegistryStats, getSql } from "./registry.js";

type Metric = {
  label: string;
  value: string | number;
};

export type PlatformOverview = {
  platform: {
    metrics: Metric[];
    signals: string[];
  };
  developer: {
    metrics: Metric[];
    projectControls: Array<{
      project: string;
      budget: string;
      keys: string;
      policy: string;
    }>;
    updateInbox: Array<{
      skill: string;
      event: string;
      severity: string;
    }>;
  };
  publisher: {
    metrics: Metric[];
    reviewPipeline: Array<{
      skill: string;
      stage: string;
      nextStep: string;
    }>;
    buyerRequests: Array<{
      title: string;
      bounty: string;
      status: string;
    }>;
  };
  admin: {
    metrics: Metric[];
    riskQueue: Array<{
      signal: string;
      scope: string;
      action: string;
    }>;
    moneyQueue: Array<{
      batch: string;
      state: string;
      amount: string;
    }>;
  };
  retention: {
    developerReasons: string[];
    publisherReasons: string[];
  };
};

const overviewTemplate: PlatformOverview = {
  platform: {
    metrics: [
      { label: "Public skills", value: 0 },
      { label: "Verified skills", value: 0 },
      { label: "Installed skills", value: 0 },
      { label: "API calls", value: 0 },
      { label: "Avg latency", value: "n/a" },
      { label: "Open incidents", value: 0 },
    ],
    signals: [
      "Skill detail pages expose manifest, permissions, examples, pricing, and changelog.",
      "Developer retention depends on installed skills, version pins, usage, budgets, and incidents.",
      "Publisher retention depends on review feedback, runtime checks, buyer requests, analytics, and payout readiness.",
    ],
  },
  developer: {
    metrics: [
      { label: "Projects", value: 0 },
      { label: "Installed skills", value: 0 },
      { label: "Saved skills", value: 0 },
      { label: "Update inbox", value: 0 },
      { label: "Active subscriptions", value: 0 },
    ],
    projectControls: [],
    updateInbox: [],
  },
  publisher: {
    metrics: [
      { label: "Submitted versions", value: 0 },
      { label: "Runtime checks failed", value: 0 },
      { label: "Open buyer requests", value: 0 },
      { label: "Available balance", value: "$0" },
      { label: "Pending balance", value: "$0" },
    ],
    reviewPipeline: [],
    buyerRequests: [],
  },
  admin: {
    metrics: [
      { label: "Review queue", value: 0 },
      { label: "Payout review", value: 0 },
      { label: "Queued notifications", value: 0 },
      { label: "Failed runtime checks", value: 0 },
    ],
    riskQueue: [],
    moneyQueue: [],
  },
  retention: {
    developerReasons: [
      "Manage installed skills by project.",
      "Review usage, cost, failure, and latency signals.",
      "React to version changes, incidents, deprecations, and permission changes.",
    ],
    publisherReasons: [
      "Track review state and runtime checks.",
      "Improve listings from buyer requests and quality scores.",
      "Watch installs, usage, revenue state, and payout readiness.",
    ],
  },
};

function emptyOverview(
  registryStats: Awaited<ReturnType<typeof getRegistryStats>>,
): PlatformOverview {
  return {
    platform: {
      metrics: [
        { label: "Public skills", value: registryStats.publicSkills },
        { label: "Verified skills", value: registryStats.verifiedSkills },
        { label: "API calls", value: registryStats.apiCalls },
        {
          label: "Avg latency",
          value: registryStats.avgLatencyMs
            ? `${registryStats.avgLatencyMs}ms`
            : "n/a",
        },
      ],
      signals: [],
    },
    developer: {
      metrics: [
        { label: "Projects", value: 0 },
        { label: "Installed skills", value: 0 },
        { label: "Saved skills", value: 0 },
        { label: "Update inbox", value: 0 },
        { label: "Active subscriptions", value: 0 },
      ],
      projectControls: [],
      updateInbox: [],
    },
    publisher: {
      metrics: [
        { label: "Submitted versions", value: 0 },
        { label: "Runtime checks failed", value: 0 },
        { label: "Open buyer requests", value: 0 },
        { label: "Available balance", value: "$0" },
        { label: "Pending balance", value: "$0" },
      ],
      reviewPipeline: [],
      buyerRequests: [],
    },
    admin: {
      metrics: [
        { label: "Review queue", value: 0 },
        { label: "Payout review", value: 0 },
        { label: "Queued notifications", value: 0 },
        { label: "Failed runtime checks", value: 0 },
      ],
      riskQueue: [],
      moneyQueue: [],
    },
    retention: {
      developerReasons: [],
      publisherReasons: [],
    },
  };
}

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const sql = await getSql();
  const registryStats = await getRegistryStats();

  try {
    return await queryOverviewFromDatabase(sql, registryStats);
  } catch {
    return emptyOverview(registryStats);
  }
}

async function queryOverviewFromDatabase(
  sql: any,
  registryStats: Awaited<ReturnType<typeof getRegistryStats>>,
) {
  const [
    projectRows,
    installRows,
    savedRows,
    updateRows,
    submittedRows,
    failedCheckRows,
    buyerRequestRows,
    balanceRows,
    pendingBalanceRows,
    subscriptionRows,
    reviewRows,
    payoutRows,
    notificationRows,
    incidentRows,
  ] = await Promise.all([
    sql`select count(*)::int as count from projects`,
    sql`select count(*)::int as count from project_skill_installs where status = 'installed'`,
    sql`select count(*)::int as count from saved_skills`,
    sql`select count(*)::int as count from skill_update_events`,
    sql`select count(*)::int as count from skill_reviews where status in ('queued', 'in_review')`,
    sql`select count(*)::int as count from skill_runtime_checks where status = 'failed'`,
    sql`select count(*)::int as count from buyer_requests where status in ('open', 'claimed', 'submitted')`,
    sql`
      select coalesce(sum(amount_cents) filter (where state = 'available'), 0)::int as available_cents
      from publisher_balances
    `,
    sql`
      select coalesce(sum(amount_cents) filter (where state = 'pending'), 0)::int as pending_cents
      from publisher_balances
    `,
    sql`select count(*)::int as count from subscriptions where status in ('trialing', 'active') and (current_period_end is null or current_period_end > now())`,
    sql`select count(*)::int as count from skill_reviews where status in ('queued', 'in_review')`,
    sql`select count(*)::int as count from payouts where status in ('requested', 'review', 'blocked')`,
    sql`select count(*)::int as count from notification_events where status = 'queued'`,
    sql`select count(*)::int as count from skill_incidents where status in ('open', 'monitoring')`,
  ]);

  const projects = firstCount(projectRows);
  const installs = firstCount(installRows);
  const saved = firstCount(savedRows);
  const updates = firstCount(updateRows);
  const submitted = firstCount(submittedRows);
  const failedChecks = firstCount(failedCheckRows);
  const buyerRequests = firstCount(buyerRequestRows);
  const availableCents = Number(balanceRows[0]?.available_cents ?? 0);
  const pendingCents = Number(pendingBalanceRows[0]?.pending_cents ?? 0);
  const activeSubscriptions = firstCount(subscriptionRows);
  const reviewQueue = firstCount(reviewRows);
  const payoutQueue = firstCount(payoutRows);
  const queuedNotifications = firstCount(notificationRows);
  const openIncidents = firstCount(incidentRows);

  return {
    ...overviewTemplate,
    platform: {
      ...overviewTemplate.platform,
      metrics: [
        { label: "Public skills", value: registryStats.publicSkills },
        { label: "Verified skills", value: registryStats.verifiedSkills },
        { label: "Installed skills", value: installs },
        { label: "API calls", value: registryStats.apiCalls },
        {
          label: "Avg latency",
          value: registryStats.avgLatencyMs
            ? `${registryStats.avgLatencyMs}ms`
            : "n/a",
        },
        { label: "Open incidents", value: openIncidents },
      ],
    },
    developer: {
      ...overviewTemplate.developer,
      metrics: [
        { label: "Projects", value: projects },
        { label: "Installed skills", value: installs },
        { label: "Saved skills", value: saved },
        { label: "Update inbox", value: updates },
        { label: "Active subscriptions", value: activeSubscriptions },
      ],
    },
    publisher: {
      ...overviewTemplate.publisher,
      metrics: [
        { label: "Submitted versions", value: submitted },
        { label: "Runtime checks failed", value: failedChecks },
        { label: "Open buyer requests", value: buyerRequests },
        { label: "Available balance", value: formatUsd(availableCents) },
        { label: "Pending balance", value: formatUsd(pendingCents) },
      ],
    },
    admin: {
      ...overviewTemplate.admin,
      metrics: [
        { label: "Review queue", value: reviewQueue },
        { label: "Payout review", value: payoutQueue },
        { label: "Queued notifications", value: queuedNotifications },
        { label: "Failed runtime checks", value: failedChecks },
      ],
    },
  };
}

function firstCount(rows: Array<{ count?: number | string }>) {
  return Number(rows[0]?.count ?? 0);
}

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}
