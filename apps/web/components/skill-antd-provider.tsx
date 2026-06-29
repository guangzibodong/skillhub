"use client";

import type { ReactNode } from "react";
import { App as AntdApp, ConfigProvider, theme, type ThemeConfig } from "antd";

const skillHubTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  cssVar: {
    key: "skillhub",
  },
  hashed: true,
  token: {
    borderRadius: 8,
    colorBgBase: "#030503",
    colorBgContainer: "rgba(17, 22, 16, 0.92)",
    colorBgElevated: "#111610",
    colorBorder: "rgba(221, 255, 220, 0.14)",
    colorBorderSecondary: "rgba(221, 255, 220, 0.09)",
    colorError: "#ff856f",
    colorInfo: "#7cc7d8",
    colorPrimary: "#7fee64",
    colorSuccess: "#7fee64",
    colorText: "#ddffdc",
    colorTextDisabled: "rgba(221, 255, 220, 0.34)",
    colorTextPlaceholder: "rgba(221, 255, 220, 0.42)",
    colorTextQuaternary: "rgba(221, 255, 220, 0.36)",
    colorTextSecondary: "rgba(221, 255, 220, 0.66)",
    colorWarning: "#d7a84c",
    controlHeight: 40,
    controlHeightLG: 46,
    controlHeightSM: 32,
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    lineWidth: 1,
    motionDurationMid: "0.18s",
    wireframe: false,
  },
  components: {
    Alert: {
      borderRadiusLG: 8,
      colorErrorBg: "rgba(255, 133, 111, 0.1)",
      colorInfoBg: "rgba(124, 199, 216, 0.09)",
      colorSuccessBg: "rgba(127, 238, 100, 0.1)",
      colorWarningBg: "rgba(215, 168, 76, 0.1)",
    },
    Button: {
      borderRadius: 8,
      contentFontSize: 14,
      defaultBg: "rgba(221, 255, 220, 0.045)",
      defaultBorderColor: "rgba(221, 255, 220, 0.14)",
      defaultColor: "rgba(221, 255, 220, 0.9)",
      defaultHoverBg: "rgba(127, 238, 100, 0.08)",
      defaultHoverBorderColor: "rgba(127, 238, 100, 0.36)",
      defaultHoverColor: "#ddffdc",
      fontWeight: 720,
      primaryColor: "#071207",
    },
    Card: {
      actionsBg: "transparent",
      borderRadiusLG: 10,
      colorBgContainer: "rgba(17, 22, 16, 0.9)",
      colorBorderSecondary: "rgba(221, 255, 220, 0.12)",
      headerBg: "transparent",
    },
    Checkbox: {
      colorPrimary: "#7fee64",
      colorPrimaryHover: "#a7ff8c",
    },
    Drawer: {
      colorBgElevated: "#0b100b",
    },
    Form: {
      itemMarginBottom: 14,
      labelColor: "rgba(221, 255, 220, 0.7)",
    },
    Input: {
      activeBorderColor: "rgba(127, 238, 100, 0.64)",
      activeShadow: "0 0 0 2px rgba(127, 238, 100, 0.12)",
      colorBgContainer: "rgba(221, 255, 220, 0.055)",
      hoverBorderColor: "rgba(127, 238, 100, 0.36)",
    },
    InputNumber: {
      activeBorderColor: "rgba(127, 238, 100, 0.64)",
      colorBgContainer: "rgba(221, 255, 220, 0.055)",
      hoverBorderColor: "rgba(127, 238, 100, 0.36)",
    },
    Modal: {
      borderRadiusLG: 10,
      contentBg: "#0b100b",
      headerBg: "#0b100b",
    },
    Pagination: {
      itemActiveBg: "rgba(127, 238, 100, 0.14)",
    },
    Popover: {
      colorBgElevated: "#0b100b",
    },
    Select: {
      activeBorderColor: "rgba(127, 238, 100, 0.64)",
      colorBgContainer: "rgba(221, 255, 220, 0.055)",
      optionActiveBg: "rgba(127, 238, 100, 0.1)",
      optionSelectedBg: "rgba(127, 238, 100, 0.14)",
      optionSelectedColor: "#ddffdc",
    },
    Table: {
      borderColor: "rgba(221, 255, 220, 0.09)",
      colorBgContainer: "rgba(17, 22, 16, 0.9)",
      headerBg: "rgba(221, 255, 220, 0.045)",
      headerColor: "rgba(221, 255, 220, 0.72)",
      rowHoverBg: "rgba(127, 238, 100, 0.035)",
    },
    Tabs: {
      itemActiveColor: "#a7ff8c",
      itemHoverColor: "#7fee64",
      itemSelectedColor: "#7fee64",
    },
    Tag: {
      borderRadiusSM: 999,
      defaultBg: "rgba(221, 255, 220, 0.055)",
      defaultColor: "rgba(221, 255, 220, 0.72)",
    },
  },
};

export function SkillAntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider componentSize="middle" theme={skillHubTheme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
