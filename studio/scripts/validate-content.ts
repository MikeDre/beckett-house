import {getCliClient} from 'sanity/cli'
import {readFile, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import assert from 'node:assert/strict'
import models from '../../lib/sanity/content-model.json'
import {fromSanity} from '../../lib/sanity/shape'
const root = fileURLToPath(new URL('../../', import.meta.url))
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
  perspective: 'raw',
})
const rows = JSON.parse(await readFile(root + 'migration/extracted/settings.json', 'utf8')).flatMap(
  (r: {results: unknown[]}) => r.results,
)
const settings = new Map<string, unknown>(
  rows.map((r: {key: string; value: string}) => [r.key, JSON.parse(r.value)]),
)
const documents = await client.fetch('*[_id match "page-*" || _id match "drafts.page-*"]')
let checked = 0,
  photos = 0
function checkArrayMembers(value:unknown,path='document') {
 if(Array.isArray(value)){for(const [index,item] of value.entries()){if(item && typeof item==='object'){assert.equal(typeof item._type,'string',path+'['+index+'] must have a Studio member type');assert.equal(typeof item._key,'string',path+'['+index+'] must have a stable key')}checkArrayMembers(item,path+'['+index+']')}return}
 if(value && typeof value==='object')for(const [key,child] of Object.entries(value))checkArrayMembers(child,path+'.'+key)
}
for(const document of documents)checkArrayMembers(document)

function parity(actual: unknown, expected: unknown, field = '') {
  if (Array.isArray(expected)) {
    assert(Array.isArray(actual), field)
    assert.equal(actual.length, expected.length, field)
    expected.forEach((item, i) => parity(actual[i], item, field + '[' + i + ']'))
    return
  }
  if (expected && typeof expected === 'object') {
    for (const [key, child] of Object.entries(expected))
      parity((actual as Record<string, unknown>)[key], child, field + '.' + key)
    return
  }
  if (typeof expected === 'string' && expected.startsWith('/images/')) {
    assert.match(
      actual as string,
      /^https:\/\/cdn\.sanity\.io\/images\/lk8ts1r7\/production\//,
      field,
    )
    photos++
    return
  }
  // Null fee rows are deliberately omitted in Sanity.
  if (field.endsWith('.width') || field.endsWith('.height')) {
    assert(Number.isInteger(actual) && (actual as number) > 0, field)
    return
  }
  if (expected === null && actual === undefined) return
  assert.deepEqual(actual, expected, field)
}
for (const model of models) {
  const saved = settings.get('page:' + model.slug) as
    {published?: unknown; draft?: unknown} | undefined
  const published =
    model.slug === 'announcements'
      ? {...model.content, items: settings.get('announcements') ?? model.content.items}
      : model.slug === 'fees'
        ? {...model.content, ...(settings.get('fees') as object)}
        : (saved?.published ?? model.content)
  for (const [prefix, expected] of [
    ['', published],
    ...(saved?.draft ? [['drafts.', saved.draft]] : []),
  ] as [string, unknown][]) {
    const id = prefix + 'page-' + model.slug,
      document = documents.find((doc: {_id: string}) => doc._id === id)
    assert(document, 'Missing ' + id)
    parity(fromSanity(document, model.content), expected, id)
    checked++
  }
}
const broken = await client.fetch(
  'count(*[_type in ["sanity.imageAsset","sanity.fileAsset"] && !defined(url)])',
)
assert.equal(broken, 0)
await writeFile(
  root + 'migration/reports/validation.json',
  JSON.stringify(
    {
      documentsChecked: checked,
      imageReferencesChecked: photos,
      brokenAssets: broken,
      result: 'passed',
    },
    null,
    2,
  ) + '\n',
)
console.log(
  `Parity passed: ${checked} published/draft documents, ${photos} image references, no broken assets.`,
)
