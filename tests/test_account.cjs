/* Temporary staff account for browser tests against the running Next.js app (which needs sign-in).
   create() adds an account straight to the database, signIn() signs a browser context in,
   and remove() deletes the account with its sessions. It never touches the owner account. */
const {createHash, randomBytes, scryptSync} = require('node:crypto');
const nextEnv = require('@next/env');

nextEnv.loadEnvConfig(process.cwd(), true);

async function sql(query, params = []) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set (.env.local).');
  let index = 0;
  const response = await fetch(`https://${new URL(url).hostname}/sql`, {
    method: 'POST',
    headers: {'neon-connection-string': url, 'Content-Type': 'application/json'},
    body: JSON.stringify({query: query.replace(/\?/g, () => `$${++index}`), params})
  });
  if (!response.ok) throw new Error(`Database error: ${response.status} ${await response.text()}`);
  return (await response.json()).rows || [];
}

// Same format as lib/accounts.ts hashPassword().
function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password.normalize('NFKC'), salt, 64, {N:16384, r:8, p:1, maxmem:64 * 1024 * 1024});
  return `scrypt$16384$8$1$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function create(role = 'admin', name = 'QA Planner') {
  const email = `qa-${randomBytes(6).toString('hex')}@matrimony.test`;
  const password = randomBytes(12).toString('base64url');
  const [{id}] = await sql('INSERT INTO app_users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id',
    [email, name, hashPassword(password), role, new Date().toISOString()]);
  return {
    id, email, password, name, role,
    /** Signs a Playwright browser context in; its pages then share the session cookies. */
    async signIn(context, base) {
      const response = await context.request.post(`${base}/api/auth/signin`, {data:{email, password}, headers:{Origin:base}});
      if (!response.ok()) throw new Error(`Test sign-in failed: ${response.status()} ${await response.text()}`);
    },
    remove: async () => {
      await sql("DELETE FROM records WHERE owner_user_id = ?", [`u${id}`]);
      await sql("DELETE FROM shared_documents WHERE owner_user_id = ?", [`u${id}`]).catch(() => {});
      await sql('DELETE FROM app_users WHERE id = ?', [id]);
    }
  };
}

/** Deletes test accounts (by email domain) with the couples, client requests and planner weddings they own. */
async function removeTestAccounts() {
  const owners = (await sql("SELECT 'u' || id AS owner FROM app_users WHERE email LIKE '%@matrimony.test'")).map(row => row.owner);
  if (owners.length) {
    await sql('DELETE FROM records WHERE owner_user_id = ANY(?)', [owners]);
    await sql('DELETE FROM portal_requests WHERE owner_user_id = ANY(?)', [owners]);
    await sql('DELETE FROM shared_documents WHERE owner_user_id = ANY(?)', [owners]).catch(() => {});
    // Only weddings whose members are all test accounts; a real wedding is never touched.
    const weddings = (await sql(`SELECT DISTINCT m.wedding_id FROM wp_members m WHERE m.user_id = ANY(?)
      AND NOT EXISTS (SELECT 1 FROM wp_members other WHERE other.wedding_id = m.wedding_id AND NOT (other.user_id = ANY(?)))`, [owners, owners])).map(row => row.wedding_id);
    if (weddings.length) {
      const tables = await sql("SELECT table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'wedding_id' AND table_name LIKE 'wp\_%'");
      for (const {table_name} of tables) await sql(`DELETE FROM ${table_name} WHERE wedding_id = ANY(?)`, [weddings]);
      await sql('DELETE FROM wp_weddings WHERE id = ANY(?)', [weddings]);
    }
  }
  await sql("DELETE FROM app_users WHERE email LIKE '%@matrimony.test'");
}

module.exports = {create, sql, removeTestAccounts, sha256: value => createHash('sha256').update(value).digest('hex')};
