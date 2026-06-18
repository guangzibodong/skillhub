import type { Locale } from "@/lib/i18n";

export const PRODUCT_STAGE = {
  emailProviderLive: false,
  gatewayLive: true,
  label: "Launch Preview",
  paidMarketplaceLive: false,
  paymentCaptureLive: false,
  payoutAutomationLive: false,
  publicInspectionLive: true,
  publicRegistryLive: true,
  runtimeRequiresProjectKey: true,
  taxKycAutomationLive: false,
} as const;

const productStageCopy = {
  en: {
    body:
      "Public skill discovery and Skill API inspection are live. Runtime use requires sign-in, a workspace, and a Project Key. Pro access is opened through team onboarding during Launch Preview; self-service checkout, automated payouts, and tax/KYC automation are not generally available yet.",
    label: PRODUCT_STAGE.label,
  },
  zh: {
    body:
      "公开找技能和 Skill API 查看已可用。真实运行需要登录、工作区和 Project Key。Launch Preview 期间，Pro 通过团队入驻人工开通；自助收银、自动提现和税务/KYC 自动化尚未通用开放。",
    label: "Launch Preview",
  },
} as const;

export function getProductStageCopy(locale: Locale) {
  return productStageCopy[locale] ?? productStageCopy.en;
}
