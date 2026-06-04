create table if not exists skill_abuse_reports (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  reporter_user_id uuid references users(id) on delete set null,
  reporter_organization_id uuid references organizations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  category text not null check (
    category in ('malicious', 'security', 'privacy', 'copyright', 'spam', 'quality', 'billing', 'other')
  ),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (
    status in ('open', 'triaged', 'dismissed', 'warning_sent', 'restricted', 'suspended', 'resolved')
  ),
  title text not null,
  description text not null,
  evidence_url text,
  decision_reason text,
  decided_by_user_id uuid references users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists skill_takedown_actions (
  id uuid primary key default gen_random_uuid(),
  abuse_report_id uuid references skill_abuse_reports(id) on delete set null,
  skill_id uuid not null references skills(id) on delete cascade,
  action text not null check (action in ('triage', 'dismiss', 'warn', 'restrict', 'suspend', 'resolve')),
  previous_visibility text,
  previous_verification_status text,
  new_visibility text,
  new_verification_status text,
  reason text,
  actor_user_id uuid references users(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists skill_abuse_reports_status_idx
  on skill_abuse_reports(status, severity, created_at desc);

create index if not exists skill_abuse_reports_skill_idx
  on skill_abuse_reports(skill_id, created_at desc);

create index if not exists skill_takedown_actions_skill_idx
  on skill_takedown_actions(skill_id, created_at desc);
