import { PlaceInputError, reversePlace } from "@/lib/places";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  try {
    const place = await reversePlace(Number(query.get("lat") ?? NaN), Number(query.get("lon") ?? NaN));
    return json(200, { place, attribution: "© OpenStreetMap contributors" });
  } catch (error) {
    if (error instanceof PlaceInputError) return json(400, { error: "Enter a valid place search." });
    return json(503, { error: "Place search is temporarily unavailable. You can still enter the venue manually." });
  }
}
