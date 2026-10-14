function normalizePlace(feature) {
  if (!feature || typeof feature !== "object") return null;
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const name = properties.name;
  if (typeof name !== "string" || !name.trim()) return null;
  const parts = [
    properties.housenumber,
    properties.street,
    properties.district,
    properties.city,
    properties.state,
    properties.country
  ];
  const address = [...new Set(parts.filter((part) => part && String(part) !== name))].join(", ");
  return {
    name: name.trim(),
    address: address || "Addis Ababa, Ethiopia",
    lat: coordinates[1],
    lon: coordinates[0]
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "Invalid coordinates." });
  }

  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const response = await fetch(photonUrl, {
      headers: { "User-Agent": "MatrimonyPlanner/1.0", "Accept": "application/json" }
    });
    const data = await response.json();
    const first = data.features?.[0];
    const place = first ? normalizePlace(first) : null;
    return res.status(200).json({
      place: place ? { ...place, lat, lon } : { name: "Selected location", address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon }
    });
  } catch {
    return res.status(200).json({
      place: { name: "Selected location", address: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon }
    });
  }
}
