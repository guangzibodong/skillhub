"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectPolicyActionState = {
  message: string;
  status: "idle" | "success" | "error";
  updatedSkillSlug?: string;
};

const actionCopy = {
  en: {
    invalidBudget: "Budget must be zero or greater.",
    invalidPermission: "Invalid permission level.",
    invalidRateLimit: "Rate limit must be empty or greater than zero.",
    invalidSkill: "Missing skill slug.",
    missingToken: "Sign in with a SkillHub workspace account before updating project policies.",
    saved: "Project skill policy saved.",
    unableSave: "Unable to save project policy."
  },
  zh: {
    invalidBudget: "预算必须大于或等于 0。",
    invalidPermission: "权限等级无效。",
    invalidRateLimit: "速率限制必须为空或大于 0。",
    invalidSkill: "缺少技能 slug。",
    missingToken: "请先登录 SkillHub 工作区账号，才能更新项目策略。",
    saved: "项目技能策略已保存。",
    unableSave: "无法保存项目策略。"
  }
} as const;

const permissionLevels = ["low", "medium", "high"] as const;
const filesystemLevels = ["none", "read", "write"] as const;

export async function updateProjectSkillPolicyAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectPolicyActionState,
  formData: FormData
): Promise<ProjectPolicyActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const maxPermissionLevel = String(formData.get("maxPermissionLevel") ?? "");
  const filesystemAccess = String(formData.get("filesystemAccess") ?? "");
  const budgetValue = Number(formData.get("monthlyBudgetDollars") ?? 0);
  const rateLimitValue = String(formData.get("rateLimitPerMinute") ?? "").trim();
  const confirmation = String(formData.get("confirmation") ?? "").trim().toUpperCase();
  const reason = String(formData.get("reason") ?? "").trim();
  const missingConfirmation =
    locale === "zh" ? "\u8bf7\u8f93\u5165 POLICY \u786e\u8ba4\u8fd9\u6b21\u7b56\u7565\u53d8\u66f4\u3002" : "Type POLICY to confirm this policy change.";
  const missingReason =
    locale === "zh" ? "\u8bf7\u8bb0\u5f55\u8fd9\u6b21\u7b56\u7565\u53d8\u66f4\u7684\u539f\u56e0\u3002" : "Record a reason for this policy change.";

  if (!skillSlug) {
    return { message: labels.invalidSkill, status: "error" };
  }

  if (!permissionLevels.includes(maxPermissionLevel as (typeof permissionLevels)[number])) {
    return { message: labels.invalidPermission, status: "error", updatedSkillSlug: skillSlug };
  }

  if (!filesystemLevels.includes(filesystemAccess as (typeof filesystemLevels)[number])) {
    return { message: labels.invalidPermission, status: "error", updatedSkillSlug: skillSlug };
  }

  if (!Number.isFinite(budgetValue) || budgetValue < 0) {
    return { message: labels.invalidBudget, status: "error", updatedSkillSlug: skillSlug };
  }

  const rateLimitPerMinute =
    rateLimitValue.length === 0 ? null : Number.isFinite(Number(rateLimitValue)) ? Math.trunc(Number(rateLimitValue)) : Number.NaN;

  if (Number.isNaN(rateLimitPerMinute) || (rateLimitPerMinute !== null && rateLimitPerMinute <= 0)) {
    return { message: labels.invalidRateLimit, status: "error", updatedSkillSlug: skillSlug };
  }

  if (confirmation !== "POLICY") {
    return { message: missingConfirmation, status: "error", updatedSkillSlug: skillSlug };
  }

  if (!reason) {
    return { message: missingReason, status: "error", updatedSkillSlug: skillSlug };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedSkillSlug: skillSlug };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/policies/${encodeURIComponent(skillSlug)}`,
      {
        body: JSON.stringify({
          allowBrowser: formData.get("allowBrowser") === "on",
          allowNetwork: formData.get("allowNetwork") === "on",
          allowSecretAccess: formData.get("allowSecretAccess") === "on",
          approvalRequired: formData.get("approvalRequired") === "on",
          filesystemAccess,
          maxPermissionLevel,
          monthlyBudgetCents: Math.round(budgetValue * 100),
          reason,
          rateLimitPerMinute
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "PUT"
      }
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableSave);
    }

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return {
      message: labels.saved,
      status: "success",
      updatedSkillSlug: skillSlug
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error",
      updatedSkillSlug: skillSlug
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
