"use client";

import { useActionState } from "react";
import {
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  CreditCard,
  Folder,
  KeyRound,
  PackageCheck,
  PlayCircle,
  Route,
  ShieldCheck,
  XCircle
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectRecord } from "@/lib/ops-data";
import { submitSkillProjectAction, type SkillProjectActionState } from "@/lib/skill-project-actions";

type SkillProjectActionPanelProps = {
  billingModel: "free" | "per_call" | "subscription";
  canOperate: boolean;
  dashboardHref: string;
  inputExample?: string;
  latestVersion?: string;
  locale: Locale;
  lockedBody: string;
  lockedCtaHref: string;
  lockedCtaLabel: string;
  lockedTitle: string;
  projects: DeveloperProjectRecord[];
  skillName: string;
  skillSlug: string;
};

const copy = {
  en: {
    badges: ["Project scoped", "Policy gate", "Audit logged"],
    collection: "Collection",
    collectionPlaceholder: "evaluation",
    emptyBody: "Create or connect a developer project before saving, subscribing, or installing skills.",
    emptyCta: "Create project",
    heading: "Add this skill to a project",
    handoffAction: "Open developer workspace",
    handoffBody:
      "A saved or installed skill becomes project state. Finish policy approval, version pinning, runtime key setup, test invocation, updates, and billing from the project command center.",
    handoffSteps: ["Policy", "Version pin", "Runtime key", "Test call", "Updates and billing"],
    handoffTitle: "Next: finish the project handoff",
    install: "Install to project",
    installing: "Working",
    latestVersion: "Latest registry version",
    nonBillableTest: "non-billable test",
    noOutput: "No output returned.",
    notBillable: "not billable",
    openProject: "Open project",
    project: "Target project",
    save: "Save for evaluation",
    saving: "Working",
    subscribe: "Start subscription trial",
    subscribing: "Working",
    subheading: "Move from discovery into a real agent workspace with policy, budget, and update tracking.",
    test: "Test invocation",
    testInput: "Test JSON input",
    testInputPlaceholder: '{ "query": "Summarize this lead" }',
    testOutput: "Runtime output",
    testResult: "Test result",
    testing: "Testing",
    version: "Version pin",
    versionPlaceholder: "Use latest"
  },
  zh: {
    badges: ["\u9879\u76ee\u9694\u79bb", "\u7b56\u7565\u7f51\u5173", "\u5ba1\u8ba1\u8bb0\u5f55"],
    collection: "\u96c6\u5408",
    collectionPlaceholder: "evaluation",
    emptyBody: "\u8bf7\u5148\u521b\u5efa\u6216\u8fde\u63a5\u4e00\u4e2a\u5f00\u53d1\u8005\u9879\u76ee\uff0c\u518d\u4fdd\u5b58\u3001\u8ba2\u9605\u6216\u5b89\u88c5\u6280\u80fd\u3002",
    emptyCta: "\u521b\u5efa\u9879\u76ee",
    heading: "\u628a\u8fd9\u4e2a\u6280\u80fd\u52a0\u5165\u9879\u76ee",
    handoffAction: "\u6253\u5f00\u5f00\u53d1\u8005\u5de5\u4f5c\u53f0",
    handoffBody:
      "\u4fdd\u5b58\u6216\u5b89\u88c5\u540e\uff0c\u6280\u80fd\u4f1a\u53d8\u6210\u9879\u76ee\u72b6\u6001\u3002\u8bf7\u5230\u9879\u76ee\u547d\u4ee4\u4e2d\u5fc3\u5b8c\u6210\u7b56\u7565\u5ba1\u6279\u3001\u7248\u672c\u56fa\u5b9a\u3001\u8fd0\u884c Key\u3001\u6d4b\u8bd5\u8c03\u7528\u3001\u66f4\u65b0\u548c\u8d26\u5355\u68c0\u67e5\u3002",
    handoffSteps: ["\u7b56\u7565", "\u7248\u672c\u56fa\u5b9a", "\u8fd0\u884c Key", "\u6d4b\u8bd5\u8c03\u7528", "\u66f4\u65b0\u548c\u8d26\u5355"],
    handoffTitle: "\u4e0b\u4e00\u6b65\uff1a\u5b8c\u6210\u9879\u76ee\u4ea4\u63a5",
    install: "\u5b89\u88c5\u5230\u9879\u76ee",
    installing: "\u5904\u7406\u4e2d",
    latestVersion: "\u5f53\u524d\u6ce8\u518c\u8868\u7248\u672c",
    nonBillableTest: "\u975e\u8ba1\u8d39\u6d4b\u8bd5",
    noOutput: "\u6ca1\u6709\u8fd4\u56de\u8f93\u51fa\u3002",
    notBillable: "\u672a\u8ba1\u8d39",
    openProject: "\u6253\u5f00\u9879\u76ee",
    project: "\u76ee\u6807\u9879\u76ee",
    save: "\u4fdd\u5b58\u7528\u4e8e\u8bc4\u4f30",
    saving: "\u5904\u7406\u4e2d",
    subscribe: "\u5f00\u59cb\u8ba2\u9605\u8bd5\u7528",
    subscribing: "\u5904\u7406\u4e2d",
    subheading: "\u4ece\u53d1\u73b0\u8fdb\u5165\u771f\u5b9e\u667a\u80fd\u4f53\u9879\u76ee\uff0c\u5e76\u63a5\u5165\u7b56\u7565\u3001\u9884\u7b97\u548c\u66f4\u65b0\u8ddf\u8e2a\u3002",
    test: "\u6d4b\u8bd5\u8c03\u7528",
    testInput: "\u6d4b\u8bd5 JSON \u8f93\u5165",
    testInputPlaceholder: '{ "query": "\u603b\u7ed3\u8fd9\u4e2a\u7ebf\u7d22" }',
    testOutput: "\u8fd0\u884c\u8f93\u51fa",
    testResult: "\u6d4b\u8bd5\u7ed3\u679c",
    testing: "\u6d4b\u8bd5\u4e2d",
    version: "\u56fa\u5b9a\u7248\u672c",
    versionPlaceholder: "\u4f7f\u7528\u6700\u65b0\u7248"
  }
} as const;

