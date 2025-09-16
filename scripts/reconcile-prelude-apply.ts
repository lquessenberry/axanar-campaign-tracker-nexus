import { getSql } from './db';

async function main() {
  const sql = getSql();

  const [{ prelude_id }] = await sql<{ prelude_id: string }[]>`
    select (select id from public.campaigns where name ilike '%Prelude%' limit 1) as prelude_id`;

  // Build matched donor+amount pairs from Prelude staging (Kickstarter + PayPal)
  await sql`create temporary table tmp_prelude_matches as
    with s as (
      select email, amount, pledge_date from public.staging_prelude_kickstarter
      union all
      select email, amount, pledge_date from public.staging_prelude_paypal
    )
    select d.id as donor_id, s.amount, s.pledge_date
    from s join public.donors d on lower(d.email) = lower(s.email)`;

  // Insert missing pledges into Prelude
  const inserted = await sql<{ inserted: number }[]>`
    with missing as (
      select m.donor_id, m.amount, m.pledge_date
      from tmp_prelude_matches m
      left join public.pledges p
        on p.campaign_id = ${prelude_id}
       and p.donor_id   = m.donor_id
       and p.amount     = m.amount
      where p.id is null
    )
    insert into public.pledges (donor_id, campaign_id, reward_id, amount, status, created_at, updated_at, source)
    select donor_id, ${prelude_id}::uuid, null, amount, 'collected', coalesce(pledge_date::timestamptz, now()), now(), 'staging_prelude'
    from missing
    returning 1 as inserted`;

  const [sumPrelude] = await sql<{ cnt: number; total: number; donors: number }[]>`
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total, count(distinct donor_id)::int as donors
    from public.pledges where campaign_id = ${prelude_id}`;

  console.log('== Prelude Apply ==');
  console.log('Inserted:', inserted.length);
  console.log('Prelude now -> pledges:', sumPrelude.cnt, 'donors:', sumPrelude.donors, 'total:', sumPrelude.total.toFixed(2));

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
