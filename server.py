"""Python Wedding Planning API and standalone fallback server.

The main app runs on Next.js (`npm run dev`), which proxies /api/v1 here.
Running this file directly still serves the whole app for the Python and
browser test suites. All data lives in Neon Postgres (DATABASE_URL); tests set
MATRIMONY_DB_SCHEMA to work in a temporary schema of their own.
"""

import argparse
import json
import re
import math
import os
import time
from collections import OrderedDict
from contextlib import closing
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.error import URLError
from urllib.parse import parse_qs, unquote, urlencode, urlparse

import pg8000.dbapi
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
PAGE = ROOT / "legacy" / "index.html"
SCHEMA_NAME = re.compile(r"[a-z_][a-z0-9_]{0,62}")
# Tests isolate their data in a temporary schema; the app itself uses the default (public).
DB_SCHEMA = os.environ.get("MATRIMONY_DB_SCHEMA") or None
MAX_BODY = 1_000_000
PHOTON_URL = os.environ.get("MATRIMONY_PHOTON_URL", "https://photon.komoot.io/api/")
PHOTON_REVERSE_URL = os.environ.get("MATRIMONY_PHOTON_REVERSE_URL", PHOTON_URL.rstrip("/").rsplit("/", 1)[0] + "/reverse")
HOME_BBOX = (32.9, 3.4, 48.0, 15.0)
PLACE_CACHE = OrderedDict()
PLACE_LOCK = Lock()
PLACE_LAST_REQUEST = 0.0
CURATED_PLACES = (
    {
        "name": "Sheraton Addis",
        "address": "Addis Ababa, Ethiopia",
        "lat": 9.020308989125988,
        "lon": 38.757427774498815,
        "aliases": ("sher", "sheraton", "sheraton addis", "addis sheraton", "ሸራተን"),
    },
)


def validate_coordinates(lat, lon):
    if not all(math.isfinite(value) for value in (lat, lon)) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise ValueError("Invalid coordinates.")


def photon_features(endpoint, parameters):
    """All public-provider calls share a rate limit, including reverse lookups."""
    global PLACE_LAST_REQUEST
    elapsed = time.monotonic() - PLACE_LAST_REQUEST
    if elapsed < 1:
        time.sleep(1 - elapsed)
    PLACE_LAST_REQUEST = time.monotonic()
    request = Request(f"{endpoint}?{urlencode(parameters)}", headers={"User-Agent": "MatrimonyPlanner/1.0 (local venue search)", "Accept": "application/json"})
    with urlopen(request, timeout=8) as response:
        raw = json.loads(response.read(1_000_001))
    if not isinstance(raw, dict) or not isinstance(raw.get("features"), list):
        raise OSError("Invalid place response.")
    return raw["features"][:12]


def normalize_place(feature):
    if not isinstance(feature, dict):
        return None
    properties = feature.get("properties") or {}
    geometry = feature.get("geometry") or {}
    if not isinstance(properties, dict) or not isinstance(geometry, dict):
        return None
    coordinates = geometry.get("coordinates", [])
    if not isinstance(coordinates, list) or len(coordinates) < 2 or not all(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) for value in coordinates[:2]):
        return None
    if not -180 <= coordinates[0] <= 180 or not -90 <= coordinates[1] <= 90:
        return None
    name = properties.get("name") or properties.get("street") or properties.get("city")
    if not isinstance(name, str) or not name.strip():
        return None
    parts = [properties.get("housenumber"), properties.get("street"), properties.get("district"), properties.get("city"), properties.get("state"), properties.get("country")]
    address = ", ".join(dict.fromkeys(str(part) for part in parts if part and str(part) != name))
    return {"name": name.strip(), "address": address, "lat": coordinates[1], "lon": coordinates[0]}


def cache_places(key, places):
    PLACE_CACHE[key] = (time.monotonic(), places)
    PLACE_CACHE.move_to_end(key)
    if len(PLACE_CACHE) > 100:
        PLACE_CACHE.popitem(last=False)
    return places


