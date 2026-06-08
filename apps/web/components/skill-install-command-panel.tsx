"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, Copy, CreditCard, KeyRound, PackageCheck, ShieldCheck, Terminal } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type InstallCommand = {
  label: string;
  value: string;
};

type SkillInstallCommandPanelProps = {
  billingModel: "free" | "per_call" | "subscription";
  commands: InstallCommand[];
  lastReviewed: string;
  latestVersion?: string;
  installable: boolean;
  locale: Locale;
  projectCount: number;
  risk: "high" | "low" | "medium";
  runtime: "HTTP" | "Local" | "MCP";
  verificationLabel: string;
  verificationLabelEn: string;
};

const copy = {
  en: {
    billing: "Billing gate",
    billingReady: "Free or metered use can move into project policy.",
    billingTrial: "Start a provider-deferred subscription trial before runtime use.",
    copied: "Copied",
    copy: "Copy",
    installReadiness: "Install readiness",
    installLocked: "Verified review required before install commands unlock.",
    lastReviewed: "Last reviewed",
    localRuntime: "Local runtime requires stronger project approval.",
    project: "Project state",
    projectMissing: "Create or select a project before install/test.",
    projectReady: "Developer project is available for install/test.",
    risk: "Permission risk",
    riskHigh: "High-risk installs require owner approval before agents can call.",
    riskReady: "Permission profile can enter normal project policy.",
    runtime: "Runtime",
    runtimeReady: "Runtime can be tested through SkillHub gateway.",
    trust: "Review trust",
    trustReady: "Verified review is available for this listing.",
    trustWarning: "Review is not verified; install with extra caution.",
    version: "Version pin"
  },
  zh: {
    billing: "\u8ba1\u8d39\u95e8\u69db",
    billingReady: "\u514d\u8d39\u6216\u6309\u91cf\u8ba1\u8d39\u53ef\u8fdb\u5165\u9879\u76ee\u7b56\u7565\u3002",
    billingTrial: "\u8fd0\u884c\u524d\u5148\u5f00\u542f\u4f9b\u5e94\u5546\u5ef6\u540e\u7684\u8ba2\u9605\u8bd5\u7528\u3002",
    copied: "\u5df2\u590d\u5236",
    copy: "\u590d\u5236",
    installReadiness: "\u5b89\u88c5\u51c6\u5907",
    installLocked: "\u9700\u8981\u5b8c\u6210 verified \u5ba1\u6838\u540e\u624d\u4f1a\u5f00\u653e\u5b89\u88c5\u547d\u4ee4\u3002",
    lastReviewed: "\u6700\u8fd1\u5ba1\u6838",
    localRuntime: "\u672c\u5730\u8fd0\u884c\u65f6\u9700\u8981\u66f4\u5f3a\u7684\u9879\u76ee\u5ba1\u6279\u3002",
    project: "\u9879\u76ee\u72b6\u6001",
    projectMissing: "\u5b89\u88c5/\u6d4b\u8bd5\u524d\u8bf7\u5148\u521b\u5efa\u6216\u9009\u62e9\u9879\u76ee\u3002",
    projectReady: "\u5df2\u6709\u5f00\u53d1\u8005\u9879\u76ee\u53ef\u7528\u4e8e\u5b89\u88c5/\u6d4b\u8bd5\u3002",
    risk: "\u6743\u9650\u98ce\u9669",
    riskHigh: "\u9ad8\u98ce\u9669\u5b89\u88c5\u9700\u8981 owner \u6279\u51c6\u540e\u624d\u80fd\u8c03\u7528\u3002",
    riskReady: "\u6743\u9650\u753b\u50cf\u53ef\u8fdb\u5165\u5e38\u89c4\u9879\u76ee\u7b56\u7565\u3002",
    runtime: "\u8fd0\u884c\u65f6",
    runtimeReady: "\u53ef\u901a\u8fc7 SkillHub \u7f51\u5173\u6d4b\u8bd5\u8fd0\u884c\u3002",
    trust: "\u5ba1\u6838\u4fe1\u4efb",
    trustReady: "\u8be5\u5217\u8868\u5df2\u6709 verified \u5ba1\u6838\u3002",
    trustWarning: "\u8be5\u5217\u8868\u5c1a\u672a verified\uff0c\u5b89\u88c5\u524d\u9700\u66f4\u8c28\u614e\u3002",
    version: "\u7248\u672c\u56fa\u5b9a"
  }
} as const;

