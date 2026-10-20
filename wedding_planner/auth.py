"""Small host-session adapter, not a second account or password system."""

import base64
import hashlib
import hmac
import json
import os
import time
from dataclasses import dataclass, field
from http.cookies import SimpleCookie

ROLES = {"admin", "planner", "coordinator", "couple", "vendor", "church"}


@dataclass
class Identity:
    user_id: str
    organization_id: str
    roles: set = field(default_factory=set)
    permissions: set = field(default_factory=set)
    local: bool = False
    # Signed-in app accounts only ever see weddings and couple records they registered
    # (or were added to); the admin role no longer reaches other accounts' weddings.
    isolated: bool = False


def record_scope(identity):
    """SQL condition limiting couple records to the signed-in account's own."""
    if identity and identity.isolated:
        return " AND owner_user_id=?", (identity.user_id,)
    return "", ()


def legacy_staff(identity):
    """The legacy records table is single-tenant; its owning org must be explicit."""
    return bool(identity and identity.roles & {"admin", "planner"} and (
        identity.local or identity.organization_id == os.environ.get("MATRIMONY_LEGACY_ORGANIZATION_ID", "local") or "legacy_records" in identity.permissions))


def sign_session(claims, secret):
    """Called by the trusted host after its existing authentication succeeds."""
    raw = json.dumps(claims, separators=(",", ":")).encode()
    payload = base64.urlsafe_b64encode(raw).decode().rstrip("=")
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def authenticate(headers, local_allowed=False):
    secret = os.environ.get("MATRIMONY_SESSION_SECRET", "")
    token = ""
    authorization = headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        cookies = SimpleCookie()
        try:
            cookies.load(headers.get("Cookie", ""))
            if "matrimony_session" in cookies:
                token = cookies["matrimony_session"].value
        except Exception:
            return None
    if token:
        if len(secret) < 32 or len(token) > 8000:
            return None
        try:
            payload, signature = token.split(".")
            expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected):
                return None
            claims = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
            if not isinstance(claims, dict) or type(claims.get("exp")) not in (int, float) or not time.time() < claims["exp"] <= time.time() + 86400:
                return None
            user_id, org = claims["userId"], claims["organizationId"]
            roles = claims.get("roles", [])
            permissions = claims.get("permissions", [])
            if not all(isinstance(value, str) and 0 < len(value) <= 160 for value in (user_id, org)):
                return None
            if not isinstance(roles, list) or not set(roles) <= ROLES or not isinstance(permissions, list) or not all(isinstance(p, str) for p in permissions):
                return None
            return Identity(user_id, org, set(roles), set(permissions), isolated=True)
        except (ValueError, KeyError, TypeError):
            return None
    if local_allowed and not secret and os.environ.get("MATRIMONY_LOCAL_PLANNER", "1") == "1":
        return Identity("local-planner", "local", {"admin", "planner"}, local=True)
    return None
