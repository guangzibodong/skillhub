type CloudflareCountryInsight = {
  code: string;
  label: string;
  requests: number;
  share: number;
  visits: number;
};

export type CloudflareAnalytics = {
  connected: boolean;
  countries: CloudflareCountryInsight[];
  message: string;
  sourceLabel: string;
  totals: {
    cachedRequests: number;
    pageViews: number;
    requests: number;
    threats: number;
    visits: number;
  };
};

type CloudflareDashboardResponse = {
  errors?: Array<{ message?: string }>;
  messages?: Array<{ message?: string }>;
  result?: {
    totals?: {
      pageviews?: {
        all?: number;
      };
      requests?: {
        all?: number;
        cached?: number;
        country?: Record<string, number>;
      };
      threats?: {
        all?: number;
      };
      uniques?: {
        all?: number;
      };
    };
  };
  success?: boolean;
};

const CLOUDFLARE_ENDPOINT = "https://api.cloudflare.com/client/v4";
const DEFAULT_TIME_ZONE = "Asia/Shanghai";

export async function getCloudflareAnalytics(now = new Date()): Promise<CloudflareAnalytics> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!zoneId || !apiToken) {
    return buildUnavailableAnalytics("Cloudflare environment variables are not configured");
  }

  try {
    const { since, until } = buildTodayRange(now);
    const response = await fetch(
      `${CLOUDFLARE_ENDPOINT}/zones/${encodeURIComponent(zoneId)}/analytics/dashboard?since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}&continuous=false`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000)
      }
    );

    const payload = (await response.json().catch(() => null)) as CloudflareDashboardResponse | null;

    if (!response.ok || !payload?.success) {
      const message = payload?.errors?.[0]?.message ?? payload?.messages?.[0]?.message ?? `Cloudflare analytics request failed (${response.status})`;
      return buildUnavailableAnalytics(message);
    }

    const totals = payload.result?.totals;
    const requests = toSafeNumber(totals?.requests?.all);
    const countries = buildCountries(totals?.requests?.country, requests);

    return {
      connected: true,
      countries,
      message: "Cloudflare Analytics connected",
      sourceLabel: "Cloudflare Analytics",
      totals: {
        cachedRequests: toSafeNumber(totals?.requests?.cached),
        pageViews: toSafeNumber(totals?.pageviews?.all),
        requests,
        threats: toSafeNumber(totals?.threats?.all),
        visits: toSafeNumber(totals?.uniques?.all)
      }
    };
  } catch (error) {
    return buildUnavailableAnalytics(error instanceof Error ? error.message : "Cloudflare Analytics is unavailable");
  }
}

function buildUnavailableAnalytics(message: string): CloudflareAnalytics {
  return {
    connected: false,
    countries: [],
    message,
    sourceLabel: "Cloudflare Analytics pending",
    totals: {
      cachedRequests: 0,
      pageViews: 0,
      requests: 0,
      threats: 0,
      visits: 0
    }
  };
}

function buildCountries(countryCounts: Record<string, number> | undefined, totalRequests: number): CloudflareCountryInsight[] {
  if (!countryCounts) {
    return [];
  }

  return Object.entries(countryCounts)
    .filter(([, count]) => toSafeNumber(count) > 0)
    .sort((a, b) => toSafeNumber(b[1]) - toSafeNumber(a[1]))
    .slice(0, 8)
    .map(([code, count]) => {
      const requests = toSafeNumber(count);

      return {
        code: code.toUpperCase(),
        label: code.toUpperCase(),
        requests,
        share: totalRequests > 0 ? Math.round((requests / totalRequests) * 100) : 0,
        visits: 0
      };
    });
}

function buildTodayRange(now: Date) {
  const dateKey = getDateKey(now);
  const start = new Date(`${dateKey}T00:00:00+08:00`);

  return {
    since: start.toISOString(),
    until: now.toISOString()
  };
}

function getDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: process.env.SKILLHUB_ANALYTICS_TIME_ZONE ?? DEFAULT_TIME_ZONE,
    year: "numeric"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? String(date.getFullYear());
  const month = parts.find((part) => part.type === "month")?.value ?? String(date.getMonth() + 1).padStart(2, "0");
  const day = parts.find((part) => part.type === "day")?.value ?? String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toSafeNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}
