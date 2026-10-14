const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_9AExHC5MVOgT@ep-round-waterfall-b4qf4eu0-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

function getDatabaseConfig() {
  const connStr = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  let host = "ep-round-waterfall-b4qf4eu0-pooler.c-6.us-east-2.aws.neon.tech";
  try {
    const parsed = new URL(connStr);
    host = parsed.hostname;
  } catch {}
  return {
    connectionString: connStr,
    sqlEndpoint: `https://${host}/sql`
  };
}

async function queryNeon(sql, params = []) {
  const { connectionString, sqlEndpoint } = getDatabaseConfig();
  const res = await fetch(sqlEndpoint, {
    method: "POST",
    headers: {
      "neon-connection-string": connectionString,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: sql, params })
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Database error: ${errorText}`);
  }
  return await res.json();
}

function firstName(val) {
  return String(val || "").trim().split(/\s+/)[0] || "";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const idFromPath = url.pathname.split("/").filter(Boolean).pop();
  const recordId = req.query.id || (idFromPath && !isNaN(Number(idFromPath)) ? idFromPath : null);

  try {
    // 1. GET ALL
    if (req.method === "GET" && !recordId) {
      const result = await queryNeon(
        "SELECT id, bride_first_name, groom_first_name, wedding_date FROM records ORDER BY id DESC LIMIT 50;"
      );
      return res.status(200).json({ records: result.rows || [] });
    }

    // 2. GET ONE
    if (req.method === "GET" && recordId) {
      const result = await queryNeon(
        "SELECT id, plan_json FROM records WHERE id = $1 LIMIT 1;",
        [Number(recordId)]
      );
      const row = result.rows?.[0];
      if (!row) return res.status(404).json({ error: "Record not found." });
      return res.status(200).json({ id: row.id, plan: JSON.parse(row.plan_json) });
    }

    // 3. POST (CREATE)
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const details = body?.details || {};
      const bride = String(details.brideName || "").trim();
      const groom = String(details.groomName || "").trim();
      const date = String(details.weddingDate || "").trim();
      const lang = body?.lang === "am" ? "am" : "en";
      const now = new Date().toISOString();

      if (!bride || !groom) {
        return res.status(400).json({ error: "Enter both bride and groom names." });
      }

      const result = await queryNeon(
        `INSERT INTO records (bride_name, groom_name, bride_first_name, groom_first_name, wedding_date, language, plan_json, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id;`,
        [bride, groom, firstName(bride), firstName(groom), date, lang, JSON.stringify(body), now, now]
      );
      const newId = result.rows?.[0]?.id;
      return res.status(201).json({ id: newId });
    }

    // 4. PUT (UPDATE)
    if (req.method === "PUT") {
      if (!recordId) return res.status(400).json({ error: "Record ID required." });
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const details = body?.details || {};
      const bride = String(details.brideName || "").trim();
      const groom = String(details.groomName || "").trim();
      const date = String(details.weddingDate || "").trim();
      const lang = body?.lang === "am" ? "am" : "en";
      const now = new Date().toISOString();

      const result = await queryNeon(
        `UPDATE records SET bride_name=$1, groom_name=$2, bride_first_name=$3, groom_first_name=$4,
         wedding_date=$5, language=$6, plan_json=$7, updated_at=$8
         WHERE id=$9 RETURNING id;`,
        [bride, groom, firstName(bride), firstName(groom), date, lang, JSON.stringify(body), now, Number(recordId)]
      );
      if (!result.rows?.length) return res.status(404).json({ error: "Record not found." });
      return res.status(200).json({ id: Number(recordId) });
    }

    // 5. DELETE
    if (req.method === "DELETE") {
      if (!recordId) return res.status(400).json({ error: "Record ID required." });
      const result = await queryNeon("DELETE FROM records WHERE id = $1 RETURNING id;", [Number(recordId)]);
      return res.status(200).json({ deleted: Boolean(result.rows?.length) });
    }

    return res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
