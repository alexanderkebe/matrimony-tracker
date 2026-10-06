const STORAGE_KEY = "matrimony-by-hanna-planning-draft-v1";

const copy = {
  en: {
    brandCaption: "Ceremony, beautifully considered.",
    workspaceLabel: "Planning workspace",
    navDetails: "Couple & event",
    navServices: "Services",
    navReview: "Review",
    navAgreement: "Agreement",
    navProforma: "Proforma",
    eventDays: "Number of event days",
    servicePrice: "Agreed price",
    priceAutoHint: "Enter one agreed overall fee. The proforma will show a single general price.",
    viewProforma: "View proforma",
    proformaEyebrow: "THE QUOTATION",
    proformaTitle: "Your proforma.",
    proformaDescription: "A clear summary of selected services and one agreed total.",
    backToAgreement: "Agreement",
    printProforma: "Print proforma PDF",
    proformaDocumentTitle: "Proforma",
    proformaPreparedFor: "Prepared for",
    proformaScope: "Selected services",
    proformaService: "Service and agreed details",
    proformaAmount: "Price (ETB)",
    proformaTotal: "General agreed price",
    proformaDeposit: "Planned deposit",
    proformaBalance: "Balance after deposit",
    proformaThanks: "Thank you for choosing Matrimony By Hanna. It is a privilege to be part of your celebration, and we look forward to caring for every detail with you.",
    proformaNote: "The selected services are listed for reference; pricing is shown as one overall fee. The signed agreement sets out the payment terms.",
    proformaDetailsRequired: "Enter the event days and overall agreed fee before opening the proforma.",
    navRecords: "Records",
    recordsEyebrow: "THE COUPLES",
    recordsTitle: "Saved records.",
    recordsDescription: "Find a couple by first name and reopen their complete plan.",
    searchRecords: "Search bride or groom",
    saveRecord: "Save record",
    openRecord: "Open plan",
    recordsEmpty: "No saved records yet. Generate an agreement to add one.",
    recordsNoMatches: "No couples match this search.",
    recordSaved: "Couple record saved in SQLite.",
    recordUnavailable: "Records are unavailable. Start the app with python server.py.",
    recordOpened: "The couple’s plan is ready to edit.",
    catalogLabel: "SERVICE CATALOG",
    catalogCopy: "spiritual, creative & practical details ready to shape.",
    startNew: "Start a new plan",
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
    weddingTime: "Start time",
    eventVenueTypesHeading: "Where will the wedding events take place?",
    eventVenueTypesHint: "Select every venue type you need, then choose its location on the map.",
    venueTypeChurch: "Church / religious venue",
    venueTypeHall: "Wedding or reception hall",
    venueTypeHotel: "Hotel / banquet venue",
    venueTypeOutdoor: "Garden / park / outdoor venue",
    venueTypeHome: "Home / private residence",
    venueTypeRestaurant: "Restaurant",
    venueTypeOther: "Other venue",
    eventVenues: "Event venues",
    financialEyebrow: "FINANCIAL COMMITMENT",
    financialHeading: "Set the agreement amount",
    totalFee: "Total professional fee",
    deposit: "Non-refundable deposit",
    finalBalance: "Final balance",
    balanceHint: "Due on the wedding day",
    generalNotes: "Planning notes",
    requiredHint: "Date and couple names help us build the agreement.",
    continueServices: "Continue to services",
    servicesEyebrow: "THE AGREED SCOPE",
    servicesTitle: "Choose what belongs in the promise.",
    servicesDescription: "Select a service to reveal the choices that make it specific to this couple. The agreement will include only what is selected.",
    selectedOf: "of 21 selected",
    filterLabel: "Filter services",
    filterAll: "All service areas",
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
    timeNotSet: "Time not set",
    notSet: "Not set",
    notes: "Notes",
    noNotes: "No additional notes",
    total: "Total fee",
    depositLabel: "Deposit",
    balanceLabel: "Final balance",
    serviceDetails: "Selected details",
    agreementDate: "Agreement date",
    weddingDateAgreement: "Wedding date",
    timeAgreement: "Time",
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
    navAgreement: "ስምምነት",
    navProforma: "ፕሮፎርማ",
    eventDays: "የዝግጅቱ ቀናት ብዛት",
    servicePrice: "የተስማሙበት ዋጋ",
    priceAutoHint: "አንድ ጠቅላላ የተስማሙበትን ዋጋ ያስገቡ። ፕሮፎርማው አንድ ጠቅላላ ዋጋ ብቻ ያሳያል።",
    viewProforma: "ፕሮፎርማን ይመልከቱ",
    proformaEyebrow: "የዋጋ ጥቅስ",
    proformaTitle: "የእርስዎ ፕሮፎርማ።",
    proformaDescription: "የተመረጡ አገልግሎቶች ማጠቃለያ እና አንድ ጠቅላላ የተስማሙበት ዋጋ።",
    backToAgreement: "ስምምነት",
    printProforma: "ፕሮፎርማ PDF አትም",
    proformaDocumentTitle: "ፕሮፎርማ",
    proformaPreparedFor: "የተዘጋጀላቸው",
    proformaScope: "የተመረጡ አገልግሎቶች",
    proformaService: "አገልግሎት እና የተስማሙበት ዝርዝር",
    proformaAmount: "ዋጋ (ETB)",
    proformaTotal: "ጠቅላላ የተስማሙበት ዋጋ",
    proformaDeposit: "የታቀደ ቅድመ ክፍያ",
    proformaBalance: "ከቅድመ ክፍያ በኋላ ቀሪ",
    proformaThanks: "ማትሪሞኒ በሀናን ስለመረጡ እናመሰግናለን። የደስታ ቀናችሁ አካል መሆን ለእኛ ክብር ነው፤ ሁሉንም ዝርዝር በጥንቃቄ እናስተባብራለን።",
    proformaNote: "የተመረጡ አገልግሎቶች ለማጣቀሻ ተዘርዝረዋል፤ ዋጋው በአንድ ጠቅላላ መጠን ቀርቧል። የክፍያ ውሎች በተፈረመው ስምምነት ይገለጻሉ።",
    proformaDetailsRequired: "ፕሮፎርማውን ከመክፈትዎ በፊት የዝግጅቱን ቀናት እና ጠቅላላ የተስማሙበትን ዋጋ ያስገቡ።",
    navRecords: "መዝገቦች",
    recordsEyebrow: "ጥንዶቹ",
    recordsTitle: "የተቀመጡ መዝገቦች።",
    recordsDescription: "በስም ፈልጉ እና ሙሉ እቅዳቸውን ይክፈቱ።",
    searchRecords: "የሙሽራዋን ወይም የሙሽራውን ስም ፈልጉ",
    saveRecord: "መዝገብ አስቀምጥ",
    openRecord: "እቅድ ክፈት",
    recordsEmpty: "እስካሁን መዝገብ የለም። ስምምነት ፍጠሩ።",
    recordsNoMatches: "ከፍለጋው ጋር የሚዛመድ መዝገብ የለም።",
    recordSaved: "የጥንዶቹ መዝገብ በSQLite ተቀምጧል።",
    recordUnavailable: "መዝገቦቹ አይገኙም። python server.py በማስኬድ ይጀምሩ።",
    recordOpened: "የጥንዶቹ እቅድ ለማሻሻል ዝግጁ ነው።",
    catalogLabel: "የአገልግሎት ዝርዝር",
    catalogCopy: "መንፈሳዊ፣ የፈጠራ እና ተግባራዊ ዝርዝሮች።",
    startNew: "አዲስ እቅድ ይጀምሩ",
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
    weddingTime: "የመጀመሪያ ሰዓት",
    eventVenueTypesHeading: "የሰርጉ ዝግጅቶች የት ይካሄዳሉ?",
    eventVenueTypesHint: "የሚያስፈልጉዎትን ቦታዎች ሁሉ ይምረጡ፤ ለእያንዳንዱም በካርታው ላይ ቦታ ያስቀምጡ።",
    venueTypeChurch: "ቤተ-ክርስቲያን / ሃይማኖታዊ ቦታ",
    venueTypeHall: "የሰርግ ወይም የድግስ አዳራሽ",
    venueTypeHotel: "ሆቴል / የድግስ ቦታ",
    venueTypeOutdoor: "አትክልት ስፍራ / ፓርክ / ከቤት ውጭ",
    venueTypeHome: "ቤት / የግል መኖሪያ",
    venueTypeRestaurant: "ምግብ ቤት",
    venueTypeOther: "ሌላ ቦታ",
    eventVenues: "የዝግጅት ቦታዎች",
    financialEyebrow: "የገንዘብ ስምምነት",
    financialHeading: "የስምምነቱን መጠን ያስገቡ",
    totalFee: "ጠቅላላ የሙያ ክፍያ",
    deposit: "የማይመለስ ቅድመ ክፍያ",
    finalBalance: "ቀሪ ክፍያ",
    balanceHint: "በሰርጉ ቀን የሚከፈል",
    generalNotes: "የእቅድ ማስታወሻ",
    requiredHint: "የጥንዶቹ ስም እና ቀን ስምምነቱን ለመዘጋጀት ያግዛሉ።",
    continueServices: "ወደ አገልግሎቶች ይቀጥሉ",
    servicesEyebrow: "የተስማሙበት ወሰን",
    servicesTitle: "በቃል ኪዳኑ ውስጥ የሚገባውን ይምረጡ።",
    servicesDescription: "አገልግሎት ሲመርጡ ለዚህ ጥንድ የሚስማማውን ምርጫ ያሳያል። በስምምነቱ የሚገባው የተመረጠው ብቻ ነው።",
    selectedOf: "ከ21 ተመርጠዋል",
    filterLabel: "አገልግሎቶችን ይለዩ",
    filterAll: "ሁሉም የአገልግሎት ዘርፎች",
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
    timeNotSet: "ሰዓት አልተወሰነም",
    notSet: "አልተወሰነም",
    notes: "ማስታወሻ",
    noNotes: "ተጨማሪ ማስታወሻ የለም",
    total: "ጠቅላላ ክፍያ",
    depositLabel: "ቅድመ ክፍያ",
    balanceLabel: "ቀሪ ክፍያ",
    serviceDetails: "የተመረጡ ዝርዝሮች",
    agreementDate: "የስምምነት ቀን",
    weddingDateAgreement: "የሰርግ ቀን",
    timeAgreement: "ሰዓት",
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
  recentCouples: "RECENT COUPLES", viewAll: "View all", recentEmpty: "Saved couples will appear here.",
  recordDirty: "Unsaved changes", recordSaving: "Saving record…", recordReady: "Saved record",
  localOnly: "Local draft only", localSaveFailed: "Draft could not be saved on this browser.",
  downloadAgreement: "Download agreement PDF", downloadProforma: "Download proforma PDF",
  printDocument: "Print", pdfPreparing: "Preparing your PDF…", pdfReady: "PDF downloaded with your letterhead.",
  pdfFailed: "PDF export failed. Please retry or use Print to save a PDF.",
  fixFields: "Please complete the highlighted fields.", nameRequired: "Enter a name.",
  dateRequired: "Choose a valid wedding date.", daysRequired: "Enter a whole number from 1 to 365.",
  totalFeeRequired: "Enter the agreed overall fee.",
  priceRequired: "Enter this service’s price in ETB (0 is allowed).", depositInvalid: "Deposit cannot exceed the total fee.",
  amountInvalid: "Enter a valid amount of 0 or more.", missingPriceHint: "Each selected service needs a price for the proforma.",
  generating: "Preparing the document…", documentFailed: "Could not prepare the document. Please try again.",
  documentTooLong: "One item is too long to fit safely on the letterhead. Shorten the longest service instructions or planning notes, then try again.",
  contractScopeEyebrow: "AGREEMENT SCOPE", contractScopeHeading: "Choose the planning engagement",
  contractScopeHint: "Premarital education is included when selected in the service list below.",
  scopeFullPlanning: "Full wedding planning & coordination", scopeDayOf: "Day-of coordination",
  mediaConsentHeading: "Media and photo consent",
  mediaConsentYes: "We consent to promotional use of wedding photos and videos.",
  mediaConsentNo: "Do not post images showing our faces.",
  agreementParties: "Parties & Contact Information", providerDetails: "Service Provider",
  providerOffice: "Office: Yeshi Building, in front of Bole Printing, 2nd Floor, Office No. 11",
  providerPhone: "Phone: +251 95 391 4487", providerEmail: "Email: Hanna@matrimonybyhanna.com",
  providerBank: "Bank details", bankName: "Bank", bankAccountNo: "Account No.", bankAccountHolder: "Account name",
  contractScopeTitle: "Selected Services & Scope", scopePremarital: "Premarital Course",
  otherAddons: "Other agreed add-ons", noAddons: "No other add-ons selected.",
  termsHeading: "Terms, Conditions & Service Delivery", vendorHeading: "Vendor Coordination Scope",
  providerResponsibilityHeading: "Service Provider Responsibilities", clientResponsibilityHeading: "Client Responsibilities",
  vendorScope: "Matrimony by Hanna does not directly provide physical wedding items (such as decor or catering) as an in-house vendor. Instead, the Service Provider coordinates suitable new and existing vendors, assists with pricing and booking, and follows up until their agreed work is complete. For items or services sourced directly by the Clients, the Provider’s role is limited to coordination and the Provider is not responsible for third-party quality or performance.",
  providerResponsibility: "The Service Provider will deliver the agreed services professionally, maintain appropriate standards, and protect the Clients’ confidential information.",
  clientResponsibility: "The Clients will provide necessary information and approvals on time, complete agreed tasks promptly, and follow the payment schedule.",
  paymentTerms: "Payment Terms & Bank Details", advancePayment: "40% advance payment", advanceDue: "Upon signing and commencement",
  midtermPayment: "40% mid-term payment", midtermDue: "At the midpoint of the work",
  finalPayment: "20% final payment", finalDue: "Within 24 hours after completion",
  advanceTerms: "A non-refundable 40% advance is due when this Agreement is signed and work begins.",
  midtermTerms: "A further 40% is due at the midpoint of the planning or service work.",
  finalTerms: "The remaining 20% is due within 24 hours after the agreed work is completed.",
  bankOnly: "Payments are made only to the Service Provider’s official bank account shown below.",
  changesHeading: "Cancellation & Changes", scopeChanges: "If services are added or removed, the fee will be adjusted by mutual agreement.",
  forceMajeure: "If unforeseen natural disasters or national circumstances arise, the parties will discuss a reasonable resolution together.",
  cancellationTerms: "If the Clients cannot proceed with the wedding, the matter will be discussed and adjusted by mutual agreement. Advance payments and expenses already incurred are non-refundable.",
  mediaTermsHeading: "Media & Photo Consent",
  mediaTermsYes: "The Clients consent to Matrimony by Hanna using wedding-day photos and videos for promotional social-media content.",
  mediaTermsNo: "The Clients do not consent to posting images or videos that show their faces. Matrimony by Hanna may post general event setup or decor images only.",
  amendmentsHeading: "Amendments & Erasures",
  amendmentsTerms: "Any erasure or handwritten change without the signatures of both parties is invalid. Amendments take effect only when both parties agree to them.",
  signatureHeading: "Authorization & Signatures",
  signatureIntro: "By signing below, the parties confirm that they have read and agree to the terms of this Agreement.",
  clientGroomSignature: "Groom’s name and signature", clientBrideSignature: "Bride’s name and signature",
  providerSignature: "Matrimony by Hanna · Service Provider"
});
Object.assign(copy.am, {
  currentCouple: "የአሁኑ ጥንዶች", nextCelebration: "ቀጣዩ ዝግጅት", newPlan: "አዲስ እቅድ",
  recentCouples: "የቅርብ ጥንዶች", viewAll: "ሁሉንም አሳይ", recentEmpty: "የተቀመጡ ጥንዶች እዚህ ይታያሉ።",
  recordDirty: "ያልተቀመጡ ለውጦች", recordSaving: "መዝገቡን በማስቀመጥ ላይ…", recordReady: "የተቀመጠ መዝገብ",
  localOnly: "በአሳሹ ላይ ብቻ የተቀመጠ ረቂቅ", localSaveFailed: "ረቂቁን በዚህ አሳሽ ማስቀመጥ አልተቻለም።",
  downloadAgreement: "የስምምነት PDF አውርድ", downloadProforma: "የፕሮፎርማ PDF አውርድ",
  printDocument: "አትም", pdfPreparing: "PDF በማዘጋጀት ላይ…", pdfReady: "PDF ከደብዳቤ ራስጌው ጋር ወርዷል።",
  pdfFailed: "PDF ማውረድ አልተቻለም። እንደገና ይሞክሩ ወይም በማተም PDF ያስቀምጡ።",
  fixFields: "እባክዎ የተጠቆሙትን መስኮች ይሙሉ።", nameRequired: "ስም ያስገቡ።",
  dateRequired: "ትክክለኛ የሰርግ ቀን ይምረጡ።", daysRequired: "ከ1 እስከ365 ሙሉ ቁጥር ያስገቡ።",
  priceRequired: "የዚህን አገልግሎት ዋጋ በብር ያስገቡ (0 ይፈቀዳል)።", depositInvalid: "ቅድመ ክፍያው ከጠቅላላ ዋጋው መብለጥ የለበትም።",
  amountInvalid: "0 ወይም ከዚያ በላይ ትክክለኛ ዋጋ ያስገቡ።", missingPriceHint: "ለፕሮፎርማው ሁሉም የተመረጡ አገልግሎቶች ዋጋ ያስፈልጋቸዋል።",
  generating: "ሰነዱን በማዘጋጀት ላይ…", documentFailed: "ሰነዱን ማዘጋጀት አልተቻለም። እንደገና ይሞክሩ።",
  documentTooLong: "አንድ ዝርዝር በደብዳቤ ራስጌው ገጽ ላይ ለመግጠም በጣም ረጅም ነው። ረጅም የአገልግሎት መመሪያዎችን ወይም ማስታወሻዎችን ያሳጥሩ።",
  totalFeeRequired: "የተስማሙበትን ጠቅላላ ዋጋ ያስገቡ።",
  contractScopeEyebrow: "የውሉ ወሰን", contractScopeHeading: "የእቅድ አገልግሎቱን ይምረጡ",
  contractScopeHint: "ቅድመ-ጋብቻ ትምህርት ከታች ባለው የአገልግሎት ዝርዝር ሲመረጥ በውሉ ይካተታል።",
  scopeFullPlanning: "ሙሉ የሰርግ እቅድ እና ማስተባበሪያ", scopeDayOf: "በሰርጉ ቀን ብቻ ማስተባበሪያ",
  mediaConsentHeading: "የሚዲያ እና ፎቶ አጠቃቀም ፈቃድ",
  mediaConsentYes: "የሰርግ ፎቶዎችና ቪዲዮዎች ለማስተዋወቂያ እንዲውሉ ፈቃደኛ ነን።",
  mediaConsentNo: "ፊታችንን የሚያሳይ ምስል እንዳይለጠፍ አንፈቅድም።",
  agreementParties: "የውሉ አካላት እና አድራሻ", providerDetails: "አገልግሎት ሰጪ",
  providerOffice: "የቢሮ አድራሻ፦ የየሺ ህንፃ፣ ከቦሌ ማተሚያ ፊት ለፊት፣ 2ኛ ፎቅ፣ ቢሮ ቁጥር 11",
  providerPhone: "ስልክ፦ +251 95 391 4487", providerEmail: "ኢሜይል፦ Hanna@matrimonybyhanna.com",
  providerBank: "የባንክ መረጃ", bankName: "ባንክ", bankAccountNo: "የሂሳብ ቁጥር", bankAccountHolder: "የሂሳቡ ስም",
  contractScopeTitle: "የተመረጡ አገልግሎቶች እና ወሰን", scopePremarital: "ቅድመ-ጋብቻ ትምህርት",
  otherAddons: "ሌሎች የተስማሙባቸው ተጨማሪ ሥራዎች", noAddons: "ሌላ ተጨማሪ አገልግሎት አልተመረጠም።",
  termsHeading: "የውል አንቀጾች እና የሥራ ሂደት", vendorHeading: "የቬንደሮች አስተባባሪነት",
  providerResponsibilityHeading: "የአገልግሎት ሰጪው ኃላፊነቶች", clientResponsibilityHeading: "የደንበኞች ኃላፊነቶች",
  vendorScope: "ማትሪሞኒ ባይ ሃና እንደ ዲኮር ወይም ምግብ ያሉ የሰርግ ዕቃዎችን በቀጥታ በራሱ አያቀርብም። በምትኩ ተስማሚ አቅራቢዎችን ያስተባብራል፣ ዋጋ እንዲስማማ እና ቡኪንግ እንዲፈጸም ይረዳል፣ እና የተስማሙበት ሥራ እስኪጠናቀቅ ይከታተላል። ደንበኞቹ በቀጥታ ላቀረቡት ዕቃ ወይም አገልግሎት የአገልግሎት ሰጪው ሚና ማስተባበር ብቻ ነው፤ ለሶስተኛ ወገን ጥራት ወይም አፈጻጸም ኃላፊነት አይወስድም።",
  providerResponsibility: "አገልግሎት ሰጪው የተስማሙባቸውን አገልግሎቶች በሙያዊነት ያቀርባል፣ ተገቢውን ጥራት ይጠብቃል እና የደንበኞቹን ሚስጥራዊ መረጃ ይጠብቃል።",
  clientResponsibility: "ደንበኞቹ አስፈላጊ መረጃዎችን እና ፈቃዶችን በጊዜው ያቀርባሉ፣ የተስማሙባቸውን ሥራዎች ያከናውናሉ እና የክፍያ መርሃ ግብሩን ይከተላሉ።",
  paymentTerms: "የክፍያ ሁኔታዎች እና የባንክ ሂሳብ", advancePayment: "40% ቅድመ ክፍያ", advanceDue: "ውሉ ሲፈረም እና ሥራው ሲጀምር",
  midtermPayment: "40% መካከለኛ ክፍያ", midtermDue: "ሥራው መሃል ላይ ሲደርስ",
  finalPayment: "20% ቀሪ ክፍያ", finalDue: "ሥራው ከተጠናቀቀ በ24 ሰዓት ውስጥ",
  advanceTerms: "የማይመለስ 40% ቅድመ ክፍያ ውሉ ሲፈረም እና ሥራው ሲጀምር ይከፈላል።",
  midtermTerms: "ተጨማሪ 40% ክፍያ የእቅድ ወይም የአገልግሎት ሥራው መሃል ላይ ይከፈላል።",
  finalTerms: "የቀረው 20% ክፍያ የተስማሙበት ሥራ ከተጠናቀቀ በ24 ሰዓት ውስጥ ይከፈላል።",
  bankOnly: "ሁሉም ክፍያዎች ከታች ወደተጠቀሰው የአገልግሎት ሰጪው ይፋዊ የባንክ ሂሳብ ብቻ ይፈጸማሉ።",
  changesHeading: "ስረዛ እና ለውጦች", scopeChanges: "አገልግሎቶች ሲጨመሩ ወይም ሲቀነሱ ክፍያው በሁለቱም ወገኖች ስምምነት ይስተካከላል።",
  forceMajeure: "ድንገተኛ የተፈጥሮ አደጋ ወይም ሀገራዊ ሁኔታ ቢያጋጥም፣ ወገኖቹ ተገቢ መፍትሔ ላይ በጋራ ይወያያሉ።",
  cancellationTerms: "ደንበኞቹ ሰርጉን ማካሄድ ካልቻሉ ጉዳዩ በጋራ ውይይት ይስተካከላል። ቀድሞ የተከፈለ ቅድመ ክፍያ እና የወጡ ወጪዎች አይመለሱም።",
  mediaTermsHeading: "የሚዲያ እና ፎቶ አጠቃቀም ፈቃድ",
  mediaTermsYes: "ደንበኞቹ በሰርጉ ቀን የሚነሱ ፎቶዎችና ቪዲዮዎች ለማትሪሞኒ ባይ ሃና ማስተዋወቂያ ማህበራዊ ሚዲያ አጠቃቀም እንዲውሉ ፈቅደዋል።",
  mediaTermsNo: "ደንበኞቹ ፊታቸውን የሚያሳይ ምስል ወይም ቪዲዮ እንዲለጠፍ አልፈቀዱም። ማትሪሞኒ ባይ ሃና የዝግጅቱን አጠቃላይ ዝግጅት ወይም ዲኮር ብቻ ሊያሳይ ይችላል።",
  amendmentsHeading: "የውል ማሻሻያ እና ስርዝ-ድልዝ",
  amendmentsTerms: "በሁለቱም ወገኖች ፊርማ ያልተደረገበት ስርዝ-ድልዝ ወይም በእጅ የተደረገ ለውጥ ተቀባይነት የለውም። ማንኛውም ማሻሻያ በሁለቱም ወገኖች ስምምነት ብቻ ይጸናል።",
  signatureHeading: "ፈቃድ እና ፊርማ", signatureIntro: "ከታች በመፈረም ወገኖቹ የዚህን ውል ውሎች አንብበው እንደተስማሙ ያረጋግጣሉ።",
  clientGroomSignature: "የሙሽራው ስም እና ፊርማ", clientBrideSignature: "የሙሽሪት ስም እና ፊርማ",
  providerSignature: "ማትሪሞኒ ባይ ሃና · አገልግሎት ሰጪ"
});

