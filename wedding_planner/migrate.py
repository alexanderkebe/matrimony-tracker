"""Apply the additive planning schema (migration 001) to the Neon Postgres database."""

import argparse
import os
from urllib.parse import urlparse

import server
from .storage import migrate


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    # Schema changes use a direct (unpooled) connection; credentials stay in the environment.
    url = os.environ.get("DATABASE_URL_UNPOOLED", "")
    if not url or "-pooler" in (urlparse(url).hostname or ""):
        parser.error("Set DATABASE_URL_UNPOOLED to the direct (non-pooler) Neon connection string.")
    with server.PostgresDB(url) as db:
        migrate(db)
    print("Postgres planning migration 001 applied.")


if __name__ == "__main__":
    main()
