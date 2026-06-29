alter table email_login_challenges
  drop constraint if exists email_login_challenges_mode_check;

alter table email_login_challenges
  add constraint email_login_challenges_mode_check
  check (mode in ('login', 'signup', 'password_reset'));
