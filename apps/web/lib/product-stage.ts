import type { Locale } from "@/lib/i18n";

export const PRODUCT_STAGE = {
  emailProviderLive: false,
  gatewayLive: true,
  label: "Early Access",
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
      "Public registry discovery and skill inspection are live. Runtime invocation requires an authenticated project key. Commercial billing, payout automation, tax/KYC automation, and final email delivery are enabled only for approved configured workspaces.",
    label: PRODUCT_STAGE.label,
  },
  zh: {
    body:
      "公开注册表发现和技能查看已可用。运行调用需要登录后的项目 Key。商业计费、自动打款、税务/KYC 自动化和最终邮件投递仅对已批准并完成配置的工作区启用。",
    label: "Early Access",
  },
} as const;

export function getProductStageCopy(locale: Locale) {
  return productStageCopy[locale] ?? productStageCopy.en;
}
