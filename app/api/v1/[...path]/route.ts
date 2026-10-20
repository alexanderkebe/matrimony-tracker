import { request as httpRequest } from "node:http";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Forwards /api/v1/weddings/* and /api/v1/service-templates/* to the Python
// planning server (server.py) during local development. In production on
// Vercel, next.config.ts rewrites these paths to the api/weddings.py function
// before this route is reached.
const HOP_BY_HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "content-length"]);

async function proxy(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const target = process.env.PLANNING_API_URL;
  const [section] = (await params).path;
  if (section !== "weddings" && section !== "service-templates") return json(404, { error: "Route not found." });
  if (!target) return json(503, { error: "Start the planning API with `npm run dev`, or set PLANNING_API_URL." });

  const incoming = new URL(request.url);
  const upstream = new URL(incoming.pathname + incoming.search, target);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : Buffer.from(await request.arrayBuffer());
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key)) headers[key] = value;
  });
  // Keep the browser's Host so the planner's same-origin and local-identity checks see the real site.
  headers.host = request.headers.get("x-forwarded-host") || request.headers.get("host") || upstream.host;
  if (body) headers["content-length"] = String(body.length);

  return new Promise<Response>((resolve) => {
    const outgoing = httpRequest(upstream, { method: request.method, headers }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(response.headers)) {
          if (value === undefined || HOP_BY_HOP.has(key)) continue;
          for (const item of Array.isArray(value) ? value : [value]) responseHeaders.append(key, item);
        }
        const status = response.statusCode ?? 502;
        resolve(new Response(status === 204 || status === 304 ? null : Buffer.concat(chunks), { status, headers: responseHeaders }));
      });
    });
    outgoing.on("error", () => resolve(json(503, { error: "The planning API is not running. Start it with `npm run dev`." })));
    outgoing.end(body);
  });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
