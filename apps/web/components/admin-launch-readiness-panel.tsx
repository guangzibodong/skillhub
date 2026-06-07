import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, Rocket, ShieldAlert } from "lucide-react";
import { localizedHref, type Locale } from "@/lib/i18n";
import type { LaunchReadinessItem, LaunchReadinessReport, LaunchReadinessStatus } from "@/lib/ops-data";

type AdminLaunchReadinessPanelProps = {
  locale: Locale;
  readiness: LaunchReadinessReport;
};

const copy = {
  en: {
    checked: "Checked",
    empty: "Launch readiness data is unavailable.",
    environment: "Environment",
    evidenceCta: "Inspect proof",
    fixCta: "Open fix area",
    proofBody:
      "These five checks are the customer-demo evidence chain: supply, publishers, developer projects, governed runtime, and buyer trust. Every count comes from live launch-readiness state.",
    proofTitle: "Customer proof chain",
    priorityCount: "{count} active gaps",
    priorityEmpty: "No launch blockers, warnings, or deferred items.",
    priorityTitle: "Next launch actions",
    title: "Launch readiness",
    targetPrefix: "Target",
    fallbackTarget: "Admin readiness",
    sectionTitles: {
      commercial: "Commercial readiness",
      email: "Email access and delivery",
      guardrails: "Production guardrails",
      identity: "Identity and sign-in",
      launch_credibility: "Launch credibility thresholds",
      marketplace_operations: "Marketplace operations",
      webhook: "Webhook delivery"
    },
    statusLabels: {
      blocker: "Blocker",
      deferred: "Deferred",
      ready: "Ready",
      warning: "Warning"
    },
    summaryLabels: {
      blocker: "Blockers",
      deferred: "Deferred",
      ready: "Ready",
      warning: "Warnings"
    }
  },
  zh: {
    checked: "\u68c0\u67e5\u65f6\u95f4",
    empty: "\u6682\u65e0\u4e0a\u7ebf\u5c31\u7eea\u6570\u636e\u3002",
    environment: "\u73af\u5883",
    evidenceCta: "\u67e5\u770b\u8bc1\u636e",
    fixCta: "\u6253\u5f00\u4fee\u590d\u533a",
    proofBody:
      "\u8fd9\u4e94\u9879\u662f\u5ba2\u6237\u6f14\u793a\u7684\u8bc1\u636e\u94fe\uff1a\u6280\u80fd\u4f9b\u7ed9\u3001\u53d1\u5e03\u8005\u3001\u5f00\u53d1\u8005\u9879\u76ee\u3001\u53d7\u6cbb\u7406\u8fd0\u884c\u65f6\u548c\u4e70\u5bb6\u4fe1\u4efb\u3002\u6bcf\u4e2a\u6570\u5b57\u90fd\u6765\u81ea\u4e0a\u7ebf\u5c31\u7eea\u5ea6\u7684\u771f\u5b9e\u72b6\u6001\u3002",
    proofTitle: "\u5ba2\u6237\u6f14\u793a\u8bc1\u636e\u94fe",
    priorityCount: "\u5171 {count} \u9879\u5f85\u5904\u7406",
    priorityEmpty: "\u6682\u65e0\u963b\u65ad\u3001\u63d0\u9192\u6216\u5ef6\u540e\u9879\u3002",
    priorityTitle: "\u4e0b\u4e00\u6279\u4e0a\u7ebf\u52a8\u4f5c",
    title: "\u4e0a\u7ebf\u5c31\u7eea\u5ea6",
    targetPrefix: "\u76ee\u6807",
    fallbackTarget: "\u540e\u53f0\u5c31\u7eea\u5ea6",
    sectionTitles: {
      commercial: "\u5546\u4e1a\u5316\u5c31\u7eea\u5ea6",
      email: "\u90ae\u4ef6\u767b\u5f55\u4e0e\u6295\u9012",
      guardrails: "\u751f\u4ea7\u9632\u62a4\u680f",
      identity: "\u8eab\u4efd\u4e0e\u767b\u5f55",
      launch_credibility: "\u4e0a\u7ebf\u53ef\u4fe1\u5ea6\u9608\u503c",
      marketplace_operations: "\u5e02\u573a\u8fd0\u8425",
      webhook: "Webhook \u6295\u9012"
    },
    statusLabels: {
      blocker: "\u963b\u65ad",
      deferred: "\u5ef6\u540e",
      ready: "\u5c31\u7eea",
      warning: "\u63d0\u9192"
    },
    summaryLabels: {
      blocker: "\u963b\u65ad",
      deferred: "\u5ef6\u540e",
      ready: "\u5c31\u7eea",
      warning: "\u63d0\u9192"
    }
  }
} as const;

