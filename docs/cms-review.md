# CMS content and UX review

Reviewed the seven editable pages and all management sections. Verification covered source/default content, the saved live page settings, validation and rendered HTML tests. This is not an interactive browser usability test.

## Changes made

- Added Our history, including descriptive text fields, a photo picker, SEO, protected preview, publishing and restore support.
- Standardised page names and ordering using a shared page catalogue; removed the stale four-page overview count.
- Clarified the difference between private page drafts and settings that take effect when saved.
- Removed duplicate opening-hours/session editing from the timetable editor. Fees & hours now supplies those details on both the fees and timetable pages. Historical timetable previews deliberately use current shared settings; the history panel explains this.
- Replaced editor terms such as “hero eyebrow” with familiar labels. Standardised movement actions and added removal confirmation for repeatable nursery content.
- Numbered About paragraphs, named feature images, and limited formatting hints to fields that support emphasis. Accreditation-link spacing is handled by the view.
- Made all CMS-backed public routes explicitly dynamic. A new rendered-response check caught the fees page serving build-time values; regression checks now verify current published map/nursery content and shared hours on both public pages.
- Corrected success notification wording so actions such as inbox updates and restores are not all labelled “Changes saved.”
- Made required fields clearer in the About, History and timetable editors, and improved expired-login feedback during uploads.

## Page review

| Editor | Content and workflow |
| --- | --- |
| Nursery selection map | Welcome, nursery cards and SEO; shared facts are clearly distinguished from editable copy. |
| Angel homepage | Welcome/photos, approach, room cards, nursery life, locations, highlights, testimonials and FAQs; familiar labels, ordering and removal confirmation. |
| Abbey Road homepage | Same controls and workflow as Angel; nursery-specific copy and photos remain separate. |
| About Beckett House | Grouped text, fixed link destinations, descriptive image choices and supported paragraph emphasis. |
| Our history | Origins, home-from-home statement, Abbey Road and lasting connections; original factual details preserved, introduction grammar tidied. |
| Timetable and term dates | Nursery selection, independent term/closure dates, date validation, explicit shared preschool routines and a link to shared opening settings. |
| Frequently asked questions | Topics/questions, ordering, confirmation before removal and live sidebar/structured-data consistency. |

Every page uses Page content, Search appearance, Preview and Version history tabs. Pages retain their own drafts and version checks. Preview links cannot navigate away, publishing requires confirmation, and restore writes a draft without publishing.

## Management review

| Section | Outcome |
| --- | --- |
| Overview | Current page count and broader description of editable content. |
| Pages | Clear page addresses, consistent names, stable order and workflow guidance. |
| Images | Upload, search, copy URL, open image and protected removal; existing static photos remain available. |
| Announcements | Publication toggle, dates, preview, ordering and save behaviour explained. |
| Submissions | Filters, page-scoped search, status changes and permanent-delete confirmation; spreadsheet/email copies are explicitly outside inbox deletion. |
| Fees & hours | Currency formatting retained; shared opening/session information now feeds the timetable as well. Saving updates live content. |
| Form recipients | Primary recipients and optional copies remain distinct; empty copy lists have explicit meaning. |
| Activity log | Records saves, publications, restores, image actions and inbox changes. |

Responsive styles keep long editor tabs scrollable, action groups wrapping, and hidden panels excluded from layout. Existing keyboard tab navigation, labelled controls, dialog focus handling, screen-reader descriptions and unsaved-edit protection were reviewed in source. Image libraries load only when opened, and page preview frames load only when active.

## Saved content check

The production database had one saved page record, Angel. Its published and draft content both passed validation and matched the current defaults. The other editable pages use their defaults. No submitted parent/child details or notification-recipient settings were requested for this review.

## Content points for the client

- The About page refers to children aged 2–5 and welcoming children from two and a quarter; Angel’s homepage describes care from three months. Confirm which nursery/age group the About wording should describe before changing those claims.
- Changing opening hours does not rewrite free-text FAQ answers, nursery descriptions or fixed map facts. Review those statements when operational details change; addresses and nursery age ranges remain developer-managed.
- Montessori, Gallery, Virtual tour, privacy, contact/forms and supporting system pages are not full page editors. The Pages screen makes clear that some website content still needs a developer. Existing forms and legal text were not rewritten in this review.

## Validation

TypeScript, production build, targeted lint and the full automated suite are checked before release. Coverage includes History publication/private drafts, safe image selection, all seven pages’ version history/restore, shared timetable/fees values and private preview access. Existing hook lint warnings are unchanged.
