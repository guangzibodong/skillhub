"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  KeyRound,
  PackageCheck,
  ShieldCheck,
  Terminal
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

type InstallCommand = {
  copyable?: boolean;
  label: string;
  status?: string;
  value: string;
};

type SkillInstallCommandPanelProps = {
  availabilityMessage?: string;
  billingModel: "free" | "per_call" | "subscription";
  commands: InstallCommand[];
  lastReviewed: string;
  latestVersion?: string;
  installable: boolean;
  installLockedReason?: string;
  locale: Locale;
  projectCount: number;
  readinessTitle?: string;
  risk: "high" | "low" | "medium";
  runtime: "HTTP" | "Local" | "MCP";
  showCommands?: boolean;
  verificationLabel: string;
  verificationLabelEn: string;
};

const copy = {
  en: {
    billing: "Pricing status",
    billingReady: "Free or metered use can move into project policy.",
    billingTrial: "Start a provider-deferred subscription trial before runtime use.",
    copied: "Copied",
    copy: "Copy",
    copyFailed: "Copy failed",
    copyFailure: "Command could not be copied.",
    copySuccess: "Command copied.",
    installReadiness: "Availability details",
    installLocked: "Inspection only. Verified review is required before install and runtime actions unlock.",
    lastReviewed: "Last reviewed",
    localRuntime: "Local runtime requires stronger project approval.",
    project: "Project state",
    projectMissing: "Sign in and create or select a project before install/test.",
    projectReady: "Signed-in developer project is available for install/test.",
    risk: "Permission risk",
    riskLabels: {
      high: "High risk",
      low: "Low risk",
      medium: "Medium risk",
    },
    riskHigh: "High-risk installs require owner approval before agents can call.",
    riskReady: "Permission profile can enter normal project policy.",
    runtime: "Runtime",
    runtimeReady: "Runtime tests use the SkillHub gateway only after sign-in, project key, and policy checks.",
    trust: "Review trust",
    trustReady: "Verified review is available for this listing.",
    trustWarning: "Inspection only. This listing is not verified yet.",
    version: "Version pin",
    billingModels: {
      free: "Free",
      per_call: "Per call",
      subscription: "Subscription",
    }
  },
  zh: {
    billing: "\u5b9a\u4ef7\u72b6\u6001",
    billingReady: "\u514d\u8d39\u6216\u6309\u91cf\u8ba1\u8d39\u53ef\u8fdb\u5165\u9879\u76ee\u7b56\u7565\u3002",
    billingTrial: "\u8fd0\u884c\u524d\u5148\u5f00\u542f\u4f9b\u5e94\u5546\u5ef6\u540e\u7684\u8ba2\u9605\u8bd5\u7528\u3002",
    copied: "\u5df2\u590d\u5236",
    copy: "\u590d\u5236",
    copyFailed: "\u590d\u5236\u5931\u8d25",
    copyFailure: "\u547d\u4ee4\u590d\u5236\u5931\u8d25\u3002",
    copySuccess: "\u547d\u4ee4\u5df2\u590d\u5236\u3002",
    installReadiness: "\u53ef\u7528\u72b6\u6001\u8bf4\u660e",
    installLocked: "\u4ec5\u53ef\u67e5\u770b\u3002\u9700\u8981\u5b8c\u6210\u9a8c\u8bc1\u5ba1\u6838\u540e\u624d\u4f1a\u5f00\u653e\u5b89\u88c5\u548c\u8fd0\u884c\u64cd\u4f5c\u3002",
    lastReviewed: "\u6700\u8fd1\u5ba1\u6838",
    localRuntime: "\u672c\u5730\u8fd0\u884c\u65f6\u9700\u8981\u66f4\u5f3a\u7684\u9879\u76ee\u5ba1\u6279\u3002",
    project: "\u9879\u76ee\u72b6\u6001",
    projectMissing: "\u767b\u5f55\u540e\u5148\u521b\u5efa\u6216\u9009\u62e9\u9879\u76ee\uff0c\u518d\u8fdb\u884c\u5b89\u88c5/\u6d4b\u8bd5\u3002",
    projectReady: "\u5df2\u767b\u5f55\u7684\u5f00\u53d1\u8005\u9879\u76ee\u53ef\u7528\u4e8e\u5b89\u88c5/\u6d4b\u8bd5\u3002",
    risk: "\u6743\u9650\u98ce\u9669",
    riskLabels: {
      high: "\u9ad8\u98ce\u9669",
      low: "\u4f4e\u98ce\u9669",
      medium: "\u4e2d\u98ce\u9669",
    },
    riskHigh: "\u9ad8\u98ce\u9669\u5b89\u88c5\u9700\u8981 owner \u6279\u51c6\u540e\u624d\u80fd\u8c03\u7528\u3002",
    riskReady: "\u6743\u9650\u753b\u50cf\u53ef\u8fdb\u5165\u5e38\u89c4\u9879\u76ee\u7b56\u7565\u3002",
    runtime: "\u8fd0\u884c\u65f6",
    runtimeReady: "\u8fd0\u884c\u6d4b\u8bd5\u9700\u5728\u767b\u5f55\u3001\u9879\u76ee Key \u548c\u7b56\u7565\u68c0\u67e5\u540e\u901a\u8fc7 SkillHub \u7f51\u5173\u53d1\u8d77\u3002",
    trust: "\u5ba1\u6838\u4fe1\u4efb",
    trustReady: "\u8be5\u5217\u8868\u5df2\u901a\u8fc7\u9a8c\u8bc1\u5ba1\u6838\u3002",
    trustWarning: "\u4ec5\u53ef\u67e5\u770b\u3002\u8be5\u5217\u8868\u5c1a\u672a\u901a\u8fc7\u9a8c\u8bc1\u5ba1\u6838\u3002",
    version: "\u7248\u672c\u56fa\u5b9a",
    billingModels: {
      free: "\u514d\u8d39",
      per_call: "\u6309\u6b21\u8c03\u7528",
      subscription: "\u8ba2\u9605",
    }
  }
} as const;

