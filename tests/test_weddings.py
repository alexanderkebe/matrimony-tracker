"""Domain/API acceptance tests run against isolated SQLite, never customer records."""

import base64
import json
import os
import time
import unittest
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

import server
import pg_schema
from wedding_planner.api import Router
from wedding_planner.auth import Identity, authenticate, sign_session
from wedding_planner.domain import ApiError, overdue, relative_date


class WeddingTests(unittest.TestCase):
    def setUp(self):
        pg_schema.fresh()
        self.lead = Identity("lead", "org-a", {"planner"})
        self.admin = Identity("admin", "org-a", {"admin"})

    def call(self, method, path, body=None, identity=None, key=None, version=None):
        headers = {"Idempotency-Key": key or str(uuid4())}
        if version is not None:
            headers["If-Match"] = str(version)
        with server.get_db() as db:
            return Router(db, identity or self.lead, headers).dispatch(method, "/api/v1/" + path, {}, body)

    def create(self, codes=None, wedding_date="2027-05-16"):
        return self.call("POST", "weddings", {"title": "Test couple", "weddingDate": wedding_date,
                         "budgetMinor": 15000000, "selectedServiceCodes": codes or ["VENUE"]})[1]

    def activate(self, codes=None, wedding_date="2027-05-16"):
        wedding = self.create(codes, wedding_date)
        result = self.call("POST", f"weddings/{wedding['id']}/activate", {"version": 1})[1]
        return result["wedding"]

    def items(self, wedding, collection, identity=None):
        return self.call("GET", f"weddings/{wedding['id']}/{collection}", identity=identity)[1]["items"]

    def patch(self, wedding, collection, item, values, identity=None):
        return self.call("PATCH", f"weddings/{wedding['id']}/{collection}/{item['id']}", {**values, "version": item["version"]}, identity=identity)[1]

    def member(self, wedding, user, roles, services=None):
        self.call("POST", f"weddings/{wedding['id']}/members", {"userId": user, "roles": roles, "serviceIds": services or []})
        return Identity(user, "org-a", set(roles))

    def assert_error(self, status, callback):
        with self.assertRaises(ApiError) as error:
            callback()
        self.assertEqual(error.exception.status, status, error.exception.payload)
        return error.exception.payload

    def test_draft_without_date_and_idempotent_transactional_activation(self):
        wedding = self.create(["VENUE", "COUNSELING"], None)
        key = str(uuid4())
        path = f"weddings/{wedding['id']}/activate"
        first = self.call("POST", path, {"version": 1}, key=key)
        replay = self.call("POST", path, {"version": 1}, key=key)
        self.assertEqual(first, replay)
        self.assertEqual(len(self.items(wedding, "services")), 2)
        self.assertEqual(len(self.items(wedding, "tasks")), 6)
        self.assertTrue(all(t["dueAt"] is None for t in self.items(wedding, "tasks")))
        self.assertEqual(wedding["status"], "draft")

    def test_activation_rolls_back_everything_when_a_task_cannot_be_inserted(self):
        wedding = self.create(["VENUE", "SOUND"])
        from wedding_planner.storage import Store
        original = Store.put
        count = 0
        def failing(store, collection, *args, **kwargs):
            nonlocal count
            if collection == "tasks":
                count += 1
                if count == 2:
                    raise RuntimeError("Simulated failure")
            return original(store, collection, *args, **kwargs)
        with patch.object(Store, "put", failing), self.assertRaises(RuntimeError):
            self.call("POST", f"weddings/{wedding['id']}/activate", {"version": 1})
        self.assertEqual(self.items(wedding, "services"), [])
        self.assertEqual(self.items(wedding, "tasks"), [])
        self.assertEqual(self.call("GET", f"weddings/{wedding['id']}")[1]["status"], "draft")

    def test_membership_and_organization_are_required_on_every_read(self):
        wedding = self.activate()
        other = Identity("stranger", "org-a", {"planner"})
        self.assert_error(404, lambda: self.call("GET", f"weddings/{wedding['id']}/dashboard", identity=other))
        self.assertEqual(self.call("GET", "weddings", identity=other)[1]["items"], [])
        alien_admin = Identity("admin", "org-b", {"admin"})
        self.assert_error(404, lambda: self.call("GET", f"weddings/{wedding['id']}", identity=alien_admin))

    def test_guessed_nested_ids_cannot_cross_wedding_boundaries(self):
        first, second = self.activate(), self.activate()
        task = self.items(second, "tasks")[0]
        self.assert_error(404, lambda: self.call("PATCH", f"weddings/{first['id']}/tasks/{task['id']}", {"version": task["version"], "status": "done"}))

    def test_disabled_and_aftercare_services_do_not_reduce_readiness(self):
        wedding = self.activate(["VENUE", "COUNSELING"])
        venue = next(s for s in self.items(wedding, "services") if s["code"] == "VENUE")
        initial = self.call("GET", f"weddings/{wedding['id']}/readiness")[1]
        self.assertEqual(initial["activeServices"], 1)
        self.assertEqual(initial["aftercareServices"], 1)
        self.patch(wedding, "services", venue, {"enabled": False, "reason": "Venue provided by client"})
        health = self.call("GET", f"weddings/{wedding['id']}/readiness")[1]
        self.assertEqual(health["requiredWeight"], 0)
        self.assertEqual(health["criticalBlockers"], 0)
        self.assertFalse(health["ready"])

    def test_service_confirmation_requires_evidence_tasks_and_milestones(self):
        wedding = self.activate()
        service = self.items(wedding, "services")[0]
        path = f"weddings/{wedding['id']}/services/{service['id']}/verify"
        self.assert_error(409, lambda: self.call("POST", path, {"version": 1, "evidence": "Checked"}))
        for task in self.items(wedding, "tasks"):
            self.patch(wedding, "tasks", task, {"status": "done"})
        milestone = self.items(wedding, "milestones")[0]
        self.patch(wedding, "milestones", milestone, {"status": "verified", "evidence": "Site visit, access agreed"})
        confirmed = self.call("POST", path, {"version": 1, "evidence": "Contract and access checked"})[1]
        self.assertEqual(confirmed["status"], "confirmed")
        health = self.call("GET", f"weddings/{wedding['id']}/readiness")[1]
        self.assertTrue(health["ready"])
        self.assert_error(400, lambda: self.call("POST", path.replace("/verify", "/complete"), {"version": 2, "evidence": "Test", "occurredAt": "2199-01-01T12:00:00+03:00"}))

    def test_dependency_cycle_and_premature_completion_are_rejected(self):
        wedding = self.activate(["SOUND"])
        tasks = self.items(wedding, "tasks")
        self.assert_error(409, lambda: self.patch(wedding, "tasks", tasks[1], {"status": "done"}))
        self.assert_error(409, lambda: self.call("POST", f"weddings/{wedding['id']}/tasks/{tasks[0]['id']}/dependencies", {"predecessorTaskId": tasks[2]["id"], "version": 1}))

    def test_manual_deadline_change_requires_a_fresh_preview_and_reason(self):
        wedding = self.activate(["SOUND"])
        task = self.items(wedding, "tasks")[0]
        due = "2027-06-01T09:00:00+03:00"
        self.assert_error(409, lambda: self.patch(wedding, "tasks", task, {"dueAt": due, "reason": "Provider request"}))
        preview = self.call("POST", f"weddings/{wedding['id']}/tasks/{task['id']}/schedule-preview", {"dueAt": due})[1]
        self.assertTrue(preview["warnings"])
        updated = self.patch(wedding, "tasks", task, {"dueAt": due, "reason": "Provider request", "previewToken": preview["previewToken"]})
        self.assertEqual(updated["dueAt"], "2027-06-01T06:00:00+00:00")
        self.assertEqual(updated["scheduleMode"], "manual")

    def test_date_preview_preserves_confirmed_reservations_and_manual_deadlines(self):
        wedding = self.activate(["SOUND"])
        event = self.call("POST", f"weddings/{wedding['id']}/events", {"title": "Confirmed reservation", "startAt": "2027-05-16T12:00:00+03:00", "endAt": "2027-05-16T14:00:00+03:00", "externalConfirmed": True})[1]
        new_date = "2027-06-16"
        preview = self.call("POST", f"weddings/{wedding['id']}/date-change-preview", {"weddingDate": new_date})[1]
        self.assertEqual(len(preview["shifts"]), 3)
        self.assertEqual(len(preview["externalReservations"]), 1)
        self.call("POST", f"weddings/{wedding['id']}/date-change", {"weddingDate": new_date, "reason": "Date agreed by couple", "previewToken": preview["previewToken"], "version": wedding["version"]})
        unchanged = self.items(wedding, "events")[0]
        self.assertEqual(unchanged["startAt"], event["startAt"])
        self.assertNotEqual(self.items(wedding, "tasks")[0]["dueAt"][:10], "2027-01-16")

    def test_date_change_rejects_preview_when_any_scheduled_record_changes(self):
        wedding = self.activate(["SOUND"])
        preview = self.call("POST", f"weddings/{wedding['id']}/date-change-preview", {"weddingDate": "2027-06-16"})[1]
        self.patch(wedding, "tasks", self.items(wedding, "tasks")[0], {"status": "in_progress"})
        self.assert_error(409, lambda: self.call("POST", f"weddings/{wedding['id']}/date-change", {"weddingDate": "2027-06-16", "reason": "Test", "previewToken": preview["previewToken"], "version": wedding["version"]}))

    def test_concurrent_edits_have_one_winner_and_meaningful_latest_resource(self):
        wedding = self.activate(["SOUND"])
        task = self.items(wedding, "tasks")[0]
        def edit(status):
            try:
                return self.patch(wedding, "tasks", task, {"status": status})
            except ApiError as error:
                return error
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(edit, ["in_progress", "done"]))
        conflicts = [r for r in results if isinstance(r, ApiError)]
        self.assertEqual(len(conflicts), 1)
        self.assertEqual(conflicts[0].status, 409)
        self.assertEqual(conflicts[0].payload["latest"]["version"], 2)
        self.assertIn("changedFields", conflicts[0].payload)

    def test_finance_reconciles_without_double_counting_host_transactions(self):
        wedding = self.activate(["SOUND"])
        line = self.call("POST", f"weddings/{wedding['id']}/budget-lines", {"label": "Sound", "estimatedMinor": 10000, "committedMinor": 10000, "actualMinor": 10000})[1]
        payment = self.call("POST", f"weddings/{wedding['id']}/payment-milestones", {"label": "Deposit", "budgetLineId": line["id"], "amountMinor": 4000, "dueOn": "2027-04-01"})[1]
        self.patch(wedding, "payment-milestones", payment, {"status": "paid", "externalTransactionId": "host-tx-1", "evidence": "Bank receipt reconciled", "reason": "Received"})
        second = self.call("POST", f"weddings/{wedding['id']}/payment-milestones", {"label": "Final", "budgetLineId": line["id"], "amountMinor": 6000})[1]
        self.assert_error(409, lambda: self.patch(wedding, "payment-milestones", second, {"status": "paid", "externalTransactionId": "host-tx-1", "evidence": "Same receipt", "reason": "Test"}))
        summary = self.call("GET", f"weddings/{wedding['id']}/dashboard")[1]["budget"]
        self.assertEqual(summary["paidMinor"], 4000)
        self.assertEqual(summary["actualMinor"], 10000)
        self.assertEqual(summary["outstandingMinor"], 6000)

    def test_noninteger_and_negative_money_is_rejected(self):
        wedding = self.activate()
        for amount in (-1, 1.5, True, "100"):
            self.assert_error(400, lambda amount=amount: self.call("POST", f"weddings/{wedding['id']}/budget-lines", {"label": "Invalid", "committedMinor": amount}))

    def test_client_and_vendor_views_never_include_internal_costs(self):
        wedding = self.activate(["SOUND"])
        service = self.items(wedding, "services")[0]
        couple = self.member(wedding, "client", ["couple"])
        vendor = self.member(wedding, "vendor", ["vendor"], [service["id"]])
        self.call("POST", f"weddings/{wedding['id']}/budget-lines", {"label": "Client-facing agreed scope", "committedMinor": 123450, "clientAmountMinor": 150000, "visibility": "client"})
        self.call("POST", f"weddings/{wedding['id']}/vendors", {"name": "Shared provider", "serviceId": service["id"], "quotedMinor": 123450, "visibility": "shared"})
        for identity in (couple, vendor):
            dashboard = self.call("GET", f"weddings/{wedding['id']}/dashboard", identity=identity)[1]
            self.assertIsNone(dashboard["budget"])
            self.assertNotIn("budgetMinor", dashboard["wedding"])
            self.assertNotIn("123450", json.dumps(self.items(wedding, "budget-lines", identity)))
            self.assertNotIn("123450", json.dumps(self.items(wedding, "vendors", identity)))

    def test_coordinator_cannot_assign_work_or_confirm_church(self):
        wedding = self.activate(["CHURCH"])
        service = self.items(wedding, "services")[0]
        coordinator = self.member(wedding, "coord", ["coordinator"], [service["id"]])
        self.assert_error(403, lambda: self.call("POST", f"weddings/{wedding['id']}/services/{service['id']}/verify", {"version": 1, "evidence": "Test"}, identity=coordinator))

    def test_document_resubmission_preserves_previous_versions_and_decisions(self):
        wedding = self.activate(["DECOR"])
        document = self.items(wedding, "document-requests")[0]
        path = f"weddings/{wedding['id']}/document-requests/{document['id']}"
        def upload(doc, content):
            return self.call("POST", path + "/versions", {"version": doc["version"], "filename": "design.txt", "mimeType": "text/plain", "contentBase64": base64.b64encode(content.encode()).decode()})[1]["document"]
        uploaded = upload(document, "First revision")
        reviewed = self.call("POST", path + "/review", {"version": uploaded["version"], "documentVersionId": uploaded["latestVersionId"], "decision": "changes_requested", "comment": "Use white flowers"})[1]["document"]
        revised = upload(reviewed, "Second revision")
        self.call("POST", path + "/review", {"version": revised["version"], "documentVersionId": revised["latestVersionId"], "decision": "approved"})
        history = self.call("GET", path)[1]
        self.assertEqual([v["revision"] for v in history["versions"]], [1, 2])
        self.assertEqual([r["decision"] for r in history["reviews"]], ["changes_requested", "approved"])
        stranger = self.member(wedding, "vendor", ["vendor"])
        file_id = history["versions"][0]["fileId"]
        self.assert_error(404, lambda: self.call("GET", f"weddings/{wedding['id']}/files/{file_id}", identity=stranger))

    def test_client_approval_cannot_be_impersonated_by_a_planner(self):
        wedding = self.activate(["DECOR"])
        couple = self.member(wedding, "client", ["couple"])
        doc = self.call("POST", f"weddings/{wedding['id']}/document-requests", {"title": "Client consent", "visibility": "client", "reviewerRole": "couple"})[1]
        path = f"weddings/{wedding['id']}/document-requests/{doc['id']}"
        doc = self.call("POST", path + "/versions", {"version": 1, "filename": "proof.txt", "mimeType": "text/plain", "contentBase64": "dGVzdA=="})[1]["document"]
        decision = {"version": doc["version"], "documentVersionId": doc["latestVersionId"], "decision": "approved"}
        self.assert_error(403, lambda: self.call("POST", path + "/review", decision))
        result = self.call("POST", path + "/review", decision, identity=couple)[1]
        self.assertEqual(result["document"]["status"], "approved")

    def test_counseling_notes_need_separate_authority_and_are_not_in_audit(self):
        wedding = self.activate(["COUNSELING"])
        service = self.items(wedding, "services")[0]
        body = {"title": "Session", "serviceId": service["id"], "notes": "private clinical content"}
        self.assert_error(403, lambda: self.call("POST", f"weddings/{wedding['id']}/notes", body))
        counselor = Identity("lead", "org-a", {"planner"}, {"counseling"})
        self.call("POST", f"weddings/{wedding['id']}/notes", body, identity=counselor)
        self.assertEqual(self.items(wedding, "notes"), [])
        activity = self.call("GET", f"weddings/{wedding['id']}/activity", identity=counselor)[1]
        self.assertNotIn("private clinical content", json.dumps(activity))

    def test_reminders_are_deduplicated_and_respect_preferences(self):
        wedding = self.activate(["SOUND"], "2026-01-01")
        path = f"weddings/{wedding['id']}/reminders/generate"
        first = self.call("POST", path)[1]
        self.assertEqual(first["created"], 3)
        self.assertEqual(self.call("POST", path)[1]["created"], 0)
        reminder = self.items(wedding, "notifications")[0]
        self.patch(wedding, "notifications", reminder, {"status": "failed", "failureReason": "Provider timeout"})
        self.call("POST", f"weddings/{wedding['id']}/reminders/preferences", {"enabled": False})
        self.assertEqual(self.call("POST", path)[1]["created"], 0)

    def test_asset_conflicts_require_explicit_override_and_utc_times(self):
        wedding = self.activate(["SOUND"])
        event = {"title": "Sound check", "assetId": "venue-main", "startAt": "2027-05-16T08:00:00+03:00", "endAt": "2027-05-16T09:00:00+03:00"}
        created = self.call("POST", f"weddings/{wedding['id']}/events", event)[1]
        self.assertEqual(created["startAt"], "2027-05-16T05:00:00+00:00")
        self.assert_error(409, lambda: self.call("POST", f"weddings/{wedding['id']}/events", event))
        self.call("POST", f"weddings/{wedding['id']}/events", {**event, "overrideReason": "Shared sound rehearsal agreed"})

    def test_calendar_dates_stay_iso_and_aftercare_is_six_calendar_months(self):
        self.assertEqual(relative_date("2027-01-31", 180, True), "2027-07-31")
        wedding = self.activate(["COUNSELING"], "2027-01-31")
        self.assertEqual(self.items(wedding, "tasks")[0]["dueAt"], "2027-07-31T06:00:00+00:00")

    def test_feature_flag_stops_module_routes(self):
        with patch.dict(os.environ, {"MATRIMONY_WEDDINGS_ENABLED": "0"}):
            self.assert_error(404, lambda: self.call("GET", "weddings"))

    def test_session_signatures_expiry_and_untrusted_headers(self):
        secret = "test-only-secret-key-with-at-least-32-characters"
        claims = {"userId": "client", "organizationId": "org-a", "roles": ["couple"], "exp": time.time() + 60}
        with patch.dict(os.environ, {"MATRIMONY_SESSION_SECRET": secret}):
            token = sign_session(claims, secret)
            identity = authenticate({"Authorization": "Bearer " + token})
            self.assertEqual(identity.user_id, "client")
            self.assertIsNone(authenticate({"Authorization": "Bearer " + token + "x"}))
            expired = sign_session({**claims, "exp": time.time() - 1}, secret)
            self.assertIsNone(authenticate({"Cookie": "matrimony_session=" + expired}))
            self.assertIsNone(authenticate({"X-User-ID": "admin", "X-Role": "admin"}))
            self.assertIsNone(authenticate({}, local_allowed=True))

    def test_catalog_edits_preserve_instantiated_snapshots_and_custom_templates_activate(self):
        wedding = self.activate(["SOUND"])
        original = self.items(wedding, "services")[0]
        self.call("PATCH", "service-templates/SOUND", {"version": 1, "name": "Updated sound package", "relativeOffsetDays": -80}, identity=self.admin)
        self.assertEqual(self.items(wedding, "services")[0]["templateSnapshot"], original["templateSnapshot"])
        self.call("POST", "service-templates", {"code": "PHOTO", "name": "Photography", "category": "people", "relativeOffsetDays": -90}, identity=self.admin)
        custom = self.activate(["PHOTO"])
        self.assertEqual(self.items(custom, "services")[0]["code"], "PHOTO")
        self.assertEqual(len(self.items(custom, "tasks")), 1)

    def test_revoking_membership_removes_list_access_and_idempotency_replay(self):
        wedding = self.activate(["SOUND"])
        coordinator = self.member(wedding, "coord", ["coordinator"])
        key = str(uuid4())
        path = f"weddings/{wedding['id']}/tasks"
        body = {"title": "Coordinator task", "ownerUserId": "coord"}
        self.call("POST", path, body, identity=coordinator, key=key)
        self.call("POST", f"weddings/{wedding['id']}/members", {"userId": "coord", "roles": []})
        self.assertEqual(self.call("GET", "weddings", identity=coordinator)[1]["items"], [])
        self.assert_error(404, lambda: self.call("POST", path, body, identity=coordinator, key=key))

    def test_multi_role_member_combines_client_and_coordinator_visibility(self):
        wedding = self.activate(["SOUND"])
        service = self.items(wedding, "services")[0]
        person = self.member(wedding, "both", ["couple", "coordinator"], [service["id"]])
        self.call("POST", f"weddings/{wedding['id']}/budget-lines", {"label": "Shared fee", "clientAmountMinor": 12300, "committedMinor": 8000, "visibility": "client"})
        visible = self.items(wedding, "budget-lines", person)
        self.assertEqual(visible[0]["clientAmountMinor"], 12300)
        self.assertNotIn("committedMinor", visible[0])

    def test_coordinator_cannot_remove_approval_requirements(self):
        wedding = self.activate(["DECOR"])
        service = self.items(wedding, "services")[0]
        coordinator = self.member(wedding, "coord", ["coordinator"], [service["id"]])
        document = self.items(wedding, "document-requests")[0]
        self.assert_error(403, lambda: self.patch(wedding, "document-requests", document, {"required": False}, coordinator))

    def test_same_organization_planner_cannot_read_another_tenants_legacy_directory(self):
        self.assert_error(403, lambda: self.call("GET", "weddings/clients"))

    def test_explicit_template_upgrade_preserves_completed_evidence_and_manual_dates(self):
        wedding = self.activate(["SOUND"])
        service = self.items(wedding, "services")[0]
        original_tasks = self.items(wedding, "tasks")
        self.patch(wedding, "tasks", original_tasks[0], {"status": "done"})
        manual = self.call("POST", f"weddings/{wedding['id']}/tasks", {"title": "Manual obligation", "serviceId": service["id"], "dueAt": "2027-05-10T09:00:00+03:00"})[1]
        template = next(t for t in self.call("GET", "service-templates")[1]["items"] if t["code"] == "SOUND")
        new_tasks = [{**t} for t in template["tasks"]]
        new_tasks[0]["title"] = "Reconfirm the expanded scope"
        new_tasks.append({"code": "backup", "title": "Test the backup microphone", "offsetDays": -7, "required": True, "priority": "high"})
        self.call("PATCH", "service-templates/SOUND", {"version": 1, "name": "Expanded sound package", "tasks": new_tasks}, identity=self.admin)
        path = f"weddings/{wedding['id']}/services/{service['id']}"
        preview = self.call("POST", path + "/template-upgrade-preview", {"version": 1}, identity=self.admin)[1]
        self.assertEqual(preview["toVersion"], 2)
        self.assert_error(409, lambda: self.call("POST", path + "/template-upgrade", {"version": 1, "reason": "Review"}, identity=self.admin))
        self.call("POST", path + "/template-upgrade", {"version": 1, "reason": "Expanded scope agreed", "previewToken": preview["previewToken"]}, identity=self.admin)
        tasks = self.items(wedding, "tasks")
        self.assertEqual(next(t for t in tasks if t["id"] == original_tasks[0]["id"])["status"], "done")
        self.assertEqual(next(t for t in tasks if t["id"] == manual["id"])["dueAt"], manual["dueAt"])
        self.assertEqual(len(tasks), 6)
        self.assertEqual(self.items(wedding, "services")[0]["name"], "Expanded sound package")
        self.assertTrue(any(t["title"] == "Test the backup microphone" and t["status"] == "todo" for t in tasks))

    def test_changed_tasks_make_a_template_upgrade_preview_stale(self):
        wedding = self.activate(["SOUND"])
        service = self.items(wedding, "services")[0]
        self.call("PATCH", "service-templates/SOUND", {"version": 1, "name": "Updated"}, identity=self.admin)
        path = f"weddings/{wedding['id']}/services/{service['id']}"
        preview = self.call("POST", path + "/template-upgrade-preview", {"version": 1}, identity=self.admin)[1]
        self.patch(wedding, "tasks", self.items(wedding, "tasks")[0], {"status": "in_progress"})
        self.assert_error(409, lambda: self.call("POST", path + "/template-upgrade", {"version": 1, "reason": "Update", "previewToken": preview["previewToken"]}, identity=self.admin))

    def test_an_undated_plan_cannot_receive_a_ready_badge(self):
        wedding = self.activate(["SOUND"], None)
        for task in self.items(wedding, "tasks"):
            self.patch(wedding, "tasks", task, {"status": "done"})
        service = self.items(wedding, "services")[0]
        self.call("POST", f"weddings/{wedding['id']}/services/{service['id']}/verify", {"version": 1, "evidence": "Provider prepared"})
        readiness = self.call("GET", f"weddings/{wedding['id']}/readiness")[1]
        self.assertEqual(readiness["taskProgress"], 100)
        self.assertFalse(readiness["ready"])
        self.assertFalse(readiness["dateScheduled"])

    def test_overdue_dates_use_addis_day_and_appointments_use_the_actual_instant(self):
        midnight_in_addis = datetime.fromisoformat("2026-10-14T21:30:00+00:00")
        self.assertTrue(overdue("2026-10-14", midnight_in_addis))
        self.assertFalse(overdue("2026-10-15", midnight_in_addis))
        self.assertTrue(overdue("2026-10-14T06:00:00+00:00", midnight_in_addis))
        self.assertFalse(overdue("2026-10-15T06:00:00+00:00", midnight_in_addis))


if __name__ == "__main__":
    unittest.main()
