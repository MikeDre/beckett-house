# Beckett House Montessori

Mobile-first headless website concept for Beckett House Montessori’s Angel and
Abbey Road nurseries.

## Recommended production stack

- **Frontend:** React 19 with Next-compatible routing through vinext
- **Hosting:** Cloudflare Workers / Sites
- **CMS:** Sanity Studio
- **Analytics:** Google Analytics 4 and Google Search Console
- **Forms:** Sanity Functions, Resend, or the nursery’s chosen CRM
- **360 media:** Marzipano or Pannellum with Cloudflare R2 delivery
- **Optional motion:** Lottie for small Montessori-material animations only

Sanity is the preferred CMS because editors get a friendly structured studio,
while schemas remain TypeScript-controlled, versioned and easy for an LLM to
extend safely. The current content adapter lives in `lib/content.ts` and maps
directly to the proposed CMS documents.

## Proposed CMS documents

- `siteSettings`: contact details, announcement, social links and SEO defaults
- `location`: address, ages, hours, nearby areas, rooms, Ofsted link and visit CTA
- `page`: modular page sections with controlled layouts
- `faq`: direct question and answer pairs grouped by page or location
- `testimonial`: quote, attribution and approval status
- `term`: dates and downloadable documents
- `feeSheet`: funding explanation, fees and version date
- `panorama`: location, room, poster image, 360 asset and accessible description

This structure keeps important facts reusable across page copy, structured data,
voice search, an on-site answer system and future LLM workflows.

## Local development

```bash
npm install
npm run dev
npm test
```

## Google Maps

Create a Google Maps JavaScript API key and restrict it by HTTP referrer to the
production domain(s) and localhost. For development, copy `.env.example` to
`.env.local`, set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, and run `npm run dev`.

For a Cloudflare production build, expose the same variable to the build
process (for example,
`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key npm run build`) before deploying the
build output. `NEXT_PUBLIC_` values are inlined into the client bundle at build
time, so setting this only as a runtime Worker secret will not configure the
map. If the value is empty or missing, the site uses its Leaflet/OpenStreetMap
fallback.
