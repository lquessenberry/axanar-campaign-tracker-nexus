-- Create a staging table for importing Indiegogo ground-truth rows from local CSV
create table if not exists public.staging_indiegogo (
  id bigserial primary key,
  email text,
  amount numeric,
  pledge_date timestamp without time zone,
  perk_name text,
  raw_line jsonb,
  source text default 'indiegogo_local_csv',
  created_at timestamptz default now()
);

-- Helpful indexes for matching
create index if not exists idx_staging_indiegogo_email on public.staging_indiegogo (lower(email));
create index if not exists idx_staging_indiegogo_amount on public.staging_indiegogo (amount);
