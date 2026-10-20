import { PlaceInputError, searchPlaces } from "@/lib/places";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

const ATTRIBUTION = "© OpenStreetMap contributors";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  try {
    const places = await searchPlaces(query.get("q") ?? "", Number(query.get("lat") ?? 9.03), Number(query.get("lon") ?? 38.75));
    return json(200, { places, attribution: ATTRIBUTION });
  } catch (error) {
    if (error instanceof PlaceInputError) return json(400, { error: "Enter a valid place search." });
    return json(503, { error: "Place search is temporarily unavailable. You can still enter the venue manually." });
  }
}
