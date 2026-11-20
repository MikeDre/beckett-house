# Careers v1

Review `/careers`, which is intentionally absent from the site navigation and sitemap. Careers routes are noindex during this review phase.

In Sanity:
- **Careers** edits the listing introduction, benefits and safeguarding statement.
- **Job opportunities** manages individual adverts. Set the role details, salary, shifts, posting/closing dates, sections and a unique slug.
- New jobs use Sanity-generated document IDs. Closing dates include the whole day in London; closed/expired roles do not appear in listings and cannot accept applications.
- Advert section bodies are plain text. Start a line with `•` or `-` to show it as a bulleted list; other lines are paragraphs, with a blank line between paragraphs.
- **Sample role (review only)** labels the vacancy and prevents submission on both client and server. Replace sample copy and confirm salary before switching it off for a real role.
- Presentation supports page content, individual job fields and automatic draft updates on listing, advert and application routes.

Applicants answer the two qualifying questions before entering contact details, a CV, qualifications, employment history, availability and a supporting statement. Both answers must be “Yes”: Continue stays disabled otherwise, a “No” points the applicant to other opportunities, and the server rejects applications without two “Yes” answers.

A CV is required: PDF, DOC or DOCX up to 5 MB. The worker checks the file contents match the extension. CVs are stored in D1 (`submission_files`, split into 1 MB parts and saved in the same transaction as the application), attached to the nursery notification email (not the applicant's copy) and downloadable from the submission in `/admin`. Deleting a submission deletes its CV. **Run migration `0006_submission_files.sql` on the remote database before deploying** (see `docs/admin.md`).

Applications are stored in the existing private D1 submissions inbox as `careers`, routed to the role’s nursery email with existing notification copy settings, and receive an email acknowledgement. The role ID and title are taken from the published Sanity document, never trusted from the submitted form. Turnstile, input length validation, origin checks and the existing honeypot protect the endpoint. Sample, closed and expired roles are rejected server-side.

The existing Google service account and spreadsheet are reused. The first real application creates **Careers applications** and its column headings automatically; later submissions append there. User values are forced to text so formulas cannot execute. No additional Google credentials are required.

Email/Sheets delivery runs after the durable inbox insert. Delivery failures are logged and leave the application available to staff in `/admin`; v1 has no automatic delivery retry queue. Staff should review the inbox regularly. The privacy notice includes recruitment data handling; confirm recruitment retention and final wording before opening real vacancies.

Validation: production build, root/Studio TypeScript, lint, full repository test suite. Careers tests cover input validation, qualifying answers, London closing dates, preview dependencies, origin/spam/configuration rejection, private storage, email field forwarding, tab creation/append and server-side sample-role rejection. Delivery tests use mocked providers and do not email real applicants.

The listing hero reuses the `shapehop` Lottie animation from the register page.

Idempotent sample setup: `cd studio && npx sanity exec scripts/seed-careers.ts --with-user-token`. It preserves existing roles and page content.
