// The client portal (/portal) is this page in a couple-facing mode: no sidebar, records, documents or prices.
const PORTAL = /^\/portal\/?$/.test(location.pathname);
const STORAGE_KEY = PORTAL ? "matrimony-by-hanna-portal-draft-v1" : "matrimony-by-hanna-planning-draft-v1";

// Staff pages need a signed-in account. When a request comes back 401 the session has
// ended (signed out elsewhere, removed from the team), so go to sign-in and return here.
function goToSignIn() {
  const next = location.pathname + location.search;
  location.assign(`/signin${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`);
}
if (!PORTAL) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await nativeFetch(input, init);
    if (response.status === 401) {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url, location.href);
      if (url.origin === location.origin && url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/")) goToSignIn();
    }
    return response;
  };
}

// Account-holder and contract-signatory names are intentionally kept as supplied.
const SERVICE_PROVIDER = {
  name: "Matrimony",
  accountHolder: "Hanna Wendemagegn Zewde",
  bankAccounts: [
    { bank: "CBE", number: "1000262544428" },
    { bank: "BOA", number: "45622053" }
  ],
  telebirr: "0953914487",
  signatory: { en: "Hanna Woldemariam", am: "ሃና ወልደማርያም" }
};

const copy = {
  en: {
    brandCaption: "Ceremony, beautifully considered.",
    workspaceLabel: "Planning workspace",
    navDetails: "Couple & event",
    navServices: "Services",
    navReview: "Review",
    navPricing: "Pricing",
    navAgreement: "Agreement",
    navProforma: "Proposal",
    eventDays: "Number of event days",
    servicePrice: "Agreed price",
    priceAutoHint: "Enter one agreed overall fee. The proposal will show a single general price.",
    viewProforma: "View proposal",
    proformaEyebrow: "THE QUOTATION",
    proformaTitle: "Your proposal.",
    proformaDescription: "A clear summary of selected services and one agreed total.",
    backToAgreement: "Agreement",
    printProforma: "Print proposal PDF",
    proformaDocumentTitle: "Proposal",
    proformaPreparedFor: "Prepared for",
    proformaScope: "Selected services",
    proformaService: "Service and agreed details",
    proformaAmount: "Price (ETB)",
    proformaTotal: "General agreed price",
    proformaDeposit: "Planned deposit",
    proformaBalance: "Balance after deposit",
    proformaThanks: "Thank you for choosing Matrimony By Hanna. It is a privilege to be part of your celebration, and we look forward to caring for every detail with you.",
    proformaNote: "The selected services are listed for reference; pricing is shown as one overall fee. The signed agreement sets out the payment terms.",
    proformaDetailsRequired: "Enter the event days and overall agreed fee before opening the proposal.",
    navRecords: "Records",
    navPlan: "Plan",
    recordsEyebrow: "THE COUPLES",
    recordsTitle: "Saved records.",
    recordsDescription: "Find a couple by name, phone, date (EC or Gregorian), place, service, fee or Ref No, then reopen their plan.",
    searchRecords: "Search couples",
    saveRecord: "Save record",
    openRecord: "Open plan",
    recordsEmpty: "No saved records yet. Generate an agreement to add one.",
    recordsNoMatches: "No couples match this search.",
    recordSaved: "Couple record saved in SQLite.",
    recordUnavailable: "Records are unavailable. Start the app with python server.py.",
    recordOpened: "The couple’s plan is ready to edit.",
    catalogLabel: "SERVICE CATALOG",
    catalogCopy: "spiritual, creative & practical details ready to shape.",
    startNew: "New wedding",
    savedLocally: "Saved locally",
    detailsEyebrow: "MATRIMONY BY HANNA · WEDDING PLANNING",
    detailsTitle: "Plan the ceremony with clarity.",
    detailsDescription: "Start with the people, place, and promises. Every detail you add here flows into a ready-to-sign service agreement.",
    stampServices: "services",
    detailsNotice: "A calm plan starts with the essentials. You can return and refine this at any time.",
    coupleEyebrow: "THE COUPLE",
    coupleHeading: "Names & contact",
    brideName: "Bride’s name",
    groomName: "Groom’s name",
    bridePhone: "Bride’s phone",
    groomPhone: "Groom’s phone",
    brideAddress: "Bride’s address",
    groomAddress: "Groom’s address",
    eventEyebrow: "THE EVENT",
    eventHeading: "When & where",
    weddingDate: "Wedding date",
    mealProgram: "Meal program",
    mealProgramHint: "Select the meals included in the event.",
    mealBreakfast: "Breakfast",
    mealLunch: "Lunch",
    mealDinner: "Dinner",
    mealBreakfastHint: "Morning", mealLunchHint: "Midday", mealDinnerHint: "Evening",
    mealFullDay: "3 Course Full Day Program",
    mealProgramAgreement: "Meal Program",
    mealNotSet: "No meals selected",
    eventVenueTypesHeading: "Where will the wedding events take place?",
    eventVenueTypesHint: "Select every venue type you need, then choose its location on the map.",
    brideDetails: "Bride’s details", groomDetails: "Groom’s details", fullName: "Full name", phoneNumber: "Phone number", homeAddress: "Home address",
    eventScheduleHeading: "Date & meals", eventVenuesTitle: "Event venues", eventVenueSelectHint: "Select every venue type you need.", eventVenueMapHint: "Choose each venue location on the map.", mediaConsentTitle: "Photo & video consent",
    venueTypeChurch: "Church / religious venue",
    venueTypeHall: "Wedding or reception hall",
    venueTypeHotel: "Hotel / banquet venue",
    venueTypeOutdoor: "Garden / park / outdoor venue",
    venueTypeHome: "Home / private residence",
    venueTypeRestaurant: "Restaurant",
    venueTypeOther: "Other venue",
    eventVenues: "Event venues",
    financialEyebrow: "FINANCIAL COMMITMENT",
    notesEyebrow: "ANYTHING ELSE", notesHeading: "Planning notes",
    financialHeading: "Set the agreement amount",
    totalFee: "Total professional fee",
    deposit: "Non-refundable deposit",
    finalBalance: "Final balance",
    balanceHint: "Due on the wedding day",
    generalNotes: "Planning notes",
    requiredHint: "Date and couple names help us build the agreement.",
    continueServices: "Continue to services",
    continuePricing: "Continue to pricing",
    pricingEyebrow: "PRICING",
    pricingTitle: "What is the agreed fee?",
    pricingDescription: "Enter the one overall fee agreed with the couple. The agreement splits it into the 40% / 40% / 20% payment schedule.",
    servicesEyebrow: "THE AGREED SCOPE",
    servicesTitle: "Choose what belongs in the promise.",
    servicesDescription: "Choose the services for this wedding. Your selections carry into the planner, where you can arrange the details later.",
    continuePlanning: "Continue to planner",
    selectedOf: "of 20 selected",
    filterLabel: "Filter services",
    filterAll: "All service areas",
    filterPart1: "Part 1 · Spiritual teaching & documents", filterPart2: "Part 2 · Teaching & choir", filterPart3: "Part 3 · Hall & logistics",
    filterPart4: "Part 4 · Media, attire & beauty", filterPart5: "Part 5 · Printing, protocol & hosting",
    filterSpiritual: "Spiritual & church",
    filterVenue: "Venue & atmosphere",
    filterHospitality: "Hospitality",
    filterStyle: "Style & people",
    filterLogistics: "Logistics & readiness",
    back: "Back",
    reviewPlan: "Review the plan",
    reviewEyebrow: "A LAST LOOK",
    reviewTitle: "Does this feel like your plan?",
    reviewDescription: "Review the couple, event, financial commitment, and the exact services that will appear in the agreement.",
    reviewReady: "ready to sign",
    editServices: "Edit services",
    generateAgreement: "Generate agreement",
    agreementEyebrow: "THE DOCUMENT",
    agreementTitle: "Your service agreement.",
    agreementDescription: "A clear record of what Matrimony By Hanna and the couple have agreed to.",
    backToReview: "Back to review",
    printPdf: "Print / save PDF",
    people: "Couple",
    event: "Event",
    financial: "Financial commitment",
    agreedServices: "Agreed services",
    noServices: "No services selected yet.",
    notProvided: "Not provided",
    dateNotSet: "Date not set",
    notSet: "Not set",
    notes: "Notes",
    noNotes: "No additional notes",
    total: "Total fee",
    depositLabel: "Deposit",
    balanceLabel: "Final balance",
    serviceDetails: "Selected details",
    agreementDate: "Agreement date",
    weddingDateAgreement: "Wedding date",
    mealProgramAgreement: "Meal Program",
    eventVenuesAgreement: "Selected event venues",
    introAgreement: "This Agreement is made by and between Matrimony by Hanna (the “Service Provider”) and the Clients identified below for the wedding event scheduled for",
    introAgreementEnd: "The Clients retain Matrimony by Hanna to coordinate the services selected in this Agreement.",
    eventDetails: "Event Details",
    professionalServices: "Professional Services",
    professionalIntro: "Matrimony By Hanna agrees to provide comprehensive support to ensure the spiritual and logistical success of the union:",
    vision: "Vision Consultation: An initial session to discuss the wedding vision and spiritual requirements.",
    vendor: "Vendor Stewardship: Assistance with the selection and coordination of all vendors, including venue, catering, decor, photography, and mezmur.",
    preparation: "Comprehensive Preparation: Creation of a detailed timeline and checklist to ensure no detail is overlooked.",
    onsite: "On-Site Direction: Full on-site coordination on the wedding day to ensure a smooth, peaceful execution of the event.",
    logistics: "Logistics Management: Oversight of all setup, decor placement, and breakdown.",
    rehearsal: "The Rehearsal: A formal walkthrough 2–3 weeks prior to the wedding day, including mezmur and liturgy (kidase) rehearsal.",
    postCeremony: "Post-Ceremony Care: Distribution of wedding cake and assisting in the packing of personal items and gifts.",
    problem: "Problem Resolution: Final checks and prioritizing the resolution of any unexpected issues.",
    agreedIntro: "The parties agree that the following services and selections are included in this engagement:",
    financialCommitment: "Financial Commitment",
    financialIntro: "The total professional fee for these services is",
    depositIntro: "A retainer of",
    depositEnd: "ETB is due upon the signing of this contract to secure our services.",
    finalIntro: "The remaining balance of",
    finalEnd: "ETB is due on the day of the wedding.",
    policies: "Policies & Responsibilities",
    cancellation: "Cancellation: If the Client cancels more than 60 days before the date, the deposit is forfeited. If the cancellation occurs within 60 days of the wedding, the full fee is due.",
    cooperation: "Client Cooperation: The Client agrees to provide all necessary details and vendor contacts to allow the Planner to fulfill their duties effectively.",
    confidentiality: "Confidentiality: Both parties agree to keep all shared information and planning details private and confidential.",
    authorization: "Authorization & Signatures",
    authorizationIntro: "By signing below, the parties acknowledge they have read and agreed to the terms of this contract.",
    clientSignature: "Client Signature",
    plannerSignature: "Matrimony By Hanna",
    date: "Date",
    agreementFooter: "Spiritual coordination · wedding planning · peaceful execution",
    serviceCatalogTitle: "Service catalog",
    chosen: "chosen",
    serviceNotes: "Special instructions",
    serviceNotesPlaceholder: "Add a note for this service",
    draftReset: "Draft cleared. You can begin a new plan.",
    detailsRequired: "Add the couple’s names and wedding date before generating the agreement.",
    noServicesWarning: "Choose at least one agreed service before generating the agreement.",
    agreementGenerated: "Agreement updated. It is ready to print or save as PDF.",
    printHint: "In the print dialog, choose ‘Save as PDF’ for a downloadable agreement.",
    noMatches: "No services match this search.",
    reviewNotes: "Planning notes"
  },
  am: {
    brandCaption: "ሥነ-ስርዓት፣ በጥንቃቄ የታሰበ።",
    workspaceLabel: "የእቅድ ቦታ",
    navDetails: "ጥንዶቹ እና ዝግጅቱ",
    navServices: "አገልግሎቶች",
    navReview: "ግምገማ",
    navPricing: "ዋጋ",
    navAgreement: "ስምምነት",
    navProforma: "ፕሮፖዛል",
    eventDays: "የዝግጅቱ ቀናት ብዛት",
    servicePrice: "የተስማሙበት ዋጋ",
    priceAutoHint: "አንድ ጠቅላላ የተስማሙበትን ዋጋ ያስገቡ። ፕሮፖዛሉ አንድ ጠቅላላ ዋጋ ብቻ ያሳያል።",
    viewProforma: "ፕሮፖዛልን ይመልከቱ",
    proformaEyebrow: "የዋጋ ጥቅስ",
    proformaTitle: "የእርስዎ ፕሮፖዛል።",
    proformaDescription: "የተመረጡ አገልግሎቶች ማጠቃለያ እና አንድ ጠቅላላ የተስማሙበት ዋጋ።",
    backToAgreement: "ስምምነት",
    printProforma: "ፕሮፖዛል PDF አትም",
    proformaDocumentTitle: "ፕሮፖዛል",
    proformaPreparedFor: "የተዘጋጀላቸው",
    proformaScope: "የተመረጡ አገልግሎቶች",
    proformaService: "አገልግሎት እና የተስማሙበት ዝርዝር",
    proformaAmount: "ዋጋ (ETB)",
    proformaTotal: "ጠቅላላ የተስማሙበት ዋጋ",
    proformaDeposit: "የታቀደ ቅድመ ክፍያ",
    proformaBalance: "ከቅድመ ክፍያ በኋላ ቀሪ",
    proformaThanks: "ማትሪሞኒ በሀናን ስለመረጡ እናመሰግናለን። የደስታ ቀናችሁ አካል መሆን ለእኛ ክብር ነው፤ ሁሉንም ዝርዝር በጥንቃቄ እናስተባብራለን።",
    proformaNote: "የተመረጡ አገልግሎቶች ለማጣቀሻ ተዘርዝረዋል፤ ዋጋው በአንድ ጠቅላላ መጠን ቀርቧል። የክፍያ ውሎች በተፈረመው ስምምነት ይገለጻሉ።",
    proformaDetailsRequired: "ፕሮፖዛሉን ከመክፈትዎ በፊት የዝግጅቱን ቀናት እና ጠቅላላ የተስማሙበትን ዋጋ ያስገቡ።",
    navRecords: "መዝገቦች",
    navPlan: "ዕቅድ",
    recordsEyebrow: "ጥንዶቹ",
    recordsTitle: "የተቀመጡ መዝገቦች።",
    recordsDescription: "ጥንዶችን በስም፣ በስልክ፣ በቀን (ዓ.ም. ወይም ጎርጎርዮሳዊ)፣ በቦታ፣ በአገልግሎት፣ በክፍያ ወይም በመዝገብ ቁጥር ፈልገው እቅዳቸውን ይክፈቱ።",
    searchRecords: "ጥንዶችን ፈልግ",
    saveRecord: "መዝገብ አስቀምጥ",
    openRecord: "እቅድ ክፈት",
    recordsEmpty: "እስካሁን መዝገብ የለም። ስምምነት ፍጠሩ።",
    recordsNoMatches: "ከፍለጋው ጋር የሚዛመድ መዝገብ የለም።",
    recordSaved: "የጥንዶቹ መዝገብ በSQLite ተቀምጧል።",
    recordUnavailable: "መዝገቦቹ አይገኙም። python server.py በማስኬድ ይጀምሩ።",
    recordOpened: "የጥንዶቹ እቅድ ለማሻሻል ዝግጁ ነው።",
    catalogLabel: "የአገልግሎት ዝርዝር",
    catalogCopy: "መንፈሳዊ፣ የፈጠራ እና ተግባራዊ ዝርዝሮች።",
    startNew: "አዲስ ሰርግ",
    savedLocally: "በመሣሪያው ተቀምጧል",
    detailsEyebrow: "ማትሪሞኒ በሀና · የሰርግ እቅድ",
    detailsTitle: "ሥነ-ስርዓቱን በግልጽ ያቅዱ።",
    detailsDescription: "ከሰዎቹ፣ ከቦታው እና ከቃል ኪዳኑ ይጀምሩ። እዚህ የሚጨምሩት ዝርዝር ወደ ለመፈረም ዝግጁ ወደሆነ የአገልግሎት ስምምነት ይገባል።",
    stampServices: "አገልግሎት",
    detailsNotice: "ጥሩ እቅድ ከመሠረታዊ ነገሮች ይጀምራል። በማንኛውም ጊዜ ተመልሰው ማሻሻል ይችላሉ።",
    coupleEyebrow: "ጥንዶቹ",
    coupleHeading: "ስም እና አድራሻ",
    brideName: "የሙሽራ ስም",
    groomName: "የሙሽራው ስም",
    bridePhone: "የሙሽራ ስልክ",
    groomPhone: "የሙሽራው ስልክ",
    brideAddress: "የሙሽራ አድራሻ",
    groomAddress: "የሙሽራው አድራሻ",
    eventEyebrow: "ዝግጅቱ",
    eventHeading: "መቼ እና የት",
    weddingDate: "የሰርግ ቀን",
    mealProgram: "የምግብ ፕሮግራም",
    mealProgramHint: "ለዝግጅቱ የተካተቱ ምግቦችን ይምረጡ።",
    mealBreakfast: "ቁርስ",
    mealLunch: "ምሳ",
    mealDinner: "እራት",
    mealBreakfastHint: "ጠዋት", mealLunchHint: "ቀትር", mealDinnerHint: "ምሽት",
    mealFullDay: "የ3 ኮርስ ሙሉ ቀን ፕሮግራም",
    mealProgramAgreement: "የምግብ ፕሮግራም",
    mealNotSet: "ምግብ አልተመረጠም",
    eventVenueTypesHeading: "የሰርጉ ዝግጅቶች የት ይካሄዳሉ?",
    eventVenueTypesHint: "የሚያስፈልጉዎትን ቦታዎች ሁሉ ይምረጡ፤ ለእያንዳንዱም በካርታው ላይ ቦታ ያስቀምጡ።",
    brideDetails: "የሙሽራዋ መረጃ", groomDetails: "የሙሽራው መረጃ", fullName: "ሙሉ ስም", phoneNumber: "ስልክ ቁጥር", homeAddress: "የመኖሪያ አድራሻ",
    eventScheduleHeading: "ቀን እና ምግብ", eventVenuesTitle: "የዝግጅት ቦታዎች", eventVenueSelectHint: "የሚያስፈልጉዎትን የቦታ ዓይነቶች ሁሉ ይምረጡ።", eventVenueMapHint: "የእያንዳንዱን ቦታ አድራሻ በካርታው ላይ ይምረጡ።", mediaConsentTitle: "የፎቶ እና ቪዲዮ ፈቃድ",
    venueTypeChurch: "ቤተ-ክርስቲያን / ሃይማኖታዊ ቦታ",
    venueTypeHall: "የሰርግ ወይም የድግስ አዳራሽ",
    venueTypeHotel: "ሆቴል / የድግስ ቦታ",
    venueTypeOutdoor: "አትክልት ስፍራ / ፓርክ / ከቤት ውጭ",
    venueTypeHome: "ቤት / የግል መኖሪያ",
    venueTypeRestaurant: "ምግብ ቤት",
    venueTypeOther: "ሌላ ቦታ",
    eventVenues: "የዝግጅት ቦታዎች",
    financialEyebrow: "የገንዘብ ስምምነት",
    notesEyebrow: "ተጨማሪ መረጃ", notesHeading: "የዕቅድ ማስታወሻዎች",
    financialHeading: "የስምምነቱን መጠን ያስገቡ",
    totalFee: "ጠቅላላ የሙያ ክፍያ",
    deposit: "የማይመለስ ቅድመ ክፍያ",
    finalBalance: "ቀሪ ክፍያ",
    balanceHint: "በሰርጉ ቀን የሚከፈል",
    generalNotes: "የእቅድ ማስታወሻ",
    requiredHint: "የጥንዶቹ ስም እና ቀን ስምምነቱን ለመዘጋጀት ያግዛሉ።",
    continueServices: "ወደ አገልግሎቶች ይቀጥሉ",
    continuePricing: "ወደ ዋጋ ይቀጥሉ",
    pricingEyebrow: "ዋጋ",
    pricingTitle: "የተስማሙበት ክፍያ ስንት ነው?",
    pricingDescription: "ከጥንዶቹ ጋር የተስማሙበትን አንድ ጠቅላላ ክፍያ ያስገቡ። ስምምነቱ በ40% / 40% / 20% የክፍያ መርሃ ግብር ይከፍለዋል።",
    servicesEyebrow: "የተስማሙበት ወሰን",
    servicesTitle: "በቃል ኪዳኑ ውስጥ የሚገባውን ይምረጡ።",
    servicesDescription: "ለዚህ ሰርግ አገልግሎቶችን ይምረጡ። ምርጫዎችዎ ወደ ዕቅዱ ይተላለፋሉ፤ ዝርዝሮቹን በኋላ ያዘጋጃሉ።",
    continuePlanning: "ወደ ዕቅዱ ቀጥል",
    selectedOf: "ከ20 ተመርጠዋል",
    filterLabel: "አገልግሎቶችን ይለዩ",
    filterAll: "ሁሉም የአገልግሎት ዘርፎች",
    filterPart1: "ክፍል 1 · መንፈሳዊ ትምህርቶች እና ሰነዶች", filterPart2: "ክፍል 2 · ትምህርት እና ዝማሬ", filterPart3: "ክፍል 3 · አዳራሽ እና ሎጅስቲክስ",
    filterPart4: "ክፍል 4 · ሚዲያ፣ አልባሳት እና ውበት", filterPart5: "ክፍል 5 · ህትመት፣ ፕሮቶኮል እና አስተናጋጅ",
    filterSpiritual: "መንፈሳዊ እና ቤተ-ክርስቲያን",
    filterVenue: "ቦታ እና ድባብ",
    filterHospitality: "እንግዳ አቀባበል",
    filterStyle: "ውበት እና ሰዎች",
    filterLogistics: "ዝግጅት እና አስተዳደር",
    back: "ተመለስ",
    reviewPlan: "እቅዱን ይገምግሙ",
    reviewEyebrow: "የመጨረሻ እይታ",
    reviewTitle: "ይህ እቅድዎ ይመስላል?",
    reviewDescription: "ጥንዶቹን፣ ዝግጅቱን፣ የገንዘብ ስምምነቱን እና በስምምነቱ የሚገቡ አገልግሎቶችን ይመልከቱ።",
    reviewReady: "ለፊርማ ዝግጁ",
    editServices: "አገልግሎቶችን ያርሙ",
    generateAgreement: "ስምምነቱን ይፍጠሩ",
    agreementEyebrow: "ሰነዱ",
    agreementTitle: "የአገልግሎት ስምምነትዎ።",
    agreementDescription: "ማትሪሞኒ በሀና እና ጥንዶቹ የተስማሙበት ግልጽ መዝገብ።",
    backToReview: "ወደ ግምገማ ተመለስ",
    printPdf: "አትም / PDF አስቀምጥ",
    people: "ጥንዶቹ",
    event: "ዝግጅት",
    financial: "የገንዘብ ስምምነት",
    agreedServices: "የተስማሙባቸው አገልግሎቶች",
    noServices: "እስካሁን አገልግሎት አልተመረጠም።",
    notProvided: "አልተሰጠም",
    dateNotSet: "ቀን አልተወሰነም",
    notSet: "አልተወሰነም",
    notes: "ማስታወሻ",
    noNotes: "ተጨማሪ ማስታወሻ የለም",
    total: "ጠቅላላ ክፍያ",
    depositLabel: "ቅድመ ክፍያ",
    balanceLabel: "ቀሪ ክፍያ",
    serviceDetails: "የተመረጡ ዝርዝሮች",
    agreementDate: "የስምምነት ቀን",
    weddingDateAgreement: "የሰርግ ቀን",
    mealProgramAgreement: "የምግብ ፕሮግራም",
    eventVenuesAgreement: "የተመረጡ የዝግጅት ቦታዎች",
    introAgreement: "ይህ ውል በማትሪሞኒ ባይ ሃና (ከዚህ በኋላ “አገልግሎት ሰጪ” ተብሎ የሚጠራ) እና ከታች በመረጃቸው በተገለጹት ደንበኞች መካከል የተደረገ ስምምነት ነው። ዝግጅቱም በሚከተለው ቀን ይካሄዳል፦",
    introAgreementEnd: "ደንበኞቹ በዚህ ውል የተመረጡትን አገልግሎቶች ለማስተባበር ማትሪሞኒ ባይ ሃናን ቀጥረዋል።",
    eventDetails: "የዝግጅት ዝርዝር",
    professionalServices: "የሙያ አገልግሎቶች",
    professionalIntro: "ማትሪሞኒ በሀና የጋብቻውን መንፈሳዊ እና ተግባራዊ ስኬት ለማረጋገጥ አጠቃላይ ድጋፍ ለመስጠት ተስማምቷል፦",
    vision: "የራዕይ ምክክር፦ ስለ ሰርጉ ራዕይ እና መንፈሳዊ ፍላጎቶች የመጀመሪያ ውይይት።",
    vendor: "የአቅራቢዎች አስተዳደር፦ አዳራሽ፣ ምግብ፣ ዲኮር፣ ፎቶግራፍ እና መዝሙር አቅራቢዎችን መምረጥ እና ማስተባበር።",
    preparation: "አጠቃላይ ዝግጅት፦ ምንም ዝርዝር እንዳይረሳ የጊዜ ሰሌዳ እና checklist ማዘጋጀት።",
    onsite: "በቦታው ላይ አመራር፦ በሰርጉ ቀን ሙሉ አስተባባሪነት።",
    logistics: "የሎጂስቲክስ አስተዳደር፦ ቅንብር፣ ዲኮር አቀማመጥ እና ማስወገጃን መቆጣጠር።",
    rehearsal: "ልምምድ፦ ከሰርጉ 2–3 ሳምንት በፊት መዝሙር እና ቅዳሴ ልምምድን የሚያካትት የሙከራ ሂደት።",
    postCeremony: "ከሥነ-ስርዓቱ በኋላ እንክብካቤ፦ ኬክን ማከፋፈል እና የግል ዕቃዎችን ማሸግ።",
    problem: "የችግር መፍትሄ፦ የመጨረሻ ምርመራ እና ያልተጠበቁ ጉዳዮችን በቅድሚያ መፍታት።",
    agreedIntro: "ወገኖቹ የሚከተሉት አገልግሎቶች እና ምርጫዎች በዚህ ስምምነት እንደሚካተቱ ተስማምተዋል፦",
    financialCommitment: "የገንዘብ ስምምነት",
    financialIntro: "የእነዚህ አገልግሎቶች ጠቅላላ የሙያ ክፍያ",
    depositIntro: "በስምምነቱ ፊርማ ጊዜ",
    depositEnd: "ETB የማይመለስ ቅድመ ክፍያ ሆኖ ይከፈላል።",
    finalIntro: "ቀሪው",
    finalEnd: "ETB በሰርጉ ቀን ይከፈላል።",
    policies: "ፖሊሲዎች እና ኃላፊነቶች",
    cancellation: "ስረዛ፦ ደንበኛው ከቀኑ ከ60 ቀናት በፊት ካሰረዘ ቅድመ ክፍያው አይመለስም። በ60 ቀናት ውስጥ ከሆነ ሙሉ ክፍያው ይከፈላል።",
    cooperation: "የደንበኛ ትብብር፦ ዕቅድ አውጪው ሥራውን በትክክል እንዲፈጽም የሚያስፈልጉ ዝርዝሮችን እና የአቅራቢዎች አድራሻዎችን መስጠት።",
    confidentiality: "ሚስጥራዊነት፦ ሁለቱም ወገኖች የተጋሩ መረጃዎችን እና የእቅድ ዝርዝሮችን በሚስጥር ለመጠበቅ ተስማምተዋል።",
    authorization: "ፈቃድ እና ፊርማ",
    authorizationIntro: "ከዚህ በታች በመፈረም ወገኖቹ የዚህን ውል ውሎች አንብበው እንደተስማሙ ያረጋግጣሉ።",
    clientSignature: "የደንበኛ ፊርማ",
    plannerSignature: "ማትሪሞኒ በሀና",
    date: "ቀን",
    agreementFooter: "መንፈሳዊ አስተባባሪነት · የሰርግ እቅድ · ሰላማዊ አፈጻጸም",
    serviceCatalogTitle: "የአገልግሎት ዝርዝር",
    chosen: "ተመርጧል",
    serviceNotes: "ልዩ መመሪያ",
    serviceNotesPlaceholder: "ለዚህ አገልግሎት ማስታወሻ ያክሉ",
    draftReset: "ረቂቁ ተጠርጓል። አዲስ እቅድ መጀመር ይችላሉ።",
    detailsRequired: "ስምምነቱን ለመፍጠር የጥንዶቹን ስም እና የሰርግ ቀን ያስገቡ።",
    noServicesWarning: "ስምምነቱን ከመፍጠርዎ በፊት ቢያንስ አንድ አገልግሎት ይምረጡ።",
    agreementGenerated: "ስምምነቱ ተዘምኗል። ለማተም ወይም PDF ለማስቀመጥ ዝግጁ ነው።",
    printHint: "በማተሚያው መስኮት ‘Save as PDF’ ን ይምረጡ።",
    noMatches: "ከዚህ ፍለጋ ጋር የሚስማማ አገልግሎት የለም።",
    reviewNotes: "የእቅድ ማስታወሻ"
  }
};

