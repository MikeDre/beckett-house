# Beckett House Sanity Studio

Standalone Studio for project `lk8ts1r7`, dataset `production`. It lives beside the website and has its own dependencies, TypeScript and lint configuration. It is not embedded in the website's Next.js/vinext application.

## Local development

From the repository root:

```sh
npm --prefix studio install
npm run studio:dev
```

Or from this directory:

```sh
npm install
npm run dev
```

The development server normally runs at http://localhost:3333. Use the same Sanity account login provider as when joining the project (currently GitHub for the initial owner).

## Validation

```sh
npm run studio:build
```

For standalone type checking, run `npx tsc --noEmit` inside `studio/`.

## Current scope

This is the clean Studio scaffold only. No website content has been imported, no production readers have been switched, and no Studio deployment has been created. Schemas, Presentation/visual editing and the migration remain the next phase. The current CMS and submissions continue operating as before.

## Initializer issue

The Sanity initializer detected the root project's Next.js dependency and tried to read `studio/package.json` before scaffolding it. The workaround was to run the initializer from a temporary directory outside the Next.js project, with this directory supplied as an absolute `--output-path`, selecting the existing project and dataset and disabling framework integration. Do not rerun the initializer over this Studio; maintain its configuration directly.

## Secrets

Project ID and dataset name are public configuration. Keep tokens and signing keys in ignored environment files or the deployment's secret storage, never in source files. The root repository ignores `.env*` files. Deployment hostname, CORS and preview settings will be configured as part of the visual-editing pilot.

## Dependency audit at initial setup

The generated dependency tree currently reports npm audit advisories in transitive packages, including `js-yaml`, `minimatch`, `picomatch` and `smol-toml`. Both Studio build and type/lint checks pass, but these findings still need review before the Studio is deployed. `npm audit fix --force` was not applied: npm proposes major-version downgrades of Sanity and its lint configuration, and the current latest picomatch release is also reported as affected. The production website does not import these Studio dependencies.
