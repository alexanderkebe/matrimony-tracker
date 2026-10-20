import { json, parseRecordId, pinRecord, recordsRoute } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseRecordId((await params).id);
  if (id === null) return json(404, { error: "Record not found." });
  return recordsRoute((req, scope) => pinRecord(req, id, scope))(request);
}
