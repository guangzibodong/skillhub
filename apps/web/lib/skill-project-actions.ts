"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type SkillProjectActionIntent = "install" | "save" | "subscribe" | "test";

export type SkillProjectActionState = {
  intent?: SkillProjectActionIntent;
  message: string;
  projectSlug?: string;
  status: "idle" | "success" | "error";
  testResult?: {
    amountCents?: number;
    billable?: boolean;
    code?: string;
    currency?: string;
    error?: string;
    invocationId?: string;
    latencyMs?: number;
    mode?: string;
    output?: unknown;
    runtimeStatus?: string;
  };
};

const copy = {
  en: {
    installed: "Skill installed to the selected project. Review policy, budget, and runtime approval before production use.",
    invalidIntent: "Choose whether to save, install, test, or subscribe to this skill.",
    invalidJson: "Test input must be valid JSON.",
    missingProject: "Choose a project before continuing.",
    missingSkill: "Missing skill slug.",
    missingToken: "Sign in with a SkillHub workspace account before managing project skills.",
    saved: "Skill saved to the selected project collection.",
    subscribed: "Project subscription created. Install the skill and review policy before production runtime use.",
    testBlocked: "Test invocation did not pass the project runtime gate.",
    testPassed: "Test invocation completed. Review the runtime output and project log before production use.",
    unableInstall: "Unable to install skill.",
    unableSave: "Unable to save skill.",
    unableSubscribe: "Unable to create project subscription.",
    unableTest: "Unable to test skill invocation."
  },
  zh: {
    installed: "\u6280\u80fd\u5df2\u5b89\u88c5\u5230\u6240\u9009\u9879\u76ee\u3002\u751f\u4ea7\u4f7f\u7528\u524d\u8bf7\u5728\u9879\u76ee\u540e\u53f0\u786e\u8ba4\u7b56\u7565\u3001\u9884\u7b97\u548c\u8fd0\u884c\u5ba1\u6279\u3002",
    invalidIntent: "\u8bf7\u9009\u62e9\u4fdd\u5b58\u3001\u5b89\u88c5\u3001\u6d4b\u8bd5\u6216\u8ba2\u9605\u8fd9\u4e2a\u6280\u80fd\u3002",
    invalidJson: "\u6d4b\u8bd5\u8f93\u5165\u5fc5\u987b\u662f\u6709\u6548 JSON\u3002",
    missingProject: "\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u9879\u76ee\u3002",
    missingSkill: "\u7f3a\u5c11\u6280\u80fd slug\u3002",
    missingToken: "请先登录 SkillHub 工作区账号，才能管理项目技能。",
    saved: "\u6280\u80fd\u5df2\u4fdd\u5b58\u5230\u6240\u9009\u9879\u76ee\u96c6\u5408\u3002",
    subscribed: "\u9879\u76ee\u8ba2\u9605\u5df2\u521b\u5efa\u3002\u751f\u4ea7\u8fd0\u884c\u524d\u8bf7\u7ee7\u7eed\u5b89\u88c5\u6280\u80fd\u5e76\u68c0\u67e5\u7b56\u7565\u3002",
    testBlocked: "\u6d4b\u8bd5\u8c03\u7528\u672a\u901a\u8fc7\u9879\u76ee\u8fd0\u884c\u7f51\u5173\u3002",
    testPassed: "\u6d4b\u8bd5\u8c03\u7528\u5df2\u5b8c\u6210\u3002\u751f\u4ea7\u4f7f\u7528\u524d\u8bf7\u68c0\u67e5\u8fd0\u884c\u8f93\u51fa\u548c\u9879\u76ee\u65e5\u5fd7\u3002",
    unableInstall: "\u65e0\u6cd5\u5b89\u88c5\u6280\u80fd\u3002",
    unableSave: "\u65e0\u6cd5\u4fdd\u5b58\u6280\u80fd\u3002",
    unableSubscribe: "\u65e0\u6cd5\u521b\u5efa\u9879\u76ee\u8ba2\u9605\u3002",
    unableTest: "\u65e0\u6cd5\u6d4b\u8bd5\u6280\u80fd\u8c03\u7528\u3002"
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

  if (!["install", "save", "subscribe", "test"].includes(intent)) {
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

  if (intent === "save") {
    return saveSkillToProject({ labels, projectSlug, skillSlug: normalizedSkillSlug, token, formData });
  }

  if (intent === "test") {
    return testSkillInProject({ labels, projectSlug, skillSlug: normalizedSkillSlug, token, formData });
  }

  if (intent === "subscribe") {
    return subscribeProjectSkill({ labels, projectSlug, skillSlug: normalizedSkillSlug, token });
  }

  return installSkillToProject({ labels, projectSlug, skillSlug: normalizedSkillSlug, token, formData });
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

async function subscribeProjectSkill(input: {
  labels: (typeof copy)[Locale];
  projectSlug: string;
  skillSlug: string;
  token: string;
}): Promise<SkillProjectActionState> {
  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(input.projectSlug)}/subscriptions`, {
      body: JSON.stringify({
        skillSlug: input.skillSlug,
        status: "trialing"
      }),
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? input.labels.unableSubscribe);
    }

    revalidateProjectPaths(input.projectSlug, input.skillSlug);

    return {
      intent: "subscribe",
      message: input.labels.subscribed,
      projectSlug: input.projectSlug,
      status: "success"
    };
  } catch (error) {
    return {
      intent: "subscribe",
      message: error instanceof Error ? error.message : input.labels.unableSubscribe,
      projectSlug: input.projectSlug,
      status: "error"
    };
  }
}

async function testSkillInProject(input: {
  formData: FormData;
  labels: (typeof copy)[Locale];
  projectSlug: string;
  skillSlug: string;
  token: string;
}): Promise<SkillProjectActionState> {
  const version = String(input.formData.get("version") ?? "").trim();
  const rawTestInput = String(input.formData.get("testInput") ?? "").trim();
  let parsedInput: unknown = {};

  if (rawTestInput) {
    try {
      parsedInput = JSON.parse(rawTestInput);
    } catch {
      return {
        intent: "test",
        message: input.labels.invalidJson,
        projectSlug: input.projectSlug,
        status: "error"
      };
    }
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(input.projectSlug)}/runtime/test`, {
      body: JSON.stringify({
        input: parsedInput,
        skillSlug: input.skillSlug,
        ...(version ? { version } : {})
      }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });
    const payload = (await response.json().catch(() => ({}))) as {
      amountCents?: number;
      billable?: boolean;
      code?: string;
      currency?: string;
      error?: string;
      invocationId?: string;
      latencyMs?: number;
      mode?: string;
      output?: unknown;
      status?: string;
    };
    const testResult = {
      amountCents: payload.amountCents,
      billable: payload.billable,
      code: payload.code,
      currency: payload.currency,
      error: payload.error,
      invocationId: payload.invocationId,
      latencyMs: payload.latencyMs,
      mode: payload.mode,
      output: payload.output,
      runtimeStatus: payload.status
    };

    revalidateProjectPaths(input.projectSlug, input.skillSlug);

    if (!response.ok) {
      return {
        intent: "test",
        message: payload.error ?? input.labels.testBlocked,
        projectSlug: input.projectSlug,
        status: "error",
        testResult
      };
    }

    return {
      intent: "test",
      message: input.labels.testPassed,
      projectSlug: input.projectSlug,
      status: "success",
      testResult
    };
  } catch (error) {
    return {
      intent: "test",
      message: error instanceof Error ? error.message : input.labels.unableTest,
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
  return getServerApiUrl();
}
