"""Local Matrimony planner server with SQLite record storage."""

import argparse
import json
import math
import os
import sqlite3
import time
from collections import OrderedDict
from contextlib import closing
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.error import URLError
from urllib.parse import parse_qs, unquote, urlencode, urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "data" / "matrimony.sqlite3"
MAX_BODY = 1_000_000
PHOTON_URL = os.environ.get("MATRIMONY_PHOTON_URL", "https://photon.komoot.io/api/")
PLACE_CACHE = OrderedDict()
PLACE_LOCK = Lock()
PLACE_LAST_REQUEST = 0.0


def search_places(query, lat=9.03, lon=38.75):
    """Small, bounded proxy: no browser keys, no arbitrary upstream URLs."""
    global PLACE_LAST_REQUEST
    query = query.strip()
    if not 2 <= len(query) <= 160:
        raise ValueError("Search must contain between 2 and 160 characters.")
    if not all(math.isfinite(value) for value in (lat, lon)) or not -90 <= lat <= 90 or not -180 <= lon <= 180:
        raise ValueError("Invalid coordinates.")
    key = (query.casefold(), round(lat, 2), round(lon, 2))
    with PLACE_LOCK:
        cached = PLACE_CACHE.get(key)
        if cached and time.monotonic() - cached[0] < 300:
            return cached[1]
        # The public demo is rate-limited. Search only on submission and cache results.
        elapsed = time.monotonic() - PLACE_LAST_REQUEST
        if elapsed < 1:
            time.sleep(1 - elapsed)
        PLACE_LAST_REQUEST = time.monotonic()
        parameters = urlencode({"q": query, "lat": lat, "lon": lon, "limit": 6})
        request = Request(f"{PHOTON_URL}?{parameters}", headers={"User-Agent": "MatrimonyPlanner/1.0 (local venue search)", "Accept": "application/json"})
        with urlopen(request, timeout=10) as response:
            raw = json.loads(response.read(1_000_001))
        places = []
        for feature in raw.get("features", [])[:6]:
            properties = feature.get("properties", {})
            coordinates = feature.get("geometry", {}).get("coordinates", [])
            if len(coordinates) < 2 or not all(isinstance(value, (int, float)) and math.isfinite(value) for value in coordinates[:2]):
                continue
            if not -180 <= coordinates[0] <= 180 or not -90 <= coordinates[1] <= 90:
                continue
            name = properties.get("name") or properties.get("street") or properties.get("city") or query
            parts = [properties.get("housenumber"), properties.get("street"), properties.get("district"), properties.get("city"), properties.get("state"), properties.get("country")]
            address = ", ".join(dict.fromkeys(str(part) for part in parts if part and str(part) != str(name)))
            places.append({"name": str(name), "address": address, "lat": coordinates[1], "lon": coordinates[0]})
        PLACE_CACHE[key] = (time.monotonic(), places)
        if len(PLACE_CACHE) > 100:
            PLACE_CACHE.popitem(last=False)
        return places


def connect():
    DB_PATH.parent.mkdir(exist_ok=True)
    database = sqlite3.connect(DB_PATH, timeout=10)
    database.row_factory = sqlite3.Row
    database.execute("PRAGMA busy_timeout = 10000")
    return database


def initialize():
    with closing(connect()) as database, database:
        database.execute("""CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, payload):
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(content)

    def public_file(self):
        request_path = unquote(urlparse(self.path).path)
        if request_path == "/":
            return True
        target = (ROOT / request_path.lstrip("/")).resolve()
        return target in {ROOT / name for name in ("index.html", "app.js", "styles.css", "pickers.js")} or target.is_relative_to(ROOT / "assets")

    def route_id(self):
        path = urlparse(self.path).path
        if path == "/api/records":
            return None
        if path.startswith("/api/records/"):
            suffix = path.removeprefix("/api/records/")
            if suffix.isdecimal() and int(suffix) > 0:
                return int(suffix)
        raise ValueError("Record not found.")

    def do_GET(self):
        if urlparse(self.path).path == "/api/places":
            query = parse_qs(urlparse(self.path).query)
            try:
                places = search_places(query.get("q", [""])[0], float(query.get("lat", [9.03])[0]), float(query.get("lon", [38.75])[0]))
            except (ValueError, TypeError):
                return self.send_json(400, {"error": "Enter a valid place search."})
            except (URLError, TimeoutError, OSError, KeyError):
                return self.send_json(503, {"error": "Place search is temporarily unavailable. You can still enter the venue manually."})
            return self.send_json(200, {"places": places, "attribution": "© OpenStreetMap contributors"})
        if not urlparse(self.path).path.startswith("/api/"):
            if not self.public_file():
                self.send_error(404)
                return
            return super().do_GET()
        try:
            record_id = self.route_id()
        except ValueError:
            return self.send_json(404, {"error": "Record not found."})
        with closing(connect()) as database, database:
            if record_id is None:
                rows = database.execute("""SELECT id, bride_first_name, groom_first_name,
                    wedding_date, created_at, updated_at FROM records ORDER BY updated_at DESC, id DESC""").fetchall()
                return self.send_json(200, {"records": [dict(row) for row in rows]})
            row = database.execute("SELECT id, plan_json FROM records WHERE id = ?", (record_id,)).fetchone()
        if row is None:
            return self.send_json(404, {"error": "Record not found."})
        self.send_json(200, {"id": row["id"], "plan": json.loads(row["plan_json"])})

    def do_HEAD(self):
        if not self.public_file():
            self.send_error(404)
            return
        super().do_HEAD()

    def save_record(self, update=False):
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
        with closing(connect()) as database, database:
            if update:
                cursor = database.execute("""UPDATE records SET bride_name=?, groom_name=?,
                    bride_first_name=?, groom_first_name=?, wedding_date=?, language=?,
                    plan_json=?, updated_at=? WHERE id=?""", (*fields, record_id))
                if not cursor.rowcount:
                    return self.send_json(404, {"error": "Record not found."})
            else:
                cursor = database.execute("""INSERT INTO records
                    (bride_name, groom_name, bride_first_name, groom_first_name,
                     wedding_date, language, plan_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", (*fields, now))
                record_id = cursor.lastrowid
        self.send_json(200 if update else 201, {"id": record_id})

    def do_POST(self):
        self.save_record()

    def do_PUT(self):
        self.save_record(update=True)

    def do_DELETE(self):
        try:
            record_id = self.route_id()
            if record_id is None:
                raise ValueError()
        except ValueError:
            return self.send_json(404, {"error": "Record not found."})
        with closing(connect()) as database, database:
            cursor = database.execute("DELETE FROM records WHERE id = ?", (record_id,))
        self.send_json(200 if cursor.rowcount else 404,
                       {"deleted": bool(cursor.rowcount)} if cursor.rowcount else {"error": "Record not found."})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Matrimony planner with local SQLite records")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    initialize()
    http = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Matrimony planner: http://127.0.0.1:{args.port}", flush=True)
    http.serve_forever()
