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

export type PublicSkillActionState = {
  canInspectPublicly: boolean;
  canInstallNow: boolean;
  canShowInstallSectionTitle: boolean;
  canShowProjectHandoff: boolean;
  canShowRuntimeTest: boolean;
  kind: "authenticated_install" | "verified_gated" | "inspection_only";
  readinessTitle: Record<Locale, string>;
  sectionTitle: Record<Locale, string>;
  summary: Record<Locale, string>;
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

export function getPublicSkillActionState(
  verificationStatus: string | undefined,
  hasAuthenticatedInstallAccess = false,
): PublicSkillActionState {
  const normalized = String(verificationStatus ?? "").trim().toLowerCase();

  if (!isVerifiedSkillStatus(normalized)) {
    return {
      canInspectPublicly: true,
      canInstallNow: false,
      canShowInstallSectionTitle: false,
      canShowProjectHandoff: false,
      canShowRuntimeTest: false,
      kind: "inspection_only",
      readinessTitle: {
        en: "Availability details",
        zh: "\u53ef\u7528\u72b6\u6001\u8bf4\u660e",
      },
      sectionTitle: {
        en: "Availability",
        zh: "\u53ef\u7528\u72b6\u6001",
      },
      summary: {
        en: "Inspection only. This skill is submitted but not verified yet. You can inspect its manifest, schemas, permissions, publisher, and review state. Install, project handoff, runtime test, subscription, billing, and ledger actions unlock only after verified approval.",
        zh: "\u4ec5\u53ef\u67e5\u770b\u3002\u8be5\u6280\u80fd\u5df2\u63d0\u4ea4\u4f46\u5c1a\u672a\u901a\u8fc7\u9a8c\u8bc1\u5ba1\u6838\u3002\u4f60\u53ef\u4ee5\u67e5\u770b manifest\u3001schema\u3001\u6743\u9650\u3001\u53d1\u5e03\u8005\u548c\u5ba1\u6838\u72b6\u6001\u3002\u5b89\u88c5\u3001\u9879\u76ee\u4ea4\u63a5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u8ba2\u9605\u3001\u8ba1\u8d39\u548c\u8d26\u672c\u64cd\u4f5c\u53ea\u4f1a\u5728\u9a8c\u8bc1\u901a\u8fc7\u540e\u89e3\u9501\u3002",
      },
    };
  }

  if (!hasAuthenticatedInstallAccess) {
    return {
      canInspectPublicly: true,
      canInstallNow: false,
      canShowInstallSectionTitle: false,
      canShowProjectHandoff: true,
      canShowRuntimeTest: false,
      kind: "verified_gated",
      readinessTitle: {
        en: "Availability details",
        zh: "\u53ef\u7528\u72b6\u6001\u8bf4\u660e",
      },
      sectionTitle: {
        en: "Availability",
        zh: "\u53ef\u7528\u72b6\u6001",
      },
      summary: {
        en: "This verified skill can be inspected publicly. Saving, installing, runtime testing, project keys, billing, ledger, and feedback actions require sign-in and project policy checks.",
        zh: "\u8be5\u5df2\u9a8c\u8bc1\u6280\u80fd\u53ef\u516c\u5f00\u67e5\u770b\u3002\u4fdd\u5b58\u3001\u5b89\u88c5\u3001\u8fd0\u884c\u6d4b\u8bd5\u3001\u9879\u76ee Key\u3001\u8ba1\u8d39\u3001\u8d26\u672c\u548c\u53cd\u9988\u64cd\u4f5c\u90fd\u9700\u8981\u767b\u5f55\u5e76\u901a\u8fc7\u9879\u76ee\u7b56\u7565\u68c0\u67e5\u3002",
      },
    };
  }

  return {
    canInspectPublicly: true,
    canInstallNow: true,
    canShowInstallSectionTitle: true,
    canShowProjectHandoff: true,
    canShowRuntimeTest: true,
    kind: "authenticated_install",
    readinessTitle: {
      en: "Install readiness",
      zh: "\u5b89\u88c5\u51c6\u5907",
    },
    sectionTitle: {
      en: "Install",
      zh: "\u5b89\u88c5",
    },
    summary: {
      en: "Verified review is complete. Project install and runtime actions write authenticated project state and remain governed by project policy, budget, and key checks.",
      zh: "\u5df2\u5b8c\u6210\u9a8c\u8bc1\u5ba1\u6838\u3002\u9879\u76ee\u5b89\u88c5\u548c\u8fd0\u884c\u64cd\u4f5c\u4f1a\u5199\u5165\u5df2\u767b\u5f55\u7684\u9879\u76ee\u72b6\u6001\uff0c\u5e76\u7ee7\u7eed\u53d7\u9879\u76ee\u7b56\u7565\u3001\u9884\u7b97\u548c Key \u68c0\u67e5\u7ba1\u63a7\u3002",
    },
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
