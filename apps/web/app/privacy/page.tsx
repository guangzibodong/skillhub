import { Database, FileText, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const copy = {
  en: {
    eyebrow: "Privacy",
    title: "Privacy and data handling.",
    body: "SkillHub stores only the operational data needed to run the registry, review Skills, govern runtime usage, secure accounts, and support billing-preview workflows. We do not claim broad compliance certifications until they are formally completed.",
    updated: "Current public-launch privacy posture",
    ctaPrimary: "Contact support",
    ctaSecondary: "Read security model",
    sections: [
      {
        icon: "database",
        title: "Data we process",
        body: "Account profile data, workspace membership, Skill manifests, review decisions, install state, Project Key metadata, invocation logs, usage records, notification preferences, and support reports.",
      },
      {
        icon: "key",
        title: "Secrets and credentials",
        body: "Project Keys, OAuth secrets, private keys, webhook signing secrets, and verification codes must not appear in public manifests, admin lists, logs, or support reports after first reveal.",
      },
      {
        icon: "shield",
        title: "Runtime governance",
        body: "Runtime invocation requires signed-in workspace context and Project Keys. Calls are scoped by permissions, policies, rate limits, and audit trails.",
      },
      {
        icon: "file",
        title: "Publisher responsibilities",
        body: "Publishers must accurately declare permissions, data retention notes, support paths, and risk-sensitive behavior for each Skill they submit.",
      },
      {
        icon: "lock",
        title: "Retention and deletion",
        body: "Operational records are retained while needed for security, auditability, billing preview, abuse response, and user support. Deletion and export requests can be routed through support.",
      },
      {
        icon: "mail",
        title: "Contact",
        body: "Use the support page for privacy questions, data requests, or security disclosure routing. Do not include secrets in public reports.",
      },
    ],
  },
  zh: {
    eyebrow: "隐私",
    title: "隐私与数据处理。",
    body: "SkillHub 仅存储运行 Skill 注册中心、审核 Skill、治理运行调用、保护账户以及支持账务预览流程所需的运营数据。在正式完成前，我们不会声称已取得广泛合规认证。",
    updated: "当前公开上线隐私态势",
    ctaPrimary: "联系支持",
    ctaSecondary: "查看安全模型",
    sections: [
      {
        icon: "database",
        title: "我们处理的数据",
        body: "账户资料、工作台成员关系、Skill manifest、审核决策、安装状态、Project Key 元数据、调用日志、用量记录、通知偏好和支持报告。",
      },
      {
        icon: "key",
        title: "密钥和凭据",
        body: "Project Key、OAuth secret、私钥、webhook signing secret 和验证码在首次展示后，不应出现在公开 manifest、管理列表、日志或支持报告中。",
      },
      {
        icon: "shield",
        title: "运行治理",
        body: "运行调用需要登录后的工作台上下文和 Project Key。调用受权限、策略、限流和审计轨迹约束。",
      },
      {
        icon: "file",
        title: "发布者责任",
        body: "发布者必须为提交的每个 Skill 准确声明权限、数据保留说明、支持路径和风险敏感行为。",
      },
      {
        icon: "lock",
        title: "保留和删除",
        body: "运营记录会在安全、审计、账务预览、滥用响应和用户支持所需期间保留。删除和导出请求可通过支持页面提交。",
      },
      {
        icon: "mail",
        title: "联系方式",
        body: "隐私问题、数据请求或安全披露渠道请求请使用支持页面。不要在公开报告中包含密钥。",
      },
    ],
  },
} as const;

const icons = {
  database: Database,
  file: FileText,
  key: KeyRound,
  lock: LockKeyhole,
  mail: Mail,
  shield: ShieldCheck,
};

export default async function PrivacyPage({ searchParams }: PageProps) {
  const locale = getLocaleFromSearchParams(await searchParams);
  const labels = copy[locale];

  return (
    <AppShell active="account" locale={locale}>
      <main className="overflow-x-hidden">
      <section className="pt-[120px] pb-[80px]">
        <div className="section-inner text-center hero-glow">
          <p className="eyebrow mb-4">{labels.eyebrow}</p>
          <h1 className="text-[40px] sm:text-[52px] md:text-[68px] font-bold leading-[1.05] tracking-[-0.04em] text-white mb-4">
            {labels.title}
          </h1>
          <p className="text-[18px] text-[#999] leading-[1.55] max-w-[760px] mx-auto mb-6">
            {labels.body}
          </p>
          <p className="text-[13px] text-[#10b981] mb-10">{labels.updated}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a className="btn-primary btn-primary--large" href={localizedHref("/support", locale)}>
              {labels.ctaPrimary}
            </a>
            <a className="btn-secondary btn-secondary--large" href={localizedHref("/security", locale)}>
              {labels.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-inner">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labels.sections.map((section) => {
              const Icon = icons[section.icon];

              return (
                <article className="feature-card" key={section.title}>
                  <div className="w-10 h-10 rounded-[7px] bg-[#7fee64]/10 text-[#7fee64] flex items-center justify-center mb-4">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <h2 className="text-[18px] font-semibold text-white mb-2">{section.title}</h2>
                  <p className="text-[14px] text-[#999] leading-[1.6]">{section.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      </main>
    </AppShell>
  );
}
