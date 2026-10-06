/* Shared, keyboard-friendly controls. Native inputs remain the ISO data source. */
(() => {
  const labels = {
    en: { chooseDate:"Choose a date", chooseTime:"Choose a time", today:"Today", clear:"Clear", close:"Close",
      previous:"Previous month", next:"Next month", month:"Month", year:"Year", hour:"Hour", minute:"Minute",
      apply:"Set time", clock:"12-hour clock · AM / PM", search:"Search map", searching:"Searching real places…",
      noPlaces:"No matching places. Try a city or a more specific venue name, or enter the address manually.",
      searchFailed:"Place search is unavailable. Retry, or keep a manually entered address.", searchShort:"Enter at least two characters to search.",
      mapTitle:"Venue map", openMap:"Open map", directions:"Directions", nearMe:"Near me", pinSaved:"Map pin saved",
      noPin:"No map pin selected. Search and choose a place, or enter a venue manually.",
      privacy:"Searches send your search text and map center to Photon / OpenStreetMap. Your current location is requested only when you choose Near me.",
      locationFailed:"Location access is unavailable or was declined. Search for your venue instead.", located:"Search is now biased near you. Choose a result to save a venue.",
      mapHint:"Select a result to save its address and map pin.", mapLoad:"Map needs an internet connection. Use Open map if it does not load.", gregorian:"Gregorian"
    },
    am: { chooseDate:"ቀን ይምረጡ", chooseTime:"ሰዓት ይምረጡ", today:"ዛሬ", clear:"አጥፋ", close:"ዝጋ",
      previous:"ያለፈው ወር", next:"ቀጣዩ ወር", month:"ወር", year:"ዓመት", hour:"ሰዓት", minute:"ደቂቃ",
      apply:"ሰዓቱን አስቀምጥ", clock:"የ12 ሰዓት አቆጣጠር · AM / PM", search:"በካርታ ፈልግ", searching:"ቦታዎችን በመፈለግ ላይ…",
      noPlaces:"ተዛማጅ ቦታ አልተገኘም። ከተማ ወይም ዝርዝር ስም ይሞክሩ፣ ወይም አድራሻውን በእጅ ያስገቡ።",
      searchFailed:"የቦታ ፍለጋ አይገኝም። እንደገና ይሞክሩ ወይም አድራሻውን በእጅ ያስገቡ።", searchShort:"ለፍለጋ ቢያንስ ሁለት ፊደላት ያስገቡ።",
      mapTitle:"የቦታው ካርታ", openMap:"ካርታውን ክፈት", directions:"አቅጣጫ", nearMe:"በአቅራቢያዬ", pinSaved:"የካርታ ነጥብ ተቀምጧል",
      noPin:"በካርታ የተመረጠ ቦታ የለም። ቦታ ፈልገው ይምረጡ ወይም በእጅ ያስገቡ።",
      privacy:"የፍለጋ ጽሑፍዎ እና የካርታው ማዕከል ለPhoton / OpenStreetMap ይላካሉ። ያሉበት ቦታ የሚጠየቀው በአቅራቢያዬን ሲመርጡ ብቻ ነው።",
      locationFailed:"ያሉበትን ቦታ ማግኘት አልተቻለም። የዝግጅቱን ቦታ ይፈልጉ።", located:"ካርታው በአቅራቢያዎ ተቀምጧል። የዝግጅቱን ቦታ ይፈልጉ።",
      mapHint:"አድራሻውን እና ነጥቡን ለማስቀመጥ ውጤት ይምረጡ።", mapLoad:"ካርታው ኢንተርኔት ይፈልጋል። ካልተጫነ ካርታውን ክፈትን ይጠቀሙ።", gregorian:"ጎርጎርዮሳዊ"
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

  function mapUrl(lat, lon, marker = true) {
    const radius = marker ? 0.012 : 0.1;
    const parameters = new URLSearchParams({bbox:[Math.max(-180,lon-radius), Math.max(-90,lat-radius), Math.min(180,lon+radius), Math.min(90,lat+radius)].join(","), layer:"mapnik"});
    if (marker) parameters.set("marker", `${lat},${lon}`);
    return `https://www.openstreetmap.org/export/embed.html?${parameters}`;
  }

  function updateMap(id) {
    const ui = mapState.get(id);
    if (!ui) return;
    const place = state.details.locations?.[id];
    const valid = Boolean(place && Number.isFinite(place.lat) && Number.isFinite(place.lon) && Math.abs(place.lat) <= 90 && Math.abs(place.lon) <= 180);
    const [lat, lon] = valid ? [place.lat, place.lon] : (ui.near || [9.03, 38.75]);
    const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${valid ? 16 : 12}/${lat}/${lon}`;
    ui.map.querySelector(".map-place").innerHTML = `<div><strong>${escapeHtml(valid ? place.name : "Addis Ababa")}</strong><small>${escapeHtml(valid ? place.address : "Ethiopia")}</small></div><a href="${mapLink}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(text("openMap"))}">↗</a>${valid ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(text("directions"))}">➜</a>` : ""}`;
    ui.map.querySelector("iframe").title = text("mapTitle");
    const url = mapUrl(lat, lon, valid);
    if (ui.map.querySelector("iframe").getAttribute("src") !== url) ui.map.querySelector("iframe").src = url;
    ui.root.querySelector(".map-selection").textContent = valid ? `${text("pinSaved")} · ${place.lat.toFixed(5)}, ${place.lon.toFixed(5)}` : text("noPin");
    ui.root.querySelector(".map-privacy").textContent = text("privacy");
    ui.root.querySelector(".map-load-note").textContent = text("mapLoad");
    ui.searchButton.textContent = text("search");
    ui.nearButton.textContent = text("nearMe");
    ui.details.querySelector("summary").textContent = text("mapTitle");
  }

  function selectPlace(id, place) {
    const ui = mapState.get(id);
    state.details.locations ||= {};
    state.details.locations[id] = place;
    ui.input.value = [place.name, place.address].filter(Boolean).join(", ");
    ui.input.dispatchEvent(new Event("input", {bubbles:true}));
    ui.results.replaceChildren();
    ui.results.hidden = true;
    ui.input.setAttribute("aria-expanded", "false");
    ui.status.textContent = text("mapHint");
    ui.details.open = true;
    updateMap(id);
    ui.input.focus({preventScroll:true});
  }

  async function search(id) {
    const ui = mapState.get(id);
    const query = ui.input.value.trim();
    if (query.length < 2) {ui.status.textContent = text("searchShort"); return;}
    ui.controller?.abort();
    const controller = new AbortController();
    ui.controller = controller;
    ui.searchButton.disabled = true;
    ui.status.textContent = text("searching");
    ui.results.replaceChildren();
    ui.results.hidden = true;
    ui.input.setAttribute("aria-expanded", "false");
    try {
      const bias = ui.near || [9.03,38.75];
      const params = new URLSearchParams({q:query,lat:bias[0],lon:bias[1]});
      const response = await fetch(`/api/places?${params}`, {signal:controller.signal});
      if (!response.ok) throw new Error("Places unavailable");
      const result = await response.json();
      if (ui.input.value.trim() !== query) return;
      if (!result.places.length) {ui.status.textContent = text("noPlaces"); return;}
      ui.results.hidden = false;
      ui.input.setAttribute("aria-expanded", "true");
      result.places.forEach(place => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "place-result";
        option.innerHTML = `<span aria-hidden="true">⌖</span><span><strong>${escapeHtml(place.name)}</strong><small>${escapeHtml(place.address)}</small></span>`;
        option.addEventListener("click", () => selectPlace(id, place));
        ui.results.append(option);
      });
      ui.status.textContent = text("mapHint");
    } catch (error) {
      if (error.name !== "AbortError") ui.status.textContent = text("searchFailed");
    } finally {if (ui.controller === controller) ui.searchButton.disabled = false;}
  }

  function enhanceLocations() {
    for (const id of ["sacredVenue", "receptionVenue", "eventLocation"]) {
      if (mapState.has(id)) {updateMap(id); continue;}
      const input = document.getElementById(id);
      const root = document.createElement("div");
      root.className = "location-picker";
      const label = input.closest("label");
      // A label must not wrap a map, links, or multiple interactive controls.
      const field = document.createElement("div");
      field.className = label.className;
      const caption = document.createElement("label");
      caption.htmlFor = id;
      caption.innerHTML = label.querySelector("span").outerHTML;
      label.before(field);
      field.append(caption, root);
      root.innerHTML = `<div class="location-search"></div><div id="${id}-results" class="place-results" hidden></div><p class="map-status" role="status"></p><details class="location-map" ${id === "eventLocation" ? "open" : ""}><summary></summary><div class="map-frame"><iframe loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><div class="map-place"></div></div><div class="map-tools"><button type="button" class="near-me"></button><span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></span></div><p class="map-load-note"></p></details><small class="map-selection"></small><small class="map-privacy"></small>`;
      const searchRow = root.querySelector(".location-search");
      searchRow.append(input);
      const searchButton = document.createElement("button");
      searchButton.type = "button";
      searchRow.append(searchButton);
      label.remove();
      input.autocomplete = "off";
      input.setAttribute("aria-controls", `${id}-results`);
      input.setAttribute("aria-expanded", "false");
      const ui = {root,input,searchButton,details:root.querySelector("details"),map:root.querySelector(".map-frame"),results:root.querySelector(".place-results"),status:root.querySelector(".map-status"),nearButton:root.querySelector(".near-me")};
      mapState.set(id, ui);
      searchButton.addEventListener("click", () => search(id));
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {event.preventDefault(); search(id);}
        if (event.key === "ArrowDown" && !ui.results.hidden) {event.preventDefault(); ui.results.querySelector("button")?.focus();}
        if (event.key === "Escape") {ui.results.hidden = true; input.setAttribute("aria-expanded", "false");}
      });
      ui.results.addEventListener("keydown", event => {
        const options = [...ui.results.querySelectorAll("button")];
        const index = options.indexOf(event.target);
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {event.preventDefault(); options[(index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length]?.focus();}
        if (event.key === "Escape") {ui.results.hidden = true; input.setAttribute("aria-expanded", "false"); input.focus();}
      });
      input.addEventListener("input", () => {
        ui.controller?.abort();
        ui.searchButton.disabled = false;
        ui.results.hidden = true;
        input.setAttribute("aria-expanded", "false");
        const place = state.details.locations?.[id];
        if (place && input.value !== [place.name,place.address].filter(Boolean).join(", ")) {delete state.details.locations[id]; saveDraft(); updateMap(id);}
      });
      ui.nearButton.addEventListener("click", () => {
        if (!navigator.geolocation) {ui.status.textContent = text("locationFailed"); return;}
        ui.nearButton.disabled = true;
        navigator.geolocation.getCurrentPosition(position => {
          ui.near = [position.coords.latitude, position.coords.longitude];
          ui.details.open = true;
          updateMap(id);
          ui.status.textContent = text("located");
          ui.nearButton.disabled = false;
        }, () => {ui.status.textContent = text("locationFailed"); ui.nearButton.disabled = false;}, {timeout:10000, maximumAge:60000});
      });
      updateMap(id);
    }
  }

  document.addEventListener("input", event => {if (event.target.matches('.picker-native')) updateTrigger(event.target);});
  document.addEventListener("change", event => {if (event.target.matches('.picker-native')) updateTrigger(event.target);});
  new MutationObserver(enhanceInputs).observe(document.getElementById("servicesGrid"), {childList:true});
  window.addEventListener("plan-ui-update", () => {closePicker(false); enhanceInputs(); enhanceLocations();});
  enhanceInputs();
  enhanceLocations();
})();