// New workflow copy stays paired so every control has an English and Amharic label.
Object.assign(copy.en, {
  currentCouple: "CURRENT COUPLE", nextCelebration: "Your next celebration", newPlan: "New plan",
  recentCouples: "RECENT COUPLES", weddingsHeading: "Weddings", viewAll: "View all", recentEmpty: "Saved couples will appear here.", noWeddingsFound: "No weddings match search.", recentWeddings: "Recent weddings", searchResults: "Results",
  recordDirty: "Unsaved changes", recordSaving: "Saving record…", recordReady: "Saved record",
  localOnly: "Local draft only", localSaveFailed: "Draft could not be saved on this browser.",
  downloadAgreement: "Download agreement PDF", downloadProforma: "Download proposal PDF",
  searchKind_phone: "Phone", searchKind_ref: "Reference", searchKind_fee: "Fee", searchKind_place: "Place", searchKind_venue: "Venue",
  searchKind_service: "Service", searchKind_meal: "Meals", searchKind_notes: "Notes",
  portalWorkspace: "Your wedding details", portalNotice: "Tell us about your celebration. Your details go straight to Hanna’s team; the price is agreed together later.",
  portalDetailsEyebrow: "MATRIMONY BY HANNA", portalDetailsTitle: "Tell us about your wedding.", portalDetailsDescription: "It only takes a few minutes. Hanna’s team uses these details to prepare your plan.",
  portalServicesEyebrow: "YOUR SERVICES", portalServicesTitle: "Which services would you like?", portalServicesDescription: "Tap every service you’re interested in. We’ll go through the details together.",
  portalSubmit: "Send to Matrimony By Hanna", portalSending: "Sending…", portalPhoneRequired: "Enter at least one phone number so we can reach you.",
  portalFailed: "We couldn’t send your details. Check your connection and try again.", portalSent: "Sent",
  portalDoneTitle: "Thank you, we have your details.", portalDoneText: "Hanna’s team will call you to talk through the plan and the price. Keep this reference:", portalSendAnother: "Send another",
  portalRequestsEyebrow: "FROM THE CLIENT PORTAL", portalRequestsTitle: "Client requests", portalRequestsHint: "Couples fill in their own details at the portal link. Open a request to continue it as a plan and add the price.",
  portalCopyLink: "Copy portal link", portalShareLink: "Share link", portalLinkCopied: "Portal link copied. Send it to the couple.", portalRequestsEmpty: "No client requests yet. Share the portal link with couples to receive their details here.",
  portalOpenAsPlan: "Open as plan", portalOpenPlan: "Open plan", portalDismiss: "Dismiss", portalNew: "New", portalImportedBadge: "Added to records",
  portalImported: "Request opened as a plan. Add the price in Pricing.", portalServicesCount: "services", portalSubmittedAt: "Sent",
  blankForms: "Blank forms", blankAgreement: "Blank agreement", blankProposal: "Blank proposal", blankChooseLanguage: "Choose the language for the blank document.",
  blankDownloadAgreement: "Download blank agreement", blankDownloadProposal: "Download blank proposal", blankCancel: "Cancel",
  blankSavedTitle: "Downloaded", blankShareButton: "Share PDF", blankSavedText: "The blank {doc} is in your downloads. Share it now:",
  blankSavedAttach: "The blank {doc} is in your downloads. Open a chat below and attach the PDF.", blankAgreementName: "agreement", blankProposalName: "proposal",
  blankShareText: "Blank wedding {doc} from Matrimony By Hanna.",
  teamTitle: "Team", teamHint: "Only the people listed here can sign in and see couples’ details.", teamInviteLabel: "Invite someone",
  teamRolePlanner: "Planner", teamRoleAdmin: "Admin", teamRoleOwner: "Owner", teamCreateInvite: "Create invite link", teamYou: "You",
  teamReset: "Reset link", teamRemove: "Remove", teamRemoveConfirm: "Remove {name}? They will be signed out and can no longer see couples’ details.",
  teamInviteReady: "Send this invite to the new {role}. It works once, for 7 days.", teamResetReady: "Send this reset link to {name}. It works once, for 24 hours.",
  teamInviteMessage: "You’re invited to Matrimony By Hanna’s planning workspace. Create your account here:", teamResetMessage: "Use this link to set a new password for Matrimony By Hanna:",
  teamPending: "{count} unused invite link(s).", teamRevokeAll: "Cancel unused invites", teamLoadFailed: "The team list couldn’t be loaded.",
  teamLastActive: "Active", linkCopied: "Link copied.", teamNeverActive: "Not signed in yet", signOut: "Sign out", signedOutLocal: "Signed out. Local drafts were cleared from this device.",
  createLink: "Create client link", createLinkTitle: "Send the client portal",
  createLinkHint: "Give your couple one simple place to share their details.",
  linkClientName: "Couple’s name", linkClientPhone: "Phone number", linkLanguage: "Portal language", linkOptional: "Optional",
  linkCopy: "Copy", linkSendWith: "Send with", linkDone: "Done", linkMore: "More", linkEmail: "Email",
  linkEyebrow: "Client portal", linkPhoneHint: "For WhatsApp or SMS", linkLanguageHint: "Language shown to your couple", linkPortalLink: "Portal link",
  linkCopyLink: "Copy link", linkCopyHint: "Copy the link or choose how you’d like to share it.", linkShareVia: "Share via",
  linkSubmissionsNote: "Submissions appear in Client requests.", linkMessageCopied: "Message and link copied. Paste them into any app.",
  linkLocalWarning: "This address only opens on this computer. Send links from the published app so couples can open them.",
  linkMessageNamed: "Hello {name}, congratulations on your wedding! 💍 Please fill in your wedding details for Matrimony By Hanna here:",
  linkMessage: "Hello, congratulations on your wedding! 💍 Please fill in your wedding details for Matrimony By Hanna here:", linkSubject: "Your wedding details – Matrimony By Hanna",
  shareProforma: "Share proposal", shareReady: "Tap to share", shareTapAgain: "Your proposal PDF is ready. Tap Share again to send it.",
  shareFallback: "This browser can’t share files directly, so the PDF was downloaded. Attach it in WhatsApp, Telegram, Instagram or email.",
  shareText: "Your wedding proposal from Matrimony By Hanna.", shareHint: "Send the PDF straight to the couple on WhatsApp, Telegram, Instagram or email.",
  generateProposal: "Generate proposal", continueAgreement: "Continue to agreement", backToProposal: "Proposal", editPricing: "Edit pricing",
  printDocument: "Print", pdfPreparing: "Preparing your PDF…", pdfReady: "PDF downloaded with your letterhead.",
  pdfFailed: "PDF export failed. Please retry or use Print to save a PDF.",
  fixFields: "Please complete the highlighted fields.", nameRequired: "Enter a name.",
  dateRequired: "Choose a valid wedding date.", daysRequired: "Enter a whole number from 1 to 365.",
  totalFeeRequired: "Enter the agreed overall fee.",
  priceRequired: "Enter this service’s price in ETB (0 is allowed).", depositInvalid: "Deposit cannot exceed the total fee.",
  amountInvalid: "Enter a valid amount of 0 or more.", missingPriceHint: "Each selected service needs a price for the proposal.",
  generating: "Preparing the document…", documentFailed: "Could not prepare the document. Please try again.",
  documentTooLong: "One item is too long to fit safely on the letterhead. Shorten the longest service instructions or planning notes, then try again.",
  contractScopeEyebrow: "AGREEMENT SCOPE", contractScopeHeading: "Choose the planning engagement",
  contractScopeHint: "Premarital education is included when selected in the service list below.",
  scopeFullPlanning: "Full wedding planning & coordination", scopeDayOf: "Day-of coordination",
  mediaConsentHeading: "Media and photo consent",
  mediaConsentYes: "We consent to promotional use of wedding photos and videos.",
  mediaConsentNo: "Do not post images showing our faces.",
  agreementDocumentTitle: "Wedding & Marriage Education Service Agreement",
  agreementIntro: "This Agreement is entered into between Matrimony (hereafter the Service Provider / Contract Provider) and the Clients whose names and information appear below (hereafter the Contract Recipients / Clients).",
  agreementParties: "Parties & Contact Information", providerDetails: "Service Provider",
  providerOffice: "Office: Yeshi Building, in front of Bole Printing, 2nd Floor, Office No. 11",
  providerPhone: "Phone: +251 95 391 4487", providerEmail: "Email: Hanna@matrimonybyhanna.com",
  providerBank: "Bank details", bankName: "Bank", bankAccountNo: "Account No.", bankAccountHolder: "Account name",
  providerTelebirr: "Telebirr (contact)", clientDetails: "Clients / Couple",
  contractGroomName: "Groom’s full name", contractBrideName: "Bride’s full name",
  contractScopeTitle: "Services & Responsibilities", scopePremarital: "Premarital Course",
  partLabel: "Part", statusLabel: "Status", statusPlanning: "Full Planning", statusClient: "Client Booked",
  statusPlanningHint: "Matrimony plans and books it", statusClientHint: "The couple has booked it; we coordinate",
  whoArranges: "Who arranges it?", serviceDetails: "Details", serviceNotesLabel: "Notes for this service", serviceNotesPlaceholder: "Anything else we should know",
  bonusTitle: "Free bonus services (included)", bonusIncluded: "Included", servicesChecklistTitle: "Orthodox wedding service & responsibility checklist",
  noServicesChosen: "No services chosen yet.",
  otherAddons: "Other agreed add-ons", noAddons: "No other add-ons selected.",
  termsHeading: "Terms, Conditions & Service Delivery", vendorHeading: "Service Delivery & Vendor Coordination",
  providerResponsibilityHeading: "Service Provider Responsibilities", clientResponsibilityHeading: "Client Responsibilities",
  vendorScope: "Matrimony does not supply wedding services such as decor, photography, catering or similar vendor services directly using its own equipment. Instead, the Service Provider coordinates suitable new and established vendors of appropriate quality, helps negotiate prices and arrange bookings, and follows up until their agreed work is complete. For items supplied directly by the Clients, Matrimony provides coordination only and does not take responsibility for their quality.",
  providerResponsibility: "The Service Provider will deliver the selected services to appropriate quality standards and with professional ethics, and will protect the Clients’ information and confidential matters with the utmost care.",
  clientResponsibility: "The Clients will respond to requests for information needed for the work on time, complete agreed tasks promptly, and comply with the payment schedule.",
  paymentTerms: "Payment Terms & Bank Details", advancePayment: "40% advance payment", advanceDue: "Upon signing and commencement",
  midtermPayment: "40% mid-term payment", midtermDue: "At the midpoint of the work",
  finalPayment: "20% final payment", finalDue: "Within 24 hours after completion",
  advanceTerms: "A non-refundable 40% advance is due when this Agreement is signed and work begins.",
  midtermTerms: "A further 40% is due at the midpoint of the planning or service work.",
  finalTerms: "The remaining 20% is due within 24 hours after the agreed work is completed.",
  bankOnly: "Payments must be made only to the Service Provider’s official bank accounts listed in Section 1.",
  changesHeading: "Cancellation & Changes", scopeChanges: "If services are added or removed, the fee will be adjusted by mutual agreement.",
  forceMajeure: "If unforeseen natural disasters or national circumstances arise, the matter will be resolved through discussion and consultation with the Clients.",
  cancellationTerms: "If the Clients cannot proceed with the wedding, the matter will be discussed and adjusted by mutual agreement. Advance payments and expenses already incurred are non-refundable.",
  mediaTermsHeading: "Media & Photo Consent",
  selectedOption: "Selected", unselectedOption: "Not selected",
  mediaTermsYes: "We consent: wedding-day photos and videos may be used for Matrimony by Hanna’s promotional social-media content.",
  mediaTermsNo: "We do not consent: content showing the couple’s faces must not be posted. Matrimony by Hanna may post photos of its own work, wedding items and the surroundings only.",
  amendmentsHeading: "Amendments & Erasures",
  amendmentsTerms: "Any erasure or handwritten change without the signatures of both parties is invalid. Amendments take effect only when both parties agree to them.",
  signatureHeading: "Signatures",
  signatureIntro: "We have understood this Agreement and accept its terms voluntarily and of our own free will.",
  clientGroomSignature: "Groom’s name and signature", clientBrideSignature: "Bride’s name and signature",
  providerSignature: "Contract Provider · Matrimony by Hanna",
  clientSignatures: "Contract Recipients · Clients / Couple", signatureLabel: "Signature"
});
Object.assign(copy.am, {
  currentCouple: "የአሁኑ ጥንዶች", nextCelebration: "ቀጣዩ ዝግጅት", newPlan: "አዲስ እቅድ",
  recentCouples: "የቅርብ ጥንዶች", weddingsHeading: "ሰርጎች", viewAll: "ሁሉንም አሳይ", recentEmpty: "የተቀመጡ ጥንዶች እዚህ ይታያሉ።", noWeddingsFound: "ምንም የሚዛመድ ሰርግ የለም።", recentWeddings: "የቅርብ ጊዜ ሰርጎች", searchResults: "ውጤቶች",
  recordDirty: "ያልተቀመጡ ለውጦች", recordSaving: "መዝገቡን በማስቀመጥ ላይ…", recordReady: "የተቀመጠ መዝገብ",
  localOnly: "በአሳሹ ላይ ብቻ የተቀመጠ ረቂቅ", localSaveFailed: "ረቂቁን በዚህ አሳሽ ማስቀመጥ አልተቻለም።",
  downloadAgreement: "የስምምነት PDF አውርድ", downloadProforma: "የፕሮፖዛል PDF አውርድ",
  searchKind_phone: "ስልክ", searchKind_ref: "መዝገብ ቁጥር", searchKind_fee: "ክፍያ", searchKind_place: "ቦታ", searchKind_venue: "የዝግጅት ቦታ",
  searchKind_service: "አገልግሎት", searchKind_meal: "ምግብ", searchKind_notes: "ማስታወሻ",
  portalWorkspace: "የሰርግዎ ዝርዝሮች", portalNotice: "ስለ ዝግጅታችሁ ይንገሩን። መረጃዎ በቀጥታ ወደ ሀና ቡድን ይደርሳል፤ ዋጋው በኋላ በጋራ ይወሰናል።",
  portalDetailsEyebrow: "ማትሪሞኒ ባይ ሃና", portalDetailsTitle: "ስለ ሰርግዎ ይንገሩን።", portalDetailsDescription: "ጥቂት ደቂቃዎች ብቻ ይወስዳል። የሀና ቡድን በእነዚህ ዝርዝሮች ዕቅድዎን ያዘጋጃል።",
  portalServicesEyebrow: "የእርስዎ አገልግሎቶች", portalServicesTitle: "የትኞቹን አገልግሎቶች ይፈልጋሉ?", portalServicesDescription: "የሚፈልጓቸውን አገልግሎቶች ሁሉ ይንኩ። ዝርዝሩን አብረን እንወያያለን።",
  portalSubmit: "ወደ ማትሪሞኒ ባይ ሃና ላክ", portalSending: "በመላክ ላይ…", portalPhoneRequired: "እንድናገኝዎ ቢያንስ አንድ ስልክ ቁጥር ያስገቡ።",
  portalFailed: "መረጃዎን መላክ አልተቻለም። ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።", portalSent: "ተልኳል",
  portalDoneTitle: "እናመሰግናለን፣ መረጃዎ ደርሶናል።", portalDoneText: "የሀና ቡድን ስለ ዕቅዱ እና ዋጋው ለመነጋገር ይደውልልዎታል። ይህን መለያ ቁጥር ያስቀምጡ፦", portalSendAnother: "ሌላ ላክ",
  portalRequestsEyebrow: "ከደንበኞች መግቢያ", portalRequestsTitle: "የደንበኛ ጥያቄዎች", portalRequestsHint: "ጥንዶች በመግቢያው ሊንክ የራሳቸውን መረጃ ይሞላሉ። ጥያቄውን እንደ ዕቅድ ከፍተው ዋጋውን ያክሉ።",
  portalCopyLink: "የመግቢያ ሊንክ ቅዳ", portalShareLink: "ሊንኩን አጋራ", portalLinkCopied: "የመግቢያ ሊንኩ ተቀድቷል። ለጥንዶቹ ይላኩት።", portalRequestsEmpty: "እስካሁን የደንበኛ ጥያቄ የለም። ጥንዶች መረጃቸውን እዚህ እንዲልኩ የመግቢያ ሊንኩን ያጋሩ።",
  portalOpenAsPlan: "እንደ ዕቅድ ክፈት", portalOpenPlan: "ዕቅዱን ክፈት", portalDismiss: "አስወግድ", portalNew: "አዲስ", portalImportedBadge: "ወደ መዝገብ ተጨምሯል",
  portalImported: "ጥያቄው እንደ ዕቅድ ተከፍቷል። ዋጋውን በዋጋ ደረጃ ያክሉ።", portalServicesCount: "አገልግሎቶች", portalSubmittedAt: "የተላከው",
  blankForms: "ባዶ ቅጾች", blankAgreement: "ባዶ ስምምነት", blankProposal: "ባዶ ፕሮፖዛል", blankChooseLanguage: "ለባዶው ሰነድ ቋንቋ ይምረጡ።",
  blankDownloadAgreement: "ባዶ ስምምነት አውርድ", blankDownloadProposal: "ባዶ ፕሮፖዛል አውርድ", blankCancel: "ሰርዝ",
  blankSavedTitle: "ወርዷል", blankShareButton: "PDFውን አጋራ", blankSavedText: "ባዶው {doc} በውርዶችዎ ውስጥ ነው። አሁን ያጋሩት፦",
  blankSavedAttach: "ባዶው {doc} በውርዶችዎ ውስጥ ነው። ከታች ውይይት ከፍተው PDFውን ያያይዙ።", blankAgreementName: "ስምምነት", blankProposalName: "ፕሮፖዛል",
  blankShareText: "ከማትሪሞኒ ባይ ሃና ባዶ የሰርግ {doc}።",
  teamTitle: "ቡድን", teamHint: "መግባትና የጥንዶችን መረጃ ማየት የሚችሉት እዚህ የተዘረዘሩት ብቻ ናቸው።", teamInviteLabel: "ሰው ይጋብዙ",
  teamRolePlanner: "እቅድ አውጪ", teamRoleAdmin: "አስተዳዳሪ", teamRoleOwner: "ባለቤት", teamCreateInvite: "የግብዣ ሊንክ ፍጠር", teamYou: "እርስዎ",
  teamReset: "የማደሻ ሊንክ", teamRemove: "አስወግድ", teamRemoveConfirm: "{name}ን ያስወግዱ? ይወጣሉ፤ የጥንዶችን መረጃ ከዚህ በኋላ ማየት አይችሉም።",
  teamInviteReady: "ይህን ግብዣ ለአዲሱ {role} ይላኩ። አንድ ጊዜ፣ ለ7 ቀናት ይሰራል።", teamResetReady: "ይህን የማደሻ ሊንክ ለ{name} ይላኩ። አንድ ጊዜ፣ ለ24 ሰዓት ይሰራል።",
  teamInviteMessage: "ወደ ማትሪሞኒ ባይ ሃና የዝግጅት መስሪያ ተጋብዘዋል። መለያዎን እዚህ ይፍጠሩ፦", teamResetMessage: "ለማትሪሞኒ ባይ ሃና አዲስ የይለፍ ቃል ለማዘጋጀት ይህን ሊንክ ይጠቀሙ፦",
  teamPending: "{count} ያልተጠቀሙ የግብዣ ሊንኮች።", teamRevokeAll: "ያልተጠቀሙ ግብዣዎችን ሰርዝ", teamLoadFailed: "የቡድኑ ዝርዝር ሊጫን አልቻለም።",
  teamLastActive: "ንቁ", linkCopied: "ሊንኩ ተቀድቷል።", teamNeverActive: "እስካሁን አልገቡም", signOut: "ውጣ", signedOutLocal: "ወጥተዋል። የአካባቢ ረቂቆች ከዚህ መሳሪያ ተሰርዘዋል።",
  createLink: "የደንበኛ ሊንክ ፍጠር", createLinkTitle: "የደንበኛ መግቢያ ይላኩ",
  createLinkHint: "ለጥንዶችዎ መረጃቸውን የሚያጋሩበት አንድ ቀላል ቦታ ይስጡ።",
  linkClientName: "የጥንዶቹ ስም", linkClientPhone: "ስልክ ቁጥር", linkLanguage: "የመግቢያው ቋንቋ", linkOptional: "አማራጭ",
  linkCopy: "ቅዳ", linkSendWith: "በዚህ ይላኩ", linkDone: "ጨርስ", linkMore: "ሌሎች", linkEmail: "ኢሜይል",
  linkEyebrow: "የደንበኛ መግቢያ", linkPhoneHint: "ለWhatsApp ወይም SMS", linkLanguageHint: "ለጥንዶቹ የሚታየው ቋንቋ", linkPortalLink: "የመግቢያ ሊንክ",
  linkCopyLink: "ሊንኩን ቅዳ", linkCopyHint: "ሊንኩን ይቅዱ ወይም እንዴት እንደሚያጋሩ ይምረጡ።", linkShareVia: "በዚህ ያጋሩ",
  linkSubmissionsNote: "የተላኩት በደንበኛ ጥያቄዎች ውስጥ ይታያሉ።", linkMessageCopied: "መልዕክቱና ሊንኩ ተቀድተዋል። በማንኛውም መተግበሪያ ይለጥፉ።",
  linkLocalWarning: "ይህ አድራሻ የሚከፈተው በዚህ ኮምፒውተር ብቻ ነው። ጥንዶች እንዲከፍቱት ከታተመው መተግበሪያ ሊንክ ይላኩ።",
  linkMessageNamed: "ሰላም {name}፣ እንኳን ለሰርጋችሁ አደረሳችሁ! 💍 የሰርጋችሁን ዝርዝር ለማትሪሞኒ ባይ ሃና እዚህ ይሙሉ፦",
  linkMessage: "ሰላም፣ እንኳን ለሰርጋችሁ አደረሳችሁ! 💍 የሰርጋችሁን ዝርዝር ለማትሪሞኒ ባይ ሃና እዚህ ይሙሉ፦", linkSubject: "የሰርግ ዝርዝራችሁ – ማትሪሞኒ ባይ ሃና",
  shareProforma: "ፕሮፖዛሉን አጋራ", shareReady: "ለማጋራት ይንኩ", shareTapAgain: "የፕሮፖዛሉ PDF ዝግጁ ነው። ለመላክ አጋራን እንደገና ይንኩ።",
  shareFallback: "ይህ አሳሽ ፋይሎችን በቀጥታ ማጋራት ስለማይችል PDF ወርዷል። በWhatsApp፣ Telegram፣ Instagram ወይም ኢሜይል ያያይዙት።",
  shareText: "ከማትሪሞኒ ባይ ሃና የቀረበ የሰርግ ፕሮፖዛል።", shareHint: "PDFውን በቀጥታ ለጥንዶቹ በWhatsApp፣ Telegram፣ Instagram ወይም ኢሜይል ይላኩ።",
  generateProposal: "ፕሮፖዛሉን ይፍጠሩ", continueAgreement: "ወደ ስምምነት ይቀጥሉ", backToProposal: "ፕሮፖዛል", editPricing: "ዋጋውን ያርሙ",
  printDocument: "አትም", pdfPreparing: "PDF በማዘጋጀት ላይ…", pdfReady: "PDF ከደብዳቤ ራስጌው ጋር ወርዷል።",
  pdfFailed: "PDF ማውረድ አልተቻለም። እንደገና ይሞክሩ ወይም በማተም PDF ያስቀምጡ።",
  fixFields: "እባክዎ የተጠቆሙትን መስኮች ይሙሉ።", nameRequired: "ስም ያስገቡ።",
  dateRequired: "ትክክለኛ የሰርግ ቀን ይምረጡ።", daysRequired: "ከ1 እስከ365 ሙሉ ቁጥር ያስገቡ።",
  priceRequired: "የዚህን አገልግሎት ዋጋ በብር ያስገቡ (0 ይፈቀዳል)።", depositInvalid: "ቅድመ ክፍያው ከጠቅላላ ዋጋው መብለጥ የለበትም።",
  amountInvalid: "0 ወይም ከዚያ በላይ ትክክለኛ ዋጋ ያስገቡ።", missingPriceHint: "ለፕሮፖዛሉ ሁሉም የተመረጡ አገልግሎቶች ዋጋ ያስፈልጋቸዋል።",
  generating: "ሰነዱን በማዘጋጀት ላይ…", documentFailed: "ሰነዱን ማዘጋጀት አልተቻለም። እንደገና ይሞክሩ።",
  documentTooLong: "አንድ ዝርዝር በደብዳቤ ራስጌው ገጽ ላይ ለመግጠም በጣም ረጅም ነው። ረጅም የአገልግሎት መመሪያዎችን ወይም ማስታወሻዎችን ያሳጥሩ።",
  totalFeeRequired: "የተስማሙበትን ጠቅላላ ዋጋ ያስገቡ።",
  contractScopeEyebrow: "የውሉ ወሰን", contractScopeHeading: "የእቅድ አገልግሎቱን ይምረጡ",
  contractScopeHint: "ቅድመ-ጋብቻ ትምህርት ከታች ባለው የአገልግሎት ዝርዝር ሲመረጥ በውሉ ይካተታል።",
  scopeFullPlanning: "ሙሉ የሰርግ ፕላኒንግ እና ማስተባበሪያ", scopeDayOf: "የሰርግ ቀን ብቻ ማስተባበሪያ",
  mediaConsentHeading: "የሚዲያ እና ፎቶ አጠቃቀም ፈቃድ",
  mediaConsentYes: "የሰርግ ፎቶዎችና ቪዲዮዎች ለማስተዋወቂያ እንዲውሉ ፈቃደኛ ነን።",
  mediaConsentNo: "ፊታችንን የሚያሳይ ምስል እንዳይለጠፍ አንፈቅድም።",
  agreementDocumentTitle: "የሰርግ እና የጋብቻ ትምህርት አገልግሎት ውል",
  agreementIntro: "ይህ ውል በማትሪሞኒ (ከዚህ በኋላ \"አገልግሎት ሰጪ/ውል ሰጪ\" እየተባለ የሚጠራ) እና ከዚህ በታች ስማቸው እና መረጃቸው በተገለጸው ደንበኞች (ከዚህ በኋላ \"ውል ተቀባይ/ደንበኛ\" እየተባለ የሚጠራ) መካከል የተደረገ ስምምነት ነው።",
  agreementParties: "የውሉ አካላት እና አድራሻ", providerDetails: "አገልግሎት ሰጪ",
  providerOffice: "የቢሮ አድራሻ፦ የየሺ ህንፃ፣ ከቦሌ ማተሚያ ፊት ለፊት፣ 2ኛ ፎቅ፣ ቢሮ ቁጥር 11",
  providerPhone: "ስልክ፦ +251 95 391 4487", providerEmail: "ኢሜይል፦ Hanna@matrimonybyhanna.com",
  providerBank: "የባንክ መረጃ", bankName: "ባንክ", bankAccountNo: "የሂሳብ ቁጥር", bankAccountHolder: "የሂሳቡ ስም",
  providerTelebirr: "Telebirr (ለመገናኛ)", clientDetails: "የደንበኛ (ሙሽሮቹ) መረጃ",
  contractGroomName: "የሙሽራው ሙሉ ስም", contractBrideName: "የሙሽሪት ሙሉ ስም",
  contractScopeTitle: "የአገልግሎትና የኃላፊነት ዝርዝር", scopePremarital: "ቅድመ-ጋብቻ ትምህርት",
  partLabel: "ክፍል", statusLabel: "Status", statusPlanning: "Full Planning", statusClient: "Client Booked",
  statusPlanningHint: "ማትሪሞኒ ያቅዳል እና ያስይዛል", statusClientHint: "ደንበኛው አስይዟል፤ እኛ እናስተባብራለን",
  whoArranges: "ማን ያዘጋጀዋል?", serviceDetails: "ዝርዝር", serviceNotesLabel: "ለዚህ አገልግሎት ማስታወሻ", serviceNotesPlaceholder: "ማወቅ ያለብን ሌላ ነገር",
  bonusTitle: "በነፃ የሚካተቱ ተጨማሪ ቦነሶች (Bonus Services)", bonusIncluded: "ተካቷል", servicesChecklistTitle: "የኦርቶዶክስ ሰርግ የአገልግሎትና የኃላፊነት መምረጫ ዝርዝር",
  noServicesChosen: "እስካሁን አገልግሎት አልተመረጠም።",
  otherAddons: "ሌሎች የተስማሙባቸው ተጨማሪ ሥራዎች", noAddons: "ሌላ ተጨማሪ አገልግሎት አልተመረጠም።",
  termsHeading: "የውል አንቀጾች እና የሥራ ሂደት", vendorHeading: "የአገልግሎት አሰጣጥ እና የቬንደሮች አስተባባሪነት",
  providerResponsibilityHeading: "የአገልግሎት ሰጪ (ማትሪሞኒ) ግዴታዎች", clientResponsibilityHeading: "የደንበኛ (ሙሽሮቹ) ግዴታዎች",
  vendorScope: "ማትሪሞኒ ከላይ የተዘረዘሩትን የትኛውንም አይነት የሰርግ አገልግሎቶች (እንደ ዲኮር፣ ፎቶግራፍ፣ ምግብ እና መሰል ቬንደሮችን) በቀጥታ በራሱ እቃዎች የሚያቀርብ ድርጅት አይደለም። ይልቅስ ለዚህ ስራ የሚመጥኑ፣ ጥራታቸውን የጠበቁ አዲስ እና ነባር ቬንደሮችን በማስተባበር፣ ዋጋ እንዲያስተካክሉ በማድረግ፣ ቡክ እንዲያደርጉና ስራቸውን ሰርተው እስኪጨርሱ ድረስ የመከታተል ሃላፊነት አለበት። በሙሽሮቹ በኩል በቀጥታ የሚቀርቡ ነገሮች ካሉ ድርጅቱ የማስተባበር ስራ ብቻ ይሰራል እንጂ ለጥራታቸው ሃላፊነት አይወስድም።",
  providerResponsibility: "የተመረጡትን ሰርቪሶች በተገቢው ጥራት፣ በባለሙያ ስነ-ምግባር ማቅረብ እና ከደንበኞች የሚሰጡ መረጃዎችን እና ሚስጥሮችን በከፍተኛ ጥንቃቄ መጠበቅ።",
  clientResponsibility: "ለስራው ሂደት አስፈላጊ የሆኑ መረጃዎችን በተጠየቁበት ሰዓት ላይ መመለስ፣ ክንዋኔዎችን በጊዜ መፈጸም እና የክፍያ መርሃ ግብሮችን ማክበር።",
  paymentTerms: "የክፍያ ሁኔታዎች እና የባንክ ሂሳብ", advancePayment: "40% ቅድመ ክፍያ", advanceDue: "ውሉ ሲፈረም እና ሥራው ሲጀምር",
  midtermPayment: "40% መካከለኛ ክፍያ", midtermDue: "ሥራው መሃል ላይ ሲደርስ",
  finalPayment: "20% ቀሪ ክፍያ", finalDue: "ሥራው ከተጠናቀቀ በ24 ሰዓት ውስጥ",
  advanceTerms: "የማይመለስ 40% ቅድመ ክፍያ ውሉ ሲፈረም እና ሥራው ሲጀምር ይከፈላል።",
  midtermTerms: "ተጨማሪ 40% ክፍያ የእቅድ ወይም የአገልግሎት ሥራው መሃል ላይ ይከፈላል።",
  finalTerms: "የቀረው 20% ክፍያ የተስማሙበት ሥራ ከተጠናቀቀ በ24 ሰዓት ውስጥ ይከፈላል።",
  bankOnly: "ክፍያዎች በአንቀጽ 1 በተገለጹት የድርጅቱ ባንክ አካውንቶች ብቻ ይፈጸማሉ።",
  changesHeading: "ስረዛ፣ ተጨማሪ ስራዎች እና ከአቅም በላይ ጉዳዮች", scopeChanges: "ስራዎች ሲጨመሩ ወይም ሲቀነሱ በሚደረጉ የጋራ ውይይቶች መሰረት ክፍያው ይስተካከላል።",
  forceMajeure: "ድንገተኛ የተፈጥሮ አደጋዎች ወይም ሀገራዊ ጉዳዮች ቢያጋጥሙ ከሙሽሮች ጋር በመመካከር በንግግር የሚፈታ ይሆናል።",
  cancellationTerms: "ሙሽሮቹ ሰርጉን ማካሄድ ባይችሉ ጉዳዩ በውይይት ይስተካከላል፤ ነገር ግን ቀድሞ የወጡ ወጪዎች እና ቅድመ ክፍያዎች አይመለሱም።",
  mediaTermsHeading: "የሚዲያ እና ፎቶ አጠቃቀም ፈቃድ",
  selectedOption: "ተመርጧል", unselectedOption: "አልተመረጠም",
  mediaTermsYes: "ፈቃደኛ ነን፦ በሰርጉ ዕለት የሚነሱ ፎቶዎች እና ቪዲዮዎች ለ'ማትሪሞኒ ባይ ሃና' ማስተዋወቂያ ሶሻል ሚዲያ አገልግሎት ላይ እንዲውሉ ፈቃደኛ ነን።",
  mediaTermsNo: "ፈቃደኛ አይደለንም፦ የሙሽሮቹን ፊት የሚያሳይ ይዘት ፖስት መደረግ የለበትም፤ ድርጅቱ የራሱን ስራ (የንዋያተ-ሰርግ/የከባቢ) ፎቶዎች ብቻ ፖስት ማድረግ ይችላል።",
  amendmentsHeading: "የውል ማሻሻያ እና ስርዝ-ድልዝ",
  amendmentsTerms: "በሰነዱ ላይ ያለ የሁለቱም ወገኖች ፊርማ ያልተደረገበት ማንኛውም ስርዝ-ድልዝ ወይም በእጅ የተደረገ ማስተካከያ ህጋዊ ተቀባይነት የለውም፤ ማሻሻያዎች በሙሉ በሁለቱም አካል ስምምነት ብቻ ይጸናሉ።",
  signatureHeading: "የፊርማ ማረጋገጫ", signatureIntro: "ይህንን ውል ተረድተን በባለቤትነት እና በፈቃደኝነት ተስማምተናል።",
  clientGroomSignature: "የሙሽራው ስም እና ፊርማ", clientBrideSignature: "የሙሽሪት ስም እና ፊርማ",
  providerSignature: "ውል ሰጪ (Matrimony by Hanna)",
  clientSignatures: "ውል ተቀባይ (ደንበኛ / ሙሽሮቹ)", signatureLabel: "ፊርማ"
});

