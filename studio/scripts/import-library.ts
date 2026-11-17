import {getCliClient} from 'sanity/cli'
import {readFile, readdir, writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const client = getCliClient({apiVersion: '2026-11-17'}).withConfig({
  projectId: 'lk8ts1r7',
  dataset: 'production',
  useCdn: false,
})
const uploaded = JSON.parse(
  await readFile(root + 'migration/extracted/media.json', 'utf8'),
).flatMap((row: {results: unknown[]}) => row.results) as {id: string; name: string; alt: string}[]
const files = (await readdir(root + 'public/images', {recursive: true}))
  .filter((path) => /\.(webp|jpe?g|png|avif)$/i.test(path))
  .map((path) => ({path: '/images/' + path, name: path.split('/').pop()!, alt: ''}))
const sources = [
  ...files,
  ...uploaded.map((image) => ({
    path: '/images/uploads/' + image.id + '.webp',
    name: image.name,
    alt: image.alt,
  })),
]
let created = 0,
  reused = 0
for (const source of sources) {
  let bytes: Buffer
  if (source.path.startsWith('/images/uploads/')) {
    const response = await fetch('https://www.beckett-house.co.uk' + source.path)
    if (!response.ok) throw new Error('Unavailable uploaded image')
    bytes = Buffer.from(await response.arrayBuffer())
  } else bytes = await readFile(root + 'public' + source.path)
  const hash = createHash('sha1').update(bytes).digest('hex')
  const exists = await client.fetch('count(*[_type=="sanity.imageAsset" && sha1hash==$hash])', {
    hash,
  })
  if (exists) {
    reused++
    continue
  }
  const asset = await client.assets.upload('image', bytes, {filename: source.name})
  await client
    .patch(asset._id)
    .setIfMissing({title: source.name, ...(source.alt ? {description: source.alt} : {})})
    .commit()
  created++
}
await writeFile(
  root + 'migration/reports/media.json',
  JSON.stringify(
    {sources: sources.length, uploadedLibraryPhotos: uploaded.length, created, reused},
    null,
    2,
  ) + '\n',
)
console.log(
  `Image library checked: ${sources.length} sources; ${created} assets imported, ${reused} reused.`,
)
