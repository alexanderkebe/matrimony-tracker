"""The couple questionnaire and its planning workspace share one durable record link."""

import json

from . import catalog
from .auth import legacy_staff
from .domain import digest, integer, require, text
from .storage import encode, now


def questionnaire_source(record):
    plan = json.loads(record["plan_json"])
    details, choices = plan.get("details", {}), plan.get("services", {})
    require(isinstance(details, dict) and isinstance(choices, dict), "Invalid couple questionnaire.")
    require(all(isinstance(value, dict) and isinstance(value.get("options", {}), dict) for value in choices.values()), "Invalid questionnaire service choices.")
    unknown = [key for key, value in choices.items() if isinstance(value, dict) and value.get("selected") and key not in catalog.LEGACY_CODES]
    require(not unknown, "The questionnaire contains an unknown service. Review its selection.", services=unknown)
    codes = [code for key, code in catalog.LEGACY_CODES.items() if choices.get(key, {}).get("selected")]
    venues = details.get("venues") or {}
    require(isinstance(venues, dict), "Invalid questionnaire venues.")
    types = details.get("eventVenueTypes")
    if isinstance(types, list):
        venues = {key: value for key, value in venues.items() if key in types}
    fields = {
        "title": " & ".join(" ".join(str(details.get(key, "")).split()) for key in ("brideName", "groomName")),
        "weddingDate": details.get("weddingDate") or None, "language": plan.get("lang", "en"),
        "churchLocation": venues.get("church", "") if isinstance(types, list) else venues.get("church", details.get("sacredVenue", "")),
        "venueLocation": next((venues.get(key) for key in ("hall", "hotel", "outdoor", "home", "restaurant", "other") if venues.get(key)), "") if isinstance(types, list) else venues.get("hall", details.get("receptionVenue", "")),
        "package": "full_planning" if details.get("scopeFullPlanning") else "day_of" if details.get("scopeDayOfCoordination") else "custom",
    }
    # A hall's capacity is not an expected attendance, and the professional fee is not the wedding budget.
    guests = details.get("guestEstimate")
    if guests in (None, "") and choices.get("food-drinks", {}).get("selected"):
        guests = choices["food-drinks"].get("options", {}).get("guests")
    if guests not in (None, ""):
        require(str(guests).isdecimal(), "Expected guests must be a whole number.")
        fields["guestEstimate"] = integer(int(guests), "Expected guests", 100000)
    return {"recordId": record["id"], "details": details, "services": choices, "language": plan.get("lang", "en"),
            "mappedFields": fields, "selectedServiceCodes": codes, "signature": digest(plan)}


