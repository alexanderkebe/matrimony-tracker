# Matrimony By Hanna · Event Planner

A standalone, bilingual wedding planning workspace for Matrimony By Hanna.

## What it does

- Collects couple details, contact information, event dates and duration, venue information, and ETB financial commitments.
- Includes all 21 services from the provided planning list.
- Lets the planner turn each service on or off and choose service-specific options for each couple.
- Saves the current draft locally in the browser and completed plans in Neon Postgres.
- Lists saved couples by the bride's and groom's first names, with search and reopening of the full plan.
- Shows the couple's first names live in the sidebar and header, with recent-couple shortcuts and clear record-save status.
- Includes keyboard-friendly, branded Gregorian calendars and AM/PM time pickers, localized in English and Amharic.
- Adapts Teri's builder venue picker: search-as-you-type with Ethiopian-first suggestions, an always-visible Google Maps preview, selected-venue cards, directions, removal, and opt-in current-location lookup. Saves names, addresses and coordinates with each plan; manual entry remains available.
- Supports English and Amharic UI/content labels.
- Generates two separate, print-ready PDFs on the supplied letterhead: a dynamic service agreement in the selected language and a proforma listing the couple, event days, chosen services, one overall ETB fee, and a thank-you message.
- Uses the supplied Helvetica, Benaiah, Ethiopic Sadiss, and letterhead assets from `public/assets/`.
- Uses the supplied Matrimony logo as a cropped transparent PNG in the app and agreement header.
- Uses Mending and SignPainter as the brand font roles when those fonts are installed, with graceful fallbacks when they are not available locally.

## Run locally

The app runs on Next.js (App Router, TypeScript). Node.js 22.13+ is required; Python 3 is also needed for the Wedding Planning API. PDF libraries are bundled locally. From this folder:

```powershell
npm install --include=dev
npm run dev
```

Then open `http://localhost:4173`. `npm run dev` starts Next.js on port 4173 and the Python planning API (`server.py`) on port 8765, which Next.js proxies at `/api/v1/*`. Set `PYTHON` if Python is not on the path as `py` (Windows) or `python3`. For a production check, run `npm run build` then `npm start` (set `PLANNING_API_URL=http://127.0.0.1:8765` and run `py server.py --port 8765` alongside it for Wedding Planning).

How the stack is organised:

- `app/` holds the Next.js page and route handlers: `/api/records` (couple records) and `/api/places` and `/api/places/reverse` (venue search).
- `lib/` holds the server code. All data (records, client requests and Wedding Planning) lives in Neon Postgres; set `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` for migrations) in `.env.local`. There is no local database file. The Python planning API needs `py -m pip install -r requirements.txt` (pg8000).
- `legacy/index.html` is the page markup. The original scripts and styles in `public/` still drive the UI and are meant to be converted to React one screen at a time.
- `server.py` and `wedding_planner/` are the Python Wedding Planning API. On Vercel it runs as the `api/weddings.py` function, and `next.config.ts` rewrites `/api/v1/*` to it. Running `py server.py --port 4173` directly still serves the whole app as a fallback; the Python and browser test suites use this.

Generating an agreement or proforma saves or updates the couple's record. You can also use **Save record** in the sidebar before generating a document (both names are required). The **Records** tab and recent sidebar shortcuts reopen complete plans. Changing a saved plan shows **Unsaved changes** until it is saved again. Starting a new plan clears the working draft but keeps previous records. Records are stored in the Neon Postgres database; use Neon's backups and branches to preserve them. Opening `index.html` directly does not provide saved records or venue search. Use the same hostname and port to retain access to the browser's local draft.

To create either document, complete the couple and event details, choose at least one service, enter the agreed overall fee once, and select the document. The agreement includes the selected service scope, responsibilities, the 40% / 40% / 20% payment schedule, cancellation/change terms, media-consent choice, and signature lines. The separate proforma lists selected services without assigning prices to individual items; it displays only the overall agreed fee. Missing fields are highlighted instead of silently preventing generation. Record-save errors do not prevent PDF export.

The agreement follows the supplied four-section Matrimony format in English and Amharic, with seven numbered delivery/payment clauses and both media-consent alternatives (only the chosen alternative is checked). Client names, dates, venues, service selections and payment amounts remain dynamic. Official CBE/BOA account details appear under the account-holder name; Telebirr is listed as contact information because the supplied terms allow bank-account payments only. `SERVICE_PROVIDER` in `app.js` keeps the supplied account-holder and contract-signatory names separate. Each signatory has distinct signature and date lines. Core stylesheet/script URLs are versioned to prevent stale markup/style combinations after a refresh.

Direct downloads contain 3x-resolution rendered A4 pages, including the original letterhead, watermark and footer on every page, with loaded local fonts. These downloads preserve the exact visual appearance and Amharic glyphs; text is rasterized rather than selectable. The separate **Print** action uses browser-native text rendering. Choose **Save as PDF**, A4, and disable browser headers and footers. Background graphics are not required for the letterhead. Oversized individual notes that cannot fit safely are flagged rather than exported with clipped content.

## Venue search

Type at least three characters in the search box for a venue, hotel, landmark or city. Suggestions appear after a short pause; **Enter** and the search button also work. Ethiopian matches are prioritized, with worldwide results available when there is room. Arrow keys move through results, **Enter** selects, and **Escape** dismisses. A search query is separate from the saved venue: searching for a replacement does not erase the current selection. Choose a result to replace it, or use its remove button to clear it.

