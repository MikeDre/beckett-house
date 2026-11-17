/** Exercise the same secret exchange used by Presentation, without logging the secret URL. */
import {getCliClient} from 'sanity/cli'
import {createPreviewSecret} from '@sanity/preview-url-secret/create-secret'
import {PREVIEW_URL,STUDIO_URL} from '../../lib/sanity/config'
import assert from 'node:assert/strict'
const client=getCliClient({apiVersion:'2026-11-17'}).withConfig({projectId:'lk8ts1r7',dataset:'production',useCdn:false,perspective:'raw'})
const id='sanity-preview-url-secret.check-'+crypto.randomUUID()
try {
 const {secret}=await createPreviewSecret(client,'migration-validation',STUDIO_URL,undefined,id)
 const url=new URL('/api/draft-mode/enable',PREVIEW_URL)
 url.searchParams.set('sanity-preview-secret',secret)
 url.searchParams.set('sanity-preview-pathname','/visit')
 url.searchParams.set('sanity-preview-perspective','drafts')
 const response=await fetch(url,{redirect:'manual'})
 assert.equal(response.status,307,'Presentation secret exchange failed')
 const cookies=response.headers.getSetCookie()
 assert(cookies.some(value=>value.includes('HttpOnly') && value.includes('beckett-preview-session=')))
 const page=await fetch(new URL(response.headers.get('location')!,PREVIEW_URL),{headers:{Cookie:cookies.map(value=>value.split(';')[0]).join('; ')}})
 assert.equal(page.status,200)
 assert.match(page.headers.get('x-robots-tag') || '',/noindex/)
 console.log('Presentation entry passed: a real Sanity secret issues a secure session and opens the preview.')
} finally {await client.delete('drafts.'+id)}
