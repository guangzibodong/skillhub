import { CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getServerApiUrl } from "@/lib/api-url";
import { getWorkspaceToken } from "@/lib/auth-session";
import { getLocaleFromSearchParams, localizedHref, type Locale } from "@/lib/i18n";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);

  return buildLocalizedMetadata({
    locale,
    path: "/checkout/paypal/return",
    noIndex: true,
    en: {
      title: "PayPal Checkout - SkillHub",
      description: "Capture a PayPal checkout order and return to SkillHub.",
    },
    zh: {
      title: "PayPal 支付 - SkillHub",
      description: "确认 PayPal 订单并返回 SkillHub。",
    },
  });
}

const copy = {
  en: {
    done: "PayPal payment captured.",
    failed: "PayPal payment was not captured.",
    missingOrder: "PayPal did not return an order token.",
    missingSession: "Sign in again before capturing this PayPal order.",
    openProject: "Open developer workspace",
    retry: "Return to marketplace",
    title: "PayPal checkout",
  },
  zh: {
    done: "PayPal 支付已确认。",
    failed: "PayPal 支付未能确认。",
    missingOrder: "PayPal 没有返回订单 token。",
    missingSession: "请重新登录后再确认这笔 PayPal 订单。",
    openProject: "打开开发者工作台",
    retry: "返回市场",
    title: "PayPal 支付",
  },
} as const;

export default async function PayPalReturnPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = copy[locale];
  const orderId = firstParam(params.token) ?? firstParam(params.orderId);
  const token = await getWorkspaceToken();
  const result = orderId && token ? await capturePayPalOrder(orderId, token) : null;
  const error = !orderId ? labels.missingOrder : !token ? labels.missingSession : result?.error;
  const ok = Boolean(result?.ok);

  return (
    <AppShell active="skills" locale={locale}>
      <section className="section pt-32 pb-[96px]">
        <div className="section-inner">
          <article className="card max-w-[720px] mx-auto">
            <div className="eyebrow">
              {ok ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
              <span>{labels.title}</span>
            </div>
            <h1 className="heading-lg mt-3">{ok ? labels.done : labels.failed}</h1>
            <p className="body-text mt-3">
              {ok
                ? `${result?.captureId ?? orderId} / ${formatAmount(result?.amountCents, result?.currency, locale)}`
                : error}
            </p>
            <div className="flex items-center gap-3 flex-wrap mt-6">
              <a className="btn-primary" href={localizedHref("/developer", locale)}>
                {labels.openProject}
              </a>
              <a className="btn-secondary" href={localizedHref("/marketplace", locale)}>
                {labels.retry}
              </a>
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

async function capturePayPalOrder(orderId: string, token: string) {
  try {
    const response = await fetch(`${getServerApiUrl()}/v1/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    });
    const payload = (await response.json().catch(() => ({}))) as {
      capture?: {
        amountCents?: number | null;
        captureId?: string;
        currency?: string | null;
      };
      error?: string;
    };

    if (!response.ok) {
      return { error: payload.error ?? `PayPal capture returned HTTP ${response.status}.`, ok: false };
    }

    return {
      amountCents: payload.capture?.amountCents ?? null,
      captureId: payload.capture?.captureId ?? null,
      currency: payload.capture?.currency ?? null,
      ok: true,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to capture PayPal order.",
      ok: false,
    };
  }
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatAmount(amountCents: number | null | undefined, currency: string | null | undefined, locale: Locale) {
  if (!amountCents || amountCents <= 0) {
    return locale === "zh" ? "金额待同步" : "amount pending";
  }

  try {
    return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
      currency: currency ?? "usd",
      style: "currency",
    }).format(amountCents / 100);
  } catch {
    return `${currency ?? "usd"} ${(amountCents / 100).toFixed(2)}`;
  }
}

