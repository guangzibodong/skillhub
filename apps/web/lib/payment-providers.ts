import { getServerApiUrl } from "@/lib/api-url";
import type { PublicPaymentProviderStatus } from "@/lib/ops-data";

const PAYMENT_PROVIDER_FETCH_TIMEOUT_MS = 3500;

export async function getPublicPaymentProviders(): Promise<PublicPaymentProviderStatus[]> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PAYMENT_PROVIDER_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${getServerApiUrl()}/v1/payment/providers`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      providers?: PublicPaymentProviderStatus[];
    };

    return Array.isArray(payload.providers) ? payload.providers : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

