import { listRecords, recordsRoute, saveRecord } from "@/lib/records";

export const dynamic = "force-dynamic";

export const GET = recordsRoute((_request, scope) => listRecords(scope));

export const POST = recordsRoute((request, scope) => saveRecord(request, null, scope));
