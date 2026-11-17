# Beckett House visual editing assessment

This is a read-only architecture assessment of the Beckett House and BMRU implementations, plus current Sanity documentation. No project, dataset, import, access change or production deployment was created. This document is the planning artifact; extraction/import scripts and target schemas are deliberately deferred until an implementation option is chosen.

## Recommendation

Use Sanity for content editing if the objective is the BMRU Presentation experience as the long-term editorial workflow. Retain the existing Cloudflare/D1 admin for submissions, enquiry statuses, recipients and operational activity. Prove one page in an isolated preview first, before committing to migration.

A narrower custom visual editor is also credible. Beckett House already has shared rendering components, protected previews, postMessage draft updates, validation, publishing and revision history. If the requirement is simply “click a visible section to open its fields beside the preview,” extending the existing CMS could be the smaller initial job. Do not confuse that feature with reproducing Sanity's full editing, asset, collaboration and source-mapping platform.

## What BMRU actually does

Sources: `bmru/astro/docs/visual-editing.md`, `studio-bmru/sanity.config.ts`, `astro/src/sanity/edit-attributes.ts`, `astro/src/components/VisualEditing.astro` and `astro/src/sanity/visual-server.ts`.

BMRU uses a separate authenticated Cloudflare preview Worker, Studio Presentation, explicit `data-sanity` document/field mappings, and Sanity's standalone overlays. A refresh reloads the draft-rendered page. It does not depend on invisible stega strings or the full Next.js live-content integration. Production is generated from published content, while preview uses SSR. Preview sessions, iframe origins, cookies, no-store responses and secret isolation are already useful implementation patterns to reuse conceptually.

Beckett House uses React/App Router APIs through vinext on Cloudflare. Its public CMS-backed pages already render dynamically. Its preview is embedded in the custom admin, shares the page view components and updates through same-origin postMessage. This is a different runtime and preview model: reuse the BMRU security/mapping approach, not its entire Astro build configuration.

## Options

| Approach | Work required | Main benefit | Main tradeoff |
| --- | --- | --- | --- |
| Custom section-level click-to-edit | Add a persistent split workspace, preview-only edit targets, a selected-section message and focus/expand behaviour in the existing forms | Keeps the existing interface, login, assets and version workflow | Bespoke UI and mappings remain ours to maintain |
| Custom field-level visual editor | Add precise field paths, stable item keys, repeatable-item selection, overlay positioning, keyboard behaviour and image editing | Can closely match this site's needs | More interaction and regression work, especially arrays, hidden tabs and slides |
| Sanity content editor plus existing operations admin | Define schemas, content queries/adapters, asset migration and authenticated Presentation preview | Reuses the editorial platform already used at BMRU | Migration effort, separate Sanity identity/membership, plan limits and vendor dependency |

A custom implementation must validate every preview selection against a known field/section registry, check message origin/source, and never allow an overlay event to mutate arbitrary object paths. The ordinary server-side validation and version checks remain authoritative. A sticky preview beside an editor or drawer is necessary: the current separate Content and Preview tabs alone would still require excessive switching.

If building across several client sites, either invest deliberately in a reusable, schema-driven editing library or use Sanity. Adding custom mappings to each individual site without shared tooling is the least attractive long-term route.

## Content inventory and proposed mapping

| Current source | Proposed destination | Treatment |
| --- | --- | --- |
| Seven page records/defaults: map, Angel, Abbey Road, About, History, timetable, FAQ | Structured page singletons, with Angel/Abbey Road sharing a nursery-page schema | Preserve routes, draft/published state, SEO and stable array keys |
| Announcements | Announcement documents | Preserve ordering, publication state, display windows and nursery targeting |
| Fees, shared hours and sessions | Shared fees/settings singleton | Both fees and timetable must query the same source |
| Nursery identity/contact facts | Shared nursery documents where included in migration | Preserve existing addresses and explicitly resolve duplicated age wording with client |
| About/History text and existing emphasis | Meaningful named fields and constrained Portable Text for paragraphs | Avoid carrying `text1`, `text28` etc. forward as the editorial model |
| Bundled image library and Cloudinary uploads referenced by content | Sanity image assets with alt text and optional hotspot/crop | Deduplicate source images and keep old URLs available for rollback |
| D1 submissions and enquiry statuses | Remain in D1 | No parent/child records imported into Sanity |
| Form-recipient configuration and email/Google Sheets secrets | Remain in existing Worker/admin | No change to delivery handlers or storage ownership |
| Existing activity and page revisions | Preserve existing archive; new content history managed by Sanity | Do not promise to reconstruct old Sanity transactions |
| Other developer-managed pages, gallery and panorama assets | Remain unchanged initially | Sanity adoption does not automatically make these editable |

