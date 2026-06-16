import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authCookieName = "skillhub_user_token";
const internalSessionHeader = "x-skillhub-session-token-b64";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const sessionCookie = request.cookies.get(authCookieName)?.value;

  if (sessionCookie) {
    requestHeaders.set(internalSessionHeader, encodeSessionToken(sessionCookie));
    const strippedCookieHeader = stripCookie(requestHeaders.get("cookie"), authCookieName);

    if (strippedCookieHeader) {
      requestHeaders.set("cookie", strippedCookieHeader);
    } else {
      requestHeaders.delete("cookie");
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  const isWorkspacePath = [
    "/account",
    "/admin",
    "/dashboard",
    "/developer",
    "/publish",
    "/publisher",
    "/role-landing"
  ].some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`));

  response.headers.set("x-url", request.url);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (isWorkspacePath) {
    response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.append("Vary", "Cookie");
  }

  return response;
}

function encodeSessionToken(token: string) {
  return btoa(token).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function stripCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return "";
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith(`${name}=`))
    .join("; ");
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
