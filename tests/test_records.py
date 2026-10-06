import json
import tempfile
import threading
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch

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
                "groomName": "ሳሙኤል በቀለ", "weddingDate": "2026-12-12", "eventDays": "3", "totalFee": "25000",
                "locations": {"sacredVenue": {"name": "Holy Trinity Cathedral", "address": "Addis Ababa, Ethiopia", "lat": 9.0303, "lon": 38.7612}}},
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

    def test_place_search_returns_real_provider_result_and_bad_queries_fail(self):
        places = [{"name": "Holy Trinity Cathedral", "address": "Addis Ababa, Ethiopia", "lat": 9.0303, "lon": 38.7612}]
        with patch.object(server, "search_places", return_value=places) as search:
            status, result = self.request("/api/places?q=Holy%20Trinity")
            self.assertEqual(status, 200)
            self.assertEqual(result["places"], places)
            search.assert_called_once_with("Holy Trinity", 9.03, 38.75)
        with patch.object(server, "search_places", side_effect=ValueError("bad query")):
            with self.assertRaises(HTTPError) as error:
                self.request("/api/places?q=a")
            self.assertEqual(error.exception.code, 400)

    def test_place_search_outage_is_actionable(self):
        with patch.object(server, "search_places", side_effect=TimeoutError()):
            with self.assertRaises(HTTPError) as error:
                self.request("/api/places?q=Addis")
            self.assertEqual(error.exception.code, 503)

    def test_place_normalization_and_cache(self):
        feature = {"properties": {"name":"Cathedral", "city":"Addis Ababa", "country":"Ethiopia"}, "geometry": {"coordinates":[38.7612,9.0303]}}
        server.PLACE_CACHE.clear()
        with patch.object(server, "urlopen") as upstream:
            upstream.return_value.__enter__.return_value.read.return_value = json.dumps({"features":[feature]}).encode()
            result = server.search_places("Cathedral")
            self.assertEqual(result[0]["address"], "Addis Ababa, Ethiopia")
            self.assertEqual(result[0]["lat"], 9.0303)
            self.assertEqual(server.search_places("Cathedral"), result)
            self.assertEqual(upstream.call_count, 1)
        server.PLACE_CACHE.clear()
        with self.assertRaises(ValueError):
            server.search_places("Cathedral", float("nan"), 38.75)


if __name__ == "__main__":
    unittest.main()
