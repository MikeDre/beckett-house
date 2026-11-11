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
const { defaultAboutContent, validateAboutContent } = await import('../lib/about-content.ts');
const { getAboutRecord, getPublishedAboutContent, ABOUT_SETTING_KEY } = await import('../lib/about-store.ts');
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
function api(db, path = '/pages/about', method = 'GET', data) {
  return handleAdmin(new Request(`http://localhost/api/admin${path}`, { method, headers: { Origin: 'http://localhost', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { DB: db }, 'editor@example.invalid');
}

const changed = () => { const c=structuredClone(defaultAboutContent); c.texts.text1="Our nursery"; c.images[0]={src:"/images/uploads/00000000-0000-4000-8000-000000000000.webp",alt:"New classroom photo",width:1200,height:800}; return c; };
test('About validation checks all text fields and image paths and dimensions',()=>{
 assert.deepEqual(validateAboutContent(defaultAboutContent),defaultAboutContent);
 for(const value of [null,{}, {...changed(),texts:{}}, {...changed(),images:[]}]) assert.throws(()=>validateAboutContent(value));
 for(const mutate of [c=>c.texts.text1='<script>',c=>c.images[0].src='https://example.com/photo.webp',c=>c.images[0].src='/images/../bad.webp',c=>c.images[0].width=0,c=>c.images[0].alt='',c=>c.seoTitle='x'.repeat(201)]) {const c=changed();mutate(c);assert.throws(()=>validateAboutContent(c));}
});
test('About drafts remain private, publishing and stale-editor protection use the saved version',async()=>{
 const {db,sqlite}=database();
 assert.equal((await getAboutRecord(db)).path,'/beckett-house');
 assert.equal((await api(db,'/pages/about/publish','POST',{version:0})).status,400);
 const response=await api(db,'/pages/about','PUT',{version:0,content:changed()});
 assert.equal(response.status,200);
 assert.deepEqual(await getPublishedAboutContent(db),defaultAboutContent);
 assert.equal((await api(db,'/pages/about','PUT',{version:0,content:changed()})).status,409);
 assert.equal((await api(db,'/pages/about/publish','POST',{version:0})).status,409);
 assert.equal((await api(db,'/pages/about/publish','POST',{version:1})).status,200);
 assert.deepEqual(await getPublishedAboutContent(db),changed());
 assert.equal(sqlite.prepare('SELECT count(*) AS n FROM activity').get().n,2);
 const list=await (await api(db,'/pages')).json(); assert.equal(list.length,6); assert.ok(list.some(p=>p.slug==='about'));
 sqlite.close();
});