// The Orthodox wedding service & responsibility checklist: five parts, numbered as on the printed form.
// Each service is planned by Matrimony ("planning") or already booked by the couple ("client").
const SERVICE_PARTS = [
  { id: "part1", number: 1, title: { en: "Pre-wedding spiritual teaching & church documents", am: "ቅድመ-ሰርግ መንፈሳዊ ትምህርቶች እና የሰነድ ጉዳዮች" } },
  { id: "part2", number: 2, title: { en: "Teaching & choir program (Liturgy & Choir)", am: "የትምህርት እና የዝማሬ መርሃ ግብር (Liturgy & Choir)" } },
  { id: "part3", number: 3, title: { en: "Behind-the-scenes preparation, hall & logistics", am: "ከጀርባ ያሉ ዝግጅቶች፣ አዳራሽ እና ሎጅስቲክስ" } },
  { id: "part4", number: 4, title: { en: "Media, attire & beauty", am: "ሚዲያ፣ አልባሳት እና ውበት" } },
  { id: "part5", number: 5, title: { en: "Printing, protocol & hosting", am: "የህትመት፣ የፕሮቶኮል እና አስተናጋጅ ስራዎች" } }
];

// Included free with every wedding.
const BONUS_SERVICES = [
  { id: "bonus-kidase-audio", title: { en: "Special Kidase audio teachings on marriage for the couple", am: "የሙሽሮች ልዩ ቅዳሴ ከትዳር አንፃር ኦዲዮ ትምህርቶች" } },
  { id: "bonus-rehearsal", title: { en: "Song study & rehearsal for the couple and bridesmaids", am: "የሙሽሮች እና የሚዜዎች የመዝሙር ጥናት እና Rehearsal" } },
  { id: "bonus-spiritual-prep", title: { en: "Pre-wedding repentance & spiritual preparation guide (Spiritual Prep Checklist)", am: "የቅድመ ሰርግ የንስሐ እና የመንፈሳዊ ዝግጅት መመሪያ (Spiritual Prep Checklist)" } }
];

const choice = (value, en, am = en) => ({ value, label: { en, am } });
const FORMAT_CHOICES = [choice("in-person", "In person", "በአካል"), choice("online", "Online"), choice("hybrid", "In person & online", "በአካል እና Online")];
const MOMENT_CHOICES = [choice("home", "Home / exit", "ቤት / መውጫ"), choice("church", "Church", "ቤተክርስቲያን"), choice("procession", "Procession", "ሰልፍ"), choice("hall", "Hall program", "የአዳራሽ ፕሮግራም")];

