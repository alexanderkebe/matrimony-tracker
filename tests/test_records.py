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

    def test_frontend_refresh_does_not_reuse_stale_controls(self):
        for path in ("/", "/index.html", "/pickers.js?v=autocomplete", "/styles.css", "/app.js"):
            with urlopen(self.url + path) as response:
                self.assertEqual(response.status, 200)
                self.assertEqual(response.headers.get("Cache-Control"), "no-store")
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
            self.assertEqual(upstream.call_count, 2)
        server.PLACE_CACHE.clear()
        with self.assertRaises(ValueError):
            server.search_places("Cathedral", float("nan"), 38.75)

    def test_ethiopian_matches_rank_first_and_duplicates_and_noise_are_removed(self):
        def feature(name, lon, lat, **properties):
            return {"properties": {"name": name, **properties}, "geometry": {"coordinates": [lon, lat]}}
        local = feature("Atlas Addis", 38.75, 9.02, city="Addis Ababa", osm_key="tourism")
        abroad = feature("Atlas", -0.12, 51.5, country="United Kingdom")
        noise = feature("123-456", 38.8, 9.0)
        invalid = feature("Broken coordinates", 999, 999)
        server.PLACE_CACHE.clear()
        with patch.object(server, "photon_features", side_effect=[[local, noise, invalid], [abroad, local]]) as upstream:
            result = server.search_places("Atlas")
            self.assertEqual([place["name"] for place in result], ["Atlas Addis", "Atlas"])
            self.assertEqual(upstream.call_args_list[0].args[1]["bbox"], "32.9,3.4,48.0,15.0")
            self.assertNotIn("bbox", upstream.call_args_list[1].args[1])
        server.PLACE_CACHE.clear()

    def test_search_preserves_partial_provider_results(self):
        local = {"properties": {"name": "ቦሌ", "city": "አዲስ አበባ"}, "geometry": {"coordinates": [38.75, 9.02]}}
        server.PLACE_CACHE.clear()
        with patch.object(server, "photon_features", side_effect=[[local], TimeoutError()]):
            self.assertEqual(server.search_places("ቦሌ")[0]["name"], "ቦሌ")
        server.PLACE_CACHE.clear()

    def test_sheraton_suggestions_work_without_the_public_provider(self):
        server.PLACE_CACHE.clear()
        with patch.object(server, "photon_features", side_effect=TimeoutError()) as upstream:
            for query in ("sher", "ሸራተን"):
                self.assertEqual(server.search_places(query)[0]["name"], "Sheraton Addis")
            upstream.assert_not_called()
        server.PLACE_CACHE.clear()

    def test_reverse_lookup_requires_coordinates_and_uses_actual_position(self):
        feature = {"properties": {"name": "Bole", "city": "Addis Ababa"}, "geometry": {"coordinates": [38.8, 9.0]}}
        server.PLACE_CACHE.clear()
        with patch.object(server, "photon_features", return_value=[feature]) as upstream:
            status, result = self.request("/api/places/reverse?lat=9.01234&lon=38.76543")
            self.assertEqual(status, 200)
            self.assertEqual(result["place"]["name"], "Bole")
            self.assertEqual(result["place"]["lat"], 9.01234)
            self.assertEqual(result["place"]["lon"], 38.76543)
            self.request("/api/places/reverse?lat=9.01234&lon=38.76543")
            self.assertEqual(upstream.call_count, 1)
        for query in ("", "?lat=nan&lon=38.75", "?lat=91&lon=38.75", "?lat=9.0"):
            with self.assertRaises(HTTPError) as error:
                self.request("/api/places/reverse" + query)
            self.assertEqual(error.exception.code, 400)
        server.PLACE_CACHE.clear()


if __name__ == "__main__":
    unittest.main()
