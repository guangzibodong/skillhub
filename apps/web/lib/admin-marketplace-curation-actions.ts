"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { AdminMarketplaceCurationRecord } from "@/lib/ops-data";

export type MarketplaceCurationActionState = {
  curation?: Partial<AdminMarketplaceCurationRecord>;
  message: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    missingReason: "Curation reason is required.",
    missingSkill: "Skill slug is required.",
    missingToken: "Sign in with an admin or reviewer token before managing ranking controls.",
    saved: "Marketplace ranking control saved.",
    unableSave: "Unable to save marketplace ranking control."
  },
  zh: {
    missingReason: "\u5fc5\u987b\u586b\u5199\u7b56\u7565\u539f\u56e0\u3002",
    missingSkill: "\u5fc5\u987b\u63d0\u4f9b\u6280\u80fd slug\u3002",
    missingToken: "\u8bf7\u5148\u7528 admin \u6216 reviewer token \u767b\u5f55\uff0c\u624d\u80fd\u7ba1\u7406\u6392\u540d\u63a7\u5236\u3002",
    saved: "\u5e02\u573a\u6392\u540d\u63a7\u5236\u5df2\u4fdd\u5b58\u3002",
    unableSave: "\u65e0\u6cd5\u4fdd\u5b58\u5e02\u573a\u6392\u540d\u63a7\u5236\u3002"
  }
} as const;

export async function saveMarketplaceCurationAction(
  locale: Locale,
  _previousState: MarketplaceCurationActionState,
  formData: FormData
): Promise<MarketplaceCurationActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const endsAt = String(formData.get("endsAt") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, skillSlug, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, skillSlug, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/marketplace-curation/${encodeURIComponent(skillSlug)}`, {
      body: JSON.stringify({
        boost: String(formData.get("boost") ?? "0").trim(),
        endsAt,
        placement: String(formData.get("placement") ?? "standard").trim(),
        reason
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "PUT"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    const payload = (await response.json()) as { curation: Partial<AdminMarketplaceCurationRecord> };
    revalidatePath("/admin");
    revalidatePath("/marketplace");

    return {
      curation: payload.curation,
      message: labels.saved,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      skillSlug,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
