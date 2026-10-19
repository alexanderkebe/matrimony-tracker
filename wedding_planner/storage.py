"""Portable relational storage using the host's SQLite / pg8000 transaction adapters."""

import json
from datetime import date, datetime, timezone
from uuid import uuid4

COLLECTIONS = {
    "services", "tasks", "milestones", "events", "vendors", "budget_lines", "payments",
    "documents", "document_versions", "document_reviews", "files", "guests", "issues", "boards", "notes", "notifications",
}


def now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def encode(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def migrate(db):
    """Migration 001. Run explicitly on Postgres, automatically on local SQLite only."""
    if hasattr(db, "path") and not db.conn.in_transaction:
        db.execute("BEGIN IMMEDIATE")
    statements = [
        "CREATE TABLE IF NOT EXISTS wp_schema (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)",
        """CREATE TABLE IF NOT EXISTS wp_weddings (
            id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, client_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
            title TEXT NOT NULL, wedding_date TEXT, status TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
            payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)""",
        "CREATE INDEX IF NOT EXISTS wp_weddings_org_status ON wp_weddings(organization_id,status)",
        "CREATE INDEX IF NOT EXISTS wp_weddings_client ON wp_weddings(client_id)",
        "CREATE INDEX IF NOT EXISTS wp_weddings_date ON wp_weddings(organization_id,wedding_date)",
        """CREATE TABLE IF NOT EXISTS wp_members (
            wedding_id TEXT NOT NULL REFERENCES wp_weddings(id), user_id TEXT NOT NULL,
            payload_json TEXT NOT NULL, PRIMARY KEY(wedding_id,user_id))""",
        "CREATE INDEX IF NOT EXISTS wp_members_user ON wp_members(user_id,wedding_id)",
        """CREATE TABLE IF NOT EXISTS wp_templates (
            id TEXT NOT NULL, organization_id TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
            payload_json TEXT NOT NULL, PRIMARY KEY(organization_id,id))""",
        """CREATE TABLE IF NOT EXISTS wp_requests (
            organization_id TEXT NOT NULL, user_id TEXT NOT NULL, request_key TEXT NOT NULL, fingerprint TEXT NOT NULL,
            response_json TEXT, created_at TEXT NOT NULL, PRIMARY KEY(organization_id,user_id,request_key))""",
        """CREATE TABLE IF NOT EXISTS wp_audit (
            id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, wedding_id TEXT NOT NULL REFERENCES wp_weddings(id),
            actor_user_id TEXT NOT NULL, action TEXT NOT NULL, collection TEXT NOT NULL, entity_id TEXT NOT NULL,
            before_json TEXT, after_json TEXT, created_at TEXT NOT NULL)""",
        "CREATE INDEX IF NOT EXISTS wp_audit_wedding ON wp_audit(wedding_id,created_at)",
    ]
    for sql in statements:
        db.execute(sql)
    if db.query_one("SELECT version FROM wp_schema WHERE version=1"):
        return
    for collection in ["services", *sorted(COLLECTIONS - {"services"})]:
        # Context, ownership, visibility, dates and money are indexed relational columns.
        # Template-dependent attributes live in an immutable/versioned JSON snapshot.
        service_fk = "" if collection == "services" else " REFERENCES wp_services(id)"
        db.execute(f"""CREATE TABLE IF NOT EXISTS wp_{collection} (
            id TEXT PRIMARY KEY, organization_id TEXT NOT NULL,
            wedding_id TEXT NOT NULL REFERENCES wp_weddings(id), service_id TEXT{service_fk},
            owner_user_id TEXT, visibility TEXT NOT NULL DEFAULT 'internal', status TEXT NOT NULL,
            due_at TEXT, amount_minor BIGINT NOT NULL DEFAULT 0 CHECK(amount_minor >= 0),
            external_ref TEXT, code TEXT, version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
            payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)""")
        db.execute(f"CREATE INDEX IF NOT EXISTS wp_{collection}_scope ON wp_{collection}(organization_id,wedding_id,status)")
        db.execute(f"CREATE INDEX IF NOT EXISTS wp_{collection}_due ON wp_{collection}(wedding_id,due_at)")
        db.execute(f"CREATE INDEX IF NOT EXISTS wp_{collection}_service ON wp_{collection}(service_id)")
        db.execute(f"CREATE INDEX IF NOT EXISTS wp_{collection}_owner ON wp_{collection}(wedding_id,owner_user_id)")
    db.execute("CREATE UNIQUE INDEX IF NOT EXISTS wp_services_template ON wp_services(wedding_id,code)")
    db.execute("CREATE UNIQUE INDEX IF NOT EXISTS wp_payments_transaction ON wp_payments(organization_id,external_ref)")
    db.execute("CREATE UNIQUE INDEX IF NOT EXISTS wp_notifications_dedupe ON wp_notifications(wedding_id,code)")
    db.execute("""CREATE TABLE IF NOT EXISTS wp_dependencies (
        wedding_id TEXT NOT NULL REFERENCES wp_weddings(id), predecessor_id TEXT NOT NULL REFERENCES wp_tasks(id),
        successor_id TEXT NOT NULL REFERENCES wp_tasks(id), CHECK(predecessor_id <> successor_id),
        PRIMARY KEY(predecessor_id,successor_id))""")
    db.execute("CREATE INDEX IF NOT EXISTS wp_dependencies_successor ON wp_dependencies(wedding_id,successor_id)")
    db.execute("INSERT INTO wp_schema(version,applied_at) VALUES(1,?)", (now(),))


class Store:
    def __init__(self, db, organization_id):
        self.db, self.org = db, organization_id

    def wedding(self, wedding_id):
        row = self.db.query_one("SELECT * FROM wp_weddings WHERE organization_id=? AND id=?", (self.org, wedding_id))
        if not row:
            return None
        value = json.loads(row["payload_json"])
        value.update(id=row["id"], organizationId=row["organization_id"], clientId=row["client_id"],
                     version=row["version"], createdAt=row["created_at"], updatedAt=row["updated_at"])
        return value

    def create_wedding(self, value):
        value = {**value, "id": str(uuid4()), "organizationId": self.org, "version": 1, "createdAt": now(), "updatedAt": now()}
        self.db.execute("""INSERT INTO wp_weddings
            (id,organization_id,client_id,title,wedding_date,status,version,payload_json,created_at,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)""", (value["id"], self.org, value.get("clientId"), value["title"], value.get("weddingDate"),
                value["status"], 1, encode(value), value["createdAt"], value["updatedAt"]))
        return value

    def update_wedding(self, value, expected):
        value = {**value, "version": expected + 1, "updatedAt": now()}
        count = self.db.execute("""UPDATE wp_weddings SET title=?,wedding_date=?,status=?,version=?,payload_json=?,updated_at=?,client_id=?
            WHERE id=? AND organization_id=? AND version=?""", (value["title"], value.get("weddingDate"), value["status"],
                value["version"], encode(value), value["updatedAt"], value.get("clientId"), value["id"], self.org, expected))
        return value if count else None

    def items(self, collection, wedding_id):
        assert collection in COLLECTIONS
        rows = self.db.query(f"SELECT payload_json,version FROM wp_{collection} WHERE organization_id=? AND wedding_id=? ORDER BY created_at,id", (self.org, wedding_id))
        return [{**json.loads(row["payload_json"]), "version": row["version"]} for row in rows]

    def item(self, collection, wedding_id, item_id):
        assert collection in COLLECTIONS
        row = self.db.query_one(f"SELECT payload_json,version FROM wp_{collection} WHERE organization_id=? AND wedding_id=? AND id=?", (self.org, wedding_id, item_id))
        return {**json.loads(row["payload_json"]), "version": row["version"]} if row else None

    def put(self, collection, wedding_id, value, expected=None):
        assert collection in COLLECTIONS
        value = {**value, "weddingId": wedding_id, "organizationId": self.org,
                 "id": value.get("id") if expected is not None else str(uuid4()), "version": 1 if expected is None else expected + 1,
                 "createdAt": value.get("createdAt", now()), "updatedAt": now()}
        fields = (value.get("serviceId"), value.get("ownerUserId"), value.get("visibility", "internal"), value.get("status", "todo"),
                  value.get("dueAt") or value.get("dueOn") or value.get("startAt"), value.get("amountMinor", 0),
                  value.get("externalTransactionId") or None, value.get("dedupeKey") or value.get("code"), value["version"], encode(value), value["updatedAt"])
        if expected is None:
            self.db.execute(f"""INSERT INTO wp_{collection}
                (service_id,owner_user_id,visibility,status,due_at,amount_minor,external_ref,code,version,payload_json,updated_at,id,organization_id,wedding_id,created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (*fields, value["id"], self.org, wedding_id, value["createdAt"]))
        else:
            count = self.db.execute(f"""UPDATE wp_{collection} SET service_id=?,owner_user_id=?,visibility=?,status=?,due_at=?,amount_minor=?,
                external_ref=?,code=?,version=?,payload_json=?,updated_at=? WHERE id=? AND organization_id=? AND wedding_id=? AND version=?""",
                (*fields, value["id"], self.org, wedding_id, expected))
            if not count:
                return None
        return value

    def audit(self, wedding_id, actor, action, collection, entity_id, before=None, after=None):
        # Binary files and private counseling content never go into the general activity feed.
        def safe(value):
            if value and value.get("visibility") == "restricted":
                return {key: value[key] for key in ("id", "visibility", "status", "serviceId") if key in value}
            return {key: val for key, val in (value or {}).items() if key not in {"contentBase64", "restrictedNotes", "privateNotes", "templateSnapshot", "questionnaire", "questionnaireSettings"}}
        self.db.execute("""INSERT INTO wp_audit
            (id,organization_id,wedding_id,actor_user_id,action,collection,entity_id,before_json,after_json,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?)""", (str(uuid4()), self.org, wedding_id, actor, action, collection, entity_id,
                encode(safe(before)) if before else None, encode(safe(after)) if after else None, now()))
