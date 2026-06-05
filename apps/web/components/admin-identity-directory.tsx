import { Activity, Building2, KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { formatMoney, type AdminIdentityDirectory as AdminIdentityDirectoryData } from "@/lib/ops-data";

type AdminIdentityDirectoryProps = {
  directory: AdminIdentityDirectoryData;
  locale: Locale;
};

const copy = {
  en: {
    activeTokens: "Active tokens",
    adminUsers: "Admin users",
    created: "Created",
    identity: "Identity",
    invocations: "Invocations",
    lastUsed: "Last token use",
    ledger: "Ledger",
    members: "Members",
    noOrganizations: "No organizations found.",
    noUsers: "No users found.",
    organizations: "Organizations",
    platformRole: "Platform role",
    projects: "Projects",
    publisherProfiles: "Publisher profiles",
    skills: "Skills",
    title: "User and organization directory",
    tokens: "Tokens",
    users: "Users"
  },
  zh: {
    activeTokens: "活跃 Token",
    adminUsers: "后台用户",
    created: "创建时间",
    identity: "身份",
    invocations: "调用",
    lastUsed: "最近 Token 使用",
    ledger: "账本",
    members: "成员",
    noOrganizations: "还没有组织。",
    noUsers: "还没有用户。",
    organizations: "组织",
    platformRole: "平台角色",
    projects: "项目",
    publisherProfiles: "发布者档案",
    skills: "技能",
    title: "用户与组织目录",
    tokens: "Token",
    users: "用户"
  }
} as const;

const metricIcons = [Building2, UsersRound, ShieldCheck, KeyRound] as const;

export function AdminIdentityDirectory({ directory, locale }: AdminIdentityDirectoryProps) {
  const labels = copy[locale];
  const summaryMetrics = [
    [labels.organizations, directory.summary.organizationCount],
    [labels.users, directory.summary.userCount],
    [labels.adminUsers, directory.summary.adminUserCount],
    [labels.activeTokens, directory.summary.activeTokenCount]
  ] as const;

  return (
    <article className="ops-panel admin-identity-panel">
      <div className="card-kicker">
        <UsersRound size={16} aria-hidden="true" />
        <span>{labels.title}</span>
      </div>

      <div className="admin-identity-summary">
        {summaryMetrics.map(([label, value], index) => {
          const Icon = metricIcons[index];

          return (
            <div key={label}>
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>

      <div className="admin-identity-grid">
        <section className="admin-identity-column">
          <header className="admin-identity-column__head">
            <Building2 size={15} aria-hidden="true" />
            <strong>{labels.organizations}</strong>
          </header>

          <div className="admin-identity-list">
            {directory.organizations.length > 0 ? (
              directory.organizations.map((organization) => (
                <article className="admin-identity-card" key={organization.id}>
                  <header className="admin-identity-card__head">
                    <div>
                      <strong>{organization.name}</strong>
                      <span>{organization.slug}</span>
                    </div>
                    <span className="status-chip">{organization.memberCount} {labels.members}</span>
                  </header>

                  <div className="admin-identity-meta admin-identity-meta--six">
                    <span>
                      <strong>{labels.projects}</strong>
                      {organization.projectCount}
                    </span>
                    <span>
                      <strong>{labels.skills}</strong>
                      {organization.skillCount}
                    </span>
                    <span>
                      <strong>{labels.publisherProfiles}</strong>
                      {organization.publisherProfileCount}
                    </span>
                    <span>
                      <strong>{labels.invocations}</strong>
                      {formatCompact(organization.invocationCount)}
                    </span>
                    <span>
                      <strong>{labels.ledger}</strong>
                      {formatMoney(organization.ledgerCents)}
                    </span>
                    <span>
                      <strong>{labels.lastUsed}</strong>
                      {formatDate(organization.lastTokenUsedAt, locale)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-identity-empty">{labels.noOrganizations}</div>
            )}
          </div>
        </section>

        <section className="admin-identity-column">
          <header className="admin-identity-column__head">
            <Activity size={15} aria-hidden="true" />
            <strong>{labels.users}</strong>
          </header>

          <div className="admin-identity-list">
            {directory.users.length > 0 ? (
              directory.users.map((user) => (
                <article className="admin-identity-card" key={user.id}>
                  <header className="admin-identity-card__head">
                    <div>
                      <strong>{user.displayName ?? user.email}</strong>
                      <span>{user.email}</span>
                    </div>
                    <span className={roleClass(user.platformRole)}>{user.platformRole}</span>
                  </header>

                  <div className="admin-identity-memberships">
                    {user.memberships.slice(0, 3).map((membership) => (
                      <span key={`${user.id}-${membership.organizationId}`}>
                        <strong>{membership.role}</strong>
                        {membership.organizationName || membership.organizationSlug}
                      </span>
                    ))}
                  </div>

                  <div className="admin-identity-meta">
                    <span>
                      <strong>{labels.tokens}</strong>
                      {user.activeTokenCount} / {user.tokenCount}
                    </span>
                    <span>
                      <strong>{labels.organizations}</strong>
                      {user.organizationCount}
                    </span>
                    <span>
                      <strong>{labels.lastUsed}</strong>
                      {formatDate(user.lastTokenUsedAt, locale)}
                    </span>
                    <span>
                      <strong>{labels.created}</strong>
                      {formatDate(user.createdAt, locale)}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="admin-identity-empty">{labels.noUsers}</div>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}

function roleClass(role: string) {
  if (role === "super_admin" || role === "admin") {
    return "status-chip";
  }

  if (role === "support" || role === "finance" || role === "reviewer") {
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

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact"
  }).format(value);
}
