# Wedding Planning implementation

This extends the existing Matrimony by Hanna app. The supplied technical spec is the product reference; the implementation follows the host's buildless JavaScript, Python, Neon PostgreSQL and Vercel conventions.

## Host mapping

| Concern | Existing app | Integration |
|---|---|---|
| Frontend | Plain JavaScript, shared CSS, local brand assets | `weddings.js` / `weddings.css`, sixth navigation entry; no new framework or build step |
| Routes | Five existing agreement/record screens | Existing screens retained; bookmarkable `/weddings/:id/:view` routes |
| API | Python `ThreadingHTTPServer`; Vercel file-based functions | Shared Python application service behind `/api/v1/weddings` and `/api/v1/service-templates` |
| Database | Raw pg8000 adapter on Neon Postgres, no ORM | Same transaction adapters; additive migration 001, `wp_` namespace |
| Clients | Existing `records` table | Nullable `client_id` FK; setup links an existing record without creating another identity |
| Authentication | No existing identity provider or account system | Host-signed session adapter; loopback-only development identity; no new passwords or account database |
| Tenancy | Legacy records have no organization field | Every new project/resource scoped to verified organization plus wedding membership; legacy records remain a staff integration |
| Payments | Agreement fee and payment terms, no transaction ledger | Minor-unit budget lines and obligations, unique external transaction references; reconciliation only, no charging |
| Files | Static brand/PDF assets, no customer file service | Protected, revisioned database attachments, maximum 1 MB; attachment IDs can later be mapped to a host object-store adapter |
| Notifications | None | Durable in-app outbox, preferences, generation command, acknowledgement/failure states; no external delivery provider |
| Localization | Existing English/Amharic toggle and fonts | Reuses the toggle; Gregorian/Ethiopian display with ISO dates retained, ETB, UTC persistence and Addis Ababa time |
| Tests | unittest and Playwright/Edge scripts | Isolated domain/API tests and real-API browser workflow, plus existing regression suites |
| Deployment | Vercel rewrites and serverless record/place functions | Additional Python function and namespaced rewrites; existing deployment retained |

## Implemented workflows

- The couple questionnaire's Services tab is a picker. **Continue to planner** saves the questionnaire and creates or reuses its linked wedding with exactly those services. Contact details, event days, meal program, venue names/pins, notes, consent and fee stay available through the linked questionnaire and the planner's overview. The professional fee is kept separate from the wedding budget.
- Opening a linked workspace also imports saved questionnaire changes, including for plans created before this handoff existed. Unlinked plans require selecting the correct record through **Link questionnaire**.
- A changed service selection adds only missing services and disables removed ones without deleting their tasks, files or progress. Re-selecting a service restores the same work. Date changes use the existing impact preview; overlapping edits let the planner choose which value to retain.
- Existing standalone plans offer **Link questionnaire**. Setup's saved-couple selector uses the questionnaire handoff instead of asking the same questions again. The planner's **Choose services** and questionnaire navigation reopen that wedding's own record. Service preferences and notes can be configured later through **Services → Open → Service details**, and update the linked agreement source.
- Wedding search, draft setup, saved drafts without a date, six-step setup and atomic/idempotent activation.
- All 21 editable template seeds, custom services, per-wedding snapshots and task generation. Explicit admin upgrade previews retain completed evidence, manual dates and existing obligations; changed completed requirements create fresh checks. Counseling defaults to six calendar months after the wedding and is excluded from pre-wedding readiness.
- Overview with actionable blockers, weighted required-task progress, confirmed services, next actions, milestone verification, outstanding commitments and activity.
- Service detail with Plan, Tasks, Schedule, Vendor, Budget, Files & Approvals and Notes tabs. Blocking is separate from the service's working state. Required checks, approved documents, milestones, evidence and unresolved critical incidents gate confirmation.
- Task ownership, statuses, required checks, proof files, DAG dependencies, cycle rejection and before-save deadline previews. Stale edits return `409` with the latest resource and changed fields.
- Month/week/day calendar and chronological timeline derived from the same task, milestone and event records; scheduling conflict checks for owners, venue/resource references and shared vendor references.
- Date-change previews show shifted generated deadlines, manual overrides, overdue baselines, dependency violations and unchanged external bookings. Applying a preview requires its current token, a version and a reason. Confirmed external appointments and vendor reservations never move implicitly.
- Vendor shortlists, quotes, booking lifecycle, protected contract linkage, contacts, arrivals, backups and an explicit shared vendor reference for conflict checks across weddings.
- Budget estimates/commitments/actuals, allocated payment schedules, paid/outstanding/remaining rollups, reconciliation evidence and unique host transaction linkage. Actual expenses and linked payments are separate measures and are never summed as duplicate expenses.
- Client-facing amounts are explicit fields on shared budget lines. Vendors and clients receive no internal costs, margins, transaction references or confidential notes.
- Document requests, protected upload/download, immutable revisions, approver-specific decisions and retained review history. Client consent must come from a couple member; a planner cannot impersonate it.
- Guest households, party sizes, RSVP counts, table assignments and minimal dietary summaries.
- Design boards with palettes, notes and linked approval documents.
- Day-of run sheets with local times, primary/backup owners, cue states, arrivals and incidents; printable, self-contained offline HTML containing only permission-filtered coordination data.
- In-app reminder generation with daily deduplication, member opt-outs, pending/delivered/failed states and retryable generation. Submitted approvals, confirmed date changes and wedding completion also enqueue notifications transactionally.
- Wedding lifecycle, cancellation with pending-obligation reconciliation, audited admin reopening and soft archival.

