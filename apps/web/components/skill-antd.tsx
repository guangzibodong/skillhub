"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Collapse,
  Drawer,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Statistic,
  Tabs,
  Table,
  Tag,
  Tooltip,
  type AlertProps,
  type ButtonProps,
  type CardProps,
  type CheckboxProps,
  type CollapseProps,
  type DrawerProps,
  type EmptyProps,
  type InputProps,
  type ModalProps,
  type PopconfirmProps,
  type PopoverProps,
  type SelectProps,
  type StatisticProps,
  type TabsProps,
  type TableProps,
  type TagProps,
  type TooltipProps,
} from "antd";
import { clsx } from "clsx";

export type SkillTone = "danger" | "neutral" | "success" | "warning";

type SkillButtonProps = ButtonProps & {
  skillTone?: "danger" | "ghost" | "primary" | "secondary";
};

export function SkillButton({
  className,
  skillTone,
  type,
  ...props
}: SkillButtonProps) {
  const tone = skillTone ?? toneFromButtonClass(className);

  return (
    <Button
      {...props}
      className={className}
      danger={props.danger ?? tone === "danger"}
      type={type ?? (tone === "primary" ? "primary" : tone === "ghost" ? "text" : "default")}
    />
  );
}

export function SkillCard({ className, ...props }: CardProps) {
  return <Card {...props} className={clsx("skill-antd-card", className)} />;
}

export function SkillPanelCard({ className, ...props }: CardProps) {
  return <Card {...props} className={clsx("skill-antd-card skill-panel-card", className)} />;
}

export function SkillInput({ className, ...props }: InputProps) {
  return <Input {...props} className={clsx("skill-input", className)} />;
}

export function SkillTextArea({
  className,
  ...props
}: InputProps & React.ComponentProps<typeof Input.TextArea>) {
  return <Input.TextArea {...props} className={clsx("skill-input", className)} />;
}

type SkillSelectValue = string | number | readonly string[] | readonly number[];

type SkillSelectProps<ValueType = SkillSelectValue> = SelectProps<ValueType> & {
  name?: string;
  required?: boolean;
};

export function SkillSelect<ValueType = SkillSelectValue>({
  className,
  defaultValue,
  name,
  onChange,
  required: _required,
  value,
  ...props
}: SkillSelectProps<ValueType>) {
  const [innerValue, setInnerValue] = useState<ValueType | null | undefined>(defaultValue);
  const mergedValue = value ?? innerValue;

  useEffect(() => {
    if (value !== undefined) {
      setInnerValue(value);
    }
  }, [value]);

  return (
    <>
      {name ? <input name={name} type="hidden" value={serializeSelectValue(mergedValue)} /> : null}
      <Select<ValueType>
        {...props}
        className={clsx("skill-select", className)}
        defaultValue={defaultValue}
        onChange={(nextValue, option) => {
          setInnerValue(nextValue);
          onChange?.(nextValue, option);
        }}
        value={value}
      />
    </>
  );
}

export function SkillCheckbox({ className, ...props }: CheckboxProps) {
  return <Checkbox {...props} className={clsx("skill-checkbox", className)} />;
}

type SkillCheckboxFieldProps = Omit<CheckboxProps, "onChange"> & {
  defaultChecked?: boolean;
  label?: ReactNode;
  name: string;
  onChange?: CheckboxProps["onChange"];
  value?: string;
};

export function SkillCheckboxField({
  checked,
  children,
  defaultChecked,
  label,
  name,
  onChange,
  value = "on",
  ...props
}: SkillCheckboxFieldProps) {
  const [innerChecked, setInnerChecked] = useState(Boolean(defaultChecked));
  const resolvedChecked = checked ?? innerChecked;

  useEffect(() => {
    if (checked !== undefined) {
      setInnerChecked(Boolean(checked));
    }
  }, [checked]);

  return (
    <>
      {resolvedChecked ? <input name={name} type="hidden" value={value} /> : null}
      <Checkbox
        {...props}
        checked={resolvedChecked}
        onChange={(event) => {
          setInnerChecked(event.target.checked);
          onChange?.(event);
        }}
      >
        {children ?? label}
      </Checkbox>
    </>
  );
}

type SkillStatusTagProps = TagProps & {
  children: ReactNode;
  tone?: SkillTone;
};

export function SkillStatusTag({
  children,
  className,
  color,
  tone,
  ...props
}: SkillStatusTagProps) {
  const resolvedTone = tone ?? toneFromStatusClass(className);

  return (
    <Tag
      {...props}
      className={className}
      color={color ?? colorFromTone(resolvedTone)}
    >
      {children}
    </Tag>
  );
}

export function SkillTable<RecordType extends object = object>(
  props: TableProps<RecordType>,
) {
  return <Table<RecordType> {...props} className={clsx("skill-antd-table", props.className)} />;
}

export function SkillConfirm(props: PopconfirmProps) {
  return <Popconfirm okButtonProps={{ danger: props.okButtonProps?.danger, ...props.okButtonProps }} {...props} />;
}

export function SkillModal(props: ModalProps) {
  return <Modal {...props} />;
}

export function useSkillModal() {
  return App.useApp().modal;
}

export function SkillDrawer(props: DrawerProps) {
  return <Drawer {...props} />;
}

export function SkillPopover(props: PopoverProps) {
  return <Popover {...props} />;
}

export function SkillTooltip(props: TooltipProps) {
  return <Tooltip {...props} />;
}

export function SkillTabs({ className, ...props }: TabsProps) {
  return <Tabs {...props} className={clsx("skill-tabs", className)} />;
}

export function SkillCollapse({ className, ...props }: CollapseProps) {
  return <Collapse {...props} className={clsx("skill-collapse", className)} />;
}

export function SkillStatistic({ className, ...props }: StatisticProps) {
  return <Statistic {...props} className={clsx("skill-statistic", className)} />;
}

export function SkillEmpty(props: EmptyProps) {
  return <Empty {...props} />;
}

export function SkillAlert(props: AlertProps) {
  return <Alert showIcon {...props} />;
}

function toneFromButtonClass(className: string | undefined): SkillButtonProps["skillTone"] {
  if (!className) {
    return "secondary";
  }

  if (className.includes("primary-button") || className.includes("auth-primary-button")) {
    return "primary";
  }

  if (className.includes("ghost-button")) {
    return className.includes("danger") ? "danger" : "ghost";
  }

  if (className.includes("danger")) {
    return "danger";
  }

  return "secondary";
}

function toneFromStatusClass(className: string | undefined): SkillTone {
  if (!className) {
    return "success";
  }

  if (className.includes("danger")) {
    return "danger";
  }

  if (className.includes("warning")) {
    return "warning";
  }

  if (className.includes("neutral")) {
    return "neutral";
  }

  return "success";
}

function colorFromTone(tone: SkillTone) {
  if (tone === "danger") {
    return "error";
  }

  if (tone === "warning") {
    return "warning";
  }

  if (tone === "neutral") {
    return "default";
  }

  return "success";
}

function serializeSelectValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(",");
  }

  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}
