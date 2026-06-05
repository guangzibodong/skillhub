import { getUserToken } from "@/lib/auth-session";

export type AuthProviderStatus = {
  canDisconnect?: boolean;
  connectedAt?: string | null;
  description: string;
  disconnectUrl?: string | null;
  emailVerified?: boolean;
  label: string;
  lastLoginAt?: string | null;
  provider: "email" | "github" | "google" | "token";
  providerEmail?: string | null;
  startUrl: string | null;
  status: "active" | "configuration_required" | "connected" | "deferred";
  type: "email" | "oauth" | "token";
};

export type AccountSummary = {
  loginMethods: AuthProviderStatus[];
  membership: {
    memberSince: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
  } | null;
  memberships: Array<{
    memberSince: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
  }>;
  organization: {
    createdAt: string;
    id: string;
    name: string;
    slug: string;
  } | null;
  profile: {
    createdAt: string | null;
    displayName: string | null;
    email: string | null;
    platformRole: string;
    userId: string | null;
  };
  session: {
    createdAt: string;
    expiresAt: string | null;
    lastUsedAt: string | null;
    name: string;
    revokedAt: string | null;
    scopes: string[];
    tokenId: string;
    tokenLast4: string;
    tokenPrefix: string;
  } | null;
  workspace: {
    activeTokenCount: number;
    billingProfileComplete: boolean;
    invoiceReady: boolean;
    notificationPreferenceCount: number;
    paymentMethodCount: number;
    payoutStatus: string;
    projectCount: number;
    publisherProfileStatus: string;
    skillCount: number;
    teamMemberCount: number;
    unreadNotifications: number;
  };
};

export type AccountSessionRecord = {
  createdAt: string;
  expiresAt: string | null;
  isCurrent: boolean;
  lastUsedAt: string | null;
  name: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationSlug: string | null;
  revokedAt: string | null;
  scopes: string[];
  status: "active" | "expired" | "revoked";
  tokenId: string;
  tokenLast4: string;
  tokenPrefix: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";

const fallbackProviders: AuthProviderStatus[] = [
  {
    description: "Self-service email workspace registration is live.",
    label: "Email registration",
    provider: "email",
    startUrl: "/v1/auth/signup",
    status: "active",
    type: "email"
  },
  {
    description: "Google OAuth needs provider credentials and callback configuration before live redirect is enabled.",
    label: "Google",
    provider: "google",
    startUrl: null,
    status: "configuration_required",
    type: "oauth"
  },
  {
    description: "GitHub OAuth needs provider credentials and callback configuration before live redirect is enabled.",
    label: "GitHub",
    provider: "github",
    startUrl: null,
    status: "configuration_required",
    type: "oauth"
  },
  {
    description: "User access tokens remain available for team invites and operator fallback.",
    label: "User token",
    provider: "token",
    startUrl: null,
    status: "active",
    type: "token"
  }
];

export const emptyAccountSummary: AccountSummary = {
  loginMethods: fallbackProviders,
  membership: null,
  memberships: [],
  organization: null,
  profile: {
    createdAt: null,
    displayName: null,
    email: null,
    platformRole: "user",
    userId: null
  },
  session: null,
  workspace: {
    activeTokenCount: 0,
    billingProfileComplete: false,
    invoiceReady: false,
    notificationPreferenceCount: 0,
    paymentMethodCount: 0,
    payoutStatus: "not_configured",
    projectCount: 0,
    publisherProfileStatus: "not_configured",
    skillCount: 0,
    teamMemberCount: 0,
    unreadNotifications: 0
  }
};

export async function getAuthProviders(): Promise<AuthProviderStatus[]> {
  try {
    const response = await fetch(`${apiUrl}/v1/auth/providers`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Auth providers failed: ${response.status}`);
    }

    const payload = (await response.json()) as { providers?: AuthProviderStatus[] };
    return payload.providers?.length ? payload.providers : fallbackProviders;
  } catch {
    return fallbackProviders;
  }
}

export async function getAccountSummary(): Promise<AccountSummary> {
  const token = await getUserToken();

  if (!token) {
    return emptyAccountSummary;
  }

  try {
    const response = await fetch(`${apiUrl}/v1/account`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Account summary failed: ${response.status}`);
    }

    const payload = (await response.json()) as { account?: AccountSummary };
    return payload.account ?? emptyAccountSummary;
  } catch {
    return emptyAccountSummary;
  }
}

export async function getAccountSessions(): Promise<AccountSessionRecord[]> {
  const token = await getUserToken();

  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/v1/account/sessions`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Account sessions failed: ${response.status}`);
    }

    const payload = (await response.json()) as { sessions?: AccountSessionRecord[] };
    return payload.sessions ?? [];
  } catch {
    return [];
  }
}
