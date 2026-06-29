import {
  BadgeDollarSign,
  BellRing,
  ClipboardCheck,
  DatabaseZap,
  FileWarning,
  Gavel,
  Handshake,
  LockKeyhole,
  RotateCcw,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/home/reveal";
import { getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";
import styles from "./terms.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const sectionIcons = [
  Handshake,
  ClipboardCheck,
  ShieldCheck,
  BadgeDollarSign,
  RotateCcw,
  DatabaseZap,
  FileWarning,
  BellRing,
  LockKeyhole,
] as const;

const pageCopy = {
  en: {
    eyebrow: "Production operating terms",
    title: "SkillHub operating terms.",
    description:
      "These operating terms cover public discovery, review, project-scoped runtime permissions, audit logs, Stripe payment capture, Stripe Connect payouts, notifications, and account security.",
    effective: "Current operating policy for public launch",
    primary: "Publish a skill",
    secondary: "Read API docs",
    summary: [
      ["Scope", "Registry, marketplace, runtime gateway"],
      ["Money", "Stripe Checkout, ledger posting, Stripe Connect payouts"],
      ["Trust", "Review, incidents, reports, takedowns"],
      ["Data", "Manifest, runtime, billing, notification records"],
    ],
    sections: [
      {
        title: "Buyer and developer use",
        body: "Developers may discover, save, install, test, and invoke skills only through projects and project-scoped credentials.",
        bullets: [
          "Developers should inspect manifest schemas, permissions, pricing, version, review status, incidents, and published feedback before installation.",
          "Project owners remain responsible for approving high-risk permissions, setting budgets, rotating API keys, and adopting reviewed version updates.",
          "Runtime test calls from the console are non-billable unless the product explicitly marks them as paid provider execution.",
        ],
      },
      {
        title: "Publisher responsibilities",
        body: "Publishers must provide accurate skill contracts and maintain public listings as operational products, not one-time uploads.",
        bullets: [
          "Every listing must include display name, description, version, runtime, input/output schemas, permissions, examples, changelog, and support path.",
          "Verified or installed versions are immutable; publishers must create a new semantic version for behavior, schema, permission, pricing, or runtime changes.",
          "Paid publishing requires an active publisher profile, verified Stripe Connect payout readiness, approved pricing, and accepted refund/dispute terms before public activation.",
        ],
      },
      {
        title: "Review, safety, and takedown",
        body: "SkillHub may review, reject, restrict, suspend, deprecate, or remove listings to protect developers, publishers, and the marketplace.",
        bullets: [
          "Verification requires automated manifest, runtime, example, and security checks plus a reviewer decision.",
          "Abuse reports, critical incidents, undeclared permissions, malicious runtime behavior, privacy issues, or billing abuse can trigger restriction or suspension.",
          "Suppressed distribution is a ranking action, not a takedown; publishers can use the marketplace appeal workflow when quality gaps are fixed.",
        ],
      },
      {
        title: "Pricing, commission, and paid marketplace",
        body: "Commercial records are created by real Stripe payment events, SkillHub ledger posting, and Stripe Connect payout state.",
        bullets: [
          "Billable usage and subscriptions post transactions, transaction splits, publisher balance rows, and auditable notifications.",
          "The default split model is 20% platform fee and 80% publisher share unless a newer active commission rule applies to future posting.",
          "Payment capture uses Stripe Checkout. Publisher payout readiness and payout references use Stripe Connect, with finance review where risk or threshold rules require it.",
        ],
      },
      {
        title: "Refunds and disputes",
        body: "Refunds and disputes are handled as auditable Stripe and ledger adjustments instead of editing historical transactions.",
        bullets: [
          "Finance operators can approve, reject, post, fail, warn, win, or lose adjustment records with required reasons.",
          "Posted refunds create negative adjustment transactions, negative splits, and reversed publisher balance entries.",
          "Dispute losses can post refund adjustments automatically, while publishers and project operators can inspect scoped adjustment history.",
        ],
      },
      {
        title: "Data retention and privacy posture",
        body: "SkillHub stores operational records needed for registry trust, call permissions and logs, billing traceability, and account safety.",
        bullets: [
          "Stored records include manifests, versions, review decisions, runtime checks, installs, policies, invocations, usage, ledger entries, notifications, and audit logs.",
          "Raw user tokens, API keys, email verification codes, OAuth secrets, webhook signing secrets, and provider keys must not be exposed after first reveal or through admin lists.",
          "Publishers must declare data retention notes when skills handle user, business, secret, financial, or sensitive operational data.",
        ],
      },
      {
        title: "Incidents, deprecation, and support",
        body: "Operational failures should create durable signals for developers, publishers, and trust operators.",
        bullets: [
          "Runtime incidents can move through open, monitoring, resolved, and postmortem states with severity and decision reason.",
          "Installed-skill update inboxes should show new versions, deprecations, security notes, and incident recovery states before agents are moved.",
          "Publishers should maintain support paths, changelogs, and replacement guidance when versions are deprecated or skills are suspended.",
        ],
      },
      {
        title: "Notifications and webhooks",
        body: "In-app, email, and webhook notification states are delivered through configured production providers.",
        bullets: [
          "Users can manage notification preferences for review, update, runtime, billing, payout, buyer-request, and account-security events.",
          "External email and webhook queues expose attempts, provider metadata, retry scheduling, signed webhook delivery, and redacted payload summaries.",
          "Email provider delivery and webhook network delivery must never expose verification codes, tokens, secrets, or sensitive payload fields through admin views.",
        ],
      },
      {
        title: "Production integrations",
        body: "Provider integrations must be configured before the related product surface is treated as available.",
        bullets: [
          "Stripe Checkout, Stripe webhooks, Stripe Connect onboarding, email delivery, OAuth providers, webhook delivery, and model-provider keys are production dependencies.",
          "If a dependency is not configured, the affected API returns a stable configuration_required error and the UI shows a real unavailable or empty state.",
          "Terms may be updated as provider, region, tax, refund-window, KYC, and minimum-payout decisions change.",
        ],
      },
    ],
    operatorTitle: "Launch operator checklist",
    operatorItems: [
      "Run launch readiness and resolve blockers before public launch.",
      "Keep runtime fallback paths and legacy direct-token signup disabled in every environment.",
      "Review active notification templates and external delivery queues.",
      "Create or confirm active commission rules before billable usage posting.",
      "Confirm public signup, refund window, payout threshold, and review SLA before paid marketplace traffic is enabled.",
    ],
    noticeTitle: "Policy status",
    notices: [
      "This page is the current production operating policy for the implemented SkillHub flows.",
      "Legal terms can replace or extend this page without changing the underlying state machines.",
    ],
  },
  zh: {
    eyebrow: "??????",
    title: "SkillHub ?????",
    description:
      "?????????????????????????????Stripe ???Stripe Connect ???????????",
    effective: "??????????",
    primary: "????",
    secondary: "?? API ??",
    summary: [
      ["??", "???????????"],
      ["??", "Stripe Checkout??????Stripe Connect ??"],
      ["??", "???????????"],
      ["??", "Manifest???????????"],
    ],
    sections: [
      {
        title: "????????",
        body: "Developers may discover, save, install, test, and invoke skills only through projects and project-scoped credentials.",
        bullets: [
          "Developers should inspect manifest schemas, permissions, pricing, version, review status, incidents, and published feedback before installation.",
          "Project owners remain responsible for approving high-risk permissions, setting budgets, rotating API keys, and adopting reviewed version updates.",
          "Runtime test calls from the console are non-billable unless the product explicitly marks them as paid provider execution.",
        ],
      },
      {
        title: "?????",
        body: "Publishers must provide accurate skill contracts and maintain public listings as operational products, not one-time uploads.",
        bullets: [
          "Every listing must include display name, description, version, runtime, input/output schemas, permissions, examples, changelog, and support path.",
          "Verified or installed versions are immutable; publishers must create a new semantic version for behavior, schema, permission, pricing, or runtime changes.",
          "Paid publishing requires an active publisher profile, verified Stripe Connect payout readiness, approved pricing, and accepted refund/dispute terms before public activation.",
        ],
      },
      {
        title: "????????",
        body: "SkillHub may review, reject, restrict, suspend, deprecate, or remove listings to protect developers, publishers, and the marketplace.",
        bullets: [
          "Verification requires automated manifest, runtime, example, and security checks plus a reviewer decision.",
          "Abuse reports, critical incidents, undeclared permissions, malicious runtime behavior, privacy issues, or billing abuse can trigger restriction or suspension.",
          "Suppressed distribution is a ranking action, not a takedown; publishers can use the marketplace appeal workflow when quality gaps are fixed.",
        ],
      },
      {
        title: "??????????",
        body: "Commercial records are created by real Stripe payment events, SkillHub ledger posting, and Stripe Connect payout state.",
        bullets: [
          "Billable usage and subscriptions post transactions, transaction splits, publisher balance rows, and auditable notifications.",
          "The default split model is 20% platform fee and 80% publisher share unless a newer active commission rule applies to future posting.",
          "Payment capture uses Stripe Checkout. Publisher payout readiness and payout references use Stripe Connect, with finance review where risk or threshold rules require it.",
        ],
      },
      {
        title: "?????",
        body: "Refunds and disputes are handled as auditable Stripe and ledger adjustments instead of editing historical transactions.",
        bullets: [
          "Finance operators can approve, reject, post, fail, warn, win, or lose adjustment records with required reasons.",
          "Posted refunds create negative adjustment transactions, negative splits, and reversed publisher balance entries.",
          "Dispute losses can post refund adjustments automatically, while publishers and project operators can inspect scoped adjustment history.",
        ],
      },
      {
        title: "???????",
        body: "SkillHub stores operational records needed for registry trust, call permissions and logs, billing traceability, and account safety.",
        bullets: [
          "Stored records include manifests, versions, review decisions, runtime checks, installs, policies, invocations, usage, ledger entries, notifications, and audit logs.",
          "Raw user tokens, API keys, email verification codes, OAuth secrets, webhook signing secrets, and provider keys must not be exposed after first reveal or through admin lists.",
          "Publishers must declare data retention notes when skills handle user, business, secret, financial, or sensitive operational data.",
        ],
      },
      {
        title: "????????",
        body: "Operational failures should create durable signals for developers, publishers, and trust operators.",
        bullets: [
          "Runtime incidents can move through open, monitoring, resolved, and postmortem states with severity and decision reason.",
          "Installed-skill update inboxes should show new versions, deprecations, security notes, and incident recovery states before agents are moved.",
          "Publishers should maintain support paths, changelogs, and replacement guidance when versions are deprecated or skills are suspended.",
        ],
      },
      {
        title: "??? Webhook",
        body: "In-app, email, and webhook notification states are delivered through configured production providers.",
        bullets: [
          "Users can manage notification preferences for review, update, runtime, billing, payout, buyer-request, and account-security events.",
          "External email and webhook queues expose attempts, provider metadata, retry scheduling, signed webhook delivery, and redacted payload summaries.",
          "Email provider delivery and webhook network delivery must never expose verification codes, tokens, secrets, or sensitive payload fields through admin views.",
        ],
      },
      {
        title: "????",
        body: "Provider integrations must be configured before the related product surface is treated as available.",
        bullets: [
          "Stripe Checkout, Stripe webhooks, Stripe Connect onboarding, email delivery, OAuth providers, webhook delivery, and model-provider keys are production dependencies.",
          "If a dependency is not configured, the affected API returns a stable configuration_required error and the UI shows a real unavailable or empty state.",
          "Terms may be updated as provider, region, tax, refund-window, KYC, and minimum-payout decisions change.",
        ],
      },
    ],
    operatorTitle: "??????",
    operatorItems: [
      "??????? launch readiness ??? blocker?",
      "?????????? fallback ??? legacy direct-token signup ???",
      "??????????????????",
      "?????????????????????",
      "??????????????????????????????? SLA?",
    ],
    noticeTitle: "????",
    notices: [
      "???????? SkillHub ??????????",
      "?????????????????????????",
    ],
  },
} as const;

export default async function TermsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const labels = locale === "zh" ? pageCopy.en : pageCopy[locale];

  return (
    <AppShell active="terms" locale={locale}>
      <div className={"terms-shell " + styles.pageStyles}>
        {/* Hero */}
        <section className="terms-hero py-[96px] pt-32">
          <div className="section-inner">
            <Reveal>
              <div className="max-w-[720px]">
                <div className="eyebrow">
                  <Scale size={16} aria-hidden="true" />
                  <span>{labels.eyebrow}</span>
                </div>
                <h1 className="heading-xl mt-4">{labels.title}</h1>
                <p className="body-text mt-4 text-[#999]">
                  {labels.description}
                </p>
                <span className="terms-effective inline-block mt-4 text-sm text-[#10b981] font-medium">
                  {labels.effective}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  className="btn-primary"
                  href={localizedHref("/publish", locale)}
                >
                  <ClipboardCheck size={18} aria-hidden="true" />
                  <span>{labels.primary}</span>
                </a>
                <a
                  className="btn-secondary"
                  href={localizedHref("/docs", locale)}
                >
                  <Gavel size={18} aria-hidden="true" />
                  <span>{labels.secondary}</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Summary grid */}
        <section
          className="py-8 section-divider"
          aria-label={locale === "zh" ? "鏉℃鎽樿" : "Terms summary"}
        >
          <div className="section-inner">
            <div className="terms-summary-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {labels.summary.map(([label, value], i) => (
                <Reveal key={label} delay={i * 60}>
                  <div className="bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-4">
                    <span className="block text-sm text-[#666] mb-1">
                      {label}
                    </span>
                    <strong className="text-white text-sm">{value}</strong>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Policy sections + operator aside */}
        <section className="py-[96px] section-divider">
          <div className="section-inner">
            <div className="terms-layout flex flex-col lg:flex-row gap-8">
              {/* Policy cards */}
              <div className="terms-policy-stack flex-1 flex flex-col gap-6">
                {labels.sections.map((section, index) => {
                  const Icon = sectionIcons[index];

                  return (
                    <Reveal key={section.title} delay={index * 60}>
                      <article
                        id={`policy-${index + 1}`}
                        className="terms-policy-card bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-3">
                          <Icon size={16} aria-hidden="true" />
                          <span>{String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <h2 className="heading-md mb-2">{section.title}</h2>
                        <p className="body-text-sm text-[#999] mb-4">
                          {section.body}
                        </p>
                        <ul className="list-disc list-inside space-y-2">
                          {section.bullets.map((item) => (
                            <li key={item} className="body-text-sm text-[#999]">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </article>
                    </Reveal>
                  );
                })}
              </div>

              {/* Operator checklist aside */}
              <aside className="lg:w-[340px] shrink-0">
                <Reveal delay={100}>
                  <div className="terms-ops-panel bg-[#212121] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 sticky top-24">
                    <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-4">
                      <ShieldCheck size={16} aria-hidden="true" />
                      <span>{labels.operatorTitle}</span>
                    </div>
                    <div className="terms-check-list space-y-3 mb-6">
                      {labels.operatorItems.map((item) => (
                        <div
                          key={item}
                          className="terms-check-item flex items-start gap-2"
                        >
                          <LockKeyhole
                            size={15}
                            className="shrink-0 mt-0.5 text-[#525252]"
                            aria-hidden="true"
                          />
                          <span className="body-text-sm text-[#999]">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="terms-notice border-t border-[rgba(255,255,255,0.08)] pt-4">
                      <div className="flex items-center gap-2 text-xs text-[#666] uppercase tracking-wider mb-3">
                        <FileWarning size={16} aria-hidden="true" />
                        <span>{labels.noticeTitle}</span>
                      </div>
                      {labels.notices.map((item) => (
                        <p
                          key={item}
                          className="body-text-sm text-[#999] mb-2 last:mb-0"
                        >
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
