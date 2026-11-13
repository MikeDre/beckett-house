# Staff admin

`/admin` is the staff CMS, with a responsive sidebar for Overview, Pages, Announcements, Submissions, Fees & hours, Form recipients, and Activity log. Sign out uses Cloudflare Access logout. Saved content changes take effect without a deploy; homepage drafts require a separate publish step.

## Pages: homepage editor

Open **Pages → Nursery selection map** (or `/admin#pages/home`). The homepage is the nursery-selection map at `/`; Angel and Abbey Road homepages and the FAQ page have their own editors under Pages.

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

- Team domain: `newnuevo.cloudflareaccess.com`
- Application: **Beckett House Admin** (`8c2cc80f-65af-417b-923e-ec4a456f52b3`)
- Protected hostnames/paths: `www.beckett-house.co.uk/admin`, `/admin/*`, and `/api/admin/*`, in the same application.
- Allow policy: **Beckett House admin — Staff**, restricted to `info@mikedre.com`, `kamranhamid@hotmail.co.uk`, `shahidhamid@msn.com` and `mike@newnuevo.com`; all other identities are denied.
- Login methods: Google or Cloudflare email one-time PIN. Sign in at `https://www.beckett-house.co.uk/admin` using an allowed email address. A Google account is not required; the one-time PIN is delivered to that mailbox.
- Session duration: 24 hours.
- The Worker also restricts `ADMIN_EMAILS` to the same four staff addresses and validates the application audience and team issuer. Public Access identifiers and the allowlist are recorded in `vite.config.ts` so a subsequent build retains them.

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

Cloudflare stores its login-page display label separately from the team domain. On 29 October 2026, the login page’s organisation name was updated from `joinrabble.cloudflareaccess.com` to **Beckett House Montessori** under Reusable components → Custom pages → Customize Login Page. The corrected name was verified on the live login screen. The login domain and JWT issuer remain `beckett-house.cloudflareaccess.com`; authentication and access policies were unchanged.

## Nursery homepage editors

Pages contains the nursery selection map (`/`), Angel (`/angel`) and Abbey Road (`/abbey-road`). Each has its own private draft, published content and conflict protection. Both nursery homepages support hero slides, introduction, principles or room stages, virtual tour text, nursery life cards, location map heading, highlights, testimonials, FAQs and search appearance. The navigation, factual nursery details and shared announcements remain centrally managed.

Content sections start collapsed. Expand a section to edit it, choose photos from the image library, and use the desktop or mobile preview before publishing. Saving a draft does not change the public page. Publishing requires confirmation and publishes only that page. Moving between pages retains unsaved edits; leaving the workspace warns if changes remain unsaved.

## Access team rename (29 October 2026)

The existing Zero Trust team was renamed to `newnuevo.cloudflareaccess.com`. The Worker’s `ACCESS_TEAM_DOMAIN` now uses this hostname for signing-key retrieval and JWT issuer validation. The existing application audience and allowlist are unchanged. Earlier verification entries above describe the domain at the time.

## FAQ editor

Pages → Frequently asked questions (`/admin#pages/faq`) edits `/faq`. Staff can edit the page introduction, topic headings, questions, answers, search title and description. Topics and questions can be added, removed with confirmation, and reordered using Move up/Move down. Sections begin collapsed. At least one topic and one question per topic are required; identifiers stay stable when headings change and when items move.

The FAQ uses the existing Save draft / Preview / Publish workflow with unsaved-change warnings and version-conflict protection. Its `page:faq` settings record is independent of the homepages and needs no database migration. The private desktop/mobile preview accepts validated same-origin messages from its editor, allows topic anchors and blocks links to other pages. Invalid edits leave the last valid preview visible with an explanation.

Only published content feeds the public FAQ headings, answers, sidebar and FAQPage JSON-LD. Search/social metadata comes from published search fields. The FAQ is rendered dynamically so publishing does not depend on a deployment or page-cache expiry. Until first publication, the existing questions remain the public defaults. Homepage FAQ snippets are separate content and are not changed by this editor.

## Uploaded image library

Images in the CMS combines the existing checked-in photos with staff uploads. The same library opens from every image chooser. Uploads require a descriptive name and alt text, accept still JPEG/PNG/WebP photos up to 5 MB, reject dimensions above 40 megapixels or 12,000 pixels per side, and store an optimised WebP at up to 2,400 pixels per side in Cloudinary. No unsigned upload preset is exposed. The Worker signs uploads server-side; the browser never receives the API secret.

The Cloudinary connection uses `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_API_KEY` in the maintained Vite config, plus `CLOUDINARY_API_SECRET` as an encrypted Worker secret. The configured client account was observed on Cloudinary's Free plan, with pay-as-you-go disabled. Do not enable paid plans without the client's decision. The 250-photo CMS limit is a library management bound, not a guarantee about the provider's shared storage/bandwidth/transformation credit allowance.

