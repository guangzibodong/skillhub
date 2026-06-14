"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";
import type { OrganizationTeamMember } from "@/lib/ops-data";

export type OrganizationTeamActionState = {
  accessToken?: {
    createdAt: string;
    id: string;
    name: string;
    token: string;
    tokenLast4: string;
    tokenPrefix: string;
  };
  member?: OrganizationTeamMember;
  message: string;
  status: "idle" | "success" | "error";
  userId?: string;
};

const copy = {
  en: {
    memberSaved: "Team member access saved.",
    memberRemoved: "Team member removed and organization tokens revoked.",
    missingEmail: "Member email is required.",
    missingToken: "Sign in with an owner or admin account before managing team access.",
    missingUser: "Missing team member id.",
    tokenCreated: "Team access token created. Copy it now; it will not be shown again.",
    unableCreateToken: "Unable to create team access token.",
    unableRemove: "Unable to remove team member.",
    unableSave: "Unable to save team member."
  },
  zh: {
    memberSaved: "团队成员权限已保存。",
    memberRemoved: "团队成员已移除，组织 token 已撤销。",
    missingEmail: "必须填写成员邮箱。",
    missingToken: "请先使用具备 owner/admin 角色的账号登录，才能管理团队权限。",
    missingUser: "缺少团队成员 ID。",
    tokenCreated: "团队访问 token 已创建。请现在复制，它不会再次显示。",
    unableCreateToken: "无法创建团队访问 token。",
    unableRemove: "无法移除团队成员。",
    unableSave: "无法保存团队成员。"
  }
} as const;

export async function saveOrganizationTeamMemberAction(
  locale: Locale,
  _previousState: OrganizationTeamActionState,
  formData: FormData
): Promise<OrganizationTeamActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const email = String(formData.get("email") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "developer").trim();

  if (!email) {
    return { message: labels.missingEmail, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/team/members`, {
      body: JSON.stringify({
        displayName,
        email,
        role
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

    const payload = (await response.json()) as { member: OrganizationTeamMember };
    revalidatePath("/developer");

    return {
      member: payload.member,
      message: labels.memberSaved,
      status: "success",
      userId: payload.member.userId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableSave,
      status: "error"
    };
  }
}

export async function createOrganizationTeamMemberTokenAction(
  locale: Locale,
  _previousState: OrganizationTeamActionState,
  formData: FormData
): Promise<OrganizationTeamActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const userId = String(formData.get("userId") ?? "").trim();
  const tokenName = String(formData.get("tokenName") ?? "").trim();

  if (!userId) {
    return { message: labels.missingUser, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", userId };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/team/members/${encodeURIComponent(userId)}/tokens`, {
      body: JSON.stringify({
        tokenName
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableCreateToken);
    }

    const payload = (await response.json()) as {
      accessToken: OrganizationTeamActionState["accessToken"];
      member: OrganizationTeamMember;
    };
    revalidatePath("/developer");

    return {
      accessToken: payload.accessToken,
      member: payload.member,
      message: labels.tokenCreated,
      status: "success",
      userId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableCreateToken,
      status: "error",
      userId
    };
  }
}

export async function removeOrganizationTeamMemberAction(
  locale: Locale,
  _previousState: OrganizationTeamActionState,
  formData: FormData
): Promise<OrganizationTeamActionState> {
  const labels = copy[locale];
  const token = await getWorkspaceToken();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    return { message: labels.missingUser, status: "error" };
  }

  if (!token) {
    return { message: labels.missingToken, status: "error", userId };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/organization/team/members/${encodeURIComponent(userId)}/remove`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableRemove);
    }

    revalidatePath("/developer");

    return {
      message: labels.memberRemoved,
      status: "success",
      userId
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableRemove,
      status: "error",
      userId
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
