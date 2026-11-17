import {getCliClient} from 'sanity/cli'
import {readFile, writeFile, mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import models from '../../lib/sanity/content-model.json'
import {fieldName} from '../../lib/sanity/shape'

const root = fileURLToPath(new URL('../../', import.meta.url))
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
})
const snapshot = JSON.parse(
  await readFile(root + 'migration/extracted/settings.json', 'utf8'),
).flatMap((r: {results: unknown[]}) => r.results)
const settings = new Map<string, unknown>(
  snapshot.map((r: {key: string; value: string}) => [r.key, JSON.parse(r.value)]),
)
const write = process.argv.includes('--write')
const assetCache = new Map<string, {_id: string}>()
const report: {id: string; state: string; photos: number}[] = []
function blocks(text: string) {
  return text.split(/\n\n/).map((paragraph, index) => ({
    _type: 'block',
    _key: 'p' + index,
    style: 'normal',
    markDefs: [],
    children: paragraph
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part, i) => ({
        _type: 'span',
        _key: 's' + i,
        text: part.startsWith('**') ? part.slice(2, -2) : part,
        marks: part.startsWith('**') ? ['strong'] : [],
      })),
  }))
}
async function asset(src: string) {
  if (assetCache.has(src)) return assetCache.get(src)!
  let bytes: Uint8Array
  if (src.startsWith('/images/uploads/')) {
    const response = await fetch('https://www.beckett-house.co.uk' + src)
    if (!response.ok) throw new Error('Cannot load uploaded photo: ' + response.status)
    bytes = new Uint8Array(await response.arrayBuffer())
  } else if (src.startsWith('/images/') && !src.includes('..'))
    bytes = await readFile(root + 'public' + src)
  else throw new Error('Unsupported migration image: ' + src)
  const hash = createHash('sha1').update(bytes).digest('hex')
  const existing = await client.fetch('*[_type=="sanity.imageAsset" && sha1hash==$hash][0]{_id}', {
    hash,
  })
  if (!existing && !write) return {_id: 'dry-run-' + hash}
  const result =
    existing ??
    (await client.assets.upload('image', Buffer.from(bytes), {filename: src.split('/').pop()}))
  assetCache.set(src, result)
  return result
}
async function transform(value: unknown, key = ''): Promise<unknown> {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string' && value.startsWith('/images/')) {
    const image = await asset(value)
    return {_type: 'image', asset: {_type: 'reference', _ref: image._id}}
  }
  if (typeof value === 'string' && /^paragraph\d+$/.test(key)) return blocks(value)
  if (Array.isArray(value))
    return Promise.all(
      value.map(async (item, index) => {
        const result = await transform(item)
        return result && typeof result === 'object' && !Array.isArray(result)
          ? {_type:'item',...result, _key: 'item' + index}
          : result
      }),
    )
  if (typeof value === 'object') {
    if (!Object.keys(value).length) return undefined
    const object = value as Record<string, unknown>,
      result: Record<string, unknown> = {}
    for (const [name, child] of Object.entries(object))
      if (!['src', 'imageSrc'].includes(name)) {
        const item = await transform(child, name)
        if (item !== undefined) result[fieldName(name)] = item
      }
    const src = (object.src ?? object.imageSrc) as string | undefined
    if (src) {
      const image = await asset(src)
      result._type = 'image'
      result.asset = {_type: 'reference', _ref: image._id}
    }
    return result
  }
  return value
}
for (const model of models) {
  const saved = settings.get('page:' + model.slug) as
    {published?: unknown; draft?: unknown} | undefined
  const source =
    model.slug === 'announcements'
      ? {...model.content, items: settings.get('announcements') ?? model.content.items}
      : model.slug === 'fees'
        ? {...model.content, ...(settings.get('fees') as object)}
        : (saved?.published ?? model.content)
  for (const [state, content] of [
    ['published', source],
    ...(saved?.draft ? [['draft', saved.draft]] : []),
  ] as [string, unknown][]) {
    const id = (state === 'draft' ? 'drafts.' : '') + 'page-' + model.slug
    const document = {
      ...((await transform(content)) as object),
      _type: fieldName(model.slug) + 'Page',
      _id: id,
    }
    if (write) {
      await client.createIfNotExists(document)
      if (process.argv.includes('--add-missing')) {
        const fields = {...document} as Record<string, unknown>
        delete fields._id
        delete fields._type
        await client.patch(id).setIfMissing(fields).commit()
      }
    }
    report.push({id, state, photos: assetCache.size})
  }
}
await mkdir(root + 'migration/reports', {recursive: true})
await writeFile(
  root + 'migration/reports/import.json',
  JSON.stringify(
    {mode: write ? 'write' : 'dry-run', documents: report, photos: assetCache.size},
    null,
    2,
  ) + '\n',
)
console.log(
  `${write ? 'Imported' : 'Validated'} ${report.length} documents; ${assetCache.size} unique photos.`,
)
