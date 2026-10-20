import { json } from "@/lib/http";
import { actOnPortalRequest } from "@/lib/portal";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const value = (await params).id;
  if (!/^\d+$/.test(value) || Number(value) < 1) return json(404, { error: "Request not found." });
  return actOnPortalRequest(request, Number(value));
}
