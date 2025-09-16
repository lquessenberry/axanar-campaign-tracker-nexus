import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { getSql } from './db';

const SRC = 'local/data/legacy-csvs/src_paypal_prelude.csv';

function normalizeEmail(v?: string | null): string | null {
  const s = (v ?? '').trim().toLowerCase();
  if (!s) return null;
  return s;
}

function parseAmount(raw?: string | null): number {
  if (!raw) return 0;
  const s = String(raw).replace(/,/g, '');
  const m = s.match(/[0-9]*\.?[0-9]+/);
  return m ? Number(m[0]) : 0;
}

async function main() {
  const file = path.resolve(SRC);
  if (!fs.existsSync(file)) {
    console.error(`[ERROR] Missing file: ${file}`);
    process.exit(1);
  }

  const sql = getSql();
  await sql`truncate table public.staging_prelude_paypal`;

  // The sample suggests no header row and columns like: Last, First, Email, Amount, Index
  const parser = fs.createReadStream(file)
    .pipe(parse({ delimiter: ',', columns: false, relax_quotes: true, relax_column_count: true, trim: true }));

  const batch: { email: string | null; amount: number; pledge_date: Date | null; reward_name: string | null; raw_line: string[] }[] = [];

  for await (const row of parser as unknown as string[][]) {
    if (!Array.isArray(row) || row.length < 4) continue;
    const email = normalizeEmail(row[2]);
    const amount = parseAmount(row[3]);
    // PayPal CSV snippet lacks dates and reward names; leave null
    batch.push({ email, amount, pledge_date: null, reward_name: null, raw_line: row });

    if (batch.length >= 1000) {
      await bulkInsert(sql, batch);
      batch.length = 0;
    }
  }

  if (batch.length) await bulkInsert(sql, batch);

  const summary = await sql<{ cnt: number; total: number }[]>`
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total from public.staging_prelude_paypal`;
  console.log('Loaded to staging_prelude_paypal:', summary[0]);

  await sql.end();
}

async function bulkInsert(sql: ReturnType<typeof getSql>, batch: { email: string | null; amount: number; pledge_date: Date | null; reward_name: string | null; raw_line: string[] }[]) {
  const emails = batch.map(r => r.email);
  const amounts = batch.map(r => r.amount);
  const pledgeDates = batch.map(r => r.pledge_date);
  const rewards = batch.map(r => r.reward_name);
  const raws = batch.map(r => JSON.stringify(r.raw_line));
  await sql`
    insert into public.staging_prelude_paypal (email, amount, pledge_date, reward_name, raw_line)
    select * from unnest(
      ${sql.array(emails)},
      ${sql.array(amounts)},
      ${sql.array(pledgeDates)},
      ${sql.array(rewards)},
      ${sql.array(raws)}
    )
  `;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
