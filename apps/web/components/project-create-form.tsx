"use client";

import { useActionState } from "react";
import { Input } from "antd";
import { ArrowUpRight, FolderPlus } from "lucide-react";
import { SkillAlert, SkillButton } from "@/components/skill-antd";
import { localizedHref, type Locale } from "@/lib/locale-routing";
import { createDeveloperProjectAction, type ProjectCreateActionState } from "@/lib/project-create-actions";

type ProjectCreateFormProps = {
  locale: Locale;
};

const copy = {
  en: {
    create: "Create project",
    creating: "Creating",
    name: "Project name",
    namePlaceholder: "Agent project",
    open: "Open project",
    slug: "Slug",
    slugPlaceholder: "agent-project",
    title: "New agent project"
  },
  zh: {
    create: "创建项目",
    creating: "创建中",
    name: "项目名称",
    namePlaceholder: "Agent project",
    open: "打开项目",
    slug: "Slug",
    slugPlaceholder: "agent-project",
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
          <Input name="name" placeholder={labels.namePlaceholder} required />
        </label>
        <label>
          <span>{labels.slug}</span>
          <Input name="slug" placeholder={labels.slugPlaceholder} />
        </label>
        <SkillButton className="primary-button" disabled={isPending} htmlType="submit">
          <FolderPlus size={16} aria-hidden="true" />
          <span>{isPending ? labels.creating : labels.create}</span>
        </SkillButton>
      </form>

      {state.status !== "idle" ? (
        <div className="project-create-result">
          <SkillAlert
            className={state.status === "success" ? "action-message action-message--success" : "action-message action-message--error"}
            description={state.message}
            type={state.status === "success" ? "success" : "error"}
          />
          {state.project ? (
            <SkillButton className="ghost-button ghost-button--inline" href={localizedHref(`/dashboard/projects/${state.project.slug}`, locale)} type="text">
              <ArrowUpRight size={15} aria-hidden="true" />
              <span>{labels.open}</span>
            </SkillButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
