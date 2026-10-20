import { createHash, randomBytes } from "node:crypto";
import { isSameOrigin, staffDenied } from "./auth";
import { getDatabase } from "./db";
import { json } from "./http";
import { requestScope } from "./session";

/**
 * Share links for proposal and agreement PDFs. A planner uploads the PDF the app generated;
 * the couple opens it at /d/<code> without signing in. Codes are random and stored only as
 * hashes, links are never listed anywhere, and they stop working after LINK_DAYS.
 */
const LINK_DAYS = 30;
// Vercel accepts request bodies up to 4.5 MB; base64 adds a third.
const MAX_PDF_BYTES = 3_200_000;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const stamp = (offsetSeconds = 0) => new Date(Date.now() + offsetSeconds * 1000).toISOString();

function origin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const protocol = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

/** Staff: store a generated PDF and return its share link. */
export async function createShareLink(request: Request) {
  const denied = staffDenied(request, "Share links");
  if (denied) return denied;
  if (!isSameOrigin(request)) return json(403, { error: "Cross-origin requests are not allowed." });
  try {
    const text = await request.text();
    if (text.length > MAX_PDF_BYTES * 1.4 + 2000) return json(413, { error: "This PDF is too large for a link. Download it or use More to send the file." });
    const body = JSON.parse(text) as { kind?: unknown; filename?: unknown; pdf?: unknown };
    const kind = body.kind === "agreement" ? "agreement" : body.kind === "proforma" ? "proforma" : null;
    const pdf = typeof body.pdf === "string" ? Buffer.from(body.pdf, "base64") : null;
    if (!kind || !pdf || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return json(400, { error: "That isn't a PDF from this app." });
    if (pdf.length > MAX_PDF_BYTES) return json(413, { error: "This PDF is too large for a link. Download it or use More to send the file." });
    const filename = (typeof body.filename === "string" ? body.filename : "Matrimony.pdf").replace(/[^\p{L}\p{N} &._-]/gu, "").slice(0, 120) || "Matrimony.pdf";
    const code = randomBytes(18).toString("base64url");
    const expiresAt = stamp(LINK_DAYS * 86400);
    await getDatabase().query(
      "INSERT INTO shared_documents (token_hash, owner_user_id, kind, filename, pdf_base64, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [sha256(code), requestScope(request)!.userId, kind, filename, pdf.toString("base64"), stamp(), expiresAt]
    );
    return json(201, { url: `${origin(request)}/d/${code}`, expiresAt });
  } catch (error) {
    if (error instanceof SyntaxError) return json(400, { error: "The upload could not be read." });
    console.error("Share link failed", error);
    return json(500, { error: "The share link couldn't be created. Download the PDF instead." });
  }
}

/** Public: the PDF behind a share link. */
export async function openShareLink(code: string) {
  const notFound = () => new Response("This link has expired or doesn't exist. Ask Matrimony By Hanna for a new one.", {
    status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" }
  });
  if (!/^[\w-]{20,40}$/.test(code)) return notFound();
  const [row] = await getDatabase().query<{ filename: string; pdf_base64: string }>(
    "SELECT filename, pdf_base64 FROM shared_documents WHERE token_hash = ? AND expires_at > ?", [sha256(code), stamp()]
  );
  if (!row) return notFound();
  const pdf = Buffer.from(row.pdf_base64, "base64");
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.filename)}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
