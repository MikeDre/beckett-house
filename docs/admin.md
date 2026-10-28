# Staff admin

`/admin` is the staff CMS, with a responsive sidebar for Overview, Pages, Announcements, Submissions, Fees & hours, Form recipients, and Activity log. Sign out uses Cloudflare Access logout. Saved content changes take effect without a deploy; homepage drafts require a separate publish step.

## Pages: homepage editor

Open **Pages → Nursery selection map** (or `/admin#pages/home`). The homepage is the nursery-selection map at `/`; Angel and Abbey Road are separate pages and are not editable through this first Pages release.

- **Page content:** edit the screen-reader heading, welcome introduction, nursery button labels, nursery card summaries, local images and their descriptions.
- **Search appearance:** edit the search/social title and description, with character counts and an approximate search preview. The heading stays visually hidden behind the existing logo treatment, preserving the public homepage design.
- **Preview:** see current edits on the actual homepage layout, at desktop or mobile width. The iframe lives at protected `/admin/preview/home`; only same-origin messages from its parent editor are accepted, and nursery navigation is disabled inside the preview. It does not publish or expose a draft on the public URL.
- **Save draft:** validates and saves privately to D1. The live site continues to use the last published content, or the original website defaults until the first publication.
- **Publish changes:** shows a confirmation, saves current unsaved edits if necessary, then publishes the saved draft. The published content is available on the next public request. The saved draft is retained for further editing.
- **Discard edits:** restores the last saved draft. It does not delete the saved draft or change published content.

The editor tracks unsaved changes, preserves edits while switching workspace sections, and warns before closing or reloading a tab with unsaved edits. Two editors cannot silently overwrite each other's homepage changes: every save and publication requires the current record version, and stale requests return HTTP 409 while keeping local edits available to copy or reload. This first release does not include revision rollback or a general page builder.

Homepage content uses one `settings` record, `page:home`; no new database migration is needed. Its draft and published content, timestamps, and version are updated atomically with activity entries. Invalid data or unavailable storage fails visibly in the editor; the public page falls back to the original safe content. Public rendering never reads the private draft as published content.

## Workspace editing

The CMS uses the public site's shared navy, lilac, sky blue, warm yellow and white colour tokens from `app/globals.css`, with the official light/dark SVG logos and existing nursery photography. Branding assets are reused directly rather than redrawn or replaced with a CMS monogram.

The Overview links to the main tasks and shows real recent enquiries and activity. Lists refresh when revisited. Announcements have a list/detail editor, existing-image chooser, appearance preview, publication windows and ordering. **Save announcements** still saves the whole list and immediately updates eligible published items; it does not use the homepage's separate publication workflow.

Fees have nursery-specific session and fee panels, with separate monthly fees and per-day extras. Form recipients retain fixed primary nursery addresses and editable blind copies. The inbox provides filters, a search over the current page of results, pagination, a details drawer and confirmed permanent deletion. All writes retain existing origin, JSON, payload-size and Access checks. Images are selected visually from a searchable library of 54 existing website photos. Source dimensions are filled automatically; editors do not enter image paths or sizes. Uploads are not part of this release.

## Verification

`npm test` builds production output and runs the homepage CMS tests plus rendered Worker tests. CMS tests use in-memory SQLite to verify private drafts, publication, invalid input, conflicts between simultaneous saves, audit entries and storage fallback. Browser checks used a local database to exercise draft saving, draft isolation on the public page, preview hydration, publication, existing settings and mobile layouts. No test content was written to production.


## Production setup

Connected on 28 October 2026 in Cloudflare account `13f7cc851a43ef52f572ad63202e2b0d` (Info@mikedre.com's Account), on Zero Trust Free. The account team was renamed from `joinrabble` to `beckett-house`.

- Team domain: `beckett-house.cloudflareaccess.com`
- Application: **Beckett House Admin** (`8c2cc80f-65af-417b-923e-ec4a456f52b3`)
- Protected hostnames/paths: `www.beckett-house.co.uk/admin`, `/admin/*`, and `/api/admin/*`, in the same application.
- Allow policy: **Beckett House admin — Mike**, restricted to `info@mikedre.com`; all other identities are denied.
- Login method: Cloudflare email one-time PIN. Sign in at `https://www.beckett-house.co.uk/admin` using `info@mikedre.com`.
- Session duration: 24 hours.
- The Worker also restricts `ADMIN_EMAILS` to `info@mikedre.com` and validates the application audience and team issuer. Public Access identifiers and the allowlist are recorded in `vite.config.ts` so a subsequent build retains them.

The existing production database was checked read-only: `settings`, `submissions`, `activity`, and `d1_migrations` are already present. No migration was needed for this connection.

The Worker binds D1 `beckett-house-admin` as `DB`. Before using admin or collecting submissions, apply `migrations/0001_admin.sql`. The build writes its Wrangler config under `dist/server`, so copy migrations beside it after each build:

```sh
npm run build
mkdir -p dist/server/migrations
cp migrations/*.sql dist/server/migrations/
npx wrangler d1 migrations apply beckett-house-admin --config dist/server/wrangler.json --remote
```

For a fresh database, the remote command creates three new tables and an index. Existing data is not deleted. The current production database already has these tables.

Configure Cloudflare Access to protect `/admin`, `/admin/*` and `/api/admin/*` on the public domain. Use the same Access application audience for these paths. Set Worker environment values:

- `ACCESS_TEAM_DOMAIN`: team hostname only, such as `<team>.cloudflareaccess.com` (no scheme or slash).
- `ACCESS_AUD`: the Access application's audience tag.
- `ADMIN_EMAILS`: optional comma-separated staff allowlist; comparison ignores case. If absent, any valid user of the configured Access application can enter.

Do not set `ADMIN_DEV_EMAIL` in production. Even if set, it works only for requests whose hostname is `localhost` or `127.0.0.1`. The workers.dev hostname independently requires a valid Access JWT. The Worker checks RS256, issuer, audience and expiry using the team's cached public keys, following [Cloudflare's JWT validation guidance](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/). An Access service token without an email claim cannot enter.

