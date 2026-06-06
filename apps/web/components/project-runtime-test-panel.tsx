"use client";

import { useActionState } from "react";
import { CheckCircle2, FlaskConical, PlayCircle, RadioTower, ShieldCheck, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectSkillRecord } from "@/lib/ops-data";
import { submitProjectRuntimeTestAction, type ProjectRuntimeTestState } from "@/lib/project-runtime-test-actions";

type ProjectRuntimeTestPanelProps = {
  locale: Locale;
  projectSlug: string;
  skills: DeveloperProjectSkillRecord[];
};

const copy = {
  en: {
    badges: ["Project scoped", "Policy checked", "Non-billable"],
    blockedBadge: "Gate blocked",
    empty: "Install a marketplace skill before running a governed project test.",
    heading: "Runtime test",
    input: "JSON input",
    inputPlaceholder: '{ "query": "agent runtime check" }',
    noOutput: "No output returned.",
    nonBillable: "non-billable console test",
    output: "Gateway output",
    result: "Test result",
    run: "Run test",
    running: "Testing",
    skill: "Installed skill",
    subheading: "Run an installed skill through the same project policy, subscription, budget, and invocation-log path your agent will use.",
    successBadge: "Test passed",
    version: "Version override",
    versionPlaceholder: "Use installed pin"
  },
  zh: {
    badges: ["\u9879\u76ee\u9694\u79bb", "\u7b56\u7565\u6821\u9a8c", "\u975e\u8ba1\u8d39"],
    blockedBadge: "\u7f51\u5173\u62e6\u622a",
    empty: "\u8bf7\u5148\u5b89\u88c5\u4e00\u4e2a\u5e02\u573a\u6280\u80fd\uff0c\u518d\u8fd0\u884c\u9879\u76ee\u6cbb\u7406\u6d4b\u8bd5\u3002",
    heading: "\u8fd0\u884c\u6d4b\u8bd5",
    input: "JSON \u8f93\u5165",
    inputPlaceholder: '{ "query": "\u667a\u80fd\u4f53\u8fd0\u884c\u68c0\u67e5" }',
    noOutput: "\u6ca1\u6709\u8fd4\u56de\u8f93\u51fa\u3002",
    nonBillable: "\u975e\u8ba1\u8d39\u63a7\u5236\u53f0\u6d4b\u8bd5",
    output: "\u7f51\u5173\u8f93\u51fa",
    result: "\u6d4b\u8bd5\u7ed3\u679c",
    run: "\u8fd0\u884c\u6d4b\u8bd5",
    running: "\u6d4b\u8bd5\u4e2d",
    skill: "\u5df2\u5b89\u88c5\u6280\u80fd",
    subheading: "\u628a\u5df2\u5b89\u88c5\u6280\u80fd\u8d70\u4e00\u904d\u4e0e\u667a\u80fd\u4f53\u76f8\u540c\u7684\u9879\u76ee\u7b56\u7565\u3001\u8ba2\u9605\u3001\u9884\u7b97\u548c\u8c03\u7528\u65e5\u5fd7\u8def\u5f84\u3002",
    successBadge: "\u6d4b\u8bd5\u901a\u8fc7",
    version: "\u7248\u672c\u8986\u76d6",
    versionPlaceholder: "\u4f7f\u7528\u5df2\u5b89\u88c5\u56fa\u5b9a\u7248"
  }
} as const;

const initialState: ProjectRuntimeTestState = {
  message: "",
  status: "idle"
};