The Google Maps preview uses the saved coordinates, rather than guessing between same-named places. The selected-venue card offers Google Maps and directions links. **Near me** explicitly requests browser permission, looks up the address and selects your current GPS coordinates as the venue; denied permission leaves the existing selection unchanged. If address lookup is offline, the permitted coordinates still work. Use **Enter a venue manually** for a custom or offline address. Editing it clears a stale pin and marks the entry as unconfirmed; existing text-only records remain usable.

Maps and searches require internet access. The [Photon public demo](https://github.com/komoot/photon#demo-server) supports search-as-you-type with reasonable usage, but has no availability guarantee. The app debounces typing, runs only one request per field at a time, limits upstream requests to one per second, and caches results for five minutes. Set `MATRIMONY_PHOTON_URL` to a trusted self-hosted Photon API endpoint for larger deployments; `MATRIMONY_PHOTON_REVERSE_URL` optionally overrides its reverse endpoint. Search-data attribution links to [OpenStreetMap](https://www.openstreetmap.org/copyright); Google retains its own map attribution. Search text/map-center coordinates go to Photon. Map queries go to Google. **Near me** sends the permitted GPS coordinates to both providers. Couple details and prices are not sent. The embed follows Teri's existing Google Maps embed URL approach; no API key or new subscription is configured by this app.

## Brand assets

The provided letterhead PDF is preserved at `assets/letterhead.pdf`. The contract header follows its A4 structure with the supplied logo, aligned reference/date rows, angular divider, and letterhead contact footer so dynamic text stays readable and does not overlap. The app does not redistribute downloaded commercial Mending or SignPainter files; the CSS names those brand roles and falls back to an editorial serif and brush script if the fonts are not installed on the machine.

## Wedding Planning module

The **Wedding Planning** navigation entry opens the operational workspace described in the supplied technical spec: draft/activate setup, 21 configurable service templates, tasks and dependencies, readiness, calendar/timeline, vendor bookings, budget/payment reconciliation, revisioned approvals, guests, design boards and day-of coordination with offline export. The original agreement, proforma, records and venue workflows remain available.

Choose services in the couple questionnaire, then select **Continue to planner**. The questionnaire and planning workspace share a saved couple record, and returning to the planner reuses the same wedding. Service preferences are configured later inside the planner; selections and existing details remain available to the agreement. Existing standalone weddings can use **Link questionnaire** to connect their couple record.

Run `npm run dev`, then open `http://127.0.0.1:4173/weddings`. The planning tables are created in Neon automatically when the planning API starts.

See [the implementation and rollout guide](docs/WEDDING_PLANNING.md) for identity integration, database migration, permissions, API conventions, reminders, tests and current integration limits. Hosted planning access requires a trusted host session and migration 001; neither production data nor hosting is changed by the local implementation.

## Sign-in and team accounts

The planner app is for Hanna's team only. Every page except the client portal (`/portal`) and the sign-in page (`/signin`) requires a signed-in account, and so do the couple records, client requests and Wedding Planning APIs.

- **First run:** open the app and create the owner account (name, email, password of 10+ characters). Only one owner can exist; after that, nobody can sign up without an invite.
- **Team:** the owner and admins open **Team** (people icon at the bottom of the sidebar) to create one-time invite links (valid 7 days) for planners, or admins (owner only), send them by WhatsApp, Telegram, SMS or email, create password reset links (valid 24 hours), and remove people. Removed people and other devices after a password reset are locked out within 10 minutes.
- **Owner locked out:** run `node scripts/reset-link.mjs owner@example.com https://your-app-url` on a computer with `.env.local` to print a reset link.
- **Private per account:** every couple record, client request and planner wedding belongs to the account that registered it, and no other account can list, open, change or delete it. This includes admins and the owner. Client-portal links made with **Create client link** carry the sender's code, so a couple's request goes to the planner who sent the link (requests without a valid code go to the owner). Records and planner weddings from before sign-in existed belong to the owner. Other people can still work on a planner wedding if its owner adds them as members inside that wedding.
- **Sign out** (arrow icon next to your name) also clears couple drafts and offline copies saved in that browser.

Sessions use two httpOnly cookies: a 10-minute signed session (`matrimony_session`, checked by Next.js and the Python planner) and a 30-day refresh token stored hashed in `app_sessions`. Passwords are scrypt hashes in `app_users`; invite and reset codes are stored only as hashes in `app_invites`. Set `MATRIMONY_SESSION_SECRET` (a random value of at least 32 characters) in `.env.local` locally and in the Vercel project settings. `npm run dev` passes `.env.local` to the Python planner as well. The standalone `py server.py` server used by the Python tests does not have sign-in and must not be exposed publicly.

## Verification

Run API tests with `py -m unittest discover -s tests -q`. Tests use the Neon database from `DATABASE_URL`, but only inside a temporary `test_…` schema of their own that is dropped afterwards, so live tables are never read or written. Browser tests use Playwright (installed as a dev dependency) and Microsoft Edge: with `npm run dev` running, run `node tests/ui_workflow.cjs`, `node tests/auth_workflow.cjs` and `node tests/isolation_workflow.cjs`. Tests against the running app sign in with temporary `@matrimony.test` accounts that are deleted afterwards; they never use or change the owner account. Set `MATRIMONY_URL` if the server uses another port. Browser tests mock record writes and place responses; they never create or overwrite real couple records. They exercise validation, calendars, midnight/PM time handling, names, coordinates, save/reopen, agreement scope and consent, six real PDF downloads, aggregate-only proforma pricing, record outages, and mobile layout. PDF samples are written only under ignored `tmp/pdfs/workflow/` for visual verification.

Run `node tests/venue_picker.cjs` for focused venue checks: debounce, keyboard selection, stale responses, saved-pin compatibility, manual/offline entry, remove/replace, current-location permission and fallback, localization, and mobile layout. It also mocks records and provider responses, so live records are untouched.
