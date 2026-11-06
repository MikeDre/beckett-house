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
const { handleMedia, imageSize, serveUploadedImage } = await import('../worker/media.ts');
const schema = (await readFile(new URL('../migrations/0001_admin.sql',import.meta.url),'utf8')) + (await readFile(new URL('../migrations/0002_media.sql',import.meta.url),'utf8'));
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
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l1sAAAAASUVORK5CYII=','base64');
function upload(file = new File([png],'photo.png',{type:'image/png'}), origin='http://localhost') {
  const body = new FormData();body.set('file',file);body.set('name','New nursery photo');body.set('alt','A sunny nursery room');
  return new Request('http://localhost/api/admin/media',{method:'POST',headers:{Origin:origin},body});
}
const envFor=db=>({DB:db,CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'dummy-key',CLOUDINARY_API_SECRET:'dummy-secret'});
test('image inspection rejects non-images, animations and excessive dimensions before cloud calls',async()=>{
  assert.deepEqual(imageSize(png),{width:1,height:1,type:'image/png'});
  for(const data of [Buffer.from('<svg/>'),Buffer.alloc(3),Buffer.from('<script>bad</script>')])assert.throws(()=>imageSize(data));
  const animated=Buffer.alloc(30);animated.write('RIFF');animated.write('WEBP',8);animated.write('VP8X',12);animated[20]=2;assert.throws(()=>imageSize(animated));
  const {db,sqlite}=database();const env=envFor(db);
  const original=globalThis.fetch;globalThis.fetch=()=>{throw new Error('must not fetch');};
  try{
    assert.equal((await handleMedia(upload(undefined,'https://untrusted.invalid'),env,'staff')).status,403);
    assert.equal((await handleMedia(upload(new File(['<svg/>'],'bad.png',{type:'image/png'})),env,'staff')).status,400);
    const huge=Buffer.from(png);huge.writeUInt32BE(15000,16);
    assert.equal((await handleMedia(upload(new File([huge],'huge.png',{type:'image/png'})),env,'staff')).status,400);
    assert.equal((await handleMedia(upload(new File([Buffer.alloc(5*1024*1024+1)],'big.png',{type:'image/png'})),env,'staff')).status,400);
    assert.equal((await handleMedia(new Request('http://localhost/api/admin/media',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'multipart/form-data; boundary=test'},body:Buffer.alloc(6*1024*1024)}),env,'staff')).status,413);
  }finally{globalThis.fetch=original;sqlite.close();}
});
test('authenticated upload metadata, protected references, responsive serving and removal remain consistent',async()=>{
  const {db,sqlite}=database(),env=envFor(db),original=globalThis.fetch;const calls=[];
  globalThis.fetch=async(url,init)=>{
    calls.push(String(url));
    if(String(url).endsWith('/upload')) {
      assert.equal(init.body.get('api_key'),'dummy-key');assert.match(init.body.get('signature'),/^[a-f0-9]{40}$/);
      assert.equal(init.body.get('overwrite'),'false');
      return Response.json({public_id:init.body.get('public_id'),width:1,height:1,bytes:png.length,version:123});
    }
    if(String(url).endsWith('/destroy'))return Response.json({result:'ok'});
    assert.match(String(url),/^https:\/\/res.cloudinary.com\/test-cloud\/image\/upload\/c_limit,w_640/);
    return new Response(png);
  };
  try {
    const response=await handleMedia(upload(),env,'staff@example.invalid');assert.equal(response.status,201);
    const photo=await response.json();assert.match(photo.src,/^\/images\/uploads\/[a-f0-9-]+\.webp$/);assert.equal(photo.alt,'A sunny nursery room');
    let list=await (await handleMedia(new Request('http://localhost/api/admin/media'),env,'staff')).json();
    assert.equal(list.images.find(image=>image.id===photo.id).used,false);assert.ok(list.images.length>50);
    sqlite.prepare('INSERT INTO settings VALUES(?,?,?,?)').run('page:test',JSON.stringify({draft:{image:photo.src}}),'now','staff');
    const remove=()=>handleMedia(new Request(`http://localhost/api/admin/media/${photo.id}`,{method:'DELETE',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:'{}'}),env,'staff');
    assert.equal((await remove()).status,409);assert.equal(calls.filter(url=>url.endsWith('/destroy')).length,0);
    const served=await serveUploadedImage(new Request(`http://localhost${photo.src}`),env,photo.src,500);assert.equal(served.status,200);assert.equal(served.headers.get('Content-Type'),'image/webp');
    sqlite.prepare('DELETE FROM settings WHERE key=?').run('page:test');assert.equal((await remove()).status,200);
    assert.equal((await serveUploadedImage(new Request(`http://localhost${photo.src}`),env,photo.src)).status,404);
    assert.throws(()=>sqlite.prepare('INSERT INTO settings VALUES(?,?,?,?)').run('page:test',JSON.stringify({image:photo.src}),'now','staff'),/uploaded image is unavailable/i);
    assert.deepEqual(sqlite.prepare('SELECT action FROM activity ORDER BY id').all().map(row=>row.action),['upload','delete']);
  }finally{globalThis.fetch=original;sqlite.close();}
});
test('retirement claims block concurrent content saves; failures remain retryable',async()=>{
  const {db,sqlite}=database(),env=envFor(db),original=globalThis.fetch;let fail=false;
  globalThis.fetch=async(url,init)=>{
    if(String(url).endsWith('/upload'))return Response.json({public_id:init.body.get('public_id'),width:1,height:1,bytes:10,version:1});
    if(fail)throw new Error('timeout');return Response.json({result:'not found'});
  };
  try{
    const photo=await (await handleMedia(upload(),env,'staff')).json();fail=true;
    const request=()=>new Request(`http://localhost/api/admin/media/${photo.id}`,{method:'DELETE',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:'{}'});
    assert.equal((await handleMedia(request(),env,'staff')).status,503);
    assert.equal(sqlite.prepare('SELECT status FROM media WHERE id=?').get(photo.id).status,'deleting');
    assert.throws(()=>sqlite.prepare('INSERT INTO settings VALUES(?,?,?,?)').run('page:test',JSON.stringify({published:{src:photo.src}}),'now','staff'),/uploaded image is unavailable/i);
    fail=false;assert.equal((await handleMedia(request(),env,'staff')).status,200);
  }finally{globalThis.fetch=original;sqlite.close();}
});