const services = [
  {
    id: "premarital",
    number: "01",
    group: "spiritual",
    title: { en: "Premarital education", am: "ቅድመ-ጋብቻ ትምህርት" },
    description: { en: "Prepare for the covenant with a guided learning path.", am: "ለጋብቻ በተመራማሪ ትምህርት ይዘጋጁ።" },
    options: [
      { id: "format", label: { en: "Delivery", am: "የአቀራረብ መንገድ" }, type: "single", choices: [{ value: "in-person", label: { en: "In person", am: "በአካል" } }, { value: "online", label: { en: "Online", am: "Online" } }, { value: "hybrid", label: { en: "Hybrid", am: "በአካል እና Online" } }] },
      { id: "sessions", label: { en: "Session plan", am: "የትምህርት እቅድ" }, type: "single", choices: [{ value: "one", label: { en: "1 session", am: "1 ጊዜ" } }, { value: "two-three", label: { en: "2–3 sessions", am: "2–3 ጊዜ" } }, { value: "custom", label: { en: "Custom plan", am: "ልዩ እቅድ" } }] },
      { id: "date", label: { en: "Preferred start", am: "የሚጀምሩበት ቀን" }, type: "date" }
    ]
  },
  {
    id: "liturgy",
    number: "02",
    group: "spiritual",
    title: { en: "Liturgy / Kidase education", am: "የቅዳሴ ተሰጥዎ ትምህርት" },
    description: { en: "Understand the liturgy, order, and sacred roles before the day.", am: "ቅዳሴውን፣ ሥርዓቱን እና የተሳታፊዎችን ሚና ይረዱ።" },
    options: [
      { id: "format", label: { en: "Delivery", am: "የአቀራረብ መንገድ" }, type: "single", choices: [{ value: "in-person", label: { en: "In person", am: "በአካል" } }, { value: "online", label: { en: "Online", am: "Online" } }] },
      { id: "coverage", label: { en: "Coverage", am: "የሚካተተው" }, type: "multi", choices: [{ value: "kidase", label: { en: "Kidase order", am: "የቅዳሴ ሥርዓት" } }, { value: "roles", label: { en: "Roles & procession", am: "ሚና እና ሰልፍ" } }, { value: "responses", label: { en: "Responses & prayers", am: "ምላሾች እና ጸሎቶች" } }] }
    ]
  },
  {
    id: "post-marriage",
    number: "03",
    group: "spiritual",
    title: { en: "Post-marriage counseling", am: "ድህረ ጋብቻ ምክክር" },
    description: { en: "A gentle follow-up after the first six months of marriage.", am: "ከጋብቻ ከስድስት ወር በኋላ የሚደረግ የእርቅ እና ምክክር ጊዜ።" },
    options: [
      { id: "format", label: { en: "Session format", am: "የምክክር መንገድ" }, type: "single", choices: [{ value: "in-person", label: { en: "In person", am: "በአካል" } }, { value: "online", label: { en: "Online", am: "Online" } }] },
      { id: "timing", label: { en: "Timing", am: "ጊዜ" }, type: "single", choices: [{ value: "six-month", label: { en: "At six months", am: "ከ6 ወር በኋላ" } }, { value: "six-to-nine", label: { en: "6–9 months", am: "ከ6–9 ወር በኋላ" } }, { value: "flexible", label: { en: "Flexible", am: "ተለዋዋጭ" } }] },
      { id: "followup", label: { en: "Follow-up included", am: "ተጨማሪ ክትትል" }, type: "toggle" }
    ]
  },
  {
    id: "church-systems",
    number: "04",
    group: "spiritual",
    title: { en: "Church system coordination", am: "የቤተ-ክርስቲያኑን ሥርዓት ማስፈጸም" },
    description: { en: "Keep the church process, documents, and people in step.", am: "የቤተ-ክርስቲያን ሂደት፣ ሰነዶች እና ሰዎች እንዲስማሙ ማስተባበር።" },
    options: [
      { id: "tasks", label: { en: "Included tasks", am: "የሚካተቱ ሥራዎች" }, type: "multi", choices: [{ value: "registration", label: { en: "Church registration", am: "የቤተ-ክርስቲያን ምዝገባ" } }, { value: "documents", label: { en: "Documents", am: "ሰነዶች" } }, { value: "clergy", label: { en: "Clergy coordination", am: "ከካህናት ጋር ማስተባበር" } }, { value: "program", label: { en: "Church program", am: "የቤተ-ክርስቲያን ፕሮግራም" } }] },
      { id: "contact", label: { en: "Church contact", am: "የቤተ-ክርስቲያን አድራሻ" }, type: "text" }
    ]
  },
  {
    id: "venue",
    number: "05",
    group: "venue",
    title: { en: "Hall / venue", am: "አዳራሽ" },
    description: { en: "Find a setting that carries the ceremony and celebration well.", am: "ሥነ-ስርዓቱን እና ድግሱን በጥሩ ሁኔታ የሚያስተናግድ ቦታ።" },
    options: [
      { id: "type", label: { en: "Venue type", am: "የቦታ አይነት" }, type: "single", choices: [{ value: "church", label: { en: "Church hall", am: "የቤተ-ክርስቲያን አዳራሽ" } }, { value: "wedding", label: { en: "Wedding hall", am: "የሰርግ አዳራሽ" } }, { value: "hotel", label: { en: "Hotel hall", am: "የሆቴል አዳራሽ" } }, { value: "outdoor", label: { en: "Outdoor / garden", am: "የውጪ ቦታ / ግቢ" } }] },
      { id: "capacity", label: { en: "Guest capacity", am: "የእንግዳ ብዛት" }, type: "number" },
      { id: "name", label: { en: "Venue name", am: "የቦታው ስም" }, type: "text" }
    ]
  },
  {
    id: "decor",
    number: "06",
    group: "venue",
    title: { en: "Decor & home exit", am: "ዲኮር - የአዳራሽ እና ከቤት መውጫ" },
    description: { en: "Shape the visual language from the first step outside the home to the hall.", am: "ከቤት መውጫ እስከ አዳራሽ ድረስ የሚታይ ውበት ይምረጡ።" },
    options: [
      { id: "areas", label: { en: "Decor areas", am: "የዲኮር ቦታዎች" }, type: "multi", choices: [{ value: "hall", label: { en: "Hall", am: "አዳራሽ" } }, { value: "home-exit", label: { en: "Home exit", am: "ከቤት መውጫ" } }, { value: "church", label: { en: "Church", am: "ቤተ-ክርስቲያን" } }, { value: "photo", label: { en: "Photo backdrop", am: "የፎቶ ጀርባ" } }] },
      { id: "style", label: { en: "Style", am: "የዲኮር ዘይቤ" }, type: "single", choices: [{ value: "classic", label: { en: "Classic & elegant", am: "ክላሲክ እና ውብ" } }, { value: "modern", label: { en: "Modern minimal", am: "ዘመናዊ ቀላል" } }, { value: "traditional", label: { en: "Traditional", am: "ባህላዊ" } }, { value: "custom", label: { en: "Custom vision", am: "ልዩ ራዕይ" } }] },
    ]
  },
  {
    id: "sound",
    number: "07",
    group: "venue",
    title: { en: "Sound system", am: "የድምጽ ማጉያ ሲስተም" },
    description: { en: "Clear sound for vows, prayers, music, and every guest.", am: "ለቃል ኪዳን፣ ጸሎት፣ ሙዚቃ እና እንግዶች ግልጽ ድምጽ።" },
    options: [
      { id: "coverage", label: { en: "Coverage", am: "የሚሰማበት ቦታ" }, type: "multi", choices: [{ value: "ceremony", label: { en: "Ceremony", am: "ሥነ-ስርዓት" } }, { value: "reception", label: { en: "Reception", am: "ድግስ" } }, { value: "outdoor", label: { en: "Outdoor / procession", am: "የውጪ / ሰልፍ" } }] },
      { id: "technician", label: { en: "Technician", am: "ቴክኒሺያን" }, type: "single", choices: [{ value: "included", label: { en: "Included", am: "ተካቷል" } }, { value: "venue", label: { en: "Venue provides", am: "ቦታው ይሰጣል" } }, { value: "not-needed", label: { en: "Not needed", am: "አያስፈልግም" } }] }
    ]
  },
  {
    id: "instruments",
    number: "08",
    group: "venue",
    title: { en: "Mezmur instruments", am: "ዘማ መሳሪያ" },
    description: { en: "Choose the musical texture that carries the sacred moments.", am: "የቅዱሳን ጊዜያትን የሚያስተላልፍ የሙዚቃ መሳሪያ ይምረጡ።" },
    options: [
      { id: "instruments", label: { en: "Instrument set", am: "የመሳሪያ ስብስብ" }, type: "multi", choices: [{ value: "keyboard", label: { en: "Keyboard", am: "ኪቦርድ" } }, { value: "krar", label: { en: "Krar", am: "ክራር" } }, { value: "drums", label: { en: "Drums", am: "ከበሮ" } }, { value: "full-band", label: { en: "Full band", am: "ሙሉ ባንድ" } }] },
      { id: "soundcheck", label: { en: "Soundcheck", am: "የድምጽ ሙከራ" }, type: "toggle" }
    ]
  },
  {
    id: "choir",
    number: "09",
    group: "style",
    title: { en: "Choir, guest singers & teacher", am: "ህብረት፣ ተጋባዦች መዘምራን እና ተጋባዥ መምህር" },
    description: { en: "Coordinate the voices and guidance that make the gathering feel alive.", am: "ስብሰባውን ሕያው የሚያደርጉ ድምጾችን እና መምህራንን ያስተባብሩ።" },
    options: [
      { id: "voices", label: { en: "Who will sing", am: "የሚዘምሩት" }, type: "multi", choices: [{ value: "church-choir", label: { en: "Church choir", am: "የቤተ-ክርስቲያን ህብረት" } }, { value: "guest-singers", label: { en: "Guest singers", am: "ተጋባዥ ዘማሪዎች" } }, { value: "family", label: { en: "Family / guests", am: "ቤተሰብ / እንግዶች" } }, { value: "teacher", label: { en: "Guest teacher", am: "ተጋባዥ መምህር" } }] },
      { id: "repertoire", label: { en: "Song direction", am: "የመዝሙር መመሪያ" }, type: "text" }
    ]
  },
  {
    id: "cake-champagne",
    number: "10",
    group: "hospitality",
    title: { en: "Cake & champagne", am: "ኬክ እና champagne" },
    description: { en: "Finish the celebration with a considered toast and sweet table.", am: "በተመረጠ ጣፋጭ እና ምስጋና የደስታውን መጨረሻ ያሳምሩ።" },
    options: [
      { id: "include", label: { en: "Include", am: "የሚካተተው" }, type: "multi", choices: [{ value: "cake", label: { en: "Wedding cake", am: "የሰርግ ኬክ" } }, { value: "champagne", label: { en: "Champagne", am: "Champagne" } }, { value: "both", label: { en: "Cake cutting & toast", am: "ኬክ መቁረጥ እና ጥራጥሬ" } }] },
      { id: "servings", label: { en: "Servings / size", am: "መጠን / ብዛት" }, type: "text" },
      { id: "flavor", label: { en: "Flavor / preference", am: "ጣዕም / ምርጫ" }, type: "text" }
    ]
  },
  {
    id: "food-drinks",
    number: "11",
    group: "hospitality",
    title: { en: "Food & drinks", am: "ምግብ እና መጠጥ" },
    description: { en: "Make hospitality feel generous, organized, and true to the couple.", am: "እንግዳ አቀባበሉ በቂ፣ የተደራጀ እና ለጥንዶቹ የሚስማማ ይሁን።" },
    options: [
      { id: "service", label: { en: "Meal service", am: "የምግብ አቀራረብ" }, type: "single", choices: [{ value: "buffet", label: { en: "Buffet", am: "ቡፌ" } }, { value: "plated", label: { en: "Plated meal", am: "በሳህን የሚቀርብ" } }, { value: "cocktail", label: { en: "Cocktail / light bites", am: "ቀላል ምግብ" } }, { value: "traditional", label: { en: "Traditional menu", am: "ባህላዊ ምግብ" } }] },
      { id: "drinks", label: { en: "Drinks", am: "መጠጦች" }, type: "multi", choices: [{ value: "water", label: { en: "Water", am: "ውሃ" } }, { value: "soft-drinks", label: { en: "Soft drinks", am: "ለስላሳ መጠጦች" } }, { value: "coffee-tea", label: { en: "Coffee & tea", am: "ቡና እና ሻይ" } }, { value: "juice", label: { en: "Juice", am: "ጭማቂ" } }] },
      { id: "guests", label: { en: "Guest count", am: "የእንግዳ ብዛት" }, type: "number" }
    ]
  },
  {
    id: "attire",
    number: "12",
    group: "style",
    title: { en: "Attire & jewelry", am: "አለባበስ እና ጌጣጌጥ" },
    description: { en: "Coordinate the looks across the photo shoot, church, and hall program.", am: "ለፎቶ ስብስብ፣ ቤተ-ክርስቲያን እና አዳራሽ ፕሮግራም የሚስማማ አለባበስ ያዘጋጁ።" },
    options: [
      { id: "moments", label: { en: "Moments covered", am: "የሚሸፈኑ ጊዜያት" }, type: "multi", choices: [{ value: "photo-shoot", label: { en: "Photo shoot", am: "የፎቶ ስብስብ" } }, { value: "church", label: { en: "Church program", am: "የቤተ-ክርስቲያን ፕሮግራም" } }, { value: "hall", label: { en: "Hall program", am: "የአዳራሽ ፕሮግራም" } }] },
      { id: "people", label: { en: "For", am: "ለማን" }, type: "multi", choices: [{ value: "bride", label: { en: "Bride", am: "ሙሽራ" } }, { value: "groom", label: { en: "Groom", am: "ሙሽራው" } }, { value: "family", label: { en: "Family / wedding party", am: "ቤተሰብ / ሚዜ" } }] },
      { id: "jewelry", label: { en: "Jewelry direction", am: "የጌጣጌጥ ምርጫ" }, type: "text" }
    ]
  },
  {
    id: "transport",
    number: "13",
    group: "logistics",
    title: { en: "Cars & transport", am: "መኪና" },
    description: { en: "Make every arrival and departure feel easy and on time.", am: "የመግባት እና የመውጣት ጊዜዎች ቀላል እና በሰዓት እንዲሆኑ ያስተዳድሩ።" },
    options: [
      { id: "riders", label: { en: "Who needs transport", am: "መኪና የሚያስፈልጋቸው" }, type: "multi", choices: [{ value: "bride", label: { en: "Bride", am: "ሙሽራ" } }, { value: "groom", label: { en: "Groom", am: "ሙሽራው" } }, { value: "bridesmaids", label: { en: "Bridesmaids", am: "ሚዜዎች" } }, { value: "family", label: { en: "Family", am: "ቤተሰብ" } }] },
      { id: "vehicle", label: { en: "Vehicle type", am: "የመኪና አይነት" }, type: "single", choices: [{ value: "sedan", label: { en: "Sedan", am: "ሴዳን" } }, { value: "suv", label: { en: "SUV", am: "SUV" } }, { value: "van", label: { en: "Van / minibus", am: "ቫን / ሚኒባስ" } }, { value: "multiple", label: { en: "Multiple vehicles", am: "ብዙ መኪኖች" } }] },
      { id: "cars", label: { en: "Number of cars", am: "የመኪና ብዛት" }, type: "number" }
    ]
  },
  {
    id: "flowers",
    number: "14",
    group: "style",
    title: { en: "Flowers", am: "አበባ" },
    description: { en: "Carry one floral story from hand to car and ceremony.", am: "ከእጅ እስከ መኪና እና ሥነ-ስርዓት አንድ የአበባ ታሪክ ይፍጠሩ።" },
    options: [
      { id: "pieces", label: { en: "Floral pieces", am: "የአበባ አይነቶች" }, type: "multi", choices: [{ value: "hand", label: { en: "Hand bouquet", am: "የእጅ አበባ" } }, { value: "car", label: { en: "Car flowers", am: "የመኪና አበባ" } }, { value: "hall", label: { en: "Hall arrangements", am: "የአዳራሽ አበባ" } }, { value: "church", label: { en: "Church flowers", am: "የቤተ-ክርስቲያን አበባ" } }] },
      { id: "palette", label: { en: "Color palette", am: "የቀለም ምርጫ" }, type: "text" }
    ]
  },
  {
    id: "beauty",
    number: "15",
    group: "style",
    title: { en: "Beauty care", am: "የውበት መጠበቂያ" },
    description: { en: "Build a composed beauty schedule, including Morocco and facial care.", am: "Morocco እና facial እንክብካቤን የሚያካትት የውበት ፕሮግራም ያዘጋጁ።" },
    options: [
      { id: "care", label: { en: "Care services", am: "የእንክብካቤ አገልግሎት" }, type: "multi", choices: [{ value: "morocco", label: { en: "Morocco bath", am: "Morocco" } }, { value: "facial", label: { en: "Facial", am: "Facial" } }, { value: "makeup", label: { en: "Makeup", am: "ሜካፕ" } }, { value: "hair", label: { en: "Hair styling", am: "የጸጉር አሰራር" }, }, { value: "nails", label: { en: "Nails", am: "ጥፍር" } }] },
      { id: "for", label: { en: "For", am: "ለማን" }, type: "multi", choices: [{ value: "bride", label: { en: "Bride", am: "ሙሽራ" } }, { value: "groom", label: { en: "Groom", am: "ሙሽራው" } }, { value: "party", label: { en: "Wedding party", am: "የሰርግ ቡድን" } }] },
      { id: "appointment", label: { en: "Appointment time", am: "የቀጠሮ ሰዓት" }, type: "text" }
    ]
  },
  {
    id: "generator",
    number: "16",
    group: "logistics",
    title: { en: "Generator", am: "Generator" },
    description: { en: "Keep the day steady with a clear power backup plan.", am: "ዝግጅቱ በጥሩ ሁኔታ እንዲቀጥል የኃይል መጠባበቂያ ዕቅድ ያዘጋጁ።" },
    options: [
      { id: "need", label: { en: "Power plan", am: "የኃይል እቅድ" }, type: "single", choices: [{ value: "rental", label: { en: "Rental needed", am: "ኪራይ ያስፈልጋል" } }, { value: "venue", label: { en: "Venue provides", am: "ቦታው ይሰጣል" } }, { value: "client", label: { en: "Client provides", am: "ደንበኛው ያቀርባል" } }] },
      { id: "capacity", label: { en: "Capacity / size", am: "አቅም / መጠን" }, type: "text" },
      { id: "fuel", label: { en: "Fuel plan", am: "የነዳጅ እቅድ" }, type: "single", choices: [{ value: "included", label: { en: "Included", am: "ተካቷል" } }, { value: "separate", label: { en: "Separate", am: "የተለየ" } }] }
    ]
  },
  {
    id: "ac",
    number: "17",
    group: "logistics",
    title: { en: "Air conditioning", am: "Ac" },
    description: { en: "Keep the hall comfortable for the couple, clergy, and guests.", am: "ለጥንዶቹ፣ ለካህናት እና ለእንግዶች ምቹ የሆነ አዳራሽ ያዘጋጁ።" },
    options: [
      { id: "provision", label: { en: "Provision", am: "አቅርቦት" }, type: "single", choices: [{ value: "venue", label: { en: "Venue AC", am: "የአዳራሽ AC" } }, { value: "portable", label: { en: "Portable AC / fans", am: "ተንቀሳቃሽ AC / ፋን" } }, { value: "not-needed", label: { en: "Not needed", am: "አያስፈልግም" } }] },
      { id: "areas", label: { en: "Areas covered", am: "የሚሸፈኑ ቦታዎች" }, type: "multi", choices: [{ value: "hall", label: { en: "Main hall", am: "ዋና አዳራሽ" } }, { value: "bridal", label: { en: "Bridal room", am: "የሙሽራ ክፍል" } }, { value: "church", label: { en: "Church", am: "ቤተ-ክርስቲያን" } }] }
    ]
  },
  {
    id: "checklist",
    number: "18",
    group: "logistics",
    title: { en: "Equipment checklist", am: "የእቃዎች checklist" },
    description: { en: "A shared list that keeps small but important items visible.", am: "ትንንሽ ነገሮችም እንዳይረሱ የሚያደርግ የጋራ ዝርዝር።" },
    options: [
      { id: "scope", label: { en: "Checklist scope", am: "የchecklist ወሰን" }, type: "multi", choices: [{ value: "church", label: { en: "Church items", am: "የቤተ-ክርስቲያን ዕቃዎች" } }, { value: "hall", label: { en: "Hall items", am: "የአዳራሽ ዕቃዎች" } }, { value: "personal", label: { en: "Personal items", am: "የግል ዕቃዎች" } }, { value: "vendor", label: { en: "Vendor handoff", am: "ለአቅራቢ ማስረከብ" } }] },
      { id: "owner", label: { en: "Checklist owner", am: "የchecklist ኃላፊ" }, type: "single", choices: [{ value: "planner", label: { en: "Planner", am: "እቅድ አውጪ" } }, { value: "couple", label: { en: "Couple", am: "ጥንዶቹ" } }, { value: "shared", label: { en: "Shared", am: "በጋራ" } }] },
      { id: "items", label: { en: "Must-have items", am: "አስፈላጊ ዕቃዎች" }, type: "text" }
    ]
  },
  {
    id: "rehearsal",
    number: "19",
    group: "spiritual",
    title: { en: "Rehearsal & song study", am: "Rehearsal እና መዝሙር ጥናት" },
    description: { en: "Walk through the sequence, the music, and the calm of the day.", am: "የዝግጅቱን ሂደት፣ መዝሙር እና የቀኑን ሰላም አስቀድመው ይለማመዱ።" },
    options: [
      { id: "includes", label: { en: "Includes", am: "የሚካተተው" }, type: "multi", choices: [{ value: "walkthrough", label: { en: "Day walkthrough", am: "የቀኑ ልምምድ" } }, { value: "mezmur", label: { en: "Mezmur study", am: "የመዝሙር ጥናት" } }, { value: "kidase", label: { en: "Kidase rehearsal", am: "የቅዳሴ ልምምድ" } }, { value: "roles", label: { en: "Role practice", am: "የሚና ልምምድ" } }] },
      { id: "timing", label: { en: "When", am: "መቼ" }, type: "single", choices: [{ value: "two-three-weeks", label: { en: "2–3 weeks before", am: "ከ2–3 ሳምንት በፊት" } }, { value: "one-week", label: { en: "One week before", am: "ከ1 ሳምንት በፊት" } }, { value: "custom", label: { en: "Custom date", am: "ልዩ ቀን" } }] },
      { id: "date", label: { en: "Rehearsal date", am: "የልምምድ ቀን" }, type: "date" }
    ]
  },
  {
    id: "invitation",
    number: "20",
    group: "style",
    title: { en: "Invitation cards", am: "መጥሪያ ካርድ" },
    description: { en: "Give the invitation a voice that feels like the couple.", am: "መጥሪያው የጥንዶቹን ድምጽ እና ውበት እንዲያሳይ ያድርጉ።" },
    options: [
      { id: "format", label: { en: "Format", am: "ቅርጽ" }, type: "multi", choices: [{ value: "printed", label: { en: "Printed", am: "የታተመ" } }, { value: "digital", label: { en: "Digital", am: "ዲጂታል" } }, { value: "both", label: { en: "Printed & digital", am: "የታተመ እና ዲጂታል" } }] },
      { id: "quantity", label: { en: "Quantity", am: "ብዛት" }, type: "number" },
      { id: "language", label: { en: "Language / style", am: "ቋንቋ / ዘይቤ" }, type: "multi", choices: [{ value: "amharic", label: { en: "Amharic", am: "አማርኛ" } }, { value: "english", label: { en: "English", am: "እንግሊዝኛ" } }, { value: "bilingual", label: { en: "Bilingual", am: "ሁለት ቋንቋ" } }] }
    ]
  },
  {
    id: "nurse",
    number: "21",
    group: "logistics",
    title: { en: "Emergency nurse", am: "Emergency Nurse" },
    description: { en: "Have a calm, capable point of care close at hand.", am: "በአቅራቢያ የሚገኝ የአደጋ ጊዜ እንክብካቤ ይኑር።" },
    options: [
      { id: "coverage", label: { en: "Coverage", am: "የሚሸፍነው ጊዜ" }, type: "single", choices: [{ value: "full-day", label: { en: "Full wedding day", am: "ሙሉ የሰርግ ቀን" } }, { value: "ceremony", label: { en: "Ceremony only", am: "ሥነ-ስርዓት ብቻ" } }, { value: "on-call", label: { en: "On-call", am: "በጥሪ ጊዜ" } }] },
      { id: "hours", label: { en: "Hours", am: "ሰዓታት" }, type: "text" },
      { id: "contact", label: { en: "Provider / contact", am: "አቅራቢ / አድራሻ" }, type: "text" }
    ]
  }
];

