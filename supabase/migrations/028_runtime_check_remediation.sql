alter table skill_runtime_checks
  add column if not exists is_blocking boolean,
  add column if not exists fix_category text,
  add column if not exists target_field text,
  add column if not exists next_action text;