const services = [
  {
    id: "premarital",
    number: "1.1",
    group: "part1",
    title: { en: "Premarital teaching", am: "የቅድመ ጋብቻ ትምህርት" },
    description: { en: "Guided teaching that prepares the couple for the covenant of marriage.", am: "ጥንዶቹን ለጋብቻ ቃል ኪዳን የሚያዘጋጅ የተመራ ትምህርት።" },
    options: [
      { id: "format", label: { en: "Delivery", am: "የአቀራረብ መንገድ" }, type: "single", choices: FORMAT_CHOICES },
      { id: "sessions", label: { en: "Sessions", am: "የትምህርት ብዛት" }, type: "single", choices: [choice("one", "1 session", "1 ጊዜ"), choice("two-three", "2–3 sessions", "2–3 ጊዜ"), choice("four-plus", "4 or more", "4 እና ከዚያ በላይ")] },
      { id: "teacher", label: { en: "Teacher / church", am: "መምህር / ቤተክርስቲያን" }, type: "text" },
      { id: "date", label: { en: "Preferred start", am: "የሚጀምሩበት ቀን" }, type: "date" }
    ]
  },
  {
    id: "post-marriage",
    number: "1.2",
    group: "part1",
    title: { en: "Post-marriage teaching", am: "የድህረ ጋብቻ ትምህርት" },
    description: { en: "Follow-up teaching and counsel after the wedding.", am: "ከሰርጉ በኋላ የሚሰጥ የክትትል ትምህርት እና ምክር።" },
    options: [
      { id: "format", label: { en: "Delivery", am: "የአቀራረብ መንገድ" }, type: "single", choices: FORMAT_CHOICES },
      { id: "timing", label: { en: "When", am: "መቼ" }, type: "single", choices: [choice("three-month", "After 3 months", "ከ3 ወር በኋላ"), choice("six-month", "After 6 months", "ከ6 ወር በኋላ"), choice("flexible", "Flexible", "ተለዋዋጭ")] },
      { id: "followup", label: { en: "Extra follow-up session", am: "ተጨማሪ የክትትል ጊዜ" }, type: "toggle" }
    ]
  },
  {
    id: "liturgy",
    number: "1.3",
    group: "part1",
    title: { en: "Kidase responses teaching", am: "የቅዳሴ ተሰጥኦ ትምህርት" },
    description: { en: "Learn the Kidase responses and order so the couple can take part with understanding.", am: "ጥንዶቹ በማስተዋል እንዲሳተፉ የቅዳሴ ተሰጥኦ እና ሥርዓት ትምህርት።" },
    options: [
      { id: "format", label: { en: "Delivery", am: "የአቀራረብ መንገድ" }, type: "single", choices: FORMAT_CHOICES },
      { id: "coverage", label: { en: "Covers", am: "የሚካተተው" }, type: "multi", choices: [choice("responses", "Responses & prayers", "ተሰጥኦ እና ጸሎቶች"), choice("order", "Kidase order", "የቅዳሴ ሥርዓት"), choice("roles", "Roles & procession", "ሚና እና ሰልፍ")] },
      { id: "learners", label: { en: "Who attends", am: "የሚማሩት" }, type: "multi", choices: [choice("couple", "Couple", "ሙሽሮች"), choice("bridesmaids", "Bridesmaids & groomsmen", "ሚዜዎች"), choice("family", "Family", "ቤተሰብ")] }
    ]
  },
  {
    id: "church-systems",
    number: "1.4",
    group: "part1",
    title: { en: "Church documents & process", am: "የቤተክርስቲያን ሰነዶች ማስፈጸም" },
    description: { en: "Registration, letters and clergy arrangements handled with the church.", am: "ምዝገባ፣ ደብዳቤዎች እና ከካህናት ጋር የሚደረጉ ዝግጅቶች።" },
    options: [
      { id: "tasks", label: { en: "Included", am: "የሚካተቱ ሥራዎች" }, type: "multi", choices: [choice("registration", "Church registration", "የቤተክርስቲያን ምዝገባ"), choice("letters", "Letters & certificates", "ደብዳቤዎች እና የምስክር ወረቀቶች"), choice("confession", "Confession father letter", "የንስሐ አባት ደብዳቤ"), choice("clergy", "Clergy coordination", "ከካህናት ጋር ማስተባበር")] },
      { id: "church", label: { en: "Church name / contact", am: "የቤተክርስቲያኑ ስም / አድራሻ" }, type: "text" }
    ]
  },
  {
    id: "teacher",
    number: "2.1",
    group: "part2",
    title: { en: "Guest teacher", am: "ተጋባዥ መምህር" },
    description: { en: "An invited teacher who gives the word on the wedding day.", am: "በሰርጉ ዕለት ትምህርት የሚሰጥ ተጋባዥ መምህር።" },
    options: [
      { id: "preferred", label: { en: "Preferred teacher", am: "የሚመረጠው መምህር" }, type: "text" },
      { id: "moments", label: { en: "Teaches at", am: "የሚያስተምርበት" }, type: "multi", choices: [choice("church", "Church", "ቤተክርስቲያን"), choice("hall", "Hall program", "የአዳራሽ ፕሮግራም")] },
      { id: "minutes", label: { en: "Length (minutes)", am: "ርዝመት (ደቂቃ)" }, type: "number" }
    ]
  },
  {
    id: "choir",
    number: "2.2",
    group: "part2",
    title: { en: "Church choir", am: "የህብረት መዘምራን" },
    description: { en: "A choir that leads the mezmur through the ceremony and celebration.", am: "በሥነ-ሥርዓቱ እና በድግሱ መዝሙር የሚመሩ የህብረት መዘምራን።" },
    options: [
      { id: "choir", label: { en: "Choir / church", am: "መዘምራኑ / ቤተክርስቲያኑ" }, type: "text" },
      { id: "members", label: { en: "Number of singers", am: "የዘማሪዎች ብዛት" }, type: "number" },
      { id: "moments", label: { en: "Sings during", am: "የሚዘምሩበት" }, type: "multi", choices: MOMENT_CHOICES }
    ]
  },
  {
    id: "guest-singers",
    number: "2.3",
    group: "part2",
    title: { en: "Guest singers (well-known mezmur singers)", am: "ተጋባዥ መዘምራን (የታወቁ ዘማሪዎች)" },
    description: { en: "Invited, well-known singers for the special moments.", am: "ለልዩ ጊዜያት የሚጋበዙ የታወቁ ዘማሪዎች።" },
    options: [
      { id: "singers", label: { en: "Preferred singers", am: "የሚመረጡ ዘማሪዎች" }, type: "text" },
      { id: "songs", label: { en: "Number of songs", am: "የመዝሙር ብዛት" }, type: "number" },
      { id: "moments", label: { en: "Sings during", am: "የሚዘምሩበት" }, type: "multi", choices: MOMENT_CHOICES }
    ]
  },
  {
    id: "instruments",
    number: "2.4",
    group: "part2",
    title: { en: "Mezmur instruments", am: "የዜማ መሳሪያዎች" },
    description: { en: "Instruments and players that carry the mezmur.", am: "መዝሙሩን የሚያጅቡ የዜማ መሳሪያዎች እና ተጫዋቾች።" },
    options: [
      { id: "instruments", label: { en: "Instruments", am: "መሳሪያዎች" }, type: "multi", choices: [choice("kebero", "Kebero", "ከበሮ"), choice("begena", "Begena", "በገና"), choice("krar", "Krar", "ክራር"), choice("keyboard", "Keyboard", "ኪቦርድ"), choice("masinko", "Masinko", "ማሲንቆ")] },
      { id: "soundcheck", label: { en: "Soundcheck before the day", am: "ከዕለቱ በፊት የድምፅ ሙከራ" }, type: "toggle" }
    ]
  },
  {
    id: "venue",
    number: "3.1",
    group: "part3",
    title: { en: "Hall (choosing & booking the venue)", am: "አዳራሽ (የሰርግ ቦታ መምረጥና ማስያዝ)" },
    description: { en: "Find and reserve the place that holds the celebration.", am: "ድግሱን የሚያስተናግድ ቦታ መምረጥ እና ማስያዝ።" },
    options: [
      { id: "type", label: { en: "Venue type", am: "የቦታ አይነት" }, type: "single", choices: [choice("church", "Church hall", "የቤተክርስቲያን አዳራሽ"), choice("wedding", "Wedding hall", "የሰርግ አዳራሽ"), choice("hotel", "Hotel hall", "የሆቴል አዳራሽ"), choice("outdoor", "Outdoor / garden", "የውጪ ቦታ / ግቢ")] },
      { id: "capacity", label: { en: "Guests", am: "የእንግዳ ብዛት" }, type: "number" },
      { id: "name", label: { en: "Preferred venue", am: "የሚመረጠው ቦታ" }, type: "text" },
      { id: "budget", label: { en: "Venue budget (ETB)", am: "የአዳራሽ በጀት (ብር)" }, type: "number" }
    ]
  },
  {
    id: "decor",
    number: "3.2",
    group: "part3",
    title: { en: "Hall decor", am: "የአዳራሽ ዲኮር" },
    description: { en: "The look of the hall, from the stage to the tables.", am: "ከመድረክ እስከ ጠረጴዛ የአዳራሹ ውበት።" },
    options: [
      { id: "areas", label: { en: "Areas", am: "የዲኮር ቦታዎች" }, type: "multi", choices: [choice("stage", "Stage", "መድረክ"), choice("tables", "Guest tables", "የእንግዶች ጠረጴዛ"), choice("entrance", "Entrance", "መግቢያ"), choice("home-exit", "Home exit", "ከቤት መውጫ"), choice("photo", "Photo backdrop", "የፎቶ ጀርባ")] },
      { id: "style", label: { en: "Style", am: "ዘይቤ" }, type: "single", choices: [choice("classic", "Classic & elegant", "ክላሲክ እና ውብ"), choice("modern", "Modern minimal", "ዘመናዊ ቀላል"), choice("traditional", "Traditional", "ባህላዊ"), choice("custom", "Custom vision", "ልዩ ራዕይ")] },
      { id: "colors", label: { en: "Colors", am: "ቀለሞች" }, type: "text" }
    ]
  },
  {
    id: "sound",
    number: "3.3",
    group: "part3",
    title: { en: "Sound system", am: "ሳውንድ ሲስተም (Sound System)" },
    description: { en: "Clear sound for prayers, teaching, mezmur and speeches.", am: "ለጸሎት፣ ትምህርት፣ መዝሙር እና ንግግር ግልጽ ድምፅ።" },
    options: [
      { id: "coverage", label: { en: "Coverage", am: "የሚሸፍነው" }, type: "multi", choices: [choice("church", "Church", "ቤተክርስቲያን"), choice("hall", "Hall", "አዳራሽ"), choice("outdoor", "Outdoor / procession", "ውጪ / ሰልፍ")] },
      { id: "microphones", label: { en: "Microphones", am: "የማይክሮፎን ብዛት" }, type: "number" },
      { id: "technician", label: { en: "Technician", am: "ቴክኒሺያን" }, type: "single", choices: [choice("included", "Included", "ተካቷል"), choice("venue", "Venue provides", "ቦታው ያቀርባል")] }
    ]
  },
  {
    id: "generator",
    number: "3.4",
    group: "part3",
    title: { en: "Generator & backup power", am: "የድንገተኛ ኃይል / ጀነሬተር (Generator & Backup Power)" },
    description: { en: "Keeps lights and sound running if the power fails.", am: "መብራት ቢጠፋ መብራቱና ድምፁ እንዲቀጥል።" },
    options: [
      { id: "need", label: { en: "Power plan", am: "የኃይል እቅድ" }, type: "single", choices: [choice("rental", "Rental needed", "ኪራይ ያስፈልጋል"), choice("venue", "Venue provides", "ቦታው ያቀርባል")] },
      { id: "capacity", label: { en: "Capacity (kVA)", am: "አቅም (kVA)" }, type: "text" },
      { id: "fuel", label: { en: "Fuel", am: "ነዳጅ" }, type: "single", choices: [choice("included", "Included", "ተካቷል"), choice("separate", "Separate", "ለብቻ")] }
    ]
  },
  {
    id: "food-drinks",
    number: "3.5",
    group: "part3",
    title: { en: "Food, drinks & catering rentals", am: "ምግብ፣ መጠጥ እና የድግስ እቃዎች ኪራይ" },
    description: { en: "The menu, drinks and the tables, tableware and tents the feast needs.", am: "ምናሌ፣ መጠጦች እና ለድግሱ የሚያስፈልጉ ጠረጴዛዎች፣ የምግብ እቃዎች እና ድንኳኖች።" },
    options: [
      { id: "service", label: { en: "Meal service", am: "የምግብ አቀራረብ" }, type: "single", choices: [choice("buffet", "Buffet", "ቡፌ"), choice("plated", "Plated", "በሳህን"), choice("traditional", "Traditional menu", "ባህላዊ ምግብ")] },
      { id: "fasting", label: { en: "Fasting menu", am: "የጾም ምግብ" }, type: "single", choices: [choice("no", "Not needed", "አያስፈልግም"), choice("partly", "Some fasting dishes", "ከፊል የጾም ምግብ"), choice("all", "Fully fasting", "ሙሉ የጾም")] },
      { id: "guests", label: { en: "Guests", am: "የእንግዳ ብዛት" }, type: "number" },
      { id: "drinks", label: { en: "Drinks", am: "መጠጦች" }, type: "multi", choices: [choice("water", "Water", "ውሃ"), choice("soft-drinks", "Soft drinks", "ለስላሳ መጠጦች"), choice("coffee-tea", "Coffee & tea", "ቡና እና ሻይ"), choice("juice", "Juice", "ጭማቂ"), choice("tella-tej", "Tella / tej", "ጠላ / ጠጅ")] },
      { id: "rentals", label: { en: "Rentals", am: "ኪራይ" }, type: "multi", choices: [choice("tables-chairs", "Tables & chairs", "ጠረጴዛ እና ወንበር"), choice("tableware", "Tableware", "የምግብ እቃዎች"), choice("tents", "Tents", "ድንኳን"), choice("cake", "Cake & champagne", "ኬክ እና ሻምፓኝ")] }
    ]
  },
  {
    id: "cars-flowers",
    number: "3.6",
    group: "part3",
    title: { en: "Cars & flower decoration for the couple, bridesmaids & family", am: "የሙሽሮች፣የሚዜዎች እና የቤተሰብ መኪና እና የአበባ ጌጣጌጥ" },
    description: { en: "Decorated cars and the flowers for hands, cars and the hall.", am: "ያጌጡ መኪኖች እና የእጅ፣ የመኪና እና የአዳራሽ አበባዎች።" },
    options: [
      { id: "riders", label: { en: "Cars for", am: "መኪና ለ" }, type: "multi", choices: [choice("couple", "Couple", "ሙሽሮች"), choice("bridesmaids", "Bridesmaids & groomsmen", "ሚዜዎች"), choice("family", "Family", "ቤተሰብ")] },
      { id: "cars", label: { en: "Number of cars", am: "የመኪና ብዛት" }, type: "number" },
      { id: "vehicle", label: { en: "Car type", am: "የመኪና አይነት" }, type: "text" },
      { id: "flowers", label: { en: "Flowers", am: "አበባዎች" }, type: "multi", choices: [choice("bouquet", "Hand bouquet", "የእጅ አበባ"), choice("car", "Car flowers", "የመኪና አበባ"), choice("hall", "Hall flowers", "የአዳራሽ አበባ"), choice("church", "Church flowers", "የቤተክርስቲያን አበባ")] },
      { id: "palette", label: { en: "Flower colors", am: "የአበባ ቀለሞች" }, type: "text" }
    ]
  },
  {
    id: "photo-video",
    number: "4.1",
    group: "part4",
    title: { en: "Photography & video", am: "ፎቶግራፍ፣ ቪዲዮ" },
    description: { en: "Photos and film of the day, from preparation to the last dance.", am: "ከዝግጅቱ እስከ መጨረሻው የዕለቱ ፎቶ እና ቪዲዮ።" },
    options: [
      { id: "coverage", label: { en: "Coverage", am: "የሚካተተው" }, type: "multi", choices: [choice("photo", "Photography", "ፎቶግራፍ"), choice("video", "Video", "ቪዲዮ"), choice("drone", "Drone", "ድሮን"), choice("pre-wedding", "Pre-wedding shoot", "ቅድመ-ሰርግ ፎቶ")] },
      { id: "moments", label: { en: "Moments", am: "የሚቀረጹ ጊዜያት" }, type: "multi", choices: MOMENT_CHOICES },
      { id: "deliverables", label: { en: "Deliverables", am: "የሚረከቡት" }, type: "multi", choices: [choice("album", "Printed album", "የታተመ አልበም"), choice("highlight", "Highlight film", "አጭር ፊልም"), choice("full-film", "Full film", "ሙሉ ፊልም"), choice("gallery", "Digital gallery", "ዲጂታል ጋለሪ")] }
    ]
  },
  {
    id: "attire",
    number: "4.2",
    group: "part4",
    title: { en: "Attire & jewelry for the couple, bridesmaids & family", am: "የሙሽሮች፣ የሚዜዎችና የቤተሰብ አልባሳት እና ጌጣጌጥ" },
    description: { en: "Dresses, suits, traditional wear and jewelry for each part of the day.", am: "ለዕለቱ ቀሚሶች፣ ሱፎች፣ የባህል ልብሶች እና ጌጣጌጦች።" },
    options: [
      { id: "people", label: { en: "For", am: "ለማን" }, type: "multi", choices: [choice("bride", "Bride", "ሙሽሪት"), choice("groom", "Groom", "ሙሽራው"), choice("bridesmaids", "Bridesmaids & groomsmen", "ሚዜዎች"), choice("family", "Family", "ቤተሰብ")] },
      { id: "looks", label: { en: "Looks", am: "አልባሳት" }, type: "multi", choices: [choice("church", "Church", "ለቤተክርስቲያን"), choice("hall", "Hall", "ለአዳራሽ"), choice("traditional", "Traditional", "ባህላዊ"), choice("photo", "Photo shoot", "ለፎቶ")] },
      { id: "jewelry", label: { en: "Jewelry", am: "ጌጣጌጥ" }, type: "text" }
    ]
  },
  {
    id: "beauty",
    number: "4.3",
    group: "part4",
    title: { en: "Bride's hair styling & beauty", am: "የሙሽራዋ የፀጉር ስታይሊንግ እና የውበት ዝግጅት" },
    description: { en: "Hair, makeup and care before and on the day.", am: "ከዕለቱ በፊት እና በዕለቱ የፀጉር፣ ሜካፕ እና የውበት እንክብካቤ።" },
    options: [
      { id: "care", label: { en: "Includes", am: "የሚካተተው" }, type: "multi", choices: [choice("hair", "Hair styling", "የፀጉር ስታይሊንግ"), choice("makeup", "Makeup", "ሜካፕ"), choice("facial", "Facial", "Facial"), choice("morocco", "Morocco bath", "Morocco"), choice("nails", "Nails", "ጥፍር")] },
      { id: "for", label: { en: "Also for", am: "ለሌሎችም" }, type: "multi", choices: [choice("bridesmaids", "Bridesmaids", "ሚዜዎች"), choice("family", "Family", "ቤተሰብ")] },
      { id: "trial", label: { en: "Trial session", am: "የሙከራ ጊዜ" }, type: "toggle" }
    ]
  },
  {
    id: "invitation",
    number: "5.1",
    group: "part5",
    title: { en: "Invitation cards & guest gifts (printed/digital)", am: "መጥሪያ ካርድ እና የእንግዶች ስጦታዎች (Printed/Digital)" },
    description: { en: "Invitations in the couple's voice, and gifts for the guests.", am: "የጥንዶቹን ድምፅ የሚያሳዩ መጥሪያዎች እና ለእንግዶች ስጦታዎች።" },
    options: [
      { id: "format", label: { en: "Format", am: "ቅርጽ" }, type: "single", choices: [choice("printed", "Printed", "የታተመ"), choice("digital", "Digital", "ዲጂታል"), choice("both", "Printed & digital", "የታተመ እና ዲጂታል")] },
      { id: "quantity", label: { en: "Invitations", am: "የመጥሪያ ብዛት" }, type: "number" },
      { id: "language", label: { en: "Language", am: "ቋንቋ" }, type: "single", choices: [choice("amharic", "Amharic", "አማርኛ"), choice("english", "English", "እንግሊዝኛ"), choice("bilingual", "Bilingual", "ሁለት ቋንቋ")] },
      { id: "gifts", label: { en: "Guest gifts", am: "የእንግዶች ስጦታ" }, type: "text" }
    ]
  },
  {
    id: "hosts",
    number: "5.2",
    group: "part5",
    title: { en: "Hosts & ushers", am: "አስተናጋጆች" },
    description: { en: "Hosts who welcome, seat and serve the guests.", am: "እንግዶችን የሚቀበሉ፣ የሚያስቀምጡ እና የሚያስተናግዱ።" },
    options: [
      { id: "count", label: { en: "Number of hosts", am: "የአስተናጋጆች ብዛት" }, type: "number" },
      { id: "duties", label: { en: "Duties", am: "ኃላፊነቶች" }, type: "multi", choices: [choice("welcome", "Welcome & seating", "አቀባበል እና ማስቀመጥ"), choice("service", "Food & drink service", "የምግብ እና መጠጥ መስተንግዶ"), choice("gifts", "Gift table", "የስጦታ ጠረጴዛ"), choice("vip", "Elders & VIP care", "የአዛውንቶች እና የክብር እንግዶች")] },
      { id: "dress", label: { en: "Dress code", am: "የአለባበስ ሥርዓት" }, type: "text" }
    ]
  },
  {
    id: "mc",
    number: "5.3",
    group: "part5",
    title: { en: "Day protocol & program lead (MC)", am: "የዕለቱ ፕሮቶኮል እና መርሃ ግብር መሪ (MC)" },
    description: { en: "Runs the order of the day and keeps every moment on time.", am: "የዕለቱን መርሃ ግብር የሚመራ እና ሰዓቱን የሚጠብቅ።" },
    options: [
      { id: "language", label: { en: "Language", am: "ቋንቋ" }, type: "single", choices: [choice("amharic", "Amharic", "አማርኛ"), choice("english", "English", "እንግሊዝኛ"), choice("bilingual", "Bilingual", "ሁለት ቋንቋ")] },
      { id: "program", label: { en: "Leads", am: "የሚመራው" }, type: "multi", choices: [choice("procession", "Procession & entrance", "ሰልፍ እና መግቢያ"), choice("hall", "Hall program", "የአዳራሽ ፕሮግራም"), choice("speeches", "Speeches & blessings", "ንግግሮች እና ቡራኬ"), choice("gifts", "Gift ceremony", "የስጦታ ሥነ-ሥርዓት")] },
      { id: "preferred", label: { en: "Preferred MC", am: "የሚመረጠው MC" }, type: "text" }
    ]
  }
];

// Service IDs from before the five-part checklist, so saved plans keep their choices.
const RETIRED_SERVICES = { transport: "cars-flowers", flowers: "cars-flowers", "cake-champagne": "food-drinks" };
const DROPPED_SERVICES = ["ac", "checklist", "nurse", "rehearsal"];

function normalizeServices() {
  const list = state.services ||= {};
  for (const [oldId, newId] of Object.entries(RETIRED_SERVICES)) {
    const old = list[oldId];
    if (!old) continue;
    const target = list[newId] ||= { selected: false, options: {}, notes: "", price: "" };
    target.options ||= {};
    if (old.selected) target.selected = true;
    if (old.selected && oldId === "cake-champagne") target.options.rentals = [...new Set([...(target.options.rentals || []), "cake"])];
    if (old.selected && oldId === "flowers" && Array.isArray(old.options?.pieces)) {
      const pieces = { hand: "bouquet", car: "car", hall: "hall", church: "church" };
      target.options.flowers = [...new Set([...(target.options.flowers || []), ...old.options.pieces.map(piece => pieces[piece]).filter(Boolean)])];
    }
    if (old.notes?.trim()) target.notes = [target.notes, old.notes].filter(Boolean).join("\n");
    delete list[oldId];
  }
  DROPPED_SERVICES.forEach(id => delete list[id]);
  for (const service of Object.values(list)) if (service?.selected && !service.responsibility) service.responsibility = "planning";
}

const fieldIds = ["brideName", "bridePhone", "brideAddress", "groomName", "groomPhone", "groomAddress", "weddingDate", "eventDays", "totalFee", "generalNotes"];
const eventVenueCatalog = [
  { id: "church", label: "venueTypeChurch", legacy: "sacredVenue" },
  { id: "hall", label: "venueTypeHall", legacy: "receptionVenue" },
  { id: "hotel", label: "venueTypeHotel" },
  { id: "outdoor", label: "venueTypeOutdoor" },
  { id: "home", label: "venueTypeHome" },
  { id: "restaurant", label: "venueTypeRestaurant" },
  { id: "other", label: "venueTypeOther" }
];

const state = {
  lang: "en",
  currentStep: 0,
  serviceSearch: "",
  serviceFilter: "all",
  recordId: null,
  records: [],
  details: {},
  services: {}
};

function normalizeEventVenues() {
  state.details ||= {};
  const details = state.details;
  const hasVenueSelection = Array.isArray(details.eventVenueTypes);
  const chosen = new Set(hasVenueSelection ? details.eventVenueTypes : []);
  details.venues ||= {};
  details.locations ||= {};
  eventVenueCatalog.forEach((venue) => {
    // Import legacy fields once; subsequent edits must not restore old names or pins.
    if (hasVenueSelection || !venue.legacy || !details[venue.legacy]) return;
    if (!details.venues[venue.id]) details.venues[venue.id] = details[venue.legacy];
    const oldPin = details.locations[venue.legacy];
    if (oldPin && !details.locations[`venue-${venue.id}`]) details.locations[`venue-${venue.id}`] = { ...oldPin };
    chosen.add(venue.id);
  });
  details.eventVenueTypes = [...chosen].filter((id) => eventVenueCatalog.some((venue) => venue.id === id));
}

function syncEventVenueChoicesToForm() {
  normalizeEventVenues();
  const chosen = new Set(state.details.eventVenueTypes);
  document.querySelectorAll("[data-event-venue-type]").forEach((input) => { input.checked = chosen.has(input.dataset.eventVenueType); });
  renderEventVenueFields();
}

function renderEventVenueFields() {
  const container = document.getElementById("eventVenueFields");
  if (!container) return;
  normalizeEventVenues();
  const chosen = new Set(state.details.eventVenueTypes);
  container.innerHTML = eventVenueCatalog.filter((venue) => chosen.has(venue.id)).map((venue) => {
    const inputId = `venue-${venue.id}`;
    const name = state.details.venues[venue.id] || "";
    return `<label class="field field-full venue-location-field"><span data-i18n="${venue.label}">${escapeHtml(t(venue.label))}</span><input id="${inputId}" type="text" data-map-location data-venue-location="${venue.id}" value="${escapeHtml(name)}" autocomplete="off" /></label>`;
  }).join("");
  window.dispatchEvent(new Event("plan-ui-update"));
}

function selectedEventVenues() {
  normalizeEventVenues();
  const chosen = new Set(state.details.eventVenueTypes);
  return eventVenueCatalog.filter((venue) => chosen.has(venue.id)).map((venue) => ({
    id: venue.id,
    label: t(venue.label),
    name: state.details.venues[venue.id] || ""
  }));
}

function eventVenueSummary() {
  return selectedEventVenues().map((venue) => venue.name ? `${venue.label}: ${venue.name}` : venue.label).join(" · ") || t("notSet");
}

let saveTimer;
let autoSaveTimer;
let toastTimer;
let savingRecord = false;
let recordSavePromise = Promise.resolve();
let recordStatus = "newPlan";
let savedPlanSignature = "";
let documentJob = 0;
let exportingPdf = false;
let openingRecord = false;

// Blank documents print write-in lines where a plan would show "Not provided" and similar.
const BLANK = "____________________";
const BLANK_KEYS = new Set(["notProvided", "notSet", "dateNotSet", "mealNotSet", "noAddons"]);

function t(key) {
  if (state.blankDocument && BLANK_KEYS.has(key)) return BLANK;
  return (copy[state.lang] && copy[state.lang][key]) || copy.en[key] || key;
}

function localized(value) {
  if (!value) return "";
  return value[state.lang] || value.en || value.am || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function iconUse(name) {
  return `<svg class="ui-icon" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
}

function formatMoney(value) {
  if (state.blankDocument) return `${BLANK} ETB`;
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat(state.lang === "am" ? "am-ET" : "en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)} ETB`;
}

/* ── Ethiopian Calendar Converter ─────────────────────────────────── */
const EC_MONTHS_AM = ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];
const EC_MONTHS_EN = ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit","Megabit","Miyazya","Ginbot","Sene","Hamle","Nehase","Pagume"];

// Julian Day Number of Meskerem 1, 1 EC. Pagume has 6 days in EC years where year % 4 === 3.
const ETHIOPIAN_EPOCH = 1724221;
const ethiopianYearStart = year => ETHIOPIAN_EPOCH + 365 * (year - 1) + Math.floor(year / 4);

function gregorianToEthiopian(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const ecYear = Math.floor((4 * (jdn - ETHIOPIAN_EPOCH) + 1463) / 1461);
  const n = jdn - ethiopianYearStart(ecYear);
  return { year: ecYear, month: Math.floor(n / 30) + 1, day: n % 30 + 1 };
}

function ethiopianToGregorian(year, month, day) {
  const jdn = ethiopianYearStart(year) + 30 * (month - 1) + day - 1;
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return { year: 100 * b + d - 4800 + Math.floor(m / 10), month: m + 3 - 12 * Math.floor(m / 10), day: e - Math.floor((153 * m + 2) / 5) + 1 };
}

const ethiopianMonthLength = (year, month) => month < 13 ? 30 : (year % 4 === 3 ? 6 : 5);

function formatEthiopianDate(value) {
  if (!value) return t("dateNotSet");
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const ec = gregorianToEthiopian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const monthName = state.lang === "am" ? EC_MONTHS_AM[ec.month - 1] : EC_MONTHS_EN[ec.month - 1];
  return `${monthName} ${ec.day}, ${ec.year}${state.lang === "am" ? " ዓ.ም." : " EC"}`;
}

function formatGregorianDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(state.lang === "am" ? "am-ET" : "en-GB", { year: "numeric", month: "long", day: "numeric", calendar: "gregory" }).format(date);
}

function formatDate(value) {
  if (!value) return t("dateNotSet");
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  // On screen the Ethiopian calendar leads; English also shows the Gregorian equivalent.
  if (state.lang === "am") return formatEthiopianDate(value);
  return `${formatEthiopianDate(value)} (${formatGregorianDate(value)})`;
}

function formatDateForDocument(value) {
  if (state.blankDocument) return BLANK;
  // In documents: Amharic → EC, English → Gregorian
  if (!value) return t("dateNotSet");
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return state.lang === "am" ? formatEthiopianDate(value) : formatGregorianDate(value);
}

/* ── Meal Program Helpers ─────────────────────────────────────────── */
function getMealProgram() {
  const meals = state.details.mealProgram || [];
  return meals;
}

function formatMealProgram() {
  if (state.blankDocument) return ["mealBreakfast", "mealLunch", "mealDinner"].map(key => `☐ ${t(key)}`).join("    ");
  const meals = getMealProgram();
  if (!meals.length) return t("mealNotSet");
  if (meals.length === 3 && meals.includes("breakfast") && meals.includes("lunch") && meals.includes("dinner")) {
    return t("mealFullDay");
  }
  return meals.map(meal => t("meal" + meal.charAt(0).toUpperCase() + meal.slice(1))).join(" · ");
}

function syncMealChoicesToForm() {
  const meals = new Set(state.details.mealProgram || []);
  document.querySelectorAll("[data-meal-program]").forEach(input => {
    input.checked = meals.has(input.dataset.mealProgram);
  });
  updateMealSummary();
}

function updateMealSummary() {
  const summary = document.getElementById("mealSummary");
  if (!summary) return;
  const meals = getMealProgram();
  if (meals.length === 3 && meals.includes("breakfast") && meals.includes("lunch") && meals.includes("dinner")) {
    summary.hidden = false;
    summary.textContent = "✦ " + t("mealFullDay");
    summary.className = "meal-summary meal-full-day";
  } else if (meals.length > 0) {
    summary.hidden = false;
    summary.textContent = formatMealProgram();
    summary.className = "meal-summary";
  } else {
    summary.hidden = true;
  }
}

function dateInputValue(date = new Date()) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getServiceState(serviceId) {
  if (!state.services[serviceId]) state.services[serviceId] = { selected: false, options: {}, notes: "", price: "" };
  if (!state.services[serviceId].options) state.services[serviceId].options = {};
  return state.services[serviceId];
}

function hasValidPrice(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0;
}

function reconcileServiceTotal() {
  updateBalance();
}

function paymentSchedule(total) {
  const totalCents = Math.max(0, Math.round((Number(total) || 0) * 100));
  const advanceCents = Math.round(totalCents * 0.4);
  const midtermCents = Math.round(totalCents * 0.4);
  return { advance: advanceCents / 100, midterm: midtermCents / 100, final: (totalCents - advanceCents - midtermCents) / 100 };
}

function syncContractChoicesToForm() {
  const full = document.getElementById("scopeFullPlanning");
  const dayOf = document.getElementById("scopeDayOf");
  if (full) full.checked = Boolean(state.details.scopeFullPlanning);
  if (dayOf) dayOf.checked = Boolean(state.details.scopeDayOfCoordination);
  const consent = state.details.mediaConsent === "yes" ? "yes" : "no";
  document.querySelectorAll('input[name="mediaConsent"]').forEach(input => { input.checked = input.value === consent; });
}

function defaultOptionValue(option) {
  if (option.type === "single") return "";
  if (option.type === "multi") return [];
  if (option.type === "toggle") return false;
  return "";
}

function getOptionValue(serviceState, option) {
  if (serviceState.options[option.id] === undefined) {
    serviceState.options[option.id] = defaultOptionValue(option);
  }
  return serviceState.options[option.id];
}

function applyLocalization() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (copy[state.lang][key] !== undefined) element.textContent = copy[state.lang][key];
  });
  // A prepared share belongs to the previous language; the next tap rebuilds the PDF.
  document.querySelectorAll("[data-share-pdf]").forEach(button => button.classList.remove("is-ready"));
  updateStepCount();
  document.querySelectorAll("[data-aria-en]").forEach((element) => {
    element.setAttribute("aria-label", state.lang === "am" ? (element.dataset.ariaAm || element.dataset.ariaEn) : element.dataset.ariaEn);
  });
  renderAccount();
  if (document.getElementById("teamDialog")?.open) { renderTeamLink(); renderTeam(); }
  ["sidebarCollapse", "sidebarExpand"].forEach(id => { const button = document.getElementById(id); if (button) button.title = button.getAttribute("aria-label"); });
  if (document.body.classList.contains("sidebar-rail")) setSidebarRail(true);
  document.querySelectorAll("[data-placeholder-en]").forEach((element) => {
    element.placeholder = state.lang === "am" ? (element.dataset.placeholderAm || element.dataset.placeholderEn) : element.dataset.placeholderEn;
  });
  document.querySelectorAll(".language-button").forEach((button) => button.classList.toggle("is-active", button.dataset.language === state.lang));
  document.title = state.lang === "am" ? "ማትሪሞኒ በሀና · የዝግጅት እቅድ" : "Matrimony By Hanna · Event Planner";
  renderServices();
  if (state.currentStep === 2) renderAgreement();
  if (state.currentStep === 3) renderProforma();
  if (state.currentStep === 4) renderRecords();
  updateBalance();
  renderCoupleContext();
  window.dispatchEvent(new Event("plan-ui-update"));
}

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return;
    state.lang = saved.lang === "am" ? "am" : "en";
    state.details = saved.details || {};
    if (!state.details.eventDays) state.details.eventDays = "1";
    if (!state.details.mediaConsent) state.details.mediaConsent = "no";
    normalizeEventVenues();
    state.services = saved.services || {};
    normalizeServices();
    state.recordId = Number.isInteger(saved.recordId) ? saved.recordId : null;
    recordStatus = state.recordId ? "recordDirty" : "newPlan";
    fieldIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && state.details[id] !== undefined) element.value = state.details[id];
    });
    syncContractChoicesToForm();
    updateBalance();
  } catch (error) {
    console.warn("Unable to load local draft", error);
  }
}

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (openingRecord || exportingPdf) return scheduleAutoSave();
    if (!state.details.brideName?.trim() || !state.details.groomName?.trim()) return;
    if (state.recordId && planSignature() === savedPlanSignature) return;
    saveRecord({ silent: true });
  }, 1200);
}

