# Beckett House Sanity Studio

Website content lives in project `lk8ts1r7`, dataset `production`.

- Studio: https://beckett-house.sanity.studio/
- Use **Presentation** to navigate the website and click a section, text or image to edit it.
- Changes appear in the authenticated preview. **Publish** makes them available to the live website.
- Use **Website content** for page fields, nursery announcements, fees, registration terms and shared contact/navigation details.
- Images are native Sanity assets. Choose an existing image or upload a photo from an image field.
- `/admin` remains the separate Cloudflare-protected submissions inbox, including its Google Sheet link.

Sanity members sign in to Sanity separately from Cloudflare Access. Invite client editors through the Sanity project settings; the Cloudflare email allow-list does not grant Sanity access.

## Development and deployment

From the repository root: `npm run studio:dev`, `npm run studio:build`.
From this directory: `npx sanity deploy --yes`. The deployment app ID is stored in `sanity.cli.ts`.

The authenticated preview runs on `beckett-house-preview.patient-dust-7607.workers.dev`. Production cannot issue preview sessions. Preview secrets exist only in the preview Worker's secret storage. See `migration/README.md` for import, checks, cutover and rollback.

Do not rerun `create-sanity` over this folder. Its initializer incorrectly detected the parent Next.js project during the original setup; this is a standalone Studio with its own dependencies.

The initial dependency audit reported upstream transitive advisories. Do not use `npm audit fix --force`: it proposes unrelated major-version downgrades. Track compatible upstream fixes separately; the production website does not bundle Studio dependencies.
