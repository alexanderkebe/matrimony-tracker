import { getAuth, postAuth } from "@/lib/accounts";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ action: string }> };

export async function GET(request: Request, { params }: Context) {
  return getAuth(request, (await params).action);
}

export async function POST(request: Request, { params }: Context) {
  return postAuth(request, (await params).action);
}
