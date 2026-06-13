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

type CloudflareGraphqlGroup = {
  count?: number;
  dimensions?: {
    clientCountryName?: string;
  };
  sum?: {
    edgeResponseBytes?: number;
    visits?: number;
  };
};

type CloudflareGraphqlResponse = {
  data?: {
    viewer?: {
      zones?: Array<{
        countries?: CloudflareGraphqlGroup[];
        totals?: CloudflareGraphqlGroup[];
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
};

const CLOUDFLARE_GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
const CLOUDFLARE_ZONE_ANALYTICS_QUERY = `
  query SkillHubZoneTraffic($zoneTag: string, $filter: filter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        totals: httpRequestsAdaptiveGroups(limit: 1, filter: $filter) {
          count
          sum {
            visits
            edgeResponseBytes
          }
        }
        countries: httpRequestsAdaptiveGroups(limit: 8, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions {
            clientCountryName
          }
          sum {
            visits
          }
        }
      }
    }
  }
`;
const DEFAULT_TIME_ZONE = "Asia/Shanghai";

export async function getCloudflareAnalytics(now = new Date()): Promise<CloudflareAnalytics> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!zoneId || !apiToken) {
    return buildUnavailableAnalytics("Cloudflare environment variables are not configured");
  }

  try {
    const { since, until } = buildTodayRange(now);
    const response = await fetch(CLOUDFLARE_GRAPHQL_ENDPOINT, {
      body: JSON.stringify({
        query: CLOUDFLARE_ZONE_ANALYTICS_QUERY,
        variables: {
          filter: {
            datetime_geq: since,
            datetime_lt: until,
            requestSource: "eyeball"
          },
          zoneTag: zoneId
        }
      }),
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000)
    });

    const payload = (await response.json().catch(() => null)) as CloudflareGraphqlResponse | null;

    if (!response.ok || payload?.errors?.length) {
      const message = payload?.errors?.[0]?.message ?? `Cloudflare analytics request failed (${response.status})`;
      return buildUnavailableAnalytics(message);
    }

    const zoneAnalytics = payload?.data?.viewer?.zones?.[0];
    if (!zoneAnalytics) {
      return buildUnavailableAnalytics("Cloudflare zone analytics were not returned");
    }

    const totals = zoneAnalytics.totals?.[0];
    const requests = toSafeNumber(totals?.count);
    const visits = toSafeNumber(totals?.sum?.visits);
    const countries = buildCountries(zoneAnalytics.countries, requests);

    return {
      connected: true,
      countries,
      message: "Cloudflare GraphQL Analytics connected",
      sourceLabel: "Cloudflare GraphQL Analytics",
      totals: {
        cachedRequests: 0,
        pageViews: visits,
        requests,
        threats: 0,
        visits
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
    sourceLabel: "Cloudflare GraphQL Analytics pending",
    totals: {
      cachedRequests: 0,
      pageViews: 0,
      requests: 0,
      threats: 0,
      visits: 0
    }
  };
}

function buildCountries(groups: CloudflareGraphqlGroup[] | undefined, totalRequests: number): CloudflareCountryInsight[] {
  if (!groups) {
    return [];
  }

  return groups
    .map((group) => {
      const requests = toSafeNumber(group.count);
      const countryName = group.dimensions?.clientCountryName?.trim() || "Unknown";

      return {
        code: countryName.toUpperCase(),
        label: countryName,
        requests,
        share: totalRequests > 0 ? Math.round((requests / totalRequests) * 100) : 0,
        visits: toSafeNumber(group.sum?.visits)
      };
    })
    .filter((country) => country.requests > 0);
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