function saveDraft(markDirty = true) {
  if (markDirty && state.recordId && planSignature() !== savedPlanSignature) recordStatus = "recordDirty";
  if (markDirty) scheduleAutoSave();
  renderCoupleContext();
  clearTimeout(saveTimer);
  const saveState = document.getElementById("saveState");
  saveState?.classList.add("is-saving");
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, details: state.details, services: state.services, recordId: state.recordId, savedAt: new Date().toISOString() }));
      saveState?.classList.remove("is-saving");
      if (saveState) saveState.querySelector("span:last-child").textContent = state.recordId ? t(savingRecord ? "recordSaving" : recordStatus) : t("savedLocally");
    } catch (error) {
      saveState?.classList.remove("is-saving");
      if (saveState) saveState.querySelector("span:last-child").textContent = t("localSaveFailed");
      console.warn("Unable to save local draft", error);
    }
  }, 250);
}

function syncDetailsFromForm() {
  fieldIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) state.details[id] = element.value;
  });
  normalizeEventVenues();
  state.details.eventVenueTypes = [...document.querySelectorAll("[data-event-venue-type]:checked")].map((input) => input.dataset.eventVenueType);
  state.details.mealProgram = [...document.querySelectorAll("[data-meal-program]:checked")].map((input) => input.dataset.mealProgram);
  document.querySelectorAll("[data-venue-location]").forEach((input) => {
    state.details.venues[input.dataset.venueLocation] = input.value;
  });
  state.details.scopeFullPlanning = Boolean(document.getElementById("scopeFullPlanning")?.checked);
  state.details.scopeDayOfCoordination = Boolean(document.getElementById("scopeDayOf")?.checked);
  const consent = document.querySelector('input[name="mediaConsent"]:checked');
  if (consent) state.details.mediaConsent = consent.value;
  updateMealSummary();
  updateBalance();
  saveDraft();
}

function planSignature() {
  return JSON.stringify({ lang: state.lang, details: state.details, services: state.services });
}

function firstName(value) {
  return String(value || "").trim().split(/\s+/)[0] || "";
}

function renderCoupleContext() {
  const names = [firstName(state.details.brideName), firstName(state.details.groomName)].filter(Boolean);
  const title = names.length ? names.join(" & ") : t("nextCelebration");
  document.getElementById("topbarCoupleName").textContent = names.length ? title : "";
  const status = savingRecord ? "recordSaving" : recordStatus;
  const saveStateLabel = document.querySelector("#saveState span:last-child");
  if (saveStateLabel && state.currentStep !== 5 && (state.recordId || savingRecord)) saveStateLabel.textContent = t(status);
  const recent = document.getElementById("recentCouples");
  const records = state.records || [];
  const filtered = records.slice(0, 15);

  if (!records.length) {
    recent.innerHTML = `<p>${escapeHtml(t("recentEmpty"))}</p>`;
  } else {
    recent.innerHTML = filtered.map((record) => {
      const isCurrent = record.id === state.recordId;
      const bName = escapeHtml(record.bride_first_name || "");
      const gName = escapeHtml(record.groom_first_name || "");
      const dateText = escapeHtml(formatDate(record.wedding_date));
      return `<div class="recent-couple-item"><button type="button" class="recent-couple ${isCurrent ? "is-current" : ""}" data-open-record="${record.id}" title="${bName} &amp; ${gName}"><svg class="ui-icon recent-couple-icon" aria-hidden="true"><use href="#icon-chat"></use></svg><span class="recent-couple-text"><strong>${bName} &amp; ${gName}</strong><small>${dateText} · #${record.id}</small></span></button></div>`;
    }).join("");
  }
}

function updateBalance() {
  const total = Number(document.getElementById("totalFee")?.value ?? state.details.totalFee) || 0;
  const schedule = paymentSchedule(total);
  for (const [id, amount] of [["advanceValue", schedule.advance], ["midtermValue", schedule.midterm], ["finalPaymentValue", schedule.final]]) {
    const output = document.getElementById(id);
    if (output) output.textContent = formatMoney(amount);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3500);
}

function selectedServices() {
  return services.filter((service) => getServiceState(service.id).selected);
}

function renderOption(service, option, serviceState) {
  const value = getOptionValue(serviceState, option);
  const label = localized(option.label);
  const wide = option.type === "multi" || option.type === "textarea" || option.type === "text";
  let control = "";
  if (option.type === "single") {
    control = `<select data-service-id="${service.id}" data-option-id="${option.id}"><option value="">—</option>${option.choices.map((choice) => `<option value="${escapeHtml(choice.value)}" ${value === choice.value ? "selected" : ""}>${escapeHtml(localized(choice.label))}</option>`).join("")}</select>`;
  } else if (option.type === "multi") {
    const values = Array.isArray(value) ? value : [];
    control = `<div class="multi-choice-grid">${option.choices.map((choice) => `<label class="multi-choice"><input type="checkbox" data-service-id="${service.id}" data-option-id="${option.id}" data-option-value="${escapeHtml(choice.value)}" ${values.includes(choice.value) ? "checked" : ""} /><span>${escapeHtml(localized(choice.label))}</span></label>`).join("")}</div>`;
  } else if (option.type === "toggle") {
    control = `<label class="multi-choice"><input type="checkbox" data-service-id="${service.id}" data-option-id="${option.id}" data-toggle="true" ${value ? "checked" : ""} /><span>${state.lang === "am" ? "አዎ፣ ይካተት" : "Yes, include it"}</span></label>`;
  } else if (option.type === "date") {
    control = `<input type="date" value="${escapeHtml(value)}" data-service-id="${service.id}" data-option-id="${option.id}" />`;
  } else if (option.type === "number") {
    control = `<input type="number" min="0" value="${escapeHtml(value)}" placeholder="0" data-service-id="${service.id}" data-option-id="${option.id}" />`;
  } else if (option.type === "textarea") {
    control = `<textarea data-service-id="${service.id}" data-option-id="${option.id}">${escapeHtml(value)}</textarea>`;
  } else {
    control = `<input type="text" value="${escapeHtml(value)}" data-service-id="${service.id}" data-option-id="${option.id}" />`;
  }
  return `<div class="service-option ${wide ? "is-wide" : ""}"><span class="service-option-label">${escapeHtml(label)}</span>${control}</div>`;
}

const servicePart = id => SERVICE_PARTS.find(part => part.id === id);
const partHeading = part => `${t("partLabel")} ${part.number}፡ ${localized(part.title)}`;

function statusChoice(service, serviceState) {
  return `<div class="service-status" role="group" aria-label="${escapeHtml(t("whoArranges"))}">
    <span class="service-option-label">${escapeHtml(t("whoArranges"))}</span>
    <div class="service-status-options">${["planning", "client"].map(value => `<button type="button" data-service-status="${service.id}" data-status="${value}" aria-pressed="${serviceState.responsibility === value}"><strong>${escapeHtml(t(value === "planning" ? "statusPlanning" : "statusClient"))}</strong><small>${escapeHtml(t(value === "planning" ? "statusPlanningHint" : "statusClientHint"))}</small></button>`).join("")}</div>
  </div>`;
}

function renderServiceCard(service) {
  const serviceState = getServiceState(service.id);
  const title = localized(service.title);
  const description = localized(service.description);
  const details = serviceState.selected ? `<div class="service-options">
      ${statusChoice(service, serviceState)}
      <div class="service-options-grid">${service.options.map(option => renderOption(service, option, serviceState)).join("")}</div>
      <label class="service-option is-wide"><span class="service-option-label">${escapeHtml(t("serviceNotesLabel"))}</span><textarea data-service-notes="${service.id}" placeholder="${escapeHtml(t("serviceNotesPlaceholder"))}">${escapeHtml(serviceState.notes || "")}</textarea></label>
    </div>` : "";
  return `<article class="service-card ${serviceState.selected ? "is-selected" : ""}" data-service-card="${service.id}">
    <div class="service-main">
      <div class="service-icon" aria-hidden="true">${service.number}</div>
      <div class="service-copy">
        <h3 class="service-title">${escapeHtml(title)}</h3>
        <p class="service-description">${escapeHtml(description)}</p>
      </div>
      <button class="service-toggle" type="button" data-service-toggle="${service.id}" aria-label="${escapeHtml(title)}" aria-pressed="${serviceState.selected ? "true" : "false"}"></button>
    </div>
    ${details}
  </article>`;
}

function renderBonusCard() {
  return `<section class="service-part service-bonus-card"><header class="service-part-head"><span class="service-part-number" aria-hidden="true">🎁</span><h2>${escapeHtml(t("bonusTitle"))}</h2></header>
    <ul class="service-bonus-list">${BONUS_SERVICES.map(bonus => `<li><span class="contract-checkbox is-checked" aria-hidden="true">✓</span>${escapeHtml(localized(bonus.title))}</li>`).join("")}</ul></section>`;
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  normalizeServices();
  const search = state.serviceSearch.trim().toLocaleLowerCase();
  const visible = services.filter((service) => {
    const matchesGroup = state.serviceFilter === "all" || service.group === state.serviceFilter;
    const haystack = `${service.number} ${localized(service.title)} ${localized(service.description)} ${localized(servicePart(service.group).title)}`.toLocaleLowerCase();
    return matchesGroup && (!search || haystack.includes(search));
  });
  const parts = SERVICE_PARTS.map(part => {
    const cards = visible.filter(service => service.group === part.id);
    return cards.length ? `<section class="service-part" data-service-part="${part.id}"><header class="service-part-head"><span class="service-part-number">${escapeHtml(`${t("partLabel")} ${part.number}`)}</span><h2>${escapeHtml(localized(part.title))}</h2></header><div class="services-grid">${cards.map(renderServiceCard).join("")}</div></section>` : "";
  }).join("");
  grid.innerHTML = (parts || `<div class="empty-services">${escapeHtml(t("noMatches"))}</div>`) + (state.serviceFilter === "all" && !search ? renderBonusCard() : "");
  const count = selectedServices().length;
  const selectedCount = document.getElementById("selectedCount");
  if (selectedCount) selectedCount.textContent = String(count);
  reconcileServiceTotal();
}

// One checklist row: tick box, number and title, the Status line, then the chosen details.
function checklistBox(checked) {
  return `<span class="contract-checkbox${checked ? " is-checked" : ""}" aria-hidden="true">${checked ? "✓" : ""}</span>`;
}

function serviceChecklistItem(service, itemClass = "checklist-item") {
  const serviceState = state.blankDocument ? {} : getServiceState(service.id);
  const chosen = Boolean(serviceState.selected);
  const summary = chosen ? serviceOptionSummary(service) : [];
  const status = ["planning", "client"].map(value => `<span class="checklist-status-choice">${checklistBox(chosen && serviceState.responsibility === value)}${escapeHtml(t(value === "planning" ? "statusPlanning" : "statusClient"))}</span>`).join('<span class="checklist-status-divider">|</span>');
  return `<li class="${itemClass}${chosen ? " is-chosen" : ""}">${checklistBox(chosen)}<div class="checklist-body">
    <div class="checklist-title"><span class="checklist-number">${escapeHtml(service.number)}</span> ${escapeHtml(localized(service.title))}</div>
    <div class="checklist-status"><span>└ ${escapeHtml(t("statusLabel"))}:</span>${status}</div>
    ${summary.length ? `<small class="checklist-detail">${escapeHtml(summary.join(" · "))}</small>` : ""}
  </div></li>`;
}

// Agreement: every service, ticked or not, part by part, then the included bonuses.
function servicePartsMarkup({ onlyChosen = false, listClass = "service-checklist", itemClass = "checklist-item" } = {}) {
  const parts = SERVICE_PARTS.map(part => {
    const list = services.filter(service => service.group === part.id && (!onlyChosen || state.blankDocument || getServiceState(service.id).selected));
    return list.length ? `<section class="service-part-document"><h4>${escapeHtml(partHeading(part))}</h4><ul class="${listClass}">${list.map(service => serviceChecklistItem(service, itemClass)).join("")}</ul></section>` : "";
  }).join("");
  const bonus = `<section class="service-part-document service-bonus-document"><h4>🎁 ${escapeHtml(t("bonusTitle"))}</h4><ul class="${listClass}">${BONUS_SERVICES.map(item => `<li class="${itemClass} is-chosen">${checklistBox(true)}<div class="checklist-body"><div class="checklist-title">${escapeHtml(localized(item.title))}</div></div></li>`).join("")}</ul></section>`;
  return (parts || `<section class="service-part-document"><p>${escapeHtml(t("noServicesChosen"))}</p></section>`) + bonus;
}

function serviceOptionSummary(service) {
  const serviceState = getServiceState(service.id);
  const parts = [];
  service.options.forEach((option) => {
    const value = getOptionValue(serviceState, option);
    if (option.type === "toggle") {
      if (value) parts.push(state.lang === "am" ? "አዎ" : "Included");
      return;
    }
    if (Array.isArray(value)) {
      const labels = option.choices.filter((choice) => value.includes(choice.value)).map((choice) => localized(choice.label));
      if (labels.length) parts.push(`${localized(option.label)}: ${labels.join(", ")}`);
      return;
    }
    if (value !== "" && value !== null && value !== undefined) {
      const choice = option.choices?.find((item) => item.value === value);
      const display = choice ? localized(choice.label) : (option.type === "date" ? formatDate(value) : value);
      parts.push(`${localized(option.label)}: ${display}`);
    }
  });
  const notes = serviceState.notes?.trim();
  if (notes) parts.push(`${t("notes")}: ${notes}`);
  return parts;
}


function detail(value, fallback = "") {
  return escapeHtml(value || fallback || t("notProvided"));
}

function renderAgreement() {
  const container = document.getElementById("agreementDocument");
  if (!container) return;
  const d = state.details;
  const selected = selectedServices();
  const agreementDate = formatDateForDocument(dateInputValue());
  const packageRows = [
    [t("scopeFullPlanning"), Boolean(d.scopeFullPlanning)],
    [t("scopeDayOf"), Boolean(d.scopeDayOfCoordination)]
  ].map(([label, checked]) => `<li class="agreement-check-row"><span class="contract-checkbox${checked ? " is-checked" : ""}" aria-hidden="true">${checked ? "✓" : ""}</span><div><strong>${escapeHtml(label)}</strong></div></li>`).join("");
  const total = Number(d.totalFee) || 0;
  const schedule = paymentSchedule(total);
  const eventVenueRows = selectedEventVenues().map((venue) => `<div class="event-venue-document-row"><strong>${escapeHtml(venue.label)}</strong><span>${detail(venue.name, t("notSet"))}</span></div>`).join("") || `<div class="doc-value">${escapeHtml(t("notSet"))}</div>`;
  const bankRows = SERVICE_PROVIDER.bankAccounts.map(account => `<div class="bank-detail-row"><dt>${escapeHtml(account.bank)}</dt><dd>${escapeHtml(account.number)}</dd></div>`).join("");
  const signatureLines = `<div class="signature-line"><span>${escapeHtml(t("signatureLabel"))}</span><i aria-hidden="true"></i></div><div class="signature-line"><span>${escapeHtml(t("date"))}</span><i aria-hidden="true"></i></div>`;
  const referenceNumber = documentReference("AG");
  const referenceLabel = state.lang === "am" ? "መዝገብ ቁጥር" : "Ref No:";
  const dateLabel = state.lang === "am" ? "ቀን" : "Date:";
  container.innerHTML = `<article class="agreement-paper">
    <div class="contract-letterhead">
      <img class="contract-logo" src="./assets/matrimony-logo-transparent.png" alt="Matrimony" />
      <div class="contract-reference" aria-label="${escapeHtml(state.lang === "am" ? "የሰነድ መለያ" : "Document reference")}">
        <div class="contract-reference-row"><span>${escapeHtml(referenceLabel)}</span><strong>${escapeHtml(referenceNumber)}</strong></div>
        <div class="contract-reference-row"><span>${escapeHtml(dateLabel)}</span><strong>${escapeHtml(agreementDate)}</strong></div>
      </div>
    </div>
    <div class="contract-rule" aria-hidden="true"></div>
    <div class="agreement-kicker">MATRIMONY BY HANNA · ${escapeHtml(state.lang === "am" ? "የአገልግሎት ውል" : "SERVICE AGREEMENT")}</div>
    <h2 class="agreement-title">${escapeHtml(t("agreementDocumentTitle"))}<span>${escapeHtml(state.lang === "am" ? "ማትሪሞኒ" : "Matrimony")}</span></h2>
    <div class="agreement-top-rule"></div>
    <div class="agreement-meta">
      <div><div class="doc-label">${escapeHtml(t("agreementDate"))}</div><div class="doc-value">${escapeHtml(agreementDate)}</div></div>
      <div><div class="doc-label">${escapeHtml(t("weddingDateAgreement"))}</div><div class="doc-value">${escapeHtml(formatDateForDocument(d.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventDays"))}</div><div class="doc-value">${escapeHtml(d.eventDays || "1")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("mealProgramAgreement"))}</div><div class="doc-value">${escapeHtml(formatMealProgram())}</div></div>
    </div>
    <p class="intro-paragraph">${escapeHtml(t("agreementIntro"))}</p>
    <section class="agreement-parties"><h3>1. ${escapeHtml(t("agreementParties"))}</h3><div class="provider-details">
      <div class="provider-details-card"><div class="doc-label">${escapeHtml(t("providerDetails"))}</div><strong>${escapeHtml(SERVICE_PROVIDER.name)}</strong><div class="provider-contact-lines"><p>${escapeHtml(t("providerOffice"))}</p><p>${escapeHtml(t("providerPhone"))}</p><p>${escapeHtml(t("providerEmail"))}</p><p>${escapeHtml(t("providerTelebirr"))}: <span class="account-number">${escapeHtml(SERVICE_PROVIDER.telebirr)}</span></p></div></div>
      <dl class="bank-details-card"><dt class="doc-label">${escapeHtml(t("providerBank"))}</dt><dd class="bank-account-holder"><span class="doc-label">${escapeHtml(t("bankAccountHolder"))}</span><strong>${escapeHtml(SERVICE_PROVIDER.accountHolder)}</strong></dd>${bankRows}</dl>
    </div></section>
    <section class="agreement-clients"><h4>${escapeHtml(t("clientDetails"))}</h4><div class="party-grid">
      <div><div class="doc-label">${escapeHtml(t("contractGroomName"))}</div><div class="doc-value">${detail(d.groomName, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("contractBrideName"))}</div><div class="doc-value">${detail(d.brideName, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("groomPhone"))}</div><div class="doc-value">${detail(d.groomPhone, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("bridePhone"))}</div><div class="doc-value">${detail(d.bridePhone, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("groomAddress"))}</div><div class="doc-value">${detail(d.groomAddress, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("brideAddress"))}</div><div class="doc-value">${detail(d.brideAddress, "____________________________")}</div></div>
    </div></section>
    <section class="agreement-event"><h4>${escapeHtml(t("eventDetails"))}</h4><div class="agreement-details-grid">
      <div><div class="doc-label">${escapeHtml(t("weddingDateAgreement"))}</div><div class="doc-value">${escapeHtml(formatDateForDocument(d.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("mealProgramAgreement"))}</div><div class="doc-value">${escapeHtml(formatMealProgram())}</div></div>
      <div class="event-venues-document"><div class="doc-label">${escapeHtml(t("eventVenuesAgreement"))}</div>${eventVenueRows}</div>
    </div></section>
    <section class="agreed-services"><h3>2. ${escapeHtml(t("contractScopeTitle"))}</h3><p>${escapeHtml(t("agreedIntro"))}</p><ul class="contract-package-list">${packageRows}</ul><p class="checklist-heading">📋 ${escapeHtml(t("servicesChecklistTitle"))}</p></section>
    ${servicePartsMarkup()}
    <section class="contract-clause" data-contract-clause="1"><h3>3. ${escapeHtml(t("termsHeading"))}</h3><h4>1. ${escapeHtml(t("vendorHeading"))}</h4><p>${escapeHtml(t("vendorScope"))}</p></section>
    <section class="contract-clause" data-contract-clause="2"><h4>2. ${escapeHtml(t("providerResponsibilityHeading"))}</h4><p>${escapeHtml(t("providerResponsibility"))}</p></section>
    <section class="contract-clause" data-contract-clause="3"><h4>3. ${escapeHtml(t("clientResponsibilityHeading"))}</h4><p>${escapeHtml(t("clientResponsibility"))}</p></section>
    <section class="contract-clause" data-contract-clause="4"><h4>4. ${escapeHtml(t("paymentTerms"))}</h4><p>${escapeHtml(t("financialIntro"))} <strong>${escapeHtml(formatMoney(total))}</strong>.</p><div class="payment-stage-list">
      <div class="payment-stage"><div><strong>${escapeHtml(t("advancePayment"))}</strong><small>${escapeHtml(t("advanceTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.advance))}</b></div>
      <div class="payment-stage"><div><strong>${escapeHtml(t("midtermPayment"))}</strong><small>${escapeHtml(t("midtermTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.midterm))}</b></div>
      <div class="payment-stage"><div><strong>${escapeHtml(t("finalPayment"))}</strong><small>${escapeHtml(t("finalTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.final))}</b></div>
    </div><p>${escapeHtml(t("bankOnly"))}</p></section>
    <section class="contract-clause" data-contract-clause="5"><h4>5. ${escapeHtml(t("changesHeading"))}</h4><p>${escapeHtml(t("scopeChanges"))}</p><p>${escapeHtml(t("forceMajeure"))}</p><p>${escapeHtml(t("cancellationTerms"))}</p></section>
    <section class="contract-clause" data-contract-clause="6"><h4>6. ${escapeHtml(t("mediaTermsHeading"))}</h4>${["yes", "no"].map(consent => `<div class="agreement-consent" data-consent-option="${consent}"><span class="contract-checkbox${d.mediaConsent === consent ? " is-checked" : ""}" role="img" aria-label="${escapeHtml(d.mediaConsent === consent ? t("selectedOption") : t("unselectedOption"))}">${d.mediaConsent === consent ? "✓" : ""}</span><p>${escapeHtml(t(consent === "yes" ? "mediaTermsYes" : "mediaTermsNo"))}</p></div>`).join("")}</section>
    <section class="contract-clause" data-contract-clause="7"><h4>7. ${escapeHtml(t("amendmentsHeading"))}</h4><p>${escapeHtml(t("amendmentsTerms"))}</p></section>
    ${d.generalNotes ? `<section><h3>${escapeHtml(t("reviewNotes"))}</h3><p>${escapeHtml(d.generalNotes)}</p></section>` : ""}
    <section class="agreement-signatures"><h3>4. ${escapeHtml(t("signatureHeading"))}</h3><p>${escapeHtml(t("signatureIntro"))}</p><div class="signature-grid">
      <div class="signature-block signature-block-provider"><div class="doc-label">${escapeHtml(t("providerSignature"))}</div><strong class="signature-name">${escapeHtml(localized(SERVICE_PROVIDER.signatory))}</strong>${signatureLines}</div>
      <div class="signature-clients-label doc-label">${escapeHtml(t("clientSignatures"))}</div>
      <div class="signature-block"><div class="doc-label">${escapeHtml(t("contractGroomName"))}</div><strong class="signature-name">${detail(d.groomName, "____________________")}</strong>${signatureLines}</div>
      <div class="signature-block"><div class="doc-label">${escapeHtml(t("contractBrideName"))}</div><strong class="signature-name">${detail(d.brideName, "____________________")}</strong>${signatureLines}</div>
    </div></section>
    <div class="agreement-footer"><strong>MATRIMONY BY HANNA</strong><div class="agreement-footer-contact">+251 95 391 4487 · www.matrimonybyhanna.com<br />Hanna@matrimonybyhanna.com<br />Yeshi Building, In Front Of Bole Printing, 2nd Floor, Office No 11<br />${escapeHtml(t("agreementFooter"))}</div></div>
  </article>`;
  paginateAgreement(container, referenceNumber, agreementDate);
}

