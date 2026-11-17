/** Reversible end-to-end preview check. Never replaces a pre-existing editorial draft. */
import {getCliClient} from 'sanity/cli'
import {readFile} from 'node:fs/promises'
import {issueSession, SESSION_COOKIE} from '../../lib/sanity/preview-session'
import assert from 'node:assert/strict'
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
  perspective: 'raw',
})
const id = 'drafts.page-visit'
assert.equal(
  await client.fetch('count(*[_id==$id])', {id}),
  0,
  'An editorial visit draft exists; do not replace it.',
)
const published = await client.getDocument('page-visit')
assert(published)
const content = Object.fromEntries(
  Object.entries(published).filter(([key]) => !key.startsWith('_')),
)
const key = Object.keys(content.copy as object).find((key) => key.startsWith('letsFind'))
assert(key)
const marker = 'PREVIEW-ISOLATION-' + crypto.randomUUID()
const created = await client.create({
  ...content,
  _type: published._type,
  _id: id,
  copy: {...(content.copy as object), [key]: marker},
})
try {
  const secret = await readFile(
    process.env.PREVIEW_SESSION_SECRET_FILE || '/tmp/beckett-preview-session-secret',
    'utf8',
  )
  const cookie = SESSION_COOKIE + '=' + (await issueSession(secret))
  const response = await fetch(
    'https://beckett-house-preview.patient-dust-7607.workers.dev/visit',
    {headers: {Cookie: cookie}},
  )
  assert.equal(response.status, 200)
  assert((await response.text()).includes(marker), 'Authenticated preview did not render the draft')
  const publishedPreview = await fetch(
    'https://beckett-house-preview.patient-dust-7607.workers.dev/visit',
    {headers: {Cookie: cookie + '; beckett-preview-perspective=published'}},
  )
  assert.equal(publishedPreview.status, 200)
  assert(
    !(await publishedPreview.text()).includes(marker),
    'Published preview must not render draft content',
  )
  const publicValue = await client
    .withConfig({perspective: 'published'})
    .fetch('*[_id=="page-visit"][0].copy[$key]', {key})
  assert.notEqual(publicValue, marker)
  assert.equal(
    (await fetch('https://beckett-house-preview.patient-dust-7607.workers.dev/visit')).status,
    401,
  )
  console.log(
    'Draft isolation passed: preview renders an unpublished change, published content is unchanged, anonymous access is denied.',
  )
} finally {
  await client.delete({query: '*[_id==$id && _rev==$rev]', params: {id, rev: created._rev}})
}
