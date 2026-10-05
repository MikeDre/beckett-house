# Forms setup (to be completed)

The Book a visit and Register forms are built to submit through the website, but they stay switched off until the steps below are done. Until then they fall back to opening the visitor's email app, exactly as before, so nothing is broken in the meantime.

Code: `worker/forms.ts`, `worker/google-sheets.ts`, `app/turnstile.tsx` (added in commit `d7f856a`).

## How it works once switched on

1. A visitor submits a form. Cloudflare Turnstile and a hidden honeypot field filter out spam bots.
2. The submission is emailed to the nursery through Resend, with Reply-To set to the parent:
   - Angel: info@beckett-house.co.uk
   - Abbey Road: abbeyroad@beckett-house.co.uk
3. The parent receives an automatic confirmation email with a copy of what they submitted.
4. A row is added to the Google Sheet for that form and nursery.

If the nursery email fails, the visitor sees an error, so nothing is lost silently. If the confirmation email or the spreadsheet row fails, the visitor still sees success and the error is logged in Cloudflare (Workers → beckett-house-montessori → Logs).

## Checklist

### 1. Resend (emails)

- [ ] Create an account at https://resend.com
- [ ] Add the domain `beckett-house.co.uk` and add the DNS records Resend shows at the domain's DNS provider
- [ ] Wait for the domain to show as **Verified**
- [ ] Create an API key (sending access is enough)
- [ ] Decide the "from" address, e.g. `Beckett House Montessori <hello@beckett-house.co.uk>`. It must be on the verified domain.

Free plan: 3,000 emails/month, 100/day.

### 2. Cloudflare Turnstile (spam protection)

- [ ] Cloudflare dashboard → Turnstile → Add widget
- [ ] Hostnames: `beckett-house-montessori.patient-dust-7607.workers.dev` plus the live domain (`beckett-house.co.uk`, `www.beckett-house.co.uk`) once it points at the Worker
- [ ] Widget mode: Managed
- [ ] Note the **site key** (public) and **secret key** (private)

### 3. Google Sheets

- [ ] Create the spreadsheets: four (one per form for each nursery), or two (one per form) and reuse the same ID for both nurseries
  - Visit requests – Angel
  - Visit requests – Abbey Road
  - Registrations – Angel
  - Registrations – Abbey Road
- [ ] Paste these headings into row 1 of the **first tab** of each sheet (rows are always appended to the first tab)

  **Visit requests:**

  | Submitted at | Parent / carer | Email | Nursery | Child's age | Message |
  |---|---|---|---|---|---|

  **Registrations:**

  | Submitted at | Nursery | Child's full name | Date of birth | Mother's full name | Mother's mobile | Father's full name | Father's mobile | Email | Home address | Home phone | Planned start date | Full days | Mornings | Afternoons |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

- [ ] Keep the sheets private to staff. The registration sheet holds children's personal data.
- [ ] Check that the privacy notice mentions these submissions are stored in Google Sheets and emailed via Resend

### 4. Google service account (lets the website write to the sheets)

- [ ] https://console.cloud.google.com → create a project, e.g. "Beckett House website"
- [ ] APIs & Services → Library → enable **Google Sheets API**
- [ ] IAM & Admin → Service accounts → Create service account (no roles needed)
- [ ] On the service account → Keys → Add key → JSON → download the file
- [ ] Share each sheet with the service account's email (`…@….iam.gserviceaccount.com`) as **Editor**
- [ ] Each sheet's ID is the part of its URL between `/d/` and `/edit`

### 5. Store the secrets in Cloudflare

Run these from the project folder. Each one prompts for its value, which is stored encrypted on the Worker. Never commit these values or paste them into chat.

```sh
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put FORM_FROM_EMAIL                # Beckett House Montessori <hello@beckett-house.co.uk>
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
jq -r .private_key ~/Downloads/<key-file>.json | npx wrangler secret put GOOGLE_PRIVATE_KEY
npx wrangler secret put SHEET_VISIT_ANGEL
npx wrangler secret put SHEET_VISIT_ABBEY_ROAD
npx wrangler secret put SHEET_REGISTER_ANGEL
npx wrangler secret put SHEET_REGISTER_ABBEY_ROAD
```

Delete the downloaded JSON key file once `GOOGLE_PRIVATE_KEY` is stored.

### 6. Switch the forms on and deploy

- [ ] Add the Turnstile **site key** to `.env.local`:

  ```
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key>
  ```

  It's baked in at build time, and this is what switches the forms from the email-app fallback to real submission.
- [ ] Build and deploy:

  ```sh
  npm run build
  npx wrangler deploy
  ```

  Use plain `wrangler deploy`. The build writes the deploy config; `wrangler.deploy.jsonc` doesn't work.

### 7. Test

- [ ] Book a visit, Angel: nursery email arrives at info@, confirmation reaches the test address, row appears in the sheet
- [ ] Book a visit, Abbey Road: the same, to abbeyroad@
- [ ] Register, Angel
- [ ] Register, Abbey Road
- [ ] Replying to a nursery notification goes to the parent's address
- [ ] Check the confirmation emails don't land in spam (if they do, recheck Resend's DNS records, including DMARC)
