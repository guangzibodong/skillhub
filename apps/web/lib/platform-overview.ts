import { demoFallback } from "@/lib/demo-fallback";

export type OverviewMetric = {
  label: string;
  value: string | number;
};

export type PlatformOverview = {
  platform: {
    metrics: OverviewMetric[];
    signals: string[];
  };
  developer: {
    metrics: OverviewMetric[];
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
    metrics: OverviewMetric[];
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
    metrics: OverviewMetric[];
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

const fallbackOverview: PlatformOverview = {
  platform: {
    metrics: [
      { label: "Public skills", value: 0 },
      { label: "Verified skills", value: 0 },
      { label: "Installed skills", value: 0 },
      { label: "API calls", value: 0 },
      { label: "Avg latency", value: "n/a" },
      { label: "Open incidents", value: 0 },
    ],
    signals: [],
  },
  developer: {
    metrics: [
      { label: "Projects", value: 3 },
      { label: "Installed skills", value: 18 },
      { label: "Saved skills", value: 11 },
      { label: "Update inbox", value: 5 },
      { label: "Active subscriptions", value: 126 },
    ],
    projectControls: [],
    updateInbox: [],
  },
  publisher: {
    metrics: [
      { label: "Submitted versions", value: 3 },
      { label: "Runtime checks failed", value: 1 },
      { label: "Open buyer requests", value: 2 },
      { label: "Available balance", value: "$4,820" },
      { label: "Pending balance", value: "$1,260" },
    ],
    reviewPipeline: [],
    buyerRequests: [],
  },
  admin: {
    metrics: [
      { label: "Review queue", value: 9 },
      { label: "Payout review", value: 3 },
      { label: "Queued notifications", value: 14 },
      { label: "Failed runtime checks", value: 2 },
    ],
    riskQueue: [],
    moneyQueue: [],
  },
  retention: {
    developerReasons: [],
    publisherReasons: [],
  },
};

const emptyOverview: PlatformOverview = {
  platform: {
    metrics: [
      { label: "Public skills", value: 0 },
      { label: "Verified skills", value: 0 },
      { label: "Installed skills", value: 0 },
      { label: "API calls", value: 0 },
      { label: "Avg latency", value: "n/a" },
      { label: "Open incidents", value: 0 },
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

export async function getPlatformOverview(): Promise<PlatformOverview> {
  try {
    const response = await fetch(`${apiUrl}/v1/platform/overview`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Platform overview failed: ${response.status}`);
    }

    return (await response.json()) as PlatformOverview;
  } catch {
    return demoFallback(fallbackOverview, emptyOverview);
  }
}

export function getOverviewMetric(
  metrics: OverviewMetric[],
  label: string,
  fallback: string,
) {
  const value = metrics.find((metric) => metric.label === label)?.value;
  return value === undefined ? fallback : String(value);
}
