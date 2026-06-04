alter table skills drop constraint if exists skills_verification_status_check;

alter table skills
  add constraint skills_verification_status_check
  check (verification_status in ('draft', 'submitted', 'verified', 'deprecated', 'rejected', 'suspended'));

create table if not exists project_skill_installs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  status text not null default 'installed' check (status in ('installed', 'suspended', 'removed')),
  approval_state text not null default 'pending' check (
    approval_state in ('pending', 'approved', 'rejected', 'owner_required')
  ),
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, skill_id)
);

create table if not exists project_skill_policies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  max_permission_level text not null default 'medium' check (max_permission_level in ('low', 'medium', 'high')),
  allow_network boolean not null default false,
  allow_browser boolean not null default false,
  filesystem_access text not null default 'none' check (filesystem_access in ('none', 'read', 'write')),
  allow_secret_access boolean not null default false,
  monthly_budget_cents integer not null default 0,
  rate_limit_per_minute integer,
  approval_required boolean not null default true,
  approved_by_user_id uuid references users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, skill_id)
);

create table if not exists skill_runtime_checks (
  id uuid primary key default gen_random_uuid(),
  skill_version_id uuid not null references skill_versions(id) on delete cascade,
  check_type text not null check (check_type in ('manifest', 'runtime', 'example', 'security')),
  status text not null default 'queued' check (status in ('queued', 'running', 'passed', 'failed', 'warning')),
  latency_ms integer,
  message text,
  checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists skill_update_events (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  event_type text not null check (
    event_type in ('new_version', 'deprecated', 'suspended', 'security', 'incident', 'resolved')
  ),
  severity text not null default 'info' check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists skill_incidents (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  skill_version_id uuid references skill_versions(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'monitoring', 'resolved', 'postmortem')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  title text not null,
  summary text,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists saved_skills (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  collection_name text,
  created_at timestamptz not null default now(),
  unique (project_id, skill_id, collection_name)
);

create table if not exists buyer_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  bounty_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'open' check (
    status in ('open', 'claimed', 'submitted', 'matched', 'closed', 'canceled')
  ),
  claimed_by_publisher_id uuid references publisher_profiles(id) on delete set null,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publisher_quality_scores (
  id uuid primary key default gen_random_uuid(),
  publisher_profile_id uuid not null unique references publisher_profiles(id) on delete cascade,
  score numeric(5, 2) not null default 0,
  verified_skill_count integer not null default 0,
  response_sla_hours integer,
  install_success_rate numeric(5, 2),
  incident_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  invocation_id uuid references skill_invocations(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  skill_version_id uuid references skill_versions(id) on delete set null,
  event_type text not null check (event_type in ('invocation_success', 'subscription_period', 'adjustment')),
  quantity integer not null default 1,
  billable boolean not null default false,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  created_at timestamptz not null default now()
);

create table if not exists notification_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null,
  channel text not null check (channel in ('email', 'in_app', 'webhook')),
  locale text not null default 'en',
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  updated_at timestamptz not null default now(),
  unique (template_key, channel, locale)
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  event_type text not null,
  channel text not null check (channel in ('email', 'in_app', 'webhook')),
  subject text,
  payload jsonb not null default '{}',
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  error text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  email_enabled boolean not null default true,
  in_app_enabled boolean not null default true,
  webhook_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, event_type)
);

create index if not exists project_skill_installs_project_idx
  on project_skill_installs(project_id, status, updated_at desc);

create index if not exists project_skill_policies_project_idx
  on project_skill_policies(project_id, skill_id);

create index if not exists skill_runtime_checks_version_idx
  on skill_runtime_checks(skill_version_id, status, created_at desc);

create index if not exists skill_update_events_skill_idx
  on skill_update_events(skill_id, created_at desc);

create index if not exists skill_incidents_status_idx
  on skill_incidents(status, severity, created_at desc);

create index if not exists saved_skills_project_idx
  on saved_skills(project_id, created_at desc);

create index if not exists buyer_requests_status_idx
  on buyer_requests(status, created_at desc);

create index if not exists usage_events_created_at_idx
  on usage_events(created_at desc);

create index if not exists notification_events_status_idx
  on notification_events(status, created_at desc);
