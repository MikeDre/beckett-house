# Staff admin

`/admin` manages announcements, opening hours and fees, notification copies, the submissions inbox and the latest 100 changes. Changes take effect on the next public request without a deploy. Sign out uses Cloudflare Access logout.

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
