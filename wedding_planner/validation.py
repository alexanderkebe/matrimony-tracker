"""Allowlisted resource inputs. Identity, audit fields and versions are never mass-assigned."""

from .domain import VISIBILITIES, civil_date, instant, integer, require, text

FIELDS = {
    "services": {"name", "nameAm", "category", "ownerUserId", "enabled", "status", "blockerSummary", "visibility", "targetDate", "reason"},
    "tasks": {"title", "titleAm", "description", "ownerUserId", "serviceId", "status", "priority", "required", "approvalRequired", "dueAt", "startAt", "visibility", "proofFileId", "reason"},
    "milestones": {"title", "serviceId", "ownerUserId", "dueAt", "status", "required", "evidence", "visibility", "reason"},
    "events": {"title", "serviceId", "taskId", "ownerUserId", "backupOwnerUserId", "startAt", "endAt", "location", "assetId", "vendorId", "eventType", "status", "cue", "externalConfirmed", "visibility", "overrideReason", "allDay"},
    "vendors": {"name", "serviceId", "ownerUserId", "category", "contactName", "phone", "email", "locality", "status", "quotedMinor", "contractedMinor", "contractFileId", "arrivalAt", "departureAt", "arrivedAt", "bookedDate", "visibility", "backupContact", "externalVendorId", "reason"},
    "budget_lines": {"label", "serviceId", "vendorAssignmentId", "ownerUserId", "category", "estimatedMinor", "committedMinor", "actualMinor", "visibility", "clientAmountMinor", "reason"},
    "payments": {"label", "serviceId", "vendorAssignmentId", "budgetLineId", "amountMinor", "dueOn", "status", "externalTransactionId", "receiptFileId", "evidence", "relativeOffsetDays", "reason"},
    "documents": {"title", "serviceId", "ownerUserId", "requestedFromUserId", "dueAt", "visibility", "required", "reviewerRole", "type"},
    "guests": {"displayName", "household", "partySize", "rsvpStatus", "dietarySummary", "table", "ownerUserId", "visibility"},
    "issues": {"title", "serviceId", "ownerUserId", "severity", "status", "action", "resolution", "visibility"},
    "boards": {"title", "serviceId", "ownerUserId", "palette", "notes", "documentRequestId", "visibility"},
    "notes": {"title", "serviceId", "ownerUserId", "notes", "visibility"},
    "notifications": {"status", "failureReason"},
}
DEFAULTS = {
    "services": {"status": "not_started", "enabled": True, "category": "logistics", "blockerSummary": ""},
    "tasks": {"status": "todo", "priority": "normal", "required": True, "approvalRequired": False, "scheduleMode": "manual"},
    "milestones": {"status": "todo", "required": True, "scheduleMode": "manual"},
    "events": {"status": "not_started", "eventType": "appointment", "externalConfirmed": False, "allDay": False},
    "vendors": {"status": "shortlisted", "quotedMinor": 0, "contractedMinor": 0},
    "budget_lines": {"status": "active", "estimatedMinor": 0, "committedMinor": 0, "actualMinor": 0, "clientAmountMinor": 0},
    "payments": {"status": "pending"}, "documents": {"status": "requested", "required": False, "reviewerRole": "planner", "type": "deliverable"},
    "guests": {"status": "active", "partySize": 1, "rsvpStatus": "pending"}, "issues": {"status": "open", "severity": "normal"},
    "boards": {"status": "draft"}, "notes": {"status": "active"},
}
STATUSES = {
    "services": {"not_started", "in_progress", "awaiting_approval", "confirmed", "completed", "cancelled", "not_applicable"},
    "tasks": {"todo", "in_progress", "blocked", "done", "cancelled"}, "milestones": {"todo", "verified"},
    "events": {"not_started", "underway", "done", "delayed", "skipped"},
    "vendors": {"shortlisted", "quoted", "selected", "contracted", "confirmed", "delivered", "closed", "rejected", "cancelled"},
    "payments": {"pending", "paid", "failed", "cancelled"}, "issues": {"open", "investigating", "resolved"},
    "notifications": {"pending", "delivered", "failed"},
}
TITLE_FIELDS = {"services": "name", "vendors": "name", "budget_lines": "label", "payments": "label", "guests": "displayName"}


