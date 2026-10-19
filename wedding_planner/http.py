"""HTTP adapter shared by the local server and the Vercel Python function."""

import json
import logging
import sqlite3
from urllib.parse import parse_qs, urlparse

from .api import Router, enabled
from .auth import authenticate, legacy_staff
from .domain import ApiError

MAX_PLANNING_BODY = 1_500_000
LOGGER = logging.getLogger(__name__)


def serve(handler, db_factory, local=False, path=None):
    parsed = urlparse(path or handler.path)
    request_path = parsed.path.rstrip("/")
    query = parse_qs(parsed.query)
    host = handler.headers.get("Host", "")
    local_host = urlparse("http://" + host).hostname in {"127.0.0.1", "localhost", "::1"}
    identity = authenticate(handler.headers, local_allowed=local and local_host)
    if request_path == "/api/v1/weddings/capabilities" and handler.command == "GET":
        return handler.send_json(200, {"enabled": enabled(), "authenticated": bool(identity), "canCreate": bool(identity and identity.roles & {"admin", "planner"}), "canManageTemplates": bool(identity and "admin" in identity.roles), "canAccessClients": legacy_staff(identity), "userId": identity.user_id if identity else None, "local": bool(identity and identity.local)})
    try:
        if not enabled():
            raise ApiError(404, "Wedding planning is disabled.")
        if identity is None:
            raise ApiError(401, "Sign in through the host application to use Wedding Planning.")
        origin = handler.headers.get("Origin")
        if handler.command not in {"GET", "HEAD"}:
            if origin and urlparse(origin).netloc != host:
                raise ApiError(403, "Cross-origin changes are not allowed.")
            if handler.headers.get("Sec-Fetch-Site") == "cross-site":
                raise ApiError(403, "Cross-site changes are not allowed.")
        body = None
        if handler.command in {"POST", "PATCH", "PUT"}:
            if handler.headers.get("Content-Type", "").split(";")[0].strip() != "application/json":
                raise ApiError(415, "Use application/json.")
            try:
                length = int(handler.headers.get("Content-Length", "0"))
            except ValueError:
                raise ApiError(400, "Invalid request length.")
            if not 0 < length <= MAX_PLANNING_BODY:
                raise ApiError(413, "The request is empty or too large.")
            try:
                body = json.loads(handler.rfile.read(length))
            except (ValueError, UnicodeError):
                raise ApiError(400, "Use valid JSON.")
        with db_factory() as db:
            # Schema changes are never applied implicitly to a hosted database.
            try:
                installed = db.query_one("SELECT version FROM wp_schema WHERE version=1")
            except Exception:
                raise ApiError(503, "Wedding Planning migration 001 has not been applied to this database.")
            if not installed:
                raise ApiError(503, "Wedding Planning migration 001 has not been applied to this database.")
            status, payload = Router(db, identity, handler.headers).dispatch(handler.command, request_path, query, body)
        return handler.send_json(status, payload)
    except ApiError as error:
        return handler.send_json(error.status, error.payload)
    except sqlite3.IntegrityError:
        return handler.send_json(409, {"error": "A duplicate or invalid linked record was rejected. Refresh before retrying."})
    except Exception as error:
        code = error.args[0].get("C") if error.args and isinstance(error.args[0], dict) else None
        if code in {"23505", "23503", "23514"}:
            return handler.send_json(409, {"error": "A duplicate or invalid linked record was rejected. Refresh before retrying."})
        # Avoid logging connection strings, payloads or patient/client data.
        LOGGER.error("Wedding Planning request failed: %s", type(error).__name__)
        return handler.send_json(503, {"error": "Wedding Planning is temporarily unavailable. Your last saved plan is unchanged."})