Apply `migrations/0002_media.sql` before deployment. D1 stores image metadata and deletion state, not image binaries. URLs remain same-origin `/images/uploads/<id>.webp`, so existing image/path validators and page content formats continue to work. The public Worker supports the original and both responsive image aliases, with only three fixed delivery widths (640, 1080 and 2400). Existing repository images are not migrated or removable through the CMS.

Removal checks every saved settings record, including private drafts, published pages and announcements. An atomic retirement claim plus settings-table triggers prevent an image deletion from racing a concurrent save/publication. Referenced uploads return 409; a retired/deleted image cannot be saved into page content. A failed provider removal stays pending and can be retried from Images. Deleted metadata remains as a tombstone. Unsaved edits are not stored references: if another editor removes an image used only in unsaved edits, the eventual save rejects it and asks the editor to choose another image.

Upload failures before D1 registration attempt to remove the newly created Cloudinary asset. An operator should reconcile orphaned Cloudinary assets if a provider timeout or cleanup failure occurs. Provider credentials and raw provider error bodies are never returned to the browser. Images are public website assets once uploaded; uploading is not a private document-storage facility. Public image responses may remain in browser caches for five minutes after retirement.

### About page

The Pages list includes **About Beckett House** (`/beckett-house`; `/about` retains its redirect). The editor provides collapsed sections for the introduction, approach, care, useful link labels and history, plus four image pickers and search appearance fields. Link destinations remain fixed. Use `**bold text**` for emphasis within paragraphs; HTML is not accepted. Image descriptions can be edited after choosing a photo. Drafts and publishing use the same version conflict protection and activity log as the other page editors. The private desktop/mobile preview uses the public view, with navigation disabled. No database migration is needed; content is stored under `page:about` in settings, with the original page as its fallback.

### Version history and restore

Each page editor has a **Version history** tab. It lists the latest 50 published snapshots, with publication time and publisher when known. Choose **Preview**, then **Restore as draft** and confirm. Restoring replaces that page's saved draft and any local unsaved edits; it does not publish. Review the draft through the usual editor and publish separately. Restore operations use the current page version to reject stale saves and are recorded in Activity.

Apply `0003_page_revisions.sql` before deploying this feature. It preserves the existing live copy for each saved page; earlier versions cannot be reconstructed, and the last draft editor is not attributed as publisher. Pages with no stored record show their original website content. Future snapshots are created by SQLite triggers in the same transaction as publication, with a maximum of 50 per page. The original content is also preserved on a page's first draft save. Uploaded photos referenced by retained history cannot be removed, ensuring historical previews and restored drafts can still use them. No public history endpoints are exposed; history uses the existing authenticated, no-store admin API and same-origin mutation checks.

### Timetable and term dates

**Pages → Timetable and term dates** manages the `/timetable` page. Select Angel or Abbey Road, then expand Term dates, Holiday closures or the relevant daily routine section. Dates use date pickers; invalid dates, reversed ranges and overlapping terms or holiday periods are rejected. Periods display chronologically. Holiday closures are optional and appear publicly only when added. Activities can be added, removed and moved up/down. Preschool routines explicitly apply to both nurseries; babies' routines apply to Abbey Road only. Opening hours, session times and annual closure descriptions are managed in Fees & hours and shared by both pages.

The editor includes search appearance, private desktop/mobile preview, draft/publish and 50-version history. Apply `0004_timetable_history.sql` before deployment to extend history triggers to this page. Existing routines, dates and nursery switching are preserved as defaults; no holiday closures are inferred.

### Our history and CMS consistency

**Pages → Our history** manages `/history`: origins, teaching team, home-from-home statement, Abbey Road, lasting connections, welcome photo and SEO. Use the same draft, preview, publish and version history controls as the other six page editors. Apply `0005_history_page.sql` before deployment to include it in revision triggers.

Opening hours, annual closure descriptions and session times are now managed only in **Fees & hours** for both the fees and timetable pages. The timetable editor manages routines, term dates and date-specific holiday closures. Old timetable records remain readable; stored opening/session rows are no longer editable or used by the public view. Historical timetable previews use the current shared settings and explain this explicitly. Review free-text FAQ/nursery descriptions separately when changing operational details.

The full content/UX review and remaining client content questions are in [cms-review.md](cms-review.md).

### Submission sorting

The inbox offers Newest first (default), Oldest first, Name A–Z and Name Z–A. Sorting applies to the complete filtered result before pagination; changing sort order returns to page 1. The name is the parent/carer for visit requests and the child for registrations. Search remains scoped to the currently displayed page.
