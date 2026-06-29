"use client";

import { useActionState } from "react";
import { CheckCircle2, KeyRound, Save, Trash2, UserPlus, UsersRound, XCircle } from "lucide-react";
import { SkillAlert, SkillButton, SkillInput, SkillSelect, SkillStatusTag } from "@/components/skill-antd";
import type { Locale } from "@/lib/i18n";
import { ProjectSensitiveActionForm } from "@/components/project-sensitive-action-form";
import {
  createOrganizationTeamMemberTokenAction,
  removeOrganizationTeamMemberAction,
  saveOrganizationTeamMemberAction,
  type OrganizationTeamActionState
} from "@/lib/organization-team-actions";
import type { OrganizationRole, OrganizationTeamMember } from "@/lib/ops-data";

type OrganizationTeamManagerProps = {
  locale: Locale;
  members: OrganizationTeamMember[];
};

const copy = {
  en: {
    activeTokens: "Active tokens",
    addMember: "Add member",
    displayName: "Display name",
    email: "Email",
    empty: "No organization members found.",
    lastUsed: "Last token use",
    memberSince: "Member since",
    platform: "Platform",
    remove: "Remove",
    role: "Role",
    save: "Save role",
    saving: "Saving",
    tokenName: "Token name",
    tokenPlaceholder: "Console access",
    token: "Create token",
    title: "Team access",
    roles: {
      admin: "Admin",
      developer: "Developer",
      finance: "Finance",
      owner: "Owner",
      publisher: "Publisher",
      reviewer: "Reviewer"
    }
  },
  zh: {
    activeTokens: "可用 token",
    addMember: "添加成员",
    displayName: "显示名称",
    email: "邮箱",
    empty: "还没有组织成员。",
    lastUsed: "最近使用",
    memberSince: "加入时间",
    platform: "平台",
    remove: "移除",
    role: "角色",
    save: "保存角色",
    saving: "保存中",
    tokenName: "Token 名称",
    tokenPlaceholder: "控制台访问",
    token: "生成 token",
    title: "团队权限",
    roles: {
      admin: "管理员",
      developer: "开发者",
      finance: "财务",
      owner: "所有者",
      publisher: "发布者",
      reviewer: "审核员"
    }
  }
} as const;

const roles: OrganizationRole[] = ["owner", "admin", "developer", "publisher", "reviewer", "finance"];

const sensitiveCopy = {
  en: {
    cancel: "Cancel",
    confirm: "Confirmation",
    reason: "Reason",
    removeConfirmPlaceholder: "Type REMOVE",
    removeDescription:
      "Removing a member blocks their organization workspace access. Existing audit rows remain, and active sessions or tokens should be reviewed after removal.",
    removeReasonPlaceholder: "Member left, access cleanup, or role moved to another account",
    removeSubmit: "Remove member"
  },
  zh: {
    cancel: "\u53d6\u6d88",
    confirm: "\u786e\u8ba4\u77ed\u8bed",
    reason: "\u539f\u56e0",
    removeConfirmPlaceholder: "\u8f93\u5165 REMOVE",
    removeDescription:
      "\u79fb\u9664\u6210\u5458\u4f1a\u963b\u65ad\u5176\u7ec4\u7ec7\u5de5\u4f5c\u533a\u8bbf\u95ee\u3002\u5ba1\u8ba1\u8bb0\u5f55\u4f1a\u4fdd\u7559\uff0c\u79fb\u9664\u540e\u5e94\u68c0\u67e5\u6d3b\u8dc3\u4f1a\u8bdd\u548c token\u3002",
    removeReasonPlaceholder: "\u6210\u5458\u79bb\u804c\u3001\u6e05\u7406\u8bbf\u95ee\u6743\uff0c\u6216\u89d2\u8272\u5df2\u8f6c\u79fb\u5230\u5176\u4ed6\u8d26\u53f7",
    removeSubmit: "\u79fb\u9664\u6210\u5458"
  }
} as const;

const initialState: OrganizationTeamActionState = {
  message: "",
  status: "idle"
};

