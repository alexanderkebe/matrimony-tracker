// Port of server.py venue search: curated venues first, then Photon (OpenStreetMap)
// with Ethiopia-biased ranking, a shared 1 request/second limit and a 5-minute cache.

export interface Place {
  name: string;
  address: string;
  lat: number;
  lon: number;
}

interface PhotonFeature {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: unknown };
}

export class PlaceInputError extends Error {}

const PHOTON_URL = process.env.MATRIMONY_PHOTON_URL || "https://photon.komoot.io/api/";
const PHOTON_REVERSE_URL = process.env.MATRIMONY_PHOTON_REVERSE_URL || PHOTON_URL.replace(/\/+$/, "").replace(/\/[^/]*$/, "") + "/reverse";
const HOME_BBOX = [32.9, 3.4, 48.0, 15.0] as const;
const CACHE_TTL_MS = 300_000;

const CURATED_PLACES: (Place & { aliases: string[] })[] = [
  { name: "Sheraton Addis", address: "Taitu St, Addis Ababa, Ethiopia", lat: 9.020308989125988, lon: 38.757427774498815, aliases: ["sher", "sheraton", "sheraton addis", "addis sheraton", "ሸራተን"] },
  { name: "Ethiopian Skylight Hotel", address: "Airport Rd, Bole, Addis Ababa, Ethiopia", lat: 8.9892, lon: 38.7891, aliases: ["skylight", "skylight hotel", "ስካይላይት"] },
  { name: "Holy Trinity Cathedral", address: "Queen Elizabeth St, Arada, Addis Ababa, Ethiopia", lat: 9.0308012, lon: 38.7664911, aliases: ["holy trinity", "trinity", "trinity cathedral", "ቅድስት ሥላሴ", "ሥላሴ ካቴድራል"] },
  { name: "Bole Medhanealem Cathedral", address: "Cameroon St, Bole, Addis Ababa, Ethiopia", lat: 8.9956, lon: 38.7865, aliases: ["medhanealem", "bole medhanealem", "መድኃኔዓለም"] },
  { name: "St. George's Cathedral", address: "Piazza, Arada, Addis Ababa, Ethiopia", lat: 9.0375, lon: 38.7514, aliases: ["st george", "george cathedral", "ቅዱስ ጊዮርጊስ"] },
  { name: "Millennium Hall", address: "Bole Medhanealem, Addis Ababa, Ethiopia", lat: 8.9935, lon: 38.7854, aliases: ["millennium", "millennium hall", "ሚሌኒየም አዳራሽ"] },
  { name: "Hilton Addis Ababa", address: "Menelik II Ave, Addis Ababa, Ethiopia", lat: 9.0195, lon: 38.7628, aliases: ["hilton", "hilton addis", "ሂልተን"] },
  { name: "Hyatt Regency Addis Ababa", address: "Meskel Square, Addis Ababa, Ethiopia", lat: 9.0105, lon: 38.7615, aliases: ["hyatt", "hyatt regency", "ሀያት ሪጀንሲ"] },
  { name: "Radisson Blu Hotel", address: "Kazanchis, Kirkos, Addis Ababa, Ethiopia", lat: 9.0165, lon: 38.7702, aliases: ["radisson", "radisson blu", "ራዲሰን"] },
  { name: "Elilly International Hotel", address: "Kazanchis, Addis Ababa, Ethiopia", lat: 9.0178, lon: 38.7674, aliases: ["elilly", "ኤሊሊ"] },
  { name: "Capital Hotel and Spa", address: "Haile Gebreselassie Ave, Addis Ababa, Ethiopia", lat: 9.0182, lon: 38.7812, aliases: ["capital hotel", "ካፒታል ሆቴል"] },
  { name: "Haile Grand Addis Ababa", address: "Yeka, Addis Ababa, Ethiopia", lat: 9.0321, lon: 38.8152, aliases: ["haile grand", "ኃይሌ ግራንድ"] },
  { name: "Inter Luxury Hotel", address: "Kazanchis, Addis Ababa, Ethiopia", lat: 9.0184, lon: 38.7691, aliases: ["inter luxury", "ኢንተር ሊግዠሪ"] },
  { name: "Entoto Park / Kuriftu", address: "Entoto, Addis Ababa, Ethiopia", lat: 9.0883, lon: 38.7562, aliases: ["entoto", "kuriftu entoto", "እንጦጦ"] },
  { name: "Ghion Hotel", address: "Ras Desta Damtew St, Addis Ababa, Ethiopia", lat: 9.0134, lon: 38.7589, aliases: ["ghion", "ግዮን ሆቴል"] }
];

const cache = new Map<string, { at: number; value: unknown }>();
let lastRequest = 0;
let queue: Promise<unknown> = Promise.resolve();

function cached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.at >= CACHE_TTL_MS) return undefined;
  return entry.value as T;
}

function remember<T>(key: string, value: T): T {
  cache.delete(key);
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 100) cache.delete(cache.keys().next().value!);
  return value;
}

export function validateCoordinates(lat: number, lon: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new PlaceInputError("Invalid coordinates.");
  }
}