export function SkillInstallCommandPanel({
  billingModel,
  commands,
  installable,
  lastReviewed,
  latestVersion,
  locale,
  projectCount,
  risk,
  runtime,
  verificationLabel,
  verificationLabelEn
}: SkillInstallCommandPanelProps) {
  const labels = copy[locale];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const readiness = useMemo(
    () => buildReadiness({ billingModel, labels, projectCount, risk, runtime, verificationLabel, verificationLabelEn }),
    [billingModel, labels, projectCount, risk, runtime, verificationLabel, verificationLabelEn]
  );

  async function copyCommand(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(label);
    window.setTimeout(() => setCopiedKey(null), 1800);
  }

  return (
    <div className="skill-install-command-panel">
      <div className="install-command-list">
        {installable ? (
          commands.map((command) => (
            <div className="install-command-row" key={command.label}>
              <span>{command.label}</span>
              <code>{command.value}</code>
              <button className="icon-button" onClick={() => copyCommand(command.label, command.value)} title={labels.copy} type="button">
                {copiedKey === command.label ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              </button>
            </div>
          ))
        ) : (
          <div className="install-command-row install-command-row--locked">
            <span>{labels.trust}</span>
            <strong>{labels.installLocked}</strong>
          </div>
        )}
      </div>

      <div className="skill-install-readiness" aria-label={labels.installReadiness}>
        <div className="skill-install-readiness__head">
          <ClipboardCheck size={15} aria-hidden="true" />
          <strong>{labels.installReadiness}</strong>
          <span>
            {labels.version}: {latestVersion ?? "latest"} / {labels.lastReviewed}: {lastReviewed}
          </span>
        </div>
        <div className="skill-install-readiness__grid">
          {readiness.map((item) => (
            <div className="skill-install-readiness__item" key={item.label}>
              {item.icon}
              <span className={item.ready ? "status-chip" : "status-chip status-chip--warning"}>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildReadiness({
  billingModel,
  labels,
  projectCount,
  risk,
  runtime,
  verificationLabel,
  verificationLabelEn
}: {
  billingModel: SkillInstallCommandPanelProps["billingModel"];
  labels: (typeof copy)["en" | "zh"];
  projectCount: number;
  risk: SkillInstallCommandPanelProps["risk"];
  runtime: SkillInstallCommandPanelProps["runtime"];
  verificationLabel: string;
  verificationLabelEn: string;
}) {
  const verified = verificationLabelEn.toLowerCase() === "verified";

  return [
    {
      detail: verified ? labels.trustReady : labels.trustWarning,
      icon: <ShieldCheck size={15} aria-hidden="true" />,
      label: labels.trust,
      ready: verified,
      value: verificationLabel
    },
    {
      detail: risk === "high" ? labels.riskHigh : labels.riskReady,
      icon: <KeyRound size={15} aria-hidden="true" />,
      label: labels.risk,
      ready: risk !== "high",
      value: risk
    },
    {
      detail: runtime === "Local" ? labels.localRuntime : labels.runtimeReady,
      icon: <Terminal size={15} aria-hidden="true" />,
      label: labels.runtime,
      ready: runtime !== "Local",
      value: runtime
    },
    {
      detail: projectCount > 0 ? labels.projectReady : labels.projectMissing,
      icon: <PackageCheck size={15} aria-hidden="true" />,
      label: labels.project,
      ready: projectCount > 0,
      value: String(projectCount)
    },
    {
      detail: billingModel === "subscription" ? labels.billingTrial : labels.billingReady,
      icon: <CreditCard size={15} aria-hidden="true" />,
      label: labels.billing,
      ready: billingModel !== "subscription",
      value: billingModel
    }
  ];
}
