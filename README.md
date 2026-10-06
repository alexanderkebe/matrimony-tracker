# Matrimony By Hanna · Event Planner

A standalone, bilingual wedding planning workspace for Matrimony By Hanna.

## What it does

- Collects couple details, contact information, event dates and duration, venue information, and ETB financial commitments.
- Includes all 21 services from the provided planning list.
- Lets the planner turn each service on or off and choose service-specific options for each couple.
- Saves the current draft locally in the browser and completed plans in SQLite.
- Lists saved couples by the bride's and groom's first names, with search and reopening of the full plan.
- Shows the couple's first names live in the sidebar and header, with recent-couple shortcuts and clear record-save status.
- Includes keyboard-friendly, branded Gregorian calendars and AM/PM time pickers, localized in English and Amharic.
- Adapts Teri's builder venue picker: search-as-you-type with Ethiopian-first suggestions, an always-visible Google Maps preview, selected-venue cards, directions, removal, and opt-in current-location lookup. Saves names, addresses and coordinates with each plan; manual entry remains available.
- Supports English and Amharic UI/content labels.
- Generates two separate, print-ready PDFs on the supplied letterhead: a dynamic service agreement in the selected language and a proforma listing the couple, event days, chosen services, one overall ETB fee, and a thank-you message.
- Uses the supplied Helvetica, Benaiah, Ethiopic Sadiss, and letterhead assets from `assets/`.
- Uses the supplied Matrimony logo as a cropped transparent PNG in the app and agreement header.
- Uses Mending and SignPainter as the brand font roles when those fonts are installed, with graceful fallbacks when they are not available locally.

## Run locally

The app has no build step or runtime package installation. Python 3 is required for SQLite records and venue search. PDF libraries are bundled locally. Start it from this folder:

```powershell
py server.py --port 4173
```

Then open `http://localhost:4173`.

Generating an agreement or proforma saves or updates the couple's record. You can also use **Save record** in the sidebar before generating a document (both names are required). The **Records** tab and recent sidebar shortcuts reopen complete plans. Changing a saved plan shows **Unsaved changes** until it is saved again. Starting a new plan clears the working draft but keeps previous records. Records are stored in `data/matrimony.sqlite3` on this computer and are excluded from Git. Back up that file to preserve records. Opening `index.html` directly does not provide SQLite records or venue search. Use the same hostname and port to retain access to the browser's local draft.

To create either document, complete the couple and event details, choose at least one service, enter the agreed overall fee once, and select the document. The agreement includes the selected service scope, responsibilities, the 40% / 40% / 20% payment schedule, cancellation/change terms, media-consent choice, and signature lines. The separate proforma lists selected services without assigning prices to individual items; it displays only the overall agreed fee. Missing fields are highlighted instead of silently preventing generation. Record-save errors do not prevent PDF export.

The agreement follows the supplied four-section Matrimony format in English and Amharic, with seven numbered delivery/payment clauses and both media-consent alternatives (only the chosen alternative is checked). Client names, dates, venues, service selections and payment amounts remain dynamic. Official CBE/BOA account details appear under the account-holder name; Telebirr is listed as contact information because the supplied terms allow bank-account payments only. `SERVICE_PROVIDER` in `app.js` keeps the supplied account-holder and contract-signatory names separate. Each signatory has distinct signature and date lines. Core stylesheet/script URLs are versioned to prevent stale markup/style combinations after a refresh.

Direct downloads contain 3x-resolution rendered A4 pages, including the original letterhead, watermark and footer on every page, with loaded local fonts. These downloads preserve the exact visual appearance and Amharic glyphs; text is rasterized rather than selectable. The separate **Print** action uses browser-native text rendering. Choose **Save as PDF**, A4, and disable browser headers and footers. Background graphics are not required for the letterhead. Oversized individual notes that cannot fit safely are flagged rather than exported with clipped content.

## Venue search

Type at least three characters in the search box for a venue, hotel, landmark or city. Suggestions appear after a short pause; **Enter** and the search button also work. Ethiopian matches are prioritized, with worldwide results available when there is room. Arrow keys move through results, **Enter** selects, and **Escape** dismisses. A search query is separate from the saved venue: searching for a replacement does not erase the current selection. Choose a result to replace it, or use its remove button to clear it.

The Google Maps preview uses the saved coordinates, rather than guessing between same-named places. The selected-venue card offers Google Maps and directions links. **Near me** explicitly requests browser permission, looks up the address and selects your current GPS coordinates as the venue; denied permission leaves the existing selection unchanged. If address lookup is offline, the permitted coordinates still work. Use **Enter a venue manually** for a custom or offline address. Editing it clears a stale pin and marks the entry as unconfirmed; existing text-only records remain usable.

Maps and searches require internet access. The [Photon public demo](https://github.com/komoot/photon#demo-server) supports search-as-you-type with reasonable usage, but has no availability guarantee. The app debounces typing, runs only one request per field at a time, limits upstream requests to one per second, and caches results for five minutes. Set `MATRIMONY_PHOTON_URL` to a trusted self-hosted Photon API endpoint for larger deployments; `MATRIMONY_PHOTON_REVERSE_URL` optionally overrides its reverse endpoint. Search-data attribution links to [OpenStreetMap](https://www.openstreetmap.org/copyright); Google retains its own map attribution. Search text/map-center coordinates go to Photon. Map queries go to Google. **Near me** sends the permitted GPS coordinates to both providers. Couple details and prices are not sent. The embed follows Teri's existing Google Maps embed URL approach; no API key or new subscription is configured by this app.

## Brand assets

The provided letterhead PDF is preserved at `assets/letterhead.pdf`. The contract header follows its A4 structure with the supplied logo, aligned reference/date rows, angular divider, and letterhead contact footer so dynamic text stays readable and does not overlap. The app does not redistribute downloaded commercial Mending or SignPainter files; the CSS names those brand roles and falls back to an editorial serif and brush script if the fonts are not installed on the machine.

## Verification

Run API and SQLite tests with `py -m unittest discover -s tests -q`. Browser tests use Playwright and Microsoft Edge: run `node tests/ui_workflow.cjs` with Playwright installed, or set `PLAYWRIGHT_MODULE` to its installed package directory. Set `MATRIMONY_URL` if the server uses another port. Browser tests mock record writes and place responses; they never create or overwrite real couple records. They exercise validation, calendars, midnight/PM time handling, names, coordinates, save/reopen, agreement scope and consent, six real PDF downloads, aggregate-only proforma pricing, record outages, and mobile layout. PDF samples are written only under ignored `tmp/pdfs/workflow/` for visual verification.

Run `node tests/venue_picker.cjs` for focused venue checks: debounce, keyboard selection, stale responses, saved-pin compatibility, manual/offline entry, remove/replace, current-location permission and fallback, localization, and mobile layout. It also mocks records and provider responses, so live records are untouched.
