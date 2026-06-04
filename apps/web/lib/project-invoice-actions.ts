"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceToken } from "@/lib/auth-session";
import type { Locale } from "@/lib/i18n";

export type ProjectInvoiceActionState = {
  generatedInvoiceId?: string;
  message: string;
  status: "idle" | "success" | "error";
};

const actionCopy = {
  en: {
    generated: "Invoice generated from posted transactions.",
    missingToken: "Sign in with a SkillHub user token or configure a server fallback before generating invoices.",
    unableGenerate: "Unable to generate invoice."
  },
  zh: {
    generated: "已根据入账交易生成发票。",
    missingToken: "请先用 SkillHub 用户 token 登录，或配置服务端兜底 token，才能生成发票。",
    unableGenerate: "无法生成发票。"
  }
} as const;

export async function generateProjectInvoiceAction(
  projectSlug: string,
  locale: Locale,
  _previousState: ProjectInvoiceActionState,
  formData: FormData
): Promise<ProjectInvoiceActionState> {
  const labels = actionCopy[locale];
  const token = await getWorkspaceToken();
  const currency = String(formData.get("currency") ?? "usd").trim();
  const periodStart = String(formData.get("periodStart") ?? "").trim();
  const periodEnd = String(formData.get("periodEnd") ?? "").trim();

  if (!token) {
    return { message: labels.missingToken, status: "error" };
  }

  try {
    const response = await fetch(`${getApiUrl()}/v1/projects/${encodeURIComponent(projectSlug)}/invoices/generate`, {
      body: JSON.stringify({
        currency,
        periodEnd: periodEnd || undefined,
        periodStart: periodStart || undefined
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? labels.unableGenerate);
    }

    const payload = (await response.json()) as { invoice?: { invoice?: { id?: string } } };

    revalidatePath(`/dashboard/projects/${projectSlug}`);

    return {
      generatedInvoiceId: payload.invoice?.invoice?.id,
      message: labels.generated,
      status: "success"
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : labels.unableGenerate,
      status: "error"
    };
  }
}

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
}
