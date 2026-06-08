"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectInstallActionState = {
  message: string;
  status: "idle" | "success" | "error";
  updatedSkillSlug?: string;
};

const actionCopy = {
  en: {
    invalidSkill: "Missing skill slug.",
    invalidStatus: "Install status must be installed, suspended, or removed.",
    missingToken: "Sign in with a SkillHub workspace account before updating installed skills.",
    saved: "Installed skill status updated.",
    unableSave: "Unable to update installed skill."
  },
  zh: {
    invalidSkill: "缺少技能 slug。",
    invalidStatus: "安装状态必须是 installed、suspended 或 removed。",
    missingToken: "请先登录 SkillHub 工作区账号，才能更新已安装技能。",
    saved: "已安装技能状态已更新。",
    unableSave: "无法更新已安装技能。"
  }
} as const;

const sensitiveActionCopy = {
  en: {
    invalidRemoveConfirmation: "Type REMOVE before removing this installed skill.",
    invalidSuspendConfirmation: "Type SUSPEND before suspending this installed skill.",
    missingReason: "A reason is required before suspending or removing an installed skill."
  },
  zh: {
    invalidRemoveConfirmation: "\u79fb\u9664\u5df2\u5b89\u88c5\u6280\u80fd\u524d\uff0c\u8bf7\u8f93\u5165 REMOVE\u3002",
    invalidSuspendConfirmation: "\u6682\u505c\u5df2\u5b89\u88c5\u6280\u80fd\u524d\uff0c\u8bf7\u8f93\u5165 SUSPEND\u3002",
    missingReason: "\u6682\u505c\u6216\u79fb\u9664\u5df2\u5b89\u88c5\u6280\u80fd\u524d\u5fc5\u987b\u586b\u5199\u539f\u56e0\u3002"
  }
} as const;

const installStatuses = ["installed", "suspended", "removed"] as const;

export async function updateProjectSkillInstallStatusAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectInstallActionState,
  formData: FormData
): Promise<ProjectInstallActionState> {
  const labels = actionCopy[locale];
  const sensitiveLabels = sensitiveActionCopy[locale];
  const token = await getWorkspaceToken();
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!skillSlug) {
    return { message: labels.invalidSkill, status: "error" };
  }

  if (!installStatuses.includes(status as (typeof installStatuses)[number])) {
    return { message: labels.invalidStatus, status: "error", updatedSkillSlug: skillSlug };
  }

  if (status === "suspended" || status === "removed") {
    const expectedConfirmation = status === "suspended" ? "SUSPEND" : "REMOVE";

    if (reason.length < 6) {
      return { message: sensitiveLabels.missingReason, status: "error", updatedSkillSlug: skillSlug };
    }

    if (confirmation.toUpperCase() !== expectedConfirmation) {
      return {
        message: status === "suspended" ? sensitiveLabels.invalidSuspendConfirmation : sensitiveLabels.invalidRemoveConfirmation,
        status: "error",
        updatedSkillSlug: skillSlug
      };
    }
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", updatedSkillSlug: skillSlug };
  }

  try {
    const response = await fetch(
      `${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/installed-skills/${encodeURIComponent(skillSlug)}/status`,
      {
        body: JSON.stringify({ reason, status }),
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
