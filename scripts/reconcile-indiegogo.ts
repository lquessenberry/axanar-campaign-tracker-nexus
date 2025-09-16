import { getSql } from './db';

async function main() {
  const sql = getSql();

  const [{ indiegogo_id }] = await sql<{ indiegogo_id: string }[]>`
    select (select id from public.campaigns where provider ilike 'Indiegogo' and name ilike 'Axanar' limit 1) as indiegogo_id`;

  // Staging summary
  const [stage] = await sql<{ cnt: number; total: number; unique_emails: number }[]>`
    with e as (
      select distinct lower(email) as email from public.staging_indiegogo where email is not null
    )
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total, (select count(*) from e) as unique_emails
    from public.staging_indiegogo`;

  // Matched donors by email
  const [matches] = await sql<{ matched_donors: number; unmatched_stage_rows: number }[]>`
    with m as (
      select s.* from public.staging_indiegogo s
      join public.donors d on lower(d.email) = lower(s.email)
    ), u as (
      select s.* from public.staging_indiegogo s
      left join public.donors d on lower(d.email) = lower(s.email)
      where d.id is null
    )
    select (select count(distinct lower(email)) from m) as matched_donors,
           (select count(*) from u) as unmatched_stage_rows`;

  // How many staged rows already exist as pledges (same donor + amount) under Indiegogo
  const [exists] = await sql<{ already_present: number; already_sum: number }[]>`
    with m as (
      select s.email, s.amount, d.id as donor_id
      from public.staging_indiegogo s
      join public.donors d on lower(d.email) = lower(s.email)
    )
    select count(*)::int as already_present, coalesce(sum(p.amount),0)::float as already_sum
    from public.pledges p
    join m on m.donor_id = p.donor_id and m.amount = p.amount
    where p.campaign_id = ${indiegogo_id}`;

  // Extra pledges in Indiegogo not represented in staging (by donor+amount)
  const [extras] = await sql<{ extra_rows: number; extra_sum: number }[]>`
    with m as (
      select s.email, s.amount, d.id as donor_id
      from public.staging_indiegogo s
      join public.donors d on lower(d.email) = lower(s.email)
    )
    select count(*)::int as extra_rows, coalesce(sum(p.amount),0)::float as extra_sum
    from public.pledges p
    left join m on m.donor_id = p.donor_id and m.amount = p.amount
    where p.campaign_id = ${indiegogo_id}
      and m.donor_id is null`;

  console.log('== Indiegogo Reconciliation (dry-run) ==');
  console.log('Staging rows:', stage.cnt, 'Staging total:', stage.total.toFixed(2), 'Unique emails:', stage.unique_emails);
  console.log('Matched donors:', matches.matched_donors, 'Unmatched stage rows:', matches.unmatched_stage_rows);
  console.log('Already present in pledges:', exists.already_present, 'sum:', exists.already_sum.toFixed(2));
  console.log('Extras in pledges not in staging:', extras.extra_rows, 'sum:', extras.extra_sum.toFixed(2));

  // Target comparison to official numbers (as override): 574,434 and ~7,659 backers
  const targetAmount = 574434.0;
  const targetBackers = 7659;
  console.log('Target official amount:', targetAmount.toFixed(2), 'Target backers:', targetBackers);

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
