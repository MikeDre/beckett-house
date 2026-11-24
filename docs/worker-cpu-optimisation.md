# Worker CPU optimisation review

## Baseline

Cloudflare GraphQL workersInvocationsAdaptive, production script `beckett-house-montessori`, seven-day window ending 24 November 2026. Successful invocations: 24,755; sampled CPU P50 11.202 ms, P75 25.680 ms, P90 68.806 ms, P99 181.462 ms. These are whole-Worker metrics, not route-level measurements; they do not attribute CPU to Sanity, SSR, images or form handling. No after-change improvement has been claimed.

## Changes

1. Shared the page dependency query through React's render-scoped `cache`, so layout, page data and metadata can reuse Sanity documents and career jobs. No module-global content cache is used. Preview revision fingerprints still include all relevant documents. Removed unused `documents.jobs` from the client CMS provider payload; job components already receive those jobs as props.
2. Added a conservative opt-in HTML edge-cache adapter. It is **disabled by default** and requires `PUBLIC_PAGE_CACHE_ENABLED=true` in Worker bindings. Entries expire after 30 seconds. Browser hits revalidate rather than retaining the edge TTL locally. Only canonical-host GET HTML requests on an explicit informational-page allow-list qualify. Query strings, cookies, Authorization, RSC/router requests, private routes, preview, jobs, forms, fees and timetable are excluded. Non-200, non-HTML, Set-Cookie, private/no-store/no-cache and variant-sensitive responses are not stored. Read failures fall back to rendering. Writes use waitUntil and cannot fail the response.

Some framework HTML responses may carry private/no-store or RSC Vary headers: these deliberately remain uncached. The candidate must be checked against actual response headers on staging before deciding whether to enable it. It is not a blanket promise that every public page will cache.

A bounded 30-second TTL allows published informational changes to appear without a new webhook. Before increasing that TTL, add authenticated publish invalidation. Deployment changes invalidate asset hashes; keep the cache disabled during future incompatible frontend rollouts unless a deployment-specific namespace is introduced.

## Review / next measurements

- No subscription or production configuration changes are made by this review branch of work.
- Measure cold and warm HTML, RSC navigation, auth, form submissions and 5 MB CV processing separately. Never infer application safety from a cached homepage.
- Validate render-cache sharing under vinext with request-level Sanity query counts; React memoization depends on the active server-render cache dispatcher.
- Enable the edge-cache flag on an isolated staging Worker, observe HIT/MISS headers and CPU, and verify private/preview bypasses before production activation.
- Target uncached routes as well as hits; free-tier viability requires representative high-percentile CPU below 10 ms, plus checking the other sites on the same account.
- Keep Workers Paid until those checks establish reliable headroom. This work does not establish that a downgrade is safe.
