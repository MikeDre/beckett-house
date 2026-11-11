import assert from "node:assert/strict";
import test from "node:test";
import { register } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";

// Execute source modules without bundling server-only imports into client code.
register(`data:text/javascript,${encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  import ts from ${JSON.stringify(new URL('../node_modules/typescript/lib/typescript.js', import.meta.url).href)};
  export async function resolve(specifier, context, next) {
    if (specifier === 'server-only' || specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export const env = {};', shortCircuit: true };
    if (specifier.startsWith('.') && !/\\.[a-z]+$/.test(specifier)) return next(specifier + '.ts', context);
    return next(specifier, context);
  }
  export async function load(url, context, next) {
    if (url.endsWith('.ts')) return { format: 'module', shortCircuit: true, source: ts.transpileModule(await readFile(new URL(url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText };
    return next(url, context);
  }
`)}`, import.meta.url);

const {env}=await import('cloudflare:workers');
const {getHomepageRecord}=await import('../lib/homepage-store.ts');
const {getNurseryPageRecord}=await import('../lib/nursery-page-store.ts');
const {default:worker}=await import('../dist/server/index.js');
const emptyDb={prepare(){return{bind(){return{first:async()=>null};}};}};
async function render(path,db) {return worker.fetch(new Request('http://localhost'+path,{headers:{accept:'text/html'}}),{DB:db,ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}});}
test('map and both nursery homepages read published CMS content for each request',async()=>{
 const original=env.DB;
 try {for(const slug of ['home','angel','abbey-road']) {
  const record=slug==='home'?await getHomepageRecord(emptyDb):await getNurseryPageRecord(emptyDb,slug);record.version=1;record.draft=structuredClone(record.published);record.draft.seoTitle='Private SEO fixture '+slug;
  if(slug==='home')record.draft.heading='Private heading fixture '+slug;else record.draft.hero.heading='Private heading fixture '+slug;
  const db={prepare(){return{bind(key){return{first:async()=>key==='page:'+slug?{value:JSON.stringify(record)}:null};}};}};env.DB=db;
  let html=await (await render(record.path,db)).text();assert.ok(!html.includes('Private heading fixture '+slug));assert.ok(!html.includes('Private SEO fixture '+slug));
  record.published=structuredClone(record.draft);record.version=2;record.publishedAt='2026-11-11T12:00:00Z';
  html=await (await render(record.path,db)).text();assert.ok(html.includes('Private heading fixture '+slug),slug+' heading');assert.ok(html.includes('Private SEO fixture '+slug),slug+' metadata');
 }}finally{env.DB=original;}
});
