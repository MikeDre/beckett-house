import type { Env } from "./index";
import { adminJson } from "./admin";
import { siteImages } from "../lib/media-library";

type Row = { id: string; name: string; alt: string; width: number; height: number; bytes: number; public_id: string; cloud_name: string; version: number; status: string };
class MediaError extends Error { constructor(message: string, public status = 400) { super(message); } }
const MAX_FILE = 5 * 1024 * 1024;
const pathFor = (id: string) => `/images/uploads/${id}.webp`;
function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[<>\u0000-\u001f\u007f]/.test(value)) throw new MediaError(`${label} must be plain text, up to ${max} characters.`);
  return value.trim();
}
async function bytes(request: Request, limit: number) {
  const reader = request.body?.getReader(); if (!reader) throw new MediaError("Choose a file to upload.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new MediaError("Choose an image no larger than 5 MB.", 413); } chunks.push(value); }
  const result = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; } return result;
}
export function imageSize(data: Uint8Array): { width: number; height: number; type: string } {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data.length >= 24 && [...data.slice(0,8)].join() === '137,80,78,71,13,10,26,10' && String.fromCharCode(...data.slice(12,16)) === 'IHDR') {
    for (let offset = 8; offset + 8 <= data.length;) {
      const length = view.getUint32(offset), kind = String.fromCharCode(...data.slice(offset+4,offset+8));
      if (kind === 'acTL') throw new MediaError("Choose a still JPEG, PNG or WebP image.");
      if (kind === 'IDAT' || offset + length + 12 > data.length) break;
      offset += length + 12;
    }
    return { width: view.getUint32(16), height: view.getUint32(20), type: 'image/png' };
  }
  if (data.length >= 12 && data[0] === 255 && data[1] === 216) {
    let i = 2;
    while (i + 9 < data.length) {
      if (data[i++] !== 255) break; while (data[i] === 255) i++;
      const marker = data[i++]; if (marker === 0xda || marker === 0xd9) break;
      if (marker === 1 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (i + 2 > data.length) break; const length = view.getUint16(i); if (length < 2 || i + length > data.length) break;
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker) && length >= 8) return { height: view.getUint16(i+3), width: view.getUint16(i+5), type: 'image/jpeg' };
      i += length;
    }
  }
  if (data.length >= 30 && String.fromCharCode(...data.slice(0,4)) === 'RIFF' && String.fromCharCode(...data.slice(8,12)) === 'WEBP') {
    const kind = String.fromCharCode(...data.slice(12,16));
    if (kind === 'VP8X' && !(data[20] & 2)) return { width: 1 + data[24] + (data[25]<<8) + (data[26]<<16), height: 1 + data[27] + (data[28]<<8) + (data[29]<<16), type: 'image/webp' };
    if (kind === 'VP8 ' && data[23] === 0x9d && data[24] === 1 && data[25] === 0x2a) return { width: view.getUint16(26,true)&0x3fff, height: view.getUint16(28,true)&0x3fff, type: 'image/webp' };
    if (kind === 'VP8L' && data[20] === 0x2f) { const bits = view.getUint32(21,true); return { width: (bits&0x3fff)+1, height: ((bits>>>14)&0x3fff)+1, type: 'image/webp' }; }
  }
  throw new MediaError("Choose a still JPEG, PNG or WebP image.");
}
async function cloudinary(env: Env, action: string, params: Record<string,string>, file?: Blob) {
  if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_API_KEY || !/^[a-z0-9_-]+$/.test(env.CLOUDINARY_CLOUD_NAME ?? '')) throw new MediaError("Image uploads are not configured yet.", 503);
  const signed = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + env.CLOUDINARY_API_SECRET;
  const signature = [...new Uint8Array(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(signed)))].map(byte => byte.toString(16).padStart(2,'0')).join('');
  const body = new FormData(); Object.entries(params).forEach(([key,value]) => body.set(key,value));
  body.set('api_key',env.CLOUDINARY_API_KEY); body.set('signature',signature); if (file) body.set('file',file,'photo');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/${action}`, { method:'POST', body, signal:AbortSignal.timeout(30000) });
  if (!response.ok) throw new MediaError("Cloudinary could not complete this request. Please try again.",502);
  return await response.json() as { public_id?: string; width?: number; height?: number; bytes?: number; version?: number; result?: string };
}
function references() { return "(EXISTS (SELECT 1 FROM settings s, json_tree(s.value) j WHERE j.type = 'text' AND j.value = '/images/uploads/' || media.id || '.webp') OR EXISTS (SELECT 1 FROM page_revisions r, json_tree(r.content) j WHERE j.type = 'text' AND j.value = '/images/uploads/' || media.id || '.webp'))"; }
export async function handleMedia(request: Request, env: Env, email: string) {
  try {
    const url = new URL(request.url), match = url.pathname.match(/^\/api\/admin\/media\/([a-f0-9-]{36})$/);
    if (request.method === 'GET' && url.pathname === '/api/admin/media') {
      const rows = (await env.DB.prepare(`SELECT *, ${references()} AS used FROM media WHERE status != 'deleted' ORDER BY created_at DESC LIMIT 250`).all<Row & {used:number}>()).results;
      return adminJson({ configured: Boolean(env.CLOUDINARY_API_SECRET && env.CLOUDINARY_API_KEY && env.CLOUDINARY_CLOUD_NAME), images: [...rows.filter(row=>row.status==='ready').map(row=>({ src:pathFor(row.id), id:row.id, name:row.name, alt:row.alt, width:row.width, height:row.height, used:Boolean(row.used), uploaded:true })), ...siteImages.map(image=>({...image,uploaded:false,used:true}))], pendingDeletes: rows.filter(row=>row.status==='deleting').map(row=>({id:row.id,name:row.name})) });
    }
    if (request.headers.get('Origin') !== url.origin) throw new MediaError("Origin must match this site.",403);
    if (request.method === 'POST' && url.pathname === '/api/admin/media') {
      if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data;')) throw new MediaError("Send an image upload.",415);
      if (!env.CLOUDINARY_API_SECRET) throw new MediaError("Image uploads are not configured yet.",503);
      const count = await env.DB.prepare("SELECT count(*) AS n FROM media WHERE status != 'deleted'").first<{n:number}>();
      if ((count?.n ?? 0) >= 250) throw new MediaError("The library is limited to 250 uploaded photos. Remove unused photos first.");
      const form = await new Response(await bytes(request,MAX_FILE+16384),{headers:{'Content-Type':request.headers.get('Content-Type')!}}).formData();
      const file = form.get('file'), name = text(form.get('name'),'Image name',150), alt = text(form.get('alt'),'Image description',500);
      if (!(file instanceof File) || !file.size || file.size > MAX_FILE || form.getAll('file').length !== 1) throw new MediaError("Choose one image no larger than 5 MB.");
      const size = imageSize(new Uint8Array(await file.arrayBuffer()));
      if (file.type !== size.type || !size.width || !size.height || size.width * size.height > 40000000 || size.width > 12000 || size.height > 12000) throw new MediaError("Choose a JPEG, PNG or WebP image up to 40 megapixels and 12,000 pixels per side.");
      const id = crypto.randomUUID(), publicId = `beckett-house/${id}`;
      const result = await cloudinary(env,'upload',{public_id:publicId,overwrite:'false',timestamp:String(Math.floor(Date.now()/1000)),format:'webp',transformation:'c_limit,w_2400,h_2400/q_auto,f_webp'},file);
      if (result.public_id !== publicId || !Number.isSafeInteger(result.width) || !Number.isSafeInteger(result.height) || !Number.isSafeInteger(result.version) || !result.bytes || result.width! < 1 || result.height! < 1 || result.width! > 2400 || result.height! > 2400 || result.version! < 1) throw new MediaError("Cloudinary returned an invalid image.",502);
      try {
        await env.DB.batch([
          env.DB.prepare("INSERT INTO media (id,name,alt,width,height,bytes,public_id,cloud_name,version,created_at,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id,name,alt,result.width!,result.height!,result.bytes,publicId,env.CLOUDINARY_CLOUD_NAME!,result.version!,new Date().toISOString(),email),
          env.DB.prepare("INSERT INTO activity (at,user,action,summary) VALUES (?,?,?,?)").bind(new Date().toISOString(),email,'upload',`Image uploaded: ${name}`),
        ]);
      } catch {
        await cloudinary(env,'destroy',{public_id:publicId,timestamp:String(Math.floor(Date.now()/1000)),invalidate:'true'}).catch(()=>{});
        throw new MediaError("Could not save the uploaded photo. Please try again.",503);
      }
      return adminJson({src:pathFor(id),id,name,alt,width:result.width,height:result.height,uploaded:true,used:false},201);
    }
    if (match && request.method === 'DELETE') {
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new MediaError("Send application/json.",415);
      const id = match[1], row = await env.DB.prepare("SELECT * FROM media WHERE id = ? AND status != 'deleted'").bind(id).first<Row>();
      if (!row) throw new MediaError("Image not found.",404);
      if (row.cloud_name !== env.CLOUDINARY_CLOUD_NAME) throw new MediaError("This image belongs to a different Cloudinary connection.",409);
      const claimed = await env.DB.prepare(`UPDATE media SET status = 'deleting' WHERE id = ? AND status IN ('ready','deleting') AND NOT ${references()}`).bind(id).run();
      if (claimed.meta.changes !== 1) throw new MediaError("This image is used in saved content, a draft or version history.",409);
      const result = await cloudinary(env,'destroy',{public_id:row.public_id,timestamp:String(Math.floor(Date.now()/1000)),invalidate:'true'});
      if (!['ok','not found'].includes(result.result ?? '')) throw new MediaError("Photo removal is pending. Please retry.",502);
      await env.DB.batch([env.DB.prepare("UPDATE media SET status = 'deleted' WHERE id = ?").bind(id),env.DB.prepare("INSERT INTO activity (at,user,action,summary) VALUES (?,?,?,?)").bind(new Date().toISOString(),email,'delete',`Image removed: ${row.name}`)]);
      return adminJson({ok:true});
    }
    return adminJson({error:'Route or method not found.'},404);
  } catch (error) {
    if (error instanceof MediaError) return adminJson({error:error.message},error.status);
    return adminJson({error:'Could not access the image library. Please try again.'},503);
  }
}
export async function serveUploadedImage(request: Request, env: Env, path: string, width = 2400) {
  if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
  const id = path.match(/^\/images\/uploads\/([a-f0-9-]{36})\.webp$/)?.[1];
  if (!id) return new Response('Not found',{status:404});
  try {
    const row = await env.DB.prepare("SELECT * FROM media WHERE id = ? AND status = 'ready'").bind(id).first<Row>();
    if (!row || !/^[a-z0-9_-]+$/.test(row.cloud_name) || row.public_id !== `beckett-house/${row.id}` || !Number.isSafeInteger(row.version)) return new Response('Not found',{status:404});
    const target = [640,1080,2400].find(size=>size>=width) ?? 2400;
    const response = await fetch(`https://res.cloudinary.com/${row.cloud_name}/image/upload/c_limit,w_${target}/f_webp,q_auto/v${row.version}/${row.public_id}.webp`,{method:request.method,signal:AbortSignal.timeout(15000)});
    if (!response.ok) return new Response('Image unavailable',{status:502});
    return new Response(response.body,{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
  } catch { return new Response('Image unavailable',{status:503}); }
}
