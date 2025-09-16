import dotenv from 'dotenv';
import postgres from 'postgres';

// Load .env first
dotenv.config();
// Then load .env.production to fill any missing vars without overriding existing ones
dotenv.config({ path: '.env.production', override: false });

function required(name: string, fallback?: string) {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export function getSql() {
  const dbUrl = process.env.DB_URL?.trim();
  let url: string;

  if (dbUrl) {
    url = dbUrl;
  } else {
    const host = required('DB_HOST');
    const port = Number(required('DB_PORT', '5432'));
    const user = required('DB_USER');
    const password = required('DB_PASSWORD');
    const database = required('DB_NAME');
    url = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  }

  // Supabase Postgres requires SSL in prod
  const sql = postgres(url, { ssl: 'require', max: 4 });
  return sql;
}

export type SqlClient = ReturnType<typeof getSql>;
