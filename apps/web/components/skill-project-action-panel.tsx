"use client";

import { useActionState } from "react";
import { BookmarkPlus, CheckCircle2, Folder, PackageCheck, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { DeveloperProjectRecord } from "@/lib/ops-data";
import { submitSkillProjectAction, type SkillProjectActionState } from "@/lib/skill-project-actions";

type SkillProjectActionPanelProps = {
  dashboardHref: string;
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
    project: "Target project",
    save: "Save for evaluation",
    saving: "Working",
    subheading: "Move from discovery into a real agent workspace with policy, budget, and update tracking.",
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
    project: "目标项目",
    save: "保存用于评估",
    saving: "处理中",
    subheading: "从发现进入真实智能体项目，并接入策略、预算和更新跟踪。",
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
          <div className="skill-project-action-buttons">
            <button className="secondary-button" disabled={isPending} name="intent" type="submit" value="save">
              <BookmarkPlus size={15} aria-hidden="true" />
              <span>{isPending ? labels.saving : labels.save}</span>
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
