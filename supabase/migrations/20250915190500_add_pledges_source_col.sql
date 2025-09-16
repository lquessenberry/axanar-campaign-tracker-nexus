-- Add a provenance column to pledges for auditing data origin
alter table public.pledges add column if not exists source text;
create index if not exists idx_pledges_source on public.pledges (source);
