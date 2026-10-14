const CURATED_PLACES = [
  {
    name: "Sheraton Addis",
    address: "Taitu St, Addis Ababa, Ethiopia",
    lat: 9.020308989125988,
    lon: 38.757427774498815,
    aliases: ["sher", "sheraton", "sheraton addis", "addis sheraton", "ሸራተን"]
  },
  {
    name: "Ethiopian Skylight Hotel",
    address: "Airport Rd, Bole, Addis Ababa, Ethiopia",
    lat: 8.9892,
    lon: 38.7891,
    aliases: ["skylight", "skylight hotel", "ስካይላይት"]
  },
  {
    name: "Holy Trinity Cathedral",
    address: "Queen Elizabeth St, Arada, Addis Ababa, Ethiopia",
    lat: 9.0308012,
    lon: 38.7664911,
    aliases: ["holy trinity", "trinity", "trinity cathedral", "ቅድስት ሥላሴ", "ሥላሴ ካቴድራል"]
  },
  {
    name: "Bole Medhanealem Cathedral",
    address: "Cameroon St, Bole, Addis Ababa, Ethiopia",
    lat: 8.9956,
    lon: 38.7865,
    aliases: ["medhanealem", "bole medhanealem", "መድኃኔዓለም"]
  },
  {
    name: "St. George's Cathedral",
    address: "Piazza, Arada, Addis Ababa, Ethiopia",
    lat: 9.0375,
    lon: 38.7514,
    aliases: ["st george", "george cathedral", "ቅዱስ ጊዮርጊስ"]
  },
  {
    name: "Millennium Hall",
    address: "Bole Medhanealem, Addis Ababa, Ethiopia",
    lat: 8.9935,
    lon: 38.7854,
    aliases: ["millennium", "millennium hall", "ሚሌኒየም አዳራሽ"]
  },
  {
    name: "Hilton Addis Ababa",
    address: "Menelik II Ave, Addis Ababa, Ethiopia",
    lat: 9.0195,
    lon: 38.7628,
    aliases: ["hilton", "hilton addis", "ሂልተን"]
  },
  {
    name: "Hyatt Regency Addis Ababa",
    address: "Meskel Square, Addis Ababa, Ethiopia",
    lat: 9.0105,
    lon: 38.7615,
    aliases: ["hyatt", "hyatt regency", "ሀያት ሪጀንሲ"]
  },
  {
    name: "Radisson Blu Hotel",
    address: "Kazanchis, Kirkos, Addis Ababa, Ethiopia",
    lat: 9.0165,
    lon: 38.7702,
    aliases: ["radisson", "radisson blu", "ራዲሰን"]
  },
  {
    name: "Elilly International Hotel",
    address: "Kazanchis, Addis Ababa, Ethiopia",
    lat: 9.0178,
    lon: 38.7674,
    aliases: ["elilly", "ኤሊሊ"]
  },
  {
    name: "Capital Hotel and Spa",
    address: "Haile Gebreselassie Ave, Addis Ababa, Ethiopia",
    lat: 9.0182,
    lon: 38.7812,
    aliases: ["capital hotel", "ካፒታል ሆቴል"]
  },
  {
    name: "Haile Grand Addis Ababa",
    address: "Yeka, Addis Ababa, Ethiopia",
    lat: 9.0321,
    lon: 38.8152,
    aliases: ["haile grand", "ኃይሌ ግራንድ"]
  },
  {
    name: "Inter Luxury Hotel",
    address: "Kazanchis, Addis Ababa, Ethiopia",
    lat: 9.0184,
    lon: 38.7691,
    aliases: ["inter luxury", "ኢንተር ሊግዠሪ"]
  },
  {
    name: "Entoto Park / Kuriftu",
    address: "Entoto, Addis Ababa, Ethiopia",
    lat: 9.0883,
    lon: 38.7562,
    aliases: ["entoto", "kuriftu entoto", "እንጦጦ"]
  },
  {
    name: "Ghion Hotel",
    address: "Ras Desta Damtew St, Addis Ababa, Ethiopia",
    lat: 9.0134,
    lon: 38.7589,
    aliases: ["ghion", "ግዮን ሆቴል"]
  }
];

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

  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const isReverse = url.pathname.endsWith("/reverse") || req.query.reverse !== undefined;

  if (isReverse) {
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

  const query = (req.query.q || "").trim();
  if (query.length < 2) {
    return res.status(400).json({ error: "Search must contain between 2 and 160 characters." });
  }

  const term = query.toLowerCase();
  const curated = CURATED_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.address.toLowerCase().includes(term) ||
      p.aliases.some((alias) => alias.toLowerCase().includes(term) || term.includes(alias.toLowerCase()))
  ).map(({ name, address, lat, lon }) => ({ name, address, lat, lon }));

  const lat = Number(req.query.lat) || 9.03;
  const lon = Number(req.query.lon) || 38.75;

  let remote = [];
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=6&bbox=32.9,3.4,48.0,15.0`;
    const response = await fetch(photonUrl, {
      headers: { "User-Agent": "MatrimonyPlanner/1.0", "Accept": "application/json" }
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.features)) {
        remote = data.features.map(normalizePlace).filter(Boolean);
      }
    }
  } catch {
    // If bounded search fails, try global
    try {
      const photonUrl2 = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&limit=6`;
      const response2 = await fetch(photonUrl2, {
        headers: { "User-Agent": "MatrimonyPlanner/1.0", "Accept": "application/json" }
      });
      if (response2.ok) {
        const data2 = await response2.json();
        if (Array.isArray(data2.features)) {
          remote = data2.features.map(normalizePlace).filter(Boolean);
        }
      }
    } catch {}
  }

  const combined = [...curated, ...remote];
  const seen = new Set();
  const places = [];
  for (const place of combined) {
    const key = `${place.name.toLowerCase()}|${Number(place.lat).toFixed(3)}|${Number(place.lon).toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      places.push(place);
    }
  }

  return res.status(200).json({ places: places.slice(0, 6) });
}
