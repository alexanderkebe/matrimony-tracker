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
- Searches real venues with Photon/OpenStreetMap, previews a map pin, and saves the selected address and coordinates with the plan. Manual venue entry remains available.
- Supports English and Amharic UI/content labels.
- Generates two separate, print-ready PDFs on the supplied letterhead: a service agreement and an itemized proforma with the couple's names, event days, chosen services, ETB prices, total, and a thank-you message.
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

To create the agreement PDF, complete the plan, select **Generate agreement**, then **Download agreement PDF**. For the separate proforma, enter the number of event days and an ETB price for every selected service (0 is valid), open **Proforma**, and select **Download proforma PDF**. Missing fields are highlighted instead of silently preventing generation. The total agreement amount is calculated from service prices once all prices are entered. Deposits greater than the total are rejected. Record-save errors do not prevent PDF export.

Direct downloads contain 3x-resolution rendered A4 pages, including the original letterhead, watermark and footer on every page, with loaded local fonts. These downloads preserve the exact visual appearance and Amharic glyphs; text is rasterized rather than selectable. The separate **Print** action uses browser-native text rendering. Choose **Save as PDF**, A4, and disable browser headers and footers. Background graphics are not required for the letterhead. Oversized individual notes that cannot fit safely are flagged rather than exported with clipped content.

## Venue search

Enter a venue, hotel, landmark or city and press **Enter** or **Search map**, then choose a result. Search is submitted explicitly, not on every keystroke. Results are biased toward Addis Ababa by default. **Near me** requests browser permission and changes the search bias; it does not silently replace a saved venue. Selecting a result stores its name, address, latitude and longitude. Editing the address manually clears a stale pin.

Maps and searches require internet access. The [Photon public demo](https://github.com/komoot/photon#demo-server) permits reasonable use but has no availability guarantee. Requests are limited and cached locally in memory. Set `MATRIMONY_PHOTON_URL` to a trusted self-hosted Photon API endpoint for larger deployments. The map embed retains [OpenStreetMap attribution](https://www.openstreetmap.org/copyright). Searches send search text and map-center coordinates, not couple details or service prices. The embedded map provider also receives ordinary browser requests. No paid API key is required.

## Brand assets

The provided letterhead PDF is preserved at `assets/letterhead.pdf`. The contract header follows its A4 structure with the supplied logo, aligned reference/date rows, angular divider, and letterhead contact footer so dynamic text stays readable and does not overlap. The app does not redistribute downloaded commercial Mending or SignPainter files; the CSS names those brand roles and falls back to an editorial serif and brush script if the fonts are not installed on the machine.

## Verification

Run API and SQLite tests with `py -m unittest discover -s tests -q`. Browser tests use Playwright and Microsoft Edge: run `node tests/ui_workflow.cjs` with Playwright installed, or set `PLAYWRIGHT_MODULE` to its installed package directory. Set `MATRIMONY_URL` if the server uses another port. Browser tests mock record writes and place responses; they never create or overwrite real couple records. They exercise validation, calendars, midnight/PM time handling, names, coordinates, save/reopen, six real PDF downloads, record outages, and mobile layout. PDF samples are written only under ignored `tmp/pdfs/workflow/` for visual verification.
