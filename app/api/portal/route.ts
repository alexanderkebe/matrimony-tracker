import { listPortalRequests, submitPortalRequest } from "@/lib/portal";

export const dynamic = "force-dynamic";

export const GET = (request: Request) => listPortalRequests(request);

export const POST = (request: Request) => submitPortalRequest(request);
