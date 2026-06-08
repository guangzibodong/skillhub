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

export type MarketplaceCurationAppealActionState = {
  appealId?: string;
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    appealSaved: "Marketplace distribution appeal updated.",
    missingReason: "Curation reason is required.",
    missingSkill: "Skill slug is required.",
    missingToken: "Sign in with an admin or reviewer account before managing ranking controls.",
    saved: "Marketplace ranking control saved.",
    unableAppeal: "Unable to update marketplace distribution appeal.",
    unableSave: "Unable to save marketplace ranking control."
  },
  zh: {
    appealSaved: "\u5e02\u573a\u5206\u53d1\u7533\u8bc9\u5df2\u5904\u7406\u3002",
    missingReason: "\u5fc5\u987b\u586b\u5199\u7b56\u7565\u539f\u56e0\u3002",
    missingSkill: "\u5fc5\u987b\u63d0\u4f9b\u6280\u80fd slug\u3002",
    missingToken: "请先使用具备 admin 或 reviewer 角色的账号登录，才能管理排名控制。",
    saved: "\u5e02\u573a\u6392\u540d\u63a7\u5236\u5df2\u4fdd\u5b58\u3002",
    unableAppeal: "\u65e0\u6cd5\u5904\u7406\u5e02\u573a\u5206\u53d1\u7533\u8bc9\u3002",
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

export async function decideMarketplaceCurationAppealAction(
  locale: Locale,
  _previousState: MarketplaceCurationAppealActionState,
  formData: FormData
): Promise<MarketplaceCurationAppealActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const appealId = String(formData.get("appealId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!appealId) {
    return { message: "Appeal id is required.", status: "error" };
  }

  if (!reason) {
    return { appealId, message: labels.missingReason, status: "error" };
  }

  if (!token) {
    return { appealId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/marketplace-curation/appeals/${encodeURIComponent(appealId)}/decision`, {
      body: JSON.stringify({
        action: String(formData.get("action") ?? "review").trim(),
        boost: String(formData.get("boost") ?? "").trim(),
        endsAt: String(formData.get("endsAt") ?? "").trim(),
        placement: String(formData.get("placement") ?? "").trim(),
        reason
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableAppeal);
    }

    revalidatePath("/admin");
    revalidatePath("/marketplace");
    revalidatePath("/publisher");
    revalidatePath("/dashboard");

    return {
      appealId,
      message: labels.appealSaved,
      status: "success"
    };
  } catch (error) {
    return {
      appealId,
      message: error instanceof Error ? error.message : labels.unableAppeal,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
