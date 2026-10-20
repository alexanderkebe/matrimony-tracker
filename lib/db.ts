export type Row = Record<string, unknown>;

export interface Database {
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Runs an INSERT and returns the new row id. */
  insert(sql: string, params?: unknown[]): Promise<number>;
  /** Runs an UPDATE/DELETE and returns the number of changed rows. */
  execute(sql: string, params?: unknown[]): Promise<number>;
}

const RECORDS_TABLE = `CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  bride_first_name TEXT NOT NULL,
  groom_first_name TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  language TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

// Couples' own submissions from the client portal, reviewed by the planner (see lib/portal.ts).
const PORTAL_TABLE = `CREATE TABLE IF NOT EXISTS portal_requests (
  id SERIAL PRIMARY KEY,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  phone TEXT NOT NULL,
  language TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  status TEXT NOT NULL,
  record_id INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

// Each couple record and client request belongs to the staff account that registered it
// ("u<id>"); other accounts never see it. Rows from before accounts existed (NULL) go to the owner.
const OWNERSHIP = [
  "ALTER TABLE records ADD COLUMN IF NOT EXISTS owner_user_id TEXT",
  "CREATE INDEX IF NOT EXISTS records_owner ON records (owner_user_id, updated_at)",
  "ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS owner_user_id TEXT",
  "CREATE INDEX IF NOT EXISTS portal_requests_owner ON portal_requests (owner_user_id, id)"
];

// Staff accounts (see lib/accounts.ts). Passwords are scrypt hashes; refresh tokens and
// invite/reset codes are stored only as SHA-256 hashes.
const ACCOUNT_TABLES = [
  `CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  disabled_at TEXT
)`,
  // Exactly one owner: the first account, created when the app has no users.
  "CREATE UNIQUE INDEX IF NOT EXISTS app_users_single_owner ON app_users (role) WHERE role = 'owner'",
  `CREATE TABLE IF NOT EXISTS app_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
)`,
  `CREATE TABLE IF NOT EXISTS app_invites (
  id SERIAL PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  role TEXT NOT NULL,
  user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE,
  created_by INTEGER,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
)`
];

/* ── Neon Postgres ────────────────────────────────────────────────── */
// Uses Neon's HTTP SQL endpoint, so serverless functions need no driver or pool.
function neonDatabase(connectionString: string): Database {
  const endpoint = `https://${new URL(connectionString).hostname}/sql`;
  const toPostgres = (sql: string) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  };
  async function run(sql: string, params: unknown[] = []) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "neon-connection-string": connectionString, "Content-Type": "application/json" },
      body: JSON.stringify({ query: toPostgres(sql), params }),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Database error: ${response.status}`);
    return (await response.json()) as { rows?: Row[]; rowCount?: number };
  }
  let ready: Promise<unknown> | null = null;
  const init = () => (ready ??= [RECORDS_TABLE, PORTAL_TABLE, ...OWNERSHIP, ...ACCOUNT_TABLES]
    .reduce<Promise<unknown>>((previous, sql) => previous.then(() => run(sql)), Promise.resolve())
    .catch((error) => { ready = null; throw error; }));
  return {
    async query<T extends Row>(sql: string, params?: unknown[]) {
      await init();
      return ((await run(sql, params)).rows ?? []) as T[];
    },
    async insert(sql, params) {
      await init();
      const rows = (await run(`${sql} RETURNING id`, params)).rows ?? [];
      return Number(rows[0]?.id);
    },
    async execute(sql, params) {
      await init();
      return (await run(sql, params)).rowCount ?? 0;
    }
  };
}

let database: Database | null = null;

/** All data lives in Neon Postgres; DATABASE_URL comes from the host or .env.local (same as server.py). */
export function getDatabase(): Database {
  if (database) return database;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add the Neon connection string to .env.local.");
  database = neonDatabase(url);
  return database;
}
