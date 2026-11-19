/** Verify careers preview without logging secret URLs or submitting applications. */
import {getCliClient} from 'sanity/cli'
import {createPreviewSecret} from '@sanity/preview-url-secret/create-secret'
import {PREVIEW_URL,STUDIO_URL} from '../../lib/sanity/config'
import assert from 'node:assert/strict'
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
const id='sanity-preview-url-secret.careers-'+crypto.randomUUID()
try {
 const page=await client.getDocument('page-careers')
 for(const benefit of page?.benefits || []){assert(benefit._key);assert.equal(benefit._type,'item')}
 const {secret}=await createPreviewSecret(client,'careers-validation',STUDIO_URL,undefined,id)
 const url=new URL('/api/draft-mode/enable',PREVIEW_URL)
 url.searchParams.set('sanity-preview-secret',secret)
 url.searchParams.set('sanity-preview-pathname','/careers')
 url.searchParams.set('sanity-preview-perspective','drafts')
 const response=await fetch(url,{redirect:'manual'})
 assert.equal(response.status,307)
 const headers={Cookie:response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ')}
 for(const path of ['/careers','/careers/early-years-practitioner-angel','/careers/early-years-practitioner-angel/apply']){
  const result=await fetch(new URL(path,PREVIEW_URL),{headers})
  assert.equal(result.status,200,path)
  const html=await result.text()
  assert.match(html,/noindex/)
  assert.match(html,/Sample|sample/)
  if(!path.endsWith('/apply'))assert.match(html,/data-sanity/)
  const version=await fetch(new URL('/api/draft-mode/version?path='+encodeURIComponent(path),PREVIEW_URL),{headers})
  assert.equal(version.status,200)
  const {revision}=await version.json() as {revision:string}
  assert(JSON.parse(revision).some(([documentId]:string[])=>documentId==='page-careers'))
  assert(JSON.parse(revision).length>=6,'Revision must include shared content and all job documents')
  console.log(`Careers preview passed: ${path}`)
 }
} finally {await client.delete('drafts.'+id)}
