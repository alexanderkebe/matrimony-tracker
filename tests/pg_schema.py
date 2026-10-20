"""Temporary Postgres schema for the Python tests.

Importing this module points the server at a schema of its own inside the Neon
database (created once per test run, dropped at exit), so tests never read or
write the app's live tables. fresh() empties it between tests.
"""

import atexit
import os
import uuid

import server

SCHEMA = f"test_{os.getpid()}_{uuid.uuid4().hex[:8]}"
server.DB_SCHEMA = SCHEMA
server.initialize()
atexit.register(server.drop_schema, SCHEMA)


def fresh():
    """Empties every table (and restarts ids) so each test starts like a new database."""
    server.DB_SCHEMA = SCHEMA
    with server.get_db() as db:
        tables = [row["table_name"] for row in db.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name <> 'wp_schema'", (SCHEMA,))]
        db.execute("TRUNCATE " + ", ".join(f'"{table}"' for table in tables) + " RESTART IDENTITY CASCADE")
