"""Authorized application service. Every request runs in one host DB transaction."""

import base64
import json
import os
import re
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from . import catalog, validation
from .auth import ROLES, legacy_staff
from .domain import (ApiError, BOOKING_TRANSITIONS, SERVICE_TRANSITIONS, WEDDING_TRANSITIONS,
                     budget_summary, civil_date, collision, digest, due_time, integer, instant,
                     overdue, readiness, relative_date, require, text, would_cycle)
from .storage import Store, encode, now
from .upgrades import TemplateUpgradeMixin
from .questionnaire import QuestionnaireMixin

ALIASES = {"vendor-assignments": "vendors", "budget-lines": "budget_lines", "payment-milestones": "payments",
           "document-requests": "documents", "design-boards": "boards", "notes": "notes", "notifications": "notifications"}
STAFF = {"admin", "planner"}


def enabled():
    return os.environ.get("MATRIMONY_WEDDINGS_ENABLED", "1").lower() not in {"0", "false", "off"}


class Router(QuestionnaireMixin, TemplateUpgradeMixin):
    def __init__(self, db, identity, headers=None):
        self.db, self.identity = db, identity
        self.store = Store(db, identity.organization_id)
        self.headers = headers or {}
        self.roles, self.member, self.project = set(), {}, None
        self.service_cache = {}

    def dispatch(self, method, path, query=None, body=None):
        require(enabled(), "Wedding planning is disabled.", 404)
        self.method, self.body, self.query = method, {} if body is None else body, query or {}
        require(isinstance(self.body, dict), "A JSON object is required.")
        self.path = path.rstrip("/").removeprefix("/api/v1/")
        parts = self.path.split("/")
        if method in {"POST", "PATCH", "DELETE"} and hasattr(self.db, "path") and not self.db.conn.in_transaction:
            self.db.execute("BEGIN IMMEDIATE")
        key = self.headers.get("Idempotency-Key", "")
        self.request_key = None
        if method == "POST" and not parts[-1].endswith("preview") and parts[-1] != "conflict-check":
            require(isinstance(key, str) and 8 <= len(key) <= 160, "An Idempotency-Key is required.")
            fingerprint = digest({"method": method, "path": self.path, "body": self.body})
            self.db.execute("""INSERT INTO wp_requests(organization_id,user_id,request_key,fingerprint,created_at)
                VALUES(?,?,?,?,?) ON CONFLICT(organization_id,user_id,request_key) DO NOTHING""",
                (self.identity.organization_id, self.identity.user_id, key, fingerprint, now()))
            entry = self.db.query_one("SELECT fingerprint,response_json FROM wp_requests WHERE organization_id=? AND user_id=? AND request_key=?",
                                      (self.identity.organization_id, self.identity.user_id, key))
            require(entry["fingerprint"] == fingerprint, "This idempotency key was used for another operation.", 409)
            if entry["response_json"]:
                # Re-check wedding access before replaying potentially sensitive results.
                replay = json.loads(entry["response_json"])
                if parts[0] == "weddings":
                    resource_id = parts[1] if len(parts) > 1 else replay["body"].get("id")
                    if resource_id == "clients":
                        require(legacy_staff(self.identity), "Questionnaire access is no longer available.", 403)
                        resource_id = replay["body"].get("id")
                    if resource_id:
                        self.authorize(resource_id)
                require(replay.get("accessSignature") == self.access_signature(), "Access changed since this request. Refresh before retrying.", 403)
                return replay["status"], replay["body"]
            self.request_key = key
        if parts[0] == "service-templates":
            response = self.template_route(parts[1:])
        else:
            require(parts[0] == "weddings", "Route not found.", 404)
            if len(parts) == 1:
                response = self.root_route()
            elif parts[1] == "clients":
                response = self.clients_route(parts[2:])
            else:
                self.authorize(parts[1])
                require(method == "GET" or self.project["status"] != "archived", "Archived weddings are read-only.", 403)
                # Serialize changes to the aggregate on Postgres; CAS still protects stale clients.
                questionnaire_operation = parts[2:] == ["questionnaire"] or len(parts) == 5 and parts[2] == "services" and parts[4] == "questionnaire-details"
                if method != "GET" and not questionnaire_operation and not hasattr(self.db, "path"):
                    self.db.query_one("SELECT id FROM wp_weddings WHERE id=? AND organization_id=? FOR UPDATE", (parts[1], self.identity.organization_id))
                    self.project = self.store.wedding(parts[1])
                response = self.project_route(parts[2:])
        if self.request_key:
            self.db.execute("UPDATE wp_requests SET response_json=? WHERE organization_id=? AND user_id=? AND request_key=?",
                            (encode({"status": response[0], "body": response[1], "accessSignature": self.access_signature()}), self.identity.organization_id, self.identity.user_id, self.request_key))
        return response

    def access_signature(self):
        return digest({"globalRoles": sorted(self.identity.roles), "permissions": sorted(self.identity.permissions),
                       "weddingRoles": sorted(self.roles), "assignedServices": sorted(self.member.get("serviceIds", []))})

    def authorize(self, wedding_id):
        self.project = self.store.wedding(wedding_id)
        require(self.project, "Wedding not found.", 404)
        row = self.db.query_one("SELECT payload_json FROM wp_members WHERE wedding_id=? AND user_id=?", (wedding_id, self.identity.user_id))
        self.member = json.loads(row["payload_json"]) if row else {}
        self.roles = set(self.member.get("roles", []))
        if "admin" in self.identity.roles:
            self.roles.add("admin")
        require(bool(self.roles), "Wedding not found.", 404)
        self.service_cache = {s["id"]: s for s in self.store.items("services", wedding_id)}

    def staff(self):
        return bool(self.roles & STAFF)

    def allowed_service(self, service_id):
        service = self.service_cache.get(service_id, {})
        return service_id in self.member.get("serviceIds", []) or service.get("ownerUserId") == self.identity.user_id

    def visible(self, collection, item):
        visibility = item.get("visibility", "internal")
        if visibility == "restricted":
            return "counseling" in self.identity.permissions and (self.staff() or "church" in self.roles or item.get("ownerUserId") == self.identity.user_id or item.get("requestedFromUserId") == self.identity.user_id)
        if self.staff():
            return True
        service_id = item["id"] if collection == "services" else item.get("serviceId")
        if self.service_cache.get(service_id, {}).get("aftercare") and collection == "notes":
            return "counseling" in self.identity.permissions
        if collection == "notifications":
            return item.get("ownerUserId") == self.identity.user_id
        if "coordinator" in self.roles and (self.allowed_service(service_id) or item.get("ownerUserId") == self.identity.user_id) and collection not in {"budget_lines", "payments"}:
            return True
        if "couple" in self.roles:
            if collection not in {"payments", "vendors", "issues", "notes"} and (visibility in {"shared", "client"} or collection == "tasks" and item.get("ownerUserId") == self.identity.user_id):
                return True
        if "vendor" in self.roles:
            if self.allowed_service(service_id) and collection not in {"budget_lines", "payments", "guests", "notes"} and (visibility in {"shared", "vendor"} or collection == "tasks" and item.get("ownerUserId") == self.identity.user_id):
                return True
        if "church" in self.roles:
            return collection not in {"budget_lines", "payments", "vendors", "guests", "notifications", "notes"} and visibility in {"shared", "church"} and self.service_cache.get(service_id, {}).get("category") == "spiritual"
        return False

    def public_item(self, collection, item):
        result = {k: v for k, v in item.items() if k not in {"contentBase64", "restrictedNotes", "privateNotes"}}
        if not legacy_staff(self.identity):
            result.pop("questionnaireSettings", None)
        if not self.staff():
            for field in ("templateSnapshot", "questionnaireSettings", "externalTransactionId", "reason", "overrideReason", "evidence", "failureReason"):
                result.pop(field, None)
            if collection == "services" and result.get("blockerSummary"):
                result["blockerSummary"] = "Planner follow-up needed"
            if collection == "budget_lines":
                return {k: v for k, v in result.items() if k in {"id", "weddingId", "serviceId", "label", "clientAmountMinor", "currency", "visibility", "version"}}
            if collection == "vendors":
                for field in ("quotedMinor", "contractedMinor", "contractFileId", "backupContact"):
                    result.pop(field, None)
        return result

    def items(self, collection, filtered=True):
        rows = self.store.items(collection, self.project["id"])
        if collection == "tasks":
            rows.sort(key=lambda task: (task.get("sortOrder", 1000000), task["createdAt"], task["id"]))
        if collection in {"document_versions", "document_reviews"}:
            rows.sort(key=lambda item: (item.get("documentRequestId", ""), item.get("revision", 0), item["createdAt"], item["id"]))
        return [self.public_item(collection, r) for r in rows if self.visible(collection, r)] if filtered else rows

    def item(self, collection, item_id, visible=True):
        value = self.store.item(collection, self.project["id"], item_id)
        require(value and (not visible or self.visible(collection, value)), "Record not found.", 404)
        return value

    def version(self, value, collection="weddings"):
        supplied = self.headers.get("If-Match", self.body.get("version"))
        if isinstance(supplied, str):
            supplied = supplied.strip('"')
            supplied = int(supplied) if supplied.isdecimal() else None
        require(type(supplied) is int, "The current version is required (If-Match).", 428)
        require(supplied == value["version"], "Another person changed this record. Review the latest version before saving.", 409,
                latest=self.public_item(collection, value) if value is not self.project else self.public_wedding(),
                changedFields=sorted(key for key in self.body if key not in {"version", "previewToken"} and self.body[key] != value.get(key)))
        return supplied

    def save_item(self, collection, value, previous=None, action="updated"):
        expected = previous["version"] if previous else None
        result = self.store.put(collection, self.project["id"], value, expected)
        require(result, "This record changed. Reload before saving.", 409)
        self.store.audit(self.project["id"], self.identity.user_id, action, collection, result["id"], previous, result)
        if collection == "services":
            self.service_cache[result["id"]] = result
        return result

    def paginate(self, items):
        term = self.query.get("q", [""])[0].casefold()[:160]
        status = self.query.get("status", [""])[0]
        owner = self.query.get("owner", [""])[0]
        service = self.query.get("serviceId", [""])[0]
        category = self.query.get("category", [""])[0]
        if term:
            items = [r for r in items if term in str(r.get("title") or r.get("name") or r.get("label") or r.get("displayName", "")).casefold()]
        if status:
            items = [r for r in items if r.get("status") == status]
        if owner:
            items = [r for r in items if r.get("ownerUserId") == owner]
        if service:
            items = [r for r in items if r.get("serviceId") == service]
        if category:
            items = [r for r in items if r.get("category") == category]
        from_date = self.query.get("from", [None])[0]
        to_date = self.query.get("to", [None])[0]
        if from_date or to_date:
            civil_date(from_date)
            civil_date(to_date)
            def local_day(item):
                value = item.get("dueAt") or item.get("startAt") or item.get("dueOn") or item.get("arrivalAt")
                if not value:
                    return None
                return (datetime.fromisoformat(value) + timedelta(hours=3)).date().isoformat() if "T" in value else value
            items = [r for r in items if local_day(r) and (not from_date or local_day(r) >= from_date) and (not to_date or local_day(r) <= to_date)]
        cursor = self.query.get("cursor", [""])[0]
        start = 0
        if cursor:
            positions = [i for i, r in enumerate(items) if r["id"] == cursor]
            require(positions, "This list changed. Start from the first page.", 409)
            start = positions[0] + 1
        limit_raw = self.query.get("limit", ["50"])[0]
        require(str(limit_raw).isdecimal(), "Invalid page size.")
        limit = max(1, min(100, int(limit_raw)))
        page = items[start:start + limit]
        return {"items": page, "total": len(items), "nextCursor": page[-1]["id"] if start + limit < len(items) else None}

    def permissions(self):
        return {"configure": self.staff(), "finance": self.staff(), "manageMembers": self.staff(),
                "edit": self.staff() or "coordinator" in self.roles,
                "verifyChurch": bool(self.roles & {"admin", "planner", "church"}),
                "roles": sorted(self.roles), "userId": self.identity.user_id, "local": self.identity.local}

    def public_wedding(self):
        value = dict(self.project)
        if not legacy_staff(self.identity):
            value.pop("questionnaire", None)
        if not self.staff():
            for field in ("budgetMinor", "selectedServiceCodes", "questionnaire", "cancelReason", "reopenReason"):
                value.pop(field, None)
        value["permissions"] = self.permissions()
        return value

    def all_templates(self):
        definitions = {t["code"]: t for t in catalog.templates()}
        for row in self.db.query("SELECT payload_json,version FROM wp_templates WHERE organization_id=?", (self.identity.organization_id,)):
            entry = json.loads(row["payload_json"])
            definitions[entry["code"]] = {**entry, "version": row["version"]}
        return [{"version": 1, **value} for value in definitions.values()]

    def template_route(self, parts):
        global_staff = bool(self.identity.roles & STAFF)
        if not global_staff and self.method == "GET":
            memberships = self.db.query("SELECT m.payload_json FROM wp_members m JOIN wp_weddings w ON m.wedding_id=w.id WHERE w.organization_id=? AND m.user_id=?", (self.identity.organization_id, self.identity.user_id))
            global_staff = any(set(json.loads(row["payload_json"]).get("roles", [])) & STAFF for row in memberships)
        require(global_staff, "Catalog access requires a planner.", 403)
        definitions = self.all_templates()
        if self.method == "GET" and not parts:
            return 200, {"items": definitions, "canEdit": "admin" in self.identity.roles}
        require("admin" in self.identity.roles, "Only an admin can edit templates.", 403)
        require(self.method in {"POST", "PATCH"} and len(parts) <= 1, "Route not found.", 404)
        previous = next((t for t in definitions if parts and t["code"] == parts[0]), None)
        if self.method == "PATCH":
            require(previous, "Template not found.", 404)
            self.version(previous)
        allowed = {"code", "name", "nameAm", "category", "relativeOffsetDays", "defaultEnabled", "aftercare", "approvalRequired", "critical", "evidence", "tasks", "version"}
        require(not set(self.body) - allowed, "Unrecognized template fields.")
        value = {**(previous or {}), **{k: v for k, v in self.body.items() if k != "version"}}
        code = value.get("code", "")
        require(isinstance(code, str) and re.fullmatch(r"[A-Z][A-Z0-9_]{1,39}", code), "Use an uppercase service code.")
        require(not previous or code == previous["code"], "Template codes cannot change.")
        require(previous or not any(t["code"] == code for t in definitions), "This service code already exists.", 409)
        for field in ("name", "nameAm", "category", "evidence"):
            value[field] = text(value.get(field, ""), field, required=field in {"name", "category"}, limit=400)
        offset = value.get("relativeOffsetDays", -90)
        require(type(offset) is int and -3650 <= offset <= 3650, "Invalid lead-time offset.")
        value["relativeOffsetDays"] = offset
        for key in ("defaultEnabled", "aftercare", "approvalRequired", "critical"):
            value.setdefault(key, False if key != "defaultEnabled" else True)
            require(type(value[key]) is bool, f"{key} must be true or false.")
        require(code != "COUNSELING" or value["aftercare"], "Post-marriage counseling must stay in aftercare.")
        value.setdefault("tasks", [{"code": "verify", "title": value.get("evidence") or "Verify readiness", "offsetDays": offset, "required": True, "priority": "normal"}])
        require(isinstance(value["tasks"], list) and 1 <= len(value["tasks"]) <= 30, "Use between 1 and 30 task templates.")
        codes = set()
        for task in value["tasks"]:
            require(isinstance(task, dict) and set(task) <= {"code", "title", "titleAm", "offsetDays", "required", "priority", "approvalRequired"}, "Invalid task template.")
            text(task.get("title", ""), "Task title", True, 240)
            task_code = text(task.get("code", ""), "Task code", True, 80)
            require(task_code not in codes, "Task template codes must be unique.")
            codes.add(task_code)
            require(type(task.get("offsetDays")) is int and -3650 <= task["offsetDays"] <= 3650, "Invalid task offset.")
            for key in ("required", "approvalRequired"):
                require(type(task.get(key, key == "required")) is bool, "Invalid task template flag.")
            require(task.get("priority", "normal") in {"low", "normal", "high", "critical"}, "Invalid task priority.")
        value.update(id=code, templateVersion=(previous.get("templateVersion", 1) + 1) if previous else 1,
                     version=previous["version"] + 1 if previous else 1)
        if previous:
            count = self.db.execute("""INSERT INTO wp_templates(id,organization_id,version,payload_json) VALUES(?,?,?,?)
                ON CONFLICT(organization_id,id) DO UPDATE SET version=excluded.version,payload_json=excluded.payload_json WHERE wp_templates.version=?""",
                (code, self.identity.organization_id, value["version"], encode(value), previous["version"]))
        else:
            count = self.db.execute("INSERT INTO wp_templates(id,organization_id,version,payload_json) VALUES(?,?,?,?) ON CONFLICT DO NOTHING",
                                    (code, self.identity.organization_id, value["version"], encode(value)))
        require(count, "This template changed. Reload before saving.", 409)
        return 200 if previous else 201, value

    def clients(self):
        require(self.method == "GET" and legacy_staff(self.identity), "Client selection requires access to the host's couple records.", 403)
        rows = self.db.query("SELECT id,bride_first_name,groom_first_name,wedding_date FROM records ORDER BY updated_at DESC LIMIT 100")
        return 200, {"items": [{"id": r["id"], "title": f"{r['bride_first_name']} & {r['groom_first_name']}", "weddingDate": r["wedding_date"] or None} for r in rows]}

    def root_route(self):
        if self.method == "GET":
            clauses, parameters = ["w.organization_id=?"], [self.identity.organization_id]
            if "admin" not in self.identity.roles:
                clauses.append("EXISTS(SELECT 1 FROM wp_members m WHERE m.wedding_id=w.id AND m.user_id=?)")
                parameters.append(self.identity.user_id)
            term = self.query.get("q", [""])[0].strip().lower()[:160]
            if term:
                clauses.append("LOWER(w.title) LIKE ?")
                parameters.append("%" + term.replace("%", "").replace("_", "") + "%")
            status = self.query.get("status", [""])[0]
            if status:
                clauses.append("w.status=?")
                parameters.append(status)
            where = " AND ".join(clauses)
            total = self.db.query_one(f"SELECT COUNT(*) AS total FROM wp_weddings w WHERE {where}", parameters)["total"]
            limit = self.query.get("limit", ["24"])[0]
            require(str(limit).isdecimal(), "Invalid page size.")
            limit = max(1, min(100, int(limit)))
            cursor = self.query.get("cursor", [""])[0]
            if cursor:
                self.authorize(cursor)
                clauses.append("(w.updated_at<? OR (w.updated_at=? AND w.id<?))")
                parameters.extend([self.project["updatedAt"], self.project["updatedAt"], cursor])
            where = " AND ".join(clauses)
            rows = self.db.query(f"SELECT w.id FROM wp_weddings w WHERE {where} ORDER BY w.updated_at DESC,w.id DESC LIMIT ?", (*parameters, limit + 1))
            projects = []
            for row in rows[:limit]:
                self.authorize(row["id"])
                project = self.public_wedding()
                services, tasks, milestones, issues = (self.items(c) for c in ("services", "tasks", "milestones", "issues"))
                health = readiness(services, tasks, milestones, issues)
                health["dateScheduled"] = bool(self.project.get("weddingDate"))
                health["ready"] = health["ready"] and health["dateScheduled"]
                project["health"] = {k: v for k, v in health.items() if k != "blockers"}
                projects.append(project)
            return 200, {"items": projects, "total": total, "nextCursor": projects[-1]["id"] if len(rows) > limit else None}
        require(self.method == "POST", "Method not allowed.", 405)
        require(bool(self.identity.roles & STAFF), "Only a planner can create a wedding.", 403)
        value = validation.wedding(self.body)
        definitions = {t["code"] for t in self.all_templates()}
        require(set(value.get("selectedServiceCodes", [])) <= definitions, "Unknown service code.")
        if value.get("clientId"):
            require(legacy_staff(self.identity), "Linking a couple record requires access to the host's client directory.", 403)
            self.questionnaire_record(value["clientId"], lock=True)
            existing = self.db.query_one("SELECT id FROM wp_weddings WHERE organization_id=? AND client_id=?", (self.identity.organization_id, value["clientId"]))
            require(not existing, "This couple already has a planning workspace. Open that plan to continue.", 409,
                    weddingId=existing["id"] if existing else None)
        value.setdefault("leadPlannerUserId", self.identity.user_id)
        self.project = self.store.create_wedding(value)
        self.roles = {"planner"} | ({"admin"} if "admin" in self.identity.roles else set())
        self.member = {"userId": self.identity.user_id, "roles": ["planner"], "serviceIds": [], "name": "Lead planner", "notificationsEnabled": True}
        self.db.execute("INSERT INTO wp_members(wedding_id,user_id,payload_json) VALUES(?,?,?)", (self.project["id"], self.identity.user_id, encode(self.member)))
        if value["leadPlannerUserId"] != self.identity.user_id:
            lead = {**self.member, "userId": value["leadPlannerUserId"]}
            self.db.execute("INSERT INTO wp_members(wedding_id,user_id,payload_json) VALUES(?,?,?)", (self.project["id"], lead["userId"], encode(lead)))
        self.store.audit(self.project["id"], self.identity.user_id, "created", "weddings", self.project["id"], after=self.project)
        return 201, self.public_wedding()

    def project_route(self, parts):
        if not parts:
            if self.method == "GET":
                return 200, self.public_wedding()
            return self.patch_wedding()
        action = parts[0]
        if action == "activate":
            return self.activate()
        if action == "questionnaire":
            return self.link_questionnaire()
        if action in {"dashboard", "readiness", "run-sheet"}:
            require(self.method == "GET", "Method not allowed.", 405)
            return self.dashboard(action)
        if action == "activity":
            return self.activity()
        if action == "members":
            return self.members_route(parts[1:])
        if action in {"date-change-preview", "date-change"}:
            return self.date_change(action == "date-change-preview")
        if action == "reminders":
            return self.reminders_route(parts[1:])
        if action == "files" and len(parts) == 2:
            require(self.method == "GET", "Method not allowed.", 405)
            file = self.item("files", parts[1], visible=False)
            self.item("documents", file["documentRequestId"])
            self.store.audit(self.project["id"], self.identity.user_id, "file_downloaded", "documents", file["documentRequestId"])
            return 200, file
        if action == "files" and len(parts) == 1:
            require(self.method == "GET", "Method not allowed.", 405)
            visible_documents = {d["id"] for d in self.items("documents")}
            versions = self.items("document_versions", False)
            return 200, {"items": [{"id": v["fileId"], "filename": v["filename"], "revision": v["revision"], "documentRequestId": v["documentRequestId"]} for v in versions if v["documentRequestId"] in visible_documents]}
        collection = ALIASES.get(action, action)
        require(collection in validation.FIELDS, "Route not found.", 404)
        if len(parts) >= 2:
            if collection == "events" and parts[1] == "conflict-check":
                value = validation.resource("events", self.body)
                self.validate_refs(value)
                return 200, {"conflicts": self.conflicts(value)}
            if len(parts) > 2:
                return self.workflow_route(collection, parts[1], parts[2:])
            previous = self.item(collection, parts[1])
            if self.method == "GET":
                result = self.public_item(collection, previous)
                if collection == "services":
                    result["tasks"] = [t for t in self.items("tasks") if t.get("serviceId") == previous["id"]]
                    if self.staff():
                        latest = next((t for t in self.all_templates() if t["code"] == previous.get("code")), None)
                        result["availableTemplateVersion"] = latest["templateVersion"] if latest else None
                if collection == "documents":
                    result["versions"] = [v for v in self.items("document_versions", False) if v["documentRequestId"] == previous["id"]]
                    version_ids = {v["id"] for v in result["versions"]}
                    result["reviews"] = [r for r in self.items("document_reviews", False) if r["documentVersionId"] in version_ids]
                return 200, result
            require(self.method == "PATCH", "Method not allowed.", 405)
            return self.mutate(collection, previous)
        if self.method == "GET":
            return 200, self.paginate(self.items(collection))
        require(self.method == "POST", "Method not allowed.", 405)
        return self.mutate(collection)

    def patch_wedding(self):
        require(self.method == "PATCH" and self.staff(), "Wedding edits require a lead planner.", 403)
        expected = self.version(self.project)
        allowed = {"title", "guestEstimate", "budgetMinor", "language", "calendarPreference", "city", "churchLocation", "venueLocation", "status", "reason", "version"}
        if self.project["status"] == "draft":
            allowed |= {"weddingDate", "selectedServiceCodes", "package", "ceremonyType", "clientId", "timezone", "currency"}
        require(not set(self.body) - allowed, "Use the date-change preview to change the wedding date.")
        previous = dict(self.project)
        values = {k: v for k, v in self.body.items() if k not in {"version", "status", "reason"}}
        if "clientId" in values:
            require(values["clientId"] == self.project.get("clientId"), "Use Link questionnaire to connect a couple record.", 409)
        proposed = {**self.project, **values}
        if "selectedServiceCodes" in values:
            require(isinstance(values["selectedServiceCodes"], list) and all(isinstance(c, str) for c in values["selectedServiceCodes"]) and set(values["selectedServiceCodes"]) <= {t["code"] for t in self.all_templates()}, "Unknown service code.")
        if values.get("clientId"):
            require(legacy_staff(self.identity), "Linking a couple record requires access to the host's client directory.", 403)
            require(self.db.query_one("SELECT id FROM records WHERE id=?", (values["clientId"],)), "Client record not found.", 404)
        validated = validation.wedding({k: v for k, v in proposed.items() if k in {"title", "clientId", "weddingDate", "guestEstimate", "budgetMinor", "language", "calendarPreference", "city", "churchLocation", "venueLocation", "leadPlannerUserId", "package", "selectedServiceCodes", "ceremonyType", "timezone", "currency"}})
        proposed.update({k: validated[k] for k in values})
        if "status" in self.body:
            status = self.body["status"]
            reopening = self.project["status"] == "completed" and status == "planning"
            require(status == previous["status"] or status in WEDDING_TRANSITIONS[previous["status"]] or reopening and "admin" in self.roles, "Invalid wedding phase transition.")
            if status == "cancelled" or reopening:
                proposed["cancelReason" if status == "cancelled" else "reopenReason"] = text(self.body.get("reason", ""), "Reason", True)
                if status == "cancelled":
                    require(not any(p["status"] == "pending" for p in self.items("payments", False)), "Reconcile or cancel pending payment milestones before cancelling the wedding.", 409)
            if status in {"final_review", "event_live"}:
                health = self.full_readiness()
                require(not health["criticalBlockers"], "Resolve critical blockers before advancing the wedding phase.", 409, blockers=health["blockers"])
                if status == "event_live":
                    require(health["ready"], "Confirm all active services before going live.", 409)
            require(not (previous["status"] == "draft" and status == "planning"), "Use Activate plan to generate the services and tasks.", 409)
            proposed["status"] = status
        self.project = self.store.update_wedding(proposed, expected)
        require(self.project, "This wedding changed. Reload before saving.", 409)
        self.store.audit(self.project["id"], self.identity.user_id, "updated", "weddings", self.project["id"], previous, self.project)
        if previous["status"] != "completed" and self.project["status"] == "completed":
            recipients = self.members_with_roles({"planner", "admin", "couple"})
            self.enqueue("wedding_completed", self.project["id"], recipients, "Review final deliverables, reconciliation and aftercare.", revision=self.project["version"])
        return 200, self.public_wedding()

    def members_route(self, parts):
        require(self.staff(), "Only a lead planner can manage membership.", 403)
        if self.method == "GET":
            rows = self.db.query("SELECT payload_json FROM wp_members WHERE wedding_id=? ORDER BY user_id", (self.project["id"],))
            return 200, {"items": [json.loads(row["payload_json"]) for row in rows]}
        require(self.method in {"POST", "PATCH"}, "Method not allowed.", 405)
        require(set(self.body) <= {"userId", "name", "roles", "serviceIds", "notificationsEnabled"}, "Unrecognized membership fields.")
        user_id = text(parts[0] if parts else self.body.get("userId", ""), "Existing host user ID", True, 160)
        roles, service_ids = self.body.get("roles", []), self.body.get("serviceIds", [])
        require(isinstance(roles, list) and set(roles) <= ROLES and isinstance(service_ids, list) and set(service_ids) <= self.service_cache.keys(), "Invalid role or service assignment.")
        require("admin" not in roles or "admin" in self.roles, "Only an admin can assign the admin role.", 403)
        require(user_id != self.project["leadPlannerUserId"] or bool(set(roles) & STAFF), "The lead planner must retain access.")
        value = {"userId": user_id, "name": text(self.body.get("name", user_id), "Name", True, 160), "roles": roles,
                 "serviceIds": service_ids, "notificationsEnabled": self.body.get("notificationsEnabled", True)}
        require(type(value["notificationsEnabled"]) is bool, "Invalid notification preference.")
        if not roles:
            self.db.execute("DELETE FROM wp_members WHERE wedding_id=? AND user_id=?", (self.project["id"], user_id))
        else:
            self.db.execute("""INSERT INTO wp_members(wedding_id,user_id,payload_json) VALUES(?,?,?)
                ON CONFLICT(wedding_id,user_id) DO UPDATE SET payload_json=excluded.payload_json""", (self.project["id"], user_id, encode(value)))
        self.store.audit(self.project["id"], self.identity.user_id, "membership_changed", "members", user_id, after=value)
        return 200, value

    def activate(self):
        require(self.method == "POST" and self.staff(), "Plan activation requires a lead planner.", 403)
        self.version(self.project)
        require(set(self.body) <= {"version", "selectedServiceCodes"}, "Invalid activation input.")
        if self.project["status"] != "draft":
            require(self.project.get("activatedAt"), "This wedding cannot be activated.", 409)
            return 200, {"wedding": self.public_wedding(), "servicesCreated": 0, "alreadyActivated": True}
        codes = self.body.get("selectedServiceCodes", self.project.get("selectedServiceCodes", []))
        definitions = {t["code"]: t for t in self.all_templates()}
        require(isinstance(codes, list) and codes and all(isinstance(c, str) for c in codes) and len(set(codes)) == len(codes) and set(codes) <= definitions.keys(), "Select valid services, each once.")
        task_ids = self.instantiate_services(codes)
        previous = self.project
        self.project = self.store.update_wedding({**previous, "status": "planning", "selectedServiceCodes": codes, "activatedAt": now()}, previous["version"])
        require(self.project, "This wedding changed. Reload before activation.", 409)
        self.store.audit(self.project["id"], self.identity.user_id, "activated", "weddings", self.project["id"], previous, self.project)
        return 200, {"wedding": self.public_wedding(), "servicesCreated": len(codes), "tasksCreated": len(task_ids)}

    def instantiate_services(self, codes):
        """Generate only new services; retain the identity and progress of existing work."""
        definitions = {t["code"]: t for t in self.all_templates()}
        require(set(codes) <= definitions.keys(), "Unknown service code.")
        existing = {s.get("code"): s for s in self.service_cache.values()}
        task_ids = {(self.service_cache[t["serviceId"]].get("code"), t["templateSnapshot"]["code"]): t["id"]
                    for t in self.items("tasks", False) if t.get("templateSnapshot") and t.get("serviceId") in self.service_cache}
        initial_count = len(task_ids)
        start_order = max((s.get("sortOrder", 0) for s in existing.values()), default=-1) + 1
        for order, code in enumerate(codes):
            if code in existing:
                continue
            order += start_order
            template = definitions[code]
            service = self.save_item("services", {**validation.DEFAULTS["services"], "code": code, "name": template["name"],
                "nameAm": template["nameAm"], "category": template["category"], "templateSnapshot": template,
                "aftercare": template["aftercare"], "approvalRequired": template["approvalRequired"], "critical": template["critical"],
                "ownerUserId": self.project["leadPlannerUserId"], "targetDate": relative_date(self.project.get("weddingDate"), template["relativeOffsetDays"], template["aftercare"]),
                "visibility": "shared", "sortOrder": order}, action="instantiated")
            previous_id = None
            for task_order, task_template in enumerate(template["tasks"]):
                task = self.save_item("tasks", {**validation.DEFAULTS["tasks"], "title": task_template["title"], "titleAm": task_template.get("titleAm", ""),
                    "serviceId": service["id"], "ownerUserId": service["ownerUserId"], "required": task_template.get("required", True),
                    "approvalRequired": task_template.get("approvalRequired", False), "priority": task_template.get("priority", "normal"),
                    "scheduleMode": "template", "sortOrder": order * 100 + task_order, "relativeOffsetDays": task_template["offsetDays"], "templateSnapshot": task_template,
                    "aftercare": template["aftercare"], "dueAt": due_time(self.project.get("weddingDate"), task_template["offsetDays"], template["aftercare"]), "visibility": "internal"}, action="instantiated")
                task_ids[(code, task_template["code"])] = task["id"]
                if previous_id:
                    self.db.execute("INSERT INTO wp_dependencies(wedding_id,predecessor_id,successor_id) VALUES(?,?,?)", (self.project["id"], previous_id, task["id"]))
                previous_id = task["id"]
            if template["approvalRequired"]:
                self.save_item("documents", {**validation.DEFAULTS["documents"], "title": template["evidence"], "serviceId": service["id"],
                    "visibility": "shared", "required": True, "ownerUserId": service["ownerUserId"], "dueAt": due_time(self.project.get("weddingDate"), -30),
                    "scheduleMode": "template", "relativeOffsetDays": -30}, action="requested")
            if code in {"CHURCH", "VENUE"}:
                self.save_item("milestones", {"title": "Church date verified with clergy" if code == "CHURCH" else "Venue access verified",
                    "serviceId": service["id"], "ownerUserId": service["ownerUserId"], "status": "todo", "required": True, "visibility": "shared",
                    "dueAt": due_time(self.project.get("weddingDate"), template["relativeOffsetDays"]), "relativeOffsetDays": template["relativeOffsetDays"], "scheduleMode": "template"}, action="instantiated")
        for first, second in ((('CHURCH', 'verify'), ('VENUE', 'arrange')), (('CHURCH', 'verify'), ('INVITATIONS', 'arrange')),
                              (('GENERATOR', 'arrange'), ('SOUND', 'verify')), (('PERFORMERS', 'arrange'), ('REHEARSAL', 'arrange'))):
            if first in task_ids and second in task_ids:
                self.db.execute("INSERT INTO wp_dependencies(wedding_id,predecessor_id,successor_id) VALUES(?,?,?) ON CONFLICT DO NOTHING",
                                (self.project["id"], task_ids[first], task_ids[second]))
        return {key: value for i, (key, value) in enumerate(task_ids.items()) if i >= initial_count}

    def validate_refs(self, value):
        for key, collection in (("serviceId", "services"), ("taskId", "tasks"), ("vendorId", "vendors"), ("vendorAssignmentId", "vendors"),
                                ("budgetLineId", "budget_lines"), ("documentRequestId", "documents"), ("proofFileId", "files"), ("receiptFileId", "files"), ("contractFileId", "files")):
            if value.get(key):
                linked = self.item(collection, value[key], visible=False)
                if key != "serviceId" and value.get("serviceId") and linked.get("serviceId"):
                    require(linked["serviceId"] == value["serviceId"], "Linked records must belong to the same service.")
                if key == "vendorId":
                    value["vendorResourceId"] = linked.get("externalVendorId") or linked["id"]
                if collection == "files":
                    self.item("documents", linked["documentRequestId"])
        for key in ("ownerUserId", "backupOwnerUserId", "requestedFromUserId"):
            if value.get(key):
                row = self.db.query_one("SELECT payload_json FROM wp_members WHERE wedding_id=? AND user_id=?", (self.project["id"], value[key]))
                require(row and json.loads(row["payload_json"]).get("roles"), "Assign an active member of this wedding.")

    def can_edit(self, collection, value, previous):
        if self.staff():
            return
        require(collection not in {"budget_lines", "payments", "services", "notes", "boards"}, "This action requires a lead planner.", 403)
        if collection == "notifications":
            require(previous and previous.get("ownerUserId") == self.identity.user_id, "This notification belongs to another member.", 403)
            return
        service_id = value.get("serviceId")
        if "coordinator" in self.roles:
            require(self.allowed_service(service_id) or value.get("ownerUserId") == self.identity.user_id, "Only assigned work can be changed.", 403)
            require(not previous or previous.get("serviceId") == service_id, "Only the lead planner can move tasks between services.", 403)
            require(value.get("visibility") == (previous or {}).get("visibility", "internal"), "Sharing requires a lead planner.", 403)
            require(value.get("ownerUserId") == (previous or {}).get("ownerUserId", self.identity.user_id), "Assignments require a lead planner.", 403)
            return
        if "church" in self.roles and collection == "milestones":
            require(previous and self.service_cache.get(service_id, {}).get("category") == "spiritual" and value.get("visibility") in {"church", "shared"}, "This milestone is outside your authority.", 403)
            require(set(self.body) <= {"status", "evidence", "version"}, "Only church verification is permitted.", 403)
            return
        require(collection == "tasks" and previous and previous.get("ownerUserId") == self.identity.user_id and self.visible(collection, previous), "Only explicitly assigned tasks can be changed.", 403)
        require(set(self.body) <= {"status", "proofFileId", "version", "reason"}, "Only task progress can be changed.", 403)

    def dependencies(self):
        return self.db.query("SELECT predecessor_id,successor_id FROM wp_dependencies WHERE wedding_id=?", (self.project["id"],))

    def prerequisites(self, task_id):
        predecessors = [e["predecessor_id"] for e in self.dependencies() if e["successor_id"] == task_id]
        tasks = [self.item("tasks", task_id, False) for task_id in predecessors]
        return [t for t in tasks if t["status"] != "done" and (not t.get("serviceId") or self.service_cache[t["serviceId"]].get("enabled", True) and self.service_cache[t["serviceId"]]["status"] not in {"cancelled", "not_applicable"})]

    def mutate(self, collection, previous=None):
        require(collection != "notifications" or previous, "Notifications are generated by the reminder workflow.", 403)
        if previous:
            self.version(previous, collection)
        value = validation.resource(collection, self.body, previous)
        if not previous:
            value.setdefault("ownerUserId", self.identity.user_id)
        self.can_edit(collection, value, previous)
        self.validate_refs(value)
        if collection in {"notes", "documents"} and self.service_cache.get(value.get("serviceId"), {}).get("aftercare"):
            require("counseling" in self.identity.permissions, "Counseling notes require separate restricted authority.", 403)
            value["visibility"] = "restricted"
        if value.get("visibility") == "restricted":
            require("counseling" in self.identity.permissions, "Restricted records require separate authority.", 403)
        if collection == "services":
            if previous:
                status = value["status"]
                require(status == previous["status"] or status in SERVICE_TRANSITIONS[previous["status"]], "Use readiness verification to confirm a service.", 409)
                if status in {"cancelled", "not_applicable"} or value["enabled"] != previous["enabled"]:
                    require(bool(value.get("reason")), "Record why the service is disabled or cancelled.")
            else:
                require(value["status"] == "not_started", "New services start as not started.")
                value.update(aftercare=False, approvalRequired=False, critical=False, sortOrder=len(self.service_cache))
        if collection == "tasks":
            if value["status"] == "done":
                require(not previous or not self.prerequisites(previous["id"]), "Complete the prerequisite tasks first.", 409,
                        dependencies=[self.public_item("tasks", t) for t in self.prerequisites(previous["id"])] if previous else [])
                if value.get("approvalRequired"):
                    require(any(d["status"] == "approved" and d.get("serviceId") == value.get("serviceId") for d in self.items("documents", False)), "An approved document is required before this task can be completed.", 409)
                value["completedAt"] = previous.get("completedAt") if previous and previous.get("completedAt") else now()
            else:
                value["completedAt"] = None
            if value["status"] in {"blocked", "cancelled"}:
                require(bool(value.get("reason")), "Record the blocker or cancellation reason.")
            if previous and value.get("dueAt") != previous.get("dueAt"):
                require(bool(value.get("reason")), "Record why the deadline is changing.")
                preview = self.task_preview(previous, value.get("dueAt"))
                require(self.body.get("previewToken") == preview["previewToken"], "Review the deadline impact before saving.", 409, preview=preview)
                value["scheduleMode"] = "manual"
            if previous and (value.get("required") != previous.get("required") or value.get("approvalRequired") != previous.get("approvalRequired")):
                require(self.staff() and bool(value.get("reason")), "Changing a required check needs a lead planner and a reason.", 403)
        if collection == "milestones":
            if value["status"] == "verified":
                require(bool(self.roles & {"admin", "planner", "church"}), "Only an authorized verifier can verify milestones.", 403)
                value["evidence"] = text(value.get("evidence", ""), "Verification evidence", True)
                value.update(verifiedByUserId=self.identity.user_id, verifiedAt=now())
            if previous and value.get("required") != previous.get("required"):
                require(self.staff() and bool(value.get("reason")), "Changing a critical milestone needs a lead planner and a reason.", 403)
        if collection == "vendors":
            if previous:
                require(value["status"] == previous["status"] or value["status"] in BOOKING_TRANSITIONS[previous["status"]], "Invalid booking transition.")
            else:
                require(value["status"] == "shortlisted", "New providers start on the shortlist.")
            if value["status"] in {"contracted", "confirmed", "delivered", "closed"}:
                require(value.get("contractFileId"), "Upload and link the vendor contract before contracting.", 409)
            if value["status"] in {"confirmed", "delivered", "closed"}:
                require(value.get("bookedDate"), "Confirm the external booking date.")
            if not self.staff():
                require(not set(self.body) & {"quotedMinor", "contractedMinor", "contractFileId"}, "Vendor pricing changes require a lead planner.", 403)
        if collection == "events":
            conflicts = self.conflicts(value)
            require(not conflicts or bool(value.get("overrideReason")), "Review the scheduling conflicts and record an override reason.", 409, conflicts=conflicts)
            if previous and previous.get("externalConfirmed") and any(value.get(key) != previous.get(key) for key in ("startAt", "endAt", "location")):
                require(self.staff() and bool(value.get("overrideReason")), "Changing a confirmed external reservation needs a lead planner and a reason.", 403)
        if collection in {"budget_lines", "payments"}:
            self.financial_rules(collection, value, previous)
        if collection == "documents":
            if previous:
                require(not (self.body.get("serviceId") != previous.get("serviceId") and "serviceId" in self.body), "A document's service context cannot change.")
                if value.get("required") != previous.get("required") or value.get("reviewerRole") != previous.get("reviewerRole"):
                    require(self.staff(), "Only a lead planner can configure document approvals.", 403)
                require(previous.get("revision", 0) == 0 or value.get("reviewerRole") == previous.get("reviewerRole"), "The designated approver cannot change after submission. Create a new request instead.", 409)
            value.setdefault("revision", 0)
        if collection == "notifications":
            require(previous["status"] == "pending" or previous["status"] == "failed" and value["status"] in {"pending", "delivered"}, "A delivered notification is immutable.")
            if value["status"] == "delivered":
                value["deliveredAt"] = now()
            if value["status"] == "failed":
                require(bool(value.get("failureReason")), "Record the provider failure.")
        result = self.save_item(collection, value, previous, "created" if previous is None else "updated")
        needs_recheck = (collection == "tasks" and value.get("required", True) and value["status"] != "done" or
                         collection == "milestones" and value.get("required", True) and value["status"] != "verified" or
                         collection == "documents" and value.get("required") and value["status"] != "approved" or
                         collection == "issues" and value.get("severity") == "critical" and value["status"] != "resolved")
        if needs_recheck:
            self.invalidate_service(value.get("serviceId"))
        return 200 if previous else 201, self.public_item(collection, result)

    def invalidate_service(self, service_id):
        service = self.service_cache.get(service_id)
        if service and service["status"] == "confirmed":
            self.save_item("services", {**service, "status": "in_progress", "blockerSummary": "A readiness check changed. Review and reconfirm this service."}, service, "readiness_invalidated")

    def financial_rules(self, collection, value, previous):
        require(self.staff(), "Financial changes require a lead planner.", 403)
        limit = os.environ.get("MATRIMONY_LEAD_APPROVAL_LIMIT_MINOR", "9000000000000")
        amount = value.get("committedMinor", value.get("amountMinor", 0))
        require("admin" in self.roles or amount <= int(limit), "This amount exceeds the lead planner's approval limit; an admin must approve it.", 403)
        if previous:
            require(bool(value.get("reason")), "Record the reason for a financial change.")
        if collection == "budget_lines":
            payments = [p for p in self.items("payments", False) if p.get("budgetLineId") == value.get("id") and p["status"] != "cancelled"]
            require(sum(p["amountMinor"] for p in payments) <= value["committedMinor"], "The commitment cannot be reduced below its payment schedule.", 409)
            return
        require(value.get("visibility", "internal") == "internal", "Internal payment records cannot be shared.")
        if previous and previous["status"] == "paid":
            require(all(value.get(k) == previous.get(k) for k in ("amountMinor", "budgetLineId", "status", "externalTransactionId")), "Paid transactions are immutable; reconcile refunds in the host ledger.", 409)
        line = self.item("budget_lines", value["budgetLineId"], False)
        others = [p for p in self.items("payments", False) if p.get("budgetLineId") == value["budgetLineId"] and p["id"] != value.get("id") and p["status"] != "cancelled"]
        require(value["status"] == "cancelled" or sum(p["amountMinor"] for p in others) + value["amountMinor"] <= line["committedMinor"], "The payment schedule exceeds the committed amount.", 409)
        if value["status"] == "paid":
            require(previous, "Create the pending obligation before linking a paid transaction.")
            require(value.get("externalTransactionId") and (value.get("receiptFileId") or value.get("evidence")), "Link the host transaction and a receipt or reconciliation note.")
            duplicate = self.db.query_one("SELECT id FROM wp_payments WHERE organization_id=? AND external_ref=? AND id<>?",
                                          (self.identity.organization_id, value["externalTransactionId"], value.get("id", "")))
            require(not duplicate, "This host transaction is already linked to a payment.", 409)
            value["paidAt"] = value.get("paidAt") or now()
        else:
            require(not value.get("externalTransactionId"), "Only paid milestones may link a transaction.")

    def conflicts(self, candidate):
        rows = self.db.query("SELECT payload_json FROM wp_events WHERE organization_id=?", (self.identity.organization_id,))
        events = [json.loads(row["payload_json"]) for row in rows]
        result = collision(candidate, events)
        for conflict in result:
            if conflict["weddingId"] != self.project["id"] and "admin" not in self.identity.roles:
                member = self.db.query_one("SELECT user_id FROM wp_members WHERE wedding_id=? AND user_id=?", (conflict["weddingId"], self.identity.user_id))
                if not member:
                    conflict["title"] = "Resource booked in another wedding"
                    conflict.pop("eventId", None)
                    conflict.pop("weddingId", None)
        return result

    def full_readiness(self, filtered=False):
        services, tasks, milestones, issues = (self.items(c, filtered) for c in ("services", "tasks", "milestones", "issues"))
        health = readiness(services, tasks, milestones, issues, self.dependencies())
        health["dateScheduled"] = bool(self.project.get("weddingDate"))
        health["ready"] = health["ready"] and health["dateScheduled"]
        return health

    def dashboard(self, action):
        health = self.full_readiness(filtered=True)
        if action == "readiness":
            return 200, health
        services = self.items("services")
        tasks = self.items("tasks")
        active_ids = {s["id"] for s in services if s.get("enabled", True) and s["status"] not in {"not_applicable", "cancelled"} and not s.get("aftercare")}
        live_tasks = [t for t in tasks if (not t.get("serviceId") or t["serviceId"] in active_ids) and t["status"] not in {"done", "cancelled"} and not t.get("aftercare")]
        edges = self.dependencies()
        task_ids = {task["id"] for task in live_tasks}
        critical_path = {task["id"] for task in live_tasks if task.get("priority") == "critical"}
        pending = list(critical_path)
        while pending:
            successor = pending.pop()
            for edge in edges:
                if edge["successor_id"] == successor and edge["predecessor_id"] in task_ids and edge["predecessor_id"] not in critical_path:
                    critical_path.add(edge["predecessor_id"])
                    pending.append(edge["predecessor_id"])
        waiting = {edge["successor_id"] for edge in edges if edge["predecessor_id"] in task_ids}
        priorities = sorted(live_tasks, key=lambda t: (t["id"] in waiting, t["status"] != "blocked", t["id"] not in critical_path, t.get("dueAt") or "9999", t["createdAt"]))
        clock = datetime.now(timezone.utc)
        due = [t for t in live_tasks if t.get("dueAt") and datetime.fromisoformat(t["dueAt"]) <= clock + timedelta(days=7)]
        for service in services:
            related = [t for t in tasks if t.get("serviceId") == service["id"] and t["status"] != "cancelled"]
            open_tasks = sorted([t for t in related if t["status"] != "done"], key=lambda t: t.get("dueAt") or "9999")
            service.update(taskTotal=len(related), taskDone=sum(t["status"] == "done" for t in related), nextTask=open_tasks[0] if open_tasks else None)
        events = sorted(self.items("events"), key=lambda e: e["startAt"])
        vendors = self.items("vendors")
        if action == "run-sheet":
            # This is the only offline export source. No documents, private notes or financial amounts.
            return 200, {"wedding": {k: self.project.get(k) for k in ("id", "title", "weddingDate", "timezone", "churchLocation", "venueLocation")},
                         "events": [{k: e.get(k) for k in ("id", "title", "startAt", "endAt", "cue", "location", "ownerUserId", "backupOwnerUserId", "status", "version")} for e in events if e.get("eventType") == "run_sheet"],
                         "contacts": [{k: v.get(k) for k in ("id", "name", "phone", "contactName", "arrivalAt", "arrivedAt", "status")} for v in vendors],
                         "issues": [{k: issue.get(k) for k in ("id", "title", "severity", "ownerUserId", "action", "status", "version")} for issue in self.items("issues") if issue["status"] != "resolved"],
                         "generatedAt": now(), "expiresAt": (clock + timedelta(hours=24)).isoformat(), "userId": self.identity.user_id}
        budget = budget_summary(self.project, self.items("budget_lines", False), self.items("payments", False)) if self.staff() else None
        guests = self.items("guests")
        return 200, {"wedding": self.public_wedding(), "readiness": health, "services": services, "nextActions": priorities[:12],
                     "tasksDueSoon": len(due), "overdueTasks": sum(datetime.fromisoformat(t["dueAt"]) < clock for t in due),
                     "milestones": self.items("milestones"), "upcomingEvents": [e for e in events if datetime.fromisoformat(e["endAt"]) >= clock][:6],
                     "vendorsConfirmed": sum(v["status"] in {"confirmed", "delivered", "closed"} for v in vendors), "vendorsTotal": len(vendors),
                     "approvalsWaiting": sum(d["status"] == "under_review" for d in self.items("documents")), "budget": budget,
                     "guestSummary": {"invited": sum(g["partySize"] for g in guests), "accepted": sum(g["partySize"] for g in guests if g["rsvpStatus"] == "accepted"), "pending": sum(g["partySize"] for g in guests if g["rsvpStatus"] == "pending")},
                     "dependencies": [e for e in self.dependencies() if e["predecessor_id"] in {t["id"] for t in tasks} and e["successor_id"] in {t["id"] for t in tasks}]}

    def activity(self):
        require(self.method == "GET", "Method not allowed.", 405)
        rows = self.db.query("SELECT * FROM wp_audit WHERE organization_id=? AND wedding_id=? ORDER BY created_at DESC,id DESC", (self.identity.organization_id, self.project["id"]))
        visible = []
        for row in rows:
            collection = row["collection"]
            before = json.loads(row["before_json"]) if row["before_json"] else None
            after = json.loads(row["after_json"]) if row["after_json"] else None
            if (after or before or {}).get("visibility") == "restricted" and "counseling" not in self.identity.permissions:
                continue
            if not self.staff():
                if collection not in {"tasks", "services", "documents", "events", "milestones", "boards"}:
                    continue
                current = self.store.item(collection, self.project["id"], row["entity_id"])
                if not current or not self.visible(collection, current):
                    continue
                before = after = None
            visible.append({"id": row["id"], "actorUserId": row["actor_user_id"], "action": row["action"], "collection": collection,
                            "entityId": row["entity_id"], "before": before, "after": after, "createdAt": row["created_at"]})
        return 200, self.paginate(visible)

    def task_preview(self, previous, due_at):
        due_at = instant(due_at, "Deadline")
        warnings = []
        edges = self.dependencies()
        versions = []
        for edge in edges:
            if previous["id"] not in {edge["predecessor_id"], edge["successor_id"]}:
                continue
            linked = self.item("tasks", edge["successor_id"] if edge["predecessor_id"] == previous["id"] else edge["predecessor_id"], False)
            versions.append([linked["id"], linked["version"]])
            first_due, second_due = (due_at, linked.get("dueAt")) if edge["predecessor_id"] == previous["id"] else (linked.get("dueAt"), due_at)
            if first_due and second_due and first_due > second_due:
                warnings.append({"taskId": linked["id"], "message": "Successor would be due before its prerequisite.",
                                 "title": linked["title"] if self.visible("tasks", linked) else "Another assigned task"})
        result = {"before": previous.get("dueAt"), "after": due_at, "warnings": warnings}
        result["previewToken"] = digest({"id": previous["id"], "version": previous["version"], "result": result, "edges": edges, "versions": versions})
        return result

    def workflow_route(self, collection, item_id, actions):
        if collection == "services" and actions == ["questionnaire-details"]:
            return self.service_questionnaire(item_id)
        previous = self.item(collection, item_id)
        action = actions[0]
        require(self.method == "POST", "Method not allowed.", 405)
        if collection == "tasks" and action == "schedule-preview":
            require(self.staff() or "coordinator" in self.roles and self.allowed_service(previous.get("serviceId")), "Deadline changes require an assigned coordinator.", 403)
            return 200, self.task_preview(previous, self.body.get("dueAt"))
        self.version(previous, collection)
        if collection == "services" and action in {"template-upgrade-preview", "template-upgrade"}:
            return self.template_upgrade(previous, action == "template-upgrade-preview")
        if collection == "tasks" and action == "dependencies":
            require(self.staff(), "Dependencies require a lead planner.", 403)
            predecessor_id = self.body.get("predecessorTaskId")
            predecessor = self.item("tasks", predecessor_id, False)
            if self.body.get("remove"):
                self.db.execute("DELETE FROM wp_dependencies WHERE wedding_id=? AND predecessor_id=? AND successor_id=?", (self.project["id"], predecessor_id, item_id))
            else:
                require(not would_cycle(self.dependencies(), predecessor_id, item_id), "This dependency creates a cycle.", 409)
                require(not predecessor.get("dueAt") or not previous.get("dueAt") or predecessor["dueAt"] <= previous["dueAt"], "The prerequisite is due after this task. Review the schedule first.", 409)
                require(previous["status"] != "done" or predecessor["status"] == "done", "A completed task cannot depend on incomplete work.", 409)
                self.db.execute("INSERT INTO wp_dependencies(wedding_id,predecessor_id,successor_id) VALUES(?,?,?) ON CONFLICT DO NOTHING", (self.project["id"], predecessor_id, item_id))
            result = self.save_item("tasks", previous, previous, "dependencies_changed")
            return 200, {"task": self.public_item("tasks", result), "dependencies": self.dependencies()}
        if collection == "services" and action in {"verify", "complete"}:
            require(self.staff() or "coordinator" in self.roles and self.allowed_service(item_id) or "church" in self.roles and previous["category"] == "spiritual", "You cannot verify this service.", 403)
            if previous.get("code") == "CHURCH":
                require(bool(self.roles & {"admin", "planner", "church"}), "Church verification requires an authorized planner or liaison.", 403)
            if previous.get("code") in {"CHURCH", "VENUE"}:
                require(self.project.get("weddingDate"), "Set the wedding date before confirming a church or venue reservation.", 409)
            evidence = text(self.body.get("evidence", ""), "Readiness evidence", True)
            require(previous.get("enabled", True) and previous["status"] not in {"cancelled", "not_applicable"}, "Enable the service before verification.", 409)
            if action == "verify":
                checks = [t for t in self.items("tasks", False) if t.get("serviceId") == item_id and t.get("required", True) and t["status"] != "done"]
                documents = [d for d in self.items("documents", False) if d.get("serviceId") == item_id and d.get("required") and d["status"] != "approved"]
                milestones = [m for m in self.items("milestones", False) if m.get("serviceId") == item_id and m.get("required") and m["status"] != "verified"]
                issues = [i for i in self.items("issues", False) if i.get("serviceId") == item_id and i.get("severity") == "critical" and i["status"] != "resolved"]
                require(not checks and not documents and not milestones and not issues and not previous.get("blockerSummary"), "Required checks, approvals or blockers are still outstanding.", 409,
                        outstanding={"tasks": len(checks), "documents": len(documents), "milestones": len(milestones), "issues": len(issues)})
                require(previous["status"] != "completed", "A completed service cannot be reconfirmed.", 409)
                result = {**previous, "status": "confirmed", "confirmedAt": now(), "verifiedByUserId": self.identity.user_id, "evidence": evidence}
            else:
                require(previous["status"] == "confirmed", "Confirm readiness before recording delivery.", 409)
                occurred = instant(self.body.get("occurredAt"), "Delivery time")
                require(occurred and datetime.fromisoformat(occurred) <= datetime.now(timezone.utc), "Delivery must have actually occurred.")
                result = {**previous, "status": "completed", "completedAt": occurred, "completionEvidence": evidence}
            return 200, self.public_item("services", self.save_item("services", result, previous, action))
        if collection == "documents" and action == "versions":
            return self.upload_document(previous)
        if collection == "documents" and action == "review":
            return self.review_document(previous)
        raise ApiError(404, "Route not found.")

    def upload_document(self, document):
        require(self.staff() or "coordinator" in self.roles and self.allowed_service(document.get("serviceId")) or document.get("requestedFromUserId") == self.identity.user_id or bool(self.roles & {"couple", "vendor", "church"}) and self.visible("documents", document), "This document is not assigned to you.", 403)
        require(set(self.body) <= {"filename", "mimeType", "contentBase64", "version"}, "Invalid upload fields.")
        filename = text(self.body.get("filename", ""), "Filename", True, 180)
        require("/" not in filename and "\\" not in filename and not any(ord(c) < 32 for c in filename), "Invalid filename.")
        mime = self.body.get("mimeType")
        require(mime in {"application/pdf", "image/png", "image/jpeg", "text/plain"}, "Upload a PDF, PNG, JPEG or text file.")
        content = self.body.get("contentBase64")
        require(isinstance(content, str) and len(content) <= 1_400_000, "Files must be 1 MB or smaller.", 413)
        try:
            binary = base64.b64decode(content, validate=True)
        except ValueError:
            raise ApiError(400, "Invalid file encoding.")
        require(0 < len(binary) <= 1_048_576, "Files must be between 1 byte and 1 MB.", 413)
        if mime == "application/pdf":
            require(binary.startswith(b"%PDF-"), "This file is not a PDF.")
        elif mime == "image/png":
            require(binary.startswith(b"\x89PNG\r\n\x1a\n"), "This file is not a PNG.")
        elif mime == "image/jpeg":
            require(binary.startswith(b"\xff\xd8\xff"), "This file is not a JPEG.")
        else:
            try:
                binary.decode("utf-8")
            except UnicodeError:
                raise ApiError(400, "Text files must use UTF-8.")
        revision = document.get("revision", 0) + 1
        file = self.store.put("files", self.project["id"], {"documentRequestId": document["id"], "serviceId": document.get("serviceId"), "ownerUserId": self.identity.user_id,
                    "visibility": document["visibility"], "filename": filename, "mimeType": mime, "contentBase64": content, "size": len(binary), "status": "stored"})
        version = self.store.put("document_versions", self.project["id"], {"documentRequestId": document["id"], "serviceId": document.get("serviceId"), "fileId": file["id"],
                    "revision": revision, "filename": filename, "size": len(binary), "uploadedByUserId": self.identity.user_id, "visibility": document["visibility"], "status": "uploaded"})
        updated = self.save_item("documents", {**document, "revision": revision, "latestVersionId": version["id"], "status": "under_review", "uploadedAt": now()}, document, "revision_submitted")
        if document.get("required"):
            self.invalidate_service(document.get("serviceId"))
        reviewer_roles = {"couple"} if document.get("reviewerRole") == "couple" else {"church"} if document.get("reviewerRole") == "church" else {"planner", "admin"}
        self.enqueue("approval_waiting", document["id"], self.members_with_roles(reviewer_roles), "A document revision is waiting for your decision.", document.get("serviceId"), revision)
        return 201, {"document": self.public_item("documents", updated), "revision": version}

    def review_document(self, document):
        reviewer_role = document.get("reviewerRole", "planner")
        allowed = (reviewer_role == "planner" and self.staff() or reviewer_role == "couple" and "couple" in self.roles or
                   reviewer_role == "church" and "church" in self.roles and self.service_cache.get(document.get("serviceId"), {}).get("category") == "spiritual")
        require(allowed, "This decision requires the designated approver.", 403)
        require(set(self.body) <= {"decision", "comment", "documentVersionId", "version"}, "Invalid review fields.")
        decision = self.body.get("decision")
        require(decision in {"approved", "changes_requested", "rejected"}, "Choose a valid review decision.")
        require(document["status"] == "under_review" and document.get("latestVersionId"), "Upload a revision before reviewing it.", 409)
        require(self.body.get("documentVersionId") == document["latestVersionId"], "Review the latest file revision.", 409)
        comment = text(self.body.get("comment", ""), "Review comment", decision != "approved", 2000)
        review = self.store.put("document_reviews", self.project["id"], {"documentVersionId": document["latestVersionId"], "documentRequestId": document["id"], "revision": document["revision"], "decision": decision,
                    "comment": comment, "reviewerUserId": self.identity.user_id, "reviewedAt": now(), "visibility": document["visibility"], "status": decision})
        updated = self.save_item("documents", {**document, "status": decision, "reviewedAt": review["reviewedAt"]}, document, "reviewed")
        return 200, {"document": self.public_item("documents", updated), "review": review}

    def change_preview(self, new_date):
        shifts, manual, reservations, versions = [], [], [], []
        for collection, field in (("tasks", "dueAt"), ("milestones", "dueAt"), ("documents", "dueAt"), ("payments", "dueOn")):
            for item in self.items(collection, False):
                versions.append([collection, item["id"], item["version"]])
                if item.get("status") in {"done", "paid", "cancelled"}:
                    continue
                if item.get("relativeOffsetDays") is not None and item.get("scheduleMode", "template" if collection == "payments" else "manual") == "template":
                    after = relative_date(new_date, item["relativeOffsetDays"], item.get("aftercare", False)) if field == "dueOn" else due_time(new_date, item["relativeOffsetDays"], item.get("aftercare", False))
                    shifts.append({"collection": collection, "id": item["id"], "title": item.get("title", item.get("label")), "field": field, "before": item.get(field), "after": after})
                elif item.get(field):
                    manual.append({"id": item["id"], "title": item.get("title", item.get("label")), "dueAt": item[field]})
        for collection in ("services", "events", "vendors"):
            for item in self.items(collection, False):
                versions.append([collection, item["id"], item["version"]])
                if collection == "events" and item.get("externalConfirmed") or collection == "vendors" and item["status"] in {"contracted", "confirmed"}:
                    reservations.append({"id": item["id"], "collection": collection, "title": item.get("title", item.get("name")),
                                         "bookedDate": item.get("bookedDate") or item.get("startAt"), "action": "Reconfirm externally; this reservation will stay unchanged."})
        dates = {s["id"]: s["after"] for s in shifts if s["collection"] == "tasks"}
        tasks = {t["id"]: t for t in self.items("tasks", False)}
        violations = []
        edges = self.dependencies()
        for edge in edges:
            first, second = tasks[edge["predecessor_id"]], tasks[edge["successor_id"]]
            first_due, second_due = dates.get(first["id"], first.get("dueAt")), dates.get(second["id"], second.get("dueAt"))
            if first_due and second_due and first_due > second_due:
                violations.append({"predecessor": first["title"], "successor": second["title"], "message": "Successor is due before its prerequisite."})
        result = {"oldDate": self.project.get("weddingDate"), "newDate": new_date, "shifts": shifts,
                  "manualDeadlines": manual, "externalReservations": reservations, "dependencyWarnings": violations,
                  "overdueBaseline": sum(overdue(s["after"]) for s in shifts)}
        result["previewToken"] = digest({"preview": result, "weddingVersion": self.project["version"], "versions": sorted(versions), "dependencies": edges})
        return result

    def date_change(self, preview_only):
        require(self.method == "POST" and self.staff(), "Date changes require a lead planner.", 403)
        new_date = civil_date(self.body.get("weddingDate"), "Wedding date")
        require(new_date != self.project.get("weddingDate"), "Choose a different wedding date.")
        preview = self.change_preview(new_date)
        if preview_only:
            return 200, preview
        self.version(self.project)
        reason = text(self.body.get("reason", ""), "Date change reason", True)
        require(self.body.get("previewToken") == preview["previewToken"], "The plan changed since this preview. Review a fresh preview before saving.", 409, preview=preview)
        for shift in preview["shifts"]:
            previous = self.item(shift["collection"], shift["id"], False)
            updated = {**previous, shift["field"]: shift["after"], "dateChangeReason": reason}
            if shift["collection"] == "milestones":
                updated.update(status="todo", evidence="", verifiedAt=None, verifiedByUserId=None)
            self.save_item(shift["collection"], updated, previous, "date_shifted")
        for previous in list(self.service_cache.values()):
            if not previous.get("templateSnapshot"):
                continue
            template = previous["templateSnapshot"]
            updated = {**previous, "targetDate": relative_date(new_date, template["relativeOffsetDays"], previous.get("aftercare", False))}
            if previous["status"] == "confirmed":
                updated.update(status="in_progress", blockerSummary="Reconfirm arrangements for the new wedding date.")
            self.save_item("services", updated, previous, "date_shifted")
        previous = self.project
        self.project = self.store.update_wedding({**previous, "weddingDate": new_date}, previous["version"])
        require(self.project, "This wedding changed. Reload before saving.", 409)
        self.store.audit(self.project["id"], self.identity.user_id, "date_changed", "weddings", self.project["id"], previous,
                         {**self.project, "reason": reason, "externalReservationsUnchanged": len(preview["externalReservations"])})
        self.enqueue("date_changed", self.project["id"], self.members_with_roles({"planner", "admin", "coordinator", "couple"}), "The wedding date changed. Review the agreed plan.", revision=self.project["version"])
        return 200, {"wedding": self.public_wedding(), "preview": preview}

    def members_with_roles(self, roles):
        rows = self.db.query("SELECT user_id,payload_json FROM wp_members WHERE wedding_id=?", (self.project["id"],))
        return [r["user_id"] for r in rows if set(json.loads(r["payload_json"]).get("roles", [])) & roles]

    def enqueue(self, event_key, entity_id, recipients, title, service_id=None, revision=1):
        for recipient in set(recipients):
            row = self.db.query_one("SELECT payload_json FROM wp_members WHERE wedding_id=? AND user_id=?", (self.project["id"], recipient))
            if not row or not json.loads(row["payload_json"]).get("notificationsEnabled", True):
                continue
            key = f"event:{event_key}:{entity_id}:{revision}:{recipient}"
            if self.db.query_one("SELECT id FROM wp_notifications WHERE wedding_id=? AND code=?", (self.project["id"], key)):
                continue
            self.store.put("notifications", self.project["id"], {"title": title, "status": "pending", "visibility": "internal", "ownerUserId": recipient,
                "serviceId": service_id, "eventKey": event_key, "entityId": entity_id, "channel": "in_app", "dedupeKey": key, "scheduledAt": now(), "attempts": 0})

    def reminders_route(self, parts):
        require(self.method == "POST", "Method not allowed.", 405)
        if parts == ["preferences"]:
            require(type(self.body.get("enabled")) is bool and self.member, "Choose a notification preference.")
            updated = {**self.member, "notificationsEnabled": self.body["enabled"]}
            self.db.execute("UPDATE wp_members SET payload_json=? WHERE wedding_id=? AND user_id=?", (encode(updated), self.project["id"], self.identity.user_id))
            return 200, {"enabled": updated["notificationsEnabled"]}
        require(parts == ["generate"] and self.staff(), "Reminder generation requires a lead planner.", 403)
        clock = datetime.now(timezone.utc)
        day = clock.date().isoformat()
        candidates = []
        for task in self.items("tasks", False):
            service = self.service_cache.get(task.get("serviceId"), {})
            if task["status"] in {"done", "cancelled"} or not service.get("enabled", True) or service.get("status") in {"cancelled", "not_applicable"} or not task.get("dueAt"):
                continue
            due = datetime.fromisoformat(task["dueAt"])
            if due <= clock + timedelta(days=7):
                candidates.append(("task_overdue" if due < clock else "task_due", task["id"], task.get("ownerUserId"), task.get("serviceId"), "A planning task needs attention."))
        for document in self.items("documents", False):
            if document["status"] == "under_review" or document.get("required") and document["status"] != "approved" and document.get("dueAt") and datetime.fromisoformat(document["dueAt"]) <= clock + timedelta(days=7):
                candidates.append(("approval_waiting" if document["status"] == "under_review" else "document_due", document["id"], document.get("requestedFromUserId") or self.project["leadPlannerUserId"], document.get("serviceId"), "A shared document requires attention."))
        for payment in self.items("payments", False):
            if payment["status"] == "pending" and payment.get("dueOn") and payment["dueOn"] <= (clock + timedelta(days=7)).date().isoformat():
                candidates.append(("payment_due", payment["id"], self.project["leadPlannerUserId"], payment.get("serviceId"), "A payment obligation needs reconciliation."))
        for vendor in self.items("vendors", False):
            if vendor["status"] in {"selected", "contracted"} and vendor.get("bookedDate") and vendor["bookedDate"] <= (clock + timedelta(days=14)).date().isoformat():
                candidates.append(("vendor_unconfirmed", vendor["id"], vendor.get("ownerUserId") or self.project["leadPlannerUserId"], vendor.get("serviceId"), "A provider still needs confirmation."))
        if self.project.get("weddingDate"):
            days_left = (datetime.fromisoformat(self.project["weddingDate"]).date() - clock.date()).days
            if days_left in {30, 14, 7, 1}:
                candidates.append((f"readiness_{days_left}", self.project["id"], self.project["leadPlannerUserId"], None, "Review the wedding readiness checkpoint."))
        created = 0
        for event_key, entity_id, recipient, service_id, message in candidates:
            recipient = recipient or self.project["leadPlannerUserId"]
            row = self.db.query_one("SELECT payload_json FROM wp_members WHERE wedding_id=? AND user_id=?", (self.project["id"], recipient))
            if not row or not json.loads(row["payload_json"]).get("notificationsEnabled", True):
                continue
            dedupe = f"{event_key}:{entity_id}:{recipient}:{day}"
            if self.db.query_one("SELECT id FROM wp_notifications WHERE wedding_id=? AND code=?", (self.project["id"], dedupe)):
                continue
            self.store.put("notifications", self.project["id"], {"title": message, "status": "pending", "visibility": "internal",
                "ownerUserId": recipient, "serviceId": service_id, "eventKey": event_key, "entityId": entity_id, "channel": "in_app",
                "dedupeKey": dedupe, "scheduledAt": now(), "attempts": 0})
            created += 1
        self.store.audit(self.project["id"], self.identity.user_id, "reminders_generated", "notifications", self.project["id"], after={"created": created})
        return 200, {"created": created, "channel": "in_app"}