class QuestionnaireMixin:
    def questionnaire_record(self, record_id, lock=False):
        require(legacy_staff(self.identity), "Questionnaire access requires the host's client directory permission.", 403)
        require(str(record_id).isdecimal() and int(record_id) > 0, "Invalid couple record.")
        sql = "SELECT id,plan_json FROM records WHERE id=?"
        if lock and not hasattr(self.db, "path"):
            sql += " FOR UPDATE"
        row = self.db.query_one(sql, (int(record_id),))
        require(row, "Couple record not found.", 404)
        return row

    def linked_questionnaire_wedding(self, record_id):
        rows = self.db.query("SELECT id FROM wp_weddings WHERE organization_id=? AND client_id=? ORDER BY created_at,id",
                             (self.identity.organization_id, int(record_id)))
        require(len(rows) <= 1, "This couple has multiple plans. Open the intended plan to update its questionnaire.", 409)
        if rows:
            self.authorize(rows[0]["id"])
            require(self.staff(), "Updating this plan requires its lead planner.", 403)
            return self.project
        return None

    def clients_route(self, parts):
        if not parts:
            return self.clients()
        require(len(parts) in {1, 2}, "Route not found.", 404)
        require(self.method == "GET" and len(parts) == 1 or self.method == "POST" and parts[1:] == ["plan"], "Method not allowed.", 405)
        record = self.questionnaire_record(parts[0], lock=self.method == "POST")
        source = questionnaire_source(record)
        linked = self.linked_questionnaire_wedding(record["id"])
        if self.method == "GET":
            return 200, {"fields": source["mappedFields"], "selectedServiceCodes": source["selectedServiceCodes"],
                         "signature": source["signature"], "weddingId": linked["id"] if linked else None}
        require(bool(self.identity.roles & {"admin", "planner"}) or linked, "Only a planner can create a plan.", 403)
        require(set(self.body) <= {"previewToken", "resolutions"}, "Unrecognized handoff fields.")
        require(source["selectedServiceCodes"], "Choose at least one service in the questionnaire.")
        if linked:
            self.lock_questionnaire_wedding()
            return 200, self.sync_questionnaire(source)
        original = self.body
        self.body = {**source["mappedFields"], "clientId": record["id"], "selectedServiceCodes": source["selectedServiceCodes"]}
        self.root_route()
        self.body = original
        return 201, self.sync_questionnaire(source)

    def lock_questionnaire_wedding(self):
        if not hasattr(self.db, "path"):
            self.db.query_one("SELECT id FROM wp_weddings WHERE id=? AND organization_id=? FOR UPDATE", (self.project["id"], self.identity.organization_id))
            self.project = self.store.wedding(self.project["id"])
            self.service_cache = {s["id"]: s for s in self.store.items("services", self.project["id"])}

    def link_questionnaire(self):
        require(self.method == "POST" and self.staff(), "Linking a questionnaire requires a lead planner.", 403)
        require(set(self.body) <= {"clientId", "version", "previewToken", "resolutions"}, "Unrecognized questionnaire fields.")
        record = self.questionnaire_record(self.body.get("clientId", self.project.get("clientId")), lock=True)
        self.lock_questionnaire_wedding()
        self.version(self.project)
        require(not self.project.get("clientId") or self.project["clientId"] == record["id"], "This plan already has a couple questionnaire.", 409)
        other = self.db.query_one("SELECT id FROM wp_weddings WHERE organization_id=? AND client_id=? AND id<>?",
                                  (self.identity.organization_id, record["id"], self.project["id"]))
        require(not other, "This couple already has a planning workspace. Open that plan to continue.", 409,
                weddingId=other["id"] if other else None)
        return 200, self.sync_questionnaire(questionnaire_source(record))

    def sync_questionnaire(self, source):
        require(self.project["status"] not in {"archived", "cancelled"}, "This plan is read-only. Reopen it before updating the questionnaire.", 409)
        previous_source = self.project.get("questionnaire", {})
        old_fields, fields = previous_source.get("mappedFields", {}), source["mappedFields"]
        values, conflicts = {}, []
        for key, value in fields.items():
            if key in old_fields and old_fields[key] == value:
                continue
            current = self.project.get(key)
            if key in old_fields and current != old_fields[key] and current != value:
                conflicts.append({"field": key, "questionnaire": value, "planner": current})
            elif current != value:
                values[key] = value
        resolutions = self.body.get("resolutions", {})
        require(isinstance(resolutions, dict) and all(key in fields and value in {"questionnaire", "planner"} for key, value in resolutions.items()), "Invalid field resolution.")
        for conflict in conflicts:
            if resolutions.get(conflict["field"]) == "questionnaire":
                values[conflict["field"]] = conflict["questionnaire"]
        date_changed = self.project["status"] != "draft" and "weddingDate" in values
        date_impact = self.change_preview(values["weddingDate"]) if date_changed else None
        date_conflict = next((c for c in conflicts if c["field"] == "weddingDate"), None)
        possible_date_impact = date_impact or (self.change_preview(fields["weddingDate"]) if date_conflict and self.project["status"] != "draft" else None)
        preview = {"title": fields["title"], "conflicts": conflicts, "dateImpact": date_impact,
                   "selectedServiceCodes": source["selectedServiceCodes"]}
        preview["dateImpact"] = possible_date_impact
        # Bind approval to both source contents and all affected plan versions, even when choices change.
        preview["previewToken"] = digest({"source": source["signature"], "version": self.project["version"],
            "conflicts": conflicts, "dateImpact": self.change_preview(fields["weddingDate"]) if self.project.get("weddingDate") != fields.get("weddingDate") else None,
            "services": sorted((s["id"], s["version"]) for s in self.service_cache.values())})
        require(not (conflicts or date_changed) or self.body.get("previewToken") == preview["previewToken"] and all(c["field"] in resolutions for c in conflicts),
                "Review the questionnaire changes before updating the plan.", 409, questionnairePreview=preview)
        if previous_source.get("signature") == source["signature"] and self.project.get("clientId") == source["recordId"]:
            return self.public_wedding()
        if date_changed:
            original, original_headers = self.body, self.headers
            self.headers = {key: value for key, value in self.headers.items() if key.lower() != "if-match"}
            self.body = {"version": self.project["version"], "weddingDate": values.pop("weddingDate"),
                         "reason": "Wedding date updated in the couple questionnaire.", "previewToken": date_impact["previewToken"]}
            try:
                self.date_change(False)
            finally:
                self.body, self.headers = original, original_headers
        previous = self.project
        self.project = self.store.update_wedding({**previous, **values, "clientId": source["recordId"],
            "questionnaire": {**source, "syncedAt": now()}}, previous["version"])
        require(self.project, "This wedding changed. Reload before continuing.", 409)
        self.store.audit(self.project["id"], self.identity.user_id, "questionnaire_synced", "weddings", self.project["id"],
                         {"recordId": previous.get("clientId")}, {"recordId": source["recordId"], "fields": sorted(values), "services": source["selectedServiceCodes"]})
        codes = source["selectedServiceCodes"]
        if self.project["status"] == "draft":
            require(codes, "Choose at least one service in the questionnaire.")
            original, original_headers = self.body, self.headers
            self.headers = {key: value for key, value in self.headers.items() if key.lower() != "if-match"}
            self.body = {"version": self.project["version"], "selectedServiceCodes": codes}
            try:
                self.activate()
            finally:
                self.body, self.headers = original, original_headers
        elif previous_source.get("selectedServiceCodes") != codes:
            require(self.project["status"] not in {"completed", "event_live"}, "Service scope is locked during or after the wedding.", 409)
            missing = [code for code in codes if not any(s.get("code") == code for s in self.service_cache.values())]
            self.instantiate_services(missing)
            for service in list(self.service_cache.values()):
                if service.get("code") not in catalog.LEGACY_CODES.values():
                    continue
                included = service["code"] in codes
                if service.get("enabled", True) != included:
                    self.save_item("services", {**service, "enabled": included}, service, "scope_updated")
            previous = self.project
            self.project = self.store.update_wedding({**previous, "selectedServiceCodes": codes}, previous["version"])
            require(self.project, "This wedding changed. Reload before continuing.", 409)
        for legacy_id, code in catalog.LEGACY_CODES.items():
            service = next((s for s in self.service_cache.values() if s.get("code") == code), None)
            choice = source["services"].get(legacy_id, {})
            if not service or previous_source.get("services", {}).get(legacy_id) == choice and service.get("questionnaireSettings"):
                continue
            settings = {"legacyId": legacy_id, "options": choice.get("options", {}), "notes": choice.get("notes", "")}
            if service.get("questionnaireSettings") != settings:
                self.save_item("services", {**service, "questionnaireSettings": settings}, service, "questionnaire_settings_synced")
        return self.public_wedding()

    def service_questionnaire(self, service_id):
        require(self.staff() and legacy_staff(self.identity), "Service details require the lead planner's questionnaire access.", 403)
        service = self.item("services", service_id)
        legacy_id = next((key for key, code in catalog.LEGACY_CODES.items() if code == service.get("code")), None)
        require(legacy_id and self.project.get("clientId"), "This service has no linked questionnaire.", 404)
        record = self.questionnaire_record(self.project["clientId"], lock=self.method == "POST")
        if self.method == "POST":
            self.lock_questionnaire_wedding()
            service = self.item("services", service_id)
        source = questionnaire_source(record)
        choice = source["services"].get(legacy_id, {})
        if self.method == "GET":
            return 200, {"legacyId": legacy_id, "options": choice.get("options", {}), "notes": choice.get("notes", ""),
                         "recordSignature": source["signature"], "version": service["version"]}
        require(self.method == "POST", "Method not allowed.", 405)
        self.version(service, "services")
        require(set(self.body) <= {"version", "recordSignature", "options", "notes"}, "Unrecognized service details.")
        require(source["signature"] == self.body.get("recordSignature"), "The questionnaire changed. Reopen service details before saving.", 409)
        options = self.body.get("options", {})
        require(isinstance(options, dict) and len(options) <= 50, "Invalid service options.")
        for key, value in options.items():
            text(key, "Option", True, 80)
            require(type(value) in {str, bool, list}, "Invalid service option.")
            if isinstance(value, list):
                require(len(value) <= 50 and all(isinstance(v, str) and len(v) <= 400 for v in value), "Invalid service choices.")
            elif isinstance(value, str):
                text(value, "Service detail", limit=4000)
        notes = text(self.body.get("notes", ""), "Service notes", limit=4000)
        plan = json.loads(record["plan_json"])
        plan.setdefault("services", {})[legacy_id] = {**choice, "options": options, "notes": notes}
        self.db.execute("UPDATE records SET plan_json=?,updated_at=? WHERE id=?", (encode(plan), now(), record["id"]))
        record["plan_json"] = encode(plan)
        self.sync_questionnaire(questionnaire_source(record))
        return 200, self.public_item("services", self.item("services", service_id))
