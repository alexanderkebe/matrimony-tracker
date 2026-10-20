import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { isSameOrigin } from "./auth";
import { getDatabase } from "./db";
import { json } from "./http";
import {
  REFRESH_COOKIE, REFRESH_SECONDS, SESSION_COOKIE, SESSION_SECONDS, cookieValue, organizationId,
  portalCode, requestSession, serializeCookie, sessionSecret, signSession
} from "./session";

/**
 * Staff accounts for Hanna's team. The first account to sign up becomes the owner;
 * everyone after that needs an invite link from the owner or an admin, so couples'
 * records are never open to anyone who finds the site.
 */
const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, length: number, options: object) => Promise<Buffer>;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const INVITE_DAYS = 7;
const RESET_HOURS = 24;

export type Role = "owner" | "admin" | "planner";
export type Account = { id: number; email: string; name: string; role: Role; created_at: string; disabled_at: string | null };

class AccountError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const stamp = (offsetSeconds = 0) => new Date(Date.now() + offsetSeconds * 1000).toISOString();
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const newCode = () => randomBytes(24).toString("base64url");
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const publicAccount = (user: Account) => ({ id: user.id, name: user.name, email: user.email, role: user.role, portalCode: portalCode(`u${user.id}`) });

/* ── Passwords ────────────────────────────────────────────────────── */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(salt, "base64"), expected.length, { N: Number(n), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
  return timingSafeEqual(actual, expected);
}
// Unknown emails still pay for a hash, so response times don't reveal which accounts exist.
const DUMMY_HASH = hashPassword("matrimony-dummy-password");

/* ── Validation ───────────────────────────────────────────────────── */
function cleanEmail(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new AccountError(400, "Enter a valid email address.");
  return email;
}
function cleanName(value: unknown) {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 100) throw new AccountError(400, "Enter your name.");
  return name;
}
function cleanPassword(value: unknown) {
  const password = typeof value === "string" ? value : "";
  if (password.length < 10) throw new AccountError(400, "Use a password of at least 10 characters.");
  if (password.length > 200) throw new AccountError(400, "That password is too long.");
  return password;
}

async function readBody(request: Request) {
  const text = await request.text();
  if (!text || text.length > 10_000) throw new AccountError(400, "The form is empty or too large.");
  try {
    const body = JSON.parse(text) as unknown;
    if (isObject(body)) return body;
  } catch { /* handled below */ }
  throw new AccountError(400, "The form could not be read.");
}

