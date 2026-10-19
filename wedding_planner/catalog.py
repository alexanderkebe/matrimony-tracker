"""Versioned, editable service seeds; instantiated weddings keep their own snapshots."""

SEEDS = [
    ("PREMARITAL", "spiritual", "Premarital education", "ቅድመ ጋብቻ ትምህርት", -120, "Confirm course completion", False),
    ("KIDASE", "spiritual", "Liturgy / Kidase education", "የቅዳሴ ትምህርት", -90, "Confirm clergy-guided preparation", False),
    ("COUNSELING", "spiritual", "Post-marriage counseling", "ድህረ ጋብቻ ምክክር", 180, "Book the six-month follow-up", False),
    ("CHURCH", "spiritual", "Church coordination", "የቤተ ክርስቲያን ቅንጅት", -300, "Verify church date and requirements with clergy", False),
    ("VENUE", "atmosphere", "Hall / venue", "አዳራሽ / ቦታ", -270, "Confirm venue contract and setup access", False),
    ("DECOR", "atmosphere", "Decor & home exit", "ዲኮር እና የቤት መውጫ", -150, "Approve design and installation schedule", True),
    ("SOUND", "atmosphere", "Sound system", "የድምፅ ስርዓት", -120, "Confirm technical specification and sound check", False),
    ("INSTRUMENTS", "atmosphere", "Mezmur instruments", "የመዝሙር መሣሪያዎች", -90, "Confirm church approval and instrument readiness", False),
    ("PERFORMERS", "people", "Choir, singers & teacher", "ዘማሪዎች እና መምህር", -150, "Confirm repertoire, performers and rehearsals", False),
    ("CAKE", "hospitality", "Cake & champagne", "ኬክ እና ሻምፓኝ", -90, "Approve design, servings and delivery cue", True),
    ("CATERING", "hospitality", "Food & drinks", "ምግብ እና መጠጥ", -210, "Approve menu, safe service and guest count", True),
    ("ATTIRE", "people", "Attire & jewelry", "አልባሳት እና ጌጣጌጥ", -180, "Approve fittings and pickup arrangements", True),
    ("TRANSPORT", "logistics", "Cars & transport", "መኪኖች እና ትራንስፖርት", -120, "Confirm routes, drivers and backup vehicles", False),
    ("FLOWERS", "people", "Flowers", "አበባዎች", -120, "Approve flowers, substitutions and delivery", True),
    ("BEAUTY", "people", "Beauty care", "የውበት እንክብካቤ", -120, "Confirm trials and appointments", False),
    ("GENERATOR", "logistics", "Generator", "ጀነሬተር", -60, "Verify electrical assessment, safe test and operator", False),
    ("AC", "logistics", "Air conditioning", "የአየር ማቀዝቀዣ", -270, "Verify cooling and ventilation at venue", False),
    ("EQUIPMENT", "logistics", "Equipment checklist", "የመሣሪያ ዝርዝር", -45, "Verify inventory and custody", False),
    ("REHEARSAL", "spiritual", "Rehearsal & song study", "ልምምድ እና የመዝሙር ጥናት", -42, "Confirm rehearsal and final ceremony sequence", False),
    ("INVITATIONS", "people", "Invitation cards", "የጥሪ ካርዶች", -120, "Approve proof, dispatch and RSVP plan", True),
    ("NURSE", "logistics", "Emergency nurse", "የድንገተኛ ጊዜ ነርስ", -45, "Verify qualified responder and emergency plan", False),
]


def templates():
    result = []
    for code, category, en, am, offset, evidence, approval in SEEDS:
        aftercare = code == "COUNSELING"
        result.append({
            "id": code, "code": code, "category": category, "name": en, "nameAm": am,
            "relativeOffsetDays": offset, "defaultEnabled": True, "templateVersion": 1,
            "aftercare": aftercare, "approvalRequired": approval, "evidence": evidence,
            "critical": code in {"CHURCH", "VENUE", "GENERATOR", "NURSE"},
            "tasks": [
                {"code": "brief", "title": "Agree scope and assign an owner", "titleAm": "ወሰኑን ያረጋግጡ እና ኃላፊ ይመድቡ",
                 "offsetDays": offset - 30 if code == "CHURCH" else offset, "required": True, "priority": "normal"},
                {"code": "arrange", "title": "Book follow-up appointment" if aftercare else "Confirm provider and schedule",
                 "titleAm": "አቅራቢውን እና መርሃ ግብሩን ያረጋግጡ", "offsetDays": offset - 15 if code == "CHURCH" else offset if aftercare else min(-7, offset // 2),
                 "required": True, "priority": "normal"},
                {"code": "verify", "title": evidence, "titleAm": "የዝግጁነት ማስረጃ ያረጋግጡ",
                 "offsetDays": offset if aftercare or code == "CHURCH" else -14, "required": True,
                 "approvalRequired": approval, "priority": "critical" if code in {"CHURCH", "VENUE", "GENERATOR", "NURSE"} else "normal"},
            ],
        })
    return result


# Stable questionnaire IDs. Keep this explicit: display order is not an identity.
LEGACY_CODES = {
    "premarital": "PREMARITAL", "liturgy": "KIDASE", "post-marriage": "COUNSELING",
    "church-systems": "CHURCH", "venue": "VENUE", "decor": "DECOR", "sound": "SOUND",
    "instruments": "INSTRUMENTS", "choir": "PERFORMERS", "cake-champagne": "CAKE",
    "food-drinks": "CATERING", "attire": "ATTIRE", "transport": "TRANSPORT",
    "flowers": "FLOWERS", "beauty": "BEAUTY", "generator": "GENERATOR", "ac": "AC",
    "checklist": "EQUIPMENT", "rehearsal": "REHEARSAL", "invitation": "INVITATIONS", "nurse": "NURSE",
}
