import { createShareLink } from "@/lib/shares";

export const dynamic = "force-dynamic";

export const POST = (request: Request) => createShareLink(request);
