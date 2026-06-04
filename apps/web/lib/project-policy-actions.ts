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
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before updating project policies.",
    saved: "Project skill policy saved.",
    unableSave: "Unable to save project policy."
  },
  zh: {
    invalidBudget: "预算必须大于或等于 0。",
    invalidPermission: "权限等级无效。",
    invalidRateLimit: "速率限制必须为空或大于 0。",
    invalidSkill: "缺少技能 slug。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能更新项目策略。",
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
