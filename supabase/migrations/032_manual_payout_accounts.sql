alter table payout_accounts
  add column if not exists manual_method text,
  add column if not exists manual_account text,
  add column if not exists manual_account_holder text,
  add column if not exists manual_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payout_accounts_manual_method_check'
  ) then
    alter table payout_accounts
      add constraint payout_accounts_manual_method_check
      check (
        manual_method is null
        or manual_method in ('paypal', 'alipay')
      );
  end if;
end $$;

create index if not exists payout_accounts_manual_method_idx
  on payout_accounts(publisher_profile_id, manual_method, updated_at desc);

update notification_templates
set
  body = 'A payout request for {{publisherName}} was created. Track finance review, manual transfer reference, and linked balance state from the admin console.',
  updated_at = now()
where template_key = 'payout.requested'
  and channel = 'in_app'
  and locale = 'en'
  and body like '%provider reference%';

update notification_templates
set
  subject = '提现请求已创建',
  body = '{{publisherName}} 的提现请求已创建。请在后台跟踪财务审核、人工转账凭证和关联余额状态。',
  updated_at = now()
where template_key = 'payout.requested'
  and channel = 'in_app'
  and locale = 'zh';

update notification_templates
set
  body = 'Payout {{payoutId}} was approved for manual transfer. Track transfer reference and linked balance state from finance operations.',
  updated_at = now()
where template_key = 'payout.approve'
  and channel = 'in_app'
  and locale = 'en'
  and body like '%provider processing%';

update notification_templates
set
  subject = '提现已批准',
  body = '提现 {{payoutId}} 已批准进入人工转账。请在财务后台跟踪转账凭证和关联余额状态。',
  updated_at = now()
where template_key = 'payout.approve'
  and channel = 'in_app'
  and locale = 'zh';
