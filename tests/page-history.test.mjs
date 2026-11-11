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
const schema = (await readFile(new URL('../migrations/0001_admin.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0002_media.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0003_page_revisions.sql',import.meta.url),'utf8'));
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

function api(db,path,method='GET',data,origin='http://localhost') {return handleAdmin(new Request(`http://localhost/api/admin/pages/${path}`,{method,headers:{Origin:origin,'Content-Type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})}),{DB:db},'editor@example.invalid');}
test('all page types record publications atomically and restore privately with version conflict protection',async()=>{
 const {db,sqlite}=database();
 for(const slug of ['home','angel','abbey-road','faq','about']) {
  const initial=await (await api(db,slug)).json();
  let history=await (await api(db,slug+'/history')).json(); assert.equal(history.revisions.length,1);
  const content=structuredClone(initial.published);content.seoTitle='First publication '+slug;
  assert.equal((await api(db,slug,'PUT',{version:0,content})).status,200);
  assert.equal((await api(db,slug+'/publish','POST',{version:1})).status,200);
  history=await (await api(db,slug+'/history')).json();assert.equal(history.revisions.length,2);assert.equal(history.revisions[0].published_by,'editor@example.invalid');
  const snapshot=await (await api(db,slug+'/history/2')).json();assert.deepEqual(snapshot.content,content);
  assert.equal((await api(db,slug+'/history/0/restore','POST',{version:1})).status,409);
  assert.equal((await api(db,slug+'/history/0/restore','POST',{version:2},'https://bad.invalid')).status,403);
  const restored=await (await api(db,slug+'/history/0/restore','POST',{version:2})).json();assert.deepEqual(restored.draft,initial.published);assert.deepEqual(restored.published,content);
  assert.equal((await api(db,slug+'/history/999')).status,404);
  assert.equal((await api(db,slug+'/publish','POST',{version:3})).status,200);
  assert.equal((await (await api(db,slug+'/history')).json()).revisions.length,3);
 }
 sqlite.close();
});
test('retention keeps 50 versions and media in retained versions is protected from deletion',async()=>{
 const {db,sqlite}=database();
 const photo='00000000-0000-4000-8000-000000000000';
 sqlite.prepare('INSERT INTO media VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(photo,'Photo','Classroom',10,10,100,'beckett-house/'+photo,'test-cloud',1,'now','staff','ready');
 const initial=await (await api(db,'about')).json();const content=initial.published;
 content.images[0]={src:'/images/uploads/'+photo+'.webp',alt:'Classroom',width:10,height:10};
 await api(db,'about','PUT',{version:0,content});await api(db,'about/publish','POST',{version:1});
 const withoutPhoto=structuredClone(content);withoutPhoto.images[0]=withoutPhoto.images[1];
 await api(db,'about','PUT',{version:2,content:withoutPhoto});await api(db,'about/publish','POST',{version:3});
 const response=await handleMedia(new Request('http://localhost/api/admin/media/'+photo,{method:'DELETE',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:'{}'}),{DB:db,CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'key',CLOUDINARY_API_SECRET:'secret'},'staff');
 assert.equal(response.status,409);
 for(let version=4;version<104;version+=2){ await api(db,'about','PUT',{version,content:withoutPhoto});assert.equal((await api(db,'about/publish','POST',{version:version+1})).status,200); }
 const rows=(await (await api(db,'about/history')).json()).revisions;assert.equal(rows.length,50);assert.ok(rows.every(r=>r.version>2));
 sqlite.close();
});
test('migration captures existing live content without attributing the last draft editor as publisher',async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(await readFile(new URL('../migrations/0001_admin.sql',import.meta.url),'utf8'));
 sqlite.prepare('INSERT INTO settings VALUES(?,?,?,?)').run('page:about',JSON.stringify({version:9,published:{seoTitle:'Live content'},draft:{seoTitle:'Private'},publishedAt:'2026-11-01T12:00:00Z'}),'now','draft-editor');
 sqlite.exec(await readFile(new URL('../migrations/0003_page_revisions.sql',import.meta.url),'utf8'));
 const row=sqlite.prepare('SELECT * FROM page_revisions').get();assert.equal(row.published_by,null);assert.deepEqual(JSON.parse(row.content),{seoTitle:'Live content'});sqlite.close();
});
