"""Versioned, editable service seeds; instantiated weddings keep their own snapshots."""

# The five-part Orthodox wedding checklist (1.1–5.3), in the same order as the app.
SEEDS = [
    ("PREMARITAL", "spiritual", "Premarital teaching", "የቅድመ ጋብቻ ትምህርት", -120, "Confirm course completion", False),
    ("COUNSELING", "spiritual", "Post-marriage teaching", "የድህረ ጋብቻ ትምህርት", 180, "Book the follow-up teaching", False),
    ("KIDASE", "spiritual", "Kidase responses teaching", "የቅዳሴ ተሰጥኦ ትምህርት", -90, "Confirm clergy-guided preparation", False),
    ("CHURCH", "spiritual", "Church documents & process", "የቤተክርስቲያን ሰነዶች ማስፈጸም", -300, "Verify church date and requirements with clergy", False),
    ("TEACHER", "people", "Guest teacher", "ተጋባዥ መምህር", -120, "Confirm the teacher, topic and time", False),
    ("PERFORMERS", "people", "Church choir", "የህብረት መዘምራን", -150, "Confirm repertoire, singers and rehearsals", False),
    ("SINGERS", "people", "Guest singers", "ተጋባዥ መዘምራን", -120, "Confirm singers, songs and arrival", False),
    ("INSTRUMENTS", "atmosphere", "Mezmur instruments", "የዜማ መሳሪያዎች", -90, "Confirm church approval and instrument readiness", False),
    ("VENUE", "atmosphere", "Hall / venue", "አዳራሽ", -270, "Confirm venue contract and setup access", False),
    ("DECOR", "atmosphere", "Hall decor", "የአዳራሽ ዲኮር", -150, "Approve design and installation schedule", True),
    ("SOUND", "atmosphere", "Sound system", "ሳውንድ ሲስተም", -120, "Confirm technical specification and sound check", False),
    ("GENERATOR", "logistics", "Generator & backup power", "የድንገተኛ ኃይል / ጀነሬተር", -60, "Verify electrical assessment, safe test and operator", False),
    ("CATERING", "hospitality", "Food, drinks & catering rentals", "ምግብ፣ መጠጥ እና የድግስ እቃዎች ኪራይ", -210, "Approve menu, rentals and guest count", True),
    ("TRANSPORT", "logistics", "Cars & flower decoration", "መኪና እና የአበባ ጌጣጌጥ", -120, "Confirm cars, routes, drivers and flowers", True),
    ("PHOTO", "people", "Photography & video", "ፎቶግራፍ፣ ቪዲዮ", -150, "Confirm shot list, team and delivery dates", False),
    ("ATTIRE", "people", "Attire & jewelry", "አልባሳት እና ጌጣጌጥ", -180, "Approve fittings and pickup arrangements", True),
    ("BEAUTY", "people", "Bride's hair styling & beauty", "የሙሽራዋ የፀጉር ስታይሊንግ እና የውበት ዝግጅት", -120, "Confirm trials and appointments", False),
    ("INVITATIONS", "people", "Invitation cards & guest gifts", "መጥሪያ ካርድ እና የእንግዶች ስጦታዎች", -120, "Approve proof, dispatch, gifts and RSVP plan", True),
    ("HOSTS", "hospitality", "Hosts & ushers", "አስተናጋጆች", -45, "Confirm hosts, duties and briefing", False),
    ("MC", "people", "Day protocol & program lead (MC)", "የዕለቱ ፕሮቶኮል እና መርሃ ግብር መሪ (MC)", -60, "Approve the run of show with the MC", False),
]

# No longer offered for new weddings; kept so existing weddings that use them still resolve.
RETIRED = [
    ("CAKE", "hospitality", "Cake & champagne", "ኬክ እና ሻምፓኝ", -90, "Approve design, servings and delivery cue", True),
    ("FLOWERS", "people", "Flowers", "አበባዎች", -120, "Approve flowers, substitutions and delivery", True),
    ("AC", "logistics", "Air conditioning", "የአየር ማቀዝቀዣ", -270, "Verify cooling and ventilation at venue", False),
    ("EQUIPMENT", "logistics", "Equipment checklist", "የመሣሪያ ዝርዝር", -45, "Verify inventory and custody", False),
    ("REHEARSAL", "spiritual", "Rehearsal & song study", "ልምምድ እና የመዝሙር ጥናት", -42, "Confirm rehearsal and final ceremony sequence", False),
    ("NURSE", "logistics", "Emergency nurse", "የድንገተኛ ጊዜ ነርስ", -45, "Verify qualified responder and emergency plan", False),
]
RETIRED_CODES = {seed[0] for seed in RETIRED}


def templates():
    result = []
    for code, category, en, am, offset, evidence, approval in SEEDS + RETIRED:
        aftercare = code == "COUNSELING"
        result.append({
            "id": code, "code": code, "category": category, "name": en, "nameAm": am,
            "relativeOffsetDays": offset, "defaultEnabled": code not in RETIRED_CODES, "retired": code in RETIRED_CODES, "templateVersion": 1,
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


# Stable questionnaire IDs (the app's service IDs). Keep this explicit: display order is not an identity.
LEGACY_CODES = {
    "premarital": "PREMARITAL", "post-marriage": "COUNSELING", "liturgy": "KIDASE", "church-systems": "CHURCH",
    "teacher": "TEACHER", "choir": "PERFORMERS", "guest-singers": "SINGERS", "instruments": "INSTRUMENTS",
    "venue": "VENUE", "decor": "DECOR", "sound": "SOUND", "generator": "GENERATOR", "food-drinks": "CATERING",
    "cars-flowers": "TRANSPORT", "photo-video": "PHOTO", "attire": "ATTIRE", "beauty": "BEAUTY",
    "invitation": "INVITATIONS", "hosts": "HOSTS", "mc": "MC",
}

# IDs saved before the five-part checklist: merged into their new service, or no longer offered (None).
RETIRED_IDS = {"transport": "cars-flowers", "flowers": "cars-flowers", "cake-champagne": "food-drinks",
               "ac": None, "checklist": None, "nurse": None, "rehearsal": None}