Source access is already available through repository defaults and authenticated D1 reads. Before import, export the current records and metadata to a private, ignored snapshot; the previous database review is not a current migration snapshot. Read both drafts and published records, plus the referenced asset inventory. No new locales are presently in scope. Target project/dataset and current live counts must be confirmed before implementation.

Use singleton IDs for singleton documents; retain a durable source-to-destination map for other documents/assets and import dependencies first. Import must be repeatable without overwriting later client edits. Generate a report for missing assets, unmapped fields, required values and unresolved references.

## Pilot and migration sequence

1. Create a client-owned Beckett House Sanity project and a scratch dataset/preview deployment. Do not reuse BMRU's production dataset or credentials.
2. Start with the Angel homepage: it exercises text, slides, nested cards, repeated testimonials/FAQs and images. Copy sample content; the live page continues using D1.
3. Add explicit document/field mappings and standard overlays. Verify click-to-edit, draft refresh, image replacement, repeatable-item selection and hidden carousel/FAQ states in a real browser.
4. Test vinext/Cloudflare integration explicitly. The installed runtime has draft-mode support, but that does not prove compatibility with all of `next-sanity`, live APIs or iframe authentication. Prefer the BMRU-style explicit mapping/standalone integration if the Next-specific stack causes friction.
5. If the pilot succeeds, finalise schemas, extract a fresh snapshot, import referenced assets/shared settings, then import published content and drafts. Preserve unshared changes and London publication dates.
6. Update content loaders while reusing existing view components. Asset URLs require particular care: today's validators, responsive Worker and some SEO code assume `/images/...` paths. Support Sanity's image delivery properly rather than concatenating absolute CDN URLs with the site hostname.
7. Preserve current public URLs; no redirect change should be needed. Check canonical metadata, structured data, alt text, image dimensions and all seven rendered pages against the source.
8. Configure Sanity logins/CORS, preview entry/exit, signed session cookies, precise framing origins and noindex/no-store. Sanity Studio needs its own membership; Cloudflare email-PIN access is not automatically a Sanity login.
9. Freeze editing briefly, re-export any changes, cut over content readers, and disable the old content editors' writes for migrated content. Avoid dual editing or bidirectional sync.
10. Verify public vs draft isolation, publication freshness, asset delivery, contact forms, email/Sheets delivery and the unchanged submissions admin. Keep a rollback deployment and the D1 content snapshot until accepted.

Keep `/admin` as an operations dashboard, with a prominent “Edit website” link to the branded Sanity Studio. Keep submissions, sorting/search, the Google Sheet shortcut, statuses, deletion, notification recipients and Cloudflare access. A standalone Studio is simpler initially than embedding it inside the existing admin and adding nested iframe/auth complexity. An embedded Studio or custom Studio link can be considered later.

## Plan and ownership considerations

Current public plan information was checked during this assessment:

- Visual Editing and Presentation are included on Free.
- Free includes 20 seats, but the available project roles are Administrator and Viewer; the Editor role is on Growth. This is an important distinction for nontechnical client staff.
- Growth is listed at US$15 per paid seat/month; Viewer seats are free. Count actual named Sanity accounts, not the number of addresses in today's Cloudflare allowlist. For example, three paid accounts would be US$45/month before tax and any usage charges.
- Free datasets are public. Only public website content/assets belong there; draft access still needs authentication. Operational submissions and recipient information remain in D1 regardless.
- History retention is currently three days on Free and 90 days on Growth. This differs materially from our current retention of the latest 50 publications per page. Retain a read-only legacy archive/export; decide separately whether longer independent publication snapshots are required.
- Use a client-owned project/organisation and client billing if a paid plan is chosen. The Free plan is suitable for evaluating the pilot, but production suitability depends on permissions, usage and history requirements.

Sources: [Sanity pricing](https://www.sanity.io/pricing), [history retention](https://www.sanity.io/docs/user-guides/history-experience), [framework-agnostic visual editing](https://www.sanity.io/docs/visual-editing/build-a-visual-editing-integration), [account authentication options](https://www.sanity.io/docs/help/account-recovery). Plan terms can change and should be rechecked before committing.

## Effort assessment

These are engineering planning estimates, not measured delivery promises. A focused custom section-selection prototype is roughly 1–3 working days; production-quality field-level coverage across all seven pages is a broader job. A Sanity Angel-page pilot is roughly 2–4 working days; full content, image, permissions and QA migration is roughly another 5–10 working days after a successful pilot. Runtime/auth surprises, content clean-up and stakeholder feedback can extend either route. Do not add these estimates as if both alternatives will be implemented.

The decision checkpoint is the pilot experience: does it materially improve the real client's editing tasks, and do its plan/permission/history tradeoffs make sense? My preference for the BMRU-style experience is Sanity content editing with the existing operations admin retained.