The optional advanced phase (drag-and-drop seating/floor plans, rich mood-board media, real-time transport/location integrations and an AI copilot) remains separate. The implementation deliberately uses a simple dependency timeline instead of a licensed premium Gantt library.

## Local use

All data lives in Neon Postgres (`DATABASE_URL` in `.env.local`). Start the app with `npm run dev` (or `py server.py --port 4173` for the standalone Python server) and open `http://127.0.0.1:4173/weddings`. The local server applies the additive schema automatically at startup; existing records are preserved. The loopback development identity is `local-planner` in organization `local`; it exists only when there is no configured session secret, the server is bound to loopback and the request has a loopback Host. Set `MATRIMONY_LOCAL_PLANNER=0` to disable it.

For isolated evaluation, set `MATRIMONY_DB_SCHEMA=test_demo`: the server then works in that separate schema of the same Neon database. Remove it afterwards with `py -c "import server; server.drop_schema('test_demo')"`.

Set `MATRIMONY_WEDDINGS_ENABLED=0` to hide the navigation entry and disable the module APIs. The agreement builder, records and venue search continue to work.

## Hosted identity integration

The host currently has no login implementation. Hosted planning requests therefore deny access until a trusted host signs a session. Membership alone never creates a login or sends an invitation.

1. Set a random `MATRIMONY_SESSION_SECRET` of at least 32 characters in the host/server environment.
2. After the host's actual login succeeds, call `wedding_planner.auth.sign_session(claims, secret)` server-side. Never expose the secret in frontend code.
3. Claims are `userId`, `organizationId`, `roles` and `exp` (Unix seconds, at most 24 hours ahead); optional `permissions: ["counseling"]` grants separate restricted authority. Organization roles can include `admin` or `planner`; wedding-specific roles are stored in `wp_members`.
4. Set `matrimony_session` as an `HttpOnly; Secure; SameSite=Strict; Path=/` cookie on HTTPS, or pass a trusted bearer token. Do not put tokens in URLs or browser storage.
5. A planner creates the project and adds existing host user IDs in Team & access. Roles are scoped to the wedding and can be combined. Coordinators/vendors receive service assignments. Organization admins have explicit access to their organization's projects; an organization planner still needs membership in another planner's wedding.
6. Set `MATRIMONY_LEGACY_ORGANIZATION_ID` to the organization that owns the existing single-tenant couple records (default `local`). Directory/link access and the older agreement-record endpoints require a staff session for that organization, or an explicit signed `legacy_records` permission. This prevents clients/vendors or another tenant's planners from bypassing the new module through the legacy API.

Browser role selectors and unsigned `X-User-ID` / `X-Role` headers are never trusted. Mutating cookie requests require same-origin JSON; cross-site changes are rejected. Use HTTPS and the host's existing access controls for deployment.

`MATRIMONY_LEAD_APPROVAL_LIMIT_MINOR` optionally caps a lead planner's financial approvals; an admin must approve amounts above it.

