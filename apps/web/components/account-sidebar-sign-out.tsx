"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { App as AntdApp, Modal } from "antd";
import { LogOut } from "lucide-react";
import { SkillButton } from "@/components/skill-antd";
import { signOutClientAction } from "@/lib/auth-actions";
import type { Locale } from "@/lib/locale-routing";
import styles from "./account-sidebar-sign-out.module.css";

type AccountSidebarSignOutProps = {
  locale: Locale;
};

const copy = {
  en: {
    cancel: "Cancel",
    close: "Close sign out confirmation",
    confirm: "Sign out",
    description:
      "This clears the current browser session. You will need to sign in again before opening private workspaces.",
    error: "Sign out failed. Please try again.",
    open: "Sign out",
    title: "Sign out of SkillHub?",
  },
  zh: {
    cancel: "取消",
    close: "关闭退出确认",
    confirm: "退出登录",
    description:
      "这会清除当前浏览器会话。再次进入私有工作区前，需要重新登录。",
    error: "退出登录失败，请重试。",
    open: "退出登录",
    title: "确认退出 SkillHub？",
  },
} as const;

export function AccountSidebarSignOut({ locale }: AccountSidebarSignOutProps) {
  const labels = copy[locale];
  const { message } = AntdApp.useApp();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    if (!isPending) {
      setIsOpen(false);
    }
  }

  function handleConfirm() {
    startTransition(async () => {
      try {
        const result = await signOutClientAction(locale);
        setIsOpen(false);
        router.replace(result.redirectTo as Parameters<typeof router.replace>[0]);
        router.refresh();
      } catch {
        message.error(labels.error);
      }
    });
  }

  return (
    <div className="workspace-admin-signout">
      <SkillButton
        className="workspace-admin-signout__button"
        onClick={() => setIsOpen(true)}
        htmlType="button"
      >
        <LogOut size={16} aria-hidden="true" />
        <span>{labels.open}</span>
      </SkillButton>
      <Modal
        centered
        closable={!isPending}
        footer={
          <div className={styles.actions}>
            <SkillButton className="secondary-button" disabled={isPending} onClick={closeModal} htmlType="button">
              {labels.cancel}
            </SkillButton>
            <SkillButton
              className={`primary-button ${styles.confirm}`}
              htmlType="button"
              loading={isPending}
              onClick={handleConfirm}
            >
              <LogOut size={15} aria-hidden="true" />
              <span>{labels.confirm}</span>
            </SkillButton>
          </div>
        }
        keyboard={!isPending}
        maskClosable={!isPending}
        onCancel={closeModal}
        open={isOpen}
        title={
          <span className={styles.copy}>
            <LogOut size={18} aria-hidden="true" />
            {labels.title}
          </span>
        }
      >
        <p>{labels.description}</p>
      </Modal>
    </div>
  );
}
