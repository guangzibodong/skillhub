"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type SkillProjectActionIntent = "install" | "save";

export type SkillProjectActionState = {
  intent?: SkillProjectActionIntent;
  message: string;
  projectSlug?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    installed: "Skill installed to the selected project. Review policy, budget, and runtime approval before production use.",
    invalidIntent: "Choose whether to save or install this skill.",
    missingProject: "Choose a project before continuing.",
    missingSkill: "Missing skill slug.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before saving or installing skills.",
    saved: "Skill saved to the selected project collection.",
    unableInstall: "Unable to install skill.",
    unableSave: "Unable to save skill."
  },
  zh: {
    installed: "技能已安装到所选项目。生产使用前请在项目后台确认策略、预算和运行审批。",
    invalidIntent: "请选择保存技能或安装技能。",
    missingProject: "请先选择一个项目。",
    missingSkill: "缺少技能 slug。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能保存或安装技能。",
    saved: "技能已保存到所选项目集合。",
    unableInstall: "无法安装技能。",
    unableSave: "无法保存技能。"
  }
} as const;

export async function submitSkillProjectAction(
  locale: Locale,
  skillSlug: string,
  _previousState: SkillProjectActionState,
  formData: FormData
): Promise<SkillProjectActionState> {
  const labels = copy[locale];
  const intent = String(formData.get("intent") ?? "") as SkillProjectActionIntent;
  const projectSlug = String(formData.get("projectSlug") ?? "").trim();
  const normalizedSkillSlug = skillSlug.trim();

  if (!["install", "save"].includes(intent)) {
    return { message: labels.invalidIntent, status: "error" };
  }

  if (!projectSlug) {
    return { intent, message: labels.missingProject, status: "error" };
  }

  if (!normalizedSkillSlug) {
    return { intent, message: labels.missingSkill, projectSlug, status: "error" };
  }

  const token = await getWorkspaceToken();

  if (!token) {
    return { intent, message: labels.missingToken, projectSlug, status: "error" };
  }

  return intent === "save"
    ? saveSkillToProject({ labels, projectSlug, skillSlug: normalizedSkillSlug, token, formData })
    : installSkillToProject({ labels, projectSlug, skillSlug: normalizedSkillSlug, token, formData });
}

async function saveSkillToProject(input: {
  formData: FormData;
  labels: (typeof copy)[Locale];
  projectSlug: string;
  skillSlug: string;
  token: string;
}): Promise<SkillProjectActionState> {
  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(input.projectSlug)}/saved-skills`, {
      body: JSON.stringify({
        collectionName: String(input.formData.get("collectionName") ?? "evaluation").trim() || "evaluation",
        skillSlug: input.skillSlug
      }),
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? input.labels.unableSave);
    }

    revalidateProjectPaths(input.projectSlug, input.skillSlug);

    return {
      intent: "save",
      message: input.labels.saved,
      projectSlug: input.projectSlug,
      status: "success"
    };
  } catch (error) {
    return {
      intent: "save",
      message: error instanceof Error ? error.message : input.labels.unableSave,
      projectSlug: input.projectSlug,
      status: "error"
    };
  }
}

async function installSkillToProject(input: {
  formData: FormData;
  labels: (typeof copy)[Locale];
  projectSlug: string;
  skillSlug: string;
  token: string;
}): Promise<SkillProjectActionState> {
  const version = String(input.formData.get("version") ?? "").trim();

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(input.projectSlug)}/installed-skills`, {
      body: JSON.stringify({
        skillSlug: input.skillSlug,
        ...(version ? { version } : {})
      }),
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? input.labels.unableInstall);
    }

    revalidateProjectPaths(input.projectSlug, input.skillSlug);

    return {
      intent: "install",
      message: input.labels.installed,
      projectSlug: input.projectSlug,
      status: "success"
    };
  } catch (error) {
    return {
      intent: "install",
      message: error instanceof Error ? error.message : input.labels.unableInstall,
      projectSlug: input.projectSlug,
      status: "error"
    };
  }
}

function revalidateProjectPaths(projectSlug: string, skillSlug: string) {
  revalidatePath(`/skills/${skillSlug}`);
  revalidatePath(`/marketplace`);
  revalidatePath(`/dashboard`);
  revalidatePath(`/dashboard/projects/${projectSlug}`);
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
