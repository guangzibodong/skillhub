create extension if not exists pgcrypto;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  description text not null,
  tags text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'private', 'unlisted')),
  verification_status text not null default 'draft' check (verification_status in ('draft', 'submitted', 'verified', 'deprecated', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references skills(id) on delete cascade,
  version text not null,
  manifest jsonb not null,
  package_url text,
  checksum text,
  created_at timestamptz not null default now(),
  unique (skill_id, version)
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table skill_invocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  skill_id uuid references skills(id) on delete set null,
  skill_version_id uuid references skill_versions(id) on delete set null,
  status text not null check (status in ('success', 'error', 'blocked')),
  latency_ms integer,
  error_code text,
  created_at timestamptz not null default now()
);

create index skills_tags_idx on skills using gin(tags);
create index skill_versions_manifest_idx on skill_versions using gin(manifest);
create index skill_invocations_created_at_idx on skill_invocations(created_at desc);
