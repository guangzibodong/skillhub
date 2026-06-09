import type { Locale } from "@/lib/i18n";

export const PRODUCT_STAGE = {
  emailProviderLive: false,
  gatewayLive: true,
  label: "Developer Preview",
  paidMarketplaceLive: false,
  paymentCaptureLive: false,
  payoutAutomationLive: false,
  publicRegistryLive: true,
  taxKycAutomationLive: false,
} as const;

const productStageCopy = {
  en: {
    body:
      "Public registry and gateway discovery are live. Paid marketplace, payment capture, automated payouts, tax/KYC automation, and final email delivery remain prelaunch integrations.",
    label: PRODUCT_STAGE.label,
  },
  zh: {
    body:
      "\u516c\u5f00\u6ce8\u518c\u8868\u548c\u7f51\u5173\u53d1\u73b0\u80fd\u529b\u5df2\u4e0a\u7ebf\u3002\u4ed8\u8d39\u5e02\u573a\u3001\u652f\u4ed8\u6263\u6b3e\u3001\u81ea\u52a8\u63d0\u73b0\u3001\u7a0e\u52a1/KYC \u81ea\u52a8\u5316\u548c\u6700\u7ec8\u90ae\u4ef6\u6295\u9012\u4ecd\u5904\u4e8e\u9884\u53d1\u5e03\u96c6\u6210\u9636\u6bb5\u3002",
    label: "\u5f00\u53d1\u8005\u9884\u89c8\u7248",
  },
} as const;

export function getProductStageCopy(locale: Locale) {
  return productStageCopy[locale] ?? productStageCopy.en;
}