/** All provider calls share one queue so the public demo sees at most 1 request/second. */
function photonFeatures(endpoint: string, parameters: Record<string, string | number>): Promise<PhotonFeature[]> {
  const task = queue.then(async () => {
    const wait = 1000 - (Date.now() - lastRequest);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequest = Date.now();
    const query = new URLSearchParams(Object.entries(parameters).map(([key, value]) => [key, String(value)]));
    const response = await fetch(`${endpoint}?${query}`, {
      headers: { "User-Agent": "MatrimonyPlanner/1.0 (venue search)", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Place provider returned ${response.status}.`);
    const raw = (await response.json()) as { features?: unknown };
    if (!Array.isArray(raw?.features)) throw new Error("Invalid place response.");
    return (raw.features as PhotonFeature[]).slice(0, 12);
  });
  queue = task.catch(() => undefined);
  return task;
}

function normalizePlace(feature: PhotonFeature): Place | null {
  const properties = feature?.properties;
  const coordinates = feature?.geometry?.coordinates;
  if (!properties || typeof properties !== "object" || !Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [lon, lat] = coordinates;
  if (typeof lon !== "number" || typeof lat !== "number" || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  const name = properties.name || properties.street || properties.city;
  if (typeof name !== "string" || !name.trim()) return null;
  const parts = ["housenumber", "street", "district", "city", "state", "country"]
    .map((key) => properties[key])
    .filter((part) => part && String(part) !== name)
    .map(String);
  return { name: name.trim(), address: [...new Set(parts)].join(", "), lat, lon };
}

function curatedSuggestions(query: string): Place[] {
  const term = query.toLocaleLowerCase().trim();
  return CURATED_PLACES
    .filter((place) => place.name.toLocaleLowerCase().includes(term)
      || place.aliases.some((alias) => alias.toLocaleLowerCase().includes(term) || alias.toLocaleLowerCase().startsWith(term)))
    .map(({ name, address, lat, lon }) => ({ name, address, lat, lon }));
}

const hasLetter = (value: string) => /\p{L}/u.test(value);
const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

export async function searchPlaces(rawQuery: string, lat = 9.03, lon = 38.75): Promise<Place[]> {
  const query = rawQuery.trim();
  if (query.length < 2 || query.length > 160) throw new PlaceInputError("Search must contain between 2 and 160 characters.");
  validateCoordinates(lat, lon);
  const key = `search|${query.toLocaleLowerCase()}|${round(lat, 2)}|${round(lon, 2)}`;
  const hit = cached<Place[]>(key);
  if (hit) return hit;
  const curated = curatedSuggestions(query);
  if (curated.length) return remember(key, curated);

  const common = { q: query, lat, lon, limit: 6 };
  const features: PhotonFeature[] = [];
  let failures = 0;
  // Fetch Ethiopia-bounded and worldwide matches separately; keep partial results.
  for (const parameters of [{ ...common, bbox: HOME_BBOX.join(",") }, common]) {
    try {
      features.push(...await photonFeatures(PHOTON_URL, parameters));
    } catch {
      failures += 1;
    }
    const named = features.map(normalizePlace).filter((place): place is Place => !!place && hasLetter(place.name));
    if (new Set(named.map((place) => `${place.name}|${place.lat}|${place.lon}`)).size >= 6) break;
  }
  if (failures === 2) throw new Error("Place provider is unavailable.");

  const term = query.toLocaleLowerCase();
  const seen = new Set<string>();
  const ranked: { score: number; order: number; place: Place }[] = [];
  features.forEach((feature, order) => {
    const place = normalizePlace(feature);
    if (!place || !hasLetter(place.name)) return;
    const identity = `${place.name.toLocaleLowerCase()}|${round(place.lat, 5)}|${round(place.lon, 5)}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    const name = place.name.toLocaleLowerCase();
    const local = HOME_BBOX[0] <= place.lon && place.lon <= HOME_BBOX[2] && HOME_BBOX[1] <= place.lat && place.lat <= HOME_BBOX[3];
    let score = (local ? 200 : 0) + (name === term ? 100 : name.startsWith(term) ? 60 : name.includes(term) ? 30 : 0);
    score += ["tourism", "amenity", "building", "leisure"].includes(String(feature.properties?.osm_key)) ? 10 : 0;
    score += feature.properties?.city ? 5 : 0;
    ranked.push({ score, order, place });
  });
  ranked.sort((a, b) => b.score - a.score || a.order - b.order);
  return remember(key, ranked.slice(0, 6).map((entry) => entry.place));
}

export async function reversePlace(lat: number, lon: number): Promise<Place | null> {
  validateCoordinates(lat, lon);
  const key = `reverse|${round(lat, 5)}|${round(lon, 5)}`;
  const hit = cached<Place | null>(key);
  if (hit !== undefined) return hit ? { ...hit, lat, lon } : null;
  const features = await photonFeatures(PHOTON_REVERSE_URL, { lat, lon, limit: 1 });
  const found = features.map(normalizePlace).find(Boolean) ?? null;
  // Save the user's actual position, not the center of a nearby street.
  return remember(key, found ? { ...found, lat, lon } : null);
}
