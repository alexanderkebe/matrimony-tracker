# Matrimony By Hanna · Event Planner

A standalone, bilingual wedding planning workspace for Matrimony By Hanna.

## What it does

- Collects couple details, contact information, event details, venue information, and ETB financial commitments.
- Includes all 21 services from the provided planning list.
- Lets the planner turn each service on or off and choose service-specific options for each couple.
- Saves the current draft locally in the browser and completed plans in SQLite.
- Lists saved couples by the bride's and groom's first names, with search and reopening of the full plan.
- Supports English and Amharic UI/content labels.
- Generates a print-ready agreement containing only the chosen services and selections.
- Uses the supplied Helvetica, Benaiah, Ethiopic Sadiss, and letterhead assets from `assets/`.
- Uses the supplied Matrimony logo as a cropped transparent PNG in the app and agreement header.
- Uses Mending and SignPainter as the brand font roles when those fonts are installed, with graceful fallbacks when they are not available locally.

## Run locally

The app has no build step or third-party packages. Python 3 is required for SQLite records. Start it from this folder:

```powershell
py server.py --port 4173
```

Then open `http://localhost:4173`.

Generating an agreement saves or updates the couple's record. The **Records** tab shows each couple by first name; open one to edit its full details and services. **Save record** on the agreement screen also saves edits. Starting a new plan clears the working draft but keeps previous records. Records are stored in `data/matrimony.sqlite3` on this computer and are excluded from Git. Back up that file to preserve records. Opening `index.html` directly does not provide SQLite records.

To create a PDF, complete the plan, select **Generate agreement**, then choose **Print / save PDF**. In the browser print dialog, choose **Save as PDF**, A4, and disable browser headers and footers. The supplied letterhead is embedded as a printable image on every page; background graphics are not required. Fonts and images finish loading before printing.

## Brand assets

The provided letterhead PDF is preserved at `assets/letterhead.pdf`. The contract header follows its A4 structure with the supplied logo, aligned reference/date rows, angular divider, and letterhead contact footer so dynamic text stays readable and does not overlap. The app does not redistribute downloaded commercial Mending or SignPainter files; the CSS names those brand roles and falls back to an editorial serif and brush script if the fonts are not installed on the machine.
