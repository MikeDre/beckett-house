# October 2026 security review

Reviewed 23 October 2026 against the [Node.js security advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) and the npm audit service.

## Applied updates

- Pin development/build tooling to Node.js 24.22.1 through `.nvmrc`; restrict `engines.node` to patched supported release lines (22.23.4, 24.22.1, 26.12.1 or newer within those ranges).
- Update Next.js to 16.4.2, React and React server components to 19.3.1, vinext to 1.3.0, Vite to 8.3.5, and the associated Cloudflare and RSC tooling.
- Override Cloudflare tooling's pinned Undici dependency to 7.30.1, the version included in the Node.js security release. Override fflate to the compatible patched 0.7.5 release.
- Refresh compatible transitive dependencies with `npm audit fix`.
- Support vinext's new `/_next/image` URL alongside the previous image route, with tests for responsive image delivery and rejection of external/traversal paths.

The deployed application runs on Cloudflare's managed Workers runtime, not the locally installed Node.js binary. Changing npm packages or a Workers compatibility date does not itself patch Cloudflare's runtime. Node.js 24.22.1 was downloaded to a temporary directory, checked against the published SHA-256, and used for build, verification and deployment; the machine-wide Node installation was not changed. Run `nvm install && nvm use` for subsequent development.

## Remaining audit findings

The full audit decreased from 32 findings (including one critical) to 12 (eight high and four moderate). These 12 package findings trace to two underlying issues:

- `braces <=3.0.3`: stack exhaustion on deeply nested patterns. The latest available braces release is still affected. It is pulled in through linting and vinext's CommonJS build plugins.
- `esbuild <=0.24.2`: development-server cross-origin access. Drizzle Kit's legacy `@esbuild-kit/esm-loader` pins an affected esbuild. Updating Drizzle Kit to its current 0.31.11 does not remove it; the audit suggests an incompatible downgrade rather than a forward fix. Database migration tooling was not replaced in this update.

Do not treat the full dependency tree as vulnerability-free. Recheck upstream fixes with `npm audit`; avoid a blind `npm audit fix --force`, which proposes unrelated downgrades. Next.js's updated lint configuration also reports existing synchronous state updates in effects; these remain visible as warnings, alongside navigation warnings.

## Verification

Used Node.js 24.22.1: production build and all 15 rendered Worker tests pass; `tsc --noEmit` passes; lint passes with six warnings; Wrangler production deployment dry run passes. The image regression test covers both URL routes and checks generated responsive asset selection.

The production-only audit (`npm audit --omit=dev`) reports zero findings. This does not exclude build dependencies bundled into the Worker from the full-audit caveat above.

Deployed to `https://www.beckett-house.co.uk` as Worker version `cf23f3fa-0371-4de4-94c0-bbfc0ab93b6a`. Live smoke checks pass for the homepage, both nursery pages, visit, registration, privacy, JavaScript assets, both image routes (including external URL rejection), and the bare-domain redirect. Unauthenticated admin pages and API remain closed with HTTP 503 because Access is not configured, matching the existing production setup.
