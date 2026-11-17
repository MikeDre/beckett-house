import assert from 'node:assert/strict';
import test from 'node:test';
import {register} from 'node:module';
register(`data:text/javascript,${encodeURIComponent(`export function resolve(specifier,context,next){if(specifier==='cloudflare:workers')return {url:'data:text/javascript,export const env={};',shortCircuit:true};return next(specifier,context);}`)}`,import.meta.url);
const {default:worker}=await import('../dist/server/index.js');
const ctx={waitUntil(){},passThroughOnException(){}};
function request(path,bindings={},init={}) {return worker.fetch(new Request('http://localhost'+path,init),{SANITY_CONTENT_ENABLED:'true',ADMIN_DEV_EMAIL:'editor@example.invalid',ASSETS:{fetch:async()=>new Response(null,{status:404})},...bindings},ctx);}
test('cutover retires legacy content endpoints while preserving the authenticated inbox API',async()=>{
 for(const path of ['/pages','media','notifications','announcements','fees'].map(path=>'/api/admin/'+path.replace(/^\//,'')))assert.equal((await request(path)).status,410,path);
 const me=await request('/api/admin/me');assert.equal(me.status,200);assert.equal((await me.json()).email,'editor@example.invalid');
 const inbox=await request('/api/admin/submissions',{DB:{prepare(){return {bind(){return this},first:async()=>({total:0}),all:async()=>({results:[]})}}}});
 assert.equal(inbox.status,200);
 assert.equal((await request('/admin/preview/home')).status,302);
});
test('preview Worker rejects anonymous page access and disables operational routes',async()=>{
 const preview={SANITY_VISUAL_PREVIEW:'true',PREVIEW_SESSION_SECRET:'test-secret'};
 assert.equal((await request('/gallery',preview)).status,401);
 assert.equal((await request('/admin',preview)).status,404);
 assert.equal((await request('/api/forms/visit',preview,{method:'POST'})).status,404);
});