function renderProforma() {
  const container = document.getElementById("proformaDocument");
  if (!container) return;
  const details = state.details;
  const selected = selectedServices();
  const total = Number(details.totalFee) || 0;
  const issueDate = formatDateForDocument(dateInputValue());
  const reference = documentReference("PF");

  container.innerHTML = `<article class="agreement-paper proforma-paper">
    <div class="agreement-kicker">MATRIMONY BY HANNA <span aria-hidden="true">·</span> ${escapeHtml(t("proformaEyebrow"))}</div>
    <h2 class="agreement-title">${escapeHtml(t("proformaDocumentTitle"))}<span>${escapeHtml(t("proformaDescription"))}</span></h2>
    <div class="proforma-couple"><div class="doc-label">${escapeHtml(t("proformaPreparedFor"))}</div><strong>${detail(details.brideName)} <span>&amp;</span> ${detail(details.groomName)}</strong></div>
    <div class="proforma-facts">
      <div><div class="doc-label">${escapeHtml(t("weddingDate"))}</div><div class="doc-value">${escapeHtml(formatDateForDocument(details.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventDays"))}</div><div class="doc-value">${escapeHtml(details.eventDays || "1")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("mealProgramAgreement"))}</div><div class="doc-value">${escapeHtml(formatMealProgram())}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventVenues"))}</div><div class="doc-value">${escapeHtml(eventVenueSummary())}</div></div>
    </div>
    <section class="proforma-items"><h3>${escapeHtml(t("proformaScope"))}</h3></section>
    ${servicePartsMarkup({ onlyChosen:true, listClass:"proforma-service-list", itemClass:"proforma-item" })}
    <div class="proforma-closing">
    <section class="proforma-totals" aria-label="${escapeHtml(t("proformaTotal"))}">
      <div class="proforma-total-banner"><span>${escapeHtml(t("proformaTotal"))}</span><strong>${escapeHtml(formatMoney(total))}</strong></div>
    </section>
    <section class="proforma-gratitude"><h3>${escapeHtml(state.lang === "am" ? "እናመሰግናለን" : "With gratitude")}</h3><p>${escapeHtml(t("proformaThanks"))}</p></section>
    <p class="proforma-note">${escapeHtml(t("proformaNote"))}</p>
    </div>
  </article>`;
  paginateAgreement(container, reference, issueDate);
}

function paginateAgreement(container, reference, date) {
  const source = container.querySelector('.agreement-paper');
  const isProforma = source.classList.contains("proforma-paper");
  source.querySelectorAll('.contract-letterhead, .contract-rule, .agreement-footer').forEach(node => node.remove());
  const blocks = Array.from(source.children);
  container.replaceChildren();
  const printLetterhead = document.createElement('div');
  printLetterhead.className = 'print-letterhead-fixed';
  printLetterhead.innerHTML = `<img src="./assets/letterhead-page1.png" alt="" /><div class="print-letterhead-values"><span>${escapeHtml(reference)}</span><span>${escapeHtml(date)}</span></div>`;
  container.append(printLetterhead);
  let body;
  let pageNumber = 0;
  const newPage = () => {
    const page = document.createElement('article');
    page.className = `agreement-paper letterhead-sheet${source.classList.contains("proforma-paper") ? " proforma-paper" : ""}`;
    page.innerHTML = `<img class="letterhead-art" src="./assets/letterhead-page1.png" alt="Matrimony By Hanna letterhead" />
      <div class="letterhead-values"><span>${escapeHtml(reference)}</span><span>${escapeHtml(date)}</span></div>
      <div class="sheet-content"></div><div class="sheet-number">${++pageNumber}</div>`;
    container.append(page);
    body = page.querySelector('.sheet-content');
  };
  const fits = (reserve = 0) => {
    if (!isProforma) return body.scrollHeight <= body.clientHeight + 1;
    const last = body.lastElementChild;
    // Screen measurements include the large-screen scale (--ui-zoom); compare in layout pixels.
    const scale = body.getBoundingClientRect().height / body.clientHeight || 1;
    return !last || (last.getBoundingClientRect().bottom - body.getBoundingClientRect().top) / scale <= body.clientHeight - reserve;
  };
  newPage();
  for (const block of blocks) {
    if (isProforma && block.querySelector('ul.proforma-service-list')) {
      const list = block.querySelector('ul.proforma-service-list');
      const items = Array.from(list.children);
      list.replaceChildren();
      body.append(block);
      if (!fits()) {
        block.remove();
        newPage();
        body.append(block);
      }
      let currentList = list;
      for (const item of items) {
        currentList.append(item);
        if (fits(135)) continue;
        item.remove();
        const continuation = block.cloneNode(true);
        continuation.querySelector('ul.proforma-service-list').replaceChildren();
        newPage();
        body.append(continuation);
        currentList = continuation.querySelector('ul.proforma-service-list');
        currentList.append(item);
      }
      continue;
    }
    body.append(block);
    if (fits()) continue;
    block.remove();
    if (body.children.length) newPage();
    body.append(block);
    if (fits()) continue;
    // Long service lists can span pages; keep each individual selection intact.
    const lists = Array.from(block.querySelectorAll('ol, ul'));
    const list = lists.sort((a, b) => b.children.length - a.children.length)[0];
    if (!list) continue;
    const listSelector = list.matches('.agreed-services-list')
      ? '.agreed-services-list'
      : `${list.tagName.toLowerCase()}${list.classList.length ? `.${Array.from(list.classList).join('.')}` : ''}`;
    const items = Array.from(list.children);
    list.replaceChildren();
    let currentList = list;
    for (const item of items) {
      currentList.append(item);
      if (fits()) continue;
      item.remove();
      const continuation = block.cloneNode(true);
      const continuationList = continuation.querySelector(listSelector);
      continuationList?.replaceChildren();
      if (list.matches('.agreed-services-list')) continuation.querySelector('.contract-package-list')?.remove();
      continuation.querySelectorAll('p').forEach(node => node.remove());
      newPage();
      body.append(continuation);
      currentList = continuationList;
      if (currentList.tagName === 'OL') currentList.start = items.indexOf(item) + 1;
      currentList.append(item);
    }
  }
  container.querySelectorAll('.sheet-number').forEach(number => number.textContent = `${number.textContent} / ${pageNumber}`);
}

function documentReference(kind) {
  if (state.blankDocument) return `MBH-${kind}-________`;
  const key = `${state.details.brideName || ""}|${state.details.groomName || ""}`;
  let hash = 0;
  for (const character of key) hash = ((hash << 5) - hash + character.codePointAt(0)) >>> 0;
  return `MBH-${kind}-${state.recordId || hash.toString(36).toUpperCase().slice(0, 6)}-${(state.details.weddingDate || dateInputValue()).replace(/-/g, "")}`;
}

async function prepareDocument(kind) {
  const job = ++documentJob;
  const container = document.getElementById(kind === "proforma" ? "proformaDocument" : "agreementDocument");
  container.setAttribute("aria-busy", "true");
  try {
    await Promise.all([document.fonts.load('14px "Matrimony Helvetica"'), document.fonts.load('14px "Ethiopic Sadiss"', "ሀና"), document.fonts.load('700 20px "Benaiah"', "ሀና")]);
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (job !== documentJob) return null;
    if (kind === "proforma") renderProforma(); else renderAgreement();
    await Promise.all(Array.from(container.querySelectorAll("img")).map(img => img.decode()));
    const overflow = Array.from(container.querySelectorAll('.sheet-content')).some(body => body.scrollHeight > body.clientHeight + 3);
    if (overflow) {
      const summary = document.getElementById('validationSummary');
      summary.textContent = t('documentTooLong');
      summary.hidden = false;
      return null;
    }
    return container;
  } catch (error) {
    console.error("Document preparation failed", error);
    showToast(t("documentFailed"));
    return null;
  } finally {
    container.removeAttribute("aria-busy");
  }
}

const LOCAL_RECORDS_KEY = "matrimony-saved-records-v1";
function getLocalRecords() {
  try { return JSON.parse(localStorage.getItem(LOCAL_RECORDS_KEY) || "[]"); } catch { return []; }
}
function setLocalRecords(list) {
  try { localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(list)); } catch {}
}

async function recordsRequest(path, options) {
  const { requireRemote = false, ...requestOptions } = options || {};
  let response;
  let networkFailed = false;
  try {
    response = await fetch(`/api/records${path}`, {
      ...requestOptions,
      signal: AbortSignal.timeout(12000),
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) }
    });
    if (response.status === 404) networkFailed = true;
  } catch (err) {
    networkFailed = true;
  }

  if (networkFailed) {
    if (requireRemote) throw new Error(state.lang === "am" ? "ወደ ዕቅዱ ለመቀጠል መዝገቡ በአገልጋዩ መቀመጥ አለበት። እንደገና ይሞክሩ።" : "The questionnaire could not be saved to the server. Try again to continue to the planner.");
    const local = getLocalRecords();
    const id = path ? Number(path.replace(/^\//, "")) : null;
    const method = options?.method || "GET";
    if (method === "GET") {
      if (id) {
        const item = local.find(r => r.id === id);
        if (!item) throw new Error(t("recordUnavailable"));
        return { id: item.id, plan: item };
      }
      return {
        records: local.map(r => ({
          id: r.id,
          bride_name: r.details?.brideName || "",
          groom_name: r.details?.groomName || "",
          bride_first_name: firstName(r.details?.brideName),
          groom_first_name: firstName(r.details?.groomName),
          wedding_date: r.details?.weddingDate || ""
        }))
      };
    }
    if (method === "POST" || method === "PUT") {
      const plan = JSON.parse(options.body);
      const savedId = id || (local.length ? Math.max(...local.map(r => r.id)) + 1 : 1);
      const existingIdx = local.findIndex(r => r.id === savedId);
      const record = { ...plan, id: savedId, updatedAt: new Date().toISOString() };
      if (existingIdx >= 0) local[existingIdx] = record;
      else local.unshift(record);
      setLocalRecords(local);
      return { id: savedId };
    }
    if (method === "DELETE") {
      const next = local.filter(r => r.id !== id);
      setLocalRecords(next);
      return { deleted: true };
    }
  }

  let result;
  try { result = await response.json(); } catch { throw new Error(t("recordUnavailable")); }
  if (!response.ok) throw new Error(result.error || t("recordUnavailable"));
  return result;
}

function renderRecords() {
  const list = document.getElementById("recordsList");
  if (!list) return;
  document.getElementById("recordsCount").textContent = state.records.length;
  const query = document.getElementById("recordsSearch")?.value.trim() || "";
  const matches = searchRecords(query);
  if (!matches.length) {
    list.innerHTML = `<div class="records-empty">${escapeHtml(t(state.records.length ? "recordsNoMatches" : "recordsEmpty"))}</div>`;
    return;
  }
  list.innerHTML = matches.map(({ record, detail }) => `<article class="record-card">
    <div class="record-mark" aria-hidden="true">∞</div>
    <div class="record-main"><h2>${highlightMatch(record.search?.bride_name || record.bride_first_name, query)} <span>&amp;</span> ${highlightMatch(record.search?.groom_name || record.groom_first_name, query)}</h2>
      <p>${escapeHtml(t("weddingDate"))}: ${escapeHtml(formatDate(record.wedding_date))}${record.search?.phones?.length ? ` · ${highlightMatch(record.search.phones.join(" / "), query)}` : ""}</p>${searchDetailMarkup(detail, query)}</div>
    <button class="button button-quiet" type="button" data-open-record="${record.id}">${escapeHtml(t("openRecord"))}${iconUse("open")}</button>
  </article>`).join("");
}

async function loadRecords() {
  if (PORTAL) return;
  const list = document.getElementById("recordsList");
  list.innerHTML = `<div class="records-empty">${escapeHtml(state.lang === "am" ? "በመጫን ላይ…" : "Loading records…")}</div>`;
  try {
    state.records = (await recordsRequest("")).records;
    renderRecords();
    renderCoupleContext();
  } catch (error) {
    list.innerHTML = `<div class="records-empty">${escapeHtml(t("recordUnavailable"))}</div>`;
  }
}

function saveRecord(options = {}) {
  recordSavePromise = recordSavePromise.then(() => persistRecord(options), () => persistRecord(options));
  return recordSavePromise;
}

async function persistRecord({ silent = false, requireRemote = false } = {}) {
  if (PORTAL) return;
  if (savingRecord) return;
  syncDetailsFromForm();
  if (!state.details.brideName?.trim() || !state.details.groomName?.trim()) {
    if (!silent) showValidation([{id:"brideName", message:t("nameRequired")}, {id:"groomName", message:t("nameRequired")}].filter(error => !state.details[error.id]?.trim()), 0);
    return;
  }
  savingRecord = true;
  recordStatus = "recordSaving";
  renderCoupleContext();
  document.querySelectorAll("[data-open-record], #resetDraftButton").forEach(button => button.disabled = true);
  const signature = planSignature();
  const id = state.recordId;
  try {
    const result = await recordsRequest(id ? `/${id}` : "", {
      method: id ? "PUT" : "POST",
      body: signature,
      requireRemote
    });
    state.recordId = result.id;
    savedPlanSignature = signature;
    recordStatus = planSignature() === signature ? "recordReady" : "recordDirty";
    saveDraft(false);
    try { state.records = (await recordsRequest("")).records; } catch { /* The record was saved even if refreshing the list fails. */ }
    renderRecords();
    if (!silent) showToast(t("recordSaved"));
    return result;
  } catch (error) {
    recordStatus = "localOnly";
    if (!silent) showToast(error.message || t("recordUnavailable"));
    if (requireRemote) throw error;
  } finally {
    savingRecord = false;
    document.querySelectorAll("[data-open-record], #resetDraftButton").forEach(button => button.disabled = false);
    renderCoupleContext();
    if (recordStatus === "recordDirty") scheduleAutoSave();
  }
}

async function openRecord(id, { step = 0 } = {}) {
  if (savingRecord || exportingPdf || openingRecord) return;
  openingRecord = true;
  document.querySelector('.app-shell').inert = true;
  try {
    const result = await recordsRequest(`/${id}`);
    state.recordId = result.id;
    state.lang = result.plan.lang === "am" ? "am" : "en";
    state.details = result.plan.details || {};
    if (!state.details.eventDays) state.details.eventDays = "1";
    if (!state.details.mediaConsent) state.details.mediaConsent = "no";
    normalizeEventVenues();
    state.services = result.plan.services || {};
    normalizeServices();
    savedPlanSignature = planSignature();
    recordStatus = "recordReady";
    fieldIds.forEach(field => { document.getElementById(field).value = state.details[field] ?? ""; });
    syncEventVenueChoicesToForm();
    syncContractChoicesToForm();
    syncMealChoicesToForm();
    applyLocalization();
    clearValidation();
    setStep(step);
    saveDraft(false);
    window.dispatchEvent(new Event("plan-ui-update"));
    showToast(t("recordOpened"));
    return result;
  } catch (error) {
    showToast(error.message || t("recordUnavailable"));
  } finally {
    openingRecord = false;
    document.querySelector('.app-shell').inert = false;
  }
}

// Panels keep their original ids. Pricing (6) shows third, the proposal (3) comes before the
// agreement (2), and the Plan tab (5, the wedding planning workspace) is last. Records (4) is
// opened from the sidebar and search rather than the step track.
const STEP_ORDER = [0, 1, 6, 3, 2, 5];
const stepPosition = step => STEP_ORDER.indexOf(Number(step));
// Plan stays hidden until the planning service is available, so only visible steps are counted.
const visibleSteps = () => STEP_ORDER.filter(step => !document.querySelector(`.workflow-nav [data-step-target="${step}"]`)?.hidden);

function updateStepCount() {
  const stepCount = document.getElementById("workflowStepCount");
  if (!stepCount) return;
  const steps = visibleSteps();
  const position = steps.indexOf(state.currentStep || 0);
  if (position < 0) { stepCount.textContent = t(state.currentStep === 7 ? "portalSent" : "navRecords"); return; }
  const step = String(position + 1).padStart(2, "0");
  const total = String(steps.length).padStart(2, "0");
  stepCount.textContent = state.lang === "am" ? `ደረጃ ${step} ከ ${total}` : `Step ${step} of ${total}`;
}

function setStep(step) {
  if (exportingPdf) return;
  clearValidation();
  syncDetailsFromForm();
  state.currentStep = Number(step);
  document.querySelectorAll(".step-panel").forEach((panel) => panel.classList.toggle("is-active", Number(panel.dataset.step) === state.currentStep));
  document.querySelectorAll(".step-link").forEach((link) => {
    const target = Number(link.dataset.stepTarget);
    link.classList.toggle("is-active", target === state.currentStep);
    link.classList.toggle("is-complete", stepPosition(target) >= 0 && stepPosition(target) < stepPosition(state.currentStep));
  });
  document.querySelectorAll(".workflow-nav [data-step-target]").forEach(button => {
    const active = Number(button.dataset.stepTarget) === state.currentStep;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  updateStepCount();
  revealActiveStep();
  window.dispatchEvent(new Event("plan-step-change"));
  if (state.currentStep === 1) renderServices();
  if (state.currentStep === 2) {
    prepareDocument("agreement");
    saveRecord({ silent: true });
  }
  if (state.currentStep === 3) {
    prepareDocument("proforma");
    saveRecord({ silent: true });
  }
  if (state.currentStep === 4) loadRecords();
  if (state.currentStep === 5) loadPortalRequests();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearValidation() {
  document.querySelectorAll(".field-error").forEach(error => error.remove());
  document.querySelectorAll('[aria-invalid="true"]').forEach(input => {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  });
  document.getElementById("validationSummary").hidden = true;
}

function showValidation(errors, step) {
  if (step === 1) {
    state.serviceSearch = "";
    state.serviceFilter = "all";
    document.getElementById("serviceSearch").value = "";
    document.getElementById("serviceFilter").value = "all";
  }
  setStep(step);
  const summary = document.getElementById("validationSummary");
  summary.hidden = false;
  summary.innerHTML = `<strong>${escapeHtml(t("fixFields"))}</strong><ul>${errors.map(error => `<li>${escapeHtml(error.label || (error.id ? t(error.id) : ""))}${error.label || error.id ? ": " : ""}${escapeHtml(error.message)}</li>`).join("")}</ul>`;
  let first;
  errors.forEach((error, index) => {
    const input = error.id ? document.getElementById(error.id) : null;
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    const message = document.createElement("small");
    message.id = `field-error-${index}`;
    message.className = "field-error";
    message.textContent = error.message;
    input.setAttribute("aria-describedby", message.id);
    input.closest(".field")?.append(message);
    first ||= input;
  });
  window.dispatchEvent(new Event("plan-ui-update"));
  requestAnimationFrame(() => {
    const focusTarget = first?.closest(".picker-control")?.querySelector(".picker-trigger") || first;
    focusTarget?.focus({ preventScroll: true });
    summary.scrollIntoView({ block: "start", behavior: "smooth" });
  });
  return false;
}

function validateBeforeAgreement() {
  syncDetailsFromForm();
  clearValidation();
  const errors = [];
  for (const id of ["brideName", "groomName"]) if (!state.details[id]?.trim()) errors.push({ id, message: t("nameRequired") });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(state.details.weddingDate || "") || Number.isNaN(new Date(`${state.details.weddingDate}T12:00:00`).getTime())) errors.push({ id:"weddingDate", message:t("dateRequired") });
  const days = Number(state.details.eventDays);
  if (!Number.isInteger(days) || days < 1 || days > 365) errors.push({ id:"eventDays", message:t("daysRequired") });
  if (errors.length) return showValidation(errors, 0);
  if (!selectedServices().length) return showValidation([{ message:t("noServicesWarning") }], 1);
  // The agreed fee has its own Pricing step.
  if (state.details.totalFee === "" || state.details.totalFee === undefined || state.details.totalFee === null) {
    return showValidation([{ id:"totalFee", message:t("totalFeeRequired") }], 6);
  }
  if (!hasValidPrice(state.details.totalFee)) return showValidation([{ id:"totalFee", message:t("amountInvalid") }], 6);
  return true;
}

function validateBeforeProforma() {
  return validateBeforeAgreement();
}

function toggleService(serviceId) {
  const serviceState = getServiceState(serviceId);
  serviceState.selected = !serviceState.selected;
  if (serviceState.selected && !serviceState.responsibility) serviceState.responsibility = "planning";
  saveDraft();
  renderServices();
}

function updateServiceOption(target) {
  const serviceId = target.dataset.serviceId;
  const optionId = target.dataset.optionId;
  if (!serviceId || !optionId) return;
  const serviceState = getServiceState(serviceId);
  if (target.dataset.toggle === "true") {
    serviceState.options[optionId] = target.checked;
  } else if (target.type === "checkbox" && target.dataset.optionValue) {
    const values = Array.isArray(serviceState.options[optionId]) ? [...serviceState.options[optionId]] : [];
    if (target.checked && !values.includes(target.dataset.optionValue)) values.push(target.dataset.optionValue);
    if (!target.checked) serviceState.options[optionId] = values.filter((value) => value !== target.dataset.optionValue);
    else serviceState.options[optionId] = values;
  } else {
    serviceState.options[optionId] = target.value;
  }
  saveDraft();
}

async function clearDraft() {
  if (savingRecord || exportingPdf) return;
  clearTimeout(autoSaveTimer);
  syncDetailsFromForm();
  // Plans with both names are saved before clearing; ask only when unsaved details would be lost.
  const named = state.details.brideName?.trim() && state.details.groomName?.trim();
  const filled = value => value === true || ((typeof value === "string" || typeof value === "number") && String(value).trim() !== "");
  const hasContent = Object.entries(state.details).some(([key, value]) => !["eventDays", "mediaConsent"].includes(key) && filled(value))
    || Object.values(state.services).some(service => service?.selected);
  if (!named && hasContent && !window.confirm(state.lang === "am" ? "ይህን ረቂቅ ማጥፋት ይፈልጋሉ?" : "Clear this plan and start a new one?")) return;
  if (state.details.brideName?.trim() && state.details.groomName?.trim() && planSignature() !== savedPlanSignature) await saveRecord({ silent: true });
  localStorage.removeItem(STORAGE_KEY);
  state.details = {};
  normalizeEventVenues();
  state.services = {};
  state.recordId = null;
  savedPlanSignature = "";
  recordStatus = "newPlan";
  fieldIds.forEach((id) => { const element = document.getElementById(id); if (element) element.value = ""; });
  document.getElementById("eventDays").value = "1";
  state.details.eventDays = "1";
  state.details.mediaConsent = "no";
  syncEventVenueChoicesToForm();
  syncContractChoicesToForm();
  updateBalance();
  renderServices();
  clearValidation();
  setStep(0);
  window.dispatchEvent(new Event("plan-ui-update"));
  showToast(t("draftReset"));
}

async function printDocument(kind) {
  if (exportingPdf || !(kind === "proforma" ? validateBeforeProforma() : validateBeforeAgreement())) return;
  const container = await prepareDocument(kind);
  if (!container) return;
  const panel = document.getElementById(kind === "proforma" ? "step-proforma" : "step-agreement");
  const printLetterhead = panel.querySelector('.print-letterhead-fixed');
  document.body.prepend(printLetterhead);
  panel.classList.add("is-print-target");
  document.body.classList.add("print-mode");
  showToast(t("printHint"));
  const previousTitle = document.title;
  const couple = `${state.details.brideName || "Bride"} & ${state.details.groomName || "Groom"}`;
  document.title = `${kind === "proforma" ? "Proposal" : "Service Agreement"} - ${couple} - Matrimony By Hanna`;
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode');
    panel.classList.remove('is-print-target');
    panel.querySelector('.agreement-document').prepend(printLetterhead);
    document.title = previousTitle;
  }, { once: true });
  window.print();
}

// Renders the letterhead pages into a jsPDF document; shared by download and share.
async function buildPdf(kind) {
  if (!window.html2canvas || !window.jspdf?.jsPDF) throw new Error("PDF libraries unavailable");
  const container = await prepareDocument(kind);
  if (!container) throw new Error("Document preparation failed");
  // A desktop-sized snapshot isolates export from mobile layout and later form edits.
  const stage = document.createElement("div");
  stage.className = "pdf-export-stage";
  try {
    const pages = Array.from(container.querySelectorAll(".letterhead-sheet"), sheet => sheet.cloneNode(true));
    const letterhead = container.querySelector('.letterhead-art');
    document.body.append(stage);
    const pdf = new window.jspdf.jsPDF({ orientation:"portrait", unit:"mm", format:"a4", compress:true });
    const couple = `${firstName(state.details.brideName)} & ${firstName(state.details.groomName)}`;
    const title = `${kind === "proforma" ? "Proposal" : "Service Agreement"} - ${couple}`;
    pdf.setProperties({ title, author:"Matrimony By Hanna", subject:documentReference(kind === "proforma" ? "PF" : "AG") });
    for (let index = 0; index < pages.length; index++) {
      // Isolate each sheet at the same origin. Off-viewport sibling sheets can
      // cause a DOM renderer to clip image layers on intermediate pages.
      stage.replaceChildren(pages[index]);
      pages[index].querySelector('.letterhead-art').remove();
      pages[index].style.background = 'transparent';
      const content = pages[index].querySelector(".sheet-content");
      if (content.scrollHeight > content.clientHeight + 3) throw new Error("Document content exceeds the letterhead safe area. Shorten the longest notes and retry.");
      const canvas = await window.html2canvas(pages[index], { scale:3, backgroundColor:null, logging:false, windowWidth:1280, windowHeight:1200, scrollX:0, scrollY:0 });
      if (index) pdf.addPage("a4", "portrait");
      // The brand layer is embedded explicitly, never dependent on print settings
      // or the DOM screenshot renderer. Reuse the full-resolution source image.
      pdf.addImage(letterhead, "PNG", 0, 0, 210, 297, "matrimony-letterhead", "FAST");
      pdf.addImage(canvas, "PNG", 0, 0, 210, 297, `content-${index}`, "FAST");
      canvas.width = canvas.height = 1;
    }
    const filename = `Matrimony-${kind === "proforma" ? "Proposal" : "Agreement"}-${couple.replace(/[<>:"/\|?*]/g, "").trim()}-${state.details.weddingDate}.pdf`;
    return { pdf, filename, title };
  } finally {
    stage.remove();
  }
}

async function runPdfAction(kind, button, action) {
  if (exportingPdf || !(kind === "proforma" ? validateBeforeProforma() : validateBeforeAgreement())) return;
  exportingPdf = true;
  const buttons = document.querySelectorAll("[data-download-pdf], [data-share-pdf], #printAgreementButton, #printProformaButton");
  buttons.forEach(item => item.disabled = true);
  const label = button.querySelector("span:last-child");
  const previousLabel = label.textContent;
  label.textContent = t("pdfPreparing");
  try {
    await action(await buildPdf(kind));
  } catch (error) {
    console.error("PDF export failed", error);
    showToast(t("pdfFailed"));
  } finally {
    exportingPdf = false;
    buttons.forEach(item => item.disabled = false);
    label.textContent = previousLabel;
  }
}

function downloadDocument(kind, button = document.querySelector(`[data-download-pdf="${kind}"]`)) {
  return runPdfAction(kind, button, async ({ pdf, filename }) => {
    pdf.save(filename);
    showToast(t("pdfReady"));
  });
}

// A shared PDF waits here when building it outlasts the click that started the share;
// browsers only open the share sheet from a fresh tap, so the next tap shares it instantly.
let pendingShare = null;

async function openShareSheet(file, title, text = t("shareText")) {
  try {
    await navigator.share({ files:[file], title, text });
    pendingShare = null;
    return true;
  } catch (error) {
    if (error.name === "AbortError") { pendingShare = null; return true; }
    if (error.name === "NotAllowedError") return false;
    throw error;
  }
}

function setShareReady(ready) {
  document.querySelectorAll("[data-share-pdf]").forEach(button => {
    button.classList.toggle("is-ready", ready);
    button.querySelector("span:last-child").textContent = t(ready ? "shareReady" : "shareProforma");
  });
}

async function shareDocument(kind, button) {
  const signature = `${kind}|${state.lang}|${planSignature()}`;
  if (pendingShare?.signature === signature) {
    const { file, title } = pendingShare;
    setShareReady(false);
    return openShareSheet(file, title).catch(error => { console.error("Share failed", error); showToast(t("pdfFailed")); });
  }
  setShareReady(false);
  let needsTap = false;
  await runPdfAction(kind, button, async ({ pdf, filename, title }) => {
    const file = new File([pdf.output("blob")], filename, { type:"application/pdf" });
    if (!navigator.canShare?.({ files:[file] })) {
      // No file sharing in this browser (most desktops): save it so it can be attached anywhere.
      pdf.save(filename);
      showToast(t("shareFallback"));
      return;
    }
    pendingShare = { file, title, signature };
    needsTap = !await openShareSheet(file, title);
  });
  if (needsTap) {
    setShareReady(true);
    showToast(t("shareTapAgain"));
  }
}

/* ── Blank documents ──────────────────────────────────────────────── */
// Unfilled agreement and proposal on the letterhead, with write-in lines, in either language.
function openBlankDocumentDialog(kind) {
  const dialog = document.getElementById("blankDocDialog");
  dialog.dataset.kind = kind;
  showBlankShareView(false);
  document.getElementById("blankDocHeading").textContent = t(kind === "proforma" ? "blankDownloadProposal" : "blankDownloadAgreement");
  dialog.querySelectorAll("[data-blank-lang]").forEach(button => button.classList.toggle("is-current", button.dataset.blankLang === state.lang));
  dialog.showModal();
  dialog.querySelector(`[data-blank-lang="${state.lang}"]`)?.focus();
}

// What the document renderers see while a blank form is produced.
const blankDocumentState = lang => ({ lang, services:{}, recordId:null, blankDocument:true,
  details:{ eventDays:BLANK, mealProgram:[], eventVenueTypes:[], venues:{}, locations:{}, mediaConsent:"" } });

async function downloadBlankDocument(kind, lang, button) {
  if (exportingPdf) return;
  exportingPdf = true;
  const snapshot = { lang:state.lang, details:state.details, services:state.services, recordId:state.recordId };
  const panel = document.getElementById(kind === "proforma" ? "step-proforma" : "step-agreement");
  const buttons = document.querySelectorAll("[data-blank-lang]");
  buttons.forEach(item => item.disabled = true);
  const label = button.textContent;
  button.textContent = t("pdfPreparing");
  let saved = false;
  try {
    Object.assign(state, blankDocumentState(lang));
    // Amharic documents need the Ethiopic fonts, which follow the page language.
    document.documentElement.lang = lang;
    // Pages are split by measuring them, so lay the document step out off-screen when it is not the open one.
    panel.classList.add("is-measuring");
    const { pdf } = await buildPdf(kind);
    const filename = `Matrimony-Blank-${kind === "proforma" ? "Proposal" : "Agreement"}-${lang.toUpperCase()}.pdf`;
    pdf.save(filename);
    blankShare = { file:new File([pdf.output("blob")], filename, { type:"application/pdf" }), kind, lang };
    saved = true;
  } catch (error) {
    console.error("Blank document failed", error);
  } finally {
    Object.assign(state, snapshot, { blankDocument:false });
    panel.classList.remove("is-measuring");
    document.documentElement.lang = state.lang;
    exportingPdf = false;
    buttons.forEach(item => item.disabled = false);
    button.textContent = label;
    if (state.currentStep === 2 || state.currentStep === 3) prepareDocument(state.currentStep === 3 ? "proforma" : "agreement");
    if (saved) offerBlankShare(); else showToast(t("pdfFailed"));
  }
}

// After a blank form downloads, the dialog turns into share options for it.
let blankShare = null;

function showBlankShareView(show) {
  const dialog = document.getElementById("blankDocDialog");
  dialog.querySelector("form").hidden = show;
  dialog.querySelector(".blank-doc-share").hidden = !show;
}

function blankDocName() {
  return t(blankShare.kind === "proforma" ? "blankProposalName" : "blankAgreementName");
}

function offerBlankShare() {
  const canShareFile = Boolean(navigator.canShare?.({ files:[blankShare.file] }));
  const text = t("blankShareText").replace("{doc}", blankDocName());
  document.getElementById("blankShareText").textContent = t(canShareFile ? "blankSavedText" : "blankSavedAttach").replace("{doc}", blankDocName());
  document.querySelector("[data-share-blank]").hidden = !canShareFile;
  // Without file sharing, the chats open ready for the downloaded PDF to be attached.
  document.getElementById("blankShareChannels").innerHTML = shareChannelsMarkup({ text, subject:text }, ["whatsapp", "telegram", "email"]);
  showBlankShareView(true);
  // The share sheet opens straight away while the download click still counts as a tap; otherwise Share PDF opens it.
  if (canShareFile) shareBlankDocument();
}

function shareBlankDocument() {
  if (!blankShare) return;
  const text = t("blankShareText").replace("{doc}", blankDocName());
  openShareSheet(blankShare.file, blankShare.file.name, text).catch(error => { console.error("Share failed", error); showToast(t("pdfFailed")); });
}

/* ── Sending links and files ──────────────────────────────────────── */
// Ethiopian numbers typed locally (09…, 07…) become international for WhatsApp and SMS.
function internationalPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (/^0[79]\d{8}$/.test(digits)) digits = `251${digits.slice(1)}`;
  if (/^[79]\d{8}$/.test(digits)) digits = `251${digits}`;
  return digits.length >= 8 ? digits : "";
}

