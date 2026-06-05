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
  ShieldCheck
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getLocaleFromSearchParams, localizedHref } from "@/lib/i18n";

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
  LockKeyhole
] as const;

const pageCopy = {
  en: {
    eyebrow: "Operating terms",
    title: "Marketplace rules for buyers, publishers, and platform operators.",
    description:
      "SkillHub needs public operating terms before payment, payout, and email providers are connected. These rules define what can be published, what developers can rely on, how money states behave, and how trust decisions are reviewed.",
    effective: "Draft policy basis for pre-launch operations",
    primary: "Publish a skill",
    secondary: "Read API docs",
    summary: [
      ["Scope", "Registry, marketplace, runtime gateway"],
      ["Money", "Ledger first, provider movement deferred"],
      ["Trust", "Review, incidents, reports, takedowns"],
      ["Data", "Manifest, runtime, billing, notification records"]
    ],
    sections: [
      {
        title: "Buyer and developer use",
        body: "Developers may discover, save, install, test, and invoke skills only through projects and project-scoped credentials.",
        bullets: [
          "Developers should inspect manifest schemas, permissions, pricing, version, review status, incidents, and published feedback before installation.",
          "Project owners remain responsible for approving high-risk permissions, setting budgets, rotating API keys, and adopting reviewed version updates.",
          "Runtime test calls from the console are non-billable unless the product explicitly marks them as paid provider execution."
        ]
      },
      {
        title: "Publisher responsibilities",
        body: "Publishers must provide accurate skill contracts and maintain public listings as operational products, not one-time uploads.",
        bullets: [
          "Every listing must include display name, description, version, runtime, input/output schemas, permissions, examples, changelog, and support path.",
          "Verified or installed versions are immutable; publishers must create a new semantic version for behavior, schema, permission, pricing, or runtime changes.",
          "Paid publishing requires an active publisher profile, acceptable payout-account state, approved pricing, and accepted refund/dispute terms."
        ]
      },
      {
        title: "Review, safety, and takedown",
        body: "SkillHub may review, reject, restrict, suspend, deprecate, or remove listings to protect developers, publishers, and the marketplace.",
        bullets: [
          "Verification requires automated manifest, runtime, example, and security checks plus a reviewer decision.",
          "Abuse reports, critical incidents, undeclared permissions, malicious runtime behavior, privacy issues, or billing abuse can trigger restriction or suspension.",
          "Suppressed distribution is a ranking action, not a takedown; publishers can use the marketplace appeal workflow when quality gaps are fixed."
        ]
      },
      {
        title: "Pricing, commission, and payout",
        body: "Commercial records are modeled before final payment-provider movement is connected.",
        bullets: [
          "Usage logs do not pay publishers directly; billable usage posts transactions, transaction splits, and publisher balance rows first.",
          "The launch default split is 20% platform fee and 80% publisher share unless a newer active commission rule applies to future posting.",
          "Balances mature after the risk window, then eligible balances can enter payout review. Provider payout movement remains deferred until final integration."
        ]
      },
      {
        title: "Refunds and disputes",
        body: "Refunds and disputes are handled as auditable adjustments instead of editing historical transactions.",
        bullets: [
          "Finance operators can approve, reject, post, fail, warn, win, or lose adjustment records with required reasons.",
          "Posted refunds create negative adjustment transactions, negative splits, and reversed publisher balance entries.",
          "Dispute losses can post refund adjustments automatically, while publishers and project operators can inspect scoped adjustment history."
        ]
      },
      {
        title: "Data retention and privacy posture",
        body: "SkillHub stores operational records needed for registry trust, runtime governance, billing traceability, and account safety.",
        bullets: [
          "Stored records include manifests, versions, review decisions, runtime checks, installs, policies, invocations, usage, ledger entries, notifications, and audit logs.",
          "Raw user tokens, API keys, email verification codes, OAuth secrets, webhook signing secrets, and provider keys must not be exposed after first reveal or through admin lists.",
          "Publishers must declare data retention notes when skills handle user, business, secret, financial, or sensitive operational data."
        ]
      },
      {
        title: "Incidents, deprecation, and support",
        body: "Operational failures should create durable signals for developers, publishers, and trust operators.",
        bullets: [
          "Runtime incidents can move through open, monitoring, resolved, and postmortem states with severity and decision reason.",
          "Installed-skill update inboxes should show new versions, deprecations, security notes, and incident recovery states before agents are moved.",
          "Publishers should maintain support paths, changelogs, and replacement guidance when versions are deprecated or skills are suspended."
        ]
      },
      {
        title: "Notifications and webhooks",
        body: "In-app, email, and webhook notification states are modeled before final email-provider delivery is fully connected.",
        bullets: [
          "Users can manage notification preferences for review, update, runtime, billing, payout, buyer-request, and account-security events.",
          "External email and webhook queues expose attempts, provider metadata, retry scheduling, signed webhook delivery, and redacted payload summaries.",
          "Email provider delivery and webhook network delivery must never expose verification codes, tokens, secrets, or sensitive payload fields through admin views."
        ]
      },
      {
        title: "Deferred final integrations",
        body: "Some provider integrations are intentionally last so the internal operating model stays stable first.",
        bullets: [
          "Payment capture, payment-provider customer sessions, connected payout onboarding, tax/KYC automation, and actual provider payout movement are deferred.",
          "Email provider delivery is connected through queued notification events; production readiness requires provider configuration and debug code previews disabled.",
          "Terms may be updated before paid marketplace launch when provider, region, tax, refund-window, KYC, and minimum-payout decisions are finalized."
        ]
      }
    ],
    operatorTitle: "Launch operator checklist",
    operatorItems: [
      "Run launch readiness and resolve blockers before public launch.",
      "Keep demo fallback and legacy direct-token signup disabled in production.",
      "Review active notification templates and external delivery queues.",
      "Create or confirm active commission rules before billable usage posting.",
      "Confirm public signup, refund window, payout threshold, and review SLA before paid marketplace launch."
    ],
    noticeTitle: "Policy status",
    notices: [
      "This page is the product operating policy for pre-launch and provider-deferred operation.",
      "Final legal terms can replace or extend this page before paid marketplace launch without changing the underlying state machines."
    ]
  },
  zh: {
    eyebrow: "\u8fd0\u8425\u6761\u6b3e",
    title: "\u7ed9\u4e70\u5bb6\u3001\u53d1\u5e03\u8005\u548c\u5e73\u53f0\u8fd0\u8425\u65b9\u7684\u5e02\u573a\u89c4\u5219\u3002",
    description:
      "\u5728\u652f\u4ed8\u3001\u63d0\u73b0\u548c\u90ae\u4ef6\u63d0\u4f9b\u5546\u6700\u7ec8\u63a5\u5165\u524d\uff0cSkillHub \u5fc5\u987b\u5148\u6709\u516c\u5f00\u8fd0\u8425\u6761\u6b3e\u3002\u8fd9\u4e9b\u89c4\u5219\u660e\u786e\u4ec0\u4e48\u80fd\u53d1\u5e03\u3001\u5f00\u53d1\u8005\u80fd\u4fe1\u4ec0\u4e48\u3001\u8d44\u91d1\u72b6\u6001\u600e\u4e48\u8d70\uff0c\u4ee5\u53ca\u4fe1\u4efb\u51b3\u7b56\u5982\u4f55\u590d\u6838\u3002",
    effective: "\u4e0a\u7ebf\u524d\u8fd0\u8425\u8349\u6848",
    primary: "\u53d1\u5e03\u6280\u80fd",
    secondary: "\u67e5\u770b API \u6587\u6863",
    summary: [
      ["\u8303\u56f4", "\u6ce8\u518c\u5e93\u3001\u5e02\u573a\u3001\u8fd0\u884c\u7f51\u5173"],
      ["\u8d44\u91d1", "\u5148\u8bb0\u8d26\uff0c\u63d0\u4f9b\u5546\u5212\u8f6c\u540e\u7f6e"],
      ["\u4fe1\u4efb", "\u5ba1\u6838\u3001\u4e8b\u6545\u3001\u4e3e\u62a5\u3001\u4e0b\u67b6"],
      ["\u6570\u636e", "\u534f\u8bae\u3001\u8fd0\u884c\u3001\u8d26\u52a1\u3001\u901a\u77e5\u8bb0\u5f55"]
    ],
    sections: [
      {
        title: "\u4e70\u5bb6\u548c\u5f00\u53d1\u8005\u4f7f\u7528",
        body: "\u5f00\u53d1\u8005\u53ea\u80fd\u901a\u8fc7\u9879\u76ee\u548c\u9879\u76ee\u7ea7\u51ed\u636e\u6765\u53d1\u73b0\u3001\u4fdd\u5b58\u3001\u5b89\u88c5\u3001\u6d4b\u8bd5\u548c\u8c03\u7528\u6280\u80fd\u3002",
        bullets: [
          "\u5b89\u88c5\u524d\u5e94\u68c0\u67e5 manifest schema\u3001\u6743\u9650\u3001\u4ef7\u683c\u3001\u7248\u672c\u3001\u5ba1\u6838\u72b6\u6001\u3001\u4e8b\u6545\u548c\u516c\u5f00\u53cd\u9988\u3002",
          "\u9879\u76ee owner \u8d1f\u8d23\u5ba1\u6279\u9ad8\u98ce\u9669\u6743\u9650\u3001\u8bbe\u7f6e\u9884\u7b97\u3001\u8f6e\u6362 API key\uff0c\u5e76\u91c7\u7528\u5df2\u5ba1\u6838\u7684\u7248\u672c\u66f4\u65b0\u3002",
          "\u63a7\u5236\u53f0\u8fd0\u884c\u6d4b\u8bd5\u9ed8\u8ba4\u4e0d\u8ba1\u8d39\uff0c\u9664\u975e\u4ea7\u54c1\u660e\u786e\u6807\u8bb0\u4e3a\u4ed8\u8d39\u63d0\u4f9b\u5546\u6267\u884c\u3002"
        ]
      },
      {
        title: "\u53d1\u5e03\u8005\u8d23\u4efb",
        body: "\u53d1\u5e03\u8005\u5fc5\u987b\u63d0\u4f9b\u51c6\u786e\u7684\u6280\u80fd\u534f\u8bae\uff0c\u5e76\u628a\u516c\u5f00\u4e0a\u67b6\u5f53\u6210\u53ef\u8fd0\u8425\u4ea7\u54c1\uff0c\u800c\u4e0d\u662f\u4e00\u6b21\u6027\u4e0a\u4f20\u3002",
        bullets: [
          "\u6bcf\u4e2a listing \u5fc5\u987b\u5305\u542b\u540d\u79f0\u3001\u63cf\u8ff0\u3001\u7248\u672c\u3001\u8fd0\u884c\u65f6\u3001\u8f93\u5165\u8f93\u51fa schema\u3001\u6743\u9650\u3001\u793a\u4f8b\u3001\u53d8\u66f4\u8bb0\u5f55\u548c\u652f\u6301\u8def\u5f84\u3002",
          "\u5df2\u9a8c\u8bc1\u6216\u5df2\u5b89\u88c5\u7248\u672c\u4e0d\u53ef\u5c31\u5730\u4fee\u6539\uff1b\u884c\u4e3a\u3001schema\u3001\u6743\u9650\u3001\u4ef7\u683c\u6216\u8fd0\u884c\u65f6\u53d8\u5316\u90fd\u8981\u521b\u5efa\u65b0\u8bed\u4e49\u7248\u672c\u3002",
          "\u4ed8\u8d39\u53d1\u5e03\u8981\u6c42\u53d1\u5e03\u8005\u8d44\u6599\u6709\u6548\u3001\u63d0\u73b0\u8d26\u6237\u72b6\u6001\u53ef\u63a5\u53d7\u3001\u4ef7\u683c\u5df2\u6279\u51c6\uff0c\u5e76\u63a5\u53d7\u9000\u6b3e\u548c\u4e89\u8bae\u6761\u6b3e\u3002"
        ]
      },
      {
        title: "\u5ba1\u6838\u3001\u5b89\u5168\u548c\u4e0b\u67b6",
        body: "SkillHub \u53ef\u4ee5\u5ba1\u6838\u3001\u62d2\u7edd\u3001\u9650\u5236\u3001\u6682\u505c\u3001\u5e9f\u5f03\u6216\u79fb\u9664 listing\uff0c\u4ee5\u4fdd\u62a4\u5f00\u53d1\u8005\u3001\u53d1\u5e03\u8005\u548c\u5e02\u573a\u3002",
        bullets: [
          "\u9a8c\u8bc1\u9700\u8981\u81ea\u52a8 manifest\u3001\u8fd0\u884c\u65f6\u3001\u793a\u4f8b\u548c\u5b89\u5168\u68c0\u67e5\uff0c\u518d\u52a0\u4e0a reviewer \u51b3\u7b56\u3002",
          "\u6ee5\u7528\u4e3e\u62a5\u3001\u91cd\u5927\u4e8b\u6545\u3001\u672a\u58f0\u660e\u6743\u9650\u3001\u6076\u610f\u8fd0\u884c\u3001\u9690\u79c1\u95ee\u9898\u6216\u8d26\u52a1\u6ee5\u7528\u53ef\u89e6\u53d1\u9650\u5236\u6216\u6682\u505c\u3002",
          "\u964d\u6743\u5206\u53d1\u662f\u6392\u540d\u52a8\u4f5c\uff0c\u4e0d\u7b49\u4e8e\u4e0b\u67b6\uff1b\u53d1\u5e03\u8005\u4fee\u590d\u8d28\u91cf\u7f3a\u53e3\u540e\u53ef\u7528\u5e02\u573a\u7533\u8bc9\u6d41\u7a0b\u590d\u6838\u3002"
        ]
      },
      {
        title: "\u4ef7\u683c\u3001\u5206\u4f63\u548c\u63d0\u73b0",
        body: "\u5728\u6700\u7ec8\u652f\u4ed8\u63d0\u4f9b\u5546\u5212\u8f6c\u63a5\u5165\u524d\uff0c\u5546\u4e1a\u8bb0\u5f55\u5148\u5b8c\u6574\u5efa\u6a21\u3002",
        bullets: [
          "\u7528\u91cf\u65e5\u5fd7\u4e0d\u76f4\u63a5\u652f\u4ed8\u7ed9\u53d1\u5e03\u8005\uff1b\u53ef\u8ba1\u8d39\u7528\u91cf\u5148\u751f\u6210 transaction\u3001split \u548c publisher balance\u3002",
          "\u4e0a\u7ebf\u9ed8\u8ba4\u5206\u6210\u662f\u5e73\u53f0 20%\u3001\u53d1\u5e03\u8005 80%\uff0c\u9664\u975e\u540e\u7eed\u751f\u6548\u7684 commission rule \u5bf9\u672a\u6765\u8bb0\u8d26\u751f\u6548\u3002",
          "\u4f59\u989d\u7ecf\u8fc7\u98ce\u9669\u7a97\u53e3\u540e\u6210\u719f\uff0c\u518d\u8fdb\u5165\u63d0\u73b0\u5ba1\u6838\u3002\u771f\u6b63\u7684\u63d0\u4f9b\u5546\u6253\u6b3e\u4fdd\u6301\u5ef6\u540e\u63a5\u5165\u3002"
        ]
      },
      {
        title: "\u9000\u6b3e\u548c\u4e89\u8bae",
        body: "\u9000\u6b3e\u548c\u4e89\u8bae\u4ee5\u53ef\u5ba1\u8ba1\u8c03\u6574\u8bb0\u5f55\u5904\u7406\uff0c\u800c\u4e0d\u662f\u4fee\u6539\u5386\u53f2\u4ea4\u6613\u3002",
        bullets: [
          "\u8d22\u52a1\u8fd0\u8425\u53ef\u4ee5\u5728\u5fc5\u586b reason \u540e approve\u3001reject\u3001post\u3001fail\u3001warn\u3001win \u6216 lose \u8c03\u6574\u8bb0\u5f55\u3002",
          "\u5df2 post \u7684\u9000\u6b3e\u4f1a\u751f\u6210\u8d1f\u5411\u8c03\u6574 transaction\u3001\u8d1f\u5411 split \u548c\u53cd\u8f6c\u7684 publisher balance\u3002",
          "\u4e89\u8bae\u5931\u8d25\u53ef\u81ea\u52a8 post \u9000\u6b3e\u8c03\u6574\uff0c\u53d1\u5e03\u8005\u548c\u9879\u76ee\u8fd0\u8425\u8005\u53ef\u67e5\u770b\u79df\u6237\u5185\u7684\u8c03\u6574\u5386\u53f2\u3002"
        ]
      },
      {
        title: "\u6570\u636e\u4fdd\u7559\u548c\u9690\u79c1\u59ff\u6001",
        body: "SkillHub \u4fdd\u7559\u652f\u6491\u6ce8\u518c\u5e93\u4fe1\u4efb\u3001\u8fd0\u884c\u6cbb\u7406\u3001\u8d26\u52a1\u53ef\u8ffd\u6eaf\u548c\u8d26\u6237\u5b89\u5168\u7684\u8fd0\u8425\u8bb0\u5f55\u3002",
        bullets: [
          "\u5b58\u50a8\u8bb0\u5f55\u5305\u542b manifest\u3001\u7248\u672c\u3001\u5ba1\u6838\u51b3\u7b56\u3001\u8fd0\u884c\u68c0\u67e5\u3001\u5b89\u88c5\u3001policy\u3001invocation\u3001usage\u3001ledger\u3001notification \u548c audit log\u3002",
          "\u539f\u59cb user token\u3001API key\u3001\u90ae\u4ef6\u9a8c\u8bc1\u7801\u3001OAuth secret\u3001webhook signing secret \u548c\u63d0\u4f9b\u5546 key \u4e0d\u5e94\u5728\u9996\u6b21\u663e\u793a\u540e\u6216\u540e\u53f0\u5217\u8868\u4e2d\u66b4\u9732\u3002",
          "\u5f53\u6280\u80fd\u5904\u7406\u7528\u6237\u3001\u4e1a\u52a1\u3001\u5bc6\u94a5\u3001\u8d22\u52a1\u6216\u654f\u611f\u8fd0\u8425\u6570\u636e\u65f6\uff0c\u53d1\u5e03\u8005\u5fc5\u987b\u58f0\u660e\u6570\u636e\u4fdd\u7559\u8bf4\u660e\u3002"
        ]
      },
      {
        title: "\u4e8b\u6545\u3001\u5e9f\u5f03\u548c\u652f\u6301",
        body: "\u8fd0\u8425\u6545\u969c\u5e94\u8be5\u7ed9\u5f00\u53d1\u8005\u3001\u53d1\u5e03\u8005\u548c\u4fe1\u4efb\u8fd0\u8425\u8005\u7559\u4e0b\u6301\u4e45\u4fe1\u53f7\u3002",
        bullets: [
          "\u8fd0\u884c\u4e8b\u6545\u53ef\u6309 open\u3001monitoring\u3001resolved\u3001postmortem \u6d41\u8f6c\uff0c\u5e76\u5e26\u4e25\u91cd\u7a0b\u5ea6\u548c\u51b3\u7b56 reason\u3002",
          "\u5df2\u5b89\u88c5\u6280\u80fd\u7684\u66f4\u65b0 inbox \u5e94\u663e\u793a\u65b0\u7248\u672c\u3001\u5e9f\u5f03\u3001\u5b89\u5168\u901a\u77e5\u548c\u4e8b\u6545\u6062\u590d\u72b6\u6001\uff0c\u7136\u540e\u624d\u8ba9 agent \u8fc1\u79fb\u3002",
          "\u7248\u672c\u5e9f\u5f03\u6216\u6280\u80fd\u6682\u505c\u65f6\uff0c\u53d1\u5e03\u8005\u5e94\u7ef4\u62a4\u652f\u6301\u8def\u5f84\u3001\u53d8\u66f4\u8bb0\u5f55\u548c\u66ff\u4ee3\u5efa\u8bae\u3002"
        ]
      },
      {
        title: "\u901a\u77e5\u548c Webhook",
        body: "\u5728\u6700\u7ec8\u90ae\u4ef6\u63d0\u4f9b\u5546\u5b8c\u5168\u63a5\u5165\u524d\uff0c\u5df2\u5148\u5efa\u6a21 in-app\u3001email \u548c webhook \u901a\u77e5\u72b6\u6001\u3002",
        bullets: [
          "\u7528\u6237\u53ef\u7ba1\u7406 review\u3001update\u3001runtime\u3001billing\u3001payout\u3001buyer-request \u548c account-security \u7684\u901a\u77e5\u504f\u597d\u3002",
          "\u5916\u90e8 email \u548c webhook \u961f\u5217\u66b4\u9732 attempts\u3001provider metadata\u3001retry schedule\u3001\u7b7e\u540d webhook delivery \u548c\u8131\u654f payload summary\u3002",
          "\u90ae\u4ef6\u548c webhook \u7f51\u7edc\u6295\u9012\u4e0d\u5f97\u901a\u8fc7\u540e\u53f0\u89c6\u56fe\u66b4\u9732\u9a8c\u8bc1\u7801\u3001token\u3001secret \u6216\u654f\u611f payload \u5b57\u6bb5\u3002"
        ]
      },
      {
        title: "\u5ef6\u540e\u7684\u6700\u7ec8\u63a5\u5165",
        body: "\u90e8\u5206\u63d0\u4f9b\u5546\u63a5\u5165\u523b\u610f\u653e\u5230\u6700\u540e\uff0c\u786e\u4fdd\u5185\u90e8\u8fd0\u8425\u6a21\u578b\u5148\u7a33\u5b9a\u3002",
        bullets: [
          "\u652f\u4ed8\u6263\u6b3e\u3001\u652f\u4ed8\u63d0\u4f9b\u5546\u5ba2\u6237 session\u3001\u8fde\u63a5\u8d26\u6237\u5165\u9a7b\u3001\u7a0e\u52a1/KYC \u81ea\u52a8\u5316\u548c\u771f\u6b63\u6253\u6b3e\u90fd\u662f\u5ef6\u540e\u9879\u3002",
          "\u90ae\u4ef6\u63d0\u4f9b\u5546\u6295\u9012\u901a\u8fc7\u5df2\u6392\u961f\u7684 notification event \u63a5\u5165\uff1b\u751f\u4ea7\u5c31\u7eea\u8981\u6c42\u63d0\u4f9b\u5546\u914d\u7f6e\u5b8c\u6210\u4e14\u5173\u95ed debug code preview\u3002",
          "\u4ed8\u8d39\u5e02\u573a\u4e0a\u7ebf\u524d\uff0c\u53ef\u6839\u636e provider\u3001\u533a\u57df\u3001\u7a0e\u52a1\u3001\u9000\u6b3e\u7a97\u53e3\u3001KYC \u548c\u6700\u4f4e\u63d0\u73b0\u95e8\u69db\u51b3\u7b56\u66f4\u65b0\u6761\u6b3e\u3002"
        ]
      }
    ],
    operatorTitle: "\u4e0a\u7ebf\u8fd0\u8425\u68c0\u67e5",
    operatorItems: [
      "\u516c\u5f00\u4e0a\u7ebf\u524d\u8fd0\u884c launch readiness\uff0c\u5148\u89e3\u51b3 blocker\u3002",
      "\u751f\u4ea7\u73af\u5883\u5173\u95ed demo fallback \u548c legacy direct-token signup\u3002",
      "\u590d\u6838\u5df2\u542f\u7528\u901a\u77e5\u6a21\u677f\u548c\u5916\u90e8\u6295\u9012\u961f\u5217\u3002",
      "\u53ef\u8ba1\u8d39\u7528\u91cf\u8bb0\u8d26\u524d\uff0c\u521b\u5efa\u6216\u786e\u8ba4\u751f\u6548\u4f63\u91d1\u89c4\u5219\u3002",
      "\u4ed8\u8d39\u5e02\u573a\u4e0a\u7ebf\u524d\uff0c\u786e\u8ba4\u516c\u5f00\u6ce8\u518c\u7b56\u7565\u3001\u9000\u6b3e\u7a97\u53e3\u3001\u63d0\u73b0\u95e8\u69db\u548c\u5ba1\u6838 SLA\u3002"
    ],
    noticeTitle: "\u6761\u6b3e\u72b6\u6001",
    notices: [
      "\u672c\u9875\u662f\u4e0a\u7ebf\u524d\u548c\u63d0\u4f9b\u5546\u5ef6\u540e\u63a5\u5165\u9636\u6bb5\u7684\u4ea7\u54c1\u8fd0\u8425\u6761\u6b3e\u3002",
      "\u6700\u7ec8\u6cd5\u52a1\u6761\u6b3e\u53ef\u5728\u4ed8\u8d39\u5e02\u573a\u4e0a\u7ebf\u524d\u66ff\u6362\u6216\u6269\u5c55\u672c\u9875\uff0c\u4e0d\u5f71\u54cd\u5df2\u5efa\u7acb\u7684\u72b6\u6001\u673a\u3002"
    ]
  }
} as const;

