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
const { handleAdmin } = await import('../worker/admin.ts');
const schema = await readFile(new URL('../migrations/0001_admin.sql', import.meta.url), 'utf8');
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  const db = {
    prepare(sql) {
      return { bind(...values) { return {
        first: async () => sqlite.prepare(sql).get(...values) ?? null,
        execute: () => ({ success: true, meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
      }; } };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = statements.map(s => s.execute()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}
function api(db, path = '/pages/angel', method = 'GET', data) {
  return handleAdmin(new Request(`http://localhost/api/admin${path}`, { method, headers: { Origin: 'http://localhost', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { DB: db }, 'editor@example.invalid');
}
const {defaultNurseryPages,validateNurseryPageContent} = await import('../lib/nursery-pages.ts');
const {getNurseryPageRecord,getPublishedNurseryPage,saveNurseryPageDraft,publishNurseryPageDraft} = await import('../lib/nursery-page-store.ts');
const changed = () => { const c=structuredClone(defaultNurseryPages.angel);c.hero.heading='New heading';return c; };
test('defaults validate, optional blanks survive and unsafe inputs fail',()=>{
 for(const c of Object.values(defaultNurseryPages)) assert.deepEqual(validateNurseryPageContent(c),c);
 for(const mutate of [c=>c.hero.slides=[],c=>c.hero.slides[0].src='/images/../bad.jpg',c=>c.hero.slides[0].width=0,c=>c.principles.pop(),c=>c.life.cards.pop(),c=>c.highlights.cards.pop(),c=>c.faqs.items=[],c=>c.testimonials=[],c=>c.hero.heading='<script>bad</script>',c=>c.hero.heading='javascript:alert(1)',c=>c.hero.heading='x'.repeat(501),c=>c.faqs.items=Array(21).fill(c.faqs.items[0]),c=>c.testimonials=Array(11).fill(c.testimonials[0]),c=>c.hero.slides=Array(9).fill(c.hero.slides[0])]) { const c=changed();mutate(c);assert.throws(()=>validateNurseryPageContent(c)); }
});
test('reads never mutate; draft and publication remain isolated by page',async()=>{
 const {db,sqlite}=database();
 for(const slug of ['angel','abbey-road']) assert.equal((await getNurseryPageRecord(db,slug)).version,0);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM settings').get().n,0);
 assert.deepEqual((await (await api(db,'/pages')).json()).map(p=>p.slug),['home','angel','abbey-road']);
 assert.equal((await api(db,'/pages/angel/publish','POST',{version:0})).status,400);
 const saved=await saveNurseryPageDraft(db,'angel',changed(),0,'editor');assert.equal(saved.version,1);
 assert.deepEqual(await getPublishedNurseryPage('angel',db),defaultNurseryPages.angel);
 await publishNurseryPageDraft(db,'angel',1,'editor');
 assert.deepEqual(await getPublishedNurseryPage('angel',db),changed());
 await saveNurseryPageDraft(db,'angel',defaultNurseryPages.angel,2,'editor');
 assert.deepEqual(await getPublishedNurseryPage('angel',db),changed());
 assert.deepEqual(await getPublishedNurseryPage('abbey-road',db),defaultNurseryPages['abbey-road']);
 assert.equal((await getNurseryPageRecord(db,'abbey-road')).version,0);
 assert.equal((await api(db,'/pages/angel','PUT',{version:1,content:changed()})).status,409);
 assert.equal((await api(db,'/pages/angel/publish','POST',{version:1})).status,409);
 sqlite.close();
});
test('simultaneous first saves, updates and publish produce one winner and audit entry',async()=>{
 const {db,sqlite}=database();
 for(const version of [0,1]) {
 const responses=await Promise.all([api(db,'/pages/angel','PUT',{version,content:changed()}),api(db,'/pages/angel','PUT',{version,content:defaultNurseryPages.angel})]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 }
 const responses=await Promise.all([api(db,'/pages/angel/publish','POST',{version:2}),api(db,'/pages/angel/publish','POST',{version:2})]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM activity').get().n,3);
 sqlite.close();
});
test('invalid input is rejected and unavailable or corrupt storage falls back only publicly',async()=>{
 const {db,sqlite}=database();
 for(const data of [null,{}, {version:-1,content:changed()},{version:'0',content:changed()},{version:0,content:{}}]) assert.equal((await api(db,'/pages/angel','PUT',data)).status,400);
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM settings').get().n,0);
 sqlite.prepare('INSERT INTO settings VALUES (?, ?, ?, ?)').run('page:angel','{}','now','editor');
 assert.equal((await api(db)).status,503);
 assert.deepEqual(await getPublishedNurseryPage('angel',db),defaultNurseryPages.angel);
 const broken={prepare(){throw new Error('Unavailable');}};
 assert.equal((await api(broken)).status,503);
 assert.deepEqual(await getPublishedNurseryPage('abbey-road',broken),defaultNurseryPages['abbey-road']);
 const fallback=await getPublishedNurseryPage('angel',broken);fallback.hero.heading='Mutated';assert.notEqual(defaultNurseryPages.angel.hero.heading,'Mutated');
 sqlite.close();
});
