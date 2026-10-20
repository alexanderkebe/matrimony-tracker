"""HTTP boundary checks: authentication, CSRF, static privacy and malformed bodies."""

import json
import os
import threading
import time
import unittest
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch
from uuid import uuid4

import server
import pg_schema
from wedding_planner.auth import sign_session


class WeddingHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pg_schema.fresh()
        cls.secret = "http-tests-use-a-synthetic-secret-123456789"
        cls.environment = patch.dict(os.environ, {"MATRIMONY_SESSION_SECRET": cls.secret, "MATRIMONY_LEGACY_ORGANIZATION_ID": "qa-org"})
        cls.environment.start()
        cls.http = server.ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.thread = threading.Thread(target=cls.http.serve_forever, daemon=True)
        cls.thread.start()
        cls.url = f"http://127.0.0.1:{cls.http.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.http.shutdown()
        cls.http.server_close()
        cls.thread.join()
        cls.environment.stop()

    def request(self, path, method="GET", body=None, signed=True, headers=None):
        request_headers = {"Content-Type": "application/json", "Idempotency-Key": str(uuid4())}
        if signed:
            claims = {"userId": "qa-lead", "organizationId": "qa-org", "roles": ["planner"], "exp": time.time() + 600}
            request_headers["Authorization"] = "Bearer " + sign_session(claims, self.secret)
        request_headers.update(headers or {})
        data = body if isinstance(body, bytes) else json.dumps(body).encode() if body is not None else None
        request = Request(self.url + path, data=data, method=method, headers=request_headers)
        try:
            with urlopen(request) as response:
                return response.status, json.load(response) if response.headers.get_content_type() == "application/json" else response.read()
        except HTTPError as error:
            return error.code, json.load(error) if error.headers.get_content_type() == "application/json" else error.read()

    def test_capabilities_and_unauthenticated_access(self):
        status, cap = self.request("/api/v1/weddings/capabilities", signed=False)
        self.assertEqual(status, 200)
        self.assertFalse(cap["authenticated"])
        self.assertEqual(self.request("/api/v1/weddings", signed=False)[0], 401)
        self.assertEqual(self.request("/api/v1/weddings", signed=False, headers={"X-Role": "admin"})[0], 401)

    def test_cross_site_changes_and_non_json_bodies_are_rejected(self):
        payload = {"title": "QA couple"}
        self.assertEqual(self.request("/api/v1/weddings", "POST", payload, headers={"Origin": "https://untrusted.example"})[0], 403)
        self.assertEqual(self.request("/api/v1/weddings", "POST", payload, headers={"Sec-Fetch-Site": "cross-site"})[0], 403)
        self.assertEqual(self.request("/api/v1/weddings", "POST", payload, headers={"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.request("/api/v1/weddings", "POST", b"{invalid}")[0], 400)

    def test_draft_create_read_edit_and_stale_edit_through_http(self):
        status, wedding = self.request("/api/v1/weddings", "POST", {"title": "QA HTTP couple"})
        self.assertEqual(status, 201)
        path = f"/api/v1/weddings/{wedding['id']}"
        self.assertEqual(self.request(path)[0], 200)
        self.assertEqual(self.request(path, "PATCH", {"version": 1, "title": "QA updated"})[0], 200)
        status, conflict = self.request(path, "PATCH", {"version": 1, "title": "Stale change"})
        self.assertEqual(status, 409)
        self.assertEqual(conflict["latest"]["title"], "QA updated")

    def test_private_source_and_customer_data_are_not_static_files(self):
        for path in ("/wedding_planner/auth.py", "/.env.local", "/data/matrimony.sqlite3", "/server.py", "/docs/WEDDING_PLANNING.md"):
            self.assertEqual(self.request(path)[0], 404)
        for path in ("/weddings", "/weddings/unknown/overview", "/weddings.js", "/weddings.css"):
            self.assertEqual(self.request(path)[0], 200)

    def test_client_cannot_bypass_permissions_through_legacy_records(self):
        claims = {"userId": "qa-client", "organizationId": "qa-org", "roles": ["couple"], "exp": time.time() + 600}
        headers = {"Authorization": "Bearer " + sign_session(claims, self.secret)}
        self.assertEqual(self.request("/api/records", headers=headers)[0], 403)


if __name__ == "__main__":
    unittest.main()