## Schema and PostgreSQL rollout

Migration 001 lives in `wedding_planner/storage.py:migrate`. It creates `wp_schema`, weddings, membership, tenant catalog overrides, idempotency records, audit history, service/task/dependency records, milestones, events, vendors, budget lines, payments, document requests/versions/reviews/files, guests, issues, boards, restricted notes and notification records. Context, ownership, status, deadlines, template codes, transaction references and amounts are relational/indexed columns. Configurable attributes and versioned snapshots use JSON payloads. API validation checks referenced records belong to the same wedding before writes.

Schema application and every multi-record operation run transactionally. PostgreSQL writes serialize the wedding aggregate and retain optimistic version checks. `If-Match` (or a body `version`) is required for edits; `Idempotency-Key` is required for mutating POSTs. Financial references, service template codes and reminder deduplication keys have unique indexes.

Do not apply a migration implicitly to production. Use a development branch of the existing Neon project and a **direct** connection:

```powershell
python -m pip install -r requirements.txt
# Supply DATABASE_URL_UNPOOLED securely in the environment for the development branch.
python -m wedding_planner.migrate --postgres
```

The host's existing `records` table must already be present. The command refuses pooled migration URLs. Test the branch first, then apply the same additive migration using the existing release process. Normal application requests continue to use pooled `DATABASE_URL`. No remote database was migrated or production deployment performed during implementation.

The Vercel function `api/weddings.py` uses the same application service as the local server and never enables the development identity. Configure `DATABASE_URL`, `MATRIMONY_SESSION_SECRET`, the feature flag and any approval threshold in Vercel. `requirements.txt` pins the existing pg8000 version. The function excludes local data, credentials, tests and static brand assets from its bundle. The previous hardcoded database URL was removed from `api/records.js`; provision its connection through the environment and rotate the previously embedded credential before rollout.

## Reminder jobs and offline coordination

Use the application's existing scheduler to run:

```powershell
python -m wedding_planner.reminders
```

The command produces deduplicated **in-app** notifications; it sends no email, SMS or vendor messages. The Activity tab also offers Check reminders. An existing notification provider can consume the durable pending records and record delivery/failure; no third-party delivery credentials or subscriptions were introduced.

Export offline plan downloads standalone HTML with its own print styles, run-sheet times, shared contacts and open incidents. It contains no files, private notes or financial records. Coordination snapshots are additionally cached per signed-in user and wedding for 24 hours; exports can use that last snapshot during a connection outage. Protected files are never cached for offline use.

## Verification

```powershell
python -m unittest discover -s tests -q
node --check weddings.js
node --check app.js
python -m compileall -q server.py api/weddings.py wedding_planner

# Use an installed Playwright package, or point PLAYWRIGHT_MODULE at its directory.
node tests/wedding_workflow.cjs
node tests/questionnaire_workflow.cjs
node tests/legacy_regressions.cjs
```

The planner and questionnaire browser tests start and stop their own servers in unique temporary `test_…` schemas of the Neon database (dropped afterwards) and write output under ignored `tmp/planning-qa/` and `tmp/questionnaire-qa/`. They create synthetic users/records only, and write screenshots and an offline export there. The questionnaire test exercises actual record persistence, exact service selections, repeated handoff, preserved task progress, later configuration and the agreement round trip. The legacy wrapper starts its own isolated server and runs `ui_workflow.cjs` and `venue_picker.cjs`, which mock record writes and provider calls. Those individual scripts can also use an independently started isolated server via `MATRIMONY_URL`.

Backend coverage includes transactional activation rollback, idempotency, authorization and tenant isolation, cross-wedding IDs, disabled/aftercare readiness, evidence gates, dependency cycles, schedule/date previews, conflicts, simultaneous edits, integer money, transaction deduplication, client/vendor redaction, separate counseling authority, immutable document history, designated client consent, reminder preferences and signed-session validation.

Postgres/Vercel deployment still needs verification against an isolated database branch and the actual host identity provider. External notification delivery and large-file object storage remain host integration points. The proposed production latency/capacity targets are not a benchmark result from the local test environment.

Runtime references: [Vercel Python file-based functions](https://vercel.com/docs/functions/runtimes/python/api-directory), [Neon Python connections](https://neon.com/docs/guides/python).
