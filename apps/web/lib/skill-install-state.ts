import type { Locale } from "@/lib/i18n";

export type SkillInstallState = {
  installable: boolean;
  label: Record<Locale, string>;
  reason: Record<Locale, string>;
};

export type SkillAvailability =
  | {
      canInspect: true;
      canInstall: true;
      canRunTest: true;
      canShowBillingGate: true;
      canShowProjectHandoff: true;
      kind: "callable";
      label: Record<Locale, string>;
      reason: Record<Locale, string>;
    }
  | {
      canInspect: true;
      canInstall: false;
      canRunTest: false;
      canShowBillingGate: false;
      canShowProjectHandoff: false;
      kind: "inspection_only";
      label: Record<Locale, string>;
      reason: Record<Locale, string>;
    };

export function getSkillInstallState(
  verificationStatus: string | undefined,
): SkillInstallState {
  const availability = getSkillAvailability(verificationStatus);

  return {
    installable: availability.canInstall,
    label: availability.label,
    reason: availability.reason,
  };
}

export function getSkillAvailability(
  verificationStatus: string | undefined,
): SkillAvailability {
  const normalized = String(verificationStatus ?? "").trim().toLowerCase();

  if (isVerifiedSkillStatus(normalized)) {
    return {
      canInspect: true,
      canInstall: true,
      canRunTest: true,
      canShowBillingGate: true,
      canShowProjectHandoff: true,
      kind: "callable",
      label: {
        en: "Callable after project setup",
        zh: "\u9879\u76ee\u914d\u7f6e\u540e\u53ef\u8c03\u7528",
      },
      reason: {
        en: "Verified review is complete. Project install and runtime actions still require a signed-in project key.",
        zh: "\u5df2\u5b8c\u6210 verified \u5ba1\u6838\u3002\u9879\u76ee\u5b89\u88c5\u548c\u8fd0\u884c\u8c03\u7528\u4ecd\u9700\u8981\u767b\u5f55\u540e\u7684\u9879\u76ee Key\u3002",
      },
    };
  }

  return {
    canInspect: true,
    canInstall: false,
    canRunTest: false,
    canShowBillingGate: false,
    canShowProjectHandoff: false,
    kind: "inspection_only",
    label: {
      en: "Inspection only",
      zh: "\u4ec5\u53ef\u67e5\u770b",
    },
    reason: {
      en: "This skill is submitted but not verified yet. You can inspect its manifest, schemas, permissions, publisher, and review state. Install, project handoff, runtime test, subscription, billing, and ledger actions unlock only after verified approval.",
      zh: "\u8be5\u6280\u80fd\u5df2\u63d0\u4ea4\u4f46\u5c1a\u672a\u901a\u8fc7\u9a8c\u8bc1\u5ba1\u6838\u3002\u4f60\u53ef\u4ee5\u67e5\u770b manifest\u3001schema\u3001\u6743\u9650\u3001\u53d1\u5e03\u8005\u548c\u5ba1\u6838\u72b6\u6001\u3002\u5b89\u88c5\u3001\u9879\u76ee\u4ea4\u63a5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u8ba2\u9605\u3001\u8ba1\u8d39\u548c\u8d26\u672c\u64cd\u4f5c\u53ea\u4f1a\u5728\u9a8c\u8bc1\u901a\u8fc7\u540e\u89e3\u9501\u3002",
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