export default async function TermsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParams(params);
  const dictionary = getDictionary(locale);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://api.useskillhub.com";
  const labels = pageCopy[locale];

  return (
    <main className="product-shell terms-shell">
      <SiteHeader active="docs" apiUrl={apiUrl} dictionary={dictionary} locale={locale} pathname="/terms" />

      <section className="page-hero terms-hero">
        <div>
          <div className="eyebrow">
            <Scale size={16} aria-hidden="true" />
            <span>{labels.eyebrow}</span>
          </div>
          <h1>{labels.title}</h1>
          <p>{labels.description}</p>
          <span className="terms-effective">{labels.effective}</span>
        </div>
        <div className="hero-actions">
          <a className="primary-button primary-button--large" href={localizedHref("/publish", locale)}>
            <ClipboardCheck size={18} aria-hidden="true" />
            <span>{labels.primary}</span>
          </a>
          <a className="secondary-button secondary-button--large" href={localizedHref("/docs", locale)}>
            <Gavel size={18} aria-hidden="true" />
            <span>{labels.secondary}</span>
          </a>
        </div>
      </section>

      <section className="terms-summary-grid" aria-label={locale === "zh" ? "\u6761\u6b3e\u6458\u8981" : "Terms summary"}>
        {labels.summary.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="terms-layout">
        <div className="terms-policy-stack">
          {labels.sections.map((section, index) => {
            const Icon = sectionIcons[index];

            return (
              <article className="terms-policy-card lift-card" id={`policy-${index + 1}`} key={section.title}>
                <div className="card-kicker">
                  <Icon size={16} aria-hidden="true" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                <ul>
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <aside className="terms-ops-panel">
          <div className="card-kicker">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>{labels.operatorTitle}</span>
          </div>
          <div className="terms-check-list">
            {labels.operatorItems.map((item) => (
              <div className="terms-check-item" key={item}>
                <LockKeyhole size={15} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="terms-notice">
            <div className="card-kicker">
              <FileWarning size={16} aria-hidden="true" />
              <span>{labels.noticeTitle}</span>
            </div>
            {labels.notices.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
