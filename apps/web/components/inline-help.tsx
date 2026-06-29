"use client";

import { CircleHelp } from "lucide-react";
import { Popover } from "antd";
import type { ReactNode } from "react";
import { SkillButton } from "@/components/skill-antd";
import styles from "./inline-help.module.css";

type InlineHelpProps = {
  content: ReactNode;
  label: string;
  side?: "top" | "right" | "bottom" | "left";
};

export function InlineHelp({ content, label, side = "top" }: InlineHelpProps) {
  return (
    <span className={styles.root} data-motion-ignore="inline-help">
      <Popover content={content} placement={side} trigger={["hover", "focus"]}>
        <SkillButton
          aria-label={label}
          className={styles.trigger}
          htmlType="button"
          type="text"
        >
          <CircleHelp size={16} aria-hidden="true" />
        </SkillButton>
      </Popover>
    </span>
  );
}
