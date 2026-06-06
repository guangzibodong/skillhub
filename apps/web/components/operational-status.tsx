import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Circle, XCircle } from "lucide-react";
import type { PermissionRisk, PreflightState } from "@/lib/manifest-preflight";

type ChipTone = "success" | "warning" | "danger" | "neutral";

export function StatusChip({ children, icon, tone = "neutral" }: { children: ReactNode; icon?: ReactNode; tone?: ChipTone }) {
  const className = tone === "success" ? "status-chip status-chip--success" : `status-chip status-chip--${tone}`;

  return (
    <span className={className}>
      {icon}
      {children}
    </span>
  );
}

export function RiskBadge({ label, level }: { label: string; level: PermissionRisk }) {
  return <span className={`risk-badge risk-badge--${level}`}>{label}</span>;
}

export function FlowStepList({
  ariaLabel,
  steps
}: {
  ariaLabel: string;
  steps: Array<{
    body: string;
    icon?: ReactNode;
    title: string;
  }>;
}) {
  return (
    <div aria-label={ariaLabel} className="operational-flow-list">
      {steps.map((step, index) => (
        <div className="operational-flow-step" key={step.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {step.icon ? <div className="operational-flow-step__icon">{step.icon}</div> : null}
          <strong>{step.title}</strong>
          <small>{step.body}</small>
        </div>
      ))}
    </div>
  );
}

export function PreflightCheckList({
  checks
}: {
  checks: Array<{
    detail: string;
    label: string;
    state: PreflightState;
  }>;
}) {
  return (
    <div className="operational-check-list">
      {checks.map((check) => (
        <div className={`operational-check operational-check--${check.state}`} key={check.label}>
          {getCheckIcon(check.state)}
          <div>
            <strong>{check.label}</strong>
            <span>{check.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActionResult({
  actions,
  body,
  title,
  tone
}: {
  actions?: ReactNode;
  body: string;
  title: string;
  tone: ChipTone;
}) {
  return (
    <div className={`action-result action-result--${tone}`}>
      <div>
        {tone === "danger" ? <XCircle size={18} aria-hidden="true" /> : tone === "warning" ? <AlertTriangle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
        <strong>{title}</strong>
      </div>
      <p>{body}</p>
      {actions ? <div className="action-result__actions">{actions}</div> : null}
    </div>
  );
}

function getCheckIcon(state: PreflightState) {
  if (state === "passed") {
    return <CheckCircle2 size={16} aria-hidden="true" />;
  }

  if (state === "warning") {
    return <AlertTriangle size={16} aria-hidden="true" />;
  }

  return <XCircle size={16} aria-hidden="true" />;
}

export function DotStatus({ tone = "neutral" }: { tone?: ChipTone }) {
  return <Circle className={`dot-status dot-status--${tone}`} size={9} aria-hidden="true" fill="currentColor" />;
}
