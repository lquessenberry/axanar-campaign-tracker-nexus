import { getSql } from './db';

async function main() {
  const sql = getSql();

  const [{ prelude_id }] = await sql<{ prelude_id: string }[]>`
    select (select id from public.campaigns where name ilike '%Prelude%' limit 1) as prelude_id`;

  // Staging summary (Kickstarter + PayPal)
  const [stage] = await sql<{ cnt: number; total: number; unique_emails: number }[]>`
    with s as (
      select email, amount from public.staging_prelude_kickstarter
      union all
      select email, amount from public.staging_prelude_paypal
    ), e as (
      select distinct lower(email) as email from s where email is not null
    )
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total, (select count(*) from e) as unique_emails
    from s`;

  // Matched donors by email across both sources
  const [matches] = await sql<{ matched_donors: number; unmatched_stage_rows: number }[]>`
    with s as (
      select email, amount from public.staging_prelude_kickstarter
      union all
      select email, amount from public.staging_prelude_paypal
    ), m as (
      select s.* from s join public.donors d on lower(d.email) = lower(s.email)
    ), u as (
      select s.* from s left join public.donors d on lower(d.email) = lower(s.email) where d.id is null
    )
    select (select count(distinct lower(email)) from m) as matched_donors,
           (select count(*) from u) as unmatched_stage_rows`;

  // Already present in pledges under Prelude
  const [exists] = await sql<{ already_present: number; already_sum: number }[]>`
    with s as (
      select email, amount from public.staging_prelude_kickstarter
      union all
      select email, amount from public.staging_prelude_paypal
    ), m as (
      select s.email, s.amount, d.id as donor_id
      from s join public.donors d on lower(d.email) = lower(s.email)
    )
    select count(*)::int as already_present, coalesce(sum(p.amount),0)::float as already_sum
    from public.pledges p
    join m on m.donor_id = p.donor_id and m.amount = p.amount
    where p.campaign_id = ${prelude_id}`;

  console.log('== Prelude Reconciliation (dry-run) ==');
  console.log('Staging rows:', stage.cnt, 'Staging total:', stage.total.toFixed(2), 'Unique emails:', stage.unique_emails);
  console.log('Matched donors:', matches.matched_donors, 'Unmatched stage rows:', matches.unmatched_stage_rows);
  console.log('Already present under Prelude:', exists.already_present, 'sum:', exists.already_sum.toFixed(2));

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