const initialState: SkillProjectActionState = {
  message: "",
  status: "idle"
};

export function SkillProjectActionPanel({
  billingModel,
  canOperate,
  dashboardHref,
  inputExample,
  latestVersion,
  locale,
  lockedBody,
  lockedCtaHref,
  lockedCtaLabel,
  lockedTitle,
  projects,
  skillName,
  skillSlug
}: SkillProjectActionPanelProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    submitSkillProjectAction.bind(null, locale, skillSlug),
    initialState
  );
  const hasProjects = projects.length > 0;
  const isSubscriptionSkill = billingModel === "subscription";
  const handoffHref = state.projectSlug ? projectHref(state.projectSlug, locale) : dashboardHref;

  return (
    <div className="skill-project-action-panel">
      <div className="skill-project-action-panel__head">
        <div className="skill-project-action-panel__title">
          <strong>{labels.heading}</strong>
          <span>{labels.subheading}</span>
        </div>
        <div className="skill-project-action-panel__badges" aria-label={skillName}>
          {labels.badges.map((badge) => (
            <span className="status-chip status-chip--neutral" key={badge}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {!canOperate ? (
        <div className="skill-action-locked">
          <ShieldCheck size={18} aria-hidden="true" />
          <strong>{lockedTitle}</strong>
          <p>{lockedBody}</p>
          <a className="ghost-button ghost-button--inline" href={lockedCtaHref}>
            <span>{lockedCtaLabel}</span>
            <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      ) : hasProjects ? (
        <form action={action} className="skill-project-action-form">
          <label>
            <span>{labels.project}</span>
            <select name="projectSlug" required>
              {projects.map((project) => (
                <option key={project.id} value={project.slug}>
                  {project.name} / {project.slug}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{labels.collection}</span>
            <input defaultValue={labels.collectionPlaceholder} name="collectionName" placeholder={labels.collectionPlaceholder} />
          </label>
          <label>
            <span>{labels.version}</span>
            <input
              aria-label={`${labels.version}: ${skillName}`}
              name="version"
              placeholder={latestVersion ? `${latestVersion} / ${labels.versionPlaceholder}` : labels.versionPlaceholder}
            />
          </label>
          <label className="skill-project-action-form__wide">
            <span>{labels.testInput}</span>
            <textarea
              name="testInput"
              placeholder={labels.testInputPlaceholder}
              rows={5}
              defaultValue={inputExample ? normalizeJsonExample(inputExample) : ""}
            />
          </label>
          <div className="skill-project-action-buttons">
            <button className="secondary-button" disabled={isPending} name="intent" type="submit" value="save">
              <BookmarkPlus size={15} aria-hidden="true" />
              <span>{isPending ? labels.saving : labels.save}</span>
            </button>
            <button className="secondary-button" disabled={isPending} name="intent" type="submit" value="test">
              <PlayCircle size={15} aria-hidden="true" />
              <span>{isPending ? labels.testing : labels.test}</span>
            </button>
            {isSubscriptionSkill ? (
              <button className="secondary-button" disabled={isPending} name="intent" type="submit" value="subscribe">
                <CreditCard size={15} aria-hidden="true" />
                <span>{isPending ? labels.subscribing : labels.subscribe}</span>
              </button>
            ) : null}
            <button className="primary-button" disabled={isPending} name="intent" type="submit" value="install">
              <PackageCheck size={15} aria-hidden="true" />
              <span>{isPending ? labels.installing : labels.install}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="skill-project-empty">
          <Folder size={18} aria-hidden="true" />
          <span>{labels.emptyBody}</span>
          <a className="ghost-button ghost-button--inline" href={dashboardHref}>
            {labels.emptyCta}
          </a>
        </div>
      )}

      <div className="skill-project-handoff">
        <div className="skill-project-handoff__copy">
          <div className="skill-project-handoff__title">
            <Route size={16} aria-hidden="true" />
            <strong>{labels.handoffTitle}</strong>
          </div>
          <p>{labels.handoffBody}</p>
          <div className="skill-project-handoff__steps" aria-label={labels.handoffTitle}>
            {labels.handoffSteps.map((step, index) => (
              <span key={step}>
                {index === 0 ? <ShieldCheck size={13} aria-hidden="true" /> : index === 2 ? <KeyRound size={13} aria-hidden="true" /> : null}
                {step}
              </span>
            ))}
          </div>
        </div>
        <a className="ghost-button ghost-button--inline" href={handoffHref}>
          <span>{state.projectSlug ? labels.openProject : labels.handoffAction}</span>
          <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>

      {latestVersion ? (
        <p className="skill-project-action-footnote">
          {labels.latestVersion}: <code>{latestVersion}</code>
        </p>
      ) : null}

      {state.status !== "idle" ? <ActionMessage labels={labels} locale={locale} state={state} /> : null}
      {state.testResult ? <TestResult labels={labels} state={state} /> : null}
    </div>
  );
}

function ActionMessage({
  labels,
  locale,
  state
}: {
  labels: (typeof copy)[Locale];
  locale: Locale;
  state: SkillProjectActionState;
}) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
      {state.status === "success" && state.projectSlug ? (
        <a className="ghost-button ghost-button--inline" href={projectHref(state.projectSlug, locale)}>
          {labels.openProject}
        </a>
      ) : null}
    </div>
  );
}

function TestResult({ labels, state }: { labels: (typeof copy)[Locale]; state: SkillProjectActionState }) {
  const result = state.testResult;

  if (!result) {
    return null;
  }

  const output = result.output ?? result.error ?? labels.noOutput;

  return (
    <div className={state.status === "success" ? "skill-test-result" : "skill-test-result skill-test-result--blocked"}>
      <div className="skill-test-result__head">
        <strong>{labels.testResult}</strong>
        <span>{result.invocationId ?? result.code ?? "pending"}</span>
      </div>
      <div className="skill-test-result__meta">
        <span>{result.runtimeStatus ?? result.code ?? state.status}</span>
        <span>{typeof result.latencyMs === "number" ? `${result.latencyMs}ms` : "n/a"}</span>
        <span>
          {result.billable
            ? `${result.amountCents ?? 0} ${result.currency ?? "usd"}`
            : state.status === "success"
              ? labels.nonBillableTest
              : labels.notBillable}
        </span>
      </div>
      <div className="code-panel skill-test-result__output">
        <div className="code-panel__bar">
          <span>{labels.testOutput}</span>
          <span>JSON</span>
        </div>
        <pre>
          <code>{formatOutput(output)}</code>
        </pre>
      </div>
    </div>
  );
}

function normalizeJsonExample(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function formatOutput(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

function projectHref(projectSlug: string, locale: Locale) {
  const href = `/dashboard/projects/${encodeURIComponent(projectSlug)}`;
  return locale === "zh" ? `${href}?lang=zh` : href;
}
