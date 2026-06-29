-- Additive launch-readiness guards for the role-flow matrix.
--
-- Rollback-safe design:
-- - This migration only adds CHECK constraints with NOT VALID and indexes.
-- - Existing historical rows are not rewritten or deleted.
-- - Rollback is a set of ALTER TABLE ... DROP CONSTRAINT statements plus
--   DROP INDEX for indexes introduced here.
-- - New and updated rows are protected immediately by PostgreSQL even when
--   a NOT VALID constraint has not yet been validated against old rows.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_slug_format_check') then
    alter table projects
      add constraint projects_slug_format_check
      check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skills_slug_format_check') then
    alter table skills
      add constraint skills_slug_format_check
      check (slug ~ '^[a-z0-9][a-z0-9-]{1,79}$')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'api_keys_active_material_check') then
    alter table api_keys
      add constraint api_keys_active_material_check
      check (
        revoked_at is not null
        or (
          key_prefix is not null
          and length(trim(key_prefix)) between 2 and 32
          and key_last4 is not null
          and length(trim(key_last4)) = 4
        )
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skill_invocations_latency_check') then
    alter table skill_invocations
      add constraint skill_invocations_latency_check
      check (latency_ms is null or latency_ms >= 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skill_prices_non_negative_check') then
    alter table skill_prices
      add constraint skill_prices_non_negative_check
      check (unit_amount_cents >= 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skill_prices_currency_format_check') then
    alter table skill_prices
      add constraint skill_prices_currency_format_check
      check (currency ~ '^[a-z]{3}$')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'project_skill_policies_limits_check') then
    alter table project_skill_policies
      add constraint project_skill_policies_limits_check
      check (
        monthly_budget_cents >= 0
        and (rate_limit_per_minute is null or rate_limit_per_minute > 0)
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skill_runtime_checks_latency_check') then
    alter table skill_runtime_checks
      add constraint skill_runtime_checks_latency_check
      check (latency_ms is null or latency_ms >= 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'skill_reviews_decision_timestamp_check') then
    alter table skill_reviews
      add constraint skill_reviews_decision_timestamp_check
      check (
        (status in ('queued', 'in_review') and decided_at is null)
        or (status in ('approved', 'rejected', 'blocked') and decided_at is not null)
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'subscriptions_period_order_check') then
    alter table subscriptions
      add constraint subscriptions_period_order_check
      check (
        current_period_start is null
        or current_period_end is null
        or current_period_end > current_period_start
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'usage_events_amount_quantity_check') then
    alter table usage_events
      add constraint usage_events_amount_quantity_check
      check (quantity > 0 and amount_cents >= 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'payouts_positive_amount_check') then
    alter table payouts
      add constraint payouts_positive_amount_check
      check (amount_cents > 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'refunds_positive_amount_check') then
    alter table refunds
      add constraint refunds_positive_amount_check
      check (amount_cents > 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'disputes_positive_amount_check') then
    alter table disputes
      add constraint disputes_positive_amount_check
      check (amount_cents > 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'transaction_splits_non_negative_check') then
    alter table transaction_splits
      add constraint transaction_splits_non_negative_check
      check (
        platform_fee_cents >= 0
        and publisher_share_cents >= 0
        and processing_fee_cents >= 0
      )
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'payout_accounts_provider_check') then
    alter table payout_accounts
      add constraint payout_accounts_provider_check
      check (length(trim(provider)) > 0 and length(trim(provider_account_id)) > 0)
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'admin_audit_logs_metadata_object_check') then
    alter table admin_audit_logs
      add constraint admin_audit_logs_metadata_object_check
      check (jsonb_typeof(metadata) = 'object')
      not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'notification_events_payload_object_check') then
    alter table notification_events
      add constraint notification_events_payload_object_check
      check (jsonb_typeof(payload) = 'object')
      not valid;
  end if;
end $$;

create index if not exists admin_audit_logs_action_created_idx
  on admin_audit_logs(action, created_at desc);

create index if not exists notification_events_org_status_created_idx
  on notification_events(organization_id, status, created_at desc)
  where organization_id is not null;

