-- Create staging tables for Prelude ground-truth imports
create table if not exists public.staging_prelude_kickstarter (
  id bigserial primary key,
  email text,
  amount numeric,
  pledge_date timestamp without time zone,
  reward_name text,
  raw_line jsonb,
  source text default 'prelude_kickstarter_local_csv',
  created_at timestamptz default now()
);

create table if not exists public.staging_prelude_paypal (
  id bigserial primary key,
  email text,
  amount numeric,
  pledge_date timestamp without time zone,
  reward_name text,
  raw_line jsonb,
  source text default 'prelude_paypal_local_csv',
  created_at timestamptz default now()
);

create index if not exists idx_staging_prelude_kickstarter_email on public.staging_prelude_kickstarter (lower(email));
create index if not exists idx_staging_prelude_kickstarter_amount on public.staging_prelude_kickstarter (amount);
create index if not exists idx_staging_prelude_paypal_email on public.staging_prelude_paypal (lower(email));
create index if not exists idx_staging_prelude_paypal_amount on public.staging_prelude_paypal (amount);