const groupLabels = {
  en: { spiritual: "Spiritual & church", venue: "Venue & atmosphere", hospitality: "Hospitality", style: "Style & people", logistics: "Logistics & readiness" },
  am: { spiritual: "መንፈሳዊ እና ቤተ-ክርስቲያን", venue: "ቦታ እና ድባብ", hospitality: "እንግዳ አቀባበል", style: "ውበት እና ሰዎች", logistics: "ዝግጅት እና አስተዳደር" }
};

const fieldIds = ["brideName", "bridePhone", "brideAddress", "groomName", "groomPhone", "groomAddress", "weddingDate", "weddingTime", "eventDays", "totalFee", "generalNotes"];
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
let toastTimer;
let savingRecord = false;
let recordStatus = "newPlan";
let savedPlanSignature = "";
let documentJob = 0;
let exportingPdf = false;
let openingRecord = false;

function t(key) {
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
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat(state.lang === "am" ? "am-ET" : "en-ET", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)} ETB`;
}

function formatDate(value) {
  if (!value) return t("dateNotSet");
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(state.lang === "am" ? "am-ET" : "en-ET", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function formatTime(value) {
  if (!value) return t("timeNotSet");
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return value;
  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);
  return new Intl.DateTimeFormat(state.lang === "am" ? "am-ET" : "en-ET", { hour: "numeric", minute: "2-digit" }).format(date);
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
  if (option.type === "single") return option.choices?.[0]?.value || "";
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
  document.querySelectorAll("[data-placeholder-en]").forEach((element) => {
    element.placeholder = state.lang === "am" ? (element.dataset.placeholderAm || element.dataset.placeholderEn) : element.dataset.placeholderEn;
  });
  document.querySelectorAll(".language-button").forEach((button) => button.classList.toggle("is-active", button.dataset.language === state.lang));
  document.title = state.lang === "am" ? "ማትሪሞኒ በሀና · የዝግጅት እቅድ" : "Matrimony By Hanna · Event Planner";
  renderServices();
  renderReview();
  if (state.currentStep === 3) renderAgreement();
  if (state.currentStep === 4) renderProforma();
  if (state.currentStep === 5) renderRecords();
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

function saveDraft(markDirty = true) {
  if (markDirty && state.recordId && planSignature() !== savedPlanSignature) recordStatus = "recordDirty";
  renderCoupleContext();
  clearTimeout(saveTimer);
  const saveState = document.getElementById("saveState");
  saveState?.classList.add("is-saving");
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, details: state.details, services: state.services, recordId: state.recordId, savedAt: new Date().toISOString() }));
      saveState?.classList.remove("is-saving");
      if (saveState) saveState.querySelector("span:last-child").textContent = t("savedLocally");
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
  document.querySelectorAll("[data-venue-location]").forEach((input) => {
    state.details.venues[input.dataset.venueLocation] = input.value;
  });
  state.details.scopeFullPlanning = Boolean(document.getElementById("scopeFullPlanning")?.checked);
  state.details.scopeDayOfCoordination = Boolean(document.getElementById("scopeDayOf")?.checked);
  const consent = document.querySelector('input[name="mediaConsent"]:checked');
  if (consent) state.details.mediaConsent = consent.value;
  updateBalance();
  renderReview();
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
  document.getElementById("sidebarCoupleName").textContent = title;
  document.getElementById("topbarCoupleName").textContent = names.length ? title : "";
  document.getElementById("sidebarCoupleMeta").textContent = `${t(savingRecord ? "recordSaving" : recordStatus)}${state.recordId ? ` · #${state.recordId}` : ""}${state.details.weddingDate ? ` · ${formatDate(state.details.weddingDate)}` : ""}`;
  const recent = document.getElementById("recentCouples");
  recent.innerHTML = state.records.length ? state.records.slice(0, 5).map(record => `<button type="button" class="recent-couple ${record.id === state.recordId ? "is-current" : ""}" data-open-record="${record.id}"><strong>${escapeHtml(record.bride_first_name)} &amp; ${escapeHtml(record.groom_first_name)}</strong><small>${escapeHtml(formatDate(record.wedding_date))} · #${record.id}</small></button>`).join("") : `<p>${escapeHtml(t("recentEmpty"))}</p>`;
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
    control = `<select data-service-id="${service.id}" data-option-id="${option.id}">${option.choices.map((choice) => `<option value="${escapeHtml(choice.value)}" ${value === choice.value ? "selected" : ""}>${escapeHtml(localized(choice.label))}</option>`).join("")}</select>`;
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

