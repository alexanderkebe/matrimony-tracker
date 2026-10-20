import { isSameOrigin, staffDenied } from "./auth";
import { getDatabase } from "./db";
import { json } from "./http";
import { claimUnowned } from "./records";
import { portalCodeOwner, requestScope } from "./session";

/**
 * Client portal: couples submit their own details (no pricing) and the planner
 * reviews them as requests. Same rules as server.py portal_* helpers.
 */
const MAX_BODY = 200_000;
const DETAIL_TEXT = ["brideName", "groomName", "bridePhone", "groomPhone", "brideAddress", "groomAddress", "weddingDate", "eventDays", "mediaConsent", "generalNotes"] as const;
const DETAIL_FLAGS = ["scopeFullPlanning", "scopeDayOfCoordination"] as const;

class PortalError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const clip = (value: unknown, limit: number) => (typeof value === "string" ? value.trim().slice(0, limit) : "");
const textList = (value: unknown, limit = 20) => (Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, limit).map((item) => item.slice(0, 60)) : []);

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Keeps only what a couple may fill in; prices and planner-only fields are dropped. */
export function sanitizePortalPlan(payload: unknown) {
  if (!isObject(payload) || !isObject(payload.details)) throw new PortalError(400, "Your details are missing.");
  const source = payload.details;
  const details: Record<string, unknown> = {};
  for (const key of DETAIL_TEXT) details[key] = clip(source[key], key === "generalNotes" ? 2000 : 200);
  for (const key of DETAIL_FLAGS) details[key] = source[key] === true;
  details.mealProgram = textList(source.mealProgram, 3).filter((meal) => ["breakfast", "lunch", "dinner"].includes(meal));
  details.eventVenueTypes = textList(source.eventVenueTypes, 10);
  details.venues = Object.fromEntries(Object.entries(isObject(source.venues) ? source.venues : {}).slice(0, 10).map(([key, value]) => [key.slice(0, 40), clip(value, 200)]));
  details.locations = Object.fromEntries(Object.entries(isObject(source.locations) ? source.locations : {}).slice(0, 20).flatMap(([key, place]) => {
    if (!isObject(place)) return [];
    const lat = Number(place.lat), lon = Number(place.lon);
    const coords = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon } : {};
    return [[key.slice(0, 40), { name: clip(place.name, 200), address: clip(place.address, 300), ...coords }]];
  }));
  const services: Record<string, { selected: boolean; options: Record<string, unknown>; notes: string }> = {};
  for (const [id, service] of Object.entries(isObject(payload.services) ? payload.services : {}).slice(0, 40)) {
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(id) || !isObject(service) || service.selected !== true) continue;
    const options = Object.fromEntries(Object.entries(isObject(service.options) ? service.options : {}).slice(0, 20).map(([key, value]) => [
      key.slice(0, 40),
      Array.isArray(value) ? textList(value) : typeof value === "boolean" ? value : clip(value, 300)
    ]));
    services[id] = { selected: true, options, notes: clip(service.notes, 1000) };
  }
  const bride = String(details.brideName), groom = String(details.groomName), weddingDate = String(details.weddingDate);
  if (!bride || !groom) throw new PortalError(400, "Enter both the bride's and groom's names.");
  if (!details.bridePhone && !details.groomPhone) throw new PortalError(400, "Enter at least one phone number so we can reach you.");
  if (weddingDate && !isValidDate(weddingDate)) throw new PortalError(400, "Use a valid wedding date.");
  return { plan: { lang: payload.lang === "am" ? "am" : "en", details, services, source: "portal" }, bride, groom, weddingDate };
}

// Best-effort flood protection for the public form: a few submissions per address every 10 minutes.
const recentSubmissions = new Map<string, number[]>();
function allowSubmission(request: Request) {
  const address = (request.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  const now = Date.now();
  const times = (recentSubmissions.get(address) || []).filter((time) => now - time < 600_000);
  if (times.length >= 5) return false;
  recentSubmissions.set(address, [...times, now]);
  return true;
}

const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
const firstName = (value: string) => value.trim().split(/\s+/)[0] || "";

async function readJson(request: Request) {
  const text = await request.text();
  if (!text || Buffer.byteLength(text) > MAX_BODY) throw new PortalError(413, "The form is empty or too large.");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new PortalError(400, "The form could not be read.");
  }
}

