import { isSameOrigin, staffDenied } from "./auth";
import { requestScope, type Scope } from "./session";
import { getDatabase } from "./db";
import { json } from "./http";

export { json };

const MAX_BODY = 1_000_000;

class RecordError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || "";
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Same rules as server.py validate(). */
function validate(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new RecordError(400, "A plan is required.");
  const plan = payload as { details?: unknown; services?: unknown; lang?: unknown };
  const details = plan.details as Record<string, unknown> | undefined;
  if (!details || typeof details !== "object" || Array.isArray(details) || !plan.services || typeof plan.services !== "object" || Array.isArray(plan.services)) {
    throw new RecordError(400, "The plan must include details and services.");
  }
  const bride = String(details.brideName ?? "").trim();
  const groom = String(details.groomName ?? "").trim();
  const weddingDate = String(details.weddingDate ?? "").trim();
  if (!bride || !groom) throw new RecordError(400, "Enter both the bride's and groom's names before saving.");
  if (bride.length > 160 || groom.length > 160 || weddingDate.length > 30) throw new RecordError(400, "A name or date is too long.");
  if (weddingDate && !isValidDate(weddingDate)) throw new RecordError(400, "Use a valid wedding date.");
  return { bride, groom, weddingDate, language: plan.lang === "am" ? "am" : "en" };
}

async function readPlan(request: Request) {
  const text = await request.text();
  if (!text || Buffer.byteLength(text) > MAX_BODY) throw new RecordError(413, "Plan is empty or too large.");
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new RecordError(400, "The plan is not valid JSON.");
  }
  return { payload, ...validate(payload) };
}

export function parseRecordId(value: string) {
  return /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

/** Wraps a records handler with the shared auth, origin and error handling. */
export function recordsRoute(handler: (request: Request, scope: Scope) => Promise<Response>) {
  return async (request: Request) => {
    const denied = staffDenied(request);
    if (denied) return denied;
    if (request.method !== "GET" && !isSameOrigin(request)) return json(403, { error: "Cross-origin changes are not allowed." });
    try {
      return await handler(request, requestScope(request)!);
    } catch (error) {
      if (error instanceof RecordError) return json(error.status, { error: error.message });
      console.error("Record API request failed", error);
      return json(500, { error: "Records are temporarily unavailable." });
    }
  };
}

const text = (value: unknown, limit = 200) => (typeof value === "string" || typeof value === "number" ? String(value).trim().slice(0, limit) : "");
const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

/** The searchable parts of a plan, so couples can be found by phone, place, fee or notes. Same rules as server.py search_summary(). */
export function searchSummary(planJson: string) {
  let plan: { details?: Record<string, unknown>; services?: Record<string, { selected?: unknown }>; lang?: unknown };
  try {
    plan = JSON.parse(planJson);
  } catch {
    return null;
  }
  const details = plan.details && typeof plan.details === "object" ? plan.details : {};
  const list = (value: unknown) => (Array.isArray(value) ? value.map((item) => text(item)) : []);
  const objectValues = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? Object.values(value as Record<string, unknown>) : []);
  const locations = objectValues(details.locations).flatMap((place) => (place && typeof place === "object" ? [text((place as Record<string, unknown>).name), text((place as Record<string, unknown>).address)] : []));
  return {
    bride_name: text(details.brideName),
    groom_name: text(details.groomName),
    phones: unique([text(details.bridePhone, 40), text(details.groomPhone, 40)]),
    places: unique([text(details.brideAddress), text(details.groomAddress), ...objectValues(details.venues).map((venue) => text(venue)), ...locations]).slice(0, 20),
    venue_types: unique(list(details.eventVenueTypes)),
    fee: text(details.totalFee, 20),
    event_days: text(details.eventDays, 5),
    meals: unique(list(details.mealProgram)),
    services: Object.entries(plan.services && typeof plan.services === "object" ? plan.services : {}).filter(([, service]) => service?.selected).map(([id]) => id).slice(0, 40),
    notes: text(details.generalNotes, 400),
    language: plan.lang === "am" ? "am" : "en"
  };
}

/** Couples saved before accounts existed belong to the workspace owner. */
export async function claimUnowned(scope: Scope) {
  if (!scope.workspaceOwner) return;
  const db = getDatabase();
  await db.execute("UPDATE records SET owner_user_id = ? WHERE owner_user_id IS NULL", [scope.userId]);
  await db.execute("UPDATE portal_requests SET owner_user_id = ? WHERE owner_user_id IS NULL", [scope.userId]);
}

export async function listRecords(scope: Scope) {
  await claimUnowned(scope);
  const rows = await getDatabase().query<Record<string, unknown> & { plan_json: string }>(
    `SELECT id, bride_first_name, groom_first_name, wedding_date, created_at, updated_at, plan_json
     FROM records WHERE owner_user_id = ? ORDER BY updated_at DESC, id DESC`, [scope.userId]
  );
  const records = rows.map(({ plan_json, ...record }) => ({ ...record, search: searchSummary(plan_json) }));
  return json(200, { records });
}

export async function getRecord(id: number, scope: Scope) {
  await claimUnowned(scope);
  const [row] = await getDatabase().query<{ id: number; plan_json: string }>("SELECT id, plan_json FROM records WHERE id = ? AND owner_user_id = ?", [id, scope.userId]);
  if (!row) return json(404, { error: "Record not found." });
  return json(200, { id: Number(row.id), plan: JSON.parse(row.plan_json) });
}

export async function saveRecord(request: Request, id: number | null, scope: Scope) {
  const { payload, bride, groom, weddingDate, language } = await readPlan(request);
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
  const fields = [bride, groom, firstName(bride), firstName(groom), weddingDate, language, JSON.stringify(payload), now];
  const db = getDatabase();
  if (id !== null) {
    const changed = await db.execute(
      `UPDATE records SET bride_name=?, groom_name=?, bride_first_name=?, groom_first_name=?,
       wedding_date=?, language=?, plan_json=?, updated_at=? WHERE id=? AND owner_user_id=?`,
      [...fields, id, scope.userId]
    );
    return changed ? json(200, { id }) : json(404, { error: "Record not found." });
  }
  const newId = await db.insert(
    `INSERT INTO records (bride_name, groom_name, bride_first_name, groom_first_name,
     wedding_date, language, plan_json, updated_at, created_at, owner_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [...fields, now, scope.userId]
  );
  return json(201, { id: newId });
}

export async function deleteRecord(id: number, scope: Scope) {
  const changed = await getDatabase().execute("DELETE FROM records WHERE id = ? AND owner_user_id = ?", [id, scope.userId]);
  return changed ? json(200, { deleted: true }) : json(404, { error: "Record not found." });
}
