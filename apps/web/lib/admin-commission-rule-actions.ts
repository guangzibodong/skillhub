"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { CommissionRuleRecord } from "@/lib/ops-data";

export type AdminCommissionRuleActionState = {
  message: string;
  rule?: CommissionRuleRecord;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidPlatformFee: "Platform fee must be an integer between 0 and 10000 bps.",
    invalidTime: "Schedule dates must be valid.",
    missingName: "Rule name is required.",
    missingReason: "A finance reason is required.",
    missingToken: "Sign in with a finance or admin account before changing commission rules.",
    saved: "Commission rule scheduled.",
    unableSave: "Unable to create commission rule."
  },
  zh: {
    invalidPlatformFee: "\u5e73\u53f0\u4f63\u91d1\u5fc5\u987b\u662f 0 \u5230 10000 bps \u4e4b\u95f4\u7684\u6574\u6570\u3002",
    invalidTime: "\u6392\u671f\u65f6\u95f4\u5fc5\u987b\u6709\u6548\u3002",
    missingName: "\u8bf7\u586b\u5199\u89c4\u5219\u540d\u79f0\u3002",
    missingReason: "\u8bf7\u586b\u5199\u8d22\u52a1\u8c03\u6574\u539f\u56e0\u3002",
    missingToken: "请先使用具备财务或管理员权限的账号登录，才能调整佣金规则。",
    saved: "\u4f63\u91d1\u89c4\u5219\u5df2\u6392\u671f\u3002",
    unableSave: "\u65e0\u6cd5\u521b\u5efa\u4f63\u91d1\u89c4\u5219\u3002"
  }
} as const;

export async function createAdminCommissionRuleAction(
  locale: Locale,
  _previousState: AdminCommissionRuleActionState,
  formData: FormData
): Promise<AdminCommissionRuleActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const name = String(formData.get("name") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const platformFeeBps = Number(formData.get("platformFeeBps") ?? "");
  let startsAt: string | null = null;
  let endsAt: string | null = null;

  try {
    startsAt = parseDateTime(String(formData.get("startsAt") ?? "").trim(), labels.invalidTime);
    endsAt = parseDateTime(String(formData.get("endsAt") ?? "").trim(), labels.invalidTime);
  } catch (error) {
    return { message: error instanceof Error ? error.message : labels.invalidTime, status: "error" };
  }

  if (!name) {
    return { message: labels.missingName, status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, status: "error" };
  }

  if (!Number.isInteger(platformFeeBps) || platformFeeBps < 0 || platformFeeBps > 10000) {
    return { message: labels.invalidPlatformFee, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/finance/commission-rules`, {
      body: JSON.stringify({
        name,
        platformFeeBps,
        publisherShareBps: 10000 - platformFeeBps,
        reason,
        ...(startsAt ? { startsAt } : {}),
        ...(endsAt ? { endsAt } : {})
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    const payload = (await response.json()) as { rule: CommissionRuleRecord };

    revalidatePath("/admin");

    return { message: labels.saved, rule: payload.rule, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error"
    };
  }
}

function parseDateTime(value: string, invalidMessage: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(invalidMessage);
  }

  return date.toISOString();
}

function getApiUrl() {
  return getServerApiUrl();
}
