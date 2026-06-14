"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type AbuseReportActionState = {
  message: string;
  reportId?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidAction: "Action must be triage, dismiss, warn, restrict, suspend, or resolve.",
    missingReason: "Decision reason is required.",
    missingReport: "Missing abuse report id.",
    missingToken: "Sign in with a platform admin account before handling abuse reports.",
    saved: "Trust action recorded.",
    unableSave: "Unable to update abuse report."
  },
  zh: {
    invalidAction: "处理动作必须是 triage、dismiss、warn、restrict、suspend 或 resolve。",
    missingReason: "必须填写处理原因。",
    missingReport: "缺少举报 ID。",
    missingToken: "请先使用具备平台管理员权限的账号登录，才能处理举报。",
    saved: "信任安全处理已记录。",
    unableSave: "无法更新举报。"
  }
} as const;

const allowedActions = ["triage", "dismiss", "warn", "restrict", "suspend", "resolve"] as const;

export async function decideAbuseReportAction(
  locale: Locale,
  _previousState: AbuseReportActionState,
  formData: FormData
): Promise<AbuseReportActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const reportId = String(formData.get("reportId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reportId) {
    return { message: labels.missingReport, status: "error" };
  }

  if (!allowedActions.includes(action as (typeof allowedActions)[number])) {
    return { message: labels.invalidAction, reportId, status: "error" };
  }

  if (!reason) {
    return { message: labels.missingReason, reportId, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, reportId, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/abuse-reports/${encodeURIComponent(reportId)}/decision`, {
      body: JSON.stringify({
        action,
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
      throw new Error(payload.error ?? labels.unableSave);
    }

    revalidatePath("/admin");

    return { message: labels.saved, reportId, status: "success" };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      reportId,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
