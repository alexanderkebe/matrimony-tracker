"""Pure scheduling, state, validation and readiness rules shared by every API deployment."""

import calendar
import hashlib
from datetime import date, datetime, timedelta, timezone

from .storage import encode

MAX_MONEY = 9_000_000_000_000
VISIBILITIES = {"internal", "shared", "client", "vendor", "church", "restricted"}
WEDDING_TRANSITIONS = {
    "draft": {"planning", "cancelled"}, "planning": {"final_review", "cancelled"},
    "final_review": {"planning", "event_live", "cancelled"}, "event_live": {"completed", "cancelled"},
    "completed": {"archived"}, "archived": set(), "cancelled": {"archived"},
}
BOOKING_TRANSITIONS = {
    "shortlisted": {"quoted", "rejected", "cancelled"}, "quoted": {"selected", "rejected", "cancelled"},
    "selected": {"contracted", "cancelled"}, "contracted": {"confirmed", "cancelled"},
    "confirmed": {"delivered", "cancelled"}, "delivered": {"closed"}, "closed": set(),
    "rejected": {"shortlisted"}, "cancelled": set(),
}
SERVICE_TRANSITIONS = {
    "not_started": {"in_progress", "awaiting_approval", "cancelled", "not_applicable"},
    "in_progress": {"awaiting_approval", "cancelled", "not_applicable"},
    "awaiting_approval": {"in_progress", "cancelled", "not_applicable"},
    "confirmed": {"in_progress", "cancelled", "not_applicable"}, "completed": set(),
    "cancelled": {"not_started"}, "not_applicable": {"not_started"},
}


class ApiError(Exception):
    def __init__(self, status, message, **details):
        super().__init__(message)
        self.status, self.payload = status, {"error": message, **details}


def require(condition, message, status=400, **details):
    if not condition:
        raise ApiError(status, message, **details)


def text(value, label, required=False, limit=2000):
    require(isinstance(value, str), f"{label} must be text.")
    value = value.strip()
    require(len(value) <= limit and (bool(value) or not required), f"Enter a valid {label.lower()} (up to {limit} characters).")
    return value


def integer(value, label, maximum=MAX_MONEY):
    require(type(value) is int and 0 <= value <= maximum, f"{label} must be a nonnegative whole number.")
    return value


def civil_date(value, label="Date"):
    if value in (None, ""):
        return None
    require(isinstance(value, str), f"{label} must be an ISO date.")
    try:
        parsed = date.fromisoformat(value)
        require(parsed.isoformat() == value and 1900 <= parsed.year <= 2200, f"Use a valid {label.lower()} (YYYY-MM-DD).")
        return value
    except ValueError:
        raise ApiError(400, f"Use a valid {label.lower()} (YYYY-MM-DD).")


def instant(value, label="Time"):
    if value in (None, ""):
        return None
    require(isinstance(value, str), f"{label} must be a timestamp with a timezone.")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        require(parsed.tzinfo is not None and 1900 <= parsed.year <= 2200, f"{label} needs an explicit timezone.")
        return parsed.astimezone(timezone.utc).isoformat(timespec="seconds")
    except ValueError:
        raise ApiError(400, f"Use a valid {label.lower()} with a timezone.")


def add_months(value, months):
    value = date.fromisoformat(value)
    total = value.year * 12 + value.month - 1 + months
    year, month = total // 12, total % 12 + 1
    return date(year, month, min(value.day, calendar.monthrange(year, month)[1])).isoformat()


def relative_date(wedding_date, offset, aftercare=False):
    if not wedding_date:
        return None
    if aftercare and offset == 180:
        return add_months(wedding_date, 6)
    return (date.fromisoformat(wedding_date) + timedelta(days=offset)).isoformat()


def due_time(wedding_date, offset, aftercare=False):
    target = relative_date(wedding_date, offset, aftercare)
    # 09:00 in Addis Ababa; UTC persistence is independent of the server timezone.
    return target + "T06:00:00+00:00" if target else None


def overdue(value, clock=None):
    if not value:
        return False
    clock = clock or datetime.now(timezone.utc)
    if "T" in value:
        return datetime.fromisoformat(value) < clock
    return value < (clock + timedelta(hours=3)).date().isoformat()


def active_services(services):
    return [service for service in services if service.get("enabled", True) and service["status"] not in {"cancelled", "not_applicable"} and not service.get("aftercare")]