export function OrganizationTeamManager({ locale, members }: OrganizationTeamManagerProps) {
  const labels = copy[locale];
  const sensitiveLabels = sensitiveCopy[locale];
  const [addState, addAction, isAdding] = useActionState(saveOrganizationTeamMemberAction.bind(null, locale), initialState);
  const [saveState, saveAction, isSaving] = useActionState(saveOrganizationTeamMemberAction.bind(null, locale), initialState);
  const [tokenState, tokenAction, isCreatingToken] = useActionState(createOrganizationTeamMemberTokenAction.bind(null, locale), initialState);
  const [removeState, removeAction, isRemoving] = useActionState(removeOrganizationTeamMemberAction.bind(null, locale), initialState);

  return (
    <article className="ops-panel organization-team-panel">
      <div className="card-kicker">
        <UsersRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <form action={addAction} className="organization-team-form">
        <label>
          <span>{labels.email}</span>
          <SkillInput name="email" placeholder="operator@company.com" type="email" />
        </label>
        <label>
          <span>{labels.displayName}</span>
          <SkillInput name="displayName" placeholder="Agent Operator" />
        </label>
        <label>
          <span>{labels.role}</span>
          <SkillSelect defaultValue="developer" name="role" options={roleOptions(labels)} />
        </label>
        <SkillButton className="secondary-button secondary-button--compact" disabled={isAdding} htmlType="submit">
          <UserPlus size={15} aria-hidden="true" />
          <span>{isAdding ? labels.saving : labels.addMember}</span>
        </SkillButton>
      </form>

      {addState.status !== "idle" ? <ActionMessage state={addState} /> : null}

      <div className="organization-team-list">
        {members.length > 0 ? (
          members.map((member) => {
            const memberSaveState = saveState.userId === member.userId ? saveState : null;
            const memberTokenState = tokenState.userId === member.userId ? tokenState : null;
            const memberRemoveState = removeState.userId === member.userId ? removeState : null;

            return (
              <section className="organization-team-card" key={member.userId}>
                <header className="organization-team-card__head">
                  <div>
                    <strong>{member.displayName ?? member.email}</strong>
                    <span>{member.email}</span>
                  </div>
                  <SkillStatusTag className={roleClass(member.role)}>{labels.roles[member.role]}</SkillStatusTag>
                </header>

                <div className="organization-team-meta">
                  <span>
                    <strong>{labels.activeTokens}</strong>
                    {member.activeTokenCount} / {member.tokenCount}
                  </span>
                  <span>
                    <strong>{labels.lastUsed}</strong>
                    {formatDate(member.lastTokenUsedAt, locale)}
                  </span>
                  <span>
                    <strong>{labels.memberSince}</strong>
                    {formatDate(member.memberSince, locale)}
                  </span>
                  <span>
                    <strong>{labels.platform}</strong>
                    {member.platformRole}
                  </span>
                </div>

                <div className="organization-team-actions">
                  <form action={saveAction} className="organization-team-role-form">
                    <input name="email" type="hidden" value={member.email} />
                    <input name="displayName" type="hidden" value={member.displayName ?? ""} />
                    <label>
                      <span>{labels.role}</span>
                      <SkillSelect defaultValue={member.role} name="role" options={roleOptions(labels)} />
                    </label>
                    <SkillButton className="secondary-button secondary-button--compact" disabled={isSaving} htmlType="submit">
                      <Save size={15} aria-hidden="true" />
                      <span>{isSaving && memberSaveState ? labels.saving : labels.save}</span>
                    </SkillButton>
                  </form>

                  <form action={tokenAction} className="organization-team-token-form">
                    <input name="userId" type="hidden" value={member.userId} />
                    <label>
                      <span>{labels.tokenName}</span>
                      <SkillInput name="tokenName" placeholder={labels.tokenPlaceholder} />
                    </label>
                    <SkillButton className="secondary-button secondary-button--compact" disabled={isCreatingToken} htmlType="submit">
                      <KeyRound size={15} aria-hidden="true" />
                      <span>{isCreatingToken && memberTokenState ? labels.saving : labels.token}</span>
                    </SkillButton>
                  </form>

                  <ProjectSensitiveActionForm
                    action={removeAction}
                    cancelLabel={sensitiveLabels.cancel}
                    confirmLabel={sensitiveLabels.confirm}
                    confirmPlaceholder={sensitiveLabels.removeConfirmPlaceholder}
                    description={sensitiveLabels.removeDescription}
                    disabled={isRemoving}
                    hiddenFields={{ userId: member.userId }}
                    icon={Trash2}
                    label={isRemoving && memberRemoveState ? labels.saving : labels.remove}
                    reasonLabel={sensitiveLabels.reason}
                    reasonPlaceholder={sensitiveLabels.removeReasonPlaceholder}
                    submitLabel={sensitiveLabels.removeSubmit}
                  />
                </div>

                {memberSaveState && memberSaveState.status !== "idle" ? <ActionMessage state={memberSaveState} /> : null}
                {memberTokenState && memberTokenState.status !== "idle" ? <ActionMessage state={memberTokenState} /> : null}
                {memberRemoveState && memberRemoveState.status !== "idle" ? <ActionMessage state={memberRemoveState} /> : null}
              </section>
            );
          })
        ) : (
          <div className="organization-team-empty">{labels.empty}</div>
        )}
      </div>
    </article>
  );
}

function ActionMessage({ state }: { state: OrganizationTeamActionState }) {
  return (
    <SkillAlert
      className="action-message"
      icon={state.status === "success" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
      message={
        <span>
        {state.message}
        {state.accessToken?.token ? <code>{state.accessToken.token}</code> : null}
        </span>
      }
      type={state.status === "success" ? "success" : "error"}
    />
  );
}

function roleOptions(labels: (typeof copy)["en"] | (typeof copy)["zh"]) {
  return roles.map((role) => ({ label: labels.roles[role], value: role }));
}

function roleClass(role: OrganizationRole) {
  if (role === "owner" || role === "admin") {
    return "status-chip";
  }

  if (role === "finance" || role === "reviewer") {
    return "status-chip status-chip--warning";
  }

  return "status-chip status-chip--neutral";
}

function formatDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return "n/a";
  }

  if (value === "demo") {
    return locale === "zh" ? "演示时间" : "Demo time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
