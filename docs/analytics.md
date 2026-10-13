# Analytics

Google Analytics 4: account **Beckett House** (411833913), property **Beckett House** (558768855), web stream `beckett-house.co.uk`, measurement ID `G-4JGQVYM4ZG`.

Code: `app/analytics.ts` (events and consent helpers), `app/cookie-consent.tsx` (banner).

GA only loads after a visitor accepts the cookie banner, and never on localhost. Events from visitors who decline are not sent.

## Events

| Event | When it fires | Parameters | Key event |
|---|---|---|---|
| `generate_lead` | A visit request or registration is sent successfully (recorded on the thank-you page) | `form_type` (visit, register), `nursery` | ✅ |
| `contact_click` | A phone or email link is clicked | `method` (phone, email), `nursery` | ✅ |
| `form_start` | First time someone focuses a field in the visit or registration form, once per page view | `form_type` | |
| `form_error` | A form submission fails | `form_type`, `nursery` | |
| `book_visit_click` | Any link to /visit is clicked | `link_text` | |
| `directions_click` | A Google Maps link is clicked | `nursery` | |
| `review_click` | A "review on Google" link is clicked | `nursery` | |
| `social_click` | Instagram or Facebook link is clicked | `network` | |
| `nursery_select` | A nursery is chosen on the homepage map | `nursery` | |
| `virtual_tour_start` | A 360° tour is opened | `nursery`, `room` | |
| `virtual_tour_room` | Another room is chosen in the 360° tour | `nursery`, `room` | |

Enhanced measurement (page views, scrolls, outbound clicks, file downloads etc.) is also on in the GA stream.

## Custom dimensions (event scope)

Registered in GA so the parameters can be used in reports: Nursery (`nursery`), Form type (`form_type`), Contact method (`method`), Tour room (`room`), Social network (`network`). `link_text` is not registered.

New dimensions only fill in from the day they're created; they don't backfill.