function renderServiceCard(service) {
  const serviceState = getServiceState(service.id);
  const title = localized(service.title);
  const description = localized(service.description);
  const options = service.options.map((option) => renderOption(service, option, serviceState)).join("");
  return `<article class="service-card ${serviceState.selected ? "is-selected" : ""}" data-service-card="${service.id}">
    <div class="service-main">
      <div class="service-icon" aria-hidden="true">${service.number}</div>
      <div class="service-copy">
        <div class="service-group">${escapeHtml(groupLabels[state.lang][service.group])}</div>
        <h3 class="service-title">${escapeHtml(title)}</h3>
        <p class="service-description">${escapeHtml(description)}</p>
      </div>
      <button class="service-toggle" type="button" data-service-toggle="${service.id}" aria-label="${escapeHtml(title)}" aria-pressed="${serviceState.selected ? "true" : "false"}"></button>
    </div>
    <div class="service-options">
      <div class="options-grid">${options}</div>
      <label class="service-option is-wide" style="margin-top:12px"><span class="service-option-label">${escapeHtml(t("serviceNotes"))}</span><textarea rows="2" data-service-notes="${service.id}" placeholder="${escapeHtml(t("serviceNotesPlaceholder"))}">${escapeHtml(serviceState.notes || "")}</textarea></label>
    </div>
  </article>`;
}