function handle(handler: () => Promise<Response>) {
  return handler().catch((error) => {
    if (error instanceof PortalError) return json(error.status, { error: error.message });
    console.error("Portal request failed", error);
    return json(500, { error: "Requests are temporarily unavailable." });
  });
}

/** Public: a couple submits their details. */
export function submitPortalRequest(request: Request) {
  return handle(async () => {
    if (!isSameOrigin(request)) return json(403, { error: "Cross-origin submissions are not allowed." });
    if (!allowSubmission(request)) return json(429, { error: "Too many submissions. Please wait a few minutes and try again." });
    const body = await readJson(request);
    const { plan, bride, groom, weddingDate } = sanitizePortalPlan(body);
    const details = plan.details as Record<string, string>;
    // The planner who sent the link receives the request; without a valid link code it goes to the workspace owner.
    const owner = portalCodeOwner(isObject(body) ? body.planner : null);
    const stamp = now();
    const id = await getDatabase().insert(
      `INSERT INTO portal_requests (bride_name, groom_name, wedding_date, phone, language, plan_json, status, record_id, created_at, updated_at, owner_user_id)
       VALUES (?, ?, ?, ?, ?, ?, 'new', NULL, ?, ?, ?)`,
      [bride, groom, weddingDate, details.bridePhone || details.groomPhone, plan.lang, JSON.stringify(plan), stamp, stamp, owner]
    );
    return json(201, { id, reference: `MBH-RQ-${id}` });
  });
}

/** Staff: open requests for the dashboard, newest first. */
export function listPortalRequests(request: Request) {
  return handle(async () => {
    const denied = staffDenied(request, "Client requests");
    if (denied) return denied;
    const scope = requestScope(request)!;
    await claimUnowned(scope);
    const rows = await getDatabase().query<Record<string, unknown> & { plan_json: string }>(
      `SELECT id, bride_name, groom_name, wedding_date, phone, language, status, record_id, created_at, plan_json
       FROM portal_requests WHERE status <> 'dismissed' AND owner_user_id = ? ORDER BY id DESC LIMIT 100`, [scope.userId]
    );
    const requests = rows.map(({ plan_json, ...row }) => {
      const plan = JSON.parse(plan_json) as { details?: { mealProgram?: string[]; generalNotes?: string }; services?: Record<string, unknown> };
      return { ...row, record_id: row.record_id === null ? null : Number(row.record_id), services: Object.keys(plan.services || {}), meals: plan.details?.mealProgram || [], notes: plan.details?.generalNotes || "" };
    });
    return json(200, { requests });
  });
}

/** Staff: turn a request into a planner record (once), or dismiss it. */
export function actOnPortalRequest(request: Request, id: number) {
  return handle(async () => {
    const denied = staffDenied(request, "Client requests");
    if (denied) return denied;
    if (!isSameOrigin(request)) return json(403, { error: "Cross-origin changes are not allowed." });
    const body = await readJson(request);
    const action = isObject(body) ? body.action : null;
    const scope = requestScope(request)!;
    const db = getDatabase();
    const [row] = await db.query<{ plan_json: string; record_id: number | null; bride_name: string; groom_name: string; wedding_date: string; language: string }>(
      "SELECT plan_json, record_id, bride_name, groom_name, wedding_date, language FROM portal_requests WHERE id = ? AND owner_user_id = ?", [id, scope.userId]
    );
    if (!row) return json(404, { error: "Request not found." });
    if (action === "dismiss") {
      await db.execute("UPDATE portal_requests SET status = 'dismissed', updated_at = ? WHERE id = ?", [now(), id]);
      return json(200, { dismissed: true });
    }
    if (action !== "import") return json(400, { error: "Choose import or dismiss." });
    if (row.record_id) return json(200, { recordId: Number(row.record_id) });
    const stamp = now();
    const recordId = await db.insert(
      `INSERT INTO records (bride_name, groom_name, bride_first_name, groom_first_name, wedding_date, language, plan_json, created_at, updated_at, owner_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.bride_name, row.groom_name, firstName(row.bride_name), firstName(row.groom_name), row.wedding_date, row.language, row.plan_json, stamp, stamp, scope.userId]
    );
    await db.execute("UPDATE portal_requests SET status = 'imported', record_id = ?, updated_at = ? WHERE id = ?", [recordId, stamp, id]);
    return json(200, { recordId });
  });
}
