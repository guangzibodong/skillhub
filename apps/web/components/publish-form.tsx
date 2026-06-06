"use client";

import { CheckCircle2, ClipboardCheck, FileJson, Gauge, KeyRound, LockKeyhole, Send, ShieldCheck, XCircle } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { ActionResult, PreflightCheckList, RiskBadge, StatusChip } from "@/components/operational-status";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import { analyzeManifestPreflight } from "@/lib/manifest-preflight";
import { publishSkillAction, type PublishSkillActionState } from "@/lib/publish-actions";
import type { PublishFormCopy } from "@/lib/publish-copy";

type PublishFormProps = {
  apiUrl: string;
  labels: PublishFormCopy;
  locale: Locale;
};

const exampleManifest = {
  schemaVersion: "0.1",
  name: "email-brief",
  displayName: "Email Brief",
  version: "0.1.0",
  description: "Summarize long email threads into decisions, blockers, and next actions for autonomous agents.",
  author: {
    name: "SkillHub"
  },
  tags: ["email", "summary", "productivity"],
  runtime: {
    type: "http",
    entrypoint: "https://api.useskillhub.com/demo/email-brief"
  },
  permissions: {
    network: false,
    browser: false,
    filesystem: "none",
    secrets: []
  },
  inputSchema: {
    type: "object",
    required: ["thread"],
    properties: {
      thread: { type: "string" }
    }
  },
  outputSchema: {
    type: "object",
    required: ["summary", "nextActions"],
    properties: {
      summary: { type: "string" },
      nextActions: {
        type: "array",
        items: { type: "string" }
      }
    }
  },
  examples: [
    {
      input: {
        thread: "Customer asks whether the contract renewal blocks rollout."
      },
      output: {
        summary: "Renewal risk needs owner confirmation before rollout.",
        nextActions: ["Confirm renewal date", "Send rollout risk note"]
      }
    }
  ],
  support: {
    email: "support@useskillhub.com"
  }
};

const initialActionState: PublishSkillActionState = {
  message: "",
  status: "idle"
};

export function PublishForm({ apiUrl, labels, locale }: PublishFormProps) {
  const [state, formAction, isPending] = useActionState(publishSkillAction.bind(null, locale), initialActionState);
  const [manifestText, setManifestText] = useState(JSON.stringify(exampleManifest, null, 2));
  const preflight = useMemo(() => analyzeManifestPreflight(manifestText, labels), [labels, manifestText]);
  const canSubmit = preflight.canSaveDraft && !isPending;
  const readinessTone = preflight.blockerCount > 0 ? "danger" : preflight.warningCount > 0 ? "warning" : "success";

  return (
    <section className="publish-grid" aria-label="Publish skill">
      <form action={formAction} className="publish-main">
        <div className="publish-card publish-access-card">
          <div className="publish-card__head">
            <div>
              <div className="card-kicker">
                <KeyRound size={16} aria-hidden="true" />
                <span>{labels.access.session}</span>
              </div>
              <h2>{labels.access.title}</h2>
            </div>
            <StatusChip icon={<LockKeyhole size={14} aria-hidden="true" />} tone="neutral">
              httpOnly
            </StatusChip>
          </div>
          <p>{labels.access.body}</p>
          <div className="publish-access-grid">
            <div>
              <ClipboardCheck size={16} aria-hidden="true" />
              <span>{labels.access.session}</span>
              <strong>{labels.access.sessionDetail}</strong>
            </div>
            <div>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{labels.access.api}</span>
              <code>{apiUrl}</code>
            </div>
          </div>
        </div>

        <label className="manifest-editor">
          <span className="manifest-editor__label">
            <span>
              <FileJson size={16} aria-hidden="true" />
              {labels.manifestLabel}
            </span>
            <StatusChip tone={preflight.checks[0]?.state === "passed" ? "success" : "danger"}>
              {preflight.checks[0]?.state === "passed" ? labels.editorHintValid : labels.editorHintInvalid}
            </StatusChip>
          </span>
          <textarea
            aria-invalid={preflight.checks[0]?.state !== "passed"}
            name="manifest"
            onChange={(event) => setManifestText(event.target.value)}
            spellCheck={false}
            value={manifestText}
          />
        </label>

        <div className="publish-actions">
          <button className="primary-button primary-button--large" disabled={!canSubmit} type="submit">
            <Send size={18} aria-hidden="true" />
            <span>{isPending ? labels.action.saving : labels.action.draftButton}</span>
          </button>
          <StatusChip tone={canSubmit ? "success" : "danger"}>
            {canSubmit ? labels.action.ready : labels.action.blocked}
          </StatusChip>
        </div>

        {state.status === "success" && state.skillSlug ? (
          <ActionResult
            actions={
              <>
                <a className="secondary-button" href={localizedHref("/publisher", locale)}>
                  <Gauge size={16} aria-hidden="true" />
                  <span>{labels.result.publisher}</span>
                </a>
                <a className="ghost-button" href={localizedHref(`/skills/${state.skillSlug}`, locale)}>
                  <FileJson size={16} aria-hidden="true" />
                  <span>{labels.result.detail}</span>
                </a>
              </>
            }
            body={labels.result.successBody}
            title={labels.result.successTitle}
            tone="success"
          />
        ) : null}

        {state.status === "error" ? (
          <ActionResult body={state.message} title={labels.result.errorTitle} tone="danger" />
        ) : null}
      </form>

      <aside className="review-panel" aria-label="Manifest review">
        <div className="review-panel__head">
          <div className="review-panel__icon" aria-hidden="true">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2>{labels.reviewTitle}</h2>
            <p>{labels.reviewBody}</p>
          </div>
        </div>

        <div className={`preflight-score preflight-score--${readinessTone}`}>
          <div>
            <span>{labels.readiness.label}</span>
            <strong>{preflight.readinessLabel}</strong>
          </div>
          <b>{preflight.score}%</b>
        </div>

        <div className="preflight-counts" aria-label={labels.readiness.countsLabel}>
          <div>
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>{labels.readiness.passed}</span>
            <strong>{preflight.passedCount}</strong>
          </div>
          <div>
            <ShieldCheck size={15} aria-hidden="true" />
            <span>{labels.readiness.warnings}</span>
            <strong>{preflight.warningCount}</strong>
          </div>
          <div>
            <XCircle size={15} aria-hidden="true" />
            <span>{labels.readiness.blockers}</span>
            <strong>{preflight.blockerCount}</strong>
          </div>
        </div>

        <dl className="manifest-summary">
          <div>
            <dt>{labels.summary.package}</dt>
            <dd>{preflight.displayName}</dd>
          </div>
          <div>
            <dt>{labels.summary.slug}</dt>
            <dd>{preflight.slug}</dd>
          </div>
          <div>
            <dt>{labels.summary.runtime}</dt>
            <dd>{preflight.runtime}</dd>
          </div>
          <div>
            <dt>{labels.summary.version}</dt>
            <dd>{preflight.version}</dd>
          </div>
          <div>
            <dt>{labels.summary.tags}</dt>
            <dd>{preflight.tagCount}</dd>
          </div>
          <div>
            <dt>{labels.risk.label}</dt>
            <dd>
              <RiskBadge label={labels.risk[preflight.permissionRisk]} level={preflight.permissionRisk} />
            </dd>
          </div>
        </dl>

        <PreflightCheckList checks={preflight.checks} />

        <div className="publish-next-card">
          <div className="card-kicker">
            <Gauge size={15} aria-hidden="true" />
            <span>{labels.nextActionsTitle}</span>
          </div>
          {labels.nextActions.map(([title, detail], index) => (
            <div className="publish-next-row" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