def curated_place_suggestions(query):
    """Return verified, built-in matches instantly when the public search is slow."""
    term = query.casefold().strip()
    return [
        {key: value for key, value in place.items() if key != "aliases"}
        for place in CURATED_PLACES
        if any(term in alias.casefold() or alias.casefold().startswith(term) for alias in place["aliases"])
    ]


def search_places(query, lat=9.03, lon=38.75):
    """Teri-style local-first suggestions, without exposing a key or arbitrary URL."""
    query = query.strip()
    if not 2 <= len(query) <= 160:
        raise ValueError("Search must contain between 2 and 160 characters.")
    validate_coordinates(lat, lon)
    key = ("search", query.casefold(), round(lat, 2), round(lon, 2))
    with PLACE_LOCK:
        cached = PLACE_CACHE.get(key)
        if cached and time.monotonic() - cached[0] < 300:
            return cached[1]
        curated = curated_place_suggestions(query)
        if curated:
            return cache_places(key, curated)
        common = {"q": query, "lat": lat, "lon": lon, "limit": 6}
        features, failures = [], []
        # As in Teri, fetch Ethiopia and worldwide matches separately. Keep partial
        # results if one lookup fails, and avoid the second call when local is full.
        for parameters in ({**common, "bbox": ",".join(map(str, HOME_BBOX))}, common):
            try:
                features.extend(photon_features(PHOTON_URL, parameters))
            except (URLError, TimeoutError, OSError, ValueError) as error:
                failures.append(error)
            named_places = [place for feature in features if (place := normalize_place(feature)) and any(character.isalpha() for character in place["name"])]
            if len({(place["name"], place["lat"], place["lon"]) for place in named_places}) >= 6:
                break
        if len(failures) == 2:
            raise OSError("Place provider is unavailable.") from failures[-1]
        ranked, seen = [], set()
        term = query.casefold()
        for order, feature in enumerate(features):
            place = normalize_place(feature)
            if not place or not any(character.isalpha() for character in place["name"]):
                continue
            identity = (place["name"].casefold(), round(place["lat"], 5), round(place["lon"], 5))
            if identity in seen:
                continue
            seen.add(identity)
            properties = feature["properties"]
            name = place["name"].casefold()
            local = HOME_BBOX[0] <= place["lon"] <= HOME_BBOX[2] and HOME_BBOX[1] <= place["lat"] <= HOME_BBOX[3]
            score = (200 if local else 0) + (100 if name == term else 60 if name.startswith(term) else 30 if term in name else 0)
            score += 10 if properties.get("osm_key") in {"tourism", "amenity", "building", "leisure"} else 0
            score += 5 if properties.get("city") else 0
            ranked.append((-score, order, place))
        return cache_places(key, [entry[2] for entry in sorted(ranked, key=lambda entry: entry[:2])[:6]])


def reverse_place(lat, lon):
    validate_coordinates(lat, lon)
    key = ("reverse", round(lat, 5), round(lon, 5))
    with PLACE_LOCK:
        cached = PLACE_CACHE.get(key)
        if cached and time.monotonic() - cached[0] < 300:
            return {**cached[1], "lat": lat, "lon": lon} if cached[1] else None
        features = photon_features(PHOTON_REVERSE_URL, {"lat": lat, "lon": lon, "limit": 1})
        place = next((place for feature in features if (place := normalize_place(feature))), None)
        if place:
            # Save the user's actual position, not the center of a nearby street.
            place = {**place, "lat": lat, "lon": lon}
        return cache_places(key, place)


