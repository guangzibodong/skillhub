import type { Locale } from "@/lib/i18n";
import { getPublicApiUrl, getServerApiUrl } from "@/lib/api-url";
import { demoFallback } from "@/lib/demo-fallback";
import {
  marketplaceSkills,
  type MarketplaceSkill,
} from "@/lib/marketplace-data";
import {
  isVerifiedSkillStatus,
  publicApiInspectCommand,
} from "@/lib/skill-install-state";
import {
  publicSkillDescription,
  publicSkillDisplayName,
} from "@/lib/public-skill-localization";

type PublicPublisherApiSkill = {
  billingModel: MarketplaceSkill["billing"];
  callCount: number;
  description: string;
  displayName: string;
  installCount: number;
  permissionLevel: MarketplaceSkill["risk"];
  priceStatus: "draft" | "active" | "archived";
  slug: string;
  successRate: number | null;
  unitAmountCents: number;
  verificationStatus:
    | "draft"
    | "submitted"
    | "verified"
    | "deprecated"
    | "rejected"
    | "suspended";
  version: string | null;
};

type PublicPublisherApiProfile = {
  createdAt: string;
  displayName: string;
  metrics: PublicPublisherProfile["metrics"];
  payoutStatus:
    | "not_configured"
    | "verification_required"
    | "verified"
    | "blocked";
  skills: PublicPublisherApiSkill[];
  slug: string;
  status: "pending" | "active" | "restricted" | "suspended";
  trustLevel: PublicPublisherProfile["trustLevel"];
  updatedAt: string;
};

export type PublicPublisherSkill = {
  billing: MarketplaceSkill["billing"];
  callCount: number;
  description: Record<Locale, string>;
  displayName: Record<Locale, string>;
  installCommand: string;
  installCount: number;
  permissionLevel: MarketplaceSkill["risk"];
  price: Record<Locale, string>;
  priceStatus: "draft" | "active" | "archived";
  slug: string;
  successRate: number | null;
  verificationStatus: PublicPublisherApiSkill["verificationStatus"];
  version: string | null;
};

export type PublicPublisherProfile = {
  createdAt: string;
  displayName: string;
  metrics: {
    activePaidSkillCount: number;
    avgSuccessRate: number | null;
    callCount: number;
    installCount: number;
    publicSkillCount: number;
    verifiedSkillCount: number;
  };
  payoutStatus: PublicPublisherApiProfile["payoutStatus"];
  skills: PublicPublisherSkill[];
  slug: string;
  status: PublicPublisherApiProfile["status"];
  trustLevel: "verified" | "active" | "limited" | "blocked";
  updatedAt: string;
};

const publisherSlugAliases: Record<string, string> = {
  "skillhub-publisher": "skillhub",
};
const fallbackPublisherSlugAliases: Record<string, string> = {
  skillhub: "skillhub-labs",
};
const publisherDisplayNameSlugs: Record<string, string> = {
  "skillhub publisher": "skillhub",
};

export async function getPublicPublisherProfile(
  slug: string,
): Promise<PublicPublisherProfile | null> {
  const normalizedSlug = publisherSlugFromName(slug);

  if (isAcceptanceQaCatalogRecord(normalizedSlug)) {
    return null;
  }

  const serverApiUrl = getServerApiUrl();

  try {
    const response = await fetch(
      `${serverApiUrl}/v1/publishers/${encodeURIComponent(normalizedSlug)}`,
      {
        cache: "no-store",
      },
    );

    if (response.ok) {
      const payload = (await response.json()) as {
        publisher: PublicPublisherApiProfile;
      };
      return isPublicCatalogPublisherProfile(payload.publisher)
        ? apiProfileToPublicProfile(payload.publisher)
        : null;
    }
  } catch {
    // Static fallback below keeps public pages available when the API is not reachable.
  }

  const fallbackProfiles = fallbackPublicPublishers();
  const fallbackProfile =
    fallbackProfiles.find((profile) => profile.slug === normalizedSlug) ??
    fallbackProfiles.find(
      (profile) => profile.slug === fallbackPublisherSlugAliases[normalizedSlug],
    ) ??
    null;

  return demoFallback(fallbackProfile, null);
}

export async function getPublicPublishers(): Promise<PublicPublisherProfile[]> {
  const serverApiUrl = getServerApiUrl();

  try {
    const response = await fetch(`${serverApiUrl}/v1/publishers?limit=24`, {
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        publishers: PublicPublisherApiProfile[];
      };
      const profiles = payload.publishers
        .filter(isPublicCatalogPublisherProfile)
        .map(apiProfileToPublicProfile);

      if (profiles.length > 0) {
        return profiles;
      }
    }
  } catch {
    // Static fallback below.
  }

  return demoFallback(fallbackPublicPublishers(), []);
}

export function publisherSlugFromName(name: string) {
  const normalizedName = name.trim().toLowerCase();
  const displayNameSlug = publisherDisplayNameSlugs[normalizedName];

  if (displayNameSlug) {
    return displayNameSlug;
  }

  const slug = normalizedName
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return publisherSlugAliases[slug] ?? slug;
}

