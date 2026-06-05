alter table publisher_profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists terms_accepted_by_user_id uuid references users(id) on delete set null;

create index if not exists publisher_profiles_terms_accepted_idx
  on publisher_profiles(terms_accepted_at desc)
  where terms_accepted_at is not null;
