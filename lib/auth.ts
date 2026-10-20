import { json } from "./http";
import { organizationId, requestSession, sessionSecret } from "./session";

/**
 * Mirrors wedding_planner.auth.legacy_staff: only signed-in admin/planner
 * sessions of the owning organization may use the couple-record endpoints.
 */
export function isLegacyStaff(request: Request): boolean {
  const claims = requestSession(request);
  if (!claims) return false;
  const tenantAllowed = claims.organizationId === organizationId() || claims.permissions.includes("legacy_records");
  return tenantAllowed && claims.roles.some((role) => role === "admin" || role === "planner");
}

/** A 401 (sign in) or 403 (not allowed) response, or null when the request may continue. */
export function staffDenied(request: Request, what = "Couple records"): Response | null {
  if (!sessionSecret()) return json(503, { error: "Sign-in is not configured on this server (MATRIMONY_SESSION_SECRET)." });
  if (!requestSession(request)) return json(401, { error: "Please sign in.", signIn: true });
  return isLegacyStaff(request) ? null : json(403, { error: `${what} require a staff account.` });
}

/** Rejects state-changing requests sent from another site. */
export function isSameOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