def resource(collection, body, previous=None):
    require(isinstance(body, dict), "A JSON object is required.")
    allowed = FIELDS[collection] | {"version", "previewToken"}
    require(not (set(body) - allowed), "Unrecognized fields.", fields=sorted(set(body) - allowed))
    value = {**(previous or DEFAULTS.get(collection, {}))}
    if previous is None:
        value["visibility"] = "internal"
    for key in FIELDS[collection] & body.keys():
        val = body[key]
        if key.endswith("Minor") or key == "partySize":
            val = integer(val, key, 100 if key == "partySize" else 9_000_000_000_000)
            if key == "partySize":
                require(val >= 1, "Party size must be at least one.")
        elif key in {"enabled", "required", "approvalRequired", "externalConfirmed", "allDay"}:
            require(type(val) is bool, f"{key} must be true or false.")
        elif key.endswith("At"):
            val = instant(val, key)
        elif key in {"targetDate", "bookedDate", "dueOn"}:
            val = civil_date(val, key)
        elif key == "relativeOffsetDays":
            require(type(val) is int and -3650 <= val <= 3650, "Offset must be between -3650 and 3650 days.")
        elif key.endswith("Id"):
            val = text(val, key, limit=160) if val else None
        else:
            val = text(val, key, limit=4000 if key in {"notes", "description", "action", "resolution"} else 400)
        value[key] = val
    title_key = TITLE_FIELDS.get(collection, "title")
    if collection != "notifications":
        require(bool(value.get(title_key)), f"Enter a {title_key}.")
    require(value.get("visibility", "internal") in VISIBILITIES, "Choose a valid visibility.")
    if collection in STATUSES:
        require(value["status"] in STATUSES[collection], "Choose a valid status.")
    if collection == "tasks":
        require(value["priority"] in {"low", "normal", "high", "critical"}, "Choose a valid priority.")
        if value.get("startAt") and value.get("dueAt"):
            require(value["startAt"] <= value["dueAt"], "A task cannot finish before it starts.")
    if collection == "events":
        require(value.get("startAt") and value.get("endAt") and value["startAt"] < value["endAt"], "Event end must be after its start.")
        require(value["eventType"] in {"appointment", "milestone", "booking", "run_sheet", "rehearsal"}, "Choose a valid event type.")
    if collection == "guests":
        require(value["rsvpStatus"] in {"pending", "accepted", "declined"}, "Choose a valid RSVP status.")
    if collection == "issues":
        require(value["severity"] in {"low", "normal", "high", "critical"}, "Choose a valid severity.")
        if value["status"] == "resolved":
            require(bool(value.get("resolution")), "Record the resolution before closing an issue.")
    if collection == "documents":
        require(value["reviewerRole"] in {"planner", "couple", "church"}, "Choose a valid approver.")
        require(not (value["reviewerRole"] == "couple" and value["visibility"] not in {"shared", "client"}), "A couple decision must be explicitly shared with the client.")
    if collection == "vendors" and value.get("arrivalAt") and value.get("departureAt"):
        require(value["arrivalAt"] < value["departureAt"], "Vendor departure must be after arrival.")
    if collection == "payments":
        require(value.get("amountMinor", 0) > 0 and value.get("budgetLineId"), "A payment needs a budget line and a positive amount.")
    return value


def wedding(body):
    require(isinstance(body, dict), "A JSON object is required.")
    allowed = {"title", "clientId", "weddingDate", "guestEstimate", "budgetMinor", "language", "calendarPreference", "city", "churchLocation", "venueLocation", "leadPlannerUserId", "package", "selectedServiceCodes", "ceremonyType", "timezone", "currency"}
    require(not set(body) - allowed, "Unrecognized wedding fields.")
    value = {"status": "draft", "currency": "ETB", "timezone": "Africa/Addis_Ababa", "language": "en", "calendarPreference": "ethiopian", "guestEstimate": 0,
             "budgetMinor": 0, "city": "Addis Ababa", "ceremonyType": "church", "package": "full_planning", **body}
    value["title"] = text(value.get("title", ""), "Wedding title", required=True, limit=240)
    value["weddingDate"] = civil_date(value.get("weddingDate"), "Wedding date")
    integer(value["guestEstimate"], "Expected guests", 100000)
    integer(value["budgetMinor"], "Budget")
    require(value["language"] in {"en", "am"} and value["calendarPreference"] in {"gregorian", "ethiopian"}, "Choose a supported language and calendar.")
    require(value["currency"] == "ETB" and value["timezone"] == "Africa/Addis_Ababa", "This workspace uses ETB and Africa/Addis_Ababa.")
    require(value["package"] in {"full_planning", "day_of", "custom"}, "Choose a valid package.")
    if value.get("clientId"):
        integer(value["clientId"], "Client record", 2_147_483_647)
    for key in ("city", "churchLocation", "venueLocation", "ceremonyType", "leadPlannerUserId"):
        if key in value:
            value[key] = text(value[key], key, limit=240)
    codes = value.get("selectedServiceCodes", [])
    require(isinstance(codes, list) and len(codes) <= 100 and all(isinstance(code, str) for code in codes) and len(set(codes)) == len(codes), "Choose each service once.")
    return value
