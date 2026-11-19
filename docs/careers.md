# Careers v1

Review `/careers`, which is intentionally absent from the site navigation and sitemap. Careers routes are noindex during this review phase.

In Sanity:
- **Careers** edits the listing introduction, benefits and safeguarding statement.
- **Job opportunities** manages individual adverts. Set the role details, salary, shifts, posting/closing dates, sections and a unique slug.
- New jobs use Sanity-generated document IDs. Closing dates include the whole day in London; closed/expired roles do not appear in listings and cannot accept applications.
- **Sample role (review only)** labels the vacancy and prevents submission on both client and server. Replace sample copy and confirm salary before switching it off for a real role.
- Presentation supports page content, individual job fields and automatic draft updates on listing, advert and application routes.

Applicants answer the two qualifying questions before entering contact details, qualifications, employment history, availability and a supporting statement. A “No” does not automatically reject them; their answers accompany the application. v1 collects experience as text, with no CV attachment upload.

Applications are stored in the existing private D1 submissions inbox as `careers`, routed to the role’s nursery email with existing notification copy settings, and receive an email acknowledgement. The role ID and title are taken from the published Sanity document, never trusted from the submitted form. Turnstile, input length validation, origin checks and the existing honeypot protect the endpoint. Sample, closed and expired roles are rejected server-side.

The existing Google service account and spreadsheet are reused. The first real application creates **Careers applications** and its column headings automatically; later submissions append there. User values are forced to text so formulas cannot execute. No additional Google credentials are required.

Email/Sheets delivery runs after the durable inbox insert. Delivery failures are logged and leave the application available to staff in `/admin`; v1 has no automatic delivery retry queue. Staff should review the inbox regularly. The privacy notice includes recruitment data handling; confirm recruitment retention and final wording before opening real vacancies.

Validation: production build, root/Studio TypeScript, lint, full repository test suite. Careers tests cover input validation, qualifying answers, London closing dates, preview dependencies, origin/spam/configuration rejection, private storage, email field forwarding, tab creation/append and server-side sample-role rejection. Delivery tests use mocked providers and do not email real applicants.

Idempotent sample setup: `cd studio && npx sanity exec scripts/seed-careers.ts --with-user-token`. It preserves existing roles and page content.
