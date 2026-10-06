/* Shared, keyboard-friendly controls. Native inputs remain the ISO data source. */
(() => {
  const labels = {
    en: { chooseDate:"Choose a date", chooseTime:"Choose a time", today:"Today", clear:"Clear", close:"Close",
      previous:"Previous month", next:"Next month", month:"Month", year:"Year", hour:"Hour", minute:"Minute",
      apply:"Set time", clock:"12-hour clock · AM / PM", search:"Search locations", searching:"Searching real places…",
      noPlaces:"No matching places. Try a more specific address or venue name, or enter the address manually.",
      searchFailed:"Place search is unavailable. Retry or enter the address manually below.", searchShort:"Type at least three characters to see suggestions.",
      mapTitle:"Location on Google Maps", openMap:"Open in Google Maps", directions:"Directions", nearMe:"Near me", pinSaved:"Address and map pin saved",
      noPin:"No location selected yet", manualPin:"Manual entry · no confirmed map pin", selected:"Location selected", selectedVenue:"Selected location",
      privacy:"Search text and map center go to Photon (OpenStreetMap data); the map loads from Google. Near me asks permission to use and save your current location. Couple details and prices are never sent.",
      locationFailed:"Location access is unavailable or was declined. Search for the address instead.", locating:"Finding your location…", currentLocation:"Current location",
      mapHint:"Choose a result to save its address and map pin. Ethiopian matches appear first.", mapLoad:"Maps need internet. If the preview does not load, use Open in Google Maps.", gregorian:"Gregorian",
      searchPlaceholder:"Search an address, venue, hotel or landmark", searchCity:"Search an Addis Ababa address or landmark", searchResults:"Location suggestions",
      mapEmpty:"Search above to choose a location", changeVenue:"Change location", removeVenue:"Remove location", manualEntry:"Enter a location manually", manualAddress:"Location name / address",
      searchHelp:"Suggestions appear as you type. You can also press Enter to search.", dataCredit:"Search data: OpenStreetMap", addSearch:"Search for a location"
    },
    am: { chooseDate:"ቀን ይምረጡ", chooseTime:"ሰዓት ይምረጡ", today:"ዛሬ", clear:"አጥፋ", close:"ዝጋ",
      previous:"ያለፈው ወር", next:"ቀጣዩ ወር", month:"ወር", year:"ዓመት", hour:"ሰዓት", minute:"ደቂቃ",
      apply:"ሰዓቱን አስቀምጥ", clock:"የ12 ሰዓት አቆጣጠር · AM / PM", search:"ቦታ ፈልግ", searching:"ቦታዎችን በመፈለግ ላይ…",
      noPlaces:"ተዛማጅ ቦታ አልተገኘም። የበለጠ ዝርዝር አድራሻ ወይም የቦታ ስም ይሞክሩ፣ ወይም አድራሻውን በእጅ ያስገቡ።",
      searchFailed:"የቦታ ፍለጋ አይገኝም። እንደገና ይሞክሩ ወይም ከታች አድራሻውን በእጅ ያስገቡ።", searchShort:"ውጤቶችን ለማየት ቢያንስ ሦስት ፊደላት ያስገቡ።",
      mapTitle:"ቦታው በGoogle Maps", openMap:"በGoogle Maps ክፈት", directions:"አቅጣጫ", nearMe:"በአቅራቢያዬ", pinSaved:"አድራሻው እና የካርታ ነጥቡ ተቀምጠዋል",
      noPin:"እስካሁን ቦታ አልተመረጠም", manualPin:"በእጅ የገባ · የካርታ ነጥብ አልተረጋገጠም", selected:"ቦታው ተመርጧል", selectedVenue:"የተመረጠ ቦታ",
      privacy:"የፍለጋ ጽሑፍዎ እና የካርታው ማዕከል ለPhoton (OpenStreetMap መረጃ) ይላካሉ፤ ካርታው ከGoogle ይጫናል። በአቅራቢያዬ ያሉበትን ቦታ ለመጠቀም እና ለማስቀመጥ ፈቃድ ይጠይቃል። የጥንዶቹ መረጃ እና ዋጋዎች አይላኩም።",
      locationFailed:"ያሉበትን ቦታ ማግኘት አልተቻለም። አድራሻውን ይፈልጉ።", locating:"ያሉበትን ቦታ በማግኘት ላይ…", currentLocation:"አሁን ያሉበት ቦታ",
      mapHint:"አድራሻውን እና ነጥቡን ለማስቀመጥ ውጤት ይምረጡ። የኢትዮጵያ ውጤቶች በቅድሚያ ይታያሉ።", mapLoad:"ካርታው ኢንተርኔት ይፈልጋል። ካልተጫነ በGoogle Maps ክፈትን ይጠቀሙ።", gregorian:"ጎርጎርዮሳዊ",
      searchPlaceholder:"አድራሻ፣ ቦታ፣ ሆቴል ወይም ታዋቂ ስፍራ ይፈልጉ", searchCity:"የአዲስ አበባ አድራሻ ወይም ታዋቂ ስፍራ ይፈልጉ", searchResults:"የቦታ ፍለጋ ውጤቶች",
      mapEmpty:"ቦታ ለመምረጥ ከላይ ይፈልጉ", changeVenue:"ቦታ ቀይር", removeVenue:"ቦታውን አጥፋ", manualEntry:"ቦታውን በእጅ ያስገቡ", manualAddress:"የቦታው ስም / አድራሻ",
      searchHelp:"ሲጽፉ ውጤቶች ይታያሉ። Enterን በመጫንም መፈለግ ይችላሉ።", dataCredit:"የፍለጋ መረጃ፦ OpenStreetMap", addSearch:"ቦታ ፈልግ"
    }
  };
  const text = key => labels[state.lang][key];
  const icon = kind => kind === "date" ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>';
  const popup = document.getElementById("pickerPopover");
  let activeInput, activeTrigger, shownMonth, keyboardDate;
  let timeSelection = {};
  const mapState = new Map();
  const locale = () => state.lang === "am" ? "am-ET" : "en-GB";
  const dateFrom = value => value ? new Date(`${value}T12:00:00`) : new Date();
  const iso = date => dateInputValue(date);

  function updateTrigger(input) {
    const trigger = input.parentElement.querySelector(".picker-trigger");
    if (!trigger) return;
    const value = input.value;
    trigger.querySelector(".picker-value").textContent = value ? (input.type === "date" ? formatDate(value) : formatTime(value)) : text(input.type === "date" ? "chooseDate" : "chooseTime");
    trigger.classList.toggle("is-empty", !value);
    trigger.setAttribute("aria-label", `${input.closest(".field, .service-option")?.querySelector("span")?.textContent || ""}: ${trigger.textContent}`);
    trigger.setAttribute("aria-invalid", input.getAttribute("aria-invalid") || "false");
  }

  function enhanceInputs() {
    document.querySelectorAll('input[type="date"], input[type="time"]').forEach(input => {
      if (!input.closest(".picker-control")) {
        const wrapper = document.createElement("div");
        wrapper.className = "picker-control";
        input.before(wrapper);
        wrapper.append(input);
        input.classList.add("picker-native");
        input.tabIndex = -1;
        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "picker-trigger";
        trigger.setAttribute("aria-haspopup", "dialog");
        trigger.setAttribute("aria-expanded", "false");
        trigger.innerHTML = `${icon(input.type)}<span class="picker-value"></span><span class="picker-chevron" aria-hidden="true">⌄</span>`;
        trigger.addEventListener("click", event => { event.preventDefault(); openPicker(input, trigger); });
        wrapper.append(trigger);
      }
      updateTrigger(input);
    });
  }

  function positionPopup() {
    if (popup.hidden || !activeTrigger) return;
    const rect = activeTrigger.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    popup.style.width = `${width}px`;
    popup.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`;
    const height = popup.offsetHeight;
    const top = rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 8 : Math.max(12, rect.top - height - 8);
    popup.style.top = `${Math.min(top, Math.max(12, window.innerHeight - height - 12))}px`;
  }

  function closePicker(restoreFocus = true) {
    popup.hidden = true;
    activeTrigger?.setAttribute("aria-expanded", "false");
    if (restoreFocus) activeTrigger?.focus({preventScroll:true});
    activeInput = activeTrigger = null;
  }

  function openPicker(input, trigger) {
    if (activeInput === input && !popup.hidden) { closePicker(); return; }
    closePicker(false);
    activeInput = input;
    activeTrigger = trigger;
    trigger.setAttribute("aria-expanded", "true");
    popup.hidden = false;
    if (input.type === "date") {
      keyboardDate = dateFrom(input.value);
      shownMonth = new Date(keyboardDate.getFullYear(), keyboardDate.getMonth(), 1, 12);
      renderCalendar();
      popup.querySelector('[aria-selected="true"]')?.focus();
    } else {
      const [hour, minute] = (input.value || "09:00").split(":").map(Number);
      timeSelection = {hour:hour % 12 || 12, minute, period:hour >= 12 ? "PM" : "AM"};
      renderTime();
      popup.querySelector("select")?.focus();
    }
    positionPopup();
  }

  function setValue(value) {
    const input = activeInput;
    input.value = value;
    input.dispatchEvent(new Event("input", {bubbles:true}));
    input.dispatchEvent(new Event("change", {bubbles:true}));
    updateTrigger(input);
    closePicker();
  }

  function renderCalendar() {
    popup.setAttribute("aria-label", text("chooseDate"));
    const year = shownMonth.getFullYear(), month = shownMonth.getMonth();
    const start = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    const months = Array.from({length:12}, (_, m) => new Intl.DateTimeFormat(locale(), {month:"long", calendar:"gregory"}).format(new Date(2026, m, 1)));
    const minYear = Math.min(1950, year), maxYear = Math.max(new Date().getFullYear() + 50, year);
    const years = Array.from({length:maxYear-minYear+1}, (_, i) => minYear+i);
    const weekdays = Array.from({length:7}, (_, i) => new Intl.DateTimeFormat(locale(), {weekday:"short"}).format(new Date(2026, 0, 5+i)));
    popup.innerHTML = `<div class="picker-heading"><strong>${escapeHtml(text("chooseDate"))}</strong><button type="button" data-picker="close" aria-label="${escapeHtml(text("close"))}">×</button></div>
      <div class="calendar-navigation"><button type="button" data-picker="previous" aria-label="${escapeHtml(text("previous"))}">‹</button><select data-calendar="month" aria-label="${escapeHtml(text("month"))}">${months.map((name, m) => `<option value="${m}" ${m === month ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}</select><select data-calendar="year" aria-label="${escapeHtml(text("year"))}">${years.map(y => `<option ${y === year ? "selected" : ""}>${y}</option>`).join("")}</select><button type="button" data-picker="next" aria-label="${escapeHtml(text("next"))}">›</button></div>
      <div class="calendar-weekdays" aria-hidden="true">${weekdays.map(day => `<span>${escapeHtml(day)}</span>`).join("")}</div>
      <div class="calendar-grid" role="grid" aria-label="${escapeHtml(`${months[month]} ${year}`)}">${Array.from({length:start}, () => '<span aria-hidden="true"></span>').join("")}${Array.from({length:totalDays}, (_, i) => {const value = iso(new Date(year, month, i+1, 12)); return `<button type="button" role="gridcell" data-date="${value}" aria-label="${escapeHtml(formatDate(value))}" aria-selected="${value === activeInput.value}" class="${value === iso(new Date()) ? "is-today" : ""}">${i+1}</button>`;}).join("")}</div>
      <div class="picker-footer"><button type="button" data-picker="today">${escapeHtml(text("today"))}</button><button type="button" data-picker="clear">${escapeHtml(text("clear"))}</button><span>${escapeHtml(text("gregorian"))}</span></div>`;
    positionPopup();
  }

  function renderTime() {
    popup.setAttribute("aria-label", text("chooseTime"));
    popup.innerHTML = `<div class="picker-heading"><strong>${escapeHtml(text("chooseTime"))}</strong><button type="button" data-picker="close" aria-label="${escapeHtml(text("close"))}">×</button></div>
      <div class="time-selectors"><label>${escapeHtml(text("hour"))}<select data-time="hour">${Array.from({length:12}, (_, i) => `<option value="${i+1}" ${i+1 === timeSelection.hour ? "selected" : ""}>${String(i+1).padStart(2,"0")}</option>`).join("")}</select></label><span>:</span><label>${escapeHtml(text("minute"))}<select data-time="minute">${Array.from({length:60}, (_, i) => `<option value="${i}" ${i === timeSelection.minute ? "selected" : ""}>${String(i).padStart(2,"0")}</option>`).join("")}</select></label></div>
      <div class="time-period" role="group" aria-label="AM / PM"><button type="button" data-period="AM" aria-pressed="${timeSelection.period === "AM"}">AM</button><button type="button" data-period="PM" aria-pressed="${timeSelection.period === "PM"}">PM</button></div>
      <div class="time-presets">${["06:00","09:00","12:00","15:00"].map(value => `<button type="button" data-time-preset="${value}">${escapeHtml(formatTime(value))}</button>`).join("")}</div><p class="picker-clock-note">${escapeHtml(text("clock"))}</p>
      <div class="picker-footer"><button type="button" data-picker="clear">${escapeHtml(text("clear"))}</button><button type="button" class="time-apply" data-picker="apply">${escapeHtml(text("apply"))}</button></div>`;
    positionPopup();
  }

  popup.addEventListener("click", event => {
    const date = event.target.closest("[data-date]");
    if (date) { setValue(date.dataset.date); return; }
    const preset = event.target.closest("[data-time-preset]");
    if (preset) { setValue(preset.dataset.timePreset); return; }
    const period = event.target.closest("[data-period]");
    if (period) { timeSelection.period = period.dataset.period; renderTime(); popup.querySelector(`[data-period="${timeSelection.period}"]`).focus(); return; }
    const action = event.target.closest("[data-picker]")?.dataset.picker;
    if (action === "clear") setValue("");
    if (action === "close") closePicker();
    if (action === "today") setValue(iso(new Date()));
    if (action === "previous" || action === "next") {shownMonth.setMonth(shownMonth.getMonth() + (action === "next" ? 1 : -1)); renderCalendar(); popup.querySelector(`[data-picker="${action}"]`).focus();}
    if (action === "apply") setValue(`${String(timeSelection.hour % 12 + (timeSelection.period === "PM" ? 12 : 0)).padStart(2,"0")}:${String(timeSelection.minute).padStart(2,"0")}`);
  });
  popup.addEventListener("change", event => {
    if (event.target.dataset.calendar === "month") shownMonth.setMonth(Number(event.target.value));
    if (event.target.dataset.calendar === "year") shownMonth.setFullYear(Number(event.target.value));
    if (event.target.dataset.calendar) { const part = event.target.dataset.calendar; renderCalendar(); popup.querySelector(`[data-calendar="${part}"]`).focus(); }
    if (event.target.dataset.time) timeSelection[event.target.dataset.time] = Number(event.target.value);
  });
  popup.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); closePicker(); return; }
    const day = event.target.closest("[data-date]");
    const deltas = {ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7};
    if (day && deltas[event.key]) {
      event.preventDefault();
      keyboardDate = dateFrom(day.dataset.date);
      keyboardDate.setDate(keyboardDate.getDate() + deltas[event.key]);
      shownMonth = new Date(keyboardDate.getFullYear(), keyboardDate.getMonth(), 1, 12);
      renderCalendar();
      popup.querySelector(`[data-date="${iso(keyboardDate)}"]`)?.focus();
    }
    if (event.key === "Tab") {
      const items = [...popup.querySelectorAll("button, select")];
      if (event.shiftKey && event.target === items[0]) {event.preventDefault(); items.at(-1).focus();}
      else if (!event.shiftKey && event.target === items.at(-1)) {event.preventDefault(); items[0].focus();}
    }
  });
  document.addEventListener("pointerdown", event => {if (!popup.hidden && !popup.contains(event.target) && !activeTrigger?.contains(event.target)) closePicker(false);});
  window.addEventListener("resize", positionPopup);
  window.addEventListener("scroll", positionPopup, true);
  window.addEventListener("plan-step-change", () => closePicker(false));

  const venueIcon = kind => {
    const paths = {
      search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
      pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
      external:'<path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7"/>',
      directions:'<path d="m12 2 10 10-10 10L2 12 10 2Z"/><path d="M8 15v-5h8m-3-3 3 3-3 3"/>',
      remove:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      plus:'<path d="M12 5v14M5 12h14"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[kind]}</svg>`;
  };
  const validPlace = place => Boolean(place && Number.isFinite(place.lat) && Number.isFinite(place.lon) && Math.abs(place.lat) <= 90 && Math.abs(place.lon) <= 180);
  const placeValue = place => [place.name, place.address].filter(Boolean).join(", ");
  const mapsLink = query => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  function hideSuggestions(ui) {
    ui.results.hidden = true;
    ui.query.setAttribute("aria-expanded", "false");
    ui.query.removeAttribute("aria-activedescendant");
    ui.activeOption = -1;
  }

  function cancelVenueWork(ui) {
    if (ui.busy || ui.nearButton.disabled) ui.status.textContent = "";
    clearTimeout(ui.timer);
    ui.sequence++;
    ui.controller?.abort();
    ui.controller = null;
    ui.queued = false;
    ui.busy = false;
    ui.nearButton.disabled = false;
    ui.root.classList.remove("is-searching");
    ui.query.setAttribute("aria-busy", "false");
    hideSuggestions(ui);
  }

  function updateMap(id) {
    const ui = mapState.get(id);
    if (!ui) return;
    const place = state.details.locations?.[id];
    const valid = validPlace(place);
    const manual = ui.input.value.trim();
    const hasVenue = valid || Boolean(manual);
    // Use stored coordinates for an exact pin, rather than Google's interpretation
    // of a same-named venue. Legacy/manual names are never invented coordinates.
    const mapQuery = valid ? `${place.lat},${place.lon}` : manual || "Addis Ababa, Ethiopia";
    const link = mapsLink(mapQuery);
    const url = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=${hasVenue ? 17 : 11}&output=embed`;
    ui.map.title = text("mapTitle");
    if (ui.map.getAttribute("src") !== url) ui.map.src = url;
    ui.root.querySelector(".map-hint").hidden = hasVenue;
    ui.root.querySelector(".map-hint span").textContent = text("mapEmpty");
    ui.root.querySelector(".map-selection").textContent = valid ? `${text("pinSaved")} · ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}` : manual ? text("manualPin") : text("noPin");
    ui.root.querySelector(".map-privacy").textContent = text("privacy");
    ui.root.querySelector(".map-load-note").textContent = text("mapLoad");
    ui.query.placeholder = text("searchPlaceholder");
    ui.searchButton.setAttribute("aria-label", text("search"));
    ui.searchButton.title = text("search");
    ui.results.setAttribute("aria-label", text("searchResults"));
    ui.nearButton.innerHTML = `${venueIcon("locate")}<span>${escapeHtml(text("nearMe"))}</span>`;
    ui.root.querySelector(".venue-search-help").textContent = text("searchHelp");
    ui.root.querySelector(".venue-manual summary").textContent = text("manualEntry");
    ui.root.querySelector(".venue-manual-label").textContent = text("manualAddress");
    ui.root.querySelector(".venue-search-action").innerHTML = `${venueIcon(hasVenue ? "search" : "plus")}<span>${escapeHtml(text(hasVenue ? "changeVenue" : "addSearch"))}</span>`;
    ui.root.querySelector(".map-data-credit").textContent = text("dataCredit");
    const openLink = ui.root.querySelector(".map-open-link");
    openLink.href = link;
    openLink.textContent = text("openMap");
    ui.card.hidden = !hasVenue;
    ui.card.innerHTML = hasVenue ? `<div class="selected-venue-info"><i>${venueIcon(valid ? "check" : "pin")}</i><div><span>${escapeHtml(text("selectedVenue"))}</span><strong>${escapeHtml(valid ? place.name : manual)}</strong>${valid && place.address ? `<small>${escapeHtml(place.address)}</small>` : ""}</div></div><div class="selected-venue-tools"><a href="${link}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(text("openMap"))}" title="${escapeHtml(text("openMap"))}">${venueIcon("external")}</a><a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(text("directions"))}" title="${escapeHtml(text("directions"))}">${venueIcon("directions")}</a><button type="button" class="remove-venue" aria-label="${escapeHtml(text("removeVenue"))}" title="${escapeHtml(text("removeVenue"))}">${venueIcon("remove")}</button></div>` : "";
  }

  function selectPlace(id, place) {
    if (!validPlace(place)) return;
    const ui = mapState.get(id);
    cancelVenueWork(ui);
    state.details.locations ||= {};
    state.details.locations[id] = {name:String(place.name || ""),address:String(place.address || ""),lat:place.lat,lon:place.lon};
    ui.input.value = placeValue(state.details.locations[id]);
    ui.input.dispatchEvent(new Event("input", {bubbles:true}));
    ui.query.value = "";
    ui.results.replaceChildren();
    ui.manual.open = false;
    ui.status.textContent = text("selected");
    updateMap(id);
    ui.query.focus({preventScroll:true});
  }

  function highlightSuggestion(ui, index) {
    const options = [...ui.results.querySelectorAll(".place-result")];
    if (!options.length) return;
    ui.activeOption = (index + options.length) % options.length;
    options.forEach((option, i) => option.setAttribute("aria-selected", String(i === ui.activeOption)));
    ui.query.setAttribute("aria-activedescendant", options[ui.activeOption].id);
    options[ui.activeOption].scrollIntoView({block:"nearest"});
  }

  async function search(id) {
    const ui = mapState.get(id);
    if (ui.nearButton.disabled) cancelVenueWork(ui);
    clearTimeout(ui.timer);
    const query = ui.query.value.trim();
    if (query.length < 3) {ui.status.textContent = text("searchShort"); return;}
    // Only one lookup per field can be in flight. If the user keeps typing, run
    // just the latest settled query afterwards, rather than flood the provider.
    if (ui.busy) {ui.queued = true; return;}
    const sequence = ++ui.sequence;
    const controller = new AbortController();
    ui.controller = controller;
    ui.busy = true;
    ui.queued = false;
    ui.root.classList.add("is-searching");
    ui.query.setAttribute("aria-busy", "true");
    ui.status.textContent = text("searching");
    hideSuggestions(ui);
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const bias = ui.near || [9.03,38.75];
      const params = new URLSearchParams({q:query,lat:bias[0],lon:bias[1]});
      const response = await fetch(`/api/places?${params}`, {signal:controller.signal});
      if (!response.ok) throw new Error("Places unavailable");
      const result = await response.json();
      if (sequence !== ui.sequence || ui.query.value.trim() !== query) return;
      const places = Array.isArray(result.places) ? result.places.filter(validPlace).slice(0,6) : [];
      ui.results.replaceChildren();
      if (!places.length) {ui.status.textContent = text("noPlaces"); return;}
      places.forEach((place, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.id = `${id}-result-${index}`;
        option.className = "place-result";
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.tabIndex = -1;
        option.innerHTML = `${venueIcon("pin")}<span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.address)}</small></span>`;
        option.addEventListener("pointerdown", event => event.preventDefault());
        option.addEventListener("click", () => selectPlace(id, place));
        ui.results.append(option);
      });
      ui.results.hidden = false;
      ui.query.setAttribute("aria-expanded", "true");
      ui.status.textContent = text("mapHint");
    } catch {
      if (sequence === ui.sequence && ui.query.value.trim() === query) ui.status.textContent = text("searchFailed");
    } finally {
      clearTimeout(timeout);
      if (sequence === ui.sequence) {
        ui.busy = false;
        ui.controller = null;
        ui.root.classList.remove("is-searching");
        ui.query.setAttribute("aria-busy", "false");
        if (ui.queued && ui.query.value.trim() !== query && ui.query.value.trim().length >= 3) search(id);
      }
    }
  }

  function useCurrentLocation(id) {
    const ui = mapState.get(id);
    if (!navigator.geolocation) {ui.status.textContent = text("locationFailed"); return;}
    cancelVenueWork(ui);
    const sequence = ui.sequence;
    ui.nearButton.disabled = true;
    ui.status.textContent = text("locating");
    navigator.geolocation.getCurrentPosition(async position => {
      if (sequence !== ui.sequence) return;
      const {latitude:lat,longitude:lon} = position.coords;
      ui.near = [lat,lon];
      const controller = new AbortController();
      ui.controller = controller;
      const timeout = setTimeout(() => controller.abort(), 12000);
      let place = {name:text("currentLocation"),address:`${lat.toFixed(5)}, ${lon.toFixed(5)}`,lat,lon};
      try {
        const response = await fetch(`/api/places/reverse?${new URLSearchParams({lat,lon})}`, {signal:controller.signal});
        const result = response.ok ? await response.json() : null;
        if (validPlace(result?.place)) place = {...result.place,lat,lon};
      } catch { /* A permitted GPS position still works when reverse lookup is offline. */ }
      finally {clearTimeout(timeout);}
      if (sequence === ui.sequence) selectPlace(id, place);
    }, () => {
      if (sequence !== ui.sequence) return;
      ui.nearButton.disabled = false;
      ui.status.textContent = text("locationFailed");
    }, {enableHighAccuracy:true,timeout:10000,maximumAge:60000});
  }

  function enhanceLocations() {
    const inputs = [...document.querySelectorAll("input[data-map-location]")];
    const activeInputs = new Map(inputs.map(input => [input.id, input]));
    for (const [id, ui] of mapState) {
      if (activeInputs.get(id) === ui.input) continue;
      cancelVenueWork(ui);
      mapState.delete(id);
    }
    for (const input of inputs) {
      const id = input.id;
      if (!id) continue;
      if (mapState.has(id)) {
        const ui = mapState.get(id);
        cancelVenueWork(ui);
        ui.query.value = "";
        ui.status.textContent = "";
        updateMap(id);
        continue;
      }
      const root = document.createElement("div");
      root.className = "location-picker";
      const label = input.closest("label");
      if (!label) continue;
      root.dataset.mapKind = input.hasAttribute("data-venue-location") ? "event-venue" : "address";
      // A label must not wrap a map, links, or multiple interactive controls.
      const field = document.createElement("div");
      field.className = label.className;
      const caption = document.createElement("label");
      caption.htmlFor = `${id}-search`;
      caption.id = `${id}-label`;
      caption.innerHTML = label.querySelector("span")?.outerHTML || "";
      label.before(field);
      field.append(caption, root);
      root.innerHTML = `<div class="location-search">${venueIcon("search")}<input id="${id}-search" type="text" role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-controls="${id}-results" aria-expanded="false" aria-labelledby="${id}-label" aria-describedby="${id}-help" autocomplete="off" maxlength="160" spellcheck="false"><span class="venue-search-spinner" aria-hidden="true"></span><button type="button" class="venue-search-submit">${venueIcon("search")}</button></div><small id="${id}-help" class="venue-search-help"></small><div id="${id}-results" class="place-results" role="listbox" hidden></div><div class="location-map"><div class="map-frame"><iframe loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="map-hint">${venueIcon("pin")}<span></span></div><button type="button" class="near-me"></button></div><div class="map-links"><a class="map-open-link" target="_blank" rel="noopener noreferrer"></a><a class="map-data-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"></a></div></div><p class="map-status" role="status" aria-live="polite"></p><div class="selected-venue-card" hidden></div><small class="map-selection"></small><button class="venue-search-action" type="button"></button><details class="venue-manual"><summary></summary><label for="${id}" class="venue-manual-label"></label><div class="venue-manual-input"></div></details><small class="map-load-note"></small><small class="map-privacy"></small>`;
      root.querySelector(".venue-manual-input").append(input);
      label.remove();
      input.autocomplete = "off";
      const ui = {root,input,query:root.querySelector('[role="combobox"]'),searchButton:root.querySelector(".venue-search-submit"),map:root.querySelector("iframe"),results:root.querySelector(".place-results"),status:root.querySelector(".map-status"),nearButton:root.querySelector(".near-me"),card:root.querySelector(".selected-venue-card"),manual:root.querySelector(".venue-manual"),sequence:0,activeOption:-1,busy:false};
      mapState.set(id, ui);
      ui.searchButton.addEventListener("click", () => search(id));
      ui.query.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          if (!ui.results.hidden && ui.activeOption >= 0) ui.results.children[ui.activeOption]?.click();
          else search(id);
        }
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !ui.results.hidden) {
          event.preventDefault();
          highlightSuggestion(ui, ui.activeOption < 0 ? (event.key === "ArrowDown" ? 0 : -1) : ui.activeOption + (event.key === "ArrowDown" ? 1 : -1));
        }
        if (event.key === "Escape") cancelVenueWork(ui);
        if (event.key === "Tab") hideSuggestions(ui);
      });
      ui.query.addEventListener("input", event => {
        if (ui.nearButton.disabled) cancelVenueWork(ui);
        clearTimeout(ui.timer);
        hideSuggestions(ui);
        ui.status.textContent = ui.query.value.trim().length < 3 ? text("searchShort") : "";
        if (!event.isComposing && ui.query.value.trim().length >= 3) ui.timer = setTimeout(() => search(id), 300);
      });
      ui.query.addEventListener("compositionend", () => {clearTimeout(ui.timer); ui.timer = setTimeout(() => search(id), 300);});
      input.addEventListener("input", () => {
        cancelVenueWork(ui);
        const place = state.details.locations?.[id];
        if (place && input.value !== placeValue(place)) delete state.details.locations[id];
        updateMap(id);
        // Pin deletion must be included before the normal form handler saves.
        saveDraft();
      });
      ui.card.addEventListener("click", event => {
        if (!event.target.closest(".remove-venue")) return;
        cancelVenueWork(ui);
        if (state.details.locations) delete state.details.locations[id];
        ui.input.value = "";
        ui.input.dispatchEvent(new Event("input", {bubbles:true}));
        ui.status.textContent = text("noPin");
        ui.query.focus({preventScroll:true});
      });
      root.querySelector(".venue-search-action").addEventListener("click", () => {
        ui.query.focus({preventScroll:true});
        ui.query.scrollIntoView({block:"center",behavior:"smooth"});
        ui.query.select();
      });
      ui.nearButton.addEventListener("click", () => useCurrentLocation(id));
      updateMap(id);
    }
  }

  document.addEventListener("focusin", event => {
    mapState.forEach(ui => {
      if (!ui.root.contains(event.target)) cancelVenueWork(ui);
    });
  });
  document.addEventListener("pointerdown", event => {
    mapState.forEach(ui => {
      if (!ui.root.contains(event.target)) cancelVenueWork(ui);
    });
  });
  window.addEventListener("plan-step-change", () => mapState.forEach(cancelVenueWork));

  document.addEventListener("input", event => {if (event.target.matches('.picker-native')) updateTrigger(event.target);});
  document.addEventListener("change", event => {if (event.target.matches('.picker-native')) updateTrigger(event.target);});
  new MutationObserver(enhanceInputs).observe(document.getElementById("servicesGrid"), {childList:true});
  window.addEventListener("plan-ui-update", () => {closePicker(false); enhanceInputs(); enhanceLocations();});
  enhanceInputs();
  enhanceLocations();
})();
