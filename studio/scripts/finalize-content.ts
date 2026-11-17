/** Add newly modeled metadata without overwriting editorial changes. Remove only empty scaffolding fields. */
import {getCliClient} from 'sanity/cli'
import models from '../../lib/sanity/content-model.json'
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
  perspective: 'raw',
})
for (const model of models) {
  const docs = await client.fetch('*[_id in $ids]', {
    ids: ['page-' + model.slug, 'drafts.page-' + model.slug],
  })
  for (const document of docs) {
    let patch = client.patch(document._id)
    if (model.slug === 'thank-you' && document.seoTitle === 'Confirmation pages')
      patch = patch.set({
        seoTitle: 'Thank you',
        seoDescription: 'Thank you for getting in touch with Beckett House Montessori.',
      })
    const seo = Object.fromEntries(
      Object.entries(model.content).filter(
        ([key]) => key === 'seoTitle' || key === 'seoDescription',
      ),
    )
    if (Object.keys(seo).length) patch = patch.setIfMissing(seo)
    const empty = Object.entries(document)
      .filter(
        ([key, value]) =>
          !key.startsWith('_') &&
          value &&
          typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0,
      )
      .map(([key]) => key)
    if (empty.length) patch = patch.unset(empty)
    if (empty.length || Object.keys(seo).length) await patch.commit()
  }
}
console.log(
  'Added missing SEO fields and removed empty scaffolding; existing editorial values preserved.',
)
