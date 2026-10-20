// Prints a one-time password reset link for a staff account, for when the owner
// is locked out (team members can get one from the owner or an admin in the app).
// Usage: node scripts/reset-link.mjs owner@example.com [https://your-app.example]
import { createHash, randomBytes } from "node:crypto";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), true);
const [email, baseUrl = "http://127.0.0.1:4173"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/reset-link.mjs <email> [app URL]");
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (.env.local).");
  process.exit(1);
}

async function sql(query, params = []) {
  let index = 0;
  const response = await fetch(`https://${new URL(url).hostname}/sql`, {
    method: "POST",
    headers: { "neon-connection-string": url, "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.replace(/\?/g, () => `$${++index}`), params })
  });
  if (!response.ok) throw new Error(`Database error: ${response.status} ${await response.text()}`);
  return (await response.json()).rows || [];
}

const [user] = await sql("SELECT id, role FROM app_users WHERE email = ? AND disabled_at IS NULL", [email.trim().toLowerCase()]);
if (!user) {
  console.error(`No active account uses ${email}.`);
  process.exit(1);
}
const code = randomBytes(24).toString("base64url");
const now = new Date();
await sql(
  "INSERT INTO app_invites (code_hash, kind, role, user_id, created_by, expires_at, created_at) VALUES (?, 'reset', ?, ?, NULL, ?, ?)",
  [createHash("sha256").update(code).digest("hex"), user.role, user.id, new Date(now.getTime() + 86_400_000).toISOString(), now.toISOString()]
);
console.log(`Reset link (works once, for 24 hours):\n${baseUrl.replace(/\/$/, "")}/signin?reset=${code}`);
