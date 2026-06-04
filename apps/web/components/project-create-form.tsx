"use client";

import { useActionState } from "react";
import { ArrowUpRight, CheckCircle2, FolderPlus, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/i18n";
import { createDeveloperProjectAction, type ProjectCreateActionState } from "@/lib/project-create-actions";

type ProjectCreateFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    create: "Create project",
    creating: "Creating",
    name: "Project name",
    namePlaceholder: "Research Agent",
    open: "Open project",
    slug: "Slug",
    slugPlaceholder: "research-agent",
    title: "New agent project"
  },
  zh: {
    create: "创建项目",
    creating: "创建中",
    name: "项目名称",
    namePlaceholder: "Research Agent",
    open: "打开项目",
    slug: "Slug",
    slugPlaceholder: "research-agent",
    title: "新建智能体项目"
  }
} as const;

const initialState: ProjectCreateActionState = {
  message: "",
  status: "idle"
};

export function ProjectCreateForm({ locale }: ProjectCreateFormProps) {
  const labels = copy[locale];
  const [state, action, isPending] = useActionState(createDeveloperProjectAction.bind(null, locale), initialState);

  return (
    <div className="project-create-box">
      <div className="card-kicker">
        <FolderPlus size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>
      <form action={action} className="project-create-form">
        <label>
          <span>{labels.name}</span>
          <input name="name" placeholder={labels.namePlaceholder} required />
        </label>
        <label>
          <span>{labels.slug}</span>
          <input name="slug" placeholder={labels.slugPlaceholder} />
        </label>
        <button className="primary-button" disabled={isPending} type="submit">
          <FolderPlus size={16} aria-hidden="true" />
          <span>{isPending ? labels.creating : labels.create}</span>
        </button>
      </form>

      {state.status !== "idle" ? (
        <div className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}>
          {state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
          <span>{state.message}</span>
          {state.project ? (
            <a className="ghost-button ghost-button--inline" href={localizedHref(`/dashboard/projects/${state.project.slug}`, locale)}>
              <ArrowUpRight size={15} aria-hidden="true" />
              <span>{labels.open}</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