// Best-effort brute-force protection: a few failed sign-ins per address and per email every 15 minutes.
const failures = new Map<string, number[]>();
const clientAddress = (request: Request) => (request.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
function tooManyFailures(keys: string[]) {
  const now = Date.now();
  return keys.some((key) => (failures.get(key) || []).filter((time) => now - time < 900_000).length >= 8);
}
function recordFailure(keys: string[]) {
  const now = Date.now();
  for (const key of keys) failures.set(key, [...(failures.get(key) || []).filter((time) => now - time < 900_000), now]);
}

/* ── Sessions ─────────────────────────────────────────────────────── */
const claimRoles = (role: Role) => (role === "planner" ? ["planner"] : ["admin", "planner"]);

export function sessionToken(user: Account, sid: number) {
  // workspace_owner: also receives couples and requests that predate accounts.
  const permissions = user.role === "owner" ? ["workspace_owner"] : [];
  return signSession({ userId: `u${user.id}`, organizationId: organizationId(), roles: claimRoles(user.role), permissions, name: user.name, email: user.email, sid });
}

/** Signs the user in: a new refresh token in the database plus both cookies. */
async function startSession(user: Account, response: Response) {
  const refresh = newCode();
  const now = stamp();
  const sid = await getDatabase().insert(
    "INSERT INTO app_sessions (user_id, token_hash, expires_at, created_at, last_used_at) VALUES (?, ?, ?, ?, ?)",
    [user.id, sha256(refresh), stamp(REFRESH_SECONDS), now, now]
  );
  response.headers.append("Set-Cookie", serializeCookie(SESSION_COOKIE, sessionToken(user, sid), SESSION_SECONDS));
  response.headers.append("Set-Cookie", serializeCookie(REFRESH_COOKIE, refresh, REFRESH_SECONDS));
  return response;
}

function clearCookies(response: Response) {
  response.headers.append("Set-Cookie", serializeCookie(SESSION_COOKIE, "", 0));
  response.headers.append("Set-Cookie", serializeCookie(REFRESH_COOKIE, "", 0));
  return response;
}

/** The active account behind a refresh token; extends the token while it is in use. */
export async function accountForRefresh(token: string | null): Promise<(Account & { session_id: number }) | null> {
  if (!token || token.length > 200) return null;
  const db = getDatabase();
  const [row] = await db.query<Account & { session_id: number; last_used_at: string }>(
    `SELECT u.id, u.email, u.name, u.role, u.created_at, u.disabled_at, s.id AS session_id, s.last_used_at
     FROM app_sessions s JOIN app_users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.disabled_at IS NULL`,
    [sha256(token), stamp()]
  );
  if (!row) return null;
  if (Date.parse(row.last_used_at) < Date.now() - 86_400_000) {
    await db.execute("UPDATE app_sessions SET last_used_at = ?, expires_at = ? WHERE id = ?", [stamp(), stamp(REFRESH_SECONDS), row.session_id]);
  }
  return row;
}

async function activeAccount(id: number) {
  const [user] = await getDatabase().query<Account>("SELECT id, email, name, role, created_at, disabled_at FROM app_users WHERE id = ? AND disabled_at IS NULL", [id]);
  return user || null;
}

/** The signed-in account for this request, if both it and this device's sign-in are still active. */
async function currentAccount(request: Request): Promise<{ user: Account | null; renewedSid: number | null }> {
  const claims = requestSession(request);
  if (claims && /^u\d+$/.test(claims.userId) && typeof claims.sid === "number") {
    const [user] = await getDatabase().query<Account>(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, u.disabled_at FROM app_sessions s JOIN app_users u ON u.id = s.user_id
       WHERE s.id = ? AND u.id = ? AND s.expires_at > ? AND u.disabled_at IS NULL`, [claims.sid, Number(claims.userId.slice(1)), stamp()]
    );
    return { user: user || null, renewedSid: null };
  }
  const user = await accountForRefresh(cookieValue(request, REFRESH_COOKIE));
  return { user, renewedSid: user ? user.session_id : null };
}

const hasOwner = async () => (await getDatabase().query("SELECT 1 FROM app_users WHERE role = 'owner' AND disabled_at IS NULL LIMIT 1")).length > 0;

function handle(handler: () => Promise<Response>) {
  if (!sessionSecret()) return Promise.resolve(json(503, { error: "Sign-in is not configured on this server. Set MATRIMONY_SESSION_SECRET (at least 32 characters)." }));
  return handler().catch((error) => {
    if (error instanceof AccountError) return json(error.status, { error: error.message });
    console.error("Account request failed", error);
    return json(500, { error: "Sign-in is temporarily unavailable. Please try again." });
  });
}

const origin = (request: Request) => {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const protocol = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  return `${protocol}://${host}`;
};

/* ── /api/auth/* ──────────────────────────────────────────────────── */
export function getAuth(request: Request, action: string) {
  return handle(async () => {
    if (action === "me") {
      const { user, renewedSid } = await currentAccount(request);
      if (!user) return clearCookies(json(401, { error: "Please sign in.", needsOwner: !(await hasOwner()) }));
      const response = json(200, { user: publicAccount(user) });
      if (renewedSid) response.headers.append("Set-Cookie", serializeCookie(SESSION_COOKIE, sessionToken(user, renewedSid), SESSION_SECONDS));
      return response;
    }
    if (action === "invite") {
      const code = new URL(request.url).searchParams.get("code") || "";
      const [invite] = await getDatabase().query<{ kind: string; role: string; email: string | null; name: string | null }>(
        `SELECT i.kind, i.role, u.email, u.name FROM app_invites i LEFT JOIN app_users u ON u.id = i.user_id
         WHERE i.code_hash = ? AND i.used_at IS NULL AND i.expires_at > ?`, [sha256(code), stamp()]
      );
      if (!invite) return json(404, { error: "This link has expired or was already used. Ask for a new one." });
      return json(200, invite);
    }
    return json(404, { error: "Not found." });
  });
}

export function postAuth(request: Request, action: string) {
  return handle(async () => {
    if (!isSameOrigin(request)) return json(403, { error: "Cross-origin requests are not allowed." });
    const db = getDatabase();
    if (action === "signout") {
      const refresh = cookieValue(request, REFRESH_COOKIE);
      if (refresh) await db.execute("DELETE FROM app_sessions WHERE token_hash = ?", [sha256(refresh)]);
      return clearCookies(json(200, { signedOut: true }));
    }
    const body = await readBody(request);

    if (action === "signin") {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const keys = [`ip:${clientAddress(request)}`, `email:${email}`];
      if (tooManyFailures(keys)) return json(429, { error: "Too many attempts. Wait 15 minutes and try again." });
      const [user] = await db.query<Account & { password_hash: string }>(
        "SELECT id, email, name, role, created_at, disabled_at, password_hash FROM app_users WHERE email = ?", [email]
      );
      const valid = user && !user.disabled_at
        ? await verifyPassword(String(body.password || ""), user.password_hash)
        : (await verifyPassword(String(body.password || ""), await DUMMY_HASH), false);
      if (!valid) {
        recordFailure(keys);
        return json(401, { error: "That email and password don't match an active account." });
      }
      return startSession(user, json(200, { user: publicAccount(user) }));
    }

    if (action === "signup") {
      const name = cleanName(body.name), email = cleanEmail(body.email), password = cleanPassword(body.password);
      const passwordHash = await hashPassword(password);
      const code = typeof body.invite === "string" ? body.invite : "";
      let role: Role;
      if ((await db.query("SELECT 1 FROM app_users WHERE email = ?", [email])).length) throw new AccountError(409, "An account with this email already exists. Sign in instead.");
      if (!code) {
        // Only the first account may sign up without an invite; it becomes the owner.
        const [created] = await db.query<{ id: number }>(
          `INSERT INTO app_users (email, name, password_hash, role, created_at)
           SELECT ?, ?, ?, 'owner', ? WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE role = 'owner') RETURNING id`,
          [email, name, passwordHash, stamp()]
        );
        if (!created) throw new AccountError(403, "Sign-up needs an invite link from the owner of this workspace.");
        return startSession((await activeAccount(created.id))!, json(201, { user: { id: created.id, name, email, role: "owner" } }));
      }
      const [invite] = await db.query<{ role: Role }>(
        "UPDATE app_invites SET used_at = ? WHERE code_hash = ? AND kind = 'invite' AND used_at IS NULL AND expires_at > ? RETURNING role",
        [stamp(), sha256(code), stamp()]
      );
      if (!invite) throw new AccountError(403, "This invite link has expired or was already used. Ask for a new one.");
      role = invite.role === "admin" ? "admin" : "planner";
      const id = await db.insert("INSERT INTO app_users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)", [email, name, passwordHash, role, stamp()]);
      return startSession((await activeAccount(id))!, json(201, { user: { id, name, email, role } }));
    }

    if (action === "reset") {
      const password = cleanPassword(body.password);
      const [invite] = await db.query<{ user_id: number }>(
        "UPDATE app_invites SET used_at = ? WHERE code_hash = ? AND kind = 'reset' AND used_at IS NULL AND expires_at > ? RETURNING user_id",
        [stamp(), sha256(typeof body.code === "string" ? body.code : ""), stamp()]
      );
      const user = invite && await activeAccount(invite.user_id);
      if (!user) throw new AccountError(403, "This reset link has expired or was already used. Ask for a new one.");
      await db.execute("UPDATE app_users SET password_hash = ? WHERE id = ?", [await hashPassword(password), user.id]);
      // A new password signs out every other device.
      await db.execute("DELETE FROM app_sessions WHERE user_id = ?", [user.id]);
      return startSession(user, json(200, { user: publicAccount(user) }));
    }
    return json(404, { error: "Not found." });
  });
}

/* ── /api/team: the owner and admins manage who has access ────────── */
async function teamManager(request: Request) {
  const { user } = await currentAccount(request);
  if (!user) throw new AccountError(401, "Please sign in.");
  if (user.role === "planner") throw new AccountError(403, "Only the owner or an admin can manage the team.");
  return user;
}

/** Creates a one-time link; for "reset", userId is the member whose password is replaced. */
export async function createAccessLink(kind: "invite" | "reset", role: Role, createdBy: number | null, userId: number | null, baseUrl: string) {
  const code = newCode();
  const seconds = kind === "invite" ? INVITE_DAYS * 86400 : RESET_HOURS * 3600;
  const expiresAt = stamp(seconds);
  await getDatabase().query(
    "INSERT INTO app_invites (code_hash, kind, role, user_id, created_by, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [sha256(code), kind, role, userId, createdBy, expiresAt, stamp()]
  );
  return { link: `${baseUrl}/signin?${kind}=${code}`, expiresAt };
}

export function getTeam(request: Request) {
  return handle(async () => {
    const manager = await teamManager(request);
    const db = getDatabase();
    const members = await db.query<Account & { last_active: string | null }>(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, u.disabled_at, MAX(s.last_used_at) AS last_active
       FROM app_users u LEFT JOIN app_sessions s ON s.user_id = u.id
       WHERE u.disabled_at IS NULL GROUP BY u.id ORDER BY u.id`
    );
    const invites = await db.query<{ id: number; role: string; expires_at: string; created_at: string }>(
      "SELECT id, role, expires_at, created_at FROM app_invites WHERE kind = 'invite' AND used_at IS NULL AND expires_at > ? ORDER BY id DESC", [stamp()]
    );
    return json(200, { me: manager.id, myRole: manager.role, members: members.map((member) => ({ ...publicAccount(member), lastActive: member.last_active })), invites });
  });
}

export function postTeam(request: Request) {
  return handle(async () => {
    if (!isSameOrigin(request)) return json(403, { error: "Cross-origin requests are not allowed." });
    const manager = await teamManager(request);
    const body = await readBody(request);
    const db = getDatabase();
    if (body.action === "invite") {
      const role: Role = body.role === "admin" ? "admin" : "planner";
      if (role === "admin" && manager.role !== "owner") throw new AccountError(403, "Only the owner can invite admins.");
      return json(201, await createAccessLink("invite", role, manager.id, null, origin(request)));
    }
    if (body.action === "revoke") {
      await db.execute("DELETE FROM app_invites WHERE id = ? AND kind = 'invite' AND used_at IS NULL", [Number(body.inviteId) || 0]);
      return json(200, { revoked: true });
    }
    const member = await activeAccount(Number(body.userId) || 0);
    if (!member) throw new AccountError(404, "That team member was not found.");
    if (member.id === manager.id) throw new AccountError(400, "You can't change your own access here.");
    if (member.role === "owner" || (member.role === "admin" && manager.role !== "owner")) throw new AccountError(403, "Only the owner can change an admin's access.");
    if (body.action === "reset") return json(201, await createAccessLink("reset", member.role, manager.id, member.id, origin(request)));
    if (body.action === "remove") {
      await db.execute("UPDATE app_users SET disabled_at = ? WHERE id = ?", [stamp(), member.id]);
      await db.execute("DELETE FROM app_sessions WHERE user_id = ?", [member.id]);
      await db.execute("DELETE FROM app_invites WHERE user_id = ?", [member.id]);
      return json(200, { removed: true });
    }
    throw new AccountError(400, "Unknown team action.");
  });
}
