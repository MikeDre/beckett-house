# Beckett House → Sanity

Target: `lk8ts1r7`, `production`. One English website; existing URLs remain unchanged.

## Inventory and mapping

`lib/sanity/content-model.json` describes the content fields and repository defaults. The page singletons cover Home, Angel, Abbey Road, About, History, FAQ, Timetable, Fees, Montessori, Gallery, Virtual Tour, Find Your Nursery, Visit, Register, Privacy and Thank You. Separate singletons contain shared navigation/contact details and nursery announcements.

Existing saved D1 publications override repository defaults. Unpublished drafts are imported separately as Sanity drafts. D1 publication history remains an archive; it is not recreated as Sanity history. Submissions, parent/child details, private recipients, access configuration and credentials are excluded.

Photos become native Sanity image assets. Panorama tiles and viewer mechanics remain deployment assets; room labels and descriptions are editorial content. Redirects and form field names remain application code.

## Extraction and repeatability

Snapshot only the nine selected content settings with Wrangler into ignored `migration/extracted/settings.json`. Never export the whole settings table or submissions. Keep snapshots outside git. The import script uploads assets before documents, reuses asset hashes, and does not overwrite existing Sanity documents on reruns. Singleton IDs are controlled by the Studio structure.

The initial model preserves the proven page contracts through a boundary adapter. Rich text formatting is migrated without rewriting approved copy. Editorial field labels derive from their content or section names. Shared reusable contact information has its own document.

## Preview and cutover

The separate preview Worker requires a signed, expiring session issued only after Sanity preview URL validation. Draft queries use a server-only read token. Preview responses are private, uncached and excluded from indexing; only the approved Studio origins can frame them. Preview form submissions are disabled.

Production now uses Sanity by default. Set `BECKETT_SANITY_ENABLED=false` for a rollback build to read the preserved D1 CMS. At cutover, retire content editing from `/admin` and keep the submissions inbox. Keep D1 content/history and bundled photos for rollback. Rollback is a production build with `BECKETT_SANITY_ENABLED=false`; preview secrets are never needed by the production reader.

Required checks: schema validation, source/import counts, published/draft parity, image availability, route rendering, metadata, secure draft isolation, visual editing bindings, submissions and form delivery regression tests. Deploy the preview and Studio before enabling production content. Do not rerun the original source codemods over edited files; they are provenance tools, not ongoing publishing commands.


## Commands

- Website build: `npm run build`
- Preview build: `BECKETT_VISUAL_PREVIEW=true npm run build`
- Deploy the just-built Worker: `npx wrangler deploy --config dist/server/wrangler.json`
- Studio build/deploy: `npm run studio:build`, then `cd studio && npx sanity deploy --yes`
- Type generation: `cd studio && npm run typegen`
- Import (from Studio directory, after source snapshots and schemas): `npx sanity exec scripts/import-content.ts --with-user-token -- --write`
- Add newly modeled fields without overwriting existing editorial fields: append `--add-missing` to that import command.
- Library import: `npx sanity exec scripts/import-library.ts --with-user-token`
- Normalize older imports to native Studio array member types: `npx sanity exec scripts/normalize-array-types.ts --with-user-token`
- Content parity: `npx sanity exec scripts/validate-content.ts --with-user-token`
- Dataset schema checks: `npx sanity documents validate --yes --level warning --format json`
- Preview HTTP checks (root): `node --import ./migration/scripts/register.mjs migration/scripts/check-preview.mjs`

Preview checks accept `PREVIEW_SESSION_SECRET_FILE` pointing to a local, permission-restricted secret file. Do not commit that file. The reversible draft check uses the same variable and refuses to replace an existing visit draft.

Rollback retains all source content and history. It does not undo Sanity edits; resume the Sanity build after resolving an issue rather than synchronizing the two editors. The production Worker has no draft read token or signing key. Cloudflare Access still protects submissions; Sanity project membership controls content editing.