const withLink = ({ text, url }, gap = " ") => url ? `${text}${gap}${url}` : text;

const SHARE_CHANNELS = {
  whatsapp: { label:"WhatsApp", href:message => `https://wa.me/${internationalPhone(message.phone)}?text=${encodeURIComponent(withLink(message))}` },
  telegram: { label:"Telegram", href:({ text, url }) => `https://t.me/share/url?url=${encodeURIComponent(url || "")}&text=${encodeURIComponent(text)}` },
  facebook: { label:"Facebook", href:({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  sms: { label:"SMS", href:message => { const number = internationalPhone(message.phone); return `sms:${number ? `+${number}` : ""}?&body=${encodeURIComponent(withLink(message))}`; } },
  email: { labelKey:"linkEmail", href:message => `mailto:?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(withLink(message, "\n\n"))}` },
};

const CHANNEL_ICONS = {
  whatsapp: '<path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 7.9c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.3l.8 1.8c.1.2 0 .5-.1.7l-.6.7c.6 1.2 1.6 2.2 2.8 2.8l.7-.6c.2-.2.5-.2.7-.1l1.8.8c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.7.4-1.5.5-2.2.3-2.7-.8-4.8-2.9-5.6-5.6-.2-.7-.1-1.5.3-2.1Z" fill="currentColor"/>',
  telegram: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="m6.2 11.6 10.2-3.9c.5-.2.9.1.8.8l-1.7 8.2c-.1.6-.5.7-1 .4l-2.7-2-1.3 1.3c-.2.2-.3.3-.6.3l.2-2.8 5-4.5c.2-.2 0-.3-.3-.1l-6.2 3.9-2.6-.8c-.6-.2-.6-.6.2-.8Z" fill="#fff"/>',
  facebook: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M13.1 21.9v-7h2.3l.4-2.7h-2.7v-1.7c0-.8.2-1.3 1.3-1.3h1.4V6.8c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2h-2.3v2.7h2.3v7" fill="#fff"/>',
  sms: '<path d="M20 15.5a2 2 0 0 1-2 2H8l-4 3.3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.5" cy="10.8" r="1.1" fill="currentColor"/><circle cx="12" cy="10.8" r="1.1" fill="currentColor"/><circle cx="15.5" cy="10.8" r="1.1" fill="currentColor"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m3.8 6.5 8.2 6.3 8.2-6.3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
  more: '<circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/>'
};
const channelTile = (id, label) => `<span class="share-channel-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${CHANNEL_ICONS[id]}</svg></span><span class="share-channel-label">${escapeHtml(label)}</span>`;

function shareChannelsMarkup(message, channels) {
  return channels.map(id => {
    const channel = SHARE_CHANNELS[id];
    const href = channel.href(message);
    const external = href.startsWith("https:");
    return `<a class="share-channel share-channel-${id}" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ""}>${channelTile(id, channel.labelKey ? t(channel.labelKey) : channel.label)}</a>`;
  }).join("") + (message.url ? `<button type="button" class="share-channel share-channel-more" data-share-link-native>${channelTile("more", t("linkMore"))}</button>` : "");
}

// The portal link opens in the language chosen for the couple.
let linkLanguage = null;

function portalLink(lang = linkLanguage || state.lang) {
  // The code routes the couple's request to the planner who sent the link.
  const code = state.account?.portalCode;
  return `${location.origin}/portal?lang=${lang}${code ? `&p=${encodeURIComponent(code)}` : ""}`;
}

function portalLinkMessage() {
  const lang = linkLanguage || state.lang;
  const name = document.getElementById("linkClientName").value.trim();
  const words = copy[lang] || copy.en;
  return { text:words[name ? "linkMessageNamed" : "linkMessage"].replace("{name}", name), url:portalLink(lang),
    phone:linkPhone(), subject:words.linkSubject };
}

// Small drawn flags: Windows shows flag emoji as letters.
const COUNTRY_FLAGS = {
  251: '<rect width="24" height="6" fill="#078930"/><rect y="6" width="24" height="6" fill="#fcdd09"/><rect y="12" width="24" height="6" fill="#da121a"/><circle cx="12" cy="9" r="4" fill="#0f47af"/><path d="m12 6.4.7 2 2.1.1-1.7 1.3.6 2-1.7-1.2-1.7 1.2.6-2-1.7-1.3 2.1-.1Z" fill="#fcdd09"/>',
  254: '<rect width="24" height="18" fill="#fff"/><rect width="24" height="5" fill="#000"/><rect y="6.5" width="24" height="5" fill="#bb0000"/><rect y="13" width="24" height="5" fill="#006600"/><ellipse cx="12" cy="9" rx="2.6" ry="5" fill="#bb0000" stroke="#000" stroke-width=".6"/>',
  971: '<rect width="24" height="6" fill="#00732f"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#000"/><rect width="7" height="18" fill="#ff0000"/>',
  966: '<rect width="24" height="18" fill="#006c35"/><path d="M6 7.5h12M8 11h8" stroke="#fff" stroke-width="1.2"/>',
  44: '<rect width="24" height="18" fill="#012169"/><path d="m0 0 24 18M24 0 0 18" stroke="#fff" stroke-width="3.6"/><path d="m0 0 24 18M24 0 0 18" stroke="#c8102e" stroke-width="1.4"/><path d="M12 0v18M0 9h24" stroke="#fff" stroke-width="5"/><path d="M12 0v18M0 9h24" stroke="#c8102e" stroke-width="3"/>',
  1: '<rect width="24" height="18" fill="#fff"/><path d="M0 1.4h24M0 4.2h24M0 7h24M0 9.8h24M0 12.6h24M0 15.4h24" stroke="#b22234" stroke-width="1.4"/><rect width="10" height="9.8" fill="#3c3b6e"/>'
};

function renderCountryFlag() {
  const code = document.getElementById("linkClientCountry").value;
  document.getElementById("linkCountryFlag").innerHTML = `<svg viewBox="0 0 24 18">${COUNTRY_FLAGS[code] || ""}</svg>`;
}

// A number typed with its own + or 00 prefix is kept; otherwise the chosen country code is added.
function linkPhone() {
  const typed = document.getElementById("linkClientPhone").value.trim();
  if (!typed || /^(\+|00)/.test(typed)) return typed;
  const digits = typed.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `+${document.getElementById("linkClientCountry").value}${digits}` : "";
}

function renderPortalLinkDialog() {
  const lang = linkLanguage || state.lang;
  renderCountryFlag();
  document.querySelectorAll("[data-link-lang]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.linkLang === lang)));
  document.getElementById("portalLinkUrl").value = portalLink(lang).replace(/^https?:\/\//, "");
  document.getElementById("portalLinkLocal").hidden = !/^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname);
  document.getElementById("portalLinkChannels").innerHTML = shareChannelsMarkup(portalLinkMessage(), ["whatsapp", "telegram", "facebook", "sms", "email"]);
}

function openPortalLinkDialog() {
  linkLanguage = state.lang;
  if (drawerQuery.matches) setSidebarOpen(false, { restoreFocus:false });
  renderPortalLinkDialog();
  document.getElementById("portalLinkDialog").showModal();
  // Start at the title, so phones don't open the keyboard and no button looks pre-selected.
  document.getElementById("portalLinkHeading").focus();
}

/* ── Client portal ────────────────────────────────────────────────── */
function setupPortal() {
  document.body.classList.add("portal-mode");
  document.querySelectorAll(".workflow-nav [data-step-target]").forEach(button => button.hidden = !["0", "1"].includes(button.dataset.stepTarget));
  document.querySelector(".workflow-title .workspace-label").dataset.i18n = "portalWorkspace";
  // Couple-facing wording in place of the planner's.
  for (const [key, portalKey] of [["detailsNotice", "portalNotice"], ["detailsEyebrow", "portalDetailsEyebrow"], ["detailsTitle", "portalDetailsTitle"],
    ["detailsDescription", "portalDetailsDescription"], ["servicesEyebrow", "portalServicesEyebrow"], ["servicesTitle", "portalServicesTitle"], ["servicesDescription", "portalServicesDescription"]]) {
    const element = document.querySelector(`[data-i18n="${key}"]`);
    if (element) element.dataset.i18n = portalKey;
  }
  document.querySelector('#step-services [data-next-step="6"]').hidden = true;
  document.querySelector("[data-portal-submit]").hidden = false;
}

async function submitPortal(button) {
  syncDetailsFromForm();
  clearValidation();
  const errors = ["brideName", "groomName"].filter(id => !state.details[id]?.trim()).map(id => ({ id, message:t("nameRequired") }));
  if (!state.details.bridePhone?.trim() && !state.details.groomPhone?.trim()) errors.push({ id:"bridePhone", message:t("portalPhoneRequired") });
  if (errors.length) return showValidation(errors, 0);
  const label = button.querySelector("span");
  button.disabled = true;
  label.textContent = t("portalSending");
  try {
    const response = await fetch("/api/portal", { method:"POST", headers:{ "Content-Type":"application/json" }, signal:AbortSignal.timeout(15000),
      body:JSON.stringify({ lang:state.lang, details:state.details, services:state.services, planner:new URLSearchParams(location.search).get("p") || undefined }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t("portalFailed"));
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* The request is already sent. */ }
    document.getElementById("portalDone").innerHTML = `<div class="portal-done-mark" aria-hidden="true">✓</div>
      <div class="eyebrow">${escapeHtml(t("portalSent"))}</div><h1>${escapeHtml(t("portalDoneTitle"))}</h1>
      <p>${escapeHtml(t("portalDoneText"))}</p><strong class="portal-reference">${escapeHtml(result.reference)}</strong>
      <button class="button button-quiet" type="button" data-portal-new>${escapeHtml(t("portalSendAnother"))}</button>`;
    setStep(7);
  } catch (error) {
    showToast(error.name === "TimeoutError" ? t("portalFailed") : error.message || t("portalFailed"));
  } finally {
    button.disabled = false;
    label.textContent = t("portalSubmit");
  }
}

/* ── Client requests (planner dashboard) ──────────────────────────── */
async function loadPortalRequests() {
  if (PORTAL) return;
  try {
    const response = await fetch("/api/portal", { headers:{ Accept:"application/json" }, signal:AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(String(response.status));
    state.portalRequests = (await response.json()).requests;
  } catch {
    state.portalRequests = null;
  }
  renderPortalRequests();
}

function portalRequestCard(request) {
  const imported = request.status === "imported";
  const meals = request.meals || [];
  const mealText = meals.length === 3 ? t("mealFullDay") : meals.map(meal => t(`meal${meal.charAt(0).toUpperCase()}${meal.slice(1)}`)).join(" · ");
  const sent = new Intl.DateTimeFormat(state.lang === "am" ? "am-ET" : "en-GB", { dateStyle:"medium", timeStyle:"short" }).format(new Date(request.created_at));
  const facts = [
    request.wedding_date ? formatDate(request.wedding_date) : t("dateNotSet"),
    `${request.services.length} ${t("portalServicesCount")}`,
    mealText
  ].filter(Boolean).map(fact => `<span>${escapeHtml(fact)}</span>`).join("");
  return `<article class="portal-request${imported ? " is-imported" : ""}" data-portal-request="${request.id}">
    <div class="portal-request-main">
      <div class="portal-request-title"><h3>${escapeHtml(request.bride_name)} <span>&amp;</span> ${escapeHtml(request.groom_name)}</h3><span class="portal-badge">${escapeHtml(t(imported ? "portalImportedBadge" : "portalNew"))}</span></div>
      <p class="portal-request-facts">${facts}</p>
      <p class="portal-request-contact"><a href="tel:${escapeHtml(request.phone.replace(/[^\d+]/g, ""))}">${iconUse("phone")}${escapeHtml(request.phone)}</a><span>${escapeHtml(t("portalSubmittedAt"))} ${escapeHtml(sent)} · MBH-RQ-${request.id}</span></p>
      ${request.notes ? `<p class="portal-request-notes">${escapeHtml(request.notes.length > 180 ? `${request.notes.slice(0, 180)}…` : request.notes)}</p>` : ""}
    </div>
    <div class="portal-request-actions">
      <button class="button button-primary" type="button" data-portal-action="import" data-id="${request.id}">${escapeHtml(t(imported ? "portalOpenPlan" : "portalOpenAsPlan"))}</button>
      <button class="button button-quiet" type="button" data-portal-action="dismiss" data-id="${request.id}">${escapeHtml(t("portalDismiss"))}</button>
    </div>
  </article>`;
}

function renderPortalRequests() {
  const panel = document.getElementById("portalRequests");
  const requests = state.portalRequests;
  const fresh = (requests || []).filter(request => request.status === "new").length;
  const badge = document.getElementById("portalRequestsCount");
  if (badge) { badge.textContent = fresh; badge.hidden = !fresh; }
  if (!panel) return;
  panel.hidden = !requests;
  if (!requests) return;
  const link = portalLink(state.lang);
  panel.innerHTML = `<div class="portal-requests-head">
      <div><div class="eyebrow">${escapeHtml(t("portalRequestsEyebrow"))}</div><h2>${escapeHtml(t("portalRequestsTitle"))}${fresh ? ` <span class="portal-requests-count">${fresh}</span>` : ""}</h2><p>${escapeHtml(t("portalRequestsHint"))}</p></div>
      <div class="portal-link"><code>${escapeHtml(link)}</code><button class="button button-quiet" type="button" data-copy-portal-link>${escapeHtml(t("portalCopyLink"))}</button><button class="button button-primary" type="button" data-create-link>${escapeHtml(t("createLink"))}</button></div>
    </div>
    ${requests.length ? `<div class="portal-request-list">${requests.map(portalRequestCard).join("")}</div>` : `<p class="portal-requests-empty">${escapeHtml(t("portalRequestsEmpty"))}</p>`}`;
}

async function portalRequestAction(id, action, button) {
  button.disabled = true;
  try {
    const response = await fetch(`/api/portal/${id}`, { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ action }), signal:AbortSignal.timeout(12000) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || t("recordUnavailable"));
    if (action === "dismiss") {
      state.portalRequests = state.portalRequests.filter(request => request.id !== id);
      renderPortalRequests();
      return;
    }
    await openRecord(result.recordId);
    showToast(t("portalImported"));
    loadPortalRequests();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

async function copyPortalLink() {
  const link = portalLink();
  try {
    await navigator.clipboard.writeText(link);
    showToast(t("portalLinkCopied"));
  } catch {
    window.prompt(t("portalCopyLink"), link);
  }
}

/* ── Account and team ─────────────────────────────────────────────── */
const roleKey = role => ({ owner:"teamRoleOwner", admin:"teamRoleAdmin" }[role] || "teamRolePlanner");
const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "MH";

async function loadAccount() {
  if (PORTAL) return;
  try {
    const response = await fetch("/api/auth/me", { cache:"no-store" });
    if (response.status === 401) return goToSignIn();
    // Servers without sign-in (the standalone Python server used in tests) keep the brand footer.
    if (!response.ok) return;
    state.account = (await response.json()).user;
    renderAccount();
    // Portal links now include this account's code.
    renderPortalRequests();
  } catch {}
}

function renderAccount() {
  const account = state.account;
  if (!account) return;
  document.getElementById("sidebarAvatar").textContent = initials(account.name);
  document.getElementById("sidebarUserName").textContent = account.name;
  const role = document.getElementById("sidebarUserRole");
  role.removeAttribute("data-i18n");
  role.textContent = `${t(roleKey(account.role))} · ${account.email}`;
  document.getElementById("sidebarAccount").hidden = false;
  document.getElementById("teamButton").hidden = account.role === "planner";
}

// Couple details kept on this device for offline use go with the person signing out.
function clearLocalCoupleData() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key === STORAGE_KEY || key === LOCAL_RECORDS_KEY || key.startsWith("matrimony-coordination:")) localStorage.removeItem(key);
    }
  } catch {}
}

async function signOut() {
  try { await fetch("/api/auth/signout", { method:"POST" }); } catch {}
  clearLocalCoupleData();
  location.assign("/signin");
}

let teamLink = null;

async function teamRequest(body) {
  const response = await fetch("/api/team", body ? { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body) } : { cache:"no-store" });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || t("teamLoadFailed"));
  return result;
}

function renderTeamLink() {
  const box = document.getElementById("teamLink");
  box.hidden = !teamLink;
  if (!teamLink) return;
  document.getElementById("teamLinkText").textContent = teamLink.kind === "invite"
    ? t("teamInviteReady").replace("{role}", t(roleKey(teamLink.role)).toLocaleLowerCase())
    : t("teamResetReady").replace("{name}", teamLink.name);
  document.getElementById("teamLinkUrl").value = teamLink.link;
  const text = t(teamLink.kind === "invite" ? "teamInviteMessage" : "teamResetMessage");
  document.getElementById("teamLinkChannels").innerHTML = shareChannelsMarkup({ text, url:teamLink.link, subject:"Matrimony By Hanna" }, ["whatsapp", "telegram", "sms", "email"]);
}

async function renderTeam() {
  const list = document.getElementById("teamMembers");
  list.setAttribute("aria-busy", "true");
  try {
    const team = await teamRequest();
    state.team = team;
    list.innerHTML = team.members.map(member => {
      const you = member.id === team.me;
      const canManage = !you && member.role !== "owner" && (member.role !== "admin" || team.myRole === "owner");
      const active = member.lastActive ? `${t("teamLastActive")} ${formatDate(member.lastActive.slice(0, 10))}` : t("teamNeverActive");
      return `<li class="team-member">
        <div class="team-member-main"><strong>${escapeHtml(member.name)}${you ? ` · ${escapeHtml(t("teamYou"))}` : ""}</strong><small>${escapeHtml(member.email)} · ${escapeHtml(active)}</small></div>
        <span class="team-role">${escapeHtml(t(roleKey(member.role)))}</span>
        ${canManage ? `<div class="team-member-actions"><button type="button" class="button button-quiet" data-team-reset="${member.id}">${escapeHtml(t("teamReset"))}</button><button type="button" class="button button-quiet" data-team-remove="${member.id}">${escapeHtml(t("teamRemove"))}</button></div>` : ""}
      </li>`;
    }).join("");
    document.querySelector('#teamInviteRole option[value="admin"]').hidden = team.myRole !== "owner";
    const pending = document.getElementById("teamPending");
    pending.innerHTML = team.invites.length ? `${escapeHtml(t("teamPending").replace("{count}", team.invites.length))} <button type="button" class="button button-quiet" data-team-revoke>${escapeHtml(t("teamRevokeAll"))}</button>` : "";
  } catch (error) {
    list.innerHTML = `<li class="team-pending">${escapeHtml(error.message)}</li>`;
  } finally {
    list.removeAttribute("aria-busy");
  }
}

function openTeamDialog() {
  teamLink = null;
  renderTeamLink();
  if (drawerQuery.matches) setSidebarOpen(false, { restoreFocus:false });
  document.getElementById("teamDialog").showModal();
  renderTeam();
}

async function teamAction(button, body, after) {
  button.disabled = true;
  try {
    const result = await teamRequest(body);
    after?.(result);
    await renderTeam();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
}

/* ── Mobile menu ──────────────────────────────────────────────────── */
// Below 900px the sidebar becomes a slide-out menu opened from the top bar.
const drawerQuery = window.matchMedia("(max-width: 900px)");

function setSidebarOpen(open, { restoreFocus = true } = {}) {
  const sidebar = document.getElementById("appSidebar");
  const toggle = document.getElementById("sidebarToggle");
  if (!sidebar || !toggle) return;
  const drawer = drawerQuery.matches && !PORTAL;
  open = open && drawer;
  document.body.classList.toggle("sidebar-open", open);
  document.getElementById("sidebarBackdrop").hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  // A closed drawer is off-screen, so keep it out of the tab order.
  sidebar.inert = drawer && !open;
  if (open) requestAnimationFrame(() => document.getElementById("sidebarClose")?.focus());
  else if (restoreFocus && drawer && sidebar.contains(document.activeElement)) toggle.focus();
}

/* ── Collapsed sidebar ────────────────────────────────────────────── */
// On computers the sidebar can shrink to an icon rail with the logo mark; narrower laptops start that way.
const RAIL_KEY = "matrimony-sidebar-rail";
const railQuery = window.matchMedia("(max-width: 1100px)");

function sidebarRailPreference() {
  try { return localStorage.getItem(RAIL_KEY); } catch { return null; }
}

function setSidebarRail(collapsed, { remember = false } = {}) {
  const rail = collapsed && !drawerQuery.matches && !PORTAL;
  document.body.classList.toggle("sidebar-rail", rail);
  document.getElementById("sidebarCollapse")?.setAttribute("aria-expanded", String(!rail));
  // Icon-only buttons name themselves on hover.
  document.querySelectorAll("#appSidebar button").forEach(button => {
    const label = button.querySelector("span[data-i18n]")?.textContent.trim();
    if (!label || (button.title && !button.dataset.railTitle)) return;
    if (rail) { button.title = label; button.dataset.railTitle = "true"; }
    else { button.removeAttribute("title"); delete button.dataset.railTitle; }
  });
  if (remember) try { localStorage.setItem(RAIL_KEY, rail ? "1" : "0"); } catch {}
}

function syncSidebarRail() {
  const saved = sidebarRailPreference();
  setSidebarRail(saved === null ? railQuery.matches : saved === "1");
}

function bindSidebarDrawer() {
  const sidebar = document.getElementById("appSidebar");
  document.getElementById("sidebarCollapse")?.addEventListener("click", () => setSidebarRail(true, { remember:true }));
  document.getElementById("sidebarExpand")?.addEventListener("click", () => setSidebarRail(false, { remember:true }));
  railQuery.addEventListener("change", syncSidebarRail);
  drawerQuery.addEventListener("change", syncSidebarRail);
  syncSidebarRail();
  document.getElementById("sidebarToggle")?.addEventListener("click", () => setSidebarOpen(true));
  document.getElementById("sidebarClose")?.addEventListener("click", () => setSidebarOpen(false));
  document.getElementById("sidebarBackdrop")?.addEventListener("click", () => setSidebarOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("sidebar-open")) setSidebarOpen(false);
  });
  // Choosing anything in the menu (a wedding, New wedding, a blank form…) closes it.
  sidebar?.addEventListener("click", event => {
    if (event.target.closest("button, a") && !event.target.closest("#sidebarClose")) requestAnimationFrame(() => setSidebarOpen(false, { restoreFocus:false }));
  });
  drawerQuery.addEventListener("change", () => setSidebarOpen(false, { restoreFocus:false }));
  // Rotating a phone or resizing into the swipeable row keeps the current step visible.
  window.matchMedia("(max-width: 700px)").addEventListener("change", event => { if (event.matches) requestAnimationFrame(() => revealActiveStep(false)); });
  setSidebarOpen(false, { restoreFocus:false });
}

// On phones the steps are one swipeable row; keep the current step in view.
function revealActiveStep(smooth = true) {
  const strip = document.querySelector(".workflow-steps");
  const active = strip?.querySelector(".step-link.is-active");
  if (!active || strip.scrollWidth <= strip.clientWidth) return;
  strip.scrollTo({ left:active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2, behavior:smooth ? "smooth" : "auto" });
}

/* ── Wedding Search Dialog ────────────────────────────────────────── */
let searchActiveIndex = 0;

/* Record search: every saved couple is indexed by names, phones, dates in both calendars,
   document references, places, services, meals, fee and notes, in English and Amharic. */
const searchFold = value => String(value ?? "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
// Ethiopian numbers are typed as +251 9…, 251 9…, 09… or 9…; compare them without the prefix.
const phoneDigits = value => String(value ?? "").replace(/\D/g, "").replace(/^251/, "").replace(/^0+/, "");
const bothLanguages = key => [copy.en[key], copy.am[key]];
const SEARCH_WEIGHTS = { name:100, phone:95, ref:90, date:75, fee:60, place:50, venue:35, service:35, meal:35, notes:20 };
const searchIndexCache = new WeakMap();

function searchIndex(record) {
  if (searchIndexCache.has(record)) return searchIndexCache.get(record);
  const summary = record.search || {};
  const fields = [];
  const add = (kind, values, display = null) => {
    for (const value of [values].flat()) if (value) fields.push({ kind, text:searchFold(value), display:display || String(value) });
  };
  add("name", [summary.bride_name, summary.groom_name, record.bride_first_name, record.groom_first_name]);
  for (const phone of summary.phones || []) fields.push({ kind:"phone", text:searchFold(phone), digits:phoneDigits(phone), display:phone });
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(record.wedding_date || "") ? record.wedding_date : "";
  const compactDate = iso.replace(/-/g, "");
  add("ref", [`MBH-PF-${record.id}-${compactDate}`, `MBH-AG-${record.id}-${compactDate}`], `MBH-PF-${record.id}-${compactDate}`);
  fields.push({ kind:"ref", text:"", recordId:Number(record.id), display:`#${record.id}` });
  if (iso) {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    const ec = gregorianToEthiopian(year, month, day);
    const names = ["en-GB", "am-ET"].flatMap(locale => ["long", "short"].map(style => new Intl.DateTimeFormat(locale, { month:style, calendar:"gregory" }).format(date)));
    const variants = [iso, `${day} ${month} ${year}`, `${day} ${names.join(" ")} ${year}`, `${EC_MONTHS_EN[ec.month - 1]} ${EC_MONTHS_AM[ec.month - 1]} ${ec.day} ${ec.month} ${ec.year}`].join(" ");
    const pad = value => String(value).padStart(2, "0");
    // Typed dates such as 12/12/2026, 2026-12-12 or 3/4/2019 (EC) are compared as digits.
    const digits = [compactDate, `${pad(day)}${pad(month)}${year}`, `${day}${month}${year}`, `${pad(month)}${pad(day)}${year}`, `${pad(ec.day)}${pad(ec.month)}${ec.year}`, `${ec.day}${ec.month}${ec.year}`];
    fields.push({ kind:"date", text:searchFold(variants), dateDigits:digits, display:"" });
  }
  if (summary.fee) add("fee", [summary.fee, formatMoney(summary.fee)], formatMoney(summary.fee));
  add("place", summary.places || []);
  for (const id of summary.venue_types || []) {
    const venue = eventVenueCatalog.find(item => item.id === id);
    if (venue) add("venue", bothLanguages(venue.label).join(" "), t(venue.label));
  }
  for (const id of summary.services || []) {
    const service = services.find(item => item.id === id);
    if (service) add("service", `${service.title.en} ${service.title.am}`, localized(service.title));
  }
  for (const meal of summary.meals || []) {
    const key = `meal${meal.charAt(0).toUpperCase()}${meal.slice(1)}`;
    add("meal", bothLanguages(key).join(" "), t(key));
  }
  if (["breakfast", "lunch", "dinner"].every(meal => (summary.meals || []).includes(meal))) add("meal", bothLanguages("mealFullDay").join(" "), t("mealFullDay"));
  add("notes", summary.notes);
  searchIndexCache.set(record, fields);
  return fields;
}

// Optimal string alignment distance, stopping once it exceeds `limit`.
function editDistance(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length:b.length + 1 }, (_, i) => i), beforePrevious = previous;
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > limit) return limit + 1;
    beforePrevious = previous;
    previous = current;
  }
  return previous[b.length];
}

