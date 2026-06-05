"use client";

import { useActionState } from "react";
import { BookmarkPlus, CheckCircle2, Folder, PackageCheck, PlayCircle, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectRecord } from "@/lib/ops-data";
import { submitSkillProjectAction, type SkillProjectActionState } from "@/lib/skill-project-actions";

type SkillProjectActionPanelProps = {
  dashboardHref: string;
  inputExample?: string;
  latestVersion?: string;
  locale: Locale;
  projects: DeveloperProjectRecord[];
  skillName: string;
  skillSlug: string;
};

const copy = {
  en: {
    badges: ["Project scoped", "Policy gate", "Audit logged"],
    collection: "Collection",
    collectionPlaceholder: "evaluation",
    emptyBody: "Create or connect a developer project before saving and installing skills.",
    emptyCta: "Open dashboard",
    heading: "Add this skill to a project",
    install: "Install to project",
    installing: "Working",
    latestVersion: "Latest registry version",
    nonBillableTest: "non-billable test",
    noOutput: "No output returned.",
    notBillable: "not billable",
    project: "Target project",
    save: "Save for evaluation",
    saving: "Working",
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
    badges: ["项目隔离", "策略网关", "审计记录"],
    collection: "集合",
    collectionPlaceholder: "evaluation",
    emptyBody: "请先创建或连接一个开发者项目，再保存和安装技能。",
    emptyCta: "打开工作台",
    heading: "把这个技能加入项目",
    install: "安装到项目",
    installing: "处理中",
    latestVersion: "当前注册表版本",
    nonBillableTest: "非计费测试",
    noOutput: "没有返回输出。",
    notBillable: "未计费",
    project: "目标项目",
    save: "保存用于评估",
    saving: "处理中",
    subheading: "从发现进入真实智能体项目，并接入策略、预算和更新跟踪。",
    test: "测试调用",
    testInput: "测试 JSON 输入",
    testInputPlaceholder: '{ "query": "总结这个线索" }',
    testOutput: "运行输出",
    testResult: "测试结果",
    testing: "测试中",
    version: "固定版本",
    versionPlaceholder: "使用最新版"
  }
} as const;

const initialState: SkillProjectActionState = {
  message: "",
  status: "idle"
};

export function SkillProjectActionPanel({
  dashboardHref,
  inputExample,
  latestVersion,
  locale,
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

      {hasProjects ? (
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
              placeholder={latestVersion ? `${latestVersion} · ${labels.versionPlaceholder}` : labels.versionPlaceholder}
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

      {latestVersion ? (
        <p className="skill-project-action-footnote">
          {labels.latestVersion}: <code>{latestVersion}</code>
        </p>
      ) : null}

      {state.status !== "idle" ? <ActionMessage state={state} /> : null}
      {state.testResult ? <TestResult labels={labels} state={state} /> : null}
    </div>
  );
}

function ActionMessage({ state }: { state: SkillProjectActionState }) {
  return (
    <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
      {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      <span>{state.message}</span>
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
