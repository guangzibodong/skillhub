"use server";

import { revalidatePath } from "next/cache";
import { getAdminOperatorToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { AdminIncidentRecord } from "@/lib/ops-data";

export type AdminIncidentActionState = {
  incident?: AdminIncidentRecord;
  incidentId?: string;
  message: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    created: "Runtime incident opened.",
    missingIncident: "Missing incident id.",
    missingReason: "Incident decision reason is required.",
    missingSkill: "Skill slug is required.",
    missingTitle: "Incident title is required.",
    missingToken: "Sign in with a trust/admin token or configure SKILLHUB_ADMIN_TOKEN before managing incidents.",
    updated: "Runtime incident updated.",
    unableCreate: "Unable to create incident.",
    unableUpdate: "Unable to update incident."
  },
  zh: {
    created: "运行事故已创建。",
    missingIncident: "缺少事故 ID。",
    missingReason: "必须填写事故处理原因。",
    missingSkill: "必须填写技能 slug。",
    missingTitle: "必须填写事故标题。",
    missingToken: "请先用信任安全或管理员 token 登录，或配置 SKILLHUB_ADMIN_TOKEN，才能管理运行事故。",
    updated: "运行事故已更新。",
    unableCreate: "无法创建事故。",
    unableUpdate: "无法更新事故。"
  }
} as const;

export async function createAdminIncidentAction(
  locale: Locale,
  _previousState: AdminIncidentActionState,
  formData: FormData
): Promise<AdminIncidentActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const severity = String(formData.get("severity") ?? "medium").trim();

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (!title) {
    return { message: labels.missingTitle, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/incidents`, {
      body: JSON.stringify({
        severity,
        skillSlug,
        summary,
        title
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableCreate);
    }

    const payload = (await response.json()) as { incident: AdminIncidentRecord };
    revalidatePath("/admin");

    return {
      incident: payload.incident,
      incidentId: payload.incident.id,
      message: labels.created,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableCreate,
      status: "error"
    };
  }
}

export async function decideAdminIncidentAction(
  locale: Locale,
  _previousState: AdminIncidentActionState,
  formData: FormData
): Promise<AdminIncidentActionState> {
  const labels = copy[locale];
  const token = await getAdminOperatorToken();
  const incidentId = String(formData.get("incidentId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const severity = String(formData.get("severity") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!incidentId) {
    return { message: labels.missingIncident, status: "error" };
  }

  if (!reason) {
    return { incidentId, message: labels.missingReason, status: "error" };
  }

  if (!token) {
    return { incidentId, message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/admin/incidents/${encodeURIComponent(incidentId)}/decision`, {
      body: JSON.stringify({
        reason,
        severity,
        status
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableUpdate);
    }

    const payload = (await response.json()) as { incident: AdminIncidentRecord };
    revalidatePath("/admin");

    return {
      incident: payload.incident,
      incidentId,
      message: labels.updated,
      status: "success"
    };
  } catch (error) {
    return {
      incidentId,
      message: error instanceof Error ? error.message : labels.unableUpdate,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
