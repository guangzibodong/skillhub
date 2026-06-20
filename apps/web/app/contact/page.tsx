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
  const page = contactPageForIntent(
    {
      cycle: readParam(params.cycle),
      intent: readParam(params.intent),
      track: readParam(params.track),
    },
    locale,
  );
  return <PublicInfoPage locale={locale} page={page} />;
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type ContactIntentContext = {
  cycle?: string;
  intent?: string;
  track?: string;
};

function contactPageForIntent(
  { cycle, intent, track }: ContactIntentContext,
  locale: "en" | "zh",
) {
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
    const cycleLabel = formatBillingCycle(cycle, locale);
    const trackLabel = formatRequestTrack(track, locale);

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
        primaryCta: {
          href: proMailto("en", { cycle, track }),
          label: "Email Pro request",
        },
        secondaryCta: { href: "/pricing", label: "Compare plans" },
        sections: [
          {
            title: "What to include",
            body:
              "A complete Pro request lets operations open the right workspace without guessing billing, users, or first workflows.",
            bullets: [
              "Company name, website, and SkillHub account email",
              "Team size, admin contact, and billing or procurement contact",
              `Preferred billing cycle${cycleLabel ? `: ${cycleLabel}` : " if known"}`,
              `Primary workflow${trackLabel ? `: ${trackLabel}` : " such as SEO/GEO, e-commerce, data, support, sales, UI, dev, or security"}`,
              "First 3 skills you expect to use and the target launch date",
              "Whether you need onboarding help, invoice support, or a security review",
            ],
          },
          {
            title: "How onboarding works",
            body:
              "Pro is intentionally handled as a team onboarding path during Launch Preview, so the workspace, policy, and support expectations are clear before production use.",
            bullets: [
              "Operations confirms the request and asks for any missing information.",
              "A workspace is opened manually after plan, owner, and first-use scope are clear.",
              "The team starts with marketplace selection, project setup, Project Key creation, and one governed runtime test.",
              "Public pages may show pricing intent, but self-service checkout and automated payment capture are not the live path yet.",
            ],
          },
          {
            title: "First-week checklist",
            body:
              "The fastest useful rollout is narrow: choose a repeated workflow, adopt a small set of skills, and prove the output before expanding.",
            bullets: [
              "Pick one workflow owner and one admin owner",
              "Choose 3 to 5 skills from the marketplace",
              "Create a project and generate a scoped Project Key",
              "Run one REST or MCP test with real policy boundaries",
              "Review logs, permission risk, feedback, and next skill requests",
            ],
          },
        ],
        faq: [
          {
            question: "Can we pay directly on the website?",
            answer:
              "Not yet. During Launch Preview, Pro requests go through contact review and manual onboarding before any payment workflow is finalized.",
          },
          {
            question: "Can we switch from monthly to quarterly or annual?",
            answer:
              "Yes. Tell operations the preferred cycle. Quarterly is 10% off the monthly rate, and annual is 20% off the monthly rate.",
          },
          {
            question: "What should we do if we only need free basics?",
            answer:
              "Use the marketplace free filter first. Free basics are for lightweight evaluation; recurring or advanced workflows belong in Pro.",
          },
        ],
      },
      zh: {
        ...basePage.zh,
        eyebrow: "Pro 开通",
        title: "申请 SkillHub Pro 开通",
        lead:
          "团队要开通月付、季付或年付 Pro，请走这个路径。当前是人工开通，不是公开自助收银。",
        quickAnswer:
          `请发送邮件到 ${companyInfo.businessEmail}，包含公司名称、账号邮箱、团队规模、付款周期、目标工作流和上线时间。Pro 由运营人工开通；公开自助支付尚未上线。`,
        primaryCta: {
          href: proMailto("zh", { cycle, track }),
          label: "发送 Pro 开通邮件",
        },
        secondaryCta: { href: "/pricing", label: "查看价格方案" },
        sections: [
          {
            title: "申请邮件需要写什么",
            body:
              "Pro 不是随便点一下就扣款，运营需要先确认工作区、付款周期、使用人和第一批业务场景。",
            bullets: [
              "公司名称、官网和 SkillHub 账号邮箱",
              "团队规模、管理员联系人、财务或采购联系人",
              `希望开通的付款周期${cycleLabel ? `：${cycleLabel}` : "，例如月付、季付或年付"}`,
              `优先使用场景${trackLabel ? `：${trackLabel}` : "，例如 SEO/GEO、电商、数据、客服、销售、UI、开发或安全"}`,
              "预计先用的 3 个技能和希望上线时间",
              "是否需要入驻协助、发票支持或安全审查",
            ],
          },
          {
            title: "开通后怎么走",
            body:
              "Launch Preview 期间，Pro 采用团队入驻路径，先把工作区、策略和支持边界说清楚，再进入真实使用。",
            bullets: [
              "运营确认需求，并补问缺失信息。",
              "套餐、负责人和第一批使用范围清楚后，人工开通工作区。",
              "团队从市场选技能，创建项目，生成 Project Key，并完成一次受治理运行测试。",
              "公开页面可以展示价格意图，但自助收银和自动扣款还不是当前上线路径。",
            ],
          },
          {
            title: "第一周建议怎么落地",
            body:
              "最快的上线方式不是一口气接所有技能，而是先选一个高频流程，把产出跑通再扩展。",
            bullets: [
              "确定一个业务负责人和一个管理员",
              "从技能市场选择 3 到 5 个技能",
              "创建项目并生成有作用域的 Project Key",
              "用真实策略边界跑一次 REST 或 MCP 测试",
              "检查日志、权限风险、反馈和下一批技能需求",
            ],
          },
        ],
        faq: [
          {
            question: "网站上可以直接付款吗？",
            answer:
              "目前不做公开自助收银。Launch Preview 期间，Pro 先通过联系确认和人工入驻开通，再推进后续付款流程。",
          },
          {
            question: "月付可以改成季付或年付吗？",
            answer:
              "可以。申请时写清希望的周期。季付按月付 9 折，年付按月付 8 折。",
          },
          {
            question: "只想用免费基础技能怎么办？",
            answer:
              "先在技能市场选择免费筛选。免费基础适合轻量试用；长期、复杂或高级流程应进入 Pro。",
          },
        ],
      },
    };
  }

  if (intent === "request-skill") {
    const trackLabel = formatRequestTrack(track, locale);

    return {
      ...basePage,
      en: {
        ...basePage.en,
        eyebrow: "Skill request",
        title: "Request a missing Skill",
        lead:
          "Use this path when the marketplace does not yet have the workflow your team needs, or when an existing skill is close but not exact.",
        quickAnswer:
          `Email ${companyInfo.supportEmail} with the workflow, tools involved, expected output, required permissions, frequency, and whether this should be a free basic or Pro skill. Operators use requests to prioritize the catalog roadmap.`,
        primaryCta: {
          href: requestSkillMailto("en", track),
          label: "Email skill request",
        },
        secondaryCta: { href: "/marketplace", label: "Back to marketplace" },
        sections: [
          {
            title: "What to send",
            body:
              "The best requests describe the business job, not only a tool name.",
            bullets: [
              `Workflow category${trackLabel ? `: ${trackLabel}` : " such as growth, e-commerce, data, support, sales, developer QA, or security"}`,
              "Current tools or data sources involved",
              "Input example and the output you expect",
              "How often the team runs this workflow",
              "Permission needs such as network, browser, files, or secrets",
              "Whether it should be free basics, Pro catalog, or future paid-preview",
            ],
          },
          {
            title: "How SkillHub prioritizes requests",
            body:
              "Requests are grouped by repeated pain, adoption value, permission risk, and whether the workflow can be made safe and reusable.",
            bullets: [
              "Operators first check whether an existing skill already solves most of the job.",
              "Low-risk, broadly useful basics may become free starter skills.",
              "Advanced, recurring, or high-value workflows are usually Pro candidates.",
              "High-risk workflows need clearer owner approval, examples, and runtime boundaries before listing.",
            ],
          },
          {
            title: "Good request examples",
            body:
              "Specific requests are easier to turn into a useful skill than broad requests like 'make marketing better'.",
            bullets: [
              "Audit Shopify product pages and return title, bullets, trust gaps, and SEO fixes.",
              "Clean a CSV of leads and output normalized company, role, region, and next action.",
              "Review a landing page screenshot and return mobile layout, trust, CTA, and copy issues.",
            ],
          },
        ],
        faq: [
          {
            question: "Will every request become a skill?",
            answer:
              "No. SkillHub prioritizes repeatable workflows that can be described, governed, reviewed, and maintained.",
          },
          {
            question: "Can a customer request a private skill?",
            answer:
              "During Launch Preview, requests are handled manually. Private or customer-specific skills need a clearer support and permission review before commitment.",
          },
        ],
      },
      zh: {
        ...basePage.zh,
        eyebrow: "技能需求",
        title: "提交缺失技能需求",
        lead:
          "当技能市场还没有你要的流程，或者现有技能接近但不完全适合时，请走这个路径。运营会根据真实需求补齐目录。",
        quickAnswer:
          `请发送邮件到 ${companyInfo.supportEmail}，写清业务流程、涉及工具、预期输出、需要的权限、使用频率，以及它应该是免费基础技能还是 Pro 技能。运营会用这些需求决定目录优先级。`,
        primaryCta: {
          href: requestSkillMailto("zh", track),
          label: "发送技能需求邮件",
        },
        secondaryCta: { href: "/marketplace", label: "返回技能市场" },
        sections: [
          {
            title: "需求邮件需要写什么",
            body:
              "不要只写工具名字，要写清楚它帮谁完成什么业务工作。",
            bullets: [
              `业务分类${trackLabel ? `：${trackLabel}` : "，例如增长、电商、数据、客服、销售、开发质检或安全"}`,
              "目前涉及的工具、数据源或页面",
              "输入示例和希望得到的输出结果",
              "这个流程多久会发生一次",
              "是否需要网络、浏览器、文件或密钥权限",
              "希望它是免费基础技能、Pro 目录技能，还是未来付费预览技能",
            ],
          },
          {
            title: "SkillHub 怎么判断优先级",
            body:
              "运营会按真实痛点、复用价值、权限风险和是否能安全标准化来归类需求。",
            bullets: [
              "先检查现有技能是否已经能解决大部分问题。",
              "低风险、通用的基础能力可能进入免费入门技能。",
              "高级、高频、高价值流程通常进入 Pro 候选。",
              "高风险流程需要更清楚的负责人批准、示例和运行边界。",
            ],
          },
          {
            title: "好的需求长什么样",
            body:
              "越具体，越容易变成可用技能；不要只写“帮我做营销”这种大而空的需求。",
            bullets: [
              "检查 Shopify 商品页，输出标题、卖点、信任缺口和 SEO 修复建议。",
              "清洗一份销售线索 CSV，输出公司、职位、地区和下一步动作。",
              "审查落地页截图，输出移动端排版、信任、CTA 和文案问题。",
            ],
          },
        ],
        faq: [
          {
            question: "提交了就一定会上架吗？",
            answer:
              "不一定。SkillHub 会优先处理可复用、可描述、可治理、可审核、有人维护的流程。",
          },
          {
            question: "客户可以提私有技能吗？",
            answer:
              "Launch Preview 期间需要人工评估。私有或客户定制技能要先明确支持责任和权限审查后再承诺。",
          },
        ],
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

function proMailto(
  locale: "en" | "zh",
  context: { cycle?: string; track?: string } = {},
) {
  const subject =
    locale === "zh" ? "SkillHub Pro 开通申请" : "SkillHub Pro access request";
  const cycle = formatBillingCycle(context.cycle, locale) ?? "";
  const track = formatRequestTrack(context.track, locale) ?? "";
  const body =
    locale === "zh"
      ? `公司名称：\n官网：\nSkillHub 账号邮箱：\n团队规模：\n管理员联系人：\n财务/采购联系人：\n付款周期（月付/季付/年付）：${cycle}\n优先场景：${track}\n预计先用的 3 个技能：\n目标工作流：\n希望上线时间：\n是否需要发票/安全审查/入驻协助：`
      : `Company name:\nWebsite:\nSkillHub account email:\nTeam size:\nAdmin contact:\nBilling/procurement contact:\nPreferred cycle (monthly/quarterly/annual): ${cycle}\nPrimary workflow: ${track}\nFirst 3 skills expected:\nTarget workflows:\nTarget launch date:\nInvoice/security/onboarding needs:`;

  return `${companyLinks.businessMailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function requestSkillMailto(locale: "en" | "zh", track?: string) {
  const subject =
    locale === "zh" ? "SkillHub 技能需求提交" : "SkillHub skill request";
  const trackLabel = formatRequestTrack(track, locale) ?? "";
  const body =
    locale === "zh"
      ? `业务分类：${trackLabel}\n希望新增的技能名称：\n这个技能帮谁做什么：\n目前涉及的工具/数据源：\n输入示例：\n预期输出：\n使用频率：\n权限需求（网络/浏览器/文件/密钥）：\n希望属于免费基础 / Pro / 未来付费预览：\n补充说明：`
      : `Workflow category: ${trackLabel}\nRequested skill name:\nWho this helps and what it should do:\nCurrent tools/data sources:\nInput example:\nExpected output:\nFrequency:\nPermission needs (network/browser/files/secrets):\nShould this be free basics / Pro / future paid preview:\nNotes:`;

  return `${companyLinks.supportMailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function formatBillingCycle(cycle: string | undefined, locale: "en" | "zh") {
  const normalized = String(cycle ?? "").trim().toLowerCase();
  const labels: Record<string, Record<"en" | "zh", string>> = {
    annual: { en: "Annual - 20% off", zh: "年付 - 8 折" },
    monthly: { en: "Monthly - $128/month", zh: "月付 - $128 / 月" },
    quarterly: { en: "Quarterly - 10% off", zh: "季付 - 9 折" },
  };

  return labels[normalized]?.[locale];
}

function formatRequestTrack(track: string | undefined, locale: "en" | "zh") {
  const normalized = String(track ?? "").trim().toLowerCase();
  const labels: Record<string, Record<"en" | "zh", string>> = {
    builder: { en: "Developer and security QA", zh: "开发与安全质检" },
    content: { en: "Content and copy operations", zh: "内容与文案运营" },
    data: { en: "Data and spreadsheet automation", zh: "数据与表格自动化" },
    dev: { en: "Developer tools and API QA", zh: "开发工具与 API 质检" },
    ecommerce: { en: "E-commerce product operations", zh: "电商商品运营" },
    finance: { en: "Finance and backoffice operations", zh: "财务与后台运营" },
    growth: { en: "SEO/GEO and content growth", zh: "SEO/GEO 与内容增长" },
    marketing: { en: "Ads and marketing operations", zh: "广告与营销运营" },
    ops: { en: "Support and operations", zh: "客服与运营" },
    research: { en: "Research and browser workflows", zh: "研究与浏览器流程" },
    revenue: { en: "Sales and customer growth", zh: "销售与客户增长" },
    sales: { en: "Sales and CRM", zh: "销售与 CRM" },
    security: { en: "Security and risk control", zh: "安全与风控" },
    seo: { en: "SEO/GEO growth", zh: "SEO/GEO 增长" },
    support: { en: "Support and operations", zh: "客服与运营" },
    ui: { en: "UI/UX polish", zh: "UI/UX 优化" },
  };

  return labels[normalized]?.[locale];
}