def get_database_url():
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    for env_name in (".env.local", ".env"):
        env_file = ROOT / env_name
        if env_file.exists():
            try:
                with open(env_file, encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("DATABASE_URL="):
                            return line.split("=", 1)[1].strip("\"'")
            except OSError:
                pass
    raise RuntimeError("DATABASE_URL is not set. Add the Neon connection string to .env.local.")



def _text(value, limit=200):
    return str(value).strip()[:limit] if isinstance(value, (str, int, float)) and not isinstance(value, bool) else ""


def _unique(values):
    return list(dict.fromkeys(value for value in values if value))


def search_summary(plan_json):
    """The searchable parts of a plan (phones, places, fee, notes...). Same rules as lib/records.ts searchSummary()."""
    try:
        plan = json.loads(plan_json)
    except (TypeError, ValueError):
        return None
    details = plan.get("details") if isinstance(plan.get("details"), dict) else {}
    as_list = lambda value: [_text(item) for item in value] if isinstance(value, list) else []
    as_values = lambda value: list(value.values()) if isinstance(value, dict) else []
    locations = [part for place in as_values(details.get("locations")) if isinstance(place, dict) for part in (_text(place.get("name")), _text(place.get("address")))]
    services = plan.get("services") if isinstance(plan.get("services"), dict) else {}
    return {
        "bride_name": _text(details.get("brideName")),
        "groom_name": _text(details.get("groomName")),
        "phones": _unique([_text(details.get("bridePhone"), 40), _text(details.get("groomPhone"), 40)]),
        "places": _unique([_text(details.get("brideAddress")), _text(details.get("groomAddress")), *[_text(venue) for venue in as_values(details.get("venues"))], *locations])[:20],
        "venue_types": _unique(as_list(details.get("eventVenueTypes"))),
        "fee": _text(details.get("totalFee"), 20),
        "event_days": _text(details.get("eventDays"), 5),
        "meals": _unique(as_list(details.get("mealProgram"))),
        "services": [key for key, service in services.items() if isinstance(service, dict) and service.get("selected")][:40],
        "notes": _text(details.get("generalNotes"), 400),
        "language": "am" if plan.get("lang") == "am" else "en",
    }

class PostgresDB:
    def __init__(self, url, schema=None):
        if schema and not SCHEMA_NAME.fullmatch(schema):
            raise ValueError("Invalid MATRIMONY_DB_SCHEMA.")
        self.url = url
        self.schema = schema
        self.conn = None

    def __enter__(self):
        parsed = urlparse(self.url)
        self.conn = pg8000.dbapi.connect(
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path.lstrip("/"),
            ssl_context=True,
            timeout=15
        )
        if self.schema:
            # Each `with` block is one transaction, so LOCAL keeps the setting off pooled connections.
            self.conn.cursor().execute(f'SET LOCAL search_path TO "{self.schema}"')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.conn:
            if exc_type is None:
                self.conn.commit()
            else:
                self.conn.rollback()
            self.conn.close()

    def query(self, sql, params=()):
        sql = sql.replace("?", "%s")
        cur = self.conn.cursor()
        cur.execute(sql, params)
        cols = [desc[0] for desc in cur.description] if cur.description else []
        rows = cur.fetchall() if cur.description else []
        return [dict(zip(cols, row)) for row in rows]

    def query_one(self, sql, params=()):
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def execute(self, sql, params=()):
        sql = sql.replace("?", "%s")
        cur = self.conn.cursor()
        cur.execute(sql, params)
        return cur.rowcount

    def insert(self, sql, params=()):
        sql = sql.replace("?", "%s") + " RETURNING id"
        cur = self.conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        return row[0] if row else None


def get_db():
    return PostgresDB(get_database_url(), DB_SCHEMA)


PORTAL_TABLE = """CREATE TABLE IF NOT EXISTS portal_requests (
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
)"""
PORTAL_MAX_BODY = 200_000
PORTAL_DETAIL_TEXT = ("brideName", "groomName", "bridePhone", "groomPhone", "brideAddress", "groomAddress", "weddingDate", "eventDays", "mediaConsent", "generalNotes")
PORTAL_SUBMISSIONS = {}


def _clip(value, limit):
    return value.strip()[:limit] if isinstance(value, str) else ""


def _text_list(value, limit=20):
    return [item[:60] for item in value if isinstance(item, str)][:limit] if isinstance(value, list) else []


def sanitize_portal_plan(payload):
    """Keeps only what a couple may fill in (no prices). Same rules as lib/portal.ts sanitizePortalPlan()."""
    if not isinstance(payload, dict) or not isinstance(payload.get("details"), dict):
        raise ValueError("Your details are missing.")
    source = payload["details"]
    details = {key: _clip(source.get(key), 2000 if key == "generalNotes" else 200) for key in PORTAL_DETAIL_TEXT}
    for key in ("scopeFullPlanning", "scopeDayOfCoordination"):
        details[key] = source.get(key) is True
    details["mealProgram"] = [meal for meal in _text_list(source.get("mealProgram"), 3) if meal in {"breakfast", "lunch", "dinner"}]
    details["eventVenueTypes"] = _text_list(source.get("eventVenueTypes"), 10)
    venues = source.get("venues") if isinstance(source.get("venues"), dict) else {}
    details["venues"] = {key[:40]: _clip(value, 200) for key, value in list(venues.items())[:10]}
    locations = {}
    for key, place in list((source.get("locations") if isinstance(source.get("locations"), dict) else {}).items())[:20]:
        if not isinstance(place, dict):
            continue
        entry = {"name": _clip(place.get("name"), 200), "address": _clip(place.get("address"), 300)}
        try:
            lat, lon = float(place.get("lat")), float(place.get("lon"))
            if math.isfinite(lat) and math.isfinite(lon) and abs(lat) <= 90 and abs(lon) <= 180:
                entry.update(lat=lat, lon=lon)
        except (TypeError, ValueError):
            pass
        locations[key[:40]] = entry
    details["locations"] = locations
    services = {}
    raw_services = payload.get("services") if isinstance(payload.get("services"), dict) else {}
    for service_id, service in list(raw_services.items())[:40]:
        if not re.fullmatch(r"[a-z][a-z0-9-]{0,39}", service_id) or not isinstance(service, dict) or service.get("selected") is not True:
            continue
        options = {}
        for key, value in list((service.get("options") if isinstance(service.get("options"), dict) else {}).items())[:20]:
            options[key[:40]] = _text_list(value) if isinstance(value, list) else value if isinstance(value, bool) else _clip(value, 300)
        services[service_id] = {"selected": True, "options": options, "notes": _clip(service.get("notes"), 1000),
                                "responsibility": "client" if service.get("responsibility") == "client" else "planning"}
    bride, groom, wedding_date = details["brideName"], details["groomName"], details["weddingDate"]
    if not bride or not groom:
        raise ValueError("Enter both the bride's and groom's names.")
    if not details["bridePhone"] and not details["groomPhone"]:
        raise ValueError("Enter at least one phone number so we can reach you.")
    if wedding_date:
        try:
            if datetime.strptime(wedding_date, "%Y-%m-%d").strftime("%Y-%m-%d") != wedding_date:
                raise ValueError
        except ValueError:
            raise ValueError("Use a valid wedding date.")
    plan = {"lang": "am" if payload.get("lang") == "am" else "en", "details": details, "services": services, "source": "portal"}
    return plan, bride, groom, wedding_date


def portal_allowed(address):
    # Best-effort flood protection: a few submissions per address every 10 minutes.
    now = time.time()
    times = [stamp for stamp in PORTAL_SUBMISSIONS.get(address, []) if now - stamp < 600]
    if len(times) >= 5:
        return False
    PORTAL_SUBMISSIONS[address] = [*times, now]
    return True


def connect():
    return get_db()


def initialize():
    """Creates the record, portal and planning tables (all idempotent) in Neon Postgres."""
    with get_db() as db:
        if DB_SCHEMA:
            db.execute(f'CREATE SCHEMA IF NOT EXISTS "{DB_SCHEMA}"')
        db.execute("""CREATE TABLE IF NOT EXISTS records (
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
        )""")
        db.execute(PORTAL_TABLE)
        # Owning staff account ("u<id>") of each couple record and client request; see lib/db.ts.
        db.execute("ALTER TABLE records ADD COLUMN IF NOT EXISTS owner_user_id TEXT")
        db.execute("ALTER TABLE portal_requests ADD COLUMN IF NOT EXISTS owner_user_id TEXT")
        from wedding_planner.storage import migrate
        migrate(db)


def drop_schema(schema):
    """Removes a temporary test schema and everything in it."""
    if not SCHEMA_NAME.fullmatch(schema or "") or not schema.startswith("test_"):
        raise ValueError("Only temporary test_ schemas can be dropped.")
    with PostgresDB(get_database_url()) as db:
        db.execute(f'DROP SCHEMA IF EXISTS "{schema}" CASCADE')

def first_name(value):
    return value.strip().split()[0] if value.strip() else ""


def validate(payload):
    if not isinstance(payload, dict):
        raise ValueError("A plan is required.")
    details = payload.get("details")
    services = payload.get("services")
    if not isinstance(details, dict) or not isinstance(services, dict):
        raise ValueError("The plan must include details and services.")
    bride = str(details.get("brideName") or "").strip()
    groom = str(details.get("groomName") or "").strip()
    wedding_date = str(details.get("weddingDate") or "").strip()
    if not bride or not groom:
        raise ValueError("Enter both the bride's and groom's names before saving.")
    if len(bride) > 160 or len(groom) > 160 or len(wedding_date) > 30:
        raise ValueError("A name or date is too long.")
    if wedding_date:
        try:
            datetime.strptime(wedding_date, "%Y-%m-%d")
        except ValueError as error:
            raise ValueError("Use a valid wedding date.") from error
    return bride, groom, wedding_date, "am" if payload.get("lang") == "am" else "en"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def end_headers(self):
        # This local app has no build/hot-reload step. Never reuse stale controls
        # after a refresh; leave large, unchanged brand/font assets cacheable.
        if urlparse(self.path).path in {"/", "/index.html", "/app.js", "/pickers.js", "/styles.css", "/weddings.js", "/weddings.css"} or urlparse(self.path).path.startswith("/weddings"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, payload):
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        try:
            self.wfile.write(content)
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            # A fast-typing user may cancel an older search before its response
            # reaches the browser. That is normal autocomplete behavior.
            pass

    def public_file(self):
        request_path = unquote(urlparse(self.path).path)
        target = (PUBLIC / request_path.lstrip("/")).resolve()
        return target in {PUBLIC / name for name in ("app.js", "styles.css", "pickers.js", "weddings.js", "weddings.css")} or target.is_relative_to(PUBLIC / "assets")

    def is_page(self):
        path = urlparse(self.path).path
        return path in {"/", "/index.html", "/weddings", "/portal"} or path.startswith("/weddings/")

    def send_page(self, head_only=False):
        content = PAGE.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if not head_only:
            self.wfile.write(content)

    def planning_request(self, path=None, local=True):
        from wedding_planner.http import serve
        return serve(self, get_db, local=local and self.server.server_address[0] in {"127.0.0.1", "::1"}, path=path)

    def is_planning_api(self):
        path = urlparse(self.path).path
        return path == "/api/v1/weddings" or path.startswith("/api/v1/weddings/") or path == "/api/v1/service-templates" or path.startswith("/api/v1/service-templates/")

    def legacy_authorized(self):
        # Once the host connects sign-in, clients/vendors cannot bypass planning
        # permissions by fetching the older, unscoped agreement-record endpoints.
        if not os.environ.get("MATRIMONY_SESSION_SECRET"):
            return True
        from wedding_planner.auth import authenticate, legacy_staff
        identity = authenticate(self.headers)
        if legacy_staff(identity):
            return True
        self.send_json(403, {"error": "Couple records require a staff session."})
        return False

    def route_id(self):
        path = urlparse(self.path).path
        if path == "/api/records":
            return None
        if path.startswith("/api/records/"):
            suffix = path.removeprefix("/api/records/")
            if suffix.isdecimal() and int(suffix) > 0:
                return int(suffix)
        raise ValueError("Record not found.")

    def same_origin(self):
        if self.headers.get("Sec-Fetch-Site") == "cross-site":
            return False
        origin = self.headers.get("Origin")
        return not origin or urlparse(origin).netloc == self.headers.get("Host")

    def portal_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > PORTAL_MAX_BODY:
            raise ValueError("The form is empty or too large.")
        return json.loads(self.rfile.read(length))

    def portal_submit(self):
        if not self.same_origin():
            return self.send_json(403, {"error": "Cross-origin submissions are not allowed."})
        if not portal_allowed(self.client_address[0]):
            return self.send_json(429, {"error": "Too many submissions. Please wait a few minutes and try again."})
        try:
            plan, bride, groom, wedding_date = sanitize_portal_plan(self.portal_body())
        except (ValueError, json.JSONDecodeError) as error:
            return self.send_json(400, {"error": str(error)})
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")
        details = plan["details"]
        with get_db() as db:
            request_id = db.insert("""INSERT INTO portal_requests (bride_name, groom_name, wedding_date, phone, language,
                plan_json, status, record_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'new', NULL, ?, ?)""",
                (bride, groom, wedding_date, details["bridePhone"] or details["groomPhone"], plan["lang"], json.dumps(plan, ensure_ascii=False), now, now))
        self.send_json(201, {"id": request_id, "reference": f"MBH-RQ-{request_id}"})

    def portal_list(self):
        if not self.legacy_authorized():
            return
        with get_db() as db:
            rows = db.query("""SELECT id, bride_name, groom_name, wedding_date, phone, language, status, record_id, created_at, plan_json
                FROM portal_requests WHERE status <> 'dismissed' ORDER BY id DESC LIMIT 100""")
        requests = []
        for row in rows:
            plan = json.loads(row.pop("plan_json"))
            requests.append({**row, "services": list(plan.get("services", {})), "meals": plan["details"].get("mealProgram", []), "notes": plan["details"].get("generalNotes", "")})
        self.send_json(200, {"requests": requests})

    def portal_action(self, request_id):
        if not self.legacy_authorized():
            return
        if not self.same_origin():
            return self.send_json(403, {"error": "Cross-origin changes are not allowed."})
        try:
            action = self.portal_body().get("action")
        except (ValueError, AttributeError, json.JSONDecodeError):
            return self.send_json(400, {"error": "Choose import or dismiss."})
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with get_db() as db:
            row = db.query_one("SELECT plan_json, record_id, bride_name, groom_name, wedding_date, language FROM portal_requests WHERE id = ?", (request_id,))
            if row is None:
                return self.send_json(404, {"error": "Request not found."})
            if action == "dismiss":
                db.execute("UPDATE portal_requests SET status = 'dismissed', updated_at = ? WHERE id = ?", (now, request_id))
                return self.send_json(200, {"dismissed": True})
            if action != "import":
                return self.send_json(400, {"error": "Choose import or dismiss."})
            if row["record_id"]:
                return self.send_json(200, {"recordId": row["record_id"]})
            record_id = db.insert("""INSERT INTO records (bride_name, groom_name, bride_first_name, groom_first_name,
                wedding_date, language, plan_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (row["bride_name"], row["groom_name"], first_name(row["bride_name"]), first_name(row["groom_name"]),
                 row["wedding_date"], row["language"], row["plan_json"], now, now))
            db.execute("UPDATE portal_requests SET status = 'imported', record_id = ?, updated_at = ? WHERE id = ?", (record_id, now, request_id))
        self.send_json(200, {"recordId": record_id})

    def portal_route(self):
        """None for /api/portal, the id for /api/portal/<id>, False for anything else."""
        path = urlparse(self.path).path
        if path == "/api/portal":
            return None
        suffix = path.removeprefix("/api/portal/")
        return int(suffix) if path.startswith("/api/portal/") and suffix.isdecimal() and int(suffix) > 0 else False

    def do_GET(self):
        if self.is_planning_api():
            return self.planning_request()
        if self.is_page():
            return self.send_page()
        if self.portal_route() is None:
            return self.portal_list()
        if urlparse(self.path).path in {"/api/places", "/api/places/reverse"}:
            query = parse_qs(urlparse(self.path).query)
            reverse = urlparse(self.path).path.endswith("/reverse")
            try:
                lat = float(query.get("lat", [None if reverse else 9.03])[0])
                lon = float(query.get("lon", [None if reverse else 38.75])[0])
                places = reverse_place(lat, lon) if reverse else search_places(query.get("q", [""])[0], lat, lon)
            except (ValueError, TypeError):
                return self.send_json(400, {"error": "Enter a valid place search."})
            except (URLError, TimeoutError, OSError, KeyError):
                return self.send_json(503, {"error": "Place search is temporarily unavailable. You can still enter the venue manually."})
            return self.send_json(200, {"place" if reverse else "places": places, "attribution": "© OpenStreetMap contributors"})
        if not urlparse(self.path).path.startswith("/api/"):
            if not self.public_file():
                self.send_error(404)
                return
            return super().do_GET()
        try:
            record_id = self.route_id()
        except ValueError:
            return self.send_json(404, {"error": "Record not found."})
        if not self.legacy_authorized():
            return
        with get_db() as db:
            if record_id is None:
                rows = db.query("""SELECT id, bride_first_name, groom_first_name,
                    wedding_date, created_at, updated_at, plan_json FROM records ORDER BY updated_at DESC, id DESC""")
                records = [{**{key: value for key, value in row.items() if key != "plan_json"}, "search": search_summary(row["plan_json"])} for row in rows]
                return self.send_json(200, {"records": records})
            row = db.query_one("SELECT id, plan_json FROM records WHERE id = ?", (record_id,))
        if row is None:
            return self.send_json(404, {"error": "Record not found."})
        self.send_json(200, {"id": row["id"], "plan": json.loads(row["plan_json"])})

    def do_HEAD(self):
        if self.is_page():
            return self.send_page(head_only=True)
        if not self.public_file():
            self.send_error(404)
            return
        super().do_HEAD()

    def save_record(self, update=False):
        if not self.legacy_authorized():
            return
        try:
            record_id = self.route_id()
            if update != (record_id is not None):
                raise ValueError("Invalid record URL.")
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_BODY:
                return self.send_json(413, {"error": "Plan is empty or too large."})
            payload = json.loads(self.rfile.read(length))
            bride, groom, wedding_date, language = validate(payload)
        except (ValueError, json.JSONDecodeError) as error:
            return self.send_json(400, {"error": str(error)})
        now = datetime.now(timezone.utc).isoformat(timespec="seconds")
        fields = (bride, groom, first_name(bride), first_name(groom), wedding_date,
                  language, json.dumps(payload, ensure_ascii=False), now)
        with get_db() as db:
            if update:
                rowcount = db.execute("""UPDATE records SET bride_name=?, groom_name=?,
                    bride_first_name=?, groom_first_name=?, wedding_date=?, language=?,
                    plan_json=?, updated_at=? WHERE id=?""", (*fields, record_id))
                if not rowcount:
                    return self.send_json(404, {"error": "Record not found."})
            else:
                record_id = db.insert("""INSERT INTO records
                    (bride_name, groom_name, bride_first_name, groom_first_name,
                     wedding_date, language, plan_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", (*fields, now))
        self.send_json(200 if update else 201, {"id": record_id})

    def do_POST(self):
        if self.is_planning_api():
            return self.planning_request()
        portal = self.portal_route()
        if portal is None:
            return self.portal_submit()
        if portal:
            return self.portal_action(portal)
        self.save_record()

    def do_PUT(self):
        if self.is_planning_api():
            return self.planning_request()
        self.save_record(update=True)

    def do_PATCH(self):
        if self.is_planning_api():
            return self.planning_request()
        return self.send_json(405, {"error": "Method not allowed."})

    def do_DELETE(self):
        if self.is_planning_api():
            return self.planning_request()
        if not self.legacy_authorized():
            return
        try:
            record_id = self.route_id()
            if record_id is None:
                raise ValueError()
        except ValueError:
            return self.send_json(404, {"error": "Record not found."})
        with get_db() as db:
            rowcount = db.execute("DELETE FROM records WHERE id = ?", (record_id,))
        self.send_json(200 if rowcount else 404,
                       {"deleted": bool(rowcount)} if rowcount else {"error": "Record not found."})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Matrimony planner on Neon Postgres (DATABASE_URL)")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    initialize()
    http = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Matrimony planner: http://127.0.0.1:{args.port}", flush=True)
    http.serve_forever()
