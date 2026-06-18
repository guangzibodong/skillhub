import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/public-info-page";
import { getLocaleFromSearchParams } from "@/lib/i18n";
import { companyInfo, companyLinks } from "@/lib/company-info";
import { getPublicPage } from "@/lib/public-pages";
import { buildLocalizedMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getLocaleFromSearchParams(await searchParams);
  const page = getPublicPage("contact", locale);
  return buildLocalizedMetadata({ locale, path: page.path, en: page.seo.en, zh: page.seo.zh, type: "website" });
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const page = contactPageForIntent(readParam(params.intent), locale);
  return <PublicInfoPage locale={locale} page={page} />;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function contactPageForIntent(intent: string | undefined, locale: "en" | "zh") {
  const basePage = getPublicPage("contact", locale);

  if (intent === "publisher") {
    return {
      ...basePage,
      en: {
        ...basePage.en,
        eyebrow: "Publisher access",
        title: "Request publisher access for SkillHub",
        lead:
          "Use this path when a third-party author or team wants permission to submit, maintain, and prepare Skills for review.",
        quickAnswer:
          `Email ${companyInfo.supportEmail} with your SkillHub account email, publisher name, maintenance owner, support email, planned skill categories, demo or repository link, commercial intent, and target launch date. Operators review publisher access before draft submission is unlocked.`,
        primaryCta: {
          href: publisherMailto("en"),
          label: "Email publisher access request",
        },
        secondaryCta: { href: "/publisher-review", label: "Read review rules" },
        sections: [
          {
            title: "What to include",
            body:
              "A complete request helps operations approve access without a long back-and-forth.",
            bullets: [
              "SkillHub account email and organization name",
              "Publisher display name and maintenance owner",
              "Support email and expected response time",
              "Planned skill categories and first 3 skill ideas",
              "Repository, demo URL, or sample output if available",
              "Free basics, Pro catalog, or future paid-preview intent",
            ],
          },
          {
            title: "What happens next",
            body:
              "Operations checks identity, support readiness, skill scope, and risk before granting publisher workspace access.",
            bullets: [
              "You receive a reply with approval, missing information, or a reason the request is not ready.",
              "Approved accounts can open the publisher workspace, save drafts, and submit exact versions for review.",
              "Commercial metadata remains preview/onboarding state until paid marketplace gates are enabled.",
            ],
          },
          {
            title: "Do not send secrets",
            body:
              "Do not include OAuth secrets, Project Keys, passwords, private customer data, or exploitable payloads in the first email.",
          },
        ],
        faq: [
          {
            question: "Can I publish immediately after signing in?",
            answer:
              "No. Sign-in creates an account session; publisher access is a separate role granted after operator review.",
          },
          {
            question: "Can my skill be paid?",
            answer:
              "During Launch Preview, you can prepare pricing intent and paid-readiness metadata. Production payment capture and automated payouts are not generally available yet.",
          },
        ],
      },
      zh: {
        ...basePage.zh,
        eyebrow: "发布者申请",
        title: "申请 SkillHub 发布者权限",
        lead:
          "第三方作者或团队想提交、维护、审核 Skill，请走这个申请路径。登录只是账号会话，发布权限需要运营开通。",
        quickAnswer:
          `请发送邮件到 ${companyInfo.supportEmail}，包含 SkillHub 账号邮箱、发布者名称、维护负责人、支持邮箱、计划技能分类、Demo 或仓库链接、商业化意图和预计上线时间。运营确认后才会开通发布工作台。`,
        primaryCta: {
          href: publisherMailto("zh"),
          label: "发送发布者申请邮件",
        },
        secondaryCta: { href: "/publisher-review", label: "查看审核规则" },
        sections: [
          {
            title: "申请邮件需要写什么",
            body:
              "信息越完整，运营越容易判断是否能开通发布权限。",
            bullets: [
              "SkillHub 账号邮箱和组织名称",
              "发布者展示名称和维护负责人",
              "支持邮箱和预计响应时间",
              "计划发布的技能分类和前 3 个技能想法",
              "如有 Demo、仓库链接或示例输出，请一并提供",
              "说明是免费基础技能、进入 Pro 目录，还是未来付费预览意图",
            ],
          },
          {
            title: "申请后怎么处理",
            body:
              "运营会检查身份、支持能力、技能范围和风险，再决定是否开通发布者工作台。",
            bullets: [
              "你会收到批准、补充资料或暂不通过的回复。",
              "批准后账号可以打开发布者工作台，保存草稿并提交精确版本审核。",
              "商业化资料仍属于预览/开通阶段，真实扣款和自动提现尚未通用开放。",
            ],
          },
          {
            title: "不要发送敏感信息",
            body:
              "第一封邮件不要包含 OAuth secret、Project Key、密码、客户隐私数据或可利用 payload。",
          },
        ],
        faq: [
          {
            question: "登录后就能发布吗？",
            answer:
              "不能。登录只是账号会话；发布者权限是单独角色，需要运营审核后开通。",
          },
          {
            question: "我的技能可以收费吗？",
            answer:
              "Launch Preview 期间可以准备定价意图和付费就绪资料。生产扣款和自动提现尚未通用开放。",
          },
        ],
      },
    };
  }

  if (intent === "pro") {
    return {
      ...basePage,
      en: {
        ...basePage.en,
        eyebrow: "Pro onboarding",
        title: "Request SkillHub Pro access",
        lead:
          "Use this path when a team wants monthly, quarterly, or annual Pro access during Launch Preview.",
        quickAnswer:
          `Email ${companyInfo.businessEmail} with company name, account email, team size, preferred cycle, target workflows, and launch timeline. Pro is opened manually; public self-service checkout is not live yet.`,
        primaryCta: { href: proMailto("en"), label: "Email Pro request" },
        secondaryCta: { href: "/pricing", label: "Compare plans" },
      },
      zh: {
        ...basePage.zh,
        eyebrow: "Pro 开通",
        title: "申请 SkillHub Pro 开通",
        lead:
          "团队要开通月付、季付或年付 Pro，请走这个路径。当前是人工开通，不是公开自助收银。",
        quickAnswer:
          `请发送邮件到 ${companyInfo.businessEmail}，包含公司名称、账号邮箱、团队规模、付款周期、目标工作流和上线时间。Pro 由运营人工开通；公开自助支付尚未上线。`,
        primaryCta: { href: proMailto("zh"), label: "发送 Pro 开通邮件" },
        secondaryCta: { href: "/pricing", label: "查看价格方案" },
      },
    };
  }

  return basePage;
}

function publisherMailto(locale: "en" | "zh") {
  const subject =
    locale === "zh"
      ? "SkillHub 发布者权限申请"
      : "SkillHub publisher access request";
  const body =
    locale === "zh"
      ? "SkillHub 账号邮箱：\n组织/团队名称：\n发布者展示名称：\n维护负责人：\n支持邮箱：\n计划技能分类：\n前 3 个技能想法：\nDemo/仓库链接：\n商业化意图（免费基础 / Pro 目录 / 未来付费预览）：\n预计上线时间："
      : "SkillHub account email:\nOrganization:\nPublisher display name:\nMaintenance owner:\nSupport email:\nPlanned skill categories:\nFirst 3 skill ideas:\nDemo/repository link:\nCommercial intent (free basics / Pro catalog / future paid preview):\nTarget launch date:";

  return `${companyLinks.supportMailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function proMailto(locale: "en" | "zh") {
  const subject =
    locale === "zh" ? "SkillHub Pro 开通申请" : "SkillHub Pro access request";
  const body =
    locale === "zh"
      ? "公司名称：\nSkillHub 账号邮箱：\n团队规模：\n付款周期（月付/季付/年付）：\n目标工作流：\n希望上线时间："
      : "Company name:\nSkillHub account email:\nTeam size:\nPreferred cycle (monthly/quarterly/annual):\nTarget workflows:\nTarget launch date:";

  return `${companyLinks.businessMailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
