create table if not exists organization_billing_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references organizations(id) on delete cascade,
  billing_name text not null,
  billing_email text,
  tax_id text,
  country text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postal_code text,
  invoice_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_payment_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  provider_customer_id text,
  provider_payment_method_id text,
  method_type text not null check (method_type in ('card', 'bank_account', 'invoice', 'external')),
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  status text not null check (status in ('not_configured', 'pending', 'ready', 'requires_action', 'failed', 'disabled')),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists organization_payment_methods_one_default_idx
  on organization_payment_methods(organization_id)
  where is_default = true;

create unique index if not exists organization_payment_methods_provider_ref_idx
  on organization_payment_methods(organization_id, provider, provider_payment_method_id)
  where provider_payment_method_id is not null;

create index if not exists organization_payment_methods_org_status_idx
  on organization_payment_methods(organization_id, status, updated_at desc);
