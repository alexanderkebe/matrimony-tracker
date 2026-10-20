"""Vercel adapter; deliberately never enables the local planner identity."""

from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlencode, urlparse

import server
from wedding_planner.http import serve


class handler(BaseHTTPRequestHandler):
    send_json = server.Handler.send_json

    def handle_planning(self):
        try:
            server.get_database_url()
        except RuntimeError:
            return self.send_json(503, {"error": "Configure the host DATABASE_URL."})
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)
        route = query.pop("wpPath", ["weddings"])[0].strip("/")
        if not (route == "weddings" or route.startswith("weddings/") or route == "service-templates" or route.startswith("service-templates/")):
            return self.send_json(404, {"error": "Route not found."})
        path = "/api/v1/" + route + ("?" + urlencode(query, doseq=True) if query else "")
        return serve(self, server.get_db, local=False, path=path)

    do_GET = handle_planning
    do_POST = handle_planning
    do_PATCH = handle_planning
    do_PUT = handle_planning
    do_DELETE = handle_planning
