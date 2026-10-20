import { getTeam, postTeam } from "@/lib/accounts";

export const dynamic = "force-dynamic";

export const GET = (request: Request) => getTeam(request);

export const POST = (request: Request) => postTeam(request);
