import { cookies } from "next/headers";

export type SessionSubject = {
  displayName: string | null;
  email: string | null;
  organizationId: string | null;
  platformRole: string;
  roles: string[];
  tokenId: string | null;
  type: "service" | "user";
  userId: string | null;
};

export type WorkspaceSession = {
  source: "cookie" | "environment" | "none";
  subject: SessionSubject | null;
  token: string | null;
};

export const authCookieName = "skillhub_user_token";

const sessionMaxAge = 60 * 60 * 24 * 14;

export async function getSessionToken() {
  const cookieStore = await cookies();
  return normalizeToken(cookieStore.get(authCookieName)?.value);
}

export async function getWorkspaceToken() {
  return getSessionToken();
}

export async function getUserToken() {
  return getSessionToken();
}

export async function getAdminOperatorToken() {
  return getSessionToken();
}

export async function getWorkspaceSession(): Promise<WorkspaceSession> {
  const sessionToken = await getSessionToken();
  const token = sessionToken ?? null;

  if (!token) {
    return {
      source: "none",
      subject: null,
      token: null
    };
  }

  return {
    source: "cookie",
    subject: await fetchSessionSubject(token),
    token
  };
}

export async function setSessionCookie(
  token: string,
  options: { persistent?: boolean } = {},
) {
  const cookieStore = await cookies();
  const persistent = options.persistent ?? true;

  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    ...(persistent ? { maxAge: sessionMaxAge } : {}),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function fetchSessionSubject(token: string): Promise<SessionSubject | null> {
  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { subject?: SessionSubject };
    return payload.subject ?? null;
  } catch {
    return null;
  }
}

export function publicTokenLabel(token: string | null | undefined) {
  const normalized = normalizeToken(token);

  if (!normalized) {
    return "none";
  }

  if (normalized.length <= 12) {
    return "configured";
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

function normalizeToken(value: string | undefined | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
