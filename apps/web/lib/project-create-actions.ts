"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectRecord } from "@/lib/ops-data";

export type ProjectCreateActionState = {
  message: string;
  project?: DeveloperProjectRecord;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    created: "Project created. You can open it now to create runtime keys and install skills.",
    missingName: "Enter a project name.",
    missingToken: "Sign in with a SkillHub workspace account before creating projects.",
    unableCreate: "Unable to create project."
  },
  zh: {
    created: "项目已创建。现在可以进入项目页创建运行 Key 和安装技能。",
    missingName: "请输入项目名称。",
    missingToken: "请先登录 SkillHub 工作区账号，才能创建项目。",
    unableCreate: "无法创建项目。"
  }
} as const;

export async function createDeveloperProjectAction(
  locale: Locale,
  _previousState: ProjectCreateActionState,
  formData: FormData
): Promise<ProjectCreateActionState> {
  const labels = copy[locale];
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const token = await getWorkspaceToken();

  if (!name) {
    return { message: labels.missingName, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/developer/projects`, {
      body: JSON.stringify({
        name,
        slug: slug || undefined
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

    const payload = (await response.json()) as { project: DeveloperProjectRecord };

    revalidatePath("/dashboard");
    revalidatePath("/developer");
    revalidatePath(`/dashboard/projects/${payload.project.slug}`);

    return {
      message: labels.created,
      project: payload.project,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableCreate,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
