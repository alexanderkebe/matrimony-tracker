import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class RecordApiTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.original_db_path = server.DB_PATH
        server.DB_PATH = Path(self.directory.name) / "records.sqlite3"
        server.initialize()
        self.http = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        self.thread = threading.Thread(target=self.http.serve_forever, daemon=True)
        self.thread.start()
        self.url = f"http://127.0.0.1:{self.http.server_port}"

    def tearDown(self):
        self.http.shutdown()
        self.http.server_close()
        self.thread.join()
        server.DB_PATH = self.original_db_path
        self.directory.cleanup()

    def request(self, path, method="GET", data=None):
        body = json.dumps(data, ensure_ascii=False).encode() if data is not None else None
        request = Request(self.url + path, data=body, method=method,
                          headers={"Content-Type": "application/json"})
        with urlopen(request) as response:
            return response.status, json.load(response)

    def test_create_list_open_and_update_full_plan(self):
        plan = {"lang": "am", "details": {"brideName": "ሀና አለሙ",
                "groomName": "ሳሙኤል በቀለ", "weddingDate": "2026-12-12", "eventDays": "3", "totalFee": "25000"},
                "services": {"venue": {"selected": True, "price": "25000", "options": {"type": "church"}, "notes": "ማስታወሻ"}}}
        status, saved = self.request("/api/records", "POST", plan)
        self.assertEqual(status, 201)
        record_id = saved["id"]
        _, listing = self.request("/api/records")
        self.assertEqual(listing["records"][0]["bride_first_name"], "ሀና")
        self.assertEqual(listing["records"][0]["groom_first_name"], "ሳሙኤል")
        _, opened = self.request(f"/api/records/{record_id}")
        self.assertEqual(opened["plan"], plan)
        plan["details"]["brideName"] = "Marta Tesfaye"
        self.request(f"/api/records/{record_id}", "PUT", plan)
        _, listing = self.request("/api/records")
        self.assertEqual(len(listing["records"]), 1)
        self.assertEqual(listing["records"][0]["bride_first_name"], "Marta")

    def test_private_database_is_not_served(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(self.url + "/data/records.sqlite3")
        self.assertEqual(error.exception.code, 404)
        with self.assertRaises(HTTPError) as error:
            urlopen(self.url + "/assets/../server.py")
        self.assertEqual(error.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
