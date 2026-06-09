import type { Locale } from "@/lib/i18n";

export type SkillInstallState = {
  installable: boolean;
  label: Record<Locale, string>;
  reason: Record<Locale, string>;
};

export function getSkillInstallState(
  verificationStatus: string | undefined,
): SkillInstallState {
  const normalized = String(verificationStatus ?? "").trim().toLowerCase();

  if (isVerifiedSkillStatus(normalized)) {
    return {
      installable: true,
      label: {
        en: "API inspect ready",
        zh: "\u53ef\u901a\u8fc7 API \u67e5\u770b",
      },
      reason: {
        en: "Verified review is complete. Project install and runtime actions still require a signed-in project key.",
        zh: "\u5df2\u5b8c\u6210 verified \u5ba1\u6838\u3002\u9879\u76ee\u5b89\u88c5\u548c\u8fd0\u884c\u8c03\u7528\u4ecd\u9700\u8981\u767b\u5f55\u540e\u7684\u9879\u76ee Key\u3002",
      },
    };
  }

  return {
    installable: false,
    label: {
      en: "Inspection only",
      zh: "\u4ec5\u53ef\u67e5\u770b",
    },
    reason: {
      en: "This listing is not verified yet. Install and runtime commands unlock after approval.",
      zh: "\u8be5\u6280\u80fd\u5c1a\u672a\u5b8c\u6210 verified \u5ba1\u6838\u3002\u5b89\u88c5\u548c\u8fd0\u884c\u547d\u4ee4\u4f1a\u5728\u5ba1\u6838\u901a\u8fc7\u540e\u89e3\u9501\u3002",
    },
  };
}

export function isVerifiedSkillStatus(verificationStatus: string | undefined) {
  const normalized = String(verificationStatus ?? "").trim().toLowerCase();
  return normalized === "verified" || normalized === "approved";
}

export function publicApiInspectCommand(apiUrl: string, slug: string) {
  return `curl "${apiUrl.replace(/\/+$/, "")}/v1/skills/${encodeURIComponent(slug)}"`;
}
