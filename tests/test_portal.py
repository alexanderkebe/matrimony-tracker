import json
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server
import pg_schema


class PortalApiTests(unittest.TestCase):
    def setUp(self):
        server.PORTAL_SUBMISSIONS.clear()
        pg_schema.fresh()
        self.http = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.http.server_port}"

    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.thread.join()

    def request(self, path, method="GET", data=None, headers=None):
        body = json.dumps(data, ensure_ascii=False).encode() if data is not None else None
        request = Request(self.url + path, data=body, method=method, headers={"Content-Type": "application/json", **(headers or {})})
        try:
            with urlopen(request) as response:
                return response.status, json.load(response)
        except HTTPError as error:
            return error.code, json.load(error)

    def submission(self, **details):
        return {"lang": "am", "details": {"brideName": "ሀና አለሙ", "groomName": "Samuel Bekele", "bridePhone": "+251 911 22 33 44",
                "weddingDate": "2027-05-16", "mealProgram": ["breakfast", "lunch", "dinner", "snacks"], "totalFee": "999999",
                "generalNotes": "Garden ceremony", "locations": {"venue-hall": {"name": "Sheraton Addis", "address": "Addis Ababa", "lat": 9.02, "lon": 38.75}},
                **details},
                "services": {"venue": {"selected": True, "price": "5000", "options": {"type": "hall"}, "notes": "Evening"},
                             "decor": {"selected": False}, "Bad Id": {"selected": True}}}

    def test_submit_list_import_and_dismiss(self):
        status, created = self.request("/api/portal", "POST", self.submission())
        self.assertEqual(status, 201)
        self.assertEqual(created["reference"], f"MBH-RQ-{created['id']}")
        _, listing = self.request("/api/portal")
        [entry] = listing["requests"]
        self.assertEqual((entry["bride_name"], entry["phone"], entry["status"], entry["services"], entry["meals"]),
                         ("ሀና አለሙ", "+251 911 22 33 44", "new", ["venue"], ["breakfast", "lunch", "dinner"]))

        status, imported = self.request(f"/api/portal/{created['id']}", "POST", {"action": "import"})
        self.assertEqual(status, 200)
        _, record = self.request(f"/api/records/{imported['recordId']}")
        plan = record["plan"]
        self.assertNotIn("totalFee", plan["details"], "Couples cannot set the price")
        self.assertNotIn("price", plan["services"]["venue"])
        self.assertEqual(plan["services"]["venue"]["options"], {"type": "hall"})
        self.assertEqual(plan["details"]["locations"]["venue-hall"]["name"], "Sheraton Addis")
        self.assertEqual(plan["source"], "portal")
        # Importing twice reuses the same record.
        self.assertEqual(self.request(f"/api/portal/{created['id']}", "POST", {"action": "import"})[1], imported)
        _, listing = self.request("/api/portal")
        self.assertEqual((listing["requests"][0]["status"], listing["requests"][0]["record_id"]), ("imported", imported["recordId"]))

        self.assertEqual(self.request(f"/api/portal/{created['id']}", "POST", {"action": "dismiss"})[0], 200)
        self.assertEqual(self.request("/api/portal")[1]["requests"], [])

    def test_rejects_incomplete_cross_site_and_repeated_submissions(self):
        status, error = self.request("/api/portal", "POST", self.submission(bridePhone="", groomPhone=""))
        self.assertEqual((status, error["error"]), (400, "Enter at least one phone number so we can reach you."))
        self.assertEqual(self.request("/api/portal", "POST", self.submission(weddingDate="2027-02-30"))[0], 400)
        self.assertEqual(self.request("/api/portal", "POST", self.submission(), {"Origin": "https://example.com"})[0], 403)
        self.assertEqual(self.request("/api/portal/99", "POST", {"action": "import"})[0], 404)
        server.PORTAL_SUBMISSIONS.clear()
        statuses = [self.request("/api/portal", "POST", self.submission())[0] for _ in range(6)]
        self.assertEqual(statuses, [201] * 5 + [429])

    def test_portal_page_is_served(self):
        with urlopen(self.url + "/portal") as response:
            self.assertEqual(response.status, 200)


if __name__ == "__main__":
    unittest.main()
