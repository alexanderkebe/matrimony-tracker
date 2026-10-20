import { openShareLink } from "@/lib/shares";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  return openShareLink((await params).code);
}
