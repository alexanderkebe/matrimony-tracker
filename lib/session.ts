import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed staff sessions. The token format matches wedding_planner.auth.sign_session,
 * so the Python planning API trusts the same cookie.
 */
export const SESSION_COOKIE = "matrimony_session";
export const REFRESH_COOKIE = "matrimony_refresh";
/** Short-lived, so removing a team member or resetting a password takes effect within minutes; the refresh cookie renews it. */
export const SESSION_SECONDS = 10 * 60;
export const REFRESH_SECONDS = 30 * 24 * 60 * 60;

export interface SessionClaims {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  name: string;
  email: string;
  /** The device sign-in (app_sessions row) this token was issued for. */
  sid?: number;
  exp: number;
}

export function sessionSecret(): string | null {
  const secret = process.env.MATRIMONY_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

/** The single organization that owns the couple records. */
export const organizationId = () => process.env.MATRIMONY_LEGACY_ORGANIZATION_ID || "local";

export function signSession(claims: Omit<SessionClaims, "exp">, seconds = SESSION_SECONDS) {
  const secret = sessionSecret();
  if (!secret) throw new Error("MATRIMONY_SESSION_SECRET must be set (at least 32 characters).");
  const payload = Buffer.from(JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + seconds })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function readSession(token: string | null | undefined): SessionClaims | null {
  const secret = sessionSecret();
  if (!secret || !token || token.length > 8000) return null;
  const [payload, signature, extra] = token.split(".");
  if (extra !== undefined || !payload || !/^[a-f0-9]{64}$/.test(signature || "")) return null;
  try {
    const expected = createHmac("sha256", secret).update(payload).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const clock = Date.now() / 1000;
    if (typeof claims.userId !== "string" || typeof claims.organizationId !== "string" || !Array.isArray(claims.roles)) return null;
    if (typeof claims.exp !== "number" || !(claims.exp > clock && claims.exp <= clock + 86400)) return null;
    return { permissions: [], name: "", email: "", ...claims } as SessionClaims;
  } catch {
    return null;
  }
}

/** Whose couples a request may see. The workspace owner also receives rows that predate accounts. */
export interface Scope { userId: string; workspaceOwner: boolean }

export function requestScope(request: Request): Scope | null {
  const claims = requestSession(request);
  return claims ? { userId: claims.userId, workspaceOwner: claims.permissions.includes("workspace_owner") } : null;
}

/** A public code in each account's client-portal links, so a couple's request reaches the planner who sent the link. */
export function portalCode(userId: string) {
  const secret = sessionSecret();
  if (!secret) return "";
  return `${userId.slice(1)}-${createHmac("sha256", secret).update(`portal:${userId}`).digest("base64url").slice(0, 12)}`;
}

/** The account a portal code belongs to, or null for a missing or forged code. */
export function portalCodeOwner(code: unknown) {
  if (typeof code !== "string" || !/^\d{1,9}-[\w-]{12}$/.test(code)) return null;
  const userId = `u${code.split("-")[0]}`;
  const expected = portalCode(userId);
  return expected && code.length === expected.length && timingSafeEqual(Buffer.from(expected), Buffer.from(code)) ? userId : null;
}

export function cookieValue(request: Request, name: string) {
  const entry = (request.headers.get("cookie") || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

/** The session from a bearer token or the session cookie. */
export function requestSession(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return readSession(authorization.startsWith("Bearer ") ? authorization.slice(7) : cookieValue(request, SESSION_COOKIE));
}

export function cookieOptions(seconds: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: seconds };
}

export function serializeCookie(name: string, value: string, seconds: number) {
  const options = cookieOptions(seconds);
  return `${name}=${encodeURIComponent(value)}; Path=${options.path}; Max-Age=${seconds}; HttpOnly; SameSite=Lax${options.secure ? "; Secure" : ""}`;
}
