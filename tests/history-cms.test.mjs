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
const { defaultHistoryContent, validateHistoryContent } = await import('../lib/history-content.ts');
const { getHistoryRecord, getPublishedHistoryContent, HISTORY_SETTING_KEY } = await import('../lib/history-store.ts');
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
function api(db, path = '/pages/history', method = 'GET', data) {
  return handleAdmin(new Request(`http://localhost/api/admin${path}`, { method, headers: { Origin: 'http://localhost', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { DB: db }, 'editor@example.invalid');
}


test('History content validates text, library images and dimensions',()=>{
 assert.deepEqual(validateHistoryContent(defaultHistoryContent),defaultHistoryContent);
 for(const value of [null,{}, {...defaultHistoryContent,texts:{}}, {...defaultHistoryContent,image:null}])assert.throws(()=>validateHistoryContent(value));
 for(const mutate of [c=>c.texts.text1='<script>',c=>c.image.src='https://example.com/image.webp',c=>c.image.width=0,c=>c.image.alt='',c=>c.seoDescription='x'.repeat(501)]) {const c=structuredClone(defaultHistoryContent);mutate(c);assert.throws(()=>validateHistoryContent(c));}
});
test('History draft remains private and publishing rejects stale versions',async()=>{
 const {db,sqlite}=database();const content=structuredClone(defaultHistoryContent);content.texts.text1='Our story';
 assert.equal((await api(db,'/pages/history','PUT',{version:0,content})).status,200);
 assert.deepEqual(await getPublishedHistoryContent(db),defaultHistoryContent);
 assert.equal((await api(db,'/pages/history/publish','POST',{version:0})).status,409);
 assert.equal((await api(db,'/pages/history/publish','POST',{version:1})).status,200);
 assert.deepEqual(await getPublishedHistoryContent(db),content);assert.equal((await getHistoryRecord(db)).path,'/history');sqlite.close();
});