function renderServices() {
  const grid = document.getElementById("servicesGrid");
  if (!grid) return;
  const search = state.serviceSearch.trim().toLocaleLowerCase();
  const visible = services.filter((service) => {
    const matchesGroup = state.serviceFilter === "all" || service.group === state.serviceFilter;
    const haystack = `${localized(service.title)} ${localized(service.description)} ${localized(groupLabels[state.lang][service.group])}`.toLocaleLowerCase();
    return matchesGroup && (!search || haystack.includes(search));
  });
  grid.innerHTML = visible.length ? visible.map(renderServiceCard).join("") : `<div class="empty-services">${escapeHtml(t("noMatches"))}</div>`;
  const count = selectedServices().length;
  const selectedCount = document.getElementById("selectedCount");
  if (selectedCount) selectedCount.textContent = String(count);
  reconcileServiceTotal();
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

function reviewLine(label, value) {
  return `<div class="review-line"><span>${escapeHtml(label)}</span><span>${escapeHtml(value || t("notProvided"))}</span></div>`;
}

function renderReview() {
  const details = state.details;
  const people = document.getElementById("reviewPeople");
  const event = document.getElementById("reviewEvent");
  const financial = document.getElementById("reviewFinancial");
  const reviewServices = document.getElementById("reviewServices");
  if (!people || !event || !financial || !reviewServices) return;
  people.innerHTML = `<div class="review-card-heading"><h3>${escapeHtml(t("people"))}</h3><span>01</span></div><div class="review-lines">${reviewLine(t("brideName"), details.brideName)}${reviewLine(t("groomName"), details.groomName)}${reviewLine(t("bridePhone"), details.bridePhone)}${reviewLine(t("groomPhone"), details.groomPhone)}</div>`;
  event.innerHTML = `<div class="review-card-heading"><h3>${escapeHtml(t("event"))}</h3><span>02</span></div><div class="review-lines">${reviewLine(t("weddingDate"), formatDate(details.weddingDate))}${reviewLine(t("eventDays"), details.eventDays || "1")}${reviewLine(t("weddingTime"), formatTime(details.weddingTime))}${reviewLine(t("eventVenues"), eventVenueSummary())}</div>`;
  const total = Number(details.totalFee) || 0;
  const schedule = paymentSchedule(total);
  financial.innerHTML = `<div class="review-card-heading"><h3>${escapeHtml(t("financial"))}</h3><span>03</span></div><div class="review-financial"><div class="review-number"><span>${escapeHtml(t("total"))}</span><strong>${escapeHtml(formatMoney(total))}</strong></div><div class="review-number"><span>${escapeHtml(t("advancePayment"))}</span><strong>${escapeHtml(formatMoney(schedule.advance))}</strong></div><div class="review-number"><span>${escapeHtml(t("midtermPayment"))}</span><strong>${escapeHtml(formatMoney(schedule.midterm))}</strong></div><div class="review-number"><span>${escapeHtml(t("finalPayment"))}</span><strong>${escapeHtml(formatMoney(schedule.final))}</strong></div></div>${details.generalNotes ? `<div class="review-lines" style="margin-top:14px">${reviewLine(t("reviewNotes"), details.generalNotes)}</div>` : ""}`;
  const selected = selectedServices();
  const serviceItems = selected.map((service) => {
    const summary = serviceOptionSummary(service);
    return `<li><div><strong>${escapeHtml(localized(service.title))}</strong>${summary.length ? `<small>${escapeHtml(summary.join(" · "))}</small>` : ""}</div></li>`;
  }).join("");
  const scope = [details.scopeFullPlanning && t("scopeFullPlanning"), details.scopeDayOfCoordination && t("scopeDayOf")].filter(Boolean);
  reviewServices.innerHTML = `<div class="review-card-heading"><h3>${escapeHtml(t("agreedServices"))}</h3><span>${selected.length} / 21</span></div>${scope.length ? `<div class="review-scope-line">${scope.map(escapeHtml).join(" · ")}</div>` : ""}${selected.length ? `<ul class="review-services-list">${serviceItems}</ul>` : `<div class="review-empty">${escapeHtml(t("noServices"))}</div>`}`;
}

function detail(value, fallback = "") {
  return escapeHtml(value || fallback || t("notProvided"));
}

function renderAgreement() {
  const container = document.getElementById("agreementDocument");
  if (!container) return;
  const d = state.details;
  const selected = selectedServices();
  const agreementDate = formatDate(dateInputValue());
  const premarital = services.find(service => service.id === "premarital");
  const premaritalSummary = premarital && getServiceState("premarital").selected ? serviceOptionSummary(premarital) : [];
  const packageRows = [
    [t("scopePremarital"), Boolean(getServiceState("premarital").selected), premaritalSummary],
    [t("scopeFullPlanning"), Boolean(d.scopeFullPlanning), []],
    [t("scopeDayOf"), Boolean(d.scopeDayOfCoordination), []]
  ].map(([label, checked, summary]) => `<li class="agreement-check-row"><span class="contract-checkbox${checked ? " is-checked" : ""}" aria-hidden="true">${checked ? "✓" : ""}</span><div><strong>${escapeHtml(label)}</strong>${summary.length ? `<small>${escapeHtml(summary.join(" · "))}</small>` : ""}</div></li>`).join("");
  const addOns = selected.filter(service => service.id !== "premarital").map((service) => {
    const summary = serviceOptionSummary(service);
    return `<li><strong>${escapeHtml(localized(service.title))}</strong>${summary.length ? `<div class="service-selection-detail">${escapeHtml(summary.join(" · "))}</div>` : ""}</li>`;
  }).join("");
  const total = Number(d.totalFee) || 0;
  const schedule = paymentSchedule(total);
  const weddingDate = d.weddingDate ? formatDate(d.weddingDate) : "____________________________";
  const eventVenueRows = selectedEventVenues().map((venue) => `<div class="event-venue-document-row"><strong>${escapeHtml(venue.label)}</strong><span>${detail(venue.name, t("notSet"))}</span></div>`).join("") || `<div class="doc-value">${escapeHtml(t("notSet"))}</div>`;
  const intro = `${escapeHtml(t("introAgreement"))} <strong>${escapeHtml(weddingDate)}</strong>. ${escapeHtml(t("introAgreementEnd"))}`;
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
    <h2 class="agreement-title">${escapeHtml(state.lang === "am" ? "የሰርግ እና የቅድመ-ጋብቻ አገልግሎት ውል" : "Wedding & Premarital Service Agreement")}<span>${escapeHtml(state.lang === "am" ? "በማትሪሞኒ ባይ ሃና" : "By Matrimony by Hanna")}</span></h2>
    <div class="agreement-top-rule"></div>
    <div class="agreement-meta">
      <div><div class="doc-label">${escapeHtml(t("agreementDate"))}</div><div class="doc-value">${escapeHtml(agreementDate)}</div></div>
      <div><div class="doc-label">${escapeHtml(t("weddingDateAgreement"))}</div><div class="doc-value">${escapeHtml(formatDate(d.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventDays"))}</div><div class="doc-value">${escapeHtml(d.eventDays || "1")}</div></div>
    </div>
    <section><h3>${escapeHtml(t("agreementParties"))}</h3><div class="provider-details">
      <div class="provider-details-card"><div class="doc-label">${escapeHtml(t("providerDetails"))}</div><strong>Matrimony by Hanna</strong><div class="provider-contact-lines"><p>${escapeHtml(t("providerPhone"))}</p><p>${escapeHtml(t("providerEmail"))}</p><p>${escapeHtml(t("providerOffice"))}</p></div></div>
      <div class="bank-details-card"><div class="doc-label">${escapeHtml(t("providerBank"))}</div><div class="bank-detail-row"><span>${escapeHtml(t("bankName"))}</span><i aria-hidden="true"></i></div><div class="bank-detail-row"><span>${escapeHtml(t("bankAccountNo"))}</span><i aria-hidden="true"></i></div><div class="bank-detail-row"><span>${escapeHtml(t("bankAccountHolder"))}</span><i aria-hidden="true"></i></div></div>
    </div><div class="party-grid">
      <div><div class="doc-label">${escapeHtml(t("brideName"))}</div><div class="doc-value">${detail(d.brideName, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("groomName"))}</div><div class="doc-value">${detail(d.groomName, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("bridePhone"))}</div><div class="doc-value">${detail(d.bridePhone, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("groomPhone"))}</div><div class="doc-value">${detail(d.groomPhone, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("brideAddress"))}</div><div class="doc-value">${detail(d.brideAddress, "____________________________")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("groomAddress"))}</div><div class="doc-value">${detail(d.groomAddress, "____________________________")}</div></div>
    </div></section>
    <p class="intro-paragraph">${intro}</p>
    <section><h3>${escapeHtml(t("eventDetails"))}</h3><div class="agreement-details-grid">
      <div><div class="doc-label">${escapeHtml(t("weddingDateAgreement"))}</div><div class="doc-value">${escapeHtml(formatDate(d.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("timeAgreement"))}</div><div class="doc-value">${escapeHtml(formatTime(d.weddingTime))}</div></div>
      <div class="event-venues-document"><div class="doc-label">${escapeHtml(t("eventVenuesAgreement"))}</div>${eventVenueRows}</div>
    </div></section>
    <section class="agreed-services"><h3>${escapeHtml(t("contractScopeTitle"))}</h3><p>${escapeHtml(t("agreedIntro"))}</p><ul class="contract-package-list">${packageRows}</ul><h4>${escapeHtml(t("otherAddons"))}</h4><ol class="agreed-services-list">${addOns || `<li>${escapeHtml(t("noAddons"))}</li>`}</ol></section>
    <section><h3>${escapeHtml(t("termsHeading"))}</h3><h4>${escapeHtml(t("vendorHeading"))}</h4><p>${escapeHtml(t("vendorScope"))}</p><h4>${escapeHtml(t("providerResponsibilityHeading"))}</h4><p>${escapeHtml(t("providerResponsibility"))}</p><h4>${escapeHtml(t("clientResponsibilityHeading"))}</h4><p>${escapeHtml(t("clientResponsibility"))}</p></section>
    <section><h3>${escapeHtml(t("paymentTerms"))}</h3><p>${escapeHtml(t("financialIntro"))} <strong>${escapeHtml(formatMoney(total))}</strong>.</p><div class="payment-stage-list">
      <div class="payment-stage"><div><strong>${escapeHtml(t("advancePayment"))}</strong><small>${escapeHtml(t("advanceTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.advance))}</b></div>
      <div class="payment-stage"><div><strong>${escapeHtml(t("midtermPayment"))}</strong><small>${escapeHtml(t("midtermTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.midterm))}</b></div>
      <div class="payment-stage"><div><strong>${escapeHtml(t("finalPayment"))}</strong><small>${escapeHtml(t("finalTerms"))}</small></div><b>${escapeHtml(formatMoney(schedule.final))}</b></div>
    </div><p>${escapeHtml(t("bankOnly"))}</p></section>
    <section><h3>${escapeHtml(t("changesHeading"))}</h3><p>${escapeHtml(t("scopeChanges"))}</p><p>${escapeHtml(t("forceMajeure"))}</p><p>${escapeHtml(t("cancellationTerms"))}</p></section>
    <section><h3>${escapeHtml(t("mediaTermsHeading"))}</h3><div class="agreement-consent"><span class="contract-checkbox${d.mediaConsent === "yes" ? " is-checked" : ""}" aria-hidden="true">${d.mediaConsent === "yes" ? "✓" : ""}</span><p>${escapeHtml(d.mediaConsent === "yes" ? t("mediaConsentYes") : t("mediaConsentNo"))}</p></div><p>${escapeHtml(d.mediaConsent === "yes" ? t("mediaTermsYes") : t("mediaTermsNo"))}</p></section>
    <section><h3>${escapeHtml(t("amendmentsHeading"))}</h3><p>${escapeHtml(t("amendmentsTerms"))}</p></section>
    ${d.generalNotes ? `<section><h3>${escapeHtml(t("reviewNotes"))}</h3><p>${escapeHtml(d.generalNotes)}</p></section>` : ""}
    <section><h3>${escapeHtml(t("signatureHeading"))}</h3><p>${escapeHtml(t("signatureIntro"))}</p><div class="signature-grid">
      <div class="signature-block"><div class="signature-line">${detail(d.groomName, "____________________")} · ${escapeHtml(t("clientGroomSignature"))}</div><div class="signature-line">${escapeHtml(t("date"))}</div></div>
      <div class="signature-block"><div class="signature-line">${detail(d.brideName, "____________________")} · ${escapeHtml(t("clientBrideSignature"))}</div><div class="signature-line">${escapeHtml(t("date"))}</div></div>
      <div class="signature-block"><div class="signature-line">${escapeHtml(t("providerSignature"))}</div><div class="signature-line">${escapeHtml(t("date"))}</div></div>
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
  const issueDate = formatDate(dateInputValue());
  const reference = documentReference("PF");
  const serviceRows = selected.map((service) => {
    const summary = serviceOptionSummary(service);
    return `<li class="proforma-item"><div><strong>${escapeHtml(localized(service.title))}</strong>${summary.length ? `<small>${escapeHtml(summary.join(" · "))}</small>` : ""}</div></li>`;
  }).join("");
  container.innerHTML = `<article class="agreement-paper proforma-paper">
    <div class="agreement-kicker">MATRIMONY BY HANNA <span aria-hidden="true">·</span> ${escapeHtml(t("proformaEyebrow"))}</div>
    <h2 class="agreement-title">${escapeHtml(t("proformaDocumentTitle"))}<span>${escapeHtml(t("proformaDescription"))}</span></h2>
    <div class="proforma-couple"><div class="doc-label">${escapeHtml(t("proformaPreparedFor"))}</div><strong>${detail(details.brideName)} <span>&amp;</span> ${detail(details.groomName)}</strong></div>
    <div class="proforma-facts">
      <div><div class="doc-label">${escapeHtml(t("weddingDate"))}</div><div class="doc-value">${escapeHtml(formatDate(details.weddingDate))}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventDays"))}</div><div class="doc-value">${escapeHtml(details.eventDays || "1")}</div></div>
      <div><div class="doc-label">${escapeHtml(t("eventVenues"))}</div><div class="doc-value">${escapeHtml(eventVenueSummary())}</div></div>
    </div>
    <section class="proforma-items"><h3>${escapeHtml(t("proformaScope"))}</h3><ul class="proforma-service-list">${serviceRows}</ul></section>
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
    return !last || last.getBoundingClientRect().bottom - body.getBoundingClientRect().top <= body.clientHeight - reserve;
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

async function recordsRequest(path, options) {
  const response = await fetch(`/api/records${path}`, {
    ...options,
    signal: AbortSignal.timeout(12000),
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) }
  });
  let result;
  try { result = await response.json(); } catch { throw new Error(t("recordUnavailable")); }
  if (!response.ok) throw new Error(result.error || t("recordUnavailable"));
  return result;
}

function renderRecords() {
  const list = document.getElementById("recordsList");
  if (!list) return;
  document.getElementById("recordsCount").textContent = state.records.length;
  const query = document.getElementById("recordsSearch")?.value.trim().toLocaleLowerCase() || "";
  const matches = state.records.filter(record =>
    `${record.bride_first_name} ${record.groom_first_name}`.toLocaleLowerCase().includes(query));
  if (!matches.length) {
    list.innerHTML = `<div class="records-empty">${escapeHtml(t(state.records.length ? "recordsNoMatches" : "recordsEmpty"))}</div>`;
    return;
  }
  list.innerHTML = matches.map(record => `<article class="record-card">
    <div class="record-mark" aria-hidden="true">∞</div>
    <div class="record-main"><h2>${escapeHtml(record.bride_first_name)} <span>&amp;</span> ${escapeHtml(record.groom_first_name)}</h2>
      <p>${escapeHtml(t("weddingDate"))}: ${escapeHtml(formatDate(record.wedding_date))}</p></div>
    <button class="button button-quiet" type="button" data-open-record="${record.id}">${escapeHtml(t("openRecord"))}${iconUse("open")}</button>
  </article>`).join("");
}

async function loadRecords() {
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

async function saveRecord({ silent = false } = {}) {
  if (savingRecord) return;
  syncDetailsFromForm();
  if (!state.details.brideName?.trim() || !state.details.groomName?.trim()) {
    if (!silent) showValidation([{id:"brideName", message:t("nameRequired")}, {id:"groomName", message:t("nameRequired")}].filter(error => !state.details[error.id]?.trim()), 0);
    return;
  }
  savingRecord = true;
  recordStatus = "recordSaving";
  renderCoupleContext();
  document.querySelectorAll("[data-save-record], [data-open-record], #resetDraftButton").forEach(button => button.disabled = true);
  const signature = planSignature();
  const id = state.recordId;
  try {
    const result = await recordsRequest(id ? `/${id}` : "", {
      method: id ? "PUT" : "POST",
      body: signature
    });
    state.recordId = result.id;
    savedPlanSignature = signature;
    recordStatus = planSignature() === signature ? "recordReady" : "recordDirty";
    saveDraft(false);
    try { state.records = (await recordsRequest("")).records; } catch { /* The record was saved even if refreshing the list fails. */ }
    renderRecords();
    if (!silent) showToast(t("recordSaved"));
  } catch (error) {
    recordStatus = "localOnly";
    if (!silent) showToast(error.message || t("recordUnavailable"));
  } finally {
    savingRecord = false;
    document.querySelectorAll("[data-save-record], [data-open-record], #resetDraftButton").forEach(button => button.disabled = false);
    renderCoupleContext();
  }
}

async function openRecord(id) {
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
    savedPlanSignature = planSignature();
    recordStatus = "recordReady";
    fieldIds.forEach(field => { document.getElementById(field).value = state.details[field] ?? ""; });
    syncEventVenueChoicesToForm();
    syncContractChoicesToForm();
    applyLocalization();
    clearValidation();
    setStep(0);
    window.dispatchEvent(new Event("plan-ui-update"));
    showToast(t("recordOpened"));
  } catch (error) {
    showToast(error.message || t("recordUnavailable"));
  } finally {
    openingRecord = false;
    document.querySelector('.app-shell').inert = false;
  }
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
    link.classList.toggle("is-complete", target < state.currentStep);
  });
  document.querySelectorAll(".workflow-nav [data-step-target]").forEach(button => {
    const active = Number(button.dataset.stepTarget) === state.currentStep;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  const stepCount = document.getElementById("workflowStepCount");
  if (stepCount) stepCount.textContent = `${String(state.currentStep + 1).padStart(2, "0")} / 06`;
  window.dispatchEvent(new Event("plan-step-change"));
  if (state.currentStep === 1) renderServices();
  if (state.currentStep === 2) renderReview();
  if (state.currentStep === 3) {
    renderReview();
    prepareDocument("agreement");
    saveRecord({ silent: true });
  }
  if (state.currentStep === 4) {
    prepareDocument("proforma");
    saveRecord({ silent: true });
  }
  if (state.currentStep === 5) loadRecords();
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
  if (state.details.totalFee === "" || state.details.totalFee === undefined || state.details.totalFee === null) {
    errors.push({ id:"totalFee", message:t("totalFeeRequired") });
  } else if (!hasValidPrice(state.details.totalFee)) {
    errors.push({ id:"totalFee", message:t("amountInvalid") });
  }
  if (errors.length) return showValidation(errors, 0);
  if (!selectedServices().length) {
    return showValidation([{message:t("noServicesWarning")}], 1);
  }
  return true;
}

function validateBeforeProforma() {
  return validateBeforeAgreement();
}

function toggleService(serviceId) {
  const serviceState = getServiceState(serviceId);
  serviceState.selected = !serviceState.selected;
  saveDraft();
  renderServices();
  renderReview();
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
  renderReview();
}

function clearDraft() {
  if (savingRecord || exportingPdf) return;
  if (!window.confirm(state.lang === "am" ? "ይህን ረቂቅ ማጥፋት ይፈልጋሉ?" : "Clear this plan and start a new one?")) return;
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
  renderReview();
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
  document.title = `${kind === "proforma" ? "Proforma" : "Service Agreement"} - ${couple} - Matrimony By Hanna`;
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-mode');
    panel.classList.remove('is-print-target');
    panel.querySelector('.agreement-document').prepend(printLetterhead);
    document.title = previousTitle;
  }, { once: true });
  window.print();
}

async function downloadDocument(kind) {
  if (exportingPdf || !(kind === "proforma" ? validateBeforeProforma() : validateBeforeAgreement())) return;
  exportingPdf = true;
  const buttons = document.querySelectorAll("[data-download-pdf], #printAgreementButton, #printProformaButton");
  buttons.forEach(button => button.disabled = true);
  const trigger = document.querySelector(`[data-download-pdf="${kind}"] span:last-child`);
  const previousLabel = trigger.textContent;
  trigger.textContent = t("pdfPreparing");
  let stage;
  try {
    if (!window.html2canvas || !window.jspdf?.jsPDF) throw new Error("PDF libraries unavailable");
    const container = await prepareDocument(kind);
    if (!container) throw new Error("Document preparation failed");
    // A desktop-sized snapshot isolates export from mobile layout and later form edits.
    stage = document.createElement("div");
    stage.className = "pdf-export-stage";
    const pages = Array.from(container.querySelectorAll(".letterhead-sheet"), sheet => sheet.cloneNode(true));
    const letterhead = container.querySelector('.letterhead-art');
    document.body.append(stage);
    const pdf = new window.jspdf.jsPDF({ orientation:"portrait", unit:"mm", format:"a4", compress:true });
    const couple = `${firstName(state.details.brideName)} & ${firstName(state.details.groomName)}`;
    pdf.setProperties({ title:`${kind === "proforma" ? "Proforma" : "Service Agreement"} - ${couple}`, author:"Matrimony By Hanna", subject:documentReference(kind === "proforma" ? "PF" : "AG") });
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
    const filename = `Matrimony-${kind === "proforma" ? "Proforma" : "Agreement"}-${couple.replace(/[<>:"/\\|?*]/g, "").trim()}-${state.details.weddingDate}.pdf`;
    pdf.save(filename);
    showToast(t("pdfReady"));
  } catch (error) {
    console.error("PDF download failed", error);
    showToast(t("pdfFailed"));
  } finally {
    stage?.remove();
    exportingPdf = false;
    buttons.forEach(button => button.disabled = false);
    trigger.textContent = previousLabel;
  }
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (exportingPdf) return;
    const download = event.target.closest("[data-download-pdf]");
    if (download) { downloadDocument(download.dataset.downloadPdf); return; }
    if (event.target.closest("[data-save-record]")) { saveRecord(); return; }
    const languageButton = event.target.closest("[data-language]");
    if (languageButton) {
      state.lang = languageButton.dataset.language === "am" ? "am" : "en";
      applyLocalization();
      saveDraft();
      return;
    }
    const recordButton = event.target.closest("[data-open-record]");
    if (recordButton) {
      openRecord(Number(recordButton.dataset.openRecord));
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
      if (target === 3 && !validateBeforeAgreement()) return;
      if (target === 4 && !validateBeforeProforma()) return;
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
      if (target === 3 && !validateBeforeAgreement()) return;
      if (target === 4 && !validateBeforeProforma()) return;
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
    if (event.target.closest("#saveRecordButton")) {
      saveRecord();
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
    if (target.matches("[data-service-notes]")) {
      getServiceState(target.dataset.serviceNotes).notes = target.value;
      saveDraft();
      renderReview();
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
  loadDraft();
  normalizeEventVenues();
  if (!state.details.mediaConsent) state.details.mediaConsent = "no";
  syncEventVenueChoicesToForm();
  syncContractChoicesToForm();
  bindEvents();
  applyLocalization();
  renderServices();
  renderReview();
  loadRecords();
}

init();
