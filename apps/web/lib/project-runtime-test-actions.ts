"use server";

import { getServerApiUrl } from "@/lib/api-url";
import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectRuntimeTestState = {
  message: string;
  skillSlug?: string;
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
    version?: string;
  };
};

const copy = {
  en: {
    invalidJson: "Test input must be valid JSON.",
    missingSkill: "Choose an installed skill before running a test.",
    missingToken: "Sign in with a SkillHub workspace account before running project tests.",
    testBlocked: "Test invocation did not pass the project runtime gate.",
    testPassed: "Test invocation completed and was written to the project runtime log.",
    unableTest: "Unable to run project test invocation."
  },
  zh: {
    invalidJson: "\u6d4b\u8bd5\u8f93\u5165\u5fc5\u987b\u662f\u6709\u6548 JSON\u3002",
    missingSkill: "\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u5df2\u5b89\u88c5\u6280\u80fd\u518d\u8fd0\u884c\u6d4b\u8bd5\u3002",
    missingToken: "请先登录 SkillHub 工作区账号，才能运行项目测试。",
    testBlocked: "\u6d4b\u8bd5\u8c03\u7528\u672a\u901a\u8fc7\u9879\u76ee\u8fd0\u884c\u7f51\u5173\u3002",
    testPassed: "\u6d4b\u8bd5\u8c03\u7528\u5df2\u5b8c\u6210\uff0c\u5e76\u5199\u5165\u9879\u76ee\u8fd0\u884c\u65e5\u5fd7\u3002",
    unableTest: "\u65e0\u6cd5\u8fd0\u884c\u9879\u76ee\u6d4b\u8bd5\u8c03\u7528\u3002"
  }
} as const;

export async function submitProjectRuntimeTestAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectRuntimeTestState,
  formData: FormData
): Promise<ProjectRuntimeTestState> {
  const labels = copy[locale];
  const skillSlug = String(formData.get("skillSlug") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim();
  const rawTestInput = String(formData.get("testInput") ?? "").trim();
  let parsedInput: unknown = {};

  if (!skillSlug) {
    return { message: labels.missingSkill, status: "error" };
  }

  if (rawTestInput) {
    try {
      parsedInput = JSON.parse(rawTestInput);
    } catch {
      return {
        message: labels.invalidJson,
        skillSlug,
        status: "error"
      };
    }
  }

  const token = await getWorkspaceToken();

  if (!token) {
    return {
      message: labels.missingToken,
      skillSlug,
      status: "error"
    };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/runtime/test`, {
      body: JSON.stringify({
        input: parsedInput,
        skillSlug,
        ...(version ? { version } : {})
      }),
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
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
      version?: string;
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
      runtimeStatus: payload.status,
      version: payload.version
    };

    revalidatePath(`/dashboard`);
    revalidatePath(`/dashboard/projects/${projectSlug}`);

    if (!response.ok) {
      return {
        message: payload.error ?? labels.testBlocked,
        skillSlug,
        status: "error",
        testResult
      };
    }

    return {
      message: labels.testPassed,
      skillSlug,
      status: "success",
      testResult
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableTest,
      skillSlug,
      status: "error"
    };
  }
}

function getApiUrl() {
  return getServerApiUrl();
}