def readiness(services, tasks, milestones, issues, dependencies=(), clock=None):
    clock = clock or datetime.now(timezone.utc)
    active = active_services(services)
    service_ids = {service["id"] for service in active}
    required = [task for task in tasks if task.get("required", True) and task["status"] != "cancelled" and
                (not task.get("serviceId") or task["serviceId"] in service_ids) and not task.get("aftercare")]
    total = sum(3 if task.get("priority") == "critical" else 1 for task in required)
    completed = sum(3 if task.get("priority") == "critical" else 1 for task in required if task["status"] == "done")
    blockers = []
    for milestone in milestones:
        if milestone.get("required", True) and milestone["status"] != "verified" and (not milestone.get("serviceId") or milestone["serviceId"] in service_ids):
            blockers.append({"id": milestone["id"], "type": "milestone", "title": milestone["title"], "serviceId": milestone.get("serviceId")})
    for service in active:
        if service.get("blockerSummary"):
            blockers.append({"id": service["id"], "type": "service", "title": service["blockerSummary"], "serviceId": service["id"]})
    for task in required:
        if task["status"] == "blocked" or (task.get("priority") == "critical" and task["status"] != "done" and task.get("dueAt") and datetime.fromisoformat(task["dueAt"]) < clock):
            blockers.append({"id": task["id"], "type": "task", "title": task["title"], "serviceId": task.get("serviceId")})
    for issue in issues:
        if issue.get("severity") == "critical" and issue["status"] != "resolved" and (not issue.get("serviceId") or issue["serviceId"] in service_ids):
            blockers.append({"id": issue["id"], "type": "issue", "title": issue["title"], "serviceId": issue.get("serviceId")})
    by_id = {task["id"]: task for task in tasks}
    for edge in dependencies:
        first, second = by_id.get(edge["predecessor_id"]), by_id.get(edge["successor_id"])
        if first and second and second["status"] not in {"done", "cancelled"} and second.get("serviceId") in service_ids and first.get("dueAt") and second.get("dueAt") and first["dueAt"] > second["dueAt"]:
            blockers.append({"id": second["id"], "type": "dependency", "title": f"{second['title']}: prerequisite is scheduled later", "serviceId": second.get("serviceId")})
    confirmed = sum(service["status"] in {"confirmed", "completed"} and not service.get("blockerSummary") for service in active)
    return {"taskProgress": round(100 * completed / total) if total else 0, "servicesConfirmed": confirmed,
            "activeServices": len(active), "criticalBlockers": len(blockers), "blockers": blockers,
            "ready": bool(active) and confirmed == len(active) and not blockers,
            "requiredWeight": total, "completedWeight": completed,
            "aftercareServices": sum(service.get("aftercare", False) and service.get("enabled", True) for service in services)}


def budget_summary(wedding, lines, payments):
    live_payments = [p for p in payments if p["status"] != "cancelled"]
    estimated = sum(line.get("estimatedMinor", 0) for line in lines)
    committed = sum(line.get("committedMinor", 0) for line in lines)
    actual = sum(line.get("actualMinor", 0) for line in lines)
    paid = sum(payment["amountMinor"] for payment in live_payments if payment["status"] == "paid")
    return {"budgetMinor": wedding.get("budgetMinor", 0), "estimatedMinor": estimated, "committedMinor": committed,
            "actualMinor": actual, "paidMinor": paid, "outstandingMinor": max(0, committed - paid),
            "remainingMinor": wedding.get("budgetMinor", 0) - max(committed, actual), "currency": "ETB"}


def would_cycle(edges, predecessor, successor):
    if predecessor == successor:
        return True
    graph = {}
    for edge in edges:
        graph.setdefault(edge["predecessor_id"], []).append(edge["successor_id"])
    pending, visited = [successor], set()
    while pending:
        node = pending.pop()
        if node == predecessor:
            return True
        if node not in visited:
            visited.add(node)
            pending.extend(graph.get(node, []))
    return False


def collision(candidate, events):
    matches = []
    for event in events:
        if event["id"] == candidate.get("id") or event["status"] == "skipped":
            continue
        shared = []
        for key, label in (("vendorResourceId", "Vendor"), ("assetId", "Venue / asset"), ("ownerUserId", "Owner")):
            if candidate.get(key) and candidate.get(key) == event.get(key):
                shared.append(label)
        if shared and event["startAt"] < candidate["endAt"] and candidate["startAt"] < event["endAt"]:
            matches.append({"eventId": event["id"], "weddingId": event["weddingId"], "title": event["title"],
                            "startAt": event["startAt"], "endAt": event["endAt"], "resources": shared})
    return matches


def digest(value):
    return hashlib.sha256(encode(value).encode()).hexdigest()
