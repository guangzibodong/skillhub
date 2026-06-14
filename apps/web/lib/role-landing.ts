import type { SessionSubject } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

const adminRoles = new Set(["admin", "finance", "reviewer", "support", "super_admin"]);
const developerRoles = new Set(["developer", "owner", "admin", "super_admin"]);
const publisherRoles = new Set(["publisher", "owner", "admin", "super_admin"]);
const dashboardRoles = new Set(["developer", "publisher", "owner", "admin", "super_admin"]);

export function roleLandingPath(subject: SessionSubject | null | undefined, locale: Locale) {
  const suffix = locale === "zh" ? "?lang=zh" : "?lang=en";

  if (!subject) {
    return `/login${suffix}`;
  }

  if (adminRoles.has(subject.platformRole)) {
    return `/admin${suffix}`;
  }

  const roles = subjectRoleSet(subject);

  if (roles.has("publisher")) {
    return `/publisher${suffix}`;
  }

  if (roles.has("developer")) {
    return `/developer${suffix}`;
  }

  if (roles.has("owner")) {
    return `/developer${suffix}`;
  }

  return `/account${suffix}`;
}

export function roleCanOpenRequestedPath(subject: SessionSubject | null | undefined, path: string) {
  if (!subject) {
    return false;
  }

  const pathname = path.split(/[?#]/)[0] ?? "";

  if (!pathname || isRoute(pathname, "/login") || isRoute(pathname, "/role-landing") || isRoute(pathname, "/admin-login")) {
    return false;
  }

  if (isRoute(pathname, "/admin")) {
    return adminRoles.has(subject.platformRole);
  }

  const roles = subjectRoleSet(subject);

  if (isRoute(pathname, "/publisher")) {
    return hasAnyRole(roles, publisherRoles);
  }

  if (isRoute(pathname, "/developer")) {
    return hasAnyRole(roles, developerRoles);
  }

  if (isRoute(pathname, "/dashboard")) {
    return hasAnyRole(roles, dashboardRoles);
  }

  return true;
}

function subjectRoleSet(subject: SessionSubject) {
  return new Set([subject.platformRole, ...subject.roles].filter(Boolean));
}

function hasAnyRole(roles: Set<string>, allowedRoles: Set<string>) {
  return Array.from(allowedRoles).some((role) => roles.has(role));
}

function isRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}