Retain the existing email, Turnstile and Sheets configuration. If there is no valid notifications settings row, the form still uses `FORM_BCC`. The recipients screen initially shows that effective copy list under All nurseries. Saving any recipients configuration replaces `FORM_BCC` behaviour, including intentionally empty lists. Nursery main To addresses cannot be changed here.

## Local use

```sh
npm run build
mkdir -p dist/server/migrations
cp migrations/*.sql dist/server/migrations/
npx wrangler d1 migrations apply beckett-house-admin --config dist/server/wrangler.json --local
npx wrangler dev --config dist/server/wrangler.json --ip 127.0.0.1 --port 8794 --local-upstream 127.0.0.1 --upstream-protocol http --var ADMIN_DEV_EMAIL:staff@example.invalid
```

Open `http://127.0.0.1:8794/admin`. The reserved `.invalid` address is a local testing identity. Built-config local D1 state lives under `dist/server/.wrangler/state`; rebuilding can remove it. For persistent local testing, pass the same explicit `--persist-to` directory to migration and dev commands. No remote database is used by `--local` migrations.

Runtime types can be regenerated with `npx wrangler types worker/env.d.ts --config dist/server/wrangler.json`.

## Use and retention

Announcements support every display field, a local `/images/` path, preview, ordering and publication windows. Both dates are inclusive calendar days in Europe/London; blank dates have no limit. The Halloween default expires after 6 November 2026. Delete and reorder edits take effect when Save announcements is pressed. Fee amounts must be non-negative numbers. Recipients accept up to 20 addresses per group and receive blind copies for visit and registration notifications.

The inbox contains successful nursery notifications received after this version is installed and the migration is applied. It does not import historical emails or Sheets rows. Storage runs in the background after the nursery email succeeds; a database failure is logged and does not prevent form success. Confirmation emails and Sheets append retain their existing behaviour.

Filter submissions by kind, nursery and status; view details, mark new/contacted/archived, or permanently delete with the inline confirmation. Review visit requests and delete those no longer needed within the privacy notice's 12-month limit. There is no automatic deletion. Activity records contain staff identity, action and submission ID or setting name, without retaining deleted form answers. Reads are not logged.

Public pages fall back to the existing content if a row is absent, invalid or storage is unavailable. Admin writes fail visibly if storage is unavailable. The API enforces JSON, same-origin writes and a 200 KB request limit. Admin pages and API responses are uncached and excluded from indexing.

## Access connection verification (28 October 2026)

Deployed Worker version `1edd9410-7d09-4ff7-859d-380799bcc381`. The production build, all 15 rendered Worker tests, and TypeScript checks pass. Public pages remain available; unauthenticated `/admin`, `/admin/*`, and `/api/admin/*` redirect to the `beckett-house` login domain. The direct workers.dev admin and API reject unsigned requests with HTTP 403. Encoded admin paths also remain protected. The live browser displays the one-time PIN sign-in form for **Beckett House Admin**; the owner's real email-code sign-in must still be completed to verify an authenticated browser session.

Cloudflare stores its login-page display label separately from the team domain. The old display label may still say `joinrabble.cloudflareaccess.com` until that cosmetic change is approved; the actual login domain and JWT issuer are `beckett-house.cloudflareaccess.com`.

## Nursery homepage editors

Pages contains the nursery selection map (`/`), Angel (`/angel`) and Abbey Road (`/abbey-road`). Each has its own private draft, published content and conflict protection. Both nursery homepages support hero slides, introduction, principles or room stages, virtual tour text, nursery life cards, location map heading, highlights, testimonials, FAQs and search appearance. The navigation, factual nursery details and shared announcements remain centrally managed.

Content sections start collapsed. Expand a section to edit it, choose photos from the image library, and use the desktop or mobile preview before publishing. Saving a draft does not change the public page. Publishing requires confirmation and publishes only that page. Moving between pages retains unsaved edits; leaving the workspace warns if changes remain unsaved.
