import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { getSql } from './db';

const SRC = 'local/data/legacy-csvs/src_indiegogo.csv';

function normalizeEmail(v?: string | null): string | null {
  const s = (v ?? '').trim().toLowerCase();
  if (!s) return null;
  // primitive validation
  if (!s.includes('@') || !s.includes('.')) return s; // keep even if malformed; still useful for joins
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
  // Truncate existing staging to allow re-run
  await sql`truncate table public.staging_indiegogo`;

  // Detect delimiter by sampling
  const sample = fs.readFileSync(file, { encoding: 'utf-8' }).slice(0, 8192);
  const delimiter = (sample.split('\t').length > sample.split(',').length) ? '\t' : ',';
  console.log(`Using delimiter: ${JSON.stringify(delimiter)}`);

  let headers: string[] = [];

  const parser = fs
    .createReadStream(file)
    .pipe(parse({ delimiter, columns: true, relax_quotes: true, relax_column_count: true, trim: true }))
    .on('headers', (h: string[]) => { headers = h; console.log('Headers:', headers); });

  const preferredAmount = new Set(['amount','amount_usd','usd','usd_amount','contribution','contributed','usd_pledged']);
  let amountKey: string | null = null;
  let emailKeys: string[] = [];

  const rows: { email: string | null; amount: number; pledge_date: string | null; perk_name: string | null; raw_line: any }[] = [];

  for await (const record of parser as any) {
    if (!amountKey) {
      const keys = Object.keys(record || {});
      const pref = keys.find(k => preferredAmount.has(String(k).toLowerCase()));
      amountKey = pref || keys.find(k => /amount|usd|contrib/i.test(k)) || null;
      emailKeys = keys.filter(k => /email/i.test(k));
    }
    const amt = parseAmount(record[amountKey!]);
    const email = normalizeEmail(emailKeys.length ? record[emailKeys[0]] : null);
    const pledgeDateKey = Object.keys(record).find(k => /date|pledge.*date|created/i.test(k));
    const perkKey = Object.keys(record).find(k => /perk|reward|item|package/i.test(k));
    rows.push({
      email,
      amount: amt,
      pledge_date: record[pledgeDateKey ?? ''] ?? null,
      perk_name: record[perkKey ?? ''] ?? null,
      raw_line: record,
    });

    if (rows.length >= 1000) {
      await bulkInsert(sql, rows);
      rows.length = 0;
    }
  }

  if (rows.length) await bulkInsert(sql, rows);

  const summary = await sql<{ cnt: number; total: number }[]>`
    select count(*)::int as cnt, coalesce(sum(amount),0)::float as total from public.staging_indiegogo`;
  console.log('Loaded to staging_indiegogo:', summary[0]);

  await sql.end();
}

async function bulkInsert(sql: ReturnType<typeof getSql>, batch: { email: string | null; amount: number; pledge_date: string | null; perk_name: string | null; raw_line: any }[]) {
  // Convert pledge_date to timestamp where possible
  const emails = batch.map(r => r.email);
  const amounts = batch.map(r => r.amount);
  const pledgeDates = batch.map(r => r.pledge_date ? new Date(r.pledge_date) : null);
  const perks = batch.map(r => r.perk_name);
  const raws = batch.map(r => JSON.stringify(r.raw_line));
  await sql`
    insert into public.staging_indiegogo (email, amount, pledge_date, perk_name, raw_line)
    select * from unnest(
      ${sql.array(emails)},
      ${sql.array(amounts)},
      ${sql.array(pledgeDates)},
      ${sql.array(perks)},
      ${sql.array(raws)}
    )
  `;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
