"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type PublishSkillActionState = {
  message: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
};

const copy = {
  en: {
    invalidManifest: "Manifest JSON is invalid.",
    missingManifest: "Paste a SkillHub manifest before publishing.",
    missingToken: "Sign in with a publisher, owner, or admin user token before publishing a skill.",
    publishedPrefix: "Published",
    publishedSuffix: "It is saved as a draft and ready for publisher review operations.",
    unableToPublish: "Unable to publish skill."
  },
  zh: {
    invalidManifest: "Manifest JSON 无效。",
    missingManifest: "请先粘贴 SkillHub manifest 再发布。",
    missingToken: "请先用发布者、owner 或 admin 用户 token 登录，再发布技能。",
    publishedPrefix: "已发布",
    publishedSuffix: "当前已保存为草稿，可继续进入发布者工作台提交审核。",
    unableToPublish: "无法发布技能。"
  }
} as const;

export async function publishSkillAction(
  locale: Locale,
  _previousState: PublishSkillActionState,
  formData: FormData
): Promise<PublishSkillActionState> {
  const labels = copy[locale];
  const manifestText = String(formData.get("manifest") ?? "").trim();

  if (!manifestText) {
    return { message: labels.missingManifest, status: "error" };
  }

  let manifest: unknown;

  try {
    manifest = JSON.parse(manifestText);
  } catch {
    return { message: labels.invalidManifest, status: "error" };
  }

  const token = await getWorkspaceToken();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/skills`, {
      body: JSON.stringify({ manifest }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; slug?: string };

    if (!response.ok) {
      throw new Error(payload.error ?? labels.unableToPublish);
    }

    const skillSlug = payload.slug ?? "skill";
    revalidatePath("/publish");
    revalidatePath("/publisher");
    revalidatePath("/registry");
    revalidatePath("/marketplace");
    revalidatePath(`/skills/${skillSlug}`);

    return {
      message: `${labels.publishedPrefix} ${skillSlug}. ${labels.publishedSuffix}`,
      skillSlug,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableToPublish,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
