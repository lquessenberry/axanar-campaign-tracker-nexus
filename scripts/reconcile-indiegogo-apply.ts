import { getSql } from './db';

async function ensureBackup(sql: ReturnType<typeof getSql>) {
  await sql`
    create table if not exists public.pledges_reassign_backup2 (
      backup_id bigserial primary key,
      id uuid,
      legacy_id bigint,
      donor_id uuid,
      campaign_id uuid,
      reward_id uuid,
      amount numeric,
      status text,
      created_at timestamp without time zone,
      updated_at timestamp without time zone,
      backup_reason text,
      moved_to_campaign uuid,
      backup_at timestamptz default now()
    )`;
}

async function main() {
  const DELETE_EXTRAS = process.env.DELETE_EXTRAS === 'true';
  const sql = getSql();
  await ensureBackup(sql);

  const [{ prelude_id, indiegogo_id }] = await sql<{ prelude_id: string; indiegogo_id: string }[]>`
    select 
      (select id from public.campaigns where name ilike '%Prelude%' limit 1) as prelude_id,
      (select id from public.campaigns where provider ilike 'Indiegogo' and name ilike 'Axanar' limit 1) as indiegogo_id`;

  // Build matched donor+amount pairs from staging
  await sql`create temporary table tmp_matches as
    select d.id as donor_id, s.amount, s.pledge_date
    from public.staging_indiegogo s
    join public.donors d on lower(d.email) = lower(s.email)
  `;

  // Insert missing pledges into Indiegogo
  const inserted = await sql<{ inserted: number }[]>`
    with missing as (
      select m.donor_id, m.amount, m.pledge_date
      from tmp_matches m
      left join public.pledges p
        on p.campaign_id = ${indiegogo_id}
       and p.donor_id   = m.donor_id
       and p.amount     = m.amount
      where p.id is null
    )
    insert into public.pledges (donor_id, campaign_id, reward_id, amount, status, created_at, updated_at, source)
    select donor_id, ${indiegogo_id}::uuid, null, amount, 'collected', coalesce(pledge_date::timestamptz, now()), now(), 'staging_indiegogo'
    from missing
    returning 1 as inserted`;

  // Optionally delete extras not in staging (backed up first)
  let deletedCount = 0;
  if (DELETE_EXTRAS) {
    await sql`create temporary table tmp_present as
      select m.donor_id, m.amount from tmp_matches m`;

    // Backup extras
    await sql`
      insert into public.pledges_reassign_backup2 (
        id, legacy_id, donor_id, campaign_id, reward_id, amount, status, created_at, updated_at,
        backup_reason, moved_to_campaign
      )
      select p.id, p.legacy_id, p.donor_id, p.campaign_id, p.reward_id, p.amount, p.status, p.created_at, p.updated_at,
             'delete indiegogo extra (not in staging)', ${indiegogo_id}::uuid
      from public.pledges p
      left join tmp_present t on t.donor_id = p.donor_id and t.amount = p.amount
      where p.campaign_id = ${indiegogo_id} and t.donor_id is null
    `;

    const del = await sql<{ del: number }[]>`
      delete from public.pledges p
      using tmp_present t
      where p.campaign_id = ${indiegogo_id} and not exists (
        select 1 from tmp_present x where x.donor_id = p.donor_id and x.amount = p.amount
      )
      returning 1 as del`;
    deletedCount = del.length;
  }

  // Summaries
  const [sumIndiegogo] = await sql<{ cnt: number; total: number; donors: number }[]>`
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total, count(distinct donor_id)::int as donors
    from public.pledges where campaign_id = ${indiegogo_id}`;

  console.log('== Indiegogo Apply ==');
  console.log('Inserted:', inserted.length);
  if (DELETE_EXTRAS) console.log('Deleted extras:', deletedCount);
  console.log('Indiegogo now -> pledges:', sumIndiegogo.cnt, 'donors:', sumIndiegogo.donors, 'total:', sumIndiegogo.total.toFixed(2));

  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
