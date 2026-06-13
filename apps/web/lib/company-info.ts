export const companyInfo = {
  supportEmail: "Support@useskillhub.com",
  businessEmail: "info@useskillhub.com",
  address:
    "Room 5065, 5th Floor, Yau Lee Centre, 45 Hoi Yuen Road, Kwun Tong, Kowloon, Hong Kong",
} as const;

export const companyLinks = {
  supportMailto: `mailto:${companyInfo.supportEmail}`,
  businessMailto: `mailto:${companyInfo.businessEmail}`,
} as const;

