"use client";

import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { SkillButton, SkillInput, SkillTextArea } from "@/components/skill-antd";

type ProjectSensitiveActionFormProps = {
  action: (payload: FormData) => void;
  cancelLabel: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  description: string;
  disabled: boolean;
  hiddenFields: Record<string, string>;
  icon: LucideIcon;
  label: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  submitLabel: string;
  tone?: "danger" | "warning";
};

export function ProjectSensitiveActionForm({
  action,
  cancelLabel,
  confirmLabel,
  confirmPlaceholder,
  description,
  disabled,
  hiddenFields,
  icon: Icon,
  label,
  reasonLabel,
  reasonPlaceholder,
  submitLabel,
  tone = "danger"
}: ProjectSensitiveActionFormProps) {
  const [isArmed, setIsArmed] = useState(false);
  const buttonClass =
    tone === "danger"
      ? "secondary-button secondary-button--compact secondary-button--danger"
      : "secondary-button secondary-button--compact secondary-button--warning";

  if (!isArmed) {
    return (
      <SkillButton className={buttonClass} disabled={disabled} onClick={() => setIsArmed(true)} htmlType="button">
        <Icon size={15} aria-hidden="true" />
        <span>{label}</span>
      </SkillButton>
    );
  }

  return (
    <form action={action} className={`project-sensitive-action project-sensitive-action--${tone}`}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} name={name} type="hidden" value={value} />
      ))}
      <p>{description}</p>
      <label>
        <span>{confirmLabel}</span>
        <SkillInput autoComplete="off" name="confirmation" placeholder={confirmPlaceholder} required />
      </label>
      <label>
        <span>{reasonLabel}</span>
        <SkillTextArea name="reason" placeholder={reasonPlaceholder} required rows={2} />
      </label>
      <div className="project-sensitive-action__buttons">
        <SkillButton className="ghost-button ghost-button--compact" onClick={() => setIsArmed(false)} htmlType="button">
          <span>{cancelLabel}</span>
        </SkillButton>
        <SkillButton className={buttonClass} disabled={disabled} htmlType="submit">
          <Icon size={15} aria-hidden="true" />
          <span>{submitLabel}</span>
        </SkillButton>
      </div>
    </form>
  );
}