export function ProjectRuntimeTestPanel({ locale, projectSlug, skills }: ProjectRuntimeTestPanelProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(
    submitProjectRuntimeTestAction.bind(null, projectSlug, locale),
    initialState
  );
  const hasSkills = skills.length > 0;
  const defaultInput = defaultTestInput(skills[0]?.skillSlug);

  return (
    <article className="ops-panel project-runtime-test-panel">
      <div className="project-runtime-test-panel__head">
        <div className="card-kicker">
          <FlaskConical size={16} aria-hidden="true" />
          <span>{labels.heading}</span>
        </div>
        <div className="project-runtime-test-panel__badges">
          {labels.badges.map((badge) => (
            <span className="status-chip status-chip--neutral" key={badge}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <p className="project-runtime-test-panel__copy">{labels.subheading}</p>

      {hasSkills ? (
        <form action={action} className="project-runtime-test-form">
          <label>
            <span>{labels.skill}</span>
            <select name="skillSlug" required>
              {skills.map((skill) => (
                <option key={skill.skillSlug} value={skill.skillSlug}>
                  {skill.displayName} / {skill.skillSlug} / {skill.version ?? "latest"} / {skill.status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{labels.version}</span>
            <input name="version" placeholder={labels.versionPlaceholder} />
          </label>
          <label className="project-runtime-test-form__wide">
            <span>{labels.input}</span>
            <textarea defaultValue={defaultInput} name="testInput" placeholder={labels.inputPlaceholder} rows={7} />
          </label>
          <button className="primary-button" disabled={isPending} type="submit">
            <PlayCircle size={16} aria-hidden="true" />
            <span>{isPending ? labels.running : labels.run}</span>
          </button>
        </form>
      ) : (
        <div className="project-runtime-test-empty">
          <RadioTower size={17} aria-hidden="true" />
          <span>{labels.empty}</span>
        </div>
      )}

      {state.status !== "idle" ? <ActionMessage labels={labels} state={state} /> : null}
      {state.testResult ? <RuntimeTestResult labels={labels} state={state} /> : null}
    </article>
  );
}

function ActionMessage({ labels, state }: { labels: (typeof copy)[Locale]; state: ProjectRuntimeTestState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
      <b className={state.status === "success" ? "status-chip" : "status-chip status-chip--danger"}>
        {state.status === "success" ? labels.successBadge : labels.blockedBadge}
      </b>
    </div>
  );
}

function RuntimeTestResult({ labels, state }: { labels: (typeof copy)[Locale]; state: ProjectRuntimeTestState }) {
  const result = state.testResult;

  if (!result) {
    return null;
  }

  const output = result.output ?? result.error ?? labels.noOutput;

  return (
    <div className={state.status === "success" ? "skill-test-result" : "skill-test-result skill-test-result--blocked"}>
      <div className="skill-test-result__head">
        <strong>{labels.result}</strong>
        <span>{result.invocationId ?? result.code ?? state.skillSlug ?? "pending"}</span>
      </div>
      <div className="skill-test-result__meta">
        <span>{result.runtimeStatus ?? result.code ?? state.status}</span>
        <span>{result.version ?? state.skillSlug ?? "version"}</span>
        <span>{typeof result.latencyMs === "number" ? `${result.latencyMs}ms` : "n/a"}</span>
        <span>
          {result.billable
            ? `${result.amountCents ?? 0} ${result.currency ?? "usd"}`
            : labels.nonBillable}
        </span>
        <span>
          <ShieldCheck size={13} aria-hidden="true" />
          {result.mode ?? "console_test"}
        </span>
      </div>
      <div className="code-panel skill-test-result__output">
        <div className="code-panel__bar">
          <span>{labels.output}</span>
          <span>JSON</span>
        </div>
        <pre>
          <code>{formatOutput(output)}</code>
        </pre>
      </div>
    </div>
  );
}

function defaultTestInput(skillSlug: string | undefined) {
  if (skillSlug?.includes("dataset")) {
    return JSON.stringify(
      {
        rows: [
          { status: "open", value: 42 },
          { status: "closed", value: 18 }
        ],
        task: "summarize"
      },
      null,
      2
    );
  }

  return JSON.stringify(
    {
      query: "agent runtime check"
    },
    null,
    2
  );
}

function formatOutput(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}
