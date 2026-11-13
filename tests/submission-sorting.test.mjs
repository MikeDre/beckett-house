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
const { handleMedia } = await import('../worker/media.ts');
const { handleAdmin } = await import('../worker/admin.ts');
const schema = (await readFile(new URL('../migrations/0001_admin.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0002_media.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0003_page_revisions.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0004_timetable_history.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0005_history_page.sql',import.meta.url),'utf8'));
function database() {
  const sqlite = new DatabaseSync(':memory:'); sqlite.exec(schema);
  function statement(sql, values = []) { return {
    bind: (...params) => statement(sql,params),
    first: async()=> sqlite.prepare(sql).get(...values) ?? null,
    all: async()=>({results:sqlite.prepare(sql).all(...values)}),
    run: async()=>({success:true,meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}),
    execute: ()=>({success:true,meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}}),
  }; }
  return {sqlite,db:{prepare:statement, async batch(statements) { sqlite.exec('BEGIN'); try { const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results; }catch(error){sqlite.exec('ROLLBACK');throw error;} }}};
}


function list(db,query='') {return handleAdmin(new Request('http://localhost/api/admin/submissions?'+query),{DB:db},'staff@example.invalid');}
test('submission sorting applies across pages, retains filters and rejects unknown sort values',async()=>{
 const {db,sqlite}=database();const insert=sqlite.prepare('INSERT INTO submissions(created_at,kind,nursery,name,email,fields) VALUES(?,?,?,?,?,?)');
 for(let i=0;i<60;i++)insert.run(new Date(Date.UTC(2026,10,1,0,i)).toISOString(),'visit',i%2?'angel':'abbey-road',i===59?'Aaron':i===0?'zebra':'Person '+String(i).padStart(2,'0'),'test@example.invalid','[]');
 let rows=await (await list(db)).json();assert.equal(rows[0].id,60);assert.equal(rows.length,50);
 rows=await (await list(db,'sort=oldest&offset=50')).json();assert.equal(rows[0].id,51);assert.equal(rows.length,10);
 rows=await (await list(db,'sort=name-asc&limit=2')).json();assert.equal(rows[0].name,'Aaron');
 rows=await (await list(db,'sort=name-desc&nursery=abbey-road')).json();assert.equal(rows[0].name,'zebra');assert.ok(rows.every(row=>row.nursery==='abbey-road'));
 assert.equal((await list(db,'sort=toString')).status,400);assert.equal((await list(db,'sort=name%3BDROP%20TABLE')).status,400);sqlite.close();
});
