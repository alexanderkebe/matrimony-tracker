"""Questionnaire → planner integration, against an isolated database."""

import json
import re
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

import server
import pg_schema
from wedding_planner import catalog
from wedding_planner.api import Router
from wedding_planner.auth import Identity
from wedding_planner.domain import ApiError
from wedding_planner.storage import encode, now


class QuestionnaireTests(unittest.TestCase):
    def setUp(self):
        pg_schema.fresh()
        self.lead = Identity("lead", "questionnaire-test", {"planner"}, {"legacy_records"})
        self.plan = {"lang": "am", "details": {
            "brideName": "Hanna Alemu", "groomName": "Samuel Bekele", "bridePhone": "+251911000001",
            "groomPhone": "+251911000002", "brideAddress": "Bole", "groomAddress": "Kazanchis",
            "weddingDate": "2027-05-16", "weddingTime": "14:30", "mealProgram": ["breakfast", "lunch"], "eventDays": "3", "totalFee": "50000.50",
            "eventVenueTypes": ["church", "hotel"], "venues": {"church": "Trinity", "hotel": "Reception hotel", "hall": "Old unselected hall"},
            "locations": {"venue-church": {"lat": 9.03, "lon": 38.76}}, "mediaConsent": "no",
            "scopeDayOfCoordination": True, "generalNotes": "A family celebration."},
            "services": {"venue": {"selected": True, "options": {"name": "Reception hotel", "capacity": "400"}, "notes": "Ramp access"},
                         "food-drinks": {"selected": True, "options": {"guests": "250", "drinks": ["water"]}},
                         "choir": {"selected": False, "options": {"repertoire": "Saved preference"}}}}
        with server.get_db() as db:
            self.record_id = db.insert("""INSERT INTO records (bride_name,groom_name,bride_first_name,groom_first_name,
                wedding_date,language,plan_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)""",
                ("Hanna Alemu", "Samuel Bekele", "Hanna", "Samuel", "2027-05-16", "am", encode(self.plan), now(), now()))
        self.handoff = f"weddings/clients/{self.record_id}/plan"

    def call(self, method, path, body=None, identity=None, key=None, version=None, query=None):
        headers = {"Idempotency-Key": key or str(uuid4())}
        if version is not None:
            headers["If-Match"] = str(version)
        with server.get_db() as db:
            return Router(db, identity or self.lead, headers).dispatch(method, "/api/v1/" + path, query or {}, body)[1]

    def update_source(self):
        with server.get_db() as db:
            db.execute("UPDATE records SET plan_json=?,updated_at=? WHERE id=?", (encode(self.plan), now(), self.record_id))

    def rows(self, wedding, collection):
        return self.call("GET", f"weddings/{wedding['id']}/{collection}", query={"limit": ["100"]})["items"]

    def error(self, status, callback):
        with self.assertRaises(ApiError) as caught:
            callback()
        self.assertEqual(caught.exception.status, status, caught.exception.payload)
        return caught.exception.payload

    def test_handoff_uses_exact_selection_and_carries_questionnaire_fields(self):
        wedding = self.call("POST", self.handoff, {})
        self.assertEqual(wedding["clientId"], self.record_id)
        self.assertEqual(wedding["title"], "Hanna Alemu & Samuel Bekele")
        self.assertEqual(wedding["weddingDate"], "2027-05-16")
        self.assertEqual(wedding["churchLocation"], "Trinity")
        self.assertEqual(wedding["venueLocation"], "Reception hotel")
        self.assertEqual(wedding["guestEstimate"], 250)
        self.assertEqual(wedding["budgetMinor"], 0, "Professional fee must never become the total wedding budget")
        self.assertEqual(wedding["package"], "day_of")
        self.assertEqual(wedding["language"], "am")
        self.assertEqual(wedding["status"], "planning")
        self.assertEqual(wedding["questionnaire"]["details"], self.plan["details"])
        services = self.rows(wedding, "services")
        self.assertEqual({s["code"] for s in services}, {"VENUE", "CATERING"})
        self.assertEqual(next(s for s in services if s["code"] == "VENUE")["questionnaireSettings"]["notes"], "Ramp access")
        self.assertEqual(len(self.rows(wedding, "tasks")), 6)

    def test_every_picker_id_maps_to_the_matching_service_including_hyphenated_ids(self):
        app = (Path(__file__).resolve().parents[1] / "public" / "app.js").read_text(encoding="utf-8")
        picker_ids = re.findall(r'^    id: "([^"]+)",$', app, re.MULTILINE)
        self.assertEqual(set(picker_ids), set(catalog.LEGACY_CODES))
        self.assertEqual(len(picker_ids), 21)
        self.plan["services"] = {key: {"selected": True} for key in picker_ids}
        self.update_source()
        wedding = self.call("POST", self.handoff, {})
        self.assertEqual({s["code"] for s in self.rows(wedding, "services")}, {t["code"] for t in catalog.templates()})
        self.assertEqual(len(self.rows(wedding, "tasks")), 63)

    def test_repeated_and_concurrent_continuations_reuse_the_plan_and_tasks(self):
        with ThreadPoolExecutor(max_workers=2) as pool:
            weddings = list(pool.map(lambda _: self.call("POST", self.handoff, {}), range(2)))
        first = weddings[0]
        self.assertEqual(first["id"], weddings[1]["id"])
        tasks = self.rows(first, "tasks")
        key = str(uuid4())
        replay = self.call("POST", self.handoff, {}, key=key)
        self.assertEqual(replay, self.call("POST", self.handoff, {}, key=key))
        self.assertEqual(self.rows(first, "tasks"), tasks)
        self.assertEqual(self.call("GET", "weddings")["total"], 1)
        source = self.call("GET", f"weddings/clients/{self.record_id}")
        self.assertEqual(source["weddingId"], first["id"])
        self.assertEqual(set(source["selectedServiceCodes"]), {"VENUE", "CATERING"})

    def test_scope_changes_preserve_work_and_reselecting_reuses_existing_service(self):
        wedding = self.call("POST", self.handoff, {})
        venue = next(s for s in self.rows(wedding, "services") if s["code"] == "VENUE")
        task = next(t for t in self.rows(wedding, "tasks") if t["serviceId"] == venue["id"])
        task = self.call("PATCH", f"weddings/{wedding['id']}/tasks/{task['id']}", {"version": task["version"], "status": "done"})
        self.plan["services"]["venue"]["selected"] = False
        self.plan["services"]["choir"]["selected"] = True
        self.update_source()
        self.call("POST", self.handoff, {})
        services = self.rows(wedding, "services")
        self.assertEqual({s["code"] for s in services if s["enabled"]}, {"CATERING", "PERFORMERS"})
        self.assertFalse(next(s for s in services if s["id"] == venue["id"])["enabled"])
        self.plan["services"]["venue"]["selected"] = True
        self.update_source()
        self.call("POST", self.handoff, {})
        self.assertEqual(len(self.rows(wedding, "services")), 3)
        self.assertTrue(next(s for s in self.rows(wedding, "services") if s["id"] == venue["id"])["enabled"])
        self.assertEqual(next(t for t in self.rows(wedding, "tasks") if t["id"] == task["id"])["status"], "done")
        self.assertEqual(len(self.rows(wedding, "tasks")), 9)

    def test_source_updates_keep_planner_edits_and_resolve_overlapping_fields(self):
        wedding = self.call("POST", self.handoff, {})
        wedding = self.call("PATCH", f"weddings/{wedding['id']}", {"version": wedding["version"], "budgetMinor": 900000, "guestEstimate": 240})
        self.plan["details"]["brideName"] = "Hanna Updated"
        self.plan["details"]["bridePhone"] = "+251911999999"
        self.update_source()
        wedding = self.call("POST", self.handoff, {})
        self.assertEqual(wedding["title"], "Hanna Updated & Samuel Bekele")
        self.assertEqual(wedding["guestEstimate"], 240)
        self.assertEqual(wedding["budgetMinor"], 900000)
        self.plan["services"]["food-drinks"]["options"]["guests"] = "300"
        self.update_source()
        preview = self.error(409, lambda: self.call("POST", self.handoff, {}))["questionnairePreview"]
        self.assertEqual([c["field"] for c in preview["conflicts"]], ["guestEstimate"])
        wedding = self.call("POST", self.handoff, {"previewToken": preview["previewToken"], "resolutions": {"guestEstimate": "planner"}})
        self.assertEqual(wedding["guestEstimate"], 240)
        self.assertEqual(self.call("POST", self.handoff, {})["version"], wedding["version"])

    def test_source_date_change_requires_impact_preview_and_reschedules_same_tasks(self):
        wedding = self.call("POST", self.handoff, {})
        before = self.rows(wedding, "tasks")
        self.plan["details"]["weddingDate"] = "2027-06-16"
        self.update_source()
        preview = self.error(409, lambda: self.call("POST", self.handoff, {}))["questionnairePreview"]
        self.assertEqual(len(preview["dateImpact"]["shifts"]), 8)
        self.assertEqual(self.call("GET", f"weddings/{wedding['id']}")["weddingDate"], "2027-05-16")
        wedding = self.call("POST", self.handoff, {"previewToken": preview["previewToken"]})
        self.assertEqual(wedding["weddingDate"], "2027-06-16")
        after = self.rows(wedding, "tasks")
        self.assertEqual({t["id"] for t in before}, {t["id"] for t in after})
        self.assertTrue(all(t["dueAt"] != next(b for b in before if b["id"] == t["id"])["dueAt"] for t in after))

    def test_existing_draft_can_link_with_if_match_without_a_second_wedding(self):
        wedding = self.call("POST", "weddings", {"title": "Earlier draft", "weddingDate": "2027-05-16", "selectedServiceCodes": ["SOUND"]})
        wedding = self.call("POST", f"weddings/{wedding['id']}/questionnaire", {"version": wedding["version"], "clientId": self.record_id}, version=wedding["version"])
        self.assertEqual(wedding["clientId"], self.record_id)
        self.assertEqual({s["code"] for s in self.rows(wedding, "services")}, {"VENUE", "CATERING"})
        self.assertEqual(self.call("POST", self.handoff, {})["id"], wedding["id"])
        self.error(409, lambda: self.call("POST", "weddings", {"title": "Duplicate", "clientId": self.record_id}))

    def test_older_linked_active_plan_imports_scope_without_replacing_its_work(self):
        wedding = self.call("POST", "weddings", {"title": "Earlier linked plan", "clientId": self.record_id,
            "weddingDate": "2027-05-16", "budgetMinor": 123400, "selectedServiceCodes": ["SOUND", "VENUE"]})
        wedding = self.call("POST", f"weddings/{wedding['id']}/activate", {"version": wedding["version"]})["wedding"]
        before = self.rows(wedding, "services")
        wedding = self.call("POST", self.handoff, {})
        self.assertEqual(self.call("GET", "weddings")["total"], 1)
        services = self.rows(wedding, "services")
        self.assertEqual({s["code"] for s in services if s["enabled"]}, {"VENUE", "CATERING"})
        self.assertTrue({s["id"] for s in before} <= {s["id"] for s in services})
        self.assertEqual(wedding["budgetMinor"], 123400)

    def test_overlapping_date_changes_show_impact_before_using_questionnaire_date(self):
        wedding = self.call("POST", self.handoff, {})
        preview = self.call("POST", f"weddings/{wedding['id']}/date-change-preview", {"weddingDate": "2027-07-16"})
        self.call("POST", f"weddings/{wedding['id']}/date-change", {"version": wedding["version"], "weddingDate": "2027-07-16",
            "previewToken": preview["previewToken"], "reason": "Planner reschedule"})
        self.plan["details"]["weddingDate"] = "2027-08-16"
        self.update_source()
        preview = self.error(409, lambda: self.call("POST", self.handoff, {}))["questionnairePreview"]
        self.assertEqual(preview["conflicts"][0]["field"], "weddingDate")
        self.assertEqual(preview["dateImpact"]["newDate"], "2027-08-16")
        wedding = self.call("POST", self.handoff, {"previewToken": preview["previewToken"], "resolutions": {"weddingDate": "questionnaire"}})
        self.assertEqual(wedding["weddingDate"], "2027-08-16")

    def test_service_details_round_trip_to_questionnaire_and_detect_stale_source(self):
        wedding = self.call("POST", self.handoff, {})
        venue = next(s for s in self.rows(wedding, "services") if s["code"] == "VENUE")
        path = f"weddings/{wedding['id']}/services/{venue['id']}/questionnaire-details"
        details = self.call("GET", path)
        self.call("POST", path, {"version": details["version"], "recordSignature": details["recordSignature"],
            "options": {"name": "New reception", "capacity": "350"}, "notes": "Step-free access confirmed"}, version=details["version"])
        with server.get_db() as db:
            saved = json.loads(db.query_one("SELECT plan_json FROM records WHERE id=?", (self.record_id,))["plan_json"])
        self.assertEqual(saved["services"]["venue"]["options"]["capacity"], "350")
        self.assertEqual(saved["services"]["venue"]["notes"], "Step-free access confirmed")
        self.assertEqual(saved["details"], self.plan["details"])
        details = self.call("GET", path)
        self.plan = saved
        self.plan["details"]["generalNotes"] = "Someone else updated the questionnaire."
        self.update_source()
        self.error(409, lambda: self.call("POST", path, {"version": details["version"], "recordSignature": details["recordSignature"], "options": {}, "notes": "Stale"}))

    def test_empty_selection_and_unauthorized_access_cannot_create_a_plan_or_expose_details(self):
        unauthorized = Identity("outsider", "another-org", {"planner"})
        self.error(403, lambda: self.call("GET", f"weddings/clients/{self.record_id}", identity=unauthorized))
        self.error(403, lambda: self.call("POST", self.handoff, {}, identity=unauthorized))
        wedding = self.call("POST", self.handoff, {})
        self.call("POST", f"weddings/{wedding['id']}/members", {"userId": "couple", "roles": ["couple"], "serviceIds": []})
        couple = Identity("couple", "questionnaire-test", {"couple"})
        public = self.call("GET", f"weddings/{wedding['id']}/dashboard", identity=couple)
        self.assertNotIn("questionnaire", public["wedding"])
        self.assertTrue(all("questionnaireSettings" not in s for s in public["services"]))
        self.plan["services"] = {}
        self.update_source()
        self.error(400, lambda: self.call("POST", self.handoff, {}))
        self.assertEqual(len(self.rows(wedding, "services")), 2)


if __name__ == "__main__":
    unittest.main()
