import {readFile} from 'node:fs/promises'
import {getCliClient} from 'sanity/cli'
import assert from 'node:assert/strict'
const schema=JSON.parse(await readFile(new URL('../schema.json',import.meta.url),'utf8'))
const galleries=schema.find((type:{name:string})=>type.name==='galleryPage').attributes.images.value.attributes
for(const nursery of ['angel','abbeyRoad'])assert.equal(galleries[nursery].value.of.attributes._type.value.value,'image','Studio must accept native image array members')
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
for(const document of await client.fetch('*[_id in ["page-gallery","drafts.page-gallery"]]')) {
 for(const nursery of ['angel','abbeyRoad']) {
  const photos=document.images?.[nursery] || []
  const types=[...new Set(photos.map((photo:{_type?:string})=>photo._type))]
  console.log(`${document._id}: ${nursery}, ${photos.length} photos, types ${types.join(', ')}`)
  for(const photo of photos){assert.equal(photo._type,'image','Gallery array members must use the native image type');assert(photo.asset?._ref,'Photo must reference an asset')}
 }
}
