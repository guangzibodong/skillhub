import { getServerApiUrl } from "@/lib/api-url";
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
  error: WorkspaceSessionError | null;
  source: "cookie" | "environment" | "none";
  status: "anonymous" | "authenticated" | "invalid" | "unavailable";
  subject: SessionSubject | null;
};

export const authCookieName = "skillhub_user_token";

const sessionMaxAge = 60 * 60 * 24 * 14;

type WorkspaceSessionError = {
  code: "api_unavailable" | "invalid_session";
  message: string;
  status?: number;
};

type SessionSubjectResult =
  | { subject: SessionSubject; type: "ok" }
  | { error: WorkspaceSessionError; type: "invalid" | "unavailable" };

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
      error: null,
      source: "none",
      status: "anonymous",
      subject: null
    };
  }

  const result = await fetchSessionSubjectResult(token);

  if (result.type === "ok") {
    return {
      error: null,
      source: "cookie",
      status: "authenticated",
      subject: result.subject
    };
  }

  return {
    error: result.error,
    source: "cookie",
    status: result.type === "invalid" ? "invalid" : "unavailable",
    subject: null
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
  const result = await fetchSessionSubjectResult(token);
  return result.type === "ok" ? result.subject : null;
}

async function fetchSessionSubjectResult(token: string): Promise<SessionSubjectResult> {
  try {
    const response = await fetch(`${getApiUrl()}/v1/auth/me`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          error: {
            code: "invalid_session",
            message: "Session token is invalid or no longer has access.",
            status: response.status
          },
          type: "invalid"
        };
      }

      return {
        error: {
          code: "api_unavailable",
          message: `Session service returned HTTP ${response.status}.`,
          status: response.status
        },
        type: "unavailable"
      };
    }

    const payload = (await response.json()) as { subject?: SessionSubject };
    if (payload.subject) {
      return { subject: payload.subject, type: "ok" };
    }

    return {
      error: {
        code: "invalid_session",
        message: "Session service did not return a valid subject.",
        status: response.status
      },
      type: "invalid"
    };
  } catch (error) {
    return {
      error: {
        code: "api_unavailable",
        message: error instanceof Error ? error.message : "Session service is unavailable."
      },
      type: "unavailable"
    };
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
  return getServerApiUrl();
}
