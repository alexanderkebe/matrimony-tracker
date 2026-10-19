"""Apply the additive planning schema to an explicit SQLite file or direct Postgres URL."""

import argparse
import os
from pathlib import Path
from urllib.parse import urlparse

import server
from .storage import migrate


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--sqlite", type=Path)
    group.add_argument("--postgres", action="store_true", help="Use DATABASE_URL_UNPOOLED from the environment; no credentials in arguments")
    args = parser.parse_args()
    if args.sqlite:
        server.DB_PATH = args.sqlite.resolve()
        server.SQLITE_EXPLICIT = True
        server.initialize()
        print("SQLite planning migration 001 applied.")
        return
    url = os.environ.get("DATABASE_URL_UNPOOLED", "")
    if not url or "-pooler" in (urlparse(url).hostname or ""):
        parser.error("Set DATABASE_URL_UNPOOLED to a direct connection for an isolated development branch.")
    if not server.HAS_PG:
        parser.error("Install requirements.txt to use Postgres.")
    with server.PostgresDB(url) as db:
        migrate(db)
    print("Postgres planning migration 001 applied.")


if __name__ == "__main__":
    main()