export function SkillInstallCommandPanel({
  availabilityMessage,
  billingModel,
  commands,
  installable,
  installLockedReason,
  lastReviewed,
  latestVersion,
  locale,
  projectCount,
  readinessTitle,
  risk,
  runtime,
  showCommands,
  verificationLabel,
  verificationLabelEn
}: SkillInstallCommandPanelProps) {
  const labels = copy[locale];
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{
    kind: "error" | "success";
    label: string;
    message: string;
  } | null>(null);
  const readiness = useMemo(
    () => buildReadiness({ billingModel, installable, labels, projectCount, risk, runtime, verificationLabel, verificationLabelEn }),
    [billingModel, installable, labels, projectCount, risk, runtime, verificationLabel, verificationLabelEn]
  );

  async function copyCommand(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(label);
      setCopyStatus({
        kind: "success",
        label,
        message: labels.copySuccess
      });
      window.setTimeout(() => {
        setCopiedKey(null);
        setCopyStatus((current) => (current?.label === label ? null : current));
      }, 1800);
    } catch {
      setCopiedKey(null);
      setCopyStatus({
        kind: "error",
        label,
        message: labels.copyFailure
      });
      window.setTimeout(() => {
        setCopyStatus((current) => (current?.label === label ? null : current));
      }, 2400);
    }
  }

  return (
    <div className="skill-install-command-panel">
      {availabilityMessage ? (
        <div className="skill-install-availability-note">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{availabilityMessage}</span>
        </div>
      ) : null}
      <div className="install-command-list">
        {showCommands ?? installable ? (
          commands.map((command) => (
            <div className="install-command-row" key={command.label}>
              <span>{command.label}</span>
              <code>{command.value}</code>
              {command.copyable === false ? (
                <div className="install-command-status install-command-status--info">
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>{command.status}</span>
                </div>
              ) : (
                <button
                  aria-label={`${getCommandButtonLabel({ commandLabel: command.label, copiedKey, copyStatus, labels })}: ${command.label}`}
                  className="icon-button"
                  onClick={() => {
                    void copyCommand(command.label, command.value);
                  }}
                  title={labels.copy}
                  type="button"
                >
                  {copyStatus?.label === command.label && copyStatus.kind === "error" ? (
                    <AlertCircle size={15} aria-hidden="true" />
                  ) : copiedKey === command.label ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Copy size={15} aria-hidden="true" />
                  )}
                </button>
              )}
              {command.copyable === false ? null : copyStatus?.label === command.label ? (
                <div
                  aria-live={copyStatus.kind === "error" ? "assertive" : "polite"}
                  className={`install-command-status install-command-status--${copyStatus.kind}`}
                  role={copyStatus.kind === "error" ? "alert" : "status"}
                >
                  {copyStatus.kind === "error" ? (
                    <AlertCircle size={14} aria-hidden="true" />
                  ) : (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  )}
                  <span>{copyStatus.message}</span>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="install-command-row install-command-row--locked">
            <span>{labels.trust}</span>
            <strong>{labels.installLocked}</strong>
            {installLockedReason ? (
              <div className="install-command-status install-command-status--info">
                <ShieldCheck size={14} aria-hidden="true" />
                <span>{installLockedReason}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="skill-install-readiness" aria-label={readinessTitle ?? labels.installReadiness}>
        <div className="skill-install-readiness__head">
          <ClipboardCheck size={15} aria-hidden="true" />
          <strong>{readinessTitle ?? labels.installReadiness}</strong>
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

function getCommandButtonLabel({
  commandLabel,
  copiedKey,
  copyStatus,
  labels
}: {
  commandLabel: string;
  copiedKey: string | null;
  copyStatus: {
    kind: "error" | "success";
    label: string;
    message: string;
  } | null;
  labels: (typeof copy)["en" | "zh"];
}) {
  if (copyStatus?.label === commandLabel && copyStatus.kind === "error") {
    return labels.copyFailed;
  }

  if (copiedKey === commandLabel) {
    return labels.copied;
  }

  return labels.copy;
}

function buildReadiness({
  billingModel,
  installable,
  labels,
  projectCount,
  risk,
  runtime,
  verificationLabel,
  verificationLabelEn
}: {
  billingModel: SkillInstallCommandPanelProps["billingModel"];
  installable: boolean;
  labels: (typeof copy)["en" | "zh"];
  projectCount: number;
  risk: SkillInstallCommandPanelProps["risk"];
  runtime: SkillInstallCommandPanelProps["runtime"];
  verificationLabel: string;
  verificationLabelEn: string;
}) {
  const verified = verificationLabelEn.toLowerCase() === "verified";
  const trustRow = {
    detail: verified ? labels.trustReady : labels.trustWarning,
    icon: <ShieldCheck size={15} aria-hidden="true" />,
    label: labels.trust,
    ready: verified,
    value: verificationLabel
  };

  if (!installable) {
    return [trustRow];
  }

  return [
    trustRow,
    {
      detail: risk === "high" ? labels.riskHigh : labels.riskReady,
      icon: <KeyRound size={15} aria-hidden="true" />,
      label: labels.risk,
      ready: risk !== "high",
      value: labels.riskLabels[risk]
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
      value: labels.billingModels[billingModel]
    }
  ];
}