export function AdminLaunchReadinessPanel({ locale, readiness }: AdminLaunchReadinessPanelProps) {
  const labels = copy[locale];
  const visibleSections = readiness.sections.filter((section) => section.items.length > 0);
  const credibilityItems = visibleSections.find((section) => section.key === "launch_credibility")?.items ?? [];
  const priorityItems = visibleSections
    .flatMap((section) => section.items.map((item) => ({ item, sectionKey: section.key, sectionTitle: sectionTitleFor(section.key, section.title, labels) })))
    .filter(({ item }) => item.status !== "ready")
    .sort((a, b) => priorityOrder[a.item.status] - priorityOrder[b.item.status])
    .slice(0, 3);
  const checkedAt = formatDate(readiness.checkedAt, locale);

  return (
    <article className="ops-panel launch-readiness-panel">
      <header className="launch-readiness-head">
        <div>
          <div className="card-kicker">
            <Rocket size={16} aria-hidden="true" />
            <span>{labels.title}</span>
          </div>
          <div className="launch-readiness-env">
            <span>{labels.environment}: {readiness.environment.runtime}</span>
            <span>{readiness.environment.appUrl ?? "app:n/a"}</span>
            <span>{labels.checked}: {checkedAt}</span>
          </div>
        </div>
        <span className={statusClass(readiness.summary.status)}>{labels.statusLabels[readiness.summary.status]}</span>
      </header>

      <div className="launch-readiness-summary">
        <SummaryItem label={labels.summaryLabels.blocker} status="blocker" value={readiness.summary.blocker} />
        <SummaryItem label={labels.summaryLabels.warning} status="warning" value={readiness.summary.warning} />
        <SummaryItem label={labels.summaryLabels.ready} status="ready" value={readiness.summary.ready} />
        <SummaryItem label={labels.summaryLabels.deferred} status="deferred" value={readiness.summary.deferred} />
      </div>

      {credibilityItems.length > 0 ? (
        <section className="launch-readiness-proof" aria-label={labels.proofTitle}>
          <div className="launch-readiness-proof__head">
            <div>
              <strong>{labels.proofTitle}</strong>
              <p>{labels.proofBody}</p>
            </div>
            <a className="launch-readiness-target-link" href={localizedHref("/dashboard#dashboard-proof-chain", locale)}>
              <span>{labels.evidenceCta}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>

          <div className="launch-readiness-proof__grid">
            {credibilityItems.map((item) => {
              const Icon = statusIcon(item.status);
              const target = evidenceTargetFor(item, "launch_credibility", locale, labels);

              return (
                <a className={`launch-readiness-proof-card launch-readiness-proof-card--${item.status}`} href={target.href} key={item.key}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                    <small>{target.scope}</small>
                  </div>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="launch-readiness-priority" aria-label={labels.priorityTitle}>
        <div className="launch-readiness-priority__head">
          <strong>{labels.priorityTitle}</strong>
          <span>
            {priorityItems.length > 0
              ? labels.priorityCount.replace("{count}", String(priorityItems.length))
              : labels.priorityEmpty}
          </span>
        </div>

        {priorityItems.length > 0 ? (
          <div className="launch-readiness-priority__list">
            {priorityItems.map(({ item, sectionKey, sectionTitle }) => {
              const Icon = statusIcon(item.status);
              const target = evidenceTargetFor(item, sectionKey, locale, labels);

              return (
                <div className={`launch-readiness-priority__item launch-readiness-priority__item--${item.status}`} key={`${sectionTitle}-${item.key}`}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <header>
                      <span>{sectionTitle}</span>
                      <span className={statusClass(item.status)}>{labels.statusLabels[item.status]}</span>
                    </header>
                    <strong>{item.label}</strong>
                    <p>{item.action}</p>
                    <a className="launch-readiness-target-link" href={target.href}>
                      <span>{item.status === "ready" ? labels.evidenceCta : labels.fixCta}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {visibleSections.length > 0 ? (
        <div className="launch-readiness-sections">
          {visibleSections.map((section) => (
            <section className="launch-readiness-section" key={section.key}>
              <div className="launch-readiness-section__head">
                <strong>{sectionTitleFor(section.key, section.title, labels)}</strong>
                <span className={statusClass(section.status)}>{labels.statusLabels[section.status]}</span>
              </div>

              <div className="launch-readiness-items">
                {section.items.map((item) => (
                  <ReadinessItem item={item} key={item.key} labels={labels} locale={locale} sectionKey={section.key} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="launch-readiness-empty">{labels.empty}</div>
      )}
    </article>
  );
}

const priorityOrder: Record<LaunchReadinessStatus, number> = {
  blocker: 0,
  warning: 1,
  deferred: 2,
  ready: 3
};

function SummaryItem({ label, status, value }: { label: string; status: LaunchReadinessStatus; value: number }) {
  const Icon = statusIcon(status);

  return (
    <div className={`launch-readiness-summary__item launch-readiness-summary__item--${status}`}>
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReadinessItem({
  item,
  labels,
  locale,
  sectionKey
}: {
  item: LaunchReadinessItem;
  labels: (typeof copy)["en"] | (typeof copy)["zh"];
  locale: Locale;
  sectionKey: string;
}) {
  const Icon = statusIcon(item.status);
  const target = evidenceTargetFor(item, sectionKey, locale, labels);

  return (
    <div className={`launch-readiness-item launch-readiness-item--${item.status}`}>
      <Icon size={16} aria-hidden="true" />
      <div>
        <div className="launch-readiness-item__title">
          <strong>{item.label}</strong>
          <span className={statusClass(item.status)}>{labels.statusLabels[item.status]}</span>
        </div>
        <p>{item.description}</p>
        <span>{item.detail}</span>
        <em>{item.action}</em>
        <div className="launch-readiness-item__target">
          <a className="launch-readiness-target-link" href={target.href}>
            <span>{item.status === "ready" ? labels.evidenceCta : labels.fixCta}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
          <small>{labels.targetPrefix}: {target.scope}</small>
        </div>
      </div>
    </div>
  );
}

type CopyLabels = (typeof copy)["en"] | (typeof copy)["zh"];

function sectionTitleFor(sectionKey: string, fallback: string, labels: CopyLabels) {
  return labels.sectionTitles[sectionKey as keyof typeof labels.sectionTitles] ?? fallback;
}

function evidenceTargetFor(item: LaunchReadinessItem, sectionKey: string, locale: Locale, labels: CopyLabels) {
  const target = readinessTargets[item.key] ?? sectionTargets[sectionKey] ?? {
    href: "/admin#launch-readiness",
    scope: {
      en: labels.fallbackTarget,
      zh: labels.fallbackTarget
    }
  };

  return {
    href: localizedHref(target.href, locale),
    scope: target.scope[locale]
  };
}

const readinessTargets: Record<string, { href: string; scope: Record<Locale, string> }> = {
  active_projects_threshold: {
    href: "/developer",
    scope: {
      en: "Developer projects, installs, keys, and runtime activity",
      zh: "\u5f00\u53d1\u8005\u9879\u76ee\u3001\u5b89\u88c5\u3001Key \u548c\u8fd0\u884c\u6d3b\u52a8"
    }
  },
  active_publishers_threshold: {
    href: "/publishers",
    scope: {
      en: "Public publisher directory and supply diversity",
      zh: "\u516c\u5f00\u53d1\u5e03\u8005\u76ee\u5f55\u548c\u4f9b\u7ed9\u591a\u6837\u6027"
    }
  },
  api_key_salt: {
    href: "/developer",
    scope: {
      en: "Project runtime key governance",
      zh: "\u9879\u76ee\u8fd0\u884c Key \u6cbb\u7406"
    }
  },
  app_url: {
    href: "/",
    scope: {
      en: "Public app navigation and callback surface",
      zh: "\u516c\u5f00\u5e94\u7528\u5bfc\u822a\u4e0e\u56de\u8c03\u8868\u9762"
    }
  },
  auth_identity_storage: {
    href: "/admin#admin-identity",
    scope: {
      en: "Identity directory and account linkage",
      zh: "\u8eab\u4efd\u76ee\u5f55\u4e0e\u8d26\u53f7\u7ed1\u5b9a"
    }
  },
  buyer_request_delivery_package: {
    href: "/publisher",
    scope: {
      en: "Publisher buyer-request delivery package",
      zh: "\u53d1\u5e03\u8005\u4e70\u5bb6\u9700\u6c42\u4ea4\u4ed8\u5305"
    }
  },
  commission_rules: {
    href: "/admin#admin-ledger",
    scope: {
      en: "Commission rule and ledger controls",
      zh: "\u4f63\u91d1\u89c4\u5219\u4e0e\u8d26\u672c\u63a7\u5236"
    }
  },
  database_connection: {
    href: "/admin#admin-audit",
    scope: {
      en: "Database-backed audit and operations state",
      zh: "\u6570\u636e\u5e93\u652f\u6491\u7684\u5ba1\u8ba1\u4e0e\u8fd0\u8425\u72b6\u6001"
    }
  },
  demo_fallback: {
    href: "/marketplace",
    scope: {
      en: "Production catalog without bundled demo rows",
      zh: "\u4e0d\u4f9d\u8d56\u5185\u7f6e\u6f14\u793a\u884c\u7684\u751f\u4ea7\u76ee\u5f55"
    }
  },
  email_auth_secret: {
    href: "/login",
    scope: {
      en: "Email-code account entry",
      zh: "\u90ae\u4ef6\u9a8c\u8bc1\u7801\u8d26\u53f7\u5165\u53e3"
    }
  },
  email_challenge_storage: {
    href: "/login",
    scope: {
      en: "Email challenge creation and verification",
      zh: "\u90ae\u4ef6\u6311\u6218\u521b\u5efa\u4e0e\u9a8c\u8bc1"
    }
  },
  email_debug_codes: {
    href: "/admin#admin-deliveries",
    scope: {
      en: "Email-code delivery without preview leakage",
      zh: "\u4e0d\u6cc4\u9732\u9884\u89c8\u7801\u7684\u90ae\u4ef6\u6295\u9012"
    }
  },
  email_provider: {
    href: "/admin#admin-deliveries",
    scope: {
      en: "External email delivery queue",
      zh: "\u5916\u90e8\u90ae\u4ef6\u6295\u9012\u961f\u5217"
    }
  },
  github_oauth: {
    href: "/login",
    scope: {
      en: "GitHub login readiness",
      zh: "GitHub \u767b\u5f55\u5c31\u7eea\u5ea6"
    }
  },
  google_oauth: {
    href: "/login",
    scope: {
      en: "Google login readiness",
      zh: "Google \u767b\u5f55\u5c31\u7eea\u5ea6"
    }
  },
  legacy_signup: {
    href: "/login",
    scope: {
      en: "Account entry policy",
      zh: "\u8d26\u53f7\u5165\u53e3\u7b56\u7565"
    }
  },
  notification_delivery_schema: {
    href: "/admin#admin-deliveries",
    scope: {
      en: "Notification delivery processing",
      zh: "\u901a\u77e5\u6295\u9012\u5904\u7406"
    }
  },
  notification_templates: {
    href: "/admin#admin-templates",
    scope: {
      en: "Editable notification template coverage",
      zh: "\u53ef\u7f16\u8f91\u901a\u77e5\u6a21\u677f\u8986\u76d6"
    }
  },
  oauth_callback_base_url: {
    href: "/login",
    scope: {
      en: "OAuth callback and provider setup",
      zh: "OAuth \u56de\u8c03\u4e0e\u670d\u52a1\u5546\u914d\u7f6e"
    }
  },
  oauth_providers: {
    href: "/login",
    scope: {
      en: "OAuth provider setup",
      zh: "OAuth \u670d\u52a1\u5546\u914d\u7f6e"
    }
  },
  oauth_state_secret: {
    href: "/login",
    scope: {
      en: "OAuth state validation",
      zh: "OAuth state \u6821\u9a8c"
    }
  },
  operations_tables: {
    href: "/admin",
    scope: {
      en: "Admin, publisher, and developer operating records",
      zh: "\u540e\u53f0\u3001\u53d1\u5e03\u8005\u548c\u5f00\u53d1\u8005\u8fd0\u8425\u8bb0\u5f55"
    }
  },
  payment_provider: {
    href: "/terms",
    scope: {
      en: "Provider-deferred commercial terms",
      zh: "\u670d\u52a1\u5546\u5ef6\u540e\u7684\u5546\u4e1a\u6761\u6b3e"
    }
  },
  payout_explainability: {
    href: "/admin#admin-payouts",
    scope: {
      en: "Payout retry and next-action proof",
      zh: "\u63d0\u73b0\u91cd\u8bd5\u4e0e\u4e0b\u4e00\u6b65\u8bc1\u636e"
    }
  },
  payout_state: {
    href: "/admin#admin-payouts",
    scope: {
      en: "Payout account and finance review state",
      zh: "\u63d0\u73b0\u8d26\u6237\u4e0e\u8d22\u52a1\u5ba1\u6838\u72b6\u6001"
    }
  },
  public_signup_policy: {
    href: "/login",
    scope: {
      en: "Public signup and invite policy",
      zh: "\u516c\u5f00\u6ce8\u518c\u4e0e\u9080\u8bf7\u7b56\u7565"
    }
  },
  published_feedback_threshold: {
    href: "/admin#admin-risk",
    scope: {
      en: "Feedback moderation and public trust signals",
      zh: "\u8bc4\u4ef7\u5ba1\u6838\u4e0e\u516c\u5f00\u4fe1\u4efb\u4fe1\u53f7"
    }
  },
  publisher_feedback_responses: {
    href: "/admin#admin-risk",
    scope: {
      en: "Feedback response and moderation loop",
      zh: "\u8bc4\u4ef7\u56de\u590d\u4e0e\u5ba1\u6838\u95ed\u73af"
    }
  },
  publisher_terms_acceptance: {
    href: "/terms",
    scope: {
      en: "Publisher terms and acceptance record",
      zh: "\u53d1\u5e03\u8005\u6761\u6b3e\u4e0e\u63a5\u53d7\u8bb0\u5f55"
    }
  },
  review_check_remediation: {
    href: "/admin#admin-reviews",
    scope: {
      en: "Review evidence and automated check repair",
      zh: "\u5ba1\u6838\u8bc1\u636e\u4e0e\u81ea\u52a8\u68c0\u67e5\u4fee\u590d"
    }
  },
  runtime_check_remediation: {
    href: "/admin#admin-reviews",
    scope: {
      en: "Review evidence and automated check repair",
      zh: "\u5ba1\u6838\u8bc1\u636e\u4e0e\u81ea\u52a8\u68c0\u67e5\u4fee\u590d"
    }
  },
  schema_migrations: {
    href: "/admin#admin-audit",
    scope: {
      en: "Migration history and audit trail",
      zh: "\u8fc1\u79fb\u5386\u53f2\u4e0e\u5ba1\u8ba1\u8bb0\u5f55"
    }
  },
  service_token: {
    href: "/admin#admin-identity",
    scope: {
      en: "Bootstrap and recovery access posture",
      zh: "\u542f\u52a8\u4e0e\u6062\u590d\u8bbf\u95ee\u59ff\u6001"
    }
  },
  session_cookie_domain: {
    href: "/account",
    scope: {
      en: "Browser session and account center",
      zh: "\u6d4f\u89c8\u5668\u4f1a\u8bdd\u4e0e\u8d26\u53f7\u4e2d\u5fc3"
    }
  },
  successful_invocations_threshold: {
    href: "/developer",
    scope: {
      en: "Governed runtime tests and invocation logs",
      zh: "\u53d7\u6cbb\u7406\u8fd0\u884c\u6d4b\u8bd5\u4e0e\u8c03\u7528\u65e5\u5fd7"
    }
  },
  verified_skills_threshold: {
    href: "/marketplace?verification=verified&sort=recommended",
    scope: {
      en: "Verified public marketplace supply",
      zh: "\u5df2\u9a8c\u8bc1\u516c\u5f00\u5e02\u573a\u4f9b\u7ed9"
    }
  },
  webhook_retry_cap: {
    href: "/admin#admin-webhooks",
    scope: {
      en: "Webhook retry policy and outbox",
      zh: "Webhook \u91cd\u8bd5\u7b56\u7565\u4e0e outbox"
    }
  },
  webhook_timeout: {
    href: "/admin#admin-webhooks",
    scope: {
      en: "Webhook timeout and outbox health",
      zh: "Webhook \u8d85\u65f6\u4e0e outbox \u5065\u5eb7"
    }
  },
  webhook_worker_schema: {
    href: "/admin#admin-webhooks",
    scope: {
      en: "Webhook delivery worker state",
      zh: "Webhook \u6295\u9012\u5de5\u4f5c\u5668\u72b6\u6001"
    }
  }
};

const sectionTargets: Record<string, { href: string; scope: Record<Locale, string> }> = {
  commercial: {
    href: "/admin#admin-finance",
    scope: {
      en: "Finance, payout, ledger, and terms controls",
      zh: "\u8d22\u52a1\u3001\u63d0\u73b0\u3001\u8d26\u672c\u4e0e\u6761\u6b3e\u63a7\u5236"
    }
  },
  email: {
    href: "/admin#admin-deliveries",
    scope: {
      en: "Email and notification delivery operations",
      zh: "\u90ae\u4ef6\u4e0e\u901a\u77e5\u6295\u9012\u8fd0\u8425"
    }
  },
  guardrails: {
    href: "/admin#admin-identity",
    scope: {
      en: "Production access and fallback guardrails",
      zh: "\u751f\u4ea7\u8bbf\u95ee\u4e0e\u515c\u5e95\u9632\u62a4"
    }
  },
  identity: {
    href: "/login",
    scope: {
      en: "Login, OAuth, account, and session surfaces",
      zh: "\u767b\u5f55\u3001OAuth\u3001\u8d26\u53f7\u4e0e\u4f1a\u8bdd\u8868\u9762"
    }
  },
  launch_credibility: {
    href: "/dashboard#dashboard-proof-chain",
    scope: {
      en: "Customer demo proof chain",
      zh: "\u5ba2\u6237\u6f14\u793a\u8bc1\u636e\u94fe"
    }
  },
  marketplace_operations: {
    href: "/admin",
    scope: {
      en: "Marketplace operating console",
      zh: "\u5e02\u573a\u8fd0\u8425\u63a7\u5236\u53f0"
    }
  },
  webhook: {
    href: "/admin#admin-webhooks",
    scope: {
      en: "Webhook endpoint delivery proof",
      zh: "Webhook \u7aef\u70b9\u6295\u9012\u8bc1\u636e"
    }
  }
};

function statusIcon(status: LaunchReadinessStatus) {
  if (status === "ready") {
    return CheckCircle2;
  }

  if (status === "blocker") {
    return ShieldAlert;
  }

  if (status === "deferred") {
    return Clock3;
  }

  return AlertTriangle;
}

function statusClass(status: LaunchReadinessStatus) {
  if (status === "ready") {
    return "status-chip status-chip--success";
  }

  if (status === "blocker") {
    return "status-chip status-chip--danger";
  }

  if (status === "deferred") {
    return "status-chip status-chip--neutral";
  }

  return "status-chip status-chip--warning";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

  if (value === "demo") {
    return locale === "zh" ? "\u6f14\u793a\u65f6\u95f4" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
