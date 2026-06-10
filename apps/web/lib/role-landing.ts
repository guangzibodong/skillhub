import type { SessionSubject } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

const adminRoles = new Set(["admin", "finance", "reviewer", "support", "super_admin"]);

export function roleLandingPath(subject: SessionSubject | null | undefined, locale: Locale) {
  const suffix = locale === "zh" ? "?lang=zh" : "?lang=en";

  if (!subject) {
    return `/login${suffix}`;
  }

  const roles = new Set([subject.platformRole, ...subject.roles].filter(Boolean));

  if (Array.from(adminRoles).some((role) => roles.has(role))) {
    return `/admin${suffix}`;
  }

  if (roles.has("publisher")) {
    return `/publisher${suffix}`;
  }

  if (roles.has("developer")) {
    return `/developer${suffix}`;
  }

  if (roles.has("owner")) {
    return `/dashboard${suffix}`;
  }

  return `/account${suffix}`;
}

