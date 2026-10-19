"""One-shot durable in-app reminder producer for an existing scheduler."""

import argparse
from pathlib import Path
from uuid import uuid4

import server
from .api import Router
from .auth import Identity


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sqlite", type=Path, help="Use this local SQLite file instead of the configured database")
    args = parser.parse_args()
    if args.sqlite:
        server.DB_PATH = args.sqlite.resolve()
        server.SQLITE_EXPLICIT = True
    with server.get_db() as db:
        weddings = db.query("SELECT id,organization_id FROM wp_weddings WHERE status NOT IN ('archived','cancelled')")
    total = 0
    for wedding in weddings:
        identity = Identity("reminder-worker", wedding["organization_id"], {"admin"})
        with server.get_db() as db:
            _, result = Router(db, identity, {"Idempotency-Key": str(uuid4())}).dispatch("POST", f"/api/v1/weddings/{wedding['id']}/reminders/generate")
            total += result["created"]
    print(f"Generated {total} in-app reminders. No external messages sent.")


if __name__ == "__main__":
    main()