function apiProfileToPublicProfile(
  profile: PublicPublisherApiProfile,
): PublicPublisherProfile {
  const publicApiUrl = getPublicApiUrl();
  const skills = profile.skills.filter(isPublicCatalogPublisherSkill).map((skill) => ({
    billing: skill.billingModel,
    callCount: skill.callCount,
    description: publicSkillDescription(skill.slug, skill.description),
    displayName: publicSkillDisplayName(skill.slug, skill.displayName),
    installCommand: publicApiInspectCommand(publicApiUrl, skill.slug),
    installCount: skill.installCount,
    permissionLevel: skill.permissionLevel,
    price: formatApiPrice(skill),
    priceStatus: skill.priceStatus,
    slug: skill.slug,
    successRate: skill.successRate,
    verificationStatus: skill.verificationStatus,
    version: skill.version,
  }));

  return {
    ...profile,
    metrics: publisherMetrics(skills),
    skills,
  };
}

function isPublicCatalogPublisherProfile(profile: PublicPublisherApiProfile) {
  return (
    !isAcceptanceQaCatalogRecord(profile.slug, profile.displayName) &&
    profile.skills.some(isPublicCatalogPublisherSkill)
  );
}

function isPublicCatalogPublisherSkill(skill: PublicPublisherApiSkill) {
  return !isAcceptanceQaCatalogRecord(
    skill.slug,
    skill.displayName,
    skill.description,
  );
}

function isAcceptanceQaCatalogRecord(...parts: string[]) {
  const haystack = parts.join(" ").toLowerCase();

  return (
    /acceptance[-_\s]*qa/.test(haystack) ||
    /qa[-_\s]*partner/.test(haystack) ||
    /acceptance[-_\s]*partner/.test(haystack) ||
    /\bqa[-_\s]*20\d{6,}/.test(haystack)
  );
}

function fallbackPublicPublishers(): PublicPublisherProfile[] {
  const groups = new Map<string, MarketplaceSkill[]>();

  marketplaceSkills.forEach((skill) => {
    const slug = publisherSlugFromName(skill.author);
    groups.set(slug, [...(groups.get(slug) ?? []), skill]);
  });

  return Array.from(groups.entries()).map(([slug, skills]) => {
    const publicSkills = skills.map(marketplaceSkillToPublisherSkill);

    return {
      createdAt: "demo",
      displayName: skills[0]?.author ?? "SkillHub Publisher",
      metrics: publisherMetrics(publicSkills),
      payoutStatus: skills.some((skill) => skill.billing !== "free")
        ? "verified"
        : "not_configured",
      skills: publicSkills,
      slug,
      status: "active",
      trustLevel: skills.some((skill) => skill.verification.en === "Verified")
        ? "verified"
        : "active",
      updatedAt: "demo",
    };
  });
}

function marketplaceSkillToPublisherSkill(
  skill: MarketplaceSkill,
): PublicPublisherSkill {
  return {
    billing: skill.billing,
    callCount: parseCompactNumber(skill.installs) * 6,
    description: skill.summary,
    displayName: skill.name,
    installCommand: skill.installsCommand.cli,
    installCount: parseCompactNumber(skill.installs),
    permissionLevel: skill.risk,
    price: skill.price,
    priceStatus: skill.billing === "free" ? "active" : "active",
    slug: skill.slug,
    successRate: parsePercent(skill.successRate),
    verificationStatus: verificationStatusFromLabel(skill.verification.en),
    version: skill.changelog[0]?.version ?? null,
  };
}

function publisherMetrics(
  skills: PublicPublisherSkill[],
): PublicPublisherProfile["metrics"] {
  const successSamples = skills.filter((skill) => skill.successRate !== null);

  return {
    activePaidSkillCount: skills.filter(
      (skill) => skill.priceStatus === "active" && skill.billing !== "free",
    ).length,
    avgSuccessRate:
      successSamples.length > 0
        ? successSamples.reduce(
            (sum, skill) => sum + (skill.successRate ?? 0),
            0,
          ) / successSamples.length
        : null,
    callCount: skills.reduce((sum, skill) => sum + skill.callCount, 0),
    installCount: skills.reduce((sum, skill) => sum + skill.installCount, 0),
    publicSkillCount: skills.length,
    verifiedSkillCount: skills.filter(
      (skill) => skill.verificationStatus === "verified",
    ).length,
  };
}

function formatApiPrice(
  skill: PublicPublisherApiSkill,
): Record<Locale, string> {
  if (skill.billingModel === "free" || skill.unitAmountCents <= 0) {
    return {
      en: "Free",
      zh: "免费",
    };
  }

  const amount = new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 3,
    style: "currency",
  }).format(skill.unitAmountCents / 100);

  if (skill.billingModel === "subscription") {
    return {
      en: `${amount} / month`,
      zh: `${amount} / 月`,
    };
  }

  return {
    en: `${amount} / call`,
    zh: `${amount} / 次`,
  };
}

function verificationStatusFromLabel(
  label: string,
): PublicPublisherSkill["verificationStatus"] {
  const normalized = label.toLowerCase();

  if (isVerifiedSkillStatus(normalized)) {
    return "verified";
  }

  if (normalized.includes("restricted")) {
    return "submitted";
  }

  return "submitted";
}

function parsePercent(value: string) {
  const parsed = Number(value.replace("%", ""));
  return Number.isFinite(parsed) ? parsed / 100 : null;
}

function parseCompactNumber(value: string) {
  const normalized = value.trim().toLowerCase();
  const multiplier = normalized.endsWith("k") ? 1000 : 1;
  const parsed = Number(normalized.replace(/k$/, ""));
  return Number.isFinite(parsed) ? Math.round(parsed * multiplier) : 0;
}