function searchTokens(query) {
  const raw = query.trim();
  // A phone number typed with spaces or dashes is one token.
  if (/^[\d\s+()-]+$/.test(raw) && raw.replace(/\D/g, "").length >= 5) return [{ text:raw.replace(/\D/g, ""), digits:raw.replace(/\D/g, "") }];
  return raw.split(/\s+/).flatMap(part => {
    if (/^#\d+$/.test(part)) return [{ text:part, digits:"", recordId:Number(part.slice(1)) }];
    if (/^\d{1,4}[./-]\d{1,2}[./-]\d{1,4}$/.test(part)) return [{ text:searchFold(part), digits:part.replace(/\D/g, ""), date:true }];
    return searchFold(part).split(" ").filter(Boolean).map(text => ({ text, digits:/^\d+$/.test(text) ? text : "" }));
  });
}

// How well one query token matches one field, from 0 (no match) to 1 (exact word).
function tokenQuality(token, field) {
  if (token.recordId) return field.recordId === token.recordId ? 1 : 0;
  if (token.date) return field.dateDigits?.includes(token.digits) ? 1 : 0;
  if (field.dateDigits && token.digits.length >= 6 && field.dateDigits.includes(token.digits)) return 1;
  if (field.digits && token.digits.length >= 3) {
    const digits = phoneDigits(token.digits);
    if (digits && field.digits.startsWith(digits)) return 1;
    if (digits && field.digits.includes(digits)) return 0.9;
  }
  const words = field.text.split(" ");
  if (words.includes(token.text)) return 1;
  if (words.some(word => word.startsWith(token.text))) return 0.85;
  if (token.text.length >= 3 && field.text.includes(token.text)) return 0.6;
  if (token.text.length >= 4 && !token.digits && (field.kind === "name" || field.kind === "place")) {
    const limit = token.text.length >= 7 ? 2 : 1;
    if (words.some(word => editDistance(token.text, word.slice(0, token.text.length + limit), limit) <= limit)) return 0.45;
  }
  return 0;
}

function searchRecords(query, records = state.records || []) {
  const tokens = searchTokens(query);
  if (!tokens.length) return records.map(record => ({ record, score:0, detail:null }));
  const phrase = searchFold(query);
  const results = [];
  for (const record of records) {
    const fields = searchIndex(record);
    let score = 0, detail = null, detailScore = 0, matchedAll = true;
    for (const token of tokens) {
      let best = 0, bestField = null;
      for (const field of fields) {
        const value = tokenQuality(token, field) * SEARCH_WEIGHTS[field.kind];
        if (value > best) { best = value; bestField = field; }
      }
      if (!best) { matchedAll = false; break; }
      score += best;
      if (bestField.kind !== "name" && best > detailScore) { detail = bestField; detailScore = best; }
    }
    if (!matchedAll) continue;
    // Typing a whole phrase ("Sheraton Addis", "12 December") ranks the field that holds it first.
    const phraseField = phrase.includes(" ") ? fields.find(field => field.text.includes(phrase)) : null;
    if (phraseField) score += SEARCH_WEIGHTS[phraseField.kind] / 2;
    results.push({ record, score, detail });
  }
  return results.sort((a, b) => b.score - a.score || String(b.record.updated_at || "").localeCompare(String(a.record.updated_at || "")));
}

// Marks the typed words inside a matched value so it is clear why a couple was found.
function highlightMatch(value, query) {
  let html = escapeHtml(value);
  const words = [...new Set(query.trim().split(/\s+/).filter(word => word.length >= 2))].sort((a, b) => b.length - a.length);
  for (const word of words) {
    const pattern = new RegExp(`(${escapeHtml(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "giu");
    html = html.replace(/(<[^>]*>)|([^<]+)/g, (part, tag, text) => tag || text.replace(pattern, "<mark>$1</mark>"));
  }
  return html;
}

// Highlights the typed digits inside a phone number, ignoring spaces and the 0 / +251 prefix.
function highlightPhone(value, query) {
  const typed = phoneDigits(query);
  const positions = [...value].flatMap((character, index) => /\d/.test(character) ? [index] : []);
  const start = positions.map(index => value[index]).join("").indexOf(typed);
  if (!typed || start < 0) return highlightMatch(value, query);
  const from = positions[start], to = positions[start + typed.length - 1] + 1;
  return `${escapeHtml(value.slice(0, from))}<mark>${escapeHtml(value.slice(from, to))}</mark>${escapeHtml(value.slice(to))}`;
}

function searchDetailMarkup(detail, query) {
  if (!detail || detail.kind === "date" || (detail.kind === "ref" && !/mbh|#/i.test(query))) return "";
  const value = detail.kind === "phone" ? highlightPhone(detail.display, query) : highlightMatch(detail.display, query);
  return `<span class="search-detail"><span class="search-detail-kind">${escapeHtml(t(`searchKind_${detail.kind}`))}</span>${value}</span>`;
}

function searchMatches(query) {
  const records = state.records || [];
  if (!query) return records.slice(0, 8).map(record => ({ record, detail:null }));
  return searchRecords(query, records).slice(0, 30);
}

function renderWeddingSearch() {
  const input = document.getElementById("weddingSearchInput");
  const results = document.getElementById("weddingSearchResults");
  const query = input.value.trim();
  const matches = searchMatches(query);
  document.getElementById("searchDialogHeading").textContent = t(query ? "searchResults" : "recentWeddings");
  searchActiveIndex = Math.min(searchActiveIndex, Math.max(matches.length - 1, 0));
  if (!matches.length) {
    results.innerHTML = `<p class="search-dialog-empty">${escapeHtml(t((state.records || []).length ? "noWeddingsFound" : "recentEmpty"))}</p>`;
    input.removeAttribute("aria-activedescendant");
    return;
  }
  results.innerHTML = matches.map(({ record, detail }, index) => {
    const names = `${highlightMatch(record.search?.bride_name || record.bride_first_name || "", query)} &amp; ${highlightMatch(record.search?.groom_name || record.groom_first_name || "", query)}`;
    return `<button type="button" class="search-result ${index === searchActiveIndex ? "is-active" : ""}" id="search-result-${record.id}" role="option" aria-selected="${index === searchActiveIndex}" data-search-record="${record.id}"><svg class="ui-icon" aria-hidden="true"><use href="#icon-chat"></use></svg><span class="search-result-main"><span class="search-result-name">${names}</span>${searchDetailMarkup(detail, query)}</span><span class="search-result-date">${escapeHtml(formatDate(record.wedding_date))}</span></button>`;
  }).join("");
  const active = results.querySelector(".search-result.is-active");
  if (active) {
    input.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  }
}

async function openWeddingSearch() {
  if (PORTAL) return;
  const dialog = document.getElementById("searchDialog");
  if (dialog.open) return;
  const input = document.getElementById("weddingSearchInput");
  input.value = "";
  searchActiveIndex = 0;
  dialog.showModal();
  input.focus();
  renderWeddingSearch();
  try {
    state.records = (await recordsRequest("")).records;
    if (dialog.open) renderWeddingSearch();
  } catch { /* Keep showing the records already loaded. */ }
}

function closeWeddingSearch() {
  const dialog = document.getElementById("searchDialog");
  if (dialog.open) dialog.close();
}

function chooseSearchResult(id) {
  closeWeddingSearch();
  openRecord(Number(id));
}

function bindWeddingSearch() {
  const dialog = document.getElementById("searchDialog");
  const input = document.getElementById("weddingSearchInput");
  document.getElementById("openSearchButton").addEventListener("click", openWeddingSearch);
  document.getElementById("closeSearchButton").addEventListener("click", closeWeddingSearch);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) { closeWeddingSearch(); return; }
    const result = event.target.closest("[data-search-record]");
    if (result) chooseSearchResult(result.dataset.searchRecord);
  });
  input.addEventListener("input", () => { searchActiveIndex = 0; renderWeddingSearch(); });
  input.addEventListener("keydown", (event) => {
    const results = [...document.querySelectorAll("#weddingSearchResults [data-search-record]")];
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      searchActiveIndex = (searchActiveIndex + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length;
      renderWeddingSearch();
    } else if (event.key === "Enter" && results[searchActiveIndex]) {
      event.preventDefault();
      chooseSearchResult(results[searchActiveIndex].dataset.searchRecord);
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" && !document.getElementById("openSearchButton").hidden) {
      event.preventDefault();
      openWeddingSearch();
    }
  });
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (exportingPdf) return;
    const download = event.target.closest("[data-download-pdf]");
    if (download) { downloadDocument(download.dataset.downloadPdf, download); return; }
    const blankKind = event.target.closest("[data-blank-doc]")?.dataset.blankDoc;
    if (blankKind) { openBlankDocumentDialog(blankKind); return; }
    const blankLanguage = event.target.closest("[data-blank-lang]");
    if (blankLanguage) { downloadBlankDocument(document.getElementById("blankDocDialog").dataset.kind, blankLanguage.dataset.blankLang, blankLanguage); return; }
    const portalSubmit = event.target.closest("[data-portal-submit]");
    if (portalSubmit) { submitPortal(portalSubmit); return; }
    if (event.target.closest("[data-portal-new]")) { location.assign(`/portal${location.search}`); return; }
    const portalAction = event.target.closest("[data-portal-action]");
    if (portalAction) { portalRequestAction(Number(portalAction.dataset.id), portalAction.dataset.portalAction, portalAction); return; }
    if (event.target.closest("[data-copy-portal-link]")) { copyPortalLink(); return; }
    if (event.target.closest("#signOutButton")) { signOut(); return; }
    if (event.target.closest("#teamButton")) { openTeamDialog(); return; }
    const teamInvite = event.target.closest("[data-team-invite]");
    if (teamInvite) {
      const role = document.getElementById("teamInviteRole").value;
      teamAction(teamInvite, { action:"invite", role }, result => { teamLink = { kind:"invite", role, link:result.link }; renderTeamLink(); });
      return;
    }
    const teamReset = event.target.closest("[data-team-reset]");
    if (teamReset) {
      const member = state.team.members.find(item => item.id === Number(teamReset.dataset.teamReset));
      teamAction(teamReset, { action:"reset", userId:member.id }, result => { teamLink = { kind:"reset", name:member.name, link:result.link }; renderTeamLink(); });
      return;
    }
    const teamRemove = event.target.closest("[data-team-remove]");
    if (teamRemove) {
      const member = state.team.members.find(item => item.id === Number(teamRemove.dataset.teamRemove));
      if (window.confirm(t("teamRemoveConfirm").replace("{name}", member.name))) teamAction(teamRemove, { action:"remove", userId:member.id });
      return;
    }
    const teamRevoke = event.target.closest("[data-team-revoke]");
    if (teamRevoke) {
      (async () => {
        teamRevoke.disabled = true;
        for (const invite of state.team.invites) await teamRequest({ action:"revoke", inviteId:invite.id }).catch(() => {});
        await renderTeam();
      })();
      return;
    }
    if (event.target.closest("[data-copy-team-link]")) {
      navigator.clipboard.writeText(teamLink.link).then(() => showToast(t("linkCopied")), () => window.prompt(t("linkCopy"), teamLink.link));
      return;
    }
    if (event.target.closest("[data-create-link]")) { openPortalLinkDialog(); return; }
    const linkLang = event.target.closest("[data-link-lang]");
    if (linkLang) { linkLanguage = linkLang.dataset.linkLang; renderPortalLinkDialog(); return; }
    if (event.target.closest("[data-share-link-native]")) {
      const inTeam = event.target.closest("#teamDialog");
      const { text, url } = inTeam ? { text:t(teamLink.kind === "invite" ? "teamInviteMessage" : "teamResetMessage"), url:teamLink.link } : portalLinkMessage();
      // Phones open their share sheet; elsewhere the whole message is copied for any app.
      if (navigator.share) navigator.share({ title:"Matrimony By Hanna", text, url }).catch(() => {});
      else navigator.clipboard.writeText(`${text} ${url}`).then(() => showToast(t("linkMessageCopied")), () => window.prompt(t("linkCopy"), `${text} ${url}`));
      return;
    }
    if (event.target.closest("[data-share-blank]")) { shareBlankDocument(); return; }
    if (event.target.closest("[data-close-dialog]")) { event.target.closest("dialog").close(); return; }
    if (event.target.closest("[data-open-requests]")) {
      setStep(5);
      requestAnimationFrame(() => document.getElementById("portalRequests").scrollIntoView({ block:"start" }));
      return;
    }
    const share = event.target.closest("[data-share-pdf]");
    if (share) { shareDocument(share.dataset.sharePdf, share); return; }
    const languageButton = event.target.closest("[data-language]");
    if (languageButton) {
      state.lang = languageButton.dataset.language === "am" ? "am" : "en";
      applyLocalization();
      saveDraft();
      return;
    }
    const dayStep = event.target.closest("[data-days-step]");
    if (dayStep) {
      const input = document.getElementById("eventDays");
      input.value = String(Math.min(365, Math.max(1, (parseInt(input.value, 10) || 1) + Number(dayStep.dataset.daysStep))));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    const recordButton = event.target.closest("[data-open-record]");
    if (recordButton) {
      openRecord(Number(recordButton.dataset.openRecord));
      return;
    }
    const status = event.target.closest("[data-service-status]");
    if (status) {
      getServiceState(status.dataset.serviceStatus).responsibility = status.dataset.status;
      saveDraft();
      renderServices();
      return;
    }
    const toggle = event.target.closest("[data-service-toggle]");
    if (toggle) {
      toggleService(toggle.dataset.serviceToggle);
      return;
    }
    const next = event.target.closest("[data-next-step]");
    if (next) {
      const target = Number(next.dataset.nextStep);
      if (target === 2 && !validateBeforeAgreement()) return;
      if (target === 3 && !validateBeforeProforma()) return;
      setStep(target);
      return;
    }
    const previous = event.target.closest("[data-prev-step]");
    if (previous) {
      setStep(Number(previous.dataset.prevStep));
      return;
    }
    const nav = event.target.closest("[data-step-target]");
    if (nav) {
      const target = Number(nav.dataset.stepTarget);
      if (target === 2 && !validateBeforeAgreement()) return;
      if (target === 3 && !validateBeforeProforma()) return;
      setStep(target);
      return;
    }
    if (event.target.closest("#resetDraftButton")) {
      clearDraft();
      return;
    }
    if (event.target.closest("#printAgreementButton")) {
      printDocument("agreement");
      return;
    }
    if (event.target.closest("#printProformaButton")) {
      printDocument("proforma");
      return;
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.id === "serviceSearch") {
      state.serviceSearch = target.value;
      renderServices();
      return;
    }
    if (target.id === "recordsSearch") {
      renderRecords();
      return;
    }
    if (target.id === "linkClientName" || target.id === "linkClientPhone" || target.id === "linkClientCountry") {
      renderPortalLinkDialog();
      return;
    }
    if (target.matches("[data-service-notes]")) {
      getServiceState(target.dataset.serviceNotes).notes = target.value;
      saveDraft();
      return;
    }
    if (target.matches("[data-service-id][data-option-id]")) {
      updateServiceOption(target);
      return;
    }
    if (fieldIds.includes(target.id) || target.matches("[data-venue-location], [data-contract-scope]") || target.name === "mediaConsent") syncDetailsFromForm();
    if (target.hasAttribute("aria-invalid")) {
      target.removeAttribute("aria-invalid");
      target.removeAttribute("aria-describedby");
      target.closest(".field, .service-price-field")?.querySelector(".field-error")?.remove();
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-event-venue-type]")) {
      syncDetailsFromForm();
      renderEventVenueFields();
      saveDraft();
      return;
    }
    if (target.matches("[data-meal-program]")) {
      syncDetailsFromForm();
      saveDraft();
      return;
    }
    if (target.id === "serviceFilter") {
      state.serviceFilter = target.value;
      renderServices();
      return;
    }
    if (target.matches("[data-service-id][data-option-id]")) {
      updateServiceOption(target);
      return;
    }
    if (fieldIds.includes(target.id) || target.matches("[data-venue-location], [data-contract-scope]") || target.name === "mediaConsent") syncDetailsFromForm();
  });
}

function init() {
  if (PORTAL) setupPortal();
  loadDraft();
  const linkLang = PORTAL && new URLSearchParams(location.search).get("lang");
  if (linkLang === "am" || linkLang === "en") state.lang = linkLang;
  normalizeEventVenues();
  if (!state.details.mediaConsent) state.details.mediaConsent = "no";
  syncEventVenueChoicesToForm();
  syncContractChoicesToForm();
  bindEvents();
  bindWeddingSearch();
  bindSidebarDrawer();
  applyLocalization();
  renderServices();
  loadAccount();
  loadRecords();
  loadPortalRequests();
}

init();
