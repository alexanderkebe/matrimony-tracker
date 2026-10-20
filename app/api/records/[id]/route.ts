import { deleteRecord, getRecord, json, parseRecordId, recordsRoute, saveRecord } from "@/lib/records";
import type { Scope } from "@/lib/session";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function withRecordId(handler: (request: Request, id: number, scope: Scope) => Promise<Response>) {
  return async (request: Request, { params }: Context) => {
    const id = parseRecordId((await params).id);
    if (id === null) return json(404, { error: "Record not found." });
    return recordsRoute((req, scope) => handler(req, id, scope))(request);
  };
}

export const GET = withRecordId((_request, id, scope) => getRecord(id, scope));

export const PUT = withRecordId((request, id, scope) => saveRecord(request, id, scope));

export const DELETE = withRecordId((_request, id, scope) => deleteRecord(id, scope));
