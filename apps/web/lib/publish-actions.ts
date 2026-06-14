"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import { getPublishCopy } from "@/lib/publish-copy";

export type PublishSkillActionState = {
  createdNewVersion?: boolean;
  message: string;
  skillSlug?: string;
  status: "idle" | "success" | "error";
  version?: string;
  versionId?: string;
};

export async function publishSkillAction(
  locale: Locale,
  _previousState: PublishSkillActionState,
  formData: FormData
): Promise<PublishSkillActionState> {
  const labels = getPublishCopy(locale).action;
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

    const payload = (await response.json().catch(() => ({}))) as {
      createdNewVersion?: boolean;
      error?: string;
      slug?: string;
      version?: string;
      versionId?: string;
    };

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
      createdNewVersion: Boolean(payload.createdNewVersion),
      message: `${labels.publishedPrefix} ${skillSlug}. ${labels.publishedSuffix}`,
      skillSlug,
      status: "success",
      version: payload.version,
      versionId: payload.versionId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableToPublish,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
